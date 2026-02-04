# [**运动**]

运动概述——
## [**通用运控接口**]

### 接口列表

- def [stop_chassis():]
- def [perform_action(actionId):]
- def [model_common_move(speed, turn_speed):]

### [**接口说明**]

#### [**stop_chassis()**]

停止底盘运动（可以停止除了平衡车与轮足车的底盘运动）

- **参数**
    
    **无** –
    

- **返回**
    
    无
    

#### [**perform_action(actionId)**]

执行通用动作

参数名称: Action name, options available (WakeUp, Smile, Doubt, Resist, Love, Anger, Proud, Ticklish, Sleep)

type actionId: str

- **返回**
    
    无
    

#### [**model_common_move(speed, turn_speed)**]

UGOT通用形态移动接口

- **参数**
    
    - **speed** (_int_) – 线速度: 速度为正则向前移动, 速度为负则向后移动
        
    - **turn_speed** (_int_) –角速度:速度为正则向左转弯, 速度为负则向右转弯
        

- **返回**
    
    无
    

## [**变形车**]

### [**变形车概述**]

### [**接口列表**]

- def [transform_set_chassis_height(height: int):]
- def [transform_move_speed(direction, speed):]
- def [transform_turn_speed(turn: int, speed: int):]
- def [transform_move_speed_times(direction, speed, times, unit):]
- def [transform_turn_speed_times(turn, speed, times, unit):]
- def [transform_move_turn(direction, speed, turn, turn_speed):]
- def [transform_motor_control(lf, rf, lb, rb):]
- def [transform_stop:]
- def [transform_arm_control(joint, position, time):]
- def [transform_adaption_control(option):]
- def [transform_restory():]

### [**接口说明**]

#### [**transform_set_chassis_height(height: int)**]

设置变形车底盘高度

- **参数**
    
    - **height** (_int_) – [2-7] 单位厘米

- **返回**
    
    无
    

#### [**transform_move_speed(direction, speed)**]

变形工程车前进/后退运动

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-80] 速度，单位 厘米/秒
        

- **返回**
    
    无
    

#### [**transform_turn_speed(turn: int, speed: int)**]

变形工程车左转/右转运动

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [5-280] 速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**transform_move_speed_times(direction, speed, times, unit)**]

控制变形车前后运动x秒/cm后停止

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-80] 速度，单位 厘米/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；1：表示按厘米运动）
        

- **返回**
    
    无
    

#### [**transform_turn_speed_times(turn, speed, times, unit)**]

控制变形车左右运动x秒/度后停止

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [5-280] 速度，单位 度/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；2：表示按度运动）
        

- **返回**
    
    无
    

#### [**transform_move_turn(direction, speed, turn, turn_speed)**]

控制变形车向指定方向运动同时做旋转运动

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-80] 前进/后退速度，单位 厘米/秒
        
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **turn_speed** (_int_) – [5-280] 旋转速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**transform_motor_control(lf, rf, lb, rb)**]

控制变形车四个电机转动

- **参数**
    
    - **lf** (_int_) – 左前轮速度，[-360, 360] 单位 转/分
        
    - **rf** (_int_) – 右前轮速度，[-360, 360] 单位 转/分
        
    - **lb** (_int_) – 左后轮速度，[-360, 360] 单位 转/分
        
    - **rb** (_int_) – 右后轮速度，[-360, 360] 单位 转/分
        

- **返回**
    
    无
    

#### [**transform_stop()**]

变形车停止运动

- **返回**
    
    无
    

#### [**transform_arm_control(joint, position, time)**]

设置变形车四个臂角度

- **参数**
    
    - **joint** (_int_) – 臂(1:左前臂；2:左后臂；3:右后臂；4:右前臂)
        
    - **position** (_int_) – 角度，单位 度
        
    - **time** (_int_) – 时长，单位 ms
        

- **返回**
    
    无
    

#### [**transform_adaption_control(option)**]

开启/关闭自适应，变形车可以根据不同地形调整姿态

- **参数**
    
    - **option** (_bool_) – 开关状态 True表示开，False表示关

- **返回**
    
    无
    

#### [**transform_restory()**]

让变形车复位

- **返回**
    
    无
    

### [**示例代码**]

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

## [**麦轮车**]

### [**麦轮车概述**]

### [**接口列表**]

- def [mecanum_translate_speed(angle, speed):]
- def [mecanum_translate_speed_times(angle, speed, times, unit):]
- def [mecanum_move_xyz(x_speed, y_speed, z_speed):]
- def [mecanum_move_speed(direction, speed):]
- def [mecanum_turn_speed(turn, speed):]
- def [mecanum_move_speed_times(direction, speed, times, unit):]
- def [mecanum_turn_speed_times(turn, speed, times, unit):]
- def [mecanum_move_turn(angle, speed, turn, turn_speed):]
- def [mecanum_motor_control(lf, rf, lb, rb):]
- def [mecanum_stop():]

