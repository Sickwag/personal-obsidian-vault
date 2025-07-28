## Cmake 设置问题
当通过 `settings.json` 和 `CMakePresets.json` 中设置 vcpkg 的 cmake 配置工具链文件都出现了找不到 vcpkg 安装库下对应第三方库文件的 cmake 配置文件时（无法找到 `xxxx-config.cmake`），可能是 cmake 在 `find_package` 命令执行时，按照系统环境变量搜索，而不是按照 `vcpkg/installed` 搜索，有的时候会搜索 anaconda 目录，这是由于安装了 Visual studio 造成。
如果还是找不到 vcpkg 的安装目录或者还是在 anaconda 中寻找：强制指定 vcpkg 库安装目录可以解决
```cpp
set(Boost_DEBUG ON)
set(CMAKE_TOOLCHAIN_FILE "D:\\Program\\vcpkg\\scripts\\buildsystems\\vcpkg.cmake")
set(CMAKE_PREFIX_PATH "D:/Program/vcpkg/installed/x64-windows/" ${CMAKE_PREFIX_PATH})
message(STATUS "CMAKE_PREFIX_PATH: ${CMAKE_PREFIX_PATH}")
```
如果项目中设置了：
```cmake
set (CMAKE_CXX_STANDARD 20)
set (CMAKE_CXX_STANDARD_REQUIRED ON)
```
使用 `cout << __cpluspluse` 还是输出 1997 版本，那么就需要在编译时强制指定
```cpp
target_compile_options(BookManagePlus PRIVATE "/std:c++20" "/Zc:__cplusplus")
```

这时需要在环境变量 path 中调整 vcpkg 安装目录变量到 anaconda 上方，并且删除原有 build 目录，重新通过 cmake 生成工程，即可解决问题
## 杂项
static 成员函数中不允许使用 const 修饰**方法体**
同样，使用 const 修饰方法体的函数无法调用其他不用 const 修饰方法体的函数
模板函数（使用 template 的）必须要在 `.h` 中定义和实现，如果实现放在 `cpp` 文件会出现 `LNK2019` 报错，连接错误。信息类似于 ^quxnvg
```powershell
error LNK2019: 无法解析的外部符号 "public: static class MySQLDB & __cdecl ServiceLocator::get<class MySQLDB>(void)"
error LNK2019: 无法解析的外部符号 "public: static void __cdecl ServiceLocator::provide<class MySQLDB>(class std::shared_ptr<class MySQLDB>)"
fatal error LNK1120: 2 个无法解析的外部命令
```
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
template <typename T>
class InputValidator {
   public:
    using ValidatorFunc = std::function<bool(const T&)>;
    using ValidatorPair = std::pair<ValidatorFunc, std::string>;
    InputValidator();
    bool validate(const T& input) const;
    InputValidator& prompt(const std::string& prompt);
    InputValidator& enum_str(const std::vector<std::string>& allowed, const std::string& error_msg = "You must input one of ({}).");
    
    template <typename U = T, typename = std::enable_if_t<std::is_arithmetic_v<U>>>
    InputValidator& range(U min, U max, const std::string& error_fmt = "Must be between {} and {}.");
    InputValidator& regex(const std::string& pattern, const std::string& error_msg = "Input does not match the required pattern.");
    InputValidator& length_range(size_t min, size_t max, const std::string& error_fmt = "Length must be between {} and {}.");
    InputValidator& not_emtpy(const std::string& error_msg = "Input cannot be empty.");
    InputValidator& not_contains(const std::vector<std::string>& not_allowed, const std::string& error_msg = "Input must not contain ({}).");
    InputValidator& contains(const std::vector<std::string>& must_contains, const std::string& error_msg = "Input must contain ({}).");
    InputValidator& custom(ValidatorFunc condition, const std::string& error_msg);
    InputValidator& yes_or_no(const std::string& error_msg = "Please input yes (Y, Yes, YES) or no (N, No, NO).");
    InputValidator& email(const std::string& error_msg = "Invalid email format.");
    InputValidator& url(const std::string& error_msg = "Invalid URL format.");
    InputValidator& numeric(const std::string& error_msg = "Input must be a valid number.");
    InputValidator& date(const std::string& error_msg = "Invalid date format. Use YYYY-MM-DD.");
    InputValidator& password_strength(const std::string& error_msg = "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.");
    T render() const;

