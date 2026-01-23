 参考教材：《第一行代码》

# 第一章基础知识
### Android 系统架构
- Linux 内核层
Android 系统是基于 Linux 内核的，这一层为 Android 设备的各种硬件提供了底层的驱动，如显示驱动、音频驱动、照相机驱动、蓝牙驱动、Wi-Fi 驱动、电源管理等。
- 系统运行库层
这一层通过一些 C/C++库为 Android 系统提供了主要的特性支持。在这一层还有 Android 运行时库，它主要提供了一些核心库，允许开发者使用 Java 语言来编写 Android 应用。另外，Android 运行时库中还包含了 Dalvik 虚拟机（5.0 系统之后改为ART 运行环境），它使得每一个 Android 应用都能运行在独立的进程中，并且拥有一个自己的虚拟机实例。
- 应用框架层
这一层主要提供了构建应用程序时可能用到的各种 API
- 应用层
所有安装在手机上的应用程序都是属于这一层的，比如系统自带的联系人、短信等程序，或者是你从 Google Play 上下载的小游戏，当然还包括你自己开发的程序。

## Android 应用开发特色
- 四大组件
Android 系统四大组件分别是 Activity、Service、BroadcastReceiver 和ContentProvider。其中
Activity 是所有 Android 应用程序的门面，凡是在应用中你看得到的东西，都是放在 Activity 中。
	- Service 就比较低调了，你无法看到它，但它会在后台默默地运行，即使用户退出了应用，Service 仍是可以继续运行的。
	- BroadcastReceiver 允许你的应用接收来自各处的广播消息，比如电话、短信等，
	- ContentProvider 则为应用程序之间共享数据提供了可能，比如你想要读取系统通讯录中联系人，就需要通过 ContentProvider 来实现。
- 丰富的系统控件
Android 系统为开发者提供了丰富的系统控件，使得我们可以很轻松地编写出漂亮的界面。当然如果你品位比较高，不满足于系统自带的控件效果，完全可以定制属于自己的控件。
- SQLite 数据库
Android 系统还自带了这种轻量级、运算速度极快的嵌入式关系型数据库。它不仅支持标准的 SQL 语法，还可以通过 Android 封装好的 API 进行操作，让存储和读取数据变得非常方便。
- 强大的多媒体
Android 系统还提供了丰富的多媒体服务
## 开发工具
### 布局设置
![[Pasted image 20241210162415.png]]
### app 目录下的结构
- build
	这个目录和外层的 build 目录类似，也包含了一些在编译时自动生成的文件，不过它里面的内容会更加复杂，我们不需要过多关心。
- libs
	如果你的项目中使用到了第三方 jar 包，就需要把这些 jar 包都放在 libs 目录下，放在这个目录下的 jar 包会被自动添加到项目的构建路径里。
- androidTest
	此处是用来编写 Android Test 测试用例的，可以对项目进行一些自动化测试。- java
	毫无疑问，java 目录是放置我们所有 Java 代码的地方（Kotlin 代码也放在这里），展开该目录，你将看到系统帮我们自动生成了一个 MainActivity 文件。
- res
	这个目录下的内容就有点多了。简单点说，就是你在项目中使用到的所有图片、布局、字符串等资源都要存放在这个目录下。当然这个目录下还有很多子目录，图片放在 drawable目录下，布局放在 layout 目录下，字符串放在 values 目录下，所以你不用担心会把整个 res
目录弄得乱糟糟的。
- AndroidManifest. xml
	这是整个 Android 项目的配置文件，你在程序中定义的所有**四大组件都需要在这个文件里注册**，另外还可以在这个文件中给应用程序添加权限声明。由于这个文件以后会经常用到，
我们等用到的时候再做详细说明。
- test
	此处是用来编写 Unit Test 测试用例的，是对项目进行自动化测试的另一种方式。- .gitignore
	这个文件用于将 app 模块内指定的目录或文件排除在版本控制之外，作用和外层的. gitignore 文件类似。
- app. iml
	IntelliJ IDEA 项目自动生成的文件，我们不需要关心或修改这个文件中内容。- build. gradle
	这是 app 模块的 gradle 构建脚本，这个文件中会指定很多项目构建相关的配置，我们稍后将会详细分析 gradle 构建脚本中具体内容。
- proguard-rules. pro
	这个文件用于指定项目代码的混淆规则，当代码开发完成后打包成安装包文件，如果不希望代码被别人破解，通常会将代码进行混淆，从而让破解者难以阅读。

`AndroidManifest. xml` 文件中最重要的代码是：
```xml
<activity
    android:name=".MainActivity"
    android:exported="true"
    android:label="@string/app_name"
    android:theme="@style/Theme.LearnTest">
    <intent-filter>
    	<action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter></activity>
</activity>
```
整段代码：
- 创建一个 activity 标签，属性由下面四个 name，exported，label，theme 定义，这是一个注册活动的行为，name 为 `. MainActivity` 表示它是启动 app 而展现的主要类
- `android:exported="true"` 表示这个 activity 可以被其他外部组件（显式或者隐式）访问
- `@string/app_name` 是指向 `res/values/strings.xml` 文件中一个字符串资源。它代表一个键值对，其中 `"app_name"` 是该字符串资源的名称。
	- 原因是 lable 属性需要一个 `string` 属性的资源，`@string` 表示查找 string 类型的资源，`app_name` 表示 string 类型资源的属性应为 `app_name`
	- Android 中资源都有自己专属的文件夹，所以不用指定路径，系统会自动在 Android 路径中查找。在 Project视图中看不到
	![[Pasted image 20241210170605.png]]
	- 对 theme 则同理
	- 指定 activity 标签为 ![[Pasted image 20241210170906.png]] LearnTest，该 activity 的主题为 `@style/Theme.LearnTest`，即
	![[Pasted image 20241210171042.png]]
	父类继承
- `<intent-filter>`用于定义**此**`Activity`响应的意图（Intent），从而决定它在应用和系统中行为方式。
	- `<action android.intent.action.MAIN>` 表示该 `Activity` 是应用的主入口，用于接收系统的主启动意图。说明这一个 activity 是程序的主入口
	- `<category android:name="android.intent.category.LAUNCHER" />` 说明当前 activity 是程序的启动界面，启动当前 activity 时会进入这个标签所指示的启动页面
	- 两者配合表示点击应用程序图标时，程序入口由当前 activity 进入，进入的这个 activity 是启动页面
`MainActivity. kt` 中最重要的代码是：
```java
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            LearnTestTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    Greeting(
                        name = "Android",
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}
```
- `MainActivity : ComponentActivity` 是一种向下继承，兼容的做法，使 activity 在不同系统版本中保持一致，`ComponentActivity` 也是子类，最终继承的是 Activity 类
- onCreate 函数表示在翠香创建的时候要做的事
- 两个文件中并没有出现 HelloWorld 字样，Android 程序的设计讲究**逻辑和视图分离**，因此是不推荐在 Activity 中直接编写界面的。一种更加通用的做法是，在布局文件中编写界面，然后在 Activity 中引入进来。
可以知道，Helloworld 字样在 `setContent` 中引入的配置文件中被调用

