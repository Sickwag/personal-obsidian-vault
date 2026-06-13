# VLA 和 FAM

## VLA（Variable-Length Array
C99 引入，C11 降级为可选
```cpp
void f(int n) {
	int arr[n];   // n在运行时才确定
	// arr在栈上
}
```
- 核心特征：数组长度是运行时变量，不是编译期常量
- 存储位置：栈。`sizeof(arr) = n * sizeof(int)`，编译器在函数prologue中通过 `alloca` 或等价机制动态调整栈指针
- 生命周期：函数返回时自动释放

C++中没有VLA。C++标准从没接受过VLA（虽然GCC作为扩展支持了 `int arr[n]`）。你在C++里想写"运行时长度栈数组"只有 `std::array`（编译期固定）或 `std::vector`（堆分配）

为什么Redis几乎不用VLA？因为Redis是长期运行的服务器进程，栈上放动态大小数据是危险的——栈空间有限（通常8MB），一个恶意输入导致 `n` 很大时直接栈溢出 crash。看 Redis 源码里唯一用到 VLA 的地方（`debug.c` 等边缘路径），也是小规模、可控长度的场景

## FAM（Flexible Array Member）
C99 引入，如果一个结构体**最后一个成员**是**不完整数组类型**（即 `[]` 而不指定大小，即柔性数组（VLA），那么这个结构体就是 FAM struct
```c
struct intset {
	uint32_t encoding;
	uint32_t length;
	int8_t contents[];   // FAM：不占sizeof，占位符
};
```
- 核心特征：`struct` 末尾的不定长数组，`sizeof(struct)` 不包含它。分配时手动加上数据区大小
- 存储位置：堆。跟随父对象的 `malloc` / `zrealloc`，与 header 在同一块内存中连续布局

FAM 对应的 C++等价物：C++没有 FAM。常见替代方案：
```cpp
// C的FAM → C++可以用：
// 方案1: 用一个char[]成员然后reinterpret_cast（不推荐，UB）
// 方案2: 分离header和data（两次分配）
// 方案3: 直接用vector<int8_t>（heap独立，但方便）
struct IntSet {
	uint32_t encoding;
	uint32_t length;
	std::vector<int8_t> contents;  // 但contents的数据在另一个堆块
};
```
FAM相比 `vector` 的优势就是零间接——数据紧接着 header，一次 `zrealloc` 同时调整 header 和 data，不会有额外的指针跳转

C vs C++的一个微妙区别：
```c
// C中FAM的典型分配模式：
struct intset *is = malloc(sizeof(struct intset) + extra_bytes);
```
```cpp
// C++中直接这么做有问题：
// struct intset不是POD？构造函数存在？
// 自C++起，FAM不是标准C++特性
```
# POD 类型
https://zhuanlan.zhihu.com/p/56161728
## 含义解释
POD类型是 C++中常见的概念，用来说明类/结构体的属性，具体来说它是指没有使用面相对象的思想来设计的类/结构体。POD 的全称是 Plain Old Data，Plain 表明它是一个普通的类型，没有虚函数虚继承等特性；Old 表明它与 C 兼容。
POD 类型在 C++中有两个独立的特性：
### 支持静态初始化（static initialization）
- trivial classes 支持静态初始化（static initizlization），如果类的
	- 所有的拷贝构造函数
	- 所有的移动构造函数
	- 所有的赋值操作符
	- 所有的移动赋值操作符
	- 默认构造函数和析构函
	都是编译器生成的构造函数，而不是用户自定义的；且它的基类也有这样的特性，那么他就是平凡构造类（trivial class）
