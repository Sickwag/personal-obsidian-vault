# 章节变化
生成于 2026-11-12T16:23:32.907Z；提交归档日不代表实际学习日期。
## Hardware Animation.md · DNS服务器
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-tQQcAl/Before.md b/tmp/fsrs-diff-tQQcAl/After.md
index e69de29..a9ad162 100644
--- a/tmp/fsrs-diff-tQQcAl/Before.md
+++ b/tmp/fsrs-diff-tQQcAl/After.md
@@ -0,0 +1,13 @@
+## DNS服务器
+计算机没有名字，所以使用IP地址表示位置的“名称”
+DNS reslove(解析) names to numbers to be more specific.
+DNS reslove domain name (域名) to IP address.
+
+when you input a website address in you web browser,the dns will **turn the address to a number** .
+所以，在访问网络时，不一定要输入域名，输入网站的IP地址也是以访问网络
+
+所以DNS只是一个帮助用户“记住”网站的工具，你不必记住成千上万的复杂数字组合，只需记住他们的名字，服务器自动回将名字转换为数字，以方便用户
+可以理解成**dns是一个电话簿，按名称查找数字域名**
+![Pasted image 20240329223414.png](Pasted%20image%2020240329223414.png)**一旦解析器收到网址的IP地址信息后，就会将它存储到缓存中，以防止下一次同样的地址请求到来时重复询问浪费资源。**
+
+所有的查询数据都是放在不同服务器中cache memory中

```
## Hardware Animation.md · LAN、WAN、Subnet
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-4jrMy0/Before.md b/tmp/fsrs-diff-4jrMy0/After.md
index e69de29..50d93fc 100644
--- a/tmp/fsrs-diff-4jrMy0/Before.md
+++ b/tmp/fsrs-diff-4jrMy0/After.md
@@ -0,0 +1,6 @@
+## LAN、WAN、Subnet
+- 网络的最基本部分就是可以相互连接交换信息的计算机
+- 如果局域网中计算机需要与外部世界通信，就与要加入广域网（WAN）这个全球计算机组成的网络中，由ISP发送给这个局域网**网关信息**（现在的网关是调制解调器和路由器的结合）
+- 子网，是通过路由器隔离的两个局域网
+	![Pasted image 20240331163812.png](Pasted%20image%2020240331163812.png)
+	它的出现仅仅只是分割网络和提高网络信息流动性能，每个子网都可以通过设置自己的路由器来设置接收到的广播信息（防火墙设置）

```
## Hardware Animation.md · 什么是主板
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-hNvFgb/Before.md b/tmp/fsrs-diff-hNvFgb/After.md
index e69de29..eb3ea70 100644
--- a/tmp/fsrs-diff-hNvFgb/Before.md
+++ b/tmp/fsrs-diff-hNvFgb/After.md
@@ -0,0 +1,17 @@
+## 什么是主板
+主板是计算机的主要部件
+**主板（mother board）**
+本质上是一个适合电脑机箱的大电路板
+- CPU插槽（CPU Scoket）：CPU插座是防止中央处理器的位置
+- 内存插槽（memory slots）
+- 总线插槽：用来连接各种组件，拓展电脑的功能
+- 南北桥芯片组![Pasted image 20240329154418.png](Pasted%20image%2020240329154418.png)
+	- 北桥芯片组：位于主板的上部分，作为CPU、Pci、总线和内存的中间人。
+	- 南桥芯片组：负责连接sata，USB等较低短的端口![Pasted image 20240329154726.png](Pasted%20image%2020240329154726.png)备注：在PCH等较高端的主板设计方案中北桥的功能已经很大程度上的集成到CPU中，南桥的功能也已**完全被** 平台控制器集线器芯片控制接管
+- 集成接口
+	- 集成视频接口
+		- 旧主板一般是DVI或者VGA端口![Pasted image 20240329155102.png](Pasted%20image%2020240329155102.png)![Pasted image 20240329155151.png](Pasted%20image%2020240329155151.png)
+		- 现代主板上的事HDMI接口或者显示端口![Pasted image 20240329155231.png](Pasted%20image%2020240329155231.png)![Pasted image 20240329155257.png](Pasted%20image%2020240329155257.png)
+		- 集成显示卡的功能老旧，适配性不强，所以一般老式电脑上会有一个拓展视频卡
+- 现代的主板最流行的结构式atx，由IBM开发的可拓展主板设计方案，他的分支由micro ATX，更小，功耗更低
+

