### extern，constexpr 和 explict 关键字
#### 基本认识
- `extern` 关键字用于声明一个变量或函数，但不定义它。它常用于跨文件的变量或函数声明，允许在多个文件中共享同一个变量或函数定义。`extern` 的出现是为了解决全局变量和函数在**多个文件中的共享**问题。
- `constexpr` 关键字用于声明编译时常量或表达式，它必须在编译时就能计算出结果。`constexpr` 的出现是为了提高性能，允许编译器在编译时进行优化
- `explicit` 关键字用于防止构造函数或转换操作符的隐式转换。它的出现是为了避免意外的类型转换，增强代码的安全性和可读性
#### 细节问题
##### extern
一般在 `.h` 文件中使用 extern 声明但不定义，在 `.cpp` 文件中赋值定义，在其他文件中需要**引用使用**到这个变量时，include `.h` 文件之后，即可访问到相同变量名称的相同变量
##### constexpr
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
构造函数出现的目的就是初始化各种值，各种变量定义，explict 强制限定其中的变量赋值不能出现隐式的类型转换

### 拷贝构造函数
拷贝构造函数作用可以参考 [[C++ Runoob Tutoral#拷贝构造函数]]，没有它是**无法完成参数值传递**和 `type a = b` 这样的操作的
- 没有显式定义 `Widget` 的拷贝构造函数，C++ 编译也会为你生成一个**默认的拷贝构造函数**
- 如果成员变量是内置类型（如 `int`、`double` 等），则直接复制其值。
- 如果成员变量是自定义类型，则会调用该类型的拷贝构造函数。
- 标准库中的模板容器（如 `std::vector`、`std::string`、`std::map` 等）都实现了**拷贝构造函数**。
- 它们的拷贝构造函数会递归地复制容器中的所有元素。
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
- C：完成 C++ 中的 C 功能时，必须遵守 C 的局限没有模板 (templates) ，没有异常 (exceptions) ，没有重载 (overloading)
- Object-Oriented C+＋：使用 C++时，遵循面向对象程序设计的古典规则
- Template C+＋
- STL，standard template library 同 STL 一起工作，你必须遵守它的规约。
---
**关于记号表**
**记号表（Symbol Table）** 是**编译器**在编译过程中使用的一种数据结构，用于存储程序中所有符号（如变量、函数、类、常量等）的信息。它的作用是：

- **记录符号的属性和作用域**：例如符号的类型、名称、作用域、存储类别（如 `static`、`extern` 等）。
- **支持符号的查找和绑定**：在编译阶段，编译器通过记号表解析符号引用，确保变量和函数定义的一致性。
- **支持代码优化**：记号表还可以用于存储符号的静态信息，帮助编译器进行优化。
- 记号表出现的目的是方便编译器更好的管理变量，支持作用域规则：C++中的作用域规则（如局部变量、全局变量、类成员变量等需要符号表来维护符号的可见性。
## 条款 2：尽置以 const, enum, inline 替换＃define
### const 声明
- 无法利用＃define 创建一个 Class 专属常量，因为 `#defines` 并不重视作用域 (scope)。一旦宏被定义，它就在其后的编译过程中有效（除非在某处被＃undef) 
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
- 但是，对于以下情况，必须给出定义： （1）需要取该变量的地址（因为引用它时需要在内存中存在实际的位置）。 （2）编译器要求生成定义式。
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
- 作用域中的常量，或修饰文件、函数、或区块作用域 (block，Scope) 中被声明为 static 的对象
- 修饰 classes 内部的 static 和 non-static 成员变量
- 面对指针，可以指出指针自身、指针所指物，或两者都（或都不）是 const:
---
 const 出现在星号左边，表示被指物是常量；
 如果出现在星号右边，表示指针自身是常最；
 如果出现在星号两边，表示被指物和指针两者都是常量。
 可以参考 [[#const 声明|const 声明]]
### STL 中的 const
迭代器的作用就像个 T* 指针。迭代器为 const 就像声明指针为 const 一样（即声明一个 T* const 指针），表示这个**迭代器在定义之后不能指向不同的东西**，但它所指的**东西的值**是可以改动的。
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
### 什么时候使用 const
#### const 设计理念
1. **`const` 关键字的设计目标**
    `const` 关键字的设计目标是声明一个对象为常量，限制其状态不可修改。然而，这种限制是有限制的。`const` 关键字只能保证对象本身的内存地址不变，但无法保证对象内部指针或引用指向的内存区域不变。
2. **`const` 成员的约束**
    `const` 成员函数不能修改对象的非 `mutable` 成员变量。但是，如果成员变量是指针或引用，可以通过指针或引用修改指向的内存区域。因此，`const` 成员函数并不能完全保证对象的状态不变。

需要注意的是，C++中函数返回值使用的是“pass-by-value”而不是 reference，随意返回值也会占用空间和资源
有两种使用 const 的理念：
#### Bitwise const
1. Bitwise canst 阵营的人相信，成员函数只有在不更改对象之任何成员变量 (static 除外）时才可以说是 const。`bitwise const` 只**保证对象本身的内存地址不变**，但不保证指针或引用指向的内存区域不变。即，编译器确保对象的每个二进制位都不被修改。
	- **严格不变性**：对象的内存内容在声明为 `const` 后不能被更改。
	- **编译器强制检查**：编译器会阻止对 `const` 对象进行任何修改操作。
局限性和缺点是，尽管使用 const 修饰的变量，仍然有可能被改变
```cpp
class BitwiseConstExample {
public:
    int* ptr;
    BitwiseConstExample() : ptr(new int(10)) {}
    void modify() const {
        // ptr = new int(20); // 编译器报错，因为 ptr 本身是 const
        *ptr = 20; // 合法，因为 ptr 指向的内存区域可以修改
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
- 返回的是 `char&` ，会导致返回值可以被修改（即使 `CTextBlock` 是 const 对象，且 `operator[]` 的函数体内容也没有改变对象状态，但是对象内部仍然可以被**对象外部操作**改变）。这符合 bitwise const 测试，但是无法达到效果
- 究其原因是使用 bitwise const 无法控制内部指针或者引用变量成员在**外部通过其他方法改**变对象内部状态，而编译器无法检测到
- 解决方法是对**每一个 const 对象的成员**都使用 const 修饰返回值和函数体（但是如果成员是指针或者引用，仍然无法避免指针在外部操作**没有改变指针的指向，但是改变了指针的值**），让其无法通过函数体和返回值引用更改对象内部状态或者使用 logical const
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
上面代码中的**赋值（不是初始化）** 发生在构造函数中，而不在构造函数之前，所以这是赋值不是初始化，原因是：
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
[1]: 晦涩错误，指的是两个成员变量的初始化带有次序性。例如初始化 array 时需要指定大小，因此代表大小的那个成员变量必须先有初值，但是如果初始化次序导致他没有初值**也是合法的**
### 不同编译单元内定义之 non-local static 对象的初始化次序。
- static 对象：参考 [[C++ Runoob Tutoral#类的静态成员|static对象]]，不是 stact 和 heap-based 对象包括 global 对象、定义 namespace 作用域内、在 classes 内、在函数内、以及在 file 作用域内被声明为 static 的对象。
- no-local-static 对象：函数**内**的 static 对象称为 local static 对象（因为它们对函数而言是 local) ，其他 static 对象称为 non-localStatic 对象。
- 编译单元（translation unit）：是指产出单一目标文件 (single object file) 的那些源码。基本上它是单一源码文件加上其所含入的头文件

> 如果某编译单元内的某个 non-local static 对象的初始化动作使用了另一编译单元内的某个 non-localstatic 对象，它所用到的这个对象可能尚未被初始化

不同于初始化列表中的**初始化次序完全按照代码顺序**， C++ 对“定义于不同的编译单元内的 non-local static 对象”的初始化相对次序并无明确定义，所以***决定它们的初始化次序相
当困难，非常困难，根本无解。***
```cpp
class Directory { ／／由程序库客户建立
public:
	Direc七ory (params);
	/* code */
};
Direc七ory :: Directory (params) {
	std::size t disks= tfs.numDjsk:3();
}		//使用 tfs 对象
```
但是可以通过将每个 non-local static 对象搬到自己的专属函数内（该对象在此函数内被声明为 static)，然后调用函数即可
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
> - [[Effective C++（侯捷）#内置型 non-member 对象|内置型（non-number）对象]] 进行手工初始化，因为 C++不保证初始化它们。
> - 构造函数最好使用成员初值列 (member initialization list) ，而不要在构造函数本体内使用赋值操作 (assignment) 。初值列列出的成员变量，其排列次序应该和它们在 class 中的声明次序相同。
> - 为免除“跨编译单元之初始化次序”问题，请以 local static 对象替换 non-localstatic 对象。

# 2.  构造／析构／赋值运算
## 条款 05：了解 C+＋默默编写并调用哪些函数
### 默认构造行为和调用方法
什么时候 empty class （空类）不再是个 empty class 呢？**当 C+＋处理过它之后**。如果你自己没声明，编译器就会为它声明**编译器版本的**
- 一个 copy 构造函数
- 一个 copy assignment 操作符
- 一个析构函数
- 一个 default 构造函数（如果没有声明任何构造函数）
如果你写下：
```cpp
class Ernp七y { };
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
copy 构造函数和 copy assignment 操作符，编译器创建的版本只是单纯地将来源对象的每一个non-static 成员变量拷贝到目标对象。
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
//以下构造函数如今不再接受一个const名称，因为nameValue 如今是个reference-to-non-const string。
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
code 1 代码一切正常，因为 nameValue 是 p 和 s 各自的成员变量互不影响
如果使用 code 2 会导致 mark 位置编译出错，原因是：
- 在类中有**引用成员**时，**默认的拷贝赋值操作是被删除的**（deleted）
- 两个对象的 nameValue 是字符串引用对象，mark 之前的代码两个 nameValue 分别指向 newDog 和 oldDog 两个字符串变量
- 使用编译器**默认生成的拷贝构造操作符（不是拷贝构造函数）**实现两个对象的**拷贝赋值会单纯地将来源对象的每一个 non-static 成员变量拷贝到目标对象。**，`p.nameValue = &newDog` 拷贝值到 `s.nameValue = &oldDog`，但是 C+＋并不允许“让 reference 改指向不同对象，这样就会导致编译器在类中寻找**自定义 copy assignment 操作符**，即 `NameObject& operator=(const NameObject& rhs) {}`，如果未定义，就会终止赋值操作代码。

## 条款06：若不想使用编译器自动生成的函数，就该明确拒绝
通常如果你不希望 class 支待某一特定机能，只要不声明对应函数就是了。但这个策略对copy 构造函数和copy assignment 操作符却不起作用，因为[[Effective C++（侯捷）#条款 05：了解 C+＋默默编写并调用哪些函数|条款5]]  已经指出，如果你不声明它们，而**某些人尝试调用它们，编译器会为你声明它们**
所有编译器产出的函数都是 public 。为阻止这些函数被创建出来，你得自行声明它们可以阻止他们生成，***将 copy assignment 和 copy constructor 放在 private 中，就可以组织编译器自动创建 public 版本***，又由于这些函数是 private 的无法从外部调用，所以最终 class 就相当于仅用了这些放在 private 中的内容

>  但是member 函数和 friend 函数还是可以调用你的 private 函数。除非你够聪明，不去定义它们，那么如果某些入不慎调用任何一个，会获得一个连接错误(linkage error)

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
- **私有拷贝构造函数和运算符重载函数**都定义但未实现，又被放在了 private 中导致外部无法调用，所以尝试使用这些函数，编译器会报错（因为找不到定义），甚至**在编译期就能阻止**一些非法的拷贝行为；
- 将构造和析构放在 protect 中，所以 Uncopyable 类**无法被实例化**无法调用 public 构造函数
- 任何从 `Uncopyable` 继承，仅仅是为了获得其私有（未定义）的拷贝函数的屏蔽效果；将 `Uncopyable` 的构造函数和析构函数设为 `protected`，是为了**只允许派生类访问和调用它们**，同时**不让外界单独创建 Uncopyable 对象**。
- `private` 继承只影响 **基类成员在子类中的可见性（访问权限）**，不会阻止子类访问自己拥有权限访问的成员（例如 `protected`
- 如果将 protect 中的构造和析构函数移动到 private 中，那么子类在继承 `Uncopyable` 时也会将两个函数**继承为 private**，子类同样无法从外部调用它们，无法实例化

| 继承方式        | 成员权限变化                                           |
| ----------- | ------------------------------------------------ |
| `public`    | 持有基类成员的原有访问权限（public、protected）                  |
| `protected` | **基类 public 被降级为 protected，private 仍不可见**        |
| `private`   | 基类 public 和 protected 都变为 private，private 成员仍不可见 |

C++11 之后能够写为：
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

明白一点说就是：derived class派生类继承base类，如果base类中没有将析构函数设置为virtual，那么在通过子类构造函数创建父类对象的指针之后想要删除指针，调用delete命令之后就会出现派生类对象无法释放内存而导致内存泄漏问题
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
- 内存泄漏：`dynamicData`分配的1024字节永远不会被释放
- 资源管理：若`dynamicData`指向文件句柄/锁等资源更危险
- 未定义行为：部分编译器可能引发段错误（如涉及虚继承布局）
为防止**局部析构**和**资源泄漏**问题，通常在设计 base 类时，要将析构函数设置为 virtual，这样使用 delete 后，编译器会自动调用父类析构函数
### 虚函数实现原理
#### “虚对象”结构
**虚函数表**：欲实现出virtual 函数，对象必须携带某些信息用来在运行期决定哪一个virtual 函数该被调用。这份信息通常是由一个所谓 vptr (virtual table pointer) 指针指出。 vptr 指向一个由函数指针构成的数组，称为 vtbl (virtual table) ；
**虚函数指针**：每一个带有 virtual函数的 class 都有一个相应的 vtb| 。当对象调用某一 virtual 函数，实际被调用的函数取决千该对象的 vptr 所指的那个 vtbl 一编译器在其中寻找适当的函数指针。
**虚函数对类对象大小影响**：如果 class 内含 virtual 函数，其对象的体积会增加：在 32-bit 计算机体系结构中将占用 64 bits （为了存放两个 ints)至 96 bits （两个 ints 加上 vptr) ； 64-bit 中可能占用 64-128 its,因为指针在这样的计算机结构中占 64bits 。
**虚析构函数会改变二进制布局**：

| 类型          | 成员布局                    | 32 位系统体积 | 64 位系统体积 | 跨语言传递风险 |
|---------------|-----------------------------|-------------|-------------|----------------|
| Point         | [x][y]                      | 8 字节       | 8 字节       | 可无缝传输     |
| PointWithVptr | [vptr][x][y]                | 12 字节      | **16 字节**  | ❌ 用途受阻     |

**Scott Meyers的约束公式**
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
#### STL 中的 non-virtual 设计
- `std::string`**故意不设计虚函数**以维持二进制兼容性
- 所有STL容器（`vector`/`list`/`map`）都遵循这一设计原则
- 它们的内存布局必须与C兼容（如 `strlen()` 可直接操作 `std::string::c_str()`）
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