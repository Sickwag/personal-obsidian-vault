 # YanAPI 说明[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#yanapi "永久链接至标题")

## 初始化[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id1 "永久链接至标题")

### yan_api_init[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-yan-api-init-font "永久链接至标题")

YanAPI.yan_api_init(robot_ip: str)

> 初始化SDK

**参数**

- **robot_ip** (str) – 机器人地址

---

## 电量[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id2 "永久链接至标题")

### get_robot_battery_info[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-robot-battery-info-font "永久链接至标题")

YanAPI.get_robot_battery_info()

> 获得机器人电量信息

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:
    {
        voltage: integer   电池电压(单位mv)
        charging: integer  充电状态:　1-正在充电 0-未充电
        percent: integer   电量百分比
    }
    msg:string  提示信息
}

### get_robot_battery_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-robot-battery-value-font "永久链接至标题")

YanAPI.get_robot_battery_value()

> 获得机器人电量百分比

**返回类型** int

**返回说明**　电量百分比 (0-100)

---

## 摔倒管理[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id3 "永久链接至标题")

### get_robot_fall_management_state[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-robot-fall-management-state-font "永久链接至标题")

YanAPI.get_robot_fall_management_state()

> 获得机器人摔倒管理状态

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    data:
    {
        enable: bool 布尔值：True-打开 False-关闭
    }
    msg: string 提示信息
 }

### set_robot_fall_management_state[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-set-robot-fall-management-state-font "永久链接至标题")

YanAPI.set_robot_fall_management_state(enable: bool)

> 设置机器人摔倒管理状态

**参数**

- **enable** (bool) - 机器人摔倒后是否自动爬起，布尔值：True-自动爬起 False-不会自动爬起

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    msg: string 提示信息
 }

---

## 语言[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id4 "永久链接至标题")

### get_robot_language[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-robot-language-font "永久链接至标题")

YanAPI.get_robot_language()

> 获取机器人语言

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    data:
    {
        language:string 语言：zh-中文 en-英文
    }
    msg:string 提示信息
 }

### set_robot_language[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-set-robot-language-font "永久链接至标题")

YanAPI.set_robot_language(language: str)

> 设置机器人语言

**参数**

- **language** (str) – 机器人语言：’zh’-中文 ‘en’-英文

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    msg: string 提示信息
 }

---

## 灯效[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id5 "永久链接至标题")

### get_button_led_color_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-button-led-color-value-font "永久链接至标题")

YanAPI.get_button_led_color_value()

> 返回机器人胸口按钮灯颜色

**返回类型** str

**返回说明** 机器人胸口按钮灯颜色：white/red/green/blue/yellow/purple/cyan

### get_button_led_mode_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-button-led-mode-value-font "永久链接至标题")

YanAPI.get_button_led_mode_value()

> 返回机器人胸口按钮灯点亮模式

**返回类型** str

**返回说明** 胸口按钮灯点亮模式：on 开/off 关/blink 闪烁/breath 呼吸

### get_eye_led_color_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-eye-led-color-value-font "永久链接至标题")

YanAPI.get_eye_led_color_value()

> 返回机器人眼睛LED颜色

**返回类型** str

**返回说明** 眼睛LED颜色：red/green/blue

### get_eye_led_mode_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-eye-led-mode-value-font "永久链接至标题")

YanAPI.get_eye_led_mode_value()

> 返回机器人眼睛LED点亮模式

**返回类型** str

**返回说明** 眼睛LED点亮模式：on 开/off 关/blink 闪烁

### get_robot_led[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-robot-led-font "永久链接至标题")

YanAPI.get_robot_led()

> 获取机器人灯效

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    data:[
            {
                type:string  LED灯的类型：button/camera 默认值Default: button
                color:string 默认值Default: white
                mode: string  默认值Default: on
            }
        ]
    msg: string 提示信息
}

**返回值**

|type|color|mode|
|---|---|---|
|button|white/red/green/blue/yellow/purple/cyan|on/off/blink/breath|
|camera|red/green/blue|on/off/blink|

### set_robot_led[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-set-robot-led-font "永久链接至标题")

YanAPI.set_robot_led(type: str, color: str, mode: str)

> 设置机器人灯效

**参数**

- **type** (str) – LED灯的类型，默认值为: button
- **color** (str) – LED灯的颜色，默认值为: white
- **mode** (str) – LED灯的模式，默认值为: on

|type|color|mode|
|---|---|---|
|button|white/red/green/blue/yellow/purple/cyan|on/off/blink/breath/reset|
|camera|red/green/blue|on/off/blink|

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    msg: string 提示信息
}

### sync_set_led[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-sync-set-led-font "永久链接至标题")

YanAPI.sync_set_led(type: str, color: str, mode: str)

> 设置机器人灯效,设置完成后返回

**参数**

- **type** (str) – LED灯的类型，默认值为: button
- **color** (str) – LED灯的颜色，默认值为: white
- **mode** (str) – LED灯的模式，默认值为: on

|type|color|mode|
|---|---|---|
|button|white/red/green/blue/yellow/purple/cyan|on/off/blink/breath/reset|
|camera|red/green/blue|on/off/blink|

**返回类型** bool

**返回说明** True-设置成功，False-设置失败

---

## 版本信息[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id6 "永久链接至标题")

### get_robot_version_info[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-robot-version-info-font "永久链接至标题")

YanAPI.get_robot_version_info(type: str)

> 获取机器人版本信息

**参数**

- **type** (str) – 模块类型：core-机器人主体软件版本（固件版本&硬件版本&MCU版本） /servo-舵机版本 /sn-序列号

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    data:
        {
            core:string  机器人主体软件版本号
            servo:string 舵机版本号
            sn：string   机器人序列号
        }
    msg:string 提示信息
}

### get_robot_version_info_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-robot-version-info-value-font "永久链接至标题")

YanAPI.get_robot_version_info_value(type: str)

> 获取机器人版本信息-简化返回值

**参数**

- **type** (str) – 模块类型：core-机器人主体软件版本（固件版本&硬件版本&MCU版本） /servo-舵机版本 /sn-序列号

**返回类型** str

**返回说明** 机器人版本号

---

## 模式信息[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id7 "永久链接至标题")

### get_robot_mode[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-robot-mode-font "永久链接至标题")

YanAPI.get_robot_mode()

> 获取机器人运行模式

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    data: {
                energy_saving_mode: bool  布尔值：True-处于节能模式 False-非节能模式
                calibration_mode: bool  布尔值：True-处于校准模式 False-非校准模式
            }
    msg: string 提示信息
}

---

## 音量[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id8 "永久链接至标题")

### get_robot_volume[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-robot-volume-font "永久链接至标题")

YanAPI.get_robot_volume()

> 获取机器人音量

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:
        {
            volume:integer  最大值maximum:100
        }
    msg:string 提示信息
}

### get_robot_volume_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-robot-volume-value-font "永久链接至标题")

YanAPI.get_robot_volume_value()

> 获取机器人音量-简化返回值

**返回类型** int

**返回说明** 机器人音量值，返回-1表示获取失败

### set_robot_volume[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-set-robot-volume-font "永久链接至标题")

YanAPI.set_robot_volume(volume: int)

> 设置机器人音量

**参数**

- **volume** (int) – 音量大小：0-100

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    msg:string 提示信息
}

### set_robot_volume_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-set-robot-volume-value-font "永久链接至标题")

YanAPI.set_robot_volume_value(volume: int)

> 设置机器人音量-简化返回值

**参数**

- **volume** (int) – 音量大小：0-100

**返回类型** bool

**返回说明** True-设置成功，False-设置失败

---

## 音乐[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id9 "永久链接至标题")

### delete_media_music[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-delete-media-music-font "永久链接至标题")

YanAPI.delete_media_music(name: str)

> 删除音乐文件（只能删除用户上传到 /home/pi/Document/music 的文件）

**参数**

- **name** (str) – 要删除的音乐名

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    msg:string 提示信息
}

### get_media_music_state[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-media-music-state-font "永久链接至标题")

YanAPI.get_media_music_state()

> 获取机器人音乐播放状态

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    data: {
                name: string 音乐名，例如"SorrySorry.mp3",
                status: string 音乐播放状态：run-播放 idle-停止
            }
    msg: string 提示信息
}

### upload_media_music[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-upload-media-music-font "永久链接至标题")

YanAPI.upload_media_music(filePath: str)

> 上传音乐文件（上传到 /home/pi/Documents/music 文件目录，格式目前仅支持wav或者mp3）

**参数**

- **filePath** (str) – 文件路径

**返回类型** dict

**返回说明**

{
    code: integer 返回码: 0表示正常
    msg: string 提示信息
}

### start_play_music[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-play-music-font "永久链接至标题")

YanAPI.start_play_music(name: str = ‘’)

> 播放音乐（支持的音乐格式：wav和mp3）

**参数**

- **name** (str) – 音乐名称，默认值为: SorrySorry.mp3

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    data:
        {
            total_time:integer 播放的音乐时长（单位：毫秒ms）
        }
    msg: string 提示信息
}

### sync_play_music[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-sync-play-music-font "永久链接至标题")

YanAPI.sync_play_music(name: str = ‘’)

> 播放音乐，播放完成后返回

**参数**

- **name** (str) – 音乐名称，默认值为: SorrySorry.mp3

**返回类型** bool

**返回说明** True-播放成功，False-播放失败

### stop_play_music[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-play-music-font "永久链接至标题")

YanAPI.stop_play_music()

> 停止播放音乐

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    msg: string 提示信息 
}

### get_media_music_list[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-media-music-list-font "永久链接至标题")

YanAPI.get_media_music_list()

