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
包含单元测试头之前必须要 `#define BOOST_TEST_MODULE + 测试名称`，测试名称可以有空格，不需要引号包裹
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