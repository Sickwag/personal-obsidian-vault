#### 时间日期的字符串表示
PS：时间和日期是复杂的数字格式，需要使用 strftime 方法表示
```Python
from datetime import datetime
# 假设data_now是日期的年月日，time_now是时间的时分
data_now = datetime(2024, 7, 11)
time_now = datetime(2024, 7, 11, 17, 9)
# 使用strftime方法来格式化日期和时间
formatted_date = data_now.strftime('%Y/%m/%d')
formatted_time = time_now.strftime('%H%M')
# 使用f-string来格式化输出
print(f"now the date is {formatted_date} and the time is {formatted_time}.")
```
#### 换行表示
在 Python 中，换行符通常使用 `\n` 来表示。在字符串中，`\n` 会被解释为一个新行的开始，使得文本在显示时会换到下一行。
例如：
```Python
print("Hello\\nWorld")
```
上面的代码会输出：
```Plain
Hello
World
```
在多行字符串中，你也可以直接按回车键来创建换行，Python 会自动将这些换行包含在字符串中：
```Python
print("""Hello
World""")
```
这同样会输出：
```Plain
Hello
World
```
在 f-string 中，如果你想在字符串中包含换行符，你也可以使用 `\\n`：
```Python
name = "Alice"
print(f"Hello,\\n{name}!")
```
这会输出：
```Plain
Hello,
Alice!
```
在处理文件时，如果你想要在写入文件时添加换行符，你同样可以使用 `\n`：
```Python
with open('example.txt', 'w') as file:
    file.write("Hello\\nWorld\\n")
```
这会在 `example.txt` 文件中创建两行文本：
```Plain
Hello
World
```
请注意，在 Windows 系统中，换行符通常是 `\r\n`（回车符和换行符的组合），但在 Python 中，无论是在 Windows 还是其他操作系统上，`\n` 都会被解释为换行符。如果你在 Windows 系统上处理文本文件，并且需要确保换行符与 Windows 的换行符兼容，你可能需要使用 `os.linesep` 来代替 `\n`。
#### 字面量
**字面量的意思是代码中直接表示值的部分**
举例来说：
- `42` 是整数字面量
- `3.14` 是浮点数字面量
- `"Hello, World!"` 是字符串字面量
- `True` 是布尔值字面量
字面量是代码中直接表示值的部分，它们不存储在变量中。在代码中，字面量的作用是直接提供给表达式或变量赋值所需的值。
#### 生成随机数
在 Python 中生成一个介于 1 到 50 之间的随机数，你可以使用 `random` 模块中的 `randint()` 函数。下面是生成随机数的示例代码：
```Python
import random
random_number = random.randint(1, 50)
print(random_number)
```
运行这段代码会生成一个介于 1 到 50 之间的随机整数，并将其打印输出。
在这段代码中，`import random` 的作用是引入 Python 中的 `random` 模块，这样你就可以使用该模块中提供的函数和方法来生成随机数。通过 `import random`，你可以在代码中调用 `random.randint()` 函数来生成指定范围内的随机整数。
- `import`: `import` 关键字用于在 Python 中引入模块，让你可以使用模块中定义的函数、变量和类。在这里，`import random` 表示引入 Python 标准库中的 `random` 模块，它提供了生成随机数的函数。
- `random`: `random` 是 Python 中的一个标准库模块，提供了生成随机数的函数。通过 `random.randint(a, b)` 方法，你可以生成一个位于 `a` 和 `b` 之间的随机整数。
- random.randint () 是 ramdom 标准库中的随机函数  
    random. randint 是该库中随机函数关键字  
    
