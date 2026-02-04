参考资料
[【从零开始的C++游戏开发】EasyX开发环境搭建 | 跟随鼠标移动的小球_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1iQ4y1s7Qj/?spm_id_from=pageDriver&vd_source=876be08bc9c030f4a9ea1fb97e0d0342)
easyX 文档：[EasyX\_Help.chm](../../Files%20&%20LongText/Attachments/EasyX_Help.chm)

# 开发环境搭建
## 绘制实心圆 
使用函数
1. initgraph  
2. solidcircle 这个函数用于画无边框的填充圆。
3. peekmessage 函数

## 井字棋游戏
### 使用函数
1. cleardevice 

不使用双缓冲机制，每次使用绘图函数渲染函数时，easyX 会将新的绘图**逐渐地**绘制到屏幕上，由于使用 cleardevice 函数，图形被不断地绘制并消除
beginbatchdraw 函数可以创建一张新的**不可见的画布**，默认将所有绘图操作画在这张画布中，flushbatchdraw 函数通过交换现有屏幕和不可见新画布（新的渲染缓冲区）位置，交换过程远快于绘制过程，所以看不见闪烁的圆
endbatchdraw 也会执行一次刷新，但是结束渲染缓冲，删除新的画布
#### messagebox
![Pasted image 20241006180653.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020241006180653.png)
- 使用 `GetHWind()` 获得当前窗口的句柄，句柄为指向当前窗口的指针
- `_T()` 输出提示信息的函数，放在 messagebox 中的不同位置表示输出在不同位置
- `MB_OK` 表示按钮类型
### 游戏架构
- 建立棋盘数据结构
- 建立落子动作检测函数
- 胜出和平局检测函数
- 建立游戏结束提示语句
- 检测鼠标位置
	- 根据鼠标位置计算现在鼠标在井字棋哪个位置
- 更合理的交互
- 控制刷新率
![400](../../Files%20&%20LongText/Attachments/Pasted%20image%2020241006201056.png)
使用 line 函数时参数位置是所需要画的线从左向右两个端点的坐标排列在一起即可
![375](../../Files%20&%20LongText/Attachments/Pasted%20image%2020241006203243.png)
### 代码文件
![Tic-Tac-Toe.cpp](../../Files%20&%20LongText/Attachments/Tic-Tac-Toe.cpp)

## 提瓦特幸存者
### 问题
#### size_t 是什么类型？
#### dword 是什么类型？
#### 为什么字符串要用 `_T` 函数来输出？
#### 这段代码什么意思
```cpp
   int idx_current_anim = 0;
   const int PLAYER_ANIM_NUM = 6;
   		static int counter = 0;
   		if (++counter % 5 == 0)
   			idx_current_anim++;
   		idx_current_anim = idx_current_anim % PLAYER_ANIM_NUM;
```
#### wstring 是什么类型？
##### 定义
   `wstring` 是一个标准库中的模板类，用于表示宽字符字符串。它定义在 `<string>` 头文件中，并且是 `std` 命名空间的一部分。`wstring` 类型是 `std::basic_string` 的一个特化版本，专门用于处理宽字符（通常是 `wchar_t` 类型），这使得它能够存储和操作宽字符集（如UTF-16或UTF-32）中的字符串。
   ==简单来说就是处理 C 风格的宽字符串==的 string 类特别版
##### 初始化 wstring 的方法
```cpp
int main() {
	// 使用构造函数创建wstring对象
	std::wstring str1(L"Hello, World!");

	// 使用赋值操作符
	std::wstring str2;
	str2 = L"Another string";

	// 使用append函数
	str1.append(L" Wide characters");

	// 输出结果
	std::wcout << str1 << std::endl; // 输出: Hello, World! Wide characters
	std::wcout << str2 << std::endl; // 输出: Another string

	return 0;
}
```

`to_wstring` 同理，是一个将各种类型的数据转换为 wstring 字符串
`c_str () `是 wstring 和 string 的成员方法，将字符串类型转换为 C 风格字符串
##### 代码应用
```cpp
void loadAnimation() {
	for (size_t i = 0; i < PLAYER_ANIM_NUM; i++) {
		std::wstring path = L"img/player_left_" + std::to_wstring(i) + L".png";
		loadimage(&img_player_left[i], path.c_str());
	}
	for (size_t i = 0; i < PLAYER_ANIM_NUM; i++) {
		std::wstring path = L"img/player_right_" + std::to_wstring(i) + L".png";
		loadimage(&img_player_right[i], path.c_str());
	}
}
```

#### Tchar，LPCSTR 是什么？
### 使用函数
#### 图片加载 loadimage
![350](../../Files%20&%20LongText/Attachments/Pasted%20image%2020241007081745.png)
![300](../../Files%20&%20LongText/Attachments/Pasted%20image%2020241007081830.png)
- loadimage 函数用来加载和存储图片，图片的路径使用 `_T` 函数显示
- putimage 函数使用图片的指针的引用按照坐标位置渲染图像
	- 注意使用 IMAGE 创建图片对象若要使用一般要引用
