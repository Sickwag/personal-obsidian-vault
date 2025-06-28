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
