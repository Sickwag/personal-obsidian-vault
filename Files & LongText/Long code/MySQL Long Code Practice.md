## 子查询
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
	-- DML语句所有结果是虚拟的，
	-- 创建的表放在from中表示引用，那么必须有名字
INNER JOIN job_grades g
ON
	ag_dep.ag BETWEEN lowest_sal AND highest_sal;

-- 查询由部门编号的员工来自哪个部门
SELECT -- 来自哪个部门
	department_name
FROM
	departments d
WHERE
	EXISTS (
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
		
-- 查询和zlotkey相同部门的员工姓名和工资
SELECT
	last_name,
	salary
FROM
	employees e
WHERE
	department_id = (
	SELECT
		department_id
	FROM
		employees
	WHERE
		last_name = 'zlotkey');
		
-- #2.查询工资比公司平均工资高的员工的员工号，姓名和工资。
SELECT round(avg(salary),0) FROM employees e ;

SELECT
	last_name,
	employee_id,
	salary
FROM
	employees e
WHERE
	salary > (
	SELECT
		round(avg(salary), 0)
	FROM
		employees e)
-- 3.查询各部门中工资比本部门平均工资高的员工的员工号，姓名和工资

SELECT round(avg(salary),0) FROM employees e GROUP BY department_id ;


SELECT
	employee_id,
	last_name,
	salary,
	e.department_id
FROM
	employees e
INNER JOIN (
	SELECT
		AVG(salary) ag,
		department_id
	FROM
		employees
	GROUP BY
		department_id
) ag_dep
ON
	e.department_id = ag_dep.department_id 
-- 注意这里需要连接的条件一定要写在子连接的SELECT
-- 中(创建名为ag_dep的虚拟表，SELECT就是虚拟表要显示的东西)
WHERE
	salary>ag_dep.ag ;


-- 4.查询和姓名中包含字母u的员工,在相同部门的员工的员工号和姓名
SELECT  -- 查询名字包含u的员工所在的部门，
	DISTINCT department_id  -- 很多人有u但部门唯一，需要去重
FROM
	employees e
WHERE
	last_name LIKE '%u%'; -- 结果是一个列表，这个列表作为筛选条件
	
SELECT
	last_name ,
	employee_id
FROM
	employees e
WHERE
	e.department_id IN(
	SELECT
		DISTINCT department_id
	FROM
		employees e
	WHERE
		last_name LIKE '%u%'
);
-- 5．查询在部门的location_id为1700的部门工作的员工的员工号
SELECT DISTINCT department_id FROM departments d WHERE location_id = 1700;

SELECT
	employee_id 
FROM
	employees e 
WHERE
	department_id =ANY(
	SELECT
		DISTINCT department_id
	FROM
		departments d
	WHERE
		location_id = 1700)


-- 6.查-- 询管理者是king的员工姓名和工资
SELECT employee_id FROM employees e WHERE last_name = 'K_ing';

SELECT
	last_name,
	salary
FROM
	employees e
WHERE
	manager_id =ANY(  
-- 如果k_ing只有一个人，使用=即可，但如果多个或不确定（动态变化），则使用in或=any
	SELECT
		employee_id
	FROM
		employees e
	WHERE
		last_name = 'K_ing');
-- 7.查询工资最高的员工的姓名，要求first_name和last_name显示为一列，列名为 姓.名
SELECT max(salary) FROM employees e;

SELECT
	concat(first_name, last_name) AS name
FROM
	employees e
WHERE
	e.salary = (
	SELECT
		max(salary)
	FROM
		employees e)
```

## DQL 除联合查询外联系
```sql
#1.查询工资最低的员工信息：last_name，salary
SELECT
	last_name,
	salary
FROM
	employees e
WHERE
	salary = (
	SELECT
		min(salary)
	FROM
		employees e2);
#2.查询平均工资最低的部门信息T
SELECT
	d.*
FROM
	departments d
WHERE
	d.department_id = (
	SELECT
		department_id
	FROM
		employees e
	GROUP BY
		department_id
	ORDER BY
		avg(e.salary) ASC
	LIMIT 1);
-- 方法二
-- 每个部门平均工资计算
SELECT
	avg(salary) AS ag,
	e.department_id
FROM
	employees e
GROUP BY
	department_id ;
-- 找到最低的平均工资
SELECT
	min(ag),department_id
FROM
	(
	SELECT
		avg(salary) AS ag,
		e.department_id
	FROM
		employees e
	GROUP BY
		department_id ) AS ag_dep;
	
SELECT
	min(ag),-- 聚合函数创造出来的列
	department_id -- 数据源表（from后）本身含有的列
	/*不能再后面加上,ag_dep.department_id以为可以同时
	显示出最低工资和最低工资的部门编号,
	SQL 标准不允许在同一个 SELECT 列表中混合使用
	这是因为 min(ag) 已经是一个聚合值，而不是一个列，
	你不能在外层查询中同时选择一个聚合函数的结果和原始的列
	聚合函数的结果和非聚合列*/
FROM
	(
	SELECT
		avg(salary) AS ag,
		department_id
	FROM
		employees
	GROUP BY
		department_id
) AS ag_dep
GROUP BY
	department_id;
-- ---------------------------------
	-- 因为出现了聚合值，所以要显示部门编号只能再进行一次筛选
SELECT
	avg(salary) AS ag,
	department_id
FROM
	employees e
GROUP BY 
	department_id
HAVING
	ag = (
	SELECT
		min(ag)
	FROM
		(
		SELECT
			avg(salary) AS ag,
			e.department_id
		FROM
			employees e
		GROUP BY
			department_id ) AS ag_dep);
-- 再使用这个合成表筛选出部门编号为50的部门信息

#3.1查询平均工资最低的部门信息和该部门的平均工资
-- 查询最低平均工资
SELECT
	avg(salary) avs,department_id 
FROM
	employees e
GROUP BY
	department_id
ORDER BY
	avs ASC
LIMIT 1;

-- 根据最低平均工资筛选，这里使用inner丽娜姐忽略所有NULL
-- 因为最低平均部门工资只有两列一行，其中一列department_id作为连接条件
SELECT
	d.*
FROM
	departments d
INNER JOIN (
	SELECT
		avg(salary) avs,
		department_id
	FROM
		employees e
	GROUP BY
		department_id
	ORDER BY
		avs ASC) AS ag_dep ON
	d.department_id = ag_dep.department_id;


#4.查询平均工资最高的job信息
-- 同理先查平均工资最高的工种
SELECT job_id,avg(salary) AS avs FROM employees e GROUP BY job_id ORDER BY avs DESC LIMIT 1;

SELECT
	j.*
FROM
	jobs j
INNER JOIN (
	SELECT
		job_id,
		avg(salary) AS avs
	FROM
		employees e
	GROUP BY
		job_id
	ORDER BY
		avs DESC
	LIMIT 1) AS high_job ON
	j.job_id = high_job.job_id;
-- 方法二
SELECT
	*
FROM
	jobs j
WHERE
	j.job_id =(
	SELECT
		job_id AS avs
	FROM
		employees e
	GROUP BY
		job_id
	ORDER BY
		avs DESC
	LIMIT 1);


#5.查询平均工资高于公司平均工资的部门有哪些？
SELECT avg(salary) FROM employees e; -- 公司平均工资
-- 部门平均工资
SELECT avg(salary) AS ag,department_id FROM employees e GROUP BY department_id HAVING ag > (SELECT avg(salary) FROM employees e);

SELECT
	department_name
FROM
	departments d
INNER JOIN (
	SELECT
		avg(salary) AS ag,
		department_id
	FROM
		employees e
	GROUP BY
		department_id
	HAVING
		ag > (
		SELECT
			avg(salary)
		FROM
			employees e)) AS ag_dep ON
	ag_dep.department_id = d.department_id  -- 这里department_id标红但能运行

SELECT d.department_name FROM departments d ;
#6.1查询出公司中所有manager的详细信息，
SELECT DISTINCT manager_id FROM employees e ; -- 所有领导编号

SELECT
	*
FROM
	employees e
INNER JOIN (
	SELECT
		DISTINCT manager_id
	FROM
		employees e) AS num ON
	num.manager_id = e.employee_id
	
-- 方法二
SELECT
	*
FROM
	employees e
WHERE
	employee_id IN (
	SELECT
		DISTINCT manager_id
	FROM
		employees e2);
#7．各个部门中最高工资中最低的那个部门的最低工资是多少
-- 最高工资的部门
SELECT
	department_id 
FROM
	employees e
GROUP BY
	department_id
ORDER BY
	max(salary) asc
LIMIT 1;

-- 哪个部门最高工资等于上面代码返回？
SELECT
	min(salary),
	department_id
FROM
	employees e
WHERE
	department_id = (
	SELECT
		department_id
	FROM
		employees e
	GROUP BY
		department_id
	ORDER BY
		max(salary) ASC
	LIMIT 1)
GROUP BY
	department_id ;

#8．查询平均工资最高的部门的 manager 的详细信息：
-- last_name，department_id， email， salary

-- 平均工资最高的部门编号 90
SELECT department_id FROM employees e GROUP BY department_id ORDER BY avg(salary) DESC LIMIT 1;

-- 在90号部门里查询所有人全部信息
SELECT
	*
FROM
	employees e
INNER JOIN departments d ON
	e.employee_id = d.manager_id
WHERE
	d.department_id = (
	SELECT
		department_id
	FROM
		employees e
	GROUP BY
		department_id
	ORDER BY
		avg(salary) DESC
	LIMIT 1)

-- 也可以所有人中有谁的employee_id = department表中的manager_id

SELECT *
FROM
	employees e2 
WHERE
	department_id = (
	SELECT
		department_id
	FROM
		employees e
	GROUP BY
		department_id
	ORDER BY
		avg(salary) DESC
	LIMIT 1);


SELECT
	num.last_name,
	num.department_id,
	num.email,
	num.salary
FROM
	departments d
INNER JOIN (
	SELECT
		*
	FROM
		employees e2
	WHERE
		department_id = (
		SELECT
			department_id
		FROM
			employees e
		GROUP BY
			department_id
		ORDER BY
			avg(salary) DESC
		LIMIT 1)) AS num ON
	num.employee_id = d.manager_id ;

------------------------99集练习-----------------
-- 一、查询每个专业的学生人数
SELECT majorid,count(*) FROM student s GROUP BY majorid ;
-- 二、查询参加考试的学生中，每个学生的平均分、最高分
SELECT avg(score),max(score) FROM `result` r GROUP BY studentno ;
-- 三、查询姓张的每个学生的最低分大于60的学号、姓名
SELECT
	s.studentno ,
	s.studentname
FROM
	student s
INNER JOIN `result` r ON
	s.studentno = r.studentno
WHERE
	studentname LIKE '张%'
GROUP BY
	s.studentno
HAVING
	min(score) >60;
-- 四、查询生日在“1988-1-1”后的学生姓名、专业名称
SELECT
	s.studentname,
	majorname
FROM
	student s
INNER JOIN major m ON
	s.majorid = m.majorid
WHERE
	datediff(s.borndate, '1988-1-1')>0 ;
-- 五、查询每个专业的男生人数和女生人数分别是多少
SELECT majorid,sex,count(*) FROM student s GROUP BY majorid,sex ORDER BY majorid ;
	-- 方法二
SELECT
	majorid ,
	(
	SELECT-- 创建本来不存在的列，用到子查询
		count(*)
	FROM
		student s2
	WHERE
		sex = "男"
		AND s2.majorid = s.majorid) m_num,(
	SELECT
		count(*)
	FROM
		student s2
	WHERE
		sex = "女"
		AND s2.majorid = s.majorid)f_num
FROM
	student s
GROUP BY
	majorid 

-- 六、查询专业和张翠山一样的学生的最低分
SELECT studentno FROM student s WHERE studentname = '张翠山';

SELECT
	min(score)
FROM
	`result` r
WHERE
	studentno = (
	SELECT
		studentno
	FROM
		student s
	WHERE
		studentname = '张翠山');
	
-- 七、查询大于60分的学生的姓名、密码、专业名
SELECT
	s.studentname,
	loginpwd,
	majorname
FROM
	student s
INNER JOIN major m ON
	m.majorid = s.majorid
INNER JOIN `result` r ON
	r.studentno = s.studentno
WHERE
	r.score >60;
-- 八、按邮箱位数分组，查询每组的学生个数
SELECT count(*),LENGTH (email) AS len FROM student s GROUP BY len;
-- 九、查询学生名、专业名、分数
-- 十、查询哪个专业没有学生，分别用左连接和右连接实现
SELECT
	m.*,
	s.studentno
FROM
	major m
LEFT JOIN student s ON
	m.majorid = s.majorid
WHERE
	s.studentno IS NULL; 
-- 十一、查询没有成绩的学生人数
SELECT
	count(*)
FROM
	student s
LEFT JOIN `result` r ON
	r.studentno = s.studentno
WHERE
	score IS NULL; 
```

## 视图
```sql
-- 1.查询姓名中包含a字符的员工名、部门名和工种信息
CREATE VIEW myv1 AS 
SELECT e.last_name,department_name,job_title
FROM
	employees e
INNER JOIN departments d ON
	d.department_id = e.department_id
INNER JOIN jobs j ON
	j.job_id = e.job_id;

SELECT * FROM myv1 WHERE last_name LIKE '%a%';
-- 2.查询各部门的平均工资级别
DROP VIEW IF EXISTS myv2;
CREATE VIEW myv2 AS
SELECT
	avg(e.salary) AS asv,
	jg.grade_level,
	e.department_id
FROM
	employees e
INNER JOIN departments d ON
	e.employee_id = d.department_id
INNER JOIN job_grades jg ON -- 这里注意不能写avg(e.salary因为下面已经按部门分类了
	(
	SELECT
		avg(e.salary) -- 需要把按部门分类的一列使用between and
	FROM
		employees e2
	GROUP BY
		e.department_id) BETWEEN jg.lowest_sal AND jg.highest_sal
GROUP BY
	e.department_id,jg.grade_level ;

SELECT * FROM myv2;
-- 	3.查询平均工资最低的部门信息
DROP VIEW IF EXISTS myv3;
CREATE VIEW myv3 AS 
SELECT
	e.department_id
FROM
	employees e
INNER JOIN departments d ON
	e.department_id = d.department_id
GROUP BY
	e.department_id
ORDER BY  -- 注意不能将order by放在视图外筛选，因为视图外e.salary不可视，视图外没有e表
	min(e.salary) ASC;

SELECT
	*
FROM
	myv3
INNER JOIN departments d ON
	d.department_id = myv3.department_id
LIMIT 1 ;

 -- 或者
 CREATE VIEW myv3
 AS
 SELECT * FROM myv2 ORDER BY avs LIMIT 1;
 
 
 SELECT d.*,m.asv
 FROM myv3 m
 JOIN departments d
 ON m.`department_id`=d.`department_id`;
```

## 事务
```sql
-- 1、创建表Book表，字段如下：
-- bid整型，要求主键
-- name字符型，要求设置唯一键，并非空
-- price浮点型要求有默认值10
-- btypeId类型编号，要求引用bookType表的id字段
-- 已知bookType表（不用创建），字段如下：
-- id
-- name
CREATE TABLE Book(bid int PRIMARY KEY ,
name varchar(20) UNIQUE NOT NULL ,
price double DEFAULT 10,
btypeId int ,
-- 可以写btypeId int REFERENCES bookType(id)表级约束但没效果
FOREIGN KEY (bytypeId) REFERENCES bookType(id)
);
-- 2、开启事务
-- 向表中插入1行数据，并结束
SHOW variables LIKE "%auto%";
START TRANSACTION; -- 也可以使用BEGIN
SET autocommit = 0;
INSERT INTO emp2 VALUES(123,123456);
COMMIT;
-- 3、创建视图，实现查询价格大于100的书名和类型名
CREATE OR REPLACE
VIEW myv7 AS 
SELECT
	e.last_name,
	e.department_id
FROM
	employees e WHERE e.employee_id > 50;
```
## 存储过程
### 创建存储过程实现传入用户名和密码，插入到admin表中
```sql
delimiter $
CREATE PROCEDURE mp1(IN uname varchar(20), IN upassword varchar(20)) 
BEGIN
INSERT
	INTO
	admin(admin.username,
	admin.password)
VALUES(uname,
upassword);
COMMIT;
END $

-- 上面代码只能在命令行运行
CALL mp1('sickwag','123456')$
SELECT * FROM admin a ;

-- 二、创建存储过程实现传入女神编号，返回女神名称和女神电话
CREATE PROCEDURE mp2(IN gnumber int ,OUT gname varchar(20),
gphone varchar(11))
BEGIN 
	SELECT
	g.name ,
	g.phone
INTO
	gname,
	gphone
FROM
	beauty g
WHERE
	g.id = gnumber;
END $

CALL mp2(10,@gname ,@gphone)$ -- 查询之后将查询结果放入两个变量中
SELECT @gname,@gphone ;-- 查看查询结果

-- 三、创建存储存储过程或函数实现传入两个女神生日，返回大小
CREATE PROCEDURE mp3(IN birth1 datetime ,IN birth2 datetime,OUT RESULT int)
BEGIN 
	SELECT datediff(birth1,birth2) INTO RESULT;
END $
CALL mp3('1998-1-1',now(),@result)$ -- 注意时间格式需要用''包裹
SELECT @result$
```

### 设定考试及格线，并将未及格人信息显示
注：以下代码在 sql server 中实现
```sql
CREATE PROCEDURE Usp_unpass 
    @subname VARCHAR(50),  -- 课程名称
    @score   INT           -- 成绩阈值
AS
BEGIN
    DECLARE @date DATETIME;        -- 最近考试时间
    DECLARE @subject_no INT;       -- 课程编号

    -- 获取课程编号
    SELECT @subject_no = kc.课程编号
    FROM   kc
    WHERE  kc.课程名称 = @subname;

    -- 查询成绩低于指定分数的学生信息
    SELECT xs.姓名,
           xs.性别,
           xs.学号
    FROM   xs,
           xk,
           kc
    WHERE  xk.学号 = xs.学号
           AND kc.课程编号 = xk.课程号
           AND xk.成绩 < @score
           AND kc.上课时间 = @date
           AND xk.课程号 = @subject_no;
END;
```
代码比较清晰地展示了一般函数的使用结构：
```SQL
@subname VARCHAR(50),  -- 课程名称
@score   INT           -- 成绩阈值
```
- 定义存储过程需要接受的参数
```sql
DECLARE @date DATETIME;        -- 最近考试时间
DECLARE @subject_no INT;       -- 课程编号
```
在存储过程中定义两个*局部变量*，并通过下面两个 select 语句查询到并赋值，类似于调用外部函数计算函数内部变量，两个 select 也可以封装为函数更方便调用
## 函数
```sql
-- 无参函数
-- 返回所有员工数量
delimiter $
CREATE FUNCTION myf1() RETURNS int 
BEGIN 
    DECLARE c int DEFAULT 0;
    SET c = (SELECT count(*) FROM employees);
    RETURN c;
END $

SELECT myf1()$

-- 有参函数
-- 根据员工名返回工资
CREATE FUNCTION myf2(ename varchar(20)) RETURNS int 
BEGIN 
	DECLARE rsal int DEFAULT 0;
	SET rsal = (SELECT e.salary FROM employees e WHERE e.last_name = ename);
-- 也可以这样写 	SELECT e.salary INTO rsal FROM employees e WHERE e.last_name = enmae;
	RETURN rsal;
END $

SELECT myf2('k_ing')$ -- 有两个人叫做k-ing，函数只能有一个返回值
SELECT myf2('Kochhar')$

-- 案例2：根据部门名，返回该部门的平均工资
CREATE FUNCTION myf3(dname varchar(20)) RETURNS int 
BEGIN 
	SELECT
	avg(e.salary)
INTO
	@resultsal
FROM
		employees e
LEFT JOIN departments d ON
	e.department_id = d.department_id
WHERE
		d.department_name = dname
GROUP BY
		d.department_name;
	RETURN @resultsal;
END $

SELECT myf3('Adm')$

-- 创建函数，实现传入两个float，返回二者之和
CREATE FUNCTION myf4(float1 float ,float2 float) RETURNS float
BEGIN 
	DECLARE sum float DEFAULT 0;
	SET sum = float1 + float2;
	RETURN sum;
END $

SELECT myf4(1.25,2.75)$

```

## 循环结构
```sql
-- 插入10条自定义语句

delimiter $
CREATE PROCEDURE pro_while1(IN insertcount int)
BEGIN 
	DECLARE i int DEFAULT 1;
	WHILE i < insertcount do 
		INSERT INTO admin
	VALUES(NULL,concat('azzato', i),'666');
SET i = i+1;
	END WHILE;
END $

CALL pro_while(10)$

-- 批量插入，根据次数插入到admin表中多条记录，如果次数>20则停止
CREATE PROCEDURE pro_while2(IN insertcount int)
BEGIN 
	DECLARE i int DEFAULT 1;
a:WHILE i < insertcount do 
INSERT
	INTO
	admin(username,
	`password`)
VALUES(concat('xiaoming', i),'12345');
-- 
IF i >=20 THEN LEAVE a; 
END IF;
-- if 跳出当前循环
SET i = i+1;
END WHILE a;
END $

drop procedure pro_while2$
truncate table admin$

delimiter $
CREATE PROCEDURE pro_while3(IN insertcount int)
-- 到这只创建了一个存储过程，begin表示存储过程的开始
BEGIN 
	DECLARE i int DEFAULT 0; -- 定义语句不要放在循环内，不然每次都初始化
	a:WHILE i<insertcount do 
	-- 
		SET i = i + 1;
		IF MOD(i,2) != 0 THEN ITERATE a;
	-- i为奇数时insert不记录，iterate跳出循环
-- CONTINUE 跳出当前循环进入下一次循环
		END IF ;
		INSERT INTO
		admin(username,	`password`)
		VALUES(concat('xiaoming', i),666);
	END WHILE a;
END $

-- 流程控制结构各种题型
/*
一、已知表stringcontent
其中字段：
id 自增长
content varchar(20)

向该表插入指定个数的，随机的字符串
*/
delimiter $
CREATE TABLE stringcontent( id int PRIMARY KEY AUTO_INCREMENT ,content varchar(20))$

CREATE PROCEDURE random_insert(IN insertcount int)
BEGIN 
	DECLARE i int DEFAULT 1;
	DECLARE str varchar(26) DEFAULT 'abcdefghijklmnopqrstuvwxyz';
	DECLARE startindex int;
	DECLARE len int;
	WHILE i<=insertcount do 
		SET startindex = floor(rand()*26+1);
		SET len = floor(rand()*(20-startindex+1)+1);
		-- 注意：(26-startindex+1)只是len的最大值，随机取数取0-最大值
		-- 因为字符串最大长度为20，所以len最大长度到不了26	
	INSERT INTO stringcontent(content) VALUES(substr(str,startindex,len));
	SET i = i+1; 
	END WHILE; 
END $
```