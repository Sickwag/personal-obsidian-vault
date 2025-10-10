## 事件处理器
- QWidget（实际上是 QObject）有一个成员方法 installEventFilter。
  - 当你调用 `objectA->installEventFilter (objectB) ` 时，会让objectB 来过滤发送给 objectA 的事件
  - 被安装为事件过滤器的对象（即 objectB）必须实现一个名为 `eventFilter` 的虚函数。这个函数的签名必须是 `bool eventFilter (QObject *watched, QEvent *event)`，并且如果不调用 `installEventFilter` 不会要求实现
- 事件流向：
	- 当一个事件被发送到 objectA 时，如果 objectB 被安装为 objectA 事件过滤器，那么事件会先传递给objectB 的 eventFilter 函数。
	- 在 eventFilter 函数中，你可以检查事件类型并决定如何处理它。
	- 如果你返回 true，表示事件已经被处理，不会再传递给 objectA。
	- 如果你返回 false（或在处理完自己的逻辑后调用基类的	eventFilter，事件会继续传递给 objectA
- 事件处理器属性
	- 一个类可以安装多个事件处理器，行业规范是：
		1. 每一个处理器**处理自己感兴趣的内容**，不感兴趣的传递给其他处理器
		2. 所有的内容都应该被处理，所有最后应该要把未显式定义的时间转交给 `QWidget::eventFilter` 基类
## Q_PROPERITY 属性声明宏
### 语法定义
Q_PROPERTY 是 Qt 框架（一个跨平台的 C++ GUI 应用开发框架）中的一个宏，用于在类中声明属性（properties）。它允许开发者定义可读写或只读的属性，这些属性可以通过 Qt 的元对象系统（Meta-Object System）进行动态访问、绑定信号与槽，或在 QML 中使用。

基本语法
```cpp
Q_PROPERTY (type name
           READ getFunction
           WRITE setFunction
           RESET resetFunction
           NOTIFY notifySignal
           DESIGNABLE bool
           SCRIPTABLE bool
           STORED bool
           USER bool
           CONSTANT
)
```
参数说明
- type：属性的数据类型，例如 int、QString 等。
- name：属性的名称。
- READ：指定读取属性的 getter 函数（必需）。
- WRITE：指定写入属性的 setter 函数（可选）。
- RESET：指定重置属性的函数（可选）。
- NOTIFY：指定属性值变化时发出的信号（可选，用于动态属性绑定）。
- DESIGNABLE：是否在 Qt Designer 中可设计（默认 true）。
- SCRIPTABLE：是否可从脚本（如 QML）访问（默认 true）。
- STORED：是否存储在对象中（默认 true）。
- USER：是否为用户可编辑（默认 false）。
- CONSTANT：表示属性是常量（不变化）。
- REQUIRED (Qt 6.2+) 表示属性在 QML 中是必需的
示例
假设有一个类 MyClass：
```cpp
class MyClass : public QObject {
    Q_OBJECT
    Q_PROPERTY (int value READ getValue WRITE setValue NOTIFY valueChanged)
public:
    int getValue () const { return m_value; }
    void setValue (int newValue) {
        if (m_value != newValue) {
            m_value = newValue;
            emit valueChanged ();
        }
    }
signals:
    void valueChanged ();
private:
    int m_value = 0;
};
```
在这个例子中，value 是一个整数属性，可以通过 `object->setProperty ("value", 42)` 或 QML 中的绑定来设置和读取。当值变化时，会发出 valueChanged 信号。
### 总结

| 参数         | 作用                   | 使用场景        |
| ---------- | -------------------- | ----------- |
| READ       | 指定读取属性值的函数           | 必须          |
| WRITE      | 指定写入属性值的函数           | 可选（只读属性不需要） |
| NOTIFY     | 指定属性变化时发出的信号         | 属性绑定、QML 集成 |
| RESET      | 指定重置属性的函数            | Qt Designer |
| DESIGNABLE | 控制 Qt Designer 中是否可见 | UI 设计       |
| SCRIPTABLE | 控制脚本引擎中是否可见          | 脚本集成        |
| STORED     | 控制是否存在属性值            | 序列化         |
| USER       | 标记用户可见的主要属性          | Qt Designer |
| CONSTANT   | 表示只读常量属性             | 配置信息        |
| FINAL      | 表示属性不会被重写            | 性能优化        |
| REQUIRED   | 表示 QML 中必需的属性        | QML 组件      |