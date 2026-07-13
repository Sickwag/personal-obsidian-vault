## 项目整体架构
libco 是腾讯开源的 C++ 非对称协程库，核心思路是在用户态手动控制执行流的切换，配合 epoll 事件循环 + Hook 系统调用，让同步写法的阻塞 I/O 代码自动获得异步非阻塞的执行效果。
```
┌──────────────────────────────────┐
│           用户代码层              │
│  co_create / co_resume / co_yield │
├──────────────────────────────────┤
│       co_routine.cpp             │
│  协程调度器 (stCoRoutineEnv_t)     │
│  事件循环 (co_eventloop)          │
│  超时管理 (stTimeout_t 时间轮)     │
├──────────────────────────────────┤
│    coctx.cpp + coctx_swap.S      │
│  上下文切换 (寄存器保存/恢复)      │
├──────────────────────────────────┤
│    co_hook_sys_call.cpp          │
│  系统调用拦截 (read/write/poll/…) │
├──────────────────────────────────┤
│     co_epoll.cpp                 │
│  epoll/kqueue 跨平台封装          │
└──────────────────────────────────┘
```
## 第 1 阶段：协程上下文切换
### 栈在内存中的生长方向
栈从高地址向低地址生长。`stack_pointer` 是分配的栈缓冲区起始地址（最低地址），`stack_size` 是缓冲区大小。
```
高地址  ┌──────────────────────┐  ← stack_pointer + stack_size (缓冲区末端)
        │                      │
        │   可用栈空间           │     sp 从这里开始，push 时地址减小
        │         ↓            │
        │                      │
低地址  └──────────────────────┘  ← stack_pointer (缓冲区起点)
```
`CoContextMake` 中的栈顶定位：`stack_pointer + stack_size` 到达缓冲区最高地址，减去 `sizeof(void*)`（8 字节）预留返回地址空间，sp 即为协程栈的初始栈顶。
```cpp
char* sp = ctx->stack_pointer + ctx->stack_size - sizeof(void*);
```
### 16 字节栈对齐
x86-64 System V ABI 要求 `call` 指令执行前 `%rsp` 必须对齐到 16 字节边界。SSE 指令 `movaps` 在非对齐地址上直接触发 SIGSEGV。libco 使用向下对齐（向低地址方向），安全且不会超出缓冲区：
```cpp
sp = (char*)((unsigned long)sp & -16LL);
```

| 对齐方向 | 代码 | 地址变化 | 安全性 |
|---------|------|---------|--------|
| 向上对齐 | `(val + 15) & -16LL` | 地址变大 | 可能超出缓冲区 |
| 向下对齐 | `val & -16LL` | 地址变小 | 安全，仅多浪费 ≤15 字节 |

补码原理：`-16LL` 即 `0xFFFFFFFFFFFFFFF0`，`&` 操作将低 4 位清零，效果等同于向下取整到最近的 16 倍数值。示例：`0x7fff12345ABC & 0xFFFFFFFFFFFFFFF0` = `0x7fff12345AB0`，末尾变 0，向下对齐到 16 字节边界。
### x86 vs x86-64 寄存器差异

| | x86 (32-bit) | x86-64 |
|---|---|---|
| 通用寄存器数量 | 8 | 16 |
| 寄存器名称 | EAX, EBX, ECX, EDX, ESI, EDI, EBP, ESP | RAX, RBX, RCX, RDX, RSI, RDI, RBP, RSP, R8-R15 |
| 寄存器宽度 | 32 位 | 64 位 |
| regs 数组大小 | `void*[8]` | `void*[14]` |

x86-64 存 14 个而非 16 个：RAX 是返回值寄存器，切出后旧值无人依赖；R10/R11 在 ABI 中为纯临时寄存器，不跨调用存活，同样无需保存。
### x86-64 通用寄存器全称与角色

| 缩写 | 全称 | ABI 分类 | 角色 |
|------|------|---------|------|
| RAX | **A**ccumulator | caller-saved | 通用寄存器 / 函数返回值 |
| RBX | **B**ase | callee-saved | 被调用者保存 |
| RCX | **C**ounter | caller-saved | 函数第 4 参数 / 循环计数器 |
| RDX | **D**ata | caller-saved | 函数第 3 参数 |
| RSI | **S**ource **I**ndex | caller-saved | 函数第 2 参数 |
| RDI | **D**estination **I**ndex | caller-saved | 函数第 1 参数 |
| RBP | **B**ase **P**ointer | callee-saved | 栈帧基址指针 |
| RSP | **S**tack **P**ointer | — | 栈顶指针 |
| RIP | **I**nstruction **P**ointer | — | 当前执行指令地址（不可直接访问） |
| R8-R9 | 序号命名 | caller-saved | 函数第 5-6 参数 |
| R10-R11 | 序号命名 | caller-saved | 纯临时寄存器（不保存） |
| R12-R15 | 序号命名 | callee-saved | 被调用者保存 |

