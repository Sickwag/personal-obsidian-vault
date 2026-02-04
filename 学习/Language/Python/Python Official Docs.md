# 4.3 range语句

## 什么叫可迭代对象

可迭代对象（Iterable）是指可以使用`for`循环进行迭代的对象。更准确地说，可迭代对象实现了`__iter__()`方法，该方法返回一个迭代器（Iterator）。迭代器是一个实现了`__next__()`方法的对象，该方法用于返回序列中下一个元素，直到没有元素时抛出`StopIteration`异常。

可迭代对象的例子包括列表（list）、元组（tuple）、字典（dict）、集合（set）、字符串（str）以及通过`range()`函数生成的范围对象等。

## range()函数的返回

- `range()`函数返回一个`range`**对象**，它是一个**不可变的序列类型**，用于生成一个整数序列。
- 列表（list）是一个可变的序列类型，可以存储任意类型的元素。

## 什么叫迭代器

## 什么叫序列

**序列协议**( 是序列就要满足的定义 )

- 索引访问：可以通过整数索引访问序列中元素，例如`seq[index]`。
- 切片操作：可以通过切片语法访问序列的一部分，例如`seq[start:stop:step]`。
- 长度获取：可以通过`len(seq)`获取序列的长度。
- 成员检查：可以通过`in`和`not in`操作符检查某个元素是否存在于序列中。
- **并没有说序列中元素是否允许被修改,**这也就说明了序列(seq)是大类, 列表（list）、元组（tuple）、字典（dict）、集合（set）、字符串（str )是序列中小类

序列（Sequence）是一种数据结构，它是一种有序的集合，可以包含多个元素，并且每个元素都有一个与之对应的索引。序列支持通过索引访问元素，支持切片操作，以及一些内置函数和方法，如`len()`, `min()`, `max()`, `sum()`, `sorted()`等。

字符串（str）、列表（list）、元组（tuple）等都是序列类型的数据容器，因它们都满足序列的定义：有序、可以通过索引访问元素、支持切片操作等

## print函数等需要展示返回值的语法

当使用`print()`函数打印一个对象时，`print()`函数会调用该对象的`__str__()`方法（如果存在），并打印返回的字符串

如果对象没有定义`__str__()`方法，Python会尝试调用`__repr__()`方法，并打印返回的字符串。`__repr__()`方法旨在提供一个对象的官方或“官方”表示形式，通常用于调试。

每个对象在Python中都有一个`__repr__`方法，该方法返回对象的官方字符串表示。`__repr__`方法返回的字符串表示形式通常包含对象的类型和值，有时也包括内存地址。

# 4.7 定义函数

> 函数定义在**当前符号表**中把**函数名**与**函数对象**关联在一起。解释器把**函数名**指向的**对象**作为**用户自定义函数**。还可以使用其他名称指向同一个函数对象，并访问访该函数：

下面这段代码中,

- 当前符号表是Unicode, 这由当前操作系统决定

- 函数名是fib

- 函数对象是下面这段代码创建的对象

    ```python
    ...     """Print a Fibonacci series up to n."""
    ...     a, b = 0, 1
    ...     while a < n:
    ...         print(a, end=' ')
    ...         a, b = b, a+b
    ...     print()
    ```

- 用户自定义函数通过解释器,将代码对象和函数名连接起来,连接方式是通过引用值来传递的


```python
>>> def fib(n):    # write Fibonacci series up to n
...     """Print a Fibonacci series up to n."""
...     a, b = 0, 1
...     while a < n:
...         print(a, end=' ')
...         a, b = b, a+b
...     print()
...
>>> # Now call the function we just defined:
... fib(2000)
0 1 1 2 3 5 8 13 21 34 55 89 144 233 377 610 987 1597

>>> fib
<function fib at 10042ed0> # 引用对象的信息,__repr__方法内容
>>> f = fib
>>> f(100)
0 1 1 2 3 5 8 13 21 34 55 89
```

> 在调用函数时会将实际参数（实参）引入到被调用函数的局部符号表中；因此，实参是使用 按值调用 来传递的（**其中 值 始终是对象的 引用 而不是对象的值**）。 [1]当一个函数调用另外一个函数时，会为该调用创建一个新的局部符号表。

