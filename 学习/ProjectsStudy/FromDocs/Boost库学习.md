# Test 库
## 基本内容
### 构建编译使用
构建：
```cmake
find_package(Boost CONFIG REQUIRED COMPONENTS unit_test_framework)
target_link_libraries(boost_test_learning PRIVATE
	Boost::unit_test_framework
)
```
源代码，静态库，动态库构建方法参考：[使用方式变体 - Boost C++ 函数库](https://boost.ac.cn/doc/libs/latest/libs/test/doc/html/boost_test/usage_variants.html)
使用：
```cpp
#define BOOST_TEST_MODULE simple test1
#include <boost/test/unit_test.hpp>
```
如果链接方式**不是源代码方式**，则再使用单元测试包含的头文件应该是 `#include<boost/test/... .hpp>` 而不应该使用 `#include <boost/test/included/... .hpp>`，否则会导致大量**链接错误**：无法解析的外部符号
包含单元测试头之前必须要 `#define BOOST_TEST_MODULE + 测试名称`，测试名称可以有空格，不需要引号包裹
以 cmake 构建为例，一个测试文件中不能定义 main 函数，而 main 函数会通过手动/自动注册的测试用例代码自动生成，对编译后的结果使用 `--help` 可以查看测试选项
### 简单示例
#### 自动注册测试用例
```cpp
#define BOOST_TEST_MODULE simple test1
#include <boost/test/unit_test.hpp>

BOOST_AUTO_TEST_CASE(test_case1) {
	std::vector<int> a{ 1, 2 };
	std::vector<int> b{ 1, 3 };
	BOOST_TEST(a == b);
}
BOOST_AUTO_TEST_CASE(test_case2) {
	std::vector<int> a{ 1, 2 };
	std::vector<int> b{ 1, 2 };
	BOOST_TEST(a == b);
}
```
- `simple test1` 是单个测试模块的名称，`test_case1` 是一个测试用例
- 使用 `BOOST_AUTO_TEST_CASE` 的所有测试用例都被自动注册，并且最终会被**转化，放在同一个 main 函数中运行**，cmake 中如果同一个 target 中包含的代码文件中也有 main 函数，会报错。
输出为
```bash
Running 2 test cases...
test1.cpp(8): error: in "test_case1": check a == b has failed

*** 1 failure is detected in the test module "simple test1"
```
#### 手动注册测试用例
[`BOOST_TEST_CASE`](https://boost.ac.cn/doc/libs/latest/libs/test/doc/html/boost_test/utf_reference/test_org_reference/test_org_boost_test_case.html "BOOST_TEST_CASE 和 BOOST_TEST_CASE_NAME") 创建 [`boost::unit_test::test_case`](https://boost.ac.cn/doc/libs/latest/libs/test/doc/html/doxygen/a01028.html "类 test_case") 类的实例，并返回指向已构造实例的指针。测试用例名称是从宏参数 test_function 推导出来的。如果您希望分配不同的测试用例名称，您必须执行以下操作之一：
- 使用宏 [`BOOST_TEST_CASE_NAME`](https://boost.ac.cn/doc/libs/latest/libs/test/doc/html/boost_test/utf_reference/test_org_reference/test_org_boost_test_case.html "BOOST_TEST_CASE 和 BOOST_TEST_CASE_NAME") 代替
- 或者使用底层 [`make_test_case`](https://boost.ac.cn/doc/libs/latest/libs/test/doc/html/doxygen/a00761.html "头文件 <boost/test/tree/test_unit.hpp>") 接口代替。
```cpp
#include <boost/test/included/unit_test.hpp>

using namespace boost::unit_test;

void free_test_function() {
	BOOST_TEST(true /* test assertion */);
}

test_suite* init_unit_test_suite(int /*argc*/, char* /*argv*/[]) {
	framework::master_test_suite().add(BOOST_TEST_CASE(&free_test_function));
	framework::master_test_suite().add(BOOST_TEST_CASE_NAME(&free_test_function, "second-check-free-test-function"));
	return 0;
}
```
输出结果为：
```bash
> example --log_level=unit_scope # 这里使用了测试选项
Running 2 test cases...
Entering test module "Master Test Suite"
example.cpp:20: Entering test case "free_test_function"
example.cpp:20: Leaving test case "free_test_function"; testing time: 50us
example.cpp:22: Entering test case "second-check-free-test-function"
example.cpp:22: Leaving test case "second-check-free-test-function"; testing time: 32us
Leaving test module "Master Test Suite"; testing time: 158us

*** No errors detected
```
如果要注册类中的成员函数，则需要 `boost::bind` 绑定类对象指针和参数
```cpp
#include <boost/bind/bind.hpp>
#include <boost/test/included/unit_test.hpp>

using namespace boost::unit_test;

class test_class {
  public:
	void test_method1() {
		BOOST_TEST(true /* test assertion */);
	}
	void test_method2() {
		BOOST_TEST(false /* test assertion */);
	}
};

test_suite* init_unit_test_suite(int /*argc*/, char* /*argv*/[]) {
	boost::shared_ptr<test_class> tester(new test_class);
	framework::master_test_suite().add(BOOST_TEST_CASE(boost::bind(&test_class::test_method1, tester)));
	framework::master_test_suite().add(BOOST_TEST_CASE(boost::bind(&test_class::test_method2, tester)));
	return 0;
}
```
## 数据集测试
### 术语解释
#### 数据驱动测试
是一种将测试逻辑与测试数据分离的方法，允许你用同一套测试逻辑对多组不同的数据进行测试
比如测试加法函数
```cpp
int add(int a, int b) { return a + b; }

// 传统测试方式
BOOST_AUTO_TEST_CASE(test_add) {
    BOOST_TEST(add(1, 2) == 3);
    BOOST_TEST(add(0, 0) == 0);
    BOOST_TEST(add(-1, 1) == 0);
}

// 数据驱动测试方式
BOOST_DATA_TEST_CASE(test_add_ddt,
    bdata::make({1, 0, -1}) * bdata::make({2, 0, 1}) * bdata::make({3, 0, 0}),
    a, b, expected) {
    BOOST_TEST(add(a, b) == expected);
}
```
#### 样本
为了正确定义数据集，首先应该引入**样本**的概念。一个**样本**被定义为多态元组。元组的大小根据定义将是样本本身**的阶数**。
一个**数据集**是样本的集合，它
- 是可前向迭代的，
- 可以查询它的`size`，而`size`本身可以是无限的，
- 其阶数是它所包含的样本的阶数。
#### 数据集
- **样本的集合**，就像数组或列表
- 必须实现：
    1. `begin()`：返回迭代器
    2. `size()`：返回大小（可以是无限）
    3. `arity`：静态常量，表示样本阶数
> [!note]
> 仅支持“单态”数据集，这意味着单个数据集中的所有样本都具有相同的类型和[阶数](https://boost.ac.cn/doc/libs/latest/libs/test/doc/html/boost_test/tests_organization/test_cases/test_case_generation/datasets.html#ftn.boost_test.tests_organization.test_cases.test_case_generation.datasets.f0)（阶数可以简单理解为元组大小）。然而，不同样本类型的数据集可以通过 zip 和笛卡尔积组合在一起。

数据集的接口应实现以下两个函数/字段：
- `iterator begin()`，其中 _iterator_ 是一个前向迭代器，
- `boost::unit_test::data::size_t size() const` 指示数据集的大小。返回的类型是一个专用的类 [`size_t`](https://boost.ac.cn/doc/libs/latest/libs/test/doc/html/doxygen/a01096.html "Class size_t") ，它可以指示无限的数据集大小。
- 一个名为 `arity` 的 `static const int` 数据成员，表示数据集返回的样本的阶数。
### 自定义数据集测试
#### 使用方法
一旦声明了一个数据集**类** `D`，就应该通过特化模板类来将其注册到框架：
```cpp
namespace boost::unit_test::data::monomorphic {
template <>
struct is_dataset<D> : boost::mpl::true_ {};
}

// 这样就能够注册D数据集类，并且`is::_dataset<D>::value == true`
```
然后将需要测试的数据和数据集进行操作
```cpp
BOOST_DATA_TEST_CASE(test1, fibonacci_dataset() ^ bdata::make({ 1, 2, 3, 5, 8, 13, 21, 34, 55 }), fib_sample, exp) {
	BOOST_TEST(fib_sample == exp);
}
```
如上定义的数据集在测试模块开始执行之前就作为全局对象被构造。这使得在数据集生成器内部和迭代过程中，无法访问 `argc` / `argv`、[主测试套件](https://boost.ac.cn/doc/libs/latest/libs/test/doc/html/boost_test/tests_organization/test_tree/master_test_suite.html "主测试套件")（以及预处理后的 `argc` / `argv`）或在测试模块入口的 `main` 之后实例化的任何其他对象。
如果需要解决这个问题，需要使用延迟数据集，本质是**惰性地**实例化数据集
```cpp
BOOST_DATA_TEST_CASE(dataset_test_case,
    boost::unit_test::data::make_delayed<custom_dataset>(arg1, ... ), ...)
{ /*  */ }
```
数据集的和测试数据的操作中，数据的比对会按照**阶数最小的**一方决定（即使一方的 arity 是无限大）

| 操作符 | 名称   | 说明   | 示例                                         |
| --- | ---- | ---- | ------------------------------------------ |
| `^` | Zip  | 一一配对 | `A^B` = `[(a1,b1), (a2,b2), ...]`          |
| `*` | 笛卡尔积 | 所有组合 | `A*B` = `[(a1,b1), (a1,b2), (a2,b1), ...]` |
| `+` | 连接   | 序列拼接 | `A+B` = `[a1, a2, ..., b1, b2, ...]`       |
| `/` | 过滤   | 条件过滤 | `A/pred` = 保留满足pred的样本                     |
#### ^ Zip 操作（一一配对）
```cpp
auto dataset1 = bdata::make({1, 2, 3});      // [1, 2, 3]
auto dataset2 = bdata::make({10, 20, 30});   // [10, 20, 30]
auto zipped = dataset1 ^ dataset2;           // [(1,10), (2,20), (3,30)]

// 大小不同时：
auto dataset3 = bdata::make({1, 2});         // [1, 2]
auto dataset4 = bdata::make({10, 20, 30});   // [10, 20, 30]
auto zipped2 = dataset3 ^ dataset4;          // [(1,10), (2,20)] ← 只取2对
```
#### * 笛卡尔积（所有组合）
```cpp
auto colors = bdata::make({"Red", "Green"});     // [Red, Green]
auto sizes = bdata::make({"S", "M", "L"});       // [S, M, L]
auto products = colors * sizes;                  // 所有组合

// 结果：
// [(Red, S), (Red, M), (Red, L), 
//  (Green, S), (Green, M), (Green, L)]
// 总共 2 × 3 = 6 个组合
```
#### + 连接操作
```cpp
auto dataset1 = bdata::make({1, 2, 3});      // [1, 2, 3]
auto dataset2 = bdata::make({4, 5, 6});      // [4, 5, 6]
auto concatenated = dataset1 + dataset2;     // [1, 2, 3, 4, 5, 6]

// 类型不同也可以（但阶数必须相同）：
auto ints = bdata::make({1, 2, 3});          // 阶数=1
auto more_ints = bdata::make({4, 5});        // 阶数=1
auto all_ints = ints + more_ints;            // [1, 2, 3, 4, 5]
```
### 使用数据集声明和注册测试用例
声明和注册一个数据驱动的测试用例，应该使用宏 [`BOOST_DATA_TEST_CASE`](https://boost.ac.cn/doc/libs/latest/libs/test/doc/html/boost_test/utf_reference/test_org_reference/test_org_boost_test_dataset.html "BOOST_DATA_TEST_CASE") 或 [`BOOST_DATA_TEST_CASE_F`](https://boost.ac.cn/doc/libs/latest/libs/test/doc/html/boost_test/utf_reference/test_org_reference/test_org_boost_test_dataset_fixture.html "BOOST_DATA_TEST_CASE_F")。这两种形式是等效的
- `BOOST_DATA_TEST_CASE_F` 支持 fixtures。fixture 是一个类，用于为每个样本执行前/后提供初始化和清理逻辑。
- fixture 类需实现特定接口（参考：[夹具模型 - Boost C++ 函数库](https://boost.ac.cn/doc/libs/latest/libs/test/doc/html/boost_test/tests_organization/fixtures/models.html)）。
可使用的宏
```cpp
BOOST_DATA_TEST_CASE(test_case_name, dataset) { /* dataset1 of arity 1 */ }
BOOST_DATA_TEST_CASE(test_case_name, dataset, var1) { /* datasets of arity 1 */ }
BOOST_DATA_TEST_CASE(test_case_name, dataset, var1, ..., varN) { /* datasets of arity N  */ }

BOOST_DATA_TEST_CASE_F(fixture, test_case_name, dataset) { /* dataset1 of arity 1 with fixture */ }
BOOST_DATA_TEST_CASE_F(fixture, test_case_name, dataset, var1) { /* dataset1 of arity 1 with fixture */ }
BOOST_DATA_TEST_CASE_F(fixture, test_case_name, dataset, var1, ..., varN) { /* dataset1 of arity N with fixture */ }
```
使用方法
```cpp
// 宏的第一种形式是用于元数为 1 的数据集。通过自动变量 `sample` 获取样本集
BOOST_DATA_TEST_CASE( test_case_arity1_implicit, data::xrange(5) ){
  BOOST_TEST((sample <= 4 && sample >= 0));
}
// 第二种形式也用于元数为 1 的数据集，但不是使用 `sample`，提前使用自定义名称my_var表示数据集名称
BOOST_DATA_TEST_CASE( test_case_arity1, data::xrange(5), my_var ){
  BOOST_TEST((my_var <= 4 && my_var >= 0));
}

// 第三种形式用于元数为 `N` 的数据集。样本是一个多态元组，变量 `var1`, ..., `varN` 分别对应样本的索引 1, ... `N`

// The following definition of the dataset test case throws an exception before the
// test module starts (zip of non infinite or singleton datasets of different length)
BOOST_DATA_TEST_CASE( test_case_arity2, data::xrange(2) ^ data::xrange(5), apples, potatoes){
  BOOST_TEST((apples <= 1 && apples >= 0));
  BOOST_TEST((potatoes <= 4 && potatoes >= 0));
}
```
### 数据集生成器
```cpp
#include <boost/test/data/test_case.hpp>
#include <boost/test/data/monomorphic.hpp>

// 普通测试数据，数据类型可以通过`data::xrange<T>`显式定义类型
auto range1 = data::xrange( (data::step = 0.5, data::end = 3 ) ); // Constructs with named values, starting at 0
auto range2 = data::xrange( begin, end ); // begin < end required
auto range5 = data::xrange( begin, end, step );  // begin < end required
auto range3 = data::xrange( end ); // begin=0, end cannot be <= 0, see above
auto range4 = data::xrange( end, (data::begin=1) ); // named value after end

// 随机数据
auto rdgen = random(); // uniform distribution (real) on [0, 1)
auto rdgen = random(1, 17); // uniform distribution (integer) on [1, 17]
// Default random generator engine, Gaussian distribution (mean=5, sigma=2) and seed set to 100.
auto rdgen = random( (data::seed = 100UL,
                      data::distribution = std::normal_distribution<>(5.,2)) );
```
大部分 stl 中的数据可以直接作为 `bdata::make()` 中的参数，并在宏定义体中使用
注意，使用数据集进行测试，测试用例的轮数是根据数据集大小决定的
```cpp
#define BOOST_TEST_MODULE dataset_example65
#include <boost/test/data/monomorphic.hpp>
#include <boost/test/data/test_case.hpp>
#include <boost/test/unit_test.hpp>

namespace bdata = boost::unit_test::data;

BOOST_DATA_TEST_CASE(test1, bdata::make(2), singleton) {
	std::cout << "test 1: " << singleton << std::endl;
	BOOST_TEST(singleton == 2);
}

BOOST_DATA_TEST_CASE(test2, bdata::xrange(3) ^ bdata::make(2), xr, singleton) {
	std::cout << "test 2: " << xr << ", " << singleton << std::endl;
	BOOST_TEST(singleton == 2);
}
```
结果：
```bash
Running 4 test cases...
test 1: 2
test 2: 0, 2
test 2: 1, 2
test 2: 2, 2

*** No errors detected
```
## 测试树
测试树是测试用例和测试套件的层次结构，以及所有夹具（全局、用例或套件级别），以及所有这些元素之间的相应依赖关系。
测试树由以下部分组成：
- 测试用例：树中包含测试主体（body）的元素，它们构成了树的 **叶子**。
- 测试套件：树的内部节点。这些元素本身没有主体或可执行代码，但可以附加执行代码和测试的夹具。
- 主测试套件：树的根节点，定义上就是一个测试套件。附加到主测试套件的夹具是 **全局** 夹具。
- 夹具：在上述测试单元之前和/或之后执行的代码单元。
![[Pasted image 20260203121417.jpg|500]]
> [!note]
> 修饰可以添加到测试套件和用例上，但主测试套件除外。这些修饰可能会改变单元测试框架处理树的方式。例如，除了夹具及其相关的元素（套件、用例）之外，树本身不强制执行测试用例的执行顺序；修饰可用于指示树元素之间的特定顺序。

### 测试套件
在很多情况下，我们的树只包含直接连接到根的叶子，如果想构建分层测试套件结构，有手动和自动创建和注册测试套件的方法
#### 自动注册
类似命名空间语法：
```cpp
BOOST_AUTO_TEST_SUITE(test_suite_name);
// 测试用例
BOOST_AUTO_TEST_SUITE_END();
```
```cpp
#define BOOST_TEST_MODULE example
#include <boost/test/included/unit_test.hpp>

BOOST_AUTO_TEST_SUITE(test_suite1)

BOOST_AUTO_TEST_CASE(test_case1) {
	BOOST_TEST_WARN(sizeof(int) < 4U);
}

BOOST_AUTO_TEST_CASE(test_case2) {
	BOOST_TEST_REQUIRE(1 == 2);
	BOOST_FAIL("Should never reach this line");
}

BOOST_AUTO_TEST_SUITE_END()
///////////////////////////////////////////////
BOOST_AUTO_TEST_SUITE(test_suite2)

BOOST_AUTO_TEST_CASE(test_case3) {
	BOOST_TEST(true);
}

BOOST_AUTO_TEST_CASE(test_case4) {
	BOOST_TEST(false);
}

BOOST_AUTO_TEST_SUITE_END()
```
```bash
Running 4 test cases...
test4.cpp(11): fatal error: in "test_suite1/test_case2": critical check 1 == 2 has failed [1 != 2]
test4.cpp(23): error: in "test_suite2/test_case4": check false has failed      
*** 2 failures are detected in the test module "example"
```
#### 手动注册
1. 创建一个 [`boost::unit_test::test_suite`](https://boost.ac.cn/doc/libs/latest/libs/test/doc/html/doxygen/a01032.html "Class test_suite") 类的实例，
2. 将其注册到测试树中，然后
3. 用测试用例（或更低级别的测试套件）填充它。
```cpp
void test_suite::add( test_unit* tc, counter_t expected_failures = 0, int timeout = 0 );
```