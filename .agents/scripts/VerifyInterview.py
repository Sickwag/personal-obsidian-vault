#!/usr/bin/env python3
"""从笔记实际代码块生成临时头文件，再执行模型、故障注入及并发测试。

定位方式有两种：笔记中 `<!-- interview:名称 -->` 标记优先；标记不全时回退到
「设计题」章节内按 RULES 正则匹配。一个名称可以跨多个代码块（如排序被拆成
每算法一块），按文档顺序拼接；同一代码块可用空格分隔挂多个名称。
"""
from pathlib import Path
import argparse,json,os,platform,re,shutil,subprocess,tempfile,hashlib

GROUPS={
 'Basics':['Vector','Stack','Adapters','LinkedList','Heap','Trie','DSU'],
 'Caches':['LRU','LFU'],
 'Sorting':['BasicSorts','QuickSort','MergeSort','HeapSort','DistributionSorts'],
 'Huffman':['Huffman'],'ThreadPool':['ThreadPool'],'Queues':['SPSC','MPMC','QueueModels']
}
# 名称 -> 代码块分组。每个内层列表是一组必须同时出现在同一个代码块里的正则；
# 多个内层列表表示该名称由多个代码块拼成（见 Sorting 组）。
RULES={
 'CommonHeaders':[[r'(?m)^#include <algorithm>']],
 'Vector':[[r'\bclass\s+Vector\b']], 'Stack':[[r'\bclass\s+Stack\b']],
 'Adapters':[[r'\bclass\s+StackAdapter\b',r'\bclass\s+QueueAdapter\b']],
 'LinkedList':[[r'\bstruct\s+ListNode\b',r'\breverseKGroup\s*\(',r'\bremoveNthFromEnd\s*\(']],
 'Heap':[[r'\bclass\s+MaxHeap\b']], 'Trie':[[r'\bclass\s+Trie\b']],
 'DSU':[[r'\bclass\s+DisjointSet\b']],
 'LRU':[[r'\bclass\s+LRUCache\b']], 'LFU':[[r'\bclass\s+LFUCache\b']],
 'BasicSorts':[[r'\bvoid\s+'+name+r'\s*\('] for name in ['bubbleSort','selectionSort','insertionSort','shellSort']],
 'QuickSort':[[r'\bvoid\s+quickSort\s*\(']], 'MergeSort':[[r'\bvoid\s+mergeSort\s*\(']],
 'HeapSort':[[r'\bvoid\s+heapSort\s*\(']],
 'DistributionSorts':[[r'\bvoid\s+'+name+r'\s*\('] for name in ['countingSort','bucketSort','radixSort']],
 'Huffman':[[r'\bclass\s+Huffman\b']], 'ThreadPool':[[r'\bclass\s+ThreadPool\b']],
 'SPSC':[[r'\bclass\s+SpscQueue\b']], 'MPMC':[[r'\bclass\s+MpmcQueue\b']],
 'QueueModels':[[r'\busing\s+MpscQueue\b'],[r'\busing\s+SpmcQueue\b']]
}
MARKER=re.compile(r'^<!-- interview:([A-Za-z]+(?: [A-Za-z]+)*) -->\n(```cpp[ \t]*\n.*?\n```)[ \t]*$',re.S|re.M)
FENCE=re.compile(r'^```cpp[ \t]*\n(.*?)\n```[ \t]*$',re.S|re.M)

def design_section(text):
    start=re.search(r'^## 设计题[ \t]*\n',text,re.M)
    if not start:raise ValueError('缺少设计题章节')
    section=text[start.end():]
    end=re.search(r'^#{1,2} +',section,re.M)
    return section[:end.start()] if end else section

def collect(blocks,names):
    """按规则把代码块配给名称；返回 name -> [块内容, ...]，只含本次需要的名称。"""
    chunks={}
    for name in names:
        picked=[]
        for group in RULES[name]:
            hits=[i for i,block in enumerate(blocks) if all(re.search(pattern,block) for pattern in group)]
            if len(hits)!=1:raise ValueError('代码声明缺少或重复：'+name+' / '+' & '.join(group))
            picked.append(hits[0])
        chunks[name]='\n'.join(blocks[i] for i in sorted(set(picked)))
    return chunks

