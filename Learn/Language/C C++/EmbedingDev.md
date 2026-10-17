---
created: 2026-10-15
---
# 嵌入式开发与交叉编译
参考：
[CMake 工具链与交叉编译（CMake 4.4.3 文档，访问于 2026-10-17）](https://cmake.org/cmake/help/latest/manual/cmake-toolchains.7.html)
[CMAKE_SYSROOT（CMake 4.4.3 文档，访问于 2026-10-17）](https://cmake.org/cmake/help/latest/variable/CMAKE_SYSROOT.html)
[try_run（CMake 4.4.3 文档，访问于 2026-10-17）](https://cmake.org/cmake/help/latest/command/try_run.html)
[CMAKE_CROSSCOMPILING_EMULATOR（CMake 4.4.3 文档，访问于 2026-10-17）](https://cmake.org/cmake/help/latest/variable/CMAKE_CROSSCOMPILING_EMULATOR.html)
[[CMake|CMake 交叉编译相关记录]]
[[questions精简|面试口径：CMake 交叉工具编译方法（问题 68）]]
## 本文范围

> [!Info] 本文范围
> 本文聚焦一个具体任务：在开发电脑上编译程序，再让它在另一台设备上运行。先掌握程序构建过程和目标平台信息，后面再学习更复杂的嵌入式运行环境。

## 先建立几个基础概念

> [!Note] 操作系统（OS）与 Linux
> 操作系统管理程序、内存、文件和设备，并为应用程序提供常用服务。Linux 是一种操作系统，既用于电脑和服务器，也用于部分嵌入式设备。

> [!Note] 嵌入式系统
> 嵌入式系统是放在更大产品里、负责特定任务的计算机系统，例如路由器、汽车控制器和医疗设备。它描述的是计算机在产品中的用途；设备使用的 CPU、操作系统和软件结构可以不同。

> [!Note] 微控制器（MCU）
> 微控制器（Microcontroller Unit，MCU）把处理器、存储器和外设控制电路集成在一颗芯片中，常用于只需完成特定任务的设备。

> [!Note] 宿主机与目标机
> 宿主机（host）是开发时运行编译器和 CMake 的电脑。目标机（target）是最后运行程序的设备。二者可以使用不同的 CPU，也可以运行不同的操作系统。

> [!Note] CPU 架构与 ARM64
> CPU 架构规定处理器能理解的机器指令。ARM64（也称 AArch64）和 x86-64 是不同的 CPU 架构，彼此生成的指令不能直接互换。指令集架构（Instruction Set Architecture，ISA）是描述这些指令和程序可见寄存器规则的规范。

> [!Note] 交叉编译
> 交叉编译是“用宿主机上的工具，生成给目标机运行的程序”。例如，在一种 CPU 架构的 Linux 电脑上生成 ARM64 Linux 程序。这样可以利用电脑上成熟的编辑、构建工具，也能在没有目标设备或设备性能较弱时先完成构建。

> [!Note] 编译、链接与运行
> 编译器把源代码转换成目标文件（常见后缀为 `.o`）。链接器把目标文件和所需库组合成可执行文件。运行时，操作系统加载可执行文件并提供它需要的库和系统服务。交叉编译的三个阶段都要面向同一个目标平台。

> [!Note] ELF 文件与关键字段
> ELF（Executable and Linkable Format）是 Linux 常用的目标文件、可执行文件和共享库格式。共享库（常见后缀为 `.so`）保存已编译代码，供程序在运行时加载。ELF 头部的 `e_machine` 记录目标 CPU；`PT_INTERP` 记录程序需要的动态加载器路径；`DT_NEEDED` 记录运行时需要加载的共享库，例如 `libc.so.6`。动态加载器会在程序启动时查找这些库。

## 交叉编译要对齐什么
程序能在目标机运行，需要构建结果与目标机的 CPU、操作系统和运行库相匹配。

| 阶段 | 主要工作 | 初学时可以检查什么 |
| --- | --- | --- |
| 编译 | 生成目标 CPU 能执行的指令 | 目标文件中的 CPU 架构 |
| 链接 | 找到目标机的启动文件和库，并记录运行依赖 | 是否链接到目标机的库、需要哪个动态加载器 |
| 运行 | 操作系统加载程序并找到它依赖的库 | 目标机是否支持该架构、加载器和库是否存在 |

> [!Note] 为什么还要匹配运行库
> 运行库提供程序使用的常用函数和启动支持。Linux 程序通常依赖 Linux 的程序格式、系统接口和目标机上的运行库，因此生成了正确 CPU 的指令之后，还要确保程序能找到目标机的运行环境。

## 学习路线
按顺序推进；后续阶段的术语暂时不需要背。

| 阶段 | 学什么 | 完成标志 |
| --- | --- | --- |
| 0 | 宿主机、目标机、编译器、链接器和运行库 | 能用自己的话描述程序从源代码到运行的过程 |
| 1 | 生成给 ARM64 Linux 设备运行的程序，并检查程序文件信息 | 同一份简单程序分别生成宿主和目标版本，能辨认两者的 CPU 架构 |
| 2 | 用 CMake 配置交叉编译，并为目标机查找依赖 | 能说明每项设置负责什么，以及怎样避免误用宿主机的文件 |
| 3 | 在目标环境运行程序，并检查部署、调试问题 | 能区分架构不匹配、动态加载器缺失和库缺失 |
| 4 | 学习 Linux 以外的嵌入式运行环境 | 能说明不同环境的启动方式、系统服务和运行库有什么区别 |

> [!Note] 工具链文件与 CMake Preset
> 工具链文件是 CMake 配置文件，告诉 CMake 目标系统、编译器和查找路径等信息。CMake Preset（预设）可以保存常用配置，让同一组设置能够重复使用。前者描述如何面向目标构建，后者保存一套可重复调用的配置。

## 目标三元组

> [!Note] 目标三元组与 ABI
> 目标三元组是编译器用于标识目标平台的名称，常见形式包含 CPU、厂商、操作系统和 ABI 信息。ABI（Application Binary Interface，应用二进制接口）规定已经编译好的程序如何彼此配合，例如函数参数怎样传递、数据怎样布局、目标文件怎样链接。EABI 是面向嵌入式目标的 ABI 命名之一。GNU 工具链的字段数可能变化，厂商字段也可能省略。

> [!Note] libc 与常见实现
> libc 是 C 语言运行库，提供内存、文件等常用函数。glibc、musl 和 newlib 都是 libc 的实现：glibc 常见于 GNU/Linux 系统，musl 是另一种 C 运行库，newlib 常用于嵌入式环境。工具链要提供与目标环境匹配的头文件和库。

| 部分 | 示例 | 大致表示什么 | 为什么要匹配 |
| --- | --- | --- | --- |
| CPU 架构 | `aarch64` | ARM 64 位指令集 | 决定编译器生成哪类机器指令 |
| 厂商 | `unknown` 或省略 | 目标芯片/平台厂商信息 | 有些工具链按厂商选择默认配置 |
| 操作系统 | `linux`、`none` | 目标设备是否运行操作系统 | 决定程序使用的系统接口和启动方式 |
| ABI / 运行库 | `gnu`、`eabi`（嵌入式 ABI 命名） | 函数调用约定和二进制兼容规则 | 目标程序及其依赖库需要遵循兼容规则 |

> [!Note] 硬浮点、软浮点与 VFP
> VFP 是 ARM 上的浮点运算硬件扩展名称之一。硬浮点约定会使用浮点寄存器传递浮点参数；软浮点约定使用通用寄存器或栈传递。`hf` 表示硬浮点调用约定，`soft-float` 表示软浮点调用约定。它们属于 ABI 的一部分，即使芯片都支持浮点运算，按不同约定构建的库也不能直接混用。

> [!Note] MinGW-w64 与 Windows 目标
> MinGW-w64 是一套可用于构建 Windows 程序的工具链。目标三元组 `x86_64-w64-mingw32` 表示程序面向 64 位 Windows；名字里的 `x86_64` 表示 CPU 架构。

> [!Note] 链接脚本
> 链接脚本是给链接器的配置文件，描述程序代码和数据应放在目标芯片内存的哪些位置。它让链接器按板卡的内存布局放置程序各部分。

常见名称：

| 三元组 | 含义 | 初学时要记住的差异 |
| --- | --- | --- |
| `aarch64-linux-gnu` | ARM 64 位 Linux，常见于 GNU 用户空间和 glibc | 这是 ARM64 Linux 常见目标名 |
| `arm-linux-gnueabihf` | 32 位 ARM Linux，使用硬浮点调用约定 | 要与使用相同调用约定的库配套 |
| `arm-linux-gnueabi` | 32 位 ARM Linux，使用软浮点调用约定 | 与 `gnueabihf` 的函数调用约定不同，库不能随意混用 |
| `arm-none-eabi` | 面向 ARM 微控制器等不运行通用 OS 的目标 | 通常需要自己提供启动代码和链接脚本；可配合嵌入式 C 库 |
| `x86_64-w64-mingw32` | 在其他系统上构建 Windows 程序的目标名 | 目标操作系统是 Windows，不是 Linux |

Debian 系的包管理工具 `dpkg` 使用 `arm64`、`armhf` 等架构名；编译器工具链和 CMake 常使用 `aarch64`、`arm` 等名称。它们是不同工具采用的命名方式，不能只看字符串是否相同来判断目标是否相同。交叉开发包可能使用类似 `libc6-arm64-cross` 的包名。
## 工具链由哪些部分组成

> [!Note] 工具链
> 工具链是一组协同工作的程序、头文件和库。编译器负责生成代码，汇编器和链接器负责生成最终文件，目标机的运行库和启动文件负责支持程序运行。只有编译器时，通常还无法完成完整的构建。

> [!Note] 宿主工具与目标文件
> 交叉编译器本身是运行在宿主机上的程序；它生成的目标文件、库和可执行文件属于目标机。构建时执行的代码生成工具应能在宿主机运行，程序最终链接的库则应属于目标机。

> [!Note] GCC 驱动程序与 Binutils
> GCC（GNU Compiler Collection，GNU 编译器套件）中的 `gcc` / `g++` 是驱动程序，会调用内部编译器、汇编器和链接器。GNU Binutils 是一组处理目标文件的工具：`as` 汇编，`ld` 链接，`readelf` 查看 ELF 信息，`objdump` 反汇编，`strip` 移除部分调试信息。

> [!Note] C 和 C++ 运行库
> `libc` 提供 C 常用函数；`libstdc++` 提供 GCC 的 C++ 标准库；`libgcc` 提供某些整数运算、软浮点和异常处理等底层支持。它们都要与目标机的 CPU 和 ABI 匹配。

| 组件 | 作用 | 阅读时怎么理解 |
| --- | --- | --- |
| GCC 驱动程序 | 接收命令并调度内部编译器、汇编器和链接器 | `aarch64-linux-gnu-g++` 在宿主机上运行，默认面向 ARM64 Linux |
| `cc1` / `cc1plus` | GCC 内部的 C / C++ 编译器 | `g++` 会调用它们；初学时知道它们是内部步骤即可 |
| Binutils | GNU 二进制工具集合，包含 `as`、`ld`、`ar`、`objcopy`、`objdump`、`readelf`、`strip`、`nm` 等 | 汇编、链接、查看和处理目标文件 |
| `libgcc` | GCC 提供的底层支持代码 | 为某些整数运算、软浮点和异常处理等提供支持 |
| `libc`（如 glibc） | C 运行库、目标机头文件和相关启动文件 | 必须使用适合目标机的版本 |
| `libstdc++` | GCC 的 C++ 标准库及其 ABI 支持 | 使用 C++ 标准库的程序需要与目标机版本兼容 |
| 动态加载器 | 程序启动时加载它依赖的共享库 | 路径记录在 ELF 的 `PT_INTERP` 字段中 |

> [!Note] 启动文件与动态加载器
> `crt1.o`、`crti.o`、`crtn.o` 等启动文件会在 `main()` 前后参与程序启动和结束流程。动态加载器在程序启动时寻找并加载 `.so` 共享库。它们都需要面向目标机；不依赖通用操作系统的程序通常使用另一套启动代码，不会依赖 Linux 的动态加载器。

### 跟踪一次编译
`-c` 表示只编译，不继续链接；`readelf` 读取 ELF 文件的信息，不会运行程序。

```bash
# 编译器驱动在宿主机运行，生成 ARM64 的目标文件 main.o
/usr/bin/aarch64-linux-gnu-g++ -v -c main.cpp -o main.o
/usr/bin/aarch64-linux-gnu-readelf -h main.o

# 链接器把目标文件和目标机运行库组合成可执行文件
/usr/bin/aarch64-linux-gnu-g++ main.o -o embedded_demo

# 查看可执行文件记录的动态加载器路径
/usr/bin/aarch64-linux-gnu-readelf -l embedded_demo | grep -A1 INTERP
```

`readelf -h main.o` 中的 `Machine` 应显示 AArch64。链接完成后，`readelf -l` 中的 `INTERP` 项会显示运行时需要的加载器路径。
## 为什么交叉编译产物可能无法在宿主机运行

> [!Note] QEMU 用户态模拟
> QEMU 是模拟器；用户态模式可以在宿主机上运行另一种 CPU 架构的应用程序，并借用宿主机内核提供系统服务。它适合没有目标板时做初步验证，不能完全替代真实设备测试。

> [!Note] binfmt_misc
> `binfmt_misc` 是 Linux 内核的一种文件格式转交机制。系统可以注册规则，让内核遇到某种目标程序时自动调用 QEMU；没有注册时，需要显式运行 QEMU。

> [!Note] QEMU 的 `-L` 参数
> `-L` 指定一个目标根目录，供 QEMU 查找目标动态加载器和共享库。例如，`qemu-aarch64 -L /usr/aarch64-linux-gnu program`。这里的目录要包含程序需要的加载器和库。

| 情况 | 发生了什么 | 常见现象 |
| --- | --- | --- |
| 目标 CPU 与宿主 CPU 不同，且没有模拟器处理 | 宿主内核无法执行目标 CPU 的指令 | `Exec format error`，对应错误码 `ENOEXEC` |
| 宿主机配置了自动转交规则 | 内核把目标文件交给对应的 QEMU 程序 | 可以直接尝试运行；目标加载器和库仍需能找到 |
| CPU 架构相同，但 `PT_INTERP` 中的加载器不存在 | 内核打开目标文件指定的加载器失败 | `No such file or directory`，即使可执行文件本身存在 |

## sysroot 与 CMake 的搜索路径

> [!Note] sysroot
> sysroot 是交叉工具链查找“目标系统文件”时使用的根目录，通常包含目标机的头文件、库和启动文件。编译器使用它避免误用宿主机文件。它可以是目标文件系统的精简副本，不一定包含设备上的全部文件。

> [!Note] CMake 配置阶段与构建阶段
> 配置阶段由 CMake 读取项目设置、查找依赖并生成构建文件。构建阶段才调用编译器和链接器。配置阶段找到库，不能单独证明之后编译和链接也会使用正确的目标文件。

| 机制 | 谁使用 | 主要作用 | 关键设置 |
| --- | --- | --- | --- |
| CMake sysroot | 编译器、链接器和 CMake 查找命令 | 编译器从目标根目录找头文件、库和启动文件；CMake 查找也会使用这个根目录 | `CMAKE_SYSROOT`，传给支持 `--sysroot` 的编译器 |
| CMake 查找根路径 | CMake 的 `find_*` 命令 | 配置阶段查找目标机的头文件、库和包，并可分别控制程序与库的查找位置 | `CMAKE_FIND_ROOT_PATH` 与 `CMAKE_FIND_ROOT_PATH_MODE_*` |

`CMAKE_SYSROOT` 与 `CMAKE_FIND_ROOT_PATH` 有联系，但作用方式不同。前者会传给编译器，并可作为 CMake 查找路径的前缀；后者用于控制 CMake 自己的查找根路径。排查问题时先确认失败发生在 CMake 配置阶段，还是编译、链接阶段。

> [!Note] `find_package` 与 `find_library`
> `find_package` 通常用于查找一个库或工具提供的 CMake 配置；`find_library` 用于查找库文件。它们由 CMake 在配置阶段执行。查找成功只说明 CMake 找到了某个路径，仍要确认它属于目标机。

## CMake 交叉编译设置

> [!Note] CMake 工具链文件
> 工具链文件通常通过 `CMAKE_TOOLCHAIN_FILE` 指定，并在项目配置早期读取。它告诉 CMake 目标系统、目标架构、编译器和相关搜索规则；`CMAKE_SYSROOT` 通常也在工具链文件中设置。

| 设置项 | 常见值 | 它告诉 CMake 什么 | 为什么要设置 |
| --- | --- | --- | --- |
| `CMAKE_SYSTEM_NAME` | `Linux` | 目标操作系统 | 让 CMake 按 Linux 目标配置；交叉工具链中据此进入交叉编译模式 |
| `CMAKE_SYSTEM_PROCESSOR` | `aarch64` | 目标 CPU 架构名称 | 供项目和依赖包根据架构选择配置 |
| `CMAKE_C_COMPILER` / `CMAKE_CXX_COMPILER` | 交叉 GCC / G++ 路径 | 用哪个程序编译 C / C++ | 避免误用宿主机的 `cc` / `c++` |
| `CMAKE_C_COMPILER_TARGET` / `CMAKE_CXX_COMPILER_TARGET` | 目标三元组 | 给支持目标参数的编译器指定目标 | 常用于 Clang 等编译器；GNU 交叉 GCC 通常使用带目标前缀的驱动程序 |
| `CMAKE_FIND_ROOT_PATH_MODE_PROGRAM` | `NEVER` | 构建时要运行的程序从宿主机查找 | 代码生成器等工具要在宿主机执行 |
| `CMAKE_FIND_ROOT_PATH_MODE_LIBRARY` | `ONLY` | 目标库只从目标搜索路径查找 | 避免链接到宿主机的库 |
| `CMAKE_FIND_ROOT_PATH_MODE_INCLUDE` | `ONLY` | 目标头文件只从目标搜索路径查找 | 避免混用宿主机头文件 |
| `CMAKE_FIND_ROOT_PATH_MODE_PACKAGE` | `ONLY` | CMake 包配置只从目标搜索路径查找 | 避免包配置导向宿主机依赖 |
| `CMAKE_SYSROOT` | 目标 sysroot 路径；没有时可不设 | 编译器的目标系统根目录 | 工具链需要指定 sysroot 时，让头文件与库来自目标环境 |
| `CMAKE_CROSSCOMPILING_EMULATOR` | `qemu-aarch64;-L;/usr/aarch64-linux-gnu` | 如何在宿主机运行目标程序 | 让 CMake 借助模拟器运行目标程序检查；部分检查也可改为手工提供结果 |

> [!Note] 构建工具与目标库
> `protoc` 是 Protocol Buffers 的代码生成工具，Qt `moc` 会生成 Qt 元对象相关代码。它们需要在构建过程中运行，所以通常使用宿主机版本。程序链接的 `libc.so`、`libstdc++.so` 等运行库则要与目标机匹配。

> [!Note] `try_compile` 与 `try_run`
> `try_compile` 让 CMake 尝试编译一段小程序，常用于检查编译器能力。`try_run` 还会尝试运行该程序。交叉编译时，宿主机通常不能直接运行目标程序；设置 `CMAKE_CROSSCOMPILING_EMULATOR` 后，CMake 可以通过指定的模拟器运行部分探测程序。

配置骨架示例：

```cmake
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR aarch64)

set(CMAKE_C_COMPILER aarch64-linux-gnu-gcc)
set(CMAKE_CXX_COMPILER aarch64-linux-gnu-g++)

# 构建时运行的工具来自宿主机
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)

# 目标库、头文件和包来自目标系统搜索路径
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_PACKAGE ONLY)
```

这段配置只说明变量的分工。编译器实际路径、sysroot 和依赖目录要按安装的工具链填写。
## 验证交叉编译结果

> [!Note] `readelf` 与 `objdump`
> `readelf` 读取 ELF 结构信息，例如架构、加载器和库依赖。`objdump` 可以反汇编机器码，显示 CPU 指令。它们用于检查文件，不负责运行程序。

| 命令 | 可以回答的问题 | 初学时看哪里 |
| --- | --- | --- |
| `file program` | 文件类型、架构和是否动态链接 | 输出中的架构与目标是否一致 |
| `readelf -h program` | ELF 文件头记录了什么 | `Machine` |
| `readelf -l program` | 程序启动需要哪些段 | `INTERP` 中的加载器路径 |
| `readelf -d program` | 动态链接依赖是什么 | `NEEDED`；`RUNPATH` 是程序附带的库搜索路径 |
| `readelf -A program` | ARM 文件记录了哪些架构属性 | 例如 `Tag_CPU_arch`、`Tag_ABI_VFP_args`，暂时可跳过 |
| `objdump -d program` | CPU 实际会执行哪些指令 | 指令是否属于目标 ISA |
| `qemu-aarch64 -L <目标根目录> program` | 没有目标板时，能否借助模拟器启动程序 | 加载器和共享库是否都能找到 |
| `aarch64-linux-gnu-gcc -print-sysroot` | 编译器默认使用哪个 sysroot | 输出的目录是否符合预期 |
| `aarch64-linux-gnu-gcc -print-search-dirs` | 编译器默认到哪里找程序和库 | 搜索路径是否混入宿主目录 |

建议先看 `file`、`readelf -h` 和 `readelf -l`。它们能回答“这是什么文件、给谁运行、启动时要找什么”，其余检查等遇到对应问题再学。
## 常见问题
1. 项目的 `.gitignore` 如果忽略所有 `*.cmake`，工具链文件也可能被忽略。可检查 `git status`，按项目目录规则允许提交需要的工具链文件。
2. `CMAKE_FIND_ROOT_PATH_MODE_PROGRAM` 与库、头文件和包的查找模式职责不同。程序通常用宿主版本，目标库和头文件通常只从目标路径查找；设反后容易出现“配置通过，构建或运行才失败”。
3. 工具链文件可以在配置早期检查编译器是否存在，并给出清楚错误，避免 CMake 报出难以追踪的次生错误。
4. 项目若使用 `.clang-tidy` 配置类型和变量命名规则，写代码前先读项目配置。`.clang-tidy` 是 clang-tidy 静态检查工具的配置文件；此规则属于特定项目约定，与交叉编译机制无关。
5. vcpkg 是 C++ 包管理器。交叉编译时，vcpkg 也需要知道目标架构和工具链；`VCPKG_CHAINLOAD_TOOLCHAIN_FILE` 可把项目的工具链设置交给 vcpkg 使用。此行为和当前环境的组合仍待阶段 2 验证。

> [!Note] `strip`、`gdbserver`、字节序和对齐
> `strip` 用于移除程序中的部分调试信息；`gdbserver` 让调试器可以连接目标设备上的程序；字节序表示多字节数据在内存中的排列方式；对齐表示数据地址满足特定边界要求。这些主题影响部署和排错，建议在交叉编译闭环完成后再学。

## 后续学习方向

> [!Note] 裸机
> 裸机（bare-metal）程序直接从芯片启动代码进入应用，不由通用操作系统加载。启动代码负责准备运行环境，再把控制权交给程序入口。

> [!Note] RTOS
> RTOS（Real-Time Operating System，实时操作系统）为有明确响应时间要求的任务提供调度、定时器和同步等服务。设备使用 RTOS 时，程序通过 RTOS 提供的服务管理任务。

> [!Note] AUTOSAR
> AUTOSAR（AUTomotive Open System ARchitecture，汽车开放系统架构）是汽车电子软件架构标准，包含多个分层模块。它的启动代码、运行库和构建方式与 Linux 应用有所区别。

阶段 4 可对照 `IEEE1722Tp`、`LsduR` 等 AUTOSAR 模块，确认它们所在层次和依赖关系。模块位置应以实际项目采用的 AUTOSAR 版本和文档为准。
## 待验证清单
> [!Info] 后续验证内容
> 下面几项要等工具链安装或设备运行环境准备好后再做。阶段 0 和阶段 1 先掌握交叉编译流程即可，这些进阶检查可以暂时跳过。

以下内容需要结合实际安装的工具链或目标设备验证，不影响先理解前面的概念：
1. `aarch64-linux-gnu-gcc -print-sysroot` 和 `-print-search-dirs` 的实际输出，确认 Debian 交叉 GCC 是否配置了 sysroot，以及 `/usr/aarch64-linux-gnu` 是否可作 `CMAKE_SYSROOT`。
2. `aarch64-linux-gnu-ld --verbose | grep SEARCH_DIR` 的默认搜索路径，以及它与 `CMAKE_SYSROOT` 的组合效果。
3. 用 `dpkg -L libc6-dev-arm64-cross` 查看目标头文件与库的实际位置，并确认当前 Debian 版本中的包名。
4. 对比宿主构建和交叉构建的探针报告：`compile_arch`、`elf_machine`、`hwcap`、`page_size` 等项目是否按预期变化；`long_bits`、`gxx_abi_version` 需要实测后判断。
5. 在宿主机直接执行 ARM64 产物，记录实际报错；再验证 `qemu-aarch64 -L /usr/aarch64-linux-gnu` 是否能运行该动态链接程序。
