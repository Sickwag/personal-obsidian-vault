---
参考: https://github.com/superlxh02/FastLog.git
created: 2026-02-18
---
# 整体设计
```md
用户代码
    ↓
fastlog::file::make_logger()  ← manager.hpp提供工厂接口
    ↓
FileLoggerManager::make_logger()  ← 创建并管理日志器
    ↓
FileLogger对象  ← logger.hpp实现核心功能
    ↓
FileLogBuffer缓冲区  ← logbuffer.hpp提供底层存储
    ↓
logfstream文件流  ← 最终写入文件
```
# logbuffer.hpp
专注内存管理，基于 `std::array` 的内存结构编写缓冲区

- 为什么其中的所有函数都被设置为了 `noexception`？为什么要这么设计并且将有返回值的函数使用 `[[nodiscard]]` 修饰？
- 缓冲区有什么用？为什么写日志到终端/文件中需要有缓冲区？
- 你提到了"为什么不用 `std::ostringstream` 或 `std::string`？"是因为开销，拷贝成本和颗粒度不够细的原因，那你能给出一个使用它们的例子吗，让我清楚知道哪里会出现开销，哪里会出现颗粒度不够细
- 你的回答中，什么叫做"缓冲区操作不应该抛出异常，确保日志系统稳定性"？为什么需要确保这一点？在什么时候通常需要给函数设置这个修饰？

- 为什么整个 FileLogger 类使用模板？
  因为缓冲区大小设计为了模板*非类型参数*，这样在**编译时确定大小，不再需要计算变长数组/字符串长度和动态分配内存**
- 为什么缓冲区需要使用 `std::array` 作为存储日志的实现？
  `std::array` 在栈上分配，`std::vector` 在堆上分配，栈分配内存更快，并且不需要动态分配内存，无数据迁移成本和带来的迁移不确定性（拓容之后内存位置会变动）
- 为什么不使用 `std::string` 来记录写入 `std::array<char, SIZE> __data` 中?
- 为什么对于缓冲区的各种读写操作都使用 `noexcept` 修饰？
  缓冲区在日志系统中作为存储系统的核心，作为基本操作不应该抛出异常，并且添加 `noexcept` 编译期能够更地好优化性能
- 为什么手动操作 array 中的当期容量指针 `std::array<char, SIZE>::iterator__cur`？
  手动内存管理带来更高性能，并且可以使用 `std::copy` 复制数据（底层使用 SIMD 或者 memcpy 指针操作），而不是通过 for 循环遍历复制，提高性能
