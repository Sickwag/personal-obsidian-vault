## 简单 GUI 开发
### main 程序
```cpp
#include "widget.h"
#include <QApplication>
int main(int argc, char *argv[]) {
    QApplication a(argc, argv); // the object of program, event circulator and application-level settings
    Widget w;                   // instantiation a window obj to show program
    w.show();                   // show window
    return a.exec();            // start program, make program show launch in the window
}
```
### 类头文件（notepad.h）
```cpp
#ifndef NOTEPAD_H
#define NOTEPAD_H
#include <QMainWindow>
QT_BEGIN_NAMESPACE
namespace Ui {
class Notepad;
}
QT_END_NAMESPACE
class Notepad : public QMainWindow
{
    Q_OBJECT
public:
    Notepad(QWidget *parent = nullptr);
    ~Notepad();
private:
    Ui::Notepad *ui; // 指向记事本 UI 类的指针
};
#endif // NOTEPAD_H
```
- 类声明包含 `Q_OBJECT` 宏。它必须放在类定义的首位，并将我们的类声明为 [QObject](https://doc.qt.io/qt-6/zh/qobject.html) 。当然，它也必须继承于 [QObject](https://doc.qt.io/qt-6/zh/qobject.html) 。[QObject](https://doc.qt.io/qt-6/zh/qobject.html) 在普通 C++ 类的基础上增加了几种能力。值得注意的是，类名和槽名可以在运行时查询。还可以查询槽的参数类型并调用它。
- 构造函数中 QWidget 参数值 0 表示该部件没有父部件（它是一个顶级部件）。
### 信号槽机制
**信号和槽都是一个函数，信号只有函数名，没有实现；槽是一个完整的函数，可执行某种功能。信号和槽的参数需要相同；一个信号可以通过connect函数和多个槽相连**
#### 信号
发送者发出信号
- 当某个事件发生时，**对象会发出信号**。
- 例如：按钮被点击、窗口标题改变、右键菜单请求等。
- 信号由 Qt 自动发出（也可手动触发），不需要你写逻辑去“发送”。
#### 槽
本质上是一个**成员函数**，接受者**拥有槽函数**并相应对应的信号
- 槽是**普通的成员函数**，但它可以被信号“连接”后自动调用。
- 可以是系统预定义的槽（如 `show()`、`close()`），也可以是你自定义的函数。

打开对应操作系统中的家目录
```cpp
QString dir = QStandardPaths::writableLocation(QStandardPaths::HomeLocation);
QString filePath = QFileDialog::getOpenFileName(
    this,
    "打开文件",
    dir,
    "文本文件 (*.txt);;所有文件 (*)"
);
```
### `QIODevice` 是 Qt 中所有 I/O 设备的基类
- 包括：`QFile`、`QSerialPort`、`QTcpSocket` 等。
- 它定义了一组 **访问模式（Access Mode）**，用于指定打开设备的方式。

常见的 `QIODevice::OpenModeFlag` 枚举值（可组合使用）

| `QIODevice::ReadOnly`   | 只读方式打开                   |
| ----------------------- | ------------------------ |
| `QIODevice::WriteOnly`  | 只写方式打开（写入、覆盖）            |
| `QIODevice::ReadWrite`  | 读写方式打开                   |
| `QIODevice::Append`     | 追加模式（写入内容加到文件末尾）         |
| `QIODevice::Truncate`   | 打开时清空文件内容                |
| `QIODevice::Text`       | 文本模式（自动处理换行符`\n`↔`\r\n`） |
| `QIODevice::Unbuffered` | 无缓冲（立即写入）                |
## `|` 的本质：位或（Bitwise OR）—— 用于“打包多个标志”
Qt 使用一种叫 **位标志（Flags）** 的技术，让一个整数可以表示多个布尔选项。
### 示例：`QIODevice::OpenMode`
```cpp
enum OpenModeFlag {
	ReadOnly = 0x0001, // 二进制: 00000001
	WriteOnly = 0x0002, // 二进制: 00000010
	Text = 0x0004, // 二进制: 00000100
};
```
当你写：
```cpp
QIODevice::WriteOnly | QIODevice::Text
// = 0x0002 | 0x0004 = 0x0006 (二进制: 00000110)
```
👉 这个结果表示：“**同时启用 WriteOnly 和 Text 模式**”。
函数 `open()` 收到 `0x0006` 后，会检查每一位，知道你要“只写 + 文本模式”。
✅ 所以：`|` 是“**我都要**”的意思。
## `QMessageBox::Save | Discard | Cancel` 到底发生了什么？
```cpp
QMessageBox::question(this, "提示", "保存吗？",
QMessageBox::Save | QMessageBox::Discard | QMessageBox::Cancel);
```
### 1. `|` 仍然表示“组合” —— 告诉对话框：“请显示这三个按钮”
- `Save = 0x00001000`
- `Discard = 0x00002000`
- `Cancel = 0x00004000`
- 组合后：`0x00007000`

👉 传给 `question()` 函数的是一个“按钮掩码”（button mask），表示“**可用的按钮集合**”。
### 2. 对话框创建时，解析这个掩码，显示三个按钮
### 3. 用户点击后，函数返回 **用户实际点击的那个按钮**（如 `QMessageBox::Save`）
```cpp
// 你想打开一个文件：只写 + 文本模式 → 两个都生效
file.open(WriteOnly | Text);

// 你想弹出对话框：提供三个按钮 → 三个都显示，但用户只能选一个
int result = QMessageBox::question(this, "标题", "内容", Save | Discard | Cancel);

if (result == Save) { ... }
else if (result == Discard) { ... }
else if (result == Cancel) { ... }
```
这是一种位运算的方式，巧妙地实现可读性和代码性能的提升用，一个参数就能传多个布尔选项
# QT Widgets
## Widgets Tutorial - Nested Layouts
创建一个类似这样表格应用
![[Pasted image 20250808104506.png]]
```cpp
#include <QtWidgets>

int main(int argc, char *argv[]) {
  QApplication app(argc, argv);
  QWidget window;

  QLabel *queryLabel =
      new QLabel(QApplication::translate("nestedlayouts", "Query:"));
  QLineEdit *queryEdit = new QLineEdit();
  QStandardItemModel model;
  model.setHorizontalHeaderLabels(
      {QApplication::translate("nestedlayouts", "Name"),
       QApplication::translate("nestedlayouts", "Office")});
  const QStringList rows[] = {
      QStringList{QStringLiteral("Verne Nilsen"), QStringLiteral("123")},
      QStringList{QStringLiteral("Carlos Tang"), QStringLiteral("77")},
      QStringList{QStringLiteral("Bronwyn Hawcroft"), QStringLiteral("119")},
      QStringList{QStringLiteral("Alessandro Hanssen"), QStringLiteral("32")},
      QStringList{QStringLiteral("Andrew John Bakken"), QStringLiteral("54")},
      QStringList{QStringLiteral("Vanessa Weatherley"), QStringLiteral("85")},
      QStringList{QStringLiteral("Rebecca Dickens"), QStringLiteral("17")},
      QStringList{QStringLiteral("David Bradley"), QStringLiteral("42")},
      QStringList{QStringLiteral("Knut Walters"), QStringLiteral("25")},
      QStringList{QStringLiteral("Andrea Jones"), QStringLiteral("34")}};
  QList<QStandardItem *> items;
  for (const auto &row : rows) {
    items.clear();
    for (const auto &text : row) {
      items.append(new QStandardItem(text));
    }
    model.appendRow(items);
  }
  QTableView *resultView = new QTableView();
  resultView->setModel(&model);
  resultView->verticalHeader()->hide(); // 隐藏最左侧的序号列
  resultView->horizontalHeader()->setStretchLastSection(true);

  QHBoxLayout *queryLayout = new QHBoxLayout();
  queryLayout->addWidget(queryLabel);
  queryLayout->addWidget(queryEdit);

  QVBoxLayout *mainLayout = new QVBoxLayout();
  mainLayout->addLayout(queryLayout);
  mainLayout->addWidget(resultView);

  window.setLayout(mainLayout);
  window.setWindowTitle(
      QApplication::translate("nestedlayouts", "Nested layouts"));
  window.show();
  return app.exec();
}
```
如果注释掉 `item.clear()`，则会出现这种错误
![[Pasted image 20250808104557.png]]

## Model/View Programming 模型/视图编程
## Qt Widgets Examples
### Analog Clock
效果图
![[Pasted image 20250808105222.png]]
# From QWidgetDemo
参考链接 [QWidgetDemo: Qt编写的一些开源的demo，支持Qt4、Qt5、Qt6，支持任意系统，预计会有100多个，一直持续更新完善，代码简洁易懂注释详细，每个都是独立项目，非常适合初学者，代码随意传播使用，拒绝打赏和捐赠，欢迎留言评论！公众号：Qt实战/Qt入门和进阶/Qt教程](https://gitee.com/feiyangqingyun/QWidgetDemo)
## control
### battery
#### battery. cpp
paintEvent 控制所有绘制图形的函数，注意回渲染顺序
```cpp
void Battery::paintEvent(QPaintEvent *)
{
    //绘制准备工作,启用反锯齿
    QPainter painter(this); // 传递 this 表示绘图的目标是当前窗口部件（如自定义的Widget），后续所有绘制操作将在这个部件表面上进行。
    painter.setRenderHints(QPainter::Antialiasing | QPainter::TextAntialiasing);    
    // 设置绘图时的渲染提示（Render Hints），用于控制绘图的视觉质量。
    // 这里启用了两个渲染提示（通过按位或 | 组合）：
    // QPainter::Antialiasing：启用图形抗锯齿，使绘制的几何图形（如线条、多边形）边缘更加平滑，减少锯齿感。
    // QPainter::TextAntialiasing：启用文本抗锯齿，使文字渲染时边缘平滑，提升显示效果。

    // 绘制顺序很关键：先绘制边框，再绘制背景进度，最后绘制电池“头”。
    // 这样可以保证进度条被边框包裹、头部始终显示在最上层，层级关系更自然。
    drawBorder(&painter);
    //绘制背景
    drawBg(&painter);
    //绘制头部
    drawHead(&painter);
}
```

---
绘制边框
```cpp
void Battery::drawBorder(QPainter *painter)
{
    painter->save();

    double headWidth = width() / 15;
    double batteryWidth = width() - headWidth;

    //绘制电池边框，定义两个点，左上角和右下角两个点，根据这两个QPointF画出一个矩形
    QPointF topLeft(borderWidth, borderWidth);
    QPointF bottomRight(batteryWidth, height() - borderWidth);
    batteryRect = QRectF(topLeft, bottomRight);

    // 使用 drawRoundedRect 绘制圆角边框；边框颜色采用单色画笔（渐变只用于填充）。
    painter->setPen(QPen(borderColorStart, borderWidth)/*Constructs a default black solid line pen with 1 width.*/);
    // brush设置填充颜色，第四个参数控制圆角半径的单位，默认为`绝对大小`，如果设置Qt::RelativeSize, xRadius and yRadius are specified in percentage of half the rectangle's width and height respectively, and should be in the range 0.0 to 100.0
    painter->setBrush(Qt::NoBrush);
    painter->drawRoundedRect(batteryRect, borderRadius, borderRadius);

    painter->restore();
}
```
- 其中 pen 用来绘制边框，brush 用于设置**图形内的填充颜色**
- 每个子绘制函数都需要使用以 `painter->save()` 开头，以 `painter->restore()` 结尾，本质是实现 `QPainter` 上下文的**沙箱式隔离**，确保局部绘制操作**不影响全局状态**。一个 save 对应一个 restore，允许多次 save，但是多次 restore 会导致 segament fault
```cpp
painter.save();   // 将当前绘图状态推入内部栈
...               // 在此之间可任意修改QPainter属性
painter.restore(); // 恢复栈顶的状态，抹除所有中间修改
// - Qt内部使用**状态栈**（`QPainterState`链表），每个`save()`增加一个节点
// - `restore()`时直接回滚到栈顶状态
```
- drawRoundedRect 第一个参数设置**多边形的引用**，然后设置 x 和 y 轴方向上的圆角曲率

| 参数        | 类型             | 含义               | 单位/范围                                                        |
| --------- | -------------- | ---------------- | ------------------------------------------------------------ |
| `rect`    | `QRectF`       | 绘制的矩形区域（包含坐标和尺寸） | 逻辑绘图坐标（可受变换影响）                                               |
| `xRadius` | `qreal`        | 圆角的水平轴半径         | 0 ～ rect.width ()/2                                          |
| `yRadius` | `qreal`        | 圆角的垂直轴半径         | 0 ～ rect.height ()/2                                         |
| `mode`    | `Qt::SizeMode` | 半径的单位模式          | `Qt::AbsoluteSize`（绝对值）<br>`Qt::RelativeSize`（相对于尺寸 0.0～1.0） |
可以这样用：
```cpp
painter.drawRoundedRect(
    QRectF(10, 10, 200, 100),
    20, 30, 
    Qt::AbsoluteSize
); // 实际圆角为 x=20, y=30
painter.drawRoundedRect(
    QRectF(10, 10, 200, 100),
    0.5, 0.5, 
    Qt::RelativeSize
); // 圆角 x=(200*0.5)=100, y=(100*0.5)=50 → 极端椭圆效果
```
绘制背景 drawBg
```cpp
void Battery::drawBg(QPainter *painter)
{
    if (value == minValue) {
        return;
    }

    painter->save();

    // 根据当前值是否低于告警阈值，选择不同的纵向渐变色，形成“低电量变红”的直觉反馈。
    QLinearGradient batteryGradient(QPointF(0, 0), QPointF(0, height()));
    if (currentValue <= alarmValue) {
        batteryGradient.setColorAt(0.0, alarmColorStart);
        batteryGradient.setColorAt(1.0, alarmColorEnd);
    } else {
        batteryGradient.setColorAt(0.0, normalColorStart);
        batteryGradient.setColorAt(1.0, normalColorEnd);
    }// 设置背景渐变色

    // 通过 margin 留出内边距，使进度条与边框有视觉呼吸感。
    // unit = 每 1% 电量对应的像素宽度，currentValue 经由动画逐步逼近 target value。
    int margin = qMin(width(), height()) / 20;
    double unit = (batteryRect.width() - (margin * 2)) / (maxValue - minValue);
    double width = currentValue * unit;
    QPointF topLeft(batteryRect.topLeft().x() + margin, batteryRect.topLeft().y() + margin);
    QPointF bottomRight(width + margin + borderWidth, batteryRect.bottomRight().y() - margin);
    QRectF rect(topLeft, bottomRight);
    // 控制边框中的电量背景内边距

    painter->setPen(Qt::NoPen);
    painter->setBrush(batteryGradient);
    painter->drawRoundedRect(rect, bgRadius, bgRadius);

    painter->restore();
}
```

### battery.h
声明 qt 属性，`Q_PROPERTY` 是**元对象系统**（Meta-Object System）的核心特性之一，它为C++类添加了动态属性描述能力。
- **不是普通成员变量**：它向Qt的元对象编译器（MOC）注册了一个**可反射的属性**
- **动态类型系统**：使编译后的程序仍能查询/操作该属性（类似Java/Python的反射）
标准声明结构
```cpp
Q_PROPERTY(
    类型 属性名
    READ 读取函数 
    [WRITE 写入函数] 
    [RESET 重置函数] 
    [NOTIFY 变化信号] 
    [REVISION 版本号]
    [DESIGNABLE 设计时可见]
    [SCRIPTABLE 脚本可访问]
    [STORED 是否持久化]
    [USER 主要用户属性]
    [CONSTANT 常量属性]
    [FINAL 终极属性]
)
```

使用 `Q_PROPERTY(double minValue READ getMinValue WRITE setMinValue)` 这样的代码，含义为：
- 声明属性名为 `minValue`，类型为 `double`（Qt会自动映射到QMetaType系统）
- 指定**读取方法**必须满足：
	- 返回类型与属性类型匹配（`double`）
	- 无参数（`double getMinValue() const`）
	- 通常为 `const` 成员函数
- **`WRITE setMinValue`**  
    指定**写入方法**必须满足：
    - 接收单个参数（`void setMinValue(double value)`）
    - 参数类型与属性类型匹配
    - 通常包含值变化检测和信号发射
本质上一种零成本抽象，最终调用直接映射到成员函数，Q_PROPERITY 只是一个宏，使用相当于
```cpp
property("minValue") 
→ QMetaObject::propertyIndex("minValue") 
→ QMetaProperty::read(this) 
→ getMinValue()
```
