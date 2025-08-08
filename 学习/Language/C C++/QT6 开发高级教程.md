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
### 🔹 `QIODevice` 是 Qt 中所有 I/O 设备的基类
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
## 🔍 二、`QMessageBox::Save | Discard | Cancel` 到底发生了什么？
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