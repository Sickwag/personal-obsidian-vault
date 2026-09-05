---
参考: https://rzl6.github.io/ROS2_Tuition
crea: 2026-09-02
---

# ROS2 基础

## 工作空间概念
工作空间（Workspace）= 组织多个功能包的顶层目录，固定结构：
```
ws00_helloworld/
├── src/        # 源码区：放置所有功能包源码
├── build/      # 构建区：colcon 的中间产物（每包一个子目录）
├── install/    # 安装区：最终产物 + 环境脚本 setup.zsh
└── log/        # 构建日志
```
与既有经验的类比：

| 你的经验 | 对应关系 |
|---------|---------|
| CMake 单工程 | 一个 ROS2 功能包（pkg01_helloworld_cpp） |
| CMake 的 build 目录 | 工作区的 build/ |
| make install 产物 | install/ |
| vcpkg 的 installed/ | install/（都是"安装后的可见目录"） |
| Gradle multi-module / cargo workspace | 工作区（管理多个子包 + 依赖排序） |

**核心概念：overlay（覆盖层）**
工作区可以层层叠加：
```
/opt/ros/jazzy        ← underlay（ROS2 本体，系统安装）
   ↑ 被叠加
ws00_helloworld       ← overlay（你的工作区）
```
source `install/setup.zsh` 做的事 = **chain（串联）**：先加载 underlay（/opt/ros/jazzy），再加载自己。这就是为什么生成的 setup.zsh 前半段是 `COLCON_CURRENT_PREFIX="/opt/ros/jazzy"`——它是链条，不是孤立文件。

## ament 与 find_package 的作用
**ament** = A Meta Build system，基于 CMake 的 ROS 构建体系扩展。

### find_package(ament_cmake REQUIRED)
没有它 CMakeLists.txt 只是普通 CMake 工程——能编但产物无法被 ROS2 生态识别。提供关键宏：

| 宏 | 作用 |
|----|------|
| `ament_package()` | 生成包的安装布局、导出配置、环境钩子（setup.zsh 的来源） |
| `ament_target_dependencies()` | 比 `target_link_libraries` 更"懂 ROS"：连带传递 include 路径、依赖顺序、导出元信息 |

不用 `target_link_libraries` 的原因：普通 CMake 链接只"把这个库链上"，ament 还处理包之间的**依赖发现和导出**（类似 gRPC 项目的 `gRPCConfig.cmake` 机制，ament 是标准化的那层）。

### find_package(ament_lint_auto)
在 `if(BUILD_TESTING)` 块内，colcon build 默认开测试，它自动发现并运行代码检查器（copyright / cpplint / cppcheck）。模板里两行：
```cmake
set(ament_cmake_copyright_FOUND TRUE)  # 跳过版权检查（没写版权头）
set(ament_cmake_cpplint_FOUND TRUE)    # 跳过 cpplint（要求严格风格）
```
教学包故意关掉 lint 的写法，正式项目应补版权头再开启。

## ROS2 与 Qt 模式对比（架构分层）
**像 Qt 的地方**：`rclcpp/rclcpp.hpp` 一个头文件囊括一切，类似 Qt 聚合头；`find_package(rclcpp)` 类似 `find_package(Qt6)`；封装底层 C 接口类似 Qt 封装 QPA。

**不像的地方**：ROS2 是分层中间件栈，不是一个大库：
```
应用层   rclcpp (C++)          ← 用户代码层，面向对象封装
中间层   rcl (C 库)             ← 语言无关的 ROS 客户端库
底层     rmw 中间件接口 + DDS 实现 (FastDDS / CycloneDDS ...)  ← 真正干通信的
```
rclcpp 自己不实现通信，通信在 DDS 层。换 DDS 实现只需设 `RMW_IMPLEMENTATION` 环境变量，应用代码零改动（类比 gRPC 是 HTTP/2 之上的封装，ROS2 是 DDS 之上的封装）。

**关键类比**：`rclcpp::spin()` = ROS2 的事件循环 = Qt 的 `QApplication::exec()`。helloworld.cpp 没调 spin 因为 spin 进入循环永不返回，单次打印完就该退出。学到第 2 章话题通信 spin 才出场：节点要持续接收消息必须挂进事件循环。这也解释了 `--node-name` 生成的带类定义 + spin 模板代码与手写简化版的差异。

## package.xml 的作用
包的清单文件（manifest），各生态类比：

| 生态 | 清单文件 |
|------|---------|
| Maven | pom.xml |
| npm | package.json |
| vcpkg | vcpkg.json |
| Debian | debian/control |
| ROS2 | package.xml |

作用：
1. 元信息：name / version / maintainer / license
2. 依赖声明：`<depend>rclcpp</depend>` —— colcon 靠它做包依赖排序（先构建被依赖的包）；rosdep 也靠它装系统级依赖
3. 构建类型：`<export><build_type>ament_cmake</build_type></export>` —— 告诉 colcon 用哪套规则（C++ 用 ament_cmake，Python 用 ament_python）
4. 被工具发现：`ros2 pkg list` / `ros2 node list` 扫描它

**双文件分工**：
```
CMakeLists.txt   →  怎么构建（构建系统的视角）
package.xml      →  包是什么、依赖谁（生态的视角）
```
package.xml 声明依赖 → colcon 保证依赖先构建 → 构建时 `find_package(rclcpp)` 才能找到（rclcpp 安装后生成 `share/rclcpp/cmake/rclcppConfig.cmake`）。