```cpp
#include<graphics.h>

int main() {
	initgraph(1280, 720);
	bool run_game = true;
	ExMessage msg;
	IMAGE img_background;
	loadimage(&img_background, _T("img/background.png"));
	BeginBatchDraw();
	while (run_game) {
		DWORD start_time = GetTickCount();
		while (peekmessage(&msg)) {

		}
		cleardevice();
		putimage(0, 0, &img_background);
		FlushBatchDraw();

		DWORD end_time = GetTickCount();
		DWORD delta_time = end_time - start_time;

		if (delta_time < 1000 / 60) {
			Sleep(1000 / 60 - delta_time);
		}
	}
}
```
#### 使用计数器创建动画
```cpp
int main() {
-------------------
	while (run_game) {
	-------------------
		while (peekmessage(&msg)) {
		-------------------
			static int counter = 0;//计数器，static防止其在每次循环开始时再次被初始化
			if (++counter % 5 == 0)
				idx_current_anim++; //帧计数器，这个变量记录现在播放的是动画的第几帧
			idx_current_anim = idx_current_anim % PLAYER_ANIM_NUM;
			// 因为++counter从1开始，% PLAYER常量导致每6次循环idx从又变回1
			// 配合putimage函数和素材组，表示每循环6次再从头开始播放动画的第一帧
```
#### 控制动画轮播
**原则：** 主循环内应尽量避免阻塞式的行为或者过于繁重且耗时过长的任务
#### 使用循环读取素材组
##### 创建素材组
```cpp
int idx_current_anim = 0; // 当前播放的是动画的哪一帧
const int PLAYER_ANIM_NUM = 6; // 一个循环的动画一共有几帧，这里因为大部分任务动作素材只有6张图（也就是6帧），所以定义全局变量，之所以不定义#define为了防止导入时将这个变量应用到其他源文件中

// 创建图片数组，每个数组存储一组动画，数组的元素是图片，一共 PLAYER_ANIM_NUM = 6张
// 然后使用putimage将遍历得到的每张图片都渲染到指定位置
IMAGE img_player_left[PLAYER_ANIM_NUM];
IMAGE img_player_right[PLAYER_ANIM_NUM];
```
##### 创建素材组路径
```cpp
void LoadAnimation() {
	for (size_t i = 0; i < PLAYER_ANIM_NUM; i++) {
		std::wstring path = L"img/player_left_" + std::to_wstring(i) + L".png";
		loadimage(&img_player_left[i], path.c_str());
	}
	for (size_t i = 0; i < PLAYER_ANIM_NUM; i++) {
		std::wstring path = L"img/player_right_" + std::to_wstring(i) + L".png";
		loadimage(&img_player_right[i], path.c_str());
	}
}
```


#### 链接库文件绘制
`#pragma comment (lib,"MSIMG 32. LIB")` 告诉编译器在**链接阶段**自动连接 MSMG_库
#### 借助系统函数绘制透明图像
```cpp
#pragma comment(lib,"MSIMG32.LIB")

// 借助系统绘图函数
inline void putimage_alpha(int x, int y, IMAGE * img) {
	int w = img->getwidth();
	int h = img->getheight();
	AlphaBlend(GetImageHDC(NULL), x, y, w, h, 
		GetImageHDC(img), 0, 0, w, h, { AC_SRC_OVER,0,255,AC_SRC_ALPHA });
}
```
这段代码定义了一个名为 `putimage_alpha` 的内联函数，其目的是将一个带有透明度（alpha 通道）的图像绘制到屏幕上。函数接收三个参数：`x` 和 `y` 表示图像在目标设备上下文（DC）中的绘制位置坐标，`img` 是指向 `IMAGE` 类型对象的指针，该对象包含图像数据和相关的方法。
-  `AlphaBlend(...);`：调用 `AlphaBlend` 函数，这是一个 Windows API 函数，用于在两个设备上下文中混合图像，支持透明度效果。`AlphaBlend` 的参数如下：
- `GetImageHDC(NULL)`: 获取一个设备上下文（DC），用于绘制图像的目标位置。`NULL` 表示获取屏幕的默认设备上下文。
- `x, y, w, h`: 目标绘制区域的坐标和尺寸。
- `GetImageHDC(img)`: 获取与 `IMAGE` 对象关联的设备上下文，这是源图像所在的上下文。
- `0, 0, w, h`: 源图像的绘制区域坐标和尺寸，这里从源图像的左上角（0,0）开始绘制整个图像。
- `{ AC_SRC_OVER, 0, 255, AC_SRC_ALPHA }`: 指定混合操作的参数。`AC_SRC_OVER` 表示源图像将覆盖目标图像，`AC_SRC_ALPHA` 表示使用源图像的 alpha 通道来确定透明度。

