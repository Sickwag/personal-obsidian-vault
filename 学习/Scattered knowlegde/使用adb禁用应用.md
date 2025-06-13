万能指令
```C#
查看连接电脑的设备
adb devices
禁用服务中心
 adb shell pm disable-user com.huawei.ohos.famanager
 禁用智慧搜索
 adb shell pm disable-user com.huawei.search
重新开启命令
 adb shell pm enable com.huawei.search
```
因手势操作经常导致拉出这两玩意，也没有系统设置来关闭，故使用开发命令关闭
1.下载安卓ADB工具包
[**SDK Platform Tools 版本说明 | Android 开发者 | Android Developers**](https://link.zhihu.com/?target=https%3A//developer.android.google.cn/studio/releases/platform-tools)[](https://link.zhihu.com/?target=https%3A//developer.android.google.cn/studio/releases/platform-tools)[developer.android.google.cn/studio/releases/platform-tools](https://link.zhihu.com/?target=https%3A//developer.android.google.cn/studio/releases/platform-tools)
[![](https://pic2.zhimg.com/80/v2-a757b141bb6cffb7afced9b264f45421_720w.webp)](https://pic2.zhimg.com/80/v2-a757b141bb6cffb7afced9b264f45421_720w.webp)
2.开启手机开发者模式和USB调试
设置->关于手机->连击版本号 会开启开发者模式
设置->系统和更新->开发人员选项->USB调试
3.进入ADB工具包解压目录下
[![](https://pic1.zhimg.com/80/v2-aefc932bbf86221b970d0c4f098873d0_720w.webp)](https://pic1.zhimg.com/80/v2-aefc932bbf86221b970d0c4f098873d0_720w.webp)
adb运行需要实现设置好环境变量（同python）
4.USB手机连接电脑，开启调试，命令窗口运行命令
(可用于其他手机）