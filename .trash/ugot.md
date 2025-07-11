# [**初始化SDK**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/init?id=%e5%88%9d%e5%a7%8b%e5%8c%96sdk)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/init?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8)

- def [scan_device():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/init?id=init1)
- def [initialize(device_ip):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/init?id=init2)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/init?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e)

#### [**scan_device()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/init?id=scan_devicea-idinit1)

搜索扫描设备

搜索获取同一局域网内的UGOT设备并打印.

- **参数**
    
    - **无** –

- **返回**
    
    格式：{“设备名称1”:”IP地址1”,”设备名称2”:”IP地址2”,…}
    

- **返回类型**
    
    name_list (dict)
    

#### [**initialize(device_ip)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/init?id=initializedevice_ipa-idinit2)

初始化设备

通过IP地址初始化相关设备.

- **参数**
    
    - **device_ip** (_str_) – 设备的IP地址字符串

- **返回**
    
    无
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/init?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81)

```
from ugot import ugot

got = ugot.UGOT()

# 扫描设备
print(got.scan_device())

# 初始化
got.initialize('0.0.0.0')
```
# [**运动**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e8%bf%90%e5%8a%a8)

运动概述——

## [**通用运控接口**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e9%80%9a%e7%94%a8%e8%bf%90%e6%8e%a7%e6%8e%a5%e5%8f%a3)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8)

- def [stop_chassis():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=motion_commom1)
- def [perform_action(actionId):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=motion_commom2)
- def [model_common_move(speed, turn_speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=motion_commom3)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e)

#### [**stop_chassis()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=stop_chassisa-idmotion_commom1)

停止底盘运动（可以停止除了平衡车与轮足车的底盘运动）

- **参数**
    
    **无** –
    

- **返回**
    无

#### [**perform_action(actionId)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=perform_actionactionida-idmotion_commom2)

执行通用动作

参数名称: Action name, options available (WakeUp, Smile, Doubt, Resist, Love, Anger, Proud, Ticklish, Sleep)

type actionId: str

- **返回**
    
    无
    

#### [**model_common_move(speed, turn_speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=model_common_movespeed-turn_speeda-idmotion_commom3)

UGOT通用形态移动接口

- **参数**
    
    - **speed** (_int_) – 线速度: 速度为正则向前移动, 速度为负则向后移动
        
    - **turn_speed** (_int_) –角速度:速度为正则向左转弯, 速度为负则向右转弯
        

- **返回**
    
    无
    

## [**变形车**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e5%8f%98%e5%bd%a2%e8%bd%a6)

### [**变形车概述**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e5%8f%98%e5%bd%a2%e8%bd%a6%e6%a6%82%e8%bf%b0)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-1)

- def [transform_set_chassis_height(height: int):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform1)
- def [transform_move_speed(direction, speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform2)
- def [transform_turn_speed(turn: int, speed: int):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform3)
- def [transform_move_speed_times(direction, speed, times, unit):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform4)
- def [transform_turn_speed_times(turn, speed, times, unit):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform5)
- def [transform_move_turn(direction, speed, turn, turn_speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform6)
- def [transform_motor_control(lf, rf, lb, rb):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform7)
- def [transform_stop:](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform8)
- def [transform_arm_control(joint, position, time):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform9)
- def [transform_adaption_control(option):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform10)
- def [transform_restory():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform11)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-1)

#### [**transform_set_chassis_height(height: int)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform_set_chassis_heightheight-inta-idtransform1)

设置变形车底盘高度

- **参数**
    
    - **height** (_int_) – [2-7] 单位厘米

- **返回**
    
    无
    

#### [**transform_move_speed(direction, speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform_move_speeddirection-speeda-idtransform2)

变形工程车前进/后退运动

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-80] 速度，单位 厘米/秒
        

- **返回**
    
    无
    

#### [**transform_turn_speed(turn: int, speed: int)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform_turn_speedturn-int-speed-inta-idtransform3)

变形工程车左转/右转运动

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [5-280] 速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**transform_move_speed_times(direction, speed, times, unit)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform_move_speed_timesdirection-speed-times-unita-idtransform4)

控制变形车前后运动x秒/cm后停止

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-80] 速度，单位 厘米/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；1：表示按厘米运动）
        

- **返回**
    
    无
    

#### [**transform_turn_speed_times(turn, speed, times, unit)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform_turn_speed_timesturn-speed-times-unita-idtransform5)

控制变形车左右运动x秒/度后停止

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [5-280] 速度，单位 度/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；2：表示按度运动）
        

- **返回**
    
    无
    

#### [**transform_move_turn(direction, speed, turn, turn_speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform_move_turndirection-speed-turn-turn_speeda-idtransform6)

控制变形车向指定方向运动同时做旋转运动

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-80] 前进/后退速度，单位 厘米/秒
        
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **turn_speed** (_int_) – [5-280] 旋转速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**transform_motor_control(lf, rf, lb, rb)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform_motor_controllf-rf-lb-rba-idtransform7)

控制变形车四个电机转动

- **参数**
    
    - **lf** (_int_) – 左前轮速度，[-360, 360] 单位 转/分
        
    - **rf** (_int_) – 右前轮速度，[-360, 360] 单位 转/分
        
    - **lb** (_int_) – 左后轮速度，[-360, 360] 单位 转/分
        
    - **rb** (_int_) – 右后轮速度，[-360, 360] 单位 转/分
        

- **返回**
    
    无
    

#### [**transform_stop()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform_stopa-idtransform8)

变形车停止运动

- **返回**
    
    无
    

#### [**transform_arm_control(joint, position, time)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform_arm_controljoint-position-timea-idtransform9)

设置变形车四个臂角度

- **参数**
    
    - **joint** (_int_) – 臂(1:左前臂；2:左后臂；3:右后臂；4:右前臂)
        
    - **position** (_int_) – 角度，单位 度
        
    - **time** (_int_) – 时长，单位 ms
        

- **返回**
    
    无
    

#### [**transform_adaption_control(option)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform_adaption_controloptiona-idtransform10)

开启/关闭自适应，变形车可以根据不同地形调整姿态

- **参数**
    
    - **option** (_bool_) – 开关状态 True表示开，False表示关

- **返回**
    
    无
    

#### [**transform_restory()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=transform_restorya-idtransform11)

让变形车复位

- **返回**
    
    无
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81)

```
from ugot import ugot
import time

got = ugot.UGOT()
# 初始化设备
got.initialize('192.168.8.106')

# 关闭自适应
got.transform_adaption_control(False)

# 调节高度
got.transform_set_chassis_height(5)
time.sleep(1.5)

# 前进/后退
got.transform_move_speed(0, 10)
time.sleep(2)

# 左转/右转
got.transform_turn_speed(2, 40)
time.sleep(2)

# 按里程前进/后退
got.transform_move_speed_times(0, 20, 40, 1)

# 按里程左转/右转
got.transform_turn_speed_times(2, 40, 200, 2)

# 运动同时转弯
got.transform_move_turn(0, 20, 2, 40)
time.sleep(2)

# 停止运动
got.transform_stop()
time.sleep(1)

# 四个电机运动
got.transform_motor_control(15, 15, 15, 15)
time.sleep(2)

# 停止运动
got.transform_stop()
```

