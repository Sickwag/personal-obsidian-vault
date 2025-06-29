## 写项目时出现的问题
- 类中的 const 成员必须在类内（最好是构造函数中）通过初始化列表初始化
- `getline` 不接受 const 流（`fstream` 对象被 const 修饰）
- 文件编码保存问题可能会导致路径无法读取，比如文件路径通过字面量硬编码进代码中，**包含中文会导致无法读入**，这个问题在[[MySQL#8. 直接提交 sql 脚本|读写sql脚本]]时也出现过，可以参考保存方法。
  最新版 Visual studio 才会添加一个默认保存方式，旧版本需要使用 ***forceUTF 8***插件完成
- utf-8 有两种格式，
## cmake 项目出现的问题
### 无法连接 vcpkg
这是调用 vcpkg 的模板
```cmake
cmake_minimum_required(VERSION 3.10.0)

# 设置vcpkg工具链
set(CMAKE_TOOLCHAIN_FILE "$ENV{VCPKG_ROOT}/scripts/buildsystems/vcpkg.cmake"
    CACHE STRING "Vcpkg toolchain file")

project(cmake-test VERSION 0.1.0 LANGUAGES C CXX)

# 查找Boost库并指定需要的组件
find_package(Boost REQUIRED COMPONENTS filesystem system algorithm)

add_executable(cmake-test src/main.cpp)

# 链接Boost库
target_link_libraries(cmake-test PRIVATE Boost::boost Boost::algorithm Boost::filesystem Boost::system)

target_include_directories(cmake-test PRIVATE ${Boost_INCLUDE_DIRS})

```
其中：
- `find_package` 用于指定需要连接的第三方库，还可以指定版本号 `find_package(OpenCV 4.5 REQUIRED)`
- `target_include_directories` 这行代码的作用是指定编译器在查找头文件时应搜索的目录路径。
- `${Boost_INCLUDE_DIRS}`: Boost头文件所在的路径变量，这是通过
### 不使用包管理器调用库
| **场景**              | **推荐方式**            |
| ------------------- | ------------------- |
| 系统预装库（如 Boost）      | `find_package`      |
| 本地库（手动下载）           | 直接指定路径              |
| Git 子模块             | `add_subdirectory`  |
| 从 GitHub 直接下载       | `FetchContent`      |
| 需要自定义编译步骤           | `ExternalProject`   |
| Unix 的 `pkg-config` | `pkg_check_modules` |

#### 引入本地库
```cmake
cmake_minimum_required(VERSION 3.10)
project(MyProject)

# 假设 libfoo 的路径为 ${PROJECT_SOURCE_DIR}/third_party/libfoo 这个文件夹下是根目录，有include，bin，lib这样的文件夹
set(LIBFOO_ROOT "${PROJECT_SOURCE_DIR}/third_party/libfoo")

# 添加头文件路径
target_include_directories(my_app PRIVATE "${LIBFOO_ROOT}/include")

# 链接静态库
target_link_libraries(my_app PRIVATE "${LIBFOO_ROOT}/lib/libfoo.a")

# 如果是动态库（Windows 为 .dll，Linux 为 .so）
target_link_libraries(my_app PRIVATE "${LIBFOO_ROOT}/lib/libfoo.so")
```
#### 使用 `FetchContent`
```cmake
include(FetchContent)

# 下载并初始化 spdlog
FetchContent_Declare(
  spdlog
  GIT_REPOSITORY "https://github.com/gabime/spdlog.git"
  GIT_TAG        "v1.11.0"
)
FetchContent_MakeAvailable(spdlog)

# 直接链接
target_link_libraries(my_app PRIVATE spdlog::spdlog)
```

#### 使用 `ExternalProject`（复杂场景）

适用于需要自定义编译步骤的库（如交叉编译）。  
**示例：编译并引入 zlib**
```cmake
include(ExternalProject)

ExternalProject_Add(
  zlib_external
  URL "https://zlib.net/zlib-1.2.11.tar.gz"
  CMAKE_ARGS -DCMAKE_INSTALL_PREFIX=<INSTALL_DIR>
)
# 获取 zlib 的路径
ExternalProject_Get_Property(zlib_external install_dir)
target_link_libraries(my_app PRIVATE "${install_dir}/lib/zlib.a")
```
#### 使用 `pkg-config`（Unix-like 系统）
适用于通过 `pkg-config` 管理的库（如 GTK）。  
**示例：引入 GTK3**
```cmake
find_package(PkgConfig REQUIRED)
pkg_check_modules(GTK3 REQUIRED gtk+-3.0)

target_include_directories(my_app PRIVATE ${GTK3_INCLUDE_DIRS})
target_link_libraries(my_app PRIVATE ${GTK3_LIBRARIES})
```
#### 自定义 Find 模块（高级）
如果库没有提供 CMake 支持，可以手动编写 `FindXXX.cmake` 文件。  
**示例：自定义查找 `libfoo`**
1. 创建 `cmake/FindLibFoo.cmake`：
```cmake
find_path(LIBFOO_INCLUDE_DIR foo.h PATH_SUFFIXES include)
find_library(LIBFOO_LIBRARY foo PATH_SUFFIXES lib)
include(FindPackageHandleStandardArgs)
find_package_handle_standard_args(LibFoo DEFAULT_MSG LIBFOO_LIBRARY LIBFOO_INCLUDE_DIR)
```
2. 在 `CMakeLists.txt` 中使用：
```cmake
list(APPEND CMAKE_MODULE_PATH "${PROJECT_SOURCE_DIR}/cmake")
find_package(LibFoo REQUIRED)
target_link_libraries(my_app PRIVATE ${LIBFOO_LIBRARY})
```
### CMake 创建内置变量
当使用 `find_package` 命令时，会自动在包管理器中扫描创建内置变量供 cmake 使用，如：
```cmake
find_package(OpenCV REQUIRED)
```
会创建
- OpenCV_LIBS
- OpenCV_INCLUDE_DIRS
- OpenCV_LIBRARIES（opencv 用到的库）
指向对应的文件夹，调用它们的方法是使用 `${var_name}`


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
