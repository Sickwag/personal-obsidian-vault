> 项目地址：`zero-one-psi-cpp-sample`
> 技术栈：C++17 + oatpp Web 框架 + MySQL + Redis + MongoDB + FastDFS

## 第1阶段：项目全景 + CMake 构建系统
理解项目的整体结构、各子项目职责、CMake 依赖管理方式，掌握条件编译和 vendored 依赖的权衡。
### 项目架构图
```
CMakeLists.txt (顶层)
option() 控制 9 个特性开关（USE_REDIS, USE_MONGO, USE_ROCKETMQ...）
add_subdirectory() 引入 4 个子项目
       /        |         \
      v         v          v
lib-oatpp   lib-mysql   lib-common
(静态库)    (静态库)    (静态库)
oatpp封装   MySQL封装   工具+客户端
OUTPUT:     OUTPUT:     OUTPUT:
liboatpp-   libmysql    libcommon
http.a      .a          .a
       \        |         /
        v       v        v
        arch-demo (可执行文件)
        link: lib-oatpp + lib-mysql + lib-common
        依赖: oatpp, mysqlcppconn, jsoncpp, yaml-cpp...
```
**架构设计要点**：
- 基础库之间互不依赖，arch-demo 作为上层应用依赖所有基础库，保证编译隔离性
- 每个子项目输出 `STATIC` 库，最终全部链接为单一可执行文件，部署简单
- 编译顺序由 `add_subdirectory` 在顶层 CMakeLists.txt 中的出现顺序决定，基础库必须在前
### cmake 条件编译
核心是通过 option + add_definitions ，option 在构建层面控制是否添加某些宏定义开关，代码层面添加了这些宏开关后就会启用 `#ifdef` 分支
**完整链路**：
```
cmake -DUSE_REDIS=ON
       ↓
option(USE_REDIS "use redis" ON) → CMake 变量
       ↓
add_definitions(-DUSE_REDIS)     → C++ 宏
       ↓
#ifdef USE_REDIS                 → 源码条件编译
    // Redis 相关代码
#endif
       ↓
if(USE_REDIS)                    → CMake 条件链接
    target_link_libraries(app redis++ hiredis)
endif()
```
**三层必须同步**：`option` 定义 → `add_definitions` 宏转换 → `target_link_libraries` 条件链接，缺一层都会导致编译或链接错误。
### 预编译头机制（PCH）
**核心思想**：将体积大、改动少的头文件提前编译为二进制，后续编译直接加载，省去重复解析。
**MSVC 的两步机制**：
```
stdafx.cpp (/Yc 创建)              其他 .cpp (/Yu 使用)
       |                                  |
  #include "stdafx.h"              /FI 强制 include "stdafx.h"
       |                                  |
       v                                  v
   stdafx.pch  ───────── 加载 ──────>  跳过解析，直接使用符号表
```
- `/Yc"stdafx.h"` — 将 `stdafx.cpp` 编译为 `.pch`（不产生普通 `.obj`）
- `/Yu"stdafx.h"` — 使用已有 `.pch`，跳过对 `stdafx.h` 的重新解析
- `/FI"stdafx.h"` — 强制 include（等价于每个文件顶部自动加 `#include "stdafx.h"`）
- `/Fp"path"` — 指定 `.pch` 输出/查找路径
**三种编译器 PCH 对比**：

| | MSVC | GCC | Clang |
|------|------|------|------|
| 创建 PCH | `/Yc"stdafx.h"` | `g++ -o stdafx.h.gch stdafx.h` | `clang++ -emit-pch -o stdafx.h.pch stdafx.h` |
| 使用 PCH | `/Yu"stdafx.h"` | 自动（同目录存在 `.gch` 就加载） | `-include-pch stdafx.h.pch` |
| 强制包含 | `/FI"stdafx.h"` | `-include stdafx.h` | `-include stdafx.h` |
| PCH 文件名 | `stdafx.pch` | `stdafx.h.gch` | `stdafx.h.pch` |
| 自动检测 | 否，需显式 `/Yu` | **是**，同目录自动匹配 | 否，需显式 `-include-pch` |

GCC 的自动检测是独有特性——只要编译目录下存在 `stdafx.h.gch`，任何 include 了 `stdafx.h` 的源文件都会自动使用它。
**为何 Linux 不用 PCH**：`stdafx.h` 被 `#ifndef LINUX` 包裹导致 Linux 下为空文件。这是权衡——Windows 编译慢用 PCH 优化，Linux 编译快且 GCC 自动检测可能有版本兼容问题，故省略。
### MSVC /bigobj 段表限制
问题根因：MSVC 的 COFF `.obj` 文件格式兼容古老规范，section table 条目数用 16 位整数存储，上限 65536。
为何 oatpp Controller 会超限：
- `ENDPOINT` 宏为每个路由生成独立函数体
- `DTO_FIELD` 宏为每个字段生成 getter/setter/序列化代码
- 一个 UserController（20+ 端点）展开后可达数十万段

| | MSVC COFF (默认) | MSVC COFF (`/bigobj`) | Linux ELF |
|------|------|------|------|
| 段表位数 | 16 bit | 32 bit | 动态分配 |
| 段数上限 | 65536 | ~42 亿 | 无硬限制 |
| 兼容性 | 全部工具链 | VS 2005+ | 全部工具链 |

**典型报错**：`fatal error C1128: number of sections exceeded object file format limit`
**注意**：`/bigobj` 是 target 级别的编译选项，无法按单个文件开关。只有 arch-demo 需要它（因为包含 Controller 文件），三个基础库不需要。
### 依赖管理方式对比

