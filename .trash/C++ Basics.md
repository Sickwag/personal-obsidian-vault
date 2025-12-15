[C++ Runoob Tutoral](C++%20Runoob%20Tutoral.md)
# 零碎知识

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

```bash
learing. cpp:62:9: warning: address of local variable 'a' returned [-Wreturn-local-addr] 
     int a = 10;
         ^
```

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


### 类和对象
大部分内容在 [C++ Runoob Tutoral \> 类和对象](C++%20Runoob%20Tutoral.md#类和对象)中，这里补充
#### 封装
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

#### 静态成员
[C++ Runoob Tutoral \> 类的静态成员](C++%20Runoob%20Tutoral.md#类的静态成员)

#### 对象模型和 this 指针
##### 对象的内存空间占用
空对象占用内存空间为：1

##### this 指针
[C++ Runoob Tutoral \> this 指针](C++%20Runoob%20Tutoral.md#this%20指针)
##### 空指针使用

#### 友元函数
可以参考 [C++ Runoob Tutoral \> 友元](C++%20Runoob%20Tutoral.md#友元)

#### 符号重载
[C++ Runoob Tutoral \> 重载运算符和重载函数](C++%20Runoob%20Tutoral.md#重载运算符和重载函数)
#### 继承

#### 多态
==多态是一种允许不同类的对象对同一消息做出响应的能力。==
### 多态基本使用


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

