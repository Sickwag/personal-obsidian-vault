项目地址：(https://github.com/anarthal/servertech-chat.git)
# 完整运行流程
## 环境准备
### 工具安装
- g++版本更新到 11 以上，支持 C++17 标准（ubuntu 使用 `apt install` 即可）
- 安装编译 boost 库必须的开发套件包 `bashsudo apt install build-essential g++ python3-dev libicu-dev libbz2-dev wget`，其中 g++不会是最新的
- 在 [Boost 1.89.0](https://www.boost.org/releases/latest/) 中找到最新 boost 库，使用 `wget` 下载对应的包
	- `tar -xvf` 解压包
	- `cd` 之后 `./bootstrap -prefix=/usr/local/boost_1.89.0` ，prefix 参数决定了之后使用 `./b2 install` 会将 boost 库文件安装在什么位置
	- `./b2 install` 安装 boost 库
	- 检查 `ls -al /usr/local/boost_1.89.0` 中是否有 include 和 lib 文件夹，以及其中是否有大量的 `.hpp` 文件
- 在(https://cmake.org/files/v3.29/cmake-3.29.0.tar.gz) 中下载 cmake 构建工具
	- 解压，进入目录后使用 `./bootstrap -prefix=/usr/local/cmake_3.29.0 && make install` 编译cmake工具
- 将 `/usr/locate/boost_1.89.0` 和 `/usr/locate/cmake-3.29.0` 将两者添加到环境变量中 `export PATH=/usr/local/....:$PATH`
### 代码更新
- 项目使用boost 1.74，最新的 boost 1.89 已经将 `time.expires_from_now()` 舍弃，所以需要替换为 `time.expires_after()`，位置在 servertech-chat/server/src/services/mysql_client. cpp:182:23。
- 根据指引 pdf 中将 mysql 服务的账号密码设置正确
- 在本机的 redis.conf 文件中将 requirepass 设置为 `""` 空，项目只能接受密码为空值的 redis 服务，否则前端无法和后端交互
- 在进入 serve 目录之后使用
```bash
cmake . -DCMAKE_CXX_STANDARD=17 && make
```
出现 main 文件之后继续按照指引即可