> 获取音乐列表，可以获得所有内置和用户上传音乐的列表

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    data: {
            music: [
                        {
                            name: string 音乐名
                        }
                    ]
            },
    msg: string 提示信息
}

---

## 动作[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id10 "永久链接至标题")

### delete_motion[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-delete-motion-font "永久链接至标题")

YanAPI.delete_motion(name: str)

> 删除动作文件（删除在/home/pi/Documents/motions目录下的用户文件）

**参数**

- **name** (str) – 动作文件名，不包括hts后缀

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    msg: string 提示信息
}

### get_current_motion_play_state[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-current-motion-play-state-font "永久链接至标题")

YanAPI.get_current_motion_play_state()

> 获取当前动作文件执行状态

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    data: {
                name: string 动作文件名称
                status: string 执行状态 idle-非执行状态 run-正在执行
                timestamp: integer 时间戳, Unix标准时间
            },
    msg: string 提示信息
}

### start_play_motion[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-play-motion-font "永久链接至标题")

YanAPI.start_play_motion(name: str = ‘reset’, direction: str = ‘’, speed: str = ‘normal’, repeat: int = 1, timestamp: int = 0, version: str = ‘v1’)

> 开始执行动作

**参数**

- **name** (str) – 动作文件名，不包括hts/layers后缀
- **direction** (str) - 方向
- **repeat** (int) - 重复次数：1-100
- **speed** (str) - 动作执行速度：very slow/slow/normal/fast/very fast
- **timestamp** (int) - 时间戳, Unix标准时间
- **version** (str) - 动作执行类型，取值：v1-表示hts动作 / v2-表示支持动作分层的layers动作，默认值为v1

|name|direction|
|---|---|
|crouch/bow|（无须设置方向）|
|raise/stretch/come on/wave|left/right/both|
|bend/turn around|left/right|
|walk|forward/backward/left/right|
|head|forward/left/right|

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:
        {
            total_time:integer 运行完成需要的时间（单位：毫秒ms）
        }
    msg:string 提示信息
}

### sync_play_motion[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-sync-play-motion-font "永久链接至标题")

YanAPI.sync_play_motion(name: str = ‘reset’, direction: str = ‘’, speed: str = ‘normal’, repeat: int = 1, version: str = ‘v1’)

> 开始执行动作，执行完成后返回

**参数**

- **name** (str) – 动作文件名，不包括hts/layers后缀
- **direction** (str) - 方向
- **repeat** (int) - 重复次数：1-100
- **speed** (str) - 动作执行速度：very slow/slow/normal/fast/very fast
- **timestamp** (int) - 时间戳, Unix标准时间
- **version** (str) - 动作执行类型，取值：v1-表示hts动作 / v2-表示支持动作分层的layers动作，默认值为v1

|name|direction|
|---|---|
|crouch/bow|（无须设置方向）|
|raise/stretch/come on/wave|left/right/both|
|bend/turn around|left/right|
|walk|forward/backward/left/right|
|head|forward/left/right|

**返回类型** bool

**返回说明** True-执行成功，False-执行失败

### pause_play_motion[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-pause-play-motion-font "永久链接至标题")

YanAPI.pause_play_motion(timestamp: int = 0, name: str = ‘’, version: str =’v1’)

> 暂停动作执行

**参数**

- **timestamp** (int) - 时间戳, Unix标准时间
- **version** (str) - 动作执行类型，取值：v1-表示hts动作 / v2-表示支持动作分层的layers动作，默认值为v1

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:
        {
            total_time:integer 运行完成需要的时间（单位：毫秒ms）
        }
    msg:string 提示信息
}

### resume_play_motion[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-resume-play-motion-font "永久链接至标题")

YanAPI.resume_play_motion(timestamp: int = 0, name: str = ‘’, version: str =’v1’)

> 恢复动作执行

**参数**

- **timestamp** (int) - 时间戳, Unix标准时间
- **name** (str) – 动作文件名，不包括hts/layers后缀，name=’’表示恢复所有动作
- **version** (str) - 动作执行类型，取值：v1-表示hts动作 / v2-表示支持动作分层的layer动作，默认值为v1

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:
        {
            total_time:integer 运行完成需要的时间（单位：毫秒ms）
        }
    msg:string 提示信息
}

### stop_play_motion[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-play-motion-font "永久链接至标题")

YanAPI.stop_play_motion(timestamp: int = 0, name: str = ‘’, version: str =’v1’)

> 停止动作执行

**参数**

- **timestamp** (int) - 时间戳, Unix标准时间
- **name** (str) – 动作文件名，不包括hts/layers后缀，name=’’表示停止所有动作
- **version** (str) - 动作执行类型，取值：v1-表示hts动作 / v2-表示支持动作分层的layer动作，默认值为v1

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:
        {
            total_time:integer 运行完成需要的时间（单位：毫秒ms）
        }
    msg:string 提示信息
}

### upload_motion[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-upload-motion-font "永久链接至标题")

YanAPI.upload_motion(filePath: str)

> 上传动作文件到 /home/pi/Documents/motions 目录

**参数**

- **filePath** (str) - hts文件的路径，包括文件名称

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    msg: string 提示信息
}

### get_motion_list[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-motion-list-font "永久链接至标题")

YanAPI.get_motion_list()

> 获取动作文件列表

**返回类型** dict

**返回说明**

{

    code: integer 返回码：0表示正常
    data: {
        system_hts_motions:[
        {
            name: string 动作文件名称
            music: bool 是否有配乐：false-无配乐 true-有配乐
        }
        ]
        system_layers_motions:[
        {
            name: string 动作文件名称
            music: bool 是否有配乐：false-无配乐 true-有配乐
        }
        ]
        user_hts_motions:[
        {
            name: string 动作文件名称
            music: bool 是否有配乐：false-无配乐 true-有配乐
        }
        ]
        user_layers_motions:[
        {
            name: string 动作文件名称
            music: bool 是否有配乐：false-无配乐 true-有配乐
        }
        ]
    }
    msg: string 提示信息
}

### get_motion_list_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-motion-list-value-font "永久链接至标题")

YanAPI.get_motion_list_value()

> 获取动作文件列表-简化返回值

**返回类型** list

**返回说明** 动作文件名称列表

### control_motion_gait[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-control-motion-gait-font "永久链接至标题")

YanAPI.control_motion_gait(speed_v: int = 0, speed_h: int = 0, steps: int = 0, period: int = 1, wave: bool = False)

> 机器人步态动作控制

**参数**

- **period** (integer) - 取值【0~5】，period = 0 表示停止步态
- **speed_v** (integer) - 前后垂直行走速度，取值【-5~5】
- **speed_h** (integer) - 左右水平行走速度，取值【-5~5】
- **steps** (integer) - 总步数值，大于零的正整数。默认值 steps =0 代表10亿这样一个极大值。
- **wave** (bool) - 表示是否开启手臂摆动，取值True/False，默认值为False表示不开启手臂摆动

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    msg:string 提示信息
}

### sync_do_motion_gait[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-sync-do-motion-gait-font "永久链接至标题")

YanAPI.sync_do_motion_gait(speed_v: int = 0, speed_h: int = 0, steps: int = 0, period: int = 1, wave: bool = False)

> 机器人步态动作控制，执行完成后返回

**参数**

- **period** (integer) - 取值【0~5】，period = 0 表示停止步态
- **speed_v** (integer) - 前后垂直行走速度，取值【-5~5】
- **speed_h** (integer) - 左右水平行走速度，取值【-5~5】
- **steps** (integer) - 总步数值，大于零的正整数。默认值 steps =0 代表10亿这样一个极大值。
- **wave** (bool) - 表示是否开启手臂摆动，取值True/False，默认值为False表示不开启手臂摆动

**返回类型** bool

**返回说明** True-执行成功，False-执行失败

### get_motion_gait_state[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-motion-gait-state-font "永久链接至标题")

YanAPI.get_motion_gait_state()

> 获取机器人步态执行状态

**返回类型** dict

**返回说明**

{
    code: 返回码：0表示正常
    data: {
                status: int 执行状态
                timestamp: integer 时间戳，Unix标准时间
            }
    msg: string 提示信息
}

**返回值**

|status|字段说明|
|---|---|
|0|Start to enter gait ready state. 开始进入步态准备|
|1|Already enter gait ready state. 已经进入步态准备|
|2|Start to walk. 开始步态行走|
|3|Reach the maximum steps. 到达最大步数|
|4|Start to entery gait stop state. 开始进入步态停止|
|5|Already enter gait stop state. 已经进入步态停止|
|6|Start to exit gait ready state. 开始退出步态|
|7|Already exit gait ready state. 已经退出步态|
|8|Idle state(no gait task). 停止空闲|

### exit_motion_gait[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-exit-motion-gait-font "永久链接至标题")

YanAPI.exit_motion_gait()

> 退出机器人步态执行，机器人将站立复位

**返回类型** dict

**返回说明**

{
    code: 返回码：0表示正常
    msg: string 提示信息
}

### get_servo_angle_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-servo-angle-value-font "永久链接至标题")

YanAPI.get_servo_angle_value(name: str)

> 查询舵机角度值（一次可以查询一个舵机角度值）

**参数**

- **name** (string) - 机器人舵机名称

|name|字段说明|
|---|---|
|RightShoulderRoll|servo No.1 右肩前|
|RightShoulderFlex|servo No.2 右肩侧|
|RightElbowFlex|servo No.3 右肘侧|
|LeftShoulderRoll|servo No.4 左肩前|
|LeftShoulderFlex|servo No.5 左肩侧|
|LeftElbowFlex|servo No.6 左肘侧|
|RightHipLR|servo No.7 右髋前|
|RightHipFB|servo No.8 右髋侧|
|RightKneeFlex|servo No.9 右膝|
|RightAnkleFB|servo No.10 右踝前|
|RightAnkleUD|servo No.11 右踝侧|
|LeftHipLR|servo No.12 左髋前|
|LeftHipFB|servo No.13 左髋侧|
|LeftKneeFlex|servo No.14 左膝|
|LeftAnkleFB|servo No.15 左踝前|
|LeftAnkleUD|servo No.16 左踝侧|
|NeckLR|servo No.17 头转|

