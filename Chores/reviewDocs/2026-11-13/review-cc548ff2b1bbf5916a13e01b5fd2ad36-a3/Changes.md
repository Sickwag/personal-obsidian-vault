# 章节变化
生成于 2026-11-12T16:59:50.960Z；提交归档日不代表实际学习日期。
## Hardware Animation.md · 电源 › 显卡额外供电电源 › 电源上的标识
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-YS8o65/Before.md b/tmp/fsrs-diff-YS8o65/After.md
index e69de29..ad6aac5 100644
--- a/tmp/fsrs-diff-YS8o65/Before.md
+++ b/tmp/fsrs-diff-YS8o65/After.md
@@ -0,0 +1,5 @@
+#### 电源上的标识
+80plus表示电源能够有80%以上的电源效率，这个效率是因电源在由**交流电到直流电过程**中由能量损耗。
+600W的电源一般表示满功率负载下有600/0.8=725W的输入功率，在80%以上还会有其他的等级评定
+![Pasted image 20240331160236.png](Pasted%20image%2020240331160236.png)
+

```
## Hardware Animation.md · 虚拟化
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-YRDRw5/Before.md b/tmp/fsrs-diff-YRDRw5/After.md
index e69de29..0e6c64c 100644
--- a/tmp/fsrs-diff-YRDRw5/Before.md
+++ b/tmp/fsrs-diff-YRDRw5/After.md
@@ -0,0 +1,9 @@
+## 虚拟化
+**_是一种在虚拟环境中模拟计算机的硬件和软件的过程
+
+**传统虚拟模式**：one machine for one application
+每台机器都运行一套应用程序，并使用不同的一套操作系统
+![Pasted image 20240330161915.png](Pasted%20image%2020240330161915.png)
+将这三个服务器整合到一起，在一台机器中运行三个程序和他们相应的三个操作系统
+![Pasted image 20240330162113.png](Pasted%20image%2020240330162113.png)
+当用户与虚拟机交互时，并没有三种不同的方式，而是和物理机没有任何区别

```
## Hardware Animation.md · 虚拟化 › 虚拟机管理程序（hypervisor）
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-fS8BZL/Before.md b/tmp/fsrs-diff-fS8BZL/After.md
index e69de29..896b67d 100644
--- a/tmp/fsrs-diff-fS8BZL/Before.md
+++ b/tmp/fsrs-diff-fS8BZL/After.md
@@ -0,0 +1,3 @@
+### 虚拟机管理程序（hypervisor）
+管理虚拟机各个部分的**存储、RAM、CPU**的分配
+***虚拟机管理系统有两套模式***
\ No newline at end of file

```
## Hardware Animation.md · 虚拟化 › type I（安装在裸机上）
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-zrjEoL/Before.md b/tmp/fsrs-diff-zrjEoL/After.md
index e69de29..f5b08f9 100644
--- a/tmp/fsrs-diff-zrjEoL/Before.md
+++ b/tmp/fsrs-diff-zrjEoL/After.md
@@ -0,0 +1,6 @@
+### type I（安装在裸机上）
+- 建立一个没有操作系统的主机，**RAM、CPU、hardware所有硬件都有但没有操作系统** ，在这个主机中安装虚拟机管理系统（vmware esxi）（这不是操作系统，只用于创建虚拟机）
+- 然后再安装两个虚拟机，用来运行其他两个程序
+- 给每一个虚拟机安装操作系统和应用程序
+![Pasted image 20240330163316.png](Pasted%20image%2020240330163316.png)
+**每一个虚拟机都是独立的，只是被虚拟机统一管理了而已**，这种模式一般用于企业数据管理
\ No newline at end of file

```
## Hardware Animation.md · 虚拟化 › ***type II（安装在现有的操作系统上）***
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-qnxJYM/Before.md b/tmp/fsrs-diff-qnxJYM/After.md
index e69de29..fce1fff 100644
--- a/tmp/fsrs-diff-qnxJYM/Before.md
+++ b/tmp/fsrs-diff-qnxJYM/After.md
@@ -0,0 +1,2 @@
+### ***type II（安装在现有的操作系统上）***
+一般用于个人测试软件，使用多种不同的操作系统

```
## Hardware Animation.md · 虚拟化 › 虚拟机的好处
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-Kpp4y8/Before.md b/tmp/fsrs-diff-Kpp4y8/After.md
index e69de29..5d09f16 100644
--- a/tmp/fsrs-diff-Kpp4y8/Before.md
+++ b/tmp/fsrs-diff-Kpp4y8/After.md
@@ -0,0 +1,4 @@
+### 虚拟机的好处
+所有的虚拟机都是软件文件，只是借助硬件运行行使管理职能
+![Pasted image 20240330164132.png](Pasted%20image%2020240330164132.png)
+

```
## Hardware Animation.md · 调制解调器（modem）和路由器（router）
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-SC0Cpe/Before.md b/tmp/fsrs-diff-SC0Cpe/After.md
index e69de29..2bfad41 100644
--- a/tmp/fsrs-diff-SC0Cpe/Before.md
+++ b/tmp/fsrs-diff-SC0Cpe/After.md
@@ -0,0 +1 @@
+## 调制解调器（modem）和路由器（router）
\ No newline at end of file

```
## Hardware Animation.md · 调制解调器（modem）和路由器（router） › 调制解调器
提交：37e353d9553b708e6f401d01527b678a57010ac8
```diff
diff --git a/tmp/fsrs-diff-Mvs9kc/Before.md b/tmp/fsrs-diff-Mvs9kc/After.md
index e69de29..b8ff1a6 100644
--- a/tmp/fsrs-diff-Mvs9kc/Before.md
+++ b/tmp/fsrs-diff-Mvs9kc/After.md
@@ -0,0 +1,4 @@
+### 调制解调器
+作用：将互联网带入家庭或者企业，将模拟和数字信号**相互转化**，互联网传入的数据转为数字信号称为解调（demodulate），反之称为调制（modulate）
+使用原因：计算机和网络上的数据使用不同的信号表示方式，计算机使用的是**数字信号**，网络信号时**模拟信号**。
+![Pasted image 20240329212454.png](Pasted%20image%2020240329212454.png)
\ No newline at end of file

```