## 构建命令逐条拆解
```zsh
ros2 pkg create pkg01_helloworld_cpp \
    --build-type ament_cmake \      # 生成 C++ 模板（CMakeLists + package.xml + src/）
    --dependencies rclcpp \         # 自动写入 package.xml 的 <depend> 和 CMake 的 find_package
    --node-name helloworld          # 自动生成 src/helloworld.cpp 节点骨架
```
```zsh
colcon build   # 扫描 src/ 下所有包 → 按依赖拓扑排序 → 逐包调 CMake（configure→build→install 到 install/）→ 生成 install/setup.zsh
```
```zsh
. install/setup.zsh    # . 是 source 的别名，在当前 shell 进程内执行，注入环境变量
```
- 直接 `./setup.zsh` 会在子 shell 跑，改的环境变量带回不来，等于白改
- 每次新终端都要做一次（除非写进 shell 启动文件）

```zsh
ros2 run pkg01_helloworld_cpp helloworld   # 通过 AMENT_PREFIX_PATH 找包，再定位并执行可执行文件，不依赖当前目录
```

## colcon 的本质
colcon 不是编译器，是多包构建编排器（orchestrator）：
```
工作区层   colcon         ← 编排：扫包、拓扑排序、并行、隔离、生成环境脚本
单包层     ament_cmake    ← CMake 扩展：提供 ROS 约定的宏
           CMake          ← 通用构建系统
```
自己不编译，它"调度"：对 ament_cmake 包调 CMake，对 ament_python 包调 setup.py。最贴切类比：cargo workspace 对多个 crate 的编排。

## 环境变量注入原理（source / .bashrc 机制）
### 为什么每次都要 source
每次开新终端，shell 进程全新启动，环境变量只继承系统默认值——不知道工作区存在。`ros2 run` 找不到包是因为 PATH 里没有工作区路径、AMENT_PREFIX_PATH 里没有工作区。`source install/setup.zsh` = 在当前终端进程注入环境变量（临时，只对当前终端有效，关掉即失效）。

## 多工作空间共存与工作空间覆盖（教程 3.2 前瞻）
**不是每个工程都有多个工作空间**：一个工程通常 1 个主工作空间，工程之间才各自独立。但系统可同时存在多个工作空间并叠加（overlay）：
```
/opt/ros/jazzy              ← underlay 1：ROS2 本体（必须）
~/ros2_ws/                  ← 主工作空间（overlay）
~/other_project_ws/         ← 其他工程工作空间（可再叠加）
```
**担忧确认**：`.zshrc` 写死 ws00_helloworld 后，换工作空间要改文件？——正确解法是临时 source，不用改 `.zshrc`：
```zsh
source ~/other_project_ws/install/setup.zsh   # 临时叠加，当前终端有效
```
**关键机制：overlay = 追加路径，不是替换**。以 `AMENT_PREFIX_PATH`（包发现路径）为例：
```
初始:    /opt/ros/jazzy
source ws00:   /opt/ros/jazzy : /path/ws00/install        ← ws00 包优先
source other:  /opt/ros/jazzy : /path/ws00/install : /path/other/install  ← other 追加在后
```
新 source 的排后面（优先级低）。只有**包名冲突**时先 source 的赢；实战两工作空间包名几乎不冲突，风险小。

**结论**：`.zshrc` 写死常用工作空间是推荐做法；切换别的工程时新终端临时 source 即可，无需改 `.zshrc`。进阶替代（教程不教）：alias/函数或 direnv 按目录自动 source。
```zsh
ros2ws() { source "$1/install/setup.zsh" && echo "→ $1 已激活"; }   # 之后 ros2ws /path/to/ws
```

## 核心概念分层串讲
### 功能包（package）
ROS2 代码最小单元 = 一组可复用代码 + 描述文件（package.xml + CMakeLists.txt）。类比 npm 包 / Maven artifact。可被其他包 `find_package` 引用，也可独立 `ros2 run` 运行。

### DDS（Data Distribution Service）
真正干通信的底层中间件，ROS2 通信建立在它之上。类比：DDS 之于 ROS2 ≈ TCP/IP 协议栈之于 HTTP（gRPC 跑在 TCP 上，ROS2 通信跑在 DDS 上）。

| 特性 | 说明 |
|------|------|
| 话题 Topic | 命名通道，发布者往里发、订阅者从中收 |
| QoS 服务质量 | 可靠性、历史、时效等策略（类似 TCP vs UDP 取舍） |
| 自动发现 | 节点互相发现（类似 mDNS / 服务注册） |
| 跨语言/跨平台 | C++/Python 互通、跨机器分布式 |

### 客户端库（Client Library）
让开发者不用直接面对 DDS 的语言封装层。`rclcpp`（C++）、`rclpy`（Python）统一封装底层，底层都走 rcl（C 客户端库）→ rmw 抽象 → DDS。

### 进程内通信 API（intra-process API）
同进程内多节点的通信优化：正常节点间通信走 DDS（有序列化/网络栈开销）；同进程可**绕过 DDS 直接内存共享/指针传递**，省序列化。
```cpp
// 同进程建多个节点，executor 同时跑
auto node1 = std::make_shared<rclcpp::Node>("pub");
auto node2 = std::make_shared<rclcpp::Node>("sub");
executor.add_node(node1);
executor.add_node(node2);
```
本质类比：同进程直接用函数调用/共享内存，不同进程/机器走 DDS；类似协程框架"同线程直接调用 vs 跨线程走队列"的优化思路。

### 全景图
```
┌──────────────────────────────────────────────────────┐
│ 你的代码（C++）                                       │
│  rclcpp（C++ 客户端库）                              │
│   - Node / Publisher / Subscriber / spin              │
│   - 进程内通信 API（同进程优化）                      │
│        │ 封装调用                                      │
│  rcl（C 客户端库，语言无关）                          │
│        │ rmw 抽象层                                    │
│  DDS（FastDDS/CycloneDDS，真正通信）                  │
│   - Topic 发布/订阅 / QoS / 自动发现 / 跨机器          │
└──────────────────────────────────────────────────────┘
功能包组织成工作空间，工作空间叠加成环境；
代码通过客户端库（rclcpp）访问 DDS，进程内通信 API 是绕过 DDS 的优化通道。
```

