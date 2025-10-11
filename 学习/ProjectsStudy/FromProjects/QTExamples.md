---
source: https://github.com/XMuli/QtExamples
crea: 2025年10月11日09:56:36
---
# QT生成原理和运行机制
## Make、Makefile、Cmake、QMake 的区别 
参考 [Make、Makefile、Cmake、QMake 的区别](https://xmuli.blog.csdn.net/article/details/98170236)
## Qt 中 namespace Ui { class Widget； } 解析
参考：[Qt 编程中 namespace Ui { class Widget； } 解析_namespace ui { class widget; }-CSDN博客](https://xmuli.blog.csdn.net/article/details/98122981)
### 问题背景
很多项目，包括创建空白 qt 项目时，都会创建的默认的类中，存在这样一段代码
```cpp
namespace Ui { 
	class widget; 
} 
```
导致如果要使用 widget 类所对应的 ui 文件，就需要 `#include "ui_widget.h"` 文件，并且使用 ui 文件中的组件时，需要使用 `ui->component`
### 原因分析
Designer使用了 [[C++开发范式#PImpl (Pointer to Implementation)|pimpl手法]]，pImpl手法[[C++开发范式#qt 的 d-pointer 模式|在 qt 中的主要作用]] 是解开类的使用接口和实现的耦合，即为了减少各个源文件之间的联系。可以参考链接

## moc 的元对象和属性的用法
标题太长简化，参考[元对象系统moc(Meat-Object System)的对象MetaObject和(含动态)属性Propert的用法_metaobject 判断 有无该字段-CSDN博客](https://xmuli.blog.csdn.net/article/details/105925608)
### 元对象功能
Qt 的元对象系统 (`Meta-Object System`) 提供了：
- 对象之间通信的信号与槽机制
- 运行时类型信息和动态属性系统。
- 一些简单的反射机制，`obj->metaObject()->className()` 返回类名字符串
- `QMetaOjct::newInstance()`函数创建类的一个新的实例。
- `QObjct:inherits(const char *className)` 函数判断一个对象实例是否是名称为 className 的类或 QObject 的子类的实例。类似
```cpp
QTimer *timer = new QTimer;  // OTimer是oobject的子类
timer->inherits ("QTimer");  //返回true
timer->inherits ("QObject");  //返回true
timer->inherits ("QAbstractButton");//返回false. 不是QAbatractButton的子类
```
- `QObject::tr()` 和 `Qbjet::trUtf8()` 函数可翻译字符串，用于多语言界面设计。
- `QObjct:setProperty()` 和 `Q0bjct:property()` 函数通过属性名称动态设置和获取属性值。
- 专门为 QObject 对象设计的动态投射（`qobject_cast`），拓展于 `dynamic_cast`，[[from Official tutorial#QT 框架中的 qobject_cast|参考]]
### 元对象属性
#### qt 宏定义对象属性
```cpp
Q_PROPERTY(type name
             (READ getFunction [WRITE setFunction] |
              MEMBER memberName [(READ getFunction | 
              WRITE setFunction)])
             [RESET resetFunction]
             [NOTIFY notifySignal]
             [REVISION int]
             [DESIGNABLE bool]
             [SCRIPTABLE bool]
             [STORED bool]
             [USER bool]
             [CONSTANT]
             [FINAL])
```
- 方便的属性设置，不管是否用READ和WRITE定义了接口函数，只要知道属性名称就可以通过`QObjct:property()`读取属性值，并通过`QObject:setProperty()`设置属性值
```cpp
// 静态属性
QPushButton *button = new QPushButton;
Q0bject *object = button;
object->setProperty("flat", true);
bool isFlat- object->property("flat")
```
#### 元对象类属性
Qt提供一个Q PROPERTY0宏可以定义属性，它也是基于元对象系统实现的。Qt 的属性系統与C++编译器无管，可以用任何柝准的C++编译器定义属性的Qt C++程序。
- 在QObijct的子奬中，用宏Q PROPERTYO定文属性
**元对象系统由以下三个基础组成：**
- QObject类是所有使用元对象系统的类的基类。
- 在一个类的private部分声明 `Q_OBJECT` 宏，使得类可以使用元对象的特性，如动态属性、信号与槽。
- MOC (元对象编译器)为每个 QObject 的子类提供必要的代码来实现元对象系统的特性。构建项目时，MOC工具读取 C++ 源文件，当它发现类的定义里有 `Q_OBJECT` 宏时，它就会为这个类生成另外一个包含有元对象支持代码的 C++ 源文件，这个生成的源文件连同类的实现文件一起被编译和连接。