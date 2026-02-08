---
description: 一级标题名就是项目名称，大部分项目放在/Code Files/temporal_project/MyTinyTools中
---
# CSVReader
## 写项目时出现的问题
- 类中 const 成员必须在类内（最好是构造函数中）通过初始化列表初始化
- `getline` 不接受 const 流（`fstream` 对象被 const 修饰）
- 文件编码保存问题可能会导致路径无法读取，比如文件路径通过字面量硬编码进代码中，**包含中文会导致无法读入**，这个问题在[[MySQL#8. 直接提交 sql 脚本|读写sql脚本]]时也出现过，可以参考保存方法。
  最新版 Visual studio 才会添加一个默认保存方式，旧版本需要使用 ***forceUTF 8***插件完成
- utf-8 有两种格式，
# fast-cpp-csv-parse
## 阅读源码
### 杂项
#### mutable 作用
```cpp
struct base : std::exception {
  virtual void format_error_message() const = 0;

  const char* what() const noexcept override {
    format_error_message();
    return error_message_buffer;
  }

  mutable char error_message_buffer[2048];
};
```
- 声明所有继承base的结构体或者类，都需要重谢format_err_message()方法
- 重写了what方法
- 将error_message_buffer字符数组报错信息限制为2048字符大小，由于不同错误内容不同，所以他是可以修改的。
	- `mutable` 表示这个成员即使在 `const` 函数中也可以被修改；
	- 通常用于“逻辑上不变，但需要缓存数据”的场景；
	- 在这个项目中，`what()` 是 `const` 方法，但需要构造错误信息，因此需要 `mutable`。
#### 异常类 what 及其派生类
- C++标准明确规定 `std::exception::what()` 必须为 `noexcept`，所有派生类必须遵守这一约定。这是异常类型的基础契约。
- 异常处理的规范是通过 struct 或者 class 继承 `std::exception` 并重写 what 方法，what 如果抛出异常则会对程序调试产生严重影响
- 异常处理通常发生在栈展开（stack unwinding）过程中，此时系统状态已不稳定。`noexcept` 避免在此时触发二次异常，保证内存安全。
- 如果`noexcept`函数抛出异常会- 程序会立即调用`std::terminate()`终止，不会进行栈展开。- 编译器可能完全优化掉异常处理代码（因`noexcept`承诺不可违反）

#### 二进制读取文件流
##### FILE 数据类型
`FILE` 是 **C 标准库（`<stdio.h>`）** 定义的一个结构体类型，用于表示一个 **文件流**（file stream），如磁盘文件、标准输入/输出（`stdin`/`stdout`）、管道等。
**特点**：
- 通过 `FILE*`（文件指针）进行操作，如 `fopen()`、`fclose()`、`fread()` 等。
- **`FILE` 是 opaque 类型**（用户不需关心其内部结构，仅用指针访问）。
- 每个打开的文件都有一个 `FILE*`，指向一个缓冲区和文件状态信息。
---
- **C++ 更推荐使用 `<fstream>`**（如 `std::ifstream`/`std::ofstream`）。
- 但在 **C 兼容代码**或 **底层高性能 I/O** 中，`FILE*` 仍有用武之地。
- 如果处理的是 **文本文件**，也可以考虑 `fgets()`/`fscanf()`，而二进制数据推荐 `fread()`/`fwrite()`。
##### `setvbuf()`：设置文件流的缓冲模式
控制文件流的 **缓冲策略**（缓冲机制影响 I/O 性能）。

| 参数       | 说明                                                    |
| -------- | ----------------------------------------------------- |
| `stream` | 要设置缓冲的文件流（如 `stdin`、`stdout` 或 `fopen()` 返回的 `FILE*`） |
| `buffer` | 自定义缓冲区（若为 `NULL`，库自动分配）                               |
| `mode`   | 缓冲模式（见下表）                                             |
| `size`   | 缓冲区大小（字节数）                                            |
缓冲模式（`mode`）：

| 模式            | 说明                                   |
| ------------- | ------------------------------------ |
| `_IOFBF`（全缓冲） | 缓冲区满时或调用 `fflush()` 时才读写（默认模式，适用于文件） |
| `_IOLBF`（行缓冲） | 遇到换行符 `\n` 或缓冲区满时刷新（适用于终端如 `stdout`） |
| `_IONBF`（无缓冲） | 直接读写，不使用缓冲区（适用于即时输出，如 `stderr`）      |
### `fread()`：从文件流读取数据

**函数原型**：
```cpp
size_t fread(void *ptr, size_t size, size_t count, istream is)
```

|参数|说明|
|---|---|
|`ptr`|存储读取数据的缓冲区地址|
|`size`|每个数据项的字节数（如 `sizeof(int)`）|
|`count`|要读取的数据项数量|
|`stream`|文件流（`FILE*`）|
|**返回值**|成功读取的 **数据项数量**（可能小于 `count`）|
**作用**：
从文件流中读取 **二进制数据**（或文本数据），通常与 `fwrite()` 配对使用。
### 各类模块设计
#### namespace error
##### 总体设计
- 在namespace error中定义很多结构体，这些结构体分别对应一种错误类型
- 每一个错误类型结构体必须重写format_error_message()方法，用来显示错误信息。
- 显示的错误信息如果和文件名（file_name），列名（column_name）这些外部由具体csv文件决定的内容时，对应的结构体中就会通过接受这些从文件中读取出来的内容来初始化结构体中对应变量（一般是用来存储信息且有固定最大值的字符数组），做一些简单的处理（比如在末尾填上'\0'）并限制缓冲区大小，防止内存占用过大。

##### 设计意义
之所以分的很细，每一个类也只有format_error_message()和缓冲区字符数组两个成员是为了：
- 当新增一个错误需要别的错误类型的信息时，在设计这个错误类型是只需要也将这个类型作为struct，并多重继承所需要别的错误类型信息对应的struct，就能够使用这些信息（字符数组），并通过重写format_error_message()重写出新的错误类型报错提示
- 新增的错误类型struct只要遵循这种设计，新增的错误类型也可以在未来为其他再新增的错误类型所用。提高了代码复用性，增添新的错误类型是非常方便

#### namespace details

# CodeLineCount
## 简单实现
1. 在一个类中，如果类中函数方法体用 `const` 修饰，说明这个方法不会改变类的状态，所以返回值如果要返回类名&引用，则需要加上 const，变为 `const class_name& func()`
2. 如果写着写着发现 vscode 的提示抽风，明明没有错误的代码出现 `此声明没有存储类类型说明符` 这样的报错，并且：
	- 使用 `using` 自定义的类型 vscode 在输入时无提示
	- 其他标准库有提示和自动补全
	这是需要重置 intellisense 的提示来源
	![[Pasted image 20250718231419.png]]
	选择对应的编译器，或者 cmake 工程中配置文件配置
3. 当一个类中有引用类型变量时，必须在类中初始化或者在构造函数初始化列表中初始化
4. 对于下面这段代码：
```cpp
std::string content((std::istreambuf_iterator<char>(f)), std::istreambuf_iterator<char>());
// and
std::string content(std::istreambuf_iterator<char>(f), std::istreambuf_iterator<char>());
```
   粗看两者相同，但第一行会被解释为构造一个 string 对象，第二个会被解释为返回值为 string 的函数声明，这样会导致再使用
5. 如果通过头文件引入第三方库，为了防止 `F2` 重构名称或者其他批量操作时影响库文件，可以在 `settings.json` 中添加：
```json
"files.readonlyInclude": {
       "include/CLI11/CLI11.hpp": true
   }
```
   保护文件为只读
6. vscode 写代码时，如果想通过 cmake 传入参数，在 launch. json 中设置的 args 会被 settings. json 中 `cmake.DebugConfig。args` 覆盖
## API 使用
### parse 引出的 CallForHelp 异常解析
#### 现象
CLI 11 项目中，如果用户输入参数 `--help` 或者 `--version` 时，程序一定会抛出 `CLI::CallForHelp` 错误，这并不是故意报错，是为了提醒开发者**有意识地处理这些情况** ，比如打印帮助信息、清理资源、优雅退出等
常用模板是：
```cpp
int main(int argc, char** argv) {
    try {
        start(argc, argv);
        // 其他处理函数
        return 0；
    } catch (const CLI::CallForHelp& e) { // 用户输入了`--help`或`--version`，正常流程
        std::cout << e.what() << std::endl;
        return 1;
    } catch (const CLI::ParseError& e) { // 命令行参数解析失败（比如类型不对、参数缺失）
        std::cerr << e.what() << std::endl;
        return e.get_exit_code();
    } catch (const std::exception& e) {
        std::cerr << "Unexpected error: " << e.what() << std::endl;
        return 2;
    }
}
```
使用 `app.parse(argc, argv)` 就需要自己写 try-catch 捕获错误，如果使用 `CLI11_PARSE` 宏
```cpp
#define CLI11_PARSE(app, ...)                                                                                          \
    try {                                                                                                              \
        (app).parse(__VA_ARGS__);                                                                                      \
    } catch(const CLI::ParseError &e) {                                                                                \
        return (app).exit(e);                                                                                          \
    }
#endif
```
就会自动处理错误，并且必须包含 `(app).exit(e)`，打印错误信息的代码被封装在 exit 函数中，不使用会导致程序只抛出异常，而没有信息提示，CallForHelp 异常在 CLI 11 库中被设计为抛出异常后打印 help 手册，而这个手册通过
```cpp
CLI11_INLINE int App::exit(const Error &e, std::ostream &out, std::ostream &err) const {

    /// Avoid printing anything if this is a CLI::RuntimeError
    if(e.get_name() == "RuntimeError")
        return e.get_exit_code();

    if(e.get_name() == "CallForHelp") {
        out << help();
        return e.get_exit_code();
    }

    if(e.get_name() == "CallForAllHelp") {  // this line
        out << help("", AppFormatMode::All);
        return e.get_exit_code();
    }

    if(e.get_name() == "CallForVersion") {
        out << e.what() << '\n';
        return e.get_exit_code();
    }

    if(e.get_exit_code() != static_cast<int>(ExitCodes::Success)) {
        if(failure_message_)
            err << failure_message_(this, e) << std::flush;
    }

    return e.get_exit_code();
}
```
`exit` 函数处理。所以最好的方法就是使用 `CLI11_PARSE` 宏
#### 原理
在 C++ 中，**异常是从抛出点沿着调用栈向上传播的** ，直到找到匹配的 `catch` 块为止。
```cpp
void func3() {
    throw std::runtime_error("Error in func3");
}

void func2() {
    func3();  // func3 抛出异常
}

void func1() {
    func2();  // 异常继续向上传播
}

int main() {
    try {
        func1();  // 异常最终传播到 main 的 try 块中
    } catch (const std::exception& e) {
        std::cout << "Caught in main: " << e.what() << std::endl;
    }
}
```
输出：
```terminal
Caught in main: Error in func3
```
结论：只要**没有在中间函数中捕获异常** ，它就会一直传播到调用栈的上层，直到被某个 `catch` 捕获。另外，现代 C++中默认遵循这种异常抛出规则，所以在 C++11 以后，函数声明中使用 `throw()` 抛出异常的做法已经废弃，不起作用

已经实现的完整代码：
![[source 1.zip]]

## 改良实现
### 各种功能的实现
#### 获取系统时间
config. cpp
```cpp
std::string get_current_time_str() {
    auto now = std::chrono::system_clock::now();
    std::time_t now_c = std::chrono::system_clock::to_time_t(now);
    std::string time_str = std::ctime(&now_c);
    // 移除末尾的换行符
    if (!time_str.empty() && time_str.back() == '\n') {
        time_str.pop_back();
    }
    return time_str;
}
```
#### 自动转化 json 值类型
```cpp
template <typename T>
static T get_key(const json::value& json, const std::string& key) {
    bool is_exist = json.is_object() && json.as_object().contains(key);
    if (is_exist) {
        return json::value_to<T>(json.as_object().at(key));
    } else {
        return T();
    }
}
Config read_config(json::value& j) {
    Config cfg;
    cfg.exclude = get_key<std::string>(j, "exclude");
    cfg.file_sum = get_key<bool>(j, "file_sum");
    cfg.comment_sum = get_key<bool>(j, "comment_line_sum");
    cfg.code_sum = get_key<bool>(j, "code_sum");
    cfg.blank_line_sum = get_key<bool>(j, "blank_line_sum");
    return cfg;
}
```
#### 去除 utf-8 BOM 前缀
```cpp
static void remove_utf8_bom(std::string& content) {
    if (content.size() >= 3 &&
        static_cast<unsigned char>(content[0]) == 0xEF &&
        static_cast<unsigned char>(content[1]) == 0xBB &&
        static_cast<unsigned char>(content[2]) == 0xBF) {
        content = content.substr(3);
    }
}
json::value get_config_file(std::string& file_path) {
    std::ifstream file(file_path);
    if (!file.is_open()) {
        throw std::runtime_error("cannot open file: " + file_path);
    }
    std::string content((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());
    remove_utf8_bom(content);
    return json::parse(content);
}
```
一般使用在读取文件时将内容转化为字符流之前（字符流更能被其他类型直接使用）
#### 真正做到按照字符串分割另一个字符串
```cpp
std::vector<std::string> results;
boost::split(results, reg, boost::is_any_of(","),boost::token_compress_off);
for(auto& s : results){
    boost::trim(s);
}

// 反过来将一个vector<string> 转化为一个字符串
#include <boost::algorithm::join.hpp>
boost::join(vec, ", ");
```
#### glob 字符串转化为 regex 正则表达式
```cpp
std::string glob_to_regex(const std::string& glob) {
    static const std::unordered_map<char, std::string> replacements = {
        {'*', ".*"}, {'?', "."}, {'.', "\\."}, {'\\', "\\\\"}, {'+', "\\+"}, {'^', "\\^"}, {'$', "\\$"}, {'(', "\\("}, {')', "\\)"}, {'|', "\\|"}, {'{', "\\{"}, {'}', "\\}"}, {'[', "\\["}, {']', "\\]"}};
    std::string result;
    result.reserve(glob.size() * 2);
    for (char c : glob) {
        if (auto it = replacements.find(c); it != replacements.end()) {
            result += it->second;
        } else {
            result += c;
        }
    }
    return "^" + result + "$";
}
```
#### 获取编译后可执行文件所在位置
```cpp
#if defined(_WIN32) || defined(_WIN64)
#include <windows.h>
std::string get_exec_path() {
    char path[MAX_PATH];
    GetModuleFileNameA(NULL, path, MAX_PATH);
    return std::string(path);
}
#elif defined(__linux__)
#include <limits.h>
#include <unistd.h>
std::string get_exec_path() {
    char path[PATH_MAX];
    ssize_t count = readlink("/proc/self/exe", path, PATH_MAX);
    if (count != -1) {
        path[count] = '\0';
        return std::string(path);
    } else {
        throw std::runtime_error("Error getting executable path");
    }
}
#else
#error "Unsupported platform"
#endif
```

### 设计技巧
#### 位掩码设计开关
```cpp
constexpr static int OUTPUT = 3;
enum class Output_type {
    CSV = 1 << 0,
    JSON = 1 << 1,
    TERMINAL = 1 << 2,
};

constexpr static int SORT = 6;
enum class Sort_method {
    FILEPATH = 1 << 3,
    TOTAL_SUM = 1 << 4,
    CODE_SUM = 1 << 5,
    COMMENT_SUM = 1 << 6,
    BLANK_SUM = 1 << 7,
    MIXED_SUM = 1 << 8,
};

constexpr static int DISPLAY = 4;
enum class Display_column {
    TOTAL = 1 << 9,
    CODE = 1 << 10,
    COMMENT = 1 << 11,
    BLANK = 1 << 12,
};
```
- 每一个枚举值代表一个功能的开启状态
- 这样的紧凑的位掩码设计不利于添加功能，应该优化为不同枚举值之间有空格
- 标准库中没有反射机制，所以不借助 boost 的情况下需要手动实现 `enum_to_str` 函数
```cpp
template <typename EnumT>
struct EnumMapping;

template <>
struct EnumMapping<Output_type> {
    static constexpr std::array<std::pair<const char*, Output_type>, 3> values = {{{"csv", Output_type::CSV},
    {"json", Output_type::JSON},
    {"terminal", Output_type::TERMINAL}}};
};

template <>
struct EnumMapping<Sort_method> {
    static constexpr std::array<std::pair<const char*, Sort_method>, 6> values = {{{"filepath", Sort_method::FILEPATH},
       {"total_sum", Sort_method::TOTAL_SUM},
       {"code_sum", Sort_method::CODE_SUM},
       {"comment_sum", Sort_method::COMMENT_SUM},
       {"blank_sum", Sort_method::BLANK_SUM},
       {"mixed_sum", Sort_method::MIXED_SUM}}};
};

template <>
struct EnumMapping<Display_column> {
    static constexpr std::array<std::pair<const char*, Display_column>, 4> values = {{{"TOTAL", Display_column::TOTAL},
          {"CODE", Display_column::CODE},
          {"COMMENT", Display_column::COMMENT},
          {"BLANK", Display_column::BLANK}}};
};
```
- 无论是字符串还是 `const char*`（也可以再 array 的模板参数中填入 `const std::string`）让整个模板特化都常量化，从而使用 `constexpr` 关键字加快运行速度。将这些常量计算提前至编译期。
- 如果有开关对应的函数，还可以将函数放入，完成**枚举值->枚举字符串->开关回调函数**映射
```cpp
template <typename EnumT>
const char* enum_to_str(EnumT e) {
    for (const auto& mapping : EnumMapping<EnumT>::values) {
        if (mapping.second == e) {
            return mapping.first;
        }
    }
    return "";
}
```
- 由于配置开关一般放在 json 文件中，这里就需要一个将 json 对象解析为位掩码（表示一组开关的状态）的函数
```cpp
template <typename EnumT>
int generate_bitmask(const json::object& section_obj) {
    int bitmask = 0;

    for (const auto& mapping : EnumMapping<EnumT>::values) {
        auto it = section_obj.find(mapping.first);
        if (it != section_obj.end() &&
            it->value().is_bool() &&
            it->value().as_bool()) {
            bitmask |= static_cast<int>(mapping.second);
        }
    }

    return bitmask;
}
```
- 创建开关组初始值 `int bitmask = 0;`
- 新增开关状态使用 ` bitmask |= static_cast<int>(枚举值)`
- 验证开关组中某个开关是否打开 `bool flag = bitmask & static_cast<int>(枚举值)`
### 踩坑
#### 避免 git 跟踪和提交无意义文件
```gitignore
**/build/ # 避免匹配构建编译目录
**/*.exe  # 编译文件
**/*.obj  # 对象文件
**/*.vcxproj  # vs工程文件，也是纯文本
**/out/build/
**/.vscode/
```
其中匹配规则符合 glob 语法规则，对于已经被 git 跟踪的文件，再写就没有意义了
#### 不要把密钥明文写入代码中
git 提交是不可删除的，除非将整个 git 存储目录重置（删除 .git 目录），如果所有修改的提交记录如下
```bash
-- no api key(meaningless)
-- fix bugs(first found key leaked out version)
-- fix bugs1
-- fix bugs2(first contains key)
-- cannot run version
```
因提交 no api key 版本不会影响之前的提交记录，所以有以下几种方法解决
- 最好的方法就是更改密钥。
- 删除本地 ,git 目录，然后使用 `git init && git push --force` 将本地代码覆盖远程仓库，这回清空所有提交记录
- 使用专业工具解析 git 本地记录文件，删除记录中所有密钥字符串然后提交，这样比较复杂，而且只能全字匹配密钥字符串。
#### api 使用
##### boost. json 不支持格式化文件
boost. json 对象在使用 `file << boost::json::serialize(json_object)` 写入文件后是未格式化的版本。不能在代码层面中使用锁紧格式化，也不支持在文件中插入注释。
##### tabulate 库各种限制
tabulate 库创建表格不支持跨行/列居中合并单元格的操作。创建一行数据时不支持使用
```cpp
vector<int> vec = {1,2,3,4};
tab::Row row(vec);
// 或
tab::Row row(vec.begin(), vec.end());
// 不能通过
tab::Row row({1,2,3,4})  // 同理table对象的add_row函数
// 每一个插入table的的函数类型，通过add_row方法，必须能够被构造为
using Row_t = std::vector<variant<std::string, const char *, string_view, Table>>;
```
需要自己写转换函数，非常麻烦
所有 row 的**横向长度**，table 的**纵向长度**都是动态的，**无法在编译期写死**
无法自动根据插入内容调整宽度，如果 `add_row({"1","2“,”3","4"})`，下一行插入一个 5 列数据的行，程序会直接崩溃，Microsoft runtime C++弹窗提示**程序使用 `abort()` 函数强制中断**，给出内存错误地址，而不是在终端返回错误原因。
如果想要返回
![[Pasted image 20250901001120.png]]
这种格式，表头必须写为 `table.add_row("head", "", "")`，不写转换函数的情况下****无法用动态数据（比如某个 vector 的 size）来初始化每一行的项数***。这又与它**动态**的设计相反。
##### 使用 `std::regex` 要保存原字符串数据
- `std::regex` 设计为轻量级的正则表达式引擎，它只存储编译后的有限状态机，不存储原始字符串节省内存和提高性能。
- `boost.regex` 同样不支持
#### 事先计划非常重要
##### 1. 粗建框架
- 先规划后程序所有的模块
- 模块中应该有哪些功能
- 功能之间的联系
##### 2. 想象中程序的运行流程
建一个 mian. cpp，写出主要流程，按顺序从上到下：
- 初始化
- 加载配置
- 根据配置作出处理
- 结束动作
- 最外层**一定要有错误捕获处理机制**
```cpp
#include "arg_parse.h"
#include "config.h"
#include "count.h"
#include "output.h"
// 包含所有功能模块，辅助模块时在功能模块中使用的，不用在主函数中，主函数不考虑实现细节

int main(int argc, char** argv) {
    try {
        ParsedArgs args = arg_parse(argc, argv);
        Config cfgs = read_config(args.config_file_path);
        Counter counter(cfgs, args);
        counter.start();
        Outputer out(cfgs, counter.get_count_result(), args);
        out.start();
    } catch (const std::exception& e) {
        std::cerr << "exception found: " << e.what() << std::endl;
        return 1;
    } catch (...) {
        std::cerr << "unknow error occurs.";
    }
}
```
##### 3. 细化框架
- 细化每一个功能有没有现成的 api，框架可以使用，先网上查一查
- 所有包含数据的结构体和类，对数据的处理逻辑函数也应该放在其中
```cpp
struct CodeStats {
   private:
    std::string to_string(const std::string& delimiter);

   public:
    std::string file_path;
    int total_lines = 0;
    int code_lines = 0;
    int comment_lines = 0;
    int blank_lines = 0;
    int mixed_lines = 0;

    boost::json::object to_json_object();
    std::string to_csv_row();
    void add_to_terminal_row(tab::Table& parent);
    void add_to_terminal_col(tab::Table& parent);

    CodeStats& operator+=(const CodeStats& other) {
        this->blank_lines += other.blank_lines;
        this->code_lines += other.code_lines;
        this->comment_lines += other.comment_lines;
        this->mixed_lines += other.mixed_lines;
        this->total_lines += other.total_lines;
        return *this;
    }
};
```
- 理清功能，函数之间的依赖关系，最小化 include 依赖链条
- 调整 api 参数，缩短参数传递链条
##### 4. 设置文件布局
- 是细节而不是主要逻辑实现的函数放在 uitls 中
- 常用的辅助类函数使用 inline 优化
- 精简每一个头文件，只暴露其他文件中必要的接口
##### 5. 实现每个模块的异常处理和测试
- 可能有错误一定要 try-catch 已知的错误，没有错误务必声明 `noexcept`
- 让每一个函数都返回想要的结果
##### 6. 实现过程中不要加需求
- 规划完成严格按照计划步骤实现，增删过程会导致不确定性和大量的重写

# MdTitleAdjust
## 杂项
### QSpacerItem 的添加和修改
QSpacerItem 在创建时根据构造函数中参数的不同填写方法决定 spacer 的延展方向和拓展策略，如果在拓展策略中没有填入 `QSizePolicy::Fixed`，那么前两个参数初始值无意义。
QT 设置 spacer 一旦创建不得修改其大小和拓展策略，这导致**需要调整则要删除对象重新创建**
```cpp
void TitleBlock::do_button_right_clicked()
{
    if(spacer_h_->sizeHint().width() < indent_size_ * 6){
        level_++;
        mainlayout_->removeItem(spacer_h_);
        delete spacer_h_;
        spacer_h_ = new QSpacerItem(level_ * indent_size_, 0, QSizePolicy::Fixed, QSizePolicy::Minimum);
        // mainlayout->addWidget(spacer_h_);
    }
}
```
这时候由于 `addWidget()` 是顺序插入的，`spacer_h_` 其实需要通过 `insertItem` 通过索引插入
```cpp
QHBoxLayout *layout = qobject_cast<QHBoxLayout*>(this->layout());
if (layout) {
     // 获取原spacer的索引
     int spacer_index = -1;
     for (int i = 0; i < layout->count(); ++i) {
         if (layout->itemAt(i) == spacer_h_) {
             spacer_index = i;
             break;
         }
     }
     if (spacer_index != -1) {
         // 移除旧的spacer
         layout->removeItem(spacer_h_);
         delete spacer_h_;
         // 插入新的spacer到原位置
         layout->insertItem(spacer_index, new_spacer);
         spacer_h_ = new_spacer;
	}
}
```
但更好的方法是使用 `QWidget` 对象作为占位对象，这样也支持修改 `setFixedSize()`

# EyesProtect
## 杂项
### QSpacerItem 布局填充
添加 spaceitem 作为布局填充时，参考[[#MdTitleAdjust#杂项#QSpacerItem 的添加和修改|对象QSpaceItem构造函数的参数意义]]
### 紧凑布局
如果想要让所有控件都以最紧凑的形式排列，使用
```cpp
this->adjustSize();
QSize miniumSize = this->minimumSize();
this->resize(400, miniumSize.height());
```
这样就不用通过布局管理器来调整，这里直接调整一整个 QWidget
### 两个 find_package 查找 qt 模块
qt 添加两个 find_package 命令来查找
```cmake
find_package(QT NAMES Qt6 Qt5 REQUIRED COMPONENTS Widgets)
find_package(Qt${QT_VERSION_MAJOR} REQUIRED COMPONENTS Widgets)
```
- 第一个 find_package 用于*查找拥有 Widgets 模块的库*，并且 qt 由于有多个版本，所以这里在 qt 6，qt 5 中查找，并且优先 qt 6，查找到后就会定义 `$QT_VERSION_MAJOR` 变量。
- 使用 `NAMES` 是为了指定 `config.cmake` 文件的名称，依次尝试查找 `Qt6Config.cmake` 或 `Qt5Config.cmake` 文件，如果找到了 `Qt6`，那么 `QT_VERSION_MAJOR` 变量会被设置为 `6`。
- 使用 `REQUIRED COMPONENTS` 用于确保这个库中拥有 widgets 这个模块
- 第二个根据 Qt 大版本号添加模块
## 创建全屏无边框页面
```cpp
// 构造函数中设置
this->setWindowState(Qt::WindowFullScreen);
this->setWindowFlags(Qt::Window | Qt::FramelessWindowHint | Qt::WindowStaysOnTopHint);

void IntervalPage::showIntervalPage(quint16 intervalMinutes) {
	QDateTime currentDateTime = QDateTime::currentDateTime();
	QDateTime deadlineTime	  = currentDateTime.addSecs(intervalMinutes * 60);
	QString	  deadline		  = deadlineTime.toString("hh:mm:ss");
	QFont	  font;
	font.setBold(true);
	font.setPointSize(40);
	info->setText(QString("Interval starts now and ends at %1").arg(deadline));
	info->setFont(font);
	info->setAlignment(Qt::AlignCenter);
	info->adjustSize();
	QScreen* screen = QGuiApplication::primaryScreen();
	this->resize(screen->size());
	this->show();
	this->raise();
	this->activateWindow();
#ifdef Q_OS_WIN
	AllowSetForegroundWindow(ASFW_ANY);
	SetWindowPos(reinterpret_cast<HWND>(this->winId()), HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
	QTimer::singleShot(0, this, [this]() { SetWindowPos(reinterpret_cast<HWND>(this->winId()), HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE); });
#endif
#ifdef Q_OS_LINUX
	QDBusInterface kwin("org.kde.kwin", "/Window", "org.kde.KWindow", QDBusConnection::sessionBus());
	kwin.call("activateWindow", (quint32)this->winId());
#endif
```
创建好全屏界面样式后，构造函数中先表明这是一个全屏无边框窗口，展示窗后后 `raise()` 让窗口出现在最前端，`activateWindow()` 用于将焦点移动到窗口
由于不同平台的设置焦点方法不一，需要使用宏定义
```cpp
#ifdef Q_OS_WIN
	AllowSetForegroundWindow(ASFW_ANY);
	SetWindowPos(reinterpret_cast<HWND>(this->winId()), HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
	QTimer::singleShot(0, this, [this]() { SetWindowPos(reinterpret_cast<HWND>(this->winId()), HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE); });
#endif
#ifdef Q_OS_LINUX
	QDBusInterface kwin("org.kde.kwin", "/Window", "org.kde.KWindow", QDBusConnection::sessionBus());
	kwin.call("activateWindow", (quint32)this->winId());
#endif
```
主要作用是
- (windows)允许进程获取窗口焦点
- 临时将窗口设为最顶层（覆盖所有其他窗口）
- 立即（下一事件循环）取消最顶层状态（不取消一直在顶层会让屏幕全都被覆盖无法关闭），但保留窗口在前台
- (linux)创建与KDE窗口管理器（KWin）的DBus接口
- 调用 `activateWindow` 方法激活指定窗口（使其获得焦点并前置）
## 防止信号循环触发槽函数
要做到这样的效果
![[PixPin_2026-01-05_23-34-07.mp4]]
```cpp
void Mainwindow::do_worktime_valueChanged(int value) {
	if(this->check_recommend->isChecked()) {
		disconnect(this->slider_worktime, &QSlider::valueChanged, this, &Mainwindow::do_worktime_valueChanged);
		// ...
		connect(this->slider_worktime, &QSlider::valueChanged, this, &Mainwindow::do_worktime_valueChanged);
	}
	else {
		this->worktime->setText(QString("work time: %1m").arg(value));
	}
}

void Mainwindow::do_interval_valueChanged(int value) {
	if(this->check_recommend->isChecked()) {
		disconnect(this->slider_interval, &QSlider::valueChanged, this, &Mainwindow::do_interval_valueChanged);
		// ...
		connect(this->slider_interval, &QSlider::valueChanged, this, &Mainwindow::do_interval_valueChanged);
	}
	else {
		this->interval->setText(QString("interval: %1m").arg(value));
	}
}
```
在发生改变时先断开另一边的信号槽连接，防止循环信号触发
## 引入静态库 QAntDesign
参考 [[QT6开发指南#创建和使用静态库#使用静态库]]

# leptjson
## 杂项
### 单元测试编写
单元测试也能确保其他人修改代码后，原来的功能维持正确（这称为回归测试／regression testing）
一般来说，软件开发是以周期进行的。例如，加入一个功能，再写关于该功能的单元测试。但也有另一种软件开发方法论，称为测试驱动开发（test-driven development, TDD），它的主要循环步骤是：
1. 加入一个测试。
2. 运行所有测试，新的测试应该会失败。
3. 编写实现代码。
4. 运行所有测试，若有测试失败回到3。
5. 重构代码。
6. 回到 1。
TDD 是先写测试，再实现功能。好处是实现只会刚好满足测试，而不会写了一些不需要的代码，或是没有被测试的代码。
一个极简的单元测试用宏替换来引入测试的符号，然后用各种*静态*函数来实现功能，在宏中调用这些测试函数
### 宏编写技巧
用宏编写[[#单元测试编写|单元测试]]
```cpp
static int main_ret = 0;
static int test_count = 0;
static int test_pass = 0;

#define EXPECT_EQ_BASE(equality, expect, actual, format) \
    do {\
        test_count++;\
        if (equality)\
            test_pass++;\
        else {\
            fprintf(stderr, "%s:%d: expect: " format " actual: " format "\n", __FILE__, __LINE__, expect, actual);\
            main_ret = 1;\
        }\
    } while(0)
```
正常而言，宏中如果单条语句过长，使用 `\` 换行，如果宏**替换部分有多条语句**，需要使用 `do-while` 包裹，因如果在*因单行而省略 `{}` 的语句*中，会出现这种问题：
```cpp
#define M() a(); b()
// #define M() { a(); b(); }  // 使用{}包裹宏替换部分
if (cond)
    M();
else
    c();

/* 预处理后 */
if (cond)
    a(); b(); /* b(); 在 if 之外，少读一句     */
    // { a(); b(); }; // 最后的分号代表 if 语句结束，后面的else断开
else          /* <- else 缺乏对应 if */
    c();
```
在宏定义中使用参数时，无论它在哪里被使用，都应该用括号包裹，以保证参数作为一个整体参与表达式运算：
```cpp
#define EXPECT_EQ_INT(expect, actual) EXPECT_EQ_BASE((expect) == (actual), expect, actual, "%d")
```
由于 expect，actual 可能是返回某些值的表达式，宏只是文本替换，所以要考虑优先级问题
# 施磊手写线程池
参考：[IO密集型和CPU密集型程序_ev_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1Fb421H7ep?spm_id_from=333.788.player.switch&vd_source=876be08bc9c030f4a9ea1fb97e0d0342&p=3)
资料：https://pan.baidu.com/s/1Q_fM-jpTIizA5WnWyj_h4A 提取码: kw9j
## 前置知识
### IO 密集型和 CPU 密集型
多线程程序一定好吗？
不一定，需要根据当前程序的类型来做判断：
- 多核 CPU
	- IO 密集型，程序里面指令的执行，涉及一些 IO 操作，比如设备、文件、网络操作，IO 操作是可以把程序阻塞住的比如等待客户端的连接，等待日志写入。这些操作**更适合**设计为多线程程序，因大部分 IO 密集型操作*准备好接受调度的时间是不确定的*，不会放在操作系统就绪队列中，而是在阻塞队列中
	- CPU 密集型程序里面的指令都是做计算用的，不会被阻塞。CPU 密集型也可以设计为多线程程序，每一个线程执行一个计算任务，发现任务执行完后继续安排
- 单核 CPU
	- IO 密集型，适合设计为多线程，因单核一旦被阻塞程序卡死了
	- CPU 密集型**不适合设计为多线程**，线程越多上下文切换开销越大

### 线程池的设计
#### 性能开销
为了完成任务，创建很多的线程可以吗？线程真的是越多越好？
- 线程的创建和销毁都由非常大的开销
- 线程的上下文切换要占用大量时间
![[PixPin_2026-01-23_09-55-09.png|task之间的切换需要开销]]
- 大量线程同时唤醒会使系统经常出现锯齿状负载或者瞬间负载量很大导致宕机
- 创建线程最终需要**移交到操作系统内核来实现&调度**，用户态不能创建和调度
![[PixPin_2026-01-23_10-06-49.png]]
#### 内存开销
线程栈本身占用大量内存
用户空间：
```bash
root@VM-20-9-ubuntu:~# ulimit -a
real-time non-blocking time  (microseconds, -R) unlimited
core file size              (blocks, -c) 0
data seg size               (kbytes, -d) unlimited
scheduling priority                 (-e) 0
file size                   (blocks, -f) unlimited
pending signals                     (-i) 14416
max locked memory           (kbytes, -l) 476076
max memory size             (kbytes, -m) unlimited
open files                          (-n) 1024
pipe size                (512 bytes, -p) 8
POSIX message queues         (bytes, -q) 819200
real-time priority                  (-r) 0
stack size                  (kbytes, -s) 8192
cpu time                   (seconds, -t) unlimited
max user processes                  (-u) 14416
virtual memory              (kbytes, -v) unlimited
file locks                          (-x) unlimited
```
一个 stack size 栈空间在 8MB 大小，32 位系统一个进程最多占用 4G，用户空间 3G，内核 1G，用户空间最多 384 个（这还是不算栈内存，代码片段的大小）
线程数量多了后会占用大量内存

#### 线程的数量
大部分网络库中，会根据系统 CPU 数量决定线程数量
线程池一般有两种模式：
fixed 模式：线程池中线程数量固定，在启动程序时指定
cache 模式：根据任务数量动态增减线程

#### 线程的状态
1. **就绪态** (Ready) - 线程已创建，等待 CPU 调度。在代码中体现为创建 `std::thread` 对象并关联了可执行函数
2. **等待态** (Waiting) - 线程被挂起，条件变量调用 wait 系列函数，notify 系列函数会退出这个状态
3. **阻塞态** (Blocked) - 线程没有被挂起，但因等待没有获取互斥锁无法访问资源或事件而暂停，也可线程中关联函数调用 `std::thread::sleep` 系列函数。**这个状态不会被操作系统内核分配时间片**
4. **运行态** (Running) - 线程正在执行
5. **终止态** (Terminated) - 线程执行完毕或被终止。线程可执行函数 return 或者线程中抛出异常但外部没有接受，或者调用了 `std::terminate()`
### 线程同步
#### 线程互斥方式
互斥锁，参考 [[C++ Runoob Tutoral#互斥量，互斥锁和包装器]]
原子类型的原子操作，参考 [[Modern C++#atomic 原子对象]]
#### 线程通信方式
条件变量：
参考 [[C++ Runoob Tutoral#条件变量]]，和线程互斥的本质区别：
![[C++ Runoob Tutoral#^sw324y]]
具体例子参考 [[FastLog#logger.hpp]] 中的设计
信号量：
参考 [[C++ Runoob Tutoral#信号量 semaphore]]

> [!note]
> 面试时主要表达出
> - 互斥锁的作用是防止[[Modern C++#4. 竞态条件|竞态条件]]出现
> - 原子类型是防止脏数据，写入失败等问题
> - 条件变量时让临界代码按照根据某些条件是否成立来**按照一定顺序执行**
## 代码编写
### 初始代码结构
```cpp
enum class PoolMode { ModeFixed, ModeCached };

class Task {
	virtual void run() = 0;
};

class Thread {
  public:
  private:
};

class ThreadPool {
  public:
	ThreadPool();
	~ThreadPool();

	void start();
	void set_mode(PoolMode mode);

  private:
	std::vector<std::unique_ptr<Thread>> threads_;
	unsigned int						 init_thread_size_;
	std::queue<std::shared_ptr<Task>>	 tasks_que_;
	std::atomic_uint					 task_size_;
	std::mutex							 task_que_mutex_;  // for tasks_que_
	std::condition_variable				 cv_not_full_;
	std::condition_variable				 cv_not_empty_;
};
```
对于设计中 thread 和 task 的指针封装：
- `threads_` 中使用 `std::unique_ptr` ：
	- 线程池创建线程，并拥有它们的生命周期；
	- 线程池负责启动、管理、销毁这些线程；
	- 线程在物理和逻辑上都不允许线程被复制或转移给其他对象
	- 如果在 threads_中存储裸指针，那么在析构函数中需要 delete，否则泄露
- `tasks_que_` 中使用 `std::shared_ptr`：
	- 提交任务这一行为是**先由使用者构建一个任务对象然后被提交到任务队列中**，线程池需要从队列中取出这一个任务并执行，任务执行完毕后由线程池管理/销毁。*每个任务对象拥有者有多个*，并且生命周期必须长于用户构建->任务执行完毕。
	- 用户提交任务到池中**需要通过继承 Task 类并重写 run**，如果使用 `std::queue<Task>` ，那么会在编译时写死类型/内存信息，[[C++ Runoob Tutoral#多态#多态分类和触发|语法上可行但不会触发多态，而会触发对象切片]]，造成未定义行为。
	- 如果使用 `std::queue<Task*>` 可以触发多态，但是无法保证用户调用 `ThreadPool::sumbit_task()` 是没有直接**在入参中构造一个临时值（将亡值/右值）**，这样任务对象会在提交任务函数结束后被销毁，但任务列表中指针变量仍存在，销毁后指针悬空。
	- 所以使用 `std::queue<std::unique_ptr<Task>>` 这样无论传入什么都能被接管内存并且触发多态
### 基本线程池任务架构
#### 分离线程设计
```cpp
class Thread {
	using ThreadFunc = std::function<void()>;
  public:
	Thread(ThreadFunc func);
	~Thread();
	void start();

  private:
	  ThreadFunc func_;
};

void ThreadPool::start(int init_thread_size) {
	init_thread_size_ = init_thread_size;
	for(int i = 0; i < init_thread_size; i++) {
		threads_.emplace_back(std::make_unique<Thread>(std::bind(&ThreadPool::thread_func, this)));
	}
	for(int i = 0; i < init_thread_size; i++) {
		threads_.at(i)->start();
	}
}

void ThreadPool::thread_func() {
	auto					   id = std::this_thread::get_id();
	std::hash<std::thread::id> hasher;
	std::cout << "thread func " << hasher(id) << '\n';
}
```
- 线程池执行逻辑为：
	- 创建线程池，初始创建 init_thread_size_ 个 Thread 对象，Thread 被存储在线程队列 `std::vector<std::unique_ptr<Thread>> threads_` ，每个 Thread 对象绑定线程函数对象，存放在 `func_` 中，将来被 Thread 对象通过 `start()` 创建 `std::thread t(func_)` **真正创建线程并执行任务**
	- 用户通过 `submit_task()` 提交任务。任务被存储在线程池中的任务队列
	- 线程队列中的线程抢占任务队列中的任务，通过 `threads` 任务结束后将线程归还池中
- 为什么这里设计线程需要分离执行？
	- **线程生命周期管理**：当 `std::thread` 对象超出作用域时，如果它仍然关联着一个正在执行的线程，程序会调用 `std::terminate()` 终止整个程序。为了避免这种情况，必须在 `std::thread` 对象销毁前要么调用 `join()` 等待线程结束，要么调用 `detach()` 分离线程。
	- __线程池的工作模式__：在线程池中，工作线程通常会持续运行，等待任务队列中的任务。它们不会立即结束，所以不能使用`join()`，因为那会使主线程阻塞等待。
	- __分离线程的含义__：`detach()` 使线程在后台独立运行，不再受原始 `std::thread` 对象的控制。线程会在其关联的函数完成后自动清理资源。参考 [[C++ Runoob Tutoral#多线程#线程控制函数、方法]]
	- 如果让 thread_func 函数中只执行一个任务，那么线程分离其实违背了线程池的设计初衷，线程池应该让线程持续运行，从任务队列中获取任务并执行。执行完成后有两种选择
		- 不让线程结束，thread_func 中实现一个无限循环，让线程一直"工作"，在结束上一个任务/空闲时**被条件变量挂起**。本质上是控制线程一直工作/挂起，资源不被释放（当前使用的方案）
		- 线程分离方式无对线程掌控能力，如要管理线程则需要创建容器将线程分类为：“工作中线程”/“空闲线程”这样的缓冲模式，并将容器设置为 ThreadPool 成员变量，类似于 [[FastLog#三重缓冲区设计]]。

- 测试 thread_func 函数内容为输出线程 id，每个 Thread 对象的 `start()` 最终会在通过 `std::thread` 执行 `std::bind(&ThreadPool::thread_func, this)` 任务
#### 提交任务实现
```cpp
void ThreadPool::thread_func() {
	for(;;) {
		std::shared_ptr<Task> task;
		{
			std::unique_lock<std::mutex> lock(task_que_mutex_);
			auto						 id = std::this_thread::get_id();
			std::hash<std::thread::id>	 hasher;
			std::cout << "tid " << hasher(id) << " trying to gain a task...\n";
			cv_not_empty_.wait(lock, [&]() -> bool { return tasks_que_.size() > 0; });
			std::cout << "tid " << hasher(id) << " gained a task, start process\n";
			task = tasks_que_.front();
			tasks_que_.pop();
			task_size_--;
			cv_not_full_.notify_all();
			if(tasks_que_.size() > 0) {
				cv_not_empty_.notify_all();
			}
		}
		if(task != nullptr) {
			task->run();
		}
	}
}

void ThreadPool::submit_task(std::shared_ptr<Task> task) {
	std::unique_lock<std::mutex> lock(task_que_mutex_);
	// cv_not_full_.wait(lock, [&]() -> bool { return tasks_que_.size() < task_que_max_threshold; });
	if(!cv_not_full_.wait_for(lock, std::chrono::seconds(1), [&]() -> bool {
		   return tasks_que_.size() < (size_t)task_que_max_threshold;
	   })) {
		std::cerr << "waited 1s and task queue still full";
		return;
	}
	tasks_que_.emplace(task);
	task_size_++;
	cv_not_empty_.notify_all();
}
```
创建以下任务：
```cpp
class MyTask : public Task {
	void run() override {
		// under windows + mingw env, std::this_thread::get_id() is incomplete support, cannot print directly
		// std::cout << "thread func " << std::this_thread::get_id() << '\n';

		auto					   id = std::this_thread::get_id();
		std::hash<std::thread::id> hasher;
		std::cout << "tid " << hasher(id) << " begin\n";
		std::this_thread::sleep_for(std::chrono::seconds(2));
		std::cout << "tid " << hasher(id) << " end\n";
	}
};

int main() {
	ThreadPool pool;
	pool.start(4);

	pool.submit_task(std::make_shared<MyTask>());
	pool.submit_task(std::make_shared<MyTask>());
	pool.submit_task(std::make_shared<MyTask>());

	// std::this_thread::sleep_for(std::chrono::seconds(5));
	std::cin.get();
}
```
日志内容
```bash
tid 1230235464250880600 trying to gain a task...
tid 1230235464250880600 gained a task, start process
tid 1230235464250880600 begin
tid 8670141377090704656 trying to gain a task...
tid 8670141377090704656 gained a task, start process
tid tid 18137369640724998020 trying to gain a task...
tid 18137369640724998020 gained a task, start process
8670141377090704656 begin
tid 4249528327736205830 trying to gain a task...
tid 18137369640724998020 begin
tid 1230235464250880600 end
tid 1230235464250880600 trying to gain a task...
tid 18137369640724998020 end
tid 8670141377090704656 end
tid 18137369640724998020 trying to gain a task...
tid 8670141377090704656 trying to gain a task...
```
- 可以看到有 6 次 trying to gain a task，三次 gained 并且 end 了，三次还在 trying ，原因便是线程池中三个线程已经执行完了任务，尝试获取但卡在 `cv_not_empty_.wait(lock, [&]() -> bool { return tasks_que_.size() > 0; });`
- 添加任务数量超过 task_max_threshold 则会正常进行等待
>[!note]
> ```bash
> commit 34259e9ded3a52a982650a0e742d3d602c3873d7 (HEAD -> master)
> Author: sickwag <sickwag@outlook.com>
> Date:   Tue Jan 27 16:46:26 2026 +0800
>     basic structure
> ```
#### 获取任务执行结果
比如计算任务，执行完返回计算结果，需要自定义任务执行结果，一般通过修改 `Thread::run()` 的返回值来做到，但是不同任务返回值类型不一样，所以需要：
- 泛型，但是 Task 中 run 是虚函数，不能使用模板。实例化对象时创建的[[C++ Runoob Tutoral#虚函数表|虚函数表]]需要指向一个函数签名&&内存布局确定的函数，***模板的静态实例化和多态虚函数的运行期动态绑定有根本的冲突***
- [[C++开发范式#CRTP（Curiously Recurring Template Pattern）|CRTP]]，但这还是需要模板，在有纯虚函数的类中无法做到，需要重构通过继承 Task 重写 run 方法的提交任务逻辑。并且如果一个任务有多个不同类型的可能返回值就子类中需要写多个函数，或者子类函数使用模板。***总体流程过于复杂***
- `std::any` 最简单，C++17 支持
这里使用自实现的 `Any` 类型封装不同任务的结果
```cpp
class Any {
  public:
	Any()						= default;
	~Any()						= default;
	Any(const Any&&)			= delete;
	Any& operator=(const Any&&) = delete;
	template <typename T>
	Any(T data)
		: base_(std::make_unique<Derive<T>>(data)) {}
	template <typename T>
	T cast() {
		Derive<T>* pd = dynamic_cast<Derive<T>*>(base_.get());
		if(pd = nullptr) {
			// When the type of user cast is inconsistent with the storage type
			throw std::runtime_error("target type is incompatible with storage type");
		}
	}
	class Base {
	  public:
		virtual ~Base() = default;

	  private:
	};
  template <typename T>
  class Derive : public : Base {
	  public:
		Derive(T data)
			: data_(data) {}

	  private:
		T data_;
	};

  private:
	std::unique_ptr<Base> base_;
};
```
核心在于类型擦除器，参考
获取 task 对象执行任务结果的返回值有两种方法
- task 对象 `get_result<T>()` 方法获取
- Result 对象通过接受 any 对象 `Result<T>(any)` 获取
第一种方法不能使用，原因在 `ThreadPool::submit_task` 中，task 传入任务后返回只是一个 Result 外壳，真正执行任务的 `thread_func()` 中：
```cpp
task = tasks_que_.front();
tasks_que_.pop();
```
task 对象会在 pop 后销毁，这时候任务执行完需要任务执行结果时 task 对象已经被释放，悬空指针访问会出现未定义行为

还有一个问题，使用
```cpp
Result res = pool.submit_task(std::make_shared<MyTask>());
res.get<T>();
```
得到结果需要等待线程执行完毕，但是代码调用是可能没有执行完，这时候需要线程间通信了解执行情况，未执行完则阻塞调用 get 的线程。通过自定义信号量 `Semaphore` 实现
![[PixPin_2026-01-27_20-48-49.png]]
```cpp
class Semaphore{
	public:
		Semaphore(int init_limit);
		~Semaphore() = default;

		void post();
		void wait();

	private:
		int resource_limit_;
		std::condition_variable cv_;
		std::mutex mutex_; // for `resource_limit_`
};

Semaphore::Semaphore(int init_limit)
	: resource_limit_(init_limit) {}

void Semaphore::post() {
	std::unique_lock<std::mutex> lock(mutex_);
	resource_limit_++;
	cv_.notify_all();
}

void Semaphore::wait() {
	std::unique_lock<std::mutex> lock(mutex_);
	cv_.wait(lock, [this]() -> bool { return resource_limit_ > 0; });
	resource_limit_--;
}
```
Result 类型用来存储每个任务执行结果，配合 Task 和 Any，最终实现这样的效果
```cpp
Result res = pool.submit_task(std::make_shared<MyTask>(1, 1000000));
res.get().cast<unsigned long long>();

// 我感觉不如get<T>()方便，这样还不需要设计一个Result类型
```
### Master-Slave 任务分配
参考 [[C++开发范式#Master-Slave 任务分配机制]]
## 更简单的版本
### 实现 Fixed 模式
```cpp
// hpp file
class ThreadPool {
  public:
	ThreadPool(size_t size);
	template <class F, class... Args>
	auto enqueue(F&& f, Args&&... args) -> std::future<typename std::result_of<F(Args...)>::type>;
	~ThreadPool();

  private:
	std::vector<std::thread>		  workers_;
	std::queue<std::function<void()>> tasks_;
	std::mutex						  mutex_queue_;	 // for `task_`
	std::condition_variable			  cv_;
	bool							  stop_;
};

template <class F, class... Args>
inline auto ThreadPool::enqueue(F&& f, Args&&... args) -> std::future<typename std::result_of<F(Args...)>::type> {
	using return_type = typename std::result_of<F<Args...>::type>;
	auto task =
		std::make_shared<std::packaged_task<return_type()>>(std::bind(std::format<F>(f), std::forward<Args>(args)...));
	std::future<return_type> res = res->get_future();
	{
		std::unique_lock<std::mutex> lock(mutex_queue_);
		if(stop_) {
			throw std::runtime_error("enqueue on stopped ThreadPool");
		}
		tasks_.emplace([task]() { (*task)(); });
	}
	cv_.notify_one();
	return res;
}

// source file
#include "thread_pool_simpler.hpp"

inline ThreadPool::ThreadPool(size_t thread_size)
	: stop_(false) {
	for(size_t i = 0; i < thread_size; i++) {
        workers_.emplace_back([this]() {for (;;) {
            std::function<void()> task;
            {
                std::unique_lock<std::mutex> lock(this->mutex_queue_);
                this->cv_.wait(lock, [this]()->bool {return this->stop_ || !this->tasks_.empty();});
                if (this->stop_ && this->tasks_.empty()) {
                    return;
                }

            }
            task = std::move(this->tasks_.front());
            this->tasks_.pop();
        }});
    }
}

inline ThreadPool::~ThreadPool() {
    {
        std::unique_lock<std::mutex> lock(mutex_queue_);
        stop_ = true;
    }
    cv_.notify_one();
    for (auto& worker : workers_) {
        worker.join();
    }
}
```
### 代码改进
#### std::packaged_task 与 std::function 区别

| 特性                     | `std::packaged_task`            | `std::function`      |
| ---------------------- | ------------------------------- | -------------------- |
| **用途**                 | 异步任务包装器，用于配合 `std::future` 获取结果 | 通用函数对象封装器，用于回调、延迟调用等 |
| **是否绑定 `std::future`** | ✅ 是，提供 `get_future()` 获取异步结果    | ❌ 否，不提供异步结果机制        |
| **是否可移动（move-only）**   | ✅ 是（不可复制）                       | ✅ 是（可复制）             |
| **调用后行为**              | 执行任务，并将结果存储到绑定的 `future`        | 执行任务，返回结果（调用者直接获取）   |
| **是否为异步编程设计**          | ✅ 是，专为异步任务设计                    | ❌ 否，通用函数对象封装工具       |
- `std::packaged_task` 是为异步编程而设计的类型，它将一个可调用对象封装为异步任务，并通过 `std::future` 提供异步结果访问机制。可以将 `std::function` 理解为加了 `std::future` 支持的函数包装器
- `std::future<R> get_future()` **本身不会阻塞任务执行**，它只是获取一个用于获取结果的 `future` 对象。如果调用 `get` 就会阻塞当前线程直到任务完成
#### std::result_of 在 C++17 被弃用
设计缺陷

| 问题                   | 描述                                     |
| -------------------- | -------------------------------------- |
| **语法不自然**            | 必须写成 `F(Args...)` 的伪函数类型形式，而不是直接传参     |
| **无法支持重载函数**         | 如果函数是重载版本，无法正确推导（因为 `F(Args...)` 不够精确） |
| **不支持调用表达式**         | 无法从实际的调用表达式（如 `f(x, y)`）推导返回类型         |
| **与 `decltype` 不兼容** | 缺乏对 `decltype` 表达式风格的集成支持              |
`invoke_result_t` （**注意是 `_t` 类型**）可以写为：
```cpp
#include <type_traits>
using return_type = std::invoke_result_t<decltype(add), int, int>;  // add是表达式时使用
```
如果已经知道 add 是一个类型（比如模板中的 typename/class 参数类型）就不用使用 decltype 推到表达式类型（参考：[[C++ Runoob Tutoral#decltype 关键字]]）

| 对比项              | `std::result_of`                   | `std::invoke_result`               |
| ---------------- | ---------------------------------- | ---------------------------------- |
| 引入时间             | C++11                              | C++17                              |
| 是否弃用             | ✅ 是（C++17 起）                       | ❌ 否                                |
| 推导方式             | 伪函数类型 `F(Args...)`                 | 实际调用表达式 `F, Args...`               |
| 支持重载函数           | ❌ 不支持                              | ✅ 支持（需结合 `std::declval`）           |
| 与 `decltype` 兼容性 | ❌ 差                                | ✅ 更好                               |
| 语法示例             | `std::result_of<F(Args...)>::type` | `std::invoke_result_t<F, Args...>` |
#### std::bind 的悬空引用问题
std::bind 默认以**引用的形式**捕获参数并将其绑定在可调用对象上，这种*可调用对象和参数生命周期不一致*的问题会导致如果捕获参数在线程 A 中运行，而可调用对象的执行在 B 线程中，**且 A 在 B 之前被销毁**，会导致 B 中捕获到的**引用变量悬空**
```cpp
template <typename F>
void run_async(F&& f) {
    std::thread t(std::forward<F>(f));
    t.detach();
}

int main() {
    std::string s = "hello";
    auto f = std::bind([](const std::string& str) {
        std::cout << str << std::endl;
    }, s);

    run_async(f);
    // s 离开作用域，被销毁
}
```
解决方式：
- 值传递：将函数调用对象和参数都是用值传递传入到 lambda 中，让参数生命周期和可调用对象
- 完美转发&移动语义：为避免性能开销用移动语义或者 `std::move` 显式移动资源
```cpp
auto task = std::make_shared<std::packaged_task<return_type()>>([
    f = std::forward<F>(f),
    ...args = std::forward<Args>(args)
]() mutable {
    return std::invoke(f, std::move(args)...);
});
```
- 使用智能指针统一管理可调用对象和参数包参数，保证两者生命周期一致
- 使用 tuple 存储参数列表，这就需要配套使用 `std::apply` 而不能使用 `std::invoke`，参考 [[C++ Runoob Tutoral#std invoke 和 std apply 使用]]
```cpp
template <class F, class... Args>
inline auto ThreadPool::enqueue(F&& f, Args&&... args)
    -> std::future<std::invoke_result_t<F, Args...>> {

    using return_type = std::invoke_result_t<F, Args...>;

    // 将函数和参数打包进 shared_ptr 中
    struct TaskData {
        F func;
        std::tuple<Args...> args;

        TaskData(F&& f_, Args&&... args_)
            : func(std::forward<F>(f_)), args(std::forward<Args>(args_)...) {}

        return_type operator()() {
            return std::apply(func, std::move(args));
        }
    };

    auto task_data = std::make_shared<TaskData>(std::forward<F>(f), std::forward<Args>(args)...);
    auto task = std::make_shared<std::packaged_task<return_type()>>([task_data]() {
        return (*task_data)();
    });

    std::future<return_type> res = task->get_future();

    {
        std::unique_lock<std::mutex> lock(mutex_queue_);
        if (stop_) {
            throw std::runtime_error("enqueue on stopped ThreadPool");
        }
        tasks_.emplace([task]() { (*task)(); });
    }

    cv_.notify_one();
    return res;
}
```

> [!warning]
> 不能使用 `=` 来捕获所有变量，他不能处理模板参数包

# MySQL 连接池
参考：[基于C++11的数据库连接池【C++/数据库/多线程/MySQL】哔哩哔哩bilibili](https://www.bilibili.com/video/BV1Fr4y1s7w4/?spm_id_from=333.1007.top_right_bar_window_history.content.click&vd_source=876be08bc9c030f4a9ea1fb97e0d0342)
资源：https://pan.baidu.com/s/1KJqmmbMVg32qyWjPlRZSeg&pwd=subw
备注：没看视频，只通过看代码，转化为使用 boost.mysql 实现
## 1. 连接池的本质
MySQL 连接池本质上是一种**资源管理模式**，其核心思想是：
- 预创建连接：预先创建一定数量的数据库连接并维护
- **复用连接（关键）**：客户端获取连接使用后归还到池中，而非销毁
- 统一管理：集中管理连接的生命周期、状态和数量
## 2. 连接池的工作机制
### 2.1 基本流程
```
连接池初始化 → 预创建连接 → 客户端获取连接 → 使用连接 → 归还连接（关键） → 循环复用
```
### 2.2 详细工作流程
1. 初始化阶段：根据各种参数配置连接池和数据库连接参数
2. 获取连接：客户端请求时从池中取出连接
3. **归还连接**：客户端完成操作后自动归还连接（关键）
4. 动态调节：**后台线程**根据负载动态调整连接数量
### 2.3 设计细节
- 连接池不应该返回连接空指针，因为这会让使用者在获取连接时多一个验证连接是否有效的操作。所以如果 `get_connection` 超时/某些原因无法获取连接应该直接抛出异常，而不应该返回空指针
- 如果返回智能指针对象的函数返回 nullptr 可能会引起某些编译器警告 or 报错， `std::shared_ptr` 有特殊的 `nullptr` 构造函数，但不能隐式转换，应该返回默认构造的 `shared_ptr` 或使用 `std::shared_ptr<T>(nullptr)`
## 3. 代码中的关键设计

### 3.1 智能指针设计
```cpp
// 池中使用 unique_ptr 独占管理空闲连接
std::queue<std::unique_ptr<mysql::any_connection>> connection_queue_;

// 返回给客户端使用 shared_ptr，支持自动回收
std::shared_ptr<mysql::any_connection> get_connection();
```
- `unique_ptr`：池中连接的独占管理，每一个数据库都有独立的资源，被单独管理。连接池中的连接要么在池中等待被使用，要么正在被某个客户端使用，所有权唯一，被一个指针指向，不能被通过这个指针以外的方式访问[^1]
- 由于当客户端获取连接时，连接池和客户端都参与了对该连接生命周期的管理：
	- 客户（**可能不止一个**）需要使用这个连接进行数据库操作
	- 服务端需要监控这个数据库连接是否超时/是否空闲/是否能够被回收
	- 同时被多方使用，当没有人使用这个连接时，即*shared_ptr 内部引用计数为 0*，则表明这个连接暂时没有人使用，需要被[[#3.2 RAII 与自动归还连接|归还到连接池中]]。***引用计数&&不需要解决[[Modern C++#5.4 `std weak_ptr`|循环引用问题]]，只能通过 `std::shard_ptr` 做到***
### 3.2 RAII 与自动归还连接
[[#3.1 智能指针设计]]中提到的归还连接需要通过**自定义 `shared_ptr` 的删除器**实现
```cpp
std::shared_ptr<mysql::any_connection> MysqlConnectionPool::get_connection() {
	std::unique_lock<std::mutex> lock(mutex_);
	while(connection_queue_.empty()) {
		// 等待新链接被创建
	}
	auto conn_ptr = std::move(connection_queue_.front());
	connection_queue_.pop();
	std::shared_ptr<mysql::any_connection> ptr(conn_ptr.release(), [this](mysql::any_connection* conn) {
		std::lock_guard<std::mutex> locker(mutex_);
		auto						unique_conn = std::unique_ptr<mysql::any_connection>(conn);
		connection_queue_.push(std::move(unique_conn));
		connected_time_point_.push(std::chrono::steady_clock::now());
		cv_connections_available_.notify_one();  // notify those threads waiting in `get_connection()`
	});
	if(connection_queue_.size() < pool_config_.min_size_) {
		cv_pool_needs_filling_.notify_one();
	}
	return ptr;
}
```
- `std::unique_ptr` 是一个**所有权唯一的指针对象**，但是不代表移动构造函数不能使用。移动构造的过程是**所有权转接的过程**（参考[[C++ Runoob Tutoral#移动构造函数|移动构造]]）
- 从队列中 `pop()` 会销毁队列前端的指针对象，调用其析构函数，安全销毁，所以不需要像 C 指针一样先释放资源然后删除指针（`ptr.reset(); queue.pop()`）
- 交接所有权使用的是 `shared_ptr` 构造函数而不是 `make_shared`，因为我们不需要释放指针所拥有的资源（连接资源），只是将他们拿出去使用。`make_shared` 会开辟一块新的内存然后将指针指向这个位置
- 删除器如何执行归还连接
	- 当 `shared_ptr` 超出作用域时自动执行删除器
	- **所有用户都使用连接执行完 sql 语句暂时没有使用这个连接时**，`shared_ptr` 引用计数为 0，**调用删除器自动归还连接**，防止连接泄漏
	- 归还链接的方法是当所有人的 `get_connection()` 获得的连接使用完毕后，将这个连接压入 connection_queue，并更新这个连接的生存时长（防止一个经常被获取使用的连接在归还后立刻被清理）
	- 异常安全，即使出现异常也能正确归还
- 设计 `shared_ptr` 的删除器需要注意，shared_ptr 的一个支持删除器构造函数签名为：
```cpp
template< class Y, class Deleter >
shared_ptr( Y* ptr, Deleter d );
```
- **第一个参数是裸指针类型**，可以通过智能指针的 `release()` 或者 `get()` 获取
	- `get()` 不释放所有权，仅仅返回指针，如果源指针对象是 `unique_ptr` 使用其他智能指针封装这个指针（或者[[Modern C++#Note 智能指针的局限性|其他危险操作]]）
- 第二个参数删除器是一个**指向函数对象的指针**，用于代替 shared_ptr 内部自动删除指针的操作（默认使用 delete 删除指针），删除器会和指针对象一起存储确保正确释放。
- 我们转交 conn_ptr 连接池中的最老的一个连接的所有权，但是我们这里不需要释放指针资源，删除指针，**所以将他的存活时间更新**，在不使用时放回连接池
```cpp
// 客户端代码
auto conn = pool->get_connection();  // 返回 shared_ptr，连接从池中移出

// 客户端可以在多个地方使用这个连接
some_function(conn);  // conn 被复制，引用计数增加
another_function(conn);  // conn 再次被使用

// 当所有对连接的引用都超出作用域时
// shared_ptr 的引用计数变为0
// 自定义删除器被调用，连接被放回池中
```
### 3.3 多线程同步机制
```cpp
// 使用条件变量实现线程间通信
std::condition_variable cv_connections_available_;  // 连接可用通知
std::condition_variable cv_pool_needs_filling_;     // 池需要填充通知
```
**同步策略**：
- 生产者线程：监控池中连接数量，不足时创建新连接，在 `get_connection()`，`recycle_connection()` **这些消耗连接的工作中**都添加检测连接池数量的逻辑，不足时通过 `cv_pool_needs_filling.notify_one()` 通知生产者补充
- 消费者线程（是 get_connection 主线程和 recycle_connection 回收线程）：等待可用连接，超时处理。同理在**所有产生连接的工作线程中**使用 `cv_connection_available` 通知有新的连接加入可以被获取或者总数超限需回收
如果不区分条件变量只有一个，那么如果 get_connection 获取连接时，池中少了一个 idle 连接，可能会低于 min_size_需要补充，但条件变量不能指定唤醒某一个线程。
`cv_.notify_one()` 的通知由内核算法调度，可能被回收线程/生产者线程获得，如果唤醒回收者，但没有达到最低连接数回收者继续因为 `cv_.wait` 等待，而生产者仍然是挂起状态，这次唤醒**相当于什么事都没有做**。所以需要使用不同条件变量承担不同的职责，专一控制不同功能的线程的挂起和唤醒
所有挂起线程的代码添加谓词是为了防止 [[C++ Runoob Tutoral#虚假唤醒]]
### 3.4 单例模式管理
```cpp

MysqlConnectionPool*
MysqlConnectionPool::init_pool(asio::io_context& ctx, const db_config& db_cfg, const pool_config& pool_cfg) {
	if(instance_ == nullptr) {
		instance_ = new MysqlConnectionPool(ctx, db_cfg, pool_cfg);
	}
	return instance_;
}

MysqlConnectionPool* MysqlConnectionPool::get_instance() {
	return instance_;
}

MysqlConnectionPool::MysqlConnectionPool(asio::io_context& ctx, const db_config& db_cfg, const pool_config& pool_cfg)
	: ctx_(ctx)
	, db_config_(db_cfg)
	, pool_config_(pool_cfg)
	, shutdown_(false) {
	for(int i = 0; i < pool_config_.min_size_; i++) {
		add_connection();
	}
	producer_ = std::thread(&MysqlConnectionPool::produce_connection, this);
	recycler_ = std::thread(&MysqlConnectionPool::recycle_connection, this);
}
```
构造函数中直接存储所有配置，第一次调用 `init` 时需要传入 `asio::io_context`，各种配置获取实例以外，其他时候只需要调用 `get_instance` 不需要传入任何参数。
- 全局唯一实例，避免重复创建
- 统一管理所有连接资源
- 线程安全的访问控制

### 3.5 优雅退出
程序关闭时，后台有其他线程在运行，突然中断可能导致数据丢失或程序崩溃，使用一个[[C++ Runoob Tutoral#原子操作|原子变量]] shutdown_控制程序是否关闭。
```cpp
~MysqlConnectionPool() {
    shutdown_.store(true);     // 设置关闭标志
    cv_.notify_all();          // 唤醒所有等待的线程
    if (producer_thread_.joinable()) {
        producer_thread_.join();  // 等待线程结束
    }
    if (recycle_thread_.joinable()) {
        recycle_thread_.join();  // 等待线程结束
    }
}
```
这时候线程不能被设计为 detach 运行，否则无法再次访问，控制其行为。而是作为成员变量，在需要关闭程序时等待所有线程结束

---
[^1]: 原则上 `std::unique_ptr` 对象指向的资源不应该被其他指针指向，但是 C++没有限制这点。如果使用 `get()/release()` 获取裸指针还是能够将指针资源地址赋予其他指针/智能指针。但这样会导致重复释放资源地址等未定义行为
# kama 内存池
## 杂项
### pthread 库链接问题
linux 环境中如果使用了 `std::thread`，就需要链接 pthread 库
```cmake
arget_compile_options(${PROJECT_NAME} PRIVATE -g -pthread) # -g显示调试信息
target_link_libraries(${PROJECT_NAME} pthread)
```
windows，尤其是 msvc 中，已经内置了 POSIX 线程标准，不需要链接
## 基本内存池结构 v1
### 高效释放内存
#### 基本 delete 操作
对一个指针对象使用 delete 后会进行：
1. **调用析构函数** - 执行对象的析构函数代码
2. **释放内存** - 将对象占用的内存归还给系统，调用 `operator delete()` 函数
3. **执行清理工作** - 处理对象内部资源的释放
删除后的指针为悬空指针，最好立即使用 `ptr = nullptr`
```cpp
int* p = new int(10);
delete p;
// 此时p成为"悬空指针"(dangling pointer)
// 指向已被释放的内存地址
// 值仍然保持原来的地址值，但该地址已无效
```
#### 调用 delete 函数
```cpp
operator delete(ptr);
```
提供更高的自由度，如果直接调用**只会释放指针的内存块内存，不会调用析构函数**,但可以在括号中对指针进行操作，调用分配器来释放内存。**对应 `new` 分配的内存**，同理，调用后指针悬空
```cpp
class Test {
  public:
	~Test() {
		std::cout << "Test destructor called!" << std::endl;
	}
};

int main() {
	Test* p1 = new Test;
	delete p1;	// 会输出："Test destructor called!"

	Test* p2 = new Test;
	::operator delete(p2);	// 不会输出任何内容
	return 0;
}
// 常用的操作有：
operator delete(reinterpret_cast<void*>(ptr)); // 1
```
1. 提前将指针所指向的内存转化为 `void*` 类型，这是因为*历史遗留和编译器优化问题*[^2]，调用全局内存释放函数

推荐使用 `operator delete()` 的情况：
```cpp
// 情况1：POD类型（Plain Old Data）
struct Point { int x, y; };  // 没有构造函数/析构函数

// 情况2：内存管理元数据
struct MemoryHeader {
    size_t size;
    void* next;
};

// 情况3：纯数据传输结构
struct NetworkPacket {
    char buffer[1024];
    uint32_t length;
};
```

不推荐使用 `operator delete()` 的情况：
```cpp
// 情况1：有资源需要清理，有析构函数
class FileHandler {
    FILE* file_;
public:
    ~FileHandler() { fclose(file_); }  // 需要释放文件句柄
    // 必须用 delete 调用析构函数
};

// 情况2：有虚析构函数
class Base {
public:
    virtual ~Base() {}  // 虚析构函数
};

// 情况3：包含非POD成员
class Container {
    std::vector<int> data;  // vector有自己的析构函数
public:
    ~Container() = default;  // 看似"什么都不做"，但data需要清理
};
```
简单来说如果类满足以下所有条件，可以使用 `operator delete`
1. 析构函数是平凡的（trivial）
2. 所有成员都是POD类型
3. 没有虚函数
4. 没有需要手动释放的资源
可以通过下面代码判断
```cpp
static_assert(std::is_trivially_destructible<Slot>::value,
              "Can use operator delete safely");
```

[^2]: C++允许重载 `operator delete()` 这就导致了调用这个函数时会先在类中查找这个函数的实现，如果没有找到再调用全局operator delete，而全局类型的重载jin 转换为 `void*` 的版本。
	跳过在类中查找，按照全局模式释放内存，防止使用错误版本，现代 C++推荐使用 `::operator delete(cur)` 显式指定

#### free 函数
C 标准库函数，用于将 `malloc` / `calloc` / `realloc` 分配的内存归还，是 C 风格的函数，所以不知道有 C++对象模型，不会调用析构函数
#### 对比

| 特性        | `delete`                 | `operator delete`   | `free()` |
| --------- | ------------------------ | ------------------- | -------- |
| **语言**    | C++ 关键字                  | C++ 全局函数            | C 标准库函数  |
| **析构函数**  | 会调用                      | 不会调用                | 不会调用     |
| **类型安全**  | 类型安全                     | 类型不安全               | 类型不安全    |
| **底层调用**  | 调用 `operator delete`     | 通常调用 `free()`       | 调用系统分配器  |
| **重载支持**  | 支持（通过 `operator delete`） | 支持多个版本              | 不支持      |
| **数组版本**  | `delete[]`               | `operator delete[]` | 不支持      |
| **空指针处理** | 安全（C++14+）               | 通常安全                | 安全       |
| **内存来源**  | `new` / `new[]`          | `operator new`      | `malloc` |

### 原子操作中的内存序
#### 基本知识
现代计算机不是简单的顺序执行模型，在多线程任务中的执行顺序非常复杂，即使统一线程中按顺序编写的代码操作也有可能会因为：
- **编译器优化重排**：编译器为了优化可能调整指令顺序
- **CPU 乱序执行**：CPU 为了性能可能乱序执行指令
- **缓存一致性延迟**：多核 CPU 的缓存更新可能有延迟
**和代码不相同的顺序执行**。内存序常用定义有：
1. `std::memory_order_relaxed`
	- __最弱约束__：只保证原子性，不保证内存顺序
	- __无同步__：不影响其他线程的内存访问顺序
	- __适用场景__：只需要原子操作，不要求顺序一致性
2. `std::memory_order_acquire`
	- __获取语义__：防止当前操作后的内存访问被重排序到此操作之前
	- __同步作用__：与 release 操作形成同步点，保证后的所有读操作在获取点后开始
	- __适用场景__：读取共享数据，确保读取的数据是最新的
3. `std::memory_order_release`
	- __释放语义__：防止当前操作之前的内存访问被重排序到此操作后
	- __同步作用__：与 acquire 操作形成同步点，保证之前的所有写操作在释放点之前完成
	- __适用场景__：写入共享数据，确保修改对其他线程可见
4. `std::memory_order_acq_rel`
	- __双向语义__：同时具有 acquire 和 release 语义，有最强的顺序保证，保证所有线程看到相同的操作顺序
	- __适用场景__：原子读-改-写操作
性能上
```md
最快 → 最慢
relaxed → acquire/release → seq_cst
```
内存序的作用为主要为：
1. **控制指令重排序**：防止编译器/CPU过度优化破坏多线程正确性
2. **保证内存可见性**：确保一个线程的写操作对其他线程可见
3. **建立 happens-before 关系**：确定操作之间的先后顺序
#### 项目代码实现
v1 的 MemoryPool 实现中，有很多尝试更新原子类型的地方，使用：
```cpp
// pushFreeList函数
if(freeList_.compare_exchange_weak(oldHead, slot,
                                  std::memory_order_release,    // 成功时
                                  std::memory_order_relaxed)) { // 失败时
    return true;
}
// - __成功时用release__：确保在更新freeList_之前，slot->next的赋值操作已完成
// - __失败时用relaxed__：失败时不需要同步保证
// popFreeList函数：
if(freeList_.compare_exchange_weak(oldHead, newHead,
                                  std::memory_order_acquire,    // 成功时
                                  std::memory_order_relaxed)) { // 失败时
    return oldHead;
}
// - __成功时用acquire__：确保能正确读取到其他线程通过release操作写入的数据
// - __失败时用relaxed__：失败时不需要同步保证
```
比较替换有严格和宽松检查模式，weak 可能会虚假失败，但是性能更好。这里弹出和入队都在 while 中进行，失败了会自动重试所以 weak 即可。
> [!note]
> 文档中对从 compare_exchange_weak/strong 解释为：
>
> 原子地比较 `*this` 和 expected 的对象表示(C++20 前)值表示(C++20 起)。如果它们逐位相等，那么以 desired 替换前者（进行读修改写操作）。否则，将 `*this` 中的实际值加载进 expected（进行加载操作）。
### 内存池设计
#### 内存分配
```md
[newBlock内存块]
├── 前8字节(64位系统) ──→ 存储Slot结构(包含next指针)
├── body开始位置      ──→ 实际可用于分配槽的空间
└── ...               ──→ 可用空间的剩余部分

内存块布局：
每个槽只能存放一个对象，即使他没有占满整个槽
[0-7字节]    : Slot.next (指向下一个块)
[8-31字节]   : 第一个可用槽 (32字节对齐)
[32-63字节]  : 第二个可用槽 (32字节对齐)
[64-95字节]  : 第三个可用槽 (32字节对齐)
...
[4088-4095]  : 最后一个可用槽

**内存槽大小并一致等于是SlotSize_，但是每个块中第一个槽的起始位置会随着块大小&指针类型的大小而改变**，
```
- __头部信息__：每个内存块的开头存储一个 `Slot` 结构，用于维护块链表
- __数据区域__：剩余空间用于实际的内存槽分配，快的大小
- __链表维护__：通过头部的 `next` 指针将所有分配的大块内存链接起来
```cpp
void MemoryPool::allocateNewBlock() {
	void* newBlock							= operator new(BlockSize_);
	reinterpret_cast<Slot*>(newBlock)->next = firstBlock_;
	firstBlock_								= reinterpret_cast<Slot*>(newBlock);

	char*  body								= reinterpret_cast<char*>(newBlock) + sizeof(Slot*);
	size_t paddingSize						= padPointer(body, SlotSize_);	// 计算对齐需要填充内存的大小
	curSlot_								= reinterpret_cast<Slot*>(body + paddingSize);

	// 超过该标记位置，则说明该内存块已无内存槽可用，需向系统申请新的内存块
	lastSlot_ = reinterpret_cast<Slot*>(reinterpret_cast<size_t>(newBlock) + BlockSize_ - SlotSize_ + 1);
}

void* MemoryPool::allocate() {
	// 优先使用空闲链表中的内存槽
	Slot* slot = popFreeList();
	if(slot != nullptr)
		return slot;

	Slot* temp;
	{
		std::lock_guard<std::mutex> lock(mutexForBlock_);
		if(curSlot_ >= lastSlot_) {
			// 当前内存块已无内存槽可用，开辟一块新的内存
			allocateNewBlock();
		}

		temp = curSlot_;
		// 这里不能直接 curSlot_ += SlotSize_ 因为curSlot_是Slot*类型
		curSlot_ += SlotSize_ / sizeof(Slot);
	}

	return temp;
}
```
分配内存时的*头插法*
```md
初始状态：[Block1] → [Block2] → [Block3] → null
         ↑
    firstBlock_

执行①：[newBlock] → [Block1] → [Block2] → [Block3] → null
        (next指向旧链表)

执行②：[Block1] → [Block2] → [Block3] → null
         ↑
    [newBlock]
         ↑
    firstBlock_

最终：[newBlock] → [Block1] → [Block2] → [Block3] → null
         ↑
    firstBlock_

```
- body 是所有槽能用的空间的开始，之所以使用 `char*` 是因为 char 是 1 字节的，比较方便统计大小而已
- 分配完成后当前槽已经被一个对象占用（无论是否占满）跳转到下一个槽
#### 多级内存池
MemoryPool 设计内存池，HashBucket 管理内存池，提供入口
```md
HashBucket (管理器)
├── MemoryPool[0] -> 管理 8 字节对象
├── MemoryPool[1] -> 管理 16 字节对象
├── MemoryPool[2] -> 管理 24 字节对象
├── MemoryPool[3] -> 管理 32 字节对象
├── ...
└── MemoryPool[63] -> 管理 512 字节对象

用户请求分配30字节
↓
HashBucket::useMemory(30)
↓
计算索引：((30+7)/8)-1 = 3
↓
获取MemoryPool[3] (管理32字节槽)
↓
MemoryPool[3].allocate() 返回32字节槽
```
- 哈希桶创建时初始化不同大小的内存池，不同大小的对象会被放到对应的内存池，8 字节对象不会占用 16 字节池的空间，并由于内存池设计为每个槽只能存放一个对象，即使他没有占满整个槽，这样充分利用了空间（内存对齐尽量小的单位）
- 超过 512 字节的对象
	- **分配频率低**，内存池优势不明显
	- __内存浪费__：为大对象预分配大块内存会造成浪费
	- __管理复杂度__：大对象管理更复杂，容易产生外部碎片
	- __收益递减__：小对象分配占多数，优化小对象收益更大
### 整体设计
```md
┌─────────────────────────────────────────────────────────────┐
│                    HashBucket (管理层)                       │
├─────────────────────────────────────────────────────────────┤
│  大小分类 → 索引映射 → 内存池选择                               │
│  [1-8]→[0] [9-16]→[1] [17-24]→[2] ... [505-512]→[63]        │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
    ┌─────────────┬─────────────┬─────────────┬─────────────
    │MemPool[0]   │MemPool[1]   │MemPool[2]   │...          │
    │(8字节槽)     │(16字节槽)    │(24字节槽)    │             │
    │[块1][块2]    │[块1][块2]   │[块1][块2]    │             │
    └─────────────┴─────────────┴─────────────┴────────────

请求分配size字节
↓
HashBucket根据size选择对应MemoryPool
↓
MemoryPool::allocate()
├── 优先从freeList_取 (已释放的槽)
└── 若freeList_空，从curSlot_分配
    ├── 若当前块不足，调用allocateNewBlock()
    └── 返回curSlot_并移动指针

释放内存流程
释放ptr指针
↓
HashBucket确定对应MemoryPool
↓
MemoryPool::deallocate(ptr)
↓
pushFreeList(ptr) → 加入freeList_链表头部

```
