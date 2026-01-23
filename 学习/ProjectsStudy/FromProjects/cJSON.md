## 结构体中指针成员变量
```cpp
typedef struct cJSON_Hooks {
      void *(*malloc_fn)(size_t sz);
      void (*free_fn)(void *ptr);
} cJSON_Hooks;
```
定义 cJSON 的 hooks（一种设计模式）通过函数指针来实现特定功能的插入点。

> 将外部的功能实现函数的指针放入cJSON_HOOKS结构体中，以便需要时通过cJSON_HOOKS对象调用相应的方法，并且这些方法由于是通过指针传入的，需要改变功能时，只需要将外部的实现新功能的函数指针重新赋值到新的cJSON_HOOKS新的对象的成员函数中即可完成功能更新，同时在旧对象中还保留有原来的功能
```cpp
cJSON_Hooks hooks;
hooks.malloc_fn = custom_malloc;
hooks.free_fn = custom_free;
```
需要改功能时只需要外部定义新的功能函数，放入新的对象中，调用新对象就是调用新功能，旧功能的实现仍保留了下来
### 为什么 `free_fn` 的参数类型是 `void*`？
1. **通用性**：
    - `void*` 是C和C++中通用指针类型，它可以指向**任何类型的对象**。这样可以确保 `free_fn` 函数可以释放任何类型的数据结构所占用的内存。
### 为什么不能写成 `void **malloc_fn(size_t sz);` 和 `void *free_fn(void *ptr);`？
1. **指针的指针**：
    - `void **malloc_fn(size_t sz);` 表示 `malloc_fn` 是一个返回 `void**` 类型的函数指针，这在实际使用中是没有意义的，因 `malloc` 函数通常返回 `void*` 类型的指针。
2. **函数指针的参数**：
    - `void *free_fn(void *ptr);` 表示 `free_fn` 是一个接受 `void*` 类型参数的函数指针，这在实际使用中是正确的，但与 `cJSON_Hooks` 结构体中 `free_fn` 定义不一致。
