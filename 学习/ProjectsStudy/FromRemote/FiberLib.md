---
参考: https://github.com/youngyangyang04/coroutine-lib.git
---
# 线程
## 代码架构
### 分两类线程
- 系统主线程：程序启动时 OS 自动创建，main 函数运行在这上面，没有对应的 Thread 对象
- Thread 类线程：pthread_create 创建，有对应的 Thread 对象
所以为了之后创建协程时协程调度器需要区分不同的线程，知道自己在哪一个线程中，程序通过 main 函数启动，这个线程会被 OS 接管，所以创建
```cpp
static thread_local Thread*  t_thread      = nullptr;   // 指向当前线程的 Thread 对象
static thread_local string   t_thread_name = "UNKNOWN";  // 当前线程的名字
```
每个线程需要自己的名字和 Thread 指针。thread_local 让每个线程有独立副本，互不干扰。
进程->多个线程，切换需要系统调用，
### pthread 库使用
各种 pthread_XXX 函数用来操作 `pthread_t` 类型，pthread_t 是 POSIX 线程库的线程标识符类型，本质是一个不透明类型（通常是 unsigned long 或结构体）。不能直接拿它当整数用，必须通过 API 操作。

| API                                            | 作用                                              |
| ---------------------------------------------- | ----------------------------------------------- |
| pthread_create(&tid, attr, start_routine, arg) | 创建线程，tid 输出线程 ID，start_routine 是入口函数，arg 传给入口函数 |
| pthread_join(tid, &retval)                     | 阻塞等待线程 tid 退出，retval 接收线程返回值                    |
| pthread_detach(tid)                            | 分离线程，退出后自动回收资源（不可 join）                         |
| pthread_self()                                 | 返回当前线程的 pthread_t                               |
| pthread_setname_np(tid, name)                  | 给线程设置名字（_np = non-portable，仅 Linux）             |
这些函数大多返回错误码，表示执行状态
- EAGAIN：资源不足（线程数达到上限）
- EINVAL：参数无效（比如 attr 有问题）
- EPERM：权限不足
### 逻辑设计
```cpp
static thread_local Thread*		t_thread	 = nullptr;
static thread_local std::string t_threadName = "UNINIT";

Thread::Thread(const std::function<void()>& callback, const std::string name) : _callback(callback), _name(name){
    int rt = pthread_create(&_thread, nullptr, &Thread::run, this);
	if(rt){
        std::cerr << "pthread_create thread fail, rt = " << rt
                  << " name = " << name;
		throw std::logic_error("pthread_create error");
	}
    _semaphore.wait();
}

Thread::~Thread() {
	if(_thread) {
		pthread_detach(_thread);
		_thread = 0;
	}
}

void* Thread::run(void* arg) {
	Thread* thread = (Thread*)arg;
	t_thread	   = thread;
	t_threadName   = thread->_name;
	thread->_id	   = getThreadId();
	pthread_setname_np(pthread_self(), thread->_name.substr(0, 15).c_str());
	std::function<void()> callback;
	callback.swap(thread->_callback);
	thread->_semaphore.signal();
	callback();
	return 0;
}
```
```md
主线程 (main)                         新线程 (pthread_create 创建)
│                                      │
① Thread 构造函数开始执行                │
② pthread_create(&m_thread, ...) ──── 创建新线程 → ③ run(arg) 开始执行
④ m_semaphore.wait() [阻塞]            ⑤ 设置 t_thread / t_thread_name (TLS)
                                        ⑥ m_id = gettid()
                                        ⑦ pthread_setname_np(...)
                                        ⑧ m_semaphore.signal() [唤醒主线程]
⑨ 构造函数返回 ◄─────── 唤醒 ────────── ⑩ cb() 执行真正的任务
```
- 需要注意两个 thread_local 变量主线程和创建的线程都有一份独立副本，不要看代码中只有一份
- `thread_local` 关键字一旦用于标记变量，那么在任何线程中都**保有变量符号，并在初次访问符号时初始化值**，这保证了放在局部作用域的 `thread_local` 变量只有在进入局部作用域时才可见（调用函数等操作）
- `pthread_create` 的签名为:
```cpp
int pthread_create(pthread_t *__restrict__ __newthread, 
					const pthread_attr_t *__restrict__ __attr, 
					void *(*__start_routine)(void *), 
					void *__restrict__ __arg) noexcept(true)
```
线程的任务函数指针 `__start_routine` 参数必须是 `std::function<void(void*)>` 的，且不能是类非静态成员函数，因为这需要传入 this 指针作为参数。
`__arg` 是 `void*` 类型，用来表示 `__start_routine` 的参数，**如果需要传入多个参数一般使用结构体封装**。
- 回调函数设置为 `void()` 类型，这种设计有两种原因:
	- 线程自己的信息通过 Thread 的静态方法获取，不需要参数传递（`Thread::getThis()->getId()/getName()`）
	- 线程任务需要的外部数据通过 lambda 捕获得到，**不过这就需要手动控制生命周期**长于线程，如果允许回调函数接受参数，同样需要控制参数的生命周期