```
## Hardware Animation.md · 什么是云计算
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-h89hr4/Before.md b/tmp/fsrs-diff-h89hr4/After.md
index e69de29..61c7b8d 100644
--- a/tmp/fsrs-diff-h89hr4/Before.md
+++ b/tmp/fsrs-diff-h89hr4/After.md
@@ -0,0 +1,13 @@
+## 什么是云计算
+在云端存储或者运行程序/数据，而不在本地设备上
+
+** 当今主要的云计算供应商
+![Pasted image 20240329211255.png](Pasted%20image%2020240329211255.png)
+AWS主要业务来源是Netflix
+**当今三种云计算**
+- 基础设施及服务（Infrastructure as a serves）
+- 平台及服务（platform as a serves）
+- 软件及服务（software as a serves）
+![Pasted image 20240329211710.png](Pasted%20image%2020240329211710.png)
+![Pasted image 20240329211916.png](Pasted%20image%2020240329211916.png)
+![Pasted image 20240329211824.png](Pasted%20image%2020240329211824.png)**谷歌文档服务就是典型的SAAS** ，至于要在本机发送操作指令，所有的操作都在云端进行

```
## Hardware Animation.md · 什么是热点(Hotspot)
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-Csk4jX/Before.md b/tmp/fsrs-diff-Csk4jX/After.md
index e69de29..08a79b3 100644
--- a/tmp/fsrs-diff-Csk4jX/Before.md
+++ b/tmp/fsrs-diff-Csk4jX/After.md
@@ -0,0 +1,9 @@
+## 什么是热点(Hotspot)
+创建热点的设备
+- 无线路由
+- 无线提供商提供的无线接入点
+连接热点需要注意的
+- 共享文件夹是通过公共无线网络共享，在同一个共享网络中所有用户都可以访问
+- 使用VPN可以加密和隐藏数据
+热点**本质是一个LOCATION
+

```
## Hardware Animation.md · 什么是防火墙
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-tYDGDm/Before.md b/tmp/fsrs-diff-tYDGDm/After.md
index e69de29..a35e2e0 100644
--- a/tmp/fsrs-diff-tYDGDm/Before.md
+++ b/tmp/fsrs-diff-tYDGDm/After.md
@@ -0,0 +1 @@
+## 什么是防火墙
\ No newline at end of file

```
## Hardware Animation.md · 什么是防火墙 › 防火墙
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-5J4P70/Before.md b/tmp/fsrs-diff-5J4P70/After.md
index e69de29..14c2ad9 100644
--- a/tmp/fsrs-diff-5J4P70/Before.md
+++ b/tmp/fsrs-diff-5J4P70/After.md
@@ -0,0 +1,10 @@
+### 防火墙
+防火墙是一个旨在防止未经授权的访问进入专用网络的系统
+
+> 专用网络和公用网络的区别
+> 自己用，家庭，公司用的专用网络，只能是特定用户能够使用的网络
+>
+>专用网络是所有人都可以使用的网络，开放性很高，安全性低，比如公共的WIFI
+
+![Pasted image 20240329205412.png](Pasted%20image%2020240329205412.png)过滤是主要的作用
+![Pasted image 20240329205651.png](Pasted%20image%2020240329205651.png)![Pasted image 20240329205724.png](Pasted%20image%2020240329205724.png)
\ No newline at end of file

```
## Hardware Animation.md · 什么是防火墙 › 防火墙工作原理
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-pyYitI/Before.md b/tmp/fsrs-diff-pyYitI/After.md
index e69de29..94d4544 100644
--- a/tmp/fsrs-diff-pyYitI/Before.md
+++ b/tmp/fsrs-diff-pyYitI/After.md
@@ -0,0 +1,5 @@
+### 防火墙工作原理
+现代防火墙主要根据数据来源的端口信息匹配防火墙规则决定是否过滤信息
+**网络防火墙**旨在防火整个计算机网络，不针对某一个计算机
+![Pasted image 20240329210500.png](Pasted%20image%2020240329210500.png)
+**主机防火墙**保护个人
\ No newline at end of file

```