**返回类型** int

**返回说明** 舵机角度值

### get_servos_angles[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-servos-angles-font "永久链接至标题")

YanAPI.get_servos_angles(names: List[str])

> 查询舵机角度值（一次可以查询一个或者多个舵机角度值）

**参数**

- **names** list[string] - 机器人舵机名称列表

|name|字段说明|
|---|---|
|RightShoulderRoll|servo No.1 右肩前|
|RightShoulderFlex|servo No.2 右肩侧|
|RightElbowFlex|servo No.3 右肘侧|
|LeftShoulderRoll|servo No.4 左肩前|
|LeftShoulderFlex|servo No.5 左肩侧|
|LeftElbowFlex|servo No.6 左肘侧|
|RightHipLR|servo No.7 右髋前|
|RightHipFB|servo No.8 右髋侧|
|RightKneeFlex|servo No.9 右膝|
|RightAnkleFB|servo No.10 右踝前|
|RightAnkleUD|servo No.11 右踝侧|
|LeftHipLR|servo No.12 左髋前|
|LeftHipFB|servo No.13 左髋侧|
|LeftKneeFlex|servo No.14 左膝|
|LeftAnkleFB|servo No.15 左踝前|
|LeftAnkleUD|servo No.16 左踝侧|
|NeckLR|servo No.17 头转|

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:
        {
            RightShoulderRoll:90    1号舵机
            RightShoulderFlex: 90   2号舵机
            RightElbowFlex: 90      3号舵机
            LeftShoulderRoll: 90    4号舵机
            LeftShoulderFlex:90     5号舵机
            LeftElbowFlex: 90       6号舵机
            RightHipLR: 90          7号舵机
            RightHipFB: 60          8号舵机
            RightKneeFlex:76        9号舵机
            RightAnkleFB:110        10号舵机
            RightAnkleUD: 90        11号舵机
            LeftHipLR: 90           12号舵机
            LeftHipFB:120           13号舵机
            LeftKneeFlex:104        14号舵机
            LeftAnkleFB: 70         15号舵机
            LeftAnkleUD:90          16号舵机
            NeckLR: 90              17号舵机
        }
    msg: string 提示信息
}

### set_servos_angles[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-set-servos-angles-font "永久链接至标题")

YanAPI.set_servos_angles(angles: Dict[str, int], runtime: int = 200)

> 设置舵机角度值（一次可以设置一个或者多个舵机角度值）

**参数**

- **angles** (map) - {servoName:angle}， servoName（str）-机器人舵机名称，angle（int）-舵机角度值
- **runtime**（int）- 运行时间，单位：毫秒ms，取值范围：200~4000

|servoName|angle 可运行角度范围|
|---|---|
|RightShoulderRoll|0-180|
|RightShoulderFlex|0-180|
|RightElbowFlex|0-180|
|LeftShoulderRoll|0-180|
|LeftShoulderFlex|0-180|
|LeftElbowFlex|0-180|
|RightHipLR|0-120|
|RightHipFB|10-180|
|RightKneeFlex|0-180|
|RightAnkleFB|0-180|
|RightAnkleUD|65-180|
|LeftHipLR|60-180|
|LeftHipFB|0-170|
|LeftKneeFlex|0-180|
|LeftAnkleFB|0-180|
|LeftAnkleUD|0-115|
|NeckLR|15-165|

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:
        {
            RightShoulderRoll:bool  True-设置成功，False-设置失败
            RightShoulderFlex:bool  True-设置成功，False-设置失败
            RightElbowFlex:bool     True-设置成功，False-设置失败
            LeftShoulderRoll:bool   True-设置成功，False-设置失败
            LeftShoulderFlex:bool   True-设置成功，False-设置失败
            LeftElbowFlex:bool      True-设置成功，False-设置失败
            RightHipLR:bool         True-设置成功，False-设置失败
            RightHipFB:bool         True-设置成功，False-设置失败
            RightKneeFlex:bool      True-设置成功，False-设置失败
            RightAnkleFB:bool       True-设置成功，False-设置失败
            RightAnkleUD:bool       True-设置成功，False-设置失败
            LeftHipLR:bool          True-设置成功，False-设置失败
            LeftHipFB: bool         True-设置成功，False-设置失败
            LeftKneeFlex:bool       True-设置成功，False-设置失败
            LeftAnkleFB:bool        True-设置成功，False-设置失败
            LeftAnkleUD:bool        True-设置成功，False-设置失败
            NeckLR:bool             True-设置成功，False-设置失败
        }
    msg:string 提示信息
}

### set_servos_angles_layers[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-set-servos-angles-layers-font "永久链接至标题")

YanAPI.set_servos_angles_layers(angles:Dict[str,Dict[int,int]])

> 设置分层动作舵机角度值（一次可以设置一个或者多个舵机角度值）

**参数**

- **angles** (map) - {servoName:{angle,isNeedBessel,runtime}}， servoName（str）-机器人舵机名称，angle（int）-舵机角度值，isNeedBessel（bool）-是否需要变速运动(贝塞尔曲线)，runtime（int）-运行时间，单位：毫秒ms，取值范围：200~4000

|servoName|angle 可运行角度范围|
|---|---|
|RightShoulderRoll|0-180|
|RightShoulderFlex|0-180|
|RightElbowFlex|0-180|
|LeftShoulderRoll|0-180|
|LeftShoulderFlex|0-180|
|LeftElbowFlex|0-180|
|RightHipLR|0-120|
|RightHipFB|10-180|
|RightKneeFlex|0-180|
|RightAnkleFB|0-180|
|RightAnkleUD|65-180|
|LeftHipLR|60-180|
|LeftHipFB|0-170|
|LeftKneeFlex|0-180|
|LeftAnkleFB|0-180|
|LeftAnkleUD|0-115|
|NeckLR|15-165|

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{ }
    msg:string 提示信息
}

### set_servos_mode[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-set-servos-mode-font "永久链接至标题")

YanAPI.set_servos_mode(mode: str, servos: List[str])

> 设置舵机工作模式（一次可以设置一个或者多个舵机工作模式）

**参数**

- **mode** (str) - 取值：work/program
- **servos** (list[str]) - 机器人舵机名称列表

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:
        {
            RightShoulderRoll:bool  True-设置成功，False-设置失败
            RightShoulderFlex:bool  True-设置成功，False-设置失败
            RightElbowFlex:bool     True-设置成功，False-设置失败
            LeftShoulderRoll:bool   True-设置成功，False-设置失败
            LeftShoulderFlex:bool   True-设置成功，False-设置失败
            LeftElbowFlex:bool      True-设置成功，False-设置失败
            RightHipLR:bool         True-设置成功，False-设置失败
            RightHipFB:bool         True-设置成功，False-设置失败
            RightKneeFlex:bool      True-设置成功，False-设置失败
            RightAnkleFB:bool       True-设置成功，False-设置失败
            RightAnkleUD:bool       True-设置成功，False-设置失败
            LeftHipLR:bool          True-设置成功，False-设置失败
            LeftHipFB: bool         True-设置成功，False-设置失败
            LeftKneeFlex:bool       True-设置成功，False-设置失败
            LeftAnkleFB:bool        True-设置成功，False-设置失败
            LeftAnkleUD:bool        True-设置成功，False-设置失败
            NeckLR:bool             True-设置成功，False-设置失败
        }
    msg:string 提示信息
}

---

## 传感器[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id11 "永久链接至标题")

### get_sensors_list[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-sensors-list-font "永久链接至标题")

YanAPI.get_sensors_list()

> 获取所有传感器的列表

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data: {
            sensors:
                [
                    {
                        id: integer 传感器ID值，取值：1~127
                        slot:integer 传感器槽位号，取值：1~6
                        type:string 传感器名称：gyro-陀螺仪/infrared-红外/ultrasonic-超声波/environment-环境/touch-触摸/pressure-压力
                        version: integer 传感器版本号
                    }
                ]
            },
    msg:string 提示信息
}

### get_sensors_list_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-sensors-list-value-font "永久链接至标题")

YanAPI.get_sensors_list_value()

> 获取所有传感器的列表-简化返回值

**返回类型** list

**返回说明** 传感器名称的列表：gyro-陀螺仪 infrared-红外 ultrasonic-超声波 environment-环境 touch-触摸 pressure-压力

### get_sensors_environment[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-sensors-environment-font "永久链接至标题")

YanAPI.get_sensors_environment()

> 获取环境传感器值（使用此接口前，请先调用sensors/list接口来查看相应的传感器是否被检测到）

**返回类型** dict

**返回说明**

{
    code: integer 返回码，0表示正常
    data:
        {
            environment:[
                           {
                                id: integer 传感器ID值，取值：1~127
                                slot:integer 传感器槽位号，取值：1~6
                                temperature:integer 温度值
                                humidity: integer 湿度值
                                pressure: integer 大气压力
                            }
                        ]
        }
    msg:string 提示信息
}

### get_sensors_environment_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-sensors-environment-value-font "永久链接至标题")

YanAPI.get_sensors_environment_value()

> 获取环境传感器值-简化返回值

**返回类型** dict

**返回说明**

{
    id: integer 传感器ID值，取值：1~127
    slot:integer 传感器槽位号，取值：1~6
    temperature:integer 温度值
    humidity: integer 湿度值
    pressure: integer 大气压力
}