#### 关闭函数提示
在 Visual Studio Code 中，当你输入完函数名并且之后的括号时，会出现一个弹出提示框显示函数的用法。如果你想关闭这个提示的显示，可以按照以下步骤进行操作：
**在设置中禁用函数签名提示：**
**打开 Visual Studio Code。转到左侧的侧边栏，点击设置图标（齿轮图标）。在搜索框中输入 "Signature Help"。找到 "Editor › Parameter Hints: Enabled"，然后将其关闭（将其设置为 false）。**
![Untitled 228.png](../Attachments/Untitled%20228.png)
#### 多条件满足任几条判断语句写法
应用场景：一所公司正在招聘，需要  
1. 具有大学本科学历  
2. 性别为男，  
3. 体重不高于 75 KG  
4. 身高不低于 175 cm 的员工  
满足四个条件中的任意三个即可应聘成功。应聘者需要填写问卷  
```Python
print("this is a pre onboarding application questionaire .")
# 获取应聘者信息
university_degree = input("Do you have a university degree? (yes/no): ")
gender = input("What is your gender? (male/female): ")
weight = float(input("What is your weight in KG? "))
height = float(input("What is your height in cm? "))
# 判断应聘者是否符合公司招聘条件
criteria_met = (university_degree == "yes") + (gender == "male") + (weight <= 75) + (height >= 175)
# 输出结果
if criteria_met >= 3:
    print("Congratulations! You meet the criteria and are eligible for the job.")
else:
    print("Sorry, you do not meet the criteria for this position.")
```
#### .format 格式化
_**format 括号中的参数必须是可以求值的参数**_
不能在括号中使用赋值语句或者布尔类型判断语句等不能得到一个值的语句，format 必须返回一个值，将这个值（不是数字的意思）传递给相应占位符的位置
`.format()` 是 Python 中用于字符串格式化的方法。它可以让您创建带有占位符的字符串模板，并在运行时填充这些占位符。这种方法使得字符串拼接和格式化更加灵活和清晰。
`.format()` 方法是一种字符串格式化的方式，其中您可以在字符串中使用大括号 `{}` 作为占位符，然后使用 `.format()` 方法传递相应的值来替换这些占位符。这就允许您将变量或其他字符串内容动态地插入到指定位置。
**示例**：
```Python
name = "Alice"
age = 30
# 使用 format 方法进行字符串格式化
message = "My name is {} and I am {} years old.".format(name, age)
print(message)
```
在这个示例中，`{}` 是占位符，`.format(name, age)` 接受两个参数，分别是 `name` 和 `age`，并将它们填充到字符串模板中。`.format()` 方法可以用来替换多个占位符，并且支持不同类型的格式化。
`.format()` 方法可以接受字符串之外的表达式作为参数，只要这些表达式能够在 Python 中被求值。您可以在 `.format()` 方法中使用变量、表达式、函数调用等，而不仅仅是字符串。
 **示例：**
```Python
x = 5
y = 3
# 在 format 方法中使用表达式
result = "{0} + {1} = {2}".format(x, y, x + y)
print(result)  # 输出：5 + 3 = 8
```
在这个示例中，`x + y` 是一个表达式，可以被求值并替换到对应的占位符中。`.format()` 方法会先求解表达式，然后将结果填充到字符串模板中。因此，`.format()` 方法可以灵活处理各种类型的输入，而不仅仅局限于字符串值。
#### .format 格式化索引
^cb 4 d 6 a

