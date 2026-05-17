---
crea: 2025年11月6日14:30:28
---
# 基本网络编程知识
## 网络请求总体流程
![[Pasted image 20260210143735.png]]
## 网络请求分类
### POST
本质是一段 http 文本，包含请求头和请求体部分，数据包含在请求头内容中，目的是**根据这些数据获取另一些数据**，通常这些数据比较大并且复杂，需要高级语言来解析这些数据结构 用于处理变更，请求体中内容被服务器端解析，**根据解析结果在服务器端进行对应的操作**，再将操作结果发送回来。发送重复的 post 消息可能会造成不同的结果，因执行了重复的操作 post**仅仅只是数据不在链接中明文传输，数据包如果不加密仍不安全**
### GET
#### 本质理解
本质**只是一段 url 地址**，代码中构建过程也只是构建一个url链接，只需要知道host地址，资源文件地址和需要传入的参数即可。访问这个地址会让服务器解析地址中中指明的资源地址，服务器访问对应位置的资源，根据URL参数处理，比如查询字符串（`?page=1&sort=name`）作为**过滤或补充信息**，再将**处理后的查询结果返回给客户端** ^x43n1d
```http
GET /api/products?category=electronics&minPrice=500 HTTP/1.1
```
服务器：定位到 `/api/products` 资源集 → 应用 `category=electronics` 和 `minPrice=500` 过滤 → 返回过滤后的产品列表。 严格的 GET 命令重复执行**的结果是相同的**，并且**没有写入操作**，但技术上来说**也可以通过 url 中参数实现修改数据**，但不建议这样做
#### 适用场景和注意事项
-   操作是**幂等**的（重复执行结果相同）
-   只是**读取或查询**数据
-   希望响应**被缓存**
-   `Content-Type` 是必须的，告诉服务器如何解析请求体，`Content-Length` 通常自动计算
-   参数较少且非敏感（适合放URL中，通常不能超过 2048 个字符）
-   不能有空格，需要进行 url 编码 `"?name=John Doe&city=New York"` 需要被编码为：`?name=John%20Doe&city=New%20York"`

# Boost.Asio 编程
参考:https://www.yuque.com/lianlianfengchen-cvvh2/krco73
## 网络编程基本流程
### 流程概览
服务端  
1. socket----创建 socket 对象。
2. bind----绑定本机 ip+port。
3. listen----监听来电，若在监听到来电，则建立起连接。
4. accept----再创建一个 socket 对象给其收发消息。原因是现实中服务端都是面对多个客户端，那么为了区分各个客户端，则每个客户端都需再分配一个 socket 对象进行收发消息。
5. read、write----就是收发消息了。
对于客户端
6. socket----创建 socket 对象。
7. connect----根据服务端 ip+port，发起连接请求。
8. write、read----建立连接后，就可发收消息了。
传统的网络阻塞 IO 模型
![[Pasted image 20260505135436.png|500]]

