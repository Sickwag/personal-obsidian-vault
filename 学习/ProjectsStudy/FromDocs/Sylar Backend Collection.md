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
  注意： 它返回的符号名是 C++ mangled name（`_Z5func1v`），不是人类可读的，demangle 函数负责转换，具体实现不用了解


### 字节序（Endianness）
@include/sylar/endian.h
#### 什么是字节序
同样的多字节整数在内存中的排列方式不同。x86/x86-64 使用**小端（LE）**，网络协议（TCP/IP）规定使用**大端（BE）**，因此网络编程中通常需要在两种格式间转换。

| 内存地址     | 小端 (LE) | 大端 (BE) |
| -------- | ------- | ------- |
| `addr+0` | 最低字节    | 最高字节    |
| `addr+3` | 最高字节    | 最低字节    |

例：`uint32_t x = 0x12345678` 在 LE 中存储为 `78 56 34 12`，在 BE 中为 `12 34 56 78`。
这就是为什么在网络编程中到处都需要字节序转换——sylar 的 address.cc 里所有 port 和 addr 设置都在调
byteswapOnLittleEndian：
```cpp
m_addr.sin_port = byteswapOnLittleEndian(port);     // 主机序 → 网络序
m_addr.sin_addr.s_addr = byteswapOnLittleEndian(address);
```
因为 sylar 运行在 x86-64（小端）上，但 sockaddr_in 中的字段需要网络字节序（大端），所以必须交换。如果将来 sylar 移植到大端机器上，byteswapOnLittleEndian 就什么都不做——这就是条件交换的设计意图。

#### `std::enable_if` + `sizeof(T)` 实现重载选择（SFINAE）
enable_if 的使用一般用于函数返回值:
```cpp
template <class T>
typename std::enable_if<std::is_integral<T>::value, T>::type
func(T t) { /* 只对整数类型生效 */ }
```
sylar 提供更巧妙的根据 `sizeof(T)` 得到不同的参数列表和返回值，三个 byteswap 重载共存（C++根据参数列表判断重载），根据 `sizeof(T)` 自动匹配：
- `sizeof(T) == 8` → 调用 `bswap_64`
- `sizeof(T) == 4` → 调用 `bswap_32`
- `sizeof(T) == 2` → 调用 `bswap_16`
不需要使用者知道 `bswap_16`/`bswap_32`/`bswap_64` 中的哪一个，模板自己推导。
```cpp
template <class T>
typename std::enable_if<sizeof(T) == sizeof(uint64_t), T>::type
byteswap(T value) {
    return (T)bswap_64((uint64_t)value);
}

template <class T>
typename std::enable_if<sizeof(T) == sizeof(uint32_t), T>::type
byteswap(T value) {
    return (T)bswap_32((uint32_t)value);
}

template <class T>
typename std::enable_if<sizeof(T) == sizeof(uint16_t), T>::type
byteswap(T value) {
    return (T)bswap_16((uint16_t)value);
}
```
每一个函数只处理一个大小类型，函数内部没有分支完全零开销，C++17 引入的 `if constexpr` 可以将上述代码进一步优化:
```cpp
template <class T>
T byteswap(T value) {
    if constexpr (sizeof(T) == sizeof(uint64_t))
        return (T)bswap_64((uint64_t)value);
    else if constexpr (sizeof(T) == sizeof(uint32_t))
        return (T)bswap_32((uint32_t)value);
    else if constexpr (sizeof(T) == sizeof(uint16_t))
        return (T)bswap_16((uint16_t)value);
}
```
`bswap_16/32/64` — glibc 的字节交换，来自 byteswap.h，开销为一条 CPU 指令，没有函数调用的极致性能
#### 编译期平台检测
```cpp
#if BYTE_ORDER == BIG_ENDIAN
// 大端分支
#else
// 小端分支（x86-64 走这里）
#endif
```
BYTE_ORDER、BIG_ENDIAN、LITTLE_ENDIAN 来自 <endian.h>（Linux 标准头文件）。这是在编译期决定的，因为编译器知道目标平台的字节序。

#### 条件交换 —— `byteswapOnLittleEndian`
不同平台上 `byteswapOnLittleEndian` 和 `byteswapOnBigEndian` 编译出不同的代码：需要交换的平台上执行 `bswap`，不需要的平台上直接 `return t`。使用者总是写 `byteswapOnLittleEndian(value)`，不管当前是什么平台。

#### 在项目中的实际使用
```cpp
// address.cc — 套接字地址用网络字节序（大端）
m_addr.sin_port = byteswapOnLittleEndian(port);

// ws_session.cc — WebSocket 帧头长度字段用大端
length = sylar::byteswapOnLittleEndian(len);

// bytearray.cc — 目标字节序与平台不一致时交换
if(m_endian != SYLAR_BYTE_ORDER) { value = byteswap(value); }
```

