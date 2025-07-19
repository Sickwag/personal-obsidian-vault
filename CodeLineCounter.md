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