### 基本架构代码编写
#### 创建 endpoint
```cpp
void printIfErrorExist(boost::system::error_code& ec, const std::string& additionalText = "") {
	if(ec.value() != 0) {
		std::string info =
			std::format("{}, error_code: {}, message: {}\n", additionalText, ec.value(), ec.message());
		std::cout << info;
	}
}

int client_endpoint_create() {
	// set target server endpoint to connect, not the client itself
	const std::string		  targetServerIPAddress = "127.0.0.1";
	const unsigned short	  targetServerPort		= 3333;
	boost::system::error_code ec;

	// construct server endpoint
	asio::ip::address serverIPAddress = asio::ip::address::from_string(targetServerIPAddress, ec);
    printIfErrorExist(ec, "failed to parse target server ip address");
    // notice there have no info of client itself
    asio::ip::tcp::endpoint targetServerEndpoint(serverIPAddress, targetServerPort);
	return 0;
}

int server_endpoint_create() {
	// the listen port is OS distribute to this server application as the response to its apply
	const unsigned short	serverListenPort = 3333;
	asio::ip::address		acceptIPAddress = asio::ip::address_v6::any();  // accept all ipv6 connection come in, it can be use in acceptor
	asio::ip::tcp::endpoint endpoint(acceptIPAddress, serverListenPort);
}
```
- 按理说任何通信都需要**双方知道对方的**确切的网络地址（ip 地址+端口号），那么客户端**和服务端通信也需要一个端口**，但这会由操作系统随机分配（当时空闲），并在通信是连同通信信息一同发向服务端，这样服务端就能根据这些信息来知道对方的地址。
- 但是 CS 架构中，客户端和服务端并不需要知道自己的 ip 地址，发送信息只需要知道对方的即可，**绑定 socket 时**需要知道自己的 IP（可以填 `INADDR_ANY` 让系统选择）
- boost 支持指定客户端和服务端的运行端口，但不推荐，如果将 `targetServerPort` 设置为 0 表示自动
如果使用 C api 写:
```cpp
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

void print_error(const char *additional_text, int err_code, const char *err_msg) {
    if (err_code != 0) {
        printf("%s, error_code: %d, message: %s\n", additional_text, err_code, err_msg);
    }
}

// ============================================================
// 客户端：创建连接服务器的 endpoint
// ============================================================
int client_endpoint_create() {
    // 目标服务器地址
    const char *target_server_ip   = "127.0.0.1";
    const unsigned short target_server_port = 3333;

    // 1. 创建 socket (TCP)
    int client_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (client_fd < 0) {
        print_error("failed to create socket", errno, strerror(errno));
        return -1;
    }

    // 2. 构造目标服务器地址结构
    struct sockaddr_in server_addr;
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family      = AF_INET;                    // IPv4
    server_addr.sin_port        = htons(target_server_port);  // 端口（需要转成网络字节序）
    inet_pton(AF_INET, target_server_ip, &server_addr.sin_addr);  // IP 地址

    // 3. 连接到服务器（相当于 Boost.Asio 的 connect）
    int ret = connect(client_fd, (struct sockaddr *)&server_addr, sizeof(server_addr));
    if (ret < 0) {
        print_error("failed to connect to server", errno, strerror(errno));
        close(client_fd);
        return -1;
    }

    printf("Connected to server %s:%d, client fd: %d\n", 
           target_server_ip, target_server_port, client_fd);
    
    // 注意：客户端端口由系统自动分配，调用 getsockname() 可查看
    struct sockaddr_in client_addr;
    socklen_t addr_len = sizeof(client_addr);
    getsockname(client_fd, (struct sockaddr *)&client_addr, &addr_len);
    printf("Client assigned port: %d\n", ntohs(client_addr.sin_port));

    // 实际使用中，这里会返回 socket fd
    close(client_fd);  // 演示用，直接关闭
    return 0;
}

// ============================================================
// 服务器：创建监听 endpoint
// ============================================================
int server_endpoint_create() {
    // 服务器监听端口
    const unsigned short server_listen_port = 3333;

    // 1. 创建 socket (TCP)
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        print_error("failed to create socket", errno, strerror(errno));
        return -1;
    }

    // 允许端口快速复用（解决 "Address already in use" 问题）
    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    // 2. 构造服务器地址结构（绑定到指定端口，监听所有网卡）
    struct sockaddr_in server_addr;
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family      = AF_INET;                    // IPv4
    server_addr.sin_port        = htons(server_listen_port);  // 监听端口
    server_addr.sin_addr.s_addr = INADDR_ANY;                 // 监听所有网卡 (相当于 address_v6::any())

    // 3. 绑定 socket 到地址（相当于 Boost.Asio 的 bind）
    int ret = bind(server_fd, (struct sockaddr *)&server_addr, sizeof(server_addr));
    if (ret < 0) {
        print_error("failed to bind socket", errno, strerror(errno));
        close(server_fd);
        return -1;
    }

    // 4. 开始监听（相当于 Boost.Asio 的 listen）
    ret = listen(server_fd, SOMAXCONN);
    if (ret < 0) {
        print_error("failed to listen", errno, strerror(errno));
        close(server_fd);
        return -1;
    }

    printf("Server listening on port %d, fd: %d\n", server_listen_port, server_fd);
    
    close(server_fd);  // 演示用，直接关闭
    return 0;
}

// ============================================================
int main() {
    printf("=== Client Endpoint ===\n");
    client_endpoint_create();

    printf("\n=== Server Endpoint ===\n");
    server_endpoint_create();

    return 0;
}
```
#### 创建 socket
```cpp
int create_server_socket() {
    // An instance of 'io_service' class is required by socket constructor.
    // only for one client connection
    asio::io_context ioc;
    asio::ip::tcp protocol = asio::ip::tcp::v4();
    asio::ip::tcp::socket serverSocket(ioc);
    boost::system::error_code ec;
    serverSocket.open(protocol, ec);
    printIfErrorExist(ec, "Failed to open server socket");
    return 0;
}

int create_server_acceptor_socket() {
    // use acceptor enables multi-connection
    asio::io_context ioc;
    asio::ip::tcp protocol = asio::ip::tcp::v6();
    asio::ip::tcp::acceptor acceptor(ioc);
    boost::system::error_code ec;
    acceptor.open(protocol, ec);
    printIfErrorExist(ec, "failed to open acceptor socket");
    return 0;
}
```
- 一台设备可以有多个 socket 分别用于对不同其他设备的通信，客户端由于**只需要和一个服务端通信，只用一个 socket 即可**，不需要监听，而服务端会接受多个客户端通信，所以使用 acceptor 接受新的连接。
- 从底层理解，socket 封装了 `read`, `write`, `connect`，acceptor 封装了 `accept`, `listen`, `bind`，acceptor 收到一个新的连接之后，会返回一个**专门与这个新连接的客户端通信的 socket**，并继续监听原 endpoint
```md
┌─────────────────────────────────────────────────────────────┐
│                        服务端                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Acceptor (监听socket)                                     │
│   ┌─────────────────────┐                                   │
│   │  端口: 3333         │  ◄── 只负责"监听"新连接           │
│   │  状态: listening    │                                   │
│   └─────────────────────┘                                   │
│            ▲                                                 │
│            │ accept() 产生新socket                          │
│            │                                                 │
│   ┌────────┴────────┐    ┌────────────┐    ┌────────────┐  │
│   │ Client Socket 1 │    │Client Socket2│   │Client Socket3│ │
│   │ 连接客户端A      │    │ 连接客户端B  │    │ 连接客户端C   │ │
│   └─────────────────┘    └────────────┘    └────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        客户端                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Socket (通信socket)                                       │
│   ┌─────────────────────┐                                   │
│   │  连接到: IP:端口     │  ◄── 主动发起连接                 │
│   │  状态: connected    │                                   │
│   └─────────────────────┘                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
需要注意的是，客户端和服务端的 ip 通信协议版本不同可能导致连接错误

| 客户端协议 | 服务器协议 | 能否通信                        |
| ----- | ----- | --------------------------- |
| IPv4  | IPv6  | **通常可以**（需服务器启用 dual-stack） |
| IPv6  | IPv4  | **不能直接通信**                  |
现代操作系统支持 **IPv4-mapped IPv6 地址**，可以将 IPv4 地址映射为 IPv6 格式。服务器需要设置 `v6_only(false)`：
```cpp
int create_server_socket_v6_dual_stack() {
    asio::io_context ioc;
    asio::ip::tcp::acceptor acceptor(ioc);
    
    // 1. 打开 IPv6 socket
    acceptor.open(asio::ip::tcp::v6());
    
    // 2. 关键：关闭 v6_only 选项，允许同时接受 IPv4
    boost::system::error_code ec;
    acceptor.set_option(asio::ip::v6_only(false), ec);
    
    // 3. 绑定监听
    asio::ip::tcp::endpoint endpoint(asio::ip::tcp::v6(), 3333);
    acceptor.bind(endpoint, ec);
    acceptor.listen();
    
    // 现在可以同时接受 IPv4 和 IPv6 客户端
}
```
#### 绑定 acceptor 和 socket
- 每一对连接都需要双方（本地和远端）的 socket 和地址（ip 地址和端口号）才能进行通信
- `asio::ip::address` 用于设置单个 ip 地址（自己是客户端，客户端运行在特定端口上发送信息），如果设置为 `any()` 一般是作为服务端，传入 acceptor 中让自己能够接受任何地址的客户端连接，**如果用于客户端，则表示由 OS 分配本地 IP**
- socket 是通信之间的身份标识符，有了它双方才能区分自己是在和谁通信，绑定之后会关联本地 IP + 端口
	- 本地信息：通过 bind() 绑定
	- 远端信息：通过 `connect()/accept()` 建立连接后获得
- endpoint 是 socket ，设备 ip 地址，使用 ip 协议版本和通信端口号封装在一起的类，包含了通信所需要的所有必须信息
- acceptor 是服务端为了解决接受多个连接问题的封装管理类，***可以被当作 socket 使用***（因为有新的连接 acceptor 就会返回和这个连接通信的 socket），其中并没有存储连接信息（地址，端口，协议等）。其中*返回新的 socket的方式是复用同一个 socket*，具体参考[[#服务端接受连接]]
- bind 操作将 endpoint 信息关联到 socket/acceptor
	- 服务端：绑定监听地址和端口，将 endpoint 中的信息告诉 acceptor，让他按照 endpoint 中的地址和端口监听制定协议和制定 ip 地址范围的新连接。如果监听到了就返回 socket 作为和这个连接通信的依据
	- 客户端：绑定本地地址（可选，不绑定则由系统分配）
	- **未绑定时 socket 只知道自己的本地信息**
```cpp
int bind_acceptor_socket() {
    const unsigned short port= 3333;
    asio::ip::tcp::endpoint endpoint(asio::ip::address_v4::any(), port);
    asio::io_context ioc;
    boost::system::error_code ec;
    asio::ip::tcp::acceptor acceptor(ioc, endpoint.protocol());
    acceptor.bind(endpoint, ec);
    printIfErrorExist(ec, "failed to bind socket with acceptor");
    asio::ip::tcp::acceptor acceptor(ioc, asio::ip::tcp::endpoint(asio::ip::tcp::v4(), port));
}
```
#### 客户端发送连接请求
```cpp
int client_connect_to_server() {
	std::string			 targetServerIPAddress = "127.0.0.1";
	const unsigned short portNum			   = 3333;
	try {
		asio::ip::tcp::endpoint targetServerEndpoint(asio::ip::address::from_string(targetServerIPAddress),
													 portNum);
		asio::io_context		ioc;
		asio::ip::tcp::socket	sock(ioc, targetServerEndpoint.protocol());	 // default protocol is IPV4
		sock.connect(targetServerEndpoint);
		// At this point socket 'sock' is connected to the server application and can be used to send data to or receive data from it.
	} catch(const boost::system::error_code& ec) {
		printIfErrorExist(ec, "failed in client connect to server");
		return ec.value();
	}
	return 0;
}