### [**接口说明**]

#### [**mecanum_translate_speed(angle, speed)**]

麦轮车向指定方向做平移运动

- **参数**
    
    - **angle** (_int_) – [-180, 180] 角度 单位:度(以XY为平面，Y轴为0度方向，左[0, -180] 右[0, 180])
        
    - **speed** (_int_) – [5-80] 前进/后退速度，单位 厘米/秒
        

- **返回**
    
    无
    

#### [**mecanum_translate_speed_times(angle, speed, times, unit)**]

麦轮车向指定方向做平移运动x秒/cm后停止

- **参数**
    
    - **angle** (_int_) – [-180, 180] 角度 单位:度(以XY为平面，Y轴为0度方向，左[0, -180] 右[0, 180])
        
    - **speed** (_int_) – [5-80] 速度，单位 度/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；1：表示按厘米运动）
        

- **返回**
    
    无
    

#### [**mecanum_move_xyz(x_speed, y_speed, z_speed)**]

控制麦轮车以指定速度沿指定方向持续运动

- **参数**
    
    - **x_speed** (_int_) – x轴方向速度 [-80, 80]
        
    - **y_speed** (_int_) – y轴方向速度 [-80, 80]
        
    - **z_speed** (_int_) – z轴方向速度 [-280, 280]
        

- **返回**
    
    无
    

#### [**mecanum_move_speed(direction, speed)**]

麦轮车前进/后退运动

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-80] 速度，单位 厘米/秒
        

- **返回**
    
    无
    

#### [**mecanum_turn_speed(turn, speed)**]

麦轮车左转/右转运动

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [5-280] 速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**mecanum_move_speed_times(direction, speed, times, unit)**]

控制麦轮车前后运动x秒/cm后停止

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-80] 速度，单位 厘米/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；1：表示按厘米运动）
        

- **返回**
    
    无
    

#### [**mecanum_turn_speed_times(turn, speed, times, unit)**]

控制麦轮车左右运动x秒/度后停止

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [5-280] 速度，单位 度/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；2：表示按度运动）
        

- **返回**
    
    无
    

#### [**mecanum_move_turn(angle, speed, turn, turn_speed)**]

控制麦轮车向指定方向运动同时做旋转运动

- **参数**
    
    - **angle** (_int_) – [-180, 180] 角度 单位:度(以XY为平面，Y轴为0度方向，左[0, -180] 右[0, 180])
        
    - **speed** (_int_) – [5-80] 前进/后退速度，单位 厘米/秒
        
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **turn_speed** (_int_) – [5-280] 旋转速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**mecanum_motor_control(lf, rf, lb, rb)**]

控制麦轮车四个电机转动

- **参数**
    
    - **lf** (_int_) – 左前轮速度，[-360, 360] 单位 转/分
        
    - **rf** (_int_) – 右前轮速度，[-360, 360] 单位 转/分
        
    - **lb** (_int_) – 左后轮速度，[-360, 360] 单位 转/分
        
    - **rb** (_int_) – 右后轮速度，[-360, 360] 单位 转/分
        

- **返回**
    
    无
    

#### [**mecanum_stop()**]

麦轮车停止运动

- **返回**
    
    无
    

### [**示例代码**]

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

## [**平衡车**]

### [**平衡车概述**]

### [**接口列表**]

- def [balance_start_balancing():]
- def [balance_stop_balancing():]
- def [balance_set_acceleration(acceleration):]
- def [balance_reset_acceleration():]
- def [balance_move_speed(direction, speed):]
- def [balance_turn_speed(turn, speed):]
- def [balance_move_speed_times(direction, speed, times, unit):]
- def [balance_turn_speed_times(turn, speed, times, unit):]
- def [balance_move_turn(direction, speed, turn, turn_speed):]

### [**接口说明**]

#### [**balance_start_balancing()**]

启动小车并保持自平衡

- **返回**
    
    无
    

#### [**balance_stop_balancing()**]

停止小车并保持自平衡

- **返回**
    
    无
    

#### [**balance_set_acceleration(acceleration)**]

设置平衡车加速度

- **参数**
    
    - **acceleration** (_float_) – 加速度

- **返回**
    
    无
    

#### [**balance_reset_acceleration()**]

重置平衡车加速度

- **返回**
    
    无
    

#### [**balance_move_speed(direction, speed)**]

平衡车前进/后退运动

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-80] 速度，单位 厘米/秒
        

