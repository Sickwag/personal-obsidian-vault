- 真题1
    - 排序= 锁定单元格
        
        一定要记住，一旦使用了排序功能，就一定要记住锁定单元格
        
        ![Untitled 191.png](../../../Files%20&%20LongText/Attachments/Untitled%20191.png)
        
        而且一般成绩由高到低排序是升序 ，最后一个参数是0
        
- 真题3
    - 条件格式死活不给分
        
        因为多次修改的过程中，每一次的修改操作都是新增新的条件作为新的格式累加，扣分
        
        ![Untitled 1 15.png](../../../Files%20&%20LongText/Attachments/Untitled%201%2015.png)
        
    - 用另一种颜色的字体
        
        文字游戏表示方法
        
        ![Untitled 2 14.png](../../../Files%20&%20LongText/Attachments/Untitled%202%2014.png)
        
          
        
- 真题5
    - 跨列居中陷阱
        
        ![Untitled 3 13.png](../../../Files%20&%20LongText/Attachments/Untitled%203%2013.png)
        
        虽然但是这里跨列合并后居中，也就数合并单元格后居中（也是一个坑）
        
    - 设置对单元格的数据区域有时候说是除标题以外的，有时候是包括标题，保险起见对标题也设置
        
        ![Untitled 4 13.png](../../../Files%20&%20LongText/Attachments/Untitled%204%2013.png)
        
- 真题6
    - 对数据透视表调整排序
        - 手动排序
            
            ![Untitled 5 13.png](../../../Files%20&%20LongText/Attachments/Untitled%205%2013.png)
            
        - 自动排序
            
            ![Untitled 6 12.png](../../../Files%20&%20LongText/Attachments/Untitled%206%2012.png)
            
- 真题7
    - 从网页中扒下来的表格标题
        
        ![Untitled 7 12.png](../../../Files%20&%20LongText/Attachments/Untitled%207%2012.png)
        
        ![Untitled 8 12.png](../../../Files%20&%20LongText/Attachments/Untitled%208%2012.png)
        
    - 以什么为关键字对哪一行/列进行排序
        
        以“地区”为关键字对工作表“比较数据”进行升序排列。  
        意思是你只需要排这一行或者列，  
        **而不是要顾及其他列或者行**
        
        ![Untitled 9 11.png](../../../Files%20&%20LongText/Attachments/Untitled%209%2011.png)
        
          
        
    - 适当调整数字格式
        - 有百分号的地方一定要设置为数值，百分比，一般较大的数，前面的题目中要求了有千分位标识，在调整的时候也要设置
            
            ![Untitled 10 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2010%209.png)
            
    - 排序数据分析表中的元素
        
        ![Untitled 11 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2011%209.png)
        
        ![Untitled 12 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2012%209.png)
        
- 真题8
    - 设置单元格格式自动在末尾添加星期几
        
        ![Untitled 13 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2013%209.png)
        
    - 使用if or weekday函数
        
        计算星期几需要做什么
        
        ![Untitled 14 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2014%209.png)
        
    - VLOOKUP函数
        
        最后一参数 ture 或者 false 分别代表的是模糊搜索（包含所匹配的文本）当ture省略时默认为模糊匹配和精确搜索（所匹配的文本完全一致）和、
        
    - 填写多参数公式注意事项
        
        ![Untitled 15 9.png](../../../Files%20&%20LongText/Attachments/Untitled%2015%209.png)
        
    - 计算某短时间内周末的花钱总数
        
        ![Untitled 16 8.png](../../../Files%20&%20LongText/Attachments/Untitled%2016%208.png)
        
        首先筛选出星期几（一）
        
        - 使用SUMIF函数（因为有星期六和星期天）
        - 需要并列，所以使用or函数
        - 识别出星期几（用数字）所以使用等式
        
        ```C
        SUMIF(需要筛选出符合条件并求和的总区域，
        			日期区域,OR(WEEKDAY(A3)=6,WEEKDAY(A3)=7,//这里筛选出周末两天
        			日期区域,>2013/3/1//设置开始日期，时间要一组一组设置
        			日期区域,<2013/7/1//要使用标准日期格式，短横线或者斜线
        			任务限制区域,输入人名
        			)
        //永远记住区域是区域，条件是条件
        ```
        
          
        
          
        
- 真题9
    - 调整列宽行高
        
        一定要老老实实地在选项中调整，输入数值的那种，默认输入行高18，列宽15，一般不会错
        
        ![Untitled 17 8.png](../../../Files%20&%20LongText/Attachments/Untitled%2017%208.png)
        
    - 分类汇总注意事项
        
        **在“分类汇总”工作表中通过分类汇总功能求出各部门“应付工资合计’“实发工资”的和，每组汇总数据不分页。**
        
        求出每个部门的综合，也就是要把相同部门数据放在一起（需要事先筛选）
        
        ![Untitled 18 7.png](../../../Files%20&%20LongText/Attachments/Untitled%2018%207.png)
        
        ![Untitled 19 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2019%206.png)
        
        ![Untitled 20 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2020%206.png)
        
