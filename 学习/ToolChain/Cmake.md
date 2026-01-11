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
# 包管理有关
## vcpkg
### 下载速度问题
参考：[vcpkg国内镜像源替换-CSDN博客](https://blog.csdn.net/weixin_41364246/article/details/140123907)
修改国内镜像之后，大部分包能够快速下载，但是不在 github 拖管的包需要自己替换源
# CMake 基本内容教程
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
教程中的完整说明：[[#练习 3 - CMakePresets.json]]
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
但是如果某个变量（无论是用户自定义变量还是 cmake 内置粘性变量）如果在 set 中添加了 FORCE 参数 `set(var_name value FORCE)` 则**配置文件中的这个变量优先级会为最高**
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

# 定义文件集
target_sources(MyLib
  PUBLIC
	src/mylib.cpp
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
教程中的完整内容：[[#练习 3 - CMakePresets.json]]
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
### 练习 1 - 构建可执行文件
 `add_executable()` 命令创建一个目标。在 CMake 的术语中，**目标是开发者为一组属性指定的名称**，分为构建目标和小号目标。构建目标所需属性应使用 `PRIVATE` [作用域关键字](https://cmake.com.cn/cmake/help/latest/manual/cmake-buildsystem.7.html#target-command-scope) 描述，消耗目标所需属性使用 `INTERFACE` 描述，而两者都需要的属性则使用 `PUBLIC` 。三者区别参考：[[#cmake 访问修饰符]]
 目标的本质*只是名称，是此属性集合的句柄。*
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
根据声明/作用域最小化原则，如果语言特性仅在实现文件中使用，则相应的编译特性应为 `PRIVATE`。如果目标的头文件使用这些特性，则应使用 `PUBLIC` 或 `INTERFACE`，*优先 private/interface，然后是 public*

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
### 练习 3 - 使用 include 进行组织
构建过程中 cmake 需要用到的一些工具或者变量分开放置而不是只放在项目相关中的 `CMakeLists.txt` 中，就像组织代码一样讲这些内容放在其他 `.cmake` 文件中，*关注点分离*
使用 `include` 命令讲这些文件引入即可
## 第 3 步：配置和缓存变量
### 背景
我们有一个支持多种压缩算法的压缩软件 CMake 项目，我们可能希望让项目的打包者在构建我们的软件时决定启用哪些算法，可以使用编译选项 `-D` 实现，类似于*条件编译*
```cmake
# option用来设置帮助信息和默认值
option(COMPRESSION_SOFTWARE_USE_ZLIB "Support Zlib compression" ON)
option(COMPRESSION_SOFTWARE_USE_ZSTD "Support Zstd compression" ON)

if(COMPRESSION_SOFTWARE_USE_ZLIB)
  # Same as before
# ...
```
通过 cmake 指令可以覆盖这些选项：
```bash
cmake -B build \
    -DCOMPRESSION_SOFTWARE_USE_ZLIB=ON \
    -DCOMPRESSION_SOFTWARE_USE_ZSTD=OFF
```

> [!warning]
> [`-D`](https://cmake.com.cn/cmake/help/latest/manual/cmake.1.html#cmdoption-cmake-D) 标志和 [`option()`](https://cmake.com.cn/cmake/help/latest/command/option.html#command:option "option") 创建的名称不是普通变量，它们是 **缓存** 变量。缓存变量是全局可见的、_粘性_ 的变量，其值在首次设置后很难更改。以至于在项目模式下，CMake 会在多次配置之间保存和恢复缓存变量。如果一个缓存变量被设置一次，它将保持不变，直到另一个 [`-D`](https://cmake.com.cn/cmake/help/latest/manual/cmake.1.html#cmdoption-cmake-D) 标志覆盖了已保存的变量。
> CMake 本身有几十个用于配置的普通变量和缓存变量。这些变量在 [`cmake-variables(7)`](https://cmake.com.cn/cmake/help/latest/manual/cmake-variables.7.html#manual:cmake-variables\(7\) "cmake-variables(7)") 中进行了文档说明，并且与项目提供的配置变量以相同的方式运行。

[`set()`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set "set") 也可以用来操作缓存变量，但不会更改已创建的变量。
```cmake
# 在type参数位置填上cache string
set(StickyCacheVariable "I will not change" CACHE STRING "")
set(StickyCacheVariable "Overwrite StickyCache" CACHE STRING "")
message("StickyCacheVariable: ${StickyCacheVariable}")
```
结果
```bash
# 直接运行，缓存变量不会在cmakelists中被set修改
cmake -P StickyCacheVariable.cmake
StickyCacheVariable: I will not change

# 但可以诶命令行修改
cmake \
  -DStickyCacheVariable="Commandline always wins" \
  -P StickyCacheVariable.cmake
StickyCacheVariable: Commandline always wins
```
缓存变量通常不能更改，但它们可以被普通变量 *覆盖*。设置一个与缓存变量同名的变量会导致**变量名指向普通变量的值**，使用 `unset` 之后又会指向缓存变量

### 练习 1 - 使用选项
添加可选项：
```cmake
option(TUTORIAL_BUILD_UTILITIES "Build the Tutorial executable" ON)
if(TUTORIAL_BUILD_UTILITIES)
	add_subdirectory(Tutorial)
endif()
```
option 也会添加粘性变量，这样设置可以让最终生成内容中没有可执行文件，只有 lib。有两种更改粘性变量的方法，
- 所有粘性变量都存储在 `/path/to/build/CMakeCache.txt` 中，手动修改重新编译
- 在构建阶段添加粘性变量指令后编译

> [!note]
> 需要注意的是，step 3 中的目录结构发生了变化，分成了三个 cmakelists. txt 构建，每一个都会在 build 中生成对应名称的文件夹，然后在其中分别放入 cmakefiles 文件夹（存储 cmake 版本等信息）和生成器/编译器等平台相关信息，所以 step 1 中 `mathfunctions.lib` 在 `build/Debug` 中，而 step 3 中在 `build/mathfunctions/Debug` 中

### 练习 2 - CMAKE 变量
CMake 提供了几个重要的普通变量和缓存变量，供打包者控制构建。编译器、默认标志、软件包搜索位置等决策都由 CMake 自有的配置变量控制。
语言标准变量 `cmake_cxx_standard` 会对 abi 造成影响，所以不应在他们的 CML 中覆盖或隐藏它们，并且尽量不要全局设置这个变量，会造成命名污染。**打包过程中覆盖标准变量可能导致前面提到难以理解的错误**
这些变量大多可通过配置文件和命令行 `-D` 选项配置
### 练习 3 - CMakePresets.json
Presets 能够表达完整的 CMake 工作流程，从配置到构建，再到安装软件软件包，这次练习仅仅用于配置
命令行标志可以与 presets 混合。命令行标志优先于 preset 中的值。
最常用的方法是用来设置粘性变量
```json
{
  "version": 4,
  "configurePresets": [
    {
      "name": "example-preset",
      "cacheVariables": {
        "EXAMPLE_FOO": "Bar",
        "EXAMPLE_QUX": "Baz"
      }
    },
    {
      // 其他配置
    }
  ]
}
```
## 第 4 步：深入 CMake 目标命令
### 背景
本节不使用的命令
[`get_target_property()`](https://cmake.com.cn/cmake/help/latest/command/get_target_property.html#command:get_target_property "get_target_property") 和 [`set_target_properties()`](https://cmake.com.cn/cmake/help/latest/command/set_target_properties.html#command:set_target_properties "set_target_properties") 命令可以通过名称直接访问目标的属性，甚至可以为任何目标直接附加上属性
```cmake
add_library(Example)
set_target_properties(Example
  PROPERTIES
    Key Value
    Hello World
)

get_target_property(KeyVar Example Key)
get_target_property(HelloVar Example Hello)
```
CMake 语义上有意义的目标属性的完整列表已记录在 [`cmake-properties(7)`](https://cmake.com.cn/cmake/help/latest/manual/cmake-properties.7.html#manual:cmake-properties\(7\) "cmake-properties(7)") 中，但是其中大多数应该使用其专用命令进行修改而不是这样的语意不明函数
[`target_precompile_headers()`](https://cmake.com.cn/cmake/help/latest/command/target_precompile_headers.html#command:target_precompile_headers "target_precompile_headers") 命令接受一个头文件列表，类似于 [`target_sources()`](https://cmake.com.cn/cmake/help/latest/command/target_sources.html#command:target_sources "target_sources")，并从中创建一个预编译头。然后，此预编译头将被强制包含到目标的所有翻译单元中。这对于构建性能可能很有用。
### 练习 1 - 特性和定义
许多库为了兼容多种编译环境，在构建时需要一组最少的必需特性，比如空出 C++标准设置和一些特定编译器的设置
#### target_compile_features
设置的最低C++标准或编译器特性
- **避免全局污染**：不依赖全局变量 `CMAKE_CXX_STANDARD`，而是按目标精确控制语言标准。
- **自动适配编译器**：如果编译器默认支持更高版本，则不强制修改；如果需要，CMake会自动添加启用对应标准的标志（如 `-std=c++20`）。
```cmake
target_compile_features(MyApp PRIVATE cxx_std_20)
```
如果编译器支持更高，则忽略，否则则提出警告。这一做法可以防止打包者**通过 cli 覆盖原本通过 `cmake_cxx_standard()` 的设置**，并且做到目标粒度控制
- **`PRIVATE`**：当前目标的源文件需要此语言标准，但头文件不涉及。
- **`INTERFACE`**：当前目标的头文件需要此语言标准，依赖它的目标必须启用此标准
- **`PUBLIC`**：当前目标的源文件和头文件都需要此标准，依赖目标也必须启用
#### target_compile_definitions
将编译定义描述为目标属性，同样可通过 [[#cmake 访问修饰符]]控制宏的可见性：
- **`PRIVATE`**：宏仅对当前目标的源文件可见
- **`PUBLIC`**：宏对当前目标和依赖它的目标都可见
- **`INTERFACE`**：宏仅对依赖当前目标的目标可见。
**不需要也不应该**在命令行中定义 `target_compile_definitions` 中已经定义过的宏
### 练习 2 - 编译和链接选项
需要精确控制传递给编译和链接行的选项时，需要 [`target_compile_options()`](https://cmake.com.cn/cmake/help/latest/command/target_compile_options.html#command:target_compile_options "target_compile_options") 添加编译选项和 [`target_link_options()`](https://cmake.com.cn/cmake/help/latest/command/target_link_options.html#command:target_link_options "target_link_options") 添加链接选项
给 msvc 和 gcc 设置不同的编译选项
```cmake
# TODO4: Add a compile feature for C++20 support to Tutorial
target_compile_features(Tutorial PRIVATE cxx_std)
if(
	(CMAKE_CXX_COMPILER_ID STREQUAL "MSVC") OR
	(CMAKE_CXX_COMPILER_FRONTEND_VARIANT STREQUAL "MSVC")
)
# TODO9: Add the /W3 compile flag to Tutorial
target_compile_options(Tutorial PRIVATE /W3)

elseif(
	(CMAKE_CXX_COMPILER_ID STREQUAL "GNU") OR
	(CMAKE_CXX_COMPILER_ID MATCHES "Clang")
)
	# TODO10: Add the -Wall compile flag to Tutorial
target_compile_options(Tutorial PRIVATE -Wall)
endif()
```
### 练习 3 - 包含和链接目录
主要是引入 Vendor 库
```cmake
# 首先在Tutorialcmake配置中
target_link_libraries(Tutorial
	PRIVATE
	MathFunctions
	VendorLib
)

# 然后vendor cmake配置中
target_include_directories(VendorLib INTERFACE include)
target_link_directories(VendorLib INTERFACE lib)
target_link_libraries(VendorLib INTERFACE Vendor)
```
1. `target_include_directories(VendorLib INTERFACE include)`，将 `include` 目录添加到 `VendorLib` 目标的头文件搜索路径中。这样，当**其他目标**（如 Tutorial）链接到 `VendorLib` 时，它们就能找到 `Vendor.h` 头文件。
2. `target_link_directories(VendorLib INTERFACE lib)`，将 `lib` 目录添加到库文件搜索路径中。
3. `target_link_libraries(VendorLib INTERFACE Vendor)` 告诉 CMake 将名为 `Vendor` 的库链接到 `VendorLib`。忽略后缀，cmake 会根据平台特性自动链接
使用 `INTERFACE` 关键字意味着任何链接到 `VendorLib` 的目标也会继承这个包含目录。

## 第 5 步：深入 CMake 库概念
库有很多不同的形式。有静态库、共享库、模块库、对象库、仅头文件库，以及描述要由其他目标继承的高级 CMake 属性的库
### 练习 1 - 静态库和共享库
虽然 [`add_library()`](https://cmake.com.cn/cmake/help/latest/command/add_library.html#command:add_library "add_library") 命令支持显式设置 `STATIC` 或 `SHARED`，并且这有时是必要的，但最好将第二个参数留空，以便大多数“普通”库可以作为两者使用，具体取决于 [`BUILD_SHARED_LIBS`](https://cmake.com.cn/cmake/help/latest/variable/BUILD_SHARED_LIBS.html#variable:BUILD_SHARED_LIBS "BUILD_SHARED_LIBS") 的值。如果 [`BUILD_SHARED_LIBS`](https://cmake.com.cn/cmake/help/latest/variable/BUILD_SHARED_LIBS.html#variable:BUILD_SHARED_LIBS "BUILD_SHARED_LIBS") 为 true，将创建一个 `SHARED` 库，否则将创建 `STATIC` 库，不定义的情况下生成静态库
cmake 不允许类似
```cmake
add_library(MyLib STATIC)
add_library(MyLib SHARED)
```
因为目标名称是唯一的，这样并不会同时编译出两个库类型的文件，正确的方法是通过[[#文件集特性简要介绍|文件集]] /或者其他变量将两种情况下的文件收集起来，分别构建两个目标
所用到的命令：
```bash
cmake --preset tutorial -DBUILD_SHARED_LIBS=ON  # 构建动态库
cmake --build .\build\ -t MathFunctions # 只编译MathFunctions库
```
### 练习 2 - 接口库
#### 背景
接口库是指仅为其他目标通信使用要求，**自身不构建或生成任何文件的库**所以不需要 `target_link_libraries` 链接。因此，接口库的所有属性本身都必须是接口属性，**必须使用 `INTERFACE`** [作用域关键字](https://cmake.com.cn/cmake/help/latest/manual/cmake-buildsystem.7.html#target-command-scope) 指定。
C++ 开发中最常见的接口库类型是仅头文件库。此类库不构建任何内容，只提供发现其头文件所需的标志。
在之前关于 [`target_sources(FILE_SET)`](https://cmake.com.cn/cmake/help/latest/command/target_sources.html#command:target_sources "target_sources(file_set)") 的[[#target_source 添加文件|讨论]] 中，如果文件集的名称与其类型相同，则可以省略 `TYPE` 参数。将当前源目录用作唯一的基目录，则可以省略 `BASE_DIRS` 参数。
这里引入第三个快捷方式：只有在计划安装头文件（例如库的公共头文件）时，才需要包含 `FILES` 参数。这里安装头文件库，所以不需要

#### 为什么需要接口库
**头文件库的依赖管理**
- **场景**：若项目依赖一个仅头文件的库（如 `Eigen`、`fmt`），这些库通常通过 `find_package()` 或 `target_link_libraries()` 引入。
- **问题**：传统方式需要手动设置头文件路径（`include_directories()`）和编译标志（`add_definitions()`），容易出错。
- **解决方案**：使用接口库封装这些元数据，直接通过 `target_link_libraries()` 传递依赖。
**统一编译标准**
- **场景**：多个库或可执行文件需要一致的编译标准（如 `C++17`）。
- **问题**：手动设置每个目标的 `target_compile_features()` 或 `CMAKE_CXX_STANDARD` 会导致重复代码。
- **解决方案**：创建接口库定义编译标准，其他目标链接该接口库即可继承标准。
**传递依赖关系**
- **场景**：库 `A` 依赖库 `B`，可执行文件 `App` 依赖库 `A`。
- **问题**：若库 `A` 使用 `PRIVATE` 作用域链接 `B`，`App` 无法自动继承 `B` 的依赖。
- **解决方案**：库 `A` 使用 `PUBLIC` 或 `INTERFACE` 作用域链接 `B`，`App` 链接 `A` 时自动继承 `B` 的依赖。
#### 本质
将头文件路径、编译标志、依赖库等元数据封装为一个目标（Target）避免硬编码路径，供其他目标继承，自动传递依赖

创建接口库只需要将**仅头文件库的所有头文件放入一个文件夹（不需要是工作目录）中**，然后添加一个 cmake 配置
```cmake
add_library(MyHeaderOnly INTERFACE)

target_include_directories(MyHeaderOnly INTERFACE ${PROJECT_SOURCE_DIR}/path/to/headers)  # 这个目录中都是头文件

# 或者这样
target_sources(MathLogger INTERFACE
	FILE_SET HEADERS
)

# 添加编译选项
target_compile_features(MyHeaderOnly INTERFACE cxx_std_17)
target_compile_definitions(MyHeaderOnly INTERFACE MY_HEADER_ONLY_ENABLED)
```
然后直接在项目中使用
```cmake
target_link_libraries(MyApp PRIVATE MyHeaderOnly)
```
就能像普通的库一样使用这个库
### 练习 3 - 对象库
#### 本质
对象库是 CMake 中一种特殊的库类型，**仅生成编译后的对象文件（`.o` 或 `.obj`）给其他库使用，不打包成静态库或动态库**。它的核心作用是**复用编译结果**，避免重复编译源文件。
如果一个对象库出现在目标的 [`INTERFACE_LINK_LIBRARIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_LINK_LIBRARIES.html#prop_tgt:INTERFACE_LINK_LIBRARIES "INTERFACE_LINK_LIBRARIES") 中，那么链接该目标的依赖项将不会“看到”这些对象。**如果目标 A 链接了对象库 B**，目标 A 的依赖项 C 在链接目标 A 时，**无法自动继承对象库 B 的内容（头文件和实现）**。原因就是他只会生成（`.o` 或 `.obj`），不能被链接。在这种情况下，对象库将表现得像一个 `INTERFACE` 库。在一般情况下，对象库仅适用于通过 [`target_link_libraries()`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries "target_link_libraries") 进行 `PRIVATE` 或 `PUBLIC` 消费（显式声明依赖传递）。

#### 具体实现
##### 插件系统实现
不同团队同时开发一个应用的不同插件：
![[PixPin_2026-01-09_21-45-32.png]]
```cmake
# 主配置中：
add_subdirectory(OpAdd)
add_subdirectory(OpMul)
add_subdirectory(OpSub)

# 每一个功能模块配置：
add_library(OpAdd OBJECT)

target_sources(OpAdd
  PRIVATE
    OpAdd.cxx

  INTERFACE
    FILE_SET HEADERS
    FILES
      OpAdd.h
)
```
声明一个对象库，然后在其中添加源文件和头文件，源文件由于**只会被当前对象库使用，所以使用 private**，头文件**需要被消费者使用，所以使用 interface**，最终只会编译成 `.o/obj` 文件（msvc 编译器在没有指定情况下还是会编译出 lib），在链接过程中会使用
然后主库配置文件将所有插件对象库合并链接到 MathFunction 库中
```cmake
target_link_libraries(MathFunctions PRIVATE MathLogger)
target_link_libraries(MathFunctions
	PUBLIC
	OpAdd
	OpMul
	OpSub
)
```
##### 减少重复编译
每个目标文件中的源文件改动，都需要在编译时**重新编译**，而如果有多个目标使用了同一套工具函数，那么现在有两种方法来让代码复用：
1. 静态库
```cmake
add_library(Utils STATIC utils.cpp)  # 编译 utils.cpp -> utils.obj -> Utils.lib

# 需要使用时链接到多个可执行文件
add_executable(exe_a main_a.cpp)
target_link_libraries(exe_a PRIVATE Utils)

add_executable(exe_b main_b.cpp) 
target_link_libraries(exe_b PRIVATE Utils)

# 不要这样写，这样会导致每一个可执行对象编译时都编译出一个utils.o，浪费CPU
add_executeble(exe_a main_a.cpp utils.cpp)
add_executeble(exe_b main_b.cpp utils.cpp)
```
2. 对象库
```cmake
add_library(Utils OBJECT utils.cpp)  # 编译 utils.cpp -> utils.obj

# 链接到多个可执行文件
add_executable(exe_a main_a.cpp $<TARGET_OBJECTS:Utils>)
add_executable(exe_b main_b.cpp $<TARGET_OBJECTS:Utils>)
```
构建最终可执行文件/库文件的行为对比：
静态库：
- 链接器从 `Utils.lib` 中提取需要的符号
- 每个可执行文件都链接到完整的 `Utils.lib`
- 如果 `Utils.lib` 很大并且由单个源文件编译而成，但可执行文件只使用其中一小部分，仍然会链接整个库，**主要成本在提取符号和链接过程中**
- 这个问题可以通过编译选项/连接选项/编译器剪裁优化避免（参考：[AI回答](https://chat.qwen.ai/s/t_76de4fa8-8c9f-450a-a83c-29ad172a3d79?fev=0.1.32)）

对象库：
- 直接将 `utils.obj` 中的符号合并到最终可执行文件中
- 没有中间的库文件，直接操作对象文件
资源管理和利用层面对比：
静态库：
- 如果构成静态库文件较多，每次修改都会导致整个静态库重新编译，模块化/粒度不够细，浪费 CPU 资源
- 资源管理上很集中，没有较细的逻辑分组（通常很多工具函数很难在逻辑上分类），只能最终合并为一个静态库
对象库：
- 在通用模块函数能够被逻辑分类或由多个团队并行开发时，使用对象库能够减少编译/开发时间，降低沟通成本
- 高度模块化，拆分/变更方便
## 第 6 步：深入系统自省
### 背景
CMake 的**系统自省**是指通过编译和运行小型测试程序，**自动检测目标系统和工具链的特性**，大部分名称前缀为 `Check` 并需要使用 `include()` 引入。这确保项目在不同平台和编译器环境下能够正确配置和构建实现跨平台兼容性
比如判断当前平台/环境是否支持 C++17
```cmake
include(CheckCXXCompilerFlag)
check_cxx_compiler_flag(-std=c++17 COMPILER_SUPPORTS_CXX17) # 成功编译设置COMPILE_SUPPORTS_CXX17变量为true
if(COMPILER_SUPPORTS_CXX17)
  target_compile_options(my_target PRIVATE -std=c++17)
endif()
```
本质上是成成一个使用了 `[[nodiscard]]` 特性的 cpp 程序，检测能够通过编译
常见的系统自省函数有：

| **模块**                 | **用途**                  |
| ---------------------- | ----------------------- |
| `CheckCXXCompilerFlag` | 检测编译器标志是否支持             |
| `CheckIncludeFileCXX`  | 检测 C++ 头文件是否存在          |
| `CheckFunctionExists`  | 检测函数是否存在于链接库中           |
| `CheckSymbolExists`    | 检测特定符号（如宏、变量）是否存在       |
| `CheckTypeSize`        | 检测数据类型大小（如 `size_t`）    |
| `TestBigEndian`        | 检测系统是否为大端（Big Endian）   |
| `CheckIncludeFiles`    | 检查一个或多个 C/C++ 头文件       |
| `CheckCompilerFlag`    | 检查编译器是否支持给定的标志          |
| `CheckSourceCompiles`  | 检查源代码是否可以为给定的语言进行构建     |
| `CheckIPOSupported`    | 检查编译器是否支持过程间优化（IPO/LTO） |
高度定制化，或者只针对某些库的特定版本的特性需要自定义自省模块和测试函数
### 练习 1 - 检查包含文件
```cmake
include(CheckIncludeFiles)
check_include_files(emmintrin.h HAS_EMMINTRIN LANGUAGE CXX)
if(HAS_EMMINTRIN)
	target_compile_definitions(MathFunctions PRIVATE TUTORIAL_USE_SSE2)
endif()
```
使用这样一段代码查找 `emmintrin.h` 文件是否存在，如果存在则会在 cmake **构建过程（注意不是编译过程，提早了）** 中看到头文件被找到的信息：
```bash
-- Selecting Windows SDK version 10.0.26100.0 to target Windows 10.0.22000.
-- Looking for include file emmintrin.h
-- Looking for include file emmintrin.h - found
-- Configuring done (4.3s)
-- Generating done (0.1s)
-- Build files have been written to: D:/Download/cmake-4.2.0-tutorial-source/Step6/build
```
### 练习 2 - 检查源文件编译
检查编译器内建函数（GNU 内建函数是否存在）
```cmake
include(CheckSourceCompiles)
check_source_compiles(CXX
  "
    int main() {
      int a, b, c;
      __builtin_add_overflow(a, b, &c);
    }
  "
  HAS_CHECKED_ADDITION
)
```
由于自省本质上是构建可执行程序检查编译结果，所以必须提供一个 main 函数
### 练习 3 - 检查过程间优化
过程间优化和链接时优化可以为某些软件提供显著的性能提升
```cmake
include(CheckIPOSupported)
check_ipo_supported() # fatal error if IPO is not supported
set_target_properties(MyApp
  PROPERTIES
    INTERPROCEDURAL_OPTIMIZATION TRUE
)
```
## 第 7 步：自定义命令和生成文件
#未完成 感觉没什么用，暂时跳过
### 背景
构建过程中的任何步骤通常都可以用其输入和输出来描述。CMake 假定代码生成器和其他自定义过程遵循相同的原则。这样，代码生成器就与编译器、链接器和其他工具链元素一样运行；当输入比输出新（或输出不存在）时，将运行用户指定的命令来更新输出。
核心是 **通过 `add_custom_command()` 和 `add_custom_target()` 实现代码生成**，并将其集成到项目构建流程中

## 第 8 步：测试与 CTest
### 背景
其核心是，CTest 是一个任务启动器，它运行命令并报告它们返回零值还是非零值。我们将在这个层面上与 CTest 打交道。
CMake 通过 [`enable_testing()`](https://cmake.com.cn/cmake/help/latest/command/enable_testing.html#command:enable_testing "enable_testing") 和 [`add_test()`](https://cmake.com.cn/cmake/help/latest/command/add_test.html#command:add_test "add_test") 命令与 CTest 直接集成。这些命令使 CMake 能够在构建文件夹中设置必要的基础设施
测试命令：
```bash
# 运行所有可用的测试。
ctest --test-dir build
# 正则表达式运行特定测试。
ctest --test-dir build -R SpecificTest
```
### 练习 1 - 添加测试
具体建立测试步骤为：
1. 在根目录中使用 `enable_testing()`
2. 需要测试位置像创建一个可执行程序一样 `add_executable`，链接文件/库之后，为每一个测试编写 `add_test()`，并在其中声明 `NAME` 和 `COMMAND`，COMMAND 的用法就是命令行程序的用法，比如命令行程序名为 `main.exe`，那么 `add_test` 应该写成
```cmake
add_test(
	NAME name
	COMMAND ${ProjectName} --option=on --number=10
)
```
3. 编写测试程序
4. 在 `add_executable` 目标位置创建带入口函数的源文件，一般根据入口函数返回值是否为 0 判断测试是否通过
## 第 9 步：安装命令与概念
工程文件中构建/代码结构树通常比较复杂，这种将构建树中的构件移动到适合使用者使用的最终布局的操作称为安装
### 背景
所有 CMake 安装都通过一个单一命令 [`install()`](https://cmake.com.cn/cmake/help/latest/command/install.html#command:install "install") 来完成，该命令又细分为负责安装过程各个方面的多个子命令。**对于基于目标的 CMake 工作流程**，通常足以依赖安装目标本身，使用 [`install(TARGETS)`](https://cmake.com.cn/cmake/help/latest/command/install.html#targets "install(targets)")，而不是通过 [`install(FILES)`](https://cmake.com.cn/cmake/help/latest/command/install.html#files "install(files)") or [`install(DIRECTORY)`](https://cmake.com.cn/cmake/help/latest/command/install.html#directory "install(directory)")手动移动文件
install 命令会自动寻找 cmake 中配置的头文件，库文件所在的位置信息，这就是为什么需要向将要安装的头文件集合（[[#练习 2 - 构建库]]，[[#练习 2 - 接口库]]）添加 `FILES`
cmake 对大部分构件类型都有默认的安装位置

| 目标类型                  | 变量                            | 内置默认值   |
| --------------------- | ----------------------------- | ------- |
| RUNTIME               | `${CMAKE_INSTALL_BINDIR}`     | bin     |
| LIBRARY               | `${CMAKE_INSTALL_LIBDIR}`     | lib     |
| ARCHIVE               | `${CMAKE_INSTALL_LIBDIR}`     | lib     |
| PRIVATE_HEADER        | `${CMAKE_INSTALL_INCLUDEDIR}` | include |
| PUBLIC_HEADER         | `${CMAKE_INSTALL_INCLUDEDIR}` | include |
| FILE_SET（类型为 HEADERS） | `${CMAKE_INSTALL_INCLUDEDIR}` | include |
CMake 默认不定义 `CMAKE_INSTALL_<dir>` 变量。如果项目希望指定安装到这些位置的某个子目录，则必须包含 [`GNUInstallDirs`](https://cmake.com.cn/cmake/help/latest/module/GNUInstallDirs.html#module:GNUInstallDirs "GNUInstallDirs") 模块，该模块将为所有尚未定义的 `CMAKE_INSTALL_<dir>` 变量提供值。

### 练习 1 - 安装构件
在需要导出可执行文件/库文件的位置添加
```cmake
install(
	TARGETS <target_name>
	FILE_SET HEADERS
	DESTINATION lib_name/include
)
```
- file_set 指定头文件导出目录，cmake 通过目标的 `target_include_directories()` 中，通过 `INSTALL_INTERFACE` 指定（public 或者 interface 访问修饰符修饰的）的头文件路径，并将其包含在安装流程中声明目标提供的头文件。
- 不使用 file_set 则只会安装二进制文件
根据[[#第 9 步：安装命令与概念#背景]]中的构建默认安装位置变量，可以知道通过
`cmake --install ./build/ --prefix ./install/ --config Debug` 会将库中的二进制文件安装在 `./install/lib` ，头文件安装在 `./install/include` 中
![[PixPin_2026-01-10_11-15-36.png]]
配置完成后用户就能通过 `cmake --install` 命令将项目安装到对应的位置并使用了
### 练习 2 - 导出目标
但是对于库，使用[[#练习 1 - 安装构件]]的配置并不能实现要求，有些库在安装之后文件结构比较复杂，如果需要使用这些库需要在导入项目中使用很多 `target_link/include_XXX` 来指定文件路径，非常麻烦
导出目标用来**将 CMake 项目中的目标（如库或可执行文件）导出为可重用的配置文件**，以便其他项目可以通过 `find_package()` 直接使用这些目标，由于 `find_package` 实际上会查找对应库的 `Config.cmake` 配置文件并引入，所以导出目标就需要设置这些内容
install 命令本质上只是在做定义工作，真正的导出文件行为会在使用 `install` 命令时执行
#### install (TARGETS ...) 定义目标
本质上是在**对目标定义安装规则**，这时候并没有安装，只用使用 `install(files)` 命令才会安装
```cmake
install(
  TARGETS MyApp MyLib
  # EXPORT MyProjectTargets
  # FILES ${PROJECT_NAME}Target.cmake
)
```
- 将 `MyApp` 和 `MyLib` **目标标记为可导出**（这一步实际上目标并没有导出），并生成一个导出集（Export Set）`MyProjectTargets`。名为 `<ExportName>.cmake` 的文件，位于提供的 `DESTINATION` 中
- 在构建时，CMake 会记录这些目标的元信息（如库路径、头文件路径、依赖关系）。
- 如果添加了 EXPORT 参数或者再写一个 [[ #install (EXPORT ...) 生成目标导出文件|install(export)]] 就会在定义的同时导出。在安装时，这些信息会被写入 `MyProjectTargets.cmake` 文件。
- 如果添加了 FILES，则**本质上只是在自定义导出文件名称**
#### install (EXPORT ...) 生成目标导出文件
本质是将目标的 cmake 配置信息**导出到对应的 target.cmake**文件中，最终在这个库被 find_package 找到时被因为 `include(XXXtarget.cmake)` 而读取这个库的配置
```cmake
include(GNUInstallDirs)

install(
  EXPORT MyProjectTargets
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/MyProject
  NAMESPACE MyProject::
)
```
- **参数解释**：
  - `EXPORT MyProjectTargets`：引用之前标记的导出集。
  - `DESTINATION ...`：指定导出文件的安装路径（通常是 `/usr/local/lib/cmake/MyProject`），注意这里生成的是 `target.cmake` 文件，这个文件**最终会被对应 `Config.cmake` 文件使用 `include` 引入**
  - `NAMESPACE MyProject::`：为导出的目标添加命名空间前缀（在链接时需要引入 `MyProject::MyLib`）。
- **生成文件**：在安装时生成 `MyProjectTargets.cmake`，内容类似：
```cmake
add_library(MyProject::MyLib STATIC IMPORTED)
set_target_properties(MyProject::MyLib PROPERTIES
    IMPORTED_LOCATION "/usr/local/lib/libMyLib.a"
    INTERFACE_INCLUDE_DIRECTORIES "/usr/local/include"
)
```
#### install(FILES src_file ... ) 安装
由于教程中的 Config.cmake 文件是手写的，才会有这一步，这一步本质上用于**手动将手写的 Config.cmake**添加到安装过程中，实际工程中常用[[#安装 Config.cmake 文件的其他方法|自动编写Config.cmake的方法]]
```cmake
# 工作目录中的cmake/MyProjectConfig.cmake，其中include target.cmake文件
include(${CMAKE_CURRENT_LIST_DIR}/MyProjectTargets.cmake)
# 主配置文件中说明这个Config.cmake配置文件将会被安装在什么位置
install(
  FILES cmake/MyProjectConfig.cmake
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/MyProject
)
```
- **作用**：
  - `MyProjectConfig.cmake` 是入口文件，其他项目通过 `find_package(MyProject)` 会自动加载它。 `find_package()` 查找路径一般在库目录的。project_name/lib/cmake/lib_name/lib_nameConfig.cmake 文件位置
  - 变量 [`CMAKE_CURRENT_LIST_DIR`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_CURRENT_LIST_DIR.html#variable:CMAKE_CURRENT_LIST_DIR "CMAKE_CURRENT_LIST_DIR") 指定当前**正在运行**的 CMake 语言文件所在的目录，无论该文件是如何包含或启动的
  - 通过 `include(...)` 引入目标导出文件，使目标可用。
- **安装路径**：`/usr/local/lib/cmake/MyProject/MyProjectConfig.cmake`

### 练习 3 - 导出版本文件
#### 背景
当从目标导出文件导入 CMake 目标时，没有办法“退出”或“撤销”该操作。如果发现包的版本不正确或不兼容，解决问题的方法是使用一个轻量级版本文件，该文件仅描述版本兼容性信息，可以在 CMake 完全导入文件之前进行检查。
CMake 提供了帮助模块和脚本来生成这些版本文件，即 [`CMakePackageConfigHelpers`](https://cmake.com.cn/cmake/help/latest/module/CMakePackageConfigHelpers.html#module:CMakePackageConfigHelpers "CMakePackageConfigHelpers") 模块，通过下面代码来生成版本文件
```cmake
include(CMakePackageConfigHelpers)

write_basic_package_version_file(
	${CMAKE_CURRENT_BINARY_DIR}/MyProjectConfigVersion.cmake
	COMPATIBILITY ExactVersion
)

# 生成内容大概是这样的：
# MyProjectConfigVersion.cmake
set(PACKAGE_VERSION "1.2.3")

if(PACKAGE_VERSION VERSION_LESS PACKAGE_FIND_VERSION)
  set(PACKAGE_VERSION_COMPATIBLE FALSE)
else()
  set(PACKAGE_VERSION_COMPATIBLE TRUE)
  if(PACKAGE_FIND_VERSION_MAJOR STREQUAL "1"
     AND NOT PACKAGE_VERSION VERSION_EQUAL PACKAGE_FIND_VERSION)
    set(PACKAGE_VERSION_EXACT FALSE)
  endif()
endif()
```
`COMPATIBILITY` 参数定义版本兼容性规则，决定哪些版本被认为是兼容的：

|**选项**|**含义**|
|---|---|
|**`AnyNewerVersion`**|允许任何更新的版本（如 `1.2.0` 兼容 `1.1.0`）。|
|**`SameMajorVersion`**|要求主版本号相同（如 `1.2.0` 兼容 `1.3.0`，但不兼容 `2.0.0`）。|
|**`SameMinorVersion`**|要求主版本号和次版本号相同（如 `1.2.3` 兼容 `1.2.5`，但不兼容 `1.3.0`）。|
|**`ExactVersion`**|必须完全匹配版本号（如 `1.2.3` 仅兼容 `1.2.3`）。|

`ARCH_INDEPENDENT` 参数- 标记包为架构无关（如纯头文件库、Python 包等），不依赖特定机器架构。
```cmake
write_basic_package_version_file(
	MyProjectConfigVersion.cmake
	COMPATIBILITY SameMajorVersion
	ARCH_INDEPENDENT
)
```
配置完后将这个文件安装
```cmake
install(
  FILES ${CMAKE_CURRENT_BINARY_DIR}/MyProjectConfigVersion.cmake
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/MyProject
)
```
### 额外知识
#### 安装构建的其他方法
使用 install 命令安装在需要精细控制库文件的安装位置时没法动态变化，可能会需要手动维护头文件列表：
```cmake
install(FILES ${PROJECT_SOURCE_DIR}/include/math_functions.h
  DESTINATION include
)
```
更好的方法是在构建目标时指定，使用 `target_include_directories()`
```cmake
target_include_directories(MathFunctions
  PUBLIC
    ${PROJECT_SOURCE_DIR}/include
    $<INSTALL_INTERFACE:include>  # 声明头文件安装路径
)
# 在安装时可读性强很多
install(TARGETS MathFunctions
  ARCHIVE DESTINATION lib
  INCLUDES DESTINATION include  # 配合 INSTALL_INTERFACE 使用
)
```
#### 安装 Config.cmake 文件的其他方法
除了使用 `install` 命令引入**手动编写的 Config.cmake**文件（教程中其实也就有 `include(XXXtarget.cmake)` 这样的内容），还可以通过 `configure_package_config_fie()` 函数实现自动编写
```cmake
include(GNUInstallDirs)
configure_package_config_file(
    ${PROJECT_SOURCE_DIR}/${PROJECT_NAME}Config.cmake.in
    ${PROJECT_BINARY_DIR}/${PROJECT_NAME}Config.cmake
    INSTALL_DESTINATION lib/cmake
    PATH_VARS INCLUDE_DIRS LIBRARIES LIB_DIR
    INSTALL_PREFIX ${CMAKE_INSTALL_PREFIX}/${PROJECT_NAME}
)
```
#### 构建可导出的目标总体方法
总体目的是：将 CMake 项目中的库文件、头文件和构建配置信息导出为可重用的模块，使其他项目通过 `find_package()` 即可直接使用这些库
1. 项目配置阶段
- 定义项目和版本：
```cmake
cmake_minimum_required(VERSION 3.14)
project(MyProject VERSION 1.2.3)  # 定义项目名称和版本
```
- 创建目标（库或可执行文件）：
```cmake
add_library(MyLib STATIC src/mylib.cpp)
target_include_directories(MyLib PUBLIC include)  # 声明头文件目录
```
2. 导出目标（Export Targets）
- 标记目标为可导出：
```cmake
install(
	TARGETS MyLib
	EXPORT MyProjectTargets  # 标记目标为可导出
	FILE_SET HEADERS  # 如果有头文件则需要这一步
)
```
- 生成目标导出文件（`MyProjectTargets.cmake`）：
```cmake
include(GNUInstallDirs)  # 获取标准安装路径（如 lib/cmake）
install(
	EXPORT MyProjectTargets
	DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/MyProject  # 安装路径
	NAMESPACE MyProject::  # 添加命名空间前缀（如 MyProject::MyLib）
)
```
> [!warning]
> 这两步顺序不能反过来

3. 生成版本兼容性文件
- 创建版本检查文件（`MyProjectConfigVersion.cmake`）：
```cmake
include(CMakePackageConfigHelpers)
write_basic_package_version_file(
	${CMAKE_CURRENT_BINARY_DIR}/MyProjectConfigVersion.cmake
	COMPATIBILITY SameMajorVersion  # 兼容性规则
)
```
4. 创建入口配置文件
- 编写 `MyProjectConfig.cmake`：
```cmake
# cmake/MyProjectConfig.cmake
# 引入所有目标导出文件
include(${CMAKE_CURRENT_LIST_DIR}/MyProjectTargets.cmake)
```
- 安装 `Config.cmake` 和版本文件：
```cmake
install(
	FILES
	${CMAKE_CURRENT_BINARY_DIR}/MyProjectConfigVersion.cmake
	cmake/MyProjectConfig.cmake
	DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/MyProject
)
```
5. 安装头文件
- 安装头文件到标准路径：
```cmake
install(
	DIRECTORY include/
	DESTINATION include  # 头文件安装到 /usr/local/include/
)
```
这条命令会将所有 cmake 在 include 路径中扫描到的头文件放在这个 destination 位置，如果 DIRECTORY 中的有头文件在其他位置使用了 `target_include_directories()` 添加到指定位置则会被忽略，之后通常就能通过：
```cmake
# 其他项目的 CMakeLists.txt
find_package(MyProject 1.2.0 REQUIRED)  # 自动加载 MyProjectConfig.cmake
target_link_libraries(MyApp PRIVATE MyProject::MyLib)  # 使用导出的目标
```
引入库，前提是 find_package 可以下面的路径找到对应的 Config.cmake 文件
1. 环境变量
2. cmake 内定义的 `cmake_prefix_path` **路径列表中的一条**指向位置
## 第 10 步：查找依赖项
对于正确打包的项目，无需使用管理依赖的高级工具。如今，许多流行的库和实用程序项目都会生成正确的安装树，在[[#第 9 步：安装命令与概念|这种理想环境]]下，我们只需要[`find_package()`](https://cmake.com.cn/cmake/help/latest/command/find_package.html#command:find_package "find_package") 将依赖项导入到我们的项目中，除此之外，还有：
- [`find_file()`](https://cmake.com.cn/cmake/help/latest/command/find_file.html#command:find_file "find_file")查找并报告指定文件的完整路径，这是`find`命令中最灵活的。
- [`find_library()`](https://cmake.com.cn/cmake/help/latest/command/find_library.html#command:find_library "find_library")查找并报告静态归档或共享对象的完整路径，适用于与[`target_link_libraries()`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries "target_link_libraries")一起使用。
- [`find_path()`](https://cmake.com.cn/cmake/help/latest/command/find_path.html#command:find_path "find_path")查找并报告*包含*文件的目录的完整路径。这通常与[`target_include_directories()`](https://cmake.com.cn/cmake/help/latest/command/target_include_directories.html#command:target_include_directories "target_include_directories")结合用于查找头文件。
- [`find_program()`](https://cmake.com.cn/cmake/help/latest/command/find_program.html#command:find_program "find_program")查找并报告程序的可调用名称或路径。通常与[`execute_process()`](https://cmake.com.cn/cmake/help/latest/command/execute_process.html#command:execute_process "execute_process")或[`add_custom_command()`](https://cmake.com.cn/cmake/help/latest/command/add_custom_command.html#command:add_custom_command "add_custom_command")结合使用。

这些命令应被视为“备用”选项，当主要的查找命令不适用时使用。主要的查找命令是[`find_package()`](https://cmake.com.cn/cmake/help/latest/command/find_package.html#command:find_package "find_package")。它使用全面的内置启发式方法和上游提供的打包文件，为请求的依赖项提供最佳接口。

### 练习 1 - 使用 find_package()
[`find_package()`](https://cmake.com.cn/cmake/help/latest/command/find_package.html#command:find_package "find_package") 通过 `<PackageName>_FOUND` 变量报告其结果，对于找到和未找到的包，该变量将分别设置为真或假值。
这一练习在练习前使用构建/编译命令可以通过编译，而更改代码后不能通过，因为 install/lib/cmake 中没有 SimpleTestConfig.cmake
#### find_package 详解
参考：[find_package — CMake 4.2.0 文档 - CMake 构建系统](https://cmake.com.cn/cmake/help/latest/command/find_package.html#command:find_package)
核心参数：
```cmake
find_package(<PackageName> [version] [EXACT] [REQUIRED] [QUIET] [MODULE] [COMPONENTS <components>...] [OPTIONAL_COMPONENTS <components>...])
```

| **参数**                    | **作用**                                           |
| ------------------------- | ------------------------------------------------ |
| **`[version]`**           | 指定最小版本号（如 `1.2.0`）。                              |
| **`EXACT`**               | 要求版本号**完全匹配**（如 `1.2.0` 仅匹配 `1.2.0`）。            |
| **`REQUIRED`**            | 如果未找到包或版本不兼容，直接报错并终止构建。                          |
| **`QUIET`**               | 禁用非必要输出（如“Found”消息），但错误信息仍会显示。                   |
| **`MODULE`**              | 强制使用 **模块模式**（即查找 `Find<PackageName>.cmake` 文件）。 |
| **`COMPONENTS`**          | 指定需要查找的组件（如 `Boost` 的 `system`、`filesystem`）。    |
| **`OPTIONAL_COMPONENTS`** | 指定可选组件，即使未找到也不会报错。                               |

#### 两种查找模式
CMake 支持两种查找包的方式：**模块模式（Module Mode）** 和 **配置模式（Config Mode）**。
1. 模块模式（Module Mode）
	- **原理**：通过 `Find<PackageName>.cmake` 脚本定义查找逻辑
	- **使用场景**：查找系统自带的通用库（如 `FindBoost.cmake`）
	- 需要手动编写 `Find<PackageName>.cmake` 文件。
	- 通常通过 `CMAKE_MODULE_PATH` 指定查找路径。
	- 查找路径为：
		1. `CMAKE_MODULE_PATH` 用户自定义的模块路径（通过 `set(CMAKE_MODULE_PATH ...)` 设置）
		2. CMake 内置模块路径，CMake 安装目录下的 `share/cmake-<version>/Modules/`（如 `FindBoost.cmake`）
```cmake
# 设置模块路径
set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "${PROJECT_SOURCE_DIR}/cmake/Modules/")

find_package(Boost 1.70.0 REQUIRED)
```
2. 配置模式（Config Mode）
	- **原理**：通过 `<PackageName>Config.cmake` 或 `<lowercasePackageName>-config.cmake` 文件定义配置信息
	- **使用场景**：查找通过 `install()` 导出的项目（如 `MyProjectConfig.cmake`）
	- 由项目自行生成并安装配置文件（如 `MyProjectConfig.cmake`）
	- 无需手动编写查找脚本
	- 查找路径为:
		1. 在 [`CMAKE_FIND_PACKAGE_REDIRECTS_DIR`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_PACKAGE_REDIRECTS_DIR.html#variable:CMAKE_FIND_PACKAGE_REDIRECTS_DIR "CMAKE_FIND_PACKAGE_REDIRECTS_DIR") 目录中查找 Config.cmake
		2. `<PackageName>_DIR`：用户手动设置的路径（如 `set(MyProject_DIR /usr/local/lib/cmake/MyProject)`）
		3. 环境变量 `CMAKE_PREFIX_PATH` 多个路径的集合（如 `export CMAKE_PREFIX_PATH=/usr/local:/opt/mylib`）
		4. 系统标准路径 `/usr/local/lib/cmake/MyProject/` ，`/usr/lib/cmake/MyProject/`，`C:/Program Files/MyProject/lib/cmake/MyProject/`（Windows）
		5. 更为细致的搜索路径参考 [find_package#Config模式搜索过程](https://cmake.com.cn/cmake/help/latest/command/find_package.html#config-mode-search-procedure)
> [!note]
> 在 find_package 中的模块前添加 `CONFIG` / `MODULE` 可以显示指定查找方式
### 练习 2 - 传递性依赖
库经常相互构建，链式依赖，为表达这种传递性依赖需求，通过[`CMakeFindDependencyMacro`](https://cmake.com.cn/cmake/help/latest/module/CMakeFindDependencyMacro.html#module:CMakeFindDependencyMacro "CMakeFindDependencyMacro")模块来实现这一点，该模块提供了一种安全机制，供已安装的包递归地发现彼此。
主要的目的是：A 依赖了 B，C，但 B 也依赖 C（A->B->C，A->C），为避免重复编译依赖文件，让 BC 相互可见
1. A，B，C 模块的配置文件中都正常写 find_package 找到对应的依赖文件，但是这样会导致 A->C，A->B 依赖项被正确找到，而 B->C 找不到
2. 在 B **构建生成的 config 文件 `B/cmake/BConfig.cmake` 中**添加：
```cmake
include(CMakeFindDependencyMacro)
find_dependency(C) # 自动传递顶层参数（如 REQUIRED）

# 自动生成的内容
include(${CMAKE_CURRENT_LIST_DIR}/BTargets.cmake)
```
### 练习 3 - 查找其他类型的文件
#### 背景
- **理想情况**：依赖项已通过 `find_package()` 提供的 `FindXXX.cmake` 或 `XXXConfig.cmake` 自动管理（如系统库 `Boost`、`OpenCV`）。
- **现实情况**：某些依赖项未正确打包（如第三方库未提供 CMake 配置文件），或需要没有放在标准路径中（如本地开发库）。
这时可以使用 `find_path`：
```cmake
find_path(<VAR> name1 [path1 ...] [NO_DEFAULT_PATH] [REQUIRED])
```

| **参数**                | **作用**                                         |
| --------------------- | ---------------------------------------------- |
| **`<VAR>`**           | 存储找到的路径的变量名（如 `PackageIncludeFolder`）。         |
| **`name1`**           | 要查找的文件名（如 `Package.h`）。                        |
| **`path1 ...`**       | 可选路径列表（如 `PATH_SUFFIXES Package` 表示在路径中查找子目录）。 |
| **`NO_DEFAULT_PATH`** | 仅在指定路径中查找，忽略系统默认路径。                            |
| **`REQUIRED`**        | 如果未找到文件，报错并终止构建。                               |

这样使用：
```cmake
# 有未打包的头文件
find_path(PackageIncludeFolder Package.h REQUIRED
  PATH_SUFFIXES
    Package
)
target_include_directories(MyApp PRIVATE ${PackageIncludeFolder})

# 未打包的依赖项->查找头文件和依赖库文件
find_path(MYLIB_INCLUDE_DIR MyLib.h REQUIRED
  PATHS /opt/mylib/include
  PATH_SUFFIXES
    MyLib
)
find_library(MYLIB_LIBRARY NAMES MyLib
  PATHS /opt/mylib/lib
)
# 在需要用的地方使用：
add_executable(MyApp main.cpp)
target_include_directories(MyApp PRIVATE ${MYLIB_INCLUDE_DIR})
target_link_libraries(MyApp PRIVATE ${MYLIB_LIBRARY})
```
- 查找名为 `Package.h` 的头文件，在以下路径中搜索：
	1. 用户指定的路径（如通过 `CMAKE_PREFIX_PATH` 设置）
	2. 系统默认路径（如 `/usr/local/include`）
	3. 子目录 `Package`（如 `/usr/local/include/Package/Package.h`）
	- 如果找到，`PackageIncludeFolder` 会被设置为包含 `Package.h` 的目录（如 `/usr/local/include/Package`）
	- 如果未找到，CMake 报错并终止
- 查找完之后手动添加到 includepath 中
## 第 11 步：杂项功能
### 练习 1：目标别名
没什么意义，并且教程中缺失安装 SimpleTest 这一步
### 练习 2：生成器表达式
练习没什么意义，这里使用 ai 辅助
[`生成器表达式`](https://cmake.com.cn/cmake/help/latest/manual/cmake-generator-expressions.7.html#manual:cmake-generator-expressions\(7\) "cmake-generator-expressions(7)") 是 CMake 中某些上下文支持的复杂特定领域语言。它们最容易理解为延迟求值的条件，它们表达的需求，其确定正确行为的输入在 CMake 配置阶段是未知的，主要用于在多配置构建（如 Debug/Release）或复杂条件逻辑中，根据上下文动态调整构建行为。
#### 常见表达式核心语法
参考：[cmake-generator-expressions](https://cmake.com.cn/cmake/help/latest/manual/cmake-generator-expressions.7.html#introduction)
```cmake
# 条件判断表达式，根据条件是否成立返回不同的值
$<condition:true_string>  # false返回空值
# 如果构建类型为 Debug，返回 "debug_value"，否则返回 "release_value"
$<CONFIG:Debug>:debug_value
$<CONFIG:Release>:release_value
# 或者这种形式
$<IF:condition,true_string,false_string>
# 再或者直接将字符串转换为CMAKE标准BOOL类型字符串
$<BOOL:string>  # 如果string为空或者其他OFF，NOTFOUND的值统一转换为0

# 逻辑运算表达式
$<AND:...>   # 逻辑与
$<OR:...>    # 逻辑或
$<NOT:...>   # 逻辑非
# 如果构建类型是 Debug 且目标MyTarget的ENABLE_FEATURE属性为真（字符串不为空或者其他cmake false值），则返回 "value"
$<AND:$<CONFIG:Debug>,$<TARGET_PROPERTY:MyTarget,ENABLE_FEATURE>>:value

# 字符串比较表达式
$<STREQUAL:string1,string2>  # **字符串变量/字符串**之间比较，大小写敏感
$<STREQUAL:$<UPPER_CASE:${foo}>,BAR>  # 不敏感写法

# 版本比较， true->1 false->0
$<VERSION_LESS:v1,v2>
$<VERSION_GREATER:v1,v2>
$<VERSION_EQUAL:v1,v2>
$<VERSION_LESS_EQUAL:v1,v2>
$<VERSION_GREATER_EQUAL:v1,v2>

# 字符串转换
$<LOWER_CASE:string>
$<UPPER_CASE:string>

# 列表相关
$<IN_LIST:string,list>  # 理解为contains
$<LIST:LENGTH,list>		# list.size()
$<LIST:GET,list,index,...>	# list中所有index位置的元素重新构成一个列表返回
$<LIST:SUBLIST,list,begin,length>  # list<T>(l.begin() + begin, l.begin() + length)
$<LIST:FIND,list,value>  # list.find(value) == list.end() ? index : -1

# 列表拼接（保留空项）
$<LIST:JOIN,list,glue>
$<JOIN:list,glue>  # 删除空项后拼接

# 列表修改
$<LIST:APPEND,list,item,...>
$<LIST:PREPEND,list,item,...>
$<LIST:INSERT,list,index,item,...>

# 列表删除
$<LIST:POP_BACK,list>
$<LIST:POP_FRONT,list>
$<LIST:REMOVE_ITEM,list,value,...>
$<LIST:REMOVE_AT,list,index,...>

# 列表过滤
$<LIST:FILTER,list,INCLUDE|EXCLUDE,regex>
$<FILTER:list,INCLUDE|EXCLUDE,regex>  # 等价于前者

# 列表去重
$<LIST:REMOVE_DUPLICATES,list>
$<REMOVE_DUPLICATES:list>  # 等价于前者

# 列表排序/反转
$<LIST:SORT,list[,(COMPARE|CASE|ORDER):...]>
$<LIST:REVERSE,list>

# 列表转换
$<LIST:TRANSFORM,list,(APPEND|PREPEND),value[,SELECTOR]>
$<LIST:TRANSFORM,list,(TOLOWER|TOUPPER)[,SELECTOR]>
$<LIST:TRANSFORM,list,STRIP[,SELECTOR]>
$<LIST:TRANSFORM,list,REPLACE,regex,replace[,SELECTOR]>

# 路径比较
$<PATH_EQUAL:path1,path2>  # 词法相等返回1

# 路径查询
$<PATH:IS_ABSOLUTE,path>
$<PATH:IS_RELATIVE,path>
$<PATH:HAS_*,path>  # HAS_ROOT_NAME/HAS_ROOT_DIRECTORY等
$<PATH:IS_PREFIX[,NORMALIZE],path,input>

# 路径分解
$<PATH:GET_ROOT_NAME,...>
$<PATH:GET_ROOT_DIRECTORY,...>
$<PATH:GET_FILENAME,...>
$<PATH:GET_EXTENSION[,LAST_ONLY],...>
$<PATH:GET_PARENT_PATH,...>  # 可处理路径列表

# 路径转换
$<PATH:CMAKE_PATH[,NORMALIZE],...>
$<PATH:NATIVE_PATH[,NORMALIZE],...>
$<PATH:NORMAL_PATH,...>
$<PATH:APPEND,...>
$<PATH:REMOVE_FILENAME,...>
$<PATH:REPLACE_FILENAME,...>
$<PATH:REMOVE_EXTENSION[,LAST_ONLY],...>
$<PATH:REPLACE_EXTENSION[,LAST_ONLY],...>
$<PATH:RELATIVE_PATH,...>
$<PATH:ABSOLUTE_PATH[,NORMALIZE],...,base_dir>

# Shell路径转换
$<SHELL_PATH:...>  # 转换为平台特定路径样式（支持分号分割列表）
```
## cmake 项目实例
### ElaWidget 库
#### 根目录配置
msvc 编译器时**指定代码中字符使用 utf 编码**
```cmake
add_compile_options("$<$<CXX_COMPILER_ID:MSVC>:/utf-8>")
```
需要用到 qt 时，需要**添加 sdk 组件位置到 `CMAKE_PREFIX_PATH` 中**

```cmake
SET(QT_SDK_DIR "D:/OtherProgram/QT/6.8.0/msvc2022_64" CACHE PATH "QT SDK DIR" FORCE)
list(APPEND CMAKE_PREFIX_PATH ${QT_SDK_DIR})
```
在非 windows 平台上设定 runtimepath，即使用安装命令后将二进制文件放在 `${CMAKE_INSTALL_RPATH}` 位置
```cmake
if (NOT WIN32)
    add_link_options(-Wl,--disable-new-dtags)
    set(CMAKE_SKIP_INSTALL_RPATH FALSE)
    set(CMAKE_INSTALL_RPATH "${QT_SDK_DIR}/lib:${CMAKE_INSTALL_PREFIX}/ElaWidgetTools/lib")
endif ()
```
跨平台**运行时**设置，由于不同平台运行时查找动态链接库的方法不一致，需要设置
- Linux/macOS：使用动态链接，需要在运行时找到共享库
- Windows：使用导入库(.lib)和 DLL，路径查找机制不同
- CMAKE_INSTALL_RPATH：设置安装后二进制文件的运行时库搜索路径，**这些信息会被写入二进制文件头部**，在执行这些二进制文件时自动查找，所以叫做 runtimepath
#### 库配置
默认编译动态库，并且如果是 debug 模式编译，在二进制文件后添加 d 后缀（mingw 会自动添加。msvc 不会）
```cmake
option(ELAWIDGETTOOLS_BUILD_STATIC_LIB "Build static library." OFF)

if (MINGW)
    set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "")
endif ()
if (MSVC)
    set_target_properties(${PROJECT_NAME} PROPERTIES DEBUG_POSTFIX "d")
endif ()
```
构建和安装过程配置
```cmake
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/${PROJECT_NAME})
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/${PROJECT_NAME})
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/${PROJECT_NAME})

install(
    TARGETS ${PROJECT_NAME}
    EXPORT ${PROJECT_NAME}
    ARCHIVE DESTINATION ${PROJECT_NAME}/lib
    LIBRARY DESTINATION ${PROJECT_NAME}/lib
    RUNTIME DESTINATION ${PROJECT_NAME}/bin
)
install(TARGETS ${PROJECT_NAME}
    LIBRARY DESTINATION ${CMAKE_INSTALL_PREFIX}/ElaWidgetToolsExample
    RUNTIME DESTINATION ${CMAKE_INSTALL_PREFIX}/ElaWidgetToolsExample
)
```
这些 cmake 开头的选项用来设置**cmake 构建过程中将生成文件放在什么位置**，由于 cmake 默认会将构建文件放在 `build/[Debug | relase]/target_name/` 中，设置这几个变量仅仅是将默认位置修改而已。而 install 命令设置使用 ` --install ` 的**cmake 安装过程中将文件放在什么位置**
![[PixPin_2026-01-11_13-28-08.png|build没有Debug/Relase文件夹，打开目录才有Debug/release之分]]
![[PixPin_2026-01-11_13-28-42.png|install命令同理]]
- 第一次 install 定义并导出目标信息到 ElaWidgetToolsTargets.cmake，在其中记录这个目标的二进制文件安装位置
- 第二次 install 将标记当安装时，同时将这个库文件放到演示程序的对应位置中，延时程序也使用了这个库，需要库文件
- 两者本质上是将相同文件安装到不同位置**的信息记录到 target.cmake 中**，真正执行 `--install` 命令时会读取 target.cmake 中的信息按照要求安装文件
```cmake
set(INCLUDE_DIRS include)			# std::string INCLUDE = "include"
set(LIBRARIES ${PROJECT_NAME})
set(LIB_DIR lib)					# std::string LIB_DIR = "lib"
```
设置一些临时*字符串变量*给下面的编写版本/入口文件的函数使用，剩下的 install 都是在安装头文件到库目录中，安装 Config.cmake 和 Version.cmake 到对应目录中