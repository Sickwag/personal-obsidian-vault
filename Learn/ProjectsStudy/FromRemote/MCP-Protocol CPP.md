# MCP Server — 架构分析与设计原理

> based on `giuseppemag/mcp-server` v0.8.0
> 项目路径：`/home/azzato/CodeFiles/remote_push/mcp_server`

## 协议传输内容
MCP协议的核心确实是基于JSON-RPC 2.0来规范消息格式，它和 A2A 一样，主要是在数据规范化层面做出约定，在 Server 和 Client 之间双向通信
### 请求内容
```json
{
  // ----- 以下为 MCP/JSON-RPC 协议规定的顶层通用字段 -----
  "jsonrpc": "2.0", 
  // 必须（固定值）：表明使用 JSON-RPC 2.0 版本。

  "id": "mcp-req-20260721-001", 
  // 必须（Request 专用）：请求的唯一标识符。
  // MCP 强制规定此值不能为 null，且在会话中不可重复。

  "method": "tools/call", 
  // 必须：要调用的远程方法名称。
  // 例如 initialize, tools/list, resources/read 等。

  "params": { 
    // 可选：方法调用所需的参数对象。结构由具体的 method 定义。
    "name": "calculator",
    "arguments": {
      "operation": "add",
      "a": 10,
      "b": 20
    }
  }
  // 注意：Request 必须包含 "id"，且绝不能包含 "result" 或 "error"。
}
```
### 响应内容
分为成功响应（**包含 result**）和错误响应，包含 `error`（含全部子字段）
```json
///////// 成功响应 ////////////////
{
  "jsonrpc": "2.0", 
  // 必须（固定值）：协议版本。

  "id": "mcp-req-20260721-001", 
  // 必须：必须与它所回复的 Request 中的 "id" 值完全一致。

  "result": { 
    // 条件必须（与 error 互斥）：操作成功时返回的数据对象。
    // 其内部结构由具体的 method 决定（例如 tools/call 返回 content 数组）。
    "content": [
      {
        "type": "text",
        "text": "10 + 20 = 30"
      }
    ],
    "isError": false
  }
  // 注意：成功响应绝不能包含 "error" 字段。
}
///////// 错误响应 ////////////////
{
  "jsonrpc": "2.0", 
  // 必须（固定值）：协议版本。

  "id": "mcp-req-20260721-001", 
  // 必须：必须与它所回复的 Request 中的 "id" 值完全一致。

  "error": { 
    // 条件必须（与 result 互斥）：操作失败时返回的错误对象。
    // ---------- error 对象内部的子字段（全部列出） ----------
    "code": -32601, 
    // 必须（number）：整数错误码。
    // 可使用 JSON-RPC 标准码（如 -32700 解析错误，-32601 方法不存在），
    // 也允许在 -32000 到 -32099 范围内自定义 MCP 业务错误。

    "message": "Method not found", 
    // 必须（string）：对错误的简短、可读的描述。

    "data": { 
      // 可选（任意类型，通常为 object）：携带附加的调试或上下文信息。
      // 结构完全由服务端自定义，MCP 不做强制限制。
      "available_methods": ["initialize", "tools/list", "resources/read"],
      "hint": "请检查 method 拼写是否正确"
    }
  }
  // 注意：错误响应绝不能包含 "result" 字段。
}
```
### 通知内容
MCP的通知机制，本质上是将传统的“请求-响应”模式扩展为“事件驱动”模式[](https://javarush.com/en/quests/lectures/en.javarush.chatgptapp.next.lecture.level13.lecture01?post=full#discussion)。它主要用于：
- **状态更新与进度汇报**：对于需要长时间运行的操作（如分析大文件、聚合外部API数据等），服务端可以通过 `notifications/progress` 通知，主动向客户端报告任务进度
- **请求取消**：当客户端需要终止一个已发出但尚未完成的请求时，可以发送 `notifications/cancelled` 通知。是客户端发送给服务端的
- 日志记录，初始化完成通知，资源更新，MCP 服务器更新通知，内容比较自由
```json
{
  "jsonrpc": "2.0", 
  // 必须（固定值）：协议版本。

  "method": "notifications/initialized", 
  // 必须：通知对应的方法名称。
  // 通常以 "notifications/" 为前缀，表示这是一条单向消息。

  "params": { 
    // 可选：携带的通知数据。若无参数，可省略此字段或传空对象 {}。
    "client_info": {
      "name": "MyMCPClient",
      "version": "1.0.0"
    }
  }
  // 核心区别：此处绝对不能包含 "id" 字段。
  // 因为通知（Notification）不期望对方返回任何响应，所以无需标识符。
  // 同样，也不能包含 "result" 或 "error"。
}
```
## 架构全景

```
┌─────────────────────────────────────────────────────────────┐
│  main.cpp — 启动入口                                        │
│  · CLI 参数解析 (popl)  → 选择传输模式                       │
│  · 日志初始化 (AixLog)  → 文件日志                          │
│  · 插件加载 (PluginsLoader) → 扫描目录 + 热加载              │
│  · 回调注册 (OverrideCallback) → 注入插件路由                │
│  · Connect(transport) → 进入主循环                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Server 层                                                │
│  · functionMap: 方法路由表 (JSON-RPC 2.0)                   │
│  · HandleRequest: 请求分发 + 错误处理                        │
│  · WriterLoop: 通知队列异步写出线程                          │
│  · Connect: 同步读取循环 / ConnectAsync: 异步双线程          │
└──────┬──────────────┬──────────────────┬───────────────────┘
       │              │                  │
       ▼              ▼                  ▼
┌──────────┐ ┌──────────────┐ ┌────────────────────┐
│ Stdio     │ │ SSE          │ │ HttpStream          │
│ stdin/out │ │ GET /sse     │ │ POST /mcp (请求)    │
│ 逐行协议  │ │ POST /messages│ │ GET /mcp (SSE 通知) │
│ 无状态    │ │ session_id    │ │ Mcp-Session-Id      │
│           │ │ keep-alive    │ │ pending_requests    │
└──────────┘ └──────────────┘ └────────────────────┘
       │              │                  │
       └──────────────┴──────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  PluginsLoader — 插件热加载系统                              │
│  · dlopen/dlsym → 动态库加载                                 │
│  · staging 副本隔离 → 避免文件锁冲突                         │
│  · ScanForChanges 三阶段 → 读锁收集/锁外创建/写锁提交        │
│  · 失败指纹缓存 → 跳过已知坏插件                             │
│  · 变更通知 → tools/prompts/resources 热更新                 │
└─────────────────────────────────────────────────────────────┘
```

## 核心设计决策

### 1. 插件热加载 = 三阶段提交 + staging 隔离

**问题**：运行时替换动态库时，dlopen 加载中的文件会被锁定，直接覆盖源文件会失败或使用陈旧的 inode。

**方案**：
1. 扫描插件目录时，将插件文件复制到 `.staging/` 子目录（带时间戳命名保证唯一性）
2. 从 staging 副本 dlopen，不干扰原始文件
3. 成功后再原子性地替换 `m_plugins` 中的条目

**三阶段流程**：

```
Phase 1 (读锁) → 收集需要 update/add/delete 的路径
    ↓ 释放锁
Phase 2 (锁外) → 对每个路径执行 CreatePluginInstance (包含文件拷贝+dlopen)
    ↓ 获取写锁
Phase 3 (写锁) → 原子替换 m_plugins，记录类型变更标志
    ↓ 释放锁 → 通知客户端
```

这确保了：
- 读操作（GetPluginsSnapshot）不会被写操作长时间阻塞
- 创建插件实例（可能涉及网络/IO）不持有锁
- 拒绝服务向量抑制：`m_failedPlugins` 记录文件指纹，文件不变化就不重试

### 2. 传输层抽象 = 同步阻塞 vs 异步 future

ITransport 提供了两套读写接口：

| 方法 | 阻塞语义 | 使用场景 |
|------|---------|---------|
| `Read()` | 阻塞直到有数据 | `Connect()` 同步主循环 |
| `ReadAsync()` | 返回 `future<pair>` | `ConnectAsync()` 异步 reader 线程 |
| `Write()` | 直接写出 | 响应同步写出 |
| `WriteAsync()` | 返回 `future<void>` | 异步场景备用 |

**SSE Transport 的数据流**：

```
客户端                    SSE Transport
  │                           │
  │── GET /sse ──────────────→│ HandleSSEConnection()
  │                           │   · 发送 event: endpoint (含 session_id)
  │                           │   · 进入 content_provider 长连接
  │                           │
  │── POST /messages ────────→│ HandlePostMessage()
  │                           │   · 推入 incoming_messages_
  │                           │   · Server::Read() 从队列消费
  │                           │   · Server::HandleRequest → WriterLoop → Write()
  │                           │   · 推入 outgoing_messages_
  │                           │   · SSE content_provider 消费并推送
  │←── data: {...} ──────────│
```

**HttpStream Transport 的数据流**（比 SSE 复杂在于同步请求-响应）：

```
客户端                    HttpStream Transport
  │                           │
  │── POST /mcp (id=N) ─────→│ HandlePostMessage()
  │                           │   · 创建 PendingRequest (promise/future)
  │                           │   · push incoming_messages_
  │                           │   · wait_for(30s) 阻塞 HTTP 线程
  │                           │
  │                           │ Server::HandleRequest → Server::Write()
  │                           │   · 匹配 pending_requests_[id]
  │                           │   · promise.set_value() 释放 HTTP 线程
  │←── 200 response ─────────│
  │                           │
  │── POST /mcp (no id) ────→│ HandlePostMessage()
  │   (notification)          │   · push incoming_messages_
  │←── 202 Accepted ─────────│   立即返回
  │                           │
  │── GET /mcp ──────────────→│ HandleGetSSE()
  │   (SSE stream)            │   · content_provider 流式推送通知
```

### 3. WriterLoop 生产者-消费者模式

Server 内部维护一个独立的通知写出线程：

```
SendNotification() → queue_.push() → cv_.notify_one()
                                        │
                             WriterLoop 线程
                             while running:
                                 cv_.wait(queue non-empty)
                                 mutex lock → pop → mutex unlock
                                 transport_->Write(data)
```

为什么不用直接在调用线程写出？
- 通知可能来自插件回调（`ClientNotificationCallbackImpl`），在插件的线程中执行
- 多个插件同时发通知 → 序列化写出，避免交织
- 将 IO 从业务线程分离

### 4. OverrideCallback 可替换路由

Server 构造函数初始化完整的 functionMap。`main()` 中调用 `OverrideCallback` 替换特定方法的路由：

```cpp
server->OverrideCallback("tools/list", [](const json& request) {
    // 注入插件数据到 tools/list 响应
    auto plugins = loader->GetPluginsSnapshot();
    for (const auto& plugin : plugins) {
        // ... 遍历插件填充 tools
    }
    return response;
});
```

这种模式允许：
- 默认实现返回空数组/空对象（PingCmd/ResourcesListCmd）
- `main()` 按需注入数据源（插件、数据库等）
- 运行时可替换（虽然当前代码在启动前统一完成）

## 关键对比

### 三种传输层对比

| 特性 | Stdio | SSE | HttpStream |
|------|-------|-----|------------|
| 通信机制 | stdin/stdout | HTTP GET(SSE) + POST | HTTP POST(请求) + SSE(通知) |
| 状态管理 | 无状态 | session_id | Mcp-Session-Id + pending_requests |
| 请求-响应 | 同步阻塞读取 | 非对称（SSE 只推送，POST 请求同步等待） | 同步等待（future 30s 超时） |
| 通知推送 | 同通道写回 | SSE 流推送 | SSE 流推送 |
| 启动/停止 | 空操作 | 启动 HTTP server | 启动 HTTP server |
| 版本 | 0.2 | 0.4 | 0.1 |
| 适用场景 | 本地 CLI 进程 | 远程浏览器/语言客户端 | 远程客户端 |
| 线程模型 | 单线程 + WriterLoop | server 线程 + WriterLoop | server 线程 + WriterLoop |

### Connect vs ConnectAsync

| | Connect | ConnectAsync |
|--|---------|-------------|
| Reader | 主线程同步 Read() | 独立 reader 线程 ReadAsync() |
| Writer | WriterLoop 线程 | WriterLoop 线程 |
| 阻塞行为 | 阻塞直到断开 | 立即返回 |
| 清理 | Stop() 统一清理 | StopAsync() 分别 join |

### 插件类型

| 类型枚举 | 说明 | 回调方法 |
|----------|------|---------|
| `PLUGIN_TYPE_TOOLS` | 工具调用 | `GetToolCount` / `GetTool` |
| `PLUGIN_TYPE_PROMPTS` | 提示词模板 | `GetPromptCount` / `GetPrompt` |
| `PLUGIN_TYPE_RESOURCES` | 资源提供 | `GetResourceCount` / `GetResource` |

一个插件只实现一种类型，通过 `GetType()` 区分。

## 安全隐患与风险点

1. **插件返回的 `char*` 由调用方 delete[]**：`HandleRequestImpl` 用 `new char[]` 分配，Server 中调用 `delete[] res_ptr`。容易导致内存泄漏（忘记 delete）或 double-free。
2. **HttpStream 的 pending_requests_ 超时处理**：30s 超时后删除 pending 条目，但如果 Server 后续调用了 Write()，promise 的 set_value 会抛异常（被 catch 吞掉）。
3. **SSE 的 thread_local 变量**：`first_call` 和 `last_ping` 是 `thread_local`，在 httplib 的 content_provider 回调中，不同 HTTP 连接可能在不同线程调用，导致 `first_call` 跨连接错误。
4. **全局 shared_ptr（server/loader）**：信号处理中访问全局 `server`，但 signal handler 必须是 async-signal-safe。`shared_ptr` 的操作不是信号安全的，但这里只设置了 `isStopping_` 原子标志，属于可容忍的边界情况。
5. **TSingleton 的 thread-safe lazy init**：使用 `std::call_once` 实现，但该类未在当前项目中使用（定义但未引用）。