```Python
x = 5
y = 3
# 在 format 方法中使用表达式
result = "{0} + {1} = {2}".format(x, y, x + y)
print(result)  # 输出：5 + 3 = 8
```
在 Python 的 `.format()` 方法中，使用大括号 `{}` 和其中的数字是用来指定传递给 `.format()` 方法的参数的位置和顺序的。在您提供的示例中，`{0}`, `{1}`, `{2}` 分别代表传入 `.format()` 方法的第一个、第二个、第三个参数（索引从 0 开始）。
***{}中的数字作为位置索引方便代码阅读，不可以任意填写数字***
`if condition else` 是 Python 中的条件表达式，也称为三元表达式。它的语法结构为：
```Python
x = value_if_true if condition else value_if_false
```
这个表达式的作用是在满足特定条件时返回 `value_if_true`，否则返回 `value_if_false`。它是对传统 if-else 语句的简短表示。
在给定的例子中：
```Python
result = "Yes" if condition else "No"
```
如果 `condition` 为 `True`，则 `result` 的值为 `"Yes"`；如果 `condition` 为 `False`，则 `result` 的值为 `"No"`。
这种结构使得根据简单条件快速进行值的赋值操作变得非常简洁和易读。
#### list 函数参数设置
`list()` 函数用于将可迭代对象转换为列表。它的主要作用是将元组、集合、字典等可迭代对象转换为列表。
#### 使用方法：
```Python
# 将元组转换为列表
tuple_data = (1, 2, 3)
list_data = list(tuple_data)
print(list_data)  # 输出: [1, 2, 3]
# 将集合转换为列表
set_data = {4, 5, 6}
list_data = list(set_data)
print(list_data)  # 输出: [4, 5, 6]
# 将字典的键转换为列表
dict_data = {'a': 7, 'b': 8, 'c': 9}
keys_list = list(dict_data)
print(keys_list)  # 输出: ['a', 'b', 'c']
```
#### 参数设置：
`list()` 函数可以接受一个可迭代对象作为参数，参数可以是元组、列表、集合、字典等。如果没有提供参数，则会返回一个空列表。
#### 例外情况：
- 当传递字符串作为参数时，`list()` 会将字符串分割为单个字符的列表。
- 如果传递的参数不是可迭代对象，将导致 `TypeError` 错误。
总之，`list()` 函数是一个非常有用的工具，用于快速将不同类型的数据转换为列表。
#### 无线电呼号英文序号单词
A - Alpha  
B - Bravo  
C - Charlie  
D - Delta  
E - Echo  
F - Foxtrot  
G - Golf  
H - Hotel  
I - India  
J - Juliett  
K - Kilo  
L - Lima  
M - Mike  
N - November  
O - Oscar  
P - Papa  
Q - Quebec  
R - Romeo  
S - Sierra  
T - Tango  
U - Uniform  
V - Victor  
W - Whiskey  
X - X-ray  
Y - Yankee  
Z - Zulu  
#### len 函数对不同的参数的返回值
`len()` 函数是 Python 中的一个内置函数，用来返回一个序列（如字符串、列表、元组等）或集合（如字典、集合等）的长度或元素个数。其作用是根据提供的序列或集合，返回其中元素的数量。
以下是 `len()` 函数的基本用法示例：
- 对于字符串：返回字符串中字符的个数。
- 对于列表、元组：返回其中元素的个数。
- 对于字典：返回字典中键值对的个数。
- 对于集合：返回集合中元素的个数。
例如，对于一个字符串：
```Python
my_string = "Hello"
length = len(my_string)
print(length)  # 输出为 5
```
对于一个列表：
```Python
my_list = [1, 2, 3, 4, 5]
length = len(my_list)
print(length)  # 输出为 5
```
`len()` 函数在许多情况下非常有用，因为它允许你快速获取序列或集合中的元素个数，从而在编程过程中更方便地处理这些数据结构。
#### 步长关键字使用方法
在 Python 中，`sep()` 函数实际上不是一个与步长（step）相关的函数，而是一个用于设置 `print()` 函数输出时分隔符的参数。
下面是关于 `sep` 参数的解释：
- `sep` **参数**：`sep` 是 `print()` 函数的一个关键字参数，用于指定打印多个参数时的分隔符，默认值为一个空格。当你使用 `print()` 函数打印多个值时，这些值将默认使用空格分隔开。你可以通过 `sep` 参数指定使用不同的分隔符来分隔这些值。
示例：
```Python
print("apple", "banana", "cherry")  # 默认情况下使用空格分隔
# 输出：apple banana cherry
print("apple", "banana", "cherry", sep=', ')  # 使用逗号和空格分隔
# 输出：apple, banana, cherry
print("1", "2", "3", sep=' - ')  # 使用短横线和空格分隔
# 输出：1 - 2 - 3
```
在上述示例中，`sep` 参数允许你以指定的方式定制打印输出中的分隔符。这有助于在多个值之间指定自定义的分隔符，而不是默认的空格。
#### 选中竖列元素的方法
点选选取的起始点
按住 shift + alt 点选终止点
#### 使用过个光标同时编辑
按住 alt 点选起点, 松开之后输入内容会在所有光标起点处输入
#### 美国 50 个州的缩写和名称
1. AL - Alabama
2. AK - Alaska
3. AZ - Arizona
4. AR - Arkansas
5. CA - California
6. CO - Colorado
7. CT - Connecticut
8. DE - Delaware
9. FL - Florida
10. GA - Georgia
11. HI - Hawaii
12. ID - Idaho
13. IL - Illinois
14. IN - Indiana
15. IA - Iowa
16. KS - Kansas
17. KY - Kentucky
18. LA - Louisiana
19. ME - Maine
20. MD - Maryland
21. MA - Massachusetts
22. MI - Michigan
23. MN - Minnesota
24. MS - Mississippi
25. MO - Missouri
26. MT - Montana
27. NE - Nebraska
28. NV - Nevada
29. NH - New Hampshire
30. NJ - New Jersey
31. NM - New Mexico
32. NY - New York
33. NC - North Carolina
34. ND - North Dakota
35. OH - Ohio
36. OK - Oklahoma
37. OR - Oregon
38. PA - Pennsylvania
39. RI - Rhode Island
40. SC - South Carolina
41. SD - South Dakota
42. TN - Tennessee
43. TX - Texas
44. UT - Utah
45. VT - Vermont
46. VA - Virginia
47. WA - Washington
48. WV - West Virginia
49. WI - Wisconsin
50. WY - Wyoming
请注意，这些缩写是根据美国邮政服务（USPS）的标准缩写。
#### open 函数不指定 encoding 参数
在 Python 中，当你使用 `open` 函数打开文件时，如果不指定 `encoding` 参数，那么文件的默认编码格式取决于你的操作系统和 Python 环境的配置。
在大多数现代操作系统中，文本文件的默认编码通常是 UTF-8。这是因为 UTF-8 编码具有良好的兼容性，能够表示几乎所有的字符，并且是互联网上使用最广泛的编码格式。因此，如果你在这些系统上不指定编码打开文件，Python 会尝试使用 UTF-8 编码来读取或写入文件。
然而，需要注意的是，这个默认行为并不是绝对的，它可能因 Python 的版本、操作系统的不同以及用户的配置而有所变化。例如，在某些情况下，如果操作系统或 Python 环境配置了其他默认编码（如 Windows 上的 cp 1252 或 Linux 上的 ISO-8859-1），那么不指定 `encoding` 参数时，Python 可能会使用这些编码。
为了确保文件以正确的编码格式打开，特别是在处理可能包含特殊字符或非 ASCII 字符的文本文件时，建议总是显式指定 `encoding` 参数。例如：
```Python
with open('example.txt', 'r', encoding='utf-8') as file:
    content = file.read()
```
通过指定 `encoding='utf-8'`，你可以确保无论在什么环境下，文件都是以 UTF-8 编码格式被正确读取或写入的。这样做可以避免编码不一致导致的潜在问题，如乱码或数据损坏。
#### with 函数工作原理
在 Python 中，`with` 语句用于简化资源管理，特别是文件操作。它确保即使在发生异常的情况下，资源也能被正确地释放。`with` 语句通常与 `open` 函数一起使用，以确保文件在操作完成后被正确关闭。
`with` 语句的工作原理是通过上下文管理协议（context management protocol），它依赖于两个特殊方法：`__enter__` 和 `__exit__`。当进入 `with` 代码块时，`__enter__` 方法被调用；当退出 `with` 代码块时，`__exit__` 方法被调用。
下面是一个使用 `with` 语句打开文件的例子：
```Python
with open('example.txt', 'r') as file:
    content = file.read()
    # 在这里可以对文件内容进行操作
# 文件在离开with代码块时自动关闭
```
在这个例子中，`open` 函数返回的文件对象有一个 `__exit__` 方法，该方法负责关闭文件。当执行到 `with` 代码块的末尾时，无论代码块内部是否发生异常，`__exit__` 方法都会被调用，从而确保文件被关闭。
使用 `with` 语句的好处是代码更加简洁，并且可以避免因忘记关闭文件而导致的资源泄露问题。此外，`with` 语句不仅限于文件操作，还可以用于其他需要资源管理的场景，如数据库连接、网络连接等。
在 Python 中，`with` 语句通常与 `open` 函数一起使用，用于打开文件并进行读写操作。`with` 语句提供了一种方便的方式来处理文件，确保文件在使用后正确关闭，即使在读写过程中发生异常也是如此。
在 `with` 语句中，`as file` 是一个上下文管理器的语法，它将 `open` 函数返回的文件对象赋值给变量 `file`。这样，你就可以在 `with` 语句的代码块内使用这个变量来操作文件。
例如：
```Python
with open('example.txt', 'r') as file:
    content = file.read()
```
在这个例子中：
- `with open('example.txt', 'r') as file:` 这部分代码打开了名为 `example.txt` 的文件，并以只读模式（'r'）打开。`open` 函数返回的文件对象被赋值给变量 `file`。
- `as file` 表示将 `open` 函数返回的文件对象赋给变量 `file`，这样你就可以在 `with` 语句的代码块内使用 `file` 来引用这个文件对象。
`file.read()` 是调用文件对象的 `read` 方法，用于读取文件的全部内容。`read` 方法将文件内容作为一个字符串返回。在上面的例子中，`file.read()` 读取了 `example.txt` 文件的全部内容，并将这个内容存储在变量 `content` 中。
使用 `with` 语句和 `as file` 语法的好处是，它自动管理文件的打开和关闭，无需手动调用 `file.close()` 方法。当 `with` 语句的代码块执行完毕后，文件会自动关闭，即使在读取文件时发生异常也是如此。这有助于避免文件泄露和其他资源管理问题。
#### open 函数的所有参数
在 Python 中，`open` 函数用于打开一个文件，并返回一个文件对象。该函数的完整定义如下：
```Python
open(file, mode='r', buffering=-1, encoding=None, errors=None, newline=None, closefd=True, opener=None)
```
下面是每个参数的详细说明：
1. `file`：必需参数，表示要打开的文件路径或文件对象。可以是字符串、字节字符串或路径对象。
2. `mode`：可选参数，表示文件打开的模式。默认为 `'r'`（只读模式）。常见的模式有：
   
    - `'r'`：只读模式（默认）。如果文件不存在，会抛出 `FileNotFoundError`。
    - `'w'`：写入模式。如果文件已存在，会被覆盖；如果文件不存在，会创建新文件。
    - `'x'`：独占创建模式。如果文件已存在，操作会失败。
    - `'a'`：追加模式。如果文件已存在，数据会被追加到文件末尾；如果文件不存在，会创建新文件。
    - `'b'`：二进制模式。
    - `'t'`：文本模式（默认）。
    - `'+'`：更新模式，打开一个磁盘文件进行读写。
    
    这些模式可以组合使用，例如 `'rb'` 或 `'w+'`。
    
