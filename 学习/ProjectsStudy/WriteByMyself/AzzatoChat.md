---
created: 2026-04-17
description: 模仿llfc的qt全栈聊天项目
参考视频: https://www.bilibili.com/video/BV1k2421K7ZB?spm_id_from=333.788.videopod.sections&vd_source=876be08bc9c030f4a9ea1fb97e0d0342
参考文档: https://www.yuque.com/lianlianfengchen-cvvh2/dz8xhn/cdg06fkzuc7w4els
---
## 基本 UI 构建
### LoginDialog
#### 图片按窗口比例缩放
如果需要让图片按比例大小显示在 QLabel 中
![[Pasted image 20260401092221.png]]
```cpp
wxQRLabel_ = new QLabel(this);
QPixmap pic(QString(":/resource/wxQR.jpg"));
QPixmap scaledPic = pic.scaled(200, 200, Qt::KeepAspectRatio, Qt::SmoothTransformation);
wxQRLabel_->setPixmap(scaledPic);
mainlayout->addWidget(wxQRLabel_, 0, Qt::AlignCenter);
```
不能直接添加图片到 pixmap 中，这样图片会保持原有的像素和缩放比例
![[Pasted image 20260401092346.png]]
#### QMainWindow 的中心组件问题
一个 QMainWindow 对象 `setCentralWidget` 之后，如果再重新设置，可能会导致之前设置的中心组件被删除，并且如果把**组件设置为中心组件然后在析构函数中 delete 通过 new 得到的对象**会导致关闭应用时报错，原因是设置中心组件 qt 就会将组件放入对象树中管理生命周期，窗口关闭自然就会析构对象，再使用 delete 双重释放是未定义行为

> [!note] qt 文档中的描述：
> Note: QMainWindow takes ownership of the widget pointer and deletes it at the appropriate time.

### 子窗口和父窗口关系
#### 大小关系
> [!question] 为什么子窗口设置了 `setFixedSize()`，还是能够拖动窗口大小？
> 前置条件
> - **MainWindow** 是顶级窗口（没有父窗口）
> - **LoginDialog** 和 **RegisterDialog** 是 MainWindow 的子窗口（通过 `new LoginDialog(this)` 设置父对象）
> - **MainWindow 设置 `setFixedSize(300, 500)`**：顶级窗口固定为 300x500，用户不能调整大小
> - **LoginDialog/RegisterDialog 设置 `setFixedSize(300, 500)`**：无论有没有设置大小，都接受父窗口管制
> 具体原因：
> 如果 **只有子窗口设置固定大小，父窗口没有设置**：
> - 父窗口可以自由调整大小，就算小于子窗口的最小大小也只能受着
> - 父窗口中没有设置两个子窗口的 layout，所以两个**控件**都在父窗口里显示，调整大小就会导致*显示在父窗口中的控件按照默认控件显示规则*，没有设置 StackWidget 关系，也没有 layout，那么控件自然会显示在左上角，不居中显示
> - 需要注意这种**子窗口不放在父窗口 layout 中的写法**，自窗口必须依赖父窗口才能显示，不能独立存在
> 
> 这也导致了如果不设置 MainWindow 的 FixedSize，运行后窗口大小可以随意调整，子窗口的大小设置显示完全失效，只是保证了子窗口内部内容布局**不受父窗口影响**而已

>[!question] 为什么父窗口 setFixedSize 而子窗口不设置会导致显示不出任何内容？
>前置知识：
>Qt 中窗口/控件的大小确定遵循这个优先级：
> ```
> 显式设置的大小 (setFixedSize/setMinimumSize/setMaximumSize) 
> ↓
> sizeHint() 或 minimumSizeHint()
> ↓
> 布局计算的大小
> ↓
> 默认大小 (通常是 0x0 或很小)
> ```
> - 没有 `setFixedSize()` - 没有明确大小
> - 没有重写 `sizeHint()` 或 `minimumSizeHint()`
> - 没有父布局，布局计算需要初始父布局大小作为参考
> - qt 无法确定子控件到底有多大，所以返回 `0*0` 或一个极小值（肉眼看不到）

