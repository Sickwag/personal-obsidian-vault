## 缓冲机制的工作原理

流的缓冲机制是一种优化数据传输效率的技术。它涉及在内存中创建一个临时存储区域（即缓冲区），用于暂存数据，直到满足某些条件时才将数据实际写入目的地（如文件、屏幕等）或从数据源（如文件、键盘等）读取数据。这种机制可以减少对慢速设备（如硬盘或网络）的访问次数，从而提高程序的性能。

### 缓冲机制的工作原理：

1.**输出流缓冲**：当数据写入输出流时，数据首先被放入缓冲区。只有当缓冲区满、遇到换行符、显式调用刷新操作（如 `std::flush` 或 `std::endl`）或流被关闭时，缓冲区内的数据才会被实际写入目的地。

2.**输入流缓冲**：对于输入流，数据从数据源读取到缓冲区中。当程序需要数据时，它首先检查缓冲区中是否有可用数据。如果缓冲区中有数据，程序就从缓冲区读取数据，而不是直接从数据源读取。只有当缓冲区为空时，才会从数据源再次读取数据填充缓冲区。

### 缓冲区的类型：

- **无缓冲流**：数据直接写入目的地或直接从数据源读取，不使用缓冲区。例如，`std::cout` 在没有 `std::flush` 或 `std::endl` 的情况下，通常不会立即显示输出。
- **行缓冲流**：缓冲区在遇到换行符时刷新。例如，标准输出流 `std::cout` 在某些系统上默认是行缓冲的，这意味着每次输出换行符时，缓冲区内的内容会被写入目的地。
- **全缓冲流**：缓冲区在填满时刷新。例如，文件流在关闭或缓冲区满时会将数据写入文件。

### 缓冲机制的控制：

在C++中，可以使用以下方法来控制流的缓冲行为：

- `std::flush`：强制刷新输出流，将缓冲区内的数据立即写入目的地。
- `std::endl`：除了刷新输出流外，还会插入换行符。
- `std::unitbuf`：在接下来的输出操作后立即刷新缓冲区。例如，`std::cout << std::unitbuf << "Hello, World!" << std::endl;` 会立即输出 "Hello, World!" 并换行。

### 示例：控制输出流的缓冲

```cpp
#include <iostream>

int main() {
    std::cout << "This might not be immediately printed." << std::endl;
    std::cout << "This will be printed immediately due to the endl manipulator." << std::endl;
    std::cout << std::unitbuf << "This will also be printed immediately." << std::endl;
    std::cout << "This might not be immediately printed again." << std::endl;
    std::cout << std::flush; // 强制刷新缓冲区
    return 0;
}
```

## 编译器代码报错建议

### 表达式必须具有算术或未区分范围的枚举类型

在C++中，当你看到错误信息 "表达式必须具有算术或未区分范围的枚举类型" 时，这意味着你尝试在一个需要算术类型（如 `int`、`float`、`double` 等）或未区分范围的枚举类型的上下文中使用了一个不合适的表达式。
这个错误通常发生在以下几种情况：
1. **算术运算**：你可能在需要一个数值的地方使用了一个非数值类型的表达式。例如，尝试对一个字符串或自定义类型进行加法运算。
2. **条件表达式**：在 `if`、`while`、`for` 等条件语句中，你必须使用一个可以解析为 `true` 或 `false` 的表达式。如果使用了非布尔类型的表达式，可能会出现这个错误。
3. **数组索引**：在使用数组时，索引必须是一个整数类型，如果你使用了非整数类型的表达式，也会出现这个错误。
4. **位运算**：位运算符（如 `&`、`|`、`^` 等）要求操作数必须是整数类型，如果使用了非整数类型的表达式，也会导致这个错误。
**解决方法**
- 确保在进行算术运算时使用的是数值类型。
- 在条件表达式中使用布尔表达式。
- 在数组索引中使用整数类型。
- 在位运算中使用整数类型。

```cpp
#include<iostream>
using namespace std;
void info_1()
{
    cout << "Three blind mice" << endl;
}
}
int main(){
    info_1() * 2;//info_1没有返回值但使用算术运算导致错误,在前面定义中定义int info()并且设置一个整数(和函数类型匹配即可)return值即可使用算术运算
}
```

## 链接lambda表达式和封装函数