int client_use_dns_connect_to_server() {
	std::string					   targetHost = "www.baidu.com";
	const unsigned short		   portNum	  = 3333;
	asio::io_context			   ioc;
	asio::ip::tcp::resolver::query resolverQuery(
		targetHost, std::to_string(portNum), asio::ip::tcp::resolver::query::numeric_service);
	asio::ip::tcp::resolver resolver(ioc);
	try {
		auto				  it = resolver.resolve(resolverQuery);
		asio::ip::tcp::socket sock(ioc);
        asio::connect(sock, it);
    }
    catch (const boost::system::error_code& ec) {
		printIfErrorExist(ec, "failed in use dns connect to server");
		return ec.value();
	}
	return 0;
}
```
- 一种是使用 ip 地址直接连接，另一种是通过dns 域名
- 一个域名可能有多个 ip 管理，`asio::connect` 的多种重载保证及可以接受单个 ip 地址，也可以接受 query 解析出来的 ip 结果集

|特性|说明|
|---|---|
|自动遍历|依次尝试每个 IP|
|自动跳过失败|一个 IP 连接失败，自动试下一个|
|返回成功位置|返回成功连接的那个迭代器|
|错误处理|全部失败才返回错误|
如果需要手动控制每个解析到的 ip:
```cpp
// 方式1：使用连接条件（可以跳过特定 IP）
asio::connect(sock, results, 
    [](const boost::system::error_code& ec, asio::ip::tcp::resolver::iterator) {
        return !ec;  // 只要成功就停止
    });

