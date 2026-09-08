- 遇见的问题
    - 约定俗成命名规则
        - 根据约定,python首字母大写的名称指的是类, 并且使用大小驼峰命名法
    - 显示调用和隐式调用

        ### **显示调用（Explicit Call）**

        显示调用是指在代码中明确指定要调用的方法或函数，并且提供所有必要的参数。这种方式下，调用者清楚地知道正在调用哪个方法，以及传递了哪些参数。在Python中，显示调用通常使用方法名后跟括号来实现，例如：

        ```Python
        class MyClass:
            def my_method(self):
                print("Method called")

        obj = MyClass()
        obj.my_method()  # 显示调用
        ```

        ### **隐式调用（Implicit Call）**

        隐式调用是指方法或函数的调用不是直接在代码中明确指定的，而是由某些操作或机制自动触发的。在面向对象编程中，一个常见的隐式调用是当创建一个对象时，构造函数（`__init__`方法）被自动调用。在Python中，隐式调用通常是由语言的内部机制或框架自动处理的，例如：

        ```Python
        class MyClass:
            def __init__(self):
                print("Constructor called")

        obj = MyClass()  # 隐式调用构造函数, 即使用这个类的对象时自动
        								# 执行__init__ ,不用obj.__init__()
        ```

# 第九章 类
## 9.1 类
对于每个类中 方法的self参数
```Python
class Dog:
❷     """一次模拟小狗的简单尝试。"""
			------------------------------
			-----------------------------
❸     def __init__(self, name, age):
          """初始化属性name和age。"""
❹         self.name = name
          self.age = age
❺     def sit(self):
          """模拟小狗收到命令时蹲下。"""
          print(f"{self.name} is now sitting.")
      def roll_over(self):
          """模拟小狗收到命令时打滚。"""
          print(f"{self.name} rolled over!")
```
- 为何必须在方法定义中包含形参self 呢？因Python调用这个方法来创建Dog 实例时，将自动传入**实参self** 。每个与实例相关联的方法调用都自动传递实参self ，它是一个指向实例本身的引用，**让实例能够访问类中属性和方法**。即虚线部分成员变量和方法
- self参数的意思是指向实例本身,实例本身是一个类传入参数得到的,所以引用本身意在调用这个类.使实例可以使用其中成员
- 这也是为什么类名称不写(self)而类中方法必须写self原因,不然实例没办法调用自己所对应类中功能
- **在方法内****[Form Scratch to Practice](Form%20Scratch%20to%20Practice.md)****都可以被所有类中方法使用**
- 对任何一类,初始化类的是所有的魔术方法设置这个类应有的属性\变量
餐馆实例练习
```Python
class Restaurant :
    def __init__(self) -> None:
        self.restaurant_name = "Wag res"
        self.cuisine_type = "Chinese"

    def describe_restaurant(self):
        print("it belongs to Sickwag")

    def open_restaurant(self):
        print("opening now ")
```
## 9.2 使用类和实例
### 9.2.1 创建汽车类
```Python
class Car:
    """一次模拟汽车的简单尝试。"""
    def __init__(self, make, model, year):
        """初始化描述汽车的属性。"""
        self.make = make
        self.model = model
        self.year = year
    def get_descriptive_name(self):
        """返回整洁的描述性信息。"""
        long_name = f"{self.year} {self.make} {self.model}"
        return long_name.title()
my_new_car = Car('audi', 'a4', 2019)   # 这里给类传入参数初始化类的操作叫做创建实例
print(my_new_car.get_descriptive_name())
```
```Python
class Car:
    """一次模拟汽车的简单尝试。"""
    def __init__(self, make, model, year):
        """初始化描述汽车的属性。"""
        self.make = make
        self.model = model
        self.year = year
        self.odometer_reading = 0
    def get_descriptive_name(self):
        """返回整洁的描述性信息。"""
        long_name = f"{self.year} {self.make} {self.model}"
        return long_name.title()

    def read_odometer(self):
        print(f"This car has {self.odometer_reading} miles on it ")
    def updata_odometer(self, mileage_addition):
        if mileage_addition >= 0 :
            self.odometer_reading += mileage_addition
        else :
            print("you cant roll back the odometer")
my_new_car = Car('audi', 'a4', 2019)
print(my_new_car.get_descriptive_name())
my_new_car.read_odometer()
num = 10
my_new_car.updata_odometer(num)
print(f"now my car has run {num} miles.")
my_new_car.read_odometer()
```
## 9.3 继承
### 9.3.1 子类的方法
子类成员对父类成员的重新定义并不是再添加内容,而是复写
在Python中，如果子类继承了父类并且子类重写了`__init__`方法，新的`__init__`方法会覆盖父类的`__init__`方法。这意味着，如果你在子类中定义了一个新的`__init__`方法，它将不会自动调用父类的`__init__`方法，父类的初始化代码不会被自动执行。
如果你希望在子类的`__init__`方法中同时执行父类的初始化代码，你需要在子类的`__init__`方法中显式地调用父类的`__init__`方法。这通常通过使用`super()`函数来实现。
下面是一个例子：
```Python
class Parent:
    def __init__(self):
        print("Parent __init__")
class Child(Parent):
    def __init__(self):
        super().__init__()  # 显式调用父类的 __init__ 方法
        print("Child __init__")
# 创建子类实例
child = Child()

>>>输出
Parent __init__
Child __init__
```
在这个例子中，当你创建`Child`类的实例时，输出将会是：
这表明父类的`__init__`方法被调用了，然后是子类的`__init__`方法。通过使用`super()`，子类可以继承父类的属性和方法，并且可以添加或修改它们的行为。
如果你没有在子类的`__init__`方法中使用`super()`，那么只有子类的`__init__`方法会被执行，父类的`__init__`方法不会被调用，如下所示：
```Python
class Child(Parent):
    def __init__(self):
        print("Child __init__")  # 只有子类的 __init__ 被调用
# 创建子类实例
child = Child()
```
在这种情况下，输出只会是：
```Plain
Child __init__
```
父类的`__init__`方法没有被调用，因此父类的初始化代码没有执行。
**调用父类成员还可以指定调用哪些**
```Python
class Car:
    """一次模拟汽车的简单尝试。"""
    def __init__(self, make, model, year):
          self.make = make
          self.model = model
          self.year = year
          self.odometer_reading = 0
    def get_descriptive_name(self):
          long_name = f"{self.year} {self.make} {self.model}"
          return long_name.title()
    def read_odometer(self):
          print(f"This car has {self.odometer_reading} miles on it.")
    def update_odometer(self, mileage):
          if mileage >= self.odometer_reading:
              self.odometer_reading = mileage
          else:
              print("You can't roll back an odometer!")
    def increment_odometer(self, miles):
        self.odometer_reading += miles
class ElectricCar(Car):
      """电动汽车的独特之处。"""
      def __init__(self, make, model, year):
        """初始化父类的属性。"""
        super().__init__(make, model, year)  # 括号是中允许调用的
        # 没有被写在里面,会被复写
my_tesla = ElectricCar('tesla', 'model s', 2019)
print(my_tesla.get_descriptive_name())
```

