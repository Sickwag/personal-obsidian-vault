---
书籍参考: Qt 6 QML (Qt) / QmlBook In Chinese
created: 2026-10-08
---
## 图像提供器：QQuickImageProvider
### 名称与本质
《QmlBook In Chinese》写作 `QQmlImageProvider`；按 Qt 公开 API，正确类型是 `QQuickImageProvider`，它继承 `QQmlImageProviderBase`。Qt 6 书也使用 `QQuickImageProvider`。[QQuickImageProvider](https://doc.qt.io/qt-6/qquickimageprovider.html) [QQmlImageProviderBase](https://doc.qt.io/qt-6/qqmlimageproviderbase.html)
它把 C++ 图像数据接入 QML 的 `Image` 加载管线。QML 使用虚拟 URL `image://提供器名称/图像标识`，引擎按提供器名称路由请求，再调用对应的 C++ 接口。
`Image.source` → `QQmlEngine` 查找 provider → `requestImage(id, size, requestedSize)` → C++ 返回 `QImage` → QML `Image` 显示并缓存。
这种机制让 QML 继续使用 `Image` 的尺寸、布局和缓存能力，同时由 C++ 负责动态生成、读取、解码或变换图像。
### 解决的问题与适用场景
- 图像不是普通文件 URL，而是运行时计算或从应用自己的数据源取得，例如按用户 ID 加载头像、从数据库取缩略图、读取应用私有缓存。
- C++ 生成二维码、波形、热力图等栅格图像，再交给 QML 显示。
- 需要统一处理图像权限、解码、缩放或缓存策略。
- 连续高频更新的视频帧通常要评估视频输出或自定义渲染路径；通过 `Image` 反复请求会涉及重复加载与缓存管理。
### 基本用法
以下 provider 根据 URL 中的颜色名称生成图像：
```cpp
#include <QColor>
#include <QImage>
#include <QQuickImageProvider>

class ColorProvider final : public QQuickImageProvider
{
public:
    ColorProvider()
        : QQuickImageProvider(QQuickImageProvider::Image)
    {
    }

    QImage requestImage(const QString &id,
                        QSize *size,
                        const QSize &requestedSize) override
    {
        const QSize originalSize{128, 64};
        if (size)
            *size = originalSize;

        const QColor color{id};
        if (!color.isValid())
            return {};

        const QSize outputSize = requestedSize.isValid()
            ? requestedSize
            : originalSize;

        QImage image(outputSize, QImage::Format_ARGB32_Premultiplied);
        image.fill(color);
        return image;
    }
};
```
在**创建 QML 对象前注册 provider**。引擎会接管传入 provider 的所有权。
```cpp
QQmlApplicationEngine engine;
engine.addImageProvider(QStringLiteral("colors"), new ColorProvider);
engine.load(QUrl(QStringLiteral("qrc:/Main.qml")));
```
QML 请求 `image://colors/red` 时，`requestImage()` 收到的 `id` 是 `red`。
```qml
Image {
    source: "image://colors/red"
    sourceSize: Qt.size(256, 128)
    asynchronous: true
}
```
`requestedSize` 对应 QML 的 `sourceSize`；`size` 输出参数应填写图像原始尺寸，用于推导未显式设置的 `Image.width` 和 `Image.height`。[参数说明](https://doc.qt.io/qt-6/qquickimageprovider.html#requestImage)
### 线程、缓存与安全
- 对 `QImage` 或纹理类型，`Image.asynchronous: true` 会让图像请求在低优先级后台线程执行。也可用 `QQmlImageProviderBase::ForceAsynchronousImageLoading` 强制异步加载。provider 不会默认并行处理所有请求。
- `requestImage()` 可能由多个线程调用，必须可重入。共享缓存或可变状态需要同步保护；后台请求不要直接操作 GUI 对象。线程图像处理通常优先使用 `QImage`。
- 普通异步 provider 的请求共用每个 QML engine 的一个线程；慢请求会拖住同一 engine 的其他请求。需要自定义并发调度时，使用 `QQuickAsyncImageProvider` 和 `QQuickImageResponse`，再通过线程池等机制执行加载。[异步加载说明](https://doc.qt.io/qt-6/qquickimageprovider.html#asynchronous-image-loading) [异步 provider 示例](https://doc.qt.io/qt-6/qtquick-imageresponseprovider-example.html)
- `QPixmap` 的异步加载取决于平台的 `ThreadedPixmaps` 支持；不支持的平台会同步加载。
- provider 返回的图片会被引擎缓存。需要重新获取变化内容时，可设置 `cache: false`，或在 URL 中加入版本标识。[缓存说明](https://doc.qt.io/qt-6/qquickimageprovider.html#image-caching)
- `id` 若会转换为文件路径或数据库查询参数，必须做白名单校验，避免路径穿越或非法查询。
- `QQmlEngine::addImageProvider()` 应在加载 QML 文件之前调用；engine 接管 provider 的所有权。[注册说明](https://doc.qt.io/qt-6/qqmlengine.html#addImageProvider)
## 焦点作用域：FocusScope
### 类型与作用
`FocusScope` 是 `QtQuick` 提供的 QML 类型，继承 `Item`。它为可复用组件建立独立的键盘焦点作用域，管理组件内部的焦点请求。它本身不绘制可见内容，通常由子项提供背景和控件。[FocusScope QML 类型](https://doc.qt.io/qt-6/qml-qtquick-focusscope.html)
### 焦点传递
组件内部的输入控件可声明默认子焦点；父级将焦点交给组件实例时，`FocusScope` 再把焦点代理给内部控件。作用域和当前获得焦点的子项都可能同时有 `activeFocus: true`。`focus` 表示焦点请求，`activeFocus` 表示当前活动焦点路径。
```qml
// SearchField.qml
import QtQuick

FocusScope {
    id: root
    width: 240
    height: 36
    property alias text: editor.text

    Rectangle {
        anchors.fill: parent
        color: "white"
        border.color: root.activeFocus ? "dodgerblue" : "gray"
    }

    TextInput {
        id: editor
        anchors.fill: parent
        anchors.margins: 6
        focus: true
    }
}
```
父组件选择一个组件实例：
```qml
Column {
    SearchField { focus: true }
    SearchField {}
}
```
每个实例内部的 `TextInput.focus: true` 属于自己的作用域；父级的 `focus: true` 决定哪个组件实例取得活动焦点。这解决了可复用组件内部焦点请求与父级焦点选择之间的冲突。[Qt Quick 键盘焦点说明](https://doc.qt.io/qt-6/qtquick-input-focus.html)
### 使用边界
- 键盘事件由活动焦点项接收；事件未被接受时会沿父项传播。需要处理按键时，在相应项上使用 `Keys` 等机制。
- `FocusScope` 管理焦点作用域与代理，不会自动建立 Tab 顺序，也不会形成模态焦点陷阱；Tab 导航需结合焦点策略或 `KeyNavigation` 配置。
- 它不提供背景绘制。复用组件要为根作用域设置合适尺寸，并把需要暴露给父级的内容属性通过 `property alias` 等接口提供。
> [!Note]
> API 名称、注册时序和线程说明按 Qt 6 官方文档核对；代码示例用于说明接口关系，未在项目中编译验证。
