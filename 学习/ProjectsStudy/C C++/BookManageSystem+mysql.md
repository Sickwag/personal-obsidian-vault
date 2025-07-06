## 杂项
static 成员函数中不允许使用 const 修饰**方法体**
## 单例模式使用模板
```cpp
#pragma once

using ColumnInfo = std::unordered_map<std::string, std::unordered_set<std::string>>;

class MySQLDB {
public:
	static MySQLDB& get_instance(
		const std::string& host = "",
		int port = 3306,
		const std::string& user = "",
		const std::string& password = "",
		const std::string& db = ""
	) {
		static MySQLDB instance(host, port, user, password, db);
		return instance;
	}

	static MySQLDB& get_instance(sql::ConnectOptionsMap options) {
		static MySQLDB instance(options);
		return instance;
	}

	// 禁止拷贝/移动
	MySQLDB(const MySQLDB&) = delete;
	MySQLDB(MySQLDB&&) = delete;
	MySQLDB& operator=(const MySQLDB&) = delete;
	MySQLDB& operator=(MySQLDB&&) = delete;

	// 数据库操作接口
	void close_connection();

	ColumnInfo describe_table(std::string& table_name, const std::vector<std::string>& info) const;
	std::unique_ptr<sql::ResultSet> query(const std::string& sql);
	int execute(const std::string& sql);

	std::unique_ptr<sql::ResultSet> prepare_query(const std::string& sql, const std::vector<std::string>& params);
	int prepare_execute(const std::string& sql, const std::vector<std::string>& params);
	int prepare_execute(const std::string& sql, const std::vector<std::vector<std::string>>& params);

	void executeFromFile(const std::string& filePath);

	// 事务控制
	void begin_transaction();
	void commit();
	void rollback();

	bool is_connect() const;
	static void print_sql_error(const sql::SQLException& e);

private:
	MySQLDB(const std::string& host, int port, const std::string& user, const std::string& password, const std::string& db = "");
	explicit MySQLDB(sql::ConnectOptionsMap options);

	std::unique_ptr<sql::Connection> con;
	sql::mysql::MySQL_Driver* driver;
};

```

## 现代 C++获取时间
| 需求          | 推荐方法                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------- |
| 获取当前时间戳（毫秒） | `std::chrono::system_clock` + `duration_cast`                                             |
| 获取当前时间字符串   | `std::chrono::system_clock::now()` + `std::put_time`（C++17）或 `std::chrono::format`（C++20） |
| 计时（如性能测试）   | `std::chrono::steady_clock`                                                               |
| 多线程中使用      | `std::chrono` 是线程安全的                                                                      |
| 需要国际化或时区支持  | C++20 的 `std::chrono::zoned_time` 或第三方库（如 `date.h`）                                       |

| 方法                                                   | C++ 版本 | 推荐度  | 说明         |
| ---------------------------------------------------- | ------ | ---- | ---------- |
| `std::chrono::system_clock::now()` + `duration_cast` | C++11  | ✅✅✅  | 获取时间戳（高精度） |
| `std::put_time()` + `std::localtime()`               | C++11  | ✅✅   | 获取格式化时间字符串 |
| `std::chrono::format()`                              | C++20  | ✅✅✅✅ | 更现代的格式化方式  |
| `std::chrono::steady_clock`                          | C++11  | ✅✅✅  | 用于性能计时     |

