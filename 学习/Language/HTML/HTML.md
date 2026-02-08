参考教程：[HTML 教程 | 菜鸟教程](https://www.runoob.com/html/html-tutorial.html)
[HTML 标签列表(字母排序) | 菜鸟教程](https://www.runoob.com/tags/html-reference.html)
## HTML 基础
### 初识 HTML
HTML 是一种超文本标记语言，可使用下面两种后缀，没有区别，都可以使用
- .html
- .htm
#### html 标签和元素
![[Pasted image 20241123103135.png]]
![[Pasted image 20241123103149.png]]
*XML 是一种很像 HTML 的语言*[[XML#语法规则]]
`<!DOCTYPE>` 声明
`<!DOCTYPE>`声明有助于浏览器中正确显示网页。
网络上有很多不同的文件，如果能够正确声明HTML的版本，浏览器就能正确显示网页内容。
doctype 声明是不区分大小写的
如果使用中文编码，需要在头部将字符声明为 `utf-8`，如果使用 `<meta charset="utf-8" />`
出现乱码原因是编译器在保存编码时与 meta 标签中方式不一致，写 `<!doctype html>`，就是为了防止浏览器的怪异模式，强制浏览器按照标准模式渲染网页！*
大多数标签都支持下面的 html 属性

|属性|描述|
|:--|:--|
|class|为html元素定义一个或多个类名（classname）(类名从样式文件引入)|
|id|定义元素的唯一id|
|style|规定元素的行内样式（inline style）|
|title|描述了元素的额外信息 (作为工具条使用)|

---
```html
通用声明
HTML5
<!DOCTYPE html>
HTML 4.01
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
"http://www.w3.org/TR/html4/loose.dtd">
XHTML 1.0
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
```
#### 常见 html 标签和属性
##### 属性、标签、属性速查
常用标签： [HTML 速查列表 | 菜鸟教程](https://www.runoob.com/html/html-quicklist.html)
标签全名：[HTML 标签简写及全称 | 菜鸟教程](https://www.runoob.com/html/html-tag-name.html)

##### 固定搭配标签和属性
1. `<html>`
- **作用**: 定义HTML文档的根元素，所有其他元素都嵌套在这个标签内。
- **常用属性**:
    - `lang`: 指定文档的语言（如 `en` 为英语，`zh` 为中文）。
```html
<html lang="en">
```
5. `<meta>`
- **作用**: 定义文档的元数据。
- **常用属性**:
    - `charset`: 设置字符编码（如 `UTF-8`）。
```html
<meta charset="UTF-8">
```
    - `name`: 指定元数据的名称（如 `viewport`、`description`）。
    - `content`: 提供与 `name` 对应的内容。
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
6. `<link>`- **作用**: 链接外部资源，如样式表。
- **常用属性**:
    - `rel`: 指定链接的关系（如 `stylesheet`）。
    - `href`: 指定资源的URL。
```html
<link rel="stylesheet" href="styles.css">
```
7. `<script>`
- **作用**: 包含或链接到脚本（如JavaScript）。
- **常用属性**:
    - `src`: 指定脚本文件的URL。
    - `type`: 指定脚本的类型（如 `text/javascript`）。
```html
<script src="script.js" type="text/javascript"></script>
```
8. `<div>`
- **作用**: 定义文档中一个块级元素，用于分组内容。
- **常用属性**:
    - `id`: 元素的唯一标识符。
    - `class`: 元素的类名，用于样式和脚本。
```html
<div id="main" class="container">
```
9. `<span>`
- **作用**: 定义文档中一个内联元素，用于分组文本。
- **常用属性**:
    - `id`: 元素的唯一标识符。
    - `class`: 元素的类名。
```html
<span id="highlight" class="text-highlight">
```
10. `<p>`
- **作用**: 定义一个段落。
- **常用属性**:
    - `id`: 元素的唯一标识符。
    - `class`: 元素的类名。
注意：浏览器会自动地在段落的前后添加空行。（</p> 是块级元素）
在行中使用换行符可以使用`<br>`单行标签
```html
<p id="intro" class="text">
```
11. `<a>` ^p2fen5
- **作用**: 定义一个链接。
- **常用属性**:
    - `href`: 指定链接的目标URL。
    - `rel`：定义链接与目标页面的关系。rel 有下面几种预设值
	    - `noopener`: 防止新的浏览上下文（页面）访问`window.opener`属性和`open`方法。
		- `noreferrer`: 不发送referer header（即不告诉目标网站你从哪里来的）。
		- `noopener noreferrer`: 同时使用`noopener`和`noreferrer`。例子: `<a href="https://www.example.com" rel="noopener noreferrer">安全链接</a>`
		- download：提示浏览器下载链接目标而不是导航到该目标。如果指定了文件名，浏览器会提示下载并保存为指定文件名。
```html
<a href="file.pdf" download="example.pdf">下载文件</a>
```
- title：定义链接的额外信息，当鼠标悬停在链接上时显示的工具提示。
```html
<a href="https://www.example.com" title="访问 Example 网站">访问 Example</a>
```
- id：用于链接锚点，通常在同一页面中跳转到某个特定位置。
```html

<ul type="circle">
  <li>项目1</li>
  <li>项目2</li>
</ul>
```
14. `<table>`, `<tr>`, `<td>`, `<th>`
- **作用**: 定义表格、表格行、表格单元格和表头单元格。
- **常用属性**:
    - `border`: 设置表格边框宽度。
    - `colspan`: 设置单元格跨越的列数。
    - `rowspan`: 设置单元格跨越的行数。
```html
<table border="1">
  <tr>
	<th>标题1</th>
	<th>标题2</th>
  </tr>
  <tr>
	<td>数据1</td>
	<td>数据2</td>
  </tr>
</table>
```
15. `<form>`, `<input>`, `<button>`, `<select>`, `<option>`
- **作用**: 定义表单、输入字段、按钮、下拉菜单和选项。
- **常用属性**:
    - `action`: 指定表单提交的URL。
    - `method`: 指定表单提交的方法（如 `GET`、`POST`）。
    - `type`: 指定输入字段的类型（如 `text`、`password`、`submit`）。
    - `name`: 指定输入字段的名称。
    - `value`: 指定输入字段的默认值或按钮的显示文本。
```html
<form action="/submit" method="post">
  <input type="text" name="username" value="请输入用户名">
  <button type="submit">提交</button>
</form>
```
16. `<h1>` 到 `<h6>`
- **作用**: 定义标题级别，从1到6。
- **常用属性**:
    - `id`: 元素的唯一标识符。
    - `class`: 元素的类名。
```html
<h1 id="main-title" class="title">主标题</h1>
```
17. `<footer>`, `<header>`, `<nav>`, `<section>`, `<article>`
- **作用**: 定义文档的结构元素，如页脚、页眉、导航栏、章节和文章。
- **常用属性**:
    - `id`: 元素的唯一标识符。
    - `class`: 元素的类名。
```html
<header id="page-header" class="header">
```
18. `<audio>`, `<video>`
- **作用**: 定义音频和视频内容。
- **常用属性**:
    - `src`: 指定媒体文件的URL。
    - `controls`: 显示播放控件。
    - `autoplay`: 自动播放媒体。
```html
<audio src="song.mp3" controls autoplay></audio>
```
19. `<canvas>`
- **作用**: 定义图形画布，用于绘制图形。
- **常用属性**:
    - `id`: 元素的唯一标识符。
    - `width`: 设置画布宽度。
    - `height`: 设置画布高度。
```html
<canvas id="myCanvas" width="500" height="500"></canvas>
```
20. `<style>`
- **作用**: 定义内部样式表。
- **常用属性**:
    - `type`: 指定样式表的类型（如 `text/css`）。
```html
<style type="text/css">
  .text { color: blue; }
</style>
```

21. 作用较为单一的标签

| `<dfn>`      | 定义一个定义项目。                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------- |
| `<code>`     | 定义计算机代码文本。                                                                                    |
| `<samp>`     | 定义样本文本。                                                                                       |
| `<kbd>`      | 定义键盘文本。它表示文本是从键盘上键入的。它经常用在与计算机相关的文档或手册中。                                                      |
| `<var>`      | 定义变量。您可以将此标签与 `<pre>` 及 `<code>` 标签配合使用。                                                      |
| `<footer>`   | 用来定义文档页脚                                                                                      |
| `<progress>` | 显示进度，value 表示现在值，max 表示上限，如果不填入内容则显示等待、正在加载条                                                  |
| `<s>`        | <那些不正确、不准确或者没有用的文本进行标识。<br>不应该用来定义替换的或者删除的文本。如果要定义替换的或者删除的文本使用 `<del>`，两者在对文本添加**删除线**的效果是一样的 |
| `<title>`    | 定义网页标题，收藏到收藏夹时显示的标题                                                                           |
| `<tt>`       | 定义打字机文本，用特殊格式显示                                                                               |
| `<u>`        | 下划线文本                                                                                         |
| `<var>`      | 用来定义变量，作为普通文本用斜体显示                                                                            |

#### HTML 中 href、src 区别

href 是 Hypertext Reference 的缩写，表示超文本引用。用来建立当前元素和文档之间的链接。常用的有：link、a。例如：
`<link href="reset.css" rel=”stylesheet“/>`
浏览器会识别该文档为 css 文档，并行下载该文档，并且不会停止对当前文档的处理。这也是建议使用 link，而不采用 @import 加载 css 的原因。 src 是 source 的缩写，src 的内容是页面必不可少的一部分，是引入。src 指向的内容会嵌入到文档中当前标签所在的位置。常用的有：img、script、iframe。例如:
`<script src="script.js"></script>`
当浏览器解析到该元素时，会暂停浏览器的渲染，直到该资源加载完毕。这也是将js脚本放在底部而不是头部得原因。
简而言之，src 用于替换当前元素；href 用于在当前文档和引用资源之间建立联系。
#### 相对路径
- `./`：代表文件所在的目录（可以省略不写）如果写成image/background就相当于是在html文件下找image文件夹，当然是找不到的
-  `../`：代表文件所在的父级目录
-  `../../`：代表文件所在的父级目录的父级目录
-  `/`：代表文件所在的根目录
#### 书写规范
- 所有标签都要保证闭合，如果是 `<br>` 这种单标签，写成 `<br\>` 保证兼容性
- html 标签不区分大小写，大小写不同的两个标签**是相同的**，未来将强制小写，为保证兼容性

---
标题和字体的对应大小关系
1到6号标题与1到6号字体逆序对应，比如1号字体对应6号标题，2号字体对应5号标题。
```html
<h1>这是1号标题</h1>
<font size="6">这是6号字体文本</font>
<h2>这是2号标题</h2>
<font size="5">这是5号字体文本</font>
<h3>这是3号标题</h3>
<font size="4">这是4号字体文本</font>
<h4>这是4号标题</h4>
<font size="3">这是3号字体文本</font>
<h5>这是5号标题</h5>
<font size="2">这是2号字体文本</font>
<h6>这是6号标题</h6>
<font size="1">这是1号字体文本</font>
```
#### HTML 为无障碍阅读做出的努力
##### 关于 `<b> `和 `<strong>`
在显示上，这两个标签都可加粗文本，呢么为什么会有两个功能"相同"的标签呢？而且好像 strong 并非个例。
-  首先，这两个并非完全相同。比如，如果使用网页阅读器阅读网页（盲人使用），strong 会重读，b 则不会。
-  其次，从起源上来说，strong 是为了在未来建设语义网而诞生的。应该知道的是，html 是负责显示的标记，不能表示语义。也就是说，浏览器知道这个标签如何显示，而不知道标签所标记的内容应该是什么含义。而 strong 在语义上走出了第一步。

##### `<em>` 把文本定义为强调的内容
`<em>` 标签告诉浏览器把其中文本表示为强调的内容。对于所有浏览器来说，这意味着要把这段文字用斜体来显示。
尽管现在 `<em>` 标签修饰的内容都是用斜体字来显示，但这些内容也具有更广泛的含义，将来的某一天，浏览器也可能会使用其他的特殊效果来显示强调的文本。如果你只想使用斜体字来显示文本的话，请使用 `<i>` 标签。除此之外，文档中还可以包括用来改变文本显示的级联样式定义。
##### `<i>` 显示斜体文本效果果
`<i>` 标签和基于内容的样式标签 `<em>` 类似。它告诉浏览器将包含其中文本以斜体字（italic）或者倾斜（oblique）字体显示。如果这种斜体字对该浏览器不可用的话，可以使用高亮、反白或加下划线等样式。
##### `<dfn>` 定义一个定义项目目
`<dfn>` 标签可标记那些对特殊术语或短语的定义。
现在流行的浏览器通常用斜体来显示 `<dfn> `中文本。将来，`<dfn>` 还可能有助于创建文档的索引或术语表。
与其他许多基于内容的样式和物理样式标签一样，`<dfn>`标签尽量少用为妙。
也就是说它们要实现的目的不同，但都用同样的表现方式，就是斜体。

#### 超链接
使用 `<a>` 创建超链接时，`href` 属性用来描述元素的链接目的地
具体使用方法在 [[#^p2fen5|a标签的使用]] 中
常用的链接方法还有：
**图像链接**：您还可以使用图像作为链接。在这种情况下，`<a> `元素包围着 `<img>` 元素。例如：
```html
<a href="https://www.example.com">
  <img src="example.jpg" alt="示例图片">
</a>
```

**锚点链接：** 除了链接到其他网页外，您还可以在同一页面内创建内部链接，这称为锚点链接。要创建锚点链接，需要在目标位置使用 `<a>` 元素定义一个标记，并使用符号引用该标记 。例如：
```html
<a href="#section2">跳转到第二部分</a>
<!-- 在页面中某个位置 -->
<a name="section2"></a>
```

**下载链接**：如果您希望链接用于下载文件而不是导航到另一个网页，可以使用 download 属性。例如：
```html
<a href="document.pdf" download>下载文档</a>
```

```quota
使用 <title> 标签定义HTML文档的标题
使用 <base> 定义页面中所有链接默认的链接目标地址。
使用 <meta> 元素来描述HTML文档的描述，关键词，作者，字符集等。
<link> 标签定义了文档与外部资源之间的关系。
<link> 标签通常用于链接到样式表:
<style> 标签定义了HTML文档的样式文件引用地址.
在<style> 元素中你也可以直接添加样式来渲染 HTML 文档:
```

---
#### CSS 内联样式
##### 单个标签设置样式
使用 css 有两种方式，一种是内联一种是外部引用
- 内联样式即在标签中使用 style 属性链接 CSS 样式设置单个标签的样式（如果设置在 `<head>` 标签中（即内部样式表）则对整个文件有效）
```html
<body>
    <h1 style="background-color:yellowgreen;font-family: Verdana, Geneva, Tahoma, sans-serif;font-style: italic; ">this is head 1</h1>
</body>
```

##### 内部样式（跨标签跨文件）
- 内部样式表
当单个文件需要特别样式时，就可以使用内部样式表。你可以在`<head>` 部分通过` <style>`标签定义内部样式表:
```html
<head>
<style type="text/css">
	body {background-color:yellow;}
	p {color:blue;}
</style>
</head>
```
- 外部样式表
当样式需要被应用到很多页面时，外部样式表将是理想的选择。使用外部样式表，你就可以通过更改一个文件来改变整个站点的外观。
```html
<head>
<link rel="stylesheet" type="text/css" href="mystyle.css">
</head>
```
对于大部分标签，以上两种方法均可，且修改父级标签，子级标签特性也会改变。但某些标签确无法通过修改父级标签来改变子级标签特性，如 a 标签，修改其颜色特性，必须直接修改 a 标签的特性才可。
```html
<a href="#" style="color:red;" rel="nofollow ugc">只能使用"内联"方式</a>
```
##### import 和 link 之间的差别
```html
第一种方式：使用最多，稳定
<link rel="stylesheet" href="标签路径">
第二种方式：
<style>
@import url ("标签路径")
</style>
```
- 差别 1：
本质的差别：link 属于 XHTML 标签，而 @import 完全是 CSS 提供的一种方式。
- 差别 2：
加载顺序的差别： 当一个页面被加载时（就是被浏览者浏览时) ，link 引用的 CSS 会同时被加载，而 @import 引用的 CSS 会等到页面全部被下载完再被加载。所以有时候浏览 @import 加载 CSS 的页面时开始会没有样式 (就是闪烁)，网速慢时还挺明显。
- 差别 3：
兼容性的差别: @import 是 CSS 2.1 提出的，所以老的浏览器不支持，@import 只有在 IE 5 以上的才能识别，而 link 标签无此问题。
- 差别 4：
使用 dom (document object model 文档对象模型 ) 控制样式时的差别：当使用 javascript 控制 dom 去改变样式时，只能使用 link 标签，因@import 不是 dom 可以控制的。
#### HTML 图片
使用 `img` 标签中属性设置图片，也可以用 CSS 层级样式
- `src `设置图片来源
- `width`，`height` 设置长宽高，如果只设置一个浏览器自动*保留纵横比*调整大小，也可以设置为 `auto`，单位为像素 px（可省略）或图片百分比
- `alt` 设置图片说明
##### 图片超链接
```html
<!DOCTYPE html>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title> This is the page title </title>
    </head>
    <body>
        <p>you can click the sun or other plant watch the changes</p>
        <img src="./src/imgs/planets.gif" alt="a picture of 3 planets" width="145" height="126" usemap="#plants_map">
        <map name="plants_map">
            <area shape="rect" coords="0,0,82,126" href="src/html/sun.html"/>
            <area shape="circle" coords="90,58,3"  href="./src/imgs/merglobe.gif"/>
            <area shape="circle" coords="124,59,8" href="./src/imgs/venglobe.gif"/>
        </map>
        <p> you can click anyone of them</p>
    </body>
</html>
```
- 唯一要注意的就是使用图片布局时名称前要加 `#`
- 图片中描述属性 `alt` 可以不加
每个图片的 html 网页如下
```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>a sun page</title>
    </head>
    <body>
        <img src="../imgs/sun.gif" alt="a picture of mercur">
    </body>
</html>
```
文件树结构如下：
![[Pasted image 20250113191334.png]]
##### 调整图片位置的方法
####### 1.  `text-align` 属性
- **适用场景**: 当图像作为文本的一部分时，可以使用 `text-align` 属性来控制图像的对齐方式。
-
```html
<style>
	.center-image {
		text-align: center;
	}
</style>
<div class="center-image">
	<img src="image.jpg" alt="描述">
</div>
```
- **说明**:
    - `text-align: center;` 可以将图像在父容器中水平居中。
    - 其他值如 `left` 和 `right` 也可以用来对齐图像。

####### 2.  `float` 属性
- **适用场景**: 当需要图像浮动在文本的一侧，并允许文本环绕图像时，可以使用 `float` 属性。
-
```html
<style>
	.float-left {
		float: left;
		margin-right: 10px;
	}
</style>
<img src="image.jpg" alt="描述" class="float-left">
<p>这是环绕在图像周围的文本。</p>
```
- **说明**:
    - `float: left;` 将图像浮动到左侧，文本会环绕在图像的右侧。
    - 同样，`float: right;` 可以将图像浮动到右侧。

####### 3.  `margin` 属性
- **适用场景**: 当需要调整图像与其他元素之间的间距时，可以使用 `margin` 属性。
-
```html
<style>
	.center-image {
		display: block;
		margin: 0 auto;
	}
</style>
<img src="image.jpg" alt="描述" class="center-image">
```
- **说明**:
    - `margin: 0 auto;` 可以将图像在其父容器中水平居中。
    - 通过调整 `margin` 的值，可以控制图像与其他元素之间的间距。

####### 4.  `position` 属性
- **适用场景**: 当需要精确控制图像的位置时，可以使用 `position` 属性
```html
<style>
	.relative-position {
		position: relative;
		top: 20px;
		left: 30px;
	}
</style>
<img src="image.jpg" alt="描述" class="relative-position">
```
- **说明**:
    - `position: relative;` 可以相对于其正常位置进行调整。
    - 其他值如 `absolute` 和 `fixed` 可以将图像从文档流中移除，并相对于其他元素或视口进行定位。
####### 5. Flexbox布局
- **适用场景**: 当需要更复杂的布局控制时，可以使用Flexbox。
```html
<style>
	.flex-container {
		display: flex;
		justify-content: center; /* 水平居中 */
		align-items: center;    /* 垂直居中 */
	}
</style>
<div class="flex-container">
	<img src="image.jpg" alt="描述">
</div>
```
- **说明**:
    - `display: flex;` 启用Flexbox布局。
    - `justify-content: center;` 和 `align-items: center;` 可以实现图像在父容器中水平和垂直居中。
####### 6. rid布局
- **适用场景**: 当需要更复杂的网格布局时，可以使用CSS Grid。
```html
<style>
	.grid-container {
		display: grid;
		place-items: center;
	}
</style>
<div class="grid-container">
	<img src="image.jpg" alt="描述">
</div>
```
- **说明**:
    - `display: grid;` 启用Grid布局。
    - `place-items: center;` 可以实现图像在父容器中水平和垂直居中。

##### 调整图片位置注意事项
- `float` 属性会将 img 上下来*两行内容放在图片周围*作为环绕元素
```html
<p>
    Basic profile
    <img src="./src/imgs/Eminem_black&white.gif" alt="Eminem" width="320px" height="auto" class="float_left">
    <p>  <!--出现空行的原因是<p>是块级元素，会自动添加空行-->
        Eminem (born October 17, 1972, St. Joseph, Missouri, U.S.) is an American rapper, record producer, and actor who is known as one of the most-controversial and best-selling artists of the early 21st century. He was the first recording artist to have 10 consecutive albums debut at number one on the Billboard album chart.
    </p>
</p>
```
![[Pasted image 20241201170737.png|450]]
#### HTML 属性
##### 全局属性
| 属性                                                                                                                 | 描述                            |
| :----------------------------------------------------------------------------------------------------------------- | :---------------------------- |
| [accesskey](https://www.runoob.com/tags/att-global-accesskey.html "HTML Global accesskey 属性")                      | 设置访问元素的键盘快捷键。                 |
| [class](https://www.runoob.com/tags/att-global-class.html "HTML Global class 属性")                                  | 规定元素的类名（classname）            |
| [contenteditable](https://www.runoob.com/tags/att-global-contenteditable.html "HTML Global contenteditable 属性") | 规定是否可编辑元素的内容。                 |
| [contextmenu](https://www.runoob.com/tags/att-global-contextmenu.html "HTML contextmenu 属性")                    | 指定一个元素的上下文菜单。当用户右击该元素，出现上下文菜单 |
| [data-*](https://www.runoob.com/tags/att-global-data.html)                                                      | 用于存储页面的自定义数据                  |
| [dir](https://www.runoob.com/tags/att-global-dir.html "HTML dir 属性")                                               | 设置元素中内容的文本方向。                 |
| [draggable](https://www.runoob.com/tags/att-global-draggable.html "HTML draggable 属性")                          | 指定某个元素是否可以拖动                  |
| [dropzone](https://www.runoob.com/tags/att-global-dropzone.html "HTML dropzone 属性")                             | 指定是否将数据复制，移动，或链接，或删除          |
| [hidden](https://www.runoob.com/tags/att-global-hidden.html "HTML hidden 属性")                                   | hidden 属性规定对元素进行隐藏。           |
| [id](https://www.runoob.com/tags/att-global-id.html "HTML id 属性")                                                  | 规定元素的唯一 id                    |
| [lang](https://www.runoob.com/tags/att-global-lang.html "HTML lang 属性")                                            | 设置元素中内容的语言代码。                 |
| [spellcheck](https://www.runoob.com/tags/att-global-spellcheck.html "HTML spellcheck 属性")                       | 检测元素是否拼写错误                    |
| [style](https://www.runoob.com/tags/att-global-style.html "HTML style 属性")                                         | 规定元素的行内样式（inline style）       |
| [tabindex](https://www.runoob.com/tags/att-global-tabindex.html "HTML tabindex 属性")                                | 设置元素的 Tab 键控制次序。              |
| [title](https://www.runoob.com/tags/att-global-title.html "HTML title 属性")                                         | 规定元素的额外信息（可在工具提示中显示）          |
| [translate](https://www.runoob.com/tags/att-global-translate.html "HTML translate 属性")                          | 指定是否一个元素的值在页面载入时是否需要翻译        |

### HTML 全局属性和事件属性
#### 全局属性
可以应用于 **大多数** HTML 元素的属性。
全局属性参考：[HTML 全局属性 | 菜鸟教程](https://www.runoob.com/tags/ref-standardattributes.html)
#### 事件属性
用于设置页面元素的交互逻辑，在 HTML 元素上绑定事件处理器，以响应用户的交互或特定的事件。这些属性通常以 `on` 开头
事件属性参考：[HTML 事件 | 菜鸟教程](https://www.runoob.com/tags/ref-eventattributes.html)
### HTML 表格
可以通过 [HTML 表格生成器 | 菜鸟工具](https://www.jyshare.com/front-end/7688/)省去繁琐部分
#### 表格简单样式
- **tr**：tr 是 table row 的缩写，表示表格的一行。
- **td**：td 是 table data 的缩写，表示表格的数据单元格。
- **th**：th 是 table header的缩写，表示表格的表头单元格。
常用属性
`<table>` 标签常用属性：
- border="1"   表格边框的宽度
- bordercolor="#fff"   表格边框的颜色
- cellspacing="5"   单元格之间的间距
- width="500"   表格的总宽度
- height="100"   表格的总高度
- align="right"   表格整体对齐方式    (参数有  left、center、right)
- bgcolor="#fff"   表格整体的背景色

`<tr> `标签的常用属性:
- bgcolor="#fff"    行的颜色
- align="right"    行内文字的水平对齐方式    (参数有left、center、right)
- valign="top"     行内文字的垂直对齐方式    (参数有top、middle、bottom)

`<td>、<th>` 标签的常用属性:
- width="500"    单元格的宽度，设置后对当前一列的单元格都有影响
- height="100"   单元格的高度，设置后对当前一行的单元格都有影响
- bgcolor="fff"  单元格的背景色
- align="right"  单元格文字的水平对齐方式    (参数left、center、right)
- rowspan="3"    合并垂直水平方向的单元格
- colspan="3"    合并水平方向单元格
- valign="top"   单元格文字的垂直对齐方式    (参数middle、bottom、top)
![[Files & LongText/Long code/HTML#表格的简单样式]]

效果：
![[Pasted image 20241202081554.png]]
#### 使用 CSS 控制表格样式
##### 引入 CSS 样式方法
-  使用 `<link>` 标签
在 `head` 标签中使用 `link` 引入**外部 CSS 文件**，由于在 `head` 中使用，作用域为整个文件
`<link rel="stylesheet" href="styles.css">`
- 使用 `@import` 引入外部文件，必须要在 `<style>` 标签中使用
```html
<style>
    @import url('styles.css'); /* 引入 CSS 文件 */
</style>
```
- 内联样式
即在 html 中内嵌 css 样式，通过 style 标签实现
##### CSS 定义和元素容器
- CSS 定义
可以在 html 标签中使用 `style` 属性单独引入 CSS 样式单个，也可以在 `head` 标签中定义 `style` 后面复用

CSS 由一个**选择器**（分为类选择器， ID 选择器，`:nth-of-type` 选择器和 `;child-of-type` 选择器）一个声明和声明体组成，类名作为一个 CSS 样式的唯一标识符，在 html 的某些元素（一般是容器元素，如 `div`）中使用 `class` 属性指定引用哪一个 CSS 类 ^6zhmk0
```css
<style>
    .table_container{ /*类选择器*/
    	/* 公共部分 */
        display: flex;
        gap: 20px;
        justify-content: center;
        margin: 20px;
    }
    #unique-element{
    	/*<tage id = unique-element>         </tags>>*/
    	color: blue
    	font-size: 18px
    }
    table{
        width: 45%;
        border-collapse: collapse;
    }
    table,th,td{
        border: 1px solid #000;
    }
</style>
```
类中声明在容器中所有元素中应用，普通声明只对指定的标签起作用，可以用 `,` 隔开多个标签一起使用相同的样式，而使用 `#` 开头的选择器**只有即在容器中，容器中标签与 `unique-element` 字段一样的标签才能使用**

---
元素容器（如 `div`）
- 添加 `class` 并在 CSS 中定义相应的样式会应用到该 `div` 本身，**而不是其内部的子元素**，但可以在 CSS 中显式指定。
- 对元素容器使用[[#^6zhmk0|顺序选择器]]
	- `tag_name:nth-of-type(number)` 应用在容器中会匹配容器中第 `number` 个 `tag` 元素并应用样式，同样只会影响元素本身，不对字样式影响
	- **`:nth-child`**：与 `:nth-of-type` 类似，但它基于元素在所有子元素中位置进行计数，而不是基于类型。就是将容器中所有元素不论层级排列，选中第 `number` 个应用样式
- 这种方法适用于表格数量较少且顺序固定的情况。
- 块级元素默认**垂直排列**，内联元素默认**水平排列** ，但可以通过 `flex` 布局调整元素排列方向
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flexbox 示例</title>
    <style>
        .container {
            display: flex; /* 启用 Flexbox 布局 */
            flex-direction: row; /* 横向排列（默认） */
            /* 可选属性 */
            justify-content: space-between; /* 子元素之间的间距 */
            align-items: center; /* 垂直居中对齐 */
            gap: 20px; /* 子元素之间的固定间距 */
        }
        .item {
            background-color: #f0f0f0;
            padding: 10px;
            border: 1px solid #ccc;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="item">元素 1</div>
        <div class="item">元素 2</div>
        <div class="item">元素 3</div>
    </div>
</body>
</html>
```
##### 实例
上面代码中 `border` 已经弃置不用，现代 html 推荐使用 CSS 控制所有样式内容
```html
<style id="table_cellspaceing">
    table{
        /* border-collapse控制单元格之间边框是否合并; */
        border-collapse: collapse;
         border-spacing: 10px;/*单元格边框和单元格之间的内容用10px空白填充 */
    }
    td {
        padding: 20px;
        border: 2px solid black;/*实心黑线条只作为td的边框*/
    }
</style>
```
![[Pasted image 20241202082411.png]]

---
- `border-collapse` 属性
border-collapse CSS 属性是用来决定表格的边框是分开的还是合并的。在分隔模式下，相邻的单元格都拥有独立的边框。在合并模式下，相邻单元格共享边框。
![[Pasted image 20250113195020.png]]
- 可以一次性对多个元素设置 CSS 属性
```css
table,th,td{
    border: 1px solid #000;
}
```
一次性对 table ，th 和 td 添加黑色，1 px宽度的边框
### HTML 列表
注意无论是哪一种列表都符合*子元素标签 `<li>` 外面用 `ul/ol/dl` 包裹
外列表标签中 `type` 属性用来标记编号类型，**无序列表使用 style**中 list-style-type 设定
```html
<body>
    <ol type="I">
        <!-- type="a"/type="A"/type="1"/type="i" -->
        <li>Alpha</li>
        <li>Beta</li>
        <li>Charlie</li>
    </ol>
    <ul style="list-style-type: circle;">
        <li>Alpha</li>
        <li>Beta</li>
        <li>Charlie</li>
    </ul>
</body>
```
列表支持嵌套*
### 区块元素、内联元素和内联块元素
块级元素和内联元素都没有默认样式，

| 特性          | 块级元素（Block-level） | 内联元素（Inline） | 内联块元素（Inline-block） |
| ----------- | ----------------- | ------------ | ------------------- |
| **独占一行**    | 是                 | 否            | 否                   |
| **可设置宽度**   | 是                 | 否            | 是                   |
| **可设置高度**   | 是                 | 否            | 是                   |
| **支持盒模型属性** | 是                 | 有限           | 是                   |
| **默认宽度**    | 100%              | 内容决定         | 内容决定                |
| **排列方式**    | 垂直排列              | 水平排列         | 水平排列                |

---
- **块级元素** 组织和布局主要内容区域，例如页面布局、容器等。
- **内联元素** 处理文本级别的样式，例如强调文本、链接等。
- **内联块元素** 当需要在同一行内排列元素并设置其尺寸时，例如图像、按钮等。
#### `<div>`
与 CSS 一同使用，`<div>` 元素可用于对大的内容块设置样式属性。
它们可以设置宽度（默认宽度是父容器的 100%）、高度、内边距（padding）、外边距（margin）（支持**盒模型**）等。
常用容器有：
- `<div>`：通用容器。
- `<p>`：段落。
- `<h1>` 到 `<h6>`：标题。
- `<ul>`、`<ol>`、`<li>`：列表及其项。
- `<form>`：表单。
- `<header>`、`<footer>`、`<section>`、`<article>` 等语义化标签。
#### `<span>`
同理，` <span>` 元素是内联元素作文本的容器，也可以使用 CSS 设置文本属性
- **不独占一行**：多个内联元素会排列在同一行，直到空间不足时才会换行。
- **不可设置宽高**：无法通过 CSS 设置宽度（width）和高度（height），其大小由内容决定。
- **盒模型属性受限**：虽然可以设置左右内边距（padding-left、padding-right）、左右外边距（margin-left、margin-right）和边框（border），但上下内边距和上下外边距对布局影响有限。
- **默认宽度**：宽度由内容决定。

---
常用容器有：
- `<span>`：通用内联容器。
- `<a>`：超链接。
- `<img>`：图像。
- `<strong>`、`<em>`：强调文本。
- `<label>`：表单标签。
- `<input>`、`<button>`：表单输入和按钮。
#### `<img>` 等内联块元素
内联块元素结合了内联元素和块级元素的特点。它们可以在同一行内排列，但同时可以设置宽度、高度、内边距和外边距。
**常见内联块元素**：
- `<img>`、`<button>`、`<input>` 等默认具有内联块特性。
- 通过 CSS 的 `display: inline-block;` 可以将其他元素设置为内联块元素。
- **可设置宽高**：可以像块级元素一样设置宽度和高度。
- **可设置盒模型属性**：支持内边距、外边距和边框。
- **排列方式**：像内联元素一样在同一行内排列，直到空间不足时才会换行。
### HTML 布局
![[Pasted image 20250114094248.png]]
创建这样的布局可以使用 div 容器方法，也可以看做一个 `table` 用单元格排列
table 布局和 div&span 布局
```html
<body>
    <table width="500" id="table1";>
        <caption>use table method</caption>
        <tr>
            <td colspan="2" style="background-color: #FFA500;">
                <h1 style="margin-bottom: 0;margin-top: 0;">Main webpage title</h1>
            </td>
        </tr>
        <tr>
            <td style="background-color: #FFD700; width: 100px;text-align: left;vertical-align: top;" id="data1">
                <b>menu</b><br>
                HTML<br>
                CSS<br>
                javascript
            </td>
            <td style="background-color: #eeeeee;height: 200px; width: 400px;vertical-align: text-top;">this is content</td>
        </tr>
        <tr>
            <td colspan="2" style="background-color: #FFA500; text-align: center;">copyright @sickwag</td>
        </tr>
    </table>
    <br>
    <br>


    <div id="container" style="background-color: #FFA500;width: 500px;">
        <h1 style="margin-bottom: 0;">Main webpage title</h1>
        <span style="width: 500px;">
            <div id="menu" style="background-color: #FFD700; float: left;width: 100px;height:200px ;">
                <b>menu</b><br>
                HTML<br>
                CSS<br>
                javascript
            </div>
            <div id="content" style="background-color: #eeeeee; float: left;height: 200px; width: 400px;">
                this is content
            </div>
        </span>
        <div id="footer" style="background-color: #FFA500; text-align: center;">
            copyright @sickwag
        </div>
    </div>
</body>
```
### HTML 表单
#### 基本知识
##### 控件和 lable 联系
- 表单用于收集输入信息，将用户收集到的信息发送到 Web 服务器。HTML 表单通常包含各种输入字段、复选框、单选按钮、下拉列表等元素。
- label 标签一般与 input 等**标签控件**关联，关联方式是
	- input 标签中 `name` 来关联 label 中 `id` 属性，
	- label 标签中 `for` 属性关联 input 控件的 `name` 属性，label 不需要 `name`（因这是控件属性）
- 当用户点击“用户名：”或“电子邮件：”的文本时，相应的输入框会**自动获得焦点**。
![[PixPin_2025-01-14_12-15-53.mp4]]
label 也可以通过 `form` 指定关联表单的的 id，`accesskey` 关联快捷键，一般通过 ALT+accesskey 中关联按键
一般通过 label 标签和相对应的控件**分开写而不是嵌套写**，这样有助于代码复用，嵌套的代码难以维护和更改
```html
<!-- 分开写 -->
<label for="password">password</label>
<input type="password" id="password" name="password"> <br>
<!-- 嵌套写 -->
<label for="tac">
    <input id="tac" type="checkbox" name="terms-and-conditions">
    I agree to the <a href="terms-and-conditions.html">Terms and Conditions</a>
</label>
```
嵌套写的好处是如果嵌套的元素**有强对应关系**，其中 `for` ，`id` 和 `name` 等原来需要唯一对应的字段可以不写，默认指向父元素

---
##### 常用控件
###### fieldset
域说明元素 `<legend>` 代表一个用于表示它的父元素 `<fieldset>` 的内容的标题。
![[Pasted image 20250114134138.png]]
个人信息就是 fieldset 的标题，属性 form（value 为 form 标签的 id），规定 fieldset 所属的**一个或多个表单**
###### input
input 中 type 值有：
- 单选按钮：radio
- 复选框：checkbox
- 提交按钮：submit
- 重置按钮：reset（点击后重置为默认值）
- 日期输入框：date
- 时间输入框：time 也可以使用本地时间 local-time
- 数量调整框：quantity（通过上下箭头调整数目）
- 滑动调整框：range
- 磁盘占用框：disk-space（横向绿色进度条）
- 文件上传进度条：file-progress（横向灰色进度条）
- 搭配 output 显示计算结果
效果图
![[Pasted image 20250114142809.png]]
```html
<button type="button" onclick="alert('Hello!')">点击我</button><br>
<label for="date">date</label>
<input type="date" name="date" id="date">
<label for="time">time</label>
<input type="time" name="time" id="time">
<label for="quantity">quantity</label>
<input type="number" id="quantity" name="quantity" min="1" max="10">
<label for="volume">volume</label>
<input type="range" name="volume" min="0" max="100">
<label for="disk-space">disk-space</label>
<meter value="0.6" id="disk-space">60%</meter>
<label for="file-progress">upload-progress</label>
<progress id="file-progress" value="70" max="100">70%</progress>
<form oninput="result.value=parseInt(a.value)+parseInt(b.value)">
    <input type="number" id="a" name="a" value="0">
    +
    <input type="number" id="b" name="b" value="0">
    =
    <output name="result" for="a b"></output>
</form>
```
output 中 for 用来描述 output 和哪个组件的关系，通过空格分开，按顺序解析

|属性|描述|
|---|---|
|autocomplete|一个字符串，代表如果`<input>`元素的 type 允许，则会具有自动填充的功能|
|autofocus|一个布尔值，如果`<input>`元素的标签里存在此属性，当表单被呈现在网页上时，焦点会自动落在此`<input>`元素上|
|disabled|如果你想禁用某`<input>`元素时，将此属性放在元素的标签里，此时元素不能被用户手动输入、点选或拖动等。|
|form|如果`<input>`存在 form 属性，它表示此元素属于一个[`<form>`](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/form "HTML <form> 元素表示了文档中一个区域，此区域包含有交互控制元件，用来向 Web 服务器提交信息。") 表单，此`<form>`表单的 [`id`](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/id "Element 接口的 id 属性表示元素的标识符，与全局属性 id 对应。") 就是属性的值，如果不存在 form 属性，在页面上有`<form>`表单的情况下，`<input>`元素会属于最近的一个`<form>`表单|
|list|指向一个 id 为 list 属性值的 [`<datalist>`](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/datalist "HTML <datalist>元素包含了一组<option>元素，这些元素表示其它表单控件可选值.") 元素， `<datalist>`为这个`<input>`元素提供建议值|
|name|`<input>`的名字，在提交整个表单数据时，可以用于区分属于不同`<input>`的值|
|readonly|布尔值，如果为真，表示此`<input>`元素不能被编辑（比如输入、点选等）|
|required|布尔值，如果为真，表示只有当此`<input>`元素有值时，整个表单才能提交|
|tabindex|一个数字，相当于序号，当用户按键盘Tab键时，焦点会按序号从小到大落在对映的元素上（当此值为-1时，表示焦点永远不会通过Tab键落在此元素上）|
|type|字符串，表示`<input>`元素按照不同的 input type 类型呈现出来|
|value|这个`<input>`元素当前的值|

---
`form` 元素中 action 中传入目标 url 或者目标文件，method 是 http 的调用方法
- post：指的是 HTTP POST 方法，表单数据会包含在表单体内然后发送给服务器，用于提交敏感数据，如用户名与密码等。
- get：默认值，指的是 HTTP GET 方法，表单数据会附加在 action 属性的 URL 中，并以 ?作为分隔符，一般用于不敏感信息，如分页等。例如：https://www.runoob.com/?page=1，这里的 page=1 就是 get 方法提交的数据。
---
input 控件中 autocomplete 属性可以填入多种值，作用是告诉浏览器这个值是什么内容，方便从已保存的内容中**筛选字段填充**
- **`name`**：全名。
- **`given-name`**：名字。
- **`family-name`**：姓氏。
- **`email`**：电子邮件地址。
- **`username`**：用户名。
- **`-password`**：新密码（注册时）。
- **`current-password`**：当前密码（登录时）。
- **`address-line1`**、**`address-line2`**、**`address-level1`**（省/州）、**`country`**、**`postal-code`** 等：地址相关字段
- **`tel`**：电话号码
- **`organization-title`**：职位
- **`bday`**：生日。
###### select-option
创建下拉列表、滚动列表，字段 value 将会被发送给服务器，可以用 select 属性使其默认被选中，disable 表示禁用选项
```html
<label for="fruit">选择水果：</label>
<select id="fruit" name="fruit">
    <option value="apple">苹果</option>
    <option value="banana">香蕉</option>
    <option value="cherry">樱桃</option>
</select>
```
option 还有拓展 optgroup
![[Pasted image 20250114202938.png]]
```html
<select>
    <optgroup label="Swedish Cars">
	    <option value="volvo">Volvo</option>
	    <option value="saab">Saab</option>
    </optgroup>
    <optgroup label="German Cars">
	    <option value="mercedes">Mercedes</option>
	    <option value="audi">Audi</option>
    </optgroup>
</select>
```
###### datalist-option
![[Pasted image 20250114140838.png]]
和 select-option 像，input 组件通过 `list` 属性和 datalist 的 id 属性**绑定**
```html
<input list="browsers">
<datalist id="browsers">
    <option value="Edge"></option>
    <option value="Firefox"></option>
    <option value="Chrome"></option>
    <option value="Opera"></option>
</datalist>
```
###### button
定义一个可点击的按钮，可以包含文本和其他 HTML 元素。其中 alert 会使用浏览器通知显示消息
![[Pasted image 20250114140952.png|375]]
###### 详细信息域
其中 details 一般和 summary 一起使用，summary 表示详细信息的摘要内容，`open` 属性描述细节是否可见
只要放在 `details` 中内容都是详细信息**而不管顺序**
```html
<details>
    <summary>click here to show details</summary>
    <p>this is detail content</p>
</details>
```
注意一个详细信息域只有一个 summary，再需要下拉列表则需要额外创建 `details`
```html
<details>
    <summary>click here to show details</summary>
    <p>this is detail content</p>
    <summary>click here to show details</summary>
</details>
```
![[Pasted image 20250114143611.png|效果是这样的]]
###### textarea 文本框
设置 cols 和 rows 调整文本框宽度 `<textarea rows="10" cols="30">`
![[Pasted image 20250114143754.png]]

##### 相似控件区别
###### button 和 input type="button"
- **`<button>` 标签**：不同浏览器对 `<button>` 的默认样式可能有所不同，按钮之中支持 img，audio 等不同 html 元素，并且可以指定按下按钮后**向服务器发送的内容默认值（value）、编码格式等（formenctype）**
- **`<input type="button">`**：默认样式较为简单，通常只包含按钮文本。value 值是按钮显示的文字

| 特性       | `<button>` 标签     | `<input type="button">` |
| -------- | ----------------- | ----------------------- |
| **标签类型** | 容器标签，可以包含 HTML 内容 | 自闭合标签，只能包含文本            |
| **可定制性** | 高，可以包含图像、文本格式化等   | 低，只能设置按钮文本              |
| **语义化**  | 强，提供了更丰富的语义信息     | 较弱，语义信息有限               |
| **可访问性** | 更好，支持复杂的可访问性需求    | 较简单，适用于基本需求             |
| **默认样式** | 不同浏览器可能有不同的默认样式   | 简单，通常只包含按钮文本            |

#### 实例
##### 简单信息收集
![[Pasted image 20250114134008.png]]
```html
<body>
    <form action="/">
        <label for="name">User name</label>
        <input type="text" id="name" name="name" required> <br>

        <label for="password">password</label>
        <input type="password" id="password" name="password"> <br>

        <label">gender:</label>
        <input type="radio" name="gender" value="male" checked>
        <label for="male">male</label>
        <input type="radio" name="gender" value="female">
        <label for="female">female</label> <br>

        <label for="country">country</label>
        <select name="country" id="country">
            <option value="cn">CN</option>
            <option value="usa">USA</option>
            <option value="uk">UK</option>
        </select><br>
        <input type="submit" value="submit"> <br>
        <label for="tac">
            <input id="tac" type="checkbox" name="terms-and-conditions">
            I agree to the <a href="terms-and-conditions.html">Terms and Conditions</a>
        </label>
    </form>
    <form>
    <fieldset>
        <legend>个人信息</legend>
        <label for="name">姓名：</label>
        <input id="name" type="text" name="name"><br><br>

        <label for="email">电子邮件：</label>
        <input id="email" type="email" name="email">
    </fieldset>
</form>
</body>
</html>
```

### HTML 框架
通过使用框架，你可以在同一个浏览器窗口中显示不止一个页面。
![[PixPin_2025-01-14_14-46-19.mp4]]
语法：`<iframe src="demo_iframe.htm" width="200" height="200"></iframe>`
- width 和 height 默认以 px 作为单位
- frameborder 可以设置边框粗细
### HTML 颜色
HTML 颜色由一个十六进制符号来定义，这个符号由红色、绿色和蓝色的值组成（RGB）。
HEX 和 RGB 两种表示方法无非是**进制不同**
![[Pasted image 20250114145349.png|400]]
最多用在 style 中 background-color 属性上，使用颜色首先声明进制规则，再声明颜色代码，常用进制规则有 RGB HEX RGB（在 RGB 上扩展包括了 **“alpha”** 通道，运行对颜色值设置透明度。）3 位十六进制（不常用）
`background:rgba(255,0,0,0.5);` 透明度在 0~1，所以可以省略开头 0
html 内置了常用颜色并使用了别名代表他们，具体参考 [HTML 颜色名 | 菜鸟教程](https://www.runoob.com/html/html-colornames.html)

### HTML 脚本
JavaScript 使 HTML 页面具有更强的动态和交互性。即定义交互逻辑
`<script>` 标签用于定义客户端脚本，比如 JavaScript，既可包含脚本语句，也可通过 src 属性指向外部脚本文件，**最常用于图片操作、表单验证以及内容动态更新。最常用于图片操作、表单验证以及内容动态更新。**
如果浏览器关闭 JavaScript 或者不支持，就会显示 `<noscript>` 中内容，在可用时无任何意义
```html
<script>
function myFunction(){
	document.getElementById("demo").innerHTML="Hello JavaScript!";
}
</script>
<button type="button" onclick="myFunction()">点我</button>
```
点击按钮实用脚本显示 Hello JavaScript! 字
```html
<script>
function start_run(n)
{
    if(n==0){alert("下载完成")}
    var progress1=document.getElementById("progress1")
    n=n-1
    cur_task=100-n
    progress1.value=cur_task
    setTimeout("start_run("+n+")",100)

}
</script>
```
点击下载显示下载进度（利用  process 控件），下载完成弹出窗口
### HTML 字符实体
HTML 中预留字符（如`<>`符号，`</`符号，连续空格）必须被替换为字符实体。
一些在键盘上找不到的字符也可以使用字符实体来替换。
希望正确地显示预留字符，必须在 HTML 源代码中使用字符实体（character entities）。 字符实体类似这样：
```html
&entity_name;  或  &#entity_number_;
```
字符实体参考手册：[HTML ISO-8859-1 参考手册 | 菜鸟教程](https://www.runoob.com/tags/ref-entities.html)
### HTML URL
统一资源定位器格式 `scheme://host.domain: port/path/filenameme`
- scheme - 定义因特网服务的类型。最常见的类型是 http
- host - 定义域主机（http 的默认主机是 www）
- domain - 定义因特网域名，比如 runoob.com
- :port - 定义主机上的端口号（http 的默认端口号是 80）
- path - 定义服务器上的路径（如果省略，则文档必须位于网站的根目录中）。
- filename - 定义文档/资源的名称
url 编码特性
- URL 只能使用 [ASCII 字符集](https://www.runoob.com/tags/html-ascii.html).
- 来通过因特网进行发送。由于 URL 常常会包含 ASCII 集合之外的字符，URL 必须转换为有效的 ASCII 格式。
- URL 编码使用 "%" 其后跟随两位的十六进制数来替换非 ASCII 字符。转换方式可以参考：[HTML URL 编码参考手册 | 菜鸟教程](https://www.runoob.com/tags/html-urlencode.html)
- URL 不能包含空格。URL 编码通常使用 + 来替换空格。
### HTML 常用标签
```html
<b>粗体文本</b>
<code>计算机代码</code>
<em>强调文本</em>
<i>斜体文本</i>
<kbd>键盘输入</kbd>
<pre>预格式化文本</pre>
<small>更小的文本</small>
<strong>重要的文本</strong>
<del>显示删除线文本</del>

<abbr> （缩写）
<address> （联系信息）
<bdo> （文字方向）
<blockquote> （从另一个源引用的部分）
<cite> （工作的名称）
<del> （删除的文本）
<ins> （插入的文本）
<sub> （下标文本）
<sup> （上标文本）
```
### HTML-XML
- XHTML 是以 XML 格式编写的 HTML。
- XHTML 与 HTML 4.01 几乎是相同的
- XHTML 是更严格更纯净的 HTML 版本
- XHTML 是以 XML 应用的方式定义的 HTML
- XML 是一种必须正确标记且格式良好的标记语言。
- 结合 XML 和 HTML 的长处，开发出了 XHTML。XHTML 是作为 XML 被重新设计的 HTML。
---
书写 XHTML 规范：
- XHTML DOCTYPE 是_强制性的_
- `<html>` 中 XML namespace 属性是_强制性的_
- `<html>`、`<head>`、`<title>` 以及 `<body>` 也是_强制性的_
- XHTML 元素必须正确嵌套
- XHTML 元素必须始终关闭
- XHTML 元素必须小写
- XHTML 文档必须有一个根元素
- XHTML 属性必须使用小写
- XHTML 属性值必须用引号包围
- XHTML 属性最小化也是禁止的
- XHTML 属性值不允许简写
```html
<input checked>
应该写成
<input checked=“checked”>
```
---
html 标签中 `manifest` 标签定义一个 URL，在这个 URL 上描述了文档的缓存信息。
如果是 xhtml 文档，可以定义 xmnls**划定 XML 的命名空间**

---
将 HTML 转化为 xhtml 方法是：
1. 添加一个 XHTML <!DOCTYPE> 到你的网页中
2. 添加 xmlns 属性添加到每个页面的html元素中。
3. 将所有不符合规范的位置调整
## HTML 5 基础
### 基础知识
在 html 基础上加上了
- 用于绘画的 canvas 元素
- 用于媒介回放的 video 和 audio 元素
- 对本地离线存储的更好的支持
- 新的特殊内容元素，比如 article、footer、header、nav、section
- 新的表单控件，比如 calendar、date、time、email、url、search
- 多媒体内容支持，`video`，`audio` 标签
- 支持 [`<canvas>`](https://www.runoob.com/html/html5-canvas.html) 元素。
- 支持内联 [SVG](https://www.runoob.com/html/html5-svg.html)。
- 支持 [CSS3 2D 转换](https://www.runoob.com/css3/css3-2dtransforms.html)、[CSS3 3D 转换](https://www.runoob.com/css3/css3-3dtransforms.html)。
语法规范
必须要使用 `<!DOCTYPE html>` 标签，对于中文网页需要使用 `**<meta charset="utf-8">`** 声明编码，否则会出现乱码。

------
添加很多符合现代浏览器的标签内容

| 标签             | 描述                                    |
| -------------- | ------------------------------------- |
| `<article>`    | 定义页面独立的内容区域。                          |
| `<aside>`      | 定义页面的侧边栏内容。                           |
| `<bdi>`        | 允许您设置一段文本，使其脱离其父元素的文本方向设置。            |
| `<command>`    | 定义命令按钮，比如单选按钮、复选框或按钮                  |
| `<details>`    | 用于描述文档或文档某个部分的细节                      |
| `<dialog>`     | 定义对话框，比如提示框                           |
| `<summary>`    | 标签包含 details 元素的标题                    |
| `<figure>`     | 规定独立的流内容（图像、图表、照片、代码等等）。              |
| `<figcaption>` | 定义 `<figure>` 元素的标题                   |
| `<footer>`     | 定义 section 或 document 的页脚。            |
| `<header>`     | 定义了文档的头部区域                            |
| `<mark>`       | 定义带有记号的文本。                            |
| `<meter>`      | 定义度量衡。仅用于已知最大和最小值的度量。                 |
| `<nav>`        | 定义导航链接的部分。                            |
| `<progress>`   | 定义任何类型的任务的进度。                         |
| `<ruby>`       | 定义 ruby 注释（中文注音或字符）。                  |
| `<rt>`         | 定义字符（中文注音或字符）的解释或发音。                  |
| `<rp>`         | 在 ruby 注释中使用，定义不支持 ruby 元素的浏览器所显示的内容。 |
| `<section>`    | 定义文档中节（section、区段）。                  |
| `<time>`       | 定义日期或时间。                              |
| `<wbr>`        | 规定在文本中何处适合添加换行符。                     |

---
移除 HTML 4 中内容
- `<acronym>`
- `<applet>`
- `<basefont>`
- `<big>`
- `<center>`
- `<dir>`
- `<font>`
- `<frame>`
- `<frameset>`
- `<noframes>`
- `<strike>`
### HTML 5 新元素简介
#### canvas
方法参考手册：[HTML 画布 | 菜鸟教程](https://www.runoob.com/tags/ref-canvas.html)
用来作为画布绘制图形，一般通过 JavaScript 绘制，下面代码绘制一个红色方框
```html
<body>
    <canvas id="myCanvas"></canvas>
    <script type="text/javascript">
        var canvas=document.getElementById('myCanvas');
        var ctx=canvas.getContext('2d');
        ctx.fillStyle='#FF0000';
        ctx.fillRect(0,0,80,100);
    </script>
</body>
```
canvas 中 height 和 width 属性可以限制画布尺寸
#### colgroup
`<colgroup>` 标签用于对表格中列进行组合，以便对其进行格式化。
通过使用 `<colgroup>` 标签，可以向整个列应用样式，而不需要重复为每个单元格或每一行设置样式。
**注释：**只能在 `<table>` 元素之内，在任何一个 `<caption>` 元素后，在任何一个 `<thead>`、`<tbody>`、`<tfoot>`、`<tr>` 元素之前使用 `<colgroup>` 标签。**
colgroup 定义在一个 table 中，按顺序从左至右为每一个 col 设置格式
![[Pasted image 20250114162637.png]]
```html
</table>
<table>
    <colgroup>
        <col style="background-color: #4ba0d4;">
        <col span="2" style="background-color: #6adad6;">
    </colgroup>
    <tr>
        <th>姓名</th>
        <th>年龄</th>
        <th>职业</th>
    </tr>
    <tr>
        <td>张三</td>
        <td>25</td>
        <td>工程师</td>
    </tr>
    <tr>
        <td>李四</td>
        <td>30</td>
        <td>设计师</td>
    </tr>
</table>
```
#### dialog
创建一个**浏览器对话框**，一般配合 JavaScript 使用
```html
<dialog id="myDialog">
    <h2>对话框标题</h2>
    <p>这是对话框的内容。</p>
    <button id="closeDialog">关闭</button>
</dialog>

<button id="openDialog">打开对话框</button>

<script>
    const dialog = document.getElementById('myDialog');
    const openButton = document.getElementById('openDialog');
    const closeButton = document.getElementById('closeDialog');

    // 打开对话框
    openButton.addEventListener('click', () => {
        dialog.showModal();
    });

    // 关闭对话框
    closeButton.addEventListener('click', () => {
        dialog.close();
    });
</script>
```
脚本中三个 const 变量命名不是随便的，只有叫 openButton 才能相应按钮
#### pre
用于显示预定义格式文本。在该元素中文本通常按照原文件中编排，以等宽字体的形式展现出来，文本中空白符（比如空格和换行符）都会显示出来。
不过在 `<pre>` 标签后**紧跟着的**的换行符会被忽略们可以用来**输入 html 预留关键字和特殊符号而不是用实体字符**
```html
<pre>
    ___________________________
    < I'm an expert in my field. >
      ---------------------------
             \   ^__^
              \  (oo)\_______
                 (__)\       )\/\
                     ||----w |
                     ||     ||
</pre>
```
字符画内容会被完整展示出来
#### embed
- **`<iframe>`**：
    - 用于嵌入完整的**网页或 HTML 文档**。
    - 支持跨域通信（通过 `postMessage`）。
    - 提供更好的安全控制（如 `sandbox` 属性）
    - 下载文件一般使用 `iframe`
- **`<embed>`**：
    - 主要用于嵌入需要插件才能显示的内容，如 Flash、PDF 等。
    - 更适合嵌入单一类型的媒体或应用程序。现已很少见

|属性|值|描述|
|:--|:--|:--|
|[height](https://www.runoob.com/tags/att-embed-height.html)|_pixels_|规定嵌入内容的高度。|
|[src](https://www.runoob.com/tags/att-embed-src.html)|_URL_|规定被嵌入内容的 URL。|
|[type](https://www.runoob.com/tags/att-embed-type.html)|_MIME_type_|规定嵌入内容的 MIME 类型。  <br>注：MIME = Multipurpose Internet Mail Extensions。|
|[width](https://www.runoob.com/tags/att-embed-width.html)|_pixels_|规定嵌入内容的宽度。|
#### figure
- 一个语义化标签，用于表示自包含的内容单元，通常与可选的 `<figcaption>` 标签一起使用，以提供内容的标题或说明。
- 旨在将相关内容（如图像、图表、代码片段、插图等）**组织在一起**，使其**在语义上与主内容分离**，同时保持与主内容的关联性。
- figure 一般用于展示多种组合在一起的内容并未他们提供**描述性内容**，保持他们独立性的同时方便维护和调整样式。
- 每一个 figure 中 figcaption 会作为描述性文本显示在所对应的 figure 外
figure 中有几个常用的 ARIA **描述性属性**
##### role
`role 和 a` ria-l `abelledby 都是为了增` 强语义从而出现的属性，用于描述所对应的 figure 或其他元素的内容，提高网页访问性
用于明确指示元素的角色（role），即元素在用户界面中**功能或行为**。例如，`role="figure"` 明确指示该元素是一个“图”。尽管可以对这个属性写入**自定义值**，但在规范中需尽量写入和描述内容有关的字符，如 figure，img，audio 等
##### aria-labelledby
- **`aria-labelledby` 属性**：用于将一个或多个元素指定为当前元素的标签（label），从而提供更具体的描述或说明。
- `aria-labelledby` 支持使用多个元素的 id 作为其值，而 ` aria-label` 直接为所对应的 figure 对象提供了标签文本（自定义内容），而无需引用其他元素。
##### 实例
```html
<figure role="cow-char-img" aria-label="char-img">
    <pre>
        ___________________________
        < I'm an expert in my field. >
          ---------------------------
                 \   ^__^
                  \  (oo)\_______
                     (__)\       )\/\
                         ||----w |
                         ||     ||
    </pre>
    <caption id="cow-char-img-caption">
        A cow saying, "I'm an expert in my field." The cow is illustrated using preformatted text characters.
    </caption>
</figure>
```
显示效果：
![[Pasted image 20250114202443.png]]
#### param
用于向嵌入的插件（如 `<object>` 或 `<embed>` 元素）传递参数。它允许开发者为嵌入的外部内容或应用程序提供配置选项或初始化参数。以下是对 `<param>` 标签的详细解释，包括其用途、语法、属性以及使用场景。
一般在网页中使用各种插件，为插件传递参数（下面是插入一个 flash）
```html
<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="550" height="400">
    <param name="movie" value="movie.swf">
    <param name="quality" value="high">
    <param name="bgcolor" value="#ffffff">
    <embed src="movie.swf" quality="high" bgcolor="#ffffff" width="550" height="400" type="application/x-shockwave-flash">
    </embed>
</object>
```
name （定义参数名称），value（定义参数的值）必不可少，type 描述插件的 MIME 类型，valuetype 表示数值类型
#### picture
- 不同于 img 标签，`picture` 根据屏幕匹配的不同尺寸显示不同图片，如果没有匹配到或浏览器不支持 picture 属性则使用 img 元素（并不是替换关系，不支持 picture 则不会显示所有 picture 中**所有除 img 标签的元素**）
- 由于 picture 要加载的图片参数由其中标签（如 `source`）提供，而不再只由 img 中属性提供，有更高灵活性
- 其中零或多个 [`<source>`](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/source "HTML <source> 元素为 <picture>, <audio> 或者 <video> 元素指定多个媒体资源。这是一个空元素。它通常用于以不同浏览器支持的多种格式提供相同的媒体内容。") 元素，以及紧随其后的一个 [`<img>`](1ab7cc35dfaee68959ff5d876aaeda02.html) 元素，可以混合一些脚本支持的元素。
- **`<picture>` 标签**：用于根据不同条件提供不同的图像源，增强响应式设计和图像格式兼容性。
- **`<source>` 标签**：
    - **`srcset`**：指定图像源及其描述符。
    - **`media`**：定义媒体查询条件，元素的依据的媒体条件 (media condition)（类似于媒体查询）。如果这个媒体条件匹配结果为 false，那么这个 `<source>` 元素（不是 img 元素）会被跳过。
    - **`sizes`**：定义图像在不同视口宽度下的尺寸。
    - **`type`**：指定图像的 MIME 类型。
- **`<img>` 标签**：作为回退，确保在所有 `<source>` 都不适用时提供默认图像。
---
- **浏览器处理顺序**：
1. **类型匹配 (`type`)**：浏览器首先根据 `type` 属性检查是否支持该 `<source>` 元素指定的 MIME 类型（例如 `image/webp` 或 `image/jpeg`）。
	- 如果浏览器不支持该类型，则跳过该 `<source>` 元素。
2. **媒体查询匹配 (`media`)**：如果 `type` 匹配成功，浏览器会检查 `media` 属性中媒体查询条件。
	- 如果媒体查询条件不满足，则跳过该 `<source>` 元素。
3. **选择合适的 `srcset`**：如果 `type` 和 `media` 都匹配成功，浏览器会根据 `srcset` 从中找出图像资源，根据 `sizes` 属性提供的尺寸信息和当前视口大小，计算出所需的图像显示宽度
4. srcset 中图像描述符用来描述图像大小，以便后面的 sizes 属性计算出最适合当前视口显示的图片， `300w` 表示图像宽度为 300 像素
---
sizes 标签定义图像在不同视口宽度下的预期显示宽度。它告诉浏览器图像在不同的布局断点下应该占据多少视口宽度。语法为：一个或多个由逗号分隔的**“媒体查询-宽度”**对。例如，`"(max-width: 600px) 100vw, 50vw"` 表示：
- 当视口宽度小于或等于 600 像素时，图像宽度为 100% 视口宽度。
- 否则，图像宽度为 50% 视口宽度。
sizes 和 srcset 中描述内容用来帮助浏览器*做出最好的决策*，但真正决定的是 CSS
```html
<picture>
    <source srcset="image-small.webp 300w, image-large.webp 600w" type="image/webp" media="(max-width: 600px)" sizes="100vw">
    <source srcset="image-small.jpg 300w, image-large.jpg 600w" type="image/jpeg" media="(max-width: 600px)" sizes="100vw">
    <source srcset="image-small.webp 600w, image-large.webp 1200w" type="image/webp" media="(min-width: 601px)" sizes="50vw">
    <source srcset="image-small.jpg 600w, image-large.jpg 1200w" type="image/jpeg" media="(min-width: 601px)" sizes="50vw">
    <!-- 回退的 <img> 元素 -->
    <img src="image-fallback.jpg" alt="描述文本">
</picture>
```
1.**浏览器按顺序检查每个 `<source>` 元素**：
- **第一个 `<source>`**：
    - **类型匹配**：如果浏览器支持 `image/webp`。
    - **媒体查询匹配**：如果视口宽度小于或等于 600 像素。
    - **选择图像**：根据 `srcset` 和 `sizes="100vw"`，选择 `image-small.webp`（300w）。
省略中间 `<source>` 匹配过程，如果都不支持则回退到 img
2.**选择图像后**：
- 浏览器根据 `srcset` 中描述符选择最合适的图像资源。
- 实际的图像显示大小由 CSS 控制，`sizes` 属性仅用于帮助浏览器选择图像资源。
#### Ruby
用于与 rp、rt 搭配显示东亚文字的注音，注解等内容
```html
<ruby>
    漢 <rp>(</rp><rt>han</rt><rp>)</rp>
    字 <rp>(</rp><rt>zi</rt><rp>)</rp>
</ruby>
```
- `<rp>(</rp>`：如果浏览器不支持 ruby，则显示左括号 `(`。
- `<rt>zi</rt>`：提供汉字的拼音 `zi`。
- `<rp>)</rp>`：如果浏览器不支持 ruby，则显示右括号 `)`。
不支持情况下的渲染
![[Pasted image 20250115124857.png]]
支持情况下
![[Pasted image 20250115124917.png]]
#### section
用于定义文档中一个独立部分或章节。它用于将相关内容组织在一起，使其在语义上与主内容分离，类似于 field， div 和 span 等，将不同内容组合在一起，但 `div` 是一个**通用容器标签**，没有明确的语义
主要作用是让 html 文档和网页更有可读性，更强组织性
```html
<main>
    <h1>主内容标题</h1>
    <p>这是主内容。</p>
</main>

<aside>
    <section>
        <h2>相关链接</h2>
        <ul>
            <li><a href="#">链接1</a></li>
            <li><a href="#">链接2</a></li>
        </ul>
    </section>
    <section>
        <h2>广告</h2>
        <p>这里是广告内容。</p>
    </section>
</aside>
```
![[Pasted image 20250115133600.png|299]]
#### nav
用于定义文档中**导航部分**（创建一个导航栏时用到，如主菜单、侧边栏导航、页脚导航等）。它用于包含一组导航链接，帮助用户在不同页面或同一页面的不同部分之间导航
用这个标签更好展示网站的结构（也有一些**辅助技术**可以识别 nav 标签，提供更好的网站设计），其中一般放入导航目录
```html
<nav>
    <ul>
        <li><a href="#home">首页</a></li>
        <li><a href="#about">关于我们</a></li>
        <li><a href="#services">服务</a></li>
        <li><a href="#contact">联系我们</a></li>
    </ul>
</nav>
```
常用的网站结构：
![[Pasted image 20250115140116.png]]
```html
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>common webpage</title>
    <style>
        body{
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 0;
        }
        header, footer{
            background-color: #f2f2f2;
            padding: 10px;
            text-align: center;;
        }
        section{
            padding: 20px;
            margin: 20px;
            border: 1px solid #ccc;
        }
        nav ul{
            list-style: none;
            padding: 0;
        }
        nav ul li{
            display: inline-block;
            margin: 0 10px;
        }
    </style>
</head>
<body>
    <header>
        <nav>
            <h1>Webpage Title</h1>
            <ul>
                <li><a href="#home">home</a></li>
                <li><a href="#server">server</a></li>
                <li><a href="#about">about</a></li>
                <li><a href="#contact">contact us</a></li>
            </ul>
        </nav>
    </header>
        <main>
        <section id="home">
            <h1>Main page</h1>
            <p>welcome to our page</p>
        </section>
        <section id="server">
            <h1>Our server</h1>
            <strong>Server1</strong>
            <p>this is introduction</p>
            <strong>Server2</strong>
            <p>this is introduction</p>
        </section>
        <section id="contact">
            <h1>contact us</h1>
            <p>click <a href="www.baidu.com">here</a> to contact us</p>
        </section>
    </main>
    <footer>
        @copyright sickwag
    </footer>
</body>
</html>
```
#### template
`<template>` 用于在 HTML 中定义一段不立即渲染的内容。这段内容可以是任何有效的 HTML 结构，包括嵌套的元素、文本、脚本等。有通过 JavaScript 动态地克隆和插入到 DOM 中时，才会显示。
只有需要（手动或被动激活）时才会显示内容，下面创建一个复用模块
```html
<body>
    <template id="itemTemplate">
    <!-- 这个div中内容是复用的组件 -->
        <div class="item">
            <h3 class="item-title"></h3>
            <p class="item-description"></p>
        </div>
    </template>

    <div id="container"></div>

    <script>
        const template = document.getElementById('itemTemplate').content;
        const items = [
            { title: '项目1', description: '这是项目1的描述。' },
            { title: '项目2', description: '这是项目2的描述。' },
            { title: '项目3', description: '这是项目3的描述。' }
        ];
        // 遍历数据数组，克隆模板并插入内容
        items.forEach(item => {
            const clone = template.cloneNode(true);
            clone.querySelector('.item-title').textContent = item.title;
            clone.querySelector('.item-description').textContent = item.description;
            document.getElementById('container').appendChild(clone);
        });
    </script>
</body>
```
#### track
为媒体元素（比如 ` <audio>` and `<video>`）规定外部文本轨道，也就是字幕，字幕格式有 WebVTT 格式（.vtt 格式文件）。

| 属性                                                               | 值                                                                     | 描述                                             |
| :--------------------------------------------------------------- | :-------------------------------------------------------------------- | :--------------------------------------------- |
| [default](https://www.runoob.com/tags/att-track-default.html) | default                                                               | 规定该轨道是默认的。如果用户没有选择任何轨道，则使用默认轨道。                |
| [kind](https://www.runoob.com/tags/att-track-kind.html)       | captions  <br>chapters  <br>descriptions  <br>metadata  <br>subtitles | 规定文本轨道的文本类型。                                   |
| [label](https://www.runoob.com/tags/att-track-label.html)     | _text_                                                                | 规定文本轨道的标签和标题。                                  |
| [src](https://www.runoob.com/tags/att-track-src.html)         | _URL_                                                                 | 必需的。规定轨道文件的 URL。                               |
| [srclang](https://www.runoob.com/tags/att-track-srclang.html) | _language_code_                                                       | 规定轨道文本数据的语言。如果 kind 属性值是 "subtitles"，则该属性是必需的。 |

#### video
放置视频元素

| 属性                                                              | 值                            | 描述                                                  |
| :-------------------------------------------------------------- | :--------------------------- | :-------------------------------------------------- |
| [autoplay](https://www.runoob.com/tags/att-video-autoplay.html) | autoplay                     | 如果出现该属性，则视频在就绪后马上播放。                                |
| [controls](https://www.runoob.com/tags/att-video-controls.html) | controls                     | 如果出现该属性，则向用户显示控件，比如播放按钮。                            |
| [height](https://www.runoob.com/tags/att-video-height.html)     | _pixels_                     | 设置视频播放器的高度。                                         |
| [loop](https://www.runoob.com/tags/att-video-loop.html)         | loop                         | 如果出现该属性，则当媒介文件完成播放后再次开始播放。                          |
| [muted](https://www.runoob.com/tags/att-video-muted.html)       | muted                        | 如果出现该属性，视频的音频输出为静音。                                 |
| [poster](https://www.runoob.com/tags/att-video-poster.html)     | _URL_                        | 规定视频正在下载时显示的图像，直到用户点击播放按钮。                          |
| [preload](https://www.runoob.com/tags/att-video-preload.html)   | auto  <br>metadata  <br>none | 如果出现该属性，则视频在页面加载时进行加载，并预备播放。如果使用 "autoplay"，则忽略该属性。 |
| [src](https://www.runoob.com/tags/att-video-src.html)           | _URL_                        | 要播放的视频的 URL。                                        |
| [width](https://www.runoob.com/tags/att-video-width.html)       | _pixels_                     | 设置视频播放器的宽度。                                         |

#### wbr
`<wbr>` 只是提供了一个换行机会，浏览器根据需要决定是否换行。
```html
长单词示例：Super<wbr>cali<wbr>fragilistic<wbr>expiali<wbr>docious
```
- 将 `<wbr>` 放在希望浏览器考虑换行的位置。
- **多次使用**：可以在一个长单词或字符串中多次使用 `<wbr>`，提供多个换行机会。
- **与 CSS 的结合**：虽然 `<wbr>` 提供了换行机会，但具体的换行行为还取决于 CSS 的 `word-break` 和 `overflow-wrap`（以前称为 `word-wrap`）属性。
可以用于长单词换行或者长 URL 换行
```html
<p> our website <a href="www.<wbr>baidu.<wbr>com">www.baidu.com</a></p>
```
![[Pasted image 20250115150425.png|可以直接写在网址中间]]

### HTML5 重要元素
#### canvas
canvas 元素本身是没有绘图能力的。所有的绘制工作必须在 JavaScript 内部完成，样式由 CSS 决定，但 js 决定画什么样的图
同大部分绘图图形库，左上角为原点
```html
<body>
    <canvas id="red_rectangle_canvas" width="150" height="75"></canvas>
    <script id="red_rectangle">
        // 红色长方形
        var content = document.getElementById('red_rectangle_canvas')
        var ctx = content.getContext("2d");
        ctx.fillStyle="#FF0000"
        ctx.fillRect(0,0,150,75);
    </script><br>
    <canvas id="a_routine_canvas" width="200" height="100"></canvas>
    <script id="a_routine">
        // a line
        var content=document.getElementById('a_routine_canvas');
        var ctx = content.getContext("2d");
        ctx.moveTo(0,0);
        ctx.lineTo(200,100)
        ctx.stroke()
        </script><br>
    <canvas id="a_circle" width="200" height="150"></canvas>
    <script id="draw_a_circle">
        // drew a circle
        var content = document.getElementById('a_circle');
        var ctx = content.getContext("2d");
        ctx.beginPath();
        ctx.arc(100,75,50,0,2*Math.PI);
        ctx.fill()
        ctx.stroke();
        </script><br>
    <canvas id="text_canvas" width="200" height="100"></canvas>
    <script id="draw_text">
        // a text
        var content = document.getElementById('text_canvas');
        var ctx = content.getContext("2d");
        ctx.font="30px Arial";
        ctx.fillText("hello world",10,50)
    </script><br>
    <canvas id="gradient_rect" width="200" height="150"></canvas>
    <script id="draw_gradient_rect">
        // drew a gradient rectangle
        var c=document.getElementById("gradient_rect");
        var ctx=c.getContext("2d");
        var grd=ctx.createLinearGradient(0,0,200,0);
        grd.addColorStop(0,"red");
        grd.addColorStop(1,"white");
        ctx.fillStyle=grd;
        ctx.fillRect(10,10,150,80);
    </script><br>
    <img src="./src/imgs/img_the_scream.jpg" alt="a picture of van gogh" id="scream"><br>
    <canvas id="put_a_image" width="300" height="300"></canvas>
    <script>
        // put a image
        var content = document.getElementById('put_a_image');
        var ctx = content.getContext("2d");
        var img = document.getElementById("scream");
        function drawpic(){
            ctx.drawImage(img,10,10);
        }
    </script>
</body>
</html>
```
实现效果：
![[Pasted image 20250115160331.png]]
### SVG
HTML5 支持内联 SVG，内置标签 `<svg>` 元素是 SVG 图形的容器，使用 XML 描述图形内容，而 canvas 通过 JavaScript 绘制
在 SVG 中，每个被绘制的图形均被视为**对象**。如果 SVG 对象的属性发生变化，那么浏览器能够自动重现图形。
Canvas 是逐像素进行渲染的。在 canvas 中，一旦图形被绘制完成，它就不会继续得到浏览器的关注。如果其位置发生变化，那么整个场景也需要重新绘制
```html
<body>
   <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
       <circle cx="100" cy="50" r="40" stroke="black" stroke-width="2" fill="red" />
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" height="190">
       <polygon points="100,10 40,180 190,60 10,60 160,180"        style="fill:lime;stroke:purple;stroke-width:5;fill-rule:evenodd;">
     </svg>
</body>
```

![[Pasted image 20250115163824.png]]
#### HTML5 拖放（Drag 和 Drop）
拖放是一种常见的特性，即抓取**对象**以后拖到另一个位置。
在 HTML5 中，拖放是标准的一部分，**任何元素**都能够拖放。
拖放逻辑通过 JavaScript 实现
```html
<script>
	function allowDrop(ev){
	    ev.preventDefault();
	}

	function drag(ev){
	    ev.dataTransfer.setData("Text",ev.target.id);
	}

	function drop(ev){
	    ev.preventDefault();
	    var data=ev.dataTransfer.getData("Text");
	    ev.target.appendChild(document.getElementById(data));
	}
</script>
<body>
	<p>拖动 RUNOOB.COM 图片到矩形框中:</p>

	<div id="div1" ondrop="drop(event)" ondragover="allowDrop(event)"></div>
	<br>
	<img id="drag1" src="/images/logo.png" draggable="true" ondragstart="drag(event)" width="336" height="69">
</body>
```
---
- 浏览器默认不允许拖动和放置，都需 `preventDefault()` 函数阻止
- 通过调用 `allowDrop` 函数，可以使放置目标允许放置被拖动的元素。
1. 用户拖动 `#drag1` 元素。
2. `dragstart` 事件触发，调用 `drag` 函数，设置拖动数据。
3. 用户将元素拖到 `#dropzone` 上，`dragover` 事件触发，调用 `allowDrop` 函数，允许放置。
4. 用户释放鼠标，`drop` 事件触发，调用 `drop` 函数，将元素放置到 `#dropzone` 中

---
- draggable 是通用属性，设置为 true 表示元素对象可以拖动
- `ev.preventDefault();`：调用 `preventDefault()` 方法可以阻止浏览器执行与拖放相关的默认操作。在 `dragover` 事件中，浏览器默认不允许放置（drop）操作。通过调用 `preventDefault()`，可以覆盖这种默认行为，从而允许放置操作。
- `ev.dataTransfer.setData("Text", ev.target.id);`：使用 `setData` 方法将数据存储在拖动数据传递对象 (`dataTransfer`) 中。第一个参数表示**数据的 MIME 类型为文本**，第二个参数 `ev.target.id`，即被拖动元素的 `id`。
- `ev.target.appendChild(document.getElementById(data));`：将被拖动元素追加到放置目标的子节点中，实现放置效果。