## 资源目录
### 资源是如何组织的
![[Pasted image 20241211203117.png|现在可能没有这么多]]
- 所有以“drawable”开头的目录都是用来放图片的
- 所有以“mipmap”开头的目录都是用来放应用图标的
- 所有以“values”开头的目录都是用来放字符串、样式、颜色等配置的
- 所有以“layout”开头的目录都是用来放布局文件的。
之所以有这么多“mipmap”开头的目录，其实主要是为了让程序能够**更好地兼容各种设备**。drawable 目录也是相同的道理，更多的时候美工只会提供给我们一份图片，这时你把所有图片都放在 `drawable-xxhdpi` 目录下就好了，因这是最主流的设备分辨率目录。
### 资源是如何使用的
```xml
<resources>
    <string name="app_name">LearnTest</string>
</resources>
```
可以看到，这里定义了一个应用程序名的字符串，我们有以下两种方式来引用它。
- 在代码中通过`R.string.app_name`可以获得该字符串的引用。
- 在 XML 中通过`@string/app_name` 可以获得该字符串的引用
所以：
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.LearnTest"
        tools:targetApi="31">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/Theme.LearnTest">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />

                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```
- manifest 标签应用核心配置文件，是文件的**根标签**，常用的属性有：
	- `xmlns:android` 指明命名空间，在这个命名空间中*解析 android 的专用属性*
	- `xmlns:tool` 指明开发工具支持
	- `android:versionCode` 声明开发版本
	- `android:versionName` 声明版本名称
	- `packageg` 声明包名
- 根标签中 `application` 指代这个应用程序，其中
	- `android:allowBackup="true"` 指定是否允许用户备份应用数据。 `true` 表示应用数据可以被备份到云端或本地设备。
	- `android:dataExtractionRules="@xml/data_extraction_rules"`     定义数据提取规则，指定备份和恢复哪些数据。规则文件位于 `res/xml/data_extraction_rules.xml`。
	- `android:fullBackupContent="@xml/backup_rules"`     指定完整备份的规则文件路径。文件中可以详细定义需要备份或排除的文件和目录。
	- `android:icon="@mipmap/ic_launcher"`     应用的图标，显示在设备的启动器（Launcher）中。
	- `android:label="@string/app_name"`     应用的名称，显示在启动器图标下或系统任务管理器中。
	- `android:roundIcon="@mipmap/ic_launcher_round"`     圆形图标资源路径，通常用于设备支持圆形图标的场景。
	- `android:supportsRtl="true"`     指定应用是否支持从右到左（RTL）布局。`true` 表示支持，例如阿拉伯语和希伯来语等语言环境。
	- `android:theme="@style/Theme.LearnTest"`     设置应用的全局主题样式，定义了应用的外观和行为。
	- `tools:targetApi="31"`     指定目标 API 级别（API 31 为 Android 12），仅供开发工具使用，不影响实际运行。
- 其中 `activity` 标签声明一个 `Activity`（活动），这是 Android 应用的界面组件。
	- `android:name=".MainActivity"` 定义活动的类名。`.` 表示相对路径，Android 系统会在 `package` 中寻找 `MainActivity` 类。
	- `android:exported="true"`指定活动是否可以被其他应用调用。设置为 `true` 表示允许外部应用通过显式或隐式意图访问此活动。
	- `android:label="@string/app_name"` 活动的标签，显示标题栏或任务列表中名称。
	- `android:theme="@style/Theme.LearnTest"` 活动的主题样式，可以覆盖全局主题。
- `intent-filter` 标签定义活动响应的意图（Intent），决定该活动在应用中作用。

### 应用是如何构建的
目录外层的 build. gradle 文件
```gradle
buildscript {
	ext.kotlin_version = '1.3.61'
	repositories {	// 代码仓库
		google()
		jcenter()
	}
	dependencies {	// 依赖构建工具
		classpath 'com.android.tools.build:gradle:3.5.2'
		classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
	}
}
allprojects {
	repositories {
		google()
		jcenter()
	}
}
```
- 构建的文件都是配置性质的，在其中声明配置有全局影响
- 两处 repositories 的闭包中都声明了 `google ()` 和 `jcenter () `这两行配置，那么它们是什么意思呢？其实它们分别对应了一个**代码仓库**，google 仓库中包含的主要是 Google 自家的扩展依赖库，而 jcenter 仓库中包含的大多是一些第三方的开源库。声明了这两行配置之后，我们就可以在项目中轻松引用任何 google 和 jcenter 仓库中依赖库了。
- Gradle 并不是专门为构建 Android 项目而开发的，如果我们要想使用它来构建Android 项目，则需要声明 com. android. tools. build:gradle: 3.5.2 这个插件
外部 build. gradle 文件
```gradle
apply plugin: 'com.android.application'  // 表示这是一个应用程序模块
apply plugin: 'kotlin-android'			// 如果用kotlin语言则必须使用
apply plugin: 'kotlin-android-extensions'// 启用kotlin插件扩展功能
android {
    compileSdkVersion 29						// 编译版本 29指代android 10
    buildToolsVersion "29.0.2"
    defaultConfig {		//项目细节配置
        applicationId "com.example.helloworld"	// 每个应用唯一标识符
	minSdkVersion 21							// 最低限度SDK，21指代5.0系统
        targetSdkVersion 29						// 这个程序的目标用户手机版本
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {				// 正式发行版app的构建
            minifyEnabled false	// 是否混淆
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'),					// 混淆配置文件路径
            'proguard-rules.pro'
        }
    }
}
dependencies {					// 指定当前项目的所有依赖关系
    implementation fileTree(dir: 'libs', include: ['*.jar'])// 将libs目录下正则表达式为*.jar匹配到的所有问阿金添加到构建路径中
    implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_version"
    implementation 'androidx.appcompat:appcompat:1.1.0'
    implementation 'androidx.core:core-ktx:1.1.0'
    implementation 'androidx.constraintlayout:constraintlayout:1.1.3'
    testImplementation 'junit:junit:4.12'
    androidTestImplementation 'androidx.test.ext:junit:1.1.1'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.2.0'
}
```

## 日志工具的使用
`Log(android.util.Log)`
- `Log.v()`。用于打印那些最为琐碎的、意义最小的日志信息。对应级别 `verbose`，是Android 日志里面级别最低的一种。
- `Log.d()`。用于打印一些调试信息，这些信息对你调试程序和分析问题应该是有帮助的。对应级别 debug，比 verbose 高一级。
- `Log.i()`。用于打印一些比较重要的数据，这些数据应该是你非常想看到的、可以帮你分析用户行为的数据。对应级别 info，比 debug 高一级。
- `Log.w()`。用于打印一些警告信息，提示程序在这个地方可能会有潜在的风险，最好去修复一下这些出现警告的地方。对应级别 warn，比 info 高一级。
- `Log.e()`。用于打印程序中错误信息，比如程序进入了 catch 语句中。当有错误信息打印出来的时候，一般代表你的程序出现严重问题了，必须尽快修复。对应级别 error，比warn 高一级。
logcat 中会输出日志工具打印的日志，使用 log 工具打印日志可以比较方便地师徒值日志标签，通过过滤器过滤
![[Pasted image 20241211212511.png]]
对日志分类，只显示出想要看到的日志
Logcat 中日志级别当前我们选中级别是 Verbose，也就是最低等级。这意味着不管我们使用哪一个方法打印日志，这条日志都一定会显示出来。而如果我们将级别选中为 Debug，这时只有我们使用 Debug及以上级别方法打印的日志才会显示出来，级别并没有向下覆盖

# Kotlin 编程
## 编程语言解惑
编程语言大致可以分为两类：**编译型语言**和**解释型语言**。
- 编译型语言的特点是编译器会将我们编写的源代码一次性地编译成计算机可识别的二进制文件，然后计算机直接执行。
- 解释型语言有一个解释器，在**程序运行**时，解释器会一行行地读取我们编写的源代码，然后**实时**地将这些源代码解释成计算机可识别的二进制数据后再执行，因此解释型语言通常效率会差一些
java 是一种**解释性语言**，javac 虽然是编译命令，但编译的结果并不是机器码二进制文件，而是 `.class`，他只能被 jvm 识别并运行，**jvm 就是解释器**，安卓的对应叫做 ART
jvm 不关心 class 文件是 Java 编译来的，还是从 Kotlin 编译来的，只要是符合规格的 class 文件，它都能识别。Kotlin 是如此，其他语言也是如此，*只要一种编程语言能够生成符合 jvm 识别标准的 `.class` 文件，那么就能在 jvm 上运行*
## kotlin 语言特性
### 基本语法
- 所有数据类型都在 kotlin 中变成对象（首字母必须大写）
- 由于 java 中并不强制 finnal 的使用，导致大型项目混乱，kotlin 中使用了 val（变量），var（不变量）强制约束每一个变量类型
- 函数写法
#### 定义函数
```kotlin
fun/*fun标明是函数*/ largerNumber(num1: Int, num2: Int/*参数列表中参数后用:连接数据类型*/): Int /*函数返回类型，不写kotlin自动推导*/= max(num1, num2) /*函数体只有一行时可以用等号连接在参数列表后*/
// 即
fun largeNumber(nums: Int,num2: Int){
	return max(num1,num2)
}// 其中函数体如果过短可以使用=直接连接返回值
```
- if 语句具有返回值（后面的 when 也有）
```kotlin
fun largerNumber(num1: Int, num2: Int): Int {
	return if (num1 > num2) {
		num1// 因kotlin把单独的左值看做值而不是expression
	} else {
		num2
	}
}
/*甚至可以再精简*/
fun largerNumber(num1: Int, num2: Int) = if (num1 > num2) num1 else num2
```
#### 条件分支
- when 语句对多条件分支有特殊优化 ^128b5c
	- when 语句允许传入**一个任意类型**的参数，可以在 when 的结构体中定义一系列的条件，格式是：
	- `匹配值 -> { 执行逻辑 }` 注意 `->` 后接执行逻辑，可以是代码块（**可以看做是简化版的 Switch case 语句**）
	- 可以配合 `is` 判断变量类型，is 关键字就是类型匹配的核心，它相当于 Java 中 instanceof 关键字
	- `when` 的分支中可以包含多个操作，每个操作都会看做是一个表达式，操作成功返回 true，反之 false，最终返回值取决于该分支中 **最后执行的语句**。
```kotlin
fun getScore(name: String) = when (name) {
	"Tom" -> 86
	"Jim" -> 77
	"Jack" -> 95
	"Lily" -> 100
	else -> 0
}
////////////////////////////////////
fun checkNumber(num: Number) {
	when (num) {
		is Int -> println("number is Int")
		is Double -> println("number is Double")
		else -> println("number not support")
	}
}
```
如果 return 或枚举类型搭配 when 语句，在 when 未覆盖所有结果时会报错，必须用 else
```kotlin
enum class Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}
fun getDayType(day: Day): String {
    return when (day) {
        Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY -> "Weekday"
        Day.SATURDAY, Day.SUNDAY -> "Weekend"
        // 这一行也可以写为else -> "Weekend"，不写报错
    }
}
```
当 when 依靠外部输入数字或者函数返回值时就不用定义 else
#### 循环
- kotlin 可以创建**区间变量**可用于循环，传统 for-i 被舍弃，each for 使用区间变量改进改进
	- **`..`**: 创建一个闭区间范围，包括起始值和结束值。例如，`1..5` 表示 1 到 5 的范围。
	- **`until`**: 创建一个左闭右开的范围，包括起始值但不包括结束值。例如，`1 until 5` 表示 1 到 4 的范围。
	- **`downTo`**: 创建一个递减的范围。例如，`5 downTo 1` 表示从 5 递减到 1 的范围。
	- **`step`**: 用于指定步长，即每次迭代的增量。例如，`1..10 step 2` 表示 1, 3, 5, 7, 9。
```kotlin
val range = 0..10·		// 创建区间变量[0, 10]
val range = 0 until 10	// 创建区间变量[0, 10)
val range = 0 until 10 step 2 downTo 2 // 递减左闭右开区间，先用step再用downto
val range = 10 downTo 0 step 2			// 也可以这样写
```
### 面向对象
**Kotlin 文件中可以有多个类**，类的可见性与 Java 有所不同，Kotlin 允许在同一个文件中定义多个类、对象、函数等，并且没有限制必须只有一个 `public` 类。

- 如果类没有显式声明为 `public`，那么它的可见性默认为 **`internal`**（只在当前模块中可见），或者 `private`（只在当前文件内可见）。
- 你可以在同一个文件中定义多个类，并且它们都可以是 `public`，但通常为了代码组织和清晰度，我们推荐 **每个文件一个顶级 `public` 类**。
#### 封装——类的使用
代码示例
```kotlin
fun main(){
    var uprange = 0 until 10 step 2
    var downrange = 10 downTo 0 step 2
    for(i in uprange){
        println(i)
    }
    for(i in downrange){
        println(i)
    }
}
```

这里使用了一些 [[java编程的逻辑]]中关于 [[java编程的逻辑#模块、包的应用|java 包的构建逻辑]]
创建一个 kotlin 类，先要将类定义放在类文件中，文件位置和 Main. kt 文件同级
![[Pasted image 20241214152256.png|339]]
Main 和 Person 文件中**都声明** `package com.example.learingkotlin` 表示两者同属于一个软件包，其中内容可以互相引用，类似 `#include`
#### 继承——类修饰符
两个类之间需要**创建**继承关系，需要父类**可以被继承**，kotlin 中加上 `open` 关键字表示可以被继承，java 中加上 `finnal` 关键字表示不可以被继承。kotlin 中所有非抽象类是不能实现的，一定要子类去继承才能实现
```kotlin
open class Person {
    var name =""
    var age =0
    fun eat(){
        println(name + "is eating, he is "+age+" years old")
    }
}
class Student : Person(){
    val sno =""
    val grade =0
}
```
- 继承时使用了 `()`，说明过程中使用了函数调用，对于类调用的是构造函数，Kotlin 将构造函数分成了两种：**主构造函数和次构造函数**。
	- 主构造函数没有函数体，**只用来声明和初始化变量**
	- 主构造函数在类名后的括号中书写，不能再类中使用 `fun 同类名函数(){}`
	- 主构造函数集*声明和初始化*为一体
	- 如果需要在创建对象时进行一些初始化操作需要使用 `init` 关键字定义
	- `init` 会在主构造函数**运行完后立刻运行**
	- 次构造函数用来处理**多种不同类型或数量参数**的情况下的初始化任务。允许定义多个
	- 子类中构造函数必须调用父类中构造函数
