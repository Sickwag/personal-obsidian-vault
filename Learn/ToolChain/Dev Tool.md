# clang-format
## 基本配置
大部分 c/cpp ide 都自带，随便把一个添加到环境变量中即可
vscode 中通过 clang-format 插件和 `settings.json` 设置 exe 文件路径，然后设置 `"clang-format.style": "file"` 即可使用当前目录中 `.clang-format` 配置文件，全局设置配置文件路径需要设置：`"clang-format.assumeFilename": "E:/file_storage/Manual/.clang-format"`
目前我比较喜欢的配置为：
```yaml
# 语言: None, Cpp, Java, JavaScript, ObjC, Proto, TableGen, TextProto
Language: Cpp
BasedOnStyle: LLVM
# 访问说明符(public、private等)的偏移
AccessModifierOffset: -2
# 开括号(开圆括号、开尖括号、开方括号)后的对齐: Align, DontAlign, AlwaysBreak(总是在开括号后换行)
AlignAfterOpenBracket: Align
# 连续赋值时，对齐所有等号
AlignConsecutiveAssignments: true
# 连续声明时，对齐所有声明的变量名
AlignConsecutiveDeclarations: true
# 左对齐逃脱换行(使用反斜杠换行)的反斜杠
AlignEscapedNewlinesLeft: true
# 水平对齐二元和三元表达式的操作数
AlignOperands: true
# 对齐连续的尾随的注释
AlignTrailingComments: true
# 允许函数声明的所有参数在放在下一行
AllowAllParametersOfDeclarationOnNextLine: true
# 允许短的块放在同一行
AllowShortBlocksOnASingleLine: true
# 允许短的case标签放在同一行
AllowShortCaseLabelsOnASingleLine: false
# 允许短的函数放在同一行: None, InlineOnly(定义在类中), Empty(空函数), Inline(定义在类中，空函数), All
AllowShortFunctionsOnASingleLine: Empty
# 允许短的if语句保持在同一行
AllowShortIfStatementsOnASingleLine: false
# 允许短的循环保持在同一行
AllowShortLoopsOnASingleLine: false
# 总是在定义返回类型后换行(deprecated)
AlwaysBreakAfterDefinitionReturnType: None
# 总是在返回类型后换行: None, All, TopLevel(顶级函数，不包括在类中函数),
#   AllDefinitions(所有的定义，不包括声明), TopLevelDefinitions(所有的顶级函数的定义)
AlwaysBreakAfterReturnType: None
# 总是在多行string字面量前换行
AlwaysBreakBeforeMultilineStrings: false
# 总是在template声明后换行
AlwaysBreakTemplateDeclarations: true
# false表示函数实参要么都在同一行，要么都各自一行
BinPackArguments: false
# false表示所有形参要么都在同一行，要么都各自一行
BinPackParameters: false
# 大括号换行，只有当BreakBeforeBraces设置为Custom时才有效
BraceWrapping:
  # class定义后面
  AfterClass: false
  # 控制语句后面
  AfterControlStatement: false
  # enum定义后面
  AfterEnum: false
  # 函数定义后面
  AfterFunction: false
  # 命名空间定义后面
  AfterNamespace: false
  # ObjC定义后面
  AfterObjCDeclaration: false
  # struct定义后面
  AfterStruct: false
  # union定义后面
  AfterUnion: false
  # catch之前
  BeforeCatch: true
  # else之前
  BeforeElse: true
  # 缩进大括号
  IndentBraces: false
# 在二元运算符前换行: None(在操作符后换行), NonAssignment(在非赋值的操作符前换行), All(在操作符前换行)
BreakBeforeBinaryOperators: NonAssignment
# 在大括号前换行: Attach(始终将大括号附加到周围的上下文), Linux(除函数、命名空间和类定义，与Attach类似),
#   Mozilla(除枚举、函数、记录定义，与Attach类似), Stroustrup(除函数定义、catch、else，与Attach类似),
#   Allman(总是在大括号前换行), GNU(总是在大括号前换行，并对于控制语句的大括号增加额外的缩进), WebKit(在函数前换行), Custom
#   注：这里认为语句块也属于函数
BreakBeforeBraces: Custom
# 在三元运算符前换行
BreakBeforeTernaryOperators: true
# 在构造函数的初始化列表的逗号前换行
BreakConstructorInitializersBeforeComma: true
# 每行字符的限制，0表示没有限制
ColumnLimit: 200
# 描述具有特殊意义的注释的正则表达式，它不应该被分割为多行或以其它方式改变
CommentPragmas: '^ IWYU pragma:'
# 构造函数的初始化列表要么都在同一行，要么都各自一行
ConstructorInitializerAllOnOneLineOrOnePerLine: true
# 构造函数的初始化列表的缩进宽度
ConstructorInitializerIndentWidth: 4
# 延续的行的缩进宽度
ContinuationIndentWidth: 4
# 去除C++11的列表初始化的大括号{后和}前的空格
Cpp11BracedListStyle: false
# 继承最常用的指针和引用的对齐方式
DerivePointerAlignment: false
# 关闭格式化
DisableFormat: false
# 自动检测函数的调用和定义是否被格式为每行一个参数(Experimental)
ExperimentalAutoDetectBinPacking: false
# 需要被解读为foreach循环而不是函数调用的宏
ForEachMacros: [foreach, Q_FOREACH, BOOST_FOREACH]
# 对#include进行排序，匹配了某正则表达式的#include拥有对应的优先级，匹配不到的则默认优先级为INT_MAX(优先级越小排序越靠前)，
#   可以定义负数优先级从而保证某些#include永远在最前面
IncludeCategories:
  - Regex: '^"(llvm|llvm-c|clang|clang-c)/'
    Priority: 2
  - Regex: '^(<|"(gtest|isl|json)/)'
    Priority: 3
  - Regex: '.*'
    Priority: 1
# 缩进case标签
IndentCaseLabels: false
# 缩进宽度
IndentWidth: 4
# 函数返回类型换行时，缩进函数声明或函数定义的函数名
IndentWrappedFunctionNames: false
# 保留在块开始处的空行
KeepEmptyLinesAtTheStartOfBlocks: true
# 开始一个块的宏的正则表达式
MacroBlockBegin: ''
# 结束一个块的宏的正则表达式
MacroBlockEnd: ''
# 连续空行的最大数量
MaxEmptyLinesToKeep: 1
# 命名空间的缩进: None, Inner(缩进嵌套的命名空间中内容), All
NamespaceIndentation: Inner
# 使用ObjC块时缩进宽度
ObjCBlockIndentWidth: 4
# 在ObjC的@property后添加一个空格
ObjCSpaceAfterProperty: false
# 在ObjC的protocol列表前添加一个空格
ObjCSpaceBeforeProtocolList: true
# 在call(后对函数调用换行的penalty
PenaltyBreakBeforeFirstCallParameter: 19
# 在一个注释中引入换行的penalty
PenaltyBreakComment: 300
# 第一次在<<前换行的penalty
PenaltyBreakFirstLessLess: 120
# 在一个字符串字面量中引入换行的penalty
PenaltyBreakString: 1000
# 对于每个在行字符数限制之外的字符的penalty
PenaltyExcessCharacter: 1000000
# 将函数的返回类型放到它自己的行的penalty
PenaltyReturnTypeOnItsOwnLine: 60
# 指针和引用的对齐: Left, Right, Middle
PointerAlignment: Left
# 允许重新排版注释
ReflowComments: true
# 允许排序#include
SortIncludes: true
# 在C风格类型转换后添加空格
SpaceAfterCStyleCast: false
# 在赋值运算符之前添加空格
SpaceBeforeAssignmentOperators: true
# 开圆括号之前添加一个空格: Never, ControlStatements, Always
SpaceBeforeParens: Never
# 在空的圆括号中添加空格
SpaceInEmptyParentheses: false
# 在尾随的评论前添加的空格数(只适用于 //)
SpacesBeforeTrailingComments: 2
# 在尖括号的<后和>前添加空格
SpacesInAngles: false
# 在容器(ObjC和JavaScript的数组和字典等)字面量中添加空格
SpacesInContainerLiterals: true
# 在C风格类型转换的括号中添加空格
SpacesInCStyleCastParentheses: false
# 在圆括号的(后和)前添加空格
SpacesInParentheses: false
# 在方括号的[后和]前添加空格，lamda表达式和未指明大小的数组的声明不受影响
SpacesInSquareBrackets: false
# 标准: Cpp03, Cpp11, Auto
Standard: Auto
# tab宽度，这里有一个问题，在vscode中是正常的4个空格宽度，而qt中填8才是4个空格宽度，可在prefence->C++->code style中实时预览
TabWidth: 4
# 使用tab字符: Never, ForIndentation, ForContinuationAndIndentation, Always
UseTab: Always
```
- 注意，`:` 后一定要跟一个空格，不然会报错
无注释版
```yaml
Language: Cpp
BasedOnStyle: LLVM
AccessModifierOffset: -4
AlignAfterOpenBracket: Align
AlignConsecutiveAssignments: true
AlignConsecutiveDeclarations: true
AlignEscapedNewlinesLeft: true
AlignOperands: true
AlignTrailingComments: true
AllowAllParametersOfDeclarationOnNextLine: true
AllowShortBlocksOnASingleLine: true
AllowShortCaseLabelsOnASingleLine: false
AllowShortFunctionsOnASingleLine: Empty
AllowShortIfStatementsOnASingleLine: false
AllowShortLoopsOnASingleLine: false
AlwaysBreakAfterDefinitionReturnType: None
AlwaysBreakAfterReturnType: None
AlwaysBreakBeforeMultilineStrings: false
AlwaysBreakTemplateDeclarations: true
BinPackArguments: false
BinPackParameters: true
BraceWrapping:
  AfterClass: false
  AfterControlStatement: false
  AfterEnum: false
  AfterFunction: false
  AfterNamespace: false
  AfterObjCDeclaration: false
  AfterStruct: false
  AfterUnion: false
  BeforeCatch: true
  BeforeElse: true
  IndentBraces: false
BreakBeforeBinaryOperators: NonAssignment
BreakBeforeBraces: Custom
BreakBeforeTernaryOperators: true
BreakConstructorInitializersBeforeComma: true
ColumnLimit: 200
CommentPragmas: '^ IWYU pragma:'
ConstructorInitializerAllOnOneLineOrOnePerLine: false
ConstructorInitializerIndentWidth: 4
ContinuationIndentWidth: 4
Cpp11BracedListStyle: false
DerivePointerAlignment: false
DisableFormat: false
ExperimentalAutoDetectBinPacking: false
ForEachMacros: [foreach, Q_FOREACH, BOOST_FOREACH]
IncludeCategories:
  - Regex: '^"(llvm|llvm-c|clang|clang-c)/'
    Priority: 2
  - Regex: '^(<|"(gtest|isl|json)/)'
    Priority: 3
  - Regex: '.*'
    Priority: 1
IndentCaseLabels: false
IndentWidth: 4
IndentWrappedFunctionNames: false
KeepEmptyLinesAtTheStartOfBlocks: true
MacroBlockBegin: ''
MacroBlockEnd: ''
MaxEmptyLinesToKeep: 1
NamespaceIndentation: Inner
ObjCBlockIndentWidth: 4
ObjCSpaceAfterProperty: false
ObjCSpaceBeforeProtocolList: true
PenaltyBreakBeforeFirstCallParameter: 19
PenaltyBreakComment: 300
PenaltyBreakFirstLessLess: 120
PenaltyBreakString: 1000
PenaltyExcessCharacter: 1000000
PenaltyReturnTypeOnItsOwnLine: 60
PointerAlignment: Left
ReflowComments: true
SortIncludes: true
SpaceAfterCStyleCast: false
SpaceBeforeAssignmentOperators: true
SpaceBeforeParens: Never
SpaceInEmptyParentheses: false
SpacesBeforeTrailingComments: 2
SpacesInAngles: false
SpacesInContainerLiterals: true
SpacesInCStyleCastParentheses: false
SpacesInParentheses: false
SpacesInSquareBrackets: false
Standard: Cpp11
TabWidth: 4
UseTab: Always
```
## qt 配置 clang-format
调整代码风格不会作用在按下格式化快捷键时的格式化逻辑
![[PixPin_2026-01-05_22-33-56.png]]
调整美化器来将效果实施到真正的格式化上
![[Pasted image 20260105223521.png]]

