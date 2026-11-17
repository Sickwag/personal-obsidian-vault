# 章节变化
生成于 2026-11-12T16:50:21.783Z；提交归档日不代表实际学习日期。
## Hardware Animation.md · 桥接模式 › 使用桥接的方法
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-G8npHu/Before.md b/tmp/fsrs-diff-G8npHu/After.md
index e69de29..8d69509 100644
--- a/tmp/fsrs-diff-G8npHu/Before.md
+++ b/tmp/fsrs-diff-G8npHu/After.md
@@ -0,0 +1,8 @@
+### 使用桥接的方法
+1. 登录没有网络的路由器设置页面
+2. 打开无线桥接功能
+	![Pasted image 20240331162741.png](Pasted%20image%2020240331162741.png)
+3. 使用SSID和密码连接两个网络
+	![Pasted image 20240331162822.png](Pasted%20image%2020240331162822.png)
+4. 注意事项
+使用桥接功能会使接入主路由器的副路由器的防火墙，NAT和DHCP（自动分配IP功能）**被主路由器接管**，第二个路由器仅仅有连接作用。***有些无线路由可以再使用桥接功能的同时还可以自身广播信号***，使新的设备可以无线连接加入进来
\ No newline at end of file

```
## Hardware Animation.md · 电源
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-PvxIYj/Before.md b/tmp/fsrs-diff-PvxIYj/After.md
index e69de29..7f4230e 100644
--- a/tmp/fsrs-diff-PvxIYj/Before.md
+++ b/tmp/fsrs-diff-PvxIYj/After.md
@@ -0,0 +1,3 @@
+## 电源
+[硬件茶谈电源部分讲解](装机.md#^ac17b6)
+***电源的功能是将民用电流转化为计算机所欲要的特定电压***
\ No newline at end of file

```
## Hardware Animation.md · 电源 › 引出接口
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-cU3tu5/Before.md b/tmp/fsrs-diff-cU3tu5/After.md
index e69de29..5fdec17 100644
--- a/tmp/fsrs-diff-cU3tu5/Before.md
+++ b/tmp/fsrs-diff-cU3tu5/After.md
@@ -0,0 +1 @@
+### 引出接口
\ No newline at end of file

```
## Hardware Animation.md · 电源 › 主板电源接口
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-RgqdPH/Before.md b/tmp/fsrs-diff-RgqdPH/After.md
index e69de29..9a2b5d8 100644
--- a/tmp/fsrs-diff-RgqdPH/Before.md
+++ b/tmp/fsrs-diff-RgqdPH/After.md
@@ -0,0 +1,3 @@
+### 主板电源接口
+所有接口都是直接连接在主板或者连接在电脑的各个拓展硬件上
+电源在主板上的接口一般是20/24pin，有的电源为了兼容主板的两种不同型号，设计了20+4pin针脚，同样的**有一个针脚是空的**
\ No newline at end of file

```
## Hardware Animation.md · 电源 › CPU额外供电接口
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-OxGbjT/Before.md b/tmp/fsrs-diff-OxGbjT/After.md
index e69de29..ed616ac 100644
--- a/tmp/fsrs-diff-OxGbjT/Before.md
+++ b/tmp/fsrs-diff-OxGbjT/After.md
@@ -0,0 +1,2 @@
+### CPU额外供电接口
+一般是4pin（旧CPU供电），现在陷阱的CPU使用8pin电源
\ No newline at end of file

```
## Hardware Animation.md · 电源 › 显卡额外供电电源
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-RI8PdG/Before.md b/tmp/fsrs-diff-RI8PdG/After.md
index e69de29..cc1f1ad 100644
--- a/tmp/fsrs-diff-RI8PdG/Before.md
+++ b/tmp/fsrs-diff-RI8PdG/After.md
@@ -0,0 +1,2 @@
+### 显卡额外供电电源
+6/8pin额外的供电电源直接插入显卡中，而不接在主板上间接供电，有些显卡只会使用到接口中一部分，这里需要注意[接线规则](装机.md#^0825a9)
\ No newline at end of file

```
## Hardware Animation.md · 电源 › 显卡额外供电电源 › 电源的规格
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-mx8N0q/Before.md b/tmp/fsrs-diff-mx8N0q/After.md
index e69de29..ea369ad 100644
--- a/tmp/fsrs-diff-mx8N0q/Before.md
+++ b/tmp/fsrs-diff-mx8N0q/After.md
@@ -0,0 +1,2 @@
+#### 电源的规格
+去决议电源需要给多少个组件，什么组件供电，规格主要取决于电源的功率
\ No newline at end of file

```
## Hardware Animation.md · 电源 › 显卡额外供电电源 › 电源的类型
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-7fuaCM/Before.md b/tmp/fsrs-diff-7fuaCM/After.md
index e69de29..db5f9d0 100644
--- a/tmp/fsrs-diff-7fuaCM/Before.md
+++ b/tmp/fsrs-diff-7fuaCM/After.md
@@ -0,0 +1,2 @@
+#### 电源的类型
+[电源的类型](装机.md#^d7e10f)
\ No newline at end of file

```
