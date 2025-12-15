# Qt 核心
## 信号与插槽
### 槽函数重载在 connect 函数中的表示方法
[Signals & Slots | Qt Core | Qt 6.10.0](https://doc.qt.io/qt-6/zh/signalsandslots.html)
Qt 信号槽机制是 Qt 框架的核心特性之一，它提供了一种类型安全的对象间通信方式。当某个事件发生时（如按钮被点击、文本被修改等），对象会发出信号（signal）；其他对象可以通过连接信号到槽函数（slot，注意本质是一个函数）来响应这些事件。
信号槽机制依赖于 Qt 的元对象系统，会在编译时分析 qt 代码，然后生成额外的元信息代码插入其中
- 信号发射和槽接收能够成功的原理是：
- 一旦使用了 `connect(sender, signal, receiver, slot);` 编译器会在编译期：
	1. 获取 sender 和 receiver 的元对象信息
	2. 查找 signal 和 slot 在各自类中的索引
	3. 在内部表中记录这个连接关系
- 则当某个行为触发了某个信号（比如 `QToolButton` 支持一个 `clicked` 点击行为，他会触发 `QMetaObject::active()`），元对象系统就会在运行时：
	1. 通过元对象系统查找所有连接到此信号的槽
	2. 验证参数类型匹配
	3. 调用所有连接的槽函数
一个标准的 QWidget 对象结构应该符合：
```cpp
class MyWidget : public QWidget {
  Q_OBJECT  // 必须包含此宏
public:
  explicit MyWidget(QWidget *parent = nullptr); // 做变量初始化，UI显示和信号槽链接工作，可以外包给别的函数做，比如setUI和setConnection

signals:
  // 信号声明区域，清晰表明发出了什么信号，通常大部分信号moc都会内置实现，不需要手动编写
  void valueChanged(int newValue);
  void buttonPressed(const QString& text);

public slots:
  // 公共槽函数区域
  void setValue(int value);

private slots:
  // 私有槽函数区域
  void onButtonClicked();
  void onValueChanged(int value);

private:
  // 私有成员变量
  QPushButton *m_button;
  QLabel *m_label;
  int m_value;

  // 私有辅助函数
  void setupUI();	// 处理所有布局
  void setupConnections();	// 处理所有信号槽连接
};
```
- 可以使用 `QMetaObject::Connection` 接收 connect 函数的结果，`if(!conn)` 判断链接结果成功与否
- Qt 的信号槽连接是"一对多"的，一个信号可以连接到多个槽函数。当信号发出时，Qt 会依次调用所有连接的槽函数，但槽函数本身并不知道是通过哪个信号触发的。
- 槽函数可以是任意一个 `doSomething` 函数，甚至可以是 lambda 表达式

当信号或槽被重载时（有多个不同参数的版本），需要使用函数指针语法明确指定要连接的版本。您可以使用[qOverload](https://doc.qt.io/qt-6/zh/qoverload.html#qOverload)() 或`static_cast` 来区分：
```cpp
// Connect to the int overload of QComboBox::currentIndexChanged(int)
// 这一版本会自动在重载列表中寻找
connect(comboBox, qOverload<int>(&QComboBox::currentIndexChanged),
        this, &MyClass::handleIndexChanged);

// Or select QLCDNumber::display(int) when connecting from QSlider::valueChanged(int)
// 指定需要int类型作为参数的重载
connect(slider, &QSlider::valueChanged,
        lcd, qOverload<int>(&QLCDNumber::display));

// Using static_cast (more verbose):
/** static_cast转换，强调需要
 * - 我要取的是 `QComboBox` 类的成员函数指针
 * - 该函数返回 `void`
 * - 接收 `int` 类型参数
 */
connect(comboBox, static_cast<void(QComboBox::*)(int)>(&QComboBox::currentIndexChanged),
        this, &MyClass::handleIndexChanged);

// Or using a lambda to call the correct overload:
// 最清晰的方法，自定义度和灵活性很高
connect(slider, &QSlider::valueChanged,
        this, [lcd](int value) { lcd->display(value); });
```

| 连接方式          | 可读性    | 安全性     | Qt 版本兼容性   | IDE 提示   |
| ------------- | ------ | ------- | ---------- | -------- |
| `static_cast` | ❌ 复杂语法 | ✅ 显式指定  | ✅ Qt 5+    | ⚠️ 智能提示弱 |
| `QOverload`   | ✅ 类型安全 | ✅ 显式指定  | ✅ Qt 5.13+ | ✅        |
| Lambda 包装     | ✅ 最清晰  | ❌ 多一层调用 | ✅ 全版本      | ✅        |
### 带有默认参数的信号和插槽
信号和槽的签名可能包含参数，而参数可以有默认值。考虑[QObject::destroyed](https://doc.qt.io/qt-6/zh/qobject.html#destroyed)()：
```cpp
void destroyed(QObject* = nullptr);
```
当[QObject](https://doc.qt.io/qt-6/zh/qobject.html) 被删除时，它会发出[QObject::destroyed](https://doc.qt.io/qt-6/zh/qobject.html#destroyed)() 信号。我们要捕获这个信号，因为我们可能有一个指向已删除[QObject](https://doc.qt.io/qt-6/zh/qobject.html) 的悬空引用，这样我们就可以清理它。合适的槽签名可能是
```cpp
void objectDestroyed(QObject* obj = nullptr);
```
为了将信号连接到槽，我们使用[QObject::connect](https://doc.qt.io/qt-6/zh/qobject.html#connect)() 。有几种方法可以连接信号和槽。第一种是使用函数指针：
```cpp
connect(sender, &QObject::destroyed, this, &MyObject::objectDestroyed);
```
这仅限于 QT 6 风格的 connect 函数，如果使用旧版的 `SIGNAL` 和 `SLOT` 宏来**调用重载的方法**不行
```cpp
connect(sender, SIGNAL(destroyed(QObject*)), this, SLOT(objectDestroyed(Qbject*)));
connect(sender, SIGNAL(destroyed(QObject*)), this, SLOT(objectDestroyed()));
connect(sender, SIGNAL(destroyed()), this, SLOT(objectDestroyed()));
connect(sender, SIGNAL(destroyed()), this, SLOT(objectDestroyed(QObject*))); // no way
```
如果需要细致调节 connect 函数执行的线程，则可以通过 connect 函数的第一个和第三个参数来调整，
因为插槽期待的是 [QObject](https://doc.qt.io/qt-6/zh/qobject.html) ，而信号不会发送。该连接将报告运行时错误。在使用 [QObject::connect](https://doc.qt.io/qt-6/zh/qobject.html#connect) () 重载时，编译器不会检查信号和槽参数（使用 lambda 或者 dynamic_static 可以避免）。
### 信号和槽的连接方式
不管是哪种参数形式的 connect()函数，最后都有一个参数 type，它是枚举类型 Qt::ConnectionType，
默认值为 `Qt::AutoConnection`。枚举类型 `Qt::ConnectionType` 表示信号与槽的关联方式，有以下几种取值。
-  `Qt::AutoConnection`（默认值）：如果信号的接收者与发射者在同一个线程中，就使用 `Qt::DirectConnection` 方式，否则使用 `Qt::QueuedConnection` 方式，在信号发射时自动确定关联方式。
-  `Qt::DirectConnection`：信号被发射时槽函数立即运行，槽函数与信号在同一个线程中。
-  `Qt::QueuedConnection`：在事件循环回到接收者线程后运行槽函数，槽函数与信号在不同的线程中。
-  `Qt::BlockingQueuedConnection`：与 `Qt::QueuedConnection` 相似，区别是信号线程会阻塞，，
直到槽函数运行完毕。当信号与槽函数在同一个线程中时绝对不能使用这种方式，否则会造成死锁。

在类定义中定义信号函数，标明参数类型和参数的意义在参数名称中，然后在需要触发信号的位置使用 `emit sigal_name(arg1, arg2....)` 这样就能保证对应类型的槽函数能够读取到发送的信号和信号函数中的参数，槽函数可以接受信号函数中的参数并处理
比如下面这个自定义槽函数和信号的例子：
```cpp
// 在类定义中
class FileProcessor : public QObject {
    Q_OBJECT
    
signals:
    // 参数类型 + 有意义的参数名
    void fileProcessed(const QString &fileName, int fileSize, bool success);
    void progressUpdated(int currentFile, int totalFiles, double percentage);
};

void FileProcessor::processFile(const QString &filePath) {
    QFileInfo info(filePath);
    
    // 触发信号，传递具体参数值
    emit fileProcessed(info.fileName(), info.size(), true);
    emit progressUpdated(5, 10, 50.0);  // 处理到第5个，总共10个
}

class MainWindow : public QMainWindow {
public slots:
    // 槽函数参数与信号参数完全匹配
    void onFileProcessed(const QString &fileName, int fileSize, bool success) {
        qDebug() << "文件:" << fileName 
                 << "大小:" << fileSize 
                 << "处理结果:" << (success ? "成功" : "失败");
    }
    
    void onProgressUpdated(int current, int total, double percent) {
        progressBar->setValue(percent);
        statusLabel->setText(QString("处理中: %1/%2").arg(current).arg(total));
    }
};


```

### 解除信号和槽连接
- 解除与一个发射者所有信号的连接，例如：
```cpp
disconnect(myObject, nullptr, nullptr, nullptr); //静态函数形式
myObject->disconnect(); //成员函数形式
```
- 解除与一个特定信号的所有连接，例如：
```cpp
disconnect(myObject, SIGNAL(mySignal()), nullptr, nullptr); //静态函数形式
myObject->disconnect(SIGNAL(mySignal())); //成员函数形式
```
- 解除与一个特定接收者的所有连接，例如：
```cpp
disconnect(myObject, nullptr, myReceiver, nullptr); //静态函数形式
myObject->disconnect(myReceiver); //成员函数形式
```
- 解除特定的一个信号与槽的连接，例如：
```cpp
disconnect(lineEdit, &QLineEdit::textChanged, label, &QLabel::setText); //静态函数形式
```
#### 自定义信号实现
- 信号就是在类定义里声明的一个函数
- 信号函数必须是无返回值的函数，但是可以有输入参数
- 信号函数无须实现，而只需在某些条件下被发射。
emit 关键字可以发射信号，这个关键字可以在任何函数中使用，用来发射一个信号
```cpp
class TPerson : public QObject
{
	Q_OBJECT
private:
	int m_age= 10;
public:
	void incAge();
signals:
	void ageChanged( int value);
}

void do_something() {
	int m_age = 10;
	emit TPerson::ageChanged(m_age);
}
```
## 可绑定属性
[Qt Bindable Properties | Qt Core | Qt 6.10.0](https://doc.qt.io/qt-6/zh/bindableproperties.html)
### 实现示例
Qt 的可绑定属性是一种**机制**，允许你将一个对象的属性（比如一个 `QString` 变量、一个 `int` 值、一个颜色等）与另一个对象的属性**连接**”或“**绑定**”在一起。
#### qt 5 时期的属性绑定
一个对象要成为一个“可绑定的属性”源，它需要满足下面的条件：
1. **使用 `Q_PROPERTY` 宏声明属性**：它告诉 Qt 这个变量是一个可以被系统识别和访问的属性。具体参考 [[frmdevicebutton#Q_PROPERITY 属性声明宏|Q_PROPERITY 属性声明宏]]
	- `READ`: 获取属性值的函数（必须有）。
	- `WRITE`: 设置属性值的函数（可选，如果只有 READ，则属性是只读的）。
	- `NOTIFY`: 当属性值被 `WRITE` 函数修改后，自动发出的信号（可选，但强烈推荐，没有它就无法实现绑定的自动更新）。
	- `RESET`: 重置属性值的函数（可选）。
	- 其他如 `SCRIPTABLE`, `DESIGNABLE`, `USER` 等。
2. **提供 `READ` 和 `WRITE` 函数** 对于上面的 `name` 属性，我们需要在实现文件中定义 `name()` 和 `setName()` 函数。
	- **关键点**：在 `setName()` 函数中，当值真的发生改变时，必须**发出 `nameChanged` 信号**。这绑定机制工作的核心。
具体代码：
```cpp
// person.h
#include <QObject>
#include <QString>

class Person : public QObject {
    Q_OBJECT
    Q_PROPERTY(QString name READ name WRITE setName NOTIFY nameChanged)

public:
    explicit Person(QObject *parent = nullptr);

    QString name() const;
    void setName(const QString &newName);

signals:
    void nameChanged(const QString &newName);

private:
    QString m_name;
};
```
需要时手动编写 setter 和 getter，并且手动 connect
#### 现代 QT 6 写法
```cpp
```cpp
QProperty<QString> firstname("John");
QProperty<QString> lastname("smith");
QProperty<int>age(41);
QProperty<QString> fullname;
fullname.setBinding([&]() {return firstname.value()+ " " +lastname.value() + " age: " QString::number(age.value()); })；
qDebug() << fullname.value(); // Prints "John Smith age: 41"

firstname= "Emma";// 触发绑定重新评估
qDebug() << fullname.value(); // Prints the new value "Emma Smith age: 41"

// 生日快到了age.setValue(age.value()+ 1);// 触发重新评估
qDebug() << fullname.value(); // Prints "Emma Smith age: 42"
```
可以手动将一个**对象 A**标记为 Property，并附加在别的对象 B 上，使得 B 对象根据 A 对象动态更新，通常由于 `setBinding` 函数签名为：
```cpp
template <typename T>
void QProperty<T>::setBinding(std::function<T()> bindingFunction);
```
lambda 函数编写**最好需要**遵循下面的要求

| 法则          | 要求                  | 示例                                                                |
| ----------- | ------------------- | ----------------------------------------------------------------- |
| **无参数**     | 必须是 `[](){...}` 形式  | ✅ `[=](){ return price * quantity; }`<br>❌ `[](int value)`        |
| **只读依赖**    | 仅读取其他属性，不修改         | ✅ `return price * quantity;`<br>❌ `price = 100; return quantity;` |
| **无副作用**    | 不做网络请求/文件读写等        | ✅ `<int>()`                                                       |
| **类型匹配**    | 返回值类型必须与属性一致        | ✅ `QProperty<double>` 接收 `double` 返回值                             |
| **不可以循环绑定** | A 绑定给 B，那么 B 就不能绑回来 |                                                                   |
还可以使用 `QBindable` 来实现属性绑定
```cpp
QBindable<T> bindable = QBindable<T>(&MyObject::age, this, &MyObject::ageChanged);
```
这段代码将this这个对象中的age属性和ageChanged函数绑定在一起，表示一旦age变量发生变化，就会执行ageChanged函数的逻辑。他必须和 `Q_PROPERTY` 一起才能发挥功能，且：
1. **`Q_PROPERTY` 必须存在**：你必须在类中使用 `Q_PROPERTY` 宏声明该属性。
2. **该属性必须有对应的信号**：即 `Q_PROPERTY` 声明时需要有 `NOTIFY` 标记的信号。
#### 两者对比
| 特性        | 传统 Q_PROPERTY   | 可绑定属性         |
| --------- | --------------- | ------------- |
| **变化通知**  | 需手动 emit signal | **自动触发**更新    |
| **依赖管理**  | 需手动 connect     | **自动追踪**依赖关系  |
| **计算属性**  | 需重写 setter      | **声明式**定义计算逻辑 |
| **UI 更新** | 需调用 update ()   | **自动刷新**关联 UI |
## 事件系统
[The Event System | Qt Core | Qt 6.10.0](https://doc.qt.io/qt-6/zh/eventsandfilters.html)
事件是从抽象的 [QEvent](https://doc.qt.io/qt-6/zh/qevent.html) 类派生出来的对象，代表应用程序内部发生的事情，或者是应用程序需要了解的外部活动的结果。[QObject](https://doc.qt.io/qt-6/zh/qobject.html) 子类的任何实例都可以接收和处理事件
### 简单使用
大部分事件类型以 `Event` 结尾，这样可以很容易分辨，下面处理键盘事件，返回值表示是否接收到了 tab 键按下
```cpp
bool MyWidget::event(QEvent *event) {
    if (event->type() == QEvent::KeyPress) {
        QKeyEvent *ke = static_cast<QKeyEvent *>(event);
        if (ke->key() == Qt::Key_Tab) {
            // special tab handling here
            return true;
        }
    } else if (event->type() == MyCustomEventType) {
        MyCustomEvent *myEvent = static_cast<MyCustomEvent *>(event);
        // custom event handling here
        return true;
    }

    return QWidget::event(event);
}
```
### 事件过滤器
所谓事件过滤器就是一个**继承自 QObject 的类对象**，并且重写（标明 `override`）eventFilter 函数
```cpp
class MyEventFilter : public QObject {
    Q_OBJECT
public:
    bool eventFilter(QObject *obj, QEvent *event) override {
        if (event->type() == QEvent::KeyPress) {
            QKeyEvent *keyEvent = static_cast<QKeyEvent*>(event);
            qDebug() << "按键事件： " << keyEvent->key();
            if (keyEvent->key() == Qt::Key_Enter) {
                qDebug() << "Enter 键被拦截";
                return true; // 不传递事件
            }
        }
        return QObject::eventFilter(obj, event); // 传递给默认处理
    }
};

MyButton button;
MyEventFilter filter;
button.installEventFilter(&filter);
```
对于继承自 `QObject` 的对象，都有一个 `installEventFilter` 函数，可以用它安装事件过滤器。需要注意：
- 事件过滤器对象不能被 install 到 QObject 元对象上
- 事件过滤器类必须继承自 QObject 并重写 eventFilter 函数
- 事件过滤器只能拦截和处理 `QEvent` 类型的事件，不能处理其他类型的事件。应使用 `event->type()` 来判断具体的事件类型，如 `QEvent::KeyPress`、`QEvent::MouseButtonPress` 等。
- 多个对象可以使用同一过滤器
- 过滤对象必须与此对象处于同一线程。如果_filterObj_ 在不同的线程中，则此函数不会执行任何操作。如果 `filterObj` 或此对象在调用此函数后被移动到不同的线程中，事件过滤器将不会被调用，直到两个对象再次拥有相同的线程亲和性（它_不会_被删除）
## 字符串数据类
[Classes for string data | Qt Core | Qt 6.10.0](https://doc.qt.io/qt-6/zh/string-processing.html)
### 字符串使用规则
一般来说，[QString](https://doc.qt.io/qt-6/zh/qstring.html) 可以随处使用而且性能良好。提供处理多种编码的 API（ [QString::fromLatin1](https://doc.qt.io/qt-6/zh/qstring.html#fromLatin1) () ）。
以下规则可在**不增加太多复杂性情况下大幅改进字符串处理**。这些规则可在大多数情况下获得接近最佳性能：
- 所有只包含 ASCII 字符的字符串（例如日志信息）都可以使用 Latin-1 编码。使用 [string literal](https://doc.qt.io/qt-6/zh/qlatin1char.html#operator-22-22_L1)（[[Modern C++#自定义字符串字面量|自定义字符串字面量]]） `"foo"_L1` 。如果没有这个后缀，源代码中的字符串字面量会被假定为 UTF-8 编码，**处理速度会变慢**。一般来说，尽量使用最严格的编码，在很多情况下都是 Latin-1。
- 用户可见字符串通常会被翻译，并通过 [QObject::tr](https://doc.qt.io/qt-6/zh/qobject.html#tr) () 函数传递。该函数接收字符串字面量（const char 数组），并按照所有用户界面元素的要求返回带有 **UTF-16 编码的 [QString](https://doc.qt.io/qt-6/zh/qstring.html)** 。如果不使用翻译基础结构，则应在整个应用程序中使用 UTF-16 编码。字符串字面量 `u"foo"` 创建 UTF-16 字符串字面量，或使用 Qt XML 特有的字面量 `u"foo"_s` 直接创建 [QString](https://doc.qt.io/qt-6/zh/qstring.html)，和使用 `QString` 构造函数创建的对象一致，都使用 UTF-16
- 在处理 [QString](https://doc.qt.io/qt-6/zh/qstring.html) 的部分内容时，不要将每部分内容复制到自己的 [QString](https://doc.qt.io/qt-6/zh/qstring.html) 对象中，而是创建 [QStringView](https://doc.qt.io/qt-6/zh/qstringview.html) 对象。这些对象可以使用 [QStringView::toString](https://doc.qt.io/qt-6/zh/qstringview.html#toString) () 转换回 [QString](https://doc.qt.io/qt-6/zh/qstring.html) ，但应尽量避免这样做。如果函数返回 [QStringView](https://doc.qt.io/qt-6/zh/qstringview.html) ，那么尽可能继续使用该类是最有效的做法。API 类似于常量 [QString](https://doc.qt.io/qt-6/zh/qstring.html) 。
### QT 中的字符串编码
参阅[Qt 中的 Unicode 支持信息](https://doc.qt.io/qt-6/zh/unicode.html)。
编码方面，Qt 以某种形式支持 UTF-16、UTF-8、Latin-1（ISO 8859-1）和 US-ASCII（即 Latin-1 和 UTF-8 的通用子集）。
- Latin-1 是一种字符编码，每个字符使用一个字节，这使它成为最有效但也是最有限的编码。
- UTF-8 是一种可变长度字符编码，使用一至四个字节对所有字符进行编码。它向后兼容 US-ASCII，是源代码和类似文件的常用编码。Qt 假定源代码使用 UTF-8 编码。
- UTF-16 是一种可变长度编码，每个字符使用两个或四个字节。它是 Qt 中用户公开文本的常用编码。

其他编码以单个函数（如 [QString::fromUcs4](https://doc.qt.io/qt-6/zh/qstring.html#fromUcs4) () 或 [QStringConverter](https://doc.qt.io/qt-6/zh/qstringconverter.html) 类）的形式提供支持。此外，Qt 还提供了一个与编码无关的数据容器 [QByteArray](https://doc.qt.io/qt-6/zh/qbytearray.html) ，该容器非常适合存储二进制数据。

不同编码之间的转换成本很高，因此应尽量避免。另一方面，**更紧凑的编码**（尤其是字符串字面量而不是字符串对象）可以减少二进制文件的大小，从而提高性能。
### 字符串视图和字符串对象区别
字符串类可根据其支持的功能进一步区分。其中一个主要区别是：**字符串类是拥有并控制其数据，还是仅仅引用其他地方的数据**，这就为了对象和视图两个概念
- 前者称为**拥有器**，后者称为**非拥有容器**或视图。非自有容器类型通常只记录一个指向数据起始位置及其大小的指针，因此轻便而廉价，但只要数据仍然可用，它就一直有效。
- 视图通常支持所有者字符串功能的子集，但无法修改底层数据。
### 字符串字面量
C++标准中定义的字符串字面量在**编译期实现**，由语言定义，或者由 qt 告诉。
标准 C++中支持的前缀，以 `R`、`u`、`U`、`LR`、`u8`、`u8R` 等形式出现。qt 告诉的比标准多一个后缀，

| 前缀    | 类型                        | 说明                                                                                  | 示例                    |
| :---- | :------------------------ | :---------------------------------------------------------------------------------- | :-------------------- |
| `(无)` | `const char[]`            | 普通/窄字符串，编码取决于编译器，通常是本地编码（如 Windows-1252, Latin-1）或 UTF-8。                           | `"Hello"`             |
| `u8`  | `const char8_t[]` (C++20) | UTF-8 编码的窄字符串。**从 C++20 开始，`char8_t` 是独立的字符类型**。在 C++17 及之前，它产生的类型是 `const char[]`。 | `u8"你好"`              |
| `u`   | `const char16_t[]`        | UTF-16 编码的字符串。通常用于 Windows API 或其他原生使用 UTF-16 的系统。                                  | `u"Привет"` (俄语 "你好") |
| `U`   | `const char32_t[]`        | UTF-32 编码的字符串。拥有固定宽度的字符，便于处理任意字符。                                                   | `U"こんにちは"` (日语 "你好")  |
qt 中有如 `u"foo"_s` （用于 [QString](https://doc.qt.io/qt-6/zh/qstring.html) ）、`"foo"_L1` （用于 [QLatin1StringView](https://doc.qt.io/qt-6/zh/qlatin1stringview.html) ）和 `u"foo"_ba` （用于 [QByteArray](https://doc.qt.io/qt-6/zh/qbytearray.html) ）。这些都是通过使用 [StringLiterals Namespace](https://doc.qt.io/qt-6/zh/qt-literals-stringliterals.html) 提供的，需要使用 `using namespace Qt::Literals::StringLiterals;` 才能够使用

| 编码     | C++ 字符串字面 | Qt 用户定义字面量 | C++ 字符    | Qt 字符                                                     | 自有字符串                                                   | 非所有字符串                                                                |
| ------ | --------- | ---------- | --------- | --------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| 拉丁-1   | -         | ""_L1      | -         | [QLatin1Char](https://doc.qt.io/qt-6/zh/qlatin1char.html) | -                                                       | [QLatin1StringView](https://doc.qt.io/qt-6/zh/qlatin1stringview.html) |
| UTF-8  | u8""      | -          | char8_t   | -                                                         | -                                                       | [QUtf8StringView](https://doc.qt.io/qt-6/zh/qutf8stringview.html)     |
| UTF-16 | u""       | u""_s      | char16_t  | [QChar](https://doc.qt.io/qt-6/zh/qchar.html)             | [QString](https://doc.qt.io/qt-6/zh/qstring.html)       | [QStringView](https://doc.qt.io/qt-6/zh/qstringview.html)             |
| 二进制/无  | -         | ""_ba      | std::byte | -                                                         | [QByteArray](https://doc.qt.io/qt-6/zh/qbytearray.html) | [QByteArrayView](https://doc.qt.io/qt-6/zh/qbytearrayview.html)       |
| 灵活     | 任何        | -          | -         | -                                                         | -                                                       | [QAnyStringView](https://doc.qt.io/qt-6/zh/qanystringview.html)       |
# Qt 模块
## Qt SQL
https://doc.qt.io/qt-6/zh/qtsql-index.html
### qt 连接 mysql 方法
参考[[软件使用错误#Qt 缺少 mysql 驱动导致无法连接 mysql]]
#### SQL 编程
#### 连接数据库 + 执行 sql 语句
参考 [[MySQL#C++数据库编程（qt qmysql）]] 中的[[MySQL#代码编写#代码实例|代码实例：编写一个简单的登录注册页面]]
#### 使用 SQL 模型类
除了[QSqlQuery](https://doc.qt.io/qt-6/zh/qsqlquery.html) 之外，Qt 还提供了三个用于访问数据库的高级类。这些类是[QSqlQueryModel](https://doc.qt.io/qt-6/zh/qsqlquerymodel.html) 、[QSqlTableModel](https://doc.qt.io/qt-6/zh/qsqltablemodel.html) 和[QSqlRelationalTableModel](https://doc.qt.io/qt-6/zh/qsqlrelationaltablemodel.html) 。

| [QSqlQueryModel](https://doc.qt.io/qt-6/zh/qsqlquerymodel.html)                     | 基于任意 SQL 查询的只读模型。                                                        |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [QSqlTableModel](https://doc.qt.io/qt-6/zh/qsqltablemodel.html)                     | 基于单个表的读写模式。                                                              |
| [QSqlRelationalTableModel](https://doc.qt.io/qt-6/zh/qsqlrelationaltablemodel.html) | 支持外键的[QSqlTableModel](https://doc.qt.io/qt-6/zh/qsqltablemodel.html) 子类。 |
#### 在表视图中显示数据
##### SQL 查询模型（只读）
```cpp
QSqlQueryModelmodel;
model.setQuery("SELECT * FROM employee");
for(int i= 0; i<model.rowCount();++i) {
	int id = model.record(i).value("id").toInt();
	QStringname = model.record(i).value("name").toString();
	qDebug() << id << name;
}
```
注意 QSqlQueryModelmodel 的文档说明
![[Pasted image 20251013172953.png]] 从签名可以看出使用之前是需要设置 QSqlQuery 对象的，如果直接填入 sql 语句字符串，也是可以转换的。`query()` 返回已经设置的 query 对象。`setQuery()` 要注意:

> ***void QSqlQueryModel:: setQuery (QSqlQuery &&query)***
> - Resets the model and sets the data provider to be the given query. Note that the query must be active and must not be isForwardOnly ().
> - lastError () can be used to retrieve verbose information if there was an error setting the query.
> 
> ***QSqlRecord QSqlQueryModel:: record (int row) const***
> - Returns the record containing information about the fields of the current query. If row is the index of a valid row, the record will be populated with values from that row
> - If the model is not initialized, an empty record will be returned.    

##### SQL 表模型（可修改）
```cpp
QSqlTableModelmodel;
model.setTable("employee");
model.setFilter("salary > 50000");
model.setSort(2、 Qt::DescendingOrder);
model.select();
for (inti = 0; i < model.rowCount(); ++i) {
    QStringname = model.record(i).value("name").toString();
    intsalary = model.record(i).value("salary").toInt();
    qDebug() << name << salary;
}
```
一种 QSqlQuery 的上位替代，代码量较少而且不需要 SQL 语法知识。可以使用**面向对象方法**的 setter，getter 函数操作数据库
```cpp
for (int i = 0; i < model.rowCount(); ++i) {
	QSqlRecord record = model.record(i);
	double salary = record.value("salary").toInt();
	salary *= 1.1;
	record.setValue("salary", salary);
	model.setRecord(i, record);
}
model.submitAll();
```
完成记录更改后，应始终调用[QSqlTableModel::submitAll](https://doc.qt.io/qt-6/zh/qsqltablemodel.html#submitAll)() 以确保更改已写入数据库。
何时以及是否_需要_调用 submitAll() 取决于表的 [edit strategy](https://doc.qt.io/qt-6/zh/qsqltablemodel.html#editStrategy) 。默认策略是 [QSqlTableModel::OnRowChange](https://doc.qt.io/qt-6/zh/qsqltablemodel.html#EditStrategy-enum) ，它规定当用户选择不同的记录时，待处理的更改将应用到数据库。其他策略有 [QSqlTableModel::OnManualSubmit](https://doc.qt.io/qt-6/zh/qsqltablemodel.html#EditStrategy-enum) （所有更改都缓存在模型中，直到调用 submitAll()）和 [QSqlTableModel::OnFieldChange](https://doc.qt.io/qt-6/zh/qsqltablemodel.html#EditStrategy-enum) （不缓存更改）。

文档中写：

> 1. QSqlTableModel:: OnFieldChange 在这种情况下，SubmitAll()似乎可以实现永远不需要显式 调用 submitAll()的承诺。但这有两个隐患：
> 

| 编号  | 类型                   | 修改提交行为                   | 内部原理     |
| --- | -------------------- | ------------------------ | -------- |
| A   | `OnFieldChange` (默认) | 对每一字段修改立即提交 <-- ⚠️隐患源头   | 无缓存，实时写入 |
| B   | `OnRowChange`        | 在整行修改且换行后才提交             | 行缓存更新    |
| C   | `OnManualSubmit`     | 须手动调用 `submitAll()` 统一提交 | 所有变更暂存   |
最容易影响性能的是 `onFieldChange`
```cpp
model->setEditStrategy(QSqlTableModel::OnFieldChange);
```
- Qt 对每次**字段变更**都会立即执行 SQL `UPDATE`
- 修改每个字段 = 一次数据库 round-trip（网络请求）
- 如果有 4 个字段改动 = 4 次 SQL 提交 = 4 × 网络延迟 + 4 × 数据锁 + 4 × 查询执行
- 而不是累计在内存中，待用户按下“保存”按钮一次性提交。



> 2. 在没有任何缓存的情况下，性能可能会大幅下降。如果你修改了主键，当你试图填充它时，记录可能会从你的指缝中溜走。


##### SQL 关系表模型（表间关系展示，只读）
[QSqlRelationalTableModel](https://doc.qt.io/qt-6/zh/qsqlrelationaltablemodel.html) 扩展了 [QSqlTableModel](https://doc.qt.io/qt-6/zh/qsqltablemodel.html) ，为外键提供了支持。
因为 qt 不支持多结果集，所以如果需要多表之间的数据互通，可以使用关系表模型类来实现
```cpp
model->setTable("employee");

model->setRelation(2, QSqlRelation("city", "id", "name"));
model->setRelation(3, QSqlRelation("country", "id", "name"));
```

> [!note]
> The setRelation () function calls establish a relationship between two tables. The first call specifies that column 2 in table employee is a foreign key that maps with field id of table city, and that the view should present the city's name field to the user. The second call does something similar with column 3.
> The setRelation () call specifies that column 2 in table employee is a foreign key that maps with field id of table city, and that the view should present the city's name field to the user.
> 
> 第一个 setRelation 表示将 employee 表的第 2 列设置一个外键，链接到 city 表中的 id 列，最终将 city 表中 id 列与 employee 表中的第 2 列相等的记录的 city 表中的 name 属性显示在 id 表中的 city 列

# Qt 杂项
## 编码规范
参考：[Qt Coding Style/zh - Qt Wiki](https://wiki.qt.io/Qt_Coding_Style/zh#%E5%8F%98%E9%87%8F%E5%A3%B0%E6%98%8E)
[Qt编程规范 - 知乎](https://zhuanlan.zhihu.com/p/598034134)
https://gitcode.com/Open-source-documentation-tutorial/97151
[C++代码规范中文版(QT) | Worklt](https://worklt.tech/posts/QT-Google-cpp-style-guide-CN/)
[Qt开发代码编码规范 - 知乎](https://zhuanlan.zhihu.com/p/597825467)
### 文件
 - 头文件依赖：使用前置声明（forward declarations）尽量减少`.h` 中 `#include` 的数量.
- 文件名全部小写，可以包含下划线，VS 工程中可能使用大驼峰
### 函数
- 槽函数命名格式为 `slot_<object_name>_<signalName>`，其中 `object_name` 为控件对象名（**采用变量名的命名规则**），`signalName` 为信号名（**采用普通函数的命名规则**）
- 信号函数命名格式为 `signal_<signalName>`，其中 `signalName` 为信号名（**采用普通函数的命名规则**）
- 内联函数: 只有当函数只有**10行**甚至更少时才会将其定义为内联函数（inline function）。
- 函数参数顺序（Function Parameter Ordering）: 定义函数时，参数顺序为：**输入参数在前，输出参数在后**
- 槽函数和信号函数使用 `slot_` 和 `signal_` 前缀
- 重写虚函数时加virtual关键字：重写一个虚函数时，在衍生类中把它明确地声明为virtual。
### 变量
- 变量和函数命名使用**小驼峰**命名法，全局变量使用 `g_` 前缀，成员变量使用 `_` 后缀，结构体成员必须要 `_` 后缀
- 常量命名**不含前缀且全大写**，允许下划线，包括 const 全局常量和宏定义
- 枚举值使用**大驼峰**命名，结构体名称大写，成员**小驼峰**
- **不应该让变量类型成为其名字的一部分**，比如 int 类型变量命名为 `i_value`，因为类型转换时，变量的名字不会随之转换。  
- ui 控件尽可能用缩写，QPushButton 缩写为 `btn_标记名称`
### 类和结构体
- 类名是名词，每个单词以大写字母开头，不包含下划线
- 类成员声明注意**先声明函数，信号函数，槽函数，然后是变量**，顺序按照 public，protect，private
- 仅在代码中需要拷贝一个类对象的时候使用拷贝构造函数；不需要拷贝时应使用 `Q_DISABLE_COPY(MyClass)` (QT 自带的不可复制宏)。
- 仅当只有数据时使用struct，其它一概使用class
- 使用组合（composition）通常比使用继承更适宜，如果使用继承的话，只使用公共继承
### 语句
- new申请内存之后。使用try catch捕获申请内存是否成功。原因：new申请内存可能失败
- 条件和循环语句第一个大括号不换行
- 使用指针前必须检查指针是否为空
- 空循环体应使用{}或continue，而不是一个简单的分号
### 注释
- 每个类数据成员（也叫实例变量或成员变量）应注释说明用途，如果变量可以接受NULL或-1等警戒值（sentinel values），须说明之，如：
```cpp
private:
  //Keeps track of the total number of entries in the table.
  //Used to ensure we do not goover the limit. -1 means
  //that we don't yet know how many entries the table has.
  int num_total_entries_;
```
- todo 注释写法：
```cpp
//TODO(kl@gmail.com):Use a"*"here for concatenation operator.
//TODO(Zeke): change this to use relations.
```
### 风格之外
- 数据库命名：采用全小写字母，单词中间加下划线的方式； 表，字段命名：采用全小写字母，单词中间加下划线的方式； C++代码中的sql：全小写字母。
 - VS 使用Visual Assist X（VAX）插件提供快速的代码补全以及格式化的代码注释
## 构建项目理念
### 影子构建
Shadow Build 是 Qt Creator 的一个核心功能，它通过将所有构建产物隔离到专门的构建目录中，实现了源代码目录的绝对纯净、构建配置的完美隔离、版本控制的简化以及构建管理的便捷性。
- 当开启 Shadow Build 时，Qt Creator 会在项目目录**之外**创建一个**专门的构建目录**（通常是 `编译器名称+版本号` 这样的子目录）。
- 所有由构建过程生成的文件都会被放进这个**构建目录**里，包括：
    - 中间目标文件 (`.o`, `.obj`, `.a`, `.lib`, `.so`, `.dll` 等)
    - 可执行文件 (`.exe`, ...)
    - 链接后的库文件
    - 编译器生成的临时文件
    - CMake 生成的构建系统文件 (Makefile, Ninja 文件等，即使它们描述的是如何构建源代码，但文件本身也放在构建目录)
    - Qt 生成的 `moc_`, `ui_`, `qrc_` 文件
    - `qmake` 缓存文件
    - 包含最终输出的目录 (如 `bin`, `lib`, `include` 等)
- 源代码目录则所见即所得，只包含代码文件，保证干净
# 项目实例
## AnalogClock
### QPainter 设置绘制原点和缩放
地址：[Analog Clock | Qt Widgets | Qt 6.9.1](https://doc.qt.io/qt-6/zh/qtwidgets-widgets-analogclock-example.html)
painter 可以设置绘制原点，并根据画笔的设置的坐标系缩放**在程序运行时**动态调整所有用画笔绘制的图形的大小和坐标位置
```cpp
int side = qMin(this->width(), this->height());
painter.translate(this->width() / 2, this->height() / 2); // 设置painter的绘制原点坐标，这里设置为窗口中心位置，translate表示“平移”
painter.scale(side / 200.0, side / 200.0);
```
这里scale 设置参数表示根据当前组件的大小来设置缩放比例，在绘制小时刻度的矩形参数中 `painter.drawRect(73, -3, 16, 6);`
- 在 200 x 200 的标准坐标系中，这个矩形的位置是精心设计的
- 当窗口实际大小为 400 x 400 时，scale 为 2.0，这个矩形会自动变成在 (146, -6) 位置，大小为 32 x 12
- 当窗口实际大小为 100 x 100 时，scale 为 0.5，这个矩形会自动变成在 (36.5, -1.5) 位置，大小为 8 x 3
### Qt 对象和组件机制
如果一个类的声明中，使用了 `Q_OBJECT` 宏声明，则这个类会启用
1. 信号槽机制 - `connect()` 函数的基础
2. 运行时类型信息 - `metaObject()` 等函数
3. 动态属性系统 - `setProperty()` 等函数
4. 翻译支持 - `tr()` 函数
5. 元对象系统 - QMetaObject
如果一个类继承了 `QWidget`，那么他会启用下面这几个功能：
6. 获得窗口显示能力
7. 获得事件处理机制
8. 获得绘图功能（paintEvent）
9. 获得控件管理功能
```text
QObject (提供元对象系统)
     ↓
QWidget (提供GUI功能)
     ↓
AnalogClock (自定义时钟组件)
```

| 特性 | Q_OBJECT 宏 | QWidget 类 |
|------|------------|-----------|
| 类型 | 预处理器宏 | C++类 |
| 作用 | 启用元对象系统 | 提供 GUI 组件功能 |
| 必需性 | 需要信号槽/元对象时必需 | 需要 GUI 功能时必需 |
| 继承关系 | 不涉及继承 | 继承自 QObject |
### QT 内置组件/功能对象的初始化规范
#### 使用规范
创建一些 QT 内置对象时，有时通过 `QObject obj = new QObject(this)`，有时直接使用构造函数 `QObject obj(this)`。它们的区分为：
对于 Qt 的 QObject 及其派生类，使用方式有严格的规则，不是可选的：
```cpp
// ✓ 正确：使用指针 + 父对象
QTimer* timer = new QTimer (this);

// ✗ 错误：不能这样使用！
// QTimer timer (this);  // 编译错误或运行时错误

// ✓ 正确：某些情况下可以栈上创建（但有限制）
QTimer timer;  // 没有父对象，但需要手动管理生命周期
```
而普通对象，两种方式都可以
```cpp
// 两种方式都可以：
QPoint point(10, 20);           // 栈上创建
QPoint* point = new QPoint(10, 20); // 堆上创建

QColor color(255, 0, 0);        // 栈上创建
QColor* color = new QColor(255, 0, 0); // 堆上创建
```
#### 判断初始化方式依据
  QObject 对象（必须使用指针创建）
  特征：
  1. 继承自 QObject 类，需要显示在屏幕上
  2. 支持信号槽机制
  3. 支持元对象系统（QMetaObject）
  4. 支持对象树和自动内存管理
  5. 支持属性系统、事件系统等
  常见 QObject 派生类：
```cpp
// GUI 组件
QPushButton, QLabel, QLineEdit, QTextEdit, QComboBox
QListWidget, QTreeWidget, QTableWidget
QMainWindow, QWidget, QDialog, QApplication

// 功能对象
QTimer, QThread, QProcess, QTcpSocket, QUdpSocket
QNetworkAccessManager, QFileSystemWatcher

// 模型视图
QAbstractItemModel, QStandardItemModel
```
普通对象（值类型，可以在栈上创建）
特征：
1. 不继承自 QObject
2. 通常是数据容器或辅助类
3. 支持拷贝语义
4. 通常在栈上创建更高效
```cpp
// 几何类型
QPoint, QPointF, QSize, QSizeF, QRect, QRectF
// 颜色和画笔
QColor, QPen, QBrush
// 字体和文本
QFont, QString
// 容器类
QVector, QList, QMap, QHash
// 时间日期
QTime, QDate, QDateTime
// 其他辅助类
QPixmap, QIcon, QImage
```
### QTimer **重绘**信号发射机制
QWidge 对象都有一个 update 函数，每次调用这个函数都会触发**组件的的重绘**，重绘操作通过子类重写（override）的 `paintEvent` 函数
```cpp
// update()不会立即重绘，而是：
// 1. 标记窗口为"需要重绘"状态
// 2. 将重绘请求加入事件队列
// 3. 当事件循环处理到时才真正调用paintEvent
void QWidget::update();  // 重绘整个窗口
void QWidget::update(const QRect &rect);  // 重绘指定区域
void QWidget::update(const QRegion &region);  // 重绘指定区域
void QWidget::repaint();  // 立即重绘，绕过事件队列void QWidget::repaint();  // 立即重绘，绕过事件队列，可能会导致闪烁和性能问题

```
系统在以下情况会调用paintEvent：
1. 调用update()或repaint()后
2. 窗口第一次显示
3. 窗口从被遮挡状态恢复
4. 窗口大小改变
5. 其他需要重绘的情况

```cpp
// 可以连接多个槽函数到同一个定时器
connect(timer, &QTimer::timeout, this, &AnalogClock::update);
connect(timer, &QTimer::timeout, this, &AnalogClock::logTime);

// 可以在运行时动态改变连接
disconnect(timer, &QTimer::timeout, this, &AnalogClock::update);
connect(timer, &QTimer::timeout, this, &AnalogClock::otherFunction);

// 可以启动/停止定时器多次
timer->start(1000);  // 启动
timer->stop();       // 停止
timer->start(500);   // 以不同间隔重新启动
```
### 按照系统主题颜色设置组件颜色
![[Pasted image 20250921113557.png|一套代码，多个主题]]
```cpp
const QColor hourColor(palette().color(QPalette::Text)); // 使用palette绘制的颜色会自动适应系统主题颜色，这里使用内置的自适应文本颜色
const QColor minuteColor(palette().color(QPalette::Text));
const QColor secondsColor(palette().color(QPalette::Accent)); // 使用**当前系统主题颜色**的强调色
```
1. 遵循系统主题：通过使用 `palette().color()`，时钟的颜色会自动适应系统的主题设置，确保与应用程序的整体外观一致。
2. 时针和分针使用相同颜色：`QPalette::Text` 通常用于文本颜色，时针和分针都使用这种颜色，使它们在视觉上统一。
3. 秒针使用强调色：`QPalette::Accent` 是一种强调色，通常用于突出显示重要元素。将秒针设置为强调色使其更容易区分，因为秒针移动最频繁。

### 总结
一个 QWidget 组件类一般要实现下面几个内容
- 构造函数
	- 设置组件大小（`resize` 函数）
	- 设置组件窗口标题
	- 设置计时器，根据需要设置刷新频率
- 根据需要重写 `paintEvent` 函数，在其中实现每一次 update 要更新的内容
## Calculator Example
地址 [Calculator Example | Qt Widgets | Qt 6.9.1](https://doc.qt.io/qt-6/zh/qtwidgets-widgets-calculator-example.html)
### QT 框架中的 qobject_cast
什么是 qobject_cast
`qobject_cast` 是 Qt 提供的一个模板函数，专门用于在 QObject 类层次结构中进行安全的类型转换。它是 **Qt 版本的 `dynamic_cast`**，专门为 QObject及其派生类设计。
#### qobject_cast 与标准 C++ 转换的比较
1. 与 static_cast 的比较
```cpp
// static_cast - 编译时检查，运行时不验证
QPushButton* button1 = static_cast<QPushButton*>(sender());
// 如果 sender() 实际返回的是 QLabel*，这会导致未定义行为！

// qobject_cast - 运行时验证
QPushButton* button2 = qobject_cast<QPushButton*>(sender());
// 如果 sender() 实际返回的是 QLabel*，button2 会是 nullptr
```
2. 与 dynamic_cast 的比较
```cpp
// dynamic_cast - C++ 标准 RTTI，适用于任何有多态特性的类
QPushButton* button1 = dynamic_cast<QPushButton*>(sender());
// qobject_cast - Qt 特定，基于 Qt 元对象系统
QPushButton* button2 = qobject_cast<QPushButton*>(sender());
```
####  qobject_cast 限制，与标准库类型转化模板比较
1. 只适用于 QObject 及其派生类
2. 传入的参数及其转化目标类型必须要使用 `Q_OBJECT` 宏
标准库中如果想要使用类型转换，有两种方法
static_cast 是一种**编译时**类型转换：
- 不会在运行时进行类型检查
- 如果转换不安全，会导致未定义行为
- 未定义行为并不会抛出异常，如果语法正确，编译会成功通过
- static_cast检查继承关系传入其中的内容和转换对象是否合法（即判断他们是否有继承关系）	而无法检查运行时对象的实际类型，即只检查**语法上是否通过**而 qobject_cast 会**在运行时**检查转换对象和传入对象是否相同
dynamic_cast 是一种**运行时**类型转换：
- 在运行时进行类型检查
- 只能用于具有虚函数的类（多态类型）
- 失败时返回 nullptr（指针）或抛出 std:: bad_cast 异常（引用）

## QCalendarWidget
[Calendar Widget Example | Qt Widgets | Qt 6.9.1](https://doc.qt.io/qt-6/zh/qtwidgets-widgets-calendarwidget-example.html)
主要学习嵌套布局
### 嵌套布局中的组件排布
本项目有有这几个 GUI 显示区域
![[Pasted image 20250924105442.png|../../../../Files & LongText/Attachments/Pasted image 20250924105442.png]]
左上角的可显示区域由于实时渲染，调整右侧的一些选项（如 `Grid`）是否勾选，会导致左侧布局大小改变带动整个窗口改变，所以在构造函数中需要**根据需要限制**，确保更新时不调整大小。
#### qt 中基础 GUI 组件
一、基础控件 (Basic Widgets)
1. QLabel - 标签
2. QPushButton - 按钮
3. QCheckBox - 复选框
4. QRadioButton - 单选按钮
5. QLineEdit - 单行文本框
6. QTextEdit - 多行文本编辑框
二、选择控件 (Selection Widgets)
7. QComboBox - 组合框，下拉选框
8. QSpinBox - 数值选择框
9. QDoubleSpinBox - 浮点数选择框
10. QSlider - 滑块
11. QProgressBar - 进度条
三、显示控件 (Display Widgets)
12. QLCDNumber - LCD 数字显示器
13. QProgressBar - 进度条
14. QCalendarWidget - 日历控件
四、容器控件 (Container Widgets)
15. QGroupBox - 组框
16. QFrame - 框架
17. QScrollArea - 滚动区域
18. QToolBox - 工具箱
19. QTabWidget - 标签页控件
五、布局控件 (Layout Widgets)
20. QLayout - 布局管理器
21. QSplitter - 分割条
六、数据控件 (Data Widgets)
22. QTableWidget - 表格控件
23. QTreeWidget - 树形控件
24. QListWidget - 列表控件
七、重要 Qt 概念说明
25. QLocale - 本地化类
26. QDate - 日期类
27. QDateEdit - 日期编辑控件
#### 组件助记符
在 Qt 中，&符号在文本中有着特殊的含义，它用于创建键盘快捷键（Keyboard Accelerator）或助记符（Mnemonic），如果在创建组件时，在它的显示文本中使用 `&`
```cpp
selectionModeLabel = new QLabel(tr("&Selection mode:"));
selectionModeLabel->setBuddy(selectionModeCombo);
```
- 文本显示为："Selection mode: "（没有&符号）
- 字母 "S" 会带下划线显示
- 用户可以按 Alt + S 快速将焦点移到 selectionModeCombo 下拉框上
如果想要显示 "&" 字符，则需要代码中写入 `&&`，如果要在 windows 中没有显示出下划线（一般 windows 10/11 之后默认不显示，只有按下 ALT + 激活按键之后才会显示）则需要在控制面板中设置"•	控制面板 → 轻松使用 → 使键盘更易于使用 → “启用以便于访问的下划线快捷键”

![[Pasted image 20250924120532.png|../../../../Files & LongText/Attachments/Pasted image 20250924120532.png]]

#### QWidget 组件的 addItem 方法
QComboBox:: addItem 方法的第二个参数是一个 QVariant 类型的用户数据，用于存储与该选项关联的自定义数据。
```cpp
// 假设我们做一个语言选择的下拉框
QComboBox *comboBox = new QComboBox();

// 方法2：添加文本和自定义数据（推荐）
comboBox->addItem("中文", QVariant("zh_CN"));    // 第二个参数是内部语言代码
comboBox->addItem("English", QVariant("en_US"));  // 第二个参数是内部语言代码
comboBox->addItem("Español", QVariant("es_ES"));  // 第二个参数是内部语言代码

connect(comboBox, &QComboBox::currentIndexChanged, this, &Window::languageChanged);
```
第一个参数，也就是下拉选项，只需要显示一个名称

> 所以只填入一个 QString 对象即可

然后程序，或者说界面组件如何知道 Combo 组件状态发生改变这一信息？

> 这个选项**被选中时**，整个 QCombo 对象的状态会改变（自身 currentIndex 变量发生改变的同时发出 `QCombo::currentIndexChanged(currentIndex)` 信号）

`currentIndexChange` 函数具体 change 到了哪一个 index ？

> 我们为一个 QComobox addItem 之后，相当于添加了一个**具有自定义标签数值**的选项，如果选中了这个选项，QComboBox 组件会自动将自身状态中的 `currentIndex`（可以通过调用同名函数返回其副本）更新为组件的自定义标签数值，并将其作为参数传给 connect 连接的槽函数中
> 第二个参数的作用：
> - 它不是让"第一个参数具有值"
> - 而是让当前索引位置关联一个额外的数据
> - 这个数据可以通过 `QCombo::itemData(index)` 获取
```cpp
// 索引 0: text="Monday", userData=Qt::Monday
// 索引 1: text="Tuesday", userData=Qt::Tuesday
comboBox->addItem ("Monday", Qt::Monday);
comboBox->addItem ("Tuesday", Qt::Tuesday);
// 1. 存储业务逻辑ID
comboBox->addItem("管理员", QVariant(1));  	// 管理员权限ID
comboBox->addItem("用户", QVariant(2));  	// 用户权限ID
comboBox->addItem("访客", QVariant(3));  	// 访客权限ID

// 在槽函数中使用
void onUserTypeChanged(int index) {
    int userType = comboBox->itemData
      (index).toInt(); // 获取权限ID
    switch(userType) {
        case 1: setupAdminFeatures(); break;
        case 2: setupUserFeatures(); break;
        case 3: setupGuestFeatures(); break;
    }
}

// 2. 存储配置信息
struct LocaleConfig {
    QString languageCode;
    QString countryCode;
    QString displayName;
    QFont font;
};

// 注册自定义类型
Q_DECLARE_METATYPE(LocaleConfig)
// 添加项目时存储完整配置
LocaleConfig config1 = {"zh", "CN", "中文", QFont("SimSun")};
QVariant var1 = QVariant::fromValue(config1);
comboBox->addItem("中文", var1);

// 3. 避免字符串比较的性能问题，不用字符串比较（低效且容易出错）
void onTextChanged(const QString& text) {
    if(text == "English (US)") { /* ... */ }  // 依赖精确字符串匹配
    else if(text == "中文") { /* ... */ }
}

// 使用QVariant存储的ID（高效且安全）
void onIndexChanged(int index) {
    int languageId = comboBox->itemData(index).toInt();
    switch(languageId) {
        case LANG_EN_US: loadEnglishUSResources(); 			break;
        case LANG_ZH_CN: loadChineseSimplifiedResources(); 	break;
    }
}

// 4. 实际应用场景示例
class LanguageSettings : public QWidget {
    Q_OBJECT
private:
    QComboBox *languageCombo;

public:
    LanguageSettings() { setupLanguageCombo(); }
private:
    void setupLanguageCombo() {
        // 添加语言选项，每个都关联对应的locale字符串
        languageCombo->addItem("English", QVariant("en_US"));
        languageCombo->addItem("简体中文", QVariant("zh_CN"));
        languageCombo->addItem("繁體中文", QVariant("zh_TW"));
        languageCombo->addItem("日本語", QVariant("ja_JP"));
        connect(languageCombo, QOverload<      int>::of(&QComboBox::currentIndexChanged), this, &LanguageSettings::changeApplicationLanguage);
        }
private slots:
    void changeApplicationLanguage(int index) {
        QString locale = languageCombo->itemData(index).toString();
        if (!translator.load(":/translations/app_" + locale)) {
            qDebug() << "Failed to load translation for" << locale;
        }
        qApp->installTranslator(&translator);
        QLocale::setDefault(QLocale(locale));
    }
};
```

由于槽函数在本项目中只使用了函数指针，并没有暴露函数的签名，那么再有多个槽函数重载的情况下编译器如何确定使用哪一个重载？

> 有两种方法：
> 1. 编译器进行类型匹配，从 QT 元对象的链接表中自动遍历所有名为 `languageChanged` 的槽函数，信号函数会将这个索引广播出去 `languageChanged(itemData(currentIndex).toInt())`，由于 `itemDate()` 返回值为 `auserData`，是一个 `QVariant` 类型需要转换为 int，编译器找到类型匹配（接受 int 参数）的那一个重载（使用 SFINAE 机制在编译期查找）。
> 2. 如果有多个接受相同参数的重载函数，比如 `QVariant` 是 int 类型，槽函数有 `int\long` 类型重载，**则会报错**
> 
> 可以通过多种方式指定需要使用哪一个重载函数处理发送过来的信号  
1. 旧式字符串语法：
```cpp
connect (comboBox, SIGNAL (currentIndexChanged (int)),
	  this, SLOT (WindowlocaleChanged (int)));
```
2. 现代函数指针语法：
```cpp
// 需要使用 qOverload 来指明使用哪个重载版本
connect (comboBox, QOverload<int>:: of (&QComboBox::currentIndexChanged), this, qOverload<int>(&Window::WindowlocaleChanged));
```
3. 使用 lambda 表达式明确指定
```cpp
// 如果 WindowlocaleChanged 有多个重载版本
void Window:: WindowlocaleChanged (int index);
void Window:: WindowlocaleChanged (const QString &text);

connect (comboBox, &QComboBox:: currentIndexChanged, this, this (int index) { this->WindowlocaleChanged (index); });
```
4. 使用强制类型转换
```cpp
// 需要显式指定使用哪个版本
connect(firstDayCombo, &QComboBox::currentIndexChanged, this, static_cast<void (Window::*)(int)>(&Window::firstDayChanged));
```
### 组件和布局初始化
可以观察到，每一个 `create.....GroupBox` 函数需要
- 开始创建所有组件
- 组装所有组件
- 设置组件之间的联系，包括 connect 函数连接和槽函数设计
- 将所有组件排列放入布局中
- **初始化组件和布局默认值**
以 `createGenralGroupBox` 为例：
```cpp
void Window::createGeneralOptionsGroupBox() {
	generalOptionsGroupBox = new QGroupBox(tr("General Options"));
	// 设置每一个标签和下拉列表
	localeLabel = new QLabel(tr("&Locale"));
	// 组装组件
	localeLabel->setBuddy(localeCombo);

	// 设置组件之间的联系
	connect(localeCombo, &QComboBox::currentIndexChanged,
			this, &Window::localeChanged);
	// 设置子布局，复选框组装设置和布局设置，最终会被当做"组件"添加到外部布局中，叫做outerLayout
	QHBoxLayout* checkBoxLayout = new QHBoxLayout;
	checkBoxLayout->addWidget(gridCheckBox);
	checkBoxLayout->addStretch();
	checkBoxLayout->addWidget(navigationCheckBox);
	
	// 将所有组件放入布局中
	QGridLayout* outerLayout = new QGridLayout;
	outerLayout->addWidget(localeLabel, 0, 0);
	generalOptionsGroupBox->setLayout(outerLayout);

	// 手动初始化空间中的默认值，即程序打开后行为
	firstDayChanged(firstDayCombo->currentIndex());
	selectionModeChanged(selectionModeCombo->currentIndex());
	horizontalHeaderChanged(horizontalHeaderCombo->currentIndex());
	verticalHeaderChanged(verticalHeaderCombo->currentIndex());
}
```
由于 connect 函数只负责连接信号和槽，而信号是在**运行时用户发出动作**之后广播。所有组件刚打开时显示的是**连接组件时的默认值**，而实际值**由初始化函数定义**
![[Pasted image 20250925103623.png|正常显示]]
```cpp
	firstDayChanged(firstDayCombo->currentIndex()+1);
	selectionModeChanged(selectionModeCombo->currentIndex()+1);
	horizontalHeaderChanged(horizontalHeaderCombo->currentIndex()+1);
	verticalHeaderChanged(verticalHeaderCombo->currentIndex()+1);
```
![[Pasted image 20250925103614.png|将所有index+1]]
如果下拉 Week starts on，仍旧选择 Sunday，则会恢复正常。

## TextFinder
[Tutorial: Qt Widgets application | Qt Creator Documentation](https://doc.qt.io/qtcreator/zh/creator-writing-program.html)
### QT 自动连接信号和槽

Qt 中的自动信号和槽连接机制：
在 Qt 中，如果你的槽函数遵循特定的命名约定`on_<object_name>_<signal_name>()`，Qt会自动将信号和槽连接
- UI 文件中有一个名为 `findButton` 的按钮（在 `TextFinder.ui` 中定义）
- 头文件中有一个名为 `on_findButton_clicked()` 的槽函数
Qt 会自动将 findButton 的 clicked() 信号连接到`on_findButton_clicked()` 槽函数。这是一种 Qt的约定，称为自动连接（Auto-Connection）。
关于高亮显示文本：

> [!NOTE]
> Qt 的 `QTextEdit::find() `方法本身就会高亮显示找到的文本。当 `find()`方法找到匹配的文本时，它会：
> 1. 将文本编辑器的光标移动到找到的文本位置
> 2. 自动选择（高亮）该文本段
> 这是 Qt 的内置行为，您无需额外编写代码来实现高亮效果。

### QT 资源文件在 MSBuild 环境下的连接方式
如果是常规 CMake 或者 Qmake 构建系统创建的项目，引入资源文件之后需要在 CMakeLists.txt 文件中写入
```cmake
set(PROJECT_SOURCES
        main.cpp
        textfinder.cpp
        textfinder.h
        textfinder.ui
        ${TS_FILES}
        textfinder.qrc
)
```
才能够将文件引入项目，打包到二进制文件中
在 MSBuild 中，在 qrc 和 ui 文件中编辑之后，**一定要按 Ctrl+s**保存，之后 vxproj 文件中会自动将这两个文件中的内容引入。不需要写 CMakeLists. txt，并且写了 MSBuild 也无法读取


## Books
来自 qt 官方文档 https://code.qt.io/cgit/qt/qtbase.git/tree/examples/sql/books?h=6.10 并且 qt creater 中内置
### 初始化数据库部分(initDB. h)
由于 sql 语句是全 ascii 的，所以使用 `QLatin1String` 减少编译时间，并同意用一个实现功能的函数将字符串**预处理**并执行，高效&优雅

本项目使用 sqlite **嵌入式数据库**作为数据库程序：
#### sqlite 和客户端数据库的区别
  SQLite 是嵌入式数据库，不是客户端-服务器数据库：

- 客户端-服务器数据库（如 MySQL, PostgreSQL, SQL Server）:
	 - 需要独立的服务进程在服务器上运行
	 - 客户端通过网络协议连接到服务器
	 - 需要指定主机名、端口、用户名、密码等连接参数
	 - 例如："host=localhost; user=user; password=pwd; database=mydb"
- SQLite 是嵌入式数据库:
	 - 数据库引擎直接链接到应用程序中
	 - 不需要独立的服务器进程
	 - 数据存储在单个文件中（或内存中）
	 - 因此不需要域名、用户名、密码等连接参数
	 - `QSqlDatabase:: addDatabase ("QSQLITE")` 创建了一个 SQLite 数据库连接
	 - `db.setDatabaseName (":memory: ")` 指定使用内存数据库（特殊语法），数据库数据直接存放在内存中，所以不需要设置连接配置
-  ":memory: "特殊含义：
	- `:memory:` 是SQLite的一个特殊标识符
	- 它告诉SQLite在内存中创建一个临时数据库
	- 这个数据库只存在于当前应用程序运行期间
	- 不需要用户名/密码因为它是应用程序内部的
	-  使用 `:memory:` 表示数据存储在内存中
	- 每次程序重启，内存中的数据会完全消失，`initDb()` 函数会在程序启动时重新创建表结构并插入示例数据
- 如果你想让数据永久保存：
	- 将` db.setDatabaseName (":memory: "); `改为文件路径
	- 例如：`db.setDatabaseName ("books. db");`
	- 这样数据会保存在名为 "books. db" 的文件中
	- 重启程序后数据依然存在
#### sql 预处理优化可读性
对于简单的 sql 功能，只有 ascill 字符情况下可以**使用 `constexpre QLatin1String` 预编译字符串**，再将字符串的 sql 预编译，参数绑定，sql 执行封装一个函数中，比如代码中的 addAuthor，addGene 等
#### QSqlQuery 复用陷阱
1. 每次调用 `exec()` 时，会清空之前的 SQL 语句和绑定内容
2. 绑定值：每次调用 `addBindValue()` 时，会累积绑定值，不会自动清空
3. `exec()` 执行：执行当前准备好的 SQL 语句
在每一次执行 addAuthor 等封装好的函数之前，项目中都使用了
```cpp
if (!q.prepare(INSERT_BOOK_SQL))
    return q.lastError();
```
不是每使用一次 sql 语句执行就需要创建一个 QSqlQuery 对象，这个对象可以复用
### 构建窗口部分（bookwindow. h）
#### 最终显示视图和数据模型视图
要查阅并允许修改数据库数据，所以项目中使用了 `QSqLRelationTableMode* model` 将最终需要显示出的数据都存放在 model 指针中，然后通过：
- 表与表之间的链接关系（`setRelation()` 将不同表中的数据关联起来）
- 表的列名字符串不再显示为数据库中的名称（`setHeaderData()` 设置 model 的“显示值”，并不会改动数据库中的元信息）
- model 设置的是由数据库中各张表**根据 `setRelation()` 设置的规则**组合出来的“混合数据表”，别的 TableView 组件可以通过 `setModel()` 来获取这张“表"中的信息（qt 中讲这种行为称为***获取数据模型***）并显示在 gui 界面上。

最终显示在 gui 程序中的图标是通过 `QTableView* tableView` 组件实现的，数据库中的数据经过 model 加工设置之后，显示在 tableView gui中

- configureWidgets 函数中设置的是 tableView 组件的样式
- createModel 函数中设置的是显示数据的内容。
#### 数据模型获取数据库数据
在代码中并没有看到 model 对象在哪里和 sqlite 的 `:memory:` 数据库信息交互，但 model 并不是凭空而来的，可以看到 BookWindow 构造函数中有这样一段代码：
```cpp
if (!model->select()) {
    showError(model->lastError());
    return;
}
```
`select()` 函数 select 了什么？
这就需要知道 sql数据模型和数据库的交互逻辑了，查阅文档：

> ***bool QSqlTableModel::select()***
> Populates the model with data from the table that was set via `setTable()`, using the specified filter and sort condition, and returns true if successful; otherwise returns false.
> 
> Note: Calling `select()` will revert any unsubmitted changes and remove any inserted columns.
> 
>  ***void QSqlTableModel::setTable(const QString &tableName)***
>  Sets the database table on which the model operates to tableName. Does not select data from the table, but fetches its field information.
>  To populate the model with the table's data, call `select()`.
>  Error information can be retrieved with `lastError()`.

可以知道，在调用 `model->select()` 函数前，model 不会存储任何数据库中的数据，有的只是一堆规则，`setTable`，`setRelation` 都只是告诉 model**应该怎样将数据***组织成数据模型***的规则**
并且调用 `select()` 函数之前必须要使用 `setTable(table_name_str)` 告诉需要调用哪一个表

`select()` 如何知道 sql 语句的数据库执行对象？

查阅文档：

> ***QSqlRelationalTableModel:: QSqlRelationalTableModel (QObject *parent = nullptr, const QSqlDatabase &db = QSqlDatabase ())***
> Creates an empty QSqlRelationalTableModel and sets the parent to parent and the database connection to db. If db is not valid, the default database connection will be used.

其中说明一旦调用了 QSqlRelationTableMode 构造函数，那么链接到 db（第二个参数）指向的数据库，如果没有设置，自动调用 `QSqlDataBase()` 构造函数获取，项目中只创建了一个数据库对象（其实多个数据库也不会报错，调用的第一个），就默认连接第一个。

文档中还可以看到，只有 sql 数据模型才有 `select()` 函数重载，其他数据模型没有。
`select()` 函数被调用时，会自动根据之前 `setRelation` 等设置关系的函数设置的参数来构建发送给数据库的 select 语句，并在函数调用时发送给数据库
如果这样设置：
```cpp
model->setTable("books");                    // 目标表
model->setRelation(authorIdx, QSqlRelation("authors", "id", "name"));  // 关系1
model->setRelation(genreIdx, QSqlRelation("genres", "id", "name"));    // 关系2
```
QSqlRelation 的文档说：

>  ***void QSqlRelationalTableModel:: setRelation (int column, const QSqlRelation &relation)*** 
>  Lets the specified column be a foreign index specified by relation.
>  Example:
> 
>  model->setTable ("employee");
>  model->setRelation(2, QSqlRelation("city", "id", "name"));
> 
> The `setRelation()` call specifies that column 2 in table employee is a foreign key that maps with field id of table city, and that the view should present the city's name field to the user.
> Note: The table's primary key may not contain a relation to another table.

也就是说，代码 `model->setRelation(authorIdx, QSqlRelation("authors", "id", "name"));` ：
- 将 books（`setTable` 设置的参考表）中的第 `authorIdx` 列**标记为为外键**（能够与别的表中列数据对应的列）
- 用外键链接到 `authors` 表，链接依据是 `books.author == author.id` 
- 连接之后将数据表中的 authorIdx 列数据显示为 `author.name` 中的数据

```sql
-- books 表实际存储：
id | title       | author | ...
1  | Qt Guide    | 101    | ...
2  | C++ Primer  | 102    | ...

-- authors 表：
id | name
101| John Smith
102| Jane Doe

-- 在表格中显示为：
Title       | Author      | ...
Qt Guide    | John Smith  | ...  ← 显示 name 而不是 101
C++ Primer  | Jane Doe    | ...  ← 显示 name 而不是 102
```

最终得到的 sql 语句会是这样的：
```sql
-- 内部构建的SQL可能是：
SELECT
	b.id,
	b.title,
	b.author,
	b.genre,
	b.year,
	b.rating,
	a.name as author_name,
	g.name as genre_name
FROM books b
LEFT JOIN authors a ON b.author = a.id
LEFT JOIN genres g ON b.genre = g.id
```

#### 通过关系数据模型获取混合数据
对于 `QSqlRelationTableMode` 对象，通过各种 set 函数[[#最终显示视图和数据模型视图|设置其中规则]]并[[#数据模型获取数据库数据|调用`select`函数]]之后，由于这个模型**只保存 setTable设置的参照表引用和各项施加于参照表的规则**，所以有两种获取“混合数据表”中数据的方法：
- 获取参照表的数据
	- `model.fieldIndex(Qstring str)`，通过列`名返回这列数据在表中的 index
	- `model.record().fieldName(int index)`，通过 index 返回列名
	- `model.data(index)` 通过 index 获取列信息
data 还可以填入角色内容这一参数，不同的内容会**看**到不同的数据内容，：查阅文档可知，
```cpp
/ Qt::DisplayRole - 显示给用户看的文本
// Qt::EditRole - 用于编辑的值
// Qt::ToolTipRole - 工具提示
// Qt::UserRole - 自定义数据
```

- 获取参照表中**外键链接的表数据**
	- `model->relationModel(authorIdx)` 会返回外键**指向的表的完整数据**（QSqlTableModel）
	- 
同时由于 `authorComboBox` 和 `genrComboBox` 中的内容是根据数据库中对应列的内容来的，所以必须要设置
```cpp
authorComboBox->setModel (model->relationModel (authorIdx));
authorComboBox->setModelColumn (model->relationModel (authorIdx)->fieldIndex ("name"));
genreComboBox->setModel (model->relationModel (genreIdx));
genreComboBox->setModelColumn (model->relationModel (genreIdx)->fieldIndex ("name"));
```
先 setModel 告诉 combobox 的数据从哪一个数据模型中来，再使用 setModelColumn 告诉 combobox 数据来源于数据模型中的哪一列

#### 数据模型和 UI 控件同步
QDataWidgetMapper 是Qt中实现UI控件与数据模型双向绑定的关键类，它实现了MVVM（Model-View-ViewModel）设计模式中的数据映射功能。

核心功能
1. 双向数据同步
	- 模型→UI：当模型中的当前行改变时，自动将数据填充到对应的UI控件
	- UI→模型：当用户编辑UI控件时，自动将更改保存回模型
2. 数据映射机制
```cpp
mapper->addMapping(mySpinBox, 0);      // mySpinBox ←→ 模型的第0列
mapper->addMapping(myLineEdit, 1);     // myLineEdit ←→ 模型的第1列
mapper->addMapping(myCountryChooser, 2); // myCountryChooser ←→ 模型的第2列
```
`QDataWidgetMapper` 是一个"桥梁"，它**将表单控件（如输入框、组合框）与数据模型的特定列自动同步**。注意控件是和数据模型链接，而不是直接和数据库连接，数据库和数据模型之间的连接关系式由 `setEditStrategy()` 定义
```cpp
model->setEditStrategy(QSqlTableModel::OnManualSubmit);
```
查阅文档可知：

| Constant                         | Value | Description                                                                                    |
| -------------------------------- | ----- | ---------------------------------------------------------------------------------------------- |
| `QSqlTableModel::OnFieldChange`  | 0     | All changes to the model will be applied immediately to the database.                          |
| `QSqlTableModel::OnRowChange`    | 1     | Changes to a row will be applied when the user selects a different row.                        |
| `QSqlTableModel::OnManualSubmit` | 2     | All changes will be cached in the model until either `submitAll()` or `revertAll()` is called. |
这样函数就很好理解了
```cpp
void BookWindow::createMappings() {
    QDataWidgetMapper *mapper = new QDataWidgetMapper(this);
    mapper->setModel(model);
    
    // 设置自定义委托，用于特殊显示（如星级评分）
    mapper->setItemDelegate(new BookDelegate(this));
    mapper->addMapping(titleLineEdit, model->fieldIndex("title"));
    mapper->addMapping(yearSpinBox, model->fieldIndex("year"));
    mapper->addMapping(authorComboBox, authorIdx);
    mapper->addMapping(genreComboBox, genreIdx);
    mapper->addMapping(ratingComboBox, model->fieldIndex("rating"), "currentIndex");
    
    // 表格中选择的行改变 → 更新mapper的当前索引 → 在修改ui或者数据库中的内容是更新表单控件或者数据库数据
    connect(tableView->selectionModel(),
            &QItemSelectionModel::currentRowChanged,
            mapper,
            &QDataWidgetMapper::setCurrentModelIndex
            );
}
```
### 设置委托机制（booksdelegate. cpp）
#### 委托机制 www？
委托就像是一个"UI 设计师"，它告诉 Qt 表格"**这个数据该怎么画出来**"和"**如果要编辑这个数据该用什么工具**"。
自定义一个委托类，继承自 qt 的内置委托类型，可以通过查阅文档来知道**必须要重写什么函数**，委托类可以应用于**任何基于项(item)的视图组件**
项目中的视图主要是 sql 数据视图，所以这里委托类继承 QSqlRelatioalDelegate
```cpp
class BookDelegate : public QSqlRelationalDelegate
```
- 每个组件用什么风格绘制（`paint()`）
- 组件如何修改组件的内容或者状态（`createEditor()`）
- 修改后的效果如何（`setEditorData()`）
委托（Delegate）负责控制数据项的显示和编辑方式。
```md
模型（Model） ←→ 委托（Delegate） ←→ 视图（View）
   数据           显示/编辑策略        用户界面
```
#### 使用前后区别
![[Pasted image 20251015101506.png]]

#### 自定义委托机制实现规则
可以看到代码中对于不是想要实现渲染的列（如 rating 列需要由数字渲染成星星图案），会调用父类默认方法进行渲染
```cpp
if (index.column() != 5) {
	// 如果不是数据库中的第5列，使用父类的标准渲染方法（一般是渲染文字内容，rating栏只会显示星星数量)
	QSqlRelationalDelegate::paint(painter, option, index);
} else { /* code */ }
```
在文档中并没有看到除了析构函数之外的 virtual 函数，说明只需要**选择性地重写需要改变行为的方法**
它封装了**它正在绘制的 item 的**所需的所有视觉状态信息。在一个以 item 组成的组件中，如果对他设置委托对象，那么在绘制这个组件时，就会通过**遍历所有 item**，对每一个 item 使用 paint 绘制方法。
```cpp
class QStyleOptionViewItem {
public:
	QRect rect;                    // 项目矩形区域（位置和大小）
	QPalette palette;              // 颜色调色板
	QStyle::State state;           // 控件状态（选中、启用、聚焦等）
	Qt::Alignment displayAlignment; // 显示对齐方式
	Qt::CheckState checkState;      // 复选框状态
	QIcon icon;                    // 图标
	QString text;                   // 显示文本
	QFont font;                    // 字体信息
	// ... 更多
 };
```
```cpp
QTableView::paintEvent() →
    扫描可视区域中的所有单元格 →
    对于每个单元格：
        创建 QStyleOptionViewItem
        option.rect = 单元格的实际矩形区域
        option.state = 单元格的状态（是否选中、是否激活等）
        ...
        delegate->paint(painter, option, 单元格索引)
```
绘制时需要的大小提示信息通过 `sizeHint` 函数获取，editorEvent 发生在控件值发生改变时，这里 bookdelegate 类将除了评分行的点击事件全部交给父类默认 editorEvent 执行。

- mapper 和 tableView 对象都设置 `setItemDelegate()`，这就导致了 mapper 和 tableView 控件中的任何一个 item 只要发生了**用户对控件的编辑事件**，就会触发调用 `editorEvent()` 调用，同理，如果两者之中的任何一个 item 发生了**用户想要创建对没有编辑框组件的编辑操作事件**（比如对 tableView 中的只读单元格使用双击操作） `createEditor()` 就会被调用
- 由于 mapper 中存在将控件映射到数据模型中数据的关系，那么这些控件中的数据更改一半由数据模型通知 ui 和数据库同事更改。如果后面 mapper 映射的控件中如果有**不可编辑**但**能够被创建编辑**的功能的**可点击区域**就会触发 `editorEvent()` 或者 `createEditor()`
- tableView 中的单元格在双击时会触发数据 createEditor 创建编辑框操作，因为这些组件**在视觉上和逻辑上**是不支持编辑的，用户想要编辑，就会触发对应的操作，在**用户想要编辑一个不可编辑的组件时**发生的行为被 bookDelegate 代理。
- 想要编辑首先要能够编辑，所以要创建可编辑组件，年份单元格我们想要他被编辑时弹出的可编辑框是一个 spinbox 而不是一个简单的文本编辑框，就使用 if 分支特化处理
```cpp
QWidget *BookDelegate::createEditor(QWidget *parent,
                                    const QStyleOptionViewItem &option,
                                    const QModelIndex &index) const
{
    if (index.column() != 4)
        return QSqlRelationalDelegate::createEditor(parent, option, index);

    // For editing the year, return a spinbox with a range from -1000 to 2100.
    QSpinBox *sb = new QSpinBox(parent);
    sb->setFrame(false); // 不显示边框
    sb->setMaximum(2100);
    sb->setMinimum(-1000);
    return sb;
}
```
其他列会被 `QSqlRelationalDelegate::createEditor` 中的默认行为接管，查阅文档可可知 `QSqlRelationalDelagate` 会将外键列的创建编辑框行为默认创建为下拉列表，而其他列则创建默认文本编辑框可以通过注释代码，将所有列的行为交给 `QSqlRelationalDelagate::createEditor` 处理
```cpp
QWidget *BookDelegate::createEditor(QWidget *parent,
                                    const QStyleOptionViewItem &option,
                                    const QModelIndex &index) const
{
    // if (index.column() != 4)
    //     return QSqlRelationalDelegate::createEditor(parent, option, index);

    // // For editing the year, return a spinbox with a range from -1000 to 2100.
    // QSpinBox *sb = new QSpinBox(parent);
    // sb->setFrame(false); // 不显示边框
    // sb->setMaximum(2100);
    // sb->setMinimum(-1000);

    // return sb;
    return QSqlRelationalDelegate::createEditor(parent, option, index);
}
```
![[Pasted image 20251015180605.png]]
![[Pasted image 20251015180620.png]]
![[Pasted image 20251015180703.png]]
可以看到，外检 author 和 gener 还是下拉列表，yer 和 title 被设置为了文本编辑框

## Screenshot
[Taking a Screenshot | Qt Widgets | Qt 6.10.0](https://doc.qt.io/qt-6/zh/qtwidgets-desktop-screenshot-example.html)
### qt 类编写规范
在头文件中只暴露必要的成员和接口
如果一个 qt 类中某些（控件）对象
- 生命周期不是和整个类的生命周期一样长
- 在程序运行过程中只会在**被调用几次的特定的函数中被使用**，
- 临时部件是更复杂的类的实例，并且它们的头文件包含了一些你不想暴露给 `screenshot.h` 的使用方的依赖
- 不需要被其他控件使用（比如其他类需要这个组件的字体信息，大小设置，**不需要使用 setter 和 getter 来让其他类获取**）
那么这些（控件）对象就没必要出现在头文件中（即使是 private 修饰）。不必担心这些控件的依赖关系混乱或者生命周期问题导致的悬空引用
Qt 的对象树模型: Qt 使用对象树来管理内存。当 new 一个 QObject时，如果指定了父对象（例如 `new QGroupBox(tr("Options"), this)` 中的 this），那么当父对象被销毁时，所有子对象也会被自动销毁。对于布局管理器来说，它们通常被设置为父部件的布局，因此它们的生命周期由父部件管理，不需要（有时也不建议）额外的成员变量指针来管理。

通常，UI 对象只会初始化一次显示在屏幕上，ui 控件的状态通过函数修改。如果小对象频繁被创建和销毁会导致性能问题，但如果调用次数不多（或者仅仅初始化一次）就可以忽略。
代码中
```cpp
QLabel *screenshotLabel;
QSpinBox *delaySpinBox;
QCheckBox *hideThisWindowCheckBox;
QPushButton *newScreenshotButton;
```
- screenshotLable 不必多说，程序运行过程中他一直存在，程序的状态（窗口大小，截屏按钮按下）时刻改变着这个 label
- delaySpinbox 有数据调整功能，和程序运行过程中其他内容交互
- checkbox 有变灰的视觉效果，其状态在多个函数中被读取
- newScreenshotButton 的状态在 `newScreenshot` 和 `shootScreen` 函数中被修改（禁用/启用）
### 布局和控件关系
布局是不可见的**管理器**，控制其中对象的排列规则，管理部件几何形状和位置，不关心**其父对象**中有多少子对象，子对象是什么。
控件**大多是可见的**，能够 `addxxx()` 的控件可以看做是一个 container，他只关心其中有什么，不关心其中的东西如何排列。
如果一个控件是 layout，那么它支持**在构造函数中使用 parent 参数指向父对象**，前提是父对象是一个 container，设置好父对象之后，对这个 layout 中的操作（如 addWidget）都会自动纳入父对象中作为子对象
```cpp
QGridLayout *optionsGroupBoxLayout = new QGridLayout(optionsGroupBox);
optionsGroupBoxLayout->addWidget(new QLabel(tr("Screenshot Delay:"), this), 0, 0);
optionsGroupBoxLayout->addWidget(delaySpinBox,0,1);
optionsGroupBoxLayout->addWidget(hideThisWindowCheckBox,1,0,1,2);
mainLayout->addWidget(optionsGroupBox);  // addWidget
// mainLayout->addLayout(optionsGroupBoxLayout);  // addLayout
```
代码中，`optionGroupBoxLayout` 在第一句就已经设置为为 `optionGroupBox` 的布局管理器，所以 mainlayout 中只需要 `mainLayout->addWidget(optionGroupBox)` 即可
如果将 addWidget 替换为 addLayout，就能清晰看到两者的**可见和不可见区别**
![[Pasted image 20251022201110.png|addLayout]] ![[Pasted image 20251022201138.png|addWidget]]
### qt 对象树基本特性
#### 什么是对象树
几乎所有 Qt 对象（QObject 及其派生类，包括可见控件如 QWidget 和不可见对象如 QTimer）在 new 动态分配时，都接受一个可选的 `QObject* parent = nullptr` 参数（通常是最后一个）。这个参数制定了这个对象的父对象是谁。
父对象**最重要的功能是通过对象树管控子对象的生命周期**：

> [!note]
> 自动删除: 当一个父 QObject 被 delete 时，Qt 会自动删除该父对象的所有子对象。这个过程会**递归进行**，即父对象的子对象被删除时，子对象的子对象也会被删除，以此类推，***形成一个完整的树状结构***
> 
> 这种***子对象不能比父对象活得更久***的约束机制，当父对象被销毁时，其所有子对象也必须被销毁，极大地简化了内存管理，开发者只需要关心父对象的生命周期，而不需要记住去手动删除每一个子对象，避免内存泄漏。
> 
> 如果想要子对象脱离父对象管控，可以调用 `setParent(nullptr)` 或 `setParent(newParent)`）。子对象就**脱离了原来的对象树**，不再由原来的父对象管理，需要手动 delete

其次：
1. 层级结构 (Hierarchical Structure):
   * 创建了一个 QObject 的层级树。这个树形结构是 Qt
	 事件传递、对象查找、信号槽连接等机制的基础。
   * 子对象在逻辑上属于其父对象。
2. 事件传播 (Event Propagation):
   * 某些事件（如 QResizeEvent 会发送给窗口部件本身，窗口内的布局会根据新尺寸调整子部件）。QChildEvent 类型的事件（如 `QEvent::ChildAdded` 等，见上文修改）会通知父对象其子对象的变化。鼠标、键盘等输入事件可以在部件层级间传递 (Delivery)，从顶层部件传递给子部件。
   * `QEvent::ChildAdded`, `QEvent::ChildRemoved `等事件用于通知对象其子对象发生了变化
1. 对象查找 (Object Lookup):
   * `QObject::findChild<T>()`, `QObject::findChildren<T>()` 等方法可以在父子关系形成的层级树中递归搜索子对象。
   * `QObject::parent()` 和 `QObject::children()` 方法允许遍历对象树。
4. 信号槽连接 (Signal-Slot Connections):
   * 可以方便地在父子对象之间建立信号槽连接。
   * `Qt::QueuedConnection` 和 `Qt::BlockingQueuedConnection` 涉及事件队列，对象树关系会影响事件的分发和接收。
5. 布局管理 (Layout Management):
   * 对于 QWidget，将部件添加到布局 (`layout->addWidget(widget)`)         时，**布局通常会隐式地将该部件的父对象设置为布局所附加的父部件**。这 是布局系统工作的重要部分。
   * 对于 QLayout，将其设置给 QWidget (`widget->setLayout(layout)`) 时，widget 会隐式地成为 layout 的父对象*，管理 layout 的生命周期
6. 坐标系统 (Coordinate System): (主要针对 QWidget)
   * 子部件的 pos()（位置）是相对于其父部件的坐标系统而言的。
#### 不指定父对象
  Qt QObject** **不会自动识别或分配**一个父对象给一个没有显式指定 parent 的
  QObject 实例。
创建一个 QObject或其子类时，如果没有在构造函数中指定 parent 参数：
* 拥有一个 `nullptr` 的父对象指针。它的 `parent()` 函数会返回 nullptr。
* 不隶属于任何 Qt 对象树。它独立存在，Qt 的对象树内存管理机制不会自动管理它的生命周期。**也就是说脱离之后他自己不会成为一个新的对象树**
* 需要手动管理内存。必须在适当的时机调用 delete 来释放其占用的内存，否则会导致内存泄漏。
### 文件对话框简单用法（QFileDialog）
#### 设置基本参数
```cpp
QFileDialog filedialog(this,tr("Save As"),initialPath /*, "" */);
filedialog.setAcceptMode(QFileDialog::AcceptSave);
filedialog.setFileMode(QFileDialog::AnyFile);
filedialog.setDirectory(initialPath);
```
构造函数设置了文件对话框父对象，窗口标题，打开文件位置，文件筛选器（file-filter），是一个 Qstring 对象，它的编写方式需要遵循一定格式：
过滤器字符串遵循特定的格式：`"DisplayName(*.extension 1 *.extension 2 ...)"`。
```md
"Images (*.png *.jpg *.bmp)": 在过滤器下拉列表中显示名为 "Images"的选项标签，当选择此选项时，文件对话框将只列出扩展名为 .png, .jpg, .bmp 的文件。
"Text Files (*.txt)": 显示名为 "Text Files" 的过滤器，只显示 .txt文件。
"All Files (*)": 显示名为 "All Files" 的过滤器，显示所有文件。
"Image Files (*.png *.xpm *.jpg);;Text Files (*.txt)": 使用 ;;分隔多个过滤器选项。
```
![[PixPin_2025-10-23_17-05-34.png]]
`filedialog.setDirectory(initialPath); ` 相当于再设置了一遍第二个参数
AcceptMode：定义了文件对话框的意图：是用于选择文件来打开还是指定文件名来保存在硬盘上
* `QFileDialog::AcceptOpen`: 对话框用于打开一个或多个现有文件。按钮通常显示为 "Open"。
* `QFileDialog::AcceptSave`: 对话框用于保存文件。如果用户选择了已存在的文件，通常会提示是否覆盖。按钮通常显示为 "Save" 或 "Save As"。
`fileMode`: 定义了用户在文件对话框中选择文件的方式。
* 主要选项:
   * `QFileDialog::AnyFile`:
	 允许用户选择任意文件，包括不存在的文件名。这常用于 "Save As" 对话框，因为用户可能要创建一个新文件。
   * `QFileDialog::ExistingFile`: 允许用户选择一个已存在的文件。这常用于"Open File" 对话框。
   * `QFileDialog::Directory`: 允许用户选择一个目录 (文件夹)。
   * `QFileDialog::ExistingFiles`: 允许用户选择一个或多个已存在的文件。

#### 获取路径中的文件（filter）
- 获取系统默认图片存储位置（windows 一般是 C:/Users/username/picture）
```cpp
QString initialPath = QStandardPaths::writableLocation(QStandardPaths::PicturesLocation);
```
- 获取当前运行的可执行程序所在的目录和当前进程的工作目录（pwd），这比[[CodeLineCounter#获取编译后可执行文件所在位置|使用windows.h提供的api和获取符号表]]的方式高效且清晰，并且跨平台
```cpp
QCoreApplication::applicationDirPath(); // 当前可执行程序的文件路径
QCoreApplication::applicationFilePath(); // 另一种写法
QDir::currentPath(); // 获取pwd
```
- 最终显示对话框的代码是 `fileDialog.exec()`，会返回用户在窗口中的选择结果
	* 如果用户点击 "Cancel"返回 `QDialog::Rejected`），函数返回，不执行保存。
	* 如果用户点击 "Save"返回 `QDialog::Accepted`），获取用户输入或选择的完整文件路径 (fileName)。


```cpp
fileDialog.setMimeTypeFilters(mimeTypes);
fileDialog.selectMimeTypeFilter("image/" + format);
fileDialog.setDefaultSuffix(format);
```

> [!question]
> qt 中表示字符串可以通过 Qstrong，也可以通过 QByteArray 保存，代码中还要先创建 ` QStringList`（是 `QList<QString>` 的封装），然后创建 ` QList<QByteArray>`，再通过 `QImageWriter:: supportedMimeTypes (); ` 将所有支持的格式的字符串一个个放入 mimeTypes 中
> 
>> [!anwser] 这一操作通常出于性能和底层实现的考虑，QByteArray 直接对应 C 风格的字节流。`QFileDialog::setMimeTypeFilters(const QStringList &filters)` 期望接收 `QStringList`。所以必须进行类型转换，将 QByteArray 列表转换为 QStringLIst。`QLatin1String(bf)` 对于 MIME 类型使用 Latin-1 编码，是一种高效和安全的做法

一个 QFileDialog 对象不可多次调用 `selectMimeTypeFilter (const QString &filter)`，但可以设置一个过滤器列表，。也就是说填入其中的可以是一个字符串，这个参数必须是 `setMimeTypeFilters` 设置的列表中的一个具体过滤器字符串（通常是 MIME 类型）。**它不是用逗号分隔的列表**
`selectMimeTypeFilter (const QString &filter)` 只能选择一个已经通过 `setMimeTypeFilters` 设置好的过滤器作为当前默认选中项。它不能添加新过滤器。参数必须是 setMimeTypeFilters 列表中的一个具体的过滤器字符串（如 "image/png"）。
`fileDialog.selectMimeTypeFilter("image/" + format); ` 中的"image/"是一种标准 MIME 文件类型写法：
  "image/“ 是 MIME 类型标准的一部分。

* MIME 类型通常由两部分组成：主类型/子类型 (major-type/sub-type)。
* 对于图片，主类型是 image。
* `QImageWriter::supportedMimeTypes()` 返回的就是这种标准的 MIME 类型字符串列表
这三条语句可以看做是 `QFileDialog filedialog(this,tr("Save As"),initialPath /*, "" */);` 第四个参数的**细化\拓展表示**

QDir 中提供了 toNativeSeparators 函数，可以返回操作系统中路径字符串的对应显示方法，windows 中用 `\`，unix 类系统使用 `/` ，但是内部处理路径时这两种表示方法都会统一处理

### 截屏操作
```cpp
QScreen* screen = QGuiApplication::primaryScreen();
if(const QWindow* window = windowHandle()){
    screen = window->screen();
}
```
首先获取指向主屏幕的指针，然后使用 QWindow 对象存储屏幕信息，然后使用 `windowHandle()`: 这是 QWidget 类的一个成员函数。它的作用是获取当前 `QWidget` 实例（即`Screenshot` 对象）所关联的底层 `QWindow` 对象的指针。QWindow 是 Qt中一个更接近底层窗口系统的类，通常用于 OpenGL 相关操作或需要更直接的窗口管理时。

如果是多屏幕设备，可以使用这样的代码来获取所有屏幕信息：
```cpp
int main(int argc, char* argv[]){
    QGuiApplication app(argc, argv);   // mark
    std::cout << "Hello, from temporal_qt_draft!\n";
    const QList<QScreen*> allScreens = QGuiApplication::screens();
    qDebug() << "number of screens: " << allScreens.size();
    for(const auto& screen : allScreens){
        qDebug() << "screen name: " << screen->name();
        qDebug() << "screen geometry: " << screen->geometry();
        qDebug() << "screen size: " << screen->size();
        qDebug() << "screen available geometry: " << screen->availableGeometry();
        qDebug() << "is primary screen: " << (QGuiApplication::primaryScreen() == screen);
        qDebug() << "------------------------------------";
    }
}
```
屏幕管理这一功能需要首先创建 `QGuiApplication` 对象，不然无法通过这个对象来获取屏幕信息，注释 mark 行代码，会返回 `number of screens： 0`，虽然 `QGuiApplication::screens()` 是一个静态成员函数，但它的执行依赖于 QGuiApplication实例在初始化时设置的全局状态。
然后将**从整个屏幕中抓取的像素信息（不是窗口像素信息）** 存放在位图中 `originalPixmap = screen->grabWindow(0);`

## DocumentViewer
### 从项目的 cmake 构建开始
#### 根目录的 CMakeLists. txt 
```cmake
find_package(Qt6 REQUIRED COMPONENTS Core Gui Widgets
             OPTIONAL_COMPONENTS PrintSupport Pdf PdfWidgets Quick3D)
qt_standard_project_setup(REQUIRES 6.8)
```
- `OPTIONAL_COMPONENTS` 表示后面的模块时可选的，如果没有找到不影响程序的构建和编译，只是编译后的 exe 没有对应功能，这些会体现在代码对这种**缺失情况的处理**上
```cpp
// 在abstractviewer.h中：
#ifdef QT_DOCUMENTVIEWER_PRINTSUPPORT
protected:
    virtual void printDocument(QPrinter *) const {};
#endif
// 在txtviewer.cpp中：
#ifdef QT_DOCUMENTVIEWER_PRINTSUPPORT
void TxtViewer::printDocument(QPrinter *printer) const {
	if (!hasContent())
	 return;
	m_textEdit->print(printer);
}
#endif // QT_DOCUMENTVIEWER_PRINTSUPPORT
```
代码中检查，如果定义了对应的宏，就实现对应函数的功能。
```cmake
add_compile_definitions(QT_NO_CAST_FROM_ASCII)
```
`add_compile_definitions` 的作用是在编译时定义预处理器宏，使整个翻译单元都可以使用该宏。在生成的预处理器输出中，它相当于在代码开头添加 `#define`
`QT_NO_CAST_FROM_ASCII` 的宏定义作用是：
 - 禁止 `const char*`到 QString 的隐式转换
- 仍可以使用字符串字面量，但应该使用现代 Qt 的字符串字面量后缀
-  `"text"_L1` 使用`_L1`后缀（Qt 6.0+中的`Qt::Literals:: operator""_L1`）
- `QLatin1String("text")` - 显式使用QLatin1String
- `QStringLiteral("text")` - 使用QStringLiteral

```cmake
if(TARGET Qt6::PrintSupport)
    add_compile_definitions(QT_DOCUMENTVIEWER_PRINTSUPPORT)
endif()
```
和可选模块语句配合，如果有 `find_package` 找到了对应模块就添加对应的宏
### app/CMakeLists. txt
#### 预编译
```cmake
qt_add_library()
```
用来将一些代码**预编译**之后作为库文件，分为静态库（. a/. lib）和动态库（. so/.dll/. dylib）
`include_directories` 方式：
- 只是告诉编译器在哪里找到头文件
- 每次编译使用该头文件的源文件时，都会重新编译整个头文件内容
- 没有预编译的二进制代码，只提供声明
库目标方式：
- 将源代码编译成二进制格式（静态库或动态库）
- 提供预编译的二进制代码，不需要每次都重新编译
- 提供完整的实现，而不仅仅是声明，最重要的功能是**减少编译时间和代码模块化**
#### 不同平台的编译程序设置
```cmake
set_target_properties(documentviewer PROPERTIES
    WIN32_EXECUTABLE TRUE    # Windows平台：创建GUI应用，不显示控制台窗口
    MACOSX_BUNDLE TRUE       # macOS平台：打包为.app应用程序包
)
```
设置不同平台的编译结果
```cmake
set_target_properties(documentviewer PROPERTIES
    WIN32_EXECUTABLE TRUE
    MACOSX_BUNDLE TRUE
)
```
#### 条件编译&库文件处理
```cmake
if(QT6_IS_SHARED_LIBS_BUILD)
    add_dependencies(documentviewer ${plugin_targets})
else()
    target_link_libraries(documentviewer PRIVATE ${plugin_targets})
endif()
```
Qt 可以以两种方式构建：
- Qt 本身可以编译为静态库或动态库
- 这会影响你的应用程序如何与 Qt 交互
不同的编译方法会触发不同的程序逻辑：
```cpp
// abstractviewer中的代码
#if defined(QT_SHARED) || !defined(QT_STATIC) // 如果是动态连接方式
  if defined(BUILD_ABSTRACTVIEWER_LIB)
    define ABSTRACTVIEWER_EXPORT Q_DECL_EXPORT
  else
    define ABSTRACTVIEWER_EXPORT Q_DECL_IMPORT
  endif
#else  // 否则使用静态连接方式，只将符号链接到程序中，不说明导出
  define ABSTRACTVIEWER_EXPORT
#endif
```
- `QT_SHARED`：如果定义，表示 Qt 库以动态库形式构建
- `!defined(QT_STATIC)`：如果没有定义 QT_STATIC，也认为是动态库模式
接下来判断现在执行到的 abstractviewer 代码是否是在构建库本身
```cpp
// 第2-6行：嵌套条件 - 判断当前是否在构建库本身
  #if defined(BUILD_ABSTRACTVIEWER_LIB)  // 如果定义了这个宏，说明正在构建库
    #define ABSTRACTVIEWER_EXPORT Q_DECL_EXPORT  // 定义为导出（导出符号）
  #else
    #define ABSTRACTVIEWER_EXPORT Q_DECL_IMPORT  // 否则定义为导入（导入符号）
  #endif
```
- `Q_DECL_EXPORT` =` __declspec(dllexport)` (Windows) 或其他导出标识
- `Q_DECL_IMPORT` = `__declspec(dllimport)` (Windows) 或其他导入标识
- linux/macos 默认导出库文件中的所有可见符号，如果需要控制需要在链接阶段通过调整**链接选项**实现。
- windows 如果要导出库中的符号，需要使用 `__deslspec(dllexport/dllimport)`，然后编译器会根据这些内容来决定那些符号可见
- `target_compile_definitions (abstractviewer PRIVATE BUILD_ABSTRACTVIEWER_LIB)` 只影响 abstractviewer 这个目标（库）的编译。
- 然后 abstractviewer 这个**库**执行 `#ifdefined（BUILD_ABSTRACTVIEWER_LIB）#defineABSTRACTVIEWER_EXPORT Q_DECL_EXPORT` 命令，将 abstractviewer 类中所有带有 `ABSTRACTVIEWER_EXPORT` 宏（**被定义为导出符号**）修饰的符号导出。而其他库代码由于看不见 `BUILD_ABSTRACTVIEWER_LIB` 宏，所以看会执行 else 逻辑，将所有带有 ABSTRACTVIEWER_EXPORT 修饰的符号在动静态库中查找（导入符号）
#### 链接可见性选项
```cmake
if(TARGET Qt6::PrintSupport)
    target_link_libraries(documentviewer PRIVATE Qt6::PrintSupport)
    target_link_libraries(abstractviewer PRIVATE Qt6::PrintSupport)
    add_compile_definitions(QT_DOCUMENTVIEWER_PRINTSUPPORT)
endif()
```
- `QT6_IS_SHARED_LIBS_BUILD` 检查 Qt 是否以动态库方式构建，如果是动态库，会添加**依赖构建**，静态库，会使用 `target_link_library` 直接将库文件链接到主程序中。两种连接方式不同，所以要使用不同的函数命令
- `if(TARGET ...)` 是一个条件判断命令，用于检查给定的目标（target）是否存在以及是否已经被定义
-  PRIVATE 是链接库的可见性关键字，指定链接关系的可见性范围。
  三种主要可见性选项：
1. PRIVATE
	- 链接的库只在当前目标内部可见
	- 不会传递给依赖当前目标的其他目标
	- 适用于实现细节，不需要暴露给外部
```cmake
# documentviewer内部可以使用Qt6::Core，但使用documentviewer的程序不能访问Qt6::Core
target_link_libraries(documentviewer PRIVATE Qt6::Core)
```
2. PUBLIC
	- 链接的库不仅当前目标可用，也会传递给依赖当前目标的其他目标
	- 适用于头文件中使用的库
```cmake
# 使用mylib的程序也会自动链接Qt6::Core
target_link_libraries(mylib PUBLIC Qt6::Core)
```
3. INTERFACE
	- 只传递给依赖当前目标的其他目标，当前目标本身不使用
	- 适用于提供接口但不需要直接使用的情况

```cmake
# mylib的定义
target_link_libraries(mylib
	PRIVATE internal_util  # mylib内部使用，myapp不需要
	PUBLIC Qt6::Core      # mylib和myapp都需要Qt6::Core
)

# myapp自动获得Qt6::Core依赖，但不会获得internal_util依赖
target_link_libraries(myapp PRIVATE mylib)
```
由于 qt 的宏设计是跨平台的，所以**不使用 `__declspec()` 而使用 qt 专用宏**无论在什么平台上都能得到想要的效果
#### 安装命令
```cmake
install(TARGETS documentviewer
    BUNDLE  DESTINATION .
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
)

install(TARGETS abstractviewer
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
)
```
 install 命令定义了安装规则，当运行 cmake --install 或 make install 时，这些规则定义了哪些文件被安装到系统的哪个位置。安装规则允许用户将程序安装到系统目录或指定目录，便于部署和分发。
关键词含义：
- RUNTIME：指可执行文件（. exe, 可执行程序）
- LIBRARY：指库文件（. dll, .so, .dylib 等共享库）
- BUNDLE：指 macOS 应用程序包（. app）
- DESTINATION：指定安装的目标路径

预定义变量：
- CMAKE_INSTALL_BINDIR：二进制文件安装目录（通常是 bin）
- CMAKE_INSTALL_LIBDIR：库文件安装目录（通常是 lib）

#### 杂项设置
用于明确说明这个程序在不同的环境下会编译为不同的可执行文件，对吗？
```cmake
if(TARGET pdfviewer)
    list(APPEND plugin_targets pdfviewer)
endif()

if(TARGET Q3Dviewer)
    list(APPEND plugin_targets Q3Dviewer)
endif()
```
- 因为之前 `set(plugin_targets jsonviewer txtviewer)`，plugin_targets 变量变成了一个列表，`list(append ...)` 相当于在列表后面添加内容
- 它用于动态管理插件列表

qt 6.8.0 版本中，QtPDFWidget 库是商业版本 qt 才有的，开源版本 qt 无此功能，可以再 maintenance tools 中看到：
![[PixPin_2025-10-28_14-04-51.png]]
可以通过安装特定版本的 qt 来解决，有时可以用，但有时可能会要求使用对应的编译套件来使用这些库