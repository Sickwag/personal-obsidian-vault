---
github: https://github.com/LocasYang/CommStudio.git
created: 2026-10-01
---
## 本轮学习起点
学习目标是从源码理解 CommStudio 这款桌面通信调试工具。已有 C++、网络和系统开发基础；目前没有上位机开发经验，不熟悉串口、HEX、蓝牙/网络设备调试，也没有 Qt Quick/QML 基础。后续讲源码时先解释每个概念解决什么问题，再逐段解释 QML 语法、C++/QML 的连接方式、状态变化和数据流，不默认这些术语已掌握。
## 先理解几个概念
### 上位机与下位机
“上位机”通常是运行在电脑上的控制、配置和观测程序；“下位机”是被连接的设备，例如单片机、控制板或传感器。CommStudio 是上位机工具：选择一种通信方式，配置连接，发送数据，并观察设备回来的数据。串口、蓝牙和网络是不同的通信通道；学习或使用其中一种，并不要求同时启用另外两种。
### 串口
串口可以先理解成电脑与设备之间传送字节的通道。设备可能通过 USB 转串口线连接，在 Linux 上通常表现为 `/dev/ttyUSB0` 或 `/dev/ttyACM0` 这样的设备节点。两端必须使用匹配的波特率、数据位、校验位、停止位等参数，否则可能无法通信或收到乱码。
串口传送的是连续字节流。一次读取回调可能只拿到一条消息的一部分，也可能一次拿到多条消息；“收到了一批字节”不等于“收到了一条完整协议消息”。上层协议需要根据长度、分隔符或校验等规则判断消息边界。
### HEX（十六进制显示）
HEX 是人查看字节的一种记法，不是另一种通信方式，也不自动代表某个协议。一个字节有 8 位，通常写成两位十六进制数，例如 `0x41`。
- 文本发送 `A` 时，UTF-8 编码得到字节 `0x41`。
- HEX 发送框输入 `41` 时，也会构造字节 `0x41`。
- 文本模式输入字符 `41` 时，发送的是两个字符，对应字节 `0x34 0x31`。
因此，界面上看到的 HEX 是字节的可读表示；是否为 Modbus 等协议数据，要看这些字节如何按协议解释。
### 蓝牙与网络调试
设备调试通常是：选择通道并连接，按设备要求发送一组数据，查看是否收到预期回应，再据此判断连接参数或协议是否正确。CommStudio 的蓝牙页用于发现/连接附近设备并读写数据；低功耗蓝牙（BLE）常通过 GATT 服务和特征值交互，经典蓝牙串口类设备则常通过 RFCOMM/SPP 交换字节。
网络页用于连接 IP 地址和端口，或开启服务等待对端连接，再发送并观察数据。TCP 提供有序字节流，UDP 按数据报收发；它们是传输方式，数据本身采用什么应用协议由设备和使用者决定。初学时先把“通道（串口/蓝牙/网络）”和“通道里传输的数据格式/协议”分开理解。
### Qt Quick 与 QML
Qt 是 C++ 应用框架。Qt Quick 是 Qt 的界面技术，QML 是描述界面对象、布局、属性和交互的声明式语言。它更像“写出界面由什么组成、属性如何关联”，而不是逐句命令绘制每个控件。
- `ApplicationWindow { ... }` 创建一个应用窗口；花括号内列出它的属性和子对象。
- `width: 1200` 给窗口设置宽度；`visible: true` 表示窗口可见。
- `onClicked: { ... }` 是点击事件发生时要执行的代码块。
- `text: SerialManager.configSummary` 把控件文字绑定到 C++ 对象的属性；属性变化时界面可以更新。
- `SerialManager` 等名称由 C++ 注册给 QML。`Q_PROPERTY` 暴露属性，`Q_INVOKABLE` 或槽函数允许 QML 调用 C++，信号用于通知状态变化。
后续阅读 QML 时会把对象层级、属性绑定、信号处理器和 JS 表达式分别解释，并追踪它们最终调用哪个 C++ 函数。
## 程序启动与界面入口
README 的构建说明面向 Windows，写的是 `build-msvc/CommStudio.exe`。Linux 使用项目的 `debug` preset；本轮实际构建成功，Linux ELF 程序位于 `build/debug/bin/CommStudio`，从仓库根目录可运行 `./build/debug/bin/CommStudio`。它不在 `build/` 顶层。
阅读 `src/main.cpp` 时重点看：创建 `QGuiApplication`，构造并注册 `Studio`、`SerialManager`、`NetworkManager` 等 C++ 单例对象，然后由 `QQmlApplicationEngine::loadFromModule("CommStudio", "Main")` 加载 `qml/Main.qml`。这里的“注册单例”表示 QML 页面能通过 `SerialManager` 这样的名字访问对应 C++ 对象。
## 第一条数据链：串口发送与接收
串口页把界面和硬件操作分开：QML 负责按钮、输入框和状态展示，`SerialManager` 负责端口和收发，`HexCodec` 负责把用户输入转成字节，`TrafficModel` 保存收发记录供界面显示。
发送方向：
```text
SendPanel.qml 的发送按钮
  -> manager.send(输入框文本)
  -> SerialManager::send()
  -> HexCodec::buildPayload()（按文本/HEX模式生成字节）
  -> QSerialPort::write()（交给串口发送）
  -> TrafficModel 记录 TX
```
接收方向：
```text
设备发来字节
  -> QSerialPort::readyRead 信号
  -> SerialManager::onReadyRead()
  -> readAll() 取出当前可读字节
  -> TrafficModel 记录 RX
  -> QML 终端视图展示记录
```
注意，`readyRead` 只表示“当前有字节可读”，不表示完整协议包已到达。读代码时区分 TX（发送）和 RX（接收），并区分原始字节、HEX显示文本和协议解析后的字段。
## 建议文件阅读顺序
1. `README.zh-CN.md`：了解项目功能；记住其中的 Windows 构建路径不能直接当作 Linux 路径。
2. `src/main.cpp`：看应用如何创建、如何把 C++ 对象交给 QML、如何加载主界面。
3. `qml/Theme.qml`、`qml/I18n.qml`、`qml/Main.qml`：先理解主题/翻译，再看主窗口结构、导航和页面切换。第一遍只理解对象树和 `currentPage` 等状态，不需要记住所有视觉细节。
4. 串口页面纵向阅读：`qml/pages/SerialPage.qml`（端口配置与连接按钮）→ `qml/components/SendPanel.qml`（输入、发送按钮及其事件处理）→ `include/managers/serialmanager.h`（对 QML 暴露的属性/方法/信号）→ `src/managers/serialmanager.cpp`（构造、打开端口、`send()`、`onReadyRead()`）→ `include/core/hexcodec.h`、`src/core/hexcodec.cpp`（文本/HEX 转字节）→ `include/core/trafficmodel.h`、`src/core/trafficmodel.cpp`（保存并通知界面更新）→ `qml/components/TerminalView.qml`（呈现记录）。
5. `tests/comstudiotests.cpp`：基础链路看懂后再读测试，了解编码、校验等输入输出如何被验证；测试例子是学习辅助，不代表每个协议都已完整覆盖。
6. 网络模块：`qml/pages/NetworkPage.qml` → `include/managers/networkmanager.h` → `src/managers/networkmanager.cpp`，对比 TCP 字节流、UDP 数据报、客户端/服务端状态。
7. Modbus 模块：`qml/pages/ModbusPage.qml` → `include/managers/modbusmanager.h` → `src/managers/modbusmanager.cpp` → `include/core/modbuscodec.h`、`src/core/modbuscodec.cpp` → `include/core/checksumengine.h`、`src/core/checksumengine.cpp`。先区分底层传输和 Modbus 应用协议，再看 PDU/ADU 和校验。
8. 蓝牙模块：`qml/pages/BluetoothPage.qml` → `include/managers/bluetoothmanager.h` → `src/managers/bluetoothmanager.cpp`。先看设备发现、连接状态和收发入口，再分别了解 BLE GATT 与经典蓝牙。
9. 最后浏览 `qml/components/` 其余通用控件、`qml/pages/SettingsPage.qml`、`qml/pages/LogPage.qml`、`qml/pages/ToolboxPage.qml` 和 `src/windowchrome.cpp`。它们有助于理解界面复用和窗口功能，但不是理解通信收发的前置知识。
## 入门练习
- 在 `SendPanel.qml` 找到按钮事件，沿调用链一直追到 `QSerialPort::write()`，写下每一步输入和输出的类型。
- 对照 `HexCodec` 解释为什么文本 `A` 与 HEX `41` 最终是同一个字节，而文本 `41` 是两个字节。
- 找出接收路径中的 `readyRead` 连接，说明为什么它不能证明一条完整协议消息已经到达。
- 暂时不改代码，先给每个阅读文件标记“界面、通信管理、字节转换、数据模型、协议解析”中的一种角色。
## 学习状态
本轮完成：依据当前仓库启动路径和串口实现，建立面向零基础上位机/QML学习者的概念顺序与文件阅读路线；Linux Debug 构建成功。
待学习：逐个文件阅读、自己复述串口收发链路、继续学习网络/Modbus/蓝牙实现。此处只记录学习计划和状态，不代表已经掌握上述内容。