## 什么是符号表?

在Python中，符号表（Symbol Table）是一个用于存储变量名和它们对应值的内部数据结构。在Python的上下文中，符号表通常与作用域（Scope）紧密相关。作用域定义了变量名的可见性和生命周期。

**符号表**

符号表是编译器或解释器用来记录程序中定义的变量名和它们对应值的地方。在Python中，符号表通常与命名空间（Namespace）相关联。每个模块、函数或类都有自己的命名空间，而符号表就是用来管理这些命名空间的。

**当前符号表**

当前符号表指的是在当前执行上下文中活跃的符号表。例如，在函数内部，当前符号表就是该函数的局部符号表。

**局部符号表**

局部符号表是与函数调用相关联的符号表，它只在函数执行期间存在。局部符号表存储了函数内部定义的所有局部变量。当函数被调用时，一个新的局部符号表被创建，用于存储该函数调用的局部变量。当函数执行完毕后，局部符号表被销毁，其中变量也随之消失。

## 参数的 传递方式

当一个函数调用另一个新的函数时，会为该调用创建一个新的局部符号表。这个新的局部符号表是独立于当前函数的局部符号表的，它存在于当前函数的调用栈中，但与当前函数的局部符号表是分开的。

需要调用新的函数内定义的各种变量名和对应的值时, 先调用当前函数的符号表,然后再从这个符号表中找到新定义的函数符号表,从中取得另一个新的函数中所对应的各种变量名和对应的值.

```python
def outer_function():
    outer_var = "I am from outer_function"

    def inner_function():
        inner_var = "I am from inner_function"
        print(outer_var)  # 访问外部函数的变量
        print(inner_var)  # 访问内部函数的变量

    inner_function()
    print(inner_var)  # 这里会引发错误，因 inner_var 不在当前符号表中

outer_function()
```

