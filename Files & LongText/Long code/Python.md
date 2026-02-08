# 第四章
## 循环外else循环确认循环是否跑完

当for循环没有执行则执行else(可以用if not :达到相同效果)中语句
```python
cheeses = []
>>> found_one = False
>>> for cheese in cheeses:
...     found_one = True
...     print('This shop has some lovely', cheese)
...     break
...
>>> if not found_one:
...     print('This is not much of a cheese shop, is it?')
...
This is not much of a cheese shop, is it?
```

## 使用zip()并行迭代

将多个可迭代对象打包放入循环进行迭代
```python
>>> days = ['Monday', 'Tuesday', 'Wednesday']
>>> fruits = ['banana', 'orange', 'peach']
>>> drinks = ['coffee', 'tea', 'beer']
>>> desserts = ['tiramisu', 'ice cream', 'pie', 'pudding']
>>> for day, fruit, drink, dessert in zip(days, fruits, drinks, desserts):
...     print(day, ": drink", drink, "- eat", fruit, "- enjoy", dessert)
...
Monday : drink coffee - eat banana - enjoy tiramisu
Tuesday : drink tea - eat orange - enjoy ice cream
Wednesday : drink beer - eat peach - enjoy pie
```

**zip() 函数在最短序列“用完”时就会停止。上面例子中列表（desserts）是最长的，所以我们无法填充列表，除非人工扩展其他列表。**

## 推导式

