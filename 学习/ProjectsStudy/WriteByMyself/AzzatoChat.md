---
created: 2026-04-17
description: 模仿llfc的qt全栈聊天项目
参考视频: https://www.bilibili.com/video/BV1k2421K7ZB?spm_id_from=333.788.videopod.sections&vd_source=876be08bc9c030f4a9ea1fb97e0d0342
参考文档: https://www.yuque.com/lianlianfengchen-cvvh2/dz8xhn/cdg06fkzuc7w4els
---
## 基本 UI 构建
### LoginDialog
#### 图片按窗口比例缩放
如果需要让图片按比例大小显示在 QLabel 中
![[Pasted image 20260401092221.png]]
```cpp
wxQRLabel_ = new QLabel(this);
QPixmap pic(QString(":/resource/wxQR.jpg"));
QPixmap scaledPic = pic.scaled(200, 200, Qt::KeepAspectRatio, Qt::SmoothTransformation);
wxQRLabel_->setPixmap(scaledPic);
mainlayout->addWidget(wxQRLabel_, 0, Qt::AlignCenter);
```
不能直接添加图片到 pixmap 中，这样图片会保持原有的像素和缩放比例
![[Pasted image 20260401092346.png]]
#### QMainWindow 的中心组件问题
一个 QMainWindow 对象 `setCentralWidget` 之后，如果再重新设置，可能会导致之前设置的中心组件被删除，并且如果把**组件设置为中心组件然后在析构函数中 delete 通过 new 得到的对象**会导致关闭应用时报错，原因是设置中心组件 qt 就会将组件放入对象树中管理生命周期，窗口关闭自然就会析构对象，再使用 delete 双重释放是未定义行为

> [!note] qt 文档中的描述：
> Note: QMainWindow takes ownership of the widget pointer and deletes it at the appropriate time.

### 子窗口和父窗口关系
#### 大小关系
> [!question] 为什么子窗口设置了 `setFixedSize()`，还是能够拖动窗口大小？
> 前置条件
> - **MainWindow** 是顶级窗口（没有父窗口）
> - **LoginDialog** 和 **RegisterDialog** 是 MainWindow 的子窗口（通过 `new LoginDialog(this)` 设置父对象）
> - **MainWindow 设置 `setFixedSize(300, 500)`**：顶级窗口固定为 300x500，用户不能调整大小
> - **LoginDialog/RegisterDialog 设置 `setFixedSize(300, 500)`**：无论有没有设置大小，都接受父窗口管制
> 具体原因：
> 如果 **只有子窗口设置固定大小，父窗口没有设置**：
> - 父窗口可以自由调整大小，就算小于子窗口的最小大小也只能受着
> - 父窗口中没有设置两个子窗口的 layout，所以两个**控件**都在父窗口里显示，调整大小就会导致*显示在父窗口中的控件按照默认控件显示规则*，没有设置 StackWidget 关系，也没有 layout，那么控件自然会显示在左上角，不居中显示
> - 需要注意这种**子窗口不放在父窗口 layout 中的写法**，自窗口必须依赖父窗口才能显示，不能独立存在
> 
> 这也导致了如果不设置 MainWindow 的 FixedSize，运行后窗口大小可以随意调整，子窗口的大小设置显示完全失效，只是保证了子窗口内部内容布局**不受父窗口影响**而已

>[!question] 为什么父窗口 setFixedSize 而子窗口不设置会导致显示不出任何内容？
>前置知识：
>Qt 中窗口/控件的大小确定遵循这个优先级：
> ```
> 显式设置的大小 (setFixedSize/setMinimumSize/setMaximumSize) 
> ↓
> sizeHint() 或 minimumSizeHint()
> ↓
> 布局计算的大小
> ↓
> 默认大小 (通常是 0x0 或很小)
> ```
> - 没有 `setFixedSize()` - 没有明确大小
> - 没有重写 `sizeHint()` 或 `minimumSizeHint()`
> - 没有父布局，布局计算需要初始父布局大小作为参考
> - qt 无法确定子控件到底有多大，所以返回 `0*0` 或一个极小值（肉眼看不到）

#### 层级关系
> [!question] 为什么拖动父窗口大小子窗口控件不会居中显示？
> 前置条件：
> - **顶级窗口**：没有父窗口，显示在桌面上，有独立的窗口管理器装饰（标题栏、边框等）
> - **子窗口**：有父窗口，显示在父窗口内部，没有独立的窗口装饰
> - 由于子窗口依赖于父窗口，所以显示效果是由父窗口决定的，父窗口中没有为两者设置布局，所以两者的本质关系是：
> ![[Pasted image 20260418184946.png|500]]

#### 依赖关系
> [!question] 为什么子窗口不能设置 WindowsFlags?
> 因为没有意义
> 已经成为子窗口的窗口控件没有必要设置 WindowsHint（窗口最小/大化按钮，无边框等内容）
### 单例模板和 http 管理类
#### std::once_flat 和 std::call_once 保证多线程单例
`std::once_flag` 和 `std::call_once` 是 C++11 标准库提供的**多线程安全的初始化机制**。
- **`std::once_flag`**：是一个辅助类，作为 `std::call_once` 的标志参数 [1](https://en.cppreference.com/w/cpp/thread/once_flag.html) [2](https://cppreference.net/cpp/thread/once_flag.html) [3](https://cplusplus.com/reference/mutex/once_flag/) [5](https://www.apiref.com/cpp/cpp/thread/once_flag.html)。它既不可复制也不可移动。
- **`std::call_once`**：是一个函数模板，确保传递给它的函数只执行一次，即使被多个线程同时调用 [2](https://cppreference.net/cpp/thread/once_flag.html) [5](https://www.apiref.com/cpp/cpp/thread/once_flag.html)
`std::once_flag` 是 `std::call_once` 的**标志参数**：
- 同一个 `once_flag` 对象传递给多次 `call_once` 调用，确保这些调用协调工作 [1](https://en.cppreference.com/w/cpp/thread/once_flag.html) [2](https://cppreference.net/cpp/thread/once_flag.html)
- 只有第一个调用会真正执行函数，后续调用会等待函数执行完成，然后直接返回
现代 C++提倡使用 Magic static（静态局部变量来实现**单纯的单例模式**），而这两个方式已经退化成在多线程中确保某些操作只能**单次执行**的操作/功能，而不仅仅适用于创建单例对象。
