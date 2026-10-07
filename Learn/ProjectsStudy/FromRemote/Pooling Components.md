# Pooling Components -- Universal Connection Pool 学习笔记

> 与 `LearnProcess.md` 配合使用：后者记录"学了什么"，本文记录"为什么是这样"

---

## 架构总览

### Facade + State 模式

`connection_pool<T>` 是一个薄 facade（~50 行），所有逻辑在 `pool_state<T>` 中实现。

```
connection_pool<T>          pool_state<T>
   (facade)                    (引擎)

   borrow()               ->  borrow()
   try_borrow()           ->  try_borrow()
   borrow_async()         ->  borrow_async()
   close()                ->  close()
   stats()                ->  snapshot()
```

好处：`connection_pool` 是轻量可移动的句柄，多个 pool 可共享同一个 `pool_state`（通过 `shared_ptr`）。

### 核心数据结构

```
pool_state<T> 内部有三个容器管理连接的生命周期：

┌─────────────────────────────────────────────────────┐
│  idle_ (空闲队列)                                    │
│  deque<shared_ptr<connection_record<T>>>             │
│  + idle_by_endpoint_ (unordered_map: endpoint->idle) │
│  作用：存放已创建好、等待被借出的连接                    │
├─────────────────────────────────────────────────────┤
│  active_records_ (活跃记录)                           │
│  unordered_map<uint64_t, shared_ptr<connection_record>>│
│  作用：当前已借出的连接，key 是 connection_id          │
├─────────────────────────────────────────────────────┤
│  waiters_ (等待队列)                                  │
│  按 lane 分组，每条 lane 一个 deque<waiter>            │
│  每个 waiter 包含：请求的 borrow_options + promise/cv  │
│  作用：池满时排队等待的请求                             │
└─────────────────────────────────────────────────────┘

每个 connection_record<T> 包含：
  - connection (T 实例)               -- 实际的资源对象
  - endpoint_config (属于哪个 endpoint) -- 路由信息
  - lease_generation (版本戳)          -- 校验借用句柄有效性
  - state (idle/active/checking/closing/broken/retired)
  - created_at / last_used_at / borrowed_at -- 时间戳
  - reuse_count / credential_generation  -- 复用计数和凭证版本
  - 各种标志位 (force_invalidated, stream_draining 等)
```

### connection_record 包装

每个 `T` 实例不是直接管理的，而是包装在 `connection_record<T>` 中：

```cpp
template <class T>
struct connection_record {
    uint64_t id;                                   // 全局唯一连接 ID
    T connection;                                   // 实际的资源（如 TCP 客户端）
    endpoint_config endpoint;                       // 所属 endpoint 配置
    connection_state state;                         // 状态机
    std::chrono::steady_clock::time_point created_at;      // 创建时间
    std::chrono::steady_clock::time_point last_used_at;   // 最后使用时间
    std::chrono::steady_clock::time_point borrowed_at;    // 本次借出时间（用于泄漏检测）
    std::size_t reuse_count;                        // 已被借出多少次
    std::atomic<bool> force_invalidated;            // 强制失效标志
    uint64_t lease_generation;                      // 版本戳，校验句柄有效性
    // ... 还有流复用、凭证、亲和性等字段
};
```

---

## borrowed_connection RAII 设计

### 三个核心成员

```cpp
template <class T>
class borrowed_connection {
    shared_ptr<pool_state<T>> state_;          // 指向池子
    shared_ptr<connection_record<T>> record_;  // 指向连接记录
    uint64_t lease_generation_;                // 版本戳
};
```

### 析构时自动归还

```
~borrowed_connection()
  1. lock mutex_
  2. 检查 lease_generation 是否匹配当前版本
  3. 根据协议状态决定：复用 / 关闭 / 隔离
  4. 复用 → push 到 idle_by_endpoint_[ep]
     关闭 → 调用 factory.close()
     隔离 → 标记后关闭
  5. cv_.notify_one() 唤醒一个等待者
  6. unlock
```

### lease_generation 版本戳

borrowed_connection 创建时捕获 connection_record 当前的 lease_generation。
归还时检查：`record->lease_generation == captured lease_generation_?`
如果不相等，说明句柄已过期（连接已被归还或失效），防止 double-return。

### 三种借用方法

| 方法 | 行为 | 返回类型 |
|------|------|---------|
| `borrow()` | 阻塞直到成功 | `borrowed_connection<T>` |
| `try_borrow()` | 非阻塞，失败立即返回 | `optional<borrowed_connection<T>>` |
| `borrow_for(timeout)` | 等待最多 timeout 毫秒 | `optional<borrowed_connection<T>>` |

为什么不直接用 `borrow()` 返回空？因为 `borrow()` 语义是"必须借到"，内部会创建 waiter 死等。而 `try_borrow` 和 `borrow_for` 可能借不到，所以用 `optional` 包装。

---

## 性能优化：lock-created-unlock 模式

Borrow 路径的关键优化：

```
1. LOCK:   检查状态，决定需要创建新连接
2. UNLOCK: 调用 factory.create()（可能很慢，数毫秒到数秒）
3. LOCK:   完成创建，校验，push 到 idle_
```

