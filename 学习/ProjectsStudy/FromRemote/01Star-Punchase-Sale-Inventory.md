> 项目地址：`zero-one-psi-cpp-sample`
> 技术栈：C++17 + oatpp Web 框架 + MySQL + Redis + MongoDB + FastDFS

## 第1阶段：项目全景 + CMake 构建系统

### 多子项目架构
基础库（lib-oatpp/lib-mysql/lib-common）之间互不依赖，arch-demo 作为上层应用依赖所有基础库。每个子项目输出 `STATIC` 库，最终链接为单一可执行文件。编译顺序由 `add_subdirectory` 的出现顺序决定。
```
CMakeLists.txt (顶层)
option() 控制 9 个特性开关（USE_REDIS, USE_MONGO, USE_ROCKETMQ...）
add_subdirectory() 引入 4 个子项目
       /        |         \
      v         v          v
lib-oatpp   lib-mysql   lib-common
(静态库)    (静态库)    (静态库)
oatpp 封装   MySQL 封装工具+客户端
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
### CMake 条件编译
通过 `option` + `add_definitions` + `#ifdef` 三层联动实现特性开关。用户在构建时通过 `cmake -DUSE_XXX=ON` 控制，代码层面用宏分支跳过未安装库的代码，链接层面用 `if(USE_XXX) target_link_libraries(...)` 条件链接。三层必须同步，缺一即报错。
### 预编译头
将体积大、改动少的头文件提前编译为二进制（`.pch`），后续编译直接加载跳过重复解析。MSVC 用 `/Yc`（创建）+ `/Yu`（使用）+ `/FI`（强制包含）；GCC 用 `.gch` 文件自动检测；本项目 Linux 下 `stdafx.h` 被 `#ifndef LINUX` 包裹为空文件，故不启用 PCH。
**核心思想**：将体积大、改动少的头文件提前编译为二进制，后续编译直接加载
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

### HTTP 服务器架构

oatpp 的核心是四个类的协作：
- `ConnectionProvider`：TCP 端口监听，接收客户端连接
- `ConnectionHandler`：HTTP 协议解析，将原始字节流解析为请求对象
- `HttpRouter`：URL 路由表，将请求分发到对应的处理函数
- `HttpRequestHandler`：业务处理接口，开发者实现具体的请求处理逻辑

本项目的 `HttpServer::startServer` 本质上就是实例化这四个类，用 lambda 回调注入路由注册逻辑，然后调 `server.run()` 启动事件循环。

### oatpp 序列化机制

oatpp 实现了编译期的"反射"——通过宏在编译时自动生成字段元数据注册代码，运行时 ObjectMapper 遍历这些元数据完成 JSON ↔ C++ 对象的双向转换。

#### 字段注册（DTO_FIELD）

`DTO_FIELD(Int32, code, "code")` 展开后做三件事：
1. 计算字段在对象内存中的偏移量（编译期）
2. 创建 `Property(偏移量, "code", Int32)` 字段描述符（单例）
3. 将描述符注册到本类的静态字段表 `Z__CLASS_GET_FIELDS_MAP()`

ObjectMapper 序列化时，用 `reinterpret_cast<char*>(obj) + offset` 直接定位内存读取值，不需要 getter/setter。反序列化时同理直接写入。

#### 继承元数据传播（DTO_INIT）

每个 DTO 类有自己的字段注册表。`DTO_INIT(TypeName, ParentType)` 生成 `getParentType()` 方法，ObjectMapper 序列化时递归调用此方法逐层向上查找父类的字段表，直到 `oatpp::DTO` 根类停止。没有这个宏，父类的 `DTO_FIELD` 不会被序列化。

```
UserDetailJsonVO 字段表 → 空
    getParentType() → JsonVO → 字段表: [data]
        getParentType() → NoDataJsonVO → 字段表: [code, message]
            getParentType() → oatpp::DTO（停止）
最终收集：code, message, data
```

