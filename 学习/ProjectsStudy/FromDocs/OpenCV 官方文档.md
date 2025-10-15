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
每个Mat对象都有自己的头部，但一个矩阵可以通过让其矩阵指针指向同一地址而在两个_Mat_对象之间共享。
当矩阵数据不再需要时，最后一个使用它的对象负责清理这块内存，这是由于 Mat 对象使用**引用计数**方法（类似于[[Modern C++#5.3 `std unique_ptr`|智能指针]]）来管理内存
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
`CV_8UC3`使用8位长的无符号字符类型，每个像素有三个这样的通道来组成三个通道