- **返回**
    
    无
    

#### [**balance_turn_speed(turn, speed)**]

平衡车左转/右转运动

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [5-360] 速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**balance_move_speed_times(direction, speed, times, unit)**]

控制平衡车前后运动x秒/cm后停止

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-80] 速度，单位 厘米/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；1：表示按厘米运动）
        

- **返回**
    
    无
    

#### [**balance_turn_speed_times(turn, speed, times, unit)**]

控制平衡车左右运动x秒/度后停止

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [5-360] 速度，单位 度/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；2：表示按度运动）
        

- **返回**
    
    无
    

#### [**balance_move_turn(direction, speed, turn, turn_speed)**]

控制平衡车指定方向运动同时做旋转

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-80] 前进/后退速度，单位 厘米/秒
        
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **turn_speed** (_int_) – [5-360] 旋转速度，单位 度/秒
        

- **返回**
    
    无
    

### [**示例代码**]

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

## [**机械臂**]

### [**机械臂概述**]

### [**接口列表**]

- def [mechanical_clamp_release():]
- def [mechanical_clamp_close():]
- def [mechanical_get_clamp_status():]
- def [mechanical_arms_restory():]
- def [mechanical_joint_control(angle1, angle2, angle3, duration):]
- def [mechanical_single_joint_control(joint, angle, duration):]
- def [mechanical_move_axis(r, h, theta, duration):]

### [**接口说明**]

#### [**mechanical_clamp_release()**]

打开夹手

- **返回**
    
    无
    

#### [**mechanical_clamp_close()**]

闭合夹手

- **返回**
    
    无
    

#### [**mechanical_get_clamp_status()**]

获取夹手状态

- **返回**
    
    0 打开，1，闭合
    

- **返回类型**
    
    状态 (int)
    

#### [**mechanical_arms_restory()**]

机械臂复位

- **返回**
    
    无
    

#### [**mechanical_joint_control(angle1, angle2, angle3, duration)**]

机械臂关节角度控制

- **参数**
    
    - **angle1** (_int_) – 关节1角度 [-90, 90] 单位：度
        
    - **angle2** (_int_) – 关节2角度 [-80, 110] 单位：度
        
    - **angle3** (_int_) – 关节3角度 [-90, 90] 单位：度
        
    - **duration** (_int_) – 运行时长 [20, 5000] 单位：毫秒
        

- **返回**
    
    无
    

#### [**mechanical_single_joint_control(joint, angle, duration)**]

机械臂单个关节角度控制

- **参数**
    
    - **joint** (_int_) – 关节序号(1: 关节1, 2: 关节2, 3: 关节3)
        
    - **angle** (_int_) – 关节角度(关节1：[-90, 90], 关节2：[-80, 110], 关节3：[-90, 90], )
        
    - **duration** (_int_) – 运行时长 [20, 5000] 单位：毫秒
        

- **返回**
    
    无
    

#### [**mechanical_move_axis(r, h, theta, duration)**]

以小车为坐标系，逆解算机械臂，移动到位置r,h,theta

- **参数**
    
    - **r** (_float/int_) – r [-5.5, 24.9] 单位cm
        
    - **h** (_float/int_) – h [-18, 18.2] 单位cm
        
    - **theta** (_float/int_) – theta [-1.57, 1.57]
        
    - **duration** (_int_) – 运行时长 [20, 5000] 单位：毫秒
        

- **返回**
    
    无
    

### [**示例代码**]

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

## [**轮足车**]

### [**轮足车概述**]

### [**接口列表**]

- def [wheelleg_start_balancing():]
- def [wheelleg_stop_balancing():]
- def [wheelleg_move_speed(direction, speed):]
- def [wheelleg_turn_speed(turn, speed):]
- def [wheelleg_move_speed_times(direction, speed, times, unit):]
- def [wheelleg_turn_speed_times(turn, speed, times, unit):]
- def [wheelleg_move_turn(direction, speed, turn, turn_speed):]
- def [wheelleg_set_chassis_height(height):]
- def [wheelleg_restory():]
- def [wheelleg_set_decline_angle(angle):]
- def [wheelleg_adaption_control(option):]

### [**接口说明**]

#### [**wheelleg_start_balancing()**]

启动小车并保持自平衡

- **返回**
    
    无
    

#### [**wheelleg_stop_balancing()**]

停止小车并保持自平衡

- **返回**
    
    无
    

#### [**wheelleg_move_speed(direction, speed)**]

轮足机器人前进/后退运动

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-60] 速度，单位 厘米/秒
        

- **返回**
    
    无
    

#### [**wheelleg_turn_speed(turn, speed)**]

