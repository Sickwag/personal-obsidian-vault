# 章节变化
生成于 2026-11-12T16:40:54.730Z；提交归档日不代表实际学习日期。
## Hardware Animation.md · 双频段路由器 › 两者之间的不同
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-Ad4O3t/Before.md b/tmp/fsrs-diff-Ad4O3t/After.md
index e69de29..4497ea0 100644
--- a/tmp/fsrs-diff-Ad4O3t/Before.md
+++ b/tmp/fsrs-diff-Ad4O3t/After.md
@@ -0,0 +1,3 @@
+### 两者之间的不同
+- 2.4Ghz频段的传输速度比5GHz要低，但覆盖范围广，在信号源很多时易受到干扰。
+- 5Ghz相反，因高频率电波的穿透力更强

```
## Hardware Animation.md · 什么是子网（subnets）和vlans
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-ENqgly/Before.md b/tmp/fsrs-diff-ENqgly/After.md
index e69de29..93b2ce3 100644
--- a/tmp/fsrs-diff-ENqgly/Before.md
+++ b/tmp/fsrs-diff-ENqgly/After.md
@@ -0,0 +1,3 @@
+## 什么是子网（subnets）和vlans
+**共性**
+用于将网络分解为更小的网络（提高安全性，性能和易管理性）
\ No newline at end of file

```
## Hardware Animation.md · 什么是子网（subnets）和vlans › 子网
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-huBLJk/Before.md b/tmp/fsrs-diff-huBLJk/After.md
index e69de29..ba29681 100644
--- a/tmp/fsrs-diff-huBLJk/Before.md
+++ b/tmp/fsrs-diff-huBLJk/After.md
@@ -0,0 +1,7 @@
+#### 子网
+**子网是通过路由器创建的，小型的局域网是有多个连接在一个路由器上的几台计算机组成的**
+- 当局域网中计算机想要与其他计算机通信时需要连接在同一个“交换机（Switch，不是路由器）”上![Pasted image 20240330164640.png](Pasted%20image%2020240330164640.png)
+- 类似于集线器，当一个计算机想要向外通信，发送广播时所有计算机都会受到广播，所以一旦计算机的数量多起来，就会造成数据拥挤和资源浪费![Pasted image 20240330164819.png](Pasted%20image%2020240330164819.png)
+- 子网本质是**由路由器隔开的不同广播域**组成
+- 每个子网都有属于自己的广播域，广播不会穿过路由器传播![Pasted image 20240330165110.png](Pasted%20image%2020240330165110.png)
+企业间的各个部门需要保证数据安全性，数据只在各个部门之内流动，就需要建立子网

```
## Hardware Animation.md · 什么是子网（subnets）和vlans › 虚拟局域网（VLAN virtual local area network）
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-IizUGA/Before.md b/tmp/fsrs-diff-IizUGA/After.md
index e69de29..1bca744 100644
--- a/tmp/fsrs-diff-IizUGA/Before.md
+++ b/tmp/fsrs-diff-IizUGA/After.md
@@ -0,0 +1,5 @@
+### 虚拟局域网（VLAN virtual local area network）
+VLAN引入一种新的硬件——**VLAN交换机**
+这种交换机可以配置网络流量，可以看做是多个交换机的组合集成，这种集成互不干扰，每个集成进来的交换机的接口数量和流量都可以通过控制VLAN控制。![Pasted image 20240330165713.png](Pasted%20image%2020240330165713.png)
+![Pasted image 20240330165725.png](Pasted%20image%2020240330165725.png)
+VLAN的最大优点是可以再**不需要增加路由器的情况下分割网络**，因所有的网络流量分配都是VLAN统一管理，所以**也不需要增加防火墙、线缆和请求多个IP地址**

```
## Hardware Animation.md · 显示器
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-p7u0uu/Before.md b/tmp/fsrs-diff-p7u0uu/After.md
index e69de29..2112190 100644
--- a/tmp/fsrs-diff-p7u0uu/Before.md
+++ b/tmp/fsrs-diff-p7u0uu/After.md
@@ -0,0 +1,10 @@
+## 显示器
+显示器可以几个视频端口，接口可以有VGA、HDMI，甚至USB
+- 更早的电视使用的是CRT（阴极射线电子管），笨重且占用空间很大，现已淘汰
+- 现在最先进的是**液晶显示器**，广通过晶体，RGB过滤器等组件组成的光栅来显示图像
+- LCD与LED：lcd使用的是圆柱形水银蒸汽管，水银电离发出紫外线光。LED使用多盏灯的点状现代光源
+	![Pasted image 20240331160911.png](Pasted%20image%2020240331160911.png)
+	LED可以产生更清晰和更**高对比度**的图像，耗电量更少，可以做的更薄
+	>对比度指的是显示器最高白色亮度和最低黑色亮度之间的亮度倍数差异
+
+- OLED：一种不需要背光而是通过电流通过有机物使他们自身发光的技术，每一个像素自己发光。广泛使用在现代电子设备上，有极高的对比度，同时**价格更高**，可以做到比LED更薄，没有视角偏移产生的失真
\ No newline at end of file

```
## Hardware Animation.md · 显示器 › 像素
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-Gi39kZ/Before.md b/tmp/fsrs-diff-Gi39kZ/After.md
index e69de29..08dedf1 100644
--- a/tmp/fsrs-diff-Gi39kZ/Before.md
+++ b/tmp/fsrs-diff-Gi39kZ/After.md
@@ -0,0 +1,3 @@
+#### 像素
+![Pasted image 20240331162127.png](Pasted%20image%2020240331162127.png)
+可以看到，最高的4K分辨率也不过用800万像素就可以做到
\ No newline at end of file

```
## Hardware Animation.md · 显示器 › 三种显示器类型
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-BcbE51/Before.md b/tmp/fsrs-diff-BcbE51/After.md
index e69de29..eb85bd8 100644
--- a/tmp/fsrs-diff-BcbE51/Before.md
+++ b/tmp/fsrs-diff-BcbE51/After.md
@@ -0,0 +1,5 @@
+#### 三种显示器类型
+- TN显示器：更低的响应时间（可以在很短的时间内变幻屏幕上的颜色）、更不明显的残影效果（残影形象观感）**但在观看角度上会有缺陷，尤其是垂直观看**
+	![Pasted image 20240331161545.png](Pasted%20image%2020240331161545.png)
+- IPS：有更准确的颜色显示，更好的视角适应，但**更高价格**
+- VA：IPS和TN的混合版本

```
## Hardware Animation.md · 桥接模式
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-NpPFmw/Before.md b/tmp/fsrs-diff-NpPFmw/After.md
index e69de29..c87dfa1 100644
--- a/tmp/fsrs-diff-NpPFmw/Before.md
+++ b/tmp/fsrs-diff-NpPFmw/After.md
@@ -0,0 +1,4 @@
+## 桥接模式
+作用：将两个网络连接在一起，成为一个共通的网络
+![Pasted image 20240331162515.png](Pasted%20image%2020240331162515.png)
+两个局域网中只有一个介入internet，链接这两个网络的方法可以是**使用线缆**或者使用**桥接无线网络**。使用桥接的条件是两个局域网中都要有路由器
\ No newline at end of file

```
