参考链接[序言 现代 C++ 教程: 高速上手 C++ 11/14/17/20 - Modern C++ Tutorial: C++ 11/14/17/20 On the Fly](https://changkun.de/modern-cpp/zh-cn/00-preface/)
# 附录：构建 C++程序规则
## 文件组织结构（Cmake 项目）
标准文件结构可以参考
```markdown
MyAgorithmTools/
├── CMakeLists.txt          # 根CMake配置文件
├── build/                  # 构建目录（通常不提交到版本控制）
├── docs/                   # 项目文档
├── include/                # 公共头文件
│   └── project_name/       # 项目命名空间目录
├── src/                    # 源代码
├── CMakeLists.txt
│   ├── core/               # 核心功能模块
│   ├── utils/              # 工具类
│   │   └── OtherTools.h
│   │   └── OtherTools.cpp
│   ├── gui/                # 图形界面相关
│   ├── tests/              # 单元测试
│   └── main.cpp            # 主程序入口
├── third_party/            # 第三方库
├── scripts/                # 构建/部署脚本
└── resources/
```
## 代码组织结构
### 命名空间
1. `.h` **头文件中永远不要写** `using namespace std;`
2. 在 `.cpp` 文件中优先使用 `using std::xxx;`
```cpp
// 可以放在文件或者函数中，不能放在类定义中，因这些语句不是成员
using std::vector;
using std::cout;
using std::endl;
```
1. 如果只是某个函数中频繁使用，就在函数内部写 `using namespace std;`
2. 对常用类型提前声明 `using std::vector;` 等，提高可读性又不造成污染
3. 类定义中只能包含成员声明、定义和嵌套类型等，而 `using` 声明不是类的成员。

| 方法                                                                  | 范围   | 污染风险 | 推荐程度  |
| ------------------------------------------------------------------- | ---- | ---- | ----- |
| `using std::xxx;`                                                   | 单个名字 | 极低   | ⭐⭐⭐⭐⭐ |
| `using namespace std;`（函数内）                                         | 函数内  | 较低   | ⭐⭐⭐   |
| `using namespace std;`（全局）                                          | 整个文件 | 高    | ❌     |
| 命名空间别名（适用于很深的命名空间嵌套 `namespace sn = some::very::deep::namespace_;`） | 局部   | 无    | ⭐⭐⭐⭐  |
| 写完整`std::xxx`                                                       | 全局   | 无    | ⭐⭐⭐⭐  |
### 头文件和源文件
在 C++ 中，除非是 `constexpr`、整型常量或 `inline` 静态成员变量，静态成员变量不能在类内初始化，必须在 `.h` 中声明但不初始化，`.cpp` 中定义初始化（C++17 之前）；C++17 及以后，`inline` 静态成员变量可以在类内初始化。
#### `.h` 头文件（Header File）
- **作用：声明**
  
  - 类、函数、变量、宏等的**声明（declaration）**
  
  - 不包含具体的实现逻辑
  
  - `inline` 或者**模板**允许在头文件中定义
  
  - 为避免多次包含应该使用 `#pragm once`
- **目的：供其他** `.cpp` **文件包含使用**
#### `.cpp` 源文件（Source File）
- **作用：定义**
  
  - 函数、类成员函数、全局变量等的**定义（definition）**
- **目的：编译生成目标文件（.o / .obj），最终链接成可执行程序或库**
| 项目   | 推荐写法                                   |
| ---- | -------------------------------------- |
| 类名   | PascalCase（如`FileSorter`）              |
| 函数名  | camelCase 或 PascalCase（视团队而定）          |
| 文件名  | 与类名一致，如`FileSorter.h`/`FileSorter.cpp` |
| 宏定义  | 全大写 + 下划线（如`MAX_BUFFER_SIZE`）          |
| 常量变量 | `kCamelCase`（Google 风格）                |
| 成员变量 | `m_camelCase`或`_camelCase`             |
| 静态变量 | `s_camelCase`                          |
| 私有函数 | 开头下划线（如                                |
### 结构化维护代码技巧
#### 封装数据结构和逻辑
使用 function 封装数据结构和 lambda 函数
```cpp
using SortFunction = std::function<bool(const FileInfo&, const FileInfo&)>;
using SortTuple = std::tuple<std::string, SortFunction>;
class FileSorter {
public:
    static const std::array<SortTuple, 6> sortingMethods;
};
const std::array<SortTuple, 6> FileSorter::sortingMethods = {{
    {
        "name_asc",
        [](const FileInfo& a, const FileInfo& b) {
            return a.filename < b.filename;
        }
    },
    {
        "name_dsc",
        [](const FileInfo& a, const FileInfo& b) {
            return a.filename > b.filename;
        }
    },
    // 类似处理其他4种排序方式...
}};
```
#### 初始化成员
在 C++ 中，**推荐在一个类的声明中只进行成员变量的声明（不定义），然后在构造函数中对它们进行初始化** 。这是现代 C++ 编程中最佳实践之一。 **赋值方法：**

| 初始化方式          | 是否推荐     | 说明                               |
| -------------- | -------- | -------------------------------- |
| 类内默认值（C++11 起） | ⚠️ 视情况而定 | `int m_age = 0;`简洁但不适合复杂类型或条件初始化 |
| 构造函数初始化列表      | ✅ 强烈推荐   | 推荐用于所有成员变量初始化，尤其是 const、引用等      |
| 构造函数体内赋值       | ❌ 不推荐    | 效率低，对于 const 成员不可用               |
| **赋值位置和方式**    |          |                                  |
| 成员变量类型                    | 初始化方式                 |
| ------------------------- | --------------------- |
| `const`成员                 | 必须在初始化列表中赋值           |
| 引用（reference）             | 必须在初始化列表中绑定           |
| 没有默认构造函数的类类型              | 必须在初始化列表中调用带参构造       |
| POD 类型（如 int、double）      | 可在类内设默认值或构造函数初始化      |
| STL 容器（vector, map 等）     | 可在类内默认初始化或构造函数中设置初始容量 |
| 如果是简单结构体 POD 成员可以直接在类内初始化 | 聚合初始化或者直接初始化          |
# 第 1 章迈向现代 C++
## 1.1 被弃用的特性
> **注意**：弃用并非彻底不能用，只是用于暗示程序员这些特性将从未来的标准中消失，应该尽量避免使用。但，已弃用的特性依然是标准库的一部分，并且出于兼容性的考虑，大部分特性其实会『永久』保留。
- 不再允许字符串字面值常量赋值给一个 `char *`。如果需要用字符串字面值常量赋值和初始化一个 `char *`，应该使用 `const char *` 或者 `auto`。
```cpp
char *str = "hello world!"; // 将出现弃用警告
```
- C++98 异常说明、 `unexpected_handler`、`set_unexpected()` 等相关特性被弃用，应该使用 `noexcept`
- `auto_ptr` 被弃用，应使用 `unique_ptr`。
- `register` 关键字被弃用，可以使用但不再具备任何实际含义。
- `bool` 类型的 `++` 操作被弃用。
- 如果一个类有析构函数，为其生成拷贝构造函数和拷贝赋值运算符的特性被弃用了。
- C 语言风格的类型转换被弃用（即在变量前使用 `(convert_type)`），应该使用 `static_cast`、`reinterpret_cast`、`const_cast` 来进行类型转换。
- 特别地，在最新的 C++17 标准中弃用了一些可以使用的 C 标准库，例如 `<ccomplex>`、`<cstdalign>`、`<cstdbool>` 与 `<ctgmath>` 等
## 1.2 与 C 的兼容性
### Note：C++中 lambda 捕获列表
在C++11引入Lambda表达式后，捕获列表不仅可以捕获外部变量，还支持**初始化捕获**（C++11）和**通用Lambda捕获**（C++14）
- **允许在捕获列表中定义新变量**，即使这些变量没有在外部作用域中声明
- 新变量的类型可以省略，**由编译器推导**
```cpp
[out = ref(cout << "Result from C code: " << add(1, 2))](){
        out.get() << ".\n";
    }();
```
可以等效为：
```cpp
auto out = ref(cout << "Result from C code: " << add(1, 2));
[&out]() { out.get() << ".\n"; }();
```
ref 的作用是获取一个**表达式**并使用 `reference_wrapper<T>` 包装（包装后是一个对象，提供更多的方法），其中 `T` 是表达式返回值的类型，在作用上来说等效于使用 `auto& cite = /*expression*/` 获取返回值的**引用从而避免复制**，然后使用 cite 这个引用变量进行一些操作。
# 第 2 章语言可用性的强化
## 2.1 常量
### nullptr
`nullptr` 出现的目的是为了替代 `NULL`。 C 与 C++ 语言中有**空指针常量**，它们能被隐式转换成任何指针类型的空指针值，或 C++ 中任何成员指针类型的空成员指针值。 `NULL` 由标准库实现提供，并被定义为实现定义的空指针常量。在 C 中，有些标准库会把 `NULL` 定义为 `((void*)0)` 而有些将它定义为 `0`。
C++ **不允许**直接将 `void *` 隐式转换到其他类型，从而 `((void*)0)` 不是 `NULL` 的合法实现。 C++11 引入了 `nullptr` 关键字，专门用来区分空指针、`0`。而 `nullptr` 的类型为 `nullptr_t`
### constexpr
#### 定义和特性
> [!note] `constexpr` 就是告诉编译器：“**这个函数/变量你如果能提前算出来，就提前帮我算出来，否则就退化为普通函数（变量）在运行时算。**”，本质上是一个“允许但不强制编译期求值”的修饰符，它让函数或变量在**常量表达式上下文中自动提升到编译期**，从而优化性能并提高类型安全性。
参考下面例子
```cpp
#define LEN 10
char arr_1[10];                      // 合法
char arr_2[LEN];                     // 合法
int len = 10;
// char arr_3[len];                  // 非法
const int len_2 = len + 1;
constexpr int len_2_constexpr = 1 + 2 + 3;
// char arr_4[len_2];                // 非法
char arr_4[len_2_constexpr];         // 合法
// char arr_5[len_foo()+5];          // 非法
char arr_6[len_foo_constexpr() + 1]; // 合法
```
mingw 会将非法情况都合法化不报错，但原则上只有 constexpr 变量才能够作为数组大小的定义 C++11 提供了 `constexpr` 让用户显式的声明函数或对象构造函数在编译期会成为常量表达式
- **变量**：`constexpr` 可以修饰变量，表示其值在编译时已知。
- **函数**：`constexpr` 函数指的是其返回值可以在编译时计算出的函数，这类函数必须满足：
  
  1. **单一返回语句**：所有代码路径都必须通过单一 `return` 语句返回。
  
  2. **仅编译时常量操作**：函数体内只能使用编译时常量、字面量、其他 `constexpr` 函数或 `constexpr` 变量。
  
  3. **不允许修改外部状态**：不能修改非局部变量、使用 `volatile` 变量或 I/O 操作。
  
  4. **返回类型限制**：`constexpr` 函数不仅限于基本数据类型，**任何可在编译时计算出的类型**都可以，包括：
     
     - 整数、浮点数等基本类型
     
     - `array`、`tuple` 等固定大小的容器
     
     - 用户定义的类型（UDT），前提是其构造函数也是 `constexpr`
- **函数体限制**：函数体内不能包含运行时特征（如 I/O、异常抛出、`volatile` 访问等）
#### 检查是否可以编译期计算
如果传入函数的参数（或者变量值的定义表达式）是一个常量，则说明**这个量是可以再编译期计算的不变的量**，这个时候就会加快代码运行速度，将对应代码转化为常量表达式。否则就是普通函数调用。 方法 1：`static_assert` 强制编译期检查
```cpp
static_assert(factorial(5) == 120);  // 如果失败，说明不能在编译期算
```
方法 2：用在常量表达式上下文（比如数组大小）
```cpp
int arr[factorial(3)];  // OK（如果函数是 constexpr 并在编译期可求值）
```
方法 3：`std::is_constant_evaluated()`（C++20 起）
```cpp
constexpr int magic(int x) {
    if (std::is_constant_evaluated()) {
        return x * 42;
    } else {
        // 运行期的逻辑可以不同
        return heavy_runtime_function(x);
    }
}
```
#### 注意事项
##### 性能问题和编译器行为
如果将 constexpr 应用于 if 的条件分支中，会导致**部分分支不会被检查**

| 特性           | `if`          | `if constexpr`      |
| ------------ | ------------- | ------------------- |
| 编译器处理时间      | 运行时           | 编译时                 |
| 所有分支是否都需要有效？ | 是 —— 都要能编译通过  | 否 —— 只有满足的分支被检查     |
| 会生成多少函数版本？   | 一个函数，运行时判断分支  | 每个模板参数生成一个新函数，分支已确定 |
| 对编译速度的影响？    | 较小            | 很可能增加编译时间（但优化性能）    |
| 是否影响运行速度？    | 会影响（分支是运行时判断） | 不影响（只保留一个分支）        |
| `constexpr` 函数在编译期一定会执行  | 错！只有在调用时所有参数都是常量表达式时，它才会在编译期执行              |
| ------------------------ | ------------------------------------------- |
| `constexpr` 函数不能有循环或复杂逻辑 | 错！C++20 开始支持复杂逻辑，只要能静态推导                    |
| 一定要是固定值才能用 `constexpr`   | 错！只要能由常量参数推导出结果即可                           |
| 只有返回值是编译期的常量             | 错！函数体中也可以有局部变量、条件分支、循环等                     |
| `constexpr` 一定能被用作模板参数   | 错！只有在 `consteval` / `constinit` 情况下才强制编译期求值 |
##### 不同标准对待态度
C++ 11 时，每一个 constexpr 修饰返回值的函数只能有一个 return 语句，C++14 后放宽限制 C++20 开始，标准 string 和 vector 类具有限定的构造函数和析构函数，这是可在编译时使用的前提。所以，分配给 string 或 vector 对象的内存，也**必须在编译时释放**。 例如，constexpr 函数返回一个 vector，编译时不会出错:
```cpp
constexpr auto use_vector() {
    vector<int> vec{ 1, 2, 3, 4, 5};
    return vec;
}
```
但在运行期就会出**在常量求值期间分配内存的错误**：因在编译期间分配和释放了 vector 对象，所以该对象在运行时不可用
```cpp
int main(){
    constexpr auto vec = use_vector();
    return vec[0];
}
```
正确的用法是将在编译期将需要的值计算出来，然后用运行期能够存在的变量保存他们。 除此之外还有这种情况
```cpp
const auto use_vector(){
    std::vector<int> vec{1, 2, 3, 4};
    return vec;
}
int main(){
    constexpr auto vec_size = use_vector().size();
    return vec_size;
}
```
![[Pasted image 20250803160434.png]] 由于 size 函数是 const 限定的，所以表达式可以在编译时求值。
- 构造的对象必须在 `constexpr` 上下文中被析构（内存必须编译期释放）
- 不能“逃逸”出编译期（比如返回一个带有堆内存的对象）
- 你可以在编译期用它计算结果，但**不能在运行期使用编译期动态分配的对象**
#### 补充：consteval 关键字
consteval **只能修饰函数**
##### 修饰普通函数
```cpp
consteval int compile_time_only(int x) {
    return x * x;
}
int main() {
    constexpr int a = compile_time_only(5);  // ✅ 编译期
    int runtime_value = 10;
    // int result = compile_time_only(runtime_value);  // ❌ 编译错误！
     // 因 runtime_value 不是编译期常量，无法在编译期求值
}
```
- 函数必须能够在编译期求值，如果不能在编译期求值，编译失败
- 函数体内不能包含 try/catch
- 不能有静态局部变量
- 所有参数必须是常量表达式
- 返回值必须是常量表达式（构造/析构函数除外）
- 不能递归调用
##### 修饰构造函数
```cpp
struct Point {
    int x, y;
    consteval Point(int a, int b) : x(a), y(b) {}  // 立即构造函数
};
constexpr Point p(1, 2);  // ✓ 正确：编译时构造
Point p2(1, 2);          // ✗ 错误：运行时构造
```
如果 `consteval` 用来修饰类/结构体的构造函数，则表示：
- 对象**必须**在编译时构造
- 产生的对象是 constexpr 对象，必须使用 constexpr 对象或者模板参数变量（也是在编译时确定的值，相当于 `constexpr`）接受
- 保证构造过程完全在编译期完成，但**销毁过程（析构函数）会在运行期进行**
1. **构造函数**：✓ 可以，强制编译时构造
2. **拷贝构造**：✓ 可以，强制编译时拷贝
3. **析构函数**：✗ 不推荐，通常需要 `=delete`
4. **赋值运算符**：✓ 可以，强制编译时赋值
> [!note] 为什么不推荐修饰析构函数？ 技术原因：
> 1. **析构函数的调用时机不可控**
>    - 编译器自动插入析构调用
>    - 无法保证调用发生在编译时
> 2. **生命周期管理**
>    - 对象可能在运行时创建和销毁
>    - 无法强制所有析构都在编译时发生
如果在逻辑上不允许一个对象在编译期/运行期被销毁，则可以添加 `consteval` 并将洗头函数 delete
### if/switch 变量声明强化
现在 if 和 Switch语句的 `()` 中可以定义临时变量，作用域仅仅在对应语句中
```cpp
if (const vector<int>::iterator itr = find(vec.begin(), vec.end(), 3);
    itr != vec.end()) {
    *itr = 4;
}
```
### 初始化列表
[[Effective C++（侯捷）#构造函数和初始化列表|初始化列表和构造函数函数体初始化的区别]] 普通数组、 POD （**P**lain **O**ld **D**ata，即没有构造、析构和虚函数的类或结构体） 类型都可以使用 `{}` 进行初始化，也就是我们所说的初始化列表，对于类对象的初始化，要么需要通过拷贝构造、要么就需要使用 `()` 进行。这些不同方法都针对各自对象，不能通用。所以 C++引入了 `initialize_list` 允许通过**构造函数**提供一种通用初始化方法
```cpp
class MagicFoo {
public:
    MagicFoo(initializer_list<int> list) {
        for (auto& entry : list) {
            vec.push_back(entry);
        }
    }
    void constructInitialize() { // 对象构造初始化
        for (const auto& item : vec) {
            cout << item;
        }
    }
    void functionInitializer(initializer_list<int> list) {
        cout << endl;
        for (auto& item : list) {
            cout << item;
        }
    }
private:
    vector<int> vec;
};
int main() {
    MagicFoo mf = { 1,2,3,4,5 };
    MagicFoo mf2({ 1, 2, 3, 4, 5 });
    MagicFoo mf3{ 1,2,3,4,5 };
    mf.constructInitialize();
    mf.functionInitializer({1, 2, 3, 4, 5});
}
```
使用条件：
- **类型一致性**：`initializer_list` 中元素类型必须与声明的模板参数类型一致（如 `int`、`double`、`string` 等）。
- **性能考虑**：频繁使用 `initializer_list` 可能引入额外的复制或移动操作，需权衡使用场景。
- **容器支持**：标准库容器（如 `vector`、`list`）已内置支持 `initializer_list` 构造函数，简化了初始化过程。
### 结构化绑定（modern cpp）
C++中如果要一个函数返回多个返回值，一般用 `tuple<返回值类型1, 返回值类型2,......>`，虽然可以，但但缺陷是，C++11/14 并没有提供一种简单的方法**直接从**元组中拿到并定义元组中元素。
- 使用 `tie` 解包，则**需要先定义变量**
```cpp
int main() {
    tuple<int, double, string> t(1, 2.5, "hello");
    int a;
    double b;
    string c;
    // 使用 tie 解包
    tie(a, b, c) = t;
    cout << "a = " << a << ", b = " << b << ", c = " << c << endl;
    return 0;
}
```
- 使用 `get<index>(tuple_obj)get<index>` 的返回类型：（如果 `std::tuple` 中元素是左值引用）或**值**（如果元素是右值引用或值类型），具体取决于 `std::tuple` 的构造方式。例如：
```cpp
std::tuple<int&, double&&, std::string> t(std::ref(a), 2.5, "hello");
```
> - `get<0>(t)` 返回 `int&`（左值引用）
> - `get<1>(t)` 返回 `double&&`（右值引用）
> - `get<2>(t)` 返回 `std::string`（值类型）
> - `std::tie` **的传递方式**：`std::tie` 始终返回**左值引用**，允许直接修改原 `std::tuple` 中元素（如果 `std::tuple` 中元素是可修改的）

- C++17 使用结构化绑定传入 `auto& [a, b, c] = t` 可以直接得到 tuple 中内容，并且支持修改（因会被应用传递到 a，b，c）
- **结构化绑定**（C++17）是一种**语法糖**，允许你将 `std::tuple`（或其他支持的类型，如 `std::pair`、`std::array` 等）的元素**解包**到多个变量中。
- **底层机制**：结构化绑定实际上创建了**引用**到 `std::tuple` 中元素。这些引用是**左值引用**，除非 `std::tuple` 中元素本身是右值引用。
---
如果修改 `a`、`b` 或 `c` 的值，**不会** 影响到原始的 tuple 对象 `tuple_obj`。这是因结构化绑定默认是 **按值** 解包元组的元素到绑定变量中，意味着每个变量拥有自己独立的存储空间
- **默认情况下**：当使用 `auto [a, b, c] = tuple_obj;` 时，`a`、`b`、`c` 是**左值引用**，指向 `tuple_obj` 中元素。**修改** `a`**、**`b`**、**`c` **会直接影响** `tuple_obj`。
- **例外情况**：如果 `std::tuple` 中元素本身是**右值引用**（例如，`std::tuple<int&&, double&&>`），则结构化绑定会创建**右值引用**，但这种情况较为特殊。
## 2.3 类型推导
### auto 类型推导
不支持推导数组类型 `auto auto_arr2[10] = {arr};` 会报错 `constexpr` 关键字将表达式或函数编译为常量结果。一个很自然的想法是，如果我们把这一特性引入到条件判断中去，让代码在编译时就完成分支判断
```cpp
template<typename T>
auto print_type_info(const T& t) {
    if constexpr (std::is_integral<T>::value) {
        return t + 1;
    } else {
        return t + 0.001;
    }
}
int main() {
    std::cout << print_type_info(5) << std::endl;
    std::cout << print_type_info(3.14) << std::endl;
}
```
逻辑上等价于
```cpp
int print_type_info(const int& t) {
    return t + 1;
}
double print_type_info(const double& t) {
    return t + 0.001;
}
int main() {
    std::cout << print_type_info(5) << std::endl;
    std::cout << print_type_info(3.14) << std::endl;
}
```
### decltype 类型推导
参考 [[C++ Runoob Tutoral#decltype 关键字]] 
## 2.5 模板
- C++11 开始，连续的右尖括号将变得合法
### 变长参数模板
详细说明参考[[模板元编程#变长参数模板]]
C++11 加入了新的模板类型参数列表表示方法，允许任意个数、任意类别的模板参数，同时也不需要在定义时将参数的个数固定。
```cpp
template<typename... Ts> class Magic;
```
支持在参数列表中输入 0 或者 0 个以上的参数，如果一定要参数，则至少写一个参数
```cpp
template<typename Require, typename... Args> class Magic;
```
#### 处理变长参数：
##### sizeof 计算
```cpp
template<typename... Ts>
void magic(Ts... args) {
    std::cout << sizeof...(args) << std::endl;
}
```
##### 递归计算
- 简单递归
```cpp
template<typename T0>
void printf1(T0 value) {
    std::cout << value << std::endl;
}
template<typename T, typename... Ts>
void printf1(T value, Ts... args) {
    std::cout << value << std::endl;
    printf1(args...);
}
```
- 变参模板展开：利用 `if constexpr`，只检查参数列表长度的参数
```cpp
template<typename T0, typename... T>
void printf2(T0 t0, T... t) {
    std::cout << t0 << std::endl;
    if constexpr (sizeof...(t) > 0) printf2(t...);
}
```
这种解析参数的方法是通过**实例化不同参数个数和类型**情况下的模板来实现的：
```cpp
// 递归方法中
如果使用printf1(1,2,3) // 其中参数类型自动推导
// 则会实例化出三个不同的模板代码
printf1<int> (3)
printf1<int, int> (2, 3) -> printf1<int> (2) + printf1<int> (3)
printf1<int, int> (1, 2, 3) -> printf1<int> (1) + printf1<int, int> (2, 3) -> printf1<int> (1) + printf1<int> (2) + printf1<int> (3)
```
- 通过模板实例化得到普通的函数，依次调用，即可完成变长类型变量的解析
- 在编译期会出现递归实例化，实例化出不同的模板代码，代码运行期时只会使用不同的函数调用来完成功能，没有实现递归
##### 初始化列表展开
递归模板函数是一种标准的做法，但缺点显而易见的在于必须定义一个终止递归的函数。 这里介绍一种使用初始化列表展开的黑魔法：
```cpp
template<typename T, typename... Ts>
auto printf3(T value, Ts... args) {
    std::cout << value << std::endl;
    (void) std::initializer_list<T>{([&args] {
        std::cout << args << std::endl;
    }(), value)...};
}
```
这里参考 [[Modern C++#Note：参数包解析]]
##### apply 和 lambda 配合处理
```cpp
auto print_tuple = [](auto&&... items) {
    ((std::cout << items << '\n'), ...);
};
std::apply(print_tuple, some_tuple); // 直接展开 tuple 为 parameter pack
```
### Note： 编译期逻辑表达
| 特征                                       | 说明                                    |
| ---------------------------------------- | ------------------------------------- |
| **无变量本质**                                | 所有执行逻辑以表达式副作用、延迟表达式、“状态伪造”的方式构造       |
| **不是函数环绕执行环境变量**                         | 表达式中 0、value 等是用来“伪造”初始化列表构造语法的技巧代码   |
| **编译期与运行期混合思考**                          | 有时代码完全在运行期，但展开逻辑却在编译期完成，这就是泛型米花板的含金量！ |
| **lambda + 逗号 + 模板类型推导 = 编译期逻辑运行的暴力破解术** | 虽然它可能看起来“不优雅”，但在模板函数里模拟逻辑执行是唯一手段！     |
C++ 编译器不是一个真正的逻辑执行环境，但它 **可以模拟一个存在于模板“生成代码”和表达式“副作用机制”中准逻辑执行语言** 在 C++ 模板编程中，我们“不是运行逻辑”，而是写一个“生成逻辑”的构造。也就是说，模板不是“运算法”，而是“生成另一个 C++ 代码结构”的宏系统，这种编程方式被称为：
**在元层级（metalevel）上执行逻辑**，即：
- 根据输入类型、值、参数包 → 生成新的 —— 模板实例化代码。
- 运行环境 → 编译器代码生成阶段。
- "**模板元编程**" 就是你描述的：“根据模板生成其他模板逻辑”，也就是在一个以编译阶段为主控器的系统中“推演生成运行期逻辑”。
### Note：折叠表达式
#### 含义和本质
它的出现用于解决[[#变长参数模板]]中，处理变长参数列表式**还是需要统计参数数量或者使用递归方式处理参数**时代码复杂且难以维护 折叠表达式**必须在括号内使用**，参考 [[#Note：折叠表达式#总结和注意事项]] 折叠表达式（C++17）是**参数包在元编程中被最优雅使用的语法延伸**。它的本质是：
> [!note]
> - 用一个“二元运算符”，对其展开的每个参数进行“**编译期生成多个表达式**”。
> - 所谓“折叠”—— 不是计算时折叠，而是**生成表达式链结构**的方式被折叠。
> - 折叠表达式 `...` 的本质：不是为了**计算**某个表达式 —— 而是为了**在编译期根据参数包生成多个表达式片段**。每个 `args_i` 都会生成一份 `expr(args_i)` 逻辑代码。 
> - 如果这个 expr 是 lambda、pair decay 表达式、嵌套函数计算 —— 仍能在编译期转化成多个硬编码函数调用。
#### 折叠语法
一般在模板参数列表中使用 `Args` 表示类型参数包，在函数参数列表使用 `args` 表示形参参数包
- **“元”（arity）** 是一个术语，表示一个操作符、函数或模板接受的**参数个数**，三元的操作符号只有 `?:` 三目运算符。
- 折叠表达式是左折叠还是右折叠，取决于 `...` 是在“形参包”的左边还是右边, 右折叠先算右边，左折叠先算左边，这里的**算**表示符号和运算符结合的这一行为，**不是计算的意思**，比如使用 `,` 运算符的 [[#Note：折叠表达式#一元右折叠|print函数示例]] 中，逗号运算符没有做任何计算
- 二元折叠表达式中，两个 op 必须是相同&有结合性的
- 基本表达方式为：
```md
( args op ... ) (1) // 一元
( ... op args ) (2)
( args op ... op 初值 ) (3) // 二元
( 初值 op ... op args ) (4)
1. 一元右折叠 (args op ...) 成为 (args1 op (... op (argsN-1 op argsN)))
2. 一元左折叠 (... op args) 成为 (((args1 op args2) op ...) op argsN)
3. 二元右折叠 (args op ... op 初值) 成为 (args1 op (... op (argsN−1 op (argsN op 初值))))
4. 二元左折叠 (初值 op ... op args) 成为 ((((初值 op args1) op args2) op ...) op argsN)
```
**一元折叠表达式（Unary Fold）**：对参数包中每个参数应用一个一元操作符
**二元折叠表达式（Binary Fold）**：
- 对参数包中每个参数应用一个二元操作符
- 二元表达式的初始值**必须要有返回值并且重载 op 符号**
- 二元语法中，两个 op 必须是相同并且有结合性的（即可以连续使用）
- 语法中的 init **并不是指的单个符号，而是一个语句/表达式**，比如 `(std::cout << "" << ... << args;)` 一个二元左折叠
	- init = `std::cout << ""`
	- op = `<<`
	- 展开后得到：`((((std::cout << "") << arg1) << arg2)... << argN)`
	- 语法合理
#### 一元右折叠
```cpp
(argPack op ...) --> (((arg1 op arg2) op arg3) op arg4....)// 前置
(op... argPack)  --> (arg1 op (arg2 op (arg3 op ...))) // 后置
template<typename... Args>
void test(Args... args) {
    std::cout << "Left Fold: " << (args + ...) << std::endl;  // 前置
    std::cout << "Right Fold: " << (... + args) << std::endl; // 后置
}
// Left Fold: ((1 + 2) + 3) = 6
// Right Fold: (1 + (2 + 3)) = 6

template<typename... T, typename Common = std::common_type_t<T...>>
Common calculate_avg(const T&... args) {
    return (args + ...) / sizeof...(args);
}
template<typename... Args>
void print(Args... args) {
    ((std::cout << args << " "), ...); // 一元右折叠形式
    // ((std::cout << args1 << " "), ((std::cout << args2 << " "), ...))))))
}
print("luse", 1, 1.2); // 编译期会被展开为：
void print(const char(&args0)[5], const int& args1, const double& args2) {
    ((std::cout << args0 << ' '), ((std::cout << args1 << ' '), (std::cout <<
args2 << ' '));
}
```
`((std::cout << args << " "), ...)` 中，参数包在左边的表达式中：
- `(std::cout << args << " ")` 是参数包，**注意括号**
- `,` 是逗号操作符 op
- `...` 放在形参包右边，所以这是右折叠
- 根据展开规则 `(args1 op (... op (argsN-1 op argsN)))`，推断为一大串用 `,` 分割的*独立表达式*，由于 `,` 运算符会以从左到右最后一个表达式值作为返回值，`std::cout<<` 会返回一个流对象，所以这是符合语法规则的
#### 一元左折叠
[[#一元右折叠]]的 print 例子也可以写成，只是**和符号结合的顺序因括号而改变了**，实际效果是一样的，结合顺序的改变带来的后果可以在[[#总结和注意事项]]中参考
```cpp
template<typname...Args>
void print(Args...args){
    (..., (std::cout << args << " "));
    // ((((... (std::cout << args2 << " "), (std::cout << args1 << " "));
}
```
#### 二元左折叠
```cpp
template<typename... Args>
void print_left(Args&&... args){
    (std::cout << ... << args);
    // (((((std::cout << args1) << args2 ) << args3..... << argsN);  // 展开形式
    // std::cout << ... << args; // 报错，因为展开必须在语序的上下文中才能进行
    // ((std::cout << args1 << " "), ((std::cout << args2 << " "), ...))))))
    
	// 不能写成这样
	// (std::cout << args << ... << " ");
	// 因为这样展开之后是
	// cout << (arg1 << (arg2 << (... << (argN << " ")));
	// 根据运算规则，最深层括号中的表达式先运算，而argN << " "是语法错误的
}
```
这里需要注意 `std::cout` 作为了初始值，返回一个 `ostream` 对象，重载了 `<<` 操作符 报错是因没有遵循折叠表达式语法，参考 [[#Note：折叠表达式#含义和本质]]和 [[C++ Runoob Tutoral#各种符号在上下文中语义#... 语义|...的语义]]
#### 二元右折叠
同理，套公式即可，但由于 `()` 改变 `op` 顺序可能会有一些意外结果过
```cpp
template<typename... Args>
void print_right(Args&&... args){
    std::cout << (args << ... << std::endl);
    // std::cout << (args1 << (args2 << (args3 << ... argsN << std::endl)))) // 展开
}

// 不能写成这样
// (std::cout << args << ... << std::endl);
// 因为这样展开之后是
// cout << (arg1 << (arg2 << (... << (argN << std::endl)));
// 根据运算规则，最深层括号中的表达式先运算，而argN << " "是语法错误的
```
报错内容为：
```bash
learn_template.cpp: In instantiation of 'void print_right(Args&& ...) [with Args = {int, int, int, int, int}]':
learn_template.cpp:29:16:   required from here
   29 |     print_right(1, 2, 3, 4, 5);
      |     ~~~~~~~~~~~^~~~~~~~~~~~~~~
learn_template.cpp:18:24: error: invalid operands of types 'int' and '<unresolved overloaded function type>' to binary 'operator<<'
   18 |     std::cout << (args << ... << std::endl);
      |                  ~~~~~~^~~~~~~~~~~~~~~~~~~~
```
由于 `<<` 的符号结合顺序是从左向右， int类型是基本类型，没有重载 `<<`，后面括号中内容没办法推断出类型，自然所以最开始的 `arg1 << (...)` 中，括号里的内容无法推断出类型，出现报错
#### 总结和注意事项
```cpp
template<int...args>
constexpr int v_right = (args - ...); // 一元右折叠
template<int...args>
constexpr int v_left = (... - args); // 一元左折叠
int main(){
    std::cout << v_right<4, 5, 6> << '\n'; //(4-(5-6)) 5
    std::cout << v_left<4, 5, 6> << '\n'; //((4-5)-6) -7
}
```
这个例子中 `-` 是二元操作符，但展开语法是**一元折叠**的语法 可以得出结论：“对于逗号运算符，一元左折叠和一元右折叠没有区别”。而对**非类型模板参数**有区别，因**会因展开后括号的顺序改变运算结果**，逗号只是一个特例而已，真正让一元左右折叠不一样的原因是符号的语义
```cpp
int arr[] = {1, 2, 3, 4}; // runtime 数组常量在编译期已知大小
constexpr int total = (... + arr); // 折叠式从 arr[0] 到 arr[3] 做加法
static_assert(total == 1 + 2 + 3 + 4);
```
折叠表达式 **确实大多数出现在模板参数包** `args...` **的上下文中中**，因它依赖 parameter pack（变参结构，他的常用场景也是变参解析）。
#### 有意思的例子
```cpp
template <class... Args>
auto func(Args&&... args) {
	std::vector<std::common_type_t<Args...>> res{};
	bool									 temp{ false };
	(temp = ... = ((void)res.push_back(args), false));
	/**
	 * init -> temp
	 * op -> =
	 * pack -> ((void)res.push_back(args), false)
	 * 展开公式(I op ... op arg) -> ((((I op arg1) op arg2) op ...) op argN)
	 * 所以展开后的结果为
	 * (((...(((
	 * 		temp = (res.push_back(args1), false))
	 *  	= (res.push_back(args2), false))	// 最后一个右括号和temp前面的左括号对应
	 *  	= (res.push_back(args3), false))
	 *  	...
	 *  	= (res.push_back(argsN), false)
	 * )
	 * (((...((( temp = (res.push_back(args1), false)) = (res.push_back(args2), false)) = (res.push_back(args3), false))	...	= (res.push_back(argsN), false))
	 * 整个表达式可以看作(left = (res.push_back(argsN), false))
	 * 这时第一个（也是最右边的等号开始结合），从右向左，所以先执行了右边部分的表达式
	 * 计算左边时发现左边也是一个复合结构，同样递归执行下去，每次先执行复合结构的右边部分
	 * 这样的结果就是虽然括号影响了运算结果的流向，但是没有改变=的结合方向
	 */
	return res;
}
```
这段代码的实际作用是将变长参数列表中参数**逆序填容器中并返回**
- 由于 `=` 需要赋值，所以每一个[[模板元编程#包展开和模式|模式]] 必须要有一个值, 这里使用 `,` 运算符表达一个 false 作为返回值，副作用是 `push_back(args)` ，它没有返回值，所以都过逗号手动返回一个
- 由于我们不关心值，只关心副作用，所以这里使用[[模板元编程#弃值表达式]] `(void)` 忽略计算值
- 可以看到展开后是左折叠形式，按道理应该括号改变了结合顺序，**结合顺序**为先左边后右边，确实左边的括号层级比右边的深，但 `=` 的**计算顺序**是先右边后左边
- 每一个 `=` 先**计算**右边，自然就**逆序添加**元素了
- 如果想要正向添加，就简单很多
```cpp
template <class... Args>
auto func(Args&&... args) {
    std::vector<std::common_type_t<Args...>> res{};
    ((res.push_back(args), ...), false);
    // 或者
    ((void)res.push_back(args), ...);
    return res;
}
```
### Note：`apply` 与参数列表“完全解包”
参考下面代码：
```cpp
auto add = [](auto a, auto b) { return a + b; };
std::tuple<int, float> t(42, 3.2f);
int result = std::apply(add, t);
std::cout << result << std::endl;
```
`apply` 的目的在于解包，这也是最常用的场景：
> 将一个可调用对象（lambda, function, functor）应用到 tuple 的每个元素上，就像 tuple 是一个参数包一样**解包（unpack）**
内部逻辑为：
- `using std::tuple_size_v<T>` 来知道内部元素数目
- 使用 `std::index_sequence<0,1,2,...,N>` 模拟 pack
- 逐个将 tuple 中 `get<I>(t)` 实体展开
### Note：参数包解析
#### 参数包展开语法
`(expression-with-pack)...;`
- `...` 如果出现在 `(表达式)` 后面，那么说明这个表达式是一个可以被解包的表达式，表达式中含有能够**被解包**的参数包
- `...` 会让表达式重复书写这个**参数包**中元素数量次，并且如果 `...` 前的括号中有 `,`，则认为这个 `,` 是执行操作分隔符，表示按逗号分隔顺序执行括号中语句
- `(左边表达式, 右边表达式)` 是一个 C++语法，会**先执行左边表达式，再执行右边表达式**，返回类型是右边的类型。这在 C++ 中是通用机制，**不是参数包特有的**。
- `...`（也称为参数包展开运算符）用于对模板参数包在编译期展开
- 这个表达式 `expression-with-pack` 必须包含至少一个模板参数包的变量（例如 `args...`, `Ts...` 等）
```cpp
(void) initializer_list<T>{ (lambda表达式(args_i), value)... };// 会被自动展开为
(void) initializer_list<T>{
    ([&a1](){...}(), value),
    ([&a2](){...}(), value),
    ([&a3](){...}(), value),
    ....
}
```
这种展开过程是单纯在编译阶段通过**替换模板代码文本**并修改关键参数来实现，这就是**模板元编程

| 条件                  | 说明                                                                       |
| ------------------- | ------------------------------------------------------------------------ |
| 存在一个已定义的参数包         | 例如在模板函数为 `template<typename... Ts> void f(Ts... args)` 中，`args...` 这个包可用 |
| `...` 出现在支持展开的语法结构中 | 比如函数参数、初始化列表、折叠表达式中                                                      |
| 包在展开时必须已经被解包类型明确    | 例如每一个展开的 item 是一个变量、类型、模板参数                                              |
- `...` 语法是用于参数包展开操作的编译期机制 - 它不能作用于普通的运行期数据结构（如 `std::vector`） - 但对于 `std::array` 等**已知长度的编译期结构**，可以结合 `std::index_sequence` 伪参数包展开来模拟“编译期遍历”的操作
```cpp
template<std::size_t... Is>
void log_array(const std::array<int, 5>& arr, std::index_sequence<Is...>) {
    (void)std::initializer_list<int>{
        ((std::cout << arr[Is] << "\n", 0))...
    };
}
int main() {
    std::array<int, 5> arr = {10, 20, 30, 40, 50};
    log_array(arr, std::make_index_sequence<5>{});
    return 0;
}
```
#### 参数包解析操作
对于
```cpp
template<typename T, typename... Ts>
auto printf3(T value, Ts... args) {
    std::cout << value << std::endl;
    (void) std::initializer_list<T>{([&args] {
        std::cout << args << std::endl;
    }(), value)...};
}
```
- 这里由于模板参数包 Ts 不定长，需要一个个解析出来，使用了包解析语法生成了一个**参数列表数据结构**（由 initialize\_list 包装）。
- 但由于 initialize\_list 中所有元素类型都必须限定为 T （参考 [[Modern C++#初始化列表]]），但 lambda 函数只打印了内容（副作用），没有 T 类型的返回值，所以使用**操作分隔符**`,`，**执行**`value` 语句，让 `expression-with-pack` 表达式返回值类型为 T
### Note：万能引用
`template<typename Tuple> void apply_all_and_do (Tuple&& t);Func&&` 是模板完美转发的“万能引用”写法 —— `forward<Func>` 用于保留调用处 `f` 的值类别（是 lvalue 还是 rvalue）**不损失表达式身份**
```cpp
auto lambda = [](...){};
apply_all_and_do(some_func, ...);   // 一个临时 Function（rvalue）
auto& ref = some_func;
apply_all_and_do(ref, ...);         // function 是 lvalue
```
两者传入 `apply_all_and_do` 中都能接受，在函数体中可以对两者设计不同的处理逻辑 **无论模板参数是什么类型的引用，当且仅当实参类型为右引用时，模板参数才能被推导为右引用类型**。这被称为*引用折叠规则*，他会在以下情况中触发：

| 场景                        | 是否触发引用折叠 | 说明                               |
| ------------------------- | -------- | -------------------------------- |
| **模板类型推导（T&&）**           | ✅ 是      | 在模板中使用 `T&&` 时，传入左值或右值会推导出嵌套引用类型 |
| **decltype 表达式中**         | ✅ 是      | 某些表达式结果类型可能包含嵌套引用，会触发折叠          |
| **typedef / using 类型别名中** | ✅ 是      | 如果别名定义中出现嵌套引用，会折叠                |
| **普通变量定义中**               | ❌ 否      | 如 `int& &x = y;` 是非法的，不会编译通过     |
| 推导规则为：                    |          |                                  |
| 类型表达式    | 折叠结果  |
| -------- | ----- |
| `T& &`   | `T&`  |
| `T& &&`  | `T&`  |
| `T&& &`  | `T&`  |
| `T&& &&` | `T&&` |
```cpp
// 模板类型推导
template<typename T>
void foo(T&& arg) {
    // ...
}
int x = 42;
foo(x);     // T 被推导为 int&，T&& 变成 int& &&
foo(42);    // T 被推导为 int， T&& 变成 int&&
// decltype表达式
typedef int& LRef;
LRef&& ref = x;  // LRef&& → int& &&
// decltype引用折叠
int x = 10;
int& y = x;
decltype(y)&& z = x;  // decltype(y) 是 int&，所以 decltype(y)&& 是 int& &&
```
| 有 template T                                   | 参数 `T&&` 可变           |
| ---------------------------------------------- | --------------------- |
| `T` 推导为 `int&`，传入是 lvalue                      | 那么实际该函数接收到 int&       |
| `T` 推导为 `string`，传入是临时（rvalue）                 | 则实际接收 string&&        |
| 使用 `std::forward<T>(x)` 进行类型“转发/generate 归类语言” | f(a), f(b) 传递过程中无类型丢失 |
| 示例代码，看懂理解即可                                    |                       |
```cpp
typedef int& lref;
typedef int&& rref;
int n;
lref& r1 = n; // r1 的类型是 int&
lref&& r2 = n; // r2 的类型是 int&
rref& r3 = n; // r3 的类型是 int&
rref&& r4 = 1; // r4 的类型是 int&&
/////////////////分割线///////////////
template <class Ty>
constexpr Ty&& forward(Ty& Arg) noexcept {
    return static_cast<Ty&&>(Arg);
}
int a = 10; // 不重要
::forward<int>(a); // 返回 int&& ，因 Ty 是 int，把左值a通过static_cast<int&&>变化，根据转化规则，左值会被转化为右值
::forward<int&>(a); // 返回 int& ，因 Ty 是 int&，返回值Ty&& 触发引用折叠int&& & -> int&，
::forward<int&&>(a); // 返回 int&& ，因 Ty 是 int&&，返回值Ty&&触发引用折叠int&& && -> int&&
```
### Note：完美转发
完美转发 (forward)(value) 是元编程的“身份还原复刻师” 使用完美转发+ [[Modern C++#Note：折叠表达式|折叠表达式]] + [[Modern C++#Note：`apaply` 与参数列表“完全解包”|apply参数处理]]三合一例子
```cpp
template<typename Func, typename Tuple>
decltype(auto) apply_all_and_do(Func&& f, Tuple&& t) {
    return std::apply([&f](auto&&... args) {
        (std::forward<Func>(f)(std::forward<decltype(args)>(args)), ...);
    }, std::forward<Tuple>(t));
}
// 用法：
int main() {
    auto log = [](auto&& value) { std::cout << value << std::endl; };
    apply_all_and_do(log, std::make_tuple(1, 2.5, std::string("world")));
}
```
`apply_all_and_do` 是一个模板函数
- F 是一个[[Modern C++#Note：万能引用|万能引用]]，无论传入左值还是右值都能被接受，由函数体中逻辑（如使用完美转发还原**最古身份类型**）来对左右值进行不同的处理，同理 t
- 函数体的内容是将 t 中每一个元素应用 f 逻辑，使用封装好的 apply 模板
- args 是传入 f 的参数列表，也通过[[Modern C++#Note：万能引用|万能引用]]传递给 lambda 中 f，再通过[[Modern C++#Note：折叠表达式|折叠表达式]]将 args 解析为列表后将每一个 f 的参数完美转发，传入 f
- apply 将**捕获了 f 的 lambda 函数**作为第一个参数，完美转发过后的 t 作为第二个参数，将 t 中每一个元素应用 f 的逻辑，由于 f 和 t 是引用传递，所以更改会应用到两者上
## 2.6 面向对象
### 继承构造
构造函数如果需要继承是需要将参数一一传递的，这将导致效率低下
```cpp
class Base {
public:
    int value1;
    int value2;
    Base() {
        value1 = 1;
    }
    Base(int value) : Base() { // 委托 Base() 构造函数
        value2 = value;
    }
};
class Subclass : public Base {
public:
    using Base::Base; // 继承构造
};
```
`using Base::Base;` 让子类继承
- 父类 `Base` 中所有非拷贝、非移动构造函数；
- 保留父类构造函数的访问权限（`public Base(int)` → 也转发为 `public` 给 Subclass） 的 **构造函数（显式/隐式）**

| 构造函数签名                      | 是否继承？                                            |
| --------------------------- | ------------------------------------------------ |
| Base()（默认）                  | ✅                                                |
| Base(int x)                 | ✅                                                |
| Base(const T&)（拷贝）          | ❌ 不被继承                                           |
| Base(const Base&)（隐式拷贝构造函数） | ❌ Subclass 不会自动拥有                                |
| Base&&（移动构造                 | ❌ 不会继承                                           |
| explicit Base(int)          | ✅ 继承构造函数保留 explicit 关键字，Subclass 构造调用需要显式，不能自动转换 |
| 拷贝构造 / 移动构造                 | 否                                                |
| `explicit` 版构造函数            | 是的                                               |
| 模板构造函数                      | 可以构造并暴露一个对应的模板构造                                 |
| 私有构造函数                      | 否                                                |
| protected                   | 是的，子类 accessible 和继承构造都通😊                       |
| 传统 C++的继承写法为                |                                                  |
```cpp
struct Base {
    Base() {}
    Base(int x) {}
    Base(const T& other) = default;
    Base(std::string&& s) {}
};
struct Subclass : Base {
    Subclass() {}
    Subclass(int x) : Base(x) {}
    Subclass(const T& other) : Base(other) {}
    Subclass(std::string&& s) : Base(std::move(s)) {}
};
```
这是非常机械的代码，难以维护且性能较低
### 同时使用默认构造和用户定义构造器
若用户定义了任何构造函数，编译器将**不再生成默认构造函数**，但有时确实希望两者兼有。
```cpp
class Magic {
public:
    Magic() = default;
    Magic& operator=(const Magic&) = delete;
    Magic(int magic_number);
};
```
- 编译器将会在知道用户已经写了其他构造函数时仍在编译期自动构造这个函数，而不是拒绝。这个函数在大多编译器中作用是初始化一些类中**没有被声明的成员**  - 用 `= delete` 是阻止调用拷贝构造/赋值函数，多用于构造不可复制的类（单例、资源管理者等）
### 显式虚函数重载
```cpp
struct Base {
    virtual void foo();
};
struct SubClass: Base {
    void foo();
};
```
- 传统 C++中，如果父类中定义了虚函数，而子类中在不知道这个虚函数存在的情况下并不尝试重载虚函数，只是恰好加入了一个具有相同名字的函数。就会导致**意外重载虚函数**
- 如果代码迭代过程中将父类虚函数删除，子类**原本用来*重载*父类旧虚函数**的函数将会变为普通得类方法
- 引入 `override` 关键字将显式的告知编译器进行重载，编译器将检查基函数是否存在这样的其函数签名一致的虚函数，否则将无法通过编译
```cpp
struct Base {
    virtual void foo(int);
};
struct SubClass: Base {
    virtual void foo(int) override; // 合法
    virtual void foo(float) override; // 非法, 父类没有此虚函数
};
```
`final` 则是为了**防止类被继续继承**以及**终止虚函数继续重载**引入的。
```cpp
struct Base {
    virtual void foo() final;
};
struct SubClass1 final: Base {
}; // 合法
struct SubClass2 : SubClass1 {
}; // 非法, SubClass1 已 final
struct SubClass3: Base {
    void foo(); // 非法, foo 已 final
};
```
C++中有什么内置方法可以将一个 string 字符串全部转为小写？
### 强枚举类型
传统 C++中，枚举类型并非类型安全，枚举类型会被视作整数，则会让两种完全不同的枚举类型可以进行直接的比较（虽然编译器给出了检查，但并非所有），甚至**同一个命名空间中不同枚举类型的枚举值名字不能相同**
- 传统枚举中 `enum struct` vs `enum class` 几乎无区别
- 新强枚举类型中不能够将其与整数数字进行比较
- 不能对不同的枚举类型的枚举值进行比较，但相同枚举值之间如果指定的值相同，那么可以进行比较
- 强枚举类型可以指定类型值，但值的基础类型**必须是整数**
```cpp
enum class new_enum : unsigned int { // 使用这种语法才能够赋值和相同枚举类型之间的比较
    value1,
    value2,
    value3 = 100,
    value4 = 100
};
```

| 特性                                | 传统枚举（`enum`）                   | 强类型枚举（`enum class`）              |
| --------------------------------- | ------------------------------ | -------------------------------- |
| **枚举值是否会在外层命名空间暴露**               | ✅ 是的！会造成命名污染（name clash）       | ❌ 不会，枚举值嵌套在类中 -> `E::val`        |
| **是否能隐式转换为 int / 整数类型**           | ✅ 是的，enum 值 **默认继承自 int**      | ❌ `enum class` 到 int 需要 **显式转换** |
| **底层存储类型可以显式指定吗？**                | C++11 后可用 `enum : type` 指定底层类型 | ✅ 可以，而且默认为 int / 任意可选类型          |
| **是否支持前置声明**（forward declaration） | ❌ 早期不支持 与底层类型的定义分离             | ✅ 支持前置声明                         |
| **是否支持作用域控制**                     | ❌ 枚举值不能再作用域中独立                 | ✅ 每个枚举值都包裹在 :: 作用域里              |
| 如果需要输出强枚举类型变量，**必须要进行强制类型转换**     |                                |                                  |
```cpp
enum class Priority : uint8_t { Low = 1, High = 4 };
int main() {
    Priority p = Priority::Low;
    std::cout << static_cast<uint8_t>(p) << std::endl; // 输出 1
}
// 大量的转换代码可以通过重载操作符一劳永逸
template<typename T>
std::ostream& operator<<(
    typename std::enable_if<std::is_enum<T>::value, std::ostream>::type& stream, const T& e) {
    return stream << static_cast<typename std::underlying_type<T>::type>(e);
}
```
1. **[[#SFINAE 地狱出现|SFINAE]] 应用**：`std::enable_if<std::is_enum<T>::value, std::ostream>::type` 是一种静态检查，只有当 `T` 是枚举类型时，函数模板才参与重载解析。
2. 如果 T 是枚举类型，`std::enable_if<std::is_enum<T>::value, std::ostream>::type` 会解析出枚举类型变量**值的类型**，然后 enable\_if 的第二个参数才会被传入 operator 中，使用 `::tpye` 得到 ostream 的类型作为 operator 的参数，而第二个参数则是 T 类型的变量。函数体中解析出枚举类型变量的值
3. **利用** `std::underlying_type` **得到底层类型**，然后将枚举变量 `e` 强制转换为该类型进行输出。 简而言之，`operator<<` 的第一个参数是将 `T` 限制为 `enum` 才能继续解析
#### 命名空间暴露
传统写法
```cpp
// 在文件中定义，会暴露到整个文件中，如果这个文件被include，会污染所有包含这段代码的空间
enum Color { R, G, B };
enum Light { R, OFF, RED }; // ❌ 编译错误！R 重定义了！
```
强枚举类型写法
```cpp
enum class Color { Red, Green, Blue };
enum class Light { Red, On, Off };
Color::Red 和 Light::Red 互不干扰 ✅
```
#### 传统枚举值非法与底层整数类型交互
```cpp
Color c = Color::G;
int a = c; // a会等于1
```
如果 Color 是强枚举类型会导致编译不通过
#### 枚举的底层存储类型不可控
传统的 `enum` 是直接继承编译器整数系统，通常为 `int` 且不可修改。但对于嵌入式系统、协议设计也许想要枚举以 `uint8_t`、`bool` 出现，传统 enum 不支持 强枚举类型支持以下操作
```cpp
enum class Priority : uint8_t { Low = 1, High = 4 };
```
# 第 3 章语言运行期的强化
### 3.1 Lambda 表达式
#### 基本特性
- Lambda 表达式内部函数体在默认情况下是不能够使用函数体外部的变量的，这时候捕获列表可以起到传递外部数据的作用
- 值捕获、引用捕获都是已经在外层作用域声明的变量，因此这些捕获方式捕获的均为左值，而**不能捕获右值**。
- C++14 允许捕获的成员用任意的表达式进行初始化，这就允许了右值的捕获，被声明的捕获变量类型会根据表达式进行判断，判断方式与使用 auto 本质上是相同的
```cpp
#include <memory>  // std::make_unique
#include <utility> // std::move
void lambda_expression_capture() {
    auto important = std::make_unique<int>(1);
    auto add = [v1 = 1, v2 = std::move(important)](int x, int y) -> int {
        return x+y+v1+(*v2);
    };
    std::cout << add(3,4) << std::endl;
}
```
- C++11 的捕获列表中新的变量初始化**不能使用 auto**来推断类型，C++14 允许
```cpp
auto add = [](auto x, auto y) {
    return x+y;
};
add(1, 2);
add(1.1, 2.2);
```
#### 隐式转换为函数指针
Lambda 表达式中**没有捕获变量**（即捕获列表为空 `[]`）时，从 C++11 开始，无捕获的 lambda 可转换为与它的 operator() 对应的函数指针。^[2] 转化为函数指针需要
- Lambda 不能有**捕获列表（captures）**；
- Lambda 必须是一个**静态函数行为**^[3]（无状态、无捕获）；
- 转换目标必须是**兼容的函数指针类型**（参数和返回值匹配）。
---
[2]: 来自 C++标准（ISO C++11） [3]: 静态函数行为表示一个函数可以被转化为函数指针类型，没有存储外部变量（捕获），完全等价于一个 `staic type func(args)`，不持有任何外部变量的拷贝或者引用（状态）
#### 异常处理
| 写法                    | 作用说明                            |
| --------------------- | ------------------------------- |
| `noexcept`            | 显式说明该函数不会抛出异常                   |
| `throw()`（C++11 之前）   | 已淘汰，在新代码中不建议使用                  |
| `noexcept(condition)` | 条件式 noexcet，只有 condition 为真时不抛出 |
| `[]() noexcept`       | Lambda 标记为不会抛出异常                |
```cpp
auto lamb = [](auto value) noexcept(is_same<decltype(value), int>()) -> int {return value * value;};
```
## 3.2 函数对象包装器
### `std::function`
C++11 `std::function` 是一种通用、多态的函数封装，它的实例可以对任何可以调用的目标实体进行存储、复制和调用操作，它也是对 C++ 中现有的可调用实体的一种类型安全的包裹（相对来说，函数指针的调用不是类型安全的），
`std::function` 提供了[[C++开发范式和术语#类型擦除|类型擦除机制]]，使得它可以统一处理各种可调用对象（lambda、函数指针、绑定器、仿函数等），具有更高的灵活性和抽象能力。换句话说，就是函数的容器。**当我们有了函数的容器后便能够更加方便的将函数、函数指针作为对象进行处理。**，可以理解为一种闭包对象^[1] `std::function` 是一个泛化的可调用对象的**封装容器**，可存储、复制、调用任意的：

| 类型                                                                         | 示例                                   |
| -------------------------------------------------------------------------- | ------------------------------------ |
| Lambda 表达式                                                                 | `[](int x) { cout << x; }`           |
| 函数指针                                                                       | `void(*)(int)`                       |
| 普通函数                                                                       | `void func(int)`                     |
| 绑定器（`std::bind`）                                                           | `std::bind(&Class::method, obj, _1)` |
| 任意具有 `operator()` 的仿函数                                                     | `MyFunctor` 实例                       |
| [1]:由 Lambda 表达式创建的**匿名类对象（anonymous object）**，称为 **闭包对象（closure object）** |                                      |
### `std::bind`
参考[C++ std::bind()函数模板的用法（非常详细，附带实例） - C语言中文网](https://c.biancheng.net/view/ste2pge.html)
#### 绑定函数和参数
```cpp
auto bound_func = std::bind(f, 1, _1, _2); // 给 f 的第一参数绑定值1，剩下等待两个参数
bound_func(a, b); // 实际调用就是 f(1, a, b);
// --------------------或者这种形式-----------------------
void deliver(std::string city, std::string phone) {
    std::cout << "Deliver to " << city << ", call at " << phone << std::endl;
}
int main() {
    // 使用 std::bind 绑定一个部分参数
    auto action = std::bind(deliver, "Shanghai", std::placeholders::_1);
    action("123-4567"); // 参数会填到 _1 的位置
}
```
- 一旦你调用 `std::bind(...)`，编译器就会把你绑定的实参拷贝进闭包，并将其绑定逻辑“封死”在一个包装器中。你**无法从中提取或去掉某个参数**。原因是：
- 绑定在编译期（Compile-time）即封装完成
- `std::bind` 返回的是一个绑定器对象，其类型是未命名的，但它是可调用的，并且可以通过多次绑定继续扩展参数。
#### 绑定函数指针到对象实例
将 **函数指针** 和 **对象实例** 绑定，生成一个 **可调用对象**（适用于普通函数调用接口）： 在 C++ 中，取成员函数地址必须显式使用 `&` 符号。这是语言标准规定的语法，但普通函数名赋值给变量会隐式转换为函数指针
```cpp
thread tp(std::bind(&P_and_C::producer, &pc));
// 其内部实现类似于
auto binder = [&pc] { pc.producer(); };
thread tp(binder);
```
如果绑定对象是成员函数，`std::bind` 将成员函数绑定到特定对象实例上时，实际上是创建了一个新的可调用对象，这个对象包含了指向成员函数的指针以及指向对象实例的指针
#### 验证绑定对象
使用 `std::bind` 绑定的对象的 `target()` 函数返回**绑定函数对象中存储的目标对象**，由于实例化 `std::bind` 对象是在编译器进行的，数据已经被编译无法在运行时获取，使用 get 需要手动指定绑定函数对象中存储的目标对象类型，如果手写的指定类型和存储类型一致，则返回这个函数的指针，否则返回 `nullptr`， target 签名为：
```cpp
template<typename T>
T* target() noexcept;
```
获取普通函数和类成员函数（绑定了成员函数）的方法为：
```cpp
// 要求target返回一个返回值为void，接受两个int类型的函数指针*
auto targetGlobalFunc = globalFunctionHandler.target<void (*)(int, int)>();
// 同理，要求返回返回值为void，并且是Processor类的成员函数Processor::的参数为2个int的指针*
auto targetMemberFunc = boundMemberFunc.target<void (Processor::*)(int, int)>();
```
### `std::placeholder`
一般和 [[Modern C++#`std bind`|bind]] 配合使用，作为绑定函数参数位置占位符 参考代码：
```cpp
typedef std::function<void(int, int)> EventHandler;
class EventManager {
   public:
    void registerHandler(EventHandler handler) {
        handlers.push_back(handler);
    }
    // 触发事件
    void triggerEvent(int eventType, int eventCode) {
        std::cout << "Triggering event with type: " << eventType << " and code: " << eventCode << std::endl;
        for (auto& handler : handlers) {
            handler(eventType, eventCode);
        }
    }
    // 打印所有处理器的类型信息
    void printHandlersTypeInfo() {
        for (auto& handler : handlers) {
            std::cout << "Handler type info: " << handler.target_type().name() << std::endl;
        }
    }
   private:
    std::vector<EventHandler> handlers;
};
void handleEvent(int type, int code) {
    std::cout << "Global function handling event with type: " << type << " and code: " << code << std::endl;
}
class Processor {
   public:
    void process(int type, int code) {
        std::cout << "Processing event with type: " << type << " and code: " << code << std::endl;
    }
};
int main() {
    EventManager manager;
    Processor processor;
    manager.registerHandler(handleEvent);
    EventHandler globalFunctionHandler = handleEvent;
    EventHandler boundMemberFunc = std::bind(&Processor::process, &processor, std::placeholders::_1, std::placeholders::_2);
    manager.registerHandler(boundMemberFunc);
    int importantValue = 42;
    manager.registerHandler([importantValue](int type, int code) {
        std::cout << "Lambda handling event with type: " << type << " and code: " << code << " and important value: " << importantValue << std::endl;
    });
    manager.printHandlersTypeInfo();
    std::cout << "      " << std::endl;
    // 判断是否绑定了 Processor::process
    auto targetMemberFunc = boundMemberFunc.target<void (Processor::*)(int, int)>();
    if (targetMemberFunc && *targetMemberFunc == &Processor::process) {
        std::cout << "The member function Processor::process is bound." << std::endl;
    } else {
        std::cout << "No matching target function bound for Processor::process." << std::endl;
    }
    // 判断是否绑定了 handleEvent
    auto targetGlobalFunc = globalFunctionHandler.target<void (*)(int, int)>();
    if (targetGlobalFunc && *targetGlobalFunc == handleEvent) {
        std::cout << "Global function handleEvent is bound." << std::endl;
    } else {
        std::cout << "No matching target function bound for handleEvent." << std::endl;
    }
    std::cout << " " << std::endl;
    manager.triggerEvent(11, 27);
}
```
输出结果：
```bash
Handler type info: PFviiE
Handler type info: St5_BindIFSt7_Mem_fnIM9ProcessorFviiEEPS1_St12_PlaceholderILi1EES6_ILi2EEEE
Handler type info: Z4mainEUliiE_
No matching target function bound for Processor::process.
Global function handleEvent is bound.
Triggering event with type: 11 and code: 27
Global function handling event with type: 11 and code: 27
Processing event with type: 11 and code: 27
Lambda handling event with type: 11 and code: 27 and important value: 42
```
## 3.3 右值引用
### 左值、右值的纯右值、将亡值、右值
[[C++学习对话#左值引用和右值引用]] 左右值之间的类型转换

| 类别                | 表现                                              | 能调用操作                          |
| ----------------- | ----------------------------------------------- | ------------------------------ |
| 左值                | 指对象实际存在的，通常命名                                   | 允许 `=`、函数调用、函子调用               |
| 右值                | 一般是临时对象                                         | 更愿意被移动（`std::move`），编译器可优化局部引用 |
| 函数参数是左值但用户想移动     | `std::move(argument)` 拦截为一个右值桥                  |                                |
| auto&&、自动引用推导也会保留 | auto&& 是 **universal reference**，能完整推导出参数身份对应关系 |                                |
```cpp
int x = 10;
int&& y = std::move(x); // y是右值
```
---
- **左值** (lvalue, left value)，顾名思义就是赋值符号左边的值。准确来说， 左值是表达式（不一定是赋值表达式）后依然存在的持久对象。
- **右值** (rvalue, right value)，右边的值，是指表达式结束后就不再存在的临时对象。 而 C++11 中为了引入强大的右值引用，将右值的概念进行了进一步的划分，分为：纯右值、将亡值。
- **纯右值** (prvalue, pure rvalue)，纯粹的右值，要么是纯粹的字面量，例如 `10`, `true`；要么是求值结果相当于字面量或匿名临时对象，例如 `1+2`。非引用返回的临时变量、运算表达式产生的临时变量、原始字面量、Lambda 表达式都属于纯右值。
- 字面量除了字符串字面量以外，均为纯右值。而字符串字面量是一个左值，类型为 const char 数组。例如：
```cpp
int main() {
    // 正确，"01234" 类型为 const char [6]，因此是左值
    const char (&left)[6] = "01234";
    // 断言正确，确实是 const char [6] 类型，注意 decltype(expr) 在 expr 是左值
    // 且非无括号包裹的 id 表达式与类成员表达式时，会返回左值引用
    static_assert(std::is_same<decltype("01234"), const char(&)[6]>::value, "");
    // 错误，"01234" 是左值，不可被右值引用
    // const char (&&right)[6] = "01234";
}
```
***且非无括号包裹的 id 表达式与类成员表达式时，会返回左值引用***可以参考 [[Modern C++#decltype 类型推导|decltype类型推导规则]]
### 移动语义
#### 移动语义原理
> [!note] 移动语义（Move Semantics）是指：**将资源从一个对象“移动”到另一个对象，而非复制它**。它通过**右值引用（rvalue reference）** 和 `std::move()` 机制实现。
> 
> 本质是通过[[C++ Runoob Tutoral#移动构造函数|移动构造/赋值函数]]，来让**右值传入时**触发**类自身移动语义**，实现 0 开销资源转移
![[Pasted image 20250806163633.png]]
```cpp
std::vector<int> v = heavy_computation(); // heavy_computation 返回一个局部 vector，传统拷贝代价峰值高
```
没有移动语义时：
- 调用复制构造函数 → **将整个 vector 所有的堆内存数据复制到 v 中**；
- 局部 vector 返回瞬间就销毁，白费了大量资源复制（copy）开销。
- `vector`、`string` 这类对象的返回、赋值曾经低效，因每个值返回或传参都必须浅拷贝全部数据，才有 new 变量接收；
- `std::vector<int> func()` 会带来整个缓冲区内存的复制，严重降低性能；引入移动语义后拷贝复制只是资源所有权转移（transfer of ownership），**不复制数据，提升性能**，开销近乎为 0。

| 类                  | 是否可移动？                                                                          | 行为对比                     |
| ------------------ | ------------------------------------------------------------------------------- | ------------------------ |
| 标准容器               | ✅ 可以move                                                                        | 资源（指针）所有权转换，无需大量 copy    |
| 函数对象               | ✅ bind, lambda 部分也能 move                                                        | 将整个状态快速转移进 std::function |
| std::unique\_ptr   | ✅ 必须 move（不能复制）                                                                 | 唯一拥有资源，移动转移，安全资源封装       |
| std::shared\_ptr   | ✅ 可以 move，也可以 copy                                                              | 拷贝时增加引用计数                |
| 内置类型（int，double 等） | ❌ 不用 move（无资源）                                                                  | 拷贝即可                     |
| std::function      | ✅ 复杂封装内 std::bind std::function 是 type-erasure 模版，支持 std::move(v1) 情况转移lambda\` |                          |
#### 注意事项
- 函数中（包括参数列表）左值引用作为返回值不会自动变成右值
```cpp
std::string return_str(std::string& str) {
    // str 是一个左值引用，即使在 return 语句中也是左值
    // 所以会调用拷贝构造函数
    return str;
    return std::string(str);  // 编译期实际上会转化为，隐式拷贝构造
}
```
原因：虽然 str 是一个左值引用，但他在函数中已经具有名字了，不是一个临时值，所以编译器认为他是右值，不触发移动而是拷贝 下面这种情况 A. 使用 `std::move` 显式转换，这种情况有一些特殊，参考[[C++ Runoob Tutoral#移动构造函数|移动构造/赋值]]
```cpp
std::string return_str(std::string& str) {
    return std::move(str);  // 显式转换为右值，触发移动
}
```
B. 返回临时对象（右值）
```cpp
// 这是编译期的 NRVO 优化
std::string return_str() {
    return "Hello";  // 返回临时对象（右值），自动移动
}
// C++17保证复制省略策略
std::string return_str() {
    std::string temp = "Hello";
    return temp;  // 这一点在 C++17 guaranteed copy elision 中实现，可能省略移动过程直接在栈对应位置构建
}
```
- 右值引用参数在函数中身份是左值
```cpp
void func(std::string&& str) {  // str 是一个右值引用参数
    std::string s1 = str;        // str 在函数内部是左值，触发拷贝
    std::string s2 = std::move(str);  // 必须 std::move 才能移动
}
```
```md
  ┌──────────────┬────────────────────────┬────────────────┐
  │ 情况          │ 代码                   │ 行为            │
  ├──────────────┼────────────────────────┼────────────────┤
  │ 左值引用参数   │ return str;            │ 拷贝            │
  │ 右值引用参数   │ return str;            │ 拷贝（意外！）   │
  │ 右值引用参数   │ return std:: move (str); │ 移动          │
  │ 临时对象返回   │ return "Hello";        │ 移动（或省略）   │
  └──────────────┴────────────────────────┴────────────────┘
```
#### 移动语义测试示例
传统 C++ 通过拷贝构造函数和赋值操作符为类对象设计了拷贝/复制的概念，但为了实现对资源的移动操作，调用者必须使用先复制、再析构的方式，否则就需要自己实现移动对象的接口。 传统的 C++ 没有区分『移动』和『拷贝』的概念，造成了大量的数据拷贝，浪费时间和空间。
```cpp
void reference(int& v) {
    std::cout << "左值" << std::endl;
}
void reference(int&& v) {
    std::cout << "右值" << std::endl;
}
template <typename T>
void pass(T&& v) {
    std::cout << "普通传参:";
    reference(v);
}
int main() {
    std::cout << "传递右值:" << std::endl;
    pass(1); // 1是右值, 但输出是左值
    std::cout << "传递左值:" << std::endl;
    int l = 1;
    pass(l); // l 是左值, 输出左值
    return 0;
}
```
- 对于 `pass(1) -> 左值`：
  
  - `1` 是一个纯右值（prvalue），传入 `T&& v` 模板参数时，C++ 的模板推导规则是：
    
    - `T` 被推导为 `int`；
    
    - 所以 `T&& v` 实际上被推导为 `int&& v`；
    
    - ⟹**所以，参数** `v` **是右值引用绑定一个右值**：`1` 被绑定为 `int&& v = 1;` 这种。
  
  - 虽然 `v` 是 `int&&` 类型，pass函数中将v传入reference的过程中给1赋予了一个"v"的名字，所以在上下文中，v是一个左值
- 对于 `pass(l) -> 右值`：
  
  - `l` 已经被命名，`T&&` 通过[[Modern C++#Note：万能引用|万能引用]]解析出传递的参数是一个左值
  
  - 然后调起对应的左值 reference
#### 左值引用注意事项
![[Pasted image 20250910141538.png]]
- ***非常量引用的初始值必须是左值***，这很好理解。8 时临时的没有名字的常量，没有内存地址，无法使用 `&` 引用。非常量引用意味着允许通过引用来修改原始对象。如果允许一个非常量引用绑定到一个右值（临时值）上，那么你修改这个引用，就是在修改一个即将消失的临时值，这没有任何意义，而且极易引发错误（**修改未定义内存区域**）。所以C++语言标准禁止这种行为。
- ***常量左值引用可以引用左值或者右值***，被绑定的右值生命周期会得到延长。这是因 `const` 承诺“我不会修改你引用的对象”。既然承诺不修改，那么绑定一个临时的右值就是安全的。我只需要读取你的值，你销毁与否不影响我的逻辑。意思就是我要引用一个不可修改的值，它可以是左值也可以是右值。 ***这一操作常用于拷贝构造函数***，拷贝构造函数中：使用
```cpp
copy_func(T& other);
// 而不是
copy_func(const T& other);   // 这相当于copy_func(T(other));
```
而函数只接受左值，传入右值时编译失败。而传入左值需要先使用 `T` 类型的构造（拷贝）函数在**整个作用域中构造函数**，考虑到作用于中其他语句可以访问到这个对象，使得**编译器很难做优化**，需要进行这就导致了内存和时间开销。 如果传入的是第二个函数中，那么编译器就会在更小的作用域（copy\_func 函数的栈帧）**构造匿名对象**后直接读取（注意不能修改）其中数据。避免性能浪费。
- 必须要声明的是，如果函数只需要一个只读的字符串，那么一般而言使用 `string_view` 会有更高的性能。但须绝**对保证** `string_view` **所指向的底层字符串数据，其生命周期比** `string_view` **实例本身要长**。否则就是悬空指针，导致未定义行为。
#### 右值引用注意事项
![[Pasted image 20250910150742.png]]
- 当对象间使用移动语义时，需要设计移动构造函数和移动赋值运算符。
- 必须为他们声明 `noexcept`，这是因一旦移动过程中出现了报错终中断，就会出现**旧对象中部分旧数据没有从把所属权移交给新对象**，同时**新对象不完整**的情况。如果没有声明，则默认使用拷贝构造函数（或运算符）保证内存安全。 右值引用 `int&& a` 只能使用右值 `int&& z = 8;`，如果使用左值放在右边会编译错误。但可以通过 `static_cast<int&&>` 将左值转化为右值引用，从而左值也能使用移动构造函。 **左值不能被隐式移动的**，但可以通过 `std::move` 将左值转化为右值引用，从而能够被移动。其原理也是 `static_cast` 类型转换。
#### 易混淆的点
```cpp
#include <iostream>
void fuck(int&) {
    std::cout << "left ref called.\n";
}
void fuck(int&&) {
    std::cout << "right ref called.\n";
}
int&& a{1};
int main(){
    fuck(a);
    // fuck(std::move(a)); // 调用右值引用版本
}
```
这段代码调用了第一个函数重载，左值引用。这是因**变量** `a` **是一个具名的右值引用，而所有具名的变量（无论其类型是什么）都是左值**。 这条规则解释了为什么在***移动构造函数和移动赋值运算符***的内部，你必须对成员变量使用 `std::move`。
```cpp
class MyClass {
    T data;
public:
    // 移动构造函数
    MyClass(MyClass&& other) noexcept
        : data(std::move(other.data)) // 必须用 std::move!
    {}
};
```
`other` 虽然是一个右值引用类型的参数，但因它有名字，所以它在函数体内是一个**左值**。如果直接写 `data(other.data)`，调用的将是 `T` 的拷贝构造函数（前提是有，如果没有会报错），而不是预期的移动构造函数（也需要提前定义，如果没有定义则调用拷贝构造函数）。使用 `std::move(other.data)` 将 `other.data` 从左值转换为右值，从而正确地触发移动语义。
> 这条规则是故意这样设计的，是为了安全。它防止你意外地“移动”一个你可能还想再次使用的具名变量。你必须显式地使用 `std::move` 来表明“我以后不再需要这个变量的当前值了”，然后编译器才允许移动它。
### Note：mutable
```cpp
[捕获列表](参数列表) mutable(可选) 异常属性 -> 返回类型 {
    // 函数体
}
```
#### 设计意义
`mutable` 是为了在逻辑上“保持 const 性” 的同时，**允许某些内部数据轻微变化以提高性能或实现副作用（如缓存、日志、调试旗标等）**。
1. **避免打破 const 正确性（const correctness）**：
   
   - 即使你在 `const` 方法中修改一些不影响用户感官的内部状态（例如统计调用次数、缓存值），仍要通过 `mutable` 来告诉编译器：这个修改是“可接受的”。
2. **支持隐藏的副作用/模块性**：
   
   - 一个方法即使是 const，也可以修改它自己的 `mutable` 成员，以保存计算结果或进行调试跟踪等，这样不会影响程序行为外部可见性。
3. `mutable` 只能用于**类中成员变量**:
   
   1. **类成员变量**（即 `mutable int x;`） —— `✅ 合法`
    -   **Lambda 表达式参数列表后** —— `✅ 作为关键字使用`
    
    -   **函数、局部变量、全局变量，或其它类成员（如方法）** —— `❌ 不合法`
#### 作用&特性
##### 1\. 修饰类成员变量
**修饰对象成员变量的** `mutable` **表示“即使对象是** `const` **的，该成员也可以被修改。”**
```cpp
struct Cache {
    mutable int cachedValue;  // 即使对象是 const，也能修改 cachedValue
};
void printCache(const Cache& c) {
    c.cachedValue = 100;  // 允许！因 cachedValue 是 mutable 的
}
```
##### 2\. 允许在 lambda 中修改变量
当 Lambda 以**值捕获（by value）变量时，捕获的变量默认是** `const` **的**。加了 `mutable` 关键字后，捕获的变量就可以在 Lambda 内部修改了。
### Note：退化规则
C++ 中“**退化规则（decay rules）**”指的是某些类型的值在作为实参使用时，自动转换成“更简单的类型”，以符合使用场景。其中包括：
#### 1\. 函数类型 → 函数指针（func decay）
```cpp
void func(int); // 函数定义
// 不论声明函数还是使用函数类型作为模板参数，都“退化”为函数指针
using FuncType = void(int);
void forward(FuncType f); // 实际被看作 void (*f)(int)
```
- C++ 函数 **不能直接作为“对象”传递或赋值**；
- 函数类型退化为指针，允许函数变量通过间接方式在运行时表示函数，实现了变量函数式风格；
- 通过对函数类型退化为函数指针，所有函数都能够通过统一的接口进行传入和调用，无需单独为每个具体的 `void(int)` 函数创建一个非指针的变量类型。
#### 2\. 数组类型 → 指针类型（array decay）
```cpp
int arr[5] = {1, 2, 3, 4, 5};
int* p = arr; // arr 退化为 &arr[0]
void print(int* a);
print(arr); // arr 退化为指针，arr 不是 int* 类型，但传递时会退化
```
常用退化类型主变体
```cpp
#include <type_traits>
std::decay<int[5]>::type       <=> int* (数组退化)
std::decay<std::string&>::type <=> std::string (引用去掉)
std::decay<const int&>::type   <=> int (去除常量，退化为基本类型值)
std::decay<void(int)>::type    <=> void(*)(int) (函数名退化成指针)
```
### Note：explict
`explicit` 是用于构造函数的一种修饰符。
```cpp
explicit constructor_name(...);explicit MyClass(int x);
```
它表示：**这个构造函数不允许隐式转换。** 也就是说，**编译器不会用 explicit 构造函数进行自动类型转换**（implicit conversion）。
## 1\. explicit（隐式构造的陷阱）
```cpp
class MyInt {
public:
    MyInt(int x) : value(x) { } // implicit
    int value;
};
```
现在你写：
```cpp
MyInt m = 23;
```
这就是隐式转换：23 将**自动通过** `MyInt(int)` **构造函数构造一个临时对象**，并赋值给 `m` 但如果发生了这个调用：
```cpp
void func(MyInt m);func(42); // 能成功
```
没有 explicit，你甚至可以直接将 `int` 传给期望是 `MyInt` 的函数！！💡 **隐式转换**

| explicit修饰的目标 | 禁止自动转换                      |
| ------------- | --------------------------- |
| 构造函数          | ✅ 防止 "T obj = value;" 这种转换  |
| 转换运算符         | ✅ 防止 from T → SomeType 隐式发生 |
| 单参数构造         | ✅ 多个最佳实践建议 explicit         |
| 多参数构造         | 通常不需要 explicit              |
# 第 4 章 容器
## 4.1 线性容器
### `std::array`
- 与 `std::vector` 不同，`std::array` 对象的大小是固定的，如果容器大小是固定的，那么可以优先考虑使用 `std::array` 容器。
- `std::vector` 是自动扩容的，当存入大量的数据后，并且对容器进行了删除操作，容器**并不会自动归还被删除元素相应的内存**，这时候就需要手动运行 `shrink_to_fit()` 释放这部分内存。
- array 与 C 风格代码的兼容
```cpp
void foo(int *p, int len) {
    return;
}
std::array<int, 4> arr = {1,2,3,4};
// C 风格接口传参
// foo(arr, arr.size()); // 非法, 无法隐式转换
foo(&arr[0], arr.size());        // 合法
foo(arr.data(), arr.size());    // 合法
```
### `std::forward_list`
- 和 `std::list` 的双向链表的实现不同，`std::forward_list` 使用单向链表进行实现，提供了 `O(1)` 复杂度的元素插入，**不支持快速随机访问**（这也是链表的特点），也是标准库容器中唯一一个**不提供** `size()` 方法的容器。
- 当不需要双向迭代时，具有比 `std::list` 更高的空间利用率。
## 4.2 无序容器
略
## 4.3 元组
### `std::tuple`
#### 基本操作
1. `std::make_tuple`: 构造元组
2. `std::get`: 获得元组某个位置的值
3. `std::tie`: 元组拆包
4. `std::tuple_cat` / `merge`: 合并两个元组
```cpp
auto t1 = std::make_tuple(1, "hello", 3.14);
auto t2 = std::make_tuple(42, std::string("tuple2"), Matrix(), 7);
auto t3 = merge(t1, t2); // 合并
auto t3 = std::tuple_cat(t1, t2);
    ```
其中，merge 使用值传递复制的方法构建元组，tuple_cat 它**不会自动进行数据复制**，除非传入是按值传递（by value）；可以提供下面的模板代码：
```cpp
template<typename Tuple1, typename Tuple2>
auto merge_tuples(Tuple1&& t1, Tuple2&& t2) {
    return std::tuple_cat(std::forward<Tuple1>(t1), std::forward<Tuple2>(t2));
}
```
根据[[Modern C++#Note：完美转发|完美转发]]和[[Modern C++#Note：万能引用|万能引用]]中知识，可以知道：

| `merge_tuples` 传入方式                  | `tuple_cat` 传入参数类别              |
| ------------------------------------ | ------------------------------- |
| t1 是 “左值” → 在 merge\_tuple 中被当作变量名访问 | 所以作为左值传入 `tuple_cat`            |
| t2 是 “右值” → 也因变量命名转变为左值              | `tuple_cat` 同样看到是一个 tuple 的左值变量 |
- 即便你传入的是 `std::move` 过来的 rvalue 参数，`tuple_cat` **仍以左值来 copy 所有元素**；
- 合并过程就变得无法使用 move，而采用 copy 构造 → 如果你 tuple 中有 expensive 类型（如字符串、vector），不显式使用 `move` 的情况下，这将浪费大量拷贝。对 `unique_ptr`、`std::mutex` 这种不可复制类型，编译器会直接报错。
- 如果使用 forward 转发，则会：
  
  - 如果是左值 → tuple\_cat 会使用 `std::tuple<Ts...>` 内部的 copy构造函数；
  
  - 如果是右值 → 使用 move构造函数；
  
  - \*\*如果无法得知任意参数的身份，建议使用 **universal reference（**`T&&`**）与** `std::forward<T>` **结合转发让编译器决定如何传递值，如果可以确定参数的身份，可以显式使用 move 让左值变成右值提高性能**
> 除非是 tuple 元素都是 trivial 类型（如 int、double、enum、trivial-functions），否则绝不 recommended。
5. 遍历元组
```cpp
template <typename T>
auto tuple_len(T &tpl) {
    return std::tuple_size<T>::value;
}
for(int i = 0; i != tuple_len(new_tuple); ++i){
    // 运行期索引
    std::cout << tuple_index(new_tuple, i) << std::endl;
}
```
---
#### 运行期索引
- `std::get` 除了使用常量获取元组对象外，C++14 增加使用类型获取元组中对象：
```cpp
std::tuple<std::string, double, double, int> t("123", 4.5, 6.7, 8);
std::cout << std::get<std::string>(t) << std::endl;
std::cout << std::get<3>(t) << std::endl;
```
如果需要访问double则只能通过下标或是使用 `std::variant`、`std::any`、`std::apply`，处理元组多项逻辑。 `std::get<>` 依赖一个编译期的常量，所以下面的方式是不合法的：
```cpp
int index = 1;
std::get<index>(t);
```
# 第 5 章 智能指针与内存管理
## 5.1 RAII 与引用计数
### 智能指针 RAII 设计
C++11 在指针对象上对 RAII 的拓展：C 语言内存管理较为复杂，因为手动获取和释放资源，删除指针操作容易忘记或出错，**智能指针**就用于解决这些问题：
1. **编译时**：防止 `unique_ptr` 非法拷贝等明显错误
2. **运行时**：自动管理资源，避免内存泄漏
3. **局限性**：无法检测所有不当使用，主要作用是自动管理动态分配的资源，从而避免资源泄漏（如忘记 `delete`），具体参考 [[#Note 智能指针的局限性]]
### 指针引用计数
**引用计数**：引用计数这种计数是为了防止内存泄露而产生的。基本想法是对于动态分配的对象，进行引用计数，每当增加一次对同一个对象的引用，那么引用对象的引用计数就会增加一次，每删除一次引用，引用计数就会减一，当一个对象的引用计数减为零时，就自动删除指向的堆内存。
**注意**：引用计数不是垃圾回收——因它无法处理循环引用（可以通过 `weak_ptr` 解决），引用计数能够尽快收回不再被使用的对象，同时在回收的过程中也不会造成长时间的等待，更能够清晰地表明资源的生命周期。
## 5.2 std::shared\_ptr
### 基本特点
- 表示多个智能指针共享同一个资源的所有权。
- 使用引用计数管理资源生命周期
- 支持拷贝构造和赋值
- 适合多个部分共同拥有资源
- 有性能开销（控制块 + 原子操作）
### 用法
强引用计数，表示当前有多少个`shared_ptr`正在使用资源。当为 0 时，资源会被释放。`std::shared_ptr` 可以通过 `get()` 方法来获取原始指针，通过 `reset()` 来减少一个引用计数，并通过 `use_count()` 来查看**一个对象的引用计数**。例如： 其中，关键引用计数计算的是在于**对象指向的资源的引用次数**，引用次数=0 时会销毁对象
```cpp
auto pointer = make_shared<int>(10);
auto pointer2 = pointer; // 引用计数+1
auto pointer3 = pointer; // 引用计数+1
int* p = pointer.get();  // 这样不会增加引用计数
cout << "pointer.use_count() = " << pointer.use_count() << endl;   // 3
cout << "pointer2.use_count() = " << pointer2.use_count() << endl; // 3
cout << "pointer3.use_count() = " << pointer3.use_count() << endl; // 3
pointer2.reset();
cout << "reset pointer2:" << endl;
cout << "pointer.use_count() = " << pointer.use_count() << endl;   // 2
cout << "pointer2.use_count() = "
<< pointer2.use_count() << endl;           // pointer2 已 reset; 0
cout << "pointer3.use_count() = " << pointer3.use_count() << endl; // 2
```
`pointer`、`pointer2` 和 `pointer3` 都拥有独立的 `shared_ptr` 对象（占用各自的空间），但共享同一个控制块（控制块唯一地对应一块内存资源，这块资源每被引用一次，引用计数器就会+1，任何引用这块资源的 `shared_ptr` 的 `use_count` 方法都指向这个计数器）。
- 控制块包含三个关键数据：
  1. 对真实资源（如动态分配对象）的指针；
  2. 当前引用计数和销毁时触发的清理逻辑。
  3. 只要有一个 `shared_ptr` 存在，`shared_ptr` 指向的对象就不会被销毁。
- 调用 `reset` 方法会使：
  - 将`pointer2`指向null，同时**释放其对原资源的所有权**。
  - 这相当于将该控制块的引用计数**减一**。
使用 `std::make_shared<T>(...)` 创建 `shared_ptr` 会一次性分配内存给资源和控制块，比直接使用 `shared_ptr<T>(new T(...))` 更高效。两者的区别和使用场景可以在 [[AzzatoChat#std shared_ptr 和 std make_shared 区别]]和 [[AzzatoChat#为什么使用 std shared_ptr 构建 instance 对象？]] 中看到有些场景下只能用构造函数而不能用 `make_shared`
```cpp
auto sp1 = std::make_shared<int>(42); // 推荐方式
auto sp2 = std::shared_ptr<int>(new int(42)); // 效率略低
```
如果两个 `shared_ptr` 相互持有对方，会导致引用计数永远不为 0，从而造成内存泄漏。这种情况应使用 `std::weak_ptr` 来打破循环。
```cpp
struct A {
    std::shared_ptr<A> other;
};
auto a1 = std::make_shared<A>();
auto a2 = std::make_shared<A>();
a1->other = a2;
a2->other = a1; // 循环引用，无法释放！
// 解决方法
struct A {
    std::weak_ptr<A> other; // 用 weak_ptr 避免循环
};
```

> [!Warning]
> C++17 开始支持数组类型析构
> - C++17 开始 `std::unique_ptr<T[]> ` 的偏特化版本（`T[]` 不是 `T`）的默认删除器是 `default_delete<T[]>`，它调用 `delete[] p`。所以不需要手写删除器。
> - `std::make_shared ` 和 `std::make_unique` 的数组版本是 C++20 才有的，较早版本中要手动定义**数组删除器**，写法一般为:
> ```cpp
> template <class T>
> void deleteArray(T* v) {
> 	if(v) {
> 		delete[] v;
> 	}
> }
> ```
## 5.3 std::weak\_ptr
### 基本用途特点
- 观察由 `shared_ptr` 管理的对象，**不参与所有权管理**
- 用于解决 `shared_ptr` 的循环引用问题
- 不影响资源生命周期
- 必须通过 `.lock()` 转换成 `shared_ptr` 才能访问资源，调用时尝试获取资源并转换为 `shared_ptr` 类型，否则返回**空的 `shared_ptr`**（已经重载了 `!`，可以直接放在 if 中）lock 的操作是原子的，用法参考 [[FiberLib#弱引用静默处理生命周期结束问题]]
- 适合缓存、监听、观察者等场景
表示有多少个`weak_ptr`在观察这个资源。不影响资源的释放。 要访问 `weak_ptr` 所指向的对象，必须先调用 `.lock()` 获取一个临时的 `shared_ptr`
```cpp
std::weak_ptr<T> wp = sp;
if (auto sp_temp = wp.lock()) {
    // 安全访问资源
} else {
    // 资源已经被释放
}
```
## 5.3 std::unique\_ptr
### 基本用途特点
- 表示对资源的**独占所有权** 。
- 不可复制，但可以移动（move）。
- 可以自定义删除器
---
- 自动释放资源（RAII）
- 没有共享语义
- 零开销抽象
- 适用于单一所有者的情况（如局部变量、工厂函数返回值）
`std::unique_ptr` 是一种独占的智能指针，它禁止其他智能指针与其共享同一个对象，从而保证代码的安全：
```cpp
std::unique_ptr<int> pointer = std::make_unique<int>(10); // make_unique 从 C++14 引入
std::unique_ptr<int> pointer2 = pointer; // 非法
```
使用 move 将指针内容转移到其他的 `unique_ptr`
```cpp
struct Foo {
    Foo() { std::cout << "Foo::Foo" << std::endl; }
    ~Foo() { std::cout << "Foo::~Foo" << std::endl; }
    void foo() { std::cout << "Foo::foo" << std::endl; }
};
void f(const Foo &) {
    std::cout << "f(const Foo&)" << std::endl;
}
int main() {
    std::unique_ptr<Foo> p1(std::make_unique<Foo>());
    // p1 不空, 输出
    if (p1) p1->foo();
    {
        std::unique_ptr<Foo> p2(std::move(p1));
        // p2 不空, 输出
        f(*p2);
        // p2 不空, 输出
        if(p2) p2->foo();
        // p1 为空, 无输出
        if(p1) p1->foo();
        p1 = std::move(p2);
        // p2 为空, 无输出
        if(p2) p2->foo();
        std::cout << "p2 被销毁" << std::endl;
    }
    // p1 不空, 输出
    if (p1) p1->foo();
    // Foo 的实例会在离开作用域时被销毁
}
```
## 5.4 `std::weak_ptr`
```cpp
struct A {
    std::shared_ptr<B> pointer;
    ~A() {
        std::cout << "A 被销毁" << std::endl;
    }
};
struct B {
    std::shared_ptr<A> pointer;
    // std::weak_ptr<A> pointer; // 从 shared_ptr 改为 weak_ptr，避免增加引用计数
    ~B() {
        std::cout << "B 被销毁" << std::endl;
    }
};
int main() {
    auto a = std::make_shared<A>(); // A结构体资源引用+1
    auto b = std::make_shared<B>(); // B结构体资源引用+1
    a->pointer = b; // B结构体资源引用+1
    b->pointer = a; // A结构体资源引用+1
}
```
例子中 ![[file1.png]] 将 B 的强指针改为弱指针后
- `a` 初始化 → 引用计数 1
- `b` 初始化 → 引用计数 1
- `a->pointer = b`（`shared_ptr<B>` → `weak_ptr<A>`） → `b` 的引用计数仍为 1（因没有增加强引用）
- `b->pointer = a` → 因是 `weak_ptr<A>`，**不增加** `a` 的强引用计数，但 `a->pointer` 是强引用 `b` 接着当 a, b 被销毁后 ![[file2.png]]
## Note: 智能指针的局限性
> [!warning] 
> **智能指针不会在编译时或编写时指出开发者是否违反了智能指针的语义或设计意图**。
> 它们不会像类型系统那样强制限制某些“危险行为”，比如：
> - 把同一个原始指针多次交给不同的 `shared_ptr`，导致多个拥有权，从而引发未定义行为；
> - 使用 `get()` 获取原始指针后手动 `delete` 它；
> - 使用 `release()`（`uniqur_ptr` 独有） 放弃所有权后忘记处理；
> - 多线程中不加保护地共享 `shared_ptr` 的拷贝；
> - 滥用 `unique_ptr` 的数组版本和非数组版本；
> - 将栈上对象绑定到智能指针上（除非使用自定义 deleter，否则会出错）；
### 将同一个原始指针交给多个 `shared_ptr`
将同一个原始指针传给多个 `shared_ptr`，会导致多个 `shared_ptr` 独立管理该指针的生命周期，最终在各自析构时尝试 `delete` 同一块内存，引发**未定义行为**（通常是崩溃）。
```cpp
int* p = new int(42);
std::shared_ptr<int> sp1(p);
std::shared_ptr<int> sp2(p); // 错误：两个 shared_ptr 独立管理同一个指针
```
`sp1` 和 `sp2` 都认为自己是唯一的拥有者，引用计数各自独立，析构时都会尝试 `delete p`。 正确做法：使用 `make_shared` 创建新的资源管理指针对象
```cpp
auto sp = std::make_shared<int>(42);
```
### 使用 `get()` 获取原始指针后手动 `delete`
使用 `get()` 获取原始指针后手动 `delete`，会导致智能指针再次析构时重复释放内存。
```cpp
std::unique_ptr<int> up(new int(10));
int* raw = up.get();
delete raw; // 错误：手动 delete，up 析构时还会再 delete 一次
```
`unique_ptr` 会在析构时自动释放资源，手动 `delete` 后再次释放是未定义行为。 正确做法：不要使用 `get()` 去手动管理资源，除非你知道自己在做什么并确保不会重复释放。
### 调用 `release()` 后忘记处理
使用 `release()` 放弃所有权后，如果忘记手动 `delete`，会导致资源泄漏。
```cpp
std::unique_ptr<int> up(new int(10));
int* raw = up.release(); // 放弃所有权
// 忘记 delete raw; —— 资源泄漏
```
`release()` 会解除智能指针对资源的管理，但不会释放资源，需要手动处理。这回到了 C 语言的内存处理 正确做法：仅在必要时使用 `release()`，并确保后续资源被正确释放。**而如果要重新创建一个资源管理指针，应该使用** `make_shared/unique` **函数**
### 多线程中不加保护地共享 `shared_ptr` 的拷贝
在多线程中不加锁地共享 `shared_ptr` 的拷贝可能导致引用计数不一致，从而引发崩溃。
```cpp
std::shared_ptr<int> sp = std::make_shared<int>(10);
std::thread t1([&]{
    for (int i = 0; i < 1000; ++i) {
        auto copy = sp;
    }
});
std::thread t2([&]{
    for (int i = 0; i < 1000; ++i) {
        auto copy = sp;
    }
});
t1.join();
t2.join();
```
虽然 `shared_ptr` 的引用计数是原子操作，多个线程同时拷贝 `shared_ptr` 是安全的。但如果多个线程中修改同一个 `shared_ptr`（比如赋值、reset），就需要加锁。 正确做法：
- 多线程中只读共享是安全的；
- 如果修改 `shared_ptr` 需要加锁或使用 `atomic_shared_ptr`（C++20 起）。
### 滥用 `unique_ptr` 的数组版本和非数组版本
使用 `unique_ptr<T>` 去管理数组资源，会导致错误的析构（调用 `delete` 而不是 `delete[]`）。
```cpp
std::unique_ptr<int> up(new int[10]); // 错误：析构时调用 delete 而非 delete[]
```
`unique_ptr<T>` 默认使用 `delete`，而数组应使用 `delete[]`。 正确使用智能指针管理数组应该这样写
```cpp
std::unique_ptr<int[]> up(new int[10]);
```
### 将栈上对象绑定到智能指针上
把栈上对象交给智能指针管理，会导致在析构时尝试 `delete` 栈内存，引发未定义行为。
```cpp
int x = 42;
std::shared_ptr<int> sp(&x); // 错误：x 是栈上变量，不能用 shared_ptr 管理
```
智能指针默认会在析构时 `delete` 所管理的指针，但栈变量不能 `delete`。 正确做法：除非你提供自定义 deleter，否则不要将栈变量交给智能指针。
### 使用 `shared_ptr` 管理非动态分配资源
和[[#将栈上对象绑定到智能指针上]] 类似，例如将 `malloc` 分配的内存交给 `shared_ptr`，但没有指定合适的 deleter。
```cpp
void* p = malloc(100);
std::shared_ptr<void> sp(p); // 错误：默认使用 delete，而应使用 free
```
正确做法：使用自定义 deleter
```cpp
std::shared_ptr<void> sp(malloc(100), free);
```
### 总结：智能指针的使用原则
| 危险行为                     | 是否智能指针会报错 | 建议               |
| ------------------------ | --------- | ---------------- |
| 多个 `shared_ptr` 管理同一原始指针 | ❌ 不会      | 使用 `make_shared` |
| 使用 `get()` 后手动 `delete`  | ❌ 不会      | 避免手动 delete      |
| 使用 `release()` 后忘记处理     | ❌ 不会      | 谨慎使用，确保释放        |
| 多线程中修改 `shared_ptr`      | ❌ 不会      | 加锁或使用原子操作        |
| 滥用数组版本                   | ❌ 不会      | 明确区分 `T[]` 和 `T` |
| 绑定栈变量                    | ❌ 不会      | 避免使用             |
| 管理非 new/delete 资源        | ❌ 不会      | 自定义 deleter      |
- **静态分析工具**：Clang-Tidy、Cppcheck
- **运行时检测工具**：AddressSanitizer、Valgrind
- **编码规范**：避免原始指针，优先使用 `make_shared` / `make_unique`
# 第 6 章 正则表达式
## 6.1 正则表达式简介
[[用法导向知识#正则表达式]]
## 6.2 std:: regex 及其相关
[[用法导向知识#使用正则表达式循环替换字符串中内容]]
# 第 7 章并行与并发
## 7.1 并行基础
## 7.2 互斥量与临界区
C++ 保证了所有栈对象在生命周期结束时会被销毁，所以 `lock_guard`，`unique_lock` 都会在生命周期结束后自动调用 `.unlock()`
## 7.3 期物
### Note：常用 API
#### `std::thread`
对象的构造函数的作用是接受函数指针和传入函数的参数列表，然后创建一个线程，让这个线程执行函数操作
```cpp
语法
std::thread t(func, arg1, arg2, arg3);
----------------------------------------
void func(int x, const std::string& msg) {
    std::cout << "x = " << x << ", msg = " << msg << "\n";
}
int main() {
    std::thread t(func, 42, "Hello"); // 创建线程并传入参数
    t.join(); // 等待线程完成
}
```
如果想要在一个 `thread` 中执行多个任务，可以使用函数对象，`bind` 或者 lambda 封装多个任务
```cpp
struct Task {
    void operator()() {
        func1();
        func2();
    }
    void func1() { std::cout << "Func1\n"; }
    void func2() { std::cout << "Func2\n"; }
};
void func1() { std::cout << "Func1\n"; }
void func2() { std::cout << "Func2\n"; }
int main() {
    Task task;
    std::thread t(task);
    std::thread t([]() {
        func1();
        func2();
    });
    std::thread t(std::bind([]{ foo1(); foo2();}));
    t.join();
}
```
每一个通过 thread 管理的线程都必须要 `join` 或者 `detach` 来结束，分别表述主线程必须等待子线程完成或者主线程不等待两种状态
#### `thread::join()`
`thread` 对象的 `join` 方法作用是**阻塞当前线程（通常是主线程），直到子线程完成其任务** 。换句话说，它只是让 **主线程等待子线程** `t` **中包含的任务结束**。
- 当程序启动时，操作系统会创建一个 **主线程（Primary Thread/Main Thread）**`main` 函数运行在**主线程** 中。当你创建其他线程时，它们会与主线程并发执行。
- 线程的执行从 `std::thread` 对象创建时就开始了。`join()` 只是用来确保主线程等待子线程完成。
- `join()` 会在子线程完成后释放线程对象的资源（如线程 ID、栈等）。如果 thread 析构之前未调用 `join()` 或 `detach()` 会导致崩溃
#### `thread::detach()`
`detach()` 的作用是**将线程从** `std::thread` **对象中分离** ，使其独立运行，不再受该对象管理。分离后，主线程无法再通过 `join()` 等待该线程完成，也无法直接控制它，只能等待他自动结束
#### `thread::get_id()`
获取线程唯一 id
#### atomic 原子对象
##### 原子变量
1. **无锁操作** ：在硬件支持下，原子操作不需要互斥锁。
2. **高效** ：相比锁，性能更高，尤其在高并发场景下。
3. 原子变量可以**不需要 Mutex** 就能确保线程安全。
4. 对原子变量（`atomic` 变量）的操作是是原子性（不可中断）的
5. 性能更高但只能处理单个值（int/bool等）。
6. **线程安全**：读写不会导致竞态条件；
```cpp
std::atomic<int> atomic_count(0);
int non_atomic_count = 0;
void atomic_increment() {
    for (int i = 0; i < 100000; ++i) {
        ++atomic_count;
    }
}
void non_atomic_increment() {
    for (int i = 0; i < 100000; ++i) {
        ++non_atomic_count;
    }
}
int main() {
    std::thread t1(atomic_increment);
    std::thread t2(atomic_increment);
    std::thread t3(non_atomic_increment);
    std::thread t4(non_atomic_increment);
    t1.join();
    t2.join();
    t3.join();
    t4.join();
    std::cout << "atomic_count = " << atomic_count << std::endl;  // 精确为 200000
    std::cout << "non_atomic_count = " << non_atomic_count << std::endl; // 可能随机更高、更低
}
```
^7wqxo5 普通的变量一般创建在堆（如 vector，array 这些容器的数据）或者程序的数据段上（基本类型数据 int，double），参考 [[C++ Runoob Tutoral#]]，这些部分的数据是线程之间共享的，**只有线程栈中函数，线程信息是每个线程独有的**，改变值需要进入三个步骤：读取，计算，写入
```assembly
mov eax, [non_atomic_count]  # 读取当前值
add eax, 1                     # 加 1
mov [non_atomic_count], eax    # 写回新值
线程A读取（100） → 线程B读取（100）→
线程A计算（101）→ 线程B计算（101）→
线程A写回（101）→ 线程B写回（101）
```
线程 B 应该在 A 写会后读取，但 non\_atomic\_count 不是原子变量无法保证这一点 `atomic_count` 是一个**原子变量**，任何对他的操作只能一步一步来不可中断，就可以，所以 `atomic_count==200000` 如果将代码改为：
```cpp
std::thread t3(non_atomic_increment);
t3.join();
std::thread t4(non_atomic_increment);
t4.join();
```
就不会出现少加现象，但操作并不是交替进行的
##### 原子操作
`atomic::fetch_add(n)` ：
- 对原子变量执行原子加法操作，并返回原值。
- 是线程安全的操作，不会导致数据竞争。
`atomic::memory_order_relaxed`：
- 是一种内存序（Memory Order）选项。
- 表示不关心内存顺序一致性，只保证操作本身的原子性。
- 性能最高，但语义最弱，适用于不需要同步其他操作的场景。

| 方法               | 作用        |
| ---------------- | --------- |
| `store(val)`     | 原子写入      |
| `load()`         | 原子读取      |
| `fetch_add(val)` | 原子加法，返回旧值 |
| `exchange(val)`  | 原子交换，返回旧值 |
#### 资源锁定和线程执行
##### 锁的使用
可以参考[[C++ Runoob Tutoral#互斥量和互斥锁|互斥量和互斥锁]] ，[[C++ Runoob Tutoral#线程管理|线程管理]] 这里补充：
- 当创建 `unique_lock<std::mutex>` 对象时，它会自动调用 `mtx.lock()`，获取互斥锁。
- 锁的生命周期与作用域一致，离开作用域析构函数会自动调用 `mtx.unlock()`，释放锁，也可以手动调用 `.unlock()` 解锁
- **锁的粒度** ：`std::unique_lock` 并不是直接锁定“当前代码作用域中所有资源”，而是锁定其绑定的互斥锁（`std::mutex`），从而间接保护与该锁关联的共享资源。
##### 条件变量
参考[[C++ Runoob Tutoral#条件变量|条件变量]] 这里补充：
- 条件变量 `cv` 不绑定任何线程，它只是一个“广播站”。
- consumer 函数中提前解锁操作仅仅是为了减少锁在 c 线程中持有时间，更快地进行资源交替。而 producer 中没有进行的 `lock.unlock()` 其实会在一遍 for 循环结束 `lock` 生命周期结束时执行。
- 一般（***不强制***）在**互斥锁解锁后**使用 notify 通知线程继续
```cpp
cv.wait(unique_lock<std::mutex>& lock, Predicate pred);
cv.wait(lock, []{ return !data_queue.empty() || done; });
// 只要队列为空并且还没完成生产，就一直等下去。
```
1. **等待条件成立** ：
   
   - `cv.wait(...)` 会**阻塞当前线程** ，直到被其他线程调用 `notify_one()` 或 `notify_all()`。
   
   - 在等待期间，**自动释放锁（unlock）** ，允许其他线程修改共享资源。
   
   - 当被唤醒后，**重新获得锁（lock）** ，然后检查谓词（predicate）是否为真。
2. **谓词的作用（predicate）** ：
   
   - 是一个返回布尔值的可调用对象（如 lambda 表达式）。
   
   - 目的是防止虚假唤醒（spurious wakeups）——即线程被唤醒但条件仍未满足的情况。
##### 经典消费者生产者模型
```cpp
std::queue<int> data_queue;
std::mutex mtx;
std::condition_variable cv;
bool done = false;
// 生产者
void producer() {
    for (int i = 0; i < 5; ++i) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        std::unique_lock<std::mutex> lock(mtx);
        data_queue.push(i);
        std::cout << "Produced: " << i << "\n";
        cv.notify_one(); // 通知消费者可以消费
    }
    done = true;
    cv.notify_all(); // 唤醒所有消费者，告知生产结束
}
// 消费者
void consumer() {
    while (true) {
        std::unique_lock<std::mutex> lock(mtx);
        cv.wait(lock, []{ return !data_queue.empty() || done; });
        if (done && data_queue.empty()) break;
        int value = data_queue.front();
        data_queue.pop();
        lock.unlock(); // 提前解锁，减少锁持有时间
        std::cout << "Consumed: " << value << "\n";
    }
}
int main() {
    std::thread p(producer);
    std::thread c(consumer);
    p.join();
    c.join();
    std::cout << "All tasks completed.\n";
}
```
- 前置知识  
	- `std::condition_variable` 需要与 `std::mutex` 配合使用，通过 `wait` 和 `notify` 实现线程间通信。
	- 消费者线程在 `cv.wait(lock, predicate)` 处阻塞，等待条件满足（队列非空或生产结束）。
	- 生产者通过 `cv.notify_one`（唤醒 **一个** 等待的线程（随机选择）） 或 `cv.notify_all` 唤醒**等待**的消费者线程。
	- 通常在资源解锁之前要使用 notify 通知其他线程等待，然后 unlock 解锁资源
- 互斥锁锁定的是什么资源？
  锁定的是在 `unique_lock` 构造函数中传入的互斥量：`mtx`，而这个互斥量是用来保护共享资源的，比如这里的 `data_queue`
- 为什么 producer 和 consumer 中每次循环都创建一个 `unique_lock` 对象？
  每次进入循环时都会创建一个新的 RAII 锁对象，它绑定到同一个全局互斥量（`mutex mtx`）上
### Note：内存序
- 内存序定义：
	- 控制内存操作的顺序保证，定义多个线程对共享数据的**可见性规则**，避免编译器/CPU 重排序导致问题。
	- 解决编译器和 CPU 的重排序问题
	- 多线程环境下保证正确的执行顺序
- 为什么需要内存序：
   问题场景：
```cpp
// 线程 1
data = 42;           // 1. 写入数据
ready.store(true);   // 2. 设置标志
// 线程 2
while(!ready.load()) { }  // 等待标志
std::cout << data;        // 期望输出 42
// 问题：编译器/CPU 可能重排序，导致线程 1 先执行 2 再执行 1
// 结果：线程 2 可能读到 0 而不是 42
```
**六种内存序**（`std::memory_order`）

| 内存顺序 (Memory Order) | 核心特性与重排序规则 (同步机制) | 典型使用场景 | 性能与附加说明 |
| :--- | :--- | :--- | :--- |
| **`memory_order_relaxed`** | • 只保证原子性，不保证顺序<br>• 无顺序控制 | • 最小粒度同步<br>• 计数器、统计信息 | • **最宽松**<br>• **性能最好** |
| **`memory_order_consume`** | • 依赖的数据不会被重排序到前面 | • 依赖数据的读取操作 | • **较少使用** |
| **`memory_order_acquire`** | • **获取操作**（用于读取端）<br>• 当前操作**之后**的读写不会被重排序到前面<br>• 读取同步屏障 (Barrier) | • 读取保护出临界区的变量修改 | • 常与 `release` 配对使用 |
| **`memory_order_release`** | • **释放操作**（用于写入端）<br>• 当前操作**之前**的读写不会被重排序到后面<br>• 写入同步屏障 (Barrier) | • 写入用于保护线程之间的共享状态 | • 常与 `acquire` 配对使用 |
| **`memory_order_acq_rel`** | • **获取-释放操作** (acquire + release)<br>• 读取与写入屏障两者结合 | • 读-改-写 (Read-Modify-Write) 操作<br>• 常用于锁或交换变量 | • 同时具备 acquire 和 release 的语义 |
| **`memory_order_seq_cst`** | • **顺序一致性**（强一致性）<br>• 最强的保证<br>• 保证严苛的内存访问顺序<br>• 所有线程看到相同的操作顺序 | • 默认的强一致性需求场景 | • **默认选项**<br>• **性能开销最大** |

典型使用模式：
- 释放 - 获取同步（Release-Acquire）：
```cpp
// 线程 1 - 写入者
data = 42;  // 准备数据
ready.store(true, std::memory_order_release);  // 释放操作

// 线程 2 - 读取者
while(!ready.load(std::memory_order_acquire)) {  // 获取操作
  // 等待
}
std::cout << data;  // 保证读到 42

```
- 自旋锁实现：
```cpp
class SpinLock {
  std::atomic_flag flag = ATOMIC_FLAG_INIT;
public:
  void lock() {
	  // acquire: 获取锁后，临界区操作不会被重排序到前面
	  while(flag.test_and_set(std::memory_order_acquire)) {
		  std::this_thread::yield();
	  }
  }
  void unlock() {
	  // release: 释放锁前，临界区操作已经完成
	  flag.clear(std::memory_order_release);
  }
};
```
### Note：谓词
**谓词**（Predicate）是指一个 **返回** `bool` **值的可调用对象**，常见于标准库算法（如 `std::find_if`）或同步原语（如 `condition_variable::wait`）。它是一个广义概念，包含以下形式（任何能通过 `()` 调用的东西，包括：函数指针，**成员函数指针**，lambda 和仿函数） 所以，`conditional_variable` 的谓词部分只能填：
```cpp
void foo() {}
void (*func_ptr)() = foo; // 函数指针
void (P_and_C::*member_func_ptr)() = &P_and_C::producer; // 调用某个类中成员函数
auto lambda = [] { /*...*/ };
struct Functor { void operator()() { /*...*/ } };
Functor f;
cv.wait(lock, foo/(*func_ptr)()/&P_and_C::producer/lambda/f)
```
### Note：并行与并发基本概念
#### 1\. 线程（Thread）
- 定义
  - 线程是操作系统调度的最小单位。
  - 每个线程可以独立执行任务，但共享进程的资源（如内存、文件句柄等）。
  - 在多核 CPU 上，多个线程可以同时运行；在单核 CPU 上，通过时间片轮转实现“伪并行”。
- 特点：
  - **轻量级** ：线程比进程更轻量，切换开销小。
  - **资源共享** ：同一进程中线程共享地址空间，可以直接访问全局变量、堆内存等。
  - **独立性差** ：如果一个线程崩溃，可能会导致整个进程崩溃。
  - 并发性比进程更容易实现；
  - 多线程共享数据必须注意资源竞争、并发保护。
#### 2\. 进程（Process）
- **概念**：进程是一个程序的执行实例，包含独立的地址空间（内存空间），有自己的堆栈、堆、代码段等。
- **特点**：
  - 进程是操作系统分配资源的基本单位。
  - 每个进程拥有独立的地址空间，彼此隔离。
  - 启动/销毁的代价较高；
  - 不同进程的数据交换需要 **进程间通信（IPC）**。
  - 类比：像一个独立的工厂，内部资源自成体系。
#### 3\. 并发（Concurrency） vs 并行（Parallelism）
| 类别   | 并发（Concurrency）                      | 并行（Parallelism）     |
| ---- | ------------------------------------ | ------------------- |
| 意义   | 同时或交替处理多个任务（“看起来在同时做”）               | 在多处理器上真正“同时执行”多个任务  |
| 实现方式 | 单核CPU上任务的时间片切换                       | 多核心 CPU 上多个任务真实并行执行 |
| 应用场景 | 异步处理（如UI、文件加载）、Guard Against Overlap | 高性能计算、数据计算、多任务流水线处理 |
| 类比   | 多人看同一盘棋轮流落子                          | 多盘棋一只手套两只手分头下       |
**C++并发模型以并发为主（抽象为多个任务），并行则是实现效果的一个可能方式（由编译器/平台决定）**
#### 4\. 竞态条件
**竞态条件**是指多个线程或进程在访问共享资源时，由于执行顺序的不确定性，导致程序的行为出现不可预测的结果。在并发编程中，当多个线程同时访问共享数据且至少有一个线程修改数据时，如果没有适当的同步机制，就可能出现竞态条件。 会产生竞态条件的代码片段称为*临界区代码片段*，多线程下存在竞态条件->可重入代码，反之不可重入 [[Modern C++#^7wqxo5|原子变量]]中 `non_atomic_count` 的累加操作就是竞态条件
# 第 8 章 文件系统
文件系统库提供了文件系统、路径、常规文件、目录等等相关组件进行操作的相关功能。和正则表达式库类似，他也是最先由 boost 发起，并最终被合并为 C++ 标准的众多库之一。
## 8.1 文档与链接
# 第 9 章 其他杂项
## 9.1 新类型
### `long long int`
`long long int` 并不是 C++11 最先引入的，其实早在 C99， `long long int` 就已经被纳入 C 标准中，所以大部分的编译器早已支持。 C++11 的工作则是正式把它纳入标准库， 规定了一个 `long long int` 类型至少具备 64 位的比特数。
## 9.2 noexcept 的修饰和操作
C++11 将异常的声明简化为以下两种情况：
1. 函数可能抛出任何异常
2. 函数不能抛出任何异常 使用 `noexcept` 对这两种行为进行限制，例如：
```cpp
void may_throw(); // 可能抛出异常
void no_throw() noexcept; // 不可能抛出异常
```
- 使用 `noexcept` 修饰过的函数如果抛出异常，**编译器**会使用 `std::terminate()` 来立即终止程序运行。
- `noexcept` 还能够做操作符，用于操作一个表达式，当表达式无异常时，返回 `true`，否则返回 `false`。
- noexcept 还能够做操作符，用于操作一个表达式，当表达式无异常时，返回 true，否则返回 false。
## 9.3 字面量
### 原始字符串字面量
传统 C++ 里面要编写一个充满特殊字符的字符串其实是非常痛苦的一件事情，比如一个包含 HTML 本体的字符串需要添加大量的转义符，例如一个Windows 上的文件路径经常会：`C:\\File\\To\\Path`。 现在已经有 R 原生字符串支持 `string str = R"(C:\file\code\folder)"`
### 自定义字符串字面量
可以通过在原始字面量后面加上 `_suffix`（这个自定义部分名称）就可以表示这个字面量是一个字符串，并且会这个字符串的实际含义是根据通过重载函数内部函数体定义。对不同的支持类型使用不同的函数参数类型来重载就能够得到对应的自定义字面量结果 C++ 规定了自定义字面量的参数类型，常见如下：

| **字面量类型**                                                         | **函数参数类型**              | **示例**           |
| ----------------------------------------------------------------- | ----------------------- | ---------------- |
| 字符串字面量                                                            | `(const char*, size_t)` | `"hello"_s`      |
| 整数字面量                                                             | `unsigned long long`    | `42_km`          |
| 浮点数字面量                                                            | `long double`           | `3.14_rad`       |
| 字符字面量                                                             | `char`                  | `'x'_to_upper`   |
| 原始字符串（C++14）                                                      | `(const char*, size_t)` | `R"(raw)"_parse` |
| 字面量通过使用 `ReturnType operator"" _suffix(Parameters)` 重载 `""` 操作符实现 |                         |                  |
- 后缀名必须以下划线 `_` 开头（避免与未来标准库字面量冲突）
- 当编译器遇到字面量后接用户定义的后缀（如 `"abc"_wow` 或 `123_km`），会自动调用对应的重载函数，根据字面量类型传入预定义的参数类型，并将返回值作为结果。
- 不能将字符串字面量的参数改为 `std::string`，必须使用 `(const char*, size_t)` 避免不必要的 `std::string` 构造，允许直接处理原始字符数组。
- 如果使用字符串字面量或者原始字符串参数列表，参数列表中：
  
  - `str` 是后缀前的字符串字面量
  
  - `len` 是字符串长度（不包括终止符 `\0`）
- **自定义字面量 = 固定参数类型 + 用户定义后缀 + 自由返回值**
#### 更好的单位可读性
```cpp
struct Distance {
    double dis;
};
Distance operator"" _km(long double dis) {
    string result;
    return Distance{ static_cast<double>(dis * 1000) };
}
auto d = 2.5_km;
```
#### 实现快捷正则对象创建
```cpp
regex operator"" _re(const char* restr, size_t len) {
    return regex(restr, len);
}
auto re = R"(\d+)"_re;
```
![[Pasted image 20250608124728.png]]
#### 对象哈希值快速比较
```cpp
constexpr size_t operator"" _str_hash(const char* str, size_t len) {
    size_t result = 14695981039346656037ULL;
    for (size_t i = 0;i < len;i++) {
        result ^= hash<char>{}(str[i]);
    }
    return result;
}
int main() {
    auto str1 = "hello"_str_hash;
    auto str2 = "world"_str_hash;
    return 0;
}
```
这个例子中是一个简单的 **编译期字符串哈希** 实现，用于：
- 快速比较字符串常量
- 避免**运行时**重复哈希计算
- 作为 switch-case 的替代方案（某些技巧）
- 资源 ID 映射、消息类型标识等
#### 翻译文本映射
```cpp
class I18N {
private:
    enum class Language { ENGLISH, CHINESE };
    Language current_lang;
    std::unordered_map<std::string, std::unordered_map<Language, std::string>> dict;
    bool is_load = false;
    void load_if_not_loaded() {
        if (!loaded) {
            load_translations("lang_en.txt", "lang_zh.txt");
            loaded = true;
        }
    }
    I18N() : current_lang(Language::ENGLISH) { load_if_not_loaded(); }
public:
    static I18N& get_instance() {
        static I18N instance;
        return instance;
    }
    void set_language(Language lang) {
        current_lang = lang;
    }
    void load_translations(const std::string& en_path, const std::string& zh_path) {
        auto load = [this](const std::string& path, Language lang) {
            std::ifstream fin(path);
            if (!fin) return;
            std::string line;
            while (std::getline(fin, line)) {
                std::istringstream sin(line);
                std::string key, value;
                if (std::getline(sin, key, '=') && std::getline(sin, value)) {
                    dict[key][lang] = value;
                }
            }
        };
        load(en_path, Language::ENGLISH);
        load(zh_path, Language::CHINESE);
    }
    std::string translate(const std::string& key) {
        if (dict.count(key) && dict[key].count(current_lang)) {
            return dict[key][current_lang];
        }
        return key; // 回退为原 key
    }
};
std::string operator"" _i18n(const char* key, size_t) {
    return I18N::get_instance().translate(key);
}
int main() {
    I18N::get_instance().load_translations("lang_en.txt", "lang_zh.txt");
    I18N::get_instance().set_language(Language::CHINESE);
    std::cout << "login_button"_i18n << std::endl;
    std::cout << "save_file"_i18n << std::endl;
    return 0;
}
```
使用经典的单例模式实现 注意其中 `(getline(sin, key, '=') && getline(sin, value)` 这段代码通过控制流指针来读取**文本文件中非结构化键值对数据** 假设一行是：
```text
hello=你好
```
执行 `getline(sin, key, '=')`
- 将 `"hello"` 存入 `key`。
- 流指针停在 `=` 后面的位置。 执行 `getline(sin, value)`
- 调用 `getline` 默认按换行符（`\n`）为分隔符。
- 从流指针当前位置开始（即 `=` 后面），读整个剩余部分（这里就是 `"你好"`）存入 `value`。
- 第二个 getline 会使用 `\n` 作为终止符，不能使用 `=`
> 这样的写法用于代码中文本或者设计稿中文本到对应语言的转换，设计师的“登录”设置为 `login_button`，但在中文界面上需要显示为"登录"，英文界面上需要显示“Login”，这样的字符串映射风格保证了不同人的变量使用风格，又实现了功能
### Note：类型操作符
C++ STL 中在 `<type_traits>` 中定义的类型操作特性（Type Traits），可以用于元编程和模板推导。

| Trait                                   | 定义                                                           | 功能                                                     | 示例                                                        | 用途                        |
| --------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ | --------------------------------------------------------- | ------------------------- |
| `std::decay<T>`                         | `T` 在函数传参时经过的自动类型转换（去数组、函数类型转指针、引用变值类型 + strip CV qualifier） | 去除引用、const volatile、数组退化<br>（用于函数参数类型一致）               | `std::decay<const int&>::type` → `int`                    | 编写通用模板逻辑                  |
| `std::remove_const<T>`                  | 移除 `const` 属性，保留 `volatile`                                  | `const int` → `int`                                    | `std::remove_const<const int>::type` → `int`              | 用户类型操作或实现 non-const trait |
| `std::remove_volatile<T>`               | 移除 `volatile` 属性                                             | `volatile int` → `int`                                 | `std::remove_volatile<volatile int>::type` → `int`        | 同上                        |
| `std::remove_cv<T>`                     | 同时移除 `const` 和 `volatile`                                    | `const volatile int` → `int`                           | `std::remove_cv<const volatile int>::type` → `int`        | 获取裸类型                     |
| `std::remove_reference<T>`              | 去除引用（`T&`, `T&&` → `T`）                                      | 提取原始类型（非引用）                                            | `std::remove_reference<int&>::type` → `int`               | 元编程泛用                     |
| `std::remove_pointer<T>`                | 去除指针                                                         | `T* → T`，`T (*fn)() → T`\*                             | `std::remove_pointer<int*>::type` → `int`                 | 函数指针简化                    |
| `std::remove_extent<T>`                 | 去除数组维度（一维有效）                                                 | `int[10] → int`<br>`int[10][20] → int[20]`             | `std::remove_extent<int[10]>::type` → `int`               | 数组处理                      |
| `_t` 后缀                                 | C++14 后的别名写法                                                 | 代替 `::type`                                            | `std::remove_const_t<const int>` → `int`                  | 简洁语法                      |
| `std::remove_cvref<T>`                  | C++20 加入，等于 `decay` 裁剪版                                      | 去除 CV + reference，但不去数组、函数                             | `const int&& → int`<br>`const char(&)[5] → const char[5]` | 实现 std::expected 等        |
| `std::is_same_v<T, U>`                  | 类型比较                                                         | 返回 `true` / `false` 表示是否相同                             | 在模板中做 [[#SFINAE 地狱出现\|SFINAE ]] 或条件分支                     |                           |
| `std::is_integral<T>`                   | 判断是否是整型                                                      | `int, bool, enum → true`<br>`double → false`           |                                                           |                           |
| `std::enable_if`                        | 类型选择器                                                        | 在 SFINAE 和条件模板中广泛使用                                    | 防止某些模板被匹配                                                 |                           |
| `std::forward_as_tuple, std::declval` 等 | 配合类型 trait 使用                                                | 实现 forward, perfect forwarding, implicit conversions 等 |                                                           |                           |
## 9.4 内存对齐
参考视频：[到底为什么要内存对齐？哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1aV4y1y7Sd/?spm_id_from=333.337.search-card.all.click&vd_source=876be08bc9c030f4a9ea1fb97e0d0342)
### 对齐体积计算
1. **第一个成员**：放在与结构体偏移量为 0 的地址处。
2. **其他成员**：每个成员的偏移量必须是其**对齐数**的整数倍。
    - **对齐数** = `min(成员自身大小, 编译器默认对齐数)`
    - 编译器默认对齐数：VS 中默认为 **8**；Linux/GCC 默认为 **4**（或可由 `#pragma pack` 修改）。
    - 注意：成员自身大小为 1、2、4、8 等基础类型大小。_
3. **结构体总大小**：必须是 **所有成员对齐数中的最大值** 的整数倍（即最大对齐数的整数倍）。
C/C++中，结构体中默认所有数据放在一整块连续的内存中，理论和实际有冲突
![Pasted image 20241021210727.png](Pasted%20image%2020241021210727.png)
通过互查看汇编源码可以得到其内存布局
![Pasted image 20241021210839.png](Pasted%20image%2020241021210839.png)

### 为什么需要内存对齐
- 寄存器只能从内存地址是 4 的倍数的位置开始读取数据（与处理器架构和位数也有关系）
![Pasted image 20241021211403.png](Pasted%20image%2020241021211403.png)
- 对齐的对齐数可以手动指定
- 从硬件层面分析
![Pasted image 20241021212144.png](Pasted%20image%2020241021212144.png)
一个主板上插入的内存条中有多个 chip，这些 chip 共同组成一个连续的存储空间
主板上多个内存芯片（Chip）共同组成连续存储空间，**CPU 以固定字长（如 4 字节/8 字节）为粒度访问内存**
- 若数据未对齐，可能跨两个读取周期（甚至触发硬件异常）。
- **对齐后**：一个寄存器周期就能完整读取该数据。
### 手动控制内存对齐
#### 关键字控制
C++ 11 引入了两个新的关键字 alignof 和 alignas 来支持对内存对齐进行控制。 alignof 关键字能够获得一个与平台相关的 `std:: size_t` 类型的值，用于查询该平台的对齐方式。
```cpp
#include <iostream>
struct Storage {
    char      a;
    int       b;
    double    c;
    long long d;
};
struct alignas(std::max_align_t) AlignasStorage {
    char      a;
    int       b;
    double    c;
    long long d;
};
int main() {
    std::cout << alignof(Storage) << std::endl;
    std::cout << alignof(AlignasStorage) << std::endl;
    return 0;
}
```
其中 `std::max_align_t` 要求每个标量类型的对齐方式严格一样，因此它几乎是最大标量没有差异，进而大部分平台上得到的结果为 `long double`，因此我们这里得到的 `AlignasStorage` 的对齐要求是 8 或 16。
alignas 指定值必须是 2 的整数幂且**不能小于默认对齐数**（否则可能被忽略或扩展）。
#### 预编译头控制
```cpp
#pragma pack(1)   // 设置默认对齐数为 1 → 取消对齐（紧凑存储）
struct B {
    char c;
    int i;
    short s;
};
#pragma pack()    // 恢复默认对齐数
sizeof(B);        // = 7
```
#### 位域结构体控制
```cpp
struct BitField {
    unsigned int a : 1;   // 占 1 位
    unsigned int b : 3;   // 占 3 位
    unsigned int   : 2;   // 显式填充 2 位（匿名位域）
};
```
#### 编译器控制
```cpp
struct __attribute__((packed)) C { // GCC/Clang Only
    char c;
    int i;
    short s;
};
sizeof(C); // = 7
```
### 特殊情况
C 语言中空结构体大小为 0（GCC 扩展允许），但 C++ 标准规定必须至少为 1，保证每个对象有唯一地址
继承情况下:
- 单继承时，派生类的对齐数受基类及新增成员共同影响。
- 虚继承/虚函数表指针（vptr）也会参与对齐（通常占用一个指针大小，8 字节）。
嵌套结构体的对齐：
- 内层结构体的**对齐数**等于其内部最大成员的对齐数。
- 外层结构体将内层结构体视为一个成员，其对齐数即内部最大对齐数。
# 第 10 章展望：C++20 简介
## 概念与约束
概念（Concepts）是对 C++ 模板编程的进一步增强扩展。简单来说，概念是一种编译期的特性，它能够让编译器在编译期时对模板参数进行判断，从而大幅度增强我们在 C++ 中模板编程的体验。 使用模板进行编程时候我们经常会遇到各种令人发指的错误，这是因到目前为止我们始终不能够对模板参数进行检查与限制。举例而言，下面简单的两行代码会造成大量的几乎不可读的编译错误：
```cpp
#include <list>
#include <algorithm>
int main() {
    std::list<int> l = {1, 2, 3};
    std::sort(l.begin(), l.end());
    // 应该使用l.sort();
    return 0;
}
```
本质上是因 list 容器不支持随机访问迭代器，sort 需要访问随机访问迭代器才能排序，**C++ 是静态类型语言，模板推导只能在编译时完成**，且 `std::sort` 是一个高度泛型的，使用到了大量底层的模板函数模板（即编译期间才开始校验可用性）。
# \------------分割-----------
C++ 20 stl 书籍内容
# 第 1 章 C++ 20 的新特性
## 格式化文本
`std::print` 函数在 C++23 中已将完美移植 python 的语法到 C++中，mingw 在 15 版本后才完整支持，14.2 中 `#include<print>` 直接执行下面代码会出现报错。
```cpp
std::string name {"C++ 23"};
print("hello, {}", name);
```
## constexpr——使用编译时 vector 和字符串
已将内容新增至 [[#constexpr]] 中
## 安全地比较不同类型的整数
### 问题背景
```cpp
int main(){
    int x{-3};
    unsigned y{7};
    // std::cout << static_cast<unsigned>(x) << std::endl;
    if(x < y)
        std::cout << true;
    else
        std::cout << false;
}
```
代码运行得到 false，这显然不符合常理，但标准规定（[C++23 §7.6.9/2]）：
> [!note] 若操作数的算术类型不同，则所有小于 `int` 的整数先被提升到 `int`； **若两个类型仍不同（一个有符号、一个无符号，且范围不能互相覆盖）**，则拥有符号的那个值会先转换成 **无符号** 类型后再比较。
`-3` 被转换为 `unsigned int` → 按照二进制无符号规则，其值为：
```cpp
(unsigned)(-3) == UINT_MAX - 2   // 在 32 位系统下大约是 4 294 967 293
```
C++20 标准在 `<utility>` 头文件中包含了一组整数安全的比较函数
```cpp
cmp_equal(x, y)         // x == y is false
cmp_not_equal(x, y)     // x != y is true
cmp_less(x, y)             // x < y is true
cmp_less_equal(x, y)     // x <= y is true
cmp_greater(x, y)         // x > y is false
cmp_greater_equal(x, y) // x >= y is false
```
实现原理：
```cpp
template< class T, class U >
constexpr bool cmp_less( T t, U u ) noexcept {
    using UT = make_unsigned_t<T>;
    using UU = make_unsigned_t<U>;
    if constexpr (is_signed_v<T> == is_signed_v<U>)
        // 1. 同为 *有符号* 或 同为 *无符号*          —— 直接比较即可
        return t < u;
    else if constexpr (is_signed_v<T>)
        // 2. *T 有符号，U 无符号*                  —— 只有这里是本行判断的覆盖范围
        return t < 0 ? true : UT(t) < u;
    else
        // 3. *T 无符号，U 有符号*                  —— 上一行没命中，这里兜底
        return u < 0 ? false : t < UU(u);
}
```
## 三向比较运算符 <=>——进行三种比较
### 定义和特性
“三向比较”就是“一次运算→**一次给出三种结果**”，本质是一个 **返回序关系对象** 的运算符，让后续所有 `< > <= >= == !=` 的重复劳动全部消失。 三项比较运算符：
- 本质上：帮助程序员省去写类之间比较操作中需要用到的**六个比较符号在对应类中重载函数**，减少工作量
- 返回类型上：

| 返回类型                   | 值（前面加上 `std::对应返回类型::`）      | 算法含义                                                                             |
| ---------------------- | ---------------------------- | -------------------------------------------------------------------------------- |
| std::strong\_ordering  | `less` / `equal` / `greater` | **等价即互换**：`a==b ⇒ swap(a,b)` 语义不变，要求 **严格全序**。例如 `int, std::string`。             |
| std::weak\_ordering    | 同上，`equal` → `equivalent`    | **等价可能不互换**：`a==b` 时调换顺序可能得到不同结果。例子：“忽略大小写的文本比较” → 等价≠可互换。                       |
| std::partial\_ordering | 再加一个 `unordered`             | **存在“不可比较”值**（如 NaN）。如果你坚持用 `<=>` 比较两个 NaN，会得到 `unordered`；此时任何比较结果都是未定义或 false。 |
### 实现原理
#### 对象可排序（比较）化
将类中**所有 public 并且可比较的成员**分别实现默认的六项比较，如果这些成员的类型定义中有内置的比较方法，则调用它们。
```cpp
struct IPv4 {
    std::uint16_t a,b,c,d;
    auto operator<=>(const IPv4&) const = default;
};
std::set<IPv4> white_list;   // 直接塞
```
`uint16_t` 对象支持比较，所以 `operator<=>(const IPv4&) const` 调用它的比较逻辑，为 IPv4 类生成六类比较重载函数。
#### 对象实际的比较逻辑
```cpp
struct Version { int major,minor,patch; };
auto operator<=>(const Version& l, const Version& r) {
    return std::tie(l.major, l.minor, l.patch) <=>
           std::tie(r.major, r.minor, r.patch);
}
// 或者设定对象比较逻辑
struct Person {
    std::string name;
    unsigned age;
    auto operator<=>(const Person& rhs) const {
        return std::tie(name, age) <=> std::tie(rhs.name, rhs.age);
    }
};
std::vector<Person> v = …;
std::ranges::sort(v);   // 用光默认比较
// 或者完全自定义比较返回结果
struct Ratio {
    long num, den;
    auto operator<=>(const Ratio& r) const {
        using L = long;
        // 防止溢出, 用 128bit 作为中介
        __int128 c = __int128(num) * r.den - __int128(r.num) * den;
        if (c < 0)      return std::partial_ordering::less;
        if (c > 0)      return std::partial_ordering::greater;
        return std::partial_ordering::equivalent;
    }
};
```
比较的顺序是**变量定义的顺序**，如果类中有**不可比较的成员变量**（• **没有自己的** `<=>` 或者 `ambiguous / deleted` ）如果定义 `constexpr/auto operator<=>(…) = default` **直接编译报错** (`deleted function`)。）
```cpp
struct Boom {
    std::mutex mtx;  // 天生没有比较
    int id;
    auto operator<=>(const Boom&) const = default; // ❌ 编译器报错
private:
    double tmp;      // private 也无济于事，还是报错
};
```
### 注意事项
1. **对指针 & 浮点 用** float 型请 `std::partial_ordering`，对付 NaN：`std::partial_ordering cmp = f1 <=> f2;`
2. **返回类型要匹配强度** 如果你逻辑等价≠值等价，别返回 `strong_ordering`，否则会违反 **可替代律**。
3. **自动生成只对公开成员有效，私有成员不会推导**。
4. **基类需要链式比较**
struct LabelPoint : Point { std::string label; }; auto operator<=>(const LabelPoint& l, const LabelPoint& r) { // 1. 先把基类部分拿出来，用 Point 的<=>比较 if (auto cmp = static\_cast<const Point&>(l) <=> static\_cast<const Point&>(r); cmp != 0) return cmp; // 2. 只要不相等就提前返回 return l.label <=> r.label; // 3. 基类相等了，再比较派生成员 } // 等价旧写法 std::tie(l.x, l.y) < std::tie(r.x, r.y) || std::tie(l.x, l.y) == std::tie(r.x, r.y) && l.label < r.label; \`\`\` - `LabelPoint` **继承**了 `Point`，而 `Point` 里有 `x`、`y`。 - **继承 ≠ 成员**，默认 `operator<=> = default` **绝不会把基类算进去**，只会比 **当前类里的数据成员**（label）。 - 于是 `LabelPoint` 必须手动把 **基类部分** 先取出来再比： 5. **老代码仍需** `operator==` C++20 之前已写 `operator==` 会继续生效，没写则必须给 `default` 否则 `<=>` 不会包办 `==`。 6. **零开销不能直接序列化成 JSON** ordering 对象本身仅供比较，若想输出 “< 0”, “> 0” 之类需再 `std::format("{}", static_cast<int>(ord))`。 7. 要为三向操作符返回类型包含 `<compare>` 头文件 8. `<=>` 的优先级高于其他比较运算符，因此它总是先求值。所有比较运算符都从左到右计算。
## `<version>` 头文件——查找特性测试宏
#未完成 看不懂，也不常用，先跳过
## 概念 (concept) 和约束 (constraint)——创建更安全的模板
### 两个特性出现的原因
#### SFINAE 地狱出现
SFINAE(**Substitution Failure Is Not An Error**) 是一种“失败即忽略”的机制。当你调用模板函数时，如果模板参数替换过程中某段代码无法通过，就“假装看不见这个模板” —— 并不是一个真正的错误。 因要用 SFINAE 实现“某个模板只能用于 int 类型”的简单要求，代码复杂到像写汇编一样，比如这行：
```cpp
template<typename T, std::enable_if_t<std::is_integral_v<T>, int> = 0>
void do_something(T t);
```
写个模板函数，还要搞出 `std::enable_if`、`std::is_integral`，再加上一大堆 `typename` 和默认参数，逻辑绕得很，而且编译器一旦报错，错误信息常常非常晦涩，像是：
```error
error: no matching function for call to ‘do_something<std::__basic_string<char> >::f(...)’
```
而不是清晰地说：“这个函数只支持整数。”，这种写法虽然可以解决问题，但它太绕、太原始，于是人们管这种技术叫 “SFINAE 地狱”。
#### 模板报错内容晦涩
最初的模板使用没有任何类型限制，
```cpp
template<typename T>
void print(T x) {
    std::cout << x.value();
}
```
模板在在未展开的**编辑代码阶段**不会有错误提示，有点类似于 ![[Pasted image 20250804144323.png]] list 模板额没有实现迭代器检查概念，这就导致了 sort 函数要求容器对象必须要实现迭代器，list 由于是模板类，在没有展开时无法判断他是否实现了迭代器，所以编译器不报错，但无法通过编译。**编译器错误长达几百行** 有了概念和约束后，**模板参数推导中，如果某些条件不符合，别直接爆一脸错误，而是把这套模板扔掉**（让它不参与匹配），让编译器安静点。 有了概念和约束后，错误信息能直接定位到概念和约束的相关代码上，非常清晰。 这一点在[[#第 10 章展望：C++20 简介#概念与约束]]中有提到
### 概念(concept)
#### 定义和特性
concept 是一种**编译期谓词（compile-time predicate）**，它定义了一组关于类型的要求（如支持哪些操作、属于哪种类别等）。当用于模板参数时，它起到“类型守门员”的作用：只有满足该谓词的类型才能通过编译。
> [!metaphor] 想像去食堂，门口有一块大招牌： “**今天只收 1 元现金**”。 任何硬币、银行卡、手机支付统统被挡回去。 concept 就是那块大牌——**把你的参数类型先挡住**，不合牌子规则的直接进不来，连后厨都不用解释。
```cpp
// ① 立牌子：只有整数才能用
template<typename T>
concept IntOnly = std::integral_v<T>;   // 定义一个名为IntOnly的概念“类型”
// ② 领牌子：把牌子挂到模板前面
template<IntOnly T>              // <将这个“类型”应用于T参数
T add(T a, T b) {                //         别的类型直接报错
    return a + b;
}
// 等价于
template<typename T>
    requires IntOnly<T>
T add(T a, T b){
    return a + b;
}
```
- 先定义一个 named concept（名字清晰）；
- 再把它放在模板参数中直接使用，就像限制函数的输入类型一样。
- 标签不是“强制转换”，concept 只负责挡，不帮你把浮点变整数
- `requires` 关键字像 C++ 的“检查清单”，告诉编译器“我这个模板或者函数的参数 **必须满足下面这些条件**”。你可以把它理解为一种“静态 if 语句”，**只在编译期运行**。
---
#### 问题背景
模板对于编写适用于不同类型的代码非常有用。例如，此函数将适用于任何数字类型:
```cpp
template <typename T>
T arg 42 (const T & arg) {
    return arg + 42;
}
```
当尝试用非数字类型调用它时，会发生什么呢?
```cpp
const char * n = "7";
cout << "result is " << arg + 42 << "\n";
```
输出为:
```bash
Result is ion
```
这样编译和运行没有错误，但结果无法预测。该调用非常危险，很容易造成崩溃或成为漏洞。我更希望编译器生成一个错误消息，这样就可以提前修复代码。
#### 解决方法
| 项目                                  | concept                                                                                                                                                                                                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **通俗本质**                            | `concept` 是一个**编译期可求值的类型约束谓词**，它基于类型特征（如 `std::integral<T>`）或表达式可行性（如 `requires(T t) { t.size(); }`）来判断某个类型是否符合预期。<br><br>虽然它的效果类似于 `template<typename T> constexpr bool MyConcept = ...;`，但它不是后者的语法糖，而是 C++20 新增的语言特性，具有更强的功能（如支持直接用于模板参数、参与重载决议等）。 |
| **解决痛点**                            | 以前模板错几百行；现在 `requires Integral<T>`，错一行定位到调用点                                                                                                                                                                                                         |
| **语法糖关键字**                          | `concept My = …;`                                                                                                                                                                                                                                    |
| **用在哪**                             | 1\. `template<My T>`<br>2\. `requires My<T>`                                                                                                                                                                                                         |
| `require` 关键字是 C++20 的新特性，将约束应用于模板。 |                                                                                                                                                                                                                                                      |
```cpp
#include <concepts>
template <typename T>
concept Numeric = std::integral<T> || std::floating_point<T>;
template <typename T>
requires Numeric<T>
T arg42(const T & arg) {
    return arg + 42;
}
```
Numeric 是一个只接受整数和浮点类型的概念的名称。现在，当用非数字参数编译这段代码时，就会得到编译错误:
```bash
error: 'arg42': no matching overloaded function found
error: 'arg42': the associated constraints are not satisfied
```
### 约束(constrain)
#### 定义和特性
> [!metaphor] 回到食堂里。窗口有张细纸条写着： “**肉夹馍必须 ≥100 克，配料不能含花生**”。 concept 是门口的“收 1 元现金大牌子”； constraint 就是这张细纸条的**具体内容**（肉≥100g、无花生）。 翻译到 C++：约束 = **把“能否接受”拆成一条条小条件**。 使用 `requires` 关键字定义
#### 使用方法
`requires` 语法用于引入一个子句或者表达式来**细化描述**concept 出现在模板声明中，用来限制模板参数：
##### 🔹 A. requires 子句（Clause）
```cpp
template<typename T>
    requires std::integral<T> && requires(T t) { *t; }
T add(T a, T b) { return a + b; }
```
这个函数只能被整数类型调用（如 int, long 等），不能用 std:: string 或 double 如果使用子句形式，那么所有的条件使用 `&&` 连接
##### 🔹 B. requires 表达式（Expression）
`requires` **就是一个编译期 Boolean 求值器**：
- `( )` 里是**约束变量表**；
- `{ }` 里是“**必须要能编译通过**”的迷你代码块；
  
  - 所有表达式都能通过语法和语义分析（如函数存在、操作合法）→ `requires` 表达式为 `true`
  
  - 任意一条表达式不合法（如成员函数不存在、操作不支持）→ `requires` 表达式为 `false`
- `->` 是“**给返回值附加额外条件**”的语法糖。 写一个具体的“表达式式约束”，告诉编译器“我期望某个类型能做某些事情”：
```cpp
auto operator<=>(...) = default;
template<typename T>
concept HasSize = requires(T x) {
    x.size();  // 必须有 size() 成员函数
    { x[0] } -> std::same_as<int>; // x[0]表达式的返回值必须是int类型
};
```
requires 表达式中每一条句子**不管返回值是多少但需要能够通过编译**，如果需要验证句子返回值，那么使用 `->` 验证返回值类型 需要注意的是：
- `x[0]` 的返回类型可能是 `int&`、`int&&` 或 `int`，而 `std::same_as<int>` 仅匹配 `int`，不匹配引用类型。
- 若 `x` 是 `std::vector<int>`，`x[0]` 返回 `int&`，会导致 `std::same_as<int>` 判断失败，即使语义上是“整数访问”。 可以使用更宽松的匹配：
```cpp
{ x[0] } -> std::convertible_to<int>;  // 可转换为 int
// 或
{ x[0] } -> std::same_as<int&>;        // 明确接受左值引用
// 或更通用：
requires(T x) {
    { x[0] } -> std::integral;         // 要求返回整数类型
};
```
#### 🔹C. 函数签名中使用 require 关键字
```cpp
template<typename T>
T arg42(const T & arg) requires Numeric<T> {
    return arg + 42;
}
```
#### 🔹D. 参数列表中使用概念简化函数模板
```cpp
auto arg42(Numeric auto & arg) {
    return arg + 42;
}
```
### 两者之间的关系
“标签 → 清单”的关系，concept 关键字定义类型需要满足一个名为 `IntOnly` 的标签，标签内容用 `=` 划定或者使用 requires 关键字划定。 concept 是模板参数的“门禁牌”，requires 是“门禁牌背后的检测标准”。 concept = “牌子” requires = “牌子上的具体内容 + 试镜剧本”
```cpp
concept 牌子名 = 老宏判断
   && requires (变量表){ 试台词 1; { 试台词 2 } -> 精确返回 int; };
```
### 使用实例
可以使用 `<type_traits>` 头文件中预定义的特性，或者自定义的特性，就像模板变量一样。为了在约束中使用，该变量必须返回 constexpr bool。例如:
```cpp
template<typename T>
constexpr bool is_gt_byte{ sizeof(T) > 1 };
// 这定义了一个名为 is_gt_byte 的类型特征，该特性使用 sizeof 操作符来测试类型 T 是否大于 1 字节。概念只是一组命名的约束。例如:
template<typename T>
concept Numeric = is_gt_byte<T> && (integral<T> || floating_point<T>);
```
这定义了一个名为 Numeric 的概念，使用 is\_gt\_byte 约束，以及 `<concepts>` 头文件中 floating\_point 和 integral 概念
### 注意事项：
1. **不能把 concept 当作运行期的判断**：它是编译期的限制，不生成任何代码运行；
2. **requires 不能随便嵌套用**：比如不能写 `requires (requires(T x) { ... })`，会报错；
3. **requires 表达式中变量声明要简单**：不要写复杂的初始化语句，只写形如 `x.func()`、`x.size()` 这样；
4. **concept 和 requires 允许重载函数选择**：比如你可以为 `Integral && Unsigned` 做一个比 `Integral` 更具体的版本；
```cpp
template<std::integral T> void foo(T); // 接受所有整数类型
template<std::unsigned\_integral T> void foo(T); // 只接受无符号整数，更具体
foo(42u); // 调用第二个版本
```
5. **concept 并不是继承逻辑**：`MyConcept<T>` 成立 ≠ `T` 是从某个类派生的；
6. **写 requires 表达式要小心返回类型**：要用 `{ expr } -> constraint;` 的形式，否则无法检查语义是否正确
7. sfinae 转化到 C++20 concept 的具体对照表可以参考 [[C++ Code Snippets#C++11 SFINAE 与 C++20 Concept 对照表]]
## 模块——避免重新编译模板库
### 问题背景
- 随着 STL 多年的发展，这些头文件的体积也在不断增长。目前这种情况已经难以处理，并且可扩展性越来越差。
- 头文件通常包含比模板更多的内容，通常包含系统所需的配置宏和其他符号。随着头文件数量的增加，符号冲突的机率也在增加。
- 考虑到使用宏时，它们不受命名空间的限制，也不受其他形式的类型安全限制
大部分头文件结构为：
```cpp
#ifndef BW_MATH
#define BW_MATH
namespace bw {
template<typename T>
T add(T lhs, T rhs) {
 return lhs + rhs;
}
#endif // BW_MATH
```
因是模板，每次使用 `add()` 时，编译器需要进行特化。模板函数每次调用时，都需要解析和特化。这就是为什么**模板实现要放在头文件中**的原因，**源代码必须在编译时可见**。随着 STL 的发展和壮大，现在已经有许多大型模板类和函数，这就成为了一个可扩展性的问题。
### 定义特性
传统方式(`#include`)：每次include等于把货物重新拆箱分发（重复编译） 模块方式(`import`)：一次性装好标准集装箱，各处直接调运（预编译二进制）
- **身份**：替代`#include`的关键字
- **本质**：`语义导入`（非文本复制） 可以解决：

| include问题    | 模块解决方案                      |
| ------------ | --------------------------- |
| 头文件重复解析      | 预编译模块接口 (降低 60-80%编译时间)     |
| 宏污染/命名冲突     | 隔离的命名空间                     |
| 隐式依赖导致增量编译失效 | 显式导入导出                      |
| 循环包含风险       | 单向引用机制，不用定义宏或者 `pragm once` |
|              |                             |
### 使用模块的方式
- 创建模块接口文件 文件扩展名：`.ixx`（MSVC）或 `.cppm`（Clang/GCC）
```cpp
// math.ixx
export module Math;  // 声明模块名称，必须放在第一行
// 导出公开放接口
export namespace Math {
    int add(int a, int b);
    double sqrt(double x);
}
// 导出单个类
export class Calculator {
public:
    int multiply(int a, int b);
private:
    int internal_state; // 私有成员不被导出
};
// 导出自由函数
export const double PI = 3.14159;
export void print_logo();
// 👇 不导出的内容（模块内部私有）
namespace internal {
    void helper() { /* ... */ } // import Math 无法访问
}
// 导出命名空间
export namespace bw { // all of the bw namespace is
visible
template<typename T>
T add(T lhs, T rhs) { // visible as bw::add()
    return lhs + rhs;
}
} // namespace bw
```
- 实现模块
```cpp
// math.cpp
module Math;  // 绑定到模块
import <cmath>; // 只能在自己模块内使用
int Math::add(int a, int b) {
    internal::helper(); // 可访问私有内容
    return a + b;
}
// ...其他函数实现
```
如果想要模块分区
```filetree
Math/
├── core.ixx        # 主接口
├── geometry.cppm   # 分区1
└── algebra.cppm    # 分区2
```
```cpp
// geometry.cppm
export module Math:Geometry;  // 声明为分区
export class Vector3D { /*...*/ };
export double distance(/*...*/);
// algebra.cppm
export module Math:Algebra;
export class Matrix { /*...*/ };
```
```cpp
// core.ixx
export module Math;  // 主模块
// 聚合所有分区
export import :Geometry;
export import :Algebra;
// app.cpp
import Math;  // 导入整个模块
int main() {
    Math::add(2, 3);
    Math::Vector3D v;  // 来自分区
}
```
## 范围容器中创建视图
### 问题背景
| 传统方法                                                          | 现代视图解决方案                   |
| ------------------------------------------------------------- | -------------------------- |
| 大量 `for` 循环嵌套                                                 | 用组合视图替代手写循环                |
| 需要手动创建中间容器                                                    | 视图不复制数据，只做延迟计算             |
| STL 算法与容器分离                                                   | ranges 把容器和视图链式操作结合在一起     |
| STL 编译错误信息晦涩                                                  | ranges 可读性更强 → 错误信息更精准、更直观 |
| 可读性差（比如用 `std::transform`, `std::copy`, `std::back_inserter`) | 在视图中制定谓词即可实现筛选，转化，操作规则     |
- 范围”是一个可以迭代的对象的集合，支持 begin () 和 end () 迭代器的结构都是范围。这包括大多数 STL 容器。
- 视图”是转换另一个基础范围的范围。视图是惰性的，只在范围迭代时操作。视图从底层范围返回数据，不拥有任何数据。视图的运行时间复杂度是 O (1)。
- 视图适配器是一个对象，可接受一个范围，并返回一个视图对象。视图适配器可以使用 | 操作符连接到其他视图适配器。
- 本质是 **惰性求值的 range adaptor chains**：不是直接修改容器，而是生成一层新的“抽象范围（range）”，在迭代时动态计算每个元素。 `<ranges>` 中定义了 `std::ranges` 和 `std::ranges::view` 命名空间。这貌似有些复杂，标准包含了 `std::ranges::view` 的别名，即 `std::view`
### 定义特性
#### 视图特点
“视图”可以想象成 **“实时滤镜”** 或者 **“延迟操作的管道”** 数据源（比如一个向量 `std::vector<int>` 和大部分 stl 数据容器），你可以：
- 🎯 筛选（filter）
- 🧮 投影（transform）
- ⏩ 合并（concat、take、drop）
- 📈 生成（generate、iota） 这些都不用你手动写循环，也不需要创建新的临时容器，**所有操作都是延迟执行的** —— 本质上，就是 **函数式的“数据流编程”**。 **视图（view） = 只读的、可组合的、延迟求值的容器惰性操作表达方式**，加载过程是根据迭代过程实现的。所以如果要形成容器中第 i 个元素到第 j 个元素构成的视图，只能通过
```cpp
std::vector<int> get_sub_range(const std::vector<int>& v, size_t start, size_t stop) {
    return v
        | std::views::drop(start)
        | std::views::take(stop - start);
        // | std::ranges::to<std::vector>; // 可选
}
```
需要遍历 j 次，性能敏感场景还是使用 vector 这种支持下标访问的方法最好 视图**不支持随机访问**，不能通过下标访问，只能迭代。
#### 可写视图
一个 view 是否只读，取决于底层迭代的 range 是否为 const。如果你用的是对原 vector 的 view，那通常可以写；但某些像 `transform_view` 返回的是中间值，不可写。 7. `views::filter`, `views::transform`, `views::reverse` 返回的 view 是 **不可变的**（只读）**某些 view 是可写的**，前提是底层 range 可引用并可变： - `std::views::zip` - `std::views::iota` - `ranges::owning_view` - \`std::views::take 本质上他们的底层实现是引用 判断视图是否可写
方法一：看视图的 value\_type 是否为引用或可变类型
```cpp
template <typename R>
void check_lvalue(R&& range) {
    auto begin = std::ranges::begin(range);
    using value_type = std::ranges::range_value_t<decltype(range)>;
    using reference = decltype(*begin);
    std::cout << "value_type: " << typeid(value_type).name() << "\n";
    std::cout << "reference type: " << typeid(reference).name() << "\n";
}
```
方法二：使用 range 概念判断可写性
```cpp
static_assert(std::ranges::random_access_range<decltype(vec | views::drop(2))>);
static_assert(!std::ranges::borrowed_range<decltype(vec | views::filter(...))>);
```
### 使用方法
最大的优点就是像流一样处理数据的同时只操纵数据的**可读视窗**。搞笑获取数据内容兼顾了语法和性能，同时提高了代码兼容性，不必考虑不同数据类型存储细节

| 问题                | view 的解决方案                    |
| ----------------- | ----------------------------- |
| 代码重复（各种 for + 操作） | 用 view 链式操作替代复杂 for           |
| 可读性差              | 链式风格像 Unix pipe 或 Python 列表推导 |
| 数据拷贝              | view 是零拷贝的（只用引用，不复制）          |
| 代码臃肿              | 用 view 简化 filter / map 代码     |
| 惰性求值              | 只在使用时执行（例如取前3个元素时不会全部处理）      |
| 容错性差              | 用 view 的组合特性写出更健壮的输入处理逻辑      |
#### 简单筛选（不改变元数据）
```cpp
auto main() -> int {
    std::vector<int> v = {1, 2, 3, 4, 5, 6};
    // 管道式处理：筛选偶数 → 映射为平方 → 取前3个
    auto processed = v | std::views::filter([](int x) { return x % 2 == 0; })
                       | std::views::transform([](int x) { return x * x; })
                       | std::views::take(3);
    for (int x : processed) {
        std::cout << x << " ";
    }
    // 输出: 4 16 36
}
```
#### 解析 json 数据中特定值并存储
```cpp
// 假设你解析了一个 JSON 对象：
std::vector<json> items = parseJsonArray(...);
// 获取 items 中所有用户姓名的字符串 vector
std::vector<std::string> names = items | transform([](auto& j) { return j["name"].get<std::string>(); })
                                   | std::ranges::to<std::vector>();
// C++23 支持这样自动转换类型
```
`to<container>` 会将视图中所有元素打包到一个 container<elem\_type>中，elem\_type 和 container 都可以是自定义的数据结构
#### 日志警告级别过滤
```cpp
enum class LogLevel { Debug, Info, Warning, Error };
struct Log { LogLevel level; std::string message; };
std::vector<Log> logs = loadLogs();
// 只看级别大于等于 Warning 的日志消息
for (const auto& msg : logs
    | views::filter([](const Log log) {
        return log.level >= LogLevel::Warning;
     })
    | views::transform(&Log::message))
{
    std::cout << msg << std::endl;
}
```
#### 遍历只读文件
```cpp
#include <fstream>
#include <ranges>
#include <iostream>
std::ifstream file("some.log");
for (std::string line : std::views::istream<std::string>(file)) {
    std::cout << line << "\n";
}
```
传统的 `while(getline)``istreambuf_iterator<char>` 都需要创建临时对象，带来额外的内存消耗。
#### 扁平化处理容器中元素
```cpp
std::vector<std::vector<int>> vecs = {{1, 2}, {3, 4}, {5, 6}};
auto flat = vecs | views::join;
for(int i : flat) {
    cout << i << " ";  // 1 2 3 4 5 6
}
```
#### 比传统方法更好的视图算法
要对 vector 的一部分排序时的情况。可以用老方法来做:
```cpp
sort (v.begin () + 5, v.end ());
```
这将对 vector 的前 5 个元素进行排序。范围版本中，可以使用视图来跳过前 5 个元素:
```cpp
ranges:: sort (views:: drop (v, 5));
```
甚至可以组合视图:
```cpp
ranges:: sort (views:: drop (views:: reverse (v), 5));
```
也可以使用范围适配器作为 ranges:: sort 的参数:
```cpp
ranges::sort(v | views::reverse | views::drop(5));
```
用传统的排序算法和 vector 迭代器来完成:
```cpp
ranges::sort(v.rbegin() + 5, v.rend());
```
### 注意事项
1. ✅ **视图本质是不可变的**，除非你特地复制出来（比如用 `to<std::vector>()`）
2. ❌ **不能直接修改视图中元素**（除非你是可写视图）
```cpp
for(auto& x : container | views::filter(even)) {
    x *= 2; // ❌ 不一定合法，看 range 的类型是否可写
}
```
3. ⚠️ **不要用 auto&& 以外的形式来接受视图**，它可能不是单一值类型
4. ❗ **视图不是容器！** 你不能调用 `.size()`，除非有 `.data()` 方法
5. ⚠️ **某些视图只读，不可随机访问**，`filter_view` 不支持随机访问
6. ⚠️ **视图不是容器：不能用 vector<...> 构造它**，要用 `to<>` 收集结果 从 C++20 开始，`<algorithm>` 头文件中大多数算法都会基于范围。这些版本在 `<algorithm>` 头文件中，但在 std:: ranges 命名空间中，这将它们与传统算法区别开来。
# 第 2 章 STL 的泛型特性
## span 类——使 C 语言数组更安全
`std::span` 类是一个包装器，可在连续的对象序列上创建视图。span 没有属于自己的数据，其引用底层结构中数据。可以把它看作 C 数组的 string\_view，底层结构可以是 C 数组、vector 或 STL array。
> [!note] “span 是一种轻量化的安全数组/容器视图，它不拥有数据，而是对已存在连续内存上的一块‘有范围’的只读引用”
| 类                   | 比喻                                      |
| ------------------- | --------------------------------------- |
| `std::span<T>`      | 一块你看得见的矩形数据区域：不知道它是怎么来的，但你对它的类型和上下限非常清楚 |
| `T*` 和 `size_t len` | 就相当于凌乱拿着一个指针，并被告知“那里有 5 个元素”，但并无完整结构判断  |
| `std::vector<T>`    | 可修改、可拥有的动态数组，内存自动回收                     |
| `std::array<T, N>`  | 固定大小的紧凑数组                               |
### 定义特性
`std::span` 是泛型容器接口简化项目的一个飞跃，也是安全访问原始内存、去除 raw pointer practice（裸指针习惯） 的关键工具。 它最有用的地方，在于将vector，C数组，array这种**任意连续内存内存块存储数据的结构**统一用一种包装类封装，**只包含对目标内存块的引用**（原始内存块的指针和长度）和数据访问（因是只读的，所以不能对数据进行操作）的api，并且由于的数据存储是连续的，所以他**支持视图操作**。
- `std::span<T>` 是可读写的视图 `std::span<const T>` 是只读的，不能修改数据
- span开销小，不需要像vector一样控制容量和动态拓展，他只是指向内存地址，是一种引用已经存在的内存数据的一种不包含数据的封装
- span 解决了旧 C 代码中函数传递数组作为参数时指针操作容易出错和必须传入数组大小的这些弊端。
- span 支持 `span<type, const_num>` 和 `span<type>` 两种方法，第一种会多一个编译期大小检查操作，相当于更严格的**非惰性加载**视图。 使用方式是将 C 数组变量，vector 等连续容器对象放在 span 构造函数中即可将容器升级为 span 对象。
### 注意事项
底层实现只有一个指针和数组大小
```cpp
template<typename T, size_t Extent = std::dynamic_extent>
class span {
private:
    T * data;
    size_t count;
public:
    ...
}
```
- `std::span<T>`：表示对连续数据的视图，**大小在运行期**决定
- `std::dynamic_extent`：一个特殊值，表示“这个 span 的大小不是编译期固定”）。
- `span<type, const_num>` 和 `span<type>` 两种方法创建的对象**在类型上不同**，一个是编译期确定长度，一个运行期确定。若作为参数传入需注意类型。 所有成员函数都是 constexpr 和 const 限定的，包括： ![[Pasted image 20250805133844.png]] ![[Pasted image 20250805133915.png]] span 类只是一个简单的包装器，不执行边界检查。若尝试访问 n 个元素中元素 n+1，结果就是**未定义的**，所以最好不要这样做。
#### C++26 提案中 `mdspan`
`std::mdspan` 是一个多维视图 —— 通俗地说：本地坐标的张量式内存访问封装（针对多维数据结构）
- `span` —— 是一维切片（如 `.subspan(i, len)`），是长方形式视图 API 封装
- `mdspan` —— 是“多维切片”（如 `.subspan(0, 3, 0, 4)`），是 table, matrix, volume 形式的**多维度视图**封装。访问矩阵、缓冲图像行/列、音频帧结构，甚至深度学习数据。
## 结构化绑定（C++20 stl cookbook）
基本内容[[#结构化绑定（modern cpp）]] 结构化绑定使用自动类型推断，所以类型**必须是 auto**（如果不想复制可以带有引用）。
## if 和 switch 语句中初始化变量
### 问题背景
```cpp
const string artist{ "Jimi Hendrix" };
size_t pos{ artist.find("Jimi") };
if(pos != string::npos) {
    ut << "found\n";
} else {
    cout << "not found\n";
}
```
这样的代码会将 pos 暴露在 if 条件之外，为防止命名冲突，if 和 switch 语句中新增一个**初始化变量语句**位置，保证安全。
### 解决方法
```cpp
std::string artist{"shiloh dynasty"};
if (size_t pos = artist.find("dynasty") /*这里不能使用{}引入代码块*/; pos != std::string::npos) {
    // code
}
```
限制锁定互斥锁的 lock\_guard 的作用域。使用初始化表达式，会让代码变得 更简单:
```cpp
if (lock_guard<mutex> lg{ my_mutex }; condition) {
    // interesting things happen here
}
```
lock\_guard 在构造函数中锁定互斥量，在析构函数中解锁互斥量。过去，必须删除它或将整个if 语句括在一个额外的大括号块中。现在，当 lock\_guard 超出 if 语句的作用域时，将自动销毁。
## 模板参数推导
### 问题背景
在 C++ 模板编程的早期，模板参数必须**显式给出类型**，即使是明显“可以通过传入参数猜出具体类型”的情况。 当模板函数或类模板构造函数 (C++17 起) 的实参类型足够清楚，无需使用模板实参，编译器就能理解时，就会进行模板实参推导。
### 解决方案
现代 C++ 支持变量和类的类型推导
```cpp
template<typename T1, typename T2, typename T3>
class Thing {
    T1 v1{};
    T2 v2{};
    T3 v3{};
public:
    explicit Thing(T1 p1, T2 p2, T3 p3) : v1{p1}, v2{p2}, v3{p3} {}
    string print() {
        return format("{}, {}, {}\n",
        typeid(v1).name(),
        typeid(v2).name(),
        typeid(v3).name()
    );
    }
};
// 原本应该
Things<int, double, string> thing1{1, 47.0, "three" }
// 现在只需
Things thing1{1, 47.0, "three" }
// C++17 之前的写法：
std::pair<int, std::string> p(10, "C++98-style");  // ❌ 推导前写法
// C++17 后你这么写即可：
std::pair p(10, "modern lightweight");
```
使用 deduction guideline 手动设置模板推导方向。
```cpp
// 自定义容器类，例如一个简单的 Arr2
template <typename T>
class MyPair {
    T x, y;
public:
    MyPair(T a, T b) : x(a), y(b) {}
};
// 默认推导无法处理不同 T？
// MyPair p(1, 2.5); // x = int, y = double？但模板 T 是什么呢？
// 所以我们写 deduction guide 显式地告诉编译器：我允许传入两个类型，最后 deduce 出一种类型即可
// ✨ 比如一律 cast 为第一类型
MyPair(T a, U b) -> MyPair<T>;
// 最终会变为MyPair<int>
```
### 注意事项
有些推导并不按预期来，特别是带引用、万能引用的函数模板。 concept 判断传入是否合理，而模板推导判断具体是合理范围内哪一个类型
## if constexpr——简化编译时决策
### 问题背景
**传统的运行期 if 无法屏蔽非法模板代码分支**，在模板编程中，经常需要根据模板参数选择性地执行不同的逻辑
### 主要作用
- 代码主要的**速度瓶颈在分支跳转语句中**，使用 `if constexpr` 在编译时计算分值表达式，提高代码速度。
- 未选中分支不参与编译，因此你可以在一个模板函数中编写带有不同类型约束的分支，而无需担心未选分支是否对当前类型不合法
template void print\_info(T value) { if constexpr (std::is\_integral\_v) { // 整型类型 std::cout << "Integral type, size in bits: " << sizeof(T)\*8 << std::endl; } else if constexpr (std::is\_floating\_point\_v) { // 浮点类型 std::cout << "Floating-point type" << std::endl; } else { std::cout << "Some other type" << std::endl; } }
```text
对于 `int`，`std::is_integral_v<int>` 为真，只有第一个块被编译。
对于 `float`，`std::is_integral_v<float>` 是假，第一个块不会编译也不会报错
### 实现原理
在模板实例化**时**，所有代码体都会进行**语法检查**（即使 `if` 条件在运行时不成立）。旧C++只能通过enable_if来区分开类型不一致的情况，并没有跳过语法正确性检查
普通 `if` 不但不会改变编译路径选择，**所有分支都会被编译器检查语法正确性**，即使运行期根本无法执行到那里。
```cpp
template <typename T>
void printInfo(T value) {
  if(std::is_same<T, std::string>){
      std::cout << value.size();
  }else if (std::is_same<T, ErrorStruct>){
      std::cout << value.error_code();
  }
}
```
这段代码没有使用 if constrexpr，就会导致如果传 `std::string` 类型，那么第二个分支在进行语法检查时会出现没有 `error_code()` 成员函数错误，并且由于这是模板，会出现 SFNIAE 现象，大量报错难以 debug。 旧 C++中只能通过 enable\_if，写好几个模板特化或者函数重载函数来对应每一个分支来解决这一问题。
```cpp
template <typename T>
std::enable_if_t<std::is_same_v<T, std::string>> printInfo(T value) {
    std::cout << value.size();
}
template <typename T>
std::enable_if_t<std::is_same_v<T, ErrorStruct>> printInfo(T value) {
    std::cout << value.error_code();
}
```
# 第 3 章 STL 容器
### STL 容器类型的概述
- 顺序容器：元素按顺序排列。虽然可以按顺序使用元素，但其中一些容器使用连续存储，而其他容器则不使用
- 关联容器：将一个键与每个元素关联起来。元素是通过键来引用的，而不是其在容器中位置
- 容器适配器：容器适配器是封装底层容器的类，容器类提供了一组特定的成员函数来访问底层容器元素。
  
  - stack：底层容器可以是 vector、deque 或 list 中一种。若没有指定底层容器，默认为 deque
  
  - queue：底层容器可以是 deque 或 list 容器之一。若没有指定底层容器，默认为 deque。
  
  - priority\_queue：底层容器可以是 vector 或 deque 中一个。若没有指定底层容器，默认为 vector
### 使用擦除函数从容器中删除项
- `std::remove` **不会真正从容器中删除元素**（尤其不是通过 `erase()` 那样的方式删除）。**仅重排元素**，有返回值，是容器末尾的迭代器
- 它是一个 **算法函数**，只操作对象，**不关心它所在的容器的具体类型**。 remove 移除元素的常用用法是：
```cpp
std::vector<int> v{1,2,3,4,5};
std::remove(v, 2);
[1, 3, 4, 5, 4, 2, 5, 2]
                   ↑ new_end
// 正确的移除元素方式
v.erase(std::remove(v.begin(), v.end(), 2), v.end());
```
第一个 2 并没有被移除，而是放在容器最后，将 end 迭代器移动到他之前。 如果想要移除某个元素，那么直接使用 `erase(迭代器)` 移除对应迭代器位置元素
## 安全地访问 vector 元素
### 问题背景
这段代码不会报错：
```cpp
std::vector<int> vec{1, 2, 3, 4, 5};
auto& i = vec[5];
std::cout << i << std::endl;
std::cout << std::format("element is {}\n", i);
// [] 操作符会无声地允许对超出 vector 结尾的位置进行写入:
vector v{ 19, 71, 47, 192, 4004 };
v[5] = 2001;
auto & i = v[5];
cout << format("element is {}\n", i);
```
### 解决方案
通过 `at()` 函数访问容器中元素
## 高效地将元素插入到 map 中
使用 `emplace` 时，不会检查构造的对象（即容器中值对象，map 容器值对象为 `pair<const key, value>`）是否已经存在。 `emplace` 的行为是直接将参数**转发**给值对象的构造函数。即使在不需要对象时，也会构造对象。这包括调用构造函数、分配内存、移动数据，然后丢弃临时对象 通常情况下，key 是较为简单的有区分功能的对象（变量），value 则是真正存储数据的对象（有效负载）。要搜索一个现有的键，`try_emplace()` 函数必须构造键对象，但不需要构造有效负载对象，除非需要插入到 map 中。 emplace 和 try\_emplace 函数签名：
```cpp
pair<iterator, bool> try_emplace( const Key& k, Args&&... args );
pair<iterator,bool> emplace( Args&&... args );
```
由于 `try_emplace` 函数将 key 作为单独的形参，这允许在构造时隔离，先构造键，如果有冲突就避免了构造值造成的资源浪费。应该首选 `try_emplace()`，而非 `emplace()`
## 高效地修改 map 项的键值
### 问题背景
容器是按键排序的。键必须是唯一的，并且是 const 限定的，所以不能更改。传统方法中如果需要修改键，必须先删除键值对，然后构造一个新的键值对。在只需要改变键而不需要改变值的情况下能够带来巨额性能提升 C++17 及后，`std::map` 和 `std::unordered_map` 提供了一个新的函数叫做 `extract()`，可以移除一个键值对（元素）并返回一个 node handle（节点句柄）。
```cpp
std::map<int, std::string> m = {{1, "one"}, {2, "two"}, {3, "three"}};
auto nh = m.extract(2);  // 把 key=2 的节点提取出来
```
`nh` 是一个 `map<int, std::string>::node_type`（节点句柄）， 它**拿出了那个元素，但没有复制或移动其内容**（所以叫“zero-copy”）。 “节点句柄”是 C++17 引入的一种机制，它的本质是一个轻量包装器，用来：
- 持有某个从[[#STL 容器类型的概述|关联容器]] 提取出的键值对（node）
- 支持在不触发复制、不重新分配内存的前提下：
  
  - 修改键（key）
  
  - 插回容器或其他兼容容器中
```cpp
auto nh = m.extract(2);  // nh 是节点句柄
nh.key() = 20;           // 修改键
m.insert(std::move(nh)); // 插入修改后的键值对
```
把原来 key=2 的节点“撕下来”，不做复制，保持 value 的状态 `insert(std::move(nh))`：把它插入回去（移动而不是复制）。方法对比：

| 操作方式                                        | 是否复制 value？ | 是否需要临时构造？ | 是否转移节点？ |
| ------------------------------------------- | ----------- | --------- | ------- |
| `erase(key)` + 构造新 entry                    | yes（先复制）    | yes       | 不能转移    |
| `extract()` → `nh.key() = ...` → `insert()` | no          | no        | 可直接转移   |
### 注意事项#### extract 影响容器
- 一旦 `extract()` 出某个节点：
  - 该元素不会在 map 中了
  - map 的 `size()` 会减一
  - 桶的结构**不会重新调整**（unordered\_map 也是稳定的）
  - 得到了一个 node handle，包含完整的 `<key, value>` 对，这块内存地址不变，value 还在等待操作
- 通过 `.key() = xxx` 和 `.mapped() = xxx` 返回键和值的引用
- 任何对 node 的操作**都需要在检查** `node.empty() == false` **后操作，否则会导致未定义行为，程序能够通过编译且不抛出异常，但运行时崩溃**。
# 第 4 章兼容迭代器
## 迭代器
### 定义特性
基本内容参考 [[C++ Runoob Tutoral#迭代]] 新增内容参考 [[C++ Runoob Tutoral#基于范围的 for 循环]] 总结图 ![[Pasted image 20250805231439.png]]
### 对迭代器使用概念和约束
所有的迭代器约束概念都在 `std::` 命名空间中 ![[Pasted image 20250805231720.png]] ![[Pasted image 20250805231729.png]]
```cpp
template<typename T>
requires std::random_access_iterator<typename T::iterator>
void printc(const T & c) {
    for(auto e : c) {
        cout << format("{} ", e);
    }
    cout << '\n';
    cout << format("element 0: {}\n", c[0]);
}
```
函数需要一个 random\_access\_iterator。若用非随机访问容器的列表使用时，编译器会报错: 编辑时就会出现报错 ![[Pasted image 20250805232401.png]] 编译器立刻返回报错，完整报错内容分析可参考--> [[报错日志分析#C++#约束不匹配报错|约束不匹配]]
```cpp
cpp20feature.cpp: In function 'int main()':
cpp20feature.cpp:19:11: error: no matching function for call to 'printc(std::__cxx11::list<int>&)'
   19 |     printc(c); // 这里知名没有对应的重载函数
      |     ~~~~~~^~~
cpp20feature.cpp:8:6: note: candidate: 'template<class T>  requires  random_access_iterator<typename T::iterator> void printc(const T&)'
    8 | void printc(const T& c) { // 指明不满足require要求
      |      ^~~~~~
// 下面是关于cpp20feature.cpp:8:6:文件中note标签标记的错误追踪
cpp20feature.cpp:8:6: note:   template argument deduction/substitution failed:
cpp20feature.cpp:8:6: note: constraints not satisfied
In file included from D:/Program/mingw64/lib/gcc/x86_64-w64-mingw32/14.2.0/include/c++/compare:40,
...................
```
### 自定义支持迭代器的数据结构
#### 必须组件
1. 一个 `.begin()` 成员
2. 一个 `.end()` 成员，**两个成员返回的类型必须一致**，返回类型为 iterator
3. 必须重载 iterator 中
   
   1. `operator*()`  ——解引用，否则无法访问对应元素的值，只能拿到地址
   
   2. `operator++()` ——前置 `++`，如果不实现则无法支持 min\_element，sort 这些算法函数，因 `min_element` 函数签名为：
template ForwardIterator min\_element(ForwardIterator first, ForwardIterator last); // 需要传入了类型支持前向迭代器概念，概念定义可以再crefer中查到 \`\`\` ![[Pasted image 20250806171459.png]] 3. `operator==` / `!=` 代码实现参考 [[C++ Code Snippets#支持 for-range 的自定义 vector 数据结构]]

| 缺失操作                  | 导致什么失败？                             | 具体例子                     |
| --------------------- | ----------------------------------- | ------------------------ |
| `operator*`           | 所有都失败                               | `for :`、`min_element` 报错 |
| `operator++()` 前置     | 所有都失败                               | 迭代无法进行                   |
| `operator!=(it, end)` | `for :`、几乎所有算法都失败                   | 无法判断是否到结尾                |
| `operator++(int)` 后置  | `std::min_element`, `std::find` 等失败 | 因它们使用 `*it++`            |
| `operator==`          | 有些实现会失败                             | 特别是 `== end()` 判断        |
#### 注意事项
- 解引用 `&` 和 `->` 操作符的返回类型
```cpp
T* ptr_ = nullptr;
T& operator*() const { return *ptr_; }
T* operator->() const { return ptr_; }
```
- 自增自减操作有前后缀之分，C++规定参数列表添加 int 为后缀类型重载
```cpp
iterator& operator++() {         // 必须
      ++ptr_;
      return *this;
  }
iterator operator++(int) {       // 后置自增，可选，因迭代使用前置
  iterator tmp{ptr_};
  ++ptr_;
  return tmp;
}
```
- `==` 和 `!=` 可以设置为成员函数或者友元函数，具体原理参考 [[C++ Runoob Tutoral#运算符重载的本质]]
```cpp
friend bool operator==(const iterator& a, const iterator& b)  { return a.ptr_ == b.ptr_; }  // 必须
friend bool operator!=(const iterator& a, const iterator& b) { return a.ptr_ != b.ptr_; }  // 必须
// 可以将这两个函数作为成员函数，实现为：
// bool operator==(const iterator& mv) const {
//     return this->ptr_ == mv.ptr_;
// }
// bool operator!=(const iterator& mv) const {
//     return this->ptr_ != mv.ptr_;
//     return !(*this == other); // 复用==函数
// }
// ps：作为成员函数时最好加上const修饰函数体，所有基本的数组操作，delete，delete[]，size()都应该使用const noexcept。这些原子操作不会返回错误
```
- 赋值移动语义中容易犯一个错误
```cpp
MyVector& operator=(MyVector&& other) noexcept{
  if(this != &other){
      delete[] data_;
      data_ = other.data_;
      size_ = other.size_;
      capacity_ = other.capacity_;
      // delete[] other.data_
      other.data_ = nullptr;
      other.size_ = 0;
      other.capacity_ = 0;
  }
  // 或者将上面if语句中全部内容替换为swap(*this, other);
  return *this;
}
```
移动语义的核心是新的对象**接管**旧的对象数据，具体原理可以参考 [[Modern C++#移动语义]]，原本 `other.data_` 并不会删除，而是在新对象中用 `data_` 的内存地址修改为 `other.data_` 的地址。 `delete[]` 是对内存的操作而不是对对象的操作。所以只需要将 `other.data_` 不再指向原地址即可。具体原因可以参考 ![[Pasted image 20250806163725.png]]
## 使用迭代器适配器填充 STL 容器
迭代器本质上是一种抽象，有一个特定的接口，并以特定的方式使用。STL 附带了各种迭代器适配器，通常与算法库一起使用，分为：
- 插入迭代器或插入器用于在容器中插入元素。
- 流迭代器读取和写入流。
- 反向迭代器反转迭代器的方向。