## clangd 编译数据库（compile_commands.json）工作流
### 为什么需要
clangd（nvim LSP）靠 compile_commands.json 获取每个源文件的编译命令（include 路径、宏、标准），否则无法识别 ROS2 头文件，无补全/跳转/诊断。它本质是 **CMake 配置时的快照**，只在 `colcon build`（带导出参数）时重新生成。

| 动作 | 是否需要重建 |
|------|-------------|
| 新建 workspace / 功能包 | 是（旧快照无新包） |
| 新增 .cpp 并 add_executable | 是 |
| 改 include / 依赖 | 是 |
| 只改代码内容 | 否（编译命令不变） |

### 生成方式
```zsh
# 在 workspace 内构建，并导出编译数据库
colcon build --cmake-args -DCMAKE_EXPORT_COMPILE_COMMANDS=ON
# 产物位置：ws*/build/<pkg>/compile_commands.json（每个包一份）
```
clangd 从源文件所在目录**向上查找**且只认一份，多工作区分散在各自 build/ 下找不到 → 需**合并到共同祖先**（仓库根）一份。

### 方案 A：ros2build 函数（.zshrc）
把 alias 升级为函数：构建 + 导出 + 自动合并到仓库根。改 `~/.zshrc` 第 558 行附近（ROS 2 Jazzy 区块）：
```zsh
ros2build() {
    colcon build --symlink-install \
        --cmake-args -DPython3_EXECUTABLE=/usr/bin/python3 -DCMAKE_EXPORT_COMPILE_COMMANDS=ON || return 1
    local root
    root="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "⚠ 不在 git 仓库内，跳过 compile_commands 合并"; return; }
    python3 - "$root" <<'PYEOF'
import json, glob, os, sys
root, entries, seen = sys.argv[1], [], set()
for f in glob.glob(os.path.join(root, 'ws*', 'build', '*', 'compile_commands.json')):
    try:
        for e in json.load(open(f)):
            k = (e.get('file'), e.get('command'))
            if k not in seen:
                seen.add(k); entries.append(e)
    except Exception as ex:
        print(f"⚠ 跳过 {f}: {ex}")
out = os.path.join(root, 'compile_commands.json')
json.dump(entries, open(out, 'w'), indent=2)
print(f"→ 已合并 {len(entries)} 条编译条目 → {out}")
PYEOF
}
```
用法不变：`cd ws01_plumbing && ros2build`，构建后自动合并。仓库外执行则安全降级（提示跳过合并，构建仍成功）。

### zsh 坑：alias 与函数同名冲突
- **症状**：`source ~/.zshrc` 报 `defining function based on alias 'ros2build'` + `parse error near '()'`
- **根因**：当前 shell 会话内存里残留旧 alias（之前 source 旧版 .zshrc 留下），zsh 遇同名函数定义解析失败。alias 展开发生在解析期，与函数定义冲突。
- **解法**：当前终端先 `unalias ros2build` 再 `source ~/.zshrc`；或直接开新终端（无残留）。验证：`which ros2build` 显示 `function`。
- **新终端无此问题**：zsh 启动读全新 .zshrc，直接定义函数。

### 验证命令
```zsh
python3 -c "import json; db=json.load(open('compile_commands.json')); print(len(db), '条'); [print(e['file']) for e in db]"
```
应看到各 ws 的 .cpp 条目，且 command 含 `-isystem /opt/ros/jazzy/include/...`。

### 注意
- ws01 的 `cpp01_topic` 在没有 add_executable + 真实源码前，`ros2build` 合并 0 条新条目是**正常的**（无编译目标），等教程 2.2.5 加上后自动出现。
- 全局 clangd 配置 `~/.config/clangd/config.yaml` 有重复 `CompileFlags:` 键（YAML 后者被忽略），若发现编译标志不生效查这里。

## 话题通信交互模型与 QoS（2.1 知识点）
### 发布/订阅消息交互
发布方（Publisher）与订阅方（Subscriber）**互不认识、互不引用**，唯一纽带是**话题名**。发布方只管往话题发，不知道有没有人收；订阅方只管收，不知道谁发的。这种解耦叫 **pub/sub 匿名通信**。
底层：发布方节点 = DDS 的 **DataWriter**，订阅方 = DDS 的 **DataReader**，通过 DDS **发现协议**自动匹配（无需配置 IP/端口）。**推模型（push）**：publish 后 DDS 推给已匹配订阅方；但订阅方何时处理由 **executor/spin** 决定（回调不自己跑，必须 spin 驱动）。消息格式用接口文件定义（msg/srv/action），语言无关 IDL，构建时生成各语言类。

### ROS2 话题 vs RocketMQ/Redis 对比
| 维度 | ROS2 话题 | RocketMQ | Redis Pub/Sub |
|------|----------|----------|---------------|
| 模型 | pub/sub | pub/sub | pub/sub |
| 是否有 Broker | ❌ 无中心（节点直连，DDS 自动发现） | ✅ Broker 集群 | ✅ Redis 服务器 |
| 消息持久化 | ❌ 无（实时流，丢了就没了） | ✅ 持久化到磁盘 | ❌ 无（实时推送） |
| 订阅者离线 | 收不到（无积压） | ✅ 可积压/回溯 | 收不到 |
| 可靠性策略 | QoS 控制（可靠/尽力而为） | 至少一次/事务 | 无 |
| 典型场景 | 机器人传感器/控制 | 削峰填谷/业务解耦 | 缓存旁路/实时通知 |
**核心差异**：RocketMQ/Redis = 中心化 Broker（可存储/回溯/积压）；ROS2 = 去中心化 DDS（实时流，无持久化，订阅者不在就错过）。机器人要最新状态不要旧数据。