| 维度        | vendored 方式（本项目原始方案）                    | 包管理器               |
| --------- | --------------------------------------- | ------------------ |
| 首次搭建      | 开箱即用（有预编译库）                             | 需逐个安装              |
| 跨平台       | 一套预编译库只支持一个平台                           | 包管理器自动处理           |
| 版本锁定      | 固定版本，不会意外升级                             | 需显式锁定版本            |
| 预编译库删除后恢复 | 复杂，需重新找对应版本                             | `vcpkg install` 即可 |
| ABI 兼容性   | 编译环境必须与预编译环境匹配                          | 自动匹配当前系统           |
| 安全更新      | 需要手动替换文件                                | 包管理器自动更新           |
| 文件管理      | 需要手动将库的头文件和编译后的库文件复制到项目目，通过 cmake 引入并维护 | 包管理器自动处理           |

> 本项目在 Windows 上运行良好（所有预编译库都是为 Windows+VS 编译的），迁移到 Linux 时预编译库不可用，需要逐一替换为系统/vcpkg 版本。

## 第2阶段：lib-oatpp — HTTP 框架封装
基于 oatpp 框架的项目自有封装：HTTP 服务器启动流程、路由绑定、Swagger 文档生成、JWT 鉴权、统一错误处理、请求拦截器。
### oatpp 最简 HTTP 服务器模型
```
ConnectionProvider (TCP 端口监听)
       ↓ 接收连接
ConnectionHandler (HTTP 协议解析 + 路由分发)
       ↓
HttpRouter (URL → Handler 查表)
       ↓
HttpRequestHandler::handle(request) (业务处理函数)
       ↓
ResponseFactory::createResponse(status, body)
```
本项目 `HttpServer::startServer` 的本质：实例化以上四个类，用 lambda 回调注入业务路由，然后调 `server.run()` 启动事件循环。
### IOC 容器
```
注册（存入）: OATPP_CREATE_COMPONENT(Type, name)(lambda) → 执行 lambda，将 shared_ptr 存入全局注册表
获取（取出）: OATPP_COMPONENT(Type, name)              → 从注册表取出 shared_ptr
```
**唯一标识**：C++ 类型 RTTI + 字符串标签，同类型无标签只能注册一次。
**生命周期保证**：首次 OATPP_COMPONENT 请求时执行 lambda 创建实例并缓存，后续请求直接返回缓存的 shared_ptr，最后一个引用销毁时实例自动析构。
### DO/DTO/VO/DAO 对象模型
**核心问题**：同一个"用户"数据在不同层有不同的形状需求。
```
数据库表 t_user:     {id, nickname, age, avatar_file_path}     ← DO
接口输入:            {pageIndex, pageSize, nickname?}           ← Query
中间传输:            {id, nickname, age, avatarUrl}             ← DTO
最终 JSON:           {code: 10000, message: "success", data:…}  ← VO
```
**为什么不能只用一个对象？**
- DO 有 avatar_file_path（服务器内部路径），不能暴露给前端
- VO 有 avatarUrl（完整 URL），数据库里没有这个字段
- Query 有 pageIndex，数据库表里没有这列
- DTO 是"对外契约"——数据库改表时只改 DO→DTO 转换，前端无感
**数据流**：
```
Query  → 进入 Service 时
DO     → 在 DAO 层进出数据库
DTO    → 在 Service 层内部流转（DO → DTO 转换）
VO     → 最终离开 Controller 时（DTO + code + message）并通过对应的 Service 类转换为json，所以这些VO类型必须继承JsonVO类
```
### MYSQL_SYNTHESIZE vs CC_SYNTHESIZE 的差异
CC_SYNTHESIZE 生成直接存储值的成员变量和 getter/setter。MYSQL_SYNTHESIZE 生成 shared_ptr 包装的成员变量。原因是 DOField 的 ValueGetter lambda 需要返回 void* 指针，`shared_ptr<T>.get()` 恰好返回 `T*` 可以安全转为 `void*`。
### BaseDAO 自动生成 SQL 原理
BaseDAO 的 insert/update/delete 遍历 DO 的 getPrimaryField() + getFields() 集合，用 `DOField::getColumn()` 拼列名，`DOField::get()` 取值指针，`DOField::getType()` 确定参数占位符类型（"s"=string, "i"=int 等），实现动态 SQL 构建。
### FileViewDO 设计意图
继承 FileDO 但不调用 `MYSQL_ADD_FIELD_XX`。多出的 fileTypeName/saveTypeName 只用于 JOIN 查询的只读字段。BaseDAO 遍历 `_fields` 时自动忽略这些字段，不参与写操作。
### ApiHelper.h 宏体系
- API_DEF_QUERY_PARAM_BUILD：自动遍历 Query 类型的 getPropertiesMap()，根据字段类型向 Swagger queryParams 添加参数描述，实现"写一次 DTO_FIELD，运行时解析 + Swagger 文档两处复用"
- API_HANDLER_QUERY_PARAM：运行时将 URL query 字符串参数按 Query DTO 的字段类型转换为强类型对象，内部用 getValueType() 判断类型后分支转换
### Controller/Service/DAO 分层职责
| 层 | 做什么 | 不做什么 |
|---|---|---|
| Controller | HTTP→C++ 翻译、VO 包装 | 不碰数据库、不做业务逻辑 |
| Service | 业务编排、DO↔DTO 转换、拼 URL | 不写 SQL |
| DAO | 写 SQL、返回 DO | 不做对象转换 |
| VO | 定义 JSON 结构 | 不含业务逻辑 |
| DO | 定义数据库行映射 | 不含业务逻辑 |
| DTO | 定义接口输入/中间传输对象 | 不含业务逻辑 |

