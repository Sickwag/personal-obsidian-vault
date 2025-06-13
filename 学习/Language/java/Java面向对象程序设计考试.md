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
- **左边`List<Integer>`**：声明接口类型（面向接口编程），提高灵活性。
- **右边`ArrayList<>()`**：
    - `<>`：钻石操作符（Java 7+），编译器自动推断泛型类型（与左侧一致）。
    - `()`：调用无参构造器。
- **为什么不用重复写`Integer`**？  
    Java编译器通过左侧类型自动推断右侧泛型类型，避免冗余。
- C++：`std::vector<int> v;`
- Java：`List<Integer> list = new ArrayList<>();` `List`是接口，`ArrayList`是实现类。 
    （Java必须用包装类，不能直接用 `int`）

### `int` vs `Integer`

|特性|`int`|`Integer`|
|---|---|---|
|类型|基本类型|包装类（对象）|
|存储|栈内存|堆内存|
|默认值|0|`null`|
|集合中|不支持|必须用`Integer`|
|性能|更高|有对象开销|

**为什么参数用`Integer`？**
- 你的代码中实际是 `int`（正确做法），`Integer` 通常用于泛型或需要 `null` 的场景。
### 为什么用`.get()`而非`[]`？

- **`List`是接口**，不保证连续存储（如`LinkedList`），所以不能用`[]`语法。
- **数组`Integer[]`**：可以用`arr[j]`，但`List`必须用`list.get(j)`。
- **设计差异**：  
    Java严格区分数组和集合，C++中 `std::vector` 重载了 `[]`，但Java的 `List` 没有。

### private constructor 警告
- 当类只包含静态方法（如你的`Solution`工具类）时，IDEA建议：
    - 添加私有构造器：防止被意外实例化
    - 将类声明为 `final`：禁止继承
    - - 工具类不需要实例化，私有构造器是防御性编程手段
- 类似C++中的`= delete`：
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
### Java 中的类实例化
| 特性    | Java                              | C++                                                   |
| ----- | --------------------------------- | ----------------------------------------------------- |
| 实例化语法 | `ClassName obj = new ClassName()` | `ClassName obj;` 或 `ClassName* ptr = new ClassName()` |
| 内存管理  | 自动垃圾回收                            | 需要手动管理                                                |
| 对象存储  | 堆内存                               | 栈或堆                                                   |
| 对象访问  | 通过引用                              | 直接或通过指针                                               |
| 析构方法  | 无，有 `finalize()` 但不推荐           | 有析构函数                                                 |
1. 当类只包含静态成员时，创建该类的实例没有实际意义
2. Java 会为没有显式构造方法的类提供默认的 public 无参构造方法，这可能导致其他开发人员错误地实例化这个工具类
3. **为什么 Java 设计所有成员都是 static 的类不应被实例化？**
	- **内存效率**：实例化纯静态类会创建无用的对象，浪费内存
	- **设计意图明确性**：工具类（如 `Math`、`Collections`）本质是函数集合，不是对象
	- **防止误用**：实例化后可能误导其他开发者以为该类有实例状态，可能违反单例模式（如果工具类意外维护了状态）
---
为什么C++**不能这样设计**
C++采用不同的对象创建机制：

