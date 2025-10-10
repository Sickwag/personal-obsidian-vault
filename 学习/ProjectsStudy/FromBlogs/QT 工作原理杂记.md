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
Designer使用了pimpl手法，pImpl手法主要作用是解开类的使用接口和实现的耦合，即为了减少各个源文件之间的联系