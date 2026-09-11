---
create: 2026-09-08
---
# Modbus
## 实验环境
学习代码位于 `/home/azzato/CodeFiles/learning/modbus-learnWithAI`，使用 CMake Presets 管理构建，依赖由 `/home/azzato/Programs/vcpkg` 提供，目标 triplet 为 `x64-linux`。
- 编译器：GCC 13.3
- 构建工具：CMake 3.28.3、Ninja
- Modbus 库：`libmodbus 3.1.12`，CMake target 为 `modbus`
- MQTT C++ 主库：Eclipse Paho MQTT C++ `1.6.0`，使用 `<mqtt/async_client.h>` 和 `mqtt::async_client`，CMake target 为 `PahoMqttCpp::paho-mqttpp3`
- 底层依赖：Paho MQTT C `1.3.16`，由 Paho MQTT C++ 自动链接，不作为课程代码的直接 API
- MQTT Broker：Mosquitto `2.0.18`，本机临时测试端口为 `18883`
工程中的 `dependency_smoke` 已完成编译、链接和 `ctest` 验证；Mosquitto 已完成一次发布/订阅链路验证。
```bash
cd /home/azzato/CodeFiles/learning/modbus-learnWithAI
VCPKG_ROOT=/home/azzato/Programs/vcpkg cmake --preset debug
VCPKG_ROOT=/home/azzato/Programs/vcpkg cmake --build --preset debug
VCPKG_ROOT=/home/azzato/Programs/vcpkg ctest --preset debug --output-on-failure
```
# MQTT
## QoS 的确定时机
MQTT 的 QoS 不是连接级属性，而是应用消息投递过程的属性。建立 `CONNECT` 连接时不会为后续所有消息统一设置 QoS。

| 通信方向 | QoS 的直接决定者 | 确定时机 | 建立连接后是否可变 |
| --- | --- | --- | --- |
| 发布者 → Broker | 发布者 | 每个 `PUBLISH` 报文 | 可以，下一条消息可使用不同 QoS |
| Broker → 订阅者 | Broker 根据两端配置计算 | 转发每条消息时 | 可以，重新订阅可改变后续消息 |

- 发布者在 `PUBLISH` 固定报头中指定 QoS，可以在同一条 MQTT 连接上交替发送 QoS 0、QoS 1 和 QoS 2 消息。
- 订阅者在 `SUBSCRIBE` 中为每个 Topic Filter 指定允许的最大 QoS，Broker 通过 `SUBACK` 返回最终授予值。
- Broker 向某个订阅者转发时，实际 QoS 通常为 `min(原始 PUBLISH QoS, 订阅者获准的最大 QoS)`。订阅者请求 QoS 1 不能把发布者的 QoS 0 升级为 QoS 1，只能把 QoS 2 降级为 QoS 1。
- 已经发送或正在确认的 `PUBLISH` 报文不能中途修改 QoS；需要改变时只能对后续消息重新指定，或将其作为新消息重新发布。
- QoS 1、QoS 2 的 `Packet Identifier` 只用于当前未完成的协议事务，不是全局唯一的业务消息 ID。
## QoS 1 的核心语义
QoS 1 的目标是“至少交付一次”，即接收方可能收到一次，也可能收到多次。发送方在收到对应的 `PUBACK` 前必须保留 `PUBLISH` 报文，以便在超时、断线重连等情况下重传。
```text
发送方                              接收方
PUBLISH(QoS=1, PID=1024, DUP=0)  --->
                                  处理 PUBLISH
PUBACK(PID=1024)                 <---
发送方收到 PUBACK，释放消息缓存和 PID
```
`PUBACK` 只确认当前这一跳的 MQTT 对端已经接收并确认了 `PUBLISH`。在典型的发布者、Broker、订阅者拓扑中，发布者收到 Broker 的 `PUBACK`，不等于订阅者已经收到或执行了消息；Broker 到订阅者之间还存在独立的 QoS 投递过程。
## QoS 1 消息重复的根因
发送方没有收到 `PUBACK` 时，无法区分以下两种状态：

1. `PUBLISH` 没有到达接收方。
2. `PUBLISH` 已到达并被处理，但 `PUBACK` 在返回途中丢失。

如果发送方不重传，第一种情况会丢消息；如果发送方重传，第二种情况会重复处理。因此 QoS 1 选择“宁可重复，也尽量不丢失”。
```text
PUBLISH(QoS=1, PID=1024, DUP=0)  --->  接收并处理
PUBACK(PID=1024)                 -X-  返回报文丢失
发送方认为投递未完成
PUBLISH(QoS=1, PID=1024, DUP=1)  --->  再次接收并可能再次处理
PUBACK(PID=1024)                 <---
```
TCP 只能保证连接内的字节流可靠有序，不能让发送方确认“接收进程是否已经执行完业务逻辑”。接收方可能在处理消息后发送 `PUBACK`，随后连接断开，发送方仍然只能看到“没有收到确认”这一结果。
## `DUP` 标志不能用于简单去重
重传的 `PUBLISH` 会将 `DUP` 置为 `1`，但 `DUP=1` 只表示发送方认为当前报文是重传，不表示接收方一定见过原始报文。

