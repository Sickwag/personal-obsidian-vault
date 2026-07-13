# 01Star 进销存系统 — 学习笔记

> 项目地址：`zero-one-psi-cpp-sample`
> 技术栈：C++17 + oatpp Web 框架 + MySQL + Redis + MongoDB + FastDFS
> 学习方式：读源码 → 理解设计 → 运行测试 → 自己动手改

## 第1阶段：项目全景 + CMake 构建系统

理解项目的整体结构、各子项目职责、CMake 依赖管理方式，掌握条件编译和 vendored 依赖的权衡。

### 项目架构图

```
CMakeLists.txt (顶层)
option() 控制 9 个特性开关（USE_REDIS, USE_MONGO, USE_ROCKETMQ...）
add_subdirectory() 引入 4 个子项目
       /        |         \
      v         v          v
lib-oatpp   lib-mysql   lib-common
(静态库)    (静态库)    (静态库)
oatpp封装   MySQL封装   工具+客户端
OUTPUT:     OUTPUT:     OUTPUT:
liboatpp-   libmysql    libcommon
http.a      .a          .a
       \        |         /
        v       v        v
        arch-demo (可执行文件)
        link: lib-oatpp + lib-mysql + lib-common
        依赖: oatpp, mysqlcppconn, jsoncpp, yaml-cpp...
```

**架构设计要点**：
- 基础库之间互不依赖，arch-demo 作为上层应用依赖所有基础库，保证编译隔离性
- 每个子项目输出 `STATIC` 库，最终全部链接为单一可执行文件，部署简单
- 编译顺序由 `add_subdirectory` 在顶层 CMakeLists.txt 中的出现顺序决定，基础库必须在前

### 条件编译：option + add_definitions 模式

**解决问题**：项目依赖 11 个外部服务，但不是每个开发者都需要全部安装。通过条件编译，只安装 Redis + MySQL 就能编译运行，Mongo/RocketMQ 的代码被编译器直接跳过。

**完整链路**：

```
cmake -DUSE_REDIS=ON
       ↓
option(USE_REDIS "use redis" ON) → CMake 变量
       ↓
add_definitions(-DUSE_REDIS)     → C++ 宏
       ↓
#ifdef USE_REDIS                 → 源码条件编译
    // Redis 相关代码
#endif
       ↓
if(USE_REDIS)                    → CMake 条件链接
    target_link_libraries(app redis++ hiredis)
endif()
```

**三层必须同步**：`option` 定义 → `add_definitions` 宏转换 → `target_link_libraries` 条件链接，缺一层都会导致编译或链接错误。

### 预编译头机制（PCH）

**核心思想**：将体积大、改动少的头文件提前编译为二进制，后续编译直接加载，省去重复解析。

**MSVC 的两步机制**：

```
stdafx.cpp (/Yc 创建)              其他 .cpp (/Yu 使用)
       |                                  |
  #include "stdafx.h"              /FI 强制 include "stdafx.h"
       |                                  |
       v                                  v
   stdafx.pch  ───────── 加载 ──────>  跳过解析，直接使用符号表
```

- `/Yc"stdafx.h"` — 将 `stdafx.cpp` 编译为 `.pch`（不产生普通 `.obj`）
- `/Yu"stdafx.h"` — 使用已有 `.pch`，跳过对 `stdafx.h` 的重新解析
- `/FI"stdafx.h"` — 强制 include（等价于每个文件顶部自动加 `#include "stdafx.h"`）
- `/Fp"path"` — 指定 `.pch` 输出/查找路径

**三种编译器 PCH 对比**：

| | MSVC | GCC | Clang |
|------|------|------|------|
| 创建 PCH | `/Yc"stdafx.h"` | `g++ -o stdafx.h.gch stdafx.h` | `clang++ -emit-pch -o stdafx.h.pch stdafx.h` |
| 使用 PCH | `/Yu"stdafx.h"` | 自动（同目录存在 `.gch` 就加载） | `-include-pch stdafx.h.pch` |
| 强制包含 | `/FI"stdafx.h"` | `-include stdafx.h` | `-include stdafx.h` |
| PCH 文件名 | `stdafx.pch` | `stdafx.h.gch` | `stdafx.h.pch` |
| 自动检测 | 否，需显式 `/Yu` | **是**，同目录自动匹配 | 否，需显式 `-include-pch` |

GCC 的自动检测是独有特性——只要编译目录下存在 `stdafx.h.gch`，任何 include 了 `stdafx.h` 的源文件都会自动使用它。

**本项目为何 Linux 不用 PCH**：`stdafx.h` 被 `#ifndef LINUX` 包裹导致 Linux 下为空文件。这是权衡——Windows 编译慢用 PCH 优化，Linux 编译快且 GCC 自动检测可能有版本兼容问题，故省略。

### MSVC /bigobj 段表限制

**问题根因**：MSVC 的 COFF `.obj` 文件格式兼容古老规范，section table 条目数用 16 位整数存储，上限 65536。

**为何 oatpp Controller 会超限**：
- `ENDPOINT` 宏为每个路由生成独立函数体
- `DTO_FIELD` 宏为每个字段生成 getter/setter/序列化代码
- 一个 UserController（20+ 端点）展开后可达数十万段

**格式对比**：

| | MSVC COFF (默认) | MSVC COFF (`/bigobj`) | Linux ELF |
|------|------|------|------|
| 段表位数 | 16 bit | 32 bit | 动态分配 |
| 段数上限 | 65536 | ~42 亿 | 无硬限制 |
| 兼容性 | 全部工具链 | VS 2005+ | 全部工具链 |

**典型报错**：`fatal error C1128: number of sections exceeded object file format limit`

