# 知识
## then()、CombinedModifier 和 Modifier.Element
扔物线免费课程：[5.2then()、CombinedModifier 和 Modifier.Element](https://edu.rengwuxian.com/p/t_pc/course_pc_detail/video/v_6308988de4b050af23aeb7b4?product_id=course_2Dpw6101YdL7bHFs5LFpYyzSUS6&type=6)
### Moidfier 的特性
Modifier 是**顺序敏感的**，同时链式调用（Modifier 对象如果有返回值那么返回值也是 Modifier）
Modifier 对象都有一个成员方法 then：
![[Pasted image 20250112144117.png]]
#### 小知识
- `===` 引用相等运算符
用于检查两个引用是否指向同一个对象实例。与之相对的是 `==` 运算符，它用于检查两个对象的**内容相等**。
```kotlin
val list1 = listOf(1, 2, 3)
val list2 = listOf(1, 2, 3)
val list3 = list1

println(list1 == list2) // 输出: true，内容相等
println(list1 === list2) // 输出: false，引用不同
println(list1 === list3) // 输出: true，引用相同
```

> **对象类型**：对于对象类型（如自定义类实例），`===` 检查的是引用是否相同，而 `==` 调用的是 `equals` 方法。
> 需要具体比较两个变量或者常量的值时，使用 `===` 可以避免为非对象内容对象创建的过程，提高性能

---
- `infix` 前缀
如果一个函数定义之前有 `infix` 前缀，则对象调用形式可以简化
```kotlin
Object_name.Method(Method_args)
Object_name Method Method_args// 可以简化成这样
```

# 实战
## 微信界面开发
可组合函数只能在可组合函数（或者功能类）中调用，只有可组合函数才可以添加状态（如颜色，阴影，动效等等）
### Kotlin 特性
#### object 单例模式
- object 对象声明
将一个**对象**（注意已经是一个对象）声明为 `object` 表示声明为单例，对象声明用于创建单例模式，即在**整个应用程序生命周期中只有一个实例**。使用 `object` 关键字声明的对象不能在代码的其他地方实例化，**每次访问的都是同一个实例**。
- object 对象表达式
对象表达式用于创建匿名类实例，通常用于需要创建一个类但不需要给它命名的情况。对象表达式可以继承其他类或实现接口。
---
- Kotlin 中经常有函数名和 `object` 对象同名情况，但两者**类型不同**，在**不同命名空间**中
- 这样的做法一般用于[[#主题管理|主题管理]]中，一个主题管理器管理一个主题**单例对象**，每次切换主题切换的是同一个主题对象
```kotlin
fun WeComposeTheme(theme: WeComposeTheme.Theme = WeComposeTheme.Theme.Light, content: @Composable() () -> Unit) {
  val targetColors = when (theme) {
    WeComposeTheme.Theme.Light -> LightColorPalette
    WeComposeTheme.Theme.Dark -> DarkColorPalette
    WeComposeTheme.Theme.NewYear -> NewYearColorPalette
  }
  ///////其他设置//////
}
```
其中 `WeComposeTheme` 是对象而不是函数或者类
一般在**同一个文件的同一函数**中定义
```kotlin
object WeComposeTheme {  // 这个object声明在fun Wecompose函数中
  val colors: WeComposeColors  
    @Composable  
    get() = LocalWeComposeColors.current  
  enum class Theme {  
    Light, Dark, NewYear // 枚举类型，限定主题只有这三个，每添加一个 需要在函数中添加相应逻辑
  }  
}
```
#### 高阶函数

> 高阶函数本质上还是函数，没有任何多出来的特性，其本身概念来自于数学高阶函数

参考教程：[Kotlin 的 Lambda，大部分人学得连皮毛都不算_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1kp4y1C7DE/?spm_id_from=333.1387.search.video_card.click&vd_source=876be08bc9c030f4a9ea1fb97e0d0342)
kotlin 中允许函数接收另一个函数作为参数，或者返回一个函数。
如果在函数中作为参数传递，需要遵守下面格式
```kotlin
fun function1(arg1: arg1_type,(args[]) -> return_type){/*body*/}
	// 其中，(args[]) -> return_type表示接受的参数类型时一种函数
```
在 java 中，不支持函数作为参数传递，所以一般使用接口实现，将函数作为一个对象，传递对象进另一个函数的参数中，从而实现他的功能
![[Pasted image 20250111110438.png]]
这种情境下 a 函数的返回值**跟传入的方法有关**，类似于现实中的通勤方式，a 函数计算总共花费多消耗时间，金钱成本。成本的计算方法和成做什么交通工具有关，不同的交通工具有不同的成本消耗（计算方法），所以 a 函数的返回值与“方法”有关
在 java 中通常使用接口管理这些方法：
- 在接口中调用各种计算方法（也就是代表**不同交通工具对应的函数**）
- 所有方法通过一个接口管理
- 在 a 函数需要某种特定的计算方法时，调用接口中的具体实现即可
![[Pasted image 20250111111022.png]]

> 所以传递函数（或者 java 中的传递接口，）本质上是为了使用函数的方法（或者说是接口中的具体实现）
> java 中不允许传递方法，所以才使用接口管理

kotlin 中没有一种**基本数据类型**为函数类型（也不可能有，因为函数有不同的返回值，参数列表。他们不同代表函数也不同，自然不能归为一种类型）
![[Pasted image 20250111111414.png]]
所以需要使用[[#将函数作为参数|将函数作为参数]]或者 [[#lambda 函数|lambda]] 方法
#### 将函数作为参数（匿名函数）
如果需要将一个**已经定义，声明好的函数**传入另一个函数中作为参数

> 由于其函数本身并不是一种数据类型，还是要通过对象作为参数传入，做法是**构造一个和函数拥有相同功能的对象**（即对象中有功能和函数一样的方法）实现，java 中的做法仍然是用一个接口管理这个函数，并在需要使用这个函数的地方实现它，或者管理一个已经实现的函数

Kotlin 提供一种语法糖，在**已经实现的函数名前**加 `::` 表示***拥有函数相同功能的对象***，所以，***匿名函数是一个对象***，所以他支持赋值操作
![[Pasted image 20250111112652.png]]
- 编译器会自动构建这样一个对象，其中包含的 `invoke()` 方法就能调用起原函数的**逻辑**
- `::function_name` 的写法是一个指向对象的**引用**
- 这种函数的引用得到的**返回值类型**是一个对象，可以被赋值
```kotlin
var var1 = ::func_name
var var2 = var1
```
这种情况下函数被转换成对象，除了双冒号的写法，还可以直接将函数*作为对象*传递变量
![[Pasted image 20250111113422.png|a是一个函数]]
这种情况下函数名已经没用了，因为右边已经转换为一个对象，不需要名称来作为函数转换为对象的中间媒介（所以 kotlin 直接禁止这样写）
![[Pasted image 20250111113627.png]]

#### lambda 函数
##### lambda 函数作用

> 不同于 java 和 C++的 lambda 函数只是作为一种省略定义函数过程的**简化写法**，kotlin 中实实在在地突破，**将无论是 lambda 表达式还是匿名函数都转换成了一个对象**
> 能够怎么使用 `::func_name`，就能怎么使用匿名函数和 lambda


![[Pasted image 20250111111621.png]]
##### kotlin 中 lambda 的省略规则
![[Pasted image 20250111114658.png]]
这种省略参数类型和返回值类型的写法，只有在作为参数传递时才能写，如果在一个普通的变量赋值情景下，lambda 无法从上下文推断出是什么类型
![[Pasted image 20250111114859.png]]
由于变量赋值在没有类型转换情况下，变量类型等于 lambda 类型，所以可以通过对变量指明类型类约束（让 lambda 推断）匿名函数的类型
![[Pasted image 20250111115122.png]]
lambda 函数的返回值类型由**最后一行代码的返回值类型**决定，而不是 `return` 语句
```kotlin
fun funciton_name(funcion_variable_name: vari_type() -> return_type)
// if the argument is a Composable function
fun funciton_name(funcion_variable_name: @Composable vari_type()() -> return_type)
// first () means the Composable obj is a func neither a componenet or view or sth
// seconde () means no arguments need inside, fill args in 2nd () but no 1st 
// if you have on args, the 2 method have no difference to 
```

#### 拓展函数和拓展属性
参考链接：[竟然还能这么用！Kotlin 的扩展函数和扩展属性（Extension Functions / Properties](https://www.bilibili.com/video/BV16K411W7kU/?share_source=copy_web&vd_source=fc82e2929b0244d7693c737c79d36205)
##### 拓展函数
作用：给已有的类额外添加属性（不需要写子类继承）
引子：
java 中使用幂运算，一般要使用 Math 类中的静态函数 pow，`Math.poe(3,2)`，但有更直观地写法是 `3.pow(2)` 但是 3，也就是 `Integer` 类中并没有这个方法
但是 kotlin 中，使用 `3f.pow(2)` 就可以，同样 `Integer` 中没有定义，pow 是一个拓展函数
![[Pasted image 20250111152327.png]]
拓展函数一般写在一个文件的最上方，package 语句下方，这样这个**拓展函数不属于任何类**，在同一包中都可以调用（作用于问题，如在类中定义就只能在类中使用）
![[Pasted image 20250111152833.png|550]]
在函数名的**左边**添加一个**类型名**，表示给这个数据类型添加一个 `receiver` 接受它，表示这个**数据类型的对象**可以使用它（虽然顶层放置拓展函数让他在整个包中都能被调用，但是限定了他只能被哪种**类型的对象**调用）
![[Pasted image 20250111153556.png|550]]
在一个类中定义的拓展函数，属于**类的成员函数**，但这个成员函数只能被**对应的 `receiver` 使用**，相当于一种**特定类型专用的 private 访问修饰符**
这与 [[#lambda函数|lambda函数]]类似，拓展函数也可以被*指向*
![[Pasted image 20250111161221.png|600]]
如果这个拓展函数不在 TOP level 中，是类的成员函数则不能被引用
![[Pasted image 20250111161410.png|600]]
这是为了防止存在下面情况
```kotlin
class Extensions{
	fun aStringFunc(){
		// body //		
	}
	fun String.method(){
		// body //
	}
	var str : String = "hello"
	String.method()
}
```
这时，String. method 不能确定调用 str 变量的对象的 String 内置大类的拓展函数还是调用 Extensions 类中的拓展函数，所以干脆禁止使用
拓展函数也支持用对象的引用来使用，但是无论是直接调用还是 `invoke` 方法，都需将第一个参数设置为**需要变为对象的引用的对象**
![[Pasted image 20250111162105.png]]
拓展函数也支持传递给变量（会自动调用创建这个函数功能相同的对象的引用）
![[Pasted image 20250111162215.png]]

---
其他属性：
所有的拓展函数都**静态解析的**，调用拓展函数时，函数的选择是基于编译时的类型，而不是运行时的类型。
```kotlin
open class Animal
class Dog : Animal()

fun Animal.sayHello() = "Hello, Animal!"
fun Dog.sayHello() = "Woof!"

fun main() {
    val dog: Animal = Dog()
    println(dog.sayHello()) // 输出: "Hello, Animal!"
}
```
尽管 `dog` 实际上是一个 `Dog` 对象，但由于拓展函数是静态解析的，`sayHello` 调用的是 `Animal` 的版本。
两个 `sayhello` 函数在编译时解析，运行时产生的 Dog() 类变量只能使用 Animal 类的方法
拓展函数还可以链式调用，其实本质上也是在将**变量转化为对象**而已
```kotlin
fun String.appendSuffix(suffix: String): String {
    return "$this$suffix"
}

val str = "Hello".appendSuffix(" World!")
println(str) // 输出: "Hello World!"
```
##### 拓展属性
同[[#拓展函数|拓展函数]]逻辑，在声明属性的左边写上类名，相当于添加了一个**特定类型专用的 private 访问修饰符**用在变量上而已
![[Pasted image 20250111162807.png|600]]
但是去掉了拓展函数中 receiver 的转化等比较绕的属性
其他特性：
拓展属性不会自动创建 [[Kotlin + xml传统开发#Java Bean|Java Bean]] 幕后字段，需要自己实现 getter 和 setter（对于可写的 var）

#### it 隐式传参
当一个 lambda 表达式只有一个参数时，Kotlin 允许你省略参数声明，并使用 `it` 作为默认参数名。

**示例**：
```kotlin
// 使用显式参数名
val numbers = listOf(1, 2, 3, 4, 5)
val doubled = numbers.map { number -> number * 2 }

// 使用 it 作为参数名
val doubledWithIt = numbers.map { it * 2 }
```
在上述例子中，`it` 代表列表中的**每一个元素**。
### 资源对象管理
Kotlin compose 中管理资源和各种组件的方法一般是引用各种 kt 文件存储资源
![[Pasted image 20250110194446.png]]
软件包中不同类型的变量资源通过 kt 文件存储，需要这些文件时，导入相应文件中的对象，如 `import com.example.wecompose.ui.theme.black ` 导入一种颜色还可以
- 使用 `import com.example.wecompose.ui.theme.*` 导入所有变量（对象），但这样容易引起域名冲突，导入其他内容
- 解决域名冲突可以使用别名**按类型导入**的方式：
	```kotlin
	import com.example.project.ui.theme.Color as MyColors
 
	 class MainActivity : AppCompatActivity() {
	     override fun onCreate(savedInstanceState: Bundle?) {
	         super.onCreate(savedInstanceState)
	         setContentView(R.layout.activity_main)
	         val color = MyColors.black // 使用别名访问颜色变量
	     }
	 }
	```
	`import com.example.project.ui.theme.Color` 会提取该文件中的所有 Color 对象并导入
- 如果一个 `Color.kt` 文件中需要管理的颜色数量过多，可以创建一个 `ColorManager.kt` 来统一管理所有颜色对象，如：
```kotlin
package com.example.project.ui.theme

object LightlyColors {
    val white1 = Color(0xFF000000)
    val white2 = Color(0xFF000001)
    // 其他颜色变量
}
object DarkColors {
    val black1 = Color(0xFFFFFFFE)
    val black2 = Color(0xFFFFFFFF)
    // 其他颜色变量
}
```
在需要使用特定颜色变量的文件中
```kotlin
import com.example.project.ui.theme.LightlyColors
import com.example.project.ui.theme.DarkColors
```
来引入不同的颜色组，**其本质都是对象管理**
#### CompositionLocal 对象
在设置主题时，不能通过函数传递参数来修改颜色变量，而需要通过主题管理器
如内置的 `MaterialTheme.colors` 这一个对象来设置，其中的每一个对象代表一种颜色并可以切换，他的返回值对象类型是 `CompositionLocal<Colors>`，其中 `Colors` 是专门用来主题管理的颜色对象
![[Pasted image 20250110202005.png]]
`CompositionLocal` 对象是一个**用在组合函数中的**局部**对象**，在组合函数中调用 `setter` 调整颜色用于当前 Composable 组件时，下一个组件**不继承上一个组件中的修改**，被**重新初始化**
*重新被初始化*的原理是***每个组合函数拿到的是分别独立的 `CompositionLocal` 对象***
#### 主题管理器
一个应用多个主题，可以使用主题管理器（也是一个 `@Composable` 对象），在 Theme （ui 组件文件夹）中一般会自动创建，常见主题管理器为：
```kotlin
@Composable
fun WeComposeTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),// 暗色主题
    // Dynamic color is available on Android 12+
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
		//// 控制配色逻辑的变量////
    }

    MaterialTheme(// MaterialTheme是内置函数，控制Material主题类型，自定义主题需要的自定义主题函数
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
```
#### 应用单例模式设置主题管理
将需要显示的控件（这里使用 WebottomBar）中的颜色，动效等所有资源不再使用[[#资源对象管理|资源对象管理]]的方法从文件中调用相应变量控制
如一套 UI 中，需要跟随主题变化颜色的有
- 导航栏背景底色
- 选中一个选项之后图标的颜色
- 不选中时图标的颜色
```kotlin
@Composable
private fun WeBottomBar(selected: Int) {
    Row(Modifier.background(WeComposeTheme.colors.bottomBar/*底部导航栏的背景*/)) {
        TableItem(
            if(selected == 0) R.drawable.ic_chat_filled else R.drawable.ic_chat_outlined,
            "Chat",
            if(selected == 0) WeComposeTheme.colors.iconCurrent/*选中时图标颜色*/ else WeComposeTheme.colors.icon/*不选中图标颜色*/,
            Modifier.weight(1f)
        )
        // 其他控件，如其他的TableItem表示其他的按钮
    }
}
```
通过预览 Compose **一次性查看多个主题效果**
```kotlin
@Preview(showBackground = true)
@Composable
fun WeBottomBarLight(){
    WeComposeTheme(WeComposeTheme.Theme.Light,
        { WeBottomBar(selected = 0) }
    )
}
@Preview(showBackground = true)
@Composable
fun WeBottomBarNewYear(){
    WeComposeTheme(WeComposeTheme.Theme.NewYear,
        { WeBottomBar(selected = 0) }
    )
}
@Preview(showBackground = true)
@Composable
fun WeBottomBarDark(){
    WeComposeTheme(WeComposeTheme.Theme.Dark,
        { WeBottomBar(selected = 0) }
    )
}
```
![[Pasted image 20250110221537.png]] 
之后为保证代码整洁，将底部栏部分抽出放入 `con.example.wecompose.ui` 单独的 WeBottomBar.kt 文件中，在 AS 中复制粘贴会自动添加原来代码在 MainActivity 中用到的 import 语句
![[Pasted image 20250110222156.png]]

### 底部导航栏逻辑
通过 ViewModel 创建逻辑，首先创建一个 Wemodel 用于管理按钮逻辑
```kotlin
package com.example.wecompose

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel

class WeViewModel: ViewModel() {
    var selectedTab by mutableStateOf(0)
}
```
在 MainActivity 中导入并使用这个逻辑
```kotlin
class MainActivity : ComponentActivity() {
//    var selectedTable by mutableStateOf(0)// 表示selectedTable变化之后才刷新（通过mutableStateOf监听）
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            WeComposeTheme{
                Column {
                    val viewmodle: WeViewModel = WeViewModel()
                    WeBottomBar(viewmodle.selectedTab)
                }
            }
        }
    }
}
```
这里要注意：- 在 Kotlin 中，构造函数不会自动继承。如果一个类继承自另一个类，子类不会自动继承父类的构造函数。
尽管 `WeViewModel` 继承自 `ViewModel`，但它并没有继承 `ViewModel` 的构造函数。`ViewModel()` 返回的是 `androidx.lifecycle.ViewModel` 类型的实例，而 `viewmodle` 的类型是 `WeViewModel`。 `ViewModel` 是 `WeViewModel` 的父类，双方的构造函数没有关联性
如果想要在预览函数中查看效果，但是 `val viewmodle: WeViewModel = WeViewModel()` 在 MainActivity 中定义，由于预览函数直接导入主逻辑文件可能会导致变量在预览函数中**误修改**，好的方法是在预览函数中创建独立的变量控制

对于**点击逻辑**，传统方法使用 `setOnClickListener`，在 Compose 中的 modifier 中允许组件被点击
```kotlin
TabItem(
  if (selected == 2) R.drawable.ic_discovery_filled else R.drawable.ic_discovery_outlined,
  "发现",
  if (selected == 2) WeComposeTheme.colors.iconCurrent else WeComposeTheme.colors.icon,
  Modifier
    .weight(1f)
    .clickable {
      onSelectedChanged(2)
    }
)
```
clickable 函数接受一个参数，表示被点击时应用的操作，将 onSelectedChanged 变量更改，`var selectedTab by remember { mutableStateOf(0) }` 检测更改，并在 `fun WeBottomBar(selected: Int, onSelectedChanged: (Int) -> Unit)` 中添加 if 逻辑

### 聊天页面逻辑
#### 内容设置
创建一个单独的 ChatList. kt 实现逻辑和 UI，并在 MainActivity 中的 Column 中调用，并且一定要在 WeBottomBar **上面调用**，因为页面显示在底部导航栏之前，而且上面的页面变化，导航栏不变，只是更改逻辑显示不同的图片而已
![[Pasted image 20250111150540.png]]
![[Pasted image 20250111144307.png]]
0,1,2,3 分别控制不同的页面，用不同的函数对应，这些空间都是 UI 的，放在不同的文件中
引入相应的聊天记录（使用 List 结构）后，LazyColumn 创建消息列表
```kotlin
@Composable
fun ChatList(chats: List<Chat>) {
  Column(// 整个页面的底色，整个页面所有内容是从上到下排列的，用Column布局
    Modifier
      .background(WeComposeTheme.colors.background)
      .fillMaxSize()//整个页面使用主题颜色并铺满**除了元素以外的地方**
  ) {
    LazyColumn(Modifier.background(WeComposeTheme.colors.listItem/*消息列表元素填充消息列表的颜色*/)) {
		Image(  // 填充图片
		  painterResource(chat.friend.avatar), chat.friend.name,  
		  Modifier  // 设置图片圆角等个性化设置
		    .padding(8.dp)  
		    .size(48.dp)  
		    .unread(!chat.msgs.last().read, WeComposeTheme.colors.badge)  
		    .clip(RoundedCornerShape(4.dp))  
		)
    }
  }
}
fun Modifier.unread(show: Boolean, color: Color): Modifier = this.drawWithContent {  
  drawContent()  
  if (show) {  
    drawCircle(color, 5.dp.toPx(), Offset(size.width - 1.dp.toPx(), 1.dp.toPx()))  
  }  
}
```
由于未读角标是高复用内容，所以做成一个函数方便调用，也可以用于 WeBottomBar 中的 TableItem 未读消息展示，不过需要注意的是，**不能在 Modifier. unread 函数中使用 WeCompose. Theme. colors**，因为 `WeCompose.Theme. colors` 是一个 `compositionLocal` 对象类型，虽然 color 类型相同，但**只能使用在@compose 注解的函数定义中**
![[Pasted image 20250112115755.png]]
为了解决这一问题，需要在 `fun Modifier.unread` 定义中加入 color 参数，但传入参数在
```kotlin
Image(  // 填充图片
		  painterResource(chat.friend.avatar), chat.friend.name,  
		  Modifier  // 设置图片圆角等个性化设置
		    .padding(8.dp)  
		    .size(48.dp)  
		    .unread(!chat.msgs.last().read, WeComposeTheme.colors.badge)  
```
中，就能使用主题颜色
#### 设置消息列表布局
##### 从上到下排列
在最外层的控制部件中的 Modifier 设置
```kotlin
fun ChatList(chats: List<Chat>) {
  Column(
    Modifier
      .background(WeComposeTheme.colors.background)
      .fillMaxSize()
  ) {
```
表示最外层容器背景色使用主题颜色
布局使用从上到下填满逻辑（`fillMaxSize()`），从左到右填满布局使用 (`fillMaxWidth()`)

##### 分割线
内置@compose部件函数 Divider
```kotlin
@Composable
fun ChatList(chats: List<Chat>) {
  Column(
    Modifier
      .background(WeComposeTheme.colors.background)
      .fillMaxSize()
  ) {
    WeTopBar(title = "Wechat")
    LazyColumn(Modifier.background(WeComposeTheme.colors.listItem)) {
    --------------------------------
      itemsIndexed(chats) { index, chat ->// 遍历聊天列表
        ChatListItem(chat)// 遍历规则，每一个ChatListItem中的chat组件，也就是头像+名称+最新一条消息的组合先显示
        if (index < chats.lastIndex) {// 然后显示分割线
          Divider(// 当一个chat组件不是最后一个的时候显示分割线
            startIndent = 68.dp,
            color = WeComposeTheme.colors.chatListDivider,
            thickness = 0.8f.dp
          )
        }
      }
    }
  }
}
```
当不想细微调整各个组件的背景，可以直接加一个 `Box` 嵌套来单独设置组件的背景（Compose 中组件嵌套不会耗费性能）
![[Pasted image 20250112121733.png|设置完分割线]]
![[Pasted image 20250112121829.png|对整个对象设置一个背景色]]
方法是在 `LazyColumn` 中设置一个 Modifier，因为所有消息列表都在 LazyColumn 中显示，对它添加一个父 Box 专门设置颜色
#### 顶栏设计
上面提到可以嵌套父容器来实现单独调整颜色风格，这时加入顶栏，由于顶栏和下面的聊天页面是上下关系，所以改换 `Box` 为 `Column` 作为 LazyColumn 父容器并在 ChatListItem**上方**使用 WeTopBar
```kotlin
@Composable
fun WeTopBar(title: String, onBack: (() -> Unit)? = null) {
  Box(
    Modifier
      .background(WeComposeTheme.colors.background)
      .fillMaxWidth()
  ) {// 设计整个TopBar背景色
    Row(// 所有元素横向排列，包括一个标题和一个调色板
      Modifier
        .height(48.dp)// 设计顶栏高度，与下面的ChatListItem衔接
    ) {
      if (onBack != null) {// 点开消息列表的时候，最左边是一个返回键
        Icon(
          painterResource(R.drawable.ic_back),
          null,
          Modifier
            .clickable(onClick = onBack)
            .align(Alignment.CenterVertically)
            .size(36.dp)
            .padding(8.dp),
          tint = WeComposeTheme.colors.icon
        )
      }
      Spacer(Modifier.weight(1f))
      val viewModel: WeViewModel = viewModel()
      Icon(// 在消息列表页面显示切换主题按钮
        painterResource(R.drawable.ic_palette),
        "切换主题",
        Modifier
          .clickable {// 点击按钮使用ViewModel控制逻辑
            viewModel.theme = when (viewModel.theme) {
              WeComposeTheme.Theme.Light -> WeComposeTheme.Theme.Dark
              WeComposeTheme.Theme.Dark -> WeComposeTheme.Theme.NewYear
              WeComposeTheme.Theme.NewYear -> WeComposeTheme.Theme.Light
            }
          }
          .align(Alignment.CenterVertically)
          .size(36.dp)
          .padding(8.dp),
        tint = WeComposeTheme.colors.icon
      )
    }
    Text(title, Modifier.align(Alignment.Center), color = WeComposeTheme.colors.textPrimary)//显示文字
  }
}
```
#### 聊天内容页面设计
由于微信点击消息列表中的某个联系人后，相关页面从右向左**滑动覆盖原有界面**，需要将原有页面和 WeBottomBar 全部覆盖，所以需要
在主页面和聊天界面分开
```Kotlin
-------------已经完善的主页面内容-----------------
// 如果没有点开消息列表，程序会一直停留在这个函数中
@OptIn(ExperimentalPagerApi::class)
@Composable
fun Home(viewModel: WeViewModel) {
  Column {
    val pagerState = rememberPagerState()
    HorizontalPager(
      count = 4, Modifier.weight(1f),
      pagerState
    ) { page ->
      when (page) {
        0 -> ChatList(viewModel.chats)
        1 -> ContactList()
        2 -> DiscoveryList()
        3 -> MeList()
      }
    }
    val scope = rememberCoroutineScope() // 创建 CoroutineScope
    // 不显示 viewModel.selectedTab，改为 pagerState.currentPage
    WeBottomBar(pagerState.currentPage) { page ->
      // 点击页签后，在协程里翻页
      scope.launch {
        pagerState.animateScrollToPage(page)
      }
    }
  }
}
-------------------MainActivity中的内容------------
class MainActivity : ComponentActivity() {
  private val viewModel: WeViewModel by viewModels()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent {
      WeComposeTheme(viewModel.theme) {
        Box {
          Home(viewModel)// 点开消息列表页面之后，Home函数结束
          ChatPage()// 进入消息列表
        }
      }
    }
  }
```
由于两者同属于一个领域内（只有在消息列表页面才能进入 ChatPage，也只能通过 ChatPage 返回 Home），所以通过一个 Box 将两者联系，ChatPage 放在 Home 下面如果没有逻辑控制，含义为**在 Home 显示完之后显示 ChatPage 页面**，ChatPage 会直接盖住 Home 的内容
所以需要设置动画效果（由于这个动画效果每一个消息列表都需要用到，**所以调整为拓展函数**）
```kotlin
fun Modifier.offsetPercent(
  /*需要传入的偏移量，也就是ChatPage要盖住多少ChatList，并且同时支持x和Y两个轴*/
  offsetPercentX: Float = 0f, offsetPercentY: Float = 0f) = /*下面是方法体*/
  this.layout { measurable, constraints -> /*this.layout表示Modifier.layout*/
    val placeable = measurable.measure(constraints)/*测量出可以偏移多少*/
    layout(placeable.width, placeable.height) {
      val offsetX = (offsetPercentX * placeable.width).roundToInt()
      val offsetY = (offsetPercentY * placeable.height).roundToInt()
      // placeable.placeRelative需要int类型，上面的是Float到int的转化
      placeable.placeRelative(offsetX, offsetY)/*这条语句才是lambda的返回值*/
    }
  }
```