# 第一章编程基础
## 数据类型和变量
### 赋值
- java 中 char 类型占用两个字节
- 即使没有给每个元素赋值，每个元素也都有一个默认值，这个默认值跟数组类型有关，数值类型的值为 0，boolean 为 false，char 为空字符。 ^7a3f5b
- 数组长度虽然可以动态确定，但定了后就不可以变。数组有一个 length 属性，但只能读，不能改。还有一个小细节，不能在给定初始值的同时给定长度，
- 数组类型和基本类型是**有明显不同的**，一个基本类型变量，内存中只会有一块对应的内存空间。但数组有两块：*一块用于存储数组内容本身，另一块用于存储内容的位置*。即数组类型如果有 n 个元素，则使用 n+1 块（大小不固定）的内存空间，n 个元素每个占用一块，剩余一块存储这 n 个元素所在的**连续内存地址位置信息和元素个数**，可以看出多一个**指针**
![Pasted image 20241029093353.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241029093353.png)
- 数组之间的赋值和变量之间不同，变量之间赋值是同样开辟一块内存空间存储另一个变量的值（即使两个变量的值相同），数组之间的赋值通过更改**多出一块**内存地址的指向改变指针指向，同时原数组被内存回收
- 内存管理是由垃圾回收器（Garbage Collector, GC）自动处理的。当**一个对象不再被任何引用指向时**，它就成为了垃圾回收的==候选对象==。是否立即回收取决于垃圾回收策略
![Pasted image 20241029094323.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241029094323.png)
### 运算
#### 逻辑运算
- 与（&）：两个都为 true 才是 true，只要有一个是 false 就是 false；
- 或（|）：只要有一个为 true 就是 true，都是 false 才是 false；
- 非（！）：针对一个变量，true 会变成 false，false 会变成 true；
- 异或（^）：两个相同为 false，两个不相同为 true；
- 短路与（&&）：和&类似，不同之处稍后解释；
- 短路或（||）：与|类似，不同之处稍后解释
#### 多路分支
##### 实现原理
- CPU 有一个指令指示器，指向下一条要执行的指令，CPU 根据指示器的指示加载指令并且执行。指令大部分是具体的操作和运算
- 但有一些特殊的指令，称为**跳转指令**，这些指令会修改指令指示器的值，让 CPU 跳到一个指定的地方执行。跳转有两种：一种是条件跳转；另一种是无条件跳转。条件跳转检查某个条件，满足则进行跳转，无条件跳转则是直接进行跳转。
- switch 的转换和具体系统实现有关。如果分支比较少，可能会转换为跳转指令。如果分支比较多，则使用跳转表。跳转表是一个映射表，存储了可能的值以及要跳转到的地址
- 跳转表省去了**每次跳转都需要执行的比较操作**，跳转表中值必须为整数，且按大小顺序排序。按大小排序的整数可以使用高效的二分查找，如果值是连续的，则跳转表还会进行特殊优化，优化为一个数组，连找都不用找了，值就是数组的下标索引，直接根据值就可以找到跳转的地址。即使值不是连续的，但数字比较密集，差的不多，编译器也可能会优化为一个数组型的跳转表，没有的值指向 default 分支。
![Pasted image 20241029103314.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241029103314.jpg)

##### 具体细节
源代码中 case 值排列不要求是排序的，编译器会自动排序，switch 值的类型可以是 byte、short、int、char、枚举和 String。**各种数据类型都会在 Switch 中转换为整数类型**，但不可使用 `long` 类型，因跳转表中一个值存储空间为 32 位。将 string 转换为整形时需使用 hashcode

