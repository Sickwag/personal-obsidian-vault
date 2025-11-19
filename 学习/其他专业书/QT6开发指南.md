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
	- 设置了代理类的组件**被编辑时**就是调用这个函数
```cpp
QWidget  *QStyledItemDelegate::createEditor(QWidget *parent, const QStyleOptionViewItem &option, const QModelIndex &index) 
```
- setEditorData
	- 定义如何将数据模型中对应 index 位置的数据加载到 `createEditor` 函数创建出的**临时编辑器**中**用来显示**，不至于用户点击编辑之后看到的编辑框中的内容不是空白。
	- 这个函数的默认实现（或者说一般实现）是通过 data 函数 `Qt::UserRole` 用户角色对应的数据
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