#### 层级关系
> [!question] 为什么拖动父窗口大小子窗口控件不会居中显示？
> 前置条件：
> - **顶级窗口**：没有父窗口，显示在桌面上，有独立的窗口管理器装饰（标题栏、边框等）
> - **子窗口**：有父窗口，显示在父窗口内部，没有独立的窗口装饰
> - 由于子窗口依赖于父窗口，所以显示效果是由父窗口决定的，父窗口中没有为两者设置布局，所以两者的本质关系是：
> ![[Pasted image 20260418184946.png|500]]

#### 依赖关系
> [!question] 为什么子窗口不能设置 WindowsFlags?
> 因为没有意义
> 已经成为子窗口的窗口控件没有必要设置 WindowsHint（窗口最小/大化按钮，无边框等内容）
### 单例模板和 http 管理类
#### std::shared_ptr 和 std::make_shared 区别
##### 用法和特性

| 对比项                   | `std::shared_ptr<T>(new T)`                       | `std::make_shared<T>(args...)` |
| --------------------- | ------------------------------------------------- | ------------------------------ |
| **内存分配**              | 两次分配：一次给 `T` 对象，一次给控制块（引用计数等）                     | 一次分配：对象和控制块在同一块内存中             |
| **异常安全**              | 不安全：`new T` 可能抛出异常，若在 `shared_ptr` 构造前发生异常则导致内存泄漏 | 安全：所有操作在函数内部完成                 |
| **控制块位置**             | 控制块与对象分离                                          | 控制块与对象在同一内存块                   |
| **性能**                | 较慢（两次分配）                                          | 较快（一次分配，更好的缓存局部性）              |
| **自定义删除器**            | 支持                                                | 不支持                            |
| **访问 `private` 构造函数** | 支持（通过友元 + `new`）                                  | 不支持（`make_shared` 不是类的友元）      |
- 优先用 `make_shared`：大多数情况，性能更好，异常安全
- 需要用 `shared_ptr<T>(new T)`：当构造函数是 private/protected 时（如单例模式）；或需要自定义删除器时
- `make_shared_for_overwrite`：当你创建一个即将被立即覆盖的大对象时（如缓冲区），避免不必要的零初始化开销
##### 工作原理
```cpp
std::shared_ptr<Foo> ptr(new Foo(1, 2));
// 内存布局：
// 1 堆内存 1: [ Foo 对象 ]
// 2 堆内存 2: [ 控制块: 引用计数=1, 弱引用计数=0, 删除器... ]
```
执行过程：
1. `new Foo(1, 2)` — 在堆上分配内存，调用 Foo 的构造函数，返回裸指针 p
2. shared_ptr 构造函数 — 在堆上另外分配一块内存作为控制块（control block），存储引用计数、弱引用计数、删除器等
3. 将 p 和控制块关联起来
两次堆分配，两次释放。
```cpp
auto ptr = std::make_shared<Foo>(1, 2);
// 内存布局：
 // 1 堆内存: [ 控制块 | Foo 对象 ]  ← 连续内存
```
执行过程：
 1. 一次分配一块足够大的连续内存，同时容纳 Foo 对象和控制块
 2. 在这块内存中构造 Foo 对象（完美转发参数）
 3. 初始化控制块