# logger.hpp
重中之重是 logger. hpp 的逻辑
## 常量求值关键字
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
## C++20 format 引入的几种字符串处理
### std::format
编程实例参考 [[BookManageSystem+mysql#format 使用限制]]
它最常见的用于 `std::format` 的参数中，确保传入进来的是*编译期已知字符串*，format 工作原理为：
```cpp
std::format("complier {} time {} str", 10, "hello");
										^ 		^
// format先将args参数类型推导出来
// 然后根据推导前面的参数**隐式**构造出第一个参数，std::format_string<int, std::string> 对象
// 这样确保了format能够自动推导模板类型，而不是每次格式化不同参数类型的字符串都需要先手动定义format_string对象
```
如果单独使用 std::format_string 通常是为了显式定义一个字符串中可以被填入的参数类型，不允许修改，本质上只是将编译期的类型验证提前到代码编写阶段
### std::format_string
C++20 新增对象，是一个类型安全的**模板类**，本质是格式化字符串包装器，实现：
1. **编译时**格式字符串验证，类型安全的参数检查
- 普通 format 字符串：
```cpp
const char* fmt = "Hello {}, age {}";  // 只包含字符串内容
// 无法在编译时知道应该传什么类型的参数
std::format(fmt, "World", "not_a_number");  // 编译通过，但实际上传入不合理的值却不容易发现，因为没有报错
```
- `std::format_string`：
明确指明我不希望这段格式化字符串只能格式化我想要的数据类型，如果不对就报错
```cpp
std::format_string<std::string, int> fmt = "Hello {}, age {}";  //包含参数类型信息
// 编译器知道第一个参数应该是 std::string 类型，第二个是 int 类型
std::format(fmt, "World", 25);         // 编译通过，类型匹配
std::format(fmt, "World", "wrong");    // 编译错误！类型不匹配，是std::format的编译时类型检查报错，而不是
```
由于 format_string 处理的是**编译期字符串**，要求格式字符串是**编译期常量表达式**（即字符串字面量或 `constexpr` 字符串），所以必须要在创建对象时指定模板参数
### std::vformat
由于 format 和 format_string 都只能对编译阶段字符串进行格式化并且带有类型检查，那么运行期确定的字符串想要借助 format 头文件就需要 std::vformat
```cpp
int main() {
    std::string runtime_fmt = "Name: {0}, Age: {1}";
    std::string name = "Bob";
    int age = 30;
    auto args = std::make_format_args(name, age);
    std::string result = std::vformat(runtime_fmt, args);
    std::cout << result << '\n';
}
```
## 源代码信息获取
  `std::source_location` 本质上是一个编译期常量对象，它**只能在编译时自动生成**并填充源代码信息（文件名、行号、函数名等），而不是在运行时通过栈回溯或其他方式获取这些信息。
  工作原理
  1. 静态信息填充
```cpp
void example() {
	auto loc = std::source_location::current(); // 编译期记录loc对象创建时信息
	std::cout << "File: " << loc.file_name() << std::endl;			// filename.cpp
	std::cout << "Line: " << loc.line() << std::endl;				// 5
	std::cout << "Column: " << loc.column() << std::endl;
	// 42 std::source_location();
	//						  ^ 由于第一个字符是\t，随意42指向位置是这里
	std::cout << "Function: " << loc.function_name() << std::endl;	// void example()
}
int main(){
	example();
}
```
当创建 `source_location` 对象（即第一行代码）时，编译器在执行这一行代码是就会记下第一行代码的源代码位置信息
除了上述的所有直接的信息，调用 `loc.current()` 方法可以获取返回一个 `source_location` 对象，重新记录调用 current 时新的位置。
2. 如何在编译时获取信息
  `std:: source_location` 通过以下机制在编译时获取源码信息：
- 编译器内置支持：编译器知道当前正在编译的文件、行号和函数
- 常量表达式：std::source_location:: current() 是一个 consteval 函数
- 静态数据：所有信息在编译时就存储在二进制文件中
通常调用的方法是这样：
```cpp
void log_message(const std::string& message, const std::source_location& location = std::source_location::current()) {
    std::cout << "Log: " << message << "\n"
              << "File: " << location.file_name() << "\n"
              << "Line: " << location.line() << "\n"
              << "Column: " << location.column() << "\n"
              << "Function: " << location.function_name() << "\n";
}

int main() {
    log_message("This is a test message"); // 会显示这一行所在的源代码信息
    return 0;
}
```
2. 传统 C 宏实现方法
```cpp
// 这些宏在预处理器阶段就替换为字面量
#define LOG(fmt, ...) \
     printf("%s:%d - " fmt "\n", __FILE__, __LINE__, ##__VA_ARGS__)

LOG("Error occurred");  // 预处理后变成:
// printf("%s:%d - Error occurred\n", "source.cpp", 23);
```
`__FILE__`，`__LINE__` 预处理符号是什么意思参考 [[C++ Runoob Tutoral#宏定义符号和预处理标识符#常用符号]]
## 避免编译器自动推导类型
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
相类似 [[#logbuffer.hpp]] 中的 `capacity()`，`size()` 等简单函数实现，可以使用 `[[nodiscard]]` 强制返回值接受，函数体使用 `<const> noexcept` 并且本项目中的这些函数统一使用后置返回值类型，相对于传统前置更凸显现代 C++语言风格