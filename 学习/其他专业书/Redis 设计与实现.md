---
参考: " Redis设计与实现 (数据库技术丛书) 机械工业出版社"
created: 2026-06-12
---
# 第一部分数据结构与对象
Redis 数据库里面的每个键值对(key-value pair)都是由对象(object)组成的，其中:
- 数据库键总是一个字符串对象(string object);
- 而数据库键的值则可以是字符串对象、列表对象(list object)、
- 哈希对象(hash object)、集合对象(set object)、有序集合对象(sorted set object)这五种对象中的其中一种。
## 第 2 章简单动态字符串
### 数据结构
![[Pasted image 20260612165138.png]] 
- len 只记录字符串长度
- free 只记录空位置长度
- buffer 空间总长度= len+free+1（`\0`）
```cpp
struct sdshdr {
	// buf 中已占用空间的长度
	int len;
	// buf 中剩余可用空间的长度
	int free;
	// 数据空间
	char buf[];
};
```
### 二进制安全
C 字符串中的字符必须符合某种编码(比如 ASCII)，并且除了字符串的末尾之外，字符串里面不能包含空字符，否则最先被程序读入的空字符将被误认为是字符串结尾，这些限制使得 C 字符串只能保存文本数据，而不能保存像图片、音频、视频、压缩文件这样的二进制数据。
C 字符串和 SDS 之间的区别

