---
source: https://www.bilibili.com/video/BV11HsqzFEUN/?spm_id_from=333.1387.favlist.content.click&vd_source=876be08bc9c030f4a9ea1fb97e0d0342
crea: 2025年11月6日14:30:28
---
# 简单 html 源代码获取脚本
## curl 实现版本
### 获取 html 源码
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
如果有些网站需要验证客户端身份，可以用浏览器先访问一下，然后使用浏览器默认身份（当然也可以自定义）, 所有的 http 请求头都需要**合并为一个字符串之后传入**
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
curl_slist_free_all(headers);  // 不是必要，但是最好记得
```
添加 user_agent 请求头之后服务器的 html 返回结果也会包含请求头
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
### html 源码解析
需要用到另一个库 pugixml，这个库**只能解析 xml，如果手动将 html 中的单标签，特殊语法使其成为一个符合 xml 格式的文档并在 pugi 解析选项中使用宽松解析**，也可以用来解析 xml
具体代码参考：[[C++ practice case#html/xml 解析#pugixml 解析]]