**昂贵的 create() 调用在锁外执行。** 这意味着 create() 期间其他线程可以正常借还。创建中的连接数通过 `creating_connections_` 计数跟踪，防止溢出 `max_size`。

---

## 无外部依赖的代价

C++20 标准库覆盖了：线程(mutex/cv)、协程(future/promise)、容器、chrono、atomic、optional/variant。

但缺少的都需要手写：

| 需求 | 实现位置 | 行数 | 如果有第三方库 |
|------|---------|------|--------------|
| JSON 序列化 | `stats.cpp` | ~386 | 用 nlohmann/json 可减到 ~50 |
| Prometheus 格式 | `stats.cpp` | ~100 | 用 prometheus-cpp |
| C ABI 包装 | `c_api.cpp` | ~1776 | 不需要，但 C ABI 必须手写 |
| 格式化工具 | `detail/format.hpp` | ~50 | 用 fmtlib |
| 配置验证 | `connection_pool.cpp` | ~869 | 依然是 if-else 检查 |

**结论：** 项目确实只用了标准库，但代价是 `stats.cpp` 和 `c_api.cpp` 中有大量样板代码。如果有第三方库，这两个文件可以减少 50% 以上。

---

## 枚举分组速查

### 池行为 (options.hpp)

| 枚举 | 可选值 | 影响什么 |
|------|--------|---------|
| `wait_policy` | fifo / priority / fair | 池满时新请求排队方式 |
| `overload_policy` | timeout / fail_fast / block / custom | 池饱和时如何应对 |
| `overload_action` | reject / enqueue / shed / create | 过载确定后执行的动作 |
| `purge_policy` | lazy / eager / manual | 何时淘汰过期连接 |
| `validation_policy` | never / on_borrow / on_return / background | 何时检查连接健康 |
| `shutdown_policy` | graceful / force | 池子关闭方式 |
| `close_timeout_policy` | wait / detach / fallback_sync | 关闭超时后的处理 |

### 路由 (endpoint.hpp)

| 枚举 | 可选值 | 影响什么 |
|------|--------|---------|
| `routing_policy` | single / round_robin / weighted / read_write_split / consistent_hash / latency_aware | 多 endpoint 时选哪个 |
| `endpoint_role` | any / read / write | endpoint 角色 |
| `borrow_intent` | any / read / write | 借用意图（匹配 role） |
| `fallback_mode` | fail_fast / same_group / same_region / any_healthy | 路由失败时回退策略 |

### 连接状态机

| 枚举 | 可选值 | 说明 |
|------|--------|------|
| `connection_state` | idle -> active -> checking -> closing -> broken -> retired | 连接内部状态转移 |
| `resource_cleanliness` | clean / dirty_resettable / dirty_unresettable / pinned / quarantined | 归还时协议状态 |
| `return_policy` | reuse / reset_then_reuse / close / quarantine | 归还后如何处理 |

### 多租户

| 枚举 | 可选值 | 说明 |
|------|--------|------|
| `priority_class` | low / normal / high / critical | waiter 插队优先级 |
| `quota_overflow_policy` | reject / queue / borrow_from_shared / shed | 超配额时的处理 |

---

## 完整调用流

### borrow 路径

```
[调用方] --borrow()--> [pool_state]

  1. lock mutex_
  2. 检查池子未关闭
  3. 尝试 idle 快路径：
     - 通过 router 选择 endpoint
     - 从 idle_by_endpoint_[ep] 弹出一个连接
     - 校验（lease_generation 匹配、健康检查）
  4. 如果 idle 未命中：
     - 可以创建（total < max_size）：
       unlock -> 调用 factory.create() -> lock -> finish_create
       注意：create() 在锁外执行，不阻塞其他线程
     - 池满：
       创建 waiter -> 入队 waiters_[lane] -> cv.wait_for(timeout)
  5. 成功 -> 返回 borrowed_connection (RAII)
  6. 超时 -> 返回 nullopt
```

### return 路径

```
~borrowed_connection() 析构时自动调用

  1. lock mutex_
  2. 检查 lease_generation 匹配
  3. 检查协议状态 (clean/dirty)
  4. 根据 return_decision 处理：
     - clean -> reuse: push 回 idle_by_endpoint_
     - dirty_resettable -> reset_then_reuse: 调 factory.reset() 后 push
     - dirty_unresettable -> close: 调 factory.close()
     - quarantined -> 标记后关闭
  5. cv_.notify_one() 唤醒一个等待者
  6. unlock
```

### reaper 线程周期（每 reaper_interval 执行一次，默认 10s）

```
reaper_loop()
  │
  ├── sleep(reaper_interval)
  │
  ├── 空闲淘汰: last_used_at + idle_timeout < now -> close()
  │
  ├── 超龄退休: created_at + max_lifetime < now -> close()
  │
  ├── 超复用退休: reuse_count >= max_reuse_count -> close()
  │
  ├── 泄漏检测: borrowed_at + leak_detection_threshold < now
  │   连接借出太久没还，触发 on_leak_detected 回调
  │
  ├── 健康巡检: 对 idle 中连接调用 health_checker
  │
  ├── 凭证过期驱逐: credential_expires_at < now -> drain
  │
  └── endpoint 元数据更新: 如果拓扑/凭证变化，标记相关连接失效
```