---
created: 2026-06-01
resource_1: https://github.com/sylar-yin/sylar.git
---
# 前置学习：libevent 框架原理

> [!info] 为什么先学 libevent
> sylar 的 `IOManager`/`Scheduler` 是 Reactor 模式的 C++ 重写。先理解 libevent 的事件循环骨架，再看 sylar 第七阶段（IO 协程调度器）会顺畅很多。项目中 `FoxRedis`/`FoxRedisCluster`（异步 Redis）也直接依赖 libevent。

## 概念分层：内核机制 / 设计模式 / 库实现
这些名词分属三层，理清层级关系就不会混：

```
应用代码
   │
┌──▼──────────────────────────────────┐
│ libevent   (库：Reactor 的实现)      │  ← 用户态
├─────────────────────────────────────┤
│ Reactor 模式 (设计模式层)            │
├─────────────────────────────────────┤
│  就绪通知 (readiness)    完成通知 (completion)
│  select / poll / epoll    io_uring              │
└──┬──────────────────────────────────┴──────────┘
   │
  Linux 内核
```

一句话总纲：**select/poll/epoll/io_uring 是内核机制；Reactor 是用它们搭出的设计模式；libevent 是 Reactor 的 C 库实现。**

### select / poll / epoll — 内核就绪通知（readiness）
解决同一问题：一个线程同时监听很多 fd，谁就绪了告诉我。

| 维度 | select | poll | epoll |
|---|---|---|---|
| 接口 | `fd_set` 位图 | `pollfd[]` 数组 | `epoll_create/ctl/wait` |
| fd 上限 | 1024 (FD_SETSIZE) | 无（受内存） | 无 |
| 复杂度 | O(n) 全量扫描 | O(n) 全量扫描 | O(ready) |
| 内核维护就绪表 | 否，每次传全量 | 否 | 是（红黑树+就绪链表） |
| 每次调用 | 重建 fd_set | 传数组 | 增量 `epoll_ctl` |
| 触发方式 | LT | LT | LT / ET |
| 可移植 | POSIX | POSIX | Linux only |

**epoll 为什么快：**
- `epoll_create` 建 `eventpoll`，内核开红黑树（兴趣表）+ 双向链表（就绪表）
- `epoll_ctl(ADD)` 把 fd 插红黑树，并向 fd 的等待队列注册回调
- fd 就绪时回调把它挂到就绪链表
- `epoll_wait` 只取就绪链表 → O(就绪数)，不随总 fd 数增长

select/poll 每次都要把"我关心哪些 fd"全量传进内核再全扫一遍，fd 一多就线性退化；epoll 把兴趣表常驻内核，只返回就绪的。

### io_uring — 内核完成通知（completion）
epoll 只告诉你"可读了"，读操作还是你自己调 `read()`。io_uring 更进一步：你提交一个"读这个 fd 到这块 buffer"的请求，**内核做完整个 I/O 才通知你**。

| 维度 | epoll (readiness) | io_uring (completion) |
|---|---|---|
| 通知时机 | 就绪时（可以读了） | 完成时（已经读好了） |
| 谁执行 I/O | 应用（非阻塞 read/write） | 内核 |
| 系统调用 | 每次操作 `epoll_ctl/wait` | SQ_POLL 模式下可零系统调用 |
| 数据结构 | 红黑树 + 就绪链表 | 两个共享内存 ring（SQ 提交环 + CQ 完成环） |
| 天然适配 | Reactor | Proactor |
| 内核版本 | Linux 2.6 (2002) | Linux 5.1 (2019) |

io_uring 用 SQ/CQ 两个环形队列做用户态↔内核共享内存通信，批量提交 I/O，可避免每次系统调用开销，适合高 IOPS 存储/高速网络。**libevent 经典后端不基于 io_uring**，它是 readiness 派。
### Reactor vs Proactor — 设计模式

| | Reactor | Proactor |
|---|---|---|
| 通知时机 | 就绪 | 完成 |
| 谁做 I/O | 应用（非阻塞） | 内核（异步） |
| 后端 | select/poll/epoll/kqueue | io_uring / Windows IOCP |
| 典型库 | libevent, libev, muduo | Boost.Asio, libuv |

- **Reactor**：注册"fd 可读时回调" → 循环 `epoll_wait` → 就绪 → 调回调 → 回调里 `read()`
- **Proactor**：发起"读这个 fd" → 内核异步读 → 完成后回调 → 回调里直接拿数据
Linux 长期只有 readiness 接口（io_uring 之前 aio 不完善），所以 Linux 主流是 Reactor；Windows 的 IOCP 天生是 Proactor。
### libevent — Reactor 的库实现
libevent 把 select/poll/epoll/kqueue 统一抽象成**可插拔 backend**：
```c
// event-internal.h
static const struct eventop *eventops[] = {
    &epollops,    // Linux 首选
    &pollops,
    &selectops,
    ...
};
```
- 每个 backend 实现一个 `eventop` 接口（`add`/`del`/`dispatch`/`recalc`）
- `event_base_new()` 按优先级挑一个（Linux 选 epoll）
- 上层只调 `event_add` / `event_base_dispatch`，不感知底下是 epoll 还是 select

所以 **libevent = Reactor 模式 + 可插拔 backend + bufferevent/timer/signal 扩展**，屏蔽内核多路复用差异，一套事件回调代码到处跑。

### 与 sylar 的关系
sylar 的 `IOManager` 不像 libevent 抽象出 select/poll/epoll 多后端——它**直接绑死 epoll**（只跑 Linux），简化了抽象层。sylar 砍掉了 backend 抽象，裸用 epoll + 协程调度。

```
内核机制层:  select ─ poll ─ epoll ──── (readiness → Reactor)
                                     ↘
                                      io_uring (completion → Proactor)
设计模式层:  Reactor ─────────────── Proactor
库实现层:    libevent (Reactor + 可插拔 backend)
             sylar IOManager = 同思路 C++ 重写，直接绑死 epoll，砍掉 backend 抽象
```

## libevent 到底做了什么：epoll 的包装层
> [!important] 关键澄清
> libevent **不是**多路复用技术，是 epoll 的**包装层**，不和 epoll 并列——它在 epoll 之上。libevent 没造新的多路复用，它底层就调 `epoll_create/ctl/wait`。

**strace 证据**：strace 一个 libevent 程序，看到的系统调用仍是：
```
epoll_create1(0) = 3
epoll_ctl(3, EPOLL_CTL_ADD, 5, {EPOLLIN, ...}) = 0
epoll_wait(3, ..., -1) = 1
```

### 类比：stdio 和 read()
| | 系统调用 | C 库包装 |
|---|---|---|
| 文件读写 | `read()` / `write()` | `fread()` / `FILE*` / `std::fstream` |
| I/O 多路复用 | `epoll_create/ctl/wait` | **libevent** |

- 你可以用 `read()` 直接读文件，但每次要自己处理缓冲、部分读、错误。`stdio` 帮你包了，**底层还是调 `read()`**。
- 同理：你可以用 `epoll_wait` 直接写事件循环，但每次要自己处理 fd→回调映射、定时器、信号、跨平台。**libevent 帮你包了，底层还是调 `epoll_wait`**。