// 方式2：手动遍历（完全控制）
for (auto it = results.begin(); it != results.end(); ++it) {
    boost::system::error_code ec;
    sock.close();  // 关闭之前的尝试
    sock.connect(it->endpoint(), ec);
    
    if (!ec) {
        std::cout << "Connected to: " << it->endpoint().address().to_string();
        break;
    }
}
```
#### 服务端接受连接
```cpp
int server_accept_new_connection() {
	const int				BACKLOG_SIZE = 30;
	const unsigned short	portNum		 = 3333;
	asio::ip::tcp::endpoint serverAvailableEndpointComeIn(asio::ip::address_v4::any(), portNum);
	asio::io_context		ioc;
	try {
		asio::ip::tcp::acceptor acceptor(ioc, serverAvailableEndpointComeIn.protocol());
		acceptor.bind(serverAvailableEndpointComeIn);
		acceptor.listen(BACKLOG_SIZE);
		asio::ip::tcp::socket sock(ioc);
		acceptor.accept(sock);
	} catch(const boost::system::error_code& ec) {
		printIfErrorExist(ec, "failed in server accept ne connection");
		return ec.value();
	}
	return 0;
}
```
- 先初始化 socket 对象，此时这个 socket 并没有绑定 endpoint，所以只知道本地的 endpoint 信息（也是在 acceptor 中存储的，socket 对象中并没存储，是空白的），也并没有占用本地 socket 通信资源
	1. 从操作系统获取新连接（fd，来自远端客户端，包含远端信息）
	2. 关闭初始化传入 sock 原有的连接（如果有）
	3. 将新连接的 fd **转移**给传入的sock
	4. 现在 sock 有了：本地信息（操作系统分配端口）+ 远端信息（客户端 IP:端口）
- 可以看到 `accept()` 返回值是 void，避免返回新 socket 的开销acceptor 中仍然复用初始化时传入的 socket 对象，这样可以减少为每个新连接**分配内存**
- **传入的 socket 对象被重复使用，每次 accept 只是更换其内部的连接资源**
```md
┌─────────────────────────────────────────────────────────────────┐
│                     传统方式（返回新对象）                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   acceptor.accept()                                             │
│          │                                                      │
│          ▼                                                      │
│   ┌──────────────┐     每次都创建新对象（内存分配）              │
│   │  New Socket  │ ◄── 如果频繁调用，内存分配/释放开销大         │
│   └──────────────┘                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     Boost Asio 方式（传入复用）                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   asio::ip::tcp::socket sock(ioc);   ◄── 创建一次               │
│          │                                                      │
│          ▼                                                      │
│   acceptor.accept(sock);         ◄── 复用已存在的 socket        │
│          │                                                      │
│          ▼                                                      │
│   sock 的内部资源被"重新初始化"，指向新连接                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
#### 消息收发缓冲区结构
##### 设计意义
Boost Asio 的**类型安全设计**——用 C++ 类型系统在编译期防止错误。
所谓 buffer 就是接收和发送数据时缓存数据的结构。 asio 提供了 `asio::mutable_buffer` 用于写服务和 `asio::const_buffer` 用于读服务这两个结构，他们**是一段连续的空间**，首字节存储了后续数据的长度
但是这两个结构都没有被 asio 的 api 直接使用，asio 提出了 MutableBufferSequence 和 ConstBufferSequence 概念，他们是由多个 `asio::mutable_buffer` 和 `asio::const_buffer` 组成的。也就是说为了节省空间，将一部分连续的空间组合起来（***本质上他们是一段能够被连续的索引找到并连续遍历的一段不连续的空间集合***），作为参数交给 api 使用。这种方式节省了空间的同时没有降低性能，同时设计的也很优雅
![[Pasted image 20260505230524.png|500]]
> [!note] 
> "零拷贝"不是"不需要复制"，而是**不需要在用户态创建临时合并缓冲区**。
> 
> 虽然缓冲区中的数据在物理上不是连续的，但是可以缓冲区序列（抽象地类比为 `std::vector<XXXSequence>` 是连续存储的，并且每一个分散的的 buffer 也是连续的，内存地址和长度也是确定的，所以整个缓冲区序列虽然在物理上分散，但是逻辑上是连续的，所以可以被近似连续地遍历
> 
> 内核可以直接根据这些信息，用 scatter-gather I/O 从多个不连续地址同时读取，无需用户态临时合并。
> ```md
> ┌─────────────────────────────────────────────────────────────────────┐
> │                    传统方式：需要额外复制                           │
> ├─────────────────────────────────────────────────────────────────────┤
> │                                                                     │
> │   应用数据1 (0x1000)  ─┐                                            │
> │   应用数据2 (0x2000)  ─┼──→ 临时缓冲区 (0x3000) ──→ 内核 ──→ 网络  │
> │   应用数据3 (0x3000)  ─┘    ↑ 需要额外分配和复制                   │
> │                                                                     │
> │   问题：需要先合并，再发送                                          │
> │                                                                     │
> └─────────────────────────────────────────────────────────────────────┘
> 
> ┌─────────────────────────────────────────────────────────────────────┐
> │                    Asio 方式：零拷贝（scatter-gather）              │
> ├─────────────────────────────────────────────────────────────────────┤
> │                                                                     │
> │   应用数据1 (0x1000, 100字节) ─┐                                    │
> │   应用数据2 (0x2000, 200字节) ─┼──→ 直接传给内核 ──→ 网络         │
> │   应用数据3 (0x3000,  50字节) ─┘    ↑ 不需要临时缓冲区             │
> │                                                                     │
> │   内核使用 scatter-gather I/O，同时从多个地址读取                   │
> │                                                                     │
> └─────────────────────────────────────────────────────────────────────┘
> ```
##### 使用方法
我们可以理解为MutableBufferSequence的数据结构为 `std::vector<asio::mutable_buffer>(asio::mutable_buffer)`，同理 ConstBufferSequence。
这么复杂的结构交给用户使用并不合适，所以 asio 提出了 `buffer()` 函数，该函数接收多种形式的字节流，该函数返回 `asio::mutable_buffers_1` 或者 `asio::const_buffers_1` 结构的对象。  
- 如果传递给 buffer()的参数是一个只读类型，则函数返回 `asio::const_buffers_1` 类型对象。  
- 如果传递给 buffer()的参数是一个可写类型，则返回 `asio::mutable_buffers_1` 类型对象。

