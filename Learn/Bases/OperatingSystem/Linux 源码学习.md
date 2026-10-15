# Linux 0.11 源码学习
## 学习目标
从 Linux 0.11 的真实实现理解启动、进程调度、内存管理、文件系统、设备与事件处理；能沿关键调用链解释状态变化，并区分 0.11 的机制与 2.6.32 及现代 Linux 的设计。
## 学习路线
| 阶段 | 重点文件 | 要建立的理解 |
| --- | --- | --- |
| 启动与内核入口 | `boot/bootsect.s`、`boot/setup.s`、`boot/head.s`、`init/main.c` | BIOS 加载、保护模式、分页和内核初始化的衔接 |
| 进程与调度 | `include/linux/sched.h`、`kernel/fork.c`、`kernel/sched.c`、`kernel/system_call.s` | 任务状态、`fork`、时间片、睡眠唤醒和上下文切换 |
| 内存管理 | `mm/memory.c`、`include/linux/mm.h` | 段基址、页表、物理页分配和写时复制 |
| 文件系统与块设备 | `include/linux/fs.h`、`fs/namei.c`、`fs/inode.c`、`fs/buffer.c`、`kernel/blk_drv/` | 路径解析、inode/file、buffer cache、块请求和设备驱动 |
| 中断与事件 | `kernel/traps.c`、`kernel/system_call.s`、`kernel/chr_drv/`、定时器与等待队列实现 | 异常、中断入口、设备完成通知、阻塞与唤醒 |
| 网络与版本对照 | 当前仓库的源码边界，后续参考 2.6.32 | 识别 0.11 缺少的网络栈能力，再对照 socket、TCP/IP 与 `epoll` |
## 版本边界
当前仓库没有 `net/` 目录，也没有 socket、TCP/IP 网络栈的实现文件；学习 Linux 0.11 时，网络部分先记录为源码边界。事件处理可以从定时器、硬件中断、等待队列和字符设备入手，后续再与 2.6.32 的网络事件路径对照。当前仓库也没有 CFS；0.11 的调度器使用任务计数器和优先级更新时间片，与笔记中记录的 `vruntime` / CFS 模型属于不同版本的实现。
## 启动与内核入口
### 阅读顺序
重点阅读 `boot/bootsect.s` 的磁盘加载和跳转、`boot/setup.s` 的 BIOS 信息采集与模式切换、`boot/head.s` 的 32 位入口与分页初始化、`init/main.c` 的内核子系统初始化。构建脚本和汇编语法细节可先略读，遇到地址或装载问题时再回查。
### 启动链
`BIOS → 0x7c00 的 bootsect → 0x90000 的 bootsect 副本 → setup 与 system 加载 → setup 收集 BIOS 参数并启用 A20 → 重映射 8259 中断 → 建立 GDT 并进入保护模式 → 将 system 搬到物理地址 0 → head.s 建立 IDT/GDT 和初始页表 → 打开分页 → main()`。
`bootsect.s` 使用 BIOS 中断读取磁盘扇区；`setup.s` 把启动信息暂存到 `0x90000` 附近，并在保护模式下将内核搬到最终位置。`head.s` 使用页目录和 4 张页表恒等映射前 16 MiB，再跳转到 `main()`。这些文件把 BIOS 阶段的实模式代码与内核 32 位启动代码连接起来。
### 初始化与首个用户任务
`init/main.c` 依次初始化内存、异常处理、块设备、字符设备、TTY、时间、调度器、buffer cache、硬盘和软盘，之后执行 `sti()` 开放中断、切换到用户模式并调用 `fork()`。子进程运行 `init()`；`task 0` 循环调用 `pause()`，在没有其他任务可运行时承担空闲任务的角色。
### 可引申概念
`setup.s` 中的 A20 地址线允许 80286 及后续处理器访问 1 MiB 以上地址；GDT 描述代码段和数据段，IDT 把异常或中断向量映射到处理入口；CR0 的 PE 位切换到保护模式，PG 位启用分页。它们连接了 x86 特权级、分段、中断和虚拟内存知识，细节将在对应源码阶段继续展开。
## 进程创建与调度
### 数据结构
`task_struct` 保存任务状态、`counter`、`priority`、信号、进程关系、文件系统引用和 TSS。`task[]` 是固定大小的任务表，`current` 指向当前任务；`task[0]` 是内核初始化时建立的空闲任务。
### `fork` 调用链
系统调用入口 `system_call.s:sys_fork` 先调用 `find_empty_process()` 分配 PID 和任务槽，再进入 `copy_process()`。`copy_process()` 分配一页作为子任务结构及内核栈，复制任务信息和寄存器现场，调用 `copy_mem()` 为子进程建立地址空间，增加打开文件和 inode 的引用计数，设置 TSS/LDT 描述符，最后才把子任务状态改为可运行。页表如何共享、何时复制由 `mm/memory.c` 中的实现决定。
### 0.11 的调度策略
`kernel/sched.c:schedule()` 先检查闹钟并处理待决信号，再从 `task[1..]` 中选取状态为可运行且 `counter` 最大的任务。若所有候选任务的 `counter` 都为 0，就按 `counter = (counter >> 1) + priority` 为任务补充时间片，再重新选择；没有可运行任务时切换回 `task 0`。这套策略使用动态时间片和优先级，尚无 CFS 的红黑树和 `vruntime`。
### 睡眠与唤醒
`sys_pause()` 将当前任务设为可中断睡眠后调用 `schedule()`。`sleep_on()` 和 `interruptible_sleep_on()` 用任务指针组成等待链，分别表示不可中断和可中断睡眠；`wake_up()` 唤醒等待链表头部的任务。设备驱动和文件操作会使用这些原语等待 I/O 或资源。
### 定时器与切换
PIT 按 `HZ=100` 产生约每 10 ms 一次的时钟中断。`timer_interrupt` 增加 `jiffies` 并调用 `do_timer()`；内核更新用户态/内核态时间、处理定时器和软盘马达计时。当前任务时间片耗尽且中断来自用户态时，调度器选择下一个任务。`switch_to()` 通过远跳转到目标 TSS 触发 x86 硬件任务切换，这是本版本与现代 Linux 软件保存/恢复切换上下文的实现差异之一。