## 常用命令
```bash
# 格式化单个文件
clang-format -i -style=file:/path/to/config file.cpp

# 格式化所有c/cpp文件（bash版）
find /path/to/folder  -name "*.[ch]" -o -name "*.[ch]pp" | xargs clang-format -i -style=file:"E:/file_storage/Manual/.clang-format"

# powershell版
ls /path/to/folder -Recurse -Include "*.c","*.cpp","*.h","*.hpp" | % { clang-format -i $_.FullName  -style=file:"E:/file_storage/Manual/.clang-format"}
```
# Vim
## Vim tutorial interactive doc
可以从终端中使用 `vimtutor` 启动 vim 编辑器中教程文档。
使用 dw 功能删除单词时注意要放在单词开头前一个空格位置，不然从单词的第一个字母删除会多留下一个空格
`d$` 删除从光标位置到行尾位置的内容：d 表示删除，$是移动命令符号，光标移动到行尾的意思
大多数改变文件内容的操作由一个操作符和动作构成，比如上面的 d$：
- `s` 从当前光标当前位置直到下一个单词起始处，不包括它的第一个字符
- `e` 从当前光标当前位置直到单词末尾，包括最后一个字符。
  英文状态下会忽略空格
  ![recording 5.gif](recording%205.gif)
  在中文内容中 `e` 用标点符号区分“单词”，每个标点符号也是单词
	中文语境中，删除到单词末尾，和删除到单词开头，是一样的，在一段用标点符号分割的话中使用 de 或者 dw 都是删除到下一段话的标点符号之前
	![recording 4.gif](recording%204.gif)
