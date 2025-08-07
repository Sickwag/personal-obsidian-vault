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