- **caller-saved（调用者保存）**：函数调用前，caller 如果依赖这些寄存器的值，必须自己先保存。callee 可以随意修改。协程切换发生在函数体任意位置，没有 caller 来恢复，所以必须手动保存
- **callee-saved（被调用者保存）**：callee 如果用这些寄存器，必须在返回前恢复原值。函数调用天然保证恢复，协程切换则必须手动保存

> [!Info] 保存策略
> 协程切换保存了全部 callee-saved + 大部分 caller-saved（除 RAX/R10/R11 外），比普通函数调用保存得更多。
### x86-64 函数调用约定
参数传递规则（System V AMD64 ABI）：
```
第 1 个参数 → RDI
第 2 个参数 → RSI
第 3 个参数 → RDX
第 4 个参数 → RCX
第 5 个参数 → R8
第 6 个参数 → R9
第 7+ 个参数通过栈传递
返回值     → RAX
```
### regs 数组索引与汇编偏移的对应关系
x86-64 下 `CoContext.regs[14]` 的布局由 `coctx_swap.S` 手工编排，C++ 中的枚举值与汇编的偏移完全对应：
```
regs 索引 | 寄存器   | 汇编偏移    | 枚举常量
----------|---------|------------|----------
   0      | r15     | (%rdi)     | REG_R15 = 0
   1      | r14     | 8(%rdi)    | REG_R14 = 1
   2      | r13     | 16(%rdi)   | REG_R13 = 2
   3      | r12     | 24(%rdi)   | REG_R12 = 3
   4      | r9      | 32(%rdi)   | REG_R9  = 4
   5      | r8      | 40(%rdi)   | REG_R8  = 5
   6      | rbp     | 48(%rdi)   | REG_RBP = 5
   7      | rdi     | 56(%rdi)   | REG_RDI = 7, kRDI = 7
   8      | rsi     | 64(%rdi)   | REG_RSI = 8, kRSI = 8
   9      | ret addr| 72(%rdi)   | kRETAddr = 9
  10      | rdx     | 80(%rdi)   | REG_RDX = 10
  11      | rcx     | 88(%rdi)   | REG_RCX = 11
  12      | rbx     | 96(%rdi)   | REG_RBX = 2
  13      | rsp     | 104(%rdi)  | REG_RSP = 9, kRSP = 13
```
枚举值不连续是因为只给个别需要 C++ 代码直接访问的索引命名。每个枚举值的数字 = 汇编偏移 / 8（即数组下标）。**C++ 和汇编之间的槽位对应关系纯手工同步**，改 regs 顺序必须同时改汇编。
### CoContextFunction 类型
```cpp
using CoContextFunction = auto (*)(void*, void*) -> void*;
```
这是一个函数指针类型：指向接收两个 `void*` 参数、返回 `void*` 的函数。它是协程入口函数的类型别名。当协程上下文首次被加载执行时，CPU 通过 `ret` 跳转到这个函数地址。
### CoContextMake 详解（x86-64）
```cpp
int CoContextMake(CoContext* ctx, CoContextFunction pfn, const void* s, const void* s1) {
    char* sp = ctx->stack_pointer + ctx->stack_size - sizeof(void*);
    sp = (char*)((unsigned long)sp & -16LL);
    memset(ctx->regs, 0, sizeof(ctx->regs));
    void** ret_addr = (void**)(sp);
    *ret_addr = (void*)pfn;
    ctx->regs[kRSP] = sp;
    ctx->regs[kRETAddr] = (char*)pfn;
    ctx->regs[kRDI] = (char*)s;
    ctx->regs[kRSI] = (char*)s1;
    return 0;
}
```
逐行解析：
1. `sp = stack_pointer + stack_size - sizeof(void*)` — 定位到缓冲区末端下方 8 字节处
2. `sp = sp & -16LL` — 向下 16 字节对齐
3. `memset(ctx->regs, 0, ...)` — 清零寄存器数组
4. `*ret_addr = (void*)pfn` — 在栈顶写入函数指针，作为返回地址
5. `regs[kRSP] = sp` — 保存栈指针，coctx_swap 恢复后 RSP 指向这里
6. `regs[kRETAddr] = pfn` — 也存一份到 regs 数组（备用）
7. `regs[kRDI] = s` / `regs[kRSI] = s1` — 模拟函数调用的参数传递