可以看到，真正进行数据读写的 api 接受的参数类型都是 MutableBufferSequence 和 ConstBufferSequence 类型，而 `asio::const_buffers_1` 和 `asio::mutable_buffers_1` 是 `asio::mutable_buffer` 和 `asio::const_buffer` 的适配器，提供了符合 MutableBufferSequence 和 ConstBufferSequence 概念的接口
```cpp
// send的api接口
template<typename ConstBufferSequence>
std::size_t send(const ConstBufferSequence & buffers);
```
***那么普通类型的数据如何转换为这符合两种概念的类型呢？***
-> 使用 `buffer()` 函数，`buffer()` 是"工厂函数"，把各种形式的内存转换为 Asio API 需要的"缓冲区序列"格式。根据传入参数类型决定返回值类型
所以这里就引入了两种能够构造 `write_some` 等函数使用的 Buffer 的方法
```cpp
// simulate a situation have no adapter as `asio::const_buffers_1` or `asio::mutable_buffers_1`, we have
// to use traditional containers to satisfy `MutableBufferSequence` and `ConstBufferSequence` these 2 concepts
// 手动创建单个const_buffer，然后组装到一起作为一个满足SequenceBuffer的缓冲区
void construct_const_buffer() {
	std::string						buf = "hello world";
	asio::const_buffer				asioBuffer(buf.data(), buf.length());
	std::vector<asio::const_buffer> bufferSequence;
	bufferSequence.emplace_back(asioBuffer);
}

// or we use adapter of MutableBufferSequence and ConstBufferSequence
// 构建单个适配器
void use_buffer_str() {
	asio::const_buffers_1 outputBuf = asio::buffer("hello world");
}

// 补充:对堆对象，数组类型的构建方式
void use_buffer_array() {
	const size_t			BUFFER_SIZE_BYTES = 20;
	std::unique_ptr<char[]> buf(new char[BUFFER_SIZE_BYTES]);
	asio::mutable_buffers_1 inputBuf = asio::buffer(static_cast<void*>(buf.get()), BUFFER_SIZE_BYTES);
}
```
只要满足 `begin()/end()` 且对单个元素解引用返回 `mutable_buffer` / `const_buffer`，就可以用于 Asio 的 API，asio 只对概念进行约束，并**不是强硬的类型限制**
- `asio::const_buffer asioBuffer(buf.data(), buf.length());` 
	- 这是将 std::string 的数据"视图化"为 Asio 的缓冲区 
	- asio::const_buffer 是**实现了接口的具体类型**  
	- 它本身就可以直接使用，不需要再包装
- `std::vector<asio::const_buffer> bufferSequence`; 
	- 这**已经满足** ConstBufferSequence 概念
	- 有 begin()/end()，解引用返回 const_buffer/mutable_buffer
	- 可以直接传给 send() 等函数
- `const_buffers_1` 的作用： 
	- ***让单个 buffer 也能以"序列"方式使用***，命名中的 1 也是这个意思，虽然他是 buffers，但是其中只有一个缓冲区，自定义的数据结构中（比如 `std::vector<mutable_buffer>`）可以放入多个缓冲区，但和 `const_buffers_1` 一样都可以传入 asio api 中
	- 相当于给单个 buffer 提供了 begin/end 接口的适配器，这样做是为了让适配器和自动容器都能够**使用同一套 asio 的 api 接口**，增强适配性
- 需要注意如果是指针数组类型，需要转化为 `void*` 后指定长度
	- 和 C 语言一样 `void*` 类型并不可怕，可怕的是在没有指定内存长度的情况下直接读取内存
	- buffer 函数没有 `char *` 的重载/特化（但有 `const char*` 用于字面量类型）
	- 其他类型的指针数组也一样，为了避免这种情况，asio 统一重载 `void*` 参数类型用于数组类型，**传入其他类型的指针都会被强转为 `void*`**
```md
┌─────────────────────────────────────────────────────────────────────┐
│                        缓冲区类型对比                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   基础类型（单个内存块）                                            │
│   ────────────────────                                             │
│   mutable_buffer   → 可写内存块                                     │
│   const_buffer     → 只读内存块                                     │
│                                                                     │
│   序列适配器（提供 begin/end）                                      │
│   ──────────────────────────                                       │
│   mutable_buffers_1  → 适配单个 mutable_buffer                      │
│   const_buffers_1    → 适配单个 const_buffer                        │
│                                                                     │
│   容器（存储多个 buffer）                                           │
│   ────────────────────                                              │
│   std::vector<mutable_buffer>   → 可变数量，可直接用               │
│   std::vector<const_buffer>     → 可变数量，可直接用               │
│   std::array<mutable_buffer, N> → 固定数量，可直接用               │
│   std::array<const_buffer, N>   → 固定数量，可直接用               │
└─────────────────────────────────────────────────────────────────────┘
```

> [!note]
> 流式传输缓冲区
> ```cpp
> void use_stream_buffer() {
>     asio::streambuf buf;
>     std::ostream output(&buf);
>     // Writing the message to the stream-based buffer.
>     output << "Message1\nMessage2";
>     // Now we want to read all data from a streambuf
>     // until '\n' delimiter.
>     // Instantiate an input stream which uses our 
>     // stream buffer.
>     std::istream input(&buf);
> 
>     // We'll read data into this string.
>     std::string message1;
> 
>     std::getline(input, message1);
>     // Now message1 string contains 'Message1'.
> }
> ```

#### 收发消息
满足 buffer 或者 bufferSequence 概念的缓冲区都可以被 write_some/read_some 发送或读取，由于 TCP 协议中，最大传输单元是有限度的，所以如果数据过长并不能通过一次 TCP 连接发送完全，这就需要不断计算每次连接发送数据的大小
```cpp
// 本质上来讲发送过程应该是这样的
void write_to_socket(asio::ip::tcp::socket& sock) {
	std::string buffer = "hello world";
	size_t totalBytesWrite = 0;
	while (totalBytesWrite != buffer.length()) {
		totalBytesWrite += sock.write_some(asio::buffer(buffer.c_str() + totalBytesWrite, buffer.length() - totalBytesWrite));
	}
}

// 但asio其实不用自己手动循环读取，而会自动将分片发送
void write_to_socket(asio::ip::tcp::socket& sock) {
    std::string buffer = "hello world";
    boost::system::error_code ec;
    sock.write_some(asio::buffer(buffer), ec);
    // 同理，asio对sequenceBuffer也做了处理，直接将vector<const_buffer>类型传入write_some中就鞥自动翻篇发送
}
```
如果想要一次性发送完所有数据（阻塞式发送），就需要使用 send 函数，其内部循环会自动保证所有数据被**全部发送**
- `socket::send/asio::write` 会将所有数据从用户态放入 tcp 缓冲区中，**一直阻塞到全部发送完为止**
- `sendLength < 0` 表明出现了错误，`==0` 表示*对端关闭*，`>0` 的情况只可能会等于发送数据的长度，如果有部分字节因为发送缓冲区满无法发送，则阻塞等待，直到发送缓冲区可用，则继续发送完成。
```cpp
int send_data_by_write() {
	std::string	   raw_ip_address = "127.0.0.1";
	unsigned short port_num		  = 3333;
	try {
		asio::ip::tcp::endpoint ep(asio::ip::address::from_string(raw_ip_address), port_num);
		asio::io_service		ios;
		// Step 1. Allocating and opening the socket.
		asio::ip::tcp::socket sock(ios, ep.protocol());
		sock.connect(ep);
		std::string buf			= "Hello World!";
		int			send_length = asio::write(sock, asio::buffer(buf.c_str(), buf.length()));
		// also equals to 
		int			send_length = sock.send(buf.c_str(), buf.length());
		if(send_length <= 0) {
			cout << "send failed" << endl;
			return 0;
		}
	} catch(system::system_error& e) {
		std::cout << "Error occured! Error code = " << e.code() << ". Message: " << e.what();
		return e.code().value();
	}
	return 0;
}
```