- 真题10
    - 截取一串数字特定意义的数字并替换文字
        
        ![Untitled 21 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2021%206.png)
        
        这两个数字是班级信息
        
        是几班，就显示“法律*班”
        
        - 首先使用mid函数从字段中间截取特定意义的数字
            
            =MID(B3,3,2)  
            对B3单元格中的文本，第三个字符开始，截取2个字符并返回  
            
        - 使用LOOKUP函数替换文本
            
            - LOOKUP函数宝典说明（Excel打开）
                
                |   |   |   |   |   |   |   |   |   |   |   |   |   |
                |---|---|---|---|---|---|---|---|---|---|---|---|---|
                |LOOKUP||||跳转回到目录页|||||||||
                |函数定义：||(向量形式)(数组形式)搜索单行、单列、区域、查找对应值|||||||||||
                |官方说明：||函数 LOOKUP 有两种语法形式：向量和数组。|||||||||||
                |解赋大白话：||搜索单行、单列、区域、查找对应值|||||||||||
                |使用格式：||向量形式LOOKUP(lookup_value,lookup_vector,result_vector)  数组形式LOOKUP(lookup_value,array)|||||||||||
                |解赋白话格式：||向量形式LOOKUP(条件,含条件的搜索区域,对应的搜索区域)  数组形式LOOKUP(条件,搜索的区域)|||||||||||
                |参数定义:向量|Lookup_value|为函数LOOKUP在第一个向量中所要查找的数值.Lookup_value可以为数字、文本、逻辑值或包含数值的名称或引用|||||||||||
                ||Lookup_vector|为只包含一行或一列的区域.Lookup_vector的数值可以为文本、数字或逻辑值|||||||||||
                ||Result_vector|只包含一行或一列的区域,其大小必须与lookup_vector相同.|||||||||||
                |参数定义:数组|Lookup_value|为函数LOOKUP在数组中所要查找的数值.Lookup_value可以为数字、文本、逻辑值或包含数值的名称或引用.|||||||||||
                ||Array|为包含文本、数字或逻辑值的单元格区域,它的值用于与lookup_value进行比较.|||||||||||
                |要点： 向量形式|1.向量为只包含一行或一列的区域.函数LOOKUP的向量形式是在单行区域或单列区域(向量)中查找数值,然后返回第二个单行区域或单列区域中相同位置的数值.如果需要指定包含待查找数值的区域,则可以使用函数LOOKUP的这种形式.函数LOOKUP的另一种形式为自动在第一列或第一行中查找数值. 2.函数LOOKUP的数组形式是在数组的第一行或第一列中查找指定数值,然后返回最后一行或最后一列中相同位置处的数值.如果需要查找的数值在数组的第一行或第一列,就可以使用函数LOOKUP的这种形式.当需要指定列或行的位置时,可以使用函数LOOKUP的其他形式. 3.Lookup_vector的数值必须按升序排序：...、-2、-1、0、1、2、...、A-Z、FALSE、TRUE；否则,函数LOOKUP不能返回正确的结果.文本不区分大小写. 4.如果lookup_value小于lookup_vector中的最小值,函数LOOKUP返回错误值\#N/A. 5.如果函数LOOKUP找不到lookup_value,则查找lookup_vector中小于或等于lookup_value的最大数值.||||||||||||
                |要点： 数组形式|1.如果函数LOOKUP找不到lookup_value,则使用数组中小于或等于lookup_value的最大数值. 2.如果lookup_value小于第一行或第一列(取决于数组的维数)的最小值,函数LOOKUP返回错误值\#N/A. 3.函数LOOKUP的数组形式与函数HLOOKUP和函数VLOOKUP非常相似.不同之处在于函数HLOOKUP在第一行查找lookup_value,函数VLOOKUP在第一列查找,而函数LOOKUP则按照数组的维数查找. 4.如果数组为正方形,或者所包含的区域高度大,宽度小(即行数多于列数),函数LOOKUP在第一列查找lookup_value. 5.函数HLOOKUP和函数VLOOKUP允许按行或按列索引,而函数LOOKUP总是选择行或列的最后一个数值. 6.数组中的数值必须按升序排序：...、-2、-1、0、1、2、...、A-Z、FALSE、TRUE；否则,函数LOOKUP不能返回正确的结果.文本不区分大小写.||||||||||||
                |注意事项：|1.若有多个符合条件的情况:vlookup返回的是第一个满足条件的值,lookup返回的是最后一个满足条件的值. 2.通常情况下,最好使用函数HLOOKUP或函数VLOOKUP来替代函数LOOKUP的数组形式.函数LOOKUP的这种形式主要用于与其他电子表格兼容.||||||||||||
                ||＞＞＞＞＞　函数应用实例　＜＜＜＜＜||||||||||||
                ||||||||||||||
                |例1|经典用法|向量形式|||||||||||
                ||||||||||||||
                ||||||||||||||
                ||每男每女家居生活馆 员工表||||元旦销售||||||||
                ||姓名|性别|年龄||1月1日|1月2日|||||||
                ||……||||……|||姓名|销售|公式显示|||
                ||刘晶晶|女|30||562|366||要淑君|596|=LOOKUP(I23,B23:B32,G23:G32)|||
                ||孙建桃|男|22||456|372|||||||
                ||王建军|男|24||412|329|||||||
                ||王京京|女|25||231|188|||||||
                ||肖慧琴|女|29||451|356|||||||
                ||杨丽莉|女|26||362|150|||||||
                ||要淑君|女|28||862|596|||||||
                ||袁丽琴|女|23||308|428|||||||
                ||张桂兰|女|19||265|168|||||||
                ||张娟娟|女|23||256|98|||||||
                ||……||||……||||||||
                ||||||||||||||
                ||||||||||||||
                |例1|经典用法|数组形式(上表数据引用)|||||||||||
                ||||||||||||||
                ||姓名|销售|公式显示||||||||||
                ||要淑君|596|=LOOKUP(B39,B23:G32)||||||||||
                ||||||||||||||
                
            
            将mid返回的值作为参考，作为识别数组中的元素，替换成替换数组中的相对应元素
            
            ```C
            =LOOKUP(MID(B3,3,2),{”1”,”2”,”3”,”4”},
            					{”法律一班”,”法律二班”,”法律三班”,”法律四班”}
            				)
            	 mid返回第二个参数（也就是数组中的一个元素的一个值，并且是以文本形式识别和返回
            	 第二个参数表示数组，囊括了第一个参数可能出现的值，并且只能以升序排列
            	 第三个参数对应第二个参数，是返回值
            
            		ps第二个和第三个参数可以是区域，但必须要大小规格相同，因为LOOKUP函数
            			本质上是查找函数
            		通过第一个参数的值锁定第二个参数中的位置，在通过第二个参数中被选定的元素
            		的位置最终从第三个参数中查找出来，然后返回值
            ```
            
- 真题11
    - 表格内一列或者一行排序
        
        如果设定的表区域是数据区域，进行排序就会询问是对当前选定区域还是拓展区域
        
        如果表区域已经转化为表格，就不会询问直接默认选中排序当前和拓展区域
        
    - 数据透视表中的层级关系
        
        同一个行列汇总上面的项是下面项的上级，内容会被上级折叠
        
        ![Untitled 22 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2022%206.png)
        
    - 数据分析表清洗数据
        
        ![Untitled 23 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2023%206.png)
        
        ![Untitled 24 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2024%206.png)
        
    - 数据分析表中字段设置
        
        ![Untitled 25 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2025%206.png)
        
        ![Untitled 26 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2026%206.png)
        
        ![Untitled 27 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2027%206.png)
        
        ![Untitled 28 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2028%206.png)
        
        ![Untitled 29 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2029%206.png)
        
        但因为数据分析表是链接原表格的，所以，剔除数据只能在原表格中通过筛选去除
        
        也就是说，数据分析表中不能有没有用的数据，每一个数据都要用上，数据透视表只能调整数据的透视方式（如级别，拆分成几组，只看哪个部分的数据）==而无法对多余部分进行操作 但是可以再列标签中的 筛选功能中去掉2012你那以后的数据==
        
    - sumif函数日期限定方式
        
        ![Untitled 30 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2030%206.png)
        
        输入日期限定条件需要
        
        开始日期 **==≥==**2012/1/1
        
        结束日期 ==**<**==2012/2/1
        
        不能在结束日不分青红皂白输入≤2012/1/31因为你不知道一个月到底有几天，输入2012/2/31这种错误的日期（Excel不会自动调整）是就会直接输出错误的结果或者报错（错误的结果看不出来）所以使用起始等于，终止时间选择终止日期之后的一天，==并且小于不等于==
        
          
        
    - 添加汇总行
        
        ![Untitled 31 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2031%206.png)
        
