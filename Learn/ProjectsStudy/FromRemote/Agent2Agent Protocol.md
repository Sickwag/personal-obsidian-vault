---
参考: https://github.com/cpp-agan-team/a2a-cpp-sdk.git
---

# A2A (Agent-to-Agent) 协议 — C++ SDK 学习笔记

## 项目定位

A2A 是 Google 提出的 Agent 间通信协议标准。本项目是它的 C++ SDK 实现，提供 Agent 发现、任务委托、消息交换等能力。类比：A2A 之于 Agent 就像 HTTP 之于 Web 服务器——定义了一套通用交互规范，不绑定具体编程语言或传输技术。

## 架构总览

```
应用层 (Echo Agent / Orchestrator / Math Agent)
  ┆ 回调注册
服务端层 — TaskManager (生命周期) + ITaskStore (可插拔存储)
  ┆ JSON-RPC over HTTP
客户端层 — A2AClient + CardResolver + HttpClient
  ┆
核心层 — JSON-RPC 序列化 / 基础类型 / 错误码
模型层 — AgentCard / AgentMessage / AgentTask / Part
```

设计原则：接口优先 (ITaskStore)、Pimpl 隐藏实现、Fluent API、RAII。

## 协议基础
### 基本概念

#### 概念总览与关系图

A2A 协议的核心概念共 7 个，它们之间的关系如下：

```
 AgentCard (Agent 自描述名片)
  ├── 声明：name / description / version / protocol_version
  ├── 能力：AgentCapabilities (streaming? push? task_management?)
  ├── 技能列表：AgentSkill[] (每个 skill 有 name + input_modes + output_modes)
  ├── 认证方式：AgentProvider (谁创建的、联系信息)
  └── 端点：url (Agent 服务地址)
       │
       ▼ 通过 url 访问
 ┌────────────────────────────────────────────────────┐
 │  Agent 服务端                                       │
 │                                                     │
 │  Task (工作单元)                                     │
 │   ├── id / context_id                               │
 │   ├── status: TaskState (生命周期状态机)               │
 │   ├── history: Message[] (对话历史)                   │
 │   ├── artifacts: Artifact[] (输出产物)                │
 │   └── metadata                                      │
 │       ├── Message (通信单元)                          │
 │       │   ├── message_id / role (user|agent|system)  │
 │       │   └── parts: Part[] (原子内容)                │
 │       │       ├── TextPart (纯文本)                   │
 │       │       ├── FilePart (文件: 名+类型+数据)        │
 │       │       └── DataPart (结构化 JSON 数据)          │
 │       └── Artifact (产出物)                           │
 │           ├── id / name / description                 │
 │           ├── mime_type / url / content               │
 │           └── metadata                                │
 └────────────────────────────────────────────────────┘
       │
       ▼ 场景串起来
 1. 调用方读取 AgentCard → 知道 Agent 有什么能力、怎么联系
 2. 调用方发送 Message 给 Agent → 创建 Task
 3. Task 经历状态机流转 → 产出 Artifact 或要求更多输入
 4. 调用方可以随时 GetTask 查状态、CancelTask 终止
 5. 整个过程记录在 Task.history 中（Message 序列）
```

#### 7 个概念逐一说

**AgentCard — Agent 的自描述名片**

AgentCard 是 Agent 对外发布的"身份证"，固定在 `/.well-known/agent-card.json` 端点提供。调用方通过它发现 Agent 的能力和通信方式。这里需要注意**客户端必须提前知道有 `/.well-known/agent-card.json` 这个 url 可以访问，才能完成后面的内容，而不是用过扫描 `/.well-known/` 得知**

```
AgentCard {
  ├── name: "Math Agent"              // 人类可读名称
  ├── description: "计算数学问题"      // 功能描述
  ├── url: "http://localhost:5001"    // 服务端点
  ├── version: "1.0.0"               // Agent 自身版本
  ├── protocol_version: "0.3.0"      // A2A 协议版本（固定）
  ├── capabilities: {
  │     streaming: true,              // 支持流式响应？
  │     push_notifications: false,    // 支持推送通知？
  │     task_management: true         // 支持任务管理？
  │   }
  ├── skills: [{                      // 技能列表（能力单元）
  │     name: "math",
  │     description: "解方程、算术",
  │     input_modes: ["text"],
  │     output_modes: ["text"]
  │   }]
  └── provider: {                     // 供应商信息
        name: "阿甘",
        organization: "cpp-agan",
        url: "https://..."
      }
```

