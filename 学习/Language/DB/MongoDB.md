# 基本概念
## 数据结构
### capped collections
Capped collections 就是固定大小的 collection。
它有很高的性能以及队列过期的特性(过期按照插入的顺序)，自动的维护对象的插入顺序。它非常适合类似记录日志的功能，假设你创建了一个 100MB 的集合，MongoDB 会立刻在硬盘上划出这 100MB 的地盘。数据按顺序往里写，**一旦写满了 100MB，新数据会覆盖掉最老的数据**
由于一开始磁盘上存储 capped collection 的位置就是固定的，所以不需要向操作系统申请磁盘块，满了就从开头重新录入
文档更新不能超过过原来的大小，因为环形结构本质上是连续存储空间，变长会导致数据需要搬运
```js
db.createCollection("mycoll", {capped:true, size:100000})
```
- 在 capped collection 中，你能添加新的对象。
- 能进行更新，但修改之后的 document 大小不能变大
- 使用 Capped Collection 不能删除一个文档，可以使用 drop() 方法删除 collection 所有的行。
- 删除之后，你必须显式的重新创建这个 collection。
- 在 32bit 机器中，capped collection 最大存储为 1e9( 1X109)个字节（1GB）
### Document id Field
ObjectId 类似唯一主键，可以很快的去生成和排序，包含 12 bytes
- 前 4 个字节表示创建 **unix** 时间戳,格林尼治时间 **UTC** 时间
- 接下来的 3 个字节是机器标识码
- 紧接的两个字节由进程 id 组成 PID
- 最后三个字节是随机数
![[Pasted image 20260725103541.jpg]]

## 操作方法
### 类 JDBC 的连接方式
```url
mongodb://[username:password@]host1[:port1][,...hostN[:portN]][/[defaultauthdb][?options]]
```
- 这是标准的 TCP 连接协议
- 添加的 srv 是 mongodb 自定义的协议支持，添加后本质是启用了 **“端口委托”**——把端口号的配置权交给了 **运维（DNS 管理员）**，服务器端向域名服务器报告自己的 DNS 配置，说明 `cluster0.alxatjn.mongodb.net` 的主机地址和端口号
- srv 记录是一张表，在 dns 服务器中由服务端维护每个域名映射的 IP 和端口，服务端需要使用类似域名解析服务注册这个域名。当一台主机上运行多个 mongodb 服务在不同端口则需要管理好 srv
- `appName` 参数向服务器说明客户端身份，仅作标识使用
- `retryWrites=true`：写操作失败时自动重试（Atlas 默认开启）。
- `w=majority`：写关注级别，确保数据写入大多数节点后才返回。
- `readPreference=secondaryPreferred`：读取时优先从从库读。
### 集合属性
```js
db.createCollection("myComplexCollection", {
  capped: true,
  size: 10485760,
  max: 5000,
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["name", "email"],
    properties: {
      name: {
        bsonType: "string",
        description: "必须为字符串且为必填项"
      },
      email: {
        bsonType: "string",
        pattern: "^.+@.+$",
        description: "必须为有效的电子邮件地址"
      }
    }
  }},
  validationLevel: "strict",
  validationAction: "error",
  storageEngine: {
    wiredTiger: { configString: "block_compressor=zstd" }
  },
  collation: { locale: "en", strength: 2 }
});
```
集合具有以下特性：
- 固定大小，最大 10MB，最多存储 5000 个文档。
- 文档必须包含 `name` 和 `email` 字段，其中 `name` 必须是字符串，`email` 必须是有效的电子邮件格式。
- 验证级别为严格，验证失败将阻止插入或更新。
- 使用 WiredTiger 存储引擎，指定块压缩器为 zstd。
- 默认使用英语排序规则。
- 每一个集合必须拥有一个**独一无二的名称**，由开发者维护，使用 `db.getCollectionNames()` 列出所有名称
- 集合重命名在底层是一个较为复杂的操作，执行 `renameCollection` 命令需要具有对源数据库和目标数据库的适当权限。通常需要 `dbAdmin` 或 `dbOwner` 角色
	1. dropTarget: true 如果 `targetDb.targetCollection` 已经存在，则强制删除这个现有的目标集合，然后再执行重命名操作。源集合的数据会“覆盖”到目标位置（实际上是移动）。
	2. dropTarget: false 如果 `targetDb.targetCollection` 已经存在，则拒绝重命名操作。抛出错误，中断操作
```js
db.adminCommand({
  renameCollection: "sourceDb.sourceCollection",
  to: "targetDb.targetCollection",
  dropTarget: <boolean>
})
```
- 插入文档使用 `insertOne/insertMany(document， options)`，大量文档插入如果希望出错不影响后面的操作，不中断插入，在 option 参数中填入 `{ordered: false}`
- 更新文档使用 `updataOne/updateMany(filter, update, options)`
- 删除使用 `deleteOne/deleteMany/findOneAndDelete(filter, opitons)`
- 查找使用 `db.collection.find(query, projection)`，其中 query 使用聚合语句/正则表达式，projection 描述需要投影的字段
```js
db.myCollection.find(
    { age: { $gt: 25 } },
    { name: 1, age: 1, _id: 0 }
);
```
### 操作符
参考: https://www.runoob.com/mongodb/mongodb-operators.html