### 循环
在Java中，循环有4种形式，分别是while、do/while、for和**foreach**，foreach 用法和 [C++ prime plus \> 基于范围的 for 循环](C++%20prime%20plus.md#基于范围的%20for%20循环)语法一致
![Pasted image 20241029105922.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241029105922.png)
##### 实现原理
同 if 和 Switch，通过条件、无条件转移指令实现，

### 函数
Java 中，任何函数都需要放在一个类中。类还没有介绍，类可以看作函数的一个容器，即函数放在类中，类中包括多个函数，Java 中函数一般叫做方法
#### 函数参数
##### 参数传递
- 数组作为参数与基本类型是不一样的，基本类型不会对调用者中变量造成任何影响（**在 C++中可以理解为值传递**），但数组不是，在函数内修改数组中元素会修改调用者中数组内容（**默认使用引用传递**）
- 参数传递实际上是给参数赋值，调用者传递的数据需要与函数声明的参数类型是匹配的，但不要求完全一样，Java 编译器会使用**重载功能**自动进行类型转换，并寻找最匹配的函数
```java
public class App {
    public static void main(String[] args) throws Exception {
        int[] default_array = {11,22,33,44,55};
        AnotherClass.display_arr(default_array);
        AnotherClass.display_arr(AnotherClass.reset_array(default_array));
    }
}

class AnotherClass {
    public static int[] reset_array(int[] array) {
        for (int i = 0; i < array.length; i++) {
            array[i] = i;
        }
        return array;
    }

    public static void display_arr(int[] array) {
        for (int i = 0; i < array.length; i++) {
            System.out.println(array[i]);
        }
    }
}
```

---
##### main 函数的参数
- `public static void main(String[] args)` main 函数中参数有命令行传入，vscode 中需要关闭 coderunner 的终端执行，在命令行中执行 java 命令传入
```cpp
public class App {
    public static void main(String[] args) {
        for (int i = 0; i < args.length; i++) {
            System.out.println("Argument " + i + ": " + args[i]);
        }
    }
}
```
上面代码在命令行中执行
```java
java App arg1 arg2 arg3
```
java app表示使用java编译器编译app这个源文件，从这个源文件入口处传入 `arg1 arg2 arg3`，由于 main 设置参数是 `string[]` 所以 ` arg1 arg2 arg3` 被识别为 string **对象**传入 main，在 main 中 for 中**作为对象使用**

---
##### 动态参数列表长度
- 可变长度参数的语法是在数据类型后面加三个点“...”
- 可变长度参数实际上会转换为数组参数，`max(int min，int... a)` 实际上会转换为 `max(int min，int[] a}`
##### 函数返回值
一个函数只能有一个返回值，如果需要多个返回的数据（数据类型也不一样）可以使用**对象结构**


#### 函数调用原理
与 [C++ Basics \> 函数调用模型](../C%20C++/C++%20Basics.md#函数调用模型)类似
问题：
	1. 函数如何传递？
	2. 函数如何直到返回值返回到什么位置？
	3. 函数结果如何传递给调用方
- 函数调用方和函数自己就如何存放和使用这些数据达成一个一致的协议或约定。存放这些数据的位置叫**栈**
- 栈是一块内存，但它的使用有特别的约定，一般是先进后出，类似于一个桶，往栈里放数据称为入栈，最下面的称为栈底，最上面的称为栈顶，从栈顶拿出数据通常称为出栈。栈一般是从高位地址向低位地址扩展，换句话说，栈底的内存地址是最高的，栈顶的是最低的。
- 将数据压入栈中时，按顺序压入
	1. 函数需要用到的参数，
	2. 函数中定义的局部变量
	3. 碰到函数中调用函数时，压入被调用函数需要调用的参数**的值**（因是值传递）
	4. 主调用调用被调用函数这一条指令的**下一条==指令==** 的内存地址
	5. 压入被调用函数的返回值，（被调用函数结束生命周期，发回执瞬间被出栈）
- java 会自动回收堆中没有被指向的内存
- 使用递归函数时，栈的存储内容如下：
![Pasted image 20241029131337.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241029131337.jpg)
只有在最后一次递归结束后，返回值存储器才会有值

## 动静态修饰符
容易混淆的是[继承访问权限修饰符](#继承访问权限修饰符)
### 静态成员
#### 特性
- 静态变量
在Java中，`static` 关键字用于声明属于类本身而不是属于类的某个特定实例的成员。这意味着，无论创建了多少个类的实例，静态成员都**只有一个副本**（只在内存中占用一块空间），并且它们在**所有实例之间共享**。
- 静态函数
静态函数，也称为类方法，是使用 `static` 关键字声明的方法。它们属于类本身，而不是类的实例。**静态方法不能直接访问非静态成员（变量或方法）**，因非静态成员属于类的实例。
---
- **共享性**：静态成员在所有实例之间共享。如果静态变量被修改，所有实例都会看到这个变化。
- **生命周期**：静态成员的生命周期与类加载器相关。在类被加载时创建，并在类被卸载时销毁。
- **访问方式**：静态成员可以通过类名直接访问，也可以通过类的实例访问，但推荐使用类名访问以明确表示它们属于类本身。
---
-  [C++ Basics \> 动静态变量](../C%20C++/C++%20Basics.md#动静态变量)的区分
- 静态、非静态变量在类中加载过程参考[类的加载过程](#类的加载过程)
#### 和 C++的相似之处

1. **类级别成员**：在C++和Java中，静态变量和静态方法都属于类本身，而不是类的实例。这意味着它们不依赖于类的对象实例而存在。
2. **共享性**：静态成员在所有类的实例之间共享。在C++和Java中，如果一个静态变量被修改，所有类的实例都会看到这个变化。
3. **访问方式**：静态成员可以通过类名直接访问，也可以通过类的实例访问，但推荐使用类名访问以明确表示它们属于类本身。
#### 和 C++的不同之处

1. 初始化
- **C++**：静态成员变量一般在类定义之外进行初始化，类的内部声明。
- **Java**：静态成员变量的初始化可以直接在声明时进行，或者在静态初始化块中进行。
```java
public class MyClass {
	public static int staticVar = 0; // 声明时初始化

	static {
		// 静态初始化块
	}
}
```
1. 访问控制制
- **C++**：静态成员函数不能声明为`const`，因它们不依赖于对象实例的状态。
- **Java**：静态方法不能直接访问非静态成员（变量或方法），因非静态成员属于类的实例
2. 内存分配
- **C++**：静态成员在程序开始时分配内存，并在程序结束时释放。
- **Java**：静态成员在类加载时分配内存，并在类卸载时释放
3. 使用场景
- **C++**：静态成员常用于实现单例模式、共享数据或函数等。
- **Java**：除了上述用途外，静态成员还常用于工具类中方法、全局常量等。
### 非静态变量
- 使用继承时，子类会继承父类中所有**非静态变量**
- 实例变量（也称为成员变量或非静态变量）是指那些在类中声明但没有被 `static` 关键字修饰的变量。这些变量属于类的每个实例（即对象），而**不是类本身**。这也导致了**每个对象都有自己的实例变量副本**，这意味着在一个类的不同实例中，实例变量的值可以不同。
- 实例变量的生命周期与它们所属的对象相同，当对象被创建时，实例变量被分配内存，当对象不再被引用并被垃圾回收时，实例变量占用的内存被释放。



# 第二章数据背后的二进制
## 数据的二进制表示
### 整数的二进制表示
#### 计算规则
- 整数有 4 种类型 byte、short、int、long，分别占 1、2、4、8 个字节，即分别占 8、16、32、64 位，每种类型的符号位都是其最左边的一位作为其**正负值**的标记符号
- 对于正整数，使用**原码表示法**将正数转换为二进制后添加最左边一位为 0，这也就是为什么 int 明明有 8 为却只能表示 0~127 的原因？
- 对于负整数，使用**补码表示法**补码表示就是在原码表示的基础上取反然后加 1。
![Pasted image 20241029134750.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241029134750.png)
#### 实现原理
**计算机只能做==加法==**
在实现正数与负数相加时，如果正负数都使用原码表示法，就会出现错误：
```bash
// 原码表示
1  -> 00000001
-1 -> 10000001
+ ------------------
-2 -> 10000010
// 补码表示负数
1  -> 00000001
-1 -> 11111111
+ ------------------
0  -> 00000000
```
由于数据结构对每一种数据内存占用大小进行限制，所以一旦进位在最高位发生将导致**数据清空**，可以参考[整形自变量的上溢出和下溢出](C++%20prime%20plus.md#整形字面量)

java 中内置了各种转换数据进制的方法：
```java
System.out.println(Integer.toBinaryString(a)); //二进制
System.out.println(Integer.toHexString(a));  //十六进制
System.out.println(Long.toBinaryString(a)); //二进制
System.out.println(Long.toHexString(a));  //十六进制
```
### 位运算
1) 左移：操作符为<<，向左移动，右边的低位补0，高位的就舍弃掉了，将二进制看作整数，左移1位就相当于乘以2。
2) 无符号右移：操作符为>>>，向右移动，右边的舍弃掉，左边补0。
3) 有符号右移：操作符为>>，向右移动，右边的舍弃掉，左边补什么取决于原来最高位是什么，原来是1就补1，原来是0就补0，将二进制看作整数，右移1位相当于除以2。

---
逻辑运算有以下几种。
- 按位与`&`：两位都为1才为1。
- 按位或`|`：只要有一位为1，就为1。
- 按位取反`~`：1变为0，0变为1。
- 按位异或`^`：相异为真，相同为假。

## 小数的二进制表示
计算机是用一种二进制格式存储小数的，这个二进制格式不能精确表示0.1，它只能表示一个非常接近0.1但又不等于0.1的一个数。
可以参考[浮点数精度损失问题](../Scattered%20knowlegde/浮点数精度损失问题.md)
几乎所有的硬件和编程语言表示小数的二进制格式都是一样的。这种格式是一个标准，叫做 IEEE 754 标准，它定义了两种格式：一种是 32 位的，对应于 Java 的 float；另一种是 64 位的，对应于 Java 的 double
32 位格式中，1 位表示符号，23 位表示尾数，8 位表示指数。64 位格式中，1 位表示符号，52 位表示尾数，11 位表示指数。在两种格式中，除了表示正常的数，标准还规定了一些特殊的二进制形式表示一些特殊的值，比如负无穷、正无穷、0、NaN（非数值，比如 0 乘以无穷大）。

```java
// 查看浮点数具体二进制形式
Integer.toBinaryString(Float.floatToIntBits(value))
Long.toBinaryString(Double.doubleToLongBits(value));
```

## 其他字符表示
### ascii 和各国其他字符编码
ASCII码对美国是够用了，但对其他国家而言却是不够的，各个国家的各种计算机厂商就发明了各种各种的编码方式以表示自己国家的字符，**为了保持与ASCII码的兼容性**，一般都是将最高位设置为1。也就是说，**当最高位为0时，表示ASCII码**，当为1时就是各个国家自己的字符。

- GB2312 只能表示 7000 个常用汉字，使用两个字节表示一个汉字，用两个十六进制表示
![Pasted image 20241029141454.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241029141454.jpg)
- GBK 建立在 GB 2312 的基础上，向下兼容 GB 2312，GB 2312 中字符编码在 GBK 编码里是完全一样的。GBK 增加了 14000 多个汉字，共计约 21000 个汉字，其中包括繁体字。其中低位字符的最高位可能是 0，原因是**汉字占用两个字符**，高位字符最高位一定是 1（与 ascii 区别开来），读取时一次读取两个字符，根据高位字符开头来表示是否是中文字符
- GB 18030 向下兼容 GBK，增加了 55000 多个字符，共 76000 多个字符，包括了很多少数民族字符，以及中日韩统一字符。GB 18030 使用**变长编码**，有的字符是两个字节，有的是四个字节。在两字节编码中，字节表示范围与 GBK 一样。

### Unicode 和二进制解析方案
- Unicode 主要做了这么一件事，就是给所有字符分配了唯一数字编号。它并没有规定这个编号怎么对应到二进制表示（即并没有像其他国家字符编码一样规定字符转换为二进制后首尾一定要是 1 以与 ASCIII 区分）
- Unicode 需要配合一种二进制表示方案来将字符对应到二进制表示，现在主要流行主要有UTF-32、UTF-16和UTF-8。

#### 1. UTF-32

无论什么字符，都使用 4 字节表示对应二进制编码

但有个细节，就是字节的排列顺序，如果第一个字节是整数二进制中最高位，最后一个字节是整数二进制中最低位，那这种字节序就叫“大端”（Big Endian，BE），否则，就叫“小端”（Little Endian，LE）。对应的编码方式分别是 UTF-32 BE 和 UTF-32 LE。

#### 2. UTF-16

UTF-16 使用变长字节表示：
1) 对于编号在 U+0000～U+FFFF 的字符（常用字符集），直接用两个字节表示。需要说明的是，U+D 800～U+DBFF 的编号其实是没有定义的。
2) 字符值在 U+10000～U+10 FFFF 的字符（也叫做增补字符集），需要用 4 个字节表示。前两个字节叫高代理项，范围是 U+D 800～U+DBFF；后两个字节叫低代理项，范围是 U+DC 00～U+DFFF。数字编号和这个二进制表示之间有一个转换算法
- 区分是两个字节还是 4 个字节表示一个字符就看前两个字节的编号范围，如果是 U+D 800～U+DBFF，就是 4 个字节，否则就是两个字节。
- UTF-16 也有和 UTF-32 一样的字节序问题，如果高位存放在前面就叫大端（BE），编码就叫 UTF-16 BE，否则就叫小端，编码就叫 UTF-16 LE。
**对于字符较少的国家，UTF-16 空间浪费仍比较大**
#### 3. UTF-8

UTF-8 使用变长字节表示，每个字符使用的字节个数与其 Unicode 编号的大小有关，编号小的使用的字节就少，编号大的使用的字节就多，使用的字节个数为 1～4 不等。
可以参考 [ascii Unicode utf-8编码详解](../Scattered%20knowlegde/ascii%20Unicode%20utf-8编码详解.md)

### 编码和乱码
#### 编码转换
编码格式很多，但都可借助 Unicode 转换同一个字符在不同编码格式中编号表示，**再借助**对应的二进制转换方式转换为字符

---
> “马”从GB18030转到UTF-8，先查GB18030->Unicode编号表，得到其编号是9A 6C，然后查Uncode编号->UTF-8表，得到其UTF-8编码：E9A9AC。

1. 解析错误：之所以看起来是乱码，是因看待或者说解析数据的方式错了。只要使用正确的编码方式进行解读就可以纠正了

2. 错误的解析和编码转换
如果怎么改变查看方式都不对，那很有可能就不仅仅是解析二进制的方式不对，而是文本在错误解析的基础上**还进行了编码转换**

1) 两个“老马”，本来的编码格式是 GB 18030，编码（十六进制）是` C0CFC2ED`。
2) 这个进制形式被错误当成了 Windows-1252 编码，解读成了字符“ÀÏÂí”。
3) 随后个字符进行了编码转换，转换成了 UTF-8 编码，形式还是“ ÀÏÂí”，但二进制变成了 `C380C38FC382C3AD`，每个字符两个字节。
4) 这时候再按照 GB 18030 解析，字符就变成了乱码形式“脌脧脗铆”，而且这时无论怎么切换查看编码的方式，这个二进制看起来都是乱码。
#### 从乱码中恢复
逆操作即可

