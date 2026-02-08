项目地址：(https://github.com/anarthal/servertech-chat.git)
# 完整运行流程
## 环境准备
### 工具安装
- g++版本更新到 11 以上，支持 C++17 标准（ubuntu 使用 `apt install` 即可）
- 安装编译 boost 库必须的开发套件包 `bashsudo apt install build-essential g++ python3-dev libicu-dev libbz2-dev wget`，其中 g++不会是最新的
- 在 [Boost 1.89.0](https://www.boost.org/releases/latest/) 中找到最新 boost 库，使用 `wget` 下载对应的包
	- `tar -xvf` 解压包
	- `cd` 后 `./bootstrap -prefix=/usr/local/boost_1.89.0` ，prefix 参数决定了后使用 `./b2 install` 会将 boost 库文件安装在什么位置
	- `./b2 install` 安装 boost 库
	- 检查 `ls -al /usr/local/boost_1.89.0` 中是否有 include 和 lib 文件夹，以及其中是否有大量的 `.hpp` 文件
- 在(https://cmake.org/files/v3.29/cmake-3.29.0.tar.gz) 中下载 cmake 构建工具
	- 解压，进入目录后使用 `./bootstrap -prefix=/usr/local/cmake_3.29.0 && make install` 编译cmake工具
- 将 `/usr/locate/boost_1.89.0` 和 `/usr/locate/cmake-3.29.0` 将两者添加到环境变量中 `export PATH=/usr/local/....:$PATH`
### 代码更新
- 项目使用boost 1.74，最新的 boost 1.89 已经将 `time.expires_from_now()` 舍弃，所以需要替换为 `time.expires_after()`，位置在 servertech-chat/server/src/services/mysql_client. cpp:182:23。
- 根据指引 pdf 中将 mysql 服务的账号密码设置正确
- 在本机的 redis.conf 文件中将 requirepass 设置为 `""` 空，项目只能接受密码为空值的 redis 服务，否则前端无法和后端交互
- 其 cmake 文件中引入的 charconv 库大小写有问题，并且没有通过 find_package 函数包含
```cmake
find_package(Boost REQUIRED COMPONENTS headers context json regex url)
# 改为
find_package(Boost REQUIRED COMPONENTS headers context json regex url charconv)
target_link_libraries(
    servertech_chat
    PUBLIC
	....
    ICU::uc
    # 原本是boost::charconv， 改为
    Boost::charconv
    pthread
)
```
- 在进入 serve 目录后使用
```bash
cmake . -DCMAKE_CXX_STANDARD=17 && make
```
出现 main 文件后继续按照指引即可
如果使用 `npm run dev` 出现缺少依赖的问题：
```bash
sickwag@VM-20-9-ubuntu:~/code_files/servertech-chat/client$ npm run dev
npm warn Unknown global config "--init.module". This will stop working in the next major version of npm.

> dev
> next dev

- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- info Loaded env from /home/sickwag/code_files/servertech-chat/client/.env.development
npm warn Unknown env config "_-init.module". This will stop working in the next major version of npm.
npm warn Unknown global config "--init.module". This will stop working in the next major version of npm.
- event compiled client and server successfully in 239 ms (18 modules)
- wait compiling...
- event compiled client and server successfully in 124 ms (18 modules)
(node:1219745) [DEP0060] DeprecationWarning: The `util._extend` API is deprecated. Please use Object.assign() instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
- wait compiling / (client and server)...
- error ./node_modules/@emotion/styled/base/dist/emotion-styled-base.browser.esm.js:4:0
Module not found: Can't resolve '@emotion/react'

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./node_modules/@emotion/styled/dist/emotion-styled.browser.esm.js
./node_modules/@mui/styled-engine/index.js
./node_modules/@mui/system/esm/index.js
./node_modules/@mui/material/styles/index.js
./node_modules/@mui/material/index.js
./pages/index.tsx
- wait compiling /_error (client and server)...
- error ./node_modules/@emotion/styled/base/dist/emotion-styled-base.browser.esm.js:4:0
Module not found: Can't resolve '@emotion/react'

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./node_modules/@emotion/styled/dist/emotion-styled.browser.esm.js
./node_modules/@mui/styled-engine/index.js
./node_modules/@mui/system/esm/index.js
./node_modules/@mui/material/styles/index.js
./node_modules/@mui/material/index.js
./pages/index.tsx
```
可以询问 ai 到底是哪一个模块缺少，然后将安装命令运行一次
如果
```bash
# 更新npm并设置更新源
npm config set registry https://registry.npmmirror.com
npm install -g npm@11.6.2 # 或者latest
# 然后安装包
```
# 代码分析（按文件）
## server
### src/util/cookie. cpp & include/util/cookie. hpp
#### http 响应格式
1. 什么是 HTTP
 HTTP (HyperText Transfer  Protocol)。它是互联网上应用最广泛的一种网络协议，用于从 Web  服务器传输超文本到本地浏览器。
HTTP 有一个非常重要的特性：**它是无状态的 (Stateless)**
想象一下你去银行办业务：
* 无状态：你每次去柜台，柜员都把你当成一个全新的客户。你第一次去取钱，第二次去存钱，每次柜 员都会问你“你是谁？你要办什么业务？”。他们不记得你上次来过。
* HTTP 也是如此：你的浏览器（客户端）向服务器发送一个请求（比如“给我首页”），服务器返回一个响应（首页的 HTML）。然后你点击一个链接（比如“查看我的订单”），浏览器又发送一个新请求。对于服务器来说，这两个请求是完全独立的，它**不知道这两个请求来自同一个用户**，**也不知道你刚刚才访问过首页**。

2. **什么是 HTTP 响应头？**
HTTP 通信由请求 (Request) 和响应 (Response) 组成。
* HTTP 请求：你的浏览器发送给服务器的信息。
* HTTP 响应：服务器返回给你的浏览器信息。

无论是请求还是响应，都包含两大部分：
* 头部 (Header)：包含关于请求或响应的元数据（即“关于数据的数据”）。就像你寄信的信封上写着 寄件人、收件人、邮票、以及“请勿折叠”等说明。
* 主体 (Body)：包含实际的数据内容。就像信封里的信纸内容。

HTTP 响应头就是服务器在返回数据给浏览器时，在实际数据（Body）之前发送的一些额外信息。这些信息告诉浏览器如何处理响应、响应的类型、服务器的信息等等。

例子：
当你访问一个网页时，服务器可能会返回这样的响应：

```
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Server: Nginx/1.18.0
Date: Wed, 27 Aug 2025 10:00:00 GMT
Content-Length: 12345

<!DOCTYPE html>
<html>
<head>...</head>
<body>...</body>
</html>
```
  其中 Content-Type: text/html; charset=UTF-8、Server: Nginx/1.18.0 等就是响应头。
3. **为什么需要 Set-Cookie？**

  由于 HTTP 的无状态性，服务器无法记住用户。但现代 Web 应用需要记住用户，比如：
   * 登录状态：用户登录一次后，不需要每次点击链接都重新输入账号密码。
   * 购物车：商品加入购物车后，即使刷新页面或访问其他页面，购物车内容也还在。
   * 个性化设置：记住用户的语言偏好、主题设置等。

  为了解决这个问题，引入了 Cookie。而 Set-Cookie
  就是服务器告诉浏览器“请你保存这些信息”的方式。

4. Set-Cookie 的工作原理是什么？
  Set-Cookie 是一个特殊的 HTTP 响应头。它的工作原理是：
   - 服务器发送 `Set-Cookie`：当服务器希望浏览器保存一些信息时（例如用户登录成功后），它会在HTTP 响应中添加一个 Set-Cookie 头。
   - 浏览器保存 Cookie：浏览器收到 Set-Cookie头后，会根据其中的指示，将这些信息（Cookie）存储在本地。
   - 浏览器自动发送 `Cookie`：在后续的每次请求中，只要请求的 URL 符合 Cookie的域和路径等条件，浏览器都会自动将之前保存的 Cookie 信息放在 Cookie请求头中发送给服务器。
   - 服务器识别用户：服务器收到 Cookie 请求头后，就能从中读取信息，从而识别出是哪个用户发来的请求，并根据这些信息来维护用户的状态。
4. 什么是 HTTP 规范的 Set-Cookie 字符串，为什么需要它？

  Set-Cookie 字符串不是随便写的，它必须遵循 HTTP 规范（RFC 6265）。这个规范定义了 Cookie  的格式和各种属性，以确保 Cookie  能够被所有浏览器和服务器正确地理解和处理，并且具有一定的安全性。

  一个规范的 Set-Cookie 字符串看起来像这样：
```
  Set-Cookie: name=value; Expires=Wed, 27 Aug 2025 10:00:00 GMT; HttpOnly; Secure; SameSite=Lax; Path=/
```

* `name=value`：这是 Cookie 最核心的部分，一个键值对。例如 sid=随机字符串，sid 是会话 ID 的名称，随机字符串是它的值。
* `Expires` 或 `Max-Age`：定义 Cookie 的过期时间。过期后浏览器会自动删除它。
* `Domain`：指定哪些域名可以接收这个 Cookie。
* `Path`：指定哪些路径下的请求会发送这个 Cookie。
* `HttpOnly`：重要安全属性。如果设置了这个属性，客户端的 JavaScript 就无法通过 document. cookie 等方式访问这个 Cookie。这可以有效防止跨站脚本攻击 (XSS) 窃取 Cookie。
* `Secure`：重要安全属性。如果设置了这个属性，Cookie 只会在 HTTPS 连接中发送。
* `SameSite`：重要安全属性。用于防止跨站请求伪造 (CSRF) 攻击。它有 Strict、Lax 和 None 几个值，控制浏览器在跨站请求时是否发送 Cookie。
为什么需要它？
* 互操作性：确保所有符合标准的浏览器和服务器都能正确地发送、接收和处理 Cookie。
* 安全性：通过 HttpOnly、Secure、SameSite 等属性，可以大大降低 Cookie 被窃取或滥用的风险。
6. 网络通信为什么需要它？
     Set-Cookie 和 Cookie 机制是 Web 应用中实现用户状态管理的基石。没有它，每次用户点页面，  服务器都不知道你是谁，你就无法保持登录状态，无法使用购物车，无法享受个性化服务。它弥补了  HTTP 无状态的缺陷，使得复杂的 Web 应用成为可能。
#### 检查字符是否合法--查找表方法
```cpp
// 判断字符是否为 HTTP token 的有效字符 (RFC2616/RFC7230)。Cookie 名必须是有效的 token。
static bool is_token_char(char c) noexcept {
    static char constexpr tab[] = {
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
    return tab[static_cast<unsigned char>(c)];
}

// 判断字符是否为 cookie 值的有效字符 (RFC6265)。
static bool is_cookie_value_char(char c) noexcept {
    static char constexpr tab[] = {
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
    return tab[static_cast<unsigned char>(c)];
}
```
这两个函数中使用了 `static char constexpr tab[]` 查找表，这是一种**提高性能的做法**，由于合法的 HTTP token 和 cookie-value 字段只能是 **ASCII 字符中的英文字母**。
tab 表是一个 256 字节的表，其中中为 1 的位置表示 ascii 表中这个位置的字符是可用的。
CPU 缓存友好，程序需要判断一个字符时，它只需要将字符的 ASCII值作为索引去访问 tab 数组相应位置，即可得到他是否是合法的。
常规写法 `if(c >= 'a' && c <= 'z' || c >='A' && c <= 'Z'))` 中 if 分支会因为 CPU 分支预测，缓存未命中带来性能损失。
查找表在**未出现溢出错误**的情况下没有分支，速度极快。

#### 低内聚，高耦合--精简头文件内容
除非是编写纯头文件库，否则建议将一个文件中函数/变量定义和实现分开。
但是也不是源文件中的所有函数/变量都需要在头文件中对应，如果头文件的某些函数实现需要很多工具函数辅助，但是他们只会帮助头文件中函数的实现，而对外部没有帮助，这时候就可以**不必将他们在头文件中声明，而在 cpp 文件中写入定义+声明**。
- 减少头文件 include 的成本，代码复制也是时间
- 他们不在其他文件使用，**如果考虑可能有命名污染还可以用匿名命名空间包裹**
- 如果他们被频繁使用但是作用于局限于当前文件，考虑使用 `static const` 修饰
#### 零拷贝 cookie 解析器
cookie_list 类是一个零拷贝（Zero-Copy）的解析器，用于解析客户端发送的 `Cookie`   请求头字符串。它的主要目的是高效地从一个长字符串中提取出所有的 Cookie 名称-值对，而无需进行额外的内存分配和字符串复制。
其中的响应头解析使用的字符串是 `const char*` 类型了，所有的工具函数都是用了指针运算加快速度，可能会有点晕。本质上是：
将 http 响应头放入构造函数中，就够造了一个可迭代对象，每次迭代返回头中的一个键值对
```cpp
chat::cookie_list cookies(raw_cookie_header);
// 2. 遍历 cookie_list 来查找特定的 Cookie
std::string_view sessionId;
for (const auto& cookie_pair : cookies) { // 范围 for 循环，每次迭代得到一个
cookie_pair
 // 第一次迭代：cookie_pair.name = "sid", cookie_pair.value = "abc123xyz"
 // 第二次迭代：cookie_pair.name = "theme", cookie_pair.value = "dark"
 // 第三次迭代：cookie_pair.name = "lang", cookie_pair.value = "en"
 if (cookie_pair.name == "sid") {
	 sessionId = cookie_pair.value; // 提取 sid 的值
	 break; // 找到后就可以停止迭代了
 }
}
```
### src/util/email. cpp & include/util/email. hpp
email. cpp 及其头文件的功能是否是我理解诶的那样：
1. is_email 函数用来判断一个电子邮件地址字符串是否符合合法的电子邮件格式，由于电子邮件地址中可能包含 Unicode 字符
2. 而标准库中的 regex 不支持，所以这里使用了 `boost:: make_u32regex` 函数来构建一个能够匹配含有 Unicode 字符的电子邮件地址正则表达式对象
### src/util/scrypt. cpp & include/util/scrypt. hpp
#### 函数工作原理
- `scrypt_generate_hash` 的工作原理：
  `scrypt_generate_hash` 函数接收用户输入的明文密码字符串 (passwd)、一个随机生成的盐值 (salt) 和 scrypt 算法的参数 (params)。它通过调用底层的 OpenSSL 库，执行 scrypt算法，计算出一个固定大小的哈希值。这个哈希值是一个**二进制数据块(blob)**，存储在 `std::array<unsigned char, hash_size>` 中
-  `scrypt_phc_parse` 的作用:
	- **函数的作用绝不是将哈希值“解码”回原始密码。密码哈希是不可逆的。**
	-  1. 它接收一个 PHC 格式的字符串（例如`$scrypt$ ln=14, r=8, p=1 $somesalt$ somehash`）。这个字符串是服务器在用户注册时，将 scrypt算法的参数、随机盐值和计算出的哈希值序列化后存储在数据库中的。
       2. 它的任务是解析这个 PHC 字符串，从中提取出 scrypt 算法的参数          (scrypt_params)、原始的盐值 (salt) 和原始的哈希值 (hash)。
       3. 它将这些提取出来的信息封装到 scrypt_data 结构体中返回。
#### 密码加密&匹配原理
 由于密码哈希是单向的，我们无法从哈希值还原出原始密码。那么，当用户尝试登录时，我们如何验证他们输入的密码是否正确？
1. 用户输入密码：用户在登录界面输入一个候选密码。
2. 服务器获取存储的哈希信息：服务器从数据库中获取该用户注册时存储的 PHC 格式的哈希字符串。
3. 解析存储的哈希信息：调用 `scrypt_phc_parse` 函数，将数据库中存储的 PHC 字符串解析，提取出原始的 scrypt 参数、盐值和存储的哈希值。
4. 重新计算哈希：调用 `scrypt_generate_hash` 函数，使用用户本次输入的候选密码、从数据库中提取出的盐值和提取出的参数，重新计算一个新的哈希值。
5. 比较哈希值：使用 time_safe_equals 函数（一个防止时序攻击的安全比较函数），将新计算出的哈希值与从数据库中提取出的存储哈希值进行比较。
6. 判断密码是否正确：
   * 如果两个哈希值完全匹配，则说明用户输入的候选密码是正确的。
   * 如果两个哈希值不匹配，则说明用户输入的密码是错误的。
### src/error. cpp & include/error.hpp
#### 问题
- 为什么 `to_string` 和 `chat_category` 对象 `cat` 要放在匿名命名空间中？
  匿名命名空间（`namespace { ... }`）的作用是**将符号（函数、变量等）限制在当前编译单元（Translation Unit）内**，相当于C语言中的 `static` 修饰符，避免全局命名冲突。
	- `to_string` 是一个辅助函数，仅在 `chat_category::message(int)` 中被调用，不需要暴露给外部代码。
	- `chat_category cat` 是单例对象，用于注册错误类别，外部无需直接访问它。
	- 如果放在匿名命名空间外，可能会造成**符号污染**或与其他模块的同名符号冲突。
- `chat_category` 必须继承 `boost::system::error_category`？
	- Boost.Asio 和 Boost.Redis 等库依赖 Boost.System 的错误处理机制。自定义类别需与之兼容。
	- 自定义的错误类如果继承了 `boost::system::error_category`，他就可以隐式转换为这种类型，前提是 public 继承。参考 [[C++ Basics#继承#不同访问修饰符继承]]
	- 如果使用了自定义类并且继承自 `boost::system::error_category`，就必须要在 boost:: system 命名空间中创建一个特化模板，它的格式为：
```cpp
template <>
struct is_error_code_enum<chat::errc> {
   static constexpr bool value = true;
};
```
模板类型名称一定要为 `struct is_error_code_enum`，才能够将 `chat::errc` 中的错误类型假入 boost:: system 管理。
#### 整体结构
1. error. hpp 中定义 enum class errc 定义所有可能出现的错误，error. cpp 中使用 `BOOST_DESCIBE_ENUM` 描述 to_string 后的信息。
2. to_string 创建转换规则，将 `char::ec`；类型对应的 BOOST_DESCIBE_ENUM 类型对应，转换为对应字符串。和 chat_category 将自定义错误注册让 boost:: system 来管理。to_strng 名为了避免冲突，并且他只服务于 chat_category 中，所以放在匿名 namespace 中。
3. 注册还有一个步骤是在 boost:: system 中创建一个特化模板(is_error_code_num)，表示 chat:: errc 已经是其中一员。
4. 两个宏定义让外部**需要返回 error_code 类型的函数**使用他们时，传入错误，即可创建附带位置的 error_code 对象直接中断函数，return 出现的错误。如果
5. 所有的错误**日志输出**都需要通过 log_error 函数处理
```mermaid
graph TD
    A[创建 error_code] --> B{是否需要记录日志？}
    B -->|是| C[调用 log_error]
    B -->|否| D[传递 error_code 供后续处理]
    C --> E[控制台输出错误信息]
```
可以看到 src/listen. cpp 中，accept_loop 函数中，返回值为 void，代码中就使用：
```cpp
if (ec)
    return chat::log_error(ec, "accept");
```
在 src/api/aip_types. cpp 的 parse_client_event 函数中，大量直接使用宏的场景
```cpp
chat::any_client_event chat::parse_client_event(std::string_view from) {
    error_code ec;

    // Parse the JSON
    auto msg = boost::json::parse(from, ec);
    if (ec)
        CHAT_RETURN_ERROR(ec)
    // 其他代码
}
```
其返回值为：
```cpp
using any_client_event = boost::variant2::variant<
    error_code,  // Invalid, used to report errors
    client_messages_event,
    request_room_history_event>;
```