- `$` 从当前光标当前位置直到当前行末。

使用计数指定动作：在**动作**前输入数字可以让动作重复做，也可以在一个操作语句前加上数字表示重复操作次数
通常将光标贯标移动单开头然后使用 d 操作，这样就会删除标点符号（中文环境）
命令模式 dd 删除整行，

**撤销类命令**：输入 u 来撤消最后执行的命令，输入 U 来撤消对整行的修改，ctrl+R 重做一次
**插入类命令**：每次用 d 操作删除的内容会放在 vim 中一个寄存器内，光标放在需要插入内容的前一个字符位置，使用 p 将其中内容插入
![recording 6.gif](recording%206.gif)
**替换类命令**：输入 r 再输入需要替换的字符可以光标位置字符替换
**更改命令**：改变文本到一个单词的末尾，输入 ce（ change end），按下 esc 结束修改
	这个操作其实是删除光标位置到文本末尾，然后进入插入模式。
**定位文件及状态**：
	- 输入 CTRL-G 显示当前编辑文件中当前光标所在行位置以及文件状态信息。
	- 输入大写 G 则直接跳转到文件中某一指定行。
	- 输入 G 跳转到文件最后一行，gg 跳转到文件第一行
	 - 输入您曾停留的行号，然后输入大写 G。这样就可以返回到您第一次按下 CTRL-G 时所在的行了。