## char 的真正含义
char本质上是一个固定占用两个字节的==无符号==正整数，这个正整数对应于Unicode编号，用于表示那个Unicode编号对应的字符。由于固定占用两个字节，char只能表示Unicode编号在65536以内的字符
**char 的本质是一个整数**由字符编码决定，所以可以进行相应数字运算，但**char占用两个字符**不能直接赋值给 `int`，需要进行强制类型转换
char 的加减运算就是按其 Unicode 编号进行运算，一般对字符做加减运算没什么意义，但 ASCII 码字符是有意义的。并且 char 支持位运算

# 第三章类的基础
Java定义了8种基本数据类型：4种整型byte、short、int、long，两种浮点类型float、double，一种真假类型boolean，一种字符类型char。**其他类型的数据都用类这个概念表达**。

## 基本概念
### 数据容器
- public static。 static 表示类方法，也叫静态方法，**不需要初始化，通过类名就能调用**，与类方法相对的是实例方法。实例方法没有 static 修饰符，必须通过实例或者对象调用
- 与 public 相对的是 private。如果是 private，则表示私有，这个函数只能在同一个类内被别的函数调用，而不能被外部的类调用。
#### 自定义数据类型

> 一个数据类型由其包含的属性以及该类型可以进行的操作组成，属性又可以分为是类型本身具有的属性，还是一个具体实例具有的属性，同样，操作也可以分为是类型本身可以进行的操作，还是一个具体实例可以进行的操作。

总的来说：意思就是，一个数据类型包括由成员变量组成的属性值，和属性值相关的操作，属性值是类型本身具有还是类型实例化对象才有取决于是否使用 `static` 表示标记
- 类型本身具有的属性，通过类变量体现。
- 类型本身可以进行的操作，通过类方法体现。
- 类型实例具有的属性，通过实例变量 体现。
- 类型实例可以进行的操作，通过实例方法 体现。
这四个特点**并不是在任何一个类型中都有**

