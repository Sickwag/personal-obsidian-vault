---
crea: 2025年11月6日14:30:28
---
# 基本网络编程知识
## 网络请求分类
### POST
本质是一段 http 文本，包含请求头和请求体部分，数据包含在请求头内容中，目的是**根据这些数据获取另一些数据**，通常这些数据比较大并且复杂，需要高级语言来解析这些数据结构
用于处理变更，请求体中内容被服务器端解析，**根据解析结果在服务器端进行对应的操作**，再将操作结果发送回来。发送重复的 post 消息可能会造成不同的结果，因执行了重复的操作
post**仅仅只是数据不在链接中明文传输，数据包如果不加密仍不安全**

### GET
#### 本质理解
本质**只是一段 url 地址**，代码中构建过程也只是构建一个url链接，只需要知道host地址，资源文件地址和需要传入的参数即可。访问这个地址会让服务器解析地址中中指明的资源地址，服务器访问对应位置的资源，根据URL参数处理，比如查询字符串（`?page=1&sort=name`）作为**过滤或补充信息**，再将**处理后的查询结果返回给客户端** ^x43n1d
```http
GET /api/products?category=electronics&minPrice=500 HTTP/1.1
```
服务器：定位到 `/api/products` 资源集 → 应用 `category=electronics` 和 `minPrice=500` 过滤 → 返回过滤后的产品列表。
严格的 GET 命令重复执行**的结果是相同的**，并且**没有写入操作**，但技术上来说**也可以通过 url 中参数实现修改数据**，但不建议这样做
#### 适用场景和注意事项
- 操作是**幂等**的（重复执行结果相同）
- 只是**读取或查询**数据
- 希望响应**被缓存**
- `Content-Type` 是必须的，告诉服务器如何解析请求体，`Content-Length` 通常自动计算
- 参数较少且非敏感（适合放URL中，通常不能超过 2048 个字符）
- 不能有空格，需要进行 url 编码 `"?name=John Doe&city=New York"` 需要被编码为：`?name=John%20Doe&city=New%20York"`

# 简单网络请求

## 静态 html 源代码获取
参考教程： https://www.bilibili.com/video/BV11HsqzFEUN/?spm_id_from=333.1387.favlist.content.click&vd_source=876be08bc9c030f4a9ea1fb97e0d0342
### curl 实现版本
#### 获取 html 源码
```cpp
#include <fstream>
#include <curl/curl.h>
#include <iostream>
#include <string>

size_t write_callback(char* ptr, size_t size, size_t nmemb, void* userdata) {
    size_t real_size = size * nmemb;
    // std::cout.write(ptr, real_size);
    // std::cout << std::endl;

    std::ofstream* file = static_cast<std::ofstream*>(userdata);
    file->write(ptr, real_size);
    return real_size;
}

int main(int, char**) {
    curl_global_init(CURL_GLOBAL_DEFAULT);
    CURL* curl = curl_easy_init();
    if (!curl) {
        std::cout << "curl init failed.\n";
        curl_easy_cleanup(curl);
        curl_global_cleanup();
        return -1;
    }
    const std::string web_site_url = "https://book.douban.com/series/697";

    std::ofstream outputfile("output.html", std::ios::binary);
    if(!outputfile.is_open()){
        std::cout << "failed to open output file.\n";
        curl_easy_cleanup(curl);
        curl_global_cleanup();
        return -1;
    }

    curl_easy_setopt(curl, CURLOPT_URL, web_site_url.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &outputfile);

    if (web_site_url.starts_with("https")) {
        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 1L);  // 要求服务器发证书
        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 1L);  // 验证服务器发送的证书
    }

    auto ec = curl_easy_perform(curl);
    if (ec != CURLE_OK) {
        std::cout << "curl easy perform failed: " << curl_easy_strerror(ec) << '\n';
    } else {
        std::cout << "curl perform done\n";
    }

    curl_global_cleanup();
    return 0;
}
```
其中 `curl_easy_setopt` 用于设置参数，对应参数使用 CURLOPT 开头的宏来设置
对于写入函数，使用 `curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);`，其中 write_callback 函数可以在官网查阅到它的签名是固定的 `size_t write_callback(char* ptr, size_t size, size_t nmemb, void* userdata) `，参数 userdata 用来控制写入内容的位置和方式，设置他也需要使用 setopt