stdio 没替代 `read()`，libevent 没替代 epoll。

### 那直接用 epoll 不行吗？libevent 解决的 4 个痛点

**痛点 1：跨平台**
epoll 是 Linux 独占。程序要跑 macOS（kqueue）、老 Unix（select），就得写三套事件循环。libevent 的 `eventops[]` 后端让你一套代码跑所有平台——Linux 选 epoll，Mac 选 kqueue，上层 `event_add` 不变。

**痛点 2：样板代码**
裸 epoll 每次要手写循环 + 自己维护 fd→回调映射：
```c
while (1) {
    int n = epoll_wait(epfd, events, 64, timeout);
    for (int i = 0; i < n; i++) {
        // events[i].data.fd 是几号？读还是写？调哪个函数？自己查表 dispatch
    }
}
```
libevent 把循环和 dispatch 写好了，你只注册"fd 可读时调这个函数"：
```c
event_new(base, fd, EV_READ|EV_PERSIST, on_read, arg);
event_add(ev, NULL);
event_base_dispatch(base);   // 循环 libevent 替你跑
```

**痛点 3：把 fd 事件、定时器、信号塞进同一个循环**
epoll 只管 fd 就绪。你想要"5 秒后调这个函数"或"收到 SIGINT 时调这个函数"，裸用 epoll 得自己：
- 维护最小堆算定时器，把堆顶到期时间转成 `epoll_wait` 的 timeout
- 信号会打断 `epoll_wait`（EINTR），还得用 signalfd 或自管道把信号变 fd 事件

libevent 把这三件事统一成同一个 `event_add` 接口——定时器和信号也当 event 注册，内部帮你算 timeout、处理 EINTR。这是 libevent 最大的价值。

**痛点 4：缓冲 I/O**
epoll 说"可读了"，但你 `read()` 可能只读到半条消息。你得自己写循环读、自己管缓冲区拼包。libevent 的 `bufferevent` 帮你做带缓冲的读写 + 水位回调。

### 总结
```
不用 libevent:
  应用代码 ──直接调──> epoll_wait (内核)
  自己写: event loop + fd→回调表 + 定时器堆 + 信号处理 + 缓冲区

用 libevent:
  应用代码 ──> libevent API (event_add / bufferevent / 定时器)
                   │
                   └──内部调──> epoll_wait (内核)
  libevent 替你写好了中间那一堆
```
libevent = epoll 之上加一层：跨平台后端选择 + 现成事件循环 + fd/定时器/信号统一调度 + 缓冲 I/O 抽象。内核干活的还是 epoll。

## Reactor 模式本质
传统阻塞 I/O：一个连接一个线程，`read()` 阻塞等数据，连接上千时线程切换开销爆炸。Reactor 反过来：**单/少量线程跑一个事件循环，让内核通过 `epoll_wait` 报告哪些 fd 就绪，再对就绪 fd 调回调**。

| 维度 | 阻塞 I/O + 多线程 | Reactor（libevent） |
|---|---|---|
| 等待方式 | 每线程 `read()` 阻塞 | 一个循环 `epoll_wait` |
| 线程数 | ≈ 连接数 | 少量（甚至 1） |
| 扩展性 | 差（线程切换开销） | 好（fd 开销低） |
| 编程模型 | 顺序同步 | 事件驱动 + 回调 |

## Reactor 的实现逻辑与高并发原理

### 五个角色（POSA2）
| Reactor 角色 | 职责 | libevent 对应 | sylar 对应 |
|---|---|---|---|
| Handle | I/O 资源标识 | `ev_fd` | fd |
| 同步事件多路分离器 | 阻塞等就绪 | `eventop->dispatch`(`epoll_wait`) | `epoll_wait` |
| Event Loop | 驱动循环 | `event_base_loop` | `IOManager::idle` |
| Dispatcher | 注册表+分发 | `event_base` | `FdContext`+调度队列 |
| Event Handler | 处理逻辑 | `ev_callback` | Fiber/协程 |

### 核心循环
```c
while (running) {
    // 1. 多路分离：睡到"任意 fd 就绪"或"最近定时器到期"
    n = epoll_wait(epfd, ready[], MAX, nearest_timer_timeout);
    // 2. 分发：就绪事件逐个交回调
    for (i = 0; i < n; i++) {
        ev = ready[i].data.ptr;
        ev->callback(ev->fd, ev->events, ev->arg);
    }
    // 3. 到期定时器
    process_expired_timers();
}
```
**关键二分**：`epoll_wait` 阻塞 = productive wait（睡到任意 fd 就绪，不浪费 CPU）；callback 必须**非阻塞+快**（阻塞则整个循环卡住）。

### 如何做到高并发
一句话：**Reactor 把"连接数"和"线程数"解耦——一个线程靠非阻塞 I/O + `epoll_wait` 同时服务上万连接，线程只在 `epoll_wait` 阻塞（被任意就绪 fd 唤醒），从不在单个 `read()` 阻塞。**

| 模型 | 连接:线程 | 某连接阻塞时 | 10K 连接内存 | 热路径上下文切换 |
|---|---|---|---|---|
| 阻塞 IO+线程/连接 | 1:1 | 只影响自己 | 10K×8MB≈80GB | 每次IO都切 |
| Reactor | N:1 | 卡住所有连接 | 1线程×8MB | 回调背靠背不切 |

四个根因：
1. **线程数与连接数解耦**：10K 连接不再要 10K 线程，省掉 8MB 栈×10K 的内存和调度实体
2. **`epoll_wait` O(ready)**：只返回就绪 fd，不随总连接数增长（内核侧使能条件）
3. **无热路径上下文切换**：阻塞模型每次 IO 切 1-10μs，Reactor 回调背靠背零切换
4. **缓存友好**：单线程单核热数据常驻 cache，线程/连接模型在线程间蹦

### 边界与变体
Reactor 的并发是 **I/O 并发，不是 CPU 并行**。单线程单核跑回调，重 CPU 回调会卡住整个循环。变体都围绕"别让回调阻塞"：

| 变体 | 结构 | 代表 |
|---|---|---|
| 单线程 Reactor | 1 线程 accept+IO+业务 | libevent 默认 |
| 主从 Reactor | 1 主 accept，分发 worker 线程池 | Netty |
| one loop per thread | N 个 Reactor 线程各跑 epoll | muduo |
| **Reactor + 协程** | N 线程各 epoll，回调=恢复协程，阻塞时 yield | **sylar IOManager** |

sylar 是最后一种：多个调度线程各自在 `idle()` 里 `epoll_wait`，事件回调不是普通函数而是**恢复一个协程**。协程里的"阻塞 read"（被 Hook 拦截）实际 yield 协程而非阻塞 OS 线程——所以能写顺序的阻塞式代码却不卡循环。这正是第八阶段 Hook 机制要解决的。

### 命门：回调不能阻塞
哪个回调忘设 `O_NONBLOCK`、做磁盘 I/O、或 `sleep(1)`，整个事件循环停滞，几万连接全部卡死。
- libevent 给 `bufferevent` 帮你包缓冲
- sylar 更激进：**Hook + 协程**，让你写 `read()` 像阻塞调用，底层自动转"注册事件 + yield 协程"，既不卡循环又保持代码可读