3. `buffering`：可选参数，用于设置缓冲策略。`0` 表示无缓冲，`1` 表示行缓冲，任何大于 `1` 的值表示使用该值指定的缓冲区大小。负值（默认）表示使用系统默认的缓冲策略。
4. `encoding`：可选参数，用于指定文件的编码格式。这在处理文本文件时非常有用。默认值依赖于平台，但在大多数情况下是 `'utf-8'`。
5. `errors`：可选参数，用于指定如何处理编码错误。常见的值有 `'strict'`（默认，遇到编码错误会抛出异常）、`'ignore'`（忽略错误）、`'replace'`（用替代字符替换无法编码的字符）等。
6. `newline`：可选参数，用于控制换行符的行为。它影响读取和写入文件时的行为。默认值依赖于平台，但在大多数情况下是 `None`。
7. `closefd`：可选参数，仅当 `file` 是一个文件描述符时才相关。如果 `closefd` 为 `False`，文件描述符不会被关闭。默认值为 `True`。
8. `opener`：可选参数，是一个可调用对象，用于打开文件。它必须返回一个打开的文件描述符。这个参数通常只在高级用法中使用。
使用 `open` 函数时，通常只需要指定 `file` 和 `mode` 参数。例如：
```Python
# 打开文件进行读取
with open('example.txt', 'r') as file:
    content = file.read()
# 打开文件进行写入
with open('example.txt', 'w') as file:
    file.write('Hello, World!')
```
在使用 `open` 函数时，应当注意文件的打开和关闭，以避免资源泄露。推荐使用 `with` 语句来自动管理文件的打开和关闭。
#### 列表推导式工作原理
^047 a 06

