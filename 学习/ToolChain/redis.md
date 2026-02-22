---
created: 2026-02-22
参考1: https://www.redis.net.cn/tutorial/3504.html
---
# 基本认识
## Redis 基础知识
### 主要特性/配置
#### Redis 守护进程
Redis守护进程（Redis Daemon）是指在后台运行的Redis服务器进程。它是一个**独立于控制终端的后台服务进程**，可以在系统启动时自动运行，持续提供服务而不占用终端界面，在 `redis.conf` 文件中配置
1. daemonize no（默认值）以前台模式运行
	- Redis服务的输出日志会直接显示在终端窗口中
	- 用户无法在同一窗口中输入其他命令
	- 如果关闭终端或断开连接，Redis进程会随之终止
2. daemonize yes 以后台守护进程模式运行
    - Redis在后台独立运行，脱离终端控制
    - 输出日志会写入到指定的日志文件中（命令 `pidfile /path/to/logfile` 配置项指定）
    - 用户可以在同一窗口中继续输入其他命令
    - Redis进程的PID会写入到 `pidfile` 指定的文件中
#### 主从复制
Redis主从复制是一种数据同步机制，允许将一台Redis服务器（称为**主节点/Master**）的数据复制到一台或多台Redis服务器（称为**从节点/Slave/Replica**），无论是增量还是全量复制**都没有磁盘 IO**
- 主节点（Master）：
	- 负责处理所有写操作（SET、DEL 等）
	- 只有一个主节点
	- 可以处理读请求，但主要是为了写操作
- 从节点（Slave）：
	- 从主节点复制数据
	- 默认只能处理读请求（slave-read-only=yes）
	- 可以有多个从节点
	- 可以通过 slaveof 或 replicaof 命令配置为主节点的从节点
主要的作用：
- 专一工作：读写操作分开，提高性能
- 数据备份，提高容错

同步的阶段
![[Pasted image 20260222111702.png]]
1. 连接建立阶段 3
	- 从节点通过 replicaof 命令配置连接主节点
	- 发送 PING 命令检查通信
	- 如需要密码验证（主服务器的 conf 中设置 requireness），发送 AUTH 命令
2. 数据同步阶段 13
	- 全量同步：第一次连接或数据差异较大时触发
	- 从 slave 发送 `PSYNC ? -1` 命令请求全量同步，master 主节点执行 BGSAVE 生成 RDB 快照文件，通过网络发送到 slave
	- 从节点清空旧数据并加载 RDB 文件
	- 主节点发送期间缓存的写命令
	- 部分同步（Redis 2.8+）
	- 从节点短暂断开后重连时触发
	- 只传输缺失的数据部分
	- 通过复制偏移量和复制积压缓冲区实现
3. 命令传播阶段（增量同步）
	- 主节点执行写命令后，将命令发送给所有从节点
	- 从节点执行相同的命令保持数据一致
	- 这个过程是异步的，**并且 master 不会等待 slave 的回应**
重点概念：
1. 复制偏移量
	- 主从服务器各自维护一个偏移量计数器
	- 主节点每传播N字节命令，偏移量增加N
	- 用于判断数据是否一致
2. 复制积压缓冲区
	- 主节点维护的固定长度先进先出队列
	- 记录最近传播的写命令
	- 通过`repl-backlog-size`配置大小
	- 决定能否进行部分同步的关键
3. 异步复制特性
	- 主节点发送命令后不会等待从节点回复
	- 性能和一致性之间的权衡
	- 极端情况下可能导致数据丢失
4. 服务器运行 ID
	- 每个Redis实例启动时都会生成一个唯一的运行ID
	- 从服务器会记录主服务器的ID。当主服务器重启变更后，运行ID改变，从服务器会触发全量同步。
配置文件写入：
```conf
# 主节点不需要特殊配置，但可以设置密码
requirepass yourpassword

# 从节点
# 设置主节点信息
replicaof 192.168.10.32 6379
# 主节点密码（如果主节点设置了requirepass）
masterauth yourpassword
# 从节点只读模式（默认开启）
slave-read-only yes

# 查看主节点信息
redis-cli -a password info replication
role:master
connected_slaves:1
slave0:ip=192.168.10.31,port=6379,state=online,offset=140,lag=1

# 从节点信息
role:slave
master_host:192.168.10.32
master_port:6379
master_link_status:up
```
#### 主要配置

