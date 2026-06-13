---
参考: " Redis设计与实现 (数据库技术丛书) 机械工业出版社"
created: 2026-06-12
---
# 第一部分数据结构与对象
Redis 数据库里面的每个键值对(key-value pair)都是由对象(object)组成的,其中:
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
C 字符串中的字符必须符合某种编码(比如 ASCII)，并且除了字符串的末尾之外，字符串里面不能包含空字符，否则最先被程序读入的空字符将被误认为是字符串结尾，这些限制使得 C 字符串只能保存文本数据,而不能保存像图片、音频、视频、压缩文件这样的二进制数据。
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
- ht 是哈希表存储数据的位置，一般情况下,字典只使用 ht[0]哈希表,ht[1]哈希表只会在对 ht[0]哈希表进行 rehash 时使用
- 
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