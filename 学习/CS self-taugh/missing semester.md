# shell
## 基本介绍
打开终端看到的内容中，
- ~表示现在的工作目录\<home>
- $表示当前身份不是 root 用户
- echo 表示将后面的字符串在屏幕上输出，当然可以使用>表示将内容输入到文件中
如果要求 shell 执行某个不是 shell 所了解的编程关键字，那么它会去咨询 _环境变量_ `$PATH`，它会列出当 shell 接到某条指令时，进行程序搜索的路径：

```shell
missing:~$ echo $PATH
# 这里将会列出环境变量path 中所有的设置
missing:~$ which echo
# 列出echo命令所属的环境变量位置
missing:~$ /bin/echo $PATH
# 在环境变量中 /bin中运行echo $PATH 命令
```

## 在 shell 中导航

### 列表信息

同 linux，ls 表示打印出当前工作目录包含文件
`ls -l /home` 命令用于列出 `/home` 目录下的所有文件和文件夹的详细信息。
- `-l` 是一个选项，表示以长格式列出信息。这通常包括文件权限、所有者、文件大小、最后修改日期等详细信息。

列表信息：`drwxr-xr-x. 2 sickwag sickwag 6 8月 13 10:18 公共`，各个部分含义如下：
1. `drwxr-xr-x.`：这是文件的权限部分。
- `d` 表示这是一个目录（directory）。
- `rwx` 表示文件所有者（owner）有读（read）、写（write）、执行（execute）的权限。
- `r-x` 表示文件所属组（group）有读和执行权限，但没有写权限。
- `r-x` 表示其他用户（others）也有读和执行权限，但没有写权限。
- `.` 表示这个目录有SELinux安全上下文（如果SELinux被启用）。
2. `2`：这是文件或目录的硬链接数（hard link count）。对于目录来说，这个数字通常表示目录中的子目录数加一（因为每个目录至少有一个硬链接指向它自己）。
3. `sickwag`：这是文件或目录的所有者用户名。
4. `sickwag`：这是文件或目录所属的用户组名。
5. `6`：这是文件或目录的大小，单位是块（block）。在这个上下文中，一个块通常是512字节。
6. `8月 13 10:18`：这是文件或目录的最后修改时间。
7. `公共`：这是文件或目录的名称。

在 shell 中，程序有两个主要的“流”：它们的输入流和输出流。当程序尝试读取信息时，它们会从输入流中进行读取，当程序打印信息时，它们会将信息输出到输出流中。

### 输入输出流

`>` 表示将 `>` 前的内容作为输入流输入到后面的对象，将命令的标准输出重定向到文件中，如果文件不存在，将会创建一个新文件；如果文件已存在，将会覆盖原有内容。
	`ls > filelist.txt` 命令会将 `ls` 命令的输出结果保存到 `filelist.txt` 文件中。
`<` 表示将 `<` 之后的对象的输出输出给前面的操作作为输入，将文件的内容作为命令的标准输入。
	例如，`sort < file.txt` 命令会将 `file.txt` 文件的内容作为 `sort` 命令的输入。

`|` 操作符允许我们将一个程序的输出和另外一个程序的输入连接起来：


### 查找命令
`sudo` 命令表示通过根用户权限执行操作，

1. `sudo`: 这是一个命令，允许用户以超级用户（root）的权限执行后续的命令。这通常需要输入当前用户的密码。
2. `find`: 这是一个强大的命令行工具，用于在文件系统中查找文件和目录。它可以根据文件名、大小、类型、修改时间等多种条件进行搜索。
3. `-L`: 这是一个选项，指示 `find` 命令跟随符号链接。如果找到的是符号链接，`find` 会使用链接指向的实际文件或目录进行搜索。
4. `/sys/class/backlight`: 这是 `find` 命令的搜索起始点，即 `/sys/class/backlight` 目录。这个目录通常包含了与系统背光控制相关的设备信息。
5. `-maxdepth 2`: 这个选项限制 `find` 命令搜索的深度为2层目录。这意味着它只会查找 `/sys/class/backlight` 目录下的直接子目录和文件，不会进入更深层的目录。
6. `-name '*brightness*'`: 这个选项指定 `find` 命令搜索文件名匹配模式 `*brightness*` 的文件。星号 `*` 是通配符，表示任意数量的任意字符。因此，这个命令会找到所有文件名中包含 "brightness" 的文件。

## shell 工具和脚本 
```shell
foo=bar
echo "$foo"  # 其中""表示一个整体，$表示引用变量，引用内容没有空格可以不使用双引号
# 打印 bar
echo '$foo'
# 打印 $foo
```
## 各种工具使用
### Vscode
#### intellisense 图标含义
参考文档：[IntelliSense](https://code.visualstudio.com/docs/editor/intellisense)
![[Pasted image 20250307144859.png]]
如果是 visual Studiio 可能会有所不同
[Class View and Object Browser Icons - Visual Studio 2017 | Microsoft Learn](https://learn.microsoft.com/zh-cn/previous-versions/visualstudio/visual-studio-2017/ide/class-view-and-object-browser-icons?view=vs-2017&viewFallbackFrom=vs-2019&redirectedfrom=MSDN)
![[Pasted image 20250307145219.png]]
![[Pasted image 20250307145230.png]]