创建更有python风格的代码
`[ expression for item in iterable if condition]`,
其中`[for item in iterable ]`是正常的循环部分,前面的`[ expression ]`是表达式,一般含有对`item`的操作**作为return返回值**, `if condition]`中是对循环得到结果的筛选, 在基础学习中有提到[Python Basics \> ](Python%20Basics.md#^047a06)

```python
a_list = [number for number in range(1,6) if number % 2 == 1]

# 和下面这段基础代码一样
>>> a_list = []
>>> for number in range(1,6):
...     if number % 2 == 1:
...         a_list.append(number)
...
>>>  a_list
[1, 3, 5]
```
**列表推导式可以嵌套** , 并可以使用拥有自己的if判断
```python
>>> rows = range(1,4)
>>> cols = range(1,3)
>>> cells = [(row, col) for row in rows for col in cols]
>>> for cell in cells:
...     print(cell)
...
(1, 1)
(1, 2)
(2, 1)
(2, 2)
(3, 1)
(3, 2)

# 和下面这段基础代码一致
>>> rows = range(1,4)
>>> cols = range(1,3)
>>> for row in rows:
...     for col in cols:
...         print(row, col)
...
1 1
1 2
2 1
2 2
3 1
3 2
```

同: 也有字典推导式`{ key_expression : value_expression for expression in iterable }`

```python
>>> word = 'letters'
>>> letter_counts = {letter: word.count(letter) for letter in word}
>>> letter_counts
{'l': 1, 'e': 2, 't': 2, 'r': 1, 's': 1}

# 上面代码对word中重复字母使用了两次.count方法,但在对一个重复的字母使用时已经得到重复次数的答案,使用set剔除重复元素
# 对上面代码优化
>>> word = 'letters'
>>> letter_counts = {letter: word.count(letter) for letter in set(word)}
>>> letter_counts
{'t': 2, 'l': 1, 'e': 2, 'r': 1, 's': 1}
```

集合推导式\生成器推导式都有, 关键取决于`expression`的写法,元组没有推导式
> 生成器推导式即循环函数的函数体return 循环的值,即`expression`部分是迭代对象

注意: **生成器特性**
一个生成器只能运行一次。列表、集合、字符串和字典都存储在内存中，但生成器仅在运行中产生值，不会被存下来，所以不能重新使用或者备份一个生成器。
```python
# 圆括号之间的是生成器推导式,它返回的是一个生成器对象, 生成器类型是一个**可迭代对象**
number_thing = (number for number in range(1, 6))

>>> type(number_thing)
<class 'generotor'>
```

## print函数使用

`print`函数是Python的标准输出函数，用于将信息输出到控制台。它的基本用法如下：
```python
print(*objects, sep=' ', end='\n', file=sys.stdout, flush=False)
```
参数说明：
- `*objects`：要打印的对象，可以是多个，它们之间默认以空格分隔。
- `sep`：指定输出多个对象时，对象之间的分隔符，默认为空格。
- `end`：指定输出结束后添加的字符，默认为换行符`\n`。
- `file`：指定输出的目标文件，默认为标准输出`sys.stdout`。
- `flush`：指定是否立即刷新输出缓冲区，默认为`False`。
`file`参数用于指定输出的目标文件。默认情况下，`print`函数将输出内容发送到标准输出（`sys.stdout`），这通常对应于终端或命令行界面。

## return 的意义

```python
def commentary(color):
...     if color == 'red':
...         return "It's a tomato."
...     elif color == "green":
...         return "It's a green pepper."
...     elif color == 'bee purple':
...         return "I don't know what it is, but only bees can see it."
...     else:
...         return "I've never heard of the color "  + color +  "."

>>> print(comment)
I've never heard of the color blue.
```
print使用`commet()`表示调用\执行commet函数, 使用`commet`表示调用commet这个对象, 对象是一个盒子,调用他就是调用其所在的内存地址, `commet`的return内容就放在`commet`指向的内存地址
![为什么print(名称)会返回对象的内存地址?](Python%20Basics.md#^e167c3)

如果函数不显式调用 return 函数，那么会默认返回 None。
**none和false在布尔值中是一样的** ,但本质不一样
你需要把 None 和不含任何值的空数据结构区分开来。0 值的整型 / 浮点型、空字符串（''）、空列表（[]）、空元组（()）、空字典（{}）、空集合（set()）都等价于 False，但不等于 None。
```python
>>> is_none(None)
It's None
>>> is_none(True)
It's True
>>> is_none(False)
It's False
>>> is_none(0)
It's False
>>> is_none(0.0)
It's False
>>> is_none(())
It's False
>>> is_none([])
It's False
>>> is_none({})
It's False
>>> is_none(set())
It's False
```
## 传参注意事项

将**可变**的数据类型作为**默认**参数值传入自定义参数时, 函数返回值会碎调用次数增加而迭代
```python
>>> def buggy(arg, result=[]):
>>> """传入参数时未指定result则使用默认值result,但result是可变可迭代迭代对象"""
...     result.append(arg)
...     print(result)
...
>>> buggy('a')
['a']
>>> buggy('b')   # expect ['b']
['a', 'b']

# 解决方法
>>> def works(arg):
...     result = []
...     result.append(arg)
...     return result
...
>>> works('a')
['a']
>>> works('b')
['b']
```

## help函数查看函数文档
打印输出一个函数的文档字符串。把函数名传入函数 help() 就会得到参数列表和规范的文档：

```python
>>> help(echo)
Help on function echo in module __main__:

echo(anything)
    echo returns its input argument
```
如果仅仅想得到文档字符串：
```python
>>> print(echo.__doc__)
echo returns its input argument
```
## 生成器和迭代器
### 迭代器
即`iterable`,能够产生(`return`)可迭代对象的函数\内容就是迭代器
例如数据容器就是一种迭代器    [数据容器](Python%20Basics.md#^9e8467)
### 生成器
生成器是用来创建 Python 序列的一个对象。使用它可以迭代庞大的序列，且不需要在内存中创建和存储整个序列。通常，生成器是为迭代器产生数据的。
`yield` 关键字用于定义一个生成器函数，而不是一个独立的函数。生成器函数允许你声明一个函数，它能够按需产生一系列的值，而不是一次性返回一个完整的值列表。这使得生成器函数在处理大量数据时非常有用，因它可以节省内存。
生成器最关键的一点是可以记住当前函数的执行情况,指导下一次调用`yield`函数时继续生成
**工作原理**
>1.**定义生成器函数**：使用`def`关键字定义一个函数，并在函数体中使用`yield`语句。这告诉Python该函数是一个生成器函数。
>2.**调用生成器函数**：当你调用生成器函数时，它不会立即执行函数体内的代码。相反，它返回一个生成器对象。
>3.**迭代生成器对象**：生成器对象可以被迭代，例如通过一个for循环。每次迭代请求下一个值时，生成器函数从上次`yield`语句停止的地方继续执行。
>4.**执行生成器函数**：在迭代过程中，生成器函数执行到下一个`yield`语句时，它会暂停执行并返回一个值给调用者。生成器函数记住当前的执行状态（包括局部变量的值和程序计数器的位置）。
>5.**恢复执行**：下一次迭代请求下一个值时，生成器函数从上次暂停的地方继续执行，直到遇到下一个`yield`语句或函数执行完毕。
>6.**结束迭代**：如果生成器函数执行完毕或通过`return`语句结束，那么生成器对象会抛出`StopIteration`异常，表示迭代已经结束。在for循环中，这会正常结束循环

```python
def fibonacci_sequence(n):
    """生成器函数，产生斐波那契数列的前n个数"""
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b
# 创建生成器对象
fib_gen = fibonacci_sequence(10)
# 迭代生成器对象
for fib_number in fib_gen:
    print(fib_number)
```
> 1. 第一次迭代时，`fib_gen` 从函数开始执行，直到遇到第一个 `yield a` 语句。此时，它返回斐波那契数列的第一个数 `0`，并记住当前的执行状态（`a` 和 `b` 的值）。
> 2. 第二次迭代时，`fib_gen` 从上次 `yield` 语句停止的地方继续执行，即从 `a, b = b, a + b` 开始。它更新 `a` 和 `b` 的值，然后再次遇到 `yield` 语句，返回下一个斐波那契数 `1`。
> 3. 个过程重复进行，直到函数执行完毕，即产生斐波那契数列的前10个数。

yield相当于一个return语句,是一种返回返回值的方式, 需要创建一个可迭代序列时,正常方式是计算出( 返回出 )每一个返回值,并使用append添加到序列号中, yield会每次生成一个可迭代对象中元素, 最后组成一个序列,节省内存,提高速度.

## 装饰器
- 装饰器分为内外层, 外层函数不执行任何代码, 仅仅是将需要被装饰的参数传入内部函数.,
- 定义好一个装饰器后,任何传入装饰器中函数都会被装饰器的内层函数装饰在本身的前后.
- 一个函数可以有多个装饰器,按照离本体函数的谁近谁先执行
```python
# 装饰器函数
>>> def document_it(func):
...     def new_function(*args, **kwargs):
...         print('Running function:', func.__name__)
...         print('Positional arguments:', args)
...         print('Keyword arguments:', kwargs)
...         result = func(*args, **kwargs)
...         print('Result:', result)
...         return result
...     return new_function
>>> def square_it(func):
...     def new_function(*args, **kwargs):
...         result = func(*args, **kwargs)
...         return result * result
...     return new_function

# 装饰结果
>>> @document_it
... @square_it
... def add_ints(a, b):
...     return a + b
...
>>> add_ints(3, 5)
Running function: new_function
Positional arguments: (3, 5)
Keyword arguments: {}
Result: 64
64


>>> @square_it
... @document_it
... def add_ints(a, b):
...     return a + b
...
>>> add_ints(3, 5)
Running function: add_ints
Positional arguments: (3, 5)
Keyword arguments: {}
Result: 8
64
```

## 命名空间和作用域

函数外部定义的变量叫做全局变量, 函数内是局部变量

```python
>>> def change_local():
...     animal = 'wombat'
...     print('inside change_local:', animal, id(animal))
...
>>> change_local()
inside change_local: wombat 4330406160
>>> animal
'fruitbat'
>>> id(animal)
4330390832
```
使用id函数可以返回对象由解释器生成的唯一身份标识
`id()` 函数的参数和返回值如下：
- 参数：`id()` 函数接受一个参数，即你想要获取身份标识的对象。
- 返回值：返回值是对象的唯一标识符，通常情况下，这个标识符是对象在内存中地址。

一个Module文件中所有的全局变量和局部变量都会存储在文档**字典**中( **字典方式存储** )
```python
>>> animal = 'fruitbat'
>>> def change_local():
...     animal = 'wombat' #局部变量
...     print('locals:',locals())
...
>>> animal
'fruitbat'
>>> change_local()
locals: {'animal':'wombat'}
>>> print('globals:', globals())  #表示时格式稍微发生变化
globals:{'animal': 'fruitbat',
'__doc__': None,
'change_local': <function change_it at 0x1006c0170>,
'__package__': None,
'__name__': '__main__',
'__loader__': <class '_frozen_importlib.BuiltinImporter'>,
'__builtins__': <module 'builtins'>}
>>> animal
>>> 'fruitbat'
```

## 异常和处理
每个异常类型都是一个` Exception `的一个子类。这也是为什么exception使用驼峰法以绿色字体出现, 其中包含了异常属性 \ 异常名称 \ traceback信息
使用`raise`关键字手动引发一场并自定义异常信息
1. `raise`：不带任何参数的 `raise` 会重新引发最近一次捕获的异常。
2. `raise ExceptionType`：引发一个指定类型的异常，但不提供异常信息。
3. `raise ExceptionType(message)`：引发一个指定类型的异常，并提供一个异常信息。
4. `raise ExceptionType(message).with_traceback(tb)`：引发一个指定类型的异常，并提供一个异常信息，同时还可以提供一个追踪回溯对象（traceback object）通常用于调试。

# 第五章  python盒子:模块、包、标准库

## 包和模块
**random**模块中`choice`方法
`choice(数据容器)`会从数据容器中抽取一个元素作为语句输出

**包**的本质是一个文件夹,但文件中`__init__.py`文件夹会被解释器认为这个文件是包

## 标准库中常用函数

读取字典中不存在的键的值会抛出异常。使用字典函数 get() 返回一个默认值会避免异常发生。函数 setdefault() 类似于 get()，但当键不存在时它会在字典中添加一项：

### setdefault()
读取字典中不存在的键的值会抛出异常。使用字典函数 get() 返回一个默认值会避免异常发生。函数 setdefault() 类似于 get()，但当键不存在时它会在字典中添加一项：
```python
>>> periodic_table = {'Hydrogen': 1, 'Helium': 2}
>>> print(periodic_table)
{'Helium': 2, 'Hydrogen': 1}
#如果键不在字典中，新的默认值会被添加进去：

>>> carbon = periodic_table.setdefault('Carbon', 12)
>>> carbon
12
>>> periodic_table
{'Helium': 2, 'Carbon': 12, 'Hydrogen': 1}
```
注意`setdefault`试图把一个不同的默认值赋给已经存在的键，不会改变原来的值，仍将返回初始值
```python
>>> helium = periodic_table.setdefault('Helium', 947)
>>> helium
2
>>> periodic_table
{'Helium': 2, 'Carbon': 12, 'Hydrogen': 1}
```

### defaultdict()

它返回一个类似字典的对象。这个对象是`dict`的子类，具有一个默认值的特性。当访问一个不存在的键时，`defaultdict`会自动为该键生成一个默认值，这个默认值由你提供的函数决定。
```python
from collections import defaultdict # 不同于setdefault,defaultdict不是内置关键字

# 创建一个defaultdict，指定默认值为int类型，即默认值为0
d = defaultdict(int)

# 访问一个不存在的键，它会自动创建键并设置默认值为0
d['a'] += 1
print(d['a'])  # 输出: 1

# 创建一个defaultdict，指定默认值为list类型
d_list = defaultdict(list)

# 访问一个不存在的键，它会自动创建键并设置默认值为空列表
d_list['b'].append(1)
print(d_list['b'])  # 输出: [1]

# 创建一个defaultdict，指定默认值为lambda函数，返回一个空字典
d_dict = defaultdict(lambda: {}) # 因python没有字典关键字
d_dict['c']['key'] = 'value'
print(d_dict['c'])  # 输出: {'key': 'value'}
```

```python
# 现在，任何缺失的值将被赋为整数 0：

>>> periodic_table['Hydrogen'] = 1
>>> periodic_table['Lead']
0
>>> periodic_table
defaultdict(<class 'int'>, {'Lead': 0, 'Hydrogen': 1})
```

```python
>>> from collections import defaultdict
>>> food_counter = defaultdict(int)   # 这句话的意思是创建一个
>>> for food in ['spam', 'spam', 'eggs', 'spam']:
...     food_counter[food] += 1
...
>>> for food, count in food_counter.items():
...     print(food, count)
...
eggs 1
spam 3
```

这段代码的执行逻辑是：
1. 初始化一个 `defaultdict`，其默认值类型为 `int`。
2. 遍历列表 `['spam', 'spam', 'eggs', 'spam']`，对于列表中每个元素 `food`：
	- 如果 `food` 已经存在于 `food_counter` 中，就将对应的值加 `1`。
	- 如果 `food` 不存在于 `food_counter` 中，`defaultdict` 会自动创建这个键，并将其值初始化为 `0`，然后加 `1`.
3. 最终，`food_counter` 中存储了每个食物出现的次数。
4. **注意** : `food_counter = defaultdict(int)` 的意思并不是创建一个名为 `food_count` 的字典，而是创建了一个名为 `food_counter` 的 `defaultdict` 对象，其默认值类型为 `int`。这意味着，当你尝试访问 `food_counter` 中不存在的键时，`defaultdict` 会自动为这个键生成一个默认值，这个默认值是 `int` 类型的，即 `0`。

### count()和most_common()**方法**
作用是返回一个列表中各个元素的出现次数并用字典方式存储在元组中,当参数为多个可迭代对象时一个元组中返回多个字典
```python
>>> from collections import Counter
>>> breakfast = ['spam', 'spam', 'eggs', 'spam']
>>> breakfast_counter = Counter(breakfast)
>>> breakfast_counter
Counter({'spam': 3, 'eggs': 1})
```

降序返回所有字典内容中所有key的value , 参数是控制返回多少个元素

### 使用有序字典OrderedDict()按键排序

使用元组创建字典, 列表囊括字典
```python
>>> from collections import OrderedDict
>>> quotes = OrderedDict([
...     ('Moe', 'A wise guy, huh?'),
...     ('Larry', 'Ow!'),
...     ('Curly', 'Nyuk nyuk!'),
...     ])
>>>
>>> for stooge in quotes:
...     print(stooge)
...
Moe
Larry
Curly
```

### 双端队列：栈+队列  扫描

```python
>>> def palindrome(word):
...     from collections import deque
...     dq = deque(word)
...     while len(dq) > 1:
...        if dq.popleft() != dq.pop():
...            return False
...     return True
...
...
>>> palindrome('a')
True
>>> palindrome('racecar')
True
>>> palindrome('')
True
```
`deque`创建双端队列，同时具有栈和队列的特征。它可以从序列的任何一端添加和删除项。 `popleft`和`pop`是他的方法,使用时达到自动**从两端向中间扫描序列能力**

[[[语言及其应用#^029420|反转字符串方法]]

### itertools迭代代码结构---各种方法

`tertools` 是 Python 标准库中一个模块，它提供了一系列用于创建和使用迭代器的工具。这些工具可以用来高效地处理数据流，组合多个迭代器，以及生成复杂的迭代模式。

`itertools` 模块中迭代代码结构通常用于创建无限或有限的迭代器序列，这些序列可以用于循环、数据处理、组合生成等场景。

#### **chain**
`itertools.chain` 它用于将多个迭代器连接成一个。可接受多个迭代器作参数，返回一个迭代器
```python
import itertools

# 创建几个列表
list1 = [1, 2, 3]
list2 = [4, 5, 6]
list3 = [7, 8, 9]

# 使用itertools.chain将列表连接成一个迭代器
combined = itertools.chain(list1, list2, list3)

# 遍历并打印连接后的迭代器中元素
for number in combined:
    print(number)
# output
1
2
3
4
5
6
7
8
9
```

#### **cycle**
返回在参数中无限循环的迭代器, 参数为列表
```python
>>> import itertools
>>> for item in itertools.cycle([1, 2]):
...     print(item)
...
1
2
1
2
.
.
.
```

#### accumulate自定义函数迭代器
默认计算累加和, 处理数据参数为列表, 不填写第二个参数默认累加操作,
```python
>>> import itertools
>>> for item in itertools.accumulate([1, 2, 3, 4]):
...     print(item)
...
1
3
6
10
```
第二个参数许为函数,定义了 " **累加** " 的两个对象的真实运算方法
```python
>>> import itertools
>>> def multiply(a, b):
...     return a * b
...
>>> for item in itertools.accumulate([1, 2, 3, 4], multiply):
...     print(item)
...
1
2
6
24
```

### 友好输出pprint()
将内容不在一行输出,想编写程序一样,有缩进,有空格, 有换行
```python
>>> from pprint import pprint
>>> quotes = OrderedDict([
...     ('Moe', 'A wise guy, huh?'),
...     ('Larry', 'Ow!'),
...     ('Curly', 'Nyuk nyuk!'),
...     ])

>>> pprint(quotes)
{'Moe': 'A wise guy, huh?',
 'Larry': 'Ow!',
 'Curly': 'Nyuk nyuk!'}
```

# 第六章 对象和类
## 描述对象和类

> **最好的描述**    [类和对象](Python%20Basics.md#^c8315c)
> 对象既包含数据（变量，更习惯称之为特性，attribute），也包含代码（函数，也称为方法）。它是某一类**具体事物**的特殊实例。
>
> 例如，整数 7 就是一个**包含了加法、乘法之类方**法的整数类的对象，可用`.`使用整数类中方法. 字符串 'cat' 和 'duck' 也是字符串对象，它们都包含着 capitalize() 和 replace() 之类的字符串方法。
>
> 当你想要创建一个别人从来没有创建过的新对象时，首先必须定义一个类，用以指明该类型的对象有的内容（特性和方法）。特性是对象的各种指标, 方法是对象能做出的动作
>
> 与模块不同，你可以同时创建许多同类的对象，它们的特性值可能各不相同。对象就像是包含了代码的超级数据结构。~~模块是包含了类的超超级数据结构~~

```python
>>> class Person():
...     def __init__(self, name):
...         self.name = name
```
`hunter = Person('Elmer Fudd')`代码实际做了以下工作：
1. 查看 Person 类的定义；
2. 在内存中实例化（创建）一个新的对象；
3. 调用对象的 __init__ 方法，将这个新创建的对象作为 self 传入，( 不传入`self`表示在创建类时初始化这个类时表明对象名指向这个类 )并将另一个参数（'Elmer-Fudd'）作为 name 传入；
4. 将 name 的值存入对象；
5. 返回这个新的对象；
6. 将名字 hunter 与这个对象关联。
## 继承和覆盖

### 原理
在子类中定义写父类中已有的成员,无论写了什么,都默认覆盖父类的定义, 定义没有的成员被认为是继承,
使用`super().`后面加父类成员明可以在需要重写父类成员的子类成员中调用父类成员, 对于方法`self`会自动传入, 只需在方法中填入父类成员需要传入的参数
```python
>>> class Person():
...     def __init__(self, name):
...         self.name = name

>>> class EmailPerson(Person):
...     def __init__(self, name, email):
...         super().__init__(name)
...         self.email = email
```

**熟悉的self参数到底在做什么**
```python
>>> car = Car()
>>> car.exclaim()
I'm a Car!
```
Python 在背后做了以下两件事情：
- 查找 car 对象所属的类（Car）；
- 把 car 对象作为 self 参数传给 Car 类所包含的 exclaim() 方法。
了解调用机制后，为了好玩，我们甚至可以像下面这样进行调用，这与普通的调用语法（`car.exclaim()`）效果完全一致：
```python
>>> Car.exclaim(car)
I'm a Car!
```
在类的定义中，以 self 作为第一个参数的方法都是实例方法（instance method）。它们在创建自定义类时最常用。实例方法的首个参数是 self，当它被调用时，Python 会把调用该方法的对象作为 self 参数传入。
### 使用命名重整防止访问外部特性
在类中命名特性时,前面加双下划线即可防止访问, 这种命名规范本质上并没有把特性变成私有，但 Python 确实将它的名字重整了. 使用  下划线 + 类名 +双下划线+特性明 仍可以访问
```python
>>> fowl = Duck('Howard')
>>> fowl.name
inside the getter
'Howard'
>>> fowl.name = 'Donald'
inside the setter
>>> fowl.name
inside the getter
'Donald'

# 看起来不错！现在，你无法在外部访问 __name 特性了：

>>> fowl.__name
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'Duck' object has no attribute '__name'

# 继续访问
>>> fowl._Duck__name
'Donald'
```
在Python类中，直接在类定义中定义的变量（不使用`self`前缀）是类的属性（也称为类变量或类特性），它们属于类本身，而不是类的任何特定实例。这些类属性在所有实例之间共享。

类中属性可以被成员方法调用,但调用类不会调用成员方法中变量. 其实本质上这是一种**层级关系**
```python
class A():
    count = 0  # 类属性
    time = 1054  # 类属性

    def stuff(self):
        A.count += 1  # 修改类属性
        self.object_stuff = "object stuff"
        self.object_var = "object var"
    def exclaim(self):
        print("I'm an A!")  # 实例方法
        self.object_stuff = "object var"
        self.object_var = "object stuff"
		# 顺序调换,两个方法调用顺序决定实例变量内容(重读定义会导致修改,其定义域是整个类)
    @classmethod
    def kids(cls):
        print("A has", cls.count, cls.time, "little Objects.")  # 类方法中调用只属于类的属性

object1 = A.exclaim()  # 在调用exclaim方法时其中便来你刚才会被创建
object2 = A.stuff()  # 同理,但和上面互不干涉而是用
class1 = A()    # 可以访问类中所有变量和方法,即class1.exclaim,而上面的Object加点只能访问其管辖域的内容
```
- 类属性`count`和`time`在所有实例之间共享，而实例属性`self.object_var`和`self.object_stuff`是每个实例独有的。
- 在成员方法中也可以不加`self`表示定义局部变量, 仅仅在本方法中有效,同理这些局部变量存在于方法中,,每个通过这个方法创建的实例都有
- 用类对象直接访问实例对象才有的局部变量会出现错误
- 实例变量：实例变量是与类的实例（对象）相关联的变量，**它们的作用域是整个类**。实例变量在**类的任何方法中都可以被访问和修改**，只要通过`self`关键字引用。实例变量在对象的生命周期内一直存在，直到对象被销毁。
- 局部变量：局部变量是在方法内部定义的变量，它们的作用域仅限于该方法。局部变量只能在定义它们的方法内部被访问，一旦方法执行完毕，这些局部变量就会被销毁
### 用静态方法从而不创建对象使用功能
```python
class CoyoteWeapon():
    @staticmethod
    def commercial():
        print('This CoyoteWeapon has been brought to you by Acme')

CoyoteWeapon.commercial()
>>>This CoyoteWeapon has been brought to you by Acme
>>># 不用创建任何 CoyoteWeapon 类的对象就可以调用这个方法，句法优雅不失风格！
```

### 关于多态(鸭子方法)
[多态](Python%20Basics.md#^0f4a2e)
Python 对实现多态（polymorphism）要求得十分宽松，这意味着我们可以对不同对象调用同名的操作，甚至不用管这些对象的类型是什么。
我们来为三个 Quote 类设定同样的初始化方法 __init__()，然后再添加两个新函数：
who() 返回保存的 person 字符串的值；
says() 返回保存的 words 字符串的内容，并添上指定的标点符号。
它们的具体实现如下所示：
```python
>>> class Quote():
...     def __init__(self, person, words):
...         self.person = person
...         self.words = words
...     def who(self):
...         return self.person
...     def says(self):
...         return self.words + '.'
...
>>> class QuestionQuote(Quote):
...     def says(self):
...         return self.words + '?'
...
>>> class ExclamationQuote(Quote):
...     def says(self):
...         return self.words + '!'
...
>>>
```

我们不需要改变 QuestionQuote 或者 ExclamationQuote 的初始化方式，因此没有覆盖它们的 __init__() 方法。Python 会自动调用父类 Quote 的初始化函数 __init__() 来存储实例变量 person 和 words，这就是我们可以在子类 QuestionQuote 和 ExclamationQuote 的对象里访问 self.words 的原因。
接下来创建一些对象：

```python
>>> hunter = Quote('Elmer Fudd', "I'm hunting wabbits")
>>> print(hunter.who(), 'says:', hunter.says())
Elmer Fudd says: I'm hunting wabbits.

>>> hunted1 = QuestionQuote('Bugs Bunny', "What's up, doc")
>>> print(hunted1.who(), 'says:', hunted1.says())
Bugs Bunny says: What's up, doc?

>>> hunted2 = ExclamationQuote('Daffy Duck', "It's rabbit season")
>>> print(hunted2.who(), 'says:', hunted2.says())
Daffy Duck says: It's rabbit season!
```

三个不同版本的 says() 为上面三种类提供了不同的响应方式，这是面向对象的语言中多态的传统形式。Python 在这方面走得更远一些，无论对象的种类是什么，只要包含 who() 和 says()，你便可以调用它。我们再来定义一个 BabblingBrook 类，它与我们之前的猎人猎物（Quote 类的后代）什么的没有任何关系：

```python
>>> class BabblingBrook():
...     def who(self):
...         return 'Brook'
...     def says(self):
...         return 'Babble'
...
>>> brook = BabblingBrook()
```

现在，对不同对象执行 who() 和 says() 方法，其中有一个（brook）与其他类型的对象毫无关联：

```python
>>> def who_says(obj):
...     print(obj.who(), 'says', obj.says())
...
>>> who_says(hunter)
Elmer Fudd says I'm hunting wabbits.
>>> who_says(hunted1)
Bugs Bunny says What's up, doc?
>>> who_says(hunted2)
Daffy Duck says It's rabbit season!
>>> who_says(brook)
Brook says Babble
```

这种方式有时被称作鸭子类型（duck typing），这个命名源自一句名言：
如果它像鸭子一样走路，像鸭子一样叫，那么它就是一只鸭子。

### 魔术方法
比较随缘,需要查文档才能知道作用,尤其是数学方面的比较方法
[官方文档](https://docs.python.org/3/reference/datamodel.html#special-method-names "需要魔法")

### 组合关系

不是继承关系,所以不存在相同名称方法复写
但由于直接调用对象作为参数,可以起到对不同类中重复方法名一种类似继承的调用

```python
>>> class Bill():
...     def __init__(self, description):
...         self.description = description
...
>>> class Tail():
...     def __init__(self, length):
...         self.length = length
...
>>> class Duck():
...     def __init__(self, bill, tail):
...         self.bill = bill
...         self.tail = tail
...     def about(self):
...         print('This duck has a', self.bill.description, 'bill and a', self.tail.length, 'tail')
...# duck未继承bill和tail,但可用其实例变量,尽管他们来自同一变量名,继承导致复写,组合不会
>>> tail = Tail('long')
>>> bill = Bill('wide orange')
>>> duck = Duck(bill, tail)
```
### 命名元组

#### 常规方式创建命名元组
```python
>>> from collections import namedtuple
>>> Duck = namedtuple('Duck', 'bill tail') # 写成('Duck', ['bill, tail'])更清晰
>>> # Duck是元组对象, bill和tail是这个命名元组的元素,相当于设定命名元组需要两个参数
>>> duck = Duck('wide orange', 'long')
>>> # 创建对象的实例,既然是实例就需要传入参数
>>> duck
Duck(bill='wide orange', tail='long')
# 命名元组是一种字典, 元组和类的缝合, 有两种格式的特性
>>> duck.bill
'wide orange'
>>> duck.tail
'long'
```
#### 通过字典方式创建命名元组
```python
>>> parts = {'bill': 'wide orange', 'tail': 'long'}
>>> duck2 = Duck(**parts)  # **parts是一种格式转换
>>> # 与这段代码相同:duck2 = Duck(bill = 'wide orange', tail = 'long')将字典内容转化为易于倍命名元组接受的格式
>>> duck2
Duck(bill='wide orange', tail='long')
>>>duck2.bill
wide orange
```
命名元组
- 有元组的特性, 内容不可修改,不能有重复的key值
- 有字典的特性,使用`key=value`\\`key:value`的类似于字典的形式赋值变量
- 有类的特性, 使用`.`访问命名元组元素`key`得到`value`.命名元组对象方法使用`._方法名`调用

# 第 7 章　像高手一样玩转数据
## 编码\字符串\解码
**ascii**   为最早的计算机编码:计算机的基本存储单元是字节（byte），它包含 8 位 / 比特（bit），可以存储 256 种不同的值。出于一些设计目的，**ASCII 只使用了 7 位（128 种取值）**：26 个大写字母、26 个小写字母、10 个阿拉伯数字、一些标点符号、空白符以及一些不可打印的控制符。
**Unicode**  每一种都有自己独特的名字和标识数。这些字符被分成了若干个 8 比特的集合，我们称之为平面（plane）。前 256 个平面为基本多语言平面（basic multilingual plane）。名称是用英文对字符的意义的简单描述语句

### python中查看并转换字符编码
Python 中 unicodedata 模块提供了下面两个方向的转换函数：
`lookup()`——接受不区分大小写的标准名称，返回一个 Unicode 字符；
`name()`——接受一个 Unicode 字符，返回大写形式的名称。

```python
>>> def unicode_test(value):
...     import unicodedata
...     name = unicodedata.name(value)
...     value2 = unicodedata.lookup(name)
...     print('value="%s", name="%s", value2="%s"' % (value, name, value2))

# 纯ascii字符
>>> unicode_test('A')
value="A", name="LATIN CAPITAL LETTER A", value2="A"
# test中无法输入的字符可以使用Unicode 编码指向----美分符号
>>>unicode_test('u00a2
value="€",name="CENTSIGN"v,alue2="€"
```
### 使用非ascii字符
显示`'café'`字符
```python
>> unicodedata.name('\u00e9')
'LATIN SMALL LETTER E WITH ACUTE'
# 接着，通过名称查询对应的编码值：

>>> unicodedata.lookup('E WITH ACUTE, LATIN SMALL LETTER')
"""代码报错,因Unicode 字符名称索引页列出的字符名称是经过修改的，因此与由 name() 函数得到的名称有所不同。如果需要将它们转化为真实的 Unicode 名称（**Python 使用的**），只需将逗号舍去，并将逗号后面的内容移到最前面即可。"""

>>> >>> unicodedata.lookup('LATIN SMALL LETTER E WITH ACUTE')
'é'
```
得到编码,就得到了字符在Unicode中具体位置, 是一个使用两字节,字节之间用十六进制表示的四位八进制数( 两位十六进制数 ), \u表示十六进制
字符串函数` len `可以计算字符串中 Unicode 字符的个数，而不是字节数：
```python
>>> len('$')
1
>>> len('\U0001f47b')
1
```
- 由于Unicode非常大,编码会浪费空间, 所以使用UTF-8动态为不同类型字符分配存储空间编码
- 所有被编码的对象(字符串)都是bytes类型变量
```python
>>> snowman = '\u2603'
>>> len(snowman)
1
# 下一步将这个 Unicode 字符编码为字节序列：
>>> ds = snowman.encode('utf-8')
```
就像我之前提到的，UTF-8 是一种变长编码方式。在这个例子中，单个 Unicode 字符 snowman 占用了 3 字节的空间：
```python
>>> len(ds)
3
>>> ds
b'\xe2\x98\x83'
```

在存储字符时需要Unicode可以用编号和普通字符混合编写
```python
>>> place = 'caf\u00e9'
>>> place
'café'
```
### encode()参数避免编码异常
第一是编码格式的字符串表示`encode="UTF-8`.
第二个参数来帮助你避免编码异常。它的默认值是 'strict'，当需要处理的字符串包含非 ASCII 字符时，会抛出` UnicodeEncodeError `异常。 'ignore' 会抛弃任何无法 进行编码的字符：
```python
# 'replace' 会将所有无法进行编码的字符替换为 ?：
>>> snowman.encode('ascii', 'replace')
b'?'
# 'backslashreplace' 则会创建一个和 unicode-escape 类似的 Unicode 字符串：
>>> snowman.encode('ascii', 'backslashreplace')
b'\\u2603'
# 如果你需要一份 Unicode 转义符序列的可打印版本，可以考虑使用上面这种方式。
>>> snowman.encode('ascii', 'xmlcharrefreplace')
b'&#9731;'
```

解码和编码方式不一直会导致内容不一或报错

## 格式化

%s	字符串
%d	十进制整数
%x	十六进制整数
%o	八进制整数
%f	十进制浮点数
%e	以科学计数法表示的浮点数
%g	十进制或科学计数法表示的浮点数
\%%	文本值 % 本身

在上面占位符后添加`% (变量名1 , 变量名2 )`根据占位格式进行插值操作

### 新式格式化
```python
>>> n = 42
>>> f = 7.03
>>> s = 'string cheese'
>>> '{} {} {}'.format(n, f, s)
'42 7.03 string cheese'
```
[索引符号问题](Python%20Basics.md#^cb4d6a)
```python
#可以使用类似位置传参,字典传参方式
>>> '{n} {f} {s}'.format(n=42, f=7.03, s='string cheese')
'42 7.03 string cheese'

#下面的例子中，我们试着将之前作为参数的 3 个值存到一个字典中，如下所示：

>>> d = {'n': 42, 'f': 7.03, 's': 'string cheese'}

#下面的例子中，{0} 代表整个字典，{1} 则代表字典后面的字符串 'other'：

>>> '{0[n]} {0[f]} {0[s]} {1}'.format(d, 'other')
'42 7.03 string cheese other'

# 指定参数格式
>>> '{0:d} {1:f} {2:s}'.format(n, f, s)
'42 7.030000 string cheese'

#新式格式化也支持其他各类设置（最小域宽、最大字符宽、排版，等等）。
#下面是一个最小域宽设为 10、右对齐（默认）的例子：
>>> '{0:10d} {1:10f} {2:10s}'.format(n, f, s)
'        42   7.030000 string cheese'

#与上面例子一样，但使用 > 字符设定右对齐显然要更为直观：
>>> '{0:>10d} {1:>10f} {2:>10s}'.format(n, f, s)
'        42   7.030000 string cheese'

#最小域宽为 10，左对齐：
>>> '{0:<10d} {1:<10f} {2:<10s}'.format(n, f, s)
'42         7.030000   string cheese'

#最小域宽为 10，居中：
>>> '{0:^10d} {1:^10f} {2:^10s}'.format(n, f, s)
'    42      7.030000  string cheese'

#新式格式化中无法使用类似.2f控制格式化精度
```

### 正则表达式

总体使用方法`result = re.匹配方法pattern(匹配规则, 匹配源Source)`
- match() 只能检测以模式串作为开头的源字符串
- search() 会返回字符串中首次成功匹配，如果存在的话；
- findall() 会返回所有不重叠的匹配，如果存在的话；
- split() 会根据 pattern 将 source 切分成若干段，返回由这些片段组成的列表；
- sub() 还需一个额外的参数 replacement，它会把 source 中所有匹配的 pattern 改成 replacement。
- 普通的文本值代表自身，用于匹配非特殊字符；
- 使用 . 代表任意除 \n 外的字符；
- 使用 * 表示任意多个字符（包括 0 个）；
- 使用 ? 表示可选字符（0 个或 1 个）。
-  \\\\d 一个数字字符
- \\\\D一个非数字字符
- \\\\w   一个字母或数字字符
- \\\\W   一个非字母非数字字符
- \\\\s   空白符
- \\\\S   非空白符
- \\\\b   单词边界（一个 \w 与\W 之间的范围，顺序可逆）
- \\\\B   非单词边界

参考[通过实例理解js正则表达]([hyy1115/RegExp-Learning: 学习正则表达式 (github.com)](https://github.com/hyy1115/RegExp-Learning?tab=readme-ov-file))
[工作常用正则表达式](../Attachments/工作常用正则表达式.md)
[开发常用正则表达式](../Attachments/开发常用正则表达式.md)
![learn\_regex-master.zip](../Attachments/learn_regex-master.zip)
### 二进制数据

`bytes()`&`bytearray`关键字创建字节型数据类型(**只能创建列表型)**
- 字节是不可变的，像字节数据组成的元组；
- 字节数组是可变的，像字节数据组成的列表
- `bytes`数据类型编码格式为: 以 b 开头，接着是一个单引号，后面跟着由十六进制数（例如 \x02）或 ASCII 码组成的序列，最后以配对的单引号结束。Python 会将这些十六进制数或者 ASCII 码转换为整数，如果该字节的值为有效 ASCII 编码则会显示 ASCII 字符。
- 使用`bytes()`关键字可以将**列表**转为bytes类型,不能使用对象`bytes对象名.[序号]`修改内容
```python
>> blist = [1, 2, 3, 255]
>>> the_bytes = bytes(blist)
>>> the_bytes
b'\x01\x02\x03\xff'
>>> the_byte_array = bytearray(blist)
>>> the_byte_array
bytearray(b'\x01\x02\x03\xff')


# 如果该字节的值为有效 ASCII 编码则会显示 ASCII 字符。
>>> b'\x61'
 b'a'

>>> b'\x01abc\xff'
 b'\x01abc\xff'


# 下面的例子说明了 bytes 类型的不可变性：

>>> the_bytes[1] = 127
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: 'bytes' object does not support item assignment

但 bytearray 类型的变量是可变的：

>>> the_byte_array = bytearray(blist)
>>> the_byte_array
bytearray(b'\x01\x02\x03\xff')
>>> the_byte_array[1] = 127
>>> the_byte_array
```

### 位运算符

对二进制数据进行逻辑运算时是以其二进制数据表示后按位运算得到结果的
[位运算知识]([位运算（&、|、^、~、>>、 | 菜鸟教程 (runoob.com)](https://www.runoob.com/w3cnote/bit-operation.html))
#### 1. 位运算概述

在现代计算机中，所有数据都以二进制形式存储，即 0 和 1 两种状态。计算机对二进制数据进行的运算（如加、减、乘、除）被称为位运算，即对二进制数的每一位进行操作的运算。

为了更好地理解位运算，举个简单的例子：假设我们有如下代码进行两个整数的加法运算：

int a = 35;
int b = 47;
int c = a + b;

计算机会将这两个整数转换为二进制形式，然后进行加法运算：
```
35:  0010 0011
47:  0010 1111
--------------
82:  0101 0010
```

因此，与直接使用 `+、-、*、/` 运算符相比，合理运用位运算可以显著提高代码在机器上的执行效率。
#### 2. 位运算概览

|符号|描述|运算规则|
|---|---|---|
|&|与|两个位都为1时，结果才为1|
|\||或|两个位都为0时，结果才为0|
|^|异或|两个位相同为0，相异为1|
|~|取反|0变1，1变0|
|<<|左移|各二进位全部左移若干位，高位丢弃，低位补0|
|>>|右移|各二进位全部右移若干位，高位补0或符号位补齐|

#### 3. 按位与运算符（&）

**定义**：对参与运算的两个数据的二进制位进行"与"运算。
**运算规则**：
0 & 0 = 0
0 & 1 = 0
1 & 0 = 0
1 & 1 = 1
**总结**：只有两位同时为1时，结果才为1，否则结果为0。
例如：`3 & 5` 即 `0000 0011 & 0000 0101 = 0000 0001`，因此 `3 & 5` 的值为1。
**注意**：负数按补码形式参与按位与运算。
**用途**：
1. **清零**：如果想将一个单元清零，只要与一个各位都为零的数值相与，结果为零。
2. **取一个数的指定位**：例如，取数 `X = 1010 1110` 的低4位，只需另找一个数 `Y = 0000 1111`，然后 `X & Y = 0000 1110` 即可得到 `X` 的指定位。
3. **判断奇偶**：通过判断最未位是0还是1来决定奇偶，可以用 `if ((a & 1) == 0)` 代替 `if (a % 2 == 0)` 来判断 `a` 是否为偶数。
#### 4. 按位或运算符（|）

**定义**：对参与运算的两个对象的二进制位进行"或"运算。
**运算规则**：
0 | 0 = 0
0 | 1 = 1
1 | 0 = 1
1 | 1 = 1
**总结**：只要有一个为1，其值为1。
例如：`3 | 5` 即 `0000 0011 | 0000 0101 = 0000 0111`，因此 `3 | 5` 的值为7。
**注意**：负数按补码形式参与按位或运算。
**用途**：

1. **设置某些位为1**：例如，将数 `X = 1010 1110` 的低4位设置为1，只需另找一个数 `Y = 0000 1111`，然后 `X | Y = 1010 1111` 即可得到。
#### 5. 异或运算符（^）
**定义**：对参与运算的两个数据的二进制位进行"异或"运算。
**运算规则**：
0 ^ 0 = 0
0 ^ 1 = 1
1 ^ 0 = 1
1 ^ 1 = 0
**总结**：相应位相同为0，相异为1。
**性质**：
1. 交换律
2. 结合律： `(a ^ b) ^ c == a ^ (b ^ c)`
3. 对于任何数 `x`，都有 `x ^ x = 0`，`x ^ 0 = x`
4. 自反性：`a ^ b ^ b = a ^ 0 = a`
**用途**：
1. **翻转指定位**：例如，将数 `X = 1010 1110` 的低4位翻转，只需另找一个数 `Y = 0000 1111`，然后 `X ^ Y = 1010 0001` 即可得到。
2. **与0相异或值不变**：例如 `1010 1110 ^ 0000 0000 = 1010 1110`
3. **交换两个数**：
void Swap(int &a, int &b) {
if (a != b) {
    a ^= b;
    b ^= a;
    a ^= b;
}
}
#### 6. 取反运算符（~）
**定义**：对参与运算的一个数据的二进制位进行"取反"运算。
**运算规则**：
~1 = 1111 1110
~0 = 1111 1111
即：
~1 = -2
~0 = -1
**总结**：将 0 变 1，1 变 0。
**用途**：
1. **使一个数的最低位为零**：例如，使 `a` 的最低位为0，可以表示为：`a & ~1`。`~1` 的值为 `1111 1111 1111 1110`，再按"与"运算，最低位一定为0。

#### 7. 左移运算符（<<）

**定义**：将一个运算对象的各二进制位全部左移若干位，高位丢弃，低位补0。
例如，设 `a = 1010 1110`，`a = a << 2` 将 `a` 的二进制位左移2位、右补0，即得 `a = 1011 1000`。
若左移时舍弃的高位不包含1，则每左移一位，相当于该数乘以2。

#### 8. 右移运算符（>>）

**定义**：将一个数的各二进制位全部右移若干位，高位补0或补符号位，右边丢弃。
例如，`a = a >> 2` 将 `a` 的二进制位右移2位，左补0 或补符号位，具体取决于数的正负。
操作数每右移一位，相当于该数除以2。
#### 9. 复合赋值运算符

位运算符与赋值运算符结合，组成新的复合赋值运算符，它们是：
- `&=` 例：`a &= b` 相当于 `a = a & b`
- `|=` 例：`a |= b` 相当于 `a = a | b`
- `>>=` 例：`a >>= b` 相当于 `a = a >> b`
- `<<=` 例：`a <<= b` 相当于 `a = a << b`
- `^=` 例：`a ^= b` 相当于 `a = a ^ b`
运算规则与前述的复合赋值运算符的运算规则相似。
**不同长度的数据进行位运算**：
如果两个不同长度的数据进行位运算，系统会将二者按右端对齐，然后进行位运算。
以"与运算"为例说明如下：
在C语言中，`long` 型占4个字节，`int` 型占2个字节。如果一个 `long` 型数据与一个 `int` 型数据进行"与运算"，右端对齐后，左边不足的位按以下三种情况补足：
1. 如果整型数据为正数，左边补16个0。
2. 如果整型数据为负数，左边补16个1。
3. 如果整型数据为无符号数，左边也补16个0。
例如：
```C
long a = 123;
int b = 1;
long result = a & b;

long a = 123;
unsigned int b = 1;
long result = a & b;
```

### 创建带有换行的超长文本串

在Python中，创建一个超长内容并包含换行的字符串内容可以通过多种方式实现。以下是一些常见的方法：

**使用三引号（`"""` 或 `'''`）

三引号允许你创建一个多行字符串，其中可以包含换行符和其他特殊字符。

```python
long_string = """
这是一个非常长的字符串，
它包含多个换行符。
"""
print(long_string)
```

**使用反斜杠（`\`）

在字符串的末尾使用反斜杠可以将下一行的字符串连接起来，形成一个长字符串。

```python
long_string = "这是一个非常长的字符串，\
它包含多个换行符。"
print(long_string)
```**使用括号

将字符串放在括号中可以创建多行字符串，无需使用反斜杠。

```python
long_string = ("这是一个非常长的字符串，"
               "它包含多个换行符。")
print(long_string)
```

**`str.join()`和列表

如果你有一个字符串列表，可以使用`str.join()`方法将它们连接成一个长字符串，每个元素之间可以插入换行符。

```python
lines = [
    "这是第一行。",
    "这是第二行。",
    "这是第三行。"
]
long_string = "\n".join(lines)
print(long_string)
```

**`format()`方法

`format()`方法可以用来格式化字符串，包括插入换行符。

```python
long_string = "{}\n{}\n{}".format("这是第一行。", "这是第二行。", "这是第三行。")
print(long_string)
```

**f-string（Python 3.6+）

f-string提供了一种非常方便的方式来插入变量和表达式到字符串中，包括换行符。

```python
long_string = f"""
这是第一行。
这是第二行。
这是第三行。
"""
print(long_string)
```

以上方法都可以用来创建包含换行符的长字符串。选择哪一种方法取决于你的具体需求和偏好。

# 第 8 章　数据的归宿
## open函数打开文件
`fileobj = open(filename, mode)`
下面是对该 open() 调用的简单解释：
- fileobj 是 open() 返回的文件对象；
- filename 是该文件的字符串名；
- mode 是指明文件类型和操作的字符串。
- mode 的第一个字母表明对其的操作。

第二个字母
- r 表示读模式。
- w 表示写模式。如果文件不存在则新创建，如果存在则重写新内容。
- x 表示在文件不存在的情况下新创建并写文件。
- a 表示如果文件存在，在文件末尾追加写内容。
- mode 的第二个字母是文件类型：
- t（或者省略）代表文本类型；
- b 代表二进制文件。

open函数做法时将文件加载到内存中读取, 所以不适合大文件
- `readline`每次一行内容, 在没行内容后加上换行符输出
- `readlines`读入所有行并返回单行字符串列表
### seek()和tell()改变和读取位置
Python 都会跟踪文件中位置。函数` tell() `返回距离文件开始处的字节偏移量。函数` seek() `允许跳转到文件其他字节偏移量的位置。

对于这个例子，使用之前写过的 256 字节的二进制文件 'bfile'：
```python
>>> fin = open('bfile', 'rb')
>>> fin.tell()
0

使用 seek() 读取文件结束前最后一个字节：

>>> fin.seek(255)
255
```
`seek(offset,origin)`
- 如果 origin 等于 0（默认为 0），从开头偏移 offset 个字节；
- 如果 origin 等于 1，从当前位置处偏移 offset 个字节；
- 如果 origin 等于 2，距离最后结尾处偏移 offset 个字节。
这种读取是一种光标的移动, 使用了`seek(255)`即表示光标从第一个移动到了最后一个,这时文件对象的第一个元素是源文件最后一个,即
```python
>>> fin.seek(255)
255
一直读到文件结束：
>>> bdata = fin.read()
>>> len(bdata)
1
>>> bdata[0]
255
```
使用逆序读取是光标移动方向不会改变,
```python
>>> fin = open('bfile', 'rb')

# 文件结尾前的一个字节：
>>> fin.seek(-1, 2)  # 2是模式,从结尾处仍向后偏移(结尾后没有元素,offset必须是负数)
255
>>> fin.tell()
255

# 一直读到文件结尾：

>>> bdata = fin.read()
>>> len(bdata)
1
>>> bdata[0]
255
```

### 重写csv文件(dictreader和writeheads)

#### dictreader
它用于读取 CSV 文件并将每行转换为一个字典。**允许通过列名（即字段名）访问每一列数据**，而不是通过列的索引位置。

`csv.DictReader` 可以接受以下参数：

- `f`：一个可迭代的文件对象。
- `fieldnames`：一个可选的字段名列表==(即表头)==。如果未提供，将使用文件第一行的值。
- `restkey`：如果某些行的列数少于 `fieldnames` 中字段数，剩余的**字段**将被归入一个列表，并以 `restkey` 作为键名。
- `restval`：如果某些行的列数少于 `fieldnames` 中字段数，剩余的**字段**将被赋予 `restval` 的值。
- `extrasaction`：如果某些行的列数多于 `fieldnames` 中字段数，可以设置为 `'raise'` 来抛出异常，或者 `'ignore'` 来忽略额外的列。
- `dialect`：指定 CSV 文件的方言，**如分隔符、引用字符**等。

`DictReader` 使得处理 CSV 文件时，可以通过列名来访问数据，极大地提高了代码的可读性和易用性。
```python
>>> import csv
>>> with open('villains', 'rt') as fin:
...     cin = csv.DictReader(fin, fieldnames=['first', 'last'])
...     villains = [row for row in cin]
```
- `csv.DictReader(fin, fieldnames=['first', 'last'])` 这行代码做了以下几件事：

    1.打开文件 `villains` 并创建一个文件对象 `fin`。
    2.使用 `DictReader` 读取文件对象 `fin`。`DictReader` 会自动读取文件的第一行作为字段名（除非你通过 `fieldnames` 参数显式指定）。
    3.`fieldnames=['first', 'last']` 参数指定了字典的键，即列名。如果 CSV 文件的第一行包含其他字段名，`DictReader` 会忽略它们，并使用这里提供的字段名。

#### writeheads

用于写入 CSV 文件的表头。`csv.DictWriter` 类用于将字典写入 CSV 文件，其中字典的键作为列标题，字典的值作为数据写入相应的列。
**不接受任何参数**的同时, 只接受`dictreader`对象作为调用对象,只能在其处理后调用写入表头

```python
data = [
    {'name': 'Joker', 'alias': 'Clown Prince of Crime'},
    {'name': 'Lex Luthor', 'alias': 'Genius'}
]

# 打开文件准备写入
with open('villains.csv', 'w', newline='') as csvfile:
    # 创建 DictWriter 对象，指定字段名
    fieldnames = ['name', 'alias']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    # 就算data已经是dictreader的格式,但他不是dictreader对象,还需要指定filenames
    # 写入表头
    writer.writeheader()
```

# 杂项
## 发送邮件脚本
### 简易硬编码参数版本
```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication


def send_mail(sender_email, receiver_email, sender_password):
    # 创建邮件
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = "带附件的邮件示例"

    # 添加邮件正文
    message.attach(MIMEText("这是一封带附件的邮件。", "plain"))

    # 添加附件
    with open("E:\\file_storage\\常用图片\\脚本属性页.png", "rb") as attachment:
        part = MIMEApplication(attachment.read(), Name="附件文件.png")
        part["Content-Disposition"] = 'attachment; filename="附件文件.png"'
        message.attach(part)

    # 连接到SMTP服务器并发送邮件
    try:
        with smtplib.SMTP("smtp.126.com", 25) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, receiver_email, message.as_string())
        print("带附件的邮件已发送成功！")
    except smtplib.SMTPAuthenticationError:
        print(
            "认证失败：请检查邮箱地址和授权码是否正确，并确认已在126邮箱设置中开启SMTP服务"
        )
    except smtplib.SMTPException as e:
        print(f"发送邮件时出错：{e}")
    except Exception as e:
        print(f"发生未知错误：{e}")


def main():
    sender_email = "AzzatoWaydell@126.com"
    receiver_email = "Sickwag@outlook.com"
    password = "H"  # 请替换为实际的授权码
    send_mail(sender_email, receiver_email, password)

main()
```
### 命令行解析参数版本
```python
import argparse
import smtplib
import os
import getpass
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication


def args_parser():
    parser = argparse.ArgumentParser(
        prog="email-sender", description="parse email sending arguments.",
        epilog="\nusage:\n\t python email_sender_cli.py -s sender@126.com -r receiver@qq.com -p \"app password\" -m \"test\" -a \"E:\\image.png\""
    )
    parser.add_argument(
        "-s","--sender",
        type=str,
        default="AzzatoWaydell@126.com",
        action="store",
        help="the sender address.",
    )
    parser.add_argument(
        "-p","--password",
        type=str,
        default=None,
        required=True,
        help="sender's password(maybe have to use app password instead account password.)",
    )
    parser.add_argument(
        "-r", "--receiver", type=str, nargs="+", help="receiver addresses"
    )
    parser.add_argument("-m","--message", type=str, default=None, help="")
    parser.add_argument("--subject", type=str, default=None, help="email subject.")
    parser.add_argument("--username", type=str, default=None,help="the smtp authorization username, default same as your sender email.")
    parser.add_argument(
        "--smtp", type=str, default="smtp.126.com", help="smtp service url address"
    )
    parser.add_argument(
        "-a","--attach", type=str, nargs="*", help="input filepaths you wanna attach to, avoid to use path includes Chinese characters which may cause unstable parsing."
    )
    parser.add_argument("--port", type=int, default=25, help="smtp service port.")

    args = parser.parse_args()
    if args.message is None:
        args.message = f"this is a simple email from {args.sender}"

    if args.username is None:
        args.username = args.sender

    if args.receiver is None:
        parser.error("you have not set receiver")

    if args.password is None:
        # parser.error("you have not set password")
        args.password = getpass.getpass("you have not input sender password, try again:")

    if not args.sender.endswith("@126.com") and (args.smtp == "smtp.126.com" and args.port == 25):
        parser.error(
            "when you point sender address not use 126 email, you must change --smtp to reset smtp service address and port."
        )

    return args


def send_email(args):
    email = MIMEMultipart()
    email["From"] = args.sender
    email["To"] = ", ".join(args.receiver)
    email["Subject"] = args.subject
    MIMEText(args.message, "plain", "utf-8")
    email.attach(payload=MIMEText(f"{args.message}", "plain"))

    if args.attach:
        for file_path in args.attach:
            with open(file=file_path, mode='rb') as attachment:
                part = MIMEApplication(attachment.read(), Name=file_path)
                part["Content-Disposition"] = f'attachment; filename={os.path.basename(file_path)}'
                email.attach(part)

    try:
        with smtplib.SMTP(args.smtp, args.port) as server:
            server.starttls()
            server.login(user=args.username,password=args.password)
            server.sendmail(args.sender, to_addrs=args.receiver, msg=email.as_string())
        print("email send successfully")
    except smtplib.SMTPAuthenticationError:
        print(
            "authorization fail, check whether your mailbox open SMTP service or you have use app password instead account password."
        )
    except smtplib.SMTPException as e:
        print(f"fatal error: {e}")
    except Exception as e:
        print(f"unexpected error: {e}")
    return

def start():
    args = args_parser()
    send_email(args=args)

start()
```