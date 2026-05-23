# C++ IO算法竞赛模板
## 基础优化与输入输出
### 1.1 基础优化
**适用场景：** 所有算法竞赛题目的代码标配，开启快速IO以提升输入输出速度。
**题型特征：** 任何需要高效读写的题目（特别是 n ≥ 10⁵ 时），搭配 -O2 优化使用。
```cpp
#include <bits/stdc++.h>
using namespace std;
#define int long long
#define endl '\\n'
#define fastio ios::sync_with_stdio(false), cin.tie(nullptr), cout.tie(nullptr)
```
### 1.2 快读快写
**适用场景：** 输入数据量极大的题目（n ≥ 10⁵），避免 cin/cout 的性能瓶颈。
**题型特征：** 题目给出大量整数或浮点数输入，需用 getchar 手写快速解析；注意整数可能为负。
```cpp
inline int read() {
    int x = 0, f = 1; char c = getchar();
    while (c < '0' || c > '9') { if (c == '-') f = -1; c = getchar(); }
    while (c >= '0' && c <= '9') x = x * 10 + c - '0', c = getchar();
    return x * f;
}
inline void write(int x) {
    if (x < 0) putchar('-'), x = -x;
    if (x > 9) write(x / 10);
    putchar(x % 10 + '0');
}
```
### 1.3 常用宏定义
**适用场景：** 提供竞赛中常用的类型别名和循环宏，嵌入代码头部简化编码。
**题型特征：** 通用辅助，适用于任何 C++ 竞赛代码。
```cpp
#define ll long long
#define ull unsigned long long
#define pii pair<int, int>
#define pll pair<ll, ll>
#define vi vector<int>
#define vl vector<ll>
#define fi first
#define se second
#define pb push_back
#define eb emplace_back
#define all(x) (x).begin(), (x).end()
#define sz(x) (int)(x).size()
#define rep(i, a, b) for (int i = (a); i <= (b); i++)
#define per(i, a, b) for (int i = (a); i >= (b); i--)
#define debug(x) cerr << #x << " = " << x << endl
```
### 1.4 数学常数
**适用场景：** 提供 π、INF、取模常量等基础数值常量。
**题型特征：** 几何题用 PI，图论最优化用 INF，计数题用 MOD。
```cpp
const double PI = acos(-1.0);
const double E = exp(1.0);
const int MOD = 1e9 + 7;
const int MOD1 = 998244353;
const int INF = 0x3f3f3f3f;
const ll LINF = 0x3f3f3f3f3f3f3f3f;
```
## 数学
### 2.1 快速幂
**适用场景：** 在 O(log b) 时间内计算 a^b mod p，用于指数型计算、费马小定理求逆元等。
**题型特征：** 幂运算取模、大指数计算（b 可达 10¹⁸）、模意义下的快速幂。
```cpp
ll qpow(ll a, ll b, ll mod) {
    ll res = 1;
    while (b) {
        if (b & 1) res = res * a % mod;
        a = a * a % mod;
        b >>= 1;
    }
    return res;
}
ll qpow(ll a, ll b) { // 不带模
    ll res = 1;
    while (b) {
        if (b & 1) res *= a;
        a *= a;
        b >>= 1;
    }
    return res;
}
```
### 2.2 GCD/LCM & 扩展欧几里得
**适用场景：** 求最大公约数、最小公倍数；解同余方程 ax + by = gcd(a,b)。
**题型特征：** 数论方程求解、模线性方程（模逆元通过 exgcd 求解）、裴蜀定理相关。
```cpp
ll gcd(ll a, ll b) { return b ? gcd(b, a % b) : a; }
ll lcm(ll a, ll b) { return a / gcd(a, b) * b; }
// 扩展欧几里得
ll exgcd(ll a, ll b, ll &x, ll &y) {
    if (!b) { x = 1, y = 0; return a; }
    ll d = exgcd(b, a % b, y, x);
    y -= a / b * x;
    return d;
}
```
### 2.3 逆元求法
**适用场景：** 模意义下的除法运算，将除法转化为乘法。
**题型特征：** 组合数取模 C(n,m) % MOD、分数取模 a/b % MOD、概率期望取模、几何级数求和。
```cpp
ll inv(ll a, ll mod) { return qpow(a, mod - 2, mod); }
// 线性求逆元
void init_inv(int n, int mod) {
    vector<ll> inv(n + 1);
    inv[1] = 1;
    for (int i = 2; i <= n; i++)
        inv[i] = (mod - mod / i) * inv[mod % i] % mod;
}
```
### 2.4 组合数
**适用场景：** 预处理阶乘和逆元后 O(1) 求组合数 C(n,m) % MOD，n 和 m 在 10⁶ 以内。
**题型特征：** 排列组合计数、二项式系数、概率计算。
```cpp
const int N = 1e6 + 10;
ll fact[N], invfact[N];
void init(int n, int mod) {
    fact[0] = 1;
    for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % mod;
    invfact[n] = qpow(fact[n], mod - 2, mod);
    for (int i = n - 1; i >= 0; i--) invfact[i] = invfact[i + 1] * (i + 1) % mod;
}
ll C(int n, int m, int mod) {
    if (m < 0 || m > n) return 0;
    return fact[n] * invfact[m] % mod * invfact[n - m] % mod;
}
```
### 2.5 质数筛（线性筛）
**适用场景：** O(n) 时间内筛出 [1, n] 的所有质数，每个合数被其最小质因子筛去。
**题型特征：** 质数判断、质因数分解预处理、求最小质因子（minp）、多组查询第 k 小质数。
```cpp
vector<int> primes;
bool isp[N];
void sieve(int n) {
    fill(isp, isp + n + 1, true);
    isp[0] = isp[1] = false;
    for (int i = 2; i <= n; i++) {
        if (isp[i]) primes.pb(i);
        for (int p : primes) {
            if (i * p > n) break;
            isp[i * p] = false;
            if (i % p == 0) break;
        }
    }
}
```
### 2.6 线性基
**适用场景：** 求一组数的最大异或和，维护线性无关的异或空间。
**题型特征：** 异或最大值、异或最小值、第 k 小异或值、判断一个数能否由给定集合异或得到。
```cpp
class Basis {
public:
    int cnt;
    ll d[64];
    inline void operator+=(ll x) {
        for(int i = 63; \~i; i--)
            if(x >> i & 1) {
                if(!d[i]) {
                    d[i] = x;
                    cnt++;
                    break;
                } else
                    x ^= d[i];
            }
    }
} bs;
int main() {
    for(int i = Read(); i; i--) bs += Read();
    ll ans = 0;
    for(int i = 63; \~i; i--)
        if((ans ^ bs.d[i]) > ans) ans ^= bs.d[i];
    printf("%lld\\n", ans);
    return 0;
}
```
### 2.7 矩阵快速幂
**适用场景：** 线性递推加速（如斐波那契数列），将递推转化为矩阵幂运算。
**题型特征：** 递推式 f(n) = a·f(n-1) + b·f(n-2) + ...、n 极大（10¹⁸）、状态转移矩阵。
```cpp
typedef long long ll;
constexpr int AwA = 1e2 + 10;
constexpr int Mod = 1e9 + 7;
class Matrix {
private:
    //n是行数，m是列数
    int n, m;
    ll a[AwA][AwA];
public:
    Matrix() = default;
    Matrix(int n, int m) : n(n), m(m) { memset(a, 0, sizeof a); }
    //方便调用
    inline ll *operator[](int x) { return a[x]; }
    //-同理不写了
    inline Matrix operator+(Matrix &m1) const {
        Matrix res(n, m);
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= m; j++)
                res[i][j] = (a[i][j] + m1[i][j]) % Mod;
        return res;
    }
    inline Matrix operator*(Matrix &m1) const {
        int q = m1.m;
        ll r;
        Matrix res(n, q);
        //换枚举方式减小常数
        for (int i = 1; i <= n; i++)
            for (int k = 1; k <= m; k++) {
                r = a[i][k];
                for (int j = 1; j <= q; j++)
                    res[i][j] = (res[i][j] + r * m1[k][j]) % Mod;
            }
        return res;
    }
    inline Matrix operator^(ll k) const {
        Matrix res(n, n);
        for (int i = 1; i <= n; i++) res[i][i] = 1;
        Matrix b(n, n);
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= n; j++)
                b[i][j] = a[i][j];
        while (k) {
            if (k & 1) res = res * b;
            b = b * b;
            k >>= 1;
        }
        return res;
    }
};
int main() {
    int n = Read();
    ll k = Read<ll>();
    Matrix a(n, n);
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            a[i][j] = Read();
    Matrix res = a ^ k;
    for (int i = 1; i <= n; i++, putchar('\\n'))
        for (int j = 1; j <= n; j++)
            printf("%lld ", res[i][j]);
    return 0;
}
```
## 数据结构
### 3.1 并查集 DSU
**适用场景：** 维护不相交集合的合并与查询操作，近乎 O(1) 判断两个元素是否连通。
**题型特征：** 连通性判断、最小生成树辅助、离线查询连通分量、动态合并集合。
```cpp
struct DSU {
    vector<int> fa, sz;
    DSU(int n) : fa(n + 1), sz(n + 1, 1) {
        iota(all(fa), 0);
    }
    int find(int x) { return fa[x] == x ? x : fa[x] = find(fa[x]); }
    void merge(int x, int y) {
        x = find(x), y = find(y);
        if (x == y) return;
        if (sz[x] < sz[y]) swap(x, y);
        fa[y] = x, sz[x] += sz[y];
    }
    bool same(int x, int y) { return find(x) == find(y); }
};
```
### 3.2 树状数组 BIT
**适用场景：** 单点修改 + 区间前缀和查询，支持逆序对、第 k 小、LIS 优化、二维偏序等扩展。
**题型特征：** 动态前缀和、区间求和（O(log n)）、值域较大需配合离散化。
```cpp
struct BIT {
    vector<T> c;
    int n;
    BIT(int n) : n(n), c(n + 1) {}
    void add(int x, T v) { for (; x <= n; x += x & -x) c[x] += v; }
    T sum(int x) { T res = 0; for (; x; x -= x & -x) res += c[x]; return res; }
    T sum(int l, int r) { return sum(r) - sum(l - 1); }
    int kth(T k) { // 第k小
        int x = 0;
        for (int i = 1 << 20; i; i >>= 1)
            if (x + i <= n && c[x + i] < k)
                x += i, k -= c[x];
        return x + 1;
    }
};
```
### 3.3 线段树
**适用场景：** 区间修改（加/乘/赋值）和区间查询（和/最值），支持懒标记下传。
**题型特征：** 多次区间操作、n 和 q 均大于 10⁵ 时 O(log n) 处理。
```cpp
struct SegTree {
    vector<T> tr, lazy;
    int n;
    SegTree(int n) : n(n), tr(n << 2), lazy(n << 2) {}
    void pushup(int u) { tr[u] = tr[u << 1] + tr[u << 1 | 1]; }
    void pushdown(int u, int l, int r) {
        if (!lazy[u]) return;
        int mid = l + r >> 1;
        tr[u << 1] += lazy[u] * (mid - l + 1);
        tr[u << 1 | 1] += lazy[u] * (r - mid);
        lazy[u << 1] += lazy[u];
        lazy[u << 1 | 1] += lazy[u];
        lazy[u] = 0;
    }
    void update(int u, int l, int r, int ql, int qr, T v) {
        if (ql <= l && r <= qr) {
            tr[u] += v * (r - l + 1);
            lazy[u] += v;
            return;
        }
        pushdown(u, l, r);
        int mid = l + r >> 1;
        if (ql <= mid) update(u << 1, l, mid, ql, qr, v);
        if (qr > mid) update(u << 1 | 1, mid + 1, r, ql, qr, v);
        pushup(u);
    }
    T query(int u, int l, int r, int ql, int qr) {
        if (ql <= l && r <= qr) return tr[u];
        pushdown(u, l, r);
        int mid = l + r >> 1;
        T res = 0;
        if (ql <= mid) res += query(u << 1, l, mid, ql, qr);
        if (qr > mid) res += query(u << 1 | 1, mid + 1, r, ql, qr);
        return res;
    }
};
```
### 3.4 主席树（可持久化线段树）
**适用场景：** 静态数组的区间第 k 小（大）查询，利用可持久化保存历史版本。
**题型特征：** 区间第 k 大/小、离线查询、值域离散化、前缀和思想构建版本树。
```cpp
constexpr int AwA = 2e5 + 10;
//空间复杂度nlogK尽量开大点
constexpr int PwP = 5e6 + 10;
struct Node {
    int lc, rc, val;
} tr[PwP];
int n, m, K, tot;
int a[AwA], b[AwA];
int rt[AwA];
void Update(int &u, int nu, int l, int r, int pos) {
    tr[u = ++tot] = tr[nu];
    tr[u].val++;
    if (l == r) return;
    int mid = (l + r) >> 1;
    if (pos <= mid) Update(tr[u].lc, tr[nu].lc, l, mid, pos);
    else Update(tr[u].rc, tr[nu].rc, mid + 1, r, pos);
}
//类似前缀和的查询
int Query(int lu, int ru, int l, int r, int rk) {
    if (l == r) return l;
    return rk <= tr[tr[ru].lc].val - tr[tr[lu].lc].val ?
           Query(tr[lu].lc, tr[ru].lc, l, (l + r) >> 1, rk) :
           Query(tr[lu].rc, tr[ru].rc, ((l + r) >> 1) + 1, r, rk - tr[tr[ru].lc].val + tr[tr[lu].lc].val);
}
int main() {
    n = Read(), m = Read();
    for (int i = 1; i <= n; i++) b[i] = a[i] = Read();
    //离散化
    sort(b + 1, b + n + 1);
    K = int(unique(b + 1, b + n + 1) - b - 1);
    for (int i = 1; i <= n; i++) a[i] = int(lower_bound(b + 1, b + K + 1, a[i]) - b);
    for (int i = 1; i <= n; i++) Update(rt[i], rt[i - 1], 1, K, a[i]);
    int l, r, rk;
    while (m--) {
        l = Read(), r = Read(), rk = Read();
        printf("%d\\n", b[Query(rt[l - 1], rt[r], 1, K, rk)]);
    }
    return 0;
}
```
### 3.5 ST表
**适用场景：** 静态数组的区间最值查询（RMQ），O(n log n) 预处理，O(1) 查询。
**题型特征：** 无修改操作的区间最值查询、可重复贡献问题（max/min/gcd）。
```cpp
constexpr int AwA = 1e5 + 10;
constexpr int QwQ = 21;
int n, m;
int f[AwA][QwQ], a[AwA];
inline void PreST() {
    for (int i = 1; i <= n; i++) f[i][0] = a[i];
    for (int j = 1; j <= __lg(n); j++)
        for (int i = 1; i + (1 << j) - 1 <= n; i++)
            f[i][j] = max(f[i][j - 1], f[i + (1 << (j - 1))][j - 1]);
}
inline int Query(int l, int r) {
    int k = __lg(r - l + 1);
    return max(f[l][k], f[r - (1 << k) + 1][k]);
}
int main() {
    n = Read(), m = Read();
    for (int i = 1; i <= n; i++) a[i] = Read();
    PreST();
    while (m--) {
        int l = Read(), r = Read();
        printf("%d\\n", Query(l, r));
    }
    return 0;
}
```
### 3.6 单调队列
**适用场景：** 滑动窗口最值问题，O(n) 时间维护区间最值。
**题型特征：** 固定长度连续子数组的最值、窗口滑动、先进先出。
```cpp
struct node { int v, n; }; 
int n, m, a[2000000], ans[2000000][2];
deque<node> q, q1; //双向队列，可以从两头增加删除
int main()
{
    scanf("%d%d",&n, &m);
    for (int i=1;i<=n;i++) {
        scanf("%d",&a[i]);
        while (!q.empty() && q.front().n <= i-m) q.pop_front();
        while (!q.empty() && q.back().v  > a[i]) q.pop_back(); 
        q.push_back((node){a[i], i});
        while (!q1.empty() && q1.front().n <= i-m) q1.pop_front();
        while (!q1.empty() && q1.back().v  < a[i]) q1.pop_back(); 
        q1.push_back((node){a[i], i});
    }
    return 0;
}
```
### 3.7 FHQ Treap（普通平衡树）
**适用场景：** 动态集合的插入、删除、前驱后继、排名和第 k 大查询。
**题型特征：** 需维护有序集合、支持分裂合并、无旋转实现。
```cpp
constexpr int AwA = 1e6 + 10;
//生成随机数
mt19937 rd{random_device()()};
struct Node {
    int lc, rc, sz;
    int val;
    //mt19937 返回uint类型
    unsigned int rd;
} tr[AwA];
int rt, tot;
inline int NewNode(int _val) {
    tr[++tot] = {0, 0, 1, _val, rd()};
    return tot;
}
inline void PushUp(int u) {
    tr[u].sz = tr[tr[u].lc].sz + tr[tr[u].rc].sz + 1;
}
void SplitVal(int u, int val, int &x, int &y) {
    //压行.jpg
    if (!u) return void(x = y = 0);
    if (tr[u].val <= val) {
        x = u;
        SplitVal(tr[u].rc, val, tr[x].rc, y);
    } else {
        y = u;
        SplitVal(tr[u].lc, val, x, tr[y].lc);
    }
    PushUp(u);
}
int Merge(int x, int y) {
    if (!x || !y) return x | y;
    if (tr[x].rd <= tr[y].rd) {
        tr[x].rc = Merge(tr[x].rc, y);
        PushUp(x);
        return x;
    }
    tr[y].lc = Merge(x, tr[y].lc);
    PushUp(y);
    return y;
}
inline void Insert(int _val) {
    int x, y;
    SplitVal(rt, _val, x, y);
    rt = Merge(Merge(x, NewNode(_val)), y);
}
int main() {
    int Q = Read();
    while (Q--) {
        int op = Read(), v = Read();
        if (op == 1) Insert(v);
        else if (op == 2) {
            int x, y, z;
            SplitVal(rt, v, x, z);
            SplitVal(x, v - 1, x, y);
            y = Merge(tr[y].lc, tr[y].rc);
            rt = Merge(Merge(x, y), z);
        } else if (op == 3) {
            int x, y;
            SplitVal(rt, v - 1, x, y);
            printf("%d\\n", tr[x].sz + 1);
            rt = Merge(x, y);
        } else if (op == 4) {
            int u = rt;
            while (true) {
                int sz = tr[tr[u].lc].sz + 1;
                if (sz == v) break;
                else if (sz > v) u = tr[u].lc;
                else u = tr[u].rc, v -= sz;
            }
            printf("%d\\n", tr[u].val);
        } else if (op == 5) {
            int x, y;
            SplitVal(rt, v - 1, x, y);
            int u = x;
            while (tr[u].rc) u = tr[u].rc;
            rt = Merge(x, y);
            printf("%d\\n", tr[u].val);
        } else {
            int x, y;
            SplitVal(rt, v, x, y);
            int u = y;
            while (tr[u].lc) u = tr[u].lc;
            rt = Merge(x, y);
            printf("%d\\n", tr[u].val);
        }
    }
    return 0;
}
```
### 3.8 FHQ Treap（文艺平衡树）
**适用场景：** 序列上的区间翻转操作。
**题型特征：** 数组区间翻转、懒标记实现、分裂合并维护序列。
```cpp
constexpr int AwA = 1e5 + 10;
mt19937 rd{random_device()()};
struct Node {
    int lc, rc, sz;
    int val;
    unsigned int rd;
    bool revTag;
} tr[AwA];
int rt, tot;
inline int NewNode(int _val) {
    tr[++tot] = {0, 0, 1, _val, rd(), false};
    return tot;
}
inline void PushUp(int u) {
    tr[u].sz = tr[tr[u].lc].sz + tr[tr[u].rc].sz + 1;
}
inline void PushDown(int u) {
    if (!tr[u].revTag) return;
    swap(tr[u].lc, tr[u].rc);
    if (tr[u].lc) tr[tr[u].lc].revTag ^= 1;
    if (tr[u].rc) tr[tr[u].rc].revTag ^= 1;
    tr[u].revTag = false;
}
void SplitSz(int u, int sz, int &x, int &y) {
    if (!u) return void(x = y = 0);
    PushDown(u);
    if (tr[tr[u].lc].sz + 1 <= sz) {
        x = u;
        SplitSz(tr[u].rc, sz - tr[tr[u].lc].sz - 1, tr[x].rc, y);
    } else {
        y = u;
        SplitSz(tr[u].lc, sz, x, tr[y].lc);
    }
    PushUp(u);
}
int Merge(int x, int y) {
    if (!x || !y) return x | y;
    if (tr[x].rd <= tr[y].rd) {
        PushDown(x);
        tr[x].rc = Merge(tr[x].rc, y);
        PushUp(x);
        return x;
    }
    PushDown(y);
    tr[y].lc = Merge(x, tr[y].lc);
    PushUp(y);
    return y;
}
inline void Build(int n) {
    for (int i = 1; i <= n; i++) NewNode(i);
    static int stk[AwA], top;
    stk[top = 1] = 1;
    for (int i = 2; i <= n; i++) {
        int tmp = 0;
        while (top && tr[stk[top]].rd > tr[i].rd) PushUp(tmp = stk[top--]);
        if (top) tr[stk[top]].rc = i;
        if (tmp) tr[i].lc = tmp;
        stk[++top] = i;
    }
    for (int i = top; i; i--) PushUp(i);
    rt = stk[1];
}
void Print(int u) {
    if (!u) return;
    PushDown(u);
    Print(tr[u].lc);
    printf("%d ", tr[u].val);
    Print(tr[u].rc);
}
int main() {
    int n = Read(), Q = Read();
    Build(n);
    while (Q--) {
        int l = Read(), r = Read();
        int x, y, z;
        SplitSz(rt, r, x, z);
        SplitSz(x, l - 1, x, y);
        tr[y].revTag ^= 1;
        rt = Merge(Merge(x, y), z);
    }
    Print(rt);
    putchar('\\n');
    return 0;
}
```
### 3.9 块状链表
**适用场景：** 维护序列的插入、删除和随机访问，平衡大小块保证操作复杂度。
**题型特征：** 大规模序列操作、分块思想、插入删除频繁。
```cpp
static constexpr int QwQ = 1e3;
struct Node {
    int nxt, sz;
    int a[(QwQ << 1) + 10];
    inline void Insert(int pos, int val) {
        for (int i = sz; i >= pos; i--) a[i + 1] = a[i];
        a[pos] = val;
        sz++;
    }
    inline void Delete(int pos) {
        for (int i = pos; i < sz; i++) a[i] = a[i + 1];
        sz--;
    }
} t[QwQ + 10];
int tcnt = 1;
inline void Check(int u) {
    if (t[u].sz < QwQ << 1) return;
    int v = ++tcnt;
    t[v].nxt = t[u].nxt;
    t[u].nxt = v;
    t[v].sz = t[u].sz - QwQ;
    for (int i = 1; i <= t[v].sz; i++) t[v].a[i] = t[u].a[i + QwQ];
    t[u].sz = QwQ;
}
inline void Insert(int pos, int val) {
    int u;
    for (u = 1; t[u].nxt && t[u].sz < pos; pos -= t[u].sz, u = t[u].nxt);
    t[u].Insert(min(pos, t[u].sz + 1), val);
    Check(u);
}
inline int Query(int pos) {
    int u;
    for (u = 1; t[u].nxt && t[u].sz < pos; pos -= t[u].sz, u = t[u].nxt);
    return t[u].a[pos];
}
inline void Delete(int pos) {
    int u;
    for (u = 1; t[u].nxt && t[u].sz < pos; pos -= t[u].sz, u = t[u].nxt);
    t[u].Delete(pos);
}
```
### 3.10 离散化
**适用场景：** 将值域范围极大（如 -10⁹ ~ 10⁹）但数据量不多的点映射到连续的 [1, N] 区间。
**题型特征：** 坐标压缩、以值作数组下标但值域过大、树状数组/线段树等的预处理步骤。
```cpp
vector<int> alls;
sort(all(alls)), alls.erase(unique(all(alls)), alls.end());
int find(int x) { return lower_bound(all(alls), x) - alls.begin() + 1; }
```
## 图论
### 4.1 拓扑排序
**适用场景：** 对 DAG（有向无环图）的顶点进行线性排序，使得每条边 u→v 满足 u 在 v 前。
**题型特征：** 任务依赖关系、课程安排、编译依赖、判环。
```cpp
vector<int> topo(int n, vector<vector<int>>& g) {
    vector<int> deg(n + 1), res;
    for (int u = 1; u <= n; u++)
        for (int v : g[u]) deg[v]++;
    queue<int> q;
    for (int i = 1; i <= n; i++)
        if (!deg[i]) q.push(i);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        res.pb(u);
        for (int v : g[u])
            if (--deg[v] == 0) q.push(v);
    }
    return res;
}
```
### 4.2 最短路 Dijkstra
**适用场景：** 非负权图的单源最短路，O((n+m)log n)。
**题型特征：** 边权非负的最短路问题、最短路计数、路径打印。
```cpp
constexpr int AwA = 1e5 + 10;
constexpr int QwQ = 2e5 + 10;
struct Edge {
    int nxt, v, w;
} e[QwQ];
int head[AwA], ecnt;
inline void AddEdge(int w, int v, int u) {
    e[++ecnt] = {head[u], v, w};
    head[u] = ecnt;
}
int n, m, S;
int dis[AwA];
bool vis[AwA];
inline void Dijkstra() {
    priority_queue<pair<int, int>> q;
    memset(dis + 1, 0x3f, sizeof(int) * n);
    memset(vis + 1, 0, sizeof(bool) * n);
    dis[S] = 0;
    q.emplace(0, S);
    while (!q.empty()) {
        int u = q.top().second;
        q.pop();
        if (vis[u]) continue;
        vis[u] = true;
        for (int i = head[u]; i; i = e[i].nxt) {
            int v = e[i].v;
            if (dis[u] + e[i].w < dis[v]) {
                dis[v] = dis[u] + e[i].w;
                q.emplace(-dis[v], v);
            }
        }
    }
}
int main() {
    n = Read(), m = Read(), S = Read();
    for (int i = 1; i <= m; i++) AddEdge(Read(), Read(), Read());
    Dijkstra();
    for (int i = 1; i <= n; i++) printf("%d ", dis[i]);
    putchar('\\n');
    return 0;
}
```
### 4.3 SPFA & 判负环
**适用场景：** 带负权边的最短路（Bellman-Ford 的队列优化），同时可检测负环。
**题型特征：** 图中存在负权边、需判断是否存在负权回路。
```cpp
constexpr int AwA = 1e4 + 10;
constexpr int QwQ = 5e5 + 10;
struct Edge {
    int nxt, v, w;
} e[QwQ];
int head[AwA], ecnt;
inline void AddEdge(int w, int v, int u) { e[++ecnt] = {head[u], v, w}, head[u] = ecnt; }
int n, m, S;
int q[AwA], ql, qr;
int dis[AwA];
bool inq[AwA];
void Spfa() {
    for (int i = 1; i <= n; i++) dis[i] = INT_MAX;
    memset(inq + 1, 0, sizeof(bool) * n);
    dis[S] = 0;
    ql = qr = 1;
    q[qr] = S;
    inq[S] = true;
    //手写循环队列
    auto dq = [&](int x) -> int & { return q[(x - 1) % n + 1]; };
    while (ql <= qr) {
        int u = dq(ql++);
        //SLF-swap优化
        if (dis[dq(ql)] > dis[dq(qr)]) swap(dq(ql), dq(qr));
        for (int i = head[u]; i; i = e[i].nxt) {
            int v = e[i].v;
            if (dis[v] > dis[u] + e[i].w) {
                dis[v] = dis[u] + e[i].w;
                if (!inq[v]) {
                    dq(++qr) = v;
                    inq[v] = true;
                    if (dis[dq(ql)] > dis[dq(qr)]) swap(dq(ql), dq(qr));
                }
            }
        }
        inq[u] = false;
    }
}
int main() {
    n = Read(), m = Read(), S = Read();
    while (m--) AddEdge(Read(), Read(), Read());
    Spfa();
    for (int i = 1; i <= n; i++) printf("%d ", dis[i]);
    putchar('\\n');
    return 0;
}
```
### 4.4 差分约束
**适用场景：** 求解形如 x_i - x_j ≤ c 的多元一次不等式组，转化为最短路问题。
**题型特征：** 不等式约束系统、可行解判断、最大/小值求解。
```cpp
constexpr int AwA = 5e3 + 10;
constexpr int QwQ = 1e4 + 10;
struct Edge {
    int nxt, v, w;
} e[QwQ];
int head[AwA], ecnt;
inline void AddEdge(int w, int u, int v) { e[++ecnt] = {head[u], v, w}, head[u] = ecnt; }
int n, m;
int q[AwA], ql, qr;
int dis[AwA], cnt[AwA];
bool inq[AwA];
bool Spfa() {
    memset(dis + 1, 0x3f, sizeof(int) * n);
    memset(inq + 1, 0, sizeof(bool) * n);
    dis[n + 1] = cnt[n + 1] = 0;
    ql = qr = 1;
    q[qr] = n + 1;
    inq[n + 1] = true;
    auto dq = [&](int x) -> int & { return q[(x - 1) % (n + 1) + 1]; };
    while (ql <= qr) {
        int u = dq(ql++);
        if (dis[dq(ql)] > dis[dq(qr)]) swap(dq(ql), dq(qr));
        for (int i = head[u]; i; i = e[i].nxt) {
            int v = e[i].v;
            if (dis[v] > dis[u] + e[i].w) {
                dis[v] = dis[u] + e[i].w;
                cnt[v] = cnt[u] + 1;
                if (cnt[v] >= n + 1) return true;
                if (!inq[v]) {
                    dq(++qr) = v;
                    inq[v] = true;
                    if (dis[dq(ql)] > dis[dq(qr)]) swap(dq(ql), dq(qr));
                }
            }
        }
        inq[u] = false;
    }
    return false;
}
int main() {
    n = Read(), m = Read();
    while (m--) AddEdge(Read(), Read(), Read());
    for (int i = 1; i <= n; i++) AddEdge(0, n + 1, i);
    //SPFA部分基本同上面判负环那个
    if (Spfa()) puts("NO");
    else {
        for (int i = 1; i <= n; i++) printf("%d ", dis[i]);
        putchar('\\n');
    }
    return 0;
}
```
### 4.5 最小生成树 Kruskal
**适用场景：** 求无向图的最小生成树，基于边排序 + 并查集，O(m log m)。
**题型特征：** 连通所有点的最小代价、边数较少（稀疏图）。
```cpp
constexpr int AwA = 5e3 + 10;
constexpr int QwQ = 2e5 + 10;
struct {
    int u, v, w;
} e[QwQ];
int n, m;
int fa[AwA];
int Find(int x) { return fa[x] ? fa[x] = Find(fa[x]) : x; }
inline int Kruskal() {
    sort(e + 1, e + m + 1, [](auto &e1, auto &e2) { return e1.w < e2.w; });
    int cnt = 0, ans = 0;
    for (int i = 1; i <= m && cnt < n - 1; i++) {
        int x = Find(e[i].u), y = Find(e[i].v);
        if (x == y) continue;
        fa[x] = y;
        ans += e[i].w;
        cnt++;
    }
    return cnt == n - 1 ? ans : -1;
}
int main() {
    n = Read(), m = Read();
    for (int i = 1; i <= m; i++) e[i] = {Read(), Read(), Read()};
    int res = Kruskal();
    \~res ? printf("%d\\n", res) : puts("orz");
    return 0;
}
```
### 4.6 Tarjan 强连通分量（缩点）
**适用场景：** 将有向图的强连通分量缩成一个点，将原图变为 DAG。
**题型特征：** 有向图的环处理、缩点后 DP/拓扑、互相可达关系。
```cpp
int dfn[AwA], low[AwA], co[AwA], sz[AwA];
int stk[AwA];
void Tarjan(int u) {
    dfn[u] = low[u] = ++dfn[0];
    stk[++stk[0]] = u;
    for (int i = head[u]; i; i = e[i].nxt) {
        int v = e[i].v;
        if (!dfn[v]) {
            Tarjan(v);
            low[u] = min(low[u], low[v]);
        } else if (!co[v]) low[u] = min(low[u], dfn[v]);
    }
    if (dfn[u] == low[u]) {
        co[u] = ++co[0];
        sz[co[0]] = 1;
        while (stk[stk[0]] != u) {
            co[stk[stk[0]--]] = co[0];
            sz[co[0]]++;
        }
        stk[0]--;
    }
}
```
### 4.7 Tarjan 求割点
**适用场景：** 求无向图中的割点（删除后图不连通的点）。
**题型特征：** 关键节点判定、连通性分析、DFS 树 low 值判断。
```cpp
constexpr int AwA = 2e4 + 10;
constexpr int QwQ = 1e5 + 10;
struct Edge {
    int nxt, v;
} e[QwQ << 1];
int head[AwA], ecnt = 1;
inline void AddEdge(int u, int v) {
    e[++ecnt] = {head[u], v}, head[u] = ecnt;
    e[++ecnt] = {head[v], u}, head[v] = ecnt;
}
int n, m;
int dfn[AwA], low[AwA];
bool ans[AwA];
void Tarjan(int u, int ew = 0) {
    dfn[u] = low[u] = ++dfn[0];
    int cnt = 0;
    for (int i = head[u]; i; i = e[i].nxt) {
        if ((ew ^ 1) == i) continue;
        int v = e[i].v;
        if (!dfn[v]) {
            cnt++;
            Tarjan(v, i);
            low[u] = min(low[u], low[v]);
            if (ew && low[v] >= dfn[u]) ans[u] = true;
        } else low[u] = min(low[u], dfn[v]);
    }
    if (!ew && cnt >= 2) ans[u] = true;
}
int main() {
    n = Read(), m = Read();
    for (int i = 1; i <= m; i++) AddEdge(Read(), Read());
    for (int i = 1; i <= n; i++) if (!dfn[i]) Tarjan(i);
    int res = 0;
    for (int i = 1; i <= n; i++) res += ans[i];
    printf("%d\\n", res);
    for (int i = 1; i <= n; i++) if (ans[i]) printf("%d ", i);
    putchar('\\n');
    return 0;
}
```
### 4.8 Tarjan 求割边
**适用场景：** 求无向图中的桥（删除后图不连通的边）。
**题型特征：** 关键边判定、连通性分析、low[v] > dfn[u] 判断。
```cpp
constexpr int AwA = 5e4 + 10;
constexpr int QwQ = 3e5 + 10;
struct Edge {
    int nxt, v;
} e[QwQ << 1];
int head[AwA], ecnt = 1;
inline void AddEdge(int u, int v) {
    e[++ecnt] = {head[u], v}, head[u] = ecnt;
    e[++ecnt] = {head[v], u}, head[v] = ecnt;
}
int n, m, ans;
int dfn[AwA], low[AwA];
void Tarjan(int u, int ew = 0) {
    dfn[u] = low[u] = ++dfn[0];
    for (int i = head[u]; i; i = e[i].nxt) {
        //防止重边
        if ((ew ^ 1) == i) continue;
        int v = e[i].v;
        if (!dfn[v]) {
            Tarjan(v, i);
            low[u] = min(low[u], low[v]);
            if (low[v] > dfn[u]) ans++;
        } else low[u] = min(low[u], dfn[v]);
    }
}
int main() {
    n = Read(), m = Read();
    for (int i = 1; i <= m; i++) AddEdge(Read(), Read());
    for (int i = 1; i <= n; i++) if (!dfn[i]) Tarjan(i);
    printf("%d\\n", ans);
    return 0;
}
```
### 4.9 点双连通分量
**适用场景：** 求无向图的点双连通分量（极大不含割点子图）。
**题型特征：** 点双相关、圆方树构建、割点相关。
```cpp
constexpr int AwA = 5e5 + 10;
constexpr int QwQ = 2e6 + 10;
struct Edge {
    int nxt, v;
} e[QwQ << 1];
int head[AwA], ecnt;
inline void AddEdge(int u, int v) {
    e[++ecnt] = {head[u], v}, head[u] = ecnt;
    e[++ecnt] = {head[v], u}, head[v] = ecnt;
}
int n, m;
int dfn[AwA], low[AwA], stk[AwA], cnt;
vector<int> vdcc[AwA];
void Tarjan(int u, int fa) {
    stk[++stk[0]] = u;
    low[u] = dfn[u] = ++dfn[0];
    int c = 0;
    for (int i = head[u]; i; i = e[i].nxt) {
        int v = e[i].v;
        if (!dfn[v]) {
            c++;
            Tarjan(v, u);
            low[u] = min(low[u], low[v]);
            if (!fa || low[v] >= dfn[u]) {
                vdcc[++cnt].push_back(u);
                for (int k = 0; k != v;) vdcc[cnt].push_back(k = stk[stk[0]--]);
            }
        } else if (v != fa) low[u] = min(low[u], dfn[v]);
    }
    if (!fa && !c) vdcc[++cnt].push_back(u);
}
int main() {
    n = Read(), m = Read();
    while (m--) AddEdge(Read(), Read());
    for (int i = 1; i <= n; i++) if (!dfn[i]) Tarjan(i, 0);
    printf("%d\\n", cnt);
    for (int i = 1; i <= cnt; i++) {
        printf("%lld ", vdcc[i].size());
        for (auto k: vdcc[i]) printf("%d ", k);
        putchar('\\n');
    }
    return 0;
}
```
### 4.10 边双连通分量
**适用场景：** 求无向图的边双连通分量（极大不含桥子图）。
**题型特征：** 边双缩点成树、桥相关。
```cpp
constexpr int AwA = 5e5 + 10;
constexpr int QwQ = 2e6 + 10;
struct Edge {
    int nxt, v;
} e[QwQ << 1];
int head[AwA], ecnt = 1;
inline void AddEdge(int u, int v) {
    e[++ecnt] = {head[u], v}, head[u] = ecnt;
    e[++ecnt] = {head[v], u}, head[v] = ecnt;
}
int n, m;
int dfn[AwA], low[AwA], stk[AwA], cnt;
vector<int> edcc[AwA];
void Tarjan(int u, int fae) {
    stk[++stk[0]] = u;
    low[u] = dfn[u] = ++dfn[0];
    for (int i = head[u]; i; i = e[i].nxt) {
        int v = e[i].v;
        if (!dfn[v]) {
            Tarjan(v, i);
            low[u] = min(low[u], low[v]);
            if (low[v] > dfn[u]) {
                edcc[++cnt].push_back(stk[stk[0]]);
                while (stk[stk[0]--] != v) edcc[cnt].push_back(stk[stk[0]]);
            }
        } else if ((i ^ 1) != fae) low[u] = min(low[u], dfn[v]);
    }
    if (!fae) {
        cnt++;
        while (stk[0]) edcc[cnt].push_back(stk[stk[0]--]);
    }
}
int main() {
    n = Read(), m = Read();
    while (m--) AddEdge(Read(), Read());
    for (int i = 1; i <= n; i++) if (!dfn[i]) Tarjan(i, 0);
    printf("%d\\n", cnt);
    for (int i = 1; i <= cnt; i++) {
        printf("%lld ", edcc[i].size());
        for (auto k: edcc[i]) printf("%d ", k);
        putchar('\\n');
    }
    return 0;
}
```
### 4.11 2-SAT
**适用场景：** 求解 n 个布尔变量的约束满足问题，每约束形如 (x_i = v_x) ∨ (x_j = v_j)。
**题型特征：** 二元逻辑约束、需要为变量赋值的可行性判断、Tarjan 缩点后按拓扑逆序赋值。
```cpp
static constexpr int AwA = 2e6 + 10;
struct Edge {
    int nxt, v;
} e[AwA];
int head[AwA], ecnt;
inline void AddEdge(int u, int v) { e[++ecnt] = {head[u], v}, head[u] = ecnt; }
int n, m;
int dfn[AwA], low[AwA], co[AwA], stk[AwA];
void Tarjan(int u) {
    stk[++stk[0]] = u;
    dfn[u] = low[u] = ++dfn[0];
    for (int i = head[u]; i; i = e[i].nxt) {
        int v = e[i].v;
        if (!dfn[v]) Tarjan(v), low[u] = min(low[u], low[v]);
        else if (!co[v]) low[u] = min(low[u], dfn[v]);
    }
    if (dfn[u] == low[u]) {
        co[u] = ++co[0];
        while (stk[stk[0]] != u) co[stk[stk[0]--]] = co[0];
        stk[0]--;
    }
}
int main() {
    n = Read(), m = Read();
    int x, y, vx, vy;
    while (m--) {
        x = Read(), vx = Read(), y = Read(), vy = Read();
        AddEdge(x + (vx ^ 1) * n, y + vy * n);
        AddEdge(y + (vy ^ 1) * n, x + vx * n);
    }
    for (int i = 1; i <= 2 * n; i++) if (!dfn[i]) Tarjan(i);
    for (int i = 1; i <= n; i++)
        if (co[i] == co[i + n]) {
            puts("IMPOSSIBLE");
            return 0;
        }
    puts("POSSIBLE");
    //tarjan跑出来的强连通分量顺序为拓扑逆序
    for (int i = 1; i <= n; i++) printf("%d ", co[i] > co[i + n]);
    putchar('\\n');
    return 0;
}
```
### 4.12 欧拉路径（回路）
**适用场景：** 一笔画问题，判断并输出欧拉路径/回路。
**题型特征：** 度数判断（有向/无向图）、需要输出具体路径、Hierholzer 算法。
```cpp
constexpr int AwA = 1e5 + 10;
constexpr int QwQ = 2e5 + 10;
int n, m;
vector<int> g[AwA];
int in[AwA], out[AwA];
int stk[QwQ];
void Dfs(int u) {
    while(!g[u].empty()) {
        auto p = g[u].back();
        g[u].pop_back();
        Dfs(p);
    }
    //这里一定要倒序存
    stk[++stk[0]] = u;
}
int main() {
    n = Read(), m = Read();
    int u, v;
    for(int i = 1; i <= m; i++) {
        u = Read(), v = Read();
        g[u].push_back(v);
        in[v]++, out[u]++;
    }
    bool f1 = true, f2 = true;
    for(int i = 1; i <= n; i++) {
        if(in[i] == out[i] - 1) {
            if(!f1)
                return puts("No"), 0;
            else
                f1 = false;
        } else if(out[i] == in[i] - 1) {
            if(!f2)
                return puts("No"), 0;
            else
                f2 = false;
        } else if(in[i] != out[i])
            return puts("No"), 0;
    }
    if(f1 ^ f2) return puts("No"), 0;
    //字典序最大
    for(int i = 1; i <= n; i++) sort(g[i].begin(), g[i].end(), greater<int>());
    if(f1)
        Dfs(1);
    else
        for(int i = 1; i <= n; i++)
            if(out[i] == in[i] + 1) {
                Dfs(i);
                break;
            }
    for(int i = stk[0]; i; i--) printf("%d ", stk[i]);
    putchar('\\n');
    return 0;
}
```
### 4.13 Kosaraju 缩点
**适用场景：** 求有向图强连通分量的另一种实现（两次 DFS + 转置图）。
**题型特征：** 强连通分量、缩点后 DAG 上的 DP。
```cpp
const int maxn = 20001, maxm = 100100;
int n, m, a[maxn], u[maxm], v[maxm]; //初始信息
int A[maxn], s[maxn], id[maxn], in[maxn], f[maxn], cnt; 
//s[i] 用栈来模拟倒序, id[i]新图节点编号, in[i]新图的入度;
bool vis[maxn];
vector<int> g[maxn], g1[maxn], G[maxn];
void dfs1(int x) {
    vis[x] = 1;
    for (auto u:g[x]) if (!vis[u]) dfs1(u);
    s[++s[0]] = x; return;
}
void dfs2(int x) {
    id[x] = cnt, A[cnt] += a[x];
    for (auto u:g1[x]) if (!id[u]) dfs2(u);
    return;
}
int topo() {
    queue<int> q; int ans = 0;
    for (int i=1;i<=cnt;i++) if (!in[i]) f[i]=A[i], q.push(i);
    while (!q.empty()) {
        int k = q.front(); q.pop();
        for (auto u:G[k]) {
            f[u] = max(f[u], f[k]+A[u]), in[u]--;
            if (!in[u]) q.push(u);
        }
    }
    for (int i=1;i<=cnt;i++) ans = max(ans, f[i]);
    return ans;
}
int main()
{
    cin >> n >> m;
    for (int i=1;i<=n;i++) cin >> a[i];
    // 缩点
    for (int i=1;i<=m;i++) 
        cin >> u[i] >> v[i], 
        g[ u[i] ].push_back( v[i] ), g1[ v[i] ].push_back( u[i] );
    for (int i=1;i<=n;i++) if (!vis[i]) dfs1(i); 
    for (int i=s[0];i>=1;i--) if (!id[s[i]]) cnt++, dfs2(s[i]);
    // 整合成新图 G
    for (int i=1;i<=m;i++) {
         int x = id[u[i]], y = id[v[i]];
         if (x != y) in[y]++, G[x].push_back(y);
    }
    cout << topo() << '\\n';
    return 0;
}
```
### 4.14 最大网络流 Dinic
**适用场景：** 求网络最大流，分层图 + 当前弧优化。
**题型特征：** 流量网络、最小割、二分图最大匹配。
```cpp
#define A_LARGE_NUM inf
const int N = 1e6;
// s, t 代表超源/超汇
int n, m, s, t, st = 1, fir[N], c[N], d[N];
struct ed{ int u, nex, w; } e[N<<1];
bool v[N]; queue<int> q;
void add(int u,int v,int w) 
{
    e[++st].u = v; e[st].nex = fir[u]; e[fir[u]=st].w = w;
    e[++st].u = u; e[st].nex = fir[v]; e[fir[v]=st].w = w;
}
bool bfs() {
    cle(v, 0), memcpy(c, fir, sizeof(c));
    for (int i=0; i<=t; i++) d[i] = inf/2;
    q.push(s), v[s] = 1, d[s] = 0;
    while (!q.empty()) {
        int k = q.front(); q.pop();
        for (int i=fir[k]; i; i=e[i].nex) {
            int u = e[i].u, w = e[i].w;
            if (d[u]>d[k]+1 && w) {
                d[u] = d[k] + 1;
                if (!v[u]) v[u] = 1, q.push(u);
    }  }    }
    return (d[t] < inf/2);
}
ll dfs(int v, ll f) {
    if (v == t) return f;
    ll mw = 0, used = 0;
    for (int i=c[v]; i; i=e[i].nex) {
        c[v] = i; int u = e[i].u, w = e[i].w;
        if (w && d[u]==d[v]+1) {
            if (mw = dfs(u,min((ll)w, f-used))) {
                e[i].w -= mw, e[i^1].w += mw, used += mw;
                if (used == f) break;
    }   }   }
    return used;
}
ll dinic() {
    ll ans = 0;
    while (bfs()) ans += dfs(s, inf);
    return ans;
}
int main()
{
    cin >> n >> m;
    // 紧张激烈的构造过程
    s = 0, t = A_LARGE_NUM;
    // 最后就一行
    cout << dinic() << '\\n';
    return 0;
}
```
## 树上问题
### 5.1 倍增LCA
**适用场景：** 树上两点最近公共祖先，O(n log n) 预处理，O(log n) 查询。
**题型特征：** 树上的路径查询、树上两点距离、树上差分。
```cpp
constexpr int AwA = 5e5 + 10;
constexpr int QwQ = 21;
struct Edge {
    int nxt, v;
} e[AwA << 1];
int head[AwA], ecnt;
inline void AddEdge(int u, int v) {
    e[++ecnt] = {head[u], v};
    head[u] = ecnt;
}
int n, m, rt;
int fa[AwA][QwQ], dep[AwA];
void Dfs(int u, int _fa) {
    fa[u][0] = _fa;
    dep[u] = dep[fa[u][0]] + 1;
    for (int j = 0; j < __lg(dep[u]); fa[u][j + 1] = fa[fa[u][j]][j], j++);
    for (int i = head[u]; i; i = e[i].nxt) if (e[i].v != fa[u][0]) Dfs(e[i].v, u);
}
inline int LCA(int x, int y) {
    if (dep[x] < dep[y]) swap(x, y);
    for (int i = __lg(dep[x] - dep[y]); \~i; i--)
        if (dep[fa[x][i]] >= dep[y]) x = fa[x][i];
    if (x == y) return x;
    for (int i = __lg(dep[x]); \~i; i--)
        if (fa[x][i] != fa[y][i])
            x = fa[x][i], y = fa[y][i];
    return fa[x][0];
}
int main() {
    n = Read(), m = Read(), rt = Read();
    for (int i = 1; i < n; i++) {
        int u = Read(), v = Read();
        AddEdge(u, v);
        AddEdge(v, u);
    }
    Dfs(rt, 0);
    while (m--) printf("%d\\n", LCA(Read(), Read()));
    return 0;
}
```
### 5.2 DFS序LCA
**适用场景：** 利用 DFS 序的 RMQ 求 LCA，预处理 O(n log n)，查询 O(1)。
**题型特征：** 需要 O(1) 查询 LCA 的场景（如大量 LCA 查询）。
```cpp
void Dfs(int u, int fa) {
    //这里一定要存成fa
    st[dfn[u] = ++dfn[0]][0] = {dfn[fa], fa};
    for (int i = head[u]; i; i = e[i].nxt) if (e[i].v != fa) Dfs(e[i].v, u);
}
inline int LCA(int x, int y) {
    //特判
    if (x == y) return x;
    if ((x = dfn[x]) > (y = dfn[y])) swap(x, y);
    //这里要查询[x+1,y]
    int k = __lg(y - x++);
    return min(st[x][k], st[y - (1 << k) + 1][k]).second;
}
inline void InitST() {
    for (int j = 1; j <= __lg(n); j++)
        for (int i = 1; i + (1 << j) - 1 <= n; i++)
            st[i][j] = min(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
}
```
### 5.3 欧拉序LCA
**适用场景：** 欧拉序 + ST 表求 LCA，O(n log n) 预处理，O(1) 查询。
**题型特征：** 大规模 LCA 查询的另一种实现，查询常数极小。
```cpp
constexpr int AwA = 5e5 + 10;
constexpr int QwQ = 22;
struct Edge {
    int nxt, v;
} e[AwA << 1];
int head[AwA], ecnt;
inline void AddEdge(int u, int v) {
    e[++ecnt] = {head[u], v};
    head[u] = ecnt;
}
int n, m, rt;
int dep[AwA], dfn[AwA], idfn[AwA << 1];
int f[AwA << 1][QwQ], g[AwA << 1][QwQ];
void Dfs(int u, int fa = 0) {
    dep[u] = dep[fa] + 1;
    idfn[++idfn[0]] = u;
    dfn[u] = idfn[0];
    for (int i = head[u]; i; i = e[i].nxt)
        if (e[i].v != fa) Dfs(e[i].v, u), idfn[++idfn[0]] = u;
}
inline void InitST() {
    for (int i = 1; i <= idfn[0]; i++) f[i][0] = dep[idfn[i]], g[i][0] = idfn[i];
    for (int j = 1; j <= __lg(idfn[0]); j++)
        for (int i = 1; i + (1 << j) - 1 <= idfn[0]; i++) {
            f[i][j] = min(f[i][j - 1], f[i + (1 << (j - 1))][j - 1]);
            if (f[i][j - 1] < f[i + (1 << (j - 1))][j - 1]) g[i][j] = g[i][j - 1];
            else g[i][j] = g[i + (1 << (j - 1))][j - 1];
        }
}
inline int QueryMnPos(int l, int r) {
    int k = __lg(r - l + 1);
    if (f[l][k] < f[r - (1 << k) + 1][k]) return g[l][k];
    return g[r - (1 << k) + 1][k];
}
inline int LCA(int x, int y) {
    int l = dfn[x], r = dfn[y];
    if (l > r) swap(l, r);
    return QueryMnPos(l, r);
}
int main() {
    n = Read(), m = Read(), rt = Read();
    for (int i = 1; i < n; i++) {
        int u = Read(), v = Read();
        AddEdge(u, v);
        AddEdge(v, u);
    }
    Dfs(rt);
    InitST();
    while (m--) printf("%d\\n", LCA(Read(), Read()));
    return 0;
}
```
### 5.4 树链剖分
**适用场景：** 树上路径修改和查询（点/边权），将树转化为链用线段树维护。
**题型特征：** 树上区间操作（路径加/和/最大值）、子树操作。
```cpp
typedef long long ll;
constexpr int AwA = 1e5 + 10;
struct Edge {
    int nxt, v;
} e[AwA << 1];
int head[AwA], ecnt;
inline void AddEdge(int u, int v) {
    e[++ecnt] = {head[u], v};
    head[u] = ecnt;
    e[++ecnt] = {head[v], u};
    head[v] = ecnt;
}
int n, m, rt, Mod;
ll sum[AwA << 2], tag[AwA << 2];
int sz[AwA], son[AwA], fa[AwA], top[AwA], dfn[AwA], dep[AwA];
int a[AwA];
void Update(int u, int l, int r, int lx, int rx, int val) {
    if (l == lx && r == rx) {
        tag[u] += val;
        tag[u] %= Mod;
        return;
    }
    sum[u] += 1ll * val * (rx - lx + 1);
    sum[u] %= Mod;
    int mid = (l + r) >> 1;
    if (lx <= mid) Update(u << 1, l, mid, lx, min(mid, rx), val);
    if (mid + 1 <= rx) Update(u << 1 | 1, mid + 1, r, max(lx, mid + 1), rx, val);
}
ll Query(int u, int l, int r, int lx, int rx) {
    ll res = tag[u] * (rx - lx + 1);
    if (lx == l && r == rx) return (res + sum[u]) % Mod;
    int mid = (l + r) >> 1;
    if (lx <= mid) res += Query(u << 1, l, mid, lx, min(mid, rx));
    if (mid + 1 <= rx) res += Query(u << 1 | 1, mid + 1, r, max(mid + 1, lx), rx);
    return res % Mod;
}
void Dfs1(int u, int _fa) {
    sz[u] = 1;
    fa[u] = _fa;
    dep[u] = dep[fa[u]] + 1;
    for (int i = head[u]; i; i = e[i].nxt)
        if (e[i].v != fa[u]) {
            int v = e[i].v;
            Dfs1(v, u);
            if (sz[v] > sz[son[u]]) son[u] = v;
            sz[u] += sz[v];
        }
}
void Dfs2(int u, int _top) {
    top[u] = _top;
    dfn[u] = ++dfn[0];
    if (son[u]) Dfs2(son[u], top[u]);
    for (int i = head[u]; i; i = e[i].nxt)
        if (e[i].v != fa[u] && e[i].v != son[u]) Dfs2(e[i].v, e[i].v);
}
inline void UpdatePath(int val, int x, int y) {
    while (top[x] != top[y]) {
        if (dep[top[x]] < dep[top[y]]) swap(x, y);
        Update(1, 1, n, dfn[top[x]], dfn[x], val);
        x = fa[top[x]];
    }
    if (dep[x] < dep[y]) swap(x, y);
    Update(1, 1, n, dfn[y], dfn[x], val);
}
inline ll QueryPath(int x, int y) {
    ll res = 0;
    while (top[x] != top[y]) {
        if (dep[top[x]] < dep[top[y]]) swap(x, y);
        res += Query(1, 1, n, dfn[top[x]], dfn[x]);
        x = fa[top[x]];
    }
    if (dep[x] < dep[y]) swap(x, y);
    res += Query(1, 1, n, dfn[y], dfn[x]);
    return res % Mod;
}
int main() {
    n = Read(), m = Read(), rt = Read(), Mod = Read();
    for (int i = 1; i <= n; i++) a[i] = Read();
    for (int i = 1; i < n; i++) AddEdge(Read(), Read());
    Dfs1(rt, 0);
    Dfs2(rt, rt);
    for (int i = 1; i <= n; i++) Update(1, 1, n, dfn[i], dfn[i], a[i]);
    while (m--) {
        int op = Read();
        if (op == 1) UpdatePath(Read(), Read(), Read());
        else if (op == 2) printf("%lld\\n", QueryPath(Read(), Read()));
        else if (op == 3) {
            int u = Read(), v = Read();
            Update(1, 1, n, dfn[u], dfn[u] + sz[u] - 1, v);
        } else {
            int u = Read();
            printf("%lld\\n", Query(1, 1, n, dfn[u], dfn[u] + sz[u] - 1));
        }
    }
    return 0;
}
```
## 字符串
### 6.1 字符串哈希
**适用场景：** 快速比较两个子串是否相等，O(n) 预处理，O(1) 查询。
**题型特征：** 字符串匹配、子串比较、去重、双哈希防碰撞。
```cpp
constexpr int AwA = 1e4 + 10;
struct Hash {
    static constexpr int Mod1 = 1e9 + 7;
    static constexpr int Mod2 = 1e9 + 9;
    static constexpr int P = 131;
    //双哈希
    int h1, h2;
    //空构造为默认构造
    Hash() = default;
    //将给定的字符串视为一个P进制数计算哈希值
    Hash(const char *s) {
        //默认字符串数组下标从1开始
        h1 = h2 = 0;
        int len = int(strlen(s + 1));
        for (int i = 1; i <= len; i++) {
            h1 = int((1ll * h1 * P + s[i]) % Mod1);
            h2 = int((1ll * h2 * P + s[i]) % Mod2);
        }
    }
    //sort要用，使相等的哈希相邻
    inline bool operator<(const Hash &hh) const {
        return h1 < hh.h1 || (h1 == hh.h1 && h2 < hh.h2);
    }
    //unique要用，当且仅当两个哈希值都相等认为两个字符串相等
    inline bool operator==(const Hash &hh) const {
        return h1 == hh.h1 && h2 == hh.h2;
    }
} h[AwA];
int n;
char s[AwA];
int main() {
    n = Read();
    for (int i = 1; i <= n; i++) {
        scanf("%s", s + 1);
        h[i] = Hash(s);
    }
    sort(h + 1, h + n + 1);
    int ans = int(unique(h + 1, h + n + 1) - h - 1);
    printf("%d\\n", ans);
    return 0;
}
```
### 6.2 哈希表
**适用场景：** 高效字符串去重或成员查询，拉链法实现哈希表。
**题型特征：** 大量字符串插入查找、自定义哈希函数。
```cpp
typedef unsigned long long ull;
static constexpr int P = 131;
static constexpr int AwA = 1e4 + 10;
class HashTable {
private:
    //笔者常用的哈希表质数
    static constexpr int Mod = 1e6 + 3;
    struct Node {
        int nxt;
        ull val;
    } p[AwA];
    int head[Mod], pcnt;
public:
    inline void Clear() {
        memset(head, 0, sizeof head);
        pcnt = 0;
    }
    //若待插入的数已在哈希表中返回false，否则插入
    inline bool Insert(ull val) {
        if (Find(val)) return false;
        int hs = int(val % Mod);
        p[++pcnt] = {head[hs], val};
        head[hs] = pcnt;
        return true;
    }
    //查找当前的数是否已在哈希表中
    inline bool Find(ull val) {
        int hs = int(val % Mod);
        for (int i = head[hs]; i; i = p[i].nxt)
            if (p[i].val == val) return true;
        //未找到
        return false;
    }
} mp;
inline ull Hash(const char *s) {
    ull h = 0;
    int len = int(strlen(s + 1));
    //自然溢出，即模2的64次方
    for (int i = 1; i <= len; i++) h = h * P + s[i];
    return h;
}
int n, ans;
char s[AwA];
int main() {
    n = Read();
    for (int i = 1; i <= n; i++) {
        scanf("%s", s + 1);
        if (mp.Insert(Hash(s))) ans++;
    }
    printf("%d\\n", ans);
    return 0;
}
```
### 6.3 KMP
**适用场景：** 模式串匹配，O(n + m) 线性时间。
**题型特征：** 在文本串中查找模式串所有出现位置、求字符串的 border（周期）。
```cpp
vector<int> get_next(const string &s) {
    int n = s.size();
    vector<int> nxt(n + 1);
    for (int i = 1, j = 0; i < n; i++) {
        while (j && s[i] != s[j]) j = nxt[j];
        if (s[i] == s[j]) j++;
        nxt[i + 1] = j;
    }
    return nxt;
}
```
### 6.4 Trie树（字典树）
**适用场景：** 字符串前缀查询与计数，利用公共前缀节省空间。
**题型特征：** 前缀统计、单词查找、01 Trie 用于异或极值。
```cpp
constexpr int AwA = 3e6 + 10;
struct Node {
    int ch[62];
    int cnt;
} tr[AwA];
int tot;
char s[AwA];
inline int CharToInt(char c) {
    if (c <= '9') return c - '0' + 52;
    if (c >= 'a') return c - 'a' + 26;
    return c - 'A';
}
inline int NewNode() {
    tot++;
    memset(tr[tot].ch, 0, sizeof(int) * 62);
    tr[tot].cnt = 0;
    return tot;
}
inline void Insert() {
    int u = 1, len = int(strlen(s + 1));
    for (int i = 1; i <= len; i++) {
        int c = CharToInt(s[i]);
        if (!tr[u].ch[c]) tr[u].ch[c] = NewNode();
        u = tr[u].ch[c];
        tr[u].cnt++;
    }
}
int main() {
    int T = Read();
    while (T--) {
        tot = 0;
        NewNode();
        int n = Read(), m = Read();
        for (int i = 1; i <= n; i++) {
            scanf("%s", s + 1);
            Insert();
        }
        while (m--) {
            scanf("%s", s + 1);
            int u = 1, len = int(strlen(s + 1));
            for (int i = 1; i <= len && u; i++) {
                int c = CharToInt(s[i]);
                u = tr[u].ch[c];
            }
            printf("%d\\n", tr[u].cnt);
        }
    }
    return 0;
}
```
### 6.5 Manacher（回文串）
**适用场景：** 求字符串所有回文子串，O(n) 线性时间。
**题型特征：** 最长回文子串、回文串计数。
```cpp
static constexpr int AwA = 1.1e7 + 10;
int m, n;
//两个数组注意开2倍
char s1[AwA], s[AwA << 1];
int d[AwA << 1];
int ans;
int main() {
    scanf("%s", s1 + 1);
    m = int(strlen(s1 + 1));
    //处理字符串
    n = 2 * m + 1;
    s[0] = '?', s[1] = '#';
    for (int i = 1; i <= m; i++) {
        s[i * 2] = s1[i];
        s[i * 2 + 1] = '#';
    }
    s[n + 1] = '\\0';
    d[1] = 1;
    for (int i = 2, l = 1, r = 1; i <= n; i++) {
        if (i <= r) d[i] = min(r - i + 1, d[r - i + l]);
        while (s[i + d[i]] == s[i - d[i]]) d[i]++;
        if (i + d[i] - 1 >= r) r = i + d[i] - 1, l = i - d[i] + 1;
    }
    //回文子串长度=处理后的回文半径-1
    for (int i = 1; i <= n; i++) ans = max(ans, d[i] - 1);
    printf("%d\\n", ans);
    return 0;
}
```
## 动态规划
### 7.1 01背包
**适用场景：** 每种物品只有一个，选择装或不装，在容量限制下价值最大。
**题型特征：** 背包容量固定、物品仅选一次、一维 DP 倒序枚举。
```cpp
constexpr int AwA = 1e2 + 10;
constexpr int QwQ = 1e3 + 10;
int n, m;
int v[AwA], w[AwA];
int f[QwQ];
int main() {
    m = Read(), n = Read();
    for (int i = 1; i <= n; i++) v[i] = Read(), w[i] = Read();
    //这里枚举j要倒序
    for (int i = 1; i <= n; i++)
        for (int j = m; j >= v[i]; j--)
            f[j] = max(f[j], f[j - v[i]] + w[i]);
    printf("%d\\n", f[m]);
    return 0;
}
```
### 7.2 完全背包
**适用场景：** 每种物品无限个，在容量限制下价值最大。
**题型特征：** 背包容量固定、物品无限选、一维 DP 正序枚举（与 01 背包唯一区别）。
```cpp
constexpr int AwA = 1e2 + 10;
constexpr int QwQ = 1e3 + 10;
int n, m;
int v[AwA], w[AwA];
int f[QwQ];
int main() {
    m = Read(), n = Read();
    for (int i = 1; i <= n; i++) v[i] = Read(), w[i] = Read();
    //这里枚举j要正序，这是和01背包唯一的一个区别
    for (int i = 1; i <= n; i++)
        for (int j = m; j >= v[i]; j--)
            f[j] = max(f[j], f[j - v[i]] + w[i]);
    printf("%d\\n", f[m]);
    return 0;
}
```
## 其他
### 8.1 快排/第k大
**适用场景：** O(n) 期望时间求第 k 大/小元素（快速选择算法）。
**题型特征：** 求无序数组中第 k 大的数、分治思想、不排序直接查找。
```cpp
int kth_element(vector<int>& a, int l, int r, int k) {
    if (l == r) return a[l];
    int x = a[l + r >> 1], i = l - 1, j = r + 1;
    while (i < j) {
        while (a[++i] < x);
        while (a[--j] > x);
        if (i < j) swap(a[i], a[j]);
    }
    if (k <= j) return kth_element(a, l, j, k);
    return kth_element(a, j + 1, r, k);
}
```
### 8.2 对拍程序
**适用场景：** 验证算法正确性，随机生成测试数据对比暴力解和优化解的输出。
**题型特征：** 赛时/赛后调试、随机数据生成器 + 暴力验证。
```cpp
#include <bits/stdc++.h>
using namespace std;
// 随机数生成器
mt19937 rng(chrono::steady_clock::now().time_since_epoch().count());
int rnd(int l, int r) { return uniform_int_distribution<int>(l, r)(rng); }
// 暴力做法（保证正确但可能超时）
int brute(vector<int> a) {
    int n = a.size(), ans = 0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (a[i] > a[j]) ans++;
    return ans;
}
// 优化做法（树状数组求逆序对）
int solve(vector<int> a) {
    int n = a.size();
    vector<int> b = a;
    sort(b.begin(), b.end());
    b.erase(unique(b.begin(), b.end()), b.end());
    vector<int> c(n + 1);
    auto add = [&](int x, int v) {
        for (; x <= n; x += x & -x) c[x] += v;
    };
    auto sum = [&](int x) {
        int s = 0;
        for (; x; x -= x & -x) s += c[x];
        return s;
    };
    int ans = 0;
    for (int i = n - 1; i >= 0; i--) {
        int x = lower_bound(b.begin(), b.end(), a[i]) - b.begin() + 1;
        ans += sum(x - 1);
        add(x, 1);
    }
    return ans;
}
int main() {
    for (int T = 1; T <= 10000; T++) {
        // 生成随机数据
        int n = rnd(1, 100);
        vector<int> a(n);
        for (int i = 0; i < n; i++) a[i] = rnd(-1000, 1000);
        // 运行两种做法并比较
        int ans1 = brute(a);
        int ans2 = solve(a);
        if (ans1 != ans2) {
            cout << "Wrong Answer on test " << T << endl;
            cout << "Input: n = " << n << endl;
            for (int x : a) cout << x << " ";
            cout << endl;
            cout << "Expected: " << ans1 << endl;
            cout << "Your: " << ans2 << endl;
            return 0;
        }
        if (T % 100 == 0) cout << "Passed " << T << " tests" << endl;
    }
    cout << "All tests passed!" << endl;
    return 0;
}
\---
```
### 8.3 高精度模板
**适用场景：** 处理超出 64 位整数范围的超大整数运算（加法、比较）。
**题型特征：** 大整数运算（位数可达数千位）、高精度加法与比较。
```cpp
bool ge(const string &a, const string &b) {
    if (a.size() != b.size()) return a.size() > b.size();
    return a >= b;
}
string add(string a, string b) {
    reverse(all(a)), reverse(all(b));
    string c;
    int t = 0;
    for (int i = 0; i < max(sz(a), sz(b)) || t; i++) {
        if (i < sz(a)) t += a[i] - '0';
        if (i < sz(b)) t += b[i] - '0';
        c += t % 10 + '0';
        t /= 10;
    }
    reverse(all(c));
    return c;
}
```
```cpp
# 高精度开方模板

## 使用方式

```cpp
string result = get_root(num_str, root, length, round);
// e.g. get_root("2", 2, 3, true) → "1.414"
```

## 模板代码

```cpp
#include <bits/stdc++.h>
using namespace std;