## [**麦轮车**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e9%ba%a6%e8%bd%ae%e8%bd%a6)

### [**麦轮车概述**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e9%ba%a6%e8%bd%ae%e8%bd%a6%e6%a6%82%e8%bf%b0)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-2)

- def [mecanum_translate_speed(angle, speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum1)
- def [mecanum_translate_speed_times(angle, speed, times, unit):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum2)
- def [mecanum_move_xyz(x_speed, y_speed, z_speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum3)
- def [mecanum_move_speed(direction, speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum4)
- def [mecanum_turn_speed(turn, speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum5)
- def [mecanum_move_speed_times(direction, speed, times, unit):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum6)
- def [mecanum_turn_speed_times(turn, speed, times, unit):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum7)
- def [mecanum_move_turn(angle, speed, turn, turn_speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum8)
- def [mecanum_motor_control(lf, rf, lb, rb):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum9)
- def [mecanum_stop():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum10)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-2)

#### [**mecanum_translate_speed(angle, speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum_translate_speedangle-speeda-idmecanum1)

麦轮车向指定方向做平移运动

- **参数**
    
    - **angle** (_int_) – [-180, 180] 角度 单位:度(以XY为平面，Y轴为0度方向，左[0, -180] 右[0, 180])
        
    - **speed** (_int_) – [5-80] 前进/后退速度，单位 厘米/秒
        

- **返回**
    
    无
    

#### [**mecanum_translate_speed_times(angle, speed, times, unit)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum_translate_speed_timesangle-speed-times-unita-idmecanum2)

麦轮车向指定方向做平移运动x秒/cm后停止

- **参数**
    
    - **angle** (_int_) – [-180, 180] 角度 单位:度(以XY为平面，Y轴为0度方向，左[0, -180] 右[0, 180])
        
    - **speed** (_int_) – [5-80] 速度，单位 度/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；1：表示按厘米运动）
        

- **返回**
    
    无
    

#### [**mecanum_move_xyz(x_speed, y_speed, z_speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum_move_xyzx_speed-y_speed-z_speeda-idmecanum3)

控制麦轮车以指定速度沿指定方向持续运动

- **参数**
    
    - **x_speed** (_int_) – x轴方向速度 [-80, 80]
        
    - **y_speed** (_int_) – y轴方向速度 [-80, 80]
        
    - **z_speed** (_int_) – z轴方向速度 [-280, 280]
        

- **返回**
    
    无
    

#### [**mecanum_move_speed(direction, speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum_move_speeddirection-speeda-idmecanum4)

麦轮车前进/后退运动

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-80] 速度，单位 厘米/秒
        

- **返回**
    
    无
    

#### [**mecanum_turn_speed(turn, speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum_turn_speedturn-speeda-idmecanum5)

麦轮车左转/右转运动

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [5-280] 速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**mecanum_move_speed_times(direction, speed, times, unit)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum_move_speed_timesdirection-speed-times-unita-idmecanum6)

控制麦轮车前后运动x秒/cm后停止

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-80] 速度，单位 厘米/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；1：表示按厘米运动）
        

- **返回**
    
    无
    

#### [**mecanum_turn_speed_times(turn, speed, times, unit)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum_turn_speed_timesturn-speed-times-unita-idmecanum7)

控制麦轮车左右运动x秒/度后停止

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [5-280] 速度，单位 度/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；2：表示按度运动）
        

- **返回**
    
    无
    

#### [**mecanum_move_turn(angle, speed, turn, turn_speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum_move_turnangle-speed-turn-turn_speeda-idmecanum8)

控制麦轮车向指定方向运动同时做旋转运动

- **参数**
    
    - **angle** (_int_) – [-180, 180] 角度 单位:度(以XY为平面，Y轴为0度方向，左[0, -180] 右[0, 180])
        
    - **speed** (_int_) – [5-80] 前进/后退速度，单位 厘米/秒
        
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **turn_speed** (_int_) – [5-280] 旋转速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**mecanum_motor_control(lf, rf, lb, rb)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum_motor_controllf-rf-lb-rba-idmecanum9)

控制麦轮车四个电机转动

- **参数**
    
    - **lf** (_int_) – 左前轮速度，[-360, 360] 单位 转/分
        
    - **rf** (_int_) – 右前轮速度，[-360, 360] 单位 转/分
        
    - **lb** (_int_) – 左后轮速度，[-360, 360] 单位 转/分
        
    - **rb** (_int_) – 右后轮速度，[-360, 360] 单位 转/分
        

- **返回**
    
    无
    

#### [**mecanum_stop()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mecanum_stopa-idmecanum10)

麦轮车停止运动

- **返回**
    
    无
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-1)

```
from ugot import ugot
import time

got = ugot.UGOT()
# 初始化设备
got.initialize('192.168.8.112')

# 平移
got.mecanum_translate_speed(-45, 10)
time.sleep(2)

# 按里程平移
got.mecanum_translate_speed_times(45, 10, 2, 0)

# 前进/后退
got.mecanum_move_speed(0, 10)
time.sleep(2)

# 左转/右转
got.mecanum_turn_speed(2, 40)
time.sleep(2)

# 按里程前进/后退
got.mecanum_move_speed_times(0, 20, 40, 1)

# 按里程左转/右转
got.mecanum_turn_speed_times(2, 40, 200, 2)

# 运动同时转弯
got.mecanum_move_turn(45, 20, 2, 40)
time.sleep(2)

# x/y/z运动
got.mecanum_move_xyz(0, 11, 30)
time.sleep(2)

# 停止运动
got.mecanum_stop()
time.sleep(1)

# 四个电机运动
got.mecanum_motor_control(15, 15, 15, 15)
time.sleep(2)

# 停止运动
got.mecanum_stop()
```

## [**平衡车**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e5%b9%b3%e8%a1%a1%e8%bd%a6)

### [**平衡车概述**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e5%b9%b3%e8%a1%a1%e8%bd%a6%e6%a6%82%e8%bf%b0)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-3)

