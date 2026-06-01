---
created: 2026-06-01
resource_1: https://github.com/sylar-yin/sylar.git
---
# 基本组件
## 使用到的知识
### 单例模式
参考: [[设计模式#简单的单例实现]]
### 类构造函数/析构函数与访问修饰符 & 虚函数关键字 & 显式 delete 的关系
参考 [[C++ Runoob Tutoral#类构造函数]]
### 分支预测
@macro.h 中的宏定义
```cpp
#if defined __GNUC__ || defined __llvm__
/// LIKCLY 宏的封装, 告诉编译器优化,条件大概率成立
#	define SYLAR_LIKELY(x) __builtin_expect(!!(x), 1)
/// LIKCLY 宏的封装, 告诉编译器优化,条件大概率不成立
#	define SYLAR_UNLIKELY(x) __builtin_expect(!!(x), 0)
#else
#	define SYLAR_LIKELY(x) (x)
#	define SYLAR_UNLIKELY(x) (x)
#endif
```
- `__builtin_expect__` 是 GCC/Clang 的内建函数，用于告诉编译器哪个分支更可能被执行，让编译器优化指令流水线。**行为是编译期的**——它影响编译器生成的汇编指令布局，不能写成函数形式，因为函数调用本身会打断编译器对这个条件的流水线优化。宏是文本替换，零开销、零抽象
```cpp
// 如果写成函数版本
bool likely(bool x) {
    return __builtin_expect(x, 1);
}

if (likely(ptr != nullptr)) { process(ptr); } else { handle_error(); }
```
- `__builtin_expect` 的作用范围只限于 likely 函数内部——它告诉编译器 likely 函数里面的 `x == 1` 是预期情况。但 likely 内部只有一个 return，没有分支。真正需要优化的分支在调用点，编译器无法跳出 likely 函数看到。
```cpp
// 看起来能行，但不能保证
if (__builtin_expect(ptr != nullptr, 1)) { process(ptr); } else { handle_error(); }
```
- 使用内联优化代码会带来不稳定性
  - 内联由编译器实现决定，内联具体阈值不好确定
  - `-O0` 优化下禁止内联
  - 跨动态库边界和链接时优化（LTO）问题
- 两次取反 `!!` 操作把任何值归一化成 0 或 1，确保送入 `__builtin_expect` 的是规范布尔值
```cpp
long __builtin_expect(long exp, long c)  // c 可以是任意整数

if (SYLAR_UNLIKELY(x)) {
    // 编译器会把这里放到远离主线代码的地址
    // 主线代码的指令缓存更紧凑
}
```
- `!!` 转换细节：
  - C 语言中 `!` 返回 `int`（0/1），C++ 中返回 `bool`
  - `!` 是内置运算符，对任意标量类型（算术类型、指针、枚举）直接生效
  - 对自定义类类型，查找顺序：`T::operator!()` 重载 → `explicit operator bool()` → 编译错误
  - 但 macro.h 中 x 是一个**布尔表达式**（如 `ptr == nullptr`），结果已经是 `bool`

### 宏的使用方法
参考 [[C++ Runoob Tutoral#宏的使用方法]]
### 调用栈查询
@macro.h 中的调用栈:
```md
SYLAR_ASSERT(ptr == nullptr)
  ↓
BacktraceToString(100, 2, "    ")   ← 取 100 层栈，跳过最上面 2 层
  ↓
Backtrace(bt, size, skip)
  │
  ├── ::backtrace(array, size)        ← (1) 获取原始函数指针地址列表
  ├── backtrace_symbols(array, s)     ← (2) 把地址转成符号字符串
  └── demangle(strings[i])            ← (3) 把 C++ mangled 名字还原成可读名
```
#### ::backtrace(array, size) 
作用： 顺着当前线程的栈帧，从当前正在执行的函数开始往上回溯，把每个函数的返回地址（即调用下一个函数的那条指令的地址）存到 array 中。
```md
栈从高地址向低地址生长
高地址
  ┌──────────────┐
  │ main 的栈帧   │
  │ ...           │
  │ 返回地址 (call foo 的下一条指令)  │ ← 编译器记录
  ├──────────────┤
  │ foo 的栈帧    │
  │ ...           │
  │ 返回地址 (call bar 的下一条指令)  │ ← 编译器记录
  ├──────────────┤
  │ bar 的栈帧    │  ← rsp（栈顶寄存器）
  │ ...           │
  └──────────────┘
低地址

backtrace() 就是沿着 rbp
链表（帧指针链）从底部走到顶部，把每个"返回地址"摘出来放到数组中。返回的数组类似：
栈顶（最先打印的）：
	[skip=0] Backtrace()          ← 用户不关心
	[skip=1] BacktraceToString()  ← 用户不关心
	[skip=2] SYLAR_ASSERT 宏      ← 用户关心的（调用 ASSERT 的位置）
	[skip=3] my_function()        ← 用户关心的
	[skip=4] main()               ← 用户关心的
```
代码中 `::backtrace` 函数上有两层**函数调用**，需要查看的是**调用 assert()，即发生中断的位置**，宏不是函数，所以 array 中存储的
#### backtrace_symbols(array, s) — 地址 → 符号名
```cpp
char** strings = backtrace_symbols(array, s);
// strings[0..s-1] 中每个元素是类似：
// "./test_fiber(_Z5func1v+0x1d) [0x555555556abc]"
```
作用： 把 backtrace() 得到的裸地址数组，转换成人类可读的符号字符串。每个字符串包含三部分信息：
```cpp
./bin/test_fiber(_Z5func1v+0x1d) [0x555555556abc]
└──可执行文件名──┘└─mangled┘└偏移┘  └─────地址─────┘
```
  backtrace_symbols 内部做了这些事情：
  1. 打开 /proc/self/maps 找到地址属于哪个 ELF 文件（可执行文件或 .so）
  2. 解析该文件的 ELF 符号表（.symtab/.dynsym）
  3. 匹配地址对应的符号名和偏移量
  4. 格式化输出

  注意： 它返回的符号名是 C++ mangled name（_Z5func1v），不是人类可读的 func1()。这就是为什么下一步需要
  demangle。

  ---
  3. demangle(strings[i]) — mangled name → 人类可读名
  
  static std::string demangle(const char* str) {
      size_t  size   = 0;
      int     status = 0;
      std::string rt;
      rt.resize(256);
      if(1 == sscanf(str, "%*[^(]%*[^_]%255[^)+]", &rt[0])) {
          // 从字符串中提取出 mangled 名字部分
          char* v = abi::__cxa_demangle(&rt[0], nullptr, &size, &status);
          if(v) {
              std::string result(v);
              free(v);
              return result;
          }
      }
      if(1 == sscanf(str, "%255s", &rt[0])) {
          return rt;
      }
      return str;
  }

