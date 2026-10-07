![[Pasted image 20250327130718.png]]
## PyTorch 官方文档
### 张量
[Tensors — PyTorch Tutorials 2.6.0+cu124 documentation](https://pytorch.org/tutorials/beginner/basics/tensorqs_tutorial.html)
默认情况下，张量是在 CPU 上创建的。我们需要使用 `.to` 方法实现，但在不同 device 中复制张量数据非常消耗时间和算力
省略号 `...` 是Python中一种特殊语法，用于在多维数组中表示“所有未被显式指定的维度”。它的作用类似于在切片中省略某些维度的写法，但其意义更明确，特别是在处理高维数组时非常有用。
- `tensor[:, :, -1]` 表示对第3维（最后一个维度）取最后一个元素。
- `tensor[..., -1]` 也表示对最后一个维度取最后一个元素，但它更简洁，尤其在高维情况下。
`tensor = torch.arange(24).reshape(2, 3, 4)` 创建了一个形状为 `(2, 3, 4)` 的张量，内容为
```python
第一个2维切片：
[[ 0,  1,  2,  3],
 [ 4,  5,  6,  7],
 [ 8,  9, 10, 11]],
第二个2维切片：
[[12, 13, 14, 15],
 [16, 17, 18, 19],
 [20, 21, 22, 23]]

第一个2维切片的第3维最后一个元素：
[ 3,  7, 11],
第二个2维切片的第3维最后一个元素：
[15, 19, 23]
所以使用print(tensor[..., -1])得到的结果为：
tensor([[ 3,  7, 11],
        [15, 19, 23]])
```
张量数据类型和切片操作
```python
if torch.cuda.is_available():
    tensor = tensor.to("cuda")

tensor = torch.ones(3, 4)
# tensor = torch.ones(3, 4, dtype=torch.int32)
# tensor = tensor.to(dtype=torch.int32)
print(f"first row: {tensor[0]}")
print(f"first col: {tensor[:, 1]}")
print(f"last elem in last dimension: {tensor[..., -1]}")
tensor[:, 1] = 0  # 设置第二列元素全为0
print(tensor)
# pytorch tensor.one create dtype in torch.float32 in default, so all elements of tensor is 1. ,not i
```
联结张量：
```python
t1 = torch.cat([tensor, tensor, tensor], dim=1) # 如果不加dim = 1会将所有张量纵向连接
print(t1)
```
`dim` 参数指定了拼接的维度。例如：

- 如果 `dim=0`，表示在第 0 维（行方向）上拼接。
- 如果 `dim=1`，表示在第 1 维（列方向）上拼接。
- 如果 `dim=2`，表示在第 2 维（深度方向）上拼接，依此类推。
- `dim` 参数的取值范围取决于输入张量的维度（`ndim`）。对于一个 `n` 维张量，`dim` 的取值范围是 `[0, n-1]`，超出张量的维度范围，会抛出 `IndexError` 异常。
Arithmetic operations：
矩阵相乘分为矩阵乘法和逐元素相乘两种
矩阵乘法是指两个矩阵的乘积，结果是一个新的矩阵。在PyTorch中，矩阵乘法可以通过以下方式实现：
- `@` 运算符
- `tensor.matmul()` 方法
- `torch.matmul()` 函数
逐元素乘法是指两个张量在相同位置上的元素相乘，结果是一个新的张量。在PyTorch中，逐元素乘法可以通过以下方式实现：
- `*` 运算符
- `tensor.mul()` 方法
- `torch.mul()` 函数
```python
y1 = tensor @ tensor.T
y2 = tensor.matmul(tensor.T)
y3 = torch.rand_like(y1)
torch.matmul(tensor, tensor.T, out=y3)  # 矩阵相乘

z2 = tensor * tensor
z1 = tensor.mul(tensor)
z3 = torch.rand_like(tensor)
torch.mul(tensor, tensor, out=z3)  # 逐元素相乘

print(y3)
print(z3)
```
张量转换和就地操作：
```python
# 单元数张量转为python值
agg = tensor.sum()
agg_item = agg.item()
print(agg_item, type(agg_item))

split_line()
# modify tensor in-place
print(f"{tensor} \n")
tensor.add_(5)
print(f"{tensor}\n")
```
就地操作的所有函数后会加上 `_` 作为后缀

---
桥接 numpy 和 tensor
```python
t = torch.ones(5)
print(f"t: {t}")
n = t.numpy()
print(f"n: {n}")
```
n 直接使用 t 的内存地址解析出 numpy 数据

原地修改 numpy 和 tensor 张量
```python
# modify tensor in-place
print(f"{tensor} \n")
tensor.add_(5)
print(f"{tensor}\n")
split_line()
t = torch.ones(5)
print(f"t: {t}")
n = t.numpy()
print(f"n: {n}")

n = np.ones(5)  # 一维全1向量，长度为5
t = torch.from_numpy(n)
print(n)
print(t)

split_line()
# 更改同一内存位置的numpy或者tensor会互相影响
np.add(n, 1, out=n)
print(n)
print(t)
```
#### Loading a Dataset
```python
training_data = datasets.FashionMNIST(
    root="data", train=True, download=True, transform=ToTensor()
)

test_data = datasets.FashionMNIST(
    root="data", train=False, download=True, transform=ToTensor()
)
# 下载训练和测试数据集
labels_map = {
    0: "T-Shirt",
    1: "Trouser",
    2: "Pullover",
    3: "Dress",
    4: "Coat",
    5: "Sandal",
    6: "Shirt",
    7: "Sneaker",
    8: "Bag",
    9: "Ankle Boot",
}
figure = plt.figure(figsize=(8, 8))  # 创建一个8x8英寸的画布
cols, rows = 3, 3  # 设置每行和每列的图像数量，总共9个子图
for i in range(cols * rows + 1):  # 循环10次，i从0到9
    # 随机选择一个样本索引
    sample_idx = torch.randint(len(training_data), size=(1,)).item()
    img, label = training_data[sample_idx]  # 获取图像和标签
    # 添加子图
    figure.add_subplot(1, rows, cols, i)
    plt.title(labels_map[label])  # 设置标题为标签名称
    plt.axis("on")  # 显示坐标轴
    plt.imshow(img.squeeze(), "gray")  # 显示图像，使用灰度模式
plt.show()  # 显示所有图像
```
Matplotlib 的 `pyplot` 模块（即 `plt`）维护了一个**全局状态机**，它会自动跟踪当前活跃的 `figure` 和 `axes`（子图）。当你在代码中通过 `figure.add_subplot()` 添加子图时，这些子图会被自动关联到当前的 `figure` 对象，而 `plt.show()` 会渲染所有已创建的 `figure` 对象。
- **`figure = plt.figure(figsize=(8, 8))`**
    显式创建一个新的 `figure` 对象，并将其设置为当前活跃的 `figure`。
- **`figure.add_subplot(rows, cols, i)`**
    向该 `figure` 中添加子图，每次添加的子图会被存储在 `figure` 的 `axes` 列表中。
- **`plt.show()`**
    显示所有已创建的 `figure` 对象（包括当前 `figure` 及其子图）。
每次调用 `plt.figure()` 都会生成一个新的独立窗口，所以不用担心 plt 的名称是唯一的而导致混乱，真正存储图表数据的还是使用 `plt.figure` 创建的变量，`plt.show ()` 只是一个方法，自动扫描所有 figure 对象并显示出来
```python
import matplotlib.pyplot as plt
import numpy as np

# 创建第一个 figure 窗口
fig1 = plt.figure("窗口1", figsize=(5, 5))
plt.plot(np.random.rand(10))
plt.title("窗口1的图表")

# 创建第二个 figure 窗口
fig2 = plt.figure("窗口2", figsize=(5, 5))
plt.plot(np.random.rand(10))
plt.title("窗口2的图表")

# 一次性显示所有窗口
plt.show()
```

#### Creating a Custom Dataset for your files
自定义 Dataset 类必须实现三个函数：`__init__`、`__len__ ` 和 `__getitem__`
```python
class CustomImageDataset(Dataset):
    """
    FashionMNIST 图像存储在目录 img_dir 中，其标签单独存储在 CSV 文件 annotations_file 中。
    """

    def __init__(
        self, annotations_file, img_dir, transform=None, target_transform=None
    ) -> None:
        self.img_labels = pd.read_csv(annotations_file) # 读取文件中标签
        self.img_dir = img_dir
        self.transform = transform  # 使用transform函数对图像预处理
        self.target_transform = transform  # 对标签进行预处理

    def __len__(self):
        return len(self.img_labels)

    def __getitem__(self, idx):
    	"""
    	获取单个图片的信息
    	"""
        img_path = os.path.join(self.img_dir, self.img_labels.iloc[idx, 0])  # type: ignore # 写入图像路径，用图片文件夹路径和标签路径（文件名）拼接形成
        image = read_image(img_path)  # read_image来自torch，所以会将图像转化为张量
        label = self.img_labels.iloc[idx, 1]
        if self.transform:
            image = self.transform(image)
        if self.target_transform:
            image = self.target_transform(image)
        return image, label
```

#### Preparing your data for training with DataLoaders
`DataLoader` is an iterable that abstracts this complexity for us in an easy API.
```python
train_dataloader = DataLoader(training_data)
test_dataloader = DataLoader(test_data)
```
用之前的数据集放入迭代器中
- `batch_size=64`：指定每个批次的大小为 64，即每次从数据集中加载 64 个样本。
- `shuffle=True`：在每个 epoch 开始时打乱数据顺序，以确保模型训练时不会受到数据顺序的影响。
- `ataLoader` 支持多线程加载数据（通过 `num_workers` 参数），可以加速数据加载过程。
展示数据
```python
train_features, train_labels = next(iter(train_dataloader))
print(f"feature batch shape: {train_features.size()}")
print(f"label batch shape: {train_labels.size()}")
img = train_features[0].squeeze()
label = train_labels[0]
plt.imshow(img)
plt.show()
```
### Transforms
所有 TorchVision 数据集都有两个参数 - `transform` 用于修改特征和 `target_transform` 修改标签 - 接受包含转换逻辑的可调用对象。[torchvision.transforms](https://pytorch.org/vision/stable/transforms.html) 模块提供了几种开箱即用的常用转换 (out of the box)
- **`ToTensor()`** 是 PyTorch 提供的转换函数，它将 PIL 图像或 NumPy 数组转换为 PyTorch 张量。
- 转换后的张量形状为 `(C, H, W)`，其中 `C` 是通道数（对于灰度图像，`C=1`），`H` 是高度，`W` 是宽度。
- 图像像素值会被归一化到 `[0, 1]` 范围。
```python
Lambda(lambda y: torch.zeros(10, dtype=torch.float).scatter_(0, torch.tensor(y), value=1))
```
中 **`Lambda`**：定义一个匿名函数，用于自定义转换逻辑。
- **`torch.zeros(10, dtype=torch.float)`**：创建一个长度为 10 的全零张量（对应 10 个类别）。
- **`scatter_(0, torch.tensor(y), value=1)`**：将标签 `y` 对应的位置设置为 `1`，实现 one-hot 编码。
    - 例如，如果 `y = 2`，则转换后的张量为 `[0, 0, 1, 0, 0, 0, 0, 0, 0, 0]`。
```python
ds = datasets.FashionMNIST(
    root="data",
    train=True,
    download=True,
    transform=ToTensor(), # 定义对训练集中图片的转化方式，这里将图片转化为tensor
    target_transform = Lambda(lambda y: torch.zeros(10,dtype=torch.float).scatter_(0,torch.tensor(y),value=1))
    # 这里定义对标签进行转换，使用匿名函数定义转换规则
)
```
转换规则为：生成一个长度为 10 的全 0 浮点数张量，并将传入的参数对应的张量中列改为 1
[ToTensor](https://pytorch.org/vision/stable/transforms.html#torchvision.transforms.ToTensor) 将 PIL 图像或 NumPy `ndarray` 转换为 `FloatTensor`。并在 [0.， 1] 范围内缩放图像的像素强度值。

### Build the Neural Network
全连接网络（Fully Connected Network，FCN），也称为多层感知机（Multilayer Perceptron，MLP），是一种最基本的神经网络结构。它的特点是：

- **每一层的神经元与下一层的所有神经元相连**，即每个输入特征都会影响下一层的每个神经元。
- 通过线性变换（矩阵乘法）和非线性激活函数（如 ReLU）的组合，学习输入数据到输出目标的映射关系。
- 全连接网络是神经网络的基础，具有以下优点：
	- **简单易用**：结构清晰，易于理解和实现。
	- **通用性**：理论上可以逼近任何连续函数（万能逼近定理）。
	- **灵活性**：可以处理各种类型的数据（如图像、文本、数值等）。