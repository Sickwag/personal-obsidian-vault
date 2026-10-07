---
created: 2026-02-22
参考1: https://www.redis.net.cn/tutorial/3504.html
---
# Redis
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
##### string
二进制安全（保存任意数据），通过 `set/get` 操作
##### hash
kv 集合，`hset/hget/hgetall` 操作
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
- list，列表，`rpush/lpush` 插入，多个值的命令插入顺序和命令书写顺序相反，最大长度为 `2^32 - 1 (4,294,967,295)` 个元素。需要注意：
	- `BLPOP` 从列表的头部删除并返回一个元素。如果列表为空，则命令会阻塞，直到元素可用或达到指定的超时。
	- `BLMOVE` 原子地将元素从源列表移动到目标列表。如果源列表为空，则该命令将阻塞，直到有新元素可用。
##### set
无序集合，`sadd/srem/spop/sdiff差集/sinter交集/scard` 操作，最大大小为 `2^32 - 1 (4,294,967,295)` 个成员
##### zset
有序集合，基本命令同上，添加了一些 `zrank/zrevrank/zrange/zrevrange` 之类的排序查看操作
##### stream 流
用于处理日志和事件流数据，作用类似于仅附加日志。您可以使用流实时记录和同步事件，Redis 为每个流条目生成一个唯一的 ID，通过 id 来操作流数据，使用 `X...` 流操作命令设置流大部分会返回流 ID
```redis
> - 将多个温度读数添加到流中
> XADD temperatures:us-ny:10007 * temp_f 87.2 pressure 29.69 humidity 46
"1658354918398-0"
> XADD temperatures:us-ny:10007 * temp_f 83.1 pressure 29.21 humidity 46.5
"1658354934941-0"
> XADD temperatures:us-ny:10007 * temp_f 81.9 pressure 28.37 humidity 43.7
"1658354957524-0"

读取从 ID 开始的前两个流条目`1658354934941-0`
> XRANGE temperatures:us-ny:10007 1658354934941-0 + COUNT 2
1) 1) "1658354934941-0"
   2) 1) "temp_f"
      2) "83.1"
      3) "pressure"
      4) "29.21"
      5) "humidity"
      6) "46.5"
3) 1) "1658354957524-0"
   4) 1) "temp_f"
      2) "81.9"
      3) "pressure"
      4) "28.37"
      5) "humidity"
      6) "43.7"
```
流是一种只能追加的数据结构，每个流条目由一个或多个字段值对组成，有点像记录或 Redis 哈希，每个流的 ID 是唯一的，格式为：`<millisecondsTime>-<sequenceNumber>`，由于其通过时间生成，所以可以使用 xrange 筛选，也可以自己指定 ID
```redis
> XADD somestream 0-1 field value
0-1
> XADD somestream 0-2 foo bar
0-2

# 自动生成sequeceNumber部分序号
> XADD somestream 0-* baz qux
0-3
```
##### Bitmap
位图，可以看作是 string 的拓展，**基于**字符串数据容器，getbit/setbit 会直接操作字符串中的每一个字符（8 位），`set foo bar` 后，字符串被存储为：`01100010(b)01100001(a)01110010(r)`

  ![[Pasted image 20260222145505.png]] 通过 getbit 得到的结果为：
![[Pasted image 20260222145521.png]]  
	这种方法下，一个字符的位置可以存储 8 个状态，通常用于需要记录大量开关，选项，状态的情景：
