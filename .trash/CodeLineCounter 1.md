# 简单实现
1. 在一个类中，如果类中的函数方法体用 `const` 修饰，说明这个方法不会改变类的状态，所以返回值如果要返回类名&引用，则需要加上 const，变为 `const class_name& func()`
2. 如果写着写着发现 vscode 的提示抽风，明明没有错误的代码出现 `此声明没有存储类类型说明符` 这样的报错，并且：
	- 使用 `using` 自定义的类型 vscode 在输入时无提示
	- 其他标准库有提示和自动补全
	这是需要重置 intellisense 的提示来源
	![[Pasted image 20250718231419.png]]
	选择对应的编译器，或者 cmake 工程中的配置文件配置
3. 当一个类中有引用类型变量时，必须在类中初始化或者在构造函数初始化列表中初始化
4. 对于下面这段代码：
```cpp
std::string content((std::istreambuf_iterator<char>(f)), std::istreambuf_iterator<char>());
// and
std::string content(std::istreambuf_iterator<char>(f), std::istreambuf_iterator<char>());
```
   粗看两者相同，但是第一行会被解释为构造一个 string 对象，第二个会被解释为返回值为 string 的函数声明，这样会导致再使用
5. 如果通过头文件引入第三方库，为了防止 `F2` 重构名称或者其他批量操作时影响库文件，可以在 `settings.json` 中添加：
```json
"files.readonlyInclude": {
       "include/CLI11/CLI11.hpp": true
   }
```
   保护文件为只读
6. vscode 写代码时，如果想通过 cmake 传入参数，在 launch. json 中设置的 args 会被 settings. json 中的 `cmake.DebugConfig。args` 覆盖
# API 使用
## parse 引出的 CallForHelp 异常解析
### 现象
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
### 原理
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

# 改良实现
## 各种功能的实现
### 获取系统时间
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
### 自动转化 json 值类型
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
### 去除 utf-8 BOM 前缀
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
### 真正做到按照字符串分割另一个字符串
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
### glob 字符串转化为 regex 正则表达式
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
### 获取编译后可执行文件所在位置
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

## 设计技巧
### 位掩码设计开关
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
## 踩坑
### 避免 git 跟踪和提交无意义文件
```gitignore
**/build/ # 避免匹配构建编译目录
**/*.exe  # 编译文件
**/*.obj  # 对象文件
**/*.vcxproj  # vs工程文件，也是纯文本
**/out/build/
**/.vscode/
```
其中的匹配规则符合 glob 语法规则，对于已经被 git 跟踪的文件，再写就没有意义了
### 不要把密钥明文写入代码中
git 提交是不可删除的，除非将整个 git 存储目录重置（删除 .git 目录），如果所有修改的提交记录如下
```bash
-- no api key(meaningless)
-- fix bugs(first found key leaked out version)
-- fix bugs1
-- fix bugs2(first contains key)
-- cannot run version
```
因为提交 no api key 版本不会影响之前的提交记录，所以有以下几种方法解决
- 最好的方法就是更改密钥。
- 删除本地 ,git 目录，然后使用 `git init && git push --force` 将本地代码覆盖远程仓库，这回清空所有提交记录
- 使用专业工具解析 git 本地记录文件，删除记录中的所有密钥字符串然后提交，这样比较复杂，而且只能全字匹配密钥字符串。
### api 使用
#### boost. json 不支持格式化文件
boost. json 对象在使用 `file << boost::json::serialize(json_object)` 写入文件后是未格式化的版本。不能在代码层面中使用锁紧格式化，也不支持在文件中插入注释。
#### tabulate 库各种限制
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
#### 使用 `std::regex` 要保存原字符串数据
- `std::regex` 设计为轻量级的正则表达式引擎，它只存储编译后的有限状态机，不存储原始字符串节省内存和提高性能。
- `boost.regex` 同样不支持
### 事先计划非常重要
#### 1. 粗建框架
- 先规划后程序所有的模块
- 模块中应该有哪些功能
- 功能之间的联系
#### 2. 想象中程序的运行流程
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
#### 3. 细化框架
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
#### 4. 设置文件布局
- 是细节而不是主要逻辑实现的函数放在 uitls 中
- 常用的辅助类函数使用 inline 优化
- 精简每一个头文件，只暴露其他文件中必要的接口
#### 5. 实现每个模块的异常处理和测试
- 可能有错误一定要 try-catch 已知的错误，没有错误务必声明 `noexcept`
- 让每一个函数都返回想要的结果
#### 6. 实现过程中不要加需求
- 规划完成严格按照计划步骤实现，增删过程会导致不确定性和大量的重写
