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
### 报错分析
上面有两个报错
- 1 是 `Failed to set locale, defaulting to C.UTF-8` 没有配置本地语言包导致安装失败，需要配置
- 2 是 `Errors during downloading metadata for repository 'appstream':` 无法从 yum 源下载


### 动手修理
首先调试好 yum 源，不然后面下载不了内容
原本使用阿里云的镜像站配置 yum，后来上网一搜发现 centos 8.5.211 已停止维护，需要更新 yum 源
查看当前已安装的语言包：`locale -a`
安装中文语言包：`yum install glibc-langpack-zh`  
安装英文语言包：`yum install glibc-langpack-en`