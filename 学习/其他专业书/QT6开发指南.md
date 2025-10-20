# GUI 程序设计基础
## GUI 程序结构与运行机制
### 杂项
使用 qmake 构建的 qt 项目才会有 pro 文件，简单 qmake 写法如下：
```qmake
QT += core gui
greaterThan(QT_MAJOR_VERSION, 4): QT += widgets
CONFIG += c++11
SOURCES += main.cpp \
widget.cpp
HEADERS += widget.h
FORMS += widget.ui
# Default rules for deployment
qnx: target.path = /tmp/$${TARGET}/bin
else: unix:!android: target.path = /opt/$${TARGET}/bin
!isEmpty(target.path): INSTALLS += target
```
其中的“`$${TARGET}`”就是替换函数，表示用变量 TARGET 的值替换。将“`$${TARGET}`”写成“`$$TARGET`”也可以
以 `ui_` 开头的. h 文件是 uic 系统生成的类文件，Ui_Widget 类没有父类，不是从 QWidget 继承而来的，所以 Ui_Widget 不是一个窗口类。
`setUpUi()` 函数有一个传入参数，在. h 文件中见到的更多是传入 this，表示将这个 ui 中的内容渲染在当前类中
当一个信号与多个槽函数关联时，槽函数按照建立连接时的顺序依次运行
一个信号可以连接另一个信号
当一个信号被发射时，与其关联的槽函数通常被立即运行，只
有当信号关联的所有槽函数运行完毕后，才运行发射信号处后面的代码

### 伙伴（buddy）
“伙伴”是一个**语义关联机制**，用于实现：点击某个标签（QLabel），自动聚焦到它所“伙伴”的输入控件上（如 QLineEdit、QComboBox 等）
多用于表单中：
```cpp
[姓名:] [____________________]   ← 点击“姓名:”，光标自动跳到输入框
```
为一个组件设置 buddy 等价于：
```cpp
// 代码中设置
label->setBuddy(lineEdit_name);

// xml中设置
<property name="buddy">
    <cstring>lineEdit_name</cstring>
</property>
```
### 布局的本质
使用代码或者手动在 designer 中**拖动**设置组件位置：
```cpp
QLabel *label = new QLabel("Hello", this);
label->move(50, 50);
label->resize(100, 30);
```
会带来下面的影响：
- 不响应窗口大小变化 → 窗口拉大时控件位置不变 → 界面错乱（**最重要**）
- 不适配不同分辨率/缩放比例 → 在高DPI屏幕上显示异常
- 难以维护 → 修改一个控件位置，可能影响其他控件

布局管理器（Layout Manager）是一套“自动排版引擎”，它根据控件的大小策略（size policy）、最小/最大尺寸、权重（stretch factor）等属性，动态计算每个控件的位置和尺寸。
- **规则引擎**：定义控件如何排列（水平、垂直、网格）
- **尺寸计算器**：根据可用空间和控件属性，动态分配尺寸
- **事件监听器**：当窗口大小变化时，自动重新计算并重绘控件

当你把一个控件加入布局（比如 `layout->addWidget(widget)`）时，Qt 会：
```cpp
// 设置父对象（Parent）
widget->setParent(layout->parentWidget());
// → 控件的父对象不再是原窗口，而是布局的“宿主窗口”
// 设置大小策略（Size Policy）
widget->setSizePolicy(QSizePolicy::Preferred, QSizePolicy::Preferred);
// → 默认为“优先级适配”，允许布局调整其尺寸
// 设置最小/最大尺寸
widget->setMinimumSize(100, 30);
widget->setMaximumSize(200, 60);
// → 布局会尊重这些限制，不会让控件超出范围
// 设置伸缩因子（Stretch Factor）
layout->addWidget(widget1, 1);  // 权重为1
layout->addWidget(widget2, 2);  // 权重为2 → 占用更多空间
// → 决定控件在可用空间中的“分配比例”
layout->invalidate();  // 标记布局需要重新计算
layout->update();      // 立即执行重算
// → 当窗口大小变化、控件数量增减、尺寸策略改变时，布局会自动触发重算
```

