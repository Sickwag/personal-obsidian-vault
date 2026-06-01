## 一、教练，我想学 Python

> 车上有座，坐满就发车。
### 1.1 有编程基础：explore-python
- 项目地址：[https://github.com/ethan-funny/explore-python](https://github.com/ethan-funny/explore-python)
- 在线阅读：[https://funhacks.gitbooks.io/explore-python/content/](https://funhacks.gitbooks.io/explore-python/content/)
#### 函数
##### 函数参数魔法
- 定义可变参数
```python
>>> def add(*numbers):
...     sum = 0
...     for i in numbers:
...         sum += i
...     print 'numbers:', numbers
...     return sum
```
可以输入任意个数参数
- 关键字参数
可变参数允许你将不定数量的参数传递给函数，而**关键字参数**则允许你将不定长度的**键值对**, 作为参数传递给一个函数。
```python
>>> def add(**kwargs):
    return kwargs
>>> add()            # 没有参数，kwargs 为空字典
{}
>>> add(x=1)         # x=1 => kwargs={'x': 1}
{'x': 1}
>>> add(x=1, y=2)    # x=1, y=2 => kwargs={'y': 2, 'x': 1}
{'y': 2, 'x': 1}
```
kwargs 可以接收不定长度的键值对，加 `**` 在函数内部，它会表示成一个 dict。
```python
>>> def add(x, y, z):
...     return x + y + z
...
>>> dict1 = {'z': 3, 'x': 1, 'y': 6}
>>> add(dict1['x'], dict1['y'], dict1['z'])    # 这样传参很累赘
10
>>> add(**dict1)        # 使用 **dict1 来传参，等价于上面的做法
10
```
#### 函数式编程
##### 高阶函数
一个函数接收另一个函数作为参数，这种函数称之为**高阶函数（Higher-order Functions**）
```python
def func(g, arr):
    return [g(x) for x in arr]
```
###### map/reduce/filter
`map` 函数的使用形式如下：
```python
map(function, sequence)
```
**解释**：对 sequence 中 item 依次执行 function(item)，并将结果组成一个 List 返回，也就是：
```python
[function(item1), function(item2), function(item3), ...]
```
使用实例：
```python
>>> map(lambda x: x * x, [1, 2, 3, 4])   # 使用 lambda
[1, 4, 9, 16]

def double(x):
    return 2 * x

def triple(x):
    return 3 *x

def square(x):
    return x * x

funcs = [double, triple, square]  # 列表元素是函数对象
# 相当于 [double(4), triple(4), square(4)]
value = list(map(lambda f: f(4), funcs))
```
---
`filter` 函数用于过滤元素，它的使用形式如下：
```python
filter(function, sequnce)
```
**解释**：将 function 依次作用于 sequnce 的每个 item，即 function(item)，将返回值为 True 的 item 组成一个 List/String/Tuple (**取决于 sequnce 的类型**，python3 统一返回迭代器) 返回。

`reduce` 函数的使用形式如下：
```python
reduce(function, sequence[, initial])
```
**解释**：先将 sequence 的前两个 item 传给 function，即 function(item1, item2)，函数的返回值和 sequence 的下一个 item 再传给 function，即 function(function(item1, item2), item3)，如此迭代，直到 sequence 没有元素，如果有 initial，则作为初始值调用。

也就是说：

```python
reduece(f, [x1, x2, x3, x4]) = f(f(f(x1, x2), x3), x4)
```

##### 携带状态的闭包
一个函数返回了一个内部函数，该内部函数引用了外部函数的相关参数和变量，我们把该返回的内部函数称为**闭包（Closure）**。
**“带着自己出生环境（外层局部变量）一起跑路的函数”**；它的本质是**把代码（函数对象）和当时捕获到的变量环境一起打包成一个新的可调用对象**。
```python
from math import pow

def make_pow(n):
    def inner_func(x):     # 嵌套定义了 inner_func
        return pow(x, n)   # 注意这里引用了外部函数的 n
    return inner_func
```
闭包的最大特点就是引用了自由变量，即使生成闭包的环境已经释放，闭包仍存在
```python
>>> pow2 = make_pow(2)  # pow2 是一个函数，参数 2 是一个自由变量
>>> pow2
<function inner_func at 0x10271faa0>
>>> pow2(6)
36.0
>>> del make_pow         # 删除 make_pow
>>> pow3 = make_pow(3)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
NameError: name 'make_pow' is not defined
>>> pow2(9)     # pow2 仍可正常调用，自由变量 2 仍保存在 pow2 中
81.0
```
最大的作用是：
1. **延迟计算 / 惰性求值**：把参数先部分填好，真正要用时再给剩余参数。
2. **信息隐藏**：用闭包代替类，保护内部状态不被外部直接修改。
3. **减少重复传参**：把公共配置提前“绑死”。
4. C/C++ 语言中，函数返回后，栈帧销毁，局部变量就消失；无法在异步/回调中记住“当时状态”，想调用函数需要考虑各种函数需要的变量的生命周期必须要长于函数本身。
常见误区是：
```python
def count():
    funcs = []
    for i in [1, 2, 3]:
        def f():
            return i  # 注意这里return i
        funcs.append(f)
    return funcs
```
原因在于上面的函数 `f` 引用了变量 `i`，但函数 `f` 并非立刻执行，当 `for` 循环结束时，此时变量 `i` 的值是3，`funcs` 里面的函数引用的变量都是 3，最终结果也就全为 3。

> [!note]
>闭包 = 函数 + 当时的环境快照，用得好是“轻量级的状态机”，用不好则成为“隐晦的内存坑”。

当时的**环境快照**指的是创建函数
1. 闭包确实保存了“当时的环境”，但环境里放的是 _变量 `i` 的引用_，而不是 _整数值 0、1、2_
2. 循环过程中 `i` 的值在不断变化，而闭包里的代码只有在 **真正调用 `f()`** 时才去查这个引用。此时循环早已结束，`i` 已固定为 2。

想要“拍快照”就必须在创建 `lambda` 时把当时的值 **按默认参数** 传进去，这样闭包里就存的是常量而不是变量
```python
funcs = [lambda i=i: i for i in range(3)]
print([f() for f in funcs])   # [0, 1, 2]
```
#### 装饰器
```python
def hello():
    return 'hello world'

def makeitalic(func):
    def wrapped():
        return "<i>" + func() + "</i>"
    return wrapped

>>> hello = makeitalic(hello)  # 将 hello 函数传给 makeitalic
>>> hello()
'<i>hello world</i>'
>>> hello.__name__
'wrapped'
```
函数型装饰器可以带有参数，参数定义在对应的函数签名位置。
类装饰器：
```cpp
class Bold(object):
    def __init__(self, func):
        self.func = func

    def __call__(self, *args, **kwargs):
        return '<b>' + self.func(*args, **kwargs) + '</b>'

@Bold
def hello(name):
    return 'hello %s' % name

>>> hello('world')
'<b>hello world</b>'
```
类装饰器的参数写在装饰器上：
```python
class Tag(object):
    def __init__(self, tag):
        self.tag = tag

    def __call__(self, func):
        def wrapped(*args, **kwargs):
            return "<{tag}>{res}</{tag}>".format(
                res=func(*args, **kwargs), tag=self.tag
            )
        return wrapped

@Tag('b')
def hello(name):
    return 'hello %s' % name
```
使用装饰器有一个瑕疵，就是被装饰的函数，它的函数名称已经不是原来的名称
```python
def makeitalic(func):
    def wrapped():
        return "<i>" + func() + "</i>"
    return wrapped

@makeitalic
def hello():
    return 'hello world'
```
函数 `hello` 被 `makeitalic` 装饰后，它的函数名称已经改变了：
```python
>>> hello.__name__
'wrapped'
```
解决方法是在内部装饰其中提供Python 中 functools 包提供了 wraps 装饰器
```python
from functools import wraps

def makeitalic(func):
    @wraps(func)       # 加上 wraps 装饰器
    def wrapped():
        return "<i>" + func() + "</i>"
    return wrapped

@makeitalic
def hello():
    return 'hello world'

>>> hello.__name__
'hello'
```
#### partial 函数
`functools.partial` 就是“**提前把一部分参数喂给函数，剩下来的以后再喂**”，本质是**把一个已有函数及其部分参数打包成一个可调用对象**，从而得到一个新的“简化版”函数。
```python
def multiply(x, y):
    return x * y
```
通过下面方式可以绑定 exp 参数值为 2
```python
from functools import partial

def power(base, exp):
    return base ** exp

square = partial(power, exp=2)   # 把 exp 绑成 2
print(square(5))
```
注意：
1. **位置参数必须按顺序绑定**，一旦绑错无法“跳过”。
2. **关键字参数会覆盖后续同名关键字**。
3. **可变性陷阱**：如果绑定了一个可变对象（如列表、dict），所有 `partial` 实例共享同一对象，易踩坑。
```python
from functools import partial

def append_and_sort(x, items):
   items.append(x)
   items.sort()
   return items
# 错误示范：列表字面量只在定义 partial 时生成一次
bad_sort = partial(append_and_sort, items=[])

print(bad_sort(3))   # [3]
print(bad_sort(1))   # [1, 3]  <-- 继续用同一个列表！
print(bad_sort(2))   # [1, 2, 3]
```
4. 绑定参数后**不能解绑**，但可以**复制提取**其中对象。
```python
original = power   # 提前备份是一种方法
square = partial(power, exp=2)
# 想恢复时直接用 original
# -------------------------------------或者
 original = square.func   # 原函数获取
 fixed_args = square.args      # 已绑定的位置参数
 fixed_kwargs = square.keywords   # 已绑定的关键字参数
 # 调用时手动剔除
```
### 类
使用 `type(obj)` 来获取对象的相应类型：
使用 `isinstance(obj, type)` 判断对象是否为指定的 type 类型的实例：
使用 `hasattr/getattr/setattr`
- 使用 `hasattr(obj, attr)` 判断对象是否具有指定属性/方法；
- 使用 `getattr(obj, attr[, default])` 获取属性/方法的值, 要是没有对应的属性则返回 default 值（前提是设置了 default），否则会抛出 AttributeError 异常；
- 使用 `setattr(obj, attr, value)` 设定该属性/方法的值，类似于 obj.attr=value；
- 使用 `dir(obj)` 可以获取相应对象的**所有**属性和方法名的列表：
#### 魔法方法
在 Python 中，当我们创建一个类的实例时，类会先调用 `__new__(cls[, ...])` 来创建实例，然后 `__init__` 方法再对该实例（self）进行初始化。
`__str__` 方法定义出使用类似 `print()` 函数打印**类的实例**时显示的信息
`__repr__` 方法定义直接应用函数时显示的信息
```python
class Foo(object):
    def __init__(self, name):
        self.name = name
    def __str__(self):
        return 'Foo object (name: %s) by print' % self.name
    def __repr__(self):
        return 'Foo object (name: %s) by refer' % self.name

>>> Foo('ethan')
'Foo object (name: ethan) by refer' # 否则显示内存地址<__main__.Foo at 0x10c37a490>
>>> print(Foo('ethan'))
'Foo object (name: ethan) by print' # <__main__.Foo object at 0x10c37aa50>
```

在某些情况下，我们希望实例对象可被用于 `for...in` 循环，这时我们需要在类中定义 `__iter__` 和 `next`（在 Python3 中是 `__next__`）方法，其中，`__iter__` 返回一个迭代对象，`next` 返回容器的下一个元素，在没有后续元素时抛出 `StopIteration` 异常。
```python
class Fib(object):
    def __init__(self):
        self.a, self.b = 0, 1

    def __iter__(self):  # 返回迭代器对象本身
        return self

    def next(self):      # 返回容器下一个元素
        self.a, self.b = self.b, self.a + self.b
        return self.a

>>> fib = Fib()
>>> for i in fib:
...     if i > 10:
...         break
...     print i
...
```

希望可以使用 `obj[n]` 这种方式对实例对象进行取值，比如对斐波那契数列，我们希望可以取出其中某一项，这时我们需要在类中实现 `__getitem__` 方法
```python
class Fib(object):
    def __getitem__(self, n):
        a, b = 1, 1
        for x in xrange(n):
            a, b = b, a + b
        return a

>>> fib = Fib()
>>> fib[0], fib[1], fib[2], fib[3], fib[4], fib[5] # 本质上是像数组一样访问类中对象
(1, 1, 2, 3, 5, 8)
```
支持切片操作
```python
class Fib(object):
    def __getitem__(self, n):
        if isinstance(n, slice):   # 如果 n 是 slice 对象
            a, b = 1, 1
            start, stop = n.start, n.stop
            L = []
            for i in xrange(stop):
                if i >= start:
                    L.append(a)
                a, b = b, a + b
            return L
        if isinstance(n, int):     # 如果 n 是 int 型
            a, b = 1, 1
            for i in xrange(n):
                a, b = b, a + b
            return a
```
#### 动态绑定属性
```python
class Point(object):
    def __init__(self, x=0, y=0):
        self.x = x
        self.y = y

>>> p = Point(3, 4)
>>> p.z = 5    # 绑定了一个新的属性
```
python 允许给实例动态绑定属性，这会造成管理困难并且消耗内存：
- **slots** 魔法：限定允许绑定的属性.
- `__slots__` 设置的属性仅对当前类有效，对继承的子类不起效，除非子类也定义了 slots，这样，子类允许定义的属性就是自身的 slots 加上父类的 slots。
python 会将所有属性通过 `__dict__` 属性，也就是一个字典来存储，设置 `__slots__` 就是“**把类变成 C 语言里的结构体**”，本质是用**固定数组**而不是**可变字典**来存放实例属性，从而省内存、限属性、加速访问
它的作用&影响
- **省内存**：没有每个实例都带一个 `__dict__`，大量小对象时差异明显。
- **防拼写错**：写错属性名立即抛异常，而不是悄悄新建一个键。
- **查找更快**：数组偏移访问比哈希表 O(1) 更稳定、CPU cache 友好。
- **限制随意加属性**：接口更“契约化”。
- **不能再动态增删属性**，除非把名字提前写进 `__slots__`。
- **多重继承麻烦**：
    - 若父类有 `__dict__` 而子类想用 `__slots__`，必须显式在子类再声明 `'__dict__'` 才能继续动态加属性；否则 `AttributeError`。
- **弱引用 & 私有变量**：
    - 需要 `__weakref__` 时得显式加入 `__slots__ = ('x', '__weakref__')`。
- **与 `@dataclass(slots=True)` 混用**：Python 3.10+ 原生支持，避免手写冗长列表。
- **调试信息变少**：`vars(obj)` 会失败；需要 `obj.__slots__` 才能看有哪些槽位。
- **子类不继承父类 slots**；想继续省内存，要在子类再写一遍。
- **pickle/拷贝**：大多数序列化库对 `__slots__` 支持良好，但若自己实现 `__getstate__/__setstate__` 需手动处理槽位。
#### 其他功能
##### @property 装饰器
“**把方法伪装成属性**”，本质是一个**数据描述符（data descriptor）**，让你用“点号取值/赋值/删值”的简洁语法，背后却跑着你写的 Python 代码。
```python
class Celsius:
    def __init__(self, temperature=0):
        self._t = temperature

    @property                 # 读，默认为设置getter
    def temperature(self):
        print('get')
        return self._t

    @temperature.setter       # 写，如果不定义，则_t为可读
    def temperature(self, value):
        if value < -273.15:
            raise ValueError('Too cold')
        print('set', value)
        self._t = value

    @temperature.deleter      # 删
    def temperature(self):
        print('del')
        del self._t

c = Celsius()
c.temperature = 37   # 触发 setter
print(c.temperature) # 触发 getter
del c.temperature    # 触发 deleter
```
##### 使用 `type` 创建类
下面这两种声明类的方法等价：
```python
class Foo(object):
    foo = True
    def greet(self):
        print 'hello world'
        print self.foo
# ------------------------------
def greet(self):
    print 'hello world'
    print self.foo

Foo = type('Foo', (object, ), {'foo': True, 'greet': greet})
```
- 第 1 个参数是字符串 'Foo'，表示类名
- 第 2 个参数是元组 (object, )，表示所有的父类
- 第 3 个参数是字典，这里是一个空字典，表示没有定义属性和方法
实际上第二种方法和第一种有一点不同的是，`greet` 函数会作为匿名函数创建，最后赋值到一个名为 greet 的对象中。不然 greet 函数的作用于（生命周期）**不会局限在 Fool 类中**
##### 元类
元类（metaclass）就是「类的类」——**你写的 `class` 语句在解释器眼里其实是一次函数调用，真正创建并返回这个类对象的是元类**。
1. 本质
- 所有类都是 `type` **或其子类** 的实例。
- `type(name, bases, dict)` 才是解释器在背后执行的那一步。
- 你自定义一个 `MyMeta(type)`，就可以拦截并改造「工厂图纸」，决定新类长什么样。
- 当你发现“**对每个类都想偷偷干点什么**”时，就是元类出场时；否则，十有八九用类装饰器或 `__init_subclass__` 就够了。
```python
class PrefixMetaclass(type):
    def __new__(cls, name, bases, attrs):
        # 给所有属性和方法前面加上前缀 my_
        _attrs = (('my_' + name, value) for name, value in attrs.items())

        _attrs = dict((name, value) for name, value in _attrs)  # 转化为字典
        _attrs['echo'] = lambda self, phrase: phrase  # 增加了一个 echo 方法

        return type.__new__(cls, name, bases, _attrs)  # 返回创建后的类
```
使用实例：
```python
class Foo(metaclass=PrefixMetaclass):
    name = 'foo'
    def bar(self):
        print 'bar'
```
注意事项：
1. **99% 场景用不到**——优先用类装饰器、`__init_subclass__`、dataclass。
2. **多重继承冲突**：如果一个类试图继承两个带不同元类的基类，会抛 `TypeError: metaclass conflict`。
3. **破坏可读性**：调试时栈里会出现 `MyMeta.__new__`/`__init__`，不熟悉的人看不懂。
4. **与 `__slots__` / `__init_subclass__` 混用**：先后顺序要清楚，否则属性会被覆盖。
5. 这种元类派生出子类的方式是**隐式继承**的
### 高级特性
#### 迭代
**在 Python 中，迭代器是指遵循迭代器协议（iterator protocol）的对象。**
可迭代对象（Iterable）＝“**能被 for 循环的东西**”；
迭代器（Iterator）＝“**真正干活的运输小车**”，它记住当前位置，每次 `next()` 吐一个元素。

python 协议只有两条：
- 只要类实现了 `__iter__` → 可迭代；
- 如果 `__iter__` 返回自身且还有 `__next__` → 就是迭代器。
内置 list 是可迭代对象：

```python
# 内置 list 是可迭代对象
books = ['py', 'go', 'rust']
it = iter(books)     # 书架→借书小车
next(it)             # 'py'
next(it)             # 'go'
```
可以使用两种方法判断一个对象是否可以迭代：
```python
>>> hasattr((), '__iter__')
True
>>> from collections import Iterable
>>> isinstance((), Iterable)        # 元组
True
```
自定义结构让它可迭代
方案 A：把实例变成“迭代器”
```python
class Squares:
    def __init__(self, n):
        self.i = 0
        self.n = n
    def __iter__(self):       # 迭代器协议
        return self
    def __next__(self):       # 迭代器协议
        if self.i >= self.n:
            raise StopIteration
        val = self.i ** 2
        self.i += 1
        return val
for x in Squares(5):
    print(x, end=' ')   # 0 1 4 9 16
```
方案 B：把实例变成“可迭代对象”，每次返回新迭代器（更常见、可多次遍历）
```python
class Node:
    def __init__(self, value, left=None, right=None):
        self.value, self.left, self.right = value, left, right
    def __iter__(self):
        """中序遍历二叉树：可迭代对象返回生成器迭代器"""
        if self.left:
            yield from self.left
        yield self.value
        if self.right:
            yield from self.right
tree = Node(2, Node(1), Node(3))
print(list(tree))   # [1, 2, 3]
```
为什么不用 `print(tree)`？因 print 会默认查找对象的 `__str__` 方法，Node 对象没有定义这个方法（没有就退而求其次 `__repr__()`），所以会返回内存地址。而 List 化的 Node 对象。只要传进 list 的对象满足**可迭代协议**（即实现了 `__iter__`），`list()` 就能通过 `iter()` / `next()` 把元素逐个拿光，再组装成一个新的列表返回。
两个函数的解释：
- `__iter__` 的职责只有一句：
	“请 return 给我一个 **迭代器**”。
- `__next__` 的职责也只有一句：
	“把下一项 return 给我，没了就抛 `StopIteration`”。
	因此不存在“**iter** 设置迭代器迭代到下一个对象”这种说法；它只是**返回**迭代器，而“下一个对象”由迭代器自己决定。

`for` 循环就是先通过对象的成员函数 `iter()` 获得一个迭代器，然后不断调用 `next()` 函数实现。

#### 生成器
##### 方法一：将列表生成式的 `[]` 改为 `()`
```python
>>> L = [x * x for x in range(10)]
>>> L
[0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
>>> g = (x * x for x in range(10))
>>> g
<generator object <genexpr> at 0x1022ef630>
```
每一个 generator 对象，都支持 `__next__` 方法，所以可以通过 `next()` 内置函数查找到下一个对象。
```python
>>> next(g)
0
>>> next(g)
1
>>> next(g)
4
>>> next(g)
9
>>> next(g)
16
>>> next(g)
25
>>> next(g)
36
>>> next(g)
49
>>> next(g)
64
>>> next(g)
81
>>> next(g)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
StopIteration
```
斐波那契数列可以通过下面实现
```python
def fib(max):
    n, a, b = 0, 0, 1
    while n < max:
        print(b)
        a, b = b, a + b
        n = n + 1
    return 'done'
```

赋值语句：
```python
a, b = b, a + b
```
相当于：
```python
t = (b, a + b) # t是一个tuple
a = t[0]
b = t[1]
```
`fib` 函数实际上是定义了斐波拉契数列的推算规则，可以从第一个元素开始，推算出后续任意的元素，这种逻辑其实非常类似generator。这就是方案二的做法。
##### 方案二：添加 `yield` 关键字
要把 `fib` 函数变成generator函数，只需要把 `print(b)` 改为 `yield b` 就可以了
