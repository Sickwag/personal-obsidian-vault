项目地址：(https://github.com/CLIUtils/CLI11/1.2-quick-start-guide)
参考教程： [Quick Start Guide | CLIUtils/CLI11 | DeepWiki](https://deepwiki.com/CLIUtils/CLI11/1.2-quick-start-guide)
# Overview
总体架构图
![[Pasted image 20250717204518.png]]
类型系统和转换
![[Pasted image 20250717204624.png]]
验证器和转换系统
![[Pasted image 20250717204645.png]]
Subcommands 子命令
![[Pasted image 20250717204714.png]]
从配置文件中读取参数
![[Pasted image 20250717204748.png]]
# 快速入门
`CLI::App` 类是 CLI11 的中心组件。它管理所有选项并处理解析。
## Add options & flags
添加选项需要通过 `add_option` 函数
```cpp
std::string filename;
app.add_option("-f,--file", filename, "The input file");
```
CLI11 支持多种内置类型：

| Type  类型            | Example  示例                                             |
| ------------------- | ------------------------------------------------------- |
| Integral types  整型  | `int`, `long`, `size_t`                                 |
| Floating point  浮点数 | `float`, `double`                                       |
| Boolean  布尔型        | `bool`                                                  |
| String  字符串         | `std::string`                                           |
| Containers  容器      | `std::vector<T>`, `std::set<T>`                         |
| Tuples/Pairs  元组/对  | `std::tuple<T...>`, `std::pair<T,U>`                    |
| Enums  枚举           | Any enumeration type  任何枚举类型                            |
| User-defined  用户定义  | Any type with conversion from string  <br>任何可以从字符串转换的类型 |

## Parsing Arguments
once you've set up option and flags, parse command line argments use `app.parse(argc, argv)`, or use marco `CLI11_PARSE(app, argc, argv)`, it equals to:
```cpp
try {
    app.parse(argc, argv);
} catch (const CLI::ParseError &e) {
    return app.exit(e);
}
```
after handling these args, all value will store to the variants, if you wanna check whether you have implement particular arg, you can use:
```cpp
if(app.count("--file")) {
    std::cout << "File option was used" << std::endl;
}
```
and also get value by programmatically:
```cpp
// Get a value directly
auto value = app["--value"]->as<double>();
// Access all results as strings
auto results = app["--input"]->results();
```
## Validator
```cpp
app.add_option("--custom", value)
   ->check([](const std::string &str) {
       if(/* your check condition */)
           return std::string(); // Empty string means success
       return "Validation failed: " + str;
   });
```
the return value is a string indicates validate fail.
## 位置参数
`--` 是一个分隔符，表示后面的所有参数都是位置参数，位置参数按照定义顺序被解析
1. 首先处理必需的位置参数
2. 然后处理其他位置参数
3. 支持验证功能来确保参数匹配正确的选项
要创建位置参数，只需在选项名称中包含一个不以破折号开头的名称：
```cpp
std::string filename;
app.add_option("filename", filename, "Input file");

// 或者同时支持位置参数和选项形式
app.add_option("-f,--file,filename", filename, "Input file");
```
当启用 `prefix_command` 模式后，CLI11会在遇到第一个无法识别的参数时立即停止解析，并将所有剩余的参数都存储到 `remaining` 数组中。
```cpp
TEST_CASE_METHOD(TApp, "PrefixSubcom", "[subcom]") {
    auto *subc = app.add_subcommand("subc");
    subc->prefix_command();

    app.add_flag("--simple");
    args = {"--simple", "subc", /*从这里开始解析失败*/ "other", "--simple", "--mine"};
    run();

    CHECK(0u == app.remaining_size());
    CHECK(3u == app.remaining_size(true));
    CHECK(std::vector<std::string>({"other", "--simple", "--mine"}) == subc->remaining());
}
```
也可以应用于位置参数：
```cpp
// Allow extras to be captured
app.allow_extras();
sub->allow_extras();

// Process the args
args = {"one", "two", "sub", "three", "four"};
run();

// Check what was captured
CHECK(std::vector<std::string>({"one", "two"}) == app.remaining());
CHECK(std::vector<std::string>({"three", "four"}) == sub->remaining());
```
## Subcommand
### 子命令用法
子命令实际上也是一个CLI11风格的app，只是运行在主要app下，它通常通过输入不用-作为前缀的参数来调起，比如如果我在代码中添加
```cpp
auto* process_cmd = app.add_subcommand("process", "Process files");
process_cmd->add_option("-i,--input", input_files, "Input files")->required()->check(CLI::ExistingFile);
```
那么调用的方法为：
```bash
MyProgram add/*这里开始调用子命令*/ -a -s /*子命令的参数*/
```
并且这些参数命令的执行是按顺序的，执行子命令的同时不能执行主命令，不允许
```bash
MyProgram -i /*其他主命令的参数*/ add/*这里开始调用子命令*/ -a -s /*子命令的参数*/
```
用法一般为：
1. 先创建主命令
2. 主命令中创建子命令
3. 为子命令设置参数
4. 设置主命令最少需要执行的子命令个数
5. 设置执行不同子命令时执行的逻辑
```cpp
auto *sub = app.add_subcommand("sub", "Subcommand description");

// Require a subcommand
app.require_subcommand(1);  // At least one subcommand required

// Check if a subcommand was used
if (app.got_subcommand("sub")) {
    // Handle subcommand
}
```
### 子命令配置和获取
子命令名称是大小写敏感和下划线敏感的
```cpp
sub->ignore_case();        // Make this subcommand case-insensitive
app.ignore_case();         // Make all subcommands case-insensitive
sub->ignore_underscore();  // Make this subcommand ignore underscores
app.ignore_underscore();   // Make all subcommands ignore underscores
```
子命令之间可以也可以通过 api 调整[[#Option Relationships and Dependencies 选项关系与依赖|依赖关系]]
获取子命令并用 vector 存储：可以通过 predict 过滤
```cpp
std::vector<App*> subcommands = app.get_subcommands();
// or
auto utils = app.get_subcommands([](const App* sub) {
    return sub->get_group() == "Utilities";
});
```
![[Pasted image 20250718095637.png]]
### 子命令函数回调
为子命令设置回调，以便在调用时执行代码，默认情况下，回调函数在所有解析完成后运行。可以通过 `immediate_callback()` 更改。
```cpp
sub->callback([&]() {
    // This code runs immediately after sub is parsed
})->immediate_callback();
```
### 特殊子命令
#### 无名称子命令
创建无名称子命令有两种方式：
1. 使用空字符串作为名称：
```cpp
auto *sub = app.add_subcommand("", "empty name");
```
2. 不提供参数：
```cpp
auto *sub = app.add_subcommand();
```
无名称子命令的选项可以直接从主应用程序访问，用起来像是主命令参数
```cpp
auto *sub = app.add_subcommand("", "empty name");
auto *opt = sub->add_option("-v,--value", val);
args = {"-v", "4.56"};
run();
// run as :./app -v 4.56 # 直接使用无名称子命令中选项
```

# Core APIs
App 类提供了许多用于自定义行为的方法。大多数方法返回 `this` 以允许方法链式调用
## Configuration Method
![[Pasted image 20250717214758.png|275]]

| Method  方法                     | Description  描述                                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `allow_extras()`               | Removes error for extra arguments  <br>移除额外参数的错误（多填的不存在的参数忽略而不报错）                                         |
| `prefix_command()`             | Treats unrecognized options as positionals  <br>将未识别的选项视为位置参数，在遇到第一个无法识别的选项时停止解析，所有后续参数都放入remaining_args列表 |
| `ignore_case()`                | Makes option matching case-insensitive  <br>使选项匹配不区分大小写                                                    |
| `fallthrough()`                | Allows options to be passed to parent command  <br>允许将选项传递给父命令                                             |
| `require_subcommand(min, max)` | Sets subcommand requirements  <br>设置子命令要求                                                                  |
| `positionals_at_end()`         | Forces positional arguments to end  <br>强制位置参数结束                                                           |
| `option_defaults()`            | 设置子命令的默认属性，使用后集成主命令的所有参数                                                                                  |


| 函数                              | 作用          | 继承性 |
| ------------------------------- | ----------- | --- |
| `allow_extras()`                | 允许额外未匹配参数   | 是   |
| `prefix_command()`              | 前缀命令模式      | 是   |
| `ignore_case()`                 | 忽略大小写       | 是   |
| `ignore_underscore()`           | 忽略下划线       | 是   |
| `fallthrough()`                 | 选项穿透到父命令    | 是   |
| `require_subcommand()`          | 要求子命令数量     | 否   |
| `option_defaults()`             | 设置选项默认属性    | 是   |
| `formatter()`                   | 自定义帮助格式     | 是   |
| `positionals_at_end()`          | 位置参数在末尾     | 否   |
| `allow_windows_style_options()` | Windows风格选项 | 是   |
| `callback()`                    | 解析完成回调      | 否   |
| `final_callback()`              | 最终回调        | 否   |
| `parse_complete_callback()`     | 解析完成立即回调    | 否   |
| `preparse_callback()`           | 解析前回调       | 否   |
| `immediate_callback()`          | 控制回调时机      | 是   |
```cpp
CLI::App app{"My Application"};

// 基本配置
app.allow_extras(true);                    // 允许额外参数
app.prefix_command(true);                  // 前缀命令模式
app.ignore_case(true);                     // 忽略大小写
app.ignore_underscore(true);               // 忽略下划线
app.fallthrough(true);                     // 允许选项穿透
app.positionals_at_end(true);              // 位置参数在末尾
app.allow_windows_style_options(true);     // 允许Windows风格

// 子命令要求
app.require_subcommand(1, 2);              // 要求1-2个子命令

// 选项默认设置
app.option_defaults()->required(true);     // 所有选项默认必需
app.option_defaults()->ignore_case(true);  // 所有选项忽略大小写

// 自定义格式化器
auto formatter = std::make_shared<CLI::Formatter>();
formatter->column_width(40);
app.formatter(formatter);
```
## Usage Pattern 使用模式
```cpp
CLI::App app{"My App"};
app.add_option("-f,--file", filename, "Input file")
   ->required()
   ->check(CLI::ExistingFile);

app.add_flag("-v,--verbose", verbose, "Verbose output")
   ->default_val(false);

try {
    app.parse(argc, argv);
} catch(const CLI::ParseError &e) {
    return app.exit(e);
}
```
# Options 选项类
## 选项参数配置
可以通过多种方式设置选项：
- **Short names**: Single-character names prefixed with a single dash (e.g., `-v`, `-h`)
    短名称：以单个短横线前缀的单字符名称（例如， `-v` ， `-h` ）
- **Long names**: Multi-character names prefixed with double dashes (e.g., `--verbose`, `--help`)
    长名称：以双短横线前缀的多字符名称（例如， `--verbose` ， `--help` ）
- **Positional names**: Names without dashes used for positional arguments
    位置名称：用于位置参数的名称，不带短横线
Multi-Option Policies  多选项策略
For options that can be specified multiple times, you can set the multi-option policy:
对于可以多次指定的选项，您可以设置多选项策略：

- TakeLast - 仅使用指定的最后一个值
- TakeFirst - 仅使用指定的第一个值
- TakeAll - 存储所有值（向量的默认行为）
- Join - 使用分隔符连接所有值
- Sum - 求和数值
- Reverse - 逆序取值
```cpp
app.add_option("-v,--value", values)
   ->multi_option_policy(CLI::MultiOptionPolicy::TakeAll);
```

## 兼容类型
- **Basic types**: integers, floating-point, boolean, strings, characters
    基本类型：整数、浮点数、布尔值、字符串、字符
- **Container types**: vectors, sets, lists, maps, etc.
    容器类型：向量、集合、列表、映射等。
- **Tuple-like types**: pairs, tuples, arrays
    元组类型：对、元组、数组
- **Complex types**: like `std::complex`  复杂类型：如 `std::complex`
- **Optional types**: `std::optional`, `boost::optional`
    可选类型： `std::optional` , `boost::optional`
- **User-defined types**: with appropriate conversion support
    用户自定义类型：具有适当的转换支持
## 内置验证器
### 用于 add_option
```cpp
app.add_option("--num", num)
   ->check(CLI::Range(0, 10) | CLI::Range(20, 30));
```
- `Range` - Check if value is within a range
- `PositiveNumber` - Check if value is positive
- `NonNegativeNumber` - Check if value is non-negative
- `ExistingFile` - Check if file exists
- `ExistingDirectory` - Check if directory exists
- `IsMember` - Check if value is in a set of allowed values
### 用于 get_option
- `count()` - Returns how many times the option was specified
- `empty()` - Checks if any values were provided
- `results()` - Returns the **raw string results**
- `as<T>()` - Returns the converted value of type T
```cpp
// or explicitly:
int value = app.get_option("--number")->as<int>();
```

## Option Relationships and Dependencies  选项关系与依赖
设置不同选项之间的依赖关系：
```cpp
auto optA = app.add_option("--optA", a_val);
auto optB = app.add_option("--optB", b_val);

optA->needs(optB);  // If optA is used, optB must also be used

/*
 *- `./program --optB value2 --optA value1` （两个选项都提供）
 *- `./program --optB value2` （只提供optB，不使用optA）
 *- `./program` （两个选项都不提供，会抛出 `CLI::RequiresError` 异常。）
 */

// or
optA->excludes(optB);  // optA and optB cannot both be used
/**
 * ./program --optA value1 --optB value2 （同时使用两个互斥选项， CLI::ExcludesError 异常）
 */
```
设置回调函数：
```cpp
app.add_option_function<int>("--callback",
    [](int value) {
        std::cout << "Callback with value: " << value << std::endl;
    },
    "An option with a callback"
);
```
当选项被解析或应用默认值时，回调将被执行。
还可以捕获默认值，读取环境变量
```cpp
int value = 42;
app.add_option("-n,--number", value, "A number")
   ->capture_default_str();  // Shows "42" in help message
   ->envname("PATH_VAR");
```
- `default_str(string)` - 直接设置默认字符串，设置选项在帮助信息中显示的默认值字符串，不进行任何验证或回调
- `default_val(value)` - 设置并验证默认值不仅设置默认字符串，还会验证该值并可能更新绑定的变量
- `get_default_str()` - 获取默认字符串这是一个简单的getter方法，返回当前存储的默认字符串
- `capture_default_str()` - 捕获当前值作为默认字符串调用 `default_function_` 来捕获当前绑定变量的值作为默认字符串

# 高级功能
## 自定义类型和模板特化
