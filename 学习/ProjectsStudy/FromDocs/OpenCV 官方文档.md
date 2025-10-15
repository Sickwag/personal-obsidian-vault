---
source: https://docs.opencv.ac.cn/4.12.0/
create: 2025年10月14日15:09:24
---
# 简介
## 图像入门
```cpp
#include <opencv2/core.hpp>
#include <opencv2/imgcodecs.hpp>
#include <opencv2/highgui.hpp>
 
#include <iostream>
 
using namespace cv;
 
int main() {
std::string image_path = samples::findFile("starry_night.jpg");
    Mat img = imread(image_path, IMREAD_COLOR);
 
    if(img.empty()) {
		std::cout << "无法读取图像: " << image_path << std::endl;
        return 1;
    }
	imshow("显示窗口", img);
    int k = waitKey(0); // 等待窗口中的按键
    if(k == 's') {
		imwrite("starry_night.png", img);
    }
    return 0;
}
```
简单编写的**用窗口**展示图片信息，按下 s 键保存图片
# 主要模块
## 核心功能 (core)
### Mat 基本图像容器
#### 基本原理
每个Mat对象都有自己的头部，但一个矩阵可以通过让其矩阵指针指向同一地址而在两个_Mat_对象之间共享。
当矩阵数据不再需要时，最后一个使用它的对象负责清理这块内存，这是由于 Mat 对象使用**引用计数**方法（类似于[[Modern C++#5.3 `std unique_ptr`|智能指针]]）来管理内存
矩阵数据有**通道属性**，**是指图像或矩阵中每个像素点所包含的数据维度**，如 RGB 图像有三个通道
opencv 中的颜色构建方式：
- RGB是最常见的，因为我们的眼睛使用类似的方式，但请记住OpenCV的标准显示系统使用BGR颜色空间（红色和蓝色通道互换位置）来组合颜色
- HSV和HLS将颜色分解为色相、饱和度和值/亮度分量，这对于我们来说是一种更自然的描述颜色的方式。例如，您可以忽略最后一个分量，使您的算法对输入图像的光照条件不那么敏感。
- YCrCb 被流行的 JPEG 图像格式使用。

显式创建 Mat 容器对象
```cpp
Mat M(2,2, CV_8UC3, Scalar(0,0,255)); // 行数，列数，点阵类型，通道数
cout << "M = " << endl << " " << M << endl << endl;
```
指定用于存储元素的数据类型和每个矩阵点的通道数。为此，我们有根据以下约定构建的多种定义 `CV_[每项位数][有符号或无符号][类型前缀]C[通道数]` 

| 部分       | 含义                  | 示例                                        |
| -------- | ------------------- | ----------------------------------------- |
| `[位数]`   | 每个元素占用的位数           | 8, 16, 32, 64                             |
| `[S/U]`  | S=有符号（signed），U=无符号 | U=无符号，S=有符号                               |
| `[类型前缀]` | 类型简称                | C=char, S=short, I=int, F=float, D=double |
| `C[通道数]` | 每个像素点包含几个通道         | C 1/C 2/C 3/C 4                           |
- `CV_8UC1`：8 位无符号单通道
- `CV_8UC3`：8 位无符号三通道
- `CV_8UC4`：8 位无符号四通道
- `CV_16SC1`：16 位有符号单通道
- `CV_32FC1`：32 位浮点单通道
构造函数中如果在前两个参数中填入的是两个 int 类型参数，则表示当前 Mat 对象是一个二维对象，如果要实现多维图像，则需要在第一个参数填入维度，第二个参数中填入维度信息，比如 `2*2*2` 的三维空间就需要填入一个 int 数组，并且内容为：`{2,2,2}`
#### 创建 mat 对象方法
```cpp
int sz[3] = {2, 2, 2}; // 定义三维：2层 × 2行 × 2列
cv::Mat L(3, sz, CV_8UC1, cv::Scalar::all(0));

// 还可以**通过宏**自定义通道数量
M.create(4,4, CV_8UC(2));
cout << "M = "<< endl << " " << M << endl << endl;
```
如果 Mat 构造函数最后一个**初始化参数**不填则会生成随机值，可以使用 `randu()` 函数设置随机值范围
```cpp
randu(R, Scalar::all(0), Scalar::all(255));
```
可以使用 mat 对象的 `.type()` 返回类型
获取这张图片的信息：
```cpp
std::cout << "Dimensions: " << img.dims << std::endl;
std::cout << "Rows: " << img.rows << std::endl;
std::cout << "Cols: " << img.cols << std::endl;
std::cout << "Channels: " << img.channels() << std::endl;
std::cout << "Type: " << img.type() << std::endl;
-------------------------------
Dimensions: 2
Rows: 1448
Cols: 1448
Channels: 3
Type: 16
```
对于小矩阵，可以使用
```cpp
Mat C = (Mat_<double>(3,3) << 0, -1, 0, -1, 5, -1, 0, -1, 0);
C = (Mat_<double>({0, -1, 0, -1, 5, -1, 0, -1, 0})).reshape(3);

// 但是不能使用，**`cv::Mat_` 不支持 C++11 初始化列表语法**（即 `{}`）
Mat_<double> triple_matrix(2,2,2) {1,2,3,4,5,6,7,8};
// 但是可以使用
int dims[3] = {2, 2, 2};
cv::Mat_<double> mat(3, dims); // 创建 2x2x2 矩阵，未初始化
// 手动赋值（按 z-y-x 顺序）
mat(0,0,0) = 1; mat(0,0,1) = 2;
mat(0,1,0) = 3; mat(0,1,1) = 4;
mat(1,0,0) = 5; mat(1,0,1) = 6;
mat(1,1,0) = 7; mat(1,1,1) = 8;
```