| C 字符串                      | SDS                        |
| -------------------------- | -------------------------- |
| 获取字符串长度的复杂度为 $O(N)$        | 获取字符串长度的复杂度为 $O(1)$        |
| API 是不安全的，可能会造成缓冲区溢出       | API 是安全的，不会造成缓冲区溢出         |
| 修改字符串长度 N 次必然需要执行 N 次内存重分配 | 修改字符串长度 N 次最多需要执行 N 次内存重分配 |
| 只能保存文本数据                   | 可以保存文本或者二进制数据              |
| 可以使用所有 <string.h> 库中的函数    | 可以使用一部分 <string.h> 库中的函数   |
### SDS 操作 API
源码中的计算长度操作需要前置知识 [[C++ Runoob Tutoral#sizeof 运算符]] 和 [[C++开发范式和术语#VLA 与 POD 类型]]
```cpp
void *zmalloc(size_t size);          // 分配 size 字节，等价于 malloc + 额外统计
void *zcalloc(size_t size);          // 分配 size 字节并清零，等价于 calloc(1, size)
void *zrealloc(void *ptr, size_t size); // 调整大小，等价于 realloc
void zfree(void *ptr);               // 释放，等价于 free（如果支持，会返回已释放的大小）
```
与标准版库版本对比:

| 函数         | 对应标准函数    | 附加行为                                                                         |
| ---------- | --------- | ---------------------------------------------------------------------------- |
| `zmalloc`  | `malloc`  | 分配内存后更新**内存使用统计计数器**；若分配失败，调用 `zmalloc_oom_handler()`（默认是 `exit(1)`，即直接终止进程） |
| `zcalloc`  | `calloc`  | 同上，但分配的内存初始化为 0（通过 `calloc` 或手动 `memset`）                                    |
| `zrealloc` | `realloc` | 调整大小，同时更新统计计数；失败时同样 OOM 终止                                                   |
| `zfree`    | `free`    | 释放内存，更新统计计数；在某些实现下（如 jemalloc），还能获得实际释放的字节数用于统计                              |

所有 `z*` 函数都内置了：
1. **全局内存使用量统计**（使用 `atomic` 或锁保护的 `used_memory` 变量）。
2. **内存分配失败时的统一处理**（不是返回 NULL，而是直接 `abort()` 或 `exit()`）。
3. 标准 `malloc` 失败时返回 `NULL`，但**调用方通常不检查**，或检查后不知道如何处理（继续运行可能导致更严重的错误）。
4. 在 Redis 这种高可靠性系统中，**内存耗尽已经是灾难性状态**，最好的做法是**立即终止**，而不是让错误 propagate（传播）导致数据损坏或死锁。
**解决方案**：`zmalloc` 内部判断返回值，如果为 NULL，则调用 `zmalloc_oom_handler`（默认是 `exit(1)`，可以用户自定义）。这样**分配失败 = 进程退出**，绝不会返回 NULL。
- Redis 需要知道 **“当前总共用了多少内存”**，用于 `INFO memory`、内存淘汰（eviction）、`maxmemory` 限制等。
- 标准 `malloc` 家族不提供任何跨平台的可移植接口来获取已分配字节数。`malloc_usable_size()` 或 `malloc_size()` 是平台相关的。
## 第 3 章链表
### 链表的结构
![[Pasted image 20260613141023.png]]
- listNode 是经典的 prev+next 双指针+value 值的简单组合
- dup 函数用于复制链表节点所保存的值;
- free 函数用于释放链表节点所保存的值;
- match 函数则用于对比链表节点所保存的值和另一个输入值是否相等。
总体特点是: 双端，无环（头尾空指针指向 NULL），`O(1)` 访问头尾指针，带有链表长度计数器
### API 和代码编写

adlist 的接口设计体现了 **C89/99 时代** 函数与宏的明确边界：

| 分类 | 代表操作 | 原因 |
|------|---------|------|
| **函数**（adlist.c） | `listCreate`, `listAddNodeHead`, `listDelNode`, `listDup`, `listSearchKey` | 涉及分支、内存分配、指针修改等复杂逻辑，需要类型检查和可调试性 |
| **宏**（adlist.h 93~128 行） | `listLength`, `listFirst`, `listLast`, `listPrevNode`, `listNodeValue` | 单表达式直接读 struct 字段，O(1) 零开销，常出现在循环热路径中 |

**为什么不用 `inline` 函数**？
- C89 标准无 `inline` 关键字
- C99 的 `inline` 语法复杂：要求在恰好一个编译单元中提供外部定义，ODR 原则还没有完善，（多定义，无定义等情况）容易引起链接报错
- Redis 追求极致的跨平台可移植性，无法依赖编译器对 `inline` 的支持
**为什么 getter/setter 不用函数而是宏**？
- `listLength(l)` 展开为 `(l)->len`，完全零开销
- 在遍历循环等热路径中可省去一次函数调用（栈帧建立+返回）
- 这些宏只涉及参数 `l` 或 `n` 的一次求值，不存在经典宏副作用问题
**宏的命名空间污染问题**：
Redis 是独立应用而非库，不存在污染外部代码的风险；所有宏均有 `list` 前缀，冲突概率极低。这是 2009 年 C 项目的通行做法（Linux 内核、nginx 等均如此）。

**如果用现代 C/C++ 重写**：
```c
// 现代 C — static inline
static inline unsigned long listLength(list *l) { return l->len; }

// C++ — 成员函数
class List {
    unsigned long len() const { return len_; }
};
```
Redis 4.0+ 已经开始逐步将热路径宏转为 `static inline` 函数。
## 第 4 章字典
### 数据结构
![[Pasted image 20260613145457.png]] ![[Pasted image 20260613145529.png]]
```cpp
typedef struct dictType {
	unsigned int (*hashFunction)(const void* key);
	void* (*keyDup)(void* privdata, const void* key);
	void* (*valDup)(void* privdata, const void* obj);
	int (*keyCompare)(void* privdata, const void* key1, const void* key2);
	void (*keyDestructor)(void* privdata, void* key);
	void (*valDestructor)(void* privdata, void* obj);
} dictType;
```
dictType 是一个"多态结构体"，用非常细致的粒度，判断两个哈希表中的元素是否相等，如何计算哈希值，决定了一个哈希表中的元素应该放在 `dict::ht[2][0]::table;` 中的什么位置
一个普通状态下(没有进行 rehash)的字典。
![[Pasted image 20260613150852.png]]

### sizemask — power-of-two 哈希表显式约束
哈希表数据结构:
```cpp
typedef struct dictht {
	// 哈希表数组
	dictEntry** table;
	// 哈希表大小
	unsigned long size;
	// 哈希表大小掩码，用于计算索引值
	// 总是等于 size - 1
	unsigned long sizemask;
	// 该哈希表已有节点的数量
	unsigned long used;
} dictht;
typedef struct dict {
	// 类型特定函数
	dictType* type;
	// 私有数据
	void* privdata;
	dictht ht[2];
	// rehash 索引
	// 当 rehash 不在进行时，值为 -1
	int rehashidx; /* rehashing not in progress if rehashidx == -1 */
	// 目前正在运行的安全迭代器的数量
	int iterators; /* number of iterators currently running */
} dict;
```
- ht 是哈希表存储数据的位置，一般情况下，字典只使用 ht[0]哈希表，ht[1]哈希表只会在对 ht[0]哈希表进行 rehash 时使用
- Redis 通过 `_dictNextPower` 保证 `size` 永远是 2 的 N 次方（从 4 开始不断 ×2），因此 `sizemask = size - 1` 是低 N 位全 1 的位掩码。所有索引计算均使用位运算：
```cpp
idx = h & d->ht[table].sizemask;  // 等价于 h % size，位运算比取模快一个数量级（取模在 x86 上需要 div/idiv 指令 ~20-80 cycles，AND 只要 1 cycle）
```
**sizemask 的核心价值**不是性能（位运算比除法快是附带收益），而是将 power-of-two 约束显式化。看到 `sizemask` 就知道"此哈希表必须 2^N"，避免各处书写 `hash & (size - 1)` 时遗漏 `-1` 导致越界，同时很多地方需要用到 `hash & (size - 1)` ，存起来可以省去一次减法的开销
### 哈希算法
Redis 使用 murmur2 哈希生成算法，并采用链地址法(separate chaining)来解决键冲突，并且出现冲突时，后插入的节点会在链表头部插入
![[Pasted image 20260613154142.png]]
![[Pasted image 20260613154157.png]]
### rehash 流程与逻辑
步骤为:
10. 为字典的 ht[1]哈希表分配空间，这个哈希表的空间大小取决于要执行的操作,
	- 如果执行的是扩展操作，那么 ht[1]的大小为第一个大于等于 $ht[0].used*2^n$
	- 如果执行的是收缩操作，那么 ht[1]的大小为第一个大于等于  $ht[0].used*2^{n+1}$
11. 将保存在 ht[0]中的所有键值对 rehash 到 ht[1]上
12. 当 ht[0]包含的所有键值对都迁移到了 ht[1]之后(ht[0]变为空表),释放 ht[0]
13. 将 ht[1]设置为 ht[0],并在 ht[1]新创建一个空白哈希表，为下一次 rehash 做准备（交换指针）
当以下条件中的任意一个被满足时，触发 rehash，和 [[C++ Runoob Tutoral#负载因子触发 rehash|std::unordered_XXX]] 一样，由负载因子阈值决定是否引发 rehash
- 服务器目前没有在执行 BGSAVE 命令或者 BGREWRITEAOF 命令，并且负载因子大于等于 1。
- 服务器目前正在执行 BGSAVE 命令或者 BGREWRITEAOF 命令，并且负载因子大于等于 5。
- 负载因子小于 0.1 时，程序自动开始对哈希表执行收缩操作。
- 
### 渐进式 rehash
dict 结构体中的 `rehashidx` 字段控制 rehash 流程：
```cpp
#define dictIsRehashing(ht) ((ht)->rehashidx != -1)

看 dictRehash（dict.c:344-413）的迁移循环：
开始: rehashidx = 0
         │
         ▼
  跳过空桶 ←──── 如果 table[rehashidx] == NULL，rehashidx++
         │
         ▼
  迁移整个链表  → 把 table[rehashidx] 上的所有节点
         │        重算 hash & ht[1].sizemask → 插入 ht[1]
         │
         ▼
  rehashidx++  → 指向下一个桶
         │
         ▼
  ht[0].used == 0? ──否──→ 返回 1，下次继续
         │
         是
         │
         ▼
  释放 ht[0].table
  ht[0] = ht[1]        ← 把新表升为 0 号表
  _dictReset(&ht[1])
  rehashidx = -1        ← 关闭 rehash 标志

```
**渐进式 rehash 的完整流程**：
1. `dictExpand` 创建更大的 ht[1]，设置 `rehashidx = 0` 开启 rehash
2. 每次 CRUD 操作调用 `_dictRehashStep(d, 1)` 迁移 1 个桶
3. 定时器调用 `dictRehashMilliseconds`，每次至多跑 1ms
4. ht[0].used 归零时，释放 ht[0]，将 ht[1] 升为主表，重置 rehashidx = -1
**rehash 期间的关键规则**：
5. 新键只插入 ht[1]（dict.c:546）：`ht = dictIsRehashing(d) ? &d->ht[1] : &d->ht[0];`，避免刚插入 ht[0] 的键马上又要被搬走。
6. 在 rehash 进行期间，每次对字典执行添**加、删除、查找或者更新操作**时，程序除了执行指定的操作以外，还会顺带将 ht[0]哈希表在rehashidx 索引上的所有键值对 rehash 到 ht[1],当 rehash 工作完成之后，程序将 rehashidx 属性的值增一。
7. 查找要查两个表（dict.c:825-846）：遍历完 ht[0] 找不到，如果还在 rehash 则继续查 ht[1]。
8. dictRehashMilliseconds（dict.c:433-446）：定时器里每次挪 100 步，限制耗时不超过 1ms，保证不会因为 rehash 卡住事件循环。
9. 不安全的迭代器（`fingerprint` 校验）禁止在 rehash 时修改字典
**为什么不分批一次性搬完？**
Redis 是单线程事件循环，大批量 rehash 会阻塞事件处理。1ms 的时间预算保证即使迁移数百万 key，每次停顿也不超过 1ms。
## 第 5 章 跳跃表
### 数据结构
经典代码实现参考 [[DevFoundations#SkipList-CPP]]
跳跃表支持平均 O(logN)、最坏 O(N)复杂度的节点查找，还可以通过顺序性操作来批量处理节点。
在大部分情况下，跳跃表的效率可以和平衡树相媲美，并且因为跳跃表的实现比平衡树要来得更为简单，所以有不少程序都使用跳跃表来代替平衡树。
Redis 在两个地方用到了跳跃表，一个是实现有序集合键，另一个是在集群节点中用作内部数据结构
![[Pasted image 20260613163127.png]]
![[Pasted image 20260613163754.png]]
- 节点的分值(score 属性)是 double 浮点数，跳跃表中的所有节点都按分值从小到大来排序。
- 节点的成员对象(obj 属性)是指针，它指向一个字符串对象，保存着一个 SDS 值。
- 在同一个跳跃表中各个节点保存的成员对象必须是唯一的，但是多个节点保存的分值可以相同:分值相同的节点将按照成员对象在字典序中的大小来进行排序，**两者共同构成，所以本质上还是不允许插入重复元素的**，只是 score 作为查找/比较的优先级比 obj 要高
所有 zskiplistNode 通过 zskiplist 统一管理
```cpp
typedef struct zskiplist {
	struct zskiplistNode *header, *tail;
	unsigned long length;
	int level;
} zskiplist;
```
和[[DevFoundations#SkipList-CPP|经典实现]]中不同的是，redis 的跳表层数**不是逐渐增长（最大层高逐渐+1）到最大高度就停止的，也不是完全动态增长没有上限的**，而是新增的层数完全是 1 至 32 之间的随机
### Redis 跳表 vs 经典跳表
Redis 基于 William Pugh 原版算法做了三处修改（`t_zset.c:51-70`）：

| 修改 | 目的 |
|------|------|
| **span（跨度）**：每个 `zskiplistLevel` 记录当前层到下一个节点的距离 | O(1) 计算节点排名（ZRANK 命令），无需遍历累加 |
| **backward 后退指针**：仅在 level 1 存在，形成双向链表 | ZREVRANGE 逆序遍历，每次回到前一个节点 O(1) |
| **允许重复分值**：同分值时按成员对象的字典序排序 | 多个元素可以有相同 score，这是业务需求 |

```c
typedef struct zskiplistNode {
    robj* obj;                  // 成员对象
    double score;               // 分值
    struct zskiplistNode* backward;  // 仅 level 1 的后退指针
    struct zskiplistLevel {
        struct zskiplistNode* forward;
        unsigned int span;      // 跨度 — Redis 特有
    } level[];
} zskiplistNode;
```

| 操作 | 搜索 key | 机制 |
|------|---------|------|
| ZSCORE key member | member → dict O(1) | 不走跳表 |
| ZRANK key member | (score_of_key, member) 二元组 | 跳表中精确定位唯一节点 |
| ZREM key member | (score_of_key, member) 二元组 | 定位后删除 |
| ZRANGEBYSCORE min max | 仅 score 范围 | 遍历链表，返回全部匹配 |

member 是真正的唯一标识，score 只是排序主键。(score, member) 二元组驱动整个跳表结构，所以不存在歧义。

**为什么用跳表不用平衡树？**
- 跳表实现更简单（插入/删除无需旋转或重着色）
- 范围查询（ZRANGE/ZREVRANGE）在跳表上只需沿 level 1 链表线性推进，比平衡树的中序遍历更直观
- 概率平衡 vs 严格平衡：跳表的 logN 是期望值，但常数极小，这点可以在[[DevFoundations#SkipList-CPP#时间复杂度|具体实现]]中验证

> [!Info] zset 的两套索引机制
> zset 内部**同时持有 skiplist 和 dict**（`t_zset.c:35-49`）：
> - skiplist 负责按 score 排序 → ZRANK/ZRANGE/ZREVRANGE
> - dict 负责 O(1) 按 member 查 score → ZSCORE
> - 两者共享同一份 robj 指针，只存一份数据，两套索引
## 第 6 章 整数集合
### 数据结构
整数集合(intset)是集合键的底层实现之一，当一个集合只包含整数值元素，并且这个集合的元素数量不多时，Redis 就会使用整数集合作为集合键的底层实现。
```cpp
// encoding的值
#define INTSET_ENC_INT16 (sizeof(int16_t))  // 2
#define INTSET_ENC_INT32 (sizeof(int32_t))  // 4
#define INTSET_ENC_INT64 (sizeof(int64_t))  // 8
typedef struct intset {
	uint32_t encoding;		// 编码方式
	uint32_t length;		// 集合包含的元素数量
	int8_t contents[];		// 保存元素的数组，长度为length，是真实数据的的个数，不是int8_t元素可拆分出几个
} intset;
```
- contents 数组是整数集合的底层实现:整数集合的每个元素都是contents 数组的一个数组项(item)，各个项在数组中**按值的大小从小到大有序地排列**，并且数组中不包含任何重复项。
- 虽然 intset 结构将 contents 属性声明为 `int8_t` 类型的数组，但实际上 contents 数组并不保存任何 `int8_t ` 类型的值，contents 数组的真正类型取决于 encoding 属性的值。引出[[#整数集合升级机制]]，声明为最小可寻址单位 `int8_t`（1 字节），使用时做指针转换即可表示任意类型的整形数据
- 由于有[[Modern C++#9.4 内存对齐|内存对齐]]机制存在，所以 encoding 类型在小于 32 位的的情况下都是一样的
- **FAM vs VLA**：`int8_t contents[]` 是 C99 **FAM（柔性数组成员）**，非 VLA。数据跟随父对象的 malloc 分配在**堆**上，与 header 连续布局；VLA（`int arr[n]`）在栈上。zskiplistNode 的 `level[]` 同样为 FAM

### 整数集合升级机制
要将一个新元素添加到整数集合里面,并且新元素的类型比整数集合现有所有元素的类型都要长时,整数集合需要先进行升级,然后才能将新元素添加到整数集合里面
1. 根据新元素的类型,扩展整数集合底层数组的空间大小,并为新元素分配空间。
2. 将底层数组现有的所有元素都转换成与新元素相同的类型,并将类型转换后的元素放置到正确的位上,而且在放置元素的过程中,需要继续维持底层数组的有序性质不变。
3. 将新元素添加到底层数组里面。
### 为什么没有降级机制？
**升级只升不降**。
- **触发概率极低**：升级只在插入超限值时发生
- **降级判断成本 O(n)**：每次删除后要扫描全部元素
- **颠簸风险**：降级后立刻再插入大数又得升级+整体搬迁
- **收益有限**：intset 上限 512 元素，多占的字节数不值一套降级逻辑
### 数组固定不会带来性能问题
**误解一：zrealloc = 系统调用**  
zrealloc 封装 glibc 的 realloc，是用户态函数。只在 heap 不够时才触发 `brk`/`mmap`。对 intset 典型规模（512×8=4KB），realloc 几乎总在已有 malloc 块上调整，不进内核。
**误解二：频繁操作**  
`set-max-intset-entries` 默认为 512。一旦超过此值，intset 立即转为 hashtable 编码。所以 intset 始终在 ≤512 的小数据集上运行，O(n) memmove + zrealloc 的成本完全可忽略。

| 方案        | 单次插入            | 内存碎片           | 缓存局部性   | 适用规模 |
| --------- | --------------- | -------------- | ------- | ---- |
| intset    | O(n) + zrealloc | 极低             | 极好（连续）  | ≤512 |
| hashtable | O(1) + zmalloc  | 高（每个 entry 独立） | 差（指针散布） | 任意   |

intset 用 O(n) 换来极致的内存紧凑和零碎片；超阈值就切换为 hashtable，两边好处都吃到。
## 第 7 章 压缩列表
### 数据结构
当一个哈希键只包含少量键值对,比且每个键值对的键和值，要么就是小整数值,要么就是长度比较短的字符串,那么 Redis 就会使用压缩列表来做哈希键的底层实现。
压缩列表是 Redis 为了节约内存而开发的,是由一系列特殊编码的**连续内存块**组成的顺序型(sequential)数据结构。
它是一种 [TLV 格式的数据](https://zhuanlan.zhihu.com/p/1950670667100971771)
![[Pasted image 20260613211539.png]]
每一个 entry 存储的是**不同类型的**数据，**长度不一**，所以需要 zltail 和 zllen 标记

| 属性 | 类型 | 长度 | 用途 |
| :--- | :--- | :--- | :--- |
| zlbytes | uint32_t | 4 字节 | 记录整个压缩列表占用的内存字节数：在对压缩列表进行内存重分配，或者计算 zlend 的位置时使用 |
| zltail | uint32_t | 4 字节 | 记录压缩列表表尾节点距离压缩列表的起始地址有多少字节；通过这个偏移量，程序无须遍历整个压缩列表就可以确定表尾节点的地址 |
| zllen | uint16_t | 2 字节 | 记录了压缩列表包含的节点数量：当这个属性的值小于 UINT16_MAX（65535）时，这个属性的值就是压缩列表包含节点的数量；当这个值等于 UINT16_MAX 时，节点的真实数量需要遍历整个压缩列表才能计算得出 |
| entryX | 列表节点 | 不定 | 压缩列表包含的各个节点，节点的长度由节点保存的内容决定 |
| zlend | uint8_t | 1 字节 | 特殊值 0xFF（十进制 255），用于标记压缩列表的末端 |
每个压缩列表节点都由 previous_entry_length、encoding、content 组成
![[Pasted image 20260613211755.png]]
- previous_entry_length 属性以字节为单位,记录了压缩列表中前一个节点的长度，**范围在 1~5**字节，他的设计思想是**通过当前元素的地址计算出前一元素起始地址**，这也允许了列表反向遍历
	- 这个字段在只有 1 字节时，只能保存 1~254 字节的长度值
	- 如果超过 254 字节，则 previous_entry_length 长度为 5 字节，的第一字节会被设置为 0xFE(十进制值 254，用于告知 previous_entry_length 长度为 5 bytes)
- encoding 记录 content 属性所保存数据的类型以及长度，前两位记录 content 存储的是什么类型的数据（单个整数/长度为 1/2/5 字节的数组）从第三位开始后的**不定长位**是 content 长度
表 7-2 字节数组编码

| 编码                                            | 编码长度 | content 属性保存的值          |
| --------------------------------------------- | ---- | ----------------------- |
| 00bbbbbb                                      | 1 字节 | 长度小于等于 63 字节的字节数组       |
| 01bbbbbb xxxxxxxx                             | 2 字节 | 长度小于等于 16383 字节的字节数组    |
| 10 ______ aaaaaaaa bbbbbbbb cccccccc dddddddd | 5 字节 | 长度小于等于 4294967295 的字节数组 |
表 7-3 整数编码

| 编码 | 编码长度 | content 属性保存的值 |
| --- | --- | --- |
| 11000000 | 1 字节 | int16_t 类型的整数 |
| 11010000 | 1 字节 | int32_t 类型的整数 |
| 11100000 | 1 字节 | int64_t 类型的整数 |
| 11110000 | 1 字节 | 24 位有符号整数 |
| 11111110 | 1 字节 | 8 位有符号整数 |
| 1111xxxx | 1 字节 | 使用这一编码的节点没有相应的 content 属性，因为编码本身的 xxxx 四个位已经保存了一个介于 0 和 12 之间的值，所以它无须 content 属性 |
### 连锁更新缺陷
在压缩列表**头部插入/删除**一个 entry 可能导致后续所有 entry 的 header 大小被撑大或者缩小，最坏情况 O(n²) 时间 + 大量 zrealloc。但 Redis 对此的处理是：遇到就算，不会预先规避。因为触发条件是"插入 `≥254` 字节的节点到一群 prevlen 刚好在 250~253 的节点前"，现实中极难凑齐这种序列。
```cpp
初始:   [A(prevlen=1)] [B(prevlen=250)] [C(prevlen=250)] [D(prevlen=250)] ...
                                       ↑ 如果这里插入一个 254+ 字节的 X
插入后: [A] [B(prevlen=250)] [X(prevlen=254)] [C(prevlen=5→需要变254)] [D(prevlen=250→变254?)] ...
```
C 的 prevlen 从 1B 变 5B，导致自身膨胀了 4B，引起后面所有的元素都需要重新移动位置
C 膨胀后 >= 254，push D 的 prevlen 也需要从 1B 变 5B
连锁反应继续...
删除节点同理
![[Pasted image 20260613214253.png]]
big 的 prevlen 用 5 字节存储，small 的用 1 字节，删去 small 后，e1 的 prevlen（从记录 small 变为记录 big 的长度） 要从 1 字节变为 5 字节，后面的节点同理。**插入和删除本质上都是 prevlen 引起的** ^0f8m2r
### 和压缩列表对比

| 维度   | intset      | ziplist   |
| ---- | ----------- | --------- |
| 数据   | 仅整数         | 字符串 + 整数  |
| 内存   | 固定宽度        | 变长 TLV    |
| 查找   | O(log n) 二分 | O(n) 线性扫描 |
| 结构   | 纯数组         | 隐性双向链表    |
| 连锁更新 | 无           | 有（连接问题）   |
## 额外: Redis 5.0 引入 listpack
压缩列表有连锁更新问题，所以 5.0 引入了 listpack 解决，从 [[Redis 设计与实现#^0f8m2r]] 可以看到 prevlen 在 entry 开头且变长而导致的
![[Pasted image 20260614102228.jpg|整体结构]]
![[Pasted image 20260614102308.jpg|元素结构]] 
total-bytes 和 num-elements 是固定的，所以:
- 单个 listpack 最大只能表示约 4GB 的内存占用
- 头部记录的节点数量最大只能到 65535

| 原始结构              | 转换条件                     | 转换后结构                       |
| ----------------- | ------------------------ | --------------------------- |
| listpack（用于 Hash） | 元素数 > 512 或单个元素 > 64 字节 | dict + listpack（渐进式 rehash） |
| listpack（用于 Zset） | 元素数 > 128 或单个元素 > 64 字节 | skiplist + dict             |
encoding-type 字段

| 编码前缀                    | 说明                                       |
| :---------------------- | :--------------------------------------- |
| **a. 单字节编码**            |                                          |
| `0\|xxxxxxx`            | 1 个字节，表示 7 位无符号整型，后 7 位为数据。              |
| `10\|xxxxxx`            | 1 个字节，表示短字符串，后 6 位表示长度，最大可以表示 63 字节的字符串。 |
| **b. 多字节编码**            |                                          |
| `110\|xxxxx yyyyyyyy`   | 2 个字节，表示 13 位有符号整数。                      |
| `1110\|xxxx yyyyyyyy`   | 2 个字节，后 12 位表示字符串长度，最大可以表示 4095 字节的字符串。  |
| `11110000\|<4byte>`     | 5 个字节，后 4 个字节表示字符串长度，用来表示长字符串。           |
| `11110001\|<2byte>`     | 3 个字节，后 2 个字节用来表示有符号整数。                  |
| `11110010\|<3byte>`     | 4 个字节，后 3 个字节用来表示有符号整数。                  |
| `11110011\|<4byte>`     | 5 个字节，后 4 个字节用来表示有符号整数。                  |
| `11110100\|<8byte>`     | 9 个字节，后 8 个字节用来表示有符号整数。                  |
| `11110101` ~ `11111110` | 未使用。                                     |
| `11111111`              | 用来表示 listpack 结尾。                        |

element-total-len表示**前两部分**占用的[字节数](https://zhida.zhihu.com/search?content_id=236918071&content_type=Article&match_order=2&q=%E5%AD%97%E8%8A%82%E6%95%B0&zhida_source=entity)，1-5字节不等。每个字节第一位用0或1来表示当前字节是否为最后一字节，0表示是，1表示否，剩余字节逻辑上拼接在一起来存放无符号整数表示字节数，采用的是大端模式，即高字节保存在低地址，低字节保存在高地址，这部分主要是为了是[反向遍历](https://zhida.zhihu.com/search?content_id=236918071&content_type=Article&match_order=1&q=%E5%8F%8D%E5%90%91%E9%81%8D%E5%8E%86&zhida_source=entity)而设计的。
![[Pasted image 20260614104154.png|存放"hello"和整数1024实际案例]]
## 第 8 章对象
包含字符串对象、列表对象、哈希对象、集合对象和有序集合对象这五种类型的对象
对象机制带来了多个特性:
- 执行命令前根据对象的类型来判断一个对象是否可以执行给定的命令。
- 可以针对不同的使用场景，同一个对象可以有多种不同的数据结构实现（[[#第 6 章 整数集合]]就是典型）
- 对象带有访问时间记录信息,该信息可以用于计算数据库键的空转时长,在服务器启用了 maxmemory 功能的情况下,空转时长较大的那些键可能会优先被服务器删除
### 数据结构
```cpp
typedef struct redisObject {
	// 类型
	unsigned type : 4;
	// 编码
	unsigned encoding : 4;
	// 对象最后一次被访问的时间
	unsigned lru : REDIS_LRU_BITS; /* lru time (relative to server.lruclock) */
	// 引用计数
	int refcount;
	// 指向实际值的指针
	void* ptr;
} robj;
```
- 任何一个 redis 键值对都是 2 个以上的对象组成的
- 对一个数据库键执行 TYPE 命令时，返回值对象的类型，而不是键对象的类型
- 