| 特性       | `write_some` | `send`                      |
| -------- | ------------ | --------------------------- |
| **保证**   | 不保证一次发送完所有数据 | 保证发送完所有数据（或出错）              |
| **返回值**  | 实际发送的字节数     | 实际发送的字节数（总是等于请求发送的字节数，除非出错） |
| **使用场景** | 需要精确控制发送过程   | 简单场景，发送小数据                  |
| **阻塞模式** | 需循环调用确保全部发送  | 内部循环，自动完成                   |
接收消息同理也有 `read_some` 和 `recieve`，同样分为阻塞和非阻塞，接收消息时可以自定义缓冲区
```cpp
int read_data_by_receive() {
	std::string	   raw_ip_address = "127.0.0.1";
	unsigned short port_num		  = 3333;
	try {
		asio::ip::tcp::endpoint ep(asio::ip::address::from_string(raw_ip_address), port_num);
		asio::io_service		ios;
		asio::ip::tcp::socket	sock(ios, ep.protocol());
		sock.connect(ep);
		const unsigned char BUFF_SIZE = 7;
		char				buffer_receive[BUFF_SIZE]; // 自定义接收缓冲区，每次只接受7字节大小
		int					receive_length = sock.receive(asio::buffer(buffer_receive, BUFF_SIZE));
		// also same as
		int					receive_length = asio::read(sock, asio::buffer(buffer_receive, BUFF_SIZE));
		// 还可以读取到指定字符
		int received_length = asio::read_until(sock, buf, '\n');
		if(receive_length <= 0) { /* */ }
	} catch(boost::system::system_error& e) {

	}
	return 0;
}
```
### 同步编写客户端和服务端

