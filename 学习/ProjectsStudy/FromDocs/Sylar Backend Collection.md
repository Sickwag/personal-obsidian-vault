---
created: 2026-06-01
resource_1: https://github.com/sylar-yin/sylar.git
---
# 基本组件
## 使用到的知识
### 单例模式
参考: [[设计模式#简单的单例实现]]
### 类构造函数与访问修饰符&虚函数关键字&显式 delete 的关系
参考 [[C++ Runoob Tutoral#类构造函数]]，重构了内容
### 分支预测
@macro.h 中的宏定义
```cpp
#if defined __GNUC__ || defined __llvm__
/// LIKCLY 宏的封装, 告诉编译器优化,条件大概率成立
#	define SYLAR_LIKELY(x) __builtin_expect(!!(x), 1)
/// LIKCLY 宏的封装, 告诉编译器优化,条件大概率不成立
#	define SYLAR_UNLIKELY(x) __builtin_expect(!!(x), 0)
#else
#	define SYLAR_LIKELY(x) (x)
#	define SYLAR_UNLIKELY(x) (x)
#endif
```
- `__builtin_expect__` 是 GCC/Clang 的内建函数，用于告诉编译器哪个分支更可能被执行，让编译器优化指令流水线。**行为是编译期的**——它影响编译器生成的汇编指令布局，不能写成函数形式，因为函数调用本身会打断编译器对这个条件的流水线优化。宏是文本替换，零开销、零抽象
- 两次取反 `!!` 操作把任何值归一化成 0 或 1。比如 x = 42，!42 = 0，!0 = 1，确保送入 `__builtin_expect__` 的是规范的布尔值。
```cpp
if (x) {
    // 通常不执行到这里
}

// 加了宏的写法
if (SYLAR_UNLIKELY(x)) {
    // 把"不常见"的路径标记出来
    // 编译器会把这里放到远离主线代码的位置
    // 主线代码的指令缓存更紧凑
}
```
  一个典型的使用场景是这个项目中 hook.cc 里的系统调用错误检查——错误路径极少发生，标记为 UNLIKELY
  后编译器把错误处理代码挪到远离热路径的位置，提高 cache 命中率。
`SYLAR_ASSERT(x)` — 断言宏
```cpp
#define SYLAR_ASSERT(x)                                                        \
  if(SYLAR_UNLIKELY(!(x))) {                                                 \
	  SYLAR_LOG_ERROR(SYLAR_LOG_ROOT()) << "ASSERTION: " #x                  \
										<< "\nbacktrace:\n"                  \
										<< sylar::BacktraceToString(100, 2, "    "); \
	  assert(x);                                                             \
  }

```