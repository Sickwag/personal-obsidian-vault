---
created: 2026-06-01
resource_1: https://github.com/sylar-yin/sylar.git
---
# 基本组件
## 包含文件

| 文件                                     | 核心知识点                                        |
| -------------------------------------- | -------------------------------------------- |
| `include/sylar/noncopyable.h`          | `=delete`, `=default`, 禁止拷贝惯用法               |
| `include/sylar/singleton.h`            | 模板单例, Tag 参数区分实例, 函数局部 static                |
| `include/sylar/macro.h`                | `__builtin_expect`, `#x` 字符串化, `__VA_ARGS__` |
| `include/sylar/endian.h`               | 字节序, 大小端转换                                   |
| `include/sylar/util.h` + `src/util.cc` | backtrace, demangle, 文件系统操作, `typeid`        |
| `include/sylar/noncopyable.h`          | RAII 基类                                      |

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
Linux 中线程和进程在内核看来是同一个东西
- `pthread_self()`：返回 POSIX 线程库的内部句柄，不透明类型（可能是 `unsigned long` 或结构体指针），不能传给内核 API
- `syscall(SYS_gettid)`：返回内核级线程 ID（Linux 内核叫 PID）。在 Linux 中每个线程由 `clone()` 创建并独立分配 PID，可在 `/proc/[tid]/` 目录中查看
TGID 是进程 ID，线程组内所有线程共享）。也就是说：
```md
进程（主线程）： 	PID = TGID = 12345
子线程：         PID = 12346, TGID = 12345
子线程：         PID = 12347, TGID = 12345
```
pthread_self 的值在不同线程之间唯一，但你不能把它传给任何内核 API。而 gettid 的值在`/proc/[tid]/status`、top -H、gdb info threads 中看到，也可以用 kill 发送信号。
调试多线程问题时，`gdb` / `strace` 显示的是 `gettid()` 的值，不是 `pthread_self()` 的值。
### 进程存活检测
PID 文件（.pid 文件） 是 Unix 服务器程序的常见做法：启动时将自身 PID 写入一个文件（如 /var/run/nginx.pid），后续通过该文件检查进程是否还在运行
标准流程：
1. 检查 PID 文件是否存在 — 不存在说明进程从未启动
2. 读取 PID — 一般是纯文本的第一行
3. `kill(pid, 0)`— 信号 0 不发送任何信号，只做错误检查：进程存在则返回 0，不存在则返回 -1（ESRCH）
代码中
```cpp
bool FSUtil::IsRunningPidfile(const std::string& pidfile) {
	if(__lstat(pidfile.c_str()) != 0) {  // 文件不存在
		return false;
	}
	std::ifstream ifs(pidfile);
	std::string	  line;
	if(!ifs || !std::getline(ifs, line)) { // 文件第一行不是pid号->文件不规范
		return false;
	}
	if(line.empty()) {
		return false;
	}
	pid_t pid = atoi(line.c_str()); // 不规范的pid号
	if(pid <= 1) { // 排除 PID 0（idle 进程）和 PID 1（init）
		return false;
	}
	if(kill(pid, 0) != 0) { // 使用kill命令测试是否存在
		return false;
	}
	return true;
}
```
### `localtime` vs `localtime_r`
标准 `localtime` 用 `static` 内部缓冲区：
```cpp
static struct tm __internal_buffer;  // 仅仅只是一个静态结构体，多线程共享！
struct tm* localtime(const time_t* t) {
    return &__internal_buffer;        // 多线程同时调用会覆盖
}
```
`localtime_r` 接受调用者提供的缓冲区，**调用者的缓冲区一般是临时变量且如果没有跨线程的情况下**，这就是线程安全的。sylar 是多线程服务器框架，可能在任意线程中调用日志模块输出带时间戳的日志。如果用
  localtime，日志系统本身线程安全的但时间格式化却不安全。`_r`  后缀（reentrant，可重入版本）是 C 标准库线程安全化的标配命名约定（strtok_r、gmtime_r、readdir_r 等）。

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
```cpp
uint64_t GetCurrentMS() {
    return std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()
    ).count();
}

uint64_t GetCurrentUS() {
    return std::chrono::duration_cast<std::chrono::microseconds>(
        std::chrono::steady_clock::now().time_since_epoch()
    ).count();
}
```
原则：
- 人类可读时间 → `system_clock`
- 测量经过时间 → `steady_clock`（不回跳）
- 高精度短时测量：high_resolution_clock（通常是 steady_clock 的别名）

### 文件 IO
#### C-style APIs
`<dirent.h>` 用于目录操作，`<stdio.h>` 用于文件流操作。
`int access(const char* pathname, int mode)`：
- mode = `F_OK`(0)：检查路径是否存在（比 stat 轻量，不读元数据）
- mode = `R_OK`(4)：是否可读
- mode = `W_OK`(2)：是否可写
- mode = `X_OK`(1)：是否可执行
如果使用 `struct stat st`，那么文件信息（`st.st_mode`，`st.st_size`）还会写入结构体中，但是这里只单纯检查文件权限并不需要，性能也更好
filesystem 权限管理
- 返回 0: 表示测试成功。
- 返回 -1: 表示测试失败，同时会设置 errno 以指示错误原因。

`int mkdir(const char *__path, mode_t __mode) noexcept(true)`
创建文件夹，mode_t 参数是文件夹权限，是一个无符号整数，可以通过 `|` 叠加权限
- 用户权限（文件所有者）
	- `S_IRUSR` (0400) - 用户读权限
	- `S_IWUSR` (0200) - 用户写权限
	- `S_IXUSR` (0100) - 用户执行权限
	- `S_IRWXU` (0700) - 用户所有权限（读+写+执行）
- 组权限（文件所属组）
	- `S_IRGRP` (0040) - 组读权限
	- `S_IWGRP` (0020) - 组写权限
	- `S_IXGRP` (0010) - 组执行权限
	- `S_IRWXG` (0070) - 组所有权限
- 其他用户权限（其他用户）
	- `S_IROTH` (0004) - 其他用户读权限
	- `S_IWOTH` (0002) - 其他用户写权限
	- `S_IXOTH` (0001) - 其他用户执行权限
	- `S_IRWXO` (0007) - 其他用户所有权限