### IOC 容器
```
注册（存入）: OATPP_CREATE_COMPONENT(Type, name)(lambda) → 执行 lambda，将 shared_ptr 存入全局注册表
获取（取出）: OATPP_COMPONENT(Type, name) → 从注册表取出 shared_ptr
```
**唯一标识**：C++ 类型 RTTI + 字符串标签，同类型无标签只能注册一次。
**生命周期保证**：首次 OATPP_COMPONENT 请求时执行 lambda 创建实例并缓存，后续请求直接返回缓存的 shared_ptr，最后一个引用销毁时实例自动析构。
### 分层架构中的对象模型

同一"用户"数据在不同层有不同的形状：

| 层 | 对象 | 用途 |
|---|---|---|
| DAO 层 | DO（继承 BaseDO） | 与数据库表结构一一对应，不参与 JSON 序列化 |
| Service 层 | DTO（继承 oatpp::DTO） | 层间传输，"对外契约"——数据库改表时只改 DO→DTO 转换 |
| Controller 返回 | VO（继承 JsonVO\<T\>） | 最终 JSON 结构，包含 code + message + data |
| Controller 入参 | Query（继承 oatpp::DTO） | 前端查询条件（分页、筛选等） |

DO 和 oatpp DTO 是完全不同的继承链（BaseDO vs oatpp::DTO），Service 层必须手动做 DO→DTO 转换。

### 端点声明与 Swagger 文档

每个 Controller 方法用两行宏定义：
- `API_DEF_ENDPOINT_INFO_*`：生成 Swagger 文档元数据（标题、标签、响应类型、参数描述），仅在 Swagger 启动时调用一次
- `API_HANDLER_ENDPOINT_*`：生成路由绑定 + 参数解析 + 调用执行函数，每次请求时执行

两者用相同的方法名绑定，互不影响。参数注入有三种方式：动态可选查询（`QUERIES`）、固定参数（`QUERY`）、无参数（通过 `authObject` 获取登录信息）。

### 请求拦截器

三个拦截器形成处理链：`CrosRequestInterceptor`（CORS 预检 OPTIONS）→ `CheckRequestInterceptor`（Token 校验，白名单路径跳过）→ Controller → `CrosResponseInterceptor`（响应头注入 CORS）。

CORS 机制：浏览器的同源策略要求跨域请求先发 OPTIONS 预检，`CrosRequestInterceptor` 拦截 OPTIONS 直接返回 CORS 头，避免每个 Controller 都要处理。

### JWT 鉴权
`CustomerAuthorizeHandler` 继承 oatpp 的 `BearerAuthorizationHandler`，自动从 `Authorization: Bearer <token>` Header 提取 Token。验证使用 RSA 非对称签名（私钥签名生成 Token，公钥验证），`JU_VERIFY_CATCH` 宏将 5 种 JWT 异常转为业务错误码。

`API_ACCESS_DECLARE` 宏在 Controller 构造时自动调用 `setDefaultAuthorizationHandler`，所有需要鉴权的端点自动经过这个处理器。

### 统一错误处理
`ErrorHandler` 将所有异常统一为 JSON 格式响应。Token 错误返回 HTTP 200 + `RS_UNAUTHORIZED` 业务码（不返回 401），其他错误返回 HTTP 200 + `RS_SERVER_ERROR`。这样前端只需处理 HTTP 200 状态码。

### Controller 创建链路
`API_ACCESS_DECLARE` 宏展开后做三件事：构造函数从 IOC 获取 ObjectMapper、生成 `createShared()` 工厂方法、自动挂载 `CustomerAuthorizeHandler`。Router 调用 `createShared()` 创建实例 → `addController` 注册路由 → `getEndpoints` 收集 Swagger 端点信息。
**参数注入方式**：

