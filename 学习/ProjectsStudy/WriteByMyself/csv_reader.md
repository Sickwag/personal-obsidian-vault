## 写项目时出现的问题
- 类中的 const 成员必须在类内（最好是构造函数中）通过初始化列表初始化
- `getline` 不接受 const 流（`fstream` 对象被 const 修饰）
- 文件编码保存问题可能会导致路径无法读取，比如文件路径通过字面量硬编码进代码中，**包含中文会导致无法读入**，这个问题在[[MySQL#8. 直接提交 sql 脚本|读写sql脚本]]时也出现过，可以参考保存方法。
  最新版 Visual studio 才会添加一个默认保存方式，旧版本需要使用 ***forceUTF 8***插件完成
- utf-8 有两种格式，


# fast-cpp-csv-parse 项目
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
### 3. `fread()`：从文件流读取数据

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
- 显示的错误信息如果和文件名（file_name），列名（column_name）这些外部由具体csv文件决定的内容时，对应的结构体中就会通过接受这些从文件中读取出来的内容来初始化结构体中的对应变量（一般是用来存储信息且有固定最大值的字符数组），做一些简单的处理（比如在末尾填上'\0'）并限制缓冲区大小，防止内存占用过大。

##### 设计意义
之所以分的很细，每一个类也只有format_error_message()和缓冲区字符数组两个成员是为了：
- 当新增一个错误需要别的错误类型的信息时，在设计这个错误类型是只需要也将这个类型作为struct，并多重继承所需要别的错误类型信息对应的struct，就能够使用这些信息（字符数组），并通过重写format_error_message()重写出新的错误类型报错提示
- 新增的错误类型struct只要遵循这种设计，新增的错误类型也可以在未来为其他再新增的错误类型所用。提高了代码复用性，增添新的错误类型是非常方便

#### namespace details
