[C++ Runoob Tutoral](C++%20Runoob%20Tutoral.md)
# 零碎知识
## 第一个C++程序
```cpp
# include "iostream"
using namespace std;
int main()
{
    cout <<"hello world"<< endl; // endl可以使用\n代替
    return  0;
}
```
## C++代码基础结构
```cpp
# include "iostream"
using namespace std;
```
表示调用与处理文件和使用std命名空间
```cpp
int main()
{
    cout <<"hello world"<< endl;
    return  0;
}
```
![Untitled 230.png](../../../Files%20&%20LongText/Attachments/Untitled%20230.png)
主函数表示程序的入口,从main函数开始运行
cout函数表示向外输出
endl表示输出一个换行符
return表示函数返回值
## 单工程多main函数
Clion使用工程管理代码, 每个程序使用一个工程 ,每个工程仅有一个main函数表示程序的入口
这样的管理规则不便于学习, 所以关闭将源代码添加到新目标的选项,每学习一个知识点使用一个C文件. 这样表示新创建的文件不属于下面learning工程
![Untitled 1 42.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2042.png)
## 手动编译代码运行
F5即可
## cout打印输出
![Untitled 2 34.png](../../../Files%20&%20LongText/Attachments/Untitled%202%2034.png)
- 双箭头之间的空格不会输出, 如果需要输出空格使用” “
- 输出多分内容时,不同数据格式的内容之间使用<<分割
- 每一个cout输出一行的内容到控制台( 屏幕 ), 不会自动换行,要使用endl
- 使用cin输入之后默认留下一个换行符,使下一段输出语句从新一行开始
## 代码注释
使用//注释在代码之后作为单行注释
使用/*开头*/结束作为多行注释
## clion 设置
![Untitled 3 31.png](../../../Files%20&%20LongText/Attachments/Untitled%203%2031.png)

### 函数功能
#### memset
`memset`是C语言标准库中的一个函数，用于将一块内存区域中的每个字节设置为特定的值。它通常用于初始化内存区域，比如将结构体或数组的所有字节设置为0（即清零）。
- 原型
`memset`的原型定义在`<string.h>`头文件中，如下所示：

```c
void *memset(void *s, int c, size_t n);
```
- 参数
- `s`：指向要填充的内存区域的指针。
- `c`：要设置的值，它会被转换为`unsigned char`类型。
- `n`：要填充的字节数。

