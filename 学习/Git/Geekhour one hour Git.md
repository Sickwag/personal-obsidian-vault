[Git Commands](Git%20Commands.md)
# 版本控制工具
## 1. 分类
- 集中式
    
    中央服务器存储文件, 每个主机得到的是文件副本, 主机修改完之后上传到服务器.

# Git 工作区域和文件状态

## 工作区域

![Pasted image 20240806225015.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240806225015.png)

## 文件状态

![450](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240806225431.png)

# 仓库操作

## 初始化
Git 对仓库的初始化 `git init` 会对当前工作目录标记为 git 仓库，使用 `ls-a` 查看所有文件命令，可以看见了创建 `.git` 隐藏文件夹，其中是仓库信息
![400](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240806224118.png)
`\rm -rf 文件名` 是删除文件命令
`git init 仓库名` 在当前工作目录中创建一个仓库

## 添加和提交文件

### git add

注意：git add 提交到暂存区的是文件在提交时的**快照**，不是提交文件本身

![Pasted image 20240806232017.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240806232017.png) 

Add 命令支持使用通配符
![475](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240806232340.png)

不使用 `-m` 命令会进入编辑模式，默认用安装 git 时的默认编辑器编辑提交信息（**不是文件内容**）
Prompt ：
In vscode ,edit submit imfo will ignore any pound sign (so you should input in line 2) and if you input no thing ,there will save nothing .
Press ctrl + shift + W to s&q
![Pasted image 20240806233802.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240806233802.png) ![concise info](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240806233830.png)
简洁提交会显示每个文件每次版本的版本 ID，注意**不是详细 log 的提交动作 ID**，回退版本需要
### git commit

![创建新文件并输入内容](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240806230211.png)
刚创建的文件使用 status 查看是红色未跟踪状态
![查看仓库状态发现绿色新文件](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240806230126.png)
提示使用 `git rm --cached 文件名` 拿回暂存区中的文件
`git commit` 会将 files in staging area commit to local reposity，after `-m` character , the imformation inside `""` should shows the brife illusion of this file to help cooperaters identify it.
```prompt:
[main (root-commit) 78de5c5] imfo 
1 file changed ,1insertion(+) 
create mode 10064 file1.txt
```

当你执行 `git commit -m "imfo"` 命令提交文件后，Git 会显示一条提交信息，具体解释如下：
1. **[main (root-commit) 78 de 5 c 5]**:
    - `main`: 表示你当前所在的分支是 `main` 分支,是默认的主分支名称。
    - `(root-commit)`: 这表示这是一个根提交（root-commit），即这是该分支的第一个提交。根提交没有父提交.
    - `78de5c5`: 这是提交的唯一标识符（SHA-1 哈希值），用于在 Git 中引用。**每次**提交都会生成一个新的、唯一的哈希值。
2. **1 file changed, 1 insertion (+)**:
	- `1 file ` changed `: 表示在这次提交中，有 1 个文件发生了变化。
    - `1 insertion(+)`: 表示在这些变化中，有 1 处是插入（即新增内容）。因为是首次提交，所以这里的插入指的是你添加了一个新文件。
3. **create mode 100644 file 1. Txt**:
    - `create mode 100644`: 表示你创建了一个新文件 `file1.txt`，并设置了其权限为 100644。在 Git 中，文件权限的表示方式与 Unix 类似，100644 表示文件是普通文件，所有者有读写权限，组和其他用户有读权限。

## 回退版本

![Pasted image 20240806234110.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240806234110.png)

## 查看文件差异

### `git diff` 指令
![450](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240806234941.png)
`git diff` 命令而不指定任何参数时，它默认比较的是**工作区中当前文件的状态**和**暂存区中该文件的最后状态**（也就是 add 之后产生的文件快照）之间的差异。只能对比两个文件之间的差异

如果 git diff 没有返回任何内容就表明工作区和暂存区内容相同