轮足机器人左转/右转运动

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [5-180] 速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**wheelleg_move_speed_times(direction, speed, times, unit)**]

控制轮足机器人前后运动x秒/cm后停止

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-60] 速度，单位 厘米/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；1：表示按厘米运动）
        

- **返回**
    
    无
    

#### [**wheelleg_turn_speed_times(turn, speed, times, unit)**]

控制轮足机器人左右运动x秒/度后停止

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [5-180] 速度，单位 度/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；2：表示按度运动）
        

- **返回**
    
    无
    

#### [**wheelleg_move_turn(direction, speed, turn, turn_speed)**]

控制轮足机器人指定方向运动同时做旋转

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [5-60] 前进/后退速度，单位 厘米/秒
        
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **turn_speed** (_int_) – [5-180] 旋转速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**wheelleg_set_chassis_height(height)**]

设置轮足机器人底盘高度

- **参数**
    
    - **height** (_int_) – 高度（1：高；2：中；3：低）

- **返回**
    
    无
    

#### [**wheelleg_restory()**]

轮足机器人恢复到初始姿态，中高度

- **返回**
    
    无
    

#### [**wheelleg_set_decline_angle(angle)**]

设置轮足机器人左右两边倾斜的角度

- **参数**
    
    - **angle** – (int): [-10, 10] 倾斜角度，单位 度

- **返回**
    
    无
    

#### [**wheelleg_adaption_control(option)**]

启用/关闭自适应功能；轮足机器人可根据不同地形调整姿态

- **参数**
    
    **选项** (_bool_) – Switch status, True for on, False for off
    

- **返回**
    
    无
    

### [**示例代码**]

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

## [**四足蜘蛛**]

### [**四足蜘蛛概述**]

### [**接口列表**]

- def [spider_restory():]
- def [spider_move_speed(direction, speed):]
- def [spider_turn_speed(turn, speed):]
- def [spider_move_speed_times(direction, speed, times, unit):]
- def [spider_turn_speed_times(turn, speed, times, unit):]
- def [spider_move_turn(direction, speed, turn, turn_speed):]
- def [spider_stop():]

### [**接口说明**]

#### [**spider_restory()**]

蜘蛛复位

- **返回**
    
    无
    

#### [**spider_move_speed(direction, speed)**]

控制蜘蛛直线前进/后退/左平移/右平移 :param direction: 方向（0：前进；1：后退；2：左平移；3：右平移） :type direction: int :param speed: [0-25] 速度，单位 厘米/秒 :type speed: int

- **返回**
    
    无
    

#### [**spider_turn_speed(turn, speed)**]

控制蜘蛛原地旋转

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [0-60] 速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**spider_move_speed_times(direction, speed, times, unit)**]

控制蜘蛛直线运动x秒/cm后停止

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退；2：左平移；3：右平移）
        
    - **speed** (_int_) – [0-25] 速度，单位 厘米/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；1：表示按厘米运动）
        

- **返回**
    
    无
    

#### [**spider_turn_speed_times(turn, speed, times, unit)**]

控制蜘蛛旋转x秒/度后停止

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [0-60] 速度，单位 度/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；2：表示按度运动）
        

- **返回**
    
    无
    

#### [**spider_move_turn(direction, speed, turn, turn_speed)**]

控制蜘蛛直线运动同时做旋转运动

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退；2：左平移；3：右平移）
        
    - **speed** (_int_) – [0-25] 速度，单位 厘米/秒
        
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **turn_speed** (_int_) – [0-60] 速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**spider_stop()**]

暂停蜘蛛运动

- **返回**
    
    无
    

### [**示例代码**]

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

## [**四足机器人**]

### [**四足机器人概述**]

### [**接口列表**]

- def [dog_restory():]
- def [dog_set_decline_angle(pose, angle):]
- def [dog_move_speed(direction, speed):]
- def [dog_turn_speed(turn, speed):]
- def [dog_move_speed_times(direction, speed, times, unit):]
- def [dog_turn_speed_times(turn, speed, times, unit):]
- def [dog_move_turn(direction, speed, turn, turn_speed):]
- def [dog_perform_action(actionId):]
- def [dog_stop():]
- def [dog_adaption_control(option):]

### [**接口说明**]

#### [**dog_restory()**]

四足狗复位

- **返回**
    
    无
    

#### [**dog_set_decline_angle(pose, angle)**]

设置四足狗倾斜角度

- **参数**
    
    - **pose** (_int_) – 倾斜方向（0：左右倾斜；1：前后倾斜）
        
    - **angle** (_int_) – [-5, 5] 角度，单位 度
        

- **返回**
    
    无
    

