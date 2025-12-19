---
created: 2025年12月19日21:45:45
repo: https://github.com/windy66666/m_project/tree/main
---
# 杂项知识
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