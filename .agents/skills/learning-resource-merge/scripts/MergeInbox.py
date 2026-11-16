#!/usr/bin/env python3
"""列出按天收集的学习资源；校验覆盖报告后逐项登记，不修改知识正文或 FSRS 事实。"""
from pathlib import Path
from datetime import date, datetime, timezone
import argparse, hashlib, json, re, os, tempfile

def digest(value):return hashlib.sha256(value.encode()).hexdigest()
def atomic(path, content):
    path.parent.mkdir(parents=True,exist_ok=True)
    fd,name=tempfile.mkstemp(dir=path.parent,prefix=path.name+'.',suffix='.tmp')
    try:
        with os.fdopen(fd,'w',encoding='utf-8',newline='') as f:f.write(content);f.flush();os.fsync(f.fileno())
        os.replace(name,path)
    finally:
        if os.path.exists(name):os.unlink(name)

def entries(path):
    text=path.read_text();day=None;fence=None;items=[]
    for i,line in enumerate(text.splitlines()):
        marker=re.match(r'^\s*(`{3,}|~{3,})',line)
        if marker:
            token=marker.group(1)
            if fence is None:fence=token
            elif token[0]==fence[0] and len(token)>=len(fence) and not line[marker.end():].strip():fence=None
            continue
        if fence:continue
        head=re.match(r'^##\s+(\d{4}-\d{2}-\d{2})(?:\s.*)?$',line)
        if head:day=date.fromisoformat(head.group(1)).isoformat();continue
        if line.startswith('## '):day=None
        if not day:continue
        match=re.match(r'^\s*[-*]\s+(?:\[[ xX]\]\s+)?(.+?)\s*$',line)
        if not match:continue
        body=match.group(1);source=re.sub(r'\s*<!-- merged:[a-f0-9]{64} -->.*$','',body).strip()
        if not source or not re.search(r'https?://|\[\[|\]\(|(?:^|\s)[~/]|\.(?:md|pdf|txt|html|docx|mp4|json)(?:$|[ >])',source):continue
        key=digest(day+'\n'+source)
        items.append({'id':key,'date':day,'source':source,'line':i,'done':f'<!-- merged:{key} -->' in body})
    ids=[x['id'] for x in items]
    if len(set(ids))!=len(ids):raise ValueError('同一天出现完全相同资源；先合并重复引用，避免状态歧义')
    return items

def pending(path):return [x for x in entries(path) if not x['done']]

def target_file(root, target):
    name,_,heading=target.partition('#');p=root/name
    if not p.is_file() or p.is_symlink() or not p.resolve().is_relative_to(root.resolve()):raise ValueError('目标文件不存在或越界：'+target)
    if heading:
        found=False;fence=None
        for line in p.read_text().splitlines():
            marker=re.match(r'^\s*(`{3,}|~{3,})',line)
            if marker:
                token=marker.group(1)
                if fence is None:fence=token
                elif token[0]==fence[0] and len(token)>=len(fence) and not line[marker.end():].strip():fence=None
                continue
            if not fence:
                m=re.match(r'^#{1,6}\s+(.+?)\s*#*\s*$',line)
                if m and m.group(1)==heading:found=True
        if not found:raise ValueError('目标章节不存在：'+target)
    return p

def complete(root,path,report):
    root=Path(root).resolve();path=Path(path)
    original=path.read_text();item=next((x for x in entries(path) if x['id']==report.get('item_id')),None)
    if item is None:raise ValueError('资源不存在或已变化，请重新 list')
    coverage=report.get('coverage')
    if not isinstance(coverage,list) or not coverage:raise ValueError('必须逐项列出知识点覆盖结果')
    targets=[];hashes={}
    for point in coverage:
        if not point.get('topic') or point.get('decision') not in {'merged','existing','rejected'}:raise ValueError('暂缓或未处理知识点不能标记完成')
        if point['decision']=='rejected':
            if not point.get('reason'):raise ValueError('排除知识点必须说明依据')
        else:
            target=point.get('target','');p=target_file(root,target);targets.append(target);hashes[str(p.relative_to(root))]=hashlib.sha256(p.read_bytes()).hexdigest()
    for attachment in report.get('attachments',[]):
        p=target_file(root,attachment['path'])
        if not p.resolve().is_relative_to((root/'Files & LongText/Attachments').resolve()):raise ValueError('附件须位于统一附件目录')
        if hashlib.sha256(p.read_bytes()).hexdigest()!=attachment['sha256']:raise ValueError('附件哈希不匹配')
    receipt_path=root/'.agents/merge/Receipts'/ (item['id']+'.json')
    receipt={**report,'source':item['source'],'date':item['date'],'target_hashes':hashes,'completed_at':datetime.now(timezone.utc).isoformat()}
    if item['done']:
        if not receipt_path.exists():raise ValueError('完成标记缺少收据，须核查后重新整理')
        return
    lines=original.splitlines(keepends=True);line=lines[item['line']];newline='\r\n' if line.endswith('\r\n') else '\n'
    links='；'.join('[['+t+']]' for t in dict.fromkeys(targets)) or '已核实并说明排除原因'
    lines[item['line']]='- [x] '+item['source']+' <!-- merged:'+item['id']+' --> → '+links+newline
    # 先落收据，再更改来源状态；中断后同一条目可重复完成。
    atomic(receipt_path,json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
    changed=''.join(lines)
    if path.read_text()!=original:raise ValueError('收件文件已被修改，请重新 list；未更新其完成状态')
    atomic(path,changed)
    all_items=entries(path);done=all(x['done'] for x in all_items if x['date']==item['date'])
    if done:
        current=path.read_text();pattern=r'(?m)(^##\s+'+re.escape(item['date'])+r'[^\n]*\n)([\s\S]*?)(?=^##\s|\Z)'
        def mark(m):
            body=m.group(2)
            if re.search(r'(?m)^整理状态：.*$',body):body=re.sub(r'(?m)^整理状态：.*$','整理状态：已完成整理',body)
            else:body='整理状态：已完成整理\n'+body
            return m.group(1)+body
        atomic(path,re.sub(pattern,mark,current))

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--vault',type=Path,default=Path.cwd());parser.add_argument('--inbox',default='Learn/Fragments/ReadyToMerge.md')
    sub=parser.add_subparsers(dest='command',required=True);sub.add_parser('list');c=sub.add_parser('complete');c.add_argument('--report',type=Path,required=True)
    args=parser.parse_args();root=args.vault.resolve();path=root/args.inbox
    if not path.resolve().is_relative_to(root) or path.is_symlink():raise ValueError('收件文件越界')
    if args.command=='list':print(json.dumps(pending(path),ensure_ascii=False,indent=2))
    else:complete(root,path,json.loads(args.report.read_text()));print(json.dumps({'remaining':len(pending(path))}))
if __name__=='__main__':main()