- 大量用户今天是否登录过->一个位图（本质是一个字符串）中，每一个位存储该位下标对应的用户 id 今天是否登录
- 进行位运算（`BITOP XOR/AND/NOT... result key1 key2`）
##### hyperloglog
用于**基数估计**的概率数据结构，主要用于估算一个数据集中不同元素的数量（即"基数"或"去重后的数量"），通过哈希函数将每个元素映射为二进制串，利用"前导零个数"来估计数据集的基数，可以使用的场景为：
1. **网站流量统计**：统计独立访客数(UV)[9]
2. **广告投放效果评估**：统计广告的独立曝光次数和点击次数[9]
3. **数据库去重统计**：统计某一列的唯一值数量[9]
4. **缓存命中分析**[2](https://ask.csdn.net/questions/8912299)
5. **日志去重**[2](https://ask.csdn.net/questions/8912299)
在 `18,446,744,073,709,551,616 (2^64)` 个成员的集合的基数范围内最多使用 12 KB，并提供 0.81% 的标准误差。
通过 `pfadd` 添加内容，`pfcount` 统计数量
##### bitfield
位域，对一个**无符号 1 位整数到有符号 63 位整数**进行任何原子读、写和增量操作，常用于**管理计数器和类似数值管理**
```redis
# 初始化玩家金币数量为1000
BITFIELD player:1:stats SET u32 #0 1000

# 玩家花费999金币购买道具
BITFIELD player:1:stats INCRBY u32 #0 -999

# 查看剩余金币
BITFIELD player:1:stats GET u32 #0

# 同时管理多个属性
BITFIELD player:1:stats 
  SET u32 #0 1000    # 金币数量
  SET u16 #2 50      # 等级
  SET u8 #6 100      # 生命值
```
- **BITFIELD**: 主命令
- **player:1:stats**: 键名，表示玩家1的统计数据
- **INCRBY**: 子命令，表示对指定位域执行增加操作
- **u32**: 数据类型，表示无符号32位整数
- `#0`: 位域偏移量，，`#0` 表示第 0 个 unsigned int32 ，即在 0~31 位中进行 INCRBY 操作
- **-999**: 要增加的值（这里是减少999）
#### 常用命令
除去各种数据结构的操作命令，对键值对的命令

| 命令及描述                                                                                                                  | 作用                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DEL key`：该命令用于在 key 存在时删除 key。                                                                                        | **删除**指定的键。如果键存在，则将其从数据库中永久移除，返回删除的键数量（通常是1）。如果键不存在，返回0。这个操作是原子性的，对哈希、列表、集合等复杂数据类型也同样适用，会递归删除整个数据结构。                                                                             |
| `DUMP key`：序列化给定 key，并返回被序列化的值。                                                                                        | **序列化**指定键的值，返回一个特殊格式的字符串，这个字符串可以用于后续的 `RESTORE` 命令恢复数据。将Redis内存中的数据结构转换为二进制格式，使用Redis特定的序列化格式（基于RDB格式）生成一个二进制安全的字符串，返回一个序列化后的二进制字符串，格式不是人类可读的（包含不可打印字符）使用 `RESTORE` 命令才能还原为原始数据 |
| `EXISTS key`：检查给定 key 是否存在。                                                                                            | **检查**指定的键是否存在于当前数据库中。返回1表示键存在，返回0表示键不存在。这个命令通常用于在操作键之前验证其是否存在，避免出现空指针错误或意外行为。                                                                                                   |
| `EXPIRE key seconds`：为给定 key 设置过期时间（单位：秒）。                                                                             | **设置**键的生存时间（TTL），以**秒**为单位。经过指定秒数后，键会自动被Redis删除。返回1表示设置成功，0表示键不存在或设置失败。常用于实现会话管理、缓存失效等需要自动清理的场景。                                                                                |
| `EXPIREAT key timestamp`：`EXPIREAT` 的作用和 `EXPIRE` 类似，都用于为 key 设置过期时间。不同于 `EXPIRE` 命令接受的时间参数是 UNIX 时间戳（unix timestamp）。 | **设置**键的过期时间点，使用UNIX时间戳（秒级精度）。键会在指定的时间戳到达时自动删除。与`EXPIRE`的主要区别在于使用绝对时间而非相对时间，适合需要精确时间控制的场景，如定时任务、限时活动等。                                                                           |
| `PEXPIRE key milliseconds`：设置 key 的过期时间以毫秒计。                                                                           | **设置**键的生存时间，以**毫秒**为单位。这是`EXPIRE`命令的毫秒精度版本，提供更精确的时间控制。适用于需要亚秒级精度过期时间的场景，如高频缓存、实时统计等。                                                                                            |
| `PEXPIREAT key milliseconds-timestamp`：设置 key 过期时间的时戳（unix timestamp）以毫秒计。                                             | **设置**键的过期时间点，使用UNIX时间戳（毫秒级精度）。这是`EXPIREAT`的毫秒精度版本，提供更高精度的时间控制。适用于需要精确到毫秒的定时任务，如分布式锁、精确延迟队列等。                                                                                    |
| `KEYS pattern`：查找所有符合给定模式（pattern）的 key。                                                                               | **查找**所有匹配指定模式（支持glob样式模式）的键。支持的通配符包括：`*`（匹配任意多个字符）、`?`（匹配单个字符）、`[abc]`（匹配括号内的任意字符）。**警告**：在生产环境谨慎使用，因为它会遍历所有键，可能阻塞Redis服务器，影响性能。                                                |
| `MOVE key db`：将当前数据库的 key 移动到给定的数据库 db 当中。                                                                             | **移动**键从当前数据库到指定的目标数据库。成功返回1，失败返回0（通常是因为键不存在或在目标数据库中已存在）。Redis默认有16个数据库（0-15），这个命令允许在不同数据库之间迁移数据。                                                                                |
| `PERSIST key`：移除 key 的过期时间，key 将持久保持。                                                                                  | **移除**键的过期时间设置，使其变为永不过期的键。成功返回1，失败返回0（通常是因为键不存在或原本就没有设置过期时间）。常用于将临时数据转为永久数据，或者取消原本设置的过期时间。                                                                                       |
| `PTTL key`：以毫秒为单位返回 key 的剩余的过期时间。                                                                                      | **获取**键剩余的生存时间，以**毫秒**为单位。返回剩余毫秒数；返回-1表示键存在但没有设置过期时间；返回-2表示键不存在。提供比`TTL`更高精度的过期时间查询，适用于需要精确时间控制的场景。                                                                              |
| `TTL key`：以秒为单位，返回给定 key 的剩余生存时间（TTL, time to live）。                                                                   | **获取**键剩余的生存时间，以**秒**为单位。返回剩余秒数；返回-1表示键存在但没有设置过期时间；返回-2表示键不存在。常用于监控缓存有效期、实现自动刷新等场景。                                                                                              |
| `RANDOMKEY`：从当前数据库中随机返回一个 key。                                                                                         | **随机返回**当前数据库中的一个键名。如果数据库为空，返回`nil`。常用于需要随机抽样键的场景，如测试、数据分析、负载均衡等。不保证返回所有键的均匀分布，但返回非空键的概率与键的数量成正比。                                                                                |
| `RENAME key newkey`：修改 key 的名称。                                                                                        | **重命名**键的名称。如果新键名已存在，会**覆盖**原值。总是返回`OK`，即使原键不存在（此时会创建新键）。这个操作是原子性的，但需要注意覆盖风险，特别是在高并发环境下。                                                                                         |
| `RENAMENX key newkey`：仅当 newkey 不存在时，将 key 改名为 newkey。                                                                 | **安全重命名**键的名称，仅当新键名**不存在**时才执行重命名。返回1表示重命名成功，0表示新键名已存在。这个命令避免了`RENAME`可能的数据覆盖问题，适合需要确保不覆盖现有数据的场景。                                                                                |
| `TYPE key`：返回 key 所储存 z的值的类型。                                                                                          | **返回**键存储的值的类型。可能的返回值包括：`string`（字符串）、`list`（列表）、`set`（集合）、`zset`（有序集合）、`hash`（哈希表）、`stream`（流）、`none`（键不存在）。这对于动态处理不同数据类型、类型检查、路由逻辑等场景非常有用。                                     |

# Docker
参考: 
- Geekhour 30 mins Docker
- 【狂神说Java】Docker最新超详细版教程通俗易懂_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1og4y1q7M4/?spm_id_from=333.337.search-card.all.click&vd_source=876be08bc9c030f4a9ea1fb97e0d0342)
## CI/CD 简介
CI/CD 是持续集成（Continuous Integration）和持续部署（Continuous Deployment）或持续交付（Continuous Delivery）的缩写，是现代软件开发中用于自动化软件发布流程的方法论。

1. **持续集成（CI）**：开发人员频繁地（通常是每天多次）将代码变更合并到共享仓库中。每次合并后，自动运行构建和测试，以确保新代码不会破坏现有功能。这有助于早期发现和解决集成问题。
2. **持续交付（CD）**：在持续集成的基础上，确保软件可以快速且稳定地发布到生产环境。这意味着每次代码变更通过所有测试后，都可以立即部署到生产环境。
3. **持续部署**：是持续交付的进一步延伸，它自动将通过所有测试的代码变更部署到生产环境，无需人工干预。
## Docker 简介
![Pasted image 20240913205607.png](Pasted%20image%2020240913205607.png)
将各种应用程序打包成一个个“集装箱”，通过图标上的鲸鱼运动到任何需要的地方
将软件运行所需要的所有依赖文件封装在一起，配置好所有内容只等一键使用
![Pasted image 20240913205809.png](Pasted%20image%2020240913205809.png)
![Pasted image 20240913205908.png](Pasted%20image%2020240913205908.png)
## Docker 和虚拟机的区别
![Pasted image 20240913211152.png](Pasted%20image%2020240913211152.png)
### 虚拟机
Windows，macos 等都是完整的操作系统，在这些操作系统中虚拟化环境通过 hypervisor 虚拟化功能创建虚拟机，创建虚拟的运行环境
![Pasted image 20240913210101.png](Pasted%20image%2020240913210101.png)
- 虚拟机可以将一台物理机的资源分配给多个虚拟机，同时提供多个环境或服务
- 缺点是需要重复占用硬件资源，启动资源
- 每个软件需要不同的环境，一个环境一个虚拟机，启动所有软件相当于启动所有操作系统的全部功能
![Pasted image 20240913210144.png](Pasted%20image%2020240913210144.png)

### Docker
Docker 和容器（container）不是一个概念，容器只有应用程序和依赖文件
**Docker 和容器的区别**：
- **容器（Container）**：容器是一种轻量级、独立的软件打包技术，它允许将应用程序及其依赖打包成一个**可移植**的单元。容器共享宿主机的操作系统内核，因此不需要像虚拟机那样包含完整的操作系统，这使得它们更加轻便和启动迅速。
- **Docker**：Docker 使用容器技术来创建、管理和部署应用程序。Docker 提供了创建和管理容器的工具和 API，使得容器化技术更加易于使用和普及。
**容器的工作原理**：
- 容器**之间**共享宿主机的操作系统内核，但每个容器都有自己的文件系统、CPU、内存等资源的隔离视图。这种隔离确保了容器的轻量级和高效性。
**Docker 的容器管理**：
- Docker 并不“启动操作系统的哪些部分功能”，而是利用宿主机的操作系统内核来运行容器。Docker 守护进程（daemon）负责管理容器的生命周期，包括创建、启动、停止和删除容器。Docker 使用镜像（image）作为容器的模板，这些镜像是只读的，并在创建容器时生成一个可写的层。

## 基本原理和概念
Docker 中
- **镜像**是一个只读的模板
- **容器**是 Docker 的运行实例
	-  可以用编程语言理解：镜像是类创建的模板，有各种功能和属性，通过镜像设置不同的属性和功能实例化得到多个容器
- **仓库**用来分享模板，常用的是 Dockerhub

安装配置
- 使用下面代码可以更改安装位置
`start /w "" "Docker Desktop Installer.exe" install --installation-dir=D:\Program\Docker
`
- 安装后在系统设置中启动 Docker，设置中开启 *hyper-v*功能后可以在命令行中使用 Docker 代码
## Docker 运行逻辑
![Pasted image 20240913212559.png](Pasted%20image%2020240913212559.png)
- docker daemon 是服务端守护进程，用来管理服务端资源，client 中操作（终端输入 docker 指令）由 client 发送给 docker daemon 处理后将返回结果发送回 client（执行结果）
- docker daemon 是一个后台服务进程，类似 mysql 80
- client 和 docker host 之间通过 socket 或 restful API 通信
## 容器化和 dockerfile
![Pasted image 20240913213157.png](Pasted%20image%2020240913213157.png)
dockerfile 是镜像创建指导文件，告诉 docker 如何创建这个程序的操作系统环境（一般是精简的）、第三方库、依赖文件、编译器、环境变量等
## 虚拟化技术和容器化技术对比
### 虚拟化技术
- 资源占用十分多
- 冗余步骤多
- 启动很慢
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/7eb113eb1ed9cc907df7315bf90c533f.png)
### 2.2. 容器化技术
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/adcfb944932bd422b28408162e221515.png)

### 比较 Docker 和虚拟化技术的不同

- 传统虚拟机，虚拟出一条硬件，运行完整的操作系统，在这个系统上安装和运行软件
- 容器内的应用直接运行在宿主机的内部，容器没有自己的内核的，也没有虚拟硬件，所以轻便
- 每个容器间是相互隔离的，每个容器内都有一个属于自己的文件系统，互不影响
- 应用更快速的交互和部署
    - 传统：一堆帮助文档，安装程序
    - Docker： 打包镜像发布测试，一键运行
- 更便捷的升级和扩缩容
- 更简的系统运维
- 更高效的计算资源利用
![Pasted image 20241019113309.png](Pasted%20image%2020241019113309.png)

### 3. 名词解释

- 镜像（image）
    - Docker 镜像就好比是一个模板，可以通过这个模板来创建容器服务，tomcat 镜像 ===> run ===> tomcat01 容器，通过这个镜像可以创建多个容器（最终服务运行或者项目运行就是在容器中）
- 容器（container）
    - Docker 利用容器技术，独立运行一个或者一组应用，通过镜像来创建的
    - 启动，停止，删除，基本命令！
    - 就目前可以把这个容器理解为一个建议的 linux 系统
- 仓库（repository）
    - 存放镜像的地方
    - Docker Hub（默认是国外的）
    - 阿里云,,,都有容器服务（配置镜像加速！）

### 4. 阿里云镜像加速
1. 登录阿里云服务器，找到 `容器镜像服务`
2. 设置 Registry 登录密码
3. 找到镜像加速器
4. 配置使用

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://pi9dpp60.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```
# IDEs
## Vscode
### intellisense 图标含义
参考文档：[IntelliSense](https://code.visualstudio.com/docs/editor/intellisense)
![[Pasted image 20250307144859.png]]
## visual Studiio 
### intellisense 图标含义
[Class View and Object Browser Icons - Visual Studio 2017 | Microsoft Learn](https://learn.microsoft.com/zh-cn/previous-versions/visualstudio/visual-studio-2017/ide/class-view-and-object-browser-icons?view=vs-2017&viewFallbackFrom=vs-2019&redirectedfrom=MSDN)
![[Pasted image 20250307145219.png]]
![[Pasted image 20250307145230.png]]