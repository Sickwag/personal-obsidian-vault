##### 181. 超过经理收入的员工
(https://leetcode.cn/problems/employees-earning-more-than-their-managers/)
重点在理解题意，连接查询
```sql
SELECT
	e1.name as Employee
FROM
	Employee e1
INNER JOIN Employee e2 ON
	e1.managerId = e2.id
WHERE
	e1.salary > e2.salary;
```
子查询
```sql
SELECT
	e1.name AS Employee
FROM
	Employee e1
WHERE
	salary > (
	SELECT
		e2.salary
	FROM
		Employee e2
	WHERE
		e1.managerId = e2.id);
```
总的来说子查询慢的原因是来自子查询中**全表扫描**了两次
![[MySQL#Mysql 性能分析#子查询的执行方式]]
![[MySQL#Mysql 性能分析#自连接（`INNER JOIN`）的执行方式]]
##### 182. 查找重复的电子邮箱
(https://leetcode.cn/problems/duplicate-emails/)
```sql
-- 临时表方法
SELECT
	record.email AS Email
FROM
	(
	SELECT
		p.email,
		count(*) AS appear
	FROM
		Person p
	GROUP BY
		p.email) AS record
WHERE
	record.appear > 1;

--自连接
SELECT
	DISTINCT p1.Email
FROM
	Person AS p1,
	Person AS p2
WHERE
	p1.Email = p2.Email
	AND p1.Id != p2.Id;

-- having作为列**聚合后**筛选条件
SELECT
	Email
FROM
	Person p
GROUP BY
	p.email
HAVING
	count(p.email)>1;
```
- 注意 from 中使用临时表，那么 select 中需要使用临时表中数据**必须要给临时表命名**
- Sql 中比较是通过一条一条记录（record，也可以成为**行**）为单位进行匹配对比的，对比操作常使用自连接
- 第三种方法**不能使用 where 替换 having**，原因：where字句无法与聚合函数一起使用。因where子句的运行**顺序排在第**二（参考：[[MySQL#DQL 语句执行和书写顺序]]），运行到where时，表还没有被分组。
- `HAVING` 子句的主要作用是对分组后的数据进行筛选，通常用于对聚合函数的结果进行过滤。它与 `WHERE` 子句的区别在于：
	- **`WHERE`**：在分组和聚合之前对原始数据进行筛选。
	- **`HAVING`**：在分组和聚合后对分组结果进行筛选。
##### 183. 从不订购的客户
(https://leetcode.cn/problems/customers-who-never-order/)
外连接方法
```sql
SELECT
    c.name AS Customers
FROM
    Customers c
LEFT JOIN Orders o
ON c.id = o.customerId
WHERE
    o.customerId IS NULL;
```
- 注意外连接保留下来的信息是哪一边的！，参考 [[MySQL#内外连接总结]]
- 使用 in 方法时用于子查询或值列表的，而不是直接用于表的字段
- 不能用 in 来检测一个值是否在表中某个**字段中**，如果想要达到这样的功能需要将这个字段提取出来作为临时表给 in 用
```sql
SELECT
	c.name
FROM
	Customers c,
	[Order] o
WHERE
	c.id NOT IN o.CustomerId;
```
***这样写是错误的***
Exists 方法
```sql
SELECT
    c.name as Customers
FROM
    Customers c
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            Orders o
        WHERE
            o.CustomerId = c.id
    );
```
Not in 方法
```sql
SELECT
    c.name as Customers
FROM
    Customers c
WHERE
    c.id NOT IN (
        SELECT
            CustomerId
        FROM
            Orders
    );

```
##### 184. 部门工资最高的员工
(https://leetcode.cn/problems/department-highest-salary/)
- 子查询+外连接
```sql
SELECT
	d.name AS Department,
	e.name AS Employee,
	e.salary AS Salary
FROM
	Employee e
LEFT JOIN Department d
	ON
	e.departmentId = d.id
WHERE
	(e.salary, e.departmentId) IN (
	SELECT
		max(e.salary),
		e.departmentId
	FROM
		Employee e
	GROUP BY
		e.departmentId);
```
窗口函数+分割子查询
```sql
SELECT
	Department,
	Employee,
	Salary
FROM
	(
	SELECT
		D.Name AS Department,
		E.Name AS Employee,
		E.Salary AS Salary,
		RANK() OVER(PARTITION BY D.Name
	ORDER BY
		E.Salary DESC) AS rank_
	FROM
		Employee E
	JOIN Department D ON
		E.DepartmentId = D.Id
) AS tmp
WHERE
	rank_ = 1;
```
##### 196. 删除重复的电子邮箱
(https://leetcode.cn/problems/delete-duplicate-emails/)
笛卡儿积方法
```sql
DELETE p1
FROM person p1
JOIN person p2
    ON p1.email = p2.email
        AND p1.id > p2.id;
```
`DELETE` 语句可以删除符合条件的行，但在使用 **自连接（Self-Join）** 时，通常需要明确指定要删除的是哪个表的行。
如果使用非笛卡尔积
```sql
delete from person p1
where p1.id not in (
    select min(p2.id)
    from person p2
    group by p2.email
);
```
Mysql 会发生报错：
```error
You can't specify target table 'p1' for update in FROM clause
```
###### 死锁故障
这个错误是 **MySQL** 特有的问题，原因是 MySQL 不允许在 `DELETE` 或 `UPDATE` 语句的子查询中直接引用被更新的表（即 `p1`）。MySQL 认为这是不安全的，可能会导致意外行为
- MySQL 在执行子查询时会锁定整个 `person` 表。
- 同时，`DELETE` 语句也会尝试锁定 `person` 表。
- 这种双重锁定会导致冲突，因此 MySQL 抛出错误。
###### 解决方法
方法 1：使用临时表
将子查询的结果存储到一个临时表中，然后在 DELETE 语句中引用该临时表。
```sql
-- 创建临时表
CREATE TEMPORARY TABLE temp_min_ids AS
SELECT MIN (id) AS min_id
FROM person
GROUP BY email;
-- 删除不在临时表中记录
DELETE FROM person
WHERE id NOT IN (
    SELECT min_id
    FROM temp_min_ids
);
-- 删除临时表
DROP TEMPORARY TABLE temp_min_ids;
```
方法 2：使用嵌套查询
将子查询嵌套在一个外部查询中，避免直接引用被更新的表。
```sql
DELETE FROM person
WHERE id NOT IN (
    SELECT min_id
    FROM (
        SELECT MIN (id) AS min_id
        FROM person
        GROUP BY email
    ) AS tmp
);
```
方法 3：使用 LEFT JOIN 和 IS NULL
通过 LEFT JOIN 查找需要删除的行，然后删除这些行。
```sql
DELETE p 1
FROM person p 1
LEFT JOIN (
    SELECT MIN (id) AS min_id
    FROM person
    GROUP BY email
) AS p 2
    ON p 1. Id = p 2. Min_id
WHERE p 2. Min_id IS NULL;
```
###### 1. MySQL 的锁定机制

当 MySQL 执行 `DELETE` 或 `UPDATE` 时：

- 它会对目标表（`person`）进行锁定，以确保数据一致性。
- 如果子查询直接引用了被更新的表，MySQL 会认为这是一种潜在的死锁风险，因此抛出错误。
- MySQL 在处理 `DELETE` 或 `UPDATE` 时，不允许子查询直接引用被更新的表（称为 **"target table for update in FROM clause"** 错误）。
![[Pasted image 20250420201607.png|方法二为什么不报错]]
---

1. **`LEFT JOIN` 机制**：`LEFT JOIN` 会先生成一个临时结果集，这个结果集是基于子查询 (`SELECT MIN(id) ...`) 和 `person` 表的连接。
2. **锁定分离**：
    - 子查询 (`SELECT MIN(id) ...`) 会先执行并生成临时结果集。
    - `DELETE` 语句只操作临时结果集和 `person` 表，不会直接引用子查询中 `person` 表。
3. **锁定顺序**：
    - MySQL 先锁定了子查询的结果（临时结果集）。
    - 然后锁定 `person` 表进行删除操作。
![[Pasted image 20250420202132.png]]

##### 197. 上升的温度
(https://leetcode.cn/problems/rising-temperature/)
```sql
select w1.id
from weather w1
left join weather w2
on w1.recordDate = date_add(w2.recordDate,interval 1 day)
where w1.temperature > w2.temperature;

-- 自连接
select a.id from weather a
left join weather b
on a.temperature > b.temperature
where datediff(a.recordDate, b.recordDate) = 1;
```
1. 返回从0000年到现在的天数
```reasonml
to_days("2015-01-04")
```
2. 将时间/日期间隔添加到日期
```applescript
add_date("2015-01-03",INTERVAL 1 day) #2015-01-04
```
3. TIMESTAMPDIFF
```sql
#计算相差天数：
select TIMESTAMPDIFF(DAY,'2019-05-20', '2019-05-21'); # 1

#计算相差小时数：
select TIMESTAMPDIFF(HOUR, '2015-03-22 07:00:00', '2015-03-22 18:00:00'); # 11

#计算相差秒数：
select TIMESTAMPDIFF(SECOND, '2015-03-22 07:00:00', '2015-03-22 7:01:01'); # 61
```
4. 返回值是相差的天数
```bash
DATEDIFF('2007-12-31','2007-12-30');   # 1
DATEDIFF('2010-12-30','2010-12-31');   # -1
```
5. 从日期减去指定的时间间隔
```less
DATE_SUB("2008-12-29",INTERVAL 2 DAY) #2008-12-27
```
6. interval
```applescript
"2015-01-03"+interval'1' day #2015-01-04