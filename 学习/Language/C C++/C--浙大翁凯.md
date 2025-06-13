- 零碎知识
    
    [[关系运算符的优先级]]
    
    [[三段循环代码的区别]]
    
    [[函数]]
    
    [[程序框架]]
    
    [[基本错误提示]]
    
- runnoob自学
- 作业
    
    [[头歌作业题]]
    
- 实战
    
    ### ——————基础逻辑———————
    
    [[身高换算]]
    
    [[计算时间差]]
    
    [[整数四则运算]]
    
    [[厘米换算英尺]]
    
    [[进制转换]]
    
    [[找零计算器（IF）]]
    
    [[比较并找出最大的数]]
    
    [[多路分支（Switchcase）]]
    
    [[成绩转换 输出数字有几位数（while）]]
    
    [[rand函数]]
    
    [[猜数游戏]]
    
    [[计算平均数]]
    
    ### ———————遍历循环——————
    
    [[整数逆序]]
    
    [[计算阶乘（for）]]
    
    [[判断一个数是不是素数（for语句重点）]]
    
    [[计算出100以内的素数]]
    
    [[凑硬币]]
    
    [[累加分数计算公式]]
    
    [[正序分解整数]]
    
    [[水仙花数（自定义位数版代码）]]
    
    [[计算数组的长度]]
    
    [[输出一个99乘法表]]
    
    [[计算两个整数之间的所有素数之和]]
    
    [[循环次数计算]]
    
    [[求最大公约数]]
    
    [[求符合给定条件的整数集]]
    
    [[计算范围内素数的个数和加和]]
Srand(time(0));  
Int a = rand()%100+1;  
%100+1  
这段代码的意思是  
![Untitled 208.png](../../../Files%20&%20LongText/Attachments/Untitled%20208.png)
**然后再加上1**
这样的话无论随机数是多少，对100取余后得到0-99的数
再加上1，得到的随机数是1-100的整数
**PS附加**
**如何让计算机产生规定任意范围之内的随机数呢？**
要在C语言中生成位于 **15624** 到 **24586** 之间的随机数，你可以按照以下步骤编写代码：
1. **播种随机数生成器**：首先，我们需要设置随机数生成器的种子。通常我们可以使用 `time(NULL)` 函数来获取当前时间作为种子，确保每次运行程序时都会产生不同的随机数序列 .
2. **使用 rand() 函数生成随机数**：在C语言中，我们一般使用 `<stdlib.h>` 头文件中的 `rand()` 函数来生成随机数。它的用法为：
    
    ```C
    int rand(void);
    ```
    
    `rand()` 会随机生成一个位于 `0` 到 `RAND_MAX` 之间的整数。`RAND_MAX` 是 `<stdlib.h>` 头文件中的一个宏，它用来指明 `rand()` 所能返回的随机数的最大值。在实际编程中，我们不需要知道 `RAND_MAX` 的具体值，把它当做一个很大的数来对待即可。
    
3. **生成指定范围内的随机数**：我们可以利用取模的方法来限定随机数的范围。例如，要生成位于 **15624** 到 **24586** 之间的随机数，可以使用以下代码：
    
    ```C
    \#include <stdio.h>#include <stdlib.h>#include <time.h>int main() {
        int a;
        srand((unsigned)time(NULL)); // 播种随机数生成器
        a = rand() % (24586 - 15624 + 1) + 15624; // 生成随机数
        printf("%d\n", a);
        return 0;
    }
    ```
    
    这里，`rand() % (24586 - 15624 + 1)` 会产生 `0` 到 `8949` 的随机数，后面的 `+ 15624` 确保 `a` 最小只能是 `15624`，最大就是 `8949 + 15624 = 24586`。