| 宏                                   | 用途       | 参数来源                                                       |
| ----------------------------------- | -------- | ---------------------------------------------------------- |
| `API_HANDLER_ENDPOINT_QUERY_AUTH`   | 动态可选查询参数 | URL query 全部收入 → `QUERIES(QueryParams)` → 按 Query DTO 类型转换 |
| `API_HANDLER_ENDPOINT_AUTH`         | 固定参数     | 单个 query 参数，如 `QUERY(String, id)`                          |
| `API_HANDLER_ENDPOINT_NOPARAM_AUTH` | 无参数      | 通过 `authObject` 获取登录用户信息                                   |
### 完整请求生命周期
```
浏览器 GET /user/query-all?page=1&size=10
    → ConnectionProvider (TCP) → ConnectionHandler (HTTP解析)
    → RequestInterceptor (CORS → Token校验)
    ├─ CrosRequestInterceptor ← OPTIONS → 直接返回 CORS 头
	└─ CheckRequestInterceptor ← 有 token？没有就拦截
    → HttpRouter 查表 → ENDPOINT 方法 (自动注入参数) GET + /user/query-all → UserController::queryAllUser
    → Service 层 (业务编排 + DO→DTO)
    → DAO 层 (写SQL + Mapper映射)
    → Controller 返回 VO → ObjectMapper 序列化 JSON
    → ResponseInterceptor (加CORS头) → HTTP 响应
```

