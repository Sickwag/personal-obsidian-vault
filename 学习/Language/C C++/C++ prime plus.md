# 第一章预备知识
结构化编程,自顶向下设计结构和面向对象编程设计思想是[C++](../../../Files%20&%20LongText/Q&A/C++.md)的特点
C语言是过程性编程, 是问题转化为用语言描述的过程性方法
**面向对象编程思想**:  试图让语言来满足问题的要求。设计与问题的本质特性相对应的数据格式。

# 第二章开始学习C++

- [c++](../../../Files%20&%20LongText/Q&A/C++.md)对大小写敏感
- 需要让程序停止,并通过输入按任意一个键继续需要在函数中加入`cin.get()`
- [c++](../../../Files%20&%20LongText/Q&A/C++.md)并没有不支持`printf()`语句, 只需要导入`stdio.h`头文件即可,`cout/in`是C++的工具

## 代码固定结构

### main 函数
#### 使用 main 函数注意事项
![425](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240802150130.png)
- 空括号表示mian再被其他函数调用时不做出参数回答**沉默**(不接受任何参数的隐式声明)，而不是不接受调用函数的任何内容，括号中填写 `void` 表示明确不接受任何参数
- 通常 main 函数被程序的**启动代码**调用
- 省略函数返回类型默认为`int`, 在C语言中一定要写`return`,在C++中可以不写,默认`return 0`
- `void main()` 并不写任何 return 语句并不是 C++的推荐做法，应该尽量避免
- 没有写返回语句的函数，编译器会自动添加 `return 0`，**仅在** `main` 函数中有效
#### 为什么程序入口一定是 main 函数？
历史原因：早期 C 语言的使用习惯
ISO C/C++标准：为确保 C 语言在各个平台之间的兼容性，统一命名

Python 和 ruby 等语言支持自动以入口函数名
使用 dll 模块文件的程序和专用编程环境的情景下可以使用一些非标准的入口函数，如 `_tmain()`


### 启动代码
--- 
由编译器在编译阶段自动添加到程序中的，用于初始化程序运行环境和启动程序执行的代码。具体内容和实现方式依赖于编译器和目标平台，但一般包含：
1. **初始化全局变量和静态变量**：在程序启动时，启动代码会负责初始化全局变量和静态变量，将它们设置为初始值（通常是0或NULL）。
2. **调用构造函数**：对于全局对象和静态对象，启动代码会调用它们的构造函数，以确保这些对象在程序的main函数执行之前被正确构造。
3. **设置堆栈和堆**：启动代码会设置程序的堆栈（stack）和堆（heap），为程序运行提供必要的内存空间。
4.  **调用main函数**：启动代码最终会调用程序的入口点main函数，开始程序的执行。
5. **处理命令行参数**：如果程序需要处理命令行参数，启动代码会将这些参数传递给main函数。
6. **处理程序退出**：程序执行完毕后，启动代码会处理程序的退出，包括调用全局对象和静态对象的析构函数，释放堆栈和堆内存等

启动代码的添加过程通常发生在**编译阶段**，当编译器将源代码转换为机器代码时，会自动将启动代码插入到生成的可执行文件中。
链接器（Linker）在链接阶段也会参与处理启动代码，帮助正确连接
启动代码是程序和操作系统之间的桥梁，最重要的作用是做好初始化工作，确保程序正常运行