代码体现：`agent_card.hpp` 中 `AgentCard` 类 + `AgentCapabilities` / `AgentSkill` / `AgentProvider` 三个辅助结构体。Fluent API 链式构造。

**Task — 工作单元**

Task 是 A2A 的核心抽象——它代表一次完整的"交给 Agent 去完成的工作"。每一个 Task 有全局唯一 ID、关联的上下文、完整的生命周期状态机：

```
Task 生命周期状态机：

         ┌─── InputRequired ───┐
         ▼                      │
  Submitted ──► Running ──► Completed
                    │
                    ├──► Failed
                    ├──► Canceled
                    └──► Rejected

  Submitted:   刚创建，等待处理
  Running:     正在处理中
  InputRequired: 需要调用方补充信息（本 SDK 未实现）
  Completed:   成功完成（终端状态）
  Failed:      处理出错（终端状态）
  Canceled:    被调用方取消（终端状态）
  Rejected:    服务端拒绝处理（终端状态）
```

Task 的组成：
```
Task {
  id: "task-1",           // 全局唯一 ID
  context_id: "ctx-1",    // 上下文 ID（关联多轮对话）
  status: {
    state: "running",
    timestamp: "...",
    message: "计算中..."  // 可选状态描述
  },
  artifacts: [...],        // 产出物列表
  history: [...],          // 对话历史（Message 数组）
  metadata: { ... }        // 自定义元数据
}
```

代码体现：`agent_task.hpp` 中 `AgentTask` 类 + `task_status.hpp` 中 `AgentTaskStatus` 类。`is_terminal()` 判断是否已结束（不可变状态）。

**Message — 通信单元**

Message 是 Agent 间对话的载体。每个 Message 有角色归属（谁说的）、内容（Part 列表）和可选的上下文/任务关联。

```
Message {
  message_id: "msg-1",
  role: "user",              // user / agent / system
  context_id: "ctx-1",       // 可选，关联到上下文
  task_id: "task-1",         // 可选，关联到任务
  parts: [                    // 内容部分（至少一个）
    { type: "text", text: "1+1=?" },
    { type: "file", mime_type: "image/png", ... }  // 可选附带文件
  ]
}
```

关键设计：Message 不直接包含"答案"，而是通过 `task_id` 字段关联到 Task。Task 的 `artifacts` 才是 Agent 的产出物，Message 只是对话过程中的消息传递。

代码体现：`agent_message.hpp` 中 `AgentMessage` 类，Parts 用 `vector<unique_ptr<Part>>` 实现多态容器。

**Part — 原子内容单元**

Part 是 Message 中不可分割的内容块。三种类型：

| Part 类型 | 内容 | 二进制支持 | 典型用途 |
|-----------|------|-----------|---------|
| TextPart | 纯文本字符串 | 否 | 对话文本、问题、答案 |
| FilePart | 文件名 + MIME 类型 + 二进制数据 | 是 (base64 或 URI) | 图片、音视频、文档 |
| DataPart | JSON 结构化数据 | 否 | 表单字段、结构化查询结果 |

核心设计原则：**一条 Message 可以包含多个 Part，Part 的类型可以混合。** 例如："把这图片转成文字"（TextPart 描述指令 + FilePart 附带图片）。

代码体现：`message_part.hpp` 中 `Part` 抽象基类 + `TextPart` / `FilePart` / `DataPart` 三个子类。`clone()` 纯虚函数实现多态深拷贝。

**Artifact — Agent 的产出物**

Artifact 代表 Agent 处理完 Task 后产生的"交付物"。与 Part 的区别：Part 是对话过程中的内容片段，Artifact 是最终或有版本的产出。

```
Artifact {
  id: "art-1",
  name: "计算结果",
  description: "方程 2x+5=15 的解",
  mime_type: "text/plain",
  content: "x = 5",
  metadata: { "steps": "3" }
}
```

流式场景下，Artifact 支持增量更新：Agent 先返回一个 `parts: [{text: "正在计算..."}]` 的 Artifact，后续发新版本覆盖。

**AgentCapabilities — 能力声明**

AgentCard 中最关键的字段之一，声明 Agent 支持的操作模式：