### get_sensors_gyro[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-sensors-gyro-font "永久链接至标题")

YanAPI.get_sensors_gyro()

> 获取九轴陀螺仪运动传感器值

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:
        {
            gyro:[
                    {
                        id:integer 传感器ID值，取值：1~127
                        gyro-x:number(float)            陀螺仪 x
                        gyro-y:number(float)            陀螺仪 y
                        gyro-z:number(float)            陀螺仪 z
                        accel-x:number(float)         加速度计 x
                        accel-y:number(float)         加速度计 y
                        accel-z:number(float)         加速度计 z
                        compass-x:number(float)         磁力计 x
                        compass-y:number(float)         磁力计 y
                        compass-z:number(float)         磁力计 z
                        euler-x:number(float)           欧拉角 x
                        euler-y:number(float)           欧拉角 y
                        euler-z:number(float)           欧拉角 z
                    }
                ]
        }
    msg:string 提示信息
}

### get_sensors_infrared[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-sensors-infrared-font "永久链接至标题")

YanAPI.get_sensors_infrared(id: List[int] = None, slot: List[int] = None)

> 获取红外距离传感器值

**参数**

- **id** (list[int]) - 传感器的ID，可不填
- **slot**(List[int]) - 传感器槽位号，可不填

**返回类型** dict

**返回说明**

{
    code:integer 返回码，0表示正常
    data:
        {
            infrared:
                    [
                        {
                            id: integer 传感器ID值，取值：1~127
                            slot: integer 传感器槽位号，取值：1~6
                            value: integer 距离值，单位：毫米mm
                        }
                    ]
        }
    msg:string 提示信息
}

### get_sensors_infrared_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-sensors-infrared-value-font "永久链接至标题")

YanAPI.get_sensors_infrared_value()

> 获取红外距离传感器值-简化返回值

**返回类型** int

**返回说明** 距离值，单位：毫米mm

### get_sensors_pressure[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-sensors-pressure-font "永久链接至标题")

YanAPI.get_sensors_pressure(id: List[int] = None, slot: List[int] = None)

> 获取压力传感器值

**参数**

- **id** (list[int]) - 传感器的ID，可不填
- **slot**(List[int]) - 传感器槽位号，可不填

**返回类型** dict

**返回说明**

{
    code:integer 返回码，0表示正常
    data:
        {
            pressure:
                    [
                        {
                            id: integer 传感器ID值，取值：1~127
                            slot: integer 传感器槽位号，取值：1~6
                            value: integer 压力值，单位：牛N
                        }
                    ]
        }
    msg:string 提示信息
}

### get_sensors_pressure_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-sensors-pressure-value-font "永久链接至标题")

YanAPI.get_sensors_pressure_value()

> 获取压力传感器值-简化返回值

**返回类型** int

**返回说明** 压力值，单位：牛N

### get_sensors_touch[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-sensors-touch-font "永久链接至标题")

YanAPI.get_sensors_touch(id: int = None, slot: List[int] = None)

> 获取触摸传感器值

**参数**

- **id** (list[int]) - 传感器的ID，可不填
- **slot**(List[int]) - 传感器槽位号，可不填

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:
         {
            touch:
                [
                    {
                        id: integer 传感器ID值，取值：1~127
                        slot: integer 传感器槽位号，取值：1~6
                        value: integer 0-未触摸/ 1-触摸按钮1/ 2-触摸按钮2/ 3-触摸两边
                    }
                ]
        }
    msg:string 提示信息
}

### get_sensors_touch_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-sensors-touch-value-font "永久链接至标题")

YanAPI.get_sensors_touch_value()

> 获取触摸传感器值-简化返回值

**返回类型** int

**返回说明** 触摸状态值，0-未触摸/ 1-触摸按钮1/ 2-触摸按钮2/ 3-触摸两边

### get_sensors_ultrasonic[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-sensors-ultrasonic-font "永久链接至标题")

YanAPI.get_sensors_ultrasonic(id=None, slot=None)

> 获取超声波传感器值

**参数**

- **id** (list[int]) - 传感器的ID，可不填
- **slot**(List[int]) - 传感器槽位号，可不填

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    data:
        {
            ultrasonic:
                      [
                        {
                            id: integer 传感器ID值，取值：1~127
                            slot:integer  传感器槽位号，取值：1~6
                            value: integer 距离值，单位：毫米mm
                        }
                      ]
        }
    msg:string 提示信息
}

### get_sensors_ultrasonic_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-sensors-ultrasonic-value-font "永久链接至标题")

YanAPI.get_sensors_ultrasonic_value()

> 获取超声波传感器值-简化返回值

**返回类型** int

**返回说明** 距离值，单位：毫米mm

---

## 语音[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id12 "永久链接至标题")

### stop_voice_asr[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-voice-asr-font "永久链接至标题")

YanAPI.stop_voice_asr()

> 停止语音识别服务

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    msg:string 提示信息
}

### get_voice_asr_state[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-voice-asr-state-font "永久链接至标题")

YanAPI.get_voice_asr_state()

> 获取语义理解工作状态

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    status:string 执行状态：idle-非执行状态 run-正在运行
    timestamp:integer 时间戳, Unix标准时间
    data:{}
    msg: string 提示信息
}

### start_voice_asr[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-voice-asr-font "永久链接至标题")

YanAPI.start_voice_asr(continues=False, timestamp=0)

> 开始语义理解（当前语义理解处于工作状态而需要开启新的语义理解时，需要先停止当前的语义理解。）

**参数**

- **continues** (bool) - 是否进行连续语义识别，布尔值：True-需要 False-不需要，默认值为False
- **timestamp**(integer) - 时间戳, Unix标准时间

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### sync_do_voice_asr[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-sync-do-voice-asr-font "永久链接至标题")

YanAPI.sync_do_voice_asr()

> 执行一次语义理解并获得返回结果

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    status:string 执行状态：idle-非执行状态 run-正在运行
    timestamp:integer 时间戳, Unix标准时间
    data:{}
    msg: string 提示信息
}

### sync_do_voice_asr_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-sync-do-voice-asr-value-font "永久链接至标题")

YanAPI.sync_do_voice_asr_value()

> 执行一次语义理解并获得返回结果-简化返回值

**返回类型** dict

**返回说明**

{
    question:string 识别的内容
    answer:string 回答的内容
}

### get_voice_asr_offline_syntax_grammars[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-voice-asr-offline-syntax-grammars-font "永久链接至标题")

YanAPI.get_voice_asr_offline_syntax_grammars()

> 获取所有离线语法名称

**返回类型** dict

**返回说明**

{
    grammar: [
                    {
                        name: string 离线语法名称（系统自带离线语法名称为"default"）
                    }
                ]
}

### delete_voice_asr_offline_syntax[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-delete-voice-asr-offline-syntax-font "永久链接至标题")

YanAPI.delete_voice_asr_offline_syntax(grammar: str)

> 删除指定离线语法名称下的所有配置（可以先获取系统所有的离线语法名称，请注意：系统默认的离线语法名称为defaut, 不可以通过API来添加、删除或修改）

**参数**

- **grammar** (str) - 需要删除配置的语法名称

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    msg: string 提示信息
}

### get_voice_asr_offline_syntax[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-voice-asr-offline-syntax-font "永久链接至标题")

YanAPI.get_voice_asr_offline_syntax(grammar: str)

> 获取指定语法名称下的所有配置

**参数**

- **grammar** (str) - 需要获取配置结构的语法名称

**返回类型** dict

**返回说明**

{
    grammar:string 离线语法名称（系统自带离线语法名称为"default"）
    slot:
        [
            {
                name:string 离线语法意图
            }
        ]
    start:string     离线语法开启规则
    startinfo:string 离线语法开启规则意图
    rule:
        [
            {
                name: string 离线语法规则名称
                value:string 离线语法规则内容（即可用的离线语音指令词）
            }
        ]
}

### create_voice_asr_offline_syntax[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-create-voice-asr-offline-syntax-font "永久链接至标题")

YanAPI.create_voice_asr_offline_syntax(object: Dict)

> 创建一个新的离线语法名称配置（请注意：所有输入的操作符及关键词均为半角字符，不支持全角字符）

**参数**

- **object** (dict) - 按照语法规则填写的一个dict字典

{
    grammar:string 定义离线语法名称，请输入纯字母
    slot:
        [
            {
                name:string 定义离线语法意图，请输入纯字母
            }
        ]
    start:string     离线语法开启规则
    startinfo:string 离线语法开启规则意图（和slot-name保持对应统一）
    rule:
        [
            {
                name: string 定义离线语法规则名称（和slot-name保持对应统一）
                value:string 定义离线语法规则内容（即可用的离线语音指令词）
            }
        ]
}

**举例说明**

- 设置了意图为“want”的离线语音指令，具体指令内容为“我想|我要|我想要|请帮我”。
- 设置成功后，当对机器人说“我想”/“我要”/“我想要”/“请帮我”时，机器人能够理解到“want”意图。用户可通过其他API设置机器人理解到意图后的响应，例如让机器人执行特定动作、进行特定语音播报等。

{
    "grammar": "LocalCmd",
    "slot": [
                {
                    "name": "want"
                }
            ],
    "start": "LocalCmdStart",
    "startinfo": "<want>"
    "rule": [
                {
                    "name": "want",
                    "value": "我想|我要|我想要|请帮我"
                }
            ]
    }

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### update_voice_asr_offline_syntax[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-update-voice-asr-offline-syntax-font "永久链接至标题")

YanAPI.update_voice_asr_offline_syntax(object: Dict)

> 修改已有语法配置中的命令词和对应的返回值（请注意：所有输入的操作符及关键词均为半角字符，不支持全角字符。系统默认的离线语法名称为defaut，不可以通过API来添加、删除以及修改。