// ===== 大数比较 =====
// 返回 a >= b (非负整数)
bool big_ge(const string& a, const string& b) {
    if (a.size() != b.size()) return a.size() > b.size();
    return a >= b;
}

// ===== 大数加法 =====
string big_add(string a, string b) {
    string res;
    int i = (int)a.size() - 1, j = (int)b.size() - 1, carry = 0;
    while (i >= 0 || j >= 0 || carry) {
        int s = carry;
        if (i >= 0) s += a[i--] - '0';
        if (j >= 0) s += b[j--] - '0';
        res.push_back(char(s % 10 + '0'));
        carry = s / 10;
    }
    reverse(res.begin(), res.end());
    return res;
}

// ===== 大数减法 (保证 a >= b) =====
string big_sub(const string& a, const string& b) {
    string res;
    int i = (int)a.size() - 1, j = (int)b.size() - 1, borrow = 0;
    while (i >= 0) {
        int d = (a[i--] - '0') - borrow;
        if (j >= 0) d -= b[j--] - '0';
        if (d < 0) { d += 10; borrow = 1; } else borrow = 0;
        res.push_back(char(d + '0'));
    }
    while (res.size() > 1 && res.back() == '0') res.pop_back();
    reverse(res.begin(), res.end());
    return res;
}

// ===== 大数乘法 =====
string big_mul(const string& a, const string& b) {
    if (a == "0" || b == "0") return "0";
    string res(a.size() + b.size(), '0');
    for (int i = (int)a.size() - 1; i >= 0; i--) {
        int carry = 0;
        for (int j = (int)b.size() - 1; j >= 0; j--) {
            int prod = (a[i] - '0') * (b[j] - '0') + (res[i + j + 1] - '0') + carry;
            res[i + j + 1] = char(prod % 10 + '0');
            carry = prod / 10;
        }
        res[i] += carry;
    }
    auto pos = res.find_first_not_of('0');
    return pos == string::npos ? "0" : res.substr(pos);
}