- def [balance_start_balancing():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=balance1)
- def [balance_stop_balancing():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=balance2)
- def [balance_set_acceleration(acceleration):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=balance3)
- def [balance_reset_acceleration():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=balance4)
- def [balance_move_speed(direction, speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=balance5)
- def [balance_turn_speed(turn, speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=balance6)
- def [balance_move_speed_times(direction, speed, times, unit):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=balance7)
- def [balance_turn_speed_times(turn, speed, times, unit):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=balance8)
- def [balance_move_turn(direction, speed, turn, turn_speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=balance9)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-3)

#### [**balance_start_balancing()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=balance_start_balancinga-idbalance1)

启动小车并保持自平衡

- **返回**
    
    无
    

#### [**balance_stop_balancing()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=balance_stop_balancinga-idbalance2)

停止小车并保持自平衡

- **返回**
    
    无
    

#### [**balance_set_acceleration(acceleration)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=balance_set_accelerationaccelerationa-idbalance3)

设置平衡车加速度

- **参数**
    
    - **acceleration** (_float_) – 加速度

- **返回**
    
    无
    

#### [**balance_reset_acceleration()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=balance_reset_accelerationa-idbalance4)

重置平衡车加速度

- **返回**
    
    无
    

#### [**balance_move_speed(direction, speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=balance_move_speeddirection-speeda-idbalance5)

平衡车前进/后退运动

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-80] 速度，单位 厘米/秒
        

- **返回**
    
    无
    

#### [**balance_turn_speed(turn, speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=balance_turn_speedturn-speeda-idbalance6)

平衡车左转/右转运动

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [5-360] 速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**balance_move_speed_times(direction, speed, times, unit)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=balance_move_speed_timesdirection-speed-times-unita-idbalance7)

控制平衡车前后运动x秒/cm后停止

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-80] 速度，单位 厘米/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；1：表示按厘米运动）
        

- **返回**
    
    无
    

#### [**balance_turn_speed_times(turn, speed, times, unit)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=balance_turn_speed_timesturn-speed-times-unita-idbalance8)

控制平衡车左右运动x秒/度后停止

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [5-360] 速度，单位 度/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；2：表示按度运动）
        

- **返回**
    
    无
    

#### [**balance_move_turn(direction, speed, turn, turn_speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=balance_move_turndirection-speed-turn-turn_speeda-idbalance9)

控制平衡车指定方向运动同时做旋转

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-80] 前进/后退速度，单位 厘米/秒
        
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **turn_speed** (_int_) – [5-360] 旋转速度，单位 度/秒
        

- **返回**
    
    无
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-2)

```
from ugot import ugot
import time

got = ugot.UGOT()
# 初始化设备
got.initialize('192.168.8.112')

# 启动小车并保持平衡
got.balance_start_balancing()
time.sleep(1)

# 设置加速度
got.balance_set_acceleration(0.6)
time.sleep(0.5)

# 前进/后退
got.balance_move_speed(0, 10)
time.sleep(2)

# 左转/右转
got.balance_turn_speed(2, 40)
time.sleep(2)

# 按里程前进/后退
got.balance_move_speed_times(0, 20, 40, 1)

# 按里程左转/右转
got.balance_turn_speed_times(2, 40, 200, 2)

# 运动同时转弯
got.balance_move_turn(0, 20, 2, 40)
time.sleep(2)

# 停止运动并保持自平衡
got.balance_stop_balancing()

# 重置加速度
got.balance_reset_acceleration()
```

## [**机械臂**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e6%9c%ba%e6%a2%b0%e8%87%82)

### [**机械臂概述**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e6%9c%ba%e6%a2%b0%e8%87%82%e6%a6%82%e8%bf%b0)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-4)

- def [mechanical_clamp_release():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=arm1)
- def [mechanical_clamp_close():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=arm2)
- def [mechanical_get_clamp_status():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=arm3)
- def [mechanical_arms_restory():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=arm4)
- def [mechanical_joint_control(angle1, angle2, angle3, duration):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=arm5)
- def [mechanical_single_joint_control(joint, angle, duration):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=arm6)
- def [mechanical_move_axis(r, h, theta, duration):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=arm7)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-4)

#### [**mechanical_clamp_release()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mechanical_clamp_releasea-idarm1)

打开夹手

- **返回**
    
    无
    

#### [**mechanical_clamp_close()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mechanical_clamp_closea-idarm2)

闭合夹手

- **返回**
    
    无
    

#### [**mechanical_get_clamp_status()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mechanical_get_clamp_statusa-idarm3)

获取夹手状态

- **返回**
    
    0 打开，1，闭合
    

- **返回类型**
    
    状态 (int)
    

#### [**mechanical_arms_restory()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mechanical_arms_restorya-idarm4)

机械臂复位

- **返回**
    
    无
    

#### [**mechanical_joint_control(angle1, angle2, angle3, duration)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mechanical_joint_controlangle1-angle2-angle3-durationa-idarm5)

机械臂关节角度控制

- **参数**
    
    - **angle1** (_int_) – 关节1角度 [-90, 90] 单位：度
        
    - **angle2** (_int_) – 关节2角度 [-80, 110] 单位：度
        
    - **angle3** (_int_) – 关节3角度 [-90, 90] 单位：度
        
    - **duration** (_int_) – 运行时长 [20, 5000] 单位：毫秒
        

- **返回**
    
    无
    

#### [**mechanical_single_joint_control(joint, angle, duration)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mechanical_single_joint_controljoint-angle-durationa-idarm6)

机械臂单个关节角度控制

- **参数**
    
    - **joint** (_int_) – 关节序号(1: 关节1, 2: 关节2, 3: 关节3)
        
    - **angle** (_int_) – 关节角度(关节1：[-90, 90], 关节2：[-80, 110], 关节3：[-90, 90], )
        
    - **duration** (_int_) – 运行时长 [20, 5000] 单位：毫秒
        

- **返回**
    
    无
    

#### [**mechanical_move_axis(r, h, theta, duration)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=mechanical_move_axisr-h-theta-durationa-idarm7)

以小车为坐标系，逆解算机械臂，移动到位置r,h,theta

- **参数**
    
    - **r** (_float/int_) – r [-5.5, 24.9] 单位cm
        
    - **h** (_float/int_) – h [-18, 18.2] 单位cm
        
    - **theta** (_float/int_) – theta [-1.57, 1.57]
        
    - **duration** (_int_) – 运行时长 [20, 5000] 单位：毫秒
        

- **返回**
    
    无
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-3)

```
from ugot import ugot
import time

got = ugot.UGOT()
# 初始化设备
got.initialize('192.168.8.112')

# 打开夹手
got.mechanical_clamp_release()
print('-----1:',got.mechanical_get_clamp_status())
time.sleep(1)

# 闭合夹手
got.mechanical_clamp_close()
print('-----2:',got.mechanical_get_clamp_status())
time.sleep(1)

# 机械臂复位
got.mechanical_arms_restory()

# 关节角度控制
got.mechanical_joint_control(0, 0, 0, 500)

# 移动位置
got.mechanical_move_axis(20, 12, 0, 1000)
```

## [**轮足车**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e8%bd%ae%e8%b6%b3%e8%bd%a6)

### [**轮足车概述**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e8%bd%ae%e8%b6%b3%e8%bd%a6%e6%a6%82%e8%bf%b0)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-5)

