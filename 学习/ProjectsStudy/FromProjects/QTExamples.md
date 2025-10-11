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
# 常规GUI控件
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
**元对象系统由以下三个基础组成：**
- QObject 类是所有使用元对象系统的类的基类。
- 在一个类的 **private 部分声明** `Q_OBJECT` 宏，使得类可以使用元对象的特性，如动态属性、信号与槽。
- MOC (元对象编译器) 为每个 QObject 的子类提供必要的代码来实现元对象系统的特性。构建项目时，MOC 工具读取 C++ 源文件，当它发现类的定义里有 `Q_OBJECT` 宏时，它就会为这个类生成另外一个包含有元对象支持代码的 C++ 源文件，这个生成的源文件连同类的实现文件一起被编译和连接。
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
##### 1. 静态属性
```cpp
QPushButton *button = new QPushButton;
Q0bject *object = button;
object->setProperty("flat", true);
bool isFlat- object->property("flat")
```
静态属性通过宏定义在编译时确定
```cpp
class QPushButton : public QAbstractButton {
    Q_OBJECT
    Q_PROPERTY(bool flat READ isFlat WRITE setFlat) // << 编译期注册
};
```
- **元对象系统注册**：
    - `flat`属性在编译时被编译进`QMetaObject`
    - 可通过`metaObject()->propertyCount()`遍历
- **访问方式**：
    - `property("flat")` → 实际调用`isFlat()`函数
    - `setProperty("flat")` → 实际调用`setFlat()`函数
- **生命周期绑定**：
    - 属性与类定义强绑定，修改类定义需重新编译，无法在运行时创建新的属性，但是可以修改已在编译时确定有的属性
##### 2. 动态属性
运行时添加的属性，不写在 `Q_PROPERTY` 中的属性
- **元对象系统无注册**：
    - 不出现在`QMetaObject::property()`列表中
    - `Q_PROPERTY`声明的静态属性≠动态属性
- **存储结构**：
    - 内部使用`QHash<QString, QVariant>`保存
    - 每次访问需通过字符串哈希查找，性能较低，并且通过字符串查找\创建属性名，在哈希表中查找时**字符串比对会消耗性能**
- **生命周期灵活**：
    - 可以随时添加/删除（如`removeProperty("required")`）
    - 同名动态属性会覆盖静态属性（需注意）
简而言之
- `setProperty("静态属性名", val)` → 会调用`Q_PROPERTY`定义的`WRITE`方法（合法且常见）
- `setProperty("新属性名", val)` → 会添加动态属性（不依赖Q_PROPERTY）
- **优先级陷阱**：动态属性优先级高于静态属性（`property()` 返回动态值，静态属性函数仍返回成员变量）
- 一个对象可以同时存在动静态属性，只是两者的存在方式不同而已

| 属性类型       | 如何定义                    | 存储位置                     | 元对象可见性 |
|----------------|-----------------------------|------------------------------|--------------|
| **静态属性**   | `Q_PROPERTY(...)`           | 类成员变量（如 `bool isStatic`）| ✔️ 元对象系统可枚举           |
| **动态属性**   | `setProperty("name", val)`  | `QObjectPrivate::dynamicProperties`（哈希表） | ❌ 元对象系统不可见        |
机制比较：

| **机制**    | **静态属性**             | **动态属性**                                          |
| --------- | -------------------- | ------------------------------------------------- |
| **存储位置**  | 类成员变量（直接访问）          | `QObjectPrivate::extraData->dynamicProperties`哈希表 |
| **访问路径**  | 编译器直接内联优化（零间接）       | 运行时哈希查找（字符串比较）                                    |
| **调用示例**  | `return this->flat;` | `return d->dynamicProperties["flat"]`             |
| **时间复杂度** | O(1)（直接内存偏移）         | O(1)（但存在哈希计算和字符串比较开销）                             |
| **值类型**   | 固定类型（如`bool flat`）   | 通用容器`QVariant`（需类型转换）                             |
#### qt 宏定义类属性
属性系统还有一个宏Q CLASSINFO0.可以为类的元对象定义“名称-值” 信息
```cpp
class QMyC1ass : public QObject { 
  Q_OBJECT
  Q_CLASSINFO("author", "Wang" )
  Q_CLASSINFO("company", "UPC" )
  Q_CLASSINFO("version "，"3.0.1")
  public:
  ...
}
```
同理，这也是静态属性，会被编译在程序中，访问性能开销极小。可以通过下面代码访问
```cpp
const QMetaObject* meta = m_boy->metaObject();
for (int i = meta->propertyOffset(); i < meta->propertyCount(); i++) {
    QMetaProperty prop = meta->property(i);
    const char* propName = prop.name();
    QString propValue = m_boy->property(propName).toString();
    ui->textEdit->appendPlainText(QString("属性名称=%1， 属性值= %2").arg(propName).arg(propValue));
}
```

