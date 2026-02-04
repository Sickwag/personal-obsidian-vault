## 1.5 Numpy
使用numpy创建的数组和python内置列表是不同的[python中数据容器](Python%20Basics.md#^9e8467)
- 加减乘除操作没啥好说,
- 使用np.array([0],[1],[2])创建数组任意维度数组, 将其赋值给对象使用`.shape`方法可以查看数组类型.`.dtype`属性来获取数组中**元素的**数据类型。
	```python
import numpy as np

# 创建一个整数类型的数组
a = np.array([1, 2, 3])

# 获取数组的数据类型
dtype = a.dtype

print(dtype)  # 输出: int32
```
数组之间的乘法计算可以是元素间的乘法(element-wise multiplication)，也可以是矩阵乘法(matrix multiplication)。这两种乘法在NumPy中使用不同的操作符或函数来实现。

### 元素间乘法 (Element-wise Multiplication)
元素间乘法是指对应位置的元素相乘，结果数组的每个元素是原数组对应位置元素的乘积。这种乘法在NumPy中使用`*`操作符来实现。
例如：
```python
import numpy as np

# 创建两个数组
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

# 元素间乘法
c = a * b

print(c)  # 输出: [ 4 10 18]
```
在这个例子中，数组`a`和`b`的对应元素相乘，得到新的数组`c`。
### 矩阵乘法 (Matrix Multiplication)
矩阵乘法是指按照矩阵乘法的规则进行计算，结果数组的每个元素是原矩阵对应行和列元素乘积的和。在NumPy中，矩阵乘法可以使用`np.dot()`函数或者`@`操作符来实现。
```python
import numpy as np

# 创建两个矩阵
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# 矩阵乘法
C = np.dot(A, B)

# 或者使用 @ 操作符
C = A @ B

print(C)  # 输出: [[19 22]
          #       [43 50]]
```
- 当进行元素间乘法时，两个数组的形状必须兼容。如果两个数组的维度不同，NumPy会尝试进行广播（broadcasting），使得形状较小的数组在必要的维度上扩展以匹配形状较大的数组。
- 当进**行矩阵**乘法时，两个矩阵的维度必须兼容。具体来说，第一个矩阵的列数必须等于第二个矩阵的行数。
### 广播
数组在广播原理下相乘
![Pasted image 20240727153701.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240727153701.png)
### 访问元素
同列表访问元素一样[下表索引](Python%20Basics.md#^033e3c)
- 使用`flatten`方法可以将多维数组转换为一维数组,方便转为内置容器
- 写代码在不同元素之间使用`,`分割,但用`print`打印出内容相邻两个元素之间用空格分开
```python
import numpy as np

x = np.array([[51, 55], [14, 19], [0, 4]])
print(x)

new_x = x.flatten
print(new_x())
# 输出
[[51 55]
 [14 19]
 [ 0  4]]
[51 55 14 19  0  4]
```

## 1.6 Matplotlib

### 基本绘图方法

`matplotlib` 是一个 Python 的绘图库，它提供了丰富的接口来创建各种静态、动态和交互式的图表。在 `matplotlib` 中，`plot` 和 `show` 是两个非常基础且常用的方法，分别用于绘制图形和显示图形。

### plot 方法

`plot` 方法用于绘制二维图形，可以绘制线图、散点图、条形图等。它的基本语法如下：

```python
matplotlib.pyplot.plot(*args, scalex=True, scaley=True, data=None, **kwargs)
```

- `*args`：接收一系列的参数，可以是两个数组（分别代表x和y坐标），也可以是一个二维数组（其中每一行代表一组x和y坐标）。
- `scalex` 和 `scaley`：布尔值，分别控制x轴和y轴是否自动缩放。
- `data`：一个包含数据的 `matplotlib` 的 `BboxBase` 对象。
- `**kwargs`：用于设置线条的属性，如颜色、线型、标记等。

`plot` 方法的参数非常丰富，可以用来定制图形的各个方面。例如：

```python
import matplotlib.pyplot as plt

# 绘制简单的线图
plt.plot([1, 2, 3], [4, 5, 6])

# 使用不同的颜色和线型
plt.plot([1, 2, 3], [4, 5, 6], color='red', linestyle='--')

# 添加标记
plt.plot([1, 2, 3], [4, 5, 6], marker='o')

# 设置坐标轴标签和标题
plt.xlabel('X Axis Label')
plt.ylabel('Y Axis Label')
plt.title('Simple Plot Example')

# 显示图形
plt.show()
```

### show 方法

`show` 方法用于显示通过 `matplotlib` 创建的图形。它通常在所有的绘图命令之后调用，以确保所有的图形元素都被正确渲染并显示出来。`show` 方法的语法非常简单：

```python
matplotlib.pyplot.show(block=None)
```

- `block`：布尔值，控制 `show` 方法的行为。如果为 `True`，则 `show` 方法会阻塞，直到图形窗口被关闭。如果为 `False`，则 `show` 方法会立即返回，允许程序继续执行其他任务。

`show` 方法通常不需要任何参数，只需要在绘图命令之后调用即可：

```python
import matplotlib.pyplot as plt

# 绘制图形
plt.plot([1, 2, 3], [4, 5, 6])

# 显示图形
plt.show()
```

在实际使用中，`plot` 和 `show` 方法通常结合使用，先用 `plot` 方法绘制图形，然后用 `show` 方法显示图形。需要注意的是，`show` 方法应该只被调用一次，多次调用可能会导致图形显示不正确。
```python
import numpy as np
import matplotlib.pyplot as plt

x_array = np.arange(0,6,0.1)   # 前两个数是上下限,最后一个是精度
y_array = np.sin(x_array)
plt.plot(x_array,y_array)
plt.show()
```

# 第三章神经网络
## 3.2  激活函数
### 跃迁函数
![Pasted image 20240926133513.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240926133513.png)
```python
import numpy as np
import matplotlib.pylab as plt

def step_function(x):
    return np.array(x > 0, dtype=np.int)

x = np.arange(-5.0, 5.0, 0.1)
y = step_function(x)
plt.plot(x, y)
plt.ylim(-0.1, 1.1) # 指定y轴的范围
plt.show()
```
其中 `np.array(x > 0, dtype=np.int)` ，x 表示数组中每一个元素，`x>0` 表示将每一个元素和 0 比较，结果转化为 bool 数组，再通过位置传参，将 bool array 数组转化为 NumPy 数组（原本的布尔数组 `[True, False, True, ...]` 会被转换为整数数组 `[1, 0, 1, ...]`）

`step_function` 函数实现了一个阶跃函数（step function），它将所有正数映射为1，将0和负数映射为0。这种函数在信号处理和机器学习等领域中经常用作激活函数或阈值函数。
### sigmod 函数
#### 代码
![Pasted image 20240926132511.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240926132511.png)
```python
import numpy as np
import matplotlib.pylab as plt
def sigmoid(x):
    return 1 / (1 + np.exp(-x))
x = np.arange(-5,5,0.1)
y = sigmoid(x)
plt.plot(x,y)
plt.ylim(-0.1,1)
plt.show()
```
#### np. array 数组
**参数说明：**
`numpy.array (object, dtype=None, ...)`
**object**：数组接口兼容的对象，例如列表、元组、其他 NumPy 数组或数值数据，用于创建数组。
**dtype**：可选参数，用于明确指定数组元素的数据类型。若未指定，则根据输入数据自动推断。
**copy**（布尔值，指示是否复制数据）、
**order**（指定数组内存存储顺序，'C' 或 'F'）、
**ndmin**（指定返回数组的最小维度）等。
注意 array 接受的是一个输入作为参数，输入 `np. array([1,2,3,4])` 才是正确的
```python
# 创建多维数组
multi_dim_array = np.array([[1, 2], [3, 4]])
print(multi_dim_array)
# 输出:
# [[1 2]
#  [3 4]]
```
#### np. arange 数组
用于生成一个具有均匀间隔值的数组。这个函数非常类似于 Python 内置的 `range` 函数，但它返回的是一个 NumPy 数组**而不是一个 range 对象**。
**参数**
`numpy.arange([start, ]stop, [step, ]dtype=None)`

- **start**：序列的起始值，默认为0。
- **stop**：序列的终止值，生成的数组不包括此值。
- **step**：序列中相邻值之间的间隔，默认为1。
- **dtype**：可选参数，用于指定返回数组的数据类型。

### ReLU 函数
![375](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240926134619.png)
```python
import numpy as np
import matplotlib.pylab as plt
def ReLU(x):
    return np.maximum(0,x)
x = np.arange(-5,5,0.1)
y = ReLU(x)
plt.plot(x,y)
plt.show()
```

1. **非线性激活**：尽管 ReLU 函数在非正数区域是线性的，但它在正数区域是非线性的。这种非线性特性对于构建复杂的神经网络模型至关重要，因只有非线性函数才能让网络学习和模拟复杂的函数映射。
2. **计算效率**：ReLU 函数的计算非常高效，因它只涉及比较和乘法操作（对于正数输入）。这使得在训练大型神经网络时，ReLU 可以显著减少计算量。
3. **缓解梯度消失问题**：在传统的 Sigmoid 或 Tanh 激活函数中，当输入值远离零点时，梯度会变得非常小，导致梯度消失问题。ReLU 函数在正数区域梯度恒为 1，这有助于缓解梯度消失问题，使得深层网络的训练更加稳定。
4. **稀疏性**：ReLU 函数的输出为零的特性使得网络中一部分神经元在训练过程中可能完全不激活，这导致了一种稀疏性，有时可以减少过拟合的风险，并且可以作为一种正则化手段。
## 3.3多维数组运算
### 基本认识
数组维度可以通过 `np.ndim` 返回得到
`A.shape` 返回 `(4,)`，表示数组 `A` 是一维的，并且包含4个元素。而 `A.shape[0]` 返回 `4`，表示数组在它的唯一维度上有4个元素。
`print` 数组会得到数组的形状
1. **对应位置元素相乘（Hadamard 乘积）**：要计算两个矩阵对应位置元素相乘，应使用 `*` 运算符。这种操作也被称为逐元素乘法或Hadamard乘积。
2. **矩阵点积（内积或矩阵乘法）**：要计算两个矩阵的点积（内积），应使用 `numpy.dot()` 函数或 `@` 运算符。

### 3 层神经网络实现
#### 逻辑代码
```python
X = np.array([1.0, 0.5])
W1 = np.array([[0.1, 0.3, 0.5], [0.2, 0.4, 0.6]])
B1 = np.array([0.1, 0.2, 0.3])

# first level signature delivery
print(W1.shape) # (2, 3)
print(X.shape) # (2,)
print(B1.shape) # (3,)
A1 = np.dot(X, W1) + B1
print(A1)
Z1 = sigmoid(A1)
print(f"first level result is {Z1}")

def identity_function(x):
    return x

# second level
W2 = np.array([[0.1, 0.4], [0.2, 0.5], [0.3, 0.6]])
B2 = np.array([0.1, 0.2])

print(Z1.shape) # (3,)
print(W2.shape) # (3, 2)
print(B2.shape) # (2,)
A2 = np.dot(Z1, W2) + B2
Z2 = sigmoid(A2)
print(f"second level result is {Z2}")

# third level
W3 = np.array([[0.1, 0.3], [0.2, 0.4]])
B3 = np.array([0.1, 0.2])
A3 = np.dot(Z2, W3) + B3

Y = identity_function(A3) # doesn't need sigmoid anymore
print(f"final level result is {Y}")
```
#### 重构后代码
```python
def init_network():
    network = {} # define a dict
    network['W1'] = np.array([[0.1, 0.3, 0.5], [0.2, 0.4, 0.6]])
    network['b1'] = np.array([0.1, 0.2, 0.3])
    network['W2'] = np.array([[0.1, 0.4], [0.2, 0.5], [0.3, 0.6]])
    network['b2'] = np.array([0.1, 0.2])
    network['W3'] = np.array([[0.1, 0.3], [0.2, 0.4]])
    network['b3'] = np.array([0.1, 0.2])
    return network

def forward(network, x):
	# calculate work
    W1, W2, W3 = network['W1'], network['W2'], network['W3']
    b1, b2, b3 = network['b1'], network['b2'], network['b3']
    a1 = np.dot(x, W1) + b1
    z1 = sigmoid(a1)
    a2 = np.dot(z1, W2) + b2
    z2 = sigmoid(a2)
    a3 = np.dot(z2, W3) + b3
    y = identity_function(a3)
    return y

network = init_network()
x = np.array([1.0, 0.5])
y = forward(network, x)
print(y) # [ 0.31682708 0.69627909]
```
## 3.5 输出层设计
### 恒等函数
![Pasted image 20240926143822.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240926143822.png)
原样输出，不改变类型和值
### softmax 函数
对于一个向量 𝑧=[𝑧1,𝑧2,...,𝑧𝐾]z=[z1​,z2​,...,zK​]，Softmax 函数定义为：
![Pasted image 20240926143848.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240926143848.png)
**意义**
1. **分类任务**：在机器学习中，分类任务是核心问题之一。Softmax 函数能够将模型的输出转换为概率分布，使得可以直观地解释为属于各个类别的概率。
2. **多标签分类**：在多标签分类问题中，一个实例可能属于多个类别。Softmax 函数可以为每个类别提供一个概率值，从而支持这种类型的分类。
3. **损失函数**：Softmax 函数通常与交叉熵损失函数一起使用，因交叉熵损失函数衡量的是预测概率分布与真实概率分布之间的差异，而 Softmax 函数提供了这种概率分布。
4.**概率解释**：Softmax 函数的输出具有概率的性质，这意味着可以直观地解释模型的预测结果，这对于理解和信任模型的预测非常重要。

计算机处理“数”时，数值必须在 4 字节或 8 字节的有限数据宽度内。这意味着数存在有效位数，为了防止 e 的指数过大导致 nan 错误，softmax 需要改进
![Pasted image 20240926144852.png](../../../Files%20&%20LongText/Attachments/Pasted%20image%2020240926144852.png)
这里的 C' 可以使用任何值，但为了防止溢出，一般会使用输入信号中最大值。上式可以得出，a 的大小不重要，e 的指数加上（或者减去）某个常数并不会改变运算的结果。
所以代码可改进，防止溢出
```python
def softmax(a):
    c = np.max(a)
    result = np.exp(a - c) / np.sum(np.exp(a - c))
    return result

a = np.array([1010,1000,9901])
print(softmax(a))# [  9.99954600e-01,   4.53978686e-05,   2.06106005e-09])太小了不好显示
print(np.sum(softmax(a)))
```
输出总和为 1 是 softmax 函数的一个重要性质。我们可以把 softmax 函数的输出解释为“概率”，softmax 和指数函数都单调递增，所以各元素间的大小关系不改变，a 的最大值是第 2 个元素，y 的最大值也仍是第 2 个元素。
### 输出层的设计
输出层的神经元数量需要根据待解决的问题来决定。神经元数量一般设定为类别的数量。