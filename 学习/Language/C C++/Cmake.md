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