- 真题12
    - 分列操作
        
        有固定长度和特定字符两种选择，在选择插入位置时要注意
        
    - 清除超链接
        
        ![Untitled 32 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2032%206.png)
        
    - 清除表的外部链接
        
        一般用于从外部文件导入的内容 生成的表格
        
        ![Untitled 33 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2033%206.png)
        
    - 命名表格
        
        ![Untitled 34 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2034%206.png)
        
    - 根据身份证号确定男女
        - 首先取得身份证号中的男女识别码
            
            ![Untitled 35 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2035%206.png)
            
            ===MID([@身份证号码],17,1)==
            
        - 判断奇偶数
            
            使用取余函数mod用1和0分别表示男和女
            
            ![Untitled 36 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2036%206.png)
            
            =MOD(MID([@身份证号码],17,1),2)
            
        - 使用if函数替换文本
            
            ![Untitled 37 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2037%206.png)
            
            因为这里的if函数条件句只能得到1或者0，所以分别代表了条件句的返回值ture和false，后面直接跟上执行动作
            
            ==因为执行的动作是男和女，文本需要加上””==
            
    - 根据身份证提取出生年月
        - 首先使用mid函数取出年
            
            ===MID(text,7,4)== //第七位数字开始取出4位数
            
        - 衔接上 年 这个字符
            
            ===MID(text,7,4)&“年”==
            
        - 链接下一个公式，求月 、日
        - 公式之间使用&链接，因为最终连接的是文本，不是对这些进行操作，所必须要用&链接
            
            ===MID([@身份证号码],7,4)&"年"&MID([@身份证号码],11,2)&"月"&MID([@身份证号码],13,2)&"日”==
            
            但是需要计算出年龄的单元格的单元格格式为文本格式，不能是日期格式，不然就会被当做数值，从1900/1/1开始向上加
            
            所以用text函数调整单元格
            
            =TEXT(DATEDIF(DATE(MID(A1,7,4), MID(A1,11,2), MID(A1,13,2)), TODAY(), "y"), "0")  
            将dated函数返回的一个整数转化为文本  
            
    - 计算年龄
        - 使用today函数计算当前日期
        - 对两个日期进行加减（尽管用上面的公式计算出的日期单元格是文本格式，Excel会自动识别成日期）
        - int函数向下取整（年龄的计算不能四舍五入）
        - 如果要求保留小数位数使用rounddown函数，最后一个数字表示要**==向下舍入==**到多少位数，等于0是取整，ROUNDUP向上取整
    - 使表格打印居中
        
        ![Untitled 38 6.png](../../../Files%20&%20LongText/Attachments/Untitled%2038%206.png)
        