### QoS 调控消息收发
QoS（Quality of Service）调控收发行为，代码里 `rclcpp::QoS(n)`：
```cpp
rclcpp::QoS qos(10);                                    // history depth = 10
qos.reliability(RMW_QOS_POLICY_RELIABILITY_RELIABLE);   // 可靠传输（类似 TCP）
qos.durability(RMW_QOS_POLICY_DURABILITY_TRANSIENT_LOCAL); // 缓存历史给后加入订阅者
```

| QoS 维度 | 可选值 | 含义 |
|---------|--------|------|
| Reliability | RELIABLE / BEST_EFFORT | 可靠传输（重传，TCP）vs 尽力而为（丢弃，UDP） |
| Durability | TRANSIENT_LOCAL / VOLATILE | 缓存历史让后加入订阅者能收到 |
| History | KEEP_LAST(n) / KEEP_ALL | 缓存最近 n 条 / 全部 |
| Deadline | 时间 | 期限内必须通信，超时告警 |
| Depth | 数量 | 队列深度（积压上限） |
发布方和订阅方 QoS 必须**兼容**才能通信。

## 节点概念与两种创建方式（2.1 知识点）
**节点（Node）= ROS2 程序基本执行单元**，一个节点对应单一功能模块（雷达驱动节点发雷达消息、摄像头驱动节点发图像）。完整机器人系统由许多协同工作节点组成，单个可执行文件可含一个或多个节点。**节点 = 通信的"身份单位"**，没有节点无法创建 publisher/subscriber/service——节点是 ROS2 图的顶点，话题/服务是边。

**为什么要 init + 建节点**：
1. `rclcpp::init(argc, argv)`：初始化客户端库全局上下文——解析命令行参数（含 `--ros-args` 重映射）、初始化 rcl/rmw/DDS 通信栈
2. `Node::make_shared("name")`：创建节点 = 向 DDS 发现机制注册自己、拥有自己的 logger（RCLCPP_INFO 前缀来源）、参数/时钟/回调组资源
3. 节点名全局唯一，`ros2 node list` 看到的就是它

**两种创建方式**：

| 方式 | 适用场景 |
|------|---------|
| A: `Node::make_shared` | 临时/简单节点，逻辑少 |
| B: 继承 `rclcpp::Node` | 有状态/回调/多个发布订阅，封装成类（构造时注册一切，RAII/封装），**主流**（教程 2.2+ 都用） |
```cpp
// B: 继承方式（主流）
class MyNode : public rclcpp::Node {
public:
    MyNode() : Node("my_node") {
        publisher_ = this->create_publisher<...>("topic", 10);
    }
private:
    rclcpp::Publisher<...>::SharedPtr publisher_;
};
```
教程 hello world 用 A 是因为单次打印无状态无回调；2.2 带回调的节点必须用 B。

## 2.2.4 接口文件（msg）实战
**自定义接口包建在新工作区 ws01_plumbing**（`base_interfaces_demo`），与 ws00_helloworld 分离。msg 文件定义话题消息结构：
```msg
# Student.msg
string name
int32 age
float64 height
```
构建成功后生成多种产物：`Student.idl / .json / .msg`，各语言绑定库（`libbase_interfaces_demo__rosidl_generator_*.so`）等。接口在 `install/base_interfaces_demo/share/base_interfaces_demo/msg/`。

**排查教训：`ros2 interface show base_interfaces_demo/msg/Student` 无输出/Unknown package 的根因**
- 构建本身成功（idl/json 都在）
- 真实原因是**终端环境没 source ws01_plumbing**，ros2 通过 `AMENT_PREFIX_PATH` 找不到该自定义包
- 验证：`echo $AMENT_PREFIX_PATH | tr ':' '\n'` 看是否含 ws01；`ros2 interface list | grep base_interfaces_demo`
- 修复：`source /home/azzato/CodeFiles/learning/ros2Learn/ws01_plumbing/install/setup.zsh`
- **多工作空间 overlay 实战**：`.zshrc` 只常驻 `/opt/ros/jazzy`（本体），**不常驻任何工作空间**（教学项目，避免写死）。用 ws01 干活前手动 source：`source /home/azzato/CodeFiles/learning/ros2Learn/ws01_plumbing/install/setup.zsh`。可临时 alias（不写入文件）：`alias rws1='source .../install/setup.zsh'`。ws00/ws01 包名不冲突可共存，`ros2` 能同时看到已 source 工作区的所有包。

## rclcpp 回调：std::bind vs lambda（易错点）
`create_subscription` 是模板函数，需从回调推断消息类型，靠 `rclcpp::function_traits` 检查回调的 `operator()` 签名。

**为什么泛型 lambda 报错**：报错 `'decltype' cannot resolve address of overloaded function`。`auto&& PH1` 是模板参数非具体类型；`function_traits` 对泛型 lambda 做 `decltype(&Callback::operator())` 时，`operator()` 是模板，取地址无法确定实例（模板被视为重载集合）。

| 回调写法 | `operator()` | function_traits 能推断？ |
|---------|-------------|------------------------|
| `std::bind(&Class::cb, this, _1)` | 具体签名（bind 结果对象，rclcpp 走特化路径） | ✅ |
| 非泛型 lambda `[this](const Msg &msg){...}` | 普通函数 | ✅ |
| 泛型 lambda `[this](auto &&msg){...}` | 模板 | ❌ 报错 |

