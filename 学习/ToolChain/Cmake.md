---
created: 2026-01-07
参考: https://cmake.com.cn/cmake/help/latest/guide/tutorial/index.html
version: CMake 4.2.0
---

## Cmake 概述
### cmake编译过程
make 工具是一个项目构建工具，省去了重复用命令行编译，链接源文件的麻烦。CMake 是一个项目构建工具。关于项目构建我们所熟知的还有 Makefile（通过 make 命令进行项目的构建），大多 IDE 软件都集成了 make。makefile 通常依赖于当前的编译平台，而且编写 makefile 的工作量比较大，解决依赖关系时也容易出错。
所以 Cmake 可以解决这一问题，是一个==根据现在使用的平台生成对应 makefile 文件的工具==

cmake 是 `自动生成本地化的Makefile和工程文件`，用户只需 `make` 编译即可，所以可以把CMake看成一款自动生成 Makefile的工具，下面是编译流程
[![image-20230309130644912](https://subingwen.cn/cmake/CMake-primer/image-20230309130644912.png)](https://subingwen.cn/cmake/CMake-primer/image-20230309130644912.png)
- 蓝色虚线表示使用`makefile`构建项目的过程
- 红色实线表示使用`cmake`构建项目的过程
### Cmake 的优点和特性
#### Cmake 的优点
- 跨平台
- 能够管理大型项目
- 简化编译构建过程和编译过程
- 可扩展：可以为 cmake 编写特定功能的模块，扩充 cmake 功能

C 程序源文件到可执行文件需要经过：
预处理→编译→汇编→链接→可执行文件
![[Pasted image 20241011104830.png]]

用 cmake 脚本文件（`cmakelists.txt`）过程
- 创建cmakelists.txt
- 对这个文件执行cmake命令
- 文件生成makefile文件
- Makefile文件执行make命令
- 命令调用os接口处理源文件
![[Pasted image 20241011105200.png]]
#### Cmake 的本质
为了解决 makefile 需要根据不同平台写入不同的makefile 操作指令，cmake 制定了一套规则，让相同的源代码，在不同平台编译时，根据不同的平台生成不同的 Makefile 编译文件，实现跨平台
- Cmake 命令对当前需要编译的文件生成 makefile 文件
- make 命令在当前项目中执行 makefile 文件中的命令
- 执行 makefile 中的命令会调用 gcc，clang 等编译工具进行**预处理，编译，汇编，链接**等操作得到**可执行文件或者动静态链接库**
不暴露源代码或者源代码文件数量过多不好管理的情况下，可以将一个或者多个 c/cpp 文件打包成动静态链接库方便调用
# CMake 编写规范
## 基本规范
### 配置书写顺序
- 注意所有 `set(CMAKE_…..)` 的设置cmake配置的代码应该放在设置cmake版本代码之后，在project之前。
- `project()` 之前，CMake 不知道你要用什么语言，也不知道编译器是谁 CMake 在 `project()` 时才会：设置默认编译器（如 MSVC / GCC），***所有的 set 语句和 cmake_... 语句设置的变量直到 project 语句时才会执行***，更准确的说法是：

> `set(...)` 和 `cmake_...` 命令在它们出现时**立即执行**，但它们对 CMake 行为的影响，可能要在 `project()` 后才“生效”或“被使用”。

- `find_package()` 必须放在 `project()` 之后，因为 CMake 需要**先初始化项目环境（编译器、语言、架构）**，才能正确查找和链接外部库。

### 工具链文件预处理逻辑

> 作用：全局集成（推荐用于个人开发环境）

在安装 vcpkg 之后，通常需要输入：
```powershell
vcpkg integrate project
```
- 会将 vcpkg 的库路径注册到 **系统环境变量** 或 **CMake 全局配置** 中
- 使得 **所有 CMake 项目** 在不显式设置 `CMAKE_TOOLCHAIN_FILE` 的情况下，也能自动找到 vcpkg 安装的包
- 实现方式：
    - 修改 `CMAKE_PREFIX_PATH`（Windows 上通常通过注册表或用户环境变量）
    - 在 `%APPDATA%\vcpkg\registries` 中写入信息
    - 对 Visual Studio 用户，还会让 VS 自动识别 vcpkg 包
- 使用场景
	- 在本机开发多个项目，都使用 vcpkg
	- 简化 CMakeLists.txt，不每次都写 `set(CMAKE_TOOLCHAIN_FILE ...)`
	- 用 Qt Creator / VSCode / Visual Studio 等 IDE，希望自动识别依赖
使用这句之后，在 cmake 项目中即使不写 `CMAKE_TOOLCHAIN_FILE` cmake 仍然能够正确识别 vcpkg 中安装的库，而不是在别的地方寻找

> [!NOTE]
> 可以通过运行 `vcpkg integrate remove` 清除全局集成

```bash
vcpkg integrate install
```

> 作用：项目级集成（推荐用于团队协作或 CI/CD）

会在当前项目的根目录生成一个 .cmake 文件（通常是 vcpkg.cmake）只需在 CMakeLists.txt 中添加一行：
```cmake
include(vcpkg.cmake)  # 或者 set(CMAKE_TOOLCHAIN_FILE "vcpkg.cmake")
```
不影响系统环境，只对当前项目生效
更适合多项目共存、不同版本依赖、CI 构建等场景。我自己使用 vcpkg 进行包管理，但是别人不是，所以关于 vcpkg 的配置只有我需要做，所以我需要将我对 vcpkg 的设置单独分开来，不然别人使用我混合有 vcpkg 配置的 `CMakeLists.txt` 文件会导致问题

### 语句执行流程
```md
1. cmake_minimum_required()         ← 必须第一个调用
2. set() / cmake_policy() / option() ← 设置变量、策略，立即执行
3. project()                        ← 初始化项目，激活工具链、编译器、语言
4. find_package() / enable_language() ← 查找依赖、启用语言
5. add_executable() / add_library() ← 定义目标
6. target_link_libraries() / target_include_directories() ← 配置目标属性
7. install() / add_custom_command() ← 构建后操作
8. message() / include()            ← 辅助调试或引入模块
```
- `cmake_policy (SET CMPxxx NEW/OLD)`
作用：设置 CMake 兼容性策略
立即执行，但只对后续代码生效
常用于避免旧版兼容问题（如 `CMP0167 `）
- `option (VARIABLE "Description" ON/OFF)`
作用：定义用户可选的开关变量（常用于 GUI 或命令行）
立即执行，可在 `project()` 之前或之后使用
- `include (CMakeLists. txt) 或 include (Module. cmake)`
作用：包含其他 CMake 文件
立即执行，内容会被“内联”到当前脚本中
- `target_include_directories (TARGET PRIVATE|PUBLIC|INTERFACE DIR...)`
作用：为目标添加头文件搜索路径
必须在 add_executable 或 add_library 之后调用
- `target_compile_definitions (TARGET PRIVATE|PUBLIC|INTERFACE DEFINITION...)`
作用：为目标添加预处理器宏
必须在 add_executable 或 add_library 之后调用
- `target_compile_options (TARGET PRIVATE|PUBLIC|INTERFACE OPTION...)`
作用：为目标添加编译选项
必须在 add_executable 或 add_library 之后调用
target_compile_options (main PRIVATE "-Wall" "-Wextra")
适用于特定目标的优化或警告设置。
- `install (TARGETS ... DESTINATION ...) / install (DIRECTORY ... DESTINATION ...)`
作用：定义安装规则
通常放在脚本末尾
不影响构建，只影响 make install 或 cmake --install
```cmake
install (TARGETS main DESTINATION bin)
install (DIRECTORY include/ DESTINATION include)
```
- `add_custom_command () / add_custom_target ()`
作用：定义自定义构建步骤或目标
必须在 project () 之后调用
```cmake
add_custom_command (
    OUTPUT generated. h
    COMMAND python generate. py > generated. h
    DEPENDS generate. py
)
```
add_custom_target (generate ALL DEPENDS generated. h)
用于生成代码、资源文件等。
# 实际工程中出现的问题
## `CMP0167` 警告
- 从 CMake 3.13 开始，官方推荐使用 **Config 模式**（即通过 `FindPackageConfig.cmake`）寻找某个模块的位置，如寻找 boost 库就会通过在库的安装目录寻找 `FindBoostConfig.cmake` 文件来引入 boost 库中的对应模块
- 在没有设置工具链的情况下，CMake 会 fallback 到系统默认的 `FindBoost.cmake` —— 这个模块在 CMake 3.13+ 中已被标记为“废弃”，为了兼容没有删除，所以会报 **CMP0167 警告**。
可以使用下面的代码强制使用 config 模式寻找模块
```cpp
if(POLICY CMP0167)
    cmake_policy(SET CMP0167 NEW)
endif()
```
如果不使用这段代码，就会**使用 `FindPackageConfig.cmake` 中定义的方式来寻找模块**，这也就是为什么虽然这时候使用 `find_package` 不出现报错了，但是构建时会出现
如果一个库支持 config 调用，那么可以使用
```cmake
find_package(Boost REQUIRED COMPONENTS system)
```
方式强制使用 config 方式引入库，添加 `if(POLICY CMP0167)` 作用只是为了兼容老项目
## cmake 不在指定目录中寻找 boost 库
### 构建正常场景
```cmake
#  这是能够正常通过构建的代码
cmake_minimum_required(VERSION 3.10.0)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_C_STANDARD_REQUIRED ON)

# if(POLICY CMP0167)
#     cmake_policy(SET CMP0167 NEW)
# endif()

project(learn_dll_lib VERSION 0.1.0 LANGUAGES C CXX)
find_package(Boost REQUIRED COMPONENTS system) # find_package在project之后

add_library(learn_dll_lib learn_dll_lib.cpp)

target_link_libraries(learn_dll_lib PRIVATE
    Boost::system
)
```
会出现警告，但成功构建，由于之前已经使用 `vcpkg integrate install` 将 vcpkg 集成到 cmake 中，所以这里还是会到 vcpkg 目录中寻找 boost，并且通过 `FindBoostConfig.cmake` 方式寻找，cmake 会抛出一个警告
```bash
[cmake]   Policy CMP0167 is not set: The FindBoost module is removed.  Run "cmake
```
如果解开 `CMP0167` 警告，使用 config 方式寻找 `BoostConfig.cmake` 文件进行配置，就不会出现警告，不使用 `FindBoostConfig.cmake` 的而使用 config 方式寻找引入逻辑。
### 构建错误场景
```cmake
#  这是不能正常通过构建的代码
cmake_minimum_required(VERSION 3.10.0)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_C_STANDARD_REQUIRED ON)

# if(POLICY CMP0167)
#     cmake_policy(SET CMP0167 NEW)
# endif()

find_package(Boost REQUIRED COMPONENTS system) # find_package在project之前
project(learn_dll_lib VERSION 0.1.0 LANGUAGES C CXX)

add_library(learn_dll_lib learn_dll_lib.cpp)

target_link_libraries(learn_dll_lib PRIVATE
    Boost::system
)
```
由于 find_package 在 project 之前，并且由于 ***[[#基本规范#配置书写顺序|所有的 set 语句设置的变量直到 project 语句时才会执行]]***，所以 cmake 在不知道使用什么语言和编译器的情况下 （unknow toolsest）被告知**需要寻找 boost 库**，CMake fallback 到 FindBoost.cmake（虽然设了 CMP0167 NEW，但在` project()` 之前无效）
这就会导致 cmake 在 Anaconda 的 Boost 库中的 BoostDetectToolset-1.82.0. cmake 中的
```cmake
string(REGEX MATCHALL "[0-9]+" _BOOST_COMPILER_VERSION ${CMAKE_CXX_COMPILER_VERSION})
```
这一行出现
```bash
发生异常: FATAL_ERROR
CMake Error at D:/Program/Anaconda/Library/lib/cmake/BoostDetectToolset-1.82.0.cmake:5 (string):
  string sub-command REGEX, mode MATCHALL needs at least 5 arguments total to
  command.
Call Stack (most recent call first):
  D:/Program/Anaconda/Library/lib/cmake/boost_system-1.82.0/boost_system-config.cmake:29 (include)
  D:/Program/Anaconda/Library/lib/cmake/Boost-1.82.0/BoostConfig.cmake:141 (find_package)
  D:/Program/Anaconda/Library/lib/cmake/Boost-1.82.0/BoostConfig.cmake:262 (boost_find_component)
  D:/Program/Cmake/share/cmake-4.0/Modules/FindBoost.cmake:609 (find_package)
  CMakeLists.txt:7 (find_package)
```
这有两个原因，首先由于 toolset 位置，cmake 不知道有 vcpkg 的存在，第二是因为 cmake fallback 了，没有使用 config 方式寻找配置，而是使用了 findboost，所以才可以看到语法错误，cmake 需要 `at least 5 arguments total` 5 个参数进行正则查找，但是并没有满足

## Visual studio 无法使用 cmake 项目
### 问题
可以创建项目，也可以通过 cmake 构建编译，运行 exe 程序，但是错误列表中出现大量无法打开源文件，头文件，标准库文件的报错。
### 原因和解决
没有设置 cmake 可信执行文件的目录
![[Pasted image 20251011153910.png]]
设置完后，问题解决

## find_package 使用方法
来源：[[BookManageSystem+mysql|自己写的图书管理系统]]
### 问题
怎么都找不到 vcpkg 的 tool_chain_file

当通过 `settings.json` 和 `CMakePresets.json` 中设置 vcpkg 的 cmake 配置工具链文件都出现了找不到 vcpkg 安装库下对应第三方库文件的 cmake 配置文件时（无法找到 `xxxx-config.cmake`），可能是 cmake 在 `find_package` 命令执行时，按照系统环境变量搜索，而不是按照 `vcpkg/installed` 搜索，有的时候会搜索 anaconda 目录，这是由于安装了 Visual studio 造成。
### 各种参数和工作原理
如果还是找不到 vcpkg 的安装目录或者还是在 anaconda 中寻找：强制指定 vcpkg 库安装目录可以解决
```cpp
set(Boost_DEBUG ON)
set(CMAKE_TOOLCHAIN_FILE "D:\\Program\\vcpkg\\scripts\\buildsystems\\vcpkg.cmake")
set(CMAKE_PREFIX_PATH "D:/Program/vcpkg/installed/x64-windows/" ${CMAKE_PREFIX_PATH})
message(STATUS "CMAKE_PREFIX_PATH: ${CMAKE_PREFIX_PATH}")
```
如果在 linux 中，在 find_package 函数中查找库路径，可以在括号最后面添加 `PATH path/to/boost` 来指定查找路径，也可以手动设置这个库的 include 和 lib 目录
```cmake
set(BOOST_ROOT "/usr/local/boost-1.89")
set(Boost_INCLUDE_DIR "/usr/local/boost-1.89/include")
set(Boost_LIBRARY_DIRS "/usr/local/boost-1.89/lib")
find_package(Boost REQUIRED COMPONENTS headers context json regex url)
```
如果不指定 path，则 linux 会自动搜索：

| 头文件路径                                       |     |
| ------------------------------------------- | --- |
| `/usr/include`                              |     |
| `/usr/local/include`                        |     |
| `/usr/local/boost*/include`                 |     |
| `/opt/boost*/include`                       |     |
| 库文件路径                                       |     |
| `/usr/lib`  <br>`/usr/lib/x86_64-linux-gnu` |     |
| `/usr/local/lib`  <br>`/usr/local/lib64`    |     |
| `/opt/boost*/lib`                           |     |
如果是 windows ，则会搜索环境变量
如果项目中设置了：
```cmake
set (CMAKE_CXX_STANDARD 20)
set (CMAKE_CXX_STANDARD_REQUIRED ON)
```
使用 `cout << __cpluspluse` 还是输出 1997 版本，那么就需要在编译时强制指定
```cpp
target_compile_options(BookManagePlus PRIVATE "/std:c++20" "/Zc:__cplusplus")
```

这时需要在环境变量 path 中调整 vcpkg 安装目录变量到 anaconda 上方，并且删除原有 build 目录，重新通过 cmake 生成工程，即可解决问题

## cmake 引入外部库无法找到
来源：[[MyTinyTools]]
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
- `${Boost_INCLUDE_DIRS}`: Boost 头文件所在的路径变量，这是通过
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
**示例：引入 GTK 3**
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

## 工具链引入 head-only 库找不到头文件
来源：自己写的项目 [[ExplainLNK2019]]

### 问题
httplib 是一个单头文件库，只需要使用 `find_package(httplib CONFIG REQUIRED)` 即可引入 `httplibConfig.cmake`，问题出在如果不使用 `target_link_libraries(httplib::httplib)`，项目会报错找不到 `httplib.h` 文件。原因未知。 #未知错误 
### 找不到头文件和 `LNK2019` 错误
一般引入单头文件库只需要将头文件复制到项目目录中并添加到 includepath 中即可，并不需要链接。但是如果通过包管理工具引入但头文件库，可能会将头文件编译为库，也有可能不会，所以保险起见还是都使用 `target_link_libraries()` 链接.

添加链接之后错误消失，推测可能是 vcpkg 将 httplib 编译成了库，但是 everything 未查找到对应文件
```cmake
project(ExplainLNK2019 VERSION 0.1.0 LANGUAGES C CXX)
find_package(httplib CONFIG REQUIRED)
find_package(OpenSSL REQUIRED)
add_executable(ExplainLNK2019 httplib.cpp)
```
修改为
```cmake
project(ExplainLNK2019 VERSION 0.1.0 LANGUAGES C CXX)

find_package(httplib CONFIG REQUIRED)
find_package(OpenSSL REQUIRED)

add_executable(ExplainLNK2019 httplib.cpp)
target_link_libraries(ExplainLNK2019 PRIVATE httplib::httplib OpenSSL::SSL OpenSSL::Crypto)
```
即可
## cmake 多配置管理
如果需要 cmake 一次性编译出 debug 和 release 版本的文件，需要设置 `CMAKE_CONFIGURATION_TYPES` 变量，如果没有，那么需要：
- 执行两次 cmake 命令
- 每次指定不同的目录作为目标文件输出位置
- 为不同编译指令制定不同的预定义选项
```cmake
if(CMAKE_CONFIGURATION_TYPES)
    set(CMAKE_CONFIGURATION_TYPES "Debug;Release" CACHE STRING "" FORCE)
endif()

# 这样Debug和Release版本的可执行文件会分别放在不同的子目录中
set_target_properties(${PROJECT_NAME} PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY_DEBUG ${CMAKE_BINARY_DIR}/bin/Debug
    RUNTIME_OUTPUT_DIRECTORY_RELEASE ${CMAKE_BINARY_DIR}/bin/Release
)

# 为不同配置添加预处理器定义（可选）
target_compile_definitions(${PROJECT_NAME}
    PRIVATE $<$<CONFIG:Debug>:DEBUG_BUILD>
    PRIVATE $<$<CONFIG:Release>:RELEASE_BUILD>
)
```
## vscode 配置 cmake qt 环境
首先 cmake 引入 qt 模块
```cmake
find_package(Qt6 REQUIRED COMPONENTS Core Widgets)

# 或者这样引入qt5/6

# find_package(QT NAMES Qt6 Qt5 REQUIRED COMPONENTS Widgets)
# find_package(Qt${QT_VERSION_MAJOR} REQUIRED COMPONENTS Widgets)

add_executable(use_qt main.cpp)
target_link_libraries(use_qt PRIVATE Qt6::Core Qt6::Widgets)
```
然后在 `c_cpp_properties.json` 中设置 includepath
```json
{
    "configurations": [
        {
            "name": "Win32",
            "includePath": [
                "${workspaceFolder}/**",
                "D:/OtherProgram/Qt/6.8.0/msvc2022_64/include/**", // 重点
                "${vcpkgRoot}/x64-windows/include",
                "${vcpkgRoot}/x86-windows/include"
            ],
			...
        }
    ],
    "version": 4
}
```
## 部分环境编译通过，部分大量 `LNK2019` 错误
来源：自己写的项目 [[ExplainLNK2019]]
### 问题
在 vscode ，vs 和 qt creator中构建同一份 `CMakeLists.txt`，前两者编译构建通过，qt 构建通过，但编译出现大量 `LNK2019` 错误，cmake 代码和[[#工具链引入 head-only 库找不到头文件]] 一致
### 原因
其实是缺少了某个库，需要观察编译报错错误中所有的**无法解析的外部符号**来自哪个库，这就说明**项目的依赖也依赖某个外部库**，需要导入和链接
```regex
// 正则
.*无法解析的外部符号\s(.*)函数.*
// 替换为
$1
```
查阅这些符号来自什么库，通过 find_package 和 target_link_libraries 链接接口

msbuild 中对 vcpkg 有很好的支持（使用 `vcpkg install integate` 后），会自动在 vcpkg 中寻找，而 cmake 构建中，如果没有指定 tool_chain_file 就不会自动寻找，所以可能会导致问题（有的时候指定了也会这样，原因未知 #未知错误 ）
# 包管理工具
## vcpkg
### 下载速度问题
参考：[vcpkg国内镜像源替换-CSDN博客](https://blog.csdn.net/weixin_41364246/article/details/140123907)
修改国内镜像之后，大部分包能够快速下载，但是不在 github 拖管的包需要自己替换源
# CMake 教程
参考：[CMake 教程 — CMake 4.2.0 文档 - CMake 构建系统](https://cmake.com.cn/cmake/help/latest/guide/tutorial/index.html)
## 杂项内容
### cmake cli 选项分类
```
Generate a Project Buildsystem
 cmake [<options>] -B <path-to-build> [-S <path-to-source>]
 cmake [<options>] <path-to-source | path-to-existing-build>

Build a Project
 cmake --build <dir> [<options>] [-- <build-tool-options>]

Install a Project
 cmake --install <dir> [<options>]

Open a Project
 cmake --open <dir>

Run a Script
 cmake [-D <var>=<value>]... -P <cmake-script-file>

Run a Command-Line Tool
 cmake -E <command> [<options>]

Run the Find-Package Tool
 cmake --find-package [<options>]

Run a Workflow Preset
 cmake --workflow <options>

View Help
 cmake --help[-<topic>]
```

| 命令模式       | 语法示例                                    | 核心作用      | 典型使用场景                    |
| ---------- | --------------------------------------- | --------- | ------------------------- |
| **构建系统生成** | `cmake -S . -B ./build`                 | 生成构建配置文件  | 首次配置项目/修改配置后重新生成          |
| **项目构建**   | `cmake --./build ./build`               | 执行实际编译    | 编译源代码生成可执行文件              |
| **安装部署**   | `cmake --install ./build --prefix /opt` | 安装构建产物    | 软件包部署/系统安装                |
| **项目打开**   | `cmake --open ./build`                  | 启动IDE项目   | Visual Studio/Xcode等IDE集成 |
| **脚本执行**   | `cmake -P script.cmake`                 | 运行CMake脚本 | 自动化配置/清理等任务               |
| **工具模式**   | `cmake -E copy file.txt dest/`          | 执行系统命令    | 文件操作/环境检查等                |
| **包查找**    | `cmake --find-package -DNAME=Threads`   | 查找系统库     | 依赖库定位调试                   |
| **工作流执行**  | `cmake --workflow --preset ci`          | 执行预设工作流   | CI/CD自动化构建                |
| **帮助查询**   | `cmake --help-command add_executable`   | 查看命令文档    | 学习CMake语法                 |
- 安装部署模式下（已经使用了 `--install`），使用 `--prefix` 用于覆盖 `--prefix_install` 的设置，编译模式下使用 `--prefix-install` 指定安装目录
总体构建流程参考 [[#CMake 教程#cmake 部署项目逻辑]]
### cmake cli 选项和配置文件编写的对应关系
| 命令行参数           | CMakeLists等价写法                       | 作用说明                    |
| --------------- | ------------------------------------ | ----------------------- |
| `-D<var>=<val>` | `set(<var> <val> CACHE ...)`         | 定义缓存变量（配置参数）            |
| `-G<generator>` | `set(CMAKE_GENERATOR "<generator>")` | 指定构建系统生成器               |
| `-H<dir>`       | 无直接对应（指定源目录）                         | 设置顶层源码目录                |
| `-B<dir>`       | 无直接对应（指定构建目录）                        | 设置构建输出目录                |
| `-U<glob>`      | 无直接对应                                | 从缓存中删除匹配变量              |
| `-L[HLG]`       | `get_cmake_property(...)`            | 列出缓存变量                  |
| `-N`            | `CMAKE_EXPORT_COMPILE_COMMANDS`      | 生成compile_commands.json |
| `-T<title>`     | `project(... VERSION ...)`           | 设置项目标题                  |
| `-P<script>`    | `cmake -P`模式专用                       | 执行纯CMake脚本              |

| 功能需求    | CMakeLists.txt 写法                                                                                      | 含义说明                       |
| ------- | ------------------------------------------------------------------------------------------------------ | -------------------------- |
| 获取源码根目录 | `${CMAKE_SOURCE_DIR}`<br>`_PROJECT_SOURCE_DIR}`                                                        | 指向包含最外层 CMakeLists.txt 的目录 |
| 获取构建根目录 | `${CMAKE_BINARY_DIR}`<br>`_PROJECT_BINARY_DIR}`                                                        | 指向最外层构建目录                  |
| 子模块源码目录 | `${PROJECT_SOURCE_DIR}/src`                                                                            | 当前 project() 所在的源码目录       |
| 子模块构建目录 | `${PROJECT_BINARY_DIR}/obj`                                                                            | 当前 project() 对应的构建输出目录     |
| 添加子目录映射 | `add_subdirectory(src build_subdir)`<br>`add_subdirectory(src ${CMAKE_BINARY_DIR}/third_party/libpng)` | 控制子模块的构建位置                 |
## 第 0 步：开始之前
### cmake 生成器
**CMake 的工作是根据 CMakeLists 配置文件生成构建系统文件** 
- 这些文件能被其他构建工具理解和使用，而生成器负责生成这些文件
- 不同的生成器会生成不同类型的构建系统文件
- CMake 生成器是平台特定的，因此每个生成器可能只在特定平台上可用
生成器分为：
1. makefile 生成器，生成传统 Unix makefile，linux 的 make 工具可直接使用
2. Nmakefiles 生成器，生成 windows 上适用的 makefile，windows make 使用
3. ninja 生成器，生成 ninja 构建*纯文本*文件，理论上更快，跨平台，需要安装 ninja cli
4. Visual studio/xcode/codeblock 生成器，生成 sln 或对应 ide 的工程文件
```bash
cmake -S /path/to/source -B /path/to/build -G <generate-name>
# 不指定生成器使用默认，windows -> vs， linux -> make
```
使用不同的生成器生成文件之后，就可以用对应的构建工具生成文件
```bash
cmake -S . -B --build -G Ninja
cd build && ninja
```
注意不能在生成器间**重用构建目录**，-B 选项应该为不同生成器制定不同路径
### 单配置和多配置生成器
底层构建系统是细节，编写 cmakelist 时不需要管
配置构建即编译程序使用的方式，debug，release，relwithdebinfo 等，`CMAKE_BUILD_TYPE`**缓存变量**会在第一个 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project "project") 或 [`enable_language()`](https://cmake.com.cn/cmake/help/latest/command/enable_language.html#command:enable_language "enable_language") 命令初始化，否则使用默认（一般是 debug 模式）。这个环境变量取自*进程环境*，可以通过 `-D` 和 CMakePresets 设置
所谓单配置和多配置就是每次编译仅仅生成一/多个模式的编译文件，可以使用 `cmake --build --config <name>` 指定
每个配置的构建方式在 `CMakePresets.json` 中设置
```json
{
  "version": 3,
  "configurePresets": [{
    "name": "linux-debug",
    "generator": "Unix Makefiles",
    "binaryDir": "${sourceDir}/build/debug",
    "cacheVariables": {
      "CMAKE_BUILD_TYPE": "Debug" // 设置环境变量
    }
  }]
}
```
然后使用 `--preset <name>` 即可调用对应的设置
### 额外知识
#### cmake 部署项目逻辑
总体使用 cmake 流程为：
```md
[源代码] 
    ↓ cmake -S -B 
[构建系统生成] → [构建配置文件]
    ↓ cmake --build 
[编译链接阶段] → [可执行文件/库]
    ↓ ctest 
[测试验证] 
    ↓ cmake --install 
[安装部署]
```
部署过程中的选项有优先级：

| 配置优先级    | 来源                  | 说明           |
| -------- | ------------------- | ------------ |
| 1. 命令行参数 | `-DVAR=VAL`         | 优先级最高，覆盖所有预设 |
| 2. 预设配置  | `CMakePresets.json` | 包含完整的配置参数    |
| 3. 环境变量  | `CXX=clang++`       | 仅影响未显式配置的参数  |
#### 文件集特性简要介绍
CMake 3.23 新增功能，用于组织特定类型的文件（如头文件、C++ 模块）
```cmake
target_sources(<target>
  [INTERFACE|PUBLIC|PRIVATE]
    FILE_SET <set_name> 
      [TYPE <HEADERS|CXX_MODULES>] 
      [BASE_DIRS <dirs>...] 
      [FILES <files>...]
)
```
```cmake
add_library(MyLib lib.cpp)

# 定义头文件集
target_sources(MyLib PUBLIC
  FILE_SET HEADERS 
    BASE_DIRS include 
    FILES include/mylib.h
)

# 定义 C++ 模块文件集
target_sources(MyLib PRIVATE
  FILE_SET MODULES 
    TYPE CXX_MODULES 
    FILES src/module.cppm
)
```
参数说明

| 参数          | 说明                                                          |
| ----------- | ----------------------------------------------------------- |
| `FILE_SET`  | 定义一个文件集，名称需*以小写字母或下划线开头*（预定义集名称如 `HEADERS` 除外）。             |
| `TYPE`      | 文件集类型，支持 `HEADERS`（头文件）和 `CXX_MODULES`（C++ 模块）。             |
| `BASE_DIRS` | 基目录列表，用于定位文件集中的文件。相对路径相对于当前源码目录（`CMAKE_CURRENT_SOURCE_DIR`） |
| `FILES`     | 要包含的文件列表，必须位于 `BASE_DIRS` 之一或其子目录中。                         |
|             |                                                             |
文件集类型

| 类型            | 用途                                                               |
| ------------- | ---------------------------------------------------------------- |
| `HEADERS`     | 标记为头文件（`HEADER_FILE_ONLY` 属性为 `TRUE`），可通过 `install(TARGETS)` 安装。 |
| `CXX_MODULES` | 包含 C++ 接口模块或分区单元（使用 `export` 关键字），不能有 `INTERFACE` 作用域。           |
#### target_source 添加文件
##### 基本内容
CMake采用"声明式+过程式"混合设计，`add_executable` / `add_library` 定义目标基本结构，`target_sources` 实现动态扩展。
本质上是将文件集添加到目标，或将文件添加到现有文件集。
目标具有零个或多个命名[[#文件集]]。每个文件集都有一个名称、一个类型、一个 `INTERFACE`、`PUBLIC` 或 `PRIVATE` 范围、一个或多个基目录以及这些目录中的文件
语法：
```cmake
target_sources(<target>
  <INTERFACE|PUBLIC|PRIVATE> [items1...]
  [<INTERFACE|PUBLIC|PRIVATE> [items2...] ...]
)
```
每个 item 可以是 `HEADERS` 头文件或者 `CXX_MODULES`
作用域区别

| 作用域     | 当前目标构建 | 依赖目标可见 | 依赖目标使用 |
|------------|--------------|--------------|--------------|
| `PRIVATE`  | ✅            | ❌            | ❌            |
| `PUBLIC`   | ✅            | ✅            | ✅            |
| `INTERFACE` | ❌            | ✅            | ✅            |
##### 依赖传递机制
```cmake
add_library(A a.cpp)
add_library(B b.cpp)

target_sources(B PUBLIC b_extra.cpp)

add_executable(C main.cpp)
target_link_libraries(C PRIVATE B)
```
根据依赖传递机制

| 构建产物     | 包含文件列表                | 说明                        |
| -------- | --------------------- | ------------------------- |
| `libA.a` | a.cpp                 | 仅包含显式指定的源文件               |
| `libB.a` | b.cpp, b_extra.cpp    | 因`PUBLIC`作用域，两个文件均被包含     |
| `C可执行文件` | main.cpp, b_extra.cpp | 通过依赖传递机制继承`B`的`PUBLIC`源文件 |
常见使用情景有：
1. 平台差异化编译实现：
```cmake
add_library(Network lib/network.cpp)

if(WIN32)
  target_sources(Network PRIVATE winsock.cpp)
elseif(APPLE)
  target_sources(Network PRIVATE darwin.cpp)
endif()
```
2. 插件系统实现
```cmake
add_library(PluginCore core.cpp)

# 按需添加功能模块
foreach(module IN LISTS PLUGIN_MODULES)
  target_sources(PluginCore PRIVATE ${module}.cpp)
endforeach()
```
3. 条件编译
```cmake
add_executable(DebugTool main.cpp)

target_sources(DebugTool PRIVATE
  "$<$<CONFIG:Debug>:debug_gui.cpp>"
  "$<$<CONFIG:Release>:release_monitor.cpp>"
)
```
#### 交叉编译
本质是：在一种架构的机器上生成另一种架构的可执行代码
交叉编译通常需要引入工具链文件（toolchain file），用于指定目标平台的编译器、SDK 路径等信息。由于 vcpkg 支持下载不同架构的预编译库，因此在交叉编译时也需通过工具链文件告知 vcpkg 当前目标平台的架构，以便选择合适的库进行链接。
#### CMakePresets 配置
`CMakePresets.json` 的作用是避免构建/编译/安装过程中的重复命令输入，统一配置，方便使用者直接使用 `--preset` 跳过这些步骤的配置文件
```md
# 标准化构建流程
1. 配置阶段: cmake --preset linux-debug
2. 构建阶段: cmake --build --preset build-debug
3. 安装阶段: cmake --install --preset install-linux
```
## 第 1 步：CMake 入门
### 背景
命令 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project "project") 是一个概念上简单的命令，但功能复杂。它通知 CMake，接下来的内容是描述一个具有给定名称的独立软件项目（而不是类 shell 脚本）。当 CMake 看到 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project "project") 命令时，它会执行各种检查以确保环境适合构建软件；例如，检查编译器和其他构建工具，并发现主机和目标机器的字节序等属性。
在 CMake 的任何用法中，根 CML 中的**第一个命令都将是** [`cmake_minimum_required()`](https://cmake.com.cn/cmake/help/latest/command/cmake_minimum_required.html#command:cmake_minimum_required "cmake_minimum_required")。在**某些高级用法中**，[`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project "project") 可能不是 CML 中的第二个命令
### 练习 1 - 构建可执行文件
 `add_executable()` 命令创建一个目标。在 CMake 的术语中，**目标是开发者为一组属性指定的名称**，目标的本质*只是名称，是此属性集合的句柄。*
目标可能要跟踪的一些属性示例是
- 构件种类（可执行文件、库、头文件集合等）
- 源文件
- 包含目录
- 可执行文件或库的输出名称
- 依赖项
- 编译器和链接器标志
所有目标中的路径字符**都是绝对路径或者相对于 `CMAKE_CURRENT_SOURCE_DIR` 的路径**，相对于当前 CMakeLists 的路径
```cmake
# TODO1: Set the minimum required version of CMake to be 3.23
cmake_minimum_required(VERSION 3.15)
# TODO2: Create a project named Tutorial
project(Tutorial)
# TODO3: Add an executable target called Tutorial to the project
add_executable(Tutorial)
# TODO4: Add the Tutorial/Tutorial.cxx source file to the Tutorial target
target_sources(Tutorial PRIVATE
	Tutorial/Tutorial.cxx
)
```
注意如果使用 `add_executable` **只声明目标而不添加任何文件**不需要写访问修饰符
### 练习 2 - 构建库
描述一组头文件**最好使用 `FILE_SET`**，头文件是不必要的，就算在 `add_libraries` 或者 `add_executable` 中不添加头文件也不会影响程序编译，但是对于库的安装却需要头文件来**让 `install` 命令知道去哪里找到头文件**
```cmake
target_sources(MyLibrary
  PRIVATE
    library_implementation.cxx

  PUBLIC
    FILE_SET myHeaders
    TYPE HEADERS
    BASE_DIRS
      include
    FILES
      include/library_header.h
)
```
- `FILE_SET <name>` 是 `FILE_SET` 的名称。这是一个句柄，我们可以在其他上下文中用它来描述这个集合
- `TYPE <type>` 是我们正在描述的文件类型。最常见的是头文件，但较新版本的 CMake 支持其他类型，如 C++20 模块。
- `BASE_DIRS` 是文件的“基”位置。这可以最容易地理解为通过 `g++ -I` 标志向编译器描述的用于头文件发现的位置。
> [!note]
> 当编译器的头文件中需要使用其他文件夹中的头文件时，如果仅仅将头文件和源文件都通过 `g++ /path/to/head.h source.cpp -o main.exe` 就需要在 `source.cpp` 中的 include 中使用相对源文件的**相对路径**，而如果添加了 `-I` 选项，就相当于设置了 `includePath`，只用 include 头文件名即可
> cmake 中在一个目标的 source 文件中，使用 base_dir 或者 `include_directories()` 标记一个文件夹作为头文件目录，就相当于告诉编译器，当编译这个目标时，使用 ` -I ` 选项将 base_dir 目录作为 includepath，只不过 `include_directories` 是全局范围
> ```bash
> g++ -I/include_dir1 -I/include_dir2 source.cpp
> ```
- `FILES` 是文件列表，与之前的实现源列表相同。
也可以给文件集命名为 `HEADERS` 不使用名称，可以省略 type 属性，如果不写 `BASE_DIR` cmake 会默认 `$CMAKE_CURRENT_SOURCE_DIR` 作为 base_dir
### 练习 3 - 链接库和可执行文件
练习编写内容为：
```cmake
target_link_libraries(Tutorial PRIVATE
	MathFunctions
)

# TODO11: Add the Tutorial subdirectory to the project

# TODO5: Add a library target called MathFunctions to the project
add_library(MathFunctions)

# TODO6: Add the source and header file located in Step1/MathFunctions to the
# MathFunctions target, note that the intended way to include the
# MathFunctions header is:
# #include <MathFunctions.h>
target_sources(MathFunctions PRIVATE
	PRIVATE
	MathFunctions/MathFunctions.cxx

	PUBLIC
	FILE_SET mathFunctionsHeaders
	TYPE HEADERS
	BASE_DIRS
	MathFunctions
	FILES
	MathFunctions/MathFunctions.h
)
```
`add_library` 可以放在 `target_link_libraries ` 之后，然后再通过 `target_source` 定义库（目标）的具体细节，有点像先声明再定义。
链接之后 cmake 就可以读取库头文件内容，可以使用 `#include` 命令引入。整个过程用术语表述为：*将 `MathFunctions` 添加到 `Tutorial` 的链接库中，将 `Tutorial` 可执行文件描述为 `MathFunctions` 目标的消费者*

### 练习 4 - 子目录
需要注意的是子 cmake 目录中的 `cmakelists.txt` 中的字符串/路径变量相对位置会改变。添加当前文件目录中的文件作为 includePath 时，base_dir 属性可以留空
### cmake 访问修饰符
- `PRIVATE` 属性（也称为“非接口”属性）仅可供拥有它的目标使用，例如 `PRIVATE` 头文件将仅对附加到它们的目标可见。
- `INTERFACE` 属性仅对*链接*拥有目标的那些目标可用。拥有目标本身无法访问这些属性。一个仅限头文件的库是 `INTERFACE` 属性集合的一个例子，因为仅限头文件的库本身不构建任何内容，也不需要访问自己的文件。
- `PUBLIC` 不是一种独立的属性类型，而是 `PRIVATE` 和 `INTERFACE` 属性的并集。因此，使用 `PUBLIC` 描述的需求对于拥有目标和消费目标都可用。

> [!note]
> 不要类比这三个属性和[[C++ Runoob Tutoral#访问修饰符|类访问修饰符]]，protect 的访问范围
> **允许访问的范围：**
> - 类内部成员函数
> - 友元函数/类
> - **派生类成员函数**
> **禁止访问的范围：**
> - 类外部非友元函数
> - 非派生类

### cmake 路径管理
路径管理常用函数/模式：

| 命令类型                  | 作用对象       | 本质作用                     | 影响阶段       | 跨目标传递性 |
|--------------------------|----------------|------------------------------|----------------|--------------|
| include_directories      | 编译器参数     | 添加头文件搜索路径           | 编译阶段       | 可传递       |
| file_set (BASE_DIRS)      | 文件集元数据   | 定义文件基准路径             | 构建配置阶段   | 可传递       |
| target_link_directories  | 链接器参数     | 添加库文件搜索路径           | 链接阶段       | 可传递       |
#### include_directories
本质上是全局添加 `-I` 参数，参考[include_directories — CMake 4.2.0 文档 - CMake 构建系统](https://cmake.com.cn/cmake/help/latest/command/include_directories.html#command:include_directories)
```cmake
# 典型用法
include_directories(
  ${PROJECT_SOURCE_DIR}/include
  ${THIRD_PARTY}/boost
)
```
添加到当前 `CMakeLists` 文件的 [`INCLUDE_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_dir/INCLUDE_DIRECTORIES.html#prop_dir:INCLUDE_DIRECTORIES "INCLUDE_DIRECTORIES") 目录属性中。它们也会被添加到当前 `CMakeLists` 文件**中每个目标**的 [`INCLUDE_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INCLUDE_DIRECTORIES.html#prop_tgt:INCLUDE_DIRECTORIES "INCLUDE_DIRECTORIES") 目标属性中
#### file_set (base_dirs)
在示例代码：
```cmake
target_sources(MathFunctions PRIVATE
	PRIVATE
	MathFunctions/MathFunctions.cxx

	PUBLIC
	FILE_SET mathFunctionsHeaders
	TYPE HEADERS
	BASE_DIRS
	MathFunctions
	FILES
	MathFunctions/MathFunctions.h
)
```
会对 target**添加 `header_set` 和 `interface_header_sets`**，`internalOnlyHeaders` 的值将添加到 [`HEADER_SETS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/HEADER_SETS.html#prop_tgt:HEADER_SETS "HEADER_SETS")，`consumerOnlyHeaders` 将添加到 [`INTERFACE_HEADER_SETS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_HEADER_SETS.html#prop_tgt:INTERFACE_HEADER_SETS "INTERFACE_HEADER_SETS")，而 `publicHeaders` 将添加到两者。
在函数中定义 file_set 之后，作用域仅限于**当前 target**
#### target_link_directories
只会定义**连接器搜索库文件路径**，类似编译器的 `-L` 参数，定义的只是文件夹，而 `target_link_libraries` 定义的是具体链接的库文件名称
## 第 2 步：CMake 语言基础
### 背景
CMake 中的每个对象都是字符串，而列表本身也是**包含分号作为分隔符**的字符串。任何看起来操作非字符串（如布尔值、数字、JSON 对象等）的命令，实际上都是在解析一个字符串
由于 CMakeLang 只有字符串，条件判断完全依赖于约定，即哪些字符串被认为是 true，哪些被认为是 false。这些值“应该”是直观的，“True”、“On”、“Yes”以及（代表）非零数字的字符串是 truthy（真值），而“False”、“Off”、“No”、“0”、“Ignore”、“NotFound”以及空字符串都被认为是 false（假值）。
`cmakelists.txt` 也可以不作为构建配置，而仅仅作为脚本文件，使用 `-P` 选项，告诉 CMake 该文件不包含 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project "project") 命令。我们不构建任何软件，而是仅将 CMake 用作命令解释器。

如这样一段脚本
```cmake
set(stooges "Moe;Larry")
list(APPEND stooges "Curly")

message("Stooges contains: ${stooges}")

foreach(stooge IN LISTS stooges)
  message("Hello, ${stooge}")
endforeach()
```
实现简单列表创建和遍历
### 练习 1 - 宏、函数和列表
[`function()`](https://cmake.com.cn/cmake/help/latest/command/function.html#command:function "function") 和 [`macro()`](https://cmake.com.cn/cmake/help/latest/command/macro.html#command:macro "macro") 都可以“看到”它们上方所有帧中创建的所有变量。然而，[`macro()`](https://cmake.com.cn/cmake/help/latest/command/macro.html#command:macro "macro") 在语义上类似于文本替换，类似于 C/C++ 宏，因此宏产生的任何副作用都会在其调用上下文中可见。如果我们宏中创建或更改了变量，调用者将看到该更改。
[`function()`](https://cmake.com.cn/cmake/help/latest/command/function.html#command:function "function") 会创建自己的变量作用域，因此副作用对调用者不可见。为了将更改传播给调用函数的父级，我们必须使用 `set(<var> <value> PARENT_SCOPE)`

要理解 cmake 的核心：所有对象都是字符串，使用 `${}` 对对象进行解析拓展

> [!note]
> ```cmake
> # 使用宏实现列表后添加元素而不使用list(append )
> macro(MacroAppend ListVar Value)
> endmacro()
> ```
> 函数和宏不是通过值传递，而是通过包含这些值的变量的名称来传递。因此，ListVar 不包含我们需要追加的列表的*值*，它包含的是列表的*名称*，而这个列表名称包含了我们需要追加的值。
> 当使用 `${ListVar}` 扩展变量时，我们将得到列表的名称。如果我们使用 `${${ListVar}}` 扩展该名称，我们将得到列表包含的值。

实现列表添加元素的宏和函数方法是：
```cmake
# TODO1: Implement MacroAppend
macro(MacroAppend ListVar Value)
	set(${ListVar} "${${ListVar}};${Value}")
endmacro()

# TODO2: Call MacroAppend, then return the value from FuncAppend
function(FuncAppend ListVar Value)
	MacroAppend(${ListVar} "${${ListVar}};${Value}")
	set(${ListVar} "${${ListVar}};${Value}" PARENT_SCOPE)
endfunction()
```
### 练习 2 - 条件判断和循环
CMake 中的所有对象都是字符串，因此双引号 `"` 常常是不必要的。但包含空格的字符串需要双引号，否则它们会被视为列表；CMake 会用分号将元素连接起来。