### Controller 端点宏的两行模式
每个 Controller 方法用两行宏定义：
```
API_DEF_ENDPOINT_INFO_*(...)   ← 文档层：Swagger 元数据（标题/标签/响应类型/参数描述）
API_HANDLER_ENDPOINT_*(...)    ← 运行层：绑定 URL + 参数解析 + 调用 exec 函数
```
两者用相同的方法名绑定（如 `queryAllUser`）。运行时不读文档信息，Swagger 只读文档信息。两条宏是平行的，互不影响。
**参数注入方式**：

| 宏 | 用途 | 参数来源 |
|---|---|---|
| `API_HANDLER_ENDPOINT_QUERY_AUTH` | 动态可选查询参数 | URL query 全部收入 → `QUERIES(QueryParams)` → 按 Query DTO 类型转换 |
| `API_HANDLER_ENDPOINT_AUTH` | 固定参数 | 单个 query 参数，如 `QUERY(String, id)` |
| `API_HANDLER_ENDPOINT_NOPARAM_AUTH` | 无参数 | 通过 `authObject` 获取登录用户信息 |

### UserDO 与 oatpp DTO 无关
`UserDO` 的继承链是 `BaseDO→UserDO`，**不经过 `oatpp::DTO`**。oatpp ObjectMapper 不认识 UserDO 的字段，不能直接序列化为 JSON。Service 层必须手动用 `ZO_STAR_DOMAIN_DO_TO_DTO_1` 宏做 DO→DTO 转换后再交给 VO 序列化。

**继承链对比**：
```
oatpp::DTO（JSON 序列化）→ NoDataJsonVO → JsonVO<T> → UserDetailJsonVO
BaseDO（数据库交互）     → UserDO
```

### DOField 间接访问机制
DOField 存储字段元数据 + 一个 lambda getter，不直接存值：
```
UserDO 构造函数中：
MYSQL_ADD_FIELD("nickname", "s", nickname)
  ↓ 展开为：
addColField(new DOField("nickname", "s", [this]() { return nickname.get(); }));
```
BaseDAO 遍历 `_fields` 时调用 `field->get()` → 执行 lambda → 返回 `shared_ptr<string>.get()` → `void*` → 写入 SQL 参数。

`MYSQL_SYNTHESIZE` 用 `shared_ptr<T>` 包装值，是为了让 `get()` 能返回 `void*` 指针给 DOField。

### 完整请求生命周期
```
浏览器 GET /user/query-all?page=1&size=10
    ↓
ConnectionProvider (TCP 端口 8090)
    ↓
ConnectionHandler (解析 HTTP 协议)
    ↓
RequestInterceptor 链
├─ CrosRequestInterceptor      ← OPTIONS → 直接返回 CORS 头
└─ CheckRequestInterceptor     ← 有 token？没有就拦截
    ↓
HttpRouter 查表：GET + /user/query-all → UserController::queryAllUser
    ↓
API_HANDLER_QUERY_PARAM 自动解析 query → UserQuery 对象
    ↓
UserController::executeQueryAll(query)
    ↓
UserService::listAll(query)
    ↓
UserDAO::count(query)      → SELECT COUNT(*) FROM t_user WHERE ...
UserDAO::selectAll(query)  → SELECT * FROM t_user WHERE ... LIMIT 10 OFFSET 0
    ↓
for each UserDO:
    ZO_STAR_DOMAIN_DO_TO_DTO_1 → UserDTO（DO→DTO 转换）
    ↓
UserPageDTO 包含 List<UserDTO>
    ↓
Controller 返回 UserPageJsonVO（包进 VO）
    ↓
ObjectMapper 序列化 → {"code":10000,"message":"success","data":[...]}
    ↓
ResponseInterceptor 链
└─ CrosResponseInterceptor     ← 加 CORS 响应头
    ↓
HTTP 响应 200 + JSON → 浏览器
```