- 对象可以在栈上直接创建（不需要new）
- 构造函数访问控制不影响栈上对象创建
- 因此C++中构造函数只能是public的
### final 关键字
1. **修饰变量**：表示变量只能被赋值一次，不能被重新赋值，类似于 [[C++ Runoob Tutoral#const 的作用|const]]
2. **修饰方法**：表示方法不能被子类重写
3. **修饰类**：表示类不能被继承
会对程序产生下面优化：
4. **安全性**：防止变量被意外重新赋值
5. **线程安全**：`final`变量在多线程环境下更安全
6. **代码清晰**：明确表达变量不应被修改的意图
7. **优化**：JVM可能对 `final` 变量进行优化

|特性|Java final|C++ const|
|---|---|---|
|变量不可变|`final int x = 5;`|`const int x = 5;`|
|类不可继承|`final class A {}`|N/A (C++用final关键字)|
|方法不可覆盖|`final void m() {}`|N/A (C++用final关键字)|
- Java的 `final` 可以修饰类、方法、变量。没有等价于C++的 `const&` 参数传递机制
- C++的 `const` 主要修饰变量和方法（保证不修改成员）。`const`是类型系统的一部分，更强大

### SonarQube 提示
**SonarQube** 是一个开源的代码质量管理平台，主要用于：

- 静态代码分析
- 检测代码缺陷、漏洞和代码异味(code smells)
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
### 2. Java中修改Map值的正确方式

情况1：直接覆盖值（对应C++的`map[key] = value`）
```java
map.put(n, newValue);  // 无论键是否存在都会覆盖
```

情况2：条件修改（键必须存在）
```java
if (map.containsKey(n)) {    map.put(n, map.get(n) + 1);  // 相当于C++的map[n]++}
```

情况3：智能合并（推荐方式）
```java
// Java 8+ 最佳实践
map.merge(n, 1, Integer::sum); // 等效于：
// 如果键不存在 → 插入(n,1)// 如果键存在 → 旧值 + 1
```

情况4：原子性操作（线程安全场景）
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
- **特点 * *：
- 返回一个固定大小的 `List`，不能修改（不能 `add` 或 `remove`）。
- 适用于初始化后不需要修改的列表。

#####  `new ArrayList<>(Arrays.asList())`
```java
List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));
```
- **特点 * *：
- 返回一个可修改的 `ArrayList`，可以动态增删元素。

#####  Java 9 + 的 `List.of()`
```java
List<Integer> list = List.of(1, 2, 3, 4, 5);
```
- **特点 * *：
- 返回一个不可变的 `List`（Java 9 + 支持）。
- 性能比 `Arrays.asList()` 更好。

#####  `Collections.addAll()`
```java
List<Integer> list = new ArrayList<>();
Collections.addAll(list, 1, 2, 3, 4, 5);
```
- **特点 * *：
- 适用于动态添加元素到已有 `List`。

-- -

#### 2. 将多个常量 `int` 值转换为 `int[]` 数组
##### 直接初始化数组
```java
int[] arr = { 1, 2, 3, 4, 5 };
```
- **特点 * *：
- 最简洁的方式，适用于已知所有元素的情况。

#####  `Arrays.stream()` 转换
```java
int[] arr = Arrays.stream(new int[] {1, 2, 3, 4, 5}).toArray();
```
- **特点 * *：
- 适用于需要动态计算或转换的情况。

#####  `IntStream.of()`
```java
int[] arr = IntStream.of(1, 2, 3, 4, 5).toArray();
```
- **特点 * *：
- 适用于 Java 8 + ，支持流式操作。

-- -

#### 3. 从 `List<Integer > ` 转换为 `int[]`
```java
List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);
int[] arr = list.stream().mapToInt(Integer::intValue).toArray();
```
- **特点 * *：
- 适用于需要从 `List` 转换到 `int[]` 的情况。

-- -

#### 4. 从 `int[]` 转换为 `List<Integer > `
```java
int[] arr = { 1, 2, 3, 4, 5 };
List<Integer> list = Arrays.stream(arr).boxed().collect(Collectors.toList());
```
- **特点 * *：
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

| 操作 | 方法 | 适用场景            |
| ---------------------------- - | ------------------------------------------------------------------ | -------------- - |
| **初始化 `List<Integer > `* * | `Arrays.asList()`, `new ArrayList<>(Arrays.asList())`, `List.of()` | 需要快速初始化不可变或可变列表 |
| **初始化 `int[]`** | `int[] arr = { 1, 2, 3 }`, `IntStream.of(1, 2, 3).toArray()` | 需要快速初始化数组       |
| **`List<Integer > ` 转 `int[]`** | `list.stream().mapToInt(Integer::intValue).toArray()` | 需要将列表转换为数组      |
| **`int[]` 转 `List<Integer > `** | `Arrays.stream(arr).boxed().collect(Collectors.toList())` | 需要将数组转换为列表 |

#### 推荐方法
- **初始化 `List<Integer > `* * ：`List.of()`（Java 9 + ）或 `new ArrayList<>(Arrays.asList())`。
- **初始化 `int[]`** ：直接初始化 `int[] arr = { 1, 2, 3 }`。
- **转换 * *： `stream()` 进行 `List` 和 `int[]` 之间的转换。

-- -

#### 7. 常见问题
##### * *(1) `Arrays.asList()` 和 `List.of()` 的区别？ * *
| 方法 | 可变性 | 是否允许 `null` | Java 版本 |
|------ | -------- | ---------------- | ----------|
| `Arrays.asList()` | 固定大小（不可增删） | 允许 `null` | Java 1.2 + |
| `List.of()` | 完全不可变 | 不允许 `null` | Java 9 + |

##### 为什么 `Arrays.asList()` 返回的 `List` 不能修改？
- 它返回的是基于数组的 `List`，底层仍然是数组，所以不能改变大小（不能 `add` 或 `remove`）。

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
- **`List<Integer > ` 初始化 * *：`Arrays.asList()`, `List.of()`, `new ArrayList<>()`。
- **`int[]` 初始化** ：`int[] arr = { 1, 2, 3 }`, `IntStream.of().toArray()`。
- **转换 * *：`stream().mapToInt().toArray()` 和 `Arrays.stream().boxed().collect(Collectors.toList())`。

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
    - 查找/插入/删除平均时间复杂度为 O(1)。
    - 无序，线程不安全。
2. **LinkedHashMap**
    
    - 继承自 `HashMap`，维护双向链表记录顺序。
    - 支持按插入顺序或访问顺序遍历。
3. **TreeMap**
    
    - 基于红黑树实现，按键排序。
    - 查找/插入/删除时间复杂度 O(log n)。
4. **ConcurrentHashMap**
    
    - 线程安全，分段锁减少锁竞争。
    - 高并发场景首选。
5. **Hashtable**
    
    - 线程安全但性能差，全表锁。
    - 遗留类，不推荐使用。
#### 1. 如何在创建哈希表的同时初始化内容？
在 Java 中，可以使用 * *双括号初始化（Double Brace Initialization） * *或 * *Java 9 + 的 `Map.of()` / `Map.ofEntries()`* * 方法直接初始化 `HashMap`。

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
- **缺点 * *：
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
- **特点 * *：
- 适用于 * *少量键值对 * *（最多 10 个，因为 `Map.of()` 有参数限制）。
- 返回的是 * *不可变 Map * *（不能修改）。

##### Java 9 + 的 `Map.ofEntries()`
```java
Map<String, Integer> map = Map.ofEntries(
    Map.entry("Alice", 25),
    Map.entry("Bob", 30),
    Map.entry("Charlie", 35)
);
```
- **特点 * *：
- 适用于 * *任意数量的键值对 * *。
- 返回的也是 * *不可变 Map * *。

##### 使用 `Stream` + `Collectors.toMap()`
```java
Map<String, Integer> map = Stream.of(
    new AbstractMap.SimpleEntry<>("Alice", 25),
    new AbstractMap.SimpleEntry<>("Bob", 30),
    new AbstractMap.SimpleEntry<>("Charlie", 35)
).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
```
- **特点 * *：
- 适用于动态构建 Map。
- 返回的是 * *可变 Map * *。

-- -

#### 2. Java 容器的初始化方式
Java 的集合类（如 `List`, `Set`, `Map`）通常有 * *多种初始化方式 * *：
| 容器类型 | 初始化方式 | 示例 |
|---------- | ------------ | ------|
| **`List`* * | `Arrays.asList()`, `List.of()`, `new ArrayList<>(List.of())` | `List<String > list = List.of("A", "B");` |
| **`Set`* * | `Set.of()`, `new HashSet<>(Arrays.asList())` | `Set<String > set = Set.of("A", "B");` |
| **`Map`* * | `Map.of()`, `Map.ofEntries()`, 双括号初始化 | `Map<String, Integer > map = Map.of("A", 1);` |

**通用规律 * *：
- **不可变集合 * *：`List.of()`, `Set.of()`, `Map.of()`（Java 9 + ）。
- **可变集合 * *：通过构造函数传入初始数据，如 `new ArrayList<>(List.of(...))`。

-- -

#### 3. 为什么 `Map<String, Integer > map = new HashMap<>();` 左边用 `Map`，右边用 `HashMap`？
这是** 面向接口编程（Interface - based Programming） * *的体现：
- **`Map` 是接口 * *，`HashMap` 是它的一个实现。
- **`TreeMap`、`ConcurrentHashMap` 也是 `Map` 的实现 * *，但底层数据结构不同：
- `HashMap`：哈希表（无序，O (1) 查询）。
- `TreeMap`：红黑树（按 key 排序，O (log n) 查询）。
- `ConcurrentHashMap`：线程安全的哈希表。

##### 为什么这样设计？
1. * *灵活性 * *：可以随时替换实现，例如：
```java
Map<String, Integer> map = new HashMap<>();  // 今天用 HashMap
map = new TreeMap<>();                       // 明天换成 TreeMap
```
而客户端代码（使用 `map` 的地方）不需要修改。

2. * *遵循依赖倒置原则（DIP） * *：
- 高层模块（业务逻辑）不应该依赖低层模块（`HashMap`），而是依赖抽象（`Map`）。

3. * *多态 * *：可以通过接口统一操作不同的实现。

##### 示例：`Map` 的不同实现
```java
Map<String, Integer> hashMap = new HashMap<>();  // 哈希表实现
Map<String, Integer> treeMap = new TreeMap<>();  // 红黑树实现
Map<String, Integer> concurrentMap = new ConcurrentHashMap<>();  // 线程安全实现
```
尽管底层实现不同，但它们的** 方法签名（如 `put()`, `get()`）由 `Map` 接口统一规定** ，因此可以互换。

-- -

#### 4. 为什么泛型 `String, Integer` 在左边的 `Map` 中声明？
- **泛型是类型声明的一部分 * *，而 * *变量类型（`Map`） * *决定了它能调用的方法。
- **右侧的 `new HashMap<>()` 使用了类型推断（Diamond Operator `< > `） * *：
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
| **容器初始化通用方法 * *| `List.of()`, `Set.of()`, `Map.of()` | 不可变集合 |
| **`Map` 接口 vs 实现类 * *| `Map<String, Integer > map = new HashMap<>();` | 面向接口编程，灵活替换实现 |
| **泛型声明位置 * *| 左侧 `Map` 定义泛型，右侧 `< > ` 自动推断 | 类型安全，代码简洁 |

#### 最佳实践
1. * *优先使用 `Map.of()` 或 `Map.ofEntries()`* * 初始化不可变 Map（Java 9 + ）。
2. * *需要可变 Map 时 * *：
```java
Map<String, Integer> map = new HashMap<>(Map.of("A", 1, "B", 2));
```
3. * *变量类型声明为 `Map`* * （而非 `HashMap`），以提高代码灵活性。
4. * *理解接口与实现的关系 * *：`Map` 是规范，`HashMap` / `TreeMap` 是具体实现。

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

### 程序 14
#### 修改数组中元素

| 数据结构          | 修改方法                             | 示例                                           |
| ------------- | -------------------------------- | -------------------------------------------- |
| **数组**        | `array[index] = newValue`        | `arr[1] = 20`                                |
| **List**      | `list.set(index, newValue)`      | `list.set(2, 30)`                            |
| **ArrayList** | `arrayList.set(index, newValue)` | `arrayList.set(3, 40)`                       |
| **不可变 List**  | 不能修改大小，但可修改元素                    | `fixedList.set(1, 20)`                       |
| **Stream**    | `map()` + `collect()`            | `list.stream().map(n -> n * 2).collect(...)` |


### 程序 31
初始化数组方法：
```java
List<Integer> arr = Arrays.asList(12,43,12,2,32,2,57,8);
```
排序数组方法

|方法|是否修改原 List|适用场景|代码简洁性|
|---|---|---|---|
|`Collections.reverse()`|✅ 修改|任意 List|⭐⭐⭐|
|`Stream.sorted(reverseOrder)`|❌ 不修改|可排序 List|⭐⭐|
|`IntStream.range()` 反向索引|❌ 不修改|任意 List|⭐⭐|
|`Collectors.toList()` + `reverse`|❌ 不修改|需要新 List|⭐⭐|
|`LinkedList.descendingIterator()`|❌ 不修改|仅 `LinkedList`|⭐⭐⭐|