| 字段 | 意义 | 影响 |
|------|------|------|
| `streaming` | 支持流式响应 | 调用方可以选择 `message/stream` 而非 `message/send` |
| `push_notifications` | 支持推送通知 | 调用方可以配置 webhook 而非轮询 |
| `task_management` | 支持任务管理 | 调用方可以调 `tasks/get`、`tasks/cancel` |

**AgentSkill — 能力单元**

Agent 可以声明多个 Skill，每个 Skill 描述一项具体能力及其支持的输入/输出格式。调用方可以通过 `skills` 判断"这个 Agent 能帮我做什么"，而非盲目发送消息。

#### 通信流程

一次完整的 A2A 通信分三步：

```
 调用方                           Agent
   │                                │
   │ 步骤1：发现 Agent               │
   │── GET /.well-known/agent-card.json ──►│
   │◄── AgentCard { name, skills, url } ──│
   │                                │
   │ 步骤2：发送消息，创建 Task        │
   │── POST / (JSON-RPC) ──────────►│
   │   { method: "message/send",    │
   │     params: {                  │
   │       message: {               │
   │         role: "user",          │
   │         parts: [{text:"1+1=?"}]│
   │       }                        │
   │     }                          │
   │   }                            │
   │                                │
   │  Agent 内部：                   │
   │  1. 创建 Task (Submitted)       │
   │  2. 更新 Task → Running         │
   │  3. 处理消息（LLM 调用等）        │
   │  4. 收集上一步的结果并序列化，最终产出 Artifact│
   │  5. 更新 Task → Completed       │
   │                                │
   │◄── JSON-RPC Response ──────────│
   │   { result: {                  │
   │       id: "task-1",            │
   │       status: {state:"completed"},│
   │       artifacts: [{            │
   │         name: "答案",           │
   │         content: "2"           │
   │       }]                       │
   │   }}                           │
   │                                │
   │ 步骤3（可选）：查询/取消任务      │
   │── POST / (tasks/get task-1) ──►│
   │◄── Task 当前状态 ──────────────│
```

#### 方法 ↔ 操作原语对应表

是的，A2A 方法名路由直接对应操作原语，一一映射：

| 原语 | 方法名 | 类别 | 说明 |
|------|--------|------|------|
| SendMessage | `message/send` | 消息 | 发送消息，同步等待完整响应 |
| SendStreamingMessage | `message/stream` | 消息 | 发送消息，SSE 流式接收响应 |
| GetTask | `tasks/get` | 任务 | 查询指定 Task 的当前状态和输出 |
| CancelTask | `tasks/cancel` | 任务 | 幂等取消 Task，返回最终状态 |
| ResubscribeToTask | `tasks/resubscribe` | 任务 | 重新订阅 Task 的流式更新（连接断开后重连） |
| SetPushNotificationConfig | `tasks/pushNotificationConfig/set` | 推送 | 配置 webhook 接收推送通知（本 SDK 未实现） |
| GetPushNotificationConfig | `tasks/pushNotificationConfig/get` | 推送 | 查询当前推送通知配置（本 SDK 未实现） |

方法名中的 `message/` 和 `tasks/` 前缀是命名空间划分，避免不同类别的操作产生名称冲突。`is_streaming_method()` 判断哪些方法需要流式传输（`message/stream` 和 `tasks/resubscribe`）。

#### 所有概念之间的关系总结

```
AgentCard 描述了一个 Agent
  └── Agent 拥有 Skills（能力单元）
  └── Agent 处理 Tasks（工作单元）

Task 是工作的核心抽象
  ├── 包含 Messages（对话历史）
  │     └── Message 包含 Parts（原子内容）
  │           ├── TextPart（文本）
  │           ├── FilePart（文件，支持 MIME）
  │           └── DataPart（结构化数据）
  └── 产出 Artifacts（最终交付物）	
```

### JSON-RPC 2.0 数据格式

A2A 的通信数据是严格 JSON-RPC 2.0 格式的 JSON 字符串，核心字段固定：

```json
// 请求
{
  "jsonrpc": "2.0",
  "id": "req-1",
  "method": "message/send",
  "params": { "message": { ... }, "context_id": "..." }
}

// 成功响应
{ "jsonrpc": "2.0", "id": "req-1", "result": { ... } }

// 错误响应
{ "jsonrpc": "2.0", "id": "req-1", "error": { "code": -32001, "message": "Task not found" } }
```