- 原始 `PUBLISH` 丢失时，重传报文可能是接收方第一次看到的消息；丢弃所有 `DUP=1` 会导致消息丢失。
- 原始 `PUBLISH` 已处理而 `PUBACK` 丢失时，重传报文确实可能造成重复处理。
- `Packet Identifier` 在一次事务完成后可以复用。后续新消息可能使用相同的 PID，其重传版本同样会带 `DUP=1`，因此 PID 和 `DUP` 不能组成可靠的业务去重键。
接收方必须把 QoS 1 的重复处理交给业务层的幂等逻辑，不能仅依据 `DUP` 丢弃消息。
## 业务层的幂等处理
QoS 1 适合重要但允许消费者实现幂等的消息。常用做法是将业务标识放入 Payload 或 MQTT 5.0 属性中：

- 为每条业务消息生成 `message_id`，消费者用数据库唯一约束记录已处理消息。
- 为单生产者消息携带单调递增的 `sequence`，消费者丢弃已经处理过或更旧的序号。
- 优先设计幂等操作，例如 `SET state = ON`；谨慎处理 `INCR`、`toggle`、重复扣款等非幂等操作。

QoS 2 通过 `PUBLISH → PUBREC → PUBREL → PUBCOMP` 的额外状态确认，在 MQTT 协议层处理重复投递；但它不自动保证数据库事务、设备动作或业务函数只执行一次，业务侧仍需要事务或幂等设计。
### QoS 1 去重方法的选型
QoS 1 的去重键必须来自业务语义，不能直接使用 `Packet Identifier` 或 `DUP`。常用方法如下：

| 方法 | 核心做法 | 适用场景 | 主要限制 |
| --- | --- | --- | --- |
| `message_id` | 每条业务消息携带全局唯一 ID，消费者记录已处理 ID | 命令、事件、订单等不可重复执行的消息 | 需要存储去重记录并处理记录过期 |
| 单调 `sequence` | 按生产者记录最大序号，丢弃已处理或更旧序号 | 单设备状态、传感器快照、单生产者流 | 多生产者或序号回绕时不能直接比较全局大小 |
| 数据库唯一约束 | 以 `producer_id + message_id` 建唯一索引，将去重判断与业务事务绑定 | 消费消息会修改数据库的服务 | 外部副作用仍需幂等或可靠消息方案配合 |
| 幂等业务操作 | 重复执行得到相同结果，例如 `SET state = ON` | 状态同步、配置下发 | 不适合 `INCR`、`toggle`、重复扣款等累加或切换操作 |

`message_id` 需要跨重连保持不变；重传时只是同一业务消息的再次投递，不能在消费者收到重传时重新生成 ID。对于需要严格顺序的单设备数据，可以同时使用 `message_id` 和 `sequence`：前者识别重复，后者识别过期和乱序。
## QoS 2 的向后分发时机
“向后分发”指 Broker 收到发布者的消息后，向匹配的订阅者继续发送 `PUBLISH`。它不是指发布者与 Broker 的 QoS 2 事务已经完成，而是 Broker 是否需要等待上游 `PUBREL` 后再启动下游投递。
```text
发布者                    Broker                    订阅者
PUBLISH(QoS=2, PID=X)  --->
                         保存消息和 PID 状态
PUBREC(PID=X)          <---
                         PUBLISH(下游 QoS)  -------->
PUBREL(PID=X)          --------->
PUBCOMP(PID=X)         <---------
```
Broker 收到第一次 QoS 2 `PUBLISH` 后有两种实现策略：

- 等待 `PUBREL`：确认上游不会再重传当前 `PUBLISH` 后，再向订阅者转发。状态判断简单，但订阅者至少要多等待一次上游握手，消息延迟更高。
- 立即向后分发：第一次收到 `PUBLISH` 后就启动下游投递，降低实时消息延迟；同时必须保存上游 `Packet Identifier`、Payload 和投递状态。

立即向后分发时，如果 Broker 在收到 `PUBREL` 之前再次收到相同 PID 的 `PUBLISH`，它必须把该报文视为同一个 QoS 2 事务的重传：再次回复 `PUBREC`，但不能再次向订阅者分发，否则会造成重复。`PUBREL` 到达后，Broker 才能推进上游事务的释放流程；收到 `PUBCOMP` 后当前 PID 才能安全复用。
下游投递是独立的 MQTT 事务，下游实际 QoS 仍由原始消息 QoS 和订阅者获准的最大 QoS 决定。Broker 可以向一个订阅者发送 QoS 2，同时向另一个只允许 QoS 1 的订阅者发送 QoS 1。
## 遗嘱消息
遗嘱消息（Last Will and Testament，LWT）是客户端在 `CONNECT` 时交给 Broker 保存的一条特殊消息。客户端异常断开时，Broker 代替客户端向指定 Topic 发布这条消息；客户端正常发送 `DISCONNECT` 时，通常会撤销遗嘱而不发布。