传入的 path 字符串包含 `\0`，创建目录是回截断

`DIR*` 是指向目录流（directory stream）的指针类型。它实际上是一个指向 `struct __dirstream` 的不透明指针，用户不应该直接访问其内部结构。
- 作为 `opendir()` 函数的返回值
- 作为`readdir()`和`closedir()`函数的参数
- 表示一个打开的目录，类似于文件流的概念

`typedef struct _iobuf FILE; `
`FILE*` 是指向文件流的指针类型，用于普通文件操作
- 作为 `fopen()` 函数的返回值
- 作为各种文件操作函数（`fprintf`、`fscanf`、`fgets`、`fputs`等）的参数
- 表示一个打开的文件流

`struct dirent` 是存储目录中单个条目信息的结构体
```cpp
struct dirent {
    long d_ino;                    /* 索引节点号 */
    off_t d_off;                   /* 在目录文件中的偏移 */
    unsigned short d_reclen;       /* 文件名长度 */
    unsigned char d_type;          /* 文件类型 */
    char d_name[NAME_MAX+1];       /* 文件名（null-terminated）最长 255 字符 */
};
```
- `d_ino`: inode 号，标识文件的唯一性
- `d_off`: 在目录文件中的偏移量
- `d_reclen`: 目录条目长度
- `d_type`: 文件类型（如 `DT_REG` 普通文件、`DT_DIR` 目录、`DT_LNK` 符号链接）
- `d_name`: 文件名，**以空字符结尾**

`DIR *opendir(const char *dirname);`
`opendir()` 函数用于打开指定目录，返回一个 `DIR*` 指针，权限不足、目录不存在、路径不是目录等情况失败返回 `NULL`

`struct dirent *readdir(DIR *dirp);`
`readdir()` 函数从打开的目录流中读取下一个目录条目
- `dirp`: 由 `opendir()` 返回的 `DIR*` 指针
- 返回值：指向`struct dirent`的指针，包含下一个目录条目的信息
- 当到达目录末尾或出错时返回 `NULL`

