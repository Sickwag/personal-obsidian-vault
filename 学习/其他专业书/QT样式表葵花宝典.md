# 语法
## 基本语法
样式表由一系列的样式规则组成。
- 一条样式规则由一个选择器和一个声明语句组成
- 选择器指明了哪个（或者说是哪种）控件将会受规则影响
- 声明语句则指明了哪些属性会设置到这个（这些）控件
## 选择器
通用选择器
```css
*{属性:值;}
*{font:normal20px“微软雅黑”;}
```
一般用来设置全局字体效果
匹配程序中所有的widgets,效率较低,因此应该尽量减少或者不使用
类型选择器
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