#### [**dog_move_speed(direction, speed)**]

控制四足狗前进/后退

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [0-25] 速度，单位 厘米/秒
        

- **返回**
    
    无
    

#### [**dog_turn_speed(turn, speed)**]

控制四足狗原地旋转

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [0-20] 速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**dog_move_speed_times(direction, speed, times, unit)**]

控制四足狗直线运动x秒/cm后停止

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退）
        
    - **speed** (_int_) – [0-25] 速度，单位 厘米/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；1：表示按厘米运动）
        

- **返回**
    
    无
    

#### [**dog_turn_speed_times(turn, speed, times, unit)**]

控制四足狗旋转x秒/度后停止

- **参数**
    
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **speed** (_int_) – [0-20] 速度，单位 度/秒
        
    - **times** (_int_) – [0-360] 持续范围
        
    - **unit** (_int_) – 单位类型（0：表示按秒运动；2：表示按度运动）
        

- **返回**
    
    无
    

#### [**dog_move_turn(direction, speed, turn, turn_speed)**]

控制四足狗直线运动同时做旋转运动

- **参数**
    
    - **direction** (_int_) – 方向（0：前进；1：后退；2：左平移；3：右平移）
        
    - **speed** (_int_) – [0-25] 速度，单位 厘米/秒
        
    - **turn** (_int_) – 方向（2：左转；3：右转）
        
    - **turn_speed** (_int_) – [0-20] 速度，单位 度/秒
        

- **返回**
    
    无
    

#### [**dog_perform_action(actionId)**]

控制四足狗执行特定动作

- **参数**
    
    - **actionId** (_str_) – 动作名称，可选项(crawling 匍匐; squatting 蹲坐; standing 站立; handshake 握手; urination 小便; stretch 伸懒腰)

- **返回**
    
    无
    

#### [**dog_stop()**]

暂停四足狗运动

- **返回**
    
    无
    

#### [**dog_adaption_control(option)**]

启用/禁用自适应功能；四足机器人可根据不同地形调整姿态

- **参数**
    
    **选项** (_bool_) – 开关状态，开为真，关为假
    

- **返回**
    
    无
    

### [**示例代码**]

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


# [**AI 视觉**]

## [**加载模型&卸载模型**]

### [**接口列表**]

- def [load_models(models):]
- def [release_models(models=None):]

### [**接口说明**]

#### [**load_models(models)**]

加载模型，可选多个

- **参数**
    
    **models** (_list_) – 要加载的模型列表，对应关系为：人体姿态: ‘human_pose’, 文字识别: ‘word_recognition’, 颜色识别: ‘color_recognition’, ArpilTag/二维码: ‘apriltag_qrcode’, 表情识别/人脸特征: ‘face_attribute’, 车牌识别: ‘lpd_recognition’, 手势识别: ‘gesture’, 交通识别标识: ‘traffic_sign’, 人脸识别: ‘face_recognition’, 单轨/双轨: ‘line_recognition’
    

- **返回**
    
    是否加载成功 True or False
    

#### [**release_models(models=None)**]

卸载模型

- **参数**
    
    **models** (_list_) – 要卸载的模型列表，参数同load_models的参数。默认为None，如果不传，则卸载所有模型
    

- **返回**
    
    是否卸载成功 True or False
    

## [**二维码&AprilTag**]

### [**接口列表**]

- def [get_qrcode_total_info():]
- def [get_apriltag_total_info():]

### [**接口说明**]

#### [**get_qrcode_total_info()**]

获取二维码信息

- **参数**
    
    **无** –
    

- **返回**
    
    qrcode(str): 二维码内容 center_x(float): 二维码 中心点x center_y(float): 二维码 中心点y height(float): 二维码 高度 width(float): 二维码 宽度 area(float): 二维码 面积
    

- **返回类型**
    
    二维码识别结果 (list) [ [qrcode, center_x, center_y, height, width, area], … ]
    

#### [**get_apriltag_total_info()**]

获取AprilTag信息

- **参数**
    
    **无** –
    

- **返回**
    
    id(int): AprilTag id center_x(float): AprilTag 中心点x center_y(float): AprilTag 中心点y height(float): AprilTag 高度 width(float): AprilTag 宽度 area(float): AprilTag 面积 distance5(float): AprilTag(5x5cm)距离 distance7(float): AprilTag(7x7cm)距离 distance10(float): AprilTag(10x10cm)距离 x(float): AprilTag卡片姿态角度 x y(float): AprilTag卡片姿态角度 y z(float): AprilTag卡片姿态角度 z bearingAngle_h (float): AprilTag卡片横向方位角 bearingAngle_v (float): AprilTag卡片纵向方位角
    

