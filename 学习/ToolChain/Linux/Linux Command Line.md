# 第一章
## 什么是 shell
### shell 和终端
- 什么是 `.sh` 文件？
`.sh` 文件是Shell脚本文件的扩展名，包含一系列命令的文本文件，这些命令可以被Shell程序（如bash、sh、zsh等）执行。Shell脚本可以用来自动化常见的任务。
- shell 本质是什么
shell 就是一个程序，它接受从键盘输入的命令，然后
把命令传递给操作系统去执行。几乎所有的 Linux 发行版都提供一个名为 bash 的来自 GNU
项目的 shell 程序。
- shell 和终端区别
**Shell** 是一个命令行解释器，它作为用户和操作系统之间的接口。用户通过输入命令，Shell 解释这些命令并调用相应的程序或脚本。
**终端**（或终端模拟器）是一个程序，它提供了一个用户界面，允许用户与Shell交互。
## 文件系统中跳转
### 文件树
- 不像 Windows ，每个存储设备都有一个独自的文件系统。
- 类 Unix 操作系统总是只有一个单一的文件系统树，不管有多少个磁盘或者存储设备连接到计算机上。**根据负责维护系统安全的系统管理员的兴致**（这种设计也用在了 git 上），存储设备连接到（或着更精确些，是挂载到）目录树的各个节点上。
- 首次登录系统（或者启动终端仿真器会话）后，当前工作目录是我们的家目录。普通用户家目录是 `/home/username`，root 用户家目录是 `/root`
- 符号 “.” 指的是工作目录，”..” 指的是工作目录的父目录。"~"表示当前用户的家目录
### 文件名
- 以 “.” 字符开头的文件名是隐藏文件。用 ls -a 命令可以列出。
- Linux 没有“文件扩展名”的概念，可以用你喜欢的任何名字来给文件起名。文件内容或用途由**其他方法**来决定。虽然类 Unix 的操作系统，不用文件扩展名来决定文件的内容或用途，但有些应用程序会。
-  Linux 支持长文件名，文件名可能包含空格，标点符号，但标点符号仅限“.”，“－”，下划线，最好不要在任何文件名和文件夹名中使用空格，输入名称包含空格的路径时，如果忘记 `“”` 括起，命令行会将空格后面的内容解释为参数，导致错误
- 使用 vim 打开一个文件夹路径时，`vim` 会尝试打开 `/path/to/directory/README` 文件。如果这个文件不存在，`vim` 会创建它。
- file 命令识别文件类型
	`file` 命令用于确定文件的类型。它不依赖于文件的扩展名，而是通过检查文件内容的特定特征来识别文件类型。`file` 命令使用一系列的测试来分析文件，这些测试包括但不限于：