#### 角色移动
类似于 [Form Scratch to Practice \> 控制飞船移动](Form%20Scratch%20to%20Practice.md#控制飞船移动)
剑麻对照表可以再 vscode/Visual studio 官方文档查找到
![Pasted image 20241007114406.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020241007114406.png)
在主循环的消息捕获函数中添加动作函数 (可以封装在函数中)
```cpp
const int PLAYER_SPEED = 5;
while (run_game) {
--------------------
int main(){
-------------------
	while (peekmessage(&msg)) {
		if (msg.message == WM_KEYDOWN) {
			switch (msg.vkcode) {
			case VK_UP:
				player_pos.y -= PLAYER_SPEED;
				break;
			case VK_DOWN:
				player_pos.y += PLAYER_SPEED;
				break;
			case VK_LEFT:
				player_pos.x -= PLAYER_SPEED;
				break;
			case VK_RIGHT:
				player_pos.x += PLAYER_SPEED;
				break;
			}
		}
	}
}
```
- 直接运行游戏可以看到 C++使用了和 pygame 同样的消息处理队列机制，按住按键瞬间会有一个 msg 传入到消息队列处理，之后等待一段时间之后才有不断地 msg 信息传入消息队列
- 移动卡顿原因为 msg 的 keydown 事件默认和主循环异步进行，有自己的循环时钟，不和主循环配合导致了有的 keydown 事件时钟周期短，有的长，每个时钟周期中执行不同次数的位置移动操作，主循环的绘图函数在相同的主循环时钟间隔内绘制移动部均匀的图像，导致卡顿
- 这也是为什么需要设置按下事件，更需要设置**松开事件**，[允许不断移动需要设置8个键盘事件](Form%20Scratch%20to%20Practice.md#允许不断移动)
- 设置松开事件同时检测上下左右四个键的按下和松开情况，松开也是一个消息传入消息队列中，这就**显式定义**了什么按键事件下玩家的移动情况，实现了多个按键按下，**消息队列中掺杂多个按键的松开和释放信息**，同时处理，玩家==斜向移动==
```cpp
while (run_game) {
------------------------
	while (peekmessage(&msg)) {
		if (msg.message == WM_KEYDOWN) {
			switch (msg.vkcode) {
			case VK_UP:
				is_move_up = true;
				break;
			case VK_DOWN:
				is_move_down = true;
				break;
			case VK_LEFT:
				is_move_left = true;
				break;
			case VK_RIGHT:
				is_move_right = true;
				break;
			}
		}
		else if (msg.message == WM_KEYUP) {
			switch (msg.vkcode) {
			case VK_UP:
				is_move_up = false;
				break;
			case VK_DOWN:
				is_move_down = false;
				break;
			case VK_LEFT:
				is_move_left = false;
				break;
			case VK_RIGHT:
				is_move_right = false;
				break;
			}
		}
	}
	if (is_move_up) player_pos.y -= PLAYER_SPEED;
	if (is_move_down) player_pos.y += PLAYER_SPEED;
	if (is_move_left) player_pos.x -= PLAYER_SPEED;
	if (is_move_right) player_pos.x += PLAYER_SPEED;
}
```
可以将这些功能封装

#### 多种动画渲染逻辑封装
##### 当前问题
- 无论玩家向何方向移动，角色始终面向左边
	因为渲染角色图像时只渲染了左边
	`putimage_alpha(player_pos.x, player_pos.y, &img_player_left[idx_current_anim]);`
- 每实现一次动画渲染，需要设置
	- 创建动画帧计时器（但是每组动画可能图片数量不一样）
	- 创建动画图片数组（根据动画图片数量调整数组大小）
	- 借助系统绘图函数渲染动画图像（渲染对象不一样）
- 使用类和对象方法需要注意内存管理
- 使用计数器管理动画渲染逻辑放在主循环中并且受到 sleep 函数控制会导致帧数越高游戏渲染越快，人物移动速度越快，需要调整为人物移动速度和时间有关，而不是帧率有关
所以可以使用类和对象的方法简化代码：
- **将不同的内容作为参数（private 变量），相同的内容作为成员函数（public 方法）**
- 使用 vector 容器代替普通数组容器实现大小自动调整
![Pasted image 20241007122440.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020241007122440.png)
- 在使用 new 开辟指针内存时创建对应 delete
![Pasted image 20241007122725.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020241007122725.png)
每个 malloc 对应 free，同理 new 对应 delete
- 使用计时器代替计数器，对计时器函数传入相应的等待时间即可

#### 根据移动方向翻转动画
玩家向不同方向移动（或者其他触发需要更换渲染动画的动作）时需要渲染的动画
```cpp
Animation anim_left_player(_T("img/player_left_%d.png"), 6, 45);
Animation anim_right_player(_T("img/player_right_%d.png"), 6, 45);

void drawplayer(int delta, int dir_x) {
	// facingleft表示是否面向左侧
	// dir_x表示x轴方向上的移动，=0 表示没有向左移动
	static bool fancing_left = false; 
	if (dir_x < 0)
		fancing_left = true;
	else if (dir_x > 0)
		fancing_left = false;
	if (fancing_left)
		anim_left_player.play
}
```
