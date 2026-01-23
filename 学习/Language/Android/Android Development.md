# 官网文档学习
## 创建你的首个 android 应用
参考教程：官方开发者文档 : [创建你的首个 android 应用](https://developer.android.google.cn/codelabs/basic-android-kotlin-compose-first-app?continue=https%3A%2F%2Fdeveloper.android.com%2Fcourses%2Fpathways%2Fandroid-basics-compose-unit-1-pathway-2%23codelab-https%3A%2F%2Fdeveloper.android.com%2Fcodelabs%2Fbasic-android-kotlin-compose-first-app&%3Bhl=zh-cn&hl=zh-cn#8)
![[MainActivity 1.kt|完整代码]]
### 使用模板创建应用
![[Pasted image 20250108105618.png]]
右上角的 Split 按钮**同时看到代码和设计**
- **Project** 视图 (1) 用于显示项目的文件和文件夹
- **Code** 视图 (2) 是您修改代码的地方
- **Design** 视图 (3) 是您预览应用外观的地方
 这是右边 design 显示的是现在这个项目所构成的所有对象，**只展示对象**
![[Pasted image 20250108105908.png]]
### 查找项目文件
Android 视图下
![[Pasted image 20250108110253.png]]
manifests 中主要用来存放 **AndroidManifest.xml** 文件。这个文件是 Android 应用的**清单文件**，它包含了应用的基本信息和配置
**AndroidManifest.xml 文件的作用**：
声明应用的组件
- **Activity（活动）**：应用的界面组件。
- **Service（服务）**：在后台运行的组件。
- **BroadcastReceiver（广播接收器）**：接收和处理广播消息的组件。
- **ContentProvider（内容提供者）**：用于在不同应用之间共享数据的组件。
使用项目文件视图看到的就是软件包中真实的文件排列
![[Pasted image 20250108110653.png]]
### 更新文本
#### 程序入口
- `onCreate()` 函数是此应用的入口点，并会调用其他函数来构建 UI。在 Kotlin 程序中，`main()` 函数是 Kotlin 编译器在代码中开始编译的特定位置；在 Android 应用中，则是由 `onCreate()` 函数来担任这个角色。
- `onCreate()` 函数中 [`setContent()`](https://developer.android.google.cn/reference/kotlin/androidx/compose/ui/platform/ComposeView?hl=zh-cn#setContent(kotlin.Function0)) 函数用于通过可组合函数定义布局。任何标有 `@Composable` 注解的函数都可通过 `setContent()` 函数或其他可组合函数进行调用。
#### Composable 组合函数**注解**
- 在 `MainActivity.kt` 中，一个函数前声明 `@composable` 的作用：
- `@Composable` 是 **Jetpack Compose** 提供的一个注解，用于标记一个函数为可组合函数（Composable Function）。可组合函数是构建 UI 的基本单元，它们可以描述 UI 并且能够根据状态的变化自动更新 UI。
	1. **声明可组合函数**：
	- 使用 `@Composable` 注解的函数可以被 Compose 编译器识别，并生成相应的 UI 组件
	2. **自动管理 UI 更新**：
	- 可组合函数可以根据传入的状态（State）自动重新组合（recompose），即当状态变化时，UI 会自动更新，无需手动操作 DOM 或视图层次结构。
	3. **支持声明式编程范式**：
	- 与传统的命令式 UI 开发不同，Compose 采用声明式编程范式，开发者只需描述 UI 的样子，而不需要关心 UI 的具体更新过程。
- `@Composable` 函数名称采用首字母大写形式。
- 需在该函数前面添加 `@Composable` 注解。
- `@Composable` 函数无法返回任何内容。
![[Pasted image 20250108112526.png]]
> 使用 `@Composable` 注解的函数确实被设计用来描述 UI 的结构和行为，并且通常在 `setContent` 函数中使用，让编译器将其解释为一个 UI 组件
> setContent 的作用是：将一个可组合的 UI 树（Composable UI Tree）设置为当前活动（Activity）的 UI 内容。
#### DefaultPreview 函数
```kotlin
@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    Follow_officialTheme {
        Greeting("Android")
    }
}
```
![[Pasted image 20250108114808.png|400]]
- `Greeting`函数显示出text中文本内容，由于使用了`@Composable`注解表示这个函数将被解析为一个UI
- `GreetingPreview`由于使用了`@Preview`注解，这个函数将会只在代码编辑页面需要显示页面预览的时候调用并将预览页面的背景设置为显示状态（`showBackground = true`），并因`@Composalble`注解将他解释为一个UI，函数将会调用其中Follow_ofiicial函数，进而调用`Greeting`函数来在预览页面显示文本内容
- 使用`@Preview` 注解的函数只在`Preview`页面中被调用不会打包进 apk
- **最终**，`onCreate` 函数中 `setContent` 函数将其中 `Follow_official` 函数作为一个 UI 解释并显示在最终将 `Greeting `而不是 `GreetingPreview `打包进 apk 中
- 但**如果预览函数中参数和实际参数不一样而两者未分离**会导致预览代码中参数覆盖原始代码的参数而最呈现预览代码在 App 中
#### 更改背景颜色
需要使用 [`Surface`](https://developer.android.google.cn/reference/kotlin/androidx/compose/material/package-summary?hl=zh-cn#Surface(androidx.compose.ui.Modifier,androidx.compose.ui.graphics.Shape,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.foundation.BorderStroke,androidx.compose.ui.unit.Dp,kotlin.Function0)) 将文本包围起来。`Surface` 是一个容器，代表界面的某一部分，您可以在其中更改外观（如背景颜色或边框）
![[Pasted image 20250108122322.png]]
![[Pasted image 20250108122309.png]]
添加一个 Box 容器（也可以用其他，如 Surface），surface 匀速 color 参数，在 import 中导入相应的包使用
```kotlin
Surface(color = Color.Magenta) {
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}
```
设置文本背景颜色（类似于 HTML）
#### 添加内边距
在 Greeting 函数中调整 modifier 参数 `modifier = Modifier.padding(24.dp)`（使用 dp 单位需要导入 `import androidx.compose.ui.unit.dp`）可以创建内边距
使用的边距类型由 `setContent` 中 `Greeting` 函数控制 `modifier = Modifier.padding(innerPadding)`

##  创建交互式 Dice Roller 应用
参考教程[创建交互式 Dice Roller 应用](https://developer.android.google.cn/codelabs/basic-android-kotlin-compose-build-a-dice-roller-app?hl=zh-cn&continue=https%3A%2F%2Fdeveloper.android.google.cn%2Fcourses%2Fpathways%2Fandroid-basics-compose-unit-2-pathway-2%3Fhl%3Dzh-cn%23codelab-https%3A%2F%2Fdeveloper.android.com%2Fcodelabs%2Fbasic-android-kotlin-compose-build-a-dice-roller-app#0)
![[MainActivity.kt]]
### 建立标准
在新的项目中去除关于 `Greeting` 有关的内容替换为 DIce Roller
```kotlin
@Composable
fun DiceWithButtonAndImage(modifier: Modifier = Modifier) {

}

@Preview
@Composable
fun DiceRollerApp() {
    DiceWithButtonAndImage(modifier = Modifier.fillMaxSize())
}
```
### 创建布局架构
#### 基本骨架
- 使用 DiceWithButtonAndImage 中传入的 modifier 对象会因 `fillMaxSize` 填满整个屏幕
- 将 `wrapContentSize()` 方法链接到 `Modifier` 对象，然后传递 `Alignment.Center` 作为实参以将组件居中。`Alignment.Center` 会指定组件同时在水平和垂直方向上居中。
#### modifier 作用和工作原理
`Modifier` 是 Jetpack Compose 提供的一种 **用于描述 UI 元素行为和布局的对象**，它可以**链式调用**来组合多个功能。
简单来说，`Modifier` 是 Compose 中属性设置工具，它可以修改、扩展或调整**可组合函数**的外观和行为。
**Modifier 是一种声明式的属性设置工具**，可以在组件树中**向下传递**并对 UI 元素进行调整。
- 在 `DiceWithButtonAndImage(modifier: Modifier = Modifier)` 中，你将 `modifier` 定义为一个默认值 `Modifier`。默认情况下，这只是一个“**空的修饰器**”（即没有任何样式或行为），不会对 UI 布局产生影响。
- 然而，当调用方（比如 `@Preview` 或 `setContent`）传递了一个非空的 `Modifier`，如 `Modifier.fillMaxSize().wrapContentSize()`，这个修饰器会覆盖默认值，作为最终的 `modifier` 参数。
### 创建垂直布局
```kotlin
fun DiceWithButtonAndImage(modifier: Modifier = Modifier) {
    Column (modifier = modifier, horizontalAlignment = Alignment.CenterHorizontally){}
}
```
在调用的时候创建一个 `Column` 保证内容子项相对于宽度在设备屏幕上居中
### 添加按钮和图片
- 按钮：
在 UI 元素函数中设置
```kotlin
fun DiceWithButtonAndImage(modifier: Modifier = Modifier) {
    Column (modifier = modifier, horizontalAlignment = Alignment.CenterHorizontally){
        Button(onClick = {/*todo*/}) {
            Text(stringResource((R.string.roll)))
        }
    }
}
```
这需要再 res 文件夹 string 资源中创建一个 name 属性为 roll 的 String 标签，Text 将会显示标签的内容
- 图片
图片使用工具窗口中 Resource Manage 导入图片，布局等资源，Compose 本身会**依序放置界面组件**。也就是说，哪个可组合函数声明在先，就会先行显示。
所以需要在 Button 之前创建图片元素，由于图片是一种布局而不是 UI 元素，只需要显示而不需要行为逻辑，所以不需要函数调用
- 调整元素位置
如果需要调整元素间距，可以使用 `spacer` 对象
### 构建掷骰子逻辑
##### 随机逻辑创建
首先是按一下 Button 掷一次骰子
- Button 中 `onClick` 函数大括号代表所谓的“lambda”，大括号内的区域是 lambda 正文。将函数作为实参进行传递时，相应过程也可称为[回调](https://en.wikipedia.org/wiki/Callback_(computer_programming))。
- 变量 `result` 存储骰子结果 `var result = 1`
- `Button(onClick = { result = (1..6).random()})` 点击时随机一个数
##### 组合函数特性
无状态：
- **函数本身不存储任何数据或状态**。每次调用函数时，函数会根据传入的参数重新计算和生成 UI。
- 可组合函数没有内部的长期状态存储机制（例如成员变量或全局变量），所有的状态都需要通过**外部传入**或者由**状态管理机制**提供（如 `remember` 或 `State`）。
声明式 UI
- Jetpack Compose 是基于**声明式 UI 编程模型**，在这种模型中，UI 是由当前的应用状态驱动的。状态的变化会触发重新构建（重组）整个界面，确保 UI 始终与状态保持同步。
- UI 的状态仅仅取决于输入输出，可组合函数没有内部的长期状态存储机制（例如成员变量或全局变量），所有的状态都需要通过**外部传入**或者由**状态管理机制**提供（如 `remember` 或 `State`）。

> 函数中变量发生改变如果需要函数察觉并做出相应改变，则需要将这个变量标记为可观察状态，由于@Composable 注解的函数会被解释为 UI 元素，所以通过可观察状态的变量动态调整 UI 的内容

##### 状态管理机
- **`remember`**：用于在函数作用域中记住值，避免重置。
- **`rememberSaveable`**：用于记住值，并在配置更改（如屏幕旋转）时保存状态。
- **`State` 或 `MutableState`**：Compose 内部的状态容器，状态的变化会自动触发重组。
---
状态管理机的生命周期和当前可组合函数的实例相同
- 当 `DiceWithButtonAndImage` 函数离开 UI 层次结构时（例如屏幕导航到其他页面），`remember` 管理的状态会被清理。
- 如果需要更长生命周期的状态管理（例如屏幕旋转时保持状态），可以使用 `rememberSaveable` 替代 `remember`。
---
- **`remember` 的作用**：`remember` 是一个 Compose API，用于将状态**绑定**到当前的可组合函数中，**result 的值和包含的他的函数有关**，作用是：
    - 确保变量 `result` 的值在函数的生命周期内保留。
    - 当函数被重组时（即再次调用），`result` 不会被重置为初始值，而是保留上次的值。
- **`mutableStateOf` 的作用**：创建一个可观察的状态对象（`MutableState`），当 `result` 的值变化时，Compose 会检测到并自动触发重组。
- `remember` 将这个状态与当前的可组合函数绑定，以确保在函数的生命周期内，`result` 的值不会因重组而丢失。
- `by` 委托语法，使得 `result` 可以直接访问和修改状态值，而无需使用 `.value`，将变量的值**绑定到**状态容器中，不用 `setter` 和 `getter`。
---
##### 委托语法
变量的修改，result **变量是一个对象**，修改值需要通过 `setter` 和 `getter` 实现，
```kotlin
class Delegate {
    operator fun getValue(thisRef: Any?, property: KProperty<*>): String {
        return "Value from Delegate"
    }

    operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {
        println("$value has been assigned to '${property.name}' in $thisRef")
    }
}

class Example {
    var myProperty by Delegate()
}

fun main() {
    val example = Example()
    println(example.myProperty) // 输出：Value from Delegate
    example.myProperty = "New Value" // 输出：New Value has been assigned to 'myProperty' in Example@<hash>
}
```
委托语法实质上是为了省略 setter 和 getter，让他们可以像 `pubilic` 成员变量赋值和调用 `public` 成员变量一样自然
##### 代码逻辑
```kotlin
@Composable
fun DiceWithButtonAndImage(modifier: Modifier = Modifier) {
    var result by remember { mutableStateOf(1) }
    val imageResource = when(result){
        1->R.drawable.dice_1
        2->R.drawable.dice_2
        3->R.drawable.dice_3
        4->R.drawable.dice_4
        5->R.drawable.dice_5
        else->R.drawable.dice_6
    }
    Column (modifier = modifier, horizontalAlignment = Alignment.CenterHorizontally){
        Image(
            painter = painterResource(imageResource),
            contentDescription = result.toString()
        )
        Spacer(modifier =Modifier.height(16.dp))
        Button(onClick = { result = (1..6).random()}) {
            Text(stringResource((R.string.roll)))
        }
    }
}
```
注意：
在 Kotlin 中，**函数的最后一个参数是 Lambda 表达式时，可以将它从括号 `()` 中移到外部**，这被称为 **Lambda 表达式的调用约定**。
Column 是内置的@Composable 函数，内部库中有定义，返回值是一个**具有垂直容纳空间的 UI 对象**
## UI
### Compose 编程思想
[Compose 编程思想  |  Jetpack Compose  |  Android Developers](https://developer.android.google.cn/develop/ui/compose/mental-model?hl=zh-cn)
Compose 是一种[声明性编程范式](https://developer.android.google.cn/develop/ui/compose/mental-model?hl=zh-cn#paradigm)
- 为减少手动操作视图而提高的出错可能性，该技术的工作原理是在概念上从头开始重新生成整个屏幕，然后仅执行必要的更改。此方法可避免手动更新有状态视图层次结构的复杂性。
- 为了减少性能开支，Compose 会智能地选择在任何给定时间需要重新绘制界面的哪些部分。这会对您设计界面组件的方式有一定影响，如[重组](https://developer.android.google.cn/develop/ui/compose/mental-model?hl=zh-cn#recomposition)中所述。
#### 简单可组合函数
所有可组合函数都必须带有此 `@Composable` 注释；此注释可告知 Compose 编译器：此函数旨在将数据转换为界面。
可组合函数通过调用其他可组合函数来发出界面层次结构。
发出界面的 Compose 函数不需要返回任何内容，因它们描述所需的屏幕状态，而不是构造界面 widget 传递数据
#### 声明性范式转变
- 在 Compose 的声明式方法中，widget 相对无状态，并且不提供 setter 或 getter 函数。
- 当用户与界面交互时，界面会发起 `onClick` 等事件。这些事件应通知应用逻辑，应用逻辑随后可以改变应用的状态。当状态发生变化时，系统会使用新数据**再次调用可组合函数**。这会导致重新绘制界面元素，此过程称为“**重组**”。
- 不依赖于该值的其他函数不会进行重组。
- 重组会跳过**尽可能多的内容**
- 需要高刷新率的页面，可组合函数可能被频繁调用，导致频繁重组
- 可组合函数支持**并行运行**
### 构建自适应应用
自适应应用会根据应用显示屏（主要是应用窗口大小）的变化更改布局，自适应应用不会仅仅根据不同的窗口大小拉伸或缩小界面元素，而是会替换布局组件并显示或隐藏内容。
### 界面架构
#### 生命周期
可组合项通过调用各种函数生成布局，应用状态发生变化时通过重组生成新的页面
组合只能通过初始组合生成且只能通过重组进行更新。重组是修改组合的唯一方式。
![[Pasted image 20250109132120.png]]

## Compose 布局
[Compose 布局基础知识  |  Jetpack Compose  |  Android Developers](https://developer.android.google.cn/develop/ui/compose/layouts/basics?hl=zh-cn#composable-functions)
布局系统的 Jetpack Compose 实现有两个主要目标：
- [实现高性能](https://developer.android.google.cn/develop/ui/compose/layouts/basics?hl=zh-cn#performance)
- 让开发者能够轻松编写[自定义布局](https://developer.android.google.cn/develop/ui/compose/layouts/custom?hl=zh-cn)
### Jetpack Compose 的阶段

### 基础知识
可组合函数是 Compose 的基本构建块。可组合函数是返回值为 `Unit` 的函数，用于描述界面中某一部分。该函数接受一些输入并生成屏幕上显示的内容，也就是 **UI**
一个可组合函数可能会**容纳**多个界面元素。不过在未提供任何规则的情况下，Compose 会按照默认排序方式（堆叠）排列
#### 基本布局元素
```kotlin
@Composable
fun ArtistCard() {
    Text("Alfred Sisley")
    Text("3 minutes ago")
}
```
![[Pasted image 20250108172844.png]]
这时候就需要 Compose 标准布局元素规范化内容布局
```kotlin
@Composable
fun ArtistCardColumn() {
    Column {
        Text("Alfred Sisley")
        Text("3 minutes ago")
    }
}
```
![[Pasted image 20250108180854.png]]
Row 将元素平铺
```kotlin
@Composable
fun ArtistCardRow(artist: Artist) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Image(bitmap = artist.image, contentDescription = "Artist image")
        Column {
            Text(artist.name)
            Text(artist.lastSeenOnline)
        }
    }
}
```
![[Pasted image 20250108180935.png]] Box 将包含的元素自定义对齐方式
```kotlin
@Composable
fun ArtistAvatar(artist: Artist) {
    Box {
        Image(bitmap = artist.image, contentDescription = "Artist image")
        Icon(Icons.Filled.Check, contentDescription = "Check mark")
    }
}
```
![[Pasted image 20250108181049.png]]
三种构件块
![[layout-column-row-box.svg]]
各种细致设置，Row 中子项全部向右对齐
```kotlin
@Composable
fun ArtistCardArrangement(artist: Artist) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.End
    ) {
        Image(bitmap = artist.image, contentDescription = "Artist image")
        Column { /*...*/ }
    }
}
```
![[Pasted image 20250108181315.png]]
#### 布局模型
其他布局模型：[[#可滚动布局]]、[[#列表和延迟列表]]
布局模型中，通过单次传递即可完成界面树布局。
首先，系统会要求每个节点对自身进行测量，然后以递归方式完成所有子节点的测量，并将尺寸约束条件沿着树向下传递给子节点。
再后，确定叶节点的尺寸和放置位置，并将经过解析的尺寸和放置指令沿着树向上回传。

> 所有 UI 元素中父节点会在其子节点之前进行测量，但会在其子节点的尺寸和放置位置确定之后再对自身进行调整。

```kotlin
@Composable
fun SearchResult() {
    Row {
        Image(
        )
        Column {
            Text(
            )
            Text(
            )
        }
    }
}
//////界面生成树//////////
SearchResult
  Row
    Image
    Column
      Text
      Text
```
流程简而言之就是：
1. 自树上而下，首先对出现的节点测量，如果有子节点则继续测量子节点的尺寸，没有则**报告并返回放置指令**
2. 确定完所有尺寸和节点位置之后开始摆放元素
#### 修饰符
Kotlin Jetpack Composer 中，Modifier 对象被称为*修饰符*，主要作用是**调整和修饰 UI 组件的布局和交互行为**。它们通过组合的方式提供一种声明式的方式来定义组件的外观和响应逻辑。
支持链式调用，返回值都是 Modifier 对象，常用的设置有：
```kotlin
Modifier.size(100.dp) // 设置宽高为 100dp
Modifier.fillMaxWidth() // 填满父容器的宽度
Modifier.wrapContentSize() // 仅包裹内容所需的大小
Modifier.padding(16.dp) // 设置所有方向的外边距为 16dp
Modifier.padding(start = 8.dp, top = 16.dp) // 分别设置特定方向的外边距
Modifier.background(Color.Gray) // 设置背景为灰色
Modifier.border(2.dp, Color.Red) // 设置 2dp 宽度的红色边框
Modifier.clip(RoundedCornerShape(8.dp)) // 裁剪为圆角形状
Modifier.align(Alignment.Center) // 在父容器中居中对齐
Modifier.clickable { /* 响应点击事件 */ }
Modifier.scrollable(orientation = Orientation.Vertical, state = scrollState)
```
- 一般作为**参数**放入其他 `@composable` 函数中，调节他们返回的对象的样式和行为逻辑
- 修饰符是不可变的，顺序决定效果，**后调用的修饰符会覆盖前面的某些属性**
#### 自适应布局
应对考虑不同的屏幕方向和设备类型尺寸，Composer 中提供了各种机制，其中包括了[约束条件](https://developer.android.google.cn/develop/ui/compose/layouts/basics?hl=zh-cn#constraints)，可以搭配约束条件和父类实现不同的布局
#### 可滚动布局
#### 列表和延迟列表
#### 约束条件和修饰符顺序


# Bughub 文档
[bughub Jetpack Compose文档](https;//docs.bughub.icu)
## 简单组件
### Text
函数原型：（Preview 注解中使用了 showbackgroud=true 显示白色背景）
```kotlin
@Composable
fun Text(
    text: String?,
    modifier: Modifier? = Modifier,
    color: Color? = Color.Unspecified,
    fontSize: TextUnit? = TextUnit.Unspecified,
    fontStyle: FontStyle? = null,
    fontWeight: FontWeight? = null,
    fontFamily: FontFamily? = null,
    letterSpacing: TextUnit? = TextUnit.Unspecified,
    textDecoration: TextDecoration? = null,
    textAlign: TextAlign? = null,
    lineHeight: TextUnit? = TextUnit.Unspecified,
    overflow: TextOverflow? = TextOverflow.Clip,
    softWrap: Boolean? = true,
    maxLines: Int? = Int.MAX_VALUE,
    onTextLayout: ((TextLayoutResult) -> Unit)? = {},
    style: TextStyle? = LocalTextStyle.current
): Unit
```

#### 常用参数
- textDecoration设置文本组件文本装饰，支持组合样式（使用 `listOf` 组合 TextDecoration 效果）
```kotlin
Text(
	text = "hello world",
	modifier = Modifier.width(110.dp),
	textAlign = TextAlign.Center,
	textDecoration = TextDecoration.combine(
		listOf(
			TextDecoration.LineThrough,
			TextDecoration.Underline
		)
	)
)
```
![[Pasted image 20250201181851.png]]
- 文本对齐
只有设置了固定宽度才有用（使用 `Modifier. size(width = 100. dp, height = 100 .dp)`）
- fontSize 参数默认跟随父级文字大小，接受一个TextUnit，可以设置 SP(像素值) 和 EM(字体值) 单位的值
- fontStyle 设置文字样式[¶](https://docs.bughub.icu/compose/components/Text/#fontstyle "Permanent link")
	- FontStyle.Italic 设置为斜体
	- FontStyle.Normal 设置为正常体(默认状态)
- `overflow` 设置文本超出时如何显示[¶](https://docs.bughub.icu/compose/components/Text/#overflow "Permanent link")，配合 maxline 参数设置最多显示多少行
	- `TextOverflow.Ellipsis` 以省略号显示
	- `TextOverflow.Clip` 裁剪
	- `TextOverflow.Visible` 尽可能显示
- 上面讲到的大部分文字修饰，都可以直接通过 TextStyle 对象（填入 style 参数中） 进行修饰，除此之外还多出几个样式
	- `fontFeatureSettings` 字体的高级设置，类似 CSS 的 `font-feature-settings`，[参考](https://www.w3.org/TR/css-fonts-3/#font-feature-settings-prop](https://www.w3.org/TR/css-fonts-3/#font-feature-settings-prop)
	- `background` 设置背景颜色
	- `shadow` 设置阴影
	- `textIndent` 设置首先缩进
```kotlin
@Composable
fun TextSample() {
    Text(
        text = "锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦",
        modifier = Modifier.width(110.dp),
        style = TextStyle(
            background = Color.White,
            shadow = Shadow(
                color = Color.Red,
                offset = Offset(5f, 5f),
                blurRadius = 10f
            ),
            textIndent = TextIndent(20.sp)
        )
    )
}
```
![[Pasted image 20250201182441.png]]
将文本控件用 `SelectionContainer` 包裹让文字允许被选中
- 如果想让一个 Text 语句中有不同的样式，需要使用到 AnnotaedString
---
#### 创建可点击文本
通过可注解字符串创建用户协议文本
```kotlin
val annotatedString = buildAnnotatedString {
        append("点击登录代表您知悉和同意")
        pushStringAnnotation(tag = "protocol", annotation = "https://docs.bughub.icu/compose")
        withStyle(style = SpanStyle(Color.Blue)) {
            append("用户协议")
        }
        pop()
        append("和")
        pushStringAnnotation("privacy", annotation = "https://randywei.gitee.com")
        withStyle(style = SpanStyle(Color.Blue)) {
            append("隐私政策")
        }
        pop()
    }
```
- 创建一个**带有注解的**字符串变量，其中内容为
	- 普通的字符串 `点击登录代表您知悉和同意`，通过 `append`
	- 通过 `pushStringAnnotation` 创建一个注解，标签为 `"protocol"`，注解内容为 `“https://docs.bughub.icu/compose”`，这个注解**将会和 `用户协议` 这段带注解的字符串绑定**
	- `withStyle` 为需要注解的字符串设置颜色
	- `pop` 表示结束注解
```kotlin
ClickableText(
	text = annotatedString, onClick = { offset ->
		//从字符串中查找注解
		annotatedString.getStringAnnotations("protocol", start = offset, end = offset)
			.firstOrNull()?.let { annotation ->
				Log.d("TextSample", "点击了用户协议：${annotation.item}")
			}

		annotatedString.getStringAnnotations("privacy", start = offset, end = offset)
			.firstOrNull()?.let { annotation ->
				Log.d("TextSample", "点击了隐私政策：${annotation.item}")
			}
	}
)
```
- 创建一个可点击的字符串，文本内容为 `annotatedString` 变量
- onClick 参数设置为一个 lambda，传入 `val offset` 参数，表示点击的位置
	- `annotatedString.getStringAnnotations` 函数会在带注解的字符串的点击位置（start=offset,end=offset）查找是否带有标签为 `"protocol"` 的注解，并用 `.firstOrNull()?.let` 在查找到对应注解时调用 let 后面的代码
	- 查找到对应的注解后，通过 `Log.d` 输出提示信息并显示注解的内容 `annotation.item`
- `ClickableText` 在内部管理着文本的布局和点击位置与字符索引的映射。当用户点击文本时，`ClickableText` 会计算出点击的字符索引（即 `offset`），并将其传递给 `onClick` 回调函数。
	- 索引即用户点击位置是字符串中哪一个字的返回的指针
![[Pasted image 20250206214510.png]]
- 返回**带注解的字符串对应索引**位置的注解列表，`.firstOrNull()` 是 Kotlin 的**集合操作函数**，用于返回集合中第一个元素。如果没有找到任何元素，则返回 `null`。
 - `let` 是 Kotlin 的一个作用域函数，用于在不为 `null` 的情况下对对象执行特定的代码块。
### Button
#### 原型和常用参数
```kotlin
@Composable
fun Button(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,// 启用状态，设置为false会变为灰色
    interactionSource: MutableInteractionSource = remember { MutableInteractionSource() },
    elevation: ButtonElevation? = ButtonDefaults.elevation(),// 投影
    shape: Shape = MaterialTheme.shapes.small,
    border: BorderStroke? = null,
    colors: ButtonColors = ButtonDefaults.buttonColors(),// 设置该按钮的一系列元素
    contentPadding: PaddingValues = ButtonDefaults.ContentPadding,
    content: @Composable RowScope.() -> Unit
): Unit
```
要求了最后一个 content 也就是按钮的显示内容是一个 Composable 组件
colors 参数设置的是按钮的样式颜色，容器颜色，启用禁用颜色
![[Pasted image 20250206222123.png]]
```kotlin
@Composable
fun ButtonSample(){
    Column {
    	//普通按钮
        Button(
            onClick = {
                Log.d("ButtonSample tag","you click the button")
            },
            enabled = true,
            border = BorderStroke(1.dp, color = Color.Red),
            colors = ButtonDefaults.buttonColors(
                contentColor = Color.Cyan,
                containerColor = Color.Red
            )
        ) {
            Text(text = "a simple button")
        }
		// 类似超链接，是一个可点击的文本但不带注解
        TextButton(onClick = {
            Log.d("TextButtonSample","click the text button")
        }) {
            Text(text = "a text Button")
        }
		// 图标按钮，点击图表执行代码块，content内容最好只填写Icon对象
        IconButton(onClick = {
            Log.d("IconButton","click the icon button")
        }) {
//            Icon(painter = painterResource(R.drawable.compose_icon), contentDescription = null)
            Icon(imageVector = Icons.Default.Call, contentDescription = null)
//            Text(text = "a IconButton")
        }
    }
}
```
### Icon
#### 原型和常用参数
```kotlin
@Composable
fun Icon(
    imageVector: ImageVector,//bitmap: ImageBitmap,painter: Painter,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    tint: Color = LocalContentColor.current.copy(alpha = LocalContentAlpha.current)
)
```
图标的 image 可以使用 `painter = painterResource()` 加载媒体图片，`imageVector` 加载矢量图，`Icon.Default` 类中提供官方矢量图
注意 `contentDescription` 是**必填项**但可以写 `null`
 - `Icon` 中一般使用矢量图而不是位图，这样才可以**根据主题改变颜色**，如果使用位图，则默认*不显示位图的颜色*，需要手动设置 `tint = Color.Unspecified` 显示图片原本的颜色
 - `Icon.Default` 中提供的矢量图会根据主体变化，并且有默认的透明度等参数
 - 如果不显式指定 `tint`，默认采用*黑色填充位图的大小的范围*

### Image
#### 原型和常用参数
```kotlin
@Composable
fun Image(
    painter: Painter,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    alignment: Alignment = Alignment.Center,
    contentScale: ContentScale = ContentScale.Fit,
    alpha: Float = DefaultAlpha,
    colorFilter: ColorFilter? = null
): Unit
```
引入图片同样支持 `ImageVector`, `bitImage` 和 `painter`
- contentScale 设置图片的伸展方式：ContentScale.Inside、ContentScale.Crop 等，伸展参数可以参考[[项目开发过程#容器大小根据内容动态变化方法]]
- colorFilter 设置颜色滤镜
## Modifers
modifer 的主要功能：
- 改变 composable 的尺寸、布局、动作和外观
- 添加信息，比如无障碍辅助信息
- 处理用户输入
- 增加高级交互，比如点击、滚动、拖动或缩放等等
系统内置的布局会根据内容大小显示，但你可以通过 `size` 来控制布局的大小

> 如果指定的大小不满足父布局的约束，则尺寸将会**无效**。如果强制设置请使用而不考虑父控件约束，可以使用 `requiredSize`

```kotlin
@Composable
fun ImageSample() {
    Column {
        //父控件设置尺寸为100dp
        Column(modifier = Modifier.size(100.dp)) {
            Image(
                painter = painterResource(id = R.drawable.newbanner4),
                contentDescription = null,
                modifier = Modifier.size(150.dp),//此时子控件使用 size 设置150dp 是无效的
                colorFilter = ColorFilter.tint(Color.Red, blendMode = BlendMode.Color)
            )
        }
        //父控件设置尺寸为100dp
        Column(modifier = Modifier.size(100.dp)) {
            Image(
                painter = painterResource(id = R.drawable.newbanner4),
                contentDescription = null,
                modifier = Modifier.requiredSize(150.dp),//此时子控件需要使用 requiredSize 设置为150dp才有效
                colorFilter = ColorFilter.tint(Color.Red, blendMode = BlendMode.Color)
            )
        }
    }
}
```
![[Pasted image 20250206231021.png]]
## 状态
> 应用中状态是指可以随时间变化的任何值。这个定义很广泛包括数据库或类中变量的所有内容。由于Compose 是**声明式的**，所以当需要改变其任何内容的时候，通过设置新的参数调用**同一组声明**，这些参数就是 UI 的表现形式。每State 更新时，都会发生重组——UI 发生变化

Composable中可以使用 `remember` 来记住单个对象。系统会在初始化由 `remember` 计算的值存储在Composable中，并在重组的时候返回存储的值。`remember` 既可以存储可变对象，也可以存储不可变对象。

```kotlin
interface MutableState<T> : State<T> {
    override var value: T
}
```
- `remember`会将对象存储在Composable 中，当调用 `remember`的Composable被移除后，存储的值也随之消失。
- `mutableStateOf`会创建可观察的 `MutableState<T>`，后者是 Compose 运行时可观察类型。
- value 有任何更改，系统会安排重组，读取value 的所有Composable 函数。
---
在Composable中声明 MutableState 对象有三种方法：
- `val mutableState = remember { mutableStateOf(default) }`
- `var value by remember { mutableStateOf(default) }`
- `val (value, setValue) = remember { mutableStateOf(default) }`
这三种方法是等效的，以语法糖的形式提供不同的用法。使用 by 语法需要导入：