# 项目实例
## AnalogClock
### QPainter 设置绘制原点和缩放
地址：[Analog Clock | Qt Widgets | Qt 6.9.1](https://doc.qt.io/qt-6/zh/qtwidgets-widgets-analogclock-example.html)
painter 可以设置绘制原点，并根据画笔的设置的坐标系缩放**在程序运行时**动态调整所有用画笔绘制的图形的大小和坐标位置
```cpp
int side = qMin(this->width(), this->height());
painter.translate(this->width() / 2, this->height() / 2); // 设置painter的绘制原点坐标，这里设置为窗口中心位置，translate表示“平移”
painter.scale(side / 200.0, side / 200.0);
```
这里scale 设置参数表示根据当前组件的大小来设置缩放比例，在绘制小时刻度的矩形参数中 `painter.drawRect(73, -3, 16, 6);`
- 在 200 x 200 的标准坐标系中，这个矩形的位置是精心设计的
- 当窗口实际大小为 400 x 400 时，scale 为 2.0，这个矩形会自动变成在 (146, -6) 位置，大小为 32 x 12
- 当窗口实际大小为 100 x 100 时，scale 为 0.5，这个矩形会自动变成在 (36.5, -1.5) 位置，大小为 8 x 3
### QTimer **重绘**信号发射机制
QWidge 对象都有一个 update 函数，每次调用这个函数都会触发**组件的的重绘**，重绘操作通过子类重写（override）的 `paintEvent` 函数
```cpp
// update()不会立即重绘，而是：
// 1. 标记窗口为"需要重绘"状态
// 2. 将重绘请求加入事件队列
// 3. 当事件循环处理到时才真正调用paintEvent
void QWidget::update();  // 重绘整个窗口
void QWidget::update(const QRect &rect);  // 重绘指定区域
void QWidget::update(const QRegion &region);  // 重绘指定区域
void QWidget::repaint();  // 立即重绘，绕过事件队列void QWidget::repaint();  // 立即重绘，绕过事件队列

```
系统在以下情况会调用paintEvent：
1. 调用update()或repaint()后
2. 窗口第一次显示
3. 窗口从被遮挡状态恢复
4. 窗口大小改变
5. 其他需要重绘的情况

```cpp
// 可以连接多个槽函数到同一个定时器
connect(timer, &QTimer::timeout, this, &AnalogClock::update);
connect(timer, &QTimer::timeout, this, &AnalogClock::logTime);

// 可以在运行时动态改变连接
disconnect(timer, &QTimer::timeout, this, &AnalogClock::update);
connect(timer, &QTimer::timeout, this, &AnalogClock::otherFunction);

// 可以启动/停止定时器多次
timer->start(1000);  // 启动
timer->stop();       // 停止
timer->start(500);   // 以不同间隔重新启动
```
### 按照系统主题颜色设置组件颜色
![[../../../../Files & LongText/Attachments/Pasted image 20250921113557.png|一套代码，多个主题]]
```cpp
const QColor hourColor(palette().color(QPalette::Text)); // 使用palette绘制的颜色会自动适应系统主题颜色，这里使用内置的自适应文本颜色
const QColor minuteColor(palette().color(QPalette::Text));
const QColor secondsColor(palette().color(QPalette::Accent)); // 使用**当前系统主题颜色**的强调色
```
1. 遵循系统主题：通过使用 `palette().color()`，时钟的颜色会自动适应系统的主题设置，确保与应用程序的整体外观一致。
2. 时针和分针使用相同颜色：`QPalette::Text` 通常用于文本颜色，时针和分针都使用这种颜色，使它们在视觉上统一。
3. 秒针使用强调色：`QPalette::Accent` 是一种强调色，通常用于突出显示重要元素。将秒针设置为强调色使其更容易区分，因为秒针移动最频繁。

### 总结
一个 QWidget 组件一般要实现下面几个内容
构造函数中设置组件大小（`resize` 函数）
