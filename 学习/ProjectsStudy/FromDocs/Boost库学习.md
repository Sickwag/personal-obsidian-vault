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
为了正确定义数据集，首先应该引入**样本**的概念。一个**样本**被定义为_多态元组_。元组的大小根据定义将是样本本身**的阶数**。
一个**数据集**是_样本的集合_，它
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
### 数据集测试代码

一旦声明了一个数据集类 `D`，就应该通过特化模板类来将其注册到框架：
```cpp
boost::unit_test::data::monomorphic::is_dataset
```
条件是
```cpp
boost::unit_test::data::monomorphic::is_dataset<D>::value
```
### 使用数据集声明和注册测试用例