当然可以。以下是for循环，while循环和do...while循环的示例代码：
**1.** **For循环**：（当条件满足时执行循环体，直到不满足条件时停止）**
\#include<stdio.h>intmain(){
for(inti = 0; i < 5; i++) {
printf("%d\n", i);
}
return0;
}
在这个示例中，for循环从0开始，每次迭代都会增加1，直到达到5。每次迭代都会打印出当前的数值。所以，这段代码将打印出0到4的所有整数。
在C语言中，for循环的语法结构如下：
for(初始化; 条件; 更新) {
// 循环体}
for循环主要由以下三个部分组成：
**1.** **初始化（Initialization）**：这是for循环的第一部分，通常用于设置循环变量的初始值。这部分只在循环开始时执行一次。**  
2.  
**条件（Condition）**：这是for循环的第二部分，它是一个表达式，用于测试是否应继续循环。如果条件为真（非零），则执行循环体。如果条件为假（零），则退出循环。**  
3.  
**更新（Update）**：这是for循环的第三部分，通常用于更新循环变量的值。这部分在每次循环迭代结束时执行。**
以下是一个for循环的示例，该循环从0开始，每次迭代都会增加1，直到达到10：
for(inti = 0; i < 10; i++) {
printf("%d\n", i);
}
在这个示例中，int i = 0是初始化部分，i < 10是条件部分，i++是更新部分。这个循环将打印出0到9的所有整数。希望这个解答对你有所帮助！
来自 <[https://copilot.microsoft.com/?culture=zh-cn](https://copilot.microsoft.com/?culture=zh-cn)>
**1.** **While循环**：（当条件满足时，不断执行循环体内的语句）**
\#include<stdio.h>intmain(){
inti = 0;
while(i < 5) {
printf("%d\n", i);
i++;
}
return0;
}
在这个示例中，while循环从0开始，每次迭代都会增加1，直到达到5。每次迭代都会打印出当前的数值。所以，这段代码将打印出0到4的所有整数。
**1.** **Do…While循环**：**
\#include<stdio.h>intmain(){
inti = 0;
do{
printf("%d\n", i);
i++;
} while(i < 5);
return0;
}
在这个示例中，do...while循环从0开始，每次迭代都会增加1，直到达到5。每次迭代都会打印出当前的数值。所以，这段代码将打印出0到4的所有整数。
这三种循环的主要区别在于它们的条件检查时间：for和while循环在每次迭代开始时检查条件，而do...while循环在每次迭代结束时检查条件。这意味着do...while循环至少会执行一次，即使条件在循环开始时就不满足。希望这个解答对你有所帮助！
来自 <[https://copilot.microsoft.com/?culture=zh-cn](https://copilot.microsoft.com/?culture=zh-cn)>
![Untitled 197.png](../../../Files%20&%20LongText/Attachments/Untitled%20197.png)
![Untitled 1 20.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2020.png)
![Untitled 2 19.png](../../../Files%20&%20LongText/Attachments/Untitled%202%2019.png)
**while**可能不会执行循环体，**dowhile**一定会执行至少一次的循环体**
**类似于**i++**和**++i**
在C语言中，for循环，while循环和do...while循环都是用于重复执行一段代码的控制结构，但它们的使用方法和适用场景有所不同：
**1.** **For循环**：for循环通常用于已知迭代次数的情况。它包含初始化，条件和更新三个部分，这三个部分都在循环的头部定义。for循环在每次迭代开始时检查条件。**
for(inti = 0; i < 5; i++) {
printf("%d\n", i);
}
**1.** **While循环**：while循环在条件为真时重复执行一段代码。如果在循环开始时条件为假，则代码块不会执行。while循环在每次迭代开始时检查条件。**
inti = 0;
while(i < 5) {
printf("%d\n", i);
i++;
}
**1.** **Do…While循环**：do...while循环与while循环类似，但它至少执行一次代码块，因为它在循环的底部检查条件。**
inti = 0;
do{
printf("%d\n", i);
i++;
} while(i < 5);
总的来说，for循环和while循环在每次迭代开始时检查条件，而do...while循环在每次迭代结束时检查条件。这意味着do...while循环至少会执行一次，即使条件在循环开始时就不满足。希望这个解答对你有所帮助！
来自 <[https://copilot.microsoft.com/?culture=zh-cn](https://copilot.microsoft.com/?culture=zh-cn)>
![Untitled 3 17.png](../../../Files%20&%20LongText/Attachments/Untitled%203%2017.png)
![Untitled 4 16.png](../../../Files%20&%20LongText/Attachments/Untitled%204%2016.png)
![Untitled 196.png](../../../Files%20&%20LongText/Attachments/Untitled%20196.png)
![Untitled 1 19.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2019.png)
判断条件，这些运算符和算子构成的是一个**有结果的等式**
关系运算符的优先级
![Untitled 2 18.png](../../../Files%20&%20LongText/Attachments/Untitled%202%2018.png)
![Untitled 3 16.png](../../../Files%20&%20LongText/Attachments/Untitled%203%2016.png)
要求：给出1角，2角，5角的硬币若干  
凑出指定金额的方案有几种？分别是什么？  
代码：
![%E5%87%91%E7%A1%AC%E5%B8%81%E9%97%AE%E9%A2%98.cpp](%E5%87%91%E7%A1%AC%E5%B8%81%E9%97%AE%E9%A2%98.cpp)
  
```C
\#include <stdio.h>
int main()
{
	    int x,one,two,five;
	    printf("please input your money : ");
	    scanf("%d",&x);
	    for(one = 1;one<x*10;one++){
	    	for(two = 1;two<x*10/2;two++){
	    		for(five=1;five<x*10/5;five++){
	    			if(one + two*2 + five *5 == x*10){
					printf("you can fulfill this with %d 1 pennis , %d 2 pennis and %d 5pennis .\n",one,two,five);
				}
				}
			}
		}
    return 0;
}
```
![Untitled 214.png](../../../Files%20&%20LongText/Attachments/Untitled%20214.png)
![Untitled 1 29.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2029.png)
**意思就是跳出了最内层的循环之后第二层还在计算，计算到只用**1**角和**2**角不用**5**角的结果再次符合最内层的**if**条件之后在输出结果**
**代码优化（使用接力**break**语句）**
```C
\#include <stdio.h>
int main()
{
	    int x,one,two,five,exit;
	    printf("please input your money : ");
	    scanf("%d",&x);
	    for(one = 1;one<x*10;one++){
	    	for(two = 1;two<x*10/2;two++){
	    		for(five=1;five<x*10/5;five++){
	    			if(one + two*2 + five *5 == x*10){
						printf("you can fulfill this with %d 1 pennis , %d 2 pennis and %d 5pennis .\n",one,two,five);
						exit = 1;
						break;
					}
				}
				if (exit==1)break;
			}
			if(exit==1)break;
		}
    return 0;
}
```
**接力break不易阅读，可以使用goto语句改写更方便**
```C
\#include <stdio.h>
int main()
{
	    int x,one,two,five;
	    printf("please input your money : ");
	    scanf("%d",&x);
	    for(one = 1;one<x*10;one++){
	    	for(two = 1;two<x*10/2;two++){
	    		for(five=1;five<x*10/5;five++){
	    			if(one + two*2 + five *5 == x*10){
						printf("you can fulfill this with %d 1 pennis , %d 2 pennis and %d 5pennis .\n",one,two,five);
					goto out;
					}
				}
			}
		}
		out:
    return 0;
}
```
**goto相当于作为传送点，特别适合从多层循环嵌套中跳转出去**
![Untitled 198.png](../../../Files%20&%20LongText/Attachments/Untitled%20198.png)
**函数的分类**
- 从用户角度
    - 标准函数：头文件中封装好的函数（数学math.h和标准输入输出函数stdio）
    - 自定义函数：用户自定义用来完成任务的函数
- 从函数形式角度
    - 无参函数：getchar()，void()
    - 有参函数：getchar()
**函数的定义**
函数的四要素：==返回类型，函数名，函数体，参数列表。==
![Untitled 1 21.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2021.png)
![Untitled 2 20.png](../../../Files%20&%20LongText/Attachments/Untitled%202%2020.png)
- 可以在函数之中调用函数
![Untitled 3 18.png](../../../Files%20&%20LongText/Attachments/Untitled%203%2018.png)
- return还有一个作用是直接跳出函数，因为已经有了返回值
**函数的形参与实参**
- 定义：
![Untitled 4 17.png](../../../Files%20&%20LongText/Attachments/Untitled%204%2017.png)
![Untitled 5 16.png](../../../Files%20&%20LongText/Attachments/Untitled%205%2016.png)
- 实际应用
/ta
![Untitled 6 15.png](../../../Files%20&%20LongText/Attachments/Untitled%206%2015.png)
- 而如果想让swap函数交换两个变量（直接操控），有两种方法：
    
    - 第一种：重新修改swap函数的类型和功能
        
        ```C
        \#include<stdio.h>
        
        int a = 10;
        int b = 15;
        
        void swap()
        {
        	int t;
        	t = a;
        	a = b;
        	b = t;
        }
        
        int main()
        {
        	swap();
        	printf("a = %d, b = %d", a, b);
        	return 0;
        }
        ```
        
          
        
    
    - 第二种：使用指针接管地址
        
        ```C
        \#include<stdio.h>
        
        void swap(int *a, int *b)
        {
        	int t;
        	t = *a;
        	*a = *b;
        	*b = t;
        }
        
        int main()
        {
        	int a = 10;
        	int b = 15;
        	swap(&a, &b);
        	printf("a = %d, b = %d", a, b);
        	return 0;
        }
        ```
        
          
        
          
        
          
        
    
      
    
    ```C
    \#include<stdio.h>
    
    	int a = 10 ;
    	int b = 15;
    int swap(int a,int b)//需要注意的点
    /* 这里swap函数定义了两个int参数a和b，
    然后交换参数的值，并没有改变a和b全局变量的值
    
    不识说int swap(int a,int b)就是swap函数有a，b两个变量
    而是这告诉编译器，这里有两个参数，一个用a表示，另一个用b表示，他们都是int
    然后swap函数在编译器中就会创建两个int隐形内部变量，叫做a，b，然后执行他们的交换*/
    {
    	int t;
    	t = a ;
    	a = b ;
    	b = t ;
    
    }
    int main()
    {
    	swap(a,b);
    	/*这一句话的意思是告诉编译器，交换swap函数参数的值，a，b是swap函数的参数
    	而不是全局变量，因为你定义就是这么定义的*/ 
    	printf("a = %d, b = %d",a,b);
    	printf("%d",printf("hello"));
    	return 0;
    }
    ```
    
    **函数的调用**
    
    函数可以作为一个表达式的某一项，单独的语句，作为参数
    
      
    
    PS ：printf函数的返回值是printf的内容和字符数
    
    - 其中转义字符\n \a 等都是一个字符
    - 格式控制符%d，%s之类同理
    - 头文件中封装好的函数名字其实是函数的地址
    
**函数的声明**
- 函数的声名可以写在程序文件的任意位置
    
    示例：
    
    ![Untitled 7 15.png](../../../Files%20&%20LongText/Attachments/Untitled%207%2015.png)
    
    解决方法：提前声明函数原型
    
    void print（）;//函数原型提前声明，告诉编译器我有这个函数，你先不要报错，编译的时候，你去下面找
    
    放在调用函数代码之前的地方
    
    在函数下次调用的时候就会识别到
    
- 在函数中调用函数的时候，不需要写上函数的类型，不然int printf()函数就会被编译器认为实在函数中声明函数，调用只需写上名字就可以
- 在函数的声明中，形参的函数是可以省略，因为参数会储存到函数的内部变量中
思路：
- 一个变量存储input
- for循环判断是否有数字能被整除（因为已知循环总次数）  
    for(test_num=2;test_num≠input;test_num++)  
    
- 判断是否是素数（input % test_num ==0）
- 一旦匹配成功跳出循环
![%E5%88%A4%E6%96%AD%E7%B4%A0%E6%95%B0.cpp](%E5%88%A4%E6%96%AD%E7%B4%A0%E6%95%B0.cpp)
  
**1. 使用dowhile**
```C
\#include <stdio.h>
	int main()
	{
	    int result, x, i = 2;
	    printf("please input your number :");
	    scanf("%d", &x);
	    do {
	        if (i == x) {
	            printf("your number is not qualified .\n");
	            break;
	        }
	        result = x % i;
	        if (result == 0) {
	            printf("your number is not qualified .\n");
	            break;
	        }
	        else {
	            i++;
	            printf("result = %d, i = %d tring again.\n",result,i);
	        }
	    } while (i < x);
	    if (i == x) {
	        printf("your number is qualified .\n");
	    }
	    return 0;
}
```
![Untitled 212.png](../../../Files%20&%20LongText/Attachments/Untitled%20212.png)
**使用**for**语句**
```C
\#include <stdio.h>
int main(){
	int result, x, i;
	printf("please input your number :");
	scanf("%d", &x);
	for ( i=2;i<x;i++){
		if(x % i==0){
		break;
		}
	}
	if (i == x) {
	printf("your number is qualified .\n");
	}
	else{
	printf("your number is not qualified .");
	}
return 0;
}
```
![Untitled 1 28.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2028.png)
第二次写
```C
\#include <stdio.h>
int main(){
	int test_num=2,input=0,test=0;
	scanf("%d",&input);
	for(test_num=2;test_num!=input;test_num++){
		if(input % test_num ==0){
			printf("your num is not qualified .");
			break;
		}
	}
	if(input==test_num){
		printf("your num is qualified.");
	}
	return 0;
}
```
![Untitled 203.png](../../../Files%20&%20LongText/Attachments/Untitled%20203.png)
![Untitled 1 24.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2024.png)
```C
\#include <stdio.h>
int main()
{
    int cm = 0;
    scanf("%d", &cm);
    int foot = cm / 30.48;
    int inch = ((cm / 30.48) - foot) * 12;
    printf("%d %d", foot, inch);
    return 0;
}
```
1. 没有分号
![Untitled 200.png](../../../Files%20&%20LongText/Attachments/Untitled%20200.png)
PS：对于C语言来说，分号的换行，空格，位置关系没有任何影响
编译器通过识别不同的指令来判断一个个指令而不是通过人为的分号。
![Untitled 206.png](../../../Files%20&%20LongText/Attachments/Untitled%20206.png)
![Untitled 1 26.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2026.png)
![Untitled 2 22.png](../../../Files%20&%20LongText/Attachments/Untitled%202%2022.png)
![Untitled 3 19.png](../../../Files%20&%20LongText/Attachments/Untitled%203%2019.png)
[[循环计算数列]]
[[求一组数的平均数和总数]]
[[委派任务]]
任务要求
本关任务：某侦察队接到一项紧急任务，要求在A、B、C、D、E、F六个队员中尽可能多地挑若干人，但有以下限制条件：
- A和B两人中至少去一人；
- A和D不能一起去；
- A、E和F三人中要派两人去；
- B和C都去或都不去；
- C和D两人中去一个；
- 若D不去，则E也不去。
问应当让哪几个人去？ 程序分析：用a、b、c、d、e、f六个变量表示六个人是否去执行任务的状态，变量的值为1，则表示该人去；变量的值为0，则表示该人不参加执行任务，根据题意可写出表达式。
```C
\#include<stdio.h>
int main() {
    int a,b,c,d,e,f;
    for(int a=0; a<2; a++ ) {
        for(int b=0; b<2; b++ ) {
            for(int c=0; c<2; c++ ) {
                for(int d=0; d<2; d++ ) {
                    for(int e=0; e<2; e++ ) {
                        for(int f=0; f<2; f++) {
                            if((a+b>=1)&&(a+d==1)&&(a+e+f==2)&&(b-c==0)&&(c+d==1)&&(d-e>=0)) {
                                if(a==1)printf("A will be assigned.\n");
                                else printf("A will not be assigned.\n");
                                if(b==1)printf("B will be assigned.\n");
                                else printf("B will not be assigned.\n");
                                if(c==1)printf("C will be assigned.\n");
                                else printf("C will not be assigned.\n");
                                if(d==1)printf("D will be assigned.\n");
                                else printf("D will not be assigned.\n");
                                if(e==1)printf("E will be assigned.\n");
                                else printf("E will not be assigned.\n");
                                if(f==1)printf("F will be assigned.\n");
                                else printf("F will not be assigned.\n");
                            }
                        }
                    }
                }
            }
        }
    }
    return 0;
}
```
chat的简化版本
```C
\#include<stdio.h>
void print_assignment(char var, int value) {
    if(value==1)
        printf("%c will be assigned.\n", var);
    else 
        printf("%c will not be assigned.\n", var);
}
int main() {
    for(int a=0; a<2; a++ ) {
        for(int b=0; b<2; b++ ) {
            for(int c=0; c<2; c++ ) {
                for(int d=0; d<2; d++ ) {
                    for(int e=0; e<2; e++ ) {
                        for(int f=0; f<2; f++) {
                            if((a+b>=1)&&(a+d==1)&&(a+e+f==2)&&(b-c==0)&&(c+d==1)&&(d-e>=0)) {
                                print_assignment('A', a);
                                print_assignment('B', b);
                                print_assignment('C', c);
                                print_assignment('D', d);
                                print_assignment('E', e);
                                print_assignment('F', f);
                            }
                        }
                    }
                }
            }
        }
    }
    return 0;
}
```
![Untitled 218.png](../../../Files%20&%20LongText/Attachments/Untitled%20218.png)
**循环中出现的判断变量是不能大于for中的判断句限定的**
![Untitled 1 32.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2032.png)
for循环和while循环的对比比较
![Untitled 2 26.png](../../../Files%20&%20LongText/Attachments/Untitled%202%2026.png)
![Untitled 3 23.png](../../../Files%20&%20LongText/Attachments/Untitled%203%2023.png)
![Untitled 4 20.png](../../../Files%20&%20LongText/Attachments/Untitled%204%2020.png)
![Untitled 221.png](../../../Files%20&%20LongText/Attachments/Untitled%20221.png)
![Untitled 1 35.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2035.png)
```C
\#include <stdio.h>
int main()
{
    int i,n,sum=0,result=0;
    scanf("%d",&n);
    for(i=1;i<=n;i++){
        sum+=i;
        result+=sum;
    }
    printf("sum=%d",result);
    return 0;
}
```
```C
\#include<stdio.h>
int main(){
    int n,i,sum=0,result =0;
    scanf("%d",&n);
    while(i<=n){
        sum += i;
        result += sum;
        i++;
        
    }
    printf("sum=%d",result);
    return 0;
}
```
![Untitled 207.png](../../../Files%20&%20LongText/Attachments/Untitled%20207.png)
代码1（使用if经典思路）
```C
\#include<stdio.h>
int main()
{
int A,B,C,D;
A = 90;
B = 80;
C = 70;
D = 60;
int grade = 0;
printf("please input your grade : ");
scanf("%d",&grade);
if (grade >= A){
printf("your level is A !");
}else if(grade >= B){
printf("your level is B !");
}else if (grade >= C){
printf("your level is C !");
}else if (grade >= D){
printf("your level is E !");
}else
printf("your level is F !");
return 0 ;
}
```
代码2 （使用Switchcase选择语句）
```C
\#include<stdio.h>
int main()
{
int grade,gra;
printf("please input your grade : ");
scanf("%d",&grade);
gra = grade/=10;
switch (gra){
case 9:case 10:printf("your level is A !") ;break;
case 8:
printf("your level is B !") ;break;
case 7:
printf("your level is C !") ;break;
case 6:
printf("your level is D !") ;break;
default:
printf("your level is E !") ;break;
}
return 0 ;
}
```
![Untitled 205.png](../../../Files%20&%20LongText/Attachments/Untitled%20205.png)
```C
\#include<stdio.h>
int main()
{
    int money, bill = 0;
    printf("请输入价格：");
    scanf("%d", &bill);
    printf("请输入付款金额：");
    scanf("%d", &money);
    if (money < bill) {
        printf("您需要支付更多的金额！");
    }
    else {
        printf("我应该找您的零钱是：%d\\n", money - bill);
    }
    return 0;
}
```
![Untitled 202.png](../../../Files%20&%20LongText/Attachments/Untitled%20202.png)
```C
\#include <stdio.h>
int main()
{
    int A, B, C, D, E, F;
    scanf("%d %d", &A, &B);
    C = A + B;
    D = A - B;
    E = A * B;
    F = A / B;
    printf("%d + %d = %d\\n", A, B, C);
    printf("%d - %d = %d\\n", A, B, D);
    printf("%d * %d = %d\\n", A, B, E);
    printf("%d / %d = %d\\n", A, B, F);
    return 0;
}
```
![Untitled 210.png](../../../Files%20&%20LongText/Attachments/Untitled%20210.png)
  
思路：
- 一个变量存储取余之后的数（digital）
- 一个变量存储退位之后的数（backnum）
- 一个变量用来计算一步步逆序得到数字的总和（sum=sum*10+digital）
- backnum继续取余
整数逆序的一般处理规则
dight = num % 10；//得到最右边一位赋值给 dight
ret = ret * 10+dight;  //反顺序的步骤
num /= 10   //去掉最右边的一位数字
所以在这里应该使用一个循环回到初始位置一步步地减少数字的长度
![%E6%95%B4%E6%95%B0%E9%80%86%E5%BA%8F.cpp](%E6%95%B4%E6%95%B0%E9%80%86%E5%BA%8F.cpp)
**代码**
```C
\#include <stdio.h>
int main()
{
	int input=0,digital=0,sum=0;
	scanf("%d",&input);
	while (input>0){
	digital=input % 10;
	input=input / 10;
	sum=sum*10+digital;
	}
	printf("the num is %d",sum);
return 0;
}
```
**Chatgpt**代码示例**
```C
\#include <stdio.h>
int main() {
    int num, reversed = 0;
    // 提示用户输入一个整数
    printf("请输入一个整数: ");
    scanf("%d", &num);
    // 将各个位的数字倒序排列
    while (num != 0) {
        int digit = num % 10;
        reversed = reversed * 10 + digit;
        num /= 10;
    }
    // 输出倒序后的数字
    printf("倒序后的数字是: %d\\n", reversed);
    return 0;
}
```
![Untitled 216.png](../../../Files%20&%20LongText/Attachments/Untitled%20216.png)
思路：
- 首先计算有几位数（count）
- while(input>0){  
    input/10;  
    count++;  
    }\\count大小就是位数  
    
- 从左到右消减位数又是一个循环
- while(count>0){  
    printf(”%d”,input_1 / pow(10,count-1));  
    count—;  
    }  
    
![Untitled 1 31.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2031.png)
首先使用之前的倒序输出方法
![Untitled 2 25.png](../../../Files%20&%20LongText/Attachments/Untitled%202%2025.png)
再使用整数求逆的方法
![Untitled 3 22.png](../../../Files%20&%20LongText/Attachments/Untitled%203%2022.png)
改进方法：不再使用逆序求数字的方法（从右到左得到数字再反过来），而使用正序法，从左到右得到数字
![Untitled 4 19.png](../../../Files%20&%20LongText/Attachments/Untitled%204%2019.png)
改进方法：while的判断条件更改为使用mask而不是x，如果想不到的话还可以设置另一个记录输入的数字有几位数的变量行使功能
![Untitled 5 17.png](../../../Files%20&%20LongText/Attachments/Untitled%205%2017.png)
接下来优化位数问题，使用计数器
![Untitled 6 16.png](../../../Files%20&%20LongText/Attachments/Untitled%206%2016.png)
也可以不用计数器
![Untitled 7 16.png](../../../Files%20&%20LongText/Attachments/Untitled%207%2016.png)
最后的最后，当输入的数字等于1（x=1）就会导致dowhile循环中的循环体至少循环一次，从而导致，mask至少是10，而且因为有两轮循环的原因，x已经在第一轮循环之后改变了值，所以需要设置新的变量
```C
错误
\#include<stdio.h>
int main()
{
int a,b,max;
a = 0;
b = 0;
max = 0;
scanf("%d,%d",&a,&b);
if (a >= b){
printf("max = %d",a);
}else {
printf("max = %d",b);
}
return 0 ;
}
```
错误原因  
使用,将两个%d隔开，这就意味着输入两个变量中间必须要使用，  
否则如果使用空格键就回车，会无法读取到第二个数，默认为零  
正确
```C
\#include<stdio.h>
int main()
{
int a,b,max;
a = 0;
b = 0;
max = 0;
scanf("%d %d",&a,&b);
if (a >= b){
printf("max = %d",a);
}else {
printf("max = %d",b);
}
return 0 ;
}
```
反思  
更简洁版本代码  
```C
\#include<stdio.h>
int main()
{
int a,b,max;
//赋值部分删除，默认为零
scanf("%d %d",&a,&b);
if (a >= b){
printf("max = %d",a);
}else {
printf("max = %d",b);
}
return 0 ;
}
```
**错误示例**
```C
\#include<stdio.h>
\#include<math.h>
int main()
{
	int N,i,shu;
	scanf("%d",&N);//正常读入位数数据
	int n = pow(10,N);
	for (i=n/10;i<N;i++){//找出所有的数
		int t = i;
		int sum = 0;
		while(t>0){
			shu =t%10;//得到个位数
			t/=10;//去掉个位数
			int shu2 = pow(shu,N);
			int sum ;
			sum += shu2;
		}
		if (shu = i){
			printf("the num is = %d\n",i);
		}
	}
	return 0;
}
```
**错误原因**
1. 在 `**for**` 循环中，你的循环条件是 `**i<N**`，这是错误的。你应该遍历所有的 `**N**` 位数，所以循环条件应该是 `**i<n**`。
2. 你在 `**while**` 循环中重新定义了 `**sum**`，这会导致每次循环 `**sum**` 都被重置为 `**0**`。你应该在 `**while**` 循环外部定义 `**sum**`，并在循环内部累加每个位数的 `**N**` 次方。
    
    确实需要注意，重新定义会导致数据初始化
    
3. 在检查一个数是否是水仙花数时，你使用了 `**shu = i**`，这是错误的。你应该检查 `**sum**` 是否等于 `**i**`，即 `**sum == i**`。==号总是写成=
```C
\#include<stdio.h>
\#include<math.h>
int main()
{
	int N,i,shu;
	scanf("%d",&N);//正常读入位数数据
	int n = pow(10,N);
	for (i=pow(10,N-1);i<n;i++){//找出所有的数
		int t = i;
		int sum = 0;
		while(t>0){
			shu =t%10;//得到个位数
			t/=10;//去掉个位数
			int shuN = pow(shu,N);
			sum += shuN;
		}
		if (sum == i){
			printf("the num is = %d\n",i);
		}
	}
	return 0;
}
```
![Untitled 222.png](../../../Files%20&%20LongText/Attachments/Untitled%20222.png)
```C
\#include <stdio.h>
int main()
{
    float a,b,c,d,sum,average;
    scanf("%f,%f,%f,%f",&a,&b,&c,&d);
    sum=a+b+c+d;
    average=(a+b+c+d)/4;
    printf("本小组的总分为:%f,平均分为:%f",sum,average);
    return 0;
}
```
热身题  
要求，输入两个数求出它们的最小公约数，如不符合要有错误信息  
![Untitled 219.png](../../../Files%20&%20LongText/Attachments/Untitled%20219.png)
```C
\#include<stdio.h>
int main()
{
	int i = 2;
	int x,y;
	//int x=12,y=7;
	scanf("%d %d",&x,&y);
	if(x>y){
		int t=0;
		t=x;
		x=y;
		y=t;
	}
	while(i<x){
		if(x%i==0 && y%i==0){
			break;
		}
		i++;
	}
	if(i==x && y%i!=0){
		printf("your nums is not qualified .");
	}
	printf("\ni = %d",i);
	return 0;
}
```
最大公约数
![Untitled 1 33.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2033.png)
```C
\#include<stdio.h>
int main()
{
	int x,y;
	//int x=12,y=7;
	scanf("%d %d",&x,&y);
	if(x>y){//给xy大小排序，确保x是小的那一位
		int t=0;
		t=x;
		x=y;
		y=t;
	}
	int i = y;
	while(i<=y){
		if(x%i==0 && y%i==0){//满足互质的时候跳出循环
			break;
		}
		i--;//不满足继续试
	}
	if(i==x && y%i!=0){//错误信息的输出，条件是关键
		printf("your nums is not qualified .");
	}
	printf("\ni = %d",i);
	return 0;
}
```
知识：辗转相除法
![Untitled 2 27.png](../../../Files%20&%20LongText/Attachments/Untitled%202%2027.png)
上面的本质是穷举法，效率不高  
使用辗转相除法  
![Untitled 3 24.png](../../../Files%20&%20LongText/Attachments/Untitled%203%2024.png)
```C
#include<stdio.h>
int main()
{
	int a,b,t=0;
	//int x=12,y=7;
	scanf("%d %d",&a,&b);
	while(b!=0){
		t=a%b;
		a=b;
		b=t;
	}
	if(a==1){
		printf("your nums is not qualified .");
	}else{
		printf("the num is %d",a);
	}
	return 0;
}
```
![Untitled 220.png](../../../Files%20&%20LongText/Attachments/Untitled%20220.png)
![Untitled 1 34.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2034.png)
代码
```C
\#include<stdio.h>
int main()
{
	int a;
	scanf("%d",&a);
	a=6;
	int i,j,k;
	int cnt =0;
	i=a;
	while(i<=a+3){
		j=a;
		while(j<=a+3){
			k=a;
			while(k<=a+3){
				if(i!=j &&i!=k&&j!=k){
					cnt++;
					printf("%d%d%d",i,j,k);
					if(cnt==6){
						printf("\n");
						cnt =0;
					}else{
						printf(" ");
					}
				}
				k++;
			}
			j++;  // 将这行代码移动到这里
		}
		i++;  // 将这行代码移动到这里
	}
	return 0;
}
```
要求：猜大猜小有提示  
猜完给出猜的次数  
构思：
- 一个变量number存储计算机给出的随机数
- 一个可以更新的变量input存储用户给出的数字
- 判断输入错误or正确（if input==number）
- 给出提示语句（small or big）
- 猜错了设计循环（do while/while)
    - 计算猜数次数(count ++)
    - 开始条件：初始状态或者猜错了（无/number≠input)
    - 终止条件：猜对了（number=input/无）