```kotlin
open class Person(var name: String, var age: Int) {
//    val name = "" 由于主构造函数已经定义，不用重复声明成员变量了
//    val age = 0
    init {
        println("object is initialing")
    }
    constructor(name: String) : this(name,0)

    fun eat(){
        println(name + "is eating, he is "+age+" years old")
    }
}
class Student : Person("Alice",18){
    val sno =""
    val grade =0
}
```
> 绝大多数时候一般不编写 `init` 函数，而是主构造函数初始化参数（如果不定义主构造函数，子类继承不需要括号），而用多个次构造函数应对有参数传入的**所有情况**
> `constructor` 次构造函数继承当前类（this），并调用当前类的主构造函数，传入主构造函数的 name 并设置 age 为 0（这本质上并不是只需要传入一个参数，而是为没传入的参数设置初始值）

^csbpqh

- 子类中调用父类有参构造函数时，如果子类中有父类同名成员变量时，不能将它们声明为 val，加了 val 表示声明一个新的变量而不是传入一个已有变量
```kotlin
open class Person(var name: String, var age: Int) {
    init {
        println("object Person is initialing")
    }
    constructor(name: String) : this(name,0)

    open fun eat(){
        println(name + "is eating, he is "+age+" years old ")
    }
}
class Student(val sno :String ,val grade :Int) : Person("Alice",18){
    init {
        println("object Student is initialing")
    }
    override fun eat(){
        println(name + "is eating, he is "+age+" years old and his sno is "+sno+" grade is "+ grade)
    }
}
------------------------------
fun main(){
    val p = Person("jack",19)
    p.eat()
    val s = Student("a123",7)
    s.eat()
}
```
- 使用 `Override` 重载成员函数，由于 `Student` 继承了 `Person`，所以 `Person` 主构造函数中声明的两个变量可以被 `Student` 读取到
- Kotlin 规定，当一个类既有主构造函数又有次构造函数时，所有的次构造函数都必须调用主构造函数（包括间接调用） ^4sxqyn
```kotlin
class Student(val sno: String, val grade: Int, name: String, age: Int) :Person(name, age) {
	constructor(name: String, age: Int) : this("", 0, name, age) {}
	constructor() : this("", 0) {}
}
```

