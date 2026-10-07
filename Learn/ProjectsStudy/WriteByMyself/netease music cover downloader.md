---
source: https://github.com/sickwag/netease_music_cover_downloader
created: 2025年10月4日16:49:16
---
# cover_downloader. cpp
## 网络请求发送部分
### http 和 htttps 分流
首先解析 http 或者 https 链接中主机地址和文件路径
```cpp
std::string host, path;
bool is_https = false;
if (url.substr(0, 8) == "https://") {
    is_https = true;
    host = url.substr(8);
    size_t pos = host.find('/');
    if (pos != std::string::npos) {
        path = host.substr(pos);
        host = host.substr(0, pos);
    } else {
        path = "/";
    }
} else if (url.substr(0, 7) == "http://") {
    host = url.substr(7);
    size_t pos = host.find('/');
    if (pos != std::string::npos) {
        path = host.substr(pos);
        host = host.substr(0, pos);
    } else {
        path = "/";
    }
} else {
    return std::vector<char>(); // Return empty vector to indicate error
}

// 还可以使用更方便的解析方法（boost::url）
std::pair<std::string, std::string> parse_url(const std::string& url) {
	std::string host, path;
	urls::url_view uv = urls::parse_uri(url).value();
	host = uv.host();
	path = uv.path();
	return {host, path};
}
```
然后如果是 https，[[零碎但需要知道的#http和https协议区别#1. SSL/TLS 加密 (安全性)|就需要进行 ssl/tsl 验证]]，这也是为什么需要在这里区分，验证部分在 for 循环中执行
### ssl 验证逻辑
```cpp
ssl::context ctx{ssl::context::tlsv12_client};
ctx.set_verify_mode(ssl::verify_none); // In a real application, set appropriate verification
```
1. 首先在 ssl_context 外部（生命周期长于 ssl_context）创建全局 io_context 管理所有的 io 操作，所有的 DNS 解析（`tcp::resolver`），tcp 流接受（`tcp_stream`）都需要这个 io_context 对象来管理，统一调度执行。
2. 所以 `tcp::resolver` 这些对象创建时需要初始化，将 ioc 对象传入
3. 如果是 https 则在循环中执行 ssl 验证：

> SSL Context (上下文) 就像一个"配置包"，**包含了建立 SSL连接所需要的所有设置和参数**。你可以把它想象成一个"工具箱"，里面装着：
> - 支持的加密算法
> - 证书验证规则
> - 安全协议版本
> - 其他 SSL/TLS 参数
> 参数 `ssl::context::tlsv12_client` 的含义：
> - tlsv12：指定使用 TLS 1.2 协议（Transport Layer Security，传输层安全协议）
> - client：表明这是客户端模式（与服务器模式相对）
>
> **为什么要创建 SSL Context？**
> - SSL 连接不是简单的"开/关"操作，需要很多配置参数
> - 不同的应用可能需要不同的安全级别和配置
> - Context 集中管理所有这些配置，便于复用和管理
> **设置验证模式**
> 当程序连接到服务器时，服务器会提供一个"数字证书"，**证明它确实是它声称的那个网站。证书验证就是检查这个证书是否真实有效**。
> 项目中使用了 `verify_none` 是由于这个功能比较简单，没有那么多复杂的功能，省去验证证书带来的各种网络，验证是否过期的问题
> **`ssl::verify_none` 的含义：**
> - 不验证服务器的证书
> - 任何证书都被接受
> - 可以使用 `ssl::verify_peer` 设置验证服务器证书
> - 使用 `ctx.set_verify_callback(ssl::rfc2818_verification("music.163.com"));` 验证证书颁发机构，但一般没有必要

### SSL 验证步骤
1. 获取 IP 地址和端口 `tcp::resolover resolver{ioc};`
2. 解析这个域名下的所有 IP 地址，一个域名可能有多个 ip，results 是 `boost::asio::ip::basic_resolver_results<boost::asio::ip::tcp>` 类型，存储当前域名（host 参数）下的所有 IP 地址
3. 建立 tcp/ip 管道，所有的数据都将通过这个管道传输
```cpp
tcp::resolver resolver{ioc};
auto const results = resolver.resolve(host, "443");

beast::tcp_stream stream{ioc};
beast::get_lowest_layer(stream).connect(results);
```
创建完 tcp 流对象用来处理 tcp 通信，然后就需要告知 tcp 需要和哪一个对象通信，即使用 `get_lowest_layer` 获得最底层的 tcp 连接句柄（因选择了 https 连接协议，ssl 协议建立在 tcp 协议之上，所以会被 ssl 包装，如果不使用 `get_lowest_layer` 则会将 ssl 协议连接到 IP 地址服务器上），将他连接到 result 所指向的 ip 地址的服务器中
```cpp
beast::ssl_stream<beast::tcp_stream&> ssl_stream{stream, ctx};

// 设置sni字段，在tcp流中设置了sni字段验证，就需要提供主机名
if (!SSL_set_tlsext_host_name(stream->native_handle(), host.c_str())) {
    beast::error_code ec{static_cast<int>(::ERR_get_error()), asio::error::get_ssl_category()};
    throw beast::system_error{ec};
}
```
4. 创建 ssl 流包装对象用来操作 ssl，进行 ssl 验证。由于 ssl 建立在 tcp 之上，所以创建的 ssl_stream 对象必须要参考 stream 对象，并通过 ssl 的上下文 ctx 对象才能创建。
	- `beast::tcp_stream&` - 表明 ssl_stream 将包装一个 tcp_stream 的引用
	- stream - 已经建立的 TCP 连接
	- ctx - 之前创建的 SSL 配置上下文
5.  由于一个 ip 地址服务器可能托管多个域名，所以需要设置 sni **拓展**
	- 设置 SNI 扩展，告诉服务器你想要连接的具体域名
	- 服务器需要知道你实际想访问哪个网站，好返回正确的证书
	- `native_handle()` 获取底层 OpenSSL 的句柄进行直接操作
6. 最后执行 tcp/ip 协议的经典三次握手协议，程序是服务端，所以协议执行 client 模式 `ssl_stream.handshake(ssl::stream_base::client)`

### 总结连接过程
全过程：
1. DNS 解析：就像查电话簿找到对方的电话号码
2. TCP 连接：就像拨通电话建立通话连接
3. SSL 包装：就像决定使用加密电话，双方需要协商加密密钥，使用特制的加密电话
4. SNI 设置：就像在公司总机电话中说明你要找哪个分机

为什么要这样做？
- 在 HTTPS 中，SSL 层是建立在 TCP 层之上的
- 必须先建立 TCP 连接，然后才能进行 SSL 握手
- `get_lowest_layer` 就是为了访问底层的 TCP 连接，获取一个对象的"最底层"（物理层）连接
- 在 SSL 情况下，可能有多层包装（SSL 层包装 TCP 层）
- 通过 `get_lowest_layer(stream)`，我们获取到最底层的 TCP 连接
- 然后调用 `.connect(results)` 来建立实际的 TCP 连接