**注意**：`/bigobj` 是 target 级别的编译选项，无法按单个文件开关。只有 arch-demo 需要它（因为包含 Controller 文件），三个基础库不需要。

### CMake 老派 vs 现代风格

本项目同时存在两种风格，是历史演进的痕迹：

| 维度 | 老派（Directory Scope） | 现代（Target Scope） |
|------|------|------|
| 包含目录 | `include_directories(./)` | `target_include_directories(foo PUBLIC ./)` |
| 宏定义 | `add_definitions(-DLINUX)` | `target_compile_definitions(foo PRIVATE LINUX)` |
| 链接目录 | `link_directories(/usr/local/lib)` | `target_link_directories(foo PUBLIC ...)` |
| 作用范围 | 当前目录 + 所有子目录 | 仅指定 target |
| 传递性 | 隐式，不可控 | `PUBLIC`/`PRIVATE`/`INTERFACE` 显式控制 |
| 可调试性 | 不知道谁加了哪个 flag | 每个 target 依赖关系清晰 |

**`PUBLIC` / `PRIVATE` / `INTERFACE` 的语义**：

```
target_link_libraries(A PUBLIC B)
  → 链接 A 的目标自动获得 B 的头文件和链接依赖

target_link_libraries(A PRIVATE B)
  → 只有 A 自己链接 B，依赖 A 的目标看不到 B

target_link_libraries(A INTERFACE B)
  → A 本身不需要 B 的代码，但依赖 A 的目标需要（纯头文件库常用）
```

### CMakePresets.json — 构建预设标准化

**传统方式 vs Presets**：

```
# 传统方式（手写）
cmake .. -DCMAKE_BUILD_TYPE=Debug -DCMAKE_TOOLCHAIN_FILE=/path/to/vcpkg.cmake

# Presets 方式（固化配置）
cmake --preset debug
```

**继承链结构**：

```
base (hidden)                    ← 公共配置：vcpkg toolchain、C++20、compile_commands.json
  ├── debug     → 继承 base + -g -O0
  └── release   → 继承 base + -O3

buildPresets         ← 把 configure 和 build 配对
testPresets          ← 把 configure 和 test 配对
```

**关键配置项 `CMAKE_EXPORT_COMPILE_COMMANDS: true`**：生成 `compile_commands.json`，是 clangd/intellisense 的"索引文件"，让 IDE 能准确跳转和补全。

### CMake Target 全局可见性

```cmake
target_link_libraries(${appName} "lib-common" "lib-oatpp" "lib-mysql")
```

这里写的是字符串 `"lib-oatpp"`，不是路径。能工作的原因：`add_subdirectory("lib-oatpp")` 先于 `add_subdirectory("arch-demo")` 执行，`lib-oatpp` 的 `add_library(lib-oatpp STATIC ...)` 已在 CMake 内部目标注册表中登记。CMake 自动将字符串解析为 target 引用，知道：
- 输出文件在哪：`${PROJECT_BINARY_DIR}/lib-oatpp/liboatpp-http.a`
- 编译顺序：必须先编译 `lib-oatpp`，再链接 `arch-demo`
- 传递依赖：若 `lib-oatpp` 用了 `PUBLIC` 声明，依赖会自动带上

| 机制 | 目标来源 | 适用场景 |
|------|---------|---------|
| `add_subdirectory` | 同一项目的子目录 | 自己写的库 |
| `find_package` | 外部安装的库 | 系统/vcpkg 安装的第三方库 |

### `OUTPUT_NAME` — target 名 vs 输出文件名分离

```cmake
add_library(lib-oatpp STATIC ${SC_FILES})                    # CMake 内部名
set_target_properties(lib-oatpp PROPERTIES OUTPUT_NAME oatpp-http)  # 磁盘文件名
```

- **内部名**（`lib-oatpp`）：语义清晰，在 `target_link_libraries` 中使用，有 project 作用域保护
- **输出名**（`oatpp-http`）：简短，避免 `lib` 前缀重复（CMake 自动加 `lib` 前缀 → `liboatpp-http.a`）
- **目的**：防止 target 名冲突——如果 target 名就是 `common`，其他库也可能起这个名字

### `file(GLOB_RECURSE)` 的权衡

```cmake
file(GLOB_RECURSE SC_FILES src/*.cpp)  # 自动收集所有 .cpp，不用手动枚举
```

| 优点 | 缺点 |
|------|------|
| 新增文件不需要修改 CMakeLists.txt | 新增文件后必须重新 `cmake` 才能被检测到 |
| 避免遗漏源文件 | 可能意外包含不该编译的文件（如备份 `.cpp.bak`） |
| CMakeLists.txt 简洁 | GoogleTest、abseil 等大型项目明确禁止此用法 |

**适用场景**：教学项目文件变化不频繁，GLOB 的便利性大于风险；生产项目建议显式列出。

### 依赖管理方式对比

| 维度 | vendored 方式（本项目原始方案） | 包管理器方式（vcpkg/apt） |
|------|------|------|
| 首次搭建 | 开箱即用（有预编译库） | 需逐个安装 |
| 跨平台 | 一套预编译库只支持一个平台 | 包管理器自动处理 |
| 版本锁定 | 固定版本，不会意外升级 | 需显式锁定版本 |
| 预编译库删除后恢复 | 复杂，需重新找对应版本 | `vcpkg install` 即可 |
| ABI 兼容性 | 编译环境必须与预编译环境匹配 | 自动匹配当前系统 |
| 安全更新 | 需要手动替换文件 | `vcpkg upgrade` 自动更新 |

> 本项目在 Windows 上运行良好（所有预编译库都是为 Windows+VS 编译的），迁移到 Linux 时预编译库不可用，需要逐一替换为系统/vcpkg 版本。
