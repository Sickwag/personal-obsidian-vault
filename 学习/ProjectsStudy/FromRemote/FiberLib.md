---
参考: https://github.com/youngyangyang04/coroutine-lib.git
---
# 线程
## 代码架构
### 分两类线程
- 系统主线程：程序启动时由 OS 自动创建，main 函数运行在这上面，没有对应的 Thread 对象
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