**参数**

- **object** (dict) - 按照语法规则填写的一个dict字典，其中的语法名称是需要修改内容的已有名称

{
    grammar:string 离线语法名称
    slot:
        [
            {
                name:string 离线语法意图
            }
        ]
    start:string     离线语法开启规则
    startinfo:string 离线语法开启规则意图
    rule:
        [
            {
                name: string 离线语法规则名称
                value:string 离线语法规则内容（即可用的离线语音指令词）
            }
        ]
}

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### stop_voice_iat[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-voice-iat-font "永久链接至标题")

YanAPI.stop_voice_iat()

> 停止语音听写

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    msg:string 提示信息
}

### get_voice_iat[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-voice-iat-font "永久链接至标题")

YanAPI.get_voice_iat()

> 获取语音听写结果

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    status: string  执行状态：idle-非执行状态 run-正在运行
    timestamp: integer 时间戳, Unix标准时间
    data:
        {
            语音听写返回数据
        }
    msg:string 提示信息
 }

### start_voice_iat[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-voice-iat-font "永久链接至标题")

YanAPI.start_voice_iat(timestamp: int = 0)

> 开始语音听写（当前语音听写处于工作状态而需要开启新的语音听写时，需要先停止当前的语音听写。）

**参数**

- **timestamp** (integer) - 时间戳，Unix标准时间

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### sync_do_voice_iat[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-sync-do-voice-iat-font "永久链接至标题")

YanAPI.sync_do_voice_iat()

> 执行一次语音听写并获得返回结果

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    status: string  执行状态：idle-非执行状态 run-正在运行
    timestamp: integer 时间戳, Unix标准时间
    data:
        {
            语音听写返回数据
        }
    msg:string 提示信息
 }

### sync_do_voice_iat_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-sync-do-voice-iat-value-font "永久链接至标题")

YanAPI.sync_do_voice_iat_value()

> 执行一次语音听写并获得返回结果-简化返回值

**返回类型** str

**返回说明** 语音听写识别到的内容

### stop_voice_tts[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-voice-tts-font "永久链接至标题")

YanAPI.stop_voice_tts()

> 停止语音播报任务

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### get_voice_tts_state[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-voice-tts-state-font "永久链接至标题")

YanAPI.get_voice_tts_state(timestamp: int = None)

> 获取指定任务或者当前工作状态（带时间戳为指定任务工作状态，如果无时间戳则表示当前工作状态）

**参数**

- **timestamp** (integer) - 时间戳，Unix标准时间

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    status: string 工作状态：idle-任务不存在 run-播放该段语音 build-正在合成该段语音 wait-处于等待执行状态
    timestamp: integer 时间戳, Unix标准时间
    data:{}
    msg:string 提示信息
}

### start_voice_tts[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-voice-tts-font "永久链接至标题")

YanAPI.start_voice_tts(tts: str = ‘’, interrupt: bool = True, timestamp: int = 0)

> 开始语音合成任务，合成指定的语句并播放（当语音合成处于工作状态时可以接受新的语音合成任务）

**参数**

- **tts** (str) - 待合成的文字
- **interrupt** (bool) - 是否可以被打断，True-可以被打断，False-不可以被打断，默认为True
- **timestamp** (int) - 时间戳，Unix标准时间

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### sync_do_tts[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-sync-do-tts-font "永久链接至标题")

YanAPI.sync_do_tts(tts: str = ‘’, interrupt: bool = True)

> 执行语音合成任务,合成完成后返回

**参数**

- **tts** (str) - 待合成的文字
- **interrupt** (bool) - 是否可以被打断，True-可以被打断，False-不可以被打断，默认为True

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    status: string 工作状态：idle-任务不存在 run-播放该段语音 build-正在合成该段语音 wait-处于等待执行状态
    timestamp: integer 时间戳, Unix标准时间
    data:{}
    msg:string 提示信息
}

---

## 视觉[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id13 "永久链接至标题")

### get_visual_task_result[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-visual-task-result-font "永久链接至标题")

YanAPI.get_visual_task_result(option: str, type: str)

> 获取视觉任务结果

**参数**

- **option** (str) - 可选项
- **type** (str) - 任务类型

|option|type|
|---|---|
|face|age/gender/age_group/quantity/expression/recognition/tracking/mask/glass|
|object|recognition|
|color|color_detect|
|hand|gesture|

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    type:string 消息类型，一次只返回一种类型的数据。
    data:
        {
            analysis:{
                        age: integer
                        group: string
                        gender: string
                        expression: string
                    }
            recognition:{
                            name:string
                        }
            quantity: integer 数量 (整数)
            color:
                [
                    {
                        name:string
                    }
                ]
        }
    timestamp:integer 时间戳，Unix标准时间
    status: string 状态
    msg: string 提示信息
}

**返回值**

|字段|字段说明|
|---|---|
|age|年龄数值|
|group|年龄段：baby/children/juvenile/youth/middle_age/old_age/none|
|gender|性别：male/female/none|
|expression|表情：happy/surprise/normal|
|color|颜色：black/gray/white/red/orange/yellow/green/cyan/blue/purple/none|

### start_face_recognition[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-face-recognition-font "永久链接至标题")

YanAPI.start_face_recognition(type: str, timestamp: int = 0)

> 开始人脸识别

**参数**

- **type** (str) - 任务类型：recognition/ tracking/ gender/ age_group/ quantity/ color_detect/ age/ expression/ mask/ glass
- **timestamp** (int) - 时间戳，Unix标准时间

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### stop_face_recognition[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-face-recognition-font "永久链接至标题")

YanAPI.stop_face_recognition(type: str, timestamp: int = 0)

> 停止人脸识别

**参数**

- **type** (str) - 任务类型：recognition/ tracking/ gender/ age_group/ quantity/ color_detect/ age/ expression/ mask/ glass
- **timestamp** (int) - 时间戳，Unix标准时间

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### sync_do_face_recognition[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-sync-do-face-recognition-font "永久链接至标题")

YanAPI.sync_do_face_recognition(type: str)

> 执行人脸识别，识别完成后返回

**参数**

- **type** (str) - 任务类型：recognition/ tracking/ gender/ age_group/ quantity/ color_detect/ age/ expression/ mask/ glass

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    type:string 消息类型，一次只返回一种类型的数据。
    data:
          {
            analysis: {
                        age: integer
                        group: string
                        gender: string
                        expression: string
                        mask: string  口罩识别结果：masked/unmasked/not masked well
                        glass: string 眼镜识别结果：grayglass/normalglass/noglass
                    }
            quantity: integer 数量
        }
    timestamp:integer 时间戳，Unix标准时间
    status: string 状态
    msg: string 提示信息
}

### sync_do_face_recognition_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-sync-do-face-recognition-value-font "永久链接至标题")

YanAPI.sync_do_face_recognition_value(type: str)

> 执行人脸识别，识别完成后返回-简化返回值

**参数**

- **type** (str) - 任务类型：recognition/ quantity/ gender/ age_group/ age/ expression/ mask/ glass

**返回类型** str/int

**返回说明** 对应任务下的识别结果

**返回值**

|输入参数|返回类型|返回值|
|---|---|---|
|recognition|str|人脸姓名标签（需提前调用set_vision_tag对图片进行标记）|
|quantity|int|人脸数量|
|gender|str|性别：male/female/none|
|age_group|str|年龄段：baby/children/juvenile/youth/middle_age/old_age/none|
|age|int|年龄值|
|expression|str|表情：happy/surprise/normal|
|mask|str|口罩佩戴情况：masked/unmasked/not masked well|
|glass|str|眼镜佩戴情况：normalglass/noglass/grayglass|

### start_gesture_recognition[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-gesture-recognition-font "永久链接至标题")

YanAPI.start_gesture_recognition(timestamp: int = 0)

> 开始手势识别

**参数**

- **timestamp** (int) - 时间戳，Unix标准时间

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### stop_gesture_recognition[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-gesture-recognition-font "永久链接至标题")

YanAPI.stop_gesture_recognition(timestamp: int = 0)

> 停止手势识别

**参数**

- **timestamp** (int) - 时间戳，Unix标准时间

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### sync_do_gesture_recognition[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-sync-do-gesture-recognition-font "永久链接至标题")

YanAPI.sync_do_gesture_recognition()

> 开始手势识别，识别完成后返回

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    status: string 工作状态：idle-非执行状态 run-正在运行
    timestamp: integer 时间戳, Unix标准时间
    data:{
        gesture: string 识别到的手势：OK/ThumbsUp/ThumbsDown/Victory/Heart/Awesome
    }
    msg:string 提示信息
}

### start_color_recognition[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-color-recognition-font "永久链接至标题")

YanAPI.start_color_recognition(timestamp: int = 0)

> 开始颜色识别

**参数**

- **timestamp** (int) - 时间戳，Unix标准时间

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### stop_color_recognition[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-color-recognition-font "永久链接至标题")

YanAPI.stop_color_recognition(timestamp: int = 0)

> 停止颜色识别

**参数**

- **timestamp** (int) - 时间戳，Unix标准时间

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### sync_do_color_recognition[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-sync-do-color-recognition-font "永久链接至标题")

YanAPI.sync_do_color_recognition()

> 开始颜色识别，识别完成后返回

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    type:string 消息类型，一次只返回一种类型的数据。
    data:
        {
            color:
                [
                    {
                        name:string 识别到的颜色
                    }
                ]
        }
    timestamp:integer 时间戳，Unix标准时间
    status: string 状态
    msg: string 提示信息
}

### start_object_recognition[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-object-recognition-font "永久链接至标题")

YanAPI.start_object_recognition(timestamp: int = 0)

> 开始物体识别

**参数**