关键设计：`params` 和 `result` 的 schema 由每个 method 自己约定而非 JSON-RPC 规范强制，A2A 协议在 method 定义中补充了这一约束。代码体现：`jsonrpc_request.cpp:9-24` 和 `jsonrpc_response.cpp:9-34`。

### A2A 方法体系

定义在 `a2a_methods.hpp`，共 7 个标准化方法：

| 类别  | 方法                                 | 用途              |
| --- | ---------------------------------- | --------------- |
| 消息  | `message/send`                     | 发送消息（非流式）       |
| 消息  | `message/stream`                   | 发送消息（流式，SSE 响应） |
| 任务  | `tasks/get`                        | 查询任务            |
| 任务  | `tasks/cancel`                     | 取消任务            |
| 任务  | `tasks/resubscribe`                | 重订阅任务更新（流式）     |
| 推送  | `tasks/pushNotificationConfig/set` | 配置推送通知（未实现）     |
| 推送  | `tasks/pushNotificationConfig/get` | 查询推送配置（未实现）     |

实现手法：用 `static constexpr const char*` 而非枚举，因为协议方法名天然是字符串，省去枚举↔字符串的映射转换。`is_streaming_method()` / `is_valid_method()` 两个静态方法提供分类校验。

### 错误码体系

定义在 `error_code.hpp`，双层结构：

```
JSON-RPC 标准错误 (-32700 ~ -32603)
  ParseError / InvalidRequest / MethodNotFound / InvalidParams / InternalError
    ┆
A2A 扩展错误 (-32001 ~ -32005)
  TaskNotFound / TaskNotCancelable / UnsupportedOperation / ContentTypeNotSupported / PushNotificationNotSupported
```

配套的 `error_code_to_string()` 函数做枚举→描述映射。`exception.hpp` 中的 `A2AException` 包装 `ErrorCode` + `what()` 消息，让异常处理层可以直接拿到结构化错误码。

### Pimpl 设计模式

```cpp
// http_client.hpp (public)
class HttpClient {
    class Impl;
    std::unique_ptr<Impl> impl_;
};

// http_client.cpp (private)
class HttpClient::Impl {
    long timeout_;
    std::map<std::string, std::string> headers_;
};
```

核心价值按重要性排序：

| 价值 | 说明 |
|------|------|
| 编译防火墙 | `libcurl` 只在 `.cpp` 中 include，所有包含 `http_client.hpp` 的源文件不依赖 curl 头文件。改 `Impl` 成员只编译一个 `.cpp` |
| ABI 稳定性 | `sizeof(HttpClient) = sizeof(unique_ptr) = 8`，新增字段不改变对象布局，以 `.so`/`.dll` 分发时版本兼容 |
| move 语义保障 | `unique_ptr` 自身支持 move，`HttpClient` 的移动构造/赋值 = 指针拷贝，noexcept 天然成立 |

代价：每次成员访问多一次指针间接跳转；`clear_headers()` 这种一行操作也得走 `impl_->headers_.clear()`。

> Qt 中叫 **d-pointer**（`Q_D`/`Q_Q` 宏），驱动力同样源自 ABI 稳定性——Qt 以动态库分发，不能因加字段让用户程序 crash。

**fast Pimpl** 变体：用 `std::aligned_storage` 在栈上预留内存，避免堆分配开销，需自行管理生命周期和对齐。仅在性能热点中使用。

### 流式传输的 Accept Header 约定

```cpp
// post()：攒齐再返回
curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);  // 写入 string

// post_stream()：边收边抛
curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, stream_callback); // 每块立刻回调
header_list = curl_slist_append(header_list, "Accept: text/event-stream");
```

`Accept: text/event-stream` 不是协议转换，而是 HTTP 内容协商的**约定暗示**，告诉服务端"请按 SSE 格式返回"。服务端可以不理会这个 header（此时 `stream_callback` 只被调用一次，退化为一整块数据），区别仅在于回调解触发时机：

| | write_callback (post) | stream_callback (post_stream) |
|---|---|---|
| 触发次数 | 1 次（完整响应到达后） | N 次（每块数据到就触发） |
| 回调内容 | 追加到 string | 直接抛给用户回调 |
| 用户感知 | 同步等待完整响应 | 实时接收到每个 chunk |

