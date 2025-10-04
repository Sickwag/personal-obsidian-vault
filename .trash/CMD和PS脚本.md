来源
<[8个简单有用windows命令，肯定有你不知道的技巧 榨干硬盘空间，文件加密，局域网信息，公网信息，链路诊断，链接过的wifi密码，win11免登录，系统修复_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1Yy421B7zu/?spm_id_from=333.1007.tianma.1-3-3.click&vd_source=876be08bc9c030f4a9ea1fb97e0d0342)>
### 1.cipher命令：
在system32文件夹下写入cipher /w:加上需要写入临时文件的路径
cipher命令本质是通过写入一个超大体量的文件占满磁盘空间以防文件进行恢复（正常删除操作系统只会把原有数据占用的磁盘空间标记为空闲而不是擦除这部分数据）
### 2.文件加密
cipher加密命令：
同理，语法为cipher /e:加上需要加密文件的路径
加密使用的是证书加密方式，加密之后的文件只能在本台电脑上特定用户才能使用秘钥解密，秘钥是Windows本用户的密码
**在搜索中进入管理文件加密证书**功能后可以导出加密证书到龄一台电脑上使用
***解密命令：将上述的/e改为/d就可进行文件的解密，不需要输入密码***
加密命令可以加密文件夹，这样的操作会加密文件夹中所有文件
### 3.公网IP
使用命令行网址请求工具curl
语法：curl ipinfo.io
这条命令的意思是请求ipinfo.io这个网站，二网站返回这台电脑所在的IP公网信息
### 4.链路诊断
用于排除网络故障，查看现在电脑与目标网址通信所经过的所有链路信息
语法：tracert 后面加网址
![Pasted image 20240331144406.png](Pasted%20image%2020240331144406.png)
### 5.查看已连接网络的WIFI密码
语法：netsh wlan show profile
这样会显示出所有WiFi配置的名称
下面使用这一条命令
netsh wlan show profile name="WiFi配置名称" key=clear
可以看到密码
![Pasted image 20240331144741.png](Pasted%20image%2020240331144741.png)
**关键内容**就是密码
### 6.启动IE浏览器
在win10以上系统使用IE浏览器
创建记事本，输入以下文字
```
CreateObject("InternetExplorer.Application").Visible=true
```
将后缀名改为.vbs
双击启动IE浏览器
### 7.跳过win11强制联网验证
在新电脑开机验证时，按shift+F10调出cmd
输入
```
oobe\bypassnro
```
电脑就会重启，并出现“我没有internet链接“选项
### 8.修复系统文件
```
sfc /scannow
```
扫描Windows上所有的关键文件，如果出现问题会自动修复，大部分常见运行错误都可以有所改变
### 检查当前终端是否有管理员权限
Cmd
```bash
cd C:\Windows\System32\config
if %errorlevel% equ 0 (
    echo 当前终端具有管理员权限
) else (
    echo 当前终端不具有管理员权限
)
::cmd用管理员权限运行程序
runas /user:Administrator application_name
```
Powershell：
```Powershell
if (([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "当前终端具有管理员权限"
} else {
    Write-Host "当前终端不具有管理员权限"
}

<# powershell 用管理员权限运行程序
 	Start-Process cmd.exe -Verb RunAs 
 #>
```
# Batch
`echo off` 表示关闭回显，`echo off` 和 `@echo off` 的区别？echo off 是执行时不显示此语句后的所有命令行，但还会显示 echo off；@echo off 是执行时不显示本行（echo off）及后面的所有命令行；
`echo=` 输出一个空行
`echo words` 输出内容
pause 关键字让程序暂停，***cmd 窗口提示“按任意键继续“***
`md` 在 bat 脚本中是创建文件夹的命令
也可以创建多层级目录的文件夹，md D:\Hello\xixi\testreport，若是 testreport 已经存在，会给出提示；如 xixi 目录已经存在，则直接使用
ren 可以用来重命名名字也可以重命名文件；
```batch
ren 完整路径文件名（文件夹名） 新文件名（新文件夹名）
```
查看命令有哪些参数，使用[命令/?]，如，del/?, dir/?；若是不想在 dos 中再次确认（Y/N），可以加上/q 参数
move 用来移动文件夹或者文件； move 原 A 终 B；会将‘原 A’下的所有子目录或子文件，移动到‘终 B’中；
若是‘原 A’不存在，则会报错；若是‘终 B’不存在，会直接将‘原 A’改为‘终 B’；
`copy a b` 把 A 拷贝到 B 位置
`rd` remove directory
`del` delete file

---
使用默认方法打开一个文件
```powershell
start "" "文件的完整路径或相对路径"
```
调用一个可执行文件：
```powershell
"C:\Program Files\SomeApp\app.exe" --arg1 --arg2
```
执行另一个批处理文件
```powershell
call other_script.bat
```
