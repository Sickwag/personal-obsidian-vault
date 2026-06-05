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
##### ReadFromStream 的两个重载
**重载 1：读取单个 POD 类型**
```cpp
template <class T>
bool ReadFromStream(std::istream& is, T& v) {
    return ReadFixFromStream(is, (char*)&v, sizeof(v));
}

// 使用场景：反序列化一个结构体
int32_t value;
ReadFromStream(file_stream, value);     // 读出 4 字节到 value

struct Header { uint32_t magic; uint16_t version; };
Header h;
ReadFromStream(file_stream, h);          // 读出整个结构体
```
这里 `T` 必须是 POD 类型（没有虚函数、没有自定义构造/析构），二进制直接拷贝安全。

**重载 2：读取连续容器（`vector`）**
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