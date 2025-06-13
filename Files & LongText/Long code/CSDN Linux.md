# centos 8 使用yum 的各种问题
## Errors during downloading 下载报错
### 报错提示
```bash
[root@localhost sickwag]# yum search wget
Failed to set locale, defaulting to C.UTF-8
CentOS Linux 8 - AppStream                   0.0  B/s |   0  B     00:00    
Errors during downloading metadata for repository 'appstream':
  - Curl error (6): Couldn't resolve host name for http://mirrorlist.centos.org/?release=8&arch=x86_64&repo=AppStream&infra=stock [Could not resolve host: mirrorlist.centos.org]
```

### 参考链接
按顺序执行，首先修复 yum 源问题，然后重新配置语言包
[CentOS 8 执行yum命令报错：Failed to set locale, defaulting to C.UTF-8_failed to set locale, defaulting to c.utf-8 centos-CSDN博客](https://blog.csdn.net/B11050729/article/details/132493875)
[centos8重新配置yum源(Errors during downloading metadata for repository ‘AppStream‘)_centos8 yum 源 重置-CSDN博客](https://blog.csdn.net/wt334502157/article/details/123189000)

## 无法安装 ntp 服务
### 原因
旧版本 centos 使用 `yum install ntp` 安装，现已经提示无法匹配 ntp ，采用新的安装方案即可
```bash
yum install chrony -y&& \
systemctl enable chronyd.service && \
systemctl restart chronyd.service
```
其中&&表示另起一行写上一行的内容
### 参考链接
[关于Linux CentOS7 为同步服务器时间安装ntp失败的解决办法_centos 安装时间服务器不成功怎么解决-CSDN博客](https://blog.csdn.net/sadhu272/article/details/126799831)

## yum 安装程序 MySQL 时报错
### 报错信息
```bash
所有的匹配结果均已经被参数的模块化过滤条件筛除: mysql-community-server
-----------------------------
file:///etc/pki/rpm-gpg/RPM-GPG-KEY-mysql 的 GPG 公钥(0x5072E1F5)已安装
仓库 "MySQL 8.0 Community Server" 的 GPG 公钥已安装，但是不适用于此软件包。
..........................。
GPG检查失败
```
1. 解决方法是在安装新的 mysql 之前禁用默认 mysql 模块
2. 解决方法：[今日解决新安装的centos 8安装MYSQL提示未找到匹配的参数： mysql-community-server_未找到匹配的参数: mysql-community-server 错误:没有任何匹配: mysql--CSDN博客](https://blog.csdn.net/yanchao963852741/article/details/105297519)
3. 解决方法是关闭 GPG 服务重新安装
### 使用命令
禁用默认 MySQL 服务
`sudo yum module disable mysql
禁用 GPG 服务安装 MySQL
`yum -y install mysql-community-server --nogpgcheck`
重启 MySQL `systemctl start mysqld.service`
检查 MySQL 状态`systemctl status mysqld`
### 参考链接
1.  [CentOS8 按照 MySQL5.7———错误：没有任何匹配: mysql-community-server_所有的匹配结果均已经被参数的模块化过滤条件筛除: mysql-community-server 错误-CSDN博客](https://blog.csdn.net/weixin_44798320/article/details/123446249)
2.  [Linux中安装MySQL以及报错解决（错误：GPG 检查失败）_错误:gpg 检查失败-CSDN博客](https://blog.csdn.net/m0_66011019/article/details/136068386)

## 配置静态 IP 地址和 ifconfig 不同
### 问题
通过编辑 `vim /etc/sysconfig/network-scripts/ifcfg-ens160` 文件时，修改 BOOTPROTO 为 static 静态 IP 地址分配，也添加了四行新内容，但使用 ifconfig 得到的 IP 地址和配置文件中不同
![Pasted image 20240927215913.png](../Attachments/Pasted%20image%2020240927215913.png)
### 原因
centos 8 以上系统自动忽略了配置属性 HWADDR，需要手动添加，不然只会在虚拟机中设置的子网 IP 字段中随机选择一个，属于是“半静态”

### 解决方法
VM 中获取虚拟机 MAC 地址，然后在配置文件中添加一行 `HWADDR=MAC`，重启寻觅几即可
### 参考链接
[centos7虚拟机用ifconfig查看的ip与自己配置的不同时如何解决_centos7 ipconfig 主机不一致-CSDN博客](https://blog.csdn.net/qq_45112156/article/details/107134400)

## Dbeaver 远程连接 linux mysql
### 问题
Dbeaver 新建连接，在 linux 端使用 ifconfig 查看 IP 地址，在新建连接中填入 IP 地址，点击链接即可，第一次链接需要下载驱动
如果出现报错
```shell
null, message from server: “Host ‘192.168.170.1‘ is not allowed to connect to this MySQL server“
```
则是因为 mysql 没有启动远程访问权限导致

### 解决方法
登入 mysql
使用系统数据库 `use mysql`
允许任何主机连接数据库 `update user set host = '%' where user = 'root';`
重启 mysql 生效 `service mysqld restart`
Dbeaver 重新连接即可
### 参考链接
[Linux安装MySQL与DBeaver的远程连接_dbeaver linux-CSDN博客](https://blog.csdn.net/qq_45059431/article/details/138394063)
[null, message from server: “Host ‘192.168.170.1‘ is not allowed to connect to this MySQL server“_null, message from server: "host '192.168.0.3' is -CSDN博客](https://blog.csdn.net/m0_69097184/article/details/134416383)