## C/C++文件组织与代码风格
### extern 关键字
1. **声明外部变量或函数**：`extern` 关键字用于声明一个已经在其他文件中定义的变量或函数。
2. **避免重复定义错误**：在当前文件中声明外部变量或函数时，编译器不会报错，因它知道这些变量或函数在其他文件中已经定义。
3. **链接阶段检查**：在链接阶段，编译器会检查这些外部定义是否正确，如果找不到对应的定义，则会报错。
extern 还可以作为编译器预处理命令，
`extern "C"` 是一个编译器指令，用于告诉编译器在处理C++代码时使用C语言的链接方式。具体来说，它确保C++编译器不会对函数名进行名称修饰（name mangling），从而使C++和C代码能够正确链接。
```cpp
// myfunc.h
#ifndef MYFUNC_H
#define MYFUNC_H
extern int globalVar;
void setGlobalVar(int value);
#endif // MYFUNC_H
---------------------------
// myfunc.cpp
#include "myfunc.h"
#include <iostream>
int globalVar = 0;
void setGlobalVar(int value) {
    globalVar = value;
}
----------其他需要使用globalVar的文件----------
////////
```
###  if 预处理头文件保护
假设你有一个全局变量和一个函数，它们需要在多个文件中使用，可以将他们放在一个 `.h` 头文件中，并且使用头文件保护防止重复定义
- **头文件保护的作用是防止重复包含**，而不是阻止使用。
- 当 `myfunc.h` 第一次被包含时，它的内容（即 `extern int globalVar;` 和 `void setGlobalVar(int value);`）已经被引入到编译单元中。
- 后续包含 `myfunc.h` 的文件（如 `a.cpp` 和 `b.cpp`）虽然跳过了头文件的内容，但它们仍可以使用这些声明，因声明已经在第一次包含时生效了。
### 头&源文件内容安排
#### 头文件内容安排
##### 跨平台兼容性和符号导出导入
- 头文件主要用于声明函数原型、类、结构体、枚举等，并且通常会包含 `extern` 声明来确保这些声明不会被**重复定义**。头文件通常还会包含必要的预处理器指令（如 `#include`）和宏定义。
1. **`#ifndef`**：检查宏定义是否已经被定义。如果宏定义未被定义，则执行后续的代码块。
2. **`#define`**：定义一个宏。
3. **`#endif`**：结束宏定义检查。
---
```c
#define CJSON_CDECL __cdecl
#define CJSON_STDCALL __stdcall

#if !defined(CJSON_HIDE_SYMBOLS) && !defined(CJSON_IMPORT_SYMBOLS) && !defined(CJSON_EXPORT_SYMBOLS)
#define CJSON_EXPORT_SYMBOLS
#endif
```
- `__cdecl` 和 `__stdcall` 是两种不同的函数调用约定（calling convention），主要用于指定函数参数的传递顺序、栈的清理方式等。
- `__cdecl` 是C语言默认的调用约定，调用者负责清理栈。
- `__stdcall` 是被调用者负责清理栈，常用于Windows API。
- 在编写库时，通常需要控制哪些函数或变量是公开的（可以被外部调用），哪些是私有的（仅供内部使用）。
- 通过定义这些宏，可以灵活地控制符号的可见性，避免不必要的符号暴露。
- 在Windows平台上，动态链接库（DLL）的符号需要显式导出和导入。通过定义这些宏，可以在编译时自动处理符号的导出和导入，简化代码编写。
- 例如，当编译cJSON为DLL时，使用 `__declspec(dllexport)` 导出符号；当在其他项目中使用cJSON时，使用 `__declspec(dllimport)` 导入符号。
---
不同平台下的符号可见性
```c
// windows环境下
#if defined(CJSON_HIDE_SYMBOLS)
#define CJSON_PUBLIC(type)   type CJSON_STDCALL
#elif defined(CJSON_EXPORT_SYMBOLS)
#define CJSON_PUBLIC(type)   __declspec(dllexport) type CJSON_STDCALL
#elif defined(CJSON_IMPORT_SYMBOLS)
#define CJSON_PUBLIC(type)   __declspec(dllimport) type CJSON_STDCALL
#endif

// 非windows环境下
#if (defined(__GNUC__) || defined(__SUNPRO_CC) || defined (__SUNPRO_C)) && defined(CJSON_API_VISIBILITY)
#define CJSON_PUBLIC(type)   __attribute__((visibility("default"))) type
#else
#define CJSON_PUBLIC(type) type
#endif
```
- 在类Unix系统上，符号的可见性可以通过编译器的属性控制。通过定义这些宏，可以在不同平台上实现一致的符号导出行为。
##### 版本管理
`cjson.h` 中有：
```c
#define CJSON_VERSION_MAJOR 1
#define CJSON_VERSION_MINOR 7
#define CJSON_VERSION_PATCH 18
```
这样一段代码，表示现在的版本是 `1.7.18
- **`1`（主版本号）**：
    - 当前 cJSON 的主版本号是 1，说明库的核心 API 和功能已经相对稳定，没有发生重大变更。
    - 如果未来主版本号升级到 2，可能意味着库发生了不兼容的 API 更改或重大重构。
- **`7`（次版本号）**：
    - 当前 cJSON 的次版本号是 7，说明从 1.0.0 到 1.7.18 之间，库新增了 7 次向后兼容的功能或改进。
    - 这些新增功能不会影响现有代码的兼容性。
- **`18`（修订号）**：
    - 当前 cJSON 的修订号是 18，说明从 1.7.0 到 1.7.18 之间，库进行了 18 次 bug 修复或小的优化。
    - 这些改动不会引入新功能，也不会破坏现有代码的兼容性。

#### 原文件内容安排
- 源文件主要用于实现头文件中声明的函数原型、类成员函数等。源文件中通常会**包含头文件**，以确保所有必要的声明和定义都可用。
示例（头文件 mylib.h）
```cpp
#ifndef MYLIB_H
#define MYLIB_H
#include <iostream>
// 定义一个类
class MyClass {
public:
    MyClass();
    ~MyClass();
    void printMessage() const;
};
// 定义一个函数原型
void setGlobalVar(int value);
#endif // MYLIB_H
```
源文件（main.c）
```cpp
#include "mylib.h"
#include <iostream>
// 实现类的构造函数
MyClass::MyClass() {
    // 构造函数实现
}
// 实现类的析构函数
MyClass::~MyClass() {
    // 析构函数实现
}
// 实现函数原型
void setGlobalVar(int value) {
    // 函数实现
}
// 实现类成员函数
void MyClass::printMessage() const {
    std::cout << "Hello from MyClass!" << std::endl;
}
```
### 代码风格
#### 不使用函数指针作为结构体成员
可以看到，在[[#功能使用#Json 字符串解析|功能使用 > Json 字符串解析]]中，仅仅是解析json 字符串数据需要先判断类型（`cjson_isxxxx()`），如果是array类型就需要调用 `cjson_getObjectItem`，`cjson_getArrayItem` 和 `cjson_getArraySize` 方法实现，这样非常繁琐并且使用了很多重复代码，原因在：
- C 语言是一种**面向过程**的编程语言，它的设计目标是**简单**和**高效**。C 语言的核心思想是通过函数和数据结构来组织代码，而不是通过面向对象的方式。
- cJSON 的设计目标是
	- **轻量级**：代码量小，易于集成到各种项目中。
	- **高效**：尽量减少运行时开销。
	- **可移植性**：能够在各种平台和编译器上运行。
	- **简单易用**：提供基本的 JSON 解析和生成功能，不引入复杂的抽象。
- 使用函数指针会增加代码的复杂性，尤其是在管理函数指针的初始化和调用时。Cjson 选择尽量简单，避免在基本 C 语言特性上实现高阶抽象
为了实现这些目标，cJSON 选择了**面向过程**的设计，而不是模拟面向对象的行为。
## 功能使用
### 解析逻辑
cJSON 的使用模式是
1. 使用 `cJSON_Parse()` 解析 JSON 数据，返回一个 `cJSON` 对象。
2. 使用 `cJSON_GetObjectItem()`、`cJSON_GetArrayItem()` 等方法访问 JSON 数据。
3. 使用 `cJSON_Delete()` 释放资源。
这套逻辑符合直觉，容易记住，面向过程而不是对象，避免了很多抽象
### Json 字符串解析
解析简单 json 结构
```cpp
void test_cjson_string_data() {
	const char* json_data = { R"("name":"sickwag","age":"18")" };
	cJSON* json = cJSON_Parse(json_data);
	if (!json) {
		cout << "error!\n";
	}else {
		cout << "analysis successfully!\n";

	}
}
```
数组需要先用 `cJSON_GetArrayItem` 获取数组 *对象*  （不是一个真正的对象，只是结构体），由于结构体不能存入方法并在其中实现，只能使用外部函数或者**在结构体中定义一个指向函数的指针作为 *"成员函数"***。但项目中没有这么做，原因参考[[#代码风格#不使用函数指针作为结构体成员|代码风格 > 不使用函数指针作为结构体成员]]
解析一维数组
```cpp
void test_cjson_array() {
	const char* json_data = "[1,2,3,4,5,6]";
	cJSON* root = cJSON_Parse(json_data);
	if (root == NULL) {
		printf("%s", cJSON_GetErrorPtr());
	} else {
		cout << "analysis successfully!\n";
	}
	if (cJSON_IsArray(root)) {
		size_t array_size = cJSON_GetArraySize(root);
		cout << array_size << "\n print array content : ";
		for (int i = 0; i < array_size; i++) {
			cJSON* item = cJSON_GetArrayItem(root, i);
			//cout << item; // 错误的，只会输出结构体的内存信息（乱码）
			if (cJSON_IsNumber(item)) {
				int value = item->valuedouble;
				cout << value <<'\t';
			}
		}
	}
	cJSON_Delete(root);
}
```
解析二维数组
```cpp
void test_cjson_keyarray() {
	const char* json_data = R"({"array":[[1,2,3],[4,5,6]]})";
	cJSON* root = cJSON_Parse(json_data);
	if (!root) {
		cout << "error!";
	}
	else {
		cout << "analysis successfully!\n";
		cJSON* keyarray = cJSON_GetObjectItem(root,"array");
		size_t rows = cJSON_GetArraySize(keyarray);
		cout << "print array content :\n";
		for (int i = 0; i < rows; i++) {
			cJSON* row_json = cJSON_GetArrayItem(keyarray, i);
			size_t cols = cJSON_GetArraySize(row_json);
			for (int j = 0; j < cols; j++) {
				cJSON* item = cJSON_GetArrayItem(row_json, j);
				cout << item->valueint <<'\t';
			}
			cout << endl;
		}
	}
	cJSON_Delete(root);
}
```
一层层解析数据：
```cpp
void test_read_json() {
	const char* json_data = R"({"name":"moying","age":18,"address":{"city":"changsha","phone": ["12345","678910"]}})";
	cJSON* root = cJSON_Parse(json_data);
	if (!root) {
		cout << "error!" << cJSON_GetErrorPtr();
	} else {
		cout << "analysis successfully!\n";
		read_json(root);
	}
	cJSON_Delete(root);
}
```
### 递归解析获取所有数据
递归逻辑：
需要向下递归的情况有两种：
1. 访问到对象为 array
如果是 array，则需要遍历打印其中内容，由于 array 中元素并没有键，所以得到 arraysize 之后就可以直接 for 循环输出内容，数组 cjson 对象没有 `string` 成员
2. 访问对象为 object
递归调用读取数据函数，将输入的 cjson 对象用 `->child` 指向内部对象
3. 对于其他类型对象，直接输出即可
具体实现：
```cpp
void read_json(cJSON* root) {
	if (!root) return; // 递归到空键值对直接返回
	switch (root->type) {
	case cJSON_Object: {
		cJSON* child = root->child;
		while (child != NULL) {
			read_json(child);
			child = child->next; // 关键这一步，不然只会dfs，触底不再继续遍历同级object
		}
	}
					 break;
	case cJSON_Array: {
		size_t array_size = cJSON_GetArraySize(root);
		for (int i = 0; i < array_size; i++) {
			cJSON* item = cJSON_GetArrayItem(root, i);
			read_json(item);
		}
	}
					break;
	case cJSON_Number:
		if (root->valuedouble - root->valueint != 0) {
			cout << root->string << ": " << root->valuedouble << '\n';
		} else {
			cout << root->string << ": " << root->valueint << '\n';
		}
		break;
	case cJSON_String:
		if (root->string) {// 数组元素为字符串时，元素没有string键，所以这里判断
			cout << root->string << ": ";
		}
		if (root->valuestring) {
			cout << root->valuestring << '\n';
		}
		break;
---------------下面都是一样的逻辑，且仅仅输出内容-------------
	case cJSON_True:
		if (root->string) { // 检查 root->string 是否为 NULL
			cout << root->string << ": " << "true" << '\n';
		}
		break;
	case cJSON_False:
		if (root->string) { // 检查 root->string 是否为 NULL
			cout << root->string << ": " << "false" << '\n';
		}
		break;
	case cJSON_NULL:
		if (root->string) { // 检查 root->string 是否为 NULL
			cout << root->string << ": " << "NULL" << '\n';
		}
		break;
	default:
		break;
	}
}
```
调用递归函数实现读取 json 所有数据
```cpp
void test_read_json() {
	const char* json_data = R"({"name":"moying","age":18,"address":{"city":"changsha","phone": ["12345","678910"]}})";
	cJSON* root = cJSON_Parse(json_data);
	if (!root) {
		cout << "error!" << cJSON_GetErrorPtr();
	} else {
		cout << "analysis successfully!\n";
		read_json(root);
	}
	cJSON_Delete(root);
}
```
### 添加内容
逻辑非常简单，需要添加普通数据则使用 `cJSON_addXXToXXX()` 可以将内容通过 `cJSON_createXXX` 先创建对象，后添加到对应的 cjson 对象中，添加嵌套数据则需要使用 `cJSON_addItemToObject()`，尤其注意在添加 array 到 object 时用的也是这个，而不是 `addArrayToObject()`
```cpp
void add_json_data() {
	srand((unsigned int)time(NULL));
	cJSON* root = cJSON_CreateObject();
	// add basic content
	cJSON_AddStringToObject(root, "name", "sickwag");
	cJSON_AddNumberToObject(root, "age", 18);

	// add additional
	cJSON* address = cJSON_CreateObject();
	cJSON_AddStringToObject(address, "city", "changsha");
	cJSON_AddItemToObject(root, "address", address);

	// add array
	cJSON* array = cJSON_CreateArray();
	for (int i = 0; i < 5; i++) {
		cJSON_AddItemToArray(array, cJSON_CreateNumber(i+1));
	}
	cJSON_AddItemToObject(root, "some numbers", array);

	printf("%s\n",cJSON_Print(root));
}
```