## 数据模型

### A2A 协议概念体系 → C++ 映射

| 协议概念 | 代码实体 | 文件 |
|----------|---------|------|
| AgentCard（自描述） | `AgentCard` + `AgentCapabilities` / `AgentSkill` / `AgentProvider` | `agent_card.hpp` |
| Task（工作单元） | `AgentTask` + `AgentTaskStatus` | `agent_task.hpp` + `task_status.hpp` |
| TaskState（生命周期枚举） | `TaskState` (6 值，缺 `input-required`) | `types.hpp` |
| Message（通信单元） | `AgentMessage` + `MessageRole` | `agent_message.hpp` |
| Part（原子内容） | `Part` 抽象基类 → `TextPart` / `FilePart` / `DataPart` | `message_part.hpp` |
| Artifact（产出物） | `Artifact`（带可选 uri/content/metadata） | `artifact.hpp` |
| 响应联合体 | `A2AResponse`（`Task` 或 `Message` 变体） | `a2a_response.hpp` |
| 持久化接口 | `ITaskStore` 纯虚接口 → `MemoryTaskStore` / `RedisTaskStore` | `task_store.hpp` |
| 任务管理器 | `TaskManager`（回调 + Pimpl） | `task_manager.hpp` |
| 客户端 | `A2AClient`（Pimpl，封装 JSON-RPC + HTTP） | `a2a_client.hpp` |

AgentCard 的 `protocol_version` 固定为 `"0.3.0"`——这是 A2A 协议的当前版本号，服务端通过它向客户端声明自己遵循的协议版本。AgentSkill 的 `input_modes` / `output_modes` 数组解决了"这个 Agent 能处理什么格式的输入、输出什么格式的结果"的能力协商问题。

### Message 的 Part 多态体系

```cpp
class Part {
    virtual PartKind kind() const = 0;    // Text / File / Data
    virtual std::string to_json() const = 0;
    virtual std::unique_ptr<Part> clone() const = 0;
};
```

选择 `vector<unique_ptr<Part>>` 而非 `variant<TextPart, FilePart, DataPart>` 的原因：

| 方案 | 优点 | 缺点 |
|------|------|------|
| `vector<unique_ptr<Part>>` | 类型可扩展（新增 Part 子类不需改容器） | 堆分配开销，虚函数调用 |
| `variant<TextPart, FilePart, DataPart>` | 值语义，无堆分配，cache-friendly | 硬编码所有类型，新增子类必须改 variant 定义 |

A2A 协议未来可能扩展 Part 类型（如 `AudioPart`、`VideoPart`），用多态更灵活。代价是 `AgentMessage` 必须手动实现深拷贝（见 `agent_message.hpp:21-48` 的复制构造/赋值）。

### MIME 数据与音视频传输

`FilePart` 设计：
```cpp
class FilePart : public Part {
    std::string              filename_;
    std::string              mime_type_;  // "video/mp4", "audio/wav" 等
    std::vector<uint8_t>     data_;       // 二进制载荷
};
```

两种传输策略的取舍：

| 策略 | 传输方式 | 优劣 |
|------|---------|------|
| 内联 base64 | data 字段直接放二进制（JSON 不直接支持二进制，需编码） | 简单、自包含；data 膨胀 33%，大体积不适用 |
| URI 引用 | data 中放链接，接收方另请求资源 | 高效、支持大文件；需文件/对象存储服务 |

本项目仅实现内联方式。生产环境大文件用 URI 引用：
```json
{ "parts": [{ "kind": "file", "mime_type": "video/mp4",
              "uri": "https://storage.example.com/videos/demo.mp4" }] }
```

### 联合响应
**A2AResponse**：同一个方法可以返回 `AgentTask` 或 `AgentMessage`，用枚举 `Type { Task, Message }` + `is_task()` / `is_message()` 查询当前类型。另一种实现方式：`std::variant<AgentTask, AgentMessage>`。本项目选择手写联合体，语义更明确。

两种 discriminated union 实现方式对比：

| | 手写联合体（本项目） | `std::variant` |
|---|---|---|
| 访问方式 | `resp.is_task() → resp.as_task()` 语义直接 | `std::holds_alternative<T>(resp)` + `std::get<T>(resp)` |
| 扩展性 | 新增类型要改 class 定义 | 改 using 别名即可 |
| 异常安全 | 无异常路径（因只存储两种类型） | `std::bad_variant_access` 可能抛出 |
| 内存布局 | 两个成员都分配内存，浪费一个对象空间 | 只存最大类型，节省内存 |
| 代码可读性 | 意图一目了然 | 模板访问稍显啰嗦 |

