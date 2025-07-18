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
## Subcommand
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
# Core APIs
App 类提供了许多用于自定义行为的方法。大多数方法返回 `this` 以允许方法链式调用
## Configuration Method
![[Pasted image 20250717214758.png|275]]

| Method  方法                     | Description  描述                                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `allow_extras()`               | Removes error for extra arguments  <br>移除额外参数的错误（多填入的不存在的参数忽略而不报错）                                         |
| `prefix_command()`             | Treats unrecognized options as positionals  <br>将未识别的选项视为位置参数，在遇到第一个无法识别的选项时停止解析，所有后续参数都放入remaining_args列表 |
| `ignore_case()`                | Makes option matching case-insensitive  <br>使选项匹配不区分大小写                                                    |
| `fallthrough()`                | Allows options to be passed to parent command  <br>允许将选项传递给父命令                                             |
| `require_subcommand(min, max)` | Sets subcommand requirements  <br>设置子命令要求                                                                  |
| `positionals_at_end()`         | Forces positional arguments to end  <br>强制位置参数结束                                                           |
| `option_defaults()`            | 设置子命令的默认属性，使用之后集成主命令的所有参数                                                                                  |


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