- **返回类型**
    
    AprilTag识别结果 (list) [ [id, center_x, center_y, height, width, area, distance5, distance7, distance10, x, y, z, bearingAngle_h, bearingAngle_v], … ]
    

### [**示例代码**]

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

## [**车牌识别**]

### [**接口列表**]

- def [get_license_plate_total_info():]

### [**接口说明**]

#### [**get_license_plate_total_info()**]

获取车牌信息

- **参数**
    
    **无** –
    

- **返回**
    
    number(str): 车牌号 type(str): 车牌类型（蓝牌/绿牌） center_x(float): 中心点x center_y(float): 中心点y height(float): 高度 width(float): 宽度 area(float): 面积
    

- **返回类型**
    
    车牌识别结果 (list) [ [number, type, center_x, center_y, height, width, area], … ]
    

### [**示例代码**]

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

## [**人体姿态识别**]

### [**接口列表**]

- def [get_pose_total_info():]

### [**接口说明**]

#### [**get_pose_total_info()**]

返回识别到的人体关键点坐标

- **参数**
    
    **无** –
    

- **返回**
    
    姿势识别结果(list) [ [右耳x, y, 右眼x, y, 鼻子x, y, 左眼x, y, 左耳x, y, 右手x, y, 右肘x, y, 右肩x, y, 左肩x, y, 左肘x, y, 左手x, y, 右胯x, y, 左胯x, y, 右膝x, y, 左膝x, y, 右脚x, y, 左脚x, y, ], … ]
    

### [**示例代码**]

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

## [**交通标志识别**]

### [**接口列表**]

- def [get_traffic_total_info():]

### [**接口说明**]

#### [**get_traffic_total_info()**]

获取交通标志识别结果

- **参数**
    
    **无** –
    

- **返回**
    
    sign(str): 交通标志(绿灯, 鸣笛, 左转, 右转, 斑马线, 红灯, 注意儿童, 禁止长时间停车, 进入隧道, 黄灯) center_x(float): 中心点x center_y(float): 中心点y height(float): 高度 width(float): 宽度 area(float): 面积
    

- **返回类型**
    
    交通标志识别结果 (list) [ [sign, center_x, center_y, height, width, area], … ]
    

### [**示例代码**]

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

## [**人脸识别**]

### [**接口列表**]

- def [get_face_recognition_total_info():]
- def [face_recognition_get_all_names():]
- def [face_recognition_delete_name(name):]
- def [face_recognition_add_name(name):]

### [**接口说明**]

#### [**get_face_recognition_total_info()**]

人脸识别结果

- **参数**
    
    **无** –
    

- **返回**
    
    name(str): 姓名（不认识的话则为陌生人） center_x(float): 中心点x center_y(float): 中心点y height(float): 高度 width(float): 宽度 area(float): 面积
    

- **返回类型**
    
    人脸识别结果(list) [ [name, center_x, center_y, height, width, area], … ]
    

#### [**face_recognition_get_all_names()**]

获取所有录入的人脸名称列表

- **参数**
    
    **无** –
    

- **返回**
    
    [name1, name2, …]
    

- **返回类型**
    
    人脸名称列表 (list)
    

#### [**face_recognition_delete_name(name)**]

删除录入的人脸

- **参数**
    
    **name** (_str_) – 人脸名称
    

- **返回**
    
    无
    

#### [**face_recognition_add_name(name)**]

录入人脸

- **参数**
    
    **name** (_str_) – 人脸名称
    

- **返回**
    
    无
    

### [**示例代码**]

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

## [**人脸特征识别**]

### [**接口列表**]

- def [get_face_characteristic_total_info():]

### [**接口说明**]

#### [**get_face_characteristic_total_info()**]

获取人脸特征识别结果

- **参数**
    
    **无** –
    

- **返回**
    
    gender(str): 性别 mask_info(str): 口罩情况 emotion(str): 表情 center_x(float): 中心点x center_y(float): 中心点y height(float): 高度 width(float): 宽度 area(float): 面积
    

- **返回类型**
    
    人脸特征识别结果 (list) [ [gender, mask_info, emotion, center_x, center_y, height, width, area], … ]
    

### [**示例代码**]

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

## [**车道线识别**]

### [**接口列表**]

- def [set_track_recognition_line(line_type):]
- def [get_single_track_total_info():]
- def [get_double_track_total_info():]

### [**接口说明**]

#### [**set_track_recognition_line(line_type)**]

设置当前识别的车道线类型

- **参数**
    
    **line_type** (_int_) – 0: 单轨, 1: 双轨
    

- **返回**
    
    无
    

#### [**get_single_track_total_info()**]

