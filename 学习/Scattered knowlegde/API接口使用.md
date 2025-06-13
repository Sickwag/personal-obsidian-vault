以[小小api](https://xxapi.cn/) 为例
只要使用“请求示例”中的代码在对应的语言环境下运行，就会得到接口返回的信息
如示例代码为：
```Python
import requests

url = "https://v2.xxapi.cn/api/heisi"
payload = {}
headers = {
'User-Agent': 'xiaoxiaoapi/1.0.0 (https://xxapi.cn)'
}
response = requests.request("GET", url, headers = headers, data = payload)
print(response.text)
```
那么根据返回示例：
```Python
{
	"code": 200,
	"msg": "数据请求成功",
	"data": "https://cdn.api-m.com/images/heisi/ZEaa0QkpkhlL8BWfavVJN78X.jpg"
}
```
最终 response 这个对象就是一个 dict（或者说 json），使用 Python 解析出 data 就会得到图片的地址，使用图片查看器打开即可
```Python
import requests
import os
import webbrowser  # 用于调用默认程序打开图片

# 1. 调用API获取图片URL
url = "https://v2.xxapi.cn/api/heisi"
response = requests.get(url)
result = response.json()

if result["code"] == 200:
    image_url = result["data"]  # 提取图片URL
    print("图片地址:", image_url)

    # 2. 下载图片到本地临时文件
    image_data = requests.get(image_url).content
    temp_path = os.path.join(
        os.environ["TEMP"], "xxapi_image.jpg"
    )  # 保存在系统临时目录
    with open(temp_path, "wb") as f:
        f.write(image_data)

    # 3. 用Windows图片查看器打开
    webbrowser.open(temp_path)  # 调用默认程序打开
else:
    print("API请求失败:", result["msg"])
```
说明文档中

| 参数名    | 传递参数 | 传入位置  | 类型  | 参数说明   |
| ------ | ---- | ----- | --- | ------ |
| return | 302  | query | 可选  | 重定向到图片 |
表示在 url 的 query 位置（拼接在 URL 的 "?“字符之后的字段）如果填入
```url
?return(参数名)=302(参数值)
```
就会得到对应的结果，比如填入 302 表示"重定向到图片"，那么就不用手动解析 json，直接得到图片源文件（由浏览器或网络服务工具解析）
如果接口允许调试，多半是调试各种参数，这些参数填入 url 的对应位置会有不同结果
```plain
https://example.com/path/to/api?key1=value1&key2=value2
\___/   \________/\________/ \________________________/
  |          |         |                 |
协议         域名      路径               查询
```
- **`?` 是查询参数的起始符号**，之后的所有内容均为 `query` 参数。
- **`&` 分隔参数**：多个参数用 `&` 连接（如 `?param1=A&param2=B`）。
- **浏览器/客户端的隐含规则**：所有通过URL传递的参数，必须遵循 `?` 开头、`&` 分隔的格式，否则会被视为路径的一部分。

| 参数值                 | 作用                         | 返回示例                          | 适用场景                |
| ------------------- | -------------------------- | ----------------------------- | ------------------- |
| **不传** 或 `空`        | 返回JSON格式数据                 | `{"code":200,"data":"图片URL"}` | 需要解析URL后再处理（如前端展示）  |
| `302`               | **强制跳转**到图片直链（HTTP 302重定向） | **直接显示图片**（不会返回JSON）          | 需要快速查看图片（如浏览器地址栏调用） |
| `json` (或任意非"302"值) | 等价于"不传"，返回JSON             | 同默认行为                         | 无特殊需求时用默认即可         |