**结论**：
- 不是"lambda 代替 bind 就错"，而是**泛型 lambda（auto 参数）**才错
- rclcpp 官方例程大量用非泛型 lambda（具体类型参数），完全没问题
- 教程用 std::bind 是老写法（绑定成员函数指针）；现代 C++ 推荐 lambda，但**必须写具体类型参数**
- 教程代码的 `10`（QoS 队列深度）和 `std::bind` 会触发 clang-tidy 风格建议（magic-number / avoid-bind），**保持教程一致即可，不用改**；之前源码损坏疑似与自动应用 clang-tidy 的"lambda 化"建议有关

**顺带教训**：demo01 报 `timer_callback 未声明` 的真实原因是初始化列表被改坏（`count_(0)` 丢失导致 `,  {` 语法错误），编译器解析类结构失败连带成员"看起来未声明"，与 lambda/bind 无关。

## 话题通信底层机制：连接如何建立 / 消息介质
### 无手动连接配置，靠 DDS 自动发现
代码里没有 IP/端口/bind/connect，因为连接由 DDS **Discovery（发现协议）**自动完成：
```
发布方 create_publisher("chatter") → 注册 DataWriter → SPDP 广播自己存在
订阅方 create_subscription("chatter") → 注册 DataReader → SPDP 广播自己存在
   ↓ 互相发现
匹配阶段：topic 名 + 类型 + QoS 都一致 → 建立逻辑通道（endpoint 配对）
   ↓
publish(msg) → DataWriter → DDS 传输 → DataReader → 唤醒 spin → topic_callback
```
**唯一要做的 = 把 topic_name 写一致**，它就是"匹配的钥匙"。ROS2 用话题名代替 IP:端口作为寻址，用自动发现代替手动连接，用 pub/sub 代替点对点 socket。

### 消息传递介质（取决于位置）
| 场景 | 介质 |
|------|------|
| 同进程内两节点（intra-process） | 直接指针/共享内存，零拷贝 |
| 同机不同进程 | 共享内存（FastDDS Shared Memory Transport）或 loopback 网络 |
| 跨机器 | 网络（DDS 默认 UDP 组播/单播 + QoS 可靠/尽力而为） |
**没有全局共享的"消息总线"实体**——DDS 去中心化，节点是 peer，靠发现建立的逻辑通道流动，介质由 DDS 自动选。

## 服务通信（2.3）原理
### 服务端能否自主选择把 response 发给哪个客户端？
**不能。response 只能发给发出 request 的那个客户端，协议强制**。服务通信底层仍是 DDS，但用 Request/Reply 模式：每个请求带**唯一 request ID（guid/序列号）**，服务端填好 res 后 DDS 按 request ID 自动路由回对应客户端。服务端代码无需指定发给谁：
```cpp
void add(const AddInts::Request::SharedPtr req, const AddInts::Response::SharedPtr res) {
    res->sum = req->num1 + req->num2;  // 自动关联回发来 req 的那个客户端
}
```
多个客户端并发请求 → 服务端收多次回调（取决 executor），每次 res 自动回到对应客户端。类比 HTTP 服务器靠 socket 区分连接，ROS2 服务靠 request ID 区分。

### 服务 vs 话题对比
| 维度 | 话题通信 | 服务通信 |
|------|---------|---------|
| 模式 | 单向流 pub/sub | 双向请求-响应 |
| 关联 | topic 名（Writer/Reader 配对） | service 名（req/res 通道） |
| 连接确认 | 无（发了不管有没有人收） | 有 `wait_for_service()` |
| 响应路由 | N/A | request ID 自动回对应客户端 |
| 场景 | 持续数据流（传感器） | 偶发、要结果、有逻辑处理 |
| 底层 | DataWriter/DataReader | requester/replier 模式 |
服务端 spin：收请求→分发回调→回调填 res→自动发回；客户端 `spin_until_future_complete`：发请求后挂起等待匹配 response。

## rclcpp::spin 到底在做什么
本质：**永不返回的事件循环 + 回调分发器（reactor）**，三步：
```
while (rclcpp::ok()) {
    wait_for_events();   // 阻塞等待（类似 epoll_wait，无事件睡，不占 CPU）
    take_ready(ready);   // 事件来了取出
    exec.callback();     // 调用用户回调（topic_callback/timer_callback/add...）
}
```
**spin 自己不产生数据，只监听事件源并路由到回调**。等价物：Qt `QApplication::exec()`+信号槽、协程框架 epoll 事件循环、gRPC CompletionQueue。
```
┌─ 发布方节点 ──────────────┐        ┌─ 订阅方节点 ──────────────┐
│ Node                       │        │ Node                       │
│  create_publisher("chatter")│        │  create_subscription("chatter")│
│  timer_callback()          │        │  topic_callback(msg)       │
│    publish(msg)            │        │                            │
└──────────┬─────────────────┘        └───────────┬────────────────┘
           │                                     │
           ▼  DataWriter                         ▲  DataReader
           └─────── DDS 发现 + 匹配 ─────────────┘
                    (靠 topic 名+类型+QoS)
           publish ──→ [共享内存/网络] ──→ 唤醒订阅方 spin → topic_callback

┌─ 客户端节点 ───────────────┐        ┌─ 服务端节点 ──────────────┐
│ Node                       │        │ Node                       │
│  create_client("add_ints") │        │  create_service("add_ints")│
│  async_send_request(req)───┼─req───→│  spin 收到 → add(req,res)  │
│  spin_until_future_complete│←─res───┤  res 自动关联 request_id   │
└────────────────────────────┘        └────────────────────────────┘
```
### 为什么 spin 作用于 node
node 是回调的容器+上下文：spin 从 node 拿"监听哪些事件源"（publisher/subscriber/timer/service），事件来了调 node 的成员回调。spin(node) = 持续处理该 node 所有事件。
spin需要知道：
- 监听哪些事件源？→ 从 node 里拿：node 有哪些 publisher/subscriber/timer/service，spin 就监听这些
- 事件来了调谁的回调？→ 回调是 node 的成员函数（topic_callback 等），需要 node 对象
**executor 是 spin 的泛化**：spin(node) 等价于单线程 executor 跑单节点；一个 executor 可管多节点：
```cpp
rclcpp::executors::MultiThreadedExecutor exec;
exec.add_node(node1);
exec.add_node(node2);
exec.spin();   // 多线程并行处理多节点事件
```