# 协程
参考（主要介绍 ucontext 工具库）
- https://www.chiark.greenend.org.uk/~sgtatham/coroutines.html
- [一个“蝇量级” C 语言协程库 by 左耳朵耗子](http://coolshell.cn/articles/10975.html) 
- [ucontext-人人都可以实现的简单协程库-阿里云开发者社区 (aliyun.com)](https://developer.aliyun.com/article/52886)
较为硬核的汇编语言拆解协程机制
- https://zhuanlan.zhihu.com/p/347445164
- https://jasonkayzk.github.io/2022/06/03/%E6%B5%85%E8%B0%88%E5%8D%8F%E7%A8%8B/
- https://mthli.xyz/stackful-stackless/
- https://mthli.xyz/coroutines-in-c/ 
### 协程概念
协程 = 用户态线程。线程的调度由内核控制（你无法决定它什么时候被切换出去），协程的调度由程序自己控制（切换点在代码中明确写出）。
协程是一种执行过程中可以 **yield（暂停）** 和 **resume（恢复）** 的子程序。也可以说，**协程就是函数 + 函数运行状态的组合**。普通函数一旦开始执行，就会一直运行到结束，中间不会中断，更不会执行到一半跑去执行别的函数。
但协程不同：我们会先为协程绑定一个入口函数，并且可以在函数执行的**任意位置暂停**，转而去执行其他函数，之后再回到暂停点继续执行。因此说协程是函数与其运行状态的结合 —— 协程会绑定入口函数，并完整记录函数的运行状态。
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
### 协程上下文
实现用户态切换的关键是: **协程上下文**。当协程执行 yield 暂停时，上下文会记录当前暂停的位置；当执行 resume 恢复时，就从这个位置继续运行
协程的优势： 切换不需要系统调用（不进内核），只是保存/恢复 CPU 寄存器，开销比线程小 1-2 个数量级。一个线程可以管理成千上万个协程。

此外，协程的 yield 和 resume 完全由**应用程序自身控制**，这一点和线程不同。线程的创建、运行与调度由操作系统内核管理；而协程的运行与切换由用户态程序控制，因此协程也被称为**用户态线程**。
**单线程下，协程的 resume 和 yield 一定是同步配对的**。一个协程执行 yield 暂停，必然对应另一个协程执行 resume 恢复，因为线程不能没有执行主体。
意思是**当前线程要么在主协程下工作，要么在其他协程下工作**，未 sleep 的情况下不会空转。

> [!info] C++20 无栈协程
>   编译器在编译期分析出协程中哪些变量在 yield 之后还需要，把它们放到堆上分配的一个帧对象里，而不是放在系统栈上。这样就不需要预分配一个栈了  ——但代价是协程内部不能有深层嵌套调用（因为嵌套调用的栈帧编译器无法分析）。
> 
> |      | 有栈协程（本项目） | 无栈协程（C++20）         |
> | :--- | :-------- | :------------------ |
> | 内存   | 预分配栈，可能浪费 | 按需分配帧，紧凑            |
> | 嵌套调用 | 随意        | 有限制（不能 yield 嵌套函数中） |
> | 切换开销 | ~50ns     | ~5ns                |
> | 实现   | 库即可实现     | 需要编译器支持             |

### 协程的分类
#### 对称协程 
对称协程对称协程允许协程之间直接相互调用和切换，控制流（只有拿到执行权的协程才可以执行）可以在多个协程之间自由转移，类似于函数调用。每个协程可以**显式决定将控制权转移到哪个协程**。
- 自由切换：协程可以显式地将控制权转移到其他协程。
- 平等地位：所有协程在调度时**没有**层级关系，彼此平等。
- 复杂性：因为可以任意切换协程，可能会让程序逻辑变得复杂。
#### 非对称协程
非对称协程会出现类似堆栈的调用方与被调用方关系，也就是形成了层级结构。具体来说：A 调用了 B，B 作为被调用方，在执行 yield 时会把控制权交还给调用它的 A，而不是其他协程。
只有主协程可以决定"下一个跑谁"，主协程 = 调度器
![[Pasted image 20260617210352.png]]
非对称协程会出现类似堆栈的调用方与被调用方关系，也就是形成了层级结构，意味着协程拥有一个“隐式的目标”。当它 `yield` 时，控制流必定回到上一层。**C++原生的协程是非对称的**，C++20标准只支持非对称。不过可以通过标准库的 `std::coroutine_handle` 配合调度器，在**用户态模拟**出对称协程的效果，但语言层面没有原生对称关键字。
#### 对称协程 vs 非对称协程（控制流的视角）
**对称协程：**
- 复杂多任务协作：多个任务或子任务需要频繁、直接地相互交互，共同协同完成一个目标。
- 状态机驱动系统：多个状态需要彼此直接切换，减少中间调度步骤。
- 需要频繁切换的计算密集型任务：适合高性能场景，例如游戏开发，一个任务可以主动切换到另一个。
**非对称协程：**
- IO 密集型应用：需要等待大量 IO 事件完成，例如 Web 服务器的请求处理、数据库读写。
- 任务调度：在多线程或任务调度框架中，协程由中心调度器统一调度，例如 Web 框架中的请求 / 响应循环。
- 简单的生产者 - 消费者模型：例如异步事件循环中，非对称协程的启动、暂停、恢复都由调度者统一控制，结构清晰，避免协程之间复杂的相互依赖。

| 维度 | 非对称（本项目） | 对称 |
| --- | --- | --- |
| 控制流 | 星型（中心化） | 网状（去中心化） |
| 调度逻辑 | 集中在主协程 | 分散在各协程 |
| 实现复杂度 | 简单 | 较复杂 |
| 可维护性 | 高（调度路径清晰） | 低（跳转关系混乱） |
| 典型代表 | sylar, libco | Lua 协程，Windows Fiber |
对称协程更灵活，非对称协程更简单。
- 对称协程不仅需要绑定入口函数运行，还要显式指定下一个要切换的协程，**相当于每个协程都承担了部分调度器的工作**。实现较为困难。
- 非对称协程可以依靠专门的调度器统一负责调度，每个协程只需要执行自己的入口函数，执行结束或 yield 时把运行权交回调度器，再由调度器选择下一个要执行的协程即可。
#### 有栈协程
**本质**：每个协程拥有一个**独立的、完整的调用栈**（通常大小固定，如几 MB）。
**原理**：类似于用户态线程。切换协程时，需要保存当前 CPU 的所有寄存器（包括栈指针 RSP/SP），并将栈指针切换到新协程的私有栈空间。
- **特点**：
    - 可以在协程内部的**任意深层嵌套函数**中挂起（例如：`A调用B，B调用C，在C中yield`），因为整个栈都被保存了。
    - 切换开销较大（需要保存大量寄存器，且涉及内存拷贝/栈切换）。
    - 内存占用较高（每个协程预分配固定栈空间，容易浪费或溢出）。
- **C++代表库**：`Boost.Context`、`ucontext`（已废弃）、腾讯的 `libco`。
如何存储这些信息到栈中呢？这就引出*独立栈和共享栈*做法
- 要想暂停协程后还能够恢复过来，那么协程暂停时，整个调用链的栈帧都必须被冻结保存。因为恢复时要精确地从暂停点继续执行——局部变量、函数调用链、返回地址
- 要想保存这些信息，那么就需要一块专门的内存，这就引出了两种方法:
	- 每个协程都有独立的栈（必须设置地很小且协程数很少，否则 OS 栈溢出），并在栈底设置哨兵页检测栈溢出（SIGSEGV），触发溢出**能被操作系统检测到但是无法优雅恢复**
	- libco 使用*共享栈*做法，所有协程共用一个物理栈，yield 时把自己的栈内容拷贝到堆上保存，resume 时再拷贝回来，由于是**固定大小的顺序内存空间无法随意扩容且协程恢复需要恢复之前的数据要从栈中拷贝回去**，所都会较上一种慢点
- 这里的**栈不是线程的系统栈**，也是通过 `malloc` 分配得到的一块普通堆内存，swapcontext 切换协程时，CPU 的 RSP（栈指针寄存器）被改写到这个堆内存上。这一个操作是**主协程在进行调度时的操作，是需要操作系统栈的**，任一时刻只有一个协程在工作，所以系统栈中只会有一个 RSP 指针之象征在工作的协程，只占用一个指针大小
#### 无栈协程
- **本质**：协程**不拥有独立的调用栈**。它的局部变量和挂起状态被存储在**编译器生成的匿名对象（即协程帧，Coroutine Frame）**中，该对象位于堆上。
- **原理**：编译器执行**有状态机转换**。每当遇到 `co_await` 或 `co_yield`，编译器将当前函数拆分成多个片段，局部变量变为该帧对象的成员变量。恢复执行时，直接跳转到当前 `await_suspend` 之后的指令地址，**栈指针依旧使用当前线程的栈**。
- **特点**：
    - **挂起位置受限**：只能在协程**函数体最顶层**挂起。如果协程调用了普通子函数 `B`，在 `B` 内部无法挂起（因为 `B` 没有保存协程帧的指针）。
    - **极致的轻量**：切换开销几乎为零（仅需保存几个必要的寄存器，主要是恢复指令地址），内存分配仅取决于局部变量大小（动态计算），无浪费。
    - **性能极高**：这是 C++20 选择无栈协程的根本原因（追求零开销抽象）。
#### 有栈协程 vs 无栈协程（内存布局视角）
指协程**状态数据（局部变量、栈帧）的存储方式**。这是实现原理上的根本区别。
### 协程与多核
**单线程 + 多协程 = 无法利用多核。** 因为操作系统调度的是线程，不是协程。
```
CPU 核心 0: ┌─线程1: 协程A─协程B─协程A─协程C─┐  (串行切换)
CPU 核心 1: │         空闲                    │  (浪费)
```
协程切换是用户态控制流转移，OS 感知不到协程的存在，也就不会把线程分配到不同核心。单线程永远只在一个核心上跑。
**多核利用 = 多线程 + 每个线程内跑协程池：**
```
核心 0: ┌─线程1: 协程A─协程B─协程A─┐
核心 1: ┌─线程2: 协程C─协程D─协程C─┐
```
本项目第3阶段将调度器与线程池结合，就是这个原因——每个工作线程跑自己的调度循环，OS 分配到不同核心。

> [!note]
> 一个线程**可能在任何一个 CPU 上运行**，而协程只能在一个线程上运行，线程只有一个入
> 口，那就是启动函数，**而协程的入口可以是启动函数，也可以是启动函数中任意一个上次被挂起的点**
> 线程调度还会产生时序上的不确定性。而对于协程来说，“挂起”的概念只不过是转让代码执行权并调用另外的协程，待到转让的协程告一段落后重新得到调用并从挂起点“唤醒”，这种协程间的调用是逻辑上可控的，时序上确定的，可谓一切尽在掌握中

### ucontext 上下文操作
`<ucontext.h>` 定义了两个类型和四个函数，用于在用户态实现协程上下文切换。
#### `ucontext_t` 结构
```cpp
typedef struct ucontext {
    struct ucontext *uc_link;    // 当前上下文执行完后，自动恢复哪个上下文
    sigset_t         uc_sigmask; // 阻塞的信号集合
    stack_t          uc_stack;   // 该上下文使用的栈空间
    mcontext_t       uc_mcontext; // 机器相关的上下文（寄存器值等）
    ...
} ucontext_t;
```
- **uc_link**：指向"后继上下文"。当 `makecontext` 创建的函数执行完毕后，系统自动 `setcontext(uc_link)`。如果 `uc_link == NULL`，线程退出。
- **uc_stack**：指定栈空间。包含 `ss_sp`（栈底指针）、`ss_size`（栈大小）、`ss_flags`。必须提前 `malloc` 分配。**这个栈用来存储这个协程中执行的函数等压栈操作产生的栈帧**
- **uc_mcontext**：保存 CPU 所有寄存器的值（RSP、RIP、RBX 等），由 `getcontext` 写入、`setcontext` 恢复。**不透明**，不能直接读写。
#### `mcontext_t` 类型
机器相关的上下文表示，封装了所有通用寄存器、指令指针、栈指针等。不同 CPU 架构下布局不同，不需要关心内部结构，通过四个函数间接操作。
#### 四个函数
```cpp
int getcontext(ucontext_t *ucp);
```
把当前 CPU 寄存器的值全部保存到 `ucp` 中。成功返回 0。
```cpp
int setcontext(const ucontext_t *ucp);
```
把 `ucp` 保存的上下文恢复到 CPU。**如果成功，不返回**——CPU 直接跳到 `ucp` 记录的位置执行。如果 `ucp` 是通过 `makecontext` 创建的，则跳到入口函数。
```cpp
void makecontext(ucontext_t *ucp, void (*func)(), int argc, ...);
```
- 必须在 `getcontext` 之后调用（先 get 拿到初始上下文，再修改）
- 必须先设置好 `ucp->uc_stack` 和 `ucp->uc_link`
- 将 `ucp` 修改为：当被 `setcontext`/`swapcontext` 激活时，执行 `func(argc, ...)`
- func 执行完毕后，自动 `setcontext(uc_link)`；uc_link 为 NULL 则线程退出，不会自动设置 uc_link 为 NULL
```cpp
int swapcontext(ucontext_t *oucp, ucontext_t *ucp);
```
原子操作：先 `getcontext(oucp)` 保存当前上下文，再 `setcontext(ucp)` 切换到新上下文。
#### 经典不使用循环实现死循环
```cpp
void func1() {
    puts("In func1");
}

int main() {
    ucontext_t context;
    getcontext(&context);
    context.uc_stack.ss_sp = malloc(8192);
    context.uc_stack.ss_size = 8192;
    context.uc_link = NULL;
    makecontext(&context, func1, 0);
    setcontext(&context);
    puts("This will not be printed");
    puts("Hello World");
    return 0;
}
```
- getcontext 给当时线程的工作协程（main）在执行到这里的时刻拍了快照 A，记录着：下一条指令是 puts("This will not...")
- makecontext 本来是用于[[#简单协程库结构|创建一个新的协程]]，这里用来修改保存的上下文，也就是快照 A
- setcontext 用于把 `ucp` 保存的上下文恢复到 CPU，本来这里应该恢复到另一个协程的，这里将 getcontext 运行时保存的上下文，所以又回到了 main 第二行，puts 永远不执行
#### 完整调用链
对于这样一段代码
```cpp
#include <ucontext.h>
#include <stdio.h>

void func1(void * arg) {
    puts("1");
    puts("11");
    puts("111");
    puts("1111");

}
void context_test() {
    // void* stack = char[1024 * 128];
    void* stack = malloc(1024*128);
    ucontext_t child,main;

    getcontext(&child); //获取当前上下文
    child.uc_stack.ss_sp = stack;//指定栈空间
    // child.uc_stack.ss_size = sizeof(stack);//指定栈空间大小(栈上分配协程栈)
    child.uc_stack.ss_size = 1024 * 128;
    child.uc_stack.ss_flags = 0;
    child.uc_link = &main;//设置后继上下文
    
    makecontext(&child,(void (*)(void))func1,0);//修改上下文指向func1函数
    swapcontext(&main,&child);//切换到child上下文，保存当前上下文到main
    free(stack);
    child.uc_stack.ss_sp = nullptr;
    puts("main");//如果设置了后继上下文，func1函数指向完后会返回此处
}

int main() {
    context_test();
    return 0;
}
```
1. getcontext 设初始化了 child 中的各项内容，保存 CPU 寄存器中的值到 ucontext 结构体中的 mcontext_t 类型的 uc_mcontext 成员变量中。
2. 然后手动设置了其他内容，比如协程栈的大小，分配空间和后继上下文
3. 然后再设置makecontext，表示当被 `setcontext` / `swapcontext` 激活时，执行 func1 函数。调用 makecontext 时，当前线程还在主协程（main），没有切换到 child 协程
4. 调用 swapcontext 之后，保存当前协程状态到 main 变量中，然后将当前协程切换到 child 协程，此时 main 协程的下一步就是输出"main"到控制台，只是函数停在了这一步
5. 然后 child 协程进入 func1 函数执行，执行完毕后 child 设置了后继上下文（`uc_link != NULL`），所以 child 协程结束，func1 函数返回**导致 uc_stack 中为 func1 函数和其中的 4 各 puts 函数准备的栈空间内这些函数栈帧被弹出，现在其中存储的是垃圾数据**，访问会导致 UB
6. 在 context_test 返回之前，child，main 结构体中还保存了值，还是能够访问的，但在调用 free 后，栈空间指针被悬空，为保证安全需设置为 nullptr
> [!notice] 协程之间的工作可以看作一种"控制权的争夺"
> swapcontext 函数执行时，完成了当前线程应该在哪一个协程上工作的控制权交接，从 main 中转交到 child（这两个概念是抽象出来的，什么名字都可以），又因为线程没有 sleep 或者阻塞所以必须在工作，那么 main 工作到快要执行 `puts(main)` 了被拿走占用线程工作的资格， child 的 `func1` 开始工作

> [!warning] 注意不要在系统栈中分配协程栈空间
> 这样很快会导致栈空间耗尽，参考[[#有栈协程]]

### 简单协程库结构
参考 https://github.com/Winnerhust/uthread/blob/master
```cpp
#define DEFAULT_STACK_SZIE (1024*128)
#define MAX_UTHREAD_SIZE   1024

enum ThreadState{FREE,RUNNABLE,RUNNING,SUSPEND};

struct schedule_t;
typedef void (*Fun)(void *arg);
typedef struct uthread_t {
    ucontext_t ctx;
    Fun func;
    void *arg;
    enum ThreadState state;
    char stack[DEFAULT_STACK_SZIE];
}uthread_t;

typedef struct schedule_t {
    ucontext_t main;
    int running_thread;
    uthread_t *threads;
    int max_index; // 曾经使用到的最大的index + 1

    schedule_t():running_thread(-1), max_index(0) {
        threads = new uthread_t[MAX_UTHREAD_SIZE];
        for (int i = 0; i < MAX_UTHREAD_SIZE; i++) {
            threads[i].state = FREE;
        }
    }
    
    ~schedule_t() {
        delete [] threads;
    }
}schedule_t;
```
协程结构体（uthread_t）用 ucontext 保存上下文，func 和 args 用来保存协程要执行的任务，分配栈空间给协程（一般不这么做）
调度器（schedule_t）包括
- 主函数的上下文 main
- 当前调度器拥有的所有协程的 vector 类型的 threads，
- 指向当前正在执行的协程的编号 running_thread.如果当前没有正在执行的协程时，`running_thread=-1`
```cpp
void uthread_resume(schedule_t &schedule , int id) {
    if(id < 0 || id >= schedule.max_index){
        return;
    }
    uthread_t *t = &(schedule.threads[id]);
    if (t->state == SUSPEND) {
        swapcontext(&(schedule.main),&(t->ctx));
    }
}

void uthread_yield(schedule_t &schedule) {
    if(schedule.running_thread != -1 ){
        uthread_t *t = &(schedule.threads[schedule.running_thread]);
        t->state = SUSPEND;
        schedule.running_thread = -1;
        swapcontext(&(t->ctx),&(schedule.main));
    }
}

void uthread_body(schedule_t *ps) {
    int id = ps->running_thread;
    if(id != -1){
        uthread_t *t = &(ps->threads[id]);
        t->func(t->arg);
        t->state = FREE;
        ps->running_thread = -1;
    }
}

// 返回创建的线程在schedule中的编号。
int uthread_create(schedule_t &schedule,Fun func,void *arg) {
    int id = 0;    
    for(id = 0; id < schedule.max_index; ++id ){
        if(schedule.threads[id].state == FREE){
            break;
        }
    }
    if (id == schedule.max_index) {  // 这里是一个危险设计，因为max_index可能会超过MAX_THREAD_SIZE溢出，需加边界检查
        schedule.max_index++;
    }
    uthread_t *t = &(schedule.threads[id]);
    t->state = RUNNABLE;
    t->func = func;
    t->arg = arg;
    getcontext(&(t->ctx));
    t->ctx.uc_stack.ss_sp = t->stack;
    t->ctx.uc_stack.ss_size = DEFAULT_STACK_SZIE;
    t->ctx.uc_stack.ss_flags = 0;
    t->ctx.uc_link = &(schedule.main);
    schedule.running_thread = id;
    
    makecontext(&(t->ctx),(void (*)(void))(uthread_body),1,&schedule);
    swapcontext(&(schedule.main), &(t->ctx));
    
    return id;
}

int schedule_finished(const schedule_t &schedule) {
    if (schedule.running_thread != -1){
        return 0;
    }else{
        for(int i = 0; i < schedule.max_index; ++i){
            if(schedule.threads[i].state != FREE){
                return 0; // 有协程还在挂起状态，还没与全部执行完
            }
        }
    }
    return 1; // 全部执行完
}
```
一个非对称协程经典实现

