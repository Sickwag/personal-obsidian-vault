// GDB 交互演示程序：配合 Chores/JobInterviews/面试准备.md「技术面 · 第十题」使用
// 编译：g++ -g -O0 -pthread GdbDemo.cpp -o /tmp/gdb_demo
// 运行：/tmp/gdb_demo            —— 正常路径，最后一行故意空指针崩溃
//       /tmp/gdb_demo deadlock   —— 两个线程交叉加锁，用于演示死锁排查
#include <chrono>
#include <cstdio>
#include <cstring>
#include <mutex>
#include <thread>
#include <vector>

struct Node {
    int value;
    Node* next;
};

int sum(const std::vector<int>& v) {
    int s = 0;
    for (int x : v) {
        s += x;
    }
    return s;
}

Node* makeList() {
    static Node c{3, nullptr};
    static Node b{2, &c};
    static Node a{1, &b};
    return &a;
}

int walk(Node* p) {
    int total = 0;
    while (p) {
        total += p->value;
        p = p->next;
    }
    return total;
}

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
    setvbuf(stdout, nullptr, _IONBF, 0);  // 关掉 stdout 缓冲，崩溃前的 printf 才不会丢
    if (argc > 1 && std::strcmp(argv[1], "deadlock") == 0) {
        std::thread t1(threadA), t2(threadB);
        t1.join();
        t2.join();
        return 0;
    }
    std::vector<int> v{1, 2, 3, 4};       // 断点行：观察 vector 的内部结构
    printf("sum=%d\n", sum(v));
    Node* head = makeList();              // 断点行：观察链表指针
    printf("walk=%d\n", walk(head));
    Node* bad = nullptr;
    bad->value = 42;                      // 故意制造段错误（SEGV）
    printf("%d\n", bad->value);
    return 0;
}