## 输入事件：从硬件中断到进程读取
### 键盘与串口
键盘入口在 `kernel/chr_drv/kb.S:keyboard_interrupt`：读取键盘控制器端口 `0x60` 的扫描码，经 `key_table` 分派并转换成字符，再由 `put_queue()` 放入 TTY 的 `read_q` 环形队列。处理程序确认键盘控制器状态、向 PIC 发送 EOI 后调用 `do_tty_interrupt()`。
串口入口在 `kernel/chr_drv/rs_io.s:rs_int`：读取中断识别寄存器，并循环处理调制解调器状态、接收字符、发送字符和线路状态。接收字符进入 `read_q`；发送中断从 `write_q` 取字符写入 UART，队列空间足够或发送结束时唤醒等待写入的进程。
### TTY 队列与规范输入
`do_tty_interrupt()` 调用 `copy_to_cooked()`，把原始 `read_q` 中的数据转换到 `secondary` 队列。转换过程可处理回车/换行、大小写、退格、整行删除、Ctrl-S/Ctrl-Q 流控、Ctrl-C/Ctrl-\ 信号和回显。规范模式下，换行或 EOF 会更新 `secondary.data`，标记一行输入已经结束；随后 `wake_up()` 通知等待读取的任务。
`tty_read()` 从 `secondary` 取数据。队列为空或规范模式下尚未形成完整输入行时，`sleep_if_empty()` 在关闭中断后检查条件并调用 `interruptible_sleep_on()`；唤醒后再检查队列和信号。关闭中断保护了“检查条件到登记睡眠”的短临界区，避免设备刚好在任务睡眠时完成输入。
这条链路体现了 0.11 的事件处理方式：硬件中断搬运数据并唤醒等待队列，进程在条件不满足时睡眠。它与后续版本用 `select`/`poll`/`epoll` 汇集多个文件描述符事件的接口层机制不同；当前仓库没有网络协议栈。
### 阅读时要核对的原注释
`tty_io.c` 中有一段旧注释猜测中断处理路径可以睡眠。实际 `do_tty_interrupt() → copy_to_cooked()` 只处理队列、信号和唤醒，不主动睡眠；中断上下文不能阻塞，应以代码调用链为准。`kb.S` 的 `put_queue()` 注释把高位寄存器写成 `%edx`，但实现通过 `%ebx:%eax` 移出待写字节，`%edx` 在函数中用作队列地址。
## 缺页异常、写时复制与内核分配
`mm/page.s:page_fault` 从 CR2 读取故障线性地址，并根据页故障错误码的 present 位分派：页不存在时调用 `do_no_page()`，对只读页写入时调用 `do_wp_page()`。`do_no_page()` 会为匿名数据分配清零页；访问可执行文件映射时，会尝试共享同一 inode 的干净页面，未命中后再用 `bmap()` 找到文件块、`bread_page()` 读入页面并建立映射。
`copy_page_tables()` 在 `fork()` 时为子进程复制页表项。大于 `LOW_MEM` 的用户页面共享同一物理页，同时清除双方映射的写权限并增加 `mem_map` 引用计数。任一进程写入时触发页故障：若引用计数为 1，就恢复该映射的写权限；若页面仍被共享，则分配新页、复制内容、减少旧页引用计数并更新页表。`invalidate()` 通过重载 CR3 刷新 TLB，使 CPU 后续使用新的页表权限和映射。
`lib/malloc.c` 使用按对象大小分类的 bucket：每个页面只容纳一种大小的对象，大小类别从 16 字节到 4096 字节。descriptor 记录页面、对象引用数和空闲链表；对象全部释放后页面归还给页分配器。它与 `get_free_page()` 的整页分配是两层机制。该实现通过 `cli()`/`sti()` 防止单处理器上的中断重入；文档中关于 NFS/网络中断的讨论只是未来计划，当前 0.11 仓库并没有网络栈。
