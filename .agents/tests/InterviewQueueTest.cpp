// 唯一性、每生产者 FIFO、受控 hazard 停顿，以及小历史的线性一致性检查。
#include "InterviewQueues.hpp"
#include <algorithm>
#include <chrono>
#include <deque>
#include <iostream>
#include <thread>
#include <vector>
using namespace interview;
namespace interview {
struct QueueProbe {
    template <class Q> static void holdHead(Q &queue, typename Q::Token &token) {
        queue.hazards[token.slot].pointers[0].store(queue.head.load());
    }
    template <class Q> static void release(Q &queue, typename Q::Token &token) {
        queue.clear(token.slot);
    }
};
} // namespace interview
template <int P, int C> void stress() {
    MpmcQueue<256, P + C> queue;
    constexpr int perProducer = 5000, total = P * perProducer;
    std::vector<std::atomic<int>> seen(total);
    std::atomic<int> consumed{0};
    std::vector<std::thread> threads;
    for (int p = 0; p < P; ++p)
        threads.emplace_back([&, p] {
            auto token = queue.registerThread();
            for (int i = 0; i < perProducer; ++i)
                while (!queue.tryPush(token, p * perProducer + i))
                    std::this_thread::yield();
        });
    for (int c = 0; c < C; ++c)
        threads.emplace_back([&] {
            auto token = queue.registerThread();
            std::vector<int> previous(P, -1);
            while (consumed.load() < total) {
                int value;
                if (queue.tryPop(token, value)) {
                    assert(value >= 0 && value < total);
                    assert(seen[value].fetch_add(1) == 0);
                    if constexpr (C == 1) {
                        const int producer = value / perProducer, sequence = value % perProducer;
                        assert(sequence == previous[producer] + 1);
                        previous[producer] = sequence;
                    }
                    consumed.fetch_add(1);
                } else
                    std::this_thread::yield();
            }
        });
    for (auto &thread : threads)
        thread.join();
    for (auto &count : seen)
        assert(count == 1);
}
struct Operation {
    bool push, success;
    int value;
    int begin, end;
};
bool linearizable(const std::vector<Operation> &history, std::vector<bool> done,
                  std::deque<int> model, std::size_t remaining) {
    if (!remaining)
        return true;
    for (std::size_t i = 0; i < history.size(); ++i) {
        if (done[i])
            continue;
        bool allowed = true;
        for (std::size_t j = 0; j < history.size(); ++j)
            if (!done[j] && history[j].end < history[i].begin)
                allowed = false;
        if (!allowed)
            continue;
        const auto &op = history[i];
        auto next = model;
        if (op.push) {
            if (op.success)
                next.push_back(op.value);
        } else if (op.success) {
            if (next.empty() || next.front() != op.value)
                continue;
            next.pop_front();
        } else if (!next.empty())
            continue;
        auto marked = done;
        marked[i] = true;
        if (linearizable(history, marked, next, remaining - 1))
            return true;
    }
    return false;
}
int main() {
    {
        SpscQueue<1> queue;
        int value = 123;
        assert(!queue.tryPop(value) && value == 123);
        assert(queue.tryPush(1) && !queue.tryPush(2));
        assert(queue.tryPop(value) && value == 1);
        SpscQueue<7> ring;
        std::thread producer([&] {
            for (int i = 0; i < 100000; ++i)
                while (!ring.tryPush(i))
                    std::this_thread::yield();
        });
        std::thread consumer([&] {
            for (int i = 0; i < 100000; ++i) {
                int got;
                while (!ring.tryPop(got))
                    std::this_thread::yield();
                assert(got == i);
            }
        });
        producer.join();
        consumer.join();
    }
    stress<4, 1>();
    stress<1, 4>();
    stress<4, 4>();
    {
        MpmcQueue<32, 3> queue;
        auto sleeping = queue.registerThread();
        QueueProbe::holdHead(queue, sleeping);
        std::atomic<bool> done = false;
        std::thread active([&] {
            auto token = queue.registerThread();
            for (int i = 0; i < 10000; ++i) {
                assert(queue.tryPush(token, i));
                int value;
                assert(queue.tryPop(token, value) && value == i);
            }
            done = true;
        });
        active.join();
        assert(done);
        QueueProbe::release(queue, sleeping);
    }
    {
        MpmcQueue<2, 1> queue;
        auto token = queue.registerThread();
        bool caught = false;
        try {
            auto extra = queue.registerThread();
        } catch (const std::runtime_error &) {
            caught = true;
        }
        assert(caught);
        for (int i = 0; i < 10000; ++i) {
            assert(queue.tryPush(token, i));
            assert(!queue.tryPush(token, 99));
            int value;
            assert(queue.tryPop(token, value) && value == i);
        }
    }
    for (int trial = 0; trial < 150; ++trial) {
        MpmcQueue<16, 3> queue;
        std::atomic<int> clock{0};
        std::vector<Operation> history(6);
        std::vector<std::thread> threads;
        for (int t = 0; t < 3; ++t)
            threads.emplace_back([&, t] {
                auto token = queue.registerThread();
                for (int step = 0; step < 2; ++step) {
                    auto &op = history[t * 2 + step];
                    op.push = step == 0;
                    op.value = t;
                    op.begin = clock.fetch_add(1);
                    if (op.push)
                        op.success = queue.tryPush(token, op.value);
                    else
                        op.success = queue.tryPop(token, op.value);
                    op.end = clock.fetch_add(1);
                }
            });
        for (auto &thread : threads)
            thread.join();
        assert(linearizable(history, std::vector<bool>(6), {}, 6));
    }
    std::cout << "SPSC_MPSC_SPMC_MPMC_AND_LINEARIZABILITY_PASS\n";
}