如果一些网站即使这样做了也没法获取到 html 源码，则有可能是服务器强制要求要验证 CA 证书，这时候需要到 CA 证书官方颁布机构中下载最新的 pem 密钥文件，然后在 curl_easy_preform 函数之前使用：
```cpp
curl_easy_setopt(curl, CURLOPT_CAINFO, "path/to/pem/file");
```
如果有些网站需要验证客户端身份，可以用浏览器先访问一下，然后使用浏览器默认身份（当然也可以自定义）, 所有的 http 请求头都需要**合并为一个字符串后传入**
![[PixPin_2025-11-06_14-37-12.png]]
```cpp
std::string user_agent = "User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0"
std::string referer = "Referer:https://www.douban.com/";

curl_easy_setopt(curl, CURLOPT_HEADER, (user_agent + "\r\n" + referer).c_str());
```
或者统一设置：
```cpp
headers = curl_slist_append(headers, "Referer:https://www.douban.com");
headers = curl_slist_append(headers, "User - Agent : Mozilla / 5.0(Windows NT 10.0; Win64; x64)AppleWebKit / 537.36(KHTML, like Gecko)Chrome / 141.0.0.0 Safari / 537.36 Edg / 141.0.0.0 ");
curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
curl_slist_free_all(headers);  // 不是必要，但最好记得
```
添加 user_agent 请求头后服务器的 html 返回结果也会包含请求头
![[PixPin_2025-11-06_14-48-13.png]]
可以通过 curl 内置内容来分开获取
```cpp
auto ec = curl_easy_perform(curl);
if (ec != CURLE_OK) {
    std::cout << "curl easy perform failed: " << curl_easy_strerror(ec) << '\n';
} else {
    std::cout << "Download completed!\n";

    // 使用libcurl内置函数获取响应信息
    long response_code;
    double total_time;
    char* content_type = nullptr;
    long redirect_count;

    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &response_code);
    curl_easy_getinfo(curl, CURLINFO_TOTAL_TIME, &total_time);
    curl_easy_getinfo(curl, CURLINFO_CONTENT_TYPE, &content_type);
    curl_easy_getinfo(curl, CURLINFO_REDIRECT_COUNT, &redirect_count);

    std::cout << "\n=== Response Information ===\n";
    std::cout << "Status Code: " << response_code << "\n";
    std::cout << "Total Time: " << total_time << " seconds\n";
    std::cout << "Content Type: " << (content_type ? content_type : "Unknown") << "\n";
    std::cout << "Redirect Count: " << redirect_count << "\n";

    // 检查HTTP状态
    if (response_code == 200) {
        std::cout << "✓ Request successful!\n";
    } else {
        std::cout << "✗ Request failed with status: " << response_code << "\n";
    }
}
```
#### html 源码解析
需要用到另一个库 pugixml，这个库**只能解析 xml，如果手动将 html 中单标签，特殊语法使其成为一个符合 xml 格式的文档并在 pugi 解析选项中使用宽松解析**，也可以用来解析 xml
具体代码参考：[[C++ Code Snippets#html/xml 解析#pugixml 解析]]

### Qt 实现版本
使用 qt 网络模块可以参考 [[QT6开发指南#网络#基于 HTTP 的网络应用程序]]
#### 代码实现
具有完成错误处理和异步调用网络请求功能，还能获取资源下载进度
```cpp
// .h
#ifndef WEBPAGEFETCH_H
#define WEBPAGEFETCH_H

#include <QObject>
#include <qnetworkaccessmanager.h>
#include <qnetworkreply.h>
#include <QScopedPointer>

class WebPageFetch : public QObject
{
    Q_OBJECT
public:
    explicit WebPageFetch(QObject *parent = nullptr);
    ~WebPageFetch();

    void fetch(const QUrl &url, int timeout = 10000);
    QString fetchSync(const QUrl &url, int timeout = 100000);

private:
    void setProxy(const QString& host, quint16 port, const QString& username = QString(), const QString& password = QString());

    QScopedPointer<QNetworkAccessManager> manager;
    QNetworkReply *currentReply;
    int m_timeout;

signals:
    void finished(const QString &html);
    void error(const QString &errorMessage);
    void progress(qint64 byteReceived, qint64 byteTotal);

private slots:
    void onReplyFinished();
    void onError(QNetworkReply::NetworkError code);
    void onDownloadProgress(qint64 bytesRecord, qint64 byteTotal);
};

#endif // WEBPAGEFETCH_H

// .cpp
#include "webpagefetch.h"

#include <QEventLoop>
#include <QNetworkProxy>
#include <QTimer>
#include <QSslSocket>

WebPageFetch::WebPageFetch(QObject *parent)
    : QObject{parent}, manager(new QNetworkAccessManager(this)), currentReply(nullptr), m_timeout(10000)
{
    // 设置支持SSL
    if (!QSslSocket::supportsSsl()) {
        qWarning() << "SSL is not supported on this platform.";
    }
}

WebPageFetch::~WebPageFetch()
{
    if(currentReply){
        currentReply->abort();
        currentReply->deleteLater();
    }
}

void WebPageFetch::fetch(const QUrl &url, int timeout)
{
    this->m_timeout = timeout;
    if(currentReply){
        currentReply->abort();
        currentReply->deleteLater();
    }
    QNetworkRequest request(url);
    request.setRawHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                                       "Chrome/91.0.4472.124 Safari/537.36");
    request.setRawHeader("Accept", "text/html,application/xhtml+xml,application/xml;"
                                   "q=0.9,image/webp,*/*;q=0.8");
    request.setRawHeader("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8");

    if(url.toString().startsWith("https")){
        QSslConfiguration sslConfig = request.sslConfiguration();
        sslConfig.setProtocol(QSsl::TlsV1_2);
        request.setSslConfiguration(sslConfig);
    }
    currentReply = manager->get(request);

    connect(currentReply, &QNetworkReply::finished, this, &WebPageFetch::onReplyFinished);
    connect(currentReply, &QNetworkReply::errorOccurred, this, &WebPageFetch::onError);
    connect(currentReply, &QNetworkReply::downloadProgress, this,  &WebPageFetch::onDownloadProgress);

    QTimer::singleShot(timeout, [this](){
        if(currentReply && currentReply->isRunning()){
            currentReply->abort();
            emit error("request timout");
        }
    });
}

QString WebPageFetch::fetchSync(const QUrl &url, int timeout)
{
    QEventLoop loop;
    QString result;

    QTimer timer;
    timer.setSingleShot(true);
    this->fetch(url, timeout);
    connect(this, &WebPageFetch::finished, [&loop, &result](const QString &html){
        result = html;
        loop.quit();
    });
    connect(this, &WebPageFetch::error, [&loop](const QString &error){
        qDebug() << "fetch error: " << error;
        loop.quit();
    });
    timer.start(timeout + 1000);
    loop.exec();
    return result;
}

QString WebPageFetch::getHtml()
{
    return m_html;
}

void WebPageFetch::setProxy(const QString &host, quint16 port, const QString &username, const QString &password)
{
    QNetworkProxy proxy;
    proxy.setType(QNetworkProxy::HttpProxy);
    proxy.setHostName(host);
    proxy.setPort(port);
    if(!username.isEmpty() && !password.isEmpty()){
        proxy.setUser(username);
        proxy.setPassword(password);
    }
    QNetworkProxy::setApplicationProxy(proxy);
}

void WebPageFetch::onReplyFinished()
{
    if(!currentReply) return;

    if(currentReply->error() == QNetworkReply::NoError){
        QByteArray data = currentReply->readAll();
        QString html = QString::fromUtf8(data);
        m_html = html;
        currentReply->deleteLater();
        currentReply = nullptr;
        emit finished(html); // 发出完成信号
    } else {
        currentReply->deleteLater();
        currentReply = nullptr;
        emit error("Network error occurred"); // 发出错误信号
    }
}

void WebPageFetch::onError(QNetworkReply::NetworkError code)
{
    Q_UNUSED(code);
    if(currentReply){
        emit error(currentReply->errorString());
        currentReply->deleteLater();
        currentReply = nullptr;
    }
}

void WebPageFetch::onDownloadProgress(qint64 bytesRecord, qint64 byteTotal)
{
    emit progress(bytesRecord, byteTotal);
}
```
这一版本实现较为简单，qt 框架比较成熟
#### 代码实现中使用到的类
QNetworkRequest - 网络请求容器，专门用来处理网络请求的类，可以用来设置网页链接网址，设置html请求头，设置必要的网络连接目标信息，常用功能：
```cpp
QNetworkRequest request(QUrl("https://www.example.com"));

// 主要功能：
// 1. 设置URL
request.setUrl(QUrl("https://api.example.com/data"));

// 2. 设置请求头（HTTP headers）
request.setHeader(QNetworkRequest::UserAgentHeader, "MyApp/1.0");
request.setRawHeader("Authorization", "Bearer token123");
request.setRawHeader("Content-Type", "application/json");

// 3. 设置属性（attributes）
request.setAttribute(QNetworkRequest::FollowRedirectsAttribute, true);  // 跟随重定向
request.setAttribute(QNetworkRequest::Http2AllowedAttribute, true);     // 允许HTTP/2

// 4. 优先级设置
request.setPriority(QNetworkRequest::HighPriority);

// 5. SSL配置（用于HTTPS）
QSslConfiguration sslConfig = request.sslConfiguration();
sslConfig.setProtocol(QSsl::TlsV1_2);
request.setSslConfiguration(sslConfig);
```
QNetworkAccessManager - 网络访问管理器
用于执行网络请求，执行各种动作（比如发送已经设置好的请求头）的类，用于中央调度，设置代理，调整连接参数，错误处理
```cpp
QNetworkAccessManager manager;

// 它负责：
// 1. 发送各种类型的请求
QNetworkReply* getReply = manager.get(request);      // GET请求
QNetworkReply* postReply = manager.post(request, data);  // POST请求
QNetworkReply* putReply = manager.put(request, data);    // PUT请求
QNetworkReply* deleteReply = manager.deleteResource(request); // DELETE请求

// 2. 管理网络配置
manager.setProxy(proxy);      // 设置代理
manager.setCookieJar(cookieJar);  // 设置Cookie管理

// 3. 提供身份验证支持
connect(&manager, &QNetworkAccessManager::authenticationRequired,
        [](QNetworkReply *reply, QAuthenticator *authenticator) {
            authenticator->setUser("username");
            authenticator->setPassword("password");
        });

// 4. SSL错误处理
connect(&manager, &QNetworkAccessManager::sslErrors,
        [](QNetworkReply *reply, const QList<QSslError> &errors) {
            // 处理SSL错误
        });
```
QNetworkReply - 网络响应处理器
用于读取从网络中获得的回复，解析信息，QNetworkAccessManager 调度器发出获取资源请求后，资源管理由 QNetworkReply 接管
```cpp
QNetworkReply *reply = manager.get(request);

// QNetworkReply的重要特性：
// 1. 异步操作 - 通过信号通知状态
connect(reply, &QNetworkReply::readyRead, []() {
    // 有数据可读
});

connect(reply, &QNetworkReply::downloadProgress,
        [](qint64 bytesReceived, qint64 bytesTotal) {
    // 下载进度更新
});

connect(reply, &QNetworkReply::finished, []() {
    // 请求完成（无论成功失败）
    if (reply->error() == QNetworkReply::NoError) {
        QByteArray data = reply->readAll();  // 读取所有数据
        qDebug() << "响应状态码:" << reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
        qDebug() << "响应头:" << reply->rawHeaderList();
    }
});

// 2. 流式读取数据（适合大文件）
while (!reply->atEnd()) {
    QByteArray chunk = reply->read(4096);  // 每次读取4KB
    // 处理数据块
}

// 3. 错误处理
if (reply->error() != QNetworkReply::NoError) {
    qDebug() << "错误代码:" << reply->error();
    qDebug() << "错误描述:" << reply->errorString();
}

// 4. 重要：必须手动删除（推荐使用deleteLater）
reply->deleteLater();
```
```md
开始网络请求
    ↓
创建 QNetworkRequest
    ↓ 设置URL、请求头等
    ↓
QNetworkAccessManager.get(request)
    ↓ 发送请求到网络
    ↓
返回 QNetworkReply 对象
    ↓
    ├── readyRead()信号 → 读取部分数据
    ├── downloadProgress()信号 → 更新进度
    └── finished()信号 → 请求完成
    ↓
在finished()槽函数中：
    - 检查error()判断是否成功
    - 调用readAll()或read()获取数据
    - 调用deleteLater()清理
```
- `manager->get()` 函数是一个异步调用函数，刚调用 get 时**会立刻返回**，curentReply 中还没有数据，需要时间获取
### Boost 版本
较为高级的用法，根据网易云链接歌单/歌曲封面，本质还是获取 html 然后下载资源。参考自己写的项目 [[netease music cover downloader]]

## 实现 ai 接口调用
### httplib 实现
#### 基本设置
```cpp
// 设置客户端初始化和延时
client = std::make_unique<httplib::SSLClient>(host);
client->set_connection_timeout(30);
client->set_read_timeout(60);
client->set_write_timeout(30);
```
httplib默认基本只支持http协议，如果需要https支持需要定义`#define CPPHTTPLIB_OPENSSL_SUPPORT`宏
#### 解析 url 提取主机和路径
```cpp
std::pair<std::string, std::string> parse_url(const std::string& url) {
    std::string protocol, host, path;
    size_t protocol_end = url.find("://");
    if (protocol_end != std::string::npos) {
        protocol = url.substr(0, protocol_end);
        host = url.substr(protocol_end + 3);
    } else {
        protocol = "https";
        host = url;
    }

    size_t path_start = host.find('/');
    if (path_start != std::string::npos) {
        path = host.substr(path_start);
        host = host.substr(0, path_start);
    } else {
        path = "/";
    }

    return {host, path};
}
```
传统做法太复杂，并且不太靠谱，这里使用 `boost.url` 辅助
```cpp
std::pair<std::string, std::string> parse_url(const std::string& url){
	urls::url_view uv = urls::parse_uri(url);
	return {uv.host(), uv.path()};
}
```
#### 设置请求体
```cpp
      // 设置请求头
      httplib::Headers headers = {
          {"Authorization", "Bearer " + api_key},
          {"Content-Type", "application/json"},
          {"Accept", "application/json"},
          {"User-Agent", "DeepSeek-CPP-Client/1.0"}};
// 设置请求体
      json request_body = {
          {"model", model},
          {"messages", messages},
          {"stream", stream},
          {"temperature", temperature},
          {"max_tokens", max_tokens}};
      // 发送POST请求
      auto response = client->Post(path.c_str(), headers, request_body.dump(), "application/json");
```
post 请求中 content-type 字段是必须的，所以 `Post()` 中必须要传入 content-type 参数，这样 headers 中可以不设置
剩下的就是 json 解析了
### Boost 实现
#### 初始化和基本设置
```cpp
ssl::context ctx{ssl::context::tlsv12_client};
ctx.set_verify_mode(ssl::verify_none)
```
由于使用了 https 协议，需要设置 ssl 协议版本，选择 tls 的 1.2 客户端版本，并且禁用 ssl 验证网站，如果使用了 `ssl::verify_peer` 会导致需要验证文件。

#### 发送 https 请求
```cpp
// 创建解析对象
tcp::resolver resolver(ioc);

// 基本设置
auto results = resolver.resolve(host, "443");
stream = std::make_unique<ssl::stream<tcp::socket>>(ioc, ctx);
if (!SSL_set_tlsext_host_name(stream->native_handle(), host.c_str())) {
    beast::error_code ec{static_cast<int>(::ERR_get_error()), boost::asio::error::get_ssl_category()};
    throw beast::system_error{ec};
}

// 链接
asio::connect(beast::get_lowest_layer(*stream), results);
stream->handshake(ssl::stream_base::client);
```
- 首先指定连接配置，设置连接哪一个主机，哪一个端口，域名是什么。因一个主机地址可能需要管理多个域名，需要设置 sni 字段来**告诉主机到底需要访问哪一个域名**，具体验证机制[[netease music cover downloader#ssl 验证逻辑|参考]]。
- 设置完后进行连接和招手
#### 读取响应
```cpp
http::write(*stream, req);
beast::flat_buffer buffer;
http::response<http::dynamic_body> res;
http::read(*stream, buffer, res);

beast::error_code ec;
stream->shutdown(ec);

if (ec == boost::asio::error::eof || ec == ssl::error::stream_truncated) {
    ec = {};
}
if (ec) {
    throw beast::system_error{ec};
}

// 转换为字符串
return beast::buffers_to_string(res.body().data());
```
- 读写后需要关闭网络流，检验是否关闭
- 其他部分就是 json 解析
## 网络 api 接口使用
### 文本转二维码 base 64 编码图
#### httplib 实现
完整代码参考：[[C++ Code Snippets#网络请求#基本网络请求#GET 请求将文本转二维码 base 64 编码信息]]
```cpp
json API::send_request(const std::string& user_message) {
	httplib::Headers headers = {
		//{"Host", "uapi.cn"},
		//{"Content-Type", "application/json"}
	};
	httplib::Params params;
	params.emplace("text", user_message);
	params.emplace("size", "256");
	params.emplace("format", "json");
	const auto response = client->Get(path, params, headers);
	int status = response->status;
	if (status == httplib::StatusCode::OK_200) {
		json parsed_content = json::parse(response->body);
		std::cout << "response: " + response->body;
		return parsed_content;
	} else {
		const std::string error_msg = std::string("status: ") + httplib::status_message(status);
		throw std::runtime_error(error_msg);
	}
}
```
和 post 请求不同的是 GET 请求**通常不需要设置请求头**，[[CPP网络编程实战#^x43n1d|构建url]] 时需要设置 Params，然后发送命令，解析 json 即可，至于转换 base 64 编码转换为图像，可以使用 opencv 解析后，以 `std::ios::binay` 写入文件
```cpp
bool DecodeBase64::save_qr_to_file(std::string filepath, const std::string& decoded_string) {
	std::ofstream file(filepath, std::ios::binary);
	if (!file) {
		std::cout << "cannot onpen file" + filepath;
		return false;
	}
	file.write(reinterpret_cast<const char*>(decoded_string.data()), decoded_string.size());
	file.close();
	std::cout << "qr file saved as " + filepath;
	return true;
}
```