```C
\#include<stdio.h>
\#include<time.h>
\#include<stdlib.h>
int main()
{
srand(time(0));
int num = rand()%100+1,input,count=1;
printf("i ve made a number between 1-100 , let s start the game .\n");
printf("please input the number you reckon : ");
scanf("%d",&input);
while(input != num){	
	if (input > num){
		printf("your number is bigger than the NUM !\n");
		count++;
	}else if (input < num){
		printf("your number is smaller than the NUM !\n");
		count++;
	}
	printf("please input the number you reckon again : ");
	scanf("%d",&input);
}
if(input == num){
	printf("your number is right ! you ve guess %d times ",count);
	count++;
}
return 0;
}
```
```C
\#include <stdio.h>
\#include <time.h>
\#include <stdlib.h>
int main()
{
	srand(time(0));
	int number = rand()%100+1,input,count=0;
	scanf("%d",&input);
	do{
		if(input>number)
		{
		count++;
		printf("your input is too big !");
		}
		else if(input<number)
		{
		count++;
		printf("your input is too small !");
		}
		scanf("%d",&input);
	}while(input!=number);
	count++;
	printf("you re right ! you ve guessed %d times !",count);
return 0;
}
```
![%E7%8C%9C%E6%95%B0%E6%B8%B8%E6%88%8F.cpp](%E7%8C%9C%E6%95%B0%E6%B8%B8%E6%88%8F.cpp)
错误
- 拼错stdlib.h
- dowhile终止条件写成 }while(input==number);导致循环只循环两次
优化
- 两个if之中有同样的部分count，scanf，都可以提到外面来，节省算力
- 通过设定count初始值等于1，省略掉最后一个count++
备注
- srand函数目的是让程序每次运行都得到一个不同的数
- 任何一个数%n，得到的结果是[0，n-1]的整数，所以使用rand()得到随机数之后然他生成[1,100]的数字，当然，也可以直接写int number = rand()%101
- [[rand函数]]
程序框架指的是写每个程序都必须要有的内容规范和声明部分
![Untitled 199.png](../../../Files%20&%20LongText/Attachments/Untitled%20199.png)
输出
![Untitled 1 22.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2022.png)
字符指的是数，字母等文本内筒内容，串表示的是一系列字符组成的东西
![Untitled 215.png](../../../Files%20&%20LongText/Attachments/Untitled%20215.png)
![Untitled 1 30.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2030.png)
```C
\#include<stdio.h>
int main()
{
	int n,i;
	double sum = 0.0;
	scanf("%d",&n);
	for( i = 1;i<=n;i++){
		sum += 1.0/i;
		
	}
	printf("f(%d) = %f",n,sum);
}
```
![Untitled 2 24.png](../../../Files%20&%20LongText/Attachments/Untitled%202%2024.png)
```C
\#include<stdio.h>
int main()
{
	int n,i;
	double sum = 0.0;
	scanf("%d",&n);
	for( i = 1;i<=n;i++){
		if(i % 2 == 0){
			sum += -1.0/i;
			}
		sum += 1.0/i;
	
	}
	printf("f(%d) = %f",n,sum);
}
```
使用sign函数及其优化
![Untitled 3 21.png](../../../Files%20&%20LongText/Attachments/Untitled%203%2021.png)
![Untitled 4 18.png](../../../Files%20&%20LongText/Attachments/Untitled%204%2018.png)
错误示例
```C
\#include<stdio.h>
\#include<math.h>
int main()
{
	int n,m,sum=0,result;
	int i,count=0,time=2;
	scanf("%d%d",&n,&m);
	for(i=n;i<=m;i++){
		for(time=2;time<i;time++){
			result=i%time;
			if(result==0){
				break;
			}
		}
		if(time == i){
			sum += i;
			count++;
		}
	}
	printf("The sum of prime numbers between %d and %d is %d\n", n, m, sum);
	return 0;
}
```
```C
\#include<stdio.h>
\#include<math.h>
int main()
{
	int n,m,sum=0,result;
	int i,count=0,time=2;
	scanf("%d%d",&n,&m);
	for(i=n;i<=m;i++){
		for(time=2;time<i;time++){
			result=i%time;
			if(result==0){
				break;
			}
		}
		if(time == i){
			sum += i;
			count++;
		}
	}
	printf("The sum of prime numbers between %d and %d is %d\n", n, m, sum);
	return 0;
}
```
思路
- [[判断一个数是不是素数（for语句重点）]]，将printf提示语改为直接输出
- 遍历1~100，因为次数已经固定，所以使用for(start=2;start≤100;start++)
- 当合格，直接打印结果
![%E8%AE%A1%E7%AE%97100%E4%BB%A5%E5%86%85%E7%B4%A0%E6%95%B0.cpp](%E8%AE%A1%E7%AE%97100%E4%BB%A5%E5%86%85%E7%B4%A0%E6%95%B0.cpp)
```C
\#include <stdio.h>
int main()
{
	    int x, i;
	    printf("please input your number :");
	    scanf("%d", &x);
	    for(x =2;x<100;x++){
	    for ( i=2;i<x;i++){
	    	if(x % i==0){
	    		break;
			}
		}
	    if (i == x) {
	        printf("your number is %d.\n",x);
		}
	}
    return 0;
}
```
![Untitled 213.png](../../../Files%20&%20LongText/Attachments/Untitled%20213.png)
至于计算给定数字范围内的素数，将start修改为开始数值，100修改为结束数值即可
要求：
![Untitled 209.png](../../../Files%20&%20LongText/Attachments/Untitled%20209.png)
思路：
- 一个变量存储初始综合值（sum）
- 一个变量存储输入值（input）
- 一个变量计算输入值数量（count）
- 将输入的值全部和sum相加并更新sum，循环输入（while（input！=1），sum+=input）
- 计算输入次数（count++循环）
- average=sum/count
![%E8%AE%A1%E7%AE%97%E5%B9%B3%E5%9D%87%E6%95%B0.cpp](%E8%AE%A1%E7%AE%97%E5%B9%B3%E5%9D%87%E6%95%B0.cpp)
错误：
- 在输入 -1 时，scanf在while语句前面程序会将-1也读入num作为一个数字进行计算
- 解决方法是将scanf**读取数字之后**使用if判断是否要继续放入循环中计算
```C
\#include<stdio.h>
int main() {
    int i = 0, ave = 0, sum = 0, num = 0;
    while (num !=  -1) {
        scanf("%d", &num);
        if(num == -1) {
            break;
        }
        sum = sum + num;
        i++;
    }
    if (num == -1) {
        ave = sum / i;
    }
    printf("the averge is : %d", ave);
    return 0;
}
```
更简洁，优化后的代码：
```C
\#include <stdio.h>
int main()
{
	int input = 0,sum=0,count=0;
	double average=0;
	while(input!=-1)
	{
	scanf("%d",&input);
	if(input==-1)
		{
			break;
		}
	sum+=input;
	count ++;
	}
	average = (double)sum/count;
	printf("average = %.2f",average);
return 0;
}
```
或者使用do-while语句：
```C
\#include<stdio.h>
int main() {
    int i = 0, ave = 0, sum = 0, num = 0;
    do {
        scanf("%d", &num);
        if (num != -1) {
            i++;
            sum += num;
        }
    } while (num != -1);
    ave = sum / i;
    printf("the averge is : %d", ave);
    return 0;
}
```
```C
	int ages[]={1,2,3,4,5};
	int len =sizeof(ages)/ sizeof(ages[0]);
```
  
