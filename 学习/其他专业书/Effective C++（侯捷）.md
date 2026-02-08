### extern，constexpr 和 explict 关键字
#### 基本认识
- `extern` 关键字用于声明一个变量或函数，但不定义它。它常用于跨文件的变量或函数声明，允许在多个文件中共享同一个变量或函数定义。`extern` 的出现是为了解决全局变量和函数在**多个文件中共享**问题。
- `constexpr` 关键字用于声明编译时常量或表达式，它必须在编译时就能计算出结果。`constexpr` 的出现是为了提高性能，允许编译器在编译时进行优化
- `explicit` 关键字用于防止构造函数或转换操作符的隐式转换。它的出现是为了避免意外的类型转换，增强代码的安全性和可读性
#### 细节问题
##### extern
一般在 `.h` 文件中使用 extern 声明但不定义，在 `.cpp` 文件中赋值定义，在其他文件中需要**引用使用**到这个变量时，include `.h` 文件后，即可访问到相同变量名称的相同变量
##### constexpr
更多细节可以参考 [[Modern C++#constexpr]]
`constexpr` 函数的本质是允许在编译时执行函数，并将其结果作为编译时常量。如果在函数定义中不使用 `constexpr`，则该函数无法在编译时被调用，也就无法用于初始化编译时常量（如 `constexpr int value = factorial(5);`）。
- 函数的参数和返回值必须是编译时常量表达式。
- 函数体必须满足一定的限制（例如，不能有动态内存分配、异常处理等）。
```cpp
constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

constexpr int value = factorial(5);  // 编译时计算5的阶乘

int main() {
    int arr[value];  // 使用编译时常量作为数组大小
    return 0;
}
```
编译时，编译器会递归展开 `factorial(5)`，并将其结果直接替换为 `120`，而不是在运行时计算。
##### explict
`explicit` 可以用于构造函数，但不能用于析构函数。
构造函数出现的目的就是初始化各种值，各种变量定义，explict 强制限定其中变量赋值不能出现隐式的类型转换

### 拷贝构造函数
拷贝构造函数作用可以参考 [[C++ Runoob Tutoral#拷贝构造函数]]，没有它是**无法完成参数值传递**和 `type a = b` 这样的操作的
- 没有显式定义 `Widget` 的拷贝构造函数，C++ 编译也会为你生成一个**默认的拷贝构造函数**
- 如果成员变量是内置类型（如 `int`、`double` 等），则直接复制其值。
- 如果成员变量是自定义类型，则会调用该类型的拷贝构造函数。
- 标准库中模板容器（如 `std::vector`、`std::string`、`std::map` 等）都实现了**拷贝构造函数**。
- 它们的拷贝构造函数会递归地复制容器中所有元素。
---
- 类的成员变量包含动态分配的资源（如指针），默认拷贝构造函数只会复制指针（浅拷贝），可能导致资源管理问题，默认拷贝构造函数会逐一复制类的每个成员变量。
- 如果类包含不可复制的成员（如 `std::unique_ptr`），默认拷贝构造函数会被删除（`deleted`），代码将无法编译。
```cpp
class Widget {
public:
    int* data;
    Widget() : data(new int(42)) {}
    ~Widget() { delete data; }
    // 默认拷贝构造函数会将 data 指针复制，导致双重释放问题
};

int main() {
    Widget w1;
    Widget w2 = w1; // 浅拷贝，w1 和 w2 共享同一块内存
    return 0;       // 程序崩溃：双重释放
}

```
# 1. 让自己习惯 C++
## 条款 1：视 C+＋为一个语言联邦
为了理解 C++, 你必须认识其主要的次语言
- C：完成 C++ 中 C 功能时，必须遵守 C 的局限没有模板 (templates) ，没有异常 (exceptions) ，没有重载 (overloading)
- Object-Oriented C+＋：使用 C++时，遵循面向对象程序设计的古典规则
- Template C+＋
- STL，standard template library 同 STL 一起工作，你必须遵守它的规约。
---
**关于记号表**
**记号表（Symbol Table）** 是**编译器**在编译过程中使用的一种数据结构，用于存储程序中所有符号（如变量、函数、类、常量等）的信息。它的作用是：

- **记录符号的属性和作用域**：例如符号的类型、名称、作用域、存储类别（如 `static`、`extern` 等）。
- **支持符号的查找和绑定**：在编译阶段，编译器通过记号表解析符号引用，确保变量和函数定义的一致性。
- **支持代码优化**：记号表还可以用于存储符号的静态信息，帮助编译器进行优化。
- 记号表出现的目的是方便编译器更好的管理变量，支持作用域规则：C++中作用域规则（如局部变量、全局变量、类成员变量等需要符号表来维护符号的可见性。
## 条款 2：尽置以 const, enum, inline 替换＃define
### const 声明
- 无法利用＃define 创建一个 Class 专属常量，因 `#defines` 并不重视作用域 (scope)。一旦宏被定义，它就在其后的编译过程中有效（除非在某处被＃undef)
- 这意味＃defines 不仅不能够用来定义 class 专属常量，也不能够提供任何封装性，也就是说没有所谓 private `#define` 这样的东西。而当然 `const` 成员变量是可以被封装的，
```cpp
const char* const authorName = "Scott Meyers";
```
- **第一个 `const`**：表示指针指向的内容是常量，即 `"Scott Meyers"` 这个字符串不能被修改。
    - 如果没有这个 `const`，你可以通过指针修改字符串内容，例如 `authorName[0] = 'A';`，这是不允许的。
- **第二个 `const`**：表示指针本身是常量，即指针 `authorName` 不能指向其他地址。
    - 如果没有这个 `const`，你可以将指针指向其他地址，例如 `authorName = "Other Author";`，这也是不允许的。
### static const 类专属常量
在 C++ 中，通常要求对所有符号（如变量、函数）提供**定义式**，但对于 `static const` 整型常量，有以下特殊情况：
- 如果**不取其地址**，可以直接在类中声明并使用常量，无需提供定义式。
- 如果**取其地址**，或编译器要求定义式，则必须提供定义式。
对于 `static const` 类专属常量：
- **大多数情况下，可以在头部文件中声明并初始化**，例如：
```cpp
class MyClass {    static const int MyStaticConstVar = 10; // 声明并在类中定义};
```
这样，可以在编译期间替换这个常量。
- 但，对于以下情况，必须给出定义： （1）需要取该变量的地址（因引用它时需要在内存中存在实际的位置）。 （2）编译器要求生成定义式。
如果发生在这些情况下，需要在实现文件中提供一个常量定义：
```cpp
const int MyClass::MyStaticConstVar; // 定义（在实现文件中）
```
---
### enum hack
有些编译器不支持 C 风格数组大小由非 const 变量定义，报错：

> 不允许 “static 整数型 class 常量”完成 “in class 初值设定“

可改用所谓的"the enum Hack" 补偿做法。其理论基础是：“一个属于枚举类型 (enumerated Type) 的数值可权充 ints 被使用”
```cpp
enum { NumTurns = 5 } ; //"the enum hack” —令 NumTurns 成为 5 的一个记号名称
int scores[NumTurns];   ;// 这就没问题了．
```
如果你不想让别人获得一个 pointer 或 referenc () 指向你的某个整数常量， enum 可以帮助你实现这个约束。
复杂的宏定义（尤其是括号繁多的函数宏定义尽量少用）

## 条款 3：尽量使用 const
### const 用处
const 可以用在：
- classes 外部修饰 global 或 namespace（见[[#条款 2：尽置以 const, enum, inline 替换＃define|条款2]])
- 作用域中常量，或修饰文件、函数、或区块作用域 (block，Scope) 中被声明为 static 的对象
- 修饰 classes 内部的 static 和 non-static 成员变量
- 面对指针，可以指出指针自身、指针所指物，或两者都（或都不）是 const:
---
 const 出现在星号左边，表示被指物是常量；
 如果出现在星号右边，表示指针自身是常最；
 如果出现在星号两边，表示被指物和指针两者都是常量。
 可以参考 [[#const 声明|const 声明]]，和 constexpr，consteval 的对比参考 [[Modern C++#constexpr]] 和 [[Modern C++#补充：consteval 关键字]]
 const 修饰不同内容，放置位置的区别可以参考 [[C++ Basics#const 常量]]

### STL 中 const
迭代器的作用就像个 T* 指针。迭代器为 const 就像声明指针为 const 一样（即声明一个 T* const 指针），表示这个**迭代器在定义后不能指向不同的东西**，但它所指的**东西的值**是可以改动的。
```cpp
vector<int> vec;
const vector<int>::iterator iter = vec.begin();  // iter被限制只能指向vec这个vector对象的第一个元素，指向不能改
*iter = 10;
++iter; // ++iter表示指向第二个元素
//////////////
vector<int>::const_iterator cIter = vec.begin(); // 指向内容的值不能改变，但可以更改指向
*cIter = 10;
++cIter;
```
 constexpr 修饰函数/变量
- 可能在编译期求值，也可能在运行时求值
- 编译期：当用在常量表达式上下文中
- 运行时：当用在非常量表达式上下文中
```cpp
constexpr int square(int x) {
    return x * x;
}

int main() {
    // 这些会在编译期计算
    constexpr int a = square(5);     // ✅ 编译期
    int arr[square(4)];              // ✅ 编译期作为数组大小
 	// 这个会在运行时计算
    int runtime_value = 10;
    int result = square (runtime_value);  // ✅ 运行时（因参数不是常量表达式）
}
```
### 什么时候使用 const
#### const 设计理念
1. **`const` 关键字的设计目标**
    `const` 关键字的设计目标是声明一个对象为常量，限制其状态不可修改。然而，这种限制是有限制的。`const` 关键字只能保证对象本身的内存地址不变，但无法保证对象内部指针或引用指向的内存区域不变。
2. **`const` 成员的约束**
    `const` 成员函数不能修改对象的非 `mutable` 成员变量。但，如果成员变量是指针或引用，可以通过指针或引用修改指向的内存区域。因此，`const` 成员函数并不能完全保证对象的状态不变。

需要注意的是，C++中函数返回值使用的是“pass-by-value”而不是 reference，随意返回值也会占用空间和资源
有两种使用 const 的理念：
#### Bitwise const
1. Bitwise canst 阵营的人相信，成员函数只有在不更改对象之任何成员变量 (static 除外）时才可以说是 const。`bitwise const` 只**保证对象本身的内存地址不变**，但不保证指针或引用指向的内存区域不变。即，编译器确保对象的每个二进制位都不被修改。
	- **严格不变性**：对象的内存内容在声明为 `const` 后不能被更改。
	- **编译器强制检查**：编译器会阻止对 `const` 对象进行任何修改操作。
局限性和缺点是，尽管使用 const 修饰的变量，仍有可能被改变
```cpp
class BitwiseConstExample {
public:
    int* ptr;
    BitwiseConstExample() : ptr(new int(10)) {}
    void modify() const {
        // ptr = new int(20); // 编译器报错，因 ptr 本身是 const
        *ptr = 20; // 合法，因 ptr 指向的内存区域可以修改
    }
};

int main() {
    const BitwiseConstExample bce;
    bce.modify();
    std::cout << *bce.ptr << std::endl; // 输出 20
    return 0;
}
```
---
```cpp
class CTextBlock {
public:
    char& operator[](std::size_t position) const {
        return pText[position];
    }

private:
    char* pText;
};

const CTextBlock cctb("Hello");
char* pc = &cctb[0]; // 调用 const operator[] 获取指针
*pc = 'J'; // 修改 cctb 的值
```
- 返回的是 `char&` ，会导致返回值可以被修改（即使 `CTextBlock` 是 const 对象，且 `operator[]` 的函数体内容也没有改变对象状态，但对象内部仍可以被**对象外部操作**改变）。这符合 bitwise const 测试，但无法达到效果
- 究其原因是使用 bitwise const 无法控制内部指针或者引用变量成员在**外部通过其他方法改**变对象内部状态，而编译器无法检测到
- 解决方法是对**每一个 const 对象的成员**都使用 const 修饰返回值和函数体（但如果成员是指针或者引用，仍无法避免指针在外部操作**没有改变指针的指向，但改变了指针的值**），让其无法通过函数体和返回值引用更改对象内部状态或者使用 logical const
#### logical const
#未完成
最后一部分有点难理解，暂时搁置

## 条款 04：确定对象被使用前已先被初始化
### 构造函数和初始化列表
#### 成员初始化的时间
“将对象初始化”这事，C++ 似乎反复无常。某些语境下 x 保证被初始化（为 0) ，有时不保证，**需要区分**C part of C++ 是指 C++ 中继承自 C 语言的部分，non-C parts of C++ 是指 C++ 独有的特性
- C part of C++ 更注重性能和灵活性，因此**不强制**初始化，（初始化会带来 runtime 开销）
- non-C parts of C++ 更注重安全性和易用性，因此强制初始化。
C ++规定，对象的成员变量的初始化动作发生在**进入构造函数本体之前**。
####  成员初始化的方法
```cpp
class PhoneNumber {};
    class ABEntry {//ABEntry = "Address Book Entry"
    public:
        ABEntry(const std::string& name, const std::string& address,
            const std::list<PhoneNumber>& phones);
    private:
        std::string theName;
        std::string theAddress;
        std::list<PhoneNumber> thePhones;
        int numTimesConsulted;
};
ABEntry::ABEntry(const std::string& name, const std::string& address,
    const std::list<PhoneNumber>& phones) {
    theName = name;//这些都是赋值（assignments）
    theAddress = address;//而非初始化（initializations）
    thePhones = phones;
    numTimesConsulted = 0;
}
```
上面代码中**赋值（不是初始化）** 发生在构造函数中，而不在构造函数之前，所以这是赋值不是初始化，原因是：
- 如果讲这些值放入构造函数函数体中，那么编译器由于未发现成员函数有初始值，会先调用 default 构造函数（如果[[Modern C++#同时使用默认构造和用户定义构造器|默认构造函数没有被禁用]] 的话）为 theName，theAddress 和 thePhones 设初值，然后立刻再对它们赋予**相同**新值。
- 赋予新值会使用一次[[C++ Runoob Tutoral#类构造函数#拷贝构造函数|拷贝构造函数]]，copy 值传递过去，这哪个 default 构造函数的一切作为**被浪费了**
```cpp
ABEntry::ABEntry(const std::string& name, const std::string& address,
    const std::list<PhoneNumber>& phones)
    :theName(name),
    theAddress(address),//现在，这些都是初始化（initializations）
    thePhones(phones),
    numTimesConsulted(0){}    //现在，构造函数本体不必有任何动作
```
使用初始化列表（member initialization list）只进行一次 copy 构造函数，更高效

---
不过例外的是：

> 当类有多个成员变量和/或基类时，多个构造函数可能导致成员初值列（初始化列表）有重复的初始化操作，这样会导致无意义的工作

针对那些“**赋值表现像初始化一样好**”的成员变量，可以将其初始化操作从成员初值列中省略，改用赋值操作，并将这些赋值操作封装到一个函数（通常是 private）中，由所有构造函数调用。
这种方法特别适用于成员变量的初始化数据来自文件或数据库的场景，这种情况下如果还将所有变量都放在初始化列表中可能会导致性能严重降低（数据库通信和文件读写较为耗时）

#### 成员初始化次序
C+＋有着十分固定的“成员初始化次序”。初始化次序总是相同：
为避免你或你的检阅者迷惑，并避免某些可能存在的**晦涩错误**^[1]，当你在成员初值列中条列各个成员时，最好总是以其声明次序为次序。

---
[1]: 晦涩错误，指的是两个成员变量的初始化带有次序性。例如初始化 array 时需要指定大小，因此代表大小的那个成员变量必须先有初值，但如果初始化次序导致他没有初值**也是合法的**
### 不同编译单元内定义之 non-local static 对象的初始化次序。
- static 对象：参考 [[C++ Runoob Tutoral#类的静态成员|static对象]]，不是 stact 和 heap-based 对象包括 global 对象、定义 namespace 作用域内、在 classes 内、在函数内、以及在 file 作用域内被声明为 static 的对象。
- no-local-static 对象：函数**内**的 static 对象称为 local static 对象（因它们对函数而言是 local) ，其他 static 对象称为 non-localStatic 对象。
- 编译单元（translation unit）：是指产出单一目标文件 (single object file) 的那些源码。基本上它是单一源码文件加上其所含入的头文件

> 如果某编译单元内的某个 non-local static 对象的初始化动作使用了另一编译单元内的某个 non-localstatic 对象，它所用到的这个对象可能尚未被初始化

不同于初始化列表中**初始化次序完全按照代码顺序**， C++ 对“定义于不同的编译单元内的 non-local static 对象”的初始化相对次序并无明确定义，所以***决定它们的初始化次序相
当困难，非常困难，根本无解。***
```cpp
class Directory { ／／由程序库客户建立
public:
	Directory (params);
	/* code */
};
Directory :: Directory (params) {
	std::size t disks= tfs.numDjsk:3();
}		//使用 tfs 对象
```
但可以通过将每个 non-local static 对象搬到自己的专属函数内（该对象在此函数内被声明为 static)，然后调用函数即可
```cpp
class Base {
public:
    Base(int value) : m_value(value) {}
    int m_value;
};

class Derived : public Base {
public:
    Derived(int value) : Base(value), m_doubleValue(2 * m_value) {}

    int m_doubleValue;
};

int main() {
    Derived d(10);
    std::cout << d.m_doubleValue << std::endl; // 输出 20
    return 0;
}

```
在 C++ 中，成员的初始化顺序是固定的，但如果不了解规则，可能会导致一些隐晦的错误。具体来说：
- **成员变量的初始化顺序**：成员变量按照它们在类中声明的顺序初始化，而不按照初始化列表中顺序。
- **基类和派生类的初始化顺序**：基类总是先于派生类初始化。`Derived` 的初始化列表先调用 `Base` 的构造函数，然后初始化 `m_doubleValue`。由于 `m_value` 已经初始化，`m_doubleValue` 的计算结果是正确的。
---
### 内置型 non-member 对象
内置型 non-member 对象是指在 C++ 标准模板库（STL）中，某些通用函数或操作符并非作为类的成员函数实现，而是以独立函数的形式存在。这些函数通常在特定的命名空间（如 `std`）中定义，能够操作不同类型的对象，而不限于特定类。

非成员函数（non-member functions）有以下特点：

1. **独立性**：它们不依附于任何特定类，可以独立使用。
2. **泛型性**：通常使用模板编写，可以适用于多种数据类型。
3. **操作符重载**：许多非成员函数是操作符的重载形式（如 `operator+`），使得不同类型的对象可以进行运算。
4. **命名空间**：大多数内置的 non-member 函数位于 `std` 命名空间中，使用时需要通过 `using` 指定令或完全限定名称来访问。

例如，`std::swap` 是一个非成员函数模板，可以交换两个对象的值，不管它们的类型是什么。类似地，输入输出流操作符（如 `operator<<` 和 `operator>>`）也是 non-member 函数，允许不同类型的数据与流对象进行交互。

### 总而言之
> - [[Effective C++（侯捷）#内置型 non-member 对象|内置型（non-number）对象]] 进行手工初始化，因 C++不保证初始化它们。
> - 构造函数最好使用成员初值列 (member initialization list) ，而不要在构造函数本体内使用赋值操作 (assignment) 。初值列列出的成员变量，其排列次序应该和它们在 class 中声明次序相同。
> - 为免除“跨编译单元之初始化次序”问题，请以 local static 对象替换 non-localstatic 对象。

# 2.  构造／析构／赋值运算
## 条款 05：了解 C+＋默默编写并调用哪些函数
### 默认构造行为和调用方法
什么时候 empty class （空类）不再是个 empty class 呢？**当 C+＋处理过它后**。如果你自己没声明，编译器就会为它声明**编译器版本的**
- 一个 copy 构造函数
- 一个 copy assignment 操作符
- 一个析构函数
- 一个 default 构造函数（如果没有声明任何构造函数）
如果你写下：
```cpp
class Ernpty { };
```
这就好像你写下这样的代码：
```cpp
class Empty {
public:
	Empty() {... }						//default 构造函数
	Empty(const Empty& rhs) {... }		//copy 构造函数
	~Empty () {... }					//析构函数是否该是virtual 见稍后说明

	Empty& operator=(const Empty& rhs) {... }  //copy assignment 操作符
} ;
```
惟有当这些函数被需要（被调用），它们才会被编译器创建出来。下面代码造成上述每一个函数被编译器产出：
```cpp
Empty el;		//default构造函数
				//析构函数
Empty e2(el);	//copy构造函数
e2 = el;		//copyassignment操作符
```
编译器产出的析构函数是个 non-virtual 除非这个 class 的 base class 自身声明有 virtual 析构函数（这种情况下这个函数的虚属性； virtualness; 主要来自 base class)
copy 构造函数和 copy assignment 操作符，编译器创建的版本只是单纯地将来源对象的每一个 non-static 成员变量拷贝到目标对象。
### 默认构造带来的陷阱
下面两段代码
```cpp
// code 1
template<typename T>
class Namedobject{
public:
	Namedobject(const char* name, const T& value);
	Namedobject(const std::string& name，const T& value);
private:
	std::string nameValue;
	T objectValue;
};

// code 2
template<class T>
class Namedobject {
public:
//以下构造函数如今不再接受一个const名称，因nameValue 如今是个reference-to-non-const string。
Namedobject(std::string& name, const T& value); //如前，假设并未声明operator=
private:
	std::string&nameValue;		//这如今是个reference
	const T objectValue;		//这如今是个const
};
```
如果使用
```cpp
std: :string newDog("Persephone");
std: :string oldDog("Satch");
NamedObject<int> p(newDog, 2);
NamedObject<int> s(oldDog, 36);
p = s;								// mark
```
code 1 代码一切正常，因 nameValue 是 p 和 s 各自的成员变量互不影响
如果使用 code 2 会导致 mark 位置编译出错，原因是：
- 在类中有**引用成员**时，**默认的拷贝赋值操作是被删除的**（deleted）
- 两个对象的 nameValue 是字符串引用对象，mark 之前的代码两个 nameValue 分别指向 newDog 和 oldDog 两个字符串变量
- 使用编译器**默认生成的拷贝构造操作符（不是拷贝构造函数）**实现两个对象的**拷贝赋值会单纯地将来源对象的每一个 non-static 成员变量拷贝到目标对象。**，`p.nameValue = &newDog` 拷贝值到 `s.nameValue = &oldDog`，但 C+＋并不允许“让 reference 改指向不同对象，这样就会导致编译器在类中寻找**自定义 copy assignment 操作符**，即 `NameObject& operator=(const NameObject& rhs) {}`，如果未定义，就会终止赋值操作代码。

## 条款 06：若不想使用编译器自动生成的函数，就该明确拒绝
通常如果你不希望 class 支待某一特定机能，只要不声明对应函数就是了。但这个策略对 copy 构造函数和 copy assignment 操作符却不起作用，因[[Effective C++（侯捷）#条款 05：了解 C+＋默默编写并调用哪些函数|条款5]]  已经指出，如果你不声明它们，而**某些人尝试调用它们，编译器会为你声明它们**
所有编译器产出的函数都是 public 。为阻止这些函数被创建出来，你得自行声明它们可以阻止他们生成，***将 copy assignment 和 copy constructor 放在 private 中，就可以组织编译器自动创建 public 版本***，又由于这些函数是 private 的无法从外部调用，所以最终 class 就相当于仅用了这些放在 private 中内容

>  但 member 函数和 friend 函数还是可以调用你的 private 函数。除非你够聪明，不去定义它们，那么如果某些入不慎调用任何一个，会获得一个连接错误 (linkage error)

所以为了安全，**将成员函数声明为 private 而且故意不实现它们**为大家接受
```cpp
class Uncopyable
protected://允许derived对象构造和析构
	Uncopyable() {}
	~Uncopyable() {}
private:
	Uncopyable(const Uncopyable&);			//但阻止copying
 	Uncopyable& operator=(const Uncopyable&);
};
// 为求阻止HomeForSale对象被拷贝，我们唯一需要做的就是继承Uncopyable：
class HomeForSale: private Uncopyable {		//class不再声明
	//copy构造函数或，copyassign.操作符
};
```
- **私有拷贝构造函数和运算符重载函数**都定义但未实现，又被放在了 private 中导致外部无法调用，所以尝试使用这些函数，编译器会报错（因找不到定义），甚至**在编译期就能阻止**一些非法的拷贝行为；
- 将构造和析构放在 protect 中，所以 Uncopyable 类**无法被实例化**无法调用 public 构造函数
- 任何从 `Uncopyable` 继承，仅仅是为了获得其私有（未定义）的拷贝函数的屏蔽效果；将 `Uncopyable` 的构造函数和析构函数设为 `protected`，是为了**只允许派生类访问和调用它们**，同时**不让外界单独创建 Uncopyable 对象**。
- `private` 继承只影响 **基类成员在子类中可见性（访问权限）**，不会阻止子类访问自己拥有权限访问的成员（例如 `protected`
- 如果将 protect 中构造和析构函数移动到 private 中，那么子类在继承 `Uncopyable` 时也会将两个函数**继承为 private**，子类同样无法从外部调用它们，无法实例化

| 继承方式        | 成员权限变化                                           |
| ----------- | ------------------------------------------------ |
| `public`    | 持有基类成员的原有访问权限（public、protected）                  |
| `protected` | **基类 public 被降级为 protected，private 仍不可见**        |
| `private`   | 基类 public 和 protected 都变为 private，private 成员仍不可见 |

C++11 后能够写为：
```cpp
class HomeForSale {
public:
    HomeForSale(const HomeForSale&) = delete;
    HomeForSale& operator=(const HomeForSale&) = delete;

    // 其他接口和函数...
};
```
## 条款 07：为多态基类声明 virtual 析构函数
### 问题出线和解决方法

> 当 derived class 对象经由一个 baseclass 指针被删除，而该 base class 带着一个 non-virtual 析构函数，其结果**未有定义**

明白一点说就是：derived class 派生类继承 base 类，如果 base 类中没有将析构函数设置为 virtual，那么在通过子类构造函数创建父类对象的指针后想要删除指针，调用 delete 命令后就会出现派生类对象无法释放内存而导致内存泄漏问题
场景复现：
```cpp
class Base {
public:
    ~Base() { cout << "Base dtor" << endl; }
};

class Derived : public Base {
public:
    ~Derived() {
        cout << "Derived dtor" << endl;
        delete[] dynamicData; // 假设分配了1024字节内存
    }
private:
    char* dynamicData = new char[1024];
};

Base* pb = new Derived();
delete pb; // 仅执行到 ~Base()
```
- 内存泄漏：`dynamicData` 分配的 1024 字节永远不会被释放
- 资源管理：若 `dynamicData` 指向文件句柄/锁等资源更危险
- 未定义行为：部分编译器可能引发段错误（如涉及虚继承布局）
为防止**局部析构**和**资源泄漏**问题，通常在设计 base 类时，要将析构函数设置为 virtual，这样使用 delete 后，编译器会自动调用父类析构函数
### 虚函数实现原理
#### “虚对象”结构
**虚函数表**：欲实现出 virtual 函数，对象必须携带某些信息用来在运行期决定哪一个 virtual 函数该被调用。这份信息通常是由一个所谓 vptr (virtual table pointer) 指针指出。 vptr 指向一个由函数指针构成的数组，称为 vtbl (virtual table) ；
**虚函数指针**：每一个带有 virtual 函数的 class 都有一个相应的 vtb| 。当对象调用某一 virtual 函数，实际被调用的函数取决千该对象的 vptr 所指的那个 vtbl 一编译器在其中寻找适当的函数指针。
**虚函数对类对象大小影响**：如果 class 内含 virtual 函数，其对象的体积会增加：在 32-bit 计算机体系结构中将占用 64 bits （为了存放两个 ints) 至 96 bits （两个 ints 加上 vptr) ； 64-bit 中可能占用 64-128 its, 因指针在这样的计算机结构中占 64 bits 。
**虚析构函数会改变二进制布局**：

| 类型          | 成员布局                    | 32 位系统体积 | 64 位系统体积 | 跨语言传递风险 |
|---------------|-----------------------------|-------------|-------------|----------------|
| Point         | [x][y]                      | 8 字节       | 8 字节       | 可无缝传输     |
| PointWithVptr | [vptr][x][y]                | 12 字节      | **16 字节**  | ❌ 用途受阻     |

**Scott Meyers 的约束公式**
```cpp
if (存在任何virtual函数) {
    宣告virtual析构函数; // 总体积增大代价可接受
} else if(存在多态行为) {
    if(有跨语言或内存序列化需求) {
        拒绝+警告(使用虚析构会破坏结构);
    } else {
        权衡体积增长与析构安全性;
    }
}
```
#### STL 中 non-virtual 设计
- `std::string`**故意不设计虚函数**以维持二进制兼容性
- 所有 STL 容器（`vector` / `list` / `map`）都遵循这一设计原则
- 它们的内存布局必须与 C 兼容（如 `strlen()` 可直接操作 `std::string::c_str()`）
特洛伊木马式内存泄漏
```cpp
class SpecialString : public std::string {
public:
    SpecialString(const char* s) : std::string(s), m_cryptoKey(0xABCD1234U) {
        m_data = new char[8192]; // 假设存储加密数据
    }
    ~SpecialString() {
        delete[] m_data; // 清理关键资源
        decrypt(m_cryptoKey); // 释放加密资源
    }
private:
    char* m_data;
    uint32_t m_cryptoKey;
};

SpecialString* pss = new SpecialString("Secret Message");
std::string* ps = pss; // 合法（派生类→基类隐式转换）
delete ps; // 灾难性操作

```
C++标准文档中说明：

> **"If a class has a base class with a virtual destructor, its destructor is virtual."** 并在备注中强调："The destructor of a standard library class is not virtual unless documented otherwise."

标准容器中析构函数都是 non-virtual 的，不要继承（**"Never inherit from standard containers."**）“给 base classes 一个 virtual 析构函数”，这个规则只适用千 polymorphic （带多态性质的） base classes 身上。这种 base classes 的设计目的是为了用来“通过 base class 接口处理 derived class 对象”。
所以不是被用于作为多态用途的类，就不应该被继承，并设置 virtual 函数

#### 需要记住
- polymorphic （带多态性质的）base classes 应该声明一个 virtual 析构函数。如果 class 带有任何 virtual 函数，它就应该拥有一个 virtual 析构函数。
- 析构函数的运作方式是，最深层派生 (most derived) 的那个 class 其析构函数最先被调用，然后是其每一个 base class 的析构函数被调用。
- Classes 的设计目的如果不是作为 baseclasses 使用，或不是为了具备多态性 (polymorphically) ，就不该声明 virtual 析构函数。

## 条款 08：别让异常逃离析构函数
#### 问题背景
C+＋并不禁止析构函数吐出异常，但它不鼓励你这样做。
如果析构函数中操作可能会引起异常，通常有两种方法解决：
- 中断程序->异常不会传播出这个类（代码块）
- 吞下异常->程序继续运行，但压下错误信息会导致难以 debug
但这些都无法法对“导致 close 抛出异常”的情况做出反应。
解决方法是，自己设计一个接口，将可能会出现异常的操作封装在这个接口中，并在析构函数中调用这个接口。
看似这种做法将出错责任转移到了**函数调用者**的身上，但析构函数吐出异常只会引来“过早结束程序”或“发生不明确行为＂的风险。将错误封锁在函数中，总比脱离类作用范围要好。

#### 需要记住
- 析构函数绝对不要吐出异常。如果一个被析构函数调用的函数可能抛出异常，析构函数应该**捕捉任何异常，然后吞下它们**（不传播）或结束程序。
- ·如果客户需要对某个操作函数运行期间抛出的异常做出反应，那么 class 应该提供一个普通函数（而非在析构函数中）执行该操作。
## 条款 09：绝不在构造和析构过程中调用 virtual 函数
### 问题背景
当**派生类对象对象处于构造或析构过程中**时，C++会将其视为“尚未完成的**基类**对象”，此时虚函数机制会强制绑定到当前构造层级的基类实现上，而非派生类的实现——这种行为违反程序员的直觉预期，极易引发未定义行为。
在 derived class 对象的 base class 构造期间，对象的类型是 base class 而不是 derived class 。不只 virtual 函数会被编译器解析至 (resolve to) base class,若使用运行期类型信息 (runtime type information，也会把对象视为 base class 类型。

1️⃣ **子类对象构造时**：
- 程序先执行基类构造函数 → 此时**派生类成员尚未初始化**，使用他们是不安全的。因尽管这个时候代码的最终目的是构建一个子类对象，但在子类构造函数尚未结束时，他还是一个基类对象。
- 虚表指针（vptr）**仅指向基类虚表**（派生类虚表尚未建立）
- _结果：调用子类的虚函数 `virtual func()` 实际执行父类的虚函数 `Base::func()` _

2️⃣ **析构时**：
- 程序先执行派生类析构函数 → **销毁派生类成员后**，对象内的 derived class 成员变量便呈现未定义值，所以 C++ 视它们仿佛不再存在
- 虚表指针**回退指向基类虚表**（派生类虚表已失效）
- _结果：调用子类的虚函数  `virtual func()` 实际执行父类的虚函数 `Base::func()` _

由于设计上的原因导致这样的行为**和直觉相反**，容易出现错误。
侦测“构造函数或析构函数运行期间是否调用 virtual 函数”并不总是这般轻松。如果 Transaction 有多个构造函数，每个都需执行某些相同工作。则常规做法是这些工作（可能包含虚函数调用）放入一个普通成员函数中。并在构造，析构时调用它。这样提高代码复用的做法又会出现问题：
```cpp
class Transaction{
public:
    Transaction() { init(); }        // ← 问题的根源
    virtual void logTransaction() const; // ← 非纯虚
    virtual void logTransaction() const = 0; // ← 纯虚函数
private:
    void init() { logTransaction(); } // ← 静默崩溃
};
```
如果基类构造中调用的函数时纯虚函数，那么程序会直接终止运行或者编译阶段 fatal error。但如果是非纯虚函数 (impure virtual)，那么由于他给出了实现，程序会继续运行。也就是会出现构造子类对象，子类对象中调用 override 的子类虚函数时，会调用本不应该调用的父类虚函数实现。

```cpp
class Transaction {
public:
    Transaction() {
        init();
    }
private:
    void init() {
        logTransaction(); // 调用虚函数
    }
protected:
    virtual void logTransaction() const {  // 给出实现，非纯虚函数
        std::cout << "WARNING: Default transaction log!\n";
    }
};

class BuyTransaction : public Transaction {
public:
	BuyTransaction() : amount(1234) { /* 成员初始化操作 */};
	void logTransaction() const override {
	    std::cout << "金额: " << std::fixed << amount_ << "\n";
	}
private:
    double amount_; // 交易金额（未初始化！）
};

int main() {
    BuyTransaction bt;
}
```
这样的代码不会报错，但由于 logTransaction 函数是非纯虚，其中操作可能间接改变业务逻辑，而 debug 调用过程中又显示正常调用子类的 logTransaction 函数。错误操作难以察觉。


### 需要记住
构造和析构期间不要调用 virtual 函数，因这类调用从不下降至 derived class（比起当前执行构造函数和析构函数的那层）。

## 条款 10：令 operator= 返回—个 reference to \*this
一个约定性质的条款，主要目的是为了实现"连锁赋值"和链式调用
```cpp
int x, y, z;
x = y = Z = 15; // 赋值连锁形
x = (y = (z = 15)); // 赋值采用右结合律
```
## 条款 11 ：在 operator= 中处理“自我赋值”
### 问题背景
```cpp
a[i) =a[j);
*px = *py;
```
这些潜在的自我赋值不太容易看出来，但大多数情况下 C++会自动处理，但如果：
- 两个对象来自同一个继承体系，它们甚至不需声明为相同类型就可能造成“别名”, 因一个 base class 的 reference 或 pointer 可以指向一个 derived class 对象
- 写一个用于资源管理的 class ，自我赋值可能会导致错误
```cpp
class Bitmap {...}；
class Widget {
private:
	Bitmap* pb;//指针，指向一个从heap分配而得的对象
}；

Widget&
Widget::operator=(const Widget& rhs) { //一份不安全的operator=实现版本
	// if (this== &rhs) return *this;
	delete pb;					//停止使用当前的bitmap，
	pb = new Bitmap(*rhs.pb);	//使用rhs'sbitmap的副本（复件）。
	return *this;				//见条款10。
}
```
operator= 函数内的＊ this （赋值的目的端）和 rhs 如果是同一个对象，delete 就会删除赋值动作发送端和目的端的内容。导致指针悬空。所以要解开注释。
- 不解开注释不仅不具备“自我赋值安全性”，也不具备“异常安全性”
- 解开注释解决了“自我赋值安全性”，但仍有异常问题：
  如果 new Bitmap，导致异常（不论是因分配时内存不足或因 Bitmap 的copy 构造函数抛出异常），Widget 最终会持有一个指针指向一块被删除的 Bitmap 这样的指针有害。你无法安全地删除它们，甚至无法安全地读取它们。
```cpp
Widget& Widget::operator=(const Widget& rhs) {
	// if (this== &rhs) return *this;
	Bitmap* pOrig = pb;//记住原先的pb
	pb = new Bitmap(*rhs.pb);//令 pb指向 *pb 的一个复件（副本)
	delete pOrig;//删除原先的pb
	return *this;
}
```
这种方法解决了异常问题，但会导致资源复制，性能下降。如果将注释解开，避免自我赋值过程中无效资源复制，同时会让代码变大一些（包括原始码和目标码）并导入一个新的控制流 (control flow) 分支，而两者都会降低执行速度。

两者兼得做法是 copy-and-swap：
```cpp
Widget & Widget::operator=(const Widget& rhs) {
	Widget temp(rhs);  // 为 rhs 数据制作一份复件（副本）
	swap (temp) ;
	return *this;
}
```
如果可以确定 Widget 对象的拷贝赋值函数是值传递，甚至可以直接不制作副本

### 需要记住
- 确保当对象自我赋值时 operator= 有良好行为。其中技术包括比较”来源对象”和“目标对象”的地址、精心周到的语句顺序、以及 copy-and-swap 。
- 确定任何函数如果操作一个以上的对象，而其中多个对象是同一个对象时，其行为仍正确。
## 条款 12：复制对象时勿忘其每—个成分
### 问题背景
如果声明自己的拷贝构造函数和赋值构造函数，那么改动代码（通常是增删成员） 时，**如果没有同时修改这两个函数和所有构造函数**（见[[#条款 04：确定对象被使用前已先被初始化|条款4]] ( 和[[#条款 45：运用成员函数模板接受所有兼容类型|条款 45]]），即使你在“最高警告级别“（见[[#条款 53 ：不要轻忽编译器的警告|条款 53]]）中，编译器仍不会有任何提示：

> 既然你拒绝它们为你写出 copying 函数，如果你的代码不完全，它们也不告诉你。

```cpp
class PriorityCustomer: public Customer {
public:
	//一个 derived class
	PriorityCustomer(const PriorityCust omer& rhs);
	PriorityCustomer&
	operator=(const PriorityCustomer& rhs);
private:
	int priority;
};

PriorityCustomer::PriorityCustomer(const PriorityCustomer& rhs) : priority(rhs.priority) {
	logCall("PriorityCustomer copy constructor");
}

PriorityCustomer& Priori tyCustomer: : operator=(const PriorityCustomer& rhs) {
	logCall("PriorityCustomer copy assignment operator");
	priority= rhs.priority;
	return *this;
}
```
PriortyCustomer 的 copying 函数看起来好像复制了 PriorityCustomer 内的每一样东西，但事实上只复制了子类 PriorityCustomer 类的所有成员而忽略父类。
PriorityCustomer 的 copy 构造函数并没有指定实参传给其 base class 构造函数，因此只会执行父类的 default 构造函数。

所以，任何时候只要你承担起“为 derived class 撰写 copying 函数”的重责大任，必须很小心地也复制其 base class 成分。那些成分往往是 private （见[[#条款 22：将成员变置声明为 private|条款 22]])
```cpp
PriorityCustomer::PriorityCustomer(const PriorityCustomer& rhs) : Customer(rhs), priority(rhs.priority) { // 调用 base class 的 copy 构造函数
	logCall("PriorityCustomer copy constructor");
}
PriorityCustomer& PriorityCustomer::operator=(const PriorityCustorner& rhs) {
	logCall("PriorityCustorner copy assignment operator");
	Customer::operator=(rhs); // 对 base class 成分进行赋值动作
	priority= rhs.priority;
	return *this;
}
```
### 需要记住
- 复制所有 local 成员变量
- 调用所有 base classes 内的适当的 copying 函数。
- 令 copy assignment 操作符调用 copy 构造函数是不合理的，因这就像试图构造一个已经存在的对象。反方向令 copy 构造函数调用 copy assignment 操作符同样无意义
- copy 和 copy assignment 函数**一般而言**有类似的结构，不要尝试以某个 copying 函数实现另一个 copying 函数。应该将共同机能放进第三个函数中，并由两个 coping 函数共同调用。

> 构造函数用来初始化新对象，而 assignment 操作符只施行于已初始化对象身上。对一个尚未构造好的对象赋值，就像在一个尚未初始化的对象身上做“只对已初始化对象才有意义”的事一样。

# 资源管理
所谓资源就是，一旦用了它，将来必须还给系统。如果不这样，糟糕的事情就会发生。
## 条款 13 ：以对象管理资源
### auto_ptr 管理资源
最常见的情况是：
```cpp
void f() {
	Investment* pInv = createInvestment();
	// other work
	delete pInv;
}
```
其中 otherwork 代码由于：
- 有 return 语句，且 return 之前忘记 delete pInv
- 创建 pInv 的语句在循环中，循环因 continue，break 或者 goto 跳出
- 其中有函数接受了 pInv 作为参数，在这些函数体内部提早退出，或者**delete 指针并释放内存**，这就会导致内存泄漏或者重复释放内存。


如果有资源**动态分配于heap 内而后被用于单一区块或函数**内。它们应该在控制流**离开那个区块或函数时被释放**。标准程序库提供的`auto_ptr` 正是针对这种形势而设计的特制产品。
1. 获得资源后立刻放进管理对象 (managing object)内，“资源取得时机便是初始化时机” (Resource Acquisition Is Initialization; RAIi)
2. 管理对象(managing object) 运用析构函数确保资源被释放
3. 由于 auto_ptr 被销毁时会自动删除它所指之物，所以一定要注意***别让多个auto_ptr 同时指向同一对象***。如果真是那样，对象会被删除一次以上，这会导致未定义行为。
4. auto_ptr 对 copy 和 copy assignment 函数做了特化，若通过 copy 构造函数或 copy assignment 操作符复制它们，它们会变成 null, 而复制所得的指针将取得资源的唯一拥有权！
使用 `std::auto_ptr<Investment> pInv` 会让**指针变为一个指针对象**，这样离开作用域它的析构函数就会自动释放指针所指向的资源。

> [!note]
> ***别让多个 auto_ptr 同时指向同一对象***这一点在 C++中有预防，他的实现方式是**隐式移动语义**应用在指针对象上的一种做法，是一个特例，他的拷贝函数语义其实是所有权的转移
> ```cpp
> std::auto_ptr<Investment> pInv1(createInvestment());  // pInv1指向函数返回的临时右值
> std::auto_ptr<Investment> pInv2(pInv1);       // 此时pInv2指向右值，pInv1被清空，指向nullptr
> pInv1 = pInv2;                                // 此时pInv1指向右值，pInv2被清空，指向nullptr
> ```
> 这样保证了：**受 auto_ptrs 管理的资源必须绝对没有一个以上的 auto_ptr 同时指向它**，这一特性的缺点是 auto_ptr **管理的对象无法通过 auto_ptr 指针进行复制**，这一点特性导致他**严禁用于 std 容器对象上**
>
> ```cpp
> std::vector<std::auto_ptr<int>> vec;
> vec.reserve(2); // 预留2个位置
> vec.push_back(std::auto_ptr<int>(new int(10)));
> vec.push_back(std::auto_ptr<int>(new int(20)));
> // 添加第3个元素 → vector扩容到4个位置
> vec.push_back(std::auto_ptr<int>(new int(30))); // 灾难开始！
> // 1. 分配新内存（容量4）
> // 2. 将旧元素拷贝到新内存
> //   - 拷贝vec[0] → 旧vec[0]变为nullptr
> //   - 拷贝vec[1] → 旧vec[1]变为nullptr
> // 3. 释放旧内存
> // 结果：新vector中元素有效，但程序逻辑已混乱
> ```

### 智慧指针管理资源
智慧指针用法参考 [[Modern C++#第 5 章 智能指针与内存管理]]
用法条款参考：[[#条款 14 ：在资源管理类中小心 copying 行为|条款 14]], [[#条款 18：让接口容易被正确使用，不易被误用|18]] 和 [[#条款 54：让自己熟悉包括 TRl 在内的标准程序库|54]] 。
使用 RCSP 智能引用计数指针可以用一种类似垃圾回收的方法管理内存
可以用于：
工厂模式函数：
```cpp
// 传统做法 - 容易忘记delete
Connection* createConnection() {
    return new DatabaseConnection();
}

// auto_ptr方案 - 明确单一所有权
std::auto_ptr<Connection> createConnection() {
    return std::auto_ptr<Connection>(new DatabaseConnection());
}

// 调用方明确获得所有权，不会误共享
```
缓存系统共享资源
```cpp
class ImageCache {
private:
    std::map<std::string, std::shared_ptr<Image>> cache_;

public:
    std::shared_ptr<Image> getImage(const std::string& filename) {
        auto it = cache_.find(filename);
        if (it != cache_.end()) {
            return it->second; // 多个调用方共享同一图像
        }

        // 加载新图像
        auto img = std::shared_ptr<Image>(new Image(filename));
        cache_[filename] = img;
        return img;
    }
};

// 使用场景：多个UI组件显示同一图片
auto img1 = cache.getImage("background.jpg");
auto img2 = cache.getImage("background.jpg"); // 共享同一内存
```
- `auto_ptr`在C++11中标记为**deprecated**
- 在C++17中**完全移除**
他与 auto_ptr 区别

| 场景特征 | 适合 `auto_ptr` | 适合 `shared_ptr` | 原因 |
|----------|----------------|------------------|------|
| **单一所有权** | ✅ 适合 | ❌ 过度 | 资源有明确单一所有者 |
| **共享所有权** | ❌ 不可能 | ✅ 必须 | 多个实体需要访问同一资源 |
| **STL容器存储** | ❌ 禁止 | ✅ 完美 | `shared_ptr`有正常拷贝语义 |
| **多线程环境** | ❌ 危险 | ✅ 安全（需注意线程安全） | 引用计数线程安全 |
现在常用 `unique_ptr` 代替，它禁止拷贝构造（防止多个资源同时被多个指针指向），必须显式转移所有权（）

### 需要记住
- 防止资源泄漏，每一笔资源都在获得的同时立刻被放进管理对象中，它们在构造函数中获得资源并在析构函数中释放资源。
- 运用管理对象的构造函数**正确初始化资源**，析构函数**正确释放资源**
- 两个常被使用的 RAIIclasses 分别是 `shared _ptr` 和 ` auto_ptr`。前者通常是较佳选择，因其 copy 行为比较直观。若选择 auto_ptr, 复制动作会使它（被复制物）指向 null 。
## 条款 14 ：在资源管理类中小心 copying 行为

## 条款 15：在资源管理类中提供对原始资源的访问
## 条款 16：成对使用 new 和 delete 时要采取相同形式
## 条款 17：以独立语句将 newed 对象置入智能指针
## 条款 18：让接口容易被正确使用，不易被误用
## 条款 19：设计 class 犹如设计 type
## 条款 20：宁以 pass-by-reference-to-const 替换 pass-by-value
## 条款 21：必须返回对象时，别妄想返回其 reference
## 条款 22：将成员变量声明为 private
## 条款 23：宁以 non-member、non-friend 替换 member 函数
## 条款 24：若所有参数皆需类型转换，请为此采用 non-member 函数
## 条款 25：考虑写出一个不抛异常的 swap 函数
## 条款 26：尽可能延后变量定义式的出现时间
## 条款 27：尽量少做转型动作
## 条款 28：避免返回 handles 指向对象内部成分
## 条款 29：为"异常安全"而努力是值得的
## 条款 30：透彻了解 inlining 的里里外外
## 条款 31：将文件间的编译依存关系降至最低
## 条款 32：确定你的 public 继承塑模出 is-a 关系
## 条款 33：避免遮掩继承而来的名称
## 条款 34：区分接口继承和实现继承
## 条款 35：考虑 virtual 函数以外的其他选择
## 条款 36：绝不重新定义继承而来的 non-virtual 函数
## 条款 37：绝不重新定义继承而来的缺省参数值
## 条款 38：通过复合塑模出 has-a 或"根据某物实现出"
## 条款 39：明智而审慎地使用 private 继承
## 条款 40：明智而审慎地使用多重继承
## 条款 41：了解隐式接口和编译期多态
## 条款 42：了解 typename 的双重意义
## 条款 43：学习处理模板化基类内的名称
## 条款 44：将与参数无关的代码抽离 templates
## 条款 45：运用成员函数模板接受所有兼容类型
## 条款 46：需要类型转换时请为模板定义非成员函数
## 条款 47：请使用 traits classes 表现类型信息
## 条款 48：认识 template 元编程
## 条款 49：了解 new-handler 的行为
## 条款 50：了解 new 和 delete 的合理替换时机
## 条款 51：编写 new 和 delete 时需固守常规
## 条款 52：写了 placement new 也要写 placement delete
## 条款 53：不要轻忽编译器的警告
## 条款 54：让自己熟悉包括 TR 1 在内的标准程序库
## 条款 55：让自己熟悉 Boost