- def [wheelleg_start_balancing():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg1)
- def [wheelleg_stop_balancing():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg2)
- def [wheelleg_move_speed(direction, speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg3)
- def [wheelleg_turn_speed(turn, speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg4)
- def [wheelleg_move_speed_times(direction, speed, times, unit):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg5)
- def [wheelleg_turn_speed_times(turn, speed, times, unit):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg6)
- def [wheelleg_move_turn(direction, speed, turn, turn_speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg7)
- def [wheelleg_set_chassis_height(height):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg8)
- def [wheelleg_restory():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg9)
- def [wheelleg_set_decline_angle(angle):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg10)
- def [wheelleg_adaption_control(option):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg11)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-5)

#### [**wheelleg_start_balancing()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg_start_balancinga-idwheelleg1)

启动小车并保持自平衡

- **返回**
    
    无
    

#### [**wheelleg_stop_balancing()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg_stop_balancinga-idwheelleg2)

停止小车并保持自平衡

- **返回**
    
    无
    

#### [**wheelleg_move_speed(direction, speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg_move_speeddirection-speeda-idwheelleg3)

轮足机器人前进/后退运动

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-60] 速度，单位 厘米/秒
        

- **返回**
    
    无
    

#### [**wheelleg_turn_speed(turn, speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg_turn_speedturn-speeda-idwheelleg4)

轮足机器人左转/右转运动

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [5-180] 速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**wheelleg_move_speed_times(direction, speed, times, unit)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg_move_speed_timesdirection-speed-times-unita-idwheelleg5)

控制轮足机器人前后运动x秒/cm后停止

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-60] 速度，单位 厘米/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；1：表示按厘米运动）
        

- **返回**
    
    无
    

#### [**wheelleg_turn_speed_times(turn, speed, times, unit)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg_turn_speed_timesturn-speed-times-unita-idwheelleg6)

控制轮足机器人左右运动x秒/度后停止

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [5-180] 速度，单位 度/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；2：表示按度运动）
        

- **返回**
    
    无
    

#### [**wheelleg_move_turn(direction, speed, turn, turn_speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg_move_turndirection-speed-turn-turn_speeda-idwheelleg7)

控制轮足机器人指定方向运动同时做旋转

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-60] 前进/后退速度，单位 厘米/秒
        
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **turn_speed** (_int_) – [5-180] 旋转速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**wheelleg_set_chassis_height(height)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg_set_chassis_heightheighta-idwheelleg8)

设置轮足机器人底盘高度

- **参数**
    
    - **height** (_int_) – 高度（1：高；2：中；3：低）

- **返回**
    
    无
    

#### [**wheelleg_restory()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg_restorya-idwheelleg9)

轮足机器人恢复到初始姿态，中高度

- **返回**
    
    无
    

#### [**wheelleg_set_decline_angle(angle)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg_set_decline_angleanglea-idwheelleg10)

设置轮足机器人左右两边倾斜的角度

- **参数**
    
    - **angle** – (int): [-10, 10] 倾斜角度，单位 度

- **返回**
    
    无
    

#### [**wheelleg_adaption_control(option)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=wheelleg_adaption_controloptiona-idwheelleg11)

启用/关闭自适应功能；轮足机器人可根据不同地形调整姿态

- **参数**
    
    **选项** (_bool_) – Switch status, True for on, False for off
    

- **返回**
    
    无
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-4)

```
from ugot import ugot
import time

got = ugot.UGOT()
# 初始化设备
got.initialize('192.168.8.112')

# 启动小车并保持平衡
got.wheelleg_start_balancing()
time.sleep(1)

# 设置高度
got.wheelleg_set_chassis_height(2)

# 前进/后退
got.wheelleg_move_speed(0, 10)
time.sleep(2)

# 左转/右转
got.wheelleg_turn_speed(2, 40)
time.sleep(2)

# 按里程前进/后退
got.wheelleg_move_speed_times(0, 20, 40, 1)

# 按里程左转/右转
got.wheelleg_turn_speed_times(2, 40, 200, 2)

# 运动同时转弯
got.wheelleg_move_turn(0, 20, 2, 40)
time.sleep(2)

# 停止运动并保持自平衡
got.wheelleg_stop_balancing()

# 设置倾斜
got.wheelleg_set_decline_angle(5)
time.sleep(2)

# 复位
got.wheelleg_restory()
```

## [**四足蜘蛛**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e5%9b%9b%e8%b6%b3%e8%9c%98%e8%9b%9b)

### [**四足蜘蛛概述**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e5%9b%9b%e8%b6%b3%e8%9c%98%e8%9b%9b%e6%a6%82%e8%bf%b0)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-6)

- def [spider_restory():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=spider1)
- def [spider_move_speed(direction, speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=spider2)
- def [spider_turn_speed(turn, speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=spider3)
- def [spider_move_speed_times(direction, speed, times, unit):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=spider4)
- def [spider_turn_speed_times(turn, speed, times, unit):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=spider5)
- def [spider_move_turn(direction, speed, turn, turn_speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=spider6)
- def [spider_stop():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=spider7)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-6)

#### [**spider_restory()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=spider_restorya-idspider1)

蜘蛛复位

- **返回**
    
    无
    

#### [**spider_move_speed(direction, speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=spider_move_speeddirection-speeda-idspider2)

控制蜘蛛直线前进/后退/左平移/右平移 :param direction: 方向（0：前进；1：后退；2：左平移；3：右平移） :type direction: int :param speed: [0-25] 速度，单位 厘米/秒 :type speed: int

- **返回**
    
    无
    

#### [**spider_turn_speed(turn, speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=spider_turn_speedturn-speeda-idspider3)

控制蜘蛛原地旋转

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [0-60] 速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**spider_move_speed_times(direction, speed, times, unit)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=spider_move_speed_timesdirection-speed-times-unita-idspider4)

控制蜘蛛直线运动x秒/cm后停止

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退；2：左平移；3：右平移）
        
    - **speed** (_int_) – [0-25] 速度，单位 厘米/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；1：表示按厘米运动）
        

- **返回**
    
    无
    

#### [**spider_turn_speed_times(turn, speed, times, unit)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=spider_turn_speed_timesturn-speed-times-unita-idspider5)

控制蜘蛛旋转x秒/度后停止

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [0-60] 速度，单位 度/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；2：表示按度运动）
        

- **返回**
    
    无
    

#### [**spider_move_turn(direction, speed, turn, turn_speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=spider_move_turndirection-speed-turn-turn_speeda-idspider6)

控制蜘蛛直线运动同时做旋转运动

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退；2：左平移；3：右平移）
        
    - **speed** (_int_) – [0-25] 速度，单位 厘米/秒
        
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **turn_speed** (_int_) – [0-60] 速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**spider_stop()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=spider_stopa-idspider7)

暂停蜘蛛运动

- **返回**
    
    无
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-5)

```
from ugot import ugot
import time

got = ugot.UGOT()
# 初始化设备
got.initialize('192.168.8.106')

# 复位
got.spider_restory()

# 前进/后退
got.spider_move_speed(0, 10)
time.sleep(2)

# 左转/右转
got.spider_turn_speed(2, 40)
time.sleep(2)

# 按里程前进/后退
got.spider_move_speed_times(2, 20, 40, 0)

# 按里程左转/右转
got.spider_turn_speed_times(2, 40, 200, 2)

# 运动同时转弯
got.spider_move_turn(1, 20, 3, 40)
time.sleep(2)

# 停止运动
got.spider_stop()
```

