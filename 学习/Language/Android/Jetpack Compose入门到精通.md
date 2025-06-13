## 2.3 深入详解 Jetpack Compose | 实现原理
### 2.3.1 @Composable 注解意味着什么？
Compose 并不是一个注解处理器，compose 注解相当于一个函数关键字（类似于 suspend），当使用 @Composable 注解一个函数类型时，会导致**它类型的改变**: 未被注解的相同函数类型与注解后的类型互不兼容。同样的，挂起 (suspend) 函数需要调用上下文作为参数

> 只能在其他挂起函数中调用挂起函数，compose 同理

```kotlin
fun Example(a: () -> Unit, b: suspend () -> Unit) {
	a() // 允许
	b() // 不允许
}
suspend
fun Example(a: () -> Unit, b: suspend () -> Unit) {
	a() // 允许
	b() // 允许
}
------------------------
fun Example(a: () -> Unit, b: @Composable () -> Unit) {
	a() // 允许
	b() // 不允许
}
@Composable
fun Example(a: () -> Unit, b: @Composable () -> Unit) {
	a() // 允许
	b() // 允许
}
```
### 2.3.2 执行模式
传递的调用上下文究竟是什么？还有，我们为什么需要传递它？我们将其称之为 "Composer"。Composer 的实现包含了一个与 Gap Buffer (间隙缓冲区) 密切相关的数据结构，这一数据结构通常应用于文本编辑器
间隙缓冲区是一个含有**当前索引或游标的集合**，它在内存中使用扁平数组 (flat array) 实现。这一扁平数组比它代表的数据集合要大，而那些没有使用的空间就被称为**间隙**。

**compose 构建 UI 的方式是将各种组件放在一个数据结构中，通过改变数据结构更新 UI**
![[Pasted image 20250120212957.png|325]]
一个**正在执行**的 Composable 的层级结构可以使用这个**数据结构**，而且我们可以在其中插入一些东西
![[Pasted image 20250120213323.png]]
除了移动间隙，它的所有其他操作包括获取 (get)、移动 (move)、插入(insert)、删除 (delete) 都是常数时间操作。移动间隙的时间复杂度为 O (n)
注意，组件样式的更改只是数据结构**中一个元素改变，并没有改变数据结构**，而删除，顺序调换一整个 compose 组件才会改变结构