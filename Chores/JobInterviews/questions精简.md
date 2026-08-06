# 面试问题全集
## 一、C++ 基础与语言特性

### 问题 1：请解释一下 C++ 中的 RAII 机制，你在项目中是如何应用的？

**推荐回答要点：**
1. RAII 核心思想：资源获取即初始化，更重要的是析构即释放，将资源的释放和生命周期绑定，利用栈对象析构函数自动释放资源
2. 关键要素：
   - 构造函数获取资源
   - 析构函数释放资源
   - 禁止拷贝或实现深拷贝/移动语义
1. 优势：异常安全、代码简洁、避免资源泄漏

**可能的追问：**
- 智能指针有哪些？区别是什么？
- `std::unique_ptr` 如何实现移动语义？
- 如果需要在类中存储可拷贝的智能指针怎么办？


### 问题 3：std::format，它和 printf/sprintf 有什么区别？

**推荐回答要点：**
1. 类型安全：
   - printf 依赖格式字符串，类型不匹配会导致未定义行为
   - std::format 编译期检查类型匹配
2. 扩展性：
   - std::format 支持自定义类型的 formatter 特化
   - printf 只能处理基本类型
1. 现代 C++ 风格：
   - 与 std::string 无缝集成
   - 支持命名参数（某些实现）


---

### 模板元编程是什么？

### 什么是类型擦除吗？
这是 OOP 多态特性的一种体现，参考 [[#C++的多态形式|C++的多态形式]]


1. 类型擦除定义：
   - 隐藏具体类型，提供统一接口
   - 运行时多态的另一种实现方式
2. 实现方式：
   - 基类指针指向派生类对象
   - 通过虚函数调用具体实现
1. 与虚函数的区别：
   - 虚函数：编译期知道可能的类型集合
   - 类型擦除：运行时可以存储任意类型
   用于NanoJson中存储Json键值对中不同类型的值


## 二、并发编程与多线程


### 问题 14：什么是 Reactor 模式吗？

**考察点：**
- 网络编程模型理解
- 事件驱动架构

**在你项目中的体现：**
- **nanochat/server**: 使用 muduo 的 EventLoop 
- **DevFoundations/nanoserver**: 基于 muduo Reactor 模式

**推荐回答要点：**

1. Reactor 模式核心：
   - 事件收集器（epoll/kqueue）
   - 事件分发器（EventLoop）
   - 事件处理器（Channel/Connection）
2. muduo 的实现：
   - EventLoop: 事件循环，调用 epoll_wait
   - TpServer: 封装 acceptor 和连接管理
   - Channel: 封装 fd 和事件回调
3. 工作流程：
   a) 注册事件：
      - TpServer 监听端口
      - 新连接注册到 EventLoop
   b) 事件循环：
      - epoll_wait 等待事件
      - 分发到对应回调
      - on_connection / on_message
4. 与 Proactor 的区别：
   - Reactor: 事件驱动，应用处理 I/O
   - Proactor: 异步 I/O，内核处理 I/O
5. 项目中的应用：
   - nanochat: 处理客户端连接和消息
   - NanoServer: HTTP 请求处理

**可能的追问：**
- epoll 和 select/poll 有什么区别？
- 什么是 LT 模式和 ET 模式？
- 如何处理百万并发连接？


## 三、内存管理与优化

### 问题 16：为什么要做内存池？内存池解决了什么问题？

**考察点：**
- 内存管理理解
- 性能优化动机

**在你项目中的体现：**
- **DevFoundations/memory_pool**: 完整的内存池实现和性能测试

**推荐回答要点：**
```
1. 问题背景：
   a) 动态内存分配开销大：
      - malloc/free 需要系统调用
      - 进入内核态成本高
   b) 内存碎片：
   	  - 分配的小对象使用8字节对齐，方便管理
    - 混合大小的内存频繁分配而不统一管理会导致内存利用率下降，分配时间也不稳定（index查找计算复杂）
	  - 一次性获取大块内存然后切片分组管理，重复利用可以减少**系统调用次数**，不是磁盘IO
	  - 三级缓存中最大的页缓存由更小一级的span组成，当空闲且相邻的span达到一定数量时合并为一个页一次返回
```

### 问题 21：你在 FastLog 中如何实现 250 万行/秒的吞吐量？

## 四、网络编程与系统架构
### 问题 23：请解释一下你的 HTTP 服务器是如何处理一个请求的？

	**考察点：**
- 系统架构理解
- 请求处理流程

**在你项目中的体现：**
- **DevFoundations/nanoserver/HttpServer/include/http/HttpServer.h**: 完整服务器架构

**推荐回答要点：**
```
1. 整体架构：
   ┌─────────────────────────────────────┐
   │         Application Layer            │
   ├─────────────────────────────────────┤
   │         Router Layer                 │
   ├─────────────────────────────────────┤
   │      Middleware Chain                │
   ├─────────────────────────────────────┤
   │         HTTP Parser                  │
   ├─────────────────────────────────────┤
   │        SSL/TLS Layer                 │
   ├─────────────────────────────────────┤
   │    Network Layer (muduo)             │
   └─────────────────────────────────────┘

2. 请求处理流程：
   a) 网络层：
      - muduo TpServer 接收连接      - on_message 回调接收数据
   b) 协议解析：
      - HTTP 解析 (Boost.Beast)
      - 提取方法、路径、头部
   c) 中间件处理：
      - process_before 正向处理请求
      - CORS、认证等
   d) 路由匹配：
      - 静态路由 O(1) 查找
      - 动态路由正则匹配
   e) 业务处理：
      - 调用注册的 handler
      - 生成响应
   f) 中间件响应：
      - process_after 反向处理
   g) 发送响应：
      - 序列化 HTTP 响应


3. 关键组件：
   - EventLoop: 事件循环
   - Router: 路由分发
   - MiddlewareChain: 中间件链
   - SessionManager: 会话管理
```

---

### 问题 24：你在 nanochat 项目中如何实现消息的端到端加密？

**考察点：**
- 加密算法理解
- 安全通信设计

**在你项目中的体现：**
- **nanochat/utils/include/encryption.h**: OpenSSL 封装

**推荐回答要点：**
```
1. 加密方案：
   - 使用 OpenSSL 库
   - RSA 非对称加密
   - 端到端加密

3. 加密流程：
   a) 发送方：
      - 获取接收方公钥
      - 使用 Encryptor 加密消息
      - 发送加密数据
   b) 接收方：
      - 使用自己的私钥
      - Decryptor 解密消息
      - 获取原始内容

5. 安全考虑：
   - 密钥本地存储
   - 不传输私钥
   - 每次会话可更换密钥
```

---

### 问题 25：你在 NanoServer 中如何实现中间件链？

**考察点：**
- 设计模式应用
- 责任链模式理解

**在你项目中的体现：**
- **DevFoundations/nanoserver/HttpServer/include/middleware/MiddlewareChain.h**:

**推荐回答要点：**
```
1. 设计模式：
   - 责任链模式 (Chain of Responsibility)
   - 中间件可插拔

2. 接口定义：
   class Middleware {
       virtual void process_before(RequestInfo& request) = 0;
       virtual void process_after(ResponseInfo& response) = 0;
   };

3. 中间件链：
   class MiddlewareChain {
       std::vector<std::shared_ptr<Middleware>> middlewares_;
       
       void process_before(RequestInfo& request) {
           for(auto& mw : middlewares_) {
               mw->process_before(request);
           }
       }
       
       void process_after(ResponseInfo& response) {
           // 反向执行，后注册的先处理
           for(auto it = middlewares_.rbegin(); it != middlewares_.rend(); ++it) {
               (*it)->process_after(response);
           }
       }
   };

4. 使用示例：
   - CORS 中间件：添加跨域头部
   - 认证中间件：验证 token
   - 日志中间件：记录请求信息

5. 优势：
   - 解耦业务逻辑和横切关注点
   - 中间件可复用
   - 灵活组合
```

---
### 问题 27：你在项目中是如何使用 SSL/TLS 的？

**考察点：**
- 网络安全
- SSL/TLS 理解