一次堆分配，一次释放。
##### 异常安全
`std::shared_ptr` 的 new 对象过程如果抛出异常**不会被捕获**，导致 new 对象泄漏，而 `make_shared` 将他们放在同一步骤中，自动处理异常
#### 为什么使用 std::shared_ptr 构建 instance 对象？
```cpp
// Singleton.h
template <typename T>
std::shared_ptr<T> Singleton<T>::getInstance() {
    static std::once_flag onceFlag;
    std::call_once(onceFlag, [&]() { _instance = std::shared_ptr<T>(new T); });
    return _instance;
}
// LogicSystem.h
class LogicSystem : public Singleton<LogicSystem> {
    friend class Singleton<LogicSystem>;  // 声明 Singleton 为友元
private:
    LogicSystem();  // 私有构造函数
};
```
参考 [[#std shared_ptr 和 std make_shared 区别]]，   `std::make_shared<LogicSystem>() ` 是一个全局函数模板，内部调用 new LogicSystem()。**但 LogicSystem 构造函数是 private 的，make_shared 类不是 LogicSystem 的友元**，所以编译错误。

而 `std::shared_ptr<LogicSystem>(new LogicSystem) `中：
- new LogicSystem 是在 `Singleton::getInstance()` 内部执行的
- `Singleton<LogicSystem>` 是 LogicSystem 的友元（`friend class Singleton<LogicSystem>`）
- 友元可以访问 private 成员，所以 new LogicSystem() 可以成功
- 然后裸指针交给 shared_ptr 管理

> [!note] 总结经验
> 总结下来，如果在一个**构造函数为 private 且**继承自 `std::enable_shared_from_this<T>` 的类型 T 中想要创建 T 的   `std::shared_ptr<T>` 对象，**一般使用 `shared_ptr<T>(new T(args))` 构造函数而不用 `std::make_shared<T>`**
> 
> 因为 `make_shared` 是一个模板函数，初始化 T 类型对象的操作在 T 类型定义之外，且两者无友元关系，所以 `make_shared<T>` 访问不到 T 的 private 构造。
> 而如果在 T 类中声明 `friend std::make_shared<T>;` 会导致暴露所有 std::make_shared 的特化（包括其他类型）对 T 的私有成员的访问，扩大了友元范围，如果**严格规定构造函数的参数个数和类型，且确保以后维护中一定不会更改**，那么可以在 T 类中使用
> ```cpp
> friend std::shared_ptr<T> std::make_shared<T>();
> // 回到扩大暴露范围问题
> // template<typename... Args>
> // friend std::shared_ptr<T> std::make_shared(Args&&... args);
> ```
> 友元联系特化版本的 `std::make_shared`，否则不定长的多参构造又会回到暴露范围问题

> [!warning] 在 LogicSystem 中声明 make_shared 函数模板特化为他的友元也是错误的
> singleton 的析构函数必须非 private，否则引用计数为 0 时会调用默认删除器 `::operator delete`，private 析构函数因为无法访问到。
> 这导致了每一个T 类型的析构函数必须放在 public/protect 中，维护困难
#### 闭包思想
闭包（Closure） 是一个函数实体，它"捕获"了创建它时的外部环境（变量），使得这个函数可以在之后被调用时，仍然能访问那些变量。
C++中没有原生闭包支持，一般通过 lambda 表达式**值捕获来模拟**，外部环境通过值捕获被加入到*生成出的匿名类中*以保证生命周期和结构体一致。
不过注意，如果**外部环境是一个指针，需要使用 `std::shared_from_this` 获取类对象指针**，然后将他**值捕获**到列表中，因为指针本身只是一个 int 数字，保存它的生命周期和匿名类一致没有意义，有意义的是对应内存。
由于单从裸指针无法得知内存有没有被释放，所以这里用 shared_from_this 通过计数保证生命周期。

> [!caution] 捕获 this 指针带来生命周期问题
> 正因如此，**直接在 lambda 中捕获 this 指针是一种很危险的行为**，尤其在异步处理函数中
#### 防止shared_from_this 被误用
一个继承自 `std::enable_shared_from_this<Myclass>` 的类 Myclass 在以下场景中将指针删除导致内存泄漏
```cpp
class Myclass : public std::shared_from_this<Myclass> {};

class OutSideMyclass {
	void doSomething(){
		auto mc_ptr = std::make_shared<Myclass>();
		auto ptr = self.get();
		delete ptr;
	}
};
```
解决方式: 将析构函数设置为private，并只能通过外部辅助类来删除对象
```cpp
// 前置声明删除器
struct MyClassDeleter;

class MyClass : public std::enable_shared_from_this<MyClass> {
    friend struct MyClassDeleter;  // 删除器是友元
    
private:
    ~MyClass() = default;  // 私有析构函数
    
public:
    static std::shared_ptr<MyClass> create() {
        return std::shared_ptr<MyClass>(new MyClass(), MyClassDeleter());
    }
};

struct MyclassDeleter {
    void operator()(MyClass* p) {
        delete p;  // ✅ 友元可以访问私有析构函数
    }
};
```
这样，如果在外部调用delete 删除ptr，delete 检查析构函数访问，发现在 private 中无法访问->报错，只能通过 MyclassDeleter 删除指针。
这种方式比较麻烦，**并且无法保证Myclass 内部函数获取裸指针然后删除**（类内部可以访问private 成员）。这一版不能通过CRTP 等严格的保护措施做到，不过这昂灰增加维护困难，因此不在类内部删除类自身的shared_ptr 裸指针***开发者自己的责任***
#### std::once_flat 和 std::call_once 保证多线程单例
`std::once_flag` 和 `std::call_once` 是 C++11 标准库提供的**多线程安全的初始化机制**。
- **`std::once_flag`**：是一个辅助类，作为 `std::call_once` 的标志参数 [1](https://en.cppreference.com/w/cpp/thread/once_flag.html) [2](https://cppreference.net/cpp/thread/once_flag.html) [3](https://cplusplus.com/reference/mutex/once_flag/) [5](https://www.apiref.com/cpp/cpp/thread/once_flag.html)。它既不可复制也不可移动。
- **`std::call_once`**：是一个函数模板，确保传递给它的函数只执行一次，即使被多个线程同时调用 [2](https://cppreference.net/cpp/thread/once_flag.html) [5](https://www.apiref.com/cpp/cpp/thread/once_flag.html)
`std::once_flag` 是 `std::call_once` 的**标志参数**：
- 同一个 `once_flag` 对象传递给多次 `call_once` 调用，确保这些调用协调工作 [1](https://en.cppreference.com/w/cpp/thread/once_flag.html) [2](https://cppreference.net/cpp/thread/once_flag.html)
- 只有第一个调用会真正执行函数，后续调用会等待函数执行完成，然后直接返回
现代 C++提倡使用 Magic static（静态局部变量来实现**单纯的单例模式**），而这两个方式已经退化成在多线程中确保某些操作只能**单次执行**的操作/功能，而不仅仅适用于创建单例对象。
#### 发送请求
```cpp
void HttpManager::postHttpRequest(QUrl url, QJsonObject json, RequestId reqId, Modules mod) {
	QByteArray		data = QJsonDocument(json).toJson();
	QNetworkRequest request(url);
	request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
	request.setHeader(QNetworkRequest::ContentLengthHeader, QByteArray::number(data.length()));
	auto		   self	 = shared_from_this();
	QNetworkReply* reply = manager_.post(request, data);

	// use value copy to avoiding to visit destructed obj memo when this slot awake
	connect(reply, &QNetworkReply::finished, [reply, self, reqId, mod]() -> void {
		if(reply->error() != QNetworkReply::NoError) {
			qDebug() << reply->errorString();
			// send out signals to notify process is done even if http request failed
			emit self->signalHttpFinish(reqId, "", ErrorCodes::ERROR_NETWORK, mod);
			reply->deleteLater();
			return;
		}
		// else: no error -> read return buffer -> send out result
		QString res = QString::fromUtf8(reply->readAll());
		emit	self->signalHttpFinish(reqId, res, ErrorCodes::SUCCESS, mod);
		reply->deleteLater(); // easy to forget that!
		return;
	});
}
```
- HTTP 头的 Content-Length 必须是字符串（如 "123"），而 `QNetworkRequest::setHeader()` 第二个参数是 QVariant，`QByteArray::number()` 将整数转换为字符串形式的 QByteArray
- **在写大部分含有回调逻辑的代码时，需要考虑生命周期问题**。这里的 connect 信号槽机制也是回调的一种，信号在运行时的**某一个时间点**被触发
	- 创建信号槽之后 postHttpRequest 函数中的**局部变量**reply 就被删除了，但触发在创建信号槽连接之后，所以***值捕获&& `deleteLater`***
	- 同理槽函数中需要用到 `self->singalHttpFinish()`，self 在外部同样是局部变量，函数结束后删除->引用计数-1，这时候如果引用计数为零则指针删除，lambda 访问已经被删除的内存->未定义行为。跨线程通信时也可能导致相同问题
	- reqI 等函数参数在结束时弹出栈消失，同理不能引用捕获
```cpp
// 使用this捕获，即使没有{}代码块，分散在多个文件中的HttpManager实例很难保证触发信号时引用计数不为零
int main() {
	{
        auto manager = std::make_shared<HttpManager>();
        manager->makeRequest();
    }  // manager 被销毁，但 lambda 还在等待网络响应！
    
    // 网络响应到达，lambda 执行，访问无效的 this → 崩溃
    return 0;
}
```

>[!Tip]
>即使 disconnect 断开了信号槽，断开之前触发的信号还有可能触发，Qt 采用异步队列信号槽触发机制，发出信号->找到槽函数->槽函数触发事件进入队列->**断开连接**->不影响调用槽函数

## gateServer
### 基本构件
网关服务器编写，对应视频第五集
#### 单例模式
复用[[#单例模板和 http 管理类]]中的单例代码
#### http 消息解析
Boost.Beast 中，`string_body` 和 `dynamic_body` 是两种 HTTP 消息体类型，注意是请求体而不是请求头
- `string_body` 是最基础的消息体类型，它将 HTTP 消息体存储为字符串（`std::basic_string`）[1](https://boost.ac.cn/libraries/latest/grid/):
	- **内存存储**：数据完全存储在**连续，整块**内存中，大小一般由 boost 自行控制，由于大小虽然是动态变化的，但由于 `std::string` 的标准实现有预留空间，所以可能会有一些空间浪费问题
	- **简单易用**：接口直观，使用方便
	- **适合小数据**：适用于消息体大小可控的场景（通常在几 KB 以内的文本内容）
- `dynamic_body` 使用动态缓冲区（`multi_buffer`）作为消息体容器，提供了最大的灵活性 [2](https://boost.ac.cn/libraries/latest/grid/):
	- **动态增长**：支持数据的动态增长和收缩
	- **内存控制**：可以限制缓冲区大小
	- **流式处理**：可以边接收边处理，接口不能直接像 `string_body` 一样用 `.body()` 获取内容。而需要配合 `boost::beast::ostream(dynamic_string_obj.body()) << 其他内容` ，- 控制缓冲区大小应该用 `multi_buffer` 的 `prepare()` / `commit()` 方法，或构造时指定限制
	- **内存存储**：`ynamic_body` 使用的 `multi_buffer` 是分散的内存块
	- 适用于大数据，（如文件），将整个内容存储为字符串会占用大量连续内存
	- 适用于流式处理文件（音视频）边播放边解析
#### 启动服务和 socket 复用
```cpp
void CServer::start() {
	auto self = shared_from_this();

	// similarly use value copy to avoiding this obj being destructed when _acceptor callback occurs
	_acceptor.async_accept(_socket, [self](const beast::error_code& ec) {
		try {
			if (ec) {
				// give up this connection instead of listen a new one
				self->start();
				return;
			}
			std::make_shared<HttpConnection>(std::move(self->_processingSocket))->start();
		}
		catch (std::exception& e) {
			fastlog::console.error("error occurs in acceptor accept a connection: {}", e.what());
			self->start();
		}
	});
}
```
socket 是文件描述符资源，所以没有拷贝构造而使用移动，并且这里 socket 是因为没有也是因为需要复用对象（每有连接进来就要新建 HttpConnection 管理连接，每个连接对应一个 socket 辨明身份），所以
1. `_acceptor.async_accept(_socket, callback)` - 当新连接到来时，新建的 socket 会被放入 `_socket`
2. `std::move(self->_socket)` - 将这个 socket 移动给 HttpConnection
3. 此时 `self->_socket` 内容清空以便接受下一个连接。
#### 关闭连接
TCP 是一个**全双工**协议，两个方向的数据流是独立的。半关闭（half-close）允许一端告诉对方"我说完了"，但仍然可以继续接收数据。
- 调用`shutdown(tcp::socket::shutdown_send)`
	1. 服务器写完响应后，关闭发送方向 `socket.shutdown(tcp::socket::shutdown_send)`，本端不能再发送数据
	2. 服务器仍然可以接收（比如处理客户端的后续请求），或者等待客户端关闭连接
	3. 对方收到 FIN 后，知道本端已经发送完毕
	4. 当对方也关闭连接时，完整的四次挥手才会发生
- 当调用 `close()` 时，如果发送缓冲区还有数据未确认，tcp 会尝试发送完这些数据，然后执行正常的四次挥手。主动关闭的一方会进入 **time-wait** 状态，持续 2msl（约 1-4 分钟）。
	1. TIME-WAIT 的目的是：
		1. 确保最后的 ACK 能被对方收到（如果丢失，对方会重传 FIN）
		2. 防止旧连接的延迟数据包干扰新连接
这可以用 shutdown 或关闭 socket 实现:

|               | `socket.shutdown(...)` | `socket.close()`            |
| ------------- | ---------------------- | --------------------------- |
| **作用**        | 关闭连接的**一个或两个方向**的数据流   | 立即**完全销毁** socket 及其底层文件描述符 |
| **TCP 层面**    | 发送 FIN 包（半关闭）          | 发送 RST 包（强制终止）              |
| **数据**        | 已发送但未确认的数据会继续尝试发送      | 丢弃所有未发送/未确认的数据              |
| **socket 重用** | socket 对象仍然可用（可继续接收）   | socket 对象不可用，需要重新创建         |
| **资源释放**      | 不释放 socket 文件描述符       | 释放 socket 文件描述符             |

### 网络路由
对应视频 6
#### URL 百分号编码
URL 的定义（RFC 3986）规定，URL 只允许包含 ASCII 字符中的非控制字符
对于非 ASCII 字符，首先将 Unicode 字符通过 UTF-8 转换
```
Unicode: U+4E2D  "中"
UTF-8:   E4 B8 AD (三个字节)
============将每个字节转换为%XX形式============
E4 → %E4
B8 → %B8
AD → %AD
```

>[!TIP] 如何确定一个中文字符到底是 3 个还是 4 个字节？
>根据 UTF-8 规范，一个中文字符占用 3~4 个字节，所以解析需要区分变长字符长度。
>
>| Unicode 码点范围 | 字节数 | 首字节特征 | 后续字节 |
> |------------------|--------|------------|----------|
> | U+0000 ~ U+007F  | 1 字节 | `0xxxxxxx` | 无 |
> | U+0080 ~ U+07FF  | 2 字节 | `110xxxxx` | `10xxxxxx` |
> | U+0800 ~ U+FFFF  | 3 字节 | `1110xxxx` | `10xxxxxx` × 2 |
> | U+10000 ~ U+10FFFF | 4 字节 | `11110xxx` | `10xxxxxx` × 3 |
> 首字节的高位模式就是"长度指纹"：
> ```
> - 0xxx xxxx → 1 字节
> - 110x xxxx → 2 字节
> - 1110 xxxx → 3 字节  
> - 1111 0xxx → 4 字节
> ```
> 不同长度的字符在设计 Unicode 字符编码时根据放在不同的首字节特征区域就能够判定长度

```cpp
unsigned char FromHex(unsigned char x) {
    unsigned char y;
    if (x >= 'A' && x <= 'Z') y = x - 'A' + 10;
    else if (x >= 'a' && x <= 'z') y = x - 'a' + 10;
    else if (x >= '0' && x <= '9') y = x - '0';
    else assert(0);
    return y;
}

unsigned char ToHex(unsigned char x) {
    return  x > 9 ? x + 55 : x + 48;
}

std::string UrlDecode(const std::string& str) {
    std::string strTemp = "";
    size_t length = str.length();
    for (size_t i = 0; i < length; i++)
    {
        //还原+为空
        if (str[i] == '+') strTemp += ' ';
        //遇到%将后面的两个字符从16进制转为char再拼接
        else if (str[i] == '%')
        {
            assert(i + 2 < length);
            unsigned char high = FromHex((unsigned char)str[++i]);
            unsigned char low = FromHex((unsigned char)str[++i]);
            strTemp += high * 16 + low;
        }
        else strTemp += str[i];
    }
    return strTemp;
}

std::string UrlEncode(const std::string& str) {
    std::string strTemp = "";
    size_t length = str.length();
    for (size_t i = 0; i < length; i++)
    {
        //判断是否仅有数字和字母构成
        if (isalnum((unsigned char)str[i]) ||
            (str[i] == '-') ||
            (str[i] == '_') ||
            (str[i] == '.') ||
            (str[i] == '~'))
            strTemp += str[i];
        else if (str[i] == ' ') //为空字符
            strTemp += "+";
        else
        {
            //其他字符需要提前加%并且高四位和低四位分别转为16进制
            strTemp += '%';
            strTemp += ToHex((unsigned char)str[i] >> 4);
            strTemp += ToHex((unsigned char)str[i] & 0x0F);
        }
    }
    return strTemp;
}

std::string _get_url;
std::unordered_map<std::string, std::string> _get_params;

void HttpConnection::PreParseGetParam() {
    // 提取 URI  
    auto uri = _request.target();
    // 查找查询字符串的开始位置（即 '?' 的位置）  
    auto query_pos = uri.find('?');
    if (query_pos == std::string::npos) {
        _get_url = uri;
        return;
    }

    _get_url = uri.substr(0, query_pos);
    std::string query_string = uri.substr(query_pos + 1);
    std::string key;
    std::string value;
    size_t pos = 0;
    while ((pos = query_string.find('&')) != std::string::npos) {
        auto pair = query_string.substr(0, pos);
        size_t eq_pos = pair.find('=');
        if (eq_pos != std::string::npos) {
            key = UrlDecode(pair.substr(0, eq_pos)); // 假设有 url_decode 函数来处理URL解码  
            value = UrlDecode(pair.substr(eq_pos + 1));
            _get_params[key] = value;
        }
        query_string.erase(0, pos + 1);
    }
    // 处理最后一个参数对（如果没有 & 分隔符）  
    if (!query_string.empty()) {
        size_t eq_pos = query_string.find('=');
        if (eq_pos != std::string::npos) {
            key = UrlDecode(query_string.substr(0, eq_pos));
            value = UrlDecode(query_string.substr(eq_pos + 1));
            _get_params[key] = value;
        }
    }
}
```
#### 异步函数捕获异常
异步函数运行后**立刻返回**，网络传输中经常用到一部回调函数，而项目中
```cpp
void CServer::start() {
	auto self = shared_from_this();

	// similarly use value copy to avoiding this obj being destructed when _acceptor callback occurs
	_acceptor.async_accept(_processingSocket, [self](const beast::error_code& ec) {
		try {
			if (ec) {
				// give up this connection instead of listen a new one
				self->start();
				return;
			}
			std::make_shared<HttpConnection>(std::move(self->_processingSocket))->start();
			self->start();
		}
		catch (std::exception& e) {
			fastlog::console.error("error occurs in acceptor accept a connection: {}", e.what());
			self->start();
		}
	});
}

void HttpConnection::start() {
	auto self = shared_from_this();
	http::async_read(
		_socket, _buffer, _request, [self](const beast::error_code& ec, ::std::size_t bytes_transferred) {
			try {
				if(ec) {
					fastlog::console.debug("http read error is: {}", ec.what());
					return;
				}
				boost::ignore_unused(bytes_transferred);
				self->handleRequest();
				self->checkDeadline();
			} catch(std::exception& e) {
				fastlog::console.debug("exception occurs, description: {}", e.what());
			}
		});
}

int main() {
	try {
		unsigned short			port = static_cast<unsigned short>(8080);
		asio::io_context		ioc{ 1 };
		boost::asio::signal_set signals(ioc, SIGINT, SIGTERM);
		signals.async_wait([&ioc](const boost::system::error_code ec, int signal_number) {
			if(ec) {
				return;	 // QUES: maybe it deserver a more elegant way to ignore
			}
			ioc.stop();
		});
		std::make_shared<CServer>(ioc, port)->start();
		ioc.run();
	} catch(std::exception& e) {
		fastlog::console.error("error occurs: {}", e.what());
	}
}
```
中都用到了回调函数处理，这些回调函数**随时可能被调用**，而调用时上层（这里的"上层"指的是抽象意义的上层，比如 main 函数中try-catch 里看似包裹了 CServer 的 start 函数，但 CServer::start()运行时 main 函数已经在 `ioc.run()` 的事件循环里了，回调函数抛出的异常不会被 main 函数的 try-catch 捕获）
```
实际运行时序（不是代码顺序！）：                                                             
                                                                                             
时间轴 →→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→                                    
                                                                                             
时刻 1：ioc.run() 检测到有数据到达                                                           
  调用栈：main → ioc.run() → [asio内部] → handleRequest() → async_write()                    
                                   ↑                             ↑                           
                             事件循环派发                    注册回调函数:发起写操作后立即返回          
                                                                                             
时刻 2：handleRequest() 返回                                                                 
  调用栈：main → ioc.run() → [asio内部继续派发其他请求...]                                   
  此时 handleRequest 的栈帧已销毁。                                                          
                                                                                             
时刻 3：写操作完成 ← 这可能是毫秒或秒之后                                                    
  调用栈：main → ioc.run() → [asio内部] → lambda(ec, n) { shutdown; cancel; }                
                                  ↑                           ↑                              
                            事件循环发现写完成，派发回调      回调真正执行                   
                                                                                             
注意时刻 1 和时刻 3 的区别：                                                                 
                                                                                             
- 时刻 1 的调用栈：main → ioc.run() → handleRequest() → async_write()                        
- 时刻 3 的调用栈：main → ioc.run() → lambda
```

> [!QUESTION] 异步回调函数中为什么要用 try-catch？
> 异步回调运行在 **io_context 的事件循环**（`ioc.run()`）中，而非主调函数的栈上（异常需要在栈上展开）
> ```cpp
> http::async_read(..., [self](...) {
>     // 这里抛异常
>     throw std::runtime_error("xxx");
>     // ↑ 没有人能 catch 它，程序直接 terminate
> });
> ```
> - C++的异常处理是**依赖于调用栈的**，内层抛出异常后，会将异常**沿着函数栈帧生长的相反方向**传递异常，知道被捕获。
> - 而回调函数的注册&唤醒依赖事件循环（`ioc.run()`）
> - `ioc.run()` 没有设置异常处理逻辑。
> - 如果回调函数出现了异常没有在回调内被捕获，将会传递到 `ioc.run()` 位置抛出异常，**main 函数中的最外层 try-catch**捕获异常
> - 捕获完成后直接导致程序结束
> 
> 所以总而言之回调函数中使用 try-catch 是为了不让一个回调抛出异常直接让事件循环断开，程序结束。回调入口处包一层 `try-catch` 将异常限制在回调内部不会影响外部。
#### 异步回调的调试体验
**而是异步回调天然难以单步调试**，同样使用这一段异步代码:
```cpp
http::async_write(_socket, _response, [self](beast::error_code ec, std::size_t bytes_transferred) {
->断点	self->_socket.shutdown(tcp::socket::shutdown_send, ec);
->断点	self->_deadline.cancel();  // stop count time when send response back to client
});
```
这里在注册回调，回调已经被加入事件循环，所以这个回到函数会在执行到这里**立刻返回**，而当回调函数被唤醒时，执行流程被切断了：
- 当写操作真正完成时，io_context 的事件循环从 `ioc.run()` 内部直接调用回调
- 调用栈是：`ioc.run()` → `asio::detail::...` → 你的 lambda
- 和发起 `async_write` 的那段代码**已经不是同一个调用栈了**

所以你在 `handleRequest()` 里发起 `async_write`，然后在 lambda 里设断点，当断点命中时，你看到的调用栈是从 `ioc.run()` 深处一路进来的，中间隔了很多 asio 内部实现——"怎么进来的"的确是模糊的。

一种实用的调试方式：**在回调的 lambda 里加日志输出**，以及在 `ioc.run()` 前后加日志。还有就是，对回调内部的复杂逻辑，把它提取成命名函数，单独单元测试。

协程正是为了解决这个问题，C++20 协程 + Asio 的 `awaitable` 正是为了把异步回调写成**同步形式的顺序代码**
```cpp
// 回调写法
async_write(socket, response, [self](ec, n) {
    async_read(socket, buffer, request, [self](ec, n) {
        // 嵌套回调...
    });
});

// 协程写法（示意）
asio::awaitable<void> handle() {
    co_await async_write(socket, response, asio::use_awaitable);
    co_await async_read(socket, buffer, request, asio::use_awaitable);
    // 顺序书写，不需要嵌套
}
```
协程的好处：
- **调试回归自然**：单步可以沿着顺序代码逐行走，调用栈是连续的
- **没有回调嵌套**（callback hell）
- **异常处理同步化**：`try-catch` 包裹整个协程体即可

### 功能模块
#### 邮箱发送验证码邮件
使用 javascript 实现，逻辑较为简单
#### Asio 上下文连接池
重新听一遍**为什么需要上下文连接池**
`work_guard` 本质上是一个**"保持活跃"令牌**。它告诉 `io_context`："虽然现在没有任务，但不要停止，因为后续可能有任务进来。" 只要 `work_guard` 对象还存在且没有被 `reset()`，`io_context::run()` **就不会返回**，即使当前没有任何待处理的异步操作。

所以线程不会立刻结束，工作流程是：

```
线程启动 → io_context::run() → 检查是否有 work_guard → 有 → 等待新的异步操作
                                                                ↓
                                             有操作进来 → 执行 handler → 继续等待
```

换句话说，`work_guard` 把 `io_context::run()` 变成了一个 `不会主动退出的事件循环`。当你需要关闭连接池时，需要销毁所有 `work_guard`（或调用 `reset()`），让 `run()` 因"没有更多工作"而自然返回，线程才能 join。