- **timestamp** (int) - 时间戳，Unix标准时间

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### stop_object_recognition[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-object-recognition-font "永久链接至标题")

YanAPI.stop_object_recognition(timestamp: int = 0)

> 停止物体识别

**参数**

- **timestamp** (int) - 时间戳，Unix标准时间

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### sync_do_object_recognition[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-sync-do-object-recognition-font "永久链接至标题")

YanAPI.sync_do_object_recognition()

> 开始物体识别，识别完成后返回

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    type:string 消息类型，一次只返回一种类型的数据。
    data:
        {
            recognition:
                    {
                        name:string 识别到的物体
                    }
        }
    timestamp:integer 时间戳，Unix标准时间
    status: string 状态
    msg: string 提示信息
}

### start_aprilTag_recognition[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-apriltag-recognition-font "永久链接至标题")

YanAPI.start_aprilTag_recognition(tags: List, enableStream: bool = False)

> 开始aprilTag识别

**参数**

- **tags** (List[dict]) - 需要识别的apriltagID和边长信息
- **enableStream** (bool) - 是否需要打开视频流，默认值为False表示不开启视频流

[
    {
        id: int     TAG36H11标准id (取值：0 - 586)
        size:float  apirltag边长（单位：米m）
    }
]

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    streamUrl: string 视频流URL信息
    msg: string 提示信息
}

### stop_aprilTag_recognition[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-apriltag-recognition-font "永久链接至标题")

YanAPI.stop_aprilTag_recognition()

> 停止aprilTag识别

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    streamUrl: string 视频流URL信息
    msg: string 提示信息
}

### get_aprilTag_recognition_status[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-apriltag-recognition-status-font "永久链接至标题")

YanAPI.get_aprilTag_recognition_status()

> 查询aprilTag识别状态

**返回类型** dict

**返回说明**

{
    code: integer  返回码：0表示正常
    data: 
        {
            AprilTagStatus 识别到的apriltag数组
            [
                {
                    id: integer  AprilTag id
                    # 相对摄像头的位姿（⽤四元数及三维坐标表示）
                    orientation-x:integer,  
                    orientation-y:integer,
                    orientation-z:integer,
                    orientation-w:integer,
                    position-x:integer, 
                    position-y:integer,
                    position-z:integer
                }
            ]
        }
    status: string 执行状态：idle-非执行状态 run-正在运行
    msg: string  提示信息
}

### sync_do_QR_code_recognition[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-sync-do-qr-code-recognition-font "永久链接至标题")

YanAPI.sync_do_QR_code_recognition(timeout: int)

> 开始二维码识别，识别完成后返回

**参数**

- **timeout** (int) - 最大等待时间（单位：秒s），≤0表示直到识别成功后停止

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    content: string 识别到的内容
    status: string 状态
    msg: string 提示信息
}

### config_object_tracking[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-config-object-tracking-font "永久链接至标题")

YanAPI.config_object_tracking(track_timeout: int, detect_timeout: int)

> 配置物体跟踪（需在物体跟踪开启前进行配置，物体跟踪过程无法修改配置）

**参数**

- **track_timeout** (int) - 跟踪目标丢失的超时时间（单位：秒s），默认值为5，取值范围：1~100
- **detect_timeout** (int) - 跟踪目标检测的超时时间（单位：秒s），默认值为10，取值范围：1~100，取值为0则代表不限制检测时长

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    data: {}
    msg: string 提示信息
}

### start_object_tracking[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-object-tracking-font "永久链接至标题")

YanAPI.start_object_tracking(name:str, width:int, height:int)

> 开启物体跟踪

**参数**

- **name** (str) - 指定特定跟踪物体：yanshee/ wukong/ orange/ red_apple/ rubik_cube，若不指定则开启物体跟踪后自动搜索可跟踪物体
- **width** (int) - 指定摄像头视野跟踪物体的横截面宽度（单位：米m），若不指定, 则使用系统默认值
- **height** (int) - 指定摄像头视野跟踪物体的横截面高度（单位：米m），若不指定, 则使用系统默认值

|name|width|height|
|---|---|---|
|yanshee|0.1|0.365|
|wukong|0.06|0.24|
|orange|0.075|0.085|
|red_apple|0.08|0.075|
|rubik_cube|0.057|0.057|

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    data: {}
    msg: string 提示信息
}

### stop_object_tracking[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-object-tracking-font "永久链接至标题")

YanAPI.stop_object_tracking()

> 关闭物体跟踪

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    data: {}
    msg: string 提示信息
}

### get_object_tracking_status[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-object-tracking-status-font "永久链接至标题")

YanAPI.get_object_tracking_status()

> 获取物体跟踪状态

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    status: string 执行状态：idle-非执行状态 run-正在运行
    msg: string 提示信息
}

### do_face_entry[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-do-face-entry-font "永久链接至标题")

YanAPI.do_face_entry(name: str)

> 进行人脸录入

**参数**

- **name** (str) - 录入的人名

**返回类型** bool

**返回说明** True-执行成功，False-执行失败

### delete_vision_photo[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-delete-vision-photo-font "永久链接至标题")

YanAPI.delete_vision_photo(name: str)

> 删除指定名称的图片（用户拍照默认存储路径为/tmp/photo）

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### get_vision_photo[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-vision-photo-font "永久链接至标题")

YanAPI.get_vision_photo(name: str, savePath: str = ‘./’)

> 获取指定名称的照片，并保存到特定路径下面

**参数**

- **name** (str) - 照片名称
- **path** (str) - 照片本地存储路径

**返回类型** data

**返回说明** 二进制图片内容（可在指定保存路径下查看图片）

### take_vision_photo[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-take-vision-photo-font "永久链接至标题")

YanAPI.take_vision_photo(resolution: str = ‘640x480’)

> 拍一张照片，默认存储路径为/tmp/photo

**参数**

- **resolution** (str) - 照片分辨率，默认拍照分辨率为”640x480”，最大拍照分辨率为”1920x1080”

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:
        {
            name:string 照片文件名称
        }
    msg:string 提示信息
}

### get_vision_photo_list[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-vision-photo-list-font "永久链接至标题")

YanAPI.get_vision_photo_list()

> 获取机器人照片列表

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:[
            {
                name:string 照片文件名称
            }
    ]
    msg:string 提示信息
}

### delete_vision_photo_sample[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-delete-vision-photo-sample-font "永久链接至标题")

YanAPI.delete_vision_photo_sample(name: str)

> 删除指定名称的照片

**参数**

- **name** (str) - 需要删除的照片名称

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### get_vision_photo_samples[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-vision-photo-samples-font "永久链接至标题")

YanAPI.get_vision_photo_samples()

> 获取机器人照片样本列表

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:[
            {
                name: string 照片文件名称
            }
    ]
    msg:string 提示信息
}

### upload_vision_photo_sample[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-upload-vision-photo-sample-font "永久链接至标题")

YanAPI.upload_vision_photo_sample(filePath: str)

> 上传样本图片到指定文件夹

**参数**

- **filePath** (str) - 需要上传的文件路径

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### open_vision_stream[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-open-vision-stream-font "永久链接至标题")

YanAPI.open_vision_stream(resolution: str = ‘640x480’)

> 打开摄像头网络视频流（可通过浏览器直接接收视频流，视频将以mjpg格式通过http形式发布url: http://机器人IP地址:8000/stream.mjpg）

**参数**

- **resolution** (str) - 视频分辨率，默认视频分辨率为”640x480”，最大视频分辨率为”1920x1080”

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### close_vision_stream[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-close-vision-stream-font "永久链接至标题")

YanAPI.close_vision_stream()

> 关闭摄像头网络视频流

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### delete_vision_tag[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-delete-vision-tag-font "永久链接至标题")

YanAPI.delete_vision_tag(tag: str, mode:str = “all”)

> 删除指定样本标签

**参数**

- **tag** (str) - 标签名称
- **mode** (str) - 删除模式，取值：all-删除样本及标签 / tags-保留样本仅删除标签，默认值为all

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### get_vision_tags[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-vision-tags-font "永久链接至标题")

YanAPI.get_vision_tags()

> 获取样本标签列表

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:
        [
            {
                tags:string 标签名
                resources:list 样本名称列表
            }
        ]
    }
    msg:string 提示信息
}

### set_vision_tag[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-set-vision-tag-font "永久链接至标题")

YanAPI.set_vision_tag(resources: List[str], tag: str)

> 给已有样本数据打标签

**参数**

- **resolution** (list[str]) - 需要打标签的样本图片名称列表
- **tag** (str) - 标签名称

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### do_visions_visible[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-do-visions-visible-font "永久链接至标题")

YanAPI.do_visions_visible(operation:str, task:str)

> 开启或关闭视觉任务视频流

**参数**

- **operation** (str) - 操作类型：start-开启，stop-关闭
- **task** (str) - 视频流任务类型：face_recognition_remote-人脸识别/ face_attribute_remote-人脸分析/ color_detect_remote-颜色检测/ object_recognition_remote-物体识别/ gesture_recognition_remote-手势识别/ apriltag_recognition_remote-apriltag识别/

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:
        {
            url:str 视频流的URL地址
        }
    msg:string 提示信息
}

### show_visions_result[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-show-visions-result-font "永久链接至标题")

YanAPI.show_visions_result(operation:str)

> 显示视觉任务视频流

**参数**

- **task** (str) - 视频流任务类型：face_recognition_remote-人脸识别/ face_attribute_remote-人脸分析/ color_detect_remote-颜色检测/ object_recognition_remote-物体识别/ gesture_recognition_remote-手势识别/ apriltag_recognition_remote-apriltag识别/

**返回类型** stream(mjpeg)

**返回说明** 视频流弹窗

---

## 语音类[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id14 "永久链接至标题")