### UUID（通用唯一标识符）
128 位全局唯一 ID，格式如 `550e8400-e29b-41d4-a716-446655440000`。
- **v4（完全随机）**：依赖随机数生成器，本项目使用，`UuidFacade` 封装 `stduuid` 库生成
- **v7（时间戳+mac 地址）**：新版，可排序，但会暴露 mac 地址
- **v3/v5（基于符号名称和 MD5/SHA256 等算法计算）**: 实现较为复杂
- **和自增 ID 的关系**：UUID 在分布式系统中不冲突、不可猜测、离线可生成；代价是无序、128 位占用更多空间
项目中 `UserQuery.h` 的 Swagger 示例值 `"ae65c714d48d4f34b52479f5482c0edd"` 就是去掉连字符的 UUID。`lib-common` 中 `UuidFacade`（UUID）和 `SnowFlaker`（雪花算法）是两种分布式 ID 方案。
### SnowFlake 算法
[参考](https://cloud.tencent.com.cn/developer/article/2185662)，在 [[Sylar Backend Collection|sylar项目]]中也有用到
**Snowflake（雪花）算法**是Twitter开源的一种**分布式ID生成算法，它的核心目标是在高并发、分布式的系统环境中，生成**全局唯一**且**趋势递增**的 64 位长整型（Long）ID。
它生成的ID是一个64位的整数，其典型结构如下：
- **1 位符号位**：固定为 0，保证 ID 为正数。
- **41位时间戳**：精确到毫秒级，可以使用约69年
- **10位工作机器ID**：用于区分不同节点，通常再分为5位数据中心ID和5位机器ID，共支持最多1024个节点
- **12位序列号**：在同一毫秒内，为不同ID提供序号，支持每节点每毫秒生成4096个ID

| 特性       | UUID (如 v4)                                      | Snowflake                                                                             |
| :------- | :----------------------------------------------- | :------------------------------------------------------------------------------------ |
| **ID长度** | 128位，通常表示为36位字符串                                 | 64位，一个Long型整数                                                                         |
| **是否有序** | **无序**，插入数据库时可能导致页分裂，影响性能                        | **趋势递增**，对数据库索引非常友好                                                                   |
| **生成原理** | 基于随机数或名字空间等，与外界无关                                | 强依赖**时间戳**和**机器ID**的组合                                                                |
| **系统依赖** | **无中心化**，任何机器可独立生成                               | **半中心化**，需提前分配唯一的机器ID                                                                 |
| **主要弱点** | 存储空间大，查询性能较差，无序                                  | **时钟回拨**问题可能导致 ID 重复或系统不可用                                                            |
| 适用场景     | 小规模系统，对 ID 无顺序要求，无需任何依赖，最为一次性请求的 id 身份验证，有时钟回拨情景 | 大规模分布式系统，性能要求高，ID将用作**数据库主键**，且你关心**写入性能**和**索引效率**，需要 ID 本身**包含时间信息**，便于按时间排序或进行范围查询 |
### `DTO_INIT` 宏的继承元数据传播
每个 oatpp DTO 类内部有一张**自己的字段注册表**（`vector<Property*>`），只记录本类用 `DTO_FIELD` 声明的字段：
```
NoDataJsonVO 的字段表:    [{name:"code", type:Int32}, {name:"message", type:String}]
JsonVO<T> 的字段表:       [{name:"data", type:T}]
UserDetailJsonVO 的字段表: []  ← 空的
```
`DTO_INIT(TYPE_NAME, TYPE_EXTEND)` 展开后生成的关键部分：
```cpp
typedef TYPE_EXTEND Z__CLASS_EXTENDED;

// 告诉 ObjectMapper "我的父类的字段也归我管"
static const oatpp::Type* getParentType() {
    return oatpp::Object<Z__CLASS_EXTENDED>::Class::getType();
}
// 本类的字段注册表
static oatpp::BaseObject::Properties* Z__CLASS_GET_FIELDS_MAP() {
    static oatpp::BaseObject::Properties map;
    return &map;
}
// 工厂方法
template<typename ... Args>
static Wrapper createShared(Args... args) { ... }
```
**ObjectMapper 序列化时的递归查找**：
```
ObjectMapper 拿到 UserDetailJsonVO 实例
    ↓
查 UserDetailJsonVO 的字段表 → 空
    ↓
调 getParentType() → 得到 JsonVO 类型
    ↓
查 JsonVO 的字段表 → 找到 "data"
    ↓
调 JsonVO 的 getParentType() → 得到 NoDataJsonVO 类型
    ↓
查 NoDataJsonVO 的字段表 → 找到 "code", "message"
    ↓
调 NoDataJsonVO 的 getParentType() → 得到 oatpp::DTO（根，停止）
    ↓
最终收集到 3 个字段：code, message, data
```
**核心结论**：`DTO_INIT` 不是"声明继承"（C++ 的 `: public` 已经做了），而是**告诉 ObjectMapper 序列化时要递归查找父类的字段表**。没有它，oatpp 的序列化系统根本不知道继承关系的存在。

### `DTO_FIELD` 字段注册与访问机制
`DTO_FIELD(Int32, code, "code")` 展开后分为 4 个部分：

**① 计算字段在对象内的内存偏移量**：
```cpp
static v_int64 Z__PROPERTY_OFFSET_code() {
    char buffer[sizeof(Z__CLASS)];
    auto obj = static_cast<Z__CLASS*>(reinterpret_cast<void*>(buffer));
    auto ptr = &obj->code;
    return reinterpret_cast<v_int64>(ptr) - reinterpret_cast<v_int64>(buffer);
}
```

**② 创建字段描述符**（Property 单例）：
```cpp
static oatpp::BaseObject::Property* Z__PROPERTY_SINGLETON_code() {
    static oatpp::BaseObject::Property* property =
        new oatpp::BaseObject::Property(
            Z__PROPERTY_OFFSET_code(),   // 内存偏移量
            "code",                       // JSON key 名
            Int32::Class::getType()       // 类型信息
        );
    return property;
}
```

**③ 注册到本类字段表**：
```cpp
static bool Z__PROPERTY_INIT_code(...) {
    Z__CLASS_GET_FIELDS_MAP()->pushBack(Z__PROPERTY_SINGLETON_code());
    return true;
}
```

**④ 实际的字段声明**（触发初始化）：
```cpp
Int32 code = Z__PROPERTY_INITIALIZER_PROXY_code();
// ↑ 这是真正的成员变量声明，同时触发静态初始化注册
//   只在程序第一次创建 MyDTO 实例时执行一次
```

**ObjectMapper 用 offset 直接访问内存**：
```
MyDTO 对象内存布局：
+0  ~ +7:   vtable pointer (8 bytes)
+8  ~ +15:  padding
+16 ~ +19:  code (Int32, 4 bytes)  ← offset = 16

序列化：
char* base = static_cast<char*>(objPtr);
Int32* codePtr = reinterpret_cast<Int32*>(base + 16);
int value = *codePtr;  // 不需要 getter，直接读取

反序列化：
Int32* codePtr = reinterpret_cast<Int32*>(base + 16);
*codePtr = 25;  // 不需要 setter，直接写入
```

**为什么用 offset 而不是 getter/setter？**

| | offset 方式（oatpp） | getter/setter 方式 |
|---|---|---|
| 性能 | 直接内存访问，无函数调用开销 | 每次读写都有函数调用 |
| 代码量 | 宏自动生成，零手写 | 每个字段手写两个函数 |
| 一致性 | 所有字段访问路径统一 | 每个字段 getter 名称可能不统一 |
| 缺点 | 依赖内存布局，不支持多态访问 | 虚函数调用有额外开销 |

### Controller 的创建与鉴权挂载
`ApiHelper.h` 中的定义展开后做了 3 件事：
```cpp
// ① 构造函数：从 IOC 获取 ObjectMapper
__CLASS__(OATPP_COMPONENT(std::shared_ptr<ObjectMapper>, objectMapper))
    : ApiController(objectMapper) {
    // ③ 自动挂载鉴权处理器
    setDefaultAuthorizationHandler(std::make_shared<CustomerAuthorizeHandler>());
}

// ② 工厂方法：Router 用这个创建 Controller 实例
static std::shared_ptr<__CLASS__> createShared(
    OATPP_COMPONENT(std::shared_ptr<ObjectMapper>, objectMapper)) {
    return std::make_shared<__CLASS__>(objectMapper);
}
```
**完整的创建链路**：
```
Router::initRouter()
    ↓
ROUTER_SIMPLE_BIND(UserController)
    ↓
docEndpoints->append(
    router->addController(UserController::createShared())->getEndpoints()
)
    ↓
UserController::createShared()
    → 从 IOC 获取 ObjectMapper
    → new UserController(objectMapper)
    → setDefaultAuthorizationHandler(CustomerAuthorizeHandler)  ← 鉴权挂载
    ↓
router->addController(userController)  ← 路由注册
    ↓
controller->getEndpoints()  ← 收集 Swagger 端点信息
```

## 第 3 阶段：lib-mysql — 数据库层
MySQL Connector/C++ 的项目封装：连接池管理、参数化 SQL 执行、ORM 行映射、事务管理。
### 生命周期管理
本项目通过三层类封装了数据库连接的完整生命周期，核心思想是 RAII
```
DbInit（静态单例）
    │ 管理全局唯一的连接池
    ↓
ConnPool（连接池）
    │ 管理一组可复用的 Connection 对象
    ↓
SqlSession（会话）
    │ 从池中获取一个连接，执行 SQL，归还连接
    ↓
BaseDAO（DAO 基类）
    │ 持有 SqlSession 指针，提供 CRUD 模板
    ↓
具体 DAO（如 UserDAO）
    │ 继承 BaseDAO，写具体 SQL
```
**DbInit — 连接池的全局生命周期**
```cpp
class DbInit {
    static ConnPool* connPool;   // 类级静态指针，全局唯一
public:
    static bool initDbPool(DBConfig config);  // 启动时调用一次
    static ConnPool* getConnPool();           // 任何地方获取连接池
    static void releasePool();                // 关闭时释放
};
```
`main.cpp` 启动时调用 `DbInit::initDbPool()`，关闭时调用 `DbInit::releasePool()`。整个程序生命周期中只有一个连接池实例。
**ConnPool — 连接对象的生命周期**
ConnPool 内部用 `list<Connection*>` 管理一批可复用的 MySQL 连接对象：
```
构造 ConnPool(url, user, pass, maxSize)
    ↓
driver = sql::mysql::get_mysql_driver_instance()   ← 获取 MySQL 驱动单例
    ↓
InitConnection(maxSize / 2)   ← 预热：创建最大连接数一半的连接放入池中
    ↓
运行期间循环：
    GetConnection()  ← 从池中取出一个（有健康检查：isClosed()/isValid()）
    使用连接执行 SQL
    ReleaseConnection(conn)  ← 放回池中，不关闭，下次复用
    ↓
~ConnPool()  ← 析构：遍历池中所有连接，逐个 close() + delete
```
**GetConnection() 的三种分支**：
```
分支 1：connList 非空
    → 取出第一个 → 检查 isClosed() / isValid()
    → 有效：直接返回
    → 失效：delete + CreateConnection() 重建

分支 2：connList 为空，curSize < maxSize
    → 按需创建新连接 → 返回

分支 3：connList 为空，curSize >= maxSize
    → 连接池已耗尽，返回 NULL（调用方需处理）
```
连接的获取和归还由构造/析构自动管理，无论 SQL 执行是否抛异常，`~SqlSession()` 一定会被调用（C++ 异常安全保证），连接一定归还到池中，不会泄漏。
内部执行 SQL 时，`Statement`/`ResultSet` 的释放用 `TryFinally` 管理（与 RAII 并用）：
```
RAII 管连接（SqlSession 构造/析构）
    └── TryFinally 管 Statement/ResultSet（每次 SQL 执行的临时资源）
```
### executeQuery 模板重载详解
`SqlSession.h` 中有两组共 6 个 `executeQuery` 模板方法，逻辑相同，区别只在参数传递方式和返回语义：
**第一组：`executeQuery<T>` — 返回多行结果**

| 签名 | 参数方式 | 使用场景 |
|---|---|---|
| `executeQuery<T>(sql, mapper, fmt, ...)` | C 风格格式串 `\"%s%i\"` + va_list | 旧式调用，不推荐 |
| `executeQuery<T>(sql, mapper)` | 无参数 | 无 WHERE 条件的全表查询 |
| `executeQuery<T>(sql, mapper, SqlParams)` | 类型安全参数向量 | 新式调用，推荐 |

**第二组：`executeQueryOne<T>` — 返回单行结果**

| 签名 | 参数方式 | 使用场景 |
|---|---|---|
| `executeQueryOne<T>(sql, mapper, fmt, ...)` | C 风格格式串 + va_list | 旧式调用 |
| `executeQueryOne<T>(sql, mapper)` | 无参数 | 按主键查单条记录 |
| `executeQueryOne<T>(sql, mapper, SqlParams)` | 类型安全参数向量 | 新式调用，推荐 |
与 `executeQuery` 的唯一区别：**多了行数校验**：
```cpp
if(res->rowsCount() > 1) {
    throw std::runtime_error(\"except 1 but query \" + to_string(res->rowsCount()));
}
if(res->next()) {
    result = mapper.mapper(res);   // 只调一次 Mapper
}
```
**总结**：
```
executeQuery     → 多行 → std::list<T>，while 循环，每行调一次 Mapper
executeQueryOne  → 单行 → T，rowsCount <= 1 检查，只调一次 Mapper
```
### Mapper 回调：半自动 ORM
`Mapper<T>` 是纯虚接口，`mapper(ResultSet*)` 定义"数据库结果集的一行如何转成一个 C++ 对象"。数据库返回的是一个 ResultSet 对象， ResultSet 是一个"行指针"，必须手动调用  `resultSet->getString("id")` 等方法来提取每个字段。Mapper把提取逻辑封装在一个地方，`SqlSession::executeQuery` 循环调用 `mapper.mapper(res)` 逐行转换一般包含表格的一行数据，Mapper 将其解析并将结果存放在一个对象中方便获取
**调用链**：
```
UserDAO::selectAll(query)
    ↓
sqlSession->executeQuery<PtrUserDO>(sql, UserMapper(), params)
    ↓
while(res->next()) {
    list.push_back(mapper.mapper(res));   // 每行调一次 UserMapper::mapper()
}
```
**全自动 ORM vs 半自动 ORM 对比**：

| | 全自动 ORM（Hibernate/JPA） | 半自动 ORM（本项目） |
|---|---|---|
| 映射规则 | 自动推断：类名=表名，字段名=列名 | 手写：mapper(resultSet) |
| SQL 生成 | 框架自动生成 | 手写 SQL |
| 灵活度 | 受框架限制 | 完全控制 |
| JOIN 查询 | 复杂，需要配置 | 直接写 SQL + Mapper 处理 |
| 适用场景 | CRUD 为主的标准业务 | 需要复杂 JOIN、聚合查询的场景 |
### TryFinally Scope Guard 模式
C++ 没有原生 `finally` 关键字，这个模板用三个 lambda 模拟：
```cpp
template <class EXCEPTION = std::exception, class TRY_BLOCK, class CATCH_BLOCK, class FINALLY_BLOCK>
inline void TryFinally(TRY_BLOCK ___try, CATCH_BLOCK ___catch, FINALLY_BLOCK ___finally) {
	try {
		___try();
	} catch(EXCEPTION& e) {
		try {
			___catch(e);
		} catch(...) {
			___finally();
			throw;
		}
	} catch(...) {
		___finally();
		throw;
	}
	___finally();
}

TryFinally(
    [&] { /* try: 主逻辑 */ },
    [](const exception& e) { /* catch: 处理异常 */ },
    [=] { /* finally: 释放资源，无论成功失败都执行 */ }
);
```
**实现原理**：正常路径执行完 try 后调用 finally；异常路径执行完 catch 后调用 finally；即使 catch 内又抛异常，也会先执行 finally 再继续 throw。
**与 RAII 的对比**：

| | RAII | TryFinally |
|---|---|---|
| 原理 | 析构函数自动释放 | lambda 显式指定释放逻辑 |
| 灵活性 | 受限于析构顺序 | 可以更精细控制释放顺序 |
| 使用场景 | 资源生命周期=对象生命周期 | try 块内的临时资源释放 |
本项目并用两者：`SqlSession` 用 RAII 管理连接（对象级），内部的 `execute()`/`executeInsert()` 用 `TryFinally` 管理 Statement/ResultSet（语句级）。

### JDBC URL 连接方式
MySQL Connector/C++ 使用 JDBC URL 风格连接，而非 libmysqlclient 的逐参数方式：
```
libmysqlclient（MySQL C 官方库）：
mysql_real_connect(conn, "localhost", "root", "password", "mydb", 3306, NULL, 0);
//                   主机          用户名    密码           数据库   端口     ...

MySQL Connector/C++（本项目）：
conn = driver->connect("tcp://localhost:3306/mydb", "root", "password");
//                     JDBC URL 格式的字符串         用户名  密码
```
项目中 `DbInit.cpp` 的拼接逻辑：`tcp:// + host + : + port + / + db`。Connector/C++ 是 Java MySQL Connector/J 的 C++ 移植版，Driver/Connection/PreparedStatement/ResultSet 这些类名继承 JDBC 命名风格。两者底层都走 MySQL 协议，但 API 风格完全不同。

## 第4阶段：lib-common — 公共组件库
项目自建的 11 个外部服务客户端封装 + 工具类。
### 封装模式
所有客户端统一遵循：构造函数初始化底层连接/对象 → 操作方法薄封装底层 API → 析构释放资源。全部用 `#ifdef USE_XXX` 条件编译包裹整个实现，不安装该库时编译器直接跳过。不用虚接口——不需要多态，无 vtable 开销。
### 使用 typedef 而不是函数指针
Windows 下 FastDFS 没有 C++ SDK，需要从 DLL 动态获取函数地址：
```cpp
typedef                                               ← 声明别名
    UINT32                                            ← 返回值类型
    (__stdcall* func_Initialize)                      ← 函数指针类型名（func_Initialize
是新类型名）
    (ServerAddress* pAddr, UINT32 nAddrCount, ...)    ← 参数列表
m_hDll = LoadLibrary("dfs_client_win.dll");
m_func_Initialize = (func_Initialize)GetProcAddress(m_hDll, "FDFSC_Initialize");
m_func_Initialize(&addr[0], 1, 0);  // 通过函数指针调用 DLL 中的函数
```
`typedef` 定义函数指针类型比 `std::function` 零开销。`__stdcall` 是 Windows API 标准调用约定。
为什么不直接写函数声明？ 因为这些函数不在这个头文件里实现，它们来自 Windows 上的 DLL 动态库。
### RedisClient 集中异常处理
调用方传入 lambda 操作 `Redis*`，内部统一 try-catch。与 MongoClient 的 `execute` 模式相同。
```cpp
template <class T>
T execute(std::function<T(Redis*)> callfun) {
	try {
		return callfun(m_redis.get());
	} catch(const std::exception& e) {
		cerr << e.what() << endl;
	}
	return {};
}
```
由于任何操作都可能会有异常出现，传统写法是为每一种执行语句都写一个错误处理 `try-catch` ，比如:
```cpp
struct UserInfoBuffer{ /* 属性 */ };
struct ProductInfoBuffer{ /* 属性 */ };

template <class T>
T getUser(const std::string& command) {
	try{
		auto result = redis->execute(command);
	}catch(...) { /**/ }
}

template <class T>
T getProduct(const std::string& command) {
	try{
		auto result = redis->execute(command);
	}catch(...) { /**/ }
}

// 使用时
getUser<UserInfoBuffer>("command")
getProduct<ProductInfoBuffer>("command")
```
- 有很多冗余 try-catch 代码，并且需要维护多个 api
- 现使用 lambda 传入 redis 执行逻辑，可以在 lambda 中自定义额外逻辑（比如执行完命令后写入日志等操作，在上述方法中就只能修改对应函数实现），随时使用，并且不用在执行逻辑 lambda 中做错误处理
### MongoDB 基本概念
#### 和关系型数据库概念对比

| 概念     | MySQL  | MongoDB        |
| ------ | ------ | -------------- |
| 表      | table  | collection（集合） |
| 行      | row    | document（文档）   |
| 列      | column | field（字段）      |
| Schema | 严格定义   | 灵活（不需要预先定义）    |

- MongoDB 中的 Document（文档） 是数据存储的基本单元，对应关系型数据库中的一行（Row）。它以 BSON（Binary JSON）格式存储
- Document 的**可读形态**是 JSON 对象，可嵌套嵌套文档和数组。必须包含 `_id` 字段（唯一标识），最大尺寸 16MB（BSON 限制），对应关系型数据库中**表中的一行**，但 Document 支持嵌套
- Collection 是一组文档的容器。BSON（Binary JSON）是二进制存储格式，采用 TLV 变体，对应 MySQL 的 table
- Element 对应一个键值对，有具体的类型（通过其确定长度）

| 类型编号 | 类型名      | MongoDB Driver cpp 类型    | 含义        |
| ---- | -------- | ------------------------ | --------- |
| 0x01 | double   | double                   | 浮点数       |
| 0x02 | string   | std::string              | UTF-8 字符串 |
| 0x03 | object   | bsoncxx::document::value | 嵌套文档      |
| 0x07 | ObjectId | bsoncxx::oid             | 唯一标识符     |
| 0x08 | bool     | bool                     | 布尔值       |
| 0x0A | null     | nullptr                  | 空值        |
| 0x10 | int32    | int32_t                  | 32 位整数    |

#### BSON 数据结构特点
参考: https://juejin.cn/post/7564996332810043434
每个字段自带长度前缀，解析时可通过长度跳过不需要的字段（必须从头顺序扫描）。`_id` 自动生成（ObjectId = 4字节时间戳 + 5字节随机值 + 3字节计数器）。
`bsoncxx::document::view` 就是一个 BSON 文档的视图，`bsoncxx::builder::stream::document` 是构建 BSON 文档的流式 API：
```cpp
 // 构建一个 BSON 文档
 auto doc = document{}
     << "name" << "张三"
     << "age" << 25
     << "address" << open_document
         << "city" << "北京" ...
```
构建之后:
```json
{
    name:"lemo",
    age:"12",
    address:{
        city:"suzhou",
        country:"china",
        code:215000
    } ,
    scores:[
        {"name":"english","grade:3.0},
        {"name":"chinese","grade:2.0}
    ]
}
```
- 可以认为整个文本是一个bson document，其中的address字段也是一个bson document
- 这些可读的内容会在存储时将内容转换为二进制存储，并且为每一个document添加一个名为 `_id` 的字段，生成逻辑为: 
```
MongoDB 自动为每个文档生成一个 12 字节的 ObjectId：
ObjectId("507f1f77bcf86cd799439011")
    ├─ 前 4 字节：Unix 时间戳（秒级）        → 可以从中提取创建时间
    ├─ 接下来 5 字节：随机值（每个进程一次） → 保证不同机器不重复
    └─ 最后 3 字节：递增计数器               → 同一秒内的区分
```
#### 与 JSON 相比优势
json 解析需要**全量扫描**，查找操作是**线性复杂度的**，bson 由于类型/长度信息前置，可以*跳读*
```md
+-----------------+-----------------+
| 文档总长度 (4字节) |                 |
+-----------------+-----------------+
| 元素列表...                      |
+-----------------+-----------------+
| 结束标记 (1字节) |                 |
+-----------------+-----------------+
```
这种数据结构被应用于 document，数组和字符串等长度不确定的字符串上，每个元素编译为二进制之后的数据格式为:
```md
+----------+----------+-----------------+----------+
| 类型 (1字节) | 键名 (变长) | 值 (变长)         |          |
+----------+----------+-----------------+----------+
```
所以，在需要查找 key 时，读取每一个元素的键名进行比对，符合则读取值，不符合根据类型信息直接跳过内容，如果给出路径信息可直接跳过不符合的 Document
### RocketMQ 消息队列
#### 基本概念
消息队列是异步通信机制——生产者发消息到队列，消费者从队列取消息，两者不需要同时在线。
```md
同步通信（不用消息队列）：
    用户下单 → 系统直接调用短信服务发送短信 → 短信服务返回 → 系统返回用户
    问题：短信服务挂了，用户下单也失败了

 异步通信（用消息队列）：
    用户下单 → 系统发一条消息到 MQ → 立即返回用户（0.1s）
                      ↓
              MQ 异步投递
                      ↓
                短信服务消费消息 → 发送短信
    优势：用户响应快，短信服务故障不影响下单

Producer → NameServer(查询 Broker 地址) → Broker(存储消息) → Consumer
```

| 概念           | 对应关系    | 说明                                                                                                                                                                 |
| ------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Producer     | 发消息的人   | 调用 `productMsgAsync()` 或 `productMsgSync()`（项目内的封装 api）                                                                                                            |
| Consumer     | 收消息的人   | 调用 subscribe() + addListener()                                                                                                                                     |
| Topic        | 频道      | 消息按 Topic 分类，如 order-topic、sms-topic，producer 和 consumer 在创建时都要制定 topic，然后连接上相同的 nameserver，nameserver 为他们（可以不只有一个 Producer 和 consumer 连接上同一个 nameserver）分配 broker |
| NameServer   | 路由中心    | Producer/Consumer 连接 NameServer 获取 Broker 地址，作为路由中心，不传输也不存储消息内容，只提供 Broker 地址                                                                                      |
| Message      | 消息本身    | 包含 Topic + Body（消息内容）                                                                                                                                              |
| Broker       | 消息存储服务器 | 是 RocketMQ 内部实现并维护的，不需要外部依赖                                                                                                                                        |
| Group        | 分组      | 同一 Group 的 Producer 是逻辑同一角色（用于事务回查）<br>同一 Group 的消费者会负载均衡，通过 `set` 每条消息只被其中一个消费者消费                                                                                 |
| instanceName | 身份标识    | Broker 用它区分不同 Producer/Consumer 实例。每次创建新实例时生成唯一名称，一般需要手动指定生成规则，常用`groupname@tag-timestamp`），否则 Broker 会覆盖前一个实例的连接。                                                 |


#### 事件驱动模型
`subscribe()` 后 SDK 在后台线程自动拉取消息 → 回调 `consumeMessage()` → 遍历所有 `RConsumerListener` 通知业务代码。三层结构：SDK 接口 → 适配器（RMessageLisenter）→ 业务 listener（观察者模式）。

```md
m_consumer->start() 使用者只需要通过subscribe() + addListener() 注册回调，RocketMQ SDK 会自动拉取消息并回调你的 listener。
    ↓
RocketMQ SDK 在后台启动一个线程
    ↓
后台线程从 Broker 拉取消息（Pull 模式）
    ↓
拉到消息后调用 m_msgListener->consumeMessage(msgs)
    ↓
RMessageLisenter::consumeMessage 遍历所有注册的 listener
    ↓
for(auto listener : client->m_listeners) {
    listener->receiveMessage(msg.getBody());   // 虚函数调用你的实现
}
    ↓
返回 CONSUME_SUCCESS → 告诉 Broker 消费成功
```
其中 listener 是 `RConsumerListener*`，通过 `addListener()` 可以传入其他子类，通过虚函数调用 receiveMessage 作专门的消息处理
#### 创建 Consumer 的参数
```cpp
// 从哪里开始消费：只消费启动后的新消息（不消费历史消息）
m_consumer->setConsumeFromWhere(CONSUME_FROM_LAST_OFFSET);

// 广播模式：每个消费者都收到所有消息（区别于 CLUSTERING 集群模式，消息只给一个消费者）
m_consumer->setMessageModel(rocketmq::BROADCASTING);

// 订阅 topic，"*" 表示接受该 topic 下所有 tag 的消息
// 也可以用 "tagA || tagB" 过滤特定 tag
m_consumer->subscribe(topic, "*");

// 消费线程数：1 表示单线程顺序消费
m_consumer->setConsumeThreadCount(1);

// TCP 连接锁超时：1000ms
m_consumer->setTcpTransportTryLockTimeout(1000);

// TCP 连接超时：400ms
m_consumer->setTcpTransportConnectTimeout(400);

// 异步拉取模式
m_consumer->setAsyncPull(true);

// 开启消息追踪（用于调试和监控）
m_consumer->setMessageTrace(true);
```
### 消息队列框架对比
| 框架 | 路由机制 | 特点 |
|---|---|---|
| RocketMQ | NameServer + Topic + Broker | 国内生态好，事务/定时消息 |
| RabbitMQ | Exchange + Binding + Queue | 灵活路由，多种 Exchange 类型 |
| Kafka | Partition 顺序写磁盘 | 百万级吞吐，适合日志/大数据流 |

本项目选 RocketMQ 因国内资料多、Spring Cloud 集成好。
### yaml-cpp 的解析逻辑
yaml-cpp 把 YAML 文件解析成一棵树形结构，每个节点（key 或 value）都是一个 `YAML::Node` 对象， `NodeType` 枚举包括：
- Undefined（key 不存在）
- Null（空值）
- Scalar（标量值）
- Sequence（列表）
- Map（嵌套对象）
```cpp
# 以下 YAML 文件
name: "张三"           ← Scalar（字符串值）
age: 25               ← Scalar（数字值）
isStudent: true       ← Scalar（布尔值）
address: null          ← Null
phone: ~               ← Null（~ 是 null 的简写）
hobbies:               ← Sequence（列表）
  - reading
  - gaming
address:               ← Map（嵌套对象）
  city: "北京"
  street: "朝阳路"
scores:                ← Sequence of Map（列表内嵌对象）
  - name: "math"
    grade: 95
  - name: "english"
    grade: 88

node["name"].Type()     → Scalar
node["hobbies"].Type()  → Sequence
node["address"].Type()  → Map
node["phone"].Type()    → Null
node["xxx"].Type()      → Undefined（key 不存在）
```
`YamlHelper::getString` 函数通过 `std::stack` **模拟递归调用**，实现 Spring 风格点分隔 key 访问（`"spring.datasource.url"`），内部按 `.` 分割 key 后逐层索引 Node，最终返回 Scalar 字符串。最后检查 `NodeType::Scalar` 防止对 Map/Sequence 调用 `as<string>()` 抛异常。
