---
github: https://github.com/IndeemaSoftware/QSimpleScada.git
created: 2026-10-01
---
# QSimpleScada
## 学习目标
沿着源码追踪设备、看板和控件的关系，理解动态值如何到达 QML 控件、编辑操作如何更新对象状态，以及项目 XML 如何保存和恢复。结合 C++/Qt 学习重点，着重观察信号槽、父子对象、裸指针及生命周期。
## 项目定位
README 将项目描述为面向 IoT 数据可视化的 Qt/C++ 看板库。当前源码提供设备信息、board 管理、控件编辑、QML 装载和 XML 项目文件处理。
源码检索没有发现 Modbus、MQTT、TCP/UDP socket 或应用 `main()`。`QScadaDeviceInfo` 使用 `QHostAddress` 记录设备身份，但当前仓库没有对应的连接/采集实现；外部数据由谁采集、如何调用控制器仍需结合上层应用确认。
README 的 qmake 安装说明仍引用 `.pro`/`.pri`；当前仓库的构建入口是 CMake，阅读构建配置时以 `CMakePresets.json` 和 `CMakeLists.txt` 为准。
## 文件阅读顺序
1. `README.md`：获取作者给出的产品意图和 API 示例，把描述当作线索。
2. `CMakePresets.json` → `CMakeLists.txt`：了解 Debug preset、Qt 依赖、C++ 标准和 AUTOMOC/AUTOUIC/AUTORCC。
3. `QScadaBoard/qscadaboardcontroller.h` → `.cpp`：公开入口；重点读构造、`appendDevice`、`initBoardForDeviceIp`、`updateValue`、`openProject`、`saveProject`。
4. `QScadaBoard/qscadaboardmanager.h` → `.cpp`：设备 IP 到 board ID 的查找、创建和注册。
5. `QScadaDevice/qscadadeviceinfo.h/.cpp`、`QScadaBoard/qscadaboardinfo.h`：设备身份、board ID 和对象描述。
6. `QScadaBoard/qscadaboard.h` → `.cpp`：对象创建、值转发、选择、网格绘制和层级处理。
7. `QScadaObject/qscadaobjectinfo.h/.cpp` → `QScadaObject/qscadaobject.h/.cpp`：持久状态、geometry、鼠标交互和信号。
8. `QScadaObject/qscadaobjectqml.h/.cpp`、`qscadaconfig.h`、`com_indeema_QSimpleScada.qrc`：QML 装载、属性元数据和资源路径。
9. `QScadaEntity/qscadabaseprefentity.h/.cpp` → `QScadaEntity/qscadaconnecteddeviceinfo.h/.cpp`：XML 解析、序列化和恢复。
10. `QScadaObject/qscadaobjectinfodialog.h/.cpp`、`.ui`：对象属性编辑。`qaxiswidget.ui` 当前只被构建清单引用，源码搜索没有找到使用它的 C++ 类，可暂时跳过。
## 模块关系

| 模块 | 主要职责 | 入口文件 |
|---|---|---|
| 控制器 | 应用侧 QWidget API，协调设备、看板、编辑对话框和项目文件 | `QScadaBoard/qscadaboardcontroller.*` |
| 管理器 | 保存设备和 board 索引，按 IP/ID 查找 board | `QScadaBoard/qscadaboardmanager.*` |
| 看板 | 管理对象列表、绘制编辑网格、转发对象操作和值 | `QScadaBoard/qscadaboard.*` |
| 对象模型与视图 | 保存对象 ID、geometry、层级和 QML 属性；处理鼠标编辑 | `QScadaObject/qscadaobjectinfo.*`、`qscadaobject.*` |
| QML 适配器 | 用 `QQuickWidget` 承载 QML，并将属性/实时值传给根对象 | `QScadaObject/qscadaobjectqml.*` |
| 项目持久化 | 解析/生成设备、board、object 的 XML 数据 | `QScadaEntity/qscadaconnecteddeviceinfo.*` |

## 动态值调用链
外部调用方传入设备 IP、board ID、object ID 和 `QVariant`：
```text
QScadaBoardController::updateValue
  -> QScadaBoardManager::getBoard(deviceIp, boardId)
  -> QScadaBoard::updateValue(objectId, value)
  -> QScadaObject::updateValue(value)   // 虚接口
  -> QScadaObjectQML::updateValue(value)
  -> QMetaObject::invokeMethod(rootItem, "update", ..., value)
```
manager 先用 IP 找设备，再确认该设备的 board ID 列表包含目标 ID，最后从 `_boards` 取出看板；board 遍历对象并按 object ID 匹配。当前创建路径 `QScadaBoard::initNewObject` 构造的是 `QScadaObjectQML`。QML 根对象需要提供 `update` 方法接收传入值。
## 项目保存与恢复
- 保存：`QScadaBoardController::saveProject` 调用 `QConnectedDeviceInfo::XMLFromDeviceInfo`，遍历设备、board 和 object，将身份、ID、geometry、层级、QML 路径和 QML 属性写为 XML。
- 恢复：`openProject` 读取文件 → `QConnectedDeviceInfo::initFromXml` 生成设备/board/object 描述 → 控制器注册设备并逐个初始化 board → `QScadaBoard` 根据描述创建 QML 对象。
- 已定位的序列化路径保存配置，不保存运行时传入的实时 `QVariant` 值。
## 所有权观察
- 源码事实：manager 的 `_devices`、`_boards` 和 board 的 `_objects` 都保存裸指针；`QScadaBoard` 析构时通过 `qDeleteAll` 删除对象；`QScadaBoardManager::resetAll` 显式删除其设备和 board。
- 待验证：manager 没有自定义析构函数，控制器析构时直接删除 manager；多 board 场景下所有 board、device 的最终释放链还需结合控制器关闭、`resetAll` 和 QWidget 父子关系继续核对。
- 待验证：`QScadaObjectInfo` 声明了 widget 与 QML 两种类型，但 `QScadaBoard::initNewObject` 当前总是创建 `QScadaObjectQML`；XML 序列化也将对象转成 `QScadaObjectQML` 访问属性。
## 构建与验证
- 2026-10-01，Debug 配置和构建命令 `cmake --preset debug && cmake --build --preset debug --parallel` 成功，生成共享库 `build/debug/libQSimpleScada.so.0.9.0`。
- 首次完整编译有 Qt 6.11 对 `QMouseEvent::x()`/`y()` 的弃用警告，位置在 `QScadaObject/qscadaobject.cpp`；构建成功。
- 仓库未发现测试文件。构建结果只验证编译链接，未验证界面运行、真实 QML widget、XML 往返或设备通信。
- `learn_this_repo` shell 命令未安装；当前分支已是 `learn`。仓库没有 `.clang-format`，所以没有用默认风格批量重写现有源码。
## 主动回忆与练习
不改代码，依次查看 `QScadaBoardController::updateValue`、manager 的 `getBoard`、board 的 `updateValue` 和 QML 对象的 `updateValue`，用自己的话说明每层的输入与作用。
1. 应用从哪个类进入库？该类将查找工作交给谁？
2. 设备 IP、board ID、object ID 分别在哪一层参与路由？
3. 实时值最后通过什么 Qt 机制到达 QML 的哪个方法？
4. 项目 XML 保存哪些配置？哪些运行时数据没有进入这条序列化路径？
## 学习进度
- 当前阶段：01，项目地图与数据更新链路。
- 状态：进行中；阅读文件和构建成功不代表已经掌握，需通过复述调用链或练习确认。
- 下一阶段：追踪设备、board ID、board 对象之间的索引与创建流程，检查 raw pointer 的所有权和释放路径。
