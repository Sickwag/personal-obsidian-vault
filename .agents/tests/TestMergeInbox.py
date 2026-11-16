import importlib.util,json,sys,tempfile,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('inbox',str(Path(__file__).resolve().parents[1]/'skills/learning-resource-merge/scripts/MergeInbox.py'));m=importlib.util.module_from_spec(spec);sys.modules[spec.name]=m;spec.loader.exec_module(m)
class InboxTest(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name);self.p=self.root/'Learn/Fragments/ReadyToMerge.md';self.p.parent.mkdir(parents=True)
  self.p.write_text('# 待整理\n## 2026-11-16\n整理状态：待整理\n- [ ] https://example.org/a\n- [ ] https://example.org/b\n')
  self.target=self.root/'Learn/Note.md';self.target.write_text('# 主题\n## 章节\n知识\n')
 def tearDown(self):self.tmp.cleanup()
 def report(self,item,decision='merged'):
  return {'item_id':item['id'],'coverage':[{'topic':'机制','decision':decision,'target':'Learn/Note.md#章节','reason':'核实来源'}],'attachments':[]}
 def test_partial_resume_and_later_append(self):
  items=m.pending(self.p);m.complete(self.root,self.p,self.report(items[0]));self.assertEqual(len(m.pending(self.p)),1);self.assertIn('待整理',self.p.read_text())
  m.complete(self.root,self.p,self.report(m.pending(self.p)[0]));self.assertFalse(m.pending(self.p));self.assertIn('已完成整理',self.p.read_text())
  self.p.write_text(self.p.read_text()+'- https://example.org/new\n');self.assertEqual(len(m.pending(self.p)),1)
 def test_invalid_target_and_deferred_leave_pending(self):
  item=m.pending(self.p)[0];report=self.report(item);report['coverage'][0]['target']='Learn/Note.md#不存在'
  with self.assertRaises(ValueError):m.complete(self.root,self.p,report)
  with self.assertRaises(ValueError):m.complete(self.root,self.p,self.report(item,'deferred'))
  self.assertEqual(len(m.pending(self.p)),2)
 def test_changed_entry_reopens(self):
  item=m.pending(self.p)[0];m.complete(self.root,self.p,self.report(item));self.p.write_text(self.p.read_text().replace('/a','/changed'));self.assertEqual(len(m.pending(self.p)),2)
 def test_idempotent_receipt_and_date_validation(self):
  item=m.pending(self.p)[0];report=self.report(item);m.complete(self.root,self.p,report);before=self.p.read_text();m.complete(self.root,self.p,report);self.assertEqual(self.p.read_text(),before)
  self.p.write_text('## 2026-02-30\n- https://example.org/a\n')
  with self.assertRaises(ValueError):m.pending(self.p)
if __name__=='__main__':unittest.main()