## [**四足机器人**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e5%9b%9b%e8%b6%b3%e6%9c%ba%e5%99%a8%e4%ba%ba)

### [**四足机器人概述**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e5%9b%9b%e8%b6%b3%e6%9c%ba%e5%99%a8%e4%ba%ba%e6%a6%82%e8%bf%b0)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-7)

- def [dog_restory():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog1)
- def [dog_set_decline_angle(pose, angle):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog2)
- def [dog_move_speed(direction, speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog3)
- def [dog_turn_speed(turn, speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog4)
- def [dog_move_speed_times(direction, speed, times, unit):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog5)
- def [dog_turn_speed_times(turn, speed, times, unit):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog6)
- def [dog_move_turn(direction, speed, turn, turn_speed):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog7)
- def [dog_perform_action(actionId):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog8)
- def [dog_stop():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog9)
- def [dog_adaption_control(option):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog10)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-7)

#### [**dog_restory()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog_restorya-iddog1)

四足狗复位

- **返回**
    
    无
    

#### [**dog_set_decline_angle(pose, angle)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog_set_decline_anglepose-anglea-iddog2)

设置四足狗倾斜角度

- **参数**
    
    - **pose** (_int_) – 倾斜方向（0：左右倾斜；1：前后倾斜）
        
    - **angle** (_int_) – [-5, 5] 角度，单位 度
        

- **返回**
    
    无
    

#### [**dog_move_speed(direction, speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog_move_speeddirection-speeda-iddog3)

控制四足狗前进/后退

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [0-25] 速度，单位 厘米/秒
        

- **返回**
    
    无
    

#### [**dog_turn_speed(turn, speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog_turn_speedturn-speeda-iddog4)

控制四足狗原地旋转

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [0-20] 速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**dog_move_speed_times(direction, speed, times, unit)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog_move_speed_timesdirection-speed-times-unita-iddog5)

控制四足狗直线运动x秒/cm后停止

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [0-25] 速度，单位 厘米/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；1：表示按厘米运动）
        

- **返回**
    
    无
    

#### [**dog_turn_speed_times(turn, speed, times, unit)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog_turn_speed_timesturn-speed-times-unita-iddog6)

控制四足狗旋转x秒/度后停止

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [0-20] 速度，单位 度/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；2：表示按度运动）
        

- **返回**
    
    无
    

#### [**dog_move_turn(direction, speed, turn, turn_speed)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog_move_turndirection-speed-turn-turn_speeda-iddog7)

控制四足狗直线运动同时做旋转运动

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退；2：左平移；3：右平移）
        
    - **speed** (_int_) – [0-25] 速度，单位 厘米/秒
        
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **turn_speed** (_int_) – [0-20] 速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**dog_perform_action(actionId)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog_perform_actionactionida-iddog8)

控制四足狗执行特定动作

- **参数**
    
    - **actionId** (_str_) – 动作名称，可选项(crawling 匍匐; squatting 蹲坐; standing 站立; handshake 握手; urination 小便; stretch 伸懒腰)

- **返回**
    
    无
    

#### [**dog_stop()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog_stopa-iddog9)

暂停四足狗运动

- **返回**
    
    无
    

#### [**dog_adaption_control(option)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=dog_adaption_controloptiona-iddog10)

启用/禁用自适应功能；四足机器人可根据不同地形调整姿态

- **参数**
    
    **选项** (_bool_) – 开关状态，开为真，关为假
    

- **返回**
    
    无
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/model?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-6)

```
from ugot import ugot
import time

got = ugot.UGOT()
# 初始化设备
got.initialize('192.168.8.106')

# 复位
got.dog_restory()

# 执行动作
got.dog_perform_action('squatting')

# 复位
got.dog_restory()

# 设置倾斜
got.dog_set_decline_angle(0, -5)

# 前进/后退
got.dog_move_speed(0, 10)
time.sleep(2)

# 左转/右转
got.dog_turn_speed(2, 20)
time.sleep(2)

# 按里程前进/后退
got.dog_move_speed_times(1, 20, 40, 0)

# 按里程左转/右转
got.dog_turn_speed_times(2, 40, 200, 2)

# 运动同时转弯
got.dog_move_turn(1, 20, 3, 40)
time.sleep(2)

# 停止运动
got.dog_stop()
```

## [**加载模型&卸载模型**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e5%8a%a0%e8%bd%bd%e6%a8%a1%e5%9e%8bamp%e5%8d%b8%e8%bd%bd%e6%a8%a1%e5%9e%8b)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8)

- def [load_models(models):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision11)
- def [release_models(models=None):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision12)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e)

#### [**load_models(models)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=load_modelsmodelsa-idvision11)

加载模型，可选多个

- **参数**
    
    **models** (_list_) – 要加载的模型列表，对应关系为：人体姿态: ‘human_pose’, 文字识别: ‘word_recognition’, 颜色识别: ‘color_recognition’, ArpilTag/二维码: ‘apriltag_qrcode’, 表情识别/人脸特征: ‘face_attribute’, 车牌识别: ‘lpd_recognition’, 手势识别: ‘gesture’, 交通识别标识: ‘traffic_sign’, 人脸识别: ‘face_recognition’, 单轨/双轨: ‘line_recognition’
    

- **返回**
    
    是否加载成功 True or False
    

#### [**release_models(models=None)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=release_modelsmodelsnonea-idvision12)

卸载模型

- **参数**
    
    **models** (_list_) – 要卸载的模型列表，参数同load_models的参数。默认为None，如果不传，则卸载所有模型
    

- **返回**
    
    是否卸载成功 True or False
    

## [**二维码&AprilTag**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e4%ba%8c%e7%bb%b4%e7%a0%81ampapriltag)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-1)

- def [get_qrcode_total_info():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision21)
- def [get_apriltag_total_info():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision22)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-1)

#### [**get_qrcode_total_info()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=get_qrcode_total_infoa-idvision21)

获取二维码信息

- **参数**
    
    **无** –
    

- **返回**
    
    qrcode(str): 二维码内容 center_x(float): 二维码 中心点x center_y(float): 二维码 中心点y height(float): 二维码 高度 width(float): 二维码 宽度 area(float): 二维码 面积
    

- **返回类型**
    
    二维码识别结果 (list) [ [qrcode, center_x, center_y, height, width, area], … ]
    

#### [**get_apriltag_total_info()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=get_apriltag_total_infoa-idvision22)

获取AprilTag信息

- **参数**
    
    **无** –
    

- **返回**
    
    id(int): AprilTag id center_x(float): AprilTag 中心点x center_y(float): AprilTag 中心点y height(float): AprilTag 高度 width(float): AprilTag 宽度 area(float): AprilTag 面积 distance5(float): AprilTag(5x5cm)距离 distance7(float): AprilTag(7x7cm)距离 distance10(float): AprilTag(10x10cm)距离 x(float): AprilTag卡片姿态角度 x y(float): AprilTag卡片姿态角度 y z(float): AprilTag卡片姿态角度 z bearingAngle_h (float): AprilTag卡片横向方位角 bearingAngle_v (float): AprilTag卡片纵向方位角
    