### Voice[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-voice-font "永久链接至标题")

YanAPI.Voice()

> 创建机器人语音控制类对象

**返回类型** object

### stop_voice_asr[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id15 "永久链接至标题")

stop_voice_asr()

> 停止语音听写

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    msg:string 提示信息
}

### get_voice_asr[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-voice-asr-font "永久链接至标题")

get_voice_asr()

> 获取语音听写结果

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    status: string  执行状态：idle-非执行状态 run-正在运行
    timestamp: integer 时间戳, Unix标准时间
    data:
        {
            语音听写返回数据
        }
    msg:string 提示信息
 }

### start_voice_asr[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id16 "永久链接至标题")

start_voice_asr(timestamp: int = 0)

> 开始语音听写（当前语音听写处于工作状态而需要开启新的语音听写时，需要先停止当前的语音听写。）

**参数**

- **timestamp** (integer) - 时间戳，Unix标准时间

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### sync_do_voice_asr[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id17 "永久链接至标题")

sync_do_voice_asr()

> 执行一次语音听写并获得返回结果

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    status: string  执行状态：idle-非执行状态 run-正在运行
    timestamp: integer 时间戳, Unix标准时间
    data:
        {
            语音听写返回数据
        }
    msg:string 提示信息
 }

### sync_do_voice_asr_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id18 "永久链接至标题")

sync_do_voice_asr_value()

> 执行一次语音听写并获得返回结果-简化返回值

**返回类型** str

**返回说明** 语音听写识别到的内容

### get_voice_asr_offline_syntax_grammars[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id19 "永久链接至标题")

get_voice_asr_offline_syntax_grammars()

> 获取所有离线语法名称

**返回类型** dict

**返回说明**

{
    grammar: [
                    {
                        name: string 离线语法名称（系统自带离线语法名称为"default"）
                    }
                ]
}

### delete_voice_asr_offline_syntax[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id20 "永久链接至标题")

delete_voice_asr_offline_syntax(grammar: str)

> 删除指定离线语法名称下的所有配置（可以先获取系统所有的离线语法名称，请注意：系统默认的离线语法名称为defaut, 不可以通过API来添加、删除或修改）

**参数**

- **grammar** (str) - 需要删除配置的语法名称

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    msg: string 提示信息
}

### get_voice_asr_offline_syntax[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id21 "永久链接至标题")

get_voice_asr_offline_syntax(grammar: str)

> 获取指定语法名称下的所有配置

**参数**

- **grammar** (str) - 需要获取配置结构的语法名称

**返回类型** dict

**返回说明**

{
    grammar:string 离线语法名称（系统自带离线语法名称为"default"）
    slot:
        [
            {
                name:string 离线语法意图
            }
        ]
    start:string     离线语法开启规则
    startinfo:string 离线语法开启规则意图
    rule:
        [
            {
                name: string 离线语法规则名称
                value:string 离线语法规则内容（即可用的离线语音指令词）
            }
        ]
}

### create_voice_asr_offline_syntax[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id22 "永久链接至标题")

create_voice_asr_offline_syntax(object: Dict)

> 创建一个新的离线语法名称配置（请注意：所有输入的操作符及关键词均为半角字符，不支持全角字符）

**参数**

- **object** (dict) - 按照语法规则填写的一个dict字典

{
    grammar:string 定义离线语法名称，请输入纯字母
    slot:
        [
            {
                name:string 定义离线语法意图，请输入纯字母
            }
        ]
    start:string     离线语法开启规则
    startinfo:string 离线语法开启规则意图（和slot-name保持对应统一）
    rule:
        [
            {
                name: string 定义离线语法规则名称（和slot-name保持对应统一）
                value:string 定义离线语法规则内容（即可用的离线语音指令词）
            }
        ]
}

**举例说明**

- 设置了意图为“want”的离线语音指令，具体指令内容为“我想|我要|我想要|请帮我”。
- 设置成功后，当对机器人说“我想”/“我要”/“我想要”/“请帮我”时，机器人能够理解到“want”意图。用户可通过其他API设置机器人理解到意图后的响应，例如让机器人执行特定动作、进行特定语音播报等。

{
    "grammar": "LocalCmd",
    "slot": [
                {
                    "name": "want"
                }
            ],
    "start": "LocalCmdStart",
    "startinfo": "<want>"
    "rule": [
                {
                    "name": "want",
                    "value": "我想|我要|我想要|请帮我"
                }
            ]
    }

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### update_voice_asr_offline_syntax[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id23 "永久链接至标题")

update_voice_asr_offline_syntax(object: Dict)

> 修改已有语法配置中的命令词和对应的返回值（请注意：所有输入的操作符及关键词均为半角字符，不支持全角字符。系统默认的离线语法名称为defaut，不可以通过API来添加、删除以及修改。

**参数**

- **object** (dict) - 按照语法规则填写的一个dict字典，其中的语法名称是需要修改内容的已有名称

{
    grammar:string 离线语法名称
    slot:
        [
            {
                name:string 离线语法意图
            }
        ]
    start:string     离线语法开启规则
    startinfo:string 离线语法开启规则意图
    rule:
        [
            {
                name: string 离线语法规则名称
                value:string 离线语法规则内容（即可用的离线语音指令词）
            }
        ]
}

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### stop_voice_nlp[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-voice-nlp-font "永久链接至标题")

stop_voice_nlp()

> 停止语义理解服务

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    msg:string 提示信息
}

### get_voice_nlp_state[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-voice-nlp-state-font "永久链接至标题")

get_voice_nlp_state()

> 获取语义理解工作状态

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    status:string 执行状态：idle-非执行状态 run-正在运行
    timestamp:integer 时间戳, Unix标准时间
    data:{}
    msg: string 提示信息
}

### start_voice_nlp[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-voice-nlp-font "永久链接至标题")

start_voice_nlp(continues=False, timestamp=0)

> 开始语义理解（当前语义理解处于工作状态而需要开启新的语义理解时，需要先停止当前的语义理解。）

**参数**

- **continues** (bool) - 是否进行连续语义识别，布尔值：True-需要 False-不需要，默认值为False
- **timestamp**(integer) - 时间戳, Unix标准时间

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### sync_do_voice_nlp[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-sync-do-voice-nlp-font "永久链接至标题")

sync_do_voice_nlp()

> 执行一次语义理解并获得返回结果

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    status:string 执行状态：idle-非执行状态 run-正在运行
    timestamp:integer 时间戳, Unix标准时间
    data:{}
    msg: string 提示信息
}

### sync_do_voice_nlp_value[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-sync-do-voice-nlp-value-font "永久链接至标题")

sync_do_voice_nlp_value()

> 执行一次语义理解并获得返回结果-简化返回值

**返回类型** dict

**返回说明**

{
    question:string 识别的内容
    answer:string 回答的内容
}

### stop_voice_tts[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id24 "永久链接至标题")

stop_voice_tts()

> 停止语音播报任务

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### get_voice_tts_state[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id25 "永久链接至标题")

get_voice_tts_state(timestamp: int = None)

> 获取指定任务或者当前工作状态（带时间戳为指定任务工作状态，如果无时间戳则表示当前工作状态）

**参数**

- **timestamp** (integer) - 时间戳，Unix标准时间

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    status: string 工作状态：idle-任务不存在 run-播放该段语音 build-正在合成该段语音 wait-处于等待执行状态
    timestamp: integer 时间戳, Unix标准时间
    data:{}
    msg:string 提示信息
}

### start_voice_tts[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id26 "永久链接至标题")

start_voice_tts(tts: str = ‘’, interrupt: bool = True, timestamp: int = 0)

> 开始语音合成任务，合成指定的语句并播放（当语音合成处于工作状态时可以接受新的语音合成任务）

**参数**

- **tts** (str) - 待合成的文字
- **interrupt** (bool) - 是否可以被打断，True-可以被打断，False-不可以被打断，默认为True
- **timestamp** (int) - 时间戳，Unix标准时间

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### sync_do_tts[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id27 "永久链接至标题")

sync_do_tts(tts: str = ‘’, interrupt: bool = True)

> 执行语音合成任务,合成完成后返回

**参数**

- **tts** (str) - 待合成的文字
- **interrupt** (bool) - 是否可以被打断，True-可以被打断，False-不可以被打断，默认为True

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    status: string 工作状态：idle-任务不存在 run-播放该段语音 build-正在合成该段语音 wait-处于等待执行状态
    timestamp: integer 时间戳, Unix标准时间
    data:{}
    msg:string 提示信息
}

---

## 控制uKit2.0[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#ukit2-0 "永久链接至标题")

### ukit_controller[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-ukit-controller-font "永久链接至标题")

YanAPI.ukit_controller()

> 创建uKit控制类对象

**返回类型** object

### creat_channel_to_ukit[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-creat-channel-to-ukit-font "永久链接至标题")

creat_channel_to_ukit(port=0)

> 设置Yanshee UDP广播通道的uKit端口号

**参数**

- **port** (int) - 设置uKit2.0的广播监听端口号，取值：0-100，默认为0，对应于uKit监听端口号25880-25979

### set_broadcast_ip[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-set-broadcast-ip-font "永久链接至标题")

set_broadcast_ip(ip)

> 设置Yanshee UDP广播地址

**参数**

- **ip** (str) - 机器人广播地址

### set_recv_ip[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-set-recv-ip-font "永久链接至标题")

set_recv_ip(ip)

> 设置Yanshee UDP广播接收地址

**参数**

- **ip** (str) - 机器人广播接收地址

### send_msg_to_ukit[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-send-msg-to-ukit-font "永久链接至标题")

send_msg_to_ukit(msg)

> 发送UDP广播消息给uKit2.0

**参数**

- **msg** (str) - 发送给uKit2.0的广播消息内容

