#!/usr/bin/env python3
"""从笔记实际代码块生成临时头文件，再执行模型、故障注入及并发测试。"""
from pathlib import Path
import argparse,json,os,platform,re,shutil,subprocess,tempfile,hashlib

GROUPS={
 'Basics':['Vector','Stack','Adapters','LinkedList','Heap','Trie','DSU'],
 'Caches':['LRU','LFU'],
 'Sorting':['BasicSorts','QuickSort','MergeSort','HeapSort','DistributionSorts'],
 'Huffman':['Huffman'],'ThreadPool':['ThreadPool'],'Queues':['SPSC','MPMC','QueueModels']
}
RULES={
 'CommonHeaders':[r'(?m)^#include <algorithm>'],
 'Vector':[r'\bclass\s+Vector\b'], 'Stack':[r'\bclass\s+Stack\b'],
 'Adapters':[r'\bclass\s+StackAdapter\b',r'\bclass\s+QueueAdapter\b'],
 'LinkedList':[r'\bstruct\s+ListNode\b',r'\breverseKGroup\s*\(',r'\bremoveNthFromEnd\s*\('],
 'Heap':[r'\bclass\s+MaxHeap\b'], 'Trie':[r'\bclass\s+Trie\b'],
 'DSU':[r'\bclass\s+DisjointSet\b'],
 'LRU':[r'\bclass\s+LRUCache\b'], 'LFU':[r'\bclass\s+LFUCache\b'],
 'BasicSorts':[r'\bvoid\s+'+name+r'\s*\(' for name in ['bubbleSort','selectionSort','insertionSort','shellSort']],
 'QuickSort':[r'\bvoid\s+quickSort\s*\('], 'MergeSort':[r'\bvoid\s+mergeSort\s*\('],
 'HeapSort':[r'\bvoid\s+heapSort\s*\('],
 'DistributionSorts':[r'\bvoid\s+'+name+r'\s*\(' for name in ['countingSort','bucketSort','radixSort']],
 'Huffman':[r'\bclass\s+Huffman\b'], 'ThreadPool':[r'\bclass\s+ThreadPool\b'],
 'SPSC':[r'\bclass\s+SpscQueue\b'], 'MPMC':[r'\bclass\s+MpmcQueue\b'],
 'QueueModels':[r'\busing\s+MpscQueue\b',r'\busing\s+SpmcQueue\b']
}
def extract_chunks(text):
    required=['CommonHeaders']+[name for group in GROUPS.values() for name in group]
    tagged=dict(re.findall(r'<!-- interview:(\w+) -->\n```cpp\n(.*?)\n```',text,re.S))
    if all(name in tagged for name in required):
        if len(re.findall(r'<!-- interview:',text))!=len(tagged):raise ValueError('重复或无效的代码块标记')
        return tagged
    start=re.search(r'^## 设计题[ \t]*\n',text,re.M)
    if not start:raise ValueError('缺少设计题章节')
    section=text[start.end():]
    end=re.search(r'^#{1,2} +',section,re.M)
    if end:section=section[:end.start()]
    blocks=re.findall(r'^```cpp[ \t]*\n(.*?)\n```[ \t]*$',section,re.S|re.M)
    chunks={}
    for name in required:
        patterns=RULES[name]
        for pattern in patterns:
            matches=[block for block in blocks if re.search(pattern,block)]
            if len(matches)!=1:raise ValueError('代码声明缺少或重复：'+name+' / '+pattern)
        chunks[name]='\n'.join(block for block in blocks if any(re.search(pattern,block) for pattern in patterns))
    return chunks

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
    chunks=extract_chunks(text)
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
    report={'note':str(note),'note_sha256':hashlib.sha256(note.read_bytes()).hexdigest(),'sanitizer':args.sanitizer,'code_blocks_sha256':{name:hashlib.sha256(code.encode()).hexdigest() for name,code in chunks.items()},'compiler':run(['g++','--version'],Path.cwd()).splitlines()[0],'tests':results,'passed':True}
    if args.report:args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