由于Python中闭包机制( [不是编程套路的闭包](https://www.notion.so/Python-acd35004ede9496a86c2aedac91622b4?pvs=21) ),闭包是指一个函数能够记住并访问其定义时的作用域中变量，即使该函数在其他作用域中被调用。内部函数引用外部变量时是合法的

# 4.8 函数详细定义

## 函数传参的格式化

```python
def parrot(voltage, state='stiff', action='voom', type='Norwegian Blue'):
    print("this parrot wouldn't ",action ,"and",end=" ")
    这只是因print函数可以传入任意数量的参数,并且支持任意位置传参
    在别的函数中不能这样调用变量
```

## 关键字传参方式

在Python中，`*`和`**`是两种特殊的参数传递方式，它们分别用于处理可变数量的位置参数和关键字参数。

## 可变数量的位置参数

使用`*`可以接收任意数量的位置参数，这些参数在函数内部被当作一个元组（tuple）处理。

```python
def print_args(*args):
    for arg in args:
        print(arg)

print_args(1, 2, 3)  # 输出: 1, 2, 3
```

在这个例子中，`print_args`函数使用`*args`来接收任意数量的位置参数，并将它们打印出来。

## 可变数量的关键字参数

使用`**`可以接收任意数量的关键字参数，这些参数在函数内部被当作一个字典（dict）处理。

```python
def print_kwargs(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_kwargs(first="Hello", second="World")  # 输出: first: Hello, second: World
```

在这个例子中，`print_kwargs`函数使用`**kwargs`来接收任意数量的关键字参数，并将它们打印出来。

结合使用 `*`和 `**`

- ``和`*`也可以在函数定义中同时使用，允许函数接收任意数量的位置参数和关键字参数。

```python
def print_args_and_kwargs(*args, **kwargs):
    print("Positional arguments:", args)
    print("Keyword arguments:", kwargs)

print_args_and_kwargs(1, 2, 3, "前面传args,后面传kwargs"first="Hello", second="World")
# 输出:
# Positional arguments: (1, 2, 3)
# Keyword arguments: {'first': 'Hello', 'second': 'World'}
```

在这个例子中，`print_args_and_kwargs`函数同时使用`*args`和`**kwargs`来接收任意数量的位置参数和关键字参数。

## 在函数调用中使用`*`和 `**`( variadic可变参数 )

- ``和`*`也可以在函数调用时使用，用于解包序列（如列表、元组）和字典，将它们作为位置参数和关键字参数传递给函数。

```python
def func(a, b, c):
    print(a, b, c)

args = [1, 2]
kwargs = {'c': 3}

func(*args, **kwargs)  # 输出: 1 2 3
```

在这个例子中，`args`列表被解包为位置参数，`kwargs`字典被解包为关键字参数，并传递给`func`函数。*_需要解包_,**后面的变量必须是元组和字典变量**

混合使用* 和** 时,通过写法区分* 与** 分界线, 这也决定了* 必须写在**前面

## 限定传参方式

在Python函数定义中，`/`和`*`符号用于明确地指定参数的传递方式：

- `/`符号之前的参数只能通过位置传递，不能通过关键字传递。这些参数被称为位置参数（positional-only parameters）。
- `/`和``之间的参数既可以作为位置参数传递，也可以作为关键字参数传递。这些参数被称为位置或关键字参数（positional-or-keyword parameters）。
- ``符号之后的参数只能通过关键字传递，不能通过位置传递。这些参数被称为关键字参数（keyword-only parameters）。

再使用关键字传参方式时

- 在函数定义中，`/`和`*`可选的，但它们必须同时出现或同时不出现。
- 如果函数定义中没有`/`和`*`，则所有参数默认为位置或关键字参数。

## 任意参数列表

```python
def concat(*args, sep="/"):
     return sep.join(args)
```

任意一个字符串都是一个对象, 编译器内置, 其中包含了join方法, **join方法表示将字符串插入到join中参数( 一定是一个可迭代参数 ) 中**,返回一个新的字符串.

## 参数[解包](https://www.notion.so/Python-acd35004ede9496a86c2aedac91622b4?pvs=21)

将一个序列中元素拿出来作为参数

```python
# 列表
list(range(3, 6))            # normal call with separate arguments
# 返回结果 [3, 4, 5]
args = [3, 6]
list(range(*args))            # call with arguments unpacked from a list
# 本质上是位置传参,按位置传入不改动位置,所以args返回的是元组而不是列表

def parrot(voltage, state='a stiff', action='voom'):
    print("-- This parrot wouldn't", action, end=' ')
    print("if you put", voltage, "volts through it.", end=' ')
    print("E's", state, "!")
d = {"voltage": "four million", "state": "bleedin' demised", "action": "VOOM"}      # 将一个字典内的元素传入 ,是一种关键字传参,key是参数名,value是关键字的值,也就是传入的参数
parrot(**d)
#输出
# -- This parrot wouldn't VOOM if you put four million volts through it. E's bleedin' demised !
```

[Python基础学习](https://www.notion.so/Python-acd35004ede9496a86c2aedac91622b4?pvs=21) 中提到[使用enumerate关键字的解包操作](https://www.notion.so/Python-acd35004ede9496a86c2aedac91622b4?pvs=21)

## [lambda函数](https://www.notion.so/Python-acd35004ede9496a86c2aedac91622b4?pvs=21)作为参数

```python
pairs = [(1, 'one'), (2, 'two'), (3, 'three'), (4, 'four')]
pairs.sort(key=lambda pair: pair[1])
print(pairs)
>>>[(4, 'four'), (1, 'one'), (3, 'three'), (2, 'two')]
```

lambda返回的pair[1]表示pair(名字无所谓)的数组中第二个元素,是一个表达式信息, 意思就是列表的第二个

sort方法中key必须接受一个函数对象作为参数, 这个函数高祖sort方法根据什么(列表) 的第几个([1])作为排序依据

## [文档字符串](https://www.notion.so/Python-acd35004ede9496a86c2aedac91622b4?pvs=21)

![Untitled 227.png](../Attachments/Untitled%20227.png)

## [函数\变量注解](https://www.notion.so/Python-acd35004ede9496a86c2aedac91622b4?pvs=21)

所有对函数\变量\返回值的注解都会以字典形式存放在函数的__annotations__方法中,通过.调用

```python
def f(ham: str, eggs: str = 'eggs') -> str:
    print("Annotations:", f.__annotations__)
    print("Arguments:", ham, eggs)  # 通过变量展示内容,
    return ham + ' and ' + eggs
f('spam')
```

## 编码风格

[@官方文档中建议](https://peps.python.org/pep-0008/)


# 8.5with语句

^1998e6

## enter和exit语句
> **object.__enter__(self)** 进入与此对象相关的运行时上下文。 with 语句将会绑定这个方法的返回值到 as子句中指定的目标，如果有的话。
>
> **object.__exit__**(self, exc_type, exc_value, traceback) 退出关联到此对象的运行时上下文。 各个参数描述了导致上下文退出的异常。
>
> 如果上下文是无异常地退出的，三个参数都将为 None。 如果提供了异常，并且希望方法屏蔽此异常（即避免其被传播），则应当返回真值。 否则的话，异常将在退出此方法时按正常流程处理。
## with语句执行步骤
1. 对上下文表达式（在 with_item中给出的表达式）进行求值来获得上下文管理器。
2. 载入上下文管理器的 __enter__()以便后续使用。
3. 载入上下文管理器的 __exit__()以便后续使用。
4. 发起调用上下文管理器的 __enter__()方法。
5. 如果一个目标被包括在 with 语句中，则把它赋值为 __enter__()的返回值。
	备注: with 语句会保证如果 __enter__() 方法未发生错误地返回，则 __exit__()将一定被调用。 因此，如果在对目标列表赋值期间发生错误，它将被当作在语句体内部发生的错误来处理。 参见下面的第 7 步。
6. 执行语句体。
7. 发起调用上下文管理器的 __exit__() 方法。 如果语句体的退出是由异常导致的，则其类型、值和回溯信息将被作为参数传递给 __exit__()。 否则的话，将提供三个 None参数。 如果语句体的退出是由异常导致的，并且来自 __exit__() 方法的返回值为假，则该异常会被重新引发。 如果返回值为真，则该异常会被抑制，并会继续执行 with语句之后的语句。 如果语句体由于异常以外的任何原因退出，则来自 __exit__()的返回值会被忽略，并会在该类退出正常的发生位置继续执行。
```python
with EXPRESSION as TARGET:
	SUITE          # 在代码块中使用SUITE表示这里是代码块

manager = (EXPRESSION)
enter = type(manager).__enter__
exit = type(manager).__exit__
value = enter(manager)
hit_except = False

try:
    TARGET = value
    SUITE
except:
    hit_except = True
    if not exit(manager, *sys.exc_info()):
        raise
finally:
    if not hit_except:
        exit(manager, None, None, None)

# 这段代码等价于

with EXPRESSION as TARGET:
    SUITE
```
**代码分析**
	1.`manager = (EXPRESSION)`：这里`EXPRESSION`应该是一个表达式，它返回一个实现了`__enter__`和`__exit__`方法的对象。这个对象可以是一个自定义的上下文管理器，或者是一个使用了`contextlib`模块中装饰器（如`contextmanager`）的生成器函数。
	2.`enter = type(manager).__enter__`：获取`manager`对象的`__enter__`方法。
	3.`exit = type(manager).__exit__`：获取`manager`对象的`__exit__`方法。
	4.`value = enter(manager)`：调用`manager`对象的`__enter__`方法，并将返回值赋给变量`value`。通常，`__enter__`方法会返回资源对象本身或与资源相关联的对象。
	5.`hit_except = False`：初始化一个标志变量，用于记录是否发生了异常。
	6.`try`块：尝试执行`SUITE`代码块。`TARGET = value`将`__enter__`方法的返回值赋给`TARGET`变量。
	7.`except`块：如果在`try`块中发生了异常，将`hit_except`设置为`True`。然后，调用`__exit__`方法，并将异常信息传递给它。如果`__exit__`返回`False`，则重新抛出异常。
	8.`finally`块：无论是否发生异常，都会执行`finally`块中代码。如果`hit_except`为`False`（即没有发生异常），则调用`__exit__`方法，并传递`None`作为参数，表示正常退出上下文管理器。

**这段代码的目的是确保资源被正确管理，无论是否发生异常。如果`__exit__`方法返回`True`，则异常不会被重新抛出；如果返回`False`，则异常会被重新抛出，允许外部处理。**