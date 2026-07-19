---
参考: https://github.com/cpp-agan-team/a2a-cpp-sdk.git
---

# A2A (Agent-to-Agent) 协议 — C++ SDK 学习笔记

## 项目定位

A2A C++ SDK 是 Google A2A 协议的生产级 C++ 实现。A2A 协议定义了一套标准化的 Agent 间通信规范，让不同开发者构建的 AI Agent 能够相互发现、通信和协作。**类比：A2A 之于 Agent 就像 HTTP 之于 Web 服务器。** 这不是一个 LLM 框架，而是一个 Agent 互联协议的具体实现。

## 架构总览

### 分层设计

```
┌─────────────────────────────────────────────────────┐
│  应用层 (examples/)                                  │
│  Orchestrator / Math Agent / Echo Agent / Client    │
├─────────────────────────────────────────────────────┤
│  服务端层 (server/)                                  │
│  TaskManager: 任务生命周期管理 + 回调注册             │
│  ITaskStore: 可插拔持久化接口                        │
│    ├── MemoryTaskStore (内存, 开发/测试用)            │
│    └── RedisTaskStore (生产, 分布式)                  │
├─────────────────────────────────────────────────────┤
│  客户端层 (client/)                                  │
│  A2AClient: JSON-RPC 调用封装 + HTTP 传输            │
│  CardResolver: Agent 元数据发现                      │
├─────────────────────────────────────────────────────┤
│  核心层 (core/)                                      │
│  JSON-RPC 2.0 请求/响应                              │
│  基础类型 + 错误码 + 异常                            │
│  模型层 (models/)                                    │
│  AgentCard / AgentMessage / AgentTask / Part        │
└─────────────────────────────────────────────────────┘
```

### 设计原则

1. **接口优先**：每个模块先定义纯虚接口（ITaskStore），再提供具体实现
2. **Pimpl 隐藏实现**：HttpClient/A2AClient/TaskManager 都用 `unique_ptr<Impl>` 隐藏内部细节
3. **Fluent API**：AgentCard/AgentTask/Artifact 等模型支持链式调用
4. **RAII 全覆盖**：资源（libcurl handle、Redis 连接）都在构造函数获取、析构释放
5. **线程安全**：MemoryTaskStore 用 mutex 保护；TaskManager 的回调设计支持多线程

## 设计思想在代码中的三层体现

A2A 协议的核心设计思想是：**Agent 之间通过标准化的 RPC 调用交换结构化消息，完成任务的委托与协作。** 在本 SDK 中，这个思想解耦为三个可独立替换的层次：

### 第1层：协议层（定义"说什么"）

`core/` 目录负责协议本身的建模。`JsonRpcRequest`/`JsonRpcResponse` 封装了 JSON-RPC 2.0 的序列化和反序列化，`A2AMethods` 定义了标准化方法名集合。这一层决定了通信内容的 schema 和语义。

代码入口：`jsonrpc_request.cpp:9-24` 的 `to_json()` 将请求对象序列化为标准 JSON-RPC 格式：
```cpp
j["jsonrpc"] = "2.0";
j["id"]      = id_;
j["method"]  = method_;
j["params"]  = json::parse(params_json_);
```

### 第2层：传输层（决定"怎么传"）

当前只有 `HttpClient`（libcurl），但传输层逻辑集中在 `a2a_client.cpp:34-58` 的 `send_rpc_request()` 方法中：
```
构建 JSON-RPC 对象 → to_json() 序列化 → HTTP POST → 解析 JSON-RPC 响应
```
替换传输层（如支持 gRPC）只需替换这一小段实现逻辑，协议层的 `JsonRpcRequest`/`JsonRpcResponse` 完全不需要改动。

### 第3层：持久化层（决定"怎么存"）

`ITaskStore` 纯虚接口 + 策略模式：
```
ITaskStore（接口）         task_store.hpp
  ├── MemoryTaskStore      memory_task_store.hpp（SDK 自带）
  ├── RedisTaskStore       redis_task_store.hpp（examples 中）
  └── 你的实现             只需继承 ITaskStore 实现 7 个方法
```

> 三层分离的价值：改传输不影响协议，改存储不影响业务逻辑，每层可独立替换。

## 数据传输格式