## 两个核心结构

### event_base —— 事件循环引擎
@libevent event.c / event-internal.h
- 持有一个 backend（epoll/select/poll 之一）+ 就绪队列
- `event_base_new()` 创建，`event_base_loop()` / `event_base_dispatch()` 跑循环
- 结构定义在 `event-internal.h`

### event —— 一次事件注册
@libevent event.c
- "我关心 fd X 的某事件，就绪时调 func"的注册项
- 关键字段：`ev_fd` / `ev_events`(READ|WRITE) / `ev_callback` / `ev_arg`
- `event_add()` 注册、`event_del()` 注销、`event_assign()` 初始化

## 主循环数据流
```
event_add(ev)        →  插入 event_base 注册表 + 通知 backend (epoll_ctl ADD)
event_base_loop()    →  epoll_wait() 取就绪 fd  →  event 入就绪队列  →  逐个调 ev_callback
```

## 最小用法
```c
struct event_base *base = event_base_new();                               // 建引擎
struct event *ev = event_new(base, fd, EV_READ|EV_PERSIST, on_read, arg); // 注册
event_add(ev, NULL);                                                      // 加入 backend
event_base_dispatch(base);                                                // 跑循环
```
`EV_PERSIST` 是关键：默认 event 触发一次后自动失效（需重新 `event_add`），加这个 flag 才会持续监听——sylar 中"事件常驻"的语义即源于此。

## libevent → sylar 对应关系

