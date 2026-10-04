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

## UART、dist 与学习前置背景
### UART 是什么
UART 是 Universal Asynchronous Receiver/Transmitter（通用异步收发器），通常指 MCU、电脑串口控制器或 USB 转串口芯片中的一种硬件功能。发送时，它把 CPU 提供的并行字节组织成起始位、数据位、可选校验位和停止位，再按波特率逐位输出；接收时，它检测帧、采样并把位重新组装成字节。
UART 定义的是异步收发和字节帧处理，不定义电气电压，也不定义 Modbus 这类应用协议。UART 引脚的逻辑电平可经收发器转换为 RS-232 或 RS-485 信号；使用时需要确认两端电气接口兼容。
### 项目中的 dist 目录
dist 通常是 distribution（分发/发布）的缩写，用于暂存准备分发的程序和说明文件。当前 Linux Debug 构建目录下的 dist 是 `build/debug/dist/`。项目的 `CMakeLists.txt` 把主可执行文件生成到 `build/debug/bin/CommStudio`，然后在 POST_BUILD 步骤把它和 `README.md`、`README.zh-CN.md` 复制到 `build/debug/dist/`。
本轮构建后的 `build/debug/dist/` 确实包含程序和两份 README。这个 Linux 目录当前是同步/暂存目录，不等同于包含全部 Qt 依赖的便携包；Windows 的 `scripts/package.ps1` 会另外调用 `windeployqt` 部署 Qt 运行时。平常从仓库开发启动可用 `./build/debug/bin/CommStudio`；在当前构建目录下，`./build/debug/dist/CommStudio` 是它的一份副本。
### 开始读这个项目需要的背景
不需要先学完整套工业自动化理论。这个项目是通信调试上位机，建议边读源码边补概念：
1. 位、字节、十六进制、文本编码，以及“一个字节怎样在线上传输”。已介绍的 UART/HEX 基础就是这部分。
2. 通信分层：物理电气接口（TTL/RS-232/RS-485）→ 字节传输方式（UART、TCP、UDP、蓝牙）→ 应用协议（例如 Modbus）。数据传输通道和字节代表的命令/消息不要混为一谈。
3. 工控设备基本角色：上位机/HMI 负责配置、下发请求和显示状态；PLC、控制板、传感器、仪表等提供状态或执行命令。理解请求、响应、超时、错误和读/写即可开始，不要求先会写 PLC 梯形图。
4. Qt/QML 基础与项目同步学习：先会辨认 QObject、信号/槽、属性、对象父子关系和事件循环；QML 先学对象树、属性绑定、点击处理器。Qt 官方入门资料也按对象层级和属性绑定介绍 QML，可在阅读 `main.cpp`、`Main.qml` 时同步对照。[Qt：First Steps with QML](https://doc.qt.io/qt-6/qmlfirststeps.html)、[Qt：QObject 信号/槽和对象所有权](https://doc.qt.io/qt-6/qobject.html)
5. 按模块补专项知识：网络页复习 TCP 是字节流、UDP 是数据报及其消息边界；Modbus 页再学 client/server、功能码、线圈和寄存器；蓝牙页再学 BLE GATT 与经典蓝牙 SPP。Modbus 规范把读写操作定义在离散输入、线圈、输入寄存器和保持寄存器等数据表上。[Modbus Application Protocol Specification](https://www.modbus.org/file/secure/modbusprotocolspecification.pdf)
用户已有 C++、网络和系统基础，因此优先关注本项目特有的 QML 界面、Qt 信号/属性连接和工业设备协议语义；不用先把所有现场总线、PLC 编程或控制算法学完。

## UART 字节、接口与多设备通信
### 字节与 UART 帧不是同一个计数
普通字节仍是 8 bit；UART 不会把“字节”改成 10 bit。以常见 8N1 为例，UART 在字节的 8 个数据位外增加 1 个起始位和 1 个停止位，所以在线上占用 10 个位时间。起始位和停止位是传输边界，不属于那个数据字节。
```text
逻辑数据字节：D7 D6 D5 D4 D3 D2 D1 D0    （共 8 bit）
UART 线帧：   START | D0 D1 D2 D3 D4 D5 D6 D7 | STOP
              1 bit       8 data bits          1 bit
```
UART 一般先发送最低有效位 D0。接收端还原时丢弃起始/停止位，把 8 个数据位组合成一个字节。[Analog Devices：UART 帧结构](https://www.analog.com/en/resources/analog-dialogue/articles/2020/11/24/18/10/uart-a-hardware-communication-protocol.html)
### 串口、UART 和物理接口
“串行”描述传输方式：把并行的多位数据变成一位接一位的信号。“串口”在口语中可能指 UART 功能、系统里的端口设备名、连接器或某个物理接口，需看语境。UART 是收发器/外设；它的 TX/RX 逻辑引脚还需要兼容的电气连接方式。TTL/CMOS UART、RS-232、RS-485 不是同一种电平。
两个直接连接的 TTL UART 设备通常交叉接线：A_TX 接 B_RX，B_TX 接 A_RX，并连接共同参考地；双方匹配波特率、数据位、校验位、停止位和流控。若使用 RS-232 或 RS-485 收发器，则使用相应接口及接线。不能只因接口都标注“串口”就认为可直接相连。
### RS-232 与 RS-485
RS-232 使用相对共同地的单端信号，常见点对点、分开的 TX/RX 线，可全双工。RS-485 使用差分信号，抗共模噪声能力较好，可让多个收发器接入同一总线；常见两线半双工，也可用四线实现全双工。
两者都是电气接口规范，不规定上层消息内容。RS-485 只提供共享物理总线，不自动提供设备地址、访问仲裁或命令协议；多设备共享总线仍要在更高层安排谁何时发送。[TI：RS-485 差分、多点总线与协议边界](https://www.ti.com/lit/pdf/snla049)
### 上位机、设备与蓝牙
上位机/HMI 通常运行在人机交互端，用来配置设备、发起请求、显示状态和收发日志；下位设备可能是 PLC、控制板、仪表、传感器或驱动器。此名称表示系统层级，不是 CPU 能力高低。在 CommStudio 的调试场景里，电脑端发测试数据，目标设备接收并按自身协议响应；某些设备也会主动上报状态。
BLE 的 GATT 把设备提供的数据组织成服务（Service）和特征值（Characteristic）：服务按功能分组，特征值承载具体值并规定可读、可写、可通知等操作。调试软件先发现服务，再选择特征值读取、写入或订阅通知。常见的 Nordic UART Service 是建立在 GATT 特征值之上的“串口风格”自定义服务，并非 BLE 本身的通用串口。[Bluetooth SIG：GATT](https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Core-61/out/en/host/generic-attribute-profile--gatt-.html)
经典蓝牙 SPP（Serial Port Profile）通过 RFCOMM 模拟串行电缆连接，应用通常可以像使用虚拟串口那样交换字节流。它与 BLE GATT 的服务/特征值读写方式不同。[Bluetooth SIG：Serial Port Profile](https://www.bluetooth.com/specifications/specs/serial-port-profile-1-2/)
### 中断、串口日志和 cout
中断是外设或硬件事件发出的紧急通知；CPU 暂停当前执行，保存现场并进入中断服务程序（ISR）处理。中断响应延迟指事件发生到处理程序开始执行之间的等待时间；一个 ISR 执行太久，会推迟其他不能抢占它的中断和主循环/任务的工作，具体影响还与中断优先级和 MCU 架构有关。[Arm：Cortex-M 中断延迟与优先级](https://developer.arm.com/community/arm-community-blogs/b/architectures-and-processors-blog/posts/beginner-guide-on-interrupt-latency-and-interrupt-latency-of-the-arm-cortex-m-processors)
嵌入式系统中的 `printf` 常被重定向到 UART。UART 发送速度远低于 CPU 执行速度；若打印函数等 TX 就绪/发送完成，ISR 就会停留很久。比如 115200 baud、8N1 时，20 个字符至少占 20×10/115200 秒，约 1.74 ms，尚未计入格式化开销。格式化输出还可能用较多栈、缓冲区、锁或非可重入库函数。安全做法是在 ISR 里只记录短事件或数据到固定大小环形缓冲区，尽快返回，再由主循环/RTOS 任务格式化并发送；也可使用非阻塞 DMA/异步日志。若缓冲区满，需要规定丢弃、覆盖或计数策略。Zephyr 的 deferred logging 也是把耗时格式化和输出移到调用上下文之外处理的例子。[Zephyr：Deferred logging](https://docs.zephyrproject.org/latest/services/logging/index.html)
`std::cout` 在桌面程序的普通线程中可以使用；在 MCU 上它可能被重定向到 UART、半主机或其他输出后端，开销和行为依实现而异。它和 `printf` 一样不应默认在 ISR 中安全或非阻塞；“线程安全”也不等于“可在中断上下文调用”。
### USB 转串口模块
CH340、CP2102、FT232 是不同厂商的 USB-UART 桥接芯片系列。典型数据路径是：
```text
电脑 USB 主机 ⇄ USB-UART 桥接芯片 ⇄ UART TX/RX 逻辑线 ⇄ MCU/设备
```
桥接芯片处理 USB 一侧，并把电脑驱动交付的数据转换成 UART 位流，反方向也把 UART 收到的数据交给 USB。电脑通常通过驱动看到 COMx、/dev/ttyUSB* 等端口。小模块可能还包含连接器、稳压器或电平转换；仅有 USB-UART 桥不等于 RS-232 电压输出。真正连接 RS-232 设备通常还需要 RS-232 收发器（如 MAX3232 一类）。[WCH：CH340](https://www.wch-ic.com/downloads/CH340DS1_PDF.html)、[Silicon Labs：CP2102 USB-UART Bridge](https://www.silabs.com/interface/usb-bridges/classic/device.cp2102?tab=techdocs)、[FTDI：FT232R 数据手册](https://ftdichip.com/wp-content/uploads/2020/08/DS_FT232R.pdf)
### 波特率不一致为何乱码
接收端发现起始位后，按自己配置的位时间采样。若发送端每位持续约 104 微秒（9600 baud），接收端却按 208 微秒（4800 baud）取样，就会跨过发送端多个位来读；即使只有小幅速率差，每一位的采样偏差也会在一帧中逐步积累，最终可能采到位边沿或相邻位。结果可能是数据错误、校验错误、停止位错误、乱码或收不到有效帧。下一帧开始时接收端可重新同步，但无法修复已错误读取的当前帧。[Analog Devices：UART 时钟误差预算](https://www.analog.com/en/resources/technical-articles/determining-clock-accuracy-requirements-for-uart-communications.html)
### 多个 UART、DMA 和软串口
- 多个硬件 UART/USART：芯片有 USART1、USART2 等独立外设时，可以分别配置并连到不同接口。它们是多个通信外设/通道，不等同于同一条多点总线。
- DMA：直接内存访问控制器可在外设寄存器/FIFO 与内存缓冲区间搬运数据，CPU 不必逐字节读写，通常只处理 DMA 完成、半完成或错误事件。DMA 提高收发处理效率，但不会凭空增加 UART 数量，也不会把一条 UART 线变成多条独立线路。[ST：DMA 在外设与内存间传输数据](https://www.st.com/resource/en/reference_manual/dm00305990.pdf)
- “DMA + 多路复用”需要看具体芯片文档。它可能指 DMA 请求多路复用器把不同外设的请求路由到 DMA 通道，也可能指用硬件开关选择某个串口设备；这两者不是同一概念。仅配置 DMA 不会自动完成设备寻址或总线仲裁。
- 软串口（bit-banging）：用定时器安排时间、由 GPIO 软件翻转/采样来模拟 UART。它能在缺少硬件 UART 时补一个低速通道，但占用 CPU，定时抖动会影响收发，高速和并发能力通常较弱。[Microchip：Bit-banged UART 实现](https://www.microchip.com/en-us/application-notes/an2290)
需要区分两类“多设备”：多个独立 UART 外设对应多条独立链路；RS-485 多点是多个设备共用一条差分总线，必须通过地址和发送时序避免同时驱动总线。硬件 UART、DMA、DMAMUX、软串口是 MCU 实现资源的办法，不是同一层级的通信协议方案。


## RS-485 的 A/B 差分信号
在 RS-485 场景里，A、B 是一对差分线。发送器让两线之间的电压差改变，接收器主要判断两线的差值，而不是只看某一根线相对地的电压：
```text
Vdiff = VA - VB
```
可以把它想成跷跷板：一个状态下 A 比 B 高，另一个状态下 B 比 A 高。外界噪声若同时耦合到两根线上，两线的共同变化会在相减时大幅抵消，因此差分传输通常比单根信号线更抗共模干扰。
A/B 命名与逻辑 0/1 的对应在不同厂商资料中可能不一致；接线时按两端收发器手册核对，不能只凭 A、B 字母猜极性。RS-485 两线半双工时，A/B 是同一条共享总线的一对线，不是分别代表发送和接收的 TX/RX。[TI：RS-485 A/B 极性约定](https://e2e.ti.com/cfs-file/__key/telligent-evolution-components-attachments/13-143-00-00-00-26-49-60/RS485-_2D00_-Polarity-Conventions.pdf)
## UART 数据位与普通字节
普通程序里的 1 字节仍是 8 bit。UART 配置中的“数据位”表示每个 UART 字符帧的数据字段有几位，不会改变 `char`、`QByteArray` 等软件数据单元的大小。
例如配置 7 个数据位时，一个 UART 帧只携带 7 个数据位，数值范围通常是 0～127；起始位、可选校验位和停止位仍是额外的帧控制位。若上层用一个 8-bit 字节保存内容，发送时必须决定如何映射到 7-bit 数据字段；最高位为 1 的值无法原样通过单个 7-bit 数据字段传送。8N1 则是在每个帧中传 8 个数据位，所以刚好承载一个普通 8-bit 字节。
## CommStudio 的 DTR 与 RTS
DTR（Data Terminal Ready）和 RTS（Request To Send）是传统串行/调制解调器控制线，不是 TX/RX 数据线。DTR 通常表示终端侧已就绪；RTS 原本表示请求发送，在 RTS/CTS 硬件流控中会和对端 CTS 配合，用来控制是否继续发送。
CommStudio 串口页中的复选框会在端口已打开时调用 Qt 的 DTR/RTS 设置接口；它们控制的是适配器提供的控制信号，不会在收发内容里多加字节。某些开发板会把 DTR 或 RTS 接到复位/启动模式电路，因此改动电平可能让板子复位。具体效果取决于 USB 转串口芯片、驱动和设备接线；使用 RTS/CTS 流控时，不要手动改变 RTS，除非设备设计要求这样做。[项目：DTR/RTS 实现](https://github.com/LocasYang/CommStudio/blob/main/src/managers/serialmanager.cpp)、[串口页复选框](https://github.com/LocasYang/CommStudio/blob/main/qml/pages/SerialPage.qml)
## HEX+ASCII 显示
HEX+ASCII 是把同一组收到或发出的字节并排显示为十六进制和字符形式，不会把数据发送两遍，也不会改变线上内容。例如：
```text
字节：48 69 0D 0A 00
字符：H  i  ␍  ␊  ␀
```
CommStudio 对二进制收发记录的 HEX+ASCII 视图实际用 `HEX | 字符` 排列；CR、LF、TAB、NUL 显示成可辨认符号，其他低位控制字符显示为中点；状态/提示行仍显示文本。普通文本行按 UTF-8 转换；非纯文本数据的字符栏使用逐字节 Latin-1 风格显示，因此二进制字节或 UTF-8 多字节字符在字符栏可能看起来奇怪，应以左侧 HEX 为准。[项目：HEX/字符转换](https://github.com/LocasYang/CommStudio/blob/main/src/core/trafficmodel.cpp)、[项目：终端显示](https://github.com/LocasYang/CommStudio/blob/main/qml/components/TerminalView.qml)
## 没有硬件时如何练习
CommStudio 没有把串口硬件“模拟出来”，但可以先练习界面、字节表示、网络收发和 Modbus 模拟。
- **练网络收发**：启动两个 CommStudio 实例。实例 A 选择 TCP Server，监听默认端口 6000；实例 B 选择 TCP Client，远端填 `127.0.0.1:6000`。连接后两边都能发送并观察 TX/RX。这个练习验证本机 TCP 和应用收发流程，不等于验证 UART 或 RS-485。
- **练 Modbus**：实例 A 选择“TCP 从站模拟”，端口可设为 1502；实例 B 选择“TCP 主站”，地址填 `127.0.0.1`、端口填 1502，然后发起手动读请求或配置轮询任务。项目内置 TCP 从站模拟器和寄存器区。使用 1502 可避开 Linux 上绑定 502 这类低端口通常需要额外权限的问题。
- **练串口**：没有串口设备时，不能验证真实线路收发。可以用虚拟串口对模拟两端，例如系统安装了 `socat` 时运行 `socat -d -d pty,raw,echo=0 pty,raw,echo=0`，它会创建一对伪终端；但当前串口下拉框只显示 Qt 从系统发现的端口，伪终端不一定会被列出，界面也没有手动输入端口名的入口。真正验证前需先确认两个伪终端都出现在列表中。
- **练蓝牙**：需要有蓝牙设备作为对端；没有设备时可看界面和代码，但无法完成真实发现、连接和数据交互。
## Linux 的 ttyS0～ttyS31
`/dev/ttyS0` 到 `/dev/ttyS31` 是 Linux 串口设备名称，常见于 8250/16550 兼容的串口驱动。CommStudio 没有硬编码这 32 个选项：`SerialManager` 调用 `QSerialPortInfo::availablePorts()` 获取系统枚举结果，QML 再把结果放进下拉框。
“32”通常来自 Linux 内核配置的 8250 UART 支持数量上限；内核选项 `CONFIG_SERIAL_8250_NR_UARTS` 决定驱动可支持的最大端口数，Linux x86_64 默认配置中可见其设为 32。它不是“电脑上有 32 个物理串口”的承诺，也不是所有机器都必须有 32 个可用端口。某个条目是否对应真实可用硬件，要结合 `/dev/ttyS*`、系统设备信息和设备权限确认。[Qt：Linux 串口枚举](https://doc.qt.io/qt-6/qserialportinfo.html)、[Linux 8250 UART 数量配置](https://github.com/torvalds/linux/blob/master/drivers/tty/serial/8250/Kconfig)、[Linux x86_64 默认配置](https://github.com/torvalds/linux/blob/master/arch/x86/configs/x86_64_defconfig)
## 文件发送的 4 KB 分块与协议层次
CommStudio 的文件发送不是一种新的 UART 帧格式。当前 QML 每次调用传入 4096 字节和 0 毫秒间隔；C++ 的每次定时回调从文件读取最多 4096 字节，再调用 `QSerialPort::write()`。回调把定时器重新设为 0 毫秒，尽快安排下一批。代码虽然接收 `chunkSize` 参数，但实际读取长度写死为 4096。
数据路径可以这样看：
```text
文件原始字节
  → CommStudio 每次读取最多 4096 字节（程序内分批）
  → QSerialPort::write() 排入 Qt/系统发送队列
  → UART 按配置把数据位组成字符帧，例如 8N1
  → TTL/RS-232/RS-485 等电气线路
  → 对端 UART 还原字节
  → 对端应用协议（例如 Modbus RTU 或设备自定义协议）
```
4 KB 是程序的读写批次大小，不是 UART 标准规定的帧长；批次边界不会自动保留在线路上。对端看到的是连续字节流，UART 再按单字节/字符配置分帧。通用文件发送路径没有为文件增加包头、长度、序号、校验、确认或重传；若接收设备需要这些信息，必须由设备协议另行规定。
Qt 的 `QSerialPort::write()` 是异步接口：调用成功表示数据被接受/排入发送流程，不代表对端已经收到或校验成功。项目在排队后立即累计进度并安排下一批，没有等待 `bytesWritten` 或对端确认，所以界面进度不能当作设备接收确认；4 KB 分批也不等于严格限制最多只有 4 KB 未发送数据。[项目：文件分批发送](https://github.com/LocasYang/CommStudio/blob/main/src/managers/serialmanager.cpp)、[Qt：异步串口写入](https://doc.qt.io/qt-6/qtserialport-terminal-example.html)


## Modbus 数据区与从站模拟
### 四类数据区
Modbus 把数据组织成四张逻辑表，不要求设备内部真的用四块独立内存实现。每个数据项有协议地址：
| 数据区 | 单项宽度 | 典型功能码 | 读写含义 |
|---|---:|---|---|
| 线圈（Coils） | 1 bit | 01 读，05/0F 写 | 可读写的开关量输出；“线圈”是历史名称，不表示必须连接实体继电器 |
| 离散输入（Discrete Inputs） | 1 bit | 02 读 | 只读开关量输入 |
| 保持寄存器（Holding Registers） | 16 bit | 03 读，06/10 写 | 可读写的数值区 |
| 输入寄存器（Input Registers） | 16 bit | 04 读 | 只读数值区 |
这些名字是 Modbus 数据模型与访问权限的分类；设备如何把它们映射到传感器、开关或内部变量由设备固件决定。[Modbus 应用协议规范](https://modbus.org/docs/Modbus_Application_Protocol_V1_1b3.pdf)
### 数据来源与数字框
CommStudio 的“寄存器区数据来源”只在从站模拟模式显示，因为模拟器需要预先提供数据，才能对主站的读请求作出响应。RTU 从站和 TCP 从站使用相同的数据生成逻辑，只是底层分别创建串口 RTU server 和网络 TCP server。
每个区域的下拉框选择生成算法：
- `static`：不按定时器改写数据。
- `random`：围绕基准值生成随机值。
- `counter`：按时间计数并循环。
- `ramp`：按周期逐步上升后回到起点。
- `sine`：按正弦曲线往复变化。
模拟值每秒更新。源码中的基准值和幅度默认分别为 100 和 10，但当前页面没有给它们提供输入框。下拉框旁显示的 `100` 是要配置/更新的地址数量，不是数值本身；生成器最多逐项更新前 1024 个地址。
位数据区只能表示 0 或 1。Qt 的 Modbus 数据模型把 0 保留为 0、把任何非零数转换为 1；而模拟器默认基准值 100、幅度 10，因此这些算法用于线圈/离散输入时基本都会变成 1，无法呈现有意义的高低跳变。[Qt：QModbusDataUnit 的位数据语义](https://doc.qt.io/qt-6/qmodbusdataunit.html)
界面说明文字提到可在寄存器表中编辑 `static` 区，但目前 QML 的“寄存器表”显示的是主站最近读取的数据，不是从站模拟器数据；`simulatorRegisters` 和 `writeSimulatorRegister()` 虽由 C++ 暴露，页面没有调用它们。因此这项说明与当前页面实现不一致，静态值没有对应的可见编辑控件。
### RTU 与串口端口
Modbus RTU 是 Modbus 的串行传输模式。它不走 TCP，但仍需要串行链路；CommStudio 用 `QModbusRtuSerialClient`，并把所选 `ttyS*`、波特率、数据位、校验位和停止位配置给串口接口。物理电气接口可能是 RS-485，也可能是 RS-232，取决于设备；RTU 是协议传输模式，`ttyS0` 是 Linux 的串口设备名，两者处于不同层次。[Modbus 串行线路规范](https://www.modbus.org/docs/Modbus_over_serial_line_V1.pdf)
### Unit ID
在 RTU 请求中，这个字段实际是从站地址，跟在 RTU 帧开头，用来让总线上的设备判断“这是发给谁的”。CommStudio 的主站字段被标为 Unit ID，从站字段被标为从站地址；生成 RTU ADU 时前者作为从站地址写入帧。
在 Modbus TCP 中，Unit Identifier 位于 MBAP 头。它常用于 TCP/串行网关把请求路由给下游 RTU 从站；若设备直接连接 TCP 网络，具体设备可能忽略该字段或要求固定值。[Modbus TCP/IP 实现指南](https://modbus.org/docs/Modbus_Messaging_Implementation_Guide_V1_0b.pdf)
### 轮询任务与读写
轮询任务的用途是定期读取数据并更新监控表，所以任务编辑器只列出读功能码 01～04。周期性重复写入可能反复改变设备状态，因此写操作放在“手动读写”里；该界面支持 05/0F 写线圈、06/10 写寄存器。项目的通用请求路径也包含这些写功能码。
### 字序
一个 Modbus 寄存器本身是 16 bit。读取 32 bit 整数或 float 时，需要把两个连续寄存器合起来；不同设备可能先放高 16 bit，也可能先放低 16 bit。页面的 `ABCD`、`BADC`、`CDAB`、`DCBA` 表示四个字节的排列方式：A/B 是第一个寄存器的高/低字节，C/D 是第二个寄存器的高/低字节。16-bit 类型只用一个寄存器，这个选项对它没有影响。CommStudio 的解码路径会按该设置还原 32-bit 整数或 IEEE-754 float。
### 写前预览
三个控件分别是工程量、比例系数和字序。例如工程量填 230.5、比例填 0.1，通常按 `工程量 = 原始值 × 比例系数 + 偏移` 理解，反算原始值为 `(230.5 - 偏移) / 0.1`。当前预览调用把偏移固定为 0，字序用于两个寄存器的 32-bit 排列。
需要留意一个实现不一致：QML 把类型参数写成 `float32`，但 C++ 预览函数先把反算结果四舍五入成整数，再把它拆成两个 16-bit 字；它没有把输入值编码成 IEEE-754 浮点数。以 230.5 和 0.1 为例，预览原始整数为 2305（`0x00000901`），真正的 IEEE-754 float32 230.5 是 `0x43668000`。因此当前预览不能直接当作 float32 设备写入值使用；这是页面/实现不匹配的迹象。
### Raw Test Center
Raw Test Center 允许手工输入较底层的请求字节，适合验证自定义 PDU、特殊功能码和响应/异常。RTU 输入为“从站地址 + PDU”；勾选自动 CRC 时由程序计算并追加 CRC16，取消时输入内容应自行包含 CRC。TCP 输入通常是“Unit ID + PDU”，程序补 MBAP 头；代码也能识别一部分已带 MBAP 头的完整 ADU。
收到响应后，程序累计字节并在 60 ms 没有新数据时尝试解析；没有响应则约 2 秒超时。结果区显示功能码、数据、异常、CRC 检查和耗时。它适合底层调试，不会自动把任意输入补成正确的设备业务命令。[项目：Raw 请求构造和解析](https://github.com/LocasYang/CommStudio/blob/main/src/managers/modbusmanager.cpp)
### RTU 打开串口时的 Permission denied
这个错误发生在操作系统打开串口设备阶段，早于 Modbus 请求发送；它与 Unit ID、波特率是否匹配或 CRC 无关。常见原因是 `/dev/ttyS0` 属于 `root:dialout`，当前桌面用户不在 `dialout` 组；也可能是设备节点访问策略限制。
在运行程序的同一台 Linux 上检查：
```bash
ls -l /dev/ttyS0
id -nG
```
若设备确属 `dialout` 组且当前用户不在其中，可把用户加入该组后重新登录，再启动程序；不要用长期 `chmod 666` 暴露串口。若节点不存在，或 `ttyS0` 是系统控制台/并非实际外接端口，应改选真实的设备端口，例如 USB 转串口常见的 `/dev/ttyUSB0` 或 `/dev/ttyACM0`。
## 蓝牙 BLE UART 与经典 RFCOMM
### BLE UART 模式与 Nordic UUID
BLE 本身没有 UART 物理串口。所谓 BLE UART 模式，是设备用 GATT 服务和特征值约定“写入特征接收数据、通知特征发送数据”，让应用看起来像在使用一个字节流终端；底层仍是 BLE GATT。
Nordic UART Service（NUS）是 Nordic 定义的厂商自定义 GATT 服务，不是蓝牙核心规范里的通用 UART 服务。三个 UUID 是服务和特征值的唯一标识，不是乱码或密码；它们共用一段 128-bit UUID 基础，只在末尾编号不同：
- `6e400001-b5a3-f393-e0a9-e50e24dcca9e`：NUS 服务。
- `6e400002-b5a3-f393-e0a9-e50e24dcca9e`：RX 特征，支持 Write/Write Without Response；对 CommStudio 来说是电脑向设备发送的出口。
- `6e400003-b5a3-f393-e0a9-e50e24dcca9e`：TX 特征，支持 Notify；对 CommStudio 来说是设备向电脑回传的入口。
“Nordic UART 预置”只是把这三项常见 UUID 填入编辑框，不会让目标设备自动新增 NUS 服务。只有对端实际实现相同服务/特征值时才能工作。[Nordic：NUS 服务与特征值](https://nrfconnectdocs.nordicsemi.com/ncs/latest/nrf/libraries/bluetooth/services/nus.html)
BLE UART 的“启用 UART”按钮只有在 BLE 状态变为“服务已发现”时才能点击。流程是扫描设备 → 连接 BLE peripheral → 发现 GATT 服务和特征 → 启用 UART。没有真实 BLE 对端、仍未连接，或服务发现尚未完成时，按钮保持禁用；连上不含 NUS 的设备时按钮会启用，但点击后会报 UUID 不存在。
### GATT 浏览器
GATT 浏览器连接 BLE 设备并完成服务发现后显示设备实际提供的服务。下拉框选服务；下方列出该服务的特征值、UUID、当前值和属性（Read、Write、Notify、Indicate 等）。这些属性决定对应操作是否可用：Read 读取值，Write 写入，Notify/Indicate 订阅设备主动推送。它不会显示经典蓝牙 SPP 服务；经典服务走另一套 SDP/RFCOMM 流程。[Qt：BLE 服务发现步骤](https://doc.qt.io/qt-6/qlowenergycontroller.html)
### BLE 页底部发送区的数字框
右下角发送框旁的大输入框是待发内容，可选 TEXT/HEX，并可配置转义和行尾。下面两个数字框的占位文字分别是 `interval ms` 与 `count`，设计意图是定时发送间隔和发送次数；`count=0` 在串口/网络管理器中表示持续发送。
但当前 `BluetoothManager` 没有 `timerActive`、`startTimerSend()` 等定时发送接口，而通用面板仍无条件画出这两个数字框。因此蓝牙页上的这两个框目前不控制发送，定时发送按钮也会隐藏；它们是通用面板没有按蓝牙能力收敛的界面残留。
### Classic RFCOMM（SPP）
RFCOMM 是经典蓝牙上的可靠、有序字节流连接，Qt 将它描述为模拟 RS-232 串口的 socket；SPP（Serial Port Profile）是使用 RFCOMM 提供串口风格服务的蓝牙 Profile。它不是 BLE，也不使用 GATT。[Qt：RFCOMM socket](https://doc.qt.io/qt-6/qbluetoothsocket.html)
“服务发现”在这里指经典蓝牙 SDP：查询设备声明提供的服务，得到服务描述、UUID 和连接所需信息。CommStudio 收集其中 RFCOMM 类型的服务并显示设备名与服务名；选中条目只是选择目标，点击“连接”才会创建 RFCOMM socket。连接成功后收发面板把数据送入该字节流，收到的数据出现在终端。某些平台连接前还要求先配对。
错误 `Missing serviceUuid or Serial Port service class uuid` 是 Qt BlueZ 后端说当前选择的服务记录既没有可用的 Service UUID，也没有标准 Serial Port Profile 的 Service Class UUID，所以它无法确定该连哪个服务。当前项目只按“协议类型是 RFCOMM”筛选服务，未预先剔除 UUID 信息不完整的记录；随便选一个 RFCOMM 服务不保证它就是 SPP。应对真正提供经典蓝牙 SPP 的设备重新做服务发现，并选择有有效服务 UUID/串口服务类 UUID 的记录；BLE-only 设备不能用这里连接。[Qt BlueZ 错误检查](https://codebrowser.dev/qt6/qtconnectivity/src/bluetooth/qbluetoothsocket_bluezdbus.cpp.html)、[Qt：RFCOMM 连接要求](https://doc.qt.io/qt-6/qbluetoothsocket.html)


## Qt 启动、元对象系统与 QML
### HEX 格式化辅助函数
`QString::arg(value, width, base, fillChar)` 将整数格式化为字符串：`width` 是最小字段宽度，`base=16` 表示十六进制，不足宽度时用 `fillChar` 补齐；`toUpper()` 把字母转成大写。因此 `byteHex(0x0A)` 得到 `0A`，`wordHex(0x1234)` 得到 `1234`。`wordHex` 是整数的十六进制写法，不是在读取机器内存的字节顺序。
当前 `wordHexLe` 的实现先输出高字节，再输出低字节。输入 `0x1234` 会得到 `12 34`，小端字节序应是 `34 12`，所以函数名与实现不一致。`computeAll()` 又把它用于 `sum16le`、`crc16modbusle` 等结果，显示出来的小端字节顺序可能有误。邻近的 `dwordHexLe` 则交换两个 16-bit 字的先后顺序，但每个字仍按高字节在前，也不是完整的逐字节小端序。对比之下，`ModbusCodec::buildRtuAdu()` 追加 Modbus CRC 时明确先追加 CRC 低字节再追加高字节。
### Modbus PDU 的构造
PDU（Protocol Data Unit）是 Modbus 应用协议数据单元，通常由功能码和功能数据组成。`buildPdu()` 根据功能码决定地址、数量、字节计数和数据怎样排列；它不负责 RTU 地址/CRC，也不负责 TCP 的 MBAP 头和 Unit ID。外层的 `buildRtuAdu()`、`buildTcpAdu()` 再分别包装为 ADU。
| 功能码 | 本函数追加到功能码后的字段 | `values` 的含义 |
|---|---|---|
| 01、02、03、04 | 起始地址 + 读取数量 | `values.first()` 作为数量 |
| 05 | 线圈值 `FF00` 或 `0000` | 第一个值的真假 |
| 06 | 一个 16-bit 寄存器值 | 第一个值 |
| 0F | 数量 + 字节数 + 打包后的线圈位 | 多个线圈值，每字节低位先装 |
| 10 | 数量 + 字节数 + 各寄存器值 | 多个 16-bit 寄存器值，每个寄存器高字节先写 |
这里 `values` 对读请求表示“数量”，对写请求才表示待写入的值；读请求的数量也因此编码在一个名为 `values` 的容器中。完整数据路径是：选择功能码和参数 → `buildPdu()` → RTU/TCP ADU 函数添加各自传输封装 → 发送。
### Qt 消息处理器
Qt 的 `qDebug()`、`qInfo()`、`qWarning()`、`qCritical()`、`qFatal()` 都进入 Qt 日志系统，默认由 Qt 的消息处理器输出到终端、调试器或系统日志。`QtMessageHandler` 是接收日志类别、源码上下文和消息文本的回调函数类型；`qInstallMessageHandler()` 把自定义回调安装到整个进程的 Qt 日志路径中，并返回此前的处理器。
本项目只有在设置 `COMMSTUDIO_MSG_LOG` 环境变量时才安装 `fileMessageHandler`。回调按日志级别添加前缀，把消息追加到指定文件；这便于 GUI 程序在没有终端窗口时留存诊断信息。安装后默认处理器不再自动收到同一条消息；当前代码没有保存或转发旧处理器。若文件打不开，回调直接返回，Qt 原本的日志也会被吞掉。Qt 还要求消息处理器可重入，因为不同线程可能并发调用它；当前实现每条消息都新建 `QFile` 并写文件，没有显式串行化共享文件写入，适用于诊断日志但不是高吞吐日志管线。[Qt 日志处理器文档](https://doc.qt.io/qt-6/qtlogging.html)
### OpenGL 表面与控件样式
`QSurfaceFormat` 用来描述 OpenGL 渲染表面的缓冲区和上下文要求，例如颜色、深度、模板缓冲区、OpenGL 版本和每像素采样数。项目复制默认格式后调用 `setSamples(4)`，再设为默认格式，表示请求多重采样抗锯齿（MSAA），让几何边缘看起来更平滑；它不是把窗口分辨率放大四倍。实际可用样本数受图形驱动和平台影响，设置值表达的是请求。
`QQuickWindow::setGraphicsApi(QSGRendererInterface::OpenGL)` 指定 Qt Quick 使用 OpenGL 渲染后端。`QQuickStyle::setStyle("Basic")` 则选 Qt Quick Controls 的 Basic 控件样式；它不是设置整张应用界面的主题色。样式须在载入导入 `QtQuick.Controls` 的 QML 前确定，所以放在 `engine.loadFromModule()` 之前。[Qt `QSurfaceFormat`](https://doc.qt.io/qt-6/qsurfaceformat.html)、[Qt `QQuickStyle`](https://doc.qt.io/qt-6/qquickstyle.html)
### `moc`、信号包装与属性通知
Qt 元对象系统为 `QObject` 提供信号槽、运行时类型信息和属性系统。`Q_OBJECT` 让类参与该系统；`moc` 扫描头文件并生成元对象数据及必要的 C++ 包装代码，CMake 的 `AUTOMOC` 会自动运行它。源码只声明 `signals: void languageChanged();`，链接时真正的信号函数体来自 `moc_studio.cpp`。
`emit languageChanged()` 中的 `emit` 是提示含义的宏，不是一次独立的运行时操作；执行效果是调用 moc 生成的 `Studio::languageChanged()` 包装函数。包装函数再调用 Qt 内部的 `QMetaObject::activate(this, &staticMetaObject, 2, nullptr)`，把信号分发给连接的槽、QML 信号处理器和属性绑定系统。参数含义是：`this` 为发信号的对象，`&staticMetaObject` 为 `Studio` 的元对象，`2` 是该类元对象中的本地信号索引，`nullptr` 表示信号没有参数。这里的序号是信号分发索引，不是属性编号；列表中的 `logsChanged`、`statusMessageChanged`、`languageChanged`、`totalsChanged` 依次对应 0、1、2、3。它们由 moc 按声明生成，不应在业务代码中手动调用 `QMetaObject::activate()`。[Qt 元对象系统](https://doc.qt.io/qt-6/metaobjects.html)、[Qt `QMetaObject`](https://doc.qt.io/qt-6/qmetaobject.html)
`Q_PROPERTY(QString language READ language WRITE setLanguage NOTIFY languageChanged)` 告诉 Qt/QML：属性读取走 `language()`，写入走 `setLanguage()`，变化通知走 `languageChanged()`。setter 修改值后发射通知，QML 会重新计算依赖 `Studio.language` 的属性绑定。例如 `text: Studio.language` 会在通知后重新调用 getter 并更新文本。`totalsChanged` 同时通知 `totalRx`、`totalTx`、`activeConnections`，相关绑定收到同一信号后会各自重新读取属性。`NOTIFY` 信号不会自动改写成员变量；真正更新值的仍是 setter 或 C++ 业务代码。Studio setter 先检查值是否变化，避免重复通知；启动构造时直接初始化语言，则因为 QML 尚未读取对象，不需要发变化信号。
### C++ 对象如何交给 QML
`qmlRegisterSingletonInstance<T>(uri, major, minor, qmlName, object)` 把一个已经创建的 QObject 实例注册到 QML 类型系统中。在本项目中，`CommStudio.Backend` 是模块 URI，`1, 0` 是模块版本，`"Studio"`、`"SerialManager"` 等是 QML 中使用的名字。`Main.qml` 导入 `CommStudio.Backend 1.0` 后，可以写 `Studio.activeConnections`、`SerialManager.open`，或调用已暴露的槽和 `Q_INVOKABLE` 方法。
注册只让 QML 能找到对象，并不替业务类自动暴露任意 C++ 成员：属性需进入 Qt 元对象系统，调用方法一般要是槽函数或标记 `Q_INVOKABLE`。这些对象由 C++ 创建和管理；本项目的通信管理器以 `Studio` 为 QObject 父对象，工具和窗口管理器以 `QGuiApplication` 为父对象，利用 QObject 父子关系回收。注册对象必须比 QML 引擎活得久，并与引擎处于同一线程；当前局部变量销毁顺序是先销毁 `engine`，之后才销毁 `app` 和其子对象，满足这一生命周期要求。[Qt `qmlRegisterSingletonInstance`](https://doc.qt.io/qt-6.8/qqml-h.html)
### QML 基本概念与 Widgets 对照
QML 是用对象树描述界面的声明式语言；Qt Quick 提供 `Item`、窗口、输入处理、动画、模型和视图等类型，Qt Quick Controls 提供按钮、文本框等控件。[Qt Quick 概览](https://doc.qt.io/qt-6/qtquick-index.html)
| QML 概念 | 作用 | 可以对照理解为 |
|---|---|---|
| `import`、对象层级、组件 | 引入类型并组合界面对象 | C++ include 加 QWidget 子控件/复用控件 |
| 属性 | 描述控件的状态，如 `width`、`text`、`visible` | QWidget 属性和 getter/setter |
| 属性绑定 | 用表达式描述属性之间的关系，依赖变化时自动重新计算 | 手工监听信号后调用 `setText()`；QML 会管理依赖 |
| 信号处理器 | `onClicked` 响应控件信号 | `QObject::connect(button, &QPushButton::clicked, ...)` |
| `Connections` | 在独立对象上监听一个目标的信号 | `connect()` 到某个槽或 lambda |
| C++ 集成 | `Q_PROPERTY` 暴露状态，槽/`Q_INVOKABLE` 暴露调用，signal 通知变化 | 元对象系统与脚本接口 |
| 布局 | `anchors`、`RowLayout`、`ColumnLayout` 安排子对象 | `QLayout`；QML 还常用属性绑定控制位置和大小 |
| model/view/delegate | 模型提供数据，view 负责呈现，delegate 描述每条数据外观 | Qt Model/View 与 item delegate |
QML 文档可包含 JavaScript 表达式和函数，但只有已注册类型及其暴露的属性/方法能从 QML 访问。项目例子：`Connections { target: SerialManager; function onToastRequested(text, ok) { ... } }` 接收管理器信号；`Button { onClicked: Studio.clearLogs() }` 调用暴露给 QML 的方法。[Qt：C++ 属性如何暴露给 QML](https://doc.qt.io/qt-6/qtqml-cppintegration-exposecppattributes.html)
本项目是纯 Qt Quick 程序：使用 `QGuiApplication`、`QQmlApplicationEngine` 和 `QQuickWindow`，没有 `QWidget`。已有 Qt Widgets 界面也能承载 QML，常见方式是把 `QQuickWidget` 放进 QWidget 布局并设置 QML source；它把 Quick 场景作为 QWidget 显示，但使用离屏渲染，可能有渲染性能开销。另一种方式是用 `QQuickView`，再通过 `QWidget::createWindowContainer()` 嵌入窗口。若使用 `QQuickWidget`，CMake 还需查找并链接 `Qt6::QuickWidgets`；当前项目没有这个模块。[Qt Quick Widgets](https://doc.qt.io/qt-6/qtquickwidgets-index.html)、[Qt `QQuickWidget`](https://doc.qt.io/qt-6/qquickwidget.html)
### QML 加载与应用事件循环
`engine.loadFromModule("CommStudio", "Main")` 根据模块 URI `CommStudio` 和 QML 类型名 `Main` 查找、载入并创建根 QML 对象。项目用 `qt_add_qml_module` 把 `qml/Main.qml` 纳入 `CommStudio` 模块；根对象是 `ApplicationWindow`，其中 `visible: true` 请求显示窗口。加载成功意味着根对象已创建，不表示 GUI 已经处理事件或完成第一帧绘制。随后 `app.exec()` 才进入事件循环，处理窗口事件、计时器和渲染。QML 创建失败时，项目连接 `objectCreationFailed` 并排队退出。[Qt `QQmlApplicationEngine`](https://doc.qt.io/qt-6/qqmlapplicationengine.html)
### 环境变量控制的截图流程
`COMMSTUDIO_SCREENSHOT` 非空时才进入截图分支，它的值是输出图片路径。`COMMSTUDIO_SCREENSHOT_SIZE` 可以提供 `宽x高`，例如 `1280x800`；`COMMSTUDIO_SCREENSHOT_DELAY` 提供等待毫秒数，未提供有效整数时默认 1500 ms，并至少等待 250 ms。代码先加载 QML 和调整窗口尺寸，再通过 `QTimer::singleShot()` 延迟抓取 `QQuickWindow::grabWindow()` 的帧并保存，然后调用 `app.quit()`。
这里的延迟是为了让应用进入事件循环并完成界面渲染后再抓图；自动设置窗口大小能让截图环境的结果稳定。常见用途是自动化界面检查、生成文档截图或构建流程中的视觉回归。未设置 `COMMSTUDIO_SCREENSHOT` 时不会启用截图定时器，程序照常运行。当前代码没有检查 `save()` 的返回值，因此路径无效时截图保存失败也不会给出专门错误提示。
### 元对象的动态调用
Qt 元对象系统可以按名称查询方法，也可以调用通过元对象暴露的槽或 `Q_INVOKABLE` 方法，例如 `QMetaObject::invokeMethod(object, "clearLogs")`。这类动态调用适合方法名运行时才确定、脚本桥接等场景；普通未标记的 C++ 私有/公有成员函数不会因此自动对 QML 可见。项目 QML 一般使用 `Studio.clearLogs()` 这样的直接调用，读源码时先按属性/方法注册关系理解，不必把所有交互都当作字符串反射。

## QML 属性、标识符与函数
### 主窗口中各个值的类型
`Main.qml` 的根对象是 `ApplicationWindow`，它继承 Qt Quick `Window`，所以相关属性类型由 `Window` 定义：[Qt Window QML 类型](https://doc.qt.io/qt-6/qml-qtquick-window.html)
| QML 写法 | 属性类型 | 右侧表达式的结果 |
|---|---|---|
| `minimumWidth: 1100` | `int` | 数字，匹配窗口最小宽度属性 |
| `minimumHeight: 680` | `int` | 数字，匹配窗口最小高度属性 |
| `visible: true` | `bool` | 布尔值 |
| `title: I18n.t(...)` | `string` | `t()` 在此处选出一个标题字符串 |
| `color: Theme.background` | `color` | Theme 中声明为 `color` 的属性 |
`I18n.t()` 在 `I18n.qml` 中没有写参数或返回类型注解，所以 QML 不会从函数签名得到静态的“返回 string”承诺；函数执行后返回 JavaScript 值。本例 `english` 和 `chineseText` 实参都是字符串，条件分支只返回其中一个，因此实际结果为字符串。这个值仍要赋给 `title` 的 `string` 属性；属性类型并没有变成 `var`。对颜色也类似：Theme 中 `background` 声明为 `color`，并非普通字符串。
### 内建属性与自定义属性
QML 对象类型提供一组确定的属性、信号、方法和附加属性；对象还继承基类的属性。`ApplicationWindow` 可以设置 `visible`、`title`、`color` 等，是因为这些属性属于它或继承自 `Window`。不能任意写一个 `foo: 123` 来给对象增加字段；如果该名字没有被对象类型定义，也没有通过有效语法声明为自定义属性，QML 会报不存在的属性。某些对象还提供 `Layout.fillWidth` 这类附加属性或 `font.family` 这类分组属性，它们也有类型定义，不是任意名称空间。
自定义属性通过 `property <类型> <名称>` 声明，例如 `property int currentPage: 0`、`property color toastAccent: Theme.primary`。常规 `property` 声明需要类型名称；`var` 是可持有不同 JavaScript 值的通用类型，例如 `property var ruleCache: [{}, {}]`。`property alias` 是另一个特殊声明，用来把自定义属性直接关联到已有对象或其属性，因此不用另写类型。可以加 `readonly` 等修饰符，类型约束仍由属性类型决定。[Qt QML 对象属性](https://doc.qt.io/qt-6/qtqml-syntax-objectattributes.html)、[Qt QML `var` 类型](https://doc.qt.io/qt-6/qml-var.html)
### `id` 与 `objectName`
`id` 是 QML 语言提供的对象标识符，不是普通属性。`id: root` 中的 `root` 按标识符语法解析，因此不加引号；`id: "root"` 不符合它的语法。标识符可在当前 QML 组件作用域中引用对象的属性、函数、信号等，例如 `root.width`、`root.showToast(...)`。它必须在作用域内唯一，创建后不能改，也不能写 `root.id` 读取它。不同 QML 文件属于不同作用域，可以各自使用 `id: root`。
`objectName` 则是 QObject 提供的字符串属性，可写成 `objectName: "mainWindow"`，常用于 C++ `findChild()`、调试或自动化查找对象。它与 QML 的 `id` 相互独立：前者是运行时对象的名字属性，后者是 QML 组件内部引用对象的标识符。对象类型名 `ApplicationWindow` 又是第三个概念，表示实例化哪种类型。[Qt QML `id` 属性](https://doc.qt.io/qt-6/qtqml-syntax-objectattributes.html)
### QML 函数和 JavaScript
QML 文档不是纯 JavaScript 文件：`import`、`ApplicationWindow { ... }`、`property` 等由 QML 语法组织对象和属性；绑定表达式及 `function` 函数体则使用 QML JavaScript 环境支持的 ECMAScript 语法，由 Qt 的 QML/JavaScript 引擎求值。它不是浏览器里的 JavaScript 环境，没有浏览器 DOM、`window` 等对象；可用能力来自 ECMAScript 内建对象和 Qt/QML 提供的对象。[Qt JavaScript 宿主环境](https://doc.qt.io/qt-6/qtqml-javascript-hostenvironment.html)
QML 函数可以显式写参数和返回类型注解，但项目中的 `I18n.t(english, chineseText)` 省略了它们，因而函数返回值由执行路径决定。这不意味着 `title` 可以保存任意类型：赋值目标仍有自己的类型，绑定结果必须可赋给目标属性。项目里 `I18n.t()` 的两个分支都是字符串，所以适配 `title: string`。
### 属性赋值与声明的区别
`visible: true` 是给 `ApplicationWindow` 已有的内建属性赋值；`property bool chinese: ...` 是在 QML 对象上声明一个新属性并设置初始绑定。冒号右侧可以是常量，也可以是绑定表达式。比如 `color: Theme.background` 会读取 `Theme.background`；当它依赖的属性变化时，QML 引擎会重新求值绑定。[Qt 属性绑定](https://doc.qt.io/qt-6/qtqml-syntax-propertybinding.html)

## QML 模块、类型导出与运行机制
### `Theme` 和 `I18n` 如何被导入
`Main.qml` 并没有写 `import I18n.qml` 或 `import Theme.qml`，而是写了 `import CommStudio 1.0`。`CMakeLists.txt` 中的 `qt_add_qml_module(CommStudio URI CommStudio VERSION 1.0 ...)` 将这些 QML 文件组织进 `CommStudio` 模块；`Theme.qml` 和 `I18n.qml` 同时在 `QML_FILES` 列表中，并通过 `QT_QML_SINGLETON_TYPE TRUE` 声明为单例。两个文件还写了 `pragma Singleton`。
构建生成的 `build/debug/CommStudio/qmldir` 可直接验证导出关系：它包含 `singleton Theme 1.0 qml/Theme.qml`、`singleton I18n 1.0 qml/I18n.qml` 等条目。因此 `Theme` 和 `I18n` 是 QML 单例类型名，`Theme.background`、`I18n.t(...)` 是“单例对象.属性/方法”的调用形式。它们的名字恰好取自 QML 文件名去掉扩展名；语法上不是按文件路径调用，而是通过模块暴露的单例对象访问。`Theme.qml` 自己的 `id: theme` 只在该文件的组件作用域内使用，不会成为外部名称。[Qt QML 模块](https://doc.qt.io/qt-6/qtqml-modules-topic.html)、[Qt qmldir 格式](https://doc.qt.io/qt-6/qtqml-modules-qmldir.html)
### `CommStudio` URI 的来源和导入范围
有两个概念名字相同：`project(CommStudio)` 声明 CMake 项目名，`qt_add_executable(CommStudio ...)` 创建可执行目标；`qt_add_qml_module` 的 `URI CommStudio` 才定义 QML 模块标识符。它没有对应一个叫 `CommStudio.qml` 的文件，也不要求项目必须有同名类。
URI 用来查找模块。QML 引擎根据 import path 和模块目录里的 `qmldir` 解析 `import CommStudio 1.0`，再将模块提供的类型放入**当前 QML 文件**可用的类型命名空间。CMake 会按 URI 生成 `qmldir` 和类型描述文件，并将模块资源编入目标；本项目生成的 `qmldir` 有 `prefer :/qt/qml/CommStudio/`，说明资源系统是首选路径。每个 QML 文件有自己的 imports；`Main.qml` 的 import 不会让所有独立组件文件自动继承它，所以页面和组件里也能看到各自的 `import CommStudio 1.0`。[Qt `qt_add_qml_module`](https://doc.qt.io/qt-6/qt-add-qml-module.html)、[Qt 标识模块与 URI](https://doc.qt.io/qt-6/qtqml-modules-identifiedmodules.html)
此外，`CommStudio.Backend 1.0` 是另一条独立注册路径。它在 `src/main.cpp` 中通过 `qmlRegisterSingletonInstance()` 注册，提供 `Studio`、`SerialManager`、`ModbusManager`、`BluetoothManager`、`NetworkManager`、`ToolboxManager` 和 `WindowChrome` 等对象；C++ 管理器的属性和可调用方法再由 `Q_PROPERTY`、槽或 `Q_INVOKABLE` 暴露。源码可分别从 `CMakeLists.txt` 的 QML module 声明和 `src/main.cpp` 的 backend 注册处确认。
### 如何检查模块实际导出了什么
先看模块生成或手写的 `qmldir`。它列出模块 URI、类型名称、版本、对应 QML 文件，以及是否为 singleton。对于本项目，`build/debug/CommStudio/qmldir` 是已生成的实际清单。
再打开类型对应的 QML 文件：外部使用者能访问组件根对象的公开属性、信号、方法和继承成员。根对象内部的子对象 `id` 仅供该组件内部引用；想让外部配置内部控件，需要在根对象上显式声明 `property alias` 或其他公开属性。C++ 类型则检查 `Q_PROPERTY`、`signals`、`public slots`、`Q_INVOKABLE` 和对应 URI 下的注册代码。`qmldir` 说明“模块提供哪些类型”，类型声明说明“每种类型有哪些可访问接口”。
### 从 QML 文件到显示画面
QML 使用 Qt Declarative 的引擎运行。大体过程是：
```text
QML 文件和 import
  → 按 URI/import path 查找模块、qmldir、资源与类型
  → 解析/编译 QML 文档和其中的 JavaScript 表达式
  → 创建 QObject / Qt Quick 对象树，安装信号处理器与属性绑定
  → app.exec() 进入事件循环，响应输入并重算受影响的绑定
  → Qt Quick 场景图更新并经图形后端绘制窗口
```
属性绑定不是每帧重新解释整份文件；引擎会跟踪表达式依赖，仅在依赖变化时重新求值。例如本项目改变 `Studio.language` 后，`I18n.chinese` 绑定更新，随后引用 `I18n.t(...)` 的界面文字重新计算。
`qml /path/to/file.qml` 使用 Qt 提供的 `qml` runtime 工具加载 QML 文件；如果文档包含可视对象，它会创建窗口显示场景。它提供运行引擎和 GUI 事件循环，便于快速预览与测试，不是把源文件静态转换为截图，也不表示 QML 只能逐行解释。[Qt `qml` 命令行工具](https://doc.qt.io/qt-6/qtqml-tooling-qml.html)
### QML 的编译和性能
“写的是 QML/JavaScript”不等于“每次都由简单解释器逐行执行”。本项目通过 `qt_add_qml_module` 构建；该 CMake 命令默认协调 QML 缓存编译、资源嵌入和类型生成。Qt 的 `qmlcachegen` 会为 QML 文档生成编译单元，其中包含文档结构、JavaScript 表达式/函数的字节码，以及在编译器能完整分析的情况下生成的部分 C++ 代码。项目构建目录中的 `.rcc/qmlcache` 也能看到生成的 QML 缓存源文件。运行时的 QML JavaScript 引擎可以解释字节码或在支持时 JIT 编译；因此它是带动态运行时和编译优化的系统，而非一个纯粹的文本解释器。[Qt `qt_add_qml_module`](https://doc.qt.io/qt-6/qt-add-qml-module.html)、[Qt QML 脚本编译器](https://doc.qt.io/qt-6/qtqml-qml-script-compiler.html)
QML 负责窗口、布局、属性绑定和用户交互，计算密集的业务逻辑可放在 C++。本项目的 Modbus 编码、串口/网络 I/O 和管理器逻辑主要是 C++；QML 负责界面并调用后端，因此不应仅凭“有 JavaScript 引擎”就推断整个程序会明显变慢。实际性能仍取决于对象数量、绑定开销、JavaScript 计算量、图形后端和渲染负载。`qml` 工具运行单个文件时也依然使用 Qt Quick 场景图和图形后端。
需要区分 `qml` 工具和本项目的 C++ 启动程序：`qml` 工具不会自动执行 `src/main.cpp` 中的对象构造和 `qmlRegisterSingletonInstance()` 注册。`Main.qml` 依赖 `CommStudio.Backend` 中的 C++ 单例；直接把它交给 `qml` 命令通常缺少这些运行时注册。完整运行本项目应启动 CMake 构建出来的 `CommStudio` 可执行文件；`qml` 命令适合运行不依赖该 C++ backend 的独立 QML 组件/示例。

## QML 模块声明、C++ 单例名与 `qmldir`
### QML module 是什么
QML module 是由 URI 标识的一组可导入 QML 类型和资源，也可能包含 C++ 注册类型及插件。它不只是把某个目录里的文件统称起来：模块声明还规定模块标识、版本、可导入类型和资源位置。`qt_add_qml_module(target URI CommStudio VERSION 1.0 ...)` 中，`URI` 是导入标识，`VERSION` 是模块及类型可用的版本信息；文件加入 `QML_FILES` 后通常会作为 QML 类型进入模块，图片等资源通常放在 `RESOURCES`。源文件属性或 `NO_QMLDIR_TYPES` 可以改变单个文件是否作为类型公开。
### `qmlRegisterSingletonInstance` 的名称参数
函数大体形式为 `qmlRegisterSingletonInstance<T>(uri, major, minor, typeName, object)`。模板参数 `T` 是 C++ 编译期类型；第四个实参 `typeName` 是注册到 QML 的名称。CommStudio 传入 `"Studio"`，所以 QML 导入 `CommStudio.Backend 1.0` 后写 `Studio.language`、`Studio.clearLogs()`。URI 和版本确定模块命名空间，`typeName` 决定其中可引用的 QML 符号。传入的 `QObject` 实例必须比使用它的 `QQmlEngine` 活得久，并与引擎处在同一线程。[Qt `qmlRegisterSingletonInstance`](https://doc.qt.io/qt-6/qqml-h.html)
### QML 文件单例的 CMake 标记
`set_source_files_properties(qml/Theme.qml PROPERTIES QT_QML_SINGLETON_TYPE TRUE)` 给 CMake 的该源文件设置构建元数据。它本身不创建对象，也不会在 C++ 层创建进程级全局变量；和文件里的 `pragma Singleton` 一起使用时，Qt 的 QML 构建集成会在生成的 `qmldir` 中写入 `singleton Theme ...`。QML 单例在每个 `QQmlEngine` 中最多实例化一次，通常在首次访问时创建。这个源属性要在 `qt_add_qml_module` 添加文件之前设置。[Qt 单例文档](https://doc.qt.io/qt-6/qml-singleton.html)
### `set_source_files_properties` 可以设置哪些属性
这是通用 CMake 命令，用键值对为指定源文件设置构建属性，并非 Qt 单例专用。Qt QML 增加了特定的源文件属性，例如：
| 属性 | 用途 |
|---|---|
| `QT_QML_SINGLETON_TYPE` | 将 QML 文件声明为单例类型 |
| `QT_QML_INTERNAL_TYPE`、`QT_QML_SKIP_QMLDIR_ENTRY` | 标记内部类型，或不把文件登记为模块类型 |
| `QT_QML_SOURCE_TYPENAME`、`QT_QML_SOURCE_VERSIONS` | 覆盖默认 QML 类型名或类型可用版本 |
| `QT_QML_SKIP_CACHEGEN`、`QT_QML_SKIP_QMLLINT` | 排除该文件的 QML 字节码缓存生成或自动 lint |
| `QT_RESOURCE_ALIAS` | 改变文件放入 Qt 资源系统时的相对路径 |
| `QT_QML_SKIP_TYPE_COMPILER` | 控制是否跳过 qmltc 的 C++ 类型编译（需看 Qt 版本和项目是否启用 qmltc） |
这些属性及可用项随 Qt 版本变化。普通 CMake 源文件属性还包括 `COMPILE_OPTIONS`、`COMPILE_DEFINITIONS`、`INCLUDE_DIRECTORIES`、`GENERATED`、`HEADER_FILE_ONLY`、`LANGUAGE`、`OBJECT_DEPENDS` 等。`get_source_file_property()` 可查询属性；CMake 命令行帮助和 Qt 的 QML source-file properties 文档分别列出通用与 Qt 专用属性。[CMake `set_source_files_properties`](https://cmake.org/cmake/help/latest/command/set_source_files_properties.html)、[Qt QML 源文件属性](https://doc.qt.io/qt-6/qt-target-qml-sources.html)
### 如何检查 `qmldir`
在本项目根目录运行：
    find build -type f -name qmldir -print
    sed -n '1,80p' build/debug/CommStudio/qmldir
当前构建还生成了 `build/release/CommStudio/qmldir` 和 `build/Desktop_Qt_6_11_2_Debug/CommStudio/qmldir`。实际路径会随 preset、构建配置和 `OUTPUT_DIRECTORY` 改变。文件开头的 `module CommStudio` 标记 URI；例如 `singleton Theme 1.0 qml/Theme.qml` 表示该模块导出了 1.0 版的 `Theme` 单例。`qmldir` 是构建生成物时，检查 `CMakeLists.txt` 中的 `qt_add_qml_module`、`QML_FILES` 和源文件属性可以追溯其来源；如果文件被嵌入资源系统，`qmldir` 中也可能有 `prefer :/qt/qml/...` 指令。

## QML 组件作用域、信号处理器与 Popup
### `id` 的作用域与唯一性
QML 的 `id` 不是按对象树的父子层级决定可见性，而是在组件作用域内引用对象。通常，同一个 `.qml` 文件根组件中的对象，不论处在根对象、孙对象还是不同分支，都能通过 `id` 互相引用。把子对象提取成单独的 QML 类型后，它的内部 `id` 属于该子组件，不应由父组件直接访问；需要通过根对象上的 `property alias`、普通属性、方法或信号定义公开接口。QML 有动态作用域等机制，内层组件在某些实例上下文中可能解析到外层 id，但这会造成隐式耦合，不适合作为组件 API。[Qt 作用域说明](https://doc.qt.io/qt-6/qtqml-documents-scope.html)
`id` 必须在同一 QML 组件作用域内唯一，而不是只要求同一层兄弟对象互不重复。不同 QML 组件可以各自写 `id: root`；同一组件作用域内重复 id 会被 `qmllint` 标记为重复 ID，属于 QML 禁止的写法，不能依赖前一个或后一个 id 覆盖另一个。[Qt 重复 ID 规则](https://doc.qt.io/qt-6/qmllint-warnings-and-errors-syntax-duplicate-ids.html)
### `onSignal` 和 `Component.onCompleted`
在定义了 `signal toastRequested(string text, bool ok)` 的对象上，`onToastRequested: (text, ok) => ...` 是 QML 的信号处理器写法。引擎会把它连接到该对象的 `toastRequested` 信号并在发射时执行；它不是普通自定义属性，也不是需要业务代码查找并手动调用的函数。`Connections` 对象通过 `target` 指定发送者，然后可用 `function onToastRequested(text, ok) { ... }` 处理目标信号。
`Main.qml` 根对象的 `onVisibilityChanged` 对应继承自 `QWindow` 的 `visibilityChanged` 信号/属性通知，名称中的 Changed 不能省略。`visibility` 表示窗口状态（例如隐藏、最小化、最大化或全屏）；它与布尔属性 `visible` 不同，后者对应 `visibleChanged` 和 `onVisibleChanged`。当前处理器收到窗口状态变化后检查 `visible`，只在窗口仍可见时延迟调用 `syncNativeTitleBar()`。
`Component.onCompleted` 是附加信号处理器：QML 引擎为对象提供 `Component` 附加对象，并在对象实例化完成时发射 `completed()`。因此 `Main.qml` 的这个处理器在窗口根对象创建完成后进行主题初始化、解析启动参数，并用 `Qt.callLater()` 延后同步原生标题栏。它不是 `ApplicationWindow` 自己声明的属性或信号。[Qt 信号处理器文档](https://doc.qt.io/qt-6/qtqml-syntax-signals.html)
### `toastText` 为什么能从根函数访问
`toastText` 声明在 `Main.qml` 的 `Popup.contentItem` 对象树中，但仍属于 `Main.qml` 组件作用域，所以根对象的 `showToast()` 可以直接写 `toastText.text = text`。对象树嵌套本身不会创建 `property alias` 边界。
`contentItem` 是 `Popup` 已有的属性。`contentItem: Item { ... }` 是为该属性创建并赋值一个 Item；其内部 `Text` 用 `id: toastText` 命名。`property alias` 用于跨组件边界公开子组件的内部属性或对象；这里这些对象都在同一个组件中，无须 alias。
### Popup 的 Overlay、modal 和 modeless
这几个名字不是 `parent` 可选值：`Overlay.overlay` 是附加属性，取得当前窗口覆盖层；`modal` 是 `Popup` 的布尔属性；`Overlay.modal` 和 `Overlay.modeless` 是配置覆盖层视觉内容的附加属性。
| 写法 | 作用 |
|---|---|
| `parent: Overlay.overlay` | 将 Popup 放到窗口 Overlay 的视觉层级和坐标参照中，便于覆盖其他内容并按窗口坐标定位 |
| `modal: true` | 模态 Popup 阻止鼠标按下/释放事件传给它下方的界面；通常可显示背景遮罩 |
| `modal: false` | 非模态 Popup；底层界面仍可交互 |
| `Overlay.modal: Rectangle { ... }` | 指定模态 Popup 下方遮罩的组件外观 |
| `Overlay.modeless: Rectangle { ... }` | 指定启用了背景 dim 的非模态 Popup 的遮罩外观 |
`Popup.dim` 控制背景是否变暗，默认跟随 `modal`。本项目 toast 写 `parent: Overlay.overlay`、`modal: false`、`closePolicy: Popup.NoAutoClose`，由 Timer 关闭；它覆盖在界面上，但不阻挡底层交互。确认对话框则设置 `modal: true`，并通过 `Overlay.modal` 自定义遮罩。[Qt Overlay 文档](https://doc.qt.io/qt-6/qml-qtquick-controls-overlay.html)、[Qt Popup 文档](https://doc.qt.io/qt-6/qml-qtquick-controls-popup.html)
### `anchors.fill: parent`
`anchors.fill: parent` 是四边锚定的简写，等价于把 Item 的 left、right、top、bottom 分别锚定到 parent 的对应边。默认没有 margins 时，子 Item 会随目标 Item 尺寸变化并填满其范围。`parent` 在这里是 QQuickItem 的视觉父对象。Main.qml 中该 Item 填充窗口内容区；同一对象的 `clip: true` 会裁掉超出它边界绘制的子内容。锚点与 `x/y/width/height` 同时约束同一轴时可能冲突，应避免重复指定几何关系。[Qt Anchors 文档](https://doc.qt.io/qt-6/qtquick-positioning-anchors.html)
### 没有 `id` 的对象和 Connections
QML 对象定义里的 `id` 是可选项。没有 id 的对象仍会被创建并进入对象树，可以在定义处直接设置属性、作为某个属性的值、通过父对象的属性引用，或让框架按其角色使用。它只是没有一个可在当前 QML 作用域中写出的 id 名称；若后续要从代码引用它，可增加 id，若要让外部组件访问则应定义公开属性或 alias。不要依赖 `children[0]` 这类顺序索引来定位对象。
`Connections` 也是普通 QML 对象，因此可以写 `id: serialConnections`，之后在同一作用域引用它的属性，例如 `serialConnections.enabled = false`。如果代码不需要启用/禁用连接或访问其属性，省略 id 更简洁。Main.qml 中四个 `Connections` 只需声明 `target` 和处理器，所以没有 id。
### `WindowChrome::apply` 的职责
`Main.qml` 在初始化和窗口状态变化时调用 `WindowChrome.apply(root, Theme.dark, Theme.chrome, Theme.textPrimary, Theme.chrome)`。C++ 函数先将 QObject 转为 `QWindow`，失败就返回 false。Windows 分支通过 `winId()` 取得原生 HWND，调用 DWM 设置深色标题栏、标题栏颜色、标题文字颜色和边框颜色，再触发非客户区重绘与 DWM 刷新。属性编号 20 对应深色标题栏，34、35、36 对应边框、标题栏和标题文字颜色；代码也尝试用 19 作为旧系统深色标题栏属性回退。[Microsoft DWM 属性文档](https://learn.microsoft.com/windows/win32/api/dwmapi/ne-dwmapi-dwmwindowattribute)
在非 Windows 平台，函数只标记参数未使用并返回 false，因此不会改动 Linux/macOS 的系统标题栏。Windows 分支的返回值取决于深色模式属性调用是否成功；标题、文字和边框颜色调用的 HRESULT 没有被检查，所以 true 不代表每一种颜色修改都成功。


## QML 函数、属性通知与模型委托
### QML 内联函数与 JavaScript 文件
QML 文档中的 JavaScript 有三种常见位置：属性绑定表达式、信号处理器、对象内定义的函数。对象内的 `function name(args) { ... }` 是该对象的方法，常被称为内联 JavaScript 函数，因为实现写在 QML 类型定义里；它可以从同一对象的信号处理器、绑定或其他对象调用。
独立逻辑可以放进 `.js` 文件，再由 QML 用别名导入。导入路径相对于当前 QML 文件；别名首字母大写，调用时写 `Alias.functionName(...)`：
```qml
import "TextUtils.js" as TextUtils

Text {
    text: TextUtils.formatValue(value)
}
```
普通脚本可使用导入它的 QML 文档所提供的模块上下文；脚本使用 `.pragma library` 后成为共享脚本，不继承导入方的模块导入，因此应在脚本中显式导入依赖。脚本里的变量不等于任意 QML 对象的全局变量；若要操作某个对象，优先把对象或所需值作为参数传入。JavaScript 访问 QML 时可以读取和设置传入对象的属性、调用其方法；QML 调用 C++ 则通过暴露给 QML 的 `QObject` 属性、信号、槽或 `Q_INVOKABLE` 方法完成。
CommStudio 当前的 `qml/` 目录没有独立的 `.js`/`.mjs` 资源；主题和翻译逻辑主要放在 `Theme.qml`、`I18n.qml` 单例中，组件中也有内联 JavaScript 表达式。
### 属性变化信号与处理器
信号处理器按信号名命名为 `on` 加首字母大写的信号名。例如 `clicked` 对应 `onClicked`，自定义信号 `errorOccurred` 对应 `onErrorOccurred`。属性变化处理器的固定格式是 `on<PropertyName>Changed`，例如 `visible` 对应 `onVisibleChanged`。它不是把任意属性名和任意信号名拼接起来。
QML 中声明的属性（例如 `property int count`）会隐式提供 `countChanged` 变化通知，因此可以写 `onCountChanged`。C++ 的 `Q_PROPERTY` 不会自动生成通知信号；需要声明 `NOTIFY countChanged` 或提供可绑定通知能力 `BINDABLE`，否则 C++ 改值时 QML 绑定没有可靠的变化通知可监听。普通自定义信号则必须先用 `signal xxx(...)` 声明，其处理器才有对应事件。
### QML 类型继承与对象组合
QML 文件根对象的类型决定自定义类型的基类，不需要写类似 C++ 的 `extends`。例如 `AppButton.qml` 的根对象是 `Button`，所以 `AppButton` 实例具有 `Button` 的属性、信号和方法，再加上文件根对象声明的 `variant`、`accent` 等自定义属性。根对象中定义的属性、信号和方法构成该 QML 类型对外可用的接口；根对象内部子项的 `id` 仍属于该组件内部。
把 `Text`、`Rectangle` 等对象嵌在某个对象下面是组合关系，形成对象树；它不会让子对象成为父对象的子类。需要定义可复用类型时，可以把组件放入独立 `.qml` 文件，也可以在支持的 Qt 版本中声明 inline component。
### Behavior 与颜色动画
`Behavior on color` 为当前对象的 `color` 属性设置默认动画。颜色目标值变化时，`ColorAnimation` 从当前颜色插值到新颜色；`duration` 是动画时长，单位毫秒。绑定仍然决定最终目标值，Behavior 负责让画面平滑过渡；这不是状态声明。
```qml
Behavior on color {
    ColorAnimation {
        duration: Theme.durationNormal
    }
}
```
CommStudio 的 `Main.qml` 在背景矩形上用此写法，所以主题颜色变化时背景渐变过渡；`AppButton.qml` 也对背景颜色和边框颜色添加了短动画。一个属性通常只配置一个 Behavior；若要在行为中并行或顺序运行多段动画，可把它们包在 `ParallelAnimation` 或 `SequentialAnimation` 中。
### 默认属性
一个 QML 对象可以有一个 default property。它指定：在对象声明中直接嵌套、但没有写明属性名的子对象，应被赋给哪个属性。
例如 `FormRow.qml` 声明 `default property alias contentData: contentSlot.data`。调用方可写：
```qml
FormRow {
    label: "端口"
    ComboBox { }
}
```
这里的 `ComboBox` 没有显式写成 `contentData: ComboBox { }`，QML 会按默认属性把它放进 `contentSlot.data`，也就是内部 `ColumnLayout` 的内容槽。默认属性常用于容器组件简化调用处语法；它不代表“默认值”，也不是对象的默认状态。Qt Quick 的 `Item` 默认属性是 `data`，因此普通子对象可以直接写在 `Item { ... } ` 中。
### 属性分组
属性分组只是访问一个属性的子属性的写法，不是另一种属性声明，也没有 `group property` 关键字。例如 `Text.font` 包含 `pixelSize`、`bold` 等子属性，下面两种写法等价：
```qml
font.pixelSize: 12
font.bold: true

font {
    pixelSize: 12
    bold: true
}
```
分组也常见于 `anchors.fill`、`border.color` 等。属性组可能基于值类型，也可能基于对象类型；同一个对象定义中，不要既整体替换属性对象又同时设置其子属性。
### 动态作用域与 ID 查找
“后加载文档覆盖之前文档的 ID，像全局变量”不是准确的规则。QML 的 `id` 属于组件作用域，不会注册进一个供所有文档共同修改的进程级全局表。同一组件中 ID 必须唯一；分开的 QML 组件有各自作用域，因此都可以有 `id: root`。
QML 表达式除了普通 JavaScript 局部作用域，还能在组件上下文中解析 ID 和根对象属性。动态作用域意味着：某个组件被放入另一个组件中时，组件内未声明的名称在特定情况下可能继续沿实例化上下文查找到外层属性或 ID。若查找链上存在同名名称，离表达式更近的名称可能遮蔽外层名称；这不是“后加载文件覆盖 ID”，而是名称解析依赖了组件的使用位置。这会让组件单独加载、移到另一个页面或复用时表现改变。
可复用组件应通过显式属性、属性别名、信号和方法接收外部数据。例如不要让 `TitleText.qml` 偷偷依赖放置它的页面是否有 `title`，而是给 `TitleText` 声明 `property string title`，并在使用处写 `title: page.title`。这样依赖可见、可检查，也不会因外层同名 ID 而改变含义。
### 属性绑定与绑定移除
属性绑定用 JavaScript 表达式声明属性之间的关系。引擎在表达式求值时跟踪读到的属性；依赖变化后重新计算绑定，并把新值写到目标属性。例如 `height: parent.height / 2` 会在父对象高度改变后重新计算。
绑定从对象实例化并建立属性值时开始生效，在绑定被替换、被命令式赋值覆盖，或目标对象销毁时结束。可以通过普通赋值移除当前绑定，也可以用 `Qt.binding(function() { ... })` 从 JavaScript 再安装一个绑定：
```qml
height: width * 2

Component.onCompleted: {
    height = 100                 // 固定赋值，原来的绑定被移除
    height = Qt.binding(function() { return width * 3 })
}
```
教程里“绑定会被销毁”指的是目标属性上的那条依赖表达式被移除，不是对象或属性本身被销毁。若 `text` 原来由 `text: counter.value` 决定，随后执行 `text = ""`，它会变成普通静态值；之后 `counter.value` 再变化也不会自动更新 `text`。如果需求是用户可清零并继续累计，就应把“当前计数”建模为可变状态，再用另一个绑定属性计算显示内容，不要同时把同一属性既当计算结果又当可直接改写的状态。
### QML 状态
基于 `Item` 的对象有 `state` 属性和默认状态。默认状态名为空字符串，保存对象初始属性值。可在 `states` 列表中用 `State` 命名一组配置，再用 `PropertyChanges` 改属性；把对象的 `state` 设成该名称即可切换。也可以用 `State.when` 绑定条件，使条件为真时进入状态、为假时回到默认状态。状态可以改变属性、锚点、父对象或运行状态切换脚本；`Transition` 可以把状态切换动画化。
```qml
Rectangle {
    id: box
    color: "gray"

    states: [
        State {
            name: "warning"
            PropertyChanges { target: box; color: "orange"; scale: 0.95 }
        }
    ]
    state: "warning"
}
```
状态适合描述同一对象在“正常/警告”“收起/展开”等模式下的一组属性配置；只有一个属性需要随某个值变化时，简单属性绑定通常更直接。当前 CommStudio 的 QML 中暂未发现使用 `states:` 的页面，组件视觉变化主要由普通绑定和 Behavior 完成。
### 信号处理器、箭头函数与匿名函数
这三个概念处在不同层面。信号处理器（例如 `onErrorOccurred`）是 QML 引擎连接事件与响应代码的入口；箭头函数 `(x) => ...` 和匿名函数表达式 `function(x) { ... }` 是可放进处理器中的 JavaScript 函数形式。QML 对象内的 `function reset() { ... }` 则是有名字、属于对象的方法。
箭头函数没有自己的 `this` 和 `arguments`，会沿用外层上下文；普通匿名函数有自己的 `this` 和 `arguments`。处理信号参数时显式写形参最清楚：
```qml
onErrorOccurred: (msg, line, col) => {
    console.log(`${line}:${col}: ${msg}`)
}
```
形参名只负责接收参数位置，不必和信号声明的名字一致。信号参数按位置传入，所以可以省略末尾不需要的参数，例如 `message => ...`；不能只省略开头参数却直接接收第三个，必须用未使用的占位形参占住位置，例如 `(_message, _line, col) => ...`。下划线没有特殊语义，只是变量名。Qt 教程中的例子把形参写成 `mgs` 却在模板字符串里引用 `msg`，这是拼写错误；两处必须统一。
也可以把一段普通代码块直接赋给处理器，旧式写法会把信号参数名注入代码块作用域。这样读代码时不容易看出变量从哪里来，而且查找成本更高；该方式已弃用，实际使用注入参数时会产生运行时警告。新代码用箭头函数或 `function(params) { ... }` 显式列出参数。
### 附加属性、附加信号与 Component.onCompleted
附加属性和附加信号由某个“附加类型”在运行时提供给特定对象，语法以附加类型名称作前缀：`AttachingType.property` 或 `AttachingType.onSignal`。它们不是对象自己声明的普通属性/信号。
`Component.onCompleted` 是附加信号处理器。QML 引擎为对象关联 `Component` 附加对象，在对象实例化完成时发出 `completed` 信号；因此它不是 `ListModel` 自己的 `completed` 信号。不同对象的完成处理器调用先后不应作为业务依赖。
给定的 `ListModel` 示例在模型实例化完成后循环调用其 `append()` 方法，逐个追加 10 个对象，每个对象有一个 `Name` 角色，值为 `Item 0` 至 `Item 9`。ListView 监听模型变化并据此生成 delegate。当前 delegate 写的是 `Text { text: index }`，所以画面显示索引 `0` 到 `9`，并没有读取 `Name`；若要显示角色内容，应写 `text: Name`。
### delegate 与 ListView 附加属性
`ListView.model` 提供数据项，`delegate` 提供每一项的对象模板。模型有多少项，逻辑上就有多少行；ListView 为可见区域按需创建 delegate，所以 delegate 是重复实例化的模板，不是整个列表只创建一次的对象。delegate 根对象通常可读取模型角色和 `index`。
示例中的 `model: 3` 是三个整数模型项，delegate 的索引为 0、1、2。每个 delegate 创建一个 100×30 的黄色矩形；若它是当前项，`ListView.isCurrentItem` 为真，颜色改为红色。若要保证第一行当前，可显式设 `currentIndex: 0`；当前索引无效时没有 delegate 会变红。
`ListView.isCurrentItem` 是 ListView 附加到其 delegate 实例上的只读附加属性，因此写在 delegate 内可直接判断当前项。ListView 还提供 `ListView.view` 等附加属性给 delegate 使用。这种机制让模板知道自己在何种视图中、代表哪条数据，而无需给模板额外传入整个对象树引用。
### 官方资料
[Qt：JavaScript Expressions in QML](https://doc.qt.io/qt-6/qtqml-javascript-expressions.html)
[Qt：Importing JavaScript Resources](https://doc.qt.io/qt-6/qtqml-javascript-imports.html)
[Qt：Signal and Handler Event System](https://doc.qt.io/qt-6/qtqml-syntax-signals.html)
[Qt：Property Binding](https://doc.qt.io/qt-6/qtqml-syntax-propertybinding.html)
[Qt：QML Object Attributes](https://doc.qt.io/qt-6/qtqml-syntax-objectattributes.html)
[Qt：Scope and Naming Resolution](https://doc.qt.io/qt-6/qtqml-documents-scope.html)
[Qt：Defining Object Types through QML Documents](https://doc.qt.io/qt-6/qtqml-documents-definetypes.html)
[Qt：Qt Quick States](https://doc.qt.io/qt-6/qtquick-statesanimations-states.html)
[Qt：ListView](https://doc.qt.io/qt-6/qml-qtquick-listview.html)