![Untitled 217.png](../../../Files%20&%20LongText/Attachments/Untitled%20217.png)
![Untitled 201.png](../../../Files%20&%20LongText/Attachments/Untitled%20201.png)
```C
错误示例
\#include <stdio.h>
int main()
{
int time1,time2,hour1,hour2,hour3,min1,min2,min3;
scanf("%d %d",&time1,&time2);
hour1 = time1 / 100;
min1 = time1 % 100;
hour2 = time2 / 100;
min2 = time2 % 100;
hour3 = hour1 + hour2;
min3 = min1 + min2;
printf("%d%d",hour3,min3);
return 0;
}
```
  
![Untitled 1 23.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2023.png)
```C
\#include <stdio.h>
int main()
{
int time1,time2,time3,time4,time5,time6,time7,hour1,min1;
scanf("%d %d",&time1,&time2);
hour1 = (time1 / 100)*60;
min1 = time1 % 100;
time3 = hour1 + min1;
time4 = time3 + time2;
time5 = time4 / 60;
time6 = time4 % 60;
time7 = time5 * 100 + time6 ;
printf("%d",time7);
return 0;
}
```
PS 提取出多位数任意一位的数字值
![Untitled 2 21.png](../../../Files%20&%20LongText/Attachments/Untitled%202%2021.png)
第一次写  
  