| libevent | sylar |
|---|---|
| epoll backend（`epoll.c`） | `IOManager` 直接用 epoll |
| timer（最小堆 + `epoll_wait` 超时） | `TimerManager` 同源 |
| bufferevent / evbuffer | sylar `Socket` / `Stream` |
| `event_base_loop` 主循环 | `IOManager::idle()` 协程里 `epoll_wait` |
| `EV_PERSIST` 持续监听 | sylar 事件默认常驻 |

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
其他实现和细节参考: [[设计模式#单例模式]]
```cpp
template <class T, class X, int N>
T& getInstanceX() {
	static T v;
	return v;
}

template <class T, class X, int N>
std::shared_ptr<T> getInstancePtr() {
	static std::shared_ptr<T> v(new T);
	return v;
}

// Singleton — 返回裸指针，调用方不参与生命周期管理，生命周期一定不会有问题放心用
template <class T, class X = void, int N = 0>
class Singleton {
  public:
	static T* getInstance() {
		static T v;
		return &v;
	}
};

// SingletonPtr — 返回 shared_ptr，调用方可以持有引用延长生命周期
template <class T, class X = void, int N = 0>
class SingletonPtr {
  public:
	static std::shared_ptr<T> getInstance() {
		static std::shared_ptr<T> v(new T);
		return v;
	}
};
```
- X，N 模板参数似乎没有使用，但其实是为了创建*多个单例*，这似乎违反单例设计意义？
- 测试过程中可能需要多个单例并行测试多个功能，但是由于单例模式全局唯一，而模板类/函数可以通过模板参数作为标签生成不同的类/函数代码，两者结合
```cpp
// 项目中有一个 ConfigVar 类表示配置变量
// 你有两套完全独立的配置系统（一套给业务用，一套给框架底层用），X参数一般指向一个空结构体，只用作tag功能
using BusinessConfig = Singleton<ConfigVar, struct BusinessTag>;
using SystemConfig   = Singleton<ConfigVar, struct SystemTag>;

BusinessConfig::GetInstance()->set("timeout", 5000);
SystemConfig::GetInstance()->set("timeout", 1000);   // ← 不同的内存地址！
// 两套互不干扰，各自有自己的 static ConfigVar v
// 同一个类型T，但生成不同的类代码->不同的**单例对象**
```
N 用于第三维度，即 X 如果还不够区分则用上 N
实际上项目中 `GetInstanceX()/GetInstancePtr()` 是历史实现（保留了但项目中并没有用到）
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


# 日志模块
## 组件设计
`LogFormatter`: 日志格式器，与 log4cpp 的 PatternLayout 对应，用于格式化一个日志事件。该类构建时可以指定 pattern，表示如何进行格式化。提供 format 方法，用于将日志事件格式化成字符串。
`LogAppender`: 日志输出器，用于将一个日志事件输出到对应的输出地（终端，文件）。该类内部包含一个 LogFormatter 成员和一个 log 方法，日志事件先经过 LogFormatter 格式化后再输出到对应的输出地。从这个类可以派生出不同的 Appender 类型，比如 StdoutLogAppender 和 FileLogAppender，分别表示输出到终端和文件。
`Logger`: 日志器，负责进行日志输出。一个 Logger 包含多个 LogAppender 和一个日志级别，提供 log 方法，传入日志事件，判断该日志事件的级别高于日志器本身的级别之后调用 LogAppender 将日志进行输出，否则该日志被抛弃。
`LogEvent`: 日志事件，用于记录日志现场，比如该日志的级别，文件名/行号，日志消息，线程/协程号，所属日志器名称等。
`LogEventWrap`: 日志事件包装类，其实就是将日志事件和日志器包装到一起，因为一条日志只会在一个日志器上进行输出。将日志事件和日志器包装到一起后，方便通过宏定义来简化日志模块的使用。另外，LogEventWrap 还负责在构建时指定日志事件和日志器，在析构时调用日志器的 log 方法将日志事件进行输出。
`LogManager`: 日志器管理类，单例模式，用于统一管理所有的日志器，提供日志器的创建与获取方法。LogManager 自带一个 root Logger，用于为日志模块提供一个初始可用的日志器。

每个想要使用日志模块的模块 **都要在 cpp 文件中定义** `static sylar::Logger::ptr g_logger = SYLAR_LOG_NAME("system");` 获取日志器，因为不同文件可能想用不同的日志器名称
如果想要仅仅通过 `#include "log.h"` 就能够使用功能，那么应该在 log.h 文件中使用 `inline` 关键字防止每个编译但单元都有一份自己的日志器，即使他们同名但是地址不同
## 代码编写
### 枚举类型允许位掩码计算
```cpp
Logger::Logger(const std::string& name)
	: _name(name)
	, _level(LogLevel::Level::Debug) {
	_formatter = std::make_shared<LogFormatter>("%d{%Y-%m-%d %H:%M:%S}%T%t%T%N%T%F%T[%p]%T[%c]%T%f:%l%T%m%n");
}
```
这样通过手写字符串格式化的方法可读性较差，使用一个管理模块控制不同枚举类型的行为:
```cpp
// main controller
template <typename EnumClass>
struct EnableBitMask {
	static constexpr bool LogModule = false;  // 模块控制单元
};

// 重载 | 操作符
template <typename EnumClass>
constexpr auto operator|(EnumClass lhs,
						 EnumClass rhs) -> std::enable_if_t<EnableBitMask<EnumClass>::LogModule, EnumClass> {
	using underlying = std::underlying_type_t<EnumClass>;
	return static_cast<EnumClass>(static_cast<underlying>(lhs) | static_cast<underlying>(rhs));
}
// 其他操作符
```
- EnableBitMask 中每一个变量控制**一个模块（编译单元）中的枚举值是否可以进行转换**，位掩码开关需要 `|` （打开多个开关）和 `&` （检查某个开关是否打开）的重载，所以只重载两个运算符。参考: [[DevFoundations#位掩码设计开关|位掩码设计]]。
- 在需要开启位掩码运算的模块中[[模板元编程#显式实例化|显式实例化]]对应模板即可**在某个枚举类的粒度上控制**，还可以细化不同的模块控制单元启用哪些操作符
```cpp
// 在日志模块的cpp文件中特化，不用在头文件中特化
template <>
struct EnableBitMask<azzato::LogFormat> {
	static constexpr bool LogModule = true;
};
```
### 模式串解析
老版使用大量继承自 FormatItem 的类实现一个简单的输入字符串到输出流中的操作
```cpp
class MessageFormatItem : public LogFormatter::FormatItem {
  public:
	explicit MessageFormatItem(const std::string& /*unused*/) {}
	void format(std::ostream& os,
				Logger::ptr /*logger*/,
				LogLevel::Level /*level*/,
				LogEvent::ptr event) override {
		os << event->getContent();
	}
};
```
在 `init()` 做解析用，解析出所有模式后，通过宏执行对应类内部的 format 函数
```cpp
static std::map<std::string, std::function<FormatItem::ptr(const std::string& str)>> s_format_items = {
#define XX(str, C) { #str, [](const std::string& fmt) { return FormatItem::ptr(new C(fmt)); } }

		XX(m, MessageFormatItem),	  // m:消息
		XX(p, LevelFormatItem),		  // p:日志级别
		XX(r, ElapseFormatItem),	  // r:累计毫秒数
		XX(c, NameFormatItem),		  // c:日志名称
		XX(t, ThreadIdFormatItem),	  // t:线程id
		XX(n, NewLineFormatItem),	  // n:换行
		XX(d, DateTimeFormatItem),	  // d:时间
		XX(f, FilenameFormatItem),	  // f:文件名
		XX(l, LineFormatItem),		  // l:行号
		XX(T, TabFormatItem),		  // T:Tab
		XX(F, FiberIdFormatItem),	  // F:协程id
		XX(N, ThreadNameFormatItem),  // N:线程名称
#undef XX
	};
```
这会导致调用虚函数的开销，但如果不使用虚函数（多态）而用 switch-case 直接根据模式字符做分支，每个字符都要做分支判断，分支预测失败的开销并不比虚函数跳转小。而日志模块性能瓶颈在 I/O（写文件/终端），虚函数调用是纳秒级的。spdlog、log4cpp 都用了类似策略。
并且老版还有 `make_tuple` 的不小构造开销（虽然只有一次，`s_format_items` 是 static 的），所以新版引入位掩码设计方式
```cpp
void LogFormatter::init(LogFormat fmt) {
	auto add = [&](auto&& item) { _items.push_back(std::move(item)); };

	if((fmt & LogFormat::DateTime) != LogFormat::None) {
		add(std::make_shared<DateTimeFormatItem>());
		add(std::make_shared<TabFormatItem>(""));
	}
	// 其他判断
}
```
### 日志文件轮转
生产环境中，日志文件通常由外部工具（logrotate、cron 等）定期轮转：
轮转发生时，系统会：
1. `mv app.log app.log.1` — 原文件被重命名
2. 创建新的空 app.log — 但 sylar 进程手中的文件描述符仍然指向 app.log.1（inode 没变）
3. 后续日志全写到 app.log.1 里，新的 app.log 是空的
reopen() 的作用就是关闭旧的文件描述符，重新打开文件，这就是`FileLogAppender::reopen` 检查的意义
### 写入日志的时机
一个写日志的操作是这样的:
```cpp
try {
	setValue(FromStr()(val));
} catch(std::exception& e) {
	SYLAR_LOG_ERROR(SYLAR_LOG_ROOT())
		<< "ConfigVar::fromString exception " << e.what() << " convert: string to " << TypeToName<T>()
		<< " name=" << m_name << " - " << val;
}
```
宏展开后:
```cpp
1. SYLAR_LOG_ROOT() → LoggerMgr::GetInstance()->getRoot() — 获取 root 日志器
2. SYLAR_LOG_ERROR(logger) → SYLAR_LOG_LEVEL(logger, ERROR)
3. 最终展开为：
try {
	setValue(FromStr()(val));
} catch(std::exception& e) {
	if(rootLogger->getLevel() <= ERROR)   // 级别过滤
		// 下面内容是一行内，都在if块中
	    LogEventWrap(                  // 创建临时对象
	        LogEvent(logger, ERROR, __FILE__, __LINE__, 0,
	                 GetThreadId(), GetFiberId(), time(0), Thread::GetName())
	    ).getSS()                      // 返回 stringstream
	    << "message" << e.what();      // 写入内容
}
```
以上代码只是创建了 LogEvent （记录行号，文件名，threadId 等等信息）并用 LogEventWrap 包装（指定这各 LogEvent 将要被哪一个日志器输出，日志器管理输出位置），并修改了 LogEvent 内的 `_ss` 成员，真正写日志的操作在析构函数中
```cpp
LogEventWrap::~LogEventWrap() { m_event->getLogger()->log(m_event->getLevel(), m_event); }
```
因为 LogEventWrap 是临时对象，其生命周期仅仅在 在**未展开的宏表达式末尾的 `;` 位置**结束，所以调用宏的位置就是记录日志的位置，不会有滞后问题，更不会在 catch 块结束位置才将日志记录，log 函数再调用具体的记录函数**将同一条信息记录到所有的 LogAppender 中**
```cpp
void Logger::log(LogLevel::Level level, LogEvent::ptr event) {
	if(level >= m_level) {
		auto			self = shared_from_this();
		MutexType::Lock lock(m_mutex);
		if(!m_appenders.empty()) {
			for(auto& i : m_appenders) {
				i->log(self, level, event);
			}
		} else if(m_root) {
			m_root->log(level, event); // m_root 在构造函数中 m_root->addAppender(LogAppender::ptr(new StdoutLogAppender));，所以不会无限递归
		}
	}
}

// 下面函数/宏同样最终到达log函数，只是将log重要输入的参数通过函数名提前分类好了
void Logger::debug(LogEvent::ptr event) { log(LogLevel::DEBUG, event); }
#define SYLAR_LOG_DEBUG(logger) SYLAR_LOG_LEVEL(logger, sylar::LogLevel::DEBUG)

// 添加自定义信息，最后同样调用log
#define SYLAR_LOG_FMT_DEBUG(logger, fmt, ...) SYLAR_LOG_FMT_LEVEL(logger, sylar::LogLevel::DEBUG, fmt, __VA_ARGS__)
```
完整时序图
```cpp
用户代码: SYLAR_LOG_ERROR(root) << "msg" << var;
    │
    ├─▶ ① 宏展开: if 检查级别 → 创建 LogEvent (存文件名/行号/时间等)
    ├─▶ ② 创建 LogEventWrap 临时对象
    ├─▶ ③ .getSS() 返回 LogEvent::m_ss (stringstream)
    ├─▶ ④ 用户 << "msg" << var 写入 m_ss
    ├─▶ ⑤ 遇到 ; 临时对象析构
    │     └─▶ ~LogEventWrap()
    │           └─▶ Logger::log(ERROR, event)
    │                 ├─▶ 检查 Logger 级别
    │                 ├─▶ 遍历所有 Appender
    │                 │     └─▶ Appender::log()
    │                 │           ├─▶ LogFormatter::format() 组装格式
    │                 │           │     (时间|线程|级别|文件:行|消息...)
    │                 │           └─▶ 写入 std::cout / ofstream
    │                 └─▶ 无 Appender → 委托 root Logger
    │
    └─▶ ⑥ 临时对象销毁完毕
```
### dangling-else 陷阱
宏代码中如果有 if 块，在 if-else 代码块中调用这个宏**就会导致外部 else 匹配宏内部的 if**
，常见的解决方法是 `do{}while(0)` 包裹，参考 [[C++ Runoob Tutoral#`do { ... } while(0)` 惯用法]]
使用宏+流式方法记录日志其实是一种**不够优雅的写法**，可以采用 [[FastLog]] 中的 `std::format` 形式
### 其他设计
Logger 和 Appender 都使用自旋锁，因为锁持有时间很短
# 环境变量模块
## 概述
在程序运行时，可以通过调用 `getenv()/setenv()` 接口来获取/设置系统环境变量，比如 `getenv("PWD")` 来获取当前路径。在 shell 中可以通过 `printenv` 命令来打印当前所有的环境变量
根据这些内容，项目中提供这几组变量的获取和修改:
1. 系统环境变量，由 shell 保存，`getEnv()/setEnv()` 方法用于操作系统环境变量。
2. 程序自定义环境变量，对应 `get()/add()/has()/del()` 接口，保存在程序自己的内存空间中，通过 `std::map<std::string, std::string>` 保存
3. 命令行参数，main函数的参数，所有参数都被解析成选项-选项值的形式，**选项只能以 `-` 开头**，如果一个参数只有选项没有值，那么值为空字符串。命令行参数保存在程序自定义环境变量中。
4. 帮助选项与描述。生成程序的命令行帮助信息，`-h` 打印这些帮助信息。帮助选项与描述存储在程序自己的内存空间中，`std::vector<std::pair<std::string, std::string>>` 存储
5. 与程序运行路径相关的信息，包括记录程序名，程序路径，当前路径，这些由单独的成员变量来存储。
## 代码实现
程序的 bin 文件绝对路径是通过 `/proc/$pid/` 目录下 exe 软链接文件指向的路径来确定的，用到了 `readlink(2)` 系统调用。
通过 setenv/getenv 操作系统环境变量
getAbsolutePath 方法传入一个相对于 bin 文件的路径，返回这个路径的绝对路径

> [!Info] 小细节
> - 模板类中的**非模板函数也应该在头文件中定义**，否则编译器生成的类中只有函数声明没有实现
> - override/final 等关键字只能在函数声明中有，不能在定义位置使用

### 偏特化仿函数重载
```cpp
template <class Source, class Target>
class LexicalCast {
  public:
	T operator()(const Source& s) { return boost::lexical_cast<Target>(s); }
};
```
- 用于实现 Source 类型到 Target 类型的字符串之间转换（Source 和 Target 之间有一个是 string 类型），参考[[#字符串和基本类型转换]]
- 由于这里的底层实现依赖 `boost::lexical_cast` ，其支持多种能和 string 类型发生转换的类型，这里需要的是**不仅仅是转成 string 类型，而是转换成 yamlcpp 库能够接受的 string 类型**，所以对**常用的数据结构进行偏特化**，而没有偏特化的依靠 boost 实现
- 由于[[模板元编程#模板特化|只有类和变量支持偏特化]]，所以以这里使用类模板偏特化实现
- 这是一种策略模式的体现，维护转换类型时，只需要修改对应的偏特化实现即可
- 调用者想要进行某种类型和字符串的转化时，无论什么类型都只需要调用 `LexicalCast` 并指明原类型和目标类型即可，不用管细节。省去了记住每一种类型转换要调用什么 api 的麻烦，**主模板用作一种兜底**，特化模板用作 YAML String 和其他类型之间的转换
```cpp
// YAML String -> std::unordered_map<std::string, T>
template <class T>
class LexicalCast<std::string, std::unordered_map<std::string, T>> {
  public:
	std::unordered_map<std::string, T> operator()(const std::string& v) {
		// ...
	}
};

// std::unordered_map<std::string, T> -> YAML String
template <class T>
class LexicalCast<std::unordered_map<std::string, T>, std::string> {
  public:
	std::string operator()(const std::unordered_map<std::string, T>& v) {
		// ...
	}
};
```
注意每种类型之间的转换是相互的，**真正行使转换功能的是 `ConfigVar` 类**中的方法
### 类分工
- ConfigVarBase 是纯虚类，作为一个接口供给 ConfigVar 使用，强制其实现 ToString 和 FromString 和 getTypeName 方法，并保存一个配置的名称
- ConfigVar 作用是保存一个配置的值和这个配置的可能触发的回调函数，配置值的类型就是模板类型 T，一个配置项的不同值可能分别对应不同的操作，这些操作为了保证耦合性所以和配置值放在一起方便调用。同时 ConfigVar 提供一组接口用于管理这些回调。Config 和 ConfigVar 分别作为配置项名称和配置值与其回调的组合，共同成为一个配置项
- Config 类用于管理一系列配置项，提供一组静态方法从文件读取/查找配置，靠 GetDatas 获取所有配置项，Lookup 函数通过函数名查找或者新建配置
###  Meyers Singleton 模式陷阱
不同翻译单元（.cpp 文件）中的全局/类静态变量，初始化顺序是未定义的。
参考[[设计模式#懒汉式实现（Meyer Singleton 实现）]]
### lookup 函数设计
Lookup 函数中的 dynamic_pointer_cast 和为什么 `using ConfigVarMap = std::unordered_map<std::string, sylar::ConfigVarBase::ptr>`？
#### shared_ptr 版本的 dynamic_cast
在继承体系里做运行时安全的向下转型，运行时检查对象的实际类型
```cpp
Base* p = new Derived();
Derived* d = dynamic_cast<Derived*>(p);   // OK，d 不为空
Other*   o = dynamic_cast<Other*>(p);     // 类型不符，返回 nullptr

dynamic_pointer_cast<Derived>(sp) 等价于：

shared_ptr<Derived> dynamic_pointer_cast(const shared_ptr<Base>& sp) {
    Derived* p = dynamic_cast<Derived*>(sp.get());  // 运行时检查
    return p ? shared_ptr<Derived>(sp, p)           // 共享所有权，引用计数 +1
             : nullptr;                              // 类型不符返回空
}
```
其中 `shared_ptr<Derived>(sp, p)` 是别名共享构造函数
```cpp
template< class Y >
shared_ptr( const shared_ptr<Y>& r, element_type* ptr ) noexcept;
```
- 构造 `shared_ptr`，与 r 的初始值共享所有权信息，但保有无关且不管理的指针 ptr。若此 `shared_ptr` 是离开作用域的组中的最后者，则它将调用最初 r 所管理对象的析构函数。(C++20 起)
- 本质是创建与 other 共享控制块，但指向不同地址的 shared_ptr，返回值 `shared_ptr<Derived>(sp, p)` 管理 p 指向的对象，由于共享同一个控制块，ref_count 在原 sp 的控制块上 +1，sp 和返回值析构时都会让该控制块的 ref_count -1
#### 通过继承实现类型擦除
- ConfigVar 模板的 T 参数是其中保存的 val 的类型（配置项值的类型）
- 所有类型的配置项都在 Config 类中接管，并通过 Config 中的 lookup 函数查询
- lookup 函数仅仅提供通过 name 查找配置值并通过模板参数 T 要求配置名为 name 的配置值类型必须为 T 的方法，返回 `ConfigVar<T>::ptr` ，T 即配置值的类型,getValue 函数获取值
- `ConfigVar*` 和 `ConfigVarBase*` （注意是指针）的**向上转型**是安全的，参考[[C++ Runoob Tutoral#dynamic_cast|多态继承dynamic_cast向上转型]]
这些前提导致了不能将 `s_datas` 存储为: `std::unordered_map<std::string, ConfigVar<T>::ptr> s_datas`，因为 map 的值类型必须是同一个类型，`ConfigVar<int>` 和 `ConfigVar<string>` typeid 不同，本质是因为编译期需要确定 T 类型确定内存布局，map 并未支持类型擦除
```cpp
if(it != GetDatas().end()) {
	auto tmp = std::dynamic_pointer_cast<ConfigVar<T>>(it->second);
	// ...
	typename ConfigVar<T>::ptr v(new ConfigVar<T>(name, default_value, description));
	GetDatas()[name] = v;
}
```
- [[#shared_ptr 版本的 dynamic_cast|dynamic_pointer_cast已经实现类型检查]]，确保**从 s_datas 中查询出来的** it->second（类型为 `ConfigVarBase::ptr`，即 `std::shared_ptr<ConfigVarBase>`）实际指向的对象是 `ConfigVar<T>`，且 Lookup 函数的 T 模板参数与原配置项的 T 一致
- 没有查找则按默认值创建配置项（构造 ConfigVar）并放入 s_datas 中接管
### 配置热重载
回调签名：`std::function<void(const T& old_value, const T& new_value)>` 应用场景:
```cpp
// 场景 1：日志级别热加载
static auto g_log_level = Config::Lookup("log.level", (int32_t)2, "log level");
g_log_level->addListener([](int32_t old, int32_t new_val) {
    // 日志级别变更时，通知所有 Logger 重新加载
    LoggerMgr::GetInstance()->setLevel((LogLevel::Level)new_val);
});

// 场景 2：TCP 连接参数变更 → 重建连接池
static auto g_pool_size = Config::Lookup("tcp.pool_size", (int32_t)10, "tcp pool size");
g_pool_size->addListener([](int32_t old, int32_t new_val) {
    ConnectionPool::instance().resize(new_val);
    SYLAR_LOG_INFO(g_logger) << "connection pool resized from " << old << " to " << new_val;
});

// 场景 3：服务器端口变更 → 优雅重启 listener
static auto g_port = Config::Lookup("server.port", (uint16_t)8080, "server port");
g_port->addListener([](uint16_t old, uint16_t new_val) {
    // 旧端口停止 accept，新端口开始监听
    HttpServer::instance()->rebind(new_val);
});

// 场景 4：阈值触发告警
static auto g_max_conn = Config::Lookup("server.max_connections", 1000);
g_max_conn->addListener([](int old, int new_val) {
    if (new_val > 5000) {
        alert("connection limit set too high: " + std::to_string(new_val));
    }
});
```
### 两段式读写锁设计
```cpp
void setValue(const T& v) {
    {  // 第一阶段：读锁 → 通知回调
        RWMutexType::ReadLock lock(m_mutex);
        if(v == m_val) return;
        for(auto& i : m_cbs) i.second(m_val, v);  // 回调时持有读锁
    }  // 读锁释放
    // 第二阶段：写锁 → 赋值
    RWMutexType::WriteLock lock(m_mutex);
    m_val = v;
}
```

> [!note] 可重入 (Reentrant)
> 可重入指函数或代码段在被多个线程/任务同时调用时能正确工作，即使执行过程中被中断并再次进入也不会破坏数据。关键特征：
> 1. 不使用静态/全局数据
> 2. 不依赖单例资源
> 3. 不调用不可重入函数
> 4. 通过参数传递状态
- `pthread_lock_t` 是不可重入的（不支持连续加同类型的锁），也不可同时加读锁
和写锁（读写锁设计自身特性）
	- 读锁：可被多个线程同时持有
	- 写锁：只能被一个线程持有，且持有期间其他线程无法获取读锁或写锁
- 通知回调函数，旧配置的值已经被修改，以后再被调用时要返回新值的信息
- 通知回调函数需要读取 `m_val`，所以要以一个读锁，更改新的值到成员变量要加
上读锁，而读写锁特性不支持重入，如果只加一个写锁在整个 setValue 作用域会让
回调函数中调用了 getValue（读锁）会直接导致**死锁**，更安全的替代方案是**延迟回调**：
```cpp
void setValue(const T& v) {
    vector<function<void()>> pending;
    {
        WriteLock lock(m_mutex);               // 一把写锁
        if(v == m_val) return;
        for(auto& i : m_cbs) {
            pending.push_back([cb=i.second, old=m_val, new_val=v]() {
                cb(old, new_val);
            });
        }
        m_val = v;                             // 先赋值
    }  // 写锁释放
    for(auto& cb : pending) cb();              // 锁外执行，永不锁重入
}
```
### 其他设计
listAllMember 函数将 YAML 树形嵌套结构转换为 key-value 列表
```cpp
tcp:
  connect:
    timeout: 10000
↓ 拍平
("tcp", {Map})                    → 跳过（key 为空）
("tcp.connect", {Map})            → 跳过
("tcp.connect.timeout", "10000")  → 调 fromString("10000")
```
linux 上获取可执行文件所在目录方法参考[[C++ Runoob Tutoral#不引入第三方库实现的跨平台功能#获取可执行文件所在目录|获取可执行文件目录]]，本项目的实现仅适用于 linux，可以用 filesystem 重写为:
```cpp
bool Env::init(int argc, char** argv) {
	std::string link	  = "/proc/self/exe";
	fs::path	fsExePath = fs::read_symlink(link);
	_exe				  = fsExePath.string();
	_cwd				  = fsExePath.parent_path().string() + "/";
	...
}
```
# 数据库模块
## 纯虚接口层 — db.h
| ISQLData     | - 查询结果集（行/列遍历、类型安全取值）                                             |
| ------------ | ----------------------------------------------------------------- |
| ISQLUpdate   | - 写入操作（`execute + getLastInsertId`）                               |
| ISQLQuery    | - 查询操作（`query` 返回 `ISQLData::ptr`）                                |
| IStmt        | - 预处理语句（`bind` 各种类型 + `execute/query`）                            |
| ITransaction | - 事务（`begin/commit/rollback`，继承 `ISQLUpdate`）                     |
| IDB          | - 数据库连接（继承 `ISQLUpdate + ISQLQuery`，外加 `prepare/openTransaction`） |

MySQL 和 SQLite3 各自实现这些接口，调用方永远只通过接口指针操作，完全不知道底层
## MySQL 接口层
### 概览

| 类                | 作用                                                                         |
| ---------------- | -------------------------------------------------------------------------- |
| MySQL            | 一条真实的 MySQL 数据库连接（封装 MYSQL*），并直接提供普通 sql 和预处理 sql 的查询和执行接口，友元 MySQLManager |
| MySQLRes         | 存放查询的结果集（封装 MYSQL_RES*）并提供不同值类型接口获取结果集**当前行第 idx 个字段**的值                   |
| MySQLStmt        | 一条预处理语句（封装 MYSQL_STMT*）                                                    |
| MySQLStmtRes     | 存放预处理语句的结果集，友元 MySQLStmt                                                   |
| MySQLTransaction | 事务管理（BEGIN/COMMIT/ROLLBACK）                                                |
| MySQLManager     | 连接池，管理多个数据库连接                                                              |
| MySQLUtil        | 静态工具类，提供全局快捷调用                                                             |
### 代码设计
比较简单没什么好说的
- MySQL C API 对普通查询和预处理查询提供了完全不同的两套 API，所以 execute 函数在（MySQL 和 MySQLStmt 中各有一个），查询函数（query 在 MySQLRes 和 MySQLStmtRes 中同理）本质上没什么区别
- get 函数中使用 `std::bind` 会导致无法内联和编译生成复杂嵌套[[C++ Runoob Tutoral#和 std bind 绑定器的对比|带来多次跳转开销]]，所以使用 lambda 代替了。name 必须值引用，否则生命周期问题可能导致 UB
## SQLite3 接口层
架构和 [[#MySQL 接口层]]几乎一致

| 类 | 作用 |
| ---------------- | -------------------------------------------------------------------------- |
| SQLite3 | 一条 SQLite3 数据库连接（封装 `sqlite3*`），提供普通/预处理 sql 接口，友元 SQLite3Manager |
| SQLite3Data | 预处理语句的结果集（封装 `sqlite3_stmt*` 的行读取），通过 `next()` + `getInt32/64/String` 遍历 |
| SQLite3Stmt | 一条预处理语句（封装 `sqlite3_stmt*`），支持 COPY/REF 两种绑定模式 |
| SQLite3Transaction | 事务管理，支持 DEFERRED/IMMEDIATE/EXCLUSIVE 三种 SQLite3 特有事务类型 |
| SQLite3Manager | 连接池，管理与 MySQLManager 相同的池化逻辑 |

### 代码设计
MySQL 和 SQLite3 都实现了 `IStmt::ptr prepare()` + `execStmt()`/`queryStmt()` 的统一接口，差异在底层 API。末尾的 `MySQLBinder`/`SQLite3Binder` 模板结构（配合 `XX` 宏展开）实现了**编译期递归参数绑定**：`execStmt("INSERT INTO t VALUES(?,?)", 42, "hello")` 自动展开为 `stmt->bind(1, 42)` → `stmt->bind(2, "hello")`，本质是 C++11 变参模板在 C++17 折叠表达式之前的递归替代方案，宏 `XX` 仅用于减少为每种类型手写特化的重复代码。`bindX` 作为统一入口（`bindX(stmt, args...)` 即 `MySQLBinder<1, Args...>::Bind(stmt, args...)`），从 `N=1` 开始递归展开。非默认类型的特化（`struct MySQLBinder<N, Head, Tail...>` 主模板）用 `static_assert(sizeof...(Tail) < 0)` 触发编译错误，阻止不支持的类型通过。

### COPY vs REF（`SQLITE_TRANSIENT` vs `SQLITE_STATIC`）
通过 `sqlite3_bind_text` / `sqlite3_bind_blob` 等函数向预处理语句传入字符串或二进制数据时，SQLite3 需要知道**怎么处理你传入的指针**。
```cpp
// 场景：临时字符串
{
    std::string name = "Alice";
    sqlite3_bind_text(stmt, 1, name.c_str(), name.size(), ???);
    // 离开作用域后 name 被销毁，指针悬空
}
sqlite3_step(stmt);  // ??? stmt 还要用这个指针
```
#### `SQLITE_STATIC`（REF）
指针在 stmt 执行完毕前一直有效，直接引用,不用拷贝。
```cpp
// 适用场景：数据生命周期 > stmt 生命周期
static const char* data = "hello";
sqlite3_bind_text(stmt, 1, data, 5, SQLITE_STATIC);
```
- 性能好（零拷贝）
- 调用方必须保证指针在 `sqlite3_step()` 之前一直有效
- 如果指针指向栈/临时变量，可能导致 use-after-free
#### `SQLITE_TRANSIENT`（COPY）
告诉 SQLite3："这个指针可能很快失效，你**内部拷贝一份**。"
```cpp
// 适用场景：临时字符串
std::string name = get_name();
sqlite3_bind_text(stmt, 1, name.c_str(), name.size(), SQLITE_TRANSIENT);
// SQLite3 内部 malloc + memcpy 复制数据
// name 离开作用域后，stmt 内部有自己的副本，安全
```
- 安全（不依赖外部数据生命周期）
- 有拷贝开销
将 `COPY` 设为默认（`Type type = COPY`），因为**安全优于性能**——在大多数场景下，拷贝一个字符串的开销可以忽略，但 use-after-free 是灾难性的。
### SQLite3 事务模式（vs MySQL）
```cpp
class SQLite3Transaction {
    enum Type { DEFERRED = 0, IMMEDIATE = 1, EXCLUSIVE = 2 };
};
```
SQLite3 有**三种事务模式**，这是由 SQLite3 的锁机制决定的。
#### SQLite3 的五级锁状态
SQLite3 在文件级别实现并发控制，有五个锁状态（逐步升级）：
```
UNLOCKED  →  SHARED  →  RESERVED  →  PENDING  →  EXCLUSIVE
  未锁定      可读       预留写      写等待      排他写
```
- **UNLOCKED**：没有锁，谁都可以操作
- **SHARED**：读锁，多个连接可以同时持有 SHARED 锁（并发读）
- **RESERVED**：准备写，和 SHARED 兼容（可以一边读一边准备写），但同一时间只能有一个 RESERVED
- **PENDING**：等待排他，阻止新的 SHARED 锁，等已有 SHARED 释放后升级为 EXCLUSIVE
- **EXCLUSIVE**：排他锁，禁止任何其他读/写
#### 三种事务模式对应什么锁？

| 事务类型          | 开始时获取的锁        | 第一次读时      | 第一次写时                                       |
| ------------- | -------------- | ---------- | ------------------------------------------- |
| **DEFERRED**  | UNLOCKED（不获取锁） | 升级到 SHARED | 从 SHARED 升级到 RESERVED → PENDING → EXCLUSIVE |
| **IMMEDIATE** | **RESERVED**   | 读直接可用      | 直接升级到 PENDING → EXCLUSIVE（不需要从 SHARED 升级）   |
| **EXCLUSIVE** | **EXCLUSIVE**  | 允许读        | 已经在 EXCLUSIVE                               |
#### 行为差异
```cpp
// 连接 1：DEFERRED
SQLite3Transaction txn1(db1, false, SQLite3Transaction::DEFERRED);
// txn1.begin() → 没获取锁（UNLOCKED）
txn1.execute("SELECT * FROM user");  // 升级到 SHARED
txn1.execute("UPDATE user SET ..."); // 升级到 RESERVED → 等待获取 EXCLUSIVE

// 连接 2：也在写
SQLite3Transaction txn2(db2, false, SQLite3Transaction::IMMEDIATE);
// txn2.begin() → 获取 RESERVED 锁
// 如果 txn1 已经是 RESERVED，txn2 的 BEGIN 会失败 → SQLITE_BUSY
```
**DEFERRED 的问题：**
```cpp
// 连接 1                          // 连接 2
BEGIN DEFERRED                     BEGIN DEFERRED
  ← 都处于 UNLOCKED，都成功
SELECT ...                          SELECT ...
  ← 都升级到 SHARED，都成功
UPDATE ...
  ← 升级到 RESERVED，成功
                                     UPDATE ...
                                       ← 升级到 RESERVED → 失败！
                                         因为已有 RESERVED
                                       ← SQLITE_BUSY！
```

两个 DEFERRED 事务都先读后写时，会死锁——互相等待对方释放 RESERVED。
**IMMEDIATE 解决了这个问题：**
```cpp
// 连接 1                          // 连接 2
BEGIN IMMEDIATE                    BEGIN IMMEDIATE
  ← 获取 RESERVED，成功              ← 获取 RESERVED → 失败！
                                     因为连接 1 已有 RESERVED
                                   ← SQLITE_BUSY，重试
SELECT ...                          （等待）
UPDATE ...
COMMIT
                                     BEGIN IMMEDIATE → 成功
```
IMMEDIATE 让写冲突在 `BEGIN` 时就暴露，而不是在 `UPDATE` 时才暴露。**早点失败比晚点失败好。**
#### 和 MySQL 事务的对比

|              | MySQL (InnoDB)   | SQLite3                                  |
| ------------ | ---------------- | ---------------------------------------- |
| 事务模式         | `autocommit` 开/关 | DEFERRED / IMMEDIATE / EXCLUSIVE         |
| 写冲突检测        | 行级锁，`BEGIN` 时无锁  | 文件级锁，`BEGIN` 时决定锁级别                      |
| 死锁           | InnoDB 自动检测回滚    | SQLite3 返回 `SQLITE_BUSY`，调用方重试           |
| 并发写          | ✅ 多个连接可同时写不同行    | ❌ 同一时间只有一个连接能写                           |
| `BEGIN` 失败条件 | 几乎不失败            | DEFERRED 从不失败；IMMEDIATE/EXCLUSIVE 可能立即失败 |

**MySQL** 是行级锁，多个连接可以同时写不同的行，事务冲突在提交时检测。**SQLite3** 是文件级锁，整个数据库文件同一时间只能有一个写操作。

**生产中的常见问题：** 多线程/多进程并发写 SQLite3 时，如果用 `DEFERRED`，两个事务先读后写会互相阻塞返回 `SQLITE_BUSY`。解决方案是用 `IMMEDIATE`，让写冲突在 `BEGIN` 时就暴露，然后重试 `BEGIN`。
```cpp
// 推荐的并发写模式（伪代码）：
for (int i = 0; i < 3; ++i) {
    SQLite3Transaction txn(db, false, SQLite3Transaction::IMMEDIATE);
    if (txn.begin()) {        // 失败就立即知道
        txn.execute("UPDATE ...");
        txn.commit();
        break;
    } else {
        // 等一会儿重试
        usleep(1000);
    }
}
```
## Redis 接口层

### 概览

| 类 | 作用 |
| ---------------- | -------------------------------------------------------------------------- |
| IRedis | 抽象基类，定义 `cmd()` 接口 + name/passwd/type |
| ISyncRedis | 同步 Redis 抽象，在 IRedis 上扩展 `connect/reconnect/appendCmd/getReply` |
| Redis | 单机 Redis（封装 `redisContext`），同步阻塞 |
| RedisCluster | Redis 集群（封装 `redisClusterContext`），同步阻塞 |
| FoxRedis | 单机异步 Redis（封装 `redisAsyncContext` + libevent），**协程异步转同步** |
| FoxRedisCluster | 集群异步 Redis（封装 `redisClusterAsyncContext` + libevent），**协程异步转同步** |
| RedisManager | 连接池 + 自动初始化 |
| RedisUtil | 静态工具类，提供全局快捷调用 |

### FoxRedis 异步→协程模式

（待学习）

# 数据结构模块
## array
exist 函数默认 array 已经排序并使用二分法检查是否存在，实现有问题。浅封装没价值
## btyearray
### 数据结构
ByteArray 的内存是一个单向链表，每个节点是固定大小（m_baseSize，默认 4KB）的内存块。
```cpp
  ByteArray 内存结构：
  m_root → ┌──────────┐    next → ┌──────────┐    next → ┌──────────┐
           │ ptr      │           │ ptr      │           │ ptr      │
           │ size=4096│           │ size=4096│           │ size=4096│
           │ ──────── │           │ ──────── │           │ ──────── │
           │ data...  │           │ data...  │           │ (空闲)   │
           └──────────┘           └──────────┘           └──────────┘
           ↑ m_cur                                    ↑ m_capacity 位置
```
- m_root     → 链表头节点，永远指向第一个 Node（构造后不变）
- m_cur      → 当前操作节点，write/read 时随 m_position 前进，跨节点时跳到 next
- m_position → 当前读写位置（累计字节偏移量，从 0 开始）
- m_capacity → 所有 Node 的容量总和（总字节数）
- m_size     → 已写入的有效数据长度（总字节数）
### 代码实现
`iovec` 是 POSIX 标准结构体（`<sys/uio.h>`）：
```cpp
struct iovec {
    void  *iov_base;  // 缓冲区起始地址
    size_t iov_len;   // 缓冲区长度
};
```
**它是零拷贝系统调用 `readv` / `writev` 的输入参数。** 这两个系统调用可以一次性读写多个不连续的内存块。
```cpp
// 普通 write：数据必须在连续内存中
write(fd, buf, len);    // buf 必须是连续地址

// writev：数据可以分散在多个内存块中
struct iovec iov[2] = {
    {.iov_base = header, .iov_len = 4},
    {.iov_base = body,   .iov_len = 100}
};
writev(fd, iov, 2);     // 一次系统调用发送两块不连续内存
```
**ByteArray 的数据在链表节点中不连续。** 如果要通过 socket 发送，有两种选择：
```
方案 A：先拷贝到连续缓冲区再 send（有拷贝开销），并且是多次调用
  ByteArray → memcpy → [连续 buf] → send(fd, buf, len, 0)
方案 B：用 iovec + writev（零拷贝）
  ByteArray → iovec[] → writev(fd, iovec, n)
                          ↑ 一次系统调用发送所有节点数据
```

`getReadBuffers` 把 ByteArray 中 `[m_position, m_position+len)` 区间的数据映射成 `iovec` 数组 `getWriteBuffers` 类似，返回可写入的空闲缓冲区 `iovec`，供外部直接写入（从 socket `readv` 直接读入 ByteArray）。