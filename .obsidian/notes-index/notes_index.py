"""
notes-index 核心模块。

SQLite 索引库：记录 vault 中所有 md 文件的 <=3 级标题与精简描述。
本工具随 vault 携带，位于 <vault>/.obsidian/notes-index/，不依赖任何第三方包，
仅用 Python 标准库（sqlite3 / pathlib / re）。

接口语义见 CLI 子命令：update / check / lookup / desc。

路径策略（跨平台、无硬编码）：
  - vault 根：由脚本位置推导 .obsidian/notes-index/notes_index.py → parents[2]
  - 数据库：默认脚本同目录 index.db
  - 二者均可用 --vault / --db 覆盖；路径一律用 pathlib，Windows/Linux/macOS 通用

表结构：
  files     (path PRIMARY KEY, description TEXT, mtime REAL, title_md5 TEXT)
  headings  (id INTEGER PRIMARY KEY AUTOINCREMENT,
             file_path TEXT REFERENCES files(path) ON DELETE CASCADE,
             title TEXT, level INTEGER, line INTEGER,
             desc TEXT,
             stable_id TEXT NOT NULL,
             UNIQUE(file_path, line, stable_id))

标题身份对齐策略：
  1. 先按 (file, title, level) 精确匹配；命中 → 复用原 stable_id
  2. 未命中再按 (file, 邻近 line) 位置兜底找 rename 候选；唯一候选 → 复用其稳定 id（改名不新增）
  3. 都未命中 → 新标题，生成新 stable_id
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sqlite3
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable, Optional

SCHEMA = """
CREATE TABLE IF NOT EXISTS files (
    path TEXT PRIMARY KEY,
    description TEXT NOT NULL DEFAULT '',
    mtime REAL NOT NULL DEFAULT 0,
    title_md5 TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS headings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL REFERENCES files(path) ON DELETE CASCADE,
    title TEXT NOT NULL,
    level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 3),
    line INTEGER NOT NULL,
    desc TEXT NOT NULL DEFAULT '',
    stable_id TEXT NOT NULL,
    UNIQUE(file_path, line, stable_id)
);
CREATE INDEX IF NOT EXISTS idx_heading_file ON headings(file_path);
CREATE INDEX IF NOT EXISTS idx_heading_title ON headings(title);
"""

HEADING_RE = re.compile(r"^(#{1,3})\s+(.+?)\s*#*\s*$")

# 不纳入索引的目录（vault 内）
DESC_SKIP_DIRS = {".obsidian", ".git", ".trash"}


@dataclass
class Heading:
    file_path: str
    title: str
    level: int
    line: int
    desc: str = ""
    stable_id: str = ""


@dataclass
class Diff:
    added: list[dict] = field(default_factory=list)
    renamed: list[dict] = field(default_factory=list)
    deleted: list[dict] = field(default_factory=list)
    need_desc: list[dict] = field(default_factory=list)
    changed_files: list[str] = field(default_factory=list)


def script_dir() -> Path:
    """本工具所在目录（<vault>/.obsidian/notes-index）。"""
    return Path(__file__).resolve().parent


def default_vault() -> Path:
    """由脚本位置推导 vault 根：.obsidian/notes-index/ → 上溯两级。"""
    return script_dir().parents[1]


def default_db() -> Path:
    """默认数据库：脚本同目录 index.db（随 vault 携带）。"""
    return script_dir() / "index.db"


def resolve_vault(vault_arg: Optional[str]) -> Path:
    """--vault 优先；否则自动推导。支持相对/绝对路径，跨平台。"""
    return Path(vault_arg).resolve() if vault_arg else default_vault()


def connect(db_path: Path) -> sqlite3.Connection:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    conn.commit()
    return conn


def walk_markdown(vault: Path) -> Iterable[Path]:
    """扫描 vault 内所有 md，跳过 .trash/.obsidian/.git。"""
    for root, dirs, files in os.walk(vault):
        rel = Path(root).relative_to(vault)
        dirs[:] = [
            d
            for d in dirs
            if d not in DESC_SKIP_DIRS and not any(part in DESC_SKIP_DIRS for part in rel.parts)
        ]
        for f in files:
            if f.endswith(".md"):
                yield Path(root) / f


def _normalize_title(raw: str) -> str:
    """归一化为「人眼所见」形式：NBSP→空格、去零宽字符、去转义反斜杠、去反引号、折叠空白。"""
    t = raw.replace("\xa0", " ").replace("\u200b", "")
    for esc in (r"\[", r"\]", r"\_", r"\`", r"\*", r"\#", r"\\"):
        t = t.replace(esc, esc[-1])
    t = re.sub(r"[`]+", "", t)
    return re.sub(r"\s+", " ", t).strip()


def scan_markdown(path: Path, vault: Path) -> list[Heading]:
    """提取单个 md 的 <=3 级标题，附带行号（从 1 计）。

    围栏解析：记录开头的标记(反引号/波浪号)与长度，闭合需同标记且长度 >= 开头，
    以支持 ```` 4+ 反引号嵌套围栏（外长内短）。
    """
    rel = str(path.relative_to(vault)).replace(os.sep, "/")
    out: list[Heading] = []
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return out
    lines = text.splitlines()
    start = 0
    if lines and lines[0].strip() == "---":
        for i in range(1, len(lines)):
            if lines[i].strip() == "---":
                start = i + 1
                break
    fence_re = re.compile(r"^(```+|~~~+)")
    fence_mark, fence_len = None, 0
    for i in range(start, len(lines)):
        line = lines[i]
        if fence_mark:
            if re.match(rf"^{re.escape(fence_mark)}{{{fence_len},}}", line.lstrip()):
                fence_mark, fence_len = None, 0
            continue
        fm = fence_re.match(line.lstrip())
        if fm:
            fence_mark = fm.group(1)[0]
            fence_len = len(fm.group(1))
            continue
        hm = HEADING_RE.match(line)
        if hm:
            out.append(
                Heading(
                    file_path=rel,
                    title=_normalize_title(hm.group(2).strip()),
                    level=len(hm.group(1)),
                    line=i + 1,
                )
            )
    return out


def md5(s: str) -> str:
    return hashlib.md5(s.encode("utf-8")).hexdigest()


def _stable_id(rel: str, title: str) -> str:
    return md5(f"{rel}\0{title}")


# --------------------------------------------------------------------------
# updateRecord：全量对账
# --------------------------------------------------------------------------

def update_record(vault: Path, conn: sqlite3.Connection) -> Diff:
    """扫描全库 md 的 <=3 级标题，与库内记录对账。

    匹配优先级：标题文本精确 → 邻近位置兜底 rename → 新增。
    返回 Diff（added 带稳定 id，renamed 为改名对，deleted 为移除的标题）。
    """
    diff = Diff()
    existing: dict[tuple[str, str, int], dict] = {}
    by_file: dict[str, list[dict]] = {}
    for r in conn.execute(
        "SELECT id, file_path, title, level, line, desc, stable_id FROM headings"
    ):
        key = (r["file_path"], r["title"], r["level"])
        existing[key] = dict(r)
        by_file.setdefault(r["file_path"], []).append(dict(r))

    new_headings: list[Heading] = []
    changed_files: set[str] = set()
    disk_files: set[str] = set()
    for path in walk_markdown(vault):
        rel = str(path.relative_to(vault)).replace(os.sep, "/")
        disk_files.add(rel)
        heads = scan_markdown(path, vault)
        seen = set()
        for h in heads:
            key = (h.file_path, h.title, h.level)
            seen.add(key)
            if key not in existing:
                cand = _find_rename_candidate(h, by_file.get(rel, []), seen)
                if cand:
                    old_title = cand["title"]
                    conn.execute(
                        "UPDATE headings SET title=?, line=?, level=? WHERE id=?",
                        (h.title, h.line, h.level, cand["id"]),
                    )
                    old_key = (cand["file_path"], cand["title"], cand["level"])
                    existing.pop(old_key, None)
                    cand["title"], cand["level"], cand["line"] = h.title, h.level, h.line
                    existing[(rel, h.title, h.level)] = cand
                    changed_files.add(rel)
                    diff.renamed.append(
                        {"file": rel, "old_title": old_title, "new_title": h.title}
                    )
                else:
                    new_headings.append(h)
                    changed_files.add(rel)
        for row in by_file.get(rel, []):
            if (row["file_path"], row["title"], row["level"]) not in seen:
                conn.execute("DELETE FROM headings WHERE id=?", (row["id"],))
                changed_files.add(rel)
                diff.deleted.append(
                    {"file": rel, "title": row["title"], "level": row["level"]}
                )
        mtime = path.stat().st_mtime if path.exists() else 0
        tm = md5(",".join(sorted(f"{t}\0{l}" for _, t, l in seen)) or "")
        conn.execute(
            "INSERT INTO files(path, mtime, title_md5, description) VALUES(?,?,?,?) "
            "ON CONFLICT(path) DO UPDATE SET mtime=excluded.mtime, "
            "title_md5=CASE WHEN excluded.title_md5!='' THEN excluded.title_md5 "
            "ELSE files.title_md5 END",
            (rel, mtime, tm, ""),
        )

    for r in conn.execute("SELECT path FROM files").fetchall():
        if r["path"] not in disk_files:
            conn.execute("DELETE FROM files WHERE path=?", (r["path"],))
            changed_files.add(r["path"])

    for h in new_headings:
        h.stable_id = _stable_id(h.file_path, h.title)
        conn.execute(
            "INSERT INTO headings(file_path, title, level, line, desc, stable_id) "
            "VALUES(?,?,?,?,?,?)",
            (h.file_path, h.title, h.level, h.line, "", h.stable_id),
        )
        diff.added.append(
            {"file": h.file_path, "title": h.title, "level": h.level, "stable_id": h.stable_id}
        )

    for r in conn.execute("SELECT file_path, title FROM headings WHERE desc=''"):
        diff.need_desc.append({"file": r["file_path"], "title": r["title"]})

    diff.changed_files = sorted(changed_files)
    conn.commit()
    return diff


def _find_rename_candidate(
    h: Heading, rows: list[dict], already_seen: set[tuple[str, str, int]]
) -> Optional[dict]:
    """位置兜底：找 line 最接近、标题不同、且未被本次扫描用过的候选（阈值 20 行）。"""
    best, best_dist = None, 10**9
    for r in rows:
        if r["title"] == h.title and r["level"] == h.level:
            continue
        if (h.file_path, r["title"], r["level"]) in already_seen:
            continue
        dist = abs(r["line"] - h.line)
        if dist < best_dist:
            best, best_dist = r, dist
    return best if best_dist <= 20 else None


# --------------------------------------------------------------------------
# isUpdate：增量快查
# --------------------------------------------------------------------------

def is_update(vault: Path, conn: sqlite3.Connection, target: str) -> Diff:
    """对比指定文件（或 ALL）在磁盘的标题与库内记录，返回差异。只读，不写库。"""
    diff = Diff()
    if target == "ALL":
        paths = list(walk_markdown(vault))
    else:
        p = vault / target
        if not p.exists():
            return diff
        paths = [p]
    for path in paths:
        rel = str(path.relative_to(vault)).replace(os.sep, "/")
        heads = scan_markdown(path, vault)
        disk = {(h.title, h.level) for h in heads}
        cur = conn.execute(
            "SELECT id, title, level, line, desc FROM headings WHERE file_path=?", (rel,)
        ).fetchall()
        db = {(r["title"], r["level"]) for r in cur}
        for h in heads:
            if (h.title, h.level) not in db:
                diff.added.append(
                    {"file": rel, "title": h.title, "level": h.level, "line": h.line}
                )
        for r in cur:
            if (r["title"], r["level"]) not in disk:
                diff.deleted.append({"file": rel, "title": r["title"], "level": r["level"]})
            if not r["desc"]:
                diff.need_desc.append({"file": rel, "title": r["title"]})
        if diff.added or diff.deleted or diff.need_desc:
            diff.changed_files.append(rel)
    diff.changed_files = sorted(set(diff.changed_files))
    return diff


# --------------------------------------------------------------------------
# lookup：相似内容检索
# --------------------------------------------------------------------------

def lookup(
    conn: sqlite3.Connection, query: str, limit: int = 10, threshold: float = 0.0
) -> list[dict]:
    """按关键词子串（LIKE）检索标题与 desc。标题命中权重高于 desc，按条目聚合取最优。"""
    tokens = [t for t in re.split(r"[\s,，。;；:：/\\()（）\[\]【】]+", query) if t]
    if not tokens:
        return []
    rows: list[dict] = []
    for tok in tokens:
        like = f"%{tok}%"
        for r in conn.execute(
            "SELECT file_path, title, level, desc FROM headings "
            "WHERE title LIKE ? OR desc LIKE ?",
            (like, like),
        ):
            score, matched = 0.0, []
            for t in tokens:
                if t in r["title"]:
                    score += 2.0
                    matched.append(t)
                elif t in (r["desc"] or ""):
                    score += 1.0
                    matched.append(t)
            if score > 0:
                rows.append({**dict(r), "matched": matched, "score": score})
    best: dict[tuple[str, str], dict] = {}
    for r in rows:
        k = (r["file_path"], r["title"])
        if k not in best or r["score"] > best[k]["score"]:
            best[k] = r
    return sorted(best.values(), key=lambda r: -r["score"])[:limit]


# --------------------------------------------------------------------------
# upsertDesc：写入标题/文件描述
# --------------------------------------------------------------------------

def upsert_desc(conn: sqlite3.Connection, file_path: str, title: Optional[str], desc: str) -> bool:
    """title 非空 → 写标题 desc；title 为空 → 写文件 description。"""
    if title:
        cur = conn.execute(
            "UPDATE headings SET desc=? WHERE file_path=? AND title=?", (desc, file_path, title)
        )
    else:
        cur = conn.execute("UPDATE files SET description=? WHERE path=?", (desc, file_path))
    conn.commit()
    return cur.rowcount > 0


# --------------------------------------------------------------------------
# CLI
# --------------------------------------------------------------------------

def _print_json(obj) -> None:
    print(json.dumps(obj, ensure_ascii=False, indent=2))


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        prog="notes-index",
        description="Vault md 标题索引：update / check / lookup / desc（随库携带，路径自动推导）",
    )
    parser.add_argument("--vault", default=None, help="vault 根目录（缺省由脚本位置推导）")
    parser.add_argument("--db", default=None, help="SQLite 库路径（缺省为脚本同目录 index.db）")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_upd = sub.add_parser("update", help="全量扫描并更新索引（updateRecord）")
    p_upd.add_argument("--no-write", action="store_true", help="只比对不写库（dry-run）")

    p_chk = sub.add_parser("check", help="对比指定文件标题是否有更新（isUpdate）")
    p_chk.add_argument("target", help="相对路径，或 ALL 表示全库")

    p_lk = sub.add_parser("lookup", help="相似内容检索（lookup）")
    p_lk.add_argument("query", help="检索关键词")
    p_lk.add_argument("--limit", type=int, default=10)
    p_lk.add_argument("--threshold", type=float, default=0.0)

    p_desc = sub.add_parser("desc", help="写入标题/文件描述（upsertDesc）")
    p_desc.add_argument("--file", default=None, help="相对路径（--batch 时忽略）")
    p_desc.add_argument("--title", default=None, help="标题（缺省表示写文件描述）")
    p_desc.add_argument("--desc", default=None, help="精简描述")
    p_desc.add_argument("--batch", default=None, help="批量导入 JSON 文件：[{file,title,desc}]")

    args = parser.parse_args(argv)
    vault = resolve_vault(args.vault)
    if not vault.is_dir():
        _print_json({"error": f"vault 目录不存在: {vault}"})
        return 1
    db = Path(args.db).resolve() if args.db else default_db()
    conn = connect(db)

    if args.cmd == "update":
        if args.no_write:
            mem = sqlite3.connect(":memory:")
            mem.executescript(SCHEMA)
            conn.backup(mem)
            mem.row_factory = sqlite3.Row
            _print_json(update_record(vault, mem).__dict__)
        else:
            _print_json(update_record(vault, conn).__dict__)
    elif args.cmd == "check":
        _print_json(is_update(vault, conn, args.target).__dict__)
    elif args.cmd == "lookup":
        _print_json(lookup(conn, args.query, args.limit, args.threshold))
    elif args.cmd == "desc":
        if args.batch:
            with open(args.batch, encoding="utf-8") as f:
                items = json.load(f)
            n_ok = sum(
                1 for it in items if upsert_desc(conn, it["file"], it.get("title"), it["desc"])
            )
            _print_json({"updated": n_ok, "total": len(items)})
        elif args.file and args.desc is not None:
            _print_json({"updated": upsert_desc(conn, args.file, args.title, args.desc)})
        else:
            parser.error("desc 需 --batch 或 --file+--desc")
    conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