### 异步编程 API
# 简单网络请求
## 静态 html 源代码获取
参考教程： https://www.bilibili.com/video/BV11HsqzFEUN/?spm\_id\_from=333.1387.favlist.content.click&vd\_source=876be08bc9c030f4a9ea1fb97e0d0342
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
其中 `curl_easy_setopt` 用于设置参数，对应参数使用 CURLOPT 开头的宏来设置 对于写入函数，使用 `curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);`，其中 write\_callback 函数可以在官网查阅到它的签名是固定的 `size_t write_callback(char* ptr, size_t size, size_t nmemb, void* userdata)` ，参数 userdata 用来控制写入内容的位置和方式，设置他也需要使用 setopt
如果一些网站即使这样做了也没法获取到 html 源码，则有可能是服务器强制要求要验证 CA 证书，这时候需要到 CA 证书官方颁布机构中下载最新的 pem 密钥文件，然后在 curl\_easy\_preform 函数之前使用：
```cpp
curl_easy_setopt(curl, CURLOPT_CAINFO, "path/to/pem/file");
```
如果有些网站需要验证客户端身份，可以用浏览器先访问一下，然后使用浏览器默认身份（当然也可以自定义）, 所有的 http 请求头都需要**合并为一个字符串后传入** ![[PixPin_2025-11-06_14-37-12.png]]
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
添加 user\_agent 请求头后服务器的 html 返回结果也会包含请求头 ![[PixPin_2025-11-06_14-48-13.png]] 可以通过 curl 内置内容来分开获取
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
需要用到另一个库 pugixml，这个库**只能解析 xml，如果手动将 html 中单标签，特殊语法使其成为一个符合 xml 格式的文档并在 pugi 解析选项中使用宽松解析**，也可以用来解析 xml 具体代码参考：[[C++ Code Snippets#html/xml 解析#pugixml 解析]]
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
QNetworkAccessManager - 网络访问管理器 用于执行网络请求，执行各种动作（比如发送已经设置好的请求头）的类，用于中央调度，设置代理，调整连接参数，错误处理
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
QNetworkReply - 网络响应处理器 用于读取从网络中获得的回复，解析信息，QNetworkAccessManager 调度器发出获取资源请求后，资源管理由 QNetworkReply 接管
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
-   `manager->get()` 函数是一个异步调用函数，刚调用 get 时**会立刻返回**，curentReply 中还没有数据，需要时间获取
    
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
post 请求中 content-type 字段是必须的，所以 `Post()` 中必须要传入 content-type 参数，这样 headers 中可以不设置 剩下的就是 json 解析了
### Boost 实现
#### 初始化和基本设置
```cpp
ssl::context ctx{ssl::context::tlsv12_client};
ctx.set_verify_mode(ssl::verify_none)
```
由于使用了 https 协议，需要设置 ssl 协议版本，选择 tls 的 1.2 客户端版本，并且禁用 ssl 验证网站，如果使用了 `ssl::verify_peer` 会导致需要验证文件。
#### Boost 中的网络 IO API
这是个好问题！让我详细解释这些 API 的区别：
## 写入操作
### write() vs write\_some()
| API | 行为  | 特点  |
| --- | --- | --- |
| **write\_some()** | 写入**尽可能多**的数据，可能只写入一部分 | 返回实际写入的字节数 |
| **write()** | 写入**完整**的数据，会反复调用 write\_some 直到全部写入 | 保证完整写入 |
**使用场景：**
-   `write_some()`: 需要精确控制或流式传输时
    
-   `write()`: 需要确保完整发送时（更常用）
    
### send() vs write()
| API | 行为  | 特点  |
| --- | --- | --- |
| **send()** | 通过 UDP 风格的接口发送 | 可以用于 UDP 和 TCP |
| **write()** | 仅 TCP，用于流式写入 | 更适合 TCP |
**使用场景：**
-   `send()`: UDP 套接字，或需要统一接口时
    
-   `write()`: TCP 套接字（最常用）
    
## 读取操作
### read() vs read\_some()
| API | 行为  | 特点  |
| --- | --- | --- |
| **read\_some()** | 读取**尽可能多**的数据，有多少读多少 | 返回实际读取的字节数 |
| **read()** | 读取**完整**的数据，会反复调用 read\_some 直到读满 buffer | 保证读满 buffer |
**使用场景：**
-   `read_some()`: 协议有明确消息边界（如固定长度），或需要立即处理
    
-   `read()`: 需要读取完整数据时（如读取完整报文头）
    
### receive() vs read()
| API | 行为  | 特点  |
| --- | --- | --- |
| **receive()** | 通过 UDP 风格的接口接收 | 可以用于 UDP 和 TCP |
| **read()** | 仅 TCP，用于流式读取 | 更适合 TCP |
## 总结对比
```text
写入（确保完整）: write() ← 推荐用于TCP
写入（尽可能多）: write_some()
发送（UDP/TCP）: send()
读取（确保完整）: read() ← 推荐用于TCP
读取（尽可能多）: read_some()
接收（UDP/TCP）: receive()
```
**实际开发建议：**
-   TCP通信常用 `write()` 和 `read()`
    
-   UDP通信使用 `send()` 和 `receive()`
    
-   需要精细控制时用 `write_some()` / `read_some()`
    
您是否想让我切换到 Act 模式，在注释中添加这些 API 的说明？
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
-   首先指定连接配置，设置连接哪一个主机，哪一个端口，域名是什么。因一个主机地址可能需要管理多个域名，需要设置 sni 字段来**告诉主机到底需要访问哪一个域名**，具体验证机制[[netease music cover downloader#ssl 验证逻辑|参考]]。
    
-   设置完后进行连接和招手
    
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
-   读写后需要关闭网络流，检验是否关闭
    
-   其他部分就是 json 解析
    
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
## Http 服务端和客户端通信
完整代码参：[[C++ Code Snippets#Http 客户端和服务端通信]]
### 基本知识
#### 架构设计
-   client & server 都能够收发消息：使用了不同的通信方式：
    
    -   服务端 `tcp::socket`
        
        -   Boost.Asio 的基本 TCP 套接字类型
            
        -   底层网络通信的基础组件
            
        -   提供基本的连接、读写功能
            
        -   使用异步操作，直接使用 tcp::socket 配合 Beast 的异步读写函数更高效
            
    -   客户端 `beast::tcp_stream`：
        
        -   Boost.Beast 封装的流类型
            
        -   在 tcp::socket 基础上增加了 HTTP 协议支持
            
        -   提供更好的错误处理和协议兼容性
            
        -   使用同步操作，beast::tcp\_stream 提供更高级的 HTTP 抽象
            
#### 处理流程
-   server 启动，初始化 server 对象，run 函数调用->do\_accept 调用->还没有 client 连接，所以创建一个回调
    
```cpp
[this](beast::error_code ec, tcp::socket socket) {
	if (!ec) {
		std::make_shared<HttpSession>(std::move(socket), this)->run();
	}
	do_accept();
};
```
含义为等接受到新的连接进入之后创建一个 HttpSession 对象并使用 run 启动这个会话，然后再次监听新的连接
-   client 启动，初始化 client 对象，调用 connect 函数但还没有发送消息->server 结检测到有 client 连接，所以 do\_accept 中的回调函数被唤醒
    
-   server 为这个连接创建一个 HttpSession 对象
    
    -   HttpSession 对象初始化这几个对象
        
    -   接受请求内容的缓冲区 buffer\_
        
    -   记录下请求内容的 request\_
        
    -   根据请求内容发送的相应 response\_
        
    -   启动这个 HttpSession 会话对象，调用会话对象的 do\_read 函数用来解析请求从而发送不同的相应
        
    -   会话对象 do\_read 还没有接受到客户端发来的消息
        
        -   同理 do\_read 先创建一个回调函数 do\_read
            
        -   在**当前连接**发送消息时，调用 handle\_request 函数，**但一个会话对象接受到 client 发来的请求之后的回调中没有再次调用 do\_read 函数，当前在接受到消息后如果没有后续 do\_write 函数操作只能读取一次请求**
            
```cpp
[this, self](beast::error_code ec, std::size_t bytes_transferred) {
	if (!ec) {
		handle_request();
	}
}
```
-   client 发送请求（包含请求头/请求体等内容）
    
-   HttpSession 中的 do\_read 被唤醒
    
-   handle\_request路由表生成相应的`http::response<http::string_body> response` 对象请求的相应
    
-   调用 do\_write，将生成的相应数据发送出去
    
-   重新调用 do\_read 让当前连接的会话能够继续监听发来的请求（这保证了同一个 client 能够不断地发送消息，而 server 在一个与 client 的会话（HttpSession）中，必须等待上一个 request 处理完成后才能继续监听（do\_read）下一个请求
    
#### 1\. tcp::acceptor
-   **监听端口**：绑定到特定 IP 地址和端口号，等待客户端连接
    
-   **接受连接**：当有客户端发起连接请求**结束握手**时，acceptor 会接受这个连接
    
-   **创建 socket**：为每个成功的连接创建一个新的 socket，用于与特定客户端通信
    
```cpp
tcp::acceptor acceptor_(ioc);  // 创建acceptor
acceptor_.bind(endpoint);      // 绑定到端口3599
acceptor_.listen();            // 开始监听
acceptor_.async_accept(...);   // 异步接受连接
```
服务器必须有个"门卫"来监听端口并接受来自客户端的连接请求。
#### 2\. tcp::resolver
**tcp::resolver** 是 DNS 解析器，它的作用是：
-   **域名解析**：将主机名（如"example.com"）转换为 IP 地址
    
-   **服务解析**：将服务名（如"http"）转换为端口号
    
```cpp
tcp::resolver resolver_(ioc);
auto results = resolver_.resolve(host, port);  // 解析主机和端口
```
在我们的客户端中，虽然使用的是 IP 地址"127.0.0.1"，但 resolver 仍然需要将字符串形式的端口号"3599"转换为数值形式。
### 注意事项
#### 请求头构建
`req.set()` 函数只能通过 `http::field` 设置请求头中的内容，不能设置请求体，需要使用 `req.body() = body` 返回引用对象然后赋值才可以 `req.prepareload()` 用来**自动计算 Content-Type**头，所以一般在请求中有 body 部分才会调用，否则会浪费性能
#### HttpSession 类中的 HttpSever 裸指针
不能使用 `std::unique_ptr<HttpSession>`
-   一个 HttpServer 对象管理多个 HttpSession 对象
    
-   一个 HttpSession 对象只能被一个 HttpServer 对象管理 有以下两个原因不能使用：
    
-   HttpSession 只是借用 HttpSever 对象的 router\_handler\_对象来使用，并不是独占的，还有其他会话对象也会需要借用 router\_handler
    
-   C++设计 unique\_ptr 语意为一个对象任意时刻一个 unique\_ptr 只能指向，否则发生未定义行为，参考 [[Modern C++#5.3 std unique\_ptr]]
    
#### 类的裸指针成员
既然不能使用 unique\_ptr，那为什么要用裸指针？
-   裸指针能从外部通过构造函数传入，不影响 HttpSession 访问 router\_handler\_
    
-   在 HttpSession 被 RAII 析构时，所有成员都会调用其析构函数释放资源，而指针类型成员则会被系统销毁。指针对象自身占用的资源被释放
    
-   HttpSession 构造函数是**值传递**HttpServer 指针副本，指针成员被删除不影响原对象
    
-   所有 httpsession 对象的指向 httpserver 的指针不属于 httpsession 对象管理，借用者并没有权力接管借用的资源，也**不应该释放 server\_ptr 指向的资源**
    
-   所以只管使用即可，裸指针的生命周期由**自身** RAII 管理，指向的资源**由 HttpServer 对象的 RAII 管理**
    
> [!note] 内存泄漏只会发生在
> 
> -   `delete server_ptr_;` 试图删除不属于自己的内存
>     
> -   双重释放内存
>     
> -   忘记释放自己真正拥有的资源
>     
#### 异步操作中外部指针的生命周期问题
```cpp
// server
void HttpServer::do_accept() {
	acceptor_.async_accept([this](beast::error_code ec, tcp::socket socket) -> void {
		if(!ec) {
			std::make_shared<HttpSession>(std::move(socket), this)->run();
		}
		do_accept();
	});
}
void HttpSession::do_write() {
	auto self = shared_from_this();
	http::async_write(socket_, response_, [this, self](beast::error_code ec, std::size_t bytes_transferred) {
		if(!ec) {
			request_.clear();
			response_.clear();
			do_read();
		}
	});
}
void HttpSession::do_read() {
	auto self = shared_from_this();
	http::async_read(socket_,
					 buffer_,
					 request_,
					 [this, self](beast::error_code ec, std::size_t bytes_transferred) -> void {
						 if(!ec) {
							 handle_request();
						 }
					 });
}
```
可以看到 HttpSession 继承了 `std::enable_shared_from_this<HttpSession>`，因为：
-   异步操作函数**会立刻返回**，不会阻塞线程
    
-   异步操作中使用到的外部**引用/指针资源**可能会失效（触发异步操作的时间在资源对下岗你被销毁之后），导致未定义行为
    
-   do\_read 函数需要用到 HttpServer 类的**成员函数**handler\_request，需要保证异步操作执行的时候 HttpSession 仍然存活才能通过 this 指针调用成员函数
    
-   lambda 函数**捕获列表中的所有内容**生命周期和 lambda 一样长
    
    -   值捕获会直接复制一份，生命周期的绝对保证，但是这里是在 HttpSession 类内部，还没有实例化，所以只能使用指针
        
    -   引用/裸指针捕获拿到引用只能保证引用的变量符号生命周期，不能保证引用对象的生命周期，所以传入 this 无效
        
    -   所以必须使用 shared\_from\_this **复制当前类的 shared 指针**，这样在不使用值捕获的情况下使用指针捕获
        
    -   将 self 放入捕获类表，引用计数**在回调函数还没有执行时一直不为零**
        
#### 前置声明与 PImpl
前置类型的性质有：
-   将符号定义/未找到错误推迟到链接阶段，编译到有问题的文件不会报错
    
-   编译器只是**暂时不寻找定义**，还是会做**类型检查**
    
-   允许声明类/函数/变量（全局或命名空间（需要使用 `namespace{}` 包裹）中）
    
-   不能声明 typedef/using 定义的**类或者模板别名** 所以，对于一些仅用作**数据类/结构体/简单方法**的符号，可以使用前置类型避免更改这些符号的定义时导致**所有 include 这个文件的文件重新编译** 理论上可以在头文件中不包含任何include 语句，但这也会**导致大部分模板/宏/别名**无法使用，**在头文件中写函数的实现会将这个函数内联**，这就需要完整的定义，比如：
    
```cpp
namespace std {class string; };
class Myclass{
public:
	size_t inline_func(std::string str) {str.size();}  // size(()函数不鞥内调用
	// 而std::string内部实现很复杂，调用size会引入一大堆符号，产生连锁反应
};
```
所以最好只在：
-   函数参数类型
    
-   类成员中作为数据类型成员类型
    
-   简单函数的调用
    
-   所有工具函数/类/变量放在一个 utils 文件中，而当前文件只用到其中的几个符号 情况下使用前置声明可以减少编译时间