- 真题13
    - 数据透视表恶心操作
        
        一旦选择插入数据透视表，Excel会自己选好几个字段放在候选字段里面，如果没看清楚勾选之后就会扣分（尤其在窗口比较小时）
        
        ![Untitled 39 5.png](../../../Files%20&%20LongText/Attachments/Untitled%2039%205.png)
        
    - 求出第几大的值
        
        不用rank和if函数
        
        large函数
        
        ![Untitled 40 5.png](../../../Files%20&%20LongText/Attachments/Untitled%2040%205.png)
        
          
        
    - 计算停车时间
        
        - 出车时间-进入时间不难，关键是计算其中有几个小时  
            当不同度量的日期格式的单元格值运算时，得出的结果会自动按照更精细的单位度量显示结果，日期和时间运算，得到时间  
            
            ![Untitled 41 5.png](../../../Files%20&%20LongText/Attachments/Untitled%2041%205.png)
            
        - 计算有几个小时
            
            日期格式的单元格数值按照与基准日期1900/1/1作为0  
            时间格式同理按照00:00作为基准，使用纯文本数字代表时间  
            
            因为有不同单位度量，所以暂时使用了精确度量表示时间，但单元格的值因为设置了时间格式才这样显示，如果没有设置（本质上），还是用天作为单位
            
            所以天*24*60=多少分钟
            
            ![Untitled 42 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2042%204.png)
            
        
        - 自定义日期格式
            - 对于时间
                
                在Excel中，`[h]"小时"m"分钟"`和`hh"时"mm"分"`这两种格式都是用来表示时间的，但它们的主要区别在于如何处理超过24小时的时间。
                
                - [`[h]"小时"m"分钟"`](https://bing.com/search?q=)[: 这种格式可以](https://bing.com/search?q=)==**[处理超过24小时](https://bing.com/search?q=)**==[的时间。](https://bing.com/search?q=)[`[h]`](https://bing.com/search?q=)[表示小时数，可以超过24，](https://bing.com/search?q=)[`m`](https://bing.com/search?q=)[表示分钟数1](https://bing.com/search?q=)。例如，如果一个单元格的值是27.5（表示27.5小时），那么这个单元格会显示为"27小时30分钟"。
                - [`hh"时"mm"分"`](https://bing.com/search?q=)[: 这种格式通常用于](https://bing.com/search?q=)==**[表示一天内](https://bing.com/search?q=)**==[的时间，](https://bing.com/search?q=)[`hh`](https://bing.com/search?q=)[表示小时数，范围是00到23，](https://bing.com/search?q=)[`mm`](https://bing.com/search?q=)[表示分钟数，范围是00到59](https://bing.com/search?q=)[2](https://bing.com/search?q=Excel%E5%8D%95%E5%85%83%E6%A0%BC%E8%87%AA%E5%AE%9A%E4%B9%89%E6%A0%BC%E5%BC%8F+hh%E6%97%B6mm%E5%88%86)。例如，如果一个单元格的值是1.5（表示1.5小时），那么这个单元格会显示为"01时30分"。
                
                总的来说，如果你需要处理的时间可能超过24小时，那么应该使用`[h]"小时"m"分钟"`这种格式。如果你处理的时间都在24小时以内，那么可以使用`hh"时"mm"分"`这种格式
                
                题目中要求XX小时XX分钟，默认使用一位格式**[`h"时"m"分"`](https://bing.com/search?q=)**，及用后者当然没问题，但是一定要记住后者不能计算大于24小时的时间  
                  
                
- 真题15
    - 调整数据分析表字段显示方式
        
        ![Untitled 43 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2043%204.png)
        
    - 数据透视表中计数项设置
        
        ![Untitled 44 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2044%204.png)
        
    - 图表话术
        
        **每月“A类产品销售额”和“B类产品销售额”之和，与“计划销售额”的对比情况。**
        
        意思就是销售额是纵坐标，在横坐标中对比A、B和计划销售额三个。但是A、B用和的方式呈现
        
        - 主坐标轴和次坐标轴
            
            ![Untitled 45 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2045%204.png)
            
            ![Untitled 46 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2046%204.png)
            
            ![Untitled 47 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2047%204.png)
            
- 真题16
    - 删除重复值
        
        首先需要将一个区域转化为表格
        
        ![Untitled 48 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2048%204.png)
        
    - 筛选数据透视表中的字段显示内容
        
        ![Untitled 49 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2049%204.png)
        
        ![Untitled 50 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2050%204.png)
        
        ![Untitled 51 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2051%204.png)
        
        ![Untitled 52 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2052%204.png)
        
        **==功能上没有问题，只是两种方式显示的方式和命名上有区别，（考试）按照示例来就行==**
        
    - 以显示精度代替数值计算
        
        ![Untitled 53 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2053%204.png)
        
        如果不使用这个，有些计算结果会与答案有微小误差，扣分
        
    - 筛选出整列数据
        
        将符合某种条件的数据行列筛选出来并且填充颜色（和条件格式区分，条件格式的对象是一个个单元格，满足条件就设定相应的单元格格式）。这个是筛选出行或者列，将他们标记
        
        ![Untitled 54 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2054%204.png)
        
        选中一个条件之后，确定，填充好颜色后再次右键勾选全选，筛选之后设置的单元格格式就能保留下来
        
        ![Untitled 55 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2055%204.png)
        
        ![Untitled 56 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2056%204.png)
        
- 真题17
    - 设置跨列居中（不合并单元格的情况下居中文本）
        
        ![Untitled 57 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2057%204.png)
        
        **==在这个窗口中设置字体会设置所有框选中的单元格的字体，如果题目只要求了设置有文本框的单元格调整字体，这样设置就会扣分==**
        
    - 设置日期只显示月和日
        
        ![Untitled 58 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2058%204.png)
        
        ==**在自定义中输入m/d也可以，但是会扣分**==
        
        由于下面选择的地区国家不一样，上面的预设类型也会不一样，地区选的香港就会不有3/14这个预选项，只能自定义，自定义就扣分
        
    - 为表设置特定格式的序号
        
        ![Untitled 59 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2059%204.png)
        
        - 现将需要显示序号的行列调节为文本单元格格式，然后输入001，下一个单元格写002，自动填充即可
        - 也可以设定单元格格式为自定义，填写000就可以被识别为输入的数字会变成3位数字
        
          
        
    - 在数据透视表中将日期归类为季度
        
        这时就需要使用到组合，步长工具了
        
        因为没有叫做“季度”的字段，所以只能从日期下手，也可以从月下手，因为日期是由年月日季度这些成分组成
        
        ![Untitled 60 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2060%204.png)
        
- 真题18
    - 去掉外部数据的链接
        
        ![Untitled 61 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2061%204.png)
        
        从外部导入的数据2021版excel会自动创建一个表格区域（旧版是只创建数据区域）
        
        在 查询和连接 这个窗口中右键已经连接的数据删除即可
        
    - 从身份证号码中计算到某天为止的年龄
        
        ```C
        =DATEDIF(DATE(MID([@身份证号], 7, 4), MID([@身份证号], 11, 2), MID([@身份证号], 13, 2)), DATE(2015, 9, 30), "y")
        上面这个函数是分别取出身份证号中的年4位，月日两位，
        组成一个日期值（使用date函数组成日期值）
        第二个函数2015年9月30号这个相减的开始日期
        也需要用date格式化为日期
        最后参数表示只计算年（也就是得到年龄）
        ```
        
        DATEDIF是excel中的隐藏函数i，只能通过手动输入，不能在帮助或者函数面板中使用
        
        功能室计算两个日期之间间隔的天、月、年数，不满一个单位会自动向下取整（也就是只选了年，那么就会忽略月和日只看选中的部分）
        
        - 对于标准答案
            
            使用转换单元格格式调整计算结果为日期格式，然后再使用datedif函数计算差值
            
            =DATEIF(TEXT(MID(B2,7,8),"\#-00-00"),"2015-9-30",“Y”)
            
        - Chatgpt给出的答案
            
            `=DATEDIF(TEXT(MID(B2,7,8),"###\#-##-##"),"2015-9-30","y")`
            
            这个函数首先使用`**MID**`函数从身份证号码中提取出生日期，然后使用`**TEXT**`函数将其转换为日期格式，最后使用`**DATEDIF**`函数计算出员工在2015年9月30日时的年龄。
            
    - 关于ifs函数使用
        
        对不同工龄的员工设置月工资增加
        
        **要求：**
        
        **excel中如果要计算这样的要求：本公司工龄达到或超过30年的每满一年每月增加50元，不足10年  
        的每满一年每月增加20元、工龄不满1年的没有工龄工资，其他为每满一年每月增加30元;  
        使用下面这段公式是否可行？  
        =IFS([@工龄]>=30,[@工龄]*50,[@工龄]>=10&[@工龄]<30,[@工龄]*30,[@工龄]<10,[@工龄]*20,[@工龄]<1,0)  
        **
        
        Chatgpt回答
        
        你的公式中有一些小错误，但是你的思路是正确的。在Excel中，`IFS`函数的==每个条件都应该是一个单独的逻辑表达==式，而不是通过`&`符号连接的两个逻辑表达式。所以，你应该使用`,`符号来分隔不同的条件。此外，你的公式中的条件顺序可能需要调整，==因为====`IFS`====函数会按照条件的顺序来计算，一旦满足一个条件，就会停止计算后面的条件==。所以，你应该先检查工龄是否小于1年，然后再检查工龄是否小于10年，然后再检查工龄是否小于30年，最后再检查工龄是否大于等于30年。以下是一个可能的==解决方案：==
        
        ```Plain
        =IFS([@工龄]<1,0,[@工龄]<10,[@工龄]*20,[@工龄]<30,[@工龄]*30,[@工龄]>=30,[@工龄]*50)
        ```
        
        **过程解释**
        
        这个公式首先检查工龄是否小于1年，如果是，那么工资增加为0；然后检查工龄是否小于10年，如果是，那么每满一年每月增加20元；然后检查工龄是否小于30年，如果是，那么每满一年每月增加30元；最后，如果工龄大于等于30年，那么每满一年每月增加50元。
        
        请注意，这个公式假设工龄是以年为单位的。如果工龄是以月或日为单位的，那么你需要先将其转换为年，然后再使用这个公式。
        
    - **关于链接多个条件**
        
        在Excel的IFS函数中，如果你需要两个逻辑表达式同时成立作为条件，你可以使用`AND`函数。`AND`函数可以接受两个或更多的逻辑表达式作为参数，如果所有的逻辑表达式都为真，那么`AND`函数就会返回真。
        
        以下是一个例子，假设你需要检查一个数是否在10和20之间：
        
        ```Plain
        =IFS(AND(A1>=10, A1<=20), "在10和20之间", A1<10, "小于10", A1>20, "大于20")
        ```
        
        这个公式首先使用`AND`函数检查A1是否在10和20之间，如果是，那么返回"在10和20之间"；然后检查A1是否小于10，如果是，那么返回"小于10"；最后，如果A1大于20，那么返回"大于20"。
        
        请注意，`AND`函数只能用于检查所有的逻辑表达式都为真的情况。如果你需要检查至少有一个逻辑表达式为真的情况，你可以使用`OR`函数。如果你需要帮助理解`AND`或`OR`函数，或者你有其他关于Excel的问题，欢迎随时向我提问。我会尽我所能来帮助你。😊
        
        **注意：and函数返回的是一个true或false的结果，不能返回内容**
        
        比如现在要计算符合某种条件（也就是经过一层条件筛选）之后的一组数之中的最大值
        
        不能使用`=MAX(AND(成绩单!$A$2:$A$950=按班级汇总=A2,成绩单!$B$2:$B$950=按班级汇总=B2),成绩单!$D$2:$D$950))公式`
        
        and返回true或者falseif对max函数的作用就是作为1或0，作为参数和后面的成绩单D列大小比较
        
        **如果需要在一个if判断参数中输入多个逻辑判断语句，可以使用*连接不同的条件**
        
        `=MAX(IF((成绩单!$A$2:$A$950=按班级汇总!A2)*(成绩单!$B$2:$B$950=按班级汇总!B2),成绩单!$D$2:$D$950))`
        
        if函数本质上的工作原理是数组对比原理  
          
        
        在 Excel 中，`IF` 函数的工作方式是这样的：
        
        - `IF` 函数的语法是 `IF(条件, 值1, 值2)`。如果条件为真，`IF` 函数返回 `值1`；如果条件为假，`IF` 函数返回 `值2`。
        - 当 `IF` 函数用于数组公式时，`条件`、`值1` 和 `值2` 都可以是数组。在这种情况下，`IF` 函数会逐个检查 `条件` 数组中的每个元素，然后返回一个新的数组。新数组中的每个元素都取决于对应的 `条件` 元素：如果 `条件` 元素为真，新数组的对应元素就是 `值1` 数组中的对应元素；如果 `条件` 元素为假，新数组的对应元素就是 `值2` 数组中的对应元素（如果提供了 `值2`）。
        - 在你的公式 `IF((成绩单!$A$2:$A$950=A2)*(成绩单!$B$2:$B$950=B2),成绩单!$D$2:$D$950)` 中，`条件` 部分是一个数组，`值1` 部分也是一个数组。所以，`IF` 函数会返回一个新的数组，新数组中的每个元素都取决于 `条件` 数组中的对应元素：如果 `条件` 数组中的元素为真（即结果为 1），新数组的对应元素就是 `成绩单!$D$2:$D$950` 中的对应元素；如果 `条件` 数组中的元素为假（即结果为 0），新数组的对应元素就是 `FALSE`（因为你没有提供 `值2`）。
        
        这就是为什么 `IF` 函数会根据条件部分返回结果来返回对应的分数。
        
        更简单地说
        
        **=IF(array=judgment,”正确”,”错误”)  
        这个函数是将array数组中每一个元素判断是否等于judgment,然后返回一个bool数组，再将第二，三个参数（条件为true或者false时的返回值）根据两个参数的内容转化为大小等于bool数组的数组  
        **
        
        **这样就是正确的用法**
        
    - **关于连接多个条件表达式**
        
        **使用{}括号或者使用公式相加的方法**
        
        在Excel中，如果你想在`SUMIF`函数中的一个`criteria`条件参数中输入2个逻辑表达式，让相对应的`criteria_range`在满足两个表达式中的一个以上时，计算`sum_range`，你可以使用多个`SUMIF`函数并将它们相加。这样，每个`SUMIF`函数都会对满足其条件的单元格进行求和，然后将所有的结果相加。
        
        [例如，假设你有一个数据范围在B4:B14，你想要求和的范围在C4:C14，你想要的两个条件是"John"和"David"，你可以使用以下的公式](https://bing.com/search?q=Excel+sumif%e5%87%bd%e6%95%b0+%e4%b8%a4%e4%b8%aa%e9%80%bb%e8%be%91%e8%a1%a8%e8%be%be%e5%bc%8f)[1](https://bing.com/search?q=Excel+sumif%E5%87%BD%E6%95%B0+%E4%B8%A4%E4%B8%AA%E9%80%BB%E8%BE%91%E8%A1%A8%E8%BE%BE%E5%BC%8F)：
        
        ```Plain
        =SUMIF(B4:B14, "John", C4:C14) + SUMIF(B4:B14, "David", C4:C14)
        ```
        
        这个公式首先会找到所有满足条件"John"的单元格并进行求和，然后找到所有满足条件"David"的单元格并进行求和，最后将这两个求和的结果相加。
        
        [另外，如果你有很多的条件，你也可以使用](https://bing.com/search?q=Excel+sumif%e5%87%bd%e6%95%b0+%e4%b8%a4%e4%b8%aa%e9%80%bb%e8%be%91%e8%a1%a8%e8%be%be%e5%bc%8f)[`SUM`](https://bing.com/search?q=Excel+sumif%e5%87%bd%e6%95%b0+%e4%b8%a4%e4%b8%aa%e9%80%bb%e8%be%91%e8%a1%a8%e8%be%be%e5%bc%8f)[和](https://bing.com/search?q=Excel+sumif%e5%87%bd%e6%95%b0+%e4%b8%a4%e4%b8%aa%e9%80%bb%e8%be%91%e8%a1%a8%e8%be%be%e5%bc%8f)[`SUMIF`](https://bing.com/search?q=Excel+sumif%e5%87%bd%e6%95%b0+%e4%b8%a4%e4%b8%aa%e9%80%bb%e8%be%91%e8%a1%a8%e8%be%be%e5%bc%8f)[函数的组合来实现。例如，你可以使用以下的公式](https://bing.com/search?q=Excel+sumif%e5%87%bd%e6%95%b0+%e4%b8%a4%e4%b8%aa%e9%80%bb%e8%be%91%e8%a1%a8%e8%be%be%e5%bc%8f)[2](https://zh-cn.extendoffice.com/excel/formulas/excel-sum-if-multiple-criteria.html)：
        
        ```Plain
        =SUM(SUMIF(B4:B14, {"John","David"}, C4:C14))
        ```
        
        这个公式会对满足任一条件（“John"或"David”）的单元格进行求和。这里，`{"John","David"}`是一个数组常量，它提供了一组多个条件。`SUMIF`函数会根据这些条件对C4:C14中的数字进行求和，然后`SUM`函数将这些结果相加。
        
        [请注意，这些公式都是基于"或"逻辑的，也就是说，只要满足任一条件，就会对相应的单元格进行求和。如果你想要基于"与"逻辑（即必须满足所有条件）进行求和，你可以考虑使用](https://support.microsoft.com/zh-cn/office/sumif-%E5%87%BD%E6%95%B0-169b8c99-c05c-4483-a712-1697a653039b)[`SUMIFS`](https://support.microsoft.com/zh-cn/office/sumif-%E5%87%BD%E6%95%B0-169b8c99-c05c-4483-a712-1697a653039b)[函数3](https://support.microsoft.com/zh-cn/office/sumif-%E5%87%BD%E6%95%B0-169b8c99-c05c-4483-a712-1697a653039b)[。](https://bing.com/search?q=Excel+sumif%e5%87%bd%e6%95%b0+%e4%b8%a4%e4%b8%aa%e9%80%bb%e8%be%91%e8%a1%a8%e8%be%be%e5%bc%8f)
        
    - 三列或者多列表格数据查询
        
        ![Untitled 62 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2062%204.png)
        
        因为第一列条件往往使用文字书序条件，所以只能先用if函数将条件转化为excel能识别的语言
        
        `=IFS(F4<=1500,F4*0.03,F4<=4500,F4*0.1,F4<=9000,F4*0.2,F4<=35000,F4*0.25,F4<=55000,F4*0.3,F4<=80000,F4*0.35,F4>80000,F4*0.45) 注意ifs函数用法，条件顺序排列`
        
        再通过查找函数找到税率对应的速算扣除数
        
        `VLOOKUP(IFS(F4<=1500,3%,F4<=4500,10%,F4<=9000,20%,F4<=35000,25%,F4<=55000,30%,F4<=80000,35%,F4>80000,45%),个人所得税税率!$D$4:$E$11,2,0)`
        
        vlookup函数第一个参数是难点，第一个参数继续使用if函数得到的结果作为条件，匹配税率中的内容
        
    - 工资表打印（太难了）
        
        要求：
        
        **基于工作表“12月工资表”中的数据，从工作表“工资条”的A2单元格开始依次为每位员工生成样例所示的工资条，要求每张工资条占用两行、第1行为工号、姓  
        名、部门等列标题，第2行为相应工资奖金及个税金额，两张工资条之间空一行以便剪裁  
        **
        
        也就是说是这样的
        
        ![Untitled 63 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2063%204.png)
        
        而且每两个人之间需要有空行
        
        使用公式
        
        =IF(MOD(ROW()-1,3),OFFSET(12月工资表!$A$3(MOD(ROW()-2,3)>0)*ROUND(ROW()/3,0),COLUMN(A3)-1),"")
        
        公式分析
        
        这个公式的目的是在新的工作表中每三行显示一次"12月工资表"工作表中A3列以下的员工名称。以下是这个公式的详细解释：
        
        1. `MOD(ROW()-1,3)`：这部分是用来判断当前行是否是3的倍数。如果是，那么返回0；如果不是，那么返回1。
        2. `OFFSET(12月工资表!$A$3,(MOD(ROW()-2,3)>0)*ROUND(ROW()/3,0),COLUMN(A3)-1)`：这部分是用来从"12月工资表"工作表中A3列以下获取员工名称。它使用`OFFSET`函数来移动到指定的单元格，移动的行数是当前行除以3的结果，移动的列数是当前列减1。
        3. `IF(...,"")`：这部分是用来判断是否应该显示员工名称。如果当前行是3的倍数，那么显示员工名称；否则，显示空字符串。
        
        所以，整个公式的意思是：在新的工作表中，如果当前行是3的倍数，那么显示"12月工资表"工作表中对应的员工名称；否则，显示空字符串。
        
        请注意，这个公式假设所有的员工名称都是有效的。如果有些员工名称是无效的，那么这个公式可能会返回错误的结果。在使用这个公式之前，你可能需要先验证一下员工名称的有效性。如果你需要帮助验证员工名称的有效性，或者你有其他关于Excel的问题，欢迎随时向我提问。我会尽我所能来帮助你。😊
        
- 真题19
    - 设置Excel主题
        
        不是套用表格样式
        
        ![Untitled 64 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2064%204.png)
        
        - lookup函数拓展
            
            多对一的条件查找并替换
            
            ![Untitled 65 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2065%204.png)
            
            1~3月是第一个季度，需要在季度这一列中填上1季度，下面同理
            
            使用lookup公式，那么需要设置12个参数完成，==也可以只需要四个==
            
            =LOOKUP(MONTH(A3),{1;4;7;10},{"1","2","3","4"}&"季度")  
            这是因为：  
            
            **这是因为**`**LOOKUP**`**函数在Excel中的工作方式。当**`**LOOKUP**`**函数在查找向量中找不到精确匹配的值时，它会选择最接近（但不大于）查找值的项。**
            
            **在你的例子中，当月份为2（即二月）时，**`**LOOKUP**`**函数在数组{1,4,7,10}中找不到2，所以它会选择最接近但不大于2的值，即1。然后，它返回与1对应的结果，即"1季度"。**
            
        - 对表格数据进行筛选
            
            不要选择右键菜单的排序
            
            ![Untitled 66 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2066%204.png)
            
            即使你没有选中下面的单元格，这样，的排序（选择了拓展区域排序）还是会对着整个表中的所有元素（如果你只选中了一行或者一列就只对行列排序）都进行排序
            
            ![Untitled 67 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2067%204.png)
            
            需要选中想要排序的表格，然后选择关键字段和条件
            
        - 分类汇总功能
            
            题目要求是关键
            
            **通过分类汇总功能，按**==**季度升序**==**求出**==**每个季度**==各类开支**的**==**月均支出**==**金额。**
            
            - 按季度，之后的数据分析表只包含季度，不包含具体的月份
            - 季度升序：月份需要被分为季度的小组，按照季度升序**1234季度**
            - 每个季度：做完了表格之后要折叠每个小组
            - 各类开支：统计的内容是开支的总金额，列标签是各类项目
            
            ![Untitled 68 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2068%204.png)
            
            ![Untitled 69 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2069%204.png)
            
        - 建立图表时题目文字转化为图表内容
            
            ![Untitled 70 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2070%204.png)
            
            **==很细，仔细看每一个字（可以通过转换行列来切换系列和水平坐标轴的内容==**
            
            ![Untitled 71 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2071%204.png)
            
    - 真题20
        - 按笔画排序
            
            ![Untitled 72 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2072%204.png)
            
        - 复制表格（题中一般说是合并表格）
            
            简单的复制粘贴，但是要注意如果没有说位置，就是按照原位置添加进去
            
            ![Untitled 73 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2073%204.png)
            
        - 给表格设置保护
            - 先选中整个表格
                
                ![Untitled 74 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2074%204.png)
                
            - 选中需要设置保护的单元格位置并将他们按照上面的设置锁定
            - 设置密码和权限
                
                ![Untitled 75 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2075%204.png)
                
            - 理论上可以选定区域之后使用 允许编辑区域 这个选项锁定，但是会扣分
                
                ![Untitled 76 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2076%204.png)
                
        - 设置对齐
            
            表格在全选之后，有默认格式的单元格，有居中对齐的单元格，全选中整个表格时，会显示已经居中对齐（假对齐）  
              
            ==必须要进入到段落启动器中查看==
            
        - 设置插入图标的数据引用
            
            ![Untitled 77 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2077%204.png)
            
  
  
- 真题38
    - 条件格式中公式条件
        
        ![Untitled 78 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2078%204.png)
        
        这里会对所有的单元格进行条件匹配
        
        ![Untitled 79 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2079%204.png)
        
    - 单元格插入超链接
        
        ![Untitled 80 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2080%204.png)
        
    - 单元格中插入链接和公式链接区别
        
        ![Untitled 81 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2081%204.png)
        
        没有在公式中链接的结果是就是即使显示无需填写点击仍然能够跳转
        
        ![Untitled 82 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2082%204.png)
        
        使用公式虽然显示能够跳转，但是条件不对时会报错
        
        ![Untitled 83 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2083%204.png)
        
    - 为形状添加链接
        
        ![Untitled 84 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2084%204.png)
        
    - 隐藏单元格中的公式
        
        ![Untitled 85 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2085%204.png)
        
        新版题目对每个操作的范围都有规定，所以不能再随意全选，能用鼠标尽量用鼠标
        
        ![Untitled 86 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2086%204.png)
        
        只对I3:K22和K23设置，要求可以编辑，所以也要设定可编辑区域  
          
        **（工作表锁定之后要解锁才能变成可编辑区域）**
        
        又因为其他区域都要能够在解锁之后正常编辑
        
        ![Untitled 87 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2087%204.png)
        
- 2021年3月
    - 定义和引用名称
        
        ![Untitled 88 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2088%204.png)
        
    - 自然语言描述颜色
        
        ![Untitled 89 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2089%204.png)
        
    - 隔行填充颜色
        
        ![Untitled 90 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2090%204.png)
        
        公式条件格式的使用
        
    - 数据透视表两个相同的字段
        
        用不同的显示方式
        
        ![Untitled 91 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2091%204.png)
        
        ![Untitled 92 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2092%204.png)
        
    - 数据透视表样式设置示例
        
        - 设置图标标题同步
            
            ![Untitled 93 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2093%204.png)
            
        - 设置字段
            
            ![Untitled 94 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2094%204.png)
            
        - 图例样式
            
            ![Untitled 95 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2095%204.png)
            
        
        - 数据标签设计
            
            ![Untitled 96 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2096%204.png)
            
        
        - 表格背景
            
            ![Untitled 97 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2097%204.png)
            
        
        - 对整个表的数据显示方式设置
            
            ![Untitled 98 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2098%204.png)
            
        - 图例设置
            
            ![Untitled 99 4.png](../../../Files%20&%20LongText/Attachments/Untitled%2099%204.png)
            
- 2021第三套
    - 不规范的日期数据录入
        
        ![Untitled 100 4.png](../../../Files%20&%20LongText/Attachments/Untitled%20100%204.png)
        
    - datedif函数调整精度
        
        函数原型：  
        =DATEDIF(start_date,end_date,"y")、=DATEDIF(start_date,end_date,"m")、=DATEDIF(start_date,end_date,"d")、、=DATEDIF(start_date,end_date,"ym")、=DATEDIF(start_date,end_date,"yd")、=DATEDIF(date1,date2,"md")  
        
        先是开始日期，然后是结束日期
        
        第三个参数（**向下取整**）  
        y:计算满年数,返回值为0以上的整数;  
        m:计算满月数,返回值为0以上的整数;  
        d:计算满日数,返回值为0以上的整数;  
        ym:计算不满一年的月数,返回值为1~11之间的整数;  
        yd计算不满一年的天数,返回值为0~365之间的整数;  
        md:计算不满意一个月的天数,返回值为0~30之间的整数.  
        
    - 组合图创建
        
        一个图表中用多种共用主坐标轴的方法
        
        ![Untitled 101 4.png](../../../Files%20&%20LongText/Attachments/Untitled%20101%204.png)
        
    - 隐藏单元格真实值
        
        设置单元格格式隐藏可显示区域，但是在公式栏中可见
        
        ![Untitled 102 4.png](../../../Files%20&%20LongText/Attachments/Untitled%20102%204.png)
        
    - 设置打印区域
        
        ![Untitled 103 4.png](../../../Files%20&%20LongText/Attachments/Untitled%20103%204.png)
        
- 2021年3月第四套
    - 保存数据进入数据模型
        
        1、设置Power Pivot功能
        
        点击【开发工具】--【Com加载项】，勾选【Power Pivot】
        
        [![](https://pic1.zhimg.com/80/v2-c724df1da8a237595eea259c289addbc_720w.webp)](https://pic1.zhimg.com/80/v2-c724df1da8a237595eea259c289addbc_720w.webp)
        
        点击【Power Pivot】-【管理】
        
        [![](https://pic2.zhimg.com/80/v2-8e55561f6e834af76d9f183550f363f5_720w.webp)](https://pic2.zhimg.com/80/v2-8e55561f6e834af76d9f183550f363f5_720w.webp)
        
        - 修改数据模型名字
            
            ![Untitled 104 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20104%203.png)
            
        
        - 导入、修改数据源名称
            
            ![Untitled 105 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20105%203.png)
            
        - powerquery编辑启动器
            
            每次导入数据都是启动了一次powerquery
            
            - 进入方式
                
                ![Untitled 106 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20106%203.png)
                
- 2021年9月2套
    - 真假字体
        
        ![Untitled 107 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20107%203.png)
        
    - 二维表的两个参数都是条件
        
        使用hlookup或者vlookup函数加if函数组合查找提取值
        
        =HLOOKUP([@类型],折扣表!$B$2:$E$6,IF(D4<1000,2,IF(D4<1500,3,IF(D4<2000,4,5))),0))
        
        ![Untitled 108 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20108%203.png)
        
        - 更高级的方法是使用offset函数配合match，但不适合用offset函数来自动填充，
            
            **=B2*OFFSET($D$1, MATCH(B2,$D$2:$D$4,1), MATCH(A1,$E$1:$G$1,0))  
            很容易在填充时单元格相对绝对位置出错  
            **
            
            如果用自然语言设置条件分类（1~999），就还要配合if将条件转换（if函数）  
            这会更麻烦  
            
        - 题目说明可以修改就可以讲条件转换为excel语言
            
            ![Untitled 109 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20109%203.png)
            
    - 大分类小分类数据透视表
        
        ![Untitled 110 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20110%203.png)
        
          
        
- 2021年9月3套
    - 计算个人所得税，题目有错
        
        ![Untitled 111 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20111%203.png)
        
        80001的个人所得不是下面这样计算的
        
        (80001-80000)*0.45+80001-13505
        
        这个沙雕题目用奖金*税率然后-速算扣除
        
        沙雕题目
        
        ![Untitled 112 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20112%203.png)
        
- 2022年3月新增
    - 对满足某种条件的不规范填写数据的单元格所在的数据行条件格式
        
        **前三和后三整个数据条件格式**
        
        - 如果是公式导致的不规范
            
            直接使用条件格式先对不规范的单元格下手，然后格式刷到其他单元格中(前提是这些单元格是默认格式，**不然会刷掉原来的格式**)
            
            ![Untitled 113 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20113%203.png)
            
        - 是单元格格式引起的不规范
            
            第几名是使用单元格格式中的自定义 第#名 定义
            
            使用通用方法
            
        - 用人工肉眼或者在其他行另起公式计算出分界线，再使用条件格式设置这些分界线
            
            ![Untitled 114 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20114%203.png)
            
            ![Untitled 115 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20115%203.png)
            
        
        - 数据透视表排序
            
            ![Untitled 116 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20116%203.png)
            
    - 对于rank函数设置第几名
        
        在自定义单元格格式中设置 第#名 不得分
        
- 2022年3月
    - 间断性重复填写内容
        
        ![Untitled 117 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20117%203.png)
        
        - 选中所有需要填写数据的单元格，不要选中多余的
        - 使用Ctrl+G定位（选定所有的空值单元格，类似于Word中的选定所有类似样式的内容）
            
            ![Untitled 118 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20118%203.png)
            
            ![Untitled 119 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20119%203.png)
            
            输入之后按下ctrl+enter表示对所有单元格（数组操作）使用公式，enter只会对选中的单元格使用
            
    - 数据验证中的下拉箭头
        
        ![Untitled 120 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20120%203.png)
        
    - 使用排名公式给数据行设置条件格式
        
        ![Untitled 121 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20121%203.png)
        
        本题中只认rank公式，所以能用公式就用
        
    - 系列线
        
        ![Untitled 122 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20122%203.png)
        
        ![Untitled 123 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20123%203.png)
        
    - 不显示轴刻度线和不显示轴线条
        
        ![Untitled 124 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20124%203.png)
        
    - 图表标题“样式“设计
        
        ![Untitled 125 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20125%203.png)
        
        也可以使用插入文本框编辑文字
        
        **但是本题只认插入的文本框**
        
    - 自定义页眉页脚
        
        ![Untitled 126 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20126%203.png)
        
    - 打印表的每一页都显示标题行
        
        ![Untitled 127 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20127%203.png)
        
    - 图表工作表
        
        ![Untitled 128 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20128%203.png)
        
    - 图表假标题
        
        ![Untitled 129 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20129%203.png)
        
- 2022年3月3套
    - 调整单元格文本方向
        
        ![Untitled 130 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20130%203.png)
        
        但是这样调整的是文字书写方向文字以左边的边框作为底边
        
        ![Untitled 131 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20131%203.png)
        
        这样才会让文字横着写竖着排（前提是之前的文本必须要设置跨列水平和竖直居中）
        
    - 齿形列表引用
        
        根据销往地区确定国家
        
        ![Untitled 132 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20132%203.png)
        
        ![Untitled 133 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20133%203.png)
        
    - 见机行事自动填充锁定
        
        ![Untitled 134 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20134%203.png)
        
    - 设定名称，从而间接引用
        
        ![Untitled 135 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20135%203.png)
        
        ![Untitled 136 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20136%203.png)
        
- 2022年3月4套
    - 隐藏工作表无法找到
        
        ![Untitled 137 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20137%203.png)
        
    - 另存图表为模板
        
        ![Untitled 138 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20138%203.png)
        
    - 设置图标的锁定
        
        ![Untitled 139 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20139%203.png)
        
    - 设置打印区域
        
        ![Untitled 140 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20140%203.png)
        
    - 在已经分类汇总的表格中使用ctrl+shift+方向不会全选所有数据
---
- 第38套
    - 使用vlookup函数最后一个匹配规则参数需要使用0精确匹配，不然数据会有较大误差
    - 如果要在文本中使用超链接，一般使用hyperlink函数而用选项卡链接的形式  
        hyperlink的location参数工作表名称开头需要加上 # ，并且双引号括起  
        
        ![Untitled 141 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20141%203.png)
        
    - 对表格某个部分使用条件格式注意括号的使用
        
        ![Untitled 142 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20142%203.png)
        
- 真题41（2021年9月）
    - 计算日期时间差（有超过24小时的）
        
        在单元格格式中的h代码加上[]，表示强制显示超过24小时的时间格式
        
    - 计算没15分钟收费一次的停车费
        - 计算时间需要计算超过24小时以上的（见上面）
        - 时间单元格得到的值是这段时间占一天24小时的比例
            
            ![Untitled 143 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20143%203.png)
            
            所以需要调整
            
        - 计算出总共有多少分钟
            
            ![Untitled 144 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20144%203.png)
            
        - 至于四舍五入
            
            使用ROUNDUP函数，最后一个参数是如何舍入，一般都是填0
            
            ![Untitled 145 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20145%203.png)
            
            ![Untitled 146 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20146%203.png)
            
- 真题43（2021年9月新增真题）
    - 数据透视表中的分类汇总
        
        ![Untitled 147 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20147%203.png)
        
        ![Untitled 148 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20148%203.png)
        
- 真题45
    
    使用排序时，一般使用rank函数而不用rank.eq
    
- 真题46
    
    间隔单元格按组标题填充
    
    ![Untitled 149 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20149%203.png)
    
    定位中选中定位条件，条件中选中标题
    
    ![Untitled 150 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20150%203.png)
    
    注意按下Ctrl+enter而不是直接按enter
    
    - 打印时重复标题行
        
        ![Untitled 151 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20151%203.png)
        
- 真题47
    - 设置奇怪的数字格式
        
        ![Untitled 152 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20152%203.png)
        
    - 改变文字排列方式
        
        ![Untitled 153 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20153%203.png)
        
    - 根据内容设置名称
        
        ![Untitled 154 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20154%203.png)
        
    - 间接引用，引用名称所引用的区域
        
        ![Untitled 155 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20155%203.png)
        
    - 用公式设置图表数据来源
        
        ![Untitled 156 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20156%203.png)
        
        ![Untitled 157 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20157%203.png)
        
- 真题48
    - 无法取消隐藏工作表
        
        ![Untitled 158 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20158%203.png)
        
    - 设置图表的查看属性
        
        ![Untitled 159 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20159%203.png)
        
        ![Untitled 160 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20160%203.png)
        
    - 设置坐标轴不显示线条
        
        ![Untitled 161 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20161%203.png)
        
          
        
---
小黑
- 38
    - 自定义序列，修改切片器只能升降序排序
        
        ![Untitled 162 3.png](../../../Files%20&%20LongText/Attachments/Untitled%20162%203.png)
        
        这样同时会修改所有不能自定义排序的功能，在没有自定义排序功能的选项中选择升序就可以调用这个功能