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
常用于避免旧版兼容问题（如 CMP 0167）
- `option (VARIABLE "Description" ON/OFF)`
作用：定义用户可选的开关变量（常用于 GUI 或命令行）
立即执行，可在 project () 之前或之后使用
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
✅ 用于生成代码、资源文件等。
## 引入第三方库出现的问题
### `CMP0167` 警告
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
### cmake 不在指定目录中寻找 boost 库
#### 构建正常场景
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
#### 构建错误场景
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