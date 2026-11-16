// 对面试示例做独立模型比较、边界与异常验证；并发测试另置。
#include "InterviewBasics.hpp"
#include "InterviewCaches.hpp"
#include "InterviewHuffman.hpp"
#include "InterviewSorting.hpp"
#include "InterviewThreadPool.hpp"
#include <cassert>
#include <climits>
#include <iostream>
#include <map>
#include <random>
#include <set>
using namespace interview;
template <class E, class F> void throws(F &&f) {
    bool hit = false;
    try {
        f();
    } catch (const E &) {
        hit = true;
    }
    assert(hit);
}
struct alignas(128) Aligned {
    int value;
    explicit Aligned(int n) : value(n){};
};
struct ThrowCopy {
    inline static int alive = 0, budget = 100000;
    int value;
    explicit ThrowCopy(int v) : value(v) { ++alive; }
    ThrowCopy(const ThrowCopy &o) : value(o.value) {
        if (--budget < 0)
            throw std::runtime_error("copy");
        ++alive;
    }
    ThrowCopy(ThrowCopy &&o) noexcept : value(o.value) {
        ++alive;
        o.value = -1;
    }
    ~ThrowCopy() noexcept { --alive; }
};
int main() {
    {
        Vector<int> a;
        throws<std::out_of_range>([&] { a.popBack(); });
        for (int i = 0; i < 1000; ++i)
            a.pushBack(i);
        for (int i = 0; i < 1000; ++i)
            assert(a.at(i) == i);
        auto b = std::move(a);
        assert(a.empty() && b.size() == 1000);
        throws<std::length_error>([&] { b.reserve(SIZE_MAX); });
        Vector<std::string> s;
        s.pushBack("x");
        s.pushBack(s.at(0));
        assert(s.at(1) == "x");
        Vector<Aligned> v;
        v.pushBack(Aligned(7));
        assert(reinterpret_cast<std::uintptr_t>(&v.at(0)) % alignof(Aligned) == 0);
    }
    {
        Stack<std::string> s;
        s.push("x");
        s.push(s.top());
        assert(s.size() == 2 && s.top() == "x");
        Stack<std::string> b;
        b.push("old");
        b = std::move(s);
        assert(b.size() == 2 && s.empty());
        auto *self = &b;
        b = std::move(*self);
        assert(b.size() == 2);
        Stack<Aligned> a;
        a.emplace(9);
        assert(a.top().value == 9);
        throws<std::out_of_range>([] {
            Stack<int> a;
            a.pop();
        });
    }
    {
        Stack<ThrowCopy> s;
        s.emplace(1);
        ThrowCopy value(2);
        ThrowCopy::budget = 0;
        throws<std::runtime_error>([&] { s.push(value); });
        assert(s.size() == 1 && s.top().value == 1);
    }
    assert(ThrowCopy::alive == 0);
    {
        StackAdapter<int> s;
        s.push(1);
        s.push(2);
        assert(s.top() == 2);
        s.pop();
        assert(s.top() == 1);
        QueueAdapter<int> q;
        throws<std::out_of_range>([&] { q.front(); });
        q.push(3);
        q.push(4);
        assert(q.front() == 3);
        q.pop();
        assert(q.front() == 4);
    }
    {
        for (int size = 0; size < 30; ++size) {
            std::vector<ListNode> nodes(static_cast<std::size_t>(size));
            for (int i = 0; i < size; ++i) {
                nodes[i].value = i;
                nodes[i].next = i + 1 < size ? &nodes[i + 1] : nullptr;
            }
            auto *head = size ? nodes.data() : nullptr;
            auto *rev = reverseList(head);
            for (int i = size - 1; i >= 0; --i) {
                assert(rev && rev->value == i);
                rev = rev->next;
            }
            head = reverseList(size ? &nodes.back() : nullptr);
            for (int k = 1; k < 8; ++k) {
                auto *changed = reverseKGroup(head, k);
                std::vector<int> expected;
                for (int start = 0; start < size; start += k) {
                    const int end = std::min(size, start + k);
                    if (end - start == k)
                        for (int j = end - 1; j >= start; --j)
                            expected.push_back(j);
                    else
                        for (int j = start; j < end; ++j)
                            expected.push_back(j);
                }
                auto *p = changed;
                for (int v : expected) {
                    assert(p && p->value == v);
                    p = p->next;
                }
                assert(!p);
                head = reverseKGroup(changed, k);
            }
            if (size) {
                auto r = removeNthFromEnd(head, size);
                assert(r.removed == nodes.data() && r.removed->next == nullptr);
            }
        }
        throws<std::invalid_argument>([] { reverseKGroup(nullptr, 0); });
        throws<std::out_of_range>([] { removeNthFromEnd(nullptr, 1); });
        ListNode a{1}, b{2};
        a.next = &b;
        b.next = &a;
        assert(hasCycle(&a));
        b.next = nullptr;
        assert(!hasCycle(&a));
        ListNode c{3}, d{4};
        a.next = &c;
        b.next = &d;
        auto *p = mergeSorted(&a, &b);
        for (int v = 1; v <= 4; ++v) {
            assert(p && p->value == v);
            p = p->next;
        }
        assert(!p);
    }
    std::mt19937 random(20261116);
    for (int cap = 0; cap < 9; ++cap) {
        LRUCache lru(cap);
        LFUCache lfu(cap);
        struct Entry {
            int value;
            int count;
            int tick;
        };
        std::map<int, Entry> lm, fm;
        for (int tick = 1; tick <= 5000; ++tick) {
            int key = static_cast<int>(random() % 15),
                value = static_cast<int>(random() % 100) - 50;
            bool put = random() % 2;
            if (put) {
                lru.put(key, value);
                lfu.put(key, value);
                if (cap) {
                    for (auto *map : {&lm, &fm}) {
                        auto it = map->find(key);
                        if (it != map->end()) {
                            it->second.value = value;
                            ++it->second.count;
                            it->second.tick = tick;
                        } else {
                            if (map->size() == static_cast<std::size_t>(cap)) {
                                auto victim = std::min_element(
                                    map->begin(), map->end(), [&](auto &a, auto &b) {
                                        return map == &lm
                                                   ? a.second.tick < b.second.tick
                                                   : std::pair(a.second.count, a.second.tick) <
                                                         std::pair(b.second.count, b.second.tick);
                                    });
                                map->erase(victim);
                            }
                            map->emplace(key, Entry{value, 1, tick});
                        }
                    }
                }
            } else {
                auto expect = [&](auto &map) {
                    auto it = map.find(key);
                    if (it == map.end())
                        return std::optional<int>{};
                    ++it->second.count;
                    it->second.tick = tick;
                    return std::optional<int>{it->second.value};
                };
                assert(lru.get(key) == expect(lm));
                assert(lfu.get(key) == expect(fm));
            }
        }
    }
    throws<std::invalid_argument>([] { LRUCache x(-1); });
    throws<std::invalid_argument>([] { LFUCache x(-1); });
    {
        MaxHeap heap;
        std::priority_queue<int> model;
        for (int i = 0; i < 20000; ++i) {
            if (model.empty() || random() % 2) {
                int v = static_cast<int>(random());
                heap.push(v);
                model.push(v);
            } else {
                assert(heap.top() == model.top());
                heap.pop();
                model.pop();
            }
        }
        while (!model.empty()) {
            assert(heap.top() == model.top());
            heap.pop();
            model.pop();
        }
        throws<std::out_of_range>([&] { heap.pop(); });
        Trie trie;
        trie.insert("apple");
        assert(trie.search("apple") && !trie.search("app") && trie.startsWith("app"));
        trie.insert("");
        assert(trie.search(""));
        throws<std::invalid_argument>([&] { trie.insert("Bad"); });
        assert(!trie.startsWith("bad"));
        DisjointSet sets(8);
        assert(sets.unite(0, 1));
        assert(!sets.unite(0, 1));
        assert(sets.find(0) == sets.find(1));
        throws<std::out_of_range>([&] { sets.find(8); });
        throws<std::invalid_argument>([] { DisjointSet s(-1); });
    }
    {
        Trie trie;
        std::set<std::string> words;
        for (int trial = 0; trial < 3000; ++trial) {
            std::string word(random() % 9, 'a');
            for (char &c : word)
                c = static_cast<char>('a' + random() % 5);
            if (random() % 2) {
                trie.insert(word);
                words.insert(word);
            }
            assert(trie.search(word) == words.contains(word));
            const auto prefix = word.substr(0, word.size() / 2);
            bool found =
                prefix.empty() || std::any_of(words.begin(), words.end(),
                                              [&](const auto &s) { return s.starts_with(prefix); });
            assert(trie.startsWith(prefix) == found);
        }
        for (int size = 1; size < 30; ++size) {
            DisjointSet sets(size);
            std::vector<int> labels(size);
            for (int i = 0; i < size; ++i)
                labels[i] = i;
            for (int trial = 0; trial < 300; ++trial) {
                int a = static_cast<int>(random() % size), b = static_cast<int>(random() % size);
                const int previous = labels[b], replacement = labels[a];
                assert(sets.unite(a, b) == (previous != replacement));
                for (auto &label : labels)
                    if (label == previous)
                        label = replacement;
                for (int i = 0; i < size; ++i)
                    assert((sets.find(i) == sets.find(a)) == (labels[i] == labels[a]));
            }
        }
        for (int size = 1; size < 20; ++size)
            for (int n = 1; n <= size; ++n) {
                std::vector<ListNode> nodes(size);
                for (int i = 0; i < size; ++i)
                    nodes[i] = {i, i + 1 < size ? &nodes[i + 1] : nullptr};
                auto result = removeNthFromEnd(nodes.data(), n);
                assert(result.removed == &nodes[size - n] && result.removed->next == nullptr);
                auto *at = result.head;
                for (int i = 0; i < size; ++i)
                    if (i != size - n) {
                        assert(at && at->value == i);
                        at = at->next;
                    }
                assert(!at);
            }
    }
    {
        using Sort = void (*)(std::vector<int> &);
        std::vector<Sort> sorts = {bubbleSort, selectionSort, insertionSort, shellSort, mergeSort,
                                   quickSort,  heapSort,      bucketSort,    radixSort};
        for (auto sort : sorts)
            for (int trial = 0; trial < 250; ++trial) {
                std::vector<int> a(random() % 140);
                for (auto &v : a)
                    v = trial % 2 ? static_cast<int>(random() % 25) - 12
                                  : static_cast<int>(random());
                if (!a.empty()) {
                    a[0] = INT_MIN;
                    a.back() = INT_MAX;
                }
                auto expected = a;
                std::sort(expected.begin(), expected.end());
                sort(a);
                assert(a == expected);
            }
        for (int trial = 0; trial < 500; ++trial) {
            std::vector<int> a(random() % 200);
            for (auto &v : a)
                v = static_cast<int>(random() % 201) - 100;
            auto expected = a;
            std::sort(expected.begin(), expected.end());
            countingSort(a);
            assert(a == expected);
        }
        std::vector<int> extreme{INT_MIN, INT_MAX};
        throws<std::length_error>([&] { countingSort(extreme); });
    }
    {
        for (int trial = 0; trial < 500; ++trial) {
            std::string s(random() % 700, '\0');
            for (char &c : s)
                c = static_cast<char>(random() % 256);
            Huffman codec(s);
            assert(codec.decode(codec.encode(s)) == s);
        }
        Huffman empty("");
        assert(empty.decode("").empty());
        throws<std::invalid_argument>([&] { empty.decode("0"); });
        Huffman one("aaaa");
        assert(one.encode("aaa") == "000" && one.decode("00") == "aa");
        throws<std::invalid_argument>([&] { one.decode("1"); });
        throws<std::invalid_argument>([&] { one.encode("b"); });
        Huffman h("aaabbcdef");
        throws<std::invalid_argument>([&] { h.decode("x"); });
        for (const auto &code : h.codes())
            if (code.size() > 1) {
                throws<std::invalid_argument>([&] { h.decode(code.substr(0, code.size() - 1)); });
                break;
            }
        std::string training;
        std::array<int, 6> counts{5, 9, 12, 13, 16, 45};
        for (int i = 0; i < 6; ++i)
            training.append(counts[i], static_cast<char>('a' + i));
        Huffman optimal(training);
        assert(optimal.encode(training).size() == 224);
    }
    {
        throws<std::invalid_argument>([] { ThreadPool p(0); });
        ThreadPool pool(4);
        std::vector<std::future<int>> jobs;
        for (int i = 0; i < 1000; ++i)
            jobs.push_back(pool.submit([i] { return i * i; }));
        for (int i = 0; i < 1000; ++i)
            assert(jobs[i].get() == i * i);
        auto fail = pool.submit([]() -> int { throw std::runtime_error("task"); });
        throws<std::runtime_error>([&] { fail.get(); });
        auto self = pool.submit([&] { pool.shutdown(); });
        throws<std::logic_error>([&] { self.get(); });
        auto move = pool.submit([p = std::make_unique<int>(42)] { return *p; });
        assert(move.get() == 42);
        pool.shutdown();
        pool.shutdown();
        throws<std::runtime_error>([&] { pool.submit([] {}); });
    }
    std::cout << "ALL_SEQUENTIAL_AND_POOL_TESTS_PASS\n";
}
