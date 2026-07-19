## 廖雪峰博客 git
[简介 - Git教程 - 廖雪峰的官方网站 (liaoxuefeng.com)](https://liaoxuefeng.com/books/git/introduction/index.html)
步骤：

1. 使用 cat > filename 后使用 ctrl+d 保存退出

2. 创建 file. txt 文件，内容为
> 1. this is the first line of file. txt
> 1. and second.

3. 再使用 vim file. txt 修改，加入第三行内容

4. git log 命令
5. 由近到远显示所有提交日志，commit 而不是 add
6. git log 后加上 `--pretty=online` 参数表示输出简洁信息

7. git reset 的[三种回退模式](Geekhour%20one%20hour%20Git.md#回退版本)中回退都以文件头 `HEAD` 也就是十六进制哈希代码, 在 hard 后输入^表示回退版本，上一个版本就是 `HEAD^`，上上一个版本就是 `HEAD^^`，当然往上100个版本写100个 `^` 比较容易数不过来，所以写成 `HEAD~100`。
	![Pasted image 20240812155607.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240812155607.png)
8. 被删掉的提交记录可以通过 git reset  --module  版本对应哈希值，版本号没必要写全，能够在日志中找到即可

9. git reflog 可以找到所有执行的命令日志，
   每一次操作文件动作和文件对象都有唯一编号
   ![Pasted image 20240812160635.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240812160635.png)
10. git 通过追踪修改而不是追踪文件来管理修改
11. `git checkout -- <file>` 通过 checkout 丢弃工作区的修改这里，有两种情况：
    一种是`readme.txt`自修改后还没有被放到暂存区，现在，撤销修改就回到**和版本库一模一样**的状态；
    一种是`readme.txt`已经添加到暂存区后，又作了修改，现在，撤销修改就回到添加到暂存区后的状态。
    **回到最近一次 `git commit` 或 `git add` 时的状态。**

12. 同样，git reset HEAD \<file name>   同样可以将暂存区的修改回退到工作区
13. echo "this is a file will be deleted.">>test. txt 创建新文件并过会删除
14. 操作系统提供的删除文件命令是rm \<file name>未 git add 添加之前这个操作**不会被 git 记录**
    但 git rm \<file name>**只会删除已受到管理的文件**，即被添加 add 后的文件，这个操作会被 git 记录，删除对应的文件：后：
	- git rm 确认从版本中删除文件，git commit 使工作区和版本库同统一
	- git checkout -- \<file name>可以找回文件
	![450](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240812164550.png)
15. `git checkout`其用版本库里的版本替换工作区的版本，无论工作区是修改还是删除，都可以“一键还原”。
16. 解开本地库和 github 的 ssh 加密
    1步：创建SSH Key。在用户主目录下，看看有没有.ssh目录，如果有，再看看这个目录下|有 `id_rsa` 和 `id_rsa.pub` 这两个文件，如果已经有了，可直接跳到下一步。如果没有，打开Shell（Windows下打开Git Bash），创建SSH Key：
```shell
$ ssh-keygen -t rsa -C "Sickwag@outlook.com"
//接下来回车即可，不用设置密码
```
17. 如果一切顺利的话，可以在用户主目录里找到`.ssh`目录，里面有`id_rsa`和`id_rsa.pub`两个文件，这两个就是SSH Key的秘钥对，`id_rsa`是私钥，不能泄露出去，`id_rsa.pub`是公钥，可以放心地告诉任何人。
    ![375](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240812165655.png)
## learning_git_branch
### git 基础命令
闯关式教学，教程链接：[Learn Git Branching](https://learngitbranching.js.org/?locale=zh_CN)
![[Pasted image 20241206193642.png]]
关于 git 的分支只会单纯只想某个**提交记录**
#### 提交，合并，切换分支
使用 `git merge <branch_name>` 作用是将参数分支合并到当前分支上
- PS：如果 branch_name 继承与当前分支，git 将会直接跳转到 branch_name 分支中，因 merge 命令本质是将两个分支中内容合并为一个，又由于*并没有要求回溯*，所以会跳转到继承者的位置而不是当前位置（即 bugFix）
![[PixPin_2024-12-06_19-55-02.gif]]
#### git branch 和 checkout 的切换分支
![[Pasted image 20241206202310.png]]
![[Pasted image 20241206202319.png]]
#### git rebase
##### 示例
取出一系列提交记录，在另一个地方放下去，如果使用 `git rebase node1 node2` 表示将 node 2 结点选中从*向上回溯*直到找到达 node 1 兄弟节点位置的节点，全部复制到 node 1 下面
![[Pasted image 20241207100226.png]]
![[Pasted image 20241207100152.png|143]]
![[Pasted image 20241207100236.png]]
`git rebase branch_name` 将**当前分支**及其所有子节点放入 branch_name 分支以下
将把 bugFix 分支里的工作直接移到 main 分支上。移动以后会使得两个分支的功能**看起来像是按顺序开发，但实际上它们是并行开发的**。
![[Pasted image 20241206202533.png|225]] ![[Pasted image 20241206202730.png|250]]
同理，如果 branch_name 继承于当前分支，那么只会使当前分支跳转到 branch_name 位置
![[Pasted image 20241206202849.png]]
##### 练习
![[Pasted image 20241206203354.png]]
![[Pasted image 20241206203404.png]]

#### head
- head 便是上面图中 `*`，他表示当前工作的**分支位置**，所以他一般指向的是**分支名**，可以通过 head 调整指向节点（单独的一次提交记录而不是分支名）
- 可以使用 `cat .git/HEAD` 查看 head 指向，如果他是一个引用，还可以用 `git symbolic-ref HEAD` 查看
- 可以理解为：
	- branch_name 是指向提交记录的指针
	- head 是一种**可以**指向指向提交记录的指针（一级或者二级）
![[Pasted image 20241206204048.png|调整head之前]]
![[Pasted image 20241206204113.png|调整后]]

#### 相对引用
- git 的每一次提交使用*哈希值*标记唯一性，可以通过哈希编码对应找到每一次记录，但它太长了（虽然可以使用前几个字符自动填充），所以引入了相对位置引用：
- 使用相对引用的话，你就可以从一个易于记忆的地方（比如 `bugFix` 分支或 `HEAD`）开始计算。
相对引用非常给力，这里我介绍两个简单的用法：

- 使用 `^` 向上移动 1 个提交记录
- 使用 `~<num>` 向上移动多个提交记录，如 `~3`
![[Pasted image 20241206204525.png]]

- head 同样可以作为相对引用的参照
![[Pasted image 20241206204714.png|400]]

- 相对引用最多的使用场景是**移动分支**
使用 `git branch -f main HEAD~3` ，`-f` 表示强制移动分支：
如 `git branch -f <branch_name> [<commit>]` 表示将 branch_name 分支强制移动到 commit 指定的位置，如果省略则默认当前分支的 HEAD
![[Pasted image 20241206213548.png]]
![[Pasted image 20241206213654.png]]
这里注意 `git branch` 是移动分支，`checkout` 移动 head 指针

#### 撤销更改
##### 示例
- git reset
`git reset <branch_name/pointer>` 表示将指针所指向的位置向上移动，如
`git reset HEAD^1` 表示将 HEAD **所指向的内容**（一般是分支名）向上移动一位
一般用来移动**分支名**，这样本地 repo 中不会知道有原 HEAD 后的分支创建过
![[Pasted image 20241206212132.png]]

- git revert 用于远程提交的撤回操作（git reset 对远程仓库无效），使用时会创建一个**包含撤操作的提交记录**，其中 `·C2 ` 和 ` C2 ` 一致
注意 revert 创建的*新的撤销分支*是**head**指向的当前分支
![[Pasted image 20241206212410.png]]
##### 题目
![[Pasted image 20241206214120.png]]
![[Pasted image 20241206214041.png]]
#### 转交并赋值提交记录
##### git cherry-pick
- `git cherry-pick <node_name>+` 表示将某个（**某几个**）提交记录放在当前分支后面，是复制而不是像 rebase 移动提交记录，原分支依然存在，当前分支下会出现 `node_name` 的复制，
- 实际操作 git 时，并不会有 C1, C2 这种明显的标记每一个提交记录的图形化显示。真正使用 `git cherry-pick` 命令是在当你知道你所需要的提交记录（**并且**还知道这些提交记录的哈希值）时
- 牢记 cherry-pick 可以将提交树上**任何地方的提交记录取过来追加到 HEAD 上**（只要不是 HEAD 上游的提交就没问题）不会有 rebase 调整分支而出现的冲突问题
##### git rebase -i
`git rebase -i <control>`
交互式 rebase，i 表示 `interactive` 使用这个命令时，git 会创建一个图形化文本页面来显示 `control` 所控制的内容，可以通过命令操作，包括：
- 修改他们的排序
- 删除、忽略他们之中一个
做完所有操作后 git 会
- 在 control 的终止位置创建一个新的提交，并应用你的修改
- 将 head **连同分支名**指向新的提交记录的最后一个节点（也就是尾端）
如：`git rebase HEAD~4`
![[Pasted image 20241207084800.png]]
HEAD~4，也就是 C 1 位置是终止位置，执行后可以操作 C 2~C 5 所有节点，并最后在终止位置 C 1 处开创新的提交记录
![[Pasted image 20241207084839.png|颠倒顺序并忽略C2|175]] ![[Pasted image 20241207084918.png|163]]
题目：不使用 `git cherry-pick` 的情况下调整分支位置
![[Pasted image 20241207090922.png]]
![[Pasted image 20241207090907.png|327]]
![[Pasted image 20241207090942.png]]

两种方法一起应用的场景是需要修改某个之前提交的版本的某些内容时
- 使用 git rebase 或者 git cherry-pick 将需要调整的 node 调整到分支最尾端
- 应用修改 （amed 语句）
- 再次使用 git rebase 将分支提交顺序调整回去，也可以使用 `git cherry-pick` 直接移动着一个调整过了的节点
![[Pasted image 20241207092128.png]]![[Pasted image 20241207092240.png]]
![[Pasted image 20241207092112.png]]
也可以使用 rebase 解法
![[Pasted image 20241207092757.png]]

#### tag 标签永久指向某个提交记录
使用 rebase 时，标签会随着 control 参数而移动，指向新的 node，并且分支可以删除并创建新的**同名标签**，所以 tag 用来解决这个问题
`git tag tag_name node_name`
`git describe` 的​​语法是：
`git describe <ref>`
`<ref>` 可以是任何能被 Git 识别成提交记录的引用，如果你没有指定的话，Git 会使用你目前所在的位置（`HEAD`）。
它输出的结果是这样的：
`<tag>_<numCommits>_g<hash>`
`tag` 表示的是离 `ref` 最近的标签， `numCommits` 是表示这个 `ref` 与 `tag` 相差有多少个提交记录， `hash` 表示的是你所给定的 `ref` 所表示的提交记录哈希值的前几位。
当 `ref` 提交记录上有某个标签时，**则只输出标签名称**
![[Pasted image 20241207093929.png]] ![[Pasted image 20241207094148.png]]

#### 向上回溯的不确定行为
![[Pasted image 20241207100419.png]]
- 合并后向上回溯时，只会跳转到正上方的节点（也就是嫡系为合并后节点的 parent 节点）
- 使用 `main^2` 跳转到旁系，跳转旁系的依据是合并时的顺序
- 一般使用 rebase ，merge 只会产生二叉关系，默认合并时第一个节点（第一个参数）是第一个父提交，后面的以此类推
- 跳转操作符支持链式操作（注意只有 `^` 才支持选择父节点跳转，`~` 只支持向上跳转一次）
![[Pasted image 20241207102015.png]]
![[Pasted image 20241207102633.png]]
在 C 2 位置创建一个 bugWork 分支，只需要一条命令 `git branch main^^2^`
#### 远程仓库
- 使用 `git clone` 时，系统会从网站上复制一个仓库过来，并且在原有远程仓库最新位置创建一个 `o/main` 分支用来表示这个分支位置是最后一次本地仓库和远程仓库沟通的位置
- 如果在远程仓库中使用 git commit，main 分支不会和 head 一起跳转到下一次提交，而是实型 HEAD 分离状态，如：
![[Pasted image 20241207104207.png|在远程仓库中commit分离head|375]]
注意提交之前 HEAD 指向 `o/main` 而不是本地仓库的 main，
因只有当本地仓库中有相应的更新后才会才在远程仓库中更新 main 分支
![[Pasted image 20241207104724.png|300]]