- final在修饰变量时表示常量，即变量赋值后就不能再修改了，类似于 C++ `const` 修饰符
- 在实例方法中，有一个隐含的参数，这个参数就是当前操作的实例自己，直接操作实例变量，实际也需要通过参数进行。Python [将这一点显式强调在编程过程中](../Python/Python%20Basics.md#self%20参数)，java 和 C 都选择使用this表示当前实例，在语句this.x=x；中，this.x表示当前 this 所在的实例中实例变量x
实例化类时，`classname objectname;` 会在两块内存中创建数据：
1. 分配内存：一块存放实际内容（类对象的内容），，具体包括其实例变量 `x` 和 `y`。 一块存放实际内容的位置（指向类对象的指针）
2. 给实例变量设置默认值（不再像 C++中一样访问未初始化数据得到的是随机值）数值类型变量的默认值是 0，boolean 是 false，char 是“\u 0000”，引用类型变量都是 null，这与[数组是一样的](#^7a3f5b)
3. 与基本类型一样，类的使用也需要**先定义数据，然后赋值，最后是操作**

#### 类的修饰符
1) public： 可以修饰类、类方法、类变量、实例变量、实例方法、构造方法，表示可被外部访问。
2) private： 可以修饰类、类方法、类变量、实例变量、实例方法、构造方法，表示不可以被外部访问，只能在类内部被使用。
3) static： 修饰类变量和类方法，它也可以修饰内部类
4) this： 表示当前实例，可以用于调用其他构造方法，访问实例变量，访问实例方法。
5) final： 修饰类变量、实例变量，表示只能被赋值一次，也可以修饰实例方法和局部变量
#### 构造函数
##### 构造函数的特性
同 C++ [C++ Runoob Tutoral \> 类构造函数](C++%20Runoob%20Tutoral.md#类构造函数)，没有返回值，也不能有返回值。构造方法**隐含的返回值**就是实例本身。
this 可以指向当前实例，也可以通过 this 访问其他实例变量，使用 this 时注意**最好不要调用 `static` 方法**，因 this 指代当前对象的实例（是一个实例化的**对象**）静态方法最好用类名直接调用，节省空间的同时闭麦那可能出现的继承错误
```java
class AnotherClass {
AnotherClass() {
    this.show_binary_of_data();
	}
}
```
但这只是一个 waring 不影响编译
##### 创建、初始化类的方法
1. **使用 `new` 关键字和构造函数**：
这是最常见的对象初始化方式。通过`new`关键字调用类的构造函数来创建对象。
```java
ClassName objectName = new ClassName();
```
这种方法对象实例在**堆中创建**，而`myObject`这个引用变量则存储在栈中，它指向堆中对象实例
2. **使用使用 `clone()` 方法**：
如果一个类实现了`Cloneable`接口并且重写了`clone()`方法，你可以通过`clone()`方法来创建一个对象的副本。
```java
ClassName objectName = (ClassName) existingObject.clone();
```
3. **使用反序列化**：
当对象被序列化后，可以通过反序列化来重新创建对象。
```java
ObjectInputStream in = new ObjectInputStream(new FileInputStream("file.ser"));
ClassName objectName = (ClassName) in.readObject();
in.close();
```
4. **使用工厂方法**：
一些类提供静态工厂方法来创建对象，而不是直接使用构造函数。
```java
ClassName objectName = ClassName.createInstance();
```
5. **使用反射**：
通过`Class`类的`newInstance()`方法或者`Constructor`类的`newInstance()`方法可以使用反射机制来创建对象。
```java
Class<?> clazz = Class.forName("com.example.ClassName");
ClassName objectName = (ClassName) clazz.newInstance();
```

##### 私有构造函数
使用场景：
1) 不能创建类的实例，类只能被静态访问，如 Math 和 Arrays 类，它们的构造方法就是私有的。只能在使用 array 类对象时使用
2) 能创建类的实例，但只能被类的静态方法调用。有一种常见的场景：类的对象有但只能有一个，即单例（单个实例）。在这种场景中，对象是通过静态方法获取的，而静态方法调用私有构造方法创建一个对象，如果对象已经创建过了，就重用这个对象。
3) 只是用来被其他多个构造方法调用，用于减少重复代码。
#### 类和对象的生命周期
类加载进内存后，一般不会释放，直到程序结束。一般情况下，类只会加载一次，所以**静态变量在内存中只有一份**。
通过 new 创建实例对象时，每个对象都是独立的，就算调用同一个构造函数初始化两个相同的对象也是放在堆中不同的位置
堆中对象在没有*活跃变量*指向对象时，JVM 就**可能**释放这段内存

#### 类的组合
不得不说，Java 写起来有点爽
```java
public class App {
    public static void main(String[] args) throws Exception {
        Point p1 = new Point(1, 2);
        Point p2 = new Point(3, 4);
        System.out.println((p1.distance(p2)));
        Line l1Line = new Line(p1, p2);
        System.out.println(l1Line.length());

    }
}
class Point {
    private int x;
    private int y;

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public int getX() {
        return this.x;
    }

    public int getY(){
        return this.y;
    }

    public double distance(Point p){
        return Math.sqrt(Math.pow(x-p.getX(), 2)+Math.pow(y-p.getY(), 2));
    }
}

class Line {
    private Point start;
    private Point end;

    public Line(Point starPoint, Point endPoint) {
        this.start = starPoint;
        this.end = endPoint;
    }

    public double length() {
        return start.distance(end);
    }
}
```
### 代码的组织机制
使用任何语言进行编程都有一个类似的问题，那就是如何组织代码。具体来说，
- 如何避免命名冲突？
- 如何合理组织各种源文件？
- 如何使用第三方库？
- 各种代码和依赖库如何编译链接为一个完整的程序？

#### 包的概念
**Java中组织类和接口的方式也是包**
Java API 中所有的类和接口都位于包 Java 或 javax 下，Java 是标准包，javax 是拓展包。
String 类的完全限定名为 `java.lang.String`。
一般将同类型，或者同一个模块的各种类放在一个 jar 包文件中下面是包的**命名规范**
1. 统一使用小写
2. 点分隔符之间有且仅有一个自然语义的单词
3. 包名使用单数形式
4. 一般建议使用项目域名倒序作为包名前缀
如：orgapache. dubbo、org. apache. ibatis 等

**可见性范围从小到大**是：`private<默认（包）<protected<public`
##### 声明类所在的包
包名需要和文件目录结构匹配，如需要创建一个在 `shuo. laoma` 包中 Hello 类需要：
```java
package shuo.laoma;// package define should be ahead then declaim class
public class Hello{
	// definaiton of class
}
```
- 写需要调用 Hello 类代码的源文件如果在 `\src\`，那么定义 Hello 的（上面这段代码）的文件必须在 `\src\shuo\laoma\Hello.java`，否则 java 报错
- 定义包名一般以域名（写这个文件的人、组织属于哪个网址）作为包名，如：
- `baicu. com` 开发的 java 包，包名就应该是 `com.baidu.packagename`。当然没有域名自己用也可以，但如果要网络发布，最好用一个已有的域名作为包的标识

##### 使用包
做 import 操作时，可以一次将某个包下的所有类引入，语法是使用 `.*`
引入只会引入包中**直接类**，即包中包不会被引入，试图嵌套引入的形式也是无效的，如 `import java.util.*.*`。

**静态导入**（Static Import）是一种允许你直接使用另一个类中静态成员（静态变量和静态方法），而无需通过类名来限定这些成员的特性
**普通导入**（Regular Import）用于导入一个类或接口，使得你可以在代码中使用该类或接口的非静态成员，而无需使用类的全限定名。
```java
import static com.example.utils.MathUtils1.*;
import com.example.utils.MathUtils2.*; // regular import

