## vim快捷键
官网键位学习图
[https://www.runoob.com/w3cnote/all-vim-cheatsheat.html](https://www.runoob.com/w3cnote/all-vim-cheatsheat.html)
### 命令模式
|            |                   |
| ---------- | ----------------- |
| 快捷键        | 效果                |
| `i`        | 进入插入模式            |
| `v`        | 进入可视模式            |
| `:`        | 进入底线命令模式          |
| `h`        | 光标左移              |
| `j`        | 光标下移              |
| `k`        | 光标上移              |
| `l`        | 光标右移              |
| `w`        | 光标移到下一个单词的开头      |
| `b`        | 光标移到上一个单词的开头      |
| `e`        | 光标移到当前或下一个单词的结尾   |
| `0`        | 光标移到行首            |
| `$`        | 光标移到行尾            |
| `gg`       | 光标移到文件开头          |
| `G`        | 光标移到文件结尾          |
| `dd`       | 删除当前行             |
| `yy`       | 复制当前行             |
| `p`        | 粘贴                |
| `u`        | 撤销                |
| `Ctrl + r` | 重做                |
| `/`        | 搜索                |
| `n`        | 在搜索结果间跳转          |
| `x`        | 删除当前字符            |
| `r`        | 替换当前字符            |
| `o`        | 在当前行下方插入新行并进入插入模式 |
| `O`        | 在当前行上方插入新行并进入插入模式 |
| `>>`       | 缩进当前行             |
| `<<`       | 取消缩进当前行           |
| `.`        | 重复上一次命令           |
### 插入模式
|   |   |
|---|---|
|快捷键|效果|
|`Esc`|返回命令模式|
|`Ctrl + h`|删除前一个字符|
|`Ctrl + w`|删除前一个单词|
|`Ctrl + u`|删除到行首|
|`Ctrl + o`|短暂返回命令模式执行一个命令后返回插入模式|
|`Ctrl + r`|插入寄存器内容|
### 底线命令模式
|   |   |
|---|---|
|快捷键|效果|
|`:w`|保存文件|
|`:q`|退出|
|`:wq`|保存并退出|
|`:q!`|强制退出不保存|
|`:e [文件名]`|打开文件|
|`:b [缓冲区号]`|切换缓冲区|
|`:sp [文件名]`|水平分割窗口|
|`:vsp [文件名]`|垂直分割窗口|
|`:resize [高度]`|调整窗口高度|
|`:vertical resize [宽度]`|调整窗口宽度|
|`:set number`|显示行号|
|`:set nonumber`|关闭行号|
|`:help [命令]`|查看命令帮助|
|`:s/[旧文本]/[新文本]/g`|替换当前行的文本|
|`:%s/[旧文本]/[新文本]/g`|替换整个文件的文本|
---
# 第一章
## 操作系统概述
计算机由硬件和软件组成
操作系统出现的目的就是更好地调动硬件工作，满足用户要求
## 认识Linux
### linux内核
linux由系统内核和系统及应用程序（系统出厂自带程序）
![Untitled 229.png](Untitled%20229.png)
任何用户端的操作都是由程序通过操作指令调用内核，内核调动相应硬件，最终完成动作
**linux发行版**
任何人都可以在网站上下载到内核源码，通过自定义系统程序并把它和内核封装在一起，就是一个linux发行版。
### 虚拟机介绍
使用虚拟机安装linux：本地主机上的软件模仿硬件行为，再对虚拟的硬件装上操作系统
### 配置linux
选择典型安装的简易安装即可
一般设置虚拟机硬盘大小为>20GB
虚拟内存1GB即可
虚拟处理器 1核即可
### 远程连接linux
内linux外windows会使文件传输内容复制不方便,所以使用finalshell
重启之后IP地址会改变, 同样使用linux的ifconfig查找并输入到finalshell中
### 拓展: 通过WSL使用ubuntu
WSL直接连宿主机的硬件, 性能远超虚拟机
### 虚拟机快照
类似于windows的回溯点
虚拟机关机之后创建关机比较安全
![Untitled 1 41.png](Untitled%201%2041.png)
# 第二章
## Linux基础命令
### Linux目录结构
没有盘符, (顶级目录 ),所有文件都在根目录下
路径书写方式,我windows使用\ , Linux是/ linux路径描述开头为/根目录,后面的/表示层级关系
### linux命令
![Untitled 2 33.png](Untitled%202%2033.png)
**ls命令**
![Untitled 3 30.png](Untitled%203%2030.png)
系统启动时默认将home目录作为当前工作目录, 使用任何命令都对当前工作目录有效, 一般默认在`/HOME/用户名`所在文件夹中
![Untitled 4 26.png](Untitled%204%2026.png)
-a选项all表示将所有文件\文件夹全部列出(包括隐藏内容)
-l表示list列表形式显示文件\文件夹,不使用ls的平铺
![Untitled 5 23.png](Untitled%205%2023.png)
上面平铺,下面列表
![Untitled 6 22.png](Untitled%206%2022.png)
- 通过指令混写同时进行两种命令的选项,表示同时进行all和list命令, 列表全展示
- 参数和指令也可以混写

    ![Untitled 7 22.png](Untitled%207%2022.png)

-h表示通过易于阅读的样式列出文件, 只能和-l命令一起使用将字节大小转换为kb等易于阅读的单位制
**cd命令(不是选项)** 是change directory 没有参数表示回到home, 有路径表示进入路径
**pwd命令(不是选项)** print work directory 没有参数表示查看当前工作目录,只输出工作目录路径一条信息,而不会打开看目录中有什么文件
### 相对绝对路径
相对路径以当前目录作为起点
绝对路径表示以根目录作为起点
cd /home/itheima/Desktop
cd Desktop
### 特殊路径符
|   |   |
|---|---|
|**.**|表示当前目录，比如cd./Desktop表示切换到当前目录下的Desktop目录内，和cdDesktop效果一致|
|**..**|表示上一级目录，比如：cd..即可切换到上一级目录，cd../切换到上二级的目录|
|**~**|表示HOME目录，比如：cd～即可切换到HOME目录或cd~/Desktop，切换到HOME内的Desktop目录|
### mkdir命令
make directory
```C++
语法：mkdir [-p] Linux路径
- 参数必填
- -p 表示自动创建不存在的父目录
mkdir [OPTION]... DIRECTORY...
```
- `[OPTION]...` 表示 `OPTION` 是可选的，并且可以指定多次。例如，你可以使用多个 `p` 参数来创建多个目录，或者同时使用 `p` 和其他选项，如 `m` 来设置目录权限。
- `DIRECTORY...` 表示 `DIRECTORY` 是必须的参数，但可以指定多个。你可以一次性创建多个目录，只需在命令行中列出所有想要创建的目录名称即可。
`mkdir -p dir1 dir2 dir3`
这个命令会创建三个目录：`dir1`、`dir2` 和 `dir3`。每个目录都会被创建，如果它们的父目录不存在，`-p` 参数会确保它们被创建
> 要在/home/user/a/b/c/d/file folder这样的目录,a,b,c,d,file folder文件夹都不存在.我需要执行以下命令,
> mkdir -p /home/a/b/c/d/file\ folder
>
> **注意最后一个反斜杠是转义字符,表示转义空格**
### touch 命令
- **全称**: 无特定全称，直接是 `touch`。
- **用法**: 创建空文件或更新文件时间戳。
- **参数**:
    - `a`: 只修改访问时间。
    - `m`: 只修改修改时间。
    - `c`: 如果文件不存在，**不**创建新文件。
    - `t`: 使用指定的时间戳，格式为 `[CC]YYMMDDhhmm[.ss]`。
    - `r`: 使用参考文件的时间戳。
**应用例子**:
```Shell
touch -a -m -t 202301011200.00 filename
```
这个命令会将 `filename` 的访问和修改时间设置为2023年1月1日12点整。
使用下面的命令创建一个文件
```C++
touch newfile.txt
```
`touch` 命令默认在当前工作目录创建文件。如果你想在其他目录创建文件，需要指定完整的路径。例如：
```Shell
touch /path/to/directory/newfile.txt
这个命令会在指定的路径 `/path/to/directory` 下创建 `newfile.txt` 文件。
```
### cat 命令
- **全称**: concatenate，意为连接。
- **用法**: 连接文件内容并显示，创建或覆盖文件内容。
- **参数**:
    - `A`: 显示所有控制字符。
    - `b`: 对非空行进行编号。
    - `e`: 显示行结束符。
    - `n`: 对所有行进行编号。
    - `s`: 将多个空行压缩为一个空行。( **压缩并不会改变原文件内容 )**
    - `T`: 将制表符显示为 `^I`。
    - `v`: 显示非打印字符。
**应用例子**:
假设你有一个文本文件 `example.txt`，你想查看它的内容，可以使用：
```Shell
bash
cat example.txt
```
如果你想创建一个新文件 `newfile.txt` 并输入一些文本，可以使用：
```Shell
bash
cat > newfile.txt
```
然后输入你想要的内容，完成后按 `Ctrl + D` 来保存并退出。
```Shell
cat -n example.txt
```
这个命令会显示 `example.txt` 文件的内容，并对每一行进行编号。
- 查看文件内容：`cat filename`
- 连接多个文件的内容并显示：`cat file1 file2`
- 创建或覆盖文件内容：`cat > filename`
- 追加内容到文件末尾：`cat >> filename`
**写完内容之后使用Ctrl+D结束输入,使用Ctrl+W删除一整行内容**
### more 命令
- **全称**: 无特定全称，直接是 `more`。
- **用法**: 逐页显示文件内容。
    - 逐页显示文件内容：`more filename`
    - 使用管道查看命令输出：`command | more`
    - 使用 `d` 选项显示提示信息：`more -d filename`
    - 使用 `n` 选项指定每页显示的行数：`more -n filename`**n是一个数字**
- **参数**:
    - `d`: 显示提示信息。
    - `f`: 计算实际的屏幕行数，而不是终端的物理行数。
    - `l`: 不处理换页符。
    - `c`: 不滚动，而是显示整个文件。
    - `p`: 清除屏幕，然后显示文件内容。
    - `s`: 将多个空行压缩为一个空行。
    - `u`: 禁止下划线。
    - `#`：指定每屏显示的行数。
**应用例子**:
```Shell
more -d filename
```
这个命令会逐页显示 `filename` 的内容，并显示提示信息。
```Shell
more largefile.txt
```
使用 `less` 命令指定每页显示行数的语法如下：
```Shell
less -N filename
```
其中 `-N` 选项用于指定每页显示的行数。`N` 是一个数字，代表你想要的行数。例如，如果你想要每页显示 20 行，可以这样使用：
```Shell
less -20 filename
这会将 filename 文件的内容每页显示 20 行。
```
按空格键可以查看下一页内容，按 `Enter` 键可以查看下一行内容。
这些命令在Linux和类Unix系统中非常常见，是处理文件和查看内容的基本工
### rpm 命令
作用
- **安装软件包**：使用 `rpm` 安装 `.rpm` 格式的软件包。
- **卸载软件包**：从系统中移除已安装的软件包。
- **更新软件包**：升级系统中已安装的软件包到新版本。
- **查询软件包**：查询系统中已安装的软件包信息。
- **验证软件包**：检查已安装软件包的完整性。
参数
- `-i` 或 `--install`：安装一个软件包。
- `-e` 或 `--erase`：卸载一个软件包。
- `-U` 或 `--upgrade`：升级一个软件包。
- `-q` 或 `--query`：查询软件包信息。
- `-v` 或 `--verbose`：显示详细信息。
- `-h` 或 `--hash`：在安装或升级过程中显示进度条。
- `--force`：强制执行某些操作，即使它可能覆盖文件或违反依赖关系。
### ls 与 ll 命令
`ls` 命令是 Linux 中用于列出目录内容的常用命令。`ll` 并不是一个独立的命令，而是 `ls -l` 的别名，通常在 Bash shell 中预定义，用于以长格式列出目录内容。
- `-l`：以长格式列出信息，包括权限、所有者、文件大小和最后修改时间等。
- `-a` 或 `--all`：列出所有文件，包括以点（`.`）开头的隐藏文件。
- `-h` 或 `--human-readable`：以易于阅读的格式（例如 KB、MB）显示文件大小。
- `-t`：按文件最后修改时间排序。
- `-r` 或 `--reverse`：逆序排序。
- `-R` 或 `--recursive`：递归地列出所有子目录。
- `-S`：按文件大小排序。
- `-X`：按文件扩展名排序。
- `-d`：显示目录本身的信息，而不是目录内的内容。
- `-i`：显示文件的索引节点号（inode）。

### less 命令
#### 程序命令
##### 基本参数
- `-N` 或 `--line-numbers`：显示行号。
- `-i` 或 `--ignore-case`：搜索时忽略大小写（默认情况下，搜索是大小写敏感的）。
- `-I`：与 `-i` 类似，但在某些情况下（如正则表达式匹配）保持大小写敏感。
- `-X` 或 `--no-init`：在退出时不清理屏幕。

##### 显示控制参数
- `-F` 或 `--quit-if-one-screen`：如果内容可以在一个屏幕内显示完，则直接输出内容并退出，不进入 `less` 的分页模式。
- `-S` 或 `--chop-long-lines`：不自动换行，长行会被截断。
- `-w` 或 `--hilite-search`：高亮显示搜索匹配项。
- `-z` + `n` 或 `--window=n`：设置屏幕窗口的大小为n行。

##### 文件处理参数
- `-e` 或 `--quit-at-eof`：到达文件末尾时自动退出。
- `-E` 或 `--QUIT-AT-EOF`：到达文件末尾时退出，并显示文件名。
- `-b` + `n` 或 `--buffer-size=n`：设置缓冲区大小为n。

##### 导航参数
- `-n` 或 `--line-preference=n`：设置优先显示的行数，影响翻页时显示的行数。
- `-a` 或 `--search-skip-screen`：在搜索时，跳过屏幕顶部的行。
- `-A` 或 `--SEARCH-SKIP-SCREEN`：在搜索时，跳过屏幕顶部的行，并在屏幕底部显示搜索字符串。

##### 其他参数
- `-m` 或 `--long-prompt`：显示一个更详细的提示信息。
- `-M` 或 `--LONG-PROMPT`：显示一个更详细的提示信息，并包括文件名和行号。
- `-p` + `pattern` 或 `--pattern=pattern`：在打开文件之前，先搜索指定的模式。
- `-r` 或 `--raw-control-chars`：显示原始控制字符（通常用于特殊字符的显示）。
- `-R` 或 `--RAW-CONTROL-CHARS`：显示原始控制字符，但解释ANSI颜色和样式代码。
- `-s` 或 `--squeeze-blank-lines`：将连续的空行压缩成一个空行显示。
- `-x` + `n` 或 `--tabs=n`：设置tab的宽度为n个空格。

这些参数可以组合使用，以满足不同的查看需求。例如，如果你想要在查看文件时显示行号并忽略大小写搜索，可以使用命令 `less -N -i filename`。
#### 交互命令
##### 基本导航命令
- **空格键 (Space)**：向下翻一页。
- **Enter 或 Return**：向下翻一行。
- **b**：向上翻一页。
- **u**：向上翻半页。
- **d**：向下翻半页。

##### 快速移动命令
- **g**：移动到文件的开头。
- **G**：移动到文件的末尾。
- **nG**：移动到文件中第n行（n为数字）。
- **:** + **n**：移动到文件中第n行（n为数字）。

##### 查找命令
- **/** + **搜索词**：向下搜索指定的字符串。
- **?** + **搜索词**：向上搜索指定的字符串。
- **n**：重复上一次搜索（在相同方向上）。
- **N**：重复上一次搜索（在相反方向上）。

##### 读取文件
- **:e**：重新加载当前文件。
- **:n**：如果打开了多个文件，切换到下一个文件。
- **:p**：如果打开了多个文件，切换到上一个文件。
- **:x**：如果这是第一个文件，打开它；否则，关闭当前文件并打开第一个文件。

##### 退出命令
- **q**：退出 `less` 程序。
- **ZZ**：如果文件没有被修改，退出 `less`；如果文件被修改，保存更改并退出。

##### 其他有用命令
- **h**：显示帮助信息。
- **v**：使用默认的文本编辑器打开当前文件（需要配置环境变量）。
- **:** + **!命令**：执行一个shell命令（例如 `:!ls` 会列出当前目录的文件）。
- **:** + **s** + **/old/new**：替换文件中字符串（例如 `:s/foo/bar/g` 会将当前行中所有“foo”替换为“bar”）。
### 修改别名
修改用户的 shell 配置文件来设置别名（alias），这样就可以为常用的命令或服务创建简短的替代名称。最常见的配置文件是 .bashrc（对于 Bash shell 用户）和 .zshrc（对于 Zsh 用户）。
- 对于 Bash 用户，使用文本编辑器打开 `.bashrc` 文件：
```bash
nano ~/.bashrc
```
- 对于 Zsh 用户，使用文本编辑器打开 `.zshrc` 文件：
```bash
nano ~/.zshrc
```
- 配置文件中命名别名方式
```shell
alias sts='systemctl status'
```
- 重新加载配置文件
```shell
source ~/.zshrc
```
- 注意
	- 别名只在当前用户的 shell 环境中有效。如果希望对所有用户都有效，需要将别名添加到 `/etc/bashrc` 或 `/etc/profile` 文件中（取决于系统和 shell）。
	- 如果为一个已经存在的命令创建了别名，那么这个别名会覆盖原有的命令。如果你希望在使用别名的同时还能调用原始命令，可以使用反斜杠 `\` 来取消别名，例如 `\ls`。
### source 命令
- **加载配置文件**：`source` 命令可以用来加载 `.bashrc`、`.bash_profile`、`.profile`、`.bashAliases` 等配置文件，使得配置文件中设置立即生效。
- **执行脚本中命令**：在脚本中，`source` 可以用来执行另一个脚本文件中命令，而不是创建一个新的子 shell。
- `source` 命令只需要一个参数，即要执行的脚本或配置文件的路径。
### grep 命令
`grep` 命令是 Linux 和类 Unix 系统中用于搜索文本的工具。它通过模式匹配搜索文件内容，并打印出匹配模式的行。`grep` 是 "Global Regular Expression Print" 的缩写，它支持正则表达式
- 作用：
	- **搜索文本**：在文件或输入流中搜索包含特定模式的行。
	- **模式匹配**：支持基本的正则表达式（BRE）和扩展的正则表达式（ERE）。
	- **过滤输出**：可以与其他命令结合使用，过滤输出结果。

- 常用参数：
	- `-i`：忽略大小写。
	- `-v`：显示不包含匹配模式的行。
	- `-c`：仅显示包含匹配模式的行数。
	- `-n`：显示匹配行及其行号。
	- `-r` 或 `-R`：递归地搜索目录。
	- `-l`：仅列出包含匹配模式的文件名。
	- `-E`：使用扩展正则表达式。
	- `-w`：匹配整个单词。
	- `-s`：静默模式，不显示不存在或无法读取文件的错误消息。
	- `-q`：静默模式，不输出任何内容，仅通过退出状态表示是否找到匹配。

- 返回值
	- `0`：表示至少有一个匹配。
	- `1`：表示没有找到匹配。
	- `2`：表示发生错误。

### ps 命令
`ps` 命令是 Linux 和类 Unix 系统中用于报告当前系统进程状态的一个工具。它能够显示关于当前运行在系统上的进程的详细信息，包括进程 ID、进程状态、使用的 CPU 和内存资源等。
- 作用
	- **查看进程信息**：显示当前运行的进程列表。
	- **进程状态**：显示进程的状态，如运行（R）、睡眠（S）、停止（T）等。
	- **资源使用情况**：显示进程使用的 CPU 和内存资源。
	- **过滤进程**：可以使用不同的参数来过滤和排序进程。
- 参数
	- `-e` 或 `-A`：显示所有进程。
	- `-f`：显示完整格式的输出。
	- `-u`：显示属于特定用户的进程。
	- `-p`：指定进程 ID，显示特定进程的信息。
	- `-C`：根据命令名显示进程信息。
	- `-N`：显示与指定参数不匹配的所有进程。
	- `-l`：使用长格式显示输出。
	- `-a`：显示除会话领导和无终端进程外的所有进程。
	- `-x`：显示没有控制终端的进程。
	- `-o`：指定输出格式，后面跟上逗号分隔的字段名。
## 使用管道查看命令输出
在命令行中，管道符号 `|` 用于将一个命令的输出作为另一个命令的输入。在 `more` 命令的上下文中，这意味着你可以将任何命令的输出通过 `more` 来分页显示。例如，如果你想要分页显示 `ls` 命令的输出，可以这样做：
```Shell
ls -l | more
ls -l | cat > test4.txt
# 将ls -l命令结果写入test4.txt
```
这个命令会列出当前目录的内容，并通过 `more` 命令逐页显示这些内容。
 **文件操作命令2（cp、mv、rm）**
> cp [-r] 参数1 参数2
>
> - r选项， 可选，用于复制文件夹使用，表示递归
> - 参数1，被复制的文件
> - 参数2，复制去的地方
>
> mv 参数1 参数2
>
> - 被移动的文件或文件夹
> - 移动去的地方路径
>
> rm [-r -f] 参数1 参数2 ..... 参数N
>
> - r 用于删除文件夹
> - f 表示force，强制删除（不会弹出提示确认信息）
> - `普通用户删除内容不会弹出提示，只有root管理员用户删除内容会有提示`
> - `所以一般普通用户用不到-f选项`
> - 参数1 参数2 ..... 参数N 表示要删除的文件或文件夹路径，空格隔开
>
> rm命令支持通配符*，用来做模糊匹配
>
> - test*
> - test
> - _test_
使用su root 并输入密码使当前用户进入管理员模式,exit命令退出
### grepi\\wc\\管道符
> 从文件中通过关键字过滤文件行
> grep [-n] 关键字 文件路径(或者内容输入)

在文件中过滤相匹配的内容
![Pasted image 20240813113115.png](Pasted%20image%2020240813113115.png)
![Pasted image 20240813113134.png](Pasted%20image%2020240813113134.png)
> 统计文件的行数、单词数量
> wc [-c -m -l -w] 文件路径
>
> - 选项，-c，统计bytes数量
> - 选项，-m，统计字符数量
> - 选项，-l，统计行数
> - 选项，-w，统计单词数量
> - 参数，文件路径，被统计的文件，可作为内容输入端口

首先要使用cat链接当前文件,才能使用grep second是字符串, 字符串中用空格必须使用引号,没有可以不用
**wc(word count)单词计数命令**
`wc` 命令的输出顺序是固定的，它总是按照以下顺序输出统计结果：
1.行数（`-l`）
2.单词数（`-w`）
3.字节数（`-c`）
4.字符数（`-m`）
**管道符**
左边的cat将读取到的所有内容作为grep的内容输入参数
![Untitled 9 19.png](Untitled%209%2019.png)
统计usr/bin文件夹内一共有多少个文件
![Untitled 10 17.png](Untitled%2010%2017.png)
管道符嵌套
![Untitled 11 17.png](Untitled%2011%2017.png)
练习
![Untitled 12 17.png](Untitled%2012%2017.png)
```C++
[sickwag@192 folder]$ cat test.txt | grep "line" | wc -l
6
[sickwag@192 folder]$ cat test.txt | grep "line" | wc -w
12
```
### echo\\tail命令
类似于print函数将echo的参数返回到屏幕中
**反引号**
反引号包围的内容会被作为命令执行
**重定向符**
\> 将左侧命令的结果，覆盖写入到符号右侧指定的文件中
\>> 将左侧命令的结果，追加写入到符号右侧指定的文件中
![Pasted image 20240813113520.png](Pasted%20image%2020240813113520.png)
tail命令查看文件尾部内容
```C++
[sickwag@192 folder]$ ls > test.txt       //将当前目录文件信息写入test
[sickwag@192 folder]$ ls / >> test.txt    //根目录文件信息
[sickwag@192 folder]$ cat.test.txt        //读取
bash: cat.test.txt: 未找到命令...
[sickwag@192 folder]$ cat test.txt
test.txt
afs
bin
boot
dev
etc
home
lib
lib64
media
mnt
opt
proc
root
run
sbin
srv
sys
tmp
usr
var
[sickwag@192 folder]$ tail -5 test.txt  //只读取尾部五行内容
srv
sys
tmp
usr
var
```
-f 自动追踪命令会使当前标签页持续运行,在其他任何地方进行的改动会在标签也中内容自动变化
ctrl+c强制停止当前命令
## 使用vi/vim编辑器
![Untitled 14 17.png](Untitled%2014%2017.png)
- 命令模式下所有的键盘输入都被理解为命令
- 输入同理,底线模式对文件进行整体操作
- 三个模式输入模式和底线模式不能直接相互进入, 进入模式是一个命令,只能通过命令模式进入
- 进入vim时默认是命令模式
![Untitled 15 17.png](Untitled%2015%2017.png)
- 命令模式下按下i键进入输入模式
- 左下角会显示文件转台和现在所处的模式
- 输入模式按下:wq表示保存并退出
- 命令模式 dd表示删除一整行, u表示撤销输入,yy表示复制一整行
![Untitled 16 16.png](Untitled%2016%2016.png)
![Untitled 17 16.png](Untitled%2017%2016.png)
![Untitled 18 15.png](Untitled%2018%2015.png)
使用vim对该文件进行编辑, 命令模式下可以看到文件的内容, 键盘移动光标,输入i可以再光标位置插入内容
# 第三章
## linux 用户权限
`su - root` 表示切换当前用户到 root 用户，su 命令表示 Switch user
![输入密码时不可见](Pasted%20image%2020240813113920.png)
![Pasted image 20240813114033.png](Pasted%20image%2020240813114033.png)
**临时超级用户权限获取：sudo**
语法：sudo 其它命令
在其它命令之前，带上 sudo，即可为这一条命令临时赋予 root 授权
但并不是所有的用户，都有权利使用 sudo，我们需要为普通用户**配置 sudo 认证**
配置方法
![visudo不是vi sudo](Pasted%20image%2020240813114442.png)
### 用户和用户组
![Pasted image 20240916203726.png](Pasted%20image%2020240916203726.png)
#### 用户组相关命令
Linux 中关于权限的管控级别有 2 个级别，分别是：
- 针对用户的权限控制
- 针对用户组的权限控制
针对某个文件，linux 中允许设置某个用户或者某个用户组对他的权限
创建用户组名 `groupadd 用户组名`
删除用户组 `groupdel 用户组名`
#### 用户相关命令
在 CentOS 系统上管理用户，我来为您详细介绍相关命令和操作：

创建用户

1. 创建用户并设置 home 目录
```bash
# 创建用户并自动创建home目录
useradd username

# 创建用户并指定home目录路径
useradd -d /path/to/home username

# 创建用户并指定用户组
useradd -g groupname username
```

2. 设置/修改用户密码
```bash
# 设置用户密码
passwd username
```
系统会提示您输入两次密码进行确认。

3. 允许密码登录
默认情况下，新创建的用户是允许密码登录的。如果需要确保 SSH 允许密码登录，检查 SSH 配置：
```bash
vi /etc/ssh/sshd_config
```
确保有以下配置：
```
PasswordAuthentication yes
ChallengeResponseAuthentication yes
```
然后重启 SSH 服务：
```bash
systemctl restart sshd
```

完整创建用户示例
```bash
# 创建用户
useradd -m -s /bin/bash john

# 设置密码
passwd john

# 确保SSH允许密码登录
systemctl restart sshd
```

查看用户信息

1. 列出所有用户
```bash
# 列出所有用户（包括系统用户）
cat /etc/passwd

# 只列出普通用户（UID >= 1000）
awk -F: '$3 >= 1000 && $3 < 65534 {print $1}' /etc/passwd

# 使用getent命令
getent passwd
```

2. 查看特定用户信息
```bash
# 查看用户基本信息
id username

# 查看用户详细信息
finger username

# 查看用户登录信息
who username

# 查看用户所属组
groups username
```

3. 查看用户配置文件
```bash
# 查看/etc/passwd中用户信息
grep username /etc/passwd

# 查看/etc/shadow中密码信息（需要root权限）
grep username /etc/shadow

# 查看/etc/group中组信息
grep username /etc/group
```

删除用户

1. 删除用户但保留 home 目录
```bash
userdel username
```

2. 删除用户同时删除 home 目录
```bash
userdel -r username
```

3. 强制删除（即使用户已登录）
```bash
userdel -f -r username
```

其他有用的用户管理命令

修改用户属性
```bash
# 修改用户home目录
usermod -d /new/home/dir username

# 修改用户登录名
usermod -l newname oldname

# 修改用户UID
usermod -u new_uid username

# 锁定用户账户
usermod -L username

# 解锁用户账户
usermod -U username
```

查看用户登录情况
```bash
# 查看当前登录用户
who

# 查看用户登录历史
last username

# 查看用户最近登录信息
lastlog -u username
```

安全建议

1. **设置强密码策略**：
```bash
# 编辑密码策略
vi /etc/security/pwquality.conf
```

2. **定期检查用户**：
```bash
# 检查空密码用户
awk -F: '($2 == "") {print $1}' /etc/shadow

# 检查非活动用户
lastlog -b 90
```

3. **限制用户权限**：
- 避免将普通用户加入 wheel 组（sudo 权限）
- 使用适当的文件权限

这些命令应该能帮助您有效地管理 CentOS 服务器上的用户账户。记得在删除用户前备份重要数据！


### 文件和权限
#### 查看文件权限
![Pasted image 20240916211937.png](Pasted%20image%2020240916211937.png) ![Pasted image 20240916212211.png](Pasted%20image%2020240916212211.png)
文件所属用户权限分为十个权限槽，分为四个组
对于各种文件权限缩写含义
那么，rwx 到底代表什么呢？
- `r` 表示读权限
- `w` 表示写权限
- `x` 表示执行权限
**针对文件、文件夹的不同，rwx 的含义有细微差别**
- `r`，针对文件可以查看文件内容
针对文件夹，可以查看文件夹内容，如 ls 命令
- `w`，针对文件表示可以修改此文件
针对文件夹，可以在文件夹**内**：创建、删除、改名等操作
- `x`，针对文件表示可以将文件作为程序执行
针对文件夹，表示可以更改工作目录到此文件夹，即 cd 进入
对文件（夹）进行操作时，首先判断当前登录用户是否是文件所属用户（第二组槽位）, 然后判断当前登录用户是否属于其用户组（第三组槽位），最后判断是否是其他权限
#### 修改文件权限
首要注意：只有文件夹，文件所属用户或者 root 用户可以修改文件的权限信息
命令 `chmod [-R] 权限 文件或文件夹`
选项：-R，对文件夹**内的全部内容**应用同样的操作
`chmod u=rwx, g=rx, 0=x hello.txt`，将文件权限修改为: rwxr-x--x
其中：u 表示 user 所属用户权限，g 表示 group 组权限，o 表示 other 其它用户权限
`chmod-R u=rwx, g=rx, O=x test`，将文件夹 test 以及文件夹内全部内容权限设置为：rwxr-x--x
![Pasted image 20240917095149.png](Pasted%20image%2020240917095149.png)
#### 通过数字修改权限
权限可以用 3 位数字分别代表用户权限，用户组权限，其它用户权限。
数字的细节如下: **r 记为 4, w 记为 2, x 记为 1**，可以有:
- 0: 无任何权限, 即---
- 1: 仅有 x 权限, 即--X
- 2: 仅有 w 权限即-W-
- 3：有 w 和 x 权限即-WX
- 4: 仅有 r 权限即 r--
- 5: 有 r 和 x 权限即 r-x
- 6: 有 r 和 w 权限即 rW-
- 7: 有全部权限即 rwx
所以 751 表示: rwx (7) r-x (5)--x (1)
#### chown 修改文件所属权限
语法: `chown[-R]【用户][：][用户组】文件或文件夹`
选项，-R，同chmod，对文件夹内全部内容应用相同规则
选项，用户，修改所属用户
选项，用户组，修改所属用户组
：用于分隔用户和用户组
- chownroothello. txt，将 hello. txt 所属用户修改为 root
- chown: roothello. txt，将 hello. txt 所属用户组修改为 root
- chownroot: itheimahello. txt，将 hello. txt 所属用户修改为 root，用户组修改为 itheima
- chown-Rroottest，将文件夹 test 的所属用户修改为 root 并对文件夹内全部内容应用同样规则
# 第四章
### 使用技巧
#### 快捷键
- Ctrl+C 可以将当前命令取消输入（另起一行重新输入），或者中断现在进行的命令
- Ctrl+D 可以退出特定程序的专属页面（不能退出 vim），python 解释器、退出当前用户也可以用
- exit 退出当前登录的用户，（如果在 finnalshell 中使用将断开主机连接）
- history 查看最近输入的 1000 条命令，存储在 `~/.bash_history` 文件中，可以通过 vim 修改
[关于history命令详细内容](Linux%20long%20text%20explanation.md#history%20命令)
- 使用 `!string` 表示在 history 记录中从下到上搜索以 string 开头的命令并执行（一次）
 - ctrl + R 可以输入内容匹配历史命令，回车执行，左右键移动光标（不需要事先使用 history）
- ctrl+a，跳到命令开头
- ctrl+e，跳到命令结尾
- ctrl+键盘左键，向左跳一个单词
- ctrl+键盘右键，向右跳一个单词
- ctrl + l 等同于 clear

#### 软件相关
##### 安装软件
yum：RPM 包软件管理器，用于自动化安装配置 Linux 软件，并可以自动解决依赖问题。
语法：`yum [-y] [install 丨 remove 丨 search] 软件名称`
选项：-y，自动确认，无需手动确认安装或卸载过程
yum 命令需要 root 权限哦，可以 su 切换到 root，或使用 sudo 提权。需要联网
Ubuntu 中自动化安装软件程序不一致，使用 apt 命令安装，语法同 yum 一致
![Pasted image 20240917113234.png](Pasted%20image%2020240917113234.png)
##### 控制软件
`systemctl` 命令控制软件启动，停止和开机自启
Linux 系统很多软件（内置或第三方）均支持使用 systemctl 命令控制：启动、停止、开机自启
能够被 systemctl 管理的软件，一般也称之为：**服务**
`语法：systemctl start丨stop丨status丨enable丨disable 服务名`
系统内置的服务比较多
- NetworkManager，主网络服务
- network，副网络服务
- firewalld，防火墙服务
- sshd，ssh 服务（FinalShell 远程登录 Linux 使用的就是这个服务）
#### 软连接
使用 `ln -s` 命令
在系统中创建软链接，可以将文件、文件夹链接到其它位置。
类似 windows 系统中《快捷方式》
语法：`ln -s` 参数 1 参数 2
- -s 选项，创建软连接
- 参数 1：被链接的文件或文件夹
- 参数 2：要链接去的目的地
实例：
`In-s/etc/yum. conf~/yum. conf`
`In-s/etc/yum~/yum`
```bash
[root@localhost sickwag]# ln -s test.txt /home/sickwag/learnlinux/test.txt
[root@localhost sickwag]# cd learnlinux
[root@localhost learnlinux]# ls
test.txt
--------------------------------------
[root@localhost learnlinux]# ls -l
总用量 0
lrwxrwxrwx. 1 root root 8 9月  16 20:49 test.txt -> test.txt
```
![Pasted image 20240917115401.png](Pasted%20image%2020240917115401.png)
#### date 命令
##### 时间格式化和计算
通过 date 命令可以在命令行中查看系统的时间
语法：`date [-d] [+格式化字符串]`
-d 按照给定的字符串显示日期，一般用于日期计算
格式化字符串：通过特定的字符串标记，来控制显示的日期格式，类似于 [Mysql日期格式化](MySQL.md#日期类型)
![Pasted image 20240917122219.png](Pasted%20image%2020240917122219.png)
- %Y 年
- %y 年份后两位数字（00,99）
- %M 月份（01,12)
- %d 日 (01,31)
- %H 小时（00,23)
- %M 1 分钟（00.59）
- %S 秒 (00,60)
- %s 自 1970-01-01 00:00:00 UTC 到现在的秒数
```bash
[root@localhost learnlinux]# date
2024年 09月 16日 星期一 21:24:06 PDT
[root@localhost learnlinux]# date +%Y-%m-%d-%H-%M-%S
2024-09-16-21-25-59
[root@localhost learnlinux]# date +"%Y-%m-%d %H:%M:%S"
2024-09-16 21:27:16
```
![Pasted image 20240917122753.png](Pasted%20image%2020240917122753.png)
-d 参数用于计算日期
![Pasted image 20240917152716.png](Pasted%20image%2020240917152716.png)
```bash
[root@localhost learnlinux]# date -d "+3month" "+%y-%m-%d     %H:%M:%S"
24-12-16     23:31:35
```
##### 修改时区
Linux 中时区文件存储在 `/usr/share/zoneinfo/` 文件夹中即其子目录汇总，通过软连接形式链接到 `/etc/localtime`，通过下面命令首先移除现有的软连接，再链接新的中国（东八区文件）
```bash
[root@localhost learnlinux]# rm -f /etc/localtime
[root@localhost learnlinux]# ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
[root@localhost learnlinux]# date
2024年 09月 17日 星期二 15:35:08 CST
```
##### 使用 ntp 自动更新时间
[CSDN Linux \> 无法安装 ntp 服务](CSDN%20Linux.md#无法安装%20ntp%20服务)
使用新的安装方法并设置为自启动，定时自动联网校准时间
```bash
yum install chrony -y&& \
systemctl enable chronyd.service && \
systemctl restart chronyd.service
```
手动校准时间方法
`ntpdate -u ntp.aliyun.com` 现版本已经弃用，找不到 ntpdate 命令
#### IP 地址和主机名
##### IP 地址
`ifconfig` 可以查看当前主机 IP 地址
![Pasted image 20240917154953.png](Pasted%20image%2020240917154953.png)
```bash
[root@localhost learnlinux]# ifconfig
ens160: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.213.128  netmask 255.255.255.0  broadcast 192.168.213.255
        inet6 fe80::20c:29ff:fe0c:fbf9  prefixlen 64  scopeid 0x20<link>
        ether 00:0c:29:0c:fb:f9  txqueuelen 1000  (Ethernet)
        RX packets 452558  bytes 81035765 (77.2 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 695916  bytes 215597374 (205.6 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
virbr0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        inet 192.168.122.1  netmask 255.255.255.0  broadcast 192.168.122.255
        ether 52:54:00:7b:da:36  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```
其中 ens 160 表示本机网卡，lo 表示本地网卡，virbr 0 表示虚拟机网卡
![Pasted image 20240917155145.png](Pasted%20image%2020240917155145.png)
##### 主机名
Linux 中主机名同 Windows 一样可以查看和修改
`hostname` 查看主机名
`hostnamectl set-hostname 主机名` 修改主机名需要 root 权限
重启 finalshell 既可看到用户名
![主机名被修改](Pasted%20image%2020240917155859.png)
##### 域名解析原理
![Pasted image 20240917160651.png](Pasted%20image%2020240917160651.png)
- 首先访问本地 host 文件查找网站域名接入的 IP 地址然后浏览器访问 ip 地址
- 本地不存在则访问 DNS 服务器（即 114.114.114.114）这种域名解析网站查找，没有结果则会**404**

##### IP 地址和主机名映射设置
域名解析原理得知 Windows 首先查找本地 IP 地址映射，这里修改本地 host 文件将主机名映射到IP 地址
![Pasted image 20240917204900.png](Pasted%20image%2020240917204900.png)
在 host 文件中添加主机名和 IP 地址之后在 finnalshell 中可以将主机名作为映射连接到相应的 IP 地址
##### 配置 vm 的固定 IP 地址
配置固定 IP 地址使其不用每次都连接
1. 在 VMwareWorkstation（或 Fusion）中配置 IP 地址网关和网段（IP 地址的范围）
2. 在 Linux 系统中手动修改配置文件，固定 IP

##### 网络请求和下载
###### ping 命令
可以通过 ping 命令，检查指定的网络服务器是否是可联通状态
语法：ping[-cnum]ip 或主机名
选项：-C，检查的次数，不使用-c 选项，将无限次数持续检查
参数：ip 或主机名，被检查的服务器的 ip 地址或主机名地址
检查到 baidu. com 是否联通
```bash】
PING ba 1 du. com (39.156.66.20) 56（84) bytes of data
64 bytes from 39.156.66.10 (39.156.66.10): 1 cmp_seq 1 tt 1-128 tine=8
64 bytes from 39.156.66.10 (39.156.66.10): 1 cmp_seq*2 ttl=128 tine=7.65
64 bytes from 39.156.66.10 (39.156.66.10)
```
结果表示联通，延迟 8 ms 左右
###### wget 命令
 `wget [-b ] url` 表示将将链接中文件下载到当前工作目录，-b 表示后台下载，后台下载的下载进度会保存在 wgetlog 文件中，使用 `tail -f wget log` 持续跟踪下载进度
###### curl 命令
curl 可以发送 http 网络请求，可用于：下载文件、获取信息等
语法：curl[-o]url
选项：-0，用于下载文件，当 url 是下载链接时，可以使用此选项保存文件
参数：url, 要发起请求的网络地址
cip. cc 可以返回主机的 IP 地址，对普通的网站使用请求将返回网页 html 源码
```bash
[root@sickwag ~]# curl cip.cc
IP      : 223.160.147.210
地址    : 中国  北京
运营商  : chinabtn.com
数据二  : 中国吉林 | 广电网
数据三  : 中国北京北京市 | 广电
URL     : http://www.cip.cc/223.160.147.210
[root@sickwag ~]# curl www.baidu.com
<!DOCTYPE html>
<!--STATUS OK--><html> <head><meta http-equiv=content-type content=text/html;charset=utf-8><meta http-equiv=X-UA-Compatible content=IE=Edge><meta content=always name=referrer><link rel=stylesheet type=text/css href=http://s1.bdstatic.com/r/www/cache/bdorz/baidu.min.css><title>百度一下，你就知道</title></head> <body link=#0000cc> <div id=wrapper> <div id=head> <div.........................................................。
```
本质上浏览器也是用 curl 命令请求网页，再通过内核渲染 html 源码，展现出网页
### 网络传输
端口，是设备与外界通讯交流的出入口。端口可以分为：物理端口和虚拟端口两类
物理端口：又可称之为接口，是可见的端口，如 USB 接口，RJ 45 网口，HDMI 端口等
虚拟端口：是指计算机内部的端口，是不可见的，是用来操作系统和外部进行交互使用的
IP 地址只能访问主机，需要锁定计算机中某个程序时需要端口确定
![Pasted image 20240918155952.png](Pasted%20image%2020240918155952.png)
Linux 系统是一个超大号小区，可以支持 65535 个端口，分 3 类使用：
- **公认端口**：1~1023，通常用于一些系统内置或知名程序的预留使用，如 SSH 服务的 22 端口，HTTPS 服务的 443 端口，非特殊需要，不要占用这个范围的端口
- **注册端口**：1024~49151，通常可以随意使用，用于松散的绑定一些程序\服务
- **动态端口**：49152~65535，通常不会固定绑定程序，而是当程序对外进行网络链接时，用于临时使用
#### nmap 命令查看主机端口
`nmap` 命令可以查看某个 IP 地址暴露的端口
```bash
Nmap scan report for localhost (127.0.0.1)
Host is up (0.0000090s latency).
Not shown: 997 closed ports
PORT    STATE SERVICE
22/tcp  open  ssh
111/tcp open  rpcbind
631/tcp open  ipp
Nmap done: 1 IP address (1 host up) scanned in 1.67 seconds
```
使用本机地址扫描端口
#### netstat 命令查看端口占用
`netstat -anp | grep 端口号` 可以查看端口被哪个程序占用
```bash
[root@sickwag ~]# netstat -anp | grep 111
tcp        0      0 0.0.0.0:111             0.0.0.0:*               LISTEN      1/systemd
tcp6       0      0 :::111                  :::*                    LISTEN      1/systemd
.............................................。
```
LISTEN 表示端口正在监听，netstat 命令可以搜索层序名或者端口号，所以可以用来判断端口是否空闲
### 进程管理
为管理运行的程序，每一个程序在运行的时候，便被操作系统注册为系统中一个进程分配一个独有的：进程 ID（进程号）
#### ps 命令
可以通过 ps 命令查看 Linux 系统中进程信息
语法：`ps[-e-f]`
选项：`-e`，显示出全部的进程
选项：`-f`，以完全格式化的形式展示信息（展示全部信息）
一般来说，固定用法就是：bs-ef 列出全部进程的全部信息
```bash
[root@sickwag ~]# ps -ef
UID          PID    PPID  C STIME TTY          TIME CMD
root           1       0  0 15:39 ?        00:00:02 /usr/lib/systemd/systemd
root           2       0  0 15:39 ?        00:00:00 [kthreadd]
root           3       2  0 15:39 ?        00:00:00 [rcu_gp]
root           4       2  0 15:39 ?        00:00:00 [rcu_par_gp]
```
![Pasted image 20240918165534.png](Pasted%20image%2020240918165534.png)
time 表示累计占用 CPU 的之间，cmd 表示启动命令
组合命令 `ps -ef | grep tail` 表示过滤出 tail 有关的进程信息，过滤字符串可以是任意一个**字段**
```bash
[root@sickwag ~]# ps -ef | grep tail
root      209416    2291  0 16:58 pts/0    00:00:00 grep --color=auto tail
```
#### kill 命令
在 Windows 系统中，可以通过任务管理器选择进程后，点击结束进程从而关闭它。
同样，在 Linux 中，可以通过 kill 命令关闭进程。
语法：`kill [-9] 进程 ID`
选项：-9，表示强制关闭进程。不使用此选项会向进程发送信号要求其关闭，但否关闭看进程自身的处理机制
在另外窗口中打开 tail 命令但不输入指令（未退出进程）
```bash
[root@sickwag ~]# ps -ef | grep tail
root      232600  231869  0 17:07 pts/2    00:00:00 tail
root      233286    2291  0 17:07 pts/0    00:00:00 grep --color=auto tail
[root@sickwag ~]# kill 232600
[root@sickwag ~]# ps -ef | grep tail
root      235891    2291  0 17:07 pts/0    00:00:00 grep --color=auto tail
```
![另外一个窗口被终止的tail](Pasted%20image%2020240918170851.png)
### 主机状态
`top` 不加任何参数的任务管理器，查看系统任务运行状态，每五秒刷新一次，用 q 键或 ctrl+c 退出
![Pasted image 20240918171343.png](Pasted%20image%2020240918171343.png)
![Pasted image 20240918171549.png](Pasted%20image%2020240918171549.png)
#### top 命令参数列表
- `-p 进程id` 只显示某个进程的信息
- `-d 秒数` 讼置刷新时间，默认是 5 s
- `-c` 显示产生进程的完整命令，默认是进程名
- `-n 数字` 指定刷新次数，比如 `top -n 3`，刷新输出 3 次后退出
- `-b` 以非交互非全屏模式运行，以批次的方式执行 top，像查看文件一样一页一页地查看信息，一般配合-n 指定输出几次统计信息，配合 `>` 将输出重定向到指定文件，比如 `top-b-n 3>/tmp/top. tmp` `top -b -3 > 1.txt` 将任务管理器刷新的三次结果写入当前目录的 1. txt 文件中
- `-i` 不显示任何闲置（idle）或无用（zombie）的进程，只显示**正在运行的**
- `-u 用户名` 查找特定用户启动的进程
#### top 交互形式命令
当 top 以交互式运行（非-b 选项启动），可以用以下交互式命令进行控制
按键功能
- `h `，会显示帮助画面
- `c `，会显示产生进程的完整命令，等同于-c 参数，再次按下 c 键，变为默认显示
- `f `，可以选择需要展示的项目
- `M `，根据驻留内存大小（RES）排序
- `P `，根据 CPU 使用百分比大小进行排序
- `T `，根据时间/累计时间进行排序
- `E `，切换顶部内存显示单位
- `e `，切换进程内存显示单位
- `1 `，切换显示平均负载和启动时间信息。
- `i `，不显示闲置或无用的进程，等同于-i 参数，再次按下，变为默认显示
- `t `，切换显示 CPU 状态信息
- `m `，切换显示内存信息
#### 其他命令
**df 命令**显示磁盘占用信息，加-h 参数可更人性化显示空间大小
```bash
[root@sickwag ~]# df -h
文件系统        容量  已用  可用 已用% 挂载点
devtmpfs        878M     0  878M    0% /dev
tmpfs           895M     0  895M    0% /dev/shm
tmpfs           895M  9.3M  886M    2% /run
tmpfs           895M     0  895M    0% /sys/fs/cgroup
/dev/nvme0n1p3   38G  5.1G   33G   14% /
/dev/nvme0n1p1  295M  193M  103M   66% /boot
tmpfs           179M   12K  179M    1% /run/user/42
tmpfs           179M     0  179M    0% /run/user/0
```
**iostat** 查看 cpu 和磁盘信息
 语法：`iostat [-x] [num 1] [num 2]`
选项：`-X`，显示更多信息
num 1：数字，刷新间隔，num 2：数字，刷新几次
虚线内大部分是运维专业内容，一般只需要关注加粗项即可

-------------
- rrqm/s:个请求合并 Merge，提高 IO 利用率，避免重复调用）;\[每秒这个设备相关的读取请求有多少被 Merge 了（当系统调用需要读取数据的时候，VFS 将请求发到各个 FS, 如果 FS 发现不同的读取请求读取的是相同 Block 的数据，FS 会将这
- wrqm/s: 每秒这个设备相关的写入请求有多少被 Merge 了。
- rsec/s: 每秒读取的扇区数；sectors
- wsec/: 每秒写入的扇区数。
- **rKB/s**: 每秒发送到设备的读取请求数
- **WKB/s**: 每秒发送到设备的写入请求数
- avgrq-sz 平均请求扇区的大小
- avgqu-sz 平均请求队列的长度。毫无疑问，队列长度越短越好。
- await: 每一个 I 0 请求的处理的平均时间（单位是微秒毫秒）。
- svctm 表示平均每次设备 I/0 操作的服务时间（以毫秒为单位）
- **%util**: 磁盘利用率
------------------
**sar**命令查看网络状态
- IFACE 本地网卡接口的名称
- rxpck/s 每秒钟接受的数据包
- txpck/s 每秒钟发送的数据包
- **rxKB/S** 每秒钟接受的数据包大小，单位为 KB（粗略表示下载速度）
- **txKB/S** 每秒钟发送的数据包大小，单位为 KB（粗略表示上传速度）
- rxcmp/s 每秒钟接受的压缩数据包
- txcmp/s 每秒钟发送的压缩包
- rxmcst/s 每秒钟接收的多播数据包

### 环境变量
#### 查看临时变量
首先参考 [Windows 中环境变量工作原理](环境变量.md)
Windows 的运行窗口（win+R）可以认为是一个 linux 的命令行窗口
在 Linux 执行env 命令即可查看当前系统中记录的环境变量
环境变量是一种 **KeyValue** 型结构，即名称和值，在 PATH 中记录的目录中搜索命令执行文件
```bash
[root@sickwag ~]# env | grep PATH
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin
```
使用 `$ 环境变量名` 符号表示取环境变量名这个 key 的 value 值，路径列表，通过 `:` 隔开（不是分好）
`echo` 命令可以在需要返回的命令后添加字符串
```bash
[root@sickwag ~]# echo ${PATH} sickwag
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin sickwag
```
#### 自定义临时变量
临时设置，语法：`export 变量名=变量值`，换一个会话或者重启消失
永久生效：
针对当前用户生效，配置在当前用户的 `~/bashrc` 文件中
针对所有用户生效，配置在系统的：`/etc/profile` 文件中
并通过语法：**source 配置文件**，进行立刻生效，或重新登录 FinalShell 生效
在配置文件中将临时设置变量的语法写入即可
```bash
# 全局用户生效
[root@sickwag sickwag]# vim /etc/profile
[root@sickwag sickwag]# source /etc/profile
[root@sickwag sickwag]# echo $MYNAME
sickwag
```
#### 环境变量编写脚本程序
- 注意在 profile 文件中添加新运行文件需要写 `export PATH=$PATH:/home/sickwag/folder` 创建新的环境变量名为 **PATH** ，PATH 的值为原本 PATH 加上（: 的原因）aprograme 的目录，从而在运行 aprograme 之前 `echo $PATH` 得到的是完整的环境变量列表加自定义目录，而不是覆盖式的只剩下自定义目录
- 直接写 `export PATH=/home/sickwag/folder` 将覆盖原本 PATH 内容
```bash
[root@sickwag sickwag]# mkdir folder
[root@sickwag sickwag]# cd folder
[root@sickwag folder]# vim aprograme
[root@sickwag folder]# ll
总用量 4 # aprograme 中内容是 echo “Hello world”
-rw-r--r--. 1 root root 19 9月  18 18:17 aprograme #运行文件需要x权限
[root@sickwag folder]# chmod 755 aprograme
[root@sickwag folder]# ll
总用量 4
-rwxr-xr-x. 1 root root 19 9月  18 18:17 aprograme
---------------# 将运行文件放入环境变量中--------------------
[root@sickwag folder]# pwd
/home/sickwag/folder
[root@sickwag folder]# vim /etc/profile
[root@sickwag folder]# source /etc/profile
-------------------# 新的环境变量中已经记录新的路径------------------
[root@sickwag folder]# echo $PATH
/root/.local/bin:/root/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin:/home/sickwag/folder
[root@sickwag folder]# aprograme
hello world
```
### 文件上传下载
finalshell 中自带上传下载功能，选中文件右键下载，Windows 中拖拽文件到 finnalshell 中上传
也可以通过 rz、Sz 命令进行文件传输。
rz、sz 命令需要安装，可以通过：`yum-y install lrzsz`，即可安装。
`rz/sz 需要上传或下载的文件名` 文件名可以不加后缀
rz 上传文件可以不用写路径，用会弹出窗口选择，这种方式上传速度很慢，sz 必须要路径
### 文件压缩解压
#### 压缩格式
- zip 格式：Linux、Windows、MacOS，常用
- 7 zip: Windows 系统常用
- rar: Windows 系统常用
- tar: Linux、MacOS 常用
- gzip: Linux、MacOS 常用
#### 压缩命令
##### tar
Linux 和 Mac 系统常用有 2 种压缩格式，后缀名分别是：
.tar，称之为 tarball，归档文件，即简单的将文件组装到一个. tar 的文件内，并没有太多文件体积的减少，仅仅是简单
的封装
.gz，也常见为. tar. gz，gzip 格式压缩文件，即使用 gzip 压缩算法将文件压缩到一个文件内，可以极大的减少压缩后的
体积
针对这两种格式，使用 tar 命令均可以进行压缩和解压缩的操作
语法：tar[-c-V-x-f-z-C]参数 1 参数 2... 参数 N
`-c`, 创建压缩文件，用于压缩模式
`-v`, 显示压缩、解压过程，用于查看进度，每压缩、解压完成一个文件，返回一次文件名
`-X`, 解压模式
`-f`，要创建的文件，或要解压的文件，-f 选项必须在所有选项中位置处于最后一个
`-z`, gzip 模式，不使用-z 就是普通的 tarball 格式
`-C`，选择解压的目的地，用于解压模式
实例
tar 的常用组合为：
`tar-cvf test.tar 1.txt 2.txt 3.txt`
将 1. txt 2. txt 3. txt 压缩到 test. tar 文件内
`tar -zcvf test.tar. gz 1.txt 2.txt 3.txt`
将 1. txt 2. txt 3. txt 压缩到 test. tar. gz 文件内，使用 gzip 模式
##### zip
语法：`zip [-r] 参数 1 参数 2... 参数 N`
-r，被压缩的包含文件夹的时候，需要使用-r 选项，和 rm、cp 等命令的-r 效果一致
`zip test.zip a.txt b.txt c.txt`
将a.txtb. txtc. txt 压缩到 test. zip 文件内
`zip -r test.zip test itheima a.txt`
将 test、itheima 两个文件夹和a.txt 文件，压缩到 test. zip 文件内
#### 解压命令
**注意解压出的内容如果有同名内容会被替换**
##### tar 和 gz
`tar-xvftest. tar`
解压 test. tar，将文件解压至当前目录
`tarxvftest. tar-C/home/itheima`
解压 test. tar，将文件解压至指定目录（/home/itheima）
`tar-zxvftest. tar. gz-C/home/itheima`
以 Gzip 模式解压 test. tar. gz，将文件解压至指定目录
*一般将 `-C` 单独写在最后，`-z` 写在开头* 保持命令可读性
解压到指定位置
```bash
[root@sickwag ~]# tar -xvf test.tar -C /home/sickwag
1.txt
[root@sickwag ~]# ls -lh
总用量 112K
-rw-------. 1 root root 2.8K 9月  16 22:41 anaconda-ks.cfg
-rw-r--r--. 1 root root   44 9月  18 18:08 bashrc
-rw-------. 1 root root 2.1K 9月  16 22:42 original-ks.cfg
-rw-r--r--. 1 root root 4.5K 9月  18 19:12 testgzip.gz
-rw-r--r--. 1 root root  90K 9月  18 19:05 test.tar
lrwxrwxrwx. 1 root root   12 9月  17 11:51 yum.conf -> etc/yum.conf
[root@sickwag ~]# pwd
/root
[root@sickwag ~]# cd /home/sickwag
[root@sickwag sickwag]# ls -lg
总用量 92
-rw-r--r--. 1 root    81004 9月  18 17:22 1.txt
```
需要解压 tar --- `tar -cvf`,
需要解压 gz --- `tar -zcvf`
##### zip
`unzip [-d] 参数`
-d，指定要解压去的位置，同 tar 的-C 选项
参数，被解压的 zip 压缩包文件
# 第五章
## linux 部署软件
文档参考： [Linux系统软件安装](Linux系统软件安装.md)
注意所有 IP 地址访问软件页面 IP 地址是虚拟机的 IP 地址，可以在虚拟机中使用 `127.0.0.1:端口` 访问，但在外部 Windows 中不能用本机回环地址，要用虚拟机的 192 地址
### MySQL
使用 8. x 版本安装
按部就班即可
- **初始密码获取**：`grep 'temporary password' /var/log/mysqld.log` 从文件中过滤 password 字段
```bash
[root@sickwag sickwag]# grep 'temporary password' /var/log/mysqld.log
2024-09-18T12:23:21.516758Z 6 [Note] [MY-010454] [Server] A temporary password is generated for root@localhost: =*qr=ollK31E
```
- 第一次设置远程连接或 MySQL 启动密码时，需要密码有大小写字母，特殊符号和数字，否则不能调整密码强度设置简单的密码

### Tomcat
- 下载好的文件放在 `/home/sickwag/download_files` 文件夹中
- 通过软连接链接文件夹目的是使保留版本号可查，更新之后只需要更改软连接指向即可使用新版本
- java_home 在配置环境变量中是为了防止使用新 Java 版本导致环境变量错乱。使用 java_home 中转，有新的 Java 版本只需要修改 java_home 即可
- 删除系统 java 目的是使用自己版本的 java
```bash
[root@sickwag server]# which java
/usr/bin/java
```
Tomcat 一般使用普通用户创建，防止网站被黑而拿到本机 linux root 权限
- `chown -R tomcat:tomcat /export/server/*tomcat*` 作用是修改 tomcat 所有子文件（夹）属于 tomcat 用户
- \*表示通配符匹配所有含有 tomcat 的文件夹，不用输入版本号
```shell
[root@sickwag server]# chown -R tomcat:tomcat /export/server/*tomcat*
[root@sickwag server]# su tomcat
[tomcat@sickwag server]$ /export/server/tomcat/bin/startup.sh
Using CATALINA_BASE:   /export/server/tomcat
Using CATALINA_HOME:   /export/server/tomcat
Using CATALINA_TMPDIR: /export/server/tomcat/temp
Using JRE_HOME:        /export/server/jdk
Using CLASSPATH:       /export/server/tomcat/bin/bootstrap.jar:/export/server/tomcat/bin/tomcat-juli.jar
Using CATALINA_OPTS:
Tomcat started.
[tomcat@sickwag server]$ netstat -anp | grep 8080
(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
tcp6       0      0 :::8080                 :::*                    LISTEN      1372012/java
```
- 为了在虚拟机外部链接 8080 端口，需要关闭 linux 内部的防火墙，linux 内部可用 `curl 虚拟机IP地址:8080` 访问到网页 html 源码但外部 Windows 浏览器被禁止 ^1a483c

### nginx
和 tomcat 同理
### RabbitMQ
- 需要开放 5672、15672、25672 三个端口
```bash
# 方式1（推荐），关闭防火墙
systemctl stop firewalld		# 关闭
systemctl disable firewalld		# 关闭开机自启
# 方式2，放行5672 25672端口
firewall-cmd --add-port=5672/tcp --permanent		# 放行tcp规则下的5672端口，永久生效
firewall-cmd --add-port=15672/tcp --permanent		# 放行tcp规则下的15672端口，永久生效
firewall-cmd --add-port=25672/tcp --permanent		# 放行tcp规则下的25672端口，永久生效
firewall-cmd --reload								# 重新加载防火墙规则
```
- 启动 RabbitMQ 控制台命令
`rabbitmq-plugins enable rabbitmq_management`
配置用户密码
```bash
# 设置控制台用户名(admin)和密码(sickwag)
[root@sickwag server]# rabbitmqctl add_user admin 'sickwag'
Adding user "admin" ...
Done. Don't forget to grant the user permissions to some virtual hosts! See 'rabbitmqctl help set_permissions' to learn more.
# 设置账号权限
[root@sickwag server]# rabbitmqctl set_permissions -p "/" "admin" ".*" ".*" ".*"
Setting permissions for user "admin" in vhost "/" ...
# 标记admin用户的管理员标签
[root@sickwag server]# rabbitmqctl set_user_tags admin administrator
Setting tags for user "admin" to [administrator] ...
```
在 [RabbitMQ Management](http://192.168.179.128:15672/#/) 中输入账号密码即可
### redis
同上
### elasticsearch
按照文档走，但还未解决无法连接上[主机 IP 地址:9200](连接主机控制台) 问题
### 集群化环境前置准备
创建多台虚拟机之后 [Linux long text explanation \> centos 修改 linuxIP 地址](Linux%20long%20text%20explanation.md#centos%20修改%20linuxIP%20地址)
在修改 IP 地址时，由于没有实现设置静态 IP，所以 ifcfg 文件中内容与视频中不一样，并且 centos 8 以上版本中**重启网络服务旧命令已被弃用**
`systemctl restart network` 已被弃用，改用 `nmcli c reload`
使用前面的命令会出现错误提示
```shell
Failed to restart network.service: Unit network.service not found.
```
三台主机的 UUID 需要区分，只需要不统即可，在这里记录
```shell
UUID=b01de10d-1d51-48f3-bd7f-4927155f 7dba
UUID=b01de10d-1d51-48f3-bd7f-4927155f 8dba
UUID=b01de10d-1d51-48f3-bd7f-4927155f 9dba
```
在 Windows 中配置 host 文件方便外部访问，linux 中配置 host（在/etc/hosts）方便 ssh 跳转
在多台虚拟机 finnalshell 终端中使用 ssh 跳转链接命令 `ssh 账户名@hostname`
### scp 命令
#### 语法
scp [-r] 参数1 参数2
- -r选项用于复制文件夹使用，如果复制文件夹，必须使用-r
- 参数1：本机路径 或 远程目标路径
- 参数2：远程目标路径 或 本机路径

`scp -r /export/server/jdk root@node2 :/export/server/`
将本机上的jdk文件夹， 以root的身份复制到node2的/export/server/内
同SSH登陆一样，账户名可以省略（使用本机当前的同名账户登陆）
`scp -r node2:/export/server/jdk /export/server/`
将远程node2的jdk文件夹，复制到本机的/export/server/内
#### 高级用法
```shell
cd /export/server
scp -r jdk node2:`pwd`/    # 将本机当前路径的jdk文件夹，复制到node2服务器的同名路径下
scp -r jdk node2:$PWD      # 将本机当前路径的jdk文件夹，复制到node2服务器的同名路径下
```
### zookeeper
- 使用软连接链接时注意，解压出的文件夹名可能为 apache-zookeeper-3.5.9 -bin，所以链接软连接时需要使用 `ln -s /export/server/apache-zookeeper-3.5.9 ` 路径
- 刚刚解压文件后在 `/export/server/zookeeper/conf` 路径中有一个默认配置文件（zookeeper_sample），将其用 `rm zookeeper_sample.cfg zook.zfg` 改名后配置相关参数
- myid 的目的是标识主机是哪一台，1 表示 node 1 主机
- zookeeper 启动命令是 `/export/server/zookeeper/bin/zkServer.sh start`

### kafka
- 启动 kafka 命令中 `/export/server/kafka/bin/kafka-server-start.sh /export/server/kafka/config/server.properties` 前一个是启动命令，后一个是配置文件路径，表示根据配置文件的方式启动
- 前台启动 kafka 在 finnalshell 关闭或 Ctrl+C 就会立即退出，一般不执行，需要后台启动时使用方式二静默运行，同时进行其他操作
- nohup 命令后接受的所有参数（程序执行路径）都表示会在后台运行，用 `&` 符号表示结束
```shell
# 请先确保Zookeeper已经启动了
# 方式1：【前台启动】分别在node1、2、3上执行如下语句
/export/server/kafka/bin/kafka-server-start.sh /export/server/kafka/config/server.properties
# 方式2：【后台启动】分别在node1、2、3上执行如下语句
nohup /export/server/kafka/bin/kafka-server-start.sh /export/server/kafka/config/server.properties 2>&1 >> /export/server/kafka/kafka-server.log &
# 出现重定向错误时，使用下面的命令
nohup /export/server/kafka/bin/kafka-server-start.sh /export/server/kafka/config/server.properties 2>&1 >> /export/server/kafka/kafka-server.log 2>&1 &
```
- kafka 的消息队列功能在两个终端中传输信息
1. 创建测试主题

```shell
# 在node1执行，创建一个主题
/export/server/kafka_2.12-2.4.1/bin/kafka-topics.sh --create --zookeeper node1:2181 --replication-factor 1 --partitions 3 --topic test
```
2. 运行测试，请在 FinalShell 中打开 2 个 node 1 的终端页面

```shell
# 打开一个终端页面，启动一个模拟的数据生产者
/export/server/kafka_2.12-2.4.1/bin/kafka-console-producer.sh --broker-list node1:9092 --topic test
# 再打开一个新的finnalshell终端页面（node2），在启动一个模拟的数据消费者
/export/server/kafka_2.12-2.4.1/bin/kafka-console-consumer.sh --bootstrap-server node1:9092 --topic test --from-beginning
```
这样在数据产生者窗口中输入的内容、文件会从数据消费者中出来
### hadoop
### 用户切换与管理
#### 1. 切换用户
```bash
# 切换到 root 用户
su -  # 输入 root 密码后进入
# 切换到其他用户（如 user1）
su - user1  # 输入目标用户密码
```
#### 2. 修改密码
```bash
# 修改当前用户密码
passwd
# 修改其他用户密码（需 root 权限）
sudo passwd 用户名
```
#### 3. 创建用户
```bash
# 创建新用户（如 user2）
sudo useradd user2
# 创建用户并指定家目录、初始组、UID 等
sudo useradd -d /home/user2 -g users -u 1002 user2
```
#### 4. 删除用户
```bash
# 仅删除用户（保留家目录）
sudo userdel user2
# 删除用户及家目录
sudo userdel -r user2
```
#### 5. 用户组管理
```bash
# 查看当前用户所属组
groups
# 查看所有组及成员
getent group
# 创建组
sudo groupadd devteam
# 将用户添加到组
sudo usermod -aG devteam user1
```

---
### 移动文件
#### 1. 基础移动
```bash
# 将文件 file.txt 移动到 /home/user/
mv file.txt /home/user/
# 移动并重命名文件
mv file.txt /home/user/newfile.txt
```
#### 2. 移动目录
```bash
# 移动整个目录（自动递归）
mv my_folder/ /backup/
```
#### 3. 强制移动与覆盖
```bash
# 覆盖目标路径同名文件时不提示
mv -f file.txt /backup/
# 若目标存在但非目录，提示错误
mv -T file.txt /backup/
```

---
### 复制文件
#### 1. 复制单个文件
```bash
# 复制 file.txt 到 /backup/
cp file.txt /backup/
# 保留原文件权限和时间戳
cp -a file.txt /backup/
```
#### 2. 复制目录
```bash
# 递归复制整个目录（必需选项）
cp -r my_folder/ /backup/
# 压缩传输（适用于远程复制）
scp -r my_folder user@server:/backup/
```
#### 3. 复制时重命名
```bash
# 复制并重命名文件
cp file.txt /backup/newfile.txt
```

---
### 删除文件
#### 1. 删除文件
```bash
# 删除单个文件（需确认）
rm file.txt
# 强制删除且不提示
rm -f file.txt
```
#### 2. 删除目录
```bash
# 递归删除目录及内容
rm -r my_folder/
# 强制删除（不提示 + 递归）
rm -rf my_folder/
```
#### 3. 删除时保留目录结构
```bash
# 删除目录中所有内容但保留目录本身
rm -rf my_folder/* my_folder/.* 2>/dev/null
```

---
### 修改文件权限
#### 1. 修改权限（符号模式）
```bash
# 允许所有用户读取 file.txt
chmod a=r file.txt
# 为用户（u）和组（g）添加写权限
chmod ug+w file.txt
```
#### 2. 修改权限（数字模式）
```bash
# 设置所有者可读写执行，组只读，其他用户无权限
chmod 740 file.txt
```
#### 3. 修改文件属主和属组
```bash
# 修改文件所有者为 user1
sudo chown user1 file.txt
# 修改文件所有者为 user1，属组为 staff
sudo chown user1:staff file.txt
# 递归修改目录及其内容的所有者
sudo chown -R user1:staff my_folder/
```
#### 4. 查看权限
```bash
# 查看文件详细权限
ls -l file.txt
# 查看目录权限（包括隐藏文件）
ls -la my_folder/
```

---
### 总结
- **用户管理**：`su`, `passwd`, `useradd`, `userdel`, `groupadd`, `usermod`
- **移动**：`mv`（-f 强制覆盖）
- **复制**：`cp`（-r 递归复制目录）
- **删除**：`rm`（-r 删除目录，-f 强制）
- **权限**：`chmod`（符号/数字），`chown`（属主/属组）

通过上述命令，可完成 Linux 系统中用户管理、文件操作和权限控制任务。