### node = 可执行功能的逻辑单元？
**对但不完整**：node = 通信参与者 + 回调容器（持有 publisher/subscriber/timer/service 事件源 + 回调）。**node 本身不主动执行**，真正驱动是 spin/executor；没有 spin，回调永不触发。类比：node ≈ QObject（持有信号槽），spin ≈ QApplication::exec()（事件循环驱动）。

使用接口前先验证：`ros2 interface show base_interfaces_demo/action/Progress` 输出三段正确。
**经验**：构建报错先看 `log/latest_build/<pkg>/stderr.log`，找到真实错误再动手，不要盲目重装/清理。

## 动作通信（2.4）原理
### 三阶段模型与底层封装
动作通信 = 目标(Goal) + 反馈(Feedback) + 结果(Result)，底层是**服务 + 话题的复合**（教程原话：目标发送/结果获取 = 服务通信封装，连续反馈 = 话题通信封装）：
```
.action 三段式: int64 num(Goal) --- int64 sum(Result) --- float64 progress(Feedback)
```
任务生命周期：客户端 send_goal → 服务端 handle_goal 决定接受/拒绝 → ACCEPT 后 handle_accepted 起线程 execute() → execute 循环里 publish_feedback() 连续反馈 → 完成 succeed(result)/取消 canceled(result)。
底层通道：Goal 发送=服务；Feedback=话题（服务端发客户端订阅）；Result=服务；Cancel=另一条服务通道。

### create_server 三个回调的返回值被谁读取
**三个回调都由 rclcpp_action 框架在合适时机调用，返回值是给框架用的**（框架据此决定协议行为），不是给你的代码：

| 回调 | 返回值 | 被谁读 | 含义 |
|------|--------|--------|------|
| handle_goal | GoalResponse | 框架 | REJECT=拒绝 / ACCEPT_AND_EXECUTE=接受并执行（→触发 handle_accepted）/ ACCEPT_DEFER |
| handle_cancel | CancelResponse | 框架 | ACCEPT=同意取消 / REJECT=拒绝取消 |
| handle_accepted | void | 无（框架只通知） | 启动 execute 异步执行 |
框架收到 REJECT → 自动回客户端"拒绝"（客户端 goal_response_callback 收空指针）；收到 ACCEPT → 回"接受"并调 handle_accepted。

### 为什么 handle_accepted 要开新线程执行 execute
execute() 是耗时循环，若在 spin 线程跑会**阻塞 spin**（无法响应取消/新任务→假死）。教程用 `std::thread{std::bind(&execute,this,_1),goal_handle}.detach()` 把 execute 丢独立线程，spin 线程保持自由。**这是动作 vs 服务的本质区别**：服务 add() 回调在 spin 线程同步跑完（快）；动作 execute 必须异步（慢）。取消的真正执行：handle_cancel 返回 ACCEPT 只是框架同意，execute 循环里要主动查 `goal_handle->is_canceling()`，为 true 才调 `goal_handle->canceled(result)` 完成取消。

### 客户端三个回调（都在 spin 线程，因为都很短）
- goal_response_callback：收"接受/拒绝"（空指针=被拒）
- feedback_callback：收进度 `feedback->progress*100` 打印
- result_callback：收最终结果，`switch(result.code)` 处理 SUCCEEDED/ABORTED/CANCELED
客户端 `async_send_goal` 返回的 future 不代表任务完成，只是 goal 已发出；acceptance 和 result 是两个独立回调，中间隔着 feedback 流。
**服务端 execute 在独立线程，客户端回调在 spin 线程**——因为服务端 execute 耗时不能阻塞，客户端回调都短。用 `rclcpp::Rate loop_rate(10.0)` 控制频率（0.1s 一次）。

## 参数服务
类似一种 kv 存储服务，需要注意服务端设置了 `rclcpp::NodeOptions().allow_undeclared_parameters(true)` 才能在客户端通过 `paramClient->set_parameters({rclcpp::Parameter(k,v), ...})` 设置不存在的键值对

# ROS2 通信机制补充
## 分布式
ROS2 本身是一个分布式通信框架，可以很方便的实现不同设备之间的通信，ROS2 所基于的中间件是 DDS，当处于同一网络中时，通过 DDS 的域 ID 机制(ROS_DOMAIN_ID)可以实现分布式通信
大致流程是：在启动节点之前，可以设置域 ID 的值，不同节点如果域 ID 相同，那么可以自由发现并通信，反之，如果域 ID 值不同，则不能实现。默认情况下，所有节点启动时所使用的域 ID 为 0，换言之，**只要保证在同一网络，你不需要做任何配置，不同 ROS2 设备上的不同节点即可实现分布式通信**。

## DDS 域 ID 值的计算规则

域 ID 值的相关计算规则如下：

