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