### UUID 与分布式 ID
128 位全局唯一 ID，格式如 `550e8400-e29b-41d4-a716-446655440000`。
- **v4（完全随机）**：依赖随机数生成器，本项目使用，`UuidFacade` 封装 `stduuid` 库生成
- **v7（时间戳+mac 地址）**：新版，可排序，但会暴露 mac 地址
- **v3/v5（基于符号名称和 MD5/SHA256 等算法计算）**: 实现较为复杂
- **和自增 ID 的关系**：UUID 在分布式系统中不冲突、不可猜测、离线可生成；代价是无序、128 位占用更多空间
项目中 `UserQuery.h` 的 Swagger 示例值 `"ae65c714d48d4f34b52479f5482c0edd"` 就是去掉连字符的 UUID。`lib-common` 中 `UuidFacade`（UUID）和 `SnowFlaker`（雪花算法）是两种分布式 ID 方案。
### SnowFlake 算法
[参考](https://cloud.tencent.com.cn/developer/article/2185662)，在 [[Sylar Backend Collection|sylar项目]]中也有用到
**Snowflake（雪花）算法**是 Twitter 开源的一种**分布式 ID 生成算法，它的核心目标是在高并发、分布式的系统环境中，生成**全局唯一**且**趋势递增**的 64 位长整型（Long）ID。
它生成的 ID 是一个 64 位的整数，其典型结构如下：
- **1 位符号位**：固定为 0，保证 ID 为正数。
- **41 位时间戳**：精确到毫秒级，可以使用约 69 年
- **10 位工作机器 ID**：用于区分不同节点，通常再分为 5 位数据中心 ID 和 5 位机器 ID，共支持最多 1024 个节点
- **12 位序列号**：在同一毫秒内，为不同 ID 提供序号，支持每节点每毫秒生成 4096 个 ID

| 特性        | UUID (如 v4)                                      | Snowflake                                                                              |
| :-------- | :----------------------------------------------- | :------------------------------------------------------------------------------------- |
| **ID 长度** | 128 位，通常表示为 36 位字符串                              | 64 位，一个 Long 型整数                                                                       |
| **是否有序**  | **无序**，插入数据库时可能导致页分裂，影响性能                        | **趋势递增**，对数据库索引非常友好                                                                    |
| **生成原理**  | 基于随机数或名字空间等，与外界无关                                | 强依赖**时间戳**和**机器 ID**的组合                                                                |
| **系统依赖**  | **无中心化**，任何机器可独立生成                               | **半中心化**，需提前分配唯一的机器 ID                                                                 |
| **主要弱点**  | 存储空间大，查询性能较差，无序                                  | **时钟回拨**问题可能导致 ID 重复或系统不可用                                                             |
| 适用场景      | 小规模系统，对 ID 无顺序要求，无需任何依赖，最为一次性请求的 id 身份验证，有时钟回拨情景 | 大规模分布式系统，性能要求高，ID 将用作**数据库主键**，且你关心**写入性能**和**索引效率**，需要 ID 本身**包含时间信息**，便于按时间排序或进行范围查询 |
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
#### Group 的作用
对于 producer，主要用于业务回查
Producer 发一条"半消息"（half message），先不投递，执行本地事务（如数据库操作），然后告诉 Broker "提交"或"回滚"：
```
Producer                    Broker
  │ 发送半消息               │
  │──────────────────────→  │  消息暂存，不投递
  │                         │
  │ 执行本地事务（数据库）     │
  │                         │
  │ 发送 commit/rollback    │
  │──────────────────────→  │  commit → 投递消息
  │                         │  rollback → 丢弃消息
```
问题：如果 Producer 在执行本地事务后、发送 commit 之前宕机了，Broker 不知道这条消息该提交还是回滚。这时 Broker 会主动回查——问 Producer "那条半消息的事务状态是什么？"，通过 Producer Group 找到该 Group 中的某个 Producer 实例来询问。同一 Group 的Producer 被视为"同一个事务参与者的不同实例"，Broker 可以询问任意一个
决定 commit/rollback 的是 Producer 自己实现的 `checkLocalTransaction()` 方法——它去检查本地数据库/缓存中的状态，判断事务是否成功

对于 Consumer ，用于负载均衡/分布式任务派发。典型场景：
```
Consumer Group: order-service（部署了 3 个实例）
├── Pod 1 (Consumer X)  ← 处理订单 1, 4, 7...
├── Pod 2 (Consumer Y)  ← 处理订单 2, 5, 8...
└── Pod 3 (Consumer Z)  ← 处理订单 3, 6, 9...
```
每条订单消息只被一个 Pod 消费，自动负载均衡。扩容时只需要加 Pod，不用改代码。这就是消息队列的核心价值之一——消费者水平扩展。
对于两者，给 Producer/Consumer 一个逻辑身份标识。Broker 根据 Group 来区分不同的 Producer/Consumer 实例
```
Consumer Group: order-service
  ├── Consumer X  ←──┐
  └── Consumer Y  ←──┤ 负载均衡：消息 1 给 X，消息 2 给 Y
                      │          每条消息只被一个消费者处理（通过setMessageModel(rocketmq::BROADCASTING) 控制）

Consumer Group: log-service
  ├── Consumer Z  ←── 消息 1 也给 Z，消息 2 也给 Z
                       │          不同 Group 之间互不影响
                       ↓          同一条消息被多个 Group 各自消费
```
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
#### 项目代码实现缺陷
发送不同的 topic 的信息时都需先清理上一个 DefaultMQProducer，再创建新的继续发送，如果发送消息的场景是不同的 topic 来回轮换会导致频繁的对象创建与销毁

解决方法是添加 Producer Pool，consumer 已经有 `vector<RConsumerListenter*>` 了，存储不同 topic，且由于业务场景中，topic 话题常常会变，而 listener 不会，所以 consumer 一般不会在接收 producer 消息后销毁重建
#### Consumer 和 Listener
观察者模式（Observer Pattern）：
```
RocketClient (被观察者)
  │ 持有 m_listeners 列表
  │ 持有 m_msgListener（RocketMQ SDK 的回调接口）
  │
  ├── addListener(listenerA)     ← 注册
  ├── addListener(listenerB)     ← 可以注册多个
  │
  └── 当消息到达时：
	  m_msgListener->consumeMessage(msgs)
		  ↓
		  for(auto listener : m_listeners) {
			  listener->receiveMessage(msg.getBody());  // 逐个通知
		  }
```
三层结构：
```
RocketMQ SDK  →  m_msgListener (RMessageLisenter)  →  你的 listener (RConsumerListener)
			  实现了 SDK 要求的接口你自己的业务逻辑
			  遍历所有 listener 并通知
```
RMessageLisenter 是适配器——它把 RocketMQ SDK 的 consumeMessage() 接口适配成项目自己的
receiveMessage() 接口。这样业务代码不需要直接依赖 RocketMQ SDK。
#### 消息队列框架对比
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

## 第5阶段：arch-demo — 分层架构实战

### 预处理器变参宏的二次展开技巧

arch-demo 的 `Macros.h` 里有一套看似无意义的"恒等宏" `ZO_STAR_EXPAND(x) x`，它真正的职责是**触发预处理器对参数的二次展开**。

C 预处理器有一条标准规则：当宏 A 的实参会被传给另一个使用 `#`（字符串化）或 `##`（粘合）操作的宏 B 时，这个实参在传给 B **之前不会被展开**。要让嵌套宏先展开一轮，就得在中间垫一层"什么都不做但会强制完全展开"的宏——这正是 `ZO_STAR_EXPAND` 的作用。它是 Boost.Preprocessor 里 `BOOST_PP_EXPAND` 的同款技巧，无逻辑、纯语法用途。

典型展开链路：
```
ZO_STAR_DOMAIN_DO_TO_DTO_1(target, src, id, Id, name, Name)
 → ZO_STAR_EXPAND(ZO_STAR_PASTE(target, src, FUNC, id, Id, name, Name))
 → ZO_STAR_EXPAND(ZO_STAR_GET_MACRO(..., PASTE02)(target, src, FUNC, ...))
 → ZO_STAR_EXPAND(PASTE02(target, src, FUNC, id, Id, name, Name))
 → FUNC(target, src, id, Id) FUNC(target, src, name, Name)
 → target->id = src->getId(); target->name = src->getName();
```
若去掉 `ZO_STAR_EXPAND`，`GET_MACRO` 选中的 `PASTE02` 这个宏名出现在 `##` 选择位上不会被二次展开，整条链路就停滞了。

### 用计数选择模拟变参循环

注释里说的"领域模型转换可变参展开"，本质是让一个宏接受**任意对数的字段**，自动为每对生成一行赋值语句，免去手写几十行 `target->f = src->getF();`。预处理器没有真正的 `for` 循环，作者用"计数选择 + 重载特化"伪造：

| 机制 | 作用 |
|------|------|
| `ZO_STAR_GET_MACRO(_1.._64, NAME, ...) NAME` | 数实参个数。把参数排成固定槽，最后一个槽位 `NAME` 被对应编号的 `PASTE0X` 宏名占住，从而选中处理"该对数"的特化宏 |
| `ZO_STAR_PASTE01..PASTE30` | 按字段对数重载的生成器，`PASTE02` 生成 2 行赋值，`PASTE05` 生成 5 行 |
| `PASTE0N` 内部递归 | `PASTE02 = PASTE01(第1对) PASTE01(第2对)`，避免每个特化都从头展开 |

不可读是因为预处理器必须为**每个可能的参数个数各写一个特化宏**再配一个选择器，无法像 C++11 变参模板那样直接。之所以仍用宏而非折叠表达式，是因为这里生成的是**语句**（要塞进函数体），模板折叠只能生成表达式。

`PASTEXX` 之间穿插的 `PASTE00`（空宏）是占位齐位符——字段成对传入（`id, Id` = 2 个参数），选择器每隔 2 格放一个真实 PASTE、中间垫空宏，对齐"每多一对多 2 参数"的节奏。

### DO↔DTO 转换宏的 `_1` 后缀区分值/指针语义

`ZO_STAR_DOMAIN_DO_TO_DTO` 和 `_DO_TO_DTO_1` 只差一个 `_1`，区分的是**源对象的访问方式**：

```cpp
// 无 _1：src 是栈上值对象，用 . 访问
#define ZO_STAR_DOMAIN_FILED_DO_TO_DTO(target, src, f1, f2)    target->f1 = src.get##f2();
// 带 _1：src 是智能指针/Wrapper，用 -> 访问
#define ZO_STAR_DOMAIN_FILED_DO_TO_DTO_1(target, src, f1, f2)  target->f1 = src->get##f2();
```

项目里 DO 基本都用 `shared_ptr` 包装（`PtrUserDO`、`std::list<PtrUserDO>`），所以业务代码几乎只见 `_1` 版本：
```cpp
// UserService.cpp —— one 是 list<PtrUserDO> 的元素（shared_ptr），用 ->
ZO_STAR_DOMAIN_DO_TO_DTO_1(user, one, id, Id, nickname, Nickname, ...);  // user->id = one->getId();
```
`DTO_TO_DO` 同理：`target` 是值 DO（`UserDO udo;`）用无 `_1` 版本（`target.set##f1`，且带 `if(src->f2)` 判空保护 `oatpp::Object` 的 nullable），`target` 是指针时用 `_1`。两个宏并存的唯一目的：同时支持"DO 用对象"和"DO 用指针"两种持有方式。

### oatpp 依赖注入：两个宏如何配合

`OATPP_CREATE_COMPONENT` 与 `OATPP_COMPONENT` 的关系不是"先声明后引用"的编译期绑定，而是**运行期通过全局注册表解耦**的依赖注入，类似 Spring 的 `@Bean` / `@Autowired`。

| 宏 | 展开 | 职责 |
|----|------|------|
| `OATPP_CREATE_COMPONENT(TYPE, NAME)` | `Component<TYPE> NAME = Component<TYPE>` | 构造时调 `Environment::registerComponent(typeid(T).name(), qualifier, &object)`，把对象指针登记进全局静态 `map` |
| `OATPP_COMPONENT(TYPE, NAME[, qualifier])` | `TYPE& NAME = *((TYPE*) Environment::getComponent(typeid(TYPE).name()))` | 运行时按 `type_info` 名到注册表查 |

因此 `OATPP_COMPONENT` 执行前**必须**有人 `OATPP_CREATE_COMPONENT` 登记过同类型，否则 `getComponent` 取空抛异常。但二者**不要求编在同一文件、也不要求物理上 CREATE 在前**——只要 `OATPP_COMPONENT` 被**执行**那一刻组件已登记即可。项目靠 `HttpServer::startServer` 的启动顺序保证：先在回调里 `make_shared<OtherComponent>()` 触发组件构造登记，Controller 才在后续被注入。`Environment::Component` 的析构函数对称地调 `unregisterComponent` 注销，所以组件生命周期与该 RAII 对象绑定。

### Component 级双括号构造的语法妥协

`OtherComponent.hpp` 里这段看起来陌生：
```cpp
OATPP_CREATE_COMPONENT(std::shared_ptr<ConnectionHandler>, websocketConnectionHandler)
("websocket", [] { auto h = ConnectionHandler::createShared();
                   h->setSocketInstanceListener(std::make_shared<WSInstanceListener>());
                   return h; }());
```
代入 `OATPP_CREATE_COMPONENT(TYPE, NAME) = Component<TYPE> NAME = Component<TYPE>`：
```cpp
Component<std::shared_ptr<ConnectionHandler>> websocketConnectionHandler = Component<std::shared_ptr<ConnectionHandler>>
("websocket", []{...}() );
```
所以第一行末尾的 `= Component<TYPE>` 是一个**临时对象**，紧接的 `("websocket", lambda())` 是**对这个临时对象调用构造函数**，匹配 `Environment::Component(const std::string& name, const T& object)`：
- 第1参数 `"websocket"` 是组件 qualifier 名——同名类型存在多个实例时用它区分，对应 `OATPP_COMPONENT(TYPE, NAME, "websocket")` 的第三参数
- 第2参数 `lambda()()` 是 lambda **立即执行**返回的 `shared_ptr`，即真正注入的对象；在 lambda 内就把 `WSInstanceListener` 挂好，保证任何地方取到的都是同一个配齐监听器的 handler

写成"先默认构造临时对象、下一行再调构造"这种怪样子，是因为 `OATPP_CREATE_COMPONENT` 的宏定义 `NAME = Component<TYPE>` 没有给构造参数留语法槽，作者只能靠"临时对象 + 构造调用"把参数接到下一行。语义等价于：
```cpp
Component<std::shared_ptr<ConnectionHandler>> websocketConnectionHandler("websocket", []{...}());
```
宏不支持这种带参 `=` 右值，才有此妥协。
