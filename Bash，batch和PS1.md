# Batch
`echo off` 表示关闭回显，`echo off`和`@echo off`的区别？echo off是执行时不显示此语句后的所有命令行，但还会显示echo off；@echo off是执行时不显示本行（echo off）及后面的所有命令行；
`echo=` 输出一个空行
`echo words` 输出内容
pause 关键字让程序暂停，***cmd 窗口提示“按任意键继续“***
`md` 在bat脚本中是创建文件夹的命令
也可以创建多层级目录的文件夹，md D:\Hello\xixi\testreport，若是testreport已经存在，会给出提示；如xixi目录已经存在，则直接使用
ren可以用来重命名名字也可以重命名文件；
```batch
ren 完整路径文件名（文件夹名） 新文件名（新文件夹名）
```
查看命令有哪些参数，使用[命令/?]，如，del/?,dir/?；若是不想在dos中再次确认（Y/N），可以加上/q参数
move 用来移动文件夹或者文件； move 原A 终B；会将‘原A’下的所有子目录或子文件，移动到‘终B’中；
若是‘原A’不存在，则会报错；若是‘终B’不存在，会直接将‘原A’改为‘终B’；
`copy a b` 把 A 拷贝到 B 位置
`rd` remove directory
del