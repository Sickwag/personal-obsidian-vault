# Qt 核心
## 信号与插槽
### 槽函数重载在 connect 函数中的表示方法
[Signals & Slots | Qt Core | Qt 6.10.0](https://doc.qt.io/qt-6/zh/signalsandslots.html)
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

| 前缀 | 类型 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| `(无)` | `const char[]` | 普通/窄字符串，编码取决于编译器，通常是本地编码（如 Windows-1252, Latin-1）或 UTF-8。 | `"Hello"` |
| `u8` | `const char8_t[]` (C++20) | UTF-8 编码的窄字符串。**从 C++20 开始，`char8_t` 是独立的字符类型**。在 C++17 及之前，它产生的类型是 `const char[]`。 | `u8"你好"` |
| `u` | `const char16_t[]` | UTF-16 编码的字符串。通常用于 Windows API 或其他原生使用 UTF-16 的系统。 | `u"Привет"` (俄语 "你好") |
| `U` | `const char32_t[]` | UTF-32 编码的字符串。拥有固定宽度的字符，便于处理任意字符。 | `U"こんにちは"` (日语 "你好") |
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
> The setRelation () function calls establish a relationship between two tables. The first call specifies that column 2 in table employee is a foreign key that maps with field id of table city, and that the view should present the city's name field to the user. The second call does something similar with column 3.
> The setRelation () call specifies that column 2 in table employee is a foreign key that maps with field id of table city, and that the view should present the city's name field to the user.
> 
> 第一个 setRelation 表示将 employee 表的第 2 列设置一个外键，链接到 city 表中的 id 列，最终将 city 表中 id 列与 employee 表中的第 2 列相等的记录的 city 表中的 name 属性显示在 id 表中的 city 列



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
### QT 信号槽机制
Qt 信号槽机制是 Qt 框架的核心特性之一，它提供了一种类型安全的对象间通信方式。当某个事件发生时（如按钮被点击、文本被修改等），对象会发出信号（signal）；其他对象可以通过连接信号到槽函数（slot，注意本质是一个函数）来响应这些事件。
- 信号槽机制依赖于 Qt 的元对象系统，会在编译时分析 qt 代码，然后生成额外的元信息代码插入其中
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
> Qt 的 QTextEdit::find() 方法本身就会高亮显示找到的文本。当 `find()`方法找到匹配的文本时，它会：
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
在代码中并没有看到 model 对象在哪里和 sqlite 的 `:memory:` 数据库信息交互，但并不是 model 




同时由于 `authorComboBox` 和 `genrComboBox` 中的内容是根据数据库中对应列的内容来的，所以必须要设置
```cpp
authorComboBox->setModel (model->relationModel (authorIdx));
authorComboBox->setModelColumn (model->relationModel (authorIdx)->fieldIndex ("name"));
genreComboBox->setModel (model->relationModel (genreIdx));
genreComboBox->setModelColumn (model->relationModel (genreIdx)->fieldIndex ("name"));
```