**在你项目中的体现：**
- **DevFoundations/nanoserver/HttpServer/include/ssl/**: SSL 相关实现

**推荐回答要点：**
```
1. SSL 支持：
   - 基于 OpenSSL
   - HTTPS 加密传输
   - 完整的握手流程

2. SslContext 封装：
   - 管理证书和私钥
   - 配置 SSL 选项
   - 创建 SSL 连接

3. 工作流程：
   a) 服务器启动：
      - 加载证书文件
      - 创建 SSL_CTX
      - 配置验证模式
   b) 新连接：
      - 创建 SSL 对象
      - 执行握手
      - 加密通信
   c) 数据传输：
      - SSL_read/SSL_write
      - 自动加解密

4. 证书管理：
   - PEM 格式证书
   - 私钥保护
   - 支持证书链

5. 性能考虑：
   - SSL 会话复用
   - 减少握手开销
```

---

## 五、DevFoundations 项目深度问题

### 问题 29：你的内存池有三个版本 (v1/v2/v3)，它们之间有什么区别？

**考察点：**
- 迭代优化能力
- 架构演进理解

**在你项目中的体现：**
- **DevFoundations/memory_pool/v1, v2, v3**: 三个版本的实现

**推荐回答要点：**
```
1. V1 - 基础版本：
   - 单一自由链表管理所有内存块
   - 简单但效率低
   - 所有大小对象混在一起

2. V2 - 分级版本：
   - 按内存大小分级管理
   - 多个自由链表数组
   - 减少内部碎片
   - 改进：相同大小对象放同一链表

3. V3 - 三层缓存版本：
   - ThreadCache: 线程本地缓存，无锁分配
   - CentralCache: 中心缓存，自旋锁保护
   - PageCache: 页缓存，mmap 申请
   - 批量操作减少锁竞争
   - 内存对齐提高 cache 命中率
   - 性能接近 new/delete
```

---
### 问题 34：你在 NanoServer 中如何处理动态路由（带参数的路由）？

**考察点：**
- 正则表达式应用
- 路由参数提取

**在你项目中的体现：**
- **DevFoundations/nanoserver/HttpServer/include/router/Router.h**:
```cpp
std::regex convert_to_regex(const std::string& pathPattern) {
    std::string regex_pattern = "^" + 
        std::regex_replace(pathPattern, std::regex(R"(/:([^/]+))"), R"(/([^/]+))") + "$";
    return std::regex(regex_pattern);
}
```

**推荐回答要点：**
```
预编译正则表达式，将动态路由中可能包含参数的位置捕获，然后做对应的解析
3. 路由匹配流程：
   a) 先查找静态路由 (O(1))
   b) 未找到则遍历动态路由
   c) 使用 regex_match 匹配
   d) 提取参数到 request
```

---
### 问题 36：你的线程池支持哪两种模式？有什么区别？

**考察点：**
- 线程池模式设计
- 动态线程管理

**在你项目中的体现：**
- **DevFoundations/thread_pool/include/threadpool.h**:
```cpp
enum class PoolMode { ModeFixed, ModeCached };
void set_mode(PoolMode mode);
```

**推荐回答要点：**
```
1. 两种模式：
   a) ModeFixed (固定模式):
      - 启动时创建固定数量线程
      - 线程数不变
      - 适合负载稳定的场景，减少分配线程时间和上下文切换成本

   b) ModeCached (缓存模式):
      - 线程数可动态调整
      - 空闲线程超时销毁
      - 适合负载波动的场景，降低内存/CPU占用
```

---

## 六、nanochat 项目深度问题

### 问题 37：请介绍一下 nanochat 项目的整体架构？

**考察点：**
- 系统架构理解
- 项目全局视角

**在你项目中的体现：**
- **nanochat/**: 完整的即时通讯系统

**推荐回答要点：**
```
1. 项目概述：
   - 跨平台分布式即时通讯系统
   - 类似 QQ 的 UI 界面
   - 支持单聊、群聊、文件传输

2. 整体架构：
   ┌──────────────────────────────────────┐
   │            Client (Qt)               │
   │  ┌────────────────────────────────┐  │
   │  │  UI 层：MainWindow, Widgets    │  │
   │  ├────────────────────────────────┤  │
   │  │  业务层：ClientSession         │  │
   │  ├────────────────────────────────┤  │
   │  │  数据层：LocalDatabase         │  │
   │  └────────────────────────────────┘  │
   └──────────────────────────────────────┘
                    │ TP/WebSocket
   ┌──────────────────────────────────────┐
   │            Server (muduo)            │
   │  ┌────────────────────────────────┐  │
   │  │  网络层：TpServer             │  │
   │  ├────────────────────────────────┤  │
   │  │  业务层：MainServer            │  │
   │  ├────────────────────────────────┤  │
   │  │  数据层：MySQL + Redis         │  │
   │  └────────────────────────────────┘  │
   └──────────────────────────────────────┘

3. 核心功能：
   - 用户注册/登录
   - 好友管理
   - 群组管理
   - 实时聊天
   - 文件传输
   - 离线消息

4. 技术栈：
   - 客户端：Qt + SQLite
   - 服务端：muduo + MySQL + Redis
   - 加密：OpenSSL
```

---
### 问题 39：你的客户端是如何处理离线消息的？

**考察点：**
- 离线消息机制
- 数据同步

**在你项目中的体现：**
- **nanochat/client/include/ClientSession.h**:

**推荐回答要点：**
```
1. 离线消息场景：
   - 用户 A 发送消息时，用户 B 不在线
   - 消息需要暂存
   - 用户 B 上线后接收

1. 同步流程：
   a) 客户端上线：
      - 发送 GetOfflineMessagesRequest
      - 携带本地最大 msg_id
   b) 服务端：
      - 查询 Redis/MySQL
      - 返回 msg_id 之后的消息
   c) 客户端：
      - 接收消息
      - 存入 SQLite
      - 更新 UI

2. 去重机制：
   - 本地记录已处理的最大 msg_id
   - 只处理新消息
```

---
### 问题 44：你的项目是如何实现跨平台部署的？

**考察点：**
- 跨平台能力
- 部署方案

**在你项目中的体现：**
- **简历描述**: "通过 Qt CMake 脚本+dpkg-deb 打包客户端，服务端采用静态链接编译方式"
- **nanochat/CMakeLists.txt**: CMake 配置

**推荐回答要点：**
```
1. 客户端打包 (Linux):
   a) CMake 配置：
      - 设置 Qt 依赖
      - 配置安装路径
   b) dpkg-deb 打包：
      - 创建 DEBIAN/control 文件
      - 指定依赖和版本
      - 生成 .deb 安装包
   c) 一键安装：
      dpkg -i nanochat.deb

2. 服务端静态链接：
   a) 编译选项：
      -static 或 -static-libgcc -static-libstdc++
   b) 优势：
      - 无依赖
      - 任意 Linux 发行版可运行
   c) 注意：
      - 文件体积较大
      - 某些库不支持静态链接

3. 跨平台考虑：
   - Windows: 使用 Qt Installer Framework
   - macOS: 使用 appbundle
   - Linux: deb/rpm/AppImage

4. 版本管理：
   - 语义化版本号
   - 自动更新机制
```

---

## 七、系统设计场景题

### 问题 47：如何设计一个高可用的数据库连接池？

**考察点：**
- 高可用设计
- 连接池优化

**推荐回答要点：**
```
1. 核心功能：
   - 连接管理
   - 健康检查
   - 故障转移
   - 负载均衡

2. 高可用设计：
   a) 多主库支持：
      - 配置多个数据库地址
      - 主库故障自动切换
   b) 健康检查：
      - 定期 ping 数据库
      - 检测连接状态
      - 自动剔除坏连接
   c) 连接预热：
      - 启动时预创建连接
      - 避免冷启动
   d) 优雅关闭：
      - 等待任务完成
      - 连接归还后再关闭

3. 性能优化：
   - 本地缓存连接
   - 批量创建连接
   - 异步回收

4. 监控指标：
   - 活跃连接数
   - 等待队列长度
   - 获取连接耗时
   - 错误率

5. 参考你的项目：
   - MysqlConnectionPool 可添加多主库支持
   - 健康检查机制可增强
```

---

### 问题 48：如果要实现消息的已读未读状态，你会如何设计？

**考察点：**
- 状态管理
- 数据一致性

**推荐回答要点：**
```
1. 数据结构：
   a) 消息表：
      messages(id, from_id, to_id, content, created_at)
   b) 已读状态表：
      message_read(msg_id, user_id, read_at)
   c) 会话表：
      conversation(user_id, target_id, last_msg_id, unread_count)

2. 实现方案：
   a) 写扩散 (适合群聊)：
      - 发送消息时写入多份
      - 每人一份，标记未读
      - 读取时标记已读
   b) 读扩散 (适合单聊)：
      - 消息只存一份
      - 读取时查询未读状态
      - 适合一对一

3. 已读同步：
   - 客户端上报已读
   - 服务端更新状态
   - 推送给发送方

4. 性能优化：
   - Redis 缓存未读数
   - 批量更新已读状态
   - 异步写入数据库

5. 参考你的项目：
   - nanochat 中已有 Redis 存储已读状态
   - 可扩展为完整方案
```

---
---
### 问题 50：如果要实现一个群聊功能，消息应该如何存储和分发？

**考察点：**
- 群聊架构
- 消息分发策略

**推荐回答要点：**
```
1. 两种模式：
   a) 写扩散 (Push):
      - 发送消息时写入每个成员的收件箱
      - 读取时直接查自己的收件箱
      - 适合小群
   b) 读扩散 (Pull):
      - 消息只存一份 (群消息表)
      - 每个成员维护未读游标
      - 读取时拉取
      - 适合大群

2. 推荐方案 (混合模式)：
   - 小群 (<100 人): 写扩散
   - 大群 (>100 人): 读扩散
   - 超级群 (>1000 人): 读扩散 + 消息分级

```

---

## 八、工程实践与软技能

## 九、补充问题

### 问题 59：什么是自旋锁？

**考察点：**
- 锁机制理解
- 并发编程基础

**推荐回答要点：**
```
1. 自旋锁定义：
   - 一种忙等待的锁机制
   - 获取锁失败时不睡眠，持续循环检查
   - 适用于短临界区

2. 实现原理：
   - 使用原子操作 (test_and_set)
   - 检测锁标志位
   - 获取失败时 yield 让出 CPU

3. 项目中的实现：
   // DevFoundations/memory_pool/v3/include/CentralCache.h
   std::array<std::atomic_flag, FREE_LIST_SIZE> locks_;
   
   while(locks_[index].test_and_set(std::memory_order_acquire)) {
       std::this_thread::yield();  // 线程让步，避免忙等待消耗 CPU
   }

4. 与互斥锁对比：
   | 特性 | 自旋锁 | 互斥锁 |
   |------|--------|--------|
   | 等待方式 | 忙等待 | 睡眠 |
   | 上下文切换 | 无 | 有 |
   | 适用场景 | 短临界区 | 长临界区 |
   | CPU 消耗 | 高 | 低 |

5. 使用场景：
   - 内存池 CentralCache：临界区只是链表操作，非常快
   - 内核编程：不能睡眠的上下文
```

---

### 问题 60：三层缓冲如何做到的？

**考察点：**
- 内存池架构设计
- 缓存层次理解

**推荐回答要点：**
```
1. 三层架构：

   ThreadCache (线程本地缓存)
   ├── 每个线程独立的自由链表数组
   ├── 使用 thread_local 实现线程本地存储
   ├── 无锁分配，最快
   └── 管理小对象 (≤256KB)
   
   CentralCache (中心缓存)
   ├── 所有线程共享
   ├── 自旋锁保护
   ├── 批量分配/回收
   └── 从 PageCache 获取大块内存
   
   PageCache (页缓存)
   ├── 以 4KB 页为单位向系统申请
   ├── 使用 mmap 分配内存
   ├── 管理 span (连续页)
   └── 合并相邻空闲 span

2. 分配流程：
   a) ThreadCache 分配：
      - 检查本地自由链表
      - 有 → 直接返回 (O(1), 无锁)
      - 无 → 从 CentralCache 批量获取
   
   b) CentralCache 分配：
      - 自旋锁保护
      - 检查中心自由链表
      - 有 → 返回
      - 无 → 从 PageCache 获取 span，切分后返回
   
   c) PageCache 分配：
      - 查找合适的 span
      - 无 → mmap 申请新页
      - 返回内存地址

3. 关键代码：
   // ThreadCache - 线程本地存储
   static ThreadCache* getInstance() {
       static thread_local ThreadCache instance;
       return &instance;
   }
   
   // CentralCache - 自旋锁
   while(locks_[index].test_and_set(std::memory_order_acquire)) {
       std::this_thread::yield();
   }
   
   // PageCache - mmap 申请
   void* ptr = mmap(nullptr, size, PROT_READ | PROT_WRITE, 
                    MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);

4. 回收流程：
   - ThreadCache 保留 1/4，归还 3/4 给 CentralCache
   - CentralCache 累积到一定程度归还 PageCache
   - PageCache 合并相邻 span

5. 性能优势：
   - 90%+ 的分配在 ThreadCache 完成（无锁）
   - 减少锁竞争
   - 批量操作 amortize 开销
```

---
### 问题 63：HTTPS 服务器整个消息接受->响应流程

**考察点：**
- HTTPS 理解
- 服务器架构

**推荐回答要点：**
```
1. 整体流程：

   客户端                    服务器
     │                        │
     │  1. TP 连接            │
     ├───────────────────────>│
     │                        │
     │  2. SSL 握手            │
     ├───────────────────────>│
     │ <───────────────────────┤
     │                        │
     │  3. 加密 HTTP 请求       │
     ├───────────────────────>│
     │                        │
     │  4. 解密请求             │
     │     业务处理            │
     │                        │
     │  5. 加密 HTTP 响应       │
     │ <───────────────────────┤
     │                        │
     │  6. 关闭连接            │
     ├───────────────────────>│

2. 详细步骤：

   a) T
   
   
   
   P 连接建立：
      - 三次握手
      - 建立 Socket 连接
   
   b) SSL/TLS 握手：
      - ClientHello: 客户端发送支持的加密套件
      - ServerHello: 服务器选择加密套件，发送证书
      - 客户端验证证书
      - 生成会话密钥
      - 建立加密通道
   
   c) HTTP 请求处理：
      - SSL_read: 读取加密数据
      - SSL_decrypt: 解密为明文
      - HTTP 解析：提取方法、路径、头部
      - 中间件处理
      - 路由匹配
      - 业务逻辑处理
   
   d) HTTP 响应：
      - 生成响应数据
      - HTTP 序列化
      - SSL_encrypt: 加密
      - SSL_write: 发送
```

---

### 问题 64：JSON 解析你是如何解析的，流程实现什么？

**考察点：**
- JSON 解析原理
- 编译器设计基础

**推荐回答要点：**
```
1. 解析流程：

   JSON 字符串
       │
       ▼
   ┌─────────────────┐
   │  词法分析       │  → Token 流
   │  (Lexer)        │
   └─────────────────┘
       │
       ▼
   ┌─────────────────┐
   │  语法分析       │  → AST
   │  (Parser)       │
   └─────────────────┘
       │
       ▼
   ┌─────────────────┐
   │  构建 JSON 对象   │  → json_object/json_array
   │  (Builder)      │
   └─────────────────┘

2. 详细实现：

   a) 词法分析：
      - 遍历字符串
      - 识别 Token: { } [ ] : , "string" number true false null
      - 跳过空白字符
   
   b) 语法分析 (递归下降)：
      parse_value():
          - 根据第一个字符判断类型
          - '{' → parse_object()
          - '[' → parse_array()
          - '"' → parse_string()
          - 数字 → parse_number()
          - true/false → parse_boolean()
          - null → parse_null()
      
      parse_object():
          - 解析 '{'
          - 循环解析 key-value 对
          - 解析 '}'
      
      parse_array():
          - 解析 '['
          - 循环解析元素
          - 解析 ']'
```

---

### 问题 65：Redis 存储已读状态与消息游标，实现增量拉取同步是怎么做到的？

**考察点：**
- Redis 应用
- 消息同步设计

**推荐回答要点：**
```
1. 数据结构设计：

   a) 已读状态：
      Key: user:read:{user_id}:{msg_id}
      Value: timestamp (已读时间)
      
   b) 消息游标：
      Key: user:cursor:{user_id}:{device_id}
      Value: last_read_msg_id (最后读取的消息 ID)
      
   c) 离线消息：
      Key: offline:{user_id}
      Type: List
      Value: [msg1, msg2, msg3, ...]

2. 增量拉取流程：

   a) 客户端上线：
      - 发送请求：GET /sync?user_id=123&cursor=456
      - cursor 是本地记录的最后读取消息 ID
   
   b) 服务端处理：
      - 从 Redis 获取 user:cursor:123
      - 查询消息表：SELECT * FROM messages 
                     WHERE msg_id > 456 AND to_id = 123
      - 查询已读状态：HGETALL user:read:123
      - 返回增量消息和已读状态
```

---

### 问题 66：Nginx 分布式部署的基本使用

**考察点：**
- Nginx 配置
- 负载均衡

**推荐回答要点：**
```
1. Nginx 作用：
   - 反向代理
   - 负载均衡
   - SSL 终止
   - 静态文件服务

2. 基本配置示例：

   # nginx.conf
   http {
       upstream backend {
           # 负载均衡策略，配置每个主机的地址和权重，消息同步由redis完成，同步策略用least_conn而不是默认的轮询（配置了权重那么使用权重）
           least_conn;  # 最少连接
           
           server 192.168.1.10:8080 weight=3;  # 权重 3
           server 192.168.1.11:8080 weight=2;
           server 192.168.1.12:8080 weight=1;
       }
       
```

---

### 问题 68：CMake 交叉工具编译方法

**考察点：**
- CMake 交叉编译
- 构建系统理解

**推荐回答要点：**
```
1. 交叉编译概念：
   - 在一种架构上编译另一种架构的可执行文件
   - 例如：x86 编译 ARM 程序

2. CMake 工具链文件：

   // arm-toolchain.cmake
   set(CMAKE_SYSTEM_NAME Linux)
   set(CMAKE_SYSTEM_PROCESSOR arm)
   
   # 指定交叉编译工具链
   set(CMAKE_C_COMPILER arm-linux-gnueabihf-gcc)
   set(CMAKE_CXX_COMPILER arm-linux-gnueabihf-g++)
   
   # 指定目标系统路径
   set(CMAKE_FIND_ROOT_PATH /usr/arm-linux-gnueabihf)
   set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
   set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
   set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
```

---

### 问题 69：QSS 基本语法，几个选择器要知道

**考察点：**
- Qt 样式表
- UI 定制能力

**推荐回答要点：**
```
1. QSS 语法：
   选择器 { 属性：值; }   
   类似 CSS，但支持有限

2. 常用选择器：

   a) 类型选择器：
      QPushButton {
          background-color: #4CAF50;
          color: white;
          border-radius: 4px;
          padding: 8px 16px;
      }
   
   b) 类选择器：
      .MyCustomClass {
          background: red;
      }
   
   c) ID 选择器：
      #loginButton {
          background-color: blue;
      }
   
   d) 属性选择器：  QObject.setProperty("class", "foo")
      QPushButton[flat="true"] {
          border: none;
      }
   
   e) 伪状态选择器：
      QPushButton:hover {
          background-color: #45a049;
      }
      
      QPushButton:pressed {
          background-color: #3d8b40;
      }
      
      QPushButton:disabled {
          background-color: #cccccc;
      }
      
      QPushButton:checked {
          background-color: #2196F3;
      }
   
   f) 后代选择器：选择所有的后代（子对象，孙子对象...）
      QDialog QPushButton {
          color: white;
      }
   
   g) 子控件选择器：
      QComboBox::drop-down {
          border: none;
      }
      
      QScrollBar::handle {
          background: #888;
          border-radius: 4px;
      }
    h) 子元素选择器：只选择一个，直属的子元素
   可以使用 Qt Designer 预览
```

---

### 问题 70：Qt connect 函数几种变体

**考察点：**
- Qt 信号槽机制
- 连接方式理解

**推荐回答要点：**
```
1. Qt4 风格（宏）：
   connect(sender, SIGNAL(signal()), receiver, SLOT(slot));
   
   缺点：编译时不检查，运行时才发现错误

2. Qt5 风格（函数指针）：
   connect(sender, &Sender::signal, receiver, &Receiver::slot);
   
   优点：编译时检查类型匹配

3. 几种变体：

   a) 基本连接：
      connect(button, &QPushButton::clicked, 
              this, &MainWindow::onButtonClicked);
   
   c) Lambda 表达式：
      connect(button, &QPushButton::clicked, this, [=]() {
          // 处理点击
      });
   
   d) 函数对象：
      connect(button, &QPushButton::clicked, 
              [this]() { handleClicked(); });
   
   e) 接收者为 nullptr（自动清理）：
      connect(timer, &QTimer::timeout, this, [this]() {
          updateUI();
      }, Qt::QueuedConnection);
      // 接收者销毁时自动断开

4. 连接类型详解：
   - Qt::DirectConnection: 
     信号发出时立即调用槽函数（同线程）
   
   - Qt::QueuedConnection: 
     信号发出时将调用放入事件队列（跨线程）
   
   - Qt::BlockingQueuedConnection: 
     同 QueuedConnection，但阻塞发送线程直到槽函数执行完成
     （不能用于同线程，会死锁）
   
   - Qt::AutoConnection: 
     默认值，同线程=Direct，跨线程=Queued
```

---

### 问题 71：deb 包怎么打包的？

**考察点：**
- Linux 打包部署
- 工程化能力

**推荐回答要点：**
```
1. deb 包结构：
   package_name_version_arch.deb
   ├── DEBIAN/
   │   ├── control      # 包信息
   │   ├── preinst      # 安装前脚本
   │   ├── postinst     # 安装后脚本
   │   ├── prerm        # 卸载前脚本
   │   └── postrm       # 卸载后脚本
   └── usr/
       ├── bin/         # 可执行文件
       ├── lib/         # 库文件
       └── share/       # 资源文件

```
## 十一、补充问题详解

### 11.1 原子操作 std::atomic 是什么？本质是什么？有什么作用？

**问题：** 原子操作作为 C++ 多线程编程中的常用工具，使用 std::atomic 来设计，不过它是什么，本质是什么，有什么作用我一直不太懂

**解答：**

```cpp
1. 原子操作定义：
   - 不可中断的操作，要么完全执行，要么完全不执行
   - 执行过程中不会被其他线程干扰
   - 多线程并发访问时保证数据一致性

2. std::atomic 本质：
   - 模板类，包装任意类型（主要是整数和指针）
   - 底层使用 CPU 的原子指令（如 x86 的 LOCK 前缀）
   - 保证读写操作的原子性
   
   示例：
   std::atomic<int> counter(0);
   counter++;  // 原子操作，不会被中断

3. 为什么需要原子操作：
   
   问题场景（非原子）：
   int counter = 0;
   // 线程 1          // 线程 2
   counter++;        counter++;
   // 实际执行：
   // 1. 读取 counter (0)
   // 2. 读取 counter (0)  ← 线程 2 也读取到 0
   // 3. 加 1 (1)
   // 4. 加 1 (1)
   // 5. 写入 counter (1)
   // 6. 写入 counter (1)  ← 结果应该是 2，但实际是 1！
   
   解决方案（原子操作）：
   std::atomic<int> counter(0);
   counter++;  // 保证原子性，结果正确为 2

4. 主要作用：
   a) 无锁编程：
      - 替代互斥锁，减少锁竞争
      - 提高并发性能
   
   b) 标志位：
      - 线程间通信
      - 停止标志
      示例：
      std::atomic<bool> shutdown(false);
      // 线程 1
      shutdown.store(true);
      // 线程 2
      while(!shutdown.load()) { work(); }
   
   c) 引用计数：
      - shared_ptr 的引用计数使用 atomic
      - 保证线程安全
   
   d) 计数器：
      - 性能统计
      - 任务计数

5. 支持的操作：
   std::atomic<int> val(0);
   
   val.load();              // 原子读取
   val.store(10);           // 原子写入
   val.exchange(20);        // 交换并返回旧值
   val.compare_exchange_weak(expected, desired);  // CAS 操作
   val.fetch_add(1);        // 原子加法
   val.fetch_sub(1);        // 原子减法
   val++;                   // 原子自增
   val--;                   // 原子自减

```

---

### 11.3 为什么 atomic 可以用于无锁/少锁设计？

**问题：** 为什么 atomic 可以用于无锁/少锁设计？

**解答：**

```cpp
1. 传统锁的问题：
   - 互斥锁需要系统调用（进入内核态）
   - 线程阻塞和唤醒开销大
   - 上下文切换成本高
   - 可能导致死锁

2. atomic 如何实现无锁：
   
   a) CAS 操作（Compare-And-Swap）：
      原理：
      bool compare_exchange_weak(T& expected, T desired) {
          if (*this == expected) {
              *this = desired;
              return true;
          } else {
              expected = *this;
              return false;
          }
      }
      
      使用示例（无锁栈）：
      template<typename T>
      class LockFreeStack {
          std::atomic<Node*> head;
      public:
          void push(T value) {
              Node* new_node = new Node(value);
              new_node->next = head.load();
              // CAS: 如果 head 没变，更新为 new_node
              while(!head.compare_exchange_weak(new_node->next, new_node));
          }
      };

   b) 原子标志位替代锁：
      // 有锁版本
      std::mutex mtx;
      void increment() {
          std::lock_guard<std::mutex> lock(mtx);
          counter++;
      }
      
      // 无锁版本
      std::atomic<int> counter;
      void increment() {
          counter.fetch_add(1, std::memory_order_relaxed);
      }

3. 少锁设计：
   
   a) 细粒度锁：
      // 粗粒度（一个锁保护所有）
      std::mutex mtx;
      void process(int index) {
          std::lock_guard<std::mutex> lock(mtx);
          data[index]++;
      }
      
      // 细粒度（每个元素一个原子变量）
      std::atomic<int> data[N];
      void process(int index) {
          data[index].fetch_add(1);  // 不需要锁
      }

   b) 读写分离：
      // 原子操作保护读，锁保护写
      std::atomic<Data*> current_data;
      std::mutex write_mutex;
      
      Data* read() {
          return current_data.load(std::memory_order_acquire);
      }
      
      void write(Data* new_data) {
          std::lock_guard<std::mutex> lock(write_mutex);
          // 准备新数据...
          current_data.store(new_data, std::memory_order_release);
      }

4. 项目中的使用：
   // DevFoundations/memory_pool/v3/include/CentralCache.h
   
   a) 自旋锁（少锁）：
      std::array<std::atomic_flag, FREE_LIST_SIZE> locks_;
      
      void lock(size_t index) {
          // 使用 atomic_flag 实现自旋锁
          while(locks_[index].test_and_set(std::memory_order_acquire)) {
              std::this_thread::yield();  // 让步，减少 CPU 空转
          }
      }
      
      // 比互斥锁轻量，临界区短时更高效

   b) 原子指针数组：
      std::array<std::atomic<void*>, FREE_LIST_SIZE> centralFreeList_;
      
      // 原子读取，不需要锁
      void* ptr = centralFreeList_[index].load(std::memory_order_relaxed);

5. 无锁编程的优势：
   - 无阻塞：线程不会被挂起
   - 无死锁：没有锁就不会死锁
   - 高并发：适合读多写少场景
   - 可预测：实时性更好

6. 无锁编程的挑战：
   - 实现复杂
   - 调试困难
   - 需要深入理解内存序
   - 不一定总是更快（取决于场景）
```

---

### 11.4 如果需要在类中存储可拷贝的智能指针怎么办？

**问题：** 如果需要在类中存储可拷贝的智能指针怎么办？

**解答：**

```cpp
1. 问题背景：
   - unique_ptr 不可拷贝
   - shared_ptr 可拷贝但共享所有权
   - 有时需要"可拷贝的 unique_ptr"语义

2. 解决方案：

   a) 使用 shared_ptr（推荐）：
      class Widget {
          std::shared_ptr<Data> data_;
      public:
          // 可拷贝
          Widget(const Widget& other) = default;
      };
      
      适用场景：多个对象共享同一资源

   b) 实现深拷贝的 unique_ptr：
      class DeepCopyPtr {
          std::unique_ptr<Data> ptr_;
      public:
          // 深拷贝构造函数
          DeepCopyPtr(const DeepCopyPtr& other)
              : ptr_(other.ptr_ ? std::make_unique<Data>(*other.ptr_) : nullptr) {}
          
          // 移动构造函数
          DeepCopyPtr(DeepCopyPtr&&) = default;
          
          // 拷贝赋值
          DeepCopyPtr& operator=(const DeepCopyPtr& other) {
              if (this != &other) {
                  ptr_ = other.ptr_ ? std::make_unique<Data>(*other.ptr_) : nullptr;
              }
              return *this;
          }
      };

```

| 需求    | 方案          |
| ----- | ----------- |
| 共享所有权 | shared_ptr  |
| 深拷贝语义 | 自定义包装类      |
| 多态对象  | clone() 虚函数 |
| 性能关键  | 裸指针 + 明确所有权 |

### 11.5 std::atomic_flag 和 ` std::atomic<bool>` 有什么区别？

**问题：** `std::atomic_flag` 和 `std::atomic<bool>` 有什么区别？

**解答：**

```cpp
1. 主要区别：

| 特性 | atomic_flag | atomic<bool> |
|------|-------------|--------------|
| 操作 | 只有 test_and_set, clear | 所有原子操作 |
| 返回值 | bool | bool |
| 无锁保证 | 保证无锁 | 不保证无锁 |
| 初始化 | ATOMIC_FLAG_INIT | 构造函数 |
| 大小 | 最小 | 可能更大 |

2. atomic_flag 的特点：

a) 最简单的原子类型：
  std::atomic_flag flag = ATOMIC_FLAG_INIT;
  
b) 只有两个操作：
  - test_and_set(): 设置并返回旧值
  - clear(): 清除标志
```

---

### 11.9 如果线程池项目中，任务 Task 抛出了异常，正确的处理方式是什么？

**问题：** 如果线程池项目中，任务 Task 抛出了异常，正确的处理方式是什么？

**解答：**

```cpp
1. 正确的处理方式：

a) 在任务执行时捕获异常：
b) 使用 std::exception_ptr 传递异常：
c) 线程函数中捕获异常：

3. 最佳实践：

a) 记录异常信息->写入日志->处理异常->忽略处理不了的异常（特殊处理）
b) 通知调用者：
c) 线程健康检查：
  - 监控线程数量
  - 线程异常退出时重启
  - 设置最大重试次数
```

---

### 11.10 什么叫做线程泄漏？如何处理线程池对象中的线程泄漏？

**问题：** 什么叫做线程泄漏？如何处理线程池对象中的线程泄漏？
**解答：**

```cpp
1. 线程泄漏定义：
- 线程创建后没有被正确 join 或 detach
- 线程资源没有被释放
- 类似内存泄漏，但是线程资源

2. 线程泄漏的场景：

a) 忘记 join/detach：
b) 异常导致跳过 join，还没 join 先抛出异常程序跳转到另一个位置，并且其后没有 join/detach

b) 优雅关闭机制：
c) 使用 RAII 封装 std::thread，自动在析构时 join 线程：
```

---

### 11.11 为什么内存池的大对象分配要使用系统的 malloc，而不用内存池来分配？

**问题：** 为什么内存池的大对象分配要使用系统的 malloc，而不用内存池来分配？

**解答：**

```cpp
1. 内存池的设计目标：
- 优化小对象的频繁分配
- 减少系统调用
- 提高分配速度
- 减少内存碎片

2. 为什么大对象不用内存池：

  场景：请求 300KB
  - 如果用内存池：需要预分配 300KB 的块
  - 但可能只用一次
  - 长期占用，浪费内存
  - 我的内存池设计上是为了解决小对象频繁分配问题，如果加入大对象管理会占用很大内存，浪费空间并可能导致以下塞满。不过修改设计也是可以做到的，但要考虑的东西就很多了，系统的 malloc 处理大对象时有对象切片，mmap 分配，实现起来很复杂

```

---

### 11.12 malloc 和 new 有什么区别？

**问题：** malloc 和 new 有什么区别？

**解答：**
************

| 特性 | malloc/free | new/delete |
|------|-------------|------------|
| 来源 | C 库函数 | C++ 运算符 |
| 类型安全 | 返回 void* | 返回具体类型 |
| 构造/析构 | 不调用 | 调用构造函数/析构函数 |
| 大小计算 | 手动指定 | 自动计算 |
| 失败处理 | 返回 NULL | 抛出 bad_alloc |
| 重载 | 不可重载 | 可重载 |
| 数组 | malloc(n*sizeof(T)) | new T[n] |

### 11.14 什么是 LT 模式和 ET 模式？

**问题：** 什么是 LT 模式和 ET 模式？

**解答：**

```cpp
1. 定义：

LT (Level Triggered) - 水平触发：
- 只要 fd 处于就绪状态，就会持续通知
- 类似水位线，到了就通知
- 默认模式

ET (Edge Triggered) - 边缘触发：
- 只在状态变化时通知一次
- 类似边沿，从 0 到 1 的瞬间
- 需要显式设置 EPOLLET

2. 直观对比：

场景：socket 接收缓冲区有 2KB 数据

LT 模式：
- epoll_wait 返回，告知可读
- 读取 1KB，缓冲区还有 1KB
- 再次调用 epoll_wait，仍然返回可读 ✅
- 可以继续读取剩余的 1KB

ET 模式：
- epoll_wait 返回，告知可读
- 读取 1KB，缓冲区还有 1KB
- 再次调用 epoll_wait，不返回 ❌
- 必须一次读完所有数据

4. 优缺点对比：

| 特性 | LT 模式 | ET 模式 |
|------|--------|--------|
| 通知次数 | 多次 | 一次 |
| 编程难度 | 简单 | 复杂 |
| 性能 | 较低 | 较高 |
| 适用场景 | 一般应用 | 高性能服务器 |
| 错误处理 | 容错性好 | 必须正确处理 |

5. 为什么 ET 模式性能更高：

a) 减少通知次数：
  - LT: 每次 epoll_wait 都检查
  - ET: 只在变化时通知

b) 减少系统调用：
  - LT: 可能多次 epoll_wait
  - ET: 一次处理完

c) 适合批量处理：
  - ET 强制一次读完
  - 减少上下文切换

6. 项目中的使用：

muduo 默认使用 LT 模式：
- 更简单，不易出错
- 性能对于大多数场景足够
- 代码可维护性更好

如果需要 ET 模式：
channel_->set_events(Channel::kReadEvent | Channel::kETMode);
```

---

### 11.15 为什么自旋锁可以减少锁竞争？

**问题：** 为什么自旋锁可以减少锁竞争？

**解答：**

```cpp
1. 问题澄清：

准确说，自旋锁不是"减少"锁竞争，而是：
- 在特定场景下比互斥锁更高效
- 避免上下文切换开销
- 适合短临界区

2. 互斥锁的问题：

a) 上下文切换开销：

b) 系统调用开销：
  - futex 系统调用
  - 进入内核态
  - 调度器介入

3. 自旋锁的优势：

a) 无上下文切换：
  // 线程 B 尝试获取锁
  while(lock.test_and_set()) {
	  // 忙等待，不睡眠
	  std::this_thread::yield();  // 让出 CPU
  }
  
  // 优势：
  // - 保持在用户态
  // - 无系统调用
  // - 无调度开销

b) 适合短临界区：
  场景：临界区执行时间 < 上下文切换开销
  
  示例：
  void increment() {
	  spinlock.lock();
	  counter++;  // 几条指令
	  spinlock.unlock();
  }
  
  如果用互斥锁：
  - 上下文切换：10μs
  - 临界区执行：0.1μs
  - 开销占比：99%！
  
  用自旋锁：
  - 忙等待：0.5μs（假设）
  - 临界区执行：0.1μs
  - 总开销更小

为什么这里用自旋锁：
- 临界区只是指针操作，非常快（< 1μs）
- 锁持有时间短
- 避免上下文切换更划算

5. 自旋锁的缺点：

a) CPU 空转：
  // 如果临界区执行时间长
  while(lock.test_and_set()) {
	  // 持续消耗 CPU
	  // 浪费能源
  }
```
### TCP/IP 机制 1122
```md
-------------三次握手----------------------
Client                    Server
  │                         │
  │───── SYN, seq=x ───────>│  (1) 请求连接
  │                         │
  │<──── SYN, seq=y, ACK=x+1│  (2) 确认+自己的SYN
  │                         │
  │───── ACK=y+1 ──────────>│  (3) 确认建立
  │                         │
  
**什么是三次而不是两次？**
- **防止历史连接**：客户端发出的SYN可能延迟到达，三次握手让双方都能确认对方收到了自己的SYN    
- **同步序列号**：双方都需要确认对方的初始序列号
- **避免资源浪费**：两次握手下，服务器不知道客户端是否准备好

-------------四次挥手-----------------------
Client                    Server
  │                         │
  │───── FIN, seq=u ───────>│  (1) 主动关闭
  │                         │
  │<──── ACK=u+1 ───────────│  (2) 确认
  │                         │
  │<──── FIN, seq=v ────────│  (3) 被动关闭
  │                         │
  │───── ACK=v+1 ──────────>│  (4) 最终确认
  │                         │
  │      TIME_WAIT          │	
  
**为什么需要TIME_WAIT？
- 持续**2MSL**（Maximum Segment Lifetime，通常2分钟）
- 确保最后一个ACK能到达对方（防止FIN重传）
- 防止旧连接的数据包影响新连接
```
粘包问题解决
TCP是流式协议，没有消息边界

| 方案        | 示例                    | 优缺点     |
| --------- | --------------------- | ------- |
| **固定长度**  | `char data[1024]`     | 简单但浪费空间 |
| **长度前缀**  | `uint32_t len + data` | 最常用，高效  |
| **特殊分隔符** | `\r\n\r\n`（HTTP）      | 简单但需转义  |
| **应用层协议** | Protobuf + 长度前缀       | 结构清晰    |

### socket 编程
```md
TCP客户端                    TCP服务端
    │                           │
socket() ◄───────────────────── socket()
    │                           │
    │                           bind()
    │                           │
    │                           listen()
    │                           │
connect() ─────────────────────► accept()
    │                           │
    │      (三次握手)            │
    │                           │
write()/send() ◄──────────────► read()/recv()
    │                           │
read()/recv() ◄─────────────── write()/send()
    │                           │
close() ───────────────────────► close()
```

### Q: 浏览器输入 URL 后发生了什么？
1. DNS 解析：域名→IP
2. TCP 三次握手
3. TLS 握手（HTTPS）
4. 发送 HTTP 请求
5. 服务端处理（可能查询数据库）
6. 返回 HTTP 响应
7. 浏览器解析渲染
8. TCP 四次挥手
## 智能指针相关
![[Modern C++#第 5 章 智能指针与内存管理]]
## C++提供的类型转换方式

![[C++ Runoob Tutoral#C++提供的类型转换方式]]
## C++中的多态
![[C++ Runoob Tutoral#C++的多态形式]]
## 面试八股
### explicit 作用
- 强制原本能够通过构造函数进行隐式类型转化的一些类型必须显示调用构造函数完成类型转化
	- 单个参数的 `Foo f = 10` 能够成立的前提是 `Foo::Foo(int x)`
	- 类型操作转换符号中也可以使用 explict，必须要使用 `static_cast<typename>`
```cpp
class Double {
public:
    explicit operator int() const {
        return static_cast<int>(value);
    }
private:
    double value;
};

Double d;
int i = d;               // 错误，无法隐式转换
int j = static_cast<int>(d);  // 正确，显式转换
```
### final 关键字作用
- 防止类被继承或虚函数被覆盖（override）
- 一般结合 override 关键字使用，**显式声明这个继承（类）/重写（函数）到此为止**了
- 编译器可能会有优化，因为调用 final 函数时可以直接展开，不通过虚函数表调用
### redis 数据类型
redis 的数据类新包含：String、List、Set、Zset、hash 等； 
1. String 常用的指令包括：set key value、get key（添加，获取 key）、incre key、decre key（对 key 的值进行加减一），所以可应用于微信文章的阅读数或点赞； 
2. List 是一个双向链表，常用的指令包括：Lpush key value1、Rpush key value1、Lpop key、Rpop key、Lrange key 0 -1（获取所有的元素），所以可应用于微薄的粉丝列表或好友列表 
3. Set 是一个存储不重复元素的结构，常用的指令包括：sadd key value、srem key、srandom key number（随机取出几个元素），所以可应用于抽奖，通过 sadd 添加不同的用户，srandom key number 选出中将用户；还有集合的运算：sdiff、sintern 与 sunio 就是集合的差交并运算，所以可应用于 QQ 的共同好友 
4. Zset 是一个排了序的 set，常用的指令 zadd key score value，其中 score 就是排序的依据，所以可应用于排行榜，类似于微博热搜 
5. hash，相当于 java 的 hash 结构，key 为 string，值还是一个 hashmap 结构常用指令为 hset key field value，可用于存储用户数据，一个 key 代表一个用户，feild 表示用户的各个属性，然后对应的 value 就是属性对应的值 w
### TCP 和 UDP 区别
1. 连接方式
T：面向连接，需通过三次握手建立连接，传输结束后通过四次挥手释放连接。
U：无连接，直接发送数据，无需预先建立连接。

2. 可靠性
T：可靠传输，通过确认应答（ACK）、超时重传、丢包重发等机制保证数据完整有序。
U：不可靠传输，不保证数据是否到达或顺序正确。

3. 数据顺序
T：通过序列号和确认机制保证数据按发送顺序到达。
U：不保证顺序，即使数据乱序到达也不会重新排序。

4. 流量控制
T：通过滑动窗口机制动态调整发送速率，避免接收方缓冲区溢出。
U：无流量控制，可能因发送过快导致丢包。

5. 拥塞控制
T：通过慢启动、拥塞避免等算法（如 Reno、CUBIC）避免网络拥堵。
U：无拥塞控制，可能加剧网络拥堵。

6. 传输效率
T：因连接管理、重传等机制，头部开销大（20 字节以上），传输效率较低。
U：头部仅 8 字节，无额外控制机制，传输效率高。

7. 数据边界
T：基于字节流，无明确消息边界，需应用层自行处理（如添加分隔符）。
U：保留数据报边界，每次发送/接收均为独立报文。

8. 多播/广播支持
T：仅支持单播（一对一通信）。
U：支持单播、多播（一对多）和广播（一对所有）。

9. 适用场景
T：要求可靠传输的场景（如网页浏览、文件传输、电子邮件）。
U：实时性优先的场景（如视频流、语音通话、在线游戏、DNS 查询）。

10. 首部大小
T：首部至少 20 字节（包含选项字段可更长）。
U：固定 8 字节首部（源端口、目的端口、长度、校验和）。

### HTTP/HTTPS 区别
1. HTTP 是明文传输，HTTPS 加了 TLS 协议，是加密传输，更安全； 
2. HTTP 只需要 TCP 三次握手过程，而 HTTPS 还增加了 TLS 握手过程； 
3. HTTP 端口号是 80，HTTPS 端口号是 443； 
4. HTTPS 需要通过 CA（证书权威机构）申请数字证书，确保服务器是可信的；
### 线程和进程
#### 线程状态
**操作系统中的线程状态**（以 Linux 为例）：
- **新建态**（New）：线程刚创建
- **就绪态**（Ready）：等待 CPU 调度
- **运行态**（Running）：正在执行
- **阻塞态**（Blocked）：等待资源
- **终止态**（Terminated）：执行完毕

1. `join()`：阻塞当前的调用线程，直到子线程完成。这意味着主线程将等待子线程执行完毕后再继续执行。这种方法确保了子线程的完成。
2. `detach() `：将子线程从调用线程中分离开来，子线程在后台独立执行，不会阻塞调用线程。使用 detach 后，子线程的资源在它独立执行完成后自动释放，但主线程无法再与其通信或得到其执行结果了。
#### 进程和线程概念及识别
**进程**：系统资源分配的基本单位
**线程**：CPU 调度执行的基本单位
```cpp
// 获取当前线程ID
std::cout << "Thread ID: " << std::this_thread::get_id() << std::endl;
// 获取当前进程ID
std::cout << "Process ID: " << getpid() << std::endl;
```
### C++线程间通信的方式
**操作系统级别的 IPC 机制**有：管道、消息队列、共享内存、信号量、信号，标准 C++中一般做不到，主要通过信号量/条件变量/原子操作/future&promise
```cpp
// 1. 条件变量（推荐）
#include <mutex>
#include <condition_variable>
std::mutex mtx;
std::condition_variable cv;
bool ready = false;

void worker() {
    std::unique_lock<std::mutex> lock(mtx);
    cv.wait(lock, []{ return ready; });
    // 处理任务
}

void notifier() {
    {
        std::lock_guard<std::mutex> lock(mtx);
        ready = true;
    }
    cv.notify_one();
}

// 2. 原子操作
#include <atomic>
std::atomic<bool> flag{false};

// 3. Future/Promise
#include <future>
std::promise<int> prom;
auto fut = prom.get_future();
prom.set_value(42);  // 通知
int result = fut.get(); // 等待并获取结果
```
### Redis 持久化策略

1. RDB: redis database 在指定的时间间隔内，将内存中的数据集的快照写入磁盘，文件名 dump.rdb 适合大规模的数据恢复，对数据库的完整性和一致性要求不是很高一定时间间隔备份一次，如果数据库意外 down 掉，就会失去最后一次快照的所有修改 
2. AOF: append only file 以日志的形式记录每个写操作，只允许追加文件，不允许改写文件，redis 启动时会读取这个文件，并从头到尾执行一遍，以此来恢复数据，文件名 appendonly.aof 在最恶劣的环境下，也丢失不会超过 2 秒的数据，完整性较高，但是会对磁盘持续的进行 IO，代价太大。企业级最少需要 5G 才能支持如果.aof 文件大小超过原来的一倍，会进行重写压缩，保留最小的指令集合 
3. 优先级 aof>rdb

### MySQL 使用 B+树
二叉树和红黑树都会导致树高过高，带来多次 IO 开销，并且无法进行范围查找
B 树中非叶子节点中也会存储数据，在连续查找/范围查找时可能导致缓存未命中开销
B+树所有叶子节点之间都有一个链表指针，指向下一个叶子节点，顺序访问提高了性能
B/B+树层高固定，查询性能稳定
### 设置 noexcept
- 必须要使用 `noexcept` 修饰（虽然没有强制，但是语义上必须要这么做），防止异常**递归展开**而没有捕获到
- 移动赋值运算符也一样
- 比较运算符（`==` 和 `</>`）
- 自定义删除删除器，哈希函数，仿函数的 `operator()` 也需要设置
- 性能敏感函数，swap/哈希函数/内存管理函数，编译器优化后会提高性能
### enum 和 enum class 区别
作用域：
- enum：枚举成员是直接进入包含它的作用域（也就是说，在定义枚举后，你可以直接使用枚举成员，而不需要前缀）。
- enum class：枚举成员只能通过显式地指定它们的枚举类型来访问（即使用枚举名作为前缀，类似于作用域解析）。
类型安全：
- enum：传统枚举类型不安全，枚举成员会隐式转换为整数类型。
- enum class：强类型枚举是类型安全的，不能隐式转换为其他类型，必须显式转换 (`static_cast`)
### using 和 typedef 区别
using 可以用来定义别名模板和引入命名空间，typedef 不行
using 还可以用来在子类中直接继承使用父类的构造函数
```cpp
class Base {
protected:
    int x, y;
    
public:
    Base(int a) : x(a), y(0) { std::cout << "Base(int)\n"; }    
    Base(int a, int b) : x(a), y(b) { std::cout << "Base(int, int)\n"; }    
    Base(const std::string& str) : x(0), y(0) { std::cout << "Base(string)\n"; }};

class Derived : public Base {
private:
    int z;
    
public:
    // 继承父类的所有构造函数
    using Base::Base;
    
    // 需要自定义的额外构造函数
    Derived(int a, int b, int c) : Base(a, b), z(c) {
        std::cout << "Derived(int, int, int)\n";
    }
    
    // 需要为继承的构造函数初始化派生成员
    // 编译器会生成类似这样的代码：
    // Derived(int a) : Base(a), z() {}  // z会被默认初始化
};
```
### 虚函数和虚表指针
虚表是一个指针数组，其元素是虚函数的指针，每个元素对应一个虚函数的函数指针。需要指出的是，普通的函数即非虚函数，其调用并不需要经过虚表，所以虚表的元素并不包括普通函数的函数指针。
继承具有链式关系，所以这样一段代码：
```cpp
class A {
public:
    virtual void vfunc1();
    virtual void vfunc2();
    void func1();
    void func2();
private:
    int m_data1, m_data2;
};
class B : public A {
public:
    virtual void vfunc1();
    void func1();
private:
    int m_data3;
};
class C: public B {
public:
    virtual void vfunc2();
    void func2();
private:
    int m_data1, m_data4;
};
```
B 的虚表中有 A 的 vfunc2，vfunc1 已经被 B 自己覆盖了
C 的虚表中有 B 的 vfunc1，vfunc2 被 C 自己的覆盖
关于纯虚函数，必须要在继承链条中至少被实现一次
继承访问修饰符：
- **public 继承**：基类的 public 成员在派生类中仍为 public
- **protected 继承**：基类的 public/protected 成员在派生类中变为 protected
- **private 继承**：基类的所有成员在派生类中都变为 private
虚类中含有一个虚指针 `__vptr`，指向虚表指针数组，访问修饰符在技术上是 public 的（编译器可以访问，语义上是 private 的，用户不能直接访问）虚表在**编译时期**确定，写入在 `.rodata`，初始化值不为零的内存中

> [!note]
> ps：this 指针不是类的成员函数，也不是类的静态变量，而是**编译器在编译时自动传递给***非 static 成员***的隐含参数**，这也就是为什么 python 中类的成员函数第一个参数是 self，并且使用 `std::bind` 的时候必须要在第一个参数中写入调用对象/类的地址/this 指针
### C 和 C++的内存管理
#### 指针和引用区别
指针：
- 存储对象地址的变量
- 可以为空(nullptr)
- 可进行算术运算
- 可指向不同的对象
- 有一点点开销
引用：
- 对象的别名，不占用存储空间；
- 不存在空引用
- 定义必须初始化
- 不可修改引用对象（始终引用同一个对象）
- 没有开销，是一种零成本抽象（编译器优化）
#### 内存分区模型
由高地址 -> 低地址依次为：栈区、堆区、全局 / 静态区、常量区、代码段。 
1. 栈区：编译器自动管理，存放**局部变量**、函数参数、返回地址等。调用速度较快。 
2. 堆区：由程序员手动分配、释放。使用不当会造成内存泄漏（忘记释放）、野指针（重复释放）、内存碎片化等问题。 
3. 全局 / 静态区：以初始化区域存储程序中显示初始化的全局变量或静态变量；未初始化数据区存放没有显示初始化的全局变量或静态变量，由操作系统在加载时统一置为 0。生命周期是程序的整个运行周期。 
4. 常量区：字符串常量、const 全局常量。只读。 
5. 代码段：函数代码、可执行指令。程序启动就映射到内存中，直到进程结束才释放。只读。
#### 堆和栈区别
- 栈区通常用于存放临时变量等生命周期较短的变量，由编译器自动分配和释放，编译器自动管理，访问速度快，空间有限（由操作系统控制大小）
- 堆区通常用于存放指针对象，需要程序员进行手动管理，适合管理大块或者生命周期不确定的数据，但是分配和释放的管理成本较高
两者在物理上没有本质区别，但是：
- 栈都是对象/指针，指向堆中的大对象数据，有硬件优化和结构优势（简单指针运算，空间局部性好）
`std::vector` 是栈上生成对象，实际存储的数据在堆，并且容量动态变化，所以适合存储大量大对象。`std::array` 对象和其中存储的数据**都在栈上**，长度固定所以很快
#### 分配内存
C 代码中，使用 malloc 分配的内存必须要使用 free 释放（只管分配/释放内存）
C++中使用 new 分配的内存（调用构造函数），必须要使用 delete 删除 （调用析构函数）

| 特性        | malloc/free | new/delete |
| --------- | ----------- | ---------- |
| **语言级别**  | C语言函数       | C++操作符     |
| **类型安全**  | 无类型检查       | 有类型检查      |
| **构造/析构** | 不调用         | 调用构造/析构函数  |
| **重载**    | 不能重载        | 可以重载       |
| **返回值**   | void*需强转    | 自动返回正确类型   |
#### 自定义 allocator
一段标准自定义分配器代码：
```cpp
// 简单的内存池allocator
template<typename T>
class SimplePoolAllocator {
public:
    using value_type = T;

    SimplePoolAllocator() = default;

    template<typename U>
    SimplePoolAllocator(const SimplePoolAllocator<U>&) {}

    T* allocate(std::size_t n) {
        std::cout << "Allocating " << n << " objects of size " << sizeof(T) << std::endl;
        if(auto p = static_cast<T*>(std::malloc(n * sizeof(T)))) {
            return p;
        }
        throw std::bad_alloc();
    }

    void deallocate(T* p, std::size_t n) {
        std::cout << "Deallocating " << n << " objects" << std::endl;
        std::free(p);
    }

    // C++17前需要定义construct/destroy
    template<typename U, typename... Args>
    void construct(U* p, Args&&... args) {
        new(p) U(std::forward<Args>(args)...);
    }

    template<typename U>
    void destroy(U* p) {
        p->~U();
    }
};

// 使用自定义allocator的vector
void custom_allocator_demo() {
    std::vector<int, SimplePoolAllocator<int>> vec;

    for(int i = 0; i < 5; ++i) {
        vec.push_back(i);
        std::cout << "Size: " << vec.size()
                  << ", Capacity: " << vec.capacity() << std::endl;
    }
}
```
- allocate 函数：假设 `SimplePoolAllocator<int> alloc`，当调用 `alloc.allocate(10) ` 时：
	1. n = 10 (要分配10个int对象)
	2. sizeof(T) = 4 (假设int占4字节)
	3. n * sizeof(T) = 40 (总共需要40字节)
	4. `std::malloc(40) `分配40字节原始内存
	5. `static_cast<T*>(...) `将void*转换为int*
	6. 如果分配成功返回指针，失败则抛出异常
- deallocate 函数：
	1. 签名中的 `p`：之前 allocate 返回的指针
	2. `n`：当初请求分配的对象数量，和 p 都是自动传入的，自定义者只需要保证签名中有即可
	3. `std::free(p)`：释放内存（注意：只释放内存，不调用析构函数）
- 如何将这个分配器设置给 vector，那么**当 vec.push_back(i)发生时**：
	1. vector 检查容量是否足够
	2. 如果不够，调用 `allocator.allocate(new_capacity)`
	3. 使用 `allocator.construct()` 在新内存中构造对象
	4. 如果需要重新分配，使用 `allocator.destroy()` 销毁旧对象
	5. 使用 `allocator.deallocate()` 释放旧内存
#### 深浅拷贝
自定义拷贝构造函数的意义一般就是为了解决浅拷贝问题，default 实现的拷贝构造函数是浅拷贝
- 浅拷贝：
仅复制对象的**第一层成员变量**
**基本数据类型直接复制值**，**指针类型仅复制指针地址**，新旧对象**共享同一内存**
由编译器生成的默认拷贝构造函数和赋值运算符实现
可能导致**双重释放**和**悬垂指针**问题
- 深拷贝：
递归**复制对象的所有层级**
为指针成员**分配新内存并复制内容**
新旧对象**完全独立，互不影响**
需要**手动实现**拷贝构造函数和赋值运算符
**避免内存问题**但**带来额外性能开销**

> [!note]
> 在C++中，当类管理**动态内存(如new分配的资源)或者有指针成员变量**时，**必须使用深拷贝**来避免内存管理问题。

> [!warning]
> 可能的追问：
> - 在 STL 容器中存储自定义对象时，拷贝语义如何影响容器行为？
> STL 容器采用值语义存储对象，任何插入操作都会触发拷贝构造（如 push_back 或 insert），若自定义类包含指针成员且未实现深拷贝，会导致多个对象共享同一内存，引发双重释放问题。
> 例如，vector 存储含指针的 Person 对象时，默认浅拷贝会使容器内外指针指向同一地址，析构时重复释放内存而崩溃。
> 此外，继承场景下，向基类容器插入派生类对象会因拷贝丢失派生类特性（"切片问题"），此时建议改用指针容器（如`vector<Widget*>`）或智能指针。
> 
> - 如何设计一个既能深拷贝又能共享资源的灵活类？
> 可通过引用计数+写时复制（COW）实现：默认共享资源（浅拷贝），仅在修改时触发深拷贝。核心是维护共享指针（如 shared_ptr）和引用计数，拷贝构造时递增计数，修改前检查计数，若>1 则创建新副本并重置计数
### 迭代器失效的场景
#### 什么是迭代器
迭代器就像是一个"指针"，指向容器（比如 vector、list）中的某个元素。通过迭代器，我们可以访问、修改容器中的元素，还能在容器中移动（前进或后退）
#### 失效的场景和原因
| 容器类型              | 插入操作           | 删除操作        | 失效根本原因                                                                                      |
| ----------------- | -------------- | ----------- | ------------------------------------------------------------------------------------------- |
| **vector/string** | 可能全部失效(重新分配)   | 被删元素及之后全部失效 | 内存重新分配导致地址改变；删除时元素前移导致位置改变                                                                  |
| **deque**         | 可能全部失效         | 被删元素及之后可能失效 | buffer重新组织导致映射关系改变；同一buffer内删除导致后续元素前移                                                      |
| **list**          | 不会失效           | 只有被删元素失效    | 链表节点独立分配，插入删除只影响指针连接                                                                        |
| **map/set**       | 不会失效           | 只有被删元素失效    | 树结构调整不影响节点内存地址，节点独立存在                                                                       |
| **unordered_***   | 可能全部失效(rehash) | 只有被删元素失效    | rehash导致所有元素重新分布，rehash 创建出更大的 hash bucket，重新计算所有哈希之后重新分布到哈希桶中会改变内存地址；同一bucket内删除只影响该bucket |
#### 解决方法
erase 和 insert 都会返回**下一个有效迭代器**，可以用这个返回值更新旧的迭代器对象保证有效
使用稳定方法修改容器中的元素，比如 `std::list::splice`，不会影响迭代器
使用调试版本的STL,比如` #define _GLIBCXX_DEBUG`，它会检查迭代器有效性，抛出异常
#### 常见出错场景
```cpp
vector<int> nums = {1, 2, 3, 4, 5, 6};
for (auto it = nums.begin(); it != nums.end(); ++it) {
    if (*it % 2 == 0) {
        nums.erase(it); // 错误！迭代器失效
    }
}

vector<int> nums = {1, 2, 3};
for (auto it = nums.begin(); it != nums.end(); ++it) {
    if (*it == 2) {
        nums.push_back(4); // 错误！可能导致迭代器失效，解决方法是使用**索引而非迭代器**
    }
}
```


负数下标：- `aa[-1]` 实际上被解析为 `*(aa - 1)`
自定义数据结构类型转换：
1. 自定义构造函数（不要双向构造）
2. 自定义类型转换 `operator typename() ` 函数
3. 自定义 `=` 重载操作符
测试：

| 测试类型     | 定义              | 特点        | 常见方法            |
| -------- | --------------- | --------- | --------------- |
| **黑盒测试** | 不关注程序内部结构，只检查功能 | 基于需求规格说明书 | 边界值分析、等价类划分、因果图 |
| **白盒测试** | 基于程序内部逻辑结构      | 检查代码执行路径  | 语句覆盖、分支覆盖、路径覆盖  |
智能指针使用注意事项

| 危险行为                     | 是否智能指针会报错 | 建议               |
| ------------------------ | --------- | ---------------- |
| 多个 `shared_ptr` 管理同一原始指针 | ❌ 不会      | 使用 `make_shared` |
| 使用 `get()` 后手动 `delete`  | ❌ 不会      | 避免手动 delete      |
| 使用 `release()` 后忘记处理     | ❌ 不会      | 谨慎使用，确保释放        |
| 多线程中修改 `shared_ptr`      | ❌ 不会      | 加锁或使用原子操作        |
| 滥用数组版本                   | ❌ 不会      | 明确区分 `T[]` 和 `T` |
| 绑定栈变量                    | ❌ 不会      | 避免使用             |
| 管理非 new/delete 资源        | ❌ 不会      | 自定义 deleter      |


# 面试问过的问题
## static 关键字
静态局部变量/函数：只初始化一次，生命周期从初始化到程序结束
全局静态变量/函数：限制可见性，这个符号仅仅在当前翻译单元可见
类静态成员变量/函数：所有对象共享，是属于类的，而不是属于某个特殊的对象

## const 关键字
- 修饰变量符号那么变量会变为**编译期**定义的常量
- 修饰指针变量符号根据 const 在指针符号的前面和后面分为指向常量的指针和常量指针。
	- 在前面会允许指针指向的内存地址改变，而不允许通过指针将指向位置的数据改变。
	- 在后面会不允许指针地址改变，但是指针指向的对象的值能够通过指针改变。
	- 但这些都是**不强制的**，比如我使用 `const int*` 指向变量后语义上是为了不改变某个值，但是我可以在创建一个指针复制这个 const 指针的地址，通过这个新指针还是能够改变
- 如果修饰成员变量函数体，那么就表示**这个函数不会修改类成员**，违反会出现编译错误，如果硬要改，那改的变量必须 mutable 修饰
- const 对象只能调用 const 成员函数
- 左值引用不能绑定右值，而如果是 const 左值引用就可以。**这是 const 语义决定的**。
> [!note] 追问
> ***const 的什么语义？***
> 左值引用表示可以用这个别名去操作对象，但左值引用绑定右值的话，右值是一个临时对象，存在程序内存结构的常量区，无法修改。右值引用语义上表示这个变量是只读的，只能通过别名访问，不能修改
> ***你提到了左右值->看他问什么问题***
> 需要知道如果右值赋值给右值引用对象会**触发移动语义**，这就会让其移动构造函数/运算符接管了
## QT 的信号槽机制是什么？你对他有什么深入的了解？
这是一种观察者模式的实现。工作原理是：
- 借助元对象系统为每一个 `Q_OBJECT` 对象维护一个信号和槽的映射表
- 通常情况下，信号槽使用AutoConnection 策略，发送者发送信号后
使用上来说：
- 信号和槽函数都可以看作普通的函数，发送信号用 emit 宏，接受信号是被动的
- qt4 风格使用宏没有类型检查，qt5 使用引用语法更清晰也支持 QOverride 调用特定重载实现的槽函数
- 还支持 lambda 槽，