选择理由：`A2AResponse` 只有 Task/Message 两种可能，手写联合体代码量不多，阅读时 `as_task()` 比 `std::get<AgentTask>` 更直观。

### Part 多态 vs variant 的深层取舍

```cpp
// 当前方案：多态 + unique_ptr
vector<unique_ptr<Part>> parts_;    // Part 是抽象基类
parts_.push_back(make_unique<TextPart>("hello"));
parts_.push_back(make_unique<FilePart>("img.png", "image/png", data));

// 替代方案：variant
vector<variant<TextPart, FilePart, DataPart>> parts_;
parts_.push_back(TextPart("hello"));
```

| 维度 | `vector<unique_ptr<Part>>` | `variant<TextPart, FilePart, DataPart>` |
|------|---------------------------|----------------------------------------|
| 新增子类 | 定义新 class 继承 Part，无需改容器代码 | 必须改 variant 定义 + 所有 visitor |
| 存储方式 | 堆分配每个 Part 对象，动态分发 | 值语义，栈分配，连续内存 |
| 拷贝代价 | 虚函数 `clone()`，手动实现深拷贝 | 编译器生成拷贝，值拷贝即可 |
| 访问开销 | 虚函数调用（运行时） | `std::visit` 编译期生成跳转表 |
| 删除/插入 | unique_ptr 自动管理 | variant 值语义，vector 自动管理 |
| 典型场景 | 类型集未知、可能扩展 | 类型集固定、性能敏感 |

核心矛盾：**A2A 的未来扩展性 vs 当前已知的三种类型。** 项目选择了面向未来的多态方案。代价是 `AgentMessage` 必须手动深拷贝（`agent_message.hpp:21-48`）。如果 A2A 规范引入了 `AudioPart`、`VideoPart`，多态方案只需要加一个子类，`variant` 方案要改所有用到类型列表的地方。

## 示例系统

### 固定地址多 Agent 系统

架构示意：
```
Orchestrator (5000)
  ├── 意图 "math" → Math Agent (5001)
  │                    └── 从 Redis 读历史
  └── 意图 其他   → LLM 直接回复
```
 
**这不是真正的 Multi-Agent。** 用户对 "1+1=?" 发起 POST 后，Orchestrator 内部是同步等待的：
```
用户 POST / → Orchestrator
  Orchestrator:
    1. identify_intent("1+1=?") → "math"
    2. 保存用户消息到 Redis
    3. ↓ 同步阻塞 ↓
    4. POST / → Math Agent 处理 → 等它返回
    5. 保存回复到 Redis
    6. 返回给用户
```
 
Orchestrator 发 POST 给 Math Agent 后必须阻塞等待响应，这期间不能处理其他请求。本质是**意图路由器 + 后端 HTTP 代理**，不是多 Agent 协作。

| 对比 | 本项目 | 真正多 Agent |
|------|--------|-------------|
| 通信 | 同步 HTTP 阻塞 | 异步 Task 驱动 |
| 协作 | 路由到单个子 Agent | 并行分发 + 结果合并 |
| 状态 | Redis 共享历史 | 每个 Agent 独立 Task 管理 |
| 扩展 | 加 Agent 需改代码 | 动态发现 + Plan 自动分配 |

### 注册中心如何工作

`agent_registry.hpp` 的定义：
```cpp
class AgentRegistry {
    std::map<std::string, AgentRegistration> agents_;       // agent_id → 注册信息
    std::map<std::string, std::set<std::string>> tags_index_; // tag → agent_id 集合
    int heartbeat_timeout_;  // 30秒无心跳视为离线
    int cleanup_interval_;   // 每60秒清理一次
};
```

`RegistryClient` 中的轮询负载均衡（`registry_client.hpp:92-108`）：
```cpp
std::string select_agent_by_tag(const std::string& tag) {
    auto agents = find_agents_by_tag(tag);
    static std::map<std::string, size_t> round_robin_index;
    size_t& index = round_robin_index[tag];
    std::string address = agents[index % agents.size()].address;
    index++;
    return address;
}
```