### 调用栈回溯
见上方「分支预测」中 SYLAR_ASSERT 宏的展开。实际调用链：`SYLAR_ASSERT` → `BacktraceToString` → `Backtrace` → `::backtrace()` + `backtrace_symbols()` + `demangle()`

### 其他工具函数

#### `vasprintf` 可变参数格式化
`vasprintf`（GNU 扩展）自动 `malloc` 足够大的 buffer 容纳格式化字符串，返回值是字符串长度。使用时配合 `va_list`、`va_start`、`va_end`。

#### UrlEncode 的优化技巧
- **懒分配（Lazy Allocation）**：只有在遇到需要编码的字符时才 `new string`，如果输入全部是不需要编码的字符，直接返回原字符串，零拷贝零分配
- **查表法代替分支**：用 256 字节 `static const char` 数组预计算每个字符的编码属性，避免多次 `isalpha` / `isdigit` / `== '-'` 判断

#### `kill(pid, 0)` 检测进程存活
信号 0 不发送任何信号，只做错误检查：
- 返回 0 → 进程存在
- 返回 ESRCH → 进程不存在
- `pid <= 1` 排除 PID 0 和 PID 1

#### Protobuf Reflection + X-Macro
通过 `Descriptor` 获取消息结构定义，`Reflection` 运行时读写字段值，配合 X-Macro 避免重复 case 块代码。一行 `XX(INT32, Int32, int32_t, Json::Int)` 展开为完整 switch case。

#### SpeedLimit 限速算法
基于已用流量动态计算等待时间，而非固定间隔。`m_curCount / m_countPerMS` 算出理论应耗毫秒数，与实际耗时比较后 `usleep` 差值，输出速率平滑。

### 线程 ID 获取：`gettid` vs `pthread_self`

- `syscall(SYS_gettid)`：返回内核级线程 ID（Linux 内核叫 PID）。在 Linux 中每个线程由 `clone()` 创建，独立分配 PID，可在 `/proc/[tid]/` 目录中查看
- `pthread_self()`：返回 POSIX 线程库的内部句柄，不透明类型（可能是 `unsigned long` 或结构体指针），不能传给内核 API

调试多线程问题时，`gdb` / `strace` 显示的是 `gettid()` 的值，不是 `pthread_self()` 的值。

### `localtime` vs `localtime_r`

标准 `localtime` 用 `static` 内部缓冲区：
```cpp
static struct tm __internal_buffer;  // 多线程共享！
struct tm* localtime(const time_t* t) {
    return &__internal_buffer;        // 多线程同时调用会覆盖
}
```
`localtime_r` 接受调用者提供的缓冲区：
```cpp
struct tm result;
localtime_r(&t, &result);  // 写入 result，线程安全
```
日志系统多线程输出时间戳时，必须使用 `_r` 版本（reentrant，可重入）。

### 时间获取：`gettimeofday` vs `std::chrono`

| | gettimeofday | system_clock | steady_clock |
|---|---|---|---|
| 精度 | 微秒 | 纳秒 | 纳秒 |
| 单调性 | ❌ 可能回跳(NTP) | ❌ 可能回跳 | ✅ 单调递增 |
| Epoch | 1970-01-01 | 1970-01-01 | 系统启动后某点 |
| 类型安全 | ❌ struct timeval | ✅ time_point | ✅ |
| 可移植性 | POSIX only | 全平台 | 全平台 |

原则：
- 人类可读时间 → `system_clock`
- 测量经过时间 → `steady_clock`（不回跳）

### `access()` 函数

`int access(const char* pathname, int mode)`：
- mode = `F_OK`(0)：检查路径是否存在（比 stat 轻量，不读元数据）
- mode = `R_OK`(4)：是否可读
- mode = `W_OK`(2)：是否可写
- mode = `X_OK`(1)：是否可执行

### ListAllFile 的 filesystem 重写

使用 `std::filesystem::recursive_directory_iterator` 替代 POSIX `opendir`/`readdir`/`closedir`。需注意：
1. 后缀过滤：`entry.path().extension() == subfix`
2. 异常安全：遇到权限不足的目录会抛异常，用 `directory_options::skip_permission_denied` 跳过
3. `generic_string()` 函数保持 POSIX 风格路径分隔符

### filesystem 权限管理
```cpp
fs::file_status status = fs::status(path);
auto perms = status.permissions();
// 检查
bool can_write = (perms & fs::perms::owner_write) != fs::perms::none;
// 修改
fs::permissions(path, fs::perms::owner_all | fs::perms::group_read,
                fs::perm_options::replace);
```
