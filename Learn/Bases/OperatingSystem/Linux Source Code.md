# Linux 编程 API 速查
参考：
- [Linux man-pages](https://man7.org/linux/man-pages/)
- [POSIX.1-2017 System Interfaces](https://pubs.opengroup.org/onlinepubs/9699919799/functions/contents.html)
- 《Linux 高性能服务器编程》第 5、6、13 章
- [Kernel documentation](https://docs.kernel.org/)
关联：
- [[/Learn/Books/Linux高性能服务器编程.md|该书按服务器框架组织 socket API，本笔记只做参数级速查与取值]]
- [[IO复用模型|select/poll/epoll/io_uring 的模型演进、内核实现与调用链]]
- [[小林 Coding 图解操作系统|fd、进程、虚拟内存的内核侧背景]]
## 通用约定
每个 API 按"原型 → 逐参数可填写值 → 返回值 → errno → 坑点"组织。参数表里的每一行都是**能直接写进代码的字面量**，并说明这个值会让内核做什么、产生什么后果。
### 参数表的读法

| 列 | 含义 |
| --- | --- |
| 参数 | 形参名，与原型一致 |
| 类型 | C 类型；注意有无符号与宽度 |
| 可填写的值 | 实际能写进代码的字面量或变量，不是抽象描述 |
| 效果 | 填入该值后内核/库的行为与副作用 |
阅读顺序建议：先看"可填写的值"找到自己要的，再看"效果"确认副作用，最后看返回值段落确认错误分支。
### 返回值与 errno

| 返回类型 | 成功 | 失败 | 判错要点 |
| --- | --- | --- | --- |
| `int` | 0 或非负值（fd、计数） | -1，置 `errno` | 判定条件必须是 `< 0` 或 `== -1`，不能用 `!ret` |
| `ssize_t` | 实际字节数，`read` 返回 0 表示 EOF | -1 | 可能小于请求长度，短写不是错误 |
| `pid_t` | 进程号；`fork` 在子进程返回 0 | -1 | 子进程的 0 是成功值 |
| `void *` | 有效地址 | `MAP_FAILED` 即 `(void *)-1` | `mmap` 失败不会返回 NULL |
| `pthread_*` | 0 | 正整数错误码 | 不置 `errno`，直接当返回值用 |
| `char *` | 指针 | NULL | `inet_ntop` 失败置 `ENOSPC` |
| `off_t` | 新偏移 | -1 | `lseek` 允许位移为负结果 |
errno 规则：
- 只在函数返回失败后才有意义；成功调用保留旧值，不能用来判断"上次有没有失败"。
- 线程私有，信号处理函数与其他线程看不到同一个值。
- 打印用 `perror("open")` 或 `strerror(errno)`；线程安全版本是 `strerror_r`，GNU 版返回 `char *`，XSI 版返回 `int`。
- `EINTR`（被信号打断，直接重试）与 `EAGAIN`（资源暂时不可用，要等就绪）是两类完全不同的处理。
### 常用类型

| 类型 | 用途 | 常见取值与坑 |
| --- | --- | --- |
| `size_t` | 长度、计数 | 无符号；减到负数会回绕成极大值 |
| `ssize_t` | 带符号长度 | `read`/`write` 返回它，比较时别与 `size_t` 混用 |
| `off_t` | 文件偏移 | 64 位系统 8 字节；32 位需 `_FILE_OFFSET_BITS=64` |
| `socklen_t` | 地址结构长度 | 通常 `uint32_t`，传 `int*` 会告警 |
| `sa_family_t` | 地址族 | 16 位，填 `AF_INET`/`AF_INET6` |
| `in_port_t` | 端口 | 必须网络字节序，`htons(8080)` |
| `mode_t` | 权限位 | `0644`、`0755`、`S_IRUSR` 等 |
| `sigset_t` | 信号集 | 只能用 `sigemptyset` 系列操作 |
| `clockid_t` | 时钟 id | `CLOCK_MONOTONIC` 等常量 |
| `pid_t` | 进程号 | `getpid()` 返回；`-1` 在 `kill` 里表示"所有进程" |
| `pthread_t` | 线程句柄 | 不透明类型，只能 `pthread_equal` 比较，不能 `==` |
### 编译与特性宏
在**所有 `#include` 之前**定义，或编译加 `-D`：

| 宏 | 打开什么 | 缺少时症状 |
| --- | --- | --- |
| `_GNU_SOURCE` | 全部 GNU 扩展 | `accept4`、`pipe2`、`gettid`、`cfmakeraw`、`memfd_create`、`epoll_create1`、`pthread_setname_np` 未声明 |
| `_POSIX_C_SOURCE=200809L` | POSIX.1-2008 | 隐藏上述 GNU 扩展 |
| `_DEFAULT_SOURCE` | glibc 默认功能 | `-std=c99` 会关掉它，`strdup`、`cfmakeraw` 消失 |
| `_FILE_OFFSET_BITS=64` | 64 位文件偏移 | 32 位平台大文件 `EOVERFLOW` |
| `_XOPEN_SOURCE=700` | XSI 扩展 | |
编译命令：

```bash
gcc -Wall -Wextra -O2 -g -D_GNU_SOURCE demo.c -o demo -pthread
```
glibc 2.34 起 pthread 并入 libc，旧系统仍需 `-lpthread`。
### 版本边界

| 接口 | 最低版本 | 说明 |
| --- | --- | --- |
| `epoll` | Linux 2.5.44 / glibc 2.3.2 | `epoll_create1` 需 2.6.27 |
| `accept4`、`pipe2`、`dup3` | Linux 2.6.27 | glibc 2.9/2.10 |
| `eventfd`、`timerfd`、`signalfd` | Linux 2.6.22 | glibc 2.8/2.9 |
| `SO_REUSEPORT` | Linux 3.9 | 多进程监听同端口 |
| `EPOLLEXCLUSIVE` | Linux 4.5 | 缓解惊群 |
| `memfd_create` | Linux 3.17 | glibc 2.27 |
| `gettid` | glibc 2.30 | 之前用 `syscall(SYS_gettid)` |
| `close_range` | Linux 5.9 | 批量关 fd |
| `io_uring` | Linux 5.1 | 见 [[IO复用模型]] |
### 接口索引
按"我想干什么"查，不按字母序。

| 任务 | 接口 | 章节 |
| --- | --- | --- |
| 打开/创建文件 | `open` `openat` `creat` | [[#文件与描述符]] |
| 读写文件 | `read` `write` `pread` `pwrite` | [[#文件与描述符]] |
| 移动文件偏移 | `lseek` | [[#文件与描述符]] |
| 复制 fd | `dup` `dup2` `dup3` `fcntl(F_DUPFD)` | [[#文件与描述符]] |
| 改 fd 属性 | `fcntl` | [[#文件与描述符]] |
| 落盘 | `fsync` `fdatasync` `sync` | [[#文件与描述符]] |
| 文件信息 | `stat` `fstat` `lstat` | [[#文件与描述符]] |
| 内存映射文件 | `mmap` `munmap` `msync` | [[#文件与描述符]] |
| 遍历目录 | `opendir` `readdir` `closedir` | [[#文件与描述符]] |
| 创建 socket | `socket` | [[#socket 编程]] |
| 绑定地址 | `bind` | [[#socket 编程]] |
| 监听 | `listen` | [[#socket 编程]] |
| 取连接 | `accept` `accept4` | [[#socket 编程]] |
| 发起连接 | `connect` | [[#socket 编程]] |
| 收发数据 | `send` `recv` `sendto` `recvfrom` `sendmsg` `recvmsg` | [[#socket 编程]] |
| 半关闭 | `shutdown` | [[#socket 编程]] |
| socket 选项 | `setsockopt` `getsockopt` | [[#socket 编程]] |
| 地址转换 | `inet_pton` `inet_ntop` `htons` | [[#socket 编程]] |
| 域名解析 | `getaddrinfo` `freeaddrinfo` | [[#socket 编程]] |
| 取自身信息 | `getpid` `getppid` `gettid` `getuid` | [[#进程控制]] |
| 创建进程 | `fork` `vfork` `posix_spawn` | [[#进程控制]] |
| 替换镜像 | `execve` `execl` `execvp` | [[#进程控制]] |
| 回收子进程 | `wait` `waitpid` `waitid` | [[#进程控制]] |
| 退出 | `exit` `_exit` `atexit` | [[#进程控制]] |
| 发信号 | `kill` `raise` `sigqueue` `tgkill` | [[#进程控制]] |
| 装信号处理 | `sigaction` `signal` `sigprocmask` | [[#进程控制]] |
| 命令行杀进程 | `ps` `pgrep` `pkill` `killall` | [[#进程控制]] |
| 守护进程 | `setsid` `daemon` `prctl` | [[#进程控制]] |
| 资源限制 | `getrlimit` `setrlimit` | [[#进程控制]] |
| 绑核 | `sched_setaffinity` `pthread_setaffinity_np` | [[#进程控制]] |
| 建线程 | `pthread_create` `pthread_join` | [[#线程与同步]] |
| 互斥 | `pthread_mutex_*` | [[#线程与同步]] |
| 条件变量 | `pthread_cond_*` | [[#线程与同步]] |
| 等多个 fd | `select` `poll` `epoll_wait` | [[#IO 多路复用]] |
| 跨线程唤醒 | `eventfd` `pipe` | [[#IO 多路复用]] |
| 串口/终端配置 | `tcgetattr` `tcsetattr` `cfmakeraw` | [[#终端与串口]] |
| 设备控制 | `ioctl` | [[#ioctl 与硬件访问]] |
| GPIO | `/dev/gpiochipN` + ioctl | [[#ioctl 与硬件访问]] |
| I2C/SPI | `I2C_RDWR`、`SPI_IOC_MESSAGE` | [[#ioctl 与硬件访问]] |
| 计时 | `clock_gettime` `nanosleep` | [[#时间与定时]] |
| 进程间传数据 | `pipe` `shm_open` `sem_open` | [[#进程间通信]] |
| 传 fd | `sendmsg` + `SCM_RIGHTS` | [[#socket 编程]] |
| 查错误 | `errno` `strace` `ss` | [[#错误处理与排错]] |
## 文件与描述符
一切皆文件：普通文件、socket、管道、字符设备、终端共用 fd 接口，差异由 `struct file` 的 `f_op` 分派。fd 是进程 fd 表的下标，`fork` 后父子共享同一 `struct file`（含偏移），`dup` 同理。
### open / openat

```c
/* 原型清单：只用于查参数顺序与类型，用 #if 0 包住避免与系统声明冲突 */
#include <fcntl.h>
#include <sys/stat.h>

#if 0
int open(const char *pathname, int flags);
int open(const char *pathname, int flags, mode_t mode);
int openat(int dirfd, const char *pathname, int flags, ... /* mode_t mode */);
int creat(const char *pathname, mode_t mode);   /* = open(path, O_CREAT|O_WRONLY|O_TRUNC, mode) */
#endif
```
#### pathname 能填什么

| 填法 | 具体例子 | 内核如何解析 | 结果 |
| --- | --- | --- | --- |
| 绝对路径 | `"/etc/passwd"` | 从根目录 `/` 逐级解析 | 与进程 cwd 无关 |
| 相对路径 | `"data/a.txt"`、`"a.txt"` | 从进程当前工作目录（`getcwd` 的值）开始 | `chdir` 后指向不同文件；多线程共享 CWD，一个线程 `chdir` 影响所有线程 |
| 显式当前目录 | `"./a.txt"` | `.` 是目录项，解析为 cwd | 同上，但语义更清楚 |
| 上级目录 | `"../a.txt"`、`"../../etc/hosts"` | `..` 解析为父目录，可多次 | 到根后再 `..` 仍是根 |
| 以 `/` 结尾 | `"/var/log/"`、`"dir/"` | 强制要求目标是目录，普通文件返回 `ENOTDIR` | 用来断言"这是个目录" |
| 含 `~` | `"~/a.txt"` | **内核不做波浪号展开**，只有 shell 展开 | 程序里直接传会 `ENOENT`，需自己拼 `getenv("HOME")` |
| 含 `$VAR` | `"$HOME/a.txt"` | 同上，不做变量展开 | 同上 |
| 软链接 | `"link_to_file"` | 默认跟随，最多 40 层（`SYMLOOP_MAX`） | 超过返回 `ELOOP`；加 `O_NOFOLLOW` 则不跟随，打开链接本身 |
| 中间目录不存在 | `"a/b/c.txt"` + `O_CREAT` | `O_CREAT` 只创建**最后一级** | 返回 `ENOENT`，需先 `mkdir -p` |
| 空字符串 | `""` | 无有效路径 | 返回 `ENOENT` |
| 单个分量过长 | 某一段超过 255 字节（`NAME_MAX`） | 拒绝 | `ENAMETOOLONG` |
| 整条路径过长 | 超过 4096 字节（`PATH_MAX`） | 拒绝 | `ENAMETOOLONG` |
| 特殊文件 | `"/dev/null"`、`"/dev/urandom"`、`"/proc/self/status"`、`"/proc/self/fd/0"` | 按设备/伪文件解析 | 行为由驱动决定 |
| 不存在 + `O_CREAT` | `"/tmp/new.log"` | 创建普通文件（或 `O_DIRECTORY` 时创建目录） | 权限受 `mode & ~umask` 约束 |
| 已存在 + `O_CREAT` | `"/tmp/exist.log"` | 直接打开，不截断 | 想清空必须再加 `O_TRUNC` |
| 已存在 + `O_CREAT|O_EXCL` | 同上 | 拒绝 | `EEXIST`，这是"原子创建锁文件"的标准写法 |
相对路径的陷阱：守护进程化时 `chdir("/")` 会让所有相对路径失效；`chdir` 是**进程级**状态，多线程程序里改它等于给其他线程埋雷。多线程下要访问固定目录，用 `openat` 持有目录 fd：

```c
int dirfd = open("/srv/data", O_RDONLY | O_DIRECTORY | O_CLOEXEC);
int fd = openat(dirfd, "a.txt", O_RDONLY);   /* 不受 chdir 影响，也没有 TOCTOU */
```
#### openat 的 dirfd 能填什么

| dirfd 取值 | 含义 | 效果 |
| --- | --- | --- |
| `AT_FDCWD`（-100） | 相对当前工作目录 | 与 `open` 等价 |
| 目录 fd（`O_DIRECTORY` 打开） | 相对该目录 | 路径以 `/` 开头时 dirfd 被忽略 |
| 非目录 fd | 大部分情况 | 返回 `ENOTDIR` |
`openat` 的价值：① 多线程下不依赖进程 CWD；② 目录可以 `rename` 后仍安全访问（fd 指向的 inode 不变）；③ 配合 `O_NOFOLLOW` 逐级打开，杜绝符号链接攻击（TOCTOU）。
#### flags 能填什么（访问模式，三选一）

| 字面量 | 数值 | 效果 | 注意 |
| --- | --- | --- | --- |
| `O_RDONLY` | 0 | 只读 | 值为 0，所以"没写访问模式"等于只读 |
| `O_WRONLY` | 1 | 只写 | 对目录返回 `EISDIR` |
| `O_RDWR` | 2 | 读写 | |
| `O_ACCMODE` | 3 | 掩码，用于提取访问模式 | `flags & O_ACCMODE` |
不能用 `O_RDONLY|O_WRONLY` 组合，结果是一个非法值。
#### flags 能填什么（创建与存在性）

| 字面量 | 效果 | 依赖与坑 |
| --- | --- | --- |
| `O_CREAT` | 不存在则创建 | 必须同时传 `mode` 参数；漏传时内核取栈上垃圾值，生成随机权限，属于未定义行为 |
| `O_EXCL` | 与 `O_CREAT` 合用，已存在则失败 | `EEXIST`；NFS 上语义不可靠；单独使用无意义 |
| `O_TRUNC` | 打开后截断为 0 字节 | 与 `O_RDONLY` 合用行为未定义；对 FIFO/终端无意义 |
| `O_NOCTTY` | 不把该终端设为控制终端 | 打开串口/终端必须加，否则进程会被 `SIGHUP` 影响 |
| `O_TMPFILE` | 在目录内建匿名文件，无目录项 | 需 `O_RDWR` + 目录路径；用 `linkat(AT_FDCWD, "/proc/self/fd/N", ...)` 或 `linkat(fd, "", ...)` 具名化 |
| `O_DIRECTORY` | 目标必须是目录 | 否则 `ENOTDIR` |
| `O_NOFOLLOW` | 不跟随末尾软链接 | 目标是软链接时返回 `ELOOP` |
| `O_PATH` | 只取 fd 用于 `openat`/`fstat`/`fchdir` | 不能读写，`read` 返回 `EBADF` |
| `O_CLOEXEC` | 设 `FD_CLOEXEC`，`exec` 时自动关闭 | 原子设置，比 `fcntl(F_SETFD)` 安全（避免 fork+exec 间隙泄漏） |
| `O_NOATIME` | 不更新访问时间 | 需是文件属主或 root；否则 `EPERM` |
| `O_NONBLOCK` | 非阻塞 | 对普通文件无效；对 FIFO/设备/socket 有效 |
| `O_SYNC` | 每次写等数据和元数据落盘 | 极慢，等价于 `O_DSYNC` 的加强版 |
| `O_DSYNC` | 只保证数据落盘 | 比 `O_SYNC` 快 |
| `O_RSYNC` | 读也同步（Linux 上与 `O_SYNC` 相同） | |
| `O_DIRECT` | 绕过页缓存直接对设备 IO | 缓冲区地址、长度、偏移必须按逻辑块大小对齐，否则 `EINVAL` |
| `O_ASYNC` | 可读可写时发 `SIGIO` | 需配合 `fcntl(F_SETOWN)` 指定接收进程 |
| `O_LARGEFILE` | 允许 32 位系统打开大文件 | 64 位系统无意义 |
| `O_NDELAY` | 历史别名，近似 `O_NONBLOCK` | 新代码别用 |
| `__O_TMPFILE` | glibc 内部值 | 应用层用 `O_TMPFILE` |
只有创建/存在性相关的标志能在 `open` 时给；`O_APPEND`、`O_NONBLOCK`、`O_ASYNC`、`O_DIRECT`、`O_NOATIME` 可以用 `fcntl(F_SETFL)` 事后改，**访问模式与 O_CREAT/O_EXCL/O_TRUNC/O_NOCTTY/O_PATH 不能事后改**。
#### mode 能填什么
只在 `O_CREAT` 或 `O_TMPFILE` 时生效，实际权限 = `mode & ~umask`。

| 字面量 | 含义 | 典型用途 |
| --- | --- | --- |
| `0600` | 属主读写 | 私钥、会话文件 |
| `0644` | 属主读写，其他只读 | 普通数据文件、配置 |
| `0666` | 所有人读写 | 共享临时文件（实际被 umask 砍成 644） |
| `0700` | 属主全权 | 私有目录 |
| `0755` | 属主全权，其他可读可执行 | 可执行程序、公开目录 |
| `0777` | 所有人全权 | 慎用；临时目录常配 sticky |
| `01777` | 0777 + sticky 位 | `/tmp`：只有属主能删自己的文件 |
| `02755` | 0755 + setgid | 目录内新建文件继承目录的组 |
| `04755` | 0755 + setuid | 执行时以文件属主身份运行，安全风险高 |
| `S_IRUSR`/`S_IWUSR`/`S_IXUSR` | 0400/0200/0100 | 等价写法，可读性更好 |
| `S_IRGRP`/`S_IWGRP`/`S_IXGRP` | 0040/0020/0010 | 组权限 |
| `S_IROTH`/`S_IWOTH`/`S_IXOTH` | 0004/0002/0001 | 其他用户权限 |
umask 的影响：shell 默认 `022`，所以 `open(..., 0666)` 实际得到 `0644`。要强制得到指定权限，先 `umask(0)` 或用 `fchmod` 事后修正。
#### 返回值与 errno
返回：当前**最小可用**的非负 fd（0/1/2 已被标准流占用时从 3 开始）；失败 -1。

| errno | 触发条件 | 处理 |
| --- | --- | --- |
| `EACCES` | 权限不足：文件不可读、目录无 `x` 权限、`O_TRUNC` 需写权限 | 检查路径上每一级目录的权限位 |
| `EEXIST` | `O_CREAT|O_EXCL` 且文件已存在 | 视为"锁已被占用" |
| `ENOENT` | 路径不存在、中间目录缺失、`O_CREAT` 未加但文件不存在、`O_NOFOLLOW` 遇到悬空链接 | 区分"要不要创建" |
| `EISDIR` | 用 `O_WRONLY`/`O_RDWR` 打开目录 | 目录只能用 `O_RDONLY` 或 `O_PATH` |
| `ENOTDIR` | 路径中间某段不是目录，或 `O_DIRECTORY` 遇到普通文件 | |
| `ELOOP` | 软链接层数超过 40，或 `O_NOFOLLOW` 遇到软链接 | |
| `EMFILE` | 本进程 fd 数达到 `RLIMIT_NOFILE` | 调 rlimit 或查泄漏 |
| `ENFILE` | 系统级 fd 耗尽（`/proc/sys/fs/file-max`） | 系统问题 |
| `ENAMETOOLONG` | 单个分量 > 255 或整条路径 > 4096 | |
| `ENOSPC` | `O_CREAT` 时磁盘/inode 满 | |
| `EROFS` | 只读文件系统上写打开 | |
| `EINTR` | 打开慢设备（FIFO、NFS）时被信号打断 | 重试 |
| `EINVAL` | flags 非法（如 `O_TMPFILE` 没配 `O_RDWR`）、`O_DIRECT` 不支持 | |
> [!Warning] fd 泄漏的典型来源
> `socket`/`accept`/`open`/`pipe` 后任何一条错误分支提前 return 都漏 fd。统一用 RAII 包装或 `goto` 清理路径；排查用 `lsof -p <pid>` 或 `ls -l /proc/<pid>/fd`。
#### 最小示例

```c
/* 安全创建日志文件：不存在则建、权限 0644、exec 时自动关闭 */
int fd = open("/var/log/app.log", O_WRONLY | O_CREAT | O_APPEND | O_CLOEXEC, 0644);
if (fd < 0) { perror("open"); return -1; }

/* 原子创建锁文件：已存在就说明有别的实例在跑 */
int lock = open("/var/run/app.lock", O_WRONLY | O_CREAT | O_EXCL | O_CLOEXEC, 0644);
if (lock < 0 && errno == EEXIST) { fprintf(stderr, "already running\n"); return 1; }
```
### close

```c
#include <unistd.h>
int close(int fd);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `fd` | `open`/`socket`/`accept`/`pipe` 返回的非负 fd | 从 fd 表摘除该表项，引用计数减一；减到 0 才真正释放 `struct file` |
| `fd` | `0`/`1`/`2` | 关闭标准输入/输出/错误，后续 `open` 可能复用这些编号，造成"标准输出突然写进日志文件" |
| `fd` | 已关闭的 fd / 负数 | `EBADF` |
返回 0 或 -1（`EBADF`、`EINTR`、`EIO`）。Linux 上 `close` 先摘除 fd 再 flush，返回 `EINTR` 时 fd **已经释放**，不能重试——重试可能关掉别的线程刚拿到的同号 fd。
### read / write

```c
#include <unistd.h>
ssize_t read(int fd, void *buf, size_t count);
ssize_t write(int fd, const void *buf, size_t count);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `fd` | 任何已打开的描述符 | 文件、socket、管道、eventfd、tty 走同一接口，由图 `f_op` 分派 |
| `fd` | `0`（stdin） | 读终端：默认行缓冲，回车才返回 |
| `buf` | 栈数组 `char b[4096]`、堆 `malloc(n)`、`mmap` 地址 | 内核直接拷贝到该地址；`NULL` → `EFAULT` |
| `count` | `1` 到 `SSIZE_MAX` | 请求字节数；对管道受管道容量限制，对 socket 受收发缓冲区限制 |
| `count` | `0` | `read` 返回 0（看起来像 EOF），`write` 返回 0 |
| `count` | 大于 `INT_MAX` | 部分平台会截断或返回 `EINVAL`，单次别超过 1 GB |
返回：`> 0` 实际字节数；0 表示 EOF（仅 `read`）或计数为 0；-1 失败。

| errno | 触发条件 | 处理 |
| --- | --- | --- |
| `EINTR` | 阻塞中被信号打断 | 重试（或用 `SA_RESTART`） |
| `EAGAIN`/`EWOULDBLOCK` | 非阻塞且无数据/缓冲满 | 注册 epoll 等就绪 |
| `EBADF` | fd 非法，或以读方式打开却 `write` | 检查访问模式 |
| `EFAULT` | buf 指向未映射地址 | |
| `EINVAL` | `O_DIRECT` 未对齐、`count` 非法 | |
| `EISDIR` | `read` 目录 | 用 `readdir` |
| `EPIPE` | 写端已关，同时收到 `SIGPIPE` | 忽略信号，按断开处理 |
| `ENOSPC`/`EDQUOT` | 磁盘满/配额超 | |
| `EFBIG` | 超过 `RLIMIT_FSIZE` | |
短读短写是常态：`write` 只保证写入一部分，返回后必须按返回值推进指针循环。

```c
/* 完整的写循环：短写、EINTR、EAGAIN 都要处理 */
static int write_all(int fd, const void *buf, size_t len) {
    const char *p = buf;
    while (len > 0) {
        ssize_t n = write(fd, p, len);
        if (n < 0) {
            if (errno == EINTR) continue;
            if (errno == EAGAIN || errno == EWOULDBLOCK) return -2; /* 交给上层等可写 */
            return -1;
        }
        p += n; len -= (size_t)n;
    }
    return 0;
}
```
### pread / pwrite

```c
#include <unistd.h>
ssize_t pread(int fd, void *buf, size_t count, off_t offset);
ssize_t pwrite(int fd, const void *buf, size_t count, off_t offset);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `offset` | `0` | 从文件头读写 |
| `offset` | `lseek(fd, 0, SEEK_END)` 的返回值 | 追加写，但不改变共享偏移 |
| `offset` | 超过文件末尾的正数 | 读返回 0；写造成空洞（稀疏文件） |
| `offset` | 负数 | `EINVAL` |
| `fd` | 管道、FIFO、socket、tty | `ESPIPE`，这些流不可定位 |
返回字节数或 -1。调用后**不改变** fd 的共享偏移，多线程读写同一 fd 的不同区段不需要加锁。
### lseek

```c
#include <unistd.h>
off_t lseek(int fd, off_t offset, int whence);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `whence` | `SEEK_SET`（0） | `offset` 是绝对位置 |
| | `SEEK_CUR`（1） | `offset` 是相对当前位置的增量 |
| | `SEEK_END`（2） | `offset` 是相对文件末尾的增量 |
| | `SEEK_DATA`（3，GNU） | 移到下一个有数据的区段，跳过空洞 |
| | `SEEK_HOLE`（4，GNU） | 移到下一个空洞 |
| `offset` | `0` + `SEEK_SET` | 回到文件头 |
| | `0` + `SEEK_CUR` | **查询当前偏移**，不移动 |
| | `0` + `SEEK_END` | **取文件大小**（等价 `fstat` 的 `st_size`） |
| | `size` + `SEEK_END` | 在末尾追加 |
| | `-n` + `SEEK_CUR` | 向后退 n 字节（不能退到 0 之前） |
| | 负数结果 | `EINVAL` |
返回新偏移（绝对位置），失败 -1（`ESPIPE` 管道/socket、`EINVAL`、`EOVERFLOW`）。允许偏移超过文件尾，此时文件不立即变大，下一次写入形成空洞。
### dup / dup2 / dup3

```c
#include <unistd.h>
int dup(int oldfd);
int dup2(int oldfd, int newfd);
int dup3(int oldfd, int newfd, int flags);   /* flags 只能填 0 或 O_CLOEXEC */
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `oldfd` | 任何已打开的 fd | 被复制的源 |
| `oldfd` | 未打开的 fd | `EBADF` |
| `newfd` | 具体数字如 `1` | 复制到该编号；已打开则**先关后复制**（原子） |
| `newfd` | `0`/`1`/`2` | 重定向标准输入/输出/错误 |
| `newfd` | `oldfd == newfd` | `dup2` 直接返回 `newfd` 不关闭；`dup3` 返回 `EINVAL` |
| `newfd` | 超过 `RLIMIT_NOFILE` | `EBADF` |
| `flags` | `0` | 不带 `CLOEXEC` |
| `flags` | `O_CLOEXEC` | 新 fd 在 exec 时自动关闭 |
| `flags` | 其他任何位 | `EINVAL` |
两个 fd 指向同一个 `struct file`，**共享偏移与文件状态标志**。典型用法：

```c
/* 把 stdout 重定向到文件，保留原 stdout 以便恢复 */
int saved = dup(1);
int fd = open("out.log", O_WRONLY | O_CREAT | O_TRUNC, 0644);
dup2(fd, 1);            /* 此后 printf 写入 out.log */
close(fd);              /* 原 fd 用完即可关，1 仍有效 */
/* ... */
dup2(saved, 1);
close(saved);
```
### fcntl

```c
#include <fcntl.h>
#include <unistd.h>
int fcntl(int fd, int cmd, ... /* arg */);
```

| cmd | arg 类型与可填写的值 | 效果 |
| --- | --- | --- |
| `F_DUPFD` | `int` 最小 fd，如 `0`、`10` | 复制到 ≥ arg 的最小可用 fd |
| `F_DUPFD_CLOEXEC` | `int` 最小 fd | 同上并设 `FD_CLOEXEC` |
| `F_GETFD` | 无 | 返回 fd 标志位，0 或 `FD_CLOEXEC`(1) |
| `F_SETFD` | `0` 或 `FD_CLOEXEC` | 清除/设置 exec 关闭标志 |
| `F_GETFL` | 无 | 返回文件状态标志（`O_RDWR`、`O_APPEND`、`O_NONBLOCK`…） |
| `F_SETFL` | `F_GETFL` 结果 `| O_APPEND` | 只能改 `O_APPEND`、`O_NONBLOCK`、`O_ASYNC`、`O_DIRECT`、`O_NOATIME` |
| `F_SETFL` | `F_GETFL` 结果 `& ~O_NONBLOCK` | 恢复阻塞 |
| `F_SETFL` | 试图改访问模式 | 被忽略，访问模式不可变 |
| `F_GETOWN`/`F_SETOWN` | `pid_t`：`getpid()`、`-getpgrp()` | 异步 IO 信号的接收者；负值表示进程组 |
| `F_GETLK` | `struct flock *` | 查询能否加锁，不实际加锁 |
| `F_SETLK` | `struct flock *` | 加锁/解锁，冲突立即返回 `EAGAIN` |
| `F_SETLKW` | `struct flock *` | 加锁/解锁，冲突则阻塞等待 |
| `F_GETPIPE_SZ` | 无 | 返回管道容量（默认 65536） |
| `F_SETPIPE_SZ` | `int` 字节数 | 调整管道容量，非特权上限为 `/proc/sys/fs/pipe-max-size` |
| `F_ADD_SEALS` | `F_SEAL_WRITE` 等位组合 | 对 memfd 加封印 |
| `F_GET_SEALS` | 无 | 返回已有封印位 |
| `F_SYNC`/`F_GET_RW_HINT` | 少数场景 | 同步写、写提示 |
`struct flock` 各字段能填什么：

| 字段 | 可填写的值 | 效果 |
| --- | --- | --- |
| `l_type` | `F_RDLCK` | 共享读锁，多方同时持有 |
| | `F_WRLCK` | 排他写锁，独占 |
| | `F_UNLCK` | 解锁 |
| `l_whence` | `SEEK_SET`/`SEEK_CUR`/`SEEK_END` | 与 `lseek` 同义 |
| `l_start` | `0` | 从文件头开始（配合 `SEEK_SET`） |
| `l_len` | `0` | 锁到文件末尾，**之后追加的数据也被锁** |
| | 正数 | 锁定该字节区间 |
| | 负数 | 反向区间 |
| `l_pid` | 输出，无需填 | `F_GETLK` 返回持锁进程 |
记录锁语义陷阱：锁属于**进程**而非 fd，进程内任一 fd 关闭该文件就释放该进程的全部锁；`fork` 后子进程不继承；`flock` 是全文件锁，语义不同，二者不可混用。
把 fd 设为非阻塞的标准写法：

```c
int flags = fcntl(fd, F_GETFL, 0);
fcntl(fd, F_SETFL, flags | O_NONBLOCK);
```
### fsync / fdatasync

```c
#include <unistd.h>
int fsync(int fd);
int fdatasync(int fd);
void sync(void);
int syncfs(int fd);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `fd`（`fsync`） | 普通文件 fd | 数据 + 元数据（大小、mtime、inode）落盘，阻塞到设备确认 |
| `fd`（`fdatasync`） | 普通文件 fd | 只保证数据；元数据仅在影响读取时才写 |
| `fd`（`syncfs`） | 该文件系统上任意 fd | 同步整个文件系统的脏页，不等待完成返回 |
| `fd` | 管道、socket、tty | `EINVAL` 或 `EROFS` |
| `fd` | `O_DIRECT` 打开的文件 | 仍有效，通常已同步 |
返回 0 或 -1（`EBADF`、`EINVAL`、`EIO`、`ENOSPC`、`EROFS`）。单次 `fsync` 毫秒到几十毫秒；写日志必须处理它，否则掉电丢数据。`O_SYNC` 是每次 `write` 都等，代价更高。
### ftruncate / truncate

```c
#include <unistd.h>
int ftruncate(int fd, off_t length);
int truncate(const char *path, off_t length);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `length` | `0` | 清空文件，保留 inode 与权限 |
| `length` | 小于当前大小 | 截断，被砍部分丢弃 |
| `length` | 大于当前大小 | 扩展，读为 0 字节，不立即分配磁盘块（稀疏） |
| `length` | 负数 | `EINVAL` |
| `fd` | 只读打开的 fd | `EINVAL`（需可写） |
| `fd` | 目录 | `EISDIR` |
返回 0 或 -1。`shm_open` 出来的对象必须先 `ftruncate` 才能 `mmap`。
### stat / fstat / lstat

```c
#include <sys/stat.h>
int stat(const char *pathname, struct stat *buf);
int lstat(const char *pathname, struct stat *buf);
int fstat(int fd, struct stat *buf);
```
三个函数的区别只在第一个参数：`stat` 跟随软链接、`lstat` 不跟随、`fstat` 按 fd（避免路径竞态）。

| 输出字段 | 能读出什么 | 判断方式 |
| --- | --- | --- |
| `st_mode` | 文件类型 + 权限 | `S_ISREG`/`S_ISDIR`/`S_ISCHR`/`S_ISBLK`/`S_ISFIFO`/`S_ISLNK`/`S_ISSOCK` 判类型；`st_mode & 0777` 取权限 |
| `st_size` | 字节数 | 块设备恒为 0；目录是条目大小 |
| `st_ino` + `st_dev` | 唯一标识 | 两个字一起比较才可靠 |
| `st_nlink` | 硬链接数 | 删到 0 且无 fd 打开才回收 |
| `st_uid`/`st_gid` | 属主/属组 | 与 `geteuid` 比较判权限 |
| `st_atim`/`st_mtim`/`st_ctim` | 访问/内容修改/inode 变更时间 | `st_ctime` **不是**创建时间 |
| `st_blksize` | 最优 IO 块大小 | 缓冲区按它对齐 |
| `st_blocks` | 分配的 512 字节块数 | `st_blocks * 512 < st_size` 说明是稀疏文件 |
返回 0 或 -1（`ENOENT`、`EACCES`、`ELOOP`、`ENOTDIR`、`EOVERFLOW`）。
### mmap / munmap

```c
#include <sys/mman.h>
void *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset);
int munmap(void *addr, size_t length);
int mprotect(void *addr, size_t len, int prot);
int msync(void *addr, size_t length, int flags);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `addr` | `NULL` | 内核选地址（99% 的情况） |
| | 具体地址 + 无 `MAP_FIXED` | 作为建议地址，内核可忽略 |
| | 具体地址 + `MAP_FIXED` | **强制**覆盖该区域已有映射，危险，会静默替换 |
| `length` | 任意正数 | 按页向上取整；`0` 返回 `EINVAL` |
| `prot` | `PROT_READ` | 可读 |
| | `PROT_WRITE` | 可写 |
| | `PROT_EXEC` | 可执行 |
| | `PROT_NONE` | 不可访问，用作保护页 |
| | 组合如 `PROT_READ|PROT_WRITE` | 按位或 |
| `flags` | `MAP_SHARED` | 改动写回文件/共享给其他进程 |
| | `MAP_PRIVATE` | 写时复制，改动不落盘 |
| | `MAP_SHARED|MAP_ANONYMOUS` + `fd = -1` | 大块匿名内存，不关联文件 |
| | `MAP_PRIVATE|MAP_ANONYMOUS` + `fd = -1` | `malloc` 大块分配的底层 |
| | `MAP_POPULATE` | 提前预读，减少缺页中断，启动变慢 |
| | `MAP_LOCKED` | 锁定在内存，需 `RLIMIT_MEMLOCK` |
| | `MAP_NORESERVE` | 不预留交换空间 |
| | `MAP_HUGETLB` | 使用大页 |
| `fd` | 文件 fd | 文件映射 |
| | `-1` | 必须配合 `MAP_ANONYMOUS` |
| `offset` | `0` | 从文件头映射 |
| | 页大小的整数倍 | 否则 `EINVAL` |
返回映射起始地址，失败返回 `MAP_FAILED`（`(void *)-1`，**不是 NULL**）。`MAP_SHARED` 写完必须 `msync(addr, len, MS_MSYNC)` 才保证落盘，`MS_SYNC` 阻塞、`MS_ASYNC` 只排队。
### opendir / readdir

```c
#include <dirent.h>
DIR *opendir(const char *name);
struct dirent *readdir(DIR *dirp);
int closedir(DIR *dirp);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `name` | `"."`、`".."`、`"/var/log"` | 按目录打开，普通文件返回 `ENOTDIR` |
| `dirp` | `opendir` 返回值 | `readdir` 每次返回一项，读完返回 NULL（`errno` 不变表示正常结束，改了表示出错） |
`struct dirent` 的 `d_type` 能填/能读到：`DT_REG`、`DT_DIR`、`DT_LNK`、`DT_FIFO`、`DT_SOCK`、`DT_CHR`、`DT_BLK`、`DT_UNKNOWN`。`DT_UNKNOWN` 出现在部分文件系统上，此时必须 `stat` 补判。`readdir` 的内部缓冲区会被下次调用覆盖，需要保留就自己拷贝。
### pipe / pipe2

```c
#include <unistd.h>
int pipe(int pipefd[2]);
int pipe2(int pipefd[2], int flags);   /* flags: 0 | O_CLOEXEC | O_NONBLOCK */
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `pipefd[0]` | 输出 | 读端 |
| `pipefd[1]` | 输出 | 写端 |
| `flags`（`pipe2`） | `0` | 默认，两端都阻塞 |
| | `O_CLOEXEC` | 两端 exec 时自动关闭 |
| | `O_NONBLOCK` | 两端非阻塞 |
| | 其他位 | `EINVAL` |
容量默认 65536 字节，可用 `fcntl(F_SETPIPE_SZ)` 调整。写端全关后读端 `read` 返回 0；读端全关后写端触发 `SIGPIPE` 并返回 `EPIPE`。写超过 `PIPE_BUF`（4096）不保证原子。
### sendfile / splice

```c
#include <sys/sendfile.h>
ssize_t sendfile(int out_fd, int in_fd, off_t *offset, size_t count);
#include <fcntl.h>
ssize_t splice(int fd_in, loff_t *off_in, int fd_out, loff_t *off_out,
               size_t len, unsigned int flags);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `out_fd`/`in_fd` | 文件 ↔ socket | `in_fd` 必须是文件，`out_fd` 必须是 socket（2.6.33 后也可文件） |
| `offset` | `NULL` | 用文件当前偏移并推进它 |
| | `&off` | 用 `off` 的值且不改变文件偏移 |
| `count` | 字节数 | 实际可能更少，返回已传字节 |
| `flags`（`splice`） | `SPLICE_F_MOVE` | 尝试移动页而不是复制 |
| | `SPLICE_F_NONBLOCK` | 不阻塞 |
| | `SPLICE_F_MORE` | 后续还有数据 |
`splice` 要求至少一端是管道；`tee` 在管道间复制不消耗源；`vmsplice` 把用户页送入管道。
### 文件 IO 常用封装

```c
/* 读满 len 字节：处理短读与 EINTR */
static ssize_t read_full(int fd, void *buf, size_t len) {
    size_t done = 0;
    while (done < len) {
        ssize_t n = read(fd, (char *)buf + done, len - done);
        if (n < 0) { if (errno == EINTR) continue; return -1; }
        if (n == 0) break;           /* 对端关闭或文件结束 */
        done += (size_t)n;
    }
    return (ssize_t)done;
}
/* 设置/清除非阻塞 */
static int set_nonblock(int fd, int on) {
    int fl = fcntl(fd, F_GETFL, 0);
    if (fl < 0) return -1;
    return fcntl(fd, F_SETFL, on ? (fl | O_NONBLOCK) : (fl & ~O_NONBLOCK));
}
/* 设置 FD_CLOEXEC（多线程下应优先用 O_CLOEXEC / accept4 / pipe2） */
static int set_cloexec(int fd) {
    int fl = fcntl(fd, F_GETFD, 0);
    if (fl < 0) return -1;
    return fcntl(fd, F_SETFD, fl | FD_CLOEXEC);
}
```
## socket 编程
### 地址结构与字节序

```c
/* 字段布局参考：以下结构体由系统头文件定义，此处只列出字段含义，勿在代码中重复声明 */
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/un.h>

/* 字段顺序如下（系统头文件中已定义，此处仅作对照）：
 * sockaddr_in  : sa_family_t sin_family; in_port_t sin_port; struct in_addr sin_addr; char sin_zero[8];
 * sockaddr_in6 : sa_family_t sin6_family; in_port_t sin6_port; uint32_t sin6_flowinfo;
 *                struct in6_addr sin6_addr; uint32_t sin6_scope_id;
 * sockaddr_un  : sa_family_t sun_family; char sun_path[108];
 */
```
`sin_addr.s_addr` 能填什么：

| 字面量 | 含义 | 效果 |
| --- | --- | --- |
| `htonl(INADDR_ANY)`（即 0） | 0.0.0.0 | 监听本机所有网卡；客户端 `bind` 时等价于让内核选源地址 |
| `htonl(INADDR_LOOPBACK)`（即 `0x7f000001`） | 127.0.0.1 | 只允许本机访问，外部连不进来 |
| `inet_pton(AF_INET, "192.168.1.10", &addr.sin_addr)` | 某块网卡的真实 IP | 只接收该网卡的报文；IP 不属于本机时 `bind` 返回 `EADDRNOTAVAIL` |
`sin_port` 能填什么：

| 字面量 | 含义 | 效果 |
| --- | --- | --- |
| `htons(0)` | 端口 0 | 内核分配临时端口，用 `getsockname` 取回 |
| `htons(8080)` | 1–1023 之外 | 普通用户可绑定 |
| `htons(80)` / `htons(443)` | 1–1023 | 需 root 或 `CAP_NET_BIND_SERVICE`，否则 `EACCES` |
| 未转换的 `8080` | 主机序 | 在小端机上变成端口 0x901F = 36895，能 bind 但连不上预期的端口 |
字节序函数：

| 函数 | 输入 | 输出 |
| --- | --- | --- |
| `htons(8080)` | 主机序 16 位 | 网络序，用于端口 |
| `htonl(INADDR_ANY)` | 主机序 32 位 | 网络序，用于 IPv4 地址 |
| `ntohs(peer.sin_port)` | 网络序端口 | 主机序，打印时用 |
| `inet_pton(AF_INET, "127.0.0.1", &in)` | 点分串 | 返回 1 成功、0 格式错、-1 地址族错 |
| `inet_ntop(AF_INET, &in, buf, INET_ADDRSTRLEN)` | 二进制 | 缓冲区至少 16（v4）或 46（v6）字节 |
| `inet_addr("255.255.255.255")` | 点分串 | 返回 `INADDR_NONE`，**与错误无法区分**，已废弃 |

```c
struct sockaddr_in addr;
memset(&addr, 0, sizeof addr);                 /* sin_zero 必须清零 */
addr.sin_family      = AF_INET;
addr.sin_port        = htons(8080);
addr.sin_addr.s_addr = htonl(INADDR_ANY);
```
### socket

```c
#include <sys/socket.h>
int socket(int domain, int type, int protocol);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `domain` | `AF_INET` | IPv4，最常用 |
| | `AF_INET6` | IPv6；默认也能收 IPv4 映射地址（见 `IPV6_V6ONLY`） |
| | `AF_UNIX`（`AF_LOCAL`） | 本机通信，可传 fd，比 TCP 快 |
| | `AF_PACKET` | 链路层原始帧，抓包/构造以太网帧，需 `CAP_NET_RAW` |
| | `AF_NETLINK` | 与内核通信（路由、审计） |
| | `AF_CAN` | 车载 CAN 总线 |
| | `AF_VSOCK` | 虚拟机与宿主通信 |
| | 其他（`AF_BLUETOOTH`、`AF_ALG`…） | 需对应内核模块 |
| `type` | `SOCK_STREAM` | 面向连接、有序、可靠，TCP |
| | `SOCK_DGRAM` | 无连接、保留消息边界，UDP |
| | `SOCK_RAW` | 原始报文，需自己处理 IP 头，需 root |
| | `SOCK_SEQPACKET` | 有序可靠且保留边界（Unix 域常用） |
| | `SOCK_STREAM | SOCK_NONBLOCK` | 创建即非阻塞 |
| | `SOCK_STREAM | SOCK_CLOEXEC` | 创建即带 `FD_CLOEXEC`，原子，避免 fork+exec 泄漏 |
| `protocol` | `0` | 由 domain+type 自动推导，绝大多数情况 |
| | `IPPROTO_TCP`(6) | 与 `SOCK_STREAM` 配对时冗余 |
| | `IPPROTO_UDP`(17) | 与 `SOCK_DGRAM` 配对时冗余 |
| | `IPPROTO_ICMP`(1) | 必须配 `SOCK_RAW`，用于 ping |
| | `IPPROTO_SCTP`(132) | SCTP |
| | `htons(ETH_P_ALL)` | `AF_PACKET` 下抓所有以太网帧 |
返回 fd，失败 -1：`EAFNOSUPPORT`（domain 不支持）、`EPROTONOSUPPORT`、`EMFILE`（本进程 fd 用尽）、`ENFILE`、`EACCES`（无权限开 raw）、`ENOBUFS`、`EINVAL`（type 与 protocol 冲突）。
### bind

```c
int bind(int sockfd, const struct sockaddr *addr, socklen_t addrlen);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `sockfd` | `socket` 返回的 fd | 已绑定的 fd 再次 `bind` 返回 `EINVAL` |
| `addr` | `(struct sockaddr *)&addr_in` | IPv4，必须强转成通用类型 |
| | `(struct sockaddr *)&addr_in6` | IPv6 |
| | `(struct sockaddr *)&addr_un` | Unix 域；`sun_path` 填 `"/tmp/s.sock"` 会产生磁盘文件，填 `"\0name"`（首字节 0）进入抽象命名空间、不落盘 |
| | `NULL` | `EFAULT` 或 `EINVAL` |
| `addrlen` | `sizeof(struct sockaddr_in)` | 最常用写法 |
| | `sizeof(struct sockaddr_in6)` | IPv6 |
| | Unix 域：`sizeof(struct sockaddr_un)` 或 `offsetof(struct sockaddr_un, sun_path) + strlen(path) + 1` | 后者更精确，抽象命名空间要用 `offsetof + 1 + 名字长度` |
| | 小于实际结构 | 只取前 addrlen 字节，可能绑到错误端口 |
返回 0 或 -1：`EADDRINUSE`（端口被占）、`EADDRNOTAVAIL`（IP 不属于本机）、`EACCES`（低端口无权限）、`EINVAL`（已绑定）、`EBADF`、`ENOTSOCK`、`EAFNOSUPPORT`、`ENAMETOOLONG`（Unix 路径超长）。

```c
int on = 1;
setsockopt(fd, SOL_SOCKET, SO_REUSEADDR, &on, sizeof on);  /* 重启时避免 Address already in use */
```
### listen

```c
int listen(int sockfd, int backlog);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `backlog` | `0` | 内核仍允许少量连接（实现取最小可用值），实际几乎等于 1 |
| | `5` | 老默认值，现代高并发下必然丢连接 |
| | `128` | 常见起点 |
| | `511` / `1024` | 会被内核按 `net.core.somaxconn`（默认 4096）截断 |
| | `SOMAXCONN` | 取系统默认值，省去硬编码 |
| | 负数 | 当作 0 处理 |
| `sockfd` | 未 `bind` 的 TCP socket | 内核自动绑定 `0.0.0.0` 与随机端口 |
| | UDP socket | `EOPNOTSUPP` |
| | 已 `listen` 的 socket | 只更新 backlog，不重新监听 |
`backlog` 限制的是"已完成三次握手、等待 `accept`"的队列长度。队列满时按 `net.ipv4.tcp_abort_on_overflow` 处理：0（默认）丢弃 ACK 让客户端重传，1 直接 RST。
### accept / accept4

```c
int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);
int accept4(int sockfd, struct sockaddr *addr, socklen_t *addrlen, int flags);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `addr` | `NULL` + `addrlen = NULL` | 不关心对端地址，内核不写 |
| | `&peer_in`（`struct sockaddr_in`） | 取对端 IP 与端口 |
| | `&peer_in6` | IPv6 |
| | `&peer_un` | Unix 域对端地址（可能是空串） |
| `addrlen` | `&(socklen_t){sizeof peer_in}` | 输入缓冲区大小；返回时被改写为实际长度 |
| | `NULL` | 必须与 `addr = NULL` 同时使用 |
| `flags`（`accept4`） | `0` | 等价 `accept` |
| | `SOCK_NONBLOCK` | 新 fd 非阻塞（监听 fd 的非阻塞标志不会被继承） |
| | `SOCK_CLOEXEC` | 新 fd exec 时关闭，多线程服务器必加 |
| | 两位组合 | 同时生效 |
返回新的已连接 fd，失败 -1：`EAGAIN`/`EWOULDBLOCK`（非阻塞且队列空）、`EINTR`（重试）、`ECONNABORTED`（握手后被放弃，重试）、`EMFILE`/`ENFILE`（fd 耗尽，连接仍留在队列里）、`EPERM`（防火墙拒绝）、`EBADF`、`ENOTSOCK`、`EOPNOTSUPP`、`EINVAL`（socket 未监听）。
### connect

```c
int connect(int sockfd, const struct sockaddr *addr, socklen_t addrlen);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `addr` | 目标 `sockaddr_in` | 主动发起三次握手，内核隐式分配源地址与端口 |
| | 广播地址 + `SOCK_DGRAM` | 需先 `SO_BROADCAST` |
| | Unix 域路径 | 连接本地 socket 文件 |
| `sockfd` | 阻塞 fd | 一直等到成功或失败 |
| | 非阻塞 fd | 立刻返回 `EINPROGRESS`，需等可写事件 |
| | 已连接的 fd | `EISCONN` |
| | UDP socket | 只记录对端地址，不产生网络包，此后可用 `send`/`recv` |
返回 0 或有意义的 -1：

| errno | 含义 | 处理 |
| --- | --- | --- |
| `EINPROGRESS` | 非阻塞连接已发起 | 等 `EPOLLOUT`，再用 `getsockopt(SO_ERROR)` 取结果 |
| `EINTR` | 被信号打断，TCP 连接仍在后台进行 | 等可写事件，**不要**重新 connect |
| `ECONNREFUSED` | 端口无监听，对端回 RST | 重试或报错 |
| `ETIMEDOUT` | 握手超时（`tcp_syn_retries` 默认 6，约 127 秒） | 调小重试或加超时 |
| `ENETUNREACH`/`EHOSTUNREACH` | 无路由/主机不可达 | 检查路由 |
| `EALREADY` | 非阻塞连接仍在进行 | 继续等 |
| `EISCONN` | 已连接 | 忽略 |
| `EADDRNOTAVAIL` | 源地址不可用 | |
### shutdown

```c
int shutdown(int sockfd, int how);
```

| `how` 可填写的值 | 效果 | 对端看到什么 |
| --- | --- | --- |
| `SHUT_RD`（0） | 关闭读方向，本端 `recv` 立即返回 0 | 对端继续发数据会被丢弃 |
| `SHUT_WR`（1） | 关闭写方向，发送 FIN | 对端 `read` 得到 EOF；本端仍可 `recv` |
| `SHUT_RDWR`（2） | 双向关闭 | 对端读写都结束 |
| 其他值 | `EINVAL` | |
| 未连接的 fd | `ENOTCONN` | |
| `close` 对比 | 释放 fd 引用，不发 FIN（最后一个引用才发） | 方向不可选 |
### 完整 TCP 服务端示例

```c
#define _GNU_SOURCE
#include <arpa/inet.h>
#include <errno.h>
#include <netinet/in.h>
#include <netinet/tcp.h>
#include <signal.h>
#include <stdio.h>
#include <string.h>
#include <sys/socket.h>
#include <unistd.h>

int main(void) {
    signal(SIGPIPE, SIG_IGN);              /* 写已关闭连接时不要被信号打死 */

    int listenfd = socket(AF_INET, SOCK_STREAM | SOCK_CLOEXEC, 0);
    if (listenfd < 0) { perror("socket"); return 1; }

    int on = 1;
    setsockopt(listenfd, SOL_SOCKET, SO_REUSEADDR, &on, sizeof on);

    struct sockaddr_in addr = {0};
    addr.sin_family      = AF_INET;
    addr.sin_port        = htons(8080);
    addr.sin_addr.s_addr = htonl(INADDR_ANY);
    if (bind(listenfd, (struct sockaddr *)&addr, sizeof addr) < 0) { perror("bind"); return 1; }
    if (listen(listenfd, 128) < 0) { perror("listen"); return 1; }

    for (;;) {
        struct sockaddr_in peer;
        socklen_t plen = sizeof peer;
        int connfd = accept4(listenfd, (struct sockaddr *)&peer, &plen, SOCK_CLOEXEC);
        if (connfd < 0) {
            if (errno == EINTR || errno == ECONNABORTED) continue;
            perror("accept"); break;
        }
        setsockopt(connfd, IPPROTO_TCP, TCP_NODELAY, &on, sizeof on);

        char ip[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, &peer.sin_addr, ip, sizeof ip);
        printf("accept %s:%u\n", ip, ntohs(peer.sin_port));

        char buf[4096];
        ssize_t n;
        while ((n = read(connfd, buf, sizeof buf)) > 0) {
            if (write(connfd, buf, (size_t)n) != n) break;   /* 回显 */
        }
        if (n < 0 && errno != EINTR) perror("read");
        close(connfd);
    }
    close(listenfd);
    return 0;
}
```
### UDP 服务端示例

```c
int fd = socket(AF_INET, SOCK_DGRAM, 0);
struct sockaddr_in addr = {0};
addr.sin_family = AF_INET;
addr.sin_port = htons(9000);
addr.sin_addr.s_addr = htonl(INADDR_ANY);
bind(fd, (struct sockaddr *)&addr, sizeof addr);

char buf[65536];                      /* UDP 单包最大 65507，buf 要给够 */
struct sockaddr_in peer;
socklen_t plen = sizeof peer;
ssize_t n = recvfrom(fd, buf, sizeof buf, 0, (struct sockaddr *)&peer, &plen);
sendto(fd, buf, (size_t)n, 0, (struct sockaddr *)&peer, plen);
```
`recvfrom` 的 `src_addr`/`addrlen` 传 `NULL` 表示不关心来源；`sendto` 的 `dest_addr` 必填（除非之前 `connect` 过）。UDP 无重传，队列满时内核直接丢包，`netstat -su` 的 `receive buffer errors` 能看出来。
### send / recv 与 flags

```c
ssize_t send(int sockfd, const void *buf, size_t len, int flags);
ssize_t recv(int sockfd, void *buf, size_t len, int flags);
ssize_t sendto(int fd, const void *buf, size_t len, int flags,
               const struct sockaddr *dest_addr, socklen_t addrlen);
ssize_t recvfrom(int fd, void *buf, size_t len, int flags,
                 struct sockaddr *src_addr, socklen_t *addrlen);
ssize_t sendmsg(int fd, const struct msghdr *msg, int flags);
ssize_t recvmsg(int fd, struct msghdr *msg, int flags);
```
`flags` 能填什么（可取 0，也可按位或）：

| 字面量 | 适用 | 效果 | 坑 |
| --- | --- | --- | --- |
| `0` | 双向 | 默认阻塞语义 | |
| `MSG_NOSIGNAL` | send | 对端已关闭时不发 `SIGPIPE`，返回 `EPIPE` | 比全局忽略信号更可控 |
| `MSG_DONTWAIT` | 双向 | 本次调用临时非阻塞 | 不用改 fd 标志 |
| `MSG_MORE` | send | 后面还有数据，先别发小包 | 与 `TCP_CORK` 类似 |
| `MSG_WAITALL` | recv | 尽量读满 len | 仍可能被信号或对端关闭打断 |
| `MSG_PEEK` | recv | 只窥探不移除数据 | 下次还能读到同一批 |
| `MSG_TRUNC` | recv | 返回数据报真实长度（即使被截断） | UDP 判断原始长度用它 |
| `MSG_OOB` | 双向 | 紧急数据 | 项目里几乎不用 |
| `MSG_EOR` | 双向 | 记录结束边界 | 仅 `SOCK_SEQPACKET` 有效 |
| `MSG_ZEROCOPY` | send | 大文件零拷贝发送 | 需 `SO_ZEROCOPY`，完成走错误队列 |
| `MSG_CMSG_CLOEXEC` | recvmsg | 收到的 fd 自动设 `CLOEXEC` | 传 fd 时强烈建议 |
| `MSG_DONTROUTE` | send | 绕过路由表，直发本地网络 | 诊断用 |
| `MSG_CONFIRM` | send | 提示链路层对端仍可达 | |
传给 `sendto`/`recvfrom` 的地址参数：

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `dest_addr`（sendto） | `&peer` | UDP 指定目的地址 |
| | `NULL` + `addrlen = 0` | 仅对已 `connect` 的 socket 有效 |
| | TCP socket 上非 NULL | `EISCONN` |
| `src_addr`（recvfrom） | `&peer` | 回填发送方地址 |
| | `NULL` | 不关心来源，忽略 addrlen |
| `addrlen`（recvfrom） | 输入输出指针 | 传入缓冲区大小，返回实际长度 |
### TCP 选项与 Nagle

```c
#include <netinet/in.h>
#include <netinet/tcp.h>
#include <sys/socket.h>

static void enable_nodelay(int fd) {
    int on = 1;
    setsockopt(fd, IPPROTO_TCP, TCP_NODELAY, &on, sizeof on);
}
```

| 选项 | level | 值类型与可填写的值 | 效果与取舍 |
| --- | --- | --- | --- |
| `TCP_NODELAY` | `IPPROTO_TCP` | `int`：`1` 开、`0` 关 | 关闭 Nagle 合并小包；请求-响应型协议必开，批量发送可关 |
| `TCP_CORK` | `IPPROTO_TCP` | `int`：`1`/`0` | 攒满 MSS 再发，与 `TCP_NODELAY` 互斥；适合"多次 write 拼一个响应" |
| `TCP_KEEPIDLE` | `IPPROTO_TCP` | `int` 秒：`60`、`300`、`7200`(默认) | 空闲多久开始探测 |
| `TCP_KEEPINTVL` | `IPPROTO_TCP` | `int` 秒：`10`、`75`(默认) | 探测间隔 |
| `TCP_KEEPCNT` | `IPPROTO_TCP` | `int`：`3`、`9`(默认) | 失败几次断开 |
| `TCP_MAXSEG` | `IPPROTO_TCP` | `int` 字节：`536`、`1460` | 仅 `connect` 前设置有效 |
| `TCP_QUICKACK` | `IPPROTO_TCP` | `int`：`1`/`0` | 立即 ACK，需每次重设 |
| `TCP_USER_TIMEOUT` | `IPPROTO_TCP` | `unsigned int` 毫秒：`30000` | 数据发出多久无确认就断开，比 `SO_SNDTIMEO` 更贴合 TCP |
| `TCP_DEFER_ACCEPT` | `IPPROTO_TCP` | `int` 秒：`1`–`30` | 有数据到达才唤醒 `accept`，减少空连接开销 |
| `TCP_FASTOPEN` | `IPPROTO_TCP` | `int` 队列长度 | TFO，需内核开启 |
### setsockopt / getsockopt

```c
int setsockopt(int sockfd, int level, int optname, const void *optval, socklen_t optlen);
int getsockopt(int sockfd, int level, int optname, void *optval, socklen_t *optlen);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `level` | `SOL_SOCKET` | 通用 socket 层选项 |
| | `IPPROTO_TCP` | TCP 选项 |
| | `IPPROTO_IP` | IP 层（TTL、TOS、分片） |
| | `IPPROTO_IPV6` | IPv6 层 |
| | `SOL_PACKET` / `SOL_NETLINK` | 对应协议族 |
| `optval` | `&int` | 开关类选项 |
| | `&struct timeval` | 超时类 |
| | `&struct linger` | `SO_LINGER` |
| | `char[]` 网卡名 | `SO_BINDTODEVICE` |
| `optlen` | `sizeof` 对应类型 | 不匹配时行为未定义或 `EINVAL` |
通用选项表：

| 选项 | level | 值类型与可填写的值 | 效果 |
| --- | --- | --- | --- |
| `SO_REUSEADDR` | `SOL_SOCKET` | `int`：`1`/`0` | 允许绑定 `TIME_WAIT` 端口，服务端必设 |
| `SO_REUSEPORT` | `SOL_SOCKET` | `int`：`1`/`0` | 多进程绑同一端口做内核级负载均衡，需同一 euid |
| `SO_KEEPALIVE` | `SOL_SOCKET` | `int`：`1`/`0` | 开启 TCP 保活 |
| `SO_LINGER` | `SOL_SOCKET` | `struct linger`：`{1, 0}` 关闭即发 RST 丢缓冲；`{1, 5}` 最多等 5 秒；`{0, 0}` 默认后台关闭 | 传 `{1,0}` 会丢未发数据并让对端看到 `ECONNRESET` |
| `SO_RCVBUF`/`SO_SNDBUF` | `SOL_SOCKET` | `int` 字节：`65536`、`4194304` | 内核翻倍并以 `rmem_max`/`wmem_max` 封顶 |
| `SO_RCVTIMEO`/`SO_SNDTIMEO` | `SOL_SOCKET` | `struct timeval`：`{5, 0}` 5 秒；`{0, 0}` 永不等 | 超时返回 `EAGAIN` |
| `SO_ERROR` | `SOL_SOCKET` | `int` 输出 | 读取并**清除**挂起错误，非阻塞 connect 用它 |
| `SO_BINDTODEVICE` | `SOL_SOCKET` | `char[]`：`"eth0"` + `strlen+1` | 绑网卡，需 root |
| `SO_BROADCAST` | `SOL_SOCKET` | `int`：`1` | 允许 UDP 广播 |
| `SO_PRIORITY` | `SOL_SOCKET` | `int`：`0`–`6` | 报文优先级 |
| `SO_TIMESTAMP` | `SOL_SOCKET` | `int`：`1` | 收包时间戳走 `SCM_TIMESTAMP` |
| `SO_PEERCRED` | `SOL_SOCKET` | `struct ucred` 输出 | Unix 域取对端 pid/uid/gid |
| `IP_TTL` | `IPPROTO_IP` | `int`：`64`、`255` | 生存时间 |
| `IP_TOS` | `IPPROTO_IP` | `int`：`0x10` 低延迟、`0x08` 高吞吐 | 服务类型 |
| `IP_PKTINFO` | `IPPROTO_IP` | `int`：`1` | 辅助数据取收包目的地址与网卡 |
| `IP_MTU_DISCOVER` | `IPPROTO_IP` | `int`：`IP_PMTUDISC_DO`(2) 禁分片 | 配合 UDP 探测路径 MTU |
| `IPV6_V6ONLY` | `IPPROTO_IPV6` | `int`：`1` 只收 v6，`0` 也收 v4 映射 | 双栈服务器按需设 |
### 非阻塞 connect 完整流程

```c
int fd = socket(AF_INET, SOCK_STREAM | SOCK_NONBLOCK | SOCK_CLOEXEC, 0);
int r = connect(fd, (struct sockaddr *)&addr, sizeof addr);
if (r < 0 && errno != EINPROGRESS) { /* 立即失败，如 ECONNREFUSED */ }

struct epoll_event ev = { .events = EPOLLOUT, .data.fd = fd };
epoll_ctl(epfd, EPOLL_CTL_ADD, fd, &ev);
/* epoll_wait 返回后： */
int err = 0; socklen_t len = sizeof err;
getsockopt(fd, SOL_SOCKET, SO_ERROR, &err, &len);
if (err != 0) { close(fd); errno = err; }
```
失败后**不要**重复 `connect` 同一个 fd，只能 `close` 重建。
### 用 sendmsg 传文件描述符

```c
/* 发送端：把一个 fd 塞进控制消息 */
int send_fd(int sock, int fd_to_send) {
    struct msghdr msg = {0};
    struct iovec io = { .iov_base = (void *)"", .iov_len = 1 };  /* 必须至少 1 字节 */
    char ctrl[CMSG_SPACE(sizeof(int))];
    msg.msg_iov = &io; msg.msg_iovlen = 1;
    msg.msg_control = ctrl; msg.msg_controllen = sizeof ctrl;

    struct cmsghdr *cm = CMSG_FIRSTHDR(&msg);
    cm->cmsg_level = SOL_SOCKET;
    cm->cmsg_type  = SCM_RIGHTS;      /* 还能填 SCM_CREDENTIALS */
    cm->cmsg_len   = CMSG_LEN(sizeof(int));
    memcpy(CMSG_DATA(cm), &fd_to_send, sizeof(int));
    return (int)sendmsg(sock, &msg, 0);
}
/* 接收端：CMSG_FIRSTHDR 遍历，fd 必须自己 close */
int recv_fd(int sock) {
    struct msghdr msg = {0};
    char buf[1]; struct iovec io = { .iov_base = buf, .iov_len = 1 };
    char ctrl[CMSG_SPACE(sizeof(int))];
    msg.msg_iov = &io; msg.msg_iovlen = 1;
    msg.msg_control = ctrl; msg.msg_controllen = sizeof ctrl;

    if (recvmsg(sock, &msg, MSG_CMSG_CLOEXEC) <= 0) return -1;
    struct cmsghdr *cm = CMSG_FIRSTHDR(&msg);
    if (!cm || cm->cmsg_level != SOL_SOCKET || cm->cmsg_type != SCM_RIGHTS) return -1;
    int fd; memcpy(&fd, CMSG_DATA(cm), sizeof fd);
    return fd;
}
```
`cmsg_type` 能填：`SCM_RIGHTS`（传 fd）、`SCM_CREDENTIALS`（传 pid/uid/gid）、`SCM_TIMESTAMP`（时间戳）。缓冲区用 `CMSG_SPACE` 分配、`CMSG_LEN` 填长度，不可混用。
### getaddrinfo

```c
int getaddrinfo(const char *node, const char *service,
                const struct addrinfo *hints, struct addrinfo **res);
void freeaddrinfo(struct addrinfo *res);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `node` | `"example.com"` | 走 DNS 解析 |
| | `"127.0.0.1"` / `"::1"` | 直接解析，不查 DNS |
| | `NULL` + `AI_PASSIVE` | 返回 `INADDR_ANY`/`in6addr_any`，用于服务端 bind |
| | `NULL` 无 `AI_PASSIVE` | 返回回环地址，用于客户端 |
| `service` | `"80"` / `"8080"` | 直接作为端口 |
| | `"http"` / `"https"` / `"ssh"` | 查 `/etc/services` |
| | `NULL` | 端口填 0 |
| `hints.ai_family` | `AF_UNSPEC` | v4 与 v6 都返回（推荐） |
| | `AF_INET` / `AF_INET6` | 只返回对应族 |
| `hints.ai_socktype` | `SOCK_STREAM` / `SOCK_DGRAM` | 决定返回的地址可用于哪种 socket |
| `hints.ai_flags` | `AI_PASSIVE` | 绑定场景 |
| | `AI_CANONNAME` | 回填规范主机名 |
| | `AI_NUMERICHOST` | 不做 DNS，只接受数字地址（快） |
| | `AI_ADDRCONFIG` | 只返回本机配置了地址的族 |
| | `AI_NUMERICSERV` | service 必须是数字 |
返回 0 或 `EAI_*`（`EAI_NONAME`、`EAI_AGAIN`、`EAI_FAIL`、`EAI_FAMILY`、`EAI_SYSTEM`），**不置 errno**（`EAI_SYSTEM` 除外），用 `gai_strerror` 翻译。

```c
struct addrinfo hints = {0}, *res, *p;
hints.ai_family = AF_UNSPEC;
hints.ai_socktype = SOCK_STREAM;
if (getaddrinfo("example.com", "80", &hints, &res) != 0) { /* 处理 */ }
int fd = -1;
for (p = res; p; p = p->ai_next) {
    fd = socket(p->ai_family, p->ai_socktype, p->ai_protocol);
    if (fd < 0) continue;
    if (connect(fd, p->ai_addr, p->ai_addrlen) == 0) break;
    close(fd); fd = -1;
}
freeaddrinfo(res);
```
### TCP 连接的状态与 fd 生命周期

| 阶段 | 内核行为 | 用户看到的 |
| --- | --- | --- |
| `listen` | 进入 `LISTEN`，维护两条队列 | `ss -lnt` 显示 `LISTEN` |
| 三次握手 | `SYN_RCVD` → `ESTABLISHED` 后入全连接队列 | 队列满时客户端握手卡住 |
| `accept` | 从队列取一个，返回新 fd | 新 fd 状态 `ESTABLISHED` |
| 对端 `close` | 本端收到 FIN，进入 `CLOSE_WAIT` | `read` 返回 0 |
| 本端 `close` | 发 FIN，`LAST_ACK` → `CLOSED` | fd 立即不可用 |
| 主动关闭方 | 最后进入 `TIME_WAIT`，持续 2MSL | 端口被占，需 `SO_REUSEADDR` |
> [!Warning] CLOSE_WAIT 堆积
> `CLOSE_WAIT` 数量增长说明代码收到 EOF 后没有 `close`，是 fd 泄漏最典型的症状。用 `ss -tan state close-wait | wc -l` 统计，再回到代码里找 `read == 0` 分支是否漏了 `close`。
## 进程控制
### 身份查询
头文件：`<unistd.h>`、`<sys/types.h>`。所有 `get*id` 都不可失败，无需判错。

| 接口 | 返回 | 能拿来干什么 |
| --- | --- | --- |
| `pid_t getpid(void)` | 进程号 | 写 pid 文件、打日志；同进程内所有线程相同 |
| `pid_t getppid(void)` | 父进程号 | 父进程退出后变成 1（或被 subreaper 收养） |
| `pid_t gettid(void)` | 线程号 | 内核调度实体 id，主线程等于 `getpid()`；`top -H`、`ps -L` 显示它 |
| `pid_t getpgrp(void)` | 进程组号 | 信号可以发给整个组 |
| `pid_t getpgid(pid_t pid)` | 指定进程组号 | `pid` 填 `0` 表示当前进程 |
| `pid_t getsid(pid_t pid)` | 会话号 | 守护进程化后会话号即首进程 pid |
| `uid_t getuid(void)` / `geteuid(void)` | 真实/有效用户 | 判权限用 `geteuid()`，setuid 程序两者不同 |
| `gid_t getgid(void)` / `getegid(void)` | 真实/有效组 | |
| `int getgroups(int size, gid_t list[])` | 附加组个数 | `size` 填 0 只返回数量；否则最多填 `size` 个 |
| `int setuid(uid_t uid)` | 0/-1 | `uid` 填 `0` 切 root（需 root），填 `getuid()` 降权（不可逆） |
| `int seteuid(uid_t uid)` | 0/-1 | 可逆切换有效用户 |
| `char *getcwd(char *buf, size_t size)` | buf 或 NULL | `size` 不足返回 `ERANGE`；`buf` 填 `NULL` 时由 glibc 分配（GNU 扩展） |
### fork

```c
#include <unistd.h>
pid_t fork(void);
```
无参数，靠返回值区分：

| 返回值 | 含义 | 该走哪条分支 |
| --- | --- | --- |
| `> 0` | 父进程，值为子进程 pid | 继续服务、记录子 pid |
| `0` | 子进程 | 干活，最后 `_exit` |
| `-1` | 失败，无子进程 | `EAGAIN`（`RLIMIT_NPROC` 到顶）、`ENOMEM`、`ENOSYS` |
继承与不继承：

| 类别 | 子进程继承 | 子进程独立 |
| --- | --- | --- |
| 地址空间 | 写时复制，初始内容相同 | 之后各自独立 |
| fd 表 | 复制 fd 表，**共享同一个 `struct file`**（偏移、状态标志共享） | `FD_CLOEXEC` 按 fd 复制 |
| 信号 | 处理函数、屏蔽集合、忽略状态 | 未决信号不继承 |
| 进程属性 | 用户/组、nice、cwd、`umask`、rlimit、调度策略、亲和性 | pid、ppid、CPU 时间统计、`alarm` 定时器 |
| 记录锁 | 不继承（锁属于进程） | |
| 内存映射 | `MAP_SHARED` 继续共享，`MAP_PRIVATE` 变 COW | |

```c
pid_t pid = fork();
if (pid < 0) { perror("fork"); return -1; }
if (pid == 0) {
    /* 子进程：继续执行 fork 之后的代码 */
    _exit(0);          /* 必须 _exit，见下文缓冲区陷阱 */
}
/* 父进程 */
```
> [!Warning] fork 的三个经典陷阱
> - **缓冲区重复输出**：`printf("x")` 写在 fork 之前且没有换行（行缓冲）或重定向到文件（全缓冲），缓冲区会被子进程复制并再输出一次。fork 前 `fflush(NULL)`，或子进程一律 `_exit`。
> - **多线程下 fork**：子进程只包含调用 fork 的那个线程，继承的锁可能永久处于加锁状态，任何 `malloc` 都可能死锁。子进程只能调用异步信号安全函数，直到 `execve`；需用 `pthread_atfork` 注册回调加解锁。
> - **COW 不便宜**：fork 后立即 `execve` 时页表复制是纯浪费，大内存进程用 `posix_spawn` 或 `vfork`+`execve`。
### vfork / clone / posix_spawn

| 接口 | 关键参数可填写的值 | 语义与适用 |
| --- | --- | --- |
| `pid_t vfork(void)` | 无 | 子进程**共享**父进程地址空间，父进程挂起；子进程必须立刻 `execve` 或 `_exit`，否则未定义 |
| `int clone(int (*fn)(void *), void *stack, int flags, void *arg, ...)` | `flags`：`CLONE_VM`、`CLONE_FILES`、`CLONE_FS`、`CLONE_THREAD`、`CLONE_NEWPID`/`NEWNET`/`NEWNS` | 组合控制共享哪些部分；实现线程与容器；`pthread_create` 底层就是它 |
| `int posix_spawn(pid_t *pid, const char *path, const posix_spawn_file_actions_t *fa, const posix_spawnattr_t *attr, char *const argv[], char *const envp[])` | `path` 绝对/相对路径；`fa` 可填重定向动作；`attr` 可设调度与信号 | libc 用 `vfork`+`execve` 优化实现，避免 fork 副作用；启动子程序优先用它 |
### execve 与 exec 家族

```c
#include <unistd.h>
int execve(const char *pathname, char *const argv[], char *const envp[]);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `pathname` | `"/bin/ls"` | ELF 可执行文件 |
| | `"/usr/bin/python3"` | 解释器本体 |
| | `"./script.sh"` | 脚本，首行 `#!/bin/bash` 由内核解析；无 shebang 返回 `ENOEXEC` |
| | 相对路径 | 相对 CWD，不搜 `PATH` |
| `argv` | `(char *const[]){ "ls", "-l", NULL }` | 必须以 `NULL` 结尾；`argv[0]` 惯例是程序名，可空但**不能是 NULL 指针**；总长受 `ARG_MAX`（约 2 MB）限制 |
| `envp` | `environ` | 继承当前环境 |
| | `(char *const[]){ "PATH=/bin", "LANG=C", NULL }` | 自定环境，`NULL` 结尾 |
| | `NULL` | 空环境，很多程序会行为异常 |
| | `{"KEY=VALUE"}` 缺 `=` | 该条被忽略或行为未定义 |
返回：**成功不返回**；失败 -1：`ENOENT`（文件或解释器不存在）、`EACCES`（无执行权限/目录无 `x`）、`ENOEXEC`（格式不认识）、`E2BIG`（参数+环境超限）、`EMFILE`/`ENFILE`、`ENOMEM`、`ELOOP`、`ETXTBSY`（文件正被写入）、`EISDIR`、`EPERM`（setuid 位或 capabilities 问题）。
家族命名规则：

| 函数 | 参数传递 | 搜 `PATH` | 环境 |
| --- | --- | --- | --- |
| `execve` | 数组 | 否 | 显式 `envp` |
| `execv` | 数组 | 否 | 继承 `environ` |
| `execvp` | 数组 | 是 | 继承 |
| `execvpe` | 数组 | 是 | 显式 |
| `execl` / `execlp` | 变参 | `p` 版搜索 | 继承 |
| `execle` | 变参 | 否 | 显式（环境指针放最后） |

```c
pid_t pid = fork();
if (pid == 0) {
    execlp("ls", "ls", "-l", "/tmp", (char *)NULL);
    perror("execlp");
    _exit(127);                 /* 127 是 shell 约定的"命令找不到" */
}
int status;
waitpid(pid, &status, 0);
if (WIFEXITED(status)) printf("exit=%d\n", WEXITSTATUS(status));
```
内核视角：`execve` 替换 `mm_struct`、重新加载堆栈与参数区、信号处理函数复位为默认（被忽略的继续保持忽略）、保留 fd 表但关闭带 `FD_CLOEXEC` 的 fd、保留 pid 与父子关系。
### wait / waitpid / waitid

```c
#include <sys/wait.h>
pid_t wait(int *wstatus);
pid_t waitpid(pid_t pid, int *wstatus, int options);
int waitid(idtype_t idtype, id_t id, siginfo_t *infop, int options);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `pid` | `> 0`（如 `child`） | 等该子进程 |
| | `-1` | 等任意子进程（等同 `wait`） |
| | `0` | 等与调用者同进程组的任意子进程 |
| | `< -1`（如 `-pgid`） | 等进程组号为 `-pid` 的任意子进程 |
| `wstatus` | `&status` | 内核写状态，必须用宏解析 |
| | `NULL` | 不关心状态 |
| `options` | `0` | 阻塞直到有子进程状态变化 |
| | `WNOHANG` | 没有已退出子进程立即返回 0 |
| | `WUNTRACED` | 也报告被 `SIGSTOP` 停止的子进程 |
| | `WCONTINUED` | 也报告被 `SIGCONT` 恢复的子进程 |
| | `WNOHANG|WUNTRACED` | 常用组合，做非阻塞巡检 |
返回：子进程 pid；`WNOHANG` 且无结果时 0；-1 失败（`ECHILD` 无此子进程、`EINTR`、`EINVAL`）。
状态宏：

| 宏 | 读出的信息 | 取值解释 |
| --- | --- | --- |
| `WIFEXITED(st)` + `WEXITSTATUS(st)` | 是否正常退出、退出码 | 退出码只取低 8 位（`exit(-1)` → 255） |
| `WIFSIGNALED(st)` + `WTERMSIG(st)` | 是否被信号杀死、哪个信号 | `WCOREDUMP(st)` 判断是否产生 core |
| `WIFSTOPPED(st)` + `WSTOPSIG(st)` | 是否被停止、哪个信号 | 需 `WUNTRACED` |
| `WIFCONTINUED(st)` | 是否被恢复 | 需 `WCONTINUED` |
> [!Warning] 僵尸进程与 SIGCHLD
> 子进程先于父进程退出而未 `wait`，会留下僵尸（`ps` 显示 `Z`）。处理方式：循环 `waitpid(-1, &st, WNOHANG)`；不关心子进程时 `signal(SIGCHLD, SIG_IGN)`（内核自动回收但丢退出状态）；`SIGCHLD` 处理函数里必须 `while` 循环回收，因为信号不排队。`SA_NOCLDWAIT` 同样自动回收。
### exit / _exit / atexit / abort

| 接口 | 头文件 | 参数可填写的值 | 行为 |
| --- | --- | --- | --- |
| `void exit(int status)` | `<stdlib.h>` | `0` 成功、`1` 通用错误、`2` 用法错误、`EXIT_SUCCESS`/`EXIT_FAILURE` | 执行 `atexit` 回调、冲刷 stdio、删临时文件，再 `_exit` |
| `void _exit(int status)` | `<unistd.h>` | 同上 | 直接系统调用，不冲刷缓冲区、不跑回调 |
| `void _Exit(int status)` | `<stdlib.h>` | 同上 | C99 等价物 |
| `int atexit(void (*f)(void))` | `<stdlib.h>` | 无参函数指针 | 注册回调，后进先出，最多 `ATEXIT_MAX` 个 |
| `void abort(void)` | `<stdlib.h>` | 无 | 解除 `SIGABRT` 阻塞并恢复默认，再 `raise(SIGABRT)`，可能产生 core |
退出码约定：0 成功；1 通用错误；2 用法错误；126 不可执行；127 命令未找到；128+n 被信号 n 杀死（shell 约定）。返回值只保留低 8 位。
### 信号：kill / raise / sigqueue / tgkill

```c
#include <signal.h>
int kill(pid_t pid, int sig);
int raise(int sig);
int sigqueue(pid_t pid, int sig, const union sigval value);
int tgkill(pid_t tgid, pid_t tid, int sig);
int pthread_kill(pthread_t thread, int sig);
int pthread_sigmask(int how, const sigset_t *set, sigset_t *oldset);
```
`kill` 的 `pid` 能填什么：

| 值 | 发给谁 | 典型用途 |
| --- | --- | --- |
| `> 0` 具体 pid | 该进程 | `kill(1234, SIGTERM)` |
| `0` | 与调用者同进程组的所有进程 | 组内广播 |
| `-1` | 所有有权限发的进程（init 除外） | 关机脚本；**极其危险** |
| `< -1`（如 `-1234`） | 进程组 1234 的所有进程 | 杀整个工作组 |
`sig` 能填什么：

| 值 | 效果 |
| --- | --- |
| `0` | 不发送信号，只检查存在性与权限（存活探测） |
| `SIGTERM`(15) | 请求退出，可捕获 |
| `SIGKILL`(9) | 强制杀，不可捕获不可阻塞 |
| `SIGINT`(2) | 等价 Ctrl-C |
| `SIGHUP`(1) | 终端断开；守护进程常用来重载配置 |
| `SIGUSR1`(10) / `SIGUSR2`(12) | 自定义用途 |
| `SIGSTOP`(19) / `SIGCONT`(18) | 暂停/恢复，`SIGSTOP` 不可捕获 |
| `SIGCHLD`(17) | 子进程状态变化 |
| `SIGRTMIN`…`SIGRTMAX`(34–64) | 实时信号，排队且可携带数据 |
| 其他数值 | `EINVAL` |
errno：`EINVAL`（非法信号）、`EPERM`（权限不足）、`ESRCH`（目标不存在；僵尸进程仍算存在）。
`sigqueue` 的 `value` 是 `union sigval`，可填 `.sival_int = 42` 或 `.sival_ptr = ptr`，随信号带到对端的 `SA_SIGINFO` 处理函数里。
### sigaction 与信号屏蔽

```c
#include <signal.h>
int sigaction(int signum, const struct sigaction *act, struct sigaction *oldact);
int sigprocmask(int how, const sigset_t *set, sigset_t *oldset);
int sigemptyset(sigset_t *set); int sigfillset(sigset_t *set);
int sigaddset(sigset_t *set, int signum); int sigdelset(sigset_t *set, int signum);
int sigismember(const sigset_t *set, int signum);
```
`struct sigaction` 各字段能填什么：

| 字段 | 可填写的值 | 效果 |
| --- | --- | --- |
| `sa_handler` | `SIG_DFL` | 恢复默认行为 |
| | `SIG_IGN` | 忽略该信号（`SIGKILL`/`SIGSTOP` 除外） |
| | 自定义函数 `void f(int)` | 捕获，处理函数里不能 `printf`/`malloc`/加锁 |
| `sa_sigaction` | `void f(int, siginfo_t *, void *)` | 需同时设 `SA_SIGINFO`，可读 `si_pid`、`si_code` |
| `sa_mask` | `sigemptyset` 后的集合 | 处理期间额外屏蔽的信号 |
| `sa_flags` | `0` | 默认语义 |
| | `SA_RESTART` | 被中断的系统调用自动重启 |
| | `SA_SIGINFO` | 使用三参数处理函数 |
| | `SA_NODEFER` | 处理期间不自动屏蔽本信号（可重入，慎用） |
| | `SA_RESETHAND` | 处理一次后恢复默认 |
| | `SA_ONSTACK` | 使用 `sigaltstack` 提供的备用栈 |
| | `SA_NOCLDSTOP` | 子进程停止时不发 `SIGCHLD` |
| | `SA_NOCLDWAIT` | 子进程退出不产生僵尸 |
`sigprocmask` 的 `how`：`SIG_BLOCK`（并入）、`SIG_UNBLOCK`（移除）、`SIG_SETMASK`（替换）。多线程用 `pthread_sigmask`。

```c
/* 优雅退出的标准骨架：信号只置标志，主循环轮询 */
static volatile sig_atomic_t g_stop = 0;
static void on_term(int sig) { (void)sig; g_stop = 1; }

struct sigaction sa = {0};
sa.sa_handler = on_term;
sigemptyset(&sa.sa_mask);
sa.sa_flags = SA_RESTART;
sigaction(SIGTERM, &sa, NULL);
sigaction(SIGINT,  &sa, NULL);
signal(SIGPIPE, SIG_IGN);

while (!g_stop) { /* 主循环：epoll_wait 用 100~500ms 超时 */ }
```
### 命令行进程管理

| 命令 | 常用参数与可填写的值 | 作用 |
| --- | --- | --- |
| `ps aux` | `-o pid,ppid,stat,etime,cmd` 自选列；`--forest` | 快照列出进程 |
| `ps -L -p <pid>` | `-o lwp,tid,psr,stat` | 列出线程与绑核 |
| `top` | `-H` 显示线程、`-p <pid>` 只看某进程、交互按 `1` 展开每核 | 动态监控 |
| `pgrep <模式>` | `-f` 匹配完整命令行、`-u user`、`-a` 打印命令行、`-x` 精确匹配 | 找 pid |
| `pkill <模式>` | 默认 `SIGTERM`；`-9`；`-f`；`-P <ppid>`；`-u user`；`-n` 最新、`-o` 最老 | 按模式杀进程 |
| `killall <名字>` | `-s SIGUSR1`、`-w` 等待、`-r` 正则 | 按精确进程名杀 |
| `kill -SIGNAL <pid>` | `kill -l` 列信号；`kill -0 <pid>` 只探测；`kill -TERM -- -1234` 杀进程组 | 发信号 |
| `pstree -p` | `-u` 显示用户 | 进程树 |
| `ss` | `-lntp`、`-tanp`、`state close-wait`、`-s` 汇总 | socket 状态 |
| `lsof` | `-p <pid>`、`-i :8080`、`-u user` | 打开的文件与端口 |
| `strace` | `-p <pid>`、`-f`、`-tt`、`-T`、`-y`、`-e trace=network,desc` | 跟踪系统调用 |
信号选择：先 `SIGTERM` 让程序清理，超时再用 `SIGKILL`。`SIGKILL` 不给进程任何机会，缓冲区、临时文件、共享内存都会留下脏状态。
### 守护进程化

```c
#include <unistd.h>
int daemon(int nochdir, int noclose);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `nochdir` | `0` | 切换到 `/`，避免占用挂载点 |
| | `1` | 保持当前目录（相对路径仍可用，但会阻止卸载该分区） |
| `noclose` | `0` | 把 0/1/2 重定向到 `/dev/null` |
| | `1` | 保留原标准流（调试时用，但会占着终端） |
手工步骤：`fork` → 父 `_exit` → `setsid` → 再 `fork` 并退出 → `chdir("/")` → `umask(0)` → 重定向 0/1/2 → 写 pid 文件并 `flock`。`setsid` 在调用者已是组长时返回 `EPERM`，这正是要先 `fork` 的原因。
### 资源限制

```c
#include <sys/resource.h>
#include <sys/types.h>

int getrlimit(int resource, struct rlimit *rlim);
int setrlimit(int resource, const struct rlimit *rlim);
int prlimit(pid_t pid, int resource, const struct rlimit *new_limit, struct rlimit *old_limit);
```
`struct rlimit` 两个字段：`rlim_cur`（软限制，生效值）、`rlim_max`（硬限制）；填 `RLIM_INFINITY` 表示无限制。

| resource 可填写的值 | 含义 | 典型数值 |
| --- | --- | --- |
| `RLIMIT_NOFILE` | 单进程最大 fd | `1024` 软 / `1048576` 硬 |
| `RLIMIT_NPROC` | 该用户进程/线程数 | 影响 `fork` 返回 `EAGAIN` |
| `RLIMIT_CORE` | core 文件大小 | `0` 不产生 core，`RLIM_INFINITY` 无限 |
| `RLIMIT_STACK` | 主线程栈 | `8388608`（8 MB） |
| `RLIMIT_AS` | 虚拟地址空间 | `RLIM_INFINITY` 或具体字节数 |
| `RLIMIT_DATA` | 堆上限 | 4.7 后也计入匿名 `mmap` |
| `RLIMIT_CPU` | CPU 秒数 | 超出发 `SIGXCPU`，再超发 `SIGKILL` |
| `RLIMIT_FSIZE` | 单文件最大字节 | 超出发 `SIGXFSZ` |
| `RLIMIT_MEMLOCK` | 可锁内存 | `mlock`、`io_uring` 需要 |
| `RLIMIT_MSGQUEUE` / `RLIMIT_SIGPENDING` | POSIX 消息队列、未决信号 | |

```c
struct rlimit rl = { .rlim_cur = 65535, .rlim_max = 65535 };
setrlimit(RLIMIT_NOFILE, &rl);        /* 普通用户只能升到硬限制以内，超了返回 EPERM */
```
### 调度与亲和性

```c
#include <sched.h>
#include <sys/types.h>
#include <sys/resource.h>

int sched_setscheduler(pid_t pid, int policy, const struct sched_param *param);
int sched_setaffinity(pid_t pid, size_t cpusetsize, const cpu_set_t *mask);
int setpriority(int which, id_t who, int prio);
int nice(int inc);
```

| policy 可填写的值 | 说明 | 权限 |
| --- | --- | --- |
| `SCHED_OTHER` | 默认 CFS，按 nice（-20…19）分权重 | 任意 |
| `SCHED_BATCH` | 批处理，减少唤醒抢占 | 任意 |
| `SCHED_IDLE` | 只在空闲核跑 | 任意 |
| `SCHED_FIFO` | 实时，同优先级先来先跑 | `CAP_SYS_NICE` 或 `RLIMIT_RTPRIO` |
| `SCHED_RR` | 实时，时间片轮转 | 同上 |
| `SCHED_DEADLINE` | EDF，需 `sched_attr` 的 runtime/deadline/period | 需配置 |
| `param.sched_priority` | `SCHED_OTHER` 填 `0`；实时填 `1`–`99` | 超出范围 `EINVAL` |
| `sched_setaffinity` 的 `mask` | `CPU_ZERO`+`CPU_SET(3, &mask)` 绑 3 号核；`CPU_SET(0..n)` 绑多核 | 线程用 `pthread_setaffinity_np` |
| `setpriority` 的 `which` | `PRIO_PROCESS`、`PRIO_PGRP`、`PRIO_USER` | `who` 填 `0` 表示调用者 |
| `setpriority` 的 `prio` | `-20` 最高到 `19` 最低 | 调低需 `CAP_SYS_NICE` |
### prctl

```c
#include <sys/prctl.h>
/* glibc 声明为可变参：int prctl(int option, ...); 内核按 option 解释 2–5 号参数 */
```

| option | `arg2` 可填写的值 | 效果 |
| --- | --- | --- |
| `PR_SET_NAME` | `char *` 名字，仅前 15 字节生效 | `top`、`ps -L`、`/proc/<pid>/task/<tid>/comm` 可见 |
| `PR_GET_NAME` | `char buf[16]` | 取回线程名 |
| `PR_SET_PDEATHSIG` | 信号值：`SIGKILL`、`SIGTERM`、`0` 取消 | 父进程死亡时给自己发该信号 |
| `PR_SET_DUMPABLE` | `0`/`1` | 是否允许 ptrace 与 core |
| `PR_SET_NO_NEW_PRIVS` | `1` | 禁止 exec 提权，容器与沙箱必需 |
| `PR_SET_CHILD_SUBREAPER` | `1`/`0` | 成为孤儿进程的收养者 |
| `PR_SET_SECCOMP` | `SECCOMP_MODE_FILTER` + BPF 程序 | 系统调用过滤 |
| `PR_SET_TIMERSLACK` | 纳秒，如 `50000` | 定时器松弛，省电 |
| `PR_SET_MM` | 内存布局修改 | 需 `CAP_SYS_RESOURCE` |
## 线程与同步
pthread API 的错误码直接作为返回值，不设置 errno（返回 0 才算成功）。
### pthread_create / join / detach

```c
#include <pthread.h>
int pthread_create(pthread_t *thread, const pthread_attr_t *attr,
                   void *(*start_routine)(void *), void *arg);
int pthread_join(pthread_t thread, void **retval);
int pthread_detach(pthread_t thread);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `attr` | `NULL` | 默认属性：可 join、8 MB 栈、`SCHED_OTHER` |
| | 已初始化的 `pthread_attr_t *` | 自定义栈大小、分离状态、调度策略 |
| `arg` | `NULL` | 无参数 |
| | `&struct` / `malloc` 指针 | 唯一参数；注意生命周期，别传栈上临时变量地址 |
| | 通过 `(void *)(intptr_t)fd` | 传小整数（注意 32/64 位差异） |
| `retval`（join） | `NULL` | 不关心返回值 |
| | `&ptr` | 接收线程 `return` 的值 |
| `thread`（detach） | `pthread_self()` 或 create 返回的句柄 | 线程结束自动回收资源 |
线程属性设置函数与可填的值：

| 属性 | 设置函数与可填写的值 | 效果 |
| --- | --- | --- |
| 分离状态 | `PTHREAD_CREATE_JOINABLE`（默认） | 必须 `join`，否则资源泄漏 |
| | `PTHREAD_CREATE_DETACHED` | 退出自动回收，不能 join |
| 栈大小 | `pthread_attr_setstacksize(&a, 256*1024)` | 最小 `PTHREAD_STACK_MIN`（通常 16 KB）；默认取 `ulimit -s` |
| 栈地址 | `pthread_attr_setstack(&a, buf, size)` | 自管理栈，缓冲区要自己对齐与释放 |
| 调度策略 | `pthread_attr_setschedpolicy(&a, SCHED_FIFO)` | 需配 `PTHREAD_EXPLICIT_SCHED` 才生效 |
| 调度参数 | `pthread_attr_setschedparam(&a, &(struct sched_param){.sched_priority=10})` | 实时优先级 1–99 |
| 继承调度 | `PTHREAD_INHERIT_SCHED`（默认）/ `PTHREAD_EXPLICIT_SCHED` | 默认继承创建者策略，会覆盖上面两项 |
| 保护页 | `pthread_attr_setguardsize(&a, 4096)`；填 `0` 关闭 | 栈溢出保护页大小 |
错误码：`EAGAIN`（线程数超 `RLIMIT_NPROC` 或内存不足）、`EINVAL`、`EPERM`（无权限设实时策略）；`pthread_join` 的 `EINVAL` 表示目标已 detached 或已有线程在 join，`ESRCH` 表示不存在，`EDEADLK` 表示自己 join 自己。

```c
typedef struct { int fd; char peer[64]; } job_t;

static void *worker(void *p) {
    job_t *job = p;
    /* ... 处理 ... */
    free(job);              /* 约定：worker 接管所有权 */
    return NULL;
}
pthread_t t;
job_t *job = malloc(sizeof *job);
if (pthread_create(&t, NULL, worker, job) != 0) { free(job); }
pthread_detach(t);          /* 不关心返回值的线程必须 detach */
```
### pthread_mutex

```c
int pthread_mutex_init(pthread_mutex_t *mutex, const pthread_mutexattr_t *attr);
int pthread_mutex_lock(pthread_mutex_t *mutex);
int pthread_mutex_trylock(pthread_mutex_t *mutex);
int pthread_mutex_timedlock(pthread_mutex_t *mutex, const struct timespec *abstime);
int pthread_mutex_unlock(pthread_mutex_t *mutex);
```

| attr 属性 | 可填写的值 | 效果 |
| --- | --- | --- |
| 类型 | `PTHREAD_MUTEX_NORMAL` | 默认；同线程重复加锁死锁，解锁他人锁未定义 |
| | `PTHREAD_MUTEX_ERRORCHECK` | 重复加锁返回 `EDEADLK`，调试用 |
| | `PTHREAD_MUTEX_RECURSIVE` | 同线程可重入，解锁次数必须与加锁相同 |
| | `PTHREAD_MUTEX_ADAPTIVE_NP` | 先自旋再加锁，适合极短临界区 |
| 协议 | `PTHREAD_PRIO_NONE` | 默认 |
| | `PTHREAD_PRIO_INHERIT` | 优先级继承，防优先级反转 |
| | `PTHREAD_PRIO_PROTECT` | 优先级天花板 |
| 健壮性 | `PTHREAD_MUTEX_STALLED`（默认）/ `PTHREAD_MUTEX_ROBUST` | 持有者线程死亡后，其他线程拿到 `EOWNERDEAD` 并可接管 |
| 进程共享 | `PTHREAD_PROCESS_PRIVATE`（默认）/ `PTHREAD_PROCESS_SHARED` | 后者可放在共享内存供多进程使用 |
`attr` 传 `NULL` 等价 `PTHREAD_MUTEX_NORMAL` + `PRIVATE`；静态初始化可直接用 `PTHREAD_MUTEX_INITIALIZER`。
`pthread_mutex_timedlock` 的 `abstime` 是**绝对时间**（`CLOCK_REALTIME`），需先 `clock_gettime` 再加偏移。
### pthread_cond

```c
int pthread_cond_init(pthread_cond_t *cond, const pthread_condattr_t *attr);
int pthread_cond_wait(pthread_cond_t *cond, pthread_mutex_t *mutex);
int pthread_cond_timedwait(pthread_cond_t *cond, pthread_mutex_t *mutex,
                           const struct timespec *abstime);
int pthread_cond_signal(pthread_cond_t *cond);
int pthread_cond_broadcast(pthread_cond_t *cond);
```

| 参数/属性 | 可填写的值 | 效果 |
| --- | --- | --- |
| `attr` | `NULL` | 默认 `CLOCK_REALTIME`、进程私有 |
| | `pthread_condattr_setclock(&a, CLOCK_MONOTONIC)` | 超时基准改为单调钟，抗系统调时 |
| | `pthread_condattr_setpshared(&a, PTHREAD_PROCESS_SHARED)` | 跨进程使用 |
| `abstime` | `CLOCK_REALTIME` 的绝对时刻 | 超时返回 `ETIMEDOUT` |
| `signal` vs `broadcast` | `signal` 唤醒一个；`broadcast` 唤醒全部 | 有多个等待条件时用 broadcast |
`pthread_cond_wait` 原子地：释放 mutex → 睡眠 → 唤醒后重新加锁。因此等待条件必须用 `while` 而不是 `if`。

```c
pthread_mutex_lock(&mu);
while (q->count == Q_CAP) pthread_cond_wait(&not_full, &mu);
q->items[q->tail++] = item; q->count++;
pthread_cond_signal(&not_empty);
pthread_mutex_unlock(&mu);
```
### 读写锁、自旋锁、屏障

| 接口 | 关键参数可填写的值 | 语义与适用 |
| --- | --- | --- |
| `pthread_rwlock_rdlock` / `wrlock` / `unlock` | `rdlock` 共享、`wrlock` 独占 | 读多写少；写者可能饿死，取决于实现 |
| `pthread_rwlock_tryrdlock` | 无阻塞版本 | 冲突返回 `EBUSY` |
| `pthread_spin_lock` / `trylock` / `unlock` | 临界区必须极短 | 忙等；持有期间禁止系统调用与睡眠 |
| `pthread_barrier_wait` | `pthread_barrier_init(&b, NULL, 4)` 的 count | 等够 N 个线程一起放行 |
| `pthread_once(pthread_once_t *, void (*)(void))` | 静态 `PTHREAD_ONCE_INIT` | 只执行一次，替代双重检查锁 |
| `pthread_key_create` / `setspecific` / `getspecific` | key 与任意指针 | 线程局部存储；C11 `_Thread_local` 的底层 |
| `sem_init(&s, 0, 5)` / `sem_wait` / `sem_post` | `pshared` 填 `0` 进程内、`1` 跨进程；初值任意非负 | 计数型资源 |
| `pthread_setname_np(t, "worker-1")` | 名字最长 15 字节 | 调试时 `top -H`、`gdb info threads` 可见 |
| `pthread_getattr_np` + `pthread_attr_getstack` | 输出栈范围 | 打印栈回溯时定位栈边界 |
## IO 多路复用
模型演进与内核实现见 [[IO复用模型]]，此处只列签名、参数取值与调用契约。
### select / pselect

```c
#include <sys/select.h>
int select(int nfds, fd_set *readfds, fd_set *writefds, fd_set *exceptfds,
           struct timeval *timeout);
int pselect(int nfds, fd_set *readfds, fd_set *writefds, fd_set *exceptfds,
            const struct timespec *timeout, const sigset_t *sigmask);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `nfds` | `max_fd + 1` | 三个集合中最大 fd 加一；填 0 且 timeout 有效可用于纯睡眠 |
| | 超过 `FD_SETSIZE`（1024） | 越界写内存，未定义行为 |
| `readfds` | `&set`（`FD_ZERO` + `FD_SET` 后） | 关心可读 |
| | `NULL` | 不关心可读 |
| `writefds` / `exceptfds` | 同上 / `NULL` | 可写 / 异常（OOB、部分错误） |
| `timeout` | `NULL` | 永久阻塞 |
| | `&(struct timeval){0, 0}` | 立即返回，轮询 |
| | `&(struct timeval){5, 0}` | 最多等 5 秒；返回后被改写为剩余时间 |
| `sigmask`（pselect） | `&mask` / `NULL` | 等待期间原子替换信号屏蔽字，避免丢信号 |
返回就绪 fd 总数（同一 fd 在多个集合只算一次），0 超时，-1 失败（`EINTR`、`EBADF`、`EINVAL`）。三个集合都是入参兼出参，每次调用前必须重建。
### poll / ppoll

```c
#include <poll.h>

int poll(struct pollfd *fds, nfds_t nfds, int timeout);
/* struct pollfd { int fd; short events; short revents; }; 由 <poll.h> 提供 */
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `fds[i].fd` | `>= 0` | 要监控的 fd |
| | `-1` 或任意负值 | 忽略该元素，`revents` 置 0（可用来"删除"元素而不挪动数组） |
| `nfds` | 实际元素个数 | 不是 max+1；填 0 且 timeout 有效可用于睡眠 |
| `timeout` | `-1` | 永久阻塞 |
| | `0` | 立即返回 |
| | 正整数 | 毫秒 |
| `events` | `POLLIN` | 可读 |
| | `POLLOUT` | 可写 |
| | `POLLPRI` | 紧急数据 |
| | `POLLRDHUP` | 对端关闭写（需 `_GNU_SOURCE`） |
| | `POLLIN|POLLOUT` | 按位或，同时关心 |
| `revents` | 输出 | 上述事件 + `POLLERR`、`POLLHUP`、`POLLNVAL`（fd 未打开） |
返回就绪个数，0 超时，-1 失败。`ppoll` 用 `struct timespec` 纳秒超时且有 `sigmask` 参数做原子屏蔽替换。
### epoll

```c
#include <sys/epoll.h>
int epoll_create(int size);
int epoll_create1(int flags);
int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `size`（create） | 任意正数 | 2.6.8 起被忽略，只为兼容 |
| `flags`（create1） | `0` 或 `EPOLL_CLOEXEC` | `CLOEXEC` 避免 exec 泄漏 |
| `op` | `EPOLL_CTL_ADD` | 注册 fd；重复注册 `EEXIST` |
| | `EPOLL_CTL_MOD` | 修改事件；未注册 `ENOENT` |
| | `EPOLL_CTL_DEL` | 删除，`event` 可传 `NULL` |
| `fd` | 非 epoll 自身的 fd | 普通文件返回 `EPERM` |
| `maxevents` | `> 0`，如 `1024` | 一次最多返回多少事件；`<= 0` 返回 `EINVAL` |
| `timeout` | `-1` / `0` / 毫秒 | 永久阻塞 / 立即返回 / 最多等 |
`event.events` 能填什么：

| 事件 | 方向 | 含义 |
| --- | --- | --- |
| `EPOLLIN` | 监听 | 可读（对端关闭时也能收到，`read` 返回 0） |
| `EPOLLOUT` | 监听 | 可写 |
| `EPOLLPRI` | 监听 | 带外数据 |
| `EPOLLRDHUP` | 监听 | 对端关闭写方向（2.6.17+） |
| `EPOLLET` | 行为 | 边缘触发，只在状态跳变时通知一次 |
| `EPOLLONESHOT` | 行为 | 触发一次后失效，需 `MOD` 重新武装 |
| `EPOLLEXCLUSIVE` | 行为 | 仅 `ADD`/`MOD` 有效，唤醒排队者中的一个（4.5+） |
| `EPOLLWAKEUP` | 行为 | 事件处理期间阻止休眠 |
| `EPOLLERR` / `EPOLLHUP` | 只上报 | 无需注册也会被通知 |
| `event.data` | `.data.fd = fd` 或 `.data.ptr = 指针` | 随事件返回，用于定位连接对象 |
LT 与 ET 的读写要求：

| 模式 | 通知条件 | 读写法 | 风险 |
| --- | --- | --- | --- |
| LT（不填 `EPOLLET`） | 缓冲区有数据就一直通知 | 可以只读一部分 | 忘记处理会忙循环 |
| ET（填 `EPOLLET`） | 只在"无 → 有"跳变通知 | 必须循环读到 `EAGAIN`，写要一次写完 | 漏读会永久停摆；必须先设非阻塞 |

```c
int epfd = epoll_create1(EPOLL_CLOEXEC);
struct epoll_event ev = { .events = EPOLLIN, .data.fd = listenfd };
epoll_ctl(epfd, EPOLL_CTL_ADD, listenfd, &ev);

struct epoll_event events[1024];
for (;;) {
    int n = epoll_wait(epfd, events, 1024, 1000);
    if (n < 0) { if (errno == EINTR) continue; break; }
    for (int i = 0; i < n; ++i) {
        int fd = events[i].data.fd;
        if (fd == listenfd) { /* accept 循环，直到 EAGAIN */ }
        else { /* 读写；read 返回 0 时 close 并 DEL */ }
    }
}
```
errno：`EINVAL`、`EBADF`、`EFAULT`、`EEXIST`、`ENOENT`、`EPERM`（fd 不支持 epoll）、`ENOMEM`（`/proc/sys/fs/epoll/max_user_watches` 到顶）。
### eventfd / timerfd / signalfd

```c
int eventfd(unsigned int initval, int flags);
int timerfd_create(int clockid, int flags);
int timerfd_settime(int fd, int flags, const struct itimerspec *new_value,
                    struct itimerspec *old_value);
int signalfd(int fd, const sigset_t *mask, int flags);
```

| 接口/参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `eventfd` 的 `initval` | 任意 `unsigned int` | 初始计数 |
| `eventfd` 的 `flags` | `0` | 阻塞、无 `CLOEXEC` |
| | `EFD_NONBLOCK` / `EFD_CLOEXEC` | 非阻塞 / exec 关闭 |
| | `EFD_SEMAPHORE` | `read` 每次减 1 而不是清零 |
| `read(eventfd)` | `uint64_t` | 读到累积值（`SEMAPHORE` 时为 1），普通模式读完清零 |
| `write(eventfd)` | `uint64_t` 值 | 累加；超过 `UINT64_MAX-1` 返回 `EAGAIN` |
| `timerfd_create` 的 `clockid` | `CLOCK_MONOTONIC` / `CLOCK_REALTIME` / `CLOCK_BOOTTIME` | 定时基准 |
| `timerfd_create` 的 `flags` | `TFD_NONBLOCK` / `TFD_CLOEXEC` | |
| `timerfd_settime` 的 `flags` | `0` | `it_value` 是相对时长 |
| | `TFD_TIMER_ABSTIME` | `it_value` 是绝对时刻 |
| `itimerspec.it_value` | `{0,0}` 关闭定时器；`{1,0}` 1 秒后首次到期 | 首次触发时刻 |
| `itimerspec.it_interval` | `{0,0}` 只触发一次；`{1,0}` 每秒 | 周期 |
| `signalfd` 的 `fd` | `-1` 新建；已有 signalfd 则修改屏蔽集 | |
| `signalfd` 的 `flags` | `SFD_NONBLOCK` / `SFD_CLOEXEC` | |
`mask` 中的信号必须先用 `pthread_sigmask`/`sigprocmask` 阻塞，否则走默认处理。

```c
sigset_t mask; sigemptyset(&mask);
sigaddset(&mask, SIGTERM); sigaddset(&mask, SIGINT);
pthread_sigmask(SIG_BLOCK, &mask, NULL);
int sfd = signalfd(-1, &mask, SFD_NONBLOCK | SFD_CLOEXEC);

int tfd = timerfd_create(CLOCK_MONOTONIC, TFD_NONBLOCK | TFD_CLOEXEC);
struct itimerspec its = {
    .it_value    = { .tv_sec = 1, .tv_nsec = 0 },
    .it_interval = { .tv_sec = 1, .tv_nsec = 0 },
};
timerfd_settime(tfd, 0, &its, NULL);
/* epoll 收 EPOLLIN 后必须 read，否则 LT 一直触发 */
uint64_t expirations;
read(tfd, &expirations, sizeof expirations);
```
### io_uring 速览

```c
int io_uring_setup(unsigned entries, struct io_uring_params *p);
int io_uring_enter(int fd, unsigned to_submit, unsigned min_complete, unsigned flags, sigset_t *sig);
int io_uring_register(int fd, unsigned opcode, void *arg, unsigned nr_args);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `entries` | 2 的幂：`64`、`256`、`1024` | 队列深度 |
| `p.flags` | `IORING_SETUP_SQPOLL` | 内核线程轮询，免系统调用 |
| | `IORING_SETUP_IOPOLL` | 配合 `O_DIRECT` 轮询设备 |
| | `IORING_SETUP_SINGLE_ISSUER` | 单提交者优化 |
| `io_uring_enter` 的 `flags` | `IORING_ENTER_GETEVENTS` | 提交并等待完成 |
| `opcode`（register） | `IORING_REGISTER_FILES`、`IORING_REGISTER_BUFFERS` | 预注册 fd/缓冲区，减少每次开销 |
实际操作建议用 `liburing` 的 `io_uring_queue_init`/`io_uring_submit` 封装，手工操作 SQ/CQ 需处理内存屏障。需要 5.1+ 内核。
## 终端与串口
终端与串口共用 termios，差异只是设备是伪终端（`/dev/pts/N`）还是 UART（`/dev/ttyS0`、`/dev/ttyUSB0`）。串口头号坑是默认行规程会加工数据，必须切原始模式。
### tcgetattr / tcsetattr

```c
#include <termios.h>
int tcgetattr(int fd, struct termios *termios_p);
int tcsetattr(int fd, int optional_actions, const struct termios *termios_p);
```
`optional_actions` 能填什么：

| 值 | 生效时机 | 什么时候用 |
| --- | --- | --- |
| `TCSANOW`（0） | 立即 | 初始化串口参数 |
| `TCSADRAIN`（1） | 等发送缓冲区写完 | 等数据发完再改输出参数 |
| `TCSAFLUSH`（2） | 等发送完成并丢弃未处理输入 | 切换模式（如进入 raw）时首选 |
`struct termios` 各字段能填什么：

| 字段 | 可填写的标志 | 效果 |
| --- | --- | --- |
| `c_iflag` | `IGNBRK` | 忽略 break |
| | `BRKINT` | break 产生 `SIGINT` |
| | `IGNPAR` | 忽略奇偶校验错字节 |
| | `INPCK` | 使能奇偶校验 |
| | `ISTRIP` | 剥掉第 8 位 |
| | `INLCR` / `IGNCR` / `ICRNL` | 输入 CR↔LF 转换 / 忽略 CR / 把 CR 转成 LF |
| | `IXON` / `IXOFF` / `IXANY` | 软件流控 Ctrl-S/Ctrl-Q |
| | `IUTF8` | UTF-8 退格处理 |
| `c_oflag` | `OPOST` | 开启输出加工总开关 |
| | `ONLCR` | 输出 LF 转 CR-LF |
| | `OCRNL` / `ONOCR` / `OLCUC` | CR 转 LF / 不在第 0 列输出 CR / 输出转大写 |
| `c_cflag` | `CS5`/`CS6`/`CS7`/`CS8` | 数据位；8N1 用 `CS8` |
| | `CSTOPB` | 两位停止位 |
| | `PARENB` | 使能校验；再配 `PARODD` 为奇校验 |
| | `CREAD` | 使能接收（必须开） |
| | `CLOCAL` | 忽略 modem 控制线（串口必须开） |
| | `CRTSCTS` | 硬件流控 |
| | `HUPCL` | 关闭时拉低 DTR |
| | `B9600`/`B115200`/`B921600`… | 波特率，用 `cfsetispeed`/`cfsetospeed` 更清晰 |
| `c_lflag` | `ICANON` | 规范模式（行缓冲）；raw 模式要清掉 |
| | `ISIG` | Ctrl-C 等产生信号；raw 模式要清掉 |
| | `ECHO`/`ECHOE`/`ECHOK`/`ECHONL` | 回显与回显细节 |
| | `IEXTEN` | 扩展输入处理 |
| | `NOFLSH` / `TOSTOP` | 信号时不冲刷队列 / 后台写终端发 `SIGTTOU` |
| `c_cc[x]` | `VMIN` / `VTIME` | 非规范模式的读语义 |
| | `VINTR`/`VQUIT`/`VERASE`/`VKILL`/`VEOF` | 特殊控制字符，raw 模式下不再生效 |
`tcflush` 的 `queue_selector`：`TCIFLUSH`(0) 丢弃已收到未读、`TCOFLUSH`(1) 丢弃未写出、`TCIOFLUSH`(2) 两者都丢。
### 原始模式与 cfmakeraw
`cfmakeraw` 等价展开：

```c
t->c_iflag &= ~(IGNBRK | BRKINT | PARMRK | ISTRIP | INLCR | IGNCR | ICRNL | IXON);
t->c_oflag &= ~OPOST;
t->c_lflag &= ~(ECHO | ECHONL | ICANON | ISIG | IEXTEN);
t->c_cflag &= ~(CSIZE | PARENB);
t->c_cflag |= CS8;
t->c_cc[VMIN]  = 1;
t->c_cc[VTIME] = 0;
```
效果：不转换字符、不回显、不做行缓冲、Ctrl-C 不产生 `SIGINT`、8 数据位无校验。
### VMIN / VTIME：非规范模式的读语义

| VMIN 填 | VTIME 填 | `read` 行为 | 适用 |
| --- | --- | --- | --- |
| 0 | 0 | 立即返回已有数据，无数据返回 0 | 轮询式 |
| 0 | 1–255 | 最多等 VTIME×0.1 秒，有数据立即返回，超时返回 0 | 带超时的读 |
| 1–255 | 0 | 阻塞到读满 VMIN 字节 | 定长协议帧 |
| 1–255 | 1–255 | 首字节到达后启动字节间定时，间隔超 VTIME 即返回 | 不定长帧推荐 |
串口上 `read` 返回 0 **不是** EOF，而是超时或无数据；判断对端消失靠 `TIOCMGET` 看 `CD` 线。
### 串口初始化完整示例

```c
#define _GNU_SOURCE
#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <string.h>
#include <termios.h>
#include <unistd.h>

/* 打开并配置串口：115200 8N1，无流控，非阻塞 */
int serial_open(const char *dev, speed_t baud) {
    int fd = open(dev, O_RDWR | O_NOCTTY | O_NONBLOCK | O_CLOEXEC);
    if (fd < 0) return -1;

    struct termios t;
    if (tcgetattr(fd, &t) < 0) { close(fd); return -1; }

    cfmakeraw(&t);                      /* 原始模式：不做任何加工 */
    cfsetispeed(&t, baud);
    cfsetospeed(&t, baud);
    t.c_cflag |= (CLOCAL | CREAD);      /* 忽略 modem 控制线，使能接收 */
    t.c_cflag &= ~CRTSCTS;              /* 关闭硬件流控；用 RTS/CTS 时置位 */
    t.c_cflag &= ~(PARENB | CSTOPB | CSIZE);
    t.c_cflag |= CS8;                   /* 8 数据位 */
    t.c_cc[VMIN]  = 0;                  /* 读超时模式 */
    t.c_cc[VTIME] = 10;                 /* 1 秒 */

    if (tcsetattr(fd, TCSANOW, &t) < 0) { close(fd); return -1; }
    tcflush(fd, TCIOFLUSH);             /* 丢掉上电残留 */
    return fd;
}

int main(void) {
    int fd = serial_open("/dev/ttyUSB0", B115200);
    if (fd < 0) { perror("serial_open"); return 1; }
    char buf[256];
    for (;;) {
        ssize_t n = read(fd, buf, sizeof buf);
        if (n < 0) {
            if (errno == EINTR || errno == EAGAIN) continue;
            perror("read"); break;
        }
        if (n == 0) continue;           /* 超时，串口上不是 EOF */
        if (write(STDOUT_FILENO, buf, (size_t)n) < 0) break;
    }
    close(fd);
    return 0;
}
```
要点：
- `O_NOCTTY` 必须加，否则串口会成为进程的控制终端。
- 高于 `B4000000` 的非标准波特率需要 `termios2` + `BOTHER` + `ioctl(TCSETS2)`（`<asm/termbits.h>`），glibc 的 `cfsetospeed` 不支持。
- 发完数据要 `tcdrain(fd)`，不是 `fsync`。
### 终端窗口与线路状态

| ioctl 命令 | 参数 | 能读/写什么 |
| --- | --- | --- |
| `TIOCGWINSZ` | `struct winsize *` | 读行列：`ws_row`、`ws_col`、像素尺寸 |
| `TIOCSWINSZ` | `struct winsize *` | 设置行列，会触发 `SIGWINCH` |
| `TIOCMGET` | `int *` | 读 `TIOCM_DTR`、`TIOCM_RTS`、`TIOCM_CTS`、`TIOCM_DSR`、`TIOCM_CD`、`TIOCM_RI` |
| `TIOCMSET` | `int *` | 置位/清位控制线 |
| `TIOCMBIS` / `TIOCMBIC` | `int *` | 只置某位 / 只清某位 |
| `TIOCNOTTY` | 无 | 放弃控制终端 |

```c
struct winsize ws;
ioctl(STDIN_FILENO, TIOCGWINSZ, &ws);    /* 全屏程序取行列 */
int bits;
ioctl(fd, TIOCMGET, &bits);              /* 串口看 CD 判断对端是否接入 */
```
`SIGWINCH` 在窗口大小变化时发给前台进程组。
## ioctl 与硬件访问
### ioctl 的调用形态

```c
#include <sys/ioctl.h>
int ioctl(int fd, unsigned long request, ...);
```

| 第三参数形态 | 可填写的值 | 例子 |
| --- | --- | --- |
| 不传 | 直接省略 | `TIOCNOTTY`、`FIOCLEX` |
| 传整数 | `0`、`1` 等 | `ioctl(fd, TIOCSCTTY, 0)` |
| 传指针 | `&int`、`&struct` | `ioctl(fd, FIONREAD, &n)`、`ioctl(fd, TIOCGWINSZ, &ws)` |
命令字由宏编码，方向位决定内核是读还是写用户缓冲区：

```c
#define _IO(type, nr)              /* 无参数 */
#define _IOR(type, nr, datatype)   /* 驱动 → 用户，读 */
#define _IOW(type, nr, datatype)   /* 用户 → 驱动，写 */
#define _IOWR(type, nr, datatype)  /* 双向 */
```
通用命令：

| 命令 | 参数类型 | 能读/写什么 |
| --- | --- | --- |
| `FIONREAD` / `TIOCINQ` | `int *` | 可读字节数 |
| `TIOCOUTQ` | `int *` | 发送队列待发字节数 |
| `FIONBIO` | `int *`：`0`/`1` | 关闭/开启非阻塞 |
| `FIOCLEX` / `FIONCLEX` | 无 | 设置/清除 `CLOEXEC` |
| `SIOCGIFCONF` | `struct ifconf *` | 列出所有网卡 |
| `SIOCGIFADDR` | `struct ifreq *`（`ifr_name` 填 `"eth0"`） | 取网卡地址 |
| `SIOCGIFFLAGS` | `struct ifreq *` | 取网卡标志 |
errno：`ENOTTY`（该 fd 不支持此命令，最常见）、`EINVAL`（命令认识但参数不对）、`EFAULT`（用户指针非法）、`EPERM`。
> [!Note] 为什么 ioctl 被诟病
> 命令字是弱类型整数，编译期无法校验参数类型与大小，出错只能在运行期表现为 `EINVAL` 或内存踩踏。新接口倾向用 netlink、sysfs、io_uring 或专用字符设备。
### GPIO：字符设备接口
旧 `/sys/class/gpio` 已过时，新代码用 `/dev/gpiochipN` + ioctl（ABI v2）。头文件 `<linux/gpio.h>`。

```c
#include <fcntl.h>
#include <linux/gpio.h>
#include <string.h>
#include <sys/ioctl.h>
#include <unistd.h>

int gpio_out(int chip_fd, unsigned offset, int value) {
    struct gpio_v2_line_request req;
    memset(&req, 0, sizeof req);
    req.offsets[0] = offset;                 /* 芯片内的线号 */
    req.num_lines  = 1;
    strncpy(req.consumer, "demo", sizeof req.consumer - 1);
    req.config.flags = GPIO_V2_LINE_FLAG_OUTPUT;
    req.config.num_attrs = 1;
    req.config.attrs[0].attr.id = GPIO_V2_LINE_ATTR_ID_OUTPUT_VALUES;
    req.config.attrs[0].mask       = 1;      /* 第 0 位生效 */
    req.config.attrs[0].attr.values = value ? 1 : 0;
    if (ioctl(chip_fd, GPIO_V2_GET_LINE_IOCTL, &req) < 0) return -1;
    return req.fd;                           /* 后续用这个 fd 读写/改值 */
}

/* 改值 / 读值：line_fd 是 gpio_out 返回的线句柄 */
static int gpio_set(int line_fd, int value) {
    struct gpio_v2_line_values v = { .bits = value ? 1 : 0, .mask = 1 };
    return ioctl(line_fd, GPIO_V2_LINE_SET_VALUES_IOCTL, &v);
}
static int gpio_get(int line_fd) {
    struct gpio_v2_line_values v = { .mask = 1 };
    if (ioctl(line_fd, GPIO_V2_LINE_GET_VALUES_IOCTL, &v) < 0) return -1;
    return (int)(v.bits & 1);
}
```
`config.flags` 能填什么：

| flag | 效果 |
| --- | --- |
| `GPIO_V2_LINE_FLAG_INPUT` / `OUTPUT` | 方向；读要用 INPUT |
| `GPIO_V2_LINE_FLAG_BIAS_PULL_UP` / `PULL_DOWN` / `DISABLED` | 内部上下拉 |
| `GPIO_V2_LINE_FLAG_ACTIVE_LOW` | 低电平有效，逻辑值自动取反 |
| `GPIO_V2_LINE_FLAG_OPEN_DRAIN` / `OPEN_SOURCE` | 开漏/开源输出 |
| `GPIO_V2_LINE_FLAG_EDGE_RISING` / `FALLING` / `BOTH` | 中断边沿 |
| `GPIO_V2_LINE_FLAG_EVENT_CLOCK_REALTIME` | 事件时间戳用实时钟 |
中断：以 edge flag 申请后 `poll`/`epoll` 该 line fd，`read` 得到 `struct gpio_v2_line_event`（`timestamp_ns`、`id`）。
### I2C
头文件 `<linux/i2c-dev.h>`、`<linux/i2c.h>`，节点 `/dev/i2c-<bus>`。

```c
struct i2c_msg {
    __u16 addr;      /* 7 位从机地址（未左移），如 0x48 */
    __u16 flags;     /* 0 写 / I2C_M_RD 读 / I2C_M_TEN 十位地址 / I2C_M_NOSTART */
    __u16 len;
    __u8 *buf;
};
```

| `flags` 可填写的值 | 含义 |
| --- | --- |
| `0` | 写方向 |
| `I2C_M_RD` | 读方向 |
| `I2C_M_TEN` | 使用十位地址 |
| `I2C_M_NOSTART` | 不发 START，接着上一段传输（复合事务） |
| `I2C_M_IGNORE_NAK` | 忽略 NAK |
| `I2C_M_RECV_LEN` | 先读长度字节（SMBus 块读） |

```c
__u8 reg = 0x10, val = 0;
struct i2c_msg msgs[2] = {
    { .addr = 0x48, .flags = 0,        .len = 1, .buf = &reg },   /* 写寄存器地址 */
    { .addr = 0x48, .flags = I2C_M_RD, .len = 1, .buf = &val },   /* 读数据 */
};
struct i2c_rdwr_ioctl_data d = { .msgs = msgs, .nmsgs = 2 };
ioctl(fd, I2C_RDWR, &d);
```
旧接口 `ioctl(fd, I2C_SLAVE, 0x48)` 把 fd 绑定到从机后直接 `read`/`write`；缺点是多线程共享 fd 时会串地址，新代码用 `I2C_RDWR`。
### SPI
头文件 `<linux/spi/spidev.h>`，节点 `/dev/spidev<bus>.<cs>`。

| ioctl 命令 | 参数类型与可填写的值 | 效果 |
| --- | --- | --- |
| `SPI_IOC_WR_MODE` | `uint8_t`：`SPI_MODE_0`–`SPI_MODE_3` | CPOL/CPHA 组合 |
| `SPI_IOC_WR_BITS_PER_WORD` | `uint8_t`：`8`、`16` | 每字位数 |
| `SPI_IOC_WR_MAX_SPEED_HZ` | `uint32_t`：`1000000` 等 | 时钟频率 |
| `SPI_IOC_WR_LSB_FIRST` | `uint8_t`：`0` 高位先出（默认）、`1` 低位先出 | 位序 |
| `SPI_IOC_MESSAGE(n)` | `struct spi_ioc_transfer[n]` | 一次提交多段事务 |
`struct spi_ioc_transfer` 关键字段：`tx_buf`/`rx_buf`（用户地址转 `unsigned long`）、`len`、`speed_hz`、`bits_per_word`、`cs_change`（`1` 表示该段后释放片选）、`delay_usecs`。

```c
uint8_t tx[4] = {0x9F, 0, 0, 0}, rx[4] = {0};
struct spi_ioc_transfer tr = {
    .tx_buf = (unsigned long)tx, .rx_buf = (unsigned long)rx,
    .len = 4, .speed_hz = 1000000, .bits_per_word = 8, .cs_change = 0,
};
ioctl(fd, SPI_IOC_MESSAGE(1), &tr);
```
SPI 全双工：读的同时必写，`tx_buf` 传 `NULL` 表示发送全 0。
### 寄存器与 sysfs

| 方式 | 路径与可填写的值 | 适用与代价 |
| --- | --- | --- |
| `/dev/mem` + `mmap` | `mmap(NULL, len, PROT_READ|PROT_WRITE, MAP_SHARED, fd, phys)` | 需 root，`CONFIG_STRICT_DEVMEM` 会限制 |
| UIO 驱动 | `/dev/uioN` + `mmap` | 用户态驱动，可收中断（`read` 阻塞） |
| sysfs 属性 | 读写文本，如 `echo 20000 > period` | 最简单，一次操作一次系统调用 |
| 专用字符设备 | 驱动自定义 ioctl | 性能最好，需写内核模块 |
常见 sysfs：`/sys/class/pwm/pwmchipN`（`export` 后写 `period`/`duty_cycle`）、`/sys/class/leds`、`/sys/bus/iio/devices/iio:deviceN`。
### 设备权限

```bash
# /etc/udev/rules.d/60-local-devices.rules
KERNEL=="ttyUSB*", MODE="0666"
SUBSYSTEM=="gpio", KERNEL=="gpiochip*", MODE="0660", GROUP="gpio"
KERNEL=="i2c-*", MODE="0660", GROUP="i2c"
```
改完 `sudo udevadm control --reload && sudo udevadm trigger`。嵌入式板子上 `/dev/ttyS0` 常被内核控制台占用，需改 `/boot/cmdline.txt` 或设备树的 `console=`。
## 时间与定时
### clock_gettime

```c
#include <time.h>
int clock_gettime(clockid_t clockid, struct timespec *tp);
```

| clockid 可填写的值 | 含义 | 该用在哪 |
| --- | --- | --- |
| `CLOCK_REALTIME`(0) | 墙上时间，可被 NTP/手动调整 | 打时间戳、`pthread_cond_timedwait` 超时 |
| `CLOCK_MONOTONIC`(1) | 自启动的单调时间，不受调时影响 | **测耗时、算超时首选** |
| `CLOCK_PROCESS_CPUTIME_ID`(2) | 本进程消耗的 CPU 时间 | 性能统计 |
| `CLOCK_THREAD_CPUTIME_ID`(3) | 本线程 CPU 时间 | 线程级分析 |
| `CLOCK_MONOTONIC_RAW`(4) | 未做 NTP 频率校正 | 与硬件时钟对照 |
| `CLOCK_REALTIME_COARSE`(5) | 低精度实时钟，读得快 | 高频打点 |
| `CLOCK_MONOTONIC_COARSE`(6) | 低精度单调钟 | 同上 |
| `CLOCK_BOOTTIME`(7) | 含挂起时间的单调钟 | 设备休眠后的超时 |
| `CLOCK_TAI`(11) | 国际原子时 | 高精度同步 |
`struct timespec` 填 `{tv_sec, tv_nsec}`，`tv_nsec` 取值 0–999999999，超出返回 `EINVAL`。测耗时：

```c
static double now_sec(void) {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return (double)ts.tv_sec + (double)ts.tv_nsec / 1e9;
}
```
不要用 `gettimeofday` 测耗时（会被调时跳变），也不要只看秒。
### nanosleep / clock_nanosleep

```c
int nanosleep(const struct timespec *req, struct timespec *rem);
int clock_nanosleep(clockid_t clockid, int flags,
                    const struct timespec *request, struct timespec *remain);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `req`/`request` | `{0, 1000000}` | 睡眠 1 毫秒 |
| | `{5, 0}` | 5 秒 |
| | `tv_nsec >= 1000000000` | `EINVAL` |
| | `{0, 0}` | 让出 CPU 但仍可能立刻返回 |
| `rem` | `&rem` / `NULL` | 被信号打断时给出剩余时间；`NULL` 表示不关心 |
| `flags`（clock_nanosleep） | `0` | `request` 是时长 |
| | `TIMER_ABSTIME` | `request` 是绝对时刻，周期任务用它避免漂移 |
`nanosleep` 实际睡眠会略长，受 `CONFIG_HZ`、定时器精度、调度延迟影响。要稳定周期用 `timerfd` 或 `TIMER_ABSTIME`。
### alarm / setitimer / timer_create

| 接口 | 参数可填写的值 | 精度 | 信号 |
| --- | --- | --- | --- |
| `unsigned alarm(unsigned seconds)` | `0` 取消；`1`、`5` 秒 | 秒 | `SIGALRM`，一个进程只有一个 |
| `int setitimer(int which, const struct itimerval *new, struct itimerval *old)` | `which`：`ITIMER_REAL`（真实时间→`SIGALRM`）、`ITIMER_VIRTUAL`（用户态 CPU→`SIGVTALRM`）、`ITIMER_PROF`（CPU 总计→`SIGPROF`） | 微秒 | 信号 |
| `int timer_create(clockid_t, struct sigevent *sevp, timer_t *timerid)` | `sevp->sigev_notify`：`SIGEV_SIGNAL`（发信号）、`SIGEV_THREAD`（起线程）、`SIGEV_THREAD_ID`（指定线程）、`SIGEV_NONE`（只查询） | 纳秒 | 可配置 |
| `int timerfd_create(int clockid, int flags)` | `clockid`：`CLOCK_MONOTONIC`/`CLOCK_REALTIME`/`CLOCK_BOOTTIME`；`flags`：`TFD_NONBLOCK`、`TFD_CLOEXEC` | 纳秒 | 无信号，可读 fd |
服务器定时器的组织方式：

| 方案 | 结构 | 复杂度 | 适用 |
| --- | --- | --- | --- |
| 按 tick 扫描链表 | 遍历所有连接比对到期 | 每 tick O(n) | 连接少 |
| 最小堆 / 红黑树 | 按到期时间排序 | 插入删除 O(log n)，取最早 O(1) | 通用（libevent 小根堆、nginx 红黑树） |
| 时间轮 | 哈希到不同粒度槽 | O(1) | 海量连接、精度要求不高 |

```c
int tfd = timerfd_create(CLOCK_MONOTONIC, TFD_NONBLOCK | TFD_CLOEXEC);
struct itimerspec its = {
    .it_value    = { .tv_sec = 1, .tv_nsec = 0 },   /* 首次 1 秒后 */
    .it_interval = { .tv_sec = 1, .tv_nsec = 0 },   /* 之后每 1 秒 */
};
timerfd_settime(tfd, 0, &its, NULL);
/* epoll 收 EPOLLIN 后必须读 */
uint64_t expirations;
read(tfd, &expirations, sizeof expirations);
```
## 进程间通信
### 通信方式对比

| 方式 | 数据单位 | 跨主机 | 拷贝次数 | 典型场景 |
| --- | --- | --- | --- | --- |
| 管道 `pipe` | 字节流 | 否 | 2 | 父子进程、线程唤醒 |
| 命名管道 `mkfifo` | 字节流 | 否 | 2 | 无亲缘关系进程 |
| Unix 域 socket | 字节流/数据报 | 否 | 2 | 本地 RPC、传 fd |
| TCP/UDP | 字节流/数据报 | 是 | 多 | 跨机 |
| 共享内存 | 任意 | 否 | 0 | 大数据量、低延迟 |
| POSIX 消息队列 | 有边界消息 | 否 | 2 | 带优先级的小消息 |
| 信号 | 无数据 | 否 | - | 通知，不适合传数据 |
| eventfd | 8 字节计数 | 否 | 1 | 线程/进程唤醒 |
| 信号量 | 计数 | 否 | - | 同步而非传数据 |
### 命名管道 mkfifo

```c
#include <sys/stat.h>
int mkfifo(const char *pathname, mode_t mode);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `pathname` | `"/tmp/myfifo"` | 在磁盘上创建 FIFO 节点 |
| `mode` | `0600`、`0666`（受 umask 影响） | 权限 |
打开行为：只读打开会阻塞到有写端打开，反之亦然；两端都用 `O_RDWR` 可避免但会掩盖 EOF。已存在返回 `EEXIST`，可直接使用。
### 共享内存

```c
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>
int shm_open(const char *name, int oflag, mode_t mode);
int shm_unlink(const char *name);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `name` | `"/myshm"` | 必须以 `/` 开头，不能含其他 `/`；实际落在 `/dev/shm/myshm` |
| `oflag` | `O_CREAT|O_RDWR` | 不存在则创建，读写 |
| | `O_CREAT|O_EXCL|O_RDWR` | 已存在则 `EEXIST`，防重复初始化 |
| | `O_RDONLY` | 只读映射 |
| `mode` | `0600`、`0666` | 权限，仅在创建时生效 |
流程：`shm_open` → `ftruncate(fd, size)` → `mmap` → 使用 → `munmap` → `close` → `shm_unlink`。共享内存本身不提供同步，必须配信号量、`PTHREAD_PROCESS_SHARED` 互斥量或文件锁。
### POSIX 信号量与消息队列

```c
sem_t *sem_open(const char *name, int oflag, mode_t mode, unsigned int value);
int sem_wait(sem_t *sem); int sem_trywait(sem_t *sem);
int sem_timedwait(sem_t *sem, const struct timespec *abs_timeout);
int sem_post(sem_t *sem); int sem_close(sem_t *sem); int sem_unlink(const char *name);

mqd_t mq_open(const char *name, int oflag, mode_t mode, struct mq_attr *attr);
int mq_send(mqd_t mqdes, const char *msg_ptr, size_t msg_len, unsigned int msg_prio);
ssize_t mq_receive(mqd_t mqdes, char *msg_ptr, size_t msg_len, unsigned int *msg_prio);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `sem_open` 的 `name` | `"/mysem"` | 以 `/` 开头，不含其他 `/` |
| `sem_open` 的 `value` | `0` 起等；`1` 互斥；`N` 计数 | 初始计数，已存在时被忽略 |
| `sem_timedwait` 的 `abs_timeout` | `CLOCK_REALTIME` 绝对时刻 | 超时返回 `ETIMEDOUT` |
| `mq_open` 的 `attr.mq_maxmsg` | `1`–`/proc/sys/fs/mqueue/msg_max`（默认 10） | 队列深度 |
| `mq_open` 的 `attr.mq_msgsize` | 正数，上限 `msgsize_max`（默认 8192） | 单条消息上限 |
| `mq_send` 的 `msg_prio` | `0`–`MQ_PRIO_MAX`(32) | 数值越大越先被取 |
| `mq_receive` 的 `msg_len` | 必须 ≥ `mq_msgsize` | 不够返回 `EMSGSIZE` |
### memfd_create

```c
#include <sys/mman.h>
int memfd_create(const char *name, unsigned int flags);
```

| 参数 | 可填写的值 | 效果 |
| --- | --- | --- |
| `name` | `"myshm"` | `/proc/self/fd/N` 的显示名，不含 `/` |
| `flags` | `0` | 普通匿名文件 |
| | `MFD_CLOEXEC` | exec 时关闭 |
| | `MFD_ALLOW_SEALING` | 允许 `fcntl(F_ADD_SEALS)` 封印 |
| | `MFD_HUGETLB` | 大页 |
匿名内存文件，配合 `ftruncate`+`mmap` 做共享内存，或经 `SCM_RIGHTS` 传给其他进程。加 `MFD_ALLOW_SEALING` 后可用 `F_SEAL_WRITE`、`F_SEAL_SHRINK`、`F_SEAL_SEAL` 防止接收方篡改。
## 错误处理与排错
### errno 的正确用法

```c
#include <errno.h>
#include <stdio.h>
#include <string.h>

static void report_open_error(const char *path, int fd) {
    if (fd >= 0) return;
    int saved = errno;                       /* 先保存，后面的 fprintf 可能改它 */
    fprintf(stderr, "open(%s): %s\n", path, strerror(saved));
}
```
- 只在返回值表示失败后读 `errno`；成功调用不清零它。
- 需要跨调用使用时先保存：`int saved = errno;`。
- 多线程或延迟处理用 `strerror_r`；`strerror` 返回静态缓冲区，会互相覆盖。
### 高频 errno 对照

| errno | 常见来源 | 处理方式 |
| --- | --- | --- |
| `EINTR` | 阻塞调用被信号打断 | 重试，或 `sigaction` 加 `SA_RESTART` |
| `EAGAIN`/`EWOULDBLOCK` | 非阻塞无数据/缓冲满 | 注册 epoll 等就绪，不是错误 |
| `EINPROGRESS` | 非阻塞 `connect` | 等 `EPOLLOUT` 后读 `SO_ERROR` |
| `EBADF` | fd 非法或已关闭 | 查重复关闭、跨线程共享 |
| `EMFILE`/`ENFILE` | 进程 fd 用尽 / 系统 fd 用尽 | `lsof`、调 `RLIMIT_NOFILE` |
| `ENOENT`/`EACCES` | 路径不存在 / 权限不足 | 注意 `EACCES` 也可能是中间目录无 `x` |
| `EADDRINUSE` | 端口被占或 `TIME_WAIT` | `SO_REUSEADDR`，`ss -lntp` 查占用 |
| `ECONNRESET` | 对端 RST | 关闭连接并记录 |
| `EPIPE` | 写已关闭的 socket/管道 | 忽略 `SIGPIPE`，按断开处理 |
| `ETIMEDOUT` | 握手或重传超时 | 检查网络与 `TCP_USER_TIMEOUT` |
| `ENOTTY` | ioctl 命令不被设备支持 | 核对命令字 |
| `ENOSPC`/`EDQUOT` | 磁盘满 / 配额超限 | |
| `ENOMEM` | 内存不足，也可能是 `RLIMIT_AS` | |
### 排错工具链

| 工具 | 常用参数 | 用途 |
| --- | --- | --- |
| `strace` | `-f`、`-tt`、`-T`、`-y`、`-e trace=network,desc`、`-p <pid>` | 看系统调用与返回值 |
| `ltrace` | `-p <pid>` | 看库函数调用 |
| `gdb` | `-p <pid>`、`thread apply all bt`、`info threads` | 断点与栈 |
| `perf` | `top`、`record -g`、`trace` | 采样与计数 |
| `ss` | `-lntp`、`-tan state close-wait`、`-s` | socket 状态 |
| `ip` | `addr`、`route`、`neigh` | 网卡/路由/邻居 |
| `tcpdump` | `-i any -nn port 8080 -w a.pcap` | 抓包 |
| `lsof` | `-p <pid>`、`-i :8080` | 打开的文件与端口 |
| ASan/UBSan | `-fsanitize=address,undefined -g` | 内存与未定义行为检查 |
### /proc 与 sysctl 速查

| 路径 | 内容 |
| --- | --- |
| `/proc/<pid>/fd` | 打开的 fd 及其指向 |
| `/proc/<pid>/task/<tid>/comm` | 线程名 |
| `/proc/<pid>/status` | 状态、线程数、内存、信号屏蔽字 |
| `/proc/<pid>/limits` | 各 rlimit 的当前值与硬限制 |
| `/proc/net/tcp`、`/proc/net/unix` | socket 表 |
| `/proc/sys/net/core/somaxconn` | 全连接队列上限 |
| `/proc/sys/fs/nr_open` | 单进程 fd 上限 |
| `/proc/sys/net/ipv4/tcp_max_syn_backlog` | 半连接队列上限 |
| `/proc/sys/net/ipv4/tcp_tw_reuse` | 是否复用 `TIME_WAIT` 发新连接 |
| `/proc/sys/fs/epoll/max_user_watches` | 单用户 epoll 项上限 |
调整：`sysctl -w net.core.somaxconn=4096`（临时）或写入 `/etc/sysctl.d/99-local.conf`（持久）。
## 常见坑速查

| 症状 | 根因 | 修法 |
| --- | --- | --- |
| 写日志程序被写死 | 未忽略 `SIGPIPE` | `signal(SIGPIPE, SIG_IGN)` 或 `MSG_NOSIGNAL` |
| 重启报 `Address already in use` | `TIME_WAIT` 占端口 | `SO_REUSEADDR` |
| fd 数持续涨 | 错误分支漏 `close` | RAII、`O_CLOEXEC`、`lsof` 定位 |
| `CLOSE_WAIT` 堆积 | 读到 EOF 后没关 fd | `read == 0` 分支强制 `close` |
| 连接卡在握手 | 全连接队列满 | 调大 `backlog` 与 `somaxconn` |
| 多进程监听只有一进程干活 | 惊群 | `SO_REUSEPORT` 或 `EPOLLEXCLUSIVE` |
| ET 模式不再唤醒 | 没循环读到 `EAGAIN` | ET 必须配非阻塞并读干净 |
| `epoll_ctl` 返回 `EPERM` | 对普通文件注册 epoll | 改 `io_uring` 或直接读 |
| 串口数据缺字节或被改写 | 未切原始模式 | `cfmakeraw` + `O_NOCTTY` |
| 串口 `read` 总返回 0 | `VMIN=0` 或 `VTIME` 超时 | 改 `VMIN=1` 或看 `CD` 线 |
| 子进程输出重复两遍 | `fork` 前缓冲区未冲刷 | `fflush(NULL)` 或 `_exit` |
| 多线程 `fork` 后卡死 | 继承了加锁状态的锁 | `pthread_atfork` 或 `posix_spawn` |
| `write` 只写一部分 | TCP 发送缓冲小于请求 | 循环写 |
| `cfmakeraw` 未声明 | 缺 `_GNU_SOURCE` | `-D_GNU_SOURCE` |
| `mmap` 后访问 `SIGBUS` | 映射超过文件实际大小 | 先 `ftruncate` |
| `SO_RCVBUF` 改了没生效 | 被 `rmem_max` 封顶 | 调 `sysctl net.core.rmem_max` |
## 参考
- [Linux man-pages](https://man7.org/linux/man-pages/)
- [POSIX.1-2017 系统接口](https://pubs.opengroup.org/onlinepubs/9699919799/functions/contents.html)
- [Linux 内核文档](https://docs.kernel.org/)
- [glibc 手册](https://www.gnu.org/software/libc/manual/)
- [GPIO 字符设备 ABI](https://docs.kernel.org/userspace-api/gpio/chardev.html)
- [io_uring 手册](https://man7.org/linux/man-pages/man2/io_uring_setup.2.html)
