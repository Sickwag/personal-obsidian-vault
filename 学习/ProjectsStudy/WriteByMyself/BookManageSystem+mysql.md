## 杂项
### 语法规定
- static 成员函数中不允许使用 const 修饰**方法体**
- 同样，使用 const 修饰方法体的函数无法调用其他不用 const 修饰方法体的函数
- 如果一个类中有结构体/联合体**非静态**成员，在**类内**访问这些结构体需要使用 `this->struct_name`，而不能使用 `.` 访问
- 字符串转为 `const char*` 类型需要 string 对象使用 `.c_str()` 方法
- 如果需要将一个元素插入到 `vector` 的任意位置，可以使用 `insert(位置迭代器, 插入元素)` 或者 `emplace(位置迭代器, 插入元素)` 两种方法，emplace 就地构造要快一点。如果是频繁地插入建议使用 `deque` 队列实现
- 如果一个函数返回引用，最好也用 `auto&` 类型变量接收，像[[#服务注册管理|访问注册器]]中返回类型为引用，如果使用普通变量接受则是通过引用类型（右值）赋值给普通变量（对象）左值，这样不会对变量内部产生实质性影响
  ```cpp
// 正确方法
auto& db_config = ServiceLocator::get<DBConfig>();
db_config.host = "mysql2.sqlpub.com";
db_config.port = 3307;
db_config.user = "sickwag";
db_config.password = "LqX9jBDqvDJYeooE";
db_config.database = "sickwag_learning";
db_config.ssl = mysql::ssl_mode::enable;
// 如果使用普通变量，那么get函数返回的配置仍然是空的
auto db_config = ServiceLocator::get<DBConfig>();
  ```
- 非模板函数不能放在头文件中，否则会出现类似"多重定义"某个符号的 msvc 生成错误：
  ```cpp
[build]   正在生成代码...
  [build] identities.obj : error LNK2005: "void __cdecl get_weather(void)" (?get_weather@@YAXXZ) 已经在 main.obj 中定义 [D:\Code Files\vscode\CCpp\projects\BookManagePlus\build\BookManagePlus.vcxproj]
  [build] utils.obj : error LNK2005: "void __cdecl get_weather(void)" (?get_weather@@YAXXZ) 已经在 main.obj 中定义 [D:\Code Files\vscode\CCpp\projects\BookManagePlus\build\BookManagePlus.vcxproj]
  [build] D:\Code Files\vscode\CCpp\projects\BookManagePlus\build\Release\BookManagePlus.exe : fatal error LNK1169: 找到一个或多个多重定义的符号 [D:\Code Files\vscode\CCpp\projects\BookManagePlus\build\BookManagePlus.vcxproj]
  [proc] 命令“D:\Program\Cmake\bin\cmake.EXE --build "D:/Code Files/vscode/CCpp/projects/BookManagePlus/build" --config Release --target BookManagePlus --”已退出，代码为 1
  ```
- 无法解析的外部符号多半是 `CMakeLists.txt` 文件中没有在 `add_executable` 中添加对应的 cpp 文件
```cmake
  [build] main.obj : error LNK2019: 无法解析的外部符号 "public: __cdecl Menu::Menu(void)" (??0Menu@@QEAA@XZ)，函数 main 中引用了该符号 [D:\Code Files\vscode\CCpp\projects\BookManagePlus\build\BookManagePlus.vcxproj]
  [build] main.obj : error LNK2019: 无法解析的外部符号 "public: void __cdecl Menu::start_menu(void)const " (?start_menu@Menu@@QEBAXXZ)，函数 main 中引用了该符号 [D:\Code Files\vscode\CCpp\projects\BookManagePlus\build\BookManagePlus.vcxproj]
  [build] D:\Code Files\vscode\CCpp\projects\BookManagePlus\build\Release\BookManagePlus.exe : fatal error LNK1120: 2 个无法解析的外部命令 [D:\Code Files\vscode\CCpp\projects\BookManagePlus\build\BookManagePlus.vcxproj]
  [proc] 命令“D:\Program\Cmake\bin\cmake.EXE --build "D:/Code Files/vscode/CCpp/projects/BookManagePlus/build" --config Release --target BookManagePlus --”已退出，代码为 1
```

### 编译和连接问题
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
std::pair<tm, std::string> get_current_time() {
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
- 其中 length 和 range 函数的实现中使用了较新的 C++特性 format，让 C++ 能够像 python 一样格式化字符串，需要注意 [[#format 使用限制|format 使用限制]]
需要实现**链式调用+组合方法**，一般的设计规则为：
- **允许链式调用**：每个验证方法返回当前对象引用
- **支持多规则组合**：内部维护一个验证器链表，链表每一个节点存储一个链式调用中规定的输入验证规则，最后实现一个 render 函数遍历链表中的所有逻辑
- **支持类型泛化**：适用于 `int`, `std::string`, `double` 等
[[C++ practice case#输入验证器#定义]]
#### 验证器实现
如果每一个输入项都使用 while 循环会导致繁琐切工作量大，可以通过实现一个类进行验证
[[C++ practice case#输入验证器#实现]]
### format 使用限制
参考具体说明 [[FastLog#C++20 format 引入的几种字符串处理]]
从 [P2216R3](https://wg21.link/P2216R3) 起，`std::format` 会对格式字符串进行编译时检查（通过辅助类型 std:: format_string 或 std::wformat_string）。如果发现格式字符串与要格式化的实参类型不匹配，则会发出编译错误。如果格式字符串不能作为编译时常量，或者需要避免编译时检查，请使用 `std::vformat` 或 fmt 上的 [`std::runtime_format`](mk:@MSITStore:E:\file_storage\Files\各种配置和工具\cppreference-zh-20240915手册.chm::/chmhelp/cpp-utility-format-runtime_format.html) (C++26 起)代替。
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

| **参数类型**             | **可传入的字面量** | **可传入的对象（变量）** | **可传入的临时对象** | **典型用途** |
| -------------------- | ----------- | -------------- | ------------ | -------- |
| `const std::string&` | ✅           | ✅              | ✅            | 只读参数     |
| `std::string&`       | ❌           | ✅              | ❌            | 可修改参数    |
| `std::string`（值传递）   | ✅           | ✅              | ✅            | 需要拷贝     |
| `std::string_view`   | ✅           | ✅              | ✅            | 只读视图     |
| `std::format_string` | ✅           | ❌              | ❌            | 编译期格式化   |
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

## 异步链接
### mysql 数据库异步链接（boost. mysql）
关于协程可以参考[[WebServer-Chat#前置要求#协程|协程基本知识点]]和 [[MySQL#协程和异步编程|mysql使用协程实现异步编程]]
需要注意，如果链接通过协程实现，则需要 `io_context` 链接句柄生命周期长于 mysql 服务模块，可以参考[[#服务注册管理|服务注册管理]]，一个统一的协程管理对象管理所有的**需要用到协程的服务**，所以这个管理者的生命周期必须长于所有服务，这个对象在 main.cpp 中创建。
代码参考： [[C++ practice case#boost.mysql 异步连接版本]]
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
示例函数实现：[[C++ practice case#]]
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
- 函数模板实现放在头文件中，否则会引发 LNK 2019 错误 ![[#^quxnvg|^quxnvg]]
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
定义：[[C++ practice case#C++ curl 库版本#定义]]
实现：[[C++ practice case#C++ curl 库版本#实现]]

### 使用 python 脚本实现
#### 脚本实现
[[Python#发送邮件脚本#简易硬编码参数版本]]硬编码参数

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

## 异步连接，协程管理