A2A 通信数据是严格 JSON-RPC 2.0 格式的 JSON 字符串，消息体在 HTTP 层以 `application/json` 传输。核心结构分为两类：

### 请求结构

```
{
  "jsonrpc": "2.0",         // 固定值，标识协议版本
  "id": "req-1",            // 请求 ID，用于匹配请求与响应
  "method": "message/send", // A2A 方法名
  "params": {               // 方法参数，具体内容由 method 决定
    "message": { ... },     // AgentMessage 序列化
    "context_id": "ctx-1"   // 上下文 ID（可选）
  }
}
```

### 响应结构

成功响应：
```
{
  "jsonrpc": "2.0",
  "id": "req-1",
  "result": {               // AgentTask 或 AgentMessage 序列化
    "id": "task-1",
    "status": { "state": "completed" },
    "artifacts": [...],
    "history": [...]
  }
}
```
错误响应：
```
{
  "jsonrpc": "2.0",
  "id": "req-1",
  "error": {
    "code": -32001,
    "message": "Task not found"
  }
}
```

> JSON-RPC 2.0 的 `params` 和 `result` 字段本身不限定内部 schema，但 A2A 协议规范约定了每个 method 的 params/result 必须包含哪些字段。

## 传输载体的可替换性
当前架构是 HTTP-only 的，Google 规范并不强制定义载体类型，但一般使用 HTTP/RPC 技术实现
### 不同传输的字段定义方式

| 传输方式 | 载体 | 字段表示方式 | 代码改动量 |
|----------|------|-------------|-----------|
| HTTP | POST body `application/json` | JSON 字符串直接传递 | 当前实现 |
| gRPC | `google.protobuf.Struct` | JSON 映射到 Struct 的 `fields` map | 新增 GrpcClient |
| WebSocket | 每个 frame 一条 JSON 字符串 | 和 HTTP 相同 | 新增 WsClient |
| Unix Socket | plain text | 与 HTTP 相同 | 新增 UnixClient |

本质结论：**JSON-RPC 2.0 协议的 JSON 文本是规范标准，protobuf、plain TCP frame、WebSocket frame 等都是载体。** 只要载体能完好传递 JSON-RPC 消息的结构化信息，就可以进行 A2A 通信。本项目只实现 HTTP 是简化决定，Google 官方实现同时支持 HTTP 和 gRPC。

## 核心概念体系与代码映射

### 完整概念表
| 协议概念                    | 代码实体                              | 文件                      |
| ----------------------- | --------------------------------- | ----------------------- |
| JSON-RPC Request        | JsonRpcRequest                    | jsonrpc_request.hpp     |
| JSON-RPC Response       | JsonRpcResponse                   | jsonrpc_response.hpp    |
| JSON-RPC Error          | JsonRpcError 结构体                  | jsonrpc_response.hpp    |
| A2A 方法定义                | A2AMethods 常量类                    | a2a_methods.hpp         |
| 错误码                     | ErrorCode 枚举                      | error_code.hpp          |
| 异常                      | A2AException 类                    | exception.hpp           |
| AgentCard（Agent 自描述）    | AgentCard 类                       | agent_card.hpp          |
| ├── Capabilities        | AgentCapabilities 结构体             | agent_card.hpp          |
| ├── Skill               | AgentSkill 结构体                    | agent_card.hpp          |
| └── Provider            | AgentProvider 结构体                 | agent_card.hpp          |
| Task（工作单元）              | AgentTask 类                       | agent_task.hpp          |
| TaskStatus（任务状态）        | AgentTaskStatus 类                 | task_status.hpp         |
| TaskState（状态枚举）         | TaskState 枚举                      | types.hpp               |
| └── 终态判断                | is_terminal() 方法                  | task_status.hpp         |
| Message（通信单元）           | AgentMessage 类                    | agent_message.hpp       |
| MessageRole（消息角色）       | MessageRole 枚举(User/Agent/System) | types.hpp               |
| Part（原子内容单元）            | Part 抽象基类                         | message_part.hpp        |
| ├── TextPart            | TextPart                          | message_part.hpp        |
| ├── FilePart            | FilePart                          | message_part.hpp        |
| └── DataPart            | DataPart                          | message_part.hpp        |
| Artifact（Agent 产出物）     | Artifact 类                        | artifact.hpp            |
| MessageSendParams（发送参数） | MessageSendParams 类               | message_send_params.hpp |
| TaskQueryParams（查询参数）   | TaskQueryParams 结构体               | message_send_params.hpp |
| TaskIdParams（ID 参数）     | TaskIdParams 结构体                  | message_send_params.hpp |
| A2AResponse（响应变体）       | A2AResponse 类（Task\|Message 联合）   | a2a_response.hpp        |
| TaskStore（持久化接口）        | ITaskStore 纯虚接口                   | task_store.hpp          |
| MemoryTaskStore（内存实现）   | MemoryTaskStore（mutex 线程安全）       | memory_task_store.hpp   |
| TaskManager（任务管理器）      | TaskManager（Pimpl + 回调注册）         | task_manager.hpp        |
| A2AClient（客户端）          | A2AClient（Pimpl）                  | a2a_client.hpp          |
| CardResolver（Agent 发现）  | CardResolver                      | card_resolver.hpp       |
| HttpClient（HTTP 传输）     | HttpClient（Pimpl + libcurl）       | http_client.hpp         |