启动脚本 `start_dynamic_system.sh` 启动 5 个进程：Registry(8500) + Orchestrator(5000) + Math Agent x2(5001/5002) + Redis。每个进程独立、通过 HTTP/Redis 通信。

### 本项目多 Agent 的本质

本质上这是一个**共享历史存储的意图路由系统**，而不是多 Agent 协作系统。存在的问题：

1. **同步代理**：Orchestrator 阻塞等待子 Agent 返回（`redis_orchestrator.cpp:151-177` 的 `call_math_agent`）
2. **意图识别太简陋**：`identify_intent()` 用关键词匹配（`+ - * /` 等），不是 LLM 判断（`redis_orchestrator.cpp:136-148`）
3. **单层路由**：只有 Orchestrator → Math Agent，不支持层次化
4. **Registry 不可靠**：内存 `std::map` 存储，Registry 进程挂掉全部丢失

## 附录

### MCP vs A2A

| | MCP (Model Context Protocol) | A2A (Agent-to-Agent) |
|---|---|---|
| 提出者 | Anthropic | Google |
| 解决 | Agent → 工具/数据 | Agent ↔ Agent 协作 |
| 方向 | 单向 (Client → Server) | 双向 (相互发现、委托) |
| 传输 | stdio / SSE | HTTP / gRPC / WebSocket |
| 生命周期 | 无（一次调用结束） | 有（Task: submitted → completed） |
| 持久化 | 无 | TaskStore 可插拔接口 |
| 服务发现 | 无（URL 写死） | AgentCard + 注册中心 |
| 推送通知 | SSE 流替代 | Webhook Push |

一句话：**MCP 给 Agent 装上了手和眼，A2A 让 Agent 之间能说话和协作。**

### 认证机制

（本 SDK 未实现，仅 `HttpClient::add_header()` 提供扩展点）

| 机制 | 实现方式 | 安全等级 | 适用场景 |
|------|---------|---------|---------|
| API Key | Header: `X-Api-Key: <key>` | 低 | 内部信任网络 |
| OAuth 2.0 | Client Credentials → Bearer Token | 中 | 跨组织 |
| mTLS | 双向 TLS 证书 | 高 | 金融/医疗 |

### 推送通知

（本 SDK 仅定义方法常量，未实现逻辑）

A2A 的 Push 方向与常规 RPC 相反：调用方注册 webhook URL，被调用方在任务完成后反向 POST 通知。区别于 MCP 的 SSE（同一长连接推流），Push 是独立 HTTP 连接，适合跨服务器的异步通知场景。

### 本 SDK 已知缺失

| 缺失 | 影响 |
|------|------|
| `TaskState::InputRequired` 缺失 | Agent 请求用户补充输入的场景无法正确表示状态 |
| `tasks/list` 未实现 | 无法查询 Agent 的任务列表 |
| 传输层未抽象接口 | HTTP-only，不能直接插拔 gRPC/WebSocket |
| 认证无封装 | 跨组织需自行实现 OAuth2/mTLS |
| 推送通知未实现 | 只能轮询查任务状态 |
| UUID 生成简化 (`counter+timestamp`) | 多进程 ID 冲突风险 |


## 企业级 Multi-Agent 架构扩展

以上分析基于本项目代码。以下讨论跳出本项目，从企业级视角看 Multi-Agent 系统应该怎么设计。本项目存在的核心问题：**同步代理转发 + 简陋意图识别 + 无状态管理**，企业级方案逐一对应解决。

### Task 路由：同步代理 → 异步 Task 驱动

本项目 Orchestrator 等待子 Agent HTTP 响应的方式违反了 HTTP 请求-响应模型的设计约束。**正确的 A2A 异步模式**：

```
用户 → SendMessage → Orchestrator
  Orchestrator:
    1. 创建顶级 Task (状态: submitted)
    2. 返回 202 Accepted + task_id
    3. LLM 生成 Plan → 拆分子任务
       Plan: [
         {step: "search", dep: [], agent: "WebSearch"},
         {step: "analyze", dep: ["search"], agent: "Analysis"},
         {step: "report", dep: ["analyze"], agent: "Report"}
       ]
    4. 创建子 Task → 发布到事件总线 (Kafka)
    5. WebSearch Agent 消费事件 → 处理 → 发布结果
    6. Analysis Agent 等依赖满足 → 消费 → 处理
    7. Report Agent 同上
    8. 所有子 Task 完成 → 顶级 Task → completed
    9. 用户可通过 tasks/get 轮询或 Webhook 接收通知
```