public class Calculator {
    public static void main(String[] args) {
        int sum = add(5, 3); // 直接使用add方法，无需MathUtils.add
        int difference = subtract(5, 3); // 直接使用subtract方法，无需MathUtils.subtract
        System.out.println("Sum: " + sum);
        System.out.println("Difference: " + difference);
    }
}
```

- 静态导入会导入所有类的静态成员（方法和变量）并且使用时不需要说明来自哪个包（类似 C++头文件，不需要说明来自哪个类，但 C++头文件导入后可以使用里面所有类和方法）
- 普通导入需要在使用包中成员时加上包的**简称**（不是全限定名）+ `.` 再访问其中成员
#### 打包（jar 包）
使用 `jar` 命令可以将一个写好的 java 文件打包成一个 jar 文件，命令是
`jar -cvf <包名>.jar <最上层包名>`
Java 类库、第三方类库都是以 jar 包形式提供的。

- 从 Java 源代码到运行的程序，有**编译**和**链接**两个步骤。编译是将源代码文件变成扩展名是 `.class` 的一种字节码，这个工作一般是由 javac 命令完成的。**链接是在运行时动态执行的**，`.class` 文件不能直接运行，运行的是 Java 虚拟机
- Java 运行时，会根据类的完全限定名寻找并加载类，寻找的方式就是在类路径中寻找，如果是 class 文件的根目录，则直接查看是否有对应的子目录及文件，如果是 jar 文件，则首先**在内存中解压文件**，然后再查看是否有对应的类。
- 打包和运行 java 文件是，编译器会将所有包中用到的类通过全限定名找到相应的文件内容，将其放入 jar 文件中，运行时同理；

#### 模块、包的应用

- 一个应用可由多个模块组成
- 一个模块可由多个包组成
- 模块之间可以有一定的依赖关系
- 一个模块可以导出包给其他模块用，可以提供服务给其他模块用
- 也可以使用其他模块提供的包，调用其他模块提供的服务。

# 类的继承
## 基本概念
### 根父类
#### 根父类特性
在 Java 中，即使没有声明父类，也有一个隐含的父类，这个父类叫 Object。Object **没有定义属性**（没有成员变量），但定义了一些方法
```java
Point p1 = new Point(1, 2);
System.err.println(p1.toString());
```

其中 `tostring` 是根父类定义的方法
```java
public String toString() {
    return getClass().getName() + "@" + Integer.toHexString(hashCode());
}
```
- 其中 `hashcode()` 作用是返回当前调用 `hashcode` 方法的对象的哈希码
- 返回结果 `Point@76f9aa66`
```java
public Shape() {
    this(DEFAULT_COLOR);
}

public Shape(String color) {
    this.color = color;
}
```
- 关于 circle 类中使用下面这段代码两个构造函数的原因：
```java
public Shape() { // 1
    this(DEFAULT_COLOR);
}

public Shape(String color) { // 2
    this.color = color;
}
```
- 虽然两个构造函数可以合并为一个来初始化 color 成员变量，这会导致当需要继承时，
- 在 1 中写各种 finial 常量的初始化，2 中写可能根据情况需要更改的变量，这样可以通过 1 中控制 this 指针和使用不同的重载构造函数精确控制类，避免所有变量都写在无参构造中在继承时调用父类继承把变量全继承过来，需要改动的话要在子类中**一个个 override**

#### 根父类中常用方法
`Object` 类提供了一些基本的方法，这些方法**对于所有Java对象**都是通用的。

---
1. `public final Class<?> getClass()`: 返回当前对象的运行时类。
2. `public int hashCode()`: 返回对象的哈希码值，用于支持基于哈希的集合，如 `HashMap`。
3. `public boolean equals(Object obj)`: 比较两个对象是否相等。默认情况下，它比较的是对象的引用是否相同。
4. `protected Object clone()`: 创建并返回当前对象的一个副本。默认情况下，它执行的是浅复制。
5. `public String toString()`: 返回对象的字符串表示形式。默认情况下，它返回的是类名加上对象的哈希码的无符号十六进制表示。
6. `public final void notify()`: 唤醒在此对象监视器上等待的单个线程。
7. `public final void notifyAll()`: 唤醒在此对象监视器上等待的所有线程。
8. `public final void wait()`: 导致当前线程等待，直到另一个线程调用此对象的 `notify()` 方法或 `notifyAll()` 方法。
9. `public final void wait(long timeout)`: 导致当前线程等待，直到另一个线程调用此对象的 `notify()` 方法或 `notifyAll()` 方法，或者指定的时间已过。
10. `public final void wait(long timeout, int nanos)`: 导致当前线程等待，直到另一个线程调用此对象的 `notify()` 方法或 `notifyAll()` 方法，或者指定的时间已过。
11. `protected void finalize()`: 当垃圾回收器确定不存在对该对象的更多引用时，由对象的垃圾回收器调用。子类重写 `finalize` 方法，以配置系统资源或执行其他清理。
### 方法重写
#### 继承基本写法
- java 中只允许子类继承一个父类，每个类的构造函数**不能写返回值，void 也不行**
- 继承时父类的构造函数会**优先子类进行**，子类需要调用父类方法时，super 必须放在第一行
- super 同样可以引用父类非私有的变量。
- super 的使用与 this 有点像，但 super 和 this 是不同的，**this引用一个对象**，是实实在在存在的，可以作为函数参数，可以作为返回值，但 **super 只是一个关键字**，不能作为参数和返回值，它只是用于告诉编译器访问父类的相关变量和方法。

#### 图形管理器——多态
```java
public class App {
    public static void main(String[] args) throws Exception {
        ShapeManager manager = new ShapeManager();
        manager.add_shape(new circle(p1, 3.5));
        manager.add_shape(new Line(p1,p2,"orange"));
        manager.add_shape(new arrowLine(p1, p2, "klein blue", false, false));
        manager.draw_all_shapes();
    }
}
class ShapeManager {
    private static final int MAX_NUM = 100;
    private Shape[] shapes = new Shape[MAX_NUM];
    private int shape_num = 0;

    public void add_shape(Shape shape) {
        if (shape_num < MAX_NUM) {
            shapes[shape_num++] = shape;
        }
    }

    public void draw_all_shapes() {
        for (int i = 0; i < shape_num; i++) {
            shapes[i].draw();
        }
    }
}
```
- 将所有图形都通过 shapemanager 维护，统一调用，统一创建，添加到数组中
- 最关键的是定义 shapemanager 时， `public void add_shape(Shape shape) ` 接受 shape 数据类型的变量，但 line，arrowline，circle 都不是 shape 类型，只是继承了 shape 却可被接收。也就是说通过继承得到的对象，**具有本身类型和父类的多种类型形态**，拥有多重属性
- 对于变量 shape，它就有两个类型：类型 Shape，我们称之为 shape 的**静态类型**；类型 Circle/Line/ArrowLine，我们称之为 shape 的**动态类型**。在 ShapeManager 的 draw 方法中，`shapes[i]. draw()`调用的是其**对应动态类型**的 draw 方法，这称之为方法的动态绑定。

## 继承的细节
### super 的指向
子类可以通过 super 调用父类的构造方法，如果子类没有通过 super 调用，则会自动调动父类的默认构造方法，如果父类**没有默认的的构造方法（即无参构造）**，编译器会自动提供一个默认的无参构造，**但什么也不做**，如果父类只提供了有参构造，则子类中**必须实现**

### 构造方法先后顺序
- 父类代码
```java
public class Base {
    public Base(){
        test();
    }
    public void test(){
    }
}
```
- 子类代码
```java
public class Child extends Base {
    private int a = 123;
    public Child(){
    }
    public void test(){
        System.out.println(a);
    }
}
```
- 调用过程
```java
public static void main(String[] args){
    Child c = new Child();
    c.test();
}
```
- 输出
```bash
0
123
```
- 分析
1. 创建对象时会调用响应对象的构造函数初始化
2. 有继承关系的类被实例化时，会**先调用父类的构造函数**，然后是子类
3. 构造函数执行完毕后（对象被创建以后），对象的其他方法才能够被使用
4. 调用类中函数时，**首先调用被重写的函数**
- 所以在 `new Child()` 过程中父类构造函数 `Base()` 先被调用，`Base()` 调用 `test()` 函数，`test()` 在子类中被重写，所以调用子类的 `test()`，这时 `a` 没有被初始化，显示默认值
- 父类构造函数调用后，**才轮到**子类的普通成员函数被调用

### 父子类型转换
子类型的对象可以赋值给父类型的引用变量，这叫**向上转型**
```java
Base b = new Child();
Child c = (Child) b;
```
因子类来自于父类，child 是另一种形式上的 base，这是**多态的特性**
但，由于子类中可能添加了父类中没有的变量和方法，父类对象无法接受，所以**无法调用**
子类中有父类的**所有非静态**成员，所以强制转换 b 为 child 时不会报错，因 b 动态类型是 c（即 b 本来就是由 child 得到的，转换回 c）
```java
Base b = new Base();
Child c = (Child)b;
```
语法上 **Java 不会报错**，但运行时会抛出错误，错误为类型转换异常。

> 一个父类的变量能不能转换为一个子类的变量，取决于这个父类变量的动态类型（即引用的对象类型）是不是这个子类或这个子类的子类。

### 继承访问权限修饰符
#### 可见性设计模式
- `public` 表示外部可以访问
- `private` 表示只能内部使用
- `protected` 可见性介于中间，表示虽然不能被外部任意访问，但可被子类访问。
- `protected` 还表示可被同一个包中其他类访问，不管其他类是不是该类的子类。

> java 中类、方法、变量的访问级别**从大到小**排序为：
> `public` > `protect` > 默认不写修饰符 > `private`

由于 protect 这种特性，所以一般用于**模板方法模式**，即在父类中只定义由子类实现具体细节的方法，但父类中具体实现这些方法的使用步骤：
```java
// 父类
public class Base {
    protected  int currentStep;
    protected void step1(){
    }
    protected void step2(){
    }
    public void action(){
        this.currentStep = 1;
        step1();
        this.currentStep = 2;
        step2();
    }
}

