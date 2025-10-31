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

### 信号与槽的使用
当一个信号与多个槽函数关联时，槽函数按照建立连接时的顺序依次运行
一个信号可以连接另一个信号
当一个信号被发射时，与其关联的槽函数通常被立即运行，只有当信号关联的所有槽函数运行完毕后，才运行发射信号处后面的代码
使用符合 qt 规定格式的函数名称连接信号和槽的操作是在 `setUpUi()` 函数中执行的：
```cpp
void on_<object name>_<signal name>(<signal parameters>);
```
`setUpUi` 函数中会默认使用来**遍历**一个 ui（通常是 QWidget 组件）控件中的所有组件名称和他们所拥有的信号名称，**将所有匹配的结果连接起来**
```cpp
QMetaObject::connectSlotsByName(Dialog);
```
由于 `ui_` 文件是通过 uic 生成的，在这个过程中并不会检查错误，所以 `QMetaObject::connectSlotsByName(Dialog);` 用于编译期检查错误，如果信号和槽函数连接符合规范（特定函数名称）并且参数能够被接受
它的内部逻辑大概为：
```cpp
void QMetaObject::connectSlotsByName(QObject *obj) {
    // 获取对象的所有子控件
    const QObjectList children = obj->children();

    // 遍历每个子控件
    for (QObject *child : children) {
        // 获取子控件的名称
        QString childName = child->objectName();

        // 遍历当前对象的所有槽函数
        for (int i = obj->metaObject()->methodOffset(); i < obj->metaObject()->methodCount(); ++i) {
            QMetaMethod method = obj->metaObject()->method(i);
            if (method.methodType() == QMetaMethod::Slot) {
                QString methodName = method.name();

                // 检查是否符合 on_<objectName>_<signalName>() 格式
                if (methodName.startsWith("on_")) {
                    int underscorePos = methodName.indexOf('_', 3); // 第二个下划线
                    if (underscorePos > 0) {
                        QString objectPart = methodName.mid(3, underscorePos - 3);
                        QString signalPart = methodName.mid(underscorePos + 1);

                        // 匹配对象名称
                        if (objectPart == childName) {
                            // 查找对应的信号
                            QMetaMethod signal = findSignal(child, signalPart);

                            if (signal.isValid()) {
                                // ⚡ 真正的 connect() 被调用！
                                QObject::connect(child, signal, obj, method);
                            }
                        }
                    }
                }
            }
        }
    }
}
```
通过 qt 反射机制（不是标准 C++内容）实现读取函数名称来连接

### QT 项目构建过程
总体流程
![[Pasted image 20251020205938.png]]
- 由于 QT 有自定义宏，关键字和特殊文件但使用 C++进行描述，构建应用程序，所以这些**非标准 C++** 内容都会经过特殊处理后，变为**标准 C++** 代码，通过**标准 C++编译器**构建可执行程序。
- `moc_dialog.cpp` 是 MOC 读取文件 `dialog.h` 的内容后生成的一个元对象代码文件，文件 `moc_predefs.h` 里是一些宏定义，资源文件 `res.qrc` 会被编译为 `qrc_res.cpp`
- 只要**头文件类**中包含 `Q_OBJECT` 宏，那么 MOC 就会为他生成对应的 `moc_classname.cpp` 文件
- 使用 MOC、UIC 和 RCC 编译各原始文件的过程称为预编译过程，预编译之后生成的是标准
- C++语言的程序文件