获取单轨识别结果

- **参数**
    
    **无** –
    

- **返回**
    
    offset(int): 单轨偏移量 type(int): 单轨线类型(1 直线, 2 y字路口, 3 十字路口, 0 无线) x(float): 路口坐标x y(float): 路口坐标y
    

- **返回类型**
    
    单轨识别结果(list) [offset, type, x, y]
    

#### [**get_double_track_total_info()**]

获取双轨识别结果

- **参数**
    
    **无** –
    

- **返回**
    
    offset(int): 双轨偏移量 type(int): 双轨线类型(1 直线, 2 路口, 0 无线) x(float): 路口坐标x y(float): 路口坐标y
    

- **返回类型**
    
    双轨识别结果(list) [offset, type, x, y]
    

### [**示例代码**]

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

## [**颜色识别**]

### [**接口列表**]

- def [get_color_total_info():]

### [**接口说明**]

#### [**get_color_total_info()**]

获取颜色识别结果

- **参数**
    
    **无** –
    

- **返回**
    
    color(str): 颜色 shape(str): 形状(小球/方块) center_x(float): 中心点x center_y(float): 中心点y height(float): 高度 width(float): 宽度 area(float): 面积
    

- **返回类型**
    
    颜色识别结果 (list) [color, shape, center_x, center_y, height, width, area]
    

### [**示例代码**]

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

## [**文字识别**]

### [**接口列表**]

- def [get_words_result():]

### [**接口说明**]

#### [**get_words_result()**]

获取文字识别结果

- **参数**
    
    **无** –
    

- **返回类型**
    
    文字识别结果 (str)
    

### [**示例代码**]

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

## [**手势识别**]

### [**接口列表**]

- def [get_gesture_result():]

### [**接口说明**]

#### [**get_gesture_result()**]

获取手势识别结果

- **参数**
    
    **无** –
    

- **返回**
    
    (石头/剪刀/布/ok/点赞)
    

- **返回类型**
    
    手势识别结果 (str)
    

### [**示例代码**]

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

## [**KNN**]

### [**接口列表**]

- def [get_knn_result(model_name):]
- def [knn_train(model_name, label_list):]
- def [knn_rename(src_name, dst_name):]
- def [knn_delete(model_name):]
- def [knn_query():]

### [**接口说明**]

#### [**get_knn_result(model_name)**]

获取本地训练识别结果

- **参数**
    
    **model_name** (_str_) – 训练的模型名称
    

- **返回**
    
    [“分类1”: 分类1的置信度, “分类2”: 分类2的置信度, …]
    
- **返回类型**
    
    本地训练识别结果 (dict)
    

#### [**knn_train(model_name, label_list)**]

训练KNN模型

- **参数**
    
    - **model_name** (_str_) –KNN模型名称
        
    - **label_list** (_list_) – 要训练的标签列表
        

- **返回**
    
    True or False
    

- **返回类型**
    
    Result(bool)
    

#### [**knn_rename(src_name, dst_name)**]

重命名已训练的KNN模型

- **参数**
    
    - **src_name** (_str_) – 修改前的名称
        
    - **dst_name** (_str_) – 修改后的名称
        

- **返回**
    
    True or False
    

- **返回类型**
    
    Result(bool)
    

#### [**knn_delete(model_name)**]

删除已训练的KNN模型

- **参数**
    
    **model_name** (_str_) – 模型名称
    

- **返回**
    
    True or False
    

- **返回类型**
    
    Result(bool)
    

#### [**knn_query()**]

获取受过训练的KNN模型的名单

- **参数**
    
    **None** –
    

- **返回**
    
    Format: { “model_name1”: [“label11”, “label12”, ..], “model_name2”: [“label21”, “label22”, ..] …}, Returns None for no trained models!
    

- **返回类型**
    
    model_list (dict)
    

### [**示例代码**]

```
from ugot import ugot

import time
got = ugot.UGOT()

got.initialize('192.168.8.106')

while True:
    print('-------:',got.get_knn_result('model1'))
    time.sleep(0.5)
```

## [**摄像头**]

### [**接口列表**]

- def [open_camera():]
- def [read_camera_data():]

### [**接口说明**]

#### [**open_camera()**]

打开摄像头

- **返回**
    
    无
    

#### [**read_camera_data()**]

读取摄像机当前帧的数据

- **返回**
    
    the decoded base64 image string (Returns None when no data is obtained)
    

- **返回类型**
    
    data(str)
    

### [**示例代码**]

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

# [**AI 语音**]

## [**音频音效**]

### [**接口列表**]

- def [play_sound(data, wait=False):]
- def [play_sound_upload(data, wait=False):]
- def [play_record(data, wait=False):]