// 子类
public class Child extends Base {
    protected void step1(){
        System.out.println("child step " + this.currentStep);
    }
    protected void step2(){
        System.out.println("child step " + this.currentStep);
    }
}
```

#### 可见性重写
重写方法时，一般并不会修改方法的可见性。但我们还是要说明一点，重写时，子类方法不能降低父类方法的可见性。**子类可以升级父类方法的可见性但不能降低**。

> 继承反映的是“is-a”的关系，即子类对象也属于父类，子类必须支持父类所有对外的行为，将可见性降低就会减少子类对外的行为，从而破坏“is-a”的关系，但子类可以增加父类的行为，所以提升可见性是没有问题的。
#### 防止继承 final
一个非 final 的类，其中 public/protected 实例方法默认情况下都是可以被重写的，但**类**加了 final 关键字后就不能被重写。

## 继承实现的原理

### 继承实现实例代码
```java
public class App {
    public static void main(String[] args) throws Exception {
        System.out.println("---- new Child()");
        Child c = new Child();
        System.out.println("\n---- c.action()");
        c.action();
        Base b = c;
        System.out.println("\n---- b.action()");
        b.action();
        System.out.println("\n---- b.s: " + b.s);
        System.out.println("\n---- c.s: " + c.s);
    }
}
class Base {
    public static int s;
    private int a;
    static { // static block
        System.out.println("base static code block, s: " + s);
        s = 1;
    }
    { // instance block
        System.out.println("base instance code block, a: " + a);
        a = 1;
    }

    public Base() {
        System.out.println("base constructor code, a: " + a);
        a = 2;
    }

    protected void step() {
        System.out.println("base s: " + s + ", a: " + a);
    }

    public void action() {
        System.out.println("start");
        step();
        System.out.println("end");
    }
}

class Child extends Base {
    public static int s;
    private int a;
    static { // static block
        System.out.println("child static code block, s: " + s);
        s = 10;
    }
    {// instance block
        System.out.println("child instance code block, a: " + a);
        a = 10;
    }

    public Child() {
        System.out.println("child constructor, a: " + a);
        a = 20;
    }

    protected void step() {
        System.out.println("child s: " + s + ", a: " + a);
    }
}
```
### 类的加载过程
在 Java 中，所谓类的加载是指将类的相关信息加载到内存。在 Java 中，类是**动态加载**的，当第一次使用这个类时才会加载，加载一个类时，会查看其父类是否已加载，如果没有，则会加载其父类。

修饰符在其中起的作用参考[动静态修饰符](#动静态修饰符)

1) 一个类的信息主要包括以下部分：
	- 类变量（静态变量）；
	- 类初始化代码；
	- 类方法（静态方法）；
	- 实例变量；
	- 实例初始化代码；
	- 实例方法；
	- 父类信息引用。
2) 类初始化代码包括：
	- 定义静态变量时的赋值语句；
	- 静态初始化代码块。
3) 实例初始化代码包括：
	- 定义实例变量时的赋值语句；
	- 实例初始化代码块；
	- 构造方法。
4) 类的初始化流程（按顺序）
	1. 如果父类还没有被初始化，先初始化父类。
	2. 执行静态变量的初始化。
	3. 执行静态代码块。
	4. 执行实例变量的初始化。
	5. 执行实例初始化块。
	6. 执行构造函数。
初始化类的对象时，静态变量和静态代码块在**类加载（加载到内存中）时**初始化和执行，而实例变量和实例初始化块在创建对象实例（等式左边 `class classname =`）时初始化和执行。因此，**静态变量的初始化先于实例变量的初始化**
![375](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241031102428.png)
### 对象的创建方法
由于使用了 Child 类，是第一次使用，所以需要加载到内存中（根据包的位置）
在类加载后，`new Child()` 就是创建 Child 对象
`Child c=new Child()`；会将新创建的 Child 对象引用赋给变量 c，而 `Base b = c`；会让 b 也引用这个 Child 对象
![Pasted image 20241031111116.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241031111116.png)

### 方法的调用过程
1) 查看c的对象类型，找到Child类型，在Child类型中找action方法，发现没有，到父类中寻找；
2) 在父类Base中找到了方法action，开始执行action方法；
3) action先输出了start，发现需要调用step（）方法，就从Child类型开始寻找step（）方法；
4) 在Child类型中找到了step（）方法，执行Child中step（）方法，**执行后返回action方法**；
5) 继续执行action方法，输出end。
所有**实例**方法的调用遵循：从对象的实际类型信息开始查找的，找不到时，再查找父类类型信息。**动态绑定机制**可以帮助这一行为，

- 如果继承的层次比较深，要调用的方法位于比较上层的父类则效率比较低，因每次调用都要进行**很多次查找**。大多数系统使用一种称为**虚方法表**的方法来优化调用的效率。
- 虚方法表，就是在类加载时为每个类创建一个表，记录该类的对象所有动态绑定的方法（包括父类的方法）及其地址，但一个方法只有一条记录，子类重写了父类方法后**只会保留子类**的
- 这与 C++中 [C++ Runoob Tutoral \> 虚函数](C++%20Runoob%20Tutoral.md#虚函数)类似，虚函数也有类似的虚函数表加快查找速度
![Pasted image 20241031112610.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241031112610.jpg)
每一个类都会保存一个方发表，各自独立但记录的都是名称和指向函数的地址
## 继承是把双刃剑
### 继承破坏封装和破坏的方式

#### 子类父类相互依赖对方细节问题
继承可能破坏封装是因子类和父类之间可能存在着**实现细节的依赖**。
子类在继承父类时，往往不得不关注父类的实现细节，而父类在修改其内部实现时，如果不考虑子类，也往往会影响到子类

```java
class Base {
    private static final int MAX = 100;
    private int[] array = new int[MAX];
    private int count = 0;