### Debug 模式和 Release 模式区别
| 模式          | 目标         | 特点                     |
| ----------- | ---------- | ---------------------- |
| **Debug**   | 调试、开发、排查错误 | 包含符号表、断点支持、无优化、运行慢、体积大 |
| **Release** | 发布、部署、性能优化 | 无符号表、高度优化、运行快、体积小、难调试  |
一个除去main.cpp外仅由一个类（dialog）组成的qt项目，Release模式编译得到的内容：
```cpp
dialog.o
main.o
moc_dialog.cpp
moc_dialog.o
moc_predefs.h
qrc_res.cpp
qrc_res.o
samp2_2.exe
samp2_2_resource_res.0
// 如果使用 debug 模式编译，还会得到 
samp2_2.pdb ← Windows 平台调试信息文件
samp2_2.dSYM ← macOS 平台调试信息目录（可选）
```
并且编译出的可执行文件**体积更小，不包含符号表，去除调试信息，代码优化程度更高，禁用所有断言 assert ，限制内联，关闭所有安全检查**，
在 qmake/cmake 中，可以使用下面代码控制编译模式：
```cmake
# cmake
set(CMAKE_BUILD_TYPE Debug)   # Debug
set(CMAKE_BUILD_TYPE Release) # Release

# cmake中支持既保留调试信息，又进行优化的混合编译模式
set(CMAKE_BUILD_TYPE RelWithDebInfo)

# qmake
CONFIG += debug   # Debug 模式
CONFIG += release # Release 模式
```
## 代码化 UI 设计
编撰完成：
[[C++ practice case#Qt 项目代码#quick_example qt 6高级开发书籍#2.3 代码化 UI 设计]]
需要注意的有：
- qt 的自动通过命名连接机制（即给槽函数命名为 `on_someObject_someSignalHappened()` 会将控件和的信号和对应的槽函数连接起来）**只作用于在 UI 文件中***可视化编辑控件并且在代码中编写逻辑***的情况**，如果 ui 文件（准确的说是通过 uic 生成的 cpp 文件）中没有对应的控件，没有自动连接效果。
- 这种机制同时只对**下划线命名法有效果**
- qt **不建议使用指针或者引用**来修改对象的属性，更建议使用 setter 和 getter，因为大部分情况下，使用 getter 函数返回的是对象属性的副本，而不是指向对象的指针。如获取 QPlainText 中的文本字体，使用 `QFont& font = plainText.font()` 获取的是副本，修改不会生效并且可能会报错：
```bash
error: C2440: “初始化”: 无法从“const QFont”转换为“QFont &”
error C2440: “初始化”: 无法从“const QFont”转换为“QFont &”
note: 转换丢失限定符
```
## 使用 CMake 构建系统
### 标准 qt cmake 项目配置
```cmake
cmake_minimum_required(VERSION 3.5) #需要的 CMake 最低版本
project(samp2_4 VERSION 0.1 LANGUAGES CXX) #项目版本 0.1，编程语言是 C++
set(CMAKE_INCLUDE_CURRENT_DIR ON)
set(CMAKE_AUTOUIC ON) #UIC 能被自动执行
set(CMAKE_AUTOMOC ON) #MOC 能被自动执行
set(CMAKE_AUTORCC ON) #RCC 能被自动执行
set(CMAKE_CXX_STANDARD 11) #设置编译器需要满足的 C++语言标准，设置为 C++11
set(CMAKE_CXX_STANDARD_REQUIRED ON) #要求编译器满足 C++标准

find_package(Qt${QT_VERSION_MAJOR} COMPONENTS Widgets REQUIRED) #导入 Qt6::Widgets 模块
set(PROJECT_SOURCES #设置变量 PROJECT_SOURCES 等于下面的列表
	main.cpp #也就是项目的源文件列表
	dialog.cpp
	dialog.h
	dialog.ui
)
if(${QT_VERSION_MAJOR} GREATER_EQUAL 6) #如果是 Qt 6 以上的版本
	qt_add_executable(samp2_4 #创建可执行文件 samp2_4
	MANUAL_FINALIZATION #可选参数，手动结束创建目标的过程
	${PROJECT_SOURCES} #文件列表来源于变量 PROJECT_SOURCES
)
endif()
#在连接生成目标 samp2_4 时，需要利用前面用 find_package()导入的 Qt6::Widgets 模块
target_link_libraries(samp2_4 PRIVATE Qt${QT_VERSION_MAJOR}::Widgets)
set_target_properties(samp2_4 PROPERTIES
	MACOSX_BUNDLE_GUI_IDENTIFIER my.example.com
	MACOSX_BUNDLE_BUNDLE_VERSION ${PROJECT_VERSION}
	MACOSX_BUNDLE_SHORT_VERSION_STRING ${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR}
	MACOSX_BUNDLE TRUE
	WIN32_EXECUTABLE TRUE
)
if(QT_VERSION_MAJOR EQUAL 6)
	qt_finalize_executable(samp2_4) #最后生成可执行文件 samp2_4
endif()
```
- **`add_executable()`** 是CMake的标准函数，只创建基本的可执行文件目标
- **`qt_add_executable()`** 是Qt6引入的专用函数，提供了Qt特定的增强功能
使用 qt 版本能更好的：
- 自动处理Qt的元对象系统（MOC）
- 更好地集成Qt的UI文件（.ui）和资源文件（.qrc）
- 提供跨平台的目标属性设置
如果去掉 auto uic，moc，rcc 的设置，会出现：
- MOC（元对象编译器）失效：
	- 包含`Q_OBJECT`宏的类不会被处理
	- signals/slots机制无法工作
	- 运行时类型信息（RTTI）失效
	- **编译会失败**，因为MOC生成的代码缺失
- UIC（UI编译器）失效：
	- `.ui`文件不会被编译成对应的头文件
	- 界面设计无法在代码中使用
	- **链接会失败**，因为UI相关的类定义缺失
- RCC（资源编译器）失效：
	- `.qrc`资源文件不会被编译进可执行文件
	- 图片、翻译文件等资源无法访问
	- 程序运行时资源加载失败
项目中选择手动指定目标的生成和结束阶段，可以保证 `qt_finalize_executable` 之间可以任意设置想要的变量，cmake 设置等内容。因为**自动结束发生在当前作用域的末尾**，这可能包括（当前 CMakeLists. txt 末尾，函数或者宏的末尾，子目录处理完成时）

## Qt 框架功能概述
### Qt 全局定义
