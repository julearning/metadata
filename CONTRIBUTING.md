# Contributing to JU Learning Metadata

Thank you for contributing! This repository contains the metadata for all study materials on [JU Learning](https://julearning.vercel.app).

## How it works

Every study material document is stored as **one standalone JSON file**. When the website builds, it clones this repository, reads all JSON files, and indexes them for search.

```
metadata/
├── CSE/
│   ├── semester-4/
│   │   ├── DBMS/
│   │   │   ├── dbms-unit-1-notes.json        ← one document
│   │   │   ├── dbms-unit-2-notes.json        ← one document
│   │   │   └── midterm-paper-2024.json       ← one document
│   │   └── Operating-Systems/
│   │       └── os-process-management.json    ← one document
│   └── semester-5/
│       └── ...
├── ECE/
│   └── ...
└── examples/
    └── example-document.json                 ← template
```

### Folder structure

```
{branch}/{semester-N}/{Subject-Name}/{title-slug}.json
```

- **Branch**: `CSE`, `ECE`, `EE`, `ME`, `CE` (uppercase)
- **Semester**: `semester-1` through `semester-8` (lowercase)
- **Subject**: The full subject name in Title Case (e.g., `Database-Management-Systems`)
- **File**: A short slug of the document title (e.g., `dbms-unit-1-notes.json`)

## Adding a document

### Step 1: Find the right folder

Navigate to the branch and semester folder. For example, for a CSE Semester 4 DBMS note:

```
CSE/semester-4/DBMS/
```

If the subject folder doesn't exist yet, create it.

### Step 2: Create the JSON file

Name the file after the document title. Use lowercase with hyphens:

| Document Title | Filename |
|---------------|----------|
| DBMS Unit 1 Notes | `dbms-unit-1-notes.json` |
| Operating Systems PYQ 2024 | `os-pyq-2024.json` |
| Signals & Systems Assignment 2 | `signals-assignment-2.json` |

### Step 3: Fill in the template

```json
{
  "title": "DBMS Unit 1 Notes",
  "url": "https://drive.google.com/file/d/YOUR-FILE-ID/view",
  "tags": ["notes", "typed"],
  "subject": "DBMS",
  "branch": "CSE",
  "semester": 4,
  "section": "section-a",
  "chapters": ["Introduction to DBMS", "ER Model", "Relational Model"],
  "fileSize": 2048576,
  "contributor": "your-github-username",
  "uploadedAt": "2026-07-25",
  "description": "Complete notes covering Unit 1 of DBMS syllabus.",
  "language": "English",
  "pages": 42
}
```

### Fields explained

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Full document title |
| `url` | ✅ | Google Drive share link (must be "Anyone with link") |
| `tags` | ✅ | Array of tags: `notes`, `pyq`, `assignment`, `lab-manual`, `syllabus`, `handwritten`, `typed`, `reference-book`, `project-report` |
| `subject` | ✅ | Full subject name (must match folder name) |
| `branch` | ✅ | Branch code: `CSE`, `ECE`, `EE`, `ME`, `CE` |
| `semester` | ✅ | Number 1-8 |
| `section` | ✅ | `section-a`, `section-b`, or `mixed` |
| `fileSize` | ✅ | File size in bytes |
| `chapters` | | Array of chapter names this document covers |
| `contributor` | | Your GitHub username |
| `uploadedAt` | | Date in ISO format |
| `description` | | Brief description of the document |
| `language` | | `English`, `Hindi`, `mixed`, or other |
| `pages` | | Number of pages |

### Tags reference

| Tag | Meaning |
|-----|---------|
| `notes` | Subject notes |
| `pyq` | Previous year question paper |
| `assignment` | Assignment questions |
| `lab-manual` | Lab manual / practical file |
| `syllabus` | Syllabus document |
| `handwritten` | Handwritten notes |
| `typed` | Typed/printed notes |
| `reference-book` | Reference book / textbook |
| `project-report` | Project report |

## Quick method: Bulk-generate from Google Drive

If you have a folder of files on Google Drive, the fastest way is to use the **Drive automation tool** on the website.

### Step 1: Get your Drive links

1. Open your Google Drive folder in **List view** (View → List or press `Ctrl+Shift+6`)
2. Install the [Google Drive Link Getter](https://chromewebstore.google.com/detail/Google%20Drive%20Link%20Getter/pcepfnopeaalfdibnbflpphaapbfoicl) Chrome extension
3. Click the extension icon — it will list all files with their names and public URLs
4. Copy the entire list (tab-separated: `FileName\tURL`)

### Step 2: Generate JSON files

1. Go to **julearning.vercel.app/automation/drive** (the Drive automation page on the website)
2. Paste the copied list into the textarea
3. Fill in default values (branch, semester, subject, contributor name, etc.)
4. Click "Generate" and confirm
5. Download each generated JSON file (or download all at once)

### Step 3: Upload to this repo

1. Drop each JSON file into the correct folder under `{Branch}/{Semester-N}/{Subject}/`
2. Commit and open a pull request

> The automation tool supports all Google URL formats: `/file/d/ID/view`, `/document/d/ID/edit`, `/spreadsheets/d/ID/edit`, `/presentation/d/ID/edit`. Videos and images are automatically skipped.

---

## Getting the Drive file ID (manual)

1. Upload your file to Google Drive
2. Set sharing to **"Anyone with the link"**
3. Copy the link — it looks like:
   ```
   https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view
   ```
4. The `1AbCdEfGhIjKlMnOpQrStUvWxYz` is your file ID
5. In the `url` field, put the full link

> **Tip**: You can also get a thumbnail preview automatically. The website converts your Drive link to a thumbnail at build time.

---

## Language notes

This project is **language-agnostic**. Study materials in any language are welcome — English, Hindi, Urdu, Dogri, or mixed. Set the `language` field to the primary language of the document. If a document mixes multiple languages, use `"language": "mixed"` or the most dominant language.

Examples:
- Pure English → `"language": "English"`
- Hindi notes → `"language": "Hindi"`
- Mixed English + Hindi → `"language": "mixed"`
- Regional language → `"language": "Dogri"` (or whatever applies)

## Reporting a broken link

If you find a document with a broken link:

1. Click **"Report"** on the website
2. Or [open an issue](https://github.com/julearning/metadata/issues/new) with the document title and file path
3. Someone will submit a PR to fix or remove it

## Validation rules (GitHub Actions)

When you submit a PR, automated checks will verify:

- ✅ JSON is valid and parsable
- ✅ All required fields are present
- ✅ Branch and semester values are valid
- ✅ URL format is correct
- ✅ Subject name matches the folder name
- ✅ No duplicate document titles within a subject

If any check fails, the PR comment will tell you exactly what to fix.

## Example

See the [`examples/`](./examples/) folder for a complete example:
- `examples/example-document.json` — a template with all fields

## Questions?

[Open an issue](https://github.com/julearning/metadata/issues/new) or join our community.
