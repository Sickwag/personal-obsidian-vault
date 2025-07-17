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