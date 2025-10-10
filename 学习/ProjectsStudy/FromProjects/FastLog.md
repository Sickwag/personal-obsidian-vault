# logger.hpp
重中之重是 logger. hpp 的逻辑
## 概念约束和编译期求值
### 常量求值关键字
```cpp
template <typename... Args>
struct basic_format_string_wrapper {
    template <typename T>
        requires std::convertible_to<T, std::string_view>
    consteval basic_format_string_wrapper(
        const T& s,
        std::source_location loc = std::source_location::current())
        : fmt(s), loc(loc) {}
    std::format_string<Args...> fmt;
    std::source_location loc;
};
```
- requires 关键字引入 `std::converitible_to` 规则来约束模板参数 T
- `std::convertible_to` 的实现规则是 T 能够被转化为 `std::string_view`
-  consteval 表示这是一个立即常量求值函数，必须在编译时求值
- consteval 关键字修饰之后的函数如果被调用了，它必须在编译期完成求值，**不能在运行时执行**
- 如果想要某个对象\函数仅仅在编译期被使用（即提前在编译期计算某些值，提高运行时速度）那么可以考虑使用 consteval 关键字，如果在运行是这个函数被调用，**会编译失败**，与 constexpr 区别可以参考 [[Modern C++#constexpr#补充：consteval 关键字|consteval补充]]
### std:: format_string 类型
C++20 新增对象，是一个类型安全的格式化字符串包装器，主要功能是：
1. **编译时**格式字符串验证
2. 类型安全的参数检查
  - 普通 format 字符串：
```cpp
const char* fmt = "Hello {}, age {}";  // 只包含字符串内容
// 无法在编译时知道应该传什么类型的参数
std::format(fmt, "World", "not_a_number");  // 编译通过，运行时可能出错
```
  - `std::format_string`：
```cpp
std::format_string<std::string, int> fmt = "Hello {}, age {}";  //包含参数类型信息
// 编译器知道第一个参数应该是 std::string 类型，第二个是 int 类型
std::format(fmt, "World", 25);         // 编译通过，类型匹配
std::format(fmt, "World", "wrong");    // 编译错误！类型不匹配
```
### 源代码信息获取
  `std::source_location` 本质上是一个编译期常量对象，它**只能在编译时自动生成**并填充源代码信息（文件名、行号、函数名等），而不是在运行时通过栈回溯或其他方式获取这些信息。
  工作原理
  1. 静态信息填充
```cpp
#include <source_location>
void example() {
    auto loc = std::source_location::current();
    // loc 包含的信息在编译时就已经填充好了
    std::cout << "File: " << loc.file_name() << std::endl;
	std::cout << "Line: " << loc.line() << std::endl;
	std::cout << "Column: " << loc.column() << std::endl; // C++23
    std::cout << "Function: " << loc.function_name() << std::endl; // 编译时已知
}
```
当创建 `source_location` 对象（即第一行代码）时，编译器在执行这一行代码是就会记下第一行代码的源代码位置信息
除了上述的所有直接的信息，调用 `loc.current()` 方法可以获取返回一个 `source_location` 对象，重新记录调用 current 时新的位置。
2. 如何在编译时获取信息
  `std:: source_location` 通过以下机制在编译时获取源码信息：
- 编译器内置支持：编译器知道当前正在编译的文件、行号和函数
- 常量表达式：std::source_location:: current() 是一个 consteval 函数
- 静态数据：所有信息在编译时就存储在二进制文件中
2. 传统 C 宏实现方法
```cpp
// 这些宏在预处理器阶段就替换为字面量
#define LOG(fmt, ...) \
     printf("%s:%d - " fmt "\n", __FILE__, __LINE__, ##__VA_ARGS__)

LOG("Error occurred");  // 预处理后变成:
// printf("%s:%d - Error occurred\n", "source.cpp", 23);
```
### 避免编译器自动推导类型
```cpp
template <typename... Args>
using format_string_wrapper =
    basic_format_string_wrapper<std::type_identity_t<Args>...>;
```
解参数包的同时，用 `std::type_identity_t<Args>` 禁止每一个参数类型推导或转换
# loglevel. hpp
## 控制终端输出颜色
可以看到，to_color 可以控制终端输出颜色
```cpp
std::string_view to_color() {
    switch (__level) {
        case LogLevel::Trace:
            return "\033[46m";  // cyan
        case LogLevel::Debug:
            return "\033[44m";  // blue
        case LogLevel::Info:
            return "\033[42m";  // green
        case LogLevel::Warn:
            return "\033[43m";  // yellow
        case LogLevel::Error:
            return "\033[41m";  // red
        case LogLevel::Fatal:
            return "\033[45m";  // purple
        default:
            std::unreachable();
            return "NOT DEFINE COLOR";
    }
}
```
这其实是终端的ANSI 转义序列（ANSI Escape Sequences）
ANSI 转义序列的本质 ：`\033[46m` 这样的字符串并不是 C++ 特有的，而是一种终端控制协议，用于控制终端的显示效果。
- `\033` 是 ESC 字符的八进制表示（ASCII 码 27）
- `[` 是控制序列引入符 (Control Sequence Introducer, CSI)
- `<数字>` 是颜色或样式代码
- `m` 是 SGR (Select Graphic Rendition) 命令

| 代码      | 含义        |
| ------- | --------- |
| 30–37   | 前景色（文字颜色） |
| 40–47   | 背景色       |
| 90–97   | 亮前景色      |
| 100–107 | 亮背景色      |

# manager. hpp
## 根据语义设计 api
在 FileLoggerManager 类中，make_logger 函数返回 FileLogger 对象引用，而 get_logger 函数返回对象指针。
这种设计遵循了 C++ 的一个重要原则：
- 成功是常态时使用引用：make_logger **总是成功，返回引用**
- 可能失败时使用指针：get_logger **可能找不到，返回指针**
- 语义匹配：返回类型反映函数的语义和使用方式

这种设计模式在 C++ 标准库中也很常见，例如：
- `std::vector::at()` 返回引用（可能抛异常）
- `std::map::find()` 返回迭代器（用 `end()` 判断是否找到）
并且这个类使用了
- 工厂模式，make，delete，get ，工厂化生产不同类型的 Logger 对象
- 对象池模式，所有对象统一用 unordered_map 管理，避免临时 Logger 对象**频繁创建和销毁**的开销
 
---
相类似 logbuffer.hpp 中的 `capacity()`，`size()` 等简单函数实现，可以使用 `[[nodiscard]]` 强制返回值接受，函数体使用 `<const> noexcept` 并且本项目中的这些函数统一使用后置返回值类型，相对于传统前置更凸显现代 C++语言风格
# logger. hpp
## 编译时多态--CRTP 模式
传统使用虚函数实现的运行时多态
- 虚函数调用有性能开销（虚表查找、间接调用）
- 不能内联优化
- 多态行为在运行时确定