**indices = [index for index, value in enumerate (my_list) if value == 指定的值]**
这段代码的含义是
- `enumerate(my_list)`：`enumerate` 是 Python 中的一个内置函数，它接受一个可迭代对象（在这个例子中是列表 `my_list`）作为参数，并返回一个枚举对象。这个枚举对象生成一个包含元素索引和元素值的元组序列。例如，对于列表 `[5, 1, 2, 3, 4, 5]`，`enumerate` 会生成序列 `[(0, 5), (1, 1), (2, 2), (3, 3), (4, 4), (5, 5)]`。  
    enumerate 先将 mylist 中的所有元素解包拿出来, 将每一个元素的索引和值分别打包  
    
    ```Python
    以(index,value)  #即前面放元素索引,后面放元素的值的格式
    ```
    以每个打包用元组的形式存放起来, 再将所有的元素用列表形式存储, 即:
    
    ```Python
    接受enumerate返回值的变量 = [(index,value),(index,value),(index,value).....]
    indice = [(0, 5), (1, 1), (2, 2), (3, 3), (4, 4), (5, 5)]
    ```
- 列表推导式的语法:
  
    ```Python
    [expression for item in iterable if condition]
    ```
    - `expression` 部分是 `index`，这意味着我们希望在新列表 `indices` 中存储的是 `enumerate(my_list)` 返回的每个元组中的 `index` 部分，而不是 `value` 部分。
      
        `enumerate(my_list)` 生成的每个元组包含两个元素：第一个元素是当前元素的索引（`index`），第二个元素是当前元素的值（`value`）。列表推导式中的 `for index, value in enumerate(my_list)` 语句将这些元组解包，使得每次迭代时，`index` 变量被赋予当前元组的索引值，而 `value` 变量被赋予当前元组的值。((**之所以每次迭代循环赋值是因为前面使用了 for**)
        
    - index 和 value 中间用, 表示 for 允许迭代两个元素, 否则解包出来的两个元素只会有其中一个循环赋值给 for 前面的变量
    - if 的作用是筛选出符合 value == 5 条件的元组, 并不是元组的第二个元素是元组的 value, 而是根据前面 item 自定义的名称使用 condition
- 代码的后半部分是解包— 组合— 筛选三步组合的操作 ,  
    for 前面的 expression 表示符合 if 后面的条件的元组每有一个, 执行一次将 expression 放入 indice 中作为列表中的元素的操作  
    
#### 字符串对象的 split 和 strip 方法
对字符串对象使用 split 和 strip 方法在不传入参数情况下, 会默认根据空格和换行符\n 将字符串分割成子字符串列表
强调去掉\n 的写法为
> .strip (’\n’)
这两个方法括号中可以放入多个参数, 同时去掉或者按照多个字符串分割字符串对象

^384 b 85

#### 命名空间
^21 a 604

在 Python 中，命名空间是一个用于存储变量、函数和对象名称及其对应值的系统。每个命名空间都是一个独立的环境，其中的名称不会与其他命名空间中的名称冲突。Python 使用命名空间来组织代码，防止名称冲突，并提供一种方式来管理变量和对象的生命周期。
Python 中有几种不同类型的命名空间：
1. **内置命名空间**：这是 Python 解释器启动时创建的命名空间，包含了所有的内置函数、异常、类型等。内置命名空间在 Python 程序的整个生命周期内都是可用的，不需要导入任何模块。例如，`print()`, `len()`, `type()` 等函数都定义在这个命名空间中。
2. **全局命名空间**：当 Python 解释器读取一个模块文件时，它会创建一个全局命名空间用于存储该模块中定义的所有全局变量、函数和类。这个命名空间在模块被导入时创建，并且在模块的整个生命周期内都是可用的。
3. **局部命名空间**：当一个函数被调用时，Python 会为该函数创建一个新的局部命名空间，用于存储函数内部定义的局部变量、参数等。这个命名空间只在函数执行期间存在。
当 Python 解释器查找一个名称时，它会按照以下顺序搜索这些命名空间：
1. 局部命名空间
2. 全局命名空间
3. 内置命名空间
这种查找顺序被称为 LEGB 规则，代表局部 (Local)、全局 (Global)、内置 (Built-in)。如果在这些命名空间中都找不到对应的名称，Python 会抛出一个 `NameError` 异常。
了解命名空间对于理解 Python 中的变量作用域和生命周期非常重要。例如，如果你在函数内部使用了一个与全局变量同名的局部变量，那么在函数内部，局部变量会覆盖全局变量。这种情况下，全局变量仍然存在，但只有在函数外部才能访问到它。
#### 公共名称
在 Python 中，公共名称（public names）指的是那些在模块、类或函数中定义的，且没有以下划线（_）开头的名称。这些名称是设计给外部代码使用的，它们代表了模块、类或函数的公共接口。
相对地，那些以下划线开头的名称通常被认为是私有的（private），它们不是设计给外部代码直接访问的。Python 没有强制的访问控制机制，但按照惯例，以下划线开头的名称（如单下划线 `_name` 或双下划线 `__name`）被视为内部实现的一部分，不应该在模块外部直接使用。
例如，考虑以下模块 `module.py`：
```Python
# 公共名称
public_function = lambda: print("Public function")
# 私有名称
_single_underscore = "This is single underscore"
__double_underscore = "This is double underscore"
```
在这个例子中：
- `public_function` 是一个公共名称，可以被外部代码导入和使用。
- `_single_underscore` 是一个单下划线开头的名称，虽然它不是严格私有的，但按照惯例，它被看作是模块的内部实现的一部分，不推荐外部代码直接使用。
- `__double_underscore` 是一个双下划线开头的名称，它触发了 Python 的名称改编（name mangling）机制，使得这个名称在类的内部被改编，以防止子类重写。尽管如此，它仍然可以被外部代码访问，但按照惯例，它也是内部实现的一部分。
在模块中使用 `__all__` 列表可以明确指定哪些公共名称应该被 `from module import *` 导入。如果 `__all__` 列表没有定义，那么所有公共名称都可以通过 `from module import *` 导入，但通常建议明确指定 `__all__` 列表，以清晰地定义模块的公共接口。
#### 语法糖
语法糖（Syntactic Sugar）是指在编程语言中添加的语法特性，这些特性并不增加语言的表达能力，但可以使代码更简洁、易读或更符合特定的编程风格。语法糖是一种语言设计上的便利，它使得程序员能够以更直观、更少的代码量来表达相同的逻辑。
语法糖通常不会改变程序的运行时行为或性能，它们只是提供了一种更方便的方式来编写代码。使用语法糖可以让代码更加清晰，减少冗余，提高开发效率。
一些常见的语法糖示例包括：
1. **自动类型推导**：在一些现代编程语言中，如 Python 和 C++，编译器或解释器可以根据变量的初始值自动推断其类型，从而省略显式的类型声明。
2. **列表推导式**：Python 中的列表推导式允许程序员以一种简洁的方式从一个列表生成另一个列表，例如：`[x*x for x in range(10)]`。
3. **默认参数**：在函数定义中，可以为参数指定默认值，这样在调用函数时可以省略这些参数，例如：`def func(a, b=10):`。
4. **扩展的赋值操作符**：如 `+=`、`=` 等，它们允许在赋值的同时进行运算，例如：`a += 1` 等同于 `a = a + 1`。
5. **条件表达式**：也称为三元运算符，它允许在一行内完成简单的条件判断和赋值，例如：`x = a if a > b else b`。
6. **解构赋值**：允许从列表、元组或字典中提取多个值并赋给多个变量，例如：`a, b = [1, 2]`。
语法糖的存在是为了提高代码的可读性和编写效率，但它们并不是必需的。即使没有语法糖，程序员也可以使用语言的基本语法来完成同样的任务。然而，语法糖可以使得代码更加符合人类的直觉，减少编写和维护代码时的负担。
#### 对类使用 type 结果的疑问
在 Python 中，当你打印一个类对象时，`print` 函数会输出该类的名称以及它所在的模块和类的类型。在你提供的代码中：
```Python
class Student:
     name = None
     gender = None
     nationality = None
     native_place = None
     age = None
print(Student)
```
`print(Student)` 语句输出 `<class '__main__.Student'>` 的原因如下：
- `<class '__main__.Student'>` 表示 `Student` 是一个类（`class`），并且它位于当前模块（`__main__`）中。
- `__main__` 是 Python 中一个特殊的模块名称，它代表当前执行的脚本所在的模块。当你直接运行一个 Python 脚本时，该脚本的代码就在 `__main__` 模块中执行。
- `Student` 是你定义的类的名称。
因此，`<class '__main__.Student'>` 表示你定义的 `Student` 类位于当前执行的脚本模块中。这种输出格式有助于在调试或查看类的定义时快速识别类的来源和类型。
如果你在一个模块文件中定义了 `Student` 类，并在另一个模块中导入了这个类，那么打印这个类时，输出的模块名称将不再是 `__main__`，而是包含该类定义的模块名称。例如：
```Python
# 在文件 student.py 中定义
class Student:
    pass
# 在另一个文件中导入并打印
from student import Student
print(Student)  # 输出 <class 'student.Student'>
```
在这个例子中，`student.py` 是包含 `Student` 类定义的模块文件，因此打印 `Student` 类时，输出的模块名称是 `student`。
在另一文件导入并打印时, 输出 <class 'student.Student'>表示 Student 是 student. py 文件中的 Student 类,
#### 对类中 init 函数的认识
是一种  
[Python Basics](Python%20Basics.md)
#### 在一个类中定义不同的方法返回值的理解
是的，您的理解是正确的。在 Python 中，类的每个方法都可以有自己特定的返回值，这些返回值可以是不同的数据类型，而且它们之间不会互相干扰。每个方法的返回值只会在该方法被调用时执行对应的 `return` 语句。
例如，一个类可以有多个方法，每个方法根据其功能返回不同的值：
```Python
class Calculator:
    def add(self, a, b):
        return a + b
    def subtract(self, a, b):
        return a - b
    def multiply(self, a, b):
        return a * b
    def divide(self, a, b):
        if b != 0:
            return a / b
        else:
            return "Error: Division by zero"
```
在这个 `Calculator` 类中，`add` 方法返回两个数的和，`subtract` 方法返回两个数的差，`multiply` 方法返回两个数的乘积，而 `divide` 方法返回两个数的商。如果除数为零，则返回一个错误信息。
当调用这些方法时，只有被调用的方法的 `return` 语句会被执行：
```Python
calc = Calculator()
print(calc.add(5, 3))       # 输出: 8
print(calc.subtract(5, 3))  # 输出: 2
print(calc.multiply(5, 3))  # 输出: 15
print(calc.divide(5, 3))    # 输出: 1.6666666666666667
print(calc.divide(5, 0))    # 输出: Error: Division by zero
```
每个方法的返回值只在该方法被调用时确定，而且方法的返回值可以被用于进一步的计算或作为其他函数的参数。这使得类的方法非常灵活，可以根据需要返回不同类型的数据。
#### 为什么 print (类\函数\方法\关键字的名称) 会返回内存地址?
^e 167 c 3

每一个类\函数\方法\关键字 (其实也是内置函数) 都被定义了一个__repr__方法, 这个方法的 return 值为该类\函数\方法\关键字的类型信息和内存地址, **当需要这些这些内容作为返回值时**, 如 print (类\函数\方法\关键字) 而这些类\函数\方法\关键字并没有通过 () 指定参数, 那么就会返回 repr 方法中的 return 值,
任何返回需要返回属性 ( 如: 类\函数\方法\关键字不带关键字形式 ) 直接要求显示他们的返回 return 值时都会显示__repr__中的 return
#### 方法的分类
通过类中的方法能不能对**实例的成员进行访问和修改**可以将方法分为实例方法\类方法和静态方法
#### 实例方法
它至少有一个参数（通常命名为 `self`），这个参数代表类的实例。实例方法可以访问实例的属性和方法，也可以修改实例的状态。
```Python
class MyClass:
    def __init__(self, value):
        self.instance_attribute = value
    def instance_method(self):
        print(self.instance_attribute)
        ------------------------------
        ------------------------------
        ------------------------------
```
使用了 self 表示这个方法在使用时会被允许使用虚线下 (def instance_method) 管辖范围内的所有内容, 并通过 instance_method ==**. +成员的方式引用**==
#### 类方法
类方法是通过 `@classmethod` 装饰器定义的，它至少有一个参数（通常命名为 `cls`），这个参数代表类本身。类方法可以访问类的属性和方法，但不能修改实例的状态。
```Python
class MyClass:
    class_attribute = 'Class attribute'
    ------------------------------------
    @classmethod
    def class_method(cls):--------------
    ----print(cls.class_attribute)------
    ------------------------------------
    ------------------------------------
```
使用 cls 表示可以引用虚线内的所有类中的成员, 因为第一个方法参数名称随意, 都意味着引用本身, 与 self 调用类自身方法混淆, 所以要使用装饰器放在前面作为区分
#### 静态方法
静态方法是通过 `@staticmethod` 装饰器定义的，它没有 `self` 或 `cls` 参数。静态方法既不能访问实例的属性和方法，也不能访问类的属性和方法，它们通常用于执行不依赖于类或实例的操作。
```Python
class MyClass:
    @staticmethod
    def static_method():
        print("This is a static method")
```
使用装饰器定义语法并且不输入任何参数用以和类方法和实例方法区分
#### 对方法的理解
```Python
class MyClass:
      class_attribute = 'Class attribute'
      def __init__(self, value):
          self.instance_attribute = value
      def instance_method(self):
          print(self.instance_attribute)
      @classmethod
      def class_method(cls):
          print(cls.class_attribute)
      @staticmethod
      def static_method():
          print("This is a static method")
# 创建MyClass的实例
my_instance = MyClass('Instance value')
# 调用实例方法
my_instance.instance_method()   # 输出: Instance value
# 调用类方法
MyClass.class_method()   # 输出: Class attribute
# 调用静态方法
MyClass.static_method()   # 输出: This is a static method
```
`instance_method` 是一个实例方法，它通过 `self` 参数访问实例属性。`class_method` 是一个类方法，它通过 `cls` 参数访问类属性。`static_method` 是一个静态方法，它不依赖于类或实例的属性和方法。注意，实例方法通过实例调用，类方法和静态方法通过类本身调用。
#### 类的初始化思考, 其他拓展概念
#### 函数/方法/类的初始化
1. **函数初始化**：  
    函数初始化通常指的是在函数定义时设置的默认参数值。当函数被调用时，如果没有提供某些参数，就会使用这些默认值。  
    
    ```Python
    python
    def greet(name="World"):
        print(f"Hello, {name}!")
    ```
    在上面的例子中，`name="World"` 就是函数的初始化部分。如果调用 `greet()` 而不传递任何参数，`name` 将默认为 "World"。
    
2. **方法初始化**：  
    对于类的方法，特别是  
    `__init__` 方法，它用于在创建对象时初始化对象的状态。这是类的构造器，用于设置对象的属性。
    
    ```Python
    python
    class Person:
        def __init__(self, name, age):
            self.name = name
            self.age = age
    ```
    当然, 下面这种初始化也叫初始化, 只不过没有在__init__这类魔术方法中在调用类时被封装在魔术方法中而是类中, 要稍微麻烦
    
    ```Python
    class Person:
    		name = none
    		age = none
        def __init__(self, name, age):
            self.name = name
            self.age = age
    ```
    在这个例子中，`__init__(self, name, age)` 是方法的初始化部分。创建 `Person` 类的新实例时，需要提供 `name` 和 `age` 参数，这些参数被用来设置实例的属性。
    
3. **类的初始化**：  
    类的初始化通常指的是在类定义中设置的初始状态，这通常在  
    `__init__` 方法中完成。
    
    ```Python
    python
    class Car:
        def __init__(self, model, year):
            self.model = model
            self.year = year
            print(f"A new car has been initialized: {self.model}, {self.year}")
    ```
    在这个例子中，`__init__(self, model, year)` 部分是类的初始化过程，它定义了创建 `Car` 类实例时需要的初始设置。
    
#### super 函数的参数意义
1. 第一个参数 `Singleton` 是当前类的名称，它告诉 `super()` 函数当前类是 `Singleton`。这个参数用于确定 `super()` 函数的上下文，即在哪个类的继承链中查找父类的方法。
2. 第二个参数 `cls` 是当前类的引用，它指向当前正在执行的类（在 `__new__` 方法中，`cls` 就是 `Singleton`）。这个参数用于 `super()` 函数在继承链中向上查找父类时，确定从哪个类开始查找.
**既然 super 函数的功能是查找并调用父类中已经被复写的成员**
那么就需要知道现在自己在当前在哪一类 ( 第一个参数 ), 自己要从哪里开始网上找自己的父类,是谁 ( 确定继承关系, 在多继承中有助于定义想要集成哪个父类的成员, 而不干扰另一个父类的 )
- 第一个参数确定自己是某一个人的儿子
- 第二个函数确定自己的父亲
![Untitled 1 40.png](../Attachments/Untitled%201%2040.png)
下面的例子可以说明多继承情况下的父类判定方法
```Python
class A:
    def __init__(self):
        print("A __init__")
class B(A):
    def __init__(self):
        super(B, self).__init__()  # 调用父类A的__init__方法
        print("B __init__")
class C(A):
    def __init__(self):
        super(C, self).__init__()  # 调用父类A的__init__方法
        print("C __init__")
class D(B, C):
    def __init__(self):
        super(D, self).__init__()  # 调用父类B的__init__方法
        print("D __init__")
# 创建D类的实例
d = D()
```
注意调用 D 中方法得到的是 B 类作为父类而不是 C——- [Python Basics](Python%20Basics.md)
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
```Python
def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(Singleton, cls).__new__(cls, *args, **kwargs)
                              """
                              第一参数↑↑↑↑Singleton告知super函数现在的
											        位置在         ↑↑↑第二个cls表示从__new__
这个方法这里开始向上找自己是谁的子类.写cls原因是__new__的第一个参数是cls,
表示当前执行的类时__new__方法所在的类,从这个位置向上开始找父类
											        """
```