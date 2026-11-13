# 章节变化
生成于 2026-11-12T16:34:30.614Z；提交归档日不代表实际学习日期。
## Hardware Animation.md · 什么是防火墙 › 防火墙的部署
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-fX7kxO/Before.md b/tmp/fsrs-diff-fX7kxO/After.md
index e69de29..b14574b 100644
--- a/tmp/fsrs-diff-fX7kxO/Before.md
+++ b/tmp/fsrs-diff-fX7kxO/After.md
@@ -0,0 +1,4 @@
+### 防火墙的部署
+- 小型路由器部署
+- 大型服务器部署
+- 云端基础设施部署
\ No newline at end of file

```
## Hardware Animation.md · 什么是随机存取存储器
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-rJ9FeF/Before.md b/tmp/fsrs-diff-rJ9FeF/After.md
index e69de29..9371409 100644
--- a/tmp/fsrs-diff-rJ9FeF/Before.md
+++ b/tmp/fsrs-diff-rJ9FeF/After.md
@@ -0,0 +1,5 @@
+## 什么是随机存取存储器
+RAM（random access）存储在主办的DIMS（dual inline memory Module）模块中硬件，有两个针脚部分，有168  184  240  288四种针脚数量规格
+
+- CPU需要处理的数据首先存储在硬盘中，然后在需要时被加载到RAM中，RAM中数据可以被CPU直接读取
+- 当RAM太小时，部分数据无法一次性全部加载进CPU，只能先放在硬盘中。在需要部分村除杂硬盘中数据时，RAM再吧数据放回到硬盘，然后读取新的数据进来。**这一过程会降低计算机速度**

```
## Hardware Animation.md · 什么是随机存取存储器 › RAM的类型
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-0ooDJa/Before.md b/tmp/fsrs-diff-0ooDJa/After.md
index e69de29..623a003 100644
--- a/tmp/fsrs-diff-0ooDJa/Before.md
+++ b/tmp/fsrs-diff-0ooDJa/After.md
@@ -0,0 +1,3 @@
+#### RAM的类型
+- DRAM（dynamic RAM）：需要恒定电源供电，因DRAM的结构是用电容器存储数据，电容器不能长时间保持电量，必须保证储存的电能动态刷新以保存数据。所有的数据变化不按照系统时间校准，无法准确计时
+- SDRAM（synchronous dynamic RAM）：同样使用电容存储结构。同步系统时间变化数据，这导致了他的速度比SDRAM更快。

```
## Hardware Animation.md · 什么是随机存取存储器 › RAM的速率计算
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-Mjrx8U/Before.md b/tmp/fsrs-diff-Mjrx8U/After.md
index e69de29..a010d60 100644
--- a/tmp/fsrs-diff-Mjrx8U/Before.md
+++ b/tmp/fsrs-diff-Mjrx8U/After.md
@@ -0,0 +1,5 @@
+#### RAM的速率计算
+- RAM的位数指的是在单位时间（时钟时间周期内）的电脑数据传输位数。旧版的内存可能使用的是SIM（模拟内存）存储格式，但一次只能传输32为数据，DIMS一般是64位数据
+- 首先看RAM的频率，在内存中术语是速度（speed）单位为MHz千兆赫兹。
+- 再看RAM的总线（wide bus）宽度，如果是64位RAM就有8bit宽度。
+- RAM的读取速度就是**100 * 8=800MB/s**

```
## Hardware Animation.md · 什么是随机存取存储器 › 新兴内存技术
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-LNA3Pz/Before.md b/tmp/fsrs-diff-LNA3Pz/After.md
index e69de29..f121971 100644
--- a/tmp/fsrs-diff-LNA3Pz/Before.md
+++ b/tmp/fsrs-diff-LNA3Pz/After.md
@@ -0,0 +1,15 @@
+#### 新兴内存技术
+- **DDR技术（double data rate）**
+顾名思义，DDR在每个时钟周期发送的数据是非DDR的两倍![Pasted image 20240330124525.png](Pasted%20image%2020240330124525.png)
+DDR利用了数据波段的波峰和波谷两段发送数据
+![Pasted image 20240330124721.png](Pasted%20image%2020240330124721.png)
+标签上说明了内存的速度
+- **DDR2技术**
+通过拓展总线宽度，使得DDR2拥有两倍于DDR的速度，风少的电量
+![Pasted image 20240330124930.png](Pasted%20image%2020240330124930.png)
+- **DDR3**
+是DDR2内存速度的两倍，使用更少的电量
+同样的240个针脚，但针脚缺口位置不一样![Pasted image 20240330125112.png](Pasted%20image%2020240330125112.png)
+- DDR4
+更快速度，消耗更少电量，拥有288个针脚
+![Pasted image 20240330125231.png](Pasted%20image%2020240330125231.png)

```
## Hardware Animation.md · 什么是随机存取存储器 › 其他
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-u2riaG/Before.md b/tmp/fsrs-diff-u2riaG/After.md
index e69de29..c9f5880 100644
--- a/tmp/fsrs-diff-u2riaG/Before.md
+++ b/tmp/fsrs-diff-u2riaG/After.md
@@ -0,0 +1,4 @@
+#### 其他
+- 有些RAM中会集成ECC（error coding code）用来检测故障
+- 观察内存模块的存储芯片数量可以改看出有没有集成（一般是8个芯片，9个就说明集成了ECC）
+- ECC并不是一定需要的，也不是装了ECC的内存更稳定，由于技术的进步，使得内存总很少出现错误，只有在一些极其重要的服务器中，需要安装ECC防止数据错误使服务器宕机

```
## Hardware Animation.md · 双频段路由器
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-J7n6fG/Before.md b/tmp/fsrs-diff-J7n6fG/After.md
index e69de29..a03053b 100644
--- a/tmp/fsrs-diff-J7n6fG/Before.md
+++ b/tmp/fsrs-diff-J7n6fG/After.md
@@ -0,0 +1,4 @@
+## 双频段路由器
+频段是无线数据在设备之间的传输方式
+![Pasted image 20240330121156.png](Pasted%20image%2020240330121156.png)单带路由器只能传输其中一个波段（band）
+许多设备（如微波炉，手机，路由器）一般都使用2.4GHZ，为了**防止2.4Ghz频段过于拥挤而影响信号接收**，新设备一般支持5GHZ频段来降低 干扰

```
## Hardware Animation.md · 双频段路由器 › 降低干扰的方法
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-moVcmk/Before.md b/tmp/fsrs-diff-moVcmk/After.md
index e69de29..ad063ec 100644
--- a/tmp/fsrs-diff-moVcmk/Before.md
+++ b/tmp/fsrs-diff-moVcmk/After.md
@@ -0,0 +1,5 @@
+### 降低干扰的方法
+- 更换频道（channel）
+2.4GHZ有11个频道可以选择，其中有3个信号频道不重叠，这是最稳定的三个频道
+![Pasted image 20240330121744.png](Pasted%20image%2020240330121744.png)
+5GHZ有两个不重叠频道，25个频道

```