## 串口通信基础：时钟、波特率与帧
### 异步与同步的区别
“串行”指一位接一位传输；“异步/同步”主要描述接收端如何确定每一位的采样时刻。异步 UART 并非完全没有时钟：发送端和接收端各有本地时钟，但没有单独的时钟线把发送端时钟送给接收端。两端预先约定相同的波特率；每个字符帧的起始位边沿让接收端重新对齐，然后接收端按本地位时间在位中心附近采样。常见 UART 会过采样，并在每个帧的起始位重新同步，因此时钟误差不会跨帧一直累积，但单帧内误差不能大到让采样点跑到相邻位上。[Analog Devices：UART 时钟精度与帧同步](https://www.analog.com/en/resources/technical-articles/determining-clock-accuracy-requirements-for-uart-communications.html)
同步串行通常有数据线和时钟线。常见主从方式由主机输出时钟，从机直接观察同一组时钟边沿，不需要两边各自产生完全相同、一直锁相的独立时钟。协议规定在哪个边沿改变数据、在哪个边沿采样数据；SPI 的 CPOL/CPHA 就是相关配置。也有协议不另传时钟线，而从编码后的信号恢复时钟，所以“双方时钟始终一致”只是对部分同步系统的简化说法。[Microchip：同步 USART 主机时钟与数据边沿](https://ww1.microchip.com/downloads/en/DeviceDoc/41250F.pdf)
### 没有数据时的线路状态
异步 UART 没有待发数据时，不会持续发送代表“空”的字符帧；发送器处于空闲状态，TX 线保持逻辑 1（mark）。普通 MCU 的 TTL/CMOS UART 引脚通常表现为高电平；RS-232 收发器会反相并转换电压，因此逻辑 1（mark）是负电压。若线路实际断开或输入悬空，电平可能不确定，不能把悬空状态当作可靠的 UART 空闲电平。[TI：RS-232 电平与空闲 mark 状态](https://www.ti.com/lit/pdf/slau319)
同步串行没有统一的“无数据电平”。例如 SPI 没有数据字时，主机通常停止产生时钟并让片选无效；时钟停止期间数据线可能保持上次电平或由具体硬件决定。某些持续运行的同步链路会发送规定的 idle/control symbol 或填充内容。发送器的逻辑状态可能是发送队列为空、等待触发或暂停；若协议要求连续时钟，则可能仍要发送空闲符号。要知道线路具体发什么，必须看对应协议。
### 波特率
波特（Bd）严格来说是每秒传输的信号元素/符号数；ITU 给出的定义也可理解为信号单元持续时间的倒数。UART 每个符号表示一个二进制位，因此在 UART 中波特率的数值通常等于位速率。例如 9600 baud 对应每位约 1/9600 秒，也就是 104.17 微秒。接收端按这个位时间采样，发送端也按它改变 TX 电平，所以两端需要配置相同或误差足够小的波特率；两端不匹配会使采样逐渐偏离位中心。[ITU-R V.607-2：baud 与 bit rate 定义](https://www.itu.int/dms_pubrec/itu-r/rec/v/R-REC-V.607-2-199006-S%21%21PDF-E.pdf)、[Analog Devices：UART 采样误差](https://www.analog.com/en/resources/technical-articles/determining-clock-accuracy-requirements-for-uart-communications.html)
波特率不是应用有效字节的吞吐量。8N1 每个数据字节要传 1 个起始位、8 个数据位和 1 个停止位，共 10 个位时间；理想连续发送时，9600 baud 最多约 960 个数据字节/秒，实际还可能有帧间空隙和协议开销。
### COM 口、UART 与电气标准
COM1、COM2 等是 Windows 给串行设备/驱动提供的传统端口名称，是操作系统访问端口的名字，不是电压标准、连接器或某一种芯片。Windows 文档把 RS-232、RS-422 等列为不同的串行端口类型，说明 COM 名称本身并不意味着电气接口一定是 RS-232。[Microsoft：COMMPROP 端口类型](https://learn.microsoft.com/en-us/windows/win32/api/winbase/ns-winbase-commprop)
UART 描述字节怎样按位收发；RS-232、RS-422、RS-485 等描述线路上的电气信号；COM 是操作系统一侧的端口名称。这几个概念相关但不等价。Linux 常见设备名有 /dev/ttyS*、/dev/ttyUSB* 和 /dev/ttyACM*。接线前要查设备手册，不能把 RS-232 正负电压直接接到 3.3V/5V MCU 的 TTL UART 引脚。
### 为什么常用 TXD、RXD、GND 三线
在简单的点对点全双工连接中，TXD 发送、RXD 接收、GND 提供共同信号参考，通常把一端 TXD 接到另一端 RXD，再交叉连接反方向的数据线。这样可减少连接器引脚、线束和硬件复杂度。
RTS/CTS 常用于硬件流控：接收端缓存快满时要求发送端暂停，准备好后再允许发送。DTR/DSR 常表示终端/设备就绪；DCD 常与调制解调器检测到载波有关；RI 常表示电话振铃。直接连接的控制板没有调制解调器时，DCD/RI 通常无用；若设备不支持或未启用硬件流控，RTS/CTS 也可不接。采用三线后接收端不能通过这些线叫停发送端，因此发送速度必须受接收能力约束，或改用软件流控/应用层确认。三线连接是简化方案，不是远距离抗干扰方案；距离和噪声问题要看电气标准、线缆、接地和隔离。[TI：三线 RS-232 连接及其流控限制](https://www.ti.com/lit/an/slla083a/slla083a.pdf)、[TI：RS-232 握手与流控](https://www.ti.com/lit/an/slla544/slla544.pdf)
### UART 异步帧格式
UART 没有唯一适用于所有设备的帧配置。常见配置 8N1 表示 8 个数据位、无校验位、1 个停止位；UART 异步字符帧通常如下，数据位一般低位先发：
```text
空闲(逻辑1) | 起始位(0) | D0 D1 D2 D3 D4 D5 D6 D7 | 校验位(可选) | 停止位(1) | 空闲(逻辑1)
```
起始位让接收端发现新帧；数据位承载一个字符/数据单元；校验位可做简单差错检测；停止位恢复到空闲的逻辑 1，并给接收端一个帧尾。以 8N1 为例，线上每传一个 8 位数据字节要占 10 个位时间。[Analog Devices：UART 帧结构](https://www.analog.com/en/resources/analog-dialogue/articles/2020/11/24/18/10/uart-a-hardware-communication-protocol.html)
还要区分 UART 字符帧与应用协议的消息帧：UART 的 8N1 只定义一个字节如何通过线；上层协议可把多个字节组合成带地址、长度、命令、校验等字段的完整消息。RS-232/RS-485 则再定义这些逻辑位如何变成线路电压/差分信号。CommStudio 的串口页中的波特率、数据位、校验位、停止位和流控属于串口收发配置；HEX 选项只影响输入内容如何编码为字节，不会改变 UART 帧。