`memset`函数返回一个指向`void`类型的指针，指向填充后的内存区域的起始地址。
# 基本认识
## 字面常量\标识符\符号常量
字面常量:被书写到代码内的常来那个叫做字面量
字面量为单个字符时, 使用’’单引号包围一个字符
字符串使用双引号,中间输入的内容是标准的字符串
对变量\结构体\函数\类等命名使用的字符串就是标识符( 表示实体的符号 )
命名规则同python[Python基础学习](https://www.notion.so/Python-acd35004ede9496a86c2aedac91622b4?pvs=21)
通过标识符定义的常量叫做符号常量, 同理变量叫做符号变量
![Untitled 4 27.png](../../../Files%20&%20LongText/Attachments/Untitled%204%2027.png)
符号常量定义在代码开头, 符号常量不需要分号结尾. 符号常量在函数中使用
当cout<< <<内容是中文字符串时, 输出显示乱码, 如果需要显示
1. 先导入windows.h头文件,并在需要显示中文字符的函数中使用`SetConsoleOutputCP(CP_UTF8);`表示将控制台输出字符编码转换为UTF8格式
2. 或者将控制台编码转换为65001 , 在需要恢复乱码的函数中使用`system( command “chcp 65001”)`: 这段代码不需要导入`window.h` . 这样会输出一句`Active code page: 65001`表示控制台代码为65001
3. 定义符号常量一般全部使用大写字母与变量区分
## 变量
变量是在程序运行过程中记录数据使用的容器
创建\使用变量时,先声明,再定义(赋值)
![Untitled 5 24.png](../../../Files%20&%20LongText/Attachments/Untitled%205%2024.png)
float 实型 int char(单个字符串) string
```cpp
\#include"iostream"
\#include"windows.h"
using namespace std;
int main(){
    SetConsoleOutputCP(CP_UTF8);
    string name,gender;
    int age;
    float height;
    string age;
    name = "小明";
    age = 18;
    gender = "male";
    height = 173.4;
    cout << name << "的身高是" << height << "性别是" << gender << "年龄是" << age << endl;
    return 0;
}
```
## 变量的特征
变量内容可变,方法是重新写一遍赋值语句(声明语句不用写),重新写声明语句变量类型会被覆盖
- 声明和赋值一起写
    ![Untitled 6 23.png](../../../Files%20&%20LongText/Attachments/Untitled%206%2023.png)
    
- 声明用逗号隔开不同变量的声明和赋值
    ![Untitled 7 23.png](../../../Files%20&%20LongText/Attachments/Untitled%207%2023.png)
## 标识符的命名规范
**符号常量**：满足标识符的硬性要求下，如若使用英文字母，应全部大写。  
**变量:** 满足标识符的硬性要求下，如果使用英文字母，不应全部大写（可大小写组合或纯小写）  
大小写的规范要求，是为了能够在复杂代码内，通过英文字母大小写快速区分：常量和变量  
大小驼峰法: 通过不同单词首字母大写分割单词, 简短单词使用全大写( 一般用于类命名 )
内容限定, 大小写敏感, 不可使用关键字, 一般不使用计算符号命名变量
# 数据类型
## C++常量确定
在未定义字面量类型时, 编译器会根据最小原则确定类型
![Untitled 10 18.png](../../../Files%20&%20LongText/Attachments/Untitled%2010%2018.png)
在数之后使用后缀标记告诉编译器是什么类型
![Untitled 11 18.png](../../../Files%20&%20LongText/Attachments/Untitled%2011%2018.png)
```cpp
\#include "iostream"
\#include "windows.h"
using namespace std;
int main(){
    SetConsoleOutputCP(CP_UTF8);
    cout << "the byte of " << 10 << " is " << sizeof(10) << endl;
    cout << "the byte of " << 999999999999999999 << "is" << sizeof(999999999999999999) << endl;
    return 0;
}
```
`sizeof()`可以计算字段的大小
	创建小数变量时默认使用`double`类型, 会比`float`更占用空间,范围不足自动拓容为`long`
## 无符号和有符号数字
signed/unsigned作为数据类型前缀, 默认singed 允许负数,
![Untitled 8 21.png](../../../Files%20&%20LongText/Attachments/Untitled%208%2021.png)
要规定只能是≥ 0 必须 unsigned标记,在强行给unsigned变量标记的变量赋值正数时程序不会报错, 但是变量的值会发生变化
在unsigned ==int\long\short==可能误认红色部分为变量名 , 为了提高编译和阅读效率,使用u_+==int\long\short==快捷写法
## 数据类型-整形
使用sizeof函数可以统计一个变量占用字节大小
只需要注意在windows系统中long数据类型和int一行都是占用4个字节,但是**在64位的linux中占用8字节**
linux系统中没有字符乱码问题, 不需要windows.h库文件
## 数据类型- 实型
![Untitled 9 20.png](../../../Files%20&%20LongText/Attachments/Untitled%209%2020.png)
实型数据都是signed的, 有效位数的不确定性来自编译器(ide)的规定
**控制cout显示属性**
```cpp
\#include "iostream"
\#include "windows.h"
using namespace std;
int main(){
    SetConsoleOutputCP(CP_UTF8);
    float number1 = 1234567890;
    float number2 = 1.234567890;
    cout << fixed;       //控制输出的字符为小数
    cout.width(20);      //设置控制字符输出的长度为20
    cout << "hello world" << endl;
    cout << number1 << endl;
    cout << number2 << endl;
    return 0;
}
//输出结果
         hello world
1234567936.000000      //只有前七位精度正确,float规定保留六位小数
1.234568               //只有前七位,小数点也算一位, 但是
```
## 字符型和字符串型
`char`类型在内存中本质上是数字
```cpp
char ch = 65;  
cout << ch << endl;  
char ch2 = 'a';  
cout << ch2 + 1 << endl; //字符串使用运算符默认使用数字格式化  
char ch3 = 'a' + 1;  //字符串运算,但是前面定义char使用字符串格式  
cout << ch3  << endl;
```
![Pasted image 20240802120443.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240802120443.png)
C老风格定义字符串`char x[] = "string"`    这种形式定义无法后面通过重定义变量更改内容
也可以使用指针形式数组`char *x2 = "string"
**首选**: C++风格定义字符串`string x = "string"
**字符串拼接**
![Pasted image 20240804213319.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240804213319.png)
通过加号**仅能**拼接**字符串类型内容**
其他类型变量通过`to_string()`函数将其他变量转化为字符串
```cpp
string name = "Sickwag";
int age = 18;
cout << "my name is : " << name << "and my age is : " << to_string(age) << endl;
```
细节：通过+=连接字符串在现代编译器里性能，优化，实现上都近似于调用 append 函数带来的开销，+=可以灵活调整位置，省去 append 的参数，而如果不用简写，`x = x + y` =操作符会调用string的拷贝构造函数，会消耗较大的时间
## 数据类型之布尔值
使用`cout/cin`程序识别和输入输出都使用0/1表示
cin输入中文乱码问题
![Pasted image 20240804220008.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240804220008.png)
进行操作之后不再需要使用`SetConsoleOutputCP(CP_UTF8)`放在main函数中
Vscode中修改方法
[vscode配置C/C++并用两种方式解决中文乱码问题_vscode c++中文乱码-CSDN博客](https://blog.csdn.net/qq_46018418/article/details/119091935)
1. coderunner插件拓展选项中选定 run in terminal
2. Vscode设置中设定file encoding 为 Simplified Chinese(GBK18030)
	![400](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240804221058.png)
# 分段，切换教程
---
接下来进入<https://www.bilibili.com/video/BV1et411b73Z/?p=1>中 300 集流程 C++学习
# 流程控制
## 运算符
 **比较运算符**不能直接用在[老式C语言风格定义的字符串](#字符型和字符串型)中,使用运算符比较则对比内存地址，而非比较内容
所以需要使用c语言函数`strcmp`进行比较, 
`strcmp` 函数比较两个字符串，并根据比较结果返回一个整数。比较是基于字符串中字符的ASCII值进行的。
```cpp
#include "cstring"
int result= strcmp(s1, s2);
//结果分为-1（s1<s2）、θ（s1=s2）、1（s1>s2）三种
```
C++风格字符串（string类型）
进行对比的两个字符串至少有1个是string类型，即可使用运算符比较。
C++对string类型参与的运算符进行了**重载**，确保可以进行内容对比
在输入输出语句中,由于使用了<< >>, 在其间使用比较运算符需要`()`括起
**逻辑运算符**: 经典三逻辑
![Pasted image 20240804222402.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240804222402.png)用在表达式中,得到的结果是`bool`类型
**三元运算符**
三元运算符：是C++唯一的三元（三个操作数）运算符,对逻辑进行判断，根据结果返回不同值。
**语法**：`产出bool结果的表达式  ？  值1  ： 值2；`
如果？之前的表达式结果为true，那么提供值1的结果, false提供值2的结果
```cpp
int num1,num2;
cin >> num1;
cin >> num2;
string value =num1>num2？"A":“B";
cout<<value<<endl;
//如果num1大于num2，value的值为：A，否则得到B
```
## 选择语句
### Switch 语句
[C++ Runoob Tutoral \> switch case](C++%20Runoob%20Tutoral.md#switch%20case)
注意 Default 语句使用 [C++ Runoob Tutoral \> ](C++%20Runoob%20Tutoral.md#^e1df0e)

## 跳转语句
break出现在
- **多条件选择** Switch 语句中
	[C++ practice case \> 电影打分机制](../../../Files%20&%20LongText/Long%20code/C++%20practice%20case.md#电影打分机制)
- 循环语句跳出，跳出嵌套的内层循环
continue 循环语句中跳过本次循环进行下次
goto 语句，无条件跳转代码到执行为止，语法为 `goto <mark>;` mark 标记一般书写为纯大写，在需要跳转的位置输入 `mark :` 即可

# 数组
## 一维数组
数组定义方式：
![Pasted image 20240815143551.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240815143551.png)
- 声明其中每个元素都是什么数据类型，第三种会忽略数组长度，由工作中实际长度确定
- 数组所有元素放在一个连续的内存空间中
一维数组中名称用途

## 二维数组
### 二维数组定义方式和名称作用

1. `数据类型 数组名[ 行数 ][ 列数 ];`
2. `数据类型 数组名[ 行数 ][ 列数 ] = { {数据1，数据2 } ，{数据3，数据4 } };`
3. `数据类型 数组名[ 行数 ][ 列数 ] = { 数据1，数据2，数据3，数据4};`
4. `数据类型 数组名[ ][ 列数 ] = { 数据1，数据2，数据3，数据4};`
利用第二种更加直观，提高代码的可读性
```cpp
int arr2[2][3] =
{
	{1,2,3},
	{4,5,6}
};
```
数组名称可以查看占用内存空间，获取数组的首元素地址
```cpp
	//空间
	cout << "二维数组大小： " << sizeof(arr) << endl;
	cout << "二维数组一行大小： " << sizeof(arr[0]) << endl;
	cout << "二维数组元素大小： " << sizeof(arr[0][0]) << endl;
	cout << "二维数组行数： " << sizeof(arr) / sizeof(arr[0]) << endl;
	cout << "二维数组列数： " << sizeof(arr[0]) / sizeof(arr[0][0]) << endl;
	//地址
	cout << "二维数组首地址：" << arr << endl;
	cout << "二维数组第一行地址：" << arr[0] << endl;
	cout << "二维数组第二行地址：" << arr[1] << endl;//列元素内存地址不连续不能获取
	cout << "二维数组第一个元素地址：" << &arr[0][0] << endl;
	cout << "二维数组第二个元素地址：" << &arr[0][1] << endl;

	system("pause");

	return 0;
}
```
### 基于范围的 for 循环
在C++中的基于范围的for循环（range-based for loop）语法如下：
```cpp
for (range_declaration : range_expression) loop_statement
```
这里的 `declaration` 是循环变量的声明，`expression` 是要遍历的数组或容器，而 `statement` 是循环体。循环会在遍历容器最后一个元素后结束

学生成绩录入系统 ^7c8457
```cpp
#include<iostream>
#include<string>
#include<vector>
int main(){
    using namespace std;
    vector<vector<string>> info;
    string name;
    int age;
    while(true){
        cout << "input your name : ";
        getline(cin, name);
        if(name == "q"){
            break;
        }
        cout <<"input your age : ";
        getline(cin, age);
        info.push_back({name, age});
    }
    for (int i = 0; i < info.size();i++){
        for(const auto& element : info[i]){
		//因为容器返回的元素可能是string名称，也可能是int年龄，所以用auto自动识别
            cout << "\t"<<element;
        }
        cout <<endl;
    }
        return 0;
}
```
其中 `push_back` 函数是`std::vector` 容器类的一个成员函数，用于在向量的末尾添加一个元素。以下是 `push_back` 方法的详细信息：
1. **作用**：`push_back` 方法将一个元素添加到 `std::vector` 的末尾，并其动态增加容器大小。
2. **参数**：`push_back` 只接受一个参数，即要添加到向量末尾的元素的值或引用。
3. **返回值**：`push_back` 方法没有返回值（即返回类型为 `void`）。

# 函数
## 值传递
![425](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240815233744.png)

### 函数的分文件编写

**作用：** 让代码结构更加清晰
函数分文件编写一般有4个步骤
1. 创建后缀名为.h的头文件
2. 创建后缀名为.cpp的源文件
3. 在头文件中写函数的声明
4. 在源文件中写函数的定义
用户自定义 `#include "custom_head_file.h"`

## 基础入门通讯录管理系统
### 开发过程零碎知识
- 清屏功能使用 sys 模块中的 cls 功能
  `system("cls");`
- 使用三目运算符可以很方便地格式化便于计算机记录但不适合阅读的内容
  `cout << " sex: " << (abs->personArray[i].m_Sex == 1 ? "male":"female") << "\t";`
- 如果在 `switch` 语句的 `case` 标签后面直接写代码（不使用大括号 `{}` 包围），在该 `case` 标签下声明的变量的作用域将从声明点开始，一直到 `switch` 语句末尾。
- **使用大括号创建作用域**：使用 `{}` 来包围 `case` 代码块可以显式地创建一个新的作用域。变量的作用域限于大括号内。一旦退出这些大括号，该作用域内的变量就会被销毁。
- 不使用大括号可能导致[变量遮蔽](#^454df6) 问题出现

> **变量遮蔽（Shadowing）**：如果后续的 `case` 代码块中声明了同名的变量，那么它会遮蔽前面 `case` 中的同名变量。这可能导致难以追踪的错误。

```cpp
switch (someCondition) {
    case 1: {
        int x = 10; // 使用大括号创建新的作用域
        // ... 一些代码 ...
        break;
    }
    case 2: {
        // 这里 x 不可见，因为它被限制在了 case 1 的作用域内
        // ... 一些代码 ...
        break;
    }
}
```
- 出现 `system 不明确` 等单行代码报错一般需要为这一类功能关键字指明命名空间 `std::sytem`
### 开发过程套路化
#### 建立动态数组方法
```cpp
// 建立
#define MAX 
int array[MAX];
string name ;
cin >> name ;
abs->personArray[abs->m_Size].m_name = name ;

//删除
if (res != 1){
	for (int i = res; i < abs->m_Size;i++){
		abs->personArray[i] = abs->personArray[i + 1];
		//attension ! assign the lastest var to the forehead var
		abs->m_Size--; // overwriter forward 1 seat 
	}
}
```
对于删除
![Pasted image 20240902201833.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240902201833.png)
#### 调整 addperson 使其可以修该信息
addperson 和 modifyperson 有同样的功能，所以使用新的函数将重复内容统一
```cpp
void AddorModifyInfo(Addressbooks *abs,int sequence){
//add an argument to decide add(m_Size) or modify(the return of isExist --- ret)
    /* 
    add--- check the wherther the content == MAX and add 'abs->m_Size ++;' update the m_size
    */
    // name
    string name;
    cout << "please input the name : ";
    cin >> name;
    abs->personArray[sequence].m_Name = name;
    // gender
    cout << "input the gender :\n"
         << "1------male\n"
         << "2------female\n"
         << endl;
    int sex = 0;
    while (true)
    {
        cin >> sex;
        if (sex == 1 || sex == 2)
        {
            abs->personArray[sequence].m_Sex = sex;
            break;
        }
        cout << "please input number 1 or 2\n";
        }

        // age
        int age = 0;
        cout << "input the age :\n";
        cin >> age;
        abs->personArray[sequence].m_Age = age;
        // phone
        int phone = 0;
        cout << "input the phone number :\n";
        cin >> phone;
        abs->personArray[sequence].m_Phone = phone;
        // addre
        string address;
        cout << "input the address :\n";
        cin >> address;
        abs->personArray[sequence].m_Addr = address;
        // update the m_size
        cout << "you have add a new contact ";
        std::system("pause");
        std::system("cls");
}


void addPerson(Addressbooks *abs)
{
	// omit wherther the book is full 
    else
    {
        AddorModifyInfo(abs, abs->m_Size);// m_Size means to add in newpositon
        abs->m_Size++;
    }
}

void modifyPerson(Addressbooks *abs){
    cout << "please input the name to modify the corresponding info :";
    string name;
    cin >> name;
    int ret = isExist(abs, name);
    if (ret != -1){
        AddorModifyInfo(abs, ret);
        //ret is an exist element postion
    }
}
```
# C++核心
## 内存分区模型
也叫作程序内存布局 s
![[Pasted image 20241216171902.png]]
### 区域简要
- **代码区（代码段）**：
	- 存放函数体的二进制代码。直接由 CPU 执行，由操作系统进行管理的
	-  存放 CPU 执行的二进制指令，也就是编译后的机器代码。
	- 代码区是**共享**的，共享的目的是对于频繁被执行的程序，只需要在内存中有一份代码即可
	- 代码区是**只读**的，运行过程中不能更改
- **全局区（数据段）**：
	- 存放*全局变量和静态变量以及常量*，根据他们有没有被初始化放入已初始化数据段和未初始化数据段，是数据段的子段
	- 全局变量和静态变量存放在此.
	- 全局区还包含了常量区, 字符串常量和其他常量也存放在此.
	- 该区域的数据在程序结束后由操作系统释放
	- 只要**写在所有函数体内**的变量都是局部变量（无论什么函数）
	- 静态、字符串、全局变量和静态变量在内存中分开的比较近，和局部变量相差很远
==代码区和全局区在运行前创建，栈区和堆区在程序运行之后创建==
- **栈区**：
	- 存储函数的局部变量（放在函数中的指针也是局部变量）、函数参数、形参、返回地址等。
	- 用于实现函数调用的机制，如调用栈。
	- 栈的大小通常是固定的，但可以通过操作系统设置，采用后进先出（LIFO）的方式管理内存，每次函数调用时，都会在栈顶分配空间，函数返回时释放空间。
	- 由编译器自动分配释放, 存放函数的参数值, 局部变量 
	- 局部变量占用的空间过大，可能会导致栈溢出。
	- **不要返回局部变量的地址**，栈区开辟的数据由编译器自动释放
（内存已经被释放）
所有局部变量、形参等栈区中存储的内容，在函数结束自动销毁，返回、操纵这部分地址时相应地址没有数据返回乱码
```cpp
#include<iostream>
 using namespace std;
 int* func(){ //返回一个int类型的指针
     int a = 1;
     return &a;//a是int类型，指针需要一个地址作为值，使用&获取变量a的地址
 }
 int main(){
     int *p = func();//同理，用指针p接受func函数返回的地址值
     cout << *p << endl;//p只是一个指针，*解引用获取指针指向的地址中的内容
     return 0;
 }
```
上面部分代码逻辑没有问题但由于栈的特性，编译器返回

> learing. cpp:62:9: warning: address of local variable 'a' returned [-Wreturn-local-addr] 
     int a = 10;
         ^

- **堆区**：
	- 由**程序员**分配和释放, 若程员不释放, 程序结束时由操作系统回收
	-  动态内存分配区域。
	- 用于程序运行时动态分配的内存（例如，使用 `new` 或 `malloc`）。
		`new int (a)` 有返回值，返回的是放在堆区变量 a 的地址，需要用指针 `int *p = new int (a);` 接受![指针局部变量在栈区，指针指向的值在堆区](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240903104203.png)
使用 `new` 创建对象通常适用于以下情况：
- 对象生命周期需要跨越多个作用域。
- 对象大小在编译时未知，需要动态分配内存。
- 对象需要在运行时决定是否创建或销毁。
- 需要将对象的指针传递给其他函数或存储在容器中。
这种方法可以保证数据在程序执行过程中不丢失但指针（栈区）会在函数执行完后丢失
```cpp
int* func()
{
	int* a = new int(10);
	return a;
}
int main() {
	int *p = func();
	cout << *p << endl;
	cout << *p << endl;
	//利用delete释放堆区数据
	delete p;
	return 0:
}
```
在堆区创建并释放数组内存
```cpp
#include <iostream>
using namespace std;
int main(){
    int *arr = new int[10];
    for (int i = 0; i < 10;i++){//assign value for array
        arr[i] = i + 100;
    }
    for (int i = 0; i < 10;i++){//show the content of array
        cout << arr[i] << "\t";
    }
    delete[] arr;//delete arr but declare it is a array
}
```
- 堆的大小是可变的，随着程序运行时的内存分配和释放而变化。
==栈和堆程序运行之后创建==
### 除此之外需要注意
- 还分有*常量段*，*线程局部存储*，*环境变量和程序计数器*，*动态链接库*等区域
- 不同区域存放的数据，赋予**不同的**生命周期, 放在相同区中的内容会放在相近的内存地址
- 注意：全局局部常量和局部变量都放在**栈区**中，全局 const 修饰的常量放在全局区中
![Pasted image 20240903101701.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240903101701.png)


## 引用

### 关于“静态”
可以参考 [java编程的逻辑 \> 类的加载过程](java编程的逻辑.md#类的加载过程)中有完整的静，非静态修饰符的作用和其在类中的作用
"静态" 可修饰函数、变量、常量等
1. **静态函数**：
   - 静态函数是指在文件作用域内定义的函数，不能被外部文件访问，只能在定义它们的文件内部使用。静态函数的地址并不是固定的，存储在程序的**代码段**（text segment）中，和普通函数一样。每次程序运行时，静态函数的地址可能会因为代码段的布局而不同。
2. **静态变量**：
   - 静态局部变量：在函数内部定义的静态变量，在函数**第一次被调用时初始化**，在整个程序的生命周期内保持其值。这些变量存储在程序的数据段（data segment）中，每次程序运行时，它们的地址是固定的。
   - 静态全局变量：在文件作用域内定义的静态变量，它们的作用域被限制在定义它们的文件内，不能被其他文件访问。这些变量也存储在数据段（data segment）中，每次程序运行时，它们的地址是固定的。
3. **静态常量**：
   - 静态常量表达式：如果一个静态变量是常量表达式，它可能会被存储在只读数据段（rodata segment）中。这意味着它们的值在编译时就确定了，并且在整个程序的生命周期内不会改变。这些常量的地址在每次程序运行时是固定的。
"静态" 修饰符确实意味着在**程序的生命周期**内，这些元素的地址不会改变。每次程序启动时，操作系统可能会为程序分配不同的内存空间，一旦程序开始运行，这些静态元素的地址在该程序的生命周期内是固定的。

### 关于 delete
`delete` 没有返回值
`delete` 的主要作用是：
1. **释放内存**：它释放由 `new` 分配的内存，使得这块内存可以被再次使用。
2. **调用析构函数**：如果被释放的对象是一个类的实例，`delete` 会先调用该对象的析构函数，然后释放内存。这确保了对象的资源被正确清理。
`delete` 可以接受下面的参数
接受指针，也就是值为地址的变量
1. **单个对象的指针**：使用 `delete` 释放由 `new` 分配的单个对象的内存。
2. **数组的指针**：使用 `delete[]` 释放由 `new[]` 分配的数组内存。
释放数组的操作为 `delete [] array_pointer_name` 注意后面接的是指针变量

### 变量的引用
- 别名的定义方法 `int a;    int &b = a;` b 是 a 的别名，使用相同的地址，修改 b 会使 a 改变
- 引用更改引用对象的操作是不允许的
- 别名允许和原名相同
![Pasted image 20240903114920.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240903114920.png)
- 引用的使用规范
	1. **引用必须初始化**：在 C++ 中，引用一旦被初始化，就不能被重新绑定到另一个对象。引用的初始化必须在声明的时候进行，而且一旦初始化完成，引用就永远指向那个初始化的对象。
	2. **引用绑定到对象**：引用实际上是一种别名，它必须绑定到一个已经存在的对象。换句话说，引用需要一个实际的变量来作为它的绑定目标。
	3. **字面量不是对象**：`10` 是一个整数字面量，它不是一个对象，没有名字，也没有内存地址。因此，你不能创建一个引用来直接绑定到一个字面量。

### 引用和指针的区别
![C++ Runoob Tutoral \> 指针和引用](C++%20Runoob%20Tutoral.md#指针和引用)

### 三种传参方式
[C++ Runoob Tutoral \> 三种传参方式](C++%20Runoob%20Tutoral.md#三种传参方式)
- **值传递**：函数接收参数的副本，对参数的修改不会影响到原始变量。
- **指针传递**：函数接收参数**地址的副本**，通过解引用可以直接修改原始变量的值。传递 
- **引用传递**：函数接收**参数的引用**，即原始变量的别名，可以直接修改原始变量的值。
```cpp
#include <iostream>
using namespace std;
void swap1(int a, int b){
    // swap but value submission,only change the duplicate of a & b
    int temp;
    temp = a;
    a = b;
    b = temp;
}
void swap2(int &a,int &b){
    //use quote to arithmetize,directly manipulate memory addr
    int temp;
    temp = a;
    a = b;
    b = temp;
}
void swap3(int *a,int *b){
    // use duplicate address to arithmetize it's work
    int temp;
    temp = *a;
    //a is a pvar ,storage the addr info of a's value,temp is not a pvar so temp = int content obtained by unquote pointer
    *a = *b;
    *b = temp;
}
int main(){

    int a = 10;
    int b = 20;

    swap1(a, b);//send the duplicate
    cout << "a:" << a << " b:" << b << endl;

    swap2(a, b);//send the quote by &
    cout << "a:" << a << " b:" << b << endl;

    swap3(&a, &b);//send the duplicate of addr
    cout << "a:" << a << " b:" << b << endl;
    return 0;
}
```

### 引用作为函数返回值
```cpp
int& test01() {
	int a = 10; //局部变量
	return a;
}// 不能返回局部变量的引用

//返回静态变量引用
int& test02() {
	static int a = 20;
	return a;
}//使用静态变量将其放到全局区中，静态局部变量

int main() {

	//不能返回局部变量的引用
	int& ref = test01();
	cout << "ref = " << ref << endl;
	cout << "ref = " << ref << endl;

	//如果函数做左值，那么必须返回引用
	int& ref2 = test02();
	cout << "ref2 = " << ref2 << endl;
	cout << "ref2 = " << ref2 << endl;

	test02() = 1000; //赋值操作

	cout << "ref2 = " << ref2 << endl;
	cout << "ref2 = " << ref2 << endl;
}
```
### 引用的本质
使用 const 限定的指针指向什么方向不能被修改，但指向的内容可以修改
![Pasted image 20240903142733.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240903142733.png)
引用的实质是一个：**指针常量**，所以一旦初始化，就不能发生改变。即是一个**存储了地址的变量**（这个存储内容不能改变，所以也可以认为是常量），又是一个能够指向该地址的**指针**。
引用的需要合法的地址赋值，字符常量（如 10 ）没有变量存储是临时变量没有内存地址
```cpp
int& ref = 10;  //引用本身需要一个合法的内存空间，因此这行错误
//加入 const 编译器优化代码，int temp = 10; const int& ref = temp;
```
### 常量引用
**作用：** 常量引用主要用来修饰形参，防止误操作
在函数形参列表中，可以加 const 修饰形参，防止形参改变实参
适用于需要传入引用变量，但保证引用变量不会被误操作修改情况
```cpp
#include <iostream>
using namespace std;
void show_value(int &input){//无论&input还是input加const后都不支持修改
    input = 100;//形参，参数列表中的数据
    cout << "show value :" << input << endl;
}
void show_value2(const int input){
    //input = 100;使用const表述传入的参数不可在const作用域中修改。这行会报错
    cout << "show value :" << input << endl;
}
int main(){
    int a = 1000;//a是实参，原数据
    show_value(a);//没有使用引用传入参数，a传入show_value后变为input被修改
    show_value2(a);//传入的a不可被修改，显示1000
    cout << "main show value :" << a << endl;
    }
```

![C++ Runoob Tutoral \> const 的作用](C++%20Runoob%20Tutoral.md#const%20的作用)

## 函数提高
### 函数默认参数
类似于 [Python Basics \> 函数的传参使用方式](Python%20Basics.md#函数的传参使用方式)，关键字传参，位置传参两种方式，位置必须放关键字前面
- C++中定义函数时有默认值的参数需要放在没有的前面
- 如果函数声明有默认值，函数实现的时候就不能有默认参数（两者其一有）
```cpp
int func2(int a , int b = 10);
int func2(int a, int b) {
	return a + b;
}
//wrong syntax follow
int func2(int a , int b = 10);
int func2(int a = 10, int b = 10) {//即使相同也不行，是一种重定义的错误写法
	return a + b;
}
```
### 函数占位参数

```cpp
void func(int a, int = 10) ;
void exampleFunction(int required, int placeholder1 = 0, int placeholder2 = 0) ;//z只用到了require，后面参数虽然正常定义但只是占位作用
func(10);//调用时可以不用给有默认值的参数传入
```
占位参数可以没有名称，这种情况无法在函数中使用这个参数，但可以在下面的情况中使用
1. **函数签名一致性**：在某些情况下，函数可能需要保持一致的接口，即使某些参数在当前版本的实现中并不需要。占位参数可以用来保持函数签名的一致性，确保调用者传递相同数量的参数。
2. **未来扩展**：占位参数可以为未来可能的功能扩展提供便利。开发者可能预见到将来某个功能需要额外的参数，因此在当前版本中预留这些参数，即使它们目前不执行任何操作。
3. **模板和泛型编程**：在模板编程或泛型编程中，占位参数可以用来表示类型或值的占位符，直到具体实例化或使用时才确定其具体值。
4. **函数重载**：占位参数可以用于区分同名函数的不同版本，即函数重载。通过给函数提供不同数量或类型的占位参数，编译器可以根据调用时提供的实参来选择合适的函数版本。 

### 函数重载
#### 函数重载满足条件：
* 同一个作用域下（定义在 main 外部的函数同 main 放全局作用域）
* 函数名称相同
* 函数参数**类型不同**（参数之前的修饰符不同）  或者 **个数不同** 或者 **顺序不同**（尤其注意顺序不同）
[C++ Runoob Tutoral \> 重载运算符和重载函数](C++%20Runoob%20Tutoral.md#重载运算符和重载函数)
#### 函数重载注意事项
```cpp
//1、引用作为重载条件
void func(int &a){
	cout << "func (int &a) 调用 " << endl;
}
void func(const int &a){
	cout << "func (const int &a) 调用 " << endl;
}
//两者本质上是一个接受变量，一个接受常量变量，是类型不同的重载

//2、函数重载碰到函数默认参数
void func2(int a, int b = 10){//不输入b不报错，产生歧义
	cout << "func2(int a, int b = 10) 调用" << endl;
}
void func2(int a){
	cout << "func2(int a) 调用" << endl;
}
int main() {
	int a = 10;
	func(a); //调用无const
	func(10);//调用有const
	//func2(10); //碰到默认参数产生歧义，需要避免
	func2(10,10);//这是可运行的
	return 0;
}
```
最好的解决办法是：**在写重载函数时不定义默认参数**
### 类和对象
大部分内容在 [C++ Runoob Tutoral \> 类和对象](C++%20Runoob%20Tutoral.md#类和对象)中，这里补充
#### **封装**
同其他编程语言，将属性变量和成员操作封装在一个类中
可以参考 [Python Basics \> 封装](Python%20Basics.md#封装)
##### 访问权限
[C++ Runoob Tutoral \> 访问修饰符](C++%20Runoob%20Tutoral.md#访问修饰符)
##### struct 和 class
在 C++中 struct 和 class 都可以表示类，唯一的**区别**就在于 **默认的访问权限不同**
* struct 默认权限为公共
* class   默认权限为私有
在编程中一般将成员属性设置为 private ，成员方法写在 public 中
[C++ Runoob Tutoral \> 数据抽象](C++%20Runoob%20Tutoral.md#数据抽象)
```cpp
class Person {
public:
	void setName(string name) //write only
	string getName()//read only
	
	int getAge() //read only
	//void setAge(int age) is unavailible becaue you wanna it read only
	
	void setLover(string lover)//read only

private:
	string m_Name; //可读可写  姓名
	int m_Age; //只读  年龄
	string m_Lover; //只写  情人
};
```
将数据放在 private 中，public 中放入对数据的操作
##### 类构造函数
[C++ Runoob Tutoral \> 类构造函数](C++%20Runoob%20Tutoral.md#类构造函数)中有更详细的说明
**构造函数语法：**`类名(){}`

1. 构造函数，没有返回值也不写 void
2. 函数名称与类名相同
3. 构造函数可以有参数，因此可以发生重载
4. 程序在调用对象时候会自动调用构造，无须手动调用, 而且只会调用一次
**析构函数语法：** `~类名(){}`

1. 析构函数，没有返回值也不写 void
2. 函数名称与类名相同, 在名称前加上符号  ~
3. 析构函数不可以有参数，因此不可以发生重载
4. 程序在对象销毁前会自动调用析构，无须手动调用, 而且只会调用一次

对象的**初始化和清理**也是两个非常重要的安全问题
- 一个对象或者变量没有初始状态，对其使用后果是未知
- 同样的使用完一个对象或变量，没有及时清理，也会造成一定的安全问题
c++利用了**构造函数**和**析构函数**解决上述问题，这两个函数将会被编译器自动调用，对象的初始化和清理是编译器强制，不提供构造和析构，编译器会提供**空实现。**

默认情况下，c++编译器至少给一个类添加3个函数
1．默认构造函数(无参，函数体为空)
2．默认析构函数(无参，函数体为空)
3．默认拷贝构造函数，对属性进行值拷贝
构造函数调用规则如下：
- 如果用户定义有参构造函数，1. 不再提供，但是会提供默认拷贝构造
- 如果用户定义拷贝构造函数，1.2. 都不会提供默认函数

##### 初始化列表
在类的成员对象或普通的函数中都可以使用
定义语法 `type func_name(argument_list) : var(initialize arguments) {body}`
初始化的变量等价于
`func_name(arguments_list)  {var = intitial_arguments}`
```cpp
void show_info(){
	omit...
}
void set_info():int a = 1,int b(2),string c = "hello"{body}//初始化的属性不写在函数体中
```

#### 深浅拷贝
##### 深浅拷贝注意事项
浅拷贝：简单的赋值拷贝操作, 只将内存地址中存储的数据逐字复制到目标对象中
![Pasted image 20240905114412.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240905114412.png)
深拷贝：在堆区重新申请空间，进行拷贝操作
![Pasted image 20240905113832.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240905113832.png)
```cpp
    // 如果不自定义析构函数，编译器自动添加空析构函数，自动添加的析构函数只能完成浅拷贝
    //---- -- -- -- -- -- -- -- -- -- -- -- -- -- 
    Person(const Person &p)    {
        cout << "拷贝构造函数!" << endl;
        // 如果不利用深拷贝在堆区创建新内存，会导致浅拷贝带来的重复释放堆区问题
        m_age = p.m_age;
        m_height = p.m_height;//会导致析构函数清空内存操作报错
    //---- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -
        // 虚线内是编译器自动添加的析构函数中的内容
        m_height = new int(*p.m_height); // 自定义析构函数，在堆区创建新的对象，申请新的内存，防止浅拷贝
    }

    // 析构函数
    ~Person()    {
        cout << "析构函数!" << endl;
        if (m_height != NULL)        {
            delete m_height;
            m_height = NULL; // 防止野指针出现
        }
    }
public:
    int m_age;
    int *m_height;
};
void test01(){
    Person p1(18, 180);
    Person p2(p1);
    cout << "p1的年龄： " << p1.m_age << " 身高： " << *p1.m_height << endl;
    cout << "p2的年龄： " << p2.m_age << " 身高： " << *p2.m_height << endl;
}
int main(){
    test01();
    system("pause");
    return 0;
}
```
如果属性有在堆区开辟（代码中的 m_height 定义指针放在堆区）的，一定要自己提供拷贝构造函数，防止浅拷贝带来的问题
##### 析构函数的作用
在类的实例销毁时调用析构函数清空堆区数据（需要手动释放），并防止指针悬空
```cpp
~Person()    {
    cout << "析构函数!" << endl;
    if (m_height != NULL)        {
        delete m_height;
        m_height = NULL; // 防止野指针出现
    }
}
```
#### 类对象作为成员
其他类的对象属性或函数可以作为本类的参数、成员属性。当类中成员是其他类对象时，我们称该成员为对象成员。
```cpp
class Phone{
public:
	Phone(string name)	{
		m_PhoneName = name;
		cout << "Phone构造" << endl;
	}
	~Phone()	{
		cout << "Phone析构" << endl;
	}
	string m_PhoneName;
};
class Person{
public:
    string m_Name;
    Phone m_Phone;
    // 初始化列表可以告诉编译器调用哪一个构造函数
    Person(string name, string pName) : m_Name(name), m_Phone(pName){
    //第二个参数赋值等价为 m_Phone = name，是字符串类型，Phone类有字符串类重载，这是一个隐式赋值
        cout << "Person构造" << endl;
    }
    ~Person(){
        cout << "Person析构" << endl;
    }
    void playGame(){
        cout << m_Name << " 使用" << m_Phone.m_PhoneName << " 牌手机! " << endl;
    }
};
```
- 创建对象时，构造的顺序是：先调用对象成员的构造函数，再调用本类构造函数
- 销毁对象时，析构的顺序是：先调用本类析构函数，在调用对象成员的析构函数
#### 静态成员
[C++ Runoob Tutoral \> 类的静态成员](C++%20Runoob%20Tutoral.md#类的静态成员)
##### 静态成员变量
   *  所有对象共享同一份数据
   *  在编译阶段（程序启动前）分配内存
   *  类内声明，类外初始化
	   * 静态成员变量可以在类内声明，但通常**不建议在类内直接初始化**。从C++17开始，允许在类内直接初始化静态成员变量，但仅限于整型和枚举类型的静态成员变量（包括`bool`、`char`、`int`、`long`等基本类型及其`const`修饰的版本，以及枚举类型）。
	   * 在类外初始化变量需要
	   1.  `class_name::type varname = value` 前加 class 名指明从属关系，不然只是全局变量定义
	   2. 在 public 中定义声明变量，否则外部无法访问，也就无法初始化和调用
#####  静态成员函数
   *  所有对象共享同一个函数
   *  静态成员函数**只能**访问静态成员变量
	   假设静态函数中对**类的普通变量**赋值，静态变量在内存中只有一份 copy 而普通成员变量在所有类的实例中都有副本，多个类的对象同时调用静态函数，重定义冲突报错
	   ![Pasted image 20240905203056.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240905203056.png)
"静态"这个词在这里表示"与类或函数相关，但不随对象或函数调用的生命周期而改变"。静态成员和静态变量都具有以下共同特性：
- **持久性**：它们在程序的整个生命周期内存在，不会因为对象的创建和销毁或函数的调用而消失。
- **共享性**：静态成员变量可以在类的所有实例之间共享，而函数内的静态变量可以在多次函数调用之间共享。
```cpp
//1、通过对象
Person p1;
p1.func();

//2、通过类名
Person::func();//不创建对象情况下访问
```
#### 对象模型和 this 指针
##### 对象的内存空间占用
空对象占用内存空间为：1
每个空对象有一个独一无二的内存地址，编译器会给每个空对象分配 1 字节空间区分空对象的内存位置
只有非静态成员变量**才属于类的对象**上，成员函数和成员变量**分开存储**
```cpp
class Person{
    // 非静态成员变量占对象空间,属于类的对象上，所有的综合起来和类分配同一块空间
    int a = 0;
    int b = 1;
    // 静态成员变量不占对象空间
    static int mB;
    // 函数也不占对象空间，所有函数共享一个函数实例
    void func(){
        cout << "a:" << this->a<< endl;
    }
    // 静态成员函数也不占对象空间
    static void sfunc(){
    }
};
int main(){
    Person p;
    cout << "the size = " << sizeof(p) << endl;
    //两个非静态成员变量占用4*2 = 8字节
    return 0;
}
```
##### this 指针
[C++ Runoob Tutoral \> this 指针](C++%20Runoob%20Tutoral.md#this%20指针)
##### 空指针使用
当函数中有 this 指针只想本身，就不能创建空指针循环调用或访问元素
```cpp
class Person {
public:
	void ShowClassName() {
		cout << "我是Person类!" << endl;
	}

	void ShowPerson() {
		if (this == NULL) {//防止指针为空的跳出条件
			return;
		}
		cout << mAge << endl;//使用到了类的对象，本需指向类的指针->属性，这针为空会报错
	}
public://不写默认private，外部访问不到
	int mAge;
};

void test01()
{
	Person * p = NULL;
	p->ShowClassName(); //空指针，可以调用成员函数
	p->ShowPerson();  //但是如果成员函数中用到了this指针，就不可以了
}
```
##### const 修饰成员函数
![C++ Runoob Tutoral \> ^0ca58b](C++%20Runoob%20Tutoral.md#^0ca58b)
**常函数：**
* 成员函数后加 const 后我们称为这个函数为**常函数**
* 常函数内不可以修改成员属性
* 成员属性声明时加关键字 mutable 后，在常函数中依然可以修改
**常对象：**
* 声明对象前加 const 称该对象为常对象
* **常对象只能调用常函数**
#### 友元函数
可以参考 [C++ Runoob Tutoral \> 友元](C++%20Runoob%20Tutoral.md#友元)

#### 符号重载
[C++ Runoob Tutoral \> 重载运算符和重载函数](C++%20Runoob%20Tutoral.md#重载运算符和重载函数)
#### **继承**
##### 继承中的细节
- 问题：从父类继承过来的成员，哪些属于子类对象中？
父类中私有成员也是被子类继承下去了，只是由编译器给隐藏后访问不到
- 问题：子类继承父类后，当创建子类对象，也会调用父类的构造函数，父类和子类的构造和析构顺序是谁先谁后？
```cpp
----------伪代码------------
class Base 
	cout << "Base构造函数!" << endl;{
	cout << "Base析构函数!" << endl;
class Son : public Base
	cout << "Son构造函数!" << endl;
	cout << "Son析构函数!" << endl;
-----------结果--------------
Base构造函数!
Son构造函数!
Son析构函数!
Base析构函数!
```
所以是包含关系
- 问题：当子类与父类出现同名的**成员变量、函数**，如何通过子类对象，访问到子类或父类中同名的数据呢？
访问子类同名成员 直接访问即可
访问父类同名成员需要加作用域
```cpp
-------------通过类名访问---------------------
cout << "Son  下 m_A = " << s.m_A << endl;
cout << "Base 下 m_A = " << s.Base::m_A << endl;
-------------通过对象访问-----------------------
cout << "Son  下 m_A = " << Son::m_A << endl;
cout << "Base 下 m_A = " << Son::Base::m_A << endl;
```
- 多继承一般不会轻易使用，多继承中如果父类中出现了同名情况，子类使用时候要加作用域
##### 菱形继承
![clip\_image002.jpg](../../../Files%20&%20LongText/Attachments/clip_image002.jpg)
1. 羊继承了动物的数据，驼同样继承了动物的数据，当草泥马使用数据时，就会产生二义性。
2. 草泥马继承自动物的数据继承了两份，其实我们应该清楚，这份数据我需要一份就可以。
```cpp
class Animal{
public:
	int m_Age;
};

//继承前加virtual关键字后，变为虚继承
//此时公共的父类Animal称为虚基类
class Sheep : virtual public Animal {};
class Tuo   : virtual public Animal {};
class SheepTuo : public Sheep, public Tuo {};

void test01(){
	SheepTuo st;
	st.Sheep::m_Age = 100;
	st.Tuo::m_Age = 200;
	
	cout << "st.Sheep::m_Age = " << st.Sheep::m_Age << endl;
	cout << "st.Tuo::m_Age = " <<  st.Tuo::m_Age << endl;
	cout << "st.m_Age = " << st.m_Age << endl;
}
int main() {
	test01();
	system("pause");
	return 0;
}
```
##### 虚继承
虚继承出现是为了解决[菱形继承](#菱形继承)问题，
```cpp
class Base { /* ... */ };
class Left : public Base { /* ... */ };
class Right : public Base { /* ... */ };
class Derived : public Left, public Right { /* ... */ };
```
`Left` 和 `Right` 都以虚继承的方式继承 `Base`。这意味着 `Derived` 类只会继承一份 `Base` 的成员，无论它通过 `Left` 还是 `Right` 继承。
**工作原理**
虚继承通过创建一个共享的基类子对象来工作。这个共享的子对象被称为虚基类表（vtable），它包含了指向虚基类的指针。当派生类需要访问虚继承的基类成员时，它通过这个表来访问。

虚继承确保了即使在复杂的继承体系中，基类也只有一份实例。这使得虚继承特别适用于设计需要多重继承但又想避免菱形继承问题的类层次结构。

#### **多态**
==多态是一种允许不同类的对象对同一消息做出响应的能力。==
### 多态基本使用
多态分为两类
- 静态多态: 函数重载 和 运算符重载属于静态多态，复用函数名
- 动态多态: 派生类和虚函数实现运行时多态
静态多态和动态多态区别：
- 静态多态的函数地址早绑定 - 编译阶段确定函数地址
- 动态多态的函数地址晚绑定 - 运行阶段确定函数地址
和 [Python Basics \> 多态](Python%20Basics.md#多态)一样，不过需要在父类中的公共成员前加上 `vitural`
```cpp
#include <iostream>
using namespace std;
class animal{
	public:
	void virtual speak(){
		cout << "there is an animal is speaking " << endl;
	}
};

class dog:public animal{
	public:
	void speak(){
		cout << "dog barking" << endl;
	}
};
class cat:public animal{
	public:
	void speak(){
		cout << "cat barking" << endl;
	}
};

void animal_speak(animal & ani){
	ani.speak();
}

int main(){
	dog d;
	cat c;
	animal_speak(d);
	animal_speak(c);
}
```
- 多态父类只起到模板作用，作为子类模板的一种继承。用来实现一套模板创建多个不同对象
### 纯虚函数和抽象类

- 在多态中，通常父类中虚函数的实现是毫无意义的，主要都是调用子类重写的内容
- 类中只要有一个纯虚函数就称为抽象类
- 抽象类无法实例化对象
- 子类必须重写父类中的纯虚函数，否则也属于抽象类
关于使用 new [创建指针](#^b5440b)类

#### override修饰符
`override`关键字用于明确指出一个成员函数是基类中某个虚函数的重写版本
1. **明确意图**：表明当前函数是重写基类中的虚函数。
2. **编译时检查**：如果基类中没有对应的虚函数，编译器会报错，这有助于避免因拼写错误或继承关系错误而导致的重写失败。
3. `override`关键字只能用于虚函数的重写。
4. 如果基类中的虚函数是 `const` 的，派生类中的重写函数也必须是 `const` 的，并且需要使用 `override` 关键字。
#### 虚函数的意义
1. **定义接口规范**：纯虚函数为派生类提供了一个必须实现的接口规范。所有继承自该父类的子类都必须提供该纯虚函数的具体实现。这有助于确保不同子类对象在行为上的一致性。
2. **实现抽象**：纯虚函数允许创建一个抽象类，该类不能直接实例化。抽象类通常用于表示一些通用的概念或行为，而具体的实现细节留给子类去完成。
3. **促进代码的可扩展性和可维护性**：通过在父类中定义纯虚函数然后调用该纯虚函数。这样，你可以随时添加新的子类，只要它们实现了纯虚函数，就能无缝地集成到现有的系统中。
4. **代码复用**：纯虚函数允许在父类中定义一些默认行为或框架，子类可以继承这些行为并根据需要进行扩展或修改。这有助于减少重复代码并提高代码复用性。
5. **实现运行时多态**：纯虚函数是实现运行时多态的关键。在运行时，根据对象的实际类型调用相应的方法允许程序在运行时根据对象类型做出决策，实现更加灵活设计。

#### 对虚、纯虚函数的理解

- 虚函数
1. 虚函数在父类中提供一个“接口”，父类中只要有虚函数则无法实例化，**允许**程序员在它的子类中实现这个虚函数的功能，子类可以选择重写这个虚函数，也可以不重写。如果子类没有重写某个虚函数，那么它**将继承父类**中的实现。
2. 虚析构函数在父类中定义，可以使通过子类实例化的对象在销毁时调用子类的析构函数销毁而不用父类的，从而正确释放资源 
3. 父类中定义虚函数是为了子类实例化的对象使用方法来自子类而不是父类
----------
- 纯虚函数
5. 纯虚函数是在父类中声明为 `=0` 的虚函数。它没有实现，目的是强制要求任何派生类都必须提供这个函数的实现。
6. 子类仍然是抽象类：如果子类没有实现纯虚函数，子类仍然是抽象类，不能创建对象实例。
7. 编译错误：尝试实例化这样的子类会导致编译错误。

#### 实例
```cpp
#include <iostream>
using namespace std;

class base{
	public :
		virtual void pure_virtual_func() = 0;
		virtual void virtual_func(){
			cout << "it is virtual_func() works !" << endl;
		}
		virtual void const_virtual_func()const{
			cout << "this message will override by subclasses " << endl;
		}
		virtual ~base() {};// make sure subclasses destruct correctly
};

class higher:public base{
	public:
	void pure_virtual_func(){
		cout << "pure virtual funcs must be realize in subclasses " << endl;
	}
	virtual void const_virtual_func()const override{
		cout << "override the base method ." << endl;
	}
	~higher(){
		cout << "destruct correctly .";
	}
};

int main(){
	higher h;
	h.const_virtual_func();
	h.pure_virtual_func();
	h.virtual_func();
	h.~higher();
}
------------------------------------
override the base method .
pure virtual funcs must be realize in subclasses
it is virtual_func() works !
destruct correctly .destruct correctly .
```


# 高级编程

## 内存分区
### 技术层次
![Pasted image 20241019114301.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241019114301.png)
### 数据类型
#### 数据类型是什么
数据类型是有由编译器创建的，为了更好管理内存空间的一种变量标识符。
- 类型是对数据的一种抽象
- 类型相同的数据具有相同的表示形式，存储格式和支持的操作
- 程序中的所有数据**必定属于某种基本数据类型**
- 数据类型可以理解为创建变量的模具，作用是
	- ==分配存储该变量的相应内存大小的同时创建该内存单元的别名==
	- 别名包含这块内存的地址信息
![Pasted image 20241019115122.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241019115122.png)

#### typedef 关键字使用
typedef 的出现目的是 
1. 简化 struct 关键字
```cpp
// 传统写法 定义一个Person类型的Person_object对象变量
struct Person{
    char name[64];
    int age;
};
typedef struct Person person_object;

// typedef写法
typedef struct Person{
    char name[64];
    int age;
} person_object;
```
2. 区分数据类型
```cpp
// typedef写法
typedef struct Person{
    char name[64];
    int age;
} person_object;

// typedef区分数据类型
void test(){
    char *p1, p2;
    cout << "the type of p1 :" << typeid(p1).name() << "\nthe type of p2 : " << typeid(p2).name() << endl;
    
    typedef char *pchar;
    pchar p3, p4;
    cout << "the type of p3 :" << typeid(p3).name() << "\nthe type of p4 : " << typeid(p4).name() << endl;
}
int main(){
    test();
}
-------------------------------
the type of p1 :Pc
the type of p2 :c
the type of p3 :Pc
the type of p4 :Pc
```
创建指针时 `*` 只对最近的变量有作用，`char *p1 ,*p2` 是正确的写法，typedef 创建数据类型

3. 提高代码可移植性
当需要修改很多变量的类型，可以将 typedef 这个类型，未来只需要改这个 typedef 语句即可修改所有用这个自定义数据变量类型
```cpp
typedef long long My_data_struct;

My_data_struct var1;
My_data_struct var2;
My_data_struct var3;
My_data_struct var4;
My_data_struct var5;
```
- 某天需要将所有 `long long` 类型改为 int ，只需要修改 1 行代码即可
#### void 数据类型
- `void` 没有类型，`void*` 无类型指针，可以**指向任何类型的数据**（注意不是空指针，空指针用 NULL 表示）
- void 定义变量没有意义，因为没有类型，编译器无法决定分配多少内存
- 在 vscode 中如果没定义函数返回值，直接 `return` 也是可以的，但是不推荐，如果显式声明函数返回值为 `void` ， `return` 后加任何内容都是不合法的
- `void` 还能实现**万能指针**作用，
	无论多少级、指向什么数据类型的指针占用空间都是 4 / 8 字节（32 / 64 位系统），占用空间取决于系统架构而不是编程语言。
	不同类型指针需要赋值时要使用类型强转方法， void 指针不用强转转化为任意类型指针，反过来不行
	```cpp
	void test(){
     void *p = NULL;
     int *intp = NULL;
     double *doublep = NULL;
     cout << " the size of p pointer is : " << sizeof(p) << endl;
     cout << " the size of intp pointer is : " << sizeof(intp) << endl;
     cout << " the size of doublep pointer is : " << sizeof(doublep) << endl;
     intp = (int *)doublep;
     p = intp;
     // intp = p; // 这一行会报错
 }
	```

> - `sizeof` 是一个运算符而不是关键字、函数，作用是计算一个变量、指针所占用空间的大小
> - 无符号数据类型和有符号类型进行运算结果会被转为无符号数据类型
> - `sizeof` 的返回值是一个 `unsigned` 类型数据
> - 对于自定义数据类型，指针允许使用运算符，如 `p+1` 表示跳转到下一个指针所知的位置

```cpp
struct my_struct {
    int a;      // 0~3
    char b;     // 4~7(内存对齐)
    int c;      // 8~11
    char d;     // 12~15(内存对齐)
};// 整个结构体占用内存大小为 16

int main(){
    struct my_struct asset = {1, 'a', 2, 'b'};// 创建asset结构体
    struct my_struct *p = &asset;       // 创建指向my_struct数据类型的指针p

    // 十进制重载
    printf("p : %d", p);
    printf("\np+1 : %d", p+1);

    // 十六进制重载
    cout << "\np : " << p << endl;
    cout << "p+1 : " << p+1 << endl;
}
```
- 问题是如何通过地址访问 my_struct 中某一个元素（如第四个 int 类型元素）的位置？
```cpp
char *p2 = &asset;       // 创建指向char类型的指针
printf("p2 : %d", p2);						        // 1
printf("\np2+1 : %d", *(p2+12));			        // 2
printf("\np2+1 : %d", *(int *)(p2+12));		        // 3
printf("\np2+1 : %d", *(int *)((int *)p2+3));		// 4
```
- 创建一个指针变量 `p2`，它指向 `asset` 结构体的开头位置内存地址 ------- 1
- `p2` 类型为 `char`，`char` 只能解引用 `char` 1 字节大小的内存地址位置中存储的内容，也就是说这个指针解引用得到的是一个字节大小的内存位置----------------------2
- 而 12 位置是一个占用 4 字节的 int 类型元素，需要 4 字节空间才能解引用出正确的内容，先将 `char` 指针强转为 `int`（符合 12 地址数据的类型）然后解引用----------3
- 也可以先将 `p2` 指向的位置强转为 `int` 类型指针（注意先计算 `(int *)p2`），`int` 类型指针 `+3` 会跳转 12 格，然后将指向跳转 12 格之后的指针转换为 `int` 类型的 4 个指针，最后解引用 4 格内容，得到最后的 `int d` 数据------------------------------------4
### 运行过程详解
[C++ Basics \> 内存分区模型](#内存分区模型)
#### 运行之前
1）预处理：宏定义展开、头文件展开、**条件编译这里并不会检查语法**
2）编译：检查语法，将预处理后文件编译生成汇编文件
3）汇编：将汇编文件生成目标文件（二进制文件）
4）链接：将目标文件链接为可执行程序
当我们编译完成生成可执行文件之后，我们通过在 linux 下 size 命令可以查看一个可执行二进制文件基本情况：（也就是下面的内容是编译过程中做的事）
![Pasted image 20241019164847.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241019164847.png)
1. text 代码区表示写的代码文件占用字节大小，这段通常是**只读的**、共享的，所有程序都可以调用它以节省内存大小
2. 数据区包括 data 和 bss
3. date 区存放所有**初始化的**变量和值（普通赋值，static，const， \#define ）
4. bss 存放所有**定义但未初始化的**变量和值（编译器自动初始化为 0 或 NULL）
5. hex 是十六进制表示的总大小
---
#### 运行之后
##### 栈区特性
栈是一种先进后出的内存结构，由编译器自动分配释放，存放函数的参数值、返回值、局部变量等。在程序运行过程中实时加载和释放，因此，局部变量的生存周期为申请到释放该段栈空间。
- 堆区（heap）
1. 堆是一个大容器，**它的容量要远远大于栈**，但没有栈那样先进后出的顺序。用于动态内存分配。堆在内存中位于 BSS 区和栈区之间。一般由程序员分配和释放，若程序员不释放，程序结束时由操作系统回收（C 语言中使用 `malloc` 和 `free`，C++ 中使用 `new` 和 `delete`）。
2. 堆区的内容一定要手动释放才会释放，直到程序结束
3. 如果将指针放在堆中，在**释放指针所占用的内存**之后为了防止指针悬空，需要将指针置空
```cpp
void getspace(){
	int * p = malloc(sizeof(int)* 5) // 在堆区开辟内存，超出getspace函数也不会销毁
	for(int i = 0; i < 5 ; i++){
		p[i] = 100 +1;
	}
	return p;
}
void test(){
	int *p  = getspace()
	for(int i; i < 5; i++){
		printf("%d \n",p[i]);
	}
	free(p); // 对应malloc
	p = NULL;// 防止指针空指针再被使用
}
```


##### 堆区使用注意事项
1. 同级别指针之间不用引用传递参数**会使用值传递**导致无法实质性改变指针指向内存中的内容
```cpp
void allocateSpace(char * pp){
    size_t contend = 100;
    char *temp = (char * )malloc(contend);
    memset(temp, 0, 100);
    strcpy(temp, "hello world");
    pp = temp;
}

void test03(){
    char * p = NULL;
    allocateSpace(p);
    printf("p : %d", p);
}

int main(){
    test03();
}
```
- 以 `void test(int a,int b){}` 为例，函数参数列表中的每个参数（实际上是对函数调用时传递的**值的引用**。这些参数在函数被**调用时被创建**，并且在函数调用期间它们的值会被初始化为传递给函数的实际参数值。
- `char *p = NULL;` 在 `test03` 函数中被初始化。当您调用 `allocateSpace(p);` 时，`p` 的值（即指针的地址）被复制到 `allocateSpace` 函数的参数 `pp` 中。`pp` 是 `p` 的一个副本，**指向相同的内存地址**，但存储两个指针的内存地址是不同的，由于 `p` 被定义为 `NULL`，所以内存地址是空的
- `malloc` 的返回值为 `void`，需要转换成相应类型才能初始化变量 `char *temp = (char * )malloc(contend);`
![Pasted image 20241020133619.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241020133619.png)
![Pasted image 20241020133918.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241020133918.png)
2. 问题的关键在于 p 是一个空指针，如果 p 初始化不为 `NULL`，那么 pp 会指向 p 一样的内存地址，对 pp 的操作也做用于 p，因为是同一块内存
```cpp
void allocateSpace(char ** pp){
    size_t contend = 100;
    char *temp = (char * )malloc(contend);
    memset(temp, 0, 100);
    strcpy(temp, "hello world");
    *pp = temp;
}

void test03(){
    char * p = NULL;
    allocateSpace(&p);
    printf("p : %s", p);
}

int main(){
    test03();
}
```
- 使用二级指针 `** pp` 存储一级指针的地址（一级指针地址是栈中 `p` 的地址）
![Pasted image 20241020140359.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241020140359.png)
![Pasted image 20241020185931.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241020185931.png)

3. 所以可以总结出，当主调用函数给一个空指针分配内存（栈区）时，利用同级指针**值传递内容**，无法造成实质性的修改（这种情况下可以看做一种值传递），需要使用更高级的指针。
### 动静态变量
可以参考 [java编程的逻辑 \> 类的加载过程](java编程的逻辑.md#类的加载过程)中有完整的静，非静态修饰符的作用和其在类中的作用
static 修饰的变量如果在函数之外定义：
- 作用范围只在当前文件中有效。
- 程序运行前分配内存
- 生命周期在程序运行结束后结束
extern 修改时的是**全局变量**
- 属于外部连接属性
- 在函数外不使用 static 修饰的普通变量定义默认在开头加上 `extern`
- 在 A 文件中想要使用 B 文件中定义的的 extern 变量，需要在 A 文件中声明 `extern var ;` 告诉编译器有这么一个 `extern` 变量在其他的文件中，链接时自己找
### 常量
#### const 全局变量
使用 `const` 修饰的**全局变量**数据是放在常量区的，[C++ Basics \> 内存分区模型](#内存分区模型)
无法直接修改（重定义），和间接修改（使用指针修改常量内存地址）
```cpp
const int a = 10;
int a = 20; // 直接修改更没有
void test(){
    int *p = &a; // C++会在编译之前报错，C编译不报错，但是运行时报错
    *p = 30;
}

int main(){
    test();
}
```
常量区数据不支持修改
#### const 局部变量
局部变量，如放在函数内部声明的变量就是，C 语言中用 `const` 修饰的局部变量不能被直接修改，但可以间接，**因为局部变量存放在栈区**，是一种伪常量，**不能用来初始化数组**，而在 C++ 中直接间接都不允许
```cpp
void test(){
    const int a = 10;
    a = 20; // 直接修改报错
    int *p = &a; // 间接同理
    *p = 30;
    char[10] name;
    char[a] name;// 报错，因为a不是常量
} 
```

#### 字符串常量
- 在常量区创建多个指针初始化指向相同的常量时，**有的编译器**会为了节省内存只保留一个
- 因为字符串常量是可以共享的，所以所有指针都指向同一个地址
- 字符串既然是常量，放在常量区中，但 ANSI 协会定义：**修改字符串常量是未定义的**，结果由编译器决定
```cpp
void test(){
    char *p1 = "hello";
    char *p2 = "hello";
    char *p3 = "hello";

    printf("%d \n", p1);
    printf("%d \n", p2);
    printf("%d \n", p3);

    p1[0] = 'w';
    printf("%d \n", p1); // could be compile but cannot run in C
}
int main(){
    test();
}
```

### 函数调用模型
#### 宏函数
- 宏函数既不定义在栈中也不在堆中，在编译时自动替换，编译完成代码中没有宏函数
- 替换过程在编译阶段，不占用程序运行时的内存
- 一般用于简短并且频繁使用或者可能要修改的情况，这样可以以代码区的空间增长为代价减少了用普通函数时需要的入栈出栈时间
#### 函数调用流程
![图中的ret是result](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241021111844.png)
-  普通函数调用流程
	- `func(1,2)` 的 return 值 3 由临时变量存储，return 后 `func (1,2)` 生命周期结束：
	- 临时变量被销毁，栈底临时变量出栈销毁
	- func 函数中局部变量，实参出栈销毁
	- 栈中指针指向返回地址，main 函数中跳转到第 9 行，留下 `result = 3`
	- 函数返回地址被销毁
	- main 函数 return
- 宏函数调用流程
	- main 函数中 `add(1,2)` 直接被替换为 `1+2` 三个临时变量分别存储 1,2 和 3
	- 直接返回结果
- 调用惯例
	- 函数的调用方和被调用方对于函数是如何调用的必须有一个明确的约定，只有双方都遵循同样的约定，函数才能够被正确的调用，这样的约定被称为”调用惯例（Calling Convention)”. 
	- C/C++中默认使会用 `cdecl`
		- 出栈方（也就是销毁操作是由谁执行）：主调函数（代码中调用 `func` 函数的函数：`main`）
		- 参数传递顺序：从右往左（先传入 `b`，`t_b` 再传入 `a`，`t_a`）
		- 名称修饰：`_函数名`
#### 栈的生长方式和内存存放方向
##### 调用实例
先有一个情景，main 调用 func 1，func 1 调用 func 2
![Pasted image 20241021121614.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241021121614.png)
- main ，func 1 和 func 2 中有数据定义在堆区和常量区时，三个函数都能访问
- mian 函数定义常量在栈区，func 1 和 func 2 都可以调用
- **func 1 定义数据在栈区时，main 函数不可以访问，func 2 可以**

##### 栈的结构
![375](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241021122129.png)
```cpp
void test(){
    int a = 0;
    int b = 0;
    int c = 0;
    int hex = 0x11223344;// 16进制，每个数字16位，两个数字一个字节

    printf("a : %d\n", &a);
    printf("b : %d\n", &b);
    printf("c : %d\n", &c);
    
    char *p = (char *)&hex;
    printf("hex : %x\n", &hex);// hex变量所占用空间的的第一个内存地址
    printf("hex : %x\n", *p);
    printf("hex : %x\n", *(p + 1));// 跳转下一个字节
    printf("hex : %x\n", *(p + 2));// 跳转下一个字节
    printf("hex : %x\n", *(p - 1));// 跳转上一个字节，hex右边没定义，报错
}
int main(){
    test();
}
----------------------
a : 6421988
b : 6421984
c : 6421980
hex : 61fdd8
hex : 44
hex : 33
hex : 22
hex : 0
```

使用十六进制只是为了演示方便（2 数字一个字节），对任意数据，低位字节放在高地址中（11223344 的个位十位放在内存地址大的地方）

## 指针加强

### 空指针和野指针
空指针：指向 `NULL` 指针
野指针：有三种情况
- 没有开辟内存，当做变量使用的指针
```cpp
void void_pointer(){
    char *p = NULL;
    char *q = (char *)0x12345;
    // strcpy(q, "1234");
    // strcpy(p, "1234");
}
```
- malloc 后 free 导致的指针悬空情况
没明确指向某一块内存地址，所以无法对数据进行操作
```cpp
void wild_pointer(){
    // situation 1 : uninitialized pointer
    char *p1;
    printf("%d\n", *p1);// cant find ident

    // situation 2 : malloc then free pointer
    int *p2 = (int *)(malloc(sizeof(int)));
    *p2 = 100;
    printf("%d\n", *p2); // available to be see 100 
    free(p2);
    printf("%d\n", *p2);// available to be see ramdon numbers
    *p2 = 1000;			// cannot be redact with not applied for
    // p = NULL;
    // *p2 = 1000;
}
int main(){
    wild_pointer();
}
```
对于野指针，`free` 之后指针指向的位置内容被清空指针没有置空，只能访问到这块内存的*随机指向*，因为程序没有申请这块内存，所以无法修改
- 超出作用域的指针
```cpp
// situation 3 : exceed the scope
int * exceed(){
    int a = 10;
    int *p = &a;
    return p;
}

int main(){
    int *pointer = exceed();
    printf("pointer : %d \n", *pointer); // display 10 normally
    printf("pointer : %d \n", *pointer); // pointer was destroied
}
```
- 空指针可以被重复释放，野指针不能
![400](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241021203159.png)
`free` 只能释放 NULL 和有内容的内存回归初始化*随机数值*的状态
### 指针的各种操作
#### 指针的步长
1) 指针的步长可以理解为[栈的结构](#栈的结构)中不同类型的指针 `+1` 之后跳转的字节长度不同
2) 在解引用的时候使用不同类型的指针控制解引用的内存大小

#### 指针的间接赋值
指针间接赋值需要下面三步
1）2 个变量（一个普通变量一个指针变量、或者一个实参于个形参）
2）建立关系
3）通过 `*` 操作指针指向的内存
```cpp
void indirect_pointer(int * p){
    *p = 100;
}
int main(){
    int a = 10;
    indirect_pointer(&a);
    printf("a : %d\n", a);
    printf("a : %d\n", &a);
}
```
#### 输入输出特性
```cpp
// 输入输出特新
void stack_memo(char * string_pointer){
    strcpy(string_pointer, "hello world");
    printf("content in buffer : %s", string_pointer);
}

void heap_memo(){
    char *string_pointer = (char * )malloc(sizeof(char) * 64);
    memset(string_pointer, 0, 64);
    strcpy(string_pointer, "hello world");
    printf("contend in string pointer : %s\n", string_pointer);
    
}
int main(){
    char buffer[1024] = {0};
    // in_and_out(&buffer[1024]);
    heap_memo();
}
```