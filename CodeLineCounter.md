# 写项目的发现
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
就会自动处理错误，并且必须包含 `(app).exit(e)`，打印错误信息的代码被封装在 exit 函数中，不使用会导致程序只抛出异常，而没有信息提示，CallForHelp 异常在 CLI 11 库中被设计为抛出异常之后打印 help 手册，而这个手册通过
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
