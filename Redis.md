mysql 的 sql 关系型数据库和 NoSQL 的区别
![[Pasted image 20250813162457.png]]

配置文件中各个值是什么意思：[Redis 配置文件详解](https://redis.com.cn/redis-configuration.html)
所有 redis 代码在执行时都是单线程的，6.0 版本以上的网络请求是多线程的。
![[Pasted image 20250813163032.png]]
基本数据类型
![[Pasted image 20250813175429.png]]
进入 redis 之后使用 `help@<group_name>` 可以查询对应**组**中的文档
![[Pasted image 20250813180257.png]]
分组之后再使用一次 `help command_name` 即可对当前组中内容进行筛选
![[Pasted image 20250813180331.png]]
常用命令

| 序号  | 命令                                                                               | 描述                                                                                           |
| --- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | [DEL key](https://www.redis.net.cn/order/3528.html)                              |  该命令用于在 key 存在是删除 key。                                                                       |
| 2   | [DUMP key](https://www.redis.net.cn/order/3529.html)                             |  序列化给定 key ，并返回被序列化的值。                                                                       |
| 3   | [EXISTS key](https://www.redis.net.cn/order/3530.html)                           |  检查给定 key 是否存在。                                                                              |
| 4   | [EXPIRE key seconds](https://www.redis.net.cn/order/3531.html)                   | 为给定 key 设置过期时间。                                                                              |
| 5   | [EXPIREAT key timestamp](https://www.redis.net.cn/order/3532.html)               |  EXPIREAT 的作用和 EXPIRE 类似，都用于为 key 设置过期时间。 不同在于 EXPIREAT 命令接受的时间参数是 UNIX 时间戳(unix timestamp)。 |
| 6   | [PEXPIRE key milliseconds](https://www.redis.net.cn/order/3533.html)             |  设置 key 的过期时间亿以毫秒计。                                                                          |
| 7   | [PEXPIREAT key milliseconds-timestamp](https://www.redis.net.cn/order/3534.html) |  设置 key 过期时间的时间戳(unix timestamp) 以毫秒计                                                        |
| 8   | [KEYS pattern](https://www.redis.net.cn/order/3535.html)                         |  查找所有符合给定模式( pattern)的 key 。                                                                 |
| 9   | [MOVE key db](https://www.redis.net.cn/order/3536.html)                          |  将当前数据库的 key 移动到给定的数据库 db 当中。                                                                |
| 10  | [PERSIST key](https://www.redis.net.cn/order/3537.html)                          |  移除 key 的过期时间，key 将持久保持。                                                                     |
| 11  | [PTTL key](https://www.redis.net.cn/order/3538.html)                             |  以毫秒为单位返回 key 的剩余的过期时间。                                                                      |
| 12  | [TTL key](https://www.redis.net.cn/order/3539.html)                              |  以秒为单位，返回给定 key 的剩余生存时间(TTL, time to live)。                                                  |
| 13  | [RANDOMKEY](https://www.redis.net.cn/order/3540.html)                            |  从当前数据库中随机返回一个 key 。                                                                         |
| 14  | [RENAME key newkey](https://www.redis.net.cn/order/3541.html)                    |  修改 key 的名称                                                                                  |
| 15  | [RENAMENX key newkey](https://www.redis.net.cn/order/3542.html)                  |  仅当 newkey 不存在时，将 key 改名为 newkey 。                                                           |
| 16  | [TYPE key](https://www.redis.net.cn/order/3543.html)                             |  返回 key 所储存的值的类型。                                                                            |
string 常用命令
![[Pasted image 20250813183653.png]]

嵌套 redis 数据创建：
```bash
# 存储
HMSET user:1 profile:firstName "Lily"
HMSET user:1 profile:lastName  "Evans"
HMSET user:1 address:city      "London"
HMSET user:1 address:country   "UK"

# 查询“姓”
HGET user:1 profile:lastName
=> "Evans"

# 想只删 profile 里的 firstName？
# 抱歉，只能删除 field，不能递归删节点；完整 profile 是个 field，所以得：
HDEL user:1 profile:firstName

# 想整用户扔库：
DEL user:1                # 整条 key 就没了
```
创建语句创建出的 json 结构为：
```json
{
  "user:1": {
    "profile": {
      "firstName": "Lily",
      "lastName": "Evans"
    },
    "address": {
      "city": "London",
      "country": "UK"
    }
  }
}
```
使用 `:` 分割字段，既然如此可以使用 redis 的 json 模块直接创建类似 json 结构化数据
```bash
# 1. 存储嵌套 JSON
JSON.SET user:1 $ '{
  "profile": {
    "firstName": "Lily",
    "lastName":  "Evans"
  },
  "address": {
    "city":    "London",
    "country": "UK"
  }
}'

# 2. 精确查询
JSON.GET user:1 $.profile.lastName
=> ["Evans"]

# 3. 只删 profile 里的 lastName
JSON.DEL user:1 $.profile.lastName

# 4. 再查询
JSON.GET user:1 $.profile
=> {"firstName":"Lily"}   # lastName 已被删除

# 5. 删整个文档也一样
DEL user:1          # 会把整条 key 删除
```
redis 中的 hash 结构
![[Pasted image 20250813221222.png]]
使用事务
事务的创建是为了保证 ACID 中的**原子性**
- 客户去银行把卡里的 100 块钱转给朋友。营业员先查余额 100，然后到后台填单准备-100。  
- 就在他敲字儿的几秒钟里，客户用微信偷偷花了 50（别人也改了这个账户）。  
- 营业员再提交：余额从 100 变成 50，扣了 100 → 超支。
从开始 watch 某个变量开始，只要这个变量（或者说键值对）发生变化，事务就会被中断，回滚到事务开始之前，本质上是**乐观锁**

示例代码：
```bash
WATCH balance:123          # 1. 设置报警器
current = GET balance:123  # 2. 读最新值（此时 100）
if current < 100:
    UNWATCH                # 3. 余额不足，没事务了
    return "余额不足"

MULTI                      # 4. 开事务
DECRBY balance:123 100     # 5. 准备转账 100
EXEC                     # 6. 只要 balance:123 没变就会成功返回 [90]
                         #    被别人改过了就返回 nil，我们知道重试
```
事务编写
```cpp
127.0.0.1:6379> multi
OK
127.0.0.1:6379(TX)> set book-name "master C++ in 21 days"
QUEUED
127.0.0.1:6379(TX)> get book-name
QUEUED
127.0.0.1:6379(TX)> sadd tag "C++" "Programing Language" "Master series"
QUEUED
127.0.0.1:6379(TX)> smembers tag
QUEUED
127.0.0.1:6379(TX)> exec
1) OK
2) "master C++ in 21 days"
3) (integer) 3
4) 1) "C++"
   5) "Programing Language"
   6) "Master series"
```

注意事项：
- **只对被 WATCH 的 key 敏感**，事务里新增的 key 不受约束。
- **事务执行前必须连着同一个连接**；中间换了连接，redis 宕机，clien 断开或重新订阅都失效。

## C++ Redis 连接示例
### 临时 tcp 连接
代码参考 [[C++ practice case#tcp 连接 redis]]
这种方式直接通过 tcp 连接到主机，进入 6379 端口后就会直接到达 redis-client 交互界面，通过 `make_resp` 函数将 `vector<string>` 包裹的命令转化为命令行输入。
`net::write` 将命令输入到终端，`socket.readsome` 将命令输出读取
### boost. redis 连接
```cpp

连接之前需要注意：
- 服务器安全组放开 6379 端口
- redis.conf 文件中将 bind 设置为需要连接主机的 ip 地址，或者设置为 `0.0.0.0` 允许所有 ip 介入 redis 服务
- 使用 `ufw status | grep 6379` 检查防火墙是否允许 6379 端口流量进入，如果没有则使用
```bash
ufw allow 6379/tcp
systemctl restart ufw
```
放行并重启防火墙（ufw[^1]）


[^1]: `ufw`（Uncomplicated Firewall）是一个用户友好的前端界面，用于管理 `iptables` 防火墙规则。它是为了简化 `iptables` 过复杂的规则和命令而设计的。