[C++ prime plus \> ](C++%20prime%20plus.md#^34a3d4)

## static_cast操作
`static_cast<int>(character)` 是C++中的一个类型转换操作，它用于将一个表达式转换为指定的类型。在这个例子中，`static_cast<int>` 将 `character`（假设它是一个字符类型）转换为`int`类型。这种转换通常用于获取字符的ASCII值或进行其他类型的转换
### `static_cast` 的作用

`static_cast` 主要用于以下几种类型的转换：
1.**非多态类型之间的转换**：如基本数据类型之间的转换（整型、浮点型、字符型等）。
2.**指针类型之间的转换**：如将 `void*` 指针转换为具体类型的指针。
3.**引用类型之间的转换**：如将 `const` 引用转换为非 `const` 引用。
4.**类类型之间的转换**：如将派生类指针转换为基类指针。
### 可以接收的参数

`static_cast` 可以用于以下类型的转换：

- **基本数据类型之间的转换**：如 `int`、`float`、`double` 等。
- **指针类型之间的转换**：如将 `void*` 转换为具体类型的指针。
- **引用类型之间的转换**：如将 `const` 引用转换为非 `const` 引用。
- **类类型之间的转换**：如将派生类指针转换为基类指针。

## 链接两个操作数不同时的结果类型

[操作数不同](C++%20prime%20plus.md#^2d6181)

## C++ prime plus的强制类型转换3.5

暂时觉得不重要跳过理解

## find_if筛选方法

完整语法: `find_if( InputIt first, InputIt last, UnaryPredicate p );`是一个**非修改型算法**, 传值方式是值捕获
- `first`：能够返回输入迭代器的表达式，指向要搜索的范围的开始。如数组第一个元素, `array.begin()`
- `last`：能够返回输入迭代器的表达式，指向要搜索的范围的结束。同上, 如`array.end()`
- `p`：condition表达式，用于测试迭代返回范围内的每个元素。接受一个参数并返回`bool` , true则元素被`find`,
- 将**第一个**符合的(被`find`的值),将**指向该元素的迭代器**作为返回值, 未找到则返回`last`迭代器(即最后一个元素的迭代器 , `.end()`)
### 存在问题
`std::find_if` 函数在找到满足条件的元素是可迭代对象的最后一个元素，以及没有任何元素满足条件时，都会返回 `last` 迭代器。它无法区分这两种情况。
### 解决方案
1. **检查迭代器是否等于 `begin()`**：如果 `std::find_if` 返回的迭代器等于 `begin()`，则表示没有找到满足条件的元素。
2. **使用 `std::distance` 计算距离**：通过计算返回的迭代器与 `begin()` 之间的距离，可以确定找到的元素是第一个元素还是没有找到元素。
```cpp
auto it = std::find_if(vec.begin(), vec.end(), [](int value) { return value > 3; });
if (it != vec.end()) {
std::cout << "Found at distance: " << std::distance(vec.begin(), it) << std::endl;
} else {
std::cout << "Not found" << std::endl;
}
```

3. **使用 `std::find_if_not`**：`std::find_if_not` 函数与 `std::find_if` 相反，它返回第一个不满足给定条件的元素的迭代器。如果所有元素都满足条件，它返回 `end()` 迭代器。

   ```cpp
auto it = std::find_if_not(vec.begin(), vec.end(), [](int value) { return value <= 3; });
if (it != vec.end()) {
   std::cout << "First element not satisfying condition: " << *it << std::endl;
} else {
   std::cout << "All elements satisfy condition" << std::endl;
}
   ```



## 迭代器
在C++中，**迭代器**（Iterator）是一种设计模式，用于提供一种方法顺序访问容器（如数组、列表、树、图等）中的元素，而无需暴露容器的内部表示。迭代器允许你遍历容器中的元素，而不需要知道容器的具体实现细节。

### 迭代器和指针

### 迭代器的主要特点：

1. **抽象化访问**：迭代器抽象化了对容器元素的访问，使得你可以使用统一的方式遍历不同类型的容器。
2. **类型安全**：迭代器提供类型安全的访问方式，避免了直接使用索引可能导致的类型错误。
3. **操作符重载**：迭代器通常重载了 `*`（解引用操作符）、`->`（成员访问操作符）、`++`（递增操作符）、`--`（递减操作符）等操作符，使得它们的行为类似于指针。
4. **状态保持**：迭代器保持容器内部状态，可以记住当前遍历的位置。
### 迭代器的类型

C++标准库提供了不同类型的迭代器，包括：

- **输入迭代器**：只读，单向遍历。
- **输出迭代器**：只写，单向遍历。
- **前向迭代器**：可读写，单向遍历。
- **双向迭代器**：可读写，双向遍历。
- **随机访问迭代器**：可读写，支持随机访问，类似于指针。


## 种子
**种子**（Seed）是一个初始值，用于初始化伪随机数生成器（Pseudo-Random Number Generator, PRNG）。种子是生成随机数序列的起点，不同的种子值通常会导致生成不同的随机数序列，同理，相同的种子值会得到相同的伪随机序列。

**工作原理** : 伪随机数生成器通过一个数学算法根据种子值生成一系列数字。这个算法保证了即使种子值相同，生成的一系列数字也会在统计上看起来是随机的。然而，由于算法是确定性的，相同的种子值会产生相同的数字序列。

**使用种子实例**
1. `time` 函数可以接受一个参数，这个参数是一个指向 `time_t` 类型的指针，用于存储时间值。如果传递 `NULL`，则 `time` 函数不会存储时间值，而是直接返回当前时间的 `time_t` 值( 自1970年1月1日（称为Unix纪元或Epoch）以来的秒数 )。
2. 将`time_t`类型数据转换为`unsigned`,确保其为正数不会溢出
3. `srand`根据`unsigned time_t`初始化伪随机数生成器, 并将当前系统时间作为种子
4. `rand()`函数根据伪随机数生成器的算法生成一个随机数

### 拓展 : 使用localtime和gmtime获取特定时间

```cpp
#include <iostream>
#include <ctime>

int main() {
    // 获取当前时间的time_t值
    time_t now = time(nullptr);
    // 将time_t值转换为本地时间的tm结构体
    tm localTime = *localtime(&now);
	// 将time_t值转换为UTC时间的tm结构体
    tm utcTime = *gmtime(&now);
    // 输出本地时间
    std::cout << "Local time: "
              << localTime.tm_year + 1900 << "-" // 年份
              << localTime.tm_mon + 1 << "-"    // 月份
              << localTime.tm_mday << " "       // 日期
              << localTime.tm_hour << ":"       // 小时
              << localTime.tm_min << ":"        // 分钟
              << localTime.tm_sec << std::endl; // 秒
    return 0;
}
```

## 内存地址

C++中声明 `int a = 100`，因为 int 类型占用 4 字节内存，所以操作系统在内存中找到四个编号连续的内存段，每段 1 byte 大小存储
![Pasted image 20240806125113.png](../Attachments/Pasted%20image%2020240806125113.png) 当变量（函数） a 被声明时才会被分配内存，被销毁时内存空间被释放，变量内容被销毁
使用 `std::cout << &a << endl;` 默认使用十六进制输出内存地址结果，可通过控制符更改
所有的控制写入都需要地址线输入 1 激活控制电路才能修改

### 对单个字节控制
一字节等于八位，1 bit = 8 bytes
![375](../Attachments/Pasted%20image%2020240807164015.png)
![375](../Attachments/Pasted%20image%2020240807164210.png)

### 控制一组字节
![译码器通过真值表充当选择功能|230](../Attachments/Pasted%20image%2020240807164608.png)
![350](../Attachments/Pasted%20image%2020240807164714.png)
![4位译码器控制1KB内存](../Attachments/Pasted%20image%2020240807165007.png)
更高容量的选择器（10 位译码器 1 KB）
![通过有限的地址输入控制指数级内存空间](../Attachments/Pasted%20image%2020240807164817.png)

### 内存地址空间表述

将地址线（因为地址线的输入决定了一次控制那一个 8 位的存储单元）的输入每四个换算成一个十六进制符号
![325](../Attachments/Pasted%20image%2020240807165431.png)
将变量地址解引用赋值指针，那么指针的值就是十六进制表示数
`int a = 1;` 操作系统分配 4 字节的连续存储空间，并将 1 通过转码放入其中
`int *p = &a ` 获得 a 的地址赋值给指针 p ，因为 int 有 4 字节，CPU 中[两个关键寄存器](../../学习/考研/汇编原理/汇编语言---王爽.md#^9c3422)分别获得地址的开头编号和地址长度两个信息，通过 cpu 通过他们的信息工作
`p = 0xf` 。而 `*p` 表示内存地址中放了什么东西
### 地址的引用

```cpp
int a =233;
int &b =a;
```
`&b` 表示有一个名称 b 他的地址（因为使用&解地址符号）是 a 的地址，但又没有之前声明，所以操作系统没有给**名称 b**分内存空间，这也就导致了他只是变量 a 的别名，这个别名的信息存放在 a 的位置，和 a 有**相同的地址空间**

### 内存地址的占用大小

内存地址使用与操作系统位数相同的空间占用存储内存地址信息，可以使用 `sizeof` 函数查看变量内存地址占用大小，64 位操作系统占用 8 字节
个人电脑 64 bit，操作系统会分配 `2^64-1` 地址空间编号，通过 16 进制表示。有 8 G 的寻址空间，超过创建的寻址空间的内存 `CPU` 无法编码，也就无法使用。但是在操作系统通过各种技术情况下低位 CPU 仍能**管理**超过上限的内存
这也说明 64 位程序无法在 32 位电脑上运行，因为程序产生的数据内存地址无法被 32 电脑获取

### 物理内存

![375](../Attachments/Pasted%20image%2020240806132033.png)
![375](../Attachments/Pasted%20image%2020240806132118.png)


## 获取数组长度的方法
#数组大小  #数组元素个数  #元素个数
在 C++中，获取数组长度的方法取决于数组的类型和上下文。以下是几种常见的方法：
常规方法是手动计算
`int length = sizeof(array) / sizeof(array[0])` 整个数组内存大小除以单个大小

- **`sizeof`**：`sizeof` 是一个运算符，用于计算数据类型或对象在内存中占用的字节数。它返回一个 `size_t` 类型的值，表示大小。
- **`size`**：`size` 通常是一个函数或方法，用于获取容器（一般需要头文件提前定义，如数组、向量等）中元素的数量。例如，`std::vector` 类型有一个 `size()` 方法，返回容器中元素的数量。
### 1. 使用 `sizeof` 运算符和数组元素的大小
如果你有一个数组变量，你可以使用 `sizeof` 运算符来计算整个数组的大小，然后除以单个元素的大小来得到数组的长度。前提是导入 `#inclue<array>` 数组使用 `array<int> arr` 定义

```cpp
int arr[] = {1, 2, 3, 4, 5};
int length = sizeof(arr) / sizeof(arr[0]);
```

### 2. 使用 `std::vector` 的 `size()` 方法
如果你使用的是 `std::vector`，可以直接调用 `size()` 方法来获取容器的长度。同上需要导入头文件和用 vector 定义数组

```cpp
#include <vector>
std::vector<int> vec = {1, 2, 3, 4, 5};
int length = vec.size();
```

### 3. 使用 `std::array` 的 `size()` 方法
对于 `std::array`，同样可以使用 `size()` 方法来获取数组长度。

```cpp
#include <array>
std::array<int, 5> arr = {1, 2, 3, 4, 5};
int length = arr.size();
```

### 4. 使用 `std::string` 的 `length()` 或 `size()` 方法
对于字符串，`std::string` 类提供了 `length()` 或 `size()` 方法来获取字符串的长度。

```cpp
#include <string>
std::string str = "Hello, World!";
int length = str.length(); // 或使用 str.size();
```

头文件中定义的新数据类型都提供了 `.size` 方法，字符串还提供了 `length`


## 获取字符串阻断问题

字符串比分配的空间长设置失效位，get 接收到空行设置失效位，恢复阻断方法 [C++ prime plus \> ](C++%20prime%20plus.md#^a1a64c)


## 为什么不能使用两个 getline？
getline 到底是干什么的？
```cpp
void addPerson(Addressbooks *abs)
{
    if (abs->m_Size == MAX ){ //judge whether the book it is full
        cout << "the dialogue book is full" << endl;
        return ;
    }else{
        // name
        string name;
        cout << "please input your name : ";
        getline(cin, name);
    }
    cout << "input your gender :\n"
         << "1------male\n"
         << "2------female\n"
         << endl;
    int sex = 0;
		while (true)
		{
			cin >> sex;//将这里改为getline(cin,sex);会报错
			if (sex == 1 || sex == 2)
			{
				abs->personArray[abs->m_Size].m_Sex = sex;
				break;
			}
			cout << "please input number 1 or 2";
		}
}
```

## 为什么&a 不能作为左值，而返回&a 的函数就可以？
### 为什么 `&a` 不能作为左值？

1. **地址是常量**：当你获取一个变量的地址时，这个地址是一个常量值，它指向一个特定的内存位置。在 C++ 中，你不能修改一个常量值，因此你不能将 `&a` 作为左值来使用。
2. **语义错误**：在 C++ 中，地址值通常用于指针赋值或比较地址，而不是作为赋值的目标。将地址作为左值使用在语义上没有意义，因为它不指向一个可以存储值的内存位置。
### 返回 `&a` 的函数就可以作为左值？

实际上，返回 `&a` 的函数本身返回的是**地址**，这个地址也是一个右值。但是，你可以将这个地址赋给一个指针变量，因为指针变量是用来存储地址的。

# 报错和解决
## 编译：xxx was not declared in this scope
**根本原因**：变量、函数、或者类未声明或者定义。  
**实际原因**：被调用的代码，写在调用处的下面了，比如：
```cpp
void funcA(){
	funcB();
	// do something
}

void funcB(){
	// do something
}
//将funcA和funcB调换位置即可
void funcB(){
	// do something
}

void funcA(){
	funcB();
	// do something
}
```

## 蓝色波浪线 Unknown word
拼写检查插件在字典中找不到单词，关闭或禁用即可
![Pasted image 20240904132704.png](../Attachments/Pasted%20image%2020240904132704.png)