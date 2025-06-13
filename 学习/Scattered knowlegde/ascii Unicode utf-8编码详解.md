参考视频教程：[ASCII、Unicode和UTF-8编码详解，一次彻底弄明白！简单易懂_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV14Ns8eEERu/?spm_id_from=333.1007.tianma.1-1-1.click&vd_source=876be08bc9c030f4a9ea1fb97e0d0342)
最原始的字符和数字进行映射的方案是 ascii 
![Pasted image 20240929174428.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240929174428.png)
ascii 真正编码位只有 7 个，最前一位固定是 0

## Unicode 编码
![Pasted image 20240929180207.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240929180207.png)
所有的支持的字符都有一个唯一的编码
最小的，有意义的书写符号到位叫做**字素**
![Pasted image 20240929181350.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240929181350.png)
编码规则用来解决二进制编码读取过程中的混乱问题
![同一个二进制编码，可以解析出不同的结果](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240929181513.png)
- UTF-32 和 ascii 一样是定长编码，无论什么字符都会占用 4 个字节（而不是 ascii 的 1 个），空间浪费较为严重
- utf-8 是一种**变长**（意为改变长度）的编码，不同的字符规定不同的字节大小（英文仍用 1 个字节，完全适配 ascii，中文三个，其他较为复杂的最多 4 个）
![Pasted image 20240929181940.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240929181940.png)
![Pasted image 20240929182223.png](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240929182223.png)
将一个  Unicode 编码转换为 utf-8 编码方式是将 Unicode 代码点转换为二进制，然后根据 utf-8 的编码固定格式**从后向前**填充，未满的位置用 0 填充，解码则逆向即可
![recording 18.gif](../../Files%20&%20LongText/Attachments/recording%2018.gif)
1. 数据的解码和编码，需要使用同一种编码 (GBK、UTF-8)
否则会发生乱码
2. Unicode 编码中：1 字素 1 代码点 1 字节
- 字符串只包含 ASCII 编码的字符，可以直接处理
- 字符串包含中文、表情包等，需要按照 Unicode 字符串来处理，不同编程语言可能不同（Python、Golang）
- 如果想要更准确的处理字符串，比如字符串中
包含这种字符：![75](../../Files%20&%20LongText/Attachments/Pasted%20image%2020240929183111.png)，需要使用 grapheme 函数