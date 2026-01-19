# SFINAE (Substitution Failure Is Not An Error)
## 含义解释
意思是“替换失败并非错误”。
- 当编译器在重载决议过程中尝试将模板参数替换到函数模板时，如果这个替换导致了一个无效的代码（比如，一个不存在的类型成员、无效的表达式等），编译器不会立即报错，而是**简单地忽略这个候选模板**，继续尝试其他可用的重载版本。 
- **只有**当没有任何一个可行的重载版本时，编译器才会最终报错
- SFINAE 的主要用途是**在编译期根据类型特性来启用或禁用某些模板函数**。它是实现**编译期多态**和**静态反射**的强大工具。
## 代码体现
```cpp
#include <iostream>
#include <type_traits>

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
    // func("hello"); // 编译错误！没有匹配的版本，因为 const char* 既不是 integral 也不是 floating point
}
```
当调用 `func(42)` 时，编译器尝试第二个版本，`std::is_floating_point<int>` 结果返回为 ` false `，导致 ` std::enable_if<false, void>` 没有 ` type ` 成员，替换失败。于是它被忽略。然后编译器成功匹配第一个版本。

现代 C++可以使用条件编译和 Concept 概念在编译时尽量让错误提前暴露
```cpp
// c++14
template <typename T>
void func(T t) {
    if constexpr (std::is_integral_v<T>) {
        std::cout << "Integral: " << t << std::endl;
    } else if constexpr (std::is_floating_point_v<T>) {
        std::cout << "Floating point: " << t << std::endl;
    } else {
        static_assert(false, "T must be arithmetic"); // C++20 起可以这样用
    }
}

// c++17
template <std::integral T> // 概念约束
void func(T t) {
    std::cout << "Integral: " << t << std::endl;
}

template <std::floating_point T> // 概念约束
void func(T t) {
    std::cout << "Floating point: " << t << std::endl;
}
// 没有匹配 concept 的调用会导致清晰的错误信息
```

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
这样在 cpp 文件中修改成员的私有成员，不会导致 h 文件中类的定义出现变化，不需要重新编译 h 文件。并且指针仍然能够行使类的功能。

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
- 这也是为什么 qt 中创建某一个窗口类（mainwindow）创建组件**常用指针**（一些如 Qtimer 的组件不需要使用指针，因为他们的生命周期不长）而不是对象作为成员参数的原因。
#### 编译期防火墙
C++的编译模式为“分离式编译”，即不同的源文件是分开编译的。也就是说，不同的源文件之间有一道天然的防火墙，一个源文件“失火”并不会影响到另一个源文件
头文件是不能直接编译的，它包含于源文件中，并作为源文件的一部分被一起编译。
```cpp
//c.hpp
class X; //用前导声明取代include
class C {
	...
	private:
	X* pImpl; //声明一个X*的时候，class X不用完全定义
};
```
在一个既定平台上，任何指针的大小都是相同的。之所以分为 `X`，`Y*` 这些各种各样的指针，主要是提供一个高层的抽象语义，即该指针到底指向的是那个类的对象，并且，也给编译器一个指示，从而能够正确的对用户进行的操作（如调用X的成员函数）决议并检查。但是，如果从运行期的角度来说，**每种指针都只不过是个32位的长整型（如果在64位机器上则是64位，根据当前硬件而定）**。
当前代码的状态为：“class C的实现部分依赖于class X”，而不应该是“class C的**用户使用接口部分**依赖于class X”。C 类的实现部分被封装在 pImpl 中，接口部分编译器**只知道有一个 X 类型指针**
假设c.hpp 文件 include 了x.hpp，而 X 类的实现改动则仅仅会影响 hpp 文件编译，而**使用 C 类的源文件**（其他 include 了c.hpp 的文件）则不需要重新编译
是指针穿越了C++编译期防火墙？！使用指针的源文件“知道”指针所指的是什么对象，但是不必直接“看到”那个对象——它可能在另一个编译单元，是指针穿越了编译期防火墙，连接到了那个对象。

> 只要是代表地址的符号都能够穿越C++编译期防火墙，而代表结构(constructs)的符号则不能。
> 例如**函数名**，它指的是函数代码的始地址，所以，函数能够声明在一个编译单元，但定义在另一个编译单元，**编译器会负责将它们连接起来**。用户只要得到函数的声明就可以使用它。
> 
> 类则不同，类名代表的是一个语言结构，使用类，**必须知道类的定义（类中的具体内容，就是头文件中只写出所有成员的类型（函数还要写参数的类型）），否则无法生成二进制代码（根据类的定义控制给类分配的空间大小）**。
> 
> 变量的符号实质上也是地址，但是使用变量一般需要变量的定义，而使用extern修饰符则可以将变量的定义置于另一个编译单元中。

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
- 虽然 C++允许多继承，但是多继承 CRTP 类**可能会**导致继承关系混乱，代码行为不可预测，如果多个 CRTP 子类中有多个同名函数会导致未定义行为
- 调试时短点跳转可能难以理解
- 子类必须实现父类中的方法，否则编译报错