   private:
    std::string prompt_;
    std::string general_error_msg_;
    std::vector<ValidatorPair> validators_;
    void handleInputError(const std::string& error_msg) const;
};
```
#### 验证器实现
如果每一个输入项都使用 while 循环会导致繁琐切工作量大，可以通过实现一个类进行验证
```cpp
template <typename T>
InputValidator<T>::InputValidator()
    : prompt_("Input: "), general_error_msg_("Invalid input, please try again.") {}

template <typename T>
InputValidator<T>& InputValidator<T>::prompt(const std::string& prompt) {
    if (!prompt.empty()) {
        prompt_ = prompt;
    }
    return *this;
}

template <typename T>
InputValidator<T>& InputValidator<T>::enum_str(const std::vector<std::string>& allowed, const std::string& error_msg) {
    if (allowed.empty()) {
        throw std::invalid_argument("Allowed list cannot be empty.");
    }
    std::string allowed_str = std::accumulate(allowed.begin() + 1, allowed.end(), allowed[0],
                                              [](const std::string& a, const std::string& b) { return a + ", " + b; });
    std::string msg = std::format(error_msg, allowed_str);
    validators_.emplace_back(
        [allowed](const std::string& s) {
            return std::find(allowed.begin(), allowed.end(), s) != allowed.end();
        },
        msg);
    return *this;
}

template <typename T>
template <typename U, typename>
InputValidator<T>& InputValidator<T>::range(U min, U max, const std::string& error_fmt) {
    std::string msg = std::format(error_fmt, min, max);
    validators_.emplace_back(
        [min, max](const U& value) { return value >= min && value <= max; },
        msg);
    return *this;
}

template <typename T>
InputValidator<T>& InputValidator<T>::regex(const std::string& pattern, const std::string& error_msg) {
    std::regex re(pattern);
    validators_.emplace_back(
        [re](const std::string& s) { return std::regex_match(s, re); },
        error_msg);
    return *this;
}

template <typename T>
InputValidator<T>& InputValidator<T>::length_range(size_t min, size_t max, const std::string& error_fmt) {
    std::string msg = std::format(error_fmt, min, max);
    validators_.emplace_back(
        [min, max](const std::string& s) { return s.size() >= min && s.size() <= max; },
        msg);
    return *this;
}

template <typename T>
InputValidator<T>& InputValidator<T>::not_emtpy(const std::string& error_msg) {
    validators_.emplace_back(
        [](const std::string& s) { return !s.empty(); },
        error_msg);
    return *this;
}

template <typename T>
InputValidator<T>& InputValidator<T>::not_contains(const std::vector<std::string>& not_allowed, const std::string& error_msg) {
    if (not_allowed.empty())
        return *this;
    std::string not_allowed_str = std::accumulate(not_allowed.begin() + 1, not_allowed.end(), not_allowed[0],
                                                  [](const std::string& a, const std::string& b) { return a + ", " + b; });
    std::string msg = std::format(error_msg, not_allowed_str);
    validators_.emplace_back(
        [not_allowed](const std::string& s) {
            return std::none_of(not_allowed.begin(), not_allowed.end(),
                                [&s](const std::string& str) { return s.find(str) != std::string::npos; });
        },
        msg);
    return *this;
}

template <typename T>
InputValidator<T>& InputValidator<T>::contains(const std::vector<std::string>& must_contains, const std::string& error_msg) {
    if (must_contains.empty())
        return *this;
    std::string must_contains_str = std::accumulate(must_contains.begin() + 1, must_contains.end(), must_contains[0],
                                                    [](const std::string& a, const std::string& b) { return a + ", " + b; });
    std::string msg = std::format(error_msg, must_contains_str);
    validators_.emplace_back(
        [must_contains](const std::string& s) {
            return std::all_of(must_contains.begin(), must_contains.end(),
                               [&s](const std::string& str) { return s.find(str) != std::string::npos; });
        },
        msg);
    return *this;
}

template <typename T>
InputValidator<T>& InputValidator<T>::custom(ValidatorFunc condition, const std::string& error_msg) {
    validators_.emplace_back(condition, error_msg);
    return *this;
}

