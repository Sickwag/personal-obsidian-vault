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
 - new LogicSystem 是在 Singleton::getInstance() 内部执行的
 - `Singleton<LogicSystem>` 是 LogicSystem 的友元（`friend class Singleton<LogicSystem>`）
 - 友元可以访问 private 成员，所以 new LogicSystem() 可以成功
 - 然后裸指针交给 shared_ptr 管理

#### 闭包思想
闭包（Closure） 是一个函数实体，它"捕获"了创建它时的外部环境（变量），使得这个函数可以在之后被调用时，仍然能访问那些变量。
C++中没有原生闭包支持，一般通过 lambda 表达式**值捕获来模拟**，外部环境通过值捕获被加入到*生成出的匿名类中*以保证生命周期和结构体一致。
不过注意，如果**外部环境是一个指针，需要使用 `std::shared_from_this` 获取类对象指针**，然后将他**值捕获**到列表中，因为指针本身只是一个 int 数字，保存它的生命周期和匿名类一致没有意义，有意义的是对应内存。
由于单从裸指针无法得知内存有没有被释放，所以这里用 shared_from_this 通过计数保证生命周期。

> [!caution] 捕获 this 指针带来生命周期问题
> 正因如此，**直接在 lambda 中捕获 this 指针是一种很危险的行为**，尤其在异步处理函数中
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
	- reqI 等函数参数在蛤属结束时弹出栈消失，同理不能引用捕获
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
网关服务器编写，对应视频第五集
### 基本构件
#### 单例模式
复用[[#单例模板和 http 管理类]]中的单例代码
#### http 消息解析
Boost.Beast 中，`string_body` 和 `dynamic_body` 是两种 HTTP 消息体类型，注意是请求体而不是请求头
- `string_body` 是最基础的消息体类型，它将 HTTP 消息体存储为字符串（`std::basic_string`）[1](https://boost.ac.cn/libraries/latest/grid/):
	- **内存存储**：数据完全存储在**连续，整块**内存中，大小一般由 boost 自行控制，由于大小在几个数值中固定，所以可能会有一些空间浪费问题
	- **简单易用**：接口直观，使用方便
	- **适合小数据**：适用于消息体大小可控的场景（通常在几 KB 以内的文本内容）
- `dynamic_body` 使用动态缓冲区（`multi_buffer`）作为消息体容器，提供了最大的灵活性 [2](https://boost.ac.cn/libraries/latest/grid/):
	- **动态增长**：支持数据的动态增长和收缩
	- **内存控制**：可以限制缓冲区大小
	- **流式处理**：可以边接收边处理，接口不能直接像 `string_body` 一样用 `.body()` 获取内容。而需要配合 `boost::beast::ostream(buffer, dynamic_string_obj.body())`，buffer 用来控制缓冲区大小
	- **内存存储**：`ynamic_body` 使用的 `multi_buffer` 是分散的内存块
	- 适用于大数据，（如文件），将整个内容存储为字符串会占用大量连续内存
	- 适用于流式处理文件（音视频）边播放边解析
#### 启动服务和 socket 复用
```cpp
void CServer::start() {
	auto self = shared_from_this();

	// similarly use value copy to avoiding this obj destructed when _acceptor callback occurs
	_acceptor.async_accept(_socket, [self](const beast::error_code& ec) {
		if(ec) {
			self->start();
			return;
		}
		std::make_shared<HttpConnection>(std::move(self->_socket))->start();
	});
}
```
socket 是文件描述符资源，所以没有拷贝构造而使用移动，并且这里 socket 是因为没有也是因为需要复用对象（每有一个连接进来就要新建一个 HttpConnection 管理这个连接，每个连接需要一个 socket 辨明身份），所以这里使用 `std::move()` 把 socket 内容转交给 HttpConnection 管理，而 `self->_socket` 内容清空以便接受下一个连接。
http::shutdown 和 beast::socket::close 有什么区别？close 关闭哪一个对象有什么区别？
什么时候用 close 什么时候 shutdown？
数据类型 httpConnection 类在 LogicSystem 中为了防止重复引用增加编译时长，这里仅仅做声明
为什么继承单例类的所有类（比如 LogicSystem） 都需要将 `Singleton<类>` 作为友元类？是为了这个类能够访问 Singleton 的构造函数从而达到无法被复制吗（继承了仅用拷贝构造函数和拷贝构造运算符的构造函数）
继承了 `std::shared_from_this` 的类为什么要将构造函数设置为 private？
如果一个继承自 `std::shared_from_this<Myclass>` 的类 Myclass，如何防止这个类被误用，通过以下代码将对象析构？
```cpp
class Myclass : public std::shared_from_this<Myclass> {
	void doSomething(){
		auto self = shared_from_this();
		auto ptr = self.get();
		delete ptr;
	}
};
```
我看到网上有一种说法: 通过将类的析构函数放在 private 中，然后创建一个能够访问 Myclass 析构函数的辅助类的指针指针即可解决问题。但是我没懂这是什么意思，请你详细解释
