# Repository Guidelines

## Project Structure & Organization

This repository is an Obsidian vault for technical learning, articles, interview preparation, daily notes, and attachments. Place new notes in the existing subject area: `Learn/` for study notes, `Article/` for essays, `Chores/JobInterviews/` for job search material, `Daily/` for daily records, and `Files & LongText/Attachments/` for attachments. Follow the detailed organization and writing rules in `Style.md`; avoid creating new top-level categories when an existing one fits. Keep each note focused on one topic and use Obsidian wikilinks to connect related notes.

## Development and Validation

There is no application build or test suite. For the bundled note index tool, run commands from the vault root:

- `python3 .obsidian/notes-index/notes_index.py check "Learn/ToolChain/CMake.md"` checks one note against the index.
- `python3 .obsidian/notes-index/notes_index.py lookup "keyword"` finds potentially related notes before adding content.
- `python3 .obsidian/notes-index/notes_index.py update --no-write` previews index changes without modifying the database.

The index uses Python 3.8+ and the standard library. Run a full index update only when requested, as specified in `Style.md`.

## Writing Style and Naming

Write concise, information-dense notes, normally in Chinese for knowledge content. Use Markdown headings in order (`#` for the note title, then `##`, `###`); do not skip levels or number headings. New files and directories should use short PascalCase names without spaces, while matching the established directory structure. Use four spaces for nested list indentation, fenced code blocks only when they add useful information, and `[[Note]]` links for internal references. Store attachments in the configured attachment directory and embed them as `![[filename.png]]`. Treat `Style.md` as the authoritative reference for formatting and note structure.

## Review and Commit Guidance

Before submitting changes, check that files are in the correct subject directory, links and attachment references resolve, and Markdown renders correctly in Obsidian. For note edits, preserve existing author content and make only scoped additions or corrections. Recent history includes automated `vault backup` commits and `chore(vault)` sync commits; for intentional manual changes, use a short, descriptive message such as `docs: add CMake note` or `docs: update interview review`. Include a concise change summary when proposing a pull request; screenshots are only useful for changes to visual assets or vault presentation.

## Configuration and Sensitive Data

Do not add credentials, tokens, private session data, or machine-specific configuration to the vault. Keep Obsidian settings and plugin changes limited to what the task requires, and avoid modifying generated index data unless the change calls for it.
