---
number headings: first-level 1, max 6, contents ^TOC, 1.1.
---
[C++ 教程 | 菜鸟教程 (runoob.com)](https://www.runoob.com/cplusplus/cpp-tutorial.html)
# 零碎知识
### \n 和 endl 区别
`std:: endl` 输出一个换行符，调用 flush 函数并立即刷新缓冲区，把缓冲区里的数据写入文件或屏幕.考虑效率就用 '\n'。在没有必要刷新输出流的时候应尽量使用 cout << '\n', 过多的 endl 是影响程序执行效率低下的因素之一。
`/n` 仅仅只是输出换行符，还需要用""括起
### 命令行终端中停留
在终端编译并运行文件时，黑框闪现问题解决可以在代码中包含头文件 `stdlib.h`，并在主程序中加入 `system("pause");` 可以在程序运行完以后使黑框暂停显示，等待输入，而不是闪退。
### 头文件信息
1、`.cpp `文件和 `.h` 文件的区别：
cpp文件用于存放类的定义 definition，h 文件用于存放类的声明 declaration。
在头文件中声明了一个函数或者类，需要定义或者使用这个函数或者类时，需要在 cpp 文件中 include 这个头文件
2、include 头文件时 `<>` 和 `""` 的区别：
`<>`：会先去系统目录中找头文件，如果没有找到再去当前目录下寻找，像是标准的头文件，如 `stdio.h`，`stdlib.h` 使用这个方法。
`""`：会先在当前目录下寻找，如果找不到再去系统目录下寻找，适用于自己定义的头文件
### 数学计算
指数函数
- `double exp(double x);`：计算自然对数的底数 \(e\) 的 \(x\) 次幂，即 \(e^x\)。
对数函数
- `double log(double x);`：计算 \(x\) 的自然对数（以 \(e\) 为底）。
- `double log10(double x);`：计算 \(x\) 的以 10 为底的对数。
- `pow(base, exponent)` 计算 base 的 exponent 次方。（python 中用\*\*计算指数）
三角函数
- `double sin(double x);`：计算 \(x\)（弧度）的正弦值。
- `double cos(double x);`：计算 \(x\)（弧度）的余弦值。
- `double tan(double x);`：计算 \(x\)（弧度）的正切值。
注意事项
- 在使用三角函数时角度需要转换为弧度。C++中没有直接处理角度的三角函数，但使用 `M_PI` 宏（定义在 `<cmath>` 中的常量）表示π的值，然后用它来转换角度到弧度。公式为`弧度 = 度 × (π / 180)`
- `<cmath>` 库中的函数默认返回值类型为 `double`。类型转换公式：
  `转换后的变量名 = static_cast<需要转换成的类型名>(需要转换的变量)`

使用 `<cmath>` 库可以方便地进行各种数学计算，包括指数、对数和三角函数的计算。
# C++环境设置
程序 g++ 是将 gcc 默认语言设为 C++ 的一个特殊的版本，链接时它自动使用 C++ 标准库而不用 C 标准库。通过遵循源码的命名规范并指定对应库的名字，用 gcc 来编译链接 C++ 程序是可行的
在命令行中编译源代码方式是先创建好cpp文件
在命令行中执行
> $ g++ helloworld.cpp
- 未生成可执行文件exe时编译器默认采用.out文件并命名为a.out
- 使用-o表示规定文件可执行文件的名称

> $ g++ helloworld.cpp -o helloworld$ g++ helloworld.cpp -o helloworld  
>   
> 表示将cpp代码文件转换为文件名为helloworld的exe可执行文件  
- 一次性编译多个文件,只需要在文件中间使用空格即可

> $ g++ runoob1.cpp runoob2.cpp -o runoob
- 常用gcc命令
[https://www.runoob.com/cplusplus/cpp-environment-setup.html](https://www.runoob.com/cplusplus/cpp-environment-setup.html)
# C++基本概念
**基本概念**
- **对象 -** 对象具有状态和行为。例如：一只狗的状态 - 颜色、名称、品种，行为 - 摇动、叫唤、吃。对象是类的实例。
- **类 -** 类可以定义为描述对象行为/状态的模板/蓝图。
- **方法 -** 从基本上说，一个方法表示一种行为。一个类可以包含多个方法。可以在方法中写入逻辑、操作数据以及执行所有的动作。
- **即时变量 -** 每个对象都有其独特的即时变量。对象的状态是由这些即时变量的值创建的。
可以参考[python语法理解](https://www.notion.so/Python-acd35004ede9496a86c2aedac91622b4?pvs=21)
**分号和语句块**
- 每一个逻辑语句结束后;分割
- 使用大括号括起的逻辑连接语句叫语句块
- 一行上可以放多个语句,只要他们之间以分号相隔
    `x = y; y = y+1; add(x, y);`
**三元字符组**
使用转义字符或者直接书写不方便时使用
g++仍默认支持三字符组，但会给出编译警告. 最新c++标准中不支持自动替换三元字符组,gcc会给出编译警
**代码注释**
可以再注释中添加注释, 跨行注释中前用* 开头
- **基本数据类型**
 1. 整数类型（Integer Types）：
    - `int`：用于表示整数，通常占用4个字节。
    - `short`：用于表示短整数，通常占用2个字节。
    - `long`：用于表示长整数，通常占用4个字节。
    - `long long`：用于表示更长的整数，通常占用8个字节。
2. 浮点类型（Floating-Point Types）：
    - `float`：用于表示单精度浮点数，通常占用4个字节。
    - `double`：用于表示双精度浮点数，通常占用8个字节。
    - `long double`：用于表示更高精度的浮点数，占用字节数可以根据实现而变化。
3. 字符类型（Character Types）：
    - `char`：用于表示字符，通常占用1个字节。
    - `wchar_t`：用于表示宽字符，通常占用2或4个字节。
    - `char16_t`：用于表示16位Unicode字符，占用2个字节。
    - `char32_t`：用于表示32位Unicode字符，占用4个字节。
4. 布尔类型（Boolean Type）：
    - `bool`：用于表示布尔值，只能取`true`或`false`。
5. 枚举类型（Enumeration Types）：
    - `enum`：用于定义一组命名的整数常量。
6. 指针类型（Pointer Types）：
    - `type*`：用于表示指向类型为`type`的对象的指针。
7. 数组类型（Array Types）：
    - `type[]`或`type[size]`：用于表示具有相同类型的元素组成的数组。
8. 结构体类型（Structure Types）：
    - `struct`：用于定义包含多个不同类型成员的结构。
9. 类类型（Class Types）：
    - `class`：用于定义具有属性和方法的自定义类型。
10. 共用体类型（Union Types）：
    - `union`：用于定义一种特殊的数据类型，它可以在相同的内存位置存储不同的数据类型。
    C++中宽字符类型是`wchar_t`。`wchar_t`类型用于存储宽字符，它通常用于支持多语言和特殊字符集。`wchar_t`的大小足以存储任何特定平台的字符集中的任何字符。
    C++提供了`<cwchar>`和`<cwstring>`头文件，其中定义了宽字符和宽字符串的处理函数。
    ```cpp
    \#include <cwchar>
    wchar_t myWideChar = L'α'; // L前缀表示这是一个宽字符字面量
    ```
## 不重要的查阅内容
| 类型                 | 位          | 范围                                                                                     |
| ------------------ | ---------- | -------------------------------------------------------------------------------------- |
| char               | 1  <br>个字节 | -128  <br>到 127 或者 0 到 255                                                             |
| unsigned char      | 1 个字节      | 0 到 255                                                                                |
| signed char        | 1 个字节      | -128 到 127                                                                             |
| int                | 4 个字节      | -2147483648 到 2147483647                                                               |
| unsigned int       | 4 个字节      | 0 到 4294967295                                                                         |
| signed int         | 4 个字节      | -2147483648 到 2147483647                                                               |
| short int          | 2 个字节      | -32768 到 32767                                                                         |
| unsigned short int | 2 个字节      | 0 到 65,535                                                                             |
| signed short int   | 2 个字节      | -32768 到 32767                                                                         |
| long int           | 8 个字节      | -9,223,372,036,854,775,808 到 9,223,372,036,854,775,807                                 |
| signed long int    | 8 个字节      | -9,223,372,036,854,775,808 到 9,223,372,036,854,775,807                                 |
| unsigned long int  | 8 个字节      | 0 到 18,446,744,073,709,551,615                                                         |
| float              | 4 个字节      | 精度型占4个字节（32位）内存空间，+/- 3.4e +/- 38 (~7 个数字)                                             |
| double             | 8 个字节      | 双精度型占8 个字节（64位）内存空间，+/- 1.7e +/- 308 (~15 个数字)                                         |
| long long          | 8 个字节      | 双精度型占8 个字节（64位）内存空间，表示 -9,223,372,036,854,775,807 到  <br>9,223,372,036,854,775,807 的范围 |
| long double        | 16 个字节     | 长双精度型 16 个字节（128位）内存空间，可提供18-19位有效数字。                                                  |
| wchar_t            | 2 或 4 个字节  | 1 个宽字符                                                                                 |
**typedef声明**
为已有的类型取一个新名字
```cpp
typedef type newname; 
typedef int feet;
feet distance;
// int类型内容仍然是声明一个变量为整数型,但是名字已经变为feet
```
## 变量声明
### 声明
- 和[[C++ prime plus#函数原型]]类似, 编译器在不需要知道变量完整细节的情况下也能继续进一步的编译。变量声明只在编译时有它的意义. 在[[C++ prime plus#^97a565|第一次遍历]]中被编译器使用
- 使用 `extern` 关键字在任何地方声明一个变量( 和const 声明常量一样 )。虽然您可以在 C++ 程序中多次声明一个变量，但变量只能在某个文件、函数或代码块中被**定义一次**。
- 变量不能**在同一作用域中**被定义两次，因为它们在编译时分配内存。不能一个变量两个内存地址
- 函数和类可以在多个地方声明，**但定义只能有一次**，以避免链接错误。
- 所有数字型变量声明(未初始化)默认值都为0 ,`char`默认为'`\0'`,指针`pointer`为`NULL`

声明变量告诉编译器有这一个变量，通过定义初始化值[[操作系统]]分配内存
C++ 中有两种类型的表达式：

### 作用域和类型规范
[[C++ Runoob Tutoral#^e692ff|左值和右值]]
- **左值（lvalue）** 指向内存位置的表达式被称为左值（lvalue）**表达式**。左值可以出现在赋值号的左边或右边。变量本身也是一个表达式, 返回变量中存储的值
- **右值（rvalue）：** 术语右值（rvalue）指的是存储在内存地址的数值。右值是不能对其进行赋值的表达式，也就是说右值可以出现在赋值号右边，但不能出现左边。这也解释了为什么变量给变量赋值合法
变量是左值，因此可以出现在赋值号的左边。数值型的字面值是右值，因此不能被赋值，不能出现在赋值号的左边。下面是一个有效的语句：
`int g = 20;`
但是下面这个就不是一个有效的语句，会生成编译时错误：
`10 = 20;`

**类作用域变量声明**
静态成员变量是类的所有对象共享的变量。
```cpp
class MyClass {
public:
    static int staticVar; // 静态成员变量
};
```
非静态成员变量是每个类对象的实例都拥有的变量。
```cpp
class MyClass {
public:
    int nonStaticVar; // 非静态成员变量
};
```
在函数中定义的 static 变量是局部静态变量，在函数执行完毕之后销毁

### const 的作用
#const声明作用 #const作用 
声明 `const` 表示 const 所在的作用域不会被操作改变, #const作用 表示“常”，限定修饰内容不能修改（不是内存地址不能修改），为只读状态，
- `const` 关键字在C++中的作用是**声明变量为常量**，这意味着一旦该变量被初始化后，它的值就不能被修改。并不保证对象的内存地址（每次程序启动由操作系统分配）在程序运行过程中不变。在使用动态内存分配（如 `new` 和 `delete`）时 `const` 修饰的对象仍然可以被移动或重新分配内存地址 ^0ca58b
```cpp
int &ref = 10;//是不被允许的，引用的初始化必须是一个已经存在的对象，10是字面量，os不为他分配内存
const int &ref = 10;//使用const创建一个临时常量引用，10在编译器中被音隐式创建成了一个常量，分配内存，所以才能被引用初始化（绑定）
//这样写也是为了防止误操作将ref更改
```
#### 常函数
- const 修饰成员函数：当 `const` 用于成员函数的末尾时，它表示该成员函数不会修改调用它的对象的状态。这意味着在 `const` 成员函数中，你不能修改任何非 `mutable` 成员变量的值。指针指向的内存空间的数据不能修改，除了 mutable 修饰的变量
```cpp
class Person{
public:
    Person(){
        m_A = 0;
        m_B = 0;
    }
    void ShowPerson() const{//加const表示类的对象不能修改类中定义的源数据，即类内存地址的数据
        this->m_B = 100;//常函数中不允许修改类的属性值，
    }
    int m_A;
    int m_B;
    mutable int m_B;//定义一样，但修饰表示允许被常函数修改
};
*this //普通this指针写法，指向本身
*const this //指针本质是常量，指针指向（也就是常量值--指向内存地址编号不支持修改，）
const class_name *const this //指针指向内存地址的值也不允许修改
```
#### 常对象
同样，不允许修改指针指向内存地址位置**存储的值**
常对象不允许修改**类的对象**的属性，如果能够调用非 const 函数，非 const 函数可修改对象的属性，常对象调用非 const 函数**间接修改**了属性，违反常对象特点
```cpp
const Person p;//创建常对象
cout << person.m_A << endl;
//person.mA = 100; //常对象不能修改成员变量的值,但是可以访问
person.m_B = 100; //但是常对象可以修改mutable修饰成员变量

//常对象访问成员函数
person.MyFunc(); //常对象只能调用const的函数
```
## 变量的作用域
和python[[Python Basics#命名空间]]\变量类型[[Python Basics#变量的作用范围]]差不多
- **局部/全局/块/类  作用域**：在函数内部声明的变量具有局部作用域，它们只能在  **函数内部/程序中任何函数/代码块内部/所有成员函数**  访问。局部变量在函数每次被调用时被创建，在执行完后被销毁。
- 局部变量和全局变量的名称可以相同，但是在函数内，局部变量的值会覆盖全局变量的值。
**代码块定义**: 由一对花括号 `{}` 包围起来的语句序列。函数体就是代码块,但是函数名后的参数列表中的内容\函数名不是代码块
## 各种符号类型补充
一起记录在[[C++ prime plus#修饰符类型]]
# C++语法
## 循环
### 基本循环结构 
while循环
```cpp
while(condition)//任意非零condition都为true
{
   statement(s);
}
```
dowhile 运转先执行一次循环体
```cpp
while(condition){
	body;
}
```
for循环
```cpp
for ( init; condition; increment )
{
   statement(s);
}
```
for允许简单的迭代
```cpp
for (auto &x : my_array) {
    x *= 2;
    cout << x << endl;  
}
```
- 符号 `&` 表示 x 是一个引用变量，将使用 my_array 数组的原始数据类似于python中的`for i in myarray`, array中的每个元素都被赋予i的名字,但是**python没有引用元素,不会更改内容** ^0f9f93
- **声明方式**：使用 `&` 符号来声明一个引用变量。引用变量是对已存在变量的别名，一旦引用被初始化，它就始终指向同一个对象，不能重新指向另一个对象。
- **使用方式**：引用必须在声明时初始化，一旦初始化后，它就与原始变量绑定，不能更改。
- **内存分配**：引用本身不占用额外的内存空间，它只是原始变量的一个别名。
- 因为 x 直接引用数组元素，而不是创建它们的副本。所以这段代码运行完之后myarray中的内容会被改变, 然而不加`&`符号就**不会引用,而是创建副本**
- for 语句中的三个表达式可部分或全部省略，但两个分号不能省略。
- 可以在`init`中直接初始化变量`for (int x : { 1, 2, 3, 4, 5 })`

### 冒泡排序
**步骤原理**
1. 比较相邻的元素。如果第一个比第二个大，就交换他们两个。
2. 对每一对相邻元素做同样的工作，执行完毕后，找到第一个最大值。
3. 重复以上的步骤，每次比较次数-1，直到不需要比较
4. 第 i 轮对比会找到第 i 个大的数
```cpp
//代码实现
using namespace std;
int main(){
    int array[] = {2, 4, 7, 45, 23, 52, 76};
    int size = sizeof(array)/sizeof(array[0]);
    for (int i = 0; i < size - 1;i++){//控制总循环次数
        for (int j = 0; j < size - 1 - i;j++){//控制交换动作
            if (array[j]>array[j+1]){
               //调整if条件可写成反冒泡排序(从大到小排序)
                int temp = array[j];
                array[j + 1] = array[j];
                array[j] = temp;
            }
        }
    }
    for (int k = 0; k < size - 1;k++){
        cout << array[k] <<"\t";
    }
    return 0;
}
```

## 判断
### if-else
```cpp
if(boolean_expression){
   // 如果布尔表达式为真将执行的语句
}
else if(boolean_expression3){  //可选
	//从上到下一旦匹配成功后面的都不会被执行
} 
else(boolean_expression2){  //else可选
   // 如果布尔表达式为假将执行的语句
}  //else一定在最后
```
只用一小段判断语句, 可以简写if语句为`if(expression) executeCode;`
代码块层级不明显时可以如python一般使用缩进而不用`{}`括起
### switch case
switch 语句用于基于不同的条件执行不同的代码块，它通常用来**替代一系列的 if-else** 语句
![[Pasted image 20240805092821.jpg|202]]
- 即使 `default` 分支位于 `switch` 语句的中间位置，它仍然只会在没有其他 `case` 匹配时执行。 ^e1df0e
- 通常建议在每个 `case` 分支的末尾使用 `break` 语句，以防止代码执行“穿透”到下一个 `case` 分支。如果缺少 `break`，程序将继续执行下一个 `case`，这叫做"贯穿"。但 `default` 分支不需要 `break`，因为它是 `switch` 语句的最后一个部分。
- **执行时机**: 只有当没有任何 `case` 标签匹配时，`default` 分支才会执行。如果有一个 `case` 标签匹配，即使没有 `break` 语句，`default` 分支也不会执行。
- Switch case 执行效率比 if else 语句要高，但是 Switch 的参数只能是字符型（单个字符，可以推断出也是转换为数字编码来判断的）或整形
```cpp
#include <iostream>
int main() {
    int value = 3;
    switch (value) {
        case 1:
            std::cout << "Value is 1" << std::endl;
            break;
        case 2:
            std::cout << "Value is 2" << std::endl;
            break;
        default:
            std::cout << "Value is neither 1 nor 2" << std::endl;
            // 这里可以执行其他代码
    }
    return 0;
}
```
### 条件并列
使用 `&&` 来表示逻辑与（AND），使用 `||` 来表示逻辑或（OR），使用 `!` 来表示逻辑非（NOT），逻辑符号放在 bool 语句中即可，[[Python Basics#^80d212|python]] 中是使用关键字不同
## 函数
**函数实现**：执行函数体代码的过程叫函数实现
定义同main函数, 函数声明方法如[[C++ prime plus#函数原型]]
**函数声明补充**
在函数外部定义函数时一定要注意函数头要和声明完全一样，即便声明中写了，定义中不能不写函数返回类型，不然会报错
![[Pasted image 20240811001027.png|375]]
```cpp
// 函数声明
int max(int num1, int num2);
// 定义函数
int max(int num1,float num2){
.......
}
```
声明只是强调其存在,对其变量并不在乎,,调用和定义时参数列表与原型冲突也无妨  但参数列表中一定要声明参数类型
### 传参方式
**传值调用**: 该方法把参数的实际值赋值给函数的形式参数。在这种情况下，修改函数内的形式参数对实际参数没有影响。
```cpp
void increment(int value) {
    value++;
}
int main() {
    int a = 10;
    increment(a);//这里仅仅是将10内容代替a的位置,将字面量直接作为参数
    std::cout << a << std::endl; // 输出 10
    return 0;
}
```
即使 `increment` 函数内部将 `value` 参数增加1，实际参数 `a` 的值也不会改变，因为 `value` 是 `a` 的一个副本。其实这也是C++静态变量的一种体现---不允许修改变量值
**但是**: 通过`volatile`可以声明变量可以被外部修改[[C++ prime plus#限定字符]]
**指针调用,** :类似于&的[[C++ Runoob Tutoral#^0f9f93|引用变量]]但又不是, 使用`*`标记的变量中存储的是变量的地址, 指向内存中的一块区域. 相当于创建了一个新的变量, 同时也在内存中占用空间
**引用调用**: 通过&[[C++ Runoob Tutoral#^0f9f93|引用变量]],会影响源数据, 也节省可空间和时间开销. 声明变量时才能表示该变量为引用类型
### 参数默认值
同python一样可以再参数列表中声明定义函数, 作为参数默认初始化, 函数体中直接使用
### lambda函数
完整表达式为`[capture](parameters)->return-type {body}`
- **capture**：捕获列表，用于指定Lambda函数可以访问的外部变量, 方便函数体中调用。可以是空的，也可以包含特定的变量( 在其中声明变量 )    捕获方式默认为**值捕获**`=` , 任何被使用到的外部变量都隐式地以传值方式加以引用，变量前加 `&` 都隐式地以引用方式加以引用。
- **parameters**：参数列表，与普通函数的参数列表相同。
- **return-type**：返回类型，可以省略，**编译器**自动推导(不在运行过程推导,不占用计算资源)。
- **body**：函数体，包含Lambda函数的实现。

其中没有返回值可以不写`return-type`
lambda 可以使用 this 指针。但对于[]的形式，如要用 this 指针，必须显式传入：`[this]() { this->someFunc(); }();`
# 数组
C++ 支持**数组**[[数据结构]]，它可以存储一个固定大小的**相同类型**元素的**顺序**集合。它往往被认为是一系列**相同类型**的变量。
数组的声明并不是声明一个个单独的变量，比如 number0、number1、...、number99，而是声明一个数组变量，比如 numbers，然后使用 numbers[0]、numbers[1]、...、numbers[99] 来代表一个个单独的变量。数组中的特定元素可以通过**索引**[[C++ prime plus]]中称为偏移位置   访问
所有的数组都是由**连续的内存位置**组成。最低的地址对应第一个元素，最高的地址对应最后一个元素。
## 原生数组和标准库数组（容器）
^ebc697

**原生数组**指使用C风格数组声明方式创建的数组，如`int array[5] = {1, 2, 3, 4, 5};`
这种数组在声明时需要指定大小，并且其**大小**是固定的，不能动态改变。其中元素内容只能通过定义**外部**函数方法改变, 因为他仅仅是一个连续内存区域的引用，可以看做不是一种数据类型
**标准库容器**是使用标准库文件创建的数组，如
- `std::vector`：动态数组容器
- `std::array`：固定大小的数组容器
- `std::list`：双向链表容器，支持快速的插入和删除操作。
- `std::deque`：双端队列容器，支持在两端快速插入和删除。
- `std::forward_list`：单向链表容器，用于高效地在序列的任何位置插入和删除元素。
- `std::queue`：队列容器，支持先进先出（FIFO）的数据管理。
- `std::priority_queue`：优先队列容器，允许访问最大或最小元素。
- `std::stack`：栈容器，支持后进先出（LIFO）的数据管理。

提供更多的功能（仅 vector 和 array），如
共有成员方法
- `size()`：返回容器中元素的数量。
- `empty()`：检查容器是否为空。
- `operator[]`：通过索引访问容器中的元素。
- `begin()` 和 `end()`：返回指向容器首元素和尾后元素的迭代器。
- `front()`：返回容器中第一个元素的引用。
- `back()`：返回容器中最后一个元素的引用。
 独有成员方法
- **`std::vector` 独有的成员方法**：
    - `push_back(T&& x)`：在向量末尾添加一个元素。
    - `pop_back()`：移除向量末尾的元素。
    - `resize(size_type sz)`：改变向量的大小。
    - `capacity()`：返回向量的容量。
    - `reserve(size_type n)`：预留足够的空间以存储指定数量的元素，避免多次重新分配内存。
- **`std::array` 独有的成员方法**：
    - `fill(const T& x)`：将所有元素设置为指定的值。
    - `swap(std::array& other)`：交换两个数组的内容。
    - `data()`：返回指向数组首元素的指针。
## 数组逆序
`reverse(arr, arr + n)` 函数
`reverse` 函数是C++标准库 `<algorithm>` **头文件**中定义的一个算法，用于将容器（如数组、向量等）中的元素顺序颠倒。它通过交换元素的位置来实现逆序。
其中两个参数**必须是指针或迭代器**，reverse 就会将数据容器中从两个参数和之间的所有元素逆序，由于使用地址，会改变原数组内容，也可以写成下面形式 `reverse(&arr[begin], &arr[end])` 表示地址范围
## 字符串\字符数组
**本质** : 字符串实际上是使用 `null` 字符`\0`( 编译器自动添加 )终止的一维字符数组。
```cpp
//两种方法等价
char site[7] = {'R', 'U', 'N', 'O', 'O', 'B', '\0'};
char site[] = "RUNOOB";
```

| 序号  | 函数 & 目的                                                                             |
| --- | ----------------------------------------------------------------------------------- |
| 1   | **strcpy(s1, s2);**  <br>复制字符串 s2 到字符串 s1。                                          |
| 2   | **strcat(s1, s2);**  <br>连接字符串 s2 到字符串 s1 的末尾。连接字符串也可以用 + 号                         |
| 3   | **strlen(s1);**  <br>返回字符串 s1 的长度。                                                  |
| 4   | **strcmp(s1, s2);**  <br>如果 s1 和 s2 是相同的，则返回 0；如果 s1<s2 则返回值小于 0；如果 s1>s2 则返回值大于 0。 |
| 5   | **strchr(s1, ch);**  <br>返回一个指针，指向字符串 s1 中字符 ch 的第一次出现的位置。                          |
| 6   | **strstr(s1, s2);**  <br>返回一个指针，指向字符串 s1 中字符串 s2 的第一次出现的位置。                         |
## 一维数组
定义 : `type arrayName [ arraySize ];`
声明 : `double balance[10];` []可以留空,表示不确定
赋值 : `double balance[5] = {1000.0, 2.0, 3.4, 7.0, 50.0};` 赋值使用大括号
拓展: 通过`setw`,  `setfill`格式化输出
`setw(n)` 函数只对**紧接着的** , 后面的输出产生作用。
![[cpp-setw-20200922-RUNOOB.svg|350]]
通过`setfill(string)`将`setw`的空位补齐, 两者都是流控制符[[C++ prime plus#对于流的新理解]]
## 多维数组
定义 : `type name[size1][size2]...[sizeN];`
		size的数量表示数组的维度数( dimensions )
创建多维数组并初始化:   同python中定义多维数组, 只是都用大括号
```cpp
int a[3][4] = {  
 {0, 1, 2, 3} ,   /*  初始化索引号为 0 的行 */
 {4, 5, 6, 7} ,   /*  初始化索引号为 1 的行 */
 {8, 9, 10, 11}   /*  初始化索引号为 2 的行 */
};
```
访问多维数组元素同python访问嵌套列表内元素
```cpp
//创建n*n数组
int main()
{
    int n;
    cin >> n;
    int a[n][n];
    for (int i = 1; i <= n; i++)
    {
        for (int j = 1; j <= n; j++)
            cin >> a[i][j];
    }
    for (int i = 1; i <= n; i++)
    {
        for (int j = 1; j <= n; j++)
            cout << a[i][j] << " ";
        cout << endl;
    }
    return 0;
}
```
行内代码``
## 指向数组的指针
## 传递数组给函数
## 从函数返回数组
多种数组总结

| 数组名                                                                                                                 | 作用                                                                   |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [多维数组](https://www.runoob.com/cplusplus/cpp-multi-dimensional-arrays.html "C++ 中的多维数组")                      | C++ 支持多维数组。多维数组最简单的形式是二维数组。                     |
| [指向数组的指针](https://www.runoob.com/cplusplus/cpp-pointer-to-an-array.html "C++ 中指向数组的指针")                 | 您可以通过指定不带索引的数组名称来生成一个指向数组中第一个元素的指针。 |
| [传递数组给函数](https://www.runoob.com/cplusplus/cpp-passing-arrays-to-functions.html "C++ 中传递数组给函数作为参数") | 您可以通过指定不带索引的数组名称来给函数传递一个指向数组的指针。       |
| [从函数返回数组](https://www.runoob.com/cplusplus/cpp-return-arrays-from-function.html "C++ 中从函数返回数组")         | C++ 允许从函数返回数组。                                               |

# 指针
可以理解为：
- 地址是储物柜编号
- 数据是储物柜中的物品，
- 指针是一张写有数据在所在的储物柜编号的纸条，被放在另一个储物柜中
## 指针的大小和数组的大小
**数组的大小**取决于它的元素数量和每个元素的大小。例如，一个包含10个 `int` 的数组会占用 `10 * sizeof(int)` 字节的内存空间。
**指针的大小**（`sizeof(int*)`）则取决于系统架构（32位或64位）和编译器。在32位系统中，指针通常是4字节，在64位系统中，指针通常是8字节。
## 引用和解引用
### 和引用有关的符号
#引用符号 #取址符号 #左值和右值
**左值和右值**：在C++中，左值（lvalue）指的是可以出现在赋值语句左边的表达式，它指向一个明确的、可寻址的**内存位置**。右值（rvalue）则是指可以出现在赋值语句右边的表达式，它通常表示数据值，而不是一个可寻址的位置 ^e692ff

- `&` 取值运算符，得到后面变量的内存地址，对 `&a` 操作会它返回一个地址，如 `int *p = &a ;` `&a` 返回的地址被指针 p 接收，而将其作为左值（被操作的对象）则被右值结果改变，当做找到操作对象的指引，如 `一个能够返回&a地址的的对象（返回地址的函数、指针） = 1000;` 则等价于 a = 1000 ，因为这表示用 1000 来操作（赋值）`&a ` 所返回的结果。但是注意 `&a`**放在左值位置意为将右值传递给引用**，这是错误的
- `*` 指针运算符，表示后面的变量是一个指针，用于访问指针指向的内存地址中的值。
- `.` 用于访问类或结构体对象的成员变量或成员函数。有对象实例时，使用 `.` 访问对象的成员。
- `->` 指针成员访问运算符，指向对象的指针指针访问类或结构体的成员变量或成员函数。

### 符号使用
- 在任意变量之前输入 `&` 表示获取运算符的地址并返回
- 指针是**变量**，它只能被赋值为另一个变量的地址
- 定义指针时在变量名前 `*` 表示其为一级指针，两个表示二级。指针可被定义为任意数据类型
- 加 `*` 在已经定义过的指针名称之前表示所指向的内容，即**解引用**，指针纸条写的储物柜编号中的数据
- `*` 是一种运算符，表示获取地址所知的内容
```cpp
int    *ip;    /* 一个整型的指针 */
double *dp;    /* 一个 double 型的指针 */
float  *fp;    /* 一个浮点型的指针 */
char   *ch;    /* 一个字符型的指针 */
int a = 10;   //定义一个整数变量
char *pointer = &a；   	//定义一级指针，它指向a所在的内存地址,本身也是个char型变量
```
- 指针类型和指针所指向地址的内容**必须保持一致**，这里是因为不同类型的占用内存、内存中二进制信息解析方式都不一样，仍然能够解析，但是结果可能错误
```cpp
int a = 20;
int b = 300;
char *p = &a；
char *p = &b；
//a不会出错，但是b超过char一个字节能存储的极限
```
	![[15635100a9c18b9ce4be064687851b9.jpg|最高位的 1 被截断丢失，所以显示 44 数据偏]]
## 各种指针类型
### NULL 指针
定义指针时暂时没有地址可以赋值最好定义为 `NULL`，这样定义的指针值为。零内存地址表明该指针不指向一个可访问的内存位置。但如果指针包含空值（零值），则假定它不指向任何东西。
### 指针算术运算
**四则运算**
在C++中，指针的算术操作（如 `ptr++`）会使指针增加**其指向的数据类型**的大小。
	例 ：定义整数型指针 `int *ptr = a`，指针 ptr 是一个指向 1000 地址的**整形**指针，在操作系统中占用 4 字节空间，那么 `ptr++` 意思是指向下一个整数类型地址，a 地址下一个连续的 4 字节地址才是存放下一个整形数据的地址，所以运算之后得到 `ptr = 1004`
Char 字符型 1 字节，longlong 长型 8 字节同理
可以通过这个性质进行指针递增读取操作
```cpp
#include<iostream>
using namespace std;
int main(){
    int array[5] = {1,2,3,4,5};
    int *ptr = array;
    int count = 1;
    while (count < 5)
    {
        cout << "now the pointer is point to : "<< *ptr << endl;
        ptr++;
        count++;
    }
    return 0;
}
```
**比较**
- 相等性比较 (== 和 !=)，比较的是指向的位置是否一致，而不是指向的值
- 关系比较 (<, <=, >, >=)  同理，比较的是前后顺序
- 返回值为 `bool` 

### 指针和数组
- 定义变量时，变量名称表示了其内容所在的地址，**在表达式中**使用表示引用其中名称代表的值，类似将变量作为一种“表达式”，&解引符号表示引用名称内容——地址
	- 所以，普通 int，char 类型指针得到的是其本身的地址，但**数组类型变量被解释为指针常量**，取址指针常量表示数组第一个元素地址，`int *p = array（数组名）` 获得第一元素的地址， `*var` 就是 `var[0]`。
	- 引用地址的写法 `int *p = &array` 表示数组名取址，引用第 n 个元素可以写 `int *p = &array[n]`
	- 数组名、容器名和结构体名在大多数表达式被调用中会被解释为指向数组第一个元素或结构体第一个成员的**指针**。
```cpp
int  var[3] = {10, 100, 200};
for (int i = 0; i < 3; i++){
  *var = i;    // 这是正确的语法，变量名是指针常量，*解引用表示其地址
  var++;       // 这是不正确的
}
```
-  `*` 表示将指针常量解引用得到地址，此时 var 指针常量类型是有三个元素的数组类型
- 不是因为数组中有多个元素超出了一个 int 指针的范围[[#指针的大小和数组的大小]] ，是因为类型不匹配， `int (*)[10] = array` 表示指针是一个有 10 个元素的数组类型指针

```cpp
const int MAX = 3;
int  var[MAX] = {10, 100, 200};
int *ptr[MAX];
for (int i = 0; i < MAX; i++){
   ptr[i] = &var[i]; // 赋值为整数的地址，变量名是可以被解引用的指针常量
}
for (int i = 0; i < MAX; i++){
   cout << "Value of var[" << i << "] = ";
   cout << *ptr[i] << endl;
```
#### 指针常量
指针常量（Pointer Constant）是指一个指针变量，其指向的地址是不可变的。在C++中，有两种类型的指针常量：
**指向常量的指针**：直接将指针指向一个常量 `const int *p = &任何数字` 指针表示的是数字而不是地址
**指针常量**：指针指向一个固定的地址
```cpp
int value = 10;
int* const ptr = &value;
```
第一种是指针不能修改指针指向的值
第二种是指针不能被改变地址
关键区分是 `const` 和 `int` 位置
#### 传递指针给函数
注意函数定义中要的是地址参数还是指针参数
```cpp
#include <iostream>
using namespace std;
double getAverage(int *arr, int size);
int main(){
    int balance[5] = {1000, 2, 3, 17, 50};
    /*注意因为balance是数组，balance = &balance[0]，balance参数是一个地址
    后面有迭代计算操作，所以将整个数组作为参数传递给函数
    */
    double avg = getAverage(balance, 5);
    cout << "Average value is: " << avg << endl;
    return 0;
}
double getAverage(int *arr, int size){ //int *arr表示第一个参数时地址（或能够被指针指向的东西， int *p =等于号右边的内容
    int i, sum = 0;
    double avg;
    for (i = 0; i < size; ++i){
        sum += arr[i];
    }
    avg = double(sum) / size;
    return avg;
}
```
下面传递单一数据例子更清晰
```cpp
#include <iostream>
#include <ctime>
using namespace std;
void getSeconds(unsigned long *par);
int main (){
   unsigned long sec;
   getSeconds( &sec );   //给出变量地址
   cout << "Number of seconds :" << sec << endl;
   return 0;
}
void getSeconds(unsigned long *par){  //要求变量地址
   // 获取当前的秒数
   *par = time( NULL );
   return;
}
```
#### 从 C++函数返回指针
**C++ 不支持在函数外返回局部变量的地址，除非定义局部变量为 static变量。**
```cpp
// 要生成和返回随机数的函数
int * getRandom( ){
  static int  r[10];  //不设置static 每次调用getrandom都会int r[10]初识所有元素为0
  srand( (unsigned)time( NULL ) );
  for (int i = 0; i < 10; ++i){
    r[i] = rand();
    cout << r[i] << endl;
  }
  return r;
}
int main (){
   int *p;// 一个指向整数的指针
   p = getRandom();
   for ( int i = 0; i < 10; i++ )   {
       cout << "*(p + " << i << ") : ";
       cout << *(p + i) << endl;
   }
   return 0;
}
```
# 引用
引用是某个已存在变量的另一个名字。一旦把引用初始化为某个变量，就可以使用该引用名称或变量名称来指向变量。
## 指针和引用
**指针和引用区别**
- 不存在空引用。引用必须**初始化**连接到一块合法的内存。
- 一旦引用被初始化为一个对象，就不能被指向到另一个。指针可以在任何时候指向到另一个对象。
- 引用必须在创建时被初始化。指针可以在任何时间被初始化。
- 对引用的名称操作会改变变量的原本值，而不能直接修改变量的值
- 选择成员的时候，**引用使用点 . 来查找，而指针则使用 -> 来查找**。
- 指针会创建新的内存空间，引用不会，原名和别名所有操作操纵同一个地址的内容
指针分为：
1. **野指针**：指针变量指向非法的内存空间（如：[[C++ Basics#深浅拷贝注意事项|浅拷贝造成的非法访问堆内存]]）
2. **空指针**：指针变量指向内存中编号为0的空间，用于初始化只针对象，空指针指向的内存是不可以访问的 (如 [[C++ Basics#析构函数的作用||析构函数防止指针悬空]])
3. **结构体指针**：指向结构的指针
4. **其他类型指针**
```cpp
int main(){
 int words = 1;
 int words = 2;
 cout << words << endl;
 }//直接修改变量值并不会被识别为重新赋值
```
不一致需要类型转换
```cpp
int a = 10;
float b = 20.0f;
int& ref = a;
ref = static_cast<int>(b); // 使用类型转换将b的值赋给a
```
**指针和引用相同**
- 引用的类型必须与它所引用的变量的类型**完全一致**。引用可以被看作是变量的别名，一旦创建，它就与原始变量绑定，不能更改。
- 一个变量可以有多个指针，引用
- 传递实参要创建副本，就意味着效率更低。指针和引用不会创建副本，效率更高

## 三种传参方式
(1) 将变量名作为实参和形参。传给**形参的是变量的值**，传递是单向的。如果在执行函数期间形参的值发生变化并不传回给实参。因为在调用函数时，形参和实参不在同一存储单元。// 同 c
(2) 传递变量的指针。形参是指针变量，实参是一个变量的地址，调用函数时，形参(指针变量)指向实参变量地址。这种通过形参指针可以改变实参的值。// 同 c
(3) C++提供了传递变量的引用。形参是引用变量，**和实参是一个变量**，调用函数时，形参(引用变量)指向实参变量单元。这种通过形参引用可以改变实参的值。定义函数接受引用作为参数，那么传入参数就需要传入变量名，因为（`int &c = a` c 是 a 的别名）
### 把引用作为参数
```cpp
struct Demo 
{
  char name[10000];
  int  count;
};
int main()
{
  Demo my_demo = {0};
  Demo *my_demo_p = &my_demo;
  Demo &my_demo_ref = my_demo;
  // 方式1：传递实参  
  func1(my_demo);
  // 方式2：传递指针  
  func2(my_demo_p);
  // 方式3：传递引用  
  func3(my_demo_ref);
  return 0;
}
如上所示，参数传递可以有三种方式，则三种函数可以这样定义：
// 方式1：传递实参 
void func1(Demo demo)
{
  cout << demo.name;
}
// 方式2：传递指针  
void func2(const Demo *demo_p)
{
  cout << demo->name;
}
// 方式3：传递引用  
void func3(const Demo &demo_ref)
{
  cout << demo.name;
}
```
### 把引用（不是值）作为返回值
```cpp
#include <iostream>
using namespace std;
int vals[10] = {1, 2, 3, 4, 5};
int &change(int sequence){
    int &ref = vals[sequence];  //函数名引用表示函数名时return值的别名
    return ref;  //返回一个引用，它的真名变量是vals[i]，内容是数组中的一个元素
}
int main() {
    cout << "before change";
    for (int i = 0; i < 5; i++) {
        cout << "before change, vals[" << i << "] = " << vals[i] << endl;
    }
    change(0) = 100;//通过引用修改内容
    change(1) = 200;
    cout << "after change";
    for(int i = 0; i < 5; i++) {
        cout << "after change, vals[" << i << "] = " << vals[i] << endl;
    }
    return 0;
}
```
如果其中 change 函数没有加&则表示 return 是值传送，传送变量的一个副本，即 vals 的第 i 个元素的值。加了&表示返回数组的引用，change (sequence) 仍然是函数调用，函数在执行过程中通过引用修改数组源数据。
# 时间和日期
使用日期和时间相关的函数和结构，需要在 C++ 程序中引用`<ctime>` 头文件。
**各种时间函数声明**
### time
`time_t time (time_t *time);`
   函数期望传入的实参是内存地址（变量只能接受地址作为参数），`time` 函数接受一个指向 `time_t` 类型的**指针作为参数**，这个指针应该指向一个 `time_t` 类型的变量。不能直接将不是指针的普通的变量名传递给 `time` 函数。函数返回值也是 time_t 类型 （自 epoch 纪元经过的秒数）的数字
### ctime
`char *ctime (const time_t *timer)`
- `ctime` 是函数名。
- `const time_t *timer` 是函数的参数，表示 `ctime` 函数接受一个指向 `time_t` 类型的常量指针。`const` 关键字表明这个指针指向的数据在函数内部不会被修改。
- `char *` 表示函数**返回值是一个指针**，他指向一个字符型内容，即找到指针所指的内存地址读取后会得到一个字符串
- 返回值为**Www Mmm dd hh:mm: ss yyyy** 其中，_Www_ 表示星期几，_Mmm_ 是以字母表示月份，_dd_ 表示一月中的第几天，_hh:mm:ss_ 表示时间，_yyyy_ 表示年份。 ^602add
```cpp
#include <stdio.h>
#include <time.h>
int main() {
    time_t seconds; // 定义一个 time_t 类型的变量，还没有赋值，所以没有分配内存
    time(&seconds); // 传递 seconds 的地址给 time 函数，可以理解为将返回结果传入second的地址所在位置，完成赋值
    printf("当前时间是: %s", ctime(&seconds)); // 使用 seconds 的值
    return 0;
//也可以这么写，只要知道传入的时指针即可
	value = time(&seconds);//根据声明知time返回的是一个time_t类型的值
	printf("now is %s", ctime(&value));
}
```
### localtime
`struct tm *localtime(const time_t *timer)`
- 定义 localtime **函数的返回值**是一个 struct tm 类型的指针，
- 他接受一个 time_t 类型的 **指针**，指针的内容应该指向一个值为epoch 时间常数的变量
```cpp
#include <stdio.h>
#include <time.h>
int main() {
    struct tm *localTime; // localTime 是一个一级指针
    time_t currentTime;
    time(&currentTime); // 获取当前时间，time函数将返回结果epoch数值赋值给current
    localTime = localtime(&currentTime); //；localtime函数需地址为参数，所以解引用
    // 将 localtime 返回的指针赋给 localTime
    // 使用 localTime 指针访问 struct tm 结构体中的数据
    printf("本地时间是: %d-%02d-%02d %02d:%02d:%02d\n",
           localTime->tm_year + 1900, localTime->tm_mon + 1, localTime->tm_mday,
           localTime->tm_hour, localTime->tm_min, localTime->tm_sec);
    return 0;
}
```
PS：指针之间的赋值与变量之间的赋值一致，毕竟本质都是变量，**不需要创建二级指针**。
所以上面代码也可以将声明和赋值写在一起
`struct tm *localTime = localtime(&currentTime); `
### asctime
与 localtime 不同的是，
- localtime 和 time 函数配合将 epoch 时间转换为 struct tm 类型的**指针**，指针指向的结构体中包含着信息的分解转换信息。
- asctime 将 struct tm 结构体类型中共存储的的时间信息转换为 ctime 函数的返回值，一个指向[[C++ Runoob Tutoral#^602add|便于阅读的时间格式]]的**指针**
### clock
`clock_t clock(void)`
调用函数将会返回当前 CPU 时钟的处理器时间（返回值），通常将其赋予一个变量
```cpp
#include <time.h>
#include <stdio.h>
int main()
{
   clock_t start_t, end_t;
   double total_t;
   int i;
   start_t = clock();
   printf("程序启动，start_t = %ld\n", start_t);
   printf("开始一个大循环，start_t = %ld\n", start_t);
   for(i=0; i< 10000000; i++)
   {
   }
   end_t = clock();
   printf("大循环结束，end_t = %ld\n", end_t);
   total_t = (double)(end_t - start_t) / CLOCKS_PER_SEC;
   printf("大循环 CPU 占用的总时间：%f\n", total_t  ); 
   return(0);
}
```
`total_t = (double)(end_t - start_t) / CLOCKS_PER_SEC;` 换算为现实时间公式
### gmtime
`struct tm *gmtime(const time_t *timer)`
- 一般用于获取格林威治标准时间，通过 gmtime 赋值的变量（对象）通过调用成员变量和方法转换为日常 24 小时制时间
- 不同之处在于 struct tm 结构体中的信息是转换为本地时间还是格林威治时间
```cpp
#define BST (+1)
#define CCT (+8)
int main ()
{
   time_t rawtime;
   time(&rawtime);
   /* 获取 GMT 时间 */
   struct tm *info;
   info = gmtime(&rawtime );
   printf("当前的世界时钟：\n");
   printf("伦敦：%2d:%02d\n", (info->tm_hour+BST)%24, info->tm_min);
   printf("中国：%2d:%02d\n", (info->tm_hour+CCT)%24, info->tm_min);
   return(0);
}
```
### mktime
`time_t mktime (struct tm *timeptr)`
将 struct tm 数组中的信息转换为 epoch 时间，接受数组，返回 time_t 格式的整数
### difftime
`double difftime(time_t time1, time_t time2)`
采用双精度浮点数返回两个 epoch 时间的秒数差值，相减再转换
```cpp
difftime(start, end);
//等效于
time(&start);
time(&end);
double diff = static_cast<double>(end - start);
```
### strfitime
`size_t strftime(char *str, size_t maxsize, const char *format, const struct tm *timeptr)`
- 将 struct tm 中的各种数据通过指向字符串的 format 指针格式化为更容易看懂的内容
- **str** -- 这是指向目标数组的指针，用来复制格式化之后的结果字符串。
- **maxsize** -- 这是被复制到 str 的最大字符数。
- **format** -- 这是 C 字符串，包含了普通字符和特殊格式说明符的任何组合。
```cpp
#include <stdio.h>
#include <time.h>
int main ()
{
   time_t rawtime;
   char buffer[80]; //定义一个字符串数组，长度限定80
   time( &rawtime );
   struct tm *info = localtime( &rawtime );
   strftime(buffer, 80, "%Y-%m-%d %H:%M:%S", info);//第一个参数需要地址，但因为buffer是字符串数组，直接用名字默认为第一个元素的地址
   printf("格式化的日期 & 时间 : |%s|\n", buffer );
   return(0);
}
```
# 输入输出
## 各种头文件
**iostream 头文件**
clog，cerr 用法与 cout 一致，只是这两个控制符会将输出的信息发送到不同的接收设备（日志和错误接受设备），而不是 cout 仅仅只发送到屏幕
`std:: getline(std::istream& is, std::string& str, char delim)`
`std::istream& is` 表示文件对象，也可以写 cin>>表示从键盘获取
- 当没有内容可获取时会返回内容为 error 的流对象类型，然后被**转换为 bool 的 false**
- `delim` 表示读取到哪个字符串就停下，省略默认为 `\n`

**iomanip 头文件**
- `setw(int)` 设值输出宽度，不足使用空格填充[[C++ prime plus#^8ea2c8|以前的例子]]
- `setprecision(int)` 控制显示小数位数为 int 个
- `fixed` 以小数形式显示输出流中的数字
- `scientific` 以科学计数法显示
- `setiosflags(ios_base::fmtflags)`
- `resetiosflags(ios_base::fmtflags)`
- `setfill(char)` 输出宽度不足使用 char 字符填充

**fstream 头文件**
- `std::ios::in`：以输入模式打开文件。
- `std::ios::out`：以输出模式打开文件。
- `std::ios::app`：以追加模式打开文件。
其中输入模式只允许**读取操作**，输出模式只允许**写入操作**
```cpp
int main()
{
    //创建新文件并写入内容
    fstream file;
    file.open("example.txt", std::ios::out);
    //未找到文件会自动创建，类似python的w模式，所以这里是打开文件失败的提示
    if(!file){
        cout << "the file cannot be open ." << endl;
        return 1; //记得直接return结束程序
    }
    file << "this is contend inside this file." << endl;
    file.close();
    //追加内容到文件末尾
    file.open("example.txt", ios::app);
    file << "this is append contend." << endl;
    file.close();
    //读取操作
    file.open("example.txt", std::ios::in);
    string line;
    while(getline(file,line)){
        cout << line << endl;
    }
    return 0;
}
```
对于打开文件和文件模式可参考[[Python Basics#^9ccf2a|文件读取操作]]，
f = open ("D:/test. txt","r", encoding="UTF-8")
- `文件对象.文件对象成员方法(位置,模式,编码方式)` 只是 C++需要提前声明变量，
- 对文件的操作不再使用成员方法，而是用文件流控制符
- cout 输出对象是屏幕的控制符改为 file 输出对象是文件
- `file << 输出内容 << 各种控制符`

## 标准输入输出流
### 输入输出处理方式
流输出输入运算符<<和>>对于输出输入不同的内容有不同的处理方式（通过调用不同的函数），但是内层设计为两种符号会自动重载来适应对不同数据类型的数据
运算符重载允许同一个运算符对不同的数据类型执行不同的操作。对于 `<<` 运算符（流插入运算符），它被重载以适应不同的数据类型，使得输出操作可以统一使用 `<<` 运算符，而不需要为每种数据类型编写不同的输出代码。
对于 `>>` 同理会使用不同的流提取符获取值，但是表现形式都是 `>>`
## 控制符
`std::setw`, `std::left`, `std::right` 可以粗略格式化输入输出内容，如果需要精细控制则要用到 `setiosflags(控制对象)` 控制
**setiosflags 系列**
- setiosflags (ios::fixed) 固定的浮点显示 
- setiosflags (ios::scientific) 指数表示 
- setiosflags (ios::left) 左对齐 
- setiosflags (ios::right) 右对齐 
- setiosflags (ios:: skipws 忽略前导空白 
- setiosflags (ios::uppercase) 16 进制数大写输出 
- setiosflags (ios::lowercase) 16 进制小写输出 
- setiosflags (ios::showpoint) 强制显示小数点 
- setiosflags (ios::showpos) 强制显示符号 

| cout. self 系列 |                                            |
| ------------- | ------------------------------------------ |
| 标志            | 功能                                         |
| boolalpha     | 可以使用单词”true”和”false”进行输入/输出的布尔值.           |
| oct           | 用八进制格式显示数值.                                |
| dec           | 用十进制格式显示数值.                                |
| hex           | 用十六进制格式显示数值.                               |
| left          | 输出调整为左对齐.                                  |
| right         | 输出调整为右对齐.                                  |
| scientific    | 用科学记数法显示浮点数.                               |
| fixed         | 用正常的记数方法显示浮点数(与科学计数法相对应).                  |
| showbase      | 输出时显示所有数值的基数.                              |
| showpoint     | 显示小数点和额外的零，即使不需要.                          |
| showpos       | 在非负数值前面显示”＋（正号）”.                          |
| skipws        | 当从一个流进行读取时，跳过空白字符(spaces, tabs, newlines). |
| unitbuf       | 在每次插入以后，清空缓冲区.                             |
| internal      | 将填充字符回到符号和数值之间.                            |
| uppercase     | 以大写的形式显示科学记数法中的”e”和十六进制格式的”x”.             |
| iostream 系列 |                  |     |     |
| ----------- | ---------------- | --- | --- |
| 操作符         | 描述               | 输入  | 输出  |
| boolalpha   | 启用boolalpha标志    | √   | √   |
| dec         | 启用dec标志          | √   | √   |
| endl        | 输出换行标示，并清空缓冲区    |     | √   |
| ends        | 输出空字符            |     | √   |
| fixed       | 启用fixed标志        |     | √   |
| flush       | 清空流              |     | √   |
| hex         | 启用 hex 标志        | √   | √   |
| internal    | 启用 internal 标志   |     | √   |
| left        | 启用 left 标志       |     | √   |
| noboolalpha | 关闭boolalpha 标志   | √   | √   |
| noshowbase  | 关闭showbase 标志    |     | √   |
| noshowpoint | 关闭showpoint 标志   |     | √   |
| noshowpos   | 关闭showpos 标志     |     | √   |
| noskipws    | 关闭skipws 标志      | √   |     |
| nounitbuf   | 关闭unitbuf 标志     |     | √   |
| nouppercase | 关闭uppercase 标志   |     | √   |
| oct         | 启用 oct 标志        | √   | √   |
| right       | 启用 right 标志      |     | √   |
| scientific  | 启用 scientific 标志 |     | √   |
| showbase    | 启用 showbase 标志   |     | √   |
| showpoint   | 启用 showpoint 标志  |     | √   |
| showpos     | 启用 showpos 标志    |     | √   |
| skipws      | 启用 skipws 标志     | √   |     |
| unitbuf     | 启用 unitbuf 标志    |     | √   |
| uppercase   | 启用 uppercase 标志  |     | √   |
| ws          | 跳过所有前导空白字符       | √   |     |
| iomanip 系列            |               |     |     |
| --------------------- | ------------- | --- | --- |
| 操作符                   | 描述            | 输入  | 输出  |
| resetiosflags(long f) | 关闭被指定为f的标志    | √   | √   |
| setbase(int base)     | 设置数值的基本数为base |     | √   |
| setfill(int ch)       | 设置填充字符为ch     |     | √   |
| setiosflags(long f)   | 启用指定为f的标志     | √   | √   |
| setprecision(int p)   | 设置数值的精度(四舍五入) |     | √   |
| setw(int w)           | 设置域宽度为w       |     | √   |
#### PS：char[] 和 string 创建字符串
- char 只能存储单个字符，string 和 char[]都可用来创建字符串存储
- char[]需要手动管理内存，而 string 不需要
- string 提供各种针对字符串的成员方法，而 char[]提供的是数组操作方法

# 数据结构
## 结构体
### 结构体数组
在定义结构体之后放入数组中方便管理；
```cpp
struct info{
    string name;
    int age;
    int score;
};

int main(){
    struct info studarr[3] ={
            {"alpha", 18, 90},
            {"beta", 18, 89},
            {"charile", 20,79}};
    int size = sizeof(studarr) / sizeof(studarr[0]);
    for (int i = 0; i < size; i++){
        cout << "the " << i << " student is " << studarr[i].name << endl;
        cout << "the " << i << " student is " << studarr[i].age << endl;
        cout << "the " << i << " student is " << studarr[i].score << endl;
    }
    return 0;
}
```

结构体只能声明后再创建数组对象，不能将 struct info studarr[3] 作为定义直接用，数组元素的个数 #数组长度 #结构体长度 只暂时只能通过 sizeof 函数计算
- 本质上是自定义一种数据类型，类型中的成员可通过 `.` **不用** `->` 调用
- 结构体和类非常相似，主要区别在于默认的访问权限：结构体的成员默认是 `public`，而类的成员默认是 `private`
```cpp
struct type_name {
//不同数据结构的变量、函数定义或声明
member_type1 member_name1;
.
.
} object_names;
```
}后可以不写对象名，但是使用结构体一定要提前声明对象名
```cpp
//声明方法
type_name 对象名称   类似变量的声明
```
使用实例：
```cpp
struct Books{
    char title[50];
    char author[50];
    char subject[100];
    int book_id;
}Book1,Book2;
int main(){
    // Book1 详述
    strcpy(Book1.title, "C++ 教程");
    strcpy(Book1.author, "Runoob");
    strcpy(Book1.subject, "编程语言");
    Book1.book_id = 12345;
    // Book2 详述
    strcpy(Book2.title, "CSS 教程");
    strcpy(Book2.author, "Runoob");
    strcpy(Book2.subject, "前端技术");
    Book2.book_id = 12346;
    printBook(Book1);
    return 0;
//接受结构体作为参数
void printBook( struct Books book )
//定义是接收一个名为Books的struct类型结构体，形参名为book
{
   cout << "书标题 : " << book.title <<endl;
}
```
### 指向结构体的指针
指针类型成员变量使用 `->` 访问
```cpp
struct Books{
    char title[50] = "title";
    char author[50]="Sickwag";
} Book_object;
int main(){
    //定义指向结构体的指针，首先声明指针的类型，所以定义结构体在定义指针之前
    struct Books *struct_pointer;
    //指针需要地址，地址需要解引用变量，结构体对象创建过程是创建变量（对象）
    struct_pointer = &Book_object;
    cout << struct_pointer->title << endl;
    return 0;
}
```
### 结构体嵌套
类似于 python 的数组，字典嵌套
```cpp
struct student{
    string name = "sickwag";
    int age = 21;
}s;
struct teacher
{
    int id = 1234567;
    string name = "gawkcis";
    struct student stu;
}t;

int main(){
    cout << "teacher is " << t.name << " " << t.id<<"\n";
    //调用嵌套结构体或直接调用被嵌套的结构体都可以，注意写法
    cout << "student is " << t.stu.name << " " << s.age << "years old.";
    return 0;
}
```
## vector 容器
**基本特性:**
- **动态大小**：`vector` 的大小可以根据需要自动增长和缩小。
- **连续存储**：`vector` 中的元素在内存中是连续存储的，这使得访问元素非常快速。
- **可迭代**：`vector` 
- **元素类型**：`vector` 可以存储任何类型的元素，包括内置类型、对象、指针等。
使用需要导入 `vector` 头文件
```cpp
std::vector<int> myVector(5); // 创建一个包含 5 个整数的 vector，每个值默认值（0）
std::vector<int> myVector(5, 10); // 创建一个包含 5 个整数的 vector，每个值都为 10
std::vector<int> vec; // 默认初始化一个空的 vector
std::vector<int> vec2 = {1, 2, 3, 4}; // 大括号初始化一个包含元素的 vector
int x = myVector[0]; // 看做序列获取元素
```
| int y = myVector.at (1);  | 获取第二个元素                          |
| ------------------------- | -------------------------------- |
| myVector. push_back (7)   | pushback 而不是 append 追加元素         |
| int size = myVector. size | size 成员方法获取长度不是 length           |
| myVector. clear           | 清空 vector                        |
| .begin ()   .end ()       | 分别指向开头与结尾，返回一个迭代器，算术运算计算的是元素位置偏移 |
| .erase ()                 | 清除某个元素，其中可直接加入偏移位置               |
## typedef 关键字
为已经存在的数据类型定义一个别名
`typedef Books b` 将上面定义名为 book 的 struct 结构体类型别名定为 b，可以用 b 代表原结构体 `struck Book`，相同的方法引用其中成员
也可以在定义结构时定义别名，
# 类和对象
- **结构：**
![[Pasted image 20240809124518.png|375]]
**类成员**
指那些把定义和原型写在类定义内部的函数，就像类定义中的其他变量一样。
未说明变量作用域默认为 private
需要在类的外部调用类中成员而没有定义类的对象时可以使用 `类名::成员名()` 调用变量（赋值操作）或调用成员函数（使用函数）
- **域解析运算符**
用于指定一个成员属于哪个作用域，前面填作用域，后面填作用于其中的成员
	- 在类的上下文中，`::` 指定类的静态成员或成员函数，或指定派生类中覆盖基类成员。用来调用类中变量或类中变量赋值，调用其中函数而不需要创建对象
```cpp
class MyClass....
.....
}obj.
//不创建变量定义成员
int MyClass::member = value;
//创建变量定义成员
obj.member(value)；
```
1. 在命名空间的上下文中，`::` 用于指定命名空间内的名称。
2. 在全局作用域（不写类名）中，`::` 用于指定全局变量或全局函数。
## 创建对象的两种方式
创建对象在栈上创建 #创建对象的位置 #对象的存储 #对象内存分配
在 C++中，创建对象有两种常见的方法，它们在内存分配和对象生命周期管理方面有显著的不同：
### `MyClass* obj = new MyClass();`
- **动态内存分配**：`new` 关键字在堆（heap）上分配内存。这意味着对象的生命周期直到你显式地使用 `delete` 释放内存为止。使用 `new` 创建的对象需要手动管理内存，以避免内存泄漏。
- **指针访问**：`obj` 是一个指向 `MyClass` 类型对象的指针。通过指针，你可以访问对象的成员变量和成员函数，也可以将指针传递给其他函数。
- **灵活性**：使用指针可以灵活地控制对象的生命周期，例如，可以将指针传递给函数，或者在运行时决定是否删除对象。

### `MyClass obj;`
- **自动内存分配**：在栈（stack）上分配内存。对象 `obj` 的生命周期由其作用域决定。当 `obj` 所在的作用域结束时，对象会自动被销毁。
- **直接访问**：`obj` 是一个 `MyClass` 类型的对象，不是指针。你可以直接通过 `.` 操作符访问对象的成员变量和成员函数。
- **安全性**：栈上分配的对象不需要手动管理内存，因此不会发生内存泄漏。编译器会在适当的时候自动销毁对象。
### 示例
```cpp
int main() {
    // 使用栈创建对象
    MyClass obj1;
    obj1.display();
    // 使用堆创建对象
    MyClass* obj2 = new MyClass();
    obj2->display();
    delete obj2; // 必须手动释放内存
    return 0;
}
```
在这个例子中，`obj1` 是在栈上创建的，而 `obj2` 是通过 `new` 在堆上创建的。`obj1` 的生命周期由其作用域决定，而 `obj2` 的生命周期需要通过 `delete` 来管理。
## 抽象类和非抽象类
抽象类是面向对象编程中的概念，是一种**不能被实例化的**类。抽象类通常用于表示一些通用的概念或模板，可能包含抽象方法（没有具体实现的方法）和/或具体方法（有具体实现的方法）。
抽象类至少包含一个[[#纯虚函数]]，
**类的实例化**：指通过类创建对象的过程，对象是根据类的定义创建的，拥有类定义中的所有属性和方法的**副本**，通常使用 new 关键字创建
```cpp
class MyClass {
public:
    int value;
    void setValue(int v) { value = v; }
}
int main() {
    MyClass* obj = new MyClass(); // 实例化 MyClass 类的对象
    obj->setValue(10); // 使用对象的方法
    delete obj; // 释放对象
    return 0;
}
```
## 静态成员和非静态成员
静态成员函数和静态成员变量是类的成员，它们不属于类的任何特定对象，而是属于类本身。这意味着它们可以被类的所有对象共享。
```cpp
class MyClass {
public:
    // 非静态成员变量
    int nonStaticVar;
    // 静态成员变量
    static int staticVar;
    // 非静态成员函数
    void setNonStaticVar(int value) {
        nonStaticVar = value;
    }
    // 静态成员函数
    static void setStaticVar(int value) {
        staticVar = value;
    }
};
```
- `nonStaticVar`是一个非静态成员变量，每个`MyClass`对象都有自己的`nonStaticVar`副本。因此，当`obj1`和`obj2`分别调用`setNonStaticVar`函数时，它们各自修改了自己的`nonStaticVar`副本。
- `staticVar`是一个静态成员变量，它不属于任何特定的对象，而是属于整个类。通过`MyClass::setStaticVar`函数设置`staticVar`的值时，这个值被所有对象共享。
## 访问修饰符
### 修饰符类型
1. **public（公有）**:- 成员可以被任何代码访问。
2. **protected（受保护的）**: 成员可以被派生类（子类）访问，函数外部、类的实例不能访问。
3. **private（私有）**:
	- 成员只能被类的成员函数、友元函数或友元类访问。
	- 不能被类的实例直接访问，也不能被派生类访问。保护类和私有类不能通过 `.` 访问

一个类中可以有多个访问修饰符标记区域，每个标记区域在下一个标记区域开始之前或者在遇到类主体结束右括号之前都是有效的。
### 修饰符的特性
与 python 不同的是 [[Python Basics#构造方法]] C++对定义在类中的变量做了更细致的区分，但相同的是访问修饰符仅仅定义了类成员的访问级别，提供入口。
通过类创建的对象没有其中变量的属性，也没有被初始化为变量的值
没有在__init__中初始化，通过 `.` 调用的是类中定义的默认成员，并不是对象本身有的，**只是调用**，而在 init 定义后则是对象特有
### 友元
友元（Friend）是特殊的类成员访问**权限**。友元可以是一个函数、类或另一个类的成员函数。通过将函数或类声明为友元，这些函数或类可以访问**当前类**的私有（private）和保护（protected）成员。

#### 友元函数
有些私有属性也想让类外特殊的**函数**或者类进行访问，需要用到友元，设置隐私访问白名单，目的是让一个**函数或者类** 访问另一个类中私有成员
- 友元函数不是类的成员函数，他在类外部定义，内部写函数声明（任何访问修饰符中都可以，只要再类中）
- 友元函数通常用于实现需要访问类的内部状态，但又不适合作为类的成员函数的封装操作。
- 当友元函数参数列表中传入类的对象时默认为值传递, 调用友元函数会将会操纵其中对象的副本, 这会导致内存占用和时间成本。
`Myclass::Myclass(const Myclass &copyone)` 引用传递
`Myclass::Myclass(const Myclass copyone)` 值传递
- 友元函数的声明可以放在类定义的 `public`、`private` 或 `protected` 部分。友元函数的声明位置不会影响其访问权限
```cpp
class Building
{
public:
    // constructor
    Building()
    {
        this->m_lobby = "public lobby room";
        this->m_chamber = "private place";
    }
    string m_lobby;

private:
    string m_chamber;
    friend void goodgay(Building *build);
};
void goodgay(Building *build)
{
    cout << "goodgay is visit public place " << build->m_lobby;
    cout << "goodgay is visit public place " << build->m_chamber;
}
int main()
{
    Building build;
    goodgay(&build);
}
```
![[Pasted image 20240908230304.png|400]]

#### 友元类
```cpp
#include <iostream>
#include <string>
// 本例中所有函数外部定义，内部声明或调用
using namespace std;
class Building;//declare before goodgay
class goodgay
{
public:
    goodgay();
    void visit();

private:
    Building *building;//这里和下面不同，创建的是Building指针
};
class Building
{
    friend class goodgay; // 使其能够访问goodgay中private内容
public:
    Building();
    string m_public_room;

private:
    string m_private_room;
};

// 外部定义需要指明作用域
Building::Building()
{ // 初始化Building有什么房间(使用构造函数)
    string m_private_room = "bedroom";
    string m_public_room = "lobby";
}
goodgay::goodgay()
{ // 初始化内容属性
    building = new Building;//创建一个Building对象放在堆中
}

void goodgay::visit()
{
    std::cout << "you friend is visiting " << building->m_private_room << endl; // if you haven't marked goodgay to a friend this line while raise an error
    std::cout << "your friend is visiting " << building->m_public_room << endl;
}
int main(){
    Building b;
    goodgay g;
    return 0;
}
```
#### 友元成员函数

### 函数内联
**内联工作原理**
当函数被声明为内联时，编译器会在**每个调用（这个函数）点**直接将函数的代码（**是函数的副本**）插入，而不是生成一个函数调用的指令。避免了频繁调用函数对栈内存重复开辟所带来的消耗。特别是对于小型、**频繁调用**的函数，内联可以显著提高程序的性能。
内联是以代码膨胀（复制）为代价，仅仅省去了函数调用的开销，如果执行函数体内代码的时间（代码体很长），相比于函数调用的开销较大，那么效率的收获会很少。
另一方面，每处内联函数的调用都要复制代码，使程序的总代码量增大，消耗更多内存空间。
```cpp
inline const char *num_check(int v){
    return (v % 2 > 0) ? "奇" : "偶";
}
int main(void)
{
    int i;
    for (i = 0; i < 1000; i++)
        printf("%02d   %s\n", i, num_check(i));//多次使用小型函数内联可极大提高效率
    return 0;
}
```
- 只有函数可以被标记为 `inline`。
- 数据结构、类或结构体不能被标记为 `inline`，但它们可以包含 `inline` 声明的内联函数
- `inline` 函数的内联行为取决于编译器的决策，只是一种建议，如果编译器认为函数不复杂，能在调用点展开，就会真正内联。

- 在类中书写函数定义不是一种良好的编程风格，定义应该在外部，内部只保留变量和原型，在内部书写定义自动标记为内联，外部想要是内联则需要**在函数定义前加** `inline` 关键字声明，原型前使用 inline 无效果
- 想要标记函数为内联，只需要在函数定义前 inline 声明，原型前也可以但不需要，这会影响 C/C++程序设计原则：**声明与定义不可混为一谈，用户没有必要、也不应该知道函数是否需要内联。**
- 一般在私有区域定义数据，共有区域定义函数，方便外部调用

**以下情况不宜使用内联：**   
（1）一般函数体内的代码**超过 10 行**，使用内联将导致**内存消耗代价较高**。   
（2）如果函数体内出现**循环**，那么执行函数体内代码的时间要比函数调用的开销大。
（3）类的构造函数和析构函数容易让人误解成使用内联更有效。当心 [[C++ Runoob Tutoral#类构造函数 & 析构函数]] 可能会隐藏一些行为**，如"偷偷地"执行了**基类或成员对象**的构造函数和析构函数。所以不要随便地将构造函数和析构函数的定义体放在类声明中。
## 类构造函数
将函数中的变量字段定义更简洁地不写在函数体中，函数中的 const 变量中必须在列表中初始化，不能被赋值
```cpp
Line::Line( double len): length(len){
    cout << "Object is being created, length = " << len << endl;
}//等价于
Line::Line( double len){
    length = len;
    cout << "Object is being created, length = " << len << endl;
}
```
按照声明的顺序初始化的，而不是按照出现在初始化列表中的顺序。
```cpp
class CMyClass {
    CMyClass(int x, int y);
    int m_x;
    int m_y;
};
CMyClass::CMyClass(int x, int y) : m_y(y), m_x(m_y){};
//认为首先做 m_y=I，然后做 m_x=m_y，最后它们有相同的值是错的但实际上按声明顺序初始化，m_x会是一个不确定的值。用列表初始化方式时初始化顺序和声明顺序一致有助于代码维护
```
### 构造函数
构造函数是一种初始化类的对象的各种属性的方法，类似于 [[Python Basics#^386d6a|python 中__init__方法]]
- **析构函数名必须和类名相同**
- python 中的初始化函数__init__不和类同名
- **创建对象之后**会执行所有构造函数函数体中的代码块，这叫**初始化对象**
- 构造函数可以有多个
- 构造函数中需要在别处调用的部分用 public 修饰
```cpp
class Line{
   public:
      line();  // 这是构造函数
      column(double len); // 这是带参数的构造函数
};
//下面定义构造函数，他不能有返回值，没有返回类型
Line::Line(void){
    cout << "Object line is being created" << endl;
}
Line::column(double value){
	double valuedefined = value;
    cout << "Object column is being created column was defined " << valuedefined << endl;
}
//下面创建对象，不是调用函数，初始化对象
int main(){
	Line line;//创建对象line
	Line Object(10.0);//传入参数创建对象Object，参数被传入类中column构造函数
}
//返回结果
//一个带参数的构造函数输出自身内容和无参数构造函数内容
Object line is being created
Object column is being created column was defined 10  //参数显示在结果中
```
### 构造函数的特点
所有构造函数的特征是：
1. **名称与类名相同**：构造函数的名称必须与类名完全相同，没有返回类型，也不包括返回值。
2. **无返回值**：构造函数不返回任何值，包括 `void` ，不能在函数中写 return 语句
3. **自动调用**：当创建类的对象时，构造函数会自动被调用，用于初始化对象，对象在销毁前，析构函数会自动调用，都只会调用**一次**。
4. **可重载**：一个类可以有多个构造函数，只要它们的[[C++ Basics#函数重载满足条件|参数不同]]，这称为构造函数的重载。
5. 注意创建对象就会调用构造函数，`class_name object_name();` 这样的写法编译器认为是一个返回值为 class_name 类型的函数声明，不会调用默认构造函数
### 拷贝构造函数
- 其参数列表是固定的，`类名(const 类名 &中间代号名)`
	- const 为了防止构造新对象过程中不会修改原始对象
	- &作用是如果拷贝构造函数的参数不是引用，那么它将无法绑定到临时对象（右值）上，不使用引用而用值传递会将时间和空间浪费在对象的复制创建中
- 拷贝构造函数的引入是为了让对象在初始化时能够像简单变量一样的被直接用来赋值
	- **实现深拷贝**：对于包含动态分配内存或其他资源的类，拷贝构造函数负责执行深拷贝，确保新对象和原对象拥有**完全独立**的资源副本，避免资源共享导致的问题。
- 拷贝构造函数的函数体决定了如何将一个对象的属性复制到新创建的对象中。

为了让 ↓ ↓ ↓实现，则必须指定如何创建副本
下面的 MyClass 是写在类中的函数，不是类（构造函数和类同名）
```cpp
MyClass(const MyClass& other) {//传入本身类
value = other.value; // other表示外部传入的变量
//other是别名，代表旧对象，obj1， value = other.value;表示新对象obj2会拥有obj1中的使用赋值格式赋值对象相同的value属性

MyClass obj1;//创建一个对象，用无参构造函数重载
MyClass obj1(10); // 创建一个对象，并调用对象的有参构造函数初始化
MyClass obj2 = obj1; // 创建obj2作为obj1的副本，重载无参对象，拷贝函数定义只允许复制value属性
MyClass obj3 = MyClass(obj1);//调用析构函数重载创建对象，等价与上面一行
MyClass(10);//创建匿名对象，执行结束后，系统立即回收
MyClass obj4 = 10;//是一种隐式转换，编译器转换为MyClass obj4 = MyClass(10)
```
### 析构函数
- **析构函数名必须和类名一致**，前加~表示为析构函数，不能带有参数
- 可以在析构函数中写函数执行之后的操作，实现每次调用相关函数后自动“善后”。如关闭文件，释放内存。构造函数只能有一个

### 类构造函数实例
```cpp
//友元函数，析构函数，构造函数，拷贝构造函数
#include<iostream>
#include<string>
using namespace std;
//类
class Myclass{
    public:
        int attribute1;
        int attribute2;
        //成员函数声明
        int get_attribute1(int x);
        void display_attribute2();
        Myclass();          //构造函数声明
        ~Myclass();         //析构函数声明
        Myclass(const Myclass &copyone);        //拷贝构造函数声明
        friend void show_attribute34(Myclass& copyone);   //友元函数声明
    private:
        string attribute3 = "attribute3";
    protected:
        string attribute4 = "attribute4";
};
//三个函数定义
int Myclass::get_attribute1(int x){
    attribute1 = x;
    return attribute1;
}
void Myclass::display_attribute2(){
    attribute2 = 100;
    cout << "attribute2 is something." << endl;
}
Myclass::Myclass(const Myclass &copyone){
    cout << "i have created a copyone copied by object !" << endl;
}
//构造函数和析构函数定义
Myclass::Myclass(void){
    cout << "object is created" << endl;
}
Myclass::~Myclass(void){
    cout << "the object has been defined !" << endl;
}
//友元函数定义
void show_attribute34(Myclass& object_name){
    cout << "the copyone got attribute1&2 to his attribute3&4 " << object_name.attribute1 << "and" << object_name.attribute2 << endl;
}
int main(){
    Myclass object;
    cout << "attribute 1 = " << object.get_attribute1(10) << endl;
    object.display_attribute2();
    Myclass object2 = object;
    show_attribute34(object);
    return 0;
}
///返回结果
object is created
attribute 1 = 10
attribute2 is something.
i have created a copyone copied by object !
i have created a copyone copied by object !
the copyone got attribute1&2 to his attribute3&4 attribute3andattribute4
the object has been defined !//由于object有析构函数，object2复制object1，show_attribute34中的object是值引用，复制一个object副本使用，使用时同样有析构函数，总共三条defined信息
the object has been defined !
the object has been defined !
//将show_attribute34中的参数列表设为值引用即可访问、修改原对象属性返回两条析构提示
void show_attribute34(Myclass& object_name)
定义和生命都需要修改
```
## this 指针
每一个非静态成员函数只会诞生一份函数实例，也就是说多个同类的对象会共用一块代码
那么问题是：这一块代码是如何区分那个对象调用自己的呢？
### 解决名称冲突
- this 用在类中函数定义、声明里，是一个**指向被调用的成员函数***所属的对象*（也就是当前函数所属的对象）的实例的指针。
- 因为友元函数不是类的成员，类的实例中没有友元函数，只有成员函数有 this 指针
- 当成员函数的参数列表形参名和类中其他变量名相同时 this 可以清晰指出值来源
	- 当形参名和其他变量不同名也可以使用 this 指针 **指代成员变量**，为了表意清晰
- **设计意义**： `this` 指针的存在使得成员函数能够区分**成员变量（使用 this）和局部变量（不使用 this ）**（如果有的话），以及允许成员函数访问对象的其他成员。
```cpp
class MyClass {
private:
    int value;//使用this指针可以区分同名的参数和变量，如本行value和setValue函数中的参数value
public:
    void setValue(int value) {
        this->value = value;//this指向通过MyClass类创建的对象，这个对象访问它的value成员变量得到的是private中的value值
        //上面代码等价于   MyClass创建的对象名.value = value;
    }
}
int main(){
	obj.setValue(42);//调用setvalue函数，函数this调用obj对象，并将42通过this(这里指代obj)->value = value赋值给private中的value
}
```
### 返回对象本身
- 每次调用成员函数，this都会隐式传递对象的地址来调用，如定义 `int A = 1;` 在函数/方法中会被编译器换为 `this-> int A = 1;`
	这句话意思是使用 `object_name.method()` 调用时，对象的地址会被传送给 method 方法作为参数，但因为隐藏传送所以method 函数不需要定义这个参数，传递地址给 method 的意义是让函数中一旦使用了 this 能让函数知道 this 指代的是谁
- 关键是函数类型为 `class_name&`，并且 return \*this
- this 指针作用类似于 [[Python Basics^self]]
```cpp
#include<iostream>
using namespace std;
class cuboid{
    private:
        double length, width, high;
    public:
        cuboid& set_cuboid(){
            cout << "input the index of cuboid :";
            cin >> this->length >> this->width >> this->high;//加this表示设置的长宽高只允许当前的 长方体对象有
            return *this;//返回当前的长方体
        }
        cuboid& show_volume(){
            cout << "the volume = " << this->length * this->high * this->width << endl;
            return *this;
        }
        cuboid& make_it_double(){
            this->high += this->high;
            this->width += this->width;
            this->length += this->length;
            return *this;
        }
};
int main(){
    cuboid a;
    a.set_cuboid()        // 创建一个初始长方体
        .show_volume()    // 初始长方体体积
        .make_it_double() // 双倍各种属性
        .show_volume()
        .make_it_double()
        .make_it_double()
        .make_it_double() // 16倍属性
        .show_volume();
    return 0;
} 
int main(){
    Cuboid cuboid1;
    //链式调用，返回值必须为 *this ，成员函数返回类型也要配合写为类的地址引用 Cuboid&
    cuboid1.creat_a_cuboid(1.0, 2.0, 3.0)//设置一个基本方块
        .info()//继续完成其他功能
        .volume()
        .surface();
    return 0;
}
```
## 指向类的指针
创建类的对象后使用 `MyClass *ptr = &obj` 表示 ptr 的类型是一个 class 指针，之后可以通过 `ptr->类成员名` 调用其中成员
可以使用指向类的指针创建类的新对象 `MyClass* obj = new MyClass(20);` 表示创建一个新的 MyClass 对象，对象的名称为 obj，MyClass 中构造函数传入 20 参数（前提必须定义构造函数，没有可以不传入）
指向类的指针可以作为参数，因此这种函数只能定义在类外
### new 关键字
1. **动态内存分配**：允许在程序运行时分配内存（动态分配），不在编译时分配（静态分配）。
2. **返回指针**：返回指向新分配内存的指针，允许程序在运行时确定内存的使用。
动静态数组：
1. **静态数组（`int array[5];`）**：
	- 这种方式在栈（stack）上分配内存，数组的大小必须在编译时已知。
	- 数组的生命周期与作用域绑定，当声明它的代码块执行完毕时，数组会自动被销毁。
	- 这种数组的大小是固定的，不能在运行时改变。
1. **动态数组（`int* array = new int[5];`）**：
	- 使用 `new` 关键字在堆（heap）上分配内存，允许在运行时确定数组的大小。
	- 动态数组的生命周期直到使用 `delete[]` 显式释放内存之前，这提供了更大的灵活性。

`int* array = new int[5]` 表示新创建一个名为 array 的 int 型数组指针，他的内存大小是动态的，在运行中根据实际情况调整 `5` 的数值
```cpp
#include<iostream>
using namespace std;
class cl{
    public:
        double length;
        int value;
        cl(int wideth){
            this->value = wideth;//使用外部成员变量而不是局部，使用this，不然info中wideth值无法确定
            cout << "the width = " << value << endl;
        };
        void info(){
            cout << "the width = " << value << " the length = " << length << endl;
        }
};
void use_ptr(cl *apointer){//apointer是形参别名，只要类型是cl即可
    apointer->info();
}
int main(){
    //创建动静态指针
    cl *ptr = new cl(10);//指针的类型为cl表示初始化一个指向cl类的指针，ptr可以自由调用类中成员
    cl obj(1000);//cl的对象因为有构造函数，都需要传入参数
    ptr->length = 1.0;
    obj.length = 1000;
    ptr->info();
    obj.info();
    use_ptr(ptr);
    return 0;
}
```
## 类的静态成员
[[C++ Basics#静态成员]]
- 静态成员是类本身的成员，不为任何类的对象所特有，在内存中只有一份 copy ，所有对象共享（对任何一个静态变量的修改会反映在所有实例上），没有创建对象时仍可以通过 `::` 域解析运算符为**定义，调用**他们。有对象之后用 `.` 访问，定义，调用
- 其他类型的变量在创建对象时对象的属性都通过值传递传递副本给对应变量值[[C++ Basics#深浅拷贝注意事项|需要注意深浅拷贝问题带来的值传递非法访问错误]]
- 静态成员在类中仅仅是声明，要在类的外面定义，（**静态整型变量允许在类中定义，其他在类外**）定义给静态成员分配内存-- [[C++ Basics#内存分区模型|在编译之前为放在全局区的静态成员分配全局区内存]]。如果不加定义就会报错，初始化是生命存在，而定义是分配内存。[[C++ Runoob Tutoral#变量声明]]
### 静态变量
![[Pasted image 20240811131402.png|350]]
用 **static** 关键字来把类成员定义为静态，这意味着无论创建多少个类的对象，静态成员都只有一个副本。可以节省内存
静态成员在类的所有对象中是共享的。如果不存在其他的初始化语句，编译无法通过
通过 `int Box::objectCount = 0;` 在外部初始化变量
### 静态函数
- 静态成员函数没有 this 指针，只能访问静态成员（包括静态成员变量和静态成员函数）。
- 不像不同成员函数可以使用 this 访问类中的所有成员
# 继承
## 继承方式
三种继承方法，使用 `class 子类名:继承方式 继承父类名{类体}`
一个子类可继承多个父类，`,` 分割
语法：`class derived-class: access-specifier base-class` access-specifier 填访问修饰符，未使用默认 private ，原理上仍然是继承上一个类的属性 [[Python Basics#继承]]，访问修饰符的存在细化了继承。
父类中的： ↓ ↓ ↓   不会被继承
- 基类的构造函数、析构函数和拷贝构造函数。
  通过将不会被继承的内容放在函数的初始化列表中，用子类的初始化构造函数初始化父类中的变量
- 基类的重载运算符。
- 基类的友元函数。
重载运算符，友元函数和拷贝构造函数如需使用则**重新定义**
```cpp
#include <iostream>
// 基类
class Shape {
public:
    Shape(int w, int h) // 基类构造函数
        width = w;
        height = h;
    }
protected:
    int width;
    int height;
};
// 派生类
class Rectangle : public Shape // 派生自 Shape 类{
public:
    Rectangle(int a, int b) : Shape(a, b){ //将rectangle的形参传入shape中，传入子类方法的参数实际上通过shape(a,b)传给了父类
    }
};
int main(){
    Rectangle rect(10, 20); // 创建 Rectangle 对象
    // 输出 Rectangle 对象的 width 和 height
    std::cout << "Width: " << rect.width << std::endl;
    std::cout << "Height: " << rect.height << std::endl;
    return 0;
}
```
---

| 继承方式        | 基类的public成员   | 基类的protected成员 | 基类的private成员 | 继承引起的访问控制关系变化概括     |
| ----------- | ------------- | -------------- | ------------ | ------------------- |
| public继承    | 仍为public成员    | 仍为protected成员  | 不可见          | 基类的非私有成员在子类的访问属性不变  |
| protected继承 | 变为protected成员 | 变为protected成员  | 不可见          | 基类的非私有成员都为子类的保护成员   |
| private继承   | 变为private成员   | 变为private成员    | 不可见          | 基类中的非私有成员都称为子类的私有成员 |
## 重载运算符和重载函数
在同一作用域中的某个**函数**和**运算符**指定多个定义，分别称为**函数重载**和**运算符重载**。
1. 运算重载符不可以改变语法结构。
2. 运算重载符不可以改变操作数的个数。
3. 运算重载符不可以改变优先级。
4. 运算重载符不可以改变结合性。

重载函数中可以写另一个重载函数（每一个函数有作用域，这也是为什么重载函数写在类中和类外有不同的参数列表，写法，因为管辖域不同）
### 重载函数
- 重载声明是指一个与之前已经在该作用域内声明过的函数或方法具有相同名称的声明，但是它们的参数列表和定义（实现）不相同。
- 编译器通过传入参数类型与定义中的参数类型进行比较，选用最合适的定义。
- 例如有 day 函数，传入 work 类型的数据表示工作日，rest 类型是休息日，day 函数根据不同类型数据决定工作方式

**函数重载满足条件：**
* 同一个作用域下
* 函数名称相同
* 函数参数**类型不同**  或者 **个数不同** 或者 **顺序不同**
```cpp
#include<iostream>
#include<string>
using namespace std;
void day(int x){
    cout << "today is a workday." << endl;
}
void day(string y){
    cout << "today is a restday" << endl;
}
int main(){
    day(1);
    day("saturday");
    return 0;
}
```
### 运算符重载
- **运算符重载允许你为类定义运算符的自定义行为，但重载后的运算符的使用方式（语法）仍然遵循C++中该运算符的原始语法规则。**
- 运算符重载的意义是**通过函数**自定义不同数据类型的数据计算方式，函数名由编译器命名 `operator符号名称`。
- 函数重载的方式可以是成员函数，也可以是全局函数
- 大部分运算符都可以重载，即使用类似函数定义的方法定义运算符的意义
以下运算符不可重载：
- `.`：成员访问运算符
- `.` ，`->`：成员指针访问运算符
- `::`：域运算符
- `sizeof`：长度运算符
- `?:`：条件运算符
- `#`： 预处理符号
- 现在需要将两个 Box 对象的属性值相加返回新的 Box 对象
- 普通非成员函数定义方法：`Box operator+(const Box&, const Box&);` 表示+这个 operator 被重载为接受两个 Box 类型的地址参数，返回一个 Box 结果的运算符
- 类成员函数定义方法 ：`Box operator+(const Box&)`, 因为重载函数在类中，可以用 this 指代类的对象，只需要一个指代另一个对象即可相加
- 在符号重载函数相同管辖域中没有其他符号重载函数时**运算符重载函数中的符号为原有含义**
#### 运算符重载的本质
以一元运算符重载为例
```python
//成员函数重载本质调用
Person p3 = pl.operator+(p2);
//全局函数重载本质调用
Person p3 = operator+(p1,p2):
```
成员函数调用本质上是在类中添加了成员方法，全局函数则是调用了外部函数
本质上是通过函数定义新的计算方法，既然是函数，就有函数的所有性质，比如**重载**
#### 一元运算符重载
- 递增运算符（ ++ ）和递减运算符（ -- ）
- 一元减运算符，即负号（ - ）
- 逻辑非运算符（ ! ）
定义在类中则调用时不需要参数，类外部需要一个参数
#### 二元运算符重载
对两个对象操作的符号就是二元运算符
```cpp
#include<iostream>
#include<string>
class Box{
    public:
        double length;
        double wideth;
        double height;
        double get_volume(){
            std::cout << "volume of box is = " << length * height * wideth << "\n";
        }
        double get_surface(){
            std::cout << "surface of box is = " << (length * wideth + wideth * height + height * length) * 2 << std::endl;
        }
        //双目运算符，定义在类中就表示类的对象是一个参数，需要一个外部参数，
        Box operator-(const Box& inside_class2){
            Box box4;
            box4.length = this->length - inside_class2.length;
            box4.wideth = this->wideth - inside_class2.wideth;
            box4.height = this->height - inside_class2.height;
            return box4;
        }
};
//外部定义重载，双目运算符需要两个参数
Box operator+(const Box& b1, const Box& b2){
    Box box3;
    box3.length = b1.length + b2.length;
    box3.wideth = b1.wideth + b2.wideth;
    box3.height = b1.height + b2.height;
    return box3;
}
int main(){
    //创建对象
    Box box1;
    Box box2;
    Box box3;
    Box box4;
    box1.length = 1;
    box1.wideth = 2;
    box1.height = 3;
    box2.length = 4;
    box2.wideth = 5;
    box2.height = 6;
    box1.get_surface();
    box2.get_surface();
    box3 = box1 + box2;
    box3.get_surface();
    box1.get_volume();
    box2.get_volume();
    box4 = box2 - box1;
    box4.get_volume();
    return 0;
}
```
#### 关系运算符重载
判断两个对象是否相等
```cpp
#include<iostream>
class Point{
    public:
        int x, y;
        Point(int a,int b):x(a),y(b){}
        bool operator==(const Point& other){
            return this->x == other.x && this->y == other.y;
        }
        bool operator!=(const Point& other){
            return !(*this == other); //==已经重载可以使用其中的含义
        }
};
int main(){
    using namespace std;
    Point p1(1, 2);
    Point p2(1, 2);
    Point p3(2, 3);
    if (p1==p2){
        cout << "p1 is equal to p2 " << endl;
    }else
        cout << "p1 is equal to p2 " << endl;
}
```
#### io 运算符重载
重载<<与>>使用时需要提前定义好对象（通过成员函数形式），在写入输入输出时调用相应方法排版很不自然，所以一般将重载函数重写友元函数，这样虽然重载定义在类中，却可以不创建对象而调用方法
例如定义成员函数 dl 重载<<，那么使用 cout 时需要使用 `d1<<cout;` 调用输出流
```cpp
friend ostream &operator<<(ostream &output, const Distance &D)
{ //cout是ostream类中对象，创建一个名为output的ostream对象，所以可以使用<<建立输出流
    output << "F : " << D.feet << " I : " << D.inches;
    return output;
    //常规的cout语句会有多个<<，所以定义返回值为ostream类型本身output方便链式调用
}
friend istream &operator>>(istream &input, Distance &D)
{//同理
    input >> D.feet >> D.inches;
    return input;
}
int main()
{
   Distance D1(11, 10), D2(5, 11), D3;
   cout << "Enter the value of object : " << endl;
   cin >> D3;
   cout << "First Distance : " << D1 << endl;
   cout << "Second Distance :" << D2 << endl;
   cout << "Third Distance :" << D3 << endl;
   return 0;
}
```
- 由于函数的第一个参数是 `ostream` 类型的引用，而第二个参数是 `Distance` 类型的常量引用，这意味着只有当 `<<` 运算符的左侧操作数是 `ostream` 类型（如 `cout`、`cerr` 等），而右侧操作数是 `Distance` 类型时，这个重载的 `<<` 运算符才会被调用。
- 在友元函数定义内部定义了一个 output  ostream 对象，所以在函数定义内部使用 output

#### ++ --运算符重载
由于自增自减运算符有前缀后缀之分，使用前缀形式重载调用 `operator ++ () `，后缀形式重载调用 ` operator ++ (int) `。int 并不表示接收整数而是表示是后缀形式调用
#### 复合赋值操作符重载
+= ，-=这一类由基本算数运算符（ + 、 - 、 * 、 / )或位运算符(| 、 & 、~等）加 = 号构成的运算符，是把**左右操作数进行相应运算后的结果赋值给左操作符。**
`a += b;` 意味着  `a = a + b;`，在重载时需要现将返回值赋值给左值，然后再返回左值
```cpp
className & className::operator +=(className & right)//类中定义
{
    return (*this) = (*this) + right;
}
className& operator +=(className& left, className& right)
{
    return left = left + right;
}
```
#### 调用运算符重载
所有的函数，方法的调用都需要再名称后加 `()`
```cpp
#include <iostream>
using namespace std;
class Distance
{
-------omit the assignment part-------
      Distance(int f, int i){
         feet = f;
         inches = i;
      }
      // 重载函数调用运算符
      Distance operator()(int a, int b, int c)//注意operator返回的是Distance类型
      {
         Distance D;
         D.feet = a + c + 10;
         D.inches = b + c + 100 ;
         return D;
      }
      // 显示距离的方法
      void displayDistance()
      {
         cout << "F: " << feet <<  " I:" <<  inches << endl;
      }
};
int main()
{
   Distance D1(11, 10), D2;//因为()不是三个参数，()并没有被重载
   cout << "First Distance : "; 
   D1.displayDistance();
   D2 = D1(10, 10, 10); // invoke operator()
   cout << "Second Distance :"; 
   D2.displayDistance();
   return 0;
}
```
#### 下标运算符重载
下标运算 `[]` 语法是括号中填入一个数，所以重载只能有一个参数并且放在括号中
```cpp
int& operator[](int i)
{
    if( i >= SIZE )
    {//重载只能改变行为，不能改变语法，这里添加了一个在超出索引值后的报错提示
        cout << "索引超过最大值" <<endl; 
        // 返回第一个元素
        return arr[0];
	}
	return arr[i];
}
```
#### 类成员访问符(.)重载
#### 左右移运算符重载
这里使用座椅运算符进行说明
```cpp
----------//定义过程-----------
ostream& operator<<(ostream& cout,Person& p){
    cout << "a:" << p.m_A << "b:" << p.m_B;
    return cout;
}
```
- 左移运算符有两个操作数，注意左边的操作数如果是 osteam 类型将会把<<重载为输出运算，但因为输出过程中由 `cout<<"something"<<endl;` 这样的链式调用，`cout<<"something"` 的返回值必须是一个 cout 同类型数据才能继续调用其[[#运算符重载的本质|外部函数方]]实现链式调用
- 一般程序中将成员变量放入 private 中，初始化放在 public 中，将需要重载的函数标记为友元放入类中
```cpp
class Person {
	friend ostream& operator<<(ostream& out, Person& p);

public:

	Person(int a, int b)
	{
		this->m_A = a;
		this->m_B = b;
	}

	//成员函数 实现不了  p << cout 不是我们想要的效果
	//void operator<<(Person& p){
	//}

private:
	int m_A;
	int m_B;
};

//全局函数实现左移重载
//ostream对象只能有一个
ostream& operator<<(ostream& out, Person& p) {
	out << "a:" << p.m_A << " b:" << p.m_B;
	return out;
}

void test() {

	Person p1(10, 20);

	cout << p1 << "hello world" << endl; //链式编程
}

int main() {

	test();

	system("pause");

	return 0;
}
```
## 多态
当类之间存在层次结构，并且类之间是通过继承关联时，就会用到多态。调用成员函数时，会根据调用函数的对象的类型来执行不同的函数。**给程序提供拓展性**
形成多态需要的条件：
1、必须存在继承关系；(原因是本质上多态是一个大类中不同的小类，小类分别实现不同的功能)
2、继承关系必须有同名虚函数（**其中虚函数是在基类中使用关键字Virtual声明的函数，在派生类中重新定义基类中定义的虚函数时，会告诉编译器不要静态链接到该函数**）；
	同名因为不同大类的小类中都有同一个功能，但是功能的实现不同
	可以参考 python 中[[Python Basics#应用多态的具体例子|不同品牌空调实现同一功能的各自方法]]
	任何一个品牌的空调（大类）都可以制冷（小类功能），但是制冷技术不一样 (多态定义)
3、存在基类类型的指针或者引用，通过该指针或引用调用虚函数；
4、小类中共同的特点放在大类中，这样创建类的对象时既有共通的特点，又有小类的属性
### 类型适应
子类对象和父类对象可以合法赋值，虽然他们是不同类，但是有继承关系
```cpp
class class_name1;
class class_name2 public class_name1;
//在已有拷贝函数时
class_name1 = class_name2;
//子类赋值父类或反之都是合法的
```
基类指针可以指向子类对象
```cpp
class *class_name1;
class class_name2 public class_name2;
class_name1 = &class_name2;
//*class_name1和class_name2都是class类型且有继承关系
//那么指向类的指针自然同赋值一样可以复制子类对象（的地址）
```
基类引用可以指向子类对象
```cpp
class class_name1;
class class_name2 public class_name2;
&class_name1 = class_name2;
```
### 函数覆盖
继承中如果子类中定义一个与父类中完全相同（名称、参数列表、返回类型）的方法、函数时，会发生函数、方法覆盖，而不完全相同只是名称相同则会发生[[#重载函数|重载]]。
和 [[Python Basics#^ffc9cf|python]] 不同，python 中没有传统的重载定义
### 虚函数
```cpp
virtual void disp(基类名称 基类对象){//函数原型,不加virtual如传入子类仍然调用父类
	基类对象.积累方法//子类和父类都有同样名称的方法，根据传入的是子类还是父类决定使用谁
}//因为子类有函数覆盖，所以disp中可以传入子类对象
```
- 基类中使用关键字 **virtual** 声明的函数。在派生类中重新定义基类中定义的虚函数时，会告诉编译器不要静态链接到该函数。

- **虚函数**可以为private, 并且可以被子类覆盖（因为虚函数表的传递），但子类不能调用父类的private虚函数。不使用 virtual 表示成员函数，调用是指向父类而不是子类
- 无论虚函数[[#访问修饰符]]是什么，都会在编译时被放入虚函数表中，
### 纯虚函数
- 以便在派生类中重新定义该函数更好地适用于对象，但是您在基类中又不能对虚函数给出有意义的实现，这个时候就会用到纯虚函数。
- 定义虚函数函数体等于零即可创建虚函数 ` virtual void funtion()=0;`
- 只有成员函数才可以是虚拟的，因此友元不能是虚拟函数。但可以通过让友元函数调用虚拟成员函数来解决友元的虚拟问题。
- 类中每个成员都是一个接口，在 OOP 中继承的定义是父类定义“蓝图”，子类负责实现，纯虚函数定义函数体为 0，则父类因无法实现而接口不完整，不能创建**父类**对象。
- 虚函数定义一个接口，供**继承的子类**实现，通过[[#类型适应|基类指针指向子类]]的方式用派生类中定义的实现方式**覆盖虚函数**
## 数据抽象
只向外界提供关键信息，并隐藏实现细节，即只表现必要的信息而不呈现细节。
通过不同的访问修饰符将数据放入 private 或 protect 保护不被外部访问
```cpp
#include <iostream>
using namespace std;
class Adder{
   public:
      // 构造函数
      Adder(int i = 0)
      {
        total = i;
      }
      // 对外的接口
      void addNum(int number)
      {
          total += number;
      }
      // 对外的接口
      int getTotal()
      {
          return total;
      };
   private:
      // 对外隐藏的数据
      int total;
};
int main( )
{
   Adder a;
   a.addNum(10);
   a.addNum(20);
   a.addNum(30);
//用户只能被允许访问对外的接口，a.total获取内部细节是不允许的
   cout << "Total " << a.getTotal() <<endl;
   return 0;
}
```
![[Pasted image 20240814123236.png|total是内部细节]]
## 数据封装
- 把数据和操作数据的函数绑定，方便管理
- 常见的数据封装方式是类的 public 中定义函数原型，private 中定义变量，这样变量只能被类中其他成员访问，而不被外部调用。
- 把一个类定义为另一个类的友元类，会暴露实现细节，从而降低了封装性。理想的做法是尽可能地对外隐藏每个类的实现细节。
![[#访问修饰符]]
数据封装和抽象的不同
**关注点不同**：
- 封装关注的是数据和操作方法的绑定，以及对外部访问的控制。
- 抽象关注的是简化复杂性，通过隐藏实现细节来只暴露对象的主要特性和功能。
**实现方式**：
- 封装通过访问控制（如 `private`、`protected` 和 `public` 访问修饰符）实现。
- 抽象通过抽象类和接口（纯虚函数等）实现。
**目的**：
- 封装主要是为了数据保护和隐藏实现细节。
- 抽象主要是为了简化复杂性和提高代码的可读性与可维护性。
**侧重点：**
- 封装侧重于对象内部的设计，通过隐藏数据和提供访问方法来保护对象的内部状态。
- 抽象侧重于对象对外的接口设计，通过提供简化的接口来隐藏复杂的实现细节。

## 接口（抽象类）
定义一个函数为虚函数，**不代表函数为不被实现**的函数。
定义他为虚函数是为了允许用基类的指针来调用子类的这个函数。
是保证用父类创建的对象拥有父类虚函数，子类创建的对象有子类的虚函数（注意代码部分，不加 virtual 子类调用子类同名方法会指向父类）
![[#虚函数]]
定义一个函数为纯虚函数，**代表函数没有被实现**。
定义纯虚函数是为了实现一个接口，起到一个规范的作用，规范继承这个类的程序员必须实现这个函数。
不在子类函数中实现它就无法使用父类和子类创建任何对象
# 文件和流
**ofstream** 和 **fstream** 对象都可以用来打开文件进行写操作
open 函数语法 `void open(const char *filename, ios::openmode mode);`
`ios` 表示打开文件的模式，
| 模式标志       | 描述                                   |
| ---------- | ------------------------------------ |
| ios::app   | 追加模式。所有写入都追加到文件末尾。                   |
| ios::ate   | 文件打开后定位到文件末尾。                        |
| ios::in    | 打开文件用于读取。                            |
| ios::out   | 打开文件用于写入。                            |
| ios::trunc | 如果该文件已经存在，其内容将在打开文件之前被截断，即把文件长度设为 0。 |
多种模式混合使用需要使用管道符 `ios::out | ios::trunc`
`fstream` 提供的 close () 函数用来关闭文件，程序终止时，它会自动关闭刷新所有流，释放所有分配的内存，并关闭所有打开的文件。
## 人员信息录入系统
```cpp
#include<iostream>
#include<fstream>
#include<cstring>
int main(){
    using namespace std;
    bool condition = true;
    while(condition){
        char name[100];//因为Cin.getline需要接受char的C风格字符串
        char age[10];
        fstream file;
        file.open("test.txt", ios::app);
        cout << "input your name in test.txt : \t";
        cin.getline(name, 100);
        if (strcmp(name, "q")== 0){//c风格字符串的比较不能用==
            break;//跳出循环
        }
        file << name << "\t\t\t";
        cout << "input your age in test.txt : \t";
        cin.getline(age, 10);
        file << age << "\t\t\t\n";
    }
    return 0;
}
```
- 在 C++中，== 运算符用于比较两个对象的值是否相等。字符串对象的值可以用 `==` 比较，但是 name 和 age 使用 C 风格字符数组，字符数组作为对象处理，获取值 `==` 运算符比较的是两个指针的值，而不是它们指向的字符串内容。**需要借助 strcmp 函数**
- 想要使用表达式方式比较字符串内容需要这样改写：
```cpp
string name;
getline(cin, name);
if (name == "q"){/
```
- <<与>>在上述代码中根据前后对象类型不同多次重载，`file << name << "\t\t\t";` 中 file 是文件对象，<<重载为处理文件对象的功能，才能把me 放入文件流中
- `numeric_limits<streamsize>::max()`：这是一个**模板类** `numeric_limits` 的静态成员函数，返回类型 `streamsize` 类中显示最大值的函数 `max()`。
- PS：最后一个参数是只能是字符而不能是字符串，所以**字符常量用‘’，字符串用“”**

## cin. ignore () 函数
`cin.ignore()` 不输入任何参数时，它将默认忽略掉输入流中的下一个字符。
语法：`cin.ignore(int n, char a)`
从输入流 (cin) 中提取字符，提取的字符被忽略 (ignore)，不被使用。每抛弃一个字符，它都要计数和比较字符：
如果计数值达到 n 或者被抛弃的字符是 a，则 cin.ignore()函数执行终止；
否则，它继续等待。它的一个常用功能就是用来清除以回车结束的输入缓冲区的内容，消除上一次输入对下一次输入的影响。
`cin.ignore(1024,'\n')`，通常把第一个参数设置得足够大，这样实际上总是只有第二个参数 \n 起作用，所以这一句就是把回车(包括回车)之前的所以字符从输入缓冲(流)中清除出去。
# 异常处理
类似于 [[Python Basics#python异常]]，但是只涉及到 `try`，`catch`，`throw` 三个关键字
- 异常的名称都是 exception 库文件中定义好的类，Vscode 中显示绿色，和 python 中一样，当返回的类是一个异常类（错误的代码执行后会有一个返回结果指向对应的异常类）既然是类，就可以自定义一个类，并告诉编译器（通过继承 exception 类）这个类是一个**错误类**

## 异常控制
1. `try`：用于标识可能抛出异常的代码块。`try` 块后面必须至少跟随一个 `catch` 块。
2. `catch`：用于捕获并处理 `try` 块中抛出的异常。可以指定它能够处理的异常类型。
3. `throw`：用于显式地抛出一个异常。当 `throw` 语句被执行时，它会立即终止当前函数的执行，并将控制权传递给能够处理该异常的 `catch` 块。
4. `throws`（在函数声明中使用）：用于声明函数可能抛出的异常类型。这有助于调用者了解函数可能引发的异常，从而进行适当的异常处理。
5. `exception`：是所有标准异常的基类，位于 `<exception>` 头文件中。你可以通过继承 `std::exception` 来创建自定义异常类。
```cpp
#include <iostream>
#include <exception>
// 自定义异常类
class MyException : public std::exception {
public:
    const char* what() const throw() {
//void fun() throw(A，B，C，D);throw可能抛出ABCD四种类型的错误，给开发者看的
        return "MyException occurred";
    }
};
void functionThatThrows() {
    // 抛出异常
    throw MyException();
}
//functionThatThrows是可能出现的代码
int main() {
    try {
        functionThatThrows();
    } catch (const MyException& e) {
        // 捕获并处理异常
        std::cout << "Caught exception: " << e.what() << std::endl;
    } catch (...) {
        // 捕获所有其他异常
        std::cout << "Caught some other exception" << std::endl;
    }
    return 0;
}
```
- 所有继承自 `std::exception` 的类都被视为异常类。这是因为 `std::exception` 提供了异常处理所需的标准接口
- 使用 `throw` 关键字时，直接抛出（有点像是 return，但 Throw 出的信息会被编译器认为是异常信息）一个异常对象，或者抛出一个异常对象的指针。`throw "Division by zero condition!";` 表示抛出一个返回值为"Division by zero condition!"; 的字符串
	`throw MyException(); // 直接抛出异常对象`
	`throw new MyException(); // 抛出异常对象的指针` 
- `catch (const MyException& e)` 中 e 是一个引用，指向这次错误，不写&e 是一个变量
- `catch(...)` 表示捕获所有其他异常，这段代码需要放在所有其他 `catch` 函数之后
# 动态内存
C++ 程序中的内存分为两个部分：
- **栈：** 在函数内部声明的所有变量都将占用栈内存。
- **堆：** 这是程序中未使用的内存，在程序运行时可用于动态分配内存。
**new**运算符：给定类型的变量在运行时分配**堆**内的内存，这会**返回所分配的空间地址**。`new data-type;` 可以创建一个对象，并分配动态内存
**delete** 运算符，删除之前由 new 运算符分配的内存。
```cpp
#include <iostream>
using namespace std;
int main (){
   double* pvalue  = NULL; // 初始化为 null 的指针
   pvalue  = new double;   // 为变量请求内存
   *pvalue = 29494.99;     // 解开指针得到pvalue指针中的地址，在相应地址中放入值
   cout << "Value of pvalue : " << *pvalue << endl;
   delete pvalue;         // 释放内存
   return 0;
}```
申请变量，指针，数组为动态内存的语法
## 一维数组分配
```cpp
char* pvalue  = NULL;   // 初始化为 null 的指针
pvalue  = new 数据类型定义; // 为变量请求内存
//数组需要这样请求
pvalue  = new char[20];
delete [] pvalue;//删除数组操作
```
```cpp
//一维数组定义和删除
double* array = new int[m];、
```
- //不要以为表示创建一个array指针，指针的地址中放入一个长度为m的整形数组对象！
- //new返回**地址**，所以- `new int[m];` 这部分代码在堆上分配了 `m` 个连续的 `int` 类型的空间，并返回指向第一个 `int` 元素的指针（数组名称指向第一个元素）。
- 其中需要注意类型匹配问题：int 整形数组的**地址**却被赋值到 double 指针上
## 二维数组分配
```cpp
int **p; 
int i,j; 
//p[4][8] //开始分配4行8列的二维数据 
p = new int *[4];
```
`int* [4]` 表示创建存储内存地址存储四个指向 int 类型的指针
`new` 返回这个存储地址
`p` 接受赋值这个地址
`**p` 表示 p 是二级指针，访问 p 得到的值是指向四个 int 类型的指针，再访问

## 三维数组分配
```cpp
#include<iostream>
using namespace std;
int main(){
    //create 3 dimension array
    int ***array;
    int i, j, k; // [3][4][5]
    array = new int **[3];
    for (i = 0; i < 3; i++){
        array[i] = new int *[4];
        for (j = 0; j < 4; j++){
            array[i][j] = new int[5];
        }
    }

    // fill contend in array and print
    for (i = 0; i < 3;i++){
        for (j = 0; j < 4; j++){
            for (k = 0; k < 5; k++){
                array[i][j][k] = i * j * k;
                cout << array[i][j][k] << "\t";
            }
            cout << endl;
        }
        cout << endl;
    }

// release the resource

    for (i = 0; i < 3; i++){
        for (j = 0; j < 4; j++){
            delete[] p[i][j];
        }
    }
    for (i = 0; i < 3; i++){
        delete[] p[i];
    }
    delete[] p;
 return 0;
}
```
## 总结
数组分配本质上是在数组指针中创建数组，并用低一级的指针指向低一级的数组，使用 new 表示在堆中创建数据。
### new 和 malloc
- new 的功能是在堆区新建一个对象，并返回该对象的指针。
	所谓的**新建对象**的意思就是，将调用该类的构造函数，因为如果不构造的话，就不能称之为一个对象。
- 而 malloc 只是机械的分配一块内存，用 mallco 在堆区创建对象，不会调用构造函数。
	严格说来用 malloc 不能算是新建了一个对象，只是分配了一块与该类对象匹配的内存而已，然后强行把它解释为【一个对象】，按这个逻辑来，也不存在构造函数什么事。
	
- 同样的，用 delete 去释放一个堆区的对象，会调用该对象的析构函数。
- 用 free 去释放一个堆区的对象，不会调用该对象的析构函数。

### delete 和 delete[]
delete 只能用来删除单个对象的内存或者整个数组、指针的内存。对数组内元素管理一般使用 vetor 防止手动管理的错误
```cpp
int *p;
p = new int [4];

delete [] p;  // 理论上：删除p指向的整个数组。
delete p; // 理论上：删除p指向的数组的第一个int 元素。验证不会报错。
delete *p; //报错。语法错误。
```
如果ptr代表一个用new申请的内存返回的内存空间地址，即所谓的指针，那么：
-  **delete ptr** -- 代表用来释放内存，且只用来释放ptr指向的内存。
-  **delete[] rg** -- 用来释放rg指向的内存，！！还**逐一调用数组中每个对象的** destructor！！
对于像 int/char/long/int*/struct 等等简单数据类型，由于对象没有 destructor，所以用 delete 和 delete [] 是一样的！但是如果是C++ 对象数组就不同了！


# 命名空间
使用 `using namespace 命名空间名` 不存在则会自动创建
如果只想使用命名空间的一部分，则使用这部分时就可以不用加前缀，而其他部分需要
```cpp
using std::cout;
int main()
{
    int a;
    cout << "std::endl is used with std!" << std::endl;
    std::cin >> a;
    return 0;
}
```
### 命名空间的不连续
命名空间可以定义在几个不同的部分中，因此命名空间是由几个单独定义的部分组成的。一个命名空间的各个组成部分可以分散在多个文件中。
```cpp
namespace namespace_name {
   // 代码声明可以是新创建的命名空间定义，也可以是对已有命名空间的补充
}
```
所以，如果命名空间中的某个组成部分需要请求定义在另一个文件中的名称，则仍然需要声明该名称。
```cpp
int main(){
using namespace nspace0;
	func0();//func0 inside nspace0
	nspace1::func1();
}
```

### 嵌套命名空间
```cpp
namespace namespace_name1 {
   // 代码声明
   namespace namespace_name2 {
      // 代码声明
   }
}

// 访问 namespace_name2 中的成员
using namespace namespace_name1::namespace_name2;
// 访问 namespace_name1 中的成员
using namespace namespace_name1;
```
使用的是 namespace_name1，那么在该范围内 namespace_name2 中的元素也是可用的
只使用 `::变量名` 表示使用当前命名空间的变量，没有指明默认**先在局部变量**中查找，后在**全局变量中**查找