`template <typename T> struct std::is_trivial` 可判断类是否是 trivial
### 拥有和 C 语言一样的内存布局（memory layout）
standard 是指可以和其他语言通信，因为 standard-lay 类型的内部布局和 C 结构体一样。Standard layout 定义如下：
- 所有非静态成员都是 standard-layout
- 没有虚函数和虚基类
- 非静态成员访问控制权一样
- 基类是 standard-layout 的
- 没有静态成员变量，或者在整个继承树中，只有一个类有静态成员变量。
- 第一个非静态成员不是基类
`template <typename T>struct std::is_standard_layout` 判断一个类是否是 standard-layout。
### FAM 与 POD 类型
定义参考 [[#VLA 和 FAM#FAM（Flexible Array Member）]]
- `sizeof` 计算结构体大小时**不包含该成员占用的空间**。该成员被认为是一个“占位符”，其实际大小需要在运行时通过 `malloc` 等动态分配决定。
- 虽然一个结构体最后一个成员是柔性数组，但是在使用 [[#sizeof 运算符|sizeof]] 计算结构体大小时会被当作占位符，大小为 0，在使用 malloc 时分配超过其中其他成员总和大小的内存后，剩下的内存会被分配到数组中。物理内存分布上他们是连续的
- 在 C++ 标准中，含有柔性数组的结构体（或类）不是 [[C++开发范式和术语#POD 类型|POD类型]]，违反了标准布局规定（`std::standard_layout` 要求所有非静态数据成员都在同一个地址范围内且布局可预测）。（事实上，在严格的标准 C++ 中，柔性数组甚至不是合法的成员类型）
由于柔性数组这一特性，含有柔性数组的结构体只能通过 `malloc`（或 `calloc`、`realloc`）等动态内存分配函数分配在堆上。分配在栈上必须在编译期知道明确的大小。但编译器语法上通过，只会给出警告，并且能够访问其中的正常成员，柔性数组大小是 0，且访问操作导致 UB
# SFINAE (Substitution Failure Is Not An Error)
## 含义解释
意思是"替换失败并非错误"。
- 当编译器在重载决议过程中尝试将模板参数替换到函数模板时，如果这个替换导致了一个无效的代码（比如，一个不存在的类型成员、无效的表达式等），编译器不会立即报错，而是**简单地忽略这个候选模板**，继续尝试其他可用的重载版本。
- **只有**当没有任何一个可行的重载版本时，编译器才会最终报错
- SFINAE 的主要用途是**在编译期根据类型特性来启用或禁用某些模板函数**
## 代码体现
```cpp
// 这个版本仅当 T 是整数类型时可用
template <typename T>
typename std::enable_if<std::is_integral<T>::value, void>::type
func(T t) {
    std::cout << "Called with integral: " << t << std::endl;
}

// 这个版本仅当 T 是浮点数类型时可用
template <typename T>
typename std::enable_if<std::is_floating_point<T>::value, void>::type
func(T t) {
    std::cout << "Called with floating point: " << t << std::endl;
}

int main() {
    func(42);    // 调用第一个版本，int 是 integral
    func(3.14);  // 调用第二个版本，double 是 floating point
    // func("hello"); // 编译错误！没有匹配的版本
}
```
当调用 `func(42)` 时，编译器尝试第二个版本，`std::is_floating_point<int>` 返回 `false`，导致 `std::enable_if<false, void>` 没有 `type` 成员，替换失败被忽略，编译器成功匹配第一个版本。
这一点在[[Sylar Backend Collection#`std enable_if` + `sizeof(T)` 实现重载选择（SFINAE）|字节序零开销选择]] 上体现，是教科书般的 SFINAE 特性使用。
现代 C++可以使用条件编译和 Concept 概念在编译时尽量让错误提前暴露，避免给每一种类型都写一个 `std::enable_if` 的模板，同时 `if constexpr` 保证了不损失性能
### C++17 `if constexpr` 替代方案
```cpp
// C++17 起
template <typename T>
void func(T t) {
    if constexpr (std::is_integral_v<T>) {
        std::cout << "Integral: " << t << std::endl;
    } else if constexpr (std::is_floating_point_v<T>) {
        std::cout << "Floating point: " << t << std::endl;
    } else {
        static_assert(false, "T must be arithmetic");                // 这样并不妥当
        static_assert(dependent_false_v<T>, "T must be arithmetic"); // 见下方说明
    }
}
```
`if constexpr` 的未采用分支在模板实例化时被丢弃，不会生成代码，但**仍会进行基本的语法检查**。因此直接写 `static_assert(false, ...)` 在 else 分支中**总会触发**（不依赖模板参数，不受 `if constexpr` 影响）。正确做法是定义一个依赖模板参数的假值：
```cpp
template <typename T> inline constexpr bool dependent_false_v = false;
// 然后在 static_assert 中使用 dependent_false_v<T>
```
### C++20 Concepts 替代方案
```cpp
template <std::integral T>
void func(T t) {
    std::cout << "Integral: " << t << std::endl;
}

template <std::floating_point T>
void func(T t) {
    std::cout << "Floating point: " << t << std::endl;
}
// 没有匹配 concept 的调用会导致清晰的错误信息，而不是 SFINAE 的深模板错误
```
Concepts 在 C++20 引入，比 SFINAE 更加清晰易读，错误信息更好。

# PImpl (Pointer to Implementation)
## 含义解释
PImpl 是一种 C++ 的**设计惯用法**（idiom），而非语言特性。它通过一个指针，将类的实现细节（私有成员）完全隐藏在一个独立的实现类中。

- **“防火墙”效应**：它能在类的接口和实现之间建立一道编译防火墙。
- **减少编译依赖**：当头文件改变时，可以最大限度地减少需要重新编译的客户端代码。
## 使用背景
某些经常需要改动的代码文件（如 qt 中由 ui 转换为 `.h` 的头文件），由于其中内容经常需要改变，就会出现：
- 如果仅仅改动 `ui.h` 组件位置，修改一些硬编码内容，则只会导致 `ui.cpp` 重新编译，不修改 h 文件不会导致一连串重新编译
- 如果这个文件（称为 `ui.h` 文件）被 include 在其他文件中（称为 `else.cpp` 文件中），那么每改动一次 `ui.h` 修改 ui，会导致**所有 `else.cpp` 和 `ui.h` 文件被重新编译**，编译时间大大延长
## 解决方案
有两种常见的解决方案，对应不同的应用场景
### 将类私有成员使用结构体指针封装
```cpp
// widget.h
#pragma once
#include <memory>

class Widget {
public:
    Widget();  // 构造函数需定义在.cpp（避免头文件依赖Impl）
    ~Widget(); // 析构函数同理
    void doSomething();

private:
    class Impl; // 前向声明实现类（不暴露细节）
    std::unique_ptr<Impl> pimpl; // PImpl指针（核心）
};

// widget.cpp
#include "widget.h"

class Widget::Impl { // 定义隐藏实现
public:
    int privateData; // 私有成员（头文件不可见）
    void internalLogic() { /*...*/ }
};

Widget::Widget() : pimpl(std::make_unique<Impl>()) {} // 初始化指针
Widget::~Widget() = default; // 析构函数定义在此

void Widget::doSomething() {
    pimpl->privateData = 42; // 通过指针访问实现
    pimpl->internalLogic();
}
```
这样在 cpp 文件中修改成员的私有成员，不会导致 h 文件中类的定义出现变化，不需要重新编译 h 文件。并且指针仍能够行使类的功能。

### qt 的 d-pointer 模式
#### 命名空间前向声明
1. **设计阶段**
    - 用Qt Designer拖拽控件生成`.ui`文件（XML描述布局）。
2. **编译阶段**
    - `uic`工具将`.ui`文件**自动生成** `ui_dialog.h`（含`Ui::Dialog`类定义）。
    - **关键点**：`ui_dialog.h` 中 `Ui::Dialog` 类包含**所有UI控件的指针成员**（如 `QPushButton* button;`）。
在 cpp 文件中使用
```cpp
namespace Ui  {
    class Dialog;
}

class Dialog : public QDialog  {
    Ui::Dialog *ui;  // 使用该类的一个指针
};
```
- ui 指针会指向 uic 工具生成的 h 文件，由于这个文件经常被修改，这里用一个 ui 指向整个文件，保证了这个文件被修改时不会重新编译 cpp 文件。
- 这样在 Ui 命名空间中**前向声明**Dialog 类，在不影响类的使用的同时，只声明 Dialog 的 ui 指针，将 ui 的实现全部封装，有强耦合性，当编译器处理 `#include "dialog.h"` 时，**完全不知道 `Ui::Dialog` 内部结构**，仅当编译 `dialog.cpp` 时才接触 `ui_dialog.h` 的具体实现
- 这也是为什么 qt 中创建某一个窗口类（mainwindow）创建组件**常用指针**（一些如 Qtimer 的组件不需要使用指针，因他们的生命周期不长）而不是对象作为成员参数的原因。
#### 编译期防火墙
C++的编译模式为“分离式编译”，即不同的源文件是分开编译的。也就是说，不同的源文件之间有一道天然的防火墙，一个源文件“失火”并不会影响到另一个源文件
头文件是不能直接编译的，它包含于源文件中，并作为源文件的一部分被一起编译。
```cpp
//c.hpp
class X; //用前导声明取代include
class C {
	...
	private:
	X* pImpl; //声明一个X*时，class X不用完全定义
};
```
- 在一个既定平台上，任何指针的大小都是相同的。之所以分为 `X`，`Y*` 这些各种各样的指针，主要是提供一个高层的抽象语义，即该指针到底指向的是那个类的对象，并且，也给编译器一个指示，从而能够正确的对用户进行的操作（如调用X的成员函数）决议并检查。但，如果从运行期的角度来说，**每种指针都只不过是个32位的长整型（如果在64位机器上则是64位，根据当前硬件而定）**。
- 当前代码的状态为：“class C的实现部分依赖于class X”，而不应该是“class C的**用户使用接口部分**依赖于class X”。C 类的实现部分被封装在 pImpl 中，接口部分编译器**只知道有一个 X 类型指针**
- 假设`c.hpp` 文件 include 了`x.hpp`，而 X 类的实现改动则仅仅会影响 hpp 文件编译，而**使用 C 类的源文件**（其他 include 了`c.hpp` 的文件）则不需要重新编译
- 是指针穿越了C++编译期防火墙，使用指针的源文件“知道”指针所指的是什么对象，但不必直接“看到”那个对象——它可能在另一个翻译单元，是指针穿越了编译期防火墙，连接到了那个对象。

> 只要是代表地址的符号都能够穿越C++编译期防火墙，而代表结构(constructs)的符号则不能。
> 例如**函数名**，它指的是函数代码的始地址，所以，函数能够声明在一个翻译单元，但定义在另一个翻译单元，**编译器会负责将它们连接起来**。用户只要得到函数的声明就可以使用它。
>
> 类则不同，类名代表的是一个语言结构，使用类，**必须知道类的定义（类中具体内容，就是头文件中只写出所有成员的类型（函数还要写参数的类型）），否则无法生成二进制代码（根据类的定义控制给类分配的空间大小）**。
>
> 变量的符号实质上也是地址，但使用变量一般需要变量的定义，而使用extern修饰符则可以将变量的定义置于另一个翻译单元中。

# CRTP（Curiously Recurring Template Pattern）
## 基本知识
### 概念解释
奇异递归模板
CRTP 是一种“**让父类知道子类是什么**”的技术，从而在编译期就能调用子类的函数，实现类似多态的效果，但**没有运行时虚函数调用的开销**。
### 具体使用方法
具体实现方法是：
1. 父类是一个模板类
2. 子类**必须继承父类**并实现父类需要的函数
3. 子类继承父类的方式是继承父类模板参数为子类的模板实例化类
```cpp
template <typename Derived>
class Base {
public:
    void interface() {
        static_cast<Derived*>(this)->implementation();  // 调用子类实现
    }
};
class Derived : public Base<Derived> /* 继承父类的子类作为模板参数的类 */ {
public:
    void implementation() {
        std::cout << "Derived implementation" << std::endl;
    }
};

// 调用
Derived d;
Base<Derived> b();
d.interface();  // 实际调用的是 Derived::implementation()
```
这样父类对象/子类对象**都能够调用子类的方法**
### 实现细节
- 为什么能够将父类指针使用 static_cast 转换为子类指针？
  转换合法性参考 [[C++ Runoob Tutoral#C++提供的类型转换方式#static_cast]]
- 这是否是多态的一种实现？
  父类是模板类，子类也必须继承父类的子类参数的实例化，所以 `Base<Derived1>` 和 `Base<Derived2>` 并不是同一个基类类型，本质上并不是传统的多态。真正有继承关系的是模板实例化后的类和子类，父类通过模板参数在**编译期就得知了子类的接口实现**
- 即使 implementation 函数在父类中实现（或是纯虚函数）而在子类中重载，由 `static_cast` 进行的指针转换还是会**不通过虚函数表**调用子类函数
## 实际意义
实现静态多态，没有传统继承的虚函数表查找一个函数到底是属于父类还是子类这类行为的开销

| 特性      | CRTP（静态多态） | 虚函数（动态多态）         |
| ------- | ---------- | ----------------- |
| 多态方式    | 编译期绑定      | 运行时绑定             |
| 性能      | 高（无虚函数表）   | 低（虚函数调用）          |
| 可扩展性    | 编译期决定      | 运行时决定             |
| 接口实现    | 子类必须显式实现   | 子类可选择性覆盖          |
| 可继承多个   | 不推荐        | 支持（需小心）           |
| 是否需要虚析构 | 不需要        | 必须（若 delete 基类指针） |
| 适用场景    | 性能敏感、接口固定  | 运行时多态、插件系统        |
## 注意事项
- 虽然 C++允许多继承，但多继承 CRTP 类**可能会**导致继承关系混乱，代码行为不可预测，如果多个 CRTP 子类中有多个同名函数会导致未定义行为
- 调试时短点跳转可能难以理解
- 子类必须实现父类中方法，否则编译报错
# ODR（One Definition Rule）
程序中每个实体（变量、函数、类、模板、类型别名，包括 typedef 和 using）在整个程序中必须只有一个定义。
## ODR 基本原则
### ODR-used 定义
一个实体被 ODR-used 通常意味着程序需要知道它的定义。例如，调用一个非内联函数、读取或写入一个变量的值（非 decltype 等情况）、需要知道一个类的完整定义来创建对象或访问成员等。
例如，调用一个非内联函数、读取或写入一个变量的值（非 decltype 等情况）、需要知道一个类的完整定义来创建对象或访问成员等。                                                                         
根据 C++标准，ODR-used 的正式定义包括:
- 变量被引用
- 函数被调用
- 类被实例化
- 其他需要知道其完整类型信息的情况（如对象构造、成员访问）
### 判断逻辑
1. 单个翻译单元中只能有**一次定义**，重复定义在编译阶段报错。
2. 多个翻译单元中可以有**多次定义**，但前提是：
   - 它们**内容必须完全相同**（逐字节一致）
   - 必须是 **允许重复定义的实体**：`inline` 函数/变量、模板、类类型等
3. 严格意义上说，ODR 保证**整个程序**中一个符号的定义只能有一个。
   - 非 `inline` 函数或变量在整个程序中只允许有且仅有一个定义。违反是未定义行为（常表现为链接报错）
   - `inline` 函数或变量（C++17）在 ODR-used 的每个 TU 中都需要一个定义，链接器合并
   - 类在每个需要完整类型的 TU 中必须有定义
### 违反 ODR 的场景
#### 在头文件中定义非内联函数或变量
头文件被多个源文件 include 且函数非 inline 时，出现**链接**报错（multiple definition）。变量的 inline 在 C++17 引入之前只能在 `.cpp` 中定义。
#### 类型、模板、内联函数/变量定义不一致
```cpp
// config.h
#ifdef USE_FLAG_X
struct AppConfig {
    int version = 2;
    bool flag= true;
};
#else
struct AppConfig {
    int version = 1;
};
#endif

// a.cpp (编译时定义了 USE_FLAG_X)
// b.cpp (编译时未定义 USE_FLAG_X)
// 名称相同的 AppConfig 符号在不同翻译单元中定义不同->内存布局不同->访问无效内存->UB
```
编译器&链接器都无法检测出问题。规避方法：
- 永远不要在头文件中使用条件编译改变类型定义
- 复杂类型避免跨模块传递
### 使用原则（规避违反的方法）
- 所有变量定义放在 `.cpp`，声明用 `extern` 放头文件。C++17 起可以用 `inline` 变量替代
- 普通函数定义放 `.cpp`，声明放头文件。需要内联的函数定义放头文件加 `inline`
- 模板定义全部放在头文件中。如果每个 TU 隐式实例化相同的模板，ODR 规则对模板有专门的豁免
- 类静态变量推荐用 `inline static`（C++17 起）
### ODR 的例外实体及其原因

以下实体允许在多个 TU 中重复定义（前提是所有定义相同）：

| 实体 | 允许重复的原因 |
|------|---------------|
| 类类型 | 每个 TU 都需要完整定义才能创建对象/计算大小/访问成员。不能每个 TU 单独定义一次——头文件天然被 include 到多个 TU |
| 函数模板 / 类模板 | 模板需要在头文件中定义才能被各 TU 使用。实例化发生在调用位置，各 TU 各自生成代码。标准专门为模板设立了 ODR 豁免 |
| `inline` 函数 | 设计目的就是允许在头文件中定义，替代宏。ODR 豁免允许跨 TU 重复 |
| `inline` 变量 (C++17) | 在头文件中定义全局/静态成员变量，解决 `extern` + `.cpp` 的繁琐模式 |
| 概念 (C++20) | 类似模板，需要在多个 TU 中可见。定义在头文件中 |

**巧合但不混为一谈：** 模板隐式实例化的结果和 `inline` 都允许重复定义，但机制不同。模板不是隐式 `inline`。


# 类型擦除
## std::any 中的实现

# Master-Slave 任务分配机制