关键区别：Orchestrator 不阻塞。每个 HTTP 调用独立、同步，跨 Agent 协调通过 Task 状态机 + 事件总线完成。

### 四层企业级架构

```
第1层：网关层 (Gateway Layer)
  API Gateway (Kong/Envoy)
  职责：协议转换、认证（OAuth2/mTLS）、限流、路由到 Orchestrator
  端点：/.well-known/agent-cards → 返回所有 Agent 元数据集合

第2层：编排层 (Orchestration Layer)
  Orchestrator Agent（管理面 + 控制面）
  职责：
  - 接收请求，创建顶级 Task
  - LLM 生成 Plan → 拆分为子任务（含依赖关系）
  - 拓扑排序 → 确定并行/串行执行顺序
  - 分发子任务（事件总线）→ 收集结果 → 合并
  - 错误处理、超时、重试

第3层：Agent 池 (Agent Pool)
  每个 Agent 独立进程/容器
  - 独立 AgentCard（name/skills/capabilities）
  - 独立 TaskManager + TaskStore
  - 支持层次化：Agent 内部可以有自己的子 Orchestrator
  - 注册到 Registry 时声明 tags + capabilities

第4层：基础设施层 (Infrastructure Layer)
  etcd/Consul: 服务注册与发现（替代内存 std::map）
  Redis Cluster: 热数据缓存 + 分布式锁
  PostgreSQL: 全量历史持久化 + SQL 查询
  Kafka/RabbitMQ: 事件总线（异步任务分发）
  S3/MinIO: 大文件 Artifact
```

### Plan-then-Execute 模式

这是 AI Agent 系统最核心的设计模式，也是「LLM 写 plan 拆任务」的正式名称：

```
输入: "帮我分析 Q3 竞争对手策略，生成报告，发邮件给团队"

Orchestrator 调用 LLM:
  Plan: [
    { step: "search",  agent: "WebSearchAgent",
      params: { query: "competitor Q3 strategy 2025" } },
    { step: "analyze", agent: "AnalysisAgent",
      deps: ["search"] },
    { step: "report",  agent: "ReportAgent",
      deps: ["analyze"], format: "markdown" },
    { step: "email",   agent: "EmailAgent",
      deps: ["report"], to: "team@company.com" }
  ]

拓扑排序: search(无依赖) → analyze(依赖search) → report(依赖analyze) → email(依赖report)
执行顺序: search 先开始 → analyze 等 search 结束 → report 等 analyze 结束 → email 等 report 结束
结果合并返回
```

Claude Code 的 plan mode、LangChain Plan-and-Execute、AutoGPT 都是同一思想在不同场景的实现。

### 层次化 Agents (Hierarchical Agents)

```
顶级 Orchestrator
  ├── ResearchAgent
  │     ├── WebSearchAgent
  │     └── DocReaderAgent
  ├── PPTAgent
  └── EmailAgent
```

每个 Sub-Agent 可以有自己的 Sub-Agent。资源级嵌套 ≤ 3 层。Sub-Agent 通过 Registry 暴露自己的 AgentCard，父 Orchestrator 通过 task 类型识别并路由。

### 事件驱动替代 HTTP 同步

```
企业级方案：Kafka 事件总线
  Orchestrator → Topic: task.assigned
    ├── WebSearchAgent 订阅 → 处理 → Topic: task.completed
    ├── AnalysisAgent 订阅（过滤 deps 满足后）→ Topic: task.completed
    └── ReportAgent 订阅（过滤 deps 满足后）→ Topic: task.completed
  Orchestrator 订阅 task.completed → 检查所有子 Task 是否完成 → 完成顶级 Task
```

### 关键设计要点

1. AgentRegistry 用 etcd/Consul 替代内存 std::map：支持 TTL 自动续约、Leader 选举、配置同步
2. 分层存储：Redis(热数据当前轮) + PostgreSQL(冷存储全量) + S3(大文件)，异步落库
3. 这个项目展示了 A2A 落地的完整骨架：AgentCard 发现 → JSON-RPC 通信 → Task 生命周期 → 跨进程存储。骨架是对的，肌肉（工程化）还需填充

