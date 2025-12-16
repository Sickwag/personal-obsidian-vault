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

# Qt 框架功能概述
## Qt 全局定义
在 QGlobal 头文件中，包含 Qt 框架中的一些全局定义，包括基本数据类型、函数和宏。一般的**Qt 类的头文件都会包含这个头文件**
## Qt 元对象系统
### QObject 元对象
**元对象系统**是 Qt 的**反射机制**实现，它让 C++具备了类似 Java/C\# 的运行时类型检查和动态操作能力。`metaObject()` 函数返回的指针就是这个系统的入口点。
元对象系统提供了一些重要的函数：
- QObject 类提供的函数

| 特性   | 函数                                                                                                                          | 功能                                                                          |
| ---- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 元对象  | `QMetaObject  *metaObject()`<br>`QMetaObject  staticMetaObject`                                                             | 返回这个对象的元对象<br>这是类的静态变量，不是函数，存储了类的元对象                                        |
| 类型信息 | `bool  inherits()`                                                                                                          | 判断这个对象是不是某个类的子类的实例                                                          |
| 动态翻译 | `QString  tr()`                                                                                                             | 类的静态函数，返回一个字符串的翻译版本                                                         |
| 对象树  | `QObjectList  &children()`<br>`QObject  *parent()`<br>`void  setParent()`<br>`T  findChild()`<br>`QList<T>  findChildren()` | 返回子对象列表<br>返回父对象指针<br>设置父对象<br>按照对象名称，查找可被转换为类型 T 的子对象<br>返回符合名称和类型条件的子对象列表 |
| 信号与槽 | `QMetaObject::Connection  connect()`<br>`bool  disconnect()`<br>`bool  blockSignals()`<br>`bool  signalsBlocked()`          | 设置信号与槽关联<br>解除信号与槽的关联<br>设置是否阻止对象发射任何信号<br>若返回值为 `true`，表示对象被阻止发射信号         |
| 属性系统 | `QList<QByteArray>  dynamicPropertyNames()`<br>`bool  setProperty()`<br>`QVariant  property()`                              | 返回所有动态属性名称<br>设置属性值，或添加动态属性<br>返回属性值                                        |
`inherts()` 函数可以判断一个类是否继承自另外一个类
可以使用元对象的反射功能实习一些：
```cpp
// 简单RTTI（运行时反射）
QObject* obj = getSomeObject();
const QMetaObject* meta = obj->metaObject();

qDebug() << "类名:" << meta->className();
qDebug() << "父类:" << meta->superClass()->className();

// 检查是否是特定类型
if (meta->inherits(&QPushButton::staticMetaObject)) {
    qDebug() << "这是一个按钮!";
}
// 函数名和属性名反射
void inspectObject(QObject* obj) {
    const QMetaObject* meta = obj->metaObject();
    
    // 遍历所有方法
    for (int i = 0; i < meta->methodCount(); ++i) {
        QMetaMethod method = meta->method(i);
        qDebug() << "方法:" << method.methodSignature();
        
        if (method.methodType() == QMetaMethod::Signal) {
            qDebug() << "  - 这是一个信号";
        } else if (method.methodType() == QMetaMethod::Slot) {
            qDebug() << "  - 这是一个槽";
        }
    }
    
    // 遍历所有属性
    for (int i = 0; i < meta->propertyCount(); ++i) {
        QMetaProperty prop = meta->property(i);
        qDebug() << "属性:" << prop.name() 
                 << "值:" << prop.read(obj).toString();
    }
}

// 动态UI生成
// 根据对象的属性动态创建UI控件
void createPropertyEditors(QObject* obj, QWidget* parent) {
    const QMetaObject* meta = obj->metaObject();
    
    for (int i = 0; i < meta->propertyCount(); ++i) {
        QMetaProperty prop = meta->property(i);
        
        if (prop.type() == QVariant::String) {
            auto* edit = new QLineEdit(parent);
            edit->setText(prop.read(obj).toString());
            // 连接编辑变化到属性更新
            connect(edit, &QLineEdit::textChanged, [obj, prop](const QString& text) {
                prop.write(obj, text);
            });
        }
        // 处理其他类型...
    }
}
```
### QMetaObject 对象元对象
元对象 (metaObject) 提供的函数：

| 分组      | 函数原型                                            | 功能                                                                                      |
| ------- | ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| 类的信息    | `char  *className()`                            | 返回这个类的类名称                                                                               |
|         | `QMetaType  metaType()`                         | 返回这个元对象的类型                                                                              |
|         | `QMetaObject  *superClass()`                    | 返回这个类的上层父类的元对象                                                                          |
|         | `bool  inherits(QMetaObject *metaObject)`       | 返回 true 表示这个类继承自 metaObject 描述的类，否则返回 false                                             |
|         | `QObject  *newInstance(*****)`                  | 创建这个类的一个实例，可以给构造函数传递最多 10 个参数                                                           |
| 类信息元数据  | `QMetaClassInfo  classInfo(int index)`          | 返回序号为 index 的一条类信息的元数据，类信息是在类中用宏 Q_CLASSINFO 定义的一条信息                                    |
|         | `int  indexOfClassInfo(char *name)`             | 返回名称为 name 的类信息的序号，序号可用于 classInfo () 函数                                                |
|         | `int  classInfoCount()`                         | 返回这个类的类信息条数                                                                             |
|         | `int  classInfoOffset()`                        | 返回这个类的第一条类信息的序号                                                                         |
| 构造函数元数据 | `int  constructorCount()`                       | 返回这个类的构造函数的个数                                                                           |
|         | `QMetaMethod  constructor(int index)`           | 返回这个类的序号为 index 的构造函数的元数据                                                               |
|         | `int  indexOfConstructor(char *constructor)`    | 返回一个构造函数的序号，constructor 包括正则化之后的函数名和参数名                                                 |
| 方法元数据   | `QMetaMethod  method(int index)`                | 返回序号为 index 的方法的元数据                                                                     |
|         | `int  methodCount()`                            | 返回这个类的方法的个数，包括基类中定义的方法，方法包括一般的成员函数，还包括信号和槽                                              |
|         | `int  methodOffset()`                           | 返回这个类的第一个方法的序号                                                                          |
|         | `int  indexOfMethod(char *method)`              | 返回名称为 method 的方法的序号                                                                     |
| 枚举类型元数据 | `QMetaEnum  enumerator(int index)`              | 返回序号为 index 的枚举类型的元数据                                                                   |
|         | `int  enumeratorCount()`                        | 返回这个类的枚举类型个数                                                                            |
|         | `int  enumeratorOffset()`                       | 返回这个类的第一个枚举类型的序号                                                                        |
|         | `int  indexOfEnumerator(char *name)`            | 返回名称为 name 的枚举类型的序号                                                                     |
| 属性元数据   | `QMetaProperty  property(int index)`            | 返回序号为 index 的属性的元数据                                                                     |
|         | `int  propertyCount()`                          | 返回这个类的属性的个数                                                                             |
|         | `int  propertyOffset()`                         | 返回这个类的第一个属性的序号                                                                          |
|         | `int  indexOfProperty(char *name)`              | 返回名称为 name 的属性的序号                                                                       |
| 信号与槽    | `int  indexOfSignal(char *signal)`              | 返回名称为 signal 的信号的序号                                                                     |
|         | `int  indexOfSlot(char *slot)`                  | 返回名称为 slot 的槽函数的序号                                                                      |
| 静态函数    | `bool  checkConnectArgs(*****)`                 | 检查信号与槽函数的参数是否兼容                                                                         |
|         | `void  connectSlotsByName(QObject *object)`     | 迭代搜索 object 的所有子对象，将匹配的信号和槽连接起来                                                         |
|         | `bool  invokeMethod(*****)`                     | 运行 QObject 对象的某个方法，包括信号、槽或成员函数                                                          |
|         | `QByteArray  normalizedSignature(char *method)` | 将方法 method 的名称和参数字符串正则化，去除多余空格。函数返回的结果可用于 checkConnectArgs ()、indexOfConstructor () 等函数 |
获取元对象有两种方式：
```cpp
const QMetaObject *metaPtr= btn->metaObject(); //获取元对象指针
const QMetaObject metaObj= btn->staticMetaObject; //获取元对象
```
注意：
`QObject::inherits()`。这个函数可以判断一个对象是不是继承自某个类的实例，顶层的父类是 QObject，但是如果要返回该对象**所描述的父类元对象**，需要使用 `QMetaObject::superClass()` 才可以

