## 2023-08-18  08:56解决艾尔登法环掉帧

1. 禁用计算机管理——软件设备中
	![Pasted image 20240818085708.png](Pasted%20image%2020240818085708.png)
2. 关闭服务中的 SSDP ![Pasted image 20240818085817.png](Pasted%20image%2020240818085817.png)
3. 更改着色器缓存大小![Pasted image 20240818090008.png](Pasted%20image%2020240818090008.png)
4. 程序设置中调整 OpenGL 渲染为优先性能，自定义程序使用添加找到游戏 ![Pasted image 20240818090111.png](Pasted%20image%2020240818090111.png) 
## 2024 年 9 月 19 日08:58:41
### 解决本地回环地址无法访问
2024 年 9 月 19 日09:29:48 开启之后发现[使用虚拟机地址而不是外部Windows本机地址](Linux%20Basics.md#^1a483c)，遂关闭
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
据说删除之后会影响 intellisense 的速度