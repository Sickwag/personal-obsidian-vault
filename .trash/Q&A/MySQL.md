# 问题
## 如何调整分组查找中谁是大小分类？
![400](../Attachments/Pasted%20image%2020240819225202.png)
转换为
![Pasted image 20240819225715.png](../Attachments/Pasted%20image%2020240819225715.png)

## 增删不会改变结果的代码结果顺序发生改变
![recording 16.gif](../Attachments/recording%2016.gif)
## like 忽略副表中为 NULL 的记录
![recording 17.gif](../Attachments/recording%2017.gif)
```sql
SELECT
	e.*,
	d.department_name
FROM
	departments d
LEFT OUTER JOIN employees e ON
	e.department_id = d.department_id
WHERE
	d.department_name LIKE 'IT'
	OR d.department_name LIKE 'SAL';
-- 	d.department_name IN('SAL','IT');
```
## 为什么标红
```sql
#8．查询平均工资最高的部门的 manager 的详细信息：
-- last_name，department_id， email， salary

-- 平均工资最高的部门编号 90
SELECT department_id FROM employees e GROUP BY department_id ORDER BY avg(salary) DESC LIMIT 1;

-- 在90号部门里查询所有人全部信息
SELECT
	*
FROM
	employees e
WHERE
	e.department_id = (
	SELECT
		department_id
	FROM
		employees e
	GROUP BY
		department_id
	ORDER BY
		avg(salary) DESC
	LIMIT 1);

-- 所有人中有谁的employee_id = department表中的manager_id
SELECT *
FROM
	departments d
INNER JOIN (
	SELECT
		*
	FROM
		employees e
	WHERE
		e.department_id = (
		SELECT
			department_id
		FROM
			employees e
		GROUP BY
			department_id
		ORDER BY
			avg(salary) DESC
		LIMIT 1)) AS num ON num.employee_id = d.manager_id ;
```
![Pasted image 20240824214006.png](../Attachments/Pasted%20image%2020240824214006.png)
```sql
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
```
![475](../Attachments/Pasted%20image%2020240825092241.png)