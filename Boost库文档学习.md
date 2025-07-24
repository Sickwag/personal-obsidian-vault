# Boost.SmartPtr：智能指针库
## 简介
智能指针是存储指向动态分配（堆）对象的指针的对象。它们的行为很像内置 C++ 指针，除了它们会在适当的时候自动删除指向的对象。智能指针在面对异常时特别有用，因为它们确保动态分配对象的正确销毁。它们也可以用于跟踪由多个所有者共享的动态分配对象。
## scoped_ptr&scope_array：作用域对象所有权
### 描述
- `scoped_ptr` 类模板存储指向动态分配对象的指针。（动态分配对象使用 C++ `new` 表达式分配。）指向的对象保证会被删除，无论是在 `scoped_ptr` 销毁时，还是通过显式的 `reset` 删除。
- 仅在当前作用域内保留所有权。因为它是不可复制的，所以对于不应复制的指针，它比 `shared_ptr` 更安全。
- `scoped_ptr` 很简单，每个操作都与内置指针一样快，没有比内置指针更多的空间开销
- scoped_ptr = 一种“哑巴”式独占指针：生在一个 `{ }` 块儿里，死也在一块儿，绝不把资源交给别人。它只想保护那段内存不出事，别的什么都不管。

### 用法
用于解决三个 C++常见 bug
1. new 之后忘记 delete —— 内存泄漏 
2. 多个地方都 delete —— 重复释放 
3. 一个函数里异常提前返回——delete 语句被跳过
#### Pimpl（“指针实现”/“隐藏实现”）
.h 文件里放个 `boost::scoped_ptr<Impl>` 即实现 + 内存管理一步到位，省去析构函数手写 delete。
```cpp
// Foo.h
class Foo {
    struct Impl;
    boost::scoped_ptr<Impl> pImpl;   // 自动释放，头文件不用 include 常见库
public:
    Foo();
    ~Foo();
};
```
#### 定死指针和指针指向的对象
```cpp
const boost::scoped_ptr<int> p(new int(5));
```
这表示“指针本身不能改指向，指向的对象也不能改值”，相当于“双重锁”。  
但注意：const 只能管住对象内容，管不住裸指针本身被 `reset()` ——scoped_ptr 的 `reset()` 是成员函数，即使对象是 const 也能调（因为 `reset()` 不是 const 成员）。想彻底锁死，需要 `const boost::scoped_ptr<const int>`。
```cpp
struct LogFile {
    boost::scoped_ptr<FILE, file_closer> fp_;  // file_closer 是自定义 deleter
    LogFile(const char* path) : fp_(fopen(path, "a")) {
        if (!fp_) throw std::runtime_error("open failed");
    }
    void write(const char* msg) { fputs(msg, fp_.get()); fflush(fp_.get()); }
};
```
#### 注意事项
- scoped_ptr 接管一块你已用 new 分配的堆内存，析构时自动 delete；它禁止拷贝/赋值，但仍可用`reset()`换指向。只保证 **指针本身** 在构造时拿到一个有效地址，至于地址指向的对象可以不初始化
- `new` 在哪里还得要自己手动写的，scoped_ptr 只是负责 **delete**。
- `scoped_array` 没有 size()/push_back()/迭代器等 vector 的任何接口；它就是 **裸数组 + delete[]** 的 RAII 包装。
- `scoped_array<int>` 相当于“**固定长度、禁止拷贝、禁止转移**的动态数组”，功能上更接近 `std::unique_ptr<int[]>`，而不是 vector。
- C++11 起有了 `std::unique_ptr`，功能更强（能 move，有自定义 deleter），建议新项目直接使用 unique_ptr。老代码里你能看到大量 scoped_ptr，但新代码优先 unique_ptr 即可。
### 成员
#### reset（两者都有）
```cpp
void reset(T * p = 0) noexcept;
```
删除存储指针指向的数组，然后存储 `p` 的**副本**，`p` 必须已通过 C++ `new[]` 表达式分配或为 0。 `T` 必须是完整的，并且对存储指针执行 `delete[]` 不得抛出异常。
#### get
```cpp
T * get() const noexcept;
```
返回存储的指针。 `T` 不需要是完整类型。
#### swap
```cpp
template<class T> void swap(scoped_array<T> & a, scoped_array<T> & b) noexcept;
```
等效于 `a.swap(b)`。
## shared_ptr：共享所有权
### 描述
boost:: shared_ptr = “多人共用的智能指针，最后一个走的人关灯”——靠引用计数决定资源何时释放，可以安全地到处拷贝、传参、放回容器，专治“谁该 delete”的糊涂账。**当指向它的最后一个 `shared_ptr` 被销毁或重置时，指向的对象保证会被删除**。
### 用法
- 多个模块/容器/回调都持有同一资源，谁最后释放？
- 手动 delete 容易“早删”或“漏删”。
- auto_ptr/scoped_ptr 只能独占，无法满足共享需求。
#### 基本功能
```cpp
struct Foo { void say() { std::cout << "hello\n"; } };

void use(boost::shared_ptr<Foo> p) { p->say(); }   // 值传，计数+1

int main() {
    boost::shared_ptr<Foo> a(new Foo);  // 账本=1
    boost::shared_ptr<Foo> b = a;       // 账本=2
    use(a);                             // 进入函数时=3，退出时=2
    b.reset();                          // 账本=1
}   // a 离开作用域，账本=0 → 自动 delete Foo
```
1. 网络连接池
```cpp
class TcpConnection : public boost::enable_shared_from_this<TcpConnection> { ... };
std::map<int, boost::shared_ptr<TcpConnection>> g_pool;
```
任何地方拿到`shared_ptr<TcpConnection>` 都能安全延长连接生命期。
2. GUI 控件树
 每个父控件持有子控件的 shared_ptr；子控件若想反向引用父控件，用 weak_ptr 避免循环。
3. 缓存
```cpp
using ImageCache = std::map<std::string, boost::shared_ptr<Image>>;
```
当最后一块 UI 不再引用某图片，缓存条目自动释放内存
### 注意事项
C++ 函数实参的求值顺序是未指定的
标准只保证：
• 所有实参求值完成后，才进入函数体；
• 但先算哪个实参、后算哪个实参，由编译器决定。
shared_ptr 的异常安全和不安全使用
```cpp
void f(shared_ptr<int>, int);
int g();

void ok() {
    shared_ptr<int> p( new int(2) );
    f( p, g() );
}
// step 1   new int(2)     → 得到裸指针 P
// step 2   shared_ptr<int> p(P)   → 对象构造完成，计数器=1
// step 3   g() 求值        → 如果抛异常，p 已经存在，析构时 delete P

void bad() {
    f( shared_ptr<int>( new int(2) ), g() );
}
// 假设编译器决定这样求值：
// step 1   new int(2)     → 得到裸指针 P
// step 2   g() 求值        → 此时临时 shared_ptr 尚未构造，因为没有创建对象
// step 3   g() 抛异常
// 异常一路抛出去，临时 shared_ptr 的构造函数根本没机会被调用，于是 P 变成孤儿裸指针，没人 delete → 内存泄漏。
```
- 临时创建的 shared_ptr 没有绑定到名称上，内存中已经为指针指向（分配了）内存区域（这块内存区域被 new 语句分配，是有内容的）。
- 该内存的唯一持有者是那个刚刚返回的裸指针。
- 但是由于 `shared_ptr` 构造函数没有执行，导致没有创建**接管这块内存的 `shared_ptr` 对象**，但是指针存在而应该访问（管理）这个指针的 shared_ptr 对象裸指针丢失，这块内存无法被 delete.