1. **魔法数字（Magic Numbers）**：很多文件格式都有特定的开头字节序列，称为“魔法数字”。例如，JPEG图片文件通常以 `0xFFD8FF` 开头，而GIF图片文件以 `GIF89a` 或 `GIF87a` 开头。`file` 命令会检查文件的开头部分，看是否匹配已知的魔法数字。
2. **已知的文件结构和模式**：除了魔法数字之外，`file` 命令还检查文件内容是否符合特定文件格式的结构。比如，它可能检查是否有特定的文件头、特定的字符串或者数据块的排列方式。
3. **文件内容的元数据**：对于一些文件类型，`file` 命令还会检查文件内部的元数据，例如可执行文件中ELF头信息，或者PDF文件中特定标记。
4. **文件系统的元数据**：在某些情况下，`file` 命令还会参考文件系统的元数据，比如文件权限、创建时间等，但**主要还是依据文件内容**。
`file` 命令使用一个内置的数据库，这个数据库包含了各种文件类型的魔法数字和识别规则。当你运行 `file 文件名` 命令时，它会读取这个数据库，并根据文件内容的特征来判断文件类型。
## 文件操作系统
- ascii 编码是最简单的键盘字符到数字的**映射编码**，是标准信息交换码
- linux 中文本是简单的字符与数字之间的一对一映射。它非常紧凑。五十个字符的文本翻译成五十个字节的数据。文本只是包含简单的字符到数字的映射，。
- inux 采用 utf 8 编辑纯文本文件，纯文本文件不包含格式化信息，如字体、颜色、大小等。这意味着文本文件是跨平台的，可以在不同的操作系统和文本编辑器中无损地打开和编辑。
- **less&more 命令**：less 属于 “页面调度器” 类程序，这些程序允许以逐页方式轻松浏览长文本文档。more 程序只能向前翻页，而 less 程序允许前后翻页，提供了更好的交互和性能。
- [Linux long text explanation \> linux 中各种目录作用](Linux%20long%20text%20explanation.md#linux%20中各种目录作用)
- [参考链接：中文FHS文件目录分类](https://blog.csdn.net/yup1212/article/details/82152106)
- [FHS文件目录分类规定：英文pdf](http://www.pathname.com/fhs/)
- 图片表示
![Pasted image 20240922125030.png](Pasted%20image%2020240922125030.png)
![Pasted image 20240922125042.png](Pasted%20image%2020240922125042.png)
![Pasted image 20240922125122.png](Pasted%20image%2020240922125122.png)
## 各种命令
### 手册信息查看命令
**whatis**
启动 whatis 之前先要建立 whatis 数据库，centos 7 之前使用 `makewhatis`，后使用 `mandb`
- whatis 是一个简洁的命令解释器，返回命令在手册中简洁说明

**apropos 命令**
显示命令名称在手册中搜索结果
**info 命令**
显示命令行程序的说明
- info 提供交互式页面
![Pasted image 20240923123251.png](Pasted%20image%2020240923123251.png)
### 其他命令
#### alias 命名命令
可以用分号分开不同的命令，linux 会按照顺序执行，使用 alias 为这一段连续的命令组赋予别名
```shell
cd /usr ; ls ; cd ~ # 三个命令成组
type test
test is a shell buitin # test命令已被占用
type foo
bash type foo :not found # foo命令没有被占用
alias foo='cd /usr ; ls ; cd'# 注意不要在等号两端写空格
```
type 命令查看自定义命令
![Pasted image 20240923124403.png](Pasted%20image%2020240923124403.png)
也可以使用 unalias 解除命名
## 常用命令
### 解压命令
1. ZIP 文件
```bash
unzip 文件名.zip         # 解压到当前目录
unzip 文件名.zip -d 目录  # 解压到指定目录
```
1. RAR 文件
```
unrar x 文件名.rar       # 解压（需安装 `unrar`）
```
1. TAR 文件
```bash
解压 .tar
tar -xvf 文件名.tar
解压 .tar.gz 或 .tgz
tar -xzvf 文件名.tar.gz
解压 .tar.bz2
tar -xjvf 文件名.tar.bz2
解压 .tar.xz
tar -xJvf 文件名.tar.xz
```
1. 7Z 文件
```bash
7z x 文件名.7z          # 解压（需安装 `p7zip`）
```
常用选项说明
- `-x`：解压
- `-v`：显示解压过程（可选）
- `-f`：指定文件
- `-z`：处理 gzip 压缩（如 .tar.gz）
- `-j`：处理 bzip2 压缩（如 .tar.bz2）
- `-J`：处理 xz 压缩（如 .tar.xz）
### 安装包命令
| 操作          | Yum (CentOS/RHEL)                           | APT (Ubuntu/Debian)                |
| ----------- | ------------------------------------------- | ---------------------------------- |
| **更新包列表**   | `sudo yum makecache`                        | `sudo apt update`                  |
| **安装包**     | `sudo yum install 包名`                       | `sudo apt install 包名`              |
| **卸载包**     | `sudo yum remove 包名`                        | `sudo apt remove 包名`               |
| **升级包**     | `sudo yum update 包名`                        | `sudo apt upgrade 包名`              |
| **自动升级所有包** | `sudo yum update`                           | `sudo apt upgrade`                 |
| **搜索包**     | `sudo yum search 关键词`                       | `sudo apt search 关键词`              |
| **查看包信息**   | `sudo yum info 包名`                          | `sudo apt show 包名`                 |
| **清理缓存**    | `sudo yum clean all`                        | `sudo apt clean`                   |
| **修复依赖问题**  | `sudo yum deplist 包名`                       | `sudo apt --fix-broken install`    |
| **安装开发工具包** | `sudo yum groupinstall "Development Tools"` | `sudo apt install build-essential` |
|             |                                             |                                    |
### 防火墙命令
. 查看已放行的端口
```bash
sudo firewall-cmd --list-ports  # 查看已放行的端口列表
sudo firewall-cmd --list-all    # 查看所有规则（包括服务、端口等）
```
2. 添加放行端口
临时添加（重启后失效）
```bash
sudo firewall-cmd --add-port=端口号/协议 --permanent
```
例如放行 TCP 端口 8080：
```bash
sudo firewall-cmd --add-port=8080/tcp --permanent
```
永久添加（需重载防火墙生效）
```bash
sudo firewall-cmd --add-port=8080/tcp --permanent
sudo firewall-cmd --reload  # 重载防火墙规则
```
3. 移除放行端口
临时移除
```bash
sudo firewall-cmd --remove-port=端口号/协议
```
永久移除
```bash
sudo firewall-cmd --remove-port=8080/tcp --permanent
sudo firewall-cmd --reload  # 重载生效
```
4. 其他实用命令
检查端口是否已放行：
```bash
sudo firewall-cmd --query-port=8080/tcp
```
返回 yes 表示已放行，no 表示未放行。
放行服务（如 HTTP/HTTPS）：
```bash
sudo firewall-cmd --add-service=http --permanent
sudo firewall-cmd --reload
```
5. 注意事项
协议类型：需明确端口使用的协议（如 tcp/udp）。
持久化：不加 --permanent 的规则会在重启后失效。
区域（Zone）：默认操作针对 public 区域，可通过 --zone= 指定其他区域。
CentOS 6 或更早版本：使用 iptables，需直接编辑 /etc/sysconfig/iptables。
6. 验证规则

```bash
sudo firewall-cmd --list-all | grep ports  # 确认端口已生效
```
通过以上步骤，你可以轻松管理 CentOS 的防火墙端口规则。
### 搜索命令
#### 1. 按文件名搜索
##### `find` 命令（精确搜索）
find /路径 -name "文件名"
- **示例**：

    find /home -name "example.txt"      # 在 /home 下搜索名为 example.txt 的文件

    find / -type f -name "*.conf"       # 搜索全盘所有 .conf 后缀的文件

- **关键选项**：
    `-type f`（文件）、`-type d`（目录）、`-iname`（忽略大小写）。

##### `locate` 命令（快速模糊搜索）
sudo updatedb       # 先更新文件数据库（首次使用前或文件更新后执行）
locate "关键词"
- **示例**：

    locate nginx.conf  # 快速定位所有包含 nginx.conf 的文件路径

- **特点**：基于数据库检索（更快），但结果可能非实时。

---
#### 2. 按文件内容搜索
##### `grep` 命令
grep -r "关键词" /路径
- **示例**：

    grep -r "error" /var/log/          # 在 /var/log 下递归搜索含 "error" 的文件

    grep -ri "debug" /etc/             # 忽略大小写搜索

- **选项**：
    `-r`（递归）、`-i`（忽略大小写）、`-l`（仅显示文件名）。

---
#### 3. 按文件大小/时间/权限搜索
##### `find` 高级用法
find /路径 -size +10M                # 搜索大于 10MB 的文件
find /var/log -mtime -7              # 搜索 7 天内修改过的文件
find /etc -perm 644                  # 搜索权限为 644 的文件

---
#### 4. 组合条件搜索
```bash
find / -type f -name "*.log" -size +1G -exec ls -lh {} \;  # 搜索大于 1GB 的日志文件并显示详情
```
#### 常用命令总结

|场景|命令示例|
|---|---|
|按文件名搜索|`find /etc -name "nginx.conf"`|
|快速模糊搜索|`locate *.jpg`|
|按内容搜索|`grep -r "192.168.1.1" /etc/`|
|按大小搜索|`find /var -size +500M`|
掌握这些命令后，可以高效定位 CentOS 中任何文件！
### 程序后台运行命令
#### nohup 命令
##### 后端服务（例如 Go 程序）
```bash
nohup ./main > backend.log 2>&1 &
```
**说明**：
- `nohup`：让进程在终端关闭后继续运行。
- `> backend.log`：将标准输出重定向到日志文件。
- `2>&1`：将错误输出合并到标准输出。
- `&`：将进程放入后台运行。

##### 前端服务（例如 npm 项目）
```bash
cd your-frontend-dir && nohup npm run dev > frontend.log 2>&1 &
```
#### 方案 2：使用 `tmux` 分屏终端
1. **创建会话**：
   ```bash
   tmux new -s project
   ```
2. **启动后端服务**（按 `Enter` 执行）：
   ```bash
   ./main
   ```
3. **分屏并启动前端服务**：
   - 按 `Ctrl+B`，再按 `"`（水平分屏）或 `%`（垂直分屏）。
   - 切换分屏后运行：
     ```bash
     cd your-frontend-dir && npm run dev
     ```
1. **退出 tmux 但保持运行**：
   - 按 `Ctrl+B`，再按 `D`（detach）。
   - 重新连接会话：
     ```bash
     tmux attach -t project
     ```
#### 方案 3：使用 `systemd` 部署为守护进程（推荐）
##### 1. 创建后端服务单元文件
```bash
sudo vim /etc/systemd/system/backend.service
```
内容如下：
```ini
[Unit]
Description=Backend Service
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/backend
ExecStart=/path/to/backend/main
Restart=always

[Install]
WantedBy=multi-user.target
```

##### 2. 创建前端服务单元文件
```bash
sudo vim /etc/systemd/system/frontend.service
```
内容如下：
```ini
[Unit]
Description=Frontend Service
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/frontend
ExecStart=/usr/local/bin/npm run dev
Restart=always
Environment=PATH=/usr/local/bin:/usr/bin:/bin

[Install]
WantedBy=multi-user.target
```

##### 3. 启动并启用服务
```bash
sudo systemctl daemon-reload
sudo systemctl start backend frontend
sudo systemctl enable backend frontend  # 开机自启
```

---

#### 方案 4：使用进程管理工具 `pm2`（前端专用）
如果前端是 Node. js 项目，可以更优雅地用 `pm2` 管理：
```bash
npm install -g pm2
cd your-frontend-dir
pm2 start npm -- run dev
pm2 save  # 保存配置，重启后自动恢复
```
## 注意事项
1. 确保服务监听 `0.0.0.0`
   - 后端需绑定 `0.0.0.0:端口`（如 `app.listen(3000, '0.0.0.0')`），否则无法通过端口转发访问。

1. 防火墙开放端口（如需要外部访问）
   ```bash
   sudo firewall-cmd --add-port=3000/tcp --permanent
   sudo firewall-cmd --reload
   ```

2. 检查进程是否后台运行
   ```bash
   ps aux | grep main
   ps aux | grep npm
   ```

3. 查看日志
   ```bash
   tail -f backend.log
   tail -f frontend.log
   ```

---

## 总结

| 方法        | 优点                      | 缺点                      |
|-------------|---------------------------|---------------------------|
| `nohup`     | 简单快捷                  | 无法监控日志，管理分散    |
| `tmux`      | 可交互调试，实时看日志    | 会话关闭后进程会终止      |
| `systemd`   | 稳定、自启、集中管理      | 需配置单元文件            |
| `pm2`       | Node. js 项目专用，支持集群   | 仅适用于前端，需额外安装  |

如需长期稳定运行，**推荐使用 `systemd`**；如临时调试，用 `tmux` 更灵活。