```Python
class ElectricCar(Car):
      """电动汽车的独特之处。"""
      def __init__(self, make, model, year):
        """初始化父类的属性。"""
        super().__init__(make, model, year)
"""其中子类创建与父类同名的方法,不写super表示复写全部,写了表示继承父类
中括号里有的,复写没有的,参数先传入子类中__init__再因继承传给父类""
```

# 第十章 文件和异常
## 10.1 从文件中读取数据
- 调用read方法对文件对象处理时会在最后返回一个空字符串(回车)
- rstrip()处理文件对象中字符串**末尾**固定符号, 不传入参数时去除回车行,**允许使用正则表达式** . 但只会去除字符串开头和结尾的符号,需要去除中间的使用strip方法[python基础学习提到](Python%20Basics.md#^384b85)
- 使用关键字with 时，open() 返回的文件对象只在with 代码块内可用,代码运行完销毁
- 编辑器中写文件路径时,使用双反斜杠,  explorer中用斜杠
- 在文件中写入内容常犯的错误是open函数中定义`"w"`打开,想用append方法( append方法在文件中对象中不存在, 只在数据容器中有 )追加内容.
- `"w"`写法表示下面的函数体是覆盖写入文件的操作,删除全部内容添加.
  **正确的做法**是`"a"`参数表示追加写入, 调用write方法
- try-exception-else-finnal语法结构
  [每一个部分详细解释](Python%20Basics.md#^92bbce)
- split方法分割字符串返回值是一个包含分割后字符的列表[返回结果](Python%20Basics.md#^cc9dfe)
- 10.3.8 异常静默处理, 在exception关键字中写pass.表示什么也不做,同时作为占位符方便代码维护
### 10-6 \10-7练习
- input()语句返回的是一个字符串数值, 赋值给变量时变量的类型为str, 使用算数符号实际上进行的是字符串拼接而不是其中值计算
```python
def add_nums():

    first = input("first number (int):")
    second = input("first number (int):")
    try:
        print(f"the result is {int(first) + int(second)}")
    except ValueError as e :
        print("you have to input numbers in int ")

add_nums()
```
### 10-8
一定要注意代码中路径使用\\分开
```Python
try :
    with open("D:\\数据保存位置\\VScode\\Learning Python\\Python Programming - From Entry to Practice\\dogs.txt",encoding="UTF-8") as file:
        content = file.read()
        print(content)
except FileNotFoundError as e:
	pass
    # print("file not found")
""" you must notice the directory use \\ to recognize !!! """
```
### 10-10
每一个字符串对象都有low方法将字符串转化为小写,count方法统计传入参数出现次数
```Python
>>> line = "Row, row, row your boat"
>>> line.count('row')
2
>>> line.lower().count('row')
3
```
## 10.4存储数据
- open函数只输入第一个参数.读写方式默认为"r"
- 代码重构时,应遵循**一个函数只做一件事**的定义准则方便阅读, 功能之间的逻辑关系层级通过**嵌套调用函数**实现
```Python
  import json

  def get_stored_username():
❶     """如果存储了用户名，就获取它。"""
      filename = 'username.json'
      try:
          with open(filename) as f:
              username = json.load(f)
      except FileNotFoundError:
❷         return None
      else:
          return username

def get_new_username():
    """提示用户输入用户名。"""
    username = input("What is your name? ")
    filename = 'username.json'
    with open(filename, 'w') as f:
        json.dump(username, f)
    return username

def greet_user():
    """问候用户，并指出其名字。"""
    username = get_stored_username()
    if username:
        print(f"Welcome back, {username}!")
    else:
        username = get_new_username()
        print(f"We'll remember you when you come back, {username}!")

greet_user()
```
最后一个函数几乎全是调用功能, 通过前面层级函数**返回实际值或none的代码编写方式控制这些方式实际是否执行**
### 10-11 (代码存在问题)
- json模块中json方法函数第一个参数是**传入内容**,传入后自动添加\n  第二个是**内容传入对象**
	` with open(filename, 'w') as f:
    `json.dump(username, f)`

# 第十一章 测试代码

## 测试代码的目的

运行测试用例时[测试结果](#^cf83d4)，每完成一个单元测试，Python都打印一个字符：
测试通过时打印一个句点，
测试引发错误时打印一个E ，
而测试导致断言失败时则打印一个F。
这就是你运行测试用例时，在输出的第一行中看到的句点和字符数量各不相同的原因。如果测试用例包含很多单元测试，需要运行很长时间，就可通过观察这些结果来获悉有多少个测试通过了。
## 单元测试实例unittest
unittest是python中内置的一个模块,用于检测单元块运行情况. 其中常用TestCase中测试方法和工具,使用方法是在定义测试类时继承unittest.TestCase类
```python
import unittest

class TestStringMethods(unittest.TestCase):

    def test_upper(self):
        self.assertEqual('foo'.upper(), 'FOO') # 检查foo字符串使用.upper方法后是否和FOO字符串相等  ----后面关于测试方法会讲

    def test_isupper(self):
        self.assertTrue('FOO'.isupper())
        self.assertFalse('Foo'.isupper())

    def test_split(self):
        s = 'hello world'
        self.assertEqual(s.split(), ['hello', 'world'])
        # check that s.split fails when the separator is not a string
        with self.assertRaises(TypeError):
            s.split(2)

if __name__ == '__main__':
    unittest.main()
```
## TestCase提供的断言方法
当继承这个类时，你的测试类可以使用`unittest.TestCase`提供的断言方法来验证代码的行为是否符合预期。这些断言方法包括但不限于：

- `assertEqual(a, b)`：检查两个值是否相等。
- `assertTrue(x)`：检查`x`是否为真。
- `assertFalse(x)`：检查`x`是否为假。
- `assertIs(a, b)`：检查两个对象是否是同一个对象。
- `assertIsNone(x)`：检查`x`是否为`None`。
- `assertIn(a, b)`：检查`a`是否在`b`中。
- `assertRaises(exc, fun, *args, **kwds)`：检查`fun(*args, **kwds)`是否抛出了`exc`异常。

继承`unittest.TestCase`的测试类可以定义多个测试方法，每个测试方法通常以`test_`开头，用于执行特定的测试逻辑。
## unittest.main方法
使用main方法的位置作为测试程序的入口,被识别为测试方法的部分将会从这里开始执行
`unittest.main()`是一个可调用对象，它提供了一个方便的方式来运行测试用例。当你在脚本的末尾调用`unittest.main()`时，它会自动发现并运行当前模块中所有继承自`unittest.TestCase`的测试类和测试方法。

`unittest.main()`可以接受参数来控制测试运行的行为，例如：

- `argv`：一个字符串列表，用于模拟命令行参数。
- `exit`：一个布尔值，指示是否在测试完成后退出程序。
- `verbosity`：一个整数，用于控制测试输出的详细程度。

## 测试结果

^cf83d4

```python
❶ E     # 如果测试成功,返回结果第一行会是一个.
======================================================================
❷ ERROR: test_first_last_name (__main__.NamesTestCase)   # 第二行测试显示测试出错的位置
  --------------------------------------------------------------------
❸ Traceback (most recent call last):
    File "test_name_function.py", line 8, in test_first_last_name
      formatted_name = get_formatted_name('janis', 'joplin')
  TypeError: get_formatted_name() missing 1 required positional argument: 'last'
# 错误类型和traceback
  --------------------------------------------------------------------
❹ Ran 1 test in 0.000s

❺ FAILED (errors=1)   # 计数

```
## 测试方法命名规范
当一个类\函数\方法继承\调用了unittest后,其中包含的所有以`test_`开头的方法被unittest识别并从main()入口进入开始全部执行, 没被识别就只会是一个普通的在类中方法,等待被对象使用`.方法名`调用

当使用不以`test_`开头的方法但仍需要测试时,可以使用`unittest.TestLoader`类的`loadTestsFromTestCase`方法来手动加载测试用例。这样，你可以指定哪些方法应该被当作测试方法来执行
```python
import unittest

class MyTestCase(unittest.TestCase):
    def test_add(self):
        self.assertEqual(2 + 2, 4)

    def test_subtract(self):
        self.assertEqual(4 - 2, 2)

    def not_a_test_method(self):
        print("This is not a test method")

if __name__ == '__main__':
    # 创建一个测试加载器
    loader = unittest.TestLoader()
    # 使用loadTestsFromTestCase方法加载测试用例
    test_suite = loader.loadTestsFromTestCase(MyTestCase)
    """将整个MyTestCase中所有方法都作为测试"""
    # 运行测试用例
    unittest.TextTestRunner().run(test_suite)
```

## 其他收获
### with函数使用规范

[with语句执行步骤和结构](../../Files%20&%20LongText/Docs/Python%20Official%20Docs.md#^1998e6)
### 字符串检查\调试方法
1. `capitalize()` - 将字符串的第一个字符转换为大写，其余字符转换为小写。
2. `upper()` - 将字符串中所有小写字母转换为大写字母。
3. `lower()` - 将字符串中所有大写字母转换为小写字母。
4. `swapcase()` - 将字符串中大写字母转换为小写，小写字母转换为大写。
5. `title()` - 将字符串中每个单词的首字母转换为大写，其余字母转换为小写。
6. `strip()` - 移除字符串首尾的空白字符（默认情况下，包括空格、换行符、制表符等）。
7. `rstrip()` - 移除字符串尾部的空白字符。
8. `lstrip()` - 移除字符串头部的空白字符。
9. `find(sub[, start[, end]])` - 返回子字符串`sub`在字符串中首次出现的索引，可选参数`start`和`end`指定搜索范围。
10. `index(sub[, start[, end]])` - 类似于`find()`，但如果子字符串不在字符串中，则会引发一个`ValueError`。
11. `rfind(sub[, start[, end]])` - 返回子字符串`sub`在字符串中最后一次出现的索引。
12. `rindex(sub[, start[, end]])` - 类似于`rfind()`，但如果子字符串不在字符串中，则会引发一个`ValueError`。
13. `replace(old, new[, count])` - 将字符串中`old`子字符串替换为`new`子字符串，可选参数`count`指定替换的最大次数。
14. `split(sep=None, maxsplit=-1)` - 以`sep`为分隔符将字符串分割成一个列表，`maxsplit`指定最大分割次数。
15. `rsplit(sep=None, maxsplit=-1)` - 类似于`split()`，但从字符串的右侧开始分割。
16. `join(iterable)` - 将可迭代对象中元素连接成一个字符串，元素之间插入调用`join()`方法的字符串。
17. `startswith(prefix[, start[, end]])` - 检查字符串是否以`prefix`开始，可选参数`start`和`end`指定检查范围。
18. `endswith(suffix[, start[, end]])` - 检查字符串是否以`suffix`结束，可选参数`start`和`end`指定检查范围。
19. `isalpha()` - 如果字符串至少有一个字符并且所有字符都是字母则返回`True`。
20. `isdigit()` - 如果字符串只包含数字并且至少有一个字符则返回`True`。
21. `isnumeric()` - 类似于`isdigit()`，但支持更多的字符，如Unicode数字字符。
22. `isspace()` - 如果字符串只包含空白字符则返回`True`。
23. `islower()` - 如果字符串中所有字母字符都是小写则返回`True`。
24. `isupper()` - 如果字符串中所有字母字符都是大写则返回`True`。
25. `istitle()` - 如果字符串是标题化的（每个单词的首字母大写）则返回`True`。

这些方法使得字符串操作变得非常方便和强大。需要注意的是，**字符串是不可变的，所以这些方法不会改变原始字符串，而是返回一个新的字符串。**

# 第十二章项目
## 12.3 外星人入侵项目
### 创建窗口并监控输入
- pygame 中所有显示在屏幕上的元素都叫**surface**，`pg.display.set_mode` 这种创建窗口的函数返回值也是一个 pygame surface 对象，surface 对象可以在上面绘制图形
- 所有的键盘和鼠标操作都将使 `pg.event.get()` 函数运行
- `flip` 函数可以创建一个新的屏幕，擦去旧屏幕来显示各种 surface 的新位置
- `pg.display.set_mode()` 接受一个元组作为参数，元组的数字表示窗口大小，用于创建一个窗口或设置显示模式，以便在其中绘制图形和显示游戏内容。接受一个**size**参数一个元组 `(width, height)`，指定窗口的宽度和高度，单位是像素。这个参数定义了窗口的尺寸。
```python
import sys
import pygame as pg
def run_game():
    pg.init()#initial the basic background settings
    screen = pg.display.set_mode((1200,800))
    pg.display.set_caption("Alien Invasion")

    # start the main cycle
    while True: # when the game start , keep monitor the movement for keyboard and mouse ,which called "event"
        for event in pg.event.get():# 监视事件1，keep checking whether user has click the X (quit button)
            if event.type == pg.quit:#pg.quit表示窗口中右上角的 X
                sys.exit()
        pg.display.flip()
run_game()
```
### 设置背景颜色
- 所有 surface 对象（ pygame 模组中返回 surface 对象的函数）都可以通过 `surface.fill` 填充颜色
```python
import sys
import pygame as pg
def run_game():
    pg.init()#initial the basic background settings
    screen = pg.display.set_mode((1200,800))
    pg.display.set_caption("Alien Invasion")
    bg_color = (230,230,230)

    # start the main cycle
    while True: # when the game start , keep monitor the movement for keyboard and mouse ,which called "event"
        for event in pg.event.get():# 监视事件1，keep checking whether user has click the X (quit button)
            if event.type == pg.quit:#pg.quit表示窗口中右上角的 X
                sys.exit()
        screen.fill(bg_color) #在窗口surface中填充颜色
        pg.display.flip()#make sure the latest screen surface invisible
run_game()
```
### 创建设置类
- 将所有设置放在 setting 类中
```python
class settings:
def __init__(self) -> None:
    self.screen_width = 1200
    self.screen.height = 800
    self.bg_color = (230,230,230)
```
- 通过重构代码将设置类中设置连接到主程序
- from + .py 文件名 + import 类名
```python
from settings import Settings
--------------
def run_game():
pg.init()#initial the basic background settings
game_settings = Settings()
screen = pg.display.set_mode((game_settings.screen_width,game_settings.screen_height))
pg.display.set_caption("Alien Invasion")
-------------------------------
screen.fill(game_settings.bg_color)
---------------------------------
```
### 创建飞船类
- pygame 中窗口坐标轴左上角是 (0,0) ，向右下角移动两坐标增大
- bilt 方法：`self.blit` 方法用于在 `Surface` 对象上绘制另一个 `Surface` 对象。
	- 将一个精灵（代表游戏中对象，如角色、敌人、背景等）绘制到屏幕上。
	- 接受以下参数
		- 1.**source**: 要绘制的 `Surface` 对象。这是你想要在目标 `Surface` 上显示的图像或图形。
		- 2.**position**: 一个包含两个元素的序列（通常是元组），指定 `source` 在目标 `Surface` 上的位置 `(x, y)`。`x` 和 `y` 分别代表目标 `Surface` 上的水平和垂直坐标。
		- 3.**area**: （可选）一个矩形区域，指定 `source` `Surface` 中要绘制的部分。如果未提供，将绘制整个 `source` `Surface`。
		- 4.**special_flags**: （可选）一个或多个标志，用于控制绘制的特殊效果。例如，`pygame.BLEND_RGB_ADD` 可以用来实现颜色混合效果。
	- 不返回任何值
```python
import pygame as pg
class ship:
    def __init__(self,screen) -> None:
        self.screen = screen
        self.image = pg.image.load("python\\alien_invasion\\images\\ship.bmp")
        self.rect = self.image.get_rect()#get the rect of ship
        self.screen_rect = screen.get_rect()#get the physical game screen rect

        # make the ship in the center bottom of screen
        self.rect.bottom = self.screen_rect.bottom# 飞船矩形底部防砸屏幕矩形底部
        self.rect.centerx = self.screen_rect.centerx# 飞船图片矩形中心放在屏幕矩形中间
    def blit_me(self):
        self.screen.blit(self.image,self.rect)
```
bilt 方法让飞船 surface 在屏幕 surface 上绘制图，它直接在调用它的 `Surface` 对象上进行绘制操作。
### 重构模块 game_functions
- 当导入的模块文件中 import 了主程序中需要的库，主程序可以不再使用
- python 自定义函数中传入形参时，不需要写明参数类型，等传入参数后没有对应的方法自然报错
	![Pasted image 20240912093236.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240912093236.png)
```python
import sys
import pygame as pg
# 没有定义类就不用写from而直接import
# 将监视键盘鼠标动作放在function模块中
def check_events():
    for event in pg.event.get():# 监视事件1，keep checking whether user has click the X (quit button)
        if event.type == pg.quit:#pg.quit表示窗口中右上角的 X
            sys.exit()

def update_screen(game_settings,screen,game_ship):
    screen.fill(game_settings.bg_color) #在窗口surface中填充颜色
    game_ship.blit_me()# use object method to draw the ship image
    pg.display.flip()#make sure the latest screen surface invisible
```

### 控制飞船移动
- 通过 `pygame.event.get()` 获取的每一个键鼠动作都是一个事件，在 ` check_events ()` 函数中将每一个按键注册为一个 `KEYDOWN`（KEYDOWN 在 pygame 中自带）
```python
---------game_functions.py------------
for event in pg.event.get():# 监视事件1，keep checking whether user has click the X (quit button)
if event.type == pg.quit:#pg.quit表示窗口中右上角的 X
    sys.exit()
elif event.type == pg.KEYDOWN:
    if event.key == pg.K_RIGHT:
        game_ship.rect.centerx += 1 # 单位是像素
----------alien_invasion.py---------------
gf.check_events(game_ship)# 注意传入gameship对象
```

### 允许不断移动
- 关键是添加不断移动的条件，这里使用变量控制
```python
---------game_functions.py----------
def check_events(game_ship):
for event in pg.event.get():# 监视事件1，keep checking whether user has click the X (quit button)
    if event.type == pg.quit:#pg.quit表示窗口中右上角的 X
        sys.exit()
    elif event.type == pg.KEYDOWN:
        if event.key == pg.K_RIGHT:
            game_ship.moving_right = True
        if event.key == pg.K_LEFT:
            game_ship.moving_left = True
    elif event.type == pg.KEYUP:
        if event.key == pg.K_RIGHT:
            game_ship.moving_right = False
        if event.key == pg.K_LEFT:
            game_ship.moving_left = False
----------ship.py------------------
def __init__(self,screen):
	self.moving_right = False # 初始化飞船行为的函数中定义移动行为
	self.moving_left = False # 必须使用self表明是ship对象的成员属性，才能在外部调用
def update(self):
	if self.moving_right:
	    self.rect.centerx += 1
	if self.moving_left:
	    self.rect.centerx -= 1
```

### 调整飞船速度
- 有种简单的做法是直接在设置中设置速度值，然后在 ship. py 中将值导入即可
```python
-----------settings.py-------------
self.ship_speed_factor = 10
-----------ship.py-----------------
def update(self):
if self.moving_right:
    self.rect.centerx += self.game_settings.ship_speed_factor
if self.moving_left:
    self.rect.centerx -= self.game_settings.ship_speed_factor
```
**注意：上面代码已经可以实现调整飞船速度功能**，但由于飞船位置不好获取，需要设置变量放在 update 中循环获取并记录飞船位置

但这样的做法仅仅在**视觉上移动了**飞船，逻辑上移动了飞船的 rect，飞船的位置信息并不会由 centerx 得到，所以需要使用一个 center 变量保存飞船的位置信息，方便后续调用
rect不能**精细调整**飞船位置（rect 创建的外接矩形单位是像素，我们如果需要飞船移动 1.1 个像素，外接矩形无法实现报错），用 center 变量代替飞船移动，并将移动后飞船矩形 rect 的中心位置 center 传递给矩形中心变量 rect. centerx，通过循环重绘飞船位置

```python
def update(self):
	if self.moving_right:
	    self.center += self.game_settings.ship_speed_factor
	if self.moving_left:
	    self.center -= self.game_settings.ship_speed_factor
	self.rect.centerx = self.center
# 其中将本来的rect.centerx改为center，并通过self.rect.centerx = self.center刷新位置

-------------settings.py-------------------
def __init__(self):
        self.ship_speed_factor = 1.5
```

### 限制飞船活动范围
- 注意设置界限时不能像这样判断飞船外接矩形有没有贴近屏幕边缘
```python
def update(self):
# make sure the ship will not go outside screen
	if self.rect.right >= self.screen_rect.right:
	    self.rect.right = self.screen_rect.right
	if self.rect.left <= 0:
	    self.rect.left = 0
```
这样设置导致飞船外接矩形在贴边时锁定在屏幕边缘（因 if 条件满足时下面用等于号赋值），但飞船的中心 centerx 值能够移动，飞船在边缘时再按方向会超出屏幕，但飞船贴边，正确做法是给移动设置条件，达到边缘时不移动，**而不是一直允许移动，到边缘时锁定贴图**
```python
def update(self):
	#如果向右动作正在执行，并且ship的外接矩形右边缘位置小于屏幕右边缘时允许移动，左边缘同理
	if self.moving_right and self.rect.right < self.screen_rect.right:
	    self.center += self.game_settings.ship_speed_factor
	if self.moving_left and self.rect.left >0:
	    self.center -= self.game_settings.ship_speed_factor
	self.rect.centerx = self.center
```

### 重构 check_events
重构出管理按键和释放按键的操作函数
```python
---------------game_function-------------
def check_keydown_events(event,game_ship):
    if event.key == pg.K_RIGHT:
        game_ship.moving_right = True
    if event.key == pg.K_LEFT:
        game_ship.moving_left = True

def check_keyup_events(event,game_ship):
    if event.key == pg.K_RIGHT:
        game_ship.moving_right = False
    if event.key == pg.K_LEFT:
        game_ship.moving_left = False
def check_events(game_ship):
    for event in pg.event.get():# 监视事件1，keep checking whether user has click the X (quit button)
        if event.type == pg.quit:#pg.quit表示窗口中右上角的 X
            sys.exit()
        elif event.type == pg.KEYDOWN:
            check_keydown_events()
        elif event.type == pg.KEYUP:
            check_keyup_events()
```

### 向上向下移动功能
- 重构的目的是更方便地调整代码，重构 keyup 和 keydown，要添加动作只需要在对应函数中写即可
- 注意，由于添加了向上向下，需要增加 y 坐标轴和对应的 center_y 等变量
```python
---------------game_functions.py--------------------
def check_keydown_events(event,game_ship):
    if event.key == pg.K_RIGHT:
        game_ship.moving_right = True
    if event.key == pg.K_LEFT:
        game_ship.moving_left = True
    if event.key == pg.K_UP:
        game_ship.moving_up = True
    if event.key == pg.K_DOWN:
        game_ship.moving_down = True

def check_keyup_events(event,game_ship):
    if event.key == pg.K_RIGHT:
        game_ship.moving_right = False
    if event.key == pg.K_LEFT:
        game_ship.moving_left = False
    if event.key == pg.K_UP:
        game_ship.moving_up = False
    if event.key == pg.K_DOWN:
        game_ship.moving_down = False
------------ship.py--------------------------
# initial basic movements condition
    self.moving_right = False # 初始化飞船行为的函数中定义移动行为
    self.moving_left = False # 使用self表明是ship成员属性，才能外部调用
    self.moving_up = False
    self.moving_down =False

    # make the ship in the center bottom of screen
    self.rect.bottom = self.screen_rect.bottom# 飞船矩形底部防止屏幕矩形底部
    self.rect.centerx = self.screen_rect.centerx# 飞船图片矩形中心放在屏幕矩形中间

    # initial basic attributes of ship
    self.ship_speed_factor = game_settings.ship_speed_factor
    self.center_x = float(self.rect.centerx)# record position of ship's center
    self.center_y = float(self.rect.centery)
def blit_me(self):
    self.screen.blit(self.image,self.rect)
def update(self):

    #如果向右动作正在执行，并且ship的外接矩形右边缘位置小于屏幕右边缘时允许移动，左边缘同理
    if self.moving_right and self.rect.right < self.screen_rect.right:
        self.center_x += self.game_settings.ship_speed_factor
    if self.moving_left and self.rect.left >0:
        self.center_x -= self.game_settings.ship_speed_factor
    if self.moving_up and self.rect.top > 0:
        self.center_y -= self.game_settings.ship_speed_factor
    if self.moving_down and self.rect.bottom < self.screen_rect.bottom:
        self.center_y += self.game_settings.ship_speed_factor
    self.rect.centerx = self.center_x
    self.rect.centery = self.center_y
```

### 添加子弹类
- sprite 模组即“精灵模组”，包含让 surface 对象有碰撞，位置计算和创建 sprite 矩形的能力
- pg的 **Rect 类**（注意不是 `pg. rect` 方法而是类，类才能传入矩形的属性与和游戏有关的变成方法）可以根据参数创建矩形对象（一个能够操作的元素是对象，函数返回的只是一个值/变量），面向对象编程！ `getrect()` 适用于获得图片矩形,这个子弹矩形将被用于 `draw_bullet` 方法的参数
- `super(bullet,self).__init__()` ，python3中这样写`super().__init__()`
- 关于 `pygame.draw.rect()` 类
	- 用于在指定的 Surface 对象上绘制矩形。可以用来绘制窗口、按钮或其他矩形图形。
	- 参数说明：
		- `surface`：要在其上绘制矩形的 Surface 对象。
		- `color`：矩形的颜色，通常是一个表示颜色的四元组（RGB + Alpha），例如 (255, 0, 0) 表示红色。
		- `rect`：一个矩形区域，可以是一个 Rect 对象或者一个包含四个元素的序列（左上角的 x 和 y 坐标，以及矩形的宽度和高度）。
		- `width`：（可选）绘制矩形边框的宽度。如果设置为 0，则绘制填充的矩形（默认值）。
```python
import pygame as pg
from pygame import sprite

class bullet(sprite):
    def __init__(self,game_settings,screen,game_ship) -> None:
        super().__init__()
        self.screen = screen
        # 设置子弹的矩形（不是外接）
        self.rect = pg.rect(0,0,game_settings.bullet_width,game_settings.bullet_height)

        # 放置子弹位制
        self.rect.centerx = game_ship.rect.center_x
        self.rect.top = game_ship.rect.top
        self.y = float(self.rect.y) # y变量存储初始化后子弹的y轴位置

        # 设置子弹属性
        self.color = game_settings.bullet_color
        self.speed_factor = game_settings.bullet_speed_factor

    def update(self):
        self.y -= self.speed_factor # 刷新后更新一次子弹矩形的位置记录
        self.rect.y = self.y# 将记录应用，改变子弹显示位置
    def draw_bullet(self):
        pg.draw.rect(self.screen,self.color,self.rect)
```
### 子弹存储到编组中
- `pygame.sprite.group` 类似集成各种游戏开发方法的列表，一般作为管理多个 Sprite 对象的容器。
- Group 对象的 update 方法用于更新组内所有 Sprite 对象的状态。同步所有精灵位置、速度等属性。
- update 方法作用是遍历 Group 中所有 Sprite 对象，并对**每个对象**调用其 update 方法。这允许你一次性更新所有精灵的状态，而无需单独处理每一个。
- update 方法不接受任何位置参数，但会传递任何你提供给它的额外参数**给组内每个 Sprite 的 update 方法**。这使得你可以根据需要向所有精灵传递更新逻辑，例如时间增量、事件等。通过修改 group 中 update 方法而改变所有的 sprite 的 update 逻辑
- update 方法没有返回值。它直接修改了组内 Sprite 对象的状态。
- 这时无法启动游戏，因 check_events （需要监控按下空格键）和 update_screen（按下空格键后显示出子弹） 多加了一位参数而定义没有改变，
```python
while True: # when the game start , keep monitor the movement for keyboard and mouse ,which called "event"
gf.check_events(game_ship,bullets) #监控行为，KEYDOWN和KEYUP
game_ship.update() #根据监控决定是否持续移动,所以放check_event下面
bullets.update()# 每次循环更新一次所有子弹的状态
gf.update_screen(game_settings,screen,game_ship,bullets)
```
### 开火
- 注意 python 导入模组的方式 [Python Basics \> python模块导入](Python%20Basics.md#python模块导入) `from pygame.sprite import Sprite` 就是将 pygame 包中 sprite 模块中 Sprite 类导入，写成 `from pygame import sprite`
- 错误修正：
	- 创建能够操作的元素（pygame 中 surface 也是）都是对象，它封装了属性和方法，需要通过**类而不是函数**创建
	- 放置子弹初始位置（`__init__` 函数中）设定子弹初识在船 rect 的中间，所以使用 `self.rect.centerx = game_ship.rect.centerx`，在船 rect 顶端，所以使用 `self.rect.top = game_ship.rect.top`，之前并没有创建一个叫做 center_x 的变量放入 **ship 类中 rect方法中**作为全局变量，使用矩形方法只能调用 centerx 方法获得坐标，我们自己自定义了 center_x 在 ship 类中
	- 正确做法是将 `self.rect.centerx = game_ship.rect.centerx` 改 `self.rect.centerx = game_ship.center_x` 不通过 ship surface 对象的矩形方法获取，当然通过 ship 自带的 rect. centerx 方法也可以
```python
class Bullet(Sprite):
	 def __init__(self, game_settings, screen, game_ship):
	     super(Bullet,self).__init__()
	     self.screen = screen
	     # 设置子弹的矩形（不是外接）
	     self.rect = pg.Rect(0, 0, game_settings.bullet_width, game_settings.bullet_height)
	     # 上一行需要注意pg.Rect类而不是pg.rect方法创建矩形对象
```

### 删除屏幕外子弹
- 由于 print 函数将子弹数量发送到终端，频率和游戏刷新速度有关（即循环 while 的速度）会极大降低游戏速度，所以测试后将这行代码注释
- bullets 是一个精灵数组，for 循环根据其中元素数量决定循环次数
- 使用 bullet.copy () 原因是循环中如果需要修改子弹精灵数组时修改的是副本而不是原本的元素
```python
while True:
	gf.check_events(game_settings,screen,game_ship,bullets) #监控行为，KEYDOWN和KEYUP
	game_ship.update() #根据监控决定是否持续移动,所以放check_event下面
	bullets.update()# 调用group的update方法每次循环更新所有子弹的状态
	for bullet in bullets.copy():
	    if bullet.rect.bottom <= 0:
	        bullets.remove(bullet)
```
### 限制子弹数量
- 在设置中创建新变量存储同时存在的子弹数量即可
- 将开火和管理子弹发射重构到新的函数中，目的是使**主程序中使用尽量少的代码**
```python
elif event.key == pg.K_SPACE:
if len(bullets)<game_settings.bullets_allowed:
    new_bullet = Bullet(game_settings,screen,game_ship)
    bullets.add(new_bullet)
```
### 创建 Alien 类
- 注意 **rect 对象**的 `.x`，`.y ` 用来描述矩形的初始位置，**surface 对象的** `.width`，`.heigh` ，`.bottom`，`。center` 等用来返回矩形的相对应位置的坐标,，容易混淆的是本身 surface 对象的 `rect_x`，`rect_y` 方法，可以返回当前矩形的**中心位置**x 或 y 的坐标
- 代码中 `self.rect.x = self.rect.width` 表示将 alien 对象的 rect（由 image 创建的外接矩形） x 坐标等于自身 rect 的宽度，也就是说第一个 alien image 显示在屏幕左上角，左边距为自身 rect 宽度
- 然后创建 alien 实例，用 `blit()` 方法将创建的实例显示到屏幕上
```python
---------------Alien.py------------
import pygame as pg
from pygame.sprite import Sprite
class Alien(Sprite):
    def __init__(self,game_settings,screen):
        # necessary initial
        super(Alien,self).__init__()
        self.screen = screen
        self.alien_settings = game_settings

        # load the image and initial aliens rect attributes
        self.image = pg.image.load("python\\alien_invasion\\images\\alien.bmp")
        self.rect = self.image.get_rect()
        self.rect.x = self.rect.width
        self.rect.y = self.rect.height
        self.x = float(self.rect_x)

    def blitme(self):
        # image will be a surface in position which self.rect submit
        self.screen.blit(self.image,self.rect)
--------------alien invasion.py------------------
from alien import Alien
    alien = Alien(game_settings,screen)
-------------game_functions.py-------------------
def update_screen(game_settings,screen,game_ship,aliens,bullets):
	screen.fill(game_settings.bg_color) #在窗口surface中填充颜色
	for bullets in bullets.sprites():
	    bullets.draw_bullet()
	game_ship.blit_me()# use object method to draw the ship image
	aliens.blit_me() # make alien image invisible
	pg.display.flip()#make sure the latest screen surface invisible
```
####  blit () 和 draw () 方法的区别
- blit () :  `blit()` 方法用于将一个图像（`Surface` 对象）绘制到另一个 `surface` 对象上。它是 `pygame` 中最常用的绘制方法，用于绘制图像、精灵等。
- 作用：将 `src` 表示的图像绘制到目标 `Surface` 上的指定位置
- 参数
	- `src`: 要绘制的源 `Surface` 对象。
	- `dst`: 目标位置的矩形（`Rect` 对象），定义了源图像在目标 `Surface` 上的位置和大小。
	- `area`: 可选参数，定义源图像中要绘制的区域（`Rect` 对象）。如果未指定，将绘制整个 `src`。
	- `special_flags`: 可选参数，用于指定特殊的绘制选项，如 `BLEND_RGB_ADD`、`BLEND_PREMULTIPLIED` 等。
- draw () : `draw()` 方法用于在 `Surface` 对象上绘制基本图形，如线条、矩形、圆形等。
- 参数
	- `shape`: 要绘制的图形类型，可以是 `LINE`、`RECT`、`CIRCLE`、`ARC`、`CHORD`、`POLYGON` 或 `POLYLINE`。
	- `color`: 绘制图形的颜色。
	- `rect`: 用于绘制图形的矩形区域（`Rect` 对象）。对于圆形，它定义了外接矩形。
	- `width`: 可选参数，用于绘制线条的宽度。仅当绘制线条、矩形边框或圆形边框时使用。
	- `*args`: 其他参数，根据不同的 `shape` 类型，可能需要额外的参数来定义图形的细节，如起始角度、结束角度等。
- 作用：在 `Surface` 上绘制基本的几何图形。
- **两者都没有返回值**，在本项目中放在 `update_screen` 函数，主程序的 while 循环中每循环一次重绘循环中所有图像
### 创建一群外星人
- 使用函数创建外星人对象，使用 aliens = Group () ，管理所有外星人对象，Group () 是类，aliens 是 Group 类的示例（管理 alien 实例的实例），代码逻辑类似于 [C++ Basics \> 基础入门通讯录管理系统](../C%20C++/C++%20Basics.md#基础入门通讯录管理系统)中电话本实例管理联系人实例
- 代码中 for 循环将 number_aliens_x 这个**计算结果**range 化为 [range数组](Python%20Basics.md#^0b87d1)，是 alien_number从零数到 number_aliens_x 结果值-1 ，第一个 alien_number 值为 0 同时将 `alien.x = alien_width + 2 * alien_width * alien_number` 刚好等于一个 `alien_width`
- `alien. x = alien_width + 2 * alien_width * alien_number` 循环设置每个 alien 贴图的位置
- pygame 中为普通类新增了 blit，draw 等方法，在 game_functions 中可以使用，draw 是 pygame 中 Group 类才有的方法
```python
--------------game_functions.py--------------
def create_fleet(game_settings,screen, aliens):
	# make an instance and necessary attributes
	alien = Alien(game_settings,screen)
	alien_width = alien.rect.width
	available_space_x = game_settings.screen_width - (2 * alien_width)
	number_aliens_x = int(available_space_x /(2 * alien_width))
	for alien_number in range(number_aliens_x):
	    # a line of aliens ,so the instance should be placed into the loop
	    alien = Alien(game_settings,screen)
	    alien.x = alien_width + 2 * alien_width * alien_number
	    alien.rect.x = alien.x
	    aliens.add(alien)
```

### 重构 create_fleet
- 将计算一行中飞船数量、创建外星人个体、创建一行外星人舰队分别作为一个函数
- 将创建外星人个体函数放入创建外星人舰队函数中并配合位置改变函数循环创建到计算函数限制为止
- 将外形人位置信息作为 create_alien 函数成员对象，在 create_fleet 函数中循环修改属性再创建
```python
def get_number_aliens_x(game_settings,alien_width):
    available_space_x = game_settings.screen_width - (2 * alien_width)
    number_aliens_x = int(available_space_x /(2 * alien_width))
    return number_aliens_x

def create_alien(game_settings,screen,aliens,alien_number):
    # a line of aliens ,so the instance should be placed into the loop
    alien = Alien(game_settings,screen) # initial obj to get rect.width
    alien_width = alien.rect.width
    alien.x = alien_width + 2 * alien_width * alien_number
    alien.rect.x = alien.x
    aliens.add(alien) # create and add to Group

def create_fleet(game_settings,screen,aliens):
    '''create fleet by count and initialize alien objects in loop'''
    alien = Alien(game_settings,screen)# declare alien object because calculate function need this argument
    number_aliens_x= get_number_aliens_x(game_settings,alien,alien.rect.width)
    for alien_number in range(number_aliens_x):
        create_alien(game_settings,screen,aliens,alien_number)
```
### 添加行
- 同计算列数一致，再用两个循环类似 [C++ Code Snippets \> 九九乘法表](../../Files%20&%20LongText/Long%20code/C++%20practice%20case.md#九九乘法表)循环打印行和列
```python
---------------game_function--------------
def get_number_aliens_x(game_settings,alien,alien_width):
    available_space_x = game_settings.screen_width - (2 * alien_width)
    number_aliens_x = int(available_space_x /(2 * alien_width))
    return number_aliens_x

def create_alien(game_settings,screen,aliens,alien_number,row_number):
    # a line of aliens ,so the instance should be placed into the loop
    alien = Alien(game_settings,screen) # initial obj to get rect.width
    alien_width = alien.rect.width
    alien.rect.x =  alien_width + 2 * alien_width * alien_number
    alien.rect.y = alien.rect.height + 2 * alien.rect.height * row_number
    aliens.add(alien) # create and add to Group

def create_fleet(game_settings,screen,ship,aliens):
    '''create fleet by count and initialize alien objects in loop'''
    alien = Alien(game_settings,screen)# declare alien object because calculate function need this argument
    number_aliens_x= get_number_aliens_x(game_settings,alien,alien.rect.width)
    number_rows = get_number_rows(game_settings,ship.rect.height,alien.rect.height)
    for row_number in range(number_rows):
        for alien_number in range(number_aliens_x):
            create_alien(game_settings,screen,aliens,alien_number,row_number)


# calculate the rows in screen

def get_number_rows(game_settings,ship_height,alien_height):
    available_y_space_y = ((game_settings.screen_height - 3 * alien_height)-ship_height)
    number_rows = int (available_y_space_y /(2 * alien_height))
    return number_rows
-----------alien invasion.py--------------------
gf.create_fleet(game_settings,screen,ship,aliens)
```

### 向右移动外星人
- 外星人能够移动，所以是 alien 类的属性
```python
-------------------settings.py--------------------
self.alien_speed_factor = 1
-----------------alien.py------------------------
def update(self):
	# once update ,change the x of alien in speed factor and move it
	self.x += self.alien_settings.alien_speed_factor
	self.rect.x = self.x
--------------game_functions.py----------------------
def update_alien(aliens):
	# aliens is a group ,update method will update all members
	aliens.update()
----------------alien invasion.py--------------------
while True:
	alien.update()
```

# 第十五章数据可视化
matplotlib 画廊 [Gallery | Matplotlib](https://www.matplotlib.org.cn/gallery/#lines-bars-and-markers)
用样的，pyechars 也有对应画廊 [pyechats画廊](Python%20Basics.md#^e09073)
这里使用 matplotlib 中文网中教程

## 简单折线图
### 简单设置
- plot 函数用于绘制**线形图**
	- x 和 y：代表数据点的 x 、 y 坐标。它们可以是列表、数组或元组。只有一个参数默认为 Y 轴，X 轴默认为**从零开始**步长为 1 的数组
	- data：可选参数，可以是一个包含 x 和 y 数据的字典或 pandas. DataFrame。
	- fmt：可选参数，用于指定线条和标记的格式，如 'ro-' 表示红色圆点标记和实线。
```python
import matplotlib.pyplot as plt
squares = [1,4,9,16,25]
plt.plot(squares)
plt.show()
--------------------
import matplotlib.pyplot as plt
y_axis = [1,4,9,16,25]
x_axis = [1,2,3,4,5]
plt.plot(x_axis,y_axis)
plt.show()
```