- **返回类型**
    
    AprilTag识别结果 (list) [ [id, center_x, center_y, height, width, area, distance5, distance7, distance10, x, y, z, bearingAngle_h, bearingAngle_v], … ]
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81)

```
from ugot import ugot

import time
got = ugot.UGOT()

got.initialize('192.168.8.112')

got.load_models(['apriltag_qrcode'])

while True:
    print('-------:',got.get_qrcode_apriltag_total_info())
    time.sleep(0.5)
```

## [**车牌识别**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e8%bd%a6%e7%89%8c%e8%af%86%e5%88%ab)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-2)

- def [get_license_plate_total_info():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision31)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-2)

#### [**get_license_plate_total_info()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=get_license_plate_total_infoa-idvision31)

获取车牌信息

- **参数**
    
    **无** –
    

- **返回**
    
    number(str): 车牌号 type(str): 车牌类型（蓝牌/绿牌） center_x(float): 中心点x center_y(float): 中心点y height(float): 高度 width(float): 宽度 area(float): 面积
    

- **返回类型**
    
    车牌识别结果 (list) [ [number, type, center_x, center_y, height, width, area], … ]
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-1)

```
from ugot import ugot

import time
got = ugot.UGOT()

got.initialize('192.168.8.112')

got.load_models(['lpd_recognition'])

while True:
    print('-------:',got.get_license_plate_total_info())
    time.sleep(0.5)
```

## [**人体姿态识别**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e4%ba%ba%e4%bd%93%e5%a7%bf%e6%80%81%e8%af%86%e5%88%ab)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-3)

- def [get_pose_total_info():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision41)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-3)

#### [**get_pose_total_info()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=get_pose_total_infoa-idvision41)

返回识别到的人体关键点坐标

- **参数**
    
    **无** –
    

- **返回**
    
    姿势识别结果(list) [ [右耳x, y, 右眼x, y, 鼻子x, y, 左眼x, y, 左耳x, y, 右手x, y, 右肘x, y, 右肩x, y, 左肩x, y, 左肘x, y, 左手x, y, 右胯x, y, 左胯x, y, 右膝x, y, 左膝x, y, 右脚x, y, 左脚x, y, ], … ]
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-2)

```
# 姿势识别

from ugot import ugot

import time
got = ugot.UGOT()

got.initialize('192.168.8.112')

got.load_models(['human_pose'])

while True:
    print('-------:',got.get_pose_total_info())
    time.sleep(0.5)
```

## [**交通标志识别**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e4%ba%a4%e9%80%9a%e6%a0%87%e5%bf%97%e8%af%86%e5%88%ab)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-4)

- def [get_traffic_total_info():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision51)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-4)

#### [**get_traffic_total_info()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=get_traffic_total_infoa-idvision51)

获取交通标志识别结果

- **参数**
    
    **无** –
    

- **返回**
    
    sign(str): 交通标志(绿灯, 鸣笛, 左转, 右转, 斑马线, 红灯, 注意儿童, 禁止长时间停车, 进入隧道, 黄灯) center_x(float): 中心点x center_y(float): 中心点y height(float): 高度 width(float): 宽度 area(float): 面积
    

- **返回类型**
    
    交通标志识别结果 (list) [ [sign, center_x, center_y, height, width, area], … ]
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-3)

```
from ugot import ugot

import time
got = ugot.UGOT()

got.initialize('192.168.8.112')

got.load_models(['traffic_sign'])

while True:
    print('-------:',got.get_traffic_total_info())
    time.sleep(0.5)
```

## [**人脸识别**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e4%ba%ba%e8%84%b8%e8%af%86%e5%88%ab)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-5)

- def [get_face_recognition_total_info():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision61)
- def [face_recognition_get_all_names():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision62)
- def [face_recognition_delete_name(name):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision63)
- def [face_recognition_add_name(name):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision64)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-5)

#### [**get_face_recognition_total_info()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=get_face_recognition_total_infoa-idvision61)

人脸识别结果

- **参数**
    
    **无** –
    

- **返回**
    
    name(str): 姓名（不认识的话则为陌生人） center_x(float): 中心点x center_y(float): 中心点y height(float): 高度 width(float): 宽度 area(float): 面积
    

- **返回类型**
    
    人脸识别结果(list) [ [name, center_x, center_y, height, width, area], … ]
    

#### [**face_recognition_get_all_names()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=face_recognition_get_all_namesa-idvision62)

获取所有录入的人脸名称列表

- **参数**
    
    **无** –
    

- **返回**
    
    [name1, name2, …]
    

- **返回类型**
    
    人脸名称列表 (list)
    

#### [**face_recognition_delete_name(name)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=face_recognition_delete_namenamea-idvision63)

删除录入的人脸

- **参数**
    
    **name** (_str_) – 人脸名称
    

- **返回**
    
    无
    

#### [**face_recognition_add_name(name)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=face_recognition_add_namenamea-idvision64)

录入人脸

- **参数**
    
    **name** (_str_) – 人脸名称
    

- **返回**
    
    无
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-4)

```
from ugot import ugot

import time
got = ugot.UGOT()

got.initialize('192.168.8.117')

got.load_models(['face_recognition'])

print(got.face_recognition_get_all_names())

got.face_recognition_add_name('aobama')

time.sleep(1)

while True:
    print('-------:',got.get_face_recognition_total_info())
    time.sleep(1)
```

## [**人脸特征识别**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e4%ba%ba%e8%84%b8%e7%89%b9%e5%be%81%e8%af%86%e5%88%ab)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-6)

- def [get_face_characteristic_total_info():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision71)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-6)

#### [**get_face_characteristic_total_info()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=get_face_characteristic_total_infoa-idvision71)

获取人脸特征识别结果

- **参数**
    
    **无** –
    

- **返回**
    
    gender(str): 性别 mask_info(str): 口罩情况 emotion(str): 表情 center_x(float): 中心点x center_y(float): 中心点y height(float): 高度 width(float): 宽度 area(float): 面积
    

- **返回类型**
    
    人脸特征识别结果 (list) [ [gender, mask_info, emotion, center_x, center_y, height, width, area], … ]
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-5)

```
from ugot import ugot

import time
got = ugot.UGOT()

got.initialize('192.168.8.112')

got.load_models(['face_attribute'])

while True:
    print('-------:',got.get_face_characteristic_total_info())
    time.sleep(0.5)
```

## [**车道线识别**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e8%bd%a6%e9%81%93%e7%ba%bf%e8%af%86%e5%88%ab)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-7)

- def [set_track_recognition_line(line_type):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision81)
- def [get_single_track_total_info():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision82)
- def [get_double_track_total_info():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision83)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-7)