### 推荐方式
```cpp
// C++17
auto now = std::chrono::system_clock::now();
auto now_c = std::chrono::system_clock::to_time_t(now);
std::tm now_tm = *std::localtime(&now_c);

std::ostringstream oss;
oss << std::put_time(&now_tm, "%Y-%m-%d %H:%M:%S");
std::string now_str = oss.str();

std::cout << "Formatted time: " << now_str << std::endl;
```
这种方式常用于需要解析出年月日时分秒这些**部分时间**的情况，可以使用 `tm->tm_year` 之类的方法获取，也可以通过 ostringstream 或者 format 格式化时间字符串
还可以通过封装结构体和字符串的方式
```cpp
// C++11
std::pair<tm, std::string> utils::get_current_time() {
	auto now = std::chrono::system_clock::now();
	auto now_c = std::chrono::system_clock::to_time_t(now);
	std::tm now_tm = *std::localtime(&now_c);
	std::string now_time_str = std::format("{:%Y-%m-%d %H:%M:%S}", now);
	return std::make_pair(now_tm, now_time_str);
}
```
由于 local_time 会导致 vs 报错，所以可以用更现代的方式模仿 tm 的行为
```cpp
using namespace std::chrono;
system_clock::time_point now = system_clock::now();
zoned_time zt{current_zone(), now};
auto local_time = zt.get_local_time();

// 格式化时间字符串
std::cout << format("{:%Y-%m-%d %H:%M:%S}", local_time) << std::endl;

// 解析为 year/month/day/hours/minutes/seconds 等字段
auto dp = floor<days>(local_time);
auto ymd = year_month_day(dp);
auto tod = make_time(local_time - dp);

std::cout << "Year: " << int(ymd.year()) << ", "
		  << "Month: " << unsigned(ymd.month()) << ", "
		  << "Day: " << unsigned(ymd.day()) << ", "
		  << "Hour: " << tod.hours().count() << ", "
		  << "Minute: " << tod.minutes().count() << ", "
		  << "Second: " << tod.seconds().count() << "\n";

```
### 注意事项
使用 local_time 会被 vs 认为 unsafe，所以尽量少使用结构体（需要 local_time 解析 time_t 类型的时间戳）

## 输入验证
### 输入验证框架
对于这种需要格式化输入的情况
```cpp
void utils::register_user() {
	using namespace std;
	User user;
	string phone, password, nick_name, name, priority, create_at, id;
	cout << "\ninput your phone(11 numbers): ";   cin >> phone;
	cout << "\ninput your password(8~16 characters): ";   cin >> password;
	cout << "\ninput your user name(under 20 characters): ";   cin >> nick_name;
	cout << "\ninput your real name(under 15 characters): ";   cin >> name;
	cout << "\ninput your identity(reader, librarian or system admin): ";   cin >> priority;
	while (true) {
		cout << "\ninput your identity(reader, librarian or system admin): ";
		cin >> priority;
		if (priority == "reader" or priority == "librarian" or priority == "sys_admin") {
			break;
		}
	}
}

```
#### 验证器声明
```cpp
class InputValidator {
private:
	static void handle_input_error(const std::string& error_msg);
	template<typename T>
	static T read_input(
		const std::string& prompt,
		const std::function<bool(const T&)>& validator,
		const std::string error_msg = "Invalid input. Please try again.\n\n"
	);
	template<>
	static std::string read_input<std::string>(
		const std::string& prompt,
		const std::function<bool(const std::string&)>& validator,
		const std::string error_msg
	);
public:
	static std::string regex(
		const std::string& prompt,
		const std::string& pattern,
		const std::string& error_msg = "Input does not match pattern."
	);
	static std::string enum_str(
		const std::string& prompt,
		const std::vector<std::string> options,
		const std::string& error_msg = "Invalid option"
	);
	static std::string str_length(
		const std::string& prompt,
		size_t min_len,
		size_t max_len,
		const std::string& error_msg = "Input length must be between {} and {}."
	);
	static int integer_range(
		const std::string& prompt,
		//std::format_string<int, int> prompt,
		int min,
		int max,
		const std::string& error_msg = "Value must be between {} and {}."
	);
	static std::string not_empty(
		const std::string& prompt,
		const std::string& error_msg = "Input cannot be empty."
	);
	static std::string numeric(
		const std::string& prompt,
		const std::string& error_msg = "Input must be numeric."
	);
};

template<typename T>
inline T InputValidator::read_input(const std::string& prompt, const std::function<bool(const T&)>& validator, const std::string error_msg) {
	T value;
	while (true) {
		std::cout << prompt << '\n';
		std::cin >> value;
		if (std::cin.fail()) handle_input_error(error_msg);
		else if (validator(value)) return value;
		std::cerr << error_msg;
	}
	return T();
}

template<>
inline std::string InputValidator::read_input(const std::string& prompt, const std::function<bool(const std::string&)>& validator, const std::string error_msg) {
	std::string value;
	while (true) {
		std::cout << prompt << '\n';
		std::getline(std::cin, value);
		if (std::cin.fail()) handle_input_error(error_msg);
		else if (validator(value)) return value;
		std::cerr << error_msg;
	}
}
```
#### 验证器实现
如果每一个输入项都使用 while 循环会导致繁琐切工作量大，可以通过实现一个类进行验证
```cpp
void InputValidator::handle_input_error(const std::string& error_msg = "Invalid input. Please try again.\n\n") {
	std::cin.clear();
	std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
	std::cout << error_msg;
}

std::string InputValidator::regex(const std::string& prompt, const std::string& pattern, const std::string& error_msg) {
	std::regex re(pattern);
	return read_input<std::string>(
		prompt,
		[&pattern, &re](const std::string& str) -> bool {return std::regex_match(str, re); },
		error_msg
	);
}

std::string InputValidator::enum_str(const std::string& prompt, const std::vector<std::string> options, const std::string& error_msg) {
	return read_input<std::string>(
		prompt,
		[&options](const std::string& str)->bool {
			return std::find(options.begin(), options.end(), str) != options.end();
		},
		error_msg
	);
}

std::string InputValidator::str_length(const std::string& prompt, size_t min_len, size_t max_len, const std::string& error_msg) {
	return read_input<std::string>(
		prompt,
		[min_len, max_len](const std::string& str) ->bool {
			return str.length() >= min_len && str.length() <= max_len;
		}
	);
}

int InputValidator::integer_range(
	const std::string& prompt,  // 普通字符串参数
	int min,
	int max,
	const std::string& error_msg
) {
	// 手动格式化字符串，不能直接将prompt传入read_input中，因为使用format库的第一参数_Fmt字符串需要在编译期已知，所以常用用法为
	// `format("hello {}", world);`格式字符串必须是编译期常量（如 "hello"字面量），不能是运行时生成的 std::string
	// 同时，format也不接受string_view，原因同样是string_view得到的视图本质上还是来源于运行时生成的string对象
	const std::string formatted_prompt =
		prompt.find("{}") != std::string::npos ?
		std::vformat(prompt, std::make_format_args(min, max)) :
		prompt;

	return read_input<int>(
		formatted_prompt,
		[&](int x) { return x >= min && x <= max; },
		error_msg
	);
}

std::string InputValidator::not_empty(const std::string& prompt, const std::string& error_msg) {
	return read_input<std::string>(
		prompt,
		[](const std::string& str) ->bool { return !str.empty(); },
		error_msg
	);
}

std::string InputValidator::numeric(const std::string& prompt, const std::string& error_msg) {
	return read_input<std::string>(
		prompt,
		[](const std::string& str) -> bool {
			return !str.empty() && std::all_of(str.begin(), str.end(), [](unsigned char c) {
				return std::isdigit(static_cast<unsigned char> (c)); });
		},
		error_msg
	);
}
```
支持长度，枚举类型（通过 vector），正则验证，使用方法
```cpp
int age = InputValidator::integer_range("Enter your age ({}-{}): ", 18, 99);
std::string phone = InputValidator::regex(
    "Enter phone (11 digits): ",
    R"(\d{11})"
);
std::string role = InputValidator::enum_str(
    "Enter role (reader, librarian, sys_admin): ",
    {"reader", "librarian", "sys_admin"}
);
std::string name = InputValidator::length(
    "Enter username (5-20 characters): ",
    5, 20
);
std::string name = InputValidator::not_empty("Enter your name: ");
```