### [**接口说明**]

#### [**play_sound(data, wait=False)**]

播放内置音效

- **参数**
    
    - **data** (_str_) – 待播放内容 动物分类: bear 熊, bird 鸟, chicken 鸡, cow 牛, dog 狗, elephant 大象, giraffe 长颈鹿, horse 马, lion 狮子, monkey 猴子, pig 猪, rhinoceros 犀牛, sealions 海狮, tiger 老虎, walrus 海象 命令分类: complete 完成, cover 掩护, move 移动, received 收到, support 支援, transfiguration 变身, yes 遵命 情绪分类: happy 高兴, yawn 哈欠, snoring 呼噜, surprise 惊讶, actingcute 热泪盈眶, angry 生气, fail 失败, lose 失落, doubt 疑问, nonsense 呓语, cheerful 愉快, come_and_play 歌曲1, flexin 歌曲2, london_bridge 歌曲3, yankee_doodle 歌曲4 机器分类: ambulance 救护车, busy_tone 忙音, carhorn 汽车喇叭, carhorn1 汽车喇叭1, doorbell 门铃, engine 引擎, laser 激光, meebot 小黄人, police_car_1 警车1, police_car_2 警车2, ringtones 来电铃声, robot 机器人, telephone_call 电话呼叫, touch_tone 按键音, wave 电波
        
    - **wait** (_bool, optional_) – 是否阻塞, 默认False, 不阻塞
        

- **返回**
    
    无
    

#### [**play_sound_upload(data, wait=False)**]

播放上传的音频

- **参数**
    
    - **data** (_str_) – 待播放内容，需要加上文件类型后缀
        
    - **wait** (_bool, optional_) – 是否阻塞, 默认False, 不阻塞
        

- **返回**
    
    无
    

#### [**play_record(data, wait=False)**]

播放录音

- **参数**
    
    - **data** (_string_) – 待播放的录音
        
    - **wait** (_bool, optional_) – 是否阻塞, 默认False, 不阻塞
        

- **返回**
    
    无
    

### [**示例代码**]

```
from ugot import ugot

import time
got = ugot.UGOT()

got.initialize('192.168.8.112')
# 播放内置音频
got.play_sound('elephant', True)
```

## [**语音处理**]

### [**接口列表**]

- def [start_audio_asr():]
- def [start_audio_nlp(data, wait=False):]
- def [play_audio_tts(data, voice_type=0, wait=False):]
- def [start_audio_asr_doa(duration=60):]

### [**接口说明**]

#### [**start_audio_asr()**]

启动监听

- **返回**
    
    听到的语音内容 (str)
    

#### [**start_audio_nlp(data, wait=False)**]

监听语音并进行回答NLP

- **参数**
    
    - **data** (_string_) – 问题
        
    - **wait** (_bool, optional_) – True阻塞等待, 默认False, 不阻塞
        

- **返回**
    
    无
    

#### [**play_audio_tts(data, voice_type=0, wait=False)**]

播放TTS语音

- **参数**
    
    - **data** (_string_) – 待播放内容
        
    - **voice_type** (_int_) – 音色(0: 女声, 1: 男声) 默认为0女声
        
    - **wait** (_bool, optional_) – 是否阻塞, 默认False, 不阻塞
        

- **返回**
    
    无
    

#### [**start_audio_asr_doa(duration=60)**]

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
    

### [**示例代码**]

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

## [**声源定位**]

### [**接口列表**]

- def [enable_audio_direction():]
- def [disable_audio_direction():]
- def [get_audio_direction():]

### [**接口说明**]

#### [**enable_audio_direction()**]

开启声源定位

- **返回**
    
    无
    

#### [**disable_audio_direction()**]

关闭声源定位

- **返回**
    
    无
    

#### [**get_audio_direction()**]

获取声源定位方向

- **返回**
    
    (左方/右方/前方/后方)
    

- **返回类型**
    
    声源方向 (str)
    

### [**示例代码**]

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

## [**声音设置**]

### [**接口列表**]

- def [set_volume(volume):]
- def [get_volume():]
- def [stop_audio():]

### [**接口说明**]

#### [**set_volume(volume)**]

设置音量

- **参数**
    
    - **volume** (_int_) – 音量 (0-100)

- **返回**
    
    无
    

#### [**get_volume()**]

获取音量

- **返回**
    
    [volume, isMute]
    
    ```
      :volume(int) 音量值 0-100
      :isMute(bool) 是否静音
    ```
    

- **返回类型**
    
    音量情况 (list)
    

#### [**stop_audio()**]

停止播放声音

- **返回**
    
    无
    

### [**示例代码**]

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