#### [**set_track_recognition_line(line_type)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=set_track_recognition_lineline_typea-idvision81)

设置当前识别的车道线类型

- **参数**
    
    **line_type** (_int_) – 0: 单轨, 1: 双轨
    

- **返回**
    
    无
    

#### [**get_single_track_total_info()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=get_single_track_total_infoa-idvision82)

获取单轨识别结果

- **参数**
    
    **无** –
    

- **返回**
    
    offset(int): 单轨偏移量 type(int): 单轨线类型(1 直线, 2 y字路口, 3 十字路口, 0 无线) x(float): 路口坐标x y(float): 路口坐标y
    

- **返回类型**
    
    单轨识别结果(list) [offset, type, x, y]
    

#### [**get_double_track_total_info()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=get_double_track_total_infoa-idvision83)

获取双轨识别结果

- **参数**
    
    **无** –
    

- **返回**
    
    offset(int): 双轨偏移量 type(int): 双轨线类型(1 直线, 2 路口, 0 无线) x(float): 路口坐标x y(float): 路口坐标y
    

- **返回类型**
    
    双轨识别结果(list) [offset, type, x, y]
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-6)

```
from ugot import ugot

import time
got = ugot.UGOT()

got.initialize('192.168.8.112')

got.load_models(['line_recognition'])
got.set_track_recognition_line(0)

while True:
    print('-------:',got.get_single_track_total_info())
    time.sleep(0.5)
```

## [**颜色识别**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e9%a2%9c%e8%89%b2%e8%af%86%e5%88%ab)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-8)

- def [get_color_total_info():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision91)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-8)

#### [**get_color_total_info()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=get_color_total_infoa-idvision91)

获取颜色识别结果

- **参数**
    
    **无** –
    

- **返回**
    
    color(str): 颜色 shape(str): 形状(小球/方块) center_x(float): 中心点x center_y(float): 中心点y height(float): 高度 width(float): 宽度 area(float): 面积
    

- **返回类型**
    
    颜色识别结果 (list) [color, shape, center_x, center_y, height, width, area]
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-7)

```
from ugot import ugot

import time
got = ugot.UGOT()

got.initialize('192.168.8.112')

got.load_models(['color_recognition'])

while True:
    print('-------:',got.get_color_total_info())
    time.sleep(0.5)
```

## [**文字识别**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%96%87%e5%ad%97%e8%af%86%e5%88%ab)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-9)

- def [get_words_result():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision101)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-9)

#### [**get_words_result()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=get_words_resulta-idvision101)

获取文字识别结果

- **参数**
    
    **无** –
    

- **返回类型**
    
    文字识别结果 (str)
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-8)

```
from ugot import ugot

import time
got = ugot.UGOT()

got.initialize('192.168.8.112')

got.load_models(['word_recognition'])

while True:
    print('-------:',got.get_words_result())
    time.sleep(0.5)
```

## [**手势识别**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%89%8b%e5%8a%bf%e8%af%86%e5%88%ab)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-10)

- def [get_gesture_result():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision111)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-10)

#### [**get_gesture_result()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=get_gesture_resulta-idvision111)

获取手势识别结果

- **参数**
    
    **无** –
    

- **返回**
    
    (石头/剪刀/布/ok/点赞)
    

- **返回类型**
    
    手势识别结果 (str)
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-9)

```
from ugot import ugot

import time
got = ugot.UGOT()

got.initialize('192.168.8.112')

got.load_models(['gesture'])

while True:
    print('-------:',got.get_gesture_result())
    time.sleep(0.5)
```

## [**KNN**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=knn)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-11)

- def [get_knn_result(model_name):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision121)
- def [knn_train(model_name, label_list):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision122)
- def [knn_rename(src_name, dst_name):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision123)
- def [knn_delete(model_name):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision124)
- def [knn_query():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=vision125)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-11)

#### [**get_knn_result(model_name)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=get_knn_resultmodel_namea-idvision121)

获取本地训练识别结果

- **参数**
    
    **model_name** (_str_) – 训练的模型名称
    

- **返回**
    
    [“分类1”: 分类1的置信度, “分类2”: 分类2的置信度, …]
    
- **返回类型**
    
    本地训练识别结果 (dict)
    

#### [**knn_train(model_name, label_list)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=knn_trainmodel_name-label_lista-idvision122)

训练KNN模型

- **参数**
    
    - **model_name** (_str_) –KNN模型名称
        
    - **label_list** (_list_) – 要训练的标签列表
        

- **返回**
    
    True or False
    

- **返回类型**
    
    Result(bool)
    

#### [**knn_rename(src_name, dst_name)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=knn_renamesrc_name-dst_namea-idvision123)

重命名已训练的KNN模型

- **参数**
    
    - **src_name** (_str_) – 修改前的名称
        
    - **dst_name** (_str_) – 修改后的名称
        

- **返回**
    
    True or False
    

- **返回类型**
    
    Result(bool)
    

#### [**knn_delete(model_name)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=knn_deletemodel_namea-idvision124)

删除已训练的KNN模型

- **参数**
    
    **model_name** (_str_) – 模型名称
    

- **返回**
    
    True or False
    

- **返回类型**
    
    Result(bool)
    

#### [**knn_query()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=knn_querya-idvision125)

获取受过训练的KNN模型的名单

- **参数**
    
    **None** –
    

- **返回**
    
    Format: { “model_name1”: [“label11”, “label12”, ..], “model_name2”: [“label21”, “label22”, ..] …}, Returns None for no trained models!
    

- **返回类型**
    
    model_list (dict)
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-10)

```
from ugot import ugot

import time
got = ugot.UGOT()

got.initialize('192.168.8.106')

while True:
    print('-------:',got.get_knn_result('model1'))
    time.sleep(0.5)
```

## [**摄像头**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%91%84%e5%83%8f%e5%a4%b4)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-12)

- def [open_camera():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=camera1)
- def [read_camera_data():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=camera2)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-12)

#### [**open_camera()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=open_cameraa-idcamera1)

打开摄像头

- **返回**
    
    无
    

#### [**read_camera_data()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=read_camera_dataa-idcamera2)

读取摄像机当前帧的数据

- **返回**
    
    the decoded base64 image string (Returns None when no data is obtained)
    

- **返回类型**
    
    data(str)
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/vision?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-11)

```
from ugot import ugot
import cv2
import numpy as np

got = ugot.UGOT()

got.initialize('192.168.8.112')

got.open_camera()

try:
    while True:
        frame = got.read_camera_data()
        if frame is not None:
            nparr = np.frombuffer(frame, np.uint8)
            data = cv2.imdecode(nparr,cv2.IMREAD_COLOR)
            cv2.imshow("frame", data)
            cv2.waitKey(1)
except KeyboardInterrupt:
    print('-----KeyboardInterrupt')
```

## [**音频音效**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=%e9%9f%b3%e9%a2%91%e9%9f%b3%e6%95%88)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8)

