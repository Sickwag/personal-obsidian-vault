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