    public void add_num(int number) {
        if (count < MAX) {
            array[count++] = number;
        }
    }

    public void add_all(int[] numbers) {
        for (int single_number : numbers) {
            add_num(single_number);
        }
    }
}

class Child extends Base{
    private long sum;
    @Override
    public void add_num(int number) {
        super.add_num(number);
    }
    @Override
    public void add_all(int[] numbers) {
        super.add_all(numbers);
    }

    public long get_sum() {
        return sum;
    }
}
```
如果父类中将 `add_all()` 修改为
```java
public void addAll(int[] numbers){
    for(int num : numbers){
        if(count<MAX_NUM){
            arr[count++] = num;
        }
    }
}
```
不再调用另一个成员函数，子类中就会出错，因子类调用父类的之前存在但被修改的方法
所以，在子类重写父类过程中需要调用父类方法时，父类**不能随意改动、增加公开方法**，因给父类增加就是给所有子类增加，而子类可能必须要重写该方法才能确保方法的正确性。

#### is-a 关系问题
- 继承关系是设计用来反映is-a关系的，子类是父类的一种
- 但现实中，设计完全符合is-a关系的继承关系是困难的。比如，绝大部分鸟都会飞，可能就想给鸟类增加一个方法fly（）表示飞，但有一些鸟就不会飞
- 在 is-a 关系中，重写方法时，**子类不应该改变父类预期的行为**，但这是没有办法约束的
- 父类有的属性和行为，子类并不一定都适用，子类重写父类方法时可能违反父类的预期


### 如何应对继承的双面性
#### 避免使用继承
##### 使用 final 关键字
final 方法不能被重写，final 类不能被继承。finnal父类就保留了随意修改这个方法内部实现的自由，使用这个方法的程序也可以确保其行为是符合父类声明的。
##### 优先使用组合而非继承
下面通过重写子类方法，但**没有使用 extends**，并且在子类中创建一个独立的父类对象并初始化专门在子类中使用。
子类对象不能当作基类对象来统一处理了。解决方法是使用接口。
```java
public class Child {
    private Base base;
    private long sum;
    public Child(){
        base = new Base();
    }
    public void add(int number) {
        base.add(number);
        sum+=number;
    }
    public void addAll(int[] numbers) {
        base.addAll(numbers);
        for(int i=0;i<numbers.length;i++){
            sum+=numbers[i];
        }
    }
    public long getSum() {
        return sum;
    }
}
```
##### 使用接口
[接口的本质](#接口的本质)
#### 正确使用继承
使用继承大概主要有三种场景：
##### 基类是别人写的，我们写子类
- 重写方法不要改变预期的行为；
- 阅读文档说明，理解可重写方法的实现机制，尤其是方法之间的依赖关系；
- 在基类修改的情况下，阅读其修改说明，相应修改子类。
##### 我们写基类，别人可能写子类
- 使用继承反映真正的 is-a 关系，只将真正公共的部分放到基类；
- 对不希望被重写的**公开方法**添加 final 修饰符；
- 写文档，说明可重写方法的实现机制，为子类提供指导，**告诉子类应该如何重写**；
- **在基类修改可能影响子类时，写修改说明**。
##### 基类、子类都是我们写的
我们既写基类也写子类，关于基类，注意事项和第 2 种场景类似，关于子类，注意事项和第 1 种- 景类似，不过程序都由我们控制，要求可以适当放松一些。

# 类的拓展
继承有其两面性，替代继承的一种方式是使用接口，接口到底是什么呢？此外，介于接口和类之间，还有一个概念：抽象类，它又是什么呢？一个类可以定义在另一个类内部，称为内部类，为什么要有内部类，它到底是什么呢？枚举是一种特殊的数据类型，它有什么用呢？
## 接口的本质
数据类型并不能对象以及对对象操作的本质。很多时候，我们实际上关心的，并不是对象的类型，而是对象的能力，**只要能提供这个能力，类型并不重要**。

### 接口的概念
接口声明了一组能力，但它自己并没有实现这个能力，它只是一个约定。接口涉及交互两方对象，一方需要实现这个接口，另一方使用这个接口，但双方对象并不直接互相依赖，它们只是通过接口间接交互
接口实现后，需要传入一个实现了接口功能的的传入，才能使用接口的功能，接口在不同类中不同实现，导致了同一个类使用不同接口完成不同功能，这是 java 特有的**面向接口的对象编程**，是多态的一种体现可以参考 [[Kotlin + xml传统开发#可判空形式]]中对 Study 接口的实现和使用
![Pasted image 20241031124256.jpg](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020241031124256.jpg)

### 定义接口
- 自定义一个用来**比较的接口**
```java
public interface MyComparable {
    int compareTo(Object other);
}
```

---
在Java中，`instanceof` 是一个二元操作符，用于测试一个对象是否是特定类或其子类的实例。它可以用来检查一个对象是否满足某个类型的要求。

`instanceof` 操作符的语法如下：
```java
object instanceof Type
```
`object` 是你要测试的对象，`Type` 是你要检查的类型（类或接口）。
如果 `object` 是 `Type` 的一个实例，或者 `Type` 的一个子类的实例，那么 `instanceof` 操作符将返回 `true`；否则，它将返回 `false`

---
其中 `Object` 表示任意一种参数类型，放在变量前是一种占位作用，用在函数前作为返回类型时，需要函数 `return null`
1）Java 使用 interface 这个关键字来声明接口，修饰符一般都是 public。
2）interface 后面就是接口的名字 MyComparable。
3）接口定义里面，声明了一个方法 compareTo，但没有定义方法体，Java 8 之前，接口内不能实现方法。接口方法不需要加修饰符，**加与不加相当于都是 public abstract。**
- 再来解释 compareTo 方法：
1）方法的参数是一个 Object 类型的变量 other，表示另一个参与比较的对象。
2）第一个参与比较的对象是自己。
3）返回结果是 int 类型，-1 表示自己小于参数对象，0 表示相同，1 表示大于参数对象。

### 实现接口
```java
interface My_compare {
    int compareTo(Object other);
}

class Point implements My_compare {
    private int x;
    private int y;

    public Point(int x,int y) {
        this.x = x;
        this.y = y;
    }
    public double distance() {
        return Math.sqrt(x*x + y*y);
    }
    @Override
    public int compareTo(Object other) {
        if (!(other instanceof Point)) {
            throw new IllegalArgumentException();
        }
        Point otherPoint = (Point) other;
        double delta = distance() - otherPoint.distance();
        return Double.compare(delta, 0);
    }
    @Override
    public String toString() {
        return "("+x+","+y+")";
    }
}
```
- `interface interfacename` 表示 My_compare 是一个接口“**类**”
- 接口中可以像**声明函数一样**写接口拥有的方法，java 8 之前不支持在接口中实现接口方法，现在支持但不建议
- `IllegalArgumentException ();` 是 `runtimexception` 类中一个实例，new 用来创建实例， throw 用于抛出异常的对象（实例），所以需要使用`new`
- `classname implement interfacename` 表示 Point 类将会实现 My_compare **接口中所有方法**，除非该类是*抽象类*，抽象类可以部分实现接口，即它可以声明实现接口但不必提供所有方法的实现。在这种情况下，抽象类的子类必须实现接口中**剩余的方法**，除非子类本身也是抽象的。不过终究所有的方法都需要被实现
```java
public abstract class MyAbstractClass implements MyInterface {
    @Override
    public void method1() {
        // method1的具体实现
    }