def extract_by_rules(text,names):
    return collect(FENCE.findall(design_section(text)),names)

def extract_by_markers(text,names):
    found={}
    for match in MARKER.finditer(text):
        block=re.match(r'^```cpp[ \t]*\n(.*?)\n```$',match.group(2),re.S).group(1)
        for name in match.group(1).split():
            if name not in RULES:raise ValueError('未知的标记名称：'+name)
            found.setdefault(name,[]).append(block)
    missing=[name for name in names if name not in found]
    if missing:raise ValueError('标记不完整：'+','.join(missing))
    return {name:'\n'.join(found[name]) for name in names}

def extract_chunks(text):
    names=['CommonHeaders']+[name for group in GROUPS.values() for name in group]
    if not re.search(r'<!-- interview:',text):
        return extract_by_rules(text,names),'rules'
    # 只要出现标记就必须完整有效：不完整或挂错位置一律报错，避免标记失效后静默降级。
    marked=extract_by_markers(text,names)
    try:ruled=extract_by_rules(text,names)
    except ValueError:ruled=None
    if ruled is not None:
        differ=[name for name in names if ruled[name]!=marked[name]]
        if differ:raise ValueError('标记与规则定位不一致：'+','.join(differ))
    return marked,'markers'

def run(command,cwd,timeout=180):
    result=subprocess.run(command,cwd=cwd,text=True,capture_output=True,timeout=timeout)
    if result.returncode:raise RuntimeError(' '.join(map(str,command))+'\n'+result.stdout+result.stderr)
    return result.stdout.strip()

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--note',type=Path);parser.add_argument('--tests',type=Path)
    parser.add_argument('--sanitizer',choices=['none','address','thread'],default='none');parser.add_argument('--report',type=Path)
    args=parser.parse_args();vault=Path(__file__).resolve().parents[2] if len(Path(__file__).resolve().parents)>2 else Path.cwd()
    note=args.note or vault/'Learn/Algorithm/刷题路线.md';tests=args.tests or vault/'.agents/tests';text=note.read_text()
    chunks,locator=extract_chunks(text)
    flags=['-std=c++20','-pthread','-Wall','-Wextra','-Wpedantic','-Werror']
    if args.sanitizer=='address':flags+=['-O1','-g','-fsanitize=address,undefined','-fno-omit-frame-pointer']
    elif args.sanitizer=='thread':flags+=['-O1','-g','-fsanitize=thread','-no-pie']
    else:flags+=['-O2']
    results={}
    with tempfile.TemporaryDirectory(prefix='interview-validation-') as directory:
        root=Path(directory)
        for group,names in GROUPS.items():
            (root/('Interview'+group+'.hpp')).write_text('#pragma once\n'+chunks['CommonHeaders']+'\nnamespace interview {\n'+'\n'.join(chunks[name] for name in names)+'\n}\n')
        cases=['InterviewTest.cpp','InterviewQueueTest.cpp']
        if args.sanitizer!='thread':cases.append('InterviewFaultTest.cpp')
        for name in cases:
            shutil.copy2(tests/name,root/name);binary=root/Path(name).stem
            local_flags=flags+(['-Wno-mismatched-new-delete'] if name=='InterviewFaultTest.cpp' else [])
            run(['g++',*local_flags,name,'-o',str(binary)],root,300)
            command=[str(binary)]
            if args.sanitizer=='thread' and platform.system()=='Linux':command=['setarch',platform.machine(),'-R',str(binary)]
            results[name]=run(command,root,180)
    report={'note':str(note),'note_sha256':hashlib.sha256(note.read_bytes()).hexdigest(),'locator':locator,'sanitizer':args.sanitizer,'code_blocks_sha256':{name:hashlib.sha256(code.encode()).hexdigest() for name,code in chunks.items()},'compiler':run(['g++','--version'],Path.cwd()).splitlines()[0],'tests':results,'passed':True}
    if args.report:args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
