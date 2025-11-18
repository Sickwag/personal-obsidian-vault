---
sour: 书籍<<qt样式表葵花宝典>> <<qt样式表武林秘籍>>
tutorial link: https://doc.qt.io/qt-6/stylesheet.html#how-style-sheets-work-with-widgets
---

# 语法
## 基本语法特性
样式表由一系列的样式规则组成。
- 一条样式规则由一个选择器和一个声明语句组成
- 选择器指明了哪个（或者说是哪种）控件将会受规则影响
- 声明语句则指明了哪些属性会设置到这个（这些）控件
如果 Qt 样式表与设置控件外观的函数（如 [QWidget::setFont](https://doc.qt.io/qt-6/qwidget.html#font-prop) （）或 [QTreeWidgetItem::setBackground](https://doc.qt.io/qt-6/qtreewidgetitem.html#setBackground) （）一起使用在同一小部件上，则当设置冲突时，**样式表将优先**
使用 QPalette 调色 api 设置出的颜色可能会**受到平台 UI 引擎限制让应用看起来尽可能像原生**，而使用 qss 不会。
同理，使用 [QStyle](https://doc.qt.io/qt-6/qstyle.html) 返回的（ [QWidget::style](https://doc.qt.io/qt-6/qwidget.html#style) ）是包装的**平台无关**“样式表”样式，将会由底层绘制器绘制。
## 选择器
### 通用选择器
```css
*{属性:值;}
*{font:normal20px“微软雅黑”;}
```
一般用来设置全局字体效果
匹配程序中所有的widgets,效率较低,因此应该尽量减少或者不使用
### 类型选择器
```css
类名{属性:值;}
```
类名会通过 `QObject::metaObject()::className()` 获取，匹配所有该类和他的**派生对象**，这与后面介绍的子控件选择器相冲突
这里有一个问题：**当自定义控件在命名空间之中 (或它是一个嵌套类)，`QObject::className()` 会返回 (::)**,
为了解决这个问题，当为命名空间中 widget 使用类型选择器时, 我们必须将” ::”替换成” --”
```cpp
namespacens{
	classMyPushButton:publicQPushButton{
		//...
	}
}
// ...
qApp->setStyleSheet("ns--MyPushButton{background:yellow;}");
```
### 类选择器
匹配该类的所有对象,**而不会匹配其派生类**的对象
```css
.QPushButton{color:blue;}
```
### id 选择器
```css
#id{属性:值;}
```
qt 控件没有 id 属性，但是所有 QObject 及其派生类都有 `objectName` 属性，**原则上全局唯一的**，匹配所有objectName为ID选择器所指定的名称的对象，如果前面有类型名称还会筛选对象的类型
需要注意：
注意点:
1. objectName 是大小写敏感的.
2. “#”与 ID 之间不可以有空格
3. 由于 objectName 是所有 QObject 类对象的一个属性，在运行过程中可以改变，所以一般情况下，要使用 ID 选择器时，保证 objectName 不要在运行时被改变，否则**重新加载 stylesheet 文件/字符串**时，对应的 ID 选择器将不会匹配到原来的控件。
4. 由于 objectName 允许字符串中含有空格，但是 ID 选择器中，ID 是从紧跟`#`后的第一个字符开始直到遇到空格或 “{”之间的字符串，**因此，如果是为了使用 ID 选择器而设置 objectName，则 objectName 中不能含有空格**
5. 由于任何对象的 objectName 都可以出现重复，保证唯一性是**开发者的责任**
6. Qt 官方给出的 ID 选择器的格式为: `类名#id {属性: 值;}`（在 CSS 中被称为交集选择器），在正式开发中，还是建议加上类名，因为这样可以看出这个 id 选择器所匹配的对象的类型，有利于提高阅读性.
保证名称唯一性的方法：
- 命名约定：
```cpp
// 使用层次化命名
btn1->setObjectName("mainWindow.loginDialog.submitButton");
btn2->setObjectName("mainWindow.settingsDialog.submitButton");
```
- 动态生成名称编码
```cpp
// 使用计数器或唯一标识符
static int buttonCounter = 0;
QString uniqueName = QString("button_%1").arg(++buttonCounter);
button->setObjectName(uniqueName);
```
- UUID
```cpp
#include <QUuid>

QString uniqueName = QUuid::createUuid().toString();
button->setObjectName(uniqueName);
```
### 后代选择器
```css
祖先选择器 后代选择器 { 属性: 值; }
```
在选择器1匹配的所有对象中，找到选择器2所匹配的所有后代对象,并给它们设置样式
本质上是在**从左到右一步步减小范围**
- 后代可以是儿子，孙子，重孙子，**任意深度的后代**元素都会被匹配
- 嵌套的后代选择器可以是**任意形式，id 选择，类选择，类型选择，状态选择**
```css
/* 组合选择 */
/* 选择 MainForm 中的提交按钮 */
QWidget#mainForm QPushButton#submitBtn {
    background-color: green;
}

/* 选择 SettingsDialog 中的取消按钮 */
QDialog#settingsDlg QPushButton#cancelBtn {
    background-color: red;
}
/* 多级嵌套 */
QMainWindow QWidget QPushButton {
    font-size: 16px;
    font-weight: bold;
}
```
> [!Warning]
> 后代选择器的匹配方向**是从右向左，不是从左向右**

![[PixPin_2025-11-17_20-42-46.png|给两个输入框添加一个蓝色边框]]
这两种写法看起来没问题：
```css
QDialogQComboBox,QLineEdit{
	border:1pxsolidblue;
}
QDialog>QComboBox,QLineEdit{
	border:1pxsolidblue;
}
```
但是会导致所有 Lineedit 都添加边框，所以正确的方法是：
```css
QDialogQComboBox,QDialogQLineEdit{
	border:1pxsolidblue;
}
QDialog>QComboBox,QDialog>QLineEdit{
	border:1pxsolidblue;
}
```
### 子元素选择器
```css
选择器1 >选择器2 {属性:值;}
```
注意只会查找**直接子元素**，不能通过多个 `>` 连接，父子元素都可以使用多种组合器
### 属性组合器
```css
[attribute=value]{ 属性:值;}
[attribute|=value]{属性:值;} /* 以 value 开头 */
[attribute~=value]{属性:值;} /* 包含value，*/
```
- `~=` 以**全字匹配**方式查找，如果用来查找 `objectName` 属性，就会与[[#属性组合器]]中最好不使用空格分开相矛盾
- 属性匹配会同时匹配[[QTExamples#2. 动态属性|动态属性]] 和[[QTExamples#1. 静态属性|静态属性]]，id 选择器只会匹配到静态属性 `objectName`
```cpp
class MyWidget : public QWidget {
    Q_PROPERTY(QString status READ status WRITE setStatus)
    // ...
};

MyWidget *widget = new MyWidget;
widget->setStatus("normal");          // 设置静态属性
widget->setProperty("status", "override"); // 设置动态属性
```
一个属性同时是动静态属性时，动态属性优先级在样式表中高于静态属性
### 并集选择器
```cpp
选择器1,选择器2,选择器3{属性:值;}
```
将每个单独选择器匹配到的控件放在同一个结果集中, 并给结果集中的每个控件都设置声明语句中的样式，选择器之间不是交集关系
### 子控件选择器
```css
类型选择器::子控件{属性:值;}
类选择器::子控件{属性:值;}
```
spinbox 由输入框和向上向下两个箭头组成，spinbox （类或者对象）的子控件就有这两个箭头。这和 CSS 伪元素不一样，CSS 的伪元素选择使用 `::` 语法，而 qt 的使用 `:`
### 伪类选择器
```qss
QPushButton:hover{color:white}
```
`:` 可以连接，连接关系词是 and
`:!` 可以取反
`,` 连接不同选择器表示或
```css
QCheckBox:hover:checked{color:white} /* and */
QComboBox::drop-down:hover{image:url(dropdown_bright.png)} /* or */
```
# Qss 特性
## 层叠和继承
层叠性：两者[[#优先级|优先级]]相同的情况下，时间上后面加载的样式文件会覆盖前面的
继承性：在典型的 CSS 中，如果一个标签的字体和颜色没有显式设置，它会自动从其父亲获得。当使用 Qt 样式表时，控件不会从其父亲继承字体和颜色的设置

> [!warning]
> 注意父亲，父类这种不同称呼，一个 QDialog 中有两个 QPushButton，dialog 就是 button 的父亲对象。

如果要设置一个控件和其所有**后代**样式，则设置：
```css
qApp->setStyleSheet("QGroupBox,QGroupBox*{color:red;}");
```
## 优先级
### 常规情况
在 CSS 中，有如下层叠优先级规则：***内联样式>内部样式>外部样式>浏览器缺省***，而在 Qss 中, 这个规则表现为: ***控件直接设置样式 > 最近父控件样式 （间接选中）> 较远父控件样式（间接选中） > QApplication 样式 > 系统默认样式***，qt 中**后面加载的样式文件会覆盖前面的**方式只会在同级别的情况下出现
两者根本区别：
- CSS：基于 DOM 树的继承机制
- Qt：基于选择器匹配的作用域机制

> [!note]
> 一般而言，选择器越特殊，它的优先级越高。也就是选择器指向的越准确，它的优先级就越高。

### 优先级判断方式
间接判断
Qt 5.7 及以上版本, 程序中给 QApplication 对象设置了 `Qt::AA_UseStyleSheetPropagationInWidgetStyles` 属性时, 才会有间接选中。
直接选中：后来居上，层叠样式
不同选择器：Id>类>类型>通配符>继承>默认
计算方式：**没有太大必要记住**
只有选择器是直接选中控件时才需要计算权重，否则直接选择器高于一切间接选中的选择器优先级权重的计算方式: 
1. 计算选择器中的 id 选择器数量`[=a]`
2. 计算选择器中类选择器的数量+属性选择器的数量`[=b]`
3. 计算选择器中类型选择器的数量`[=c]`
4. 忽略子控件选择器串联这三个数字 a-b-c 就得到优先级权重, 数字越大优先级越高.
说到底就是**比谁更具体**
有一个有意思的例子：
```css
QPushButton{color:red;}
QAbstractButton{color:gray;}
```
qss 语法中不看继承（因为如果是自定义类之间设置样式需要检查继承关系**需要重新检查所有类的关系，相当于重新编译一遍获取符号表**，太费时间），而是认为**所有类型相同的选择器**之间不存在谁比谁更具体的优先级
为确定规则的特殊性，Qt样式表跟随CSS2规范，一个选择器的特殊性由下面的方式计算：-计算选择器中ID属性的数量`[=a]`
- 计算选择器中其他属性和伪类的数量 `[=b]`
- 计算选择器中元素名字的数量`[=c] `
- 忽略伪原素`[如:subcontrol]`串联这三个数字a-b-c（在一个大基数的数字系统）就得到了特殊性等级。举个例子：

```
* {}/*a=0b=0c=0->specificity=0*/
LI{}/*a=0b=0c=1->specificity=1*/
ULLI{}/*a=0b=0c=2->specificity=2*/
ULOL+LI{}/*a=0b=0c=3->specificity=3*/
```
# 盒模型
## 主要特性
盒模型仅仅是一个形象的比喻, 所有的 widget 都被看做是一个”盒子”，一个盒子包括：外边距，边框，内边距，和实际内容，它们可以看作是有包含关系的矩形, 并且**这种包含关系是固定不变的**
```md
┌─────────────────────────────────┐
│           margin                │
│  ┌─────────────────────────┐    │
│  │         border          │    │
│  │  ┌─────────────────┐    │    │
│  │  │     padding     │    │    │
│  │  │  ┌───────────┐  │    │    │
│  │  │  │  content  │  │    │    │
│  │  │  └───────────┘  │    │    │
│  │  └─────────────────┘    │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```
- Margin（外边距）-与其他盒子之间的距离.
- Border（边框）-外边距与内边距之间的区域. 边框有自己的颜色不会受到盒子的背景颜色影响
- Padding（内边距）-内容和边框之间的区域. 会受到背景颜色影响.
- Content（内容）-盒子的内容, 显示文本, 图像或其他控件

> [!note]
> 如果为一个控件设置背景图，默认会从 border 的内边缘开始显示，可以通过 `background-clip` 属性设置

![[PixPin_2025-11-17_21-42-23.png]]
background-clip 不同设置
![[PixPin_2025-11-17_21-44-05 2.png]]
![[PixPin_2025-11-17_21-44-05.png]]

## 属性
background-repeat:
- repeat-x: 在水平方向上平铺 repeat-y：在垂直方向上平铺
- repeat: 在水平和垂直方向上都平铺，这是默认值 (但是 Qt 好像有 bug，设置了 repeat 反而不会平铺，不设置才平铺)
- no-repeat: 不平铺
设置背景图片在容器内的**重复排列方式**
![[PixPin_2025-11-17_21-46-00.png]]
background-origin 
取值: 与 background-clip 一样
作用: 与 background-position 和 background-image 一起使用, 指明背景图片的覆盖范围矩形, 如果没有指定, 默认为 padding
![[PixPin_2025-11-17_21-46-24.png]]

属性值支持连写
```css
/* 语法background:color image repeat position; */
QTextEdit{
	background:skyblueurl(:/resource/girl.jpg)repeatlefttop;
}
```
基本的属性用法语法就这些，~~自己写的时候还得查文档~~