## `QString` 在 2 ／8／10／16 进制之间转换
参考 https://xmuli.blog.csdn.net/article/details/100860030
### 基本编码格式
`QString` 使用基于**Unicode码点的UTF-16编码**，而 C++标准中的 char，char\[\] 和 `std::string` 都依赖于本地环境编码，string 甚至没有内建编码方式

| 类型            | 存储本质               | 编码依赖因素               | 典型使用场景           |
| ------------- | ------------------ | -------------------- | ---------------- |
| `char*`       | 连续字节序列             | 系统本地编码（如Windows的GBK） | 与C库交互（如`printf`） |
| `char[]`      | 栈分配的字节数组           | 同上                   | 小型字符串常量          |
| `std::string` | 动态字节容器（支持最小优化如SSO） | **程序员责任编码**（无内建编码）   | 文本处理，但需手动管理编码    |
性能和安全区别

| 操作类型               | `QString` (UTF-16)        | `std::string` (字节流)    | 性能差异（UTF-8 场景）     |
|------------------------|---------------------------|----------------------------|---------------------------|
| 字符串拼接              | O (n)（需重新编码转换）     | O (n)（直接拼接）           | 约慢 30%（转换开销）       |
| 字符索引访问            | O (1)（固定 16 位）           | ❌ 无法安全访问（UTF-8 变长）| 需 `fromUtf8().at(index)` |
| 跨平台文本处理          | ✔️ 一次编码，处处可用        | ❌ 需人工处理编码转换        | 编码安全：`QString` 完胜    |
| 内存占用（中文场景）    | 每字符 2 字节                 | 每字符 3 字节（UTF-8）        | 内存效率：`QString` 更优    |

> ps: C++11 引入了字符串 `u8` 前缀，可以让 string 类型按照 utf-8 编码

### 字符串对象转数字
QString 对象中的各个 to 开头的函数可以实现，并且支持进制转换
```cpp
int QString::toInt(bool *ok = Q_NULLPTR, int base = 10) const
```
整/浮点数转化为String
```cpp
[static] QString QString::number(double n, char format = 'g', int precision = 6)
[static] QString QString::asprintf(const char *cformat, ...)

QString &QString::setNum(float n, char format = 'g', int precision = 6)
```
其中的 format 参数可以按照类型格式化字符

| 格式符   | 形式     | 使用场景                 | 典型输出（n=123.456）    |
| ----- | ------ | -------------------- | ------------------ |
| `'f'` | 固定小数点  | 金额显示（如￥123.45）       | `123.46`（保留2位小数）   |
| `'e'` | 科学计数法  | 极大/极小数（如纳米级浓度）       | `1.23e+02`（保留2位小数） |
| `'E'` | 大写科学计数 | 科学论文格式要求             | `1.23E+02`         |
| `'g'` | 自动优化   | 用户输入显示（智能切换`f`/`e`）  | `123.46`（保留2位有效数）  |
| `'G'` | 大写自动优化 | 工业控制面板（自动切换`f`/`E`）  | `123.46`           |
| `'c'` | 单字符    | ASCII字符转义（如调试UART数据） | `'A'`（当n=65时）      |
to 开头将字符串转换为基本类型，其他用来将字符串格式化，set 开头函数第一个参数基本类型，第二个参数是目标转换进制，返回字符串
```cpp
str = str.setNum(val, 8);         //显示八进制
```

> "**f**是定妆术，**e**是科技范，**g**是聪明人，**c**是ASCII密码"

## QString常用的功能函数的介绍和用法
参考 https://xmuli.blog.csdn.net/article/details/100860030
注意：QString 只要赋值，就在字符串的末尾自动加上“\0”
- `append()` 在字符串后面添加字符串
- `perpend()` 在字符串的前面添加字符串
- `toUpper()` 将字符串的字母全部转换为大写字母
- `toLower()` 将字符串的字母全部转换为大写字母
- `left()` 返回包含字符串中最左 n 个字符的子字符串。如果 n 大于或等于 size () 或小于零，则返回整个字符串。
- `right()` 返回包含字符串中最右 n 个字符的子字符串。如果 n 大于或等于 size () 或小于零，则返回整个字符串。
- `section()` 从字符串中提取以“子字符串”作为分隔符，从 start 到 end 端的字符串
- `simplified()` 不仅去掉字符串的所首尾空格，中间连续的空格也用一个空格替换
- `trimmed()` 去掉字符串首尾的空格
- `isNull()` 判断字符串是否为空。（若是只有“\0”，isNull返回false； 只有未赋值的字符串，isNull返回true）
- `isEmpty()` 判断字符串是否为空.（若是只有“\0”，isEmpty返回true）
```cpp
QString strl,str2=""；
N=str1.isNul1()；     //N=true未赋值字符串变量
N=str2.isNull()；     //N=false只有“\\0”的字符串，也不是Nul1
N=strl.isEmpty();     //N=true
N=str2.isEmpty()；    //N=true
```