- def [play_sound(data, wait=False):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=audio11)
- def [play_sound_upload(data, wait=False):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=audio12)
- def [play_record(data, wait=False):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=audio13)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e)

#### [**play_sound(data, wait=False)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=play_sounddata-waitfalsea-idaudio11)

播放内置音效

- **参数**
    
    - **data** (_str_) – 待播放内容 动物分类: bear 熊, bird 鸟, chicken 鸡, cow 牛, dog 狗, elephant 大象, giraffe 长颈鹿, horse 马, lion 狮子, monkey 猴子, pig 猪, rhinoceros 犀牛, sealions 海狮, tiger 老虎, walrus 海象 命令分类: complete 完成, cover 掩护, move 移动, received 收到, support 支援, transfiguration 变身, yes 遵命 情绪分类: happy 高兴, yawn 哈欠, snoring 呼噜, surprise 惊讶, actingcute 热泪盈眶, angry 生气, fail 失败, lose 失落, doubt 疑问, nonsense 呓语, cheerful 愉快, come_and_play 歌曲1, flexin 歌曲2, london_bridge 歌曲3, yankee_doodle 歌曲4 机器分类: ambulance 救护车, busy_tone 忙音, carhorn 汽车喇叭, carhorn1 汽车喇叭1, doorbell 门铃, engine 引擎, laser 激光, meebot 小黄人, police_car_1 警车1, police_car_2 警车2, ringtones 来电铃声, robot 机器人, telephone_call 电话呼叫, touch_tone 按键音, wave 电波
        
    - **wait** (_bool, optional_) – 是否阻塞, 默认False, 不阻塞
        

- **返回**
    
    无
    

#### [**play_sound_upload(data, wait=False)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=play_sound_uploaddata-waitfalsea-idaudio12)

播放上传的音频

- **参数**
    
    - **data** (_str_) – 待播放内容，需要加上文件类型后缀
        
    - **wait** (_bool, optional_) – 是否阻塞, 默认False, 不阻塞
        

- **返回**
    
    无
    

#### [**play_record(data, wait=False)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=play_recorddata-waitfalsea-idaudio13)

播放录音

- **参数**
    
    - **data** (_string_) – 待播放的录音
        
    - **wait** (_bool, optional_) – 是否阻塞, 默认False, 不阻塞
        

- **返回**
    
    无
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81)

```
from ugot import ugot

import time
got = ugot.UGOT()

got.initialize('192.168.8.112')
# 播放内置音频
got.play_sound('elephant', True)
```

## [**语音处理**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=%e8%af%ad%e9%9f%b3%e5%a4%84%e7%90%86)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-1)

- def [start_audio_asr():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=audio21)
- def [start_audio_nlp(data, wait=False):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=audio22)
- def [play_audio_tts(data, voice_type=0, wait=False):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=audio23)
- def [start_audio_asr_doa(duration=60):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=audio24)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-1)

#### [**start_audio_asr()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=start_audio_asra-idaudio21)

启动监听

- **返回**
    
    听到的语音内容 (str)
    

#### [**start_audio_nlp(data, wait=False)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=start_audio_nlpdata-waitfalsea-idaudio22)

监听语音并进行回答NLP

- **参数**
    
    - **data** (_string_) – 问题
        
    - **wait** (_bool, optional_) – True阻塞等待, 默认False, 不阻塞
        

- **返回**
    
    无
    

#### [**play_audio_tts(data, voice_type=0, wait=False)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=play_audio_ttsdata-voice_type0-waitfalsea-idaudio23)

播放TTS语音

- **参数**
    
    - **data** (_string_) – 待播放内容
        
    - **voice_type** (_int_) – 音色(0: 女声, 1: 男声) 默认为0女声
        
    - **wait** (_bool, optional_) – 是否阻塞, 默认False, 不阻塞
        

- **返回**
    
    无
    

#### [**start_audio_asr_doa(duration=60)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=start_audio_asr_doaduration60a-idaudio24)

开始语音识别监听并且开启声源定位

- **参数**
    
    **duration** (_int_) – maximum listening time (2-60)
    

- **返回**
    
    [direction, content]
    

```
    * **direction (str)**

        声源定位的方向 (Left/Right/Front/Back)



    * **content (str)**

        语音识别的内容
```

- **返回类型**
    
    语音识别结果 (list)
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-1)

```
from ugot import ugot

import time
got = ugot.UGOT()

got.initialize('192.168.8.112')
# ASR
asr_result = got.start_audio_asr()
# NLP
got.start_audio_nlp(asr_result, True)
# TTS
got.play_audio_tts('你好', 0, True)
```

## [**声源定位**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=%e5%a3%b0%e6%ba%90%e5%ae%9a%e4%bd%8d)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-2)

- def [enable_audio_direction():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=audio31)
- def [disable_audio_direction():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=audio32)
- def [get_audio_direction():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=audio33)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-2)

#### [**enable_audio_direction()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=enable_audio_directiona-idaudio31)

开启声源定位

- **返回**
    
    无
    

#### [**disable_audio_direction()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=disable_audio_directiona-idaudio32)

关闭声源定位

- **返回**
    
    无
    

#### [**get_audio_direction()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=get_audio_directiona-idaudio33)

获取声源定位方向

- **返回**
    
    (左方/右方/前方/后方)
    

- **返回类型**
    
    声源方向 (str)
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-2)

```
from ugot import ugot

import time
got = ugot.UGOT()

got.initialize('192.168.8.112')
# 声源定位
got.enable_audio_direction()
print('111111:',got.get_audio_direction())
got.disable_audio_direction()
```

## [**声音设置**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=%e5%a3%b0%e9%9f%b3%e8%ae%be%e7%bd%ae)

### [**接口列表**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=%e6%8e%a5%e5%8f%a3%e5%88%97%e8%a1%a8-3)

- def [set_volume(volume):](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=audio41)
- def [get_volume():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=audio42)
- def [stop_audio():](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=audio43)

### [**接口说明**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=%e6%8e%a5%e5%8f%a3%e8%af%b4%e6%98%8e-3)

#### [**set_volume(volume)**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=set_volumevolumea-idaudio41)

设置音量

- **参数**
    
    - **volume** (_int_) – 音量 (0-100)

- **返回**
    
    无
    

#### [**get_volume()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=get_volumea-idaudio42)

获取音量

- **返回**
    
    [volume, isMute]
    
    ```
      :volume(int) 音量值 0-100
      :isMute(bool) 是否静音
    ```
    

- **返回类型**
    
    音量情况 (list)
    

#### [**stop_audio()**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=stop_audioa-idaudio43)

停止播放声音

- **返回**
    
    无
    

### [**示例代码**](https://docs.ubtrobot.com/ugot/#/zn-cn/extension/python_sdk/audio?id=%e7%a4%ba%e4%be%8b%e4%bb%a3%e7%a0%81-3)

```
from ugot import ugot

import time
got = ugot.UGOT()

got.initialize('192.168.8.112')
# 音量
print('volume1:',got.get_volume())
got.set_volume(70)
print('volume2:',got.get_volume())
```