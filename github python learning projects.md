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
**解释**：对 sequence 中的 item 依次执行 function(item)，并将结果组成一个 List 返回，也就是：
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
闭包的最大特点就是引用了自由变量，即使生成闭包的环境已经释放，闭包仍然存在
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
解决方法是在内部装饰其中提供Python 中的 functools 包提供了 wraps 装饰器
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
#	items = [] if items is None else items # 添加这一行即可解决
   items.append(x)
   items.sort()
   return items

# ❌ 错误示范：列表字面量只在定义 partial 时生成一次
bad_sort = partial(append_and_sort, items=[])

print(bad_sort(3))   # [3]
print(bad_sort(1))   # [1, 3]  <-- 继续用同一个列表！
print(bad_sort(2))   # [1, 2, 3]
   ```
4. 绑定参数之后**不能解绑**，但可以**复制提取**其中对象。
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