`closedir(DIR* dirp)` 函数关闭已打开的目录流，释放相关资源
#### 使用 filesystem 接管文件 IO
原实现:
```cpp
void FSUtil::ListAllFile(std::vector<std::string>& files,
						 const std::string&		   path,
						 const std::string&		   subfix) {
	if(access(path.c_str(), 0) != 0) {
		return;
	}
	DIR* dir = opendir(path.c_str());
	if(dir == nullptr) {
		return;
	}
	struct dirent* dp = nullptr;
	while((dp = readdir(dir)) != nullptr) {
		if(dp->d_type == DT_DIR) {
			if(!strcmp(dp->d_name, ".") || !strcmp(dp->d_name, "..")) {
				continue;
			}
			ListAllFile(files, path + "/" + dp->d_name, subfix);
		} else if(dp->d_type == DT_REG) {
			std::string filename(dp->d_name);
			if(subfix.empty()) {
				files.push_back(path + "/" + filename);
			} else {
				if(filename.size() < subfix.size()) {
					continue;
				}
				if(filename.substr(filename.length() - subfix.size()) == subfix) {
					files.push_back(path + "/" + filename);
				}
			}
		}
	}
	closedir(dir);
}
```
- 遍历文件，使用[[#文件 IO#C-style APIs]] 实现，看懂 API 就能看懂逻辑
- 如 DT_REG 普通文件、DT_DIR 目录、DT_LNK 符号链接
```cpp
// 创建文件，如果文件已经存在则返回lstat的提示信息并将文件信息放入出参st中
static int __lstat(const char* file, struct stat* st = nullptr) {
	struct stat lst;
	int			ret = lstat(file, &lst);
	if(st) {
		*st = lst;
	}
	return ret;
}

static int __mkdir(const char* dirname) {
	if(access(dirname, F_OK) == 0) {
		return 0;
	}
	return mkdir(dirname, S_IRWXU | S_IRWXG | S_IROTH | S_IXOTH);
}

// 要创建 /tmp/a/b/c/d
// 找到第一个 '/'："/tmp\0a/b/c/d" → mkdir("/tmp")  已存在→成功
// 恢复 '/'："/tmp/a\0b/c/d"    → mkdir("/tmp/a") 创建
// 继续找下一个 '/'："/tmp/a/b\0c/d" → mkdir("/tmp/a/b") 创建
// 找下一个 '/'："/tmp/a/b/c\0d"  → mkdir("/tmp/a/b/c") 创建
// 再找 → ptr = NULL，跳出 for
// 第2轮：ptr == NULL → 执行 __mkdir(path) → mkdir("/tmp/a/b/c/d") 创建整个路径

bool FSUtil::Mkdir(const std::string& dirname) {
	if(__lstat(dirname.c_str()) == 0) {
		return true;
	}
	char* path = strdup(dirname.c_str());	// 下面使用了截断操作，所以这里复制字符串
	char* ptr  = strchr(path + 1, '/');		// 从第二个字符开始找 '/', strchr寻找字符
	do {
		for(; ptr; *ptr = '/', ptr = strchr(ptr + 1, '/')) { // *ptr = ‘/’赋值操作
			*ptr = '\0';
			if(__mkdir(path) != 0) { // mkdir函数通过`\0`识别并截断在对应位置
				break;
			}
		}
		if(ptr != nullptr) { // 再也找不到‘/’了
			break;
		} else if(__mkdir(path) != 0) { // 所有上层目录已创建完但最后一级d文件夹创建失败
			break;
		}
		free(path);
		return true;
	} while(0);
	free(path);
	return false;
}
```
- 比较精妙的是创建嵌套目录，类似 `mkdir -p` 的实现
- 核心思路是原地修改 strdup 出来的字符串——用 \0 截断各级路径，逐级创建。用 strchr 环扫描/重置 / 来推进。这是 C 风格的高效做法，避免了大量字符串拼接。
`std::filesystem` 没有直接像 ` access()` 那样检查权限的静态函数，但还是可以做到的
```cpp
fs::file_status status = fs::status(path);
auto perms = status.permissions();
// 转为8禁止，chmod信息
std::cout << std::oct << static_cast<int>(perm);
// 检查
bool can_write = (perms & fs::perms::owner_write) != fs::perms::none;
bool owner_can_write = (perm & fs::perms::owner_write) != fs::perms::none;
bool others_can_read = (perm & fs::perms::others_read) != fs::perms::none;

// 修改
fs::permissions(path, fs::perms::owner_all | fs::perms::group_read,
                fs::perm_options::replace);
```
### static 关键字理解
- [[C++ Runoob Tutoral#inline 和 static 的配合|和 inline 关键字的配合]]
- [[C++ Runoob Tutoral#static 语义|新的语义]] 
- 命名空间中的 static 和inline [[C++ Runoob Tutoral#匿名命名空间中 static 符号]] + [[C++ Runoob Tutoral#非匿名命名空间中的 static 符号]]
- [[C++开发范式和术语#ODR（One Definition Rule）|ODR 原则]]
可以看到获取 ipv4 地址的操作需要遍历系统所有的网络接口并筛选出 ipv4 类型地址，开销不第，而 ipv4 通信地址一般不变，所以使用 static 暂存结果，方便以后读取
同理，通过 abi 获取人类可读函数/变量类型名也需要 static，并用模板类型复用
```cpp
template <class T>
const char* typeToName() {
	static const char* s_name = abi::__cxa_demangle(typeid(T).name(), nullptr, nullptr, nullptr);
	return s_name;
}
```
### 字符处理
#### 格式化
两个 format 函数可以用更现代方法处理
```cpp
// should use "{}" instead of "%"
template <typename... Args>
inline std::string StringUtil::format(char const* fmt, Args const&... args) {
	return std::format(fmt, args);
}
```
#### 字符串和基本类型转换
在 C++17 之前，C++ 标准库缺乏一个简单、统一且健壮的“字符串 <-> 基本类型”转换工具。通常有以下选择:

| 方法                          | 缺点                                                                                                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **C 风格转换** (`atoi`, `atof`) | - `atoi` 失败时返回 0，无法区分“实际就是 0”和“转换失败”。  <br>- 不支持字符串到布尔值、十六进制等复杂转换。  <br>- 不检查溢出。                                                                                                                    |
| **`stringstream`**          | - 代码冗长。  <br>- 性能稍差（需要构造临时流对象）。  <br>- 不够优雅。                                                                                                                                                        |
| **`stoi`, `stod`** (C++11)  | - 只支持字符串转数字，不支持数字转字符串。  <br>- 抛出 `std::invalid_argument` 或 `std::out_of_range`，需要捕获特定异常。  <br>- 不支持用户自定义类型。                                                                                         |
| **`boost::lexical_cast`**   | **优点**：  <br>1. **简洁**：`boost::lexical_cast<int>(str)`。  <br>2. **通用**：支持基本类型，甚至支持支持 `>>`/`<<` 的自定义类型。  <br>3. **异常安全**：转换失败时抛出 `boost::bad_lexical_cast` 异常，调用者可以明确捕获。  <br>4. **健壮性**：能检测溢出和无效字符。 |
C++17 以后提供了
- 标准库 `<string>`，`stoi` / `stod` 函数，不过需要捕获 `std::invalid_argument` 或 `std::out_of_range`，这回在出错时查找异常表，有运行时开销
- `std::from_chars` 和 `std::to_chars`，基于字符串的指针操作，不分配内存，不抛出异常，出现转换失败不改变传入的传入值内容，允许禁止转换，性能最高
- `std::format` 提供字符串格式化语法，极其快速的转换
#### 宽字符
什么是宽字符？
```cpp
char     c = 'A';     // 1 字节，能表示 256 个不同的值
wchar_t wc = L'中';   // 在 Linux 上是 4 字节（UTF-32），在 Windows 上是 2 字节（UTF-16）
```
ASCII 字符 1 字节就够了（char），但中文字符、日文、emoji 等，Unicode 字符需要更多字节。C++ 提供了两种处理文本的方式：

| 类型 | 编码单元 | Linux | Windows |
| :--- | :--- | :--- | :--- |
| char / string | 多字节 (UTF-8) | ✅ 默认 | 默认 ANSI 代码页 |
| wchar_t / wstring | 宽字符 (固定宽度) | UTF-32 (4B) | UTF-16 (2B) |
在 C++ 的标准库中，某些操作天然需要固定宽度的字符：
- `std::iswdigit()`、`std::iswalpha()` — 宽字符分类函数
- `std::wcout`、`std::wcin` — 宽字符控制台 IO
- 直接访问第 N 个字符：英文字符串 "hello" 的 `s[2] = 'l'`，中文字符串 "你好世界" 的 `s[2] ` 如果用 UTF-8 会取到多字节编码的中间字节（乱码），如果用 wstring 则每个字符固定宽度，可以安全索引
现代 C++ 实践中，统一使用 UTF-8（char/string）是推荐做法（C++20 的 `char8_t / u8string`）。wstring主要是为了：
1. 与 Windows API 交互（Windows 用 UTF-16）
2. 与旧代码中使用 wchar_t 的库交互 
3. 需要固定宽度字符索引的算法
#### 流（Stream）抽象
流是一个**字节序列的生产者/消费者**，不关心数据来自哪里、去往哪里。不管底层是文件、socket、内存缓冲区还是管道，对使用者来说都是同一个 `istream` / `ostream` 接口。

```cpp
// 文件流
std::ifstream file("data.bin");
ReadFromStream(file, value);

// 内存字符串流
std::istringstream ss(data);
ReadFromStream(ss, value);

// 网络流（sylar 的 SocketStream）
auto ss = std::make_shared<SocketStream>(sock);
ReadFromStream(*ss, value);
```
sylar 把函数参数设计成 `std::istream&`，可以接受 file、string、socket 任何一个的流对象，同一个函数处理所有情况。
##### 文本模式 vs 二进制模式
计算机中的数据都是二进制的。区分打开模式不是在改存储方式，而是**告诉库函数怎么解读和转换这些字节**。
**Linux（包括 sylar 项目）：**
```cpp
std::ifstream f1("a.txt", std::ios::binary);   // 二进制模式
std::ifstream f2("a.txt", std::ios::in);        // 文本模式（默认）
// Linux 上完全一样，没有任何区别
```
Linux 上的换行符就是 `\n`（0x0A），文本模式和二进制模式行为一致。
**Windows：**
```cpp
// 文本模式：读文件时 \r\n（0x0D 0x0A）→ 自动转换为 \n（0x0A）
//            写文件时 \n → 自动转换为 \r\n
std::ifstream f1("a.txt");                     // 文本模式，自动转换换行符

// 二进制模式：不做任何转换
std::ifstream f2("a.txt", std::ios::binary);   // 逐字节原样读取
```
Windows 上以文本模式读二进制文件会破坏数据（`0x0D 0x0A` → `0x0A`）。
**在 Windows 上读 100 字节的区别：**

| 文件内容 | 文本模式读 100 字节 | 二进制模式读 100 字节 |
|---------|-------------------|-------------------|
| 数据中有 `0x0D 0x0A` | 读到 99 字节（`\r` 被吞掉） | 读到 100 字节 |
| 数据中有 `0x1A`（Ctrl-Z） | **提前终止**（DOS 时代的文件结尾标记） | 读到 100 字节 |

##### 为什么需要 "精确读取"？ReadFixFromStream 做了什么
```cpp
inline bool ReadFixFromStream(std::istream& is, char* data, const uint64_t& size) {
    uint64_t pos = 0;
    while(is && (pos < size)) {
        is.read(data + pos, size - pos);  // 尝试读取剩余字节
        pos += is.gcount();               // 实际读到的字节数
    }
    return pos == size;
}
```
**`istream::read` 不保证一次读完指定数量的字节**，可能发生部分读取后函数返回
- **网络流（socket）**：数据还没完全到达，只读到当前可读的部分
- **文件流被信号中断**：`read` 系统调用返回 `EINTR`，只读了部分数据
- **管道流**：写端还没写完
`gcount()` 返回上次 `read` 实际读取的字节数。循环累加 `pos` 直到 `pos == size` 或流出错。
ReadFromStream 的两个重载分别用来读取单个 POD 类型和连续容器（`vector`），这里只重载了 `vector` 一种类型，并且
```cpp
template <class T>
bool ReadFromStream(std::istream& is, T& v) {
    return ReadFixFromStream(is, (char*)&v, sizeof(v));
}
```
这里 `T` 必须是 POD 类型（没有虚函数、没有自定义构造/析构），二进制直接拷贝安全。
```cpp
template <class T>
bool ReadFromStream(std::istream& is, std::vector<T>& v) {
    return ReadFixFromStream(is, (char*)&v[0], sizeof(T) * v.size());
}

std::vector<float> vertices(1024);   // 先分配好空间
ReadFromStream(file_stream, vertices); // 直接读出 1024 * 4 字节
```
`vector` 不是 POD（它有内部指针指向堆内存），直接覆盖会损坏 vector 的内部结构。所以特别为 `vector` 写了一个重载，读取的是 `v[0]` 开始的连续元素存储区。**前提：`v` 必须已经 resize 到合适的大小。**
配套的 `WriteToStream`（写入侧没有"部分写入"的问题，`ostream::write` 要么全写入要么失
**为什么需要二进制序列化？**
- **紧凑**：没有冗余的分隔符、标签名
- **快速**：不需要解析/格式化
- **定长**：`sizeof(T)` 直接告诉你需要读多少字节
**缺陷：**
- 不可读（二进制文件人看不懂）
- 不跨平台（字节序、`sizeof` 在不同平台上可能不同）
- 结构体对齐（padding）可能导致文件不兼容
#### iostream 继承体系
能绑定到 `std::istream&` / `std::ostream&` 的类型包括 `ifstream`（文件）、`istringstream`（string 内存）、`cin/cout`（标准 IO）等。所有流类型继承自 `std::istream` / `std::ostream`，所以 `ReadFixFromStream` 可以接受其中任何一个。

### C++20 约束 POD / 连续容器
```cpp
template <typename T>
concept Pod = std::is_trivially_copyable_v<T> && std::is_standard_layout_v<T>;

template <typename T>
concept ContiguousContainer = requires(T& t) {
    { t.data() } -> std::convertible_to<const std::remove_reference_t<decltype(t[0])>*>;
    { t.size() } -> std::convertible_to<std::size_t>;
};

template <Pod T>
bool ReadFromStream(std::istream& is, T& v) {
    return ReadFixFromStream(is, (char*)&v, sizeof(v));
}

template <ContiguousContainer T>
bool ReadFromStream(std::istream& is, T& v) {
    using Elem = std::remove_reference_t<decltype(*v.data())>;
    static_assert(std::is_trivially_copyable_v<Elem>, "element type must be trivially copyable");
    return ReadFixFromStream(is, (char*)v.data(), sizeof(Elem) * v.size());
}
```
如果用 `std::span`（C++20）可以统一为一个接口。

### IO 限速器
#### 解决什么问题
从文件流中读取或写入大量数据时，如果不加控制，会瞬间占用全部磁盘 IO 带宽，影响同一台机器上的其他进程。`SpeedLimit` 确保读写速度不超过设定的上限（字节/秒）。

#### 算法原理
设定限速值 `speed`（字节/秒），换算为每毫秒允许的字节数 `m_countPerMS = speed / 1000.0`。每次写入后调用 `add(v)`：
```cpp
void SpeedLimit::add(uint32_t v) {
    m_curCount += v;                            // 累加这一秒的总发送量
    int usedms  = curms % 1000;                 // 这一秒已经过去多少毫秒
    int limitms = m_curCount / m_countPerMS;    // 按当前速度理论应花多少毫秒
    if(usedms < limitms) {                      // 实际用时 < 理论应花时间 → 太快
        usleep(1000 * (limitms - usedms));      // 睡到理论应花时间
    }
}
```
核心逻辑：当前秒内已发送 `m_curCount` 字节，按限速值计算这些字节应该占用 `m_curCount / m_countPerMS` 毫秒。如果实际用时比这个值短，说明快了，sleep 补齐。
进入新的一秒时重置计数器（`m_curSec` 更新，`m_curCount = v`），跨秒时重新计数。
#### 实际使用（ReadFixFromStreamWithSpeed）
```cpp
SpeedLimit::ptr limit;
if(dynamic_cast<std::ifstream*>(&is)) {          // 只有文件流需要限速
    limit.reset(new SpeedLimit(speed));
}
while(is && (offset < size)) {
    uint64_t s = std::min(size - offset, per);    // 每次最多读 per 字节
    is.read(data + offset, s);
    offset += is.gcount();
    if(limit) { limit->add(is.gcount()); }        // 检查速度，超速则 sleep
}
```
### Protobuf 反射序列化
#### 概念映射
| .proto 中的概念 | C++ 反射 API | 作用 |
|---------------|-------------|------|
| 整个消息 `Person` | `Descriptor` | 消息的结构——有哪些字段、各叫什么名字 |
| 每个字段 `name` / `age` | `FieldDescriptor` | 单个字段——名字、类型、编号、是否 repeated |
| 字段的值（实际数据） | `Reflection` | 在运行时读取/写入指定字段的值 |

**关键区分：** `Descriptor` 是"说明书"（描述这个类型有什么字段），`Reflection` 是"机械手"（从具体对象中取值），`FieldDescriptor` 是"目录条目"（描述单个字段）。

#### serialize_message 函数详解

```cpp
static void serialize_message(const google::protobuf::Message& message, Json::Value& jnode) {
    const Descriptor* descriptor = message.GetDescriptor();     // 获取消息的结构定义
    const Reflection* reflection = message.GetReflection();     // 获取反射读写接口

    for(int i = 0; i < descriptor->field_count(); ++i) {            // 遍历所有字段
        const FieldDescriptor* field = descriptor->field(i);

        // 跳过空字段（未设置的 optional、空 repeated），避免json中有过多空字段
        if(field->is_repeated()) {
            if(!reflection->FieldSize(message, field)) { continue; }
        } else {
            if(!reflection->HasField(message, field)) { continue; }
        }
```
1. `GetDescriptor()` ——知道有哪些字段、各叫什么名字
2. `GetReflection()` ——从具体对象中读写字段值
3. 遍历每个字段，通过 `reflection->GetInt32/GetString/GetEnum` 等读取值，写入 `jnode`

**三种字段类型的处理：**

| 字段类型 | 处理方式 | JSON 结果 |
|---------|---------|----------|
| 普通字段（INT32/STRING 等） | X-Macro 展开，`GetInt32`/`GetString` 等 | `"name": "Alice"` |
| repeated 字段 | 循环多次调用 `GetRepeatedInt32`/`GetRepeatedString` 等 | `"tags": ["engineer", "manager"]` |
| 嵌套 Message | 递归调用 `serialize_message` | `"addr": {"city": "Beijing"}` |
由于 Jsoncpp 库的 api 设计，如果添加数组需要使用 append，同时获取 protobuf 的 repeated 字段也和获取 singluar 字段的 api 不同，所以放在了**if 分支中，并使用两个类似的宏实现**
```cpp
// repeated
jnode[std::string(field->name())].append((jsontype)reflection->GetRepeated##method(message, field, n));
// singluar
jnode[std::string(field->name())] = (jsontype)reflection->Get##method(message, field);
```
#### serialize_unknowfieldset 函数详解
Protobuf **前向兼容**的特性——新版本 `.proto` 增加的字段，旧版本不认识，但解析时不丢弃，存入 `UnknownFieldSet`。这个函数把未知字段保留到 JSON 中，避免数据丢失。
```cpp
static void serialize_unknowfieldset(const UnknownFieldSet& ufs, Json::Value& jnode) {
    std::map<int, std::vector<Json::Value>> kvs;   // field number → 值列表（可能有多个同名）

    for(int i = 0; i < ufs.field_count(); ++i) {
        const auto& uf = ufs.field(i);
        switch((int)uf.type()) {
			// 特定类型...
        case UnknownField::TYPE_LENGTH_DELIMITED: {
            std::string v(uf.length_delimited());
            UnknownFieldSet tmp;
            if(!v.empty() && tmp.ParseFromString(v)) {
                // 嵌套的 UnknownFieldSet（可能是一个未知的消息类型），递归处理
                Json::Value vv;
                serialize_unknowfieldset(tmp, vv);
                kvs[uf.number()].push_back(vv);
            } else {
                kvs[uf.number()].push_back(v);   // 普通字符串
            }
            break;
        }
        }
    }

    // 输出：同编号多值 → JSON 数组，单值 → JSON 属性， 同样也应为JsonCpp的api设计需要使用if分支
    for(auto& i : kvs) {
        if(i.second.size() > 1) {
            for(auto& n : i.second) { jnode[std::to_string(i.first)].append(n); }
        } else {
            jnode[std::to_string(i.first)] = i.second[0];
        }
    }
}
```
#### protobuf API 设计
```cpp
const google::protobuf::Descriptor* descriptor = message.GetDescriptor();
const google::protobuf::Reflection* reflection = message.GetReflection();
reflection->FieldSize(message, field);
reflection->GetRepeatedEnum(message, field, n)->number());
```
可以看到 descriptor 和 reflection 都来自于 message 对象，真实数据查询时却还需要传入 message 参数，descriptor 和 reflection**并没有绑定到 `google::protobuf::Message` 对象上**。
```cpp
// 假设我们有两个 protobuf 消息
message User {
  optional string name = 1;
  optional int32 age = 2;
  repeated string tags = 3;
}

message Product {
  optional string title = 1;
  optional float price = 2;
  repeated string categories = 3;
}

// google/protobuf/message.h (简化)
class Message {
public:
    virtual const Descriptor* GetDescriptor() const = 0;
    virtual const Reflection* GetReflection() const = 0;
    // ...
};

// 生成的代码（protoc 生成），Product同理
class User : public  google::protobuf::Message {
private:
    static const ::google::protobuf::Descriptor* descriptor_;      // 静态
    static const ::google::protobuf::Reflection* reflection_;      // 静态
    
public:
    const ::google::protobuf::Descriptor* GetDescriptor() const override {
        return descriptor_;  // 返回静态成员
    }
    
    const ::google::protobuf::Reflection* GetReflection() const override {
        return reflection_;  // 返回静态成员
    }
};
```
而他们的父类（`google::protobuf::Message`）中有 `GetDescriptor/GetReflection` 等**纯虚函数**，子类继承之后通过子类 override 的虚函数返回 descriptor 和 reflection，子类重载中的不同实现导致了只有相同子类返回的 descriptor 和 reflection 是一样并且共享的（在一个进程中只有一份）。
- 每种类型而不是每个实例化的对象使用一份 descriptor 和 reflection 不用在每个对象中都用**不同的虚表指针指向不同的虚表**，占用内存很低
- 先查询子类的虚表->父类的->返回静态变量，**避免对象成员访问开销**
- 这样做的代价是虽然速度很快，但**完全不在编译期检查类型**安全，他假设传入的 message 参数就是对应类型的对象，如果 `reflection->FieldSize(notFromMessage, field);` 传入不是来自 reflection 对象对应类型的类的 Message 对象，field 可能在其中并不存在但被固定的逻辑用来计算偏移量，引起UB，数组越界访问等等问题
- 使用 `dynamic_cast` 或 `typeid` 是有运行时开销的（走 vtable 查 RTTI），Protobuf 都跳过，直接 `reinterpret_cast`
#### X-Macro 的不可替代性
参考[[C++ Runoob Tutoral#宏的使用方法|宏的使用方法]]
**问题本质：** Reflection API 的函数名是类型相关的（`GetInt32`、`GetString`、`GetEnum` 是不同函数），X-Macro 用 `##` 把类型名粘接到函数名上。
**为什么模板不能替代：** 把字符串拼起来调用对应名字的函数，反射特性出来之前。`Get##method` 是宏 `##` 独有的能力。
**替代方案对比：**

| 方案 | 类型安全 | 零开销 | 代码量 | 复杂度 |
|------|---------|--------|-------|--------|
| X-Macro | ❌ | ✅ | 少（6行XX） | 低 |
| 类型特质+折叠表达式(C++17) | ✅ | ✅ | 多（每个类型一个特化） | 高 |
| 函数指针表 | ❌ | ❌ | 中 | 中 |
| 代码生成（Python脚本） | ✅ | ✅ | 少 | 需外部工具 |

当 API 设计本身就依赖函数名规则来区分类型时，X-Macro 仍然是最佳选择，这里宏对比模板带来的高维护难度，代码膨胀和编译时间增长已经是最佳方法

### dynamic_cast 开销分析与 concepts 替代的陷阱
#### 问题的起源
原版 `ReadFixFromStreamWithSpeed` 中用 `dynamic_cast<std::ifstream*>(&is)` 判断是否为文件流——因为只有文件流需要限速（内存流/网络流不限速）：
```cpp
SpeedLimit::ptr limit;
if(dynamic_cast<std::ifstream*>(&is)) {   // 仅在文件流上创建限速器
    limit.reset(new SpeedLimit(speed));
}
while(is && (offset < size)) {
    uint64_t s = std::min(size - offset, per);
    is.read(data + offset, s);
    offset += is.gcount();
    if(limit) { limit->add(is.gcount()); }  // 非文件流时 limit 为空，不做限速
}
```
#### dynamic_cast 的实际开销
`dynamic_cast` 走 vtable 查询 RTTI（运行时类型信息）。对简单的单继承链（如 `std::ifstream → std::istream`），编译器实现大致为：
1. 从对象的 vptr 取出 vtable 指针
2. 从 vtable 的固定偏移读取类型信息结构体
3. 在类型继承树中匹配目标类型
4. 匹配成功则返回调整后的指针，失败返回 nullptr
整个过程约 **10-20 条指令**，在纳秒级别。而磁盘 IO 操作在**毫秒级别**（高出 6 个数量级）。所以在这个场景中，`dynamic_cast` 的开销完全可以忽略。
#### reinterpret_cast 的实现方式
与 `dynamic_cast` 不同，Protobuf 的反射 API 直接用 `reinterpret_cast` 按偏移量读取内存，不做任何类型校验：

```cpp
// Reflection 内部实现：
int Reflection::FieldSize(const Message& m, const FieldDescriptor* field) const {
    // 直接按偏移量计算地址，假设传入的就是正确的类型
    const uint8_t* base = reinterpret_cast<const uint8_t*>(&m);
    auto* repeated = reinterpret_cast<const RepeatedField<T>*>(
        base + field->offset());
    return repeated->size();
}
```
传错类型的 Message 给 Reflection——编译时报错？不会。运行时抛异常？不会。直接读取到和目标类型无关的内存，导致**越界访问或段错误**。Protobuf 完全放弃运行时类型检查来换取极致性能，类型安全全靠调用者自己保证。

| 方案 | 类型安全 | 运行时开销 | 本质 |
|------|---------|-----------|------|
| `reinterpret_cast`（Protobuf） | ❌ | 零 | 假设正确类型，直接按偏移量读 |
| `dynamic_cast` | ✅ | 10-20 条指令 | 走 vtable 查 RTTI |
| `typeid` | ✅ | 很小 | 也是走 vtable |

#### Concepts 替代方案的错误尝试
我尝试用 C++20 Concepts 消除 `dynamic_cast`，写了以下代码：
```cpp
template <typename T>
concept IStream = std::derived_from<T, std::ifstream>;

template <typename T>
concept OStream = std::derived_from<T, std::ofstream>;

template <IStream IStreamtype>
bool readFixFromStreamWithSpeed(IStreamtype& is, char* data,
                                 uint64_t const& size, uint64_t const& speed) {
    SpeedLimit::ptr limit;
    limit.reset(new SpeedLimit(speed));  // 无条件创建限速器
    // ... 读数据 + 限速
}
```
- 原版参数类型是 `std::istream&`，可以传入 `std::ifstream`、`std::istringstream`、`std::cin`、甚至自定义的实现了 `istream` 接口的类型。Concepts 约束 `std::derived_from<T, std::ifstream>` 后，只能接受 `std::ifstream`——`istringstream` 编译报错，`SocketStream` 编译报错。函数的功能范围被缩小了。
- 原版只在文件流上做限速判断（`dynamic_cast` 失败时 `limit` 为空，不限速）。新版对所有流都无条件创建限速器——`istringstream` 也被限速，但操作内存根本不需要限速。
所以保持原版原样即可，或提供两个重载：
```cpp
// 重载 1：不限速版本（所有流）
bool readFixFromStream(std::istream& is, char* data, uint64_t size);

// 重载 2：限速版本（仅文件流，通过重载而非 dynamic_cast）
bool readFixFromStreamWithSpeed(std::ifstream& is, char* data,
                                 uint64_t size, uint64_t speed);
```
通过编译期模板实现的话也还是要在调用时明确自己需要速度/不需要速度，意义不大。
显式实例化几种基本的能够转换为 `fstream` 类型的模板特化覆盖果情景太小，如果有新的类型能够转化还是得靠编译器隐式实例化，意义不大。并且引入模板实例化带来的编译器时间延长

## 薄封装工具
### 加密工具
@crypto_util.h
```cpp
static int32_t Crypto(const EVP_CIPHER* cipher,
					  bool				enc,
					  const void*		key,
					  const void*		iv,
					  const void*		in,
					  int32_t			in_len,
					  void*				out,
					  int32_t*			out_len);
```
这个函数是"统一加密接口"。不管你用 AES-128 还是 AES-256，ECB 还是 CBC，加密还是解密，API调用流程一样，区别只在于传入的 cipher 参数控制具体的加密算法，CryptoUtil 中其他函数**只是一层"省得你查 OpenSSL 文档看 `EVP_aes_*` 名字怎么写"的薄封装**
### Json 工具
`CharReaderBuilder/StreamWriterBuilder` 是JsonCpp 的新版 API，通过 builder 模式配置解析/序列化行为（如缩进、转义等）。封装相当于给了一个"默认配置"的标准用法
- NeedEscape 用于检查字符串中是否有需要转义的特殊字符
- Escape 用于把特殊字符替换成转义序列
实际上两者多余，JsonCpp 的 StreamWriterBuilder 在序列化时已经自动处理了特殊字符的转义
所有的 `GetXXX` 函数只做一层简单的类型检查和默认值封装，

### 哈希函数工具
- `murmur3_hash / murmur3_hash64`：非加密哈希（快，不防碰撞）
- `quick_hash`：最简单的字符串哈希（Java String.hashCode 算法）
- `sha0sum / sha1sum / md5sum`：加密哈希返回原始二进制（blob）
- `md5 / sha1`：加密哈希返回十六进制字符串（hex）
- `hmac_md5 / hmac_sha1 / hmac_sha256`：带密钥的哈希（HMAC 构造）
- `base64encode / base64decode`：不是哈希！是二进制→文本编码

#### 非加密哈希 vs 加密哈希对比

| 维度 | 非加密哈希（murmur3） | 加密哈希（MD5/SHA） |
| :--- | :--- | :--- |
| **速度** | 极快（~10GB/s） | 慢几百倍 |
| **安全性** | ❌ 可以轻易构造碰撞 | ✅ 无法（计算上）逆向或碰撞 |
| **用途** | 哈希表、分片、Bloom filter | 文件完整性、密码存储、数字签名 |
| **典型场景** | `std::unordered_map` 的 hash 函数 | git 校验文件、md5sum 命令 |
- 非加密哈希
	- murmur3_hash
		*   输入任意数据，输出均匀分布的 32/64 位整数。不是加密。
		*   **特性**：一个比特的输入变化 → 大约一半输出比特翻转（avalanche 效应）；比 MD5 快一个数量级。
		*   **用途**：用于哈希表计算桶索引、数据分片决定数据去哪个节点。
	- quick_hash
		*   最简单的字符串哈希算法：`h = 31 * h + str[i]`。
		*   Java 的 `String.hashCode()` 和 Python 早期版本都用这个。
		*   性能不差，但碰撞率高，只适合小规模的简单场景。
- 加密哈希
	*   MD5（128 位b输出）：
	    *   输出 16 字节（`MD5_DIGEST_LENGTH = 16`）。
	    *   快，但已被破解（2004 年就有构造碰撞的方法）。
	    *   现在只用于非安全场景：文件完整性校验（如 `md5sum` 命令）、去重。
	*   SHA-1（16b0 位输出）：
	    *   输出 20 字节（`SHA_DIGEST_LENGTH = 20`）。
	    *   比 MD5 慢一点，也在 2017 年被 Google 攻破碰撞。
	    *   已不再推荐用于安全场景，但 git 内部还在用。
	*   SHA-256（256 位输出）：
	    *   输出 32 字节。
	    *   当前安全的标准选择。TLS 证书、HTTPS、SSH、区块链都用它。
	    *   `hmac_sha256` 是 API 鉴权（如 AWS Signature V4）的标准。
- 加密结果两种呈现形式区别：
	*   **blob（原始二进制）**：就是哈希计算出来的那 16/20/32 个字节，可以直接在网络协议中传输、比较、存文件（二进制格式，紧凑）。
	*   **hex（十六进制字符串）**：每个字节转成 2 个 hex 字符（如 `0xAB` → `"ab"`），人类可读，可以当字符串打印、拼接到 URL 中。
#### HMAC 是什么
```cpp
hmac_sha256("text", "secret_key")  // 输出：不只有 text 的哈希，还混入了 key
```
*   不是简单地对数据做哈希，而是把"密钥"混合到哈希计算中。只持有 key 的人才能验证 HMAC 是否正确。
*   用途：
    *   API 鉴权（你的密钥只有你和服务器知道，HMAC 签名证明请求是你发的）
    *   Cookie 签名
    *   JWT Token 签名
*   **解决普通哈希问题**：普通 MD5/SHA 任何人可以计算 `md5(data)`，无法判断哈希是谁算的。HMAC 解决了身份认证问题。

# 线程与同步
## STL 锁类型总览
### 手动锁
直接调用 `std::mutex` 等对象的 `lock/unlock` 方法，不用 RAII 包装器。加解锁必须配对，控制粒度精细但容易死锁/忘记解锁。
### RAII 锁包装器
不是一种新的锁，是通过 STL 包装器类赋予锁对象 RAII 特性。核心价值是将锁的生命周期绑定到栈对象上——构造加锁，析构解锁，异常安全。
```cpp
std::mutex m;
std::lock_guard<std::mutex> lk(m);       // 最轻量 RAII（构造 lock，析构 unlock）
std::unique_lock<std::mutex> lk(m);       // 灵活 RAII（可手动 unlock/lock，可配合条件变量）
std::shared_lock<shared_mutex> lk(rw);   // 读锁（C++14，配合 shared_mutex）
std::scoped_lock lk(m1, m2);             // C++17，多锁 + 死锁避免
```

|           | lock_guard | scoped_lock     | unique_lock   | shared_lock |
| --------- | ---------- | --------------- | ------------- | ----------- |
| 锁的数量      | 1          | 多个              | 1             | 1           |
| 手动 unlock | ❌          | ❌               | ✅             | ✅           |
| 移动语义      | ❌          | ❌               | ✅             | ❌           |
| 条件变量配合    | ❌          | ❌               | ✅             | ❌           |
| 死锁避免      | ❌          | ✅(std::lock 算法) | 需配合 std::lock | ❌           |
| C++ 版本    | C++11      | C++17           | C++11         | C++14       |

- **lock_guard** 设计哲学："绝不让你犯错"，最轻量最安全，不支持手动 unlock
- **scoped_lock** 和 `std::lock` 算法解决了同时锁多个 mutex 时的死锁问题（如转账场景必须同时锁两个账户）
- **unique_lock** 配合 `std::defer_lock` + `std::lock` 也可锁定多个，比 scoped_lock 更灵活
### 条件锁
配合 `std::condition_variable` 使用，通过 `wait/wait_for/wait_until` 和锁关联，在条件满足时自动唤醒。
### 原子操作
`std::atomic<T>` 保证整型变量的增减不会被中断（不可分割），不是真正的锁但提供了无锁并发的基础。
## sylar 锁类型体系
### 锁分类与选择

| 锁类型 | 等待方式 | 临界区适合长度 | 实现底层 |
|--------|---------|---------------|---------|
| `Mutex` | 睡眠(futex) | 任意 | `pthread_mutex_t` |
| `Spinlock` | 忙等 | 极短(<几微秒) | `pthread_spinlock_t` |
| `CASLock` | 忙等 | 极短 | `std::atomic_flag`(CAS指令) |
| `RWMutex` | 睡眠(读写区分) | 读多写少 | `pthread_rwlock_t` |
| `Semaphore` | 睡眠 | 通知/控制并发 | `sem_t` |
| `NullMutex` | 无 | 调试用 | 空操作 |
| `FiberSemaphore` | 协程挂起 | 协程间协作 | 自定义 |

- **Spinlock**：临界区极短（仅几条指令）。sylar 日志系统的 Logger/LogAppender 用 Spinlock，因为日志临界区就是检查级别→拼接→写缓冲，非常短
- **Mutex**：临界区可能有 IO 或复杂计算，睡眠不浪费 CPU
- **RWMutex**：读多写少场景（配置表、路由表、缓存），多读线程可同时进入
- **CASLock**：基于 `atomic_flag` 的手写自旋锁，不依赖 pthread，可移植性强。30 行完整展示"如何用 CPU CAS 指令实现锁"
- **NullMutex**：单线程调试/性能测试时替换真实锁，消除锁开销
除去 CASLock 以外全部直接封装自 pthread。pthread 在内核实现了完整的锁机制代码中仅用 C++ RAII 包裹，提供异常安全和统一接口
`pthread_spinlock_t` 是 POSIX 标准，不是所有平台都有。`std::atomic_flag` 是 C++11 标准，所有编译器都支持，所以代码提供了两种实现
sylar 中的 XXXImpl 是 pthread 库中的锁的薄封装（比如 Mutex 是 pthread_mutex_t 类型的封装，RWMutex 是 pthread_rwlock_t 的封装）
然后 ScopedLockImpl 用让不同类型的锁拥有 RAII 特性，保证安全，
### ScopedLockImpl —— RAII 锁模板
```cpp
template <class T>
struct ScopedLockImpl {
    T& m_mutex;
    bool m_locked;
    ScopedLockImpl(T& m) : m_mutex(m) { m_mutex.lock(); m_locked = true; }
    ~ScopedLockImpl() { unlock(); }
    void lock()   { if(!m_locked) { m_mutex.lock(); m_locked = true; } }
    void unlock() { if(m_locked) { m_mutex.unlock(); m_locked = false; } }
};
```
和 `std::lock_guard` 类似，但多了 `m_locked` 标志支持手动 lock/unlock（两次 unlock 不会出错）。`ReadScopedLockImpl`/`WriteScopedLockImpl` 同理，构造时分别调 `rdlock()`/`wrlock()`。
### 为什么每个锁都定义 `Lock` 类型？
1. 调用者不用关心具体 RAII 类型，所有锁统一写 `Mutex::Lock lk(m)` / `Spinlock::Lock lk(s)` / `RWMutex::ReadLock lk(rw)`
2. 模板代码可抽象锁行为：`MutexType::Lock lk(m_mutex)` 不管底层是什么锁，换锁只需改一行 `typedef`——**策略模式**
### FiberSemaphore —— 协程信号量
TODO：学到协程调度时再补全
## 协程
协程 = 用户态线程。线程的调度由内核控制（你无法决定它什么时候被切换出去），协程的调度由程序自己控制（切换点在代码中明确写出）。
```cpp
线程：内核调度，抢占式         协程：用户调度，协作式
┌──────────────┐             ┌──────────────┐
│ 线程 A       │             │ 协程 A       │
│  代码段 ...  │   ← 内核     │  代码段 ...  │
│  可能随时    │   强制切换    │  yield() ←──│── 主动让出
│  被切出去    │             │  代码段 ...  │
│  代码段 ...  │             │              │
└──────────────┘             └──────────────┘
```
协程的优势： 切换不需要系统调用（不进内核），只是保存/恢复 CPU 寄存器，开销比线程小 1-2 个数量级。一个线程可以管理成千上万个协程。