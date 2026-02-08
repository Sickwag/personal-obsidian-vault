## 基础知识
### 快速入门
[十七分钟CSS快速入门 | 无废话且清晰流畅 | WEB前端必备程序语言~哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1Ci4y1W7H7/?spm_id_from=333.1387.homepage.video_card.click&vd_source=876be08bc9c030f4a9ea1fb97e0d0342)
#### 选择器对应关系
要对 html 中**对应**元素样式调整，**选择器应运而生**，id 选择器最精准，html 允许多个标签class 属性相同，元素选择较容易造成污染
![[Pasted image 20250115213118.png|525]]
如果需要对有**父子类层级关系**的元素使用样式，遵循语法
`.parent .child{/*css styles*/}`
![[Pasted image 20250115213427.png]]
或者嵌套 CSS 样式
![[Pasted image 20250115213510.png]]
一个标签**可以继承多个类**，用空格分开，获取多个 CSS 样式
- `font-family` 声明中可以放入多种字体，浏览器回从前至后依次读取直到有一款字体可用
- `font-size` 设置字体大小
- `line-height` 设置行高
- `font-style` 设置 Italic 斜体等样式
- `text-decoration` 设置 underline 下划线样式
- `font-weight` 设置字体粗细
#### 盒子模型
浏览器中可以**选中元素后**可以在*元素窗口中*检视各种标签的元素构成和 CSS 样式在**盒子模型中构成**
![[Pasted image 20250115214337.png]]
盒子模型在网页开发中较为常用
![[Pasted image 20250115214456.png]]
![[Pasted image 20250115214705.png|鼠标可视化查看]]
margin 和 padding 都有上下左右之分，`margin-direction` 设置对应属性，也可以 `margin: top right down left` 上右下左顺序
边框声明需要三个参数，粗细 px，边框类型，边框颜色

---
内联和块级：
- 可以手动在 css 中设置 display 声明值为 `block` 、`inline`、`inline-block` 或 `none` 讲一个元素设置为块级或内联元素，**内联元素不能设置宽和高**，但内联块级元素可以，display 中设置 `inline-block` 即可实现，`none` 元素说明这个标签**不可见**

#### 布局模型
---
##### 弹性容器布局
- 如果设置一个**容器**（div）为弹性容器（`class=flex`），会将容器中所有标签定义为**弹性标签（或弹性项目）**。
![[Pasted image 20250115215803.png]]
- flex 容器默认是**水平的**，可通过 `flex-direction=column` 调整为纵向的
- 对弹性项设置 flex 属性可以调整其占用空间，占用空间比例的计算方法是：
根据一个弹性容器中 `flex 属性值 / 所有弹性项目 flex 值的总和` 计算占据屏幕比例
更方便的方法是在一个弹性容器中**再继承一个具有 gap 属性的声明**，实现分割
![[Pasted image 20250115220312.png]] ^rdb1pp
- 每个弹性容器都有一个**主轴**，如果 `flex-direction=row` 则主轴为横轴，反之纵轴
- flex 容器中应用的 CSS 样式声明 `justify-content` 根据主轴方向调整弹性容器中元素**垂直于主轴方向上的排列方式**
	- 如主轴为横轴，声明值：
	- `flex-start` 表示对齐主轴开始位置，元素否会放在**弹性容器横向方向上的最左边**，这里指设置了 `justify-content` 所以纵向排列没有设置默认顶端、
	- `center` 表示主轴中间
	- `flex-end` 表示主轴末尾
	- `space-around` 表示：![[Pasted image 20250115221244.png|粉色为弹性容器范围]]
	- `space-between` 表示：![[Pasted image 20250115221345.png]]
- `item-align` 同理，连**上面提到的声明值**都一样

---
##### 网格布局
网格布局需要一个**父元素并将其 `display` 声明值设置为 `grid`**，注意不是将 class 设置为 grid 就可以，类名是可以随便定义的，而 display 值**暂时只能从预设里选**
在一个 display 为 grid 的容器中，每一个字容器的排列都**按照样式表中安排排列**
```html
<body>
    <link rel="stylesheet" href="./src/css/temp.css">
    <div class="grid">
        <div>grid project</div>
        <div>grid project</div>
        <div>grid project</div>
        <div>grid project</div>
    </div>
</body>
```
css 中 `grid-template-columns` 的计算方法同[[CSS#^rdb1pp|弹性容器中flex声明值]]
```css
.grid{
    display: grid;
    grid-template-rows: 100px 200px 300px;
    grid-template-columns: 1fr 2fr;
}
```
![[Pasted image 20250115222330.png]]
`grid-template-columns` 可以设置 `repeat(repeat_times,grid_weight)` 来简化书写
template 表示手动设置模板，也可以换成 auto 自动调节**一行或者一列**样式
![[Pasted image 20250115222901.png]]
```css
.grid{
    display: grid;
    grid-template-columns: repeat(4,1fr);
    grid-auto-columns: 1fr;
    grid-auto-rows: 100px;
}
```

---
#### 元素定位
四种定位模式使用 position 声明决定
```html
<div class="relative">关系定位</div>
<div class="absolute">绝对定位</div>
<div class="fixed">固定定位</div>
<div class="static">静态定位</div>
```
- relative 相对自身正常位置定位
- absolute 相对于离他最近的**非静态(static)定位元素的父元素**定位
- fixed 固定定位相对于浏览器窗口
如果希望元素相对谁，就将*参考系*设置为相对定位 relative
![[Pasted image 20250115224941.png]]
```html
<div id="outside" class="relative">
    <div id="inside" class="absolute">绝对定位内容</div>
</div>
```
```css
.relative{
    position: relative;
    height: 200px;
    background-color: violet;
}
.absolute{
    position: absolute;
    right: 0;
    bottom: 0;;
}
```
- 这样写时在 outside 容器中使用绝对位置（因需要定义位置的 inside 容器 position 类型是 absolute）定义 inside 容器，inside 容器应为外部是 relative （就像一个普通的 html 标签，位置该怎么排怎么排）的容器
- absolute 作为 position 声明值的选择器，是**按照声明方向确定原点**
- 声明值还可以为**百分数**
- fixed 可以让元素在相对于浏览器窗口位置**固定**，常用于导航栏、侧边栏
![[PixPin_2025-01-15_23-00-32.mp4]]