    // method2没有在这里实现
}
```
- 一个类可以实现多个接口，表示**这个类的对象**具有多种接口都有的能力
```java
public class Test implements Interface1, Interface2 {
    // 主体代码
}
```

### 使用接口
#### 接口的一般使用
与类不同，接口不能 new，不能直接创建一个接口对象，对象只能通过类来创建。但可以声明接口类型的变量，引用实现了接口的类对象。但对象可以**被接口引用**
- 调用代码
```java
public class App {
    public static void main(String[] args) throws Exception {
        My_compare mc1 = new Point(2, 3);
        My_compare mc2 = new Point(4, 5);
        System.out.println(mc1.compareTo(mc2));
        System.out.println(mc2.compareTo(mc1));
    }
}
```
- 定义代码
```java
interface My_compare {
    int compareTo(Object other);
}

class Point implements My_compare {
    private int x;
    private int y;

    public Point(int x,int y) {
        this.x = x;
        this.y = y;
    }
    public double distance() {
        return Math.sqrt(x*x + y*y);
    }
    @Override
    public int compareTo(Object other) {
        if (!(other instanceof Point)) {
            throw new IllegalArgumentException();
        }
        Point otherPoint = (Point) other;
        double delta = distance() - otherPoint.distance();
        return Double.compare(delta, 0);
    }
    @Override
    public String toString() {
        return "("+x+","+y+")";
    }
}
```
p1 和 p2 是 `MyComparable` 类型的变量，但引用了 Point 类型的对象，之所以能赋值是因 Point 实现了 `MyComparable ` 接口。如果一个类型实现了多个接口，那么这种类型的对象就可以被赋值（`My_compare mc1 = new Point (2, 3);`）给任一接口类型的变量。

#### 面向接口编程
- 定义代码
```java
class CompUtil {
    public static Object max(My_compare[] objs){
        if(objs==null||objs.length==0){
            return null;
        }
        My_compare max = objs[0];
        for(int i=1; i<objs.length; i++){
            if(max.compareTo(objs[i])<0){
                max = objs[i];
            }
        }
        return max;
    }
    public static void sort(My_compare[] objs){
        for(int i=0; i<objs.length; i++){
            int min = i;
            for(int j=i+1; j<objs.length; j++){
                if(objs[j].compareTo(objs[min])<0){
                    min = j;
                }
            }
            if(min!=i){
                 My_compare temp = objs[i];
                 objs[i] = objs[min];
                 objs[min] = temp;
            }
        }
    }
}
```
- 调用代码
```java
Point[] points = new Point[]{
	new Point(2,3), new Point(3,4), new Point(1,2)
};
System.out.println("max: " + CompUtil.max(points));
CompUtil.sort(points);
System.out.println("sort: "+ Arrays.toString(points));
```

- max 方法并不关心传入其中数据是什么类型，只要它继承自 `My_compare` 类，就能调用他的方法
- 面向接口编程可以同一套代码（即 `My_compare` 的定义和 `My_utils` 对接口的实现）可以处理多种不同类型的对象，只要这些对象都有相同的能力（所有的 point 对象都实现了 `My_compare`，都具有对比两个 `Point` 对象的方法）
### 接口的细节
- 接口中可以定义变量，**所有修饰符即使不写类型**都是 `public static final`。
- 接口也可以继承，一个接口可以继承其他接口，继承的基本概念与类一样，但与类不同的是，接口可以有**多个父接口**
```java
public interface IBase1 {
    void method1();
}
public interface IBase2 {
    void method2();
}
public interface IChild extends IBase1, IBase2 {
}
```
- 类可以在继承基类的情况下，同时实现一个或多个接口
```java
public class Child extends Base implements IChild {
  //主体代码
}
```
- 接口也可以使用 instanceof 关键字，用来判断一个对象**是否实现**了某接口，用于对象表示判断前一个对象是否是后一个类的实例

### 接口代替继承
在 Java 8 之前，接口中方法都是抽象方法，都没有实现体，Java 8 允许在接口中定义两类新方法：静态方法和默认方法，它们有实现体，
#### 默认方法
**特性**
- 默认方法是在接口中使用 `default` 关键字声明的方法。
- 它们提供了一种在接口中包含方法实现的方式，这是Java 8引入的新特性。
**与抽象方法的区别**：
- 抽象方法是在接口中声明但没有提供实现的方法。任何实现该接口的类都必须提供这些抽象方法的具体实现。
- 默认方法与抽象方法不同，因它们在接口中已经包含了实现。这意味着实现接口的类可以选择使用接口提供的默认实现，或者覆盖默认实现以提供自己的版本。
**实现类的选择**：
- 实现类可以选择不改变默认方法的实现，直接使用接口中提供的实现。
- 或者，实现类可以选择覆盖默认方法，提供自己的实现。
**引入默认方法的原因**：
- 默认方法主要是为了解决向后兼容的问题。当需要在现有的接口中添加新方法时，如果不使用默认方法，那么所有实现该接口的类都必须提供新方法的具体实现，这会导致大量的代码修改。、
- 默认方法可以较为抽象地类比 C++中 [C++ Runoob Tutoral \> 纯虚函数](C++%20Runoob%20Tutoral.md#纯虚函数)，必须在子类中实现，否则无法实例化，向父类中添加功能，所有子类中必须都要实现，否则报错。
- 默认方法允许在**不破坏现有实现的情况下**，向接口添加新功能。

#### 静态方法
Java 8 中，*静态方法和默认方法*都必须是 public 的，Java 9 去除了这个限制，它们都可以是 private 的，引入 private 方法主要是为了方便多个静态或默认方法复用代码

## 抽象类
### 抽象类和抽象方法
抽象方法是相对于具体方法而言的，具体方法有实现代码，而抽象方法只有声明，没有实现。java 8 之前的接口中方法**都是抽象方法**
抽象类不能实例化，不能使用 `new abstract_classname`，只能实例化其**已经全部实现抽象函数**的子类，引用抽象类具体子类的对象。
```java
Shape shape = new Circle();// Shape类是抽象类 shape是抽象类型的变量，但引用已经实例化的子类Circle，他是方法完整的类
shape.draw();
```

### 为什么需要抽象类
同 C++中 [C++ Runoob Tutoral \> 纯虚函数](C++%20Runoob%20Tutoral.md#纯虚函数)，使用可以强制开发者必须在后续子类中实现方法，减少犯错

### 抽象类和接口
抽象类和接口有类似之处：都不能用于创建对象，
- 如果抽象类中只定义了抽象方法，那抽象类和接口就更像了。但本质上不同
- 接口中不能定义实例变量，而抽象类可以
- 一个类可以实现多个接口，但只能继承一个类。

抽象类和接口是配合而非替代关系，它们经常一起使用，接口声明能力，抽象类提供默认实现，实现全部或部分方法，一个接口经常有一个对应的抽象类。比如，在Java类库中，有：

- Collection接口和对应的AbstractCollection抽象类。
- List接口和对应的AbstractList抽象类。
- Map接口和对应的AbstractMap抽象类。
## 内部类的本质
之前我们所说的类都对应于一个独立的Java源文件，但一个类还可以放在另一个类的内部，称之为内部类，相对而言，包含它的类称之为外部类。

内部类只是Java编译器的概念，对于Java虚拟机而言，它是不知道内部类这回事的