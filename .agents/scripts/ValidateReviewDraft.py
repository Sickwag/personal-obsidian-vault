#!/usr/bin/env python3
"""只读核对复习草稿的 Git 范围、章节哈希与引用；不更新索引或 FSRS 状态。"""
from pathlib import Path
import argparse
import hashlib
import json
import re
import subprocess


def git(vault, *arguments):
    return subprocess.check_output(
        ['git', *arguments], cwd=vault, timeout=30
    ).decode('utf-8')


def sha256(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def sections(markdown):
    """遵循当前 FSRS Sections.ts 的换行、围栏和标题身份规则。"""
    lines = markdown.replace('\r\n', '\n').split('\n')
    headings, stack, seen = [], [], {}
    fence = ''
    frontmatter = lines[0] == '---'
    for index, line in enumerate(lines):
        if frontmatter:
            if index and re.match(r'^(---|\.\.\.)\s*$', line):
                frontmatter = False
            continue
        marker = re.match(r'^ {0,3}(`{3,}|~{3,})', line)
        if marker:
            token = marker[1]
            if not fence:
                fence = token
            elif (token[0] == fence[0] and len(token) >= len(fence)
                  and re.match(r'^ {0,3}' + re.escape(fence[0]) + r'{3,}\s*$', line)):
                fence = ''
            continue
        if fence:
            continue
        match = re.match(r'^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$', line)
        if not match:
            continue
        level, title = len(match[1]), match[2].strip()
        while stack and stack[-1][0] >= level:
            stack.pop()
        stack.append((level, title))
        name = ' › '.join(item[1] for item in stack)
        seen[name] = seen.get(name, 0) + 1
        key = name + (f' [{seen[name]}]' if seen[name] > 1 else '')
        headings.append((index, key, title))
    if not headings or headings[0][0] > 0:
        headings.insert(0, (0, '@preamble', '正文'))
    result = {}
    for index, (start, key, title) in enumerate(headings):
        end = headings[index + 1][0] if index + 1 < len(headings) else len(lines)
        text = '\n'.join(lines[start:end])
        if text.strip():
            result[key] = {'hash': sha256(text), 'heading': title}
    return result


def validate(vault, directory):
    evidence = json.loads((directory / 'Evidence.json').read_text())
    draft = json.loads((directory / 'Draft.json').read_text())
    assert evidence['status'] == draft['status'] == 'awaiting_user_review'
    assert draft['published'] is False
    assert git(vault, 'ls-files', '--unmerged') == '', '存在未解决合并冲突'
    snapshot = evidence['snapshot_head']
    assert re.fullmatch(r'[a-f0-9]{40}|[a-f0-9]{64}', snapshot)
    subprocess.run(['git', 'merge-base', '--is-ancestor', snapshot, 'HEAD'],
                   cwd=vault, check=True, timeout=30)
    actual_commits = git(vault, 'rev-list', '--first-parent', '--reverse',
                         '--since-as-filter=' + evidence['window_start'],
                         '--until=' + evidence['window_end'], snapshot).splitlines()
    assert actual_commits == [item['commit'] for item in evidence['commits']]
    source_map = {}
    for source in evidence['sources']:
        relative = Path(source['path'])
        assert not relative.is_absolute() and not {'.', '..'} & set(relative.parts)
        assert (source['path'].startswith('Learn/')
                or source['path'].startswith('Chores/JobInterviews/'))
        assert relative.suffix == '.md'
        target = vault / relative
        assert target.is_file() and not target.is_symlink()
        assert target.resolve().is_relative_to(vault.resolve())
        frozen = git(vault, 'show', snapshot + ':' + source['path'])
        assert sections(frozen)[source['section']]['hash'] == source['hash']
        assert sections(target.read_text())[source['section']]['hash'] == source['hash'], (
            '当前来源已变化：' + source['path'] + '#' + source['heading'])
        assert source['id'] == sha256(source['path'] + '\0' + source['section']
                                      + '\0' + source['hash'])
        assert source['changed_commit'] in actual_commits
        patch = git(vault, 'diff', '--unified=0', source['changed_commit'] + '^',
                    source['changed_commit'], '--', source['path'])
        assert source['changed_hunks'] and all(hunk in patch for hunk in source['changed_hunks'])
        assert source['id'] not in source_map
        source_map[source['id']] = source
    question_ids, covered = set(), set()
    allowed_kinds = {'causality', 'diagnosis', 'trace', 'tradeoff', 'counterexample', 'application'}
    for question in draft['questions']:
        assert question['id'] not in question_ids
        question_ids.add(question['id'])
        assert question['kind'] in allowed_kinds
        assert len(question['rubric']) >= 2 and all(question['rubric'])
        assert question['source_ids'] and set(question['source_ids']) <= source_map.keys()
        assert not {'rating', 'due_at', 'memory_state', 'due'} & question.keys()
        assert all(question[field] for field in ('question', 'scenario', 'objective', 'why'))
        covered.update(question['source_ids'])
    assert covered == source_map.keys()
    links = 0
    for note in directory.glob('*.md'):
        for match in re.finditer(r'\[\[([^\]\n]+)\]\]', note.read_text()):
            body = match[1].split('|', 1)[0]
            target_name, separator, heading = body.partition('#')
            if not target_name:
                target = note
            elif '/' not in target_name:
                target = directory / (target_name if target_name.endswith('.md') else target_name + '.md')
            else:
                target = vault / (target_name if target_name.endswith('.md') else target_name + '.md')
            assert target.is_file(), (note.name, body)
            if separator and heading:
                assert heading in {item['heading'] for item in sections(target.read_text()).values()}, body
            links += 1
        result = subprocess.run(['git', 'diff', '--no-index', '--check', '/dev/null', str(note)],
                                cwd=vault, capture_output=True, text=True, timeout=30)
        assert result.returncode in (0, 1) and not (result.stdout or result.stderr), (
            result.stdout + result.stderr)
    return {'passed': True, 'commits': len(actual_commits), 'sources': len(source_map),
            'questions': len(question_ids), 'wiki_links_checked': links,
            'source_hashes_current': True, 'published': False,
            'scope': '验证证据、结构、引用及空白；不证明每个技术答案正确，不生成评分。'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory', type=Path)
    parser.add_argument('--vault', type=Path, default=Path.cwd())
    arguments = parser.parse_args()
    print(json.dumps(validate(arguments.vault, arguments.directory), ensure_ascii=False))