**搜索类命令**：/ 加一个字符串在当前文件中查找该字符串，输入 n 、N 查找下一个结果或者上一个结果
![425](recording%207.gif)
逆向查找字符方法时输入? 代替/
回退光标位置使用 Ctrl+O ，也可以用在查找字符中

**查找符号配对的符号**：
![375](recording%208.gif)

**行替换命令**：
`: s/old/new/g` 可以替换 old 为 new。，在本行内搜索所有匹配对象并替换，
: 符号表示将光标移动到屏幕底部，将要输入 vim 的一长串命令的，不输入/g 参数只替换一个对象
![350](recording%209.gif)
**外部命令使用**：
`:!` 表示后面将要输入外部命令, 根据系统使用 shell 命令
![375](recording%2010.gif)

**写入文件**
按下 v 进入可选择模式，选中文字后按下：看到屏幕底部会出现 : '<,'>  后面跟操作指令，如 w filename 表示即将选中内容吸入到 filename 文件中，文件路径在当前工作目录，可以通过: `! dir ` 查看

**提取并合并文件**：使用 `:r filename ` 将文件内容插入到光标位置，任何一个有输出内容的命令操作都可以作为 r 操作的参数
如 `r !dir` 表示将 dir 命令的输出作为内容粘贴到光标位置

**插入类命令**：
- 输入 o 表示再逛表下方打开新的一样并进入插入模式，
- 大写 O 表示在光标上一行位置添加新的空行，
- 输入 a 再光标后添加内容
- i，a，A 都会进入插入模式，区别在于插入位置 i 在光标前，a 在光标后
- 输入 R 进行替换操作
	![300](recording%2011.gif)
**复制粘贴操作**
通过 v 选中，y 复制，p 粘贴
y 是一个操作符，yw 表示复制一个单词

**设置类命令**：
ic 表示搜索忽略大小写 `: set ic`
再次使用 `/` 搜索的内容会忽略大小写

每次使用搜索功能在前面加 `\c` 表示忽略大小写，大写 C 表示强制大小写
`/\cexample` 表示忽略大小写搜过 example
前面加 no 表示取消忽略
也可以在配置文件中配置 set ignorecase 表示全局忽略，

