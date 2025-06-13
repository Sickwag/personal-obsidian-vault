# Geekhour 30 mins Docker
## CI/CD 简介
CI/CD 是持续集成（Continuous Integration）和持续部署（Continuous Deployment）或持续交付（Continuous Delivery）的缩写，是现代软件开发中用于自动化软件发布流程的方法论。

1. **持续集成（CI）**：开发人员频繁地（通常是每天多次）将代码变更合并到共享仓库中。每次合并后，自动运行构建和测试，以确保新代码不会破坏现有功能。这有助于早期发现和解决集成问题。
2. **持续交付（CD）**：在持续集成的基础上，确保软件可以快速且稳定地发布到生产环境。这意味着每次代码变更通过所有测试后，都可以立即部署到生产环境。
3. **持续部署**：是持续交付的进一步延伸，它自动将通过所有测试的代码变更部署到生产环境，无需人工干预。
## Docker 简介
![Pasted image 20240913205607.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240913205607.png)
将各种应用程序打包成一个个“集装箱”，通过图标上的鲸鱼运动到任何需要的地方
将软件运行所需要的所有依赖文件封装在一起，配置好所有内容只等一键使用
![Pasted image 20240913205809.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240913205809.png)
![Pasted image 20240913205908.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240913205908.png)
## Docker 和虚拟机的区别
![Pasted image 20240913211152.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240913211152.png)
### 虚拟机
Windows，macos 等都是完整的操作系统，在这些操作系统中虚拟化环境通过 hypervisor 虚拟化功能创建虚拟机，创建虚拟的运行环境
![Pasted image 20240913210101.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240913210101.png)
- 虚拟机可以将一台物理机的资源分配给多个虚拟机，同时提供多个环境或服务
- 缺点是需要重复占用硬件资源，启动资源
- 每个软件需要不同的环境，一个环境一个虚拟机，启动所有软件相当于启动所有操作系统的全部功能
![Pasted image 20240913210144.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240913210144.png)

### Docker
Docker 和容器（container）不是一个概念，容器只有应用程序和依赖文件
**Docker 和容器的区别**：
- **容器（Container）**：容器是一种轻量级、独立的软件打包技术，它允许将应用程序及其依赖打包成一个**可移植**的单元。容器共享宿主机的操作系统内核，因此不需要像虚拟机那样包含完整的操作系统，这使得它们更加轻便和启动迅速。
- **Docker**：Docker 使用容器技术来创建、管理和部署应用程序。Docker 提供了创建和管理容器的工具和API，使得容器化技术更加易于使用和普及。
**容器的工作原理**：
- 容器**之间**共享宿主机的操作系统内核，但每个容器都有自己的文件系统、CPU、内存等资源的隔离视图。这种隔离确保了容器的轻量级和高效性。
**Docker 的容器管理**：
- Docker 并不“启动操作系统的哪些部分功能”，而是利用宿主机的操作系统内核来运行容器。Docker 守护进程（daemon）负责管理容器的生命周期，包括创建、启动、停止和删除容器。Docker 使用镜像（image）作为容器的模板，这些镜像是只读的，并在创建容器时生成一个可写的层。

## 基本原理和概念
Docker 中
- **镜像**是一个只读的模板
- **容器**是 Docker 的运行实例
	-  可以用编程语言理解：镜像是类创建的模板，有各种功能和属性，通过镜像设置不同的属性和功能实例化得到多个容器
- **仓库**用来分享模板，常用的是 Dockerhub

安装配置
#Docker安装 #更改Docker位置 #Docker位置 
- 使用下面代码可以更改安装位置
`start /w "" "Docker Desktop Installer.exe" install --installation-dir=D:\Program\Docker
`
- 安装之后在系统设置中启动 Docker，设置中开启 *hyper-v*功能之后可以在命令行中使用 Docker 代码
## Docker 运行逻辑
![Pasted image 20240913212559.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240913212559.png)
- docker daemon 是服务端守护进程，用来管理服务端资源，client 中的操作（终端输入 docker 指令）由 client 发送给 docker daemon 处理之后将返回结果发送回 client（执行结果）
- docker daemon 是一个后台服务进程，类似 mysql 80
- client 和 docker host 之间通过 socket 或 restful API 通信
## 容器化和 dockerfile
![Pasted image 20240913213157.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240913213157.png)
dockerfile 是镜像创建指导文件，告诉 docker 如何创建这个程序的操作系统环境（一般是精简的）、第三方库、依赖文件、编译器、环境变量等
## 实战
vscode 中安装 Docker 插件，在工作目录中创建一个 `Dockerfile` 文件（没有拓展名） 

# Linux 下 Docker
## Docker 安装和部署
以下所有命令需要管理员权限运行，在命令前加 `sudo` 即可，也可以输入 `su` 输入密码后使用 root 用户
配置 docker 的 yum 库
`yum install -y yum-utils`
Docker 的 yum 库配置命令
`yum-config-manager --add-repo http://download.docker.com/linux/centos/docker-ce.repo`
Linux 下 Docker 安装命令
`sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`
查看 docker 镜像，在未配置容器服务时显示无法连接到 docker
`docker images`
首先启动 docker
`systemctl enable docker` -----系统启动时启动 docker
`systemctl start/stop docker` ----- 只启动/停止 docker
`docker ps` 查看 ps，不报错说明已经启动

## 部署镜像
使用阿里云提供镜像[容器镜像服务 (aliyun.com)](https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors)
用提供的代码部署镜像加速器	
```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://bbh5sntu.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## 部署 MySQL


# # 【狂神说Java】Docker最新超详细版教程通俗易懂
[【狂神说Java】Docker最新超详细版教程通俗易懂_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1og4y1q7M4/?spm_id_from=333.337.search-card.all.click&vd_source=876be08bc9c030f4a9ea1fb97e0d0342)
## 虚拟化技术和容器化技术对比
### 虚拟化技术
- 资源占用十分多
- 冗余步骤多
- 启动很慢
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/7eb113eb1ed9cc907df7315bf90c533f.png)
### 2.2. 容器化技术
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/adcfb944932bd422b28408162e221515.png)

### 比较Docker和虚拟化技术的不同

- 传统虚拟机， 虚拟出一条硬件，运行完整的操作系统，在这个系统上安装和运行软件
- 容器内的应用直接运行在宿主机的内部，容器没有自己的内核的，也没有虚拟硬件，所以轻便
- 每个容器间是相互隔离的，每个容器内都有一个属于自己的文件系统，互不影响
- 应用更快速的交互和部署
    - 传统：一堆帮助文档，安装程序
    - Docker： 打包镜像发布测试，一键运行
- 更便捷的升级和扩缩容
- 更简的系统运维
- 更高效的计算资源利用
![Pasted image 20241019113309.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020241019113309.png)

### 3. 名词解释

- 镜像（image）
    - Docker镜像就好比是一个模板，可以通过这个模板来创建容器服务，tomcat镜像 ===> run ===> tomcat01容器， 通过这个镜像可以创建多个容器（最终服务运行或者项目运行就是在容器中的）
- 容器（container）
    - Docker利用容器技术，独立运行一个或者一组应用， 通过镜像来创建的
    - 启动，停止，删除，基本命令！
    - 就目前可以把这个容器理解为一个建议的linux系统
- 仓库（repository）
    - 存放镜像的地方
    - Docker Hub（默认是国外的）
    - 阿里云,,,都有容器服务（配置镜像加速！）

### 4. 阿里云镜像加速

1. 登录阿里云服务器，找到`容器镜像服务`
2. 设置Registry登录密码
3. 找到镜像加速器
4. 配置使用

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://pi9dpp60.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```