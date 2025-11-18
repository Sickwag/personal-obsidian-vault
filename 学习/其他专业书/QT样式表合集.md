---
source: 书籍<<qt样式表葵花宝典>> <<qt样式表武林秘籍>>
tutorial link: https://doc.qt.io/qt-6/stylesheet.html#how-style-sheets-work-with-widgets
---
# Qt 样式葵花宝典
## 语法
### 基本语法特性
样式表由一系列的样式规则组成。
- 一条样式规则由一个选择器和一个声明语句组成
- 选择器指明了哪个（或者说是哪种）控件将会受规则影响
- 声明语句则指明了哪些属性会设置到这个（这些）控件
如果 Qt 样式表与设置控件外观的函数（如 [QWidget::setFont](https://doc.qt.io/qt-6/qwidget.html#font-prop) （）或 [QTreeWidgetItem::setBackground](https://doc.qt.io/qt-6/qtreewidgetitem.html#setBackground) （）一起使用在同一小部件上，则当设置冲突时，**样式表将优先**
使用 QPalette 调色 api 设置出的颜色可能会**受到平台 UI 引擎限制让应用看起来尽可能像原生**，而使用 qss 不会。
同理，使用 [QStyle](https://doc.qt.io/qt-6/qstyle.html) 返回的（ [QWidget::style](https://doc.qt.io/qt-6/qwidget.html#style) ）是包装的**平台无关**“样式表”样式，将会由底层绘制器绘制。
### 选择器
#### 通用选择器
```css
*{属性:值;}
*{font:normal20px“微软雅黑”;}
```
一般用来设置全局字体效果
匹配程序中所有的widgets,效率较低,因此应该尽量减少或者不使用
#### 类型选择器
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
#### 类选择器
匹配该类的所有对象,**而不会匹配其派生类**的对象
```css
.QPushButton{color:blue;}
```
#### id 选择器
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
#### 后代选择器
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
#### 子元素选择器
```css
选择器1 >选择器2 {属性:值;}
```
注意只会查找**直接子元素**，不能通过多个 `>` 连接，父子元素都可以使用多种组合器
#### 属性组合器
```css
[attribute=value]{ 属性:值;}
[attribute|=value]{属性:值;} /* 以 value 开头 */
[attribute~=value]{属性:值;} /* 包含value，*/
```
- `~=` 以**全字匹配**方式查找，如果用来查找 `objectName` 属性，就会与[[#属性组合器|属性组合器]]中最好不使用空格分开相矛盾
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
#### 并集选择器
```cpp
选择器1,选择器2,选择器3{属性:值;}
```
将每个单独选择器匹配到的控件放在同一个结果集中, 并给结果集中的每个控件都设置声明语句中的样式，选择器之间不是交集关系
#### 子控件选择器
```css
类型选择器::子控件{属性:值;}
类选择器::子控件{属性:值;}
```
spinbox 由输入框和向上向下两个箭头组成，spinbox （类或者对象）的子控件就有这两个箭头。这和 CSS 伪元素不一样，CSS 的伪元素选择使用 `::` 语法，而 qt 的使用 `:`
#### 伪类选择器
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
## Qss 特性
### 层叠和继承
层叠性：两者[[#优先级|优先级]]相同的情况下，时间上后面加载的样式文件会覆盖前面的
继承性：在典型的 CSS 中，如果一个标签的字体和颜色没有显式设置，它会自动从其父亲获得。当使用 Qt 样式表时，控件不会从其父亲继承字体和颜色的设置

> [!warning]
> 注意父亲，父类这种不同称呼，一个 QDialog 中有两个 QPushButton，dialog 就是 button 的父亲对象。

如果要设置一个控件和其所有**后代**样式，则设置：
```css
qApp->setStyleSheet("QGroupBox,QGroupBox*{color:red;}");
```
### 优先级
#### 常规情况
在 CSS 中，有如下层叠优先级规则：***内联样式>内部样式>外部样式>浏览器缺省***，而在 Qss 中, 这个规则表现为: ***控件直接设置样式 > 最近父控件样式 （间接选中）> 较远父控件样式（间接选中） > QApplication 样式 > 系统默认样式***，qt 中**后面加载的样式文件会覆盖前面的**方式只会在同级别的情况下出现
两者根本区别：
- CSS：基于 DOM 树的继承机制
- Qt：基于选择器匹配的作用域机制

> [!note]
> 一般而言，选择器越特殊，它的优先级越高。也就是选择器指向的越准确，它的优先级就越高。

#### 优先级判断方式
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
## 盒模型
### 主要特性
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

### 属性
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
## Brush 模型介绍
color 属性有多重写法：rgb，rgba，hsv，hsva，需要注意的是 `#rrggbb` 用十六进制表示的颜色，其中 `#6677FF` 这种两个通道之间一样可以简写为 `#67F`
渐变色，zaiqt 中要加上 q 前缀
```cpp
QTextEdit{
	border:2pxsolidred;
	// 线性渐变，从左上角(0,0)开始，到右下角（1,1）结束，渐变过程有三个光圈
	background-color:qlineargradient(
		x1:0, y1:0, x2:1, y2:1,
		stop:0#ace, stop:0.4#f96, stop:1#ace
	);
	// 圆形发散渐变，圆心在左上角，但是焦点在中心(0.5,0.5)，渐变光从焦点向外发散
	background:qradialgradient(
		cx:0,cy:0,radius:1,fx:0.5,fy:0.5,
		stop:0#ace,stop:1#f96
	);
	background:qconicalgradient(
		cx:0.5,cy:0.5,angle:30,
		stop:0#ace,stop:1#f96
	);
	background-clip:margin;
	font:normalnormal30px"微软雅黑";
}
```
光圈就是 powerpoint 中的渐变光圈
![[PixPin_2025-11-18_09-43-44.png]]
![[PixPin_2025-11-18_09-48-04.png]]
## 总结
QSS 只实现了 CSS 2 中的选择器, 并不包含 CSS 3 中新增的选择器
通过阅读 setStyleSheet 源码实现，可以发现：
直接调用控件的 setstylesheet, 结果是每个控件 style 返回的**对象都是不同的** (地址不同），而只给 QApplication 对象 setStyleSheet, 每个控件的 style 函数返回的对象都是相同的。

> [!Note]
> 所以**为了节省资源，维护方便**，都应该有一个 qss 文件来存放所有的样式表，而不应该将 setStyleSheet 写的到处都是。

| QSS 选择器 | 对应的 CSS 选择器 | 区别                                                                                                                                      |
| ------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 通用选择器   | 通用选择器       | 没有区别                                                                                                                                    |
| 类型选择器   | 标签选择器       | 一个选择的是该类型所有的对象，一个选择的是所有该标签，某种程度上是没有区别的                                                                                                  |
| 类选择器    | 类选择器        | QSS 的类选择器中的类名指的是类型名称前加一个(.) 并且一个控件只可能有一个类名，而 CSS 中，类名指的是通过标签的 class 属性指定的类名，一个标签可能有多个类名                                                 |
| ID 选择器  | ID 选择器      | QSS 的选择器中的 id 指的是对象的 objectName，可以重复，而在 CSS 中，ID 是通过便签的 ID 属性设置的，并且同一个页面中是不能存在相同 ID 的元素的                                                |
| 后代选择器   | 后代选择器       | QSS 中，后代关系指的是控件之间的父子关系，而 CSS 中后代关系指的是标签之间的包含关系，也可以理解为父子关系，因此在概念上是相同的                                                                    |
| 子元素选择器  | 子元素选择器      | 在 QSS 中，子元素选择器只能有一级，也就是对于一个控件，只能找到它的子控件，无法找到子控件的子控件，而在 CSS 中，子元素选择器是可以无限延伸下去的                                                           |
| 属性选择器   | 属性选择器       | QSS 的属性指的是用 Q_PROPERTY 定义的属性，CSS 的属性指的是标签的股友属性，而且一般只用于表单标签                                                                              |
| 并集选择器   | 并集选择器       | 没有任何区别                                                                                                                                  |
| 子控件选择器  | 伪元素选择器      | QSS 中子控件选择器的连接符是(::) 而 CSS 伪元素选择器的连接符是(:)，CSS 中的伪元素并不是一个真正的元素，比如一段文字的第一行被当做一个元素，显然它并不是一个 html 元素，而 QSS 中的子控件大多数情况下却是一个真正的控件，也就是一个独立的对象。 |
| 伪类选择器   | 伪类选择器       | 指的都是某种状态下的对象/标签                                                                                                                         |

# Qt 样式表武林秘籍
## 样式表说明
以下内容英文本可以参考![[PixPin_2025-11-18_10-28-52.png]]

| 控件类名           | 说明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QDockWidget    | 支持在停靠时对标题栏和标题栏按钮进行样式设置。<br>停靠窗口的边框可使用 `border` 属性设置样式。`::title` 子控件可用于自定义标题栏。关闭按钮和浮动按钮的位置相对于 `::title` 子控件，分别使用 `::close-button` 和 `::float-button` 设置。<br>当标题栏为垂直方向时，会设置 `:vertical` 伪类。此外，根据 `QDockWidget::DockWidgetFeature`，还会设置 `:closable`、`:floatable` 和 `:movable` 伪状态。<br><br>⚠️ **注意**：请使用 `QMainWindow::separator` 来设置调整大小手柄的样式。<br><br>⚠️ **警告**：当 `QDockWidget` 处于未锁定状态时，样式表无效，因为 Qt 使用原生顶层窗口。<br><br>参见 [Customizing QDockWidget](#) 示例。                                                                                                                                                     |
| QDoubleSpinBox | 参见 `QSpinBox`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| QFrame         | 支持盒模型。<br>参见 [Customizing QCheckBox](#) 示例。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| QColumnView    | 抓取器（grip）可通过 `image` 属性设置样式。<br>箭头指示器可通过 `::left-arrow` 子控件和 `::right-arrow` 子控件设置样式。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| QComboBox      | 组合框周围的边框可使用盒模型设置样式。<br>下拉按钮可通过 `::drop-down` 子控件设置样式。默认情况下，下拉按钮位于部件内边距矩形的右上角。<br>下拉按钮内的箭头标记可通过 `::down-arrow` 子控件设置样式。默认情况下，箭头位于下拉子控件内容矩形的中心。<br>占位符文本的颜色可通过 `placeholder-text-color` 属性设置。<br>参见 [Customizing QComboBox](#) 示例。                                                                                                                                                                                                                                                                                                                                                                           |
| QDateEdit      | 参见 `QSpinBox`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| QDateTimeEdit  | 参见 `QSpinBox`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| QDockWidget    | 支持在停靠时对标题栏和标题栏按钮进行样式设置。<br>自 4.3 版本起，在 `QLabel` 上设置样式表会自动将 `QFrame::frameStyle` 属性设置为 `QFrame::StyledPanel`。<br>参见 [Customizing QLabel](#) 示例（`QLabel` 派生自 `QFrame`）。                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| QLineEdit      | 支持盒模型。<br>选中项的颜色和背景色可通过 `selection-color` 和 `selection-background-color` 属性设置。<br>占位符文本的颜色可通过 `placeholder-text-color` 属性设置。<br>密码字符可通过 `lineedit-password-character` 属性设置样式。<br>密码掩码延迟可通过 `lineedit-password-mask-delay` 属性更改。<br>参见 [Customizing QLineEdit](#) 示例。                                                                                                                                                                                                                                                                                                                                       |
| QListView      | 支持盒模型。<br>当启用交替行颜色时，交替颜色可通过 `alternate-background-color` 属性设置。<br>选中项的颜色和背景色可通过 `selection-color` 和 `selection-background-color` 属性设置。<br>选择行为由 `show-decoration-selected` 属性控制。<br>使用 `::item` 子控件可对列表项进行更精细的控制。<br>参见 [QAbstractScrollArea](#) 以设置可滚动背景。<br>参见 [Customizing QListview](#) 示例。                                                                                                                                                                                                                                                                                                            |
| QListWidget    | 参见 `QListView`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| QMainWindow    | 支持分隔符样式设置。<br>在 `QMainWindow` 中使用 `QDockWidget` 时，分隔符可通过 `::separator` 子控件设置样式。<br>参见 [Customizing QMainWindow](#) 示例。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| QMenu          | 支持盒模型。<br>单个项通过 `::item` 子控件设置样式。除通常支持的伪状态外，`item` 还可设置 `border` 属性。这是因为，默认情况下 `QPushButton` 会绘制一个原生边框，完全覆盖背景色。例如：<br><br>```css<br>QPushButton { background-color: red; border: none; }<br>```<br><br>参见 [Customizing QPushButton](#) 示例。                                                                                                                                                                                                                                                                                                                                                                 |
| QRadioButton   | 支持盒模型。<br>复选指示器可通过 `::indicator` 子控件设置样式。默认情况下，指示器位于部件内容矩形的左上角。<br>`spacing` 属性指定指示器与文本之间的间距。<br>参见 [Customizing QRadioButton](#) 示例。                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| QScrollBar     | 支持盒模型。<br>部件的内容矩形被视为滑块移动的凹槽。`QScrollBar` 的范围（即宽度或高度，取决于方向）可通过 `width` 或 `height` 属性设置。要确定方向，请使用 `:horizontal` 和 `:vertical` 伪状态。<br>滑块可通过 `::handle` 子控件设置样式。设置 `min-width` 或 `min-height` 可为滑块提供尺寸约束。<br>`::add-line` 子控件可用于设置添加行的按钮样式。默认情况下，该子控件位于部件边框矩形的右上角。根据方向，使用 `::right-arrow` 或 `::down-arrow`。<br>`::sub-line` 子控件可用于设置减去行的按钮样式。默认情况下，该子控件位于部件边框矩形的右下角。根据方向，使用 `::left-arrow` 或 `::up-arrow`。<br>`::sub-page` 子控件可用于设置滑块减去页面区域的样式。`::add-page` 子控件可用于设置滑块添加页面区域的样式。<br>参见 [Customizing QScrollBar](#) 示例。                                                                                        |
| QSizeGrip      | 支持 `width`、`height` 和 `image` 属性。<br>参见 [Customizing QSizeGrip](#) 示例。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| QSlider        | 支持盒模型。<br>对于水平滑块，必须提供 `min-width` 和 `height` 属性；对于垂直滑块，必须提供 `min-height` 和 `width` 属性。<br>滑块的凹槽可通过 `::groove` 子控件设置样式。凹槽默认位于部件内容矩形内。<br>滑块的拇指可通过 `::handle` 子控件设置样式。子控件在凹槽内容矩形内移动。<br>参见 [Customizing QSlider](#) 示例。                                                                                                                                                                                                                                                                                                                                                                                      |
| QSpinBox       | 自旋框的边框可通过盒模型设置样式。<br>上按钮和箭头可通过 `::up-button` 和 `::up-arrow` 子控件设置样式。默认情况下，上按钮位于部件内边距矩形的右上角。若未显式设置大小，它将占据其参考矩形高度的一半。上箭头位于上按钮内容矩形的中心。<br>下按钮和箭头可通过 `::down-button` 和 `::down-arrow` 子控件设置样式。默认情况下，下按钮位于部件内边距矩形的右下角。若未显式设置大小，它将占据其参考矩形高度的一半。下箭头位于下按钮内容矩形的中心。<br>参见 [Customizing QSpinBox](#) 示例。                                                                                                                                                                                                                                                                                                              |
| QSplitter      | 支持盒模型。拆分器的手柄可通过 `::handle` 子控件设置样式。<br>参见 [Customizing QSplitter](#) 示例。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| QStatusBar     | 仅支持 `background` 属性。单个项的边框可通过 `::item` 子控件设置样式。<br>参见 [Customizing QStatusBar](#) 示例。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| QTabBar        | 单个标签可通过 `::tab` 子控件设置样式。关闭按钮使用 `::close-button` 子控件。标签支持 `:only-one`、`:first`、`:last`、`:middle`、`:previous-selected`、`:next-selected`、`:selected` 伪状态。<br>`::top`、`::left`、`::right`、`::bottom` 伪状态根据标签方向设置。<br>重叠标签的选中状态可通过负边距或绝对定位方案创建。<br>选项卡撕裂指示器可通过 `::tear` 子控件设置样式。<br><br>Qt TabBar 使用两个 `QToolButton` 作为滚动器，可通过 `QTabBar QToolButton` 选择器设置样式。要指定滚动按钮宽度，请使用 `::scroller` 子控件。<br>选项卡在 `QTabBar` 内部的对齐方式可通过 `alignment` 属性设置。<br><br>⚠️ **警告**：如需更改 `QTabBar` 在 `QTabWidget` 内的位置，请使用 `tab-bar` 子控件（并设置 `subcontrol-position`）。<br><br>参见 [Customizing QTabBar](#) 示例。                             |
| QTabWidget     | 选项卡小部件的边框可通过 `::pane` 子控件设置样式。左右角可通过 `::left-corner` 和 `::right-corner` 子控件设置样式。选项卡栏的位置可通过 `::tab-bar` 子控件控制。默认情况下，子控件在 `QWindowsStyle` 中具有 `QTabWidget` 的位置。要将 `QTabBar` 置于中心，请设置 `tab-bar` 子控件的 `subcontrol-position`。<br>`::top`、`::left`、`::right`、`::bottom` 伪状态根据选项卡方向设置。<br>参见 [Customizing QTabWidget](#) 示例。                                                                                                                                                                                                                                                                                      |
| QTableView     | 支持盒模型。当启用交替行颜色时，交替颜色可通过 `alternate-background-color` 属性设置。<br>选中项的颜色和背景色可通过 `selection-color` 和 `selection-background-color` 属性设置。<br>QTableView 中的角部控件实现为 `QAbstractButton`，可通过 `"QTableView QTableCornerButton::section"` 选择器设置样式。<br><br>⚠️ **警告**：如果你只为 `QTableCornerButton` 设置了 `background-color`，除非你设置了 `border` 属性，否则背景可能不会显示。这是因为，默认情况下 `QTableCornerButton` 会绘制一个原生边框，完全覆盖背景色。<br><br>网格线颜色可通过 `gridline-color` 属性指定。<br>参见 [QAbstractScrollArea](#) 以设置可滚动背景。<br>参见 [Customizing QTableView](#) 示例。                                                                                             |
| QTableWidget   | 参见 `QTableView`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| QTextEdit      | 支持盒模型。<br>选中文本的颜色和背景色可通过 `selection-color` 和 `selection-background-color` 属性设置。<br>占位符文本的颜色可通过 `placeholder-text-color` 属性设置。<br>参见 [QAbstractScrollArea](#) 以设置可滚动背景。                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| QTimeEdit      | 参见 `QSpinBox`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| QToolBar       | 支持盒模型。<br>`::top`、`::left`、`::right`、`::bottom` 伪状态根据工具栏所在的区域设置。<br>`::first`、`::last`、`::middle`、`::only-one` 伪状态指示工具栏在一行组中的位置（参见 `QStyleOptionToolBar::positionWithinLine`）。<br>工具栏的分隔符通过 `::separator` 子控件设置样式。<br>手柄（用于移动工具栏）通过 `::handle` 子控件设置样式。<br>参见 [Customizing QToolBar](#) 示例。                                                                                                                                                                                                                                                                                                                |
| QToolButton    | 支持盒模型。<br>如果 `QToolButton` 是菜单按钮，则 `::menu-indicator` 子控件可用于设置指示器样式。默认情况下，菜单指示器位于部件内边距矩形的右下角。<br>如果 `QToolButton` 处于 `QToolButton::MenuButtonPopup` 模式，则 `::menu-button` 子控件用于绘制菜单按钮，`::menu-arrow` 子控件用于绘制菜单按钮内的菜单箭头。默认情况下，它位于菜单按钮内容矩形的中心。<br>当 `QToolButton` 显示箭头时，使用 `::up-arrow`、`::down-arrow`、`::left-arrow` 和 `::right-arrow` 子控件。<br><br>⚠️ **警告**：如果你只为 `QToolButton` 设置了 `background-color`，除非你设置了 `border` 属性，否则背景可能不会显示。这是因为，默认情况下 `QToolButton` 会绘制一个原生边框，完全覆盖背景色。例如：<br><br>```css<br>QToolButton { background-color: red; border: none; }<br>```<br><br>参见 [Customizing QToolButton](#) 示例。 |
| QToolTip       | 支持盒模型。`opacity` 属性控制提示框的不透明度。<br>参见 [Customizing QFrame](#) 示例（`QToolTip` 是 `QFrame` 的子类）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| QTreeView      | 支持盒模型。当启用交替行颜色时，交替颜色可通过 `alternate-background-color` 属性设置。<br>选中项的颜色和背景色可通过 `selection-color` 和 `selection-background-color` 属性设置。<br>选择行为由 `show-decoration-selected` 属性控制。<br>树视图的分支可通过 `::branch` 子控件设置样式。`::branch` 子控件支持 `:open`、`:closed`、`:has-sibling` 和 `:has-children` 伪状态。<br>使用 `::item` 子控件可对树视图中的项进行更精细的控制。<br>参见 [QAbstractScrollArea](#) 以设置可滚动背景。<br>参见 [Customizing QTreeView](#) 示例以设置分支样式。                                                                                                                                                                                             |
| QTreeWidget    | 参见 `QTreeView`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| QWidget        | 仅支持 `background`、`background-clip` 和 `background-origin` 属性。<br>如果你从 `QWidget` 派生自定义部件，你需要为你的自定义 `QWidget` 提供一个 `paintEvent`，如下所示：<br><br>```cpp<br>void CustomWidget::paintEvent(QPaintEvent *)<br>{<br>    QStyleOption opt;<br>    opt.initFrom(this);<br>    QPainter p(this);<br>    style()->drawPrimitive(QStyle::PE_Widget, &opt, &p, this);<br>}<br>```<br><br>如果没有设置样式表，上述代码是一个空操作。<br><br>⚠️ **警告**：请确保为你的自定义部件定义 `Q_OBJECT` 宏。                                                                                                                                                                 |

子控制器，即每一个控件可以通过 `::` 选中什么子控件，可以在 qt 文档的 List of Sub-Controls 一章查找。比如 `QSpinBox` 的上下箭头用 `QSpinBox::indicator` 选中
## 实战章节
#未完成
由于文档不能复制文字，图片比较模糊，并且有 qt 4-5 的代码，暂时搁置。如果找到源文档再来学习