### 本项目对概念的实现程度

- 已实现 7 个 RPC 方法，协议中定义了多少个就实现了多少个的方法名常量
- `TaskState` 有 6 个值（Submitted/Running/Completed/Failed/Canceled/Rejected），**缺少 `input-required` 状态**（协议规范中有的状态，本 SDK 简化掉了）
- **`ListTasks` 操作未实现**（`A2AMethods` 中没有 `tasks/list` 常量）
- **认证机制未实现**：项目仅提供 `HttpClient::add_header()` 接口来手动加 token，没有封装任何认证流程
- **推送通知未实现**：`tasks/pushNotificationConfig/set` 和 `get` 方法常量已定义，但没有任何调用代码

### 本项目 vs 纯概念封装

项目超越纯概念封装的部分（即一个 Agent 开发框架提供的价值）：
- `TaskManager` 回调体系：注册 5 种回调（message_received/task_created/task_cancelled/task_updated/agent_card_query），框架管理任务生命周期，用户只需写业务逻辑
- `ITaskStore` 可插拔存储
- Echo Agent 示例约 80 行代码即可创建完整 A2A Agent

## 音视频等 MIME 数据传输

`FilePart` 的设计（`message_part.hpp:51-84`）支持 MIME 数据：
```cpp
class FilePart : public Part {
    std::string              filename_;   // 文件名
    std::string              mime_type_;  // 如 "video/mp4"
    std::vector<uint8_t>     data_;       // 二进制数据
};
```

实际传输策略有两种：

| 策略        | 实现方式                              | 优劣                              |
| --------- | --------------------------------- | ------------------------------- |
| 内联 base64 | 二进制数据编码为 base64 放在 JSON 的 data 字段 | 简单，但由于 HTTP 的无状态特性，会加大带宽负担      |
| URI 引用    | data 字段放 URI，接收方去拉取               | 高效，需额外对象存储服务并通过路由指向对应的url，适合大文件 |

本项目当前仅支持内联方式。生产环境大文件会用 URI 引用：

## 认证机制

认证是本 SDK 的**未实现特性**（框架能力），仅通过 `HttpClient::add_header()` 提供了扩展点。生产级 A2A 支持的三种认证方式：