**获取帮助**
	- 按下 \<HELP> 键 (如果键盘上有的话)
	- 按下 \<F1> 键 (如果键盘上有的话)
	- 输入	: help <回车> help 后可加命令，会返回相应的解释
	- 使用 Ctrl+W 实现窗口跳转, 在对应的窗口输入: q 关闭窗口
![recording 15.gif](recording%2015.gif)

保存文件命令为 `:write`
# Git Commands
### 一、新建代码库
```Plain
# 在当前目录新建一个Git代码库
$ git init
# 新建一个目录，将其初始化为Git代码库
$ git init [project-name]
# 下载一个项目和它的整个代码历史
$ git clone [url]
```
### 二、配置
Git的设置文件为.gitconfig，它可以在用户主目录下(全局配置)，也可以在项目目录下(项目配置)
```Plain
# 显示当前的Git配置
$ git config --list
# 编辑Git配置文件
$ git config -e [--global]
# 设置提交代码时的用户信息
$ git config [--global] user.name "[name]"
$ git config [--global] user.email "[email address]"
# 颜色设置
git config --global color.ui true                         # git status等命令自动着色
git config --global color.status auto
git config --global color.diff auto
git config --global color.branch auto
git config --global color.interactive auto
git config --global --unset http.proxy                    # remove  proxy configuration on git
```
### 三、增加/删除文件
```Plain
# 添加指定文件到暂存区
$ git add [file1] [file2] ...
# 添加指定目录到暂存区，包括子目录
$ git add [dir]
# 添加当前目录的所有文件到暂存区
$ git add .
# 添加每个变化前，都会要求确认
# 对于同一个文件的多处变化，可以实现分次提交
$ git add -p
# 删除工作区文件，并且将这次删除放入暂存区
$ git rm [file1] [file2] ...
# 停止追踪指定文件，但该文件会保留在工作区
$ git rm --cached [file]
# 改名文件，并且将这个改名放入暂存区
$ git mv [file-original] [file-renamed]
```
### 四、代码提交
```Plain
# 提交暂存区到仓库区
$ git commit -m [message]
# 提交暂存区的指定文件到仓库区
$ git commit [file1] [file2] ... -m [message]
# 提交工作区自上次commit后的变化，直接到仓库区
$ git commit -a
# 提交时显示所有diff信息
$ git commit -v
# 将add和commit合为一步
$ git commit -am 'message'
# 使用一次新的commit，替代上一次提交
# 如果代码没有任何新变化，则用来改写上一次commit的提交信息
$ git commit --amend -m [message]
# 重做上一次commit，并包括指定文件的新变化
$ git commit --amend [file1] [file2] ...
```
### 五、分支
```Plain
# 列出所有本地分支
$ git branch
# 列出所有远程分支
$ git branch -r
# 列出所有本地分支和远程分支
$ git branch -a
# 新建一个分支，但依然停留在当前分支
$ git branch [branch-name]
# 新建一个分支，并切换到该分支
$ git checkout -b [branch]
# 新建一个分支，指向指定commit
$ git branch [branch] [commit]
# 新建一个分支，与指定的远程分支建立追踪关系
$ git branch --track [branch] [remote-branch]
# 切换到指定分支，并更新工作区
$ git checkout [branch-name]
# 切换到上一个分支
$ git checkout -
# 建立追踪关系，在现有分支与指定的远程分支之间
$ git branch --set-upstream [branch] [remote-branch]
# 合并指定分支到当前分支
$ git merge [branch]
# 选择一个commit，合并进当前分支
$ git cherry-pick [commit]
# 删除分支
$ git branch -d [branch-name]
# 删除远程分支
$ git push origin --delete [branch-name]
$ git branch -dr [remote/branch]
# 检出版本v2.0
$ git checkout v2.0
# 从远程分支develop创建新本地分支devel并检出
$ git checkout -b devel origin/develop
# 检出head版本的README文件（可用于修改错误回退）
git checkout -- README
```
### 六、标签
```Plain
# 列出所有tag
$ git tag
# 新建一个tag在当前commit
$ git tag [tag]
# 新建一个tag在指定commit
$ git tag [tag] [commit]
# 删除本地tag
$ git tag -d [tag]
# 删除远程tag
$ git push origin :refs/tags/[tagName]
# 查看tag信息
$ git show [tag]
# 提交指定tag
$ git push [remote] [tag]
# 提交所有tag
$ git push [remote] --tags
# 新建一个分支，指向某个tag
$ git checkout -b [branch] [tag]
```
### 七、查看信息
```Plain
# 显示有变更的文件
$ git status
# 显示当前分支的版本历史
$ git log# 显示commit历史，以及每次commit发生变更的文件
$ git log --stat# 搜索提交历史，根据关键词
$ git log -S [keyword]
# 显示某个commit后的所有变动，每个commit占据一行
$ git log [tag] HEAD --pretty=format:%s
# 显示某个commit后的所有变动，其"提交说明"必须符合搜索条件
$ git log [tag] HEAD --grep feature
# 显示某个文件的版本历史，包括文件改名
$ git log --follow [file]
$ git whatchanged [file]
# 显示指定文件相关的每一次diff
$ git log -p [file]
# 显示过去5次提交
$ git log -5 --pretty --oneline
# 显示所有提交过的用户，按提交次数排序
$ git shortlog -sn
# 显示指定文件是什么人在什么时间修改过
$ git blame [file]
# 显示暂存区和工作区的差异
$ git diff
# 显示暂存区和上一个commit的差异
$ git diff --cached [file]
# 显示工作区与当前分支最新commit之间的差异
$ git diff HEAD
# 显示两次提交之间的差异
$ git diff [first-branch]...[second-branch]
# 显示今天你写了多少行代码
$ git diff --shortstat "@{0 day ago}"# 显示某次提交的元数据和内容变化
$ git show [commit]
# 显示某次提交发生变化的文件
$ git show --name-only [commit]
# 显示某次提交时，某个文件的内容
$ git show [commit]:[filename]
# 显示当前分支的最近几次提交
$ git reflog
```
### 八、远程同步
```Plain
# 下载远程仓库的所有变动
$ git fetch [remote]
# 显示所有远程仓库
$ git remote -v
# 显示某个远程仓库的信息
$ git remote show [remote]
# 增加一个新的远程仓库，并命名
$ git remote add [shortname] [url]
# 取回远程仓库的变化，并与本地分支合并
$ git pull [remote] [branch]
# 上传本地指定分支到远程仓库
$ git push [remote] [branch]
# 强行推送当前分支到远程仓库，即使有冲突
$ git push [remote] --force
# 推送所有分支到远程仓库
$ git push [remote] --all
```
### 九、撤销
```Plain
# 恢复暂存区的指定文件到工作区
$ git checkout [file]
# 恢复某个commit的指定文件到暂存区和工作区
$ git checkout [commit] [file]
# 恢复暂存区的所有文件到工作区
$ git checkout .
# 重置暂存区的指定文件，与上一次commit保持一致，但工作区不变
$ git reset [file]
# 重置暂存区与工作区，与上一次commit保持一致
$ git reset --hard
# 重置当前分支的指针为指定commit，同时重置暂存区，但工作区不变
$ git reset [commit]
# 重置当前分支的HEAD为指定commit，同时重置暂存区和工作区，与指定commit一致
$ git reset --hard [commit]
# 重置当前HEAD为指定commit，但保持暂存区和工作区不变
$ git reset --keep [commit]
# 新建一个commit，用来撤销指定commit
# 后者的所有变化都将被前者抵消，并且应用到当前分支
$ git revert [commit]
# 暂时将未提交的变化移除，稍后再移入
$ git stash
$ git stash pop
```
### 十、其他
```Plain
git init                                                  # 初始化本地git仓库（创建新仓库）
git config --global user.name "xxx"                       # 配置用户名
git config --global user.email "xxx@xxx.com"              # 配置邮件
git config --global color.ui true                         # git status等命令自动着色
git config --global color.status auto
git config --global color.diff auto
git config --global color.branch auto
git config --global color.interactive auto
git config --global --unset http.proxy                    # remove  proxy configuration on git
git clone git+ssh://git@192.168.53.168/VT.git             # clone远程仓库
git status                                                # 查看当前版本状态（是否修改）
git add xyz                                               # 添加xyz文件至index
git add .                                                 # 增加当前子目录下所有更改过的文件至index
git commit -m 'xxx'                                       # 提交
git commit --amend -m 'xxx'                               # 合并上一次提交（用于反复修改）
git commit -am 'xxx'                                      # 将add和commit合为一步
git rm xxx                                                # 删除index中文件
git rm -r *                                               # 递归删除
git log                                                   # 显示提交日志
git log -1                                                # 显示1行日志 -n为n行
git log -5
git log --stat                                            # 显示提交日志及相关变动文件
git log -p -m
git show dfb02e6e4f2f7b573337763e5c0013802e392818         # 显示某个提交的详细内容
git show dfb02                                            # 可只用commitid的前几位
```