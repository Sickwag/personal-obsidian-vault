- 常见问题
    
    - base64编码相较于ansc编码有什么优点？
    - 在传输中使用到base64编码相较于ANSC码还需要多转码，解码，编码的步骤。为什么不能直接使用兼容性更好，内容也更多的ANSC码？
    - ansc码转base64过程中末尾补齐的0为什么不会影响到解码后的内容？
    - 如何知道ansc码转base64过程中末尾补齐了多少个0？
    - 如果我想进一步了解base64编码的原理和更多知识，我应该去看那些文章或者书籍？
    
    解答
    
    [Base64编码相较于ANSI编码的优点主要体现在以下几个方面](https://www.zhihu.com/question/36306744)[1](https://www.zhihu.com/question/36306744)[2](https://zhuanlan.zhihu.com/p/384238870)[3](https://zhuanlan.zhihu.com/p/371596658)：
    
    1. **兼容性**：Base64编码后的字符串只包含ASCII基础字符，这些字符在大多数机器和软件上的行为是一样的，因此具有良好的兼容性。
    2. [**避免特殊字符处理**](https://www.zhihu.com/question/36306744)[：某些协议会对二进制流中的特定字符进行特殊处理（比如ASCII的0~32编码的字符在某些传输介质中，是会被当作特殊含义处理的），这种时候就需要通过编码来避开这些特定字符](https://www.zhihu.com/question/36306744)[1](https://www.zhihu.com/question/36306744)。
    
    [在传输中使用Base64编码相较于ANSI码的原因主要是因为某些场合并不能传输或者储存二进制流。比如，如果一个传输协议是基于ASCII文本的，那么它就不能传输二进制流，那你要将二进制流传输就得编码。常见的诸如HTTP协议的URL就是纯文本的，不能直接放二进制流](https://www.zhihu.com/question/36306744)[1](https://www.zhihu.com/question/36306744)。
    
    [在ANSI码转Base64过程中，末尾补齐的0不会影响到解码后的内容，这是因为Base64编码过程是3个字符一组的进行，如果原文长度不是3的倍数，后面的位都会用0来补充。在解码时，这些补充的0会被忽略，因此不会影响到解码后的内容](https://zhuanlan.zhihu.com/p/384238870)[2](https://zhuanlan.zhihu.com/p/384238870)。
    
    [关于如何知道ANSI码转Base64过程中末尾补齐了多少个0，这可以通过观察Base64编码后的字符串来判断。如果Base64编码后的字符串末尾有一个"=“，那么说明在编码过程中补充了两个0；如果有两个”="，那么说明补充了四个0](https://zhuanlan.zhihu.com/p/384238870)[2](https://zhuanlan.zhihu.com/p/384238870)。
    
    如果你想进一步了解Base64编码的原理和更多知识，你可以参考以下资源：
    
    1. [让你彻底理解Base64算法（Base64是什么，Base64解决什么问题，Base64字符串末尾的=是什么）](https://zhuanlan.zhihu.com/p/384238870)
    2. [为什么要使用base64编码，有哪些情景需求？](https://www.zhihu.com/question/36306744)
    3. [为什么要做base64编码](https://zhuanlan.zhihu.com/p/371596658)
    4. [Base64 编码/解码 | 菜鸟工具](https://c.runoob.com/front-end/693/)
    
    这些资源都提供了详细的Base64编码的介绍和应用场景，可以帮助你更深入地理解Base64编码。
    
    [【Base64编码简述-哔哩哔哩】](https://b23.tv/ntmLon7)