| 机制                                       | 实现方式                                    | 安全等级 | 适用场景           |
| ---------------------------------------- | --------------------------------------- | ---- | -------------- |
| API Key                                  | Header: `X-Api-Key: <key>`              | 低    | 内部服务间，LLM 服务调用 |
| [[小林Coding 计算机网络#OAuth 验证方式\|OAuth 2.0]] | Client Credentials Grant → Bearer Token | 中    | 跨组织通信          |
| mTLS                                     | 双向 TLS 证书验证                             | 高    | 金融/医疗等高安全场景    |

## 推送通知

A2A 推送通知和 MCP 通知机制的对比：

```
A2A Push Notification:
Agent A（调用方）                   Agent B（被调用方）
     │── SendMessage（异步）─────►  │
     │                              │── task submitted
     │                              │── [processing...]
     │◄── POST to webhook_url ──────│
     │    { status: "completed",    │
     │      artifacts: [...] }      │

MCP SSE Streaming:
Host（调用方）                      Server（被调用方）
     │── CallTool ───────────────►  │
     │◄── event: result ───────────│
     │◄── event: completion ───────│
```

| 特性 | A2A Push | MCP SSE |
|------|---------|---------|
| 通信方向 | Server → Client（反向调用） | Server → Client（同一连接） |
| 传输协议 | HTTP POST（独立连接） | SSE（同一长连接） |
| 适用场景 | 跨服务器异步通知 | 本地/局域网流式响应 |
| 认证需求 | 高（webhook URL 需验证） | 低（信任网络内） |
| 可靠性 | 需重试+确认机制 | 连接断开即丢失 |

本项目状态：`A2AMethods` 中定义了 `tasks/pushNotificationConfig/set` 和 `get` 常量，但业务代码中从未调用。

## MCP vs A2A
|       | MCP                    | A2A                             |
| :---- | :--------------------- | :------------------------------ |
| 提出者   | Anthropic              | Google                          |
| 解决的问题 | Agent → 工具/数据          | Agent ↔ Agent                   |
| 通信方向  | 单向: CClient → Server   | 双向: 彼此发现、委托                     |
| 传输    | studio (本地) / SSE (远程) | HTTP / gRPC / WebSocket         |
| 消息格式  | JSON-RPC 2.0           | JSON-RPC 2.0                    |
| 核心操作  | ListTools/CallTools    | SendMessage/GetTask/CancelTask  |
| 生命周期  | 无 (一次调用即结束)            | 有 (Task: submitted → completed) |
| 持久化   | 无                      | 有 (TaskStore 接口)                |
| 服务发现  | 无 (URL 写死)             | 有 (AgentCard + 注册中心)            |
| 认证    | API Key / OAuth        | OAuth2 / mTLS / API Key         |
| 推送通知  | 无 (SSE 流替代)            | 有 (Webhook Push Notification)   |
一句话：MCP 给 Agent 装上了手和眼（工具和感知），A2A 让 Agent 之间能说话和协作。

## 本 SDK 的限制和缺失

- `TaskState` 缺少 `input-required` 状态（协议规范 6 + 1 = 7 种，SDK 只实现了 6 种）
- `ListTasks` 操作未实现
- 传输层未抽象为接口（当前 HTTP-only，不能直接插拔为 gRPC）
- 认证机制无封装（只提供最底层的 `add_header` 扩展点）
- 推送通知只定义了方法常量无实现
- `uuid` 生成简化：用 `counter + timestamp` 替代真正的 UUID，多进程下有冲突风险
### 任务生命周期

```
Submitted ──► Running ──► Completed
                  │            │
                  ├────► Failed
                  ├────► Canceled
                  └────► Rejected
```

终端状态：Completed / Failed / Canceled / Rejected（不可变）
非终端状态：Submitted / Running（可变）

## 学习阶段

### 阶段1: 协议基础 — JSON-RPC 2.0 与 A2A 方法体系

**核心问题：A2A 协议在 JSON-RPC 2.0 之上定义了哪些操作？**

A2A v0.3.0 定义了 7 个 RPC 方法，分为三类：

| 类别 | 方法 | 用途 |
|------|------|------|
| 消息 | `message/send` | 发送消息（非流式） |
| 消息 | `message/stream` | 发送消息（流式响应） |
| 任务 | `tasks/get` | 查询任务状态 |
| 任务 | `tasks/cancel` | 取消任务 |
| 任务 | `tasks/resubscribe` | 重新订阅任务更新 |
| 推送 | `tasks/pushNotificationConfig/set` | 配置推送通知 |
| 推送 | `tasks/pushNotificationConfig/get` | 查询推送通知配置 |

**JSON-RPC 2.0 请求格式：**
```json
{
  "jsonrpc": "2.0",
  "id": "str-or-null",
  "method": "message/send",
  "params": { ... }
}
```

**设计亮点：** `A2AMethods` 用 `static constexpr const char*` 而非枚举来定义方法名，因为协议层面的方法名就是字符串常量，直接用字符串避免了枚举到字符串的映射转换。

### 阶段2: 数据模型

> 待学习...

### 阶段3: 传输层

> 待学习...

### 阶段4: 客户端层

> 待学习...

### 阶段5: 服务端层

> 待学习...

### 阶段6: 示例系统

> 待学习...

## 代码可优化的地方

> 学习过程中发现的问题记录在此

## 对比分析

> 设计选择对比记录在此