> [!Info] 设计原理
> 当 coctx_swap 加载这个上下文后，RSP 指向栈顶的 pfn 地址，RDI/RSI 分别持有两个参数。接着 `ret` 从栈顶弹出 pfn 地址并跳转——CPU 以为自己在从函数返回，实际上跳进了协程入口函数，且参数已经就位。
```
CoContextMake 设置后的协程栈布局：

    ┌──────────────────┐  ← sp (RSP 将指向这里)
    │   pfn 函数地址     │  ← ret 会弹出并跳转到此
    └──────────────────┘
    ┌──────────────────┐
    │   未使用的剩余栈    │  ← push/call 会向低地址方向消耗
    │        ↓          │
    │                   │
    └──────────────────┘  ← stack_pointer (栈缓冲区起点)
```
### CoContextSwap 汇编逐行分析
完整代码来自 `coctx_swap.S`（x86-64 部分），调用约定：`rdi = 当前上下文（保存目标）`，`rsi = 目标上下文（加载来源）`。
**阶段一：保存当前寄存器到 rdi**
```asm
leaq (%rsp), %rax          # rax = 当前 RSP（不能用 movq %rsp, mem，x86-64 不允许）
movq %rax, 104(%rdi)       # regs[13] = 当前栈指针
movq %rbx, 96(%rdi)        # regs[12] = RBX
movq %rcx, 88(%rdi)        # regs[11] = RCX
movq %rdx, 80(%rdi)        # regs[10] = RDX
movq 0(%rax), %rax         # rax = 栈顶的返回地址（即 coctx_swap 的返回地址）
movq %rax, 72(%rdi)        # regs[9]  = 返回地址
movq %rsi, 64(%rdi)        # regs[8]  = RSI
movq %rdi, 56(%rdi)        # regs[7]  = RDI（保存 rdi 本身）
movq %rbp, 48(%rdi)        # regs[6]  = RBP
movq %r8, 40(%rdi)         # regs[5]  = R8
movq %r9, 32(%rdi)         # regs[4]  = R9
movq %r12, 24(%rdi)        # regs[3]  = R12
movq %r13, 16(%rdi)        # regs[2]  = R13
movq %r14, 8(%rdi)         # regs[1]  = R14
movq %r15, (%rdi)          # regs[0]  = R15
xorq %rax, %rax            # rax = 0（切出方返回值为 0）
```
保存 RSP 时必须通过 RAX 中转，因为 x86-64 不允许 `movq %rsp, mem` 这样的指令形式。`movq 0(%rax), %rax` 巧取栈顶的返回地址——切出方（caller）是 `call coctx_swap`，栈顶存放的就是调用者的下一条指令地址。
**阶段二：从 rsi 恢复目标寄存器**
```asm
movq 48(%rsi), %rbp        # 恢复 RBP
movq 104(%rsi), %rsp       # 恢复 RSP ← 这里完成"换栈"
movq (%rsi), %r15          # 恢复 R15
movq 8(%rsi), %r14
movq 16(%rsi), %r13
movq 24(%rsi), %r12
movq 32(%rsi), %r9
movq 40(%rsi), %r8
movq 56(%rsi), %rdi        # 恢复 RDI
movq 80(%rsi), %rdx
movq 88(%rsi), %rcx
movq 96(%rsi), %rbx
```
注意加载顺序：**RSP 最先加载**（仅次于 RBP），此后当前栈已经是目标协程的栈了。加载 RSP 后，所有后续的栈操作都在目标协程的栈上进行。
**阶段三：调整栈并跳转**
```asm
leaq 8(%rsp), %rsp         # RSP += 8（模拟弹出操作）
pushq 72(%rsi)             # 将目标返回地址压入新栈
movq 64(%rsi), %rsi        # 恢复 RSI（必须在 push 之后，push 用了 rsi 的值）
ret                        # 弹出返回地址并跳转
```
这三条指令的逻辑：`ret` = `popq %rip`，需要返回地址在栈顶。但 RSI 的恢复值在 `regs[8]`（偏移 64），不能提前恢复 RSI 否则 `72(%rsi)` 表达式失效。所以：
1. `leaq 8(%rsp), %rsp` — 假装从栈上弹出 8 字节，腾出空间
2. `pushq 72(%rsi)` — 把目标返回地址压入（此时 rsi 仍指向目标上下文结构体）
3. `movq 64(%rsi), %rsi` — 最后恢复 RSI
4. `ret` — 弹出栈顶返回地址，跳转到目标协程继续执行
```
第一次切换（目标上下文由 CoContextMake 设置）：
    ret → 跳转到协程入口函数 pfn(s, s1)

后续切换（目标上下文由 coctx_swap 保存的）：
    ret → 回到对端 coctx_swap 的调用点下一行
```
### coctx_swap 的对称性
coctx_swap 是一段对称的汇编：保存当前上下文到第一个参数指向的结构体，从第二个参数指向的结构体恢复上下文并跳转。调用方看到的语义是：
```cpp
coctx_swap(&from, &to);
// 当 from 再次被切回时，从这里继续执行
// 返回值：切出时为 0，通过其他路径切回时也是 0
```
整个切换过程在汇编层面完成，C++ 层面无法直接实现（无法用 C 代码修改 RSP 并跳转），必须手写汇编。