```C
\#include<stdio.h>
int main ()
{
    int m,n,i;
    int count = 0,sum = 0 ;
    scanf("%d %d",&m,&n);
    //遍历所有范围内的数
    if (m==1)
    	m=2;
    for( i=m;i<=n;i++){
        int isPrime = 0 ;//这里一定要写isPrime初始值为1,不然下面的if语句中符合条件定义isPrime就没有意义了
        int k ;
        //验证范围内的一个数是不是素数
        for (k+2;k<i-1;k++){
        	if (i%k== 0){
        		isPrime = 0;
        		break;
			}
		}
		//判断i是不是素数,是的就进行计数和加和操作
		if(isPrime){
			count++;
			sum +=i;
		}
    }
    printf(" %d %d\n",count,sum);
    return 0;
}
```
正确代码
```C
\#include<stdio.h>
int main ()
{
    int m,n,i;
    int count = 0,sum = 0 ;
    scanf("%d %d",&m,&n);
    //遍历所有范围内的数
    if (m==1)
    	m=2;
    for( i=m;i<=n;i++){
        int isPrime = 1 ;
        int k ;
        //验证范围内的一个数是不是素数
        for (k=2;k<i-1;k++){
        	if (i%k== 0){
        		isPrime = 0;
        		break;
			}
		}
		//判断i是不是素数,是的就进行计数和加和操作
		if(isPrime){
			count++;
			sum +=i;
		}
    }
    printf("%d %d\n",count,sum);
    return 0;
}
```
要求：计算用户输入的n的阶乘并输出
![Untitled 211.png](../../../Files%20&%20LongText/Attachments/Untitled%20211.png)
for循环的三个条件句实在循环开始的时候计算的
![%E8%AE%A1%E7%AE%97%E9%98%B6%E4%B9%98.cpp](%E8%AE%A1%E7%AE%97%E9%98%B6%E4%B9%98.cpp)
![Untitled 1 27.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2027.png)
**注意  一般的求积运算一般要初始化变量值为1**
![Untitled 2 23.png](../../../Files%20&%20LongText/Attachments/Untitled%202%2023.png)
**思路**
- 存储input
- for递减循环，开始变量count=0，循环次数为直到number=1，循环每次number-1
- 一个变量存储乘积（sum）
- 做法有正序计算和倒序计算两种，for比较好3652
**代码：**
错误示例
```C
\#include<stdio.h>
int main()
{
    int n, factor, i;
    scanf("%d", &n);
    factor = n;
    for(i = n; i > 0 ;i--){
        factor = factor * i;
    }
    printf("the final is %d ", factor);
    return 0;
}
```
**改良后代码**
```C
\#include<stdio.h>
int main()
{
    int n, factor, i;
    scanf("%d", &n);
    factor = 1;
    for(i = n; i > 0 ;i--){
        factor = factor * i;
    }
    printf("the final is %d\\n", factor);
    return 0;
}
```
**使用递增的**while**循环代码**
```C
\#include<stdio.h>
int main()
{
    int n, factor, i;
    printf("please input the number : ");
    scanf("%d", &n);
    factor = 1;
    for(i = n; i > 0 ;i--){
        factor = factor * i;
    }
    printf("the final is %d\\n", factor);
    return 0;
}
```
**代码优化**
![Untitled 3 20.png](../../../Files%20&%20LongText/Attachments/Untitled%203%2020.png)
```C
\#include <stdio.h>
int main()
{
	int foot;
	int inch;
	float height;
	scanf("%d %d", &foot,&inch);
	height=(foot+inch/12)*0.3048;
	printf("your height is :%f cm",height);
	return 0;
}
```
## 运行结果  
输入  
5 7  
输出  
your height is :1.524000 cm  
Process exited after 4.188 seconds with return value 0  
Press any key to continue . . .
**本题要求对任意给定的1位正整数N，输出从1*1到N*N的部分口诀表。**
  