1. DDS 是基于 TCP/IP 或 UDP/IP 网络通信协议的，网络通信时需要指定端口号，端口号由 2 个字节的无符号整数表示，**其取值范围在[0,65535]之间**；
2. 端口号的分配也是有其规则的，并非可以任意使用的，根据 DDS 协议规定以 7400 作为起始端口，也即可用端口为[7400,65535]，又已知按照 DDS 协议默认情况下，**每个域 ID 占用 250 个端口，那么域 ID 的个数为：(65535-7400)/250 = 232(个)，对应的其取值范围为[0,231]**；
3. 操作系统还会设置一些预留端口，在 DDS 中使用端口时，还需要避开这些预留端口，以免使用中产生冲突，不同的操作系统预留端口又有所差异，其最终结果是，在 Linux 下，可用的域 ID 为[0,101]与[215-231]，在 Windows 和 Mac 中可用的域 ID 为[0,166]，综上，**为了兼容多平台，建议域 ID 在[0,101] 范围内取值**。
4. 每个域 ID 默认占用 250 个端口，且每个 ROS2 节点需要占用两个端口，另外，按照 DDS 协议每个域 ID 的端口段内，第 1、2 个端口是 Discovery Multicast 端口与 User Multicast 端口，从第 11、12 个端口开始是域内第一个节点的 Discovery Unicast 端口与 User Unicast，后续节点所占用端口依次顺延，那么**一个域 ID 中的最大节点个数为：(250-10)/2 = 120(个**)；
5. 特殊情况：**域 ID 值为 101 时，其后半段端口属于操作系统的预留端口，其节点最大个数为 54 个**。

