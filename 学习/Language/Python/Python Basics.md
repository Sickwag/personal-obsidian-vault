[https://www.bilibili.com/video/BV1qW4y1a7fU/?p=123&spm_id_from=333.880.my_history.page.click](https://www.bilibili.com/video/BV1qW4y1a7fU/?p=123&spm_id_from=333.880.my_history.page.click)
## 编程中遇到的问题
[Files & LongText/Long code/Python](../../../Files%20&%20LongText/Long%20code/Python.md)
## 基础认识
### 标识符
**标识符命名**
- 只允许出现字符和==唯一允许的下划线符号==，
- 数字不可以用在开头
- 不能占用关键字，但是因为大小写敏感，大小写不一样可以使用

### 关键字
![Untitled 2 32.png](../../../Files%20&%20LongText/Attachments/Untitled%202%2032.png)
### 变量命名
- 使用单单个英文字母尽量使用小写
- 尽量简洁，英文单词之间使用下划线分开

### 运算符
**算术运算符**
![Untitled 3 29.png](../../../Files%20&%20LongText/Attachments/Untitled%203%2029.png)
**符合运算符**
![Untitled 4 25.png](../../../Files%20&%20LongText/Attachments/Untitled%204%2025.png)字符串
#### 字符串的三种定义方式
被双引号包围的字符叫做字符串，有三种方式
![Untitled 5 22.png](../../../Files%20&%20LongText/Attachments/Untitled%205%2022.png)
被引用的字符串的类型为（str）
注意三引号写法本质上在未被变量接收时是多行注释（支持换行）
**PS：定义含有引号的引号的字符解决方法**
![Untitled 6 21.png](../../../Files%20&%20LongText/Attachments/Untitled%206%2021.png)
转义字符\表示后面的一个字符市区它的定义作用而变成普通的字符
#### 字符串的拼接
![Untitled 7 21.png](../../../Files%20&%20LongText/Attachments/Untitled%207%2021.png)
没有办法将name代表的中文字符后面直接接上年龄18等数字字符（不能两个变量一块写name age）
![Untitled 8 19.png](../../../Files%20&%20LongText/Attachments/Untitled%208%2019.png)
```Python
name = "Sickwag"
message = "Stupid Rookie is %s" %name
print(message)
```
在引用message时就会跟上引用的内容
拼接目的是把不同数据类型的变量组合在一起用一个变量接收表示，方便后面引用。
```Python
name = "Sickwag_1"
age = 20
message = "there was a guy named %s ,and he was a %s old man." % (name,age)
print(message)
# 引用多个变量占位时，后面占位引用需要用括号包裹，
# 变量之间使用逗号
```
**字符串中的格式符号**
![Untitled 9 18.png](../../../Files%20&%20LongText/Attachments/Untitled%209%2018.png)
浮点数表示小数,默认设置为6为小数,这里涉及到[Python Basics](Python%20Basics.md)
#### 格式化的精度控制
- m，控制宽度，要求是数字（很少使用），设置的宽度小于数字自身，不生效
- - .n，控制小数点精度，要求是数字，会进行小数的四舍五入
- 示例：  
    - %5d：表示将整数的宽度控制在5位，如数字11，被设置为5d，就会变成：[空格空格】空格]11，用三个空格补足  
    宽度。  
    - %5.2f：表示将宽度控制为5，将小数点精度设置为2小数点和小数部分也算入宽度计算。如，对11.345设置了%7.2f后，结果是：[空格】[空格]11.35。2个空格补足宽度，小数部分限制2位精度后，四舍五入为.35  
    - %.2f：表示不限制宽度，只设置小数点精度为2，如11.345设置%.2f后，结果是11.35  
    
- %d表示将占位符的内容转化为数字存储到变量中去，==即定义为整数有定义为有小数位数是不合适的。==
- 对长度超过定义宽度的数字对数字没有影响，如11定义宽度为1，输出结果为11，
- 对小数部分超过定义宽度，就会四舍五入

```Python
Pi = 3.1415926535
print("the Pi acuracy is %5.4d" %Pi)
```
#### 字符串格式化——快速格式化（f-str格式化方法）
语法：：f“内容{变量}的格式来快速格式化
这种方式：
- 不会管类型，统一使用str格式
- 不做精度控制，本来是多少就是多少

在字符串前加上f(format)，然后在需要展位的地方使用括号括起内容
```Python
data_now = 20240711
time_now = 1709
print(f"now the data is {data_now} and the time is {time_now}.")
```
#### 对表达式进行格式化
**表达式:一条具有明确结果的表达式**
目的是简化代码,表达更清楚
```Python
money = 100
spend = 10
print(f"i have {money}$ and then spend {spend}$,i have left with {money - spend}")
```
```Python
name = "Tencent"
stock_price = 19.99
stock_code = 123456
daily_growth = 1.2
growth_days = 7
print(f"Company: {name} \tstock code:{stock_code} \tcurrent stock price:{stock_price}")
print("daily growth:%.1f\t,after 7 days ,the finnal stock price is %4.2f" %(daily_growth,stock_price*(daily_growth**7)))
\#print(f"daily growth:{daily_growth}\t,after 7 days ,the finnal stock price is {stock_price*(daily_growth**7)}")
   #表示的时另一种快速格式化的写法,但无法控制精度,所以使用
	 #快速格式化和常用格式化两种方法
```
PS：
- 这里如果股票开头为0，需要定义字符串stock_code=”012345”，而不能直接写
- 大括号中允许对表达式进行格式化，但是==**不允许赋值操作**==

- 数据输入

    input语句是从键盘读取输入内容，**所有的输入内容都转换为str**

    input语句括号中可以填写提示内容而省略printf输出提示内容这一步骤

    ```Python
    
    name = input("please input your name :")
    print(f"got it ! Welcome to this system {name}!\n")
     \#testing the type of "name"
    print("the type of name index is %s"%type(name))
    ```

### 类型转换
使用内置函数完成数据类型转换

|函数|描述|
|---|---|
|[int(x [,base])](https://www.runoob.com/python3/python-func-int.html)|将x转换为一个整数|
|[float(x)](https://www.runoob.com/python3/python-func-float.html)|将x转换到一个浮点数|
|[complex(real [,imag])](https://www.runoob.com/python3/python-func-complex.html)|创建一个复数|
|[str(x)](https://www.runoob.com/python3/python-func-str.html)|将对象 x 转换为字符串|
|[repr(x)](https://www.runoob.com/python3/python-func-repr.html)|将对象 x 转换为表达式字符串|
|[eval(str)](https://www.runoob.com/python3/python-func-eval.html)|用来计算在字符串中的有效Python表达式,并返回一个对象|
|[tuple(s)](https://www.runoob.com/python3/python3-func-tuple.html)|将序列 s 转换为一个元组|
|[list(s)](https://www.runoob.com/python3/python3-att-list-list.html)|将序列 s 转换为一个列表|
|[set(s)](https://www.runoob.com/python3/python-func-set.html)|转换为可变集合|
|[dict(d)](https://www.runoob.com/python3/python-func-dict.html)|创建一个字典。d 必须是一个 (key, value)元组序列。|
|[frozenset(s)](https://www.runoob.com/python3/python-func-frozenset.html)|转换为不可变集合|
|[chr(x)](https://www.runoob.com/python3/python-func-chr.html)|将一个整数转换为一个字符|
|[ord(x)](https://www.runoob.com/python3/python-func-ord.html)|将一个字符转换为它的整数值|
|[hex(x)](https://www.runoob.com/python3/python-func-hex.html)|将一个整数转换为一个十六进制字符串|
|[oct(x)](https://www.runoob.com/python3/python-func-oct.html)|将一个整数转换为一个八进制字符串|
## 判断语句
#### 布尔类型和比较运算符
布尔类型本质上是数字类型的一种，使用type得到的返回结果是bool
布尔类型可以由赋值和比较得到（本质上是由表达式）
**布尔类型用在判断、循环等语句的条件句上，条件句只能是一个表达式，根据得到的结果执行命令，不能是赋值语句**
![Untitled 10 16.png](../../../Files%20&%20LongText/Attachments/Untitled%2010%2016.png)
- 布尔类型只有两个字面量，True和False，注意大写
- 布尔类型也可用于字符串是否相同、

```Python
name_1 = "Troye"
name_2 = "Troye"
print("the result is %s" %(name_1==name_2))
```
**条件语句并列**
python 中直接使用关键字链接 bool 判断式：逻辑与（AND）、逻辑或（OR）和逻辑非（NOT）分别使用 `and`、`or` 和 `not` 关键字。这与 [C++ Runoob Tutoral \> 条件并列](../C%20C++/C++%20Runoob%20Tutoral.md#条件并列)使用逻辑符号不同 ^80d212
#### IF判断语句
```Python
if 要判断的条件:    #冒号不要忘记
    判断成立需要做的事
```
python使用缩进表示层级，if后的语句为False结果，那么不会进行
```Python
age = int(input("please input your age :"))
if age >= 18:
    print("you are an adult , please check your ticket and rejoy now .")
print("you are under 18 years-old , you re free to play !")
```
#### if else条件语句
![Untitled 11 16.png](../../../Files%20&%20LongText/Attachments/Untitled%2011%2016.png)
注意else语句不需要写条件句,但是有冒号
```Python
print("welcome to the amusement park !\n")
height = int(input("please input your height :"))
if height >= 120:
    print("unfortunatly , your height is over 120 cm , you must have a ticket.")
else :
    print("your height is under 120cm , therefore you re free to play !")
```
#### if elif else条件语句
判断条件不止一个时,需要使用到elif分开多个条件
![Untitled 12 16.png](../../../Files%20&%20LongText/Attachments/Untitled%2012%2016.png)
- 注意,elif语句的条件判断是从上到下匹配的,一旦相同立即终止运行
- 使用elif时,最后一个条件一定要写else,不能以elif结尾
- **可以在条件判断语句中直接输入input提示语句,减少代码量.**

**猜数小游戏**
[Python Basics](Python%20Basics.md)
```Python
import random
randomnum = random.randint(1,10)
answer= int(input("please input your number : "))
if answer > randomnum:
    print("your answer num is bigger than randomnum . please try again .")
elif answer < randomnum:
    print("your answer num is smaller than randomnum . please try again .")
else:
    print("you are right !")
```
#### 判断语句的嵌套
嵌套的目的
![Untitled 13 16.png](../../../Files%20&%20LongText/Attachments/Untitled%2013%2016.png)
```Python
if 条件1：
	满足条件1做的事情1
	满足条件1做的事情2
	if条件2：
		满足条件2做的事情1
		满足条件2做的事情2
```
**应用场景：猜数字游戏**
```Python
import random
randomnum = random.randint(1,10)
attemps = 3
print("welcome to the number guessing game !\n you have 3 attempts to guess the secret number .")
while attemps > 0 :
    guess = int(input("please input your guess number :"))
    if guess == randomnum :
        print("Congratulations! you have guess right in %d attempts!"%(4-attemps))
    else :
        attemps -= 1
        if attemps > 0 and guess > randomnum:
            print("your guess num is bigger than the secret number try again .")
        elif attemps > 0 and guess < randomnum:
            print("your guess num is smaller than the secret number try again .")
        else :
            print("sorry you have run out all attempts you have ")
```
**应用场景：公司年终奖**
1.必须是大于等于18岁小于30岁的成年人  
2.同时入职时间需满足大于两年，或者级别大于3才可领取  
PS：当写出else后面加if就需要转化为elif更为合适
![Untitled 14 16.png](../../../Files%20&%20LongText/Attachments/Untitled%2014%2016.png)
```Python
age = int(input("please input your age : "))
if age >= 18:
    print("your age is qualified .")
    work_time = int(input("please input your work time "))
    if work_time > 2 :
        print("congradulations! you are qualified with a gift !")
    else :
        print("unfortunatly, your work time is not qualified.")
        level = int(input("please input your level :"))
        if level > 3:
            print("but you are still enabled to take it .")
        else :
            print("Sorry , you are not qualified .")
else:
    print("your are too young child , maybe next time .")
```
[Python Basics](Python%20Basics.md)
## 循环语句
### while循环的基础内容
![Untitled 15 16.png](../../../Files%20&%20LongText/Attachments/Untitled%2015%2016.png)
```Python
i = 0
while i < 100:
    print("i like you , please be my girlfriend .")
    i += 1
    # 注意循环终止条件
```
**循环案例：求1——100和**
```Python
i = 0
count = 1
while count <= 100:
    i += count
    count += 1
print("1+2+3....+100 = {}".format(i))
```
### while循环案例
猜数字循环写法
```Python
import random
num = random.randint(1,20)
guess = 0
attempt = 0
while guess != num :
    guess = int(input("please input your guess number :"))
    if guess < num:
        attempt += 1
        print("your number is bigger than the secret num")
    elif guess > num:
        attempt +=1 
        print("your number is bigger than the secret num")
print("you got the right answer in {} attempts !".format(attempt+1))
```
#### while嵌套循环的基本应用
表白送花
```Python
i = 1
while i <= 100:
    print(f"today is the {i} day ,preparing the confession....")
    flower = 1
    while flower <= 10 :
        print("honey there are {} flower for you.".format(flower))
        flower += 1
    print("i like you .")
    i += 1
print("today is my {} day to confession , Success !".format(i-1))
```
#### 嵌套循环案例
打印九九乘法表
PS：在python中打印语句会根据代码的换行情况自动换行  
使用,  
**end=‘’表示不换行**
![Untitled 16 15.png](../../../Files%20&%20LongText/Attachments/Untitled%2016%2015.png)
**制表符**
制表符的意义是让多行内容对齐
![Untitled 17 15.png](../../../Files%20&%20LongText/Attachments/Untitled%2017%2015.png)
```Python
line = 1
while line <= 9 :
    column = 1 
    while column <= line :
        print(f"{column} * {line} = {line * column}\t",end = '')
        column += 1
    line += 1
    print()  #打印空内容的目的是一个换行符号
```
### for循环基础语法
轮询机制理解
![Untitled 18 14.png](../../../Files%20&%20LongText/Attachments/Untitled%2018%2014.png)
![Untitled 19 13.png](../../../Files%20&%20LongText/Attachments/Untitled%2019%2013.png)
- 将待处理数据集中的内容一个个取出放在临时变量中存储
- 每一个临时变量都去运行满足条件时的代码
- 没有循环条件，循环执行多少次完全取决于数据的内容大小
- 变量可以是字符串，数字等，这样的遍历集叫做序列

```Python
name = "Sickwag"
for x in name :
    print(f"{x}")
```
案例：数一数有几个a
```Python
word = "itheima is a brand of itcast"
count = 0
for tempoary in word :
    if tempoary == "a":
        count += 1
print(f"the sentense has {count} a character(s)")  
```
#### for循环的临时变量
for循环的变量原则上只在for循环内部使用，不会在外出现
![Untitled 23 12.png](../../../Files%20&%20LongText/Attachments/Untitled%2023%2012.png)
如果途中没有i=0 的声明，i会undefined，但因为for中有，所以调用for中最后一次i的结果作为i的值，**这样的代码很不规范**
#### for循环的嵌套应用
**表白送花问题**
```Python
for tempoary in range(1,101):
    print(f"today is the {tempoary} day to confess ")
    for flower in range(1,11):
        print(f"honey , {flower} flower(s) there for you.")
    print("i like you .")
print("finnally i success in the 100 day !")
```
**使用for循环打印九九乘法表**
```Python
for line in range(1,10):
    for column in range(1,10):
        if column <= line:
            print(f"{line} * {column} = {line * column}\t",end='')
    print()
```
关于上面的五行代码，其实可以精简成4行
```Python
for line in range(1,10):
    for column in range(1,line+1):  
    # 这里将column的最大数字用line动态表示
            print(f"{line} * {column} = {line * column}\t",end='')
    print()
```
### range语句
- for语句遍历的本质是遍历序列类型的数据
- 序列类型指的是**内容可以一个个取出的类型**

语法：
![Untitled 20 13.png](../../../Files%20&%20LongText/Attachments/Untitled%2020%2013.png)
![Untitled 21 13.png](../../../Files%20&%20LongText/Attachments/Untitled%2021%2013.png)
![Untitled 22 12.png](../../../Files%20&%20LongText/Attachments/Untitled%2022%2012.png)
语法3 中的步长表示的等差数列的公差
[Python Basics](Python%20Basics.md)
这三种表示的是range的不同数量的参数表示的不同意思
```Python
# one parament in range
for tempoary in range(10):
    print(f"{tempoary}")
\#two paraments in range
for tempoary in range(12,20):
    print(f"{tempoary}")
\#three paraments 
for tempoary in range(1,100,2):
    print(f"{tempoary}")
```
**练习案例：1-100有几个偶数**
```Python
count = 0
for tempoary in range(1,100) :
    if tempoary % 2 == 0 :
        count += 1
print(f"there are {count} even number(s) in this sentence.")
```
### continue和break
- continue的作用是在写continue的位置停止下面的内容，直接从头==**开始本次循环**==
- continue只会作用最近的一个结构
- break作用是直接==**结束本次循环**==，执行循环结构之后的语句
- 同样break之作用于一个结构

```Python
for tempoary in range(1,4):
    print("sentence 1") 
    print("sentence 2") 
    continue
    print("sentence nodisplay") 
print("sentence over")
for tempoary in range(1,100):
    print("sentence only one time")
    break
    print("sentence nodisplay ]")
for tempoary in range(1,6):
    print("sentence keep going 5 times")
```
### 循环综合案例
应用场景：
某公司，账户余额有1W元，给20名员工发工资。
- 员工编号从1到20，从编号1开始，依次领取工资，每人领取1000元
- 领工资时，财务判断员工的绩效分（1-10）（随机生成），如果低于5，不发工资，换下一位
- 如果工资发完了，结束发工资。

```Python
salary_in_sum = 10000
for employee_num in range(1,21):
    import random
    degree = random.randint(1,10)
    if degree >=5 :
        salary_in_sum -= 1000
        print(f"the employee {employee_num} will got salary 1000$ ,the balance left with {salary_in_sum}")
        if salary_in_sum == 0 :
            print("there has no money to spend out , next month maybe .")
            break
    else :
        print(f"the employee {employee_num}'s degree {degree} lower than 5, got no mone , so next one ")
```
## 函数
### 基础定义和使用
**函数是组织好的，可重复使用的，用来实现特定代码功能的代码段**
目的是自定义想要的函数，减少重复性的功能
```Python
#下面开始自己定义内置len函数
name1 = "Sickwag"
name2 = "Shoil Dynasty"
name3 = "Mashall"
count = 0
for tempoary in name1 :
    count += 1
print(count)
count = 0
for tempoary in name2 :
    count += 1
print(count)
count = 0
for tempoary in name3 :
    count += 1
print(count)
# 下面开始自定义函数
def my_len(data):
    count = 0
    for index in data :
        count += 1
    print(count)
my_len(name1)
my_len(name2)
my_len(name3)
```
### 定义的语法
![Untitled 24 12.png](../../../Files%20&%20LongText/Attachments/Untitled%2024%2012.png)
定义完函数之后需要调用函数才能使用（先定义，后使用）
### 参数使用
在函数进行计算的时候对外部数据调用
```Python
def add(x,y):
    z = x + y
    print(z) 
add(5,6)
```
**形参和实参的区别**
![Untitled 25 12.png](../../../Files%20&%20LongText/Attachments/Untitled%2025%2012.png)
传入参数时一一对应
```Python
def check(temperature):
    if temperature <= 37.5:
        print(f"Your temperature is {temperature}. You need to be separated.")
    else:
        print(f"Your temperature is {temperature}. You are enabled.")
temp = float(input("Please input your temperature: "))
check(temp)
#检查提问小程序
```
### 返回值定义语法
- 函数返回值表示函数执行的结果，可以自定义满足某种条件之后返回的特定结果，返回值通过变量接收
- 定义返回值之后函数的结果是return结果，不管函数是怎么执行的
- 定义函数中一旦遇到return，之后的同一层的所有函数体全部失效

```Python
def add(x,y):
    z = x + y
    print(z)
    return z
    print("i m done")
add(5,6)
```
#### 返回值none类型
Nonetype类型值表示函数没有返回有意义的内容，没有定义函数返回值时（或者手动定义返回值return None）就会有这样的返回值
- None在意义上等于False，用于条件句，布尔类型调用方便直接调用
- 在定义某些暂时不需要赋值的变量时，可以使用none

#### 说明文档
- 通过多行注释在函数体使用多行注释表示函数的作用
- 需要对每个变量，返回值进行说明

![Untitled 26 12.png](../../../Files%20&%20LongText/Attachments/Untitled%2026%2012.png)
```Python
def add(x,y):
    """
    这个函数是一个简单的把两个参数相加的函数
    :param x: 参数x
    :param y: 参数y
    :return: 返回的和
    """
    z = x + y
    print(z)
    return z
    print("i m done")
		# 在编译器中鼠标悬停在定义的新函数上时会显示函数说明文档
add(5,6)
```
#### 嵌套调用
![Untitled 27 12.png](../../../Files%20&%20LongText/Attachments/Untitled%2027%2012.png)
顾名思义
#### 变量的作用范围
- 局部变量：在函数体内部有作用，在函数**执行完毕后立刻销毁**。函数外调用会提示undefined报错

![Untitled 28 12.png](../../../Files%20&%20LongText/Attachments/Untitled%2028%2012.png)
- 函数内部对全局变量的修改影响不会扩散到函数外部，因为**函数执行完毕后局部变量的定义立即销毁**
- 使用global关键字设置函数内部变量为全局变量

```Python
um = 100
def test_a():
    global num
    num = 200
    print(num)
    return num 
test_a()
```
### 综合案例
**要求：**
![Untitled 29 12.png](../../../Files%20&%20LongText/Attachments/Untitled%2029%2012.png)
![Untitled 30 12.png](../../../Files%20&%20LongText/Attachments/Untitled%2030%2012.png)
![Untitled 31 12.png](../../../Files%20&%20LongText/Attachments/Untitled%2031%2012.png)
```Python
money = 5000000
name = input("please input your name :")
def main_menu():
    print("------main menu------")
    print(f"Dear {name} ,welcome to ATM system,please select operation :")
    print("check balance \t\t [input 1] ")
    print("deposit \t\t [input 2] ")
    print("withdrawal \t\t [input 3] ")
    print("exit \t\t\t [input 4] ")
    return input("please input your selection number :")
def check_balance(show_header):
    if show_header:
        print("------checking deposit------")
        # 因为每次进行查询操作之后都要显示余额，可以直接调用余额查询函数
        # 余额函数会显示表头，可以通过不同定义函数的参数控制是否生成表头
    print(f"dear {name},your account has left with {money}$")
def deposit(num):
    global money
    money += num
    print("------deposit------")
    print(f"dear {name} ,you have deposit {num} successfully !")
    check_balance(False)
    #加上一句调用余额查询函数，但是表头显示参数为false
def withdrawal(num):
    global money
    money -= num
    print("------deposit------")
    print(f"dear {name} ,you have withdrawal {num} successfully !")
    check_balance(False)
while True :
    selection = main_menu()
    if selection == "1":
        check_balance(True)
        continue
    elif selection == "2":
        num = int(input("please input the money you want deposit."))
        deposit(num)
        continue
    elif selection == "3":
        num = int(input("please input the money you want withdrawal."))
        withdrawal(num)
        continue
    else :
        print("exit")
        break
```
## 数据容器
^9e8467

### 数据容器的迭代
==注意,对任何数据容器迭代（如列表、元组、字典、集合等）时，通常情况下，迭代会按照容器中元素的顺序依次进行。==
```Python
tuple = ((1,2),(2,3),(3,4))
print(tuple)
```
这段代码会输出整个元组，而不是迭代元组中的每个子元组。`print(tuple)`会打印出元组的字符串表示形式，即：
```Plain
((1, 2), (2, 3), (3, 4))
```
如果你想要迭代元组中的每个子元组并打印它们，你需要使用循环来迭代元组：
```Python
tuple = ((1,2),(2,3),(3,4)
for sub_tuple in tuple:
    print(sub_tuple)
```
这段代码会依次输出元组中的每个子元组：
```Plain
(1, 2)
(2, 3)
(3, 4)
```
如果你想要迭代子元组中的每个元素并打印它们，你可以**使用嵌套循环**：
```Python
tuple = ((1,2),(2,3),(3,4))
for sub_tuple in tuple:
    for item in sub_tuple:
        print(item)
```
这段代码会依次输出元组中每个子元组的每个元素：
```Plain
1
2
2
3
3
4
```
### 数据容器入门
使用数据容器可以用一个变量记录多种不同数据类型的数据
数据容器根据特点的不同，如：
- 是否支持重复元素
- 是否可以修改
- 是否有序
- 分为5类，分别是：列表（list）、元组（tuple）、字符串（str）、集合（set）、字典（dict）

### List列表
#### 列表的定义格式
![Untitled 32 12.png](../../../Files%20&%20LongText/Attachments/Untitled%2032%2012.png)
对于定义空列表，[Python Basics](Python%20Basics.md)，可以将括号内部的参数带有的数据转换为列表格式
列表格式是一个数据格式，列表内部的元素类型不收显示，type查询接受列表的变量返回的结果是list
```Python
name_list = ["string",123,153.26,True,[1,2,3,4,5]]
print(name_list)
print(type(name_list))
返回结果：
['string', 123, 153.26, True, [1, 2, 3, 4, 5]]
<class 'list'>
# name是一个列表，所以pirnt返回出列表中的每一个元素，又因为变量
# 是列表，所以使用[]标注出来，string是列表中的一个字符串元素
# 所以使用‘’标记，说明这个元素是一个字符串类型，
# 至于数字和浮点型可以看出来
# 布尔类型本质上是数字类型，同样不给予特殊标记
# 数组类型作为元素，print出的同时用[]标注是数组类型
```
#### 列表的下标索引
^033e3c

通过下表索引去除对应的元素
下表索引不能超出范围,不然会报错
- 索引从零开始，一般从左向右读取

    ![Untitled 33 12.png](../../../Files%20&%20LongText/Attachments/Untitled%2033%2012.png)

- 索引从附属开始，表示从右向左读取数据

    ![Untitled 34 12.png](../../../Files%20&%20LongText/Attachments/Untitled%2034%2012.png)

    但是从左到右都是逐渐变大

    ![Untitled 35 12.png](../../../Files%20&%20LongText/Attachments/Untitled%2035%2012.png)

- 嵌套列表元素获取

    ```Python
    name_list = list(range(1,21))
    print(name_list)
    '''
    range函数返回结果为[1-20]，是一个列表类型的元素
    如果直接print，会得到一个直接print出来的列表而不是数组
    所以使用list将列表转化为数组类型，print就会打印出数组
    而不是打印出[range(1,21)]列表字样
    '''
    ```
    需要获取列表中的列表中的元素的方法

    #### **将26个英文字母逆序打印**

```Python
    import string
    letters = list(string.ascii_uppercase)  # 生成 A 到 Z 的字母列表
    reverse_letters = list(reversed(letters))  # 反转字母列表
    for i in range(len(reverse_letters) - 1):
        print(reverse_letters[i], reverse_letters[i + 1], sep='\n')
    """
    使用range和len控制循环次数为0——25，,26次，依次打印所有字母
    步长sep使用\n表示打印一次换行一次
    """
``` 
^0b87d1

#### 列表的功能（方法）
将函数定义为class类的成员，那么函数会被称之为方法  
他们的功能一样，但是方法的使用格式不同  
![Untitled 36 12.png](../../../Files%20&%20LongText/Attachments/Untitled%2036%2012.png)
![Untitled 37 12.png](../../../Files%20&%20LongText/Attachments/Untitled%2037%2012.png)
方法的使用中，student变量等于Student类，然后定义num变量用student变量中的add方法赋值，add方法是在类中定义的x+y并返回x+y的结果，也就是定义了num变量的值为用Student类中add方法得到的1+2的值
1. 在提供的代码中，定义了一个类 `Student`，其中包含一个名为 `add` 的方法。这个方法接受两个参数 `x` 和 `y`，并返回它们的和。这是一个简单的类和方法示例。
2. 正确地创建了一个 `Student` 类的实例 `student`，然后调用了该实例的 `add` 方法，并将结果赋给变量 `num`。`add` 方法接收参数 1 和 2，并返回它们的和。

**类方法里面封装了一些函数就是本质，使用.调用方法**
1. **使用.index查询列表中的元素下标**
    对于列表型的数据,内部都分装了一些基本功能,比如index
```Python
    name_list = ["alpha","bravo","charile"]
    index = name_list.index("charile")
    print(index)
    # 结果为2，如果元素不存在就会报错
```
1. 使用重新赋值功能
   
    ```undefined
    name_list = ["alpha","bravo","charile"]
    name_list[2] = "delta"
    print(name_list[2])
    ```
3. 使用插入功能
   
    ```Python
    name_list = ["alpha","bravo","charile"]
    name_list.insert(1,"delta")
    print(name_list)
    ```
4. 使用追加功能
   
    ```Python
    name_list = ["alpha","bravo","charile"]
    name_list.append("delta")
    print(name_list)
    \#append加入一个元素
    name_list = ["alpha","bravo","charile"]
    name_list.extend(["delta","echo","foxtrot"])
    print(name_list)
    # extend加入一个新的数据容器,不要认为只要再extend后写上要加入的
    # 新的元素就可以了,extend加入的是新的数据容器
    ```
5. 使用删除功能
   
    ```Python
    name_list = ["alpha","bravo","charile"]
    del name_list[2]
    print(name_list)
    # 使用del仅仅能够把对应元素删除
    name_list = ["alpha","bravo","charile"]
    extract = name_list.pop(2)
    new_name_list = name_list
    print(f"new_name_list is {name_list},and the extract element is {extract}")
    ''' 
    pop可以将指定的元素取出,可以额外地将取出的元素赋值在
    一个新的变量中,这样原列表中就会少一个元素
    '''
    name_list = ["alpha","bravo","charile"]
    name_list.remove("charile")
    print(name_list)
    # 使用remove会从列表中从前到后检索元素
    # remove一次只能删除一个元素
    name_list = ["alpha","bravo","charile"]
    name_list.clear
    print(name_list)
    #输出空列表,clear一次性清除所有
    ```
6. 使用元素统计功能
   
    ```Python
    name_list = ["alpha","bravo","charile","charile"]
    num = name_list.count("charile")
    print(num)
    # 统计列表中有多少个charile
    ```
7. 使用列表长度统计功能
   
    ```Python
    name_list = ["alpha","bravo","charile","charile"]
    num = len(name_list)
    print(num)
    ```
![Untitled 38 12.png](../../../Files%20&%20LongText/Attachments/Untitled%2038%2012.png)
#### 列表案例
```Python
age_list = [21,25,21,23,22,20]
age_list.append(31)
print(age_list)
age_list.extend([29,33,30])
print(age_list)
first = age_list[0]
print(first)
last = age_list[8]
print(last)
index = age_list.index(31) 
# 注意查找的内容应该对应格式，不能查找“31”字符串31
print(index)
```
#### 遍历列表元素
![Untitled 39 11.png](../../../Files%20&%20LongText/Attachments/Untitled%2039%2011.png)
```Python
def list_while_func():
    name_list = ["alpha", "bravo", "charlie", "delta"]
    index = 0
    while index < len(name_list):
        element = name_list[index]
        print(f"now print index {index}, it is {element}")
        index += 1
list_while_func()
```
```Python
name_list = ["alpha","bravo","charile","delta"]
count = 0 
for i in name_list:
    print(f"now print {count} , it is {i}")
    count += 1
```
**while循环和for循环的不同点**
![Untitled 40 11.png](../../../Files%20&%20LongText/Attachments/Untitled%2040%2011.png)
#### 挑选出奇偶数放入不同的列表中
```Python
number_list = [1,2,3,4,5,6,7,8,9,10]
even_number_list = []
odd_number_list = []
order_number = 0
element = number_list[order_number]
while order_number < len(number_list):
    if element % 2 == 0:
        even_number_list.append(number_list[order_number])
    element += 1
    order_number += 1
print(f"even number list is {even_number_list}")
order_number = 0
for index in number_list:
    if index % 2 != 0 :
        odd_number_list.append(number_list[order_number])
    index +=1
    order_number +=1
print(f"odd number list is {odd_number_list}")
```
### tuple元组
- 元组一旦定义完成，不可以被篡改的
- 元组同样可以将不同类型的值组合在一起，可以被赋值给变量
- 元组是一种数据类型，使用type返回值为 tuple
- 若定义只含有一个元素的tuple，在元素后写上, 表示是一个元组而不是字符串

![Untitled 41 11.png](../../../Files%20&%20LongText/Attachments/Untitled%2041%2011.png)
```Python
t4 = ("hello")  # python认为字符串‘hello’是一个表达式，所以用（）也可以
print(f"the type of t4 {type(t4)}")
print(t4)
```
元组嵌套使用，嵌套取出，遍历，相关操作与列表相似，但由于其不可修改的特性，操作会少很多
![Untitled 42 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2042%2010.png)
- 特例：元组本身不可修改，但是如果tuple内有列表，可以对列表进行修改

```Python
t1 = (1,2,3,[4,5,6])
print(f"before modification : {t1}")
t1[3][0] = 6
t1[3][1] = 5
t1[3][2] = 4
print(f"after modification : {t1}")
# 不能改变list的位置（任意元素都不行），但是可以修改list的内部
```
### 字符串定义和操作
每一个字符串都是字符的容器，也是数据结构，字符串中每一个字符都是一个元素，同样具有正向和逆向索引
```Python
name_str = "sickwag"
print(name_str[0])
print(name_str[-7])
```
- 字符串是一个无法修改的数据容器，强行修改会报错
- 对于index查找字符串相应元素的下标，只会查找到首字母所在的位置的下标，但不意味着只按照首字母作为查找标准

```Python
name_str = "sickwag"
print(name_str.index("wag"))
name_str = "sickwag"
print(name_str.index("wat"))
# 上面wag可以查找到，下面的wat无法查找
```
1. 字符串的替换  
    本质上不是将旧的字符串替换为新的，而是replace会得到一个返回值，返回值是新的字符串，旧字符串仍旧只读  
    
    ![Untitled 43 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2043%2010.png)
    
    ```Python
    name_str = "sickwag"
    print(name_str.replace("wag","wat"))
    print(name_str)
    ```
2. 字符串的分割
   
    ```Python
    name_str = "s i c k w a g"
    print(name_str.split(" "))
    print(name_str)
    print(type(name_str))
    ```
    经过分割之后的字符串将每个分割部分变为列表中的元素，原来的str类型的字符串也变为了列表类型
    
3. 字符串的规整操作
   
    ![Untitled 44 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2044%2010.png)
    
    注意规整操作去除字符的操作也把字符串当做数据类型，把元素一个个拿出来执行去除指令
    
    ```Python
    
    name_str = "-------======there is a apple in the table-=-=-=-=-="
    print(f"finnal result is {name_str.strip("-=")}")
    ```
4. 统计字符串中特定字符串的数量  
    此时.count(”12”)的意思是数出12整个小段出现的次数而不是1和2出现总次数  
    
    ![Untitled 45 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2045%2010.png)
    
5. 综合案例
   
    ```Python
    name_str = "itheima itcast boxuegu"
    print(name_str.count("it"))
    name_str_replace = name_str.replace(" ","|")
    print(name_str_replace)
    print(name_str_replace.split("|"))
    ```
### 数据容器的切片操作
- 什么是序列  
    连续有序可以使用下标的数据容器,支持下表索引操作的数据容器  
    列表,元组,字符串都可以是序列  
    
- 序列语法
  
    ![Untitled 46 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2046%2010.png)
    
    步长可以留空,表示1
    
- 同样,序列不支持修改,对他进行操作之后得到的是一个新的序列
- 序列切片就是从序列中取出一个子序列
- 步长如果是负数那么取元素的顺序反向
- 起始和结束下标必须有但可以留空，所以序列语法中[]最少要有一个:
  
    ```Python
    # 获取 jklmno
    my_str = "abcdefghionmlkjpqrstuvwxyz"
    result1 = my_str[::-1][11:17]
    print(f"result1 is {result1}")
    my_str = "abcdefghionmlkjpqrstuvwxyz"
    result2 = my_str[9:15][::-1]
    print(f"result2 is {result2}")
    ```
### set数据集合
![Untitled 47 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2047%2010.png)
![Untitled 48 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2048%2010.png)
**集合使用{}**
```Python
my_set = {"alpha","beta","charlie","alpha","beta"}
print(f"the content of my_set is {my_set},\nthe type is {type(my_set)}")
```
集合是无序的，所以不支持使用下表索引，但是支持修改
**定义空集合的方式**
使用set函数把一个空列表赋值给变量，不能直接写
```Python
empty_set = {} # 这是一种字典的定义方法
```
**集合的添加删除去除随机元素**
```Python
my_set = {"alpha","beta","charlie","alpha","beta"}
my_set.add("delta")
my_set.add("alpha")
print(my_set)
my_set.remove("delta")
print(my_set)
element = my_set.pop()
print(f"the selected number is {element},after extract the set is {my_set}")
my_set.clear()
print(f"after clear the set is {my_set}")
```
集合不支持重复元素，且内部无序
**取出两个集合的差集**
![Untitled 49 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2049%2010.png)
**删除两个集合之间的差集**
![Untitled 50 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2050%2010.png)
注意：**difference方法是有返回值的，但是difference_updata是没有返回值的**
```Python
my_set1 = {"alpha","beta","charlie"}
my_set2 = {"alpha","delta","echo"}
my_set3 = my_set1.difference(my_set2)
print(f"the set 1 is {my_set1},and set2 is {my_set2},and set3 is {my_set3}")
my_set1 = {"alpha","beta","charlie"}
my_set2 = {"alpha","delta","echo"}
my_set4 = my_set1.difference_update(my_set2)
print(f"my set4 is {my_set4}")
# 如果第二段代码中第二个myset_1改为新的my_set4，那么将不会有新的
# 集合值赋值给set4，只会得到none的set4值，因为没有提前被赋值
```
**两个集合的合并功能**
![Untitled 51 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2051%2010.png)
```Python
my_set1 = {"alpha","beta","charlie"}
my_set2 = {"alpha","delta","echo"}
my_set3 = my_set1.union(my_set2)
print(f"my set3 is {my_set3}")
```
**集合的长度测量**
使用len函数，但是只会统计其中不重复的所有元素的个数
**集合的遍历**
注意集合没有下标定位，所以不能使用while循环遍历，只能通过for。
```Python
my_set1 = {"alpha","beta","charlie","alpha"}
for tempoary in my_set1:
    print(tempoary)
```
![Untitled 52 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2052%2010.png)
**集合练习案例**
```Python
my_list=['黑马程序员','传智播客','黑马程序员','传智播客','theima','itcast','itheima','itcast','best']
my_set = set()
for index in my_list:
    my_set.add(index)
print(f"set is {my_set}")
```
### 字典
- 通过字查找含义，python中的字典通过key找到value
- 一个key和一个value称之为一个键值对
- 定义空字典的方法, 有直接使用{}, 也可以使用dict关键字 my_dic = dict()
- 字典得类型是dict, 字典中不允许有重复的元素, 放在字典后部分的新元素会将旧元素覆盖掉
- 字典不能使用下表索引，只能通过key找到到对应的键值
- 字典value是可以嵌套的, key不可以嵌套字典, 对于Excel类型的表格数据可设多个键值来进行查找

- **字典中的key和value都可以是变量**
  
    是的，在Python中，字典的键可以是变量。实际上，字典的键可以是任何不可变的数据类型，包括字符串、数字、元组（只要元组中包含的元素也都是不可变的），以及布尔值等。变量可以存储这些类型的值，因此可以作为字典的键。
    
    下面是一个使用变量作为字典键的示例：
    
    ```Python
    # 定义变量
    key1 = "name"
    key2 = 123
    key3 = (456, "tuple")
    # 创建字典，使用变量作为键
    my_dict = {
        key1: "Alice",
        key2: "Bob",
        key3: "Charlie"
    }
    # 打印字典
    print(my_dict)
    ```
- 字典使用场景
  
    ![Untitled 53 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2053%2010.png)
    
    ```Python
    student_score_dict = {
        "Alpha":{
            "Chinese": 90,
            "math": 80,
            "English": 70},
        "Beta":{"Chinese": 78,
            "math":65,
            "English":56},
        "Charlie":{"Chinese": 67,
            "math":99,
            "English":89}}
    print(student_score_dict["Beta"]["English"])
    ```
- 字典中添加和更新元素
    ![Untitled 54 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2054%2010.png)
    ```Python
    student_score_dict = {
        "Alpha":{
            "Chinese": 90,
            "math": 80,
            "English": 70},
        "Beta":{"Chinese": 78,
            "math":65,
            "English":56},
        "Charlie":{"Chinese": 67,
            "math":99,
            "English":89}}
    student_score_dict["Beta"]["English"] = 50
    print(student_score_dict["Beta"]["English"])
    ```
- 字典中取出 key 和 value
    使用 pop 方法取出元素**使用的是 (),**一次只能得到字典中所有的一个 key, 不能直接得到嵌套字典中的内层 key
    使用.key () \ .value () 可以直接得到所有的 key 和 value 值
    ```Python
    # 字典元素的取用和清空
    student_score_dict = {
        "Alpha":{
            "Chinese": 90,
            "math": 80,
            "English": 70},
        "Beta":{"Chinese": 78,
            "math":65,
            "English":56},
        "Charlie":{"Chinese": 67,
            "math":99,
            "English":89}}
    personal = student_score_dict.pop("Beta",None)
    print(personal)
    # 获取字典中全部的key
    student_score_dict = {
        "Alpha":{
            "Chinese": 90,
            "math": 80,
            "English": 70},
        "Beta":{"Chinese": 78,
            "math":65,
            "English":56},
        "Charlie":{"Chinese": 67,
            "math":99,
            "English":89}}
    print(student_score_dict.keys())
    ```
    使用clear可以清除所有的内容
    
- 使用for循环遍历所有人的成绩详细信息
  
    ```Python
    student_score_dict = {
        "Alpha":{
            "Chinese": 90,
            "math": 80,
            "English": 70},
        "Beta":{"Chinese": 78,
            "math":65,
            "English":56},
        "Charlie":{"Chinese": 67,
            "math":99,
            "English":89}}
    # 外层循环遍历学生的名字
    for student, scores in student_score_dict.items():
        # 内层循环遍历每个学生对应的成绩字典
        for subject, score in scores.items():
            # 打印每个学生对应科目的成绩
            print(f"{student}\t{subject}\t成绩是\t{score}")
    ```
- 取出字典中所有的键值对
  
    ```Python
    my_dict = {'a': 1, 'b': 2, 'c': 3}
    # 使用 .items() 方法获取所有键值对
    items = my_dict.items()
    # 打印结果
    print(f"the result is {items}, and the type is {type(items)}")
    ```
    在返回结果中会返回
    
    ```Python
    the result is dict_items([('a', 1), ('b', 2), ('c', 3)]), and the type is <class 'dict_items'>
    # 首先提示符dict_items告诉使用者后面是键值对,用括号括起
    # 键值对的type类型需要用[] 括起,键值对中有两个元素表示一个键值对
    # 使用()括起表示
    ```
- 使用字典打印字幕对应的无线电呼号
  
    ```Python
    def uppercase():
        import string
        letters = list(string.ascii_uppercase)  # 生成 A 到 Z 的字母列表
        reverse_letters = list(reversed(letters))  # 反转字母列表
        for i in range(len(reverse_letters)):
            print(f"{reverse_letters[i]} = {radiowords(reverse_letters[i])}")
    def radiowords(letter):
        words = {"A": "Alpha", "B": "Bravo", "C": "Charlie", "D": "Delta", "E": "Echo", "F": "Foxtrot", "G": "Golf",
                 "H": "Hotel", "I": "India", "J": "Juliett", "K": "Kilo", "L": "Lima", "M": "Mike", "N": "November",
                 "O": "Oscar", "P": "Papa", "Q": "Quebec", "R": "Romeo", "S": "Sierra", "T": "Tango", "U": "Uniform",
                 "V": "Victor", "W": "Whiskey", "X": "X-ray", "Y": "Yankee", "Z": "Zulu"}
        return words.get(letter, "Not Found")
    uppercase()
    ```
- 练习案例
  
    ![Untitled 55 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2055%2010.png)
    
    ```Python
    apartment = "apartment"
    salary = "salary"
    level = "level"
    techology = "techology"
    market = "market"
    # 定义变量的目的是为了下面写信息的时候编译器自动填充
    information = {
        "alpha":{
            apartment : techology,
            salary : 3000,
            level : 1
        },"beta":{
            apartment : techology,
            salary : 5000,
            level : 2
        },"charle":{
            apartment : market,
            salary : 5000 ,
            level : 3
        },"echo":{
            apartment : techology,
            salary : 4000,
            level : 1
        },"foxtrix":{
            apartment :market,
            salary : 6000,
            level : 2
        }
    }
    for name in information :
        if information[name][level] == 1:
            information[name][level] += 1
            information[name][salary] += 1000
    print(information)
    ```
### 数据容器总结
- 分类
  
    ![Untitled 56 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2056%2010.png)
    
- 对比
  
    ![Untitled 57 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2057%2010.png)
    
### 数据容器通用操作
对数据容器的所有方法操作调用的方式都是**. 方法()**_==是圆括号==_
数据容器都支持遍历操作,但是能进行下表索引的可以使用for和while循环, 反之不能只能用for
通用的操作有len,max和min
![Untitled 58 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2058%2010.png)
- 字符串和字典key如何比较大小
    - 对字典和strmax和min比较是通过挨个比较字符串的的大小
      
        一个字符串中从左到右比较, 一旦有一个字符ascii值比另一个字符串相同位置字符大, 结束比较, 使用大的
        
        在数据长度不等的情况下,同样从左到右依次比较
        
    - 字符串单个字符的大小比较涉及到ascii码值
    - 对于ascii中没有的字符(如汉字),使用Unicode编码表对比序号大小
- 各种数据容器间可以相互转换
  
    ![Untitled 59 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2059%2010.png)
    
    - 元组\列表相互转换在编程中小括号(元组)变为中括号(列表)
    - 集合\列表相互转换将编程中大括号(集合)转为中括号(列表)
    - 字符串\列表相互转换将所有的字母单独转换成一个元素
    - 将字典转为列表将列表中所有的key转换成列表中的元素
    - 将字典转换为集合\列表会保留所有**唯一的**key(去重操作)
    - 字典转换为字符串所有的value会保存,并且不会打乱顺序和key和value的对应关系
      
        ```Python
        apartment = "apartment"
        salary = "salary"
        level = "level"
        techology = "techology"
        market = "market"
        information = {
            "alpha":{
                apartment : techology,
                salary : 3000,
                level : 1
            },"beta":{
                apartment : techology,
                salary : 5000,
                level : 2
            },"charle":{
                apartment : market,
                salary : 5000 ,
                level : 3
            },"echo":{
                apartment : techology,
                salary : 4000,
                level : 1
            },"foxtrix":{
                apartment :market,
                salary : 6000,
                level : 2
            }
        }
        print(str(information))
        #返回值
        {'alpha': {'apartment': 'techology', 'salary': 3000, 'level': 1}, 'beta': {'apartment': 'techology', 'salary': 5000, 'level': 2}, 'charle': {'apartment': 'market', 'salary': 5000, 'level': 3}, 'echo': {'apartment': 'techology', 'salary': 4000, 'level': 1}, 'foxtrix': {'apartment': 'market', 'salary': 6000, 'level': 2}}
        ```
    - 实际上有dict函数()可以将数据容器转换为字典,但是函数的参数是键值对,以上所有除字典item以外的数据都不是键值对
- 对容器进行排序
  
    sorted函数
    
    语法: sorted(序列),[reverse=True/False]
    
    排序会将所有的数据容器内容排序后放入新的**列表**容器中,原数据容器类型不变,字典类型会有相应的**数据丢失**

## 函数再认识
### 多返回值
一个函数中有两个return语句,那么**第二个return将不会执行,**
正确的写法是return 变量1, 变量2
变量可以有多种数据类型
![Untitled 60 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2060%2010.png)
```Python
def Sickwag():
    return 1,"hello",True
x,y,z = Sickwag()
print(f"result is {x},type is {type(x)}")
print(f"result is {y},type is {type(y)}")
print(f"result is {z},type is {type(z)}")
```
### 函数参使用方式
**四种方式**
1. 位置参数
    ![Untitled 61 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2061%2010.png)
    根据定义参数的位置匹配传入参数时相应位置的参数
2. 关键字参数
   ![Untitled 62 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2062%2010.png)
    在传入参数时, 根据定义函数中定义参数的名称作为 key, 之后手动输入 key 对应的 value
    这种形式不受顺序显示, 阅读代码更简单, 关键字参数和位置参数可以混合使用, **但是混用时需要将位置参数放在最前面, 不然 syntax invalid**
    
    ```Python
    def user_info(name, age ,gender):
        print(f"the name of client is {name},{age}years old ,and a {gender} ")
    user_info("Sickwag",gender="male",age=21)
    ```
3. 缺省参数(默认参数)
    在定义函数时直接定义变量的默认值,如果调用参数时没有定义,那么直接使用默认值    ![Untitled 63 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2063%2010.png)
    
    ```Python
    def user_info(name, age ,gender="male"):
        print(f"the name of client is {name},{age}years old ,and a {gender} ")
    user_info("Sickwag",age=21)
    ```
    **默认参数必须要放最后(即使所有参数完成), 位置参数必须要放最前**
    ```Python
    def user_info(name="Sickwag", age ,gender):
        print(f"the name of client is {name},{age}years old ,and a {gender} ")
    user_info(name = "Sickwag",age=21, gender="male")# 这一行会报错
    ```
4. 位置\关键字传递不定长参数
    - 使用*args表示不限量的变量存入一个元组中
    - 使用**kwargs表示将不限量的元素存入一个字典中(规定传入的数据值是KV形式**(不是键值对形式)**
    - args,kwargs是规范写法, 并不强制要求这样命名
    
    ```Python
    # 位置不定长
    def user_info (*args):
        print(f"the content is {args},and the type is {type(args)}")
    user_info(1,2,"Sickwag",True)
    # 关键字不定长
    def user_info (**kwargs):
        print(f"the content is {kwargs},and the type is {type(kwargs)}")
    user_info(1,2,"Sickwag",True)# 这一行会报错,不符合字典数据格式
    user_info(name = "Sickwag",gender = "male",age = 20)
    ```
- 函数作为参数传递
  
    本质上使用的是函数的嵌套调用
    
    ![Untitled 64 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2064%2010.png)
    
    外层函数提供给数据,内层函数提供对数据的处理方式
    
    ```Python
    def test_func(compute):
        result = compute(1,2) # 这里不能写return = compute(1,2)
        # 因为return只是返回一个表示函数执行情况的信息
        # 并没有打印出结果,要想得到反馈还是要print
        print(f"type of compute is {type(compute)} \n result is {result}")
    def compute(x,y):
        return x+y
    test_func(compute)
    ```
### lambda定义关键字定义函数
**定义匿名函数,只能使用一次**
![Untitled 65 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2065%2010.png)
![Untitled 66 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2066%2010.png)
```Python
def test_func(compute):
    result = compute(1,2)
    print(f"the result is {result}")
test_func(lambda x,y : x+y)
test_func(lambda x,y : x+y)# 只能使用一次,在需要使用相加逻辑需要再写一次
```
这里的compute只是函数的名称, 因为lambda是匿名函数, 所以调用test_func时参数没有名字, 但是又是一个合法的参数, compute只是替身,叫什么名字无所谓,最后都是一个匿名的lambda替换
**lambda不能换行书写**
## 文件操作
^9ccf2a

### 文件编码概念
现在默认使用UTF-8编码
### 文件的读取
操作系统以文件为单位管理各种文件
打开或者创建文件的函数
![Untitled 67 10.png](../../../Files%20&%20LongText/Attachments/Untitled%2067%2010.png)
f 不是变量,而是一种文件对象数据类型,具有属性和方法, 对文件的操作要对文件对象进行操作而不是通过open就行
![Untitled 68 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2068%209.png)
- 注意w是覆盖写入, 文件不存在会创建新文件
- a方法是append方式,写入内容当文件后, 没有文件也会创建新的

如果需要指定encoding方式, 一定要使用关键字传参, 不然encoding写在第三位会占用**buffering参数**的位置, 传错参数会报错
### 文件的各种操作方法
open 函数 mode 参数列表

| 模式  | 描述                                                                                |
| --- | --------------------------------------------------------------------------------- |
| t   | 文本模式 (默认)。                                                                        |
| x   | 写模式，新建一个文件，如果该文件已存在则会报错。                                                          |
| b   | 二进制模式。                                                                            |
| +   | 打开一个文件进行更新(可读可写)。                                                                 |
| U   | 通用换行模式（**Python 3 不支持**）。                                                         |
| r   | 以只读方式打开文件。文件的指针将会放在文件的开头。这是默认模式。                                                  |
| rb  | 以二进制格式打开一个文件用于只读。文件指针将会放在文件的开头。这是默认模式。一般用于非文本文件如图片等。                              |
| r+  | 打开一个文件用于读写。文件指针将会放在文件的开头。                                                         |
| rb+ | 以二进制格式打开一个文件用于读写。文件指针将会放在文件的开头。一般用于非文本文件如图片等。                                     |
| w   | 打开一个文件只用于写入。如果该文件已存在则打开文件，并从开头开始编辑，即原有内容会被删除。如果该文件不存在，创建新文件。                      |
| wb  | 以二进制格式打开一个文件只用于写入。如果该文件已存在则打开文件，并从开头开始编辑，即原有内容会被删除。如果该文件不存在，创建新文件。一般用于非文本文件如图片等。  |
| w+  | 打开一个文件用于读写。如果该文件已存在则打开文件，并从开头开始编辑，即原有内容会被删除。如果该文件不存在，创建新文件。                       |
| wb+ | 以二进制格式打开一个文件用于读写。如果该文件已存在则打开文件，并从开头开始编辑，即原有内容会被删除。如果该文件不存在，创建新文件。一般用于非文本文件如图片等。   |
| a   | 打开一个文件用于追加。如果该文件已存在，文件指针将会放在文件的结尾。也就是说，新的内容将会被写入到已有内容之后。如果该文件不存在，创建新文件进行写入。       |
| ab  | 以二进制格式打开一个文件用于追加。如果该文件已存在，文件指针将会放在文件的结尾。也就是说，新的内容将会被写入到已有内容之后。如果该文件不存在，创建新文件进行写入。 |
| a+  | 打开一个文件用于读写。如果该文件已存在，文件指针将会放在文件的结尾。文件打开时会是追加模式。如果该文件不存在，创建新文件用于读写。                 |
| ab+ | 以二进制格式打开一个文件用于追加。如果该文件已存在，文件指针将会放在文件的结尾。如果该文件不存在，创建新文件用于读写。                       |
- 读取操作
  
    ![Untitled 69 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2069%209.png)
    readlines方法会将读取到的所有内容封装到一个列表中, 所以需要一个变量接受才能print,不能直接作为变量

    因为get的是lines , 所以得到的内容以行位单位分割, 每行之间的\n会被打印出来(\n 也在ascii码中)

    ```Python
    f = open("D:/test.txt","r",encoding="UTF-8")
    print(f"the type is {type(f)}")
    print(f"\nget 20 string in the file :{f.read(20)}")
    all_string = f.readlines()
    print(f"get all string in the file :{all_string}")
    ```
    使用read操作读取到文件内容之后, 指针会指在最后读取位置, 之后的读取read/readlines操作(**虽然操作方式不同,但是操作的是同一个对象)**会在指针出开始向后读取,而不是从头开始
    ```Python
    f = open("D:/test.txt","r",encoding="UTF-8")
    print(f"the type is {type(f)}")
    print(f"\nget 20 string in the file :{f.read(20)}")
    print(f"\nget the next 10 string in the file :{f.read(20)}")
    ```
    在文件中追加字符方法:使用seek.方法和with函数,并将需要写入的数据用二进制表示
    
    使用list将文件对象内容转化为列表会将每一行都转化为列表中的一个元素,并且**包含列表中每一行结尾的换行符\n**
    
    **readline方法,每次只读取一行的内容**
    
    ```Python
    i = 1
    for line in open("D:/test.txt","r",encoding="UTF-8"):
        print(f"the {i} line contend is {line}")
        i += 1
    ```
    ```Python
    # 打开文件
    with open('example.txt', 'r') as file:
        # 读取第一行
        first_line = file.readline()
        print(first_line)
        # 读取第二行
        second_line = file.readline()
        print(second_line)
        # 读取第三行
        third_line = file.readline()
        print(third_line)
        # 继续读取，直到文件末尾
        while True:
            line = file.readline()
            if not line:
                break
            print(line)
    ```
    f文件对象的type类型是io.TextIOWrapper, 文本输入输出类型, 不能使用len统计长度, 他是对象, 内部没有统计长度
    
    ```Python
    print(len(open("D:/test.txt","r",encoding="UTF-8")))
    # 运行报错
    ```
- 关闭操作
  
    使用.close方法
    
    文件没有被关闭就会一直在内存中加载,占用资源同时无法对文件进行任何操作
    
- with函数操作文件
  
    语法:
    
    ```Python
    with open("D:/test.txt","r",encoding="UTF-8") as file :
    # file 是一个文件对象,名字可以随便取
    ```
    ```Python
    i = 1
    with open("D:/test.txt","r",encoding="UTF-8") as file :
        for line in file:
            print(f"the {i} line contend is {line}")
            i += 1
    ```
    [Python Basics](Python%20Basics.md)
    
- 单词计数案例
  
    方法2 需要使用到[Python Basics](Python%20Basics.md)
    
    ![Untitled 70 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2070%209.png)
    
    ![test 5.txt](../../../Files%20&%20LongText/Attachments/test%205.txt)
    
    ```Python
    # method 1 通过遍历拆分后的字段找
    count = 0
    word_to_count = "itheima"
    with open("D:/test.txt","r",encoding="UTF-8") as file :
        lined_file = list(file)
        for line in lined_file:
            words = line.split() # 这里将换行符去掉
            count += words.count(word_to_count)
    print(f"the string itheima has shown {count} times")
    # method2 
    with open("D:/test.txt","r",encoding="UTF-8") as file :
        lined_file = list(file)
        for line in lined_file:
            words = line.split() # 这里将换行符去掉
            indice = [index for index, value in enumerate(words) if value == "itheima"]
            num += len(indice)
    print(f"the string itheima has shown {num} times")
    # method 3 
    with open("D:/test.txt","r",encoding="UTF-8") as file :
        contend = file.read()
        count = contend.count("itheima")
    print(f"the string itheima has shown {count} times")
    ```
#### 文件写入操作
![Untitled 71 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2071%209.png)
将文件放入缓冲区的操作可以类比git中代码放入repository
.close关闭文件的同时会.flush刷新一次
```Python
f = file = open("D:/test2.txt","w") # 一般不写encoding默认为UTF-8
f.write("Hello world !!!")
f.close()
```
#### 文件追加操作
![Untitled 72 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2072%209.png)
```Python
f = file = open("D:/test2.txt","w") 
f.write("Hello world !!!")
f.close()
f = file = open("D:/test2.txt","a") 
f.write("Hello world !!!")
f.close()
```
![test2 5.txt](../../../Files%20&%20LongText/Attachments/test2%205.txt)
写入一个Helloworld,再追加一个Helloworld
- 注意区分方法中的.write和文件对象中的”w”  
    方法write表示对文件进行的操作是write,前提是文件时可写入的  
    文件对象定义中”w”表示文件对象的状态是可写入的,如果文件对象状态为”r”只读,那么不能.write(可以联想之前”r”时文件的方法是.read  
    
#### 文件备份操作案例
![Untitled 73 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2073%209.png)
![Untitled 74 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2074%209.png)
![test3 5.txt](../../../Files%20&%20LongText/Attachments/test3%205.txt)
![test3.txt 5.bak](../../../Files%20&%20LongText/Attachments/test3.txt%205.bak)
```Python
file = open("D:/test3.txt","r",encoding="UTF-8")
file_bak = open("D:/test3.txt.bak","a",encoding="UTF-8")
for line_list in file:
    elements = line_list.strip().split(",")
    if elements[4] == "正式":
        file_bak.write(line_list)
file.close()
file_bak.close()
```
需要注意的是: for循环写入操作时,因为line_list等于file中的每一行内容,并没有去掉\n,所以每一行写完自动换行, 在判断是否_**正式**时才要把读取到的内容去掉\n (属于是歪打正着)
```Python
with open("D:/test3.txt", "r", encoding="UTF-8") as file, open("D:/test3.txt.bak", "w", encoding="UTF-8") as file_back:
    for line_list in file:
        if line_list.strip().split(",")[4] == "正式":
            file_back.write(line_list)
```
### 异常模块和包操作
#### python异常
通俗理解就是报错
#### 异常捕获方法
在编写程序时对可能出现的异常进行提前处理就是异常捕获
基本语法:捕获所有类型的异常
![Untitled 75 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2075%209.png)
出现异常之后执行except下面的语句
```Python
try :
    file = open("D:/abc.txt","r",encoding="UTF-8") #单独写这一行代码会报错
except :
    print("the file doesn't exist, open with ""w"" module ")
    file = open("D:/abc.txt","w",encoding="UTF-8")
```
捕获特定类型的异常
![Untitled 76 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2076%209.png)
```Python
try :
    print(name)
except (NameError, ZeroDivisionError) as e: # 捕获多个异常
    print(e) # 变量e记录下出现错误的错误内容说明,并不是错误的名称
```
捕获所有的异常类型
```Python
try :
    print(name)
except Exception as e: # 表示捕获所有异常
    print(e) 
```
没有出现异常和必须要执行的返回
```Python
try :
    print("name")      # 可能会出现错误的语句放入try中
except Exception as e: # 表示捕获所有异常
    print(e)           # 出现错误需要执行的代码放入exception
else :
    print("no Error !")# 没有出错需要执行的代码放入else
finally : # 无论上面try是否出现异常都要执行的操作
    print("all done !")
```
^92bbce

try语句表示可能会出现异常的语句
try语句出现异常—>执行except语句捕获异常—>执行finally
try语句未出现异常—>执行else语句捕获异常—>执行finally
else和finally语句可以不写
#### 异常的传递性
![Untitled 77 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2077%209.png)
异常出现在最高层级中,在向下一级一级向低层级调用时,低层级没有异常,但是需要申请高层级的内容的同时也会把异常调用下来
```Python
def func1():
    print("func 1 start execute .")
    num = 1 / 0
    print("func 1 over execute .")
# func1出现异常,
def func2():
    print("func 2 start execute .")
    func1()
    print("func 2 over execute .")
# func2调用func1的时候出现异常
def func3():
    try :
        func2()
    except Exception as error :
        print(f"the error is {error}")
# func3调用func2出现异常
# 因为每一个异常出现之后会停止执行函数,所以每一个print over信息不出现
func3()# 调用func3函数返回错误信息
```
 ^0dab48
## python模块
在 Python 中，模块（module）、库（library）和包（package）是组织代码的方式，它们之间存在一定的层级关系。
### 模块（Module）
模块是包含 Python 定义和声明的文件。模块可以定义函数、类和变量，也可以包含可执行的代码。
**导入模块：**
```python
import module_name
```
### 库（Library）
库是一组模块的集合，通常用于提供特定的功能。在 Python 中，库可以是内置的（如 `sys`、`os` 等），也可以是第三方的（如 `numpy`、`pandas` 等）。
**导入库中的模块：**
```python
import library_name.module_name
```
### 包（Package）
包是包含多个模块和子包的容器，通常用于大型项目。包允许你将代码组织成层次结构。一个包是一个包含 `__init__.py` 文件的目录，这个文件可以为空，但它告诉 Python 解释器这个目录应该被视为一个包。
**导入包中的模块：**
```python
from package_name import module_name
```
### 层级关系和导入方式
1. **直接导入模块：**
   如果你只需要导入一个模块，可以直接使用 `import` 语句。
   ```python
   import math
   print(math.sqrt(16))  # 使用模块中的函数
   ```
2. **从模块中导入特定内容：**
   如果你只需要模块中的**特定函数或类**，可以使用 `from ... import ...` 语句。
   ```python
   from math import sqrt
   print(sqrt(16))  # 直接使用函数，不需要模块名前缀
   ```
3. **导入整个包：**
   如果你需要导入一个包中的所有模块，可以使用 `import *` 语句，但这种做法不推荐，因为它会污染命名空间。
   ```python
   import package_name.*
   ```
4. **从包中导入模块：**
   如果你需要从包中导入特定的模块，可以使用 `from ... import ...` 语句。
   ```python
   from package_name import module_name
   ```
5. **从包中导入特定内容：**
   你也可以从包中的模块导入特定的类或函数。
   ```python
   from package_name.module_name import ClassName, function_name
   ```
6. **重命名导入：**
   如果你想要给导入的模块或对象一个别名，可以使用 `as` 关键字。
   ```python
   import math as m
   print(m.sqrt(16))
   ```
7. **导入模块中的所有内容：**
   使用星号 `*` 可以导入模块中的所有内容，但这种做法通常不推荐，因为它可能导致命名冲突。
   ```python
   from module_name import *
   ```
### 导入路径
Python 使用模块的全路径来解析导入的模块。这意味着，如果你有一个包 `package_name`，它包含模块 `module_name`，Python 会按照以下路径来查找这个模块：
- 内置模块
- 环境变量 `PYTHONPATH` 指定的目录
- 系统路径（由 `sys.path` 列表给出）

### 注意事项
- 尽量避免使用通配符 `*` 导入，因为它会导入所有名称，可能导致命名空间冲突。
- 使用 `from ... import ...` 可以提高代码的可读性，但要注意不要导入不必要的内容。
- 导入语句应该放在文件的顶部，按照惯例，首先是标准库模块，然后是第三方库模块，最后是应用程序自定义的模块。

通过这些导入方式，你可以灵活地组织和使用 Python 代码，使得代码更加模块化和可维护。
### python模块导入
^b82f9b
一个文件成为库,调用模块的层级是
> 库文件>>库文件中的类>>类中的方法\函数>>方法\函数中的内嵌成员
- 使用import导入模块![Untitled 78 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2078%209.png)
- Python 模块Module)，**是一个Python文件**，以py结尾.模块能定义函数，类和变量模块里也能包含可执行的代码
- 可以理解为内置模块是python**一类特定功能\函数**工具包,所有一切工具的意义,用法已经定义好了.
- 模块只提供文件中只会出现各种功能的基本信息\参数类型等, 外部导入这个模块时,使用 ==.功能名== 调用模组中的功能 ,.==函数名()== 调用函数 , 提供各种函数的接口规范,
- 使用import导入时,模块中**不是所有的代码**都会执行,只有被导入模块文件中使用模块中函数\定义\类时( **顶层代码** )才会执行相应代码,这与C++头文件导入模式一样. 在Python中，**顶层代码**通常是指那些在模块或程序中直接位于最外层的代码：
	- 变量定义
	- 函数定义
	- 类定义
	- 导入语句
	- 执行语句（如打印输出）
- 导入模块时，模块文件中的顶层代码会被执行，但**函数或类内部的代码（体）** 只有在它们被调用时才会执行。这与[C++ prime plus \> 2. 编译器预处理](../C%20C++/C++%20prime%20plus.md#2.%20编译器预处理)一致![Untitled 79 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2079%209.png)![Untitled 80 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2080%209.png)
其中sleep功能(不是函数)在文件中被定义好了是什么作用
sleep功能有一个浮点类型参数,有些编译器中会显示功能的说明,vscode暂时不会![Untitled 81 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2081%209.png)

函数的功能模块中也调用其他功能
. 符号是层级关系的意思,表示sleep隶属于time模块
```Python
import time 
print("Hello")
time.sleep(5)
print("World")
```
- **使用for导入模块\功能**
有时并不需要一个模块中的所有功能, 所以只用form导入模块的某一个特定功能.![Untitled 82 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2082%209.png)

使用form\import导入的功能,没有了隶属直接import到了[Python Basics](Python%20Basics.md)中,编译器调用time函数就会在[Python Basics](Python%20Basics.md)中查找函数定义然后使用
**可以类比C语言中的头文件,但是C中不导入任何头文件无法编译**
```Python
from time import sleep
import time 
print("Hello")
sleep(5)
print("World")
```
- 使用from *方式导入模块
    - 在功能上和使用import.导入模块名一致,但是在下面调用模块功能时可以直接写功能\函数名,**不用写隶属**
    - 使用form Module import * 方式导入模会将模块内定义的功能导入到当前命名空间(默认是创建一个新的全局命名空间)中
    - 而使用import Module会创建一个新的全局命名空间中.使用form Module import * 比使用import Module更能使代码简单易读,更容易维护,
    - 使用import Module会创建一个新的全局命名空间中.使用form Module import *代码表述比较清晰,可以避免命名冲突
    ```Python
    from time import *
    print("Hello")
    sleep(5)
    print("World")
    ```
    _==**import后面可以直接接上module文件中的功能名**==_
    ```Python
    from my_module1 import test_A
    test_A()
    # 模组文件内容
    def test_A():
        print('testA')
    def test_B():
        print('testB')
    ```
- 关于as参数
  
    通过as将导入的模块(import module as name)明明一个新的名字
    
    使用from功能导入功能同理命名功能名字
    
    ```Python
    import time as name
    print("Hello")
    name.sleep(5)
    print("World")
    ```
    - 使用as为功能\函数命名时,需要避免使用python中自带的关键字,强行命名会使自带关键字功能被覆盖,失去原有意义
    
    ```Python
    from time import sleep as print
    print(5)
    print("Hello World")
    # 函数会等待5秒,表明新的关键字print内涵已变成time模块中的sleep
    # 5秒过后print无法打印字符内容,说明print已经失去原有功能
    ```
_==**导入模块一般写在代码开头**==_
### 自定义模块
![Untitled 83 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2083%209.png)
因为模块的本质是文件,所以自己创建的文件也可以使用import 文件名来导入
```Python
import my_module1
my_module1.test(1,2)
# my_modue1文件内容
def test(a,b):
    print(f"x plus y equal to {a + b} ")
```
#### 模块功能重名问题
```Python
from my_module1 import test 
from my_module2 import test
test(1,2)
\#my_module2文件内容
def test(a,b):
    print(f"x minus y equal to {a - b} ")
```
后test调会覆盖前test的函数定义, 与[Python Basics](Python%20Basics.md)相同
#### 模块文件测试
自定义模块代码文件中有输出值, 在import时执行整个文件会将输出值也执行,影像输出结果,但是输出语句作为测试不能删除时
使用主程序检测语句判断当前模块是否作为主程序运行
```Python
def test(a, b):
	print(f"x plus y equal to {a + b}")
if __name__ == "__main__":
	test(1, 2)
```
当Python解释器执行一个模块时，它会将模块的名称赋值给内置变量`__name__`。如果模块是被直接运行的，`__name__`的值将是`"__main__"`；如果模块是被导入到其他模块中运行的，`__name__`的值将是模块的名字。
- 模块可以被赋值给变量(在这个方法中没有用到,只是说明可以)
- 变量__name __是内置变量,如同未import就能使用的内置函数
- ==执行(import)==模组文件时 import后面的==模组名字==被赋予变量__name__
- python中内置了一个__name__变量,它的值为__main__,在没有import函数进来时直接运行代码,使if name == "main":这个判断语句为True,所以执行test函数,打印出"x plus y equal to 3这个结果.
- 如果在其他文件中 import这段代码所对应的文件,那么编译器会它会将模块的名称赋值给内置变量__name__,从而使if name == "main"在其他文件中判断未False不执行.
- 我们一般认为需要使if name == "main"在其他文件中判断未False的代码文件为主程序,所以定义__name__变量的默认值为"**main**"
- _==**使用主程序检测语句可以将module文件当做库使用**==_

#### module文件中的__all__列表
```Python
__all__ = ['test_A']
def test_A():
    print('testA')
def test_B():
    print('testB')
```
- python中内置了一个__all__变量, 这个变量的类型是一个列表,列表中的元素为该代码文件中所有的公共名称
- 在module代码文件中规定了__all__变量的内容只能是test_A,所以在主程序中import module文件时,只会导入test_A的用法,
- 如果`__all__`列表没有在模块中定义，那么使用`from module import *`导入模块时，会导入模块中所有公共的名称（即那些没有以下划线开头的名称）。但是，如果定义了`__all__`列表，那么只有列表中明确指定的名称会被导入。
- 而在主程序中的*符号代表__all__变量, 是一个[Python Basics](Python%20Basics.md)

- 对于这个例子中的*[Python Basics](Python%20Basics.md)使用
  
    - __all__变量内容是一个列表,所有的公共名称都是它的元素(在执行这个变量定义时)
    - 在`from module import *`语句中，`*`并不是一个变量，也不是Python内置的模块名。它是一个特殊的语法元素，用于指示Python解释器从指定的模块中导入所有的公共名称（public names）。
    - 当使用`from module import *`时，Python解释器会执行以下操作：
      
        1.查找名为`module`的模块。
        
        2.读取该模块的`__all__`列表（如果定义了的话），这个列表包含了模块作者希望被导入的公共名称。
        
        3.如果没有定义`__all__`列表，Python解释器会导入模块中所有没有以下划线开头的公共名称。
        
        4.将这些名称导入到当前命名空间中。
        
    因此，`*`在这里是一个导入操作的语法糖，它告诉Python解释器导入模块中的所有公共名称，而不是导入一个名为`*`的变量或模块。
    
### python包
python包可以理解为收纳module文件的文件夹
![Untitled 84 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2084%209.png)
这样做的目的是为了管理各种module文件,不至于主程序开头写太多import函数, 使用import 包名.module文件名.函数\功能名 来按照隶属\层级导入功能
#### 自定义包
```Python
import my_package.my_module1
import my_package.my_module2
my_package.my_module1.info_print1()
my_package.my_module2.info_print2()
# my_module1中内容,module2同理
def info_print1() :
    print("output of info_input_print1 function")
```
![Untitled 85 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2085%209.png)
vscode中不用创建init文件,会自动识别出包,只需要在主程序文件中使用合法的调用语句即可.
而普通的文件夹test的图标不一样
- 导入包的方法

```Python
import my_package.my_module1
import my_package.my_module2
my_package.my_module1.info_print1()
my_package.my_module2.info_print2()
from my_package import my_module1
from my_package import my_module2
my_package.my_module1.info_print1()
my_package.my_module2.info_print2()
# 更简洁的写法直接导入具体的功能
from my_package.my_module1 import info_print1
from my_package.my_module2 import info_print2
info_print1()
info_print2()
# 任何文件中都包含__all__文件,所以可以使用*直接调用
```
#### 安装第三方包
![Untitled 86 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2086%209.png)
python内置pip功能可便捷地安装第三方功能包(在命令提示程序中)
语法为
> pip install 包名

![Untitled 87 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2087%209.png)
通过cmd安装
通过其他源安装包,语法为
> pip install -i 源网址 包名称

也可以通过pycharm配置解释器设置
![Untitled 88 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2088%209.png)
vscode没有这个设置,用命令行
#### Python异常和工具包案例
![Untitled 89 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2089%209.png)
```Python
def str_reverse(s):
    indice = [(index,value) for index,value in enumerate(s)]
    t = -1
    for i in s:
        print(indice[t][-1],end="")
        t -= 1
if __name__ == "__main__":
    str_reverse("Sickwag")
# 更简单的写法
def str_reverse(s):
    print(s[::-1])
if __name__ == "__main__" :
    s = "sickwag"
    str_reverse(s)
def substr(s,x,y):
    return s[x:y]
if __name__ == "__main__":
    substr("Sickwag",1,2)
```
```Python
def print_file_info(file_name):
    try :
        file = open(file_name,"r",encoding="UTF-8")# 如果输入的是文件路径可以不用""括起
        print(file.readlines())
    except Exception as e:
        print(f"the file doen't exist, and {e}")
    finally :
        if file == None :
            file.close()
if __name__ == "__main__" :
    print_file_info("D:/test.txt")
def append_to_file(file_name,data):
    file = open(file_name,"a",encoding="UTF-8")
    file.write(data) 
    ''' 
    注意不要写成file.append 对文件进行追加也是写入操作
    文件已经定义为a打开,所以写入操作是追加的写入操作
    '''
if __name__ == "__main__" :
	    append_to_file("D:/test.txt","sickwag"*10)
```
### python综合案例
#### 折线图可视图标
- json数据格式
  
    ![Untitled 90 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2090%209.png)![Untitled 91 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2091%209.png)
    
    可以理解为不同编程语言的数据传输中转站
    
    python中的列表和字典可以无缝切换
    
    json的格式可以认为是Python中的字典格式_**转换为字符串**_,或者是内部元素必须是字典的列表格式_**转换为字符串,**_ _==**json的本质是字符串**==_
    
    ![Untitled 92 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2092%209.png)
    
    ```Python
    #导入json模块
    import json
    #准备符合格式json格式要求的python数据
    data=[{“name":"老王"，"age”:16},{"name":"张三"，"age”:20}]
    #通过json.dumps（data）方法把python数据转化为了json数据
    data=json.dumps(data)
    #通过json.loads（data）方法把json数据转化为了python数据
    data =json.loads(data)
    ```
    ```Python
     将Python中的列表转换为json格式
    import json
    my_list = [{"name" : "Sickwag"},{"gender" : "male"},{"age" : 20}]
    data = json.dumps(my_list)
    print(f"the type of date is {type(data)}")
    print(f"and the contend is {data}")
    # 将python中字典转换为json格式
    import json
    my_dictionary = {"name" : "Sickwag","gender" : "male","age" : 20}
    data = json.dumps(my_dictionary)
    print(f"the type of date is {type(data)}")
    print(f"and the contend is {data}")
    # 将json转化为列表
    import json
    json_str = '[{"name" : "Sickwag"},{"gender" : "male"},{"age" : 20}]'# 对json字符串文本使用单引号
    data = json.loads(json_str)
    print(f"the type of date is {type(data)}")
    print(f"and the contend is {data}")
    # 将json转化为字典
    import json
    json_str = '{"name" : "Sickwag","gender" : "male","age" : 20}'# 对json字符串文本使用单引号
    data = json.loads(json_str)
    print(f"the type of date is {type(data)}")
    print(f"and the contend is {data}")
    ```
    JSON字符串中有中文在输出结构中可能会出现Unicode编码字符,如果要以中文显示输出,需要再json函数中输入参数
    
    > data = json.loads(json , ensure_ascii = False)
    
    ==**[Python Basics](Python%20Basics.md)**==
    
- pyecharts模块
  
    [官方说明文档](https://05x-docs.pyecharts.org/#/zh-cn/prepare)
    
    [官方展示画廊](https://gallery.pyecharts.org/#/)
     ^e09073
- 数据可视化
  
    使用pyecharts模块中的charts功能中的LIne功能(折线图功能)
    
    ```Python
    # 导入包
    from pyecharts.charts import Line  #注意功能名大写
    调用Line函数
    line = Line()
    # 设置x和y轴参数
    line.add_xaxis(["June","July","August","Septemper"])
    # 这里使用位置传参方法但是上面X轴的第一个参数不是X轴名称
    line.add_yaxis("score",[60,70,80,90])
    line.render()
    ```
render.html
生成网页文件
charts中的配置选项: 全局配置和系列配置
配置就是对函数生成网页文件样式,特点的调整方法,全局配置调整整个表格的显示样式,系列配置对一系列 ( 比如图表中的整个Y轴数据, 所有的数据标签样式 ) 进行配置
    
    ![[Untitled 93 9.png|Untitled 93 9.png]]
    
    图标基本部件参数
    
    ![[Untitled 94 9.png|Untitled 94 9.png]]
    
    各种部件可以通过鼠标悬停在函数上显示
    
    ![[Untitled 95 9.png|Untitled 95 9.png]]
    
    ![[Untitled 96 9.png|Untitled 96 9.png]]
    
    关于vscode自动填充
    
    ```Python
    from pyecharts.charts import Line
    from pyecharts.options import TitleOpts ,LegendOpts,ToolboxOpts,VisualMapOpts
    line = Line()
    line.add_xaxis(["June","July","August","Septemper"])
    line.add_yaxis("score",[60,70,80,90])
    line.set_global_opts(
        title_opts=TitleOpts(title="The score change in a period",pos_left="center", pos_bottom="0.01"),# 将标题居中放在底部并显示
        legend_opts=LegendOpts(is_show=True),
        toolbox_opts=ToolboxOpts(is_show=True),
        visualmap_opts=VisualMapOpts(is_show=True)
    )
    line.render() # 注意render的位置,提交了表格文件才会有变化
    ```
    render.html
    
    成果
    
    ![[Untitled 97 9.png|Untitled 97 9.png]]
    
- 数据准备
  
    使用[数据可视化工具](http://ab173.com)可视化json表格数据
    
    ( 需要将开头和结尾不符合要求的符号删除)
    
    ![Untitled 98 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2098%209.png)
    
    ![Untitled 99 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2099%209.png)
    
    按照json视图中的层级一级一级分别取出日期数据和确诊数据
    
    ![Untitled 100 9.png](../../../Files%20&%20LongText/Attachments/Untitled%20100%209.png)
    
    编写代码
    
    ![Untitled 101 9.png](../../../Files%20&%20LongText/Attachments/Untitled%20101%209.png)
    
- 创建图表
  
    同样对日本和印度json数据处理
    
    - 去掉不规范开头结尾
      
        ![Untitled 102 9.png](../../../Files%20&%20LongText/Attachments/Untitled%20102%209.png)
        
    - 获取相应的x y轴数据
      
        ![Untitled 103 9.png](../../../Files%20&%20LongText/Attachments/Untitled%20103%209.png)
        
    - 导入表格
      
        ![Untitled 104 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20104%208.png)
        
#### 构建全国地图图表
![Untitled 105 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20105%208.png)
这里没有json文件,所以数据通过手动输入,列表中的元素是元组
```Python
from pyecharts.charts import Map
from pyecharts.options import VisualMapOpts
# 创建地图对象
map = Map()
# 准备数据，每个元素是一个包含省份名称和数据值的字典
data = [
    {"name": "北京", "value": 99},
    {"name": "江西", "value": 199},
    {"name": "广东", "value": 299},
    {"name": "湖南", "value": 399},
    {"name": "河北", "value": 499}
]
# 添加数据到地图
map.add("test_map", data, "china")
# 设置全局配置项，包括视觉映射组件
map.set_global_opts(
    visualmap_opts=VisualMapOpts(
        is_show=True,
        is_piecewise=True,  # 允许手动校准范围
        pieces=[
            {"min": 1, "max": 9, "label": "1-9", "color": "\#CCFFFF"},
            {"min": 10, "max": 99, "label": "10-99", "color": "\#FF6666"},
            {"min": 100, "max": 999, "label": "100-999", "color": "\#CCFFFF"}
            # 手动划分不同数据区域的颜色
        ]
    )
)
# 渲染地图
map.render()
```
#### 构建全国疫情情况地图
![Untitled 106 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20106%208.png)
```Python
import json
from pyecharts.charts import Map
from pyecharts.options import *
# 读取数据文件
f = open("D:/疫情.txt", "r", encoding="UTF-8")
data = f.read()     # 全部数据
# 关闭文件
f.close()
# 取到各省数据
# 将字符串json转换为python的字典
data_dict = json.loads(data)        # 基础数据字典
# 从字典中取出省份的数据
province_data_list = data_dict["areaTree"][0]["children"]
# 组装每个省份和确诊人数为元组，并各个省的数据都封装入列表内
data_list = []      # 绘图需要用的数据列表
for province_data in province_data_list:
    province_name = province_data["name"]                   # 省份名称
    province_confirm = province_data["total"]["confirm"]    # 确诊人数
    data_list.append((province_name, province_confirm))
# 因为pyecharts需要的坐标收数据是包含元组的列表数据,所以需要事先转换
# 创建地图对象
map = Map()
# 添加数据
map.add("各省份确诊人数", data_list, "china")
# 设置全局配置，定制分段的视觉映射
map.set_global_opts(
    title_opts=TitleOpts(title="全国疫情地图"),
    visualmap_opts=VisualMapOpts(
        is_show=True,           # 是否显示
        is_piecewise=True,      # 是否分段
        pieces=[
            {"min": 1, "max": 99, "lable": "1~99人", "color": "\#CCFFFF"},
            {"min": 100, "max": 999, "lable": "100~9999人", "color": "\#FFFF99"},
            {"min": 1000, "max": 4999, "lable": "1000~4999人", "color": "\#FF9966"},
            {"min": 5000, "max": 9999, "lable": "5000~99999人", "color": "\#FF6666"},
            {"min": 10000, "max": 99999, "lable": "10000~99999人", "color": "\#CC3333"},
            {"min": 100000, "lable": "100000+", "color": "\#990033"},
        ]
    )
)
# 绘图
map.render("全国疫情地图.html")
# render中的参数是生成文件的名字
```
#### 构建省级疫情情况地图
同上,先去数据( 按照json文件的层级
```Python
for city_data in cities_data:
    city_name = city_data["name"] + "市"
    json文件中只有市的名称,但是pyecharts中使用全名匹配
    所以使用字符串相加运算补充全名                                                                                             
```
```Python
import json
from pyecharts.charts import Map
from pyecharts.options import *
# 读取文件
f = open("D:/疫情.txt", "r", encoding="UTF-8")
data = f.read()
# 关闭文件
f.close()
# 获取河南省数据
# json数据转换为python字典
data_dict = json.loads(data)
# 取到河南省数据
cities_data = data_dict["areaTree"][0]["children"][3]["children"]
# 准备数据为元组并放入list
data_list = []
for city_data in cities_data:
    city_name = city_data["name"] + "市"
    city_confirm = city_data["total"]["confirm"]
    data_list.append((city_name, city_confirm))
# 手动添加济源市的数据
data_list.append(("济源市", 5))
# 构建地图
map = Map()
map.add("河南省疫情分布", data_list, "河南")
# 设置全局选项
map.set_global_opts(
    title_opts=TitleOpts(title="河南省疫情地图"),
    visualmap_opts=VisualMapOpts(
        is_show=True,           # 是否显示
        is_piecewise=True,      # 是否分段
        pieces=[
            {"min": 1, "max": 99, "lable": "1~99人", "color": "\#CCFFFF"},
            {"min": 100, "max": 999, "lable": "100~9999人", "color": "\#FFFF99"},
            {"min": 1000, "max": 4999, "lable": "1000~4999人", "color": "\#FF9966"},
            {"min": 5000, "max": 9999, "lable": "5000~99999人", "color": "\#FF6666"},
            {"min": 10000, "max": 99999, "lable": "10000~99999人", "color": "\#CC3333"},
            {"min": 100000, "lable": "100000+", "color": "\#990033"},
        ]
    )
)
# 绘图
map.render("河南省疫情地图.html")
```
#### 基础动态柱状图
```Python
from pyecharts.charts import Bar
from pyecharts.options import LabelOpts
# 使用Bar构建基础柱状图
bar = Bar()
# 添加x轴的数据
bar.add_xaxis(["中国", "美国", "英国"])
# 添加y轴数据
bar.add_yaxis("GDP", [30, 20, 10], label_opts=LabelOpts(position="right"))  # 把数据标签放在右侧
# 反转x和y轴
bar.reversal_axis()
# 绘图
bar.render("基础柱状图.html")
```
#### 基础时间线图表
- 导入pyecharts.charts.Timeline模块可以创建时间线(同理折线图也可以)
- 本质上可以理解为时间线也是一个轴,轴上的点调整为时间
- .add.schema功能尅已调整播放设置
  
    ![Untitled 107 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20107%208.png)
    
- 使用ThemeType主题设置
    ![Untitled 108 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20108%208.png)
    ```Python
    from pyecharts.charts import Bar, Timeline
    from pyecharts.options import LabelOpts
    from pyecharts.globals import ThemeType
    bar1 = Bar()
    bar1.add_xaxis(["中国", "美国", "英国"])
    bar1.add_yaxis("GDP", [30, 30, 20], label_opts=LabelOpts(position="right"))
    bar1.reversal_axis()
    bar2 = Bar()
    bar2.add_xaxis(["中国", "美国", "英国"])
    bar2.add_yaxis("GDP", [50, 50, 50], label_opts=LabelOpts(position="right"))
    bar2.reversal_axis()
    bar3 = Bar()
    bar3.add_xaxis(["中国", "美国", "英国"])
    bar3.add_yaxis("GDP", [70, 60, 60], label_opts=LabelOpts(position="right"))
    bar3.reversal_axis()
    # 构建时间线对象
    timeline = Timeline({"theme": ThemeType.LIGHT})
    # 在时间线内添加柱状图对象
    timeline.add(bar1, "点1")
    timeline.add(bar2, "点2")
    timeline.add(bar3, "点3")
    # 自动播放设置
    timeline.add_schema(
        play_interval=1000,
        is_timeline_show=True,
        is_auto_play=True,
        is_loop_play=True
    )
    # 绘图是用时间线对象绘图，而不是bar对象了
    timeline.render("基础时间线柱状图.html")
    ```
#### 动态GDP图表构建
区别于[Python Basics](Python%20Basics.md),现在是sort方法
![Untitled 109 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20109%208.png)
```Python
my_list = [["alpha",33],["beta",30],["charlie",25]]
def choose_sort_key (element):
    return element[1]
my_list.sort(key = choose_sort_key,reverse=False)
print(my_list)
# 使用lambda函数完成
my_list = [["alpha",33],["beta",30],["charlie",25]]
my_list.sort(key = lambda element:element[1],reverse=False)
print(my_list)
```
- sort方法会直接修改原列表数据,key是方法的第二个函数,所以不能使用位置传参方法, 用关键字
- element[1] 表示choose函数的元素( element) 是一个列表. 取出列表中的第二个元素( 下标为1 )
- sort方法规定key参数一定要是一个函数,( **规定是函数那么只需要写函数名,函数名后加()是调用函数)**
- sort函数根据函数的使用的是列表中下标为1的元素的值对整个列表进行排序

csv格式是表格文件转化为纯文本文件, 表格中的数据使用,分割每一列, 对于中文的显示,可能不同的操作系统使用不同的格式编译csv, 可通过记事本查看, 一般为ansc或者GB2312,所以需要再打开文件时调整
**代码核心思路**
- 使用readllines读取csv文件每一行的内容并格式化
    - pop功能删除第一行表头
    - split功能分割每一行的字符串内容,每一行的三个元素(年份,国家,gdp)分别分隔开 ^cc9dfe
    - 将年份\国家\GDP单独拿出来,因为不需要在每一个国家之前都写上年份, 注意这里的年份和GDP是str类型, 需要int转换
    - 通过for循环遍历,对每一行数据都进行分割处理后放进相应的list
    - GDP通过float转换科学计数法
- 做时间轴
    - 将循环的内容放入字典中,字典格式为{key = 年份 ,value = [这一年所有 [ 国家, GDP ] ]}**字典的value中嵌套列表**
    - 使用sorted( dict . keys ( ) ) 调用dict生成时间轴时对所有的年份排序,确保顺序得到所有年份得到的**列表** . 使用for循环从列表中分别取出相应的年份
- 对dict中的所有国际排序,得到每年的前8个国家 sort(key = lambda element :element [1]
- 构建x y轴,生成图表
    - for循环组成x,y轴所有数据组成的列表
    - 将数据标签放在右边( 注意写法是 bar.add_yaxis( “GDP” , y_data , **label_opts = LabelOpts( postion = “right”))**
- 构建时间线
    - timeline导包 , timeline.add(bar, str(year)) 将所有year数据导入,注意导入的year操作也在for循环中
- 调整细节
    - 反转数据和轴,实现GDP高的在上
    - 使用theme和TitleOpt设置颜色和标题

```Python
from pyecharts.charts import Bar, Timeline
from pyecharts.options import *
from pyecharts.globals import ThemeType
# 读取数据
f = open("D:/1960-2019全球GDP数据.csv", "r", encoding="GB2312")
data_lines = f.readlines()
# 关闭文件
f.close()
# 删除第一条数据
data_lines.pop(0)
# 将数据转换为字典存储，格式为：
# { 年份: [ [国家, gdp], [国家,gdp], ......  ], 年份: [ [国家, gdp], [国家,gdp], ......  ], ...... }
# { 1960: [ [美国, 123], [中国,321], ......  ], 1961: [ [美国, 123], [中国,321], ......  ], ...... }
# 先定义一个字典对象
data_dict = {}
for line in data_lines:
    year = int(line.split(",")[0])      # 年份
    country = line.split(",")[1]        # 国家
    gdp = float(line.split(",")[2])     # gdp数据
    # 如何判断字典里面有没有指定的key呢？
    try:
        data_dict[year].append([country, gdp])
    except KeyError:
        data_dict[year] = []
        data_dict[year].append([country, gdp])
# print(data_dict[1960])
# 创建时间线对象
timeline = Timeline({"theme": ThemeType.LIGHT})
# 排序年份
sorted_year_list = sorted(data_dict.keys())
for year in sorted_year_list:
    data_dict[year].sort(key=lambda element: element[1], reverse=True)
    # 取出本年份前8名的国家
    year_data = data_dict[year][0:8]
    x_data = []
    y_data = []
    for country_gdp in year_data:
        x_data.append(country_gdp[0])   # x轴添加国家
        y_data.append(country_gdp[1] / 100000000)   # y轴添加gdp数据
    # 构建柱状图
    bar = Bar()
    x_data.reverse()
    y_data.reverse()
    bar.add_xaxis(x_data)
    bar.add_yaxis("GDP(亿)", y_data, label_opts=LabelOpts(position="right"))
    # 反转x轴和y轴
    bar.reversal_axis()
    # 设置每一年的图表的标题
    bar.set_global_opts(
        title_opts=TitleOpts(title=f"{year}年全球前8GDP数据")
    )
    timeline.add(bar, str(year))
# for循环每一年的数据，基于每一年的数据，创建每一年的bar对象
# 在for中，将每一年的bar对象添加到时间线中
# 设置时间线自动播放
timeline.add_schema(
    play_interval=1000,
    is_timeline_show=True,
    is_auto_play=True,
    is_loop_play=False
)
# 绘图
timeline.render("1960-2019全球GDP前8国家.html")
```
![test 5.zip](../../../Files%20&%20LongText/Attachments/test%205.zip)
![python-%E8%AF%BE%E7%A8%8B%E4%BB%A3%E7%A0%81 5.zip](python-%E8%AF%BE%E7%A8%8B%E4%BB%A3%E7%A0%81%205.zip)
## 面向对象编程
### 初识对象
![Untitled 110 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20110%208.png)
对象的创建和使用方法
![Untitled 111 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20111%208.png)
对于类的理解:
1. 程序中使用类类比生活中的登记表
2. 通过设计类, 可以方便管理一组数据,更方便调用功能,不必注意各种数据容器的不同书写格式 .类的作用是封装属性
3. 类是创建对象的模板，而实例是根据这个模板创建的对象.这句话可以这样理解:  
    类定义了一个模板,可以存储各种参数,用来表明各种属性,方便后面调用,修改和导入  
    使用变量=类名()无论在括号中有没有传入参数,这变量就叫做类的实例  
    
4. `__init__` 方法是类的构造函数，它在创建类的实例时自动调用，是因为 `__init__` 方法是类定义的一部分
5. `self` 参数的主要作用是允许你在 `__init__` 方法内部访问和操作实例的属性和方法。通过 `self` 参数，你可以设置实例的初始状态，即初始化实例的属性。此外，`self` 参数也使得实例能够访问类中定义的其他方法和属性。
6. 使用my_car = Car("Red", "Toyota", "V6")时,解释器会默认将括号里的参数传递给__init__方法中,若数量或名称不匹配返回TypeError错误,
7. `self` 参数在 `__init__` 方法中代表类的实例本身，而不是表示调用方法本身。`self` 参数是自动传递的，当创建类的新实例时，Python 解释器会自动将新创建的实例作为第一个参数传递给 `__init__` 方法。因此，`self` 参数不是用来触发 `__init__` 方法的，而是用来引用实例本身，以便在方法内部访问和修改实例的属性。  
   
    **my_car = Car("Red", "Toyota", "V6")这段代码表示调用类的__init__方法,并将这三个参数传递给方法中定义的三个参数**
8. `my_car = Car()` 创建了 `Car` 类的一个新实例，并将其赋值给变量 `my_car`。Car()的意思是在car类中传入空参数,把对象传入给了变量my_car
9. 在类中定义的函数成为类的方法
10. **将类赋值给一个变量,这个变量叫做类的实例.这个变量中有了类的成员的数据存储其中,这个变量就是一个实例  
    
    **在类中为一个成员变量赋值,这个变量名也将变为实例
    
    ```Python
    # singleton.py
    class Singleton:
        _instance = None
        def __new__(cls, *args, **kwargs):
            if not cls._instance:
                cls._instance = super(Singleton, cls).__new__(cls, *args, **kwargs)
            return cls._instance
        def __init__(self):
            print("Singleton instance created")
    # 使用模块作为单例
    import singleton
    # 第一次调用会创建单例实例
    instance1 = singleton.Singleton()
    print(instance1)
    # 第二次调用会返回已创建的单例实例
    instance2 = singleton.Singleton()
    print(instance2)
    ```
    •  `__new__` 方法是一个特殊的静态方法，用于创建类的新实例。它首先检查 `Singleton` 类的 `_instance` 属性是否已经有一个实例。如果没有，它会使用 `super(Singleton, cls).__new__(cls, *args, **kwargs)` 来创建一个新的实例。
11. `self` 参数的命名约定是惯例，你可以使用任何其他有效的变量名，但强烈建议遵循这一约定，以保持代码的可读性和一致性。在构造函数中，`self` 参数后面通常会跟随其他参数，这些参数用于初始化实例的属性。
    ```Python
    class Person:
        def __init__(self, name, age):
            self.name = name  # 将传入的 name 参数赋值给实例的 name 属性
            self.age = age    # 将传入的 age 参数赋值给实例的 age 属性
        def greet(self):
            print(f"Hello, my name is {self.name} and I am {self.age} years old.")
    # 创建 Person 类的一个实例
    person1 = Person("Alice", 30)
    # 调用实例的方法
    person1.greet()  # 输出: Hello, my name is Alice and I am 30 years old.
    # 这列没有传入任何对象仍能够打印出结果可以类比定义函数逻辑
    ```
    ```Python
    # 创建 Person 类的一个实例
    person1 = Person("Alice", 30)
    # 调用实例的方法
    person1.greet()  # 输出: Hello, my name is Alice and I am 30 years old.
    ```
### 类的成员
![Untitled 112 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20112%208.png)
![Untitled 113 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20113%208.png) 
类中定义的属性（变量），我们称之为：成员变量  
类中定义的行为（函数），我们称之为：成员方法  
python 中没有类似 [C++](../../../Files%20&%20LongText/Q&A/C++.md) 中私有变量的概念，一切定义在类中的变量和方法都可以访问，他们都是用户定义的用户变量，使用 `_classname__varname` 即可访问私有变量
类中函数定义语法:
![Untitled 114 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20114%208.png)
![Untitled 115 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20115%208.png)
### 类和对象绑定
python **严格规定**类中方法要有实例才能调用（前提是方法中有 self 参数）
- 有 self 参数的方法才能被实例调用
- 没有 self 的方法只能被类在不创建实例的情况下调用
- 没有 self 的方法不能被实例调用
```python
class test:
    def print_something(self):
        print("something out now")
    def print_no_self():
        print("this method only can be called by class with no object")

test.print_no_self()
# test.print_something() #this line will raise an error
test.print_something()
#error no self,no call,print_something doesn't know who call it
object = test()
object.print_something()#no error
```
### self 参数
self 作用类似于 [this指针](../C%20C++/C++%20Basics.md#this%20指针)，将引用这个方法对象传入作为 self 参数，**为了让函数知道那个对象在调用这个方法**，不至于 C++中不用 this 指针所有对象使用方法不分开存储
如果不加 self 则表示变量是方法中的局部变量，在方法运行完之后销毁，标记 self 表示这个变量是实例的属性，在方法内定义，生命周期和实例的生命周期相同
```Python
class Student:
    name = None
    def say_hi(self):  # self表示函数体中会调用类的成员变量,不调用可以不写
        print(f"hello ,my name is {self.name}")
    def say_hi2(self,message):
        print(f"{message},my name is {self.name}")
stu1= Student() # stu1是类的一个实例
stu1.name= "Sickwag"
stu1.say_hi()
stu2= Student() # stu2是类的一个实例
stu1.name= "Sickwag"
stu1.say_hi2("you know what ?")
```
可以看出,类是一种封装了方法和各种变量的”集合体”,调用时可以一次性执行多个操作和变量\函数的定义\赋值
下面要做的仅仅只是类似于填表的步骤,将内容输入进类,类来完成操作
### 类和对象
^c8315c

类存在的意义
现实中的事物,描述他总归是描述它的属性行为. 类的出现是为了描述现实中的事物, 现实生活中需要使用各种生活用品, 函数中模拟使用用品的过程, 有了类的概念, 生活中使用生活用品, 代码中使用类
![Untitled 116 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20116%208.png)
对象存在的意义
类是一种”设计图纸”,里面包含了物品的各种属性信息,和这个物品会做什么(行为). **面向对象的变成套路就是: 设计类, 基于类创建对象 , 由对象做具体的工作**
![Untitled 117 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20117%208.png)
```Python
class Clock :
    id = None
    price = None
# 定义有一个闹钟,它的属性是id表示序列号和price表示价格,行为是发出响
    def ring(self,time):
        import winsound
        winsound.Beep(1000,time) # 前面是频率,后面是持续时间(毫秒)
clock1 = Clock() # 表示有一个示例:具体的闹钟1需要调用类
clock1.id = int("000001")
clock1.price = 19.99
time = int(input("how long you wanna the beep last ?(ms)"))# 设置每一个闹钟响铃时间
clock1.ring(time)
```
### 构造方法
^386d6a

成员变量赋值
利用__init__方法使用自动执行特性
![Untitled 118 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20118%208.png)
```Python
class Student:
    def __init__(self,name,age,tel) -> None:
        self.name = name
        self.age = age
        self = tel
        print("Student creat a class object")
stu = Student("sickwag",20,10000)
```
练习案例
![Untitled 119 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20119%208.png)
```Python
class Student:
    def __init__(self, name, age, native_place):
        self.name = name
        self.age = age
        self.native_place = native_place
students = list()
# 循环录入学生信息
for i in range(2):
    name = input("please input your name: ")
    age = input("please input your age: ")
    native_place = input("please input your native place: ")
    student = Student(name, age, native_place)
    # 这才是循环录入,不要想着在__init__函数里面写循环
    print(f"the {i+1} student info signed in: name {name}, age {age}, native place {native_place}")
    students.append(student)
for index, student in enumerate(students):
    print(f"Student {index+1}: Name: {student.name}, Age: {student.age}, Native Place: {student.native_place}")
#这一步是打印出所有学生信息的表单 
```
### 魔术方法
常用内置方法,以__开头表示是内置的私有方法\函数, 并在调用类时自动运行，本质上是用不同的魔术方法规定类中不同动作的执行方式[如构造函数和创建对象方法](#^f7b234)
![Untitled 120 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20120%208.png)
![Untitled 121 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20121%208.png)
#### 构造、析构方法 
- 来自 [C++ Runoob Tutoral \> 构造函数](../C%20C++/C++%20Runoob%20Tutoral.md#构造函数)，同样是自动调用 `__init__` 的返回值是 none，不是第一个被调用的
- __new__ 才是，new 方法的作用是规定创建（实例化）对象时实例化的方法。new 规定了应该如何实例化一个对象，__init__ 函数规定了实例化的对象的初始属性是什么 ^f7b234
- new 方法必须返回一个**新创建的实例**，将创建的实例作为返回值**传递给 init**方法
```python
class MyClass:
    def __new__(cls, value):
        # 创建对象实例
        instance = super().__new__(cls)
        # 可以在这里进行一些特殊的创建逻辑
        return instance# instance是实例

    def __init__(self, value):
        # 初始化对象实例的属性
        self.value = value
        print("对象被初始化，其值为:", self.value)

# 创建一个MyClass的实例
obj = MyClass(10)

# 输出对象的属性
print(obj.value)
#---------------------------------------------------
class capstr(str):
    def __new__(cls,string):
        string = string.upper()
        return str.__new__(cls,string)#不能写cls.__new__()，cls是类参数
    #这里使用str类创建对象
a = capstr("romantic")
print(a)
```
----------------------------------------------------------
同样的，python 提供了析构方法，在创建的实例被销毁时调用 [C++ Runoob Tutoral \> 析构函数](../C%20C++/C++%20Runoob%20Tutoral.md#析构函数) __del__ 魔术方法  
#### 字符串方法
在对实例使用print是会得到实力所在模块和内存地址
```Python
class Student:
    def __init__(self, name, age, native_place):
        self.name = name
        self.age = age
        self.native_place = native_place
student = Student(111,11,1)
print(Student) # 直接对类只会显示类所在的模块
print(student)
```
使用字符串方法可以将内存地址转换为所对应的字符串
```Python
class Student:
    def __init__(self, name, age, native_place):
        self.name = name
        self.age = age
        self.native_place = native_place
student = Student(111,11,1)
print(Student) # 直接对类只会显示类所在的模块
print(student) # 返回student变量的状态信息,也就是它的内存地址
```
```Python
def func() :
    return 0
print(func())
```
```Python
def func() :
    return 0
print(func)
```
可以知道: 一个变量名称( 对象 )作为表达式需要显示时,会显示变量名称( 对象 )的状态
- 对于对象的状态就是隶属模块和内存地址
- 对于函数状态就是函数内存地址
- def __str**__**(self)方法定义调用类的对象的状态信息将变为return中所规定的字符串内容
  
    当你创建一个 `Student` 实例并打印它时：
`print` 函数会调用 `student` 实例的 `__str__` 方法，并打印出该方法返回的字符串，
定义一个对象的“非正式”字符串表示。当尝试将一个对象转换为字符串时，比如使用 `str()` 函数或者在打印对象时，`__str__` 方法会被调用。即：
    
```Python
    student = Student("Alice", 20, "Wonderland")
    print(student)# student不是字符串但这里print需要接受一个字符串参数，需要转换时根据__str__定义的转化行为转换字符串
	Student(name=Alice, age=20, native_place=Wonderland)
```
这样，`print` 函数中 `student` 变量的状态信息就变成了 `__str__` 方法中 `return` 所规定的内容返回的字符串。[Python Basics](Python%20Basics.md)
    
- **[Python Basics](Python%20Basics.md)** **:** 在一个类中除了__init__语句没有返回值外,不同的方法可以有不同的返回值,而且不互相干扰,只有在调用相应的方法时才会执行对应方法所对应的return语句
- 在Python中，`__init__` 方法被规定为没有返回值，或者说其返回值应该是 `None`。`__init__` 方法的目的是初始化新创建的对象，它不应该返回任何值。如果在 `__init__` 方法中使用了 `return` 语句，Python解释器会抛出 `TypeError`，因为这违反了 `__init__` 方法的约定。

- `__repr__ ` 函数的作用是提供类对象的官方描述，精确定义对象的信息，`__repr__` 方法通常在交互式解释器中被调用（例如当你直接输入对象名称并回车时），或者使用 `repr()` 函数时被调用。
#### it小于/大于比较方法
类对象在未定义时无法比较, 因为类对象没有设置比较方法,也不能简单通过类对象名的Unicode大小对比( 不合逻辑 )
```Python
class Student:
    def __init__(self, name, age, native_place):
        self.name = name
        self.age = age
        self.native_place = native_place
    def __lt__(self,other):
        return self.age < other.age
stu1 = Student(111,11,1)
stu2 = Student(222,22,2)
print(stu1 < stu2)
print(stu1 > stu2) # 使用<=会报错
```
- lt方法中self参数表示本身, other表示和本身比较的类
- 返回值表示一旦需要比较两个类, 那么会按照他们在成语变量中的.age变量比较( 这是使用 编码表比较方法 )
- 只能比较小于或者大于

#### le小于等于/大于等于比较方法
同lt方法
![Untitled 122 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20122%208.png)
#### eq等于方法比较
在没有定义__eq__方法时, 使用print( stu1 == stu2 )比较会默认比较类的状态信息,也就是内存地址, 不会报错, 因为互相独立,返回false
```Python
class Student:
    def __init__(self, name, age, native_place):
        self.name = name
        self.age = age
        self.native_place = native_place
    def __lt__(self,other):
        return self.age < other.age
    def __le__(self,other):
        return self.age <= other.age
    def __eq__(self,other):
        return self.age <= other.age
stu1 = Student(111,11,1)
stu2 = Student(222,22,2)
print(stu1 < stu2)
print(stu1 > stu2)
print(stu1 <= stu2)
print(stu1 >= stu2)
print(stu1 == stu2)
```
#### 运算方法
`__add__` 和 `__sub__` 等方法用来定义加减法的运算规则
```python
class try_int(int):
#定义新的加减运算变为运算两次
def __add__(self,other):
    return self + other + other
def __sub__(self,other):
    return self - other - other
```
但这样写会导致递归，原因在于这些运算方法接受的参数时对象参数（在 python 中无处无对象），加减法也是将两个对象通过定义好的 `__add__` 方法进行对象的加减运算（在别的地方可能不是使用 `__add__` ）

涉及到**得到对象**的操作（如返回值返回一个新的对象，创建一个对象）时，会调用这个对象内置的魔术方法，上面代码没有语法问题，但会在 Return 中加减运算调用其魔术方法，从而无限递归
```python
class try_int(int):
#定义新的加减运算变为运算两次
def __add__(self,other):
    return int(self) + int(other) + int(other)
def __sub__(self,other):
    return int(self) - int(other) - int(other)
```

#### 一元操作符
`_ _neg_ _()` 表示正号行为；
`_ _pos_ _() `表示定义负号行为；
` abs () `函数（取绝对值）被调用时的行为；
`_ _invert_ _() `表示定义按位取反的行为。

**反运算**
当一个对象的魔术方法被调用时实现或者不支持相应操作时，会调用对象的反运算方法
![运算](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240910234213.png)
![反运算](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240910234241.png)
运算方法中，以**运算符**分开左值和右值，如果左值支持调用定义类的相对应运算方法（不关右值）时，调用运算方法，**如果左值不支持而右值支持时**调用反运算方法
**注意有运算对象顺序的方法**要谨慎写代码逻辑
```python
class new_int(int):
    def __rsub__(self, value: int) -> int:
        return int.__sub__(self,value)    
a = new_int(4)#创建一个值位4的a对象
print(3-a)
```
其中 3 是一个整数类型，不能使用 new_int 类型对象才有的__sub__方法，右值是一个 new__int 类型对象支持，所以不执行 2~3 行代码而调用 rsub 方法将两个参数位置转置，变为 4-3=1 而不是-1
### 向对象编程思想
#### 封装
将现实世界中的事物映射到程序中
![Untitled 123 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20123%208.png)
![Untitled 124 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20124%208.png)
程序中也有对用户隐藏的属性和行为
类中提供了私有成员的形式来支持 ：  

| 特性         | C++                                | Python                      |
| ---------- | ---------------------------------- | --------------------------- |
| **严格访问控制** | `public/protected/private` 关键字明确限定 | **无语言级关键字**，靠约定实现           |
| **私有成员**   | `private` 成员外部无法访问                 | **单下划线开头** `_var`（约定私有）     |
| **强私有成员**  | -                                  | **双下划线开头** `__var`（会触发名称改写） |
| **访问本质**   | 编译期强制检查                            | 全是公开的，约定大于强制                |

即可完成私有成员的设置  
![Untitled 125 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20125%208.png)
```Python
class Phone:
    __is_5g_enable= True
    def __check_5g(self):
        if self.__is_5g_enable == True :
            print("the 5g module has optic")
        else :
            print("the 5g module is nagetive , using 4g module")
    def call_by_5g(self):
        self.__check_5g()
        print("dialoguing")
phone = Phone() # 创建类的对象
phone.call_by_5g()  # 只有类的对象能够调用方法,不要写成phone=Phone.call_by_5g()
```
#### 继承
对旧类修改得到新类但继承旧类的对象的各种属性\参数\功能,从而得到新的对象
**对上一代手机( 旧类的对象 )的属性修改( 修改旧类的成员 ), 得到新的新类( 成员发生变化 ),得到新一代手机( 新类的对象 )**
**函数覆盖**
如果子类中定义了和父类中相同（C++中需要类型、参数列表、名称全部相同，python 中只需要函数、方法名称）的函数、方法。会发生函数覆盖（override）而不是重载（overloading），在类外调用该方法、参数时，会调用子类方法而不是父类。这点和 [C++](../C%20C++/C++%20Runoob%20Tutoral.md#函数覆盖) 不同 ^ffc9cf
![Untitled 126 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20126%208.png)
![Untitled 127 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20127%208.png)
通过继承的语法, 只需要关心新的类, 并且通过继承,旧类并不会改变, 只是创建了一个包含旧类的新类
![Untitled 128 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20128%208.png)
```Python
class Phone:
    IMEI = 123456
    producer = "apple"
    def call_by_4g(self):
        print("i can call by 4g module")
class Phone_new(Phone):
    new_function = "Face ID"  # 添加了新的属性
    def call_by_5g(self):      # 添加了新行为
        print("i can call by 5g module")
phone = Phone_new()
phone.call_by_5g() #新老功能都能用
phone.call_by_4g()
print(phone.producer)
print(phone.IMEI)
```
以上是单继承 一个子类继承一个父类, 多继承即继承多个父类
![Untitled 129 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20129%208.png)
![Untitled 130 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20130%208.png)
在多继承对象中,如果不添加新内容,类内容体中应语法要求需要协商pass表示跳过写新内容
在多继承父类中如果有相同的成员**对象名或方法**,默认调用先写的父类成员
```Python
class Phone:
    IMEI = 123456
    producer = "apple"
    def call_by_4g(self):
        print("i can call by 4g module")
class finger_print:
    hardware = "samsung"
    def function(self):
        print("i can regonize fingerprint")
class music_player:
    hardware = "sonic"
    def function(self):
        print("i can play music")
class Phone_new(Phone,finger_print,music_player):
    pass
phone = Phone_new()
phone.call_by_4g() # 旧功能能使用
print(phone.producer) # 父类成员可以调用
print(phone.hardware) # finger和music都有producer,调用最先写的finger
phone.function() # 同样的方法,调用最先写的
```
#### 复写
在子类中重写父类中的成员即复写
![Untitled 131 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20131%208.png)
复写后**调用新类对象**中旧类成员会使用复写过后的
需要调用原有父类成员有两种方法
![Untitled 132 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20132%208.png)
注意super不需要传入self参数
```Python
class Phone:
    IMEI = 123456
    producer = "apple"
    def call_by_4g(self):
        print("i can call by 4g module")
        print(phone.IMEI)
class Phone_new(Phone):
    IMEI = 67890
    new_function = "Face ID"  # 添加了新的属性
    def call_by_5g(self):      # 添加了新行为
        print("i can call by 5g module")
        print(super().IMEI)
phone = Phone_new()
print(phone.IMEI)  #调用的父类数据只能用于方法,所以这里调用的还是复写的新类
phone.call_by_5g() #调用新类方法,新类方法中使用了旧类的数据
```
#### 类型注解
- 变量注解
  
    编译器如何知道一个对象有什么方法?方法中参数类型是什么?
    
    ![Untitled 133 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20133%208.png)
    
    对于自定义的变量编译器无法得知变量需要的类型,所以需要自己注解
    
    这样告诉了编译器, 也是对自己编译的一种提示
    
    但是标记和实际输入不符程序仍然能够运行,但是编译器提示显示标记而不是实际输入的类型提示
    
    ![Untitled 134 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20134%208.png)
    
    ![Untitled 135 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20135%208.png)
    
    ![Untitled 136 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20136%208.png)
    
    对数据容器也可以使用类型注解, **冒号后面等号前面相当于使用了注释**
    
    ![Untitled 137 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20137%208.png)
    
    详细注解表明了变量类型和变量内部填入变量的类型
    
    也可以使用注释正经写,编译器也能识别
    
    ![Untitled 138 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20138%208.png)
    
- 形参注解
  
    ![Untitled 139 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20139%208.png)
    
    同上理
    
    对方法\函数定义返回值类型( vscode tab调用函数时会自动填充 )
    
    ```Python
    class name :
        def __init__(self) -> None:
            pass
    ```
    在类中定义魔术方法时按下tab自动填充,箭头后为返回值类型
    
- Union类型注解
  
    ![Untitled 140 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20140%208.png)
    
    当注解中有多种类型,每种类型又有多个, union类型注释表示union所在位置的参数类型可以**是方括号中的任意一个**
    
    注意union的导入方法
    
    > from typing import Union
    
    ```Python
    from typing import Union
    class name :
        def __init__(data: Union[str,int]) -> Union[float]:
            pass
    # 表示data的类型是str或这int,返回值类型为float
    ```
    ![Untitled 141 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20141%208.png)
    
#### 多态
^0f4a2e

完成某个行为时,使用不同对象得到不同的状态, 同样的行为( 函数 ),传入不同的对象,得到不同的状态
多态（Polymorphism）是面向对象编程（OOP）中的一个核心概念，指的是允许不同类的对象对同一消息做出响应的能力。换句话说，多态允许你使用一个通用的接口来引用不同类型的对象，并且这些对象能够以自己的方式响应这个接口调用。
多态的实现通常依赖于继承和接口。在继承体系中，子类可以重写（override）父类的方法，使得父类的引用可以指向子类的对象，并且调用的方法会根据对象的实际类型来执行相应的方法版本。
#### 应用多态的具体例子
假设我们有一个基类 `Animal` 和两个派生类 `Dog` 和 `Cat`。每个类都有一个 `speak` 方法，但它们的实现不同：
```Python
class Animal:
    def speak(self):
        pass
# 父类
class Dog(Animal):
    def speak(self):
        return "Woof!"
class Cat(Animal):
    def speak(self):
        return "Meow!"
# 子类
```
现在，我们可以创建 `Dog` 和 `Cat` 的实例，并将它们存储在 `Animal` 类型的列表中：
```Python
animals = [Dog(), Cat()]
for animal in animals:
    print(animal.speak())  # 输出: Woof! Meow!
```
在这个例子中，尽管 `animals` 列表中的元素是 `Animal` 类型的引用，但实际的对象是 `Dog` 和 `Cat` 的实例。当调用 `speak` 方法时，Python解释器会根据对象的实际类型来调用相应的方法版本。这就是多态的体现。
方法体是空实现的类, 方法叫做抽象类, 即父类不做任何行为pass, 只声明有什么方法, 这个方法怎么做由调用的子类决定
![Untitled 142 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20142%208.png)
```Python
class air_condition :
    def make_cool(self):
        pass
    def make_warm(self):
        pass
    def swing(self):
        pass
class Midia(air_condition):
    def make_cool (self):
        print("Midia ac is making cool")
    def make_warm (self):
        print("Midia ac is making warm")
    def swing(self):
        print("Midia ac is swing")
class Gree(air_condition) :
    def make_cool(self):
        print("Gree ac is making cool")
    def make_warm(self):
        print("Gree ac is making warm")
    def swing(self):
        print("Gree ac is swing")
def make_cool(ac : air_condition):  \#ac是make_cool函数传入的变量名, 变量的类型是air_condition类型
    ac.make_cool()  #调用这个类型下的make_cool方法
Midia_machine = Midia() #上面定义的midia类的类型实例
Gree_machine = Gree()   #上面定义的gree类的类型实例
make_cool(Midia_machine)    #使用父类的子类赋值的变量名作为参数,不是air_condition类型,但是是air_condition的子类类型
make_cool(Gree_machine)
```
**多态中核心部分的理解**
- 函数或方法可以接受不同类型的对象作为参数，并且根据对象的实际类型调用相应的方法。
- 多态中父类负责提出方法标准,具体的方法实现过程通过子类实现, 父类中的方法是抽象的方法用pass作为方法体**(在这个例子中)**, 然后通过用子类中相同方法名方法覆盖父类中的方法从而实现方法具体化
- 在上面的代码示例中, 定义的make_cool函数接受一个 `air_condition` 类型的参数。由于 `Midia` 和 `Gree` 都是 `air_condition` 的子类，所以它们的实例可以被传递给 `make_cool` 函数。调用仍然合法,make_cool方法必须在子类有才可以调用**(这也是为什么要求子类中要实现的方法名和父类中必须相同达到覆盖效果)**
- 前面定义的Mdia和Gree的实例,通过.调用方法,实现了make_cool函数的正确定义
- 包含抽象方法( 函数或方法的体为pass ) 的类叫做抽象类, 使用抽象类可以约束子类, 使子类必须通过复写覆盖父类中的方法, 也就约束了子类必须要实现这些方法对应的功能

#### 综合案例
将两份文件中的数据通过图表展示
![Untitled 143 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20143%208.png)
两份文件一份是csv,另一份是json
![Untitled 144 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20144%208.png)
![Untitled 145 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20145%208.png)
自定义设置样式时,都会显示出类型注解,方便传入参数,类型不出错
![Untitled 146 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20146%208.png)
![Untitled 147 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20147%208.png)
为什么label_opts是等于号? 应为它仅仅是一个参数, 等待被赋值,通过位置传参
为什么The,meType是.引用方法? 因为它是一个已经在说明文件中定义好的示例( 变量 )从和其他变量颜色一样可以看出
```Python
from data_define import Record
from file_define import TextFileReader,JsonFileReader
from pyecharts.charts import Bar
from pyecharts.options import *
from pyecharts.globals import ThemeType
# 将类的内容赋予实例
text_content = TextFileReader(    ) # 括号填txt路径   TextFileReader是实例
json_content = JsonFileReader(    ) # 括号填json路径  JsonFileReader是实例
all_data = text_content.read_data(Record) + json_content.read_data(Record)      # 调用方法,参数用Record中的  all_data也是实例
"""
最终可视化图表开发需要使用list作为轴
并且每一条line的date可鞥是重复的,一天内的销售额要累加,不同天的money分开计算,也需要使用字典创建独立的数据组
"""
data_dict={}
for record in all_data:     # 将实例赋值给变量,所以record也能调用类的属性
    if record.date in data_dict.keys(): \#record被赋予data_dictz之后便有是一个数据格式
        if record.date in data_dict.keys(): # record.data表示调用示例all_data的一个属性值date, all_data追根溯源是Record的示例,所以也有所有Record有的属性和方法
            data_dict[record.date] += data_dict[record.date]
        else:
            data_dict[record.date] = data_dict[record.date]
# 数据可视化
bar = Bar(init_opts=InitOpts(ThemeType.LIGHT))         # Bar是一个类,这里创建类的实例,方便调用方法
bar.add_xaxis(list(data_dict.keys()))
bar.add_yaxis(list(data_dict.values()),label_opts=LabelOpts(is_show=False))
"""
这里同理,在参数中使用类,类中又有参数
"""
bar.set_global_opts(
    title_opts= TitleOpts(title="daily turnover")
)
bar.render()
"""
title_option是set_global_opt函数中的参数
TitleOpts是set_global_opt中的类(没错,在函数中定义类)
title是TitleOpts中的参数,但并不是第一个,所以使用位置传参法
"""
```
```Python
file_define.py
from main import Record
import json
class FileReader:
    # 顶层设计中明确了它的子类中都必须要实现read_data功能(复写)
    def read_data(self)->list[Record]:
        pass
class TextFileReader(FileReader):   # csv文件内容读取
    def __init__(self,path) -> None:    #调用这个子类方法时自动获取路径
        self.path = path                #定义变量接受
    def read_data(self)->list[Record]:  # 定义接受的内容是list的类型,list中接受的是Record类类型
        file = open(self.path,"r",encoding="UTF-8")
        record_list :Record= []
        for line in file.readlines():   #一行行读取
            line = line.strip()
            data_list = line.split(",") # 这两个方法都不会修改原列表,需要变量接收新列表
            record = Record(data_list[0],data_list[1],
            data_list[2],data_list[3])  # data中的前四个数据对应了Record类中的四个参数,record变量中只有一行中的四个数据,根据main文件中定义record类,输入四个之后得到的是return中字符串内容
            record_list.append(record)  #将字符串内容(Record)的字符串内容返回的数值之间用,隔开,放在recordlist会因为,自动识别为列表的四个元素
        file.close()
        return record_list
class JsonFileReader(FileReader):       # json文件读取器
    def __init__(self,path) -> None:
        self.path = path
    def read_data(self)->list[Record]:
        file = open(self.path,"r",encoding="UTF-8")
        record_list :Record= []
        for line in file.readlines():   \#json数据只有一个字典,不是只有一行,字典其那套字典的方式,用不同的key嵌套
            data_dict = json.loads(line)    #每一行内容是字典以{开头}结束,json模块将字符串内容转换为字典类型
            record = Record(data_dict["data"],data_dict["order_id"],int(data_dict["money"]),data_dict["province"])    #将每一行的内容输入到Record作为参数,其中转换为字典之后,字典中key和value内容的类型也是字符串,所以搜索匹配才需要"",同理value值中的数字也需要被转化
            record_list.append(record)
        file.close
        return record_list
# 最后一个问题,导包之后如果需要使用if __name__ == main测试运行,return值返回的只会是内存地址,方便需要用到这个包的函数通过内存地址读取到包的内容
```
```Python
data_define.py
class Record:
    def __init__(self, date, order_id, money, province) -> None:
        self.date= date
        self.order_id = order_id
        self.money = money
        self.province = province
    def __str__(self) -> str:
        return f"{self.date},{self.order_id},{self.money},{self.province}"
```
### SQL
#### MySQL介绍
数据= 数据的存储 + 数据的计算
数据库的层级: 库——表——数据, 把这种设计实现的是软件
数据库是用来存储数据的，在这个过程中，会涉及到：  
数据的新增  
数据的删除  
数据的修改  
数据的查询  
数据库、数据表的管理  
而SQL语言，就是一种对数据库、数据进行操作、管理、查询的工具。  
使用数据库软件去获得库->表->数据，这种数据组织、存储的能力  
并借助SQL语言，完成对数据的增删改查等操作  
#### 使用Dbeaver连接数据库
mysql基础命令  
show databases;  
use 数据库名;  
show tables;  
![Untitled 148 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20148%208.png)
#### sql基础和ddl语法
sql命令支持换行, 通过;表示结束
Structured Query Language操作语言分为四类
![Untitled 149 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20149%208.png)
![Untitled 150 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20150%208.png)
![Untitled 151 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20151%208.png)
少的三个库位sql内部库,隐藏防止被误修改
特征:
- 大小不敏感,即使混用也不会出现问题
    ![Untitled 152 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20152%208.png)
- 所有sql语句都使用 ; 结尾  
    使用注释    
    ![Untitled 153 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20153%208.png)
    多行注释方法同C++
    
    查看数据库  
    SHOW DATABASES；  
    使用数据库  
    USE 数据库名称；  
    创建数据库  
    CREATE DATABASE数据库名称 [CHARSETUTF8];  
    删除数据库  
    DROP DATABASE数据库名称；  
    查看当前使用的数据库  
    SELECT DATABASEO  
    
    查看有哪些表  
    SHOWTABLES; 注意：需要先选择数据库哦  
    删除表  
    DROPTABLE 表名称；  
    DROPTABLEIFEXISTS 表名称；  
    
    ```SQL
    create：table student(
    id int,
    varchar(10), # 在sql中字符串类型是varchar
    age int,
    );
    ```
    sql命令行点击运行并不是一键全部运行, 选中什么就运行相应语句
    
#### sql DML数据操作语言
**插入insert into**
![Untitled 154 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20154%208.png)
在student列中插入名为id的列,有三个值,1,2,3
插入字符串需要使用`’ ’` 括起
![Untitled 155 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20155%208.png)
**删除数据delete from** 
![Untitled 156 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20156%208.png)
**更新数据update set**
![Untitled 157 8.png](../../../Files%20&%20LongText/Attachments/Untitled%20157%208.png)
![Untitled 158 6.png](../../../Files%20&%20LongText/Attachments/Untitled%20158%206.png)
在student表中将id列为4的单元格的name列数据改为 = 后的( 注意修改的数据要和创建列是规定的数据格式相同 )
#### sql DQL数据查询操作
- 进行筛选展示

**select 字段列表 |* from 表**
表示从from的表中选择select( 选择条件 )中某些**列**进行**展示**
![Untitled 159 6.png](../../../Files%20&%20LongText/Attachments/Untitled%20159%206.png)
![Untitled 160 6.png](../../../Files%20&%20LongText/Attachments/Untitled%20160%206.png)
在查询语句后可以使用where查询条件数据过滤
```SQL
select * from student where gender = '男'
/*从名为student的数据库表中选择所有列（*代表所有列），
但只返回那些gender列的值为'男'的记录*/
```
下面查询world数据库中的coutry表, 只显示continent列内容
```SQL
show databases;
use world;
select continent from country
```
- 分组聚合

    分组再聚合, 先给出分组条件, 再写出进行操作

    ![[Attachments/Untitled 161 6.png|Untitled 161 6.png]]

    表示通过from表中满足某种where条件筛选出的列, 然后将某一(group by)的列分组, 通过select 进行操作

    ```SQL
计算student表中，按性别分组后每组的平均年龄。
select gender,avg(age) from student group by gender
    ```
    gender中每一个不同的记录都作为分段依据, gender列中性别有多少种记录,就会有多少种分组, 通过avg计算每一个分组再age列中的平均数,但是不加gender只会显示数据没有标记

    > select 后面加的列直接展示会显示类中所有唯一值列表, select gender表示对gender挑选  
    > group by中出现谁, select中才能有谁, 因为他们都是普通字段,select的字段只能是唯一值  

```SQL
SELECT continent, SUM(population) FROM country GROUP BY continent;
```
    表示先从country中选择continent中的唯一值作为分组依据, 计算每一个分组依据组成的组中population列的sum值,并显示continent作为分类组名

    ```SQL
    SELECT continent, SUM(population), min(population), max(population),count(*) FROM country GROUP BY continent;
    ```
    同理还显示了每个大陆的最多最少人口数,每个洲中有多少个项目( 常识可知是国家, 但是不能这样认为 )

- 设置排序条件

    ![Untitled 162 6.png](../../../Files%20&%20LongText/Attachments/Untitled%20162%206.png)

    其中asc默认.

    order by 一定要在group by语句后面使用,

```SQL
SELECT continent, SUM(population) as total FROM country GROUP BY continent order by total;
// select语句中有两个参数,但是sum是聚合函数,并没有赋值给函数
// 创建新变量total, 才可以被order排序,不然数量对不上
    ```
- 显示限制

    ![[Attachments/Untitled 163 5.png|Untitled 163 5.png]]

    n,m表示跳过前n行数据,从n+1行数据向后取5行数据,不写m表示只取n行数据

    limit在order by后面, sql中关键字有顺序

    **执行步骤:**

    1. 先通过from查询到相应的表
    2. 通过where筛选不需要的列
    3. group by 通过一列里的唯一标识数据分组
    4. 通过order by排序
    5. 用limit控制显示行数

### python & mysql
#### 使用python链接mysql
> pip install pymysql

```Python
from pymysql import Connection
conn = Connection(
    host ='localhost',
    port=3306,
    user='root',
    password='123456'
)
print(conn.get_server_info())   # 调用类型对象注意有()
```
#### 执行非查询性质语句
获取游标对象使用cursor方法
```undefined
from pymysql import Connection
conn = Connection(
    host ='localhost',
    port=3306,
    user='root',
    password='123456'
)
cursor = conn.cursor()   # 创建一个数据库对象
conn.select_db("world") # 选择数据库
cursor.execute("create table test_pymsql2(id int)")   # ()输入sql语句
```
#### 执行查询性质语句
```Python
from pymysql import Connection
conn = Connection(
    host ='localhost',
    port=3306,
    user='root',
    password='123456'
)
cursor = conn.cursor()   # 创建一个数据库对象
conn.select_db("world") # 选择数据库
cursor.execute("select * from country")   # ()输入sql语句
result= cursor.fetchall()       # return a data in tuple,元组内也是元组
print(result)
for lines in result:          # 读取元组返回其中的每一个元素,
    print(lines)
```
fetchall返回所有的数据并且以元组数据容器组织
#### 数据插入
python执行语句插入到mysql中,同样使用create语句
不同的一点是创建数据插入数据库中之后需要使用commit方法提交数据库改动请求.
```Python
from pymysql import Connection
conn = Connection(
    host ='localhost',
    port=3306,
    user='root',
    password='123456'
)
cursor = conn.cursor()   # 创建一个数据库对象
conn.select_db("test") # 选择数据库
cursor.execute("CREATE TABLE example_table(string_column VARCHAR(255),integer_column INT,float_column FLOAT,boolean_column BOOLEAN)")   #已经创建后在执行这一行代码会报错
# executesql语句不要在括号内换行,会被vscode报错
cursor.execute("insert into example_table values('str',12345,1.2345,True)")
conn.commit()       # 注意使用conn对象调用方法,commit不是一个conn类中的cursor方法中的方法,execute才是
```
自动提交命令可以再构建从connection中输入参数autocommit = True
#### 综合案例

---
## Pyspark实战
## python高阶技巧
### 闭包
#### global关键字
```Python
counter = 0  # 全局变量
def increment_counter():
    global counter  # 声明counter为全局变量
    counter += 1   # 修改全局变量的值
increment_counter()
print(counter)  # 输出: 1
```
在函数或其他局部作用域内声明一个变量为全局变量。这意味着该变量可以在当前代码块的外部访问和修改
- 当别的文件调用了带有全局变量的文件时,可能在编程过程中改变全局变量值, 因调用全局变量前后顺序导致错误
- 全局变量在命名空间上并不干净

#### 简单闭包
![Untitled 164 5.png](../../../Files%20&%20LongText/Attachments/Untitled%20164%205.png)
![Untitled 165 5.png](../../../Files%20&%20LongText/Attachments/Untitled%20165%205.png)
- 内层函数使用外层变量, 使创建的变量fn1 不是变量而是函数
- outer函数中的变量是临时创建的外部变量,一旦通过fn1= outer(”text”)定义, 生命周期知道函数结束, 在outer函数没结束时,inner一直可以用到这个变量. 除非再调用一次outer函数
- 在inner函数中使用nonlocal关键字修改闭包中的变量

```Python
def outer(num1):
    def inner(num2):
        nonlocal num1
        num1 += num2
        print(num1)
    return inner
fn= outer(1000)
fn(10)      #外层num1没有重新赋值,num1的迭代是通过内部函数实现(nolocal)
fn(10)      # 这样下来"全局变量"仅能在内部修改流动,调用包时不会修改1000起始值
fn(10)
fn(10)
```
```Python
def account_creat(initial_amount):
    def atm(num, deposit=True):
        nonlocal initial_amount
        if deposit:
            initial_amount += num       # 存钱之后的钱变成新的initial money
            print(f"save{num}, and the deposit left with {initial_amount}")
        else :
            initial_amount -= num       # 存钱之后的钱变成新的initial money
            print(f"save{num}, and the deposit left with {initial_amount}")
    return atm    # 最重要的一步:返回内部函数
atm = account_creat(0)      # 在vscode中不会默认赋值未定义的变量为0
atm(100)
atm(100)                    # 这个变量是外部的,使用atm变量作为外部对象实例时,得层==内层def中的atm函数生命周期已经结束,这里的atm不回复写,但是不推荐这么做,一般使用不同的变量名
atm(100)
atm(100,deposit=False)      # 取钱
```
![Untitled 166 5.png](../../../Files%20&%20LongText/Attachments/Untitled%20166%205.png)
- 闭包下外部变量的就是外层函数的临时变量,无法在整个包被调用时被修改, 只能在原包内改动
- 内部函数持续引用外部函数的值,导致内存一直被占用

### 装饰器
装饰器其实也是一种闭包，其功能就是在不破坏目标函数原有的代码和功能的前提下，为目标函数增加新功能。
通过内外层,闭包的使用添加功能, 再喊舒蝶调用函数
```Python
def outer(func):        # 传入一个参数,这个参数叫什么名字并不重要
    def decorate ():
        print("start sleep")
        func()          # ()告诉编译器将这个参数当做函数使用
        print("getting up")     # 整个装饰器作为sleep的补充功能
    return decorate
def sleep():
    import random 
    import time
    print("sleeping now .....")
    time.sleep(random.randint(1,5))
fn= outer(sleep)        # 将sleep字段作为参数调用,其实他是前面定义的函数
fn()                    # fn是函数的对象
```
```Python
def outer(func):        # 传入一个参数,这个参数叫什么名字并不重要
    def decorate ():
        print("start sleep")
        func()          # ()告诉编译器将这个参数当做函数使用
        print("getting up")     # 整个装饰器作为sleep的补充功能
    return decorate
@outer
def sleep():
    import random 
    import time
    print("sleeping now .....")
    time.sleep(random.randint(1,5))
sleep()
```
对于装饰器的理解
- 装饰器的核心功能是接收一个函数作为参数，并返回一个新的函数，这个新函数通常会包含对原始函数的调用以及额外的功能。不使用闭包会限制其功能。
- `@outer`是一个装饰器语法的简写形式，它位于一个函数定义的上方。这种语法是Python的语法糖，它等同于将装饰器应用于函数。具体来说，当你在`def sleep()`前面写上`@outer`时，你实际上是在告诉Python解释器，在定义`sleep`函数之后，立即使用`outer`装饰器来处理这个函数。
- 装饰器函数必须返回一个函数,并实际上是通过这个函数来对被装饰函数进行功能扩充.一般这个被返回的函数卸载装饰器函数内部
- `@outer` 作用就是呼叫outer函数,中需要的参数func就是下面的函数, 处理之后的函数函数名不变,**方便阅读和维护,符合思维惯性**

### 设计模式
#### 单例模式
- 面向对象就是一种设计模式,是编程的一种套路,没有固定的语法,只是一种为了达到某种目的形成的固定的写法
- 除了面向对象外，在编程中也有很多既定的套路可以方便开发，我们称之为设计模式：  
    单例、工厂模式  
    建造者、责任链、状态、备忘录、解释器、访问者、观察者、中介、模板、代理模式  
    等等模式  
    
- 单例对象用于确保一个类只有一个实例,提供一个全局访问点(内存地址)获取这个实例

只要通过导入同一个自定义模块（例如`singleton`），并使用该模块中定义的类（例如`Singleton`）创建的对象（例如`instance1`和`instance2`），它们的内存地址就会相同
```Python
# singleton.py
class Singleton:
    pass        # 这个类中可以没有任何东西,只要在另一个文件中调用
                # 这个模块中的内容,地址就是一样的
# main.py
import singleton
instance1 = singleton.Singleton()
instance2 = singleton.Singleton()
print(instance1 is instance2)  # 输出 True
```
只使用一个对象, 节省大量内存资源
#### 工厂模式
构建多个对象时, 如果通过传统方式会产生大量不便于代码维护的变量
```Python
# 产品接口
class Product:
    def do_something(self): # 定义每一个它的子类都需要完成do_something功能
        pass
# 具体产品
class ConcreteProductA(Product):
    def do_something(self):    # 父类功能的复写,完成功能
        print("Product A do something")
class ConcreteProductB(Product):
    def do_something(self):
        print("Product B do something")
# 工厂类
class ProductFactory:
    @staticmethod
    def create_product(product_type):
        if product_type == "A":
            return ConcreteProductA()
        elif product_type == "B":
            return ConcreteProductB()
        else:
            raise ValueError("Unknown product type")
# 使用工厂模式
product_type = "A"  # 假设这个值可能来自配置文件或用户输入
product1 = ProductFactory.create_product("A")   # 统一接口,无论使用哪个对象都要用create_product方法
product2 = ProductFactory.create_product("B")   # 只需要名称即可调用对象
product.do_something()  # Product A do something
```
- `Product` 是一个产品接口，定义了所有产品必须实现的方法。
- `ConcreteProductA` 和 `ConcreteProductB` 是具体产品，实现了 `Product` 接口。
- `ProductFactory` 是工厂类，它有一个静态方法 `create_product`，根据传入的参数决定创建哪种产品。
- 用户不需要知道productA或B是如何实现功能的( 具体产品部分 )只需要知道他们的名称即可调用实现相应功能的对象
- 当创建了很多对象在其他代码文件中,一旦原功能需要改动,则每一个对象都需要改,而[Python Basics](Python%20Basics.md),只需要改工厂类中生产对象的方式即可
- 这种方式符合逻辑, class类中的成员定义的产品的功能和属性, 工厂根据这些设计生产出含有相应参数的产品( 对象 )便于使用

### 多线程并行执行
#### 进程与线程
**进程**：一个程序，运行在系统之上，那么便称之这个程序为一个运行进程，并==**分配进程ID**==方便系统管理。  
**线程**：线程是归属于进程的，一个进程可以开启多个线程，执行不同的工作，是进程的实际工作最小单位。
操作系统中可以运行多个进程，即多任务运行  
一个进程内可以运行多个线程，即多线程运行  
进程就好比一家公司，是操作系统对程序进行运行管理的单位  
线程就好比公司的员工，进程可以有多个线程（员工）是进程实际的工作者  
- 一般来说不同的进程之间内存不共享( 不同的程序做的是不一样 ), 进程内部的线程共享( 方便同一个程序工作 )
- 并行执行表示一个程序有多个线程, 同时完成多个工作

#### 多线程编程
在一个代码文件中代码由上到下执行, 在一些长生命周期的函数运行时不会执行这个函数下面的任何语句
![Untitled 167 5.png](../../../Files%20&%20LongText/Attachments/Untitled%20167%205.png)
target参数需要传入函数\方法名,不需要写()让他执行,只需要名称**( 直接引用返回内存地址, 让对象**==**[Python Basics](Python%20Basics.md)**==**运行 )**
```Python
import time 
def sing():
    while True:
        print("i m singing")
        time.sleep(1)
def dancing():
    while True:
        print("i m dancing ")
        time.sleep(1)
sing()
dancing()       # dancing不会执行
```
```Python
import time 
import threading
def sing(do_something,feeling):
    while True:
        print(f"i m {do_something}, and i feel {feeling}")
        time.sleep(1)
def dancing(do_something,feeling):
    while True:
        print(f"i m {do_something}, and i feel {feeling}")
        time.sleep(1)
sing_thread = threading.Thread(target=sing,args=("singing","happy"))
dancing_thread = threading.Thread(target=dancing,kwargs={"feeling":"incredible","do_something":"dancing"})
sing_thread.start()
dancing_thread.start()
```
使用args元组传参会按照元组顺序将参数赋值到函数中,当只有一个参数时**一定要记得加, 不然就只是一个普通的括号,加了,表示这个括号是一个元组整体**
使用kwargs注意字典传参, 顺序不重要,通过关键字匹配
### 网络编程
进程之间和程序之间进行的数据交换通过socket实现,例如电脑主板上连接的硬件之间交换信息都通过主板上的接口连接
![Untitled 168 5.png](../../../Files%20&%20LongText/Attachments/Untitled%20168%205.png)
### 正则表达
使用规则字符串来描述、匹配某个句法规则的字符串，  
**字符串定义规则，并通过规则去验证打断字符串中有没有符合规则的字符串**  
比如，验证一个字符串是否是符合条件的电子邮箱地址，只需要配置好正则规则，即可匹配任意邮箱。  
比如通过正则规则:(^{\w-]+(\.\w-]+)\*@[\w-]+(\.\w-]+)+$）即可匹配一个字符串是否是标准邮箱格式  
**出现目的: 解决频繁使用if else**来对字符串做判断就非常困难了。
Python正则表达式，使用re模块，并基于re模块中三个基础方法来做正则匹配。  
分别是：match、Search、findall三个基础方法  
#### 基本规则
**re.match(匹配规则，被匹配字符串）**  
从被匹配字符串  
**开头进行匹配**，匹配成功返回匹配对象（包含匹配的信息），**返回的是符合规则的字符串索引信息** 匹配不成功返回空。
先导入remodule文件,match方法调用的第一个参数是匹配规则,后一个是被匹配的字符串
**re.search(参数同理)**
从头开始匹配,找到第一个出现的值,同样返回索引值,找不到返回none
**re.findall(参数同理)**
匹配整个字符串中符合规则的部分
返回值是一个包含所有符合规则的字符串的列表,每一个符合规则的否作为一个元素
#### 元字符匹配
![Untitled 169 5.png](../../../Files%20&%20LongText/Attachments/Untitled%20169%205.png)
### 递归
**递归一定要有一个明确的终止条件**
方法\函数自己调用自己的算法叫做递归
**例子:从文件夹这中获得所有的文件,不要文件夹**
需要使用osmodule文件
os下的方法:
listdir:显示路径中所有的文件名,并将每一个文件的文件名作为元素放在列表中,( 返回值是一个列表 )
path_isdir方法:
判断路径参数是否是一个文件夹,如果是返true,反之false
path.exist是一个模块名,(库名)库之间有相似内容但又不完全至于分开的用.表隶属关系,但是层级相同,都是库
判断你路径参数是否存在,**注意这里调用了path方法中的exist方法,不是一个paht_exist的方法**
```Python
import os
# os中的三那个方法
# print(os_object.listdir(directory))    列出directory中文件列表,通过列表存储名称
# print(os_object.path_isdir(directory))  判断directory是不是一个文件夹
# print(os_object.path.exists(directory))      判断directory是否存在
num = 0
def get_files_in_dirs(path):
    file_list = []                  # 最终要显示的列表,作为append的容器
    print(f"the operating directory is {path}")
    if os.path.exists(path):        # 判断路径是否存在
        for f in os.listdir(path):  
            new_path = path + "/" + f   # 生成新路径
            if os.path.isdir(new_path):     
                file_list += get_files_in_dirs(new_path)  #旧筐中加递归后的内容
            else :
                file_list.append(new_path)     #将new_path中的所有文件名添加大file_list中     
    else:
        print(f"指定的目录{path}不存在")
        # 将所有文件名加上/和文件名后判断不是文件夹说明到头了,最终文件夹path中的每一个对象都是文件(isdir返回false),把所有文件添加进file_list准备结束
    global num
    num = len(file_list)
    return file_list
print(f"{get_files_in_dirs(input("please input the directory :"))} ,and we got {num} files .")
```