template <typename T>
InputValidator<T>& InputValidator<T>::yes_or_no(const std::string& error_msg) {
    validators_.emplace_back(
        [](const std::string& s) {
            std::string lower_s = s;
            std::transform(lower_s.begin(), lower_s.end(), lower_s.begin(), ::tolower);
            return lower_s == "y" || lower_s == "yes" || lower_s == "n" || lower_s == "no";
        },
        error_msg);
    return *this;
}

template <typename T>
InputValidator<T>& InputValidator<T>::email(const std::string& error_msg) {
    return regex(R"(^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$)", error_msg);
}

template <typename T>
InputValidator<T>& InputValidator<T>::url(const std::string& error_msg) {
    return regex(R"(^(https?://)?([a-zA-Z0-9.-]+)(\.[a-zA-Z]{2,})(:\d+)?(/.*)?$)", error_msg);
}

template <typename T>
InputValidator<T>& InputValidator<T>::numeric(const std::string& error_msg) {
    return regex(R"(^-?\d+(\.\d+)?([eE][-+]?\d+)?$)", error_msg);
}

template <typename T>
InputValidator<T>& InputValidator<T>::date(const std::string& error_msg) {
    return regex(R"(^\d{4}-\d{2}-\d{2}$)", error_msg);
}

template <typename T>
InputValidator<T>& InputValidator<T>::password_strength(const std::string& error_msg) {
    validators_.emplace_back(
        [](const std::string& s) {
            bool has_upper = std::any_of(s.begin(), s.end(), ::isupper);
            bool has_lower = std::any_of(s.begin(), s.end(), ::islower);
            bool has_digit = std::any_of(s.begin(), s.end(), ::isdigit);
            bool has_special = std::any_of(s.begin(), s.end(), [](char c) { return !std::isalnum(c); });
            return has_upper && has_lower && has_digit && has_special;
        },
        error_msg);
    return *this;
}

template <typename T>
bool InputValidator<T>::validate(const T& input) const {
    for (const auto& validator_pair : validators_) {
        if (!validator_pair.first(input)) {
            return false;
        }
    }
    return true;
}
template <typename T>
T InputValidator<T>::render() const {
    T value;
    while (true) {
        std::cout << prompt_;
        std::cin >> value;
        if (std::cin.fail()) {
            handleInputError(general_error_msg_);
            continue;
        }
        bool valid = true;
        for (const auto& [cond, msg] : validators_) {
            if (!cond(value)) { // Changed from cond(value) to cond(value)
                std::cout << msg << '\n';
                handleInputError(msg);
                valid = false;
                break;
            }
        }
        if (valid)
            break;
    }
    return value;
}

template <typename T>
void InputValidator<T>::handleInputError(const std::string& error_msg) const {
    std::cin.clear();
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    std::cout << error_msg << std::endl;
}
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

### 异步链接数据库
```cpp
#pragma once

#include <boost/asio.hpp>
#include <boost/mysql.hpp>
#include <boost/mysql/pfr.hpp>
#include <string_view>
#include <vector>
#include <stdexcept>
namespace mysql = boost::mysql;
namespace asio = boost::asio;
using asio::awaitable;
using asio::use_awaitable;

// 连接配置结构体
struct conn_cfg {
    std::string host;
    std::uint16_t port = 3306;
    std::string user;
    std::string password;
    std::string database;
    mysql::ssl_mode ssl = mysql::ssl_mode::disable;
};

// SQL错误异常类
struct sql_error : std::runtime_error {
    using std::runtime_error::runtime_error;
};

// 用户结构体示例
struct user {
    std::optional<int> id;
    std::optional<std::string> name;
};

// MySQL数据库操作类
class MySQLDB {
public:
    explicit MySQLDB(asio::any_io_executor ex) : conn_(ex) {}
    awaitable<void> connect(const conn_cfg& cfg);
    awaitable<void> execute(std::string_view sql);
    awaitable<void> execute_script(const std::string& script);
    awaitable<void> execute_multi(std::string_view sql_batch);

    template <typename... Args>
    awaitable<mysql::results> query(std::string_view sql, Args&&... args) {
        auto stmt = co_await conn_.async_prepare_statement(sql, use_awaitable);
        mysql::results res;
        co_await conn_.async_execute(stmt.bind(std::forward<Args>(args)...), res, use_awaitable);
        co_return res;
    }

    template <typename T>
    awaitable<std::vector<T>> query_into(std::string_view sql) {
        mysql::static_results<mysql::pfr_by_name<T>> res;
        co_await conn_.async_execute(sql, res);
        std::vector<T> results;
        if(res.rows().empty()) {
            throw std::runtime_error("sql matched nothing.");
            co_return std::vector<T>();
        }else{
            for(const auto& row : res.rows()){
                const T& res_struct = row;
                results.emplace_back(res_struct);
            }
        }
        co_return results;
    }
    awaitable<void> begin();
    awaitable<void> commit();
    awaitable<void> rollback();
    awaitable<void> close() noexcept;

private:
    mysql::any_connection conn_;
    static std::vector<std::string_view> split_script(const std::string& script);
};
```

