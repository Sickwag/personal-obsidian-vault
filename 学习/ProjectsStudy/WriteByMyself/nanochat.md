---
created: 2026-02-19
---
# 基础架构
## 通信结构设计
### 枚举消息类型
```cpp
enum class ClientMsgType : int {
	// C -> S 请求
	LoginRequest = 1,
	RegisterRequest,
	//...
};

enum class ServerMsgType : int {
	// S -> C 响应/推送
	LoginResponse = 1,
	RegisterResponse,
	// ...
};
template<typename T>
requires std::is_enum_v<T>
int enum_to_int(T t) {
	return static_cast<int>(t);
}

template<typename T>
int int_to_enum(int i) {
	return static_cast<T>(i);
}
```
枚举类型区分 client 和 server 的消息，通过转换函数相互转换，这是为了以后降低耦合，枚举类型不会以外内在代码中的顺序改变而改变值
### 消息通信结构体设计
```cpp
struct LoginRequest {
	int			 user_id_{};
	std::string	 user_name_{};
	std::string	 password_{};
	ClientMsgType type = ClientMsgType::LoginRequest;

	[[nodiscard]] QJsonObject serialize() const {
		QJsonObject obj;
		obj.insert("type", enum_to_int(type));
		obj.insert("user_id", user_id_);
		obj.insert("user_name", QString::fromStdString(user_name_));
		obj.insert("password", QString::fromStdString(password_));
		return obj;
	}

	[[nodiscard]] static LoginRequest deserialize(const char* data) {
		QJsonObject json = QJsonDocument::fromJson(data).object();
		LoginRequest lr;
		lr.user_id_	 = json["user_id"].toInt();
		lr.user_name_ = json["user_name"].toString().toStdString();
		lr.password_ = json["password"].toString().toStdString();
		return lr;
	}
};
```
包含这几个部分：
- 数据通信成员
- 序列化和反序列化规则，由于客户端和服务端都需要发送（序列化）/接收（反序列化）消息，这样能够隐藏细节，提高内聚
- const 修饰变量和一些内容的生命周期管理，网络中接收的数据类型为保证标准化一般为 `const char*`，所以反序列化需要接收 `const char*`
### 消息处理器
- 发送消息：
	- 通过代码中定义的对象中存储的信息->序列化->加密字符串（或者其他处理）->sql/redis 语句->执行命令
- 接收消息：
	- 通过网络发送过来的字符串->解密消息（或者其他处理）->解序列化得到对象->sql/redis 语句（根据对象中存储的信息操作，避免硬编码问题）->执行命令
```cpp
template <typename Msg>
	requires requires(Msg m) {
		{ m.serialize() } -> std::same_as<QJsonObject>;
	}
QByteArray build_msg(Msg& msg) {
	const QJsonDocument doc(msg.serialize());
	const auto& data = doc.toJson(QJsonDocument::Compact);
	nanochat::Encryptor::instance()->encrypt(data);
	return data;
}

template <typename Msg>
	requires requires(const char* data) {
		{ Msg::deserialize(data) } -> std::same_as<Msg>;
	}
Msg parse_msg(const char* data) {
	const auto& msg = nanochat::Decryptor::instance()->decrypt(data);
	return msg;
}
```
这个模块相当于将加解密/序列化/解序列化的操作合并处理
