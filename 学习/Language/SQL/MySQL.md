## 资源、环境变量和基础配置
视频教程链接 [001_MySQL基础_课程引入_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV12b411K7Zu?p=1&vd_source=876be08bc9c030f4a9ea1fb97e0d0342)
笔记链接 [MySQL自学笔记(零基础到考试6天)-CSDN博客](https://blog.csdn.net/m0_46153949/article/details/107116168)
脚本文件和源代码 https://pan.baidu.com/s/11389Eo6P6krpcpsAdbfISw?pwd=1234
测试数据库[数据库学习：MYSQL的测试数据库myemployees girls job_grades_myemployees.sql-CSDN博客](https://blog.csdn.net/GongmissYan/article/details/102937816)
笔记链接 2 https://blog.csdn.net/weixin_45260385/article/details/113881457 
		  https://blog.csdn.net/weixin_45260385/article/details/114047703
建议 sql 语句大全 [MySQL高级篇（高阳）建表sql语句大全-CSDN博客](https://blog.csdn.net/qq_42826747/article/details/106674270)
之前的 python 基础
[Python Basics \> SQL](Python%20Basics.md#SQL)
在安装目录中的 `my. ini` 文件是配置文件
## 学校作业总结
### 学习通实验报告
- 插入语句使用 `insert into table_name (field_name1,field_name2,......) values(value1,value2,.............)` 注意是 values 不是 value，单条记录之间通过 `()` 包裹内容，通过 `,` 隔开括号
- 以零开头的数字一般在 sql 中使用字符串类型存储，注意在使用查询语句之前先查看表结构
- sql server 中使用 `EXEC sp_columns '表名';` 查看表结构，mysql 中使用 `desc 表名` 查看
- 类型为 `datetime` 的字段可以直接进行日期比较，如
```sql
SELECT xs.学号,
       xs.姓名,
       xs.出生日期
FROM   xs
WHERE  xs.出生日期 >= '1984-9-9'
       AND xs.出生日期 <= '1985-9-9'; 
```
- `datetime` 类型的书写方式是使用 `-` 分割时间单位
- 设置[[#级联操作|级联操作]] 和[[#分类：六大约束|外键注意事项]]
- 为什么使用 `group by` 语句时，`select` 中的查询内容需要和 `group by` 中一样
- 使用多种方法查询多表连接，多表条件判断题

> 查询选修的所有课程成绩都大于等于 60 分的学生的学号、姓名。

**方法一**：使用 `GROUP BY` 和 `HAVING`
```sql
SELECT xs.学号, xs.姓名
FROM xs
INNER JOIN xk ON xs.学号 = xk.学号
GROUP BY xs.学号, xs.姓名
HAVING MIN(xk.成绩) > 60;
```
用学号和姓名筛选出唯一值，根据唯一值（每个人）的不同成绩，用 having 对分组之后的成绩一栏筛选出最低成绩都大于 60 ，即可
**方法二**：使用子查询和 `NOT EXISTS`
```sql
SELECT distinct xs.学号, xs.姓名
FROM xs
WHERE NOT EXISTS (
    SELECT 1
    FROM xk
    WHERE xk.学号 = xs.学号 AND xk.成绩 <= 60
);
```
查询满足 `xk.学号 = xs.学号 AND xk.成绩 <= 60` 的结果，如果有返回值，则通过 `select 1` 返回一个**布尔值 `true` 表示有结果**，这样做比使用 `select *` 要快，因为 `select 1` 只返回 `bool`，而 `select *` 需要返回内容
**方法三**：使用 `ALL` 关键字
```sql
SELECT xs.学号, xs.姓名
FROM xs
WHERE 60 < ALL (
    SELECT xk.成绩
    FROM xk
    WHERE xk.学号 = xs.学号
);
```
使用操作符 all 表示和子查询的所有值比较，[[#操作符|操作符]]，将每一个子查询返回的*成绩*结果与 60 比较，大于 60 的返回学号和姓名
- 和 Mysql 的 `limit` 不同，sql server 使用 `TOP` 和 `fetch`，`offset` 限制读取数
`TOP` 用在 select 语句中，后接一个数字表示限制显示几行
	- `OFFSET 10 ROWS` 表示跳过前 10 行。
	- `FETCH NEXT 10 ROWS ONLY` 表示获取接下来的 10 行。
```sql
SELECT *
FROM 表名
ORDER BY 列名
OFFSET 10 ROWS FETCH NEXT 10 ROWS ONLY;
```
- 查询获得“数据库原理”最高成绩的学生的学号和姓名。（**有坑**）
	- 第一种只能显示一个最高分，如果出现多人同时为最高分，method 1 会出现错误，method 2 通过子查询查找最高分，再通过源数据中筛选出符合最高分和课程名的人。
	- *较为复杂的问题*首先考虑子查询做法，比较复杂但是稳定
```sql
-- method 1
SELECT TOP 1 xs.姓名,
             xs.学号
FROM   xs
       INNER JOIN xk
               ON xk.学号 = xs.学号
       INNER JOIN kc
               ON kc.课程编号 = xk.课程号
WHERE  kc.课程名称 = '数据库原理'
ORDER  BY xk.成绩 DESC; 
-- method 2
SELECT xs.姓名,
       xs.学号
FROM   xs
       INNER JOIN xk
               ON xk.学号 = xs.学号
       INNER JOIN kc
               ON kc.课程编号 = xk.课程号
WHERE  kc.课程名称 = '数据库原理'
       AND xk.成绩 = (SELECT Max(xk.成绩) AS max_grade
                    FROM   xk
                    INNER JOIN kc
                    ON kc.课程编号 = xk.课程号); 
```
### 学习通章节测验
- 删除表中字段之前要删除相应字段的约束
- [[#限定名书写|限定名书写]]
- 各种约束的使用，修改和删除[[#修改表时添加约束|修改表时添加约束]]，删除有约束的列之前先删除它的约束
- [[#操作符|操作符]]使用注意事项，不能用在约束中
- 计算现在年龄的方法 `year(GETDATE())-year(xs.出生日期)`
- 查看每个专业有多少人（经典题目）
```sql
SELECT kc.课程名称,
       Count(xk.学号) AS num_of_class
FROM   kc
       INNER JOIN xk
		   ON kc.课程编号 = xk.课程号
GROUP  BY kc.课程名称; 
```
- 查看执行情况
![[Pasted image 20241109172412.png|400]]
- [[#级联操作|级联操作修饰符]] 使用方法
- [[#check 条件约束|check 条件约束]]
- 使用各种[[#常见函数|数学，字符、日期函数]]编写 check 条件
- [[#账户控制|账户控制]]
- [[#sql server 和 mysql 存储过程和函数的语法区别|sql server 和 mysql 存储过程和函数的语法区别]]和实例应用[[#实例|实例]]
- 批处理概念 [[#账户控制#调整用户权限|GO的用法]]
## 基本结构
1. 将数据放到表中，表再放到库中
2. 一个数据库中可以有多个表，每个表都有一个的名字，用来标识自己。表名具有唯一性。
3. **表**具有一些特性，这些特性定义了数据在表中如何存储，类似 java 中 “**类**”的设计。
4. 表由列组成，我们也称为字段。所有表都是由一个或多个列组成的，**每一列**类似 java 中的”**属性**”
5. 表中的数据是按行存储的，**每一行**类似于 java 中的“**对象**”。
6. 没有内容的单元格会被标记为 NULL [+号作用](#+号作用)
7. 变量名、命令代码大小写不敏感[学习/SQL/MySQL \> 调整步长](#调整步长)

```sql
SELECT
	-- 执行结果中要返回的列，是执行语句则返回结果要为列
FROM
	-- 指定查询数据源来自哪个表
WHERE
	-- 指定要显示的符合条件的行（对象）
GROUP BY
	-- 制定分组依据，对每个返回的列执行的操作
HAVING
	-- 对分组筛选之后的返回结果再进行筛选显示
LIMIT
	-- 调整显示行数
ORDER BY
	-- 按照哪一项属性来升降序排列
```
### 基本查看命令
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240816215314.png)
Show databases;
Show tables;
use <database_name>          使用库
Show tables from databases  使用 use 命令后，在其他库 show 不会跳转到 show 的库
creat table <table_name>      
Select database;                      查看当前数据库位置，注意是 database 不加 s
```sql
create table stuinfo (
id int,
name varchar(10));
```
创建 studinfo 表，有两列，id 列存储 int 类型，name 类存储 varchar 类型，长度限制为 10
不换库查看表的结构
```sql
show tables;
desc stuinfo ; -- 查看数组结构
```
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240816212856.png)
### 插入&删除命令
**单列插入**
```sql
insert into stuinfo (id) value(923802),(527486),(4823096);
show tables;
select id from stuinfo s ; --s表示给stuinfo别名s
```
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240816213814.png)
**多列插入**
Insert into 命令默认加在末尾，未定义单元格赋值 NULL
```sql
insert into stuinfo (id,name) value(82496324,"alpha");
insert into stuinfo (id,name) value(46782543,"beta");
insert into stuinfo (id,name) value(43858235,"charlie");
select * from stuinfo s ;
```
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240816214939.png)
**单行删除**
![Untitled 156 8.png](Files%20&%20LongText/Attachments/Untitled%20156%208.png)
在 sql 中操作不存在的数据一般不会报错，只会显示没有数据（行）被更新
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240816221939.png)
- `DELETE FROM` 后面跟着你想要删除数据的表名。**对行操作**
```sql
delete from stuinfo where id=923802;
select * from stuinfo s ;
insert into stuinfo (id,name) value(1214,"delta");
delete from stuinfo where id=1214;
```
**单元格删除**
- sql 数据存储基于行，一个行是一个对象，一个列是对象的一种属性，sql 不支持单独对某个单元格这种粒度的删除操作，只能使用 `UPDATA` 将一个单元格命名为 NULL 达到删除效果

**单列删除**
```sql
ALTER TABLE table_name DROP COLUMN column_name;
--本质上也是**改变**表的内容，而不是**删除**
```
### 查询操作
**查询表内容
```SQL
select * from stuinfo where name = 'alpha'
/*从名为stuinfo的**数据库**表中选择所有列（*代表所有列），
但只返回那些name列的值为'alpha'的记录*/
```
**查询 mysql 数据库版本**
```sql
--[[cmd]]中输入
mysql --version
--mysql中输入
select version();
```
### 语法规范
#### 书写和注释
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240816223400.png)
#### 限定名书写
sql 中的层级模式是 `数据库名.模式名.表名`，如果没有指定模式可以跳过，如 `db_name..table_name`

---
## 语法命令
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240816225343.png)
### DQL (database query language)
#### DQL 语句执行和书写顺序
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240824165847.png)
#### 基础命令
##### 操作符
单行操作符：（> = < <> ）
多行操作符：所有操作符都接受一个列表参数，根据含义匹配列表（一列多行）的内容
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240824113527.png)
- 其中，any/some 等价于用在**多行子查询中**等价于单行子查询中将查询条件改为 max 列表字段[[使用- 实例]]
- ^4132 db
- 操作符一般用于查询中，起到一种筛选的作用，在[[#约束填写|设置约束]]时并不适用，这种情况下一般用 `IN/NOT IN`
```sql
-- wrong 
create table test(
	grade char(1)  
	constraint chk_test_grade check(grade = any ('A','B','C'))
);
-- right
CREATE TABLE test(
    grade CHAR(1),
    CONSTRAINT chk_test_grade CHECK (grade IN ('A','B','C'))
);
```
##### 基础查询筛选选
![Untitled 159 6.png](Files%20&%20LongText/Attachments/Untitled%20159%206.png)
- 查询列表可以是：表中的字段、常量值、表达式、函数
- 查询的结果是一个虚拟的表格（意为使用 select 语句表示选中一个表格，对他的 group by，order by 的命令并不会影响实际物理表的内容，仅做显示，select 表本质是只读和临时的）
```sql
SELECT  last_name from employees e ; -- check single field
SELECT `last_name`, salary,email from employees e ;  -- check a series fields
SELECT * from employees e ;  -- check out all fields
-- 着重号告诉解释器是一个字段而不是关键字
```
##### 查询常量值，数学计算、函数
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240818122230.png)
##### 起别名
提高代码、结果可读性：其中 employee; 的别名为 e
![375](Files%20&%20LongText/Attachments/Pasted%20image%2020240818122833.png) 
其中 as 可以省略
##### 将查询结果（返回值）取别名
![375](Files%20&%20LongText/Attachments/Pasted%20image%2020240818123221.png)
取别名之后的需要使用有别名的对象时，只能用别名，原始名称会报错
##### 去重操作
将返回结果中的所有重复值唯一显示，注意作用范围
```sql
-- 显示员工中所有的部门编号
SELECT department_id from employees e ;
```
![每个员工都有一个部门编号|350](Files%20&%20LongText/Attachments/Pasted%20image%2020240818124133.png)
显示唯一值**distinct**关键字
`SELECT DISTINCT department_id from employees e ;`
![375](Files%20&%20LongText/Attachments/Pasted%20image%2020240818124330.png)
##### +号作用
Select 100+90：两个操作数都为数值型，则做加法运算
Select'123'+90；其中一方为字符型，试图将字符型数值转换成数值型
如果转换成功，则继续做加法运算
如果转换失败（如 select 'john'+90），则将字符型数值转换成 0
**如果有一方为 NULL 那么运算（任何运算、字符串拼接）结果都为 NULL**
字符串的拼接需要使用 concat 函数
`SELECT concat(first_name, " ", last_name) as english_name from employees e ;`
括号中是需要连接的字符串，当连接字符串中有 NULL 会使所有内容都为 NULL
需要使用 [ifnull 函数初级判断](#ifnull%20函数初级判断)
##### Ifnull 函数初级判断
```sql
SELECT  -- select表示执行的指令
	ifnull(commission_pct, 0) as "index",-- 表示如果NULL则返回0，返回结果字段别名为index
	commission_pct -- 选中执行表示查看
from
	employees e ; -- From表示在哪里执行指令
SELECT
concat(first_name," ",last_name," ",ifnull(commission_pct,0)) as info
from
employees e ;
```
![400](Files%20&%20LongText/Attachments/Pasted%20image%2020240818131726.png)
##### 模糊查找和精确查找
###### LIKE
 `LIKE` 通常用于模糊匹配，它允许你在查询中使用[通配符](../Scattered%20knowlegde/通配符.md)来匹配列中的特定模式。
- **通配符**
  - `%`：代表任意数量（包括零个）的字符。
  - `_`：代表任意单个字符。
- **适用数据类型**: 主要用于字符串类型的字段，也可以用于其他数据类型

###### ESCAPE
一般配合 `LIKE` 一起使用，表示 like 中的某些字段是转义字符
如要匹配名称中有 `_` 的结果，不能使用 `select * from table where name like '%\_%'`，这样 `\_` 会被识别为**一个转义字符加任意单个字符**，需要显示标明 `\` 是转义字符
```sql
select * from table where name like '%\_%' escape '\';
```
###### IN
`IN` 用于指定一个值列表，返回字段值在这个列表中的记录。
- **适用数据类型**: 可以用于任何数据类型，包括数字、字符串和日期等。
- **逻辑**: `IN` 通常用于简化多个 `OR` 条件的写法，提高 SQL 语句的可读性。
###### 功能差异
   - `LIKE` 用于模糊匹配，适用于需要部分匹配的场景。
   - `IN` 用于精确匹配，适用于需要匹配列表中任一确切值的场景。
   - `LIKE` 主要用于字符串类型，尽管技术上可以用于其他类型，但不是其主要用途。
   - `IN` 可以用于任何数据类型，使用范围更广。
   - 在某些情况下，尤其是当 `IN` 列表中的值非常多时，`IN` 可能比 `LIKE` 更高效。
   - `LIKE` 使用通配符时，尤其是 `%` 在模式的开头，可能会导致查询效率下降，因为数据库可能无法有效利用索引。
#### 条件查询
##### 普通查询
`where` 表示条件筛选，对象时选中列表的每一行的数据，符合条件显示这一行，执行顺序和书写顺序不一样
![350](Files%20&%20LongText/Attachments/Pasted%20image%2020240818132014.png)
```sql
select 
	要查询的字段|表达式|常量值|函数
from 
	表
where 
	条件 
```
分类：
##### 一、条件表达式
示例：salary>10000
< >= <= = ***!= <>两个都是不等号**
```sql
# 查询工资>12000的员工信息
SELECT * from employees e WHERE salary > 12000;
# inquir about the employee name and department numebr that are not = 90
SELECT
	concat(first_name, " ", last_name) as "name",
	department_id
from
	employees e
WHERE
	department_id <> 90;
```
##### 二、逻辑表达式
&&和 and
||或 or：
!否 not：
**推荐使用关键字而不是逻辑连接符**
示例：salary>10000 && salary<20000
逻辑运算符：
	And（&&）: 两个条件如果同时成立，结果为 true，否则为 false
	Or (||)：两个条件只要有一个成立，结果为 true，否则为 false
	Not (!)：如果条件成立，则 not 后为 false，否则为 true
```sql
SELECT
	last_name ,
	salary,
	commission_pct
FROM
	employees e
WHERE
	salary<20000
	and salary >10000;
```
##### 三、模糊查询
关键字为**立刻** 。示例：last_name like 'a%'
```sql
--#案例2：查询员工名中第三个字符为e，第五个字符为a的员工名和工资
SELECT last_name,salary from employees e WHERE last_name LIKE "__e_a%";
-- #案例3：查询员工名中第二个字符为_的员工名
SELECT
	concat(first_name , last_name)
FROM
	employees e
WHERE
	last_name LIKE "_\_%" ;
	-- 自定义转义字符写法
	last_name LIKE "_$_%" ESCAPE “$”
```
Escape 表示将后面的**字符，不能是字符串**标记为转义字符
[关于%通配符信息](../Scattered%20knowlegde/通配符.md)
##### 提高可读性
仅仅只会提高可读性，性能，语法上的差异较为细微
**between and 表达式**
```sql
SELECT
    *
FROM
    employees
WHERE
    employee_id >= 100 AND employee_id<=120;-- 表示在100~120之间
	-- employee_id BETWEEN 100 AND 120;；两者等价，闭区间，
	-- **顺序颠倒等于闭区间反选**，
	-- **顺序颠倒等于闭区间反选**，
	-- **顺序颠倒等于闭区间反选**，
```
**in 关键字**
含义：判断某字段的值是否属于 in 列表中的某一项
特点：
In 列表的值类型必须一致或兼容
In 列表中不支持通配符 
```sql
SELECT
	last_name,
	job_id
from
	employees
WHERE
	job_id IN ("AD_VP","SA_MAN");
	-- 与这种写法等价
	job_id = 'IT_PROT' OR job_id = 'AD_VP' OR JOB_ID ='AD_PRES';
```
**IS NULL 和 IS NOT NULL**
1. NULL 的含义：它不是表示空字符串或零值，而是表示数据的缺失或不适用。
2. 等价性原则：在 SQL 的逻辑中，任何与 `NULL` 的比较（包括 `=`）都会返回 `UNKNOWN`，而不是 `TRUE` 或 `FALSE`。NULL 表示数据缺失，**不是一个值**
3. 逻辑运算：由于 `NULL` 的特殊性，SQL 引入了 `IS NULL` 和 `IS NOT NULL` 来处理涉及 `NULL` 的逻辑判断。这确保了逻辑判断的准确性和一致性。

注意 IS NULL 和 IS NOT NULL 是一个整体，不能拿 IS 在不判断 NULL 的语句中充当 `=`
`salary is 12000` 是错误的
**安全等于<=>**
比较两个表达式，如果两个表达式都为 `NULL`，或者两者相等则返回 `TRUE`；
如果其中一个为 `NULL` 而另一个不是，或者两者不相等则返回 `FALSE`；
如果两者都不为 `NULL` 并且相等，则返回 `TRUE`。
简而言之，`<=>` 运算符在处理 `NULL` 值时提供了一种类似于 `=` 运算符的行为，但增加了对 `NULL` 值的特殊处理。
![450](Files%20&%20LongText/Attachments/Pasted%20image%2020240818144854.png)
Salary 等于 12000 的被筛选出，不等于 12000 和 NULL 值被忽略，因为返回 false 的行在 where 栏中不显示
```sql
-- 查询员工号为176的员工姓名和部门号和年薪
SELECT
	last_name,
	department_id,
	salary * 12 *(1 + ifnull(commission_pct, 0)) as annual
FROM
	employees e
WHERE
	e.employee_id <=> 176
```
#### 排序查询
##### 升降序排序
语法：
```sql
语法：
select
	要查询的东西
from
	表
where 
	条件
order by 排序的字段|表达式|函数|别名 【asc|desc】 -- 不填排序方法默认asc升序
-- 询员工信息，要求工资从高到低排序
SELECT * FROM employees e order by salary DESC ;
-- 按照入职时间排序
SELECT * FROM employees e WHERE department_id >=90 order by hiredate asc;
-- 按年薪排序
SELECT
	last_name ,
	salary,
	salary * 12 *(1 + ifnull(commission_pct, 0)) as annual
FROM
	employees e
order by
	annual desc;
```
##### 函数排序
**长度排序**
`LENGTH(字符串)` 函数用于获取字符串的长度，返回一个 int 整数表示字符串长度，**只能接受字符串作为参数**
计算整数类型长度需要使用 `cast` 转换函数
`SELECT LENGTH(CAST(12345 AS CHAR));` cast 表示进行类型转化，as char 是转化目标
```sql
SELECT  -- 按照名字长度排序
	last_name,
	LENGTH(last_name) as len_of_name
FROM
	employees e
order by
	LENGTH(last_name) desc;
```
**多条件排序**
Order by 中填多个条件，逗号分隔即可。条件的顺序即条件优先级
```sql
-- 查询员工姓名和部门编号和年薪，按年薪降序，姓名升序排序
SELECT
	last_name,
	department_id,
	salary * 12 *(1 + ifnull(commission_pct, 0))
FROM
	employees e
order by
	e.salary DESC ,
	e.last_name asc;
-- 选择工资不在8000到17000的员工的姓名和工资，按工资降序
SELECT
	last_name,
	salary
FROM
	employees e
WHERE
	salary NOT BETWEEN 8000 and 17000
order by
	salary desc;
-- 查询邮箱中包含e的员工信息，并先按邮箱的字节数降序，再按部门号升序
SELECT
	*
FROM
	employees e
WHERE
	e.email LIKE "%e%"
ORDER BY
	LENGTH(e.email),
	department_id desc;
```
#### 常见函数
##### 函数总览
一、单行函数
1、字符函数
	Concat (str, str...) 拼接
	Substr 截取子串
	Upper (str) 转换成大写
	Lower (str) 转换成小写
	Trim 去前后指定的空格和字符
	Ltrim 去左边空格
	Rtrim 去右边空格
	Replace 替换
	Lpad 左填充
	Rpad 右填充
	Instr 返回子串第一次出现的索引
	Length 获取字节个数
2、数学函数
	Round 四舍五入
	Rand 随机数
	Floor 向下取整
	Ceil 向上取整
	Mod 取余
	Truncate 截断
3、日期函数
	Now 当前系统日期+时间
	Curdate 当前系统日期
	Curtime 当前系统时间
	Str_to_date 将字符转换成日期
	Date_format 将日期转换成字符
4、流程控制函数
	If 处理双分支
	Case 语句处理多分支
		情况 1：处理等值判断
		情况 2：处理条件判断
5、其他函数
	Version 版本
	Database 当前库
	User 当前连接用户
二、分组函数（传入一组值得到一个值）
	Sum 求和
	Max 最大值
	Min 最小值
	Avg 平均值
	Count 计数
	特点：
1. 以上五个分组函数都忽略 null 值，除了 count ()
2. Sum 和 avg 一般用于处理数值型，max、min、count 可以处理任何数据类型
3. 都可以搭配 distinct 使用，用于统计去重后的结果
4. Count 的参数可以支持：字段、\*、常量值，一般放 1，建议使用 count (\*)
##### 字符函数
**LENGTH 函数**
当 LENGTH 参数列表中传入中文，判断长度依据是字符串占用空间大小
使用 `show variables like "%char%";` 查看当前客户端的编解码字符集
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240818164431.png)
`SELECT LENGTH(“张三丰”)` 汉字在 UTF 8 协议中占用三个字节空间，结果为 9
**sql 中处理字符串用字节占用空间处理的，只有 LENGTH 函数** ^3 ce 0 f 3
**SUBSTR/SUBSTRING 截取字符串**
有四种重载方式，截取计量单位是字符不是字节，注意，和其他编程语言不同的是**索引从 1 开始** ^ab 0710
```sql
#截取从指定索引处后面所有字符
SELECT SUBSTR('李莫愁爱上了陆展元',7)  out_put; -- 从第七位开始后面内容全部截取
#截取从指定索引处指定字符长度的字符
SELECT SUBSTR('李莫愁爱上了陆展元',1,3) out_put;-- 从第一位开始向后截取3位
#案例：姓名中首字符大写，其他字符小写然后用_拼接，显示出来
SELECT CONCAT(UPPER(SUBSTR(last_name,1,1)),'_',LOWER(SUBSTR(last_name,2)))  out_put
FROM employees;
```
**instr** 返回子串在字符串中第一次揣想拿的索引号
如果没有查找到，字符串中没有子串，返回 0 [这就是为什么索引从1开始](#^ab0710)
```sql
SELECT INSTR('杨不殷六侠悔爱上了殷六侠','殷八侠') AS out_put;
```
**trim** 去前后空格，也可以去前后指定字符
SELECT LENGTH (TRIM ('    张翠山    ')) AS out_put;
```sql
SELECT TRIM('aa' FROM 'aaaaaaaaa张aaaaaaaaaaaa翠山aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')  AS out_put;
-- 注意限定字符当做一个整体处理
```
**lpad** 用指定的字符实现左填充指定长度
```sql
SELECT LPAD('殷素素',2,'*') AS out_put;
```
**rpad** 用指定的字符实现右填充指定长度
```sql
SELECT RPAD('殷素素',12,'ab') AS out_put;
```
**replace** 替换
```sql
SELECT REPLACE('周芷若周芷若周芷若周芷若张无忌爱上了周芷若','周芷若','赵敏') AS out_put;-- 所有字符内容都会被替换
```
##### 数学函数
**round**：四舍五入，将数的绝对值四舍五入后加符号，输入两个参数第二个代表保留小数位数
```sql
SELECT ROUND (-1.55);
SELECT ROUND (1.567,2);
```
**ceil** 向上取整, 返回>=该参数的最小整数
`SELECT CEIL (-1.02);`
**floor** 向下取整，返回<=该参数的最大整数
`SELECT FLOOR (-9.99);`
**truncate** 截断
`SELECT TRUNCATE (1.69999,1);`
**mod 取余**
```sql
/*
mod (a, b) ： --本质上进行 a-a/b*b，注意编程语言中的除法会丢弃小数部分
mod (-10,-3):-10- (-10)/(-3)*（-3）=-1
*/
SELECT MOD (10,-3);
SELECT 10%3;
```
**rand** 随机 0~1 之间的数，可以取到 0 但是达不到 1，可以使用 round 变为 sigm 函数取到 0 或者 1
##### 日期类型
所有返回时间的函数返回格式遵循 `YYYY-MM-DD HH:MM:SS`，now 或者其他读取日期的函数从中解析出所需的时间字段
**now** 返回当前系统日期+时间
`SELECT NOW();`
**curdate** 返回当前系统日期，不包含时间
`SELECT CURDATE();`
**curtime** 返回当前时间，不包含日期
```sql
SELECT CURTIME();
#可以获取指定的部分，年、月、日、小时、分钟、秒
SELECT YEAR(NOW()) 年;
SELECT YEAR('1998-1-1') 年;
SELECT  YEAR(hiredate) 年 FROM employees;
SELECT MONTH(NOW()) 月;
SELECT MONTHNAME(NOW()) 月;-- 返回月名并转换为文字表示
```
![400](Files%20&%20LongText/Attachments/Pasted%20image%2020240818200550.png)
![400](Files%20&%20LongText/Attachments/Pasted%20image%2020240818200732.png)
**str_to_date** 将字符通过指定的格式转换成日期
`SELECT STR_TO_DATE('1998-3-2','%Y-%c-%d') AS out_put;` %c 表示不补 0
```sql
-- 查询入职日期为1992--4-3的员工信息
SELECT * FROM employees WHERE hiredate = '1992-4-3';
SELECT * FROM employees WHERE hiredate = STR_TO_DATE('4-3 1992','%c-%d %Y');
-- 按照输入的内容配置解析表达式
```
**date_format** 将日期转换成字符
`SELECT DATE_FORMAT(NOW(),'%y年%m月%d日') AS out_put;`
```sql
--  查询有奖金的员工名和入职日期(xx月/xx日 xx年)
SELECT
	last_name,
	date_format(hiredate, "%m月%d日 %y年") AS 入职日期
FROM
	employees e
WHERE
	e.commission_pct <> 0
	OR e.commission_pct IS NOT NULL
```
**datediff 函数**
`DATEDIFF ( datepart , startdate , enddate )` `
返回值按照 datepart 格式显示 startdate - enddate 的值，可为负数
Datepart 参数可为 year, month, day
**其他日前函数**
Day, month, year, minute, second, hour, monthname (以英文名称返回月份名称)
##### 其他函数
```sql
SELECT VERSION ();
`SELECT DATABASE ();
`SELECT USER ();-- 查看当前的用户
```
两种加密函数
`SHA` 和 `MD5` 都是用于生成数据的哈希值的函数。哈希函数是一种单向加密过程，它将输入（如字符串或数字）转换成固定长度的唯一字符串，这个字符串通常以十六进制形式表示。哈希函数的特点是不可逆，即从哈希值几乎不可能推算出原始数据。
- **MD 5 (Message-Digest Algorithm 5)**: MD 5 是一种广泛使用的哈希函数，它产生一个 128 位（16 字节）的哈希值，通常表示为 32 个十六进制数字。通常用于验证数据完整性
- **SHA (Secure Hash Algorithm)**: SHA 是一系列哈希函数的统称，包括 SHA-1、SHA-256、SHA-512 等各种不同的算法方案。其中，SHA-256 和 SHA-512 属于 SHA-2 系列，它们分别产生 256 位和 512 位的哈希值。SHA-2 系列比 MD 5 更安全
```sql
SELECT MD5('Hello World'); -- 返回 '64ec88ca00b268e5ba1a35678580b979'
SELECT SHA2('Hello World', 256); -- 返回 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'
```
`SHA2` 函数的第二个参数是算法方案编号，有 224，256，384，512 等可选方案
PS：对于旧版本的 5.7 MySQL 还有一个 `PASSWORD` 函数也可以加密，在 8.0 以上版本废弃
##### 流程控制函数
语法中所有的执行体（即判断成功后执行的动作，如 when 判断之后的 then 后就是动作）如果是一个值表达式（返回一个值显示）那么条件句结尾不需要分号，如果是一个执行语句需要在每个操作后结尾使用分号
###### If/case when（Switch case）判断语句
If 和 excel 中的 if 语句以一样的语法
```sql
SELECT
	last_name ,
	commission_pct ,
	IF(e.commission_pct IS NULL,
	'有奖金',
	'没奖金') AS addition
FROM
	employees e;
-- 注意sql中字符串最好使用''而不用双引号，单引号也不是只能括起字符常量内容
```
###### Case 多条件判断
类似于 C++中的 switch case
两种用法一种是范围判断，一种精确值判断
**条件判断**
```sql
SELECT
last_name,
salary,
CASE
	WHEN salary>20000 THEN 'A'
	WHEN salary>15000 THEN 'B'
	WHEN salary>10000 THEN 'C'
	ELSE 'D'
	END AS level
FROM
	employees e ;
```
**等值判断用法**
等值判断的执行条件根据 expression 的返回值，所以可以使用一些简单嵌套形式
```sql
SELECT
	last_name,
	salary,
	CASE 
		CASE
			WHEN salary>20000 THEN 'A'
			WHEN salary>15000 THEN 'B'
			WHEN salary>10000 THEN 'C'
			ELSE 'D'
			END --内层循环是返回四种字符结果的case，嵌套expression时注意不要使用别名
		END AS level -- 使用别名将会把返回值存储到别名“变量中”，这样的写法外层循环无法读取到返回值
		WHEN 'A' THEN 'excellent'
		WHEN 'B' THEN 'briliant'
		WHEN 'C' THEN 'nice'
		WHEN 'D' THEN 'good'
		END AS info
		-- 如果命名了内部循环别名，需要换外层写法
------------------------------------------------------------------------------
	Case level  --等值判断
		WHEN 'A' THEN 'excellent'
	    WHEN 'B' THEN 'briliant'
	    WHEN 'C' THEN 'nice'
	    WHEN 'D' THEN 'good'
	Case		--条件判断，但是精确条件
		WHEN level = 'A' THEN 'excellent'
	    WHEN level = 'B' THEN 'briliant'
	    WHEN level = 'C' THEN 'nice'
	    WHEN level = 'D' THEN 'good'
FROM
	employees e ;
```
#### 分组查询
**语法**
Select 查询列表
From 表
【where 筛选条件】
Group by 分组的字段
【order by 排序的字段】;
##### Group by 和 select 中的字段
选择选修了 2 门或以上课程的学生姓名和学号
```sql
SELECT xs.姓名,
       xs.学号
FROM   xs
       INNER JOIN xk
               ON xk.学号 = xs.学号
GROUP  BY xs.姓名,xs.学号
having Count(xk.课程号) >= 2;
```
- 在 `GROUP BY` 子句中只使用了 `xs.姓名`，但查询结果中包含了 `xs.学号`。在某些数据库系统中，如果 `学号` 不是 `姓名` 的函数（即一个 `姓名` 对应多个 `学号`），这可能会导致错误或不准确的结果。
即使用 `xs. 姓名, xs. 学号` 作为分组依据时会将两项组合看做一个分组依据，一个姓名两个学号或者反之的情况会备份来计算
如果使用一个作为分组条件会导致有一行被忽略
![[Pasted image 20241109111101.png]]
##### 基础分组函数
Sum 求和
Max 最大值
Min 最小值
Avg 平均值
Count 计数
以上五个的简单使用都是放入一个参数计算相应的值
**特点**
1. 以上五个分组函数都忽略 null 值（）不参与运算，除了 count (\*) ，**参与运算会使所有内容变为 0**——— [原因](#+号作用)，count 类似于 excel 中统计不为空单元格个数，**不统计 NULL** 
2. Sum 和 avg 一般用于处理数值型，在其中放入字符串，时间类型使函数失去意义，**不报错但不代表支持这样的写法**，max、min、count 可处理任何数据类型（能排序说明有比较性）
3.  Avg 函数可能会产生与现实逻辑的偏差，因为忽略 null 值，100 人中有 50 人为 null，使用 avg 计算得到 50 人的平均值而不是 100，需要计算 100 人的则需要将 null 替换为 0 ，用 count 统计非 NULL 字段或 IFNULL 逻辑语句
4. 都可以搭配 distinct 使用，用于统计去重后的结果
5. Count 的参数可以支持：字段、\*、常量值，一般放 1，建议使用 count (\*) 统计行数 `SELECT count(*) FROM employees;` 每行中只要不是全部单元格为 NULL 就统计一次，填任何非 NULL 字段都表示统计所有行。
	![](Files%20&%20LongText/Attachments/Pasted%20image%2020240819113858.png)
**关于 count 函数**
*和分组函数一同出现的字段在 GROUP BY 后也要求要出现*
 COUNT (\*)
- `COUNT(*)` 计算的是结果集中的行数，不管这些行中包含的是什么值（包括 NULL 值）。它实际上计算的是结果集中的行数，而不是列中的非空值的数量。
- `COUNT(*)` 会计算所有行，包括那些包含 NULL 值的行，以及由 `JOIN` 操作产生的重复行。
- `COUNT(*)` 是 SQL 标准中推荐的计数方式，因为它不依赖于任何特定的列，且性能通常优化得较好。
COUNT (1)
- `COUNT(1)` 忽略 NULL 值。
- `COUNT(1)` 也是计算结果集中的行数，包括包含 NULL 值的行和 `JOIN` 操作产生的重复行。

使用分组函数注意字段长度匹配问题，`select avg(salary),employee_id from employee;` 中 avg 得到一行，employee 为所有行，长度不匹配但不报错，数据失去了意义
本质上是对 group by 中每一个对象进行一次 SELECT 中**操作数据的**语句
分组前筛选数据源是原始表，分组后筛选是筛选一遍之后的结果（上一遍的结果表）放在 `having` 关键字中
##### 简单分组
```sql
-- 询邮箱中包含a字符的，每个部门的平均工资
SELECT
	round(avg(salary)) ,
	department_id
FROM
	employees e
WHERE
	email LIKE '%a%'
GROUP BY
	department_id ;
-- 2：查询有奖金的每个领导手下员工的最高工资
SELECT
	manager_id,
	max(salary) AS max_salary
FROM
	employees e
WHERE
	commission_pct IS NOT NULL
GROUP BY
	manager_id ; 
```
##### 二次分组
一旦出现 where 筛选之后 GROUP 分组，分组之后还需要筛选，马上想到使用 having
- 使用 having 关键字，oracleSQL 和 SQLsever 可能不支持在 having 中使用别名
- Having 作用是将 having 上面得到的结果表再进行二次筛选
- 因为 **`WHERE` 子句不能直接使用聚合函数（如 `MIN`、`MAX`、`SUM` 等）**。聚合函数只能在 `HAVING` 子句中使用
- **`WHERE`**：
    - 用于过滤 **单行数据**。
    - 在分组（`GROUP BY`）之前执行。
    - 不能直接使用聚合函数。
- **`HAVING`**：
    - 用于过滤 **分组后的结果**。
    - 在分组（`GROUP BY`）之后执行。
    - 可以直接使用聚合函数。
```sql
-- 查询每个工种有奖金的员工的高工资>12000的工种编号和最高工资
SELECT
	job_id,
	max(salary) AS m
FROM
	employees e
WHERE
	commission_pct IS NOT NULL
GROUP BY
	job_id 
HAVING
	m>12000 ; 
-- #案例3：领导编号>102的每个领导手下的最低工资大于5000的领导编号和最低工资
SELECT 
	manager_id,
	MIN(salary)
FROM
	employees
GROUP BY
	manager_id
HAVING
	MIN(salary)>5000;
-- 员工姓名的长度分组，查询每一组的员工个数，筛选员工个数>5的有哪些
SELECT
	LENGTH(last_name) AS len,
	count(*) AS num
FROM
	employees e
GROUP BY
	len
HAVING 
	len > 5
ORDER BY 
	num DESC ;
```
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240819221448.png)
##### 多字段分组
多个分组条件，即类似**每个部门中每个工种**大分类小分类分组查询
类似于 excel 中的分类汇总
![300](Files%20&%20LongText/Attachments/Pasted%20image%2020240819145532.png)
组要注意，分类汇总中的大分类和小分类通过 SELECT 字段中排序决定
```sql
SELECT
	department_id,
	job_id,
	avg(salary)
FROM
	employees e
WHERE
	salary >1000
GROUP BY
	job_id,
	department_id;  -- 与SELECT中顺序不一，按照SELECT中为准
```
#### 多表查询
##### 笛卡尔乘积现象
两个表中数据的连接
![400](Files%20&%20LongText/Attachments/Pasted%20image%2020240819153039.png)
`SELECT name ,boyName FROM beauty b,boys b2 ;` 乱配对的原因是两结果表长度不一样
![325](Files%20&%20LongText/Attachments/Pasted%20image%2020240819153633.png)
没有匹配条件都可以匹配成功
![400](Files%20&%20LongText/Attachments/Pasted%20image%2020240819153736.png)
**笛卡尔乘积现象**
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240819153820.png)
为解决笛卡尔乘积错误，需在两个表之间添加连接筛选条件
```sql
-- 笛卡尔乘积错误解决
SELECT
	f.name,
	m.boyName
FROM
	beauty f ,
	boys m
WHERE
	f.boyfriend_id = m.id ;-- 使用别名不容易混淆
```
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240819154458.png)
##### SQL 92 内连接
**所谓内连接，就是根据两个表之间的共同字段来合并行**，共同字段当做"跳板"，忽略所有没有匹配到的内容，将连接之后的表视作一张整的表
![其中全外连接MySQL不支持](Files%20&%20LongText/Attachments/Pasted%20image%2020240819155049.png) ^b 30 bab
###### 等值连接
多表等值连接条件需要多个表中有相互连接的属性（列）
N 个表连接，需要 n-1 个连接条件 
连接条件是多个表中的共有部分，作为“跳板”
```sql
-- 查询员工名对应的部门名
SELECT
	last_name,
	department_name
FROM
	employees e,
	departments d
WHERE
	e.department_id = d.department_id ;  
-- 查询有奖金的员工名，部门名
SELECT
	e.last_name,
	d.department_name
FROM
	employees e ,
	departments d
WHERE
	e.commission_pct IS NOT NULL
	AND e.department_id = d.department_id ; 
-- 查询每个城市的部门个数
SELECT
	city,
	count(*) AS num
FROM
	departments d ,
	locations l
WHERE -- 多表连接一定要使用链接条件，没有连接条件会出现笛卡尔乘积错误
	d.location_id = l.location_id 
GROUP BY
	l.city ; 
-- 查询有奖金的每个部门的部门名和部门的领导编号和该部门的最低工资
SELECT
	department_name,
	d.manager_id,
	-- 部门名和部门领导编号
	min(e.salary)  -- 最低工资
FROM
	departments d ,
	employees e
WHERE
	e.commission_pct IS NOT NULL
	AND d.department_id = e.department_id 
	-- 只有employees表员工存在的部门在department表中登记了才会显示，否则虚空上班
GROUP BY 
	d.department_name ,d.manager_id ;-- 每个部门
```
###### 非等值连接
![375](Files%20&%20LongText/Attachments/Pasted%20image%2020240819201429.png)
根据工资情况匹配相应的等级
```sql
SELECT  -- 链接工资和工资等级评测两张表
	salary,
	grade_level
FROM
	employees e ,
	job_grades jg
WHERE 
	e.salary BETWEEN jg.lowest_sal AND jg.highest_sal-- 每一个e对象的salary属性在between参数筛选
	AND jg.grade_level BETWEEN 'A' AND 'C'-- 每一个jg对象的level属性根据级别字母筛选
ORDER BY jg.grade_level ;-- 通过级别字母排序
```
###### 自连接
上司的员工编号可以查找到对应的上司编号（在这里相同），通过自连接一次语句执行两次查找同一张表，第一次查询的结果做我第二次查询的依据
![查找员工对应上司](Files%20&%20LongText/Attachments/Pasted%20image%2020240819203241.png)
```sql
SELECT
	e.last_name,
	e.employee_id,
	m.last_name ,
	m.manager_id 
FROM
	employees e ,
	employees m
	-- 本质上一张表当两张表用，分配不同的别名
WHERE
	e.employee_id = m.employee_id ;
```
##### SQL 99 内连接
![^b30bab](#^b30bab)
###### 语法更新对比
```sql
select 查询列表
from 表 1 别名 【连接类型】-- 不写连接类型默认inner
join 表 2 别名 
on 连接条件 -- 之前的筛选和连接条件全写在where中
【where 筛选条件】
【group by 分组】
【having 筛选条件】
【order by 排序列表】
分类：
内连接（★）：inner
外连接
	左外(★):left 【outer】
	右外(★)：right 【outer】
	全外：full【outer】
交叉连接：cross 
```
###### 等值连接
```sql
SELECT last_name,department_name
FROM departments d
JOIN  employees e
ON e.`department_id` = d.`department_id`;
-------------------------sql 92语法---------------------------------
SELECT last_name, department_name
FROM departments d, employees e
WHERE e.department_id = d.department_id;
```
-  `JOIN` 在 SQL 99 中后接需要连接的表名称，`ON` 子句定义了连接条件，而 `FROM` 和 `JOIN` 中表的顺序以及 `ON` 子句中表的顺序通常不会影响查询结果。
- `departments` 表和 `employees` 表将通过（`on`）`e.department_id = d.department_id` 这个条件进行连接。
```sql
-- 案例4.查询哪个部门的员工个数>3的部门名和员工个数，并按个数降序（添加排序
SELECT
	d.department_name,
	count(*) AS num
FROM
	employees e
INNER JOIN departments d ON
	d.department_id = e.department_id
GROUP BY
	d.department_name
HAVING
	num >3
ORDER BY
	num DESC;
```
- `INNER` 直接说明内连接，细致分类可通过看 on 中连接条件判断

###### 多表查询语法
本质上都使用不同表的公共部分，和 sql 92 语法不同仅仅在语法上
```sql
-- 5.查询员工名、部门名、工种名，并按部门名降序（）
SELECT
	e.last_name ,
	d.department_name,
	j.job_title
FROM
	departments d
INNER JOIN employees e ON -- 将超出两个的表全放在join后不报错但是**不推荐**
	d.department_id = e.department_id -- 代码一行行执行，所以执行到这里编译器只知道e和d，写e.job_id = j.job_id编译器不知道j是什么，不能将没有引入的表作为连接条件
INNER JOIN jobs j ON 
	e.job_id = j.job_id -- 多表连接每连接一次都要写一次join表明连接方式，代码更清晰
ORDER BY 
	d.department_name DESC ;
```
###### 非等值连接
```sql
-- 查询工资级别的个数>20的个数，并且按工资级别降序
SELECT
	jg.grade_level ,
	count(*)
FROM
	employees e
INNER JOIN job_grades jg ON
	e.salary BETWEEN jg.lowest_sal AND jg.highest_sal
GROUP BY
	grade_level
HAVING
	count(*)>20
ORDER BY
	jg.grade_level asc;
```
###### 自连接
```sql
-- 查询姓名中包含字符k的员工的名字、上级的名字
SELECT
	e.last_name,
	e2.last_name
FROM
	employees e
INNER JOIN employees e2 ON
	e.manager_id = e2.employee_id
WHERE
	e.last_name LIKE "%k%";
```
##### 外连接
外连接连接多个表，它允许从表中返回所有行，即使在另一个表中没有找到匹配的行，连接的表有主从之分，用于处理不完全匹配的情况。[内连接](#SQL%2092%20内连接)仅仅只能处理两表中有相同字段（属性），且只能返回字段中属性值一样的字段对象
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240820151116.png)**用于查询一个表中有，另一个表中没有的记录**
1. 外连接的查询结果为主表中的所有记录
   如果从表中有和它匹配的，则显示匹配的值
   如果从表中没有和它匹配的，则显示 nul 
   **外连接查询结果=内连接结果+主表中有而从表没有的记录**，查询的记录主要来自主表
2. 左外连接，leftjoin 左边的是主表
   右外连接，rightjoin 右边的是主表
3. 左外和右外交换两个表的顺序，可以实现同样的效果
4. 全外连接=内连接的结果+表 1 中有但表 2 没有的 + 表 2 中有但表 1 没有的
###### 左外连接
连列类型为 `LEFT` 表示 join 左边的表是主表，之后再对连接之后的表操作
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240820162253.png)
![主副表关系](Files%20&%20LongText/Attachments/Pasted%20image%2020240820164121.png)
- 主表中有，副表中匹配不到的，副表显示为 NULL
- 主表中没有，副表中有的，不会被主表匹配，忽略不显示
- SELECT 字段中表中字段顺序决定显示顺序（从左到右）
- 最终查询的信息来自哪个表，那个表就是主表，因为主表中内容（不加 where）都会显示，附表中没被匹配都会忽略
- 不支持表示使用后没有效果，不会报错，同[列级约束](#^c8a865)

```sql
-- 显示所有有男朋友（副）的女性（主）
SELECT
	bo.*,
	b.name
FROM
	beauty b
LEFT OUTER JOIN boys bo ON
	bo.id = b.boyfriend_id-- 显示两表连接在一起的整张大表信息
WHERE
	bo.id IS NOT NULL;   -- boyid不为NULL表示只显示被主表匹配到的
```
 Where 函数最好写值一定不为 NULL 的属性，否则语句逻辑没错但是结果错（数据录入不规范） 
![使用user\_cp做匹配会多出一个anglebaby](Files%20&%20LongText/Attachments/Pasted%20image%2020240820165221.png)
```sql
-- 查询哪个部门没有员工
SELECT
	d.department_name
FROM
	departments d
LEFT OUTER JOIN employees e ON
	e.department_id = d.department_id
/*员工信息中填部门id在部门信息总表中能够查到的，
department_name会被显示出来*/
WHERE e.employee_id IS NULL; 
/*这种显示的方式是两表拼接方式，
 * 拼接只显示SELECT字段中要求显示的部分
employees表是副表，拼接后主表department主表中查不到empolyee的信息，
也就是筛选出部门中暂时没有员工之后的**拼接表** */
```
###### 右外连接
同左外连接语法一致，同样代码将 left 替换成 right 主从表地位颠倒
###### 全外连接
- 全外连接=内连接的结果+表 1 中有但表 2 没有的 + 表 2 中有但表 1 没有的
- 主表中有，副表中匹配不到的，副表显示为 NULL
- 主表中没有，副表中有的，不会被主表匹配但也显示为 NULL（左外连接中会被忽略不显示）
- 全外连接没有主从之分

###### 交叉连接
显式使用笛卡尔乘积匹配两个表，两表相互匹配
![前表一个对象将后表所有对象全部匹配一遍](Files%20&%20LongText/Attachments/Pasted%20image%2020240820173928.png)
##### 内外连接总结
###### 所有连接的本质
-  from join 拼接主从两张表
- On 调整连接条件，决定了哪一项会显示 NULL
- 拼接之后的表通过 where 筛选出某个字段中的哪些符合条件的值会（行）被显示
- SELECT 确定哪些字段（列）**从拼接表中截取出来**显示
- 如果是外连接，拼接之后的表保留主表所有内容，副表中没有被主表中匹配填充 NULL
###### 工作原理
1. 内连接（INNER JOIN）
	- 匹配原则：只返回两个表中完全匹配的行。
	- 丢弃原则：如果一个表的某一行在另一个表中没有匹配的行，则该行不会被包含在结果集中。
	- 内连接是一种 **交集操作**，只保留两个表中 **共同满足连接条件** 的行。
2. 外连接（OUTER JOIN）
	- 外连接分为三种：LEFT JOIN、RIGHT JOIN 和 FULL JOIN。它们的区别在于保留哪个表的未匹配行。
	- 2.1 左外连接（LEFT JOIN）
		- 保留原则：返回左表（LEFT JOIN 左侧的表）的所有行，即使右表中没有匹配的行。
		- 填充原则：如果右表中没有匹配的行，则右表的字段用 NULL 填充。
		- 左外连接是一种 **左表优先** 的操作，保留左表的所有行，即使右表中没有匹配的行。
	- 2.2 右外连接（RIGHT JOIN）
		- 保留原则：返回右表（RIGHT JOIN 右侧的表）的所有行，即使左表中没有匹配的行。
		- 填充原则：如果左表中没有匹配的行，则左表的字段用 NULL 填充。
		- 右外连接是一种 **右表优先** 的操作，保留右表的所有行，即使左表中没有匹配的行。
	- 2.3 全外连接（FULL JOIN）
		- 保留原则：返回左表和右表的所有行。
		- 填充原则：如果某一行在另一个表中没有匹配的行，则用 NULL 填充。
		- 全外连接是一种 **并集操作**，保留两个表的所有行

| 特性          | 内连接（`INNER JOIN`） | 外连接（`OUTER JOIN`）    |
| ----------- | ----------------- | -------------------- |
| **匹配原则**    | 只返回匹配的行           | 返回匹配的行 + 未匹配的行       |
| **未匹配行的处理** | 丢弃未匹配的行           | 保留未匹配的行，用 `NULL` 填充  |
| **结果集大小**   | 结果集较小             | 结果集较大                |
| **应用场景**    | 查找两个表的交集          | 查找一个表的所有行，即使另一个表没有匹配 |
###### 图示
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240820174724.png)
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240826184102.png)
- 左外连接，显示左表所有内容。
- 剔除右表中匹配不上左表连接条件的==行== （如右表 id=5 的左表查不到，忽略一整行）
- 右表匹配不上左表的列，用 NULL 填充（因为左表所有内容必须保留）
- **右外连接**反之同理
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240820175815.png)
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240820181354.png)
#### 子查询
**始终记住子查询中是临时创建的虚拟表，因 from 引用表，所以必须创建别名，其他不需要**
出现在**其他语句**内部的 SELECT 语句成为子查询，内部嵌套其他 select 语句的查询成为外查询，子查询需要使用（）括起
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240824105229.png)
##### 分类
子查询优先于主查询执行
**按子查询出现的位置：**
- Select 后面：
	仅仅支持标量子查询
- From 后面：
	支持表子查询（需要引入表，而且必须有名字）
- Where 或 having 后面：★
	标量子查询（单行） √
	列子查询  （多行） √
	行子查询  （多列对行）
	表子查询
- Exists 后面（相关子查询）
	都可以加
**按结果集的行列数不同：**
- 标量子查询（结果集只有一行一列）
- 列子查询（结果集只有一列多行）
- 行子查询（结果集有一行多列）
- 表子查询（结果集一般为多行多列- 
##### Where 或 having 后
###### 标量子查询（单行子查询）
[单行操作符](#^4132db) 只能用于标量子查询
第一次查询结果为单行单列内容，作为筛选条件
```sql
-- 谁的工资比Abel高？
-- 第一步单行子查询
SELECT
	salary
FROM
	employees e
WHERE
	e.last_name = 'Abel';
-- 第二步将查询条件放入即可
SELECT
	last_name 
FROM
	employees e
WHERE
	salary > ( -- 本来这里需要填11000，这里填入查询结果只是为了动态变化
	SELECT
		salary
	FROM
		employees e
	WHERE
		e.last_name = 'Abel');
```
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240824110624.png)
支持多个标量子查询
```sql
-- 返回job_id与141号员工相同，salary比143号员工多的员工姓名，job_id和工资
SELECT job_id FROM employees e WHERE employee_id =141;
SELECT salary FROM employees WHERE 	employee_id = 143;
SELECT
	last_name,
	job_id,
	salary
FROM
	employees e
WHERE
	job_id = (
	SELECT
		job_id
	FROM
		employees e
	WHERE
		employee_id = 141)
	AND 
	salary > (
	SELECT
		salary
	FROM
		employees
	WHERE
		employee_id = 143);
```
###### 列子查询（多行子查询）
子查询结果是一列多行的内容，需要使用[多行操作符](#^4132db)
```sql
-- 部门编号在1400或1700的员工信息
SELECT
	last_name
FROM
	employees e
WHERE
	department_id IN ( -- in表示列表中的一个，所以等价于department_id = ANY(...)
	SELECT -- 这里不能用distinct，因为1400或1700号一个部门中
	-- 可能不止一个员工使用distinct会缺少信息
		department_id
	FROM
		departments d
	WHERE
		d.location_id IN (1400, 1700))
```
Any - 实例
```sql
-- 返回其他工种中比job_id为TIT_PRoG'部门任一工资低的员工
-- 的员工号、姓名、job_id以及salary
SELECT
	last_name,
	job_id,
	employee_id,
	salary
FROM
	employees e
WHERE
-----------------------------------------
	salary < ANY( -- any后返回一列多行内容
	SELECT
		DISTINCT salary
	FROM
		employees e2
	WHERE
		job_id = 'IT_PROG')
------------------ 等价于，如果any前是> 那么就等价于min
	salary < ( -- 这里是单行子查询得到一行一列内容
 	SELECT
 		DISTINCT max(salary)
 	FROM
 	employees e2
 	WHERE
 	job_id = 'IT_PROG')
```
###### 行子查询（多列多行）
多个使用=的子查询可以使用行子查询代替
```sql
-- 查询最小员工编号 但拥有最高工资的员工信息（假设存在）
SELECT
	e.*
FROM
	employees e
WHERE
----------------------------
	e.employee_id = (
	SELECT
		min(employee_id)
	FROM
		employees e)
	AND e.salary = (
	SELECT
		max(salary)
	FROM
		employees e2)
-----------------------等价于
	WHERE --- 行子查询表示对多个条件同时筛选
	(employee_id,
	salary) = ( -- 这就是限制所在， 不同行之间需要都等值筛选条件
	SELECT
		min(employee_id),
		max(salary)
	FROM
		employees e2) ;
```
#####  SELECT 后
```sql
SELECT
	d.department_name,
	(
	SELECT
		count(*)
	FROM
		employees e
	WHERE
		e.department_id = d.department_id) AS peopl_in_count
FROM
	departments d; 
```
注意：子查询只能查询一行一列的数据，在子查询 SELECT 或 where 中添加或减少条件都会报错
#####  from 后
```sql
-- 查询每个部门的平均工资等级
SELECT
	ag_dep.*,
	g.grade_level
	-- 外层嵌套一个SELECT放入别的数据
FROM
	(
	SELECT
		-- 引用子查询中的部门平均工资表
		AVG(salary) ag,
		department_id
	FROM
		employees
	GROUP BY
		department_id) ag_dep
	-- DQL语句所有结果是虚拟的，
	-- 创建的表放在from中表示引用，那么必须有名字
INNER JOIN job_grades g
ON
	ag_dep.ag BETWEEN lowest_sal AND highest_sal;
```
子查询中的内容：
![350](Files%20&%20LongText/Attachments/Pasted%20image%2020240824135242.png)
现在要求新加上一列，而且这一列来自别的表，所以只能外层嵌套一个 SELECT 放入这一列
#####  exist 后（相关子查询）
`EXISTS` 是一个布尔操作符，用于检查子查询是否返回任何行。如果子查询返回至少一行，`EXISTS` 返回 `TRUE`；如果没有返回任何行，`EXISTS` 返回 `FALSE`
- **性能考虑**：`EXISTS` 通常在找到第一个匹配项后就会停止执行子查询，这使得它在某些情况下比 `IN` 更高效，尤其是在子查询返回大量数据时。
- **子查询返回值**：`EXISTS` 只关心子查询是否返回行，而不关心返回的具体值。因此，在 `EXISTS` 的子查询中，通常使用 `SELECT 1` 或其他常量，因为具体的返回值并不重要。
- Exists 的返回值只有 0 和 1，如果使用**NOT exists**则反之

| 特性                      | `NOT EXISTS`                 | `NOT IN`                                              |
| ----------------------- | ---------------------------- | ----------------------------------------------------- |
| **逻辑**                  | 检查子查询是否返回任何行。如果没有返回行，则条件为真。  | 检查某个值是否不在子查询的结果集中。                                    |
| **子查询结果包含 `NULL` 时的行为** | 不受 `NULL` 值影响，只检查子查询是否返回任何行。 | 如果子查询结果中包含 `NULL`，则整个 `NOT IN` 条件返回未知（通常被视为 `FALSE`）。 |
| **性能**                  | 通常更高效，因为它可以在找到第一个匹配行时停止搜索。   | 需要对整个子查询结果集进行比较，可能效率较低。                               |
| **适用场景**                | 适合处理复杂条件或关联查询。               | 适合处理简单的值列表过滤。                                         |
```sql
-- 查询由部门编号的员工来自哪个部门
SELECT -- 来自哪个部门
	department_name
FROM
	departments d
WHERE
	EXISTS ( -- 下面代码会返回整行员工所有信息，但exists不在乎，只要返回外层查询就执行
	SELECT -- 由部门编号的员工
		*
	FROM
		employees e
	WHERE
		e.department_id = d.department_id
);
-- 等价于
SELECT
	-- 来自哪个部门
	department_name
FROM
	departments d
WHERE
	d.department_id IN (
	SELECT
		e.department_id
	FROM
		employees e);
```
[课后练习（长篇幅）](Files%20&%20LongText/Long%20code/MySQL%20Long%20Code%20Practice.md)
##### 总结
`in (array)`  equals to `= any (array)`
`< any (array`) equals to `< ... max`
`> any (array)` equals to `> ... min`
`not in (array) ` equals to `<> all (array)` 
#### 分页查询
数据在一页中显示不完需要分也显示
语法
```sql
select 查询列表
from 表
【join type join 表 2
on 连接条件
where 筛选条件
group by 分组字段
having 分组后的筛选
order by 排序的字段】
----------- 上为可选字段-------------
limit 【offset,】size;
offset 要显示条目的起始索引（起始索引从 0 开始）
size 要显示的条目个数
```
查询前 5 条员工信息
```sql
SELECT * FROM employees e LIMIT 0,5;-- 等价于
SELECT * FROM employees e LIMIT 5;
-- 有奖金的员工信息，并且工资较高的前10名显示出来
SELECT
	last_name
FROM
	employees e
WHERE
	commission_pct IS NOT NULL
ORDER BY
salary DESC
LIMIT 10;
```
使用公式 `limit (page-1)*size,size;` 可以达到网页中按页数显示内容
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240824164459.png)
**LIMIT 的执行顺序和书写顺序都在最后**—— [DQL 语句执行和书写顺序](#DQL%20语句执行和书写顺序)
------------------------ [大量练习](Files%20&%20LongText/Long%20code/MySQL%20Long%20Code%20Practice.md#DQL%20除联合查询外联系) --------------
#### Union 联合查询
`UNION` 是 SQL 中用于合并两个或多个 `SELECT` 语句结果集的运算符。它会将多个**查询的**结果集合并成一个结果集，并默认**去除重复的行**。`UNION` 通常用于从不同的表中检索数据，或者从同一个表中检索不重复的数据。**将毫不相关但需要查询相同字段内容的两个表连接成一个表**
```sql
SELECT name, department
FROM employees1
UNION
SELECT name, department
FROM employees2;
```
^ba 687 a
1. 从 `employees1` 表中选择 `name` 和 `department` 字段。
2. 从 `employees2` 表中选择 `name` 和 `department` 字段。
3. 将这两个查询的结果集合并在一起。
4. 去除合并结果中重复的记录，即如果 `employees1` 和 `employees2` 中有相同的 `name` 和 `department` 组合，则只保留一个。
最终，得到一个包含所有不重复的 `name` 和 `department` 组合的列表，这些组合来自于 `employees1` 和 `employees2` 两个表。
在 [DML 语言](#^096846) 中可作为插入多条数据的连接符
注意：
5. **列数和数据类型**：参与 `UNION` 的每个 `SELECT` 语句必须有相同数量的列，并且对应列的数据类型需要兼容。如果数据类型不兼容，SQL 会尝试进行隐式转换。
6. **列名**：在使用 `UNION` 时，列名通常来自第一个 `SELECT` 语句。后续的 `SELECT` 语句中对应的列名可以不同，但它们的数据类型必须与第一个 `SELECT` 语句中的列类型相匹配。
7. **去重**：`UNION` 默认去除两个 SELECT 中查询字段中相同的值的数据（即[上面代码中](#^ba687a) name 和 department 都相同的数据行）。如希望保留所有行，可以使用 `UNION ALL`。
8. **排序**：`UNION` 不保留各个 `SELECT` 语句中的排序。如果需要对最终结果进行排序，需要在 `UNION` 之后使用 `ORDER BY`
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240825112318.png)
### DML （datebase manage language）
#### 插入语句
语法：
`insert into 表名(列名,...) values(值1,...);`
Values 列表需要和列名列表数据类型**匹配**并且数量相同，匹配意思是数据类型近似相同，能隐式转换不报错（如 char ‘123’隐式转换为 int 123，float (5,2) 123.45 可以转换成 int 123）
```sql
-- 法一：插入字段/值列表
INSERT INTO beauty(id,NAME,sex,borndate,phone,photo,boyfriend_id)
VALUES(13,'唐艺昕','女','1990-4-23','1898888888',NULL,2);
-- 对于可以为NULL的字段，无需填写数据时：
-- 1. 在相应的字段中填写NULL
-- 2. 在INSERT字段列表中**可以**不填字段名，values中只填INSERT中有的
INSERT INTO beauty(id,NAME,sex,phone)
VALUES(15,'娜扎','女','1388888888');
-- 在INSERT INTO后可以直接接表名不加字段列表，但写values时为空的字段一定要写NULL
INSERT INTO beauty
VALUES(18,'张飞','男',NULL,'119',NULL,NULL);
-- 法二：等值插入法
-- 写set时用等号连接值
insert into 表名
set 列名=值,列名=值,...
INSERT INTO beauty
SET id=19,NAME='刘涛',phone='999';
```
在已经初始化表之后 INSERT 中列字段的顺序可以颠倒，即 `(id,NAME,sex,phone)` 括号中字段顺序并不重要，已经定义好了
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240826081258.png)
- 方法一支持插入数据时支持一次性插入多行，不同 values 列表之间 `,` 连接。支持子查询
```sql
-- INSERT INTO 表名之后直接接能够返回结果集的语句
INSERT INTO beauty(id,NAME,phone)
-- 下面代码能够返回一行内容
SELECT id,boyname,'1234567'
FROM boys WHERE id<3;
```
- 方法二不支持多行插入和子查询

对于多条数据查询：
可以使用[学习/SQL/MySQL \> union 联合查询](#union%20联合查询)方法插入多条数据
![500](Files%20&%20LongText/Attachments/Pasted%20image%2020240825153345.png) ^096846
#### 修改语句
##### 修改单表记录
语法：
Update 表名
Set 列=新值, 列=新值,...
Where 筛选条件;
```sql
-- 案例1 ：修改 beauty 表中姓周的女神的电话为 13899888899
UPDATE beauty SET phone = '13899888855' WHERE name LIKE '周%';
-- 多属性设置
UPDATE boys SET boyName = '张飞',userCP = 1000 WHERE id = 2;
```
注意修改语句要一般需要加 where 前置条件，不然会**无差别更新所有 update 中的字段** ^f 003 b 6
##### 修改多表记录【补充】
语法：
Sql 92 语法：
Update 表 1 别名, 表 2 别名
Set 列=值,...
Where 连接条件
And 筛选条件;
Sql 99 语法：
Update 表 1 别名
Inner|left|right join 表 2 别名
On 连接条件
Set 列=值,...
Where 筛选条件;
#### 删除语句（行删除）
列删除见[学习/SQL/MySQL \> 列删除](#列删除)
方式一：delete
语法：
单表删除【★】
`delete from 表名 where 筛选条件 或 limit 条目数`
同[修改语句](#^f003b6)不加 where 会**无差别删除所有行**
删除方式为行匹配，delete 后不能加任何参数才表示单表删除行匹配
```sql
-- #案例 ：删除手机号以 9 结尾的女神信息
DELETE FROM beauty WHERE phone LIKE '%9';
-- 自上而下删除n条数据记录
DELETE FROM beauty limit n;
```
多表删除【补充】
Sql 92 语法：
Delete 表 1 的别名**或**表 2 的别名（删谁写谁）
From 表 1 别名, 表 2 别名
Where 连接条件
And 筛选条件;
Sql 99 语法：
Delete 表 1 的别名, 表 2 的别名
From 表 1 别名
Inner|left|right join 表 2 别名 on 连接条件
Where 筛选条件;
```sql
-- #案例 ：删除张无忌的女朋友的信息
DELETE b -- 再写上bo会删除boys表中 bo. `boyName` ='张无忌’也删除
FROM beauty b
INNER JOIN boys bo ON b.`boyfriend_id` = bo. `id`
WHERE bo. `boyName` ='张无忌';
```
方式二：truncate
`语法：truncate table 表名;`
1. 清空表的所有内容，没有多余操作和参数可以添加
2. 不能加 where 也不能连接其他表
3. 假如要删除的表中有**自增长列**，如果用 delete 删除后，再插入数据，自增长列的值从断点开始，而 truncate 删除后，再插入数据，自增长列的值从 1 开始。 ^018766
4. Truncate 删除没有返回值，delete 删除有返回值。（返回有多少行受到影响）
5. Truncate 删除不能回滚，delete 删除可以回滚.
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240825152631.png)
### DDL (date define language)
和 DML 语言不一样，DML 操作的是数据，对行，**没有列**，表中的数据进行操作，DDL 操作的是库，表存储单元
#### 库相关
创建库；`create database  [if not exists]库名 character set 字符集名;`
修改库：`RENAME DATABASE books TO 新库名;` 现版本已废弃，所以一般不修改库名称
	# 修改库名
	本地 sql 存储位置<C:\ProgramData\MySQL\MySQL Server 8.0\Data>，在命令行中关闭 sql 服务后修改文件夹名称后重启即可改名
	# 更改库的字符集
	`ALTER DATABASE books CHARACTER SET gbk;`
	![325](Files%20&%20LongText/Attachments/Pasted%20image%2020240825160601.png)
	#3 、库的删除
	`DROP DATABASE IF EXISTS books;`
#### 表相关
##### 创建表
语法：
Create table 表名 (
	列名列的类型【(长度) 约束】,
	列名列的类型【(长度) 约束】,
	列名列的类型【(长度) 约束】,
	...
	列名列的类型【(长度) 约束】
```sql
#案例：创建表author
CREATE TABLE IF NOT EXISTS author(
	id INT,
	au_name VARCHAR(20),
	nation VARCHAR(10)
)
DESC author;
```
##### 修改表
语法：`alter table 表名 add|drop|modify|change column 列名 【列类型 约束】`
对于 add 添加列可以在语句默认添加在最后，语句后补充 `【first|after  字段名】` 表示新添加列的位置
```sql
-- 添加新列
ALTER TABLE author ADD COLUMN annual DOUBLE; 
-- 修改列名
ALTER TABLE book CHANGE COLUMN（column可以省略） publishdate（旧名） pubDate（新名） DATETIME（类型）
-- 修改列的类型或约束 更改原类型（不写）为TIMESTAMP
ALTER TABLE book MODIFY COLUMN pubdate TIMESTAMP;
-- 删除列
ALTER TABLE table_name DROP COLUMN column_name;
-- 修改表名
ALTER TABLE author RENAME TO book_author;
```
##### 复制表
复制支持跨库复制表，在 old_table 前加 `库名.` 即可
仅复制结构：`CREATE TABLE new_table LIKE old_table;`
复制部分结构：
```sql
CREATE TABLE new_table 
SELECT 
	部分字段名称 
WHERE 0 -- 0 表示不会成立的内容，不会有数据行匹配成功
```
复制结构和数据：`CREATE TABLE new_table SELECT * FROM old_table;`
复制部分数据：
```sql
CREATE TABLE new_table
SELECT
	需要复制的字段（列）
FROM
	old_table
WHERE
	需要复制的数据（行）
```
##### 删除表
语法：`DROP TABLE IF EXISTS table_name`
通常在创建新表、库时为保证按照自己意愿创建，先删除同名表（如果存在）然后创建
```sql
DROP DATABASE IF EXISTS 旧库名;
CREATE DATABASE 新库名;
DROP TABLE IF EXISTS 旧表名;
CREATE TABLE  表名();
```
#### 数据类型和约束
##### 类型填写
数值型：
	整型
	小数：
		定点数
		浮点数
字符型：
	较短的文本：char、varchar
	较长的文本：text、blob（较长的二进制数据）
日期型：
###### 整形： 
- 输入图中数据类型默认为有符号，定义无符号需在**后面**加 UNDESIGN
- 如果不设置长度，使用操作系统默认长度，长度代表了显示的最大宽度，如果不够会用 0 在左边填充，但必须搭配 `zerofill` 使用！
- 如果插入的数值超出了整型的范围, 会报 `out of range` 异常，并且插入临界值
- 如果定义 `int(7)` 并不是表示数据会限定出现 7 位数，数据显示多少由数据类型决定（无符号 0 到 4,294,967,295，有符号-2,147,483,648 到 2,147,483,647），int 最大支持 10 位数。7 的意义是在使用 `ZEROFILL` 时，不足 7 位数的数字会在左边填充 0 而达到 7 的指定宽度
- 加了 `ZEROFILL` 的**任何整数类型**都会变为无符号类型
![400](Files%20&%20LongText/Attachments/Pasted%20image%2020240825200427.png)
###### 小数
1. 浮点型
Float (M, D)
Double (M, D)
2. 定点型
Dec (M，D)  也可以写作  decimal (M, D)
M：整数部位+小数部位
D：小数部位
无论超过 M 还是 D 的范围，则插入临界值
```sql
DROP TABLE tab_float;
CREATE TABLE tab_float(
	f1 FLOAT(5,2),
	f2 DOUBLE,
	f3 DECIMAL
);
SELECT * FROM tab_float;
-- 向f1中填入123.456，总长度为5超了，小数超了一位所以去掉，四舍五入为123.46
-- 向f1中填入1234.5，总长度5满足，整数位5-2=3超了，所以整体取临界值999.99
-- decimal在不设置长度时默认为(10,0),float与double无长度设置时自动决定长度与精度
-- 所选择的类型越简单越好，能保存数值的类型越小越好。能提高速度
```
###### 字符型
Char 和 varchar 的区别在于定义列为 char (10) 表示该字段中的内容都会分配 10 **字符空间**（如“中国”，“hi”都占用两个字符长度）而不论输入内容的真实长度，varchar 是可变的，不够就加，多了就减。
- 无论实际存储的字符串长度如何，`CHAR` 类型都会占用指定长度的空间。如果存储的字符串长度小于声明的长度，剩余的空间会用空格填充。
- 由于 `CHAR` 类型是固定长度，读取和写入操作通常更快

- `varchar` 声明长度为 `n`，实际存储的字符串长度可以是 0 到 `n` 个字符，**不是固定长度**
- `CHAR` 的最大长度是 255 个字符，而 `VARCHAR` 的最大长度是 65,535 个字符。
- Char 不写长度默认为 1，varchar 不能省略商都
[关于LENGTH函数识别字符长度和字节长度](#^3ce0f3)
Binary 和 varbinary 类似于 char 和 varchar 名单是他们只能包含二进制字符串
Enum（Enumerate）表示枚举类型（**不区分大小写**）
	`NUM` 类型列只能存储预定义值列表中的值。尝试插入不在列表中的值会导致错误或自动转换为列表中的一个有效值（在枚举中的字符大小写转换，不在其中的转换为空格，这点会根据数据库系统而自动修正）。
	![400](Files%20&%20LongText/Attachments/Pasted%20image%2020240825205430.png)
	![注意插入空值而不是NULL](Files%20&%20LongText/Attachments/Pasted%20image%2020240825205514.png)
Set 与 enum 类似，但支持子枚举列表插入
![插入枚举列表的子列表内容](Files%20&%20LongText/Attachments/Pasted%20image%2020240825210158.png)
如果 `set` 枚举列表是 unioncode 中的所有字符，那么理论上可以插入任意文本内容
###### 日期型
![400](Files%20&%20LongText/Attachments/Pasted%20image%2020240825212421.png)
一般能使用 timestamp 就用，超出范围再考虑 datatime
Datetime 时间格式只输入时间或只输入日期，缺少部分会默认填充为 0
![400](Files%20&%20LongText/Attachments/Pasted%20image%2020240825213201.png)
			字节范围时区等的影响
Datetime    8		1000——9999	                  不受
Timestamp	4	    1970-2038	                    受
##### 约束填写
###### 分类：六大约束
| 关键字            | 名称   | 作用                                                                                | 举例                            |
| -------------- | ---- | --------------------------------------------------------------------------------- | ----------------------------- |
| NOT NULL       | 非空   | 用于保证该字段的值不能为空                                                                     | 如姓名、学号等                       |
| DEFAULT        | 默认   | 用于保证该字段不填值不报错使用默认值                                                                | 如性别                           |
| PRIMARY KEY    | 主键   | 用于保证该字段的值具有唯一性，**并且非空**           | 比如学号、员工编号等                    |
| UNIQUE         | 唯一   | 用于保证该字段的值具有唯一性，**可以为空**                                                           | 比如座位号，身份证号，不会有人重复             |
| CHECK          | 检查约束 | 即只能填写 check 约束中允许的字段值【mysql 中不支持】                                                  | 比如年龄（只支持填入 1~18 岁）、性别（只支持男、女） |
| FOREIGN KEY    | 外键   | 用于限制两个表的关系，维护表与表之间的参照完整性。外键列的值必须在被引用表的**主键**或**唯一键**中存在，并且外键连接的两个列**数据类型必须完全一样**。 | 类似于 check ，只是允许填入的值来自外部表      |
| INDEX          | 索引   | 索引可以提高查询性能，但会降低插入和更新数据的性能。                                                        | 再大量样本中经常查询的内容设置索引             |
| AUTO_INCREMENT | 自增长  | 自动为新插入的行生成**唯一**的整数，通常用于主键（MySQL 专属），可通过设置 variable auto_increment 调整步长           | 经常需要插入新内容的位置                  |
Key 可以是主键、外键、唯一键和 [[drafts]] ^a 77 b 27
- 外键约束
```sql
CREATE TABLE Orders (
    OrderID INT NOT NULL PRIMARY KEY,
    EmployeeID INT,
    FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID)
);
```
**说明**: 
- `Orders` 表中的 `EmployeeID` 列是外键，引用 `Employees` 表的 `EmployeeID` 列。这意味着 `Orders` 表中的 `EmployeeID` 必须作为**主键或者唯一键**存在于 `Employees` 表中，同时数据类型必须要**完全相同**
- 并且如果 A 表的 a 列与 B 表的 b 列设置了外键约束（`constrain fk_A_b foreign key (a) references B(b);`）那么*外人优先*，只有先在 B 表 b 列中插入相应的值，A 表中才能**插入 B 表 b 列中允许的值**，相当于在外部表设置了 `check`
- `check` 条件约束一般使用 `ALTER` 对整个表**所有列**设置约束，具体怎么设置填写在括号中，参考 [[#check 条件约束|check 条件约束]]
###### 添加约束的时机：
1. 创建表时
2. 修改表时
前提是表中还**未填入任何数据**
```sql
USE students;
DROP TABLE stuinfo;
CREATE TABLE stuinfo (
	id INT PRIMARY KEY, -- #主键，默认非空
	stuName VARCHAR (20) NOT NULL UNIQUE, -- 定义unique唯一但可为空，再添加非空 
	gender CHAR (1) CHECK (gender='男' OR gender ='女'), -- #检查，check后可用筛选语句写法，如 gender in(‘m’，‘f’)
	seat INT UNIQUE, -- #唯一
	age INT DEFAULT  18, -- #默认约束，类型和字段类型int保持一致
	majorId INT REFERENCES major (id) -- #外键，不需要写foreign key
);
```
###### 列级约束：
六大约束语法上都支持，check 在 MySQL 中不支持没有效果，外键约束没有效果（但不报错，同[全外连接](#全外连接)）。添加在字段名后，多个约束不需要，分割
使用 `SHOW INDEX FROM table_name;` 查看表的索引。包括主键、外键、唯一
`DESC stuinfo;` 查看表的结构，两者结合使用查看所有的约束
列级约束中外键约束不用 foreign key，在标记约束中才会加上
![主键、外键、唯一键自动生成索引](Files%20&%20LongText/Attachments/Pasted%20image%2020240826094111.png)
 ^c 8 a 865
###### 表级约束：	
除了非空、默认，其他的都支持
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240826095755.png)
语法：在各个字段的最下面
` 【constraint 约束名】 约束类型 (字段名) `
当不加约束名时，除主键外都使用字段名作为默认索引名
###### 两种约束区别
- 列级约束是直接在列定义中指定的约束。它们只影响单个列
- 表级约束是在表定义的末尾声明的，可以涉及多个列。
- 两种约束都可以对填入列的数据进行约束，一般单列内容的（多种）约束用列级约束写明，多列内容的单个约束使用表级约束写明，外键约束一般写在表级约束中。

###### 主键与唯一对比
**允许列数：** 只允许一个主键列（为多列整体设置为一个主键列），多个唯一列（每列唯一属性各自独立）
**是否允许组合**：将两列内容作为一个主键，只有两列内容完全相同才会违反主键数值唯一条件而报错，两者都允许
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240826180925.png) ![设置john的stuname列和id为组合主键](Files%20&%20LongText/Attachments/Pasted%20image%2020240826181038.png)
只有名称列内容和 id 列都一样是触发错误
**唯一性的区别**：
|     | 保证唯一性 | 是否允许为空 | 一个表中可以有多少个 NULL | 是否允许组合 |     |
| --- | ----- | ------ | -------------- | ------ | --- |
| 主键  | √     | ×      | 至多有 1 个          | √，但不推荐 |     |
| 唯一  | √     | √      | 可以有多个          | √，但不推荐 |     |
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240826181915.png)
**外键连接**：
	1、外键链接语法需要放在表级约束中，不然没效果
	2、从表的外键列的类型和主表的关联列类型要求一致或兼容，名称无要求（但一般一样）
	3、主表的关联列必须是一个 key（一般是主键或唯一列），使用外键连接的列是主键列时主键列在 MYSQL 中不支持改名（默认为 PRIMARY KEY）
	4、因为定义表时还没有插入数据，插入数据时，先插入主表，再插入从表。删除数据时，先删除从表，再删除主表
###### 修改表时添加约束
在[修改表](#修改表)语法中，
- **添加约束**: 使用 `ADD CONSTRAINT` 或 `MODIFY`。
- **删除约束**: 使用 `DROP CONSTRAINT`。
- **修改数据类型或默认值**: 使用 `MODIFY` 或 `ALTER COLUMN`。
- **重命名列或表**: 使用 `RENAME COLUMN` 或 `RENAME TO`。
```sql
-- 模式改为 modify 表名更改的约束名约束信息
ALTER  TABLE table_name MODIFY attribute_name restrain_type`;
-- 添加列为主键、唯一约束时，还可以写成下面形式（表级约束）
ALTER  TABLE table_name PRIMARY KRY(attribute_name1,attribute_name2....);
-- 添加多条主键约束支持写主键列表
-- 添加外键约束
ALTER  TABLE table_name [ CONSTRAINT refrain_name ] restrain_type quota_foreign_Key ;
-- 删除非空约束、默认、主键、唯一
ALTER TABLE stuinfo MODIFY COLUMN stuName varchar(20) NULL;
ALTER TABLE stuinfo MODIFY COLUMN age int; -- 重新定义一次，这次不设置默认
ALTER TABLE stuinfo DROP PRIMARY KEY; 
-- 不用指定哪一列是主键列，因为主键列是对单列或多列的整体约束，不是针对每列设置有主键属性
ALTER TABLE stuinfo DROP INDEX seat; 
-- 每个唯一列独立，对每一列单独设置的唯一属性，需指定
ALTER TABLE stuinfo DROP FOREIGN KEY fk_name;
-- 注意删除使用的是**自定义的**外键名而不是外键的字段名
```
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240827190304.png) 
###### 约束使用示例
```sql
use Exam;
drop table if exists major ;
CREATE TABLE major
  (
     major_name VARCHAR(15),
     major_id   INT primary key
  ); 
drop table if exists test;
CREATE TABLE test
  (
     stu_name   VARCHAR(20),
     stu_number INT NOT NULL,
     gender     CHAR(1) CHECK(gender = 'm' OR gender = 'f'),
     age        SMALLINT DEFAULT 18,
     seat       INT UNIQUE,
     id         INT,
     majorid    INT,
     stu_info   VARCHAR(50),
	 -- 列级约束
     UNIQUE(id, stu_info),
	 -- 表级约束
	 constraint uq unique(id),-- 这里的uq约束只会指向id列的unique约束而不涉及到stu_info
     CONSTRAINT pk PRIMARY KEY(stu_number),
	 -- 列级约束写法 primary key(stu_number),
     CONSTRAINT fk_test_majorid FOREIGN KEY(majorid) REFERENCES major(major_id) ON DELETE CASCADE
	 -- 列级约束写法 majorid references major(major_id),
  ); 
  -- 删除seat列
  alter table Exam..test drop constraint uq;
  -- 如果不在表级约束中使用uq别名，直接使用drop constraint UNIQUE 会影响id和stu_info两列
  alter table Exam..test drop column seat;
```
Sql 中对不同的约束会使用哈希算法计算唯一一个代号指代每个约束对象，即使 unique 两次作用于 id 列也不会出现紊乱。
##### 标识列（自增长列）
###### 使用方法
不用手动插入值，系统自动排序。注意 [truncate和delete的区别](#^018766)
**方法**：在想要设置为标识列后面加 `AUTO INCREMENT` 关键字
```sql
DROP TABLE IF EXISTS test;
CREATE TABLE test(id int PRIMARY KEY AUTO_INCREMENT ,
`name` varchar(20));
INSERT INTO test values(1,'john'); -- 不加自增长标识每次添加数据必须重写序号，因为是PRIMARY
INSERT INTO test values(null,'john'); -- 自增长列添加数据为NULL或省略，系统自动补充
```
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240827191526.png)
###### 调整步长
1、标识列必须和主键搭配吗？不一定，但要求是一个 Key ![^a77b27](#^a77b27)
2、一个表可以有几个标识列？至多一个！
3、标识列的类型只能是数值型
```sql
INSERT INTO test values(1,'john'); -- 不加自增长标识每次添加数据必须重写序号，因为是PRIMARY
INSERT INTO test values(null,'john'); -- 自增长列添加数据为NULL，系统自动补充
SHOW variables LIKE '%auto_increment%'; -- 查看MYSQL中各种操作的默认变量
SHOW variables; -- 查看所有变量和值，关于auto_increment有两个变量，步长和偏移量（索引起始值，一般从1开始）
SET auto_increment_increment = 3; -- 全局修改步长
ALTER TABLE `test` AUTO_INCREMENT = 3; -- 对单个表修改步长
SELECT * FROM test;
```
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240827202354.png)
可以在修改表时设置、删除标识列
```sql
ALTER TABLE test MODIFY id int PRIMARY KEY AUTO_INCREMENT; -- 修改表时设置自增列
ALTER TABLE test MODIFY id int PRIMARY KEY; -- 修改表时删除自增列（重定义）
```
##### 级联操作
###### 级联修饰符
- **`CASCADE`**: 自动删除或更新从表中的相关记录。如果从表中有记录则执行操作
- **`RESTRICT`**: 阻止删除或更新主表中的记录，如果从表中存在引用则阻止执行操作
- **`NO ACTION`**: 与 `RESTRICT` 类似，阻止删除或更新，表示删除或者更新时没有操作。
- **`SET NULL`**: 将从表中的引用列设置为 `NULL`。
- **`SET DEFAULT`**: 将从表中的引用列设置为默认值。
在一般这些修饰符用于外键链接时，保证数据库的*参照完整性*，如：
###### 数据库完整性操作实例
（1）删除 xs 表中记录的同时删除 xk 表中与该记录学号字段值相同的记录；
`on delete cascade`, 如果 xk （外键表）中没有对应的记录会被拒绝修改
（2）修改 xs 表某记录的学号时，若 xk 表中与该字段值对应的有若干条记录，则拒绝修改；
`on update restrict`
（3）修改 kc 表课程号字段值时，该字段在 xk 表中的对应值也应修改；
`on update cascade`
（4）删除 kc 表一条记录时，若该字段在在 xk 表中存在，则删除该字段对应的记录；
`on delete cascade`
（5）向 xk 表添加记录时，若该记录的学号字段的值在 xs 表中不存在，则拒绝插入；
`ON DELETE RESTRICT;`
通用写法是：
```sql
ALTER TABLE A
ADD CONSTRAINT fk_A_B
FOREIGN KEY (a) REFERENCES B(b)
ON 某个操作[update\delete] 处理方式[cascade\restrict\set (not) null];
```
- 注意约束名称的命名 `fk_A_B` 表示 A 表和 B 表中有列通过外键链接
使用 `ON DELETE CASCADE` 后缀表示外键链接的两列在一个表中有一个被删除，另一个表中相同数据执行相同操作
`ON DELETE SET (NOT) NULL` 表示再删除时级联设置外键连接对象为 `NULL`
##### Check 条件约束
`check()` 括号中可以使用不同条件语句限制填入内容，用 `,` 分隔
- 定义 check 约束，要求学生学号学号必须为 9 位数字，不能以 0 开头，第二三位皆为 0；
```sql
ALTER TABLE xs
ADD CONSTRAINT chk_xs_student_id
CHECK (
    LEN(学号) = 9
    AND 学号 NOT LIKE '0%'
    AND SUBSTRING(学号, 2, 2) = '00'
);
```
表示对**整个表**添加一个约束，本例中约束只限制的学号。

---
- 定义学生成绩数据库中 xs 表中学生年龄值在 16-25 范围内；
```sql
ALTER TABLE xs
ADD CONSTRAINT chk_xs_age 
CHECK(xs.age BETWEEN 16 AND 25); 
```
- 定义学生成绩数据库中 xs 表中学生姓名长度在 2-8 之间；
```sql
ALTER TABLE xs
ADD CONSTRAINT chk_xs_name_length
CHECK (LEN(姓名) BETWEEN 2 AND 8);
```
- 定义学生成绩数据库中 xs 表中学生性别列中只能输入“男”或“女”；
```sql
ALTER TABLE xs
ADD CONSTRAINT chk_xs_gender
CHECK (性别 IN ('男', '女'));
```
- 定义学生成绩数据库 xs 表中学生年龄值默认值为 20；
```sql
ALTER TABLE xs
ALTER COLUMN 年龄 SET DEFAULT 20;
```
- 修改 xs 表学生的年龄值约束可以为 15-30 范围内；
```sql
-- 删除现有的年龄 CHECK 约束（假设约束名为 chk_xs_age）
ALTER TABLE xs
DROP CONSTRAINT if exists chk_xs_age;
-- 添加新的年龄 CHECK 约束
ALTER TABLE xs
ADD CONSTRAINT chk_xs_age_new
CHECK (年龄 BETWEEN 15 AND 30);
```
##### 定义规则并绑定
规则（Rule）和 CHECK 约束（Check Constraint）都可以用来限制列中的数据，但它们在功能、应用范围和实现方式上有一些关键区别。
- 规则是一个独立的对象，可以定义一次并应用于多个列或多个表。
- CHECK 约束是表定义的一部分，直接在表创建或修改时定义。
###### 规则（Rule）和 CHECK 约束
规则
- **多列应用**: 规则可以应用于多个列，甚至多个表。
- **灵活性**: 规则可以定义一次，然后在多个地方重复使用。
- **功能**: 规则主要用于定义数据的格式和范围，但不支持复杂的逻辑。
- **限制**: 规则不能引用其他列或表中的数据。
- **示例**: 一个规则可以同时应用于 `xs` 表的 `年龄` 列和 `xk` 表的 `成绩` 列。

---
Check 约束
- **单列应用**: 每个 CHECK 约束通常只应用于一个列（尽管可以定义多个 CHECK 约束）。
- **表级约束**: CHECK 约束是表的一部分，不能直接应用于多个表。
- **示例**: 一个 CHECK 约束只能应用于 `xs` 表的 `年龄` 列，或者 `xk` 表的 `成绩` 列。
- **功能**: CHECK 约束可以包含复杂的逻辑，可以引用同一行中的其他列，甚至可以引用其他表中的数据。

**规则**适用于简单的、重复性的数据验证需求，尤其是在多个列或多个表中需要应用相同的验证规则时。
**CHECK 约束**适用于需要复杂逻辑或跨列、跨表引用的数据验证需求。
###### 定义并使用
限定课程表中的课程号字段值为 5 个数字字符的
```sql
-- 定义规则
CREATE RULE rule_course_number  -- 规则命名：rule_规则所限定的内容描述
AS
    LEN(CAST(course_number AS VARCHAR)) = 5
    AND course_number NOT LIKE '%[^0-9]%',
    @value BETWEEN 16 AND 25,
    @年龄 BETWEEN 16 AND 25,
    NEW.年龄 BETWEEN 16 AND 25;
-- 使用规则
EXEC sp_bindefault 'rule_course_number', 'kc.课程号';
EXEC sp_bindefault 'rule_course_number', 'kc.年龄;
```
- `@value BETWEEN 16 AND 25`; 表示使用这个规则的列中每行单元格内容中的 value 部分（作用于一个表中的一列）要满足 `BETWEEN 16 AND 25`, 类似于 [[C++ practice case#读写二进制文件||提取fstream对象读取到文件内容的字符部分]] `file.write(iteration_record.name.data(), nameLength);` 中读取结构体中 `string name` 成员变量中用二进制表示的*数据部分*
- `@年龄` 表示规则仅仅作用于年龄一列，`@NEW.年龄` 表示之作用于新插入年龄列的数据需要满足
- 如果要将规则应用于多行，需要**重复调用**`EXEC sp_bindefault` 语句

#### 账户控制
- 当账户控制 sql 语句非关键字的字符串中出现**特殊字符**（包括空格）时，需要用 `[]` 括起
- Mysql 和 sql server 都支持身份验证登录和混合登录两种方式
##### Windows 身份验证登录
这种方式只有本地（或远程连接）计算机中**有相应的用户**才可行
打开 cmd 输入 `whoami` 查看当前用户和所在域名
![[Pasted image 20241110113932.png]]
域名，也是当前计算机的名称，该域名下使用的账户为 Sickwag
可以通过计算机管理->本地用户和组查看当前计算机（当前域名下的用户（组）都有什么）
![[Pasted image 20241110114059.png]]
对应账户控制语句
```sql
create login [desktop-4h2qjbs\Guest] from windows; -- 创建登录名
drop login [desktop-4h2qjbs\Guest]; -- 删除用户
```
`FROM` 表示用 windows 验证登录 sql server
##### 混合登录（SQL Server 身份验证）
使用账号和密码登录，这些信息保存在 sql server 中，一般需要设置默认登录选用数据库
```sql
-- 创建登录名 stu1，使用 SQL Server 身份验证，密码 secret，默认数据库为“学生成绩数据库”
CREATE LOGIN stu1 WITH PASSWORD = 'secret', DEFAULT_DATABASE = [学生成绩数据库];
```
##### 调整用户权限
###### 添加用户到数据库
需要将某些用户添加为特定数据库中的用户时
```sql
USE [学生成绩数据库];
GO
-- 在“学生成绩数据库”中创建用户登录名alias，对应sql server 登录用户名
CREATE USER [alias] FOR LOGIN [domain_name\user_name];
```
- `GO` 表示分批次执行 sql 语句，是分批次标识符**不是 sql 语句**，被 DBMS 识别，用于确保不同部分 sql 代码块按批次执行。在高级编程语言中可能会出错
- **批处理**: 在 SQL Server 中，批处理是指一组 SQL 语句，这些语句会被一起提交给数据库引擎执行。批处理由 `GO` 语句分隔，在 SQL Server 中，`CREATE PROCEDURE` 语句必须是批处理中的唯一语句。
- **原因**:
    `CREATE PROCEDURE` 需要在编译时确定存储过程的定义，因此必须在独立的批处理中执行。
    如果在一个批处理中混合使用 `CREATE PROCEDURE` 和其他 SQL 语句，SQL Server 无法正确解析存储过程的定义，从而导致错误。
###### 用户在数据库中的权限
```sql
-- 赋予用户 zhang 创建数据库的权限
GRANT CREATE DATABASE TO [zhang];
-- 赋予用户 stu1 对 sc 表的 INSERT、UPDATE 和 DELETE 权限 
GRANT INSERT, UPDATE, DELETE ON sc TO stu1;
-- 赋予用户 stu2 和 stu3 对 xs 表和 kc 表的所有操作权限，并允许再授权
GRANT SELECT, INSERT, UPDATE, DELETE ON xs TO stu2, stu3 WITH GRANT OPTION;
GRANT SELECT, INSERT, UPDATE, DELETE ON kc TO stu2, stu3 WITH GRANT OPTION;
-- 赋予用户 stu2 和 stu3 对 xk 表的 SELECT 权限，并允许再授权
GRANT SELECT ON xk TO stu2, stu3 WITH GRANT OPTION;
-- 收回用户 stu2 对 xs 表和 kc 表的 DELETE 权限
REVOKE DELETE ON xs FROM stu2;
REVOKE DELETE ON kc FROM stu2;
-- 赋予 member1 到 member5 对 xs 表和 kc 表的 SELECT 权限
GRANT SELECT ON xs TO member1, member2, member3, member4, member5;
GRANT SELECT ON kc TO member1, member2, member3, member4, member5;
-- 赋予 member1 到 member5 对 xs 表中 姓名 列的 UPDATE 权限
GRANT UPDATE (姓名) ON xs TO member1, member2, member3, member4, member5;
-- 赋予 member1 到 member5 对 xk 表的 INSERT、UPDATE 和 DELETE 权限
GRANT INSERT, UPDATE, DELETE ON xk TO member1, member2, member3, member4, member5;
```
对于服务器层面上的权限需要通过修改*服务器角色*完成，服务器角色类似于一个拥有可以管理服务器层面的较高权限的**用户组**，添加到服务器角色中的用户拥有**一系列**高权限
```sql
-- 将登录帐号 cheng 添加到 serveradmin 服务器角色
EXEC sp_addsrvrolemember 'cheng', 'serveradmin';
-- 从 sysadmin 服务器角色中删除登录帐号 stu2
EXEC sp_dropsrvrolemember 'stu2', 'sysadmin';
```
**服务器角色**:
- `sysadmin:` 拥有最高权限，可以执行任何操作，包括管理服务器配置、数据库、用户等。
- `serveradmin:` 可以更改服务器范围内的配置选项，如内存设置、处理器设置等。
- `securityadmin:` 可以管理登录名和密码，以及管理权限。
- `setupadmin:` 可以管理链接服务器和启动过程。
- `processadmin:` 可以管理 SQL Server 进程。
- `diskadmin:` 可以管理磁盘文件。
- `dbcreator:` 可以创建、修改和删除数据库。
- `bulkadmin:` 可以执行大容量插入操作。
### TCL (Transaction Control Language)
一个或一组 sql 语句组成一个执行单元，这个执行单元要么全部执行，要么全部不执行。
意义在于防止部分语句修改数据库内容而另一部分没有，导致数据错误（如下）
>张三丰  1000
   郭襄	1000
Update 表 set 张三丰的余额=500 where name='张三丰'（执行成功）
数据库发生错误
Update 表 set 郭襄的余额=1500 where name='郭襄'（执行失败）

^19949 e
#### 事务
##### 数据库引擎
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240827203959.png)
##### 事务的 ACID 属性
1. 原子性（Atomicity）
	原子性是指事务不可分割，事务中的操作要么都发生，要么都不发生。
2. 一致性（Consistency）可以粗略理解为“**数据的准确性**”
	事务必须使数据库从一个一致性状态变换到另外一个一致性状态（就是数据库中的数据仍然准确，不会出现[转账过程失败](#^19949e)而导致总金额从 2000 变为 1500）
3. 隔离性（lsolation）
	事务的隔离性是指一个事务的执行不能被其他事务干扰，即一个事务内部的操作及使用的数据对并发的其他事务是隔离的，并发执行的各个事务之间不能互相干扰。（可以设置设置隔离级别调整）
4. 持久性（Durability）
	持久性是指一个事务一旦被提交，它对数据库中数据的改变就是永久性的，接下来的其他操作和数据库故障不应该对其有任何影响
##### 事务的创建
隐式事务：事务没有明显的开启和结束的标记
比如 insert、update、delete 语句, 每一句命令都是一个单独的事务
显式事务：事务具有明显的开启和结束的标记
前提：必须先设置自动提交功能为禁用
创建事务的一组逻辑语句中，**只支持** DQL，DML 和 TCL 中的语句，如 `select`, `insert`, `update`, `delete` 等，**不支持** `create`，`alter` 等 DDL 语言。因为 DDL 执行时会立即更改数据库，并且更改是自动提交的（即使 autocommit 被关闭），导致它们不能被回滚。
```sql
SHOW variables LIKE '%autocommit%';
SET autocommit = 0;-- 事务自动提交只存在于一个会话中，每次打开sql都需要设置一遍
trasaction start;-- 标识符，也可以写BEGIN
SAVEPOINT point_name;
COMMIT/ROLLBACK TO point_name-- 结束事务
```
在自动提交模式关闭的情况下，你执行的每个 `INSERT`、`UPDATE` 或 `DELETE` 语句都不会立即生效，直到你显式地执行 `COMMIT` 语句来提交事务。如果在关闭自动提交模式后执行了 `ROLLBACK` 语句，那么所有未提交的更改都会被撤销。
**事务的上下文**：`ROLLBACK` 命令的作用范围是当前事务。`ROLLBACK` 会撤销自上一次 `COMMIT` 之后的所有更改。执行 `COMMIT` 所有在该 `COMMIT` 之前执行的语句已经被永久保存到数据库中。还没有 `COMMIT` 都可以通过 `ROLLBACK` 来撤销。
**数据库连接**：只要数据库连接保持开启状态，未提交的更改就存在于该连接的事务中。关闭连接所有未提交的更改都会丢失。
**会话超时**：大多数数据库管理系统允许设置会话超时时间。如果在指定时间内没有任何活动，数据库会话可能会自动关闭
显式事务提交操作类似于 git 中的暂存区机制
```sql
DROP TABLE IF EXISTS account;
CREATE TABLE account(id int PRIMARY KEY AUTO_INCREMENT ,
username varchar(20),
balance double);
INSERT
	INTO
	account(username,
	balance)
VALUES('alpha',
1000),
('beta',
1000);
SET autocommit =0;
START TRANSACTION;-- 事务开始语句可以使用BEGIN，同样的效果
UPDATE account SET balance = 500 WHERE username = 'alpha';
UPDATE account SET balance = 1500 WHERE username = 'beta';
-- 执行到这条注释为止，所有操作结果都放入内存中，不会更改数据源
COMMIT;-- 一旦提交将更改放入硬盘中
SET autocommit =0;
START TRANSACTION;
UPDATE account SET balance = 1000 WHERE username = 'alpha';
UPDATE account SET balance = 1000 WHERE username = 'beta';
-- 内存中的信息是两人都是1000，
ROLLBACK;-- 但使用rollback将操作撤销
```
##### 数据库隔离级别
对于同时运行的多个事务（多线程，多应用同时访问一个数据库），当这些事务访问数据库中相同的数据时，如果没有采取必要的隔离机制就会导致各种并发问题：
![知道就好不用记](Files%20&%20LongText/Attachments/Pasted%20image%2020240828140035.png)
 ![MySQL支持的隔离级别](Files%20&%20LongText/Attachments/Pasted%20image%2020240828142955.png) ![orecal默认蓝，MySQL默认红](Files%20&%20LongText/Attachments/Pasted%20image%2020240829195208.png)
设置当前隔离级别：`set session transaction isolation level read uncommited|read commited|repeatable read|serializable`
设置全局隔离级别：`set global session transaction isolation level read uncommited|read commited|repeatable read|serializable`
**session 表示限制隔离级别的范围为当前会话**，在命令行中每用一个窗口执行 `mysql -u root -p` 创建一个会话，Dbeaver 中创建查询只是新建一个 sql 脚本
##### 隔离级别- 实例
 ![read uncommited不能防止出现脏读](Files%20&%20LongText/Attachments/Pasted%20image%2020240828144723.png) ![read commited不能防止出现不可重复读](Files%20&%20LongText/Attachments/Pasted%20image%2020240828150208.png)
 ![repeatable read防止出现脏读和重复读](Files%20&%20LongText/Attachments/Pasted%20image%2020240828150958.png)
![无法避免幻读](Files%20&%20LongText/Attachments/Pasted%20image%2020240828151817.png)
串行化 `serializable` 可以避免
![进程2的插入操作已经按下回车](Files%20&%20LongText/Attachments/Pasted%20image%2020240828152258.png)
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240828152336.png)
只要进程 1 没有提交，就一直占用，锁住表不让其他进程修改，进程 1 commit 之后进程 2 会立即执行
##### 事务的隔离级别
                   脏读、、不可重复读、幻读
Read uncommitted：     √		      √		        √
	Read committed： ×		      √		        √
	Repeatable read： ×		      ×	         	√
		Serializable	  ×             ×                ×
Mysql 中默认第三个隔离级别 repeatable read
Oracle 中默认第二个隔离级别 read committed
##### Savepoint 使用
与 rollback 搭配使用
```sql
#3.演示savepoint 的使用
SET autocommit=0;
START TRANSACTION;
DELETE FROM account WHERE id=25;
SAVEPOINT a;#设置保存点
DELETE FROM account WHERE id=28;
ROLLBACK TO a;#回滚到保存点
SELECT * FROM account;
```
##### Delete 和 truncate 区别
```sql
-- 演示delete
SET autocommit=0;
START TRANSACTION;
DELETE FROM account; -- delete执行之后不会提交，支持回滚
ROLLBACK;
-- #演示truncate
SET autocommit=0;
START TRANSACTION;
TRUNCATE TABLE account; -- 一旦truncate会在清空表后立即提交，不支持回滚
ROLLBACK;
```
#### 视图
一种虚拟存在的表，行和列的数据来自定义视图的查询中使用的表，并且是在使用视图时**动态生成**的，**只保存了 sql 逻辑**，不保存查询结果。在需要时调用，调用逻辑临时生成表（类似于即时演算动画，演算逻辑用函数封装）
- **MySQL**：视图的定义存储在 `INFORMATION_SCHEMA.VIEWS` 表中，以及每个数据库的 `db_name/views` 目录下。
- **PostgreSQL**：视图的定义存储在 `pg_views` 系统表中。
- **SQL Server**：视图的定义存储在 `sys.views` 系统表中。
- **Oracle**：视图的定义存储在 `DBA/VIEWS`、`ALL/VIEWS` 和 `USER/VIEWS` 视图中。
##### 创建视图
```sql
-- 常规方法查询，每次查询都写一遍
SELECT
	*
FROM
	employees e
INNER JOIN departments d ON
	d.department_id = e.department_id
WHERE
	e.last_name LIKE '%s%';
-- 将操作封装在 vi “函数”中
CREATE VIEW v1 AS
SELECT
	e.employee_id,
	e.last_name,
	e.department_id AS employee_department_id, -- 为 employees 表的 department_id 提供别名
	d.department_id, -- 这里假设 departments 表的 department_id 是唯一的，不需要别名
	d.department_name
	-- 其他需要选择的列...
FROM
	employees e
INNER JOIN departments d ON
	d.department_id = e.department_id
WHERE
	e.last_name LIKE '%s%';
-- 因为v1是新的表，所以可以嵌套筛选（两个WHERE）而不报错
SELECT
	*
FROM
	v1
WHERE
	last_name LIKE '%a%';
```
- 虽然 v 1 是虚拟表，但 from v 1 操作不是简单将封装的代码粘贴进来，而是创建虚拟表后放入注意最后 `WHERE last_name LIKE '%a%';` 时不要加 `e.last_name`，因为虚拟表是**新表**！
- 由于 `employees` 表和 `departments` 表都包含名为 `department_id` 的列，因此在使用 `SELECT *` 选择所有列时，这两个列名发生了冲突。**在创建视图或执行联合查询**时，必须明确指定列名，或者为冲突的列名提供别名，以确保每个列名都是唯一的。
![MySQL Long Code Practice \> 视图](Files%20&%20LongText/Long%20code/MySQL%20Long%20Code%20Practice.md#视图)
##### 视图修改
`create or replace view  视图名`，如果存在 replace，不存在 create
`alter view 视图名 as 查询语句; ` 仅仅修改
`drop view 视图名,视图名,...;`  删除
`DESC 视图名` 像表一样查看它的结构，同理 `SHOW CREATE VIEW 视图名`，和 show table 一样，会显示的比较简略，在**命令行**中会显示所有操作细节，**后加\\G 格式化**查看
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240828180455.png)
##### 更新视图
###### 更新基本操作
```sql
-- 创建表
CREATE OR REPLACE VIEW myv1
AS
SELECT last_name,email
FROM employees;
-- 更新操作，注意每更新一次源数据都会改变一次，因为视图记录的操作逻辑不能没有根据
SELECT * FROM myv1;
SELECT * FROM employees;
-- #1.插入
INSERT INTO myv1 VALUES('张飞','zf@qq.com');
-- #2.修改
UPDATE myv1 SET last_name = '张无忌' WHERE last_name='张飞';
-- #3.删除
DELETE FROM myv1 WHERE last_name = '张无忌';
```
###### 六种不能更新视图
- 包含以下关键字的 sql 语句：分组函数、**distinct**、group  by、having、union 或者 union all
- 常量视图
- Select 中包含子查询
- From 一个不能更新的视图
- Join 连接（只要是连接两表无所谓用什么语法连接）两个表形成的视图
- Where 子句的子查询引用了 from 子句中的表（因为新建的视图建立基于 from 中的表，WHERE 又根据 from 中的表筛选，引用自身会导致一些不稳定因素出现）
```sql
ON m.`department_id`=d.`department_id`;
-- 常量视图不能更改
CREATE OR REPLACE VIEW myv4 AS SELECT 'john' name;
SELECT * FROM myv4;
UPDATE myv4 SET name = 'alpha';  -- 报错not updatable
-- 有SELECT字句的视图不能更新
CREATE OR REPLACE
VIEW myv5 AS
SELECT
	(
	SELECT
		salary
	FROM
		employees e );
UPDATE myv5 SET salary = 10000 ; -- 将所有工资改为10000一定运行不了，源数据不变
-- 不能插入有连接的表，使用join的99语法和，的92语法，只要用到链接都不能
-- 可以更新某个单元格的值但不能插入行
CREATE OR REPLACE
VIEW myv6 AS 
SELECT
	e.department_id,
	e.employee_id,
	e.salary
FROM
	employees e
INNER JOIN departments d ON
	e.department_id = d.department_id;
UPDATE myv6 SET salary =2800 WHERE myv6.salary =2900; -- 更新语句可执行
INSERT INTO myv6 VALUES(60,100,5660); -- cannot INSERT INTO 报错
-- from一个不能更新的视图
CREATE OR REPLACE
VIEW myv7 AS
SELECT
	*
FROM
	myv5 m;
	-- myv5是一个有SELECT字句的视图，是不能更新的，
	-- 同理myv4是常量视图也不能更新
```
### 变量
#### 全局变量
说明：变量由系统定义，不是用户定义，属于、作用与服务器层面
注意：全局变量需要添加 global 关键字，会话变量需要添加 session 关键字，如果不写，默认会话级别。创建新的会话所有的 session 会话变量会重新赋默认值
**只有拥有 super 权限的账户**才能修改系统变量：
```sql
-- 查看方法
SELECT `User`,host,Super_priv FROM mysql.`user` u ;
-- 设置方法
GRANT SUPER ON *.* TO 'username'@'host' WITH GRANT OPTION;
-- 'username'@'host'替换为`root`@`localhost`为本地主机设置super权限
FLUSH PRIVILEGES;-- 立即刷新权限
```
使用步骤：
1. 查看所有系统变量
	`show global|【session】variables;`
2. 查看满足条件的部分系统变量
	`show global|【session】 variables like '%char%';`
3. 查看指定的系统变量的值
	`select @@global|【session】.系统变量名;`
4. 为某个系统变量赋值
	方式一：`set global|【session】系统变量名=值;`
	方式二：`set @@global|【session】.系统变量名=值;`
使用 global 设置全局变量跨连接（新的会话、连接）有效，但不能跨重启（sql 服务重新启动会给所有变量赋予默认值），需要跨重启则需要更改 my. Ini 配置文件
#### 局部变量
会话变量一般会比全局变量多一些，两者不是包含关系，使用 `session` 关键字
所有修改仅针对当前对话。
```sql
SHOW session variables;
SHOW session variables LIKE '%char%';
SELECT @@session.character_set_client;
SET @@session.autocommit = 0;
SHOW variables LIKE '%autocommit%';
```
省略 global、session 默认为会话变量 session
#### 自定义变量
由用户自定义，而不是系统提供的变量
使用步骤：1、声明，2、赋值，3、使用（查看、比较、运算等）
declare 只用于声明，set 可以声明并赋值，select 只用于赋值，在用户变量声明中声明可省略（`SELECT 字段 INTO @变量名 FROM 表;`）
**用户变量**
作用域：针对于当前会话（连接）有效，作用域同于会话变量
```sql
-- 赋值（更新变量的值）和赋值并初始化一致
方式一：
	SET @变量名=值;
	SET @变量名:=值;
	SELECT @变量名:=值;
方式二：
	SELECT 字段 INTO @变量名 FROM 表; --select的得到的结果是结果集，所以@变量记录的是1*1的表，所以这种写法一般用于从表中获取数据赋值给变量
SET @name = 'john';
SET @name = 100; -- 设置用户变量会自动调整变量类型
-- 使用（查看变量的值）
SELECT @变量名;
```
**局部变量**
作用域：仅仅在定义它的 begin end 块中有效，应用在 begin end 中。所以声明也在其中
```sql
-- 声明
DECLARE 变量名 类型;
DECLARE 变量名 类型 【DEFAULT 值】;
-- declare定义的变量只能放在begin end中的第一句
-- 赋值（更新变量的值）
-- 方式一：
	SET 局部变量名=值;
	SET 局部变量名:=值;
	SELECT @局部变量名:=值;
-- 方式二：
	SELECT 字段 INTO 局部变量名 FROM 表;
-- 使用（查看变量的值）
SELECT 局部变量名;
```

|       | 作用域              | 定义位置           | 语法            |
| ----- | ---------------- | -------------- | ------------- |
| 用户变量- | 当前会话             | 绘画的任何地方        | 加@符号，不用指定类型   |
| 用户变量  | 定义它的 BEGIN END 中 | BEGINEND 的第一句话 | 一般不用加@, 需要指定类型 |
### 存储过程和函数
#### Sql server 和 mysql 存储过程和函数的语法区别
##### SQL Server
a. **创建函数（Function）**
```sql
CREATE FUNCTION 函数名 (@参数1 数据类型, @参数2 数据类型, ...)
RETURNS 返回类型
AS
BEGIN
    -- 函数体
    RETURN 返回值
END;
```
**示例**:
```sql
CREATE FUNCTION dbo.GetFullName (@FirstName NVARCHAR(50), @LastName NVARCHAR(50))
RETURNS NVARCHAR(101)
AS
BEGIN
    RETURN @FirstName + ' ' + @LastName;
END;
```
**说明**:
- `CREATE FUNCTION`: 用于创建函数。
- `@参数`: 函数可以接受参数，参数名前需要加 `@` 符号。
- `RETURNS`: 指定函数的返回类型。
- 函数体中必须包含 `RETURN` 语句，用于返回结果。

b. **创建存储过程（Stored Procedure）**
```sql
CREATE PROCEDURE 存储过程名 (@参数1 数据类型, @参数2 数据类型, ...)
AS
BEGIN
    -- 存储过程体
    -- 可以包含多条SQL语句
END;
```
**示例**:
```sql
CREATE PROCEDURE dbo.InsertStudent
    @学号 INT,
    @姓名 NVARCHAR(50),
    @年龄 INT
AS
BEGIN
    INSERT INTO 学生表 (学号, 姓名, 年龄)
    VALUES (@学号, @姓名, @年龄);
END;
```
**说明**:
- `CREATE PROCEDURE`: 用于创建存储过程。存储过程名命名允许特殊符号
- `@参数`: 存储过程可以接受参数，参数名前需要加 `@` 符号。
- 存储过程体中可以包含多条 SQL 语句，包括 `SELECT`、`INSERT`、`UPDATE`、`DELETE` 等。

---
##### MySQL 
a. 创建函数（Function）
```sql
CREATE FUNCTION 函数名 (参数1 数据类型, 参数2 数据类型, ...)
RETURNS 返回类型
DETERMINISTIC
BEGIN
    -- 函数体
    RETURN 返回值;
END;
```
**示例**:
```sql
CREATE FUNCTION GetFullName (FirstName VARCHAR(50), LastName VARCHAR(50))
RETURNS VARCHAR(101)
DETERMINISTIC
BEGIN
    RETURN CONCAT(FirstName, ' ', LastName);
END;
```
**说明**:
- `CREATE FUNCTION`: 用于创建函数。
- `DETERMINISTIC`: 表示函数对于相同的输入总是返回相同的结果。如果函数的结果依赖于数据库状态，则应使用 `NOT DETERMINISTIC`。
- `RETURNS`: 指定函数的返回类型。
- 函数体中必须包含 `RETURN` 语句，用于返回结果。

b. 创建存储过程（Stored Procedure）
```sql
CREATE PROCEDURE 存储过程名 (IN 参数1 数据类型, IN 参数2 数据类型, ...)
BEGIN
    -- 存储过程体
    -- 可以包含多条SQL语句
END;
```
**示例**:
```sql
CREATE PROCEDURE InsertStudent (IN 学号 INT, IN 姓名 VARCHAR(50), IN 年龄 INT)
BEGIN
    INSERT INTO 学生表 (学号, 姓名, 年龄)
    VALUES (学号, 姓名, 年龄);
END;
```
**说明**:
- `CREATE PROCEDURE`: 用于创建存储过程。
- `IN`: 指定参数为输入参数。MySQL 还支持 `OUT` 和 `INOUT` 参数。
- 存储过程体中可以包含多条 SQL 语句，包括 `SELECT`、`INSERT`、`UPDATE`、`DELETE` 等。

---
###### 总结和说明
| 特性         | SQL Server                                         | MySQL                                                        |
| ---------- | -------------------------------------------------- | ------------------------------------------------------------ |
| **函数语法**   | `CREATE FUNCTION` 支持 `BEGIN...END` 块，参数前加 `@` 符号。  | `CREATE FUNCTION` 支持 `BEGIN...END` 块，参数前不加 `@` 符号。           |
| **存储过程语法** | `CREATE PROCEDURE` 支持 `BEGIN...END` 块，参数前加 `@` 符号。 | `CREATE PROCEDURE` 支持 `BEGIN...END` 块，参数前使用 `IN`、`OUT` 等关键字。 |
| **参数符号**   | SQL Server 中参数前需要加 `@` 符号。                         | MySQL 中参数前不需要加 `@` 符号，但需要指定 `IN`、`OUT` 等参数类型。                |
| **函数确定性**  | SQL Server 中没有 `DETERMINISTIC` 关键字，但可以通过其他方式指定。    | MySQL 中需要使用 `DETERMINISTIC` 或 `NOT DETERMINISTIC` 来指定函数是否确定。 |
| **返回类型**   | SQL Server 中 `RETURNS` 关键字用于指定返回类型。                | MySQL 中 `RETURNS` 关键字用于指定返回类型。                               |
| **存储过程参数** | SQL Server 中参数前加 `@` 符号。                           | MySQL 中参数前使用 `IN`、`OUT` 等关键字。                                |
- 其中，sql server 中一个批处理过程中只能创建一个创建存储过程，不同批次间用 `GO` 分割

#### 存储过程
存储过程：类似于方法，可以提高代码重用性，减少连接数据库的次数（每个操作执行都会和数据库连接并等待返回值返回）
现阶段存储过程需命令行执行，已知 Dbeaver 和 sqlyog 执行不报错但无效，调用报错 not exists
##### 函数的参数
1. 参数列表包含三部分
	参数模式→参数名→参数类型
	其中参数模式：
	**in**：该参数可以作为输入，也就是该参数需要调用方传入值
	**out**：该参数可以作为输出，也就是该参数可以作为返回值
	**inout**：该参数既可以作为输入又可作为输出，也就是该参数既需要传入值，又可以返回值
2. 如果存储过程体仅仅只有一句话，begin end 可以省略.
3. 存储过程体中的每条 sql 语句的结尾要求必须加分号。
4. 存储过程的结尾可以使用 delimiter 重新设置，语法为 `delimiter 结束标记`
```sql
-- 插入固定内容数据
-- 定义存储过程，将固定内容插入到admin表中
DELIMITER $$  -- 将结束符号变为$$
CREATE PROCEDURE myp1()
BEGIN
    INSERT INTO admin(username, `password`)
    VALUES('alpha', 0001),
           ('beta', 0002),
           ('charlie', 0003),
           ('delta', 0004),
           ('echo', 0005);
END $$ -- 结束
DELIMITER ; -- 需要将结束符号变回;，不然下面应该CALL myp1()$$
CALL myp1();
```
##### 三种模式执行顺序
IN 参数
- `IN` 传入参数在调用存储过程之前，它们在存储过程执行之前就已经被定义和初始化。
- `IN` 只负责传递数据到存储变量中，数据存储过程执行之前就已经确定，因此**不需要**在调用之前进行额外的定义。
- `IN` 参数的目的是向存储过程提供数据，不需要存储过程修改这些值

OUT 参数
- `OUT` 参数从存储过程返回数据。在存储过程结束后输出。所以执行完毕后才被赋值。
- `OUT` 参数在存储过程执行之前，`OUT` 参数的值是未知的，它需要**在存储过程内部**被赋值。
- 初始化一般定义为 NULL 或 0，字符串初始化定义为 `''`
- 它们的作用是存储过程执行完毕后返回数据。如果没有定义变量，就没有地方存储返回的数据。存储过程执行后，`OUT` 参数的值会被更新到这个变量中。

INOUT
- INOUT 需要在调用前定义变量，既要传递数据进入存储过程，又要在存储过程执行完毕后返回修改后的数据。定义变量是为了确保数据可以被正确地传递和接收。
##### In 插入参数
```sql
-- 根据女神名，查询对应的男神信息
-- 只查询，并没有成功或失败提示
delimiter $
CREATE PROCEDURE myp3(IN var varchar(20)) BEGIN SELECT b.*
  FROM boys b
 RIGHT JOIN beauty g
    ON b.id = g.boyfriend_id
 WHERE var = b.boyname;
 END $
delimiter ;
CALL myp3('周芷若');
-- 插入符合某种条件的数据
-- 将admin中符合WHERE条件的内容统计出来并存储到变量中然后打印
DELIMITER $
CREATE PROCEDURE myp2(IN username varchar(20), IN password varchar(20)) BEGIN
DECLARE result varchar(20) DEFAULT 0;
SELECT count(*) INTO result
FROM admin
WHERE admin.username = username
  AND admin.password = password;
SELECT IF(RESULT>0,'success','failed');
END $
delimiter ;
CALL myp2('sickwag','12345');
```
##### Out 返回参数
通过设置 out 参数值，有时可以省略定义变量的过程
```sql
delimiter $
CREATE PROCEDURE myp5(IN gname varchar(20), OUT bname varchar(20),bcharm int) 
BEGIN 
	SELECT b.boyname,b.usercp 
       INTO bname,bcharm
  FROM beauty g
 RIGHT JOIN boys b
    ON g.boyfriend_id = b.id
 WHERE g.name = gname;
END $
delimiter ;
SET @bname = NULL; -- 可以省略，省略的话只能定义bname为用户变量@bname
-- 直接CALL myp5('小昭', bname)定义全局变量，容易混淆
CALL myp5('小昭',@bname,@bcharm);
```
##### Inout 输入输出参数
```sql
DELIMITER //
CREATE PROCEDURE DoubleValue(INOUT input_value INT)-- 特点是不能在调用函数时直接输入数字，需要定义变量传入参数列表中
BEGIN
    SET input_value = input_value * 2;
END //
DELIMITER ;
SET @myValue = 10; -- 初始化变量
CALL DoubleValue(@myValue); -- 调用存储过程
SELECT @myValue; -- 输出修改后的值
```
##### Delimiter 用法
`DELIMITER` 改变 SQL 语句的结束符。默认结束符是分号 `;`。然而在存储过程、函数或触发器中使用分号，而这些代码块本身也需要以分号结束。就需要用到 `DELIMITER` 来定义新的结束符，以便在代码块内部使用分号，而不会导致整个代码块立即执行。代码块内 `;` 正常使用
定义结束符后，新的结束符号仅在 begin 和 end 之间生效
##### 删除、修改、查看存储过程
`DROP PROCEDURE [IF EXISTS] procedure_name;`
注意查看存储过程结构不能使用 `desc procedure_name;`，因为存储过程本质上不是一个表
语法：`show create procedure procedure_name;`
存储过程一般不修改，只允许增删改 in 、out 属性，begin  and 之间的内容**不能修改**
##### 实例
![[MySQL Long Code Practice#创建存储过程实现传入用户名和密码，插入到admin表中]]
![[MySQL Long Code Practice#设定考试及格线，并将未及格人信息显示]]
#### 函数
##### 基本函数使用
**存储过程：** 可以有 0 个返回，也可以有多个返回，适合做批量插入、批量更新
**函数：** 有且**仅有 1 个**返回，适合做处理数据后返回一个结果
函数定义中尤其容易忘记写的是 `returns` 而不是 return
```sql
-- 定义语法
CREATE FUNCTION 函数名(参数列表) RETURNS 返回类型
BEGIN
	函数体
END
-- 调用语法
SELECT 函数名(参数列表);
-- #三、查看函数
SHOW CREATE FUNCTION myf3; -- 和存储过程同理
-- #四、删除函数
DROP FUNCTION myf3;
```
函数体：肯定会有 return 语句，否则报错，需要将 return 放在最后，不然函数没有意义
Return 值; 函数体中仅有一句话，则可以省略 begin end
**注意**：创建函数时可能出现报错
> ERROR 1418 (HY 000): This function has none of DETERMINISTIC, NO SQL, or READS SQL DATA in its declaration and binary logging is enabled (you *might* want to use the less safe log_bin_trust_function_creators variable)

因为 sql 开启了 bin-log，信任创建的函数，解决方法是：`set global log_bin_trust_function_creators=TRUE;`
在 MySQL 5.7 版本中，mysql 数据库中有 proc 表（8.0 中没有）记录了所有函数和存储过程
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240831203949.png)
- 实例：
![MySQL Long Code Practice \> 函数](Files%20&%20LongText/Long%20code/MySQL%20Long%20Code%20Practice.md#函数)
##### 分支
###### If
实现双分支
###### Case
情况 1：类似于 java 中的 switch 语句，一般用于实现等值判断
```sql
CASE 变量|表达式|字段
WHEN 要判断的值 THEN 返回的值1或语句1：
WHEN 要判断的值 THEN 返回的值2或语句2；
ELSE 要返回的值n或语句n；
END CASE;
-- 如果是语句需要加;，只是值不加
```
情况 2：类似于 java 中的多重 IF 语句，一般用于实现区间判断
**注意 case 判断形式中每个条件判断成功后会跳出**，相当于一个 break;
```sql
CASE
WHEN 要判断的条件1 THEN返回的值1或语句1；
WHEN 要判断的条件2 THEN返回的值2或语句2；
ELSE 要返回的值n或语句n；
END CASE;
```
- Case 结构可以嵌套或放 begin end 中作为独立语句，when 轮空之后执行 else 语句
- ELSE 可以省略，如果 ELSE 省略了，并且所有 WHEN 条件都不满足，则返回 **NULL**

```sql
delimiter $
CREATE PROCEDURE test_case (IN score int)
BEGIN 
	CASE 
		WHEN score >90 AND score <=100 THEN SELECT 'A';
		WHEN score >80 AND score <=90 THEN SELECT 'B';
		WHEN score >70 AND score <=80 THEN SELECT 'C';
		ELSE SELECT 'D';
	END CASE;
END $
-- 使用select会导致返回的结果不是一个值，而是结果集
CALL test_case(50)$
-- 结果为             未定义表头，默认将结果集内容作为表头
/*
+---+
| D |
+---+
| D |
+---+
*/
-- 也可以使用set方式
CREATE PROCEDURE test_case2 (IN score int)
BEGIN 
	DECLARE grade char(1);
	CASE 
		WHEN score >90 AND score <=100 THEN set grade = 'A';
		WHEN score >80 AND score <=90 THEN set grade = 'B';
		WHEN score >70 AND score <=80 THEN set grade = 'C';
		ELSE SET grade = 'D';
	END CASE;
	-- 定义变量方式会自动显示结果，因为没有select，所以还要加上
	SELECT grade;
END $
-- 结果为 
/*
+-------+
| grade |
+-------+
| C     |
+-------+
*/
```
###### If 多重分支结构
If 条件 1 then 语句 1；
Elseif 条件 2 then 语句 2；
【else 语句 n；】
Endif;
**只能用在 beginend 中**
```sql
-- if多重分支结构
CREATE FUNCTION test_if (score int) RETURNS char(1)
BEGIN 
	if score >90 AND score <=100 THEN return 'A';
	elseif score >80 THEN return 'B';
	elseif score >70 THEN return 'C';
	ELSE RETURN 'D';
	END if;
END $
SELECT test_if(90) AS level$
-- 创建变量形式
CREATE FUNCTION test_if (score INT) RETURNS CHAR(1)
BEGIN 
    DECLARE slevel CHAR(1);
    IF score >= 90 AND score <= 100 THEN
        SET slevel = 'A';
    ELSEIF score >= 80 AND score < 90 THEN
        SET slevel = 'B';
    ELSEIF score >= 70 AND score < 80 THEN
        SET slevel = 'C';
    ELSE
        SET slevel = 'D';
    END IF;
    RETURN slevel;
END $
SELECT test_if(90)$
```
如果 select 不写 as，默认表头为函数名
##### 循环
While、loop、repeat
**循环控制：**
- Iterate 类似于 continue，继续，结束本次循环，继续下一次
- Leave 类似于  break，跳出，结束当前所在的循环

###### While
```sql
【标签:】while 循环条件 do
	循环体;
end while【 标签】;
```
标签表示函数的名称，有名称可以搭配循环控制语句使用
- 实例
![MySQL Long Code Practice \> 循环结构](Files%20&%20LongText/Long%20code/MySQL%20Long%20Code%20Practice.md#循环结构)
###### Loop
```sql
【标签:】loop
    循环体;
end loop 【标签】;
-- 由于没有跳出循环语句，需要搭配leave跳出，不然是死循环
my_loop: LOOP
    IF i > 10 THEN
        LEAVE my_loop; --搭配名称使用，跳出死循环
    END IF;
    SET i = i + 1;
END LOOP my_loop
```
###### Repeat
```sql
【标签：】repeat
	循环体;
until 结束循环的条件
end repeat 【标签】;
```
注意 repeat 类似于 do-while 语句，无条件执行一次循环内容
###### 三种循环框架区别
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240901140343.png)
# MySQL 高级
## Linux 环境中的 MySQL 安装
### 前置知识准备
#### 各种 Linux 命令
##### 检查服务（MySQL）是否开机自启
命令 `systemctl is-enabled server_name.service`
同理也可以检测命令是否开机关闭，正在运行。
服务名称后一定要加 service，可以通过修改软件别名来不加
##### 检查 MySQL 
- 检查版本号 `mysqladmin --version`
- 检查 MySQL 是否运行 `ps -ef | grep mysql`
- 操作 MySQL（5.5 版本） `service mysql start|stop|enable|restart`
- 新版 MySQL 启动使用 `mysql -u root -p ` 启动 root 账户
- 修改 MySQL 登录密码：
	- 登录到 root 用户中修改：
		- 跳过权限表登录 MySQL `sudo systemctl start mysqld --skip-grant-tables`
		- 登录到 MySQL 的 root 用户后刷新权限表 `FLUSH PRIVILEGES;`
		- 修改 MySQL root 用户密码 `ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';`
		- 重启 MySQL `systemctl restart mysqld`
	- 修改配置文件
	- 编辑 MySQL 的配置文件， `/etc/my.cnf` 或 `/etc/mysql/my.cnf`。找到 `[mysqld]` 部分，并添加以下行：可以跳过权限表登录到 MySQL，之后操作同上
```file
	[mysqld]
	skip-grant-tables
```
 - 检查 MySQL 是否自启动 `systemctl list-unit-files | grep mysql`
 - 使用图形化页面管理启动项 `ntsysv`（可能需要安装软件包）
 - Windows 下的配置文件一般叫 `my.ini`，Linux 中的一般叫做 `my.cnf`
 - MySQL 配置文件在 centos 中路径 `/etc/my.cnf`，可以使用 find 命令查找 `my.ini` 文件
 - 如果 MySQL 中出现中文字符乱码，尝试 `show variables like "%char%"` 列出数据库使用字符集列表，一般 file_system 、database、result 需要调整为 utf-8 方法是修改配置文件，在配置文件下添加 `字符集列表中字段名=utf-8` 即可
 - 配置文件中 `sort_buffer_size` 变量表示搜索和分组缓冲区大小

##### 其他基本命令
[其他基本命令](../Linux/Linux%20Basics.md#Linux基础命令)
##### 配置文件设置
`log-bin` 为默认的主从复制二进制日志文件
`log-error` 是错误日志记录文件，默认关闭
![主要配置文件目录](Files%20&%20LongText/Attachments/Pasted%20image%2020240921140715.png)
#### 存储引擎
显示引擎命令 `mysql> show variables like "%engine%";`
```sql
mysql> show variables like "%engine%";
+-----------------------------------------+---------------+
| Variable_name                           | Value         |
+-----------------------------------------+---------------+
| default_storage_engine                  | InnoDB        |
| default_tmp_storage_engine              | InnoDB        |
| disabled_storage_engines                |               |
| internal_tmp_mem_storage_engine         | TempTable     |
| secondary_engine_cost_threshold         | 100000.000000 |
| show_create_table_skip_secondary_engine | OFF           |
| use_secondary_engine                    | ON            |
+-----------------------------------------+---------------+
7 rows in set (0.00 sec)
```
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240921141511.png)
### 索引优化
#### Sql 性能下载原因
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240921142305.png) 
Sql 加载顺序
![手写](Files%20&%20LongText/Attachments/Pasted%20image%2020240921142807.png)
![机器执行](Files%20&%20LongText/Attachments/Pasted%20image%2020240921142728.png)
#### 7 中 join 模式
![内外连接总结](#内外连接总结)
#### 什么是索引
MySQL 官方对索引的定义为：索引（Index）是帮助 MySQL 高效获取数据的数据结构。可以得到索引的本质：**索引是数据结构**。
索引的目的在于提高查找效率，可**类比**字典
排好序的快速查找的数据结构（也就是索引的定义）是提高效率的原因，索引会影响 `order by` 和 `Group by` 
 ![索引的原理](Files%20&%20LongText/Attachments/Pasted%20image%2020240927183019.png)
 - 为了加快 CoI 2 的查找，可以维护一个右边所示的二叉查找树，每个节点分别包含索引键值和一个指向对应数据记录物理地址的指针，这样就可以运用二叉查找在一定的复杂度内获取到相应数据，从而快速的检索出符合条件的记录（**类似于二分查找**）
- 数据本身之外，数据库还维护着一个满足**特定查找算法的数据结构**（上面的例子中使用的是 B+树），这些数据结构以**某种方式**（上面使用指针）指向数据，这样就可以在这些数据结构的基础上实现高级查找算法，这种数据结构就是索引。
- 数据库中的索引一般都与数据内容绑定，所以软件开发过程中，为保障查找速度，在版本更新之后会根据最新版数据更新索引（重建）
- 数据库中查找数据速度远高于增删改，因为增删改过程中需要修改索引
- 一般来说索引本身也很大，不可能全部存储在内存中，因此索引往往以索引文件的形式存储的磁盘上
#### 建立索引的优劣
**优势**（来自硬件层面）
- 类似大学图书馆建书目索引，提高数据检索的效率，降低数据库的 IO 成本（硬盘读写）
- 通过索引列对数据进行排序，降低数据排序的成本，降低了 CPU 的消耗
**劣势**
- 索引也是一张表，该表保存了主键与索引字段，并指向实体表的记录，索引列要占用空间
- 虽然索引大大提高了查询速度，同时却会降低更新表的速度，增删改等操作
- 更新表时，MySQL 不仅要保存数据，还要保存索引文件每次更新添加了索引列的字段，都会调整因为更新所带来的键值变化后的索引信息
- 索引只是提高效率的一个因素，如果 MySQL 有大数据量的表，就需要花时间研究建立**最优秀的**索引，或优化查计，根据查询什么内容最多或其他来调整建立什么索引
#### 索引分类
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240927190535.png)
#### 索引检索原理
##### 【初始化介绍】
- 颗 b+树，浅蓝色的块我们称之为一个磁盘块，可以看到每个磁盘块包含几个数据项（深蓝色所示）和指针（黄色所示），
- 如磁盘块 1 包含数据项 17 和 35，包含指针 P 1、P 2、P 3，
- P 1 表示小于 17 的磁盘块，P 2 表示在 17 和 35 之间的磁盘块，P 3 表示大于 35 的磁盘块。
- 真实的数据存在于**叶子节点**即 3、5、9、10、13、15、28、29、36、60、75、79、90、99。
- **非叶子节点**只不存储真实的数据，只存储指引搜素方向的数据项，非最底层的深蓝色数据块不是数据只是参考值，如 17、35**并不真实存在**于数据表中。
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240927191918.png)
##### 查找过程
- 如果要查找数据项 29，那么首先会把**磁盘块 1 由磁盘加载到内存**，此时发生一次 IO，
	在内存中用二分查找确定 29 在 17 和 35 之间，锁定磁盘块 1 的 P 2 指针，内存时间因为非常短（相比磁盘的 IO）可以忽略不计，
- 通过磁盘块 1 的 P 2 指针的磁盘地址把**磁盘块 3 由磁盘加载到内存**，发生第二次 1 O，
- 29 在 26 和 30 之间，锁定磁盘块 3 的 P 2 指针，通过指针加载磁盘块 8 到内存，发生第三次 1 O，同时内存中做二分查找找到 29
- 结束查询，总计三次 IO。

真实的情况是，3 层的 b+树可以表示上百万的数据，如果上百万的数据查找只需要三次 IO，性能提高将是巨大的，如果没有索引，每个数据项都要发生一次 IO，那么总共需要百万次的 IO，显然成本非常非常高
![](Files%20&%20LongText/Attachments/Pasted%20image%2020240927191520.png)
#### 建立索引的情况
##### 需要建立索引
1. 主键自动建立唯一索引
2. 频繁作为查询条件的字段应该创建索引
3. 查询中与其它表关联的字段，外键关系建立索引
4. 频繁更新的字段不适合创建索引◎因为每次更新不单单是更新了记录还会更新索引
5. Where 条件里用不到的字段不创建索引
6. 单键/组合索引的选择问题，who？（在高并发下倾向创建组合索引）
7. 查询中排序的字段，排序字段若通过索引去访问将大大提高排序速度
8. 查询中同居或者分组字段
##### 不需要创建索引
300 万行左右的数据 mysql 性能开始下降
1. 表记录太少
2. 经常增删改的表
	因为更新表时，MySQL 不仅要保存数据，还要保存一下索引文件
3. 数据重复且分布平均的表字段，因此应该只为最经常查询和最经常排序的数据列建立索引。（如性别列只有男女两种）

索引的选择性是指索引列中不同值的数目与表中记录数的比。如果一个表中有 2000 条记录，表索引列有 1980 个不同的值，那么这个索引的选择性就是 1980/2000=0.99，**索引的选择性越接近于 1，这个索引的效率就越高**
## 创建索引的性能分析
**MySQL 瓶颈**
- CPU：CPU 在饱和的时候一般发生在数据装入内存或从磁盘上读取数据时候
- IO：磁盘 I/O 瓶颈发生在装入数据远大于内存容量的时候
- 服务器硬件的性能瓶颈：op, free，iostat 和 vmstat 来查看系统的性能状态
### 是什么
使用 EXPLAIN 关键字可以模拟优化器执行 SQL 查询语句，从而知道 MySQL 是如何处理你的 SQL 语句的。通过自己分析得到优化方案
语法 `Explain + SQL语句`
# SQL 必知必会学习
## 排序检索数据
### 简单排序
**SQL 实现多列多级排序的基本语法如下：**
```sql
SELECT column1, column2, column3, ...
FROM your_table_name
ORDER BY column_high_priority [ASC | DESC],
         column_medium_priority [ASC | DESC],
         column_low_priority [ASC | DESC],
         ... ;
```
SQL 引擎会首先按照 `ORDER BY` 子句中 **最先列出的列 (`column_high_priority`)** 进行排序。
- 如果第一列的值有相同的，那么在相同值的记录内部， SQL 引擎会 **再按照 `ORDER BY` 中 _第二列_ (`column_medium_priority`) 进行排序**。
- 如果第二列的值仍然有相同的，则继续按照 _第三列_ (`column_low_priority`) 排序，依此类推。
- 只有当所有高优先级列的值都相同时，才会考虑更低优先级的列的排序。

编写 SQL 语句，查找所有至少订购了总量 100 个的 BR 01、BR 02 或 BR 03 的订单。你需要返回 OrderItems 表的订单号（order_num）、产品 ID（prod_id）和数量，并按产品 ID 和数量进行过滤。提示：根据编写过滤器的方式，可能需要特别注意求值顺序。

---
### 排名排序
#### Over 字句
- `OVER()` 子句是所有窗口函数的核心。它定义了窗口函数操作的**数据集范围**（window），也就是函数计算时所依据的**数据分区**和**排序方式**。
    
- **用法：** `OVER()` 子句通常与排序子句 `ORDER BY` 和分区子句 `PARTITION BY` 结合使用。
    
    - **`OVER (ORDER BY column1 [ASC|DESC], column2 [ASC|DESC], ...)`**: 指定窗口内的数据**排序规则**。窗口函数会根据指定的列排序，并基于这个排序进行计算（例如，排名）。
    - **`OVER (PARTITION BY column1, column2, ... ORDER BY column3, ...)`**: 在 `ORDER BY` 的基础上，增加了 **`PARTITION BY`** 子句，用于将数据**划分为多个分区**。窗口函数会在每个分区内独立执行计算。可以理解为先分组，然后在每个组内进行排序和窗口函数计算。
    - **`OVER ()`**: 如果 `OVER()` 子句内为空，表示窗口是**整个结果集**。函数会基于整个结果集进行计算。
- **重要性：** `OVER()` 子句决定了窗口函数如何处理数据，是定义计算范围和顺序的关键。所有的排名函数（以及其他窗口函数，例如 `LAG()`, `LEAD()`, `SUM() OVER()`, `AVG() OVER()`, 等）都必须与 `OVER()` 子句一起使用，才能指定其操作的数据范围。
#### Rank 函数
- **意思：** `RANK()` 函数为结果集中的每一行分配一个**排名**。如果存在**并列**（tie），即多行具有相同的值（根据 `ORDER BY` 子句），则并列的行会获得**相同的排名**，并且排名会**跳跃**。
- **用法：** `RANK() OVER ( [PARTITION BY partition_column, ...] ORDER BY sort_column [ASC|DESC], ...)`
- **行为：**
    - 按照 `ORDER BY` 子句指定的列对数据进行排序。
    - 为每一行分配排名，从 1 开始。
    - **如果遇到并列值，并列的行获得相同的排名。**
    - **排名会跳跃。** 例如，如果有两行并列第 1 名，则接下来一行的排名将是第 3 名，跳过了第 2 名。
#### DENSE_RANK () 函数
- **意思：** `DENSE_RANK()` 函数也为结果集中的每一行分配一个**排名**，与 `RANK()` 类似，也处理并列排名。但是，`DENSE_RANK()` **不会跳跃排名**。
- **用法：** `DENSE_RANK() OVER ( [PARTITION BY partition_column, ...] ORDER BY sort_column [ASC|DESC], ...)`
- **行为：**
    - 按照 `ORDER BY` 子句指定的列对数据进行排序。
    - 为每一行分配排名，从 1 开始。
    - **如果遇到并列值，并列的行获得相同的排名。**
    - **排名不会跳跃。** 即使有并列排名，下一个排名仍然是紧随其后的连续排名。例如，如果有两行并列第 1 名，则接下来一行的排名将是第 2 名
[178. 分数排名 - 力扣（LeetCode）](https://leetcode.cn/problems/rank-scores/)
这里使用到了这一个方法
#### ROW_NUMBER () 函数
- **意思：** `ROW_NUMBER()` 函数为结果集中的每一行分配一个**唯一的连续序号**。它**不考虑并列**，即使值相同，也会分配不同的序号。
- **用法：** `ROW_NUMBER() OVER ( [PARTITION BY partition_column, ...] ORDER BY sort_column [ASC|DESC], ...)`
- **行为：**
    - 按照 `ORDER BY` 子句指定的列对数据进行排序。
    - 为每一行分配一个唯一的连续序号，从 1 开始，**即使有并列值也会继续递增**。
    - 保证每行都有一个唯一的序号，没有并列排名，也没有排名跳跃。
#### NTILE (n) 函数
- **意思:** `NTILE(n)` 函数将结果集**均匀地分配到 `n` 个桶** (buckets) 中，并为每一行分配一个桶号。
- **用法:** `NTILE(n) OVER ( [PARTITION BY partition_column, ...] ORDER BY sort_column [ASC|DESC], ...)`
- **行为:**
    - 按照 `ORDER BY` 子句排序数据。
    - 将排序后的数据尽可能平均地分配到 `n` 个桶中。
    - 为每一行分配一个桶号，从 1 到 `n`。
    - 如果总行数不能被 `n` 整除，则前几个桶会比后面的桶多包含一行。
    - 在每个分区内独立进行桶的分配 (如果使用了 `PARTITION BY`)。

| 函数             | 描述              | 并列处理 | 排名跳跃 | 应用场景                        |
| -------------- | --------------- | ---- | ---- | --------------------------- |
| `RANK()`       | 排名，并列排名相同       | 并列   | 跳跃   | 需要显示排名，并列排名，允许跳跃的场景         |
| `DENSE_RANK()` | 紧密排名，并列排名相同，不跳跃 | 并列   | 不跳跃  | 需要显示排名，并列排名，不希望排名跳跃的场景      |
| `ROW_NUMBER()` | 唯一序号，不考虑并列      | 唯一序号 | 不适用  | 需要唯一序号，不需要排名，例如行编号，取分组内第一行等 |
| `NTILE(n)`     | 分桶，将数据分为 n 个桶   | 不适用  | 不适用  | 分组分析，分位数分析                  |
## 高级数据过滤
### 相对位置排序
Sql 支持按照列的相对位置排序：
```sql
SELECT prod_id, prod_price, prod_name
FROM Products
ORDER BY 2, 3;
```
```sql
SELECT
    o.order_num,
    o.prod_id,
    o.quantity
FROM
    OrderItems o
WHERE
    o.order_num IN (  -- 使用 IN 子查询来筛选订单号
        SELECT
            oi.order_num
        FROM
            OrderItems oi
        WHERE
            oi.prod_id IN ('BR01', 'BR02', 'BR03')  -- 筛选指定产品
        GROUP BY
            oi.order_num  -- 按订单号分组
        HAVING
            SUM(oi.quantity) >= 100  -- 筛选产品总量 >= 100 的订单号
    )
ORDER BY
    o.prod_id,
    o.quantity;
```
### 窗口函数
这类函数可以访问窗口中其他行的值，常用于计算环比、同比等。
- **`LAG(value_expression, offset, default_value) OVER (...)`**: 访问窗口中**当前行之前** `offset` 行的 `value_expression` 的值。如果向前 `offset` 行超出窗口范围，则返回 `default_value`（如果指定了）或 NULL。
    
    - `value_expression`: 要获取值的列或表达式。
    - `offset`: 向前偏移的行数，正整数。
    - `default_value` (可选): 如果超出窗口范围，返回的默认值。
    - **使用场景:** 计算与前一天的差值、环比增长率、获取上一个订单的信息等。
- **`LEAD(value_expression, offset, default_value) OVER (...)`**: 访问窗口中**当前行之后** `offset` 行的 `value_expression` 的值。超出窗口范围的处理方式与 `LAG()` 类似。
    
    - **使用场景:** 预测未来趋势、与未来数据进行比较、按时间顺序处理事件。
- **`FIRST_VALUE(value_expression) OVER (...)`**: 返回窗口中**第一行**的 `value_expression` 的值。窗口的第一行是根据 `OVER()` 子句中的 `ORDER BY` 确定的。
    
    - **使用场景:** 获取每个分组的起始值、每个用户首次访问时间等。
- **`LAST_VALUE(value_expression) OVER (...)`**: 返回窗口中**最后一行**的 `value_expression` 的值。默认情况下，`LAST_VALUE()` 的窗口框架是 `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`，这意味着在默认情况下，它只考虑当前行及其之前的行作为窗口。要获取整个窗口的最后一行值，通常需要显式指定窗口框架为 `RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` 或 `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`。
    
    - **使用场景:** 获取每个分组的结束值、每个用户最后一次访问时间等。
- **`NTH_VALUE(value_expression, n) OVER (...)`**: 返回窗口中**第 `n` 行**的 `value_expression` 的值。
    
    - `n`: 要返回的值的行号，正整数。
    - **使用场景:** 获取窗口中的特定位置的值，例如每个分组的第二高分、第三个订单信息等。

- `PERCENTILE_CONT` 和 `PERCENTILE_DISC` 的关键区别在于如何处理位于两个实际数据点之间的百分位数位置。 `PERCENTILE_CONT` 通过插值得到一个可能不在原始数据集中的连续值，而 `PERCENTILE_DISC` 则直接从原始数据集选择一个最接近的值。
```sql
PERCENTILE_CONT(percentile)
WITHIN GROUP (ORDER BY sort_expression [ASC|DESC])
OVER ([partition_clause])
-- 原理->线性插值公式：Percentile_CONT = (1 - f) * (排序后的第 i 个值) + f * (排序后的第 i+1 个值)
PERCENTILE_DISC(percentile)
WITHIN GROUP (ORDER BY sort_expression [ASC|DESC])
OVER ([partition_clause])
```
|特性| `PERCENTILE_CONT` (连续百分位数)| `PERCENTILE_DISC` (离散百分位数)|
|---|---|---|
|计算方式|线性插值|从数据集中选择值|
|结果值类型|**可能不是**原始数据中的值|**必须是**原始数据中的值|
|平滑性|结果值随 `percentile` 平滑变化|结果值可能跳跃变化|
|应用场景|需要更精确的百分位数，平滑变化|需要从数据集中选择代表性的百分位数，数据离散时|
|性能|通常稍慢，因为需要插值计算|通常稍快，只需选择数据值|
- **`PERCENTILE_CONT`**: 计算出的百分位数可能**不是**原始数据中的值，它会在排序数据中，根据百分比位置，通过**线性插值**估算出一个值。这个值会落入排序后的数据集中两个相邻值之间，体现了数据的“连续性”。
- **`PERCENTILE_DISC`**: 计算出的百分位数**必须是**原始数据中的值。它从排序后的数据集中直接挑选出一个值，这个值的位置最接近百分比位置。因此，当 percentile 的值变化时，结果可能会“跳跃”到数据集中另一个实际存在的值上，体现了结果的“离散性”。
- 线性插值是一种**估算**数值的方法。当你已知两个点的值，想要估算它们之间某个位置的值时，线性插值就假设这两个点之间是**线性变化**的，用一条直线连接这两个点，然后根据你要估算的位置在这条线上的哪个地方，来计算估算值。
## 使用通配符进行过滤
通配符%看起来像是可以匹配任何东西，**但 NULL 例外**，子句 WHERE prod_name LIKE '%'不会匹配产品名称为 NULL 的行
现在 mysql 还不支持字符串匹配中使用 `[]`，msdb 支持，用法和正则表达式一致：
- `'[JM]%'` 以 j 或者 m 开头的字符串
- `'[^JM]%'` 否定匹配模式
通配符搜索一般比前面讨论的其他搜索要耗费更长的处理时间。
## 创建计算字段
拼接是将值联结到一起（将一个值附加到另一个值）构成单个值，此操作符可用加号（+）或两个竖杠（||）表示。在 MySQL 和 MariaDB 中，必须使用特殊的函数。
类似这样（MSDB）
```sql
SELECT vend_name + '(' + vend_country + ')'
FROM Vendors
ORDER BY vend_name;
-- 或者
SELECT vend_name || '(' || vend_country || ')'
FROM Vendors
ORDER BY vend_name;
```
Mysql 中使用 concat 实现字符串拼接功能
```sql
select concat(v.vend_name,'(',v.vend_country,')') from vendors v order by vend_name ;
-- 或者
select concat(rtrim(v.vend_name), '(', rtrim(v.vend_country), ')') from vendors v order by v.vend_name ;
```
空格处理：CONCAT 函数不会自动去除字符串两侧的空格，因此如果 vend_name 或 vend_country 中有多余的空格，拼接后的字符串可能包含不必要的空格。而第一段代码中使用了 RTRIM 来显式去除右侧空格。
## 使用函数处理数据
### 处理字符串
 SQL 函数不区分大小写，因此 upper (), UPPER (), Upper () 都可以，substr (), SUBSTR (), SubStr () 也都行。随你的
喜好，不过注意保持风格一致

| 函数名                 | 作用                        | 使用注意事项                           | 含义/示例                                                          |
| ------------------- | ------------------------- | -------------------------------- | -------------------------------------------------------------- |
| `CONCAT()`          | 将多个字符串拼接成一个字符串            | 如果任一参数为 `NULL`，结果为 `NULL`          | `CONCAT('Hello', ' ', 'World')` 返回 `'Hello World'`             |
| `CONCAT_WS()`       | 用指定的分隔符拼接多个字符串            | 第一个参数是分隔符，如果分隔符为 `NULL`，结果为 `NULL` | `CONCAT_WS('-', '2023', '10', '05')` 返回 `'2023-10-05'`         |
| `SUBSTRING()`       | 从字符串中提取子字符串               | 起始位置从 1 开始，如果起始位置为负数，则从字符串末尾开始计算   | `SUBSTRING('Hello World', 7, 5)` 返回 `'World'`                  |
| `LEFT()`            | 从字符串左侧提取指定长度的子字符串         | 如果长度为负数，返回空字符串                   | `LEFT('Hello World', 5)` 返回 `'Hello'`                          |
| `RIGHT()`           | 从字符串右侧提取指定长度的子字符串         | 如果长度为负数，返回空字符串                   | `RIGHT('Hello World', 5)` 返回 `'World'`                         |
| `LENGTH()`          | 返回字符串的字节长度                | 对于多字节字符集（如 UTF-8），可能返回的字节数大于字符数   | `LENGTH('Hello')` 返回 `5`                                       |
| `CHAR_LENGTH()`     | 返回字符串的字符长度                | 适用于多字节字符集，返回字符数而非字节数             | `CHAR_LENGTH('你好')` 返回 `2`                                     |
| `TRIM()`            | 去除字符串两侧的空格或指定字符           | 默认去除空格，可以指定去除的字符                 | `TRIM(' Hello ')` 返回 `'Hello'`                                 |
| `LTRIM()`           | 去除字符串左侧的空格或指定字符           | 默认去除空格，可以指定去除的字符                 | `LTRIM(' Hello')` 返回 `'Hello'`                                 |
| `RTRIM()`           | 去除字符串右侧的空格或指定字符           | 默认去除空格，可以指定去除的字符                 | `RTRIM('Hello ')` 返回 `'Hello'`                                 |
| `REPLACE()`         | 替换字符串中的指定子字符串             | 区分大小写，如果替换的子字符串不存在，返回原字符串        | `REPLACE('Hello World', 'World', 'MySQL')` 返回 `'Hello MySQL'`  |
| `UPPER()`           | 将字符串转换为大写                 | 不改变原字符串，返回新字符串                   | `UPPER('Hello')` 返回 `'HELLO'`                                  |
| `LOWER()`           | 将字符串转换为小写                 | 不改变原字符串，返回新字符串                   | `LOWER('HELLO')` 返回 `'hello'`                                  |
| `INSTR()`           | 返回子字符串在字符串中第一次出现的位置       | 如果未找到子字符串，返回 `0`，位置从 1 开始           | `INSTR('Hello World', 'World')` 返回 `7`                         |
| `LOCATE()`          | 返回子字符串在字符串中第一次出现的位置       | 与 `INSTR()` 类似，但可以指定起始搜索位置         | `LOCATE('o', 'Hello World', 5)` 返回 `5`                         |
| `LPAD()`            | 在字符串左侧填充指定字符，直到达到指定长度     | 如果原字符串长度大于指定长度，返回截断后的字符串         | `LPAD('Hello', 10, '*')` 返回 `'*****Hello'`                     |
| `RPAD()`            | 在字符串右侧填充指定字符，直到达到指定长度     | 如果原字符串长度大于指定长度，返回截断后的字符串         | `RPAD('Hello', 10, '*')` 返回 `'Hello*****'`                     |
| `REPEAT()`          | 将字符串重复指定次数                | 如果次数为 0 或负数，返回空字符串                 | `REPEAT('Ha', 3)` 返回 `'HaHaHa'`                                |
| `REVERSE()`         | 反转字符串                     | 不改变原字符串，返回新字符串                   | `REVERSE('Hello')` 返回 `'olleH'`                                |
| `INSERT()`          | 在指定位置插入子字符串，并替换指定长度的字符    | 如果起始位置超出字符串长度，返回原字符串             | `INSERT('Hello', 2, 3, 'MySQL')` 返回 `'HMySQLo'`                |
| `FORMAT()`          | 将数字格式化为指定小数位数的字符串         | 小数位数必须为非负整数，默认使用逗号作为千位分隔符        | `FORMAT(1234567.89, 2)` 返回 `'1,234,567.89'`                    |
| `HEX()`             | 将字符串或数字转换为十六进制表示          | 对于字符串，返回每个字符的十六进制值               | `HEX('Hello')` 返回 `'48656C6C6F'`                               |
| `UNHEX()`           |                           | 如果输入不是有效的十六进制字符串，返回 `NULL`        | `UNHEX('48656C6C6F')` 返回 `'Hello'`                             |
| `ASCII()`           | 返回字符串第一个字符的 ASCII 码值        | 如果字符串为空，返回 `0`                    | `ASCII('A')` 返回 `65`                                           |
| `CHAR()`            | 根据 ASCII 码值返回对应的字符          | 可以传入多个 ASCII 码值，返回拼接后的字符串          | `CHAR(65, 66, 67)` 返回 `'ABC'`                                  |
| `SOUNDEX()`         | 返回字符串的 SOUNDEX 编码，用于语音相似性比较 | 仅适用于英文字符，结果为一个 4 字符的编码             | `SOUNDEX('Hello')` 返回 `'H400'`                                 |
| `SUBSTRING_INDEX()` | 根据指定的分隔符返回字符串的子字符串        | 如果计数为正数，从左开始；如果为负数，从右开始          | `SUBSTRING_INDEX('www.mysql.com', '.', 2)` 返回 `'www.mysql'`    |
| `ELT()`             | 根据索引返回列表中的字符串             | 索引从 1 开始，如果索引超出范围，返回 `NULL`         | `ELT(2, 'Apple', 'Banana', 'Cherry')` 返回 `'Banana'`            |
| `FIELD()`           | 返回字符串在列表中的位置              | 如果字符串不在列表中，返回 `0`                 | `FIELD('Banana', 'Apple', 'Banana', 'Cherry')` 返回 `2`          |
| `FIND_IN_SET()`     | 返回字符串在逗号分隔的字符串列表中的位置      | 如果字符串不在列表中，返回 `0`                 | `FIND_IN_SET('Banana', 'Apple,Banana,Cherry')` 返回 `2`          |
| `MAKE_SET()`        | 根据位掩码返回由逗号分隔的字符串列表        | 位掩码的每一位对应一个字符串，从右到左              | `MAKE_SET(3, 'Apple', 'Banana', 'Cherry')` 返回 `'Apple,Banana'` |
| `QUOTE()`           | 将字符串用单引号括起来，并转义特殊字符       | 主要用于生成 SQL 语句中的字符串字面量              | `QUOTE("O'Reilly")` 返回 `"'O\'Reilly'"`                         |
| `REGEXP`            | 判断字符串是否匹配正则表达式            | 返回 `1`（匹配）或 `0`（不匹配）               | `'Hello' REGEXP '^H'` 返回 `1`                                   |
| `REGEXP_REPLACE()`  | 使用正则表达式替换字符串中的匹配部分        | 需要 MySQL 8.0 及以上版本支持               | `REGEXP_REPLACE('Hello123', '[0-9]', '')` 返回 `'Hello'`         |
| `REGEXP_SUBSTR()`   | 返回字符串中匹配正则表达式的子字符串        | 需要 MySQL 8.0 及以上版本支持               | `REGEXP_SUBSTR('Hello123', '[0-9]+')` 返回 `'123'`               |
| `REGEXP_INSTR()`    | 返回字符串中匹配正则表达式的子字符串的起始位置   | 需要 MySQL 8.0 及以上版本支持               | `REGEXP_INSTR('Hello123', '[0-9]+')` 返回 `6`                    |
SOUNDEX 是一个将任何文本串转换为描述其语音表示的字母数字模式的算法。SOUNDEX 考虑了类似的发音字符和音节，使得能对字符串进行发音比较而不是字母比较。**仅支持 ASCII 字符**，中文使用 Unicode 字符不支持，但是可以通过存储拼音字段配合辅助函数解决这个问题
```python
from pypinyin import pinyin, lazy_pinyin, Style
def get_pinyin(text):
    return ''.join(lazy_pinyin(text))
# 示例数据
chinese_text = '你好世界'
print(get_pinyin(chinese_text))  # 输出 'nihao shijie'
```
---
### 处理时间
| 函数名                | 作用            | 返回值示例                 | 注意事项                        |
| ------------------ | ------------- | --------------------- | --------------------------- |
| `NOW()`            | 返回当前日期和时间     | `2023-10-05 14:30:45` | 包含日期和时间                     |
| `CURDATE()`        | 返回当前日期        | `2023-10-05`          | 仅包含日期                       |
| `CURTIME()`        | 返回当前时间        | `14:30:45`            | 仅包含时间                       |
| `DATE()`           | 提取日期部分        | `2023-10-05`          | 从日期时间中提取日期                  |
| `TIME()`           | 提取时间部分        | `14:30:45`            | 从日期时间中提取时间                  |
| `YEAR()`           | 提取年份          | `2023`                | 返回整数                        |
| `MONTH()`          | 提取月份          | `10`                  | 返回整数                        |
| `DAY()`            | 提取日           | `5`                   | 返回整数                        |
| `HOUR()`           | 提取小时          | `14`                  | 返回整数                        |
| `MINUTE()`         | 提取分钟          | `30`                  | 返回整数                        |
| `SECOND()`         | 提取秒           | `45`                  | 返回整数                        |
| `DATE_ADD()`       | 在日期上添加时间间隔    | `2023-10-06`          | 支持多种时间间隔（DAY, MONTH, YEAR 等） |
| `DATE_SUB()`       | 在日期上减去时间间隔    | `2023-09-05`          | 支持多种时间间隔                    |
| `DATEDIFF()`       | 计算两个日期之间的天数差  | `4`                   | 返回整数                        |
| `TIMEDIFF()`       | 计算两个时间之间的差值   | `02:30:45`            | 返回时间差值                      |
| `DATE_FORMAT()`    | 格式化日期         | `2023/10/05`          | 支持自定义格式                     |
| `STR_TO_DATE()`    | 将字符串转换为日期     | `2023-10-05`          | 需要指定格式                      |
| `UNIX_TIMESTAMP()` | 将日期转换为 Unix 时间戳 | `1696523445`          | 返回秒数                        |
| `FROM_UNIXTIME()`  | 将 Unix 时间戳转换为日期 | `2023-10-05 14:30:45` | 支持格式化                       |
| `DAYOFWEEK()`      | 返回日期是星期几      | `5`                   | 1=周日，7=周六                   |
| `WEEK()`           | 返回日期所在的周数     | `40`                  | 周数从 1 开始                      |
| `LAST_DAY()`       | 返回日期所在月份的最后一天 | `2023-10-31`          | 返回日期                        |
MySQL 能够自动将符合特定格式的字符串解析为时间类型（如 `DATE`、`DATETIME`、`TIMESTAMP` 等）。如果字符串格式符合 MySQL 的时间格式要求，MySQL 会在插入或查询时自动将其转换为时间类型。
#### **支持的字符串格式**
以下是 MySQL 支持的部分字符串格式：
- **DATE**: `YYYY-MM-DD`（如 `'2023-10-05'`）
- **DATETIME**: `YYYY-MM-DD HH:MM:SS`（如 `'2023-10-05 14:30:45'`）
- **TIMESTAMP**: `YYYY-MM-DD HH:MM:SS`（如 `'2023-10-05 14:30:45'`）
- **使用 `STR_TO_DATE()` 函数** 如果字符串格式不符合 MySQL 的默认格式，可以使用 `STR_TO_DATE()` 函数显式转换。
```sql
SELECT STR_TO_DATE('05-10-2023', '%d-%m-%Y'); -- 返回 2023-10-05
```
### 聚合函数
| 函数名                | 作用                                                                                                     | 返回值类型  | 适用场景             |
| ------------------ | ------------------------------------------------------------------------------------------------------ | ------ | ---------------- |
| `COUNT()`          | 计算行数， COUNT (column) 对特定列中具有值的行进行计数，忽略 NULL 值，`COUNT(*)` 用于计算表中的总行数，包括所有列和所有行。它的作用是统计数据的总行数，而不是基于某一列的值。 | 整数     | 统计行数或非空值数量       |
| `SUM()`            | 计算数值列的总和                                                                                               | 数值     | 计算总和（如工资总额）      |
| `AVG()`            | 计算数值列的平均值                                                                                              | 数值     | 计算平均值（如平均工资）     |
| `MIN()`            | 返回列中的最小值，在**一些 DBMS 中**在用于文本数据时，MIN () 返回该列排序后最前面的行                                                    | 与列类型相同 | 查找最小值（如最低工资）     |
| `MAX()`            | 返回列中的最大值，**在一些 DBMS 中**在用于文本数据时，MAX () 返回按该列排序后的最后一行。                                                  | 与列类型相同 | 查找最大值（如最高工资）     |
| `GROUP_CONCAT()`   | 将分组中的值连接成一个字符串                                                                                         | 字符串    | 合并分组中的值（如员工姓名列表） |
| `STDDEV()`         | 计算数值列的标准差                                                                                              | 数值     | 分析数据分布的离散程度      |
| `VAR_POP()`        | 计算数值列的总体方差                                                                                             | 数值     | 分析数据的总体波动        |
| `VAR_SAMP()`       | 计算数值列的样本方差                                                                                             | 数值     | 分析数据的样本波动        |
| `BIT_AND()`        | 对分组中的值进行按位与操作                                                                                          | 整数     | 处理按位逻辑运算         |
| `BIT_OR()`         | 对分组中的值进行按位或操作                                                                                          | 整数     | 处理按位逻辑运算         |
| `BIT_XOR()`        | 对分组中的值进行按位异或操作                                                                                         | 整数     | 处理按位逻辑运算         |
| `JSON_ARRAYAGG()`  | 将分组中的值聚合为 JSON 数组                                                                                        | JSON 数组 | 生成 JSON 格式的分组数据    |
| `JSON_OBJECTAGG()` | 将分组中的键值对聚合为 JSON 对象                                                                                      | JSON 对象 | 生成 JSON 格式的分组键值对   |
由于 `count(*)` 中不涉及到表达式，所以不能使用 distinct 去重，`DISTINCT` 的作用是基于某一列或表达式的值去重，因此它必须明确指定去重的对象
## 分组数据
- GROUP BY 子句可以包含任意数目的列，因而可以对分组进行嵌套，更细致地进行数据分组。
- 如果在 GROUP BY 子句中嵌套了分组，数据将在最后指定的分组上进行汇总。换句话说，在建立分组时，指定的所有列都一起计算（所以不能从个别的列取回数据）。
- GROUP BY 子句中列出的每一列都必须是检索列或有效的表达式（但不能是聚集函数）。如果在 SELECT 中使用表达式，则必须在 GROUP BY 子句中指定相同的表达式。不能使用别名。
- 大多数 SQL 实现不允许 GROUP BY 列带有**长度可变的数据类型**（如文本或备注型字段）。
- 除聚集计算语句外，SELECT 语句中的每一列都必须在 GROUP BY 子句中给出。
- 如果分组列中包含具有 NULL 值的行，则 NULL 将作为一个分组返回。**如果列中有多行 NULL 值，它们将分为一组**。
- GROUP BY 子句必须出现在 WHERE 子句之后，ORDER BY 子句之前
---
HAVING 非常类似于 WHERE。事实上，目前为止所学过的所有类型的 WHERE 子句都可以用 HAVING 来替代。唯一的差别是，WHERE 过滤行，而 HAVING 过滤分组。
# Mysql 性能分析
### 子查询的执行方式
1. **逐行处理**：
    复杂度：`O(N * M)`，其中 `N` 是外部查询的行数，`M` 是子查询的行数
    - 子查询中的查询语句会对外部查询的每一行执行一次。
    - 在给定的代码中，对于 `Employee` 表中的每一行，子查询都需要执行一次，以查找对应经理的工资。
    - 如果表中数据量较大（例如有 1000 行），子查询就需要执行 1000 次。
2. **子查询的性能瓶颈**：
    
    - 子查询的效率依赖于子查询本身的执行速度和外部查询的数据量。
    - 如果子查询本身涉及大表或复杂查询，执行时间会显著增加。
    - 子查询无法充分利用索引或批量处理优化，导致效率较低。
3. **索引的使用**：
    
    - 即使 `managerId` 和 `id` 字段上有索引，子查询每次执行时都需要重新查找索引，增加了开销。
    - 而在自连接中，数据库可以一次性利用索引完成连接操作。

---
### 自连接（`INNER JOIN`）的执行方式
1. **批量处理**：
    - 复杂度：`O(N * log M)` 或 `O(N + M)`，具体取决于索引和优化器的执行计划。
    - 自连接会一次性将两个表（或同一个表）进行连接，生成中间结果。
    - 数据库优化器可以根据连接条件和索引优化查询计划，减少扫描的数据量。
2. **索引优化**：
    
    - 如果 `managerId` 和 `id` 字段上有索引，自连接可以利用索引快速定位匹配的记录。
    - 数据库优化器可以生成高效的执行计划，避免不必要的全表扫描。
3. **减少重复计算**：
    
    - 自连接只需要执行一次连接操作，而子查询需要对外部查询的每一行重复执行，导致重复计算。

# C++数据库编程（mysql-connenctor-cpp）
## 准备工作
mysql-connector-cpp 安装步骤 [2025最新版VS2022配置C++ connector连接mysql(保姆级教学)mysql c++ connector-CSDN博客](https://blog.csdn.net/weixin_74027669/article/details/137203874)
![[Pasted image 20250620144029.png]]
随着 mysql 更新，`mysqlcppconnXXXXXXX.dll` 文件数字可能有变化，需要对应地调整
![[Pasted image 20250620144354.png]]
中的第二项 `mysqlcppconn8.lib`

> 记下这里时（2025 年 6 月 20 日14:45:29）已经升级到了 `mysqlcppconnx.dll`（10）所以需要在图片中位置相应改动

### 链接模板
完整代码实现见[[MySQL Long Code Practice#C++数据库编程#mysql-connector-cpp 链接模板|基本功能实现代码]]
示例代码中必须要能够登录 root 账户才能 `create database` 操作，如果没有权限可以参考下面代码**操作数据库**
```cpp
#include <cppconn/statement.h>
#include <cppconn/resultset.h>
#include <cppconn/exception.h>
#include <cppconn/driver.h>
#include <iostream>

// 强制使用多字节字符集
#pragma execution_character_set("utf-8")  // 避免debug和release模式下字符解析问题

int main() {
    // 统一连接配置
    const char* host = "mysql2.sqlpub.com";
    const int port = 3307;
    const char* user = "sickwag";
    const char* password = "iyNnmQ6mNSKqSmgF";

    try {
        sql::Driver* driver = get_driver_instance();

        // 标准连接字符串格式
        std::string connStr = "tcp://" + std::string(host) + ":" + std::to_string(port);

        // 添加连接参数
        sql::ConnectOptionsMap options;

        options["hostName"] = host;
        options["port"] = port;
        options["userName"] = user;
        options["password"] = password;
        options["OPT_RECONNECT"] = true;
        options["OPT_CHARSET_NAME"] = "utf8mb4";

        sql::Connection* con = driver->connect(options);

        if (con->isValid()) {
            std::cout << "连接成功!" << std::endl;
            // 执行SQL...
            sql::Statement* stmt = con->createStatement();
            stmt->execute("use sickwag_learing_db");
            stmt->execute("drop table if exists problems");

        }

        delete con;
    }
    catch (sql::SQLException& e) {
        std::cerr << "error code: " << e.getErrorCode() << std::endl
            << "SQL statement: " << e.getSQLState() << std::endl
            << "error info: " << e.what() << std::endl;
    }

    return 0;
}
```
教程中代码仅仅只能用于 release 中，debug 模式下会出现堆栈异常

> PS：
> - 代码中的 driver，con 和 stmt 对象是指针，需要手动释放资源
> - **`driver`**：获取驱动实例，用于创建连接。由单例模式函数 `get_driver_instance()` 函数的单例对象控制，不需要手动控制
- **`con`**：通过驱动实例创建连接对象，使用指针以便后续管理连接的生命周期。多个连接可以共用一个驱动
- **`stmt`**：通过连接对象创建语句对象，同样使用指针以便执行 SQL 语句和资源管理。生命周期和 con 绑定，连接管理了自然不会有语句对象
### 连接数据库参数
#### 使用参数或者纯字符串连接
连接的各项指标 `options` 字符串参数填写**必须使用 `(const) char*` 字符数组**初始化的变量，**不能使用 `string`**，因为会在末尾填上 `\n` 导致
```sql
SQL Error: Access denied for user 'sickwag'@'42.97.247.141' (using password: YES)
Error Code: 1045
```
1045 错误**最有可能表示的是**账号密码输入错误，在 sprintboot 或者会自动添加 `\n` 的 `string` 对象代码中出现，也可能是因为拼写错误
正确参考：
```cpp
const char* host = "mysql2.sqlpub.com";
const int port = 3307;
const char* user = "sickwag";
const char* password = "iyNnmQ6mNSKqSmgF";
const char* db_name = "sickwag_learing_db";

MySQLDB db(host, port, user, password, db_name);

MySQLDB::MySQLDB(const std::string& host, int port, const std::string& user, const std::string& password, const std::string& db)
    : driver(sql::mysql::get_mysql_driver_instance()) {

    std::string connStr = "tcp://" + host + ":" + std::to_string(port);
    con.reset(driver->connect(connStr, user, password));  // 更稳定，兼容多数认证方式

    if (!db.empty()) {
        con->setSchema(db);
    }

    con->setAutoCommit(false);
}
```

#### 使用 `ConnectOptionsMap` 连接
`ConnectOptionsMap` 是 MySQL Connector/C++ 中一种**类型安全的连接配置方式**，可以设置：
- 主机、端口、用户名、密码
- 编码、SSL、连接超时
- 认证方式、连接池、压缩等高级参数
比传统的 `connect("tcp://host:port", user, password)` 更强大

| 参数名（Key）                                | 示例值                               | 说明                                |
| --------------------------------------- | --------------------------------- | --------------------------------- |
| `"hostName"`                            | `"localhost"` 或 `"192.168.1.100"` | 主机地址                              |
| `"port"`                                | `3306`                            | 端口号                               |
| `"userName"`                            | `"root"`                          | 登录用户名                             |
| `"password"`                            | `"your_password"`                 | 登录密码                              |
| `"password2"`                           | `"failover_password"`             | 主密码失败时使用备用密码（例如主从切换）              |
| `"password3"`                           | `"secondary_backup_password"`     | 第三密码（高级用法）                        |
| `"schema"`                              | `"test_db"`                       | 数据库名（相当于 setSchema）               |
| `"OPT_RECONNECT"`                       | `true`                            | 是否启用连接丢失后自动重连                     |
| `"OPT_CHARSET_NAME"`                    | `"utf8mb4"`                       | 设置连接字符集                           |
| `"OPT_CONNECT_TIMEOUT"`                 | `30`（秒）                           | 设置连接超时时间                          |
| `"OPT_READ_TIMEOUT"`                    | `30`                              | 读取超时时间                            |
| `"OPT_WRITE_TIMEOUT"`                   | `30`                              | 写入超时时间                            |
| `"OPT_LOCAL_INFILE"`                    | `true`                            | 是否启用 `LOAD DATA LOCAL INFILE`     |
| `"OPT_SSL_MODE"`                        | `sql::SSLMode::SSL_MODE_REQUIRED` | 设置 SSL 模式（如必须加密）                  |
| `"OPT_SSL_CA"`                          | `"path/to/ca.pem"`                | SSL CA 证书路径                       |
| `"OPT_SSL_FIPS_MODE"`                   | `true`                            | 开启 FIPS 模式（合规加密）                  |
| `"OPT_PLUGIN_DIR"`                      | `"path/to/plugins"`               | 指定认证插件路径                          |
| `"OPT_DEFAULT_AUTH"`                    | `"mysql_native_password"`         | 挜定认认证插件                           |
| `"OPT_COMPRESS"`                        | `true`                            | 启用压缩协议传输数据                        |
| `"OPT_NAMED_PIPE"`                      | `true`                            | 使用命名管道连接（Windows 下）               |
| `"OPT_UNIX_SOCKET"`                     | `"/tmp/mysql.sock"`               | 指定 Unix 套接字路径                     |
| `"OPT_ZSTD_COMPRESSION_LEVEL"`          | `3`                               | ZStandard 压缩等级                    |
| `"CLIENT_MULTI_STATEMENTS"`             | `true`                            | 执行多语句（如 `SELECT a; SELECT b;`）    |
| `"CLIENT_MULTI_RESULTS"`                | `true`                            | 支持多个结果集                           |
| `"CLIENT_CAN_HANDLE_EXPIRED_PASSWORDS"` | `true`                            | 允许处理过期密码                          |
| `"OPT_REPORT_DATA_TRUNCATION"`          | `true`                            | 是否报告数据截断警告                        |
| `"OPT_HOST_READ_ONLY"`                  | `true`                            | 只连接到只读实例（用于负载均衡）                  |
| `"OPT_USE_TLS"`                         | `true`                            | 使用 TLS 加密连接                       |
| `"OPT_TLS_VERSION"`                     | `"TLSv1.2,TLSv1.3"`               | 指定 TLS 使用版本                       |
| `"OPT_FIDO_CALLBACK"`                   | FIDO 回调函数                         | 用于 FIDO 认证（如 MySQL 8.0 的 FIDO 认证） |

其中：
如果没有分行解析 sql 的需求，想要将整个 sql 文件中的所有内容转化为纯字符发送到 mysql 数据库一次性执行，就需要开启多语句支持 `CLIENT_MULTI_STATEMENT`，多结果集返回查询需要开启 `CLIENT_MULTI_RESULTS`
使用 option 作为连接需要获取 options 中的参数时，需要通过 `get()` 获取类型
如options 中存储了数据库名称，现在需要通过  `setSchema` 来设置默认连接的数据库，则需要使用
```cpp
on->setSchema(options["schema"].get<sql::SQLString>()->asStdString());
```
先获取键值（`sql::ConnectOptionsMap`）的结构为
```cpp
typedef std::map< sql::SQLString, ConnectPropertyVal > ConnectOptionsMap;
typedef sql::Variant ConnectPropertyVal;
```
所以需要先 get 获取元数据，然后转化为需要的数据类型，所有的元数据已经支持 bool，int，double 等类型，SQLString 对象有 asStdString 方法可以转化
### 常用操作分类与常用 API

#### 1️⃣ 连接与初始化

|操作|API 示例|说明|
|---|---|---|
|获取驱动实例|`sql::Driver* driver = get_driver_instance();`|获取 MySQL 驱动|
|连接到数据库|`sql::Connection* con = driver->connect(host, user, pass);`|使用用户名/密码连接|
|使用连接参数|`con = driver->connect(options);`|`sql::ConnectOptionsMap` 用于更灵活的连接配置|
|设置数据库|`con->setSchema("test_db");`|选择当前操作的数据库|

#### 2️⃣ SQL 执行操作

|操作|API 示例|说明|
|---|---|---|
|创建语句对象|`sql::Statement* stmt = con->createStatement();`|用于执行静态 SQL|
|执行通用 SQL|`stmt->execute("SQL语句");`|可用于 CREATE、INSERT、UPDATE、DELETE、DROP 等|
|执行查询 SQL|`sql::ResultSet* res = stmt->executeQuery("SELECT ...");`|用于 SELECT 查询|
|执行更新 SQL|`int rows = stmt->executeUpdate("UPDATE ...");`|会返回影响行数|
|预编译语句|`sql::PreparedStatement* pstmt = con->prepareStatement("INSERT INTO ... VALUES (?, ?)");`|用于参数化 SQL|
|设置参数|`pstmt->setString(1, "value");`|设置预编译参数|
|执行预编译语句|`pstmt->executeUpdate();`|执行预编译 SQL|

#### 3️⃣ 结果处理（ResultSet）

|操作|API 示例|说明|
|---|---|---|
|遍历结果集|`while (res->next())`|从上到下按行读取|
|获取字段值|`res->getString("name")` 或 `res->getInt(1)`|按字段名或索引获取|
|获取字段类型|`meta->getColumnTypeName(i)`|从 `ResultSetMetaData` 获取类型|
|获取字段名|`meta->getColumnName(i)`|获取列名|
|获取字段数量|`meta->getColumnCount()`|获取结果集字段数|
|获取下一个结果|`stmt->getMoreResults()`|用于处理多语句查询|
|获取当前结果集|`stmt->getResultSet()`|多结果集处理中使用|

#### 4️⃣ 元数据（Metadata）

| 操作       | API 示例                                               | 说明             |
| -------- | ---------------------------------------------------- | -------------- |
| 获取数据库元信息 | `sql::DatabaseMetaData* meta = con->getMetaData();`  | 包括数据库名、版本、表信息等 |
| 获取表信息    | `meta->getTables(...)`                               | 获取数据库中所有表      |
| 获取列信息    | `meta->getColumns(...)`                              | 获取某张表的列信息      |
| 获取结果集元数据 | `sql::ResultSetMetaData* meta = res->getMetaData();` | 获取查询结果的字段信息    |

#### 5️⃣ 事务控制

|操作|API 示例|说明|
|---|---|---|
|设置事务自动提交|`con->setAutoCommit(false);`|关闭自动提交，开启事务|
|提交事务|`con->commit();`|提交事务|
|回滚事务|`con->rollback();`|出错时回滚事务|

#### 6️⃣ 资源管理与释放

|操作|API 示例|说明|
|---|---|---|
|释放 Statement|`delete stmt;`|手动释放语句资源|
|释放 ResultSet|`delete res;`|手动释放查询结果|
|关闭连接|`con->close();`|释放数据库连接资源|
|释放连接|`delete con;`|手动释放连接对象|

> ✅ 推荐使用 `std::unique_ptr` 或封装类实现资源自动释放，避免内存泄漏

---

### 常用编程定式（Best Practices）

#### 1. 使用 `try-catch` 捕获异常
```cpp
try {
    // 所有数据库操作
}
catch (sql::SQLException& e) {
    std::cerr << "SQL Error: " << e.what() << std::endl;
    std::cerr << "Error Code: " << e.getErrorCode() << std::endl;
}

```

#### 2. 使用 `unique_ptr` 封装资源（RAII 风格）
```cpp
#include <memory>

std::unique_ptr<sql::Statement> stmt(con->createStatement());
std::unique_ptr<sql::ResultSet> res(stmt->executeQuery("SELECT * FROM users"));
```

#### 3. 使用 `PreparedStatement` 防止 SQL 注入
```cpp
std::unique_ptr<sql::PreparedStatement> pstmt(con->prepareStatement("INSERT INTO users (name, age) VALUES (?, ?)"));
pstmt->setString(1, "Alice");
pstmt->setInt(2, 25);
pstmt->executeUpdate();
```

#### 4. 使用 `ResultSetMetaData` 获取列信息
```cpp
sql::ResultSetMetaData* meta = res->getMetaData();
for (int i = 1; i <= meta->getColumnCount(); ++i) {
	std::cout << meta->getColumnName(i) << " (" << meta->getColumnTypeName(i) << ") | ";
}
// 获取最新创建的一行记录的id值
std::string sql_string_query = "SELECT id FROM users ORDER BY created_at DESC LIMIT 1;";
auto result = db.query(sql_string_query);

if (result->next()) {
    int last_id = result->getInt("id");
    std::cout << "Latest ID: " << last_id << std::endl;
    // 使用 last_id 进行后续操作
} else {
    std::cerr << "No results found." << std::endl;
}
```

#### 5. 多语句查询处理
```cpp
stmt->execute("SELECT * FROM table1; SELECT * FROM table2");
do {
std::unique_ptr<sql::ResultSet> res(stmt->getResultSet());    // 处理当前结果集
} while (stmt->getMoreResults());
```

#### 6. 事务处理定式
```cpp
con->setAutoCommit(false);
try {
    stmt->executeUpdate("UPDATE ...");
	stmt->executeUpdate("INSERT ...");
	con->commit();
} catch (sql::SQLException&) {
	    con->rollback();
		throw;
}
```

#### 7. 语句执行情况检查
| API               | 返回值类型              | 是否成功       | 是否影响行数      | 是否有结果集          |
| ----------------- | ------------------ | ---------- | ----------- | --------------- |
| `execute()`       | `bool`             | ✅ 检查是否抛出异常 | ❌           | ✅ `true` 表示有结果集 |
| `executeQuery()`  | `ResultSet*`       | ✅          | ❌           | ✅               |
| `executeUpdate()` | `int`              | ✅          | ✅           | ❌               |
| `executeBatch()`  | `std::vector<int>` | ✅          | ✅（每条语句影响行数） | ❌               |
##### `execute()`
```cpp
bool hasResultSet = stmt->execute("SQL语句");
```

| 返回值     | 说明                                 |
| ------- | ---------------------------------- |
| `true`  | 执行成功并且返回了结果集（如 SELECT）             |
| `false` | 执行成功但没有结果集（如 INSERT、UPDATE、DELETE） |

> ❗不能通过 `execute()` 判断是否出错，只管结果是否是 ResultSet。

##### `executeQuery()` 

```cpp
sql::ResultSet* res = stmt->executeQuery("SELECT * FROM table");
```
- **成功时**：返回 `ResultSet*` 用于读取数据。
- **失败时**：抛出 `sql::SQLException` 异常。
所以使用 c++操控 sql 时一般都放在 try-catch 语句中执行


##### `executeUpdate()`
```cpp
int affectedRows = stmt->executeUpdate("UPDATE ...");
```

|返回值|含义|
|---|---|
|`>=0`|成功，表示受影响的行数（如 1、2、3）|
|抛出异常|执行失败，如语法错误或约束冲突|

##### `executeNonQuery()`（Connector/C++ 8.0+）
```cpp
sql::SQLString query("DELETE FROM users WHERE id=1");
sql::SQLExecutionThread safeQuery(con);
safeQuery.execute(query);
```

> 特定于线程安全执行，返回 `bool` 表示成功与否。

##### `getWarnings()` 和 `clearWarnings()`
```cpp
sql::SQLWarning* warning = con->getWarnings();
while (warning) {
	std::cerr << "Warning: " << warning->getMessage() << std::endl;
	warning = warning->getNextWarning();
}
con->clearWarnings();
```

> 用于获取连接或语句的警告信息（如字段截断、类型转换警告等）。

##### `getErrorCode()` 和 `getSQLState()`
```cpp
catch (sql::SQLException& e) {
	std::cerr << "Error Code: " << e.getErrorCode() << std::endl;
	std::cerr << "SQL State: " << e.getSQLState() << std::endl;
	std::cerr << "Message: " << e.what() << std::endl;
}
```

    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
	    name varchar(255) not null,
	     age int not null
    );
#### 8. 直接提交 sql 脚本
```cpp
void MySQLDB::executeFromFile(const std::string& filePath) {
	std::ifstream f(filePath);
	if (!f.is_open()) {
		throw std::runtime_error("cannot open this file: " + filePath);
	}
	// remove all comments
	std::string statment, line;
	while (std::getline(f, line)) {
		if (line.starts_with("-- ") or line.starts_with("# ")) {
			continue;
		} else {
			statment += line;
		}
	}
	f.close();
	if (statment.empty()) {
		throw std::runtime_error("sql file is empty!");
	}
	std::unique_ptr<sql::Statement> stmt(con->createStatement());
	try {
		stmt->execute(statment);
	}
	catch (const sql::SQLException& e) {
		print_sql_error(e);
	}
}
```
需要注意：
提交的 sql 文件编码是 utf-8 格式，否则需要设置额外解码参数给 fstream，调整文件编码格式可以参考 [Visual Studio 设置默认编码格式为 UTF-8 或 GB2312-80 与文件没有高级保存选项怎么显示](https://blog.csdn.net/qq_41868108/article/details/105750175)，不然在会出现
```bash
connected!
sql error code: 1064
sql statement: 42000
sql description: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '' at line 1
```
乍看之下还看不出哪里有问题，语法错误，通过调试会发现，statement 字符串值显示为 `<字符串中的字符无效。>`，打开其中内容发现其中有大量 `\0` 无意义字符，判定为文件编码问题，修改为 utf-8 即可解决

## 解析数据库返回内容
由于[[MySQL Long Code Practice#mysql-connector-cpp 链接模板|链接模板]]预输入代码将所有插入内容视为字符串插入
```cpp
int MySQLDB::prepare_execute(const std::string& sql, const std::vector<std::string>& params) {
	std::unique_ptr<sql::PreparedStatement> pstmt(con->prepareStatement(sql));
	for (size_t i = 0; i < params.size(); ++i) {
		pstmt->setString(i + 1, params[i]);
	}
	return pstmt->executeUpdate();
}
```
会在表中不为 varchar，char 类型的字段位置报错
最直接的方式是用 if-else 为每种类型设置对应设置 set 语句
```cpp
int MySQLDB::prepare_execute(const std::string& sql, const std::vector<std::variant<int, bool, std::string>>& params) {
    std::unique_ptr<sql::PreparedStatement> pstmt(con->prepareStatement(sql));
    for (size_t i = 0; i < params.size(); ++i) {
        std::visit([&pstmt, i](auto&& value) {
            using T = std::decay_t<decltype(value)>;
            if constexpr (std::is_same_v<T, int>) {
                pstmt->setInt(i + 1, value);
            } else if constexpr (std::is_same_v<T, bool>) {
                pstmt->setBoolean(i + 1, value);
            } else if constexpr (std::is_same_v<T, std::string>) {
                pstmt->setString(i + 1, value);
            }
        }, params[i]);
    }
    return pstmt->executeUpdate();
}
```
更有拓展性的方法是：
# C++数据库编程（Boost:mysql）
参考链接：[Boost 入门 - 1.88.0 - Boost C++ 函数库](https://boost.ac.cn/doc/libs/1_88_0/more/getting_started/index.html)
## 准备工作
### 模板
使用[包含 msvc 编译器的模板配置](E:\file_storage\Files\各种配置和工具\.vscode配置文件\cmake工程通用模板)，只能使用 msvc 编译器+vcpkg 整合 `boost:x64-windows`，要使用 mingw 只能重新安装 mingw 版本的 boost
连接模板为：
```cpp
#include <boost/mysql/any_connection.hpp>
#include <boost/mysql/connect_params.hpp>
#include <boost/mysql/error_with_diagnostics.hpp>
#include <boost/mysql/results.hpp>
#include <boost/asio/io_context.hpp>
#include <iostream>
#include "MySQLDB.h"

namespace mysql = boost::mysql;
namespace asio = boost::asio;

void main_impl(int argc, char** argv) {
    if (argc != 4) {
        std::cerr << "Usage: " << argv[0] << " <username> <password> <server-hostname>\n";
        exit(1);
    }

    const char* username = argv[1];
    const char* password = argv[2];
    const char* hostname = argv[3];

    // The execution context, required to run I/O operations.
    asio::io_context ctx;

    // Represents a connection to the MySQL server.
    mysql::any_connection conn(ctx);

    // The hostname, username and password to use
    mysql::connect_params params;
    params.server_address.emplace_host_and_port(hostname, 3307);
    params.username = username;
    params.password = password;

    // Connect to the server
    conn.connect(params);

    // Issue the SQL query to the server
    const char* sql = "SELECT * from users;";
    mysql::results result;
    conn.execute("use sickwag_learning;", result);
    conn.execute(sql, result);

    // Print the first field in the first row
    std::cout << result.rows().at(0).at(0) << std::endl;

    // Close the connection
    conn.close();
}

int main(int argc, char** argv) {
    try {
        main_impl(argc, argv);
    } catch (const mysql::error_with_diagnostics& err) {
        std::cerr << "Error: " << err.what() << '\n'
                  << "Server diagnostics: " << err.get_diagnostics().server_message() << std::endl;
        return 1;
    } catch (const std::exception& err) {
        std::cerr << "Error: " << err.what() << std::endl;
        return 1;
    }
}
```
参数可以再 `launch.json` 中设置，也可以 `settings.json` 全局指定

### 前置知识
#### result 结果集容器
`boost::mysql::results` 是 Boost.MySQL 提供的 **结果集容器**，用于存储 SQL 查询的返回数据。其中的方法支持链式调用，支持显式类型转换，但 **不自动转换**
`.rows()`
- 返回一个包含所有 **结果集** 的数组。
- 一个 SQL 查询可能返回多个结果集（如存储过程执行多个 `SELECT`）。
`.row().at(0).at(0)`
**row 表示结果集合数组行**
- `.rows().at(0).at(0)`：访问第一个结果集（`rows_view`）的第一行（`row_view`）的第一个字段（`field_view`）。
- `.rows()` 返回一个 `rows_view`，表示一个结果集，包含多行（`row_view`）。
- `.rows(1).at(2).at(3)`：访问 **第二个结果集** 的第三行第四列。
- `rows(i)` 返回第 `i` 个结果集（`rows_view`）。
#### 常用 api 写法
##### 处理 null 值
```cpp
const mysql::field& field = result.rows().at(0).at(0);

if (field.is_null()) {
    std::cout << "字段为 NULL" << std::endl;
} else {
    std::string value = field.get<std::string>();
}
```
##### 按字段访问
`Boost.MySQL` 本身不支持直接通过字段名访问，应该在 sql 语句中实现设置好筛选条件
```cpp
mysql::results result;
conn.execute("SELECT id, name FROM users", result);

// 获取列索引
auto meta = result.rows().meta();
int name_col_index = -1;
for (size_t i = 0; i < meta.size(); ++i) {
    if (meta[i].name() == "name") {
        name_col_index = i;
        break;
    }
}

// 访问字段值
if (name_col_index != -1) {
    for (const auto& row : result.rows()) {
        std::string name = row.at(name_col_index).get_string();
        std::cout << "Name: " << name << std::endl;
    }
}

// 访问结果集的第n行到m行的某个字段集合
// 假设字段是 id（第一个列）
for (size_t i = n; i <= m; ++i) {
    int64_t id = result.rows().at(i).at(0).get_int64();
    std::cout << "Row " << i << " ID: " << id << std::endl;
}
```
##### 预处理语句（防止 SQL 注入）
```cpp
mysql::statement stmt = conn.prepare_statement("INSERT INTO users (id, name, age) VALUES (?, ?, ?)");
// 绑定多个参数
stmt.bind(1, "Alice", 25);
// 执行插入
conn.execute(stmt);
```

##### 事务操作
```cpp
mysql::transaction tx = conn.start_transaction();
tx.execute("INSERT INTO users (name) VALUES ('Alice')");
tx.commit();  // 提交事务
```
##### 异步查询
```cpp
mysql::results result;
conn.async_execute("SELECT * FROM users", result, [&](mysql::error_code ec) {
    if (ec) {
        std::cerr << "异步查询失败: " << ec.message() << std::endl;
        return;
    }
    // 获取结果...
});
```
##### 错误处理
```cpp
try {
    conn.execute("SELECT invalid_column FROM users", result);
} catch (const mysql::error_with_diagnostics& err) {
    std::cerr << "SQL 错误: " << err.what() << std::endl;
    std::cerr << "服务器诊断: " << err.get_diagnostics().server_message() << std::endl;
}
```
#### 协程和异步编程
##### 高并发逻辑
- 同步代码：像流水线工人一样工作
	- **线性执行**：代码从上到下一行行执行。
	- **阻塞等待**：每执行一个 I/O 操作（如 `connect()`），线程必须 **停下来等**，不能做其他事。
	- 一个操作阻塞时，线程无法处理其他任务；**并发能力差**：1000 个用户请求，就需要 1000 个线程，开销大。
- 异步代码：像快递员扔包裹后继续送下一个
	- **立即返回**：`async_connect()` 启动后立即返回，不阻塞线程。
	- **回调处理**：操作完成后，调用传入的回调函数继续处理。
	- **线程不空转**：即使数据库没响应，线程也可以 **干其他事**（如处理其他连接）。
	- 操作 **发起后立即返回**，不阻塞线程，操作完成后通过通知（通过回调函数发出通知）。
	- 协程是实现异步代码的一种方式
- `co_await`
	- 当 `co_await` 后的操作（如 async 的 io 操作 `）未完成时，协程会**挂起自身**；
	- 该操作的后续结果会注册到 `io_context` 的事件循环中；
	- `co_await async_op(...)` 会自动绑定 `asio::use_awaitable` 调度器；会调用 `async_op(..., asio::use_awaitable)`。
	- 用其修饰是，当 `async_connect(...)` 等待时，协程暂停，不阻塞线程；
	- - `co_await` 标记过的操作的执行、挂起和恢复机制 **不由 `co_spawn` 的参数直接决定**，而是由协程内部的 `awaitable` 和 `io_context` 事件循环协同完成。
- `co_spawn`
	- `co_spawn`：将协程 **注册到 `io_context` 中**，由它调度；
```cpp
asio::co_spawn(
    ctx, // 事件处理器
    coro_main(conn, "mysql2.sqlpub.com:3307", "sickwag", "LqX9jBDqvDJYeooE"), // 协程和他的操作内容 
    asio::detached // 事件处理器对协程的处理行为
);
```
阻塞式写法：像写同步代码一样的代码风格和逻辑，实际上执行异步操作。
```cpp
	// 同步写法
	void sync_main(...) {
	    conn.connect(...);      // 阻塞直到连接成功
	    conn.execute(...);     // 阻塞直到查询完成
	    std::cout << result;   // 直接输出
	    conn.close();          // 阻塞直到关闭
	}
	// 异步写法
	asio::awaitable<void> coro_main(...) {
	    co_await conn.async_connect(...);  // 挂起等待连接
	    co_await conn.async_execute(...); // 挂起等待查询
	    std::cout << result...;           // 查询完成后自动恢复
	    co_await conn.async_close(...);   // 挂起等待关闭
	}
```
- 其中，`asio::awaitable<void>` 表示不返回任何值
由于传统同步写法每进行一个同步操作之后，需要写一个回调函数告知这个操作执行完毕并且进行错误处理，任务管理器根据回调函数的通知才能进行下一步操作，一旦操作需要多方通知，多层嵌套，代码就含有非常多回调，几乎不可读
##### 并发事件循环
`io_context` 是什么？
- **事件循环（Event Loop）**：就像一个“导演”，管理所有异步操作；
- 所有 `async_*` 操作（通过 `co_await` 标记的操作）都注册到 `io_context` 的 epoll/kqueue/iocp 等待队列中；
- **当 I/O 完成，`io_context` 会唤醒对应的协程**。
- 协程本质是一个 **可挂起/恢复的函数**，内部包含通过 `co_await` 修饰的操作和协程所需的局部变量，资源。
- 协程的局部变量 **不会因挂起丢失**，因为编译器会将其分配在堆内存中（而非普通函数的栈内存）。