### 代码风格
#### 书写风格
- **空格和回车**详细说明参考[空白(whitespace)和标记符(token)](#空白(whitespace)和标记符(token))
- 在C++中，分号标示了语句的结尾。因此回车的作用就和空格或制表符相同。通常可以在能够使用回车的地方使用空格，反之亦然。
- 这说明既可以把一条语句放在几行上，也可以把几条语句放在同一行上。

#### 头文件
头文件一般被包含在其他文件中，对于旧 C 语言的头文件，一部分在C++重写了其中内容使其适用于 C++并保留原有名称，一部分去掉 `.h` 后缀并在前面加上 `c` 表示其来自于 C 语言（如 C 语言的 `math.h` 变为 `cmath`，但 `math.h` 仍能使用）。编译器中新旧文件都支持使用

![400](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241023210440.png)

#### 标记和空白
一行代码中不可分割的元素叫做标记
空格、制表符和回车统称为空白
通常，必须用空格、制表符或回车将两个标记分开
### 命名空间
#### 为什么要有命名空间
- 类似于python的[命名空间](Python%20Basics.md#^21a604)
- 当不同的产品中有使用相同名称的函数时, 不同函数在不同的命名空间`(库文件)`中, 编译器依据其区分不同定义的函数
- 定义命名空间可以使其作用域中的类、函数、变量都**标记为激活状态**，以便后续使用
- 当在函数内部( **其他部分(如代码文件开头)** )使用 `using namespace` 时，只有该函数内部( 整个文件内部 )的代码可以访问命名空间中的名字，而不会影响到其他函数或全局作用域。
- 在开发大型项目或多人协作时尽量不要文件开头定义命名空间，在仅仅需要使用某个功能时，可以只使所需的名称可用，如 `using std::cout;` 只在下面的代码中允许使用 `cout`
- 如果一个函数内部没有变量可以不使用命名空间
- 命名空间中可以定义命名空间
```C++
//定义命名空间中的命名空间
namespace OuterNamespace {
    namespace InnerNamespace {
        void printMessage() {
            std::cout << "Hello from InnerNamespace!" << std::endl;
        }
    }
}
//调用
int main() {
    OuterNamespace::InnerNamespace::printMessage();
    return 0;
}
//简化调用
int main() {
    using namespace OuterNamespace::InnerNamespace;
    printMessage(); // 现在可以直接调用 printMessage
    return 0;
}
```

#### 命名空间调用顺序
```C++
// Library1.h
namespace Library1 {
    void print() {
        std::cout << "Library1 print function" << std::endl;
    }
}

// Library2.h
namespace Library2 {
    void print() {
        std::cout << "Library2 print function" << std::endl;
    }
}

//使用
#include "Library1.h"
#include "Library2.h"
#include <iostream>
//这里直接使用print会报错
using namespace Library1; // 使得Library1中的print()可以直接调用
using namespace Library2; // 并不是首选,这句代码多余

int main() {
    print(); // **由于Library1的print()在Library2之前被using**，所以这里调用的是Library1的print()
    Library2::print(); // 明确调用Library2的print()
    return 0;
}
```
- `std` 是一个标准命名空间（namespace），由C++标准库预定义的，**不是编程者自定义**的。
- 这个命名空间包含了**标准库**中的所有类、函数和变量等。
- 使用 `using namespace std;` 是为在当前的 `using` 作用域中省略 `std::` 前缀，使得标准库中的名字可以直接使用。

例如，标准库中的输入输出流类 `iostream`，以及其中的 `cin` 和 `cout`，都位于 `std` 命名空间中。如果不使用 `using namespace std;`，则需要在使用这些名字时加上 `std::` 前缀，如 `std::cout` 和 `std::cin`。

### C++简单语句
#### 声明和赋值变量

> C++程序是一组组函数,函数中是一组语句,语句需要操作对象,对象就是数据, 数据用变量存储

每个变量再使用前都需要被声明数据类型，[C++ Basics \> 数据类型是什么](C++%20Basics.md#数据类型是什么)，目的是防止在不知情的情况下**因为拼写错误创建新的变量**
![400](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241023215717.png)
C 98 推荐将所有需要使用的变量声明在程序开头，C++的做法是尽可能在首次使用变量前声明它。提高了自由度，也使 C++代码无法对所有变量一目了然

#### cout/cin 新花样
- 字符串的 25 和数字 25 有天壤之别，因为打印字符串时 `cout` 只需要根据编码表查找对应的编码输出即可，而数字需要先转换为二进制形式存储，再根据 `carrot = 25` 将 `carrots` 转换为字符串形式
- C++中没有像C语言一样调用变量（简单的 `printf` 使用场景）必须提供**表明类型**的占位符表示变量类型, 而是根据插入 `<<` 后的数据类型自动调整。
- 当C中指定 `%d` 整数但是输入字符串时会显示乱码, `cout` 既不用定义, 也不会显示错误
- `cout\cin` 的特别之处在于他是可拓展的，可以通过重在运算符 `<<` 来拓展其支持的数据类型，而不像 `printf` 一样细致，功能丰富但并不精密（不能识别错误和自定义调整）
### C++中的流

> `cout << "come up and C++ me some time" << endl;`它将字符串“Come up and C++ me some time.”插入到输出流中。因此，与其说程序显示了一条消息，不如说它将一个字符串插入到了输出流中。

流（Streams）是一种抽象概念，用于表示数据的连续流动。它允许程序以**统一的方式**处理输入和输出操作，无论是来自文件、控制台还是网络等其中的数据都放入一条流动的河中等待被处理, 流可以看作是数据流动的管道，数据从一端流入或流出另一端。
#### 流的概念：

[符号重载](#符号重载)
- **输入流（Input Streams）**：用于从数据源（如文件、键盘等）读取数据。
- **输出流（Output Streams）**：用于向数据目的地（如文件、屏幕等）写入数据。

对于流，C++有[字符串流](C++%20Runoob%20Tutoral.md#isstream)，文件内容流，输出输出流等
C++标准库提供了丰富的流类，如 `iostream`、`fstream` 和 `stringstream` 等，用于处理不同类型的流。

#### 流的实现：

- C++中的流是通过一系列的类和函数实现的，这些类和函数定义了流的行为和操作。例如，`std::cout` 是一个输出流**对象**，用于向标准输出（通常是屏幕）写入数据。
- `cout` 对象用于**表示**输出流，cout 对象属性包括一个 `<<` 操作符，`<<` 属性支持使用将右侧信息插入到流中的操作，并且根据流的类型[符号重载](#符号重载) 为相应类型
- `std::endl` 是一个特殊的流操纵符，用于插入换行符并刷新输出缓冲区，确保字符串立即显示在屏幕上。
- 同理使用`ifstream\ofstream`表示文件信息的流动
```C++
#include <iostream>
int main() {
    std::cout << "Come up and C++ me some time." << std::endl;
    return 0;
}
```
#### 流的缓冲和错误处理

C++中的流通常具有缓冲机制，这意味着数据不是立即写入目的地，而是先存储在缓冲区中。当缓冲区满或显式刷新时，数据才会被实际写入目的地。这种机制提高了数据传输的效率。

流操作可能会失败，例如，当尝试从一个空的输入流读取数据或向一个满的输出流写入数据时。C++的流类提供了错误状态检查机制，允许程序检测和处理这些错误。
```C++
#include <fstream>
#include <iostream>

int main() {
    std::ifstream infile("input.txt"); // 打开文件input.txt用于读取
    std::ofstream outfile("output.txt"); // 打开文件output.txt用于写入

    if (!infile.is_open() || !outfile.is_open()) {
        std::cerr << "Error opening files!" << std::endl;
        return 1;
    }

    int number;
    while (infile >> number) { // 从文件读取整数
        outfile << number * 2 << std::endl; // 将整数的两倍写入文件
    }

    infile.close(); // 关闭输入文件
    outfile.close(); // 关闭输出文件

    return 0;
}
//打开文件进行读取和写入操作。循环读取输入文件中的整数，并将每个整数的两倍写入输出文件。
```

#### 流中的符号重载

运算符不止有一个意思, 编译器根据上下文（通过捕捉）确定其含义

`<<`本来表示按位向左运算 ,但是因为在`cout`函数中,编译器将其解释为`<<`后内容插到输出流中
- **输出操作符 `<<`**：在输出流（如 `std::cout`）中，`<<` 被重载为输出操作符，用于将数据插入到输出流中。例如，`std::cout << "Hello, World!" << std::endl;` 将字符串 "Hello, World!" 和一个换行符插入到标准输出流中。
- **输入操作符 `>>`**：在输入流（如 `std::cin`）中，`>>` 被重载为输入操作符，用于从输入流中提取数据。例如，`int number; std::cin >> number;` 从标准输入流中读取一个整数并存储在变量 `number` 中。
- `<<`符号在cout在前面作为函数的前提下含义变为将<<后的内容作为输出流, `>>`同理
- 符号在不同语境中的不同意思通过内置头文件中的函数定义重载内容
```C++
//定义输出符重载
std::ostream& operator<<(std::ostream& os, const MyClass& obj) {
// 实现将 MyClass 类型的对象 obj 输出到 os 流中
// ...
return os;
}
```
- 对于输入输出, 流还可以这样使用: (`cin`同理)
	![pdbrec\_02914.jpg](../../../Files%20&%20LongText/Attachments/pdbrec_02914.jpg)

***注意**: `cout`和`cin`都是是`istream`和`ostream`**类的实例**，这两个类是在iostream**文件**中的**预定义对象***

#### 流中的常量存储
- 在流中使用未定义的常量时，除非有理由存储为其他类型（如使用了特殊的后缀来表示特定的类型，或者值太大，不能存储为 int），否则 C++将整型常量存储为 int 类型，浮点数为 float，字符串为 `char[]` 字符数组类型
- char 是一种**特殊的整型变量**，比 short 更小，因为只有 128 个基本字符，如果有使用支持更多字符的单个字符常量容器，可以使用 `wchar_t`
特殊情况中：
1. 首先看后缀，后缀是放在数字常量后面的字母，用于表示类型。
	- 整数后面的 l 或 L 后缀表示该整数为 long 常量
	- u 或 U 后缀表示 unsigned int 常量，
	- ul（可以采用任何一种顺序，大写小写均可）表示 unsigned long 常量（由于小写 l 看上去像 1，因此应使用大写 L 作后缀）
2. 接下来考察长度，数据会根据长度自动调整存储类型

## 类简介

C++中对类和对象的简洁描述: **类描述了一种数据类型的全部属性（包括可使用它执行的操作），对象是根据这些描述创建的实体** [类和对象](Python%20Basics.md#^c8315c)
C++提供了两种发送消息的方式：一种方式是使用类方法；另一种方式是重新定义运算符[符号重载](#符号重载)，cin和cout采用的就是这种方式。

## 函数
### 函数使用
简洁定义: 函数执行完毕后，语句中的函数调用部分将被替换为返回的值。因此，这个例子将返回值赋给变量x。简而言之，参数是发送给函数的信息，返回值是从函数中发送回去的值。
![475](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240803181252.png)'

对于main函数返回值: 源代码没有调用main函数的函数, 因为main是计算机系统启动代码的入口，由[启动代码](#启动代码)调用，入口程序返回值代表整个程序运行情况. 一般约定返回值为0表示代码正常运行 ,非零则反之

一个标准的函数应该包含下面的特性：】
- 有函数头和函数体；
- 接受一个参数；
- 返回一个值；
- 需要一个原型。
### 函数原型

- `返回类型 函数名(参数类型1 参数名1, 参数类型2 参数名2, ...);`是函数声明的一种形式，它提供了函数的名称、返回类型、参数列表（包括参数类型和数量）等信息，但不包括函数体。函数原型的主要作用是告诉编译器函数的存在、函数的接口信息，使得编译器在编译过程中能够正确地处理对这个函数的调用。**特别要与函数定义\声明区分**
- 应在首次使用函数之前提供其原型。通常的做法是把原型放到main( )函数定义的前面。
- 对于**没有返回值的函数**不能将其放在赋值语句中,即**不能将他看做表达式**,赋值赋值,需要一个值来赋,没有返回值的函数应用
```C++
void printMessage() {
    std::cout << "Hello, World!" << std::endl;
}
int main() {
    printMessage(); // 调用没有返回值的函数,直接使用里面的功能
    return 0;
}
```
- 函数原型不需要提供参数的名称，只需要参数的类型。原型参数中为`(void)`,定义函数时却可以放入不同类型/数量的参数   [补充](#^c8fc5b)
- 函数原型应该放在main函数之前( 规范 ), 函数定义可以放在调用这个函数的函数后面，但前提是必须在调用函数之前声明函数原型。C++编译器在编译过程中会进行两次遍历源代码：
1. **第一次遍历**：编译器读取源代码，识别所有的函数声明**而不会读取原型**和全局变量声明。这一步确保了编译器在处理函数调用时已经知道函数的存在和其接口信息。 ^97a565
2. **第二次遍历**：编译器再次从头开始读取源代码，此时它已经知道了所有函数的声明，因此可以正确地编译函数的定义。
```C++
#include <iostream>
// 函数声明（函数原型）
void myFunction(); //没有这句话会报错
int main() {
     myFunction(); // 调用自定义函数
     return 0;
}
// 函数定义
void myFunction() {
     std::cout << "Hello, World!" << std::endl;
}
```
### 函数的返回值
`main` 函数的返回值是为了返回给操作系统或者外部批处理程序，由他们调用接口读取到这个返回值，并根据他对程序的运行情况做出判断
### 第二章复习题&练习

#### 实例:英石和磅转换
```c++
#include<iostream>
#include<math.h>

double convert(void);
int main(){
    using namespace std;
    cout << "input your weight(pound) : " << endl;
    convert();
    return 0;
}

double convert(void){
    using namespace std;
    double pound;
    cin >> pound;
    cout << "your weight in stone(England) is :" << pound / 14 << endl;
    return 0;
}
//结构比较混乱,一个函数只做一件事,因此main函数只做输入输出信息,convert只做数据转换
//改进
#include<iostream>
#include<math.h>

double convert(void);
using namespace std;
int main(){
    cout << "input your weight(pound) : " << endl;
    cout << "your weight in stone(England) is :" << convert() << endl;
    return 0;
}

double convert(void){
    double pound;
    cin >> pound;
    return pound / 14;
}
```

#### 2. 编译器预处理

- 导入模块时，模块文件中的顶层代码会被执行，但**函数或类内部的代码（体）** 只有在它们被调用时才会执行。这与[Python Basics \> python模块导入](Python%20Basics.md#python模块导入)一致
- 在C++中，顶层代码通常指的是指那些在模块或程序中直接位于**最外层的**代码：
	- 全局变量的定义和初始化
	- 函数的定义
	- `main` 函数（程序的入口点）
	- 使用 `extern` 关键字声明(**不是定义**)的变量和函数,  [存储类型](#存储类型)中有说明作用
-----------------------------------------------------------
#### 3.显示信息
```C++
#include<iostream>
using namespace std;
void info_1(){
    cout << "Three blind mice" << endl;
}
void info_2(){
    cout << "TSee how they run" << endl;
}
int main(){
    info_1();info_1();
    info_2();info_2();
}
```

想要重复调用一个函数,只能够过直接调用( 这里使用 ), lambda表达式和函数封装和循环 ^34a3d4

# 第三章处理数据
## 命名规范
- 以两个下划线或下划线和大写字母打头的名称被保留给实现（编译器及其使用的资源）使用。以一个下划线开头的名称被保留给实现，用作全局标识符。
- `_time_stop` 或 `_Donut` 这样的名称不会导致编译器错误，而会导致**行为的不确定性**。
- 如果想用两个或更多的单词组成一个名称，通常的做法是用下划线字符将单词分开，如`my_onions；`或者从第二个单词开始将每个单词的第一个字母大写，如`myEyeTooth`。

## 类型转换
### 初始化和赋值进行的转换

#### 字面量转换问题
| **转 换**                             | **潜在的问题**                                                  |
| ----------------------------------- | ---------------------------------------------------------- |
| 将较大的浮点类型转换为较小的浮点类型，如将double转换为float | 精度（有效数位）降低，值可能超出目标类型的取值范围，在这种情况下，结果将是不确定的（编译器未定义这种转换行为的结果） |
| 将浮点类型转换为整型                          | 小数部分丢失，原来的值可能超出目标类型的取值范围，在这种情况下，结果将是不确定的                   |
| 将较大的整型转换为较小的整型，如将long转换为short       | 原来的值可能超出目标类型的取值范围，通常只复制右边的字节                               |
#### 用 `{}` 初始化转换
C++11将使用大括号的初始化称为列表初始化（list-initialization），因为这种初始化常用于给复杂的数据类型提供值列表。
**列表初始化不允许缩窄（narrowing）**，
不允许将浮点型转换为整型。在不同的整型之间转换或将整型转换为浮点型可能被允许，条件是编译器知道目标变量**能够正确地存储**赋给它的值。例如，可将long变量初始化为int值，因为long总是至少与int一样长；相反方向的转换也可能被允许，只要int变量能够存储赋给它的long常量
![Pasted image 20241024121821.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241024121821.jpg)
初始化 c 4 时，您知道 x 的值为 66，但在编译器看来，x 是一个变量，其值可能很大。编译器不确定这个数能否正确初始化 char，而使用 `=` 允许*窄缩*，初始化 `c5` 正常
#### 表达式中的转换
C++将bool、char、unsigned char、signed char和short值转换为int。具这些转换被称为整型提升（integral promotion）
编译器在计算表达式时，会从下面的检索表中检索符合条件的情况，进行提升
1. 如果有一个操作数的类型是long double，则将另一个操作数转换为long double。
2. 否则，如果有一个操作数的类型是double，则将另一个操作数转换为double。
3. 否则，如果有一个操作数的类型是float，则将另一个操作数转换为float。
4. 否则，说明操作数都是整型，因此执行整型提升。
5. 在这种情况下，如果两个操作数都是有符号或无符号的，且其中一个操作数的级别比另一个低，则转换为级别高的类型。
6. 如果一个操作数为有符号的，另一个操作数为无符号的，且无符号操作数的级别比有符号操作数高，则将有符号操作数转换为无符号操作数所属的类型。
7. 否则，如果有符号类型可表示无符号类型的所有可能取值，则将无符号操作数转换为有符号操作数所属的类型。
8. 否则，将两个操作数都转换为有符号类型的无符号版本。
#### 传递参数时的转换
传递参数时的类型转换通常由C++函数原型控制。然而，也可以**取消原型对参数传递的控制**，尽管这样做并不明智。
在这种情况下，C++将对char和short类型（signed和unsigned）应用整型提升。
为保持与传统C语言中大量代码的兼容性，在将参数传递给取消原型对参数传递控制的函数时，C++将float参数提升为double。
#### 强制类型转换
强制转换格式如下
![Pasted image 20241024123201.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241024123201.jpg)
可以参考 [C++ Basics \> 指针加强](C++%20Basics.md#指针加强)中对指针变量的转换
第一种格式来自 C 语言，第二种格式是纯粹的 C++。新格式的想法是，要让强制类型转换就像是函数调用。
C++还引入了4个强制类型转换运算符，其中 `static_cast<>` 可用于将值从一种数值类型转换为另一种数值类型，这一部分将在[第15章  友元、异常和其他](#第15章%20%20友元、异常和其他)介绍
![Pasted image 20241024123347.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241024123347.jpg)
## 字面量
**字面量**（Literal）是指直接在代码中表示的固定值。字面量是数据的直接表示，不需要变量或常量来存储它们。它们是硬编码在程序中的值，**可以被当做表达式**

### 整形字面量
变量的声明和赋值告诉的计算机信息将存储到哪里, 值是什么, 信息类型是什么三种信息

- 宽度（width）用于描述存储整数时使用的内存量。使用的内存越多，则越宽。
- C++的基本整型（按宽度递增的顺序排列）分别是 char、short (short int )、int、long ( long int ) 和 C++11 新增的 long long. 每种类型都有符号版本和无符号版本，因此总共有 10 种类型
- `INT_MAX` 类型名+MAX 或 MIN 是系统常量, 表示类型最大数值, char 的最大位数使用 `CHAR_BIT`, 在 `climits` 头文件中通过 `#define INT_MAX` 定义的符号常量, `ZERO` 表示0
- C++引入新的声明变量方式: `int vari_name(value)` / `int vari_name{}` / `int vari_name={}`
- 整型变量做超出范围的运算 ( 上溢和下溢 ) 会回到取值范围的另一端 , 导致出错 
![整形溢出|337](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240804085714.png)
如果确定变量的值不可能为负，那么一般将其设置为 `undesigned` 以获得更大的空间
- int 被设置为对目标计算机而言最为“自然”的长度。自然长度（natural size）指的是计算机处理起来效率最高的长度。**如果没有非常有说服力的理由来选择其他类型，则应使用 int**。整数值大于 16 位使用 `long`. 超过 20 亿使用 `long long`
- `climits` 文件中设置额各种符号常量最大最小值，对于 `char` 类型还设置了使用 `CHAR_BIT` 查看 `char` 的位数
- 如果知道变量可能表示的整数值大于 16 位整数的最大可能值，则使用 long。即使**系统上 int 为 32 位**，也应这样做。这样，将程序移植到 16 位系统时，就不会突然无法正常工作
- 同理，如果节省内存很重要，则应使用 short 而不是使用 int，即使它们长度一样。程序从 `int` 为 16 位的系统移到 `int` 为 32 位的系统，则用于存储 `int` 数组的内存量将加倍，但 `short` 数组不受影响。

整形数据通过书写方式区分其**进制**
- 第一位为1～9，则基数为10（十进制）
- 第一位是0，第二位为1～7，则基数为8（八进制）
- 前两位为0x或0X，则基数为16（十六进制）

在Cout中使用操纵符控制变量显示
```C++
int main(){
    int chest{0x42};
    cout << oct << chest << endl; //操控付必须在变量之前
}
```
未定义类型的整形数`Cout << 1203 << endl;`默认使用int, C++一般考察方式为:
- 先考察后缀(大写进制缩写字母)
- 后考察长度,决定使用适合的存储空间
**对于后缀**:后缀是 U 和 L 的组合，U 表示无符号整数（unsigned），L 表示长整数（long）。后缀可以是大写，也可以是小写，U 和 L 的顺序任意。
### 修饰符类型
- signed：表示变量可以存储负数。对于整型变量来说，signed 可以省略，因为整型变量默认为有符号类型。
- unsigned：表示变量不能存储负数。对于整型变量来说，unsigned 可以将变量范围扩大一倍。
- short：表示变量的范围比 int 更小。short int 可以缩写为 short。
- long：表示变量的范围比 int 更大。long int 可以缩写为 long。

### 布尔类型字符
**布尔值:** 正值解释为`true`, 负值解释为`false`

### 字符常量\字面量

一些在键盘上无法直接输入的字符。这通常通过在字符常量前加上 `'\x'` 后跟十六进制数来实现。`char specialChar = '\x0A'; // ASCII码为10的换行符`
获取字符串编码方法:
```C++
#include <iostream>
#include <string>
//循环遍历方法(仅限asci)
int main() {
    std::string str = "Hello";
    for (char c : str) {
        int encoding = static_cast<int>(c);
        std::cout << "Character: " << c << " Encoding: " << encoding << std::endl;
    }
    return 0;
}

//获取单个
char character = 'A';
int asciiValue = static_cast<int>(character); // 获取 'A' 的ASCII编码

//获取特定格式的编码,编码转化需要使用第三方库,如iconv等
```

特别地,使用\b退格转义可以实现文本输入效果( 输入数字时去掉下划线 )
![recording 3.gif](../../../Files%20&%20LongText/Attachments/recording%203.gif)
同样的, C++允许输入变量时混合输入键盘上可以输入的字符和不能啊输入的符号的编码, 同python [Files & LongText/Long code/Python \> 使用非ascii字符](../../../Files%20&%20LongText/Long%20code/Python.md#使用非ascii字符)
![\\u00E2是西里尔字母中a的编码|400](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240804103644.png)
将 `\u00E2` 解释为“Unicode码点为 `U-00E2` 的字符”。支持Unicode的编译器知道，这表示字符ö，但无需使用内部编码00E2。

char 字符类型在默认情况下，既不是没有符号，也不是有符号。是否有符号由 C++实现决定，这样编译器开发人员可以最大限度地将这种类型与硬件属性匹配起来。对 `char` 的容量很敏感时，最好显示指定 `char` 的类型为 `unsigned` 或 `signed`

### 宽字符类型
char在默认情况下既不是没有符号，也不是有符号。是否有符号由C++实现决定，也可显式声明
- 宽字符类型（宽字符）在C++中是指 `wchar_t` 类型。宽字符类型的主要作用是支持多字节字符集（如UTF-16或UTF-32）表示宽字符集中的字符，使得程序能够处理**超出基本ASCII字符集的字符**,本质上是一个"大号'ascii'码"**容器,** 本身并没有对超出ascii的字符进行编码. C++确保了char足够大，能够**存储**系统基本字符集中的任何成员，而wchar_t则可以**存储**系统扩展字符集中的任意成员


`wchar_t` 类型可以接收以下类型的参数：
- **宽字符常量**：使用单引号括起来的宽字符，如 `L'字符'`。
- **宽字符串字面量**：使用双引号括起来的宽字符串，如 `L"字符串"`。
- **其他宽字符类型变量**：可以将一个 `wchar_t` 类型的变量赋值给另一个 `wchar_t` 类型的变量。
- in和cout将输入和输出看作是char流，因此不适于用来处理wchar_t类型。iostream头文件的最新版本提供了作用相似的工具—wcin和wcout，可用于处理wchar_t流。另外，可以通过加上前缀L来指示宽字符常量和宽字符串。前缀u和U分别指出字符字面值的类型为char16_t和char32_t：

**定义宽字符和宽字符串**
```cpp
#include <iostream>

int main() {
    wchar_t wideChar = L'中'; // 定义宽字符
    std::wcout << L"Hello, World! 你好，世界！" << std::endl; // 定义宽字符串并输出
    std::wcout << L"宽字符: " << wideChar << std::endl; // 输出宽字符
    return 0;
}
```


**使用宽字符和宽字符串进行操作**

```cpp
#include <iostream>
#include <string>

int main() {
    std::wstring wideStr = L"Hello, World! 你好，世界！"; // 定义宽字符串
    std::wcout << wideStr << std::endl; // 输出宽字符串

    // 宽字符串操作
    std::wstring substr = wideStr.substr(0, 5); // 获取子字符串
    std::wcout << L"子字符串: " << substr << std::endl;

    return 0;
}
```

**其他字符类型**
char16_t和char32_t，两者都是无符号的，长16、32位。C++11使用**前缀**`u`表示``char16_t``字符常量和字符串常量，如`u‘C`’和`u“be good”`；并使用前缀`U`表示`char32_t`常量，如`U‘R’`和`U“dirty rat”`。
### 限定字符

| 限定符      | 含义                                                                                |
| -------- | --------------------------------------------------------------------------------- |
| const    | **const** 定义常量，表示该变量的值不能被修改。所以最好在初始化时定义它的值                                        |
| volatile | 修饰符 **volatile** 告诉该变量的值可能会被程序以外的因素改变，如硬件或其他线程。。                                  |
| restrict | 由 **restrict** 修饰的指针是唯一一种访问它所指向的对象的方式。只有 C99 增加了新的类型限定符 restrict。                 |
| mutable  | 表示类中的成员变量可以在 const 成员函数中被修改。                                                      |
| static   | 用于定义静态变量，表示该变量的作用域仅限于当前文件或当前函数内，不会被其他文件或函数访问。                                     |
| register | 用于定义寄存器变量，表示该变量被频繁使用，可以存储在CPU的寄存器中，以提高程序的运行效率。**但是实际上是否会存储在寄存器中由编译器决定**,在C++17被弃用 |
### 浮点字面量
需要定义变量为小数,或者展示出[基准数和缩放因子](#^25d1cb)
`3.14159 // 合法的 
`314159E-5L // 合法的
- 使用的后缀一般是e或者f
- cin\cout的行为由变量类型引导, 输入时，变量为char时cin将键盘输入的M转换为77；输出时，cout将值77转换为所显示的字符M, 为int时直接输出77
- 从从键盘上读取的任何内容都将被定义为字符串

**浮点数**: 计算机通过**基准值和缩放**因子表示一个浮点数，基准数\*缩放因子(2的幂)=浮点数。编程时可以使用正常写法, 科学计数法和小数点移动法. (`d.dddE+n` 指的是将小数点向右移n位，而 `d.ddd-n` 指的是将小数点向左移n位。之所以称为“浮点”，就是因为小数点可移动。)

计算机使用的是二进制，所以缩放因子是 2 的整数幂，这样导致了[浮点数会出现误差](../Scattered%20knowlegde/浮点数精度损失问题.md)
因为这种用2做幂的特性, 二进制不能很精确地表示十进制数.进而出现这种结果

> 11.17加上50.25应等于61.42，但是输出中却是61.419998的原因
![425](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240804135852.png)
`float` 比 `double` 精度低只有6~7位有效数字 ,运算速度也较慢, 程序中出现小数时,默认定义 `double`, float类型计算只会计算数字的前6~7位数字,后面的数字都会在计算中忽略
![其中b\=a+1.0f](../../../Files%20&%20LongText/Attachments/pdbrec_00571.jpg)
对于 cout 流控制对象，流中的数字常量后的 0 会自动省略，`cout.setf()` 可以覆盖这种行为
```cpp
#include <iostream>
#include <iomanip>

int main() {
    double num = 123.456;

    // 设置cout以定点格式输出浮点数
    cout.setf(ios::fixed);
    cout << num << endl; // 输出：123.456000

    // 设置cout以科学计数法输出浮点数
    cout.setf(ios::scientific);
    cout << num << endl; // 输出：1.234560e+02

    // 设置cout以十六进制形式输出整数
    cout.setf(ios::hex, ios::basefield);
    cout << 123 << endl; // 输出：7b

    // 设置cout以八进制形式输出整数
    cout.setf(ios::oct, ios::basefield);
    cout << 123 << endl; // 输出：173

    // 设置cout以十进制形式输出整数
    cout.setf(ios::dec, ios::basefield);
    cout << 123 << endl; // 输出：123

    return 0;
}
```
过大的数需要考虑当前数据使用的数据类型，因为 `float` 只会记录数字前 6~7 位，对超过 1000 万大小的数字，**在个位上进行操作对这个变量没有任何影响**，
### 存储类型
[C++ prime plus \> auto关键字](#auto关键字)已在C++17中弃用

| 存储符             | 含义                                                                          |
| --------------- | --------------------------------------------------------------------------- |
| extern          | `extern` 关键字用于声明一个变量或函数，表明该变量或函数具有外部链接属性。_extern_ 是用来在另一个文件中声明一个全局变量或函数     |
| mutable (C++11) | 用于修饰类中的成员变量，允许在const成员函数中修改这些变量的值。通常用于缓存或计数器等需要在const上下文中修改的数据。             |
| static          | 用于定义具有静态存储期的**变量或函数**，生命周期贯穿整个程序的运行期。在不同函数间调用不改变值.具有内部链接，**只能在定义它们的文件中访问。** |
| thread_local    | 用于定义具有线程局部存储期的变量，每个线程都有自己的独立副本                                              |
**内部外部链接**:  
- 具有**外部链接**的变量或函数可以在多个编译单元（通常是多个 `.cpp` 文件）之间共享。在链接阶段，链接器会将这些具有外部链接的标识符（变量或函数）解析为单一的实体，从而允许它们在不同的文件中被访问和使用。反之**内部链接**只能在定义它们的文件中访问
- 具有外部链接并不是值在不同文件中共享, 是这个变量/函数在编译时被标记为"共享个体", 可以再一个文件中定义 , 另一个文件中声明


### 位运算符
位运算符作用于位，并**逐位**执行操作。需要将被比较的数据按二进制表示

| 运算符 | 描述    | 作用                                    |
| --- | ----- | ------------------------------------- |
| &   | 按位与   | `1&1=0`,其他全为0                         |
| \|  | 按位或   | `0\|0=0`,其他全为1                        |
| ^   | 异或    | 相异得1,相同得0                             |
| ~   | 取反    | 01互换                                  |
| <<  | 二进制左移 | 将一个运算对象的各二进制位全部左移若干位（左边的二进制位丢弃，右边补0）。 |
| >>  | 二进制右移 | 同理                                    |

### 常量定义符
**const限定符**`const`定义一个只读常量(**不是变量**),不支持在后面修改, 常量名称通常开头大写, 声明时赋值
const比define好, 首先，它能明确指定类型。其次，可以使用C++的作用域规则将定义限制在特定的函数或文件中第三，可以将const用于更复杂的类型

**运算优先级和结合性**: 乘除都是从左到右结合,顺序: 域解析运算符>表达式>一元&size()\delete()>二元>逻辑.  当多个运算符可用于同一个操作数时，C++用优先级规则来决定首先使用哪个运算符。

### 杂项运算符
| 运算符               | 描述                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| sizeof            | [sizeof 运算符](https://www.runoob.com/cplusplus/cpp-sizeof-operator.html)返回变量的大小。例如，sizeof(a) 将返回 4，其中 a 是整数。   |
| Condition ? X : Y | [条件运算符](https://www.runoob.com/cplusplus/cpp-conditional-operator.html)。如果 Condition 为真 ? 则值为 X : 否则值为 Y。     |
| ,                 | [逗号运算符](https://www.runoob.com/cplusplus/cpp-comma-operator.html)会顺序执行一系列运算。整个逗号表达式的值是以逗号分隔的列表中的最后一个表达式的值。    |
| .（点）和 ->（箭头）      | [成员运算符](https://www.runoob.com/cplusplus/cpp-member-operators.html)用于引用类、结构和共用体的成员。                           |
| Cast              | [强制转换运算符](https://www.runoob.com/cplusplus/cpp-casting-operators.html)把一种数据类型转换为另一种数据类型。例如，int(2.2000) 将返回 2。 |
| &                 | [指针运算符 &](https://www.runoob.com/cplusplus/cpp-pointer-operators.html) 返回变量的地址。例如 &a; 将给出变量的实际地址。             |
| *                 | [指针运算符 *](https://www.runoob.com/cplusplus/cpp-pointer-operators.html) 指向一个变量。例如，*var; 将指向变量 var。             |
### 字符串计算

**除法分支**
- 除法运算符（/）的行为取决于操作数的类型。如果两个操作数都是整数，则C++将执行整数除法。这意味着结果的小数部分将被丢弃，使得最后的结果是一个整数。如果其中有一个（或两个）操作数是浮点值，则小数部分将保留，结果为浮点数。
- 如果两个操作数都是double类型，则结果为double类型；如果两个操作数都是float类型，则结果为float类型。浮点常量在默认情况下为double类型。两操作数不同时[[]] ^2d6181
- int除法、float除法和double除法。C++根据上下文（这里是操作数的类型）来确定运算符的含义。这也是一种运算符的重载
	![400](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240804143120.png)

**类型转化** : 将大( 存储空间 )变量赋值给小变量会导致精度丢失, 如果改变的类型容量不够大,如`float`转`int`可能会导致溢出, 结果不确定. 反之只会增加存储空间,其他不变


**提升优先级**
- 如果有一个操作数的类型是long double > double > float > 各种int，则将另一个操作数转换为long double > double > float > 各种int。
- 在这种都是int的情况下，如果两个操作数都是有符号或无符号的，且其中一个操作数的级别比另一个低，则转换为级别高的类型。
- 如果一个操作数为有符号的，另一个操作数为无符号的，且无符号操作数的级别比有符号操作数高，则将有符号操作数转换为无符号操作数所属的类型。
- 否则，如果有符号类型可表示无符号类型的所有可能取值，则将无符号操作数转换为有符号操作数所属的类型。
- 否则，将两个操作数都转换为有符号类型的无符号版本。

## auto关键字

^c5dc61
有关他以前的含义，参考[第9章 内存模型和名称空间](#第9章%20内存模型和名称空间)
根据变量初始值推断其类型, 但只有显式声明时才能正确推断, 寄希望于`auto n = 100`定义n为float是不切实际的

## 第三章复习题

### 1. 为什么C++有很多数据类型?
根据特定需求选择合适类型补充编译细节, 提高运算速率, short节省空间, long确保精度,如此. ^c8fc5b

超过32767 的`int`使用`undesigned int`, 两倍容量
超过20亿的`long`使用`undesigned long`,两倍容量

### 3．C++提供了什么措施来防止超出整型的范围？
C++没有提供措施, 上溢和下溢仍然能够得到值是因为使用了`climit.h`才有的功能

### 7．将long值赋给float变量会导致....

在没造成有效数字被忽略的情况下类型转换是安全的, 这个问题要根据这些类型变量中存储的数据是多少决定

- 在写表达式的同时对变量类型声明有两种方法
```C++
int pos = (int)x1 + (int)x2   //old one
int pos = int(x1) + int(x2)   //fashion one
```

---
### 1. 英尺英寸身高转换
```C++ 
#include<iostream>
#include<cmath>
using namespace std;
int main(){
    const int convert = 12;
    float inches;
    cout << "please input your height in inches(keep in one demical place) : _____\b\b\b\b\b";
    cin >> inches;
    int feet = static_cast<int>(inches / convert);
    float inch = fmod(inches, convert);
    cout << "your height is : " << feet
    << " feet(s) and " << inch << " inch(es) "<< endl;
    return 0;
}
```
- `cmath`中的fmod函数可以计算浮点数的取余运算,`fmod` 函数接受两个参数，第一个是被除数（浮点数），第二个是除数（整数**或**浮点数），并返回它们的余数。`fmod`功能单一,**只计算余数**
- 控制输入输出数字小数精度方法
	- `std::fixed` 是一个**流操纵符**，用于设置浮点数的**输出**格式为固定小数点表示法,  不足的部分用零填充。
```cpp
// 设置输出格式为固定小数点表示法，并保留两位小数
    std::cout << std::fixed << std::setprecision(2);//控制下面的流
    std::cout << "Fixed point notation with 2 decimal places: " << number << std::endl;

    // 设置输出格式为科学计数法表示，并保留三位小数
    std::cout << std::scientific << std::setprecision(3);
    std::cout << "Scientific notation with 3 decimal places: " << number << std::endl;
```

### 4. 时间换算题
```C++ 
//秒转换成大号时间单位
#include <iostream>
#include <cmath>

int main()
{
    int second;
    std::cin >> second;
    std::cout << "inpur your second : ";
    float days = second / (1440 * 60);
    int hours = static_cast<float>(fmod(second, (1440 * 60)) / 3600);
    int minutes = static_cast<float>((second - (days * 1440 * 60) - (hours * 3600)) / 60);//控制精度但不影响数据
    float seconds = second - (days * 1440 * 60) - (hours * 3600) - (minutes * 60);
    std::cout << "second equals to : " << days << " day(s) " << hours << " hour(s) " << minutes << " minute(s) " << seconds << " seconds.";
    return 0;
}
```

### 对于流的新理解
[1. 英尺英寸身高转换](#1.%20英尺英寸身高转换)
输出流是一段要输出(cout是输出到屏幕)的内容, 流的前后都可以加流控制符, 如`std::cout << std::fixed << std::setprecision(2)`需要控制的内容在控制符之后, 流控制符后可以使用
- **重置流格式**：使用 `std::defaultfloat` 可以重置流的格式到默认的浮点数表示法。
- **关闭流**：使用 `std::endl` 输出换行符，刷新输出缓冲区，重置流的格式到默认状态。
- 上面两种控制符都会截断\终止流
既然流和控制符是一体的,可以将他们写在一行`std::cout << std::fixed << std::setprecision(2) << "Fixed point notation with 2 decimal places: " << number << std::endl;`

**新的流控制符**
`std::left` : 将输出字符左对齐, right同理右对齐
`std::setw(10)`,设置输入的字符宽度
`std::setfill('_')`,字符宽度中不够用其中字符填充
`std::flush` 是C++标准库中的一个流操纵符，用于强制刷新输出缓冲区。当输出到一个流（如 `std::cout`）时，输出内容通常会被存储在一个内部缓冲区中，直到缓冲区满或遇到换行符 `\n` 时才会实际写入到目的地（如控制台）。使用 `std::flush` 可以立即清空缓冲区，将所有存储在缓冲区中的内容写入目的地。通常在流之后 ^8ea2c8


# 第四章复合类型

## 数组
### 原生数组
[C++ Runoob Tutoral \> 原生数组和标准库数组（容器）](C++%20Runoob%20Tutoral.md#原生数组和标准库数组（容器）)
数组初始化不允许缩窄转换和扩充转换
1. 存储在每个元素中的值的类型；
2. 数组名；
3. 数组中的元素数。
- 事实上，可以将数组中的每个元素看作是一个简单变量。
- 数组之所以被称为复合类型，是因为它是使用其他类型来创建的（C 语言使用术语“派生类型”）
- 编译器不会检查使用的下标是否有效。例如，如果将一个值赋给不存在的元素 months[101]，编译器并不会指出错误。但是程序运行后，这种赋值可能引发问题，它可能破坏数据或代码，也可能导致程序异常终止。
- 只有在定义数组时才能使用初始化，此后就不能使用了，也不能将一个数组赋给另一个数组
- 如果只对数组的一部分进行初始化，则编译器将把其他元素设置为 0。因此，将数组中所有的元素都初始化为 0 非常简单—只要显式地将第一个元素初始化为 0
- 最好不要让编译器自行决定数组大小，如下图第一行代码
- 
![425](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240808233203.png)

### 数组初始化方法
- 将所有元素或部分元素初始化为 0
![Pasted image 20241025143335.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025143335.jpg)
![Pasted image 20241025143532.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025143532.jpg)
- 省略等号
![Pasted image 20241025143444.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025143444.jpg)

## 字符串
### C 风格字符串
#### 字符串数组
- C 风格字符数组尤其注意定义长度比实际输入长一位，字符数组中每一个元素都是 char 类型，必须 `‘’` 括起，并且一定要写终止符，可以将它作为字符串使用
- dog 并不是一个合法的字符串，有错误但是程序能够运行
- 如果使用 `printf` ，printf 无法读取到 `\0` 就会在内存中一直向下读取知到得到一个终止符，并将 d 之后，终止符之前的所有内容解析成一个字符
- 终止符不会被 strlen 函数计算在字符串长度中
![pdbrec\_00238.jpg](../../../Files%20&%20LongText/Attachments/pdbrec_00238.jpg)
- 两者都是字符数组，但只有第二个是字符串，第一个只是简单的字符数组，因为他没有 `\0`
- 用引号括起的字符串隐式地包括结尾的空字符，因此不用显式地包括它，用 `“”` 包括的字符数组会自动在后面填充 `\0` 直到容器末尾
- 所以，字符串常量（使用双引号）不能与字符常量（使用单引号）互换。**'S'只是83的另一种写法**，**"S"不是字符常量**，它表示的是两个字符（字符S和\0）组成的字符串。"S"实际上表示的是字符串所在的内存地址。因此下面的语句试图将一个内存地址赋给 shirt_size：
![Pasted image 20241025144318.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025144318.jpg)
- `strlen()` 只计算可见的字符，不将 `\0` 计算在内，要存储字符串，数组的长度不能短于 `strlen(string)+1。`


#### 拼接字符串常量
- python 的 print 函数可以再不同的字符串之间加+
- C++直接连接两个字符串在 cout 中即可
- C 中使用 strcat 方法连接字符串

#### 字符串工具
##### getline
- **`cin >> line`**- 无法读取键盘输入空白字符（如空格、制表符或换行符）之后的任何内容，cin 获取内容也会丢弃换行符在**输入队列**中，再次使用会重新读取消息队列中的内容
![375](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240809105936.png)
- get ,getline 返回值为 iostream 类型的**流对象**，都获取一行输入直到达到**换行符**，终止符不使其停止读取。但 getline 在最终得到的输入序列将换行转换为终止符 `\0`，get **保留**换行符
- `cin.getline(name,20)` 表示将一行内容读取到 name 中，字符长度不**超过 19**
- cin 的第一个参数是一个指针，指向 name 数组中的第一个元素，getline 方法表示从指针位置向下读取到换行为止，第二参数表示最大读取位数，所以可以使用
`#include<string>`
`string str`
`getline(cin，str)`
简化 cin 输入，string 类型的变量 str 会自动分配空间大小

**关于 cin 是 iostream 中对象，没有处理 string 头文件中新定义字符串内容能力**但可以用 `cin str` 需要友函数相关知识

##### get
- 连续两次调用. get 因为没有丢弃换行符 get 会认为已到达行尾
![350](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240809103944.png)
- 空参数表示只读一个字符，所以可以用它再不换行情况下处理换行符继续使用 get 输入
![375](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240809104409.png)
实现 getline 的效果

##### `cin` 的不足
- `cin` 不能避免将超过字符数组长度的字符串放入字符串中，
- 假设用 `get()` 将一行读入数组中。通过查看下一个字符是换行符还是其他字符得知停止读取的原因是由于已经读取了整行或由于数组已填满
- istream中的类（如cin）提供了一些面向行的类成员函数：getline( )和get( )。这两个函数都读取一行输入，直到到达换行符。然而，随后getline( )将丢弃换行符，而get( )将换行符保留在输入序列中。
- istream 类有另一个名为`get()`的成员函数，该函数有几种变体。
- 在需要跳过空行的位置在使用一次 `get()` 可以忽略空行
![Pasted image 20241025151919.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025151919.jpg)
这段代码中在 `cin` 输入年份之后按 enter 结束输入换行符会留在输入队列中，导致 getline 无法得到地址信息
##### 空行和其他问题
- 字符串比分配的空间长设置失效位，get 接收到空行设置失效位，恢复阻断方法 ^a1a64c

### C++风格字符串
#### C++风格字符串初始化
使用 string 头文件中的 string 更方便的定义字符串
C++同样支持 C 风格字符串对象和 string 对象
![400](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240809110438.png)
![Pasted image 20241025152949.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025152949.jpg)
- 第一个参数是目标数组；第二个参数数组长度
![Pasted image 20241025153012.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025153012.jpg)
- 第一个参数指向何处获取输入，第二个参数表示将输入放入*string*类型对象中
`isstream` 中没有处理 `string` 类型的功能，但在 C++标准中将处理*string*对象的函数作为 istream 中的友元函数，所以可以处理
**string**和**char**异同
- 不能将一个数组赋给另一个数组，但可以将一个 string 对象赋给另一个 string 对象
- 可以使用运算符`+`将两个 string 对象合并起来，还可以使用`+=`附加到 string 对象的末尾。
- char 只能使用 strcat 外部辅助函数
- string 自带 .size 方法计算长度，C 风格字符串需要 strlen 函数辅助
	![400](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240809111107.png)
#### 原始（raw）字符串
原始字符串将" (和)"用作定界符，并使用前缀 R 来标识原始字符串：
![Pasted image 20241025154245.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025154245.png)
`“()”` 之间的是需要显示的原始字符
**wchar 字符串初始化和 Raw 格式字符**
16 位 wchar 前缀为 L 或 u
32 位 wchar 前缀为 U

## 结构
### 结构体
一般结构和变量只在函数内或在需要使用结构的函数体中能够使用（安全起见最好内部声明）
在初始化结构内变量时，`=` 是可选的，并且不允许窄缩转换
可以在创建结构时，可以不定义结构体的名字，这样会创建一个名为 position 的结构变量。可以使用成员运算符来访问它的成员（如 position. x），但这种类型没有名称，因此**以后**无法创建这种类型的变量。（只能使用一次）

### 共用体
共用体是一种节省内存的数据结构，它允许**在相同的内存位置存储不同的数据类型**。共用体的主要作用是节省内存空间，在一个给定时间内只能是一种数据结构，
```cpp
union UnionName {
    DataType1 member1;
    DataType2 member2;
    DataType3 member3;
    // ...
} unionVariableName;
```

### 枚举类型
- 函数调用后使用 `:数据类型(数据类型::成员变量\参数变量 ){}` 是一种初始化变量的手段，常用于类中构造函数初始化类成员变量或者函数参数变量中
	如下面代码中的 `Machine():currentState(State::Idle){}` 表示创建一个构造函数，函数体中奖 currentState 变量初始化为 State 枚举类型中的 Idle
```cpp
enum class State
{
    Idle,
    Running,
    Paused,
    Stopped,
};
class Machine{
    private:
        State currentState;

    public:
    Machine():currentState(State::Idle){}

    // 开始操作
    void start() {
        if (currentState == State::Idle || currentState == State::Stopped) {
            currentState = State::Running;
            std::cout << "Machine started." << std::endl;
        } else {
            std::cout << "Machine is already running." << std::endl;
        }
    }

    // 暂停操作
    void pause() {
        if (currentState == State::Running) {
            currentState = State::Paused;
            std::cout << "Machine paused." << std::endl;
        } else {
            std::cout << "Machine is not running." << std::endl;
        }
    }

    // 继续操作
    void resume() {
        if (currentState == State::Paused) {
            currentState = State::Running;
            std::cout << "Machine resumed." << std::endl;
        } else {
            std::cout << "Machine is not paused." << std::endl;
        }
    }

    // 停止操作
    void stop() {
        if (currentState == State::Running || currentState == State::Paused) {
            currentState = State::Stopped;
            std::cout << "Machine stopped." << std::endl;
        } else {
            std::cout << "Machine is already stopped." << std::endl;
        }
    }

    State getCurrentState(){
        return currentState;
    }
};

int main(){
    Machine machine;
    machine.start();
    machine.getCurrentState();
    machine.pause();
    machine.getCurrentState();
    machine.resume();
    machine.getCurrentState();
    machine.stop();
    machine.getCurrentState();
}
```

- 对不适宜的类型强制转换的结果是未定义的
- 可以通过枚举类型初始化时显式设置枚举值
![Pasted image 20241025195850.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025195850.jpg)
- 指定的值必须是整数。也可以只显式地定义其中一些枚举量的值
![Pasted image 20241025195926.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025195926.jpg)
- 枚举类型没有定义算术运算符，虽然枚举类型有对应的枚举值，在算术运算中枚举类型被转换为整数但为 `int`，不能将他赋值为 `enum` 类型数据。但可以通过强制类型转换使其可行
```cpp
int a = 5;
State temporal;
temporal = State(3);
```
- 需要注意的是，枚举值需要在枚举定义的范围内
> 取值范围的定义如下。
> 首先，要找出上限，需要知道枚举量的最大值。找到大于这个最大值的、最小的 2 的幂，将它减去 1，得到的便是取值范围的上限。
> 
> 例如，前面定义的 bigstep 的最大值枚举值是 101。在 2 的幂中，比这个数大的最小值为 128，因此取值范围的上限为 127。要计算下限，需要知道枚举量的最小值。
> 
> 如果它不小于 0，则取值范围的下限为 0；否则，采用与寻找上限方式相同的方式加上负号。
> 例如，如果最小的枚举量为−6，而比它小的、最大的 2 的幂是−8（加上负号），因此下限为−7。

## 指针
### 指针和自由存储空间
只要存储数据，必须尊许下面的规则
- 信息存储在何处；
- 存储的值为多少；
- 存储的信息是什么类型。
#### 指针和 C++基本原理
面向对象编程与传统的过程性编程的区别在于，OOP 强调的是在运行阶段（而不是编译阶段）进行决策。运行阶段指的是程序正在运行时，编译阶段指的是编译器将程序组合起来时。

运行阶段决策就好比度假时，选择参观哪些景点取决于天气和当时的心情；
编译阶段决策更像不管在什么条件下，都坚持**预先设定的日程安排**。
![Pasted image 20241025201037.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025201037.png)
![Pasted image 20241025201118.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025201118.png)
- 指向不同长度数据类型的指针，指针本身的长度是一样的，因为都内存存储地址（固定长度）
#### 指针的危险性
- 在 C++中创建指针时，计算机将分配用来存储地址的内存，但不会分配用来存储指针所指向的数据的内存。
![Pasted image 20241025203415.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025203415.jpg)
fellow 指向位置不明，223323 只是一个整数值，但编译器会将他认为是地址值，现在默认用十六进制表示地址就是为了避免这一情况，所以，**在创建指针变量时正确初始化他的地址**
- 指针不是整型，虽然计算机通常把地址当作整数来处理。
![Pasted image 20241025203652.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025203652.jpg)
这样看似正确，但只是将一个十六进制整数传递给指针变量，编译器报错类型不匹配
![Pasted image 20241025203805.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025203805.png)
需要强转，注意，pt 的值是 int 类型的地址并不表示 pt 是    类型的指针
![Pasted image 20241025203834.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025203834.png)

#### 使用 new 来分配内存
- 变量是在编译时分配的有名称的内存
- 指针只是为可以通过名称直接访问的内存提供了一个别名
- 指针真正的用武之地在于，在运行阶段分配未命名的内存以存储值。
![Pasted image 20241025205501.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025205501.jpg)
这段代码的真正含义是定义一个指向 typename 类型的 pointer_name ，存放这个指针变量的地址由 new 向操作系统申请，申请的内存大小由 typename 决定
- 计算机可能由于没有足够的内存无法满足 new 的请求。在这种情况下，new 通常会引发异常
- 在 C++中，值为 0 的指针被称为空指针（null pointer）。C++确保空指针不会指向有效的数据，因此它常被用来表示运算符或函数失败（如果成功，它们将返回一个有用的指针）
- 内存泄漏指：**分配的内存==再也==无法使用了**，分配的内存没有回收 new 一直请求没有回应
对于需要在程序运行时确定存储空间大小的情景，如果使用声明定义数组，则定义大了浪费空间，小了空间溢出，盛情动态数组可以避免这一点
![为数组分配内存通用格式](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025211827.jpg)
#### 使用 delete 删除内存
- 不能使用 delete 释放正常声明变量获得的内存
- 对空指针使用 delete 是安全的
- delete 要删除对应用 new 申请的内存，申请什么样的数据类型的内存就用相应格式删除它
```cpp
int *pointer = new int[500];
pointer[0] = 30;
pointer[1] = 40;
pointer[2] = 50;
pointer[3] = 60;
for (int i = 0; i < 4; i++ ){
    cout << pointer[i] << "\n";
}
delete[] pointer;
// delete pointer; // 申请 int []类型，delete[]清除所有元素，直接删除是未定义行为
for (int i = 0; i < 4; i++ ){
    cout << pointer[i] << "\n";
}
```

#### 指针，数组和指针算术
[C++ Basics \> 指针的步长](C++%20Basics.md#指针的步长)
使用数组指针访问数组中某个元素时，编译器进行如下计算
![先计算数组第2个元素的地址，然后找到存储在那里的值。](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241025212923.jpg)

对数组名称获取其地址时，数组名不会解释为地址，而是第一个元素的地址
对数组名使用取地址运算符时，得到的是**整个数组的地址**
```cpp
short short_array[10];
cout << short_array << endl;
cout << &short_array << endl;
cout << short_array + 1 << endl;
cout << &short_array + 1 << endl;
```
前两行中：从数字上说，这两个地址相同；但从概念上说，`&short_array[0]`（即 ` short_array `）是 2 字节内存块的地址，而 ` &short_array ` 是20 字节内存块地址。因此， ` short_array ` + 1 将地址值加 2，
` &short_array ` + 2 将地址加 20。
换句话说，` short_array ` 是一个 short 指针（* short），而 ` &short_array ` 是一个这样的指针，即指向包含 20 个元素的 short 数组（`short (*) [20]`）。

#### 指针小结
- 对指针解除引用意味着获得指针指向的值，如果指针指向数组，数组表示法的 `pn[0]` 与 `*pn` 是一样的，前者表示访问
- 对于数组中的字符串、用引号括起的字符串常量以及指针所描述的字符串，处理的方式是一样的，都将传递它们的地址。
```cpp
char flower[10]{"sunflower"};
cout << flower << "\tsunflower";
```
cout 中的 flower 传递字符数组中的第一个元素地址，由于元素是 `char[]` 类型，所以打印字符数组大小的字节内容，`“s are red\n”` 是字符串常量，存放在栈区，传递给 cout 的同样是这个常量的地址。cout 对不同类型数据的**统一处理方式**保证了不同对象行为的统一，减少了工作量

对于字符常量数组指针，一般使用 `const` 将指针指向固定，原因是：
- 有些编译器将字符串字面值视为只读常量，如果试图修改它们，将导致**运行阶段**错误。在 C++中字符串字面值都将被视为常量，但并不是所有的编译器都做了这样的修改。
- 有些编译器只使用**字符串字面值**的一个副本来表示程序中所有的该字面值。不能保证字符串字面值被唯一地存储。程序中多次使用同一个**字符串字面量**则编译器将可能存储该字符串的多个副本，也可能只存储一个副本。通过 `const` 修饰变量将禁止字面量指针指向其他位置
- 经常需要将字符串放到数组中。初始化数组时，请使用=运算符；否则应使用 `strcpy()` 或 `strncpy()`
	- 使用 `strcpy()` 时需要注意，超过数组固定长度的字符，函数将字符串中剩余的部分复制到数组后面的内存字节中，这可能会覆盖程序正在使用的其他内存。要避免这种问题，请使用 `strncpy()`。该函数还接受第3个参数—要复制的最大字符数。
	- 如果 `strncpy()` 在到达字符串结尾之前，目标内存已经用完，则它将不会添加空字符。所以应该这样使用该函数
	![Pasted image 20241026091533.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241026091533.jpg)
```cpp
char short_sentence[5];
// strcpy(short_sentence, "hello world");      // 数组溢出，报错
// strncpy(short_sentence, "hello world",4);   // only copy hell\0
strncpy(short_sentence, "hello world",5);   // copy hello
cout << short_sentence << endl;
cout << *(&short_sentence + 1) << endl;     // visit the overflow part memo
```
```cpp
char *getname(void);
int main(){
    char* p_name = getname();
    cout << p_name << " at " << &p_name << endl;
    delete p_name;
}
char * getname(void){
    char name[20];
    cout << "Enter your name : ";
    cin >> name;
    char *pointer = new char[strlen(name) + 1];
    strcpy(pointer, name);
    return pointer;
}
```

#### 指针和结构体
创建结构时，指针只知道结构的地址，不能将成员运算符句点用于结构名，因为这种结构没有名称，C++专门为这种情况提供了一个运算符：箭头成员运算符（−>）
![Pasted image 20241026093657.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241026093657.jpg)
因为 pt 只存储地址并知到地址需要解析 things 大小的内存地址，他并不知道这个内存地址叫什么名字，所以只能使用 `->`

#### 三种管理内存方式
可以参考 [C++ Basics \> 内存分区](C++%20Basics.md#内存分区)
##### 自动存储
在函数内部定义的常规变量使用自动存储空间，被称为自动变量（automatic variable），这意味着它们在所属的函数被调用时自动产生，在该函数结束时消亡。自动变量是一个局部变量，其作用域为包含它的代码块。存储在栈中
##### 静态存储
静态存储是整个程序执行期间都存在的存储方式。使变量成为静态的方式有两种：一种是在函数外面定义它；另一种是在声明变量时使用关键字 `static`
自动存储和静态存储的关键在于：这些方法严格地限制了变量的寿命。变量可能存在于程序的整个生命周期（静态变量），也可能只是在特定函数被执行时存在（自动变量）

##### 动态存储
new 和 delete 运算符提供了一种比自动变量和静态变量更灵活的方法。它们管理了一个内存池，这在 C++中被称为自由存储空间（free store）或堆（heap）。
该内存池同用于静态变量和自动变量的内存是分开的。（可以通过打印自由变量和堆中变量的地址发下两者相差甚远）
与使用常规变量相比，使用 `new` 和 `delete ` 让程序员对程序如何使用内存有更大的控制权。然而，内存管理也更复杂了。
在栈中，**自动添加和删除机制使得占用的内存总是连续的**，但 `new `和 `delete` 的相互影响可能导致占用的自由存储区不连续，这使得跟踪新分配内存的位置更困难。

### 数组的替代品
#### vector
在运行阶段设置 vector 对象的长度，可在末尾附加新数据，还可在中间插入新数据。
vector 类确实使用 new 和 delete 来管理内存，但这种工作是自动完成的。
vector类的功能比数组强大，但付出的代价是效率稍低

#### array
与数组一样，array 对象的长度也是固定的，也使用栈（静态内存分配），而不是自由存储区，因此其效率与数组相同，但更方便，更安全。
#### 三种容器对比
- 无论是数组、vector 对象还是 array 对象，都可使用标准数组表示法来访问各个元素。
- array 对象和数组存储在相同的内存区域（即栈）中，而 vector 对象存储在另一个区域（自由存储区或堆）中
- 可以将 `array`, `vector` 对象赋给另一个 `array`, `vector` 对象；对于数组必须逐元素复制数据。
- 同样的，C++不检查超界错误。
![Pasted image 20241026111511.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241026111511.jpg) 在任何容器中等价于![Pasted image 20241026111718.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241026111718.jpg)
找到a1的指向，向前移两个double元素，并将20.2存储到目的地。将信息存储到数组的外面。
![Pasted image 20241026111920.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241026111920.jpg)
`vector` 和 `array` 对象**默许这种行为**，但也可以通过手动检查避免这种错误，
![Pasted image 20241026111930.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241026111930.jpg)
中括号表示法和成员函数 `at()` 的差别在于，使用 `at()` 时，将在运行期间捕获非法索引，而程序默认将中断。
这种额外检查的代价是运行时间更长，这就是C++让允许您使用任何一种表示法的原因所在。另外，这些类还让您能够降低意外超界错误的概率。例如，它们包含成员函数 `begin()` 和 `end()`，让您能够确定边界，以免无意间超界，这将在第16章讨论。

## 第四章课后作业
### 模板类初始化注意事项
`array<int,5>(m_list) = {1};` 表示用一个已经存在的 `m_list` 数组来初始化 `array` 对象，因为括号表示调用 `array` 类的构造函数，向其中传入一个已经存在的数组初始化
模板类的 `begin()` 之类迭代器并不指向对应位置的元素，进行运算是**会报错的未定义行为**
`int even = m_list.begin() + m_list.end();` 是错误的
### 指针使用注意事项
```cpp
void int_array(void){
    int contend;
    cin >> contend;
    int *array = new int[contend];
    cout << "the int array size : " << sizeof(array); // wrong, return the pointer size, 8 in 64 bit OS
    cout << "\nthe int array size : " << sizeof(*array); // wrong. return the 1st element in array's address, int -> 4
    cout << "\nthe int array size : " << sizeof(*array) * contend;
}
```

# 第五章循环关系和表达式
## 循环
### for 循环的组成部分
#### for 的结构
![Pasted image 20241026151208.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241026151208.jpg)
C++并没有将 ` test-expression ` 的值限制为只能为真或假。可以使用任意表达式，C++将把结果强制转换为 `bool` 类型。因此，值为 0 的表达式将被转换为 `bool` 值 `false`，如果表达式的值为非零，则被强制转换为 `bool` 值 ` true`。
cout 默认将 `bool` 值先转换为 `int` 再显示，可以使用 `ios::boolapha` 或者 `ios_base::boolalpha` 强制显示 `bool` 值

#### 表达式和语句
C++表达式是值或值与运算符的组合，**每个 C++表达式都有值**。
当判定表达式的值这种操作改变了内存中数据的值时，我们说表达式有副作用（side effect）
从表达式到语句的转变很容易，只要加分号即可。
![表达式](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241026153756.jpg)
![语句](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241026153809.jpg)
只要加上分号，所有的表达式都可以成为语句，但不一定有编程意义。
```cpp
int temp = variable + 1; // programmingful
variable +1 ;// nosense
```
编译器**允许没有编程语句的代码语句**，但它没有完成任何有用的工作。程序仅仅是计算和，而没有使用得到的结果，然后便进入下一条语句（智能编译器甚至可能跳过这条语句）。
#### 指针递增递减运算符
指针的加减和正常运算一致，参考 [C++ Basics \> 指针的步长](C++%20Basics.md#指针的步长)

#### 逗号运算符
- 逗号运算符最常见的用途是将**更多的表达式放到 for 循环表达式中**。不过 C++还为这个运算符提供了另外两个特性。
- 它确保先计算第一个**表达式（注意不是语句，逗号连接两个语句可能会报错）**，然后计算第二个表达式（换句话说，逗号运算符是**一个顺序点**）
![Pasted image 20241026192819.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241026192819.jpg)
![Pasted image 20241026192943.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241026192943.png)
使用逗号注意事项：
- 在所有运算符中，逗号运算符的优先级是最低的。
![Pasted image 20241026193037.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241026193037.jpg) 被解释为 ![Pasted image 20241026193042.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241026193042.jpg)
- 在 for 循环中如果使用赋值运算符在第二个参数位置，可能会出现难以察觉的错误
```cpp
int main (){
    int array[8]{1, 1, 1, 1, 0, 1, 1, 1};
    for (int i = 0; array[i] != 0; i++)    {
        cout << array[i] << endl;
    }								// display ahead 4 1,then quit the loop
    // for (int i = 0; array[i] = 1; i++)    {
    //     cout << array[i] << endl;
// }								// assignment the elem to 1,never stop
}
```

#### C++中 C 字符串的比较
- C++中将数组视作数组的地址，如果使用关系运算符来比较它们，将无法得到满意的结果
- 拼接两个字符串需要使用 `strcmp()` 函数来比较。该函数接受两个字符串地址作为参数。这意味着参数可以是指针、字符串常量或字符数组名。`strcmp()` 的返回值是由两个地址指向的要拼接的字符串在 *ascii/或系统编码*中的顺序决定的
- 大写字母将位于小写字母之前。因此，字符串“Zoo”在字符串“aviary”之前。
- 在有些语言（如BASIC和标准Pascal）中，存储在不同长度的数组中的字符串**彼此不相等**。但是C-风格字符串是通过**结尾的空值字符**定义的，而不是由其所在数组的长度定义的。这意味着==两个字符串即使被存储在长度不同的数组中，也可能是相同的==：
![Pasted image 20241026195134.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241026195134.jpg)


### 基于范围的 for 循环
![Pasted image 20241027110744.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241027110744.jpg)
这种形式的`for`循环表示方法意思是将`price`容器中的每一个元素赋值给`x`，直到`prices`结束
### while / do while 循环
在 while 循环后没有函数体情况下使用 `;` 表示创建一个死循环，因为语句块由 `{}` 而不是缩进创建。
可以通过 `#define` 或 `typedef`定义别名
![Pasted image 20241027105856.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241027105856.jpg)

### 循环和文本输入
#### 使用原始 cin 输入
```cpp
int main(){
    char ch;
    int count = 0;
    cout << "Enter characters, then input # to quit : ";
    cin >> ch;
    while(ch != '#'){
        cout << ch;
        ++count;
        cin >> ch;
    }
    cout << endl
         << count << " characters read \n";
    return 0;
}
```
`cin` 会忽略空格和换行，所以在 `cout` 中不会显示空格和回车，也不会被 `count` 计数，可以使用 `cin.get()` 补救，无论是什么字符都会被读取，将 `cin >> ch;` 替换为 `cin.get(ch);`

#### 从文件输入
##### 重定向功能
**重定向符**功能：将符号左边的结果，输出到右边指定的文件中去 
`>` 表示覆盖输出
`>>` 表示追加输出
在 Unix 系统中，可以使用 `CTRL+D` 结束输入，也可以在命令行中使用 `<` 表示从文件输入
![Pasted image 20241027113041.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241027113041.jpg) 将 fishtale 中的文本作为 gofish 程序的输入

##### 模拟EOF(end of file)条件\环境
- 在Unix中，可以在行首按下Ctrl+D来实现；在Windows命令提示符模式下，可以在任意位置按Ctrl+Z和Enter，用于PC的Microsoft Visual C++、Borland C++ 5.5和GNU C++ 都能够识别行首的Ctrl + Z，但用户必须随后按下回车键。总之，很多PC编程环境都将Ctrl+Z视为模拟的EOF，但具体细节（必须在行首还是可以在任何位置，是否必须按下回车键等）各不相同。
- 检测到EOF后，cin将两位（eofbit和failbit）都设置为1。可以通过成员函数eof( )来查看eofbit是否被设置；如果检测到EOF，则cin.eof( )将返回bool值true，否则返回false。同样，如果eofbit或failbit被设置为1，则fail( )成员函数返回true，否则返回false。注意，eof( )和fail( )方法报告最近读取的结果；也就是说，它们在事后报告，而不是预先报告。
- cin 方法检测到 EOF 时，将设置 cin 对象中一个指示 EOF 条件的标记。设置这个标记后，cin 将不读取输入，再次调用 cin 也不管用。对于文件输入，这是有道理的，因为程序不应读取超出文件尾的内容。然而，对于键盘输入，有可能使用模拟 EOF 来结束循环，但稍后要读取其他输入。cin.clear ( ) 方法可能清除 EOF 标记，使输入继续进行。
![cin.fail()可以检测输入文件结束情况](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241027114159.jpg)

#### 旧版本的输入输出
- `getchar()` 和 `putchar()`，它们仍然适用，但是他的工作方式是将字符编码作为 int 值返回；而 cin.get (ch) 返回一个对象，而不是读取的字符。**所以无法显示中文**
- put ( ) 成员只有一个原型—put (char)。可以传递一个 int 参数给它，该参数将被强制转换为 char。C++标准还要求只有一个原型。然而，有些 C++实现都提供了 3 个原型：put (char)、put (signed char) 和 put (unsigned char)。
![Pasted image 20241027121247.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241027121247.png)

get ( ) 的主要用途是能够将 stdio. h 的 getchar ( ) 和 putchar ( ) 函数转换为 iostream 的 cin.get ( ) 和 cout.put ( ) 方法。只要用头文件 iostream 替换 stdio. h，并用作用相似的方法替换所有的 getchar ( ) 和 putchar ( ) 即可。
## 第五章复习题
### 练习题
1. 输入条件循环在进入输入循环体之前将评估测试表达式。如果条件最初为 false，则循环**不会执行其循环==体==**。退出条件循环在处理循环体之后评估测试表达式。因此，即使测试表达式最初为 false，**循环也将执行一次**。（循环执行，并不包括循环体）
2. 循环输入条件和结束条件如果是有副作用的表达式可能会引起难以察觉的错误
![Pasted image 20241027131808.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241027131808.jpg)
它将打印：
![Pasted image 20241027131916.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241027131916.jpg)
原因是循环体最后一次执行之后*再执行一次*`j+=3`

---
下面例子中同理，判断条件和*输出条件*都是有副作用的表达式，会改变结果
![Pasted image 20241027132036.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241027132036.jpg)
它将输出 `6\n8`

8. 在C++中，逗号 `,` 是一个运算符，它会先计算左边的表达式，然后计算右边的表达式，并且整个表达式的值是右边表达式的值。![Pasted image 20241027132746.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241027132746.jpg) 会先计算 1，这个表达式的值，返回 1 结果，然后计算后面表达式结果，0 开头的数字默认为 8 进制，所以 `024 = 20`，所以这个表达式表示将 20 赋值给 `x`
### 编程练习
3. 编写一个要求用户输入数字的程序。每次输入后，程序都将报告到目前为止，所有输入的累计和。当用户输入 0 时，程序结束。
使用下面这段代码看似没错
```cpp
void ask_for_input(){
    int input;
    int sum = 0;
    while(true){
        cin >> input;
        if (input == 'q'){
            break;
        }
        sum += input;
        cout << sum << endl;
    }
}
```
- 声明 `input` 为 `int` 类型，但通过键盘输入 `q` 是一个字符串，没有进行*类型转换*使 cin 读取错误，错误的字符会**留在缓冲区**中，在下一次 `cin` 时继续输入，继续错误，导致==死循环==
- 使用 `stoi()` 将字符串类型转换为 `int` 类型
- 如果去掉 if 输入验证会出现 `cout << sum << endl;` 之后，最后输入的数字仍然留在缓冲区中，在使用 `CTRL+C` 强制退出（结束本次循环） `endl` 刷新缓冲区额外计算一次
可以使用 `clear()`，`ignore()` 来刷新缓存
```cpp
if (cin.fail()){
	flowing_input = cin.get();
	cin.clear();
	cin.ignore(numeric_limits<streamsize>::max(), '\n');
}
```
- `cin.ignore(numeric_limits<streamsize>::max(), '\n');` 中，`cin. igore` 是[忽略输入输出流中直到遇到特定字符的函数](C++%20Runoob%20Tutoral.md#cin.%20ignore%20()%20函数)，接受两个参数。
- 当用户输入的数据类型与程序期望的类型不匹配时，`std::cin` 会进入一个错误状态。`std::cin` 会设置一个错误标志，表示这段流有问题，中断传输。`clear` 解除这个标志，流可以被继续接受或修改
- `cin.clear()` 一般后面跟 `cin.ignore()` 用来清除输入队列中从错误字符后的内容，保证继续输入
完整代码：[C++ practice case \> 第五章编程练习题](../../../Files%20&%20LongText/Long%20code/C++%20practice%20case.md#第五章编程练习题)

# 第六章分支语句和逻辑运算符
## if 语句
简易加密语句：
```cpp
int main(){
    char ch;
    cout << "input : \n";
    cin.get(ch);
    while (ch!= '.'){
        if(ch=='\n')
            cout << ch;
        else
        	cout << ++ch << "\t";
            cout << ch+1 << "\t";
        cin.get(ch);
    }
    cout << "\n plz excuse the slight confusion .";
}
```
1. **字符递增**：`++ch` 会将 `ch` 的值增加1，然后返回增加后的值。这意味着如果 `ch` 原本是字符 `'a'`，它的ASCII值是97，那么 `++ch` 会将 `ch` 变为98，对应的字符是 `'b'`。
2. **字符加法**：`ch + 1` 不会改变 `ch` 的值，而是计算 `ch` 的当前值加上1的结果，并返回这个结果。因此，如果 `ch` 是 `'a'`，`ch + 1` 会计算97 + 1，得到98，但是 `ch` 本身仍然是 `'a'`。
3. 使用 `cout << ++ch` 时，你首先递增 `ch` 的值，然后输出新的值。所以如果 `ch` 原来是 `'a'`，输出将是 `'b'`。但是，当你使用 `cout << ch + 1` 时，你只是输出 `ch` 当前值加1的结果，**而不会改变 `ch` 本身的值**。因此，如果 `ch` 仍然是 `'a'`，输出将是字符 `'b'` 的ASCII值，即数字99。

---
- 将 `variable == value` 反转为 `value == variable`，以此来捕获将相等运算符误写为赋值运算符的错误。可以防止 `if (myNumber == 3)` 写成 `if (myNumber = 3)` 的情况。因为 ` if (3 = myNumber)` 少写等号是变量赋值给常量，编译报错，可被发现，反之不能
## 逻辑表达式
---
`||` 和 `&&` 的优先级比关系运算符低，`||` 和 `&&` 运算符是个顺序点（sequence point）。也是说，先修改左侧的值，再对右侧的值进行判定
!运算符的优先级高于所有的关系运算符和算术运算符。因此，要对表达式求反，必须用括号将其括起
![Pasted image 20241027175049.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241027175049.jpg)
C++确保程序从左向右进行计算逻辑表达式，并在**知道答案后立刻停止**。例如，假设有下面的条件：![Pasted image 20241027175259.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241027175259.jpg)

- 标识符and、or和not都是C++保留字，可以将他们用于逻辑运算符位置，在 C 中需要使用头文件iso646.h
## 字符函数库 cctype
C++从C语言继承了一个与字符相关的、非常方便的函数软件包

| 函 数 名 称     | 返 回 值                                            |
| ----------- | ------------------------------------------------ |
| isalnum( )  | 如果参数是字母数字，即字母或数字，该函数返回true                       |
| isalpha( )  | 如果参数是字母，该函数返回true                                |
| iscntrl( )  | 如果参数是控制字符，该函数返回true                              |
| isdigit( )  | 如果参数是数字（0～9），该函数返回true                           |
| isgraph( )  | 如果参数是除空格之外的打印字符，该函数返回true                        |
| islower( )  | 如果参数是小写字母，该函数返回true                              |
| isprint( )  | 如果参数是打印字符（包括空格），该函数返回true                        |
| ispunct( )  | 如果参数是标点符号，该函数返回true                              |
| isspace( )  | 如果参数是标准空白字符，如空格、进纸、换行符、回车、水平制表符或者垂直制表符，该函数返回true |
| isupper( )  | 如果参数是大写字母，该函数返回true                              |
| isxdigit( ) | 如果参数是十六进制数字，即0～9、a～f或A～F，该函数返回true               |
| tolower( )  | 如果参数是大写字符，则返回其小写，否则返回该参数                         |
| toupper( )  |                                                  |
## switch 语句
- switch 并不是为处理取值范围而设计的。switch 语句中的每一个 case 标签都必须是一个单独的值。另外，这个值必须是整数（包括 char），因此 switch 无法处理浮点测试。另外 case 标签值还必须是常量。如果选项涉及取值范围、浮点测试或两个变量的比较，则应使用 if else 语句。
- Switch 在跳转到相应 case 位置执行相应代码之后并不会停止，**想要跳出只能使用 break**
- 通常，cin 无法识别枚举类型（它不知道程序员是如何定义它们的），但使用枚举类型作为 *Switch 标签和需要运算*时，枚举类型会自动**提升为**整形，
![Pasted image 20241027191724.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241027191724.png)
- 如果既可以使用 if else if 语句，也可以使用 switch 语句，则当选项不少于 3 个时，应使用 switch 语句。
## break 和 continue
continue 语句导致该程序跳过循环体的剩余部分，但**不会跳过循环的更新表达式**。
for 中，continue 语句使程序直接跳到更新表达式处，==然后跳到测试表达式处==。
while 中，continue 将使程序直接跳到测试表达式处

## 读取数字的循环
```cpp
// program 6.13
void get_data(){
    const int max_amount = 5;
    double total = 0;
    double avg = 0;
    array<double, max_amount> weight{0};
    for (int i = 0; i < max_amount; i++){
        cout << "input the weight of "<< i << " fish you got : ";
        while(!(cin >> weight[i])){
            cout << "Invalid input. Please enter a number." << endl;
            cin.clear(); // 清除错误标志
            cin.ignore(numeric_limits<streamsize>::max(), '\n'); // 忽略剩余输入
        }
        total += weight[i];
    }
    avg = total / max_amount;
    if (total == 0)
        cout << "you ve got no fish ";
    else
        cout << "total : " << total << "\tavg : " << avg;
}
```
## 简单文件输入输出
### 将结构体内容以二进制形式存储在文件中
源代码： [C++ practice case \> 读写二进制文件](../../../Files%20&%20LongText/Long%20code/C++%20practice%20case.md#读写二进制文件)
函数部分详解：
#### 写入部分
```cpp
bool writeRecordsToFile(const string& filename, const vector<Record>& records) {
    ofstream file(filename, ios::out | ios::binary); // set fstream file obj as out & binary module
    if (!file) {
        return false;
    }
    for (const auto& iteration_record : records) {
        file.write(reinterpret_cast<const char*>(&iteration_record.id), sizeof(iteration_record.id));
        // Write the length of the name
        size_t nameLength = iteration_record.name.size();
        file.write(reinterpret_cast<const char*>(&nameLength), sizeof(nameLength));
        // Write the name characters
        file.write(iteration_record.name.data(), nameLength);
        file.write(reinterpret_cast<const char*>(&iteration_record.value), sizeof(iteration_record.value));
    }
    file.close();
    return true;
}
```
- `fstream` 对象的 `write` 模式接受一个字符串类型的指针和需要写入内容的**内存大小**，所以使用 `reinterpret_cast` 将 `int` 类型地址转换为 `char` 类型的地址， `sizeof()` 计算容量
- 由于 `name` 是 string 可变容器，写入时需要动态计算它的**大小**，`string. size ()` 返回的是字符串的**长度（即有几个字符）**。
- 向二进制文件中写入数据时，`int`，`double` 都是内存大小固定的数据，在==读取文件==时可以从文件中获取需要解析多长内存的内容，而内容带小可变的数据需要先写入大小，再写入内容。在读取时才可以被正确解析
- `string` 类型的 `.data()` 方法返回字符串类型对象中指向字符串中**字符数据**的指针


#### 读取部分
```cpp
bool readRecordsFromFile(const string& filename, vector<Record>& records) {
    ifstream file(filename, ios::in | ios::binary);
    if (!file) {
        return false;
    }
    Record record;
    while (file.read(reinterpret_cast<char*>(&record.id), sizeof(record.id))) {
        // Read the length of the name
        size_t nameLength;
        file.read(reinterpret_cast<char*>(&nameLength), sizeof(nameLength));
        record.name.resize(nameLength);
        // Read the name characters
        file.read(&record.name[0], nameLength);
        file.read(reinterpret_cast<char*>(&record.value), sizeof(record.value));
        records.push_back(record);
    }
    file.close();
    return true;
}
```
- 同样按照二进制读取，用 `while` 读取直到读取不到 id 为止
- `file_read` 第一个参数为字符地址（所以类型转换为 `<cha*>`），单单使用 `&record.name` 指标是 `string` 类型地址，需要指向第一个字符，并且使用 `name_lenght` 控制长度
- 每读取一遍 record. dat 文件中的内容之后，将内容放入 `loaded_date` 的 `vector` 数组中，最后通过 for 循环打印出来

#### 调用部分
```cpp
writeRecordsToFile("records.dat", records)// write record struct into records.dat
vector<Record> loadedRecords;	// creat vector loadedrecords
if (readRecordsFromFile("records.dat", loadedRecords)) {
    cout << "Records read from file successfully." << endl;
    for (const auto& iteration_record : loadedRecords) {
        cout << "ID: " << iteration_record.id << "\tName: " << iteration_record.name << "\tValue: " << iteration_record.value << endl;
    }
} else {
    cout << "Failed to read records from file." << endl;
}
```
- 循环读取即可
## 第六章复习题
### 练习题
- 在两个条件分支的涉及范围有重叠的情况下 `if-else` 效率比多 `if` 更高
![325](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241028205720.png)
ch 为 `char` 类型， ++ch 和 ch + 1 得到的数值相同。但++ch 的类型为 char，将作为字符打印，而 ch + 1 是 int 类型（因为将 char 和 int 相加），将作为数字打印。
- !! x 是否与 x 相同取决于 `x` 的类型，如果 `int x = 10`， `!x = 0`， `!!x = 1`，如果 `x` 为 `bool` 类型，则 `x` 与 `!!x` 相同
### 编程练习
在 while 循环中使用**变量初始化的方式获取键盘输入**是注意优先级，没有适当的括号可能错误
```cpp
void first(){
    char ch;
    while((ch = cin.get()) != '@'){
        if(!isdigit(ch)){
            if(isupper(ch)){
                ch = tolower(ch);
            }else if(islower(ch)){
                ch = toupper(ch);
            }
        }
        cout << ch ;
    }
    cout << "done";
}
```
- `while((ch = cin.get()) != '@')` 如果写成 `while(ch = cin.get() != '@')` 则比较运算符优先级高于赋值运算符, 导致等式从右向左运算
- 