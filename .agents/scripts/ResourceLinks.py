#!/usr/bin/env python3
"""将活动笔记中的本地附件引用改为真实相对路径；默认预览，不下载远程文件。"""
from pathlib import Path
from urllib.parse import unquote, quote, urlsplit
from collections import defaultdict
import argparse, json, os, re

SKIP = {'.git', '.obsidian', '.agents', '.codex', '.aws', '.trash', 'node_modules', 'dist', 'target', 'backups'}
IMAGES = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.avif', '.ico'}

def files_in(root):
    for directory, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP and not Path(directory, d).is_symlink()]
        for name in files:
            p = Path(directory, name)
            if not p.is_symlink() and not re.search(r'(?:backup|\.bak)(?:\.|$)', name, re.I):
                yield p

def code_mask(text):
    """保持字符偏移，遮蔽围栏、缩进代码和行内代码，避免转换语法示例。"""
    masked = list(text); fence = None; offset = 0
    for line in text.splitlines(keepends=True):
        content = re.sub(r'^(?: {0,3}> ?)*', '', line)
        marker = re.match(r'^ {0,3}(`{3,}|~{3,})', content)
        hidden = bool(fence) or bool(marker) or line.startswith(('    ', '\t'))
        if marker:
            token = marker.group(1)
            if fence is None: fence = token
            elif token[0] == fence[0] and len(token) >= len(fence) and not content[marker.end():].strip(): fence = None
        if hidden:
            masked[offset:offset+len(line)] = ['\n' if c=='\n' else ' ' for c in line]
        offset += len(line)
    visible = ''.join(masked)
    for match in re.finditer(r'(`+)(?!`)', visible):
        a = match.start()
        if masked[a] == ' ': continue
        tail=visible[match.end():]
        boundary=re.search(r'\n(?=\s*\n| {0,3}(?:#{1,6}\s|[-+*]\s|\d+[.)]\s|>|`{3,}|~{3,}))',tail)
        if boundary:tail=tail[:boundary.start()]
        close = re.search(r'(?<!`)' + re.escape(match.group(1)) + r'(?!`)', tail)
        if close:
            b = match.end() + close.end()
            masked[a:b] = ['\n' if c=='\n' else ' ' for c in text[a:b]]
    return ''.join(masked)

def markdown_destination(text, start):
    """返回平衡括号链接的目标范围；标题和其他原文不参与改写。"""
    i=start
    if i>=len(text): return None
    if text[i]=='<':
        end=text.find('>',i+1)
        return (i+1,end) if end!=-1 else None
    depth=0
    while i<len(text):
        c=text[i]
        if c=='\\': i+=2;continue
        if c=='(': depth+=1
        elif c==')':
            if not depth: return start,i
            depth-=1
        elif c.isspace() and depth==0: return start,i
        i+=1
    return None

class Converter:
    def __init__(self, root):
        self.root=Path(root).resolve(); self.files=list(files_in(self.root));self.byname=defaultdict(list)
        for p in self.files: self.byname[p.name].append(p)
        self.unresolved=[];self.references=[]

    def resolve(self, note, target):
        raw=unquote(re.sub(r'\\([()_\[\]*!])',r'\1',target)).replace('\\','/')
        if urlsplit(raw).scheme or raw.startswith('//'): return None, '', 'external'
        for candidate in [note.parent/raw, self.root/raw.lstrip('/')]:
            if candidate.is_file() and candidate.resolve().is_relative_to(self.root): return candidate.resolve(),'',None
        exact=self.byname.get(Path(raw).name,[])
        if len(exact)==1:return exact[0],'',None
        path,separator,fragment=raw.partition('#')
        for candidate in [note.parent/path,self.root/path.lstrip('/')]:
            if candidate.is_file() and candidate.resolve().is_relative_to(self.root): return candidate.resolve(),separator+fragment,None
        name=Path(path).name
        candidates=self.byname.get(name,[])
        if not Path(name).suffix:
            candidates=self.byname.get(name+'.md',[]) or candidates
        if len(candidates)==1: return candidates[0],separator+fragment,None
        return None,'','ambiguous' if candidates else 'missing'

    def destination(self,note,target,line):
        p,fragment,error=self.resolve(note,target)
        if error=='external': return None,None
        # 未带扩展名的 Wiki 目标一般是笔记/章节，不当作缺失附件。
        if p is None:
            if Path(unquote(target).split('#')[0]).suffix.lower() not in {'', '.md', '.html', '.htm'}:
                self.unresolved.append({'note':str(note.relative_to(self.root)),'line':line,'target':target,'reason':error})
            return None,None
        if p.suffix.lower()=='.md':return None,p
        relative=os.path.relpath(p,note.parent).replace(os.sep,'/')
        # 兼容 Obsidian 本地路径解析：保留 & 字面量，空格等仍编码。
        dest=quote(relative,safe='/._~-&')+fragment
        self.references.append({'note':str(note.relative_to(self.root)),'target':str(p.relative_to(self.root)),'destination':dest})
        return dest,p

    def convert(self,note,text):
        visible=code_mask(text);edits=[];covered=[]
        for m in re.finditer(r'(!?)\[\[([^\]\n]+)\]\]',visible):
            if m.start()>0 and text[m.start()-1]=='\\':continue
            body=text[m.start(2):m.end(2)];target,_,alias=body.partition('|')
            dest,p=self.destination(note,target,text.count('\n',0,m.start())+1)
            if dest is None:continue
            alt=alias or Path(unquote(target)).stem
            alt=alt.replace('\\|','|').replace('[','\\[').replace(']','\\]')
            prefix='!' if m.group(1) and p.suffix.lower() in IMAGES else ''
            edits.append((m.start(),m.end(),f'{prefix}[{alt}]({dest})'));covered.append((m.start(),m.end()))
        # 内嵌图片和普通附件 Markdown 链接；保留标题和原本的标签。
        for m in re.finditer(r'!?\[(?:\\.|[^\]\\\n])*\]\(',visible):
            if any(a<=m.start()<b for a,b in covered):continue
            span=markdown_destination(text,m.end())
            if not span:continue
            a,b=span;target=text[a:b]
            dest,p=self.destination(note,target,text.count('\n',0,m.start())+1)
            if dest is not None:edits.append((a,b,dest))
        for a,b,value in sorted(edits,reverse=True):text=text[:a]+value+text[b:]
        return text

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--vault',type=Path,default=Path.cwd());parser.add_argument('--write',action='store_true');parser.add_argument('--report',type=Path)
    args=parser.parse_args();c=Converter(args.vault);changed=[]
    for p in c.files:
        if p.suffix.lower()!='.md':continue
        raw=p.read_bytes();text=raw.decode('utf-8');new=c.convert(p,text)
        if new!=text:
            changed.append(str(p.relative_to(c.root)))
            if args.write:p.write_bytes(new.encode('utf-8'))
    report={'mode':'write' if args.write else 'preview','changed_files':changed,'resolved_references':len(c.references),'unresolved':c.unresolved}
    if args.report:
        args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'changed_files':len(changed),'resolved_references':len(c.references),'unresolved':len(c.unresolved),'report':str(args.report)},ensure_ascii=False))

if __name__=='__main__':main()