## 3.2 工作空间覆盖
所谓工作空间覆盖，是指不同工作空间存在重名功能包时，重名功能包的调用会产生覆盖的情况。
## 3.3 元功能包
将不同的功能包打包成一个功能包，方便一次性安装
## 3.4 节点重名
避免重名问题，一般有两种策略：
1. **名称重映射**，也即为节点起别名；
2. **命名空间**，是为节点名称添加前缀，可以有多级，格式：/xxx/yyy/zzz。
两种策略的实现途径主要有如下三种：
- ros2 run 命令实现；
- launch 文件实现；
- 编码实现。
## 3.5 话题重名
有些场景下需要避免话题重名的情况，但有些场景下又需要将不同的不同的话题名称修改为相同。
解决方法和 [[#3.4 节点重名]]类似
当为节点添加命名空间时，节点下的所有非全局话题都会前缀命名空间，而重映射的方式只是修改指定话题

### node_name 填什么
填**裸名（默认名）**，不含命名空间前缀。完整名是"命名空间前缀 + 重映射结果 + 裸名"合成：
```
代码: Node("yyy", "xxx")              ← 裸名 yyy + 命名空间 xxx
无重映射 → ROS2 图完整名 /xxx/yyy    ← ros2 node list 显示这个
有重映射 --ros-args -r __node:=zzz → /xxx/zzz  (重映射覆盖裸名 yyy)
```
- node_name = 输入（裸名）；ros2 node list 显示的是输出（完整名）
- 重映射是运行时覆盖裸名，来源优先级：命令行 `--ros-args -r __node:=` > launch `<remap>` > 代码 node_name
- 不同命名空间用第二构造函数 `Node(name, namespace)` 最清晰（也可 `Node("xxx/yyy")` 但不推荐）

### topic 名称填什么：三类话题
| 类型 | 写法 | 最终话题名（命名空间 xxx、节点 yyy） |
|------|------|------|
| 全局 | `/topic/chatter`（`/` 开头） | `/topic/chatter`（与命名空间/节点名无关） |
| 相对 | `topic/chatter`（非 `/` 开头） | `/xxx/topic/chatter`（加命名空间前缀） |
| 私有 | `~/topic/chatter`（`~/` 开头） | `/xxx/yyy/topic/chatter`（加命名空间+节点名） |
**填相对名不是完整名**：`ros2 topic list` 显示的是合成后完整名（输出），代码里填的是相对名（输入）。规则同样适用于 ros2 run 和 launch 文件。

### ros2 node list 为什么空
`ros2 node list`/`ros2 topic list` 都是**实时快照**，只列"当前活着"的节点/话题（DDS 发现协议实时探测）。无节点运行 → 空，正常。ros2-daemon 是 CLI 后台守护进程，不是节点。1.3 的 hello world 打印完就 shutdown 退出，所以 list 看不到；2.2 起用 `rclcpp::spin` 保持节点持续运行，才能被 list 看到、接收消息。

## 时间 API：Rate / Timer / Time / Duration / Clock（3.6）
### Rate 本质：节流器，不是定时器
`Rate` 不触发任何事，只让**循环以固定频率运行**。两个构造重载参数含义不同：

| 构造 | 参数类型 | 含义 |
|------|---------|------|
| `Rate(1.0)` | double | **频率 Hz**（每秒循环次数），如 `Rate(10.0)`=0.1s 一次 |
| `Rate(1000ms)` | duration | **周期时长**（每次间隔），如 `Rate(100ms)` |
两者恰都是 1s 所以难察觉，但语义完全不同。action 代码里 `rclcpp::Rate loop_rate(10.0)` = 频率 10Hz。

### 为什么 while 用 rclcpp::ok() 而非 rate.ok()
`Rate` 没有 `ok()`，它是节拍器不决定循环生死。`rclcpp::ok()` = 全局"ROS2 系统存活"标志：正常 true；收到 SIGINT(Ctrl+C) 或调 `shutdown()` 变 false。循环退出条件应是"系统活着"，不是"定时器还在"。类比协程框架 `while(running_){do_work();sleep(interval);}`。

### Rate vs Timer 对比
| 机制 | 本质 | 适合 |
|------|------|------|
| `Rate` + while | 循环 + 节流（主动轮询，阻塞） | 简单循环固定频率做一件事 |
| `create_wall_timer` | 定时器 + 回调（事件驱动） | 多频率并行任务、非阻塞 |
多个 Rate 各自独立（各记各的起始时间+周期），但一个 while 只能跑一个 Rate。多频率任务用 wall_timer 或独立线程各带 Rate。action 的 execute 用 Rate 在独立线程，正因 Rate 阻塞不能占 spin 线程。

### Time / Duration / Clock
| 类 | 含义 | 类比 chrono |
|----|------|------------|
| `rclcpp::Time` | 时间点（时刻） | `time_point` |
| `rclcpp::Duration` | 时长（两时刻差） | `duration` |
| `rclcpp::Clock` | 时钟源 | `steady_clock` |
```cpp
rclcpp::Time t1(10500000000L);   // 10.5s（纳秒）
rclcpp::Time t2(2,1000000000L);  // 2s + 1e9 ns = 3s
rclcpp::Time now = node->now();  // 当前时刻
t1.seconds(); t1.nanoseconds();  // 读取
rclcpp::Duration d = t2 - t1;    // Time-Time=Duration
```
**时间通过 node 获取**（`node->now()`）而非系统时钟，因为 ROS2 支持仿真时间 use_sim_time——仿真时时间由仿真器驱动，node->now() 尊重仿真时间，std::chrono 不会。

## 用 rqt 控制乌龟
乌龟订阅 `/turtle1/cmd_vel`（`geometry_msgs/msg/Twist`）接收速度。三种控制方式本质都是往该话题发 Twist：
- **rqt_publisher**：`rqt --standalone rqt_publisher`，选 topic `/turtle1/cmd_vel` + type Twist，填 `linear.x`(前进)、`angular.z`(转向)，设 frequency，点 + 持续发布
- **rqt 多插件**：`rqt` → Plugins → Node Graph(计算图) / Message Publisher(发布) / Plot(绘图)
- **teleop 键盘**：`ros2 run teleop_twist_keyboard teleop_twist_keyboard`，按 i/k/j/l 控制
rqt_publisher 和 teleop 本质一样（发 Twist），区别是鼠标填值 vs 键盘。`/turtle1/cmd_vel` 是全局话题（`/` 开头不受命名空间影响），`turtle1` 是 turtlesim 节点命名空间前缀。完整链路 = 前面话题通信的实例：控制节点 publish Twist → DDS 匹配 → turtlesim 订阅回调更新位置。

## turtlesim 接口全景与 rqt 交互本质
### turtlesim 的话题从哪来
运行 `ros2 run turtlesim turtlesim_node` 后 topic list 出现的名字都是 **turtlesim 源码写死的**（非用户设置）：
- `/turtle1/cmd_vel`（订阅 Twist，速度输入）、`/turtle1/pose`（发布乌龟位置）、`/turtle1/color_sensor`（模拟颜色传感器）
- `/parameter_events` + `/rosout` 是**每个 ROS2 节点自动创建**的系统话题：parameter_events 参数变更通知；rosout 日志汇总
话题分两类：节点自己创建的 + ROS2 系统自动创建的。

### Twist 消息语义（geometry_msgs/msg/Twist）
`Vector3 linear`（线速度）+ `Vector3 angular`（角速度），各 x/y/z 三维。乌龟是 2D：
- `linear.x`：前进/后退速度 m/s（正=前）；`angular.z`：转向角速度 rad/s（正=逆时针/左转）
- 其余 4 个（linear.y/z、angular.x/y）3D 参数乌龟不用，填 0
`linear.x=5, angular.z=1` = 5m/s 前进 + 1rad/s 左转 → 画偏左圆弧。

### rqt_publisher 四要素
| 字段 | 含义 |
|------|------|
| topic | 发布到哪个话题 |
| type | 该话题的消息类型（接口，发布订阅双方一致） |
| rate | 发布频率 Hz（每秒几条） |
| expression | 动态表达式（Python，如 sin(t) 随时间变化；留空=固定值） |
默认选中 `/parameter_events` 只是 GUI 初始状态，不是必须连接；控制乌龟要改选 `/turtle1/cmd_vel`。topic 才有 rate/expression（持续流）；service 没有（一次性请求）。

### Service vs Topic（rqt Service Caller 插件）
`/spawn` 是**服务不是话题**：一问一答（请求→响应），topic 是单向持续流。rqt 点 call = 充当客户端发请求，turtlesim 的 handle_spawn 收到后创建新乌龟并返回 name。
`.srv` 文件 `---` 分隔请求/响应两组字段。Spawn：x/y/theta/name（请求）→ name（响应）。**theta = 乌龟朝向角度（弧度，0=朝右，π/2=朝上）**。Type=`turtlesim/srv/Spawn` 是服务接口类型固定不可变（像函数签名）；无 rate/expression 因为服务只是一次性请求，而 x/y/theta/name 是请求内容可填值。

### 节点 = 接口集合（高维理解）
turtlesim_node 暴露三类控制面，全部在源码里定义好：
- Topics：cmd_vel 控运动（持续流）、pose 输出状态
- Services：spawn/kill/set_pen/teleport 控数量位置画笔（一次性请求）
- Parameters：背景颜色（2.5 参数服务）
rqt/ros2 命令只是**调用这些已定义接口的客户端**——rqt 不知道 turtlesim 内部实现，只需知道接口（名字+类型+数据）。任何节点都能被任何工具控制，一切交互标准化。
**rqt 本身也是一个 ROS2 节点**（node list 里的 `/rqt_gui_py_node_xxx`，数字自动防重名），订阅/发布/调服务的一等公民。
`rqt --standalone <plugin>` 与 rqt 主界面 Plugins 菜单加载**完全等价**，只是跳过空界面直接开插件窗口。