| 字段 | 作用 | 常见用途 |
| --- | --- | --- |
| `Will Flag` | `CONNECT` 固定报头中的标志位，表示是否携带遗嘱配置 | `0` 表示没有遗嘱；`1` 表示后续存在遗嘱字段 |
| `Will QoS` | Broker 发布遗嘱时使用的 QoS | 在线状态、设备故障通知；重要状态通常使用 QoS 1 |
| `Will Retain` | Broker 发布遗嘱时是否设置 `Retain` | 让之后才订阅状态 Topic 的客户端也能获得最新离线状态 |
| `Will Properties` | MQTT 5.0 中附加给遗嘱 `PUBLISH` 的属性集合 | 设置延迟、过期时间、内容类型、响应主题等 |
| `Will Topic` | Broker 发布遗嘱的目标 Topic | 例如 `device/001/status` |
| `Will Payload` | 遗嘱消息的 Payload，可以是文本、JSON 或二进制 | 例如 `offline` 或包含故障原因的 JSON |

### `Will Flag`
`Will Flag` 位于 `CONNECT` 可变报头的连接标志字段中，用来告诉 Broker 是否解析后续的 `Will QoS`、`Will Retain`、`Will Properties`、`Will Topic` 和 `Will Payload`。它不是“现在是否发送遗嘱”的开关，而是“本次会话是否配置遗嘱”的标志。
当 `Will Flag = 0` 时，遗嘱相关字段不应存在；当 `Will Flag = 1` 时，Broker 在返回 `CONNACK` 前必须完成遗嘱配置的保存。
### `Will QoS`
`Will QoS` 是遗嘱这条特殊 `PUBLISH` 的 QoS，不是客户端连接的 QoS，也不会改变普通业务消息的 QoS。遗嘱转发给不同订阅者时，仍可能根据各自订阅的最大 QoS 发生降级。
例如设备设置 `Will QoS = 1`，Broker 会尝试至少一次地发布离线消息；订阅者若只授予 QoS 0，则该订阅者收到的遗嘱会按 QoS 0 转发。
### `Will Retain`
`Will Retain = true` 表示 Broker 发布遗嘱时设置保留标志。Broker 会将遗嘱作为该 Topic 的最新 Retained Message 保存：

- 已在线的订阅者在遗嘱发布时收到离线消息。
- 之后才订阅该 Topic 的客户端也会立即收到最近的离线状态。
- 设备重新上线后，通常应发布一条 `online` 且 `Retain = true` 的普通消息，覆盖旧的 `offline` 状态。
- 清理 Retained Message 通常使用相同 Topic 发布空 Payload，并设置 `Retain = true`。

`Will Retain` 解决的是“订阅者上线时是否能看到历史状态”，`Will QoS` 解决的是“遗嘱投递过程的可靠性”，两者是独立配置。
### `Will Properties`
`Will Properties` 只存在于 MQTT 5.0，用于描述 Broker 将来发布的遗嘱 `PUBLISH`。常见属性包括：

- `Will Delay Interval`：异常断开后延迟发布遗嘱，避免短暂网络抖动立即产生离线告警。
- `Message Expiry Interval`：遗嘱发布后允许存在或被投递的时间。
- `Payload Format Indicator`：声明 Payload 是否为 UTF-8 文本。
- `Content Type`：描述 Payload 的内容类型，例如 `application/json`。
- `Response Topic`、`Correlation Data`：为遗嘱消息提供 MQTT 5.0 请求/响应关联信息。
- `User Property`：附加自定义键值对。

`Will Delay Interval` 与会话过期时间共同决定遗嘱的最晚触发时刻：如果会话先过期，Broker 不能继续等待遗嘱延迟时间，会在会话结束时发布遗嘱；因此会话过期时间为 `0` 时，遗嘱延迟通常不会产生实际延迟。
### 遗嘱的触发时序
```text
客户端                         Broker
CONNECT(携带遗嘱配置)       ---> 保存遗嘱
CONNACK                     <--- 连接成功

异常断开或 Keep Alive 超时       启动遗嘱延迟计时
                                发布 Will Topic / Payload
                                按 Will QoS 和 Will Retain 投递
```
常见异常断开原因包括设备掉电、网络中断、Keep Alive 超时和 Broker 因协议错误主动断开。MQTT 5.0 还可以使用带有 Will Message 语义的 `DISCONNECT`，显式要求 Broker 发布遗嘱；普通优雅断开通常会撤销遗嘱。
设备状态同步常用配置是：遗嘱 Topic 为 `device/{id}/status`，Payload 为 `offline`，`Will QoS = 1`，`Will Retain = true`；连接成功后发布 Retained 的 `online` 消息覆盖离线状态。