| 序号  | 配置项                                                  | 默认值 / 示例                                         | 说明                                                                                                                           |
| --- | ---------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | `daemonize`                                          | `no`                                             | Redis 默认不是以守护进程方式运行。设为 `yes` 可启用守护进程模式。                                                                                      |
| 2   | `pidfile`                                            | `/var/run/redis.pid`                             | 当 Redis 以守护进程运行时，默认将 PID 写入此文件。可通过该选项指定路径。                                                                                   |
| 3   | `port`                                               | `6379`                                           | 指定监听端口。默认为 6379 —— 作者解释：6379 在手机键盘上对应 “MERZ”（意大利歌女 Alessia Merz 的名字）。                                                        |
| 4   | `bind`                                               | `127.0.0.1`                                      | 绑定的主机地址。限制 Redis 仅接受来自该 IP 的连接。                                                                                              |
| 5   | `timeout`                                            | `300`                                            | 客户端闲置多少秒后关闭连接。设为 `0` 表示禁用此功能。                                                                                                |
| 6   | `loglevel`                                           | `verbose`                                        | 日志级别，支持：`debug`、`verbose`、`notice`、`warning`。默认为 `verbose`。                                                                  |
| 7   | `logfile`                                            | `stdout`                                         | 日志输出方式。默认为标准输出。若 Redis 以守护进程运行且仍设为 `stdout`，日志将被重定向到 `/dev/null`。                                                            |
| 8   | `databases`                                          | `16`                                             | 数据库数量。默认为 16 个（编号 0–15），可通过 `SELECT <dbid>` 切换。                                                                              |
| 9   | `save`                                               | `save 900 1`<br>`save 300 10`<br>`save 60 10000` | 触发 RDB 快照的条件：在 `<seconds>` 秒内有 `<changes>` 次更新即保存。可配置多条规则。示例表示：<br>• 900 秒内至少 1 次修改<br>• 300 秒内至少 10 次<br>• 60 秒内至少 10000 次。 |
| 10  | `rdbcompression`                                     | `yes`                                            | 是否对 RDB 文件使用 LZF 压缩。设为 `no` 可节省 CPU，但会使快照文件显著增大。                                                                             |
| 11  | `dbfilename`                                         | `dump.rdb`                                       | 本地 RDB 持久化文件名。                                                                                                               |
| 12  | `dir`                                                | `./`                                             | RDB 和 AOF 文件的存储目录。                                                                                                           |
| 13  | `slaveof`                                            | `<masterip> <masterport>`                        | 若本机为从节点（slave），通过此配置指定主节点（master）的 IP 和端口。启动时自动同步数据。                                                                         |
| 14  | `masterauth`                                         | `<master-password>`                              | 当 master 启用了密码认证时，slave 连接需提供此密码。                                                                                            |
| 15  | `requirepass`                                        | `foobared`                                       | 设置客户端连接密码。启用后，客户端必须通过 `AUTH <password>` 认证。默认关闭（无密码）。                                                                        |
| 16  | `maxclients`                                         | `128`                                            | 最大客户端连接数。设为 `0` 表示无限制（受限于系统文件描述符上限）。超限时返回错误：`max number of clients reached`。                                                 |
| 17  | `maxmemory`                                          | `<bytes>`                                        | 内存使用上限（如 `256mb`）。达到上限后，Redis 会先清除过期 key；若仍超限，则拒绝写入（只读）。新 VM 机制下，key 存内存，value 可存 swap。                                      |
| 18  | `appendonly`                                         | `no`                                             | 是否启用 AOF（Append Only File）持久化。默认 `no`（仅 RDB）。若为 `no`，断电可能导致最近数据丢失（因 RDB 是周期性异步保存）。                                           |
| 19  | `appendfilename`                                     | `appendonly.aof`                                 | AOF 日志文件名。                                                                                                                   |
| 20  | `appendfsync`                                        | `everysec`                                       | AOF 同步策略：<br>• `no`：由操作系统决定（最快，最不安全）<br>• `always`：每次写操作调用 `fsync()`（最慢，最安全）<br>• `everysec`：每秒同步一次（默认，折衷方案）。                |
| 21  | `vm-enabled`                                         | `no`                                             | 是否启用虚拟内存（VM）机制。设为 `yes` 时，冷数据（访问少的 value）会被 swap 到磁盘，热数据保留在内存。注意：Redis 2.4+ 已废弃 VM。                                          |
| 22  | `vm-swap-file`                                       | `/tmp/redis.swap`                                | VM 交换文件路径。不可被多个 Redis 实例共享。                                                                                                  |
| 23  | `vm-max-memory`                                      | `0`                                              | VM 模式下，内存中最多保留多少字节的数据。设为 `0` 表示所有 value 都存磁盘（仅 keys 留在内存）。                                                                   |
| 24  | `vm-page-size`                                       | `32`                                             | VM 页面大小（字节）。建议：小对象用 32/64 bytes，大对象用更大值。                                                                                     |
| 25  | `vm-pages`                                           | `134217728`                                      | VM 交换文件的总页数。每 8 个 page 在内存中消耗 1 字节（用于位图管理）。                                                                                  |
| 26  | `vm-max-threads`                                     | `4`                                              | VM I/O 线程数。建议不超过 CPU 核数。设为 `0` 表示串行操作（可能导致高延迟）。                                                                              |
| 27  | `glueoutputbuf`                                      | `yes`                                            | 向客户端响应时，是否合并小包以减少网络开销。默认开启。                                                                                                  |
| 28  | `hash-max-zipmap-entries`<br>`hash-max-zipmap-value` | `64`<br>`512`                                    | 当哈希对象的字段数 ≤ `entries` 且每个 value 长度 ≤ `value` 字节时，使用更紧凑的 ziplist 编码。否则转为 hashtable。                                           |
| 29  | `activerehashing`                                    | `yes`                                            | 是否在后台主动重哈希（rehash）。开启可避免一次性 rehash 导致的延迟 spike。                                                                              |
| 30  | `include`                                            | `/path/to/local.conf`                            | 包含其他配置文件。可用于多实例共享基础配置，同时加载个性化设置。                                                                                             |
#### 数据类型
一个键存 512MB 数据
string：二进制安全（保存任意数据），通过 `set/get` 操作
hash：kv 集合，`hset/hget/hgetall` 操作
```redis
redis 127.0.0.1:6379> HMSET user:1 username redis.net.cn password redis.net.cn points 200
OK
redis 127.0.0.1:6379> HGETALL user:1
1) "username"
2) "redis.net.cn"
3) "password"
4) "redis.net.cn"
5) "points"
6) "200"
redis 127.0.0.1:6379>
```
其中 `user:1` 是哈希表对象名称键名称，后面的这些才是其中存储的值（user 前缀，1 后缀，redis 键名称命名规范）
list，列表，`rpush/lpush` 插入，多个值的命令插入顺序和命令书写顺序相反
set，无序集合，`sadd/srem/spop/sdiff/scard` 操作
zset，有序集合，基本命令同上，