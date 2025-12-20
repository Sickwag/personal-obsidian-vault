---
created: 2025年12月19日21:45:45
repo: https://github.com/windy66666/m_project/tree/main
---
# 杂项知识
# 具体文件
## addfriend 模块
包含 `addfriend.h` 和 `addfriend.cpp`
### `time_t` 类型使用
1. **如果 `time_t` 的值在 `int` 的范围内**：
    - 转换会**直接保留数值**，结果正确。
    - 例如：`time_t = 1609459200`（2021-01-01 00:00:00 UTC） → 转换为 `int` 后仍是 `1609459200`，从表示 Unix 纪元（1970年1月1日 00:00:00 UTC）开始经过的秒数
2. **如果 `time_t` 的值超出 `int` 的范围**：
    - **发生整数溢出**，结果未定义（UB），且数值被截断为 `int` 的最大/最小值。
    - 允许使用 longlong 等更大的结构存储
3. 标准库函数 `time(nullptr)` 或者 `time(NULL)` 返回当前时间距离 Unix 纪元的秒数
### 创建圆角头像
首先绘制圆角头像
```cpp
QPixmap Business::getRoundedPixmap(const QPixmap& src, int radius)
{
    if (src.isNull()) {
        return QPixmap();
    }

    QPixmap result(src.size());
    result.fill(Qt::transparent);

    QPainter painter(&result);
    painter.setRenderHint(QPainter::Antialiasing, true);
    painter.setRenderHint(QPainter::SmoothPixmapTransform, true);

    // 创建圆角路径
    QRect rect = QRect(0, 0, src.width(), src.height());
    QPainterPath path;
    path.addRoundedRect(rect, radius, radius);

    // 设置裁剪区域
    painter.setClipPath(path);
    painter.drawPixmap(rect, src);

    return result;
}
```
`Qt::SmoothTransformation` 是一个优化标志，它启用**高质量的图像缩放算法**：
- **双线性插值**：在缩放时使用周围像素的加权平均值，使缩放后的图像更加平滑
- **抗锯齿效果**：减少缩放后图像的锯齿状边缘
- **更好的视觉效果**：特别是当图像缩放比例较大时，能保持较好的清晰度
设置圆角图片的步骤：
- 绘制符合头像 UI 控件大小的矩形 `QRect rect(0, 0, src.width(), src.height())`
- 对 pixmap 设置透明背景
- 在这个矩形上绘制圆角路径 `path.addRoundRect(rect, radius, radius)`
- 设置剪裁区域和**使用画笔**在剪裁区域绘制 pixmap
### 访问图像方式
qt 中有两种方式 QImage 和 QPixmap，
QPixmap（像素图）
- 用途：主要用于显示和绘制，返回一些基本图片信息
- 存储格式：内部使用优化的显示格式（通常是硬件加速格式）
- 性能：需要**频繁在屏幕上显示**时性能更好
- 适用场景：GUI 显示、用作图标和作为控件背景图等

QImage（图像）
- 用途：主要用于像素级操作和图像处理，各种 convertTo ，pixel，set 函数，用于精细操作数据，更改数据存储格式，保存数据
- 存储格式：以原始像素数据格式存储（RGB、ARGB 等）
- 性能：**像素级访问和修改更高效**
- 适用场景：图像处理、像素操作、图像算法等
## bubble 对话框模块
包含 `bubble.h` 和 `bubble.cpp`
### 根据文本内容设置气泡组件尺寸
```cpp
void Bubble::setContent(const QString &text, int parent_width)
{
    ui->content_label->setText(text);

    int max_textwidth = parent_width - 300;
    ui->content_label->setMaximumWidth(max_textwidth);
    ui->content_label->setFont(QFont("Microsoft YaHei", 10));
    
    // 计算整个字符串的长度占用
    QFontMetrics fm(ui->content_label->font());
    int textWidth = fm.horizontalAdvance(text);
    int optimalWidth = qMin(textWidth + 20, max_textwidth);

    // 重要：先重置尺寸限制，让标签自由计算
    ui->content_label->setMaximumSize(QWIDGETSIZE_MAX, QWIDGETSIZE_MAX);
    ui->content_label->setFixedSize(QWIDGETSIZE_MAX, QWIDGETSIZE_MAX);

    ui->content_label->setFixedWidth(optimalWidth);
    ui->content_label->setWordWrap(textWidth + 20 > max_textwidth);

    // 强制更新布局
    ui->content_label->adjustSize();

    // 获取QLabel自己计算的大小（最准确）
    QSize labelSize = ui->content_label->sizeHint();
//    qDebug() << "最终气泡尺寸:" << labelSize;

    // 根据整个气泡组件的大小，调整组件画布大小
    QSize newBubbleSize = calculateBubbleSize(labelSize, parent_width);
    this->setFixedSize(newBubbleSize);
    ui->content_label->setFixedSize(labelSize); // 根据布局调整
    ui->label->setFixedHeight(labelSize.height());
}
```
设置 setMaximumSize 后，如果文本内容长度超过最大宽度，QLabel
不会自动换行。默认情况下，QLabel 会：
1. 截断文本：超出部分会被截断显示
2. 不自动换行：除非显式设置 `setWordWrap(true)`
  `adjustSize()` 会根据以下因素重新计算并设置控件尺寸：
- 当前设置的固定宽度 (setFixedWidth)
- 是否启用换行 (setWordWrap)
- 文本内容和字体
- 样式表中的内边距（padding）
所以先重置尺寸，设置好计算的宽度后，调用 `adjustSize()` 函数刷新
计算完气泡组件大小后，计算画布大小，调用 `this->setFixedSize()`，`ui->label->setFixedHeight(labelSize.height());`让label字体垂直居中