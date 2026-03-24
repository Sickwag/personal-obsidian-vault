# windows
## 2023-08-18  08:56解决艾尔登法环掉帧

1. 禁用计算机管理——软件设备中
	![Pasted image 20240818085708.png](Pasted%20image%2020240818085708.png)
2. 关闭服务中 SSDP ![Pasted image 20240818085817.png](Pasted%20image%2020240818085817.png)
3. 更改着色器缓存大小![Pasted image 20240818090008.png](Pasted%20image%2020240818090008.png)
4. 程序设置中调整 OpenGL 渲染为优先性能，自定义程序使用添加找到游戏 ![Pasted image 20240818090111.png](Pasted%20image%2020240818090111.png)
## 2024 年 9 月 19 日08:58:41
### 解决本地回环地址无法访问
2024 年 9 月 19 日09:29:48 开启后发现[使用虚拟机地址而不是外部Windows本机地址](Linux%20Basics.md#^1a483c)，遂关闭
####  问题
1. 127.0.0.1 及其端口无法访问

#### 解决方法
1. 任务面板开启 Windows 功能（管理员权限），将所有 IIS 选项都打开
#### 参考链接
[解决访问127.0.0.1时，提示“127.0.0.1 拒绝了我们的连接请求”](https://blog.csdn.net/sunyctf/article/details/130526379)
#### 正常使用
![Pasted image 20240919090831.png](Pasted%20image%2020240919090831.png)

### RabbitMQ 控制台无法启动
#### 问题
使用 `rabbitmq-plugins enable rabbitmq_management` 时出现报错
```bash
{:query, :rabbit@sickwag, {:badrpc, :timeout}}
```
使用控制台启动命令时使用的是主机默认名，需要将 host 文件中添加主机地址为虚拟机主机名
#### 解决方法
`vim /etc/hosts` 修改 host 文件，添加进自己的主机名和虚拟机 IP 地址
#### 参考链接
[{:query, :rabbit@centos8, {:badrpc, :timeout}}报错 CSDN博客](https://blog.csdn.net/qq_31446763/article/details/124273818)

#### 正常运行
```bash
[root@sickwag server]# vim /etc/hosts
[root@sickwag server]# rabbitmq-plugins enable rabbitmq_management
Enabling plugins on node rabbit@sickwag:
rabbitmq_management
^HThe following plugins have been configured:
  rabbitmq_management
  rabbitmq_management_agent
  rabbitmq_web_dispatch
Applying plugin configuration to rabbit@sickwag...
The following plugins have been enabled:
  rabbitmq_management
  rabbitmq_management_agent
  rabbitmq_web_dispatch

started 3 plugins.
```

## 坚果云上传书
2024 年 9 月 19 日11:33:37
![Pasted image 20240919113339.png](Pasted%20image%2020240919113339.png)
浏览器上传

## 关闭 win 11 自动更新
2024 年 9 月 22 日16:58:19
![Pasted image 20240922165820.png](Pasted%20image%2020240922165820.png)
[如何彻底关闭Win11更新？分享四种关闭方法_win11关闭自动更新-CSDN博客](https://blog.csdn.net/XdecadeXXX/article/details/137913605)

## 关闭 microsoft 兼容性遥测
2025 年 6 月 25 日08:39:54
**通过**[隐私至上：5 招轻松关闭 Windows 11 遥测，防止数据收集 - 系统极客](https://www.sysgeek.cn/disable-windows-11-telemetry/)
的方案 1 个方案 2 关闭

## 解决 vscode cpp tools 占用高问题
[问题解决：VScode高CPU占有率 cpptools high CPU-CSDN博客](https://blog.csdn.net/qq_43827595/article/details/105613954)
将 cpptools. exe C/C   Extension for Visual Studio Code 内存占用减少一半以上，CPU 占用降低到 0.1%
在 settings. json 中将
```json
"C_Cpp.intelliSenseEngine": "default", // 调整为
"C_Cpp.intelliSenseEngine": "disabled",
```

## 关闭 ipch 文件生成
2025 年 10 月 9 日13:20:38
参考： [VisualStudio 产生的.sdf和.ipch文件删除、不生成 - 悟透 - 博客园](https://www.cnblogs.com/wutou/p/18367491)
据说删除后会影响 intellisense 的速度
# Linux
## 解决 linux mint 外屏问题
### 外屏无法连接
参考：https://zhuanlan.zhihu.com/p/259620618
主要是通过
```bash
# 另一种可能就是没有安装lightdm，安装方法[3]为
sudo apt install lightdm
# 然后用以下命令切换到lightdm模式中。
sudo dpkg-reconfigure lightdm
```
### 外屏亮度调节
先使用 xrandr 命令检测所有连接的屏幕
```bash
 ~  xrandr                                                                                           INT х  11:32:30
Screen 0: minimum 320 x 200, current 3840 x 1080, maximum 16384 x 16384
eDP-1 connected primary 1920x1080+1920+0 (normal left inverted right x axis y axis) 355mm x 199mm
   1920x1080     60.00*+  60.00    40.00
   1680x1050     60.00
   1400x1050     60.00
   # 各种支持的分辨率&帧率
DP-1 disconnected (normal left inverted right x axis y axis)
DP-2 disconnected (normal left inverted right x axis y axis)
HDMI-1-0 connected 1920x1080+0+0 (normal left inverted right x axis y axis) 0mm x 0mm
   1920x1080     60.00*+  59.94    50.00    23.98
   3840x2160     23.98
   1680x1050     59.95
   1600x900      60.00
   1440x900      59.89
   1280x720      60.00    59.94    50.00
   1024x768      60.00
   800x600       60.32    56.25
   # 同上
DP-1-0 disconnected (normal left inverted right x axis y axis)
DP-1-1 disconnected (normal left inverted right x axis y axis)
```
可以看到两个屏幕，eDP-1->primary screen，HTMI-1-0 副屏
通过下面的命令调整亮度
```bash
xrandr --output HDMI-1-0 --brightness 0.5
# 亮度在0~1比较适合，超过1技术上可以做到，但是会非常刺眼
```
## 调整桌面启动器
下载 xfce4
```bash
apt install xfce4 xfce4-goodies lightdm xfce4-session
```
默认的 `/etc/lightdm/ligthdm.conf.d/70-linuxmint.conf` 文件内容是：
```bash
[SeatDefaults]
user-session=cinnamon
```
修改为
```bash
[SeatDefaults]
user-session=xfce4
```
## qt creator 及 qt 编译的程序无法输入中文
解决方法参考：
https://www.cnblogs.com/ericling0529/p/18097102
https://zhuanlan.zhihu.com/p/1940814172234429631
添加完 qt 路径之后，出现找不到 ECMConfig.cmake，那么参考第二个连接，**先一个个用 apt 安装**，不要一次性全部安装，可能会起冲突
全部安装完后应该就能构建成功，如果用 qt6 编译还有可能出现 qt 核心模块的 private 版本路径加载和 api 过期问题，ai 的解决方法为：
> [!note]
> 问题原因总结
> 构建失败的主要原因是：
>  1. Qt6 私有头文件路径问题：Qt6Gui_PRIVATE_INCLUDE_DIRS 变量没有正确设置，导致 moc 和编译器找不到 Qt
> 	的私有头文件（如 qplatforminputcontextplugin_p.h、qglobal_p.h 等）。
>  2. IID 宏定义问题：QPlatformInputContextFactoryInterface_iid 宏在 moc 解析时未被正确展开。
> 解决方案
> 做了以下修改：
>  3. `qt6/CMakeLists.txt`：显式查找 Qt6GuiPrivate 和 Qt6CorePrivate 模块
>  4. `qt6/platforminputcontext/CMakeLists.txt`：从 Qt6::GuiPrivate 和 Qt6::CorePrivate
> 	目标获取私有头文件目录
>  5. `qt6/platforminputcontext/main.h`：将 Q_PLUGIN_METADATA 中的 IID 宏改为字符串字面量

可法这段总结给 ai，然后让他根据这些经验找到问题，修改即可