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
## 基本用法
### 测试用例/套件/模块/装饰器
先要在测试模块（有测试代码的文件）中
```cpp
#define BOOST_TEST_MODULE 模块名称
#include <boost/test/unit_test.hpp>
```
测试组件的从属关系是：模块（MODULE）>套件（SUITE）>用例（CASE）>语句（CHECK_XXX）
每个上级可以包含多个下级
```cpp
BOOST_AUTO_TEST_SUITE(string_utils_tests) // 开始套件测试，包含end之前的case
BOOST_AUTO_TEST_CASE(str2double_test) {
    BOOST_CHECK_CLOSE(str2double("3.14159"), 3.14159, 0.0001); // 结果误差
    BOOST_CHECK_THROW(str2double("not_a_number"), std::invalid_argument); // 结果异常
    BOOST_CHECK_EQUAL(arr->get<std::string>(0), "hello\nworld"); // 结果断言
    BOOST_TEST(expression) // expression必须要是bool类型的
}
BOOST_AUTO_TEST_SUITE_END()
```
装饰器一般用于**套件/用例级别**
```cpp
#define BOOST_TEST_MODULE decorator_02
#include <boost/test/included/unit_test.hpp>
namespace utf = boost::unit_test;

BOOST_AUTO_TEST_SUITE(suite1, * utf::label("trivial")) // 通过*引入
BOOST_AUTO_TEST_CASE(test_case1) {
	BOOST_TEST(true);
}

BOOST_AUTO_TEST_CASE(test_case2) {
	BOOST_TEST(1 == 1);
}
BOOST_AUTO_TEST_SUITE_END()
```
引入装饰器的作用是运行测试程序时可以之运行具有某些装饰（依据 lable 区分）的测试套件
```bash
> decorator_02 --run_test=@trivial
Running 2 test cases...

*** No errors detected
```
显式宏 [`BOOST_TEST_DECORATOR`](https://boost.ac.cn/doc/libs/latest/libs/test/doc/html/boost_test/utf_reference/test_org_reference/test_org_boost_test_decorator.html "BOOST_TEST_DECORATOR") 指示其装饰器集将应用于紧随声明之后的测试单元或_测试用例序列
```cpp
#define BOOST_TEST_MODULE decorator_00
#include <boost/test/included/unit_test.hpp>
#include <boost/test/data/test_case.hpp>

namespace utf  = boost::unit_test;
namespace data = boost::unit_test::data;

BOOST_TEST_DECORATOR(* utf::description("with description"))
BOOST_DATA_TEST_CASE(test_1, data::xrange(4)) {
    BOOST_TEST(sample >= 0);
}
```
输出：
```bash
> decorator_00 --list_content
test_1*: with description
test_1*: with description
test_1*: with description
test_1*: with description
```
### 测试夹具
一个测试用例夹具是被测试用例使用的夹具：
- 夹具的 `setup` 在测试用例执行前被调用
- 夹具的 `teardown` 在测试用例执行完毕后被调用
- 无论其执行状态如何
默认夹具是一个类/结构体，构造函数为 `setup`，析构为 `teardown`，也可以手动设置 `setup()/teardown()` 函数（可以在类内也可以类外，添加夹具绑定的时候提供对应的指针即可）。夹具**一般用于用例/套件**级别
为用例和套件引入夹具都有两种方式：
1. 通过装饰器引入：不允许访问夹具类成员，但提供了更小粒度的定制化，允许一个用例/套件绑定多个夹具
	- 用例：在 `BOOST_AUTO_TEST_CASE(用例名称， 装饰器)` 装饰器位置通过 `*utf::fixture<夹具类>(std::string(夹具名称))` 引入，
	- 套件：`BOOST_AUTO_TEST_SUITE(suite1, * tf::fixture<Fx>(std::string("FX"))) ......测试用例...... BOOST_AUTO_TEST_SUITE_END()` 这种方式只会在套件上加夹具
2. 通过对应宏引入：这允许访问夹具类的成员（public & protect）
	- 用例：`BOOST_FIXTURE_TEST_CASE(用例名称， 夹具类)`，效果和通过装饰器一样
	- 套件：`BOOST_FIXTURE_TEST_SUITE(套件名称, 夹具类)`，注意这会导致套件内所有用例都加上一套相同的夹具
```cpp
#define BOOST_TEST_MODULE decorator_12
#include <boost/test/included/unit_test.hpp>
namespace utf = boost::unit_test;

struct Fx {
	std::string s;
	Fx(std::string s = "")
		: s(s) {
		BOOST_TEST_MESSAGE("set up " << s);
	}
	~Fx() { BOOST_TEST_MESSAGE("tear down " << s); }
};

void setup() { BOOST_TEST_MESSAGE("set up fun"); } // 自定义夹具setup
void teardown() { BOOST_TEST_MESSAGE("tear down fun"); } // 自定义夹具teardown

BOOST_AUTO_TEST_SUITE(suite1,  // 套件的夹具setup会先于用例的setup运行
	* utf::fixture<Fx>(std::string("FX"))	// 1.先运行FX::setup
	* utf::fixture<Fx>(std::string("FX2"))	// 2. 后运行FX2::setup
)

BOOST_AUTO_TEST_CASE(test1, *utf::fixture(&setup, &teardown)) {	// 提供对应指针
	BOOST_TEST_MESSAGE("running test1"); // 3. 运行用例的夹具::setup
	BOOST_TEST(true);
} // 4. 结束时运行用例夹具::teardown

BOOST_AUTO_TEST_CASE(test2) {
	BOOST_TEST_MESSAGE("running test2");
	BOOST_TEST(true);
}

BOOST_AUTO_TEST_SUITE_END() // 结束套件之前调用夹具Fx2::teardown -> Fx::teardown
//////////////第二个测试程序////////////////////////
struct F {
	F()
		: i(0) {
		BOOST_TEST_MESSAGE("setup fixture");
	}
	~F() { BOOST_TEST_MESSAGE("teardown fixture"); }

	int i;
};

BOOST_FIXTURE_TEST_CASE(test_case1, F) {
	BOOST_TEST(i == 1);
	++i;
}

BOOST_FIXTURE_TEST_CASE(test_case2, F) { BOOST_CHECK_EQUAL(i, 1); }
BOOST_AUTO_TEST_CASE(test_case3) { BOOST_TEST(true); }
```
输出
```bash
> decorator_12 --log_level=message
Running 2 test cases...
set up FX
set up FX2
set up fun
running test1
tear down fun
running test2
tear down FX2	# 注意两者顺序
tear down FX

*** No errors detected
===============================
> example --log_level=message
Running 3 test cases...
setup fixture
test.cpp(13): error in "test_case1": check i == 1 has failed
teardown fixture
setup fixture
test.cpp(19): error in "test_case2": check i == 1 has failed [0 != 1]
teardown fixture

*** 2 failures are detected in test suite "example"
```
全局夹具：任何需要在所有测试开始前执行的全局初始化，或在所有测试结束后执行的清理，都称为全局 fixture。等同于一个[测试套件入口/退出](https://boost.ac.cn/doc/libs/latest/libs/test/doc/html/boost_test/tests_organization/fixtures/per_test_suite_fixture.html "测试套件入口/退出 fixture") fixture（仅执行一次），在这种情况下，测试套件是[主测试套件](https://boost.ac.cn/doc/libs/latest/libs/test/doc/html/boost_test/tests_organization/test_tree/master_test_suite.html "主测试套件")。
- 首先定义一个满足[测试夹具类型](https://boost.ac.cn/doc/libs/latest/libs/test/doc/html/boost_test/tests_organization/fixtures/models.html)的类
- 定义全局 fixture 的语句必须位于单个翻译单元中（不能是头文件）
- 在 `BOOST_TEST_GLOBAL_FIXTURE( fixture_in_namespace );` 中使用
示例：
```cpp
#define BOOST_TEST_MODULE fixture_04
#include <boost/test/included/unit_test.hpp>

// 全局命名空间，需要注意夹具名称相同可能出现ODR报错
struct MyGlobalFixture { // 夹具类
	MyGlobalFixture() { BOOST_TEST_MESSAGE("ctor fixture i=" << i); }
	void setup() {
		BOOST_TEST_MESSAGE("setup fixture i=" << i);
		i++;
	}
	void teardown() {
		BOOST_TEST_MESSAGE("teardown fixture i=" << i);
		i += 2;
	}
	~MyGlobalFixture() { BOOST_TEST_MESSAGE("dtor fixture i=" << i); }
	static int i;
};
int MyGlobalFixture::i = 0;

BOOST_TEST_GLOBAL_FIXTURE(MyGlobalFixture);

BOOST_AUTO_TEST_CASE(test_case1) {
	BOOST_TEST_MESSAGE("running test_case1");
	BOOST_TEST(MyGlobalFixture::i == 1);
}

BOOST_AUTO_TEST_CASE(test_case2) {
	BOOST_TEST_MESSAGE("running test_case2");
	BOOST_TEST(MyGlobalFixture::i == 3);
}
```
输出
```bash
> fixture_04 --log_level=message
Running 2 test cases...
ctor fixture i=0
setup fixture i=0
running test_case1
running test_case2
./fixture_04.run-fail.cpp:42: error: in "test_case2": check MyGlobalFixture::i == 3 has failed [1 != 3]
teardown fixture i=1
dtor fixture i=3

*** 1 failure is detected in the test module "fixture_04"
```
效果是在模块中套件开始之前提案加一个夹具

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
如上定义的数据集在测试模块开始执行之前就作为全局对象被构造。这使得在数据集生成器内部和迭代过程中，无法访问 `argc` / `argv`、[主测试套件](https://boost.ac.cn/doc/libs/latest/libs/test/doc/html/boost_test/tests_organization/test_tree/master_test_suite.html "主测试套件")（以及预处理后的 `argc` / `argv`）或在测试模块入口的 `main` 后实例化的任何其他对象。
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
- 夹具：在上述测试单元之前和/或后执行的代码单元。
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

# Boost.SmartPtr：智能指针库
## 简介
智能指针是存储指向动态分配（堆）对象的指针的对象。它们的行为很像内置 C++ 指针，除了它们会在适当时自动删除指向的对象。智能指针在面对异常时特别有用，因它们确保动态分配对象的正确销毁。它们也可以用于跟踪由多个所有者共享的动态分配对象。
## scoped_ptr&scope_array：作用域对象所有权
### 描述
- `scoped_ptr` 类模板存储指向动态分配对象的指针。（动态分配对象使用 C++ `new` 表达式分配。）指向的对象保证会被删除，无论是在 `scoped_ptr` 销毁时，还是通过显式的 `reset` 删除。
- 仅在当前作用域内保留所有权。因它是不可复制的，所以对于不应复制的指针，它比 `shared_ptr` 更安全。
- `scoped_ptr` 很简单，每个操作都与内置指针一样快，没有比内置指针更多的空间开销
- scoped_ptr = 一种“哑巴”式独占指针：生在一个 `{ }` 块儿里，死也在一块儿，绝不把资源交给别人。它只想保护那段内存不出事，别的什么都不管。

### 用法
用于解决三个 C++常见 bug
1. new 后忘记 delete —— 内存泄漏
2. 多个地方都 delete —— 重复释放
3. 一个函数里异常提前返回——delete 语句被跳过
#### Pimpl（“指针实现”/“隐藏实现”）
.h 文件里放个 `boost::scoped_ptr<Impl>` 即实现 + 内存管理一步到位，省去析构函数手写 delete。
```cpp
// Foo.h
class Foo {
    struct Impl;
    boost::scoped_ptr<Impl> pImpl;   // 自动释放，头文件不用 include 常见库
public:
    Foo();
    ~Foo();
};
```
#### 定死指针和指针指向的对象
```cpp
const boost::scoped_ptr<int> p(new int(5));
```
这表示“指针本身不能改指向，指向的对象也不能改值”，相当于“双重锁”。
但注意：const 只能管住对象内容，管不住裸指针本身被 `reset()` ——scoped_ptr 的 `reset()` 是成员函数，即使对象是 const 也能调（因 `reset()` 不是 const 成员）。想彻底锁死，需要 `const boost::scoped_ptr<const int>`。
```cpp
struct LogFile {
    boost::scoped_ptr<FILE, file_closer> fp_;  // file_closer 是自定义 deleter
    LogFile(const char* path) : fp_(fopen(path, "a")) {
        if (!fp_) throw std::runtime_error("open failed");
    }
    void write(const char* msg) { fputs(msg, fp_.get()); fflush(fp_.get()); }
};
```
#### 注意事项
- scoped_ptr 接管一块你已用 new 分配的堆内存，析构时自动 delete；它禁止拷贝/赋值，但仍可用 `reset()` 换指向。只保证 **指针本身** 在构造时拿到一个有效地址，至于地址指向的对象可以不初始化
- `new` 在哪里还得要自己手动写的，scoped_ptr 只是负责 **delete**。
- `scoped_array` 没有 size()/push_back()/迭代器等 vector 的任何接口；它就是 **裸数组 + delete[]** 的 RAII 包装。
- `scoped_array<int>` 相当于“**固定长度、禁止拷贝、禁止转移**的动态数组”，功能上更接近 `std::unique_ptr<int[]>`，而不是 vector。
- C++11 起有了 `std::unique_ptr`，功能更强（能 move，有自定义 deleter），建议新项目直接使用 unique_ptr。老代码里你能看到大量 scoped_ptr，但新代码优先 unique_ptr 即可。
### 成员
#### reset（两者都有）
```cpp
void reset(T * p = 0) noexcept;
```
删除存储指针指向的数组，然后存储 `p` 的**副本**，`p` 必须已通过 C++ `new[]` 表达式分配或为 0。 `T` 必须是完整的，并且对存储指针执行 `delete[]` 不得抛出异常。
#### get
```cpp
T * get() const noexcept;
```
返回存储的指针。 `T` 不需要是完整类型。
#### swap
```cpp
template<class T> void swap(scoped_array<T> & a, scoped_array<T> & b) noexcept;
```
等效于 `a.swap(b)`。
## shared_ptr：共享所有权
### 描述
boost:: shared_ptr = “多人共用的智能指针，最后一个走的人关灯”——靠引用计数决定资源何时释放，可以安全地到处拷贝、传参、放回容器，专治“谁该 delete”的糊涂账。**当指向它的最后一个 `shared_ptr` 被销毁或重置时，指向的对象保证会被删除**。
### 用法
- 多个模块/容器/回调都持有同一资源，谁最后释放？
- 手动 delete 容易“早删”或“漏删”。
- auto_ptr/scoped_ptr 只能独占，无法满足共享需求。
#### 基本功能
```cpp
struct Foo { void say() { std::cout << "hello\n"; } };

void use(boost::shared_ptr<Foo> p) { p->say(); }   // 值传，计数+1

int main() {
    boost::shared_ptr<Foo> a(new Foo);  // 账本=1
    boost::shared_ptr<Foo> b = a;       // 账本=2
    use(a);                             // 进入函数时=3，退出时=2
    b.reset();                          // 账本=1
}   // a 离开作用域，账本=0 → 自动 delete Foo
```
1. 网络连接池
```cpp
class TcpConnection : public boost::enable_shared_from_this<TcpConnection> { ... };
std::map<int, boost::shared_ptr<TcpConnection>> g_pool;
```
任何地方拿到 `shared_ptr<TcpConnection>` 都能安全延长连接生命期。
2. GUI 控件树
 每个父控件持有子控件的 shared_ptr；子控件若想反向引用父控件，用 weak_ptr 避免循环。
3. 缓存
```cpp
using ImageCache = std::map<std::string, boost::shared_ptr<Image>>;
```
当最后一块 UI 不再引用某图片，缓存条目自动释放内存
### 注意事项
C++ 函数实参的求值顺序是未指定的
标准只保证：
• 所有实参求值完成后，才进入函数体；
• 但先算哪个实参、后算哪个实参，由编译器决定。
shared_ptr 的异常安全和不安全使用
```cpp
void f(shared_ptr<int>, int);
int g();

void ok() {
    shared_ptr<int> p( new int(2) );
    f( p, g() );
}
// step 1   new int(2)     → 得到裸指针 P
// step 2   shared_ptr<int> p(P)   → 对象构造完成，计数器=1
// step 3   g() 求值        → 如果抛异常，p 已经存在，析构时 delete P

void bad() {
    f( shared_ptr<int>( new int(2) ), g() );
}
// 假设编译器决定这样求值：
// step 1   new int(2)     → 得到裸指针 P
// step 2   g() 求值        → 此时临时 shared_ptr 尚未构造，因没有创建对象
// step 3   g() 抛异常
// 异常一路抛出去，临时 shared_ptr 的构造函数根本没机会被调用，于是 P 变成孤儿裸指针，没人 delete → 内存泄漏。
```
- 临时创建的 shared_ptr 没有绑定到名称上，内存中已经为指针指向（分配了）内存区域（这块内存区域被 new 语句分配，是有内容的）。
- 该内存的唯一持有者是那个刚刚返回的裸指针。
- 但由于 `shared_ptr` 构造函数没有执行，导致没有创建**接管这块内存的 `shared_ptr` 对象**，但指针存在而应该访问（管理）这个指针的 shared_ptr 对象裸指针丢失，这块内存无法被 delete.
# Boost.mysql
## 协程和异步编程
协程这一知识点可以参考 [[WebServer-Chat#前置要求#协程]]
### 高并发逻辑
- 同步代码：像流水线工人一样工作
	- **线性执行**：代码从上到下一行行执行。
	- **阻塞等待**：每执行一个 I/O 操作（如 `connect()`），线程必须 **停下来等**，不能做其他事。
	- 一个操作阻塞时，线程无法处理其他任务；**并发能力差**：1000 个用户请求，就需要 1000 个线程，开销大。
- 异步代码：像快递员扔包裹后继续送下一个
	- **立即返回**：`async_connect()` 启动后立即返回，不阻塞线程。
	- **回调处理**：操作完成后，调用传入的回调函数继续处理。
	- **线程不空转**：即使数据库没响应，线程也可以 **干其他事**（如处理其他连接）。
	- 操作 **发起后立即返回**，不阻塞线程，操作完成后通过通知（通过回调函数发出通知）。
	- 协程是实现异步代码的一种方式
- `co_await`
	- 当 `co_await` 后的操作（如 async 的 io 操作 `）未完成时，协程会**挂起自身**；
	- 该操作的后续结果会注册到 `io_context` 的事件循环中；
	- `co_await async_op(...)` 会自动绑定 `asio::use_awaitable` 调度器；会调用 `async_op(..., asio::use_awaitable)`。
	- 用其修饰是，当 `async_connect(...)` 等待时，协程暂停，不阻塞线程；
	- - `co_await` 标记过的操作的执行、挂起和恢复机制 **不由 `co_spawn` 的参数直接决定**，而是由协程内部的 `awaitable` 和 `io_context` 事件循环协同完成。
- `co_spawn`
	- `co_spawn`：将协程 **注册到 `io_context` 中**，由它调度；
```cpp
asio::co_spawn(
    ctx, // 事件处理器
    coro_main(conn, "mysql2.sqlpub.com:3307", "sickwag", "LqX9jBDqvDJYeooE"), // 协程和他的操作内容
    asio::detached // 事件处理器对协程的处理行为
);
```
阻塞式写法：像写同步代码一样的代码风格和逻辑，实际上执行异步操作。
```cpp
	// 同步写法
	void sync_main(...) {
	    conn.connect(...);      // 阻塞直到连接成功
	    conn.execute(...);     // 阻塞直到查询完成
	    std::cout << result;   // 直接输出
	    conn.close();          // 阻塞直到关闭
	}
	// 异步写法
	asio::awaitable<void> coro_main(...) {
	    co_await conn.async_connect(...);  // 挂起等待连接
	    co_await conn.async_execute(...); // 挂起等待查询
	    std::cout << result...;           // 查询完成后自动恢复
	    co_await conn.async_close(...);   // 挂起等待关闭
	}
```
- 其中，`asio::awaitable<void>` 表示不返回任何值
由于传统同步写法每进行一个同步操作后，需要写一个回调函数告知这个操作执行完毕并且进行错误处理，任务管理器根据回调函数的通知才能进行下一步操作，一旦操作需要多方通知，多层嵌套，代码就含有非常多回调，几乎不可读
### 并发事件循环
`io_context` 是什么？
- **事件循环（Event Loop）**：就像一个“导演”，管理所有异步操作；
- 所有 `async_*` 操作（通过 `co_await` 标记的操作）都注册到 `io_context` 的 epoll/kqueue/iocp 等待队列中；
- **当 I/O 完成，`io_context` 会唤醒对应的协程**。
- 协程本质是一个 **可挂起/恢复的函数**，内部包含通过 `co_await` 修饰的操作和协程所需的局部变量，资源。
- 协程的局部变量 **不会因挂起丢失**，因编译器会将其分配在堆内存中（而非普通函数的栈内存）。
异步连接数据库代码示例：
```cpp
asio::awaitable<void> coro_main(
    mysql::any_connection& conn,
    std::string_view username,
    std::string_view password,
    std::string_view database,
    std::string_view server_hostname) {
    mysql::connect_params params;
    params.username = username;
    params.password = password;
    params.server_address.emplace_host_and_port(std::string(server_hostname), 3307);

    co_await conn.async_connect(params);
    const char* sql_string = "select * from users;";
    mysql::results result;
    co_await conn.async_execute("use sickwag_learning;", result);
    co_await conn.async_execute(sql_string, result);
    std::cout << result.rows().at(0).at(0) << std::endl;
    co_await conn.async_close();
}

void main_impl(int argc, char** argv) {
    if (argc != 5) {
        std::cerr << "Usage: " << argv[0] << " <username> <password> <database> <server-hostname>\n";
        exit(1);
    }

    asio::io_context ctx;
    mysql::any_connection conn(ctx);
    asio::co_spawn(
        ctx,
        [&conn, &argv]() {
            return coro_main(conn, argv[1], argv[2], argv[3], argv[4]);
        },
        [](const std::exception_ptr& ptr) {
            if (ptr) {
                std::rethrow_exception(ptr);
            }
        });

    ctx.run();
}

int main(int argc, char** argv) {
    try {
        main_impl(argc, argv);
    } catch (const mysql::error_with_diagnostics& err) {
        std::cerr << "Error: " << err.what() << '\n'
                  << "Server diagnostics: " << err.get_diagnostics().server_message() << '\n';
        return 1;
    } catch (const std::exception& err) {
        std::cerr << "Error: " << err.what() << std::endl;
        return 1;
    }
}
```
## 执行预处理语句
千万要注意编译器报错时看看是不是少 include 一些文件，还有创建完协程***一定要记得绑定协程到事件管理器，然后运行***
```cpp
asio::awaitable<void> coro_main(
    mysql::any_connection& conn,
    std::string_view username,
    std::string_view password,
    std::string_view database,
    std::string_view hostname
){
    mysql::connect_params params;
    params.database = database;
    params.password = password;
    params.server_address.emplace_host_and_port(std::string(hostname),3307);
    params.username = username;

    mysql::results result;
    co_await conn.async_connect(params);
    const char* sql_string = "select * from users u where u.id = ?;";
    mysql::statement stmt = co_await conn.async_prepare_statement(sql_string);
    short id = 3;
    co_await conn.async_execute(
        mysql::with_params("SELECT * FROM users u WHERE u.id = {}", id),
        result
    );

    if(result.rows().empty()){
        std::cerr << "empty query result!";
    }else{
        std::cerr << "not empty query result!\n";
        std::cerr << result.rows().at(0).at(0) << '\n';
        std::cerr << result.rows().at(0).at(1) << '\n';
        std::cerr << result.rows().at(0).at(2) << '\n';
    }
}

int main(int argc, char** argv) {
    try {
        asio::io_context ctx;
        mysql::any_connection conn(ctx);

        asio::co_spawn(ctx, coro_main(conn, argv[1], argv[2], argv[3], argv[4]), [](const std::exception_ptr& ptr) {
            if (ptr)
                std::rethrow_exception(ptr);
        });

        ctx.run();  // 必须调用，否则协程不会执行
    } catch (const mysql::error_with_diagnostics& err) {
        std::cerr << "Error: " << err.what() << '\n'
                  << "Server diagnostics: " << err.get_diagnostics().server_message() << '\n';
        return 1;
    } catch (const std::exception& err) {
        std::cerr << "Error: " << err.what() << std::endl;
        return 1;
    }
}
```
其他方法参考[[#预处理语句（防止 SQL 注入）|预处理语句（防止 SQL 注入）]]

## 静态接口
Boost 库中“静态接口”是指 **不依赖对象实例** 的***类方法***或自由函数（free function），**通过类名直接调用**，可以是类的静态成员函数，不访问对象内部状态（即不使用 this 指针），常用于封装**异步操作**和**资源管理**的通用逻辑，简化代码结构并提升可维护性
它不像传统反射（如 Java/Python）那样在运行时动态获取类型信息，而是 **在编译时生成结构体的元数据**，供程序使用。
你告诉编译器：“这个结构体有哪些字段”，它会 **自动生成一个描述结构体成员的元信息结构**，比如字段名和字段类型。
### 结构体元数据解析
`BOOST_DESCRIBE_STRUCT` 是 Boost.Describe 库中一个宏，用于 **为结构体或类定义成员变量的元数据（metadata）**，以便在编译时或运行时 **访问其字段名、字段类型、字段值**，实现 **静态反射（Static Reflection）**。
### 多结果集查询
使用多结果集查询需要先在单个 `connection::execute` 调用中运行多个分号分隔的文本查询。出于安全考虑，此功能默认禁用。启用它需要在连接之前设置 `handshake_params::multi_queries`
它的定义为：
![[Pasted image 20250722152355.png]]
使用构造函数初始化并将 multi_queries 设置为 true
像 `DELIMITER` 这样的语句使用此功能 **不起作用**。这是因 `DELIMITER` 是 `mysql` 命令行工具的伪命令，而不是实际的 SQL。
#### 静态接口结构体解析数据类型
需要注意的是，使用静态接口解析***行数据结构体*** 需要 mysql 表中字段类型和 C++对应类型字段匹配，`ptr_by_name` 认为**行数据结构体**中成员名称必须和字段名相同。存储的是表的字段名。其实存储的将会是***字段值***

```error
Error: Incompatible types for field 'id': C++ type 'string' is not compatible with DB type 'MEDIUMINT'
NULL checks failed for field 'phone': the database type may be NULL, but the C++ type cannot. Use std::optional<T> or boost::optional<T>: The static interface detected a type mismatch between your declared row type and what the server returned. Verify your type definitions. [mysql.client:10]
Server diagnostics:
```
上面错误是由于设置：
```cpp
struct Info{
    std::string id, name, nick_name, priority;
    std::optional<std::string> phone;
};
// 但通过下面代码使用名称解析
mysql::static_results<mysql::pfr_by_name<Info>> result;
short id = 3;
co_await conn.async_execute(
    mysql::with_params("select id, name, nick_name, priority, phone from users where id = {};", id),
    result);

// 如果使用boost::mysql::ptr_by_postion，则会按照查询结果字段顺序解析到结构体中
mysql::static_results<mysql::pfr_by_postion<Info>> result;
// 按顺序赋值到Info中元素
```
最终 mediumint 类型被解析到 `std::string` 类型中导致报错
`std::int32_t` 与 `TINYINT`（1 字节整数）兼容，但不与 `BIGINT`（8 字节整数）兼容。有关允许的字段类型的完整列表，[请参阅此表](https://boost.ac.cn/doc/libs/1_88_0/libs/mysql/doc/html/mysql/static_interface.html#mysql.static_interface.readable_field_reference)。

### mysql 允许为空字段 C++解析报错
如果设置了一个字段在 MySQL 中是可以为 `NULL` 的，那么在***行数据结构体***中对应的 C++数据类型可能要转换，比如 `std::string` 类型不能为 NULL（`std::string` 是一个类类型（class type），**它不是指针**，因此**不存在 "NULL" 或 `nullptr` 的概念**。像 C 风格的 `char*` 字符串那样可能指向 `NULL` 或 `nullptr`。）可以通过使用 `std::optional<std::string>` 类型来让变量可以为 `NULL`
这个字段可以为 `NULL`，可能查询值中字段非空，但为了安全性，代码会选择在编译器报错杜绝运行期类型转换带来的风险，Boost. MySQL 的静态接口无法将 `NULL` 值赋给 `std::string`，于是抛出此异常。
解决方法是：修改结构体，将可能为 `NULL` 的字段改为 `std::optional<T>`，对封装类 `option<T>` 的解析和操作，需要注意[[#复杂类型误用未定义操作符报错|复杂类型误用未定义操作符报错]]，或者***不使用静态接口映射***，使用 `rows().at().at()` 手动解析
##### 复杂类型误用未定义操作符报错

对于 `optional<T>` 类型，不能 `<<` 输出值，导致 cmake 大量***近乎不可读的***报错：
![[Pasted image 20250722003147.png]]
这些错误来自错误列表（还是可读的😅）
![[Pasted image 20250722004123.png]] 通过筛选器筛选**输出**关键词，问题列表中也可以筛选从而快速定位
```bash
error # 注意error后有空格，一般错误以 字母+数字 编写，可以用筛选器正则表达筛选快速找到错误所在
warning
```
![[Pasted image 20250722004106.png]]
并通过下面这段代码来输出包装器中值：
```cpp
if (info.phone.has_value()) {
    std::cout << "Phone: " << info.phone.value() << '\n';
} else {
    std::cout << "Phone: NULL" << '\n';
}
```

### 反射技术比较
参考[静态接口 - 1.88.0 - Boost C++ 函数库](https://boost.ac.cn/doc/libs/1_88_0/libs/mysql/doc/html/mysql/static_interface.html#mysql.static_interface.meta_checks)比较表格

## UPDATE、事务和分号分隔查询
#### 简单 update
执行 update 同样使用 `conn. execute`，只不过一般使用 `with_params` 插入参数
```cpp
short id = 3;
std::string nick_name = "nick";
co_await conn.async_execute(
    mysql::with_params("update users u set nick_name = {} where u.id = {};", nick_name, id),
    result
);
```
对于这样的代码：
```cpp
mysql::results result;
co_await conn.async_execute(
    mysql::with_params(
        "START TRANSACTION;"
        "UPDATE employee SET first_name = {} WHERE id = {};"
        "SELECT first_name, last_name FROM employee WHERE id = {};"
        "COMMIT",
        new_first_name,
        employee_id,
        employee_id
    ),
    result
);
```
传递给 `with_params` 的参数列表中重复 `employee_id` 违反了 DRY 原则。与 `std::format` 一样，我们可以通过使用手动索引多次引用格式参数
```cpp
mysql::results result;
co_await conn.async_execute(
    mysql::with_params(
        "START TRANSACTION;"
        "UPDATE employee SET first_name = {0} WHERE id = {1};"
        "SELECT first_name, last_name FROM employee WHERE id = {1};"
        "COMMIT",
        new_first_name,
        employee_id
    ),
    result
);
```
### 将静态接口与多结果集一起使用
```cpp
mysql::static_results<
    std::tuple<>,                  // START TRANSACTION doesn't generate rows
    std::tuple<>,                  // The UPDATE doesn't generate rows
    mysql::pfr_by_name<employee>,  // The SELECT generates employees
    std::tuple<>                   // The COMMIT doesn't generate rows
> result;

co_await conn.async_execute(
    mysql::with_params(
        "START TRANSACTION;"
        "UPDATE employee SET first_name = {0} WHERE id = {1};"
        "SELECT first_name, last_name FROM employee WHERE id = {1};"
        "COMMIT",
        new_first_name,
        employee_id
    ),
    result
);

// We've run 4 SQL queries, so MySQL has returned us 4 resultsets.
// The SELECT is the 3rd resultset. Retrieve the generated rows.
// employees is a span<const employee>
auto employees = result.rows<2>(); // 第三个结果集
if (employees.empty()) {
    std::cout << "No employee with ID = " << employee_id << std::endl;
}
else {
    const employee& emp = employees[0];
    std::cout << "Updated: employee is now " << emp.first_name << " " << emp.last_name << std::endl;
}
```

## 连接池
创建连接池
connection_pool 是一个 I/O 对象，包含 any_connection 对象，并且可以从执行上下文和一个 pool_params 配置结构体构建。

```cpp
// Create an I/O context, required by all I/O objects
asio:: io_context ctx;

// pool_params contains configuration for the pool.
// You must specify enough information to establish a connection,
// including the server address and credentials.
// You can configure a lot of other things, like pool limits
mysql:: pool_params params;
params. server_address. emplace_host_and_port (server_hostname);
params. username = username;
params. password = password;
params. database = "boost_mysql_examples";

// Construct the pool.
// ctx will be used to create the connections and other I/O objects
mysql:: connection_pool pool (ctx, std:: move (params));
```
通常每个应用程序创建一个连接池。每个连接池应该调用一次 `connection_pool:: async_run。`
当使用连接池时，我们不需要显式地创建、连接或关闭连接。相反，我们使用 `connection_pool:: async_get_connection` 从池中获取它们。
```cpp
mysql::pooled_connection conn = co_await pool.async_get_connection();
mysql::static_results<mysql::pfr_by_name<employee>> result;
co_await conn->async_execute(
    mysql::with_params("SELECT first_name, last_name FROM employee WHERE id = {}", employee_id),
    result
);
```
当 `pooled_connection` 被销毁时，连接将返回到池中。底层连接将使用轻量级会话重置机制进行清理和回收。后续的 `async_get_connection` 调用可能会检索到相同的连接。这提高了效率，因会话建立的成本很高。
```cpp
// This will wait until a healthy connection is ready to be used.
// pooled_connection grants us exclusive access to the connection until
// the object is destroyed.
// Fail the operation if no connection becomes available in the next 20 seconds.
mysql::pooled_connection conn = co_await pool.async_get_connection(
    asio::cancel_after(std::chrono::seconds(1))
);
```
## 异步连接数据库
代码实现参考 [[C++ Code Snippets#MySQL 数据库程序#boost.mysql 异步连接版本]]