// ===== 大数除以 2 =====
string big_div2(const string& s) {
    string res;
    long long rem = 0;
    for (char c : s) {
        rem = rem * 10 + (c - '0');
        res.push_back(char(rem / 2 + '0'));
        rem %= 2;
    }
    auto pos = res.find_first_not_of('0');
    return pos == string::npos ? "0" : res.substr(pos);
}

// ===== 幂运算 (非负整数 a 的 n 次方) =====
string big_pow(string a, int n) {
    if (n == 0) return "1";
    string res = "1";
    while (n) {
        if (n & 1) res = big_mul(res, a);
        a = big_mul(a, a);
        n >>= 1;
    }
    return res;
}

// ===== 10^n =====
string pow10_str(int n) {
    return "1" + string(n, '0');
}

// ===== 去除前导零 =====
string trim_leading(string s) {
    if (s.empty()) return "0";
    auto pos = s.find_first_not_of('0');
    return pos == string::npos ? "0" : s.substr(pos);
}

// ===== 高精度开方主函数 =====
string get_root(string num, int root, int length, bool round) {
    // --- 解析 num (可能含小数点) ---
    size_t dot = num.find('.');
    string int_part = (dot != string::npos) ? num.substr(0, dot) : num;
    string frac_part = (dot != string::npos) ? num.substr(dot + 1) : "";
    int num_frac = (int)frac_part.size();

    // 构造纯整数：去掉小数点
    string num_int = trim_leading(int_part + frac_part);
    if (num_int == "0") {
        return (length == 0) ? "0" : "0." + string(length, '0');
    }

    // --- 缩放 target ---
    // X = result * 10^length, 搜索 X 使得 X^root ≈ num
    // num * 10^(root * length) = num_int * 10^(root * length - num_frac)
    // target = X^root 应该对应的值
    int exponent = root * length - num_frac;
    string target;
    if (exponent >= 0) {
        target = big_mul(num_int, pow10_str(exponent));
    } else {
        int cut = -exponent;
        if ((int)num_int.size() <= cut) target = "0";
        else target = num_int.substr(0, num_int.size() - cut);
    }

    if (target == "0") {
        return (length == 0) ? "0" : "0." + string(length, '0');
    }

    // --- 二分搜索 X ---
    int d = (int)target.size();
    string low = "0", high = "1" + string((d + root - 1) / root + 1, '0');
    string ans = "0", ans_pow = "0";

    while (big_ge(high, low)) {
        string mid = big_div2(big_add(low, high));
        string p = big_pow(mid, root);
        if (big_ge(target, p)) {
            ans = mid; ans_pow = p;
            low = big_add(mid, "1");
        } else {
            if (mid == "0") break;
            high = big_sub(mid, "1");
        }
    }

    // --- 四舍五入 ---
    if (round && length > 0 && ans != "0") {
        string nxt = big_add(ans, "1");
        string nxt_pow = big_pow(nxt, root);
        if (big_ge(nxt_pow, target)) {
            string diff_up = big_sub(nxt_pow, target);
            string diff_down = big_sub(target, ans_pow);
            if (big_ge(diff_down, diff_up)) {
                ans = nxt;
            }
        }
    }

    // --- 格式化输出 (插入小数点) ---
    if (length == 0) return ans;
    if ((int)ans.size() > length) {
        return ans.substr(0, ans.size() - length) + "."
             + ans.substr(ans.size() - length);
    } else {
        return "0." + string(length - ans.size(), '0') + ans;
    }
}
```

## 测试用例

```
get_root("2", 2, 0, false)  → "1"          (√2 ≈ 1, 截断)
get_root("2", 2, 3, false)  → "1.414"      (√2)
get_root("2", 2, 3, true)   → "1.414"      (√2, 4位 = 1.4142, 末位2<5)
get_root("2", 2, 4, true)   → "1.4142"     (√2)
get_root("3", 2, 3, true)   → "1.732"      (√3)
get_root("8", 3, 2, true)   → "2.00"       (³√8)
get_root("9", 3, 2, true)   → "2.08"       (³√9 ≈ 2.08008)
get_root("100", 2, 1, true) → "10.0"
get_root("0.5", 2, 3, true) → "0.707"      (√0.5)
get_root("10", 1, 3, true)  → "10.000"     (一次方)
```
```