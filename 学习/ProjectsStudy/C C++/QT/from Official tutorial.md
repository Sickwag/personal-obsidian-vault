# QT 官方文档原理讲解
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
![[../../../../Files & LongText/Attachments/Pasted image 20250921113557.png|一套代码，多个主题]]
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
![[../../../../Files & LongText/Attachments/Pasted image 20250924105442.png]]
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

![[../../../../Files & LongText/Attachments/Pasted image 20250924120532.png]]

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