错误示例1
```C
\#include<stdio.h>
\#include<math.h>
int main()
{
	int n,first=1,second=1;
	scanf("%d",&n);
	for(first = 1;first<=n;first++){
		for(second = 1;second<=n;second++){
			printf("%d*%d=%d",first,second,first * second);
		if (first!=n||second!=n){
		printf("\t");
		}
		if (second==n){
		printf("\n");
		}
		
		}
	
	}
	return 0;
}
```
```C
\#include<stdio.h>
\#include<math.h>
int main()
{
	int n,first=1,second=1;
	scanf("%d",&n);
	for(first = 1;first<=n;first++){
		for(second = 1;second<=n;second++){
			printf("%d*%d=%d",first,second,first * second);
		if (second!=n){
		printf("\t");
		}
		}
	printf("\n");
	}
	return 0;
}
```
```C
\#include<stdio.h>
\#include<math.h>
int main()
{
	int n,first=1,second=1;
	scanf("%d",&n);
	for(first = 1;first<=n;first++){
		for(second = 1;second<=first;second++){
			printf("%d*%d=%d",second,first,first * second);
			if (second!=first){
				printf("\t");
			}
		}
		printf("\n");
	}
	return 0;
}
```
Ps：制表位的作用
在C语言中，`**\t**` 是一个特殊字符，代表制表符（Tab）。当你在 `**printf**` 语句中使用 `**\t**`，它会在输出中添加一定数量的空格，使得输出内容对齐到下一个制表位。制表位的位置通常是每隔8个字符就设置一个，但这可能会根据你的环境或设置有所不同。
因此，当你在两个等式之间添加 `**\t**`，无论每个等式的长度如何，下一个等式都会开始于下一个制表位，从而实现了等式的左对齐。这就是为什么你的乘法表中的等式看起来是整齐的，每列的等式都是左对齐的。
![Untitled 204.png](../../../Files%20&%20LongText/Attachments/Untitled%20204.png)
进制转换的标识符的使用也有用
![Untitled 1 25.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2025.png)