## 滑动条QSlider和QAbstractSlider的介绍和用法
参考：[QSlider + QScrollBar + QProgressBar （ 移动条、滚动条 、进度条）的联动_qprogressbar循环滚动-CSDN博客](https://xmuli.blog.csdn.net/article/details/101003081)

![[245c8ae377a072b353ad4d7666e363bc.gif]]

需要注意的是信号槽机制，不同的信号哈数可以发送参数，具体发送参数的含义可以通过查询文档了解
![[Pasted image 20251011193421.png]]
QSlider 的 valueChange 信号会将更改之后的值作为 value 参数发送出去，根据valueChange 的签名可知，它的槽函数必须要接受一个**兼容** int 类型的参数，如果有多个参数，那么顺序也必须要保持一致。

qt 还有循环信号保全机制：当组件的值已经等于要设置的值时不会发出 valueChanged 信号
例如：
- 滑块当前值为 50
- 代码设置 `slider->setValue(50)`
- Qt 检测到值未改变，不会发出信号
- 避免了无限循环
这个组件比较简单，六个 bar 同步更新，所以槽函数可以这样写
```cpp
void bar_collection::on_bar_value_changed(int value) {
	ui.h_slider->setValue(value);
	ui.v_slider->setValue(value);
	ui.h_scroll_bar->setValue(value);
	ui.v_scroll_bar->setValue(value);
	ui.h_progress_bar->setValue(value);
	ui.v_progress_bar->setValue(value);

	bar_value = value;
}
```
如果要区分是哪一个组件调用了 `on_bar_value_change` 函数，可以使用下面的代码区分
```cpp
void bar_collection::on_bar_value_changed(int value) {
	QObject* sender_obj = QObject::sender(); // 获取调用这个函数的对象
	if (sender_obj == ui.v_progress_bar) {
		// code 
	}
	// code
}
```
## QSlider 仪表盘 + QLCD_NUmber 数值显示的介绍及用法
参考：[仪表盘 QSlider + 数值显示 QLCD_NUmber 的介绍及用法_qt slider 显示数字-CSDN博客](https://xmuli.blog.csdn.net/article/details/101003115)
![[20190918200740.gif]]
### QDial属性：
- QDial是仪表盘式的组件，通过旋转表盘获得输入值。QDial的特有的属性包括以下两种。

|       属性       |     含义      |
| :------------: | :---------: |
| notchesVisible | 表盘的小刻度是否可见  |
|  notchTarget   | 表盘刻度间的间隔像素值 |

### QLCDNumber属性：

- QLCDNumber是模拟LCD显示数字的组件，可以显示整数或小数，但就如实际的LCD一样，要设定显示数字的个数。显示整数时，还可以选择以不同进制来显示，如十进制、二进制、十六进制。其主要属性如下。

|        属性         |                                                     含义                                                      |
| :---------------: | :---------------------------------------------------------------------------------------------------------: |
|    digitCount     |                                           显示的数的位数，如果是小数，小数点也算一个数位                                           |
| smallDecimalPoint |                                            是否有小数点，如果有小数点，就可以显示小数                                            |
|       mode        |          数的显示进制，通过调用函数setDecMode）、setBinMode（）、setOctMode）、setHexMode（）可以设置为常用的十进制、二进制、八进制、十六进制格式。          |
|       value       | 返回显示值，浮点数。若设置为显示整数，会自动四舍五入后得到整数，设置为intValue的值。如果smallDecimalPoint=true，设置value时可以显示小数，但是数的位数不能超过digitCount。 |
|     intValue      |                                                  返回显示的整数值                                                   |

若 `smallDecimalPoint==true`，`digitCount==3`，设置 `value=2.36`，则界面上LCDNumber组件会显示为2.4；
若设置 `value=1456.25`，则界面上LCDNumber组件只会显示145。所以，用QLCDNumber作为显示组件时，应注意这些属性的配合。

总之比较简单，根据 ide 提示补全就可以完成
```cpp
void dash_board::on_dial_valueChanged(int value) {
	ui.dial->setValue(value);
	ui.lcd_number_display->display(value);
}
```

## QTimer和QDateTime的讲解和使用
参考：[QTimer和QDateTime的讲解和使用_qdateediter单击弹出-CSDN博客](https://xmuli.blog.csdn.net/article/details/101040841)
![[2883c1621230299f4e6326632434d4e7.gif]]

### 时间日期相关的类：

**时间日期是经常遇到的数据类型，Qt中时间日期类型的类如下。**

- **QTime**：时间数据类型，仅表示时间，如15:2313。
- **QDate**：日期数据类型，仅表示日期，如2017-4-5。
- **QDateTime**:日期时间数据类型，表示日期和时间，如2017-03-230812:43。

Qt 中有专门用于日期、时间编辑和显示的界面组件，介绍如下。

- **QTimeEdit**:编辑和显示时间的组件。
- **QDateEdit**:编辑和显示日期的组件。
- **QDateTimeEdit**：编辑和显示日期时间的组件。
- **OCalendarWidget**:一个用日历形式选择日期的组件。