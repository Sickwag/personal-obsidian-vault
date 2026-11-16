// 单线程故障注入：逐个失败分配点验证缓存回滚；不读取私有字段。
#include "InterviewBasics.hpp"
#include "InterviewCaches.hpp"
#include "InterviewThreadPool.hpp"
#include <cassert>
#include <cstdlib>
#include <iostream>
#include <new>
thread_local int allocationBudget = -1;
void *operator new(std::size_t size) {
    if (allocationBudget == 0)
        throw std::bad_alloc();
    if (allocationBudget > 0)
        --allocationBudget;
    if (void *p = std::malloc(size ? size : 1))
        return p;
    throw std::bad_alloc();
}
void operator delete(void *p) noexcept { std::free(p); }
void operator delete(void *p, std::size_t) noexcept { std::free(p); }
using namespace interview;
struct CopyFailure {
    inline static int alive = 0, budget = -1;
    int value;
    explicit CopyFailure(int n) : value(n) { ++alive; }
    CopyFailure(const CopyFailure &other) : value(other.value) {
        if (budget == 0)
            throw std::runtime_error("copy");
        if (budget > 0)
            --budget;
        ++alive;
    }
    CopyFailure(CopyFailure &&other) noexcept(false) : value(other.value) {
        ++alive;
        other.value = -1;
    }
    ~CopyFailure() noexcept { --alive; }
};
int main() {
    for (int budget = 0; budget < 8; ++budget) {
        LRUCache lru(2);
        lru.put(1, 10);
        lru.put(2, 20);
        allocationBudget = budget;
        bool failed = false;
        try {
            lru.put(3, 30);
        } catch (const std::bad_alloc &) {
            failed = true;
        }
        allocationBudget = -1;
        if (failed) {
            assert(lru.get(1) == 10 && lru.get(2) == 20 && !lru.get(3));
        } else
            assert(lru.get(3) == 30);
    }
    for (int budget = 0; budget < 8; ++budget) {
        LFUCache lfu(2);
        lfu.put(1, 10);
        lfu.put(2, 20);
        allocationBudget = budget;
        bool failed = false;
        try {
            lfu.put(3, 30);
        } catch (const std::bad_alloc &) {
            failed = true;
        }
        allocationBudget = -1;
        if (failed) {
            assert(lfu.get(1) == 10 && lfu.get(2) == 20 && !lfu.get(3));
        } else
            assert(lfu.get(3) == 30);
    }
    for (int budget = 0; budget < 5; ++budget) {
        Stack<CopyFailure> stack;
        CopyFailure::budget = -1;
        stack.emplace(1);
        stack.emplace(2);
        const int before = CopyFailure::alive;
        CopyFailure::budget = budget;
        try {
            stack.emplace(3);
        } catch (const std::runtime_error &) {
            assert(stack.size() == 2 && stack.top().value == 2 && CopyFailure::alive == before);
        }
        CopyFailure::budget = -1;
    }
    assert(CopyFailure::alive == 0);
    {
        ThreadPool pool(2);
        for (int budget = 0; budget < 4; ++budget) {
            allocationBudget = budget;
            try {
                auto future = pool.submit([] { return 7; });
                allocationBudget = -1;
                assert(future.get() == 7);
            } catch (const std::bad_alloc &) {
                allocationBudget = -1;
            }
        }
        assert(pool.submit([] { return 9; }).get() == 9);
    }
    std::cout << "ALLOCATION_FAILURE_ROLLBACK_PASS\n";
}
