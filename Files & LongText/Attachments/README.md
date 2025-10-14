1. download_qt_example.py - 这是第一个版本，使用 requests 库
2. download_qt_example_full.py - 这是使用 BeautifulSoup 来解析页面的更完整版本
3. download_qt_example_simple.py - 这是简化版本，基于我们之前成功的方法
4. download_qt_example.bat - 这是 Windows 批处理版本
使用说明 
```python
python download_qt_example_simple.py "https://code.qt.io/cgit/qt/qtbase.git/tree/examples/sql/books?h=6.10" books_project

# python .py 地址链接 名称（不填默认用网页标题）
```
地址页要是这样的
![[Pasted image 20251013195329.png]]