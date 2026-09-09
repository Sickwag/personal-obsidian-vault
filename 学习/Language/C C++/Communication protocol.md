---
create: 2026-09-08
---
# Modbus
参考：[Modbus Application Protocol V1.1b3](https://modbus.org/docs/Modbus_Application_Protocol_V1_1b3.pdf)
参考：[Modbus over Serial Line V1.02](https://modbus.org/docs/Modbus_over_serial_line_V1_02.pdf)
官方文档: https://libmodbus.org/reference/

## 协议定位与解决什么问题
Modbus 是工业自动化最普及的应用层通信协议，1979 年由 Modicon（现施耐德）发布，用于 PLC、传感器、仪表、执行器之间交换数据（读温度、写阀门开度）。免费开放，规范由 Modbus Organization 维护。
- 应用层协议，不定义物理层：可跑在串口（RS-232/RS-485）与以太网 TCP/IP 上
- 与 ROS2 话题的差异：ROS2 是基于 DDS 的 pub/sub 去中心化匿名通信；Modbus 是主从 Request/Response，一主多从、主站轮询，属典型的现场总线请求-响应模型

## 主从模型与通信过程
- Master（主站，TCP 侧称 Client）发起所有请求；Slave（从站，TCP 侧称 Server）只能应答，从不主动发数据
- 从站地址 1-247，广播地址 0（所有从站执行、不应答）
- 每个请求-响应对称为一个事务（Transaction），主站按周期轮询所有从站
- 时序约束：从站收到请求后须在 3.5 字符时间内开始响应（RTU 帧间隔），主站设超时（典型 1s）未收到响应判定从站离线，进入下一轮

## 数据模型：四张表
Modbus 数据模型按「位/字 × 读/写」划分为四张表：

| 表                      | 最小单位   | 访问   | 常用功能码        |
| ---------------------- | ------ | ---- | ------------ |
| 线圈 Coil                | 1 bit  | 可读可写 | 01 / 05 / 0F |
| 离散输入 Discrete Input    | 1 bit  | 只读   | 02           |
| 保持寄存器 Holding Register | 16 bit | 可读可写 | 03 / 06 / 10 |
| 输入寄存器 Input Register   | 16 bit | 只读   | 04           |

位操作（05 / 0F）只作用于线圈，字操作（06 / 10）只作用于保持寄存器，不能混用。

### 地址三套编号（易错点）
同一物理点在三种语境有三套编号，混用是地址偏移错误的根源：

| 编号     | 范围            | 说明                              |
| ------ | ------------- | ------------------------------- |
| PDU 地址 | 0x0000-0xFFFF | 帧内实际传输的地址，从 0 起                 |
| 协议地址   | 1-9999 等      | 文档描述用，保持寄存器从 40001 起、线圈 00001 起 |
| 设备地址   | 厂商自定义         | PLC 组态 / HMI 里看到的地址             |

协议地址 = PDU 地址 + 基址（保持寄存器基址 40001）。4xxxx 前缀是历史遗留，新设备通信时一律以 PDU 地址（从 0 计数）为准。

## 帧格式
### Modbus RTU（二进制，串口主流）

| 字段 | 字节 | 说明 |
|------|------|------|
| 从站地址 | 1 | 1-247，0 广播 |
| 功能码 | 1 | 请求功能码 |
| 数据 | N | 地址 / 数量 / 值，高字节在前 |
| CRC16 | 2 | Modbus CRC16，低字节在前 |

```
读从站 1 保持寄存器，地址 0x0000 起 2 个：
01 03 00 00 00 02 C4 0B
│  │  │  │  │  │  └─── CRC16(低字节 0B 在前)
│  │  │  │  └──┴────── 数量 2
│  │  └──┴──────────── 起始地址 0x0000
│  └────────────────── 功能码 0x03 读保持寄存器
└──────────────────── 从站地址 1
```
- 帧内字节间隔 ≤ 1.5 字符时间；帧间隔 ≥ 3.5 字符时间（9600 波特率下约 4ms）
- 间隔超限从站视为帧断裂丢弃，这是 RTU 与 TCP 的关键差异：无显式帧长字段，靠时间间隔定界

### Modbus ASCII（字符编码，老设备）
- 每字节编码为 2 个 ASCII 十六进制字符，体积为 RTU 的 2 倍
- 校验用 LRC（纵向冗余校验），帧以 `:`（0x3A）起始、CRLF 结束
- 适用场景：仅支持 ASCII 的文本网关、字符终端调试；现多被 RTU 取代

### Modbus TCP（以太网）
MBAP 头 + PDU，无从站地址与 CRC（TCP 本身可靠）：

| 字段 | 字节 | 说明 |
|------|------|------|
| 事务标识 Transaction ID | 2 | 匹配请求与响应 |
| 协议标识 Protocol ID | 2 | 恒 0x0000（Modbus） |
| 长度 Length | 2 | 后续字节数（单元标识 + PDU） |
| 单元标识 Unit ID | 1 | 网关后设备寻址，类比 RTU 从站地址 |

### 三帧对比

| 维度 | RTU | ASCII | TCP |
|------|-----|-------|-----|
| 编码 | 二进制 | ASCII 十六进制字符 | 二进制 |
| 校验 | CRC16 | LRC | 无（依赖 TCP） |
| 效率 | 高（紧凑） | 低（2 倍体积） | 高 |
| 物理层 | RS-485 / RS-232 | RS-485 / RS-232 | 以太网 |
| 帧定界 | 时间间隔（3.5 字符） | 起始/结束字符 | TCP 流 + Length |
| 典型场景 | 串口主流 | 老式仪表 / 文本网关 | 以太网设备、PLC 以太网口 |

## 功能码分类与常用码

| 范围 | 类别 |
|------|------|
| 0x01-0x40 | 公共功能码（被规范定义） |
| 0x41-0x48 | 用户定义功能码 |
| 0x49-0x77 | 保留 |
| 0x78-0x7F | 用户定义功能码 |
| 0x80-0xFF | 异常响应（功能码 | 0x80） |

常用公共功能码：

| 码 | 名称 | 作用对象 |
|----|------|---------|
| 0x01 | Read Coils | 读线圈 |
| 0x02 | Read Discrete Inputs | 读离散输入 |
| 0x03 | Read Holding Registers | 读保持寄存器 |
| 0x04 | Read Input Registers | 读输入寄存器 |
| 0x05 | Write Single Coil | 写单个线圈 |
| 0x06 | Write Single Register | 写单个保持寄存器 |
| 0x0F | Write Multiple Coils | 写多个线圈 |
| 0x10 | Write Multiple Registers | 写多个保持寄存器 |

## 异常响应
请求无法处理时从站回：功能码最高位置 1（原码 | 0x80）+ 1 字节异常码。

| 异常码 | 含义 |
|--------|------|
| 0x01 | 非法功能（从站不支持） |
| 0x02 | 非法数据地址（地址越界） |
| 0x03 | 非法数据值（数量超限等） |
| 0x04 | 从站设备故障 |
| 0x06 | 从站忙（主站稍后重试） |

## 寄存器字节序与多字节数据类型（实战大坑）
- 单寄存器 16 位：高字节在前（Big-endian），如 0x1234 发送顺序 `12 34`
- 32 位 int / float 跨两个寄存器，字节序与字序因设备而异，常见布局：

| 布局 | 寄存器顺序 | 示例 0x12345678 |
|------|-----------|----------------|
| AB CD（Big-endian） | 高字在前 | reg0=0x1234, reg1=0x5678 |
| CD AB（word swap） | 低字在前 | reg0=0x5678, reg1=0x1234 |

- 设备文档必须标明字节序，否则多字节数据读出来数值错乱
- 位数据（线圈）的位序也有 bit0 / bit7 两种起点，跨厂商对接时同样要确认

### 动手验证：libmodbus 最小主从（TCP）
工程：`/home/azzato/CodeFiles/learning/modbus-learnWithAI/01_tcp_basic/`（CMake + vcpkg 集成 libmodbus 3.1.12）
- `slave_tcp.c`：`modbus_new_tcp` + `modbus_mapping_new(10,10,10,10)` 建四表数据模型 → `modbus_tcp_listen` / `modbus_tcp_accept` 等待连接 → 循环 `modbus_receive` + `modbus_reply`
- `master_tcp.c`：`modbus_new_tcp` + `modbus_connect` → `modbus_read_registers` / `modbus_write_register` 读写保持寄存器
- `modbus_set_debug(ctx, TRUE)` 打印原始字节帧，对照协议结构验证

实际抓到的请求帧（读保持寄存器，地址 0 起 2 个）：
```
[00][01][00][00][00][06][FF][03][00][00][00][02]
```
MBAP 头 `00 01`（事务标识 1）+ `00 00`（协议标识）+ `00 06`（长度 6）+ `FF`（单元标识 255）+ PDU `03 00 00 00 02`。响应帧 `... FF 03 04 12 34 00 00` 中 `04` 为字节数，`12 34` 为从站 `tab_registers[0]` 预填值。写 `0xCAFE` 后重读正确回读。

#### 源码对照入口
vcpkg buildtrees 保留 libmodbus 3.1.12 完整源码：`/home/azzato/Programs/vcpkg/buildtrees/libmodbus/src/v3.1.12-39321b4d68.clean/`

| 文件 | 行数 | 职责 |
|------|------|------|
| `src/modbus.c` | 2144 | 核心：上下文、请求构建、响应解析、功能码分发 |
| `src/modbus-rtu.c` | 1292 | RTU 传输：CRC16、帧定界 |
| `src/modbus-tcp.c` | 1071 | TCP 传输：MBAP 封装 |
| `src/modbus-data.c` | 241 | 数据工具函数 |

协议常量集中在 `src/modbus.h`：`MODBUS_FC_*`（功能码）、`MODBUS_MAX_READ_REGISTERS=125` 等上限、`MODBUS_EXCEPTION_*`（异常码）、`MODBUS_MAX_ADU_LENGTH=260`。注意 libmodbus 用 `MODBUS_ENOBASE` 偏移自定义 errno（`EMBXILADD` 等），从站异常通过负 errno 返回给主站。

