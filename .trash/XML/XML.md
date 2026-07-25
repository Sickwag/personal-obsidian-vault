# 菜鸟教程基础
参考教程：[XML 教程 | 菜鸟教程](https://www.runoob.com/xml/xml-tutorial.html)
[DTD 教程 | 菜鸟教程](https://www.runoob.com/dtd/dtd-tutorial.html)
[XSLT 教程 | 菜鸟教程](https://www.runoob.com/xsl/xsl-tutorial.html)
## 基本知识
### 数据传输标记语言
- XML 指可扩展标记语言（EXtensible Markup Language）。
- XML 是一种很像HTML的标记语言。
- XML 的设计宗旨是传输数据，而不是显示数据（所以不能像 html，Javascript 一样使用浏览器查看格式化的数据）**焦点是数据的内容**，HTML 被设计用来显示数据，其**焦点是数据的外观**。
- XML 标签没有被预定义。您需要自行定义标签。
- XML 被设计为具有自我描述性。
- XML **不会做任何事情**。XML 被设计用来结构化、存储以及传输信息
- **XML 是独立于软件和硬件的信息传输工具**，在大多数 Web 应用程序中，XML 用于传输数据，而 HTML 用于格式化并显示数据，两者只是分工不同
- XML 作用类似于将不同种数据、文件放入一个统一的“盒子”中，在另一个文件需要时直接调用 xml 中存储这中数据的部分即可，不需要在源文件中改动、定义它的使用方式

### XML 标签
```xml
<note>
<to>Tove</to>
<from>Jani</from>
<heading>Reminder</heading>
<body>Don't forget me this weekend!</body>
</note>
```

^c6tjuo

- 上面的这条便签具有自我描述性。它包含各种信息，但没有说明如何显示他们
- 实例中标签没有在任何 XML 标准中定义过（比如 `<to>` 和 `<from>`）。这些标签是由 XML 文档的创作者发明的。可以自定义它们的语义
- **XML 是对 HTML 的补充。**

> 所有的 XML 元素一般都有一个关闭标签，但也允许单标签的使用

```xml
<elementName attribute="value" />
<!--equals to-->
<exampleTag></exampleTag>
```

> 一个文档中**同级别的标签**必须唯一，如果有多个元素具有相同的标签名称，它们可以通过属性或在不同的层次结构中来区分。可以通过定义标签元素的属性值来区分标签，标签名称属性一定要使用 `‘’` 或者 `“”` 括起

```xml
<books>
    <book id="1">
    <title>XML 基础</title>
    <author>赵六</author>
    </book>
    <book id="2">
    <title>XML 应用</title>
    <author>孙七</author>
    </book>
</books>
```

> 属性通常提供不属于数据组成部分的信息。在下面的实例中，文件类型与数据无关，但对需要处理这个元素的软件来说却很重要：

- `<file type="gif",file_size="3.2MB">computer.gif</file>`，软件通过读取标签的某一个属性辅助读取文件内容
- 如果不是同名元素，应该尽量避免使用属性。如果信息感觉起来很像数据，那么请使用元素
- 属性不能包含多个值（元素可以）
- 属性不能包含树结构（元素可以）
- 属性不容易扩展（为未来的变化）
**不要做这样的蠢事（这不是 XML 应该被使用的方式）**：

```xml
<note day="10" month="01" year="2008"
to="Tove" from="Jani" heading="Reminder"
body="Don't forget me this weekend!">
</note>
```

元数据（有关数据的数据）应当存储为属性，而数据本身应当存储为元素。

> xml 中特殊符号必须被转义

- 如 `<>` 左右尖括号和 `/` 因他们被用于标签
- `？` 被用于预处理，如 XML 声明

### XML 树结构
一个 XML 文档一般在第一行写 XML 声明
`<?xml version="1.0" encoding="UTF-8"?>` 声明本文件是一个 xml 和它使用的版本和编码，如果省略则使用编译器默认，并不是必须的
上面的 `<note>`，`<books>` 都是根标签，每个文件必须包含至少一对

### 语法规则
#### 符号注意
> 把字符 "<" 放在 XML 元素中，会发生错误，这是因解析器会把它当作新元素的开始。

```xml
<message>if salary < 1000 then</message>		<!--wrong-->
<message>if salary &lt; 1000 then</message>
```
将容易混淆的字符使用*实体引用*的方式（类似与一种*转义*）使用可以避免冲突，XML 有 5 个预定义实体引用

| \&lt;   | <   | less than      |
| ------- | --- | -------------- |
| \&gt;   | >   | greater than   |
| \&amp;  | &   | ampersand      |
| \&apos; | '   | apostrophe     |
| \&quot; | "   | quotation mark |

> 只有字符 "<" 和 "&" 确实是非法的。大于号是合法的，但用实体引用来代替它是好习惯。
> XML 会将多个空格合并为 1 个，但标签之间的文档不会删除空格
> 在 Windows 应用程序中，换行通常以一对字符来存储：回车符（CR）和换行符（LF）。
> 在 Unix 和 Mac OSX 中，使用 LF 来存储新行。
> 在旧的 Mac 系统中，使用 CR 来存储新行。
> XML 以 **LF** 存储换

#### 命名规范
- 名称可以包含字母、数字以及其他的字符
- 名称不能以数字或者标点符号开始
- 名称不能以字母 xml（或者 XML、Xml 等等）开始
- 名称不能包含空格
- 可使用任何名称，没有保留的字词

#### XML 元素是可拓展的
就像下面代码，如果该 XML 文件被整个使用，如果添加注释行进入 XML 中并不会导致程序崩溃
![[#^c6tjuo|这就是可拓展性]]
这就是可拓展性

#### 美化 XML
- 使用 CSS 来格式化 XML 文档是有可能的，但并不常用，W3C 推荐使用 XSLT，通过它可以使 XML 文档转换为 HTML
- XSLT（eXtensible Stylesheet Language Transformations）远比 CSS 更加完善。
- XSLT 是在浏览器显示 XML 文件之前，先把它转换为 HTML：