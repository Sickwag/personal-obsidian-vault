mysql 的 sql 关系型数据库和 NoSQL 的区别
![[Pasted image 20250813162457.png]]

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