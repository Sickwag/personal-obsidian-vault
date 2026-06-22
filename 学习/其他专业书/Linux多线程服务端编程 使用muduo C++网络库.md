---
created: 2026-06-21
书籍参考: 同名书籍
---
# 第 1 部分 C++多线程系统编程
## 第 1 章线程安全的对象生命期管理
当一个对象能被多个线程同时看到时，那么对象的销毁时机就会变得模糊不清，引出了核心问题:
- 在即将析构一个对象时，从何而知此刻是否有别的线程正在执行该对象的成员函数？
- 如何保证在执行成员函数期间，对象不会在另一个线程被析构？
- 在调用某个对象的成员函数之前，如何得知这个对象还活着？它的析构函数会不会碰巧执行到一半？
### 对象构造
对象构造要做到线程安全，唯一的要求是在构造期间不要泄露 this 指针，即
- 不要在构造函数中注册任何回调，即便在构造函数的最后一行也不行。
- 也不要在构造函数中把 this 传给跨线程的对象
构造函数执行期间对象还没有完成初始化，如果 this 被泄露（escape）给了其他对象（其自身创建的子对象除外），那么别的线程有可能访问这个半成品对象
所以多线程下，二段式构造——即构造函数+ `initialize()` 是常用解法，那么构造函数不必主动抛异常，调用方靠 initialize()的返回值来判断对象是否构造成功，这能简化错误处理
### 对象析构
多线程编程中需要尽量避免竞态条件，让每个成员函数的临界区不重叠。有一个隐含条件：**成员函数用来保护临界区的互斥器本身必须是有效的**。而析构函数破坏了这一假设，它会把 mutex 成员变量销毁掉。
![[Pasted image 20260622115648.png]]
- 成员变量会先于被它保护的成员被析构。当其他线程试图在对象析构期间访问这些成员时，mutex 可能已被销毁，导致锁操作崩溃（如访问野指针）
- 如其他对象正在调用该类的其他成员函数，并且成员函数同样需要这把锁，会引发死锁
这说明了作为 class 数据成员的 MutexLock 只能用于同步本 class 的其他数据成员的读和写，它不能保护安全地析构

> [!note] swap/operater=等类似的操作也有可能引发死锁
> ```cpp
> void swap(Counter& a, Counter& b) {
>     MutexLockGuard aLock(a.mutex_); // potential dead lock
>     MutexLockGuard bLock(b.mutex_);
>     int64_t value = a.value_;
>     a.value_ = b.value_;
>     b.value_ = value;
> }
> // 如果线程A执行swap(a, b);而同时线程B执行swap(b, a);, 就有可能死锁。
> Counter& Counter::operator=(const Counter& rhs) {
>     if (this == &rhs)
>         return *this;
> 
>     MutexLockGuard myLock(mutex_); // potential dead lock
>     MutexLockGuard itsLock(rhs.mutex_);
>     value_ = rhs.value_; // 改成 value_ = rhs.value() 会死锁
>     return *this;
> }
> ```

