import importlib.util,sys,tempfile,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('ResourceLinks',str(Path(__file__).resolve().parents[1]/'scripts/ResourceLinks.py'))
m=importlib.util.module_from_spec(spec);sys.modules[spec.name]=m;spec.loader.exec_module(m)
class Links(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
  for name in ['Files & LongText/Attachments/image (1).png','Files & LongText/Attachments/a#b.png','Files & LongText/Attachments/clip.mp4','Learn/Other.md']:
   p=self.root/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b'x')
  self.note=self.root/'Learn/Sub/Note.md';self.note.parent.mkdir(parents=True)
  self.converter=m.Converter(self.root)
 def tearDown(self):self.tmp.cleanup()
 def convert(self,s):return self.converter.convert(self.note,s)
 def test_wiki_alias_size_and_movie(self):
  result=self.convert('![[image (1).png|350]] [[clip.mp4|演示]] ![[Other#标题]]')
  self.assertEqual(result,'![350](../../Files%20%26%20LongText/Attachments/image%20%281%29.png) [演示](../../Files%20%26%20LongText/Attachments/clip.mp4) ![[Other#标题]]')
  self.assertEqual(self.convert(result),result)
 def test_markdown_balanced_and_title(self):
  s='![图](image%20(1).png "caption")'
  self.assertEqual(self.convert(s),'![图](../../Files%20%26%20LongText/Attachments/image%20%281%29.png "caption")')
 def test_code_and_remote_unchanged(self):
  s='`![[image (1).png]]`\n```md\n![[image (1).png]]\n```\n![x](https://example.org/a.png)'
  self.assertEqual(self.convert(s),s)
 def test_missing_and_hash_filename(self):
  s='![[missing.png]] ![[a#b.png]]'
  self.assertTrue(self.convert(s).endswith('/a%23b.png)'))
  self.assertEqual(len(self.converter.unresolved),1)
 def test_ambiguous_never_guesses(self):
  p=self.root/'Other/image (1).png';p.parent.mkdir();p.write_bytes(b'x')
  c=m.Converter(self.root);self.assertEqual(c.convert(self.note,'![[image (1).png]]'),'![[image (1).png]]')
  self.assertEqual(c.unresolved[0]['reason'],'ambiguous')
if __name__=='__main__':unittest.main()