### get_msg_from_ukit[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-msg-from-ukit-font "永久链接至标题")

get_msg_from_ukit()

> 接收UDP广播消息

**返回类型** str

**返回说明** 接收到的广播消息内容

### close_channel_to_ukit[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-close-channel-to-ukit-font "永久链接至标题")

close_channel_to_ukit()

> 关闭Yanshee UDP广播通道

---

## uKit手柄[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#ukit "永久链接至标题")

### get_gamepad_keymap[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-get-gamepad-keymap-font "永久链接至标题")

YanAPI.get_gamepad_keymap()

> 获取蓝牙手柄按键和动作文件映射关系

**返回类型** dict

**返回说明**

{
    code: integer 返回码：0表示正常
    data: [
            {
                htsName: string 动作文件名
                keyName: string 手柄按键名 
                longPress: bool 布尔值：True-开启长按 False-关闭长按
            }
        ]
    msg: string 提示信息
}

### set_gamepad_keymap[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-set-gamepad-keymap-font "永久链接至标题")

YanAPI.set_gamepad_keymap(key_name: GamepadKey, hts_name: str, long_press: bool = False)

> 设置单个按键的动作

**参数**

- **key_name** (GamepadKey) - 手柄按键名
- **hts_name** (str) - 动作文件名
- **long_press** (bool)- 是否需要长按，布尔值：True-开启长按 False-关闭长按

  # 蓝牙手柄按键名 GamepadKey的定义
  class GamepadKey(Enum):
      L1 = "key_L1"
      L2 = "key_L2"
      L3 = "key_L3"
      R1 = "key_R1"
      R2 = "key_R2"
      R3 = "key_R3"
      A = "key_A"
      B = "key_B"
      X = "key_X"
      Y = "key_Y"
      DPAD_LEFT = "key_DPAD_LEFT"
      DPAD_RIGHT = "key_DPAD_RIGHT"
      DPAD_UP = "key_DPAD_UP"
      DPAD_DOWN = "key_DPAD_DOWN"
      DPAD_UP_LEFT = "key_DPAD_UP_LEFT"
      DPAD_DOWN_LEFT = "key_DPAD_DOWN_LEFT"
      DPAD_UP_RIGHT = "key_DPAD_UP_RIGHT"
      DPAD_DOWN_RIGHT = "key_DPAD_DOWN_RIGHT"
      BT = "key_BT"
      START = "key_START"
      POWER = "key_POWER"
      RESERVE = "key_RESERVE"
      L_STICK = "key_L_STICK"
      R_STICK = "key_R_STICK"

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### set_gamepad_keymaps[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-set-gamepad-keymaps-font "永久链接至标题")

YanAPI.set_gamepad_keymaps(keymaps: List[GamepadKeymap])

> 设置多个按键的动作

**参数**

- **keymaps** (List[GamepadKeymap]) - 按键映射对象列表

  # 手柄按键和动作文件映射 GamepadKeymap的定义
  class GamepadKeymap():
      def __init__(self, keyName: GamepadKey=None, htsName=None, longPress=False):
          self.keyName = keyName.value 手柄按键名
          self.htsName = htsName 动作文件名
          self.longPress = longPress 是否长按

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### reset_gamepad_keymap[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-reset-gamepad-keymap-font "永久链接至标题")

YanAPI.reset_gamepad_keymap(key_name: GamepadKey)

> 重置单个按键到默认配置

**参数**

- **key_name** (GamepadKey) - 手柄按键名（请参考 set_gamepad_keymap 函数参数说明）

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### reset_gamepad_keymaps[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-reset-gamepad-keymaps-font "永久链接至标题")

YanAPI.reset_gamepad_keymaps(key_name_list: List[GamepadKey] = None, reset_all: bool = False)

> 重置多个按键或者全部按键到默认配置

**参数**

- **key_name_list** (GamepadKey) - 按键名集合
- **reset_all** (bool) - 是否重置全部按键，布尔值：True-全部重置 False-不全部重置，默认值为False

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

---

## 订阅内容[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#id28 "永久链接至标题")

### stop_subscribe_motion[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-subscribe-motion-font "永久链接至标题")

YanAPI.stop_subscribe_motion(url: str)

> 停止运动控制状态信息订阅

**参数**

- **url** (str) - 需要停止订阅的接收地址

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### start_subscribe_motion[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-subscribe-motion-font "永久链接至标题")

YanAPI.start_subscribe_motion(url: str, timeout: int = 10)

> 订阅运动控制状态信息

**参数**

- **url** (str) - 订阅的接收地址
- **timeout** (int) - 订阅超时的时间(单位：秒s)，默认值为10，取值范围：1~60

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### stop_subscribe_motion_gait[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-subscribe-motion-gait-font "永久链接至标题")

YanAPI.stop_subscribe_motion_gait(url: str)

> 停止步态运动控制状态信息订阅

**参数**

- **url** (str) - 需要停止订阅的接收地址

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### start_subscribe_motion_gait[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-subscribe-motion-gait-font "永久链接至标题")

YanAPI.start_subscribe_motion_gait(url: str, timeout: int = 10)

> 订阅步态运动控制状态信息

**参数**

- **url** (str) - 订阅的接收地址
- **timeout** (int) - 订阅超时的时间(单位：秒s)，默认值为10，取值范围：1~60

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### stop_subscribe_sensor[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-subscribe-sensor-font "永久链接至标题")

YanAPI.stop_subscribe_sensor(url, type, id=0, slot=0)

> 停止传感器订阅服务

**参数**

- **url** (str) - 需要停止订阅的接收地址
- **type** (str) - 传感器名称：gyro-陀螺仪/infrared-红外/ultrasonic-超声波/environment-环境/touch-触摸/pressure-压力
- **id** (int) - 传感器ID值，取值：1~127
- **slot** (int) - 传感器槽位号，取值：1~6

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### start_subscribe_sensor[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-subscribe-sensor-font "永久链接至标题")

YanAPI.start_subscribe_sensor(url: str, type: str, id=0, slot=0, timeval=100, timeout=10)

> 订阅传感器消息

**参数**

- **url** (str) - 订阅的接收地址
- **type** (str) - 传感器名称：gyro-陀螺仪/infrared-红外/ultrasonic-超声波/environment-环境/touch-触摸/pressure-压力
- **id** (int) - 传感器ID值，取值：1~127
- **slot** (int) - 传感器槽位号，取值：1~6
- **timaval** (int) - 数据上报最短时间间隔（单位：毫秒ms），取值范围：100~5000
- **timeout** (int) - 订阅超时的时间(单位：秒s)，默认值为10，取值范围：1~60

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### stop_subscribe_vision[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-subscribe-vision-font "永久链接至标题")

YanAPI.stop_subscribe_vision(url: str, type: str)

> 停止指定视觉任务订阅

**参数**

- **url** (str) - 需要停止订阅的接收地址
- **type** (str) - 视觉任务类型：face_recognition/ object_recognition/ gender/ age/ age_group/ face_quantity/ expression/ color_detect

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### start_subscribe_vision[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-subscribe-vision-font "永久链接至标题")

YanAPI.start_subscribe_vision(url: str, type: str, timeout: int = 10)

> 订阅指定视觉任务消息

**参数**

- **url** (str) - 订阅的接收地址
- **type** (str) - 视觉任务名称：face_recognition/ object_recognition/ gender/ age/ age_group/ face_quantity/ expression/ color_detect
- **timeout** (int) - 订阅超时的时间(单位：秒s)，默认值为10，取值范围：1~60

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### stop_subscribe_voice_asr[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-subscribe-voice-asr-font "永久链接至标题")

YanAPI.stop_subscribe_voice_asr(url: str)

> 停止订阅语义理解消息

**参数**

- **url** (str) - 需要停止订阅的接收地址

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### start_subscribe_voice_asr[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-subscribe-voice-asr-font "永久链接至标题")

YanAPI.start_subscribe_voice_asr(url: str, timeout: int = 10)

> 订阅语义理解消息

**参数**

- **url** (str) - 订阅的接收地址
- **timeout** (int) - 订阅超时的时间(单位：秒s)，默认值为10，取值范围：1~60

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### stop_subscribe_voice_iat[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-subscribe-voice-iat-font "永久链接至标题")

YanAPI.stop_subscribe_voice_iat(url: str)

> 停止订阅语音听写消息

**参数**

- **url** (str) - 需要停止订阅的接收地址

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### start_subscribe_voice_iat[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-subscribe-voice-iat-font "永久链接至标题")

YanAPI.start_subscribe_voice_iat(url: str, timeout=10)

> 订阅语音听写消息

**参数**

- **url** (str) - 订阅的接收地址
- **timeout** (int) - 订阅超时的时间(单位：秒s)，默认值为10，取值范围：1~60

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### stop_subscribe_voice_tts[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-stop-subscribe-voice-tts-font "永久链接至标题")

YanAPI.stop_subscribe_voice_tts(url: str)

> 停止订阅语音播报消息

**参数**

- **url** (str) - 需要停止订阅的接收地址

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}

### start_subscribe_voice_tts[](https://ubtrobot-new.oss-cn-shenzhen.aliyuncs.com/static/MINI/Yanshee/yanapi/html-zh/YanAPI.html#font-color-6495ed-start-subscribe-voice-tts-font "永久链接至标题")

YanAPI.start_subscribe_voice_tts(url: str, timeout: int = 10)

> 订阅语音播报消息

**参数**

- **url** (str) - 订阅的接收地址
- **timeout** (int) - 订阅超时的时间(单位：秒s)，默认值为10，取值范围：1~60

**返回类型** dict

**返回说明**

{
    code:integer 返回码：0表示正常
    data:{}
    msg:string 提示信息
}