这样的规定是为了主构造函数中声明的参数在未被传入内容时，防止类不完整，次构造函数必须调用主构造函数，就必须对声明但没有赋值的成员变量赋值

> 如果类中没有主构造函数，[[#^csbpqh|类的继承不用写括号]]情况下，有需要满足调用主构造函数要求，则必须使用 `super` 调用父类构造函数

#### 接口——对象多态
Java 是单继承结构的语言，任何一个类最多只能继承一个父类，但却可以实现任意多个接口，Kotlin 也是如此。
接口由类实现，Java 中继承使用 `extends`，实现接口使用 `implements`，而 Kotlin 中统一使用冒号，中间用逗号进行分隔。接口的后面不用加上括号，因它没有构造函数可以去调用
```kotlin
class Student(val sno :String ,val grade :Int) : Person("Alice",18),Study{
    override fun readBooks() {
        println(name + " is reading")
    }
    override fun doHomework() {
        println(name + " is doing homework")
    }
}
-------------------------------------------------
fun doStudy(studyStuff:Study){
    studyStuff.readBooks()
    studyStuff.doHomework()
}
fun main(){
    val s = Student("a123",7)
    s.eat()
    doStudy(s)
}
```

---
调用接口时使用的函数可见性修饰符
Java 中有 public、private、protected 和 default（什么都不写）这 4 种函数可见性修饰符
- private 修饰符在两种语言中作用是一模一样的，都表示只对当前类内部可见
- public 两者表示对所有类都可见，但在 Kotlin 中 public 修饰符是默认项，而在 Java 中 default 才是默认项
- protected 关键字在 Java 中表示对当前类、子类和同一包路径下的类可见，在 Kotlin 中则表示只对当前类和子类可见。
- default 可见性（同一包路径下的类可见）

| 修饰符       | Java              | Kotlin    |
| --------- | ----------------- | --------- |
| public    | 所有类可见             | 所有类可见（默认） |
| private   | 当前类可见             | 当前类可见     |
| protected | 当前类、子类、同一包路径下的类可见 | 当前类、子类可见  |
| default   | 同一包路径下的类可见（默认）    | 无         |
| internal  | 无                 | 同一模块中类可见 |

#### 数据类和单例类
##### 数据类
数据类通常需要重写 `equals()`、`hashCode()`、`toString()` 这几个方法。其中，`equals()` 方法用于判断两个数据类是否相等。`hashCode()` 方法作为 `equals()` 的配套方法，也需要一起重写，否则会导致 HashMap、HashSet 等 hash 相关的系统类无法正常工作。
代码示例
```java
public class Cellphone {
	String brand;
	double price;
	public Cellphone(String brand, double price) {
		this.brand = brand;
		this.price = price;
	}
	@Override
	public boolean equals(Object obj) {// 为了实现两个手机对象使用equal方法比较
		if (obj instanceof Cellphone) {
			Cellphone other = (Cellphone) obj;
		return other.brand.equals(brand) && other.price == price;
		}
		return false;
	}
	@Override
	public int hashCode() { // 作为equal方法的底层实现
		return brand.hashCode() + (int) price;
	}
	@Override
	public String toString() {// 其他需要实现的方法
		return "Cellphone(brand=" + brand + ", price=" + price + ")";
	}
}
```

创建数据类的固定功能是**固定而毫无逻辑**的，在一个类前面声明了 data 关键字时，就表明你希望这个类是一个数据类，Kotlin 会根据主构造函数中参数帮你将 `equals()`、`hashCode()`、`toString()` 等固定且无实际逻辑意义的方法自动生成。
```kotlin
data class Cellphone(val brand: String, val price: Double)
```
- 如果一个类中没有任何代码，可以将 `{}` 省略，但不建议，因行业默认约定
- 直接对 data 类使用 `println` 默认调用 `toString()` 实现，打印格式为：`ClassName(property1=value1, property2=value2, ...)`
- `equal` 调用返回 `boolean`

##### 单例类
单例模式是最基本的设计模式，保证全局只有一个类的实例，
```java
public class Singleton {
    private static Singleton instance;      // 在类中创建一个对象，并且是静态的，保证只有类的内部成员函数才能访问，因只创建了一个，所以只能容纳一个instance，所以叫做单例模式
    private Singleton(){}

    public synchronized static Singleton getInstance() {
        // 如果没有instance被创建，就创建并返回，synchronized保证不会有两个线程同时getInstance
        if (instance == null) {
            instance = new Singleton();// instance 变量private，可以被访问
        }
        return instance;
    }

    public void SingletonTest() {
        System.out.println("Singleton test is called");
    }
}
```
kotlin 创建基本的单例模式较为简单，只需要将 class 关键字改成 object 关键字即可。在软件包右键创建对应的 object 即可
上面的代码可以简化为：
```kotlin
object Singleton {
	fun singletonTest() {
		println("singletonTest is called.")
	}
}
```
## Lambda 编程
### 集合
`List<String> list = new ArrayList<>();`
- java 中
	- 传统意义上的集合主要就是 List 和 Set，再广泛一点的话，像 Map 这样的键值对数据结构也可以包含进来。List、Set 和 Map 在 Java 中都是接口，这些接口可以实现存储某些特定类型的数据元素（使用 `<datatype>` 创建）
	- 接口需要被实现才能使用，所以使用 `ArrayList<>` 创建了一个 `ArrayList` 对象，它是 `List` 接口的一个具体实现类，让接口有实际的功能，使用 `()` 调用构造函数创建对象，`new` 分配内存
- kotlin 中
	- 内置 `listOf()` 函数来简化初始化集合的写法
	- `listOf()` 创建的内容可以被 `for-in` 使用
```java
// java初始化
val list = ArrayList<String>()
list.add("Apple")
list.add("Banana")
list.add("Orange")
list.add("Pear")
list.add("Grape")
// java遍历
for(string x : list){
	System.out.println(x);
}
```
```kotlin
// kotlin初始化
val list = listOf("Apple", "Banana", "Orange", "Pear", "Grape")
// kotlin遍历
for (fruit in list){// fruit类型自动推导
	println(fruit)
}
```
### 集合的可变和不可变
使用 `listOf()` 创建的集合默认不可变，是“`const`”的，**并不是由于变量类型为 val**，使用 `mutableListOf()` 可以创建可变集合，使用它的 `.add()` 方法添加内容
```kotlin
val list1 = listOf("alpha","beta","charlie")
val list2 = mutableListOf("alpha","beta","charlie")
list2.add("delta")
for( x in list1){
    println(x)
}
for( y in list2){
    println(y)
}
```
还可以使用 `set` 创建集合，不过不能放重复的元素，也有 `mutableSetOf()` 和 `.add()`
对于 `map`，Java 中建议使用 `put` 向其中添加元素，`get` 读取键值对，如：
```java
map.put("Apple", 1)
map.put("Banana", 2)
map.put("Orange", 3)
```
kotlin 可以使用类似 C++的方法初始化键值对
```kotlin
val map = HashMap<String, Int>()
map["Apple"] = 1
map["Banana"] = 2
map["Orange"] = 3
```
并内置 `mapOf` 和 `mutableMap()` 更简单地初始化
```kotlin
val map = mapOf("Apple" to 1, "Banana" to 2, "Orange" to 3, "Pear" to 4, "Grape" to 5)
```
其中 `to` 是一个 `infix` 函数
### lambda 函数语法
#### lambda 机制

获取一个集合中字符串长度最长的元素，可以使用集合的方法 `maxBy()`，他接受一个 lambda 作为参数，lambda 语法：
`{参数名1: 参数类型, 参数名2: 参数类型 -> 函数体}`
- Kotlin 规定，当 Lambda 参数是函数的最后一·个参数时，可以将 Lambda 表达式移到函数括号的外面
	`val maxLengthFruit = list.maxBy() { fruit: String -> fruit.length }`
- 如果 Lambda 参数是函数的唯一一个参数的话，还可·以将函数的括号省略
	`val maxLengthFruit = list.maxBy { fruit: String -> fruit.length }`
- Kotlin 拥有出色的类型推导机制，Lambda 表达式中·的参数列表在大多数情况下不必声明参数类型，进一步简化：
	`val maxLengthFruit = list. maxBy { fruit -> fruit. length }`
- 最后，当 Lambda 表达式的参数列表中只有一个参数时·，也不必声明参数名，而是可以使用 `it` 关键字来代替，那么代码就变成了：
	`val maxLengthFruit = list. maxBy { it. length }`

#### 常用函数式 API
##### map

map 用于将集合中每个元素都映射成一个另外的值，映射的规则在 Lambda 表达式中指定，最终生成一个新的集合
lambda 的作用便是可以自定义构建逻辑函数，放在需要规则作为参数的函数中
```kotlin
val list = listOf("alpha","beta","charlie")
val list2 = list.map { it.uppercase() }
val list3 = list.map { name : String -> name.uppercase() }// there hava same content
for (x in list2){
    println(x)
}
for(y in list3){
    println(y)
}
```

##### filter
过滤作用，其中 lambda 函数时判断逻辑而不是执行逻辑
```kotlin
val list = listOf("alpha","beta","charlie")
val filteredList = list.filter { it.length >=5 }.map { it.uppercase() }
```
由于返回值也是 List 类型（经过重载的各种集合类型），可以实现**链式调用**

##### any & all
`any` 函数用于判断集合中是否至少存在一个元素满足指定条件，`all` 函数用于判断集合中是否所有元素都满足指定条件，由于返回的是 `boolean`，不支持链式调用
```kotlin
val anyResult = list.any { it.length >= 5 }
val allResult = list.all { it.length >= 5 }
println(anyResult)
println(allResult)
```
any 和 all 支持两种重载，一种传入谓词（即（predicate）是一个接受一个或多个参数并返回一个布尔值（`true` 或 `false`）的函数。谓词通常用于条件**判断、过滤、搜索**等操作。），另一种不传入任何参数，判断容器是否为空
![[Pasted image 20241215105745.png]]

#### java 函数式 API
- 如果我们在 Kotlin 代码中调用了一个 Java 方法，并且该方法接收一个 Java **单抽象方法**接口参数，就可以使用函数式 API。Java 单抽象方法接口指的是接口中只有一个待实现方法，如果接口中有多个待实现方法，则**无法使用函数式 API**。
- 现在创建一个常见的单抽象方法接口，Runnable 接口。这个接口
- 中只有一个待实现的 `run()` 方法，Runnable 接口。其中只有一个待实现的 `run()` 方法，用来判断现在对象（一般和 `Thread` 配合使用）
```java
public interface Runnable{
    void run();         // Runnable is inside in java lib,function run is ready to Override by subclass
}

new Thread(new Runnable(){ // an anonymous arguement is Thread constructor
    // convey an object Runnable to argument list is Thread constructor
    // Runnable() calls default constructor,and override member fun run
    @Override
    public void run(){
        System.out.println("Thread is running");// make a sound
    }
}/*until here , argument initial over*/)/*use Runnable var to the constructor of Thread class*/.start();// method start will call Runnable.run()
```
the kotlin version
```kotlin
Thread(object : Runnable {
	override fun run() {
		println("Thread is running")
	}
}).start()
```
kotlin has no new key, so inorder to visualisily display the datatype of argument, use `object`
- only one arguement, so we can omit `object :`
- due to Runnable has only one unimplementated method, so if we write the body ,kotiln will know we wanna override the `run()`
- 如果一个 Java 方法的参数列表中有且仅有一个 Java 单抽象方法接口参数，我们还可以将接口名进行省略，这样代码就变得更加精简了
- Lambda 表达式还是方法的唯一一个参数，还可以将方法的括号省略
```kotlin
Thread({
	println("Thread is running")
}).start()
////////////finnal version////////////
Thread {
	println("Thread is running")
}.start()
```
## 空指针检查
为了防止空指针出现，一般函数都要对参数进行**判空处理**（java 中）
```java
public void doStudy(Study study) {
	if (study != null) {// 判空处理
		study.readBooks();// 非空才执行
		study.doHomework();
	}
}
```
kotlin 默认所有的**参数和变量都不可为空**，所以[[#^4sxqyn|次构造函数需要初始化次构造函数中未传入的主构造函数参数]]
![[Pasted image 20241215122028.png|375]]

### 可判空形式
#### 防止指针悬空
在*有可能*需要传入 `null` 作为参数的参数后加上 `?` 标记这个变量可为空，
```kotlin
fun doStudy(studyStuff:Study?){
    if(studyStuff!= null){
        studyStuff.readBooks()
        studyStuff.doHomework()
    }
}
fun main(){
    val student = Student("a123",19)
    doStudy(student)
```
接口用来实现**多态**，可以参考 [[java编程的逻辑#接口的本质]]，如果在接口中实现函数体，则表示定义接口默认实现，实现接口必须要实现所有内容，这一点在有默认接口实现的情况下不再强制
#### 判空辅助工具
##### 调用符号
- `?.`：表示对象不为空时正常调用对象的方法，为空时什么都不做
- `?:` 同理，如果左边表达式的结果不为空就返回左边表达式的结果，否则就返回右边表达式的结果，注意 kotlin 的 `returnable_expre ?: b` （只有左边对象不是 `null` 时执行左边表达式，为空右边） 要和 C++中 `judge_expre ? a : b` 不一致
```kotlin
if(a != null){
	a.doSomething()
}
///////////可以化简为/////////////
a?.doSomething()
---------------------------------
val c = if(a != null){
	a
}else{
	b
}
///////////可以化简为/////////////
val c = a>:b
```
判空只能在作用域内进行，在一个未判空的函数外部执行判空操作，并在函数内部执行需要判空的操作时，可能导致无法编译
```kotlin
val content: String? = "hello"
fun printUpperCase(){
    val upperCase = content.uppercase()
    println(upperCase)
}
fun main(){
    if(content!=null){
        printUpperCase()
    }
}
```
- 代码中 `content` 在全局声明为**一个可以为空**的变量
- `printUppercase()` 函数中没有判空就直接使用 `uppercase` 方法，但这个方法需要一个不为空的对象才能调用，也可以理解为只有 `?.` 和 `!!.` 才能调用一个**可能为空的对象本来有的方法**，即手动表明这个变量不可能为空

- 有五种方法可以解决这个问题：
	1. if-else 语句提前判空
	2. 将 content 类型声明为 `content:String` 去掉可能为空标志
	3. 使用 `?:` 添加为空默认值
	4. 使用 `!!` 强制判定非空
	5. 使用 `?.` 表示是一个可能为空的引用，为空时什么都不做（虽然它一定不为空，但在 `printUppercase` 函数作用域中无法得知）
main 函数能得知是因它显式执行了 `content!=null` 得知了 `content` 是常量
##### let 函数
如果一个对象不为空时有很多操作要做，但 kotlin 并没有提供一种*代码块性质的调用*
```kotlin
fun doStudy(study: Study?) {
	study?.readBooks()
	study?.doHomework()
}
```
方法多了就有点啰嗦（超长对象名）
```kotlin
fun doStudy(study: Study?) {
	study?.let(){ stu : Study->
		stu.readBooks()
		stu.doHomework()
	}
}
-------------------------------
fun doStudy(study: Study?) {
	study?.let {
		it.readBooks()
		it.doHomework()
	}
}
```
其中由于 lambda 函数作为 `let` 唯一参数，所以省略 `()`，其中只有一个参数所以省略用 `it`

## kotlin 中小魔术
### 字符串内嵌表达式
语法：`"hello, ${obj.name1，obj.name2.....。}. nice to meet you!"`
Python 的前置 f 已经支持内嵌，C++更是使用 `<<` 集流控制和内嵌一体，java 到现在还不支持？
```kotlin
println("Cellphone(brand=" + brand + ", price=" + price + ")")
println("Cellphone(brand=$brand, price=$price)")// 但kotlin支持
```

### kotlin 中传参
如果一个函数参数列表中都是一种类型的参数，那么给他们中部分设置默认值时，想让某些参数使用默认值而其他用传入的值就**不能使用位置传参**，必须使用键值对传参方式[[Python Basics#函数传参使用方式|同Python，其他语言中也存在这样的机制]]
```kotlin
class Student(val sno: String = "", val grade: Int = 0, name: String = "", age: Int = 0) :
	Person(name, age) {
}
```
kotlin 中由于 val 必须有初始值，一般在主构造函数中将所有参数初始化，传参的时候无论使用什么样的参数组合都能够正确识别，**这也是为什么次构造函数很少用到的原因**

# 先从看得到的入手，探究 Activity
## Activity 是什么
Activity 是最容易吸引用户的地方，它是一种可以包含用户界面的组，主要用于和用户进行交互。
创建 Android 项目时选中 `No activity` 会使 com. example. project_name 中没有文件
![[Pasted image 20241215171722.png]]
可以右键创建一个新的 `activity`，不勾选 Generate Layout File和 Launcher Activity 则表示这个 activity 是真正“空”的
- 勾选 Generate Layout File 表示会自动为 FirstActivity 创建一个对应的布局文件
- 勾选Launcher Activity 表示会自动将 FirstActivity 设置为当前项目的主 Activity

---
任何 Activity 都必须重写 `OnCreate` 方法，并且最好每一个 Activity 都能对应一个布局。布局是用来显示界面内容的，没有布局就无法看到内容
在 res 中创建 `layout` 文件，会调起可视化编程工具
创建一个新的 Activity ，默认使用 `kt` 创建，每一个 Activity 要有一个布局对应，布局用来显示界面内容

## 布局编辑
### Activity 设置、注册和显示
```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout   //根元素设置在这里体现
xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <Button
		android:id="@+id/button"  // Android元素的唯一标识符
        android:layout_width="wrap_content"  // 设置控件宽度刚好包裹内容
        android:layout_height="wrap_content"
        android:text="Get Postion"  // 按钮上展示的内容
        tools:layout_editor_absoluteX="153dp"  // 按钮绝对位置
        tools:layout_editor_absoluteY="623dp" />
</androidx.constraintlayout.widget.ConstraintLayout>
```
![[Pasted image 20241216113038.png]]
`@+id/button1` 这种语法变成 `@id/button1`，是在 XML 中引用资源的语法
项目中添加的任何资源（图片、布局、值、xml）都会在 R 文件中生成一个相应的资源 id，因此我们刚才创建的 first_layout. xml 布局的 id 现在已经添加到 R 文件中

> 每编写好一个 layout 文件，需要在对应的 Activity 中加载布局
> 任何一个 Activity 想要运行显示，都需要在 MainActivity 中注册

```kotlin
class FirstActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView((R.layout.first_layout))// 所有文件在R（res资源文件中有唯一id）用.检索
    }
}
```
`setContentView` 用来显示布局
一个 Activity 是一个活动，活动中有各种内容，要让活动作用，发生视觉、交互功能需要在 AndroidManifest.xml 中注册
![[Pasted image 20241216115239.png]]
配置完成之后，还需要为程序配置主Activity。也就是说，程序运行起来的时候，不知道要首先启动哪个 Activity。
配置方法是在 `<activity>` 标签的内部加入 `<intent-filter>` 标签，并在这个标签里添加 `<action> android:name="android. intent. action. MAIN"/>` 和`<category
`android:name="android. intent. category. LAUNCHER" />`这两句声明即可
```xml
    <activity android:name=".FirstActivity" android:exported="true" android:label="This is a label for .FirstActivity">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER"/>
        </intent-filter>

    </activity>
```
其中：
1. `android:label="This is a label for .FirstActivity" `：为活动设置了一个标签，这个标签通常会显示在应用的标题栏上。在Android 11及更高版本中，`android:label`属性被废弃，推荐使用`android:label`属性的资源引用形式，如`@string/app_name`。
2. 1. `<intent-filter>` 标签：定义了一组条件，系统会根据这些条件来决定是否可以启动这个活动。如果没有`<intent-filter>`，活动将无法被系统识别和启动。
3. `<action android:name="android.intent.action.MAIN" />`：指定了这个活动应该响应的Intent动作。`android.intent.action.MAIN` 是一个特殊的动作，表示这个活动是应用的入口点，即启动应用时默认显示的活动。
4. `<category android:name="android.intent.category.LAUNCHER"/>`：指定了这个活动属于哪一类Intent。`android.intent.category.LAUNCHER` 表示这个活动应该显示在应用抽屉中，并且可以被用作应用的启动器图标

---
- 当用户点击应用图标时，系统会查找具有`MAIN`和`LAUNCHER`过滤器的Activity，并启动它。
- `FirstActivity`被指定为这样的Activity，因此应用启动时将显示`FirstActivity`的用户界面。
- `FirstActivity`不需要被其他应用启动，建议将`android:exported`属性设置为`false`，以提高应用的安全性。
- 在 layout 文件中使用 `tools` 绝对位置排列控件只会在 Design 页面设计时生效，并不会展示在最终 app 中，如：
```xml
tools:layout_editor_absoluteX="153dp"
tools:layout_editor_absoluteY="623dp"
```
标签中也可以看到是在 editor 中生效，绝对位置属性已经弃用（不能适用多种分辨率），现在一般使用 `layout_constraint***` 来约束控件相对位置
#### 闪退原因
如果应用发生闪退，可能是因 AndroidManifest 中 applicantion 没有导入 `Android:theme` 的标签，具体少了哪一个可以通过 logcat 查看，一般通过软编码引用 style. xml 文件中 theme 标签指向的数据
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light"/>
</resources>
```
再修改 Activity 标签中 `android:theme="@style/AppTheme"` 或者修改 application 标签中 `android:theme` 内容保证全局所有 Activity 都使用这个主题
### 使用 Toast
#### 弹出消息
Toast 作用是调用底层接口，弹出一小段信息，如果是文本，通过 makeText 第三个参数控制时间长短，只有两个选项，通常设置为 int 类型，表示秒数
```kotlin
class FirstActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView((R.layout.first_layout))
        val button1 : Button = findViewById((R.id.button1))
        button1.setOnClickListener{
            Toast.makeText(this,"you can click Button 1 ",Toast.LENGTH_LONG).show()
        }
    }
}
```
首先在 Firstactivity 文件中使用逻辑布局将一个 button 变量和真实存在的 button 按钮联系起来，真实存在的按钮是一个**控件**，在 R 文件中**具有唯一 id**，所以可以使用
- 其中，所有 Andriod 中预定义组件中，都会在`android.widget` 包中。Android SDK 已经为所有常用的 UI 组件（如 `Button`、`TextView`、`EditText` 等）提供了预定义的类。
- 所有 UI 组件类（如 `Button`）都继承自 `android.view.View`，并且在 Android Studio 中通过导入相应的包来使用。(使用类会自动导包)
![[Pasted image 20241216124437.png]]
- this 表示点击 button 出现的内容会在当前*上下文*中显示，即我点击按钮不会有消息弹出在上一层界面或其他地方，只在当前界面弹出
- `findViewById()` 方法的作用就是获取布局文件中控件的实例
#### findViewById() 方法使用
为每一个控件使用一次 findViewById() 函数有点麻烦但kotlin-android-extensions 已经在 kotlin 1.4 版本弃用，viewBinding 似乎也不能在 Gradle 中启用，所以最好的办法是使用 Jetpack compose 或者继续使用 findViewById
### 创建菜单
在 res 中创建一个 menu 文件，在 FirstActivity 中重写（Ctrl+O），来改变应用打开之后显示菜单（需要调整 activity 的先后顺序 ）
```kotlin
override fun onCreateOptionsMenu(menu: Menu?): Boolean {
	menuInflater.inflate(R.menu.main, menu)
	return true
}
```
其中 menuInflater 函数作用是在菜单上拓展层级，参数制定了：
- 给R.menu. main 位置的菜单文件上创建菜单
- 指定（第二个参数）将创建的菜单项添加到传入的菜单参数中
- 返回 `true` 表示将创建的菜单显示出来，`false` 表示不显示菜单
#### Java Bean
Kotlin 提供一个访问成员私有变量的*语法糖*
```java
public class Book {
	private int pages;
	public int getPages() {
		return pages;
	}
	public void setPages(int pages) {
		this.pages = pages;
	}
}
```
本来需要调用 setter 和 getter 的情况被简化为类似函数赋值一样，
```kotlin
val book = Book()
book.pages = 500
val bookPages = book.pages
```
kotlin 默认为为**所有公共成员变量**都创建 setter （如果他是 var）和 getter
#### inflate
指的是从 **XML 布局文件** 或 **菜单 XML 文件** 中读取内容并将其转换成相应的 **View 对象**，**布局文件 (`XML`)** 是静态的，而 **View** 是动态的。`inflate` 的作用就是将布局文件（例如，`activity_main.xml`）中定义转化成实际的 UI 组件（即 `View` 对象），这些组件才会在屏幕上显示。（通过返回值形式，需要用变量存储）
常用的有：
- **`LayoutInflater.inflate()`** 用于将 **布局 XML 文件** 转换成 `View` 对象（通常用于加载 UI 布局）。
- **`MenuInflater.inflate()`** 用于将 **菜单 XML 文件** 转换成菜单项，动态加载并显示菜单。
```kotlin
override fun onCreateOptionsMenu(menu: Menu?): Boolean {
    menuInflater.inflate(R.menu.main,menu)
    return true
}

override fun onOptionsItemSelected(item: MenuItem): Boolean {
    return when(item.itemId){
        R.id.add_item->{
            Toast.makeText(this , "you clicked Add", Toast.LENGTH_SHORT).show()
            true}
        R.id.remove_item->{
            Toast.makeText(this , "you clicked Remove", Toast.LENGTH_SHORT).show()
            true}

        else -> {true}
    }
}
```
- 其中 `onCreateOptionsMenu` 函数在一个 Activity 被调用时自动调用，用来管理所有的菜单对象，`onOptionsItemSelected` 在**用户点击菜单视图时**自动调用，**一个 Activity 中所有菜单对象统一由它管理**
- 其中 when 语句的语法可以参考 [[#^128b5c|When的逻辑]]
- 在 `onCreateOptionsMenu` 方法中，`menu` 参数是由 Android 系统自动传递给你的，它是一个 **Menu** 类型的对象，代表当前 `Activity` 中菜单。这个 `menu` 对象由系统在 `Activity` 创建时初始化，并在 `onCreateOptionsMenu` 方法被调用时传入。
- **菜单自动放置在右上角** 是由 Android 的 UI 设计标准和 **ActionBar** / **Toolbar** 控制的。可以通过自定义 `Toolbar` 布局来改变菜单项的位置。
### 销毁一个 Activity
使用 app 时退出一个页面（按下 back 键或其他导致页面关闭而不是挂载在后台的行为）当前 activity 就会销毁，在程序中用 `finish()` 函数完成

## 使用 Intent 在 Activity 之间穿梭

> Intent 是 Android 程序中各组件之间进行交互的一种重要方式，它不仅可以指明当前组件想要执行的动作，还可以在不同组件之间传递数据。Intent 一般可用于启动 Activity、启动 Service 以及发送广播等场景

**Intent** 不是仅仅用来在 `Activity` 之间跳转的，还可以作为 Android 系统中一种通信机制，在应用中不同组件（如 `Activity`、`Service`、`BroadcastReceiver` 等）之间传递数据和控制信息。
Intent 大致可以分为两种：显式 Intent 和隐式 Intent
### 显式 Intent
点击按钮跳转 Activity，intent 跳转到***具体的***类中
```kotlin
button1.setOnClickListener{
	val intent = Intent(this,SecondActivity::class.java)
	startActivity(intent)
}
```
- 其中第一个参数是 **上下文 (Context)**。告诉 Android 系统 **当前操作所依赖的环境或应用的上下文**，现在的状态是什么，从哪里启动 intent，`this` 表示当前状态，即指向当前 Activity
- 第二个参数通常是目标组件的 **类对象 (Class)**，表示你想要启动的目标 `Activity` 或组件
- `SecondActivity::class`：是 Kotlin 的类引用语法，表示 `SecondActivity` 的类引用。
- `.java`：这是 Kotlin 提供的属性，它用于获取类的 `java.lang.Class` 对象，这个对象是 Java 中用来表示类的元数据的。将 kt 中类对象转换为 java 中 class 对象
- 只要在 `AndroidManifest.xml` 文件中注册过的 Activity，都可以通过 `Intent` 不指定组件类的文件来源直接调用
### 隐式 intent
它并不明确指出想要启动哪一个 Activity，而是指定了一系列更为抽象的 action 和 category 等信息，然后交由系统去分析这个 Intent，并帮我们找出合适的 Activity 去启动。
val intent = Intent("com.example.myapp.ACTION_VIEW")
startActivity(intent)
#### intent-fliter 标签
在 `AndroidManifest.xml` 中声明 `Activity`、`Service` 或 `BroadcastReceiver` 能够响应哪些 `Intent`。`intent-filter` 包含了 `action` 和 `category` 等标签，这些标签定义了 `Intent` 能匹配的条件，进而决定哪个组件可以处理特定的 `Intent`。
`action` 标签：
用来描述 `Intent` 的操作类型，比如 `VIEW`（查看）、`EDIT`（编辑）、`SEND`（发送）等。在用户执行某周操作时调用
- `android.intent.action.VIEW`：查看资源。
- `android.intent.action.EDIT`：编辑资源。
- `android.intent.action.MAIN`：应用程序的启动动作。
- `android.intent.action.SEND`：发送数据。
`category` 标签：
进一步限定 `Intent` 的场景（上下文），比如 `DEFAULT`、`LAUNCHER`、`BROWSABLE` 等。
- `android.intent.category.DEFAULT`：这是默认的类别，几乎所有的 `Intent` 都会包含这个类别。
- `android.intent.category.LAUNCHER`：表示启动一个应用的主 `Activity`，通常用于应用图标点击时启动应用。
- `android.intent.category.BROWSABLE`：表示一个能够处理浏览器链接的 `Activity`。
- `android.intent.category.ALTERNATIVE`：表示可以作为另一种选择来处理该 `Intent` 的 `Activity`。
`data` 标签
指明需要处理的数据类型或 URI，例如指定处理某一类文件、某个特定 URL 或其他数据。
```kotlin
<intent-filter>
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT"/>
    <data android:scheme="http"/>
    <data android:host="www.example.com"/>
    <data android:mimeType="image/jpeg"/>
    <data android:path="/specific/path" />
</intent-filter>
```
- `mimeType` 属性用来指定 MIME 类型，通常与 `data` 配合使用，尤其是涉及文件操作时。例如，发送图片时需要指定 `image/jpeg` 或 `image/png`。
- `type` 指定 Intent 的数据类型
- `scheme` 用于指定 Intent 的 URI scheme，例如 `http`、`https`
- `host` 指定 Intent 的 URI host，例如 `www.example.com`
- `path``pathPrefix`指定 Intent 的 URI path 或 path prefix
#### intent 匹配机制
```kotlin
val intent = Intent("com.example.myapp.ACTION_VIEW")
startActivity(intent)
```
- 这个隐式 `Intent` 并没有指定具体的 `Activity`，但，如果 `AndroidManifest.xml` 中存在符合 `ACTION_VIEW` 动作的 `Activity`，系统会启动该 `Activity`（`android.intent.category.DEFAULT` 是一种默认的category，在调用startActivity()方法的时候会自动将这个category添加到Intent中）。
- 每个 Intent 中只能指定一个 action，但能指定多个 category，对 `Intent` 类型变量使用 `addCategory()` 函数增加
- action 和 category 标签中字段类型是 `String`，**可以自定义**，也可以用内置的
- **`category` 是可选的**，如果没有指定，系统会默认假设使用 `DEFAULT` 类别。
- 当使用 `Intent` 进行隐式调用时，需要 `action` 和 `category` 两个参数。只有当这两个参数同时满足时，系统才会启动所有符合这两个标签的**第一个匹配的** Activity，然后中断匹配，启动该 Activity。
- 匹配的顺序是在 `AndroidManifest.xml` 中注册顺序
---
- 再添加自定义 `category` 标签时，需要在 AndroidManifest 中需要被匹配上的 Activity 的 intent-fliter 中额外添加一条（因使用 Intent 对象默认包含了默认 category） `<category android:name="android.intent.category.DEFAULT"/>` 其次才是自定义标签，否则不匹配
- 能被匹配上的 Activity 都需要**支持 export**，即在 AndroidManifest 注册时需要属性
```kotlin
<activity
    android:name=".SecondActivity"
    android:exported="true" >
```
#### 应用之间 Intent 跳转
使用隐式 Intent，不仅可以启动自己程序内的 Activity，还可以启动其他程序的 Activity，如需要打开一个链接，可以直接调用系统浏览器打开它而不必自己写一个浏览器功能
```kotlin
button1.setOnClickListener{
    var intent = Intent(Intent.ACTION_VIEW)
    intent.data = Uri.parse("https://www.baidu.com")
    startActivity(intent)
}
```
- 注意 `intent.data = Uri.parse("https://www.baidu.com")` 是使用了 `setter` 的[[#Java Bean|语法糖]]
- `Uri.parse () ` 方法将一个网址字符串解析成一个 Uri 对象，再调用 Intent 的 setData () 方法将这个 Uri 对象传递进去。放在 intent 变量中，一旦用户点击按钮便会发出 `VIEW` 指令，系统调用能够实现 `VIEW` 功能并且 `data` 为一个 Uri 对象（如果是其他对象则调用不同系统功能）的功能，也就是系统浏览器来实现
```kotlin
<activity
    android:name=".ThirdActivity"
    android:exported="true">
    <intent-filter tools:ignore="AppLinkUrlError">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <data android:scheme="https" />
    </intent-filter>
</activity>
```
这样设置表示 `ThirdActivity` 可以响应 `ACTION_VIEW` 的 `Intent`，并且这个 `Intent` 必须带有 `https` 协议的 URL。
由于 AndroidStudio 认为所有能够响应 `ACTION_VIEW` 的 Activity 都应该加上 `BROWSABLE` 的 category，否则就会给出一段警告提醒
还可以设置很多协议和电话之类让系统识别并跳转到对应的 Activity
```kotlin
button1.setOnClickListener {
	val intent = Intent(Intent.ACTION_DIAL)
	intent.data = Uri.parse("tel:10086")
	 startActivity(intent)
}
```
- `Intent.ACTION_DIAL` 是内置动作，一般由系统拨号盘应用完成
- `tel` 是协议类型，描述动作的类型
- `10086` 表示动作具体内容
### 向下一个 Activity 传递数据
