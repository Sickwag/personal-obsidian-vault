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
    chunks=dict(re.findall(r'<!-- interview:(\w+) -->\n```cpp\n(.*?)\n```',text,re.S))
    required=['CommonHeaders']+[name for group in GROUPS.values() for name in group]
    if any(name not in chunks for name in required):raise ValueError('缺少可验证代码块：'+str(set(required)-chunks.keys()))
    if len(re.findall(r'<!-- interview:',text))!=len(chunks):raise ValueError('重复或无效的代码块标记')
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
    report={'note':str(note),'note_sha256':hashlib.sha256(note.read_bytes()).hexdigest(),'sanitizer':args.sanitizer,'compiler':run(['g++','--version'],Path.cwd()).splitlines()[0],'tests':results,'passed':True}
    if args.report:args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
