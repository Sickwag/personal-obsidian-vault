// ============================================================================
// GDB 综合实验程序（配合 Chores/JobInterviews/面试准备.md「技术面 · 第十题」）
//
// 编译（选项含义见笔记「编译选项逐个解释」）：
//   g++ -g -O0 -pthread -std=c++17 GdbDemo.cpp -o /tmp/gdb_demo
//
// 运行模式（用命令行参数选，gdb 里用 set args <mode> 或 r <mode>）：
//   crash     默认：正常算完，最后空指针崩溃（演示 SIGSEGV / core）
//   throw     在 divide() 里抛异常（演示 catch throw）
//   threads   开两个工作线程（演示 info threads / thread apply all bt）
//   deadlock  两个线程交叉加锁，永久卡住（演示死锁排查）
//
// 设计原则：所有断点都用「函数名」，不用行号 —— 换编辑器、改注释都不会失效。
// ============================================================================
#include <cstdio>       // printf、setvbuf
#include <cstring>      // strcmp
#include <chrono>       // std::chrono::milliseconds（sleep_for 的时长参数）
#include <list>         // std::list：非连续容器，演示怎么遍历节点
#include <map>          // std::map：演示红黑树容器的查看
#include <mutex>        // std::mutex、std::lock_guard（死锁演示）
#include <stdexcept>    // std::runtime_error：演示异常断点
#include <string>
#include <thread>       // std::thread
#include <vector>       // std::vector：连续容器

// ---- 全局变量 / 文件内静态变量（演示 p 直接取全局、静态加文件名限定）----
int g_counter = 41;
static int s_calls = 0;

// ---- 结构体（演示 ptype、p *ptr、x/nfu 看内存布局）----
struct Node {
    int value;   // 4 字节
    Node* next;  // 8 字节，偏移 8（中间 4 字节是对齐填充）
};

// ---- 演示：进入函数（b sumVector）、info args、单步、watch 修改变量 ----
int sumVector(const std::vector<int>& v) {
    int s = 0;
    for (int x : v) {
        s += x;      // 在这行 watch s，会依次看到 1、3、6、10
        ++s_calls;   // 静态变量也会变（p s_calls）
    }
    return s;
}

// ---- 演示：非连续容器（std::list）怎么在 gdb 里看清每个节点 ----
int sumList(const std::list<int>& l) {
    int s = 0;
    for (int x : l) s += x;
    return s;
}

// ---- 演示：递归调用栈（bt 多帧、frame/up/down、bt full）----
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

// ---- 演示：异常断点（catch throw），以及 p 调用有真实代码的函数 ----
double divide(int a, int b) {
    if (b == 0) throw std::runtime_error("divide by zero");
    return static_cast<double>(a) / b;
}

// ---- 演示：崩溃现场（SIGSEGV）、bt full、info registers、x/i $pc ----
void crashNull() {
    Node* bad = nullptr;   // p bad → (Node *) 0x0
    bad->value = 42;       // 往地址 0 写 → 内核发 SIGSEGV
}

// ---- 演示：多线程（info threads / thread apply all bt / thread N）----
void threadWorker(int id) {
    for (int i = 0; i < 3; ++i) g_counter += id;
}

// ---- 演示：死锁（ABBA 交叉加锁；sleep 把持锁窗口拉大，稳定复现）----
std::mutex m1, m2;
static void threadA() {
    std::lock_guard<std::mutex> a(m1);
    std::this_thread::sleep_for(std::chrono::milliseconds(50));
    std::lock_guard<std::mutex> b(m2);
}
static void threadB() {
    std::lock_guard<std::mutex> b(m2);
    std::this_thread::sleep_for(std::chrono::milliseconds(50));
    std::lock_guard<std::mutex> a(m1);
}

int main(int argc, char** argv) {
    // 关闭 stdout 缓冲：进程被信号杀死时缓冲区不刷，"崩溃前的日志"会整段丢。
    // 参数：流、缓冲区(nullptr=系统默认)、模式(_IONBF 不缓冲 / _IOLBF 行缓冲 / _IOFBF 全缓冲)
    setvbuf(stdout, nullptr, _IONBF, 0);

    // argc 是参数个数（程序名算 1），argv[1] 是第一个真参数；没给就当 crash 模式。
    const char* mode = (argc > 1) ? argv[1] : "crash";

    std::vector<int> v{1, 2, 3, 4};                       // 连续内存
    std::list<int> l{10, 20, 30};                         // 链式节点
    std::map<std::string, int> m{{"one", 1}, {"two", 2}}; // 红黑树
    int arr[6] = {10, 20, 30, 40, 50, 60};                // 数组：x/6dw 看
    char buf[16] = "hello";                               // 字符串：x/s 看
    Node a{1, nullptr}, b{2, &a};                         // 栈上链表：p *p / x/2gx

    int sv = sumVector(v);
    int sl = sumList(l);

    int f = factorial(4);
    double d = (std::strcmp(mode, "throw") == 0) ? divide(1, 0) : divide(6, 3);

    if (std::strcmp(mode, "threads") == 0) {
        std::thread t1(threadWorker, 1), t2(threadWorker, 2);
        t1.join();
        t2.join();
    }
    if (std::strcmp(mode, "deadlock") == 0) {
        std::thread t1(threadA), t2(threadB);
        t1.join();
        t2.join();
    }

    printf("sv=%d sl=%d f=%d d=%.1f counter=%d buf=%s node2=%d\n",
           sv, sl, f, d, g_counter, buf, b.next ? b.next->value : -1);

    if (std::strcmp(mode, "crash") == 0) crashNull();
    return 0;
}
