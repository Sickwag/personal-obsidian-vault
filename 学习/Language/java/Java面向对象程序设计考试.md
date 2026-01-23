---
created: 2025-05-08
description: 大购题库，50个程序题。Solution放在Solution.java中，测试代码是否正确放在Test.java中，Main.java只用来调用接口
---
 # 大购习题
## 程序 2 -> 范围内素数
可以参考 [[用法导向知识#欧拉筛法（线性筛法）|C++实现]]
### 泛型类型推断（`ArrayList<>()`）
```java
List<Integer> primes = new ArrayList<>();
```
- **左边 `List<Integer>`**：声明接口类型（面向接口编程），提高灵活性。
- **右边 `ArrayList<>()`**：
    - `<>`：钻石操作符（Java 7+），编译器自动推断泛型类型（与左侧一致）。
    - `()`：调用无参构造器。
- **为什么不用重复写 `Integer`**？
    Java 编译器通过左侧类型自动推断右侧泛型类型，避免冗余。
- C++：`std::vector<int> v;`
- Java：`List<Integer> list = new ArrayList<>();` `List` 是接口，`ArrayList` 是实现类。
    （Java 必须用包装类，不能直接用 `int`）

### `int` vs `Integer`
|特性| `int` | `Integer` |
|---|---|---|
|类型|基本类型|包装类（对象）|
|存储|栈内存|堆内存|
|默认值|0| `null` |
|集合中|不支持|必须用 `Integer` |
|性能|更高|有对象开销|
**为什么参数用 `Integer`？**
- 你的代码中实际是 `int`（正确做法），`Integer` 通常用于泛型或需要 `null` 的场景。
### 为什么用 `.get()` 而非 `[]`？
- **`List` 是接口**，不保证连续存储（如 `LinkedList`），所以不能用 `[]` 语法。
- **数组 `Integer[]`**：可以用 `arr[j]`，但 `List` 必须用 `list.get(j)`。
- **设计差异**：
    Java 严格区分数组和集合，C++中 `std::vector` 重载了 `[]`，但 Java 的 `List` 没有。

### private constructor 警告
- 当类只包含静态方法（如你的 `Solution` 工具类）时，IDEA 建议：
    - 添加私有构造器：防止被意外实例化
    - 将类声明为 `final`：禁止继承
    - - 工具类不需要实例化，私有构造器是防御性编程手段
- 类似 C++中 `= delete`：
```cpp
class Solution {
public:
    Solution() = delete;  // 禁止构造
};
```
### 测试类 static 警告
**类名以 `Test` 结尾**：IDEA 默认会将 `*Test` 结尾的类视为测试类（即使没有注解）
## 程序 3
- Java 的 doxygen 写法和 C++一样，各种标签都一样，并且可 javadoc 命令生成文档
### Java 中类实例化
| 特性    | Java                              | C++                                                   |
| ----- | --------------------------------- | ----------------------------------------------------- |
| 实例化语法 | `ClassName obj = new ClassName()` | `ClassName obj;` 或 `ClassName* ptr = new ClassName()` |
| 内存管理  | 自动垃圾回收                            | 需要手动管理                                                |
| 对象存储  | 堆内存                               | 栈或堆                                                   |
| 对象访问  | 通过引用                              | 直接或通过指针                                               |
| 析构方法  | 无，有 `finalize()` 但不推荐             | 有析构函数                                                 |
1. 当类只包含静态成员时，创建该类的实例没有实际意义
2. Java 会为没有显式构造方法的类提供默认的 public 无参构造方法，这可能导致其他开发人员错误地实例化这个工具类
3. **为什么 Java 设计所有成员都是 static 的类不应被实例化？**
	- **内存效率**：实例化纯静态类会创建无用的对象，浪费内存
	- **设计意图明确性**：工具类（如 `Math`、`Collections`）本质是函数集合，不是对象
	- **防止误用**：实例化后可能误导其他开发者以为该类有实例状态，可能违反单例模式（如果工具类意外维护了状态）
---
为什么 C++**不能这样设计**
C++采用不同的对象创建机制：
- 对象可以在栈上直接创建（不需要 new）
- 构造函数访问控制不影响栈上对象创建
- 因此 C++中构造函数只能是 public 的
### final 关键字
1. **修饰变量**：表示变量只能被赋值一次，不能被重新赋值，类似于 [[C++ Runoob Tutoral#const 的作用|const]]
2. **修饰方法**：表示方法不能被子类重写
3. **修饰类**：表示类不能被继承
会对程序产生下面优化：
4. **安全性**：防止变量被意外重新赋值
5. **线程安全**：`final` 变量在多线程环境下更安全
6. **代码清晰**：明确表达变量不应被修改的意图
7. **优化**：JVM 可能对 `final` 变量进行优化

|特性|Java final|C++ const|
|---|---|---|
|变量不可变| `final int x = 5;` | `const int x = 5;` |
|类不可继承| `final class A {}` |N/A (C++用 final 关键字)|
|方法不可覆盖| `final void m() {}` |N/A (C++用 final 关键字)|
- Java 的 `final` 可以修饰类、方法、变量。没有等价于 C++的 `const&` 参数传递机制
- C++的 `const` 主要修饰变量和方法（保证不修改成员）。`const` 是类型系统的一部分，更强大

### SonarQube 提示
**SonarQube** 是一个开源的代码质量管理平台，主要用于：
- 静态代码分析
- 检测代码缺陷、漏洞和代码异味 (code smells)
- 提供代码质量报告
- 帮助团队维护代码健康度

---
下面的代码风格可能导致 SonarQube 出现提示
- 创建对象后，必须它执行某些操作
- 单纯创建对象而不它会被视为代码冗余
- 检测未的局部变量
- 认为这是代码冗余，可能影响代码质量
- 一个类中所有方法都是静态的，不需要实例化，出现信息：`**java:S2440 - Remove this instantiation of "SolutionTest"**`
- 通过实例调用静态方法 `**java:S2209 - Change this instance-reference to a static reference**`

## 程序 4
### 2. Java 中修改 Map 值的正确方式
情况 1：直接覆盖值（对应 C++的 `map[key] = value`）
```java
map.put(n, newValue);  // 无论键是否存在都会覆盖
```
情况 2：条件修改（键必须存在）
```java
if (map.containsKey(n)) {    map.put(n, map.get(n) + 1);  // 相当于C++的map[n]++}
```
情况 3：智能合并（推荐方式）
```java
// Java 8+ 最佳实践
map.merge(n, 1, Integer::sum); // 等效于：
// 如果键不存在 → 插入(n,1)// 如果键存在 → 旧值 + 1
```
情况 4：原子性操作（线程安全场景）
```java
ConcurrentHashMap<Integer, Integer> map = new ConcurrentHashMap<>();
map.compute(n, (k, v) -> (v == null) ? 1 : v + 1);
```
## 程序 7
### 数组和初始化
#### 1. 将多个常量 `int` 值添加到 `List<Integer > ` 中
#####  `Arrays.asList()` 方法
```java
List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);
```
- **特点**：
- 返回一个固定大小的 `List`，不能修改（不能 `add` 或 `remove`）。
- 适用于初始化后不需要修改的列表。

#####  `new ArrayList<>(Arrays.asList())`
```java
List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));
```
- **特点**：
- 返回一个可修改的 `ArrayList`，可以动态增删元素。

#####  Java 9 + 的 `List.of()`
```java
List<Integer> list = List.of(1, 2, 3, 4, 5);
```
- **特点**：
- 返回一个不可变的 `List`（Java 9 + 支持）。
- 性能比 `Arrays.asList()` 更好。

#####  `Collections.addAll()`
```java
List<Integer> list = new ArrayList<>();
Collections.addAll(list, 1, 2, 3, 4, 5);
```
- **特点**：
- 适用于动态添加元素到已有 `List`。

-- -
#### 2. 将多个常量 `int` 值转换为 `int[]` 数组
##### 直接初始化数组
```java
int[] arr = { 1, 2, 3, 4, 5 };
```
- **特点**：
- 最简洁的方式，适用于已知所有元素的情况。

#####  `Arrays.stream()` 转换
```java
int[] arr = Arrays.stream(new int[] {1, 2, 3, 4, 5}).toArray();
```
- **特点**：
- 适用于需要动态计算或转换的情况。

#####  `IntStream.of()`
```java
int[] arr = IntStream.of(1, 2, 3, 4, 5).toArray();
```
- **特点**：
- 适用于 Java 8 + ，支持流式操作。

-- -
#### 3. 从 `List<Integer > ` 转换为 `int[]`
```java
List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);
int[] arr = list.stream().mapToInt(Integer::intValue).toArray();
```
- **特点**：
- 适用于需要从 `List` 转换到 `int[]` 的情况。

-- -
#### 4. 从 `int[]` 转换为 `List<Integer > `
```java
int[] arr = { 1, 2, 3, 4, 5 };
List<Integer> list = Arrays.stream(arr).boxed().collect(Collectors.toList());
```
- **特点**：
- 适用于需要从 `int[]` 转换到 `List` 的情况。

-- -
#### 5. 综合示例
```java
import java.util.*;
import java.util.stream.*;
public class Main {
    public static void main(String[] args) {
        // 1. 初始化 List<Integer>
        List<Integer> list1 = Arrays.asList(1, 2, 3, 4, 5);
        List<Integer> list2 = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));
        List<Integer> list3 = List.of(1, 2, 3, 4, 5);
        // 2. 初始化 int[]
        int[] arr1 = { 1, 2, 3, 4, 5 };
        int[] arr2 = IntStream.of(1, 2, 3, 4, 5).toArray();
        // 3. List<Integer> 转 int[]
        int[] arr3 = list1.stream().mapToInt(Integer::intValue).toArray();
        // 4. int[] 转 List<Integer>
        List<Integer> list4 = Arrays.stream(arr1).boxed().collect(Collectors.toList());
        System.out.println("List1: " + list1);
        System.out.println("Arr1: " + Arrays.toString(arr1));
    }
}
```
** 输出** ：
```
List1: [1, 2, 3, 4, 5]
Arr1 : [1, 2, 3, 4, 5]
```

-- -
#### 6. 总结
| 操作                            | 方法                                                                 | 适用场景            |
| ----------------------------- | ------------------------------------------------------------------ | --------------- |
| **初始化 `List<Integer>`**       | `Arrays.asList()`, `new ArrayList<>(Arrays.asList())`, `List.of()` | 需要快速初始化不可变或可变列表 |
| **初始化 `int[]`**               | `int[] arr = { 1, 2, 3 }`, `IntStream.of(1, 2, 3).toArray()`       | 需要快速初始化数组       |
| **`List<Integer>` 转 `int[]`** | `list.stream().mapToInt(Integer::intValue).toArray()`              | 需要将列表转换为数组      |
| **`int[]` 转 `List<Integer>`** | `Arrays.stream(arr).boxed().collect(Collectors.toList())`          | 需要将数组转换为列表      |
#### 推荐方法
- **初始化 `List<Integer > `* * ：`List.of()`（Java 9 + ）或 `new ArrayList<>(Arrays.asList())`。
- **初始化 `int[]`** ：直接初始化 `int[] arr = { 1, 2, 3 }`。
- **转换**： `stream()` 进行 `List` 和 `int[]` 之间的转换。

-- -
#### 7. 常见问题
##### (1) `Arrays.asList()` 和 `List.of()` 的区别？
| 方法                | 可变性        | 是否允许 `null` | Java 版本    |
| ----------------- | ---------- | ----------- | ---------- |
| `Arrays.asList()` | 固定大小（不可增删） | 允许 `null`   | Java 1.2 + |
| `List.of()`       | 完全不可变      | 不允许 `null`  | Java 9 +   |
##### 为什么 `Arrays.asList()` 返回的 `List` 不能修改？
- 它返回的是基于数组的 `List`，底层仍是数组，所以不能改变大小（不能 `add` 或 `remove`）。

##### 如何动态添加多个元素到 `List`？
```java
List<Integer> list = new ArrayList<>();
Collections.addAll(list, 1, 2, 3, 4, 5);
```
或者：
```java
list.addAll(Arrays.asList(1, 2, 3, 4, 5));
```

-- -
#### 8. 最佳实践
- **优先 `List.of()`* * （Java 9 + ）或 `Arrays.asList()` 初始化不可变列表。
- **需要可变列表时， `new ArrayList<>(Arrays.asList())`* * 。
- **数组初始化优先直接赋值 `int[] arr = { 1, 2, 3 }`* * 。
- **转换时 `stream()` 方法** ，代码更简洁。

-- -
#### 9. 代码示例
```java
import java.util.*;
import java.util.stream.*;
public class Main {
    public static void main(String[] args) {
        // 1. 初始化 List<Integer>
        List<Integer> list1 = List.of(1, 2, 3, 4, 5); // Java 9+
        List<Integer> list2 = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));
        // 2. 初始化 int[]
        int[] arr1 = { 1, 2, 3, 4, 5 };
        int[] arr2 = IntStream.of(1, 2, 3, 4, 5).toArray();
        // 3. List<Integer> 转 int[]
        int[] arr3 = list1.stream().mapToInt(Integer::intValue).toArray();
        // 4. int[] 转 List<Integer>
        List<Integer> list3 = Arrays.stream(arr1).boxed().collect(Collectors.toList());
        System.out.println("List1: " + list1);
        System.out.println("Arr1: " + Arrays.toString(arr1));
    }
}
```
** 输出** ：
```
List1: [1, 2, 3, 4, 5]
Arr1 : [1, 2, 3, 4, 5]
```

-- -
#### 10. 总结
- **`List<Integer > ` 初始化**：`Arrays.asList()`, `List.of()`, `new ArrayList<>()`。
- **`int[]` 初始化** ：`int[] arr = { 1, 2, 3 }`, `IntStream.of().toArray()`。
- **转换**：`stream().mapToInt().toArray()` 和 `Arrays.stream().boxed().collect(Collectors.toList())`。

通过以上方法，你可以轻松地在 `List<Integer > ` 和 `int[]` 之间转换，并快速初始化多个常量值。
### 哈希表和初始化
#### 各种哈希表类型
| 类                     | 特点                     | 适用场景       |
| --------------------- | ---------------------- | ---------- |
| **HashMap**           | 无序，线程不安全，允许 `null` 键/值 | 快速查找，无并发需求 |
| **LinkedHashMap**     | 保持插入顺序或访问顺序            | 需要有序遍历     |
| **TreeMap**           | 按键排序，红黑树实现             | 需要排序       |
| **ConcurrentHashMap** | 线程安全，分段锁优化             | 高并发环境      |
| **Hashtable**         | 线程安全，全表锁，不允许 `null`    | 旧代码兼容      |
1. **HashMap**

    - 最常用，基于哈希表实现。
    - 查找/插入/删除平均时间复杂度为 O (1)。
    - 无序，线程不安全。
2. **LinkedHashMap**

    - 继承自 `HashMap`，维护双向链表记录顺序。
    - 支持按插入顺序或访问顺序遍历。
3. **TreeMap**

    - 基于红黑树实现，按键排序。
    - 查找/插入/删除时间复杂度 O (log n)。
4. **ConcurrentHashMap**

    - 线程安全，分段锁减少锁竞争。
    - 高并发场景首选。
5. **Hashtable**

    - 线程安全但性能差，全表锁。
    - 遗留类，不推荐使用。
#### 1. 如何在创建哈希表的同时初始化内容？
在 Java 中，可以使用**双括号初始化（Double Brace Initialization）**或**Java 9 + 的 `Map.of()` / `Map.ofEntries()`* * 方法直接初始化 `HashMap`。
##### 双括号初始化
```java
Map<String, Integer> map = new HashMap<>() {
    {
        put("Alice", 25);
        put("Bob", 30);
        put("Charlie", 35);
    }
};
```
- **缺点**：
- 会创建一个匿名子类，可能影响序列化。
- 性能稍差（每次初始化都会生成一个新类）。

##### Java 9 + 的 `Map.of()`
```java
Map<String, Integer> map = Map.of(
    "Alice", 25,
    "Bob", 30,
    "Charlie", 35
);
```
- **特点**：
- 适用于**少量键值对**（最多 10 个，因 `Map.of()` 有参数限制）。
- 返回的是**不可变 Map**（不能修改）。

##### Java 9 + 的 `Map.ofEntries()`
```java
Map<String, Integer> map = Map.ofEntries(
    Map.entry("Alice", 25),
    Map.entry("Bob", 30),
    Map.entry("Charlie", 35)
);
```
- **特点**：
- 适用于**任意数量的键值对**。
- 返回的也是**不可变 Map**。

##### 使用 `Stream` + `Collectors.toMap()`
```java
Map<String, Integer> map = Stream.of(
    new AbstractMap.SimpleEntry<>("Alice", 25),
    new AbstractMap.SimpleEntry<>("Bob", 30),
    new AbstractMap.SimpleEntry<>("Charlie", 35)
).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
```
- **特点**：
- 适用于动态构建 Map。
- 返回的是**可变 Map**。

-- -
#### 2. Java 容器的初始化方式
Java 的集合类（如 `List`, `Set`, `Map`）通常有**多种初始化方式**：

| 容器类型 | 初始化方式 | 示例 |
|---------- | ------------ | ------|
| **`List`* * | `Arrays.asList()`, `List.of()`, `new ArrayList<>(List.of())` | `List<String > list = List.of("A", "B");` |
| **`Set`* * | `Set.of()`, `new HashSet<>(Arrays.asList())` | `Set<String > set = Set.of("A", "B");` |
| **`Map`* * | `Map.of()`, `Map.ofEntries()`, 双括号初始化 | `Map<String, Integer > map = Map.of("A", 1);` |
**通用规律**：
- **不可变集合**：`List.of()`, `Set.of()`, `Map.of()`（Java 9 + ）。
- **可变集合**：通过构造函数传入初始数据，如 `new ArrayList<>(List.of(...))`。

-- -
#### 3. 为什么 `Map<String, Integer > map = new HashMap<>();` 左边用 `Map`，右边用 `HashMap`？
这是** 面向接口编程（Interface - based Programming）**的体现：
- **`Map` 是接口**，`HashMap` 是它的一个实现。
- **`TreeMap`、`ConcurrentHashMap` 也是 `Map` 的实现**，但底层数据结构不同：
- `HashMap`：哈希表（无序，O (1) 查询）。
- `TreeMap`：红黑树（按 key 排序，O (log n) 查询）。
- `ConcurrentHashMap`：线程安全的哈希表。

##### 为什么这样设计？
1.**灵活性**：可以随时替换实现，例如：
```java
Map<String, Integer> map = new HashMap<>();  // 今天用 HashMap
map = new TreeMap<>();                       // 明天换成 TreeMap
```
而客户端代码（使用 `map` 的地方）不需要修改。
2.**遵循依赖倒置原则（DIP）**：
- 高层模块（业务逻辑）不应该依赖低层模块（`HashMap`），而是依赖抽象（`Map`）。

3.**多态**：可以通过接口统一操作不同的实现。
##### 示例：`Map` 的不同实现
```java
Map<String, Integer> hashMap = new HashMap<>();  // 哈希表实现
Map<String, Integer> treeMap = new TreeMap<>();  // 红黑树实现
Map<String, Integer> concurrentMap = new ConcurrentHashMap<>();  // 线程安全实现
```
尽管底层实现不同，但它们的** 方法签名（如 `put()`, `get()`）由 `Map` 接口统一规定** ，因此可以互换。

-- -
#### 4. 为什么泛型 `String, Integer` 在左边的 `Map` 中声明？
- **泛型是类型声明的一部分**，而**变量类型（`Map`）**决定了它能调用的方法。
- **右侧的 `new HashMap<>()` 使用了类型推断（Diamond Operator `< > `）**：
- Java 编译器会根据左侧的泛型类型自动推断右侧的泛型。
- 等价于 `new HashMap<String, Integer>()`，但更简洁。

##### 示例：类型推断
```java
Map<String, Integer> map = new HashMap<>();  // 推断为 HashMap<String, Integer>
```
如果写成：
```java
HashMap<String, Integer> map = new HashMap<>();  // 也可以，但灵活性降低
```
- 此时 `map` 的类型是 `HashMap` 而不是 `Map`，后续无法直接替换为 `TreeMap`。

-- -
#### 5. 总结
| 问题 | 解决方案 | 关键点 |
|------ | ---------- | --------|
| **初始化 `HashMap`* * | `Map.of()`, `Map.ofEntries()`, 双括号初始化 | Java 9 + 推荐 `Map.of()` |
| **容器初始化通用方法**| `List.of()`, `Set.of()`, `Map.of()` | 不可变集合 |
| **`Map` 接口 vs 实现类**| `Map<String, Integer > map = new HashMap<>();` | 面向接口编程，灵活替换实现 |
| **泛型声明位置**| 左侧 `Map` 定义泛型，右侧 `< > ` 自动推断 | 类型安全，代码简洁 |
#### 最佳实践
1.**优先使用 `Map.of()` 或 `Map.ofEntries()`* * 初始化不可变 Map（Java 9 + ）。
2.**需要可变 Map 时**：
```java
Map<String, Integer> map = new HashMap<>(Map.of("A", 1, "B", 2));
```
3.**变量类型声明为 `Map`* * （而非 `HashMap`），以提高代码灵活性。
4.**理解接口与实现的关系**：`Map` 是规范，`HashMap` / `TreeMap` 是具体实现。

-- -
#### 代码示例
```java
import java.util.*;
public class Main {
    public static void main(String[] args) {
        // 1. 初始化 Map（Java 9+）
        Map<String, Integer> map1 = Map.of("Alice", 25, "Bob", 30);
        Map<String, Integer> map2 = Map.ofEntries(
            Map.entry("Alice", 25),
            Map.entry("Bob", 30)
        );
        // 2. 转换为可变 Map
        Map<String, Integer> mutableMap = new HashMap<>(map1);
        // 3. 面向接口编程
        Map<String, Integer> map = new HashMap<>();  // 今天用 HashMap
        map = new TreeMap<>();                       // 明天换成 TreeMap
        System.out.println(map1);
        System.out.println(mutableMap);
    }
}
```
** 输出** ：
```
{Alice = 25, Bob = 30}
{ Alice = 25, Bob = 30 }
```
## 程序 14
### 修改数组中元素
| 数据结构          | 修改方法                             | 示例                                           |
| ------------- | -------------------------------- | -------------------------------------------- |
| **数组**        | `array[index] = newValue`        | `arr[1] = 20`                                |
| **List**      | `list.set(index, newValue)`      | `list.set(2, 30)`                            |
| **ArrayList** | `arrayList.set(index, newValue)` | `arrayList.set(3, 40)`                       |
| **不可变 List**  | 不能修改大小，但可修改元素                    | `fixedList.set(1, 20)`                       |
| **Stream**    | `map()` + `collect()`            | `list.stream().map(n -> n * 2).collect(...)` |
## 程序 31
初始化数组方法：
```java
List<Integer> arr = Arrays.asList(12,43,12,2,32,2,57,8);
```
排序数组方法

|方法|是否修改原 List|适用场景|代码简洁性|
|---|---|---|---|
| `Collections.reverse()` |✅ 修改|任意 List|⭐⭐⭐|
| `Stream.sorted(reverseOrder)` |❌ 不修改|可排序 List|⭐⭐|
| `IntStream.range()` 反向索引|❌ 不修改|任意 List|⭐⭐|
| `Collectors.toList()` + `reverse` |❌ 不修改|需要新 List|⭐⭐|
| `LinkedList.descendingIterator()` |❌ 不修改|仅 `LinkedList` |⭐⭐⭐|
## 常用操作
### 排序
| 操作                  | 方法                                                             | 示例代码                                |
| ------------------- | -------------------------------------------------------------- | ----------------------------------- |
| **ArrayList 排序**    | `Collections.sort(list)`                                       | `Collections.sort(list)`            |
| **ArrayList 自定义排序** | `list.sort(Comparator)` 或 `Collections.sort(list, Comparator)` | `list.sort((a, b) -> b - a)`        |
| **数组排序**            | `Arrays.sort(arr)`                                             | `Arrays.sort(arr)`                  |
| **数组自定义排序**         | `Arrays.sort(arr, Comparator)`（只适用对象数组）                        | `Arrays.sort(arr, (a, b) -> b - a)` |
# 杂项
| 容器类            | 默认布局管理器           | 特点               |
| -------------- | ----------------- | ---------------- |
| `JFrame`（内容面板） | `BorderLayout`    | 五大区域（北、南、东、西、中）  |
| `JWindow`      | `BorderLayout`    | 类似 JFrame        |
| `JDialog`      | `BorderLayout`    | 用于弹窗             |
| `JScrollPane`  | `BorderLayout`    | 特殊用途容器           |
| `JRootPane`    | `BorderLayout`    | 通常用于 JFrame 内部结构 |
| `JPanel`       | `FlowLayout`      | 简单排列，适合嵌套        |
| `JApplet`      | `FlowLayout`      | 旧版本常用            |
| `JToolBar`     | `FlowLayout`      | 工具栏              |
| `JTabbedPane`  | `CardLayout`      | 切换卡片式界面          |
| `JLayeredPane` | `null`（无布局，即绝对布局） | 分层显示组件           |


🔹1. 是否除 static 内部类外，不能在类内部声明 static 成员？

✅ 不完全是。Java 中类内部可以声明多种 `static` 成员，包括：

- `static` 变量（静态变量）
- `static` 方法（静态方法）
- `static` 块（静态初始化块）
- `static` 内部类（静态嵌套类）

✅ 示例：

```java
public class MyClass {

    // 静态变量
    static int count = 0;

    // 静态方法
    static void showCount() {
        System.out.println("Count: " + count);
    }

    // 静态内部类
    static class StaticInner {
        void display() {
            System.out.println("Static inner class");
        }
    }

    // 静态初始化块
    static {
        System.out.println("Static block executed.");
    }

    public static void main(String[] args) {
        MyClass.showCount();

        StaticInner inner = new StaticInner();
        inner.display();
    }
}
```

❗注意：

- **非静态内部类（普通内部类）中不能有静态成员**（变量或方法），除非它是 `static final` 常量。

```java
class Outer {
    class Inner {
        // ❌ 编译错误：非静态内部类不能有静态成员
        static int x = 10;
    }
}
```

---

🔹2. 在 Java 8 及以后版本中，接口中是否只能有 `static` 方法和 `default` 方法才能有方法体？

✅ 是的，从 Java 8 开始，接口可以包含以下几种方法：

| 方法类型 | 是否可以有方法体 | Java 版本 | 说明 |
|----------|------------------|-----------|------|
| 抽象方法 | ❌ 没有方法体 | Java 1.0+ | 默认就是 public abstract |
| `default` 方法 | ✅ 有方法体 | Java 8+ | 默认实现，用于向后兼容 |
| `static` 方法 | ✅ 有方法体 | Java 8+ | 接口级别的静态方法 |
| `private` 方法 | ✅ 有方法体 | Java 9+ | 用于辅助 `default` 或 `static` 方法 |
| `private static` 方法 | ✅ 有方法体 | Java 9+ | 用于辅助静态方法 |

✅ 示例：Java 8 接口中 `default` 和 `static` 方法

```java
interface MyInterface {
    // 抽象方法
    void sayHello();

    // default 方法（有方法体）
    default void sayDefault() {
        System.out.println("Default method");
    }

    // static 方法（有方法体）
    static void sayStatic() {
        System.out.println("Static method");
    }
}
```

✅ 实现类：

```java
class MyClass implements MyInterface {
    @Override
    public void sayHello() {
        System.out.println("Hello from MyClass");
    }
}
```

✅ 使用：

```java
public class Main {
    public static void main(String[] args) {
        MyClass obj = new MyClass();
        obj.sayHello();      // Hello from MyClass
        obj.sayDefault();    // Default method
        MyInterface.sayStatic(); // Static method
    }
}
```

---

🔹3. 接口能否使用 `abstract` 关键字？

✅ 可以，但不是必须的。

- 接口本身就是抽象的；
- 从 Java 9 开始，接口可以有 `private` 方法、`default` 方法、`static` 方法；
- 所以 `abstract` 关键字在接口中可以加，但**通常省略**。

✅ 示例：

```java
abstract interface Animal {
    void speak();
}
```

或者：

```java
interface Animal {
    void speak();
}
```

❗注意：

- Java 9 之前，接口默认就是 `abstract`；
- Java 9+ 中，接口可以包含默认方法和静态方法，但接口本身仍是 `abstract` 的；
- 你不能使用 `final interface`，因接口不能被 `final` 修饰。

---

🔹4. `Scanner`、`System.in` 和 `BufferedReader` 分别怎么用？有什么不同？

📌 三者的关系：

- `System.in` 是标准输入流（`InputStream` 类型）；
- `Scanner` 和 `BufferedReader` 都是**包装类**，用于读取 `System.in` 的内容；
- 但它们的使用方式和适用场景不同。

---

✅ 1. `System.in`（原始输入流）

- 是 `InputStream` 类型；
- 通常不直接使用，而是包装成 `BufferedReader` 或 `Scanner`。

```java
InputStream input = System.in;
int data = input.read(); // 读取一个字节
```

---

✅ 2. `Scanner`（适合读取基本类型和简单输入）

- 简单易用，适合读取用户输入的数字、字符串等；
- 支持按类型读取（如 `nextInt()`, `nextLine()`）；
- 适用于控制台交互式程序。

示例：

```java
import java.util.Scanner;

public class ScannerExample {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter your name: ");
        String name = scanner.nextLine();  // 读取一行字符串

        System.out.print("Enter your age: ");
        int age = scanner.nextInt();       // 读取一个整数

        System.out.println("Name: " + name);
        System.out.println("Age: " + age);

        scanner.close();
    }
}
```

---

✅ 3. `BufferedReader`（适合读取文本行）

- 用于读取字符输入流，效率更高；
- 通常配合 `InputStreamReader` 使用；
- 适合读取大量文本数据或按行处理；
- 需要手动处理异常（IOException）；
- 不支持直接读取基本类型。

示例：

```java
import java.io.*;

public class BufferedReaderExample {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));

        System.out.print("Enter your name: ");
        String name = reader.readLine();  // 读取一行

        System.out.print("Enter your age: ");
        int age = Integer.parseInt(reader.readLine());  // 转为整数

        System.out.println("Name: " + name);
        System.out.println("Age: " + age);

        reader.close();
    }
}
```
如果需要读取单个字符，单个数据，参考：
```java
BufferedReader bf = new BufferedReader(new InputStreamReader(System.in));
int a = Integer.parseInt(bf.readLine());
char c = (char)bf.read();
```

🔍 对比总结

| 特性 | `Scanner` | `BufferedReader` |
|------|------------|------------------|
| 所属包 | `java.util` | `java.io` |
| 读取方式 | 按类型读取（`nextInt()`, `nextLine()`） | 按行读取（`readLine()`） |
| 性能 | 较慢 | 更快，适合大量输入 |
| 是否需要关闭 | 是（`scanner.close()`） | 是（`reader.close()`） |
| 是否支持正则表达式 | ✅ 支持 | ❌ 不支持 |
| 是否支持直接读取基本类型 | ✅ 支持 | ❌ 需要手动转换 |
| 是否抛出异常 | ❌ 不抛出 | ✅ 抛出 `IOException` |

---

✅ 什么时候用哪个？

| 场景              | 推荐使用                               |
| --------------- | ---------------------------------- |
| 控制台交互（读取数字、字符串） | `Scanner`                          |
| 读取大量文本、按行处理     | `BufferedReader`                   |
| 读取二进制数据         | `InputStream`（如 `FileInputStream`） |

---

📌 总结

| 问题 | 回答 |
|------|------|
| 类内部是否只能在 static 内部类中声明 static 成员？ | ❌ 不是，类中可以声明 static 变量、方法、块、静态内部类 |
| 接口中是否只能有 `static` 和 `default` 方法才能有方法体？ | ✅ 是的（Java 8+） |
| 接口能否使用 `abstract` 关键字？ | ✅ 可以，但接口本身就是抽象的，关键字可省略 |
| `Scanner` vs `BufferedReader` | `Scanner` 更简单，`BufferedReader` 更高效 |

---

如果你还想了解这些输入方式的性能差异、或者如何处理输入异常，也可以继续问我 😊
内部类的访问控制权限可以使 private 或者默认，不能是 protect 或者

面向对象编程顺序：面向分析 OOA-->面向设计 OOD-->面向对象 OOP

| 数据类型      | 大小（字节）               | 描述                          |
| --------- | -------------------- | --------------------------- |
| `byte`    | 1 字节                 | 有符号整数，范围：-128 ~ 127         |
| `short`   | 2 字节                 | 有符号整数，范围：-32768 ~ 32767     |
| `int`     | 4 字节                 | 有符号整数，默认整型                  |
| `long`    | 8 字节                 | 有符号整数，需加 `L` 后缀，如 `100L`    |
| `float`   | 4 字节                 | 单精度浮点数，需加 `F` 后缀，如 `3.14F`  |
| `double`  | 8 字节                 | 双精度浮点数，默认浮点型                |
| `char`    | 2 字节                 | 无符号 Unicode 字符，范围：0 ~ 65535 |
| `boolean` | 1 位（但通常 JVM 中用 1 字节） | 只有两个值：`true` 或 `false`      |

java 中 main 方法一定要有 `String[] args` 作为参数

继承 Applet 的类必须要实现 `actionPerformed` 方法

接口中只能包含 `static` 方法和 `default` 方法才有方法体？**普通方法不能有方法体**

下列关于构造方法的说法**不正确**的是（）
A、Java 语言规定构造方法名必须与类名相同
B、Java 语言规定构造方法没有返回值，且不用 void 关键字声明
**C、构造方法不可以重载**
D、构造方法只能用 new 关键字来创建

java 的类末尾不需要分号
instanceof 用来比较类对象类型
```java
public static void show(Animal a) {
    a.eat();
    // 类型判断
    if (a instanceof Cat) { // 猫做的事情
        Cat c = (Cat) a;
        c.work();
    } else if (a instanceof Dog) { // 狗做的事情
        Dog c = (Dog) a;
        c.work();
    }
}
```
写在同一目录下的两个文件，如果没有有声明 package 所属，不需要 import，Java 会自动识别同一包中类
java 中方法重载满足下面任意 1 个要求
- **参数类型不同**：`void foo(int a)` vs `void foo(String a)`
- **参数个数不同**：`void foo(int a)` vs `void foo(int a, int b)`
- **参数顺序不同**（如果类型不同）：`void foo(int a, String b)` vs `void foo(String a, int b)`

| 情况     | 示例                                                                  | 是否合法   |
| ------ | ------------------------------------------------------------------- | ------ |
| 仅返回值不同 | `int foo()` vs `String foo()`                                       | ❌ 编译错误 |
| 仅修饰符不同 | `public void foo()` vs `private void foo()`                         | ❌ 编译错误 |
| 异常列表不同 | `void foo() throws IOException` vs `void foo() throws SQLException` | ❌ 编译错误 |
访问器方法：
的，在 Java 中，**访问器方法（Accessor Methods）** 通常指的是对 **`private` 成员字段** 进行 **读取（getter）** 和 **修改（setter）** 的方法，它们属于 **封装（Encapsulation）** 的核心实践

| 类型                 | 方法名格式          | 示例                     |
| ------------------ | -------------- | ---------------------- |
| **getter**         | `get<Field>()` | `getName()`            |
| **setter**         | `set<Field>()` | `setName(String name)` |
| **boolean getter** | `is<Field>()`  | `isStudent()`          |
继承规则

| **访问修饰符**                | **能否被继承？**                | **子类访问方式**                                 |
| ------------------------ | ------------------------- | ------------------------------------------ |
| **`public`**             | ✔️ **是**                  | 可直接访问（`subclass.method()`）                 |
| **`protected`**          | ✔️ **是**                  | 可直接访问（`subclass.method()`）                 |
| 默认（包级 `package-private`） | ✔️ **是（同包）**，❌ **否（不同包）** | 仅同包可用                                      |
| **`private`**            | ❌ **否**                   | **不可访问**（但可通过父类 `public/protected` 方法间接访问） |
继承实例，注意写法 super
> 2. 按要求编写一个 Java 应用程序:
(1) 定义一个类，描述一个矩形，包含有长、宽两种属性，和计算面积方法。
(2) 编写一个类，继承自矩形类，同时该类描述长方体，具有长、宽、高属性，和计算体积的方法。
(3) 编写一个测试类，对以上两个类进行测试，创建一个长方体，定义其长、宽、高，输出其底面积和体积。

```java
class Rectangle {
    private double length; // 长
    private double width; // 宽
    public Rectangle(double length, double width) {
        this.length = length;
        this.width = width;
    }
    public double getArea() {
        return length * width;
    }
}
class Cuboid extends Rectangle {
    private double height;
    public Cuboid(double length, double width, double height) {
        super(length, width);
        this.height = height;
    }
    public double getVolume() {
        return getArea() * height;
    }
}
```
java 中表达式是从左到右执行的，`1+2+“aa” + 3` 的值为 `“3aa3”`
整数或者更高级的数据类型赋值给 `char` 类型会在编译时期报错
- 重写和重载的定义分别是什么？
**重写**（Override）：发生在子类与父类之间，子类重新定义父类中已有的方法，方法名、参数列表、返回类型必须相同（或兼容），访问权限不能更严格。用于实现多态。
**重载**（Overload）：发生在同一个类中，多个方法具有相同的名称但参数列表不同（参数个数、类型或顺序不同），返回类型可以不同。用于实现相同操作的不同形式。

---
- 是否一个文件的外部类只能使用public和默认两种修饰符，内部类呢？
是的，一个 `.java` 文件中只能有一个外部类（top-level class），它只能是 `public` 或默认（包私有），不能是 `private` 或 `protected`。内部类（inner class）可以使用 `public`、`protected`、`private` 或默认访问修饰符。
---
- java中，一个类的构造函数是否可以有返回值和修饰符？
构造函数不能有返回值类型（包括 `void`），但可以有访问修饰符（如 `public`、`protected`、`private`、默认），用于控制该构造函数的访问权限。
---
- 在两个没有关系和有继承关系的类对象使用强制类型转换时，判断是否能够转换的机制是什么？
Java 中强制类型转换（向下转型）只有在两个类之间存在继承关系时才可能成功。如果两个类没有继承关系，编译时就会报错。
运行时如果类型不匹配，会抛出 `ClassCastException`。

- 接口能否继承实体类？接口是如何实现多重继承的？
接口不能继承实体类（即 `class`），只能继承其他接口（**使用 `extends`**），并且可以继承多个接口，从而实现多重继承。
接口本身不包含状态（Java 8 之前），所以不能继承类。Java 9+ 中接口可以有私有方法，但仍不能继承类。

- 类中protect属性的成员是否能被同一包中不同类访问？
是的，`protected` 成员可以被：
- 同一个包中其他类访问；
- 不同包中子类访问（即使不在同一个包中）；
- 但不能被不同包中非子类访问。

---
- `BufferReader br = new BufferReader(new InputStream(System.in));`代码中，是否等号左边是一种声明变量的方法，即使写`BufferReader br`也是合法的？等号右边是实现，是用new创建对象，调起类的BufferReader构造函数(括号中又创建了InputStream对象并初始化，传入BufferReader对象的构造函数中)的方法？
是的，等号左边是声明一个 `BufferReader` 类型的引用变量 `br`，右边是创建对象的过程。
但注意：`InputStream` 是抽象类，不能直接 `new InputStream(System.in)`，应该使用 `InputStreamReader`：
```java
BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
```

---
- 假如我要声明一个数组，`int[] arr;` 这样的方式是否不会给 arr 分配内存，并且 arr 只会是一个基本数组类型不是对象，不能调用 `.length` 获取数组长度。而不会像 `int[] arr = new int[];` 一样得到一个数组类型对象对吗？

`int[] arr;` 只是声明了一个数组变量，没有分配内存，也没有创建数组对象，因此不能使用 `.length`。
`int[] arr = new int[5];` 或 `int[] arr = {1,2,3};` 才是创建数组对象，此时可以使用 `.length` 获取长度。
数组在 Java 中是对象，`int[] arr;` 是声明一个对象引用，初始值为 `null`。

---
- String 不是基本类型，为什么它可以在代码中不用导入直接定义，并且也不用使用 new 关键字创建对象就能使用？

`String` 是 Java 的标准类（`java.lang.String`），而 `java.lang` 包是默认导入的，所以不需要手动 `import`。
同时，Java 对 `String` 提供了语法糖支持，允许直接使用字符串字面量（如 `"Hello"`）创建对象，无需 `new String("Hello")`。

---
- import 语句是否一定要放在 java 文件的开头？

`import` 语句必须放在 **包声明之后、类定义之前**，不能放在类内部或文件顶部之前。
例如：
```java
package mypackage;
import java.util.List;  // ✅ 正确位置
public class MyClass { ... }
```


---
- `>>>` 是什么意思？`<<<` 呢？

`>>>` 是 Java 中 **无符号右移运算符**，将二进制位向右移动，高位补 0（不管符号位）。
`<<<` 不是 Java 的合法运算符。Java 有 `<<`（左移），但没有 `<<<`。

---
- this 和 super 是指针还是引用？

Java 中没有指针概念，`this` 和 `super` 是**引用**，分别指向当前对象和父类对象。
- `this`：当前对象的引用；
- `super`：父类对象的引用。

它们不能像 C/C++ 中指针那样进行地址运算。

---
- java 如何抛出异常？请举出例子

使用 `throw` 关键字抛出异常。
```java
public class TestException {
    public static void main(String[] args) {
        try {
            throw new IllegalArgumentException("参数错误");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```
你也可以抛出检查型异常（checked exception）或运行时异常（unchecked exception）。
- 如何使用 try-catch-finally？

`try-catch-finally` 用于处理异常并确保资源释放或最终操作执行。
```java
try {
    // 可能抛出异常的代码
} catch (ExceptionType1 e1) {
    // 处理异常
} catch (ExceptionType2 e2) {
    // 处理另一个异常
} finally {
    // 无论是否发生异常，都会执行（常用于关闭资源）
}
```
Java 7+ 支持 `try-with-resources`：
```java
try (FileInputStream fis = new FileInputStream("file.txt")) {
    // 使用 fis
} catch (IOException e) {
    e.printStackTrace();
} finally {
    // 可选
}
```
---
- 构造方法是否允许返回 void 类型？
构造方法 **不允许返回类型**，包括 `void`。它没有返回类型，甚至连 `void` 都不能写。
构造方法名必须与类名相同，且不能有返回类型。
- C\# 是不是编译型语言 ？它的运行是否需要虚拟机？

C# 是编译型语言，但不是编译为机器码的直接语言。
C# 编译为 **中间语言（IL）**，然后在 **. NET CLR（公共语言运行时）** 上运行，CLR 类似于 Java 的 JVM。
所以：C# 是编译型语言；

- 什么是保留字，什么是关键字？他们之间的区别是什么？

关键字（Keyword）：是 Java 语言中具有特殊含义的标识符，不能用作变量名、类名等。例如：`class`, `public`, `static`, `void` 等。

保留字（Reserved Word）：是语言规范中保留但目前未被使用的关键字，将来可能赋予特定含义。例如：`goto`, `const` 是保留字，但目前没有实际用途。

区别：关键字是当前已经被使用、具有特定功能的词；保留字是语言保留但尚未启用的词，两者都不能作为标识符使用。

---

- java.lang.Runnable和java.lang.Thread中是否都有run和start方法。创建一个线程的方法分别是什么？请你举出对应的例子

`Runnable` 接口：
- 只有 `run()` 方法；
- 没有 `start()` 方法。

`Thread` 类：
- 有 `run()` 方法（实现自 `Runnable`）；
- 有 `start()` 方法（用于启动线程）。

创建线程的两种主要方式：

1. **实现 `Runnable` 接口：**
```java
class MyRunnable implements Runnable {
    public void run() {
        System.out.println("Runnable thread running");
    }
}

// 使用 Thread 启动
Thread t = new Thread(new MyRunnable());
t.start();  // 启动线程
```

2. **继承 `Thread` 类并重写 `run()`：**
```java
class MyThread extends Thread {
    public void run() {
        System.out.println("Thread subclass running");
    }
}

// 启动线程
MyThread t = new MyThread();
t.start();
```

注意：只有调用 `start()` 才会真正启动线程；直接调用 `run()` 只是普通方法调用，不会创建新线程。

---

- 内部类的修饰符可以是什么？

内部类（Inner Class）可以使用以下修饰符：
- `public`、`protected`、`private`、默认（包私有）
- `static`（静态内部类）
- `final`、`abstract`（用于控制继承和实例化）
- `strictfp`（用于浮点运算的精度控制）

例如：
```java
public class Outer {
    public static class Inner4 {}  // 静态内部类
    private class Inner1 {}         // 私有内部类
    protected class Inner2 {}      // 受保护内部类
    class Inner3 {}                // 默认访问权限
}
```

---

- 静态方法中可以调用实例方法吗？静态方法是否只能调用其他静态方法，访问其他静态成员？静态方法如果要调用同类中静态方法，是否需要使用 this 关键字？

静态方法中 **不能直接调用实例方法或访问实例变量**，因它们依赖于对象实例。

静态方法只能直接访问：
- 静态变量；
- 静态方法；
- 不能使用 `this` 或 `super`。因这是实例才有的

如果要调用实例方法，必须先创建类的实例。

例如：
```java
class MyClass {
    int x = 10;
    static int y = 20;

    void instanceMethod() {
        System.out.println("Instance method");
    }

    static void staticMethod() {
        // instanceMethod(); ❌ 编译错误
        MyClass obj = new MyClass();
        obj.instanceMethod(); // ✅ 合法

        System.out.println(y); // ✅ 合法
        // System.out.println(x); ❌ 编译错误

        anotherStaticMethod(); // ✅ 合法
        // this.anotherStaticMethod(); ❌ 编译错误，不能在静态方法中使用 this
    }

    static void anotherStaticMethod() {
        System.out.println("Another static method");
    }
}
```

---

- 多态的表现是否体现在函数的重载和重写上？

多态（Polymorphism）主要体现在 **方法重写（Override）** 上，而不是重载（Overload）。

- **重写（Override）**：运行时多态，子类重写父类方法，根据对象的实际类型决定调用哪个方法。
- **重载（Overload）**：编译时多态，方法名相同，参数不同，根据参数类型在编译时决定调用哪个方法。

例如：
```java
class Animal {
    void speak() { System.out.println("Animal speaks"); }
}

class Dog extends Animal {
    @Override
    void speak() { System.out.println("Dog barks"); }
}

Animal a = new Dog();
a.speak(); // 输出 "Dog barks"，运行时多态（重写体现）
```

---

- 抽象接口（java 8 之前）的方法访问修饰符是什么？如果不写访问修饰符默认是什么？

在 Java 8 之前，接口中方法默认是：
- `public abstract`（即使不写，也默认是 `public` 和 `abstract`）

例如：
```java
interface MyInterface {
    void doSomething(); // 默认是 public abstract
}
```

接口中不允许使用 `private` 或 `protected` 方法（Java 9+ 才允许 `private` 方法）。

---

- java 中构造方法是否可以重载？

是的，Java 中构造方法可以重载。

构造方法重载是指在同一个类中定义多个构造方法，它们具有相同的名称（类名）但参数列表不同。

例如：
```java
class Person {
    String name;
    int age;

    // 无参构造方法
    Person() {
        this.name = "Unknown";
    }

    // 有参构造方法
    Person(String name) {
        this.name = name;
    }

    Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
}
```

通过不同参数调用不同的构造方法，实现对象的多种初始化方式。
```java
Person p1 = new Person();           // 调用无参构造
Person p2 = new Person("Tom");      // 调用一个参数的构造
Person p3 = new Person("Jerry", 25); // 调用两个参数的构造
```

```java
class FrameInOut extends Frame implements ActionsListener{
	setLayout(new FlowLayout);
	input.addActionListener(this);
	output.addActionListener(this);
	setSize(300,200);
	show();
}
```
- 编译源程序
- 生成字节码
- 解释运行字节码

线程状态：新建状态，可运行状态，运行状态，祖册状态，终止状态

继承 Applet 类：
```java
public class Gh extends Applet implements ActionListener{
	.....

	public void actionPerformed(ActionEvent e){
		a = new Integer(tfd1.getText()).intValue();
	}
}
```

# 头歌考试
## 变量与数据类型
### 字符串不可变性
java 的 string 类型实例化得到的是一个指向字符串对象的引用变量
如果使用 `=` 对它重新赋值的操作是创建一个新的字符串对象，并将这个引用变量指向它，原字符串通过 gc 机制被回收。但 java 中**字符串对象本身是不可以被改变的**

| C++（以 std:: string 为例）       | Java（String 类）                       | 行为对照理解                                      |
| --------------------------- | ------------------------------------ | ------------------------------------------- |
| 支持 `s += "new"` 直接修改自身对象    | `String` 不能修改其自身，必须接受如拷贝的新对象         | 类似发生如 `j = s + "new";` 返回新的对象，`s` 自已还是 Hello |
| 提供 `append`, `insert` 改原字符串 | 无这些方法，在 `String` 上再也无法改变             | 要修改用 `StringBuilder` 中方法才对（这和 C++ 技术很相似）   |
| 使用 “字符串常量池”（Java 有）          | 类似 `String` 在 Java 中可复用相同值字符串，效果上性能高一些 |                                             |
### 运算符优先级
1. **单目运算符** (最高优先级之一)
    - `++` (前后缀)、`--` (前后缀)、`+` (正号)、`-` (负号)、`!`、`~`（先自增自减然后在运算）
2. **乘除类二元运算符**
    - `*`、`/`、`%`
3. **加减类二元运算符**
    - `+`、`-`（这里的 `+` 是加号，不是正号）
4. **三目运算符 `?:`** (几乎总是最低)

```java
int x = -a++ + ~b ? c : d--;
```
（答案是：`((- (a++)) + (~b)) ? c : (d--)`）
### java 局部作用域和 C++差异
| 语言       | `for` 循环变量作用域 | 是否允许遮蔽外部变量 | 设计理念            |
| -------- | ------------- | ---------- | --------------- |
| **C++**  | 仅限于循环内（局部）    | ✅ 允许遮蔽     | 灵活，方便编写短小局部代码   |
| **Java** | 整个方法/作用域      | ❌ 不允许同名变量  | 更严格，避免潜在错误和代码混淆 |
具体体现在：
java 中整个函数是一个局部作用域，其中循环，初始化部分不会单独作为一个作用域而是与外部共享，C++分的更细，允许遮蔽
### 默认修饰符
在 Java 中，如果类中不显式声明成员变量的可见性（即不使用 `public`、`private` 或 `protected` 修饰符），则该成员变量的默认可见性是 `包级私有（package-private）`（也叫 "默认访问权限"）。

|修饰符|类内部|同包|子类|其他包|
|---|---|---|---|---|
| `public` |✅|✅|✅|✅|
| `protected` |✅|✅|✅|❌|
|**`默认`** (不写)|✅|✅|❌|❌|
| `private` |✅|❌|❌|❌|
```java
class MyClass {
    int a;
    static int b;
    void fa(){
    }
    static void fb(){
    }
    public void m1(){
        System.out.println(a);    //位置1
        System.out.println(b);    //位置2
        fa();                     //位置3
        fb();                     //位置4
    }
    public static void m2(){
        System.out.println(a);    //位置5
        System.out.println(b);    //位置6
        fa();                    //位置7
        fb();                    //位置8
    }
}
```
上述代码会出错的位置有：（）
A、位置 1
B、位置 2
C、位置 3
D、位置 4
E、位置 5
F、位置 6
G、位置 7
错误的原因是，在静态方法中访问实例成员时，需要先创建类的实例。而非静态变量

| 特性       | 非静态变量（实例变量）       | 静态变量（类变量）            |
| -------- | ----------------- | -------------------- |
| **修饰符**  | 无 `static`        | 有 `static`           |
| **访问方式** | 必须通过对象访问（`obj.a`） | 类名或对象均可（`MyClass.b`） |
| **内存分配** | 每个对象独立一份          | 全局共享一份               |
| **生命周期** | 对象创建时分配，销毁时回收     | 类加载时分配，程序结束时回收       |
静态方法不能直接调用其他类中普通方法
![[Pasted image 20250628144922.png|350]]
可以使用 `static {}` 创建静态代码块
## 封装，继承和多态
### 封装
构造一个类，把对象的属性封装起来，同时提供一些可以被外界访问属性的方法。
### 继承
- 子类拥有父类非 private 的属性和方法；
 - 子类可以拥有自己的属性和方法，即子类可以对父类进行扩展；
- 子类可以用自己的方式实现父类的方法；

子类实例化时的行为：
> 子类对象在实例化时会默认先去调用父类中无参构造方法，之后再调用本类中相应构造方法

```java
class Student extends Person{
    String school ;
    // 子类的构造方法
    public Student(){
        super() ; //实际上在程序的这里隐含了这样一条语句
        System.out.println("2.public Student(){}");
    }
}
```
- 如果子类的构造方法中没有通过 super 显示调用父类的有参构造方法，也没有通过 this 显示调用自身的其他构造方法，则系统会默认先调用父类的无参构造方法。在这种情况下写不写 super () 语句效果都是一样；
- 如果子类的构造方法中通过 super 显示调用父类的有参构造方法，那将执行父类相应构造方法，而不执行父类无参构造方法；
- 如果子类的构造方法中通过 this 显示调用自身的其他构造方法，在相应构造方法中应用以上两条规则；
- 特别注意的是，如果存在多级继承关系，在创建一个子类对象时，以上规则会多次向更高一级父类应用，一直到执行顶级父类 Object 类的无参构造方法为止。
### 多态
多态的三个条件:
- 继承的存在 (继承是多态的基础，没有继承就没有多态)；
- 子类重写父类的方法 (多态下调用子类重写的方法)；
- 父类引用变量指向子类对象 (子类到父类的类型转换)。
子类转换成父类时的规则:
将一个父类的引用指向一个子类的对象，称为向上转型 (upcasting)，自动进行类型转换。此时通过父类引用调用的方法是子类覆盖或继承父类的方法，不是父类的方法。此时通过父类引用变量无法调用子类特有的方法；
如果父类要调用子类的特有方法就得将一个指向子类对象的父类引用赋给一个子类的引用，称为向下转型，此时必须进行强制类型转换。

---
在 Java 中有两种形式可以实现多态：继承和接口。
## 重写
重写的方法不能比被重写的方法有更严格的访问权限;
重写的方法不能比被重写的方法产生更多的异常

---
方法重载是一个类中定义了多个方法名相同，而他们的参数的数量不同或数量相同而类型和次序不同，则称为方法的重载；
方法重写是在子类存在方法与父类的方法的名字相同而且参数的个数与类型一样，返回值也一样的方法，就称为方法的重写；
方法重载是一个类的多态性表现，而方法重写是子类与父类的一种多态性表现。
## 抽象类
抽象类的定义规则：
- 抽象类和抽象方法都必须用 abstract 关键字来修饰；
- 抽象类不能被实例化，也就是不能用 new 关键字去产生对象；
- 抽象方法只需声明，而不需实现；
- 含有抽象方法的类必须被声明为抽象类，抽象类的子类必须复写所有的抽象方法后才能被实例化，否则这个子类还是个抽象类。
抽象类的出现是为了解决：
1. 解决“继承的规范性问题”
2. **提供**“部分实现”**，强制子类实现特定方法
	- 抽象类可以包含**具体方法（有实现）**和**抽象方法（没有实现）**。
	- **抽象方法**只有声明没有实现，强制子类必须重写（否则子类也得是抽象类）。
	- 适用于父类知道子类必须做什么，但不知道具体怎么做”情况。
### final 关键字
在 Java 中声明类、属性和方法时，可使用关键字 final 来修饰。
- final 标记的类不能被继承；
- final 标记的方法不能被子类复写；
- final 标记的变量（成员变量或局部变量）即为常量，只能赋值一次。
- final 用来修饰一个类，意味着该类成为不能被继承的最终类。
### 接口
接口里的数据成员必须初始化，且数据成员均为常量；
接口里的方法必须全部声明为 abstract，也就是说，接口不能像抽象类一样保有一般的方法，而必须全部是“抽象方法”。
实现接口使用 `implements` 关键字，继承使用 `extends`
```java
interface Person {
  /********* begin *********/
  public String name = "张三";
  public int age = 18;
  public String occupation = "学生";
  public static void talk() {}
  /********* end *********/
}
// Student类继承自Person类 复写talk()方法返回姓名、年龄和职业信息
class Student implements Person {
  /********* begin *********/
  public void talk() {
    System.out.println("学生——>姓名：" + Person.name + "，年龄：" + Person.age + "，职业：" + Person.occupation + "！");
  }
  /********* end *********/
}
```
## 类型转换
1. `String.valueOf ()`：字符串 → 包装类对象（或缓存值）
2. `String.parseXXX ()`：字符串 → 基本类型
3. `Integer/Double/Float.toString ()`：基本类型/包装类 → 字符串
4. 类型转换 vs 自动装箱/拆箱
```java
int num1 = 100;
   Integer num2 = num1;  // 自动装箱（底层调用 Integer.valueOf(num1)）
   int num3 = num2;      // 自动拆箱（底层调用 num2.intValue()）
```
5. 包装类之间的类型转换需要使用 `XXXXValue ()`
```java
int score = 67;
Integer score1 = new Integer(score);
double score2 = score1.doubleValue();
float score3 = score1.floatValue();
int score4 = score1.intValue();
```
## 字符串类
```java
// import java.util.StringBuffer StringBuffer不需要引入任何包
package test;
public class ReverStr{
	public static StringBuffer reverseWordsInSentence(String str) {
		StringBuffer sb = new StringBuffer(str);
		String words[] = str.split(" ");
		for(int i = 0; i < words.length; i++){
			StringBuffer temp = new StringBuffer(words[i]).revese();
			sb.append(temp + " ");
		}
		sb.pop();
	}
}
```
Scanner 可以使用 `sc. nextXXX（对象名称类型）` 将流中字符解析并返回对应的类型
## Math 类
需要先导入 `import java. lang. Math;`
提供常用方法
```java
Math.sqrt(a1);
Math.cbrt(a2);
Math.pow(a3, a4);
Math.max(a5, a6);
Math.min(a5, a6);
Math.abs(a7);
Math.ceil(a8);
Math.floor(a9);
Math.rint(a10);
Math.round(a11);
```
## 异常处理
在 Java 中，源文件 Test. java 中包含如下代码段，则程序编译运行结果是（ ）
```java
public class HelloWorld{
    public static void main (String[] args){
        System.out.print (“HelloWorld!”);
    }
}
```
A、输出：HelloWorld!
B、编译出错，提示“公有类 HelloWorld 必须在 HelloWorld. java 文件中定义”
C、运行正常，但没有输出内容
D、运行时出现异常
throw 用于 try-catch 中，throws 用于函数体前说明修饰符
