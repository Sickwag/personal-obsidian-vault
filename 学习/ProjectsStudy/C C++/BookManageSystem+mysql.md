## 杂项
static 成员函数中不允许使用 const 修饰**方法体**
对于明显没有语法错误，继承正确的 C2504 找不到基类错误，可移植性 codemaid 的代码清理工作，自动调整 include 的顺序，解决问题
```cpp
// user.h
#pragma once
#include<string>
#include "mysql_db.h"
#include <cppconn/resultset.h>
#include <any>
#include <memory>
#include <unordered_map>
#include <vector>
class User {
public:
	User(MySQLDB& inited_db);
	std::string id, password, name, nick_name, priority, phone, create_at;
	bool is_avaliable;
	void self_checking() const;
	void change_password();
private:
	MySQLDB& db;
protected:
	MySQLDB& get_db()const;
	void print_result_set(const std::unique_ptr<sql::ResultSet>& rs, bool print_header = true )const ;
};

// librarian.h
#pragma once 
#include "user.h"
#include "utils.h"
class Librarian : public User {
public:
	void add_books() const;
	void check_books_info() const;
	void display_all_books_info() const;
	void change_book_info() const;
	void remove_book() const;
	void custom_check() const;
};

// sys_admin.h
#pragma once
#include "librarian.h"
class Sys_admin : public Librarian {
public:
	void adjust_permission() const;
	void set_anoucement() const;
};
```
```error
严重性	代码	说明	项目	文件	行	抑制状态	详细信息
错误	C2504	“Librarian”: 未定义基类	mysql-connect-demo	D:\Code Files\vsstudio\mysql-connect-demo\mysql-connect-demo\sys_admin.h	5		
```
**![[Pasted image 20250712150300.png]]**
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
需要注意：
- 每个函数体声明为 const 的函数只能调用其他函数体声明为 const 的函数（**const 修饰函数体**的函数不能修改对象的状态，为保证安全所以 C++作此限制）
- 其中 length 和 range 函数的实现中使用了较新的 C++特性 format，让 C++ 能够像 python 一样格式化字符串，需要注意 [[#format 使用限制]]
需要实现**链式调用+组合方法**，一般的设计规则为：
- **允许链式调用**：每个验证方法返回当前对象引用
- **支持多规则组合**：内部维护一个验证器链表，链表每一个节点存储一个链式调用中规定的输入验证规则，最后实现一个 render 函数遍历链表中的所有逻辑
- **支持类型泛化**：适用于 `int`, `std::string`, `double` 等
```cpp
#pragma once
#include <ctime>
#include "user.h"
#include <functional>
#include <regex>

template<typename T>
class InputValidator {
private:
	std::string prompt_;
	std::vector < std::pair < std::function<bool(const T&)>, std::string >> validators_;
	std::string general_error_msg = "Invalid input, please try again.";
	void handle_input_error(const std::string error_msg = general_error_msg) const;

public:
	InputValidator& prompt(const std::string& prompt);
	InputValidator& range(int min, int max, const std::string& error_fmt = "Must be between {} and {}.");
	InputValidator& regex(const std::string& pattern, const std::string& error_msg = "Input does not match pattern.");
	InputValidator& length(size_t min, size_t max, const std::string& error_fmt = "Length must be between {} and {}.");
	InputValidator& not_empty(const std::string& error_msg = "Input cannot be empty.");
	InputValidator& custom(const std::function<bool(const T&)>& condition, const std::string& error_msg);
	T render() const;
};
```
#### 验证器实现
如果每一个输入项都使用 while 循环会导致繁琐切工作量大，可以通过实现一个类进行验证
```cpp
template<typename T>
inline void InputValidator<T>::handle_input_error(const std::string error_msg) const {
	std::cin.clear();
	std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
	std::cout << error_msg << std::endl;
}

template<typename T>
inline InputValidator<T>& InputValidator<T>::prompt(const std::string& prompt) {
	prompt_ = prompt;
	return *this;
}

template<typename T>
inline InputValidator<T>& InputValidator<T>::range(int min, int max, const std::string& error_fmt) {
	std::string msg = std::vformat(error_fmt, std::make_format_args(min, max));
	validators_.emplace_back(
		[min, max](const int& value) { return value >= min && value <= max; },
		msg
	);
	return *this;
}

template<typename T>
inline InputValidator<T>& InputValidator<T>::regex(const std::string& pattern, const std::string& error_msg) {
	std::regex re(pattern);
	validators_.emplace_back(
		[&re](const std::string& s) { return std::regex_match(s, re); },
		error_msg
	);
	return *this;
}

template<typename T>
inline InputValidator<T>& InputValidator<T>::length(size_t min, size_t max, const std::string& error_fmt) {
	std::string msg = std::vformat(error_fmt, std::make_format_args(min, max));
	validators_.emplace_back(
		[min, max](const std::string& s) {return (s.size() >= min && s.size() <= max); },
		msg
	);
	return *this;
}

template<typename T>
inline InputValidator<T>& InputValidator<T>::not_empty(const std::string& error_msg) {
	validators_.emplace_back(
		[](const std::string& s) {return !s.empty(); },
		error_msg
	);
	return *this;
}

template<typename T>
inline InputValidator<T>& InputValidator<T>::custom(const std::function<bool(const T&)>& condition, const std::string& error_msg) {
	validators_.emplace_back(condition, error_msg);
	return *this;
}

template<typename T>
inline T InputValidator<T>::render() const {
	T value{};
	while (true) {
		std::cout << prompt_;
		std::cin >> value;
		if (std::cin.fail()) {
			handle_input_error(general_error_msg);
			continue;
		}
		bool valid = true;
		for (const auto& [cond, msg] : validators_) {
			if (!cond(value)) {
				std::cout << msg << '\n';
				handle_input_error(msg);
				valid = false;
				break;
			}
		}
		if (valid) break;
	}
	return T();
}
```
支持长度，正则验证，使用方法
```cpp

```
### format 使用限制
从 [P2216R3](https://wg21.link/P2216R3) 起，`std::format` 会对格式字符串进行编译时检查（通过辅助类型 std:: format_string 或 std::wformat_string）。如果发现格式字符串与要格式化的实参类型不匹配，则会发出编译错误。如果格式字符串不能作为编译时常量，或者需要避免编译时检查，请使用 std:: vformat 或 fmt 上的 [`std::runtime_format`](mk:@MSITStore:E:\file_storage\Files\各种配置和工具\cppreference-zh-20240915手册.chm::/chmhelp/cpp-utility-format-runtime_format.html) (C++26 起)代替。
在分配失败时抛出 [std::bad_alloc](mk:@MSITStore:E:\file_storage\Files\各种配置和工具\cppreference-zh-20240915手册.chm::/chmhelp/cpp-memory-new-bad_alloc.html)。并且会传播格式化器所抛的任何异常。

意思是，`format(fmt_string，fmt_arg1，fmt_arg2, ...)` 其中，fmt_string 必须是**编译期就能确定的**字符串常量或者字面量，不能传入一个 string 对象（运行期确定的）。
需要使用 `std::vformat(prompt, std::make_format_args(min, max))` 将字符串转化为 format 可以接受的字符串。
不能使用 `string_view`，因为视图仍然是通过一个***已经存在的 string 对象***生成的视图，本质上还是在运行期去决定

> [!Note]
> std:: format 在 C++20 引入，它的核心目标是：
> - 类型安全：确保格式字符串中的占位符 {} 与实际参数类型匹配（避免 printf 式的类型不安全）。
> - 性能优化：在编译期解析格式字符串，避免运行时解析开销。
> - 错误提前暴露：有错误直接在编译期报错，而不是运行时崩溃

- `std::vformat` 是 **纯运行时格式化工具**，它：
    - **不要求** 格式字符串是编译期常量
    - 在运行时解析格式字符串并生成结果
- `std::make_format_args` 将参数打包成 **类型擦除的格式化参数包**（`std::format_args`）
## const 传参问题（以 `string` 为例）
### 1. `const std::string& input`（常量左值引用）
可接受的实参类型
```cpp
void foo(const std::string& input);

// ✅ 可以传入以下类型：
foo("hello");          // (1) 字符串字面量（const char[] 隐式转换为 std::string）
foo(std::string("a")); // (2) 临时 std::string 对象（右值）
std::string s = "hi";
foo(s);                // (3) 已存在的 std::string 对象（左值）
```
- 字符串字面量 `"hello"` 的类型是 `const char[N]`。
- 当传递字面量给 `const std::string&` 时，C++ 会 **隐式构造一个临时 `std::string` 对象**，并绑定到引用上。
- 由于 `const` 引用可以绑定到右值（临时对象），所以这是合法的。

### 2. `std::string& input`（非 const 左值引用）
可接受的实参类型
```cpp
void bar(std::string& input);

// ✅ 可以传入：
std::string s = "hi";
bar(s);                // (1) 非 const 左值对象

// ❌ 不能传入：
bar("hello");          // (2) 错误！不能绑定临时对象到非 const 引用
bar(std::string("a")); // (3) 错误！临时对象是右值
```

- 非 `const` 左值引用 (`std::string&`) 只能绑定到非临时（左值）对象。
- 字面量和 `std::string("a")` 都是临时对象（右值），无法绑定到非 `const` 左值引用（否则会导致悬垂引用问题）。

---

### 3. 扩展：哪些参数类型只能接受对象（不能接受字面量）？
(1) 非 `const` 左值引用 (`T&`)
```cpp
void func(int& x);
int a = 10;
func(a);  // ✅
func(10); // ❌ 不能绑定右值
```

(2) 非 `const` 指针 (`T*`)
```cpp
void func(std::string* s);
std::string str;
func(&str);  // ✅
func(&"hello"); // ❌ 字面量无地址
```

(3) 需要显式构造的类型（无隐式转换）
```cpp
struct MyType { explicit MyType(int); };
void func(MyType x);

func(10);  // ❌ 需要显式构造：func(MyType(10))
```

4. 扩展：哪些参数类型只能接受字面量（不能接受变量）？
(1) C++20 `std::format_string`（编译期字符串检查）
```cpp
#include <format>
void log(std::format_string<int> fmt, int val) {
    std::cout << std::format(fmt, val);
}

log("value: {}", 10);  // ✅ 字面量
std::string s = "{}";
log(s, 10);  // ❌ 需要编译期字符串
```

(2) 模板非类型参数（NTTP, Non-Type Template Parameter）
```cpp
template<size_t N>
void foo(const char (&str)[N]) { /* N 是编译期常量 */ }

foo("hello");  // ✅ N=6（包括 '\0'）
char s[] = "hi";
foo(s);        // ❌ N 无法在编译期推导（除非 s 是 constexpr）
```

5. 总结对比表

| **参数类型**            | **可传入的字面量** | **可传入的对象（变量）** | **可传入的临时对象** | **典型用途** |
|-------------------------|-------------------|-------------------------|----------------------|--------------|
| `const std::string&`    | ✅                | ✅                     | ✅                   | 只读参数     |
| `std::string&`          | ❌                | ✅                     | ❌                   | 可修改参数   |
| `std::string`（值传递） | ✅                | ✅                     | ✅                   | 需要拷贝     |
| `std::string_view`      | ✅                | ✅                     | ✅                   | 只读视图     |
| `std::format_string`    | ✅                | ❌                     | ❌                   | 编译期格式化 |
关键规则总结
1. **`const T&`** 可接受字面量、临时对象、变量（最灵活）。
2. **`T&`** 只能接受非临时对象（左值）。
3. 值传递 (`T`) 接受所有情况，但可能引发拷贝。
4. 编译期约束类型（如 `std::format_string`） 仅接受编译期可知的表达式（如字面量）。

如果希望函数 **仅接受对象**，使用 **非 `const` 左值引用 (`T&`)** 或 **指针 (`T*`)**。
如果希望函数 **仅接受字面量**，使用 **编译期约束类型**（如模板 NTTP 或 `std::format_string`）。

## 常用操作
### 将字符串根据字符串分类存放
[[用法导向知识#按字符（串）划分子串|字符串分类]]中已经提到使用基本 stl 库实现这一功能，但是这里使用 boost 库实现
#### Boost. StringAlgorithms
```cpp
#include <boost/algorithm/string.hpp>
#include <iostream>
#include <vector>

int main() {
    std::string input = "apple,banana,orange,grape";
    std::vector<std::string> result;
    boost::algorithm::split(result, input, boost::algorithm::is_any_of("|"));
    for (const auto& token : result) {
        std::cout << token << std::endl;
    }

    return 0;
}
```
这种方式能够接受字符串作为分割字符串，`boost::algorithm::split` 也可以写成 `boost::split`
### boost::algorithm::split_regex
```cpp
#include <iostream>
#include <vector>
#include <string>
#include <boost/algorithm/string/regex.hpp>

int main() {
    std::string input = "apple||banana||orange||grape";
    std::vector<std::string> result;

    boost::algorithm::split_regex(result, input, boost::regex("\\|\\|"));

    for (const auto& token : result) {
        std::cout << token << std::endl;
    }

    return 0;
}

```
使用正则性能较低，但功能性强
### boost::tokenizer
```cpp
#include <boost/tokenizer.hpp>
#include <iostream>
#include <string>
#include <vector>

int main() {
    std::string input = "apple###banana###orange###grape";
    boost::char_separator<char> sep("###");  // 分隔符为 "###"
    boost::tokenizer<boost::char_separator<char>> tokens(input, sep);

    for (const auto& token : tokens) {
        std::cout << token << std::endl;
    }
    return 0;
}
```
纯粹字符处理，每个结果存放在 tokenizer 中