如果运行连接数据库功能时，提示 ssl plugin 缺失，需要传入 `mysql::ssl_mode ssl = mysql::ssl_mode::disable;` 打开 ssl 开关
其中 query 支持预处理传参，其实现依赖的是[[Modern C++#Note：完美转发|完美转发]]
```cpp
template <typename... Args>
awaitable<mysql::results> query(std::string_view sql, Args&&... args) {
    auto stmt = co_await conn_.async_prepare_statement(sql, use_awaitable);
    mysql::results res;
    co_await conn_.async_execute(stmt.bind(std::forward<Args>(args)...), res, use_awaitable);
    co_return res;
}
```
实现数据库基本功能：
- 单条执行 sql 语句
- 多条执行 sql 语句
- 执行 sql 脚本
- 解析简单结构体
- 事务处理
- 自定义异常类型
示例函数实现：
```cpp
// MySQLDB.cpp
#include "../include/MySQLDB.h"
#include <fstream>
#include <boost/algorithm/string/trim.hpp>
#include "MySQLDB.h"

namespace mysql = boost::mysql;
namespace asio = boost::asio;
using asio::awaitable;
using asio::use_awaitable;

// 连接到数据库
awaitable<void> MySQLDB::connect(const conn_cfg& cfg) {
    mysql::connect_params params;
    params.server_address.emplace_host_and_port(cfg.host, cfg.port);
    params.username = cfg.user;
    params.password = cfg.password;
    params.database = cfg.database;
    params.ssl = cfg.ssl;

    co_await conn_.async_connect(params, use_awaitable);
}

// ---------- 1. 执行单条语句 ----------
awaitable<void> MySQLDB::execute(std::string_view sql) {
    mysql::results res;
    auto stmt = co_await conn_.async_prepare_statement(sql, use_awaitable);
    co_await conn_.async_execute(stmt.bind(), res, use_awaitable);
    if (res.affected_rows() == static_cast<std::uint64_t>(-1))
        throw sql_error("execute failed");
}

// ---------- 2. 执行整个SQL脚本 ----------
awaitable<void> MySQLDB::execute_script(const std::string& script_path) {
    std::ifstream ifs(script_path);
    if(!ifs){
        throw std::runtime_error("cannot open " + script_path + " this file");
    }
    std::ostringstream oss;
    oss<<ifs.rdbuf();
    std::string content = oss.str();
    std::vector<std::string_view> stmts = split_script(content);
    for (const auto& stmt : stmts) {
        if (!stmt.empty()) {
            co_await execute(stmt);
        }
    }
}

awaitable<void> MySQLDB::execute_multi(std::string_view sql_batch) {
    auto executor = co_await boost::asio::this_coro::executor;
    std::vector<std::string_view> statements;

    size_t start = 0;
    bool in_statement = false;

    // 手动解析：跳过空白，按 ';' 拆分
    for (size_t i = 0; i <= sql_batch.size(); ++i) {
        if (i < sql_batch.size()) {
            char c = sql_batch[i];
            if (!std::isspace(static_cast<unsigned char>(c))) {
                if (!in_statement) {
                    start = i;
                    in_statement = true;
                }
            }
            if (c == ';' && in_statement) {
                size_t len = i - start;
                if (len > 0) {
                    statements.emplace_back(sql_batch.substr(start, len));
                }
                in_statement = false;
            }
        } else {
            if (in_statement) {
                size_t len = sql_batch.size() - start;
                statements.emplace_back(sql_batch.substr(start, len));
            }
        }
    }
    for (auto& stmt : statements) {
        auto trimmed = boost::trim_copy(std::string(stmt));
        if (!trimmed.empty()){
            co_await execute(stmt);
        }
    }
    co_return;
}

// ---------- 5. 事务操作 ----------
awaitable<void> MySQLDB::begin() { co_await execute("START TRANSACTION"); }
awaitable<void> MySQLDB::commit() { co_await execute("COMMIT"); }
awaitable<void> MySQLDB::rollback() { co_await execute("ROLLBACK"); }

// ---------- 6. 关闭连接 ----------
awaitable<void> MySQLDB::close() noexcept {
    boost::system::error_code ec;
    co_await conn_.async_close(asio::redirect_error(use_awaitable, ec));
}

// 分割SQL脚本为多个语句
std::vector<std::string_view> MySQLDB::split_script(const std::string& script) {
    std::vector<std::string_view> statements;
    size_t start = 0;
    size_t pos = 0;
    
    while (pos < script.length()) {
        // 查找分号
        pos = script.find(';', start);
        if (pos == std::string_view::npos) {
            pos = script.length();
        }
        
        // 提取语句
        std::string_view stmt = script.substr(start, pos - start);
        
        // 去除首尾空白字符
        while (!stmt.empty() && (stmt.front() == ' ' || stmt.front() == '\t' || stmt.front() == '\n' || stmt.front() == '\r')) {
            stmt.remove_prefix(1);
        }
        while (!stmt.empty() && (stmt.back() == ' ' || stmt.back() == '\t' || stmt.back() == '\n' || stmt.back() == '\r')) {
            stmt.remove_suffix(1);
        }
        
        if (!stmt.empty()) {
            statements.push_back(stmt);
        }
        start = pos + 1;
    }
    
    return statements;
}
```
示例使用：
```cpp
awaitable<void> Reader::login_with_pwd(const std::string& name, const std::string& password) {
    // 使用db_执行登录验证的SQL语句
    auto result = co_await db_.query("SELECT * FROM users WHERE name_ = ? AND password_ = ?", name, password);
    if (result.rows().empty()) {
        throw std::runtime_error("Invalid username or password");
    }
    // 可以在这里添加更多登录后的处理逻辑
}
```
## 服务注册管理
### 问题背景
- 有一些“模块类”（如 Reader，Librarian 这些类）需要一些“服务类”（如 MySQLDB 提供数据库连接，Logger 提供日志记录）提供的功能
- 由于这些类的功能大多比较复杂，往往只需要其中的部分功能，如果在每一个模块类中都加上这些服务对象成员，这样会导致实例化资源浪费、连接爆炸、难以管理
- 如果每个“模块类”中的“服务类”对象都使用引用传递，这样可以解决资源浪费问题，但是每个“模块类”实例化都需要
	- 提前创建***生命周期长于模块类对象***的服务类对象，将对象传入模块类的构造函数中
	- 如果模块类需要的服务很多，构造函数需要传入很多参数，可读性降低，不好维护
	- 新增模块类的时候需要了解底层实现，了解各类服务都是什么
### 解决方案
创建服务管理类对象，统一管理所有服务，为**所有模块**提供服务
```cpp
#pragma once
#include <functional>
#include <memory>
#include <mutex>
#include <typeindex>
#include <unordered_map>

class ServiceLocator {
   private:
    static std::mutex mtx_;
    static std::unordered_map<std::type_index, std::shared_ptr<void>> services_;

   public:
    // 手动注册服务
    template <typename T>
    static void provide(std::shared_ptr<T> service) {
        std::lock_guard<std::mutex> lock(mtx_);
        services_[std::type_index(typeid(T))] = std::static_pointer_cast<void>(service);
    }
    template <typename T>
    static T& get() {
        std::lock_guard<std::mutex> lock(mtx_);
        auto it = services_.find(std::type_index(typeid(T)));
        if (it == services_.end()) {
            throw std::runtime_error("Service not registered: " + std::string(typeid(T).name()));
        }
        return *std::static_pointer_cast<T>(it->second);
    }

    // // 检查是否已注册
    template <typename T>
    static bool has() {
        std::lock_guard<std::mutex> lock(mtx_);
        return services_.find(std::type_index(typeid(T))) != services_.end();
    }

    // // 清理（可选，用于测试）
    static void reset() {
        std::lock_guard<std::mutex> lock(mtx_);
        services_.clear();
    }
};

inline std::mutex ServiceLocator::mtx_;
inline std::unordered_map<std::type_index, std::shared_ptr<void>> ServiceLocator::services_;
```

### 注意事项和使用
- 函数模板实现放在头文件中，否则会引发 LNK 2019 错误 ![[BookManageSystem+mysql#^quxnvg]]
- 类型指针和引用转换
	- 因为 services_中存储的“服务”是任意类型的，所以 `it->second` → 类型是 `std::shared_ptr<void>`，它是一个“类型擦除”的智能指针，**指向一个 `T` 类型的对象，但编译器不知道具体类型**
	- `static_pointer_cast` 是 `shared_ptr` 的类型转换工具,它不改变引用计数，只做指针转换（类似 `static_cast<T*>(ptr)`）,转换后得到：`std::shared_ptr<T>`
	- 对 `std::shared_ptr<T>` 解引用 `*std::shared_ptr<T>  →  T&`，最终返回的是：**一个对原始对象的引用（`T&`）**
- 服务管理逻辑：
	- provide 函数接受任意类型的对象，他们都是“服务”，本质是 MySQLDB，Logger 这些提供各式各样功能的类。每个将会被用到的服务类由 service_locator 管理。每调用一次 provide 就会将一个已经初始化的服务加入到管理，任意的模块如果需要这些服务，需新增一个这些服务的**引用成员变量**。
	- get 函数可以获取对应服务的指针，通过在 services_中搜索对应服务，通过 `*std::static_pointer_cast<T>(it->second)` 返回对应指针给模块调用。这样每个模块通过 get 调用的指针都会指向同一个服务类实例，节省了资源开销，通过指针传递服务也加快了速度。
	- 正应为 services_中是 `std::unordered_map<std::type_index, std::shared_ptr<void>>` 结构，所以 ServiceLocator 中每个服务只能存在一个，如果需要多种相同但由细微差异的服务则需要改变 services_的数据结构，然后在 get 函数传入参数来选中具体需要哪一个服务。
- 使用方法
```cpp
class Reader {
public:
    Reader() : db_(ServiceLocator::get<MySQLDB>()) {}
    /* 其他方法 */
}
```

## 邮件发送
### 问题背景
需要实现验证码功能，这里使用邮箱实现
### 实现方法
#### 使用 C++ libcurl 库实现
定义
```cpp
class SimpleEmailSender {
   public:
    bool send_email(const std::string& smtp_server,
                           int port,
                           const std::string& username,
                           const std::string& password,
                           const std::string& from,
                           const std::string& to,
                           const std::string& subject,
                           const std::string& body,
                           const std::vector<std::string>& attachments);
   private:
    std::string simple_base64_encode(const std::string& data);
    std::vector<std::string> encode_file_chunks(const std::string& filepath);
    std::string get_filename(const std::string& filepath);
    void prepare_email_content(EmailData& email_data,
                               const std::string& from,
                               const std::string& to,
                               const std::string& subject,
                               const std::string& body,
                               const std::vector<std::string>& attachments);
    size_t payload_source(void* ptr, size_t size, size_t nmemb, void* userp);
};
```
实现
```cpp
#include "email_sender.h"
#include <curl/curl.h>
#include <algorithm>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
struct EmailData {
    std::vector<std::string> parts;
    size_t current_part;
    size_t pos_in_part;
};


// 简单的base64编码（简化版）
std::string SimpleEmailSender::simple_base64_encode(const std::string& data) {
    static const char* chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    std::string result;
    int val = 0, valb = -6;

    for (unsigned char c : data) {
        val = (val << 8) + c;
        valb += 8;
        while (valb >= 0) {
            result.push_back(chars[(val >> valb) & 0x3F]);
            valb -= 6;
        }
    }
    if (valb > -6)
        result.push_back(chars[((val << 8) >> (valb + 8)) & 0x3F]);
    while (result.size() % 4)
        result.push_back('=');
    return result;
}

// 分块读取文件并编码
std::vector<std::string> SimpleEmailSender::encode_file_chunks(const std::string& filepath) {
    std::vector<std::string> chunks;
    std::ifstream file(filepath, std::ios::binary);
    if (!file.is_open()) {
        throw std::runtime_error("Cannot open file: " + filepath);
    }

    const size_t chunk_size = 57;  // base64编码后为76字符
    char buffer[chunk_size];

    while (file.read(buffer, chunk_size) || file.gcount() > 0) {
        std::string chunk(buffer, file.gcount());
        chunks.push_back(simple_base64_encode(chunk) + "\r\n");
    }

    return chunks;
}

std::string SimpleEmailSender::get_filename(const std::string& filepath) {
    size_t pos = filepath.find_last_of("/\\");
    return (pos != std::string::npos) ? filepath.substr(pos + 1) : filepath;
}

// 准备邮件内容
void SimpleEmailSender::prepare_email_content(EmailData& email_data,
                                              const std::string& from,
                                              const std::string& to,
                                              const std::string& subject,
                                              const std::string& body,
                                              const std::vector<std::string>& attachments) {
    std::string boundary = "----=_NextPart_SimpleBoundary";

    if (attachments.empty()) {
        // 简单邮件
        std::stringstream ss;
        ss << "From: " << from << "\r\n"
           << "To: " << to << "\r\n"
           << "Subject: " << subject << "\r\n"
           << "\r\n"
           << body << "\r\n"
           << ".\r\n";
        email_data.parts.push_back(ss.str());
    } else {
        // 多部分邮件 - 头部
        std::stringstream ss;
        ss << "From: " << from << "\r\n"
           << "To: " << to << "\r\n"
           << "Subject: " << subject << "\r\n"
           << "MIME-Version: 1.0\r\n"
           << "Content-Type: multipart/mixed; boundary=" << boundary << "\r\n"
           << "\r\n"
           << "This is a multi-part message in MIME format.\r\n"
           << "--" << boundary << "\r\n"
           << "Content-Type: text/plain; charset=UTF-8\r\n"
           << "\r\n"
           << body << "\r\n";
        email_data.parts.push_back(ss.str());

        // 每个附件
        for (const auto& filepath : attachments) {
            try {
                // 附件分隔符
                std::stringstream header_ss;
                header_ss << "\r\n--" << boundary << "\r\n"
                          << "Content-Type: application/octet-stream\r\n"
                          << "Content-Transfer-Encoding: base64\r\n"
                          << "Content-Disposition: attachment; filename=\"" << get_filename(filepath) << "\"\r\n"
                          << "\r\n";
                email_data.parts.push_back(header_ss.str());

                // 附件内容（分块添加）
                auto chunks = encode_file_chunks(filepath);
                for (const auto& chunk : chunks) {
                    email_data.parts.push_back(chunk);
                }
            } catch (const std::exception& e) {
                std::cerr << "Warning: Failed to process attachment " << filepath << ": " << e.what() << std::endl;
            }
        }

        // 结束边界
        std::stringstream end_ss;
        end_ss << "\r\n--" << boundary << "--\r\n.\r\n";
        email_data.parts.push_back(end_ss.str());
    }
}

size_t SimpleEmailSender::payload_source(void* ptr, size_t size, size_t nmemb, void* userp) {
    EmailData* data = static_cast<EmailData*>(userp);
    size_t max_size = size * nmemb;
    size_t copied = 0;
    char* buffer = static_cast<char*>(ptr);

    while (data->current_part < data->parts.size() && copied < max_size) {
        const std::string& part = data->parts[data->current_part];
        size_t part_remaining = part.size() - data->pos_in_part;

        if (part_remaining > 0) {
            // size_t to_copy = std::min(max_size - copied, part_remaining);
            size_t to_copy = max_size - copied > part_remaining ? part_remaining : max_size - copied;
            memcpy(buffer + copied, part.data() + data->pos_in_part, to_copy);
            data->pos_in_part += to_copy;
            copied += to_copy;
        }

        if (data->pos_in_part >= part.size()) {
            data->current_part++;
            data->pos_in_part = 0;
        }
    }
    return copied;
}

bool SimpleEmailSender::send_email(const std::string& smtp_server,
                                   int port,
                                   const std::string& username,
                                   const std::string& password,
                                   const std::string& from,
                                   const std::string& to,
                                   const std::string& subject,
                                   const std::string& body,
                                   const std::vector<std::string>& attach_files) {
    CURL* curl = curl_easy_init();
    if (!curl)
        return false;

    CURLcode res = CURLE_OK;
    struct curl_slist* recipients = nullptr;

    // 设置基本SMTP参数
    std::string url = "smtp://" + smtp_server + ":" + std::to_string(port);
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_USE_SSL, (long)CURLUSESSL_ALL);
    curl_easy_setopt(curl, CURLOPT_USERNAME, username.c_str());
    curl_easy_setopt(curl, CURLOPT_PASSWORD, password.c_str());
    curl_easy_setopt(curl, CURLOPT_MAIL_FROM, from.c_str());

    recipients = curl_slist_append(recipients, to.c_str());
    curl_easy_setopt(curl, CURLOPT_MAIL_RCPT, recipients);

    // 准备邮件数据
    EmailData email_data = {};
    email_data.current_part = 0;
    email_data.pos_in_part = 0;

    try {
        prepare_email_content(email_data, from, to, subject, body, attach_files);
    } catch (const std::exception& e) {
        std::cerr << "Error preparing email: " << e.what() << std::endl;
        curl_slist_free_all(recipients);
        curl_easy_cleanup(curl);
        return false;
    }

    // 设置数据读取回调
    curl_easy_setopt(curl, CURLOPT_READFUNCTION, payload_source);
    curl_easy_setopt(curl, CURLOPT_READDATA, &email_data);
    curl_easy_setopt(curl, CURLOPT_UPLOAD, 1L);
    // curl_easy_setopt(curl, CURLOPT_VERBOSE, 1L); // send email process debug

    res = curl_easy_perform(curl);

    if (res != CURLE_OK) {
        std::cerr << "curl_easy_perform() failed: " << curl_easy_strerror(res) << std::endl;
    }else {
        std::cout << "send email from " + from + " to " + to + " successfully!";
    }

    curl_slist_free_all(recipients);
    curl_easy_cleanup(curl);

    return res == CURLE_OK;
}
```

### 使用 python 脚本实现
#### 脚本实现
```cpp
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication


def send_mail(sender_email, receiver_email, sender_password):
    # 创建邮件
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = "带附件的邮件示例"

    # 添加邮件正文
    message.attach(MIMEText("这是一封带附件的邮件。", "plain"))

    # 添加附件
    with open("附件文件.txt", "rb") as attachment:
        part = MIMEApplication(attachment.read(), Name="附件文件.txt")
        part["Content-Disposition"] = 'attachment; filename="附件文件.txt"'
        message.attach(part)

    # 连接到SMTP服务器并发送邮件
    try:
        with smtplib.SMTP("smtp.126.com", 25) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, receiver_email, message.as_string())
        print("带附件的邮件已发送成功！")
    except smtplib.SMTPAuthenticationError:
        print(
            "认证失败：请检查邮箱地址和授权码是否正确，并确认已在126邮箱设置中开启SMTP服务"
        )
    except smtplib.SMTPException as e:
        print(f"发送邮件时出错：{e}")
    except Exception as e:
        print(f"发生未知错误：{e}")


def main():
    # 发件人和收件人信息
    # sender_email = "3540825116@qq.com"
    sender_email = "AzzatoWaydell@126.com"
    receiver_email = "Sickwag@outlook.com"
    # 注意：这里需要填写126邮箱的授权码，而不是登录密码
    # 请在126邮箱设置中开启SMTP服务并获取授权码
    password = "HRUyUsZP3RwgnFz4"  # 请替换为实际的授权码
    send_mail(sender_email, receiver_email, password)
```
这样会将参数硬编码在代码中，如果需要参数执行，需要先用 C++调用 python 脚本，然后输入参数
#### C++调用 python 方法
命令行调用
```cpp
#include <cstdlib>

int main() {
    // 直接拼接命令字符串
    const char* cmd = "python script.py arg1 arg2";
    int status = std::system(cmd); // 执行命令
    if (status != 0) {
        std::cerr << "Python脚本执行失败" << std::endl;
    }
    return 0;
}
```
使用boost.python 实现
```cpp
#include <boost/python.hpp>

int main() {
    Py_Initialize();
    
    boost::python::object module = boost::python::import("script");
    boost::python::object result = module.attr("main")("arg1", "arg2");
    
    std::cout << "Result: " << boost::python::extract<std::string>(result) << std::endl;
    
    Py_Finalize();
    return 0;
}
```