### 属性系统
可以参考 [[QTExamples#元对象属性]]，分静态和动态属性
### 信号和槽
参考[[Qt Official Tutorial#信号与插槽|信号槽机制]]
### 对象树
- 使用 QObject 及其子类创建的对象（统称为 QObject 对象）是以对象树的形式来组织的。创建一个 QObject 对象时若设置一个父对象，它就会被添加到父对象的子对象列表里
- 这种机制最适合于 UI 界面，上层（父对象）被关闭时，所有下层（子对象）都会被关闭。这一点可以通过在析构函数中写入**控制台调试信息**看到子对象被删除
- 所有 QObject 对象都有 parent 和 children 两个函数，用来返回**所有**父对象或者子对象，使用 `QObjectList/QList<QObject*>` 接受返回的对象指针数组。
- `findChild()` 函数用来在对象的子类中寻找**可以被转化为 T 类型的对象**
```cpp
template <typename T> T QObject::findChild(const QString &name = QString(), Qt::FindChildOptions options = Qt::FindChildrenRecursively)
```
最后一个参数选择寻找方法，默认**递归查找**
## 容器类
- Qt 的容器类比STL中的容器类更轻巧、使用更安全且更易于使用
- 这些容器类是隐式共享和可重入的，而且它们进行了速度和存储上的优化，可以减小可执行文件大小
- 它们是线程安全的，它们可以作为只读容器时可被多个线程访问。

### 顺序容器
Qt 6 中的 QVector 是 QList 的别名，两者完全等价
list 重载了 `<<` 运算符，更方便传入数据
```cpp
QList<QString> list;
list<<"Monday"<<"Tuesday"<<"Wednesday"<<"Thursday";
list.append("Friday");
QString str1= list[0]; // str1="Monday"
QString str2= list.at(1); // str2="Tuesday"
```
其中以 take 开头的函数作用是从容器中移除一个元素，并**返回移除后的列表**，这可比 `vec.erase(std::remove(vec.begin(), vec.end(), 3), vec.end());` 要方便
### 关联容器
Qt 中很多函数的返回值为 QList 或 QStringList 类型，要遍历这些返回的容器类，必须先复制（给左值），由于 Qt 使用了隐式共享，这样的复制并不会产生太大开销。
qt 的 foreach 宏由于不是关键字，没办法做到用**引用**（C++11 中的 foreach 语法可以控制是否使用引用）返回容器中的内容，只会**创建容器副本然后操作**，所以**使用 foreach 宏修改容器中的数据不奏效**，Qt 在 5.7 后不建议使用 foreach 宏
## 其他常用类
### QVariant 类
一种万能数据类型，它可以存储任何类型的数据，定义 QVariant 变量时，通过其构造函数为其赋初值。QVariant 有很多参数形式的构造函数，基本覆盖 toT 函数涉及的类型，还可以使用函数 ` setValue()`。
QVariant 只支持一些基本的类型，没有 `toColor()`、`toFont()` 这样的函数，但是这些类型的值可以赋值给 QVariant 变量，之后通过 `QVariant::value()` 函数来得到指定类型的值

### QFlags 类
`QFlags<Enum>` 是一个模板类，其中 Enum 是枚举类型，QFlags 用于定义枚举值的或运算组合，用于解决传统 C++中的[[CodeLineCounter#位掩码设计开关|位掩码技术]]
```cpp
// 传统枚举 - 只能表示单一状态
enum Alignment {
    AlignLeft = 0x1,
    AlignRight = 0x2,
    AlignHCenter = 0x4,
    AlignTop = 0x8,
    AlignBottom = 0x10,
    AlignVCenter = 0x20
};

// 问题：如何同时表示"水平居中 + 垂直居中"？
// 传统方式：使用按位或
int alignment = AlignHCenter | AlignVCenter;  // 0x4 | 0x20 = 0x24

// 但这样失去了类型安全，只是普通的int
```
qt 对 flags 标志的实现代码（对 alignment ，对齐方式这一部分）可以简化为：
```cpp
template<typename Enum>
class QFlags {
    int m_value;  // 存储组合后的整数值
    
public:
    QFlags(Enum flag) : m_value(static_cast<int>(flag)) {}
    
    // 重载按位或运算符
    QFlags operator|(Enum flag) const {
        return QFlags(m_value | static_cast<int>(flag));
    }
    
    QFlags operator|(QFlags other) const {
        return QFlags(m_value | other.m_value);
    }
    
    // 测试是否包含某个标志
    bool testFlag(Enum flag) const {
        return (m_value & static_cast<int>(flag)) == static_cast<int>(flag);
    }
    
    // 转换为bool（判断是否有任何标志被设置）
    operator bool() const { return m_value != 0; }
};

// Qt的方式
enum AlignmentFlag {
    AlignLeft = 0x1,
    AlignRight = 0x2,
    AlignHCenter = 0x4,
    AlignTop = 0x8,
    AlignBottom = 0x10,
    AlignVCenter = 0x20
};
Q_DECLARE_FLAGS(Alignment, AlignmentFlag)
// 开启后相当于
// typedef QFlags<AlignmentFlag> Alignment;
// 现在可以类型安全地组合
Alignment alignment = AlignHCenter | AlignVCenter;
```
注意只是**相当于**，`QFlags<Alignment>` 类型并不存在，`Qt::AlignmentFlag` 是枚举类型，其有一些枚举常量，详见 Qt 文档。`Qt::Alignment` 是一个或多个 `Qt::AlignmentFlag` 类型枚举值的组合，是一种特性标志。
### QRandomGenerator 类
Qt 6 中已经舍弃了 Qt 5 中产生随机数的函数 `qrand()`和 `qsrand()`，取而代之的是 QRandomGenerator类，它可以产生高质量的随机数。
创建 QRandomGenerator 对象时可以给构造函数提供一个数作为随机数种子。
如果两个随机数种子相同，则产生的随机数序列是完全相同的；反之不同

- QRandomGenerator 有一个静态函数 `securelySeeded()` 可以**创建**一个随机数发生器，**他会调用当前系统的随机数生成器(`QRandomGenerator::system()`)单独生成一个随机数**，每次调用这个静态函数使用的种子是**安全且不同**的，而且无法获得，由于**他不是静态函数**，且步骤较为复杂，每次需要随机数都创建对象会有**性能问题**
- 如果只是短期内使用随机数发生器，且生成的随机数的数据量比较小，就不要使用函数 ` securelySeeded() ` 单独生成随机数发生器，使用静态函数 ` QRandomGenerator::global() ` 表示的全局的随机数发生器
- QRandomGenerator 有两个静态函数会返回随机数发生器，可以直接使用这两个函数返回的随机数发生器，无须给它们设置种子进行初始化。
```cpp
QRandomGenerator *QRandomGenerator::system()
QRandomGenerator *QRandomGenerator::global()
```
- 使用 system 随机数生成是线程安全的，并且在任何线程中使用，常用语**生成密码和生成其他随机数，加密方式生成器的种子**，由于他可能调用硬件来生成随机数，***不要用它生成大量的随机数***
- 可以使用 `quint32 rand= QRandomGenerator::global()->generate/generate64/generateDouble()` 来生成不同类型的随机数，生成 double 的范围在 `[0,1)`，不仅支持不同类型，还支持范围（使用 `bounded()` 函数），同样包括下界，**不包括上界**
- 其对象还支持 `()` 括号运算符，每使用一次 `()` 就会再生成一次
最普遍的使用方法：
```cpp
int x = QRandomGenerator::global()->bounded(100);
int y = QRandomGenerator::global()->bounded(100);
int z = QRandomGenerator::global()->bounded(100);
// securelySeeded()同理
qDebug()<<x ;
qDebug()<<y ;
qDebug()<<z ;
```
或者参考[[#[DIY ]自己实现网红表白程序#功能设计 ]]
# 常用界面组件的使用
## 界面组件概述
### 输入类组件

| 组件类名称            | 组件名称    | 功能                                                                                                                                                                                           |
| ---------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QComboBox        | 下拉列表框   | 也称为组合框，用于从下拉列表中选择一项，也可以直接输入文字                                                                                                                                                                |
| QFontComboBox    | 字体下拉列表框 | 自动从系统获取字体名称列表，用于选择字体                                                                                                                                                                         |
| QLineEdit        | 编辑框     | 用于输入单行文字                                                                                                                                                                                     |
| QTextEdit        | 文本编辑器   | 是一个“所见即所得”的文本编辑器，支持富文本格式，使用类似于 HTML 的标记，或 Markdown 格式。一般用于处理较大的富文本文档                                                                                                                         |
| QPlainTextEdit   | 纯文本编辑器  | 是一个纯文本编辑器，支持多段落纯文本文档。一个段落就是一个带格式的字符串，每个字符都可以有自己的属性，例如字体和颜色                                                                                                                                   |
| QSpinBox         | 整数输入框   | 用于输入整数或离散型数据的输入框                                                                                                                                                                             |
| QDoubleSpinBox   | 浮点数输入框  | 用于输入浮点数的输入框                                                                                                                                                                                  |
| QDateEdit        | 日期编辑框   | 用于编辑日期数据的编辑框                                                                                                                                                                                 |
| QTimeEdit        | 时间编辑框   | 用于编辑时间数据的编辑框                                                                                                                                                                                 |
| QDateTimeEdit    | 日期时间编辑框 | 用于编辑日期时间数据的编辑框                                                                                                                                                                               |
| QDial            | 表盘      | 一种模仿表盘的输入组件，用于在设定的范围内输入和显示数值                                                                                                                                                                 |
| QScrollBar       | 卷滚条     | 卷滚条通常用于实现在大的显示区域内滑动，以显示部分区域的内容。图 4-3 中的 Horizontal Scroll Bar 和 Vertical Scroll Bar 对应的类均是 QScrollBar。滚动条具有设定的数值范围，拖动滑块就可以设置输入的值。图 4-3 中的 Horizontal Slider 和 Vertical Slider 对应的类均是 QSlider |
| QSlider          | 滑动条     | 滑动条具有设定的数值范围，拖动滑块就可以设置输入的值。图 4-3 中的 Horizontal Slider 和 Vertical Slider 对应的类均是 QSlider                                                                                                       |
| QKeySequenceEdit | 按键序列编辑器 | 当这个编辑器获得输入焦点后，可记录用户设置的按键序列，一般用这个编辑器获取用户设置的快捷键序列                                                                                                                                              |

### 显示类组件
| 组件类名称           | 组件名称        | 功能                                                        |
| --------------- | ----------- | --------------------------------------------------------- |
| QLabel          | 标签          | 用于显示文字、图片等内容                                              |
| QTextBrowser    | 文本浏览器       | 用于显示富文本格式的内容，具有只读属性，可以根据文本内的超链接进行跳转                       |
| QGraphicsView   | 图形视图组件      | Graphics View 结构中的视图组件，10.3 节会详细介绍这个组件的用法                 |
| QCalendarWidget | 日历组件        | 用于显示日历，并显示所设置的日期。可以在日历上选择一个日期，所以 QCalendarWidget 可以作为输入组件 |
| QLCDNumber      | LCD 数值显示组件  | 模仿 LCD 显示效果的数值显示组件，可显示整数和浮点数                              |
| QProgressBar    | 进度条         | 用于表示某个操作的进度，进度一般用百分数表示，有水平和垂直两种方向                         |
| QOpenGLWidget   | OpenGL 显示组件 | 用于在 Qt 应用程序中显示 OpenGL 图形                                  |
| QQuickWidget    | QML 显示组件    | 用于自动加载 QML 文件，并显示 QML 文件的场景                               |
### 容器类组件
| 组件类名称          | 组件名称         | 功能                                                                  |
| -------------- | ------------ | ------------------------------------------------------------------- |
| QGroupBox      | 分组框          | 具有标题和边框的容器组件                                                        |
| QScrollArea    | 卷滚区域         | 具有水平和垂直卷滚条的容器组件，可以容纳大面积的显示内容，通过卷滚条可实现在显示范围内移动                       |
| QToolBox       | 工具箱          | 垂直方向的多页容器组件，每个页面有标签栏，每个页面就是一个 QWidget 组件，在其上可以放置任何界面组件              |
| QTabWidget     | 带标签栏的多页组件    | QTabWidget 有一个标签栏，每个页标签对应一个页面，每个页面就是一个 QWidget 组件，可以在页面上放置任何界面组件    |
| QStackedWidget | 堆叠多页组件       | QStackedWidget 是类似于 QTabWidget 的多页组件，但是没有标签栏，只有两个按钮，用于在页面之间切换       |
| QFrame         | 框架组件         | QFrame 是所有具有边框的界面组件的父类，它定义了边框形状、边框阴影、边框线宽等属性。QFrame 可以直接作为容器组件      |
| QWidget        | 界面组件         | QWidget 可以作为容器组件，QWidget 组件没有父组件时就是独立的窗口                            |
| QMdiArea       | MDI 工作区组件    | QMdiArea 是 MDI 显示区域，在 MDI 应用程序中，QMdiArea 用于管理多文档窗口，7.4 节会详细介绍这个类的用法 |
| QDockWidget    | 停靠组件         | QDockWidget 是可以在 QMainWindow 窗口的上、下、左、右区域停靠的组件，也可以浮动在窗口上方           |
| QAxWidget      | ActiveX 显示组件 | QAxWidget 用于显示 ActiveX 控件，只有 Windows 平台上才有这个组件                      |
### 组件的同样方法接口
| 属性名称               | 属性值类型                 | 功能                                                           |
| ------------------ | --------------------- | ------------------------------------------------------------ |
| enabled            | bool                  | 组件的使能状态，enabled 为 true 时才可以操作组件                              |
| geometry           | QRect                 | 组件的几何形状，表示组件在界面上所占的矩形区域                                      |
| sizePolicy         | QSizePolicy           | 组件默认的布局特性，这个特性与组件的水平、垂直方向尺寸变化有关系，详见后面的解释                     |
| minimumSize        | QSize                 | 组件的最小尺寸，QSize 包含 width 和 height 两个属性                         |
| maximumSize        | QSize                 | 组件的最大尺寸                                                      |
| palette            | QPalette              | 组件的调色板，调色板定义了组件一些特定部分的颜色，如背景色、文字颜色等                          |
| font               | QFont                 | 组件使用的字体。QFont 定义了字体名称、大小、粗体、斜体等特性                            |
| cursor             | QCursor               | 鼠标光标移动到组件上时的形状                                               |
| mouseTracking      | bool                  | 若设置为 true，只要鼠标在组件上移动，组件就接收鼠标移动事件；否则，只有在某个鼠标键被按下时，组件才接收鼠标移动事件 |
| tabletTracking     | bool                  | 是否开启平板跟踪，默认值是 false，表示只有当触笔与平板计算机接触时，组件才接收平板事件               |
| focusPolicy        | Qt::FocusPolicy       | 组件的焦点策略，表示组件获取焦点的方式                                          |
| contextMenuPolicy  | Qt::ContextMenuPolicy | 组件的上下文菜单策略，上下文菜单是指在组件上点击鼠标右键时弹出的快捷菜单                         |
| acceptDrops        | bool                  | 组件是否接收拖动来的其他对象                                               |
| toolTip            | QString               | 鼠标移动到组件上时，在光标处显示的简短提示文字                                      |
| statusTip          | QString               | 鼠标移动到组件上时，在主窗口状态栏上临时显示的提示文字，显示 2 秒后自动消失                      |
| autoFillBackground | bool                  | 组件的背景是否自动填充，如果组件使用样式表设定了背景色，这个属性会被自动设置为 false                |
| styleSheet         | QString               | 组件的样式表。样式表用于定义界面显示效果，第 18 章会详细介绍样式表的使用方法                     |

sizePolicy 属性是 QSizePolicy 类型，它定义了组件在水平和垂直方向的尺寸变化策略

| 策略                   | 含义                       | 适用场景     |
| -------------------- | ------------------------ | -------- |
| **Fixed**            | 固定大小，不拉伸不收缩              | 按钮、图标    |
| **Minimum**          | 可以拉伸，但不能小于 `sizeHint()`  | 有最小需求的控件 |
| **Maximum**          | 可以收缩，但不能大于 `sizeHint ()` | 不希望太大的控件 |
| **Preferred**        | 首选 `sizeHint () `，可拉伸可收缩 | 大多数控件    |
| **Expanding**        | 尽量占用更多空间，可收缩             | 文本框、表格   |
| **MinimumExpanding** | 不能小于 `sizeHint() `，尽量拉伸  | 进度条      |
| **Ignored**          | 忽略 `sizeHint() `，完全由布局决定 | 占位符      |
而 sizePolicy 还有水平和垂直**延展性属性**，延展性决定了**在有多余空间时，widget的相对拉伸比例**
对一个 widget 对象设置 Hstretch 或者 Vstretch 属性**只有在这些对象在一个 layout 中**才会生效。具体效果可以参考：
```cpp
void demonstrateStretch() {
    QWidget window;
    QHBoxLayout* layout = new QHBoxLayout(&window);
    
    QTextEdit* editor1 = new QTextEdit;
    QTextEdit* editor2 = new QTextEdit;
    QTextEdit* editor3 = new QTextEdit;
    
    // 设置不同的水平延展因子
    editor1->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);
    editor1->sizePolicy().setHorizontalStretch(1);  // 占1份
    
    editor2->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);
    editor2->sizePolicy().setHorizontalStretch(2);  // 占2份
    
    editor3->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);
    editor3->sizePolicy().setHorizontalStretch(1);  // 占1份
    
    // 结果：editor2的宽度是editor1和editor3的两倍
    layout->addWidget(editor1);
    layout->addWidget(editor2);
    layout->addWidget(editor3);
    
    window.show();
}
// 假设有3个widget，延展因子分别为1, 2, 1
// 可用额外空间 = 总空间 - 所有widget的最小空间需求
// 每个widget分得的额外空间 = (延展因子 / 总延展因子) × 可用额外空间

// 计算示例：
总延展因子 = 1 + 2 + 1 = 4
可用额外空间 = 400像素
widget1额外空间 = (1/4) × 400 = 100像素
widget2额外空间 = (2/4) × 400 = 200像素  
widget3额外空间 = (1/4) × 400 = 100像素
```
可以对一个组件单独设置 stretch，然后加入 layout 中，也可以对一个 layout 设置 `layoutStretch(int index, int stretch)`，这个函数有点特殊，如果 Hlayout 中有三个组件在 ui 编辑界面的属性管理器中可以设置 layout 对象的 layoutStretch 属性为 `0,0,0`，而代码中只能一个个设置
### QWidget 作为窗口时的主要属性

| 属性             | 属性值类型              | 功能                                                                             |
| -------------- | ------------------ | ------------------------------------------------------------------------------ |
| windowTitle    | QString            | 窗口标题栏上的文字，若要利用 windowModified 属性，需要在标题文字中设置占位符 “[*]”                           |
| windowIcon     | QIcon              | 窗口标题栏上的图标                                                                      |
| windowOpacity  | qreal              | 窗口的不透明度，取值范围是 0.0～1.0。0.0 表示完全透明，1.0 表示完全不透明。默认值是 1.0                          |
| windowFilePath | QString            | 窗口相关的含路径的文件名，这个属性只在 Windows 平台上有意义，如果没有设置 windowTitle 属性，程序将自动获取不含路径的文件名作为窗口标题 |
| windowModified | bool               | 表示窗口里的文档是否被修改，若该属性值为 true，窗口标题中的占位符 “[*]” 会显示为 “*”                             |
| windowModality | Qt::WindowModality | 窗口的模态，这个属性只在 Windows 平台上有意义，表示窗口是否处于上层窗口的标志                                    |
| windowFlags    | Qt::WindowFlags    | 窗口的标志，是枚举类型 Qt::WindowFlag 的一些值的组合                                             |

拥有一些接口和信号（只有三个）
```cpp
// 当 QWidget 作为独立的窗口时，有如下一些与窗口显示有关的公有槽函数。
bool close () //关闭窗口
void hide () //隐藏窗口
void show () //显示窗口
void showFullScreen () //以全屏方式显示窗口
void showMaximized () //窗口最大化
void showMinimized () //窗口最小化
void showNormal () //全屏、最大化或最小化操作之后，恢复正常大小显示
// QWidget 中定义的信号只有 3 个，定义如下：
void customContextMenuRequested (const QPoint &pos) // 在组件上右键
void windowIconChanged (const QIcon &icon)
void windowTitleChanged (const QString &title)
```

## 布局管理
QGridLayout 和 QFormLayout 较为相似，后者更适合于两列表单，主要的区别是：
- GroupBox 1 使用了表单布局，当 GroupBox 1 的高度大于最合适的尺寸时，内部的组件的垂直间距不会再增大，下方多余的空间是空白的。
- GroupBox 2 使用了网格布局，当 GroupBox 2 的高度增大时内部的组件在垂直方向上均匀分布的
![[Pasted image 20251031205759.png]]
QStackedLayout：堆叠布局，用于管理多个 QWidget 类对象，也就是多个页面，**但任何时候只有一个页面可见**。QStackedLayout 的管理效果与 QStackedWidget 的相似，只是它没有切换页面的按钮，需要另外编程处理页面切换。

## QString 字符串操作
具体内部编码参考 [[Qt Official Tutorial#字符串数据类]]
QString 使用了隐式共享，**只有在修改操作时**才会复制其中包含的字符数据，并且由于其每一个字符都是 UTF-16 编码，所以使用 `[]` 的时候不会因为中文占用 2~4 个字节而读入半个字节的数据
QString 中的字符都使用 QChar 存储，可以通过 `from__` 获得其 unicode 码，后面的 2/4 表示字符的字节长度，2 字节接受 `char16_t` 类型数据，反之 `char32_t`
![[PixPin_2025-10-31_21-35-05.png]]

注意这是一个静态函数，并且如果源码中有**使用中文字符修改字符串时**，需要特别注意：
qt creator 编写的源代码文件使用 utf-8 编码，在其中使用中文（2~4 字节）中如果有 2~3 字节的文本用来赋值 QChar，不会出现编译错误，而会在运行时显示错误字符串，因为**超过 2 字节的部分会被截断**，导致显示错误的内容
```cpp
QString str= "Hello,北京";
str[6]= QChar(0x9752); //'青'，使用构造函数
str[7]= QChar::fromUcs2(0x5C9B); //'岛'，使用静态函数
str[6]= QChar('青'); //错误的代码
```
section 函数用来分割字符串，比较方便：从字符串中提取以 sep 作为分隔符，从 start 段到 end 段的字符串
```cpp
QString QString::section(const QString &sep, qsizetype start, qsizetype end = -1,
QString::SectionFlags flags = SectionDefault)

QString str2, str1= "学生姓名,男,2003-6-15,汉族,山东";
str2= str1.section(",",0,0); //str2 ="学生姓名"，第一段的编号为 0
str2= str1.section(",",1,1); //str2 ="男"
str2= str1.section(",",0,1); //str2 ="学生姓名，男"
str2= str1.section(",",4,4); //str2 ="山东"
```
函数 `simplified()` 不仅会去掉字符串首尾的空格，还会将中间连续的空格用单个空格替换
函数 `setNum` 可以将数字类型转换为字符串类型，还可以修改进制，数字表示方法
```cpp
int N= 243;
QString str;
str.setNum(N); //十进制， str= "243"
str.setNum(N,16); //十六进制，str= "f3"
str.setNum(N,2); //二进制， str= "11110011"
QString str;
double num= 1245.2783;
str.setNum(num,'f',5); //小数点后 5 位，str= "1245.27830"
str.setNum(num,'E',5); //基数的小数点后 5 位，str= "1.24528E+03"
str.setNum(num,'g',5); //整数和小数总共 5 位，str= "1245.3"
str.setNum(num,'g',3); //整数和小数总共 3 位，str= "1.25e+03"
```
静态函数 asprintf 类似于标准 C 中的 prinf，可以使用 cformat 参数设置任意字符串输出，但是其中的占位符 `%s` 是一个仅仅能支持 UTF 16 的字符，如果使用中文填充占位符（utf-8）会导致乱码，qt 文档中已经说明了这点：

> [!note]
> Safely builds a formatted string from the format string cformat and an arbitrary list of arguments.
> The format string supports the conversion specifiers, length modifiers, and flags provided by printf () in the standard C++ library. The cformat string and %s arguments must be UTF-8 encoded.
> 
> Note: The %lc escape sequence expects a unicode character of type char 16_t, or ushort (as returned by QChar:: unicode ()). The %ls escape sequence expects a pointer to a zero-terminated array of unicode characters of type char 16_t, or ushort (as returned by QString:: utf 16 ()). This is at odds with the printf () in the standard C++ library, which defines %lc to print a wchar_t and %ls to print a wchar_t*, and might also produce compiler warnings on platforms where the size of wchar_t is not 16 bits

## QSpinBox 和 QDoubleSpinBox
比较有用的是：`QAbstractSpinBox::AdaptiveDecimalStepType` 自适应步进，在一个范围较大并且较为精细（范围从 1-10000，但是精度为 0.001）的范围调整 spinbox 中，通过点击上下箭头来调整数字大小效率很低，自适应步长可以表示将自动连续调整步长值为 $10^n$，其中 n 为大于或等于 0 的整数。value 属性值为 10 以下时，singleStep 属性值为 1；value 属性值为 100～999 时，singleStep 属性值为 10
## 其他常用按钮组件
### 按钮类
比较重要的接口是 autoExclusive 和 autoRepeat

| 属性            | 属性值类型        | 功能                                                                                                                                                 |     |     |     |
| ------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- | --- |
| text          | QString      | 按钮的显示文字                                                                                                                                            |     |     |     |
| icon          | QIcon        | 按钮的图标                                                                                                                                              |     |     |     |
| shortcut      | QKeySequence | 按钮的快捷键                                                                                                                                             |     |     |     |
| checkable     | bool         | 按钮是否可复选                                                                                                                                            |     |     |     |
| checked       | bool         | 按钮是否复选的状态                                                                                                                                          |     |     |     |
| autoExclusive | bool         | 在一个布局或一个容器组件内的同类按钮是否是互斥的。如果是互斥的，当其中一个按钮的 checked 属性被设置为 true 时，其他按钮的 checked 属性被自动设置为 false                                                        |     |     |     |
| autoRepeat    | bool         | 是否自动重复。如果值为 true，那么在按钮处于按下状态时，将自动重复发射 clicked ()、pressed ()、released () 信号。初次重复的延迟时间由属性 autoRepeatDelay 决定，重复的周期由属性 autoRepeatInterval 决定，时间单位都是毫秒 |     |     |     |
| autoDefault   | bool         | 按钮是否为自动默认按钮                                                                                                                                        |     |     |     |
| default       | bool         | 按钮是否为默认按钮                                                                                                                                          |     |     |     |
| flat          | bool         | 当 flat 属性值为 true 时，按钮没有边框，只有被点击或复选时才显示按钮边框                                                                                                         |     |     |     |

- 只有当按钮所在的窗口基类是 QDialog 时，autoDefault 和 default 属性才有意义。在对话框上，如果一个按钮的 default 属性为 true，按下 Enter 键就相当于点击了默认按钮。
- 如果按钮的 autoDefault 属性为 true，它就是自动默认按钮，获得焦点时，它就会变成默认按钮。
### 滑动条类
参考 [[QTExamples#滑动条QSlider和QAbstractSlider的介绍和用法|slider]] 和[[QTExamples#QSlider 仪表盘 + QLCD_NUmber 数值显示的介绍及用法|仪表盘]]
### 时间和日期类
参考[[QTExamples#QTimer和QDateTime的讲解和使用|时间日期相关]]
## QTimer 和 QElapsedTimer
### QTimer
QTimer 是软件定时器，其**父类是 QObject**。QTimer 的主要功能是设置以毫秒为单位的定时周期，然后进行连续定时或单次定时。启动定时器后，定时溢出时 QTimer 会发射 timeout()信号，为 timeout()信号关联槽函数就可以进行定时处理。

主要属性有：

| 属性           | 属性值类型     | 功能                                                                 |
|----------------|----------------|----------------------------------------------------------------------|
| interval       | int            | 定时周期，单位是毫秒                                                 |
| singleShot     | bool           | 定时器是否为单次定时，true 表示单次定时                              |
| timerType      | Qt:: TimerType  | 定时器精度类型                                                       |
| active         | bool           | 只读属性，返回 true 表示定时器正在运行，也就是运行 start () 函数启动了定时器 |
| remainingTime  | int            | 只读属性，到发生定时溢出的剩余时间，单位是毫秒。若定时器未启动，属性值为 -1；若已经发生定时溢出，属性值为 0 |

通过 start 函数启动定时器：
```cpp
void QTimer::start() //启动定时器
void QTimer::start(int msec) //启动定时器，并设置定时周期为 msec，单位是毫秒
void QTimer::stop() //停止定时器
```
设置 interval 可以设置 `timeout()` 信号发射间隔
静态函数 `singleShot` 用于创建和启动**单次定时器**，
### QElapsedTimer
QElapsedTimer 用于快速计算两个事件的间隔时间，是软件计时器。**QElapsedTimer 没有父类，不支持元系统**，，其计时精度可以达到纳秒级。QElapsedTimer 的主要用途是比较精确地确定一段程序运行的时长。

- 函数 elapsed()的返回值是自上次运行 start()之后计时器的运行时间，单位是毫秒。
- 函数 nsecsElapsed()的返回值也是自上次运行 start()之后计时器的运行时间，单位是纳秒。
- 函数 restart()返回从上次启动计时器到现在的时间，单位是毫秒，然后重启计时器。相当于先后运行了 elapsed()和 start()。
## QComboBox 类
QComboBox 使用模型/视图结构存储和显示下拉列表的数据，下拉列表的数据实际上存储在QStandardItemModel 模型里

| 属性                | 属性值类型        | 功能                                                                                                                                                        |
| ----------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| editable          | bool         | 是否可编辑。如果值为 false，就只能从下拉列表里选择；如果值为 true，会显示一个编辑框允许输入文字                                                                                                     |
| currentText       | QString      | 当前显示的文字                                                                                                                                                   |
| currentIndex      | int          | 当前选中项的序号，序号从 0 开始。-1 表示没有项被选中                                                                                                                             |
| maxVisibleItems   | int          | 下拉列表中显示的项的最大条数，默认值为 10。如果下拉列表里项的条数超过这个值，会自动出现卷滚条                                                                                                          |
| maxCount          | int          | 下拉列表里项的最大条数                                                                                                                                               |
| insertPolicy      | InsertPolicy | 用户编辑的新文字插入列表的方式，是枚举类型 QComboBox::InsertPolicy，默认值是 InsertAtBottom，也就是插入列表的末尾。如果值是 NoInsert，就表示不允许插入占位文字。当 currentIndex 属性值为 -1 时下拉列表框显示的文字。这个文字不会出现在下拉列表里 |
| placeholderText   | QString      | 当 currentIndex 属性值为 -1 时下拉列表框显示的文字（占位提示文本）                                                                                                                |
| duplicatesEnabled | bool         | 是否允许列表中出现重复的项                                                                                                                                             |
| modelColumn       | int          | 下拉列表中的数据在数据模型中的列编号，默认值为 0                                                                                                                                 |
- 下拉列表是用 QListView 的子类组件显示的
- modelColumn 属性表示下拉列表显示的数据在模型中的列编号，默认值为 0。
- 这些属性大部分在 QComboBox 中有对应的读写接口

## QMainWindow 和 QAction
QMainWindow 是主窗口类，具有菜单栏、工具栏、状态栏等主窗口常见的界面元素。要设计主窗口上的菜单栏、工具栏、按钮的下拉菜单、组件的快捷菜单等，需要用到 QAction类。QAction 对象就是实现某个功能的“动作”，我们称其为 Action。在 **UI 可视化设计时**，我们可以设计很多 Action，然后用 Action 创建菜单项和工具按钮。

经常在 UI 编辑器中使用 QAction 规划动作行为逻辑，按钮逻辑，有些 QT 中不允许的操作（比如将 QComboBox 放在 QMainWindow 工具栏上，原则上工具栏上只会放一些按钮）
### 关于工具栏和状态栏
QMainWindow 类窗口上有**菜单栏、工具栏和状态栏**，这 3 种界面组件对应的类分别是QMenuBar、QToolBar 和 QStatusBar，它们都是直接从 QWidget 继承而来的。**一个主窗口上最多有一个菜单栏和一个状态栏，可以有多个工具栏。**
![[PixPin_2025-11-04_10-22-05.png]]
```md
┌─────────────────────────────────────────────────────────────┐
│ 文件(F) 编辑(E) 视图(V) 帮助(H)                            ← 菜单栏
├─────────────────────────────────────────────────────────────┤
│ [新建] [保存] [打印]                                        ← 工具栏
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   这是工作区内容...                                           │
│   用户可以在这里进行主要操作                                    │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 已保存成功        行: 15, 列: 8                 就绪 插入模式  ← 状态栏
└─────────────────────────────────────────────────────────────┘
```

设计菜单的 QAction 动作：
![[PixPin_2025-11-04_10-31-04.png]]
- 其中 Menu role 只有 macos 上才有效
- 可以通过拖动 Action 编辑器里的 QAction 对象放到工具栏上
- 常用的信号和槽函数需要知道
- 右键**对象查看器中的 MainWindow 类**，选择添加工具栏后就会出现工具栏，可以拖动 QAction 对象进去
可以用 Action 可视化地创建工具栏上的按钮，但是**不能可视化地**在工具栏上放置其他组件。QToolBar 提供了接口函数，可以**通过代码在工具栏上添加组件**
```cpp
void addAction(QAction *action) //添加一个 Action，并根据 Action 的设置自动创建工具按钮
QAction *addWidget(QWidget *widget) //添加一个界面组件
QAction *insertWidget(QAction *before, QWidget *widget) //插入一个界面组件
QAction *addSeparator() //添加一个分隔条
QAction *insertSeparator(QAction *before) //插入一个分隔条
```
在 UI 可视化设计时，不能在状态栏上放置任何组件，而只能通过其接口函数向状态栏添加组件
```cpp
void addWidget(QWidget *widget, int stretch = 0) //添加正常组件
void addPermanentWidget(QWidget *widget, int stretch = 0) //添加永久组件
```
这两个函数区别是：函数 `showMessage()` 用于在状态栏上左端首位置显示字符串信息，显示持续时间是 timeout，单位是毫秒。如果 timeout 设置为 0，就是一直显示，直到被 `clearMessage()` 清除，或显示下一条临时消息。使用 `showMessage()` 显示临时消息时，状态栏上用 addWidget()添加的组件会被临时隐藏，而用 `addPermanentWidget()` 函数添加的组件会保持不变。

![[PixPin_2025-11-11_21-46-34.png]]
### 编写代码
两个重要的槽函数
```cpp
void TextEditorMainWindow::do_fontsize_changed(int fontsize)
{
    QTextCursor cursor = ui->plainTextEdit->textCursor();
    
    QTextCharFormat format;
    format.setFontPointSize(fontsize);
    if (cursor.hasSelection()) {
        cursor.mergeCharFormat(format);
    } else {
        ui->plainTextEdit->mergeCurrentCharFormat(format);
        QFont currentFont = ui->plainTextEdit->font();
        currentFont.setPointSize(fontsize);
        ui->plainTextEdit->setFont(currentFont);
    }
    
    progressbarOfFontSize->setValue(fontsize);
}

void TextEditorMainWindow::do_font_selected(const QFont &font)
{
    this->labelOfFontInfo->setText(QString("current font family: %1").arg(font.family()));
    QTextCursor cursor = ui->plainTextEdit->textCursor();
    
    QTextCharFormat format;
    format.setFontFamily(font.family());
    if (cursor.hasSelection()) {
        cursor.mergeCharFormat(format);
    } else {
        ui->plainTextEdit->mergeCurrentCharFormat(format);
        QFont currentFont = ui->plainTextEdit->font();
        currentFont.setFamily(font.family());
        ui->plainTextEdit->setFont(currentFont);
    }
}
```
其中需要注意：
- 对选中文本格式化：需要通过 QTextCursor 获取选中区域，然后调用**cursor 对象的 mergeCharFormat 函数**对选中文本字体应用格式
- 对未来输入应用格式：通过 `QPlainTextEdit::mergeCurrentCharFormat()`
- 对文本输入框中的所有问题使用效果则调用 `setFont` 函数
对于**开关类型按钮**（即点击之后按钮保持被按下，再次点击又弹起的效果），单纯地设置槽函数是没有效果的
```cpp
void TextEditorMainWindow::on_actionbold_triggered(bool checked)
{
    QTextCharFormat fmt = ui->plainTextEdit->currentCharFormat();
    if(checked){
        fmt.setFontWeight(QFont::Bold);
    }else{
        fmt.setFontWeight(QFont::Normal);
    }
    ui->plainTextEdit->mergeCurrentCharFormat(fmt);
}

void TextEditorMainWindow::on_actionitalic_triggered(bool checked)
{
    QTextCharFormat fmt = ui->plainTextEdit->currentCharFormat();
    fmt.setFontItalic(checked);
    ui->plainTextEdit->mergeCurrentCharFormat(fmt);
}

void TextEditorMainWindow::on_actionunderline_triggered(bool checked)
{
    QTextCharFormat fmt = ui->plainTextEdit->currentCharFormat();
    fmt.setFontUnderline(checked);
    ui->plainTextEdit->mergeCurrentCharFormat(fmt);
}
```
只有开关类按钮能够使用 `triggered(bool checked)` 这个槽，普通按钮只有 `triggered()` 表示点击一次，由于开关类按钮还要记住一个状态，所以必须区分开来，这个区分由 `QAction::setCheckable` 管理，设置 true 表示是开关按钮，否则默认 false 普通按钮，这就会导致使用 `triggered (bool check)` 的槽失效
```cpp
void TextEditorMainWindow::buildUI()
{
	ui->actionbold->setCheckable(true);
	ui->actionitalic->setCheckable(true);
	ui->actionunderline->setCheckable(true);
}
```
完整代码参考：[[C++ practice case#Qt 项目代码#4.10 QMainWindow 和 QAction]]
## QToolButton 和 QListWidget
### 基本使用方法
![[PixPin_2025-11-12_15-36-15.png]]
这样的内容在 [[QTExamples#列表控件QListWidget和工具按钮QToolButton的和用法]]中已经写过，这里跳过实现部分
只讲注意事项
- 左边的是 QToolBox，每一个QToolBox 中展开后是一个 QWidget 组件，可以填入若干个 QToolButton**或者任何元素**，每一个 QToolButton 可通过 `setDefaultAction()` 将按钮和 QAction 连接。这一个操作无法在 UI 设计中实现，只能通过代码。按钮的文字、图标、toolTip 等属性都将自动从关联的 Action复制而来
- 在右侧添加一个 QListWidget，可以通过双击它来进行直观的调整
![[PixPin_2025-11-12_15-48-11.png]]
需要注意 QToolButton 的几个属性
- popupMode 属性：
	- `QToolButton::DelayedPopup`：按钮上没有任何附加的显示内容。如果按钮有下拉菜单，按下按钮并延时一会儿后，才显示下拉菜单。
	- `QToolButton::MenuButtonPopup`：会在按钮右侧显示一个带箭头图标的下拉按钮。点击下拉按钮才显示下拉菜单，点击工具按钮会执行按钮关联的 Action，而不会显示下拉菜单。图 4-46 中列表组件上方的“项选择”按钮就设置为这种模式。
	- `QToolButton::InstantPopup `：会在按钮的右下角显示一个很小的下拉箭头图标，点击按钮就会立刻显示下拉菜单，即使工具按钮关联了一个 Action，也不会执行这个 Action。图 4-46 中工具栏上的“项选择”按钮就设置为这种模式。
- autoRaise 属性，如果设置为 true，按钮就没有边框，鼠标移动到按钮上时才显示按钮边框。
- arrowType 属性。属性值是枚举类型 Qt:: ArrowType。默认值是 `Qt::NoArrow` 用来显示箭头图标
![[PixPin_2025-11-12_15-55-48.png]]
- 在 QListWidget 中使用 `currentIndex()` 会调用底层的**数据模型**来获取当前行在数据模型中所对应的 index，没有选中行返回的 `QModelIndex` 对象的 `isValid()` 方法返回 false。而 ` currentRow() ` 只返回 int 类型，从 0 开始的行号下标，如果没有选中行返回 `-1`
### 代码逻辑
#### 创建插入 item 逻辑
注意创建**指针可视化对象**在设置 parent 时有些 QWidget parent 对象会将其中的子对象自动**并入其中管理**，也就是相当于调用了一次 `addWidget()` 或者 `addItem()`
```cpp
void ListWidgetMainWindow::on_action_insert_item_triggered()
{
    auto selected_items = ui->listWidget->selectedItems();
    int order = ui->listWidget->currentRow();
    QListWidgetItem* item = new QListWidgetItem(QString("insert item"), this->ui->listWidget);
    if(selected_items.size() == 1){
        if(ui->checkBox_is_editable){
            item->setFlags(Qt::ItemIsSelectable | Qt::ItemIsUserCheckable | Qt::ItemIsEnabled | Qt::ItemIsEditable);
            item->setCheckState(Qt::Unchecked);
        }else{
            item->setFlags(Qt::ItemIsSelectable | Qt::ItemIsUserCheckable | Qt::ItemIsEnabled);
        }
        ui->listWidget->insertItem(order, item);
    }else{
        on_action_append_item_triggered();
        delete item; // mark
    }
}
```
如果没有 mark 位置的代码，会导致 item 指针无论如何都会被创建，由于它的 parent 对象设置了 `this->ui->listWidget`，所以 QT 为了防止内存泄漏，会将其纳入 listWidget 的对象树中管理，导致 item 被添加到其中。而正常情况下 QT 只会通过 `addItem` 或者 `addWidget` 才会添加内容，这是一种**保护机制**
解决方法是添加 `delete *item` 或者将创建 item 指针的代码移动到 `if(selected_items.size() == 1)` 语句中，这样就不用添加 delete 语句，或者使用如上方法添加 delete 删除指针
#### 删除 item 逻辑
```cpp
void ListWidgetMainWindow::on_action_delete_item_triggered()
{
    if(ui->listWidget->selectedItems().size() == 0){
        QMessageBox::warning(this, "Warring","you must choose 1 item at least.");
        return;
    }
	// 方法1
    for(int i = 0;i<ui->listWidget->count();i++){
        if(ui->listWidget->item(i)->isSelected()){
            QListWidgetItem *taked_item = ui->listWidget->takeItem(i);
            delete taked_item;
        }
    }
    
    // 方法2
	auto selectedItems = ui->listWidget->selectedItems();  // selectedItems类型为QListWidgetItem*
    for(auto& item : selectedItems){
    	int row = ui->listWidget->row(item);
        if(row >= 0) {
            delete ui->listWidget->takeItem(row);
		}
    }
}
```
这样的代码看似没问题，其实在**删除时索引错乱**，每次多选 item 删除会导致删不干净，方法二甚至会导致指针悬空，因为 selectedItems 中指针指向的内容已经被 `takeitem()` 删除。
#### 设置多选逻辑
通过 `QListWidget::setSelectionMode` 函数解决，并且通过查看文档发现这些 Flag 是**互斥的**，功能上是递进的
- NoSelection (0)
- SingleSelection (1)
- MultiSelection (2)
- ExtendedSelection (3)
- ContiguousSelection (4)
这些值是互斥的，不能进行位运算组合。
- 互斥的枚举值：使用连续整数（0, 1, 2, 3...），值代表不同的状态，每次只能处于一个状态
- 可组合的标志：使用 2 的幂（1, 2, 4, 8...），这样可以通过位运算组合
#### 设置排序逻辑
`QListWidget::sortItems` 函数只能根据 item 的文本内容排序，可选排序设置**只有两个**：
```cpp
listWidget->sortItems(Qt::AscendingOrder);  // 升序
listWidget->sortItems(Qt::DescendingOrder); // 降序
```
如果需要自定义排序逻辑，只能通过排序函数（如 `std::sort`）手动设置
```cpp
QList<QListWidgetItem*> items;
for(int i = 0; i < ui->listWidet.count(); i++){
	items.append(ui->listWidget->item(i));
}
std::sort(items.begin(), items.end(), [](QListWidgetItem* a, QListWidgetItem* b) -> bool { return /* custom logic */ ;});
```
#### QListWidget 信号
```cpp
void currentItemChanged(QListWidgetItem *current, QListWidgetItem *previous)
void currentRowChanged(int currentRow) //当前项发生了切换
void currentTextChanged(const QString &currentText) //当前项发生了切换
void itemSelectionChanged() //表示选择的项发生了变化
void itemChanged(QListWidgetItem *item) //项的属性发生了变化，如文字、复选状态等
void itemActivated(QListWidgetItem *item) //光标停留在某个项上，按 Enter 键时发射此信号
void itemEntered(QListWidgetItem *item) //鼠标跟踪时
void itemPressed(QListWidgetItem *item) //鼠标左键或右键按下
void itemClicked(QListWidgetItem *item) //点击
void itemDoubleClicked(QListWidgetItem *item) //双击
```
***值得注意的是**
- 在 QListWidget 组件上点击某个项而导致当前项发生切换时，组件会发射 4 个信号，表示当前项发生了变化，这 4 个信号是 `currentItemChanged()`、`currentRowChanged()`、`currentTextChanged()` 和 `itemSelectionChanged()`，它们传递的参数不一样
- 击一个项时，不管是否发生了当前项的切换，都会发射 `itemPressed()` 和 `itemClicked()` 信号。1在一个项上点击鼠标右键时只会发射 `itemPressed()` 信号，而不会发射 `itemClicked()` 信号
#### 创建右键菜单
每个继承自 QWidget 的类都有 `customContextMenuRequested()` 信号，在一个组件上点击鼠标右键时，组件发射这个信号，
首先我们如果要创建菜单，**必须**允许 QListWidget 获取上下文菜单，因为默认 `contextMenuPolicy` 属性是 `NoContextMenu` 不显示菜单
用于**自定义请求创建**快捷菜单。需要创建菜单只需要编写对应信号的槽函数即可，也可以使用默认英文菜单。以下是文档

---

- `Qt::NoContextMenu`：组件没有快捷菜单，由其父容器组件处理快捷菜单。
- `Qt::PreventContextMenu`：阻止快捷菜单，并且点击鼠标右键事件也不会交给父容器组件处理。
- `Qt::DefaultContextMenu`：默认的快捷菜单，组件的 QWidget::contextMenuEvent()事件被自动处理。某些组件有自己的默认快捷菜单，例如 QPlainTextEdit 的 contextMenuPolicy 属性默认设置为这个值，在无须任何编程的情况下，运行时点击鼠标右键就会出现一个标准的编辑操作快捷菜单，只是菜单文字是英文的。
- `Qt::ActionsContextMenu`：自动根据 QWidget::actions()返回的 Action 列表创建并显示快捷菜单。
- `Qt::CustomContextMenu`：组件发射 customContextMenuRequested()信号，由用户编程实现创建并显示快捷菜单

| Constant                 | Value | Description                                                                                                                                                                                                                                                                                                      |
| ------------------------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Qt::NoContextMenu`      | 0     | the widget does not feature a context menu, context menu handling is deferred to the widget's parent.                                                                                                                                                                                                            |
| `Qt::PreventContextMenu` | 4     | the widget does not feature a context menu, and in contrast to NoContextMenu, the handling is *not* deferred to the widget's parent. This means that all right mouse button events are guaranteed to be delivered to the widget itself through `QWidget::mousePressEvent()`, and `QWidget::mouseReleaseEvent()`. |
| `Qt::DefaultContextMenu` | 1     | the widget's `QWidget::contextMenuEvent()` handler is called.                                                                                                                                                                                                                                                    |
| `Qt::ActionsContextMenu` | 2     | the widget displays its `QWidget::actions()` as context menu.                                                                                                                                                                                                                                                    |
| `Qt::CustomContextMenu`  | 3     | the widget emits the `QWidget::customContextMenuRequested()` signal.                                                                                                                                                                                                                                             |

---

对于 `on_listWidget_customContextMenuRequested(const QPoint& point)` 中的 point 参数需要知道：
1. pos 参数是视口（viewport）坐标系中的位置，不是全局坐标
2. 坐标系：pos 是**鼠标点击位置**相对于 QListWidget 的视口（viewport）的相对坐标坐标，相对坐标轴的原点在部件视口的左上角
3. 视口是什么：QListWidget 内部的可滚动区域，包含所有列表项
4. 不是全局坐标：也不是相对于整个 QListWidget 控件（包括滚动条、边框等）的坐标
```cpp
void ListWidgetMainWindow::on_listWidget_customContextMenuRequested(const QPoint &pos)
{
    if(ui->listWidget->itemAt(pos) == nullptr){
        QPoint global_pos = ui->listWidget->viewport()->mapToGlobal(pos);
        QMenu* press_menu = new QMenu(this);
        press_menu->addAction(ui->action_init_list);
        press_menu->addAction(ui->action_insert_item);
        press_menu->addAction(ui->action_append_item);
        press_menu->addAction(ui->action_delete_item);
        press_menu->addSeparator();
        press_menu->addAction(ui->action_select_all);
        press_menu->addAction(ui->action_select_none);
        press_menu->addAction(ui->action_select_inves);

        press_menu->exec(global_pos);
    }
}
```
### 代码实现
仅仅是实现较为重要的部分，一些逻辑上重复的 QAction 槽函数没有实现，参考 [[C++ practice case#Qt 项目代码#4.11 QLIstWidget]]

## \[DIY\]自己实现网红表白程序
### 功能设计
#### 整体接口
```cpp
class ManyWindows : public QWidget
{
    Q_OBJECT
public:
    explicit ManyWindows(QString content ,QWidget *parent = nullptr);
    ~ManyWindows();

    QRandomGenerator gen;
private:
    Ui::ManyWindows* ui;
    QLineEdit* lineedit_display;

    void build_UI();
    void impl_bgcolor_textcolor();
signals:
};
```
gen 是随机数生成器，如果把它初始化为 `QRandomGenerator::global()` 放在 public 可以在外部调用而不损失性能，放在 private 那么外部生成多个窗口时窗口位置随机数就需要再使用一个随机数生成器
#### 随机生成文本和背景颜色
```cpp
void ManyWindows::impl_bgcolor_textcolor()
{
    gen = QRandomGenerator::securelySeeded();
    QColor bg_color{
        gen.bounded(255),
        gen.bounded(255),
        gen.bounded(255)
    };
    QColor text_color{
        gen.bounded(255),
        gen.bounded(255),
        gen.bounded(255)
    };
    auto line_palette = this->lineedit_display->palette();
    line_palette.setColor(QPalette::Base, bg_color);
    line_palette.setColor(QPalette::Text, text_color);
    this->lineedit_display->setPalette(line_palette);
    QFont font = lineedit_display->font();
	font.setBold(true);
	font.setPointSize(20);
	this->lineedit_display->setFont(font);
}
```
随机数生成可以参考 [[#QRandomGenerator 类]]，自定义调整颜色和样式有几种方法：
- 使用调色板调整每个部分颜色，设置字体等：
```cpp
QLineEdit* lineEdit = new QLineEdit(this);
// 创建调色板
QPalette palette = lineEdit->palette();
// 设置背景色
palette.setColor(QPalette::Base, QColor("#2C3E50"));
// 设置字体颜色
palette.setColor(QPalette::Text, QColor("#ECF0F1"));
// 设置占位符文本颜色
palette.setColor(QPalette::PlaceholderText, QColor("#95A5A6"));
// 应用调色板
lineEdit->setPalette(palette);
// 可选：设置字体
QFont font("Arial", 12, QFont::Bold);
lineEdit->setFont(font);
```
- 使用 QSS：
```cpp
QLineEdit* lineEdit = new QLineEdit(this);

// 设置背景色和字体颜色
lineEdit->setStyleSheet("QLineEdit {"
                       "background-color: #2C3E50;"
                       "color: #ECF0F1;"
                       "border: 2px solid #34495E;"
                       "border-radius: 5px;"
                       "padding: 5px;"
                       "}");
```
#### 实现多个窗口
这个实现放在类外部
```cpp
void make_many_windows(size_t interval, size_t duration, QString content)
{
    QTimer* global_timer = new QTimer();
    global_timer->setInterval(interval);
    QList<ManyWindows*>* global_windows = new QList<ManyWindows*>();
    QScreen* screen = QApplication::primaryScreen();
    QRect screen_rect = screen->geometry();
    QObject::connect(global_timer, &QTimer::timeout, [screen_rect, global_windows, content]() {
        ManyWindows* window = new ManyWindows(content);
        window->show();
        QRandomGenerator pos_gen = QRandomGenerator::securelySeeded();
        const int window_width = window->width();
        const int window_height = window->height();
        int max_x = qMax(0, screen_rect.width() - window_width);
        int max_y = qMax(0, screen_rect.height() - window_height);
        int random_x = (max_x > 0) ? pos_gen.bounded(max_x + 1) : 0;
        int random_y = (max_y > 0) ? pos_gen.bounded(max_y + 1) : 0;
        window->move(random_x, random_y);
        global_windows->append(window);
        // debug
        qDebug() << "window: (" << random_x << ", " << random_y << ") created.";
    });
    global_timer->start();
    QTimer::singleShot(duration, [&global_timer, &global_windows]() {
    // mark 正确形式：
    // QTimer::singleShot(duration, [global_timer, global_windows]() {
        if(global_timer && global_timer->isActive()){
            global_timer->stop();
            // debug
            qDebug() << "stop create windows.";
            for(auto& window : *global_windows){
                if(window) {
                    window->close();
                    window->deleteLater();
                }
            }
            global_windows->clear();
            delete global_windows;
        }
        global_timer->deleteLater();
    });
}

int main(int argc, char** argv) {
	QApplication a(argc, argv);
	make_many_windows();
	return a.exec();
}
```
- 一般来说，定时执行某个动作只需要设置 `QTimer` 并 `setInterval()` 即可，如果需要设置一段时间之后结束计时，则还需要使用一个辅助计时器。
- 如果这个停止计时的操作是单次的（只停止一个/次计时器），可以使用 `QTimer::singleShot(ms, operation)`
- 一般执行的流程是先初始化 `QTimer` 对象的设置，然后通过 connect 连接 timeout 信号执行的操作。注意 connect 可以没有 receiver，把接收信号的动作交给一个**生命周期长于 timer 对象的函数执行**
- `QTimer` 对象在调用 `start()` 后会***立刻返回，函数不会在这条语句位置阻塞***，计时操作会转到后台**异步进行**。
- `QTimer::singleShot` **是 static**的，初始化之后就**立刻返回**，计时操作同样后台异步运行
这段代码有一个很不容易发现的错误
在 mark 位置 singleShot 的 lambda 函数**使用引用捕获了两个局部变量**，但是由于 `timer->start()` 不阻塞，所以开始计时之后设置好 singleShot 定时结束之后，`make_many_windows` 函数返回，其中**所有局部变量被销毁**，导致**已经完成初始化的 singleShot 后台计时对象捕获的指针所指向的内存已经被销毁**，程序读取到释放的内存块会导致程序崩溃。
日志中会显式说明程序崩溃
## QTreeWidge
### 准备工作
要在一个 container 容器中设置布局，UI 编辑器中设置 `layoutDirection`
![[PixPin_2025-11-14_17-37-17.png]]
![[Pasted image 20251114173750.png]]
代码中使用 `setLayoutDirection` 即可
设置中心组件（`setCentralWidget`）是 QMainWindow 的专属方法，一个 MainWindow 类只能有一个中心组件，后设置的会覆盖前设置的。设置一个子空间为中心组件之后：
1. **布局管理**：该子组件会自动占据主窗口的中心区域
2. **自动调整**：当主窗口大小改变时，中心组件会自动调整大小以适应可用空间
3. **移除默认**：替换掉`QMainWindow`默认的空中心部件
4. **内存管理**：设置为中心组件的子组件会被`QMainWindow`自动管理其生命周期
![[PixPin_2025-11-14_17-44-50.png|400]]
这里由于 scrollArea 不是中心，所以不会自动填充（当然也可以设置 `sizePolicy` 来实现）
![[PixPin_2025-11-14_17-47-48.png|400]]
设置之后自动填充
### 关闭所有调试信息输出
有些信号槽配合比较复杂的类，需要通过输出调试信息来观察信号触发情况时，就会用到很多 `qDebug` 调试信息，在 qmake 中可以通过
```qmake
DEFINES += QT_NO_DEBUG_OUTPUT
```
禁用所有调试信息输出
cmake 中通过：
```cmake
target_compile_definitions(your_target_name 
    PRIVATE 
        QT_NO_DEBUG_OUTPUT
        QT_NO_INFO_OUTPUT  # 如果需要也禁用qInfo()
        QT_NO_WARNING_OUTPUT  # 如果需要也禁用qWarning()
)

# 如果需要全局配置
add_definitions(-DQT_NO_DEBUG_OUTPUT)

# 如果需要连接前设置
target_compile_definitions(your_target_name PRIVATE QT_NO_DEBUG_OUTPUT)
target_link_libraries(your_target_name Qt6::Core)
```
代码中的 `qDebug()` 语句仍然存在，只是不会在运行时输出到控制台。
### 为控件设置用户数据
很多Qt组件都有一个 `setData()` 函数，data 属性类型为QVariant，用来存储“用户数据”
`QVariant` 就像一个"万能容器"，可以存储任意类型的数据（整数、字符串、对象指针等），有很多应用场景：
```cpp
// 在文件管理器中，列表项显示文件名，但需要知道文件路径
QListWidgetItem *item = new QListWidgetItem("文档.txt");
item->setData(Qt::UserRole, "/home/user/文档.txt"); // 存储完整路径

// 点击时获取真实路径
void onItemClicked(QListWidgetItem *item) {
    QString filePath = item->data(Qt::UserRole).toString();
    openFile(filePath); // 使用存储的路径打开文件
}
// 存储临时数据
// 在进度管理器中，存储计算进度
QProgressBar *progressBar = new QProgressBar();
progressBar->setData(Qt::UserRole, calculateTotalSteps()); // 存储总步数

void updateProgress() {
    int totalSteps = progressBar->data(Qt::UserRole).toInt();
    int currentStep = getCurrentStep();
    progressBar->setValue(currentStep * 100 / totalSteps);
}
```
1. **数据与显示分离**：显示文本和实际数据可以不同
2. **避免全局变量**：数据直接关联到相关组件
3. **简化事件处理**：在事件回调中直接获取关联数据
通过 `setData(Qt::role, QVariant var)` 插入键值对
查看 ` enum Qt::ItemDataRole ` 文档可以看到有很多已经内置的 role，可以看到他们是[[#QToolButton 和 QListWidget#代码逻辑#设置多选逻辑|互斥的]]，但是如果这些还是不够用，则可以插入自定义 role（QUserRole），它的值为 `0x100`，通过 `QUserRole+1` 来扩充 data 的键
### Qt 信号发射 emit 关键字
`emit` 实际上是一个**空宏**，在预处理阶段会被替换为空：
```cpp
#define emit
```
由于各种 Qt 控件的信号函数可以直接使用函数调用来发起，**技术上不需要使用 emit**关键字，emit 关键字的存在**仅仅是为了可读性**，避免这种信号发射语法和函数调用混淆
虽然技术上不是必须，但是**强烈建议保留**
### QTreeWidget类
对于列，可以设置 `QTreeWidgetItem` 作为表头，这样能够设置表头的各种样式，如果只是使用 QLabel 就不行，两者对应 api 为：
```cpp
void QTreeWidget::setHeaderLabels(const QStringList &labels)
void QTreeWidget::setHeaderItem(QTreeWidgetItem *item) //设置表头节点
QTreeWidgetItem *QTreeWidget::headerItem() //返回表头节点
```
允许存在任意个顶层节点，一个根节点，使用 `QTreeWidgetItem *QTreeWidget::invisibleRootItem()` 返回
`QTreeWidgetItem` 在构造函数中有一个 type 变量，是一个和 [[#为控件设置用户数据|QWidget的data属性]]相似的一个特性，可以为其设置 type（**只能是一个 int 类型**）来标记这个 item 的类别。但是设置后不能更改，没有 `setType` 接口
由于这一章和 [[#QToolButton 和 QListWidget]] 非常像，很多代码较为重复，这里只实现重要部分：[[C++ practice case#Qt 项目代码#4.12 QTreeWidget]]
## QTableWidget
和 [[#QToolButton 和 QListWidget|QListWidget]] & [[#QTreeWidge]] 大同小异，只不过 table 中的 item 变为了单元格，最小设置单元也成为了一个单元格，对行列的修改本质上都是在**按照单元格坐标**每次修改一个单元格
每一个 item 同样可以设置 type 和 [[#QTreeWidge#为控件设置用户数据|data]]
### 信号处理
同 [[#QTreeWidge]]，当前单元格发生切换时，会同时发射 `currentCellChanged()` 信号和 `currentItemChanged()` 信号。`currentCellChanged()` 信号传递 4个参数，即当前单元格的行号和列号以及之前单元格的行号和列号，`currentItemChanged()` 信号传递两个参数，即当前项和之前的项。
自动调整行高和行宽比较方便
```cpp
void  resizeColumnToContents(int column)          //自动调整列号为column的列的宽度
void  resizeColumnsToContents()                   //自动调整所有列的宽度，以适应其内容
void  resizeRowToContents(int row)                //自动调整行号为row的行的高度
void  resizeRowsToContents()                      //自动调整所有行的高度，以适应其内容
```
调整间隔行底色错开 `setAlternatingRowColors(checked)`
# 模型/视图结构
## 概述说明

> 模型/视图（model/view）结构是进行数据存储和界面展示的一种编程结构。在这种结构里，**模型存储数据，界面上的视图组件显示模型中的数据**，在视图组件里修改的数据会被自动保存到模型里。

重点在于模型**只负责存储数据**，**视图只负责展示模型中的数据**，模型的数据来源可以是**内存中**的字符串列表或二维表格型数据，也可以是**数据库中**的数据表，一种模型可以用不同的视图组件来显示数据
![[PixPin_2025-11-15_17-07-57.png]]
模型向视图提供数据是**单向的**，代理（delegate）在视图与模型之间交互操作时提供的临时编辑器，当需要在视图上编辑数据时，代理会为编辑数据提供一个编辑器，这个编辑器获取模型的数据、接受用户编辑的数据后又将其提交给模型。例如在QTableView组件上双击一个单元格来编辑数据时，在单元格里就会出现一个QLineEdit组件，这个编辑框就是代理提供的临时编辑器。这一点已经在[[Qt Official Tutorial#Books|官方books示例]]中使用到
### 模型
所有基于项（item）的模型类都是基于QAbstractItemModel类的，这个类定义了视图组件和代理存取数据的接口。**继承自 QObject 所以支持元对象系统**
![[PixPin_2025-11-16_09-03-18.png]]
常用模型类：

| 模型类                | 功能                                 |
| ------------------ | ---------------------------------- |
| QFileSystemModel   | 用于表示计算机上文件系统的模型类                   |
| QStringListModel   | 用于表示字符串列表数据的模型类                    |
| QStandardItemModel | 标准的基于项的模型类，每个项是一个 QStandardItem 对象 |
| QSqlQueryModel     | 用于表示数据库 SQL 查询结果的模型类               |
| QSqlTableModel     | 用于表示数据库的一个数据表的模型类                  |
### 视图
视图就是用于显示模型中的数据的界面组件

| 视图类         | 功能                                                                 |
|----------------|----------------------------------------------------------------------|
| QListView      | 用于显示单列的列表数据，适用于一维数据的操作。                         |
| QTreeView      | 用于显示树状结构数据，适用于树状结构数据的操作。                       |
| QTableView     | 用于显示表格数据，适用于二维表格数据的操作。                           |
| QColumnView    | 用多个 QListView 显示树状结构数据，树状结构的一层用一个 QListView 显示。 |
| QUndoView      | 用于显示 undo 指令栈内数据的视图组件，是 QListView 的子类。             |

QListWidget、QTreeWidget和QTableWidget这3个用于处理项数据的组件。这3个类分别是3个视图类的子类，称为视图类的便利类（convenience class）。
  ![[PixPin_2025-11-16_09-10-30.png]]
  调用视图类的 `setModel()` 函数为视图组件设置一个模型，模型的数据就可以显示在视图组件上。在视图组件上修改数据后，数据可以自动保存到模型里。便利类实际上是将数据管理关联给每一个item对象，**便利类没有模型**，只是使用item来管理数据,属于一种简化版的模型。只适用于小型数据源
### 代理
代理就是在视图组件上为编辑数据提供的**临时编辑器**，例如在 QTableView 组件上编辑一个单元格的数据时，默认会提供一个 QLineEdit 编辑框。代理负责从模型获取相应的数据，然后将其显示在编辑器里，修改数据后又将编辑器里的数据保存到模型中。
### 模型/视图结构的一些概念
#### 模型基本结构
在模型/视图结构中，模型为视图组件和代理提供存取数据的标准接口。`QAbstractItemModel` 是所有模型类的基类，不管底层的数据结构是如何组织数据的，`QAbstractItemModel` 的子类都以表格的层次结构展示数据，视图组件按照这种规则来存取模型中的数据，但是展示给用户的形式不一样。
常用三种模型为：
![[PixPin_2025-11-16_09-21-59.png]]
#### 模型索引
QModelIndex是表示模型索引的类。模型索引提供访问数据的临时指针，模型索引是临时的，模型数据改变会让指针失效。
当模型为列表或表格结构时，使用行号、列号访问数据比较直观，**所有项的父项就是顶层项**。当模型为树状结构时情况比较复杂（树状结构中，项一般称为节点），一个节点有**父节点**，其也可以是其他节点的父节点要获得一个模型索引，必须提供3个参数：行号、列号、父项的模型索引 （默认使用对应模型的构造函数获取）
```cpp
QModelIndex indexA = model->index(0, 0, QModelIndex());
QModelIndex indexC = model->index(2, 1, QModelIndex());
```
#### 模型角色
同[[#为控件设置用户数据]]
### QAbstractItemView类
QListView组件一般用QStringListModel对象作为数据模型，用于编辑字符串列表；QTableView一般用QStandardItemModel对象作为数据模型，用于编辑表格数据，QTableView在允许选择多个单元格时，使用QItemSelectionModel类对象作为选择模型就比较有用，可以获得所有被选单元格的模型索引，需要调用 `setSelectionModel` 函数而不是 `setModel`
#### 常用属性
editTriggers属性。表示视图组件是否可以编辑数据，以及进入编辑状态的方式。类似 item 控件的 Flag 属性，查阅文档即可

- `alternatingRowColors` 设置各行是否交替使用不同的背景色。如果设置为true，会使用系统默认的一种颜色。如果要自定义背景色，需要用**Qt样式表**
- selectionMode属性。这个属性表示在视图组件上选择项的操作模式，对于QTableView比较有意义。设置单选多选拓展选项
### QStringListModel和QListView
QStringListModel是处理字符串列表的模型类，其实例可以作为QListView组件的数据模型。结合使用这两个类，就可以在界面上显示和编辑字符串列表。
对 view 使用 `setModel` 会自动连接对应信号和槽，这才会使对模型的修改会被实时更新到视图，对模型修改则使用 `setData()` 设置 `Qt::DisplayRole` 或者使用 `setItemData`。
比较简单
### QStandardItemModel和QTableView
`QStandardItemModel`：基于项的模型类。它维护一个二维的项数组，每个项是一个 QStandardItem 对象，用于存储文字、字体、对齐方式等各种角色的数据。
`QTableView`：二维表格视图组件类，基本显示单元是单元格。通过函数 `setModel ()` 设置一个 QStandardItemModel 类的数据模型之后，一个单元格显示数据模型中的一个项。
`QItemSelectionModel`：项选择模型类。它是用于跟踪视图组件的单元格选择状态的类，需要指定一个 QStandardItemModel 类的数据模型。当在 QTableView 组件上选择一个或多个单元格时，通过项选择模型可以获得选中单元格的模型索引。
#### 选择模型
一个视图组件需要设置一个数据模型，还可以设置一个选择模型，使用 `setSelectionModel`，QItemSelectionModel是选择模型类，它的功能是跟踪视图组件上的选择操作，给出选择范围。

#### 从文件中读取文本内容
```cpp
void MainWindow::on_actOpen_triggered() {
    QString curPath = QCoreApplication::applicationDirPath();
    QString aFileName = QFileDialog::getOpenFileName(this, "打开一个文件", curPath, "数据文件(*.txt);;所有文件(*.*)");
    if (aFileName.isEmpty())
        return;
    QStringList aFileContent;
    QFile aFile(aFileName);
    if (aFile.open(QIODevice::ReadOnly | QIODevice::Text)) {
        QTextStream aStream(&aFile);
        ui->plainTextEdit->clear();
        while (!aStream.atEnd()) {
            QString str = aStream.readLine();          
            ui->plainTextEdit->appendPlainText(str);
            aFileContent.append(str);
        }
        aFile.close();
		// ....
    }
}
```
打开文件操作应该配一个 if 语句验证是否打开，并在 if 中将文件关闭
```cpp
void MainWindow::iniModelData(QStringList& aFileContent) {
    int rowCnt = aFileContent.size(); // 文本行数，第一行是标题
    m_model->setRowCount(rowCnt - 1); // 实际数据行数
    QString header = aFileContent.at(0);

    QStringList headerList = header.split(QRegularExpression("\\s+"), Qt::SkipEmptyParts);
    m_model->setHorizontalHeaderLabels(headerList);

    int j;
    QStandardItem* aItem;
    for (int i = 1; i < rowCnt; i++) {
        QString aLineText = aFileContent.at(i);
        QStringList tmpList = aLineText.split(QRegularExpression("\\s+"), Qt::SkipEmptyParts);
        for (j = 0; j < FixedColumnCount - 1; j++) {
            aItem = new QStandardItem(tmpList.at(j));
            m_model->setItem(i - 1, j, aItem);
        }
        aItem = new QStandardItem(headerList.at(j));
        aItem->setCheckable(true);

        aItem->setBackground(QBrush(Qt::yellow));
        if (tmpList.at(j) == "0")
            aItem->setCheckState(Qt::Unchecked);
        else
            aItem->setCheckState(Qt::Checked);
        m_model->setItem(i - 1, j, aItem);
    }
}
```
比较简单，查阅文档即可
## 自定义代理
在模型/视图结构中，代理的作用就是在视图组件进入编辑状态编辑某个项时，提供一个临时的编辑器用于数据编辑，编辑完成后再把数据提交给数据模型。
### 自定义代理的功能
若要替换QTableView组件提供的默认代理组件，就需要为QTableView组件的某列或某个单元格设置自定义代理。自定义代理类需要从QStyledItemDelegate类继承。
也可以**单单为某一行或者某一列使用代理**
如果需要设置自定义代理类，需要实现这几个函数：
- createEditor
	- parent是要创建的组件的父组件，一般就是窗口对象；option是项的一些显示选项，是QStyleOptionViewItem类型的，包含字体、对齐方式、背景色等属性；
	- index是项在数据模型中的模型索引，
	- `index->model()` 可以获取项所属数据模型的对象指针。
	- 设置了代理类的组件**被编辑时**就是调用这个函数来创建被编辑时显示的状态
```cpp
QWidget  *QStyledItemDelegate::createEditor(QWidget *parent, const QStyleOptionViewItem &option, const QModelIndex &index) 
```
- setEditorData
	- 定义如何将数据模型中对应 index 位置的数据加载到 `createEditor` 函数创建出的**临时编辑器**中**用来显示**，不至于用户点击编辑之后看到的编辑框中的内容不是空白。
	- 这个函数的默认实现（或者说一般实现）是通过 data 函数 `Qt::UserRole` 用户角色对应的数据
	- 代理组件在被编辑时**代理组件中显示的内容/状态**通过这个函数实现
```cpp
// 自定义委托类
class MyDelegate : public QStyledItemDelegate {
public:
    // 1. 创建编辑器
    QWidget* createEditor(QWidget *parent, const QStyleOptionViewItem &option, const QModelIndex &index) const override {
        return new QLineEdit(parent);  // 返回文本编辑器
    }
    // 2. 设置编辑器数据 - 重点函数！
    void setEditorData(QWidget *editor, const QModelIndex &index) const override {
        QLineEdit *lineEdit = static_cast<QLineEdit*>(editor);
        QString currentText = index.data(Qt::EditRole).toString();
        // 设置到编辑器中
        lineEdit->setText(currentText);
    }
};
```
- setModelData
	- 是 setEditorData 的反面，用于设置填入代理编辑器中的数据用什么方法填入数据模型
```cpp
void  QStyledItemDelegate::setModelData(QWidget *editor, QAbstractItemModel *model, const QModelIndex &index)
```
- updateEditorGeometry
	- 用于设置 createEditor 设置的编辑器的大小
```cpp
// 根据内容调整大小
void updateEditorGeometry(QWidget *editor, 
                         const QStyleOptionViewItem &option,
                         const QModelIndex &index) const {
    QLineEdit *lineEdit = qobject_cast<QLineEdit*>(editor);
    if (lineEdit) {
        // 根据文本长度调整编辑器宽度
        QString text = index.data(Qt::DisplayRole).toString();
        int textWidth = lineEdit->fontMetrics().horizontalAdvance(text) + 10;
        QRect rect = option.rect;
        rect.setWidth(qMin(textWidth, 200));  // 最大200像素
        editor->setGeometry(rect);
    }
}

// 这样可以设置建议大小
editor->setGeometry(option.rect);
```
### 设计自定义代理类
实现这三个函数，并在想要使用代理模型的 View 上使用 `setItemDelegate` 函数设置即可。可以参考官方实现 [[Qt Official Tutorial#Books#设置委托机制（booksdelegate. cpp）]]
## QFileSystemModel和QTreeView
### QFileSystemModel类
#### 基本知识
QFileSystemModel为本机的文件系统提供一个模型，可用于访问本机的文件系统，函数 `setRootPath()` 用于设置一个根目录，QFileSystemModel模型就只显示这个根目录下的文件系统。
```cpp
QDir  rootDirectory()          //以QDir类型返回当前根目录
QString  rootPath()            //以QString类型返回当前根目录
```
`setFilter()` 用来设置文件管理器的设置：
- `QDir::AllDirs`：列出所有目录。**函数setFilter()设置的过滤器必须包含这个选项**。
- `QDir::Files`：列出文件。
- `QDir::Drives`：列出驱动器。
- `QDir::NoDotAndDotDot`：不列出目录下的“.”和“..”特殊项，这两项会在 linux 下显示
- `QDir::Hidden`：列出隐藏的文件。
- `QDir::System`：列出系统文件。
文件名和文件类型过滤器：`setNameFilters` 一般接受 QStringList，过滤器会用通配符表示，`setNameFilterDisables(bool enable)` 设置为true，未通过文件名过滤器过滤的项只是被设置为禁用；如果参数enable设置为false，未通过文件名过滤器过滤的项就被隐藏
`setOption` 可以用来设置枚举值，对文件管理器进行不同的设置：
`QFileSystemModel::DontWatchForChanges`：不监视文件系统的变化，默认是监视。
`QFileSystemModel::DontResolveSymlinks`：不解析文件系统的符号连接项，默认是解析。
`QFileSystemModel::DontUseCustomDirectoryIcons`：不使用自定义的目录图标，默认是使用系统的图标。

文件系统最好是树形模型，如果要对文件系统进行操作或者获取信息大部分 api 需要传入一个 QModelIndex index ，这个可以通过 `item->index()` 或者 `QTreeWidgetItem` 组件的 `clicked` 信号触发

### 代码编写
treeview 的 clicked 信号会发送当前被点击的对象的 index，这个 index 可以给文件模型来获取这个项的各种信息，参考[[#QFileSystemModel类#基本知识|基本api]]
其他部分比较简单，使用到上述 api 的代码：
```cpp
#include "mainwindow.h"
#include <qfiledialog.h>
#include "ui_mainwindow.h"

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    ui->splitterMain->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);
    model_ = new QFileSystemModel(this);
    model_->setRootPath(QDir::currentPath());
    ui->treeView->setModel(model_);
    ui->tableView->setModel(model_);
    ui->listView->setModel(model_);

    connect(ui->treeView, &QTreeView::clicked, ui->listView, &QListView::setRootIndex);
    connect(ui->treeView, &QTreeView::clicked, ui->tableView, &QTableView::setRootIndex);
}

MainWindow::~MainWindow()
{
    delete ui;
}


void MainWindow::on_treeView_clicked(const QModelIndex &index)
{
    ui->chkIsDir->setChecked(model_->isDir(index));
    ui->labPath->setText(model_->filePath(index));
    ui->labType->setText(model_->type(index));
    ui->labFileName->setText(model_->fileName(index));
    unsigned int size = model_->size(index);
    if(size < 1024){
        ui->labFileSize->setText(QString("%1 KB").arg(size / 1024));
    }else{
        ui->labFileSize->setText(QString::asprintf("%.1f MB").arg(size / 1024 / 1024));
    }
}


void MainWindow::on_actSetRoot_triggered()
{
    QString dir = QFileDialog::getExistingDirectory(this, "选择目录", QDir::currentPath());
    if (!dir.isEmpty()) {
        model_->setRootPath(dir);
        ui->treeView->setRootIndex(model_->index(dir));
    }
}


void MainWindow::on_radioShowAll_clicked()
{
    ui->groupBoxFilter->setEnabled(true);
    model_->setFilter(QDir::AllDirs | QDir::Files | QDir::NoDotAndDotDot);
}


void MainWindow::on_radioShowOnlyDir_clicked()
{
    ui->groupBoxFilter->setEnabled(false);
    model_->setFilter(QDir::AllDirs | QDir::NoDotAndDotDot);
}


void MainWindow::on_chkBoxEnableFilter_clicked(bool checked)
{
    model_->setNameFilterDisables(!checked);
    ui->comboFilters->setEnabled(checked);
    ui->btnApplyFilters->setEnabled(checked);
}


void MainWindow::on_btnApplyFilters_clicked()
{
    QString fliters = ui->comboFilters->currentText().trimmed();
    QStringList filter_list = fliters.split(";",Qt::SkipEmptyParts);
    model_->setNameFilters(filter_list);
}
```

### UI 设计
![[PixPin_2025-11-19_16-47-34.png]]
- 留空的地方最好放一个 spacer
- 选中多个控件，然后右键->布局->使用拆分器水平（垂直）布局，这样这几个控件之间就会出现一个**分隔条**，用户可以通过拖动分隔条来调整不同部分控件的所占用的空间大小。
- 如果有多个不同的 splitter 组合成不同方向的布局，比如图中的 TreeView 和右边的两个 View 是 splitter 水平布局，而右边两个 ListView 和 TableView 是上下结构体的 Splitter，这就需要给 splitter 设置 sizePolicy 为 expanding，否则调整 splitter_main 也就是 1，右边的 splitter 水平拓展
![[PixPin_2025-11-19_17-17-44.png]]
![[PixPin_2025-11-19_17-21-59.png]]
- 如果想要 ui 编辑器中拖动画布，所有画布中的控件都随着画布大小变化，那么需要调整**根布局（mainwindow 类中名为 centeralWidget），也就是根对象下的第一个布局**的 layout 属性
![[Pasted image 20251119172713.png]]
![[PixPin_2025-11-19_17-27-50.png]]
这样控件就会随着画布大小而调整

# 事件处理
GUI 应用程序是由事件（event）驱动的，点击鼠标、按下某个按键、改变窗口大小、最小化窗口等都会产生相应的事件，应用程序对这些事件进行相应的处理以实现程序的功能
## Qt 的事件系统
### 事件的产生和派发
在 Qt 中，**事件是对象，是 QEvent 类或其派生类的实例**
- QKeyEvent 是按键事件类，
- QMouseEvent 是鼠标事件类，
- QPaintEvent 是绘制事件类，
- QTimerEvent 是定时器事件类
事件来源分类：
1. 自生事件（spontaneous event）：是由窗口系统产生的事件。QKeyEvent 事件、QMouseEvent 事件。自生**事件会进入系统队列，然后被应用程序的事件循环逐个处理。**
2. 发布事件（posted event）：是由Qt或应用程序产生的事件。例如，**QTimer定时器发生定时溢出**时Qt会自动发布QTimerEvent事件。应用程序使用静态函数 `QCoreApplication::postEvent()` 产生发布事件。**发布事件会进入Qt事件队列，然后由应用程序的事件循环进行处理。**
3. 发送事件（sent  event）：是由Qt或应用程序定向发送给某个对象的事件。应用程序使用***静态函数*** `QCoreApplication::sendEvent()` 产生发送事件，由对象的 `event()` 函数直接处理。
```cpp
bool  QCoreApplication::sendEvent(QObject *receiver, QEvent *event)
```

> [!note]
> 窗口系统产生的自生事件**自动进入系统队列**
> 应用程序发布的事件**进入 Qt 事件队列**
> 自生事件和发布事件的处理是**异步**的，也就是事件进入队列后由系统去处理，程序不会在产生事件的地方停止进行等待。

main 函数中的 `return a.exec()` 函数用来**调起时事件循环**，之前做的只是 UI 显示工作，`QApplication::exec()` 的主要功能就是不断地检查系统队列和Qt事件队列里是否有未处理的**自生事件和发布事件（只处理这两种事件）**，应用程序的事件循环还可以对队列中的**相同事件进行合并处理**，例如如果队列中有一个界面组件的多个 QPaintEvent 事件，就只派发一次 QPaintEvent 事件，**因为界面只需要绘制一次**。
发送事件由应用程序**直接派发**给某个对象，是以**同步模式**运行的
如果循环事件比较复杂，导致的程序卡顿（CPU 长时间占用）可以使用下面方法解决：
- 不同线程处理不同逻辑（界面渲染和数据处理）
- 长时间占用 CPU 的过程中调用 `QCoreApplication::processEvents()` 将事件队列里未处理的事件派发出去
```cpp
void  QCoreApplication::processEvents(QEventLoop::ProcessEventsFlags flags = QEventLoop::AllEvents)
```
`QEventLoop::AllEvents`：处理所有事件。
`QEventLoop::ExcludeUserInputEvents`：排除用户输入事件，如键盘和鼠标的事件。
`QEventLoop::ExcludeSocketNotifiers`：排除网络 socket 的通知事件。
`QEventLoop::WaitForMoreEvents`：如果没有未处理的事件，等待更多事件。
还有一个派发函数
```cpp
void QCoreApplication::sendPostedEvents(QObject *receiver = nullptr, int event_type = 0)
```
- 把前面用静态函数`QCoreApplication::postEvent()`发送到Qt事件队列里的事件立刻派发出去。
- 如果不指定event_ type，只指定receiver，就派发所有给这个接收者的事件；
- 如果event_type和receiver都不指定，就派发所有用 `QCoreApplication::postEvent()` 发布的事件。
### 事件的处理
一个类接收到应用程序派发来的事件后，首先会由函数 `event()` 处理

> [!note]
> 任何从QObject派生的类都可以重新实现函数 `event()`。如果一个类重新实现了函数 `event()`，需要在函数 `event()` 的实现代码里设置是否接受事件。`accept()` 或者 `ignore()`，被接受的事件由事件接收者处理，被忽略的事件则传播到事件接收者的父容器组件的event()函数去处理，这称为事件的传播（propagation），事件最后可能会传播给 QWidget。accept 和 ignore 除了传播方面，就只有一个**标记作用**，用来鉴别(`isAccept()`)一个事件是否已经被处理，避免重复

所有继承自 `QWidget` 的类都实现了 event 函数，并对一些类别的事件定义了专门的处理函数（绘制函数 `paintEvent`，鼠标移动函数 `mouseEvent` ），并且这些函数都是 protect 的

### 典型事件处理
qt为不同的事件设置了不同的处理函数，在对象接收到事件时，先调用 `event` 函数，然后根据事件的类别（`event.type()`）将这个信号对象转发到不同的处理函数处理，而不同的信号对象的accept函数的实现逻辑是不一样的，默认实现都是通过 `accept` 封装起来，方便调用
绘制窗口函数
```cpp
void Widget::paintEvent(QPaintEvent *event)
{
    QPainter painter(this);
    painter.drawPixmap(0,0,this->width(),this->height(), QPixmap(":/pics/images/background.jpg"));
    // QWidget::paintEvent(event);
}
```
由于绘制窗口的**逻辑定义**是在**显示 UI 之后**，事件循环之前，事件循环开始之后就是开始处理事件了，根据**单一职责和资源最小化原则**，只在需要用到资源的位置加载和使用资源。由于 painEvent 比构造函数更加具体（更小），初始化资源应该在这个函数中完成
注释部分会运行父类的 `paintEvent()` 函数，以便父类执行其内建标准信号处理（比如 paintEvent 事件，如果不需要父类渲染成**[[QT样式表合集#基本语法特性|尽量原生]]** 的样子，就不需要调用）的一些操作。
```cpp
void Widget::closeEvent(QCloseEvent *event)
{
    QString dlgTitle = "message";
    QString content = "surt to exit?";
    QMessageBox::StandardButton result = QMessageBox::question(this,dlgTitle,content,QMessageBox::Yes|QMessageBox::No|QMessageBox::Cancel);
    if(result == QMessageBox::Yes){
        event->accept();
    }else{
        event->ignore();
    }
}
```
代码中没有 `QApplication::quit()` 或者 `QApplication::closeAllWindows()` 的逻辑，这些都封装在**QCloseEvent 对象的 accept 函数中**。
```cpp
void Widget::mousePressEvent(QMouseEvent *event)
{
    if(event == Qt::LeftButton){
        QPoint pos = event->pos();
        QPointF relaPt = event->position();
        QPointF winPt = event->scenePosition();
        QPointF globPt = event->globalPosition();
        QString str= QString::asprintf("pos()=(%d,%d)", pt.x(),pt.y());
        str= str + QString::asprintf("\nposition()=(%.0f,%.0f)", relaPt.x(),relaPt.y());
        str= str + QString::asprintf("\nscenePosition()=(%.0f,%.0f)", winPt.x(),winPt.y());
        str= str + QString::asprintf("\nglobalPosition()=(%.0f,%.0f)", globPt.x(),globPt.y());
        ui->labMove->setText(str);
        ui->labMove->adjustSize();
        ui->labMove->move(pos);
    }
    QWidget::mousePressEvent(event);
}
```
如果要判断同时按下多个键，可以写成：
```cpp
if ((event->buttons() & Qt::LeftButton)  && (event->buttons() & Qt::RightButton))
```

## 事件与信号
事件通常是由窗口系统或应用程序产生的，信号则是 Qt 定义或用户自定义的。Qt 为界面组件定义的信号通常是对事件的封装
### 窗口属性
和[[#属性系统]]中的属性不一样:
窗口属性使用 `setAttribute()` 设置，作为一种配置属性，用来调整窗口/控件的显示效果，运行逻辑
控件自定义数据 `setProperty()` 用来存储程序运行的用户自定义数据，方便需要用时查询
窗口状态 `setWindowFlag`，窗口状态决定了窗口在屏幕上的显示方式，例如最大化、最小化、全屏等
- `setWindowFlag` 设置窗口标志，**用来定义这个窗口的行为，是否为模态，是否无边框等**

| 枚举值                         | 描述                                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| Qt::Widget                  | 这是 `QWidget` 的默认类型。如果 `QWidget` 有父窗口，则它是子窗口；如果没有父窗口，则它是独立窗口。请参见 `Qt::Window` 和 `Qt::SubWindow`。      |
| Qt::Window                  | 表示该部件是一个窗口，通常带有窗口系统框架和标题栏，无论该部件是否有父窗口。                                                               |
| Qt::Dialog                  | 表示该部件是一个应该作为对话框装饰的窗口（即标题栏中通常没有最大化或最小化按钮）。这是 `QDialog` 的默认类型。                                         |
| Qt::Sheet                   | 表示该窗口是 macOS 上的 sheet。由于使用 sheet 意味着窗口模态，推荐使用 `QWidget::setWindowModality()` 或 `QDialog::open()` 代替。 |
| Qt::DrawerSheet             | 表示该部件是 macOS 上的 drawer。此功能已弃用。设置此标志无效。                                                               |
| Qt::Popup                   | 表示该部件是一个弹出式顶级窗口，即它是模态的，但具有适合弹出菜单的窗口系统框架。                                                             |
| Qt::Tool                    | 表示该部件是一个工具窗口。工具窗口通常是一个带有较小标题栏和装饰的小窗口，通常用于工具按钮集合。                                                     |
| Qt::ToolTip                 | 表示该部件是一个工具提示。此标志用于内部实现工具提示。                                                                          |
| Qt::SplashScreen            | 表示该窗口是一个启动画面。这是 `QSplashScreen` 的默认类型。                                                               |
| Qt::SubWindow               | 表示该部件是一个子窗口，例如 `QMdiSubWindow`。                                                                      |
| Qt::ForeignWindow           | 表示该窗口对象是一个句柄，表示由其他进程或手动使用本地代码创建的本地平台窗口。                                                              |
| Qt::CoverWindow             | 表示该窗口表示一个覆盖窗口，在某些平台上显示应用程序最小化时。                                                                      |
| Qt::WindowModal             | 表示该窗口是模态的，相对于其父窗口模态。用户必须关闭此窗口才能与父窗口交互。                                                               |
| Qt::ApplicationModal        | 表示该窗口是模态的，相对于整个应用程序模态。用户必须关闭此窗口才能与应用程序中的任何窗口交互。                                                      |
| Qt::WindowStaysOnTopHint    | 表示该窗口始终位于其他窗口之上。                                                                                     |
| Qt::FramelessWindowHint     | 表示该窗口没有边框。                                                                                           |
| Qt::CustomizeWindowHint     | 允许自定义窗口的标题栏和边框。通常与 `Qt::FramelessWindowHint` 结合使用。                                                   |
| Qt::BypassWindowManagerHint | 绕过窗口管理器，通常用于特殊用途窗口。                                                                                  |
- `setWindowState` 设置窗口状态，**定义窗口在屏幕上的显示方式，例如最大化、最小化、全屏等**

| 枚举值                  | 描述                     |
| -------------------- | ---------------------- |
| Qt::WindowNoState    | 表示窗口没有处于任何特殊状态（即正常状态）。 |
| Qt::WindowMinimized  | 表示窗口最小化。               |
| Qt::WindowMaximized  | 表示窗口最大化。               |
| Qt::WindowFullScreen | 表示窗口全屏显示。              |
| Qt::WindowActive     | 表示窗口是活动窗口。             |
-  **`setAttribute()`** = 告诉 Qt **如何对待**这个控件，**主要影响窗口的外观和关闭/打开窗口时是否删除对象**，***不可组合***

| 枚举值                              | 设置为 true 时的含义描述              |
| -------------------------------- | ---------------------------- |
| Qt::WA_DeleteOnClose             | 表示当窗口关闭时，自动删除该窗口对象。          |
| Qt::WA_TranslucentBackground     | 表示窗口具有半透明背景。                 |
| Qt::WA_OpaquePaintEvent          | 表示窗口在绘制时不透明。                 |
| Qt::WA_NoSystemBackground        | 表示窗口不使用系统背景。                 |
| Qt::WA_AlwaysStackUnder          | 表示窗口总是位于其他窗口之下。              |
| Qt::WA_AlwaysShowToolTips        | 表示窗口总是显示工具提示。                |
| Qt::WA_SetPalette                | 表示窗口使用自定义调色板。                |
| Qt::WA_SetCursor                 | 表示窗口使用自定义光标。                 |
| Qt::WA_CustomWhatsThis           | 表示窗口具有自定义的“关于此”帮助文本。         |
| Qt::WA_DontShowOnScreen          | 表示窗口不显示在屏幕上。                 |
| Qt::WA_Mapped                    | 表示窗口已经被映射到屏幕上。               |
| Qt::WA_Modal                     | 表示窗口是模态的。                    |
| Qt::WA_KeyboardFocusChange       | 表示窗口在获得或失去键盘焦点时发出信号。         |
| Qt::WA_InputMethodEnabled        | 表示窗口启用输入法。                   |
| Qt::WA_KeyCompression            | 表示窗口压缩按键事件。                  |
| Qt::WA_Hover                     | 表示窗口接收悬停事件。                  |
| Qt::WA_NoMouseReplay             | 表示窗口不重放鼠标事件。                 |
| Qt::WA_TransparentForInput       | 表示窗口对输入事件透明。                 |
| Qt::WA_SetWindowIcon             | 表示窗口使用自定义窗口图标。               |
| Qt::WA_SetStyle                  | 表示窗口使用自定义样式。                 |
| Qt::WA_SetFont                   | 表示窗口使用自定义字体。                 |
| Qt::WA_UnderMouse                | 表示窗口当前位于鼠标下方。                |
| Qt::WA_MouseTracking             | 表示窗口启用鼠标跟踪事件。                |
| Qt::WA_QuitOnClose               | 表示当窗口关闭时，退出应用程序。             |
| Qt::WA_PaintOnScreen             | 表示窗口在屏幕上直接绘制。                |
| Qt::WA_RightToLeft               | 表示窗口从右到左排列。                  |
| Qt::WA_SetLayoutDirection        | 表示窗口设置布局方向。                  |
| Qt::WA_NoBackground              | 表示窗口没有背景。                    |
| Qt::WA_NoMousePropagation        | 表示窗口不传播鼠标事件。                 |
| Qt::WA_HideOnHideParent          | 表示当父窗口隐藏时，窗口也隐藏。             |
| Qt::WA_NoChildEventsForParent    | 表示窗口不为父窗口发送事件。               |
| Qt::WA_LockLandscapeOrientation  | 表示窗口锁定横向方向。                  |
| Qt::WA_LockPortraitOrientation   | 表示窗口锁定纵向方向。                  |
| Qt::WA_MacOpaqueSizeGrip         | 表示窗口使用不透明的大小调整手柄。            |
| Qt::WA_MacAlwaysShowScrollBars   | 表示窗口始终显示滚动条。                 |
| Qt::WA_QuitOnClose               | 表示当窗口关闭时，退出应用程序。             |
| Qt::WA_StyledBackground          | 表示窗口使用样式化的背景。                |
| Qt::WA_AttributeCount            | 表示属性的数量。                     |

-  **`setProperty()`** = 告诉程序 **这个控件有什么**数据，用于提高维护，可读性
- `setWindowOpacity()` 窗口透明度

在一些对象中，设置了窗口属性之后才会有对应的事件发生，比如 `this->setAttribute(Qt::WA_Hover,true)` 设置之后，鼠标移入一个控件之后会触发 `QEvent::HoverEnter` 的事件

| 函数名              | 作用                                      | 特性                          | 是否可以组合 |
| ---------------- | --------------------------------------- | --------------------------- | ------ |
| `setWindowFlag`  | 设置或清除窗口标志（window flags），定义窗口的行为和外观。     | 影响窗口的显示方式、模态性、边框等。          | 是      |
| `setAttribute`   | 设置或清除窗口属性（window attributes），控制窗口的各种特性。 | 影响窗口的行为、事件处理等。              | 否      |
| `setWindowState` | 设置窗口的状态（window states），控制窗口在屏幕上的显示方式。   | 影响窗口的显示方式（如最大化、最小化、全屏等）。    | 是      |
| `setProperty`    | 设置窗口的自定义属性，可以存储任意类型的值。                  | 用于存储和检索自定义数据，不直接影响窗口的行为或外观。 | 否      |

=======
和[[#属性系统]]中的属性不一样，窗口属性使用 `setAttribute()` 设置，作为一种配置属性，用来调整窗口/控件的显示效果，运行逻辑。而 `setProperty()` 用来存储程序运行的用户自定义数据，方便需要用时查询。
- ✅ **`setAttribute()`** = 告诉 Qt **如何对待**这个控件
- ✅ **`setProperty()`** = 告诉程序 **这个控件有什么**数据

| 特性       | `setAttribute()` | `setProperty()` |
| -------- | ---------------- | --------------- |
| **作用对象** | QWidget 及其子类     | QObject 及其所有子类  |
| **属性类型** | 预定义的窗口属性         | 自定义的动态属性        |
| **用途**   | 控制窗口行为/外观        | 存储任意自定义数据       |
| **性能**   | 直接影响窗口系统         | 轻量级数据存储         |
在一些对象中，设置了窗口属性之后才会有对应的事件发生，比如 `this->setAttribute(Qt::WA_Hover,true)` 设置之后，鼠标移入一个控件之后会触发 `QEvent::HoverEnter` 的事件
## 事件过滤器
### 事件过滤器工作原理
可以将一个对象的事件委托给另一个对象来监视并处理，方法为：
1. 被监视对象使用函数 `installEventFilter()` 将自己注册给监视对象，监视对象就是事件过滤器。
2. 监视对象重新实现函数 `eventFilter()`（一般在 protect 中），对监视到的事件进行处理
[[#典型事件处理|上一个例子中]]，如果要管理一个控件中的类事件，就需要**创建一个新类并且继承与这个控件的父类**，然后在这个类中定义各种 event 处理函数（都应该放在 protect 中，因为他们是 qt 回调，不需要被手动调用）。

`eventFilter` 是 Qt 框架**回调**你的代码，而不是你**主动调用**的代码。因此它应该被保护（protect 修饰）起来，只对框架和子类可见，子类可以通过通过最后的 return 语句委托父类处理**不是子类特化处理的事件**
事件过滤器的调用链（**是一条可以拦截的链，不是后者覆盖前者的链**）：
```md
事件发生
    ↓
目标对象的 event() 方法
    ↓
遍历所有安装的过滤器 → 调用 filter1->eventFilter()
    ↓                      调用 filter2->eventFilter()  
    ↓                      ...
目标对象的事件处理方法（如 mousePressEvent）
```

### 事件过滤器编程实例
```cpp
// widget.h
class Widget : public QWidget
{
    Q_OBJECT

public:
    Widget(QWidget *parent = nullptr);
    ~Widget();

private:
    Ui::Widget *ui;

protected:
    bool eventFilter(QObject *watched, QEvent *event);
};
// widget.cpp
Widget::Widget(QWidget *parent)
    : QWidget(parent)
    , ui(new Ui::Widget)
{
    ui->setupUi(this);
    ui->labHover->installEventFilter(this);
    ui->labDBClick->installEventFilter(this);
}

Widget::~Widget()
{
    delete ui;
}

bool Widget::eventFilter(QObject *watched, QEvent *event)
{
    if(watched == ui->labHover){
        if(event->type() == QEvent::Enter){
            ui->labHover->setStyleSheet("background-color:rgb(170,255,255);");
        }else if(event->type() == QEvent::Leave){
            ui->labHover->setStyleSheet("");
            ui->labHover->setText("close and click");
        }else if (event->type()== QEvent::MouseButtonPress){
            ui->labHover->setText("button pressed");
        }else if (event->type()== QEvent::MouseButtonRelease){
            ui->labHover->setText("button released");
        }
    }
    if (watched == ui->labDBClick) {
        if (event->type() == QEvent::Enter)  // 鼠标光标移入
            ui->labDBClick->setStyleSheet("background-color: rgb(85, 255, 127);");
        else if (event->type() == QEvent::Leave) {
            ui->labDBClick->setStyleSheet("");
            ui->labDBClick->setText("可双击的标签");

        } else if (event->type() == QEvent::MouseButtonDblClick)  // 鼠标双击
            ui->labDBClick->setText("double clicked");
    }
    return QWidget::eventFilter(watched, event);  // 运行父类的eventFilter()函数
    // return true;     // 如果直接返回true会导致除了上面的事件都传播不到父类，连文字渲染不处理，
}
```
- 一个监视类对象filter（**任何 QObject 子类**都可以作为事件过滤器），专门用来处理其他对象发出的的事件，处理逻辑写在这个类的eventFilter函数中，当被监视对象发生事件时，这个函数就会被qt自动调用，并将被监视对象（watched参数）和被监视对象发生的事件（event参数）传入这个函数中，函数根据这两个参数来执行对应的事件处理逻辑。
- 不在监视类对象处理逻辑范围内的事件通常会被 `return 父类::eventFilter(watched, event)` 这样代码交给父类来处理，这个监视器只会过滤他职责范围内的事件。
- 监视类对象如果 `return true` 表示事件拦截，不会继续传递，如果 false 表示不处理，会传递给其他过滤器（包括父类过滤器）处理。**一旦某个过滤器返回 true，事件传递就终止了**，**父类过滤器只有在子类过滤器返回 false 时才会被调用**
- 需要被监视的控件通过`installEventFilter()`安装某个监视类对象实例指针，这个类发生的事件就会交给这个对象接管。
## 拖放事件与拖放操作
### 拖放操作相关事件
- 启动拖动操作需要一个 QDrag 对象描述拖动操作
- 一个 QMimeData 类的对象
- QWidget 类属性 acceptDrops如果设置为 true，这个属性**不是窗口属性而是控件属性**，所以使用 `setAcceptDrop(true)` 即可设置， 对应的这个组件就可以作为一个放置点。默认为 false。
- QWidget 类中没有定义拖动操作相关的函数，所以一般的界面组件是不能作为拖动点的，而 `QAbstractItem` 可以
### MIME 文件信息
一张图片 MIME 信息
```md
dragEnterEvent事件 mimeData()->formats()
application/x-qt-windows-mime;value="Shell IDList Array"
application/x-qt-windows-mime;value="UsingDefaultDragImage"
application/x-qt-windows-mime;value="DragImageBits"
application/x-qt-windows-mime;value="DragContext"
application/x-qt-windows-mime;value="DragSourceHelperFlags"
application/x-qt-windows-mime;value="InShellDragLoop"
text/uri-list
application/x-qt-windows-mime;value="FileName"
application/x-qt-windows-mime;value="FileContents"
application/x-qt-windows-mime;value="FileNameW"
application/x-qt-windows-mime;value="FileGroupDescriptorW"
application/x-qt-windows-mime;value="IsShowingLayered"
application/x-qt-windows-mime;value="DragWindow"
application/x-qt-windows-mime;value="IsComputingImage"
application/x-qt-windows-mime;value="IsShowingText"
application/x-qt-windows-mime;value="ComputedDragImage"
application/x-qt-windows-mime;value="DropDescription"
application/x-qt-windows-mime;value="DisableDragText"
application/x-qt-windows-mime;value="Preferred DropEffect"

 dragEnterEvent事件 mimeData()->urls()
/E:/file_storage/Files/Pictures/Arts/under pressure--jazznuf.jpg
```
> [!note]
> - application/x-qt-windows-mime; value="Shell IDList Array"
> 用途：用于 Windows Shell 的拖放操作，表示拖放的数据是一个文件或文件夹的标识列表。
> 常见于：Windows 操作系统中的拖放操作，特别是在资源管理器中拖放文件或文件夹。
> - application/x-qt-windows-mime; value="UsingDefaultDragImage"
> 用途：指示是否使用默认的拖放图像。
> 常见于：Windows 的拖放操作中，用于确定拖动时显示的图像。
> - application/x-qt-windows-mime; value="DragImageBits"
> 用途：包含拖动图像的位图数据。
> 常见于：Windows 的拖放操作中，用于显示拖动时的图像。
> - application/x-qt-windows-mime; value="DragContext"
> 用途：包含拖动上下文的信息。
> 常见于：Windows 的拖放操作中，用于管理拖动过程中的上下文数据。
> - application/x-qt-windows-mime; value="DragSourceHelperFlags"
> 用途：包含拖动源的帮助标志。
> 常见于：Windows 的拖放操作中，用于指示拖动源的行为特性。
> - application/x-qt-windows-mime; value="InShellDragLoop"
> 用途：指示当前是否在 Shell 的拖动循环中。
> 常见于：Windows 的拖放操作中，用于管理拖动状态。
> - application/x-qt-windows-mime; value="DragWindow"
> 用途：包含拖动操作的窗口句柄。
> 常见于：Windows 的拖放操作中，用于关联拖动操作与特定窗口。
> - application/x-qt-windows-mime; value="IsComputingImage"
> 用途：指示是否正在计算拖动图像。
> 常见于：Windows 的拖放操作中，用于管理拖动图像的生成过程。
> - application/x-qt-windows-mime; value="IsShowingText"
> 用途：指示拖动图像是否显示文本。
> 常见于：Windows 的拖放操作中，用于控制拖动图像的显示内容。
> - application/x-qt-windows-mime; value="ComputedDragImage"
> 用途：包含已计算的拖动图像数据。
> 常见于：Windows 的拖放操作中，用于优化拖动图像的显示。
> - application/x-qt-windows-mime; value="DropDescription"
> 用途：包含拖放操作的描述信息。
> 常见于：Windows 的拖放操作中，用于提供拖放操作的详细信息。
> - application/x-qt-windows-mime; value="DisableDragText"
> 用途：指示是否禁用拖动文本。
> 常见于：Windows 的拖放操作中，用于控制拖动文本的显示。
> - application/x-qt-windows-mime; value="Preferred DropEffect"
> 用途：指示首选的拖放效果（如复制、移动等）。
> 常见于：Windows 的拖放操作中，用于确定拖放操作的具体行为。
> text/uri-list
> 用途：包含拖放的文件或 URL 列表，每行一个 URI。
> 常见于：跨平台拖放操作中，用于表示拖放的文件路径。
> - application/x-qt-windows-mime; value="FileName"
> 用途：包含拖放文件的短文件名（ANSI 编码）。
> 常见于：Windows 的拖放操作中，用于提供文件名信息。
> - application/x-qt-windows-mime; value="FileContents"
> 用途：包含拖放文件的实际内容。
> 常见于：Windows 的拖放操作中，用于传输文件数据。
> - application/x-qt-windows-mime; value="FileNameW"
> 用途：包含拖放文件的宽字符文件名（Unicode 编码）。
> 常见于：Windows 的拖放操作中，用于提供文件名信息。
> - application/x-qt-windows-mime; value="FileGroupDescriptorW"
> 用途：包含拖放文件的描述信息（宽字符编码）。
> 常见于：Windows 的拖放操作中，用于提供文件的详细描述信息。
> - application/x-qt-windows-mime; value="IsShowingLayered"
> 用途：指示拖动图像是否为层叠图像。
> 常见于：Windows 的拖放操作中，用于控制拖动图像的显示方式。

`mimeData()->formats()` 返回的是所有可用的 MIME 类型格式的列表，而不是具体的文件内容信息（如文件位置、像素大小、文件格式等）。这些格式描述了数据的类型和结构，而不是实际的数据内容。
`format()` 返回的行都是对象名，而不是真实的 MIME 数据，只有使用对应的解包之后才能获取文件的信息
### 外部文件拖放操作示例
```cpp
// widget.h
class Widget : public QWidget
{
    Q_OBJECT

public:
    Widget(QWidget *parent = nullptr);
    ~Widget();

protected:
    void dragEnterEvent(QDragEnterEvent* event);
    void resizeEvent(QResizeEvent* event);
    void dropEvent(QDropEvent* event);

private:
    Ui::Widget *ui;
};
// widget.cpp
Widget::Widget(QWidget *parent)
    : QWidget(parent)
    , ui(new Ui::Widget)
{
    ui->setupUi(this);
    ui->labPic->setScaledContents(true);
    this->setAcceptDrops(true);
    ui->plainTextEdit->setAcceptDrops(true);
    ui->labPic->setAcceptDrops(false);
}

Widget::~Widget()
{
    delete ui;
}

void Widget::dragEnterEvent(QDragEnterEvent *event)
{
    ui->plainTextEdit->clear();
    ui->plainTextEdit->appendPlainText("dragEnterEvent事件 mimeData()->formats()");
    for(int i = 0; i< event->mimeData()->formats().size(); i++){
        ui->plainTextEdit->appendPlainText(event->mimeData()->formats().at(i));
    }
    ui->plainTextEdit->appendPlainText("\n dragEnterEvent事件 mimeData()->urls()");
    for(int i = 0;i<event->mimeData()->urls().size(); i++){
        QUrl url = event->mimeData()->urls().at(i);
        ui->plainTextEdit->appendPlainText(url.path());
    }
    if (event->mimeData()->hasUrls()) {
        QString filename = event->mimeData()->urls().at(0).fileName();
        QFileInfo fileInfo(filename);
        QString ext = fileInfo.suffix().toUpper();
        if (ext == "JPG")
            event->acceptProposedAction();
        else
            event->ignore();
    } else
        event->ignore();
}

void Widget::resizeEvent(QResizeEvent *event)
{
    QSize size = ui->plainTextEdit->size();
    ui->plainTextEdit->resize(this->width() - 10, size.height());
    ui->labPic->resize(this->width() - 10, this->height() - size.height() - 20);
    event->accept();
}

void Widget::dropEvent(QDropEvent *event)
{
    QString filename = event->mimeData()->urls().at(0).path();
    filename = filename.right(filename.length() - 1); // Windows平台上，返回的字符串filename的开头有一个额外的“/”
    QPixmap pixmap(filename);
    ui->labPic->setPixmap(pixmap);
    event->accept();
}
```
## 具有拖放操作功能的组件

### 示例窗口类定义和初始化
QLineEdit、QAbstractItemView、QStandardItem 等类都有一个函数 setDragEnabled (bool)，当设置参数为 true 时，组件就可以作为一个拖动点。QAbstractItemView 类定义了拖放操作相关的各种函数
```cpp
Widget::Widget(QWidget *parent)
    : QWidget(parent)
    , ui(new Ui::Widget)
{
    ui->setupUi(this);
    // 安装事件过滤器，由窗口处理4个项数据组件的事件
    ui->listSource->installEventFilter(this);
	// ...
    //设置4个项数据组件的拖放操作相关属性
    ui->listSource->setAcceptDrops(true);
    ui->listSource->setDragDropMode(QAbstractItemView::DragDrop);
    ui->listSource->setDragEnabled(true);
    ui->listSource->setDefaultDropAction(Qt::CopyAction);
	// ...
}
```
1. **接受拖放操作 (`setAcceptDrops(true)`)**:
    - **效果**: 控件可以接受外部或内部的拖放操作。
    - **用途**: 允许用户将数据（如文件、文本等）拖放到该控件中。
2. **设置拖放模式 (`setDragDropMode(QAbstractItemView::DragDrop)`)**:
    - **效果**: 控件支持拖放操作，并且可以在内部重新排列项目。
    - **用途**: 用户可以从外部拖放数据到控件中，并且可以在控件内部重新排列项目。
    - **模式**:
        - `QAbstractItemView::DragOnly`: 仅支持拖动操作。
        - `QAbstractItemView::DropOnly`: 仅支持接收拖放操作。
        - `QAbstractItemView::DragDrop`: 同时支持拖动和接收拖放操作。
        - `QAbstractItemView::InternalMove`: 仅支持在控件内部重新排列项目。
3. **启用拖动操作 (`setDragEnabled(true)`)**:
    - **效果**: 控件中的项目可以被拖动到其他位置或控件。
    - **用途**: 允许用户拖动控件中的项目到同一控件或其他控件中。
4. **设置默认的放置动作 (`setDefaultDropAction(Qt::CopyAction)`)**:
    - **效果**: 当用户执行拖放操作时，默认使用复制操作。
    - **用途**: 确保拖放操作默认行为是复制数据，而不是移动数据。
    - **可选值**:
        - `Qt::CopyAction`: 复制数据。
        - `Qt::MoveAction`: 移动数据。
        - `Qt::LinkAction`: 创建链接。
        - `Qt::TargetMoveAction`: 目标控件负责移动数据。
        - `Qt::IgnoreAction`: 忽略操作。
代码设计比较简单，主要是初始化这几项设置和 eventFilter 过滤器
```cpp
bool Widget::eventFilter(QObject *watched, QEvent *event)
{
    if (event->type() != QEvent::KeyPress)  // 不是KeyPress事件，退出
        return QWidget::eventFilter(watched, event);
    QKeyEvent* keyEvent = static_cast<QKeyEvent*>(event);
    if (keyEvent->key() != Qt::Key_Delete) // 按下的不是Delete键，退出
        return QWidget::eventFilter(watched, event);
    if (watched == ui->listSource) {
        QListWidgetItem* item = ui->listSource->takeItem(ui->listSource->currentRow());
        delete item;
    } else if (watched == ui->listWidget) {
        QListWidgetItem* item = ui->listWidget->takeItem(ui->listWidget->currentRow());
        delete item;
    } else if (watched == ui->treeWidget) {
        QTreeWidgetItem* curItem = ui->treeWidget->currentItem();
        if (curItem->parent() != nullptr){
            QTreeWidgetItem* parItem = curItem->parent();
            parItem->removeChild(curItem);
        }
        else{
            int index = ui->treeWidget->indexOfTopLevelItem(curItem);
            ui->treeWidget->takeTopLevelItem(index);
        }
        delete curItem;
    } else if (watched == ui->tableWidget) {
        QTableWidgetItem* item = ui->tableWidget->takeItem(
            ui->tableWidget->currentRow(),
            ui->tableWidget->currentColumn());
        delete item;
    }
    return true;
    // 表示事件已经被处理
}
```
# 对话框和多窗口程序设计
## 标准对话框
内置对话框

| 对话框类                    | 主要静态函数                           | 函数功能                             |
| ----------------------- | -------------------------------- | -------------------------------- |
| **QFileDialog**         | `QString getOpenFileName()`      | 选择打开一个文件，返回选择文件的文件名              |
|                         | `QStringList getOpenFileNames()` | 选择打开多个文件，返回选择的所有文件的文件名列表         |
|                         | `QString getSaveFileName()`      | 选择保存一个文件，返回保存文件的文件名              |
|                         | `QString getExistingDirectory()` | 选择一个已有的目录，返回所选目录的完整路径            |
|                         | `QUrl getOpenFileUrl()`          | 选择打开一个文件，可选择打开远程网络文件             |
|                         | `void saveFileContent()`         | 将一个 QByteArray 类型的字节数据数组的内容保存为文件 |
| **QColorDialog**        | `QColor getColor()`              | 显示选择颜色对话框用于选择颜色，返回值是选择的颜色        |
| **QFontDialog**         | `QFont getFont()`                | 显示选择字体对话框，返回值是选择的字体              |
| **QProgressDialog**     | —                                | 显示进度变化的对话框，没有静态函数                |
| **QInputDialog**        | `QString getText()`              | 显示标准输入对话框，输入单行文字                 |
|                         | `int getInt()`                   | 显示标准输入对话框，输入整数                   |
|                         | `double getDouble()`             | 显示标准输入对话框，输入浮点数                  |
|                         | `QString getItem()`              | 显示标准输入对话框，从一个下拉列表框中选择输入          |
|                         | `QString getMultiLineText()`     | 显示标准输入对话框，输入多行字符串                |
| **QMessageBox**         | `StandardButton information()`   | 显示信息提示对话框                        |
|                         | `StandardButton question()`      | 显示询问并获取是否确认的对话框                  |
|                         | `StandardButton warning()`       | 显示警告信息提示对话框                      |
|                         | `StandardButton critical()`      | 显示错误信息提示对话框                      |
|                         | `void about()`                   | 显示设置自定义信息的关于对话框                  |
|                         | `void aboutQt()`                 | 显示关于 Qt 的对话框                     |
| **QPrintDialog**        | —                                | 打印机设置对话框，没有静态函数                  |
| **QPrintPreviewDialog** | —                                | 打印预览对话框，没有静态函数                   |
### 标准对话框预览
选择颜色窗口
![[PixPin_2025-11-20_20-53-58.png]]
字体选择窗口
![[PixPin_2025-11-20_20-54-22.png]]
输入窗口
![[PixPin_2025-11-20_21-38-57.png]]
### Qt 内置对话框翻译
qt 内置的标准对话框**是可翻译的**，如果需要设置其中的语言，需要加载对应的语言包文件
```cpp
#include <QApplication>
#include <QTranslator>
#include <QFontDialog>
#include <QMessageBox>

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    // 创建一个 QTranslator 对象
    QTranslator customTranslator;

    // 加载自定义的翻译文件
    if (customTranslator.load("custom_dialogs_zh_CN", ":/translations")) {
        app.installTranslator(&customTranslator);
    } else {
        QMessageBox::warning(nullptr, "警告", "无法加载自定义翻译文件");
    }

    // 创建另一个 QTranslator 对象
    QTranslator qtTranslator;

    // 加载 Qt 内置的翻译文件
    if (qtTranslator.load("qtw_zh_CN", ":/qtbase_translations")) {
        app.installTranslator(&qtTranslator);
    } else {
        QMessageBox::warning(nullptr, "警告", "无法加载 Qt 内置翻译文件");
    }

    // 显示 QFontDialog
    bool ok;
    QFont font = QFontDialog::getFont(&ok);
    if (ok) {
        // 用户选择了字体
        QMessageBox::information(nullptr, "选择的字体", font.toString());
    } else {
        // 用户取消了选择
        QMessageBox::information(nullptr, "取消", "未选择字体");
    }

    return app.exec();
}
```
### Qt 自定义翻译
1. 在源代码中使用 `tr()` 或者 `QObject::tr()` 标记一个字符串是**可翻译的**
2. 调用 `lupdate myapp.pro` 让 lupdate 提取源码中的所有可翻译字符串，生成一个 `.ts` 文件
3. 用 Qt Linguist 打开 ts 文件，手动调整翻译内容
4. 使用 lrelease 工具将 ts 编译为**二进制**`.qm` 文件，`lrelease myapp_en.ts -qm myapp_en.qm`
5. 在程序启动时加载翻译
```cpp
if (translator.load("myapp_zh_CN", ":/translations")) {
    app.installTranslator(&translator);
} else {
    QMessageBox::warning(nullptr, "警告", "无法加载翻译文件");
}
```
翻译文件在 `C:\Qt\<version>\<compiler>\translations`，可以在官网下载
如果想要让一个应用中不同的Widget控件显示不同的语言，一般的做法是：
- 为每个部分创建不同的翻译文件（例如 `qtw_en_US.qm` 和 `qtw_zh_CN.qm`）。
- 加载这些翻译文件到不同的 `QTranslator` 实例中。
- 在需要显示不同语言时，先 `installTranslator`，然后对不同的控件选择性调用 `update` 函数即可实现选择性翻译，一般不会使用多个 `QApplication` 实例在一个应用里。
```cpp
class LanguageManager : public QObject
{
    Q_OBJECT
public:
    static void setLanguage(const QString& languageCode) {
        QApplication::removeTranslator(&translator);
        
        if (languageCode == "zh_CN") {
            translator.load(":/translations/zh_CN.qm");
        } else if (languageCode == "en_US") {
            translator.load(":/translations/en_US.qm");
        }
        // 可以加载多个翻译文件
        QApplication::installTranslator(&translator);
        
        // 通知所有窗口更新
        for (QWidget* widget : QApplication::allWidgets()) {
            widget->update();
        }
    }
    
private:
    static QTranslator translator;
};
```
## 设计和使用自定义对话框
### 什么是模态对话框
模态对话框是一种用户界面元素，当它出现时，它会阻止用户与父窗口或其他窗口进行交互，直到该对话框被关闭。换句话说，用户必须首先处理模态对话框中的任务
一个对话框的模态属性可以通过下面方式访问或者设置
```cpp
Qt::WindowModality windowModality() const;
void setWindowModality(Qt::WindowModality windowModality)
```
- **`Qt::WindowModal`**：表示对话框是相对于其父窗口模态的。当这个对话框打开时，用户不能与父窗口进行交互，但可以与应用程序中的其他顶级窗口进行交互。
- **`Qt::ApplicationModal`**：表示对话框是相对于整个应用程序模态的。当这个对话框打开时，用户不能与应用程序中的任何其他窗口进行交互，直到这个对话框被关闭。
- **`Qt::NonModal`**（默认值）：表示对话框是非模态的。用户可以与父窗口和其他窗口进行交互，即使对话框是打开的。
使用函 `QWidget::show()` 数显示一个对话框时，根据modal属性的值，对话框会以模态或非模态方式显示。***函数`show()`没有返回值，但是一些询问对话框，调用其 `exec()` 是模态形式的，并且有返回值表示询问/操作结果***
如果子窗口需要读取父窗口的大量数据时，一般会使用 `exec()` 来创建子对话框，这种形式**只会创建一次以模形式行时显示的对话框**，子对话框关闭之后并没有被删除，只是被隐藏了（**会一直占用内存**）
### QDialog 类
一般有**接受，取消**两个按键，分别对应 `accept`，`reject`。对话框询问完毕之后会发送 `QDialog::Accepted` 或者 `QDialog::Rejected` 信号，被 done 槽函数接受

> [!note]
>  `void QDialog::done(int r)`
>  Closes the dialog and sets its result code to r. The finished() signal will emit r; if r is QDialog:: Accepted or QDialog:: Rejected, the accepted() or the rejected() signals will also be emitted, respectively

#### 对话框窗口属性
如果不需要获取对话框的返回值（accept，reject 或者其他用户选择结果），那么可以使用
```cpp
setAttribute(Qt::WA_DeleteOnClose);
```
设置一旦对话框关闭，对话框对象立即被删除，否则窗口会**一直占用内存**，解决方法是将这个窗口的 `close` 信号关联到 `deleteLater` 槽，或者手动删除对应窗口对象的指针。
如果是频繁需要打开关闭同一个对话框的情景下可以不设置自动关闭，让其一直占用内存，调用时用一个 if 防止重复创建
```cpp
void do_something(){
	if(this->dialog == nullptr) {this->dialog = new QDialog(this);}
	else{ /* ... */}
}`
```
#### 对话框窗口标志
**默认继承自 QDialog 的窗口右上角只会有关闭按钮，如果想要最小化合最大化窗口，需要 `setWindoeFlags(Qt::Window)`**`
`QDialog`（以及 `QWidget` 及其子类）中的 `setWindowFlag` 方法用于设置窗口标志（window flags），这些标志定义了窗口的各种属性和行为。窗口标志是 `Qt::WindowType` 枚举类型的一部分，可通过[[CodeLineCounter#位掩码设计开关|位掩码]]组合
窗口标志一般使用场景在：[[#什么是模态对话框||模态对话框]]，无边框窗口，窗口置顶行为等场景中

| 常量                  | 值          | 描述                                                                                                                                                                                                                                                                       |
| ------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Qt::Widget`        | 0x00000000 | 这是 `QWidget` 的默认类型。如果 `QWidget` 有父窗口，则它是子窗口；如果没有父窗口，则它是独立窗口。请参见 `Qt::Window` 和 `Qt::SubWindow`。                                                                                                                                                                          |
| `Qt::Window`        | 0x00000001 | 表示该部件是一个窗口，通常带有窗口系统框架和标题栏，无论该部件是否有父窗口。请注意，如果部件没有父窗口，则无法清除此标志。                                                                                                                                                                                                            |
| `Qt::Dialog`        | 0x00000002 | 表示该部件是一个应该作为对话框装饰的窗口（即标题栏中通常没有最大化或最小化按钮）。这是 `QDialog` 的默认类型。如果希望将其用作模态对话框，则应从另一个窗口启动，或具有父窗口并使用 `QWidget::windowModality` 属性。如果设置为模态，对话框将阻止应用程序中的其他顶级窗口获取输入。在 Qt 中，具有父窗口的顶级窗口称为次级窗口。                                                                                      |
| `Qt::Sheet`         | 0x00000004 | 表示该窗口是 macOS 上的 sheet。由于使用 sheet 意味着窗口模态，推荐使用 `QWidget::setWindowModality()` 或 `QDialog::open()` 代替。                                                                                                                                                                     |
| `Qt::DrawerSheet`   | Dialog     | 表示该部件是 macOS 上的 drawer。此功能已弃用。设置此标志无效。                                                                                                                                                                                                                                   |
| `Qt::Popup`         | 0x00000008 | 表示该部件是一个弹出式顶级窗口，即它是模态的，但具有适合弹出菜单的窗口系统框架。                                                                                                                                                                                                                                 |
| `Qt::Tool`          | Dialog     | 表示该部件是一个工具窗口。工具窗口通常是一个带有较小标题栏和装饰的小窗口，通常用于工具按钮集合。如果有父窗口，工具窗口将始终保持在其上方。如果没有父窗口，可以考虑使用 `Qt::WindowStaysOnTopHint`。如果窗口系统支持，工具窗口可以用更轻的框架装饰。在 macOS 上，工具窗口对应于 `NSPanel` 类的窗口，这意味着该窗口位于正常窗口之上，无法将正常窗口置于其之上。默认情况下，工具窗口在应用程序不活动时会消失，这可以通过 `Qt::WA_MacAlwaysShowToolWindow` 属性控制。 |
| `Qt::ToolTip`       | Sheet      | 表示该部件是一个工具提示。此标志用于内部实现工具提示。                                                                                                                                                                                                                                              |
| `Qt::SplashScreen`  | Dialog     | 表示该窗口是一个启动画面。这是 `QSplashScreen` 的默认类型。                                                                                                                                                                                                                                   |
| `Qt::SubWindow`     | 0x00000012 | 表示该部件是一个子窗口，例如 `QMdiSubWindow`。                                                                                                                                                                                                                                          |
| `Qt::ForeignWindow` | 0x00000020 | 表示该窗口对象是一个句柄，表示由其他进程或手动使用本地代码创建的本地平台窗口。                                                                                                                                                                                                                                  |
| `Qt::CoverWindow`   | 0x00000040 | 表示该窗口表示一个覆盖窗口，在某些平台上显示应用程序最小化时。                                                                                                                                                                                                                                          |

## 多窗口应用程序设计
### 窗口类重要特性的设置
QSplashScreen 和 QMdiSubWindow。QSplashScreen 同样继承自 QWidget 并作为窗口类，可以通过[[#窗口属性|一系列设置函数]] 调整窗口的属性，行为。
### 多窗口设计代码
设置独立的窗口
```cpp
void MainWindow::on_actWidget_triggered()
{
    TFormDoc* formDoc = new TFormDoc(this);
    formDoc->setAttribute(Qt::WA_DeleteOnClose);
    formDoc->setWindowTitle("based on QWidget window no parent, delete on close");
    formDoc->setWindowFlag(Qt::Window, true);

    formDoc->setWindowFlag(Qt::CustomizeWindowHint,true);
    formDoc->setWindowFlag(Qt::WindowMinMaxButtonsHint,true);
    formDoc->setWindowFlag(Qt::WindowCloseButtonHint,true);
    formDoc->setWindowFlag(Qt::WindowStaysOnTopHint,true);

    formDoc->setWindowOpacity(0.9);
    formDoc->show();
}
```
- **`Qt::CustomizeWindowHint`**：移除窗口管理系统提供的默认装饰（如标题栏、边框等），允许你自定义窗口的外观。
	- 窗口将没有默认的标题栏和边框。
	- 你需要自己实现标题栏、最小化、最大化和关闭按钮等控件。
- **`Qt::WindowMinMaxButtonsHint`**：在自定义窗口中添加最小化和最大化按钮。
	- 如果 `Qt::CustomizeWindowHint` 被设置，这个标志会确保窗口具有最小化和最大化按钮。
	- 注意：如果 `Qt::CustomizeWindowHint` 没有被设置，这个标志不会生效。
- **`Qt::WindowCloseButtonHint`**：在自定义窗口中添加关闭按钮。
	- 如果 `Qt::CustomizeWindowHint` 被设置，这个标志会确保窗口具有关闭按钮。
	- 注意：如果 `Qt::CustomizeWindowHint` 没有被设置，这个标志不会生效。
- **`Qt::WindowStaysOnTopHint`**：使窗口始终保持在其他窗口之上。
	- 窗口将始终位于其他窗口的最前面，不会被其他窗口遮挡。
	- 这通常用于工具窗口或需要始终可见的窗口。
### Qt 多窗口事件循环机制
设置独立窗口
- **`setWindowFlag(Qt::Window, true)`**：
- 设置窗口标志 `Qt::Window` 为 `true`，表示该部件是一个独立的窗口。
- 这意味着无论该部件是否有父窗口，它都会作为一个顶级窗口显示，具有窗口系统框架和标题栏，会在任务栏显示独立的图标。
- 如果希望一个部件成为一个子窗口（例如，`QMdiSubWindow` 中的一个子窗口），**应该指定父窗口**，如果设置了父窗口，就不会作为一个顶层窗口出现，任务栏中不出现
![[Pasted image 20251128170759.png]]
![[Pasted image 20251128170805.png]]
顶层窗口事件循环
- `QApplication` 的事件循环依赖于顶级窗口的存在，没有父窗口的窗口被称为顶级窗口。只要有至少一个顶级窗口存在，事件循环就会继续运行。
- 如果窗口设置了 `Qt::WA_DeleteOnClose` 属性，窗口对象会在关闭后被自动删除。没有设置那么他还会存在在内存中，**如果再次调用 `show` 还是会出现**，删除了那么对象都不存在，更没有 `show` 函数
- 没有顶层窗口（删除，不是隐藏）后事件循环结束后会调用 `QApplication::quit` 槽函数关闭。
其他比较简单

## MDI 应用程序设计
MDI 应用程序有一个主窗口和任意多个子窗口，当在 MDI 应用程序里打开了多个子窗口时，获得输入焦点的子窗口是活动的（active）子窗口。子窗口一般共享（**但也可以独立设置**）主窗口上的工具栏和菜单，主窗口上的操作一般是针对当前的活动子窗口
![[PixPin_2025-11-28_18-06-47.png]]
子窗口就像 vc++6.0 的交互逻辑，但现代软件一般采用多页模式，MDI 应用程序的设计主要是对 QMdiArea 和 QMdiSubWindow 类的使用
### QMdiArea 类
QMdiArea 显示子窗口有两种模式：子窗口模式和多页模式。通过下面函数设置
```cpp
void  QMdiArea::setViewMode(QMdiArea::ViewMode mode)
```
这个类用来存储子窗口，操作类下的子窗口可以通过
```cpp
QMdiSubWindow  *QMdiArea::activeSubWindow(); // 当前活动窗口
void  QMdiArea::removeSubWindow(QWidget *widget); // 删除窗口
QList<QMdiSubWindow *> QMdiArea::subWindowList(QMdiArea::WindowOrder order= CreationOrder); // 所有子窗口列表
```
每一个 QMdiArea 对象需要通过 `widget()` 成员函数才能转化为 QWidget 对象进行操作
QMdiArea 管理的子窗口实际上是 QMdiSubWindow 窗口，QMdiSubWindow 的内部组件才是用户窗口

保存 QPlainText 的文本到文件
```cpp
void MainWindow::on_actSave_triggered()
{
    QString fileName = QFileDialog::getSaveFileName(this, tr("Save File"), "", tr("Text Files (*.txt);;All Files (*)"));
    if (fileName.isEmpty())
        return;
    QString textContent = plainTextEdit->toPlainText();
    // 打开文件进行写入
    QFile file(fileName);
    if (!file.open(QIODevice::WriteOnly | QIODevice::Text)) {
        QMessageBox::warning(this, tr("Save File"),
                             tr("Cannot write file %1:\n%2.")
                             .arg(QDir::toNativeSeparators(fileName), file.errorString()));
        return;
    }
    QTextStream out(&file);
    out << textContent;
    file.close();
    QMessageBox::information(this, tr("File Saved"), tr("The file has been saved successfully."));
}
```
### 代码编写
打开新的 MDI 窗口
```cpp
void MainWindow::on_actDoc_Open_triggered()
{
    bool needNew = false;
    TFormDoc* formDoc;
    if(ui->mdiArea->subWindowList().size() > 0){
        formDoc = (TFormDoc*)ui->mdiArea->activeSubWindow()->widget();
        needNew = formDoc->isFileOpened();
    }else{
        needNew = true;
    }
    QString curPath=QDir::currentPath();
    QString aFileName=QFileDialog::getOpenFileName(this,tr("打开一个文件"),curPath, "C程序文件(*.h *cpp);;文本文件(*.txt);;所有文件(*.*)");
    if (aFileName.isEmpty())
        return;     //如果未选择文件，退出
    
    if (needNew) {
        formDoc = new TFormDoc(this);
        ui->mdiArea->addSubWindow(formDoc);
    }
    
    formDoc->loadFromFile(aFileName);
    formDoc->show();
    
    ui->actCut->setEnabled(true);
    ui->actCopy->setEnabled(true);
    ui->actPaste->setEnabled(true);
    ui->actFont->setEnabled(true);
}
```
- 如果已经有窗口，并且活跃窗口已经打开了文件，那么 needNew 需要一个新的子窗口，如果活跃窗口没有打开文件，那么就将活跃窗口作为新打开的子窗口（这是 needNew 为 false）
- 如果没有窗口，则无脑创建即可
- 一定要先获取MDI子窗口，再使用QFileDialog对话框打开文件。如果**先显示 QFileDialog，会导致焦点集中到其他应用中，MDI 应用主窗口就没有当期激活窗口这一说法**。
层叠展开：
![[PixPin_2025-11-28_20-53-05.png]]
平铺展开
![[PixPin_2025-11-28_20-53-25.png]]
都是内置 api，不用自己手动布局，平铺 api 会自动处理窗口大小
**从多窗口模式切换到多页模式需要重新设置窗口属性和设置**
```cpp
void MainWindow::on_actViewMode_triggered(bool checked)
{//MDI 显示模式
    if (checked) //Tab多页显示模式
        ui->mdiArea->setViewMode(QMdiArea::TabbedView); //Tab多页显示模式
    else //子窗口模式
        ui->mdiArea->setViewMode(QMdiArea::SubWindowView); //子窗口模式
    ui->mdiArea->setTabsClosable(checked);  //切换到多页模式下需重新设置
    ui->actCascade->setEnabled(!checked);   //子窗口模式下才有用
    ui->actTile->setEnabled(!checked);
}
```
## Splash 与登录窗口
splash 窗口简单来说就是启动界面，显示启动界面表示程序已经启动，但是在加载中，可以在这个时候进行一些耗时的操作和用户交互，比如登录，使用 QSplashScreen 实现
![[PixPin_2025-11-28_20-56-53.png]]

Splash 窗口通常是无边框的，所以拖动事件发生在窗口中显示的组件上，需要自行设置事件代理，`setWindowFlags(Qt::FramelessWindowHint);` 可以设置无边框，但是在任务显示对话框标题
![[PixPin_2025-12-10_22-16-48.png]]
### 代码编写
#### 窗口拖动事件
Splash 窗口没有标题栏，只能采用在图片上拖动的方式移动窗口，需要**使用鼠标事件实现窗口拖动**，程序在运行时，图片是显示在 QLabel 组件上的，鼠标拖动的实际上是 QLabel 组件，**QLabel 组件没有对事件进行处理，事件传播给其父容器组件** TDialogLogin处理。
```cpp
void TDialogLogin::mousePressEvent(QMouseEvent *event)
{ //鼠标按键被按下
    if (event->button() == Qt::LeftButton)
    {
        m_moving = true;
        m_lastPos = event->globalPosition().toPoint() - this->pos();
    }
    return QDialog::mousePressEvent(event);
}

void TDialogLogin::mouseMoveEvent(QMouseEvent *event)
{ //鼠标按下左键移动
    QPoint eventPos=event->globalPosition().toPoint();

    if (m_moving && (event->buttons() & Qt::LeftButton)
        && (eventPos-m_lastPos).manhattanLength() > QApplication::startDragDistance())
    {
        move(eventPos-m_lastPos);
        m_lastPos = eventPos - this->pos();
    }
    return QDialog::mouseMoveEvent(event);
}

void TDialogLogin::mouseReleaseEvent(QMouseEvent *event)
{ //鼠标按键被释放
    m_moving=false;     //停止移动
    event->accept();
}
```

对一个继承自 QWidget 的窗口设置 `setWindowFlags(Qt::SplashScreen)`，窗口就会自动设置为无边框，无任务栏，不在任务栏显示。
- `m_lastPos` 存储了鼠标按下时相对于窗口左上角的偏移量，用于后续计算窗口的新位置。
- **`this->m_lastPos = event->globalPos() - this->pos();`**计算鼠标按下位置相对于窗口左上角的位置。
- `QApplication::startDragDistance()` 返回系统定义的开始拖拽的最小距离，避免误操作

#### 设置保存方面
QSettings 有多种形式的构造函数，使用 Windows 注册表保存设置时，构造函数定义如下：
```cpp
QSettings(const QString &organization, const QString &application = QString(), QObject *parent = nullptr) 
```
它需要参数 organization 和 application，这两个参数确定了注册表中的一个目录。如果定义 QSettings 变量时没有传递任何参数，它默认使用静态函数 `QApplication::organizationName()` 的值作为 organization，在构造函数中我们已经设置了：
```cpp
QApplication::setOrganizationName("WWB-Qt"); //设置组织名
QApplication::setApplicationName("samp7_5"); //设置应用程序名
// 也可以在创建settings对象时设置
QSettings settings("MySoft", "Star Runner");
```
- 那么会将设置保存在**注册表目录**是 HKEY_CURRENT_USER/Software/WWB-Qt/samp 7_5。注册表里的参数是以“键-键值”的形式来保存的，键就是参数的名称，键值就是参数的值。
- QSettings 是一个基于键值对存储的数据结构，但是因为 QVariant 是 Qt 核心模块的一部分，所以它不能提供对数据类型的转换功能，在 [QVariant](https://doc.qt.io/qt-6/zh/qvariant.html) 中没有 `toColor()`, `toImage()`, 或 `toPixmap()` 函数，但是可以使用模板函数转换读取配置，将 QVariant 类型存储到设置中无限制
```cpp
// 读取不支持类型的设置
QSettings settings("MySoft", "Star Runner");
QColor color = settings.value("DataPump/bgcolor").value<QColor>();

// 设置QVariant到设置中
QSettings settings("MySoft", "Star Runner");
QColor color = palette().background().color();
settings.setValue("DataPump/bgcolor", color);
```
- 使用 QSettings 存储 QByteArray 类型的数据（如 QImage 和 QPixmap 转换后的数据）时，这些数据会被以二进制格式存储在配置文件中。具体来说，这些**二进制数据通常会被编码为 Base 64 字符串**，以便在文本文件（如 INI 文件）中存储。***使用 UTF-8 编码格式保存配置文件***可以保持文本格式，同时能够存储二进制数据。
- QSettings 对象可以在堆栈或堆上创建（即使用 `new` ）。构建和销毁 QSettings 对象的速度非常快。
- 已经存在具有相同键值的设置，则现有值将被新值覆盖。为提高效率，更改可能不会立即保存到永久存储区。(您可以随时调用 `sync()` 来提交更改）。
- 不要在**部分键名称**中使用斜线（`/ ` 和 ` \`）；反斜线字符用于分隔子键。在窗口中，`\` 会被 QSettings 转换为 `/`，这使得它们完全相同。
```cpp
settings.setValue("mainwindow/size", win->size());
settings.setValue("mainwindow/fullScreen", win->isFullScreen());
settings.setValue("outputpanel/visible", panel->isVisible());
```
- 如果设置中没有对的键，会返回一个值为 null 的 QVariant（可以被 ` toInt() ` 转换为 0）
- 设置键可以包含任何 Unicode 字符。Windows 注册表和 INI 文件使用不区分大小写的键，而 macOS 和 iOS 上的 CFPreferences API 使用区分大小写键。***需要避免出大小写以外完全一样的键名***
#### 设置管理分类
如果要保存或恢复多个具有相同前缀的设置，可以使用 [beginGroup](https://doc.qt.io/qt-6/zh/qsettings.html#beginGroup) () 指定前缀，并在最后调用 [endGroup](https://doc.qt.io/qt-6/zh/qsettings.html#endGroup) () 。下面是同一个例子，但这次使用的是组机制：
```cpp
settings.beginGroup("mainwindow");
settings.setValue("size", win->size());
settings.setValue("fullScreen", win->isFullScreen());
settings.endGroup();

settings.beginGroup("outputpanel");
settings.setValue("visible", panel->isVisible());
settings.endGroup();
```
有时，你确实希望访问存储在特定文件或注册表路径中的设置。在所有平台上，如果要直接读取 INI 文件，可以使用 QSettings 构造函数，该函数将文件名作为第一个参数，并将 [QSettings::IniFormat](https://doc.qt.io/qt-6/zh/qsettings.html#Format-enum) 作为第二个参数。
```cpp
QSettings settings("/home/petra/misc/myapp.ini", QSettings::IniFormat);
```
在 macOS 和 iOS 上，通过传递 [QSettings::NativeFormat](https://doc.qt.io/qt-6/zh/qsettings.html#Format-enum) 作为第二个参数，可以访问属性列表 `.plist` 文件。如果在 windows 上，第一个参数应该填入注册表路径，这样设置保存在注册表中
```cpp
QSettings settings("/Users/petra/misc/myapp.plist", QSettings::NativeFormat);
QSettings settings("HKEY_CURRENT_USER\\Software\\Microsoft\\Office", QSettings::NativeFormat);
```
平台之间的限制和注意事项：[参考](https://doc.qt.io/qt-6/zh/qsettings.html#platform-limitations)

# 文件系统操作和文件读写
## 文件操作相关类概述
### 基本文件读写
Qt 中进行文件读写的基本的类是 QFile，QFile 的父类是 QFileDevice，QFileDevice 提供了文件交互操作的底层功能。QFileDevice 的父类是 QIODevice，它有两个父类：QObject 和 QIODeviceBase
QFile 只有一些基本的文件数据读写函数，使用起来不够方便。QTextStream 能以流方式读写文本文件，QDataStream 能以流方式读写二进制文件，这两个类需要与 QFile 搭配使用。它们的父类是 QIODevice，**QIODevice 还有一个子类 QDebug**，使用函数 qDebug () 输出调试信息时，实际上是创建了一个默认的 QDebug 对象，通过该对象将调试信息输出到 Qt Creator 的 Application Output 窗口
### 特定格式文件读写
- xml 文件用 QDomDocument 对象表示，文档树状结构中的节点用 QDomNode 及其子类表示，qt 读取 xml 文件原理是将文件根据 DOM 格式**解析成树状结构**，这和 pugi 库类似。
- json 文件使用 QJsonDocument 读写 JSON 文件的类，
	- QJsonArray 是封装了 JSON 数组的类，
	- QJsonObject 是封装了 JSON 对象的类，
	- QJsonValue 是封装了 JSON 值的类
- 图片文件使用来从 QPaintDevice 继承的 QImage 和 QPixmap ，**它们在读取图片文件时总是按图片原始大小读取整张图片**。
	- 类 QImageReader 用于在读取图片文件时进行更多的控制，例如通过函数 `setScaledSize ()` 以指定大小读取图片，可以实现缩略图显示。
	- QImage 和 QPixmap 的函数 `save()` 可以直接将图片保存为文件。QImageWriter 类可实现在保存图片时提供更多的选项，例如设置压缩级别和图片品质。
	- QImageReader 和 QImageWriter 主要用于读取和保存图片时需要进行特殊处理的场合。
	- 如果不需要进行特殊处理，使用 QImage 和 QPixmap 类自带的读取和保存图片文件的函数即可。

## 目录和文件操作
### 文件基本信息获取
- QCoreApplication：可以提取应用程序路径、程序名等信息
- QFileInfo：用于获取文件的信息，如文件的路径、基本文件名、文件名后缀、文件大小，修改时间，创建时间。
- QTemporaryDir：用于创建临时目录，临时目录可以在使用后自动删除。
- QTemporaryFile：用于创建临时文件，临时文件可以在使用后自动删除。
- QFileSystemWatcher：用于监视设定的目录和文件，当所监视的目录或文件出现复制、重命名、删除等操作时会发射相应的信号。
- QFileInfo 的 `fileTime()` 函数，可以返回文件的多种时间，参数是枚举类型 `QFile::FileTime`：
	- `QFileDevice::FileAccessTime`：最后一次读或写文件的时间。
	- `QFileDevice::FileBirthTime`：文件创建的时间。
	- `QFileDevice::FileMetadataChangeTime`：文件的元数据被修改的时间，**文件的权限被修改也会被记录**
	- `QFileDevice::FileModificationTime`：文件最后被修改的时间
- QFile 中文件路径 `path()` 没有重载 `/` 操作符，**需要使用创痛方法拼接字符串**
```cpp
QString sous = ui->editFile->text();
QFileInfo fileInfo(sous);
QString newFile = fileInfo.path() + "/" + fileInfo.baseName() + ".xyz";
QFile::rename(sous,newFile);
```
- QTemporalDir 创建临时文件位置（windows）：C:/Users/Sickwag/AppData/Local/Temp 中，可以通过构造函数设置临时文件（夹）名称模板：
```cpp
QString specDir = ui->editDir->text();  // 界面上设置的目录
ui->plainTextEdit->appendPlainText("指定目录= " + specDir);
QTemporaryDir dir(specDir + "/TempDir_XXXXXX");     // 文件夹名称模板，绝对路径
// 最终文件名 类似 TempDir_cjkxHgb
```
- 如果在创建QTemporaryFile对象时不设置文件名模板，就会在静态函数 `QDir::tempPath()` 表示的系统临时目录下创建一个临时文件，文件名自动以“applicationName.××××××”的形式命名。其中的applicationName是静态函数 `QCoreApplication::applicationName()` 返回的应用程序名称，“××××××”表示6个随机字母（大小写敏感）
### 文件过滤器
本质上是一个 QString 对象，在使用 `QFileDialog` 时，过滤器字符串（filter string）用于指定用户可以选择的文件类型。
基本语法为：
```cpp
描述字符串(文件模式);;描述字符串 (文件模式);;...
QString filter = "Images (*.png *.xpm *.jpg);;Text Files (*.txt);;All Files (*)";
```
- 文件拓展名**大小写不敏感**，但建议统一格式
- 如果应用程序支持多语言，建议对描述部分进行本地化，使用 `tr("Images (*.png *.xpm *.jpg)")` 来支持翻译。
- 过滤器的顺序会影响用户在下拉菜单中看到的顺序
### 文件监控
监控文件（夹）改变每次监控对象发生改变时会触发对应的 changed 信号，一般需要自己设置槽函数：
```cpp
void Dialog::on_pushButton_46_clicked()
{
    showBtnInfo(sender());
    ui->plainTextEdit->appendPlainText("watch dir: " + ui->editDir->text() + "\n");
    fileWatcher.addPath(ui->editDir->text());
    fileWatcher.addPath(ui->editFile->text());
    connect(&fileWatcher, &QFileSystemWatcher::directoryChanged, this, &Dialog::do_directoryChanged);
    connect(&fileWatcher, &QFileSystemWatcher::fileChanged, this, &Dialog::do_fileChanged);
}


void Dialog::on_pushButton_47_clicked()
{
    showBtnInfo(sender());
    ui->plainTextEdit->appendPlainText("停止监视目录：" + ui->editDir->text()+"\n");
    fileWatcher.removePath(ui->editDir->text());
    fileWatcher.removePath(ui->editFile->text());
    disconnect(&fileWatcher);
}
```
## 读写文本文件
Qt 有两种读写文本文件的方法，一种是用 QFile 类直接读写文本文件，另一种是将 QFile 和 QTextStream 结合起来，用流（stream）方法进行文本文件读写
如果在创建QFile对象时没有指定文件名，可以用函数 `setFileName()` 设置文件名。注意，在调用函数 `open()` 打开文件后，就不能再调用 `setFileName()` 设置文件名。
open 函数中的参数时枚举值，可以组合传递
### 用 QFile 读写文本文件
#### 读取文本文件
```cpp
bool MainWindow::openByIO_Whole(const QString& aFileName) {  // 整体读取
    QFile aFile(aFileName);
    if (!aFile.exists())  // 文件不存在
        return false;
    if (!aFile.open(QIODevice::ReadOnly | QIODevice::Text))
        return false;
    QByteArray all_Lines = aFile.readAll();
    QString text(all_Lines);
    ui->textEditDevice->setPlainText(text);
    aFile.close();
    ui->tabWidget->setCurrentIndex(0);
    return true;
}
bool MainWindow::openByIO_Lines(const QString& aFileName) {  // 逐行读取
    QFile aFile;
    aFile.setFileName(aFileName);
    if (!aFile.exists())  // 文件不存在
        return false;
    if (!aFile.open(QIODevice::ReadOnly | QIODevice::Text))
        return false;
    ui->textEditDevice->clear();
    
    while (!aFile.atEnd()) {
        QByteArray line = aFile.readLine();    // 读取一行文字，自动添加“\0”
        QString str = QString::fromUtf8(line); // 从字节数组转换为字符串，文件必须采用UTF-8编码
        str.truncate(str.length() - 1);        // 去除增加的空行
        ui->textEditDevice->appendPlainText(str);
    }
    aFile.close();
    ui->tabWidget->setCurrentIndex(0);
    return true;
}
```
分为一次性读取和按行读取，`QFile::readLine()` 读入的每一行文本在末尾的 `\n` **之后** 都会自动添加一个空终止符（` \0 `），因为 QByteArray 需要以空终止符结尾来表示字符串的结束，每一行字符的结尾为
每一行的内容包括换行符 \n，`line.size()` 返回的是实际字节数，不包括 ` \0`，`\0` 是为了确保 QByteArray 可以被视为一个 C 风格的字符串，但在实际数据中并不包含在返回的字节数组中。
如果将读取到的字符串显示到文本框中，需要通过以下方法去除最后一个换行符，否则会打印出多余空行：
```cpp
QByteArray line = file.readLine();
line = line.trimmed(); // 去掉前后空白字符，包括换行符
line = line.chop(1);   // 去除最后一个\n，\0只是QByteArray用来管理字符串的，并不是实际读取内容
line = line.simplified(); // 去掉前后空白字符，并将中间的多个空白字符替换为单个空格
textEdit->appendPlainText(QString(line));
```
#### 写入文本文件
使用 QFile 直接写入：
- **安全性**：如果写入过程中发生错误，可能会导致目标文件损坏或不一致。
- **使用场景**：适用于不需要保证文件一致性的简单写入操作。
```cpp
bool MainWindow::saveByIO_Whole(const QString& aFileName) {
    QFile aFile(aFileName);
    if (!aFile.open(QIODevice::WriteOnly | QIODevice::Text))
        return false;
    QString str = ui->textEditDevice->toPlainText();	// 整个内容作为字符串
    QByteArray strBytes = str.toUtf8();					// 转换为字节数组，UTF-8编码
    aFile.write(strBytes, strBytes.length());			// 写入文件
    aFile.close();
    ui->tabWidget->setCurrentIndex(0);
    return true;
}
```
可以看到核心就是 QFile 的 open 函数参数设置和 `write()` 函数，还可以使用 QSaveFile 对象：
使用 QSaveFile 先将数据写入一个临时文件，只有在调用 `commit() `成功后才会将临时文件重命名为目标文件。
- **原子性**：确保文件写入过程的安全性和原子性，避免文件损坏。
- **回滚机制**：如果写入过程发生错误，可以调用 `cancelWriting()` 取消写入，不影响原始文件。
- **使用场景**：适用于需要保证文件一致性和安全性的写入操作。
```cpp
bool MainWindow::saveByIO_Safe(const QString &aFileName) {
    QSaveFile aFile(aFileName);
    if (!aFile.open(QIODevice::WriteOnly | QIODevice::Text))
        return false;
    aFile.setDirectWriteFallback(false);					// 使用临时文件
    try {
        QString str = ui->textEditDevice->toPlainText();	// 整个内容作为字符串
        QByteArray strBytes = str.toUtf8();					// 转换为字节数组，UTF-8编码
        aFile.write(strBytes, strBytes.length());			// 写入文件
        aFile.commit();										// 提交对文件的修改
        ui->tabWidget->setCurrentIndex(0);
        return true;
    } catch (QException& e) {
        qDebug("保存文件的过程发生了错误");
        aFile.cancelWriting();						        // 出现异常时取消写入
        return false;
    }
}
```
`aFile.setDirectWriteFallback(false);` 禁止直接写入回退：QSaveFile 在写入过程中始终使用临时文件，而不是直接写入目标文件。这种方式，即使在写入过程中发生错误，也不会影响原始文件，**是一种原子操作**
### 结合使用 QFile 和 QTextStream 读写文本文件
#### 读取文件
QTextStream 是能与 I/O 设备类结合来为读写文本数据提供一些简便接口函数的类。QTextStream 可以和 QIODevice 的各种子类结合使用，如 QFile、QSaveFile、QTcpSocket、QUdpSocket 等 I/O 设备类。最方便的一点是可以使用 `<<` 和 `>>` 操作符
其他方面和 QFile 没什么区别，QTextStream 可以更精细地读取文本，自动检测文件编码格式
```cpp
bool MainWindow::openByStream_Whole(const QString& aFileName) {
    QFile aFile(aFileName);
    if (!aFile.exists())
        return false;
    if (!aFile.open(QIODevice::ReadOnly | QIODevice::Text))
        return false;
    QTextStream aStream(&aFile);
    aStream.setAutoDetectUnicode(true);
    QString str = aStream.readAll();
    ui->textEditStream->setPlainText(str);
    aFile.close();
    ui->tabWidget->setCurrentIndex(1);
    return true;
}

bool MainWindow::openByStream_Lines(const QString& aFileName) {
    QFile aFile(aFileName);
    if (!aFile.exists())
        return false;
    if (!aFile.open(QIODevice::ReadOnly | QIODevice::Text))
        return false;
    QTextStream aStream(&aFile);
    aStream.setAutoDetectUnicode(true);
    ui->textEditStream->clear();
    while (!aStream.atEnd()) {
        QString str = aStream.readLine();
        ui->textEditStream->appendPlainText(str);
    }
    aFile.close();
    ui->tabWidget->setCurrentIndex(1);
    return true;
}
```
`QTextStream` 的 `setAutoDetectUnicode(true)` 通过检查文件的前几个字节（通常是前 4 到 8 字节）来检测文件的编码格式。具体来说：
1. **BOM（Byte Order Mark）**：
    - **UTF-8 BOM**：通常不存在 BOM，因为 UTF-8 不需要字节序标记。
    - **UTF-16 BOM**：前两个字节可能是 `FF FE` 或 `FE FF`。
    - **UTF-32 BOM**：前四个字节可能是 `FF FE 00 00` 或 `00 00 FE FF`。
2. **其他检测**：
    - 如果文件没有 BOM，`QTextStream` 会尝试根据文件内容和其他线索推断编码格式。

#### 写入文件
没什么特别，主要通过 `<<` 操作符
```cpp
bool MainWindow::saveByStream_Whole(const QString& aFileName) {
    QFile aFile(aFileName);
    if (!aFile.open(QIODevice::WriteOnly | QIODevice::Text))
        return false;
    QTextStream aStream(&aFile);
    aStream.setAutoDetectUnicode(true);
    QString str = ui->textEditStream->toPlainText();
    
    aStream << str;
    aFile.close();
    return true;
}


bool MainWindow::saveByStream_Safe(const QString& aFileName) {
    QSaveFile aFile(aFileName);
    if (!aFile.open(QIODevice::WriteOnly | QIODevice::Text))
        return false;
    try {
        QTextStream aStream(&aFile);
        aStream.setAutoDetectUnicode(true);
        QTextDocument* doc = ui->textEditStream->document();
        int cnt = doc->blockCount();
        for (int i = 0; i < cnt; i++) {
            QTextBlock textLine = doc->findBlockByNumber(i);
            QString str = textLine.text();
            aStream << str << "\n";
        }
        aFile.commit();
        return true;
    } catch (QException& e) {
        qDebug("保存文件的过程发生了错误");
        aFile.cancelWriting();
        return false;
    }
}
```
### 区别和共同点
如果要读写安全，则
- Stream 流读写需要注意 `setAutoDetectUnicode(true)`，文本分块读取而不是一次性读入。
- `readLine()` 函数会在每行后添加 `\0`，需要注意去除最后一个 `\n`
- 使用 QSaveFile 类保存文件，将读写操作放在 try-catch 中，并在错误处理中使用 `cancelWriting()`
## 读写二进制文件
### 基础知识
以二进制形式保存同样的数据会比其他形式保存节省大量空间
**字节序**：字节序是指一个多字节数据的各个字节码在内存或文件中的存储顺序，分为大端（big-endian）字节序和小端（little-endian）字节序。大端字节序是高位字节在前（低地址），低位字节在后（高地址）；小端字节序是低位字节在前（低地址），高位字节在后（高地址）。
Intel x86、AMD 64、ARM 处理器全采用小端字节序，MIPS 采用大端字节序。在将数据写入文件时可以根据需要设定字节序，一般使用与操作系统一致的字节序，但也可以不一致。例如 Windows 系统采用的是小端字节序，而保存数据到文件时也可以保存为大端字节序形式
### 二进制读写类
- QFile 也可以读写二进制文件，但是 `read()` 和 `write()` 函数处理二进制数据不是很方便，一般可将 QFile 和 QDataStream 类结合使用
- QDataStream 是对 I/O 设备进行二进制流数据读写操作的类，其**流数据格式与 CPU 类型、操作系统无关，是完全独立的**。QDataStream 不仅可以用于二进制文件的读写操作，还可以用于网络通信、串口通信等 I/O 设备的数据读写操作。
在构造函数中传入一个 QIODevice（可以是 QFile 文件）对象与文件实现关联，以数据流的方式读写文件，数据流编码有两种方式：**使用 Qt 的预定义编码方式，使用原始二进制数据方式**。
- 预定义序列化
	- qt 中所有基本类型（int，qint，qfloat）和一些简单的对象（QString，QColor）都可以通过流操作符**自动序列化为二进制数据**传入 QDataStream 中。
	- 序列化读写之前，需要使用 `setVersion()` 设置 qt 序列化版本，***低版本读取高版本 qt 序列化数据可能会出现问题***
	- 设置字节序，`setByteOrder(QDataStream::ByteOrder bo)`，在读取时设置即可，并不强制
	- 设置浮点数精度，`setFloatingPointPrecision(QDataStream::FloatingPointPrecision precision)`
	- 设置事务处理，可以调用对应 api 实现
- 原始二进制数据
	- 使用 `readRawData()` 和 `writeRawData()`
	- 文需要用户自定义数据转化为二进制的写入方式和将二进制解释为数据的转化方式
### 使用预定义方式
读写数据时，规范化的流程是：
1. 文件打开（是否可以打开检查，不存在时创建）
2. 流绑定物理文件
3. 设置流解析规则版本和字节序
4. 流读入/写入数据，关闭文件
如果是**连续读取写入**的情景，可以使用 QDataStream 的 `startTransaction()` 设置事务，然后统一通过 `commitTransaction()` 提交更改（成功返回 true）
#### 特殊类型流式化读写
通用读写接口
```cpp
template<class T>
void MainWindow::writeByStream(T value)
{
    QFile fileDevice(this->m_filename);
    if(!fileDevice.open(QIODevice::WriteOnly)) return;

    QDataStream fileStream(&fileDevice);
    fileStream.setVersion(QDataStream::qt_6_2);
    if(ui->radio_BigEndian->isChecked()){
        fileStream.setByteOrder(QDataStream::BigEndian);
    }else{
        fileStream.setByteOrder(QDataStream::LittleEndian);
    }
    
    fileStream << value;
    fileDevice.close();
}

template<class T>
void MainWindow::readByStream(T& value)
{
    if(!QFile::exists(this->m_filename)){
        QMessageBox::critical(this, "Error", "file not exist, filename: "+ this->m_filename);
        return;
    }
    QFile fileDevice(this->m_filename);
    if(!fileDevice.open(QIODevice::ReadOnly)) return;
    QDataStream fileStream(&fileDevice);
    fileStream.setVersion(QDataStream::Qt_6_2);
    if(ui->radio_BigEndian->isChecked()){
        fileStream.setByteOrder(QDataStream::BigEndian);
    }else{
        fileStream.setByteOrder(QDataStream::LittleEndian);
    }
    
    if(ui->radio_Single->isChecked()){
        fileStream.setFloatingPointPrecision(QDataStream::SinglePrecision);
    }else{
        fileStream.setFloatingPointPrecision(QDataStream::DoublePrecision);
    }
    fileStream >> value;
    fileDevice.close();
}
```
这种方式可以避免显示类型转化，都由模板自动推导类型
```cpp
void MainWindow::on_btnFont_Read_clicked() {  // QFont类型数据，读出
    QFont font;
    readByStream(font);
    ui->editFont_Out->setFont(font);
}
void MainWindow::on_btnColor_Read_clicked() {  // QColor类型数据，读出
    QColor color = Qt::black;
    readByStream(color);
    QPalette plet = ui->editColor_Out->palette();
    plet.setColor(QPalette::Text, color);
    ui->editColor_Out->setPalette(plet);
}
```
读写字符串数据时，`char*` 类型和 `QString` 类型有不同的方法：
- **`char*`**:
    - **类型**：指针类型，指向一个字符数组。
    - **内存表示**：通常是一个以空字符 `\0` 结尾的字符数组（C 风格字符串）。
    - **长度**：需要手动管理长度，因为没有内置的长度信息。
    - **用途**：适用于 C 风格的字符串操作，或者需要精确控制内存布局的情况。
- **`QString`**:
    - **类型**：Qt 提供的字符串类，用于处理 Unicode 字符串。
    - **内存表示**：内部使用 UTF-16 或 UTF-8 编码（取决于 Qt 版本和配置）。
    - **长度**：内置长度信息，方便操作。
    - **用途**：适用于需要处理多语言文本和复杂字符串操作的情况。

为什么需要不同的读写方式？
1. `char*`
- **固定格式**：`QDataStream` 需要知道字符串的长度才能正确写入和读取。
- **手动管理**：必须手动提供字符串的长度，否则 `QDataStream` 无法确定何时停止读取。
2. **`QString`**:
- **内置长度**：`QString` 内部存储了字符串的长度，`QDataStream` 可以直接使用这个长度信息。
- **自动处理**：`QDataStream` 可以自动处理 `QString` 的读写，而不需要额外的信息。
```cpp
void MainWindow::on_btnStr_Write_clicked() {  // char*字符串，写入
    QString str = ui->editStr_In->text();
    char* Value = str.toLocal8Bit().data();
    writeByStream(Value);
}
void MainWindow::on_btnQStr_Write_clicked() {  // QString字符串，写入
    QString Value = ui->editQStr_In->text();
    writeByStream(Value);
}
```
QDataStream 的流写入操作符支持 `char*` 字符串，它会根据结束符“`\0`”判断一个字符串的末尾。`char*` 字符串采用 Latin 1 编码，一个字符占用 1 字节，**不支持汉字**
将 Hello 以 `char*` 写入文件后，前 4 字节是一个 32 位整数记录字符串长度，最后一个字节十六进制为 `\0`，而如果使用 QString 存入 QDataStream 中，前 4 字节数值为 10，Hello 占用 10 字节长度（每个字符采用 UTF-16 编码导致）
#### 预定义方式注意事项
对于二进制数据的写入
- 写入与读取的顺序和数据格式需要一致
- 写入与读取所使用的字节序和浮点数精度也要一致
- 确保序列化格式版本兼容。
如果是简单的基本类型数据，做到上述几点已经可以了，但是如果是 Qt 的内置类型，如 QFont、QColor 等数据。其他用户要编写一个程序按照此文件格式读取文件内容，就只能用 Qt 编写，用其他语言编程（不按照 qt 的方式解码二进制数据）很难解析这些复杂类型数据。
### 使用原始二进制方式
使用纯二进制编码，只需要公开二进制文件格式定义，那么任何语言都可以解析这种格式
```cpp
int  writeRawData(const char *s, int len)
int  readRawData(char *s, int len)
```
- s是char类型的缓冲区指针，表示待写入流的原始数据；len需要小于或等于s的长度值。函数的返回值是实际写入的字节数，如果返回值为-1表示写入过程出现错误。
- 写和读数据时，不会将数据中的“\0”作为结束符，数据的存储顺序也不受函数 `QDataStream::setByteOrder()` 字节序的影响，只是连续写入或读取相应字节数的数据。在将一些基本类型的数据转换为字节数据数组时，其存储顺序自动由操作系统的字节序决定
- `writeRawData` 只会将数据写入，不做任何额外工作
```cpp
QDataStream  &writeBytes(const char *s, uint len)
QDataStream  &readBytes(char *&s, uint &len)
```
- `writeBytes()` 函数则会将 len **序列化为 4 字节数据**写在前面，然后再写入 s 的数据，`QDataStream::setByteOrder()` 设置的字节序会影响 `writeBytes()` 写入的4字节整数的存储方式，即这个整数会根据字节序的设置相应按大端字节序或小端字节序存储。

> [!note]
> `writeRawData()` 适合写入各种整数、浮点数等基本类型数据，因为这些类型数据的字节数是固定的，而 `函数writeBytes()` 适合写入字符串数据，因为字符串数据的长度是不固定的，前面存储的uint类型整数正好表示字符串数据的字节数，便于用函数 `readBytes()` 读出。
> 
> ***这两种方式读写不能混用***

#### 基本类型读取方法
方法和[[#使用预定义方式]]不差太多，仅仅是将 `fileStream << value` 方式改为对应 api 调用，不过需要将 value 通过 `writeRawData((char*)&value, sizeof(type))` 将不同类型统一转化为 `char*` 类型充当第一个参数，`iniRead()` 和 `iniWrite()` 将创建 QDataStream 和 QFile 的操作封装起来
```cpp
void MainWindow::on_btnDouble_Read_clicked()
{
    if(iniRead()){
        float value = ui->spin_Float->value();
        fileStream->writeRawData((char*)&value, sizeof(float));
        ui->edit_Float->setText(QString::asprintf("%.4f", value));
        delFileStream();        
    }
}


void MainWindow::on_btnDouble_Write_clicked()
{
    if(iniWrite()){
        float value = ui->spin_Float->value();
        fileStream->writeRawData((char*)&value, sizeof(float));
        delFileStream();
    }
}
```
#### 字符串读取方法
```cpp
void MainWindow::on_btnStr_Write_clicked() {
    if (iniWrite()) {
        QString str = ui->editStr_In->text();
        QByteArray btArray = str.toUtf8(); // 如果是Latin1编码则 QByteArray btArray = str.toLatin1();
        fileStream->writeBytes(btArray, btArray.length());
        delFileStream();
    }
}
void MainWindow::on_btnStr_Read_clicked() {  // 读取字符串，UTF-8编码
    if (iniRead()) {
        char* buf;
        uint strLen;
        fileStream->readBytes(buf, strLen);                 // 同时读取字符串长度和字符串内容
        QString str = QString::fromUtf8(buf, strLen);       // 用UTF-8编码解码数据, latin1同理
        ui->editStr_Out->setText(str);
        delFileStream();
        delete buf;                                         // 需要手动删除缓存区
    }
}
```
对于预定义方法中使用流操作符方法这种方法稍微麻烦一点，**因为原生字符数组需要记录长度**，需要通过 `QFileStream::readBytes(char* s, uint len)` 分配文件流中所有的文本字符串长度大小的空间
实际执行步骤为：
```cpp
// 步骤1：从流中读取4字节 → 转换为uint → len = 4
// 步骤2：分配 len+1 字节内存 → buf = new char[5]
// 步骤3：从流中读取len字节内容 → buf = "Test"
// 步骤4：在末尾添加'\0' → buf[4] = '\0'
```
这种方法能够高度自定义数据的二进制存储/读取方式，但是不能读写较为复杂的类型（QColor，QFont 等）

# 数据库
## Qt 数据库编程概述
### 基本内容
Qt 6 只支持 SQLite 3，不支持 SQLite 2。QSqlDatabase 类用于建立与数据库的连接，在创建 QSqlTableModel 和 QSqlQuery 类对象时，都需要设置所属的数据库连接。
```cpp
QSqlDatabase  DB= QSqlDatabase::addDatabase("QSQLITE");
```
这段代码只会添加数据库驱动，而只有调用 `open()` 函数才会进行数据库连接
`QSqlDatabase::tables()` 用于返回数据库对象的表，填入不同的枚举值参数会返回不同的表或者视图，数据集
- QSqlTableModel是一个模型类，它与数据库中的一个数据表关联后就作为该数据表的模型，**需要在构造函数中绑定数据库并 `setTable()` 设置表**
- 形成数据模型之后，就可以用对应的[[#视图]]来实现数据的显示和操作
- **QDataWidgetMapper** 用于在图形用户界面（GUI）中的小部件（widgets）和数据模型（models）之间建立映射关系。主要目的是简化数据绑定和同步的过程，使得数据可以从模型自动加载到小部件中，反之亦然。显著减少代码量。***当模型中的数据发生变化时，关联的小部件会自动更新；反之亦然***
### 代码编写
#### 基本表格属性设置
```cpp
MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    this->setCentralWidget(ui->splitter);
    ui->tableView->setSelectionBehavior(QAbstractItemView::SelectItems);
    ui->tableView->setSelectionMode(QAbstractItemView::SingleSelection);
    ui->tableView->setAlternatingRowColors(true);
}
```
`ui->tableView->setSelectionBehavior(QAbstractItemView::SelectItems);`
- **作用**：设置 `QTableView` 的选择行为为选择单个单元格。
- **参数**：`QAbstractItemView::SelectItems`
    - **`QAbstractItemView::SelectItems`**: 用户可以选择单个单元格（默认行为）。
    - **`QAbstractItemView::SelectRows`**: 用户可以选择整行。
    - **`QAbstractItemView::SelectColumns`**: 用户可以选择整列。
`ui->tableView->setSelectionMode(QAbstractItemView::SingleSelection);`
- **作用**：设置 `QTableView` 的选择模式为单选，即每次只能选择一个单元格、一行或一列。
- **参数**：`QAbstractItemView::SingleSelection`
    - **`QAbstractItemView::SingleSelection`**: 每次只能选择一个单元格、一行或一列（根据 `setSelectionBehavior` 设置）。
    - **`QAbstractItemView::ExtendedSelection`**: 用户可以通过拖动鼠标或使用 Shift 键和 Ctrl 键进行扩展选择。
    - **`QAbstractItemView::ContiguousSelection`**: 用户可以选择连续的行或列。
    - **`QAbstractItemView::MultiSelection`**: 用户可以选择多个不连续的行或列
可以通过 `setSort()` 设置数据模型中的数据排序方法，`sort()` 立刻执行排序，`setFilter()` 函数**在数据模型中执行过滤**。以上操作都**不会影响数据库和数据模型中的元数据**，只是进行调整。
#### 设置 GUI 控件和数据模型数据映射
```cpp
void MainWindow::openTable()
{
    tableModel = new QSqlTableModel(this, this->DB);
    tableModel->setTable("employee");
    tableModel->setEditStrategy(QSqlTableModel::OnManualSubmit);
    tableModel->setSort(tableModel->fieldIndex("empNo"), Qt::AscendingOrder);
    if(!tableModel->select()){
        QMessageBox::critical(this, "Error", "error message: " + tableModel->lastError().text());
        return;
    }
    showRecordCount();
    
    tabModel->setHeaderData(tabModel->fieldIndex("empNo"),  Qt::Horizontal, "工号");
    tabModel->setHeaderData(tabModel->fieldIndex("Name"),   Qt::Horizontal, "姓名");
    // ...
}
```
- 函数 `select()`根据当前设置的排序和过滤规则从数据表查询数据并将其刷新到数据模型。
- 由于设置了 `setEditStrategy(QSqlTableModel::OnManualSubmit);`，所以通过对模型的更改（通过 GUI 控件更改）不会立刻同步到数据库中，**需要手动调用 `submitAll()` 方法**
- tableModel 本质上是一个**数据模型**，模型中的数据是从 DB 中的 employee（`setTable()` 函数）表中**选择性地提取一些数据组成的**
- `tableModel->setHeaderData(tableModel->fieldIndex("empNo"), Qt::Horizontal, "工号");` 设置数据模型的水平表头，虽然 model-view 架构中，model 不管新数据如何展示，设置表头的工作本应该由 view 控件实现，但是设置表头也可以理解为是一种模型的数据属性而不是显示效果。实际业务中一份数据通常会在多个控件中用到，如果在 view 中设置表头这种属性信息会导致代码冗余。
- 如果不进行表头设置，在 QTableView 组件里显示表格数据时，会将字段名作为表头。
```cpp
this->dataMapper = new QDataWidgetMapper(this);
this->dataMapper->setModel(this->tableModel);
this->dataMapper->setSubmitPolicy(QDataWidgetMapper::AutoSubmit);
this->dataMapper->addMapping(ui->dbSpinEmpNo,tabModel->fieldIndex("empNo"));
this->dataMapper->addMapping(ui->dbEditName,tabModel->fieldIndex("Name"));
// ...
this->dataMapper->toFirst();
```
- 为**映射包装器**设置模型，就相当于设置了数据源，然后设置每一段数据分别要映射到哪个控件中
- 设置 `AutoSubmit` 会让**编辑控件**中的内容自动同步导**数据模型**中（注意不是数据库），同理也可以设置 `ManualSubmit`
- 设置 `toFirst()` 表示让控件默认显示映射器所映射的**数据模型**第一条记录，等价于 `setCurrentIndex(0)`
#### 行切换引起控件更新
```cpp
void MainWindow::do_currentChanged(const QModelIndex &current, const QModelIndex &previous)
{
    Q_UNUSED(current);
    Q_UNUSED(previous);
    ui->actSubmit->setEnabled(tableModel->isDirty());
    ui->actRevert->setEnabled(tableModel->isDirty());
}

void MainWindow::do_currentRowChanged(const QModelIndex &current, const QModelIndex &previous)
{
    Q_UNUSED(previous);
    ui->actRecDelete->setEnabled(current.isValid());
    ui->actPhoto->setEnabled(current.isValid());
    ui->actPhotoClear->setEnabled(current.isValid());
    
    if(!current.isValid()){
        ui->dbLabPhoto->clear();
        return;
    }
    int curRecNo = current.row();
    this->dataMapper->setCurrentIndex(curRecNo);
    QSqlRecord curRec = this->tableModel->record(curRecNo);
    if(curRec.isNull("Photo")){
        ui->dbLabPhoto->clear();
    }else{
        QByteArray data = curRec.value("Photo").toByteArray();
        QPixmap pic;
        pic.loadFromData(data);
        ui->dbLabPhoto->setPixmap(pic.scaledToWidth(ui->dbLabPhoto->size().width()));
    }
}
```
- `isDirty()` 表示数据是否是脏数据（未同步仅数据模型中）
- 每一行是一个人的各项数据，所以行切换的时候需要更新，基本信息中的所有 combox 和 Lineedit 都已经通过 dataMapper 映射，所以徐亚更新信息时只需要 `this->dataMapper->setCurrentIndex(curent.row());` 就能够让所有组件映射 `current.row()` 的内容，初始状态被设置为 `toFirst()` 显示 dataModel 中的第一条记录，等价于 `setCurrentIndex(0)`
- 由于图片信息是二进制信息，QDataWidgetMapper 用于在简单数据类型（如字符串、整数、浮点数、布尔值等）和 UI控件之间进行映射，对于 BLOB 类型不可以被映射
- QSqlRecord 是一个用来存储**一条 sql 记录的类**，封装了各个字段的内容和字段的属性信息
```cpp
QSqlRecord  QSqlTableModel::record()           //没指定获取哪行的记录所以只返回字段定义
QSqlRecord  QSqlTableModel::record(int row)    //返回字段定义和数据
bool    contains(QString  &name)  // 判断记录是否含有名称为name的字段
QVariant  QSqlRecord::value(int index)              //返回序号为index的字段的值
QVariant  QSqlRecord::value(const QString &name)    //返回字段名称为name的字段的值
```
- QDataWidgetMapper 只有一个信号 `currentIndexChanged()`，在当前行变化时会发射此信号
- QSqlField 封装了一条记录中某个字段的数据，封装了字段值和字段信息，所以获取表格字段信息除了获取 metaData 外还有一种方法：
```cpp
void MainWindow::getFieldNames()
{
    QSqlRecord emptyRec = this->tableModel->record();
    for(int i = 0; i < emptyRec.count(); i++){
        ui->comboFields->addItem(emptyRec.fieldName(i));
    }
}
```
#### 数据模型增删改查
```cpp
void MainWindow::on_actRecAppend_triggered()
{
    QSqlRecord rec = tableModel->record();
    rec.setValue(this->tableModel->fieldIndex("empNo"), 2000 + this->tableModel->rowCount());
    rec.setValue(this->tableModel->fieldIndex("Gender"), "male");
    tableModel->insertRecord(tableModel->rowCount(), rec);
    selModel->clearSelection();
    QModelIndex curIndex = tableModel->index(tableModel->rowCount()-1, 1);
    selModel->setCurrentIndex(curIndex, QItemSelectionModel::Select);
    showRecordCount();
}


void MainWindow::on_actRecInsert_triggered()
{
    QModelIndex curIndex = this->selModel->currentIndex();
    QSqlRecord rec = this->tableModel->record();
    this->tableModel->insertRecord(curIndex.row(), rec);
    this->selModel->clearSelection();
    this->selModel->setCurrentIndex(curIndex, QItemSelectionModel::Select);
    showRecordCount();
}


void MainWindow::on_actRecDelete_triggered()
{
    QModelIndex curIndex = this->selModel->currentIndex();
    this->tableModel->removeRow(curIndex.row());
    this->selModel->clearSelection();
    showRecordCount();
}

void MainWindow::on_actPhoto_triggered()
{
    QString aFile = QFileDialog::getOpenFileName(this, "choose a pic file", "", "jpg pic(*.jpg);;png pic(*.png)");

    if(aFile.isEmpty()) return;
    QByteArray data;
    QFile* file = new QFile(aFile);
    file->open(QIODevice::ReadOnly);
    data = file->readAll();
    file->close();

    QSqlRecord curRec = this->tableModel->record();
    int curRecNo = this->selModel->currentIndex().row();
    curRec.setValue(this->tableModel->fieldIndex("Photo"), data);
    this->tableModel->setRecord(curRecNo, curRec);

    QPixmap* pic = new QPixmap;
    pic->load(aFile);
    ui->dbLabPhoto->setPixmap(pic->scaledToWidth(ui->dbLabPhoto->size().width()));
}
```
- 更改 model 的结构（增删行列记录时）最好对选择模型使用 `clearSelect()` 一下刷新选择。
- 本质就是通过构建一条数据（QSqlRecord 对象），然后添加到模型中，由模型管理数据提交
- 更新照片由两个部分组成：更新数据模型中的照片和更新显示在屏幕上的照片，数据库中的 BLOB 类型只能转化为 QByteArray 存储，这里使用 QFile 直接读取方式将图片数据转为字节数组，然后将字节数组构建为 QSqlRecord 存储。GUI QLabel 直接使用 load 和 `setPixmap()` 即可实现更新
## QSqlQueryModel 的使用
### 实现数据查询
#### 获取数据并记录
```cpp
void MainWindow::selectData()
{
    this->qryModel = new QSqlQueryModel(this);
    qryModel->setQuery("SELECT empNo, Name, Gender, Birthday, Province, Department, Salary FROM employee ORDER BY empNo");
    if(this->qryModel->lastError().isValid()){
        QMessageBox::critical(this, "错误", "数据表查询错误,错误信息\n" +qryModel->lastError().text());
        return;
    }
    ui->statusBar->showMessage(QString("记录条数：%1").arg(qryModel->rowCount()));
    
    QSqlRecord rec = qryModel->record();
    qryModel->setHeaderData(rec.indexOf("empNo"), Qt::Horizontal, "工号");
    qryModel->setHeaderData(rec.indexOf("Name"), Qt::Horizontal, "姓名");
	// ...

    selModel = new QItemSelectionModel(qryModel, this);
    connect(selModel, &QItemSelectionModel::currentRowChanged, this, &MainWindow::do_currentRowChanged);
    ui->tableView->setModel(qryModel);
    ui->tableView->setSelectionModel(selModel);

    dataMapper = new QDataWidgetMapper(this);
    dataMapper->setSubmitPolicy(QDataWidgetMapper::AutoSubmit);
    dataMapper->setModel(qryModel);
    dataMapper->addMapping(ui->dbSpinEmpNo, rec.indexOf("empNo"));
    dataMapper->addMapping(ui->dbEditName, rec.indexOf("Name"));
	// ...
    dataMapper->toFirst();
    ui->actOpenDB->setEnabled(false);
}
```
- qt 中，如果在没有绑定数据库的情况下直接执行 sql 语句，会调用 ` QSqlDatabase::database()` 获取到的第一个默认数据库作为执行对象
- QSqlQueryModel 可以使用默认的列名作为表头数据，设置表头**只是为了提高可读性，支持多语言和数据导出中有作用**，并不会直接影响默认的表头显示
- QSqlQueryModel没有类似于 `QSqlTableModel::fieldIndex()` 的函数，为了便于根据字段名获取字段序号，如果需要知道某一个字段的 index，需要先调用 `record()` 获取空记录（其中包含了字段名信息），然后调用 `indexOf()` 获取
- 同理，无论是 `QSqlQueryModel` 还是 `QStandardItemModel`（或其他 `QAbstractTableModel` 的子类），设置表头的主要目的是为了让最终显示在 `QTableView` 中的表格具有更具可读性和描述性的列标题
#### 通过数据库查询数据并更新
```cpp
void MainWindow::do_currentRowChanged(const QModelIndex &current, const QModelIndex &previous)
{// 功能仍然是根据行变化之后的行得到对应人记录，更新身份信息和照片
    Q_UNUSED(previous);
    if(!current.isValid()){
        ui->dbLabPhoto->clear();
        ui->dbEditMemo->clear();
        return;
    }
    this->dataWapper->setCurrentModelIndex(current); // 根据current更新基本文本信息
    bool first= (current.row() == 0);                        //是否为首记录
    bool last= (current.row() == qryModel->rowCount()-1);    //是否为尾记录
    
    // 更新UI控件状态
    ui->actRecFirst->setEnabled(!first);
    ui->actRecPrevious->setEnabled(!first);
    ui->actRecNext->setEnabled(!last);
    ui->actRecLast->setEnabled(!last);
    
    // 更新照片信息
    int curRecNo = selModel->currentIndex();
    QSqlRecord curRec = this->qryModel->record(curRecNo);
    int empNo = curRec.value("EmpNo").toInt();
    QSqlQuery query;
    query.prepare("SELECT EmpNo, Memo, Photo FROM employee WHERE EmpNo = :ID");
    query.bindValue(":ID", empNo);
    query.exec();
    query.first();
    QVariant va = query.value("Photo");
    if(va.isValid()){
        QByteArray data = va.toBitArray();
        QPixmap pic;
        pic.loadFromData(data);
        ui->dbLabPhoto->setPixmap(pic.scaledToWidth(ui->dbLabPhoto->size().width()));
    }else{
        ui->dbLabPhoto->clear();
    }
    QVariant va2 = query.value("Memo");
    ui->dbEditMemo->setPlainText(va2.toString());
}
```
-  `QSqlQuery` 对象使用 `exec()` 方法执行 SQL 语句后，只支持单个结果集返回。每次 `exec()` 只能执行一条 SQL 语句并返回一个结果集。`previous()`, `next()`, `first()`, `last()`, `seek(index)`, `at()`, 和 `isActive()` 这些函数用于在结果集中定位某一行 `QSqlRecord` 数据。
- QSqlQuery 采用**游标机制**管理行间数据，这些定位函数的时间复杂度是 `O(1)`
- 在 sql 语句编写时，需要注意**按需存取**，只操作必要的数据，过多的 BLOB 数据被查询会消耗大量内存
## QSqlQuery 的使用
### 基本知识
QSqlQuery 用来运行 sql 语句，实现增删改查。
常用的 api
```cpp
QString    executedQuery()  // 返回上一次成功运行过的SQL语句
QString    lastQuery()  // 返回当前使用的SQL语句
int    numRowsAffected()  // 返回SQL语句影响的记录条数，如果返回值为-1，表示无法确定影响的记录条数。如果运行的是SELECT语句，该函数的返回值无意义，应该用函数size()确定查询结果的记录条数
```
有一个特殊的函数 `bool isForwardOnly()`，返回数据集是否仅能前向移动，若此返回true，则只能用 `next()` 函数或参数值为正数的 `seek()` 函数移动当前记录。默认为false。 `setForwardOnly()` 设置数据集是否仅能前向移动，**必须在运行函数 `prepare()` 或 `exec()` 之前运行这个函数。若设置为仅能前向移动，可提高内存使用效率和记录移动速度**
最好在初始化 `QSqlQuery` 对象时**指定数据库对象**，用 `exec(QString)` 执行字面量 sql 语句时**语句中不能有参数**

### 占位符处理两种方式
```cpp
void QSqlQuery::bindValue(const QString &placeholder, const QVariant &val, QSql::ParamType paramType = QSql::In);

QSqlQuery query;
query.prepare("{CALL get_user_id(:name, :userId)}");
query.bindValue(":name", "Alice");
query.bindValue(":userId", QVariant(QVariant::Int), QSql::Out); // 绑定输出参数
query.exec();

// 获取返回的值
int userId = query.boundValue(":userId").toInt();
```
- paramType是参数类型，默认值为 `QSql::In`，表示传递给数据库的值。`QSql::Out` 表示参数是一个返回值，运行 `exec()` 后，这个参数会被数据库返回的值覆盖。
- `QVariant(QVariant::Int)` 是一个空的 `QVariant`，类型为 `int`，`QSql::Out` 表示 `:userId` 是一个输出参数，`exec()` 执行后，`:userId` 会被存储过程返回的值覆盖。使用 `boundValue()` 获取，只能在 `exec()` 执行后调用。

第二种方法**不需要给出占位符标记或者序号**，统一使用 `?` 占位，按顺序绑定。

```cpp
void QSqlQuery::bindValue(int pos, const QVariant &val, QSql::ParamType paramType = QSql::In)

query.prepare("UPDATE employee SET Department=?, Salary=? WHERE EmpNo =?");
query.addBindValue("技术部");
query.addBindValue(6000);
query.addBindValue(1007);

void  QSqlQuery::addBindValue(const QVariant &val, QSql::ParamType paramType = QSql::In);
```
### 代码编写
#### 修改数据
```cpp
void MainWindow::updateRecord(int recNo)
{// 主窗口点击更新记录按钮时，跳出编辑框
    
    // 跳出编辑框之前，需要记下我应该修改谁的信息，先记录下当前选中的是谁
    QSqlRecord curRec = this->qryModel->record(recNo);
    int empNo = curRec.value("EmpNo").toInt();
    // 查找需要修改的人的empNo，用于在数据库中依据empNo找到对应记录
    QSqlQuery query;
    query.prepare("select * from employee where EmpNo = :ID");
    query.bindValue(":ID", empNo);
    query.exec();
    query.first();
    if(!query.isValid()) return;
    
    // 跳出编辑框
    TDialogData *dataDialog = new TDialogData(this);
    dataDialog->setWindowFlags(dataDialog->windowFlags() | Qt::MSWindowsFixedSizeDialogHint);
    dataDialog->setUpdateRecord(curRec); // 将当前行记录的信息填入对话框中
    int ret = dataDialog->exec();
    if(ret == QDialog::Accepted){
        // 将tabView中当前行已经修改过的QSqlRecord数据填入数据库中
        QSqlRecord  recData = dataDialog->getRecordData();
        
        query.prepare("update employee set Name=:Name, Gender=:Gender,"
                      " Birthday=:Birthday,  Province=:Province,"
                      " Department=:Department, Salary=:Salary,"
                      " Memo=:Memo, Photo=:Photo "
                      " where EmpNo = :ID");
        
        query.bindValue(":Name",    recData.value("Name"));
        query.bindValue(":Gender",  recData.value("Gender"));
        query.bindValue(":Birthday",recData.value("Birthday"));
        query.bindValue(":Province",recData.value("Province"));
        query.bindValue(":Department",  recData.value("Department"));
        query.bindValue(":Salary",  recData.value("Salary"));
        query.bindValue(":Memo",    recData.value("Memo"));
        query.bindValue(":Photo",   recData.value("Photo"));
        
        query.bindValue(":ID",      empNo);
        
        if (!query.exec())
            QMessageBox::critical(this, "错误", "记录更新错误\n"+query.lastError().text());
        else
            qryModel->query().exec();   //数据模型重新查询数据，更新tableView显示
    }
    delete dataDialog;      //删除对话框
}

// 更新函数
void MainWindow::on_actRecEdit_triggered()
{
    int curRecNo = this->selModel->currentIndex().row();
    updateRecord(curRecNo);
}


void MainWindow::on_tableView_doubleClicked(const QModelIndex &index)
{
    int curRecNo = index.row();
    updateRecord(curRecNo);
}
```
这个函数用于所有对 tabView 中的行记录的修改操作，流程为：
1. 记录现在哪一行需要修改，保存这行的数据并通过 `setUpdataRecord()` 填入 TDialogData 对话框中。
2. 根据将这一行对应的人的 empNo 记下来
3. 对话框修改数据之后将修改的数据**在数据库中查找 empNo 值**写回数据库（updata 语句）

#### 插入数据
```cpp
void MainWindow::on_actRecInsert_triggered()
{
	// QSqlQuery query;
    // query.exec("select * from employee where EmpNo =-1"); //实际查不出，只查询字段信息
    // QSqlRecord curRec=query.record();   //获取当前记录,实际为空记录
    QSqlRecord curRec = this->DB.record("employee");
    // curRec.clear();
    curRec.setValue("EmpNo", this->qryModel->rowCount() + 3000);
    
    TDialogData* dataDialog = new TDialogData(this);
    Qt::WindowFlags    flags=dataDialog->windowFlags();
    dataDialog->setWindowFlags(flags | Qt::MSWindowsFixedSizeDialogHint); //对话框固定大小
    dataDialog->setInsertRecord(curRec); //插入记录
    
    int ret=dataDialog->exec();
    if (ret==QDialog::Accepted) {
        QSqlRecord  recData=dataDialog->getRecordData();
        query.prepare("INSERT INTO employee (EmpNo,Name,Gender,Birthday,Province,"
                      " Department,Salary,Memo,Photo) "
                      " VALUES(:EmpNo,:Name, :Gender,:Birthday,:Province,"
                      " :Department,:Salary,:Memo,:Photo)");
        
        query.bindValue(":EmpNo",recData.value("EmpNo"));
		// ...
    }
    delete dataDialog;
}
```
- 由于插入数据需要一个 QSqlRecord 对象，并且**对象必须拥有表格的字段信息**，不然 `setInsertRecord()` 函数无法插入数据，获取包含字段的 record 对象书中使用**一段一定没有结果的 sql 语句获得**，这样并不可取
- 使用 `QSqlRecord curRec = this->DB.record("employee");` 方法**将表中的字段信息记录到 curRec 中**，并不会记录字段值，也不需要调用 `clear()` 否则会**清空字段信息**
- 省略部分和[[#QSqlQuery 的使用#修改数据|修改数据]]一致
#### 删除数据
```cpp
void MainWindow::on_actRecDelete_triggered()
{
    int curRecNo= selModel->currentIndex().row();
    QSqlRecord  curRec= qryModel->record(curRecNo);
    if(curRec.isEmpty()) return;
    
    int empNo = curRec.value("EmpNo").toInt();
    QSqlQuery query;
    query.prepare("delete  from employee where EmpNo = :ID");
    query.bindValue(":ID",empNo);
    
    if (!query.exec())
        QMessageBox::critical(this, "错误", "删除记录出现错误\n"+query.lastError().text());
    else {
        QString sqlStr=qryModel->query().executedQuery();//  执行过的SELECT语句
        qryModel->setQuery(sqlStr);         //重新查询数据
    }
}
```
- [[#QSqlQuery 的使用#删除数据|删除]] 和[[#QSqlQuery 的使用#插入数据|插入]]数据执行完毕之后，调用已经执行过的查询语句并不可靠，应为如果上一次执行的查询不是 `select * from employee` 会导致 qryModel 得到不完整的数据
```cpp
QString sqlStr=qryModel->query().executedQuery();   //执行过的SELECT语句
qryModel->setQuery(sqlStr);         //重新查询数据
```
- qryModel 内部会维护一个 QSqlQuery 对象，如果通过 `setQuery()` 设置了 sql 语句，那么模型会**立刻执行这条语句**并将返回结果作为 qryModel 的内部数据，内部的 QSqlQuery 对象会记录下这条 sql，**每次调用 `query()` 会调用最后一次 `setQuery()` 设置的 sql 语句**
## QSqlRelationalTableModel 的使用
QSqlRelationalTableModel是QSqlTableModel的子类，专门设计用来处理数据库表之间的关联关系（特别是外键关联）
QSqlRelation 构造函数中第二个参数是**数据库表中的实际字段名，而不是 `setHeadData()` 的 表头名称！**
```cpp
QSqlRelation (const QString &tableName, const QString &indexColumn, const QString &displayColumn)
// QSqlRelation对象可以调用参数同名函数返回对应值
// setJoinMode()用于设置SQL语句中的连接模式，也就是设置是否显示外键字段值在编码表中不存在的记录
```
### 下拉框生成
对于一个已经设置外键关系的 QSqlRelationTableMode，将数据显示到 tabView 组件时，如果支持编辑单元格的值（通过设置代理实现，默认的 QSqlRelationDelegate 默认使用下拉选框模式），弹出的下拉选框会显示对应列在数据表中的所有允许值
```sql
-- 创建示例数据库表
-- 学生表（主表）
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    major_id INTEGER,      -- 外键，指向专业表
    class_id INTEGER,      -- 外键，指向班级表
    grade INTEGER
);
-- 专业表（关联表1）
CREATE TABLE majors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    major_name TEXT NOT NULL,
    faculty TEXT
);
-- 班级表（关联表2）
CREATE TABLE classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL,
    teacher TEXT
);
```
```cpp
model = new QSqlRelationalTableModel(this);
model->setTable("students");

// 关键步骤1：设置关联关系
// 将major_id列关联到majors表，显示major_name字段
model->setRelation(
    model->fieldIndex("major_id"),  // 学生表中的外键列
    QSqlRelation("majors", "id", "major_name")  // 关联表、关联键、显示字段
);

// 将class_id列关联到classes表，显示class_name字段
model->setRelation(
    model->fieldIndex("class_id"),
    QSqlRelation("classes", "id", "class_name")
);

// 设置编辑策略
model->setEditStrategy(QSqlTableModel::OnFieldChange);

// 注意要设置代理
QSqlRelationalDelegate *delegate = new QSqlRelationalDelegate(tableView);
tableView->setItemDelegate(delegate);
```
设置好关系模式后，当用户点击"专业"进行编辑时：
1. 自动弹出下拉选择框
2. 显示所有可选的专业名称（计算机科学、软件工程...）
3. 显示时：major_id=1 → 查询 majors 表找到 id=1 的记录 → 显示 "计算机科学"
4. **编辑时：自动获取 majors 表的所有 major_name 生成下拉框**
5. **保存时：用户选择"软件工程" → 查询 majors 表找到 major_name="软件工程"的id → 存储 id=2**
## 三种数据模型操纵数据库区别
### 基本特性
| 特性        | QSqlTableModel | QSqlQueryModel  | QSqlRelationalTableModel |
| --------- | -------------- | --------------- | ------------------------ |
| **易用性**   | 高，自动处理数据同步     | 中，需要手动处理数据同步    | 中，需要配置关联关系               |
| **灵活性**   | 低，只能操作单表       | 高，支持任意复杂查询      | 中，支持外键关联但限于主表结构          |
| **性能**    | 中等，自动缓存和更新     | 取决于查询复杂度        | 中等，自动JOIN可能影响性能          |
| **可读写**   | 支持读写           | 默认只读（需子类化实现写操作） | 支持读写（继承自TableModel）      |
| **自动更新**  | 支持             | 不支持，需要手动刷新      | 支持                       |
| **多表操作**  | 不支持            | 支持              | **支持外键关联映射**             |
| **聚合查询**  | 不支持            | 支持              | 不支持                      |
| **关联处理**  | 不支持            | 需要手动JOIN        | **内置外键关联解析**             |
| **编辑界面**  | 普通编辑控件         | 只读或自定义          | **自动生成关联下拉框**            |
| **数据一致性** | 自动维护           | 需要手动维护          | 自动维护外键约束                 |
| **适用场景**  | 简单单表CRUD       | 复杂查询/报表         | 有关联的表单应用                 |
### 示例理解
对于这样两个表的结构：
```sql
-- 员工表（外键指向部门）
CREATE TABLE employee (
    id INTEGER PRIMARY KEY,
    name TEXT,
    department_id INTEGER,  -- 外键
    salary REAL
);

-- 部门表
CREATE TABLE department (
    id INTEGER PRIMARY KEY,
    name TEXT,
    location TEXT
);
```
三种方式操作结果对比：
```cpp
QSqlTableModel *model = new QSqlTableModel(this);
model->setTable("employee");
model->select();

// 显示结果：department_id 显示为数字ID
// id | name | department_id | salary
// 1  | Alice| 101          | 5000
// 2  | Bob  | 102          | 6000
```
QSqlTableModel，用户看到的是部门 ID，而不是部门名称。
```cpp
QSqlQueryModel *model = new QSqlQueryModel(this);
model->setQuery("SELECT e.id, e.name, d.name as department, e.salary "
                "FROM employee e "
                "LEFT JOIN department d ON e.department_id = d.id");

// 显示结果：通过JOIN获取部门名称
// id | name | department | salary
// 1  | Alice| HR         | 5000
// 2  | Bob  | IT         | 6000
```
QSqlQueryModel显示了部门名称。但需要手动编写复杂 SQL，修改数据时需要处理多个表。
```cpp
QSqlRelationalTableModel *model = new QSqlRelationalTableModel(this);
model->setTable("employee");

// 关键：设置关系映射
model->setRelation(
    2,  // department_id字段在employee表中的索引（第3列）
    QSqlRelation("department", "id", "name")  // 关联表、关联键、显示字段
);

model->select();

// 显示结果：自动将department_id转换为部门名称
// id | name | department | salary
// 1  | Alice| HR         | 5000
// 2  | Bob  | IT         | 6000
```
- 将 `employee` 表中的第2列（`department_id` 字段）设置为外键
- 这个外键指向 `department` 表的 `id` 字段
- 在界面上显示时，用 `department` 表的 `name` 字段值替代原始的 `id` 值
- 数据存储时，仍然存储 `department_id`（外键值）
实现原理是根据两者共有的 id 列设置映射规则，**并不需要两表拥有同一个名为 id 的字段**，对于不同的字段名称还可以通过这种方式提高可读性
```cpp
-- 员工表
CREATE TABLE employee (
    emp_id INTEGER PRIMARY KEY,      -- 不叫id，叫emp_id
    emp_name TEXT,
    dept_code INTEGER                -- 外键，不叫department_id
);

-- 部门表  
CREATE TABLE department (
    dept_id INTEGER PRIMARY KEY,     -- 不叫id，叫dept_id
    dept_name TEXT,
    location TEXT
);

model->setRelation(
    model->fieldIndex("dept_code"),  // employee表中的外键字段
    QSqlRelation("department", "dept_id", "dept_name")  // 关联表、关联键、显示字段
);
```

### 操作数据库逻辑
QSqlTableModel 是通过模型 `setData(index, value)` 直接修改值，然后模型自动将修改的值同步到数据库中，需要手动/自动调用 `submitAll()`
[[#QSqlQueryModel 的使用|QSqlQueryModel]] 的增删改查的方法有两种：
- 通过构造 QSqlRecord 对象，将数据写入其中然后将其通过 api 加入到数据模型中，然后数据模型和数据包装器分别将更改同步到数据库和对应组件中。
- 通过 [[#QSqlQuery 的使用|QSqlQuery]] 是通过直接执行 sql 语句，获取执行结果后通过 `qryModel->query()` 重新查询 `setQuery()` 预设的 sql ，最终重新显示到组件中，也可以使用包装器关联控件
`QSqlRelationalTableModel` 的出现，是为了让 Qt 的 GUI 控件能够**感知和理解数据库中的表间关联关系**，从而在显示和操作关联数据时，**避免编写复杂的 JOIN 查询和手动处理外键转换**，如果没有这个类，那么在GUI 控件中需要展示/操作多个表中的数据时，只能通过sql语句来实现将多个表中的内容显示在一个表格控件中。有了这个类，就能够在qt中**复现不同表之间的关系，让qt控件了解数据库基本结构关联**，从而减少代码量，让数据通过GUI控件修改更方便

# 绘图
## QPainter 绘图
### 绘图系统基本知识
- Qt 的二维绘图基本功能是使用 QPainter 在绘图设备上绘图，绘图设备包括 QWidget、QPixmap、QPrinter 等。QWidget 是最常见的绘图设备。
- Qt 还提供了图形/视图（graphics/view）架构。通过使用 QGraphicsView、QGraphicsScene 和各种 QGraphicsItem 类，可以在一个场景中绘制大量的图形项，且每个图形项是可选择、可交互操作的。
- QImage、QPixmap、QBitmap 和 QPicture 是 4 个用于处理图片的类。**QImage 是与硬件无关的表示图片的类**，是为设备输入输出而优化设计的类，它可以直接进行图片像素数据的访问和操作。**QPixmap 是为在屏幕上显示图片而优化设计的类**。QBitmap 是 QPixmap 的子类，**用于表示 1 位色深的单色位图**。**QPicture 是用于记录和回放 QPainter 指令的类**

QWidget类有一个事件处理函数 `paintEvent()`，在组件界面需要重绘时，系统会自动运行这个函数。要在界面上绘图。
**图形的线条特性、颜色特性、文字特性**由 3 个类的特性决定。
- QPen 类：用于控制线条的颜色、宽度、线型等。
- QBrush 类：用于设置一个区域的填充特性，包括填充颜色、填充样式、渐变特性等，还可以采用图片进行材质填充。
- QFont 类：用于设置文字的字体、样式、大小等属性。
### 代码编写
#### 基本绘图
```cpp
void Widget::paintEvent(QPaintEvent *event)
{
    QPainter painter(this);
    painter.setRenderHint(QPainter::Antialiasing);
    painter.setRenderHint(QPainter::TextAntialiasing);
    int w = this->width();
    int h = this->height();
    QRect rec(w/4, h/4, w/2, h/2);

    QPen pen;
    pen.setWidth(3);
    pen.setColor(Qt::red);
    pen.setStyle(Qt::SolidLine);
    pen.setCapStyle(Qt::FlatCap);
    pen.setJoinStyle(Qt::BevelJoin);

    QBrush brush;
    brush.setColor(Qt::yellow);
    brush.setStyle(Qt::SolidPattern);

    painter.setBrush(brush);
    painter.setPen(pen);
    painter.drawRect(rec);
    event->accept();
}
```
这个函数作用仅仅是显示一个红边框，黄填充，长宽为 1/2 窗口大小的居中矩形
![[PixPin_2025-12-13_16-41-35.png]] 对于 QPen 对象来说，下面的所有调整都是**针对线条的绘制**
```cpp
void    setColor(QColor  &color)  	// 设置画笔颜色，即线条颜色
void    setWidth(int  width)  		// 设置线条宽度，单位是像素
void    setStyle(Qt::PenStyle  style)  // 设置线条样式，参数为枚举类型Qt::PenStyle    
void    setCapStyle(Qt::PenCapStyle  style)  // 设置线条端点样式，参数为枚举类型Qt::PenCapStyle    
void    setJoinStyle(Qt::PenJoinStyle  style)  // 设置线条连接样式，参数为枚举类型Qt::PenJoinStyle
```
对于 QBrush 对象同理，只针对填充样式的控制
```cpp
void    setColor(QColor  &color)  设置画刷颜色，实体填充时即填充颜色
void    setStyle(Qt:: BrushStyle  style)  设置画刷填充样式，参数为枚举类型Qt::BrushStyle
void    setTexture(QPixmap  &pixmap)  设置一个QPixmap类型的图片作为画刷的图片，画刷样式自动设置为Qt:: TexturePattern  
void    setTextureImage(QImage &image) 设置一个QImage类型的图片作为画刷的图片，画刷样式自动设置为
```
#### 渐变绘图
三种渐变类型可以参考[[QT样式表合集#Brush 模型介绍|样式表]]中的 QSS 实现渐变
```cpp
painter.setPen(Qt::NoPen);
QLinearGradient linearGrad(rec.left(), rec.top(), rec.right(), rec.bottom());
// QLinearGradient linearGrad(rec.left(), rec.top(), rec.right(), rec.top());
linearGrad.setColorAt(0, Qt::blue);
linearGrad.setColorAt(0.5, Qt::white);
linearGrad.setColorAt(1, Qt::blue);
painter.setBrush(linearGrad);
painter.drawRect(rec);
event.accept();
```
其中两种渐变形式会出现不同的图案
![[PixPin_2025-12-13_17-10-27.png]]

### 绘制基本图形
| 函数名                   | 功能和示例代码                                                                                                                                                                                                                       | 示例图形                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `drawPoint()`         | 绘制一个点<br><br>painter.drawPoint(QPoint(W/2, H/2));<br>                                                                                                                                                                         | `•` （中心点）            |
| `drawPoints()`        | 绘制一批点<br><br>QPoint points[] = {<br>    QPoint(5*W/12, H/4),<br>    QPoint(3*W/4, 5*H/12),<br>    QPoint(2*W/4, 5*H/12)<br>};<br>painter.drawPoints(points, 3);<br>                                                           | `• • •` （三个散点）       |
| `drawLine()`          | 绘制直线<br><br>QLine Line(W/4, H/4, W/2, H/2);<br>painter.drawLine(Line);<br>                                                                                                                                                    | `/` （斜线）             |
| `drawLines()`         | 绘制一批直线<br><br>QRect rect(W/4, H/4, W/2, H/2);<br>QList<QLine> Lines;<br>Lines.append(QLine(rect.topLeft(), rect.bottomRight()));<br>Lines.append(QLine(rect.topRight(), rect.bottomLeft()));<br>painter.drawLines(Lines);<br> | `╳` （交叉线）            |
| `drawArc()`           | 绘制弧线<br><br>QRect rect(W/4, H/4, W/2, H/2);<br>int startAngle = 90 * 16; // 起始 90°<br>int spanAngle = 90 * 16; // 旋转 90°<br>painter.drawArc(rect, startAngle, spanAngle);<br>                                                 | `⌒` （四分之一圆弧）         |
| `drawChord()`         | 绘制一段弦<br><br>QRect rect(W/4, H/4, W/2, H/2);<br>int startAngle = 90 * 16; // 起始 90°<br>int spanAngle = 90 * 16; // 旋转 90°<br>painter.drawChord(rect, startAngle, spanAngle);<br>                                              | `△` （弦与弧围成的扇形区域）     |
| `drawPie()`           | 绘制扇形<br><br>QRect rect(W/4, H/4, W/2, H/2);<br>int startAngle = 40 * 16; // 起始 40°<br>int spanAngle = 120 * 16; // 旋转 120°<br>painter.drawPie(rect, startAngle, spanAngle);<br>                                               | `扇` （扇形）             |
| `drawConvexPolygon()` | 根据给定的点绘制凸多边形<br><br>QPoint points[4] = {<br>    QPoint(5*W/12, H/4),<br>    QPoint(3*W/4, 5*H/12),<br>    QPoint(5*W/12, 3*H/4),<br>    QPoint(W/4, 5*H/12)<br>};<br>painter.drawConvexPolygon(points, 4);<br>                | `◇` （菱形）             |
| `drawPolygon()`       | 绘制多边形，最后一个点会和第一个点重合<br><br>QPoint points[] = {<br>    QPoint(5*W/12, H/4),<br>    QPoint(3*W/4, 5*H/12),<br>    QPoint(5*W/12, 3*H/4),<br>    QPoint(2*W/4, 5*H/12)<br>};<br>painter.drawPolygon(points, 4);<br>              | `▶` （箭头形多边形）         |
| `drawPolyline()`      | 绘制多点连接的线，最后一个点不会和第一个点连接<br><br>QPoint points[] = {<br>    QPoint(5*W/12, H/4),<br>    QPoint(3*W/4, 5*H/12),<br>    QPoint(5*W/12, 3*H/4),<br>    QPoint(2*W/4, 5*H/12)<br>};<br>painter.drawPolyline(points, 4);<br>         | `→→→` （折线）           |
| `drawImage()`         | 将 QImage 对象存储的图片绘制在指定的矩形区域内<br><br>QRect rect(W/4, H/4, W/2, H/2);<br>QImage image(":/images/images/qt.jpg");<br>painter.drawImage(rect, image);<br>                                                                          | `[Qt]` （文字占位）        |
| `drawPixmap()`        | 将 QPixmap 对象存储的图片绘制在指定的矩形区域内<br><br>QRect rect(W/4, H/4, W/2, H/2);<br>QPixmap image(":/images/images/qt.jpg");<br>painter.drawPixmap(rect, image);<br>                                                                       | `[Qt]` （文字占位）        |
| `drawText()`          | 绘制文本，只能绘制单行文字，字体属性由 QPainter::font() 决定<br><br>QRect rect(W/4, H/4, W/2, H/2);<br>QFont font;<br>font.setPointSize(30);<br>font.setBold(true);<br>painter.setFont(font);<br>painter.drawText(rect, "Hello, Qt");<br>          | `Hello, Qt` （文本）     |
| `drawEllipse()`       | 绘制椭圆<br><br>QRect rect(W/4, H/4, W/2, H/2);<br>painter.drawEllipse(rect);<br>                                                                                                                                                 | `○` （椭圆）             |
| `drawRect()`          | 绘制矩形<br><br>QRect rect(W/4, H/4, W/2, H/2);<br>painter.drawRect(rect);<br>                                                                                                                                                    | `□` （矩形）             |
| `drawRoundedRect()`   | 绘制圆角矩形<br><br>QRect rect(W/4, H/4, W/2, H/2);<br>painter.drawRoundedRect(rect, 20, 20);<br>                                                                                                                                   | ` rounded □ ` （圆角矩形） |
| `fillRect()`          | 填充矩形，无边框线<br><br>QRect rect(W/4, H/4, W/2, H/2);<br>painter.fillRect(rect, Qt::green);<br>                                                                                                                                    | `■` （绿色填充矩形）         |
| `eraseRect()`         | 擦除某个矩形区域，等效于用背景色填充该区域<br><br>QRect rect(W/4, H/4, W/2, H/2);<br>painter.eraseRect(rect);<br>                                                                                                                                  | `⬜` （擦除/透明矩形）        |
| `drawPath()`          | 绘制由 QPainterPath 对象定义的路径<br><br>QRect rect(W/4, H/4, W/2, H/2);<br>QPainterPath path;<br>path.addEllipse(rect);<br>path.addRect(rect);<br>painter.drawPath(path);<br>                                                         | `○+□` （路径叠加）         |
| `fillPath()`          | 填充某个 QPainterPath 对象定义的绘图路径，但是不显示轮廓线<br><br>QRect rect(W/4, H/4, W/2, H/2);<br>QPainterPath path;<br>path.addEllipse(rect);<br>path.addRect(rect);<br>painter.fillPath(path, Qt::red);<br>                                    | `🔴` （红色填充路径）        |

QPainterPath 类用于记录绘图操作序列。一个 PainterPath 由许多基本的绘图操作组成，一个闭合的 PainterPath 是起点和终点连接起来的绘图路径。这类出现是为了解决**复杂图形多次绘制问题**，将复杂图形绘制方法记录其中即可复用 `drawPath()`

## 坐标系统和坐标变换
### 坐标变换
![[PixPin_2025-12-13_17-45-10.png]]
```cpp
void drawClock(QPainter &painter) {
    // 1. 平移原点到时钟中心
    painter.translate(200, 200);
    
    // 2. 画时钟刻度
    for (int i = 0; i < 12; ++i) {
        // 3. 每次旋转30度（360/12 = 30）
        painter.rotate(30);
        painter.drawLine(0, -90, 0, -100);  // 画刻度线
    }
    
    // 4. 画时针（当前时间3:30）
    painter.save();  // 保存当前坐标系状态
    painter.rotate(90);  // 3点 = 90度
    painter.drawLine(0, 0, 0, -40);
    painter.restore();  // 恢复坐标系
    
    // 5. 画分针
    painter.save();
    painter.rotate(180);  // 6点方向 = 180度
    painter.drawLine(0, 0, 0, -60);
    painter.restore();
}
```
本质上就是改变**绘图参考坐标系的基准线指向**。在[[Qt Official Tutorial#AnalogClock|官方时钟案例]]中可以看到
### QPainterPath 绘制复杂图形
绘制五角星代码：
```cpp
void Widget::paintEvent(QPaintEvent *event)
{
    QPainter painter(this);
    painter.setRenderHint(QPainter::Antialiasing);
    painter.setRenderHint(QPainter::TextAntialiasing);

    qreal R = 100;
    const qreal Pi = 3.1415926;
    qreal deg = Pi * 72 / 180;
    // 绘制五角星五个顶点
    QPoint points[5]={   QPoint(R,0),
        QPoint(R*qCos(deg),     -R*qSin(deg)),
        QPoint(R*qCos(2*deg),   -R*qSin(2*deg)),
        QPoint(R*qCos(3*deg),   -R*qSin(3*deg)),
        QPoint(R*qCos(4*deg),   -R*qSin(4*deg))
    };

    QFont font;
    font.setPointSize(14);
    painter.setFont(font);
    QPen    penLine;
    penLine.setWidth(2);
    penLine.setColor(Qt::blue);
    penLine.setStyle(Qt::SolidLine);
    penLine.setCapStyle(Qt::FlatCap);
    penLine.setJoinStyle(Qt::BevelJoin);
    painter.setPen(penLine);

    QBrush  brush;
    brush.setColor(Qt::yellow);         //画刷颜色
    brush.setStyle(Qt::SolidPattern);   //画刷填充样式
    painter.setBrush(brush);

    // 五角星路径绘制，顺序不能打乱
    QPainterPath starPath;
    starPath.moveTo(points[0]);
    starPath.lineTo(points[2]);
    starPath.lineTo(points[4]);
    starPath.lineTo(points[1]);
    starPath.lineTo(points[3]);
    starPath.closeSubpath();    //闭合路径，最后一个点与第一个点相连，虽然两点是重叠的，但要手动闭合

    starPath.addText(points[0],font,"1"); //显示端点编号
    starPath.addText(points[1],font,"2");
    starPath.addText(points[2],font,"3");
    starPath.addText(points[3],font,"4");
    starPath.addText(points[4],font,"5");

    // 三个位置绘制不同的三个五角星
    painter.save();             //保存坐标状态，左上角状态
    painter.translate(100,120);
    painter.drawPath(starPath); //画星星
    painter.drawText(0,0,"S1");
    painter.restore();          //恢复坐标状态

    painter.translate(300,120); //平移
    painter.scale(0.8,0.8);     //缩放
    painter.rotate(90);         //顺时针旋转
    painter.drawPath(starPath); //画星星
    painter.drawText(0,0,"S2");

    painter.resetTransform();   //复位所有坐标变换
    painter.translate(500,120); //平移
    painter.rotate(-145);       //逆时针旋转
    painter.drawPath(starPath); //画星星
    painter.drawText(0,0,"S3");

    event->accept();
}
```
- QPainterPath 记录图形之后，**不需要保证路径闭合**
- `closeSubPath()` **总是**会连接当前位置到当前子路径的起点，无论当前位置在哪里。
- 直接在 path 上使用 `addText()` 添加文字会使用这些点的局部坐标系如果父路径有旋转或倾斜变换，文字会继承这些变换。使用 `addText()` 实际上做了两件事
	1. 将字体轮廓转换为路径
	2. 将这个路径添加到 starPath 中，应用当前的变换矩阵
- 解决方法是对文字内容重新使用一个 `QPainterPath` 对象初始化并通过 `addPath()` 添加到 starPath 中，直接将 a `ddText()` 用于已经包含几何图形的路径**文字会继承父路径的变换状态，导致倾斜/旋转**
- `setBrush` 之后给复杂图形填充颜色的规则是**奇偶规则**：从图形内任意一点向外画一条射线，计算射线与路径相交的次数：如果相交次数为**奇数**，点在内部（填充），为**偶数**，点在外部（不填充），所以五角星中心五边形**不会填充**
### 视口和窗口
绘图设备的物理坐标系是基本的坐标系，通过 QPainter 的平移、旋转等坐标变换可以得到更容易操作的逻辑坐标系。物理坐标系也称为视口（viewport）坐标系，逻辑坐标系也称为窗口（window）坐标系
- 视口是指绘图设备的任意一个矩形区域，它使用物理坐标系。可以只选取物理坐标系中的一个矩形区域来绘图，默认情况下，视口等于绘图设备的整个矩形区域。
- 窗口是用逻辑坐标系定义的，窗口可以直接定义矩形区域的逻辑坐标范围。
![[PixPin_2025-12-13_19-58-31.png|800]]
```cpp
painter.setViewport(50,0,200,200);
painter.setWindow(-50,-50,100,100);
```
使用窗口坐标系的优点是：在绘图时只需按照窗口坐标系定义来绘图，而不用关注实际的物理坐标范围。例如在一个固定边长为 100 像素的正方形窗口内绘图，当实际绘图设备大小变化时，**绘制的图形会自动相应改变大小**。
```cpp
void Widget::paintEvent(QPaintEvent *event)
{
    QPainter painter(this);
    painter.setRenderHint(QPainter::Antialiasing);
    int w = this->width();
    int h = this->height();
    int side = qMin(w, h);
    QRect rec((w-side)/2, (h-side)/2, side, side);
    painter.drawRect(rec);
    // painter.setViewport(rec);
    painter.setWindow(-100, -100, 200, 200);
    QPen    pen;
    pen.setWidth(1);        //线宽
    pen.setColor(Qt::red);  //划线颜色
    pen.setStyle(Qt::SolidLine);    //线的类型
    pen.setCapStyle(Qt::FlatCap);   //线端点样式
    pen.setJoinStyle(Qt::BevelJoin);//线的连接点样式
    painter.setPen(pen);

    for(int i=0; i<36; i++){
        painter.drawEllipse(QPoint(50,0),50,50);
        painter.rotate(10);
    }
}
```
- 默认情况下，`QPainter` 的**逻辑坐标系**与**设备坐标系**重合。画 `(0,0)` 就是左上角，`(width, height)` 是右下角。`drawEllipse(QPoint(50,0), 50, 50)` 中的 `(50,0)` 是**设备像素坐标**。
- `setviewport()` 会导致所有后续绘图操作将被限制在这个矩形内（超出部分会被裁剪），不改变逻辑坐标，只是“框定”了绘图范围
- `setWindow()` 它会建立一个**从逻辑坐标到设备坐标的映射关系**，逻辑坐标 `(-100, -100)` 映射到设备坐标 `(0,0)`，逻辑坐标 `(100, 100)` 映射到设备坐标 `(side, side)`（因为 window 宽高是 200x200）
![[PixPin_2025-12-13_20-38-56.png]]
- 方框是由于 rec 对象设置了大小，所以绘制出矩形，构造函数中 `setAutoFillBackground(true)` 自动填充白色
- 1 图不设置窗口和视口导致绘图坐标原点在左上角，并且**可绘制图形的区域**在是整个 Widget 对象，绘制圆形 `painter.drawEllipse(QPoint(50,0),50,50);` 半径 50 像素，所以组合图形圆心在左上角，并且较小**不会随窗口缩放**
- 2 图设置视口，设置了可绘制区域限定在 rec 矩形中，**逻辑坐标仍是设备坐标**，同样半径 50 像素较小，**不会随窗口缩放**
- 3 图设置窗口，映射 `(-100,-100)` 替换 GUi 窗口的左上角坐标，逻辑坐标圆心在 GUi 程序中心位置，`painter.drawEllipse(QPoint(50,0),50,50);` 设置的是逻辑坐标，所以一个圆半径是 1/4 个可绘制区域长度，**是 50 逻辑坐标刻度单位而不是 50 像素**，**可以随窗口缩放**，此时可绘制范围仍然是整个 Widge，所以是椭圆不是正圆
- 4 图绘图原点设置在视口中央，区域限定在视口中，并且半径为 50 逻辑坐标刻度单位，所以是正圆
- `QPainter` 中，**所有的绘图函数（如 `drawLine`、`drawRect`、`drawEllipse`、`drawText` 等）使用的都是 _逻辑坐标_（logical coordinates）**，而不是物理设备坐标（像素），**默认情况下逻辑坐标等于物理坐标**
- 绘制的图形是否根据根据窗口大小变化**一般需要通过视口实现**，因为视口大小根据 rect 参数调整，而 rect 在每次 paintEvent 重绘时都会调整大小

> [!note]
> 所以，viewport 限制绘制的位置，window 设置绘图比例尺大小

## 图形/视图架构
### 场景、视图与图形项
Qt为绘制复杂的可交互的图形提供了图形/视图（graphics/view）架构，这是一种基于图形项的模型/视图结构。使用图形/视图架构可以绘制复杂的由成千上万个基本图形组件组成的图形，并且每个图形组件是可选择、可拖放和可修改的，类似于矢量绘图软件的绘图功能
图形/视图架构主要由**场景、视图和图形项**组成
![[PixPin_2025-12-13_21-22-59.png|800]]
场景是一个抽象的管理图形项的容器，可以向场景添加图形项，获取场景中的某个图形项。主要具有如功能:
- 提供管理大量图形项的快速接口。
- 将事件传播给每个图形项。
- 管理每个图形项的状态，例如选择状态、焦点状态等。
- 管理未经变换的渲染功能，主要用于打印。
场景拥有**前景和后景**，可以设置画刷填充或者自定义绘制
```cpp
etBackgroundBrush()
setForegroundBrush()
drawBackground()
drawForeground()
```
视图 QGraphicsView 是图形/视图架构中的视图组件。间接父类是 QWidget，所以它是一个界面组件，用于显示场景中的内容。可以为一个场景设置多个视图，用于对同一个场景提供
不同的显示界面。
默认情况下，当视图大于场景时（[[PixPin_2025-12-13_21-22-59.png|上图中最外部的视图1]]），场景在视图的中央位置显示，也可以通过设置视图的 Alignment 属性来控制场景在视图中的显示位置。**视图 2 只能显示场景的部分内容，但是会自动提供卷滚条实现在整个场景内移动**
图形项就是一些基本图形组件，所有图形项类都是从 QGraphicsItem 继承而来的， QGraphicsItem 没有父类，QGraphicsItem 支持如下一些操作。
- 鼠标事件响应。
- 键盘输入，以及按键事件。
- 拖放操作。
- 支持组合，可以是父子图形项关系组合，也可以通过 QGraphicsItemGroup 类进行组合。
### 图形/视图架构的坐标系
图形/视图架构有3个有效的坐标系：场景坐标系、视图坐标系、图形项坐标系
![[PixPin_2025-12-14_09-54-15.png|700]]
- 场景坐标系等价于 QPainter 的逻辑坐标系，一般以场景的中心为原点；
	- 场景坐标系描述了每个顶层图形项的位置。创建场景时可以定义场景矩形区域的坐标范围
	- `scene= new QGraphicsScene(-400,-300,800,600)`单位是像素
- 视图坐标系与绘图设备坐标系相同，是物理坐标系，默认以左上角为原点；
	- 所有的鼠标事件、拖放事件的坐标首先是由视图坐标系定义的，然后用户需要将这些坐标映射为场景坐标，以便和图形项交互
	- 单位是像素。视图坐标系只与视图组件或视口有关，而与观察的场景无关。QGraphicsView 视口的左上角坐标总是 (0,0)。
- 图形项坐标系
	- 是局部逻辑坐标系，一般以图形项的中心为原点, 绘制图形项时只需考虑其局部坐标系，QGraphicsScene 和 QGraphicsView 会自动进行坐标变换
	- **图形项的位置是指其中心在父对象坐标系中的坐标**。对于没有父图形项的图形项，其父对象就是场景，图形项的位置就是指在场景中的坐标
	- QGraphicsItem的大多数函数都在其局部坐标系上操作，`QGraphicsItem::pos()` 是仅有的几个例外之一，它返回的是图形项在父图形项坐标系中的坐标，如果是顶层图形项，则返回的是在场景中的坐标。
## 图像处理
一般使用 QPixmap 加载图片文件或图片数据，然后在 QLabel 组件上显示图片。QImage 访问图像中每个像素的颜色数据，用于需要对图像数据进行处理的应用，旋转或翻转图像，改变图像亮度或对比度等**精细化处理**
### 图像表示和图形处理概述
#### 颜色表示
RGB 32：用 32 位无符号整数表示颜色，数据格式为 `0xffRRGGBB`，其**中最高字节的 ff 是无意义的**，实际是用 24 位有效数据表示颜色。因为 32 位无符号整数（quint 32）是标准的整数格式，所以在**计算机上存储的图片文件一般采用这种格式表示像素的颜色**。
RGB 888：即红色、绿色、蓝色各用 1 字节表示，数据格式为 `0xRRGGBB`，一样也是用 24 位数据表示颜色，但是少占用 1 字节。**在内存有限的嵌入式系统中可能会使用 RGB 888 格式**少占用存储空间。但是 3 字节数据并不标准，所以如果内存中使用了 RGB 888 格式，在**计算机上保存图片文件时也会使用 RGB 32 格式**。
ARGB 32：在 RGB 32 的基础上高位 ff 表示 Alpha 值，但一般只有 0~100 范围而不是 128，数据格式为 `0xAARRGGBB`
#### 图片文件格式
- BMP 是位图文件格式，其文件头存储图像的一些信息，如图像宽度、高度、颜色数据格式等，是无损图片文件格式
- JPG 使用图片压缩算法，大小是 BMP 的 10%左右，是有损的
- PNG 是无损压缩的格式，采用 ARGB 数据
- SVG 是 XML 描述的图片，无法被 QImage 读取
#### 处理图形 api
`QImage::load` 和 `QImage::save` 用于读取和保存，load 的 format 参数可以在构造函数中设置，设置读取规则和[[#图像处理#颜色表示|颜色表示格式]]。
函数 `dotsPerMeterX()` 和 `dotsPerMeterY()` 分别返回图像在水平和垂直方向上的DPM分辨率。常用的另一个分辨率单位是DPI，DPI和DPM的换算关系是：1 DPI = 0.0254 DPM
因为1英寸等于0.0254米，所以如果要设置图像的水平分辨率为200 DPI，示意代码如下：
```cpp
int DPI= 200; 
image.setDotsPerMeterX(DPI/0.0254);    //image是一个QImage类型的变量
```
### 代码编写
```cpp
void MainWindow::printImage(QPainter *painter, QPrinter *printer)
{
    QMargins margin(20,40,20,40);
    QRectF pageRect = printer->pageRect(QPrinter::DevicePixel);
    int pageW = pageRect.width();
    int pageH = pageRect.height();
    const int lineInc = 20;
    int curX = margin.left();
    int curY = margin.top();
    painter->drawText(curX, curY, this->m_filename);
    curY += lineInc;
    
    painter->drawText(curX,curY,QString("Page width =%1 像素").arg(pageW));
    painter->drawText(200,curY,QString("Image width =%1 像素").arg(m_image.width()));
    curY += lineInc;
    
    painter->drawText(curX,curY,QString("Page height=%1 像素").arg(pageH));
    painter->drawText(200,curY,QString("Image height=%1 像素").arg(m_image.height()));
    curY += lineInc;
    
    int spaceH= pageH-curY;  //页面剩余的高度
    
    //图像未超过页面范围，居中显示实际大小的图片
    if ((pageW > m_image.width()) && (spaceH > m_image.height())) {
        curX =(pageW - m_image.width())/2;          //使水平居中
        painter->drawImage(curX, curY, m_image);    //打印图像
        return;
    }
    
    //否则图像高度或宽度超过了页面剩余空间，缩放后打印
    QImage newImg;
    if (m_image.height() > m_image.width())
        newImg =m_image.scaledToHeight(spaceH);   //按高度缩放
    else
        newImg =m_image.scaledToWidth(pageW);     //按宽度缩放
    curX =(pageW-newImg.width())/2;             //使水平居中
    painter->drawImage(curX,curY,newImg);
}
```
打印图像，首先划定好范围，图片上方空间用来显示信息**使用 QPainter 画笔绘制文字**，lineInc 是每一行的宽度，并根据剩余空间设置图像缩放
```cpp
void MainWindow::on_actImg_RotateRight_triggered()
{
    QTransform matrix;
    matrix.reset();
    matrix.rotate(-90);
    m_image.transformed(matrix);
    QPixmap pixmap = QPixmap::fromImage(m_image);
    ui->labPic->setPixmap(pixmap);
    ui->tabWidget->setCurrentIndex(0);
    showImageFeatures(false);
    imageModified(true);
}
```
图像旋转需要用到 QTransform 进行**矩阵转换**

# 自定义插件和库
## 设计和使用自定义界面组件
```cpp
void TBattery::paintEvent(QPaintEvent *event)
{
    QPainter painter;
    
    // 设置可绘制区域大小和位置，比例尺
    QRect rect(0,0,this->width(), this->height());
    painter.setViewport(rect);
    painter.setWindow(0,0,120,50); // 设置视口左上角坐标为0,0，视口右下角坐标为120,50，单位是逻辑坐标轴刻度单位，不是像素
    painter.setRenderHint(QPainter::Antialiasing);
    painter.setRenderHint(QPainter::TextAntialiasing);
    
    // 绘制边框
    QPen pen(colorBorder);
    pen.setWidth(2);
    pen.setStyle(Qt::SolidLine);
    pen.setCapStyle(Qt::FlatCap);
    pen.setJoinStyle(Qt::BevelJoin);
    
    QBrush brush(colorBack);
    brush.setStyle(Qt::SolidPattern);
    
    painter.setPen(pen);
    painter.setBrush(brush);
    rect.setRect(1,1,109,48);
    painter.drawRect(rect);
    
    // 绘制电极头
    brush.setColor(colorBorder);
    painter.setBrush(brush);
    rect.setRect(110,15,10,20);
    painter.drawRect(rect);
    
    if(m_powerLevel > m_warnLevel){
        brush.setColor(colorPower);
        // pen.setColor(colorPower);
    }else{
        brush.setColor(colorPower);
        // pen.setColor(colorPower);        
    }
    painter.setBrush(brush);
    painter.setPen(Qt::NoPen);
    // painter.setPen(pen);
    
    // 显示电量文字
    QFontMetrics textSize(this->font());
    QString powStr = QString::asprintf("%d%%", this->m_powerLevel);
    QRect textRect = textSize.boundingRect(powStr);
    painter.setFont(this->font());
    pen.setColor(colorBorder);
    painter.setPen(pen);
    painter.drawText(55 - textRect.width()/2, 23 + textRect.height()/2, powStr);
    event->accept();
}
```
字体渲染类 QFontMetrics，**QFont** 回答："用什么字体？"，**QFontMetrics** 回答："这个字体渲染出来多大？"，用于下面的场景
1. **精确布局**：文本对齐、居中、换行需要知道文本的实际尺寸
2. **设备适配**：不同设备（屏幕、打印机）上同一字体的实际尺寸不同
3. **国际化**：不同语言字符宽度不同，需要动态计算
注意，要想滑动条滑动时改变电池样式，则需要将滑动条 valueChange 的时候调用对应的 set 函数，set 函数中使用 `repaint()`，则会重新调用 `paintEvent()` 重绘图形
```cpp
void Widget::on_horizontalSlider_valueChanged(int value)
{
    ui->battery->setPowerLevel(value);
    QString str = QString::asprintf("current power: %d %%", value);
    ui->labInfo->setText(str);
}
```
## 设计和使用Qt Designer Widget插件
qt 安装目录下的 `\Qt\Tools\QtCreator\bin\plugins` 用 dll（linux 是 so）文件存储插件，其中包含了**高级 API**用以拓展 Qt 功能，**低级 API 用于自行编写拓展应用程序功能**，其中包含了自定义 Qt Designer Widget 插件
### 创建自定义 QWidget 控件
NewProject 中的 Qt 4 设计师控件项目
![[PixPin_2025-12-14_15-27-39.png]]
插件若要安装到 Qt Designer 的组件面板里，并且要在设计时**正常显示**（否则会显示空白），**编译插件的编译器必须和编译 Qt Creator 的编译器相同**
![[PixPin_2025-12-14_15-21-34.png]]
![[PixPin_2025-12-14_15-31-12.png]]
`tpbatteryplugin.h` 和 `tpbatteryplugin.cpp`**用于实现插件有关逻辑**，决定了这个自定义 QWidget 在 UI 编辑器中图标显示，是否是容器，名称，toolTip，拖拽到画布中初始化行为
```cpp
#include <QDesignerCustomWidgetInterface>

class TPBatteryPlugin : public QObject, public QDesignerCustomWidgetInterface
{
    Q_OBJECT
    Q_INTERFACES(QDesignerCustomWidgetInterface)
    Q_PLUGIN_METADATA(IID "org.qt-project.Qt.QDesignerCustomWidgetInterface")

public:
    explicit TPBatteryPlugin(QObject *parent = nullptr);

    bool isContainer() const override;
    bool isInitialized() const override;
    QIcon icon() const override;
    QString domXml() const override;
    QString group() const override;
    QString includeFile() const override;
    QString name() const override;
    QString toolTip() const override;
    QString whatsThis() const override;
    QWidget *createWidget(QWidget *parent) override;
    void initialize(QDesignerFormEditorInterface *core) override;

private:
    bool m_initialized = false;
};

// cpp文件
QWidget *TPBatteryPlugin::createWidget(QWidget *parent)
{
    return new TPBattery(parent);
}
// 可知这个控件从UI编辑器控件盒子中拿到画布中会调用这个函数
```
`tpbattery.h` 和 `tpbattery.cpp` 用于实现 TPBattery 类，即描述这个控件在 UI 编辑器是什么样的

### 自定义控件 qmake 编写
```qmake
CONFIG      += plugin debug_and_release # 表示这个项目既可以被编译为插件（dll或者so文件），也可以是debug/release编译
TARGET      = $$qtLibraryTarget(tpbatteryplugin)
TEMPLATE    = lib		# 表示项目是一个库，而一般的应用程序模板类型是app。

HEADERS     = tpbatteryplugin.h
SOURCES     = tpbatteryplugin.cpp
RESOURCES   = icons.qrc
LIBS        += -L. 

QT += designer

target.path = $$[QT_INSTALL_PLUGINS]/designer
INSTALLS    += target

include(tpbattery.pri)
```
### 组件类编写和引入
#### 编写
大体上和[[#自定义插件和库#设计和使用自定义界面组件|电池组件]]代码一致，但需要添加 `#include <QtUiPlugin/QDesignerExportWidget>` 头文件和 `class QDESIGNER_WIDGET_EXPORT TPBattery : public QWidget {}` 宏，用于将自定义组件类从插件导出给 Qt Designer 使用，必须在类名称前使用此宏。
在Release模式下编译，编译后会生成 `tpbatteryplugin.dll` 和 `tpbatteryplugin.lib` 两个文件。若在Debug模式下编译，会生成文件 `tpbatteryplugind.dll` 和 `tpbatteryplugind.lib`，**注意文件名后面多了一个字母“d”**
#### 引入到 Qt Designer 控件盒子
编译后，将构建目录下的 Debug 和 Release 编译的 dll 文件复制到
![[PixPin_2025-12-14_16-13-23.png]]
```md
D:\Qt\Tools\QtCreator\bin\plugins\designer
D:\Qt\6.2.3\msvc2019_64\plugins\designer
```
控件盒子中**出现对应的控件**需要满足下面几个条件
- Qt creator 的 Base qt 版本需要和编译控件 dll 的编译器**完全一样**，包括次版本号，Qt 6.7.3 和 Qt 6.8.0 虽然都是 6. x 系列，**但在 ABI 级别上不兼容**
![[Pasted image 20251214173138.png]]
![[PixPin_2025-12-14_17-33-30.png]]
如果控件盒子中没有空间，可以**在 UI 编辑器界面查看 Design Widgeter** 插件安装情况
![[Pasted image 20251214172709.png]]
![[PixPin_2025-12-14_17-34-47.png]]
其中显示版本不兼容，则无法直接引入到 qt creator 中，则需要通过[[#prompt to 引入自定义控件|提升法]]或[[#通过外部库引入自定义控件|外部库引入]]方法，或者**将 qt creator 版本**切换到对应编译器版本
#### prompt to 引入自定义控件
简单粗暴，直接将源代码添加到项目中，然后再 UI 编辑器中对对应的控件右键 prompt to 提升控件即可，这样做自定义组件类中**新增的属性不会出现在属性编辑器里**，新增的信号也不会出现在 Go to slot 对话框里
#### 通过外部库引入自定义控件
参考：[Qt项目中添加外部库的详细配置教程,-CSDN博客](https://blog.csdn.net/jason_thinking/article/details/137654933)
[Qt之实现自定义控件的两种方式——插件法_qt自定义控件-CSDN博客](https://blog.csdn.net/u011832219/article/details/128531359?ops_request_misc=%7B%22request%5Fid%22%3A%22170964553816800184155013%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=170964553816800184155013&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_click~default-2-128531359-null-null.142)
qmake 项目右键项目->添加库->外部库
![[PixPin_2025-12-14_17-45-04.png]]
在项目目录中添加一个 include（或者其他名称都行）文件夹，并将 dll 文件和 lib 文件（取决于动静态引入方式）和头文件添加进去即可
![[Pasted image 20251214174148.png]]
效果和[[#prompt to 引入自定义控件|提升法]]一致，但是由于只通过 `.h` 文件暴露了接口，无法新增属性和新的信号

## 创建和使用静态库
创建项目的时候选择 C++ Library，type 选择 static library
qmake 中设置 `TEMPLATE = lib` 即可，cmake 设置
```cmake
#add_library用于生成静态库或动态库，STATIC表示静态库
add_library(MyStaticLib STATIC
  tpendialog.cpp
  tpendialog.h
  tpendialog.ui
)
```
**静态库不需要设置导入导出宏**，静态库中的所有符号（如果未使用 `static` 或匿名命名空间隐藏）会被直接打包到目标文件中，导入导出是[[#动态库（共享库）]]的概念
生成的库文件与使用的编译器有关，**只会生成一个 lib 或者 a 文件**，MSVC生成的库文件是 ` MyStaticLib.lib `；MinGW生成的库文件是 ` libMyStaticLib.a `。**同编译器在 Release 和 Debug 模式下编译生成的静态库文件名称是相同的，并不会为 Debug 版本库文件名自动添加一个字母“d”**，如需区分则手动更名，然后通过[[#通过外部库引入自定义控件|添加外部库]]实现引入

## 创建和使用共享库
### 创建共享库
创建项目的时候选择 C++ Library，type 选择 shared library，向导结束后**会生成 4 个文件**，`MySharedLib.pro`、`MySharedLib_global.h`、`tpendialog.h`和`tpendialog.cpp`
编译共享库会比静态库多出一个 dll/so 文件
```cpp
// MySharedLib_global.h
#include <QtCore/qglobal.h> 
#if defined(MYSHAREDLIB_LIBRARY) 
#  define MYSHAREDLIB_EXPORT Q_DECL_EXPORT      //声明为导出，共享库中有效
#else 
#  define MYSHAREDLIB_EXPORT Q_DECL_IMPORT      //声明为导入，使用库的项目中有效
#endif
// 这样动态库项目可以使用这个头文件作为源代码，编译选项中添加预定义宏MYSHAREDLIB_LIBRARY自动设置，这样就会导出动态项目中的符号
// 编译完成后给别的项目使用MYSHAREDLIB动态库，可以将同一个头文件和dll放入项目中即可
// 使用这个动态库的项目没有定义，宏MYSHAREDLIB_LIBRARY所以会导入动态库中的符号
```
共享库里的符号，包括变量、类和函数等，需要声明为**导出的公共符号**才可以被应用程序使用。共享库要导出的符号前面需要加 `Q_DECL_EXPORT` 宏。而在使用共享库的应用程序中，需要在头文件里将需要用到的符号声明为导入的，也就是在符号前加 `Q_DECL_IMPORT` 宏。
在需要导出的符号前面添加 `MYSHAREDLIB_EXPORT`，这样可以在导出符号的同时，标明这个导出符号来自哪个动态库
```cpp
#include "MySharedLib_global.h" 
class MYSHAREDLIB_EXPORT TPenDialog {
public:
     TPenDialog(); 
};
```
在 qmake 中设置预定义宏
```qmake
DEFINES += MYSHAREDLIB_LIBRARY
```
cmake 设置
```cmake
target_compile_definitions(MySharedLib PRIVATE MYSHAREDLIB_LIBRARY)
```
- MSVC 编译，编译后会生成文件 `MySharedLib.dll` 和 `MySharedLib.lib`。
- MinGW 编译，编译后会生成文件 `MySharedLib.dll` 和 `libMySharedLib.a`。
### 使用共享库
**只有使用共享库（动态库）的时候才有两种方式**：隐式链接（implicit linking）调用和显式链接（explicit linking）调用
使用静态库只有一种[[#动静态概念#静态库|静态链接]] 的方法
#### 显式链接
显式链接调用时只有 `.dll` 文件，没有 `.h` 文件和 `.lib` 文件，这个 `.dll` 文件可能是用其他编程语言生成的。虽然没有 `.h` 文件，但可以使用QLibrary类在应用程序里动态加载 `.dll` 文件，**在提前知道 dll 文件中已经定义好的函数原型情况下**手动在代码中说明 dll 中函数的签名
显示链接一般只用于调用非 C/C++ 语言的，或者较为简单的 dll 文件

显式链接的特点：
- 程序员负责所有步骤
- 不需要编译器/链接器的帮助
- 直接使用 Windows API（LoadLibrary/GetProcAddress/QLibrary）
```cpp
// windows API示例
#include <windows.h>
#include <iostream>

int main() {
    // 1. 手动加载DLL
    HMODULE hDll = LoadLibraryA("MyLibrary.dll");
    if (!hDll) {
        std::cerr << "无法加载DLL" << std::endl;
        return 1;
    }
    
    // 2. 手动获取函数地址
    // C++函数有名称修饰（name mangling）,"add"在C++中可能被修饰为"?add@@YAHHH@Z"
	// 需要在动态库项目中对对应的使用extern "C"防止函数名修饰
    typedef int (*AddFunc)(int, int);
    AddFunc add = (AddFunc)GetProcAddress(hDll, "add");
    
    if (!add) {
        std::cerr << "找不到函数" << std::endl;
        FreeLibrary(hDll);
        return 1;
    }
    
    // 3. 使用函数
    int result = add(5, 3);
    std::cout << "结果: " << result << std::endl;
    
    // 4. 手动卸载
    FreeLibrary(hDll);
    return 0;
}

// Qt示例代码
QLibrary lib("MySharedLib.dll");
if (lib.load()) {
    typedef void (*FuncType)();
    FuncType func = (FuncType)lib.resolve("exportedFunction");
    if (func) {
        func();
    }
    lib.unload();
}
```
#### 隐式链接
隐式链接特点：需要 `.h` ，`.lib`（所有定义和定义实现在 dll 中的地址） 和 `dll`（具体实现）
编译器/链接器的工作：
1. 编译时：从 `.h` 文件中看到add函数声明，但不知道实现
2. 链接时：查看`MyLibrary.lib`，发现add函数在`MyLibrary.dll`中
3. 生成可执行文件时：
   • 不包含add函数的代码
   • 包含一个"导入地址表"（IAT）
   • IAT中包含："调用add时，跳转到 `MyLibrary.dll` 中的地址"
4. 需要 dll 文件和 h 文件，程序在启动时自动加载 dll 文件
```cpp
// 隐式链接示例代码
// MyLibrary.h
#ifdef MYLIB_EXPORTS
    #define MYLIB_API __declspec(dllexport)
#else
    #define MYLIB_API __declspec(dllimport)
#endif

MYLIB_API int add(int a, int b);

// MainApp.cpp
#include "MyLibrary.h"
#include <iostream>

int main() {
    // 直接调用，像使用普通函数一样
    int result = add(5, 3);
    std::cout << "结果: " << result << std::endl;
    return 0;
}
```
### 链接方式区分总结
| 特性       | 隐式链接             | 显式链接                     |
| -------- | ---------------- | ------------------------ |
| **所需文件** | .h + .lib + .dll | 只有.dll                   |
| **加载时机** | 程序启动时自动加载        | 运行时手动加载                  |
| **使用方式** | 直接调用函数/类         | 通过函数指针调用                 |
| **类型检查** | 编译时检查            | 通过程序员仔细检查编码，否则在运行时才能发现错误 |
| **代码提示** | 有（因为有头文件）        | 无                        |
| **适用场景** | 常规C++库           | 插件、跨语言调用                 |
## 动静态库区分
### 动静态概念
#### 静态库
静态库就像买书：
- 你去书店买一本《C++编程指南》
- 把书带回家，放在书架上
- 任何时候想看就直接从书架上拿
- 这本书永远属于你
代码层面：
编译时：把**库的代码（二进制形式）复制到**程序(exe)中
你的程序变大了，但运行时不需要额外的文件，想看书的时候书就在家里（已经在 exe 文件内部），不需要到图书馆（加载 dll 文件）
将项目编译为**静态库时，只会产生 lib 文件**，扩展名：.lib (Windows), .a (Linux/Mac)，需要使用这个库时，只需要 lib 文件和 `.h` 文件（提供接口），没有 `.h` 文件也可以自己通过 dumpin 等工具查看 lib 文件中的符号表然后实现接口，**但这一方法比较困难，通常使用静态库必须使用配套的 `.h` 文件**
只使用静态库的项目最终会被编译为一个 exe 文件，不需要打包 dll 或 lib 文件就能发行
#### 动态库（共享库）
动态库就像借书：
- 你去图书馆借《C++编程指南》
- 把书带回家看
- 看完后还回图书馆
- 其他人也可以借同一本书
代码层面：
编译时：只**在 lib 中记录**"书在图书馆的哪个书架"
运行时：**运行时**去"图书馆"（DLL文件）里找代码执行
动态库编译会产生 lib （导入库，提供定义）和 dll（提供实现） 文件，扩展名：.dll (Windows), .so (Linux), .dylib (Mac)
编译过程：
1. 编译 main. cpp → main. obj
2. 链接 MathLib. lib（注意：这是导入库，不是静态库！）
3. 结果：exe 文件中只记录"add 函数在 MathLib. dll 中"
4. 最终生成：program. exe（很小，不包含 add 函数的代码），需要 MathLib. dll 一起发布
编译为动态库的项目会被编译为多个 lib 和 dll 文件，他们需要一起打包发行，使用动态库的项目，可以只使用 dll 文件（[[#显式链接]]），也可以 `.h` + `.lib` + `.dll` （[[#隐式链接]]）
#### 两种库区分总结
| 特性        | 静态库                    | 动态库/共享库                               |
| --------- | ---------------------- | ------------------------------------- |
| **文件扩展名** | .lib (Win), .a (Linux) | .dll (Win), .so (Linux), .dylib (Mac) |
| **编译时**   | 代码被复制到程序中              | 只记录函数位置信息                             |
| **运行时**   | 不需要额外文件                | 需要DLL/SO文件存在                          |
| **内存使用**  | 每个程序都有自己的副本            | 多个程序共享同一份                             |
| **程序大小**  | 较大（包含库代码）              | 较小（不包含库代码）                            |
| **更新维护**  | 更新需要重新编译程序             | 更新只需替换DLL文件                           |
| **启动速度**  | 快（无需加载DLL）             | 稍慢（需要加载DLL）                           |
| **运行速度**  | 快（代码在本地）               | 稍慢（需要跳转）                              |
| **部署难度**  | 简单（单文件）                | 复杂（需要附带DLL）                           |
| **共享能力**  | 不能共享                   | 可以共享                                  |
| **适用场景**  | 小型工具、嵌入式               | 大型系统、插件架构                             |
使用库时需要**提前知道库的动静态**并使用匹配的连接方式，否则可能会引起**编译器未定义行为，或者能通过编译但是运行时崩溃**
### 各种文件记录的内容
DLL 是共享库的运行时文件，包含：
- 编译后的机器代码（函数、类的实现）
- 导出符号表（导出的函数/类名称和虚拟内存地址）
- 重定位信息（地址重定位表）
- 资源数据（图标、字符串等）
可以通过 dumpin（windows）等工具解析 dll，查看其中的函数/变量/类名称和地址位置

LIB 是导入库（动态），包含：
- 符号名称和序号（函数/类名称）
- DLL 文件名信息
- 桩代码（stub code）或跳转指令
- 重定位信息
LIB （静态）文件完全不同，包含：
- 完整的机器代码（所有函数/类的实现）
- 符号表（所有函数/类名称和地址）
- 重定位信息
静态 LIB 实际上是多个 `.obj/.o` 文件的打包
链接时，所需代码被复制到最终的可执行文件中

动静态库编译的库文件可能都是 lib 文件，但是大小差异很大

# Qt Charts
QtCharts 模块已在 Qt 6.8.0 中弃用（官方文档中说是 6.10 开始的？）用 QGraphs 类替代，并且这一章没什么意义，可以用更方便的 html 实现表格，看看即可
# Qt Data Visuallization
同理
# 多线程
## 使用 QThread 创建多线程程序
### 代码编写
#### 线程执行原理
qt 中的 QThread 线程可以被继承，更方便地处理工作
```cpp
class TDiceThread : public QThread
{
    Q_OBJECT
private:
    int     m_seq=0;        //掷骰子次数序号
    int     m_diceValue;    //骰子点数
    bool    m_paused=true;  //暂停次骰子
    bool    m_stop=false;   //停止线程run()
protected:
    void    run();      //线程的事件循环
public:
    explicit TDiceThread(QObject *parent = nullptr);

    void    diceBegin();    //开始掷骰子
    void    dicePause();    //暂停
    void    stopThread();   //结束线程run()
signals:
    void    newValue(int seq,int diceValue);    //产生新点数的信号
};
```
这个线程接管随机数**在线程中的产生**，继承的作用就是限制和细化这个线程能做的事，封装在类中，使用 `Q_OBJECT` 启用信号槽更方便，run 函数用来控制县程序要做的事（也可以是别的名称），但是类的线程执行状态由**内部管控**，QThread 能用的他也能用
```cpp
void TDiceThread::run()
{//线程的事件循环
    m_stop=false;       //启动线程时令m_stop=false
    m_paused=true;      //启动运行后暂时不掷骰子
    m_seq=0;            //掷骰子次数
    while(!m_stop) {
        if (!m_paused) {
            m_diceValue= QRandomGenerator::global()->bounded(1,7);  //产生随机数[1,6]
            m_seq++;
            emit newValue(m_seq, m_diceValue);  //发射信号
        }
        this->msleep(500);    //线程休眠500ms
    }

    quit();     //相当于exit(0), 退出线程的事件循环
}
```
#### 线程终止方法
在Qt线程编程中，有两种停止线程的方式：
1. **优雅停止**：使用线程类自己的停止方法（如 `stopThread()`），**使用 `stopThread()` 是安全的**，因为：
	- 这是一个**用`户主动操作**，应用程序处于正常运行状态
	- 线程需要时间执行清理操作，`stopThread()`只是设置一个标志，线程需要在`run()`函数中**主动检查**这个标志并退出。这需要时间
	- 主线程可以等待线程完成清理
2. **强制停止**：使用 `terminate()` 强制终止线程，然后执行 `wait()`
	- 立即向操作系统发送"终止线程"的请求，线程会被强制结束（但需要时间），不会执行后续代码
	- **危险**：可能跳过资源释放、文件关闭等，所以需要使用 `wait()` 等待线程完全被关闭（操作系统执行的动作）后**线程资源被回收之前**操作系统执行其它代码可能因为线程仍在占用资源，或者资源被删除，但是线程对象还占用这部分内存，导致内存泄漏
	- 这种方法在关闭窗口时是可以接受的，但是程序运行期间最好使用 `stopThread()`
### 线程的事件循环
**如果线程中的对象需要与Qt的事件系统交互，就必须启动事件循环 （`exec()` 启动）。否则，可以不启动**，线程只是简单的循环和sleep，没有使用信号槽、定时器等Qt异步机制
线程是线程，线程类是线程类，**线程类只是一个方便定义和调整线程工作的一种抽象**，本质上是操作系统资源调度的一个单位，把他封装乘类只是为了**利用 qt 框架的功能更好地设置线程工作而已**

需要启用线程类事件循环的场景
- 线程中需要使用**QTimer**定时器
```cpp
// 示例：线程中的定时任务
class TimerWorker : public QObject {
    Q_OBJECT
public:
    TimerWorker() {
        m_timer = new QTimer(this);
        connect(m_timer, &QTimer::timeout, this, &TimerWorker::onTimeout);
        m_timer->start(1000);  // 每秒触发一次
    }
    
private slots:
    void onTimeout() {
        qDebug() << "定时任务执行中，线程ID:" << QThread::currentThreadId();
    }
    
private:
    QTimer* m_timer;
};

void MyThread::run() {
    TimerWorker worker;
    exec();  // ✅ 必须有事件循环，定时器才能工作
}
```
计时器只能管控当前线程的任务，所以必须在**对应线程中**创建对应的 QTimer 对象，或者通过 `obj.moveToThread(threadObj)` 移动对象到对应线程中
- 线程中需要使用**信号槽**进行通信
```cpp
MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);

    threadA= new TDiceThread(this);
    connect(threadA,&TDiceThread::started, this, &MainWindow::do_threadA_started);
    connect(threadA,&TDiceThread::finished,this, &MainWindow::do_threadA_finished);
}
```
mainwindow 是主线程，TDiceThread 是工作线程，
- 线程中需要使用**QNetworkAccessManager**等异步网络模块
- 线程中需要使用**数据库**操作（通常是异步的）
- 线程需要**持续运行**并响应各种事件
- 实现**工作者对象**（Worker Object）模式
如果要在线程的工作函数中使用 `connect()` 函数，那么需要最后启用 `exec()`，否则 run 执行完后立刻返回，线程对象被销毁，没有启动事件循环，这个线程对象都被销毁了也就没有信号槽这个东西了。其他对象发送到该线程类的信号也就无法受到
```cpp
void MyThread::run() {
    Worker worker;  // worker在这个线程中创建
    
    connect(this, &MyThread::startWork, &worker, &Worker::doWork);
    exec();
}
```
执行事件循环，会被阻塞，直到调用 `quit()` **退出事件循环**线程类才会被销毁, connect 本身没有问题，问题在于线程的生命周期，`emit` 发送信号时，会发生：
1. Qt生成一个"调用请求"（QMetaCallEvent）
2. 将这个事件放入**目标对象所在线程的事件队列**
3. 目标线程的事件循环从队列中取出事件
4. 执行实际的函数调用

## 线程同步
### 线程同步的概念
如果不使用信号槽机制来让主线程读取工作线程的骰子值，就需要这样的代码
```cpp
void TDiceThread::run()
{//线程的事件循环，不断更新m_diceValue
    m_stop=false;
    m_paused=true;
    m_seq=0;
    while(!m_stop) {
        if (!m_paused) {
            m_diceValue=0;
            for(int i=0; i<5; i++)
                m_diceValue += QRandomGenerator::global()->bounded(1,7);
            m_diceValue =m_diceValue/5;
            m_seq++;
        }
        msleep(500);
    }
    quit();     //在  m_stop==true时结束线程任务
}

// 设置m_diceValue getter
int TDiceThread::diceValue() { return = m_diceValue;}
```
但是如果**在主线程中调用 `diceValue` 时，有可能工作线程在 for 循环中**，所以可能会得到脏数据，解决方法是将 for 循环和求平均数的操作设置为一个原子操作，**不可被中断**，线程TDiceThread的计算点数是在函数 `run()` 里执行的，获取点数 `diceValue()` 实际上是在主线程里运行的。
### 线程同步 api
QMutex主要有以下几个函数：
```cpp
void  QMutex::lock()                    //锁定互斥量，一直等待
void  QMutex::unlock()                  //解锁互斥量
bool  QMutex::tryLock()                 //尝试锁定互斥量，不等待
bool  QMutex::tryLock(int timeout)      //尝试锁定互斥量，最多等待timeout毫秒
```
互斥量（QMutex 对象）相当于一把钥匙，如果两个线程要访问同一个共享资源，例如本示例中的变量m_diceValue，就需要通过 `lock()` 或 `tryLock()` 拿到这把钥匙，然后才可以访问该共享资源，访问完之后还要通过 `unlock()` 还回钥匙，这样别的线程才有机会拿到钥匙。