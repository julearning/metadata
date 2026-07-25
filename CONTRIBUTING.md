# Contributing to JU Learning Metadata

Thank you for wanting to contribute! Every document is submitted through a GitHub Pull Request. This guide walks you through the entire process.

## Quick Start

1. **Upload your file** to Google Drive (or any cloud storage)
2. **Create a JSON metadata file** following the template below
3. **Open a Pull Request** on this repository
4. **A maintainer reviews and merges** your contribution

---

## 1. Upload Your Document

Upload your PDF/document to **any cloud storage** (Google Drive, Dropbox, OneDrive, etc.). Set the share settings to **"Anyone with the link can view"**.

Copy the shareable link. It should look like:
```
https://drive.google.com/file/d/1abc123xyz/view
```

> **Note:** The website only needs a downloadable URL. It doesn't care where the file is hosted. Any public URL works.

---

## 2. Find the Right Folder

Metadata is organized in a simple tree:

```
metadata/
├── cse/                  ← Branch (lowercase)
│   ├── semester-3/       ← Semester number
│   │   ├── database-management-systems/   ← Subject (lowercase, hyphenated)
│   │   │   └── cse-s3-dbms-notes-1.json   ← Document file
│   │   └── data-structures-and-algorithms/
│   │       └── cse-s3-dsa-pyq-1.json
│   └── semester-4/
│       └── operating-systems/
│           └── cse-s4-os-notes-1.json
├── ece/
├── ee/
├── me/
└── ce/
```

If the folder for your branch/semester/subject doesn't exist, **create it**. The structure is always:

```
{branch}/{semester-number}/{subject-name}/
```

- `branch`: lowercase branch code (`cse`, `ece`, `ee`, `me`, `ce`)
- `semester-number`: `semester-1` through `semester-8`
- `subject-name`: lowercase, spaces replaced with hyphens (`database-management-systems`)

---

## 3. Create the JSON File

Use this exact structure:

```json
{
  "id": "cse-s3-dbms-notes-1",
  "title": "DBMS Complete Notes - Unit 1 to 5",
  "description": "Comprehensive database management systems notes covering ER diagrams, relational model, SQL, normalization, and transaction processing.",
  "url": "https://drive.google.com/file/d/your-file-id/view",
  "fileType": "pdf",
  "fileSize": 4200000,
  "branch": "CSE",
  "degree": "B.Tech",
  "semester": 3,
  "subject": "Database Management Systems",
  "tags": ["notes", "typed"],
  "contributor": "your-github-username",
  "uploadedAt": "2025-08-15T10:30:00Z",
  "verified": false
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (see convention below) |
| `title` | string | Display title (keep under 80 chars) |
| `description` | string | 1-2 sentence summary of what this covers |
| `url` | string | Public download link to the document |
| `fileType` | string | One of: `pdf`, `docx`, `pptx`, `image` |
| `fileSize` | number | File size in bytes |
| `branch` | string | One of: `CSE`, `ECE`, `EE`, `ME`, `CE` |
| `degree` | string | Always `B.Tech` |
| `semester` | number | 1 through 8 |
| `subject` | string | Full subject name (capitalized) |
| `tags` | array | See tags reference below |
| `contributor` | string | Your GitHub username |
| `uploadedAt` | string | ISO 8601 date |
| `verified` | boolean | Set to `false` — maintainers will verify |

### Optional Fields

```json
{
  "downloads": 0,
  "language": "en",
  "pages": 42,
  "topic": "Unit 3: Transaction Processing"
}
```

---

## 4. ID Convention

Every document needs a unique ID that follows this pattern:

```
{branch}-s{semester}-{subject-keyword}-{type}-{number}
```

| Part | Example | Description |
|------|---------|-------------|
| `branch` | `cse` | Lowercase branch code |
| `s{semester}` | `s3` | Semester with `s` prefix |
| `subject-keyword` | `dbms` | Short subject identifier |
| `type` | `notes`, `pyq`, `assign` | Document type |
| `number` | `1`, `2` | Sequential number for same type |

**Examples:**
- `cse-s3-dbms-notes-1` — DBMS notes, first entry
- `cse-s3-dbms-pyq-1` — DBMS previous year questions
- `ece-s4-ss-assign-2` — Signals & Systems assignment, second entry
- `ee-s4-em-notes-1` — Electrical Machines notes

> **Important:** IDs must be unique across the entire repository. The validation workflow checks for duplicates.

---

## 5. Tags Reference

Tags help students filter documents. Use these standard tags:

| Tag | Description |
|-----|-------------|
| `notes` | Subject notes / study material |
| `pyq` | Previous year question papers with solutions |
| `assignment` | Assignment problems and solutions |
| `lab-manual` | Lab experiment guides and manuals |
| `syllabus` | Course syllabus and exam pattern |
| `handwritten` | Handwritten notes (scanned) |
| `typed` | Typed / digital notes |
| `reference-book` | Reference books and textbooks |
| `project-report` | Project reports and documentation |

You can add custom tags for specific topics, but these standard tags should always be included where applicable.

---

## 6. Pull Request Process

1. **Fork** this repository
2. **Clone** your fork: `git clone https://github.com/your-username/metadata.git`
3. **Create a branch**: `git checkout -b add-cse-s3-dbms-notes`
4. **Add your JSON file** to the correct folder
5. **Commit**: `git add . && git commit -m "add: DBMS notes for CSE semester 3"`
6. **Push**: `git push origin add-cse-s3-dbms-notes`
7. **Open a Pull Request** on GitHub from your branch to `main`

### What happens after you submit

1. **GitHub Actions** automatically runs validation:
   - JSON syntax check
   - Required fields check
   - Duplicate ID check
   - Valid branch, semester, and file type checks
   - URL format check
2. **A maintainer reviews** your submission
3. **If everything is correct**, the PR is merged
4. **The website rebuilds** automatically with your document included
5. **Your document appears** in search results within minutes

### Common PR Issues

| Issue | Fix |
|-------|-----|
| "Invalid JSON" | Run `jq . your-file.json` to validate syntax |
| "Missing required fields" | Check the required fields table above |
| "Duplicate ID" | Change the ID number or use a different subject keyword |
| "Invalid branch" | Use one of: `CSE`, `ECE`, `EE`, `ME`, `CE` |
| "Invalid semester" | Use a number between 1 and 8 |
| "File not in correct folder" | Place the file under `{branch}/semester-{n}/{subject}/` |

---

## 7. Reporting Broken Links

Found a document with a dead link? Click the **flag icon** on any document card on the website — it opens a pre-filled GitHub Issue. Or open an issue manually with:

- Document ID
- Broken URL
- Reason (404, permission denied, wrong file, etc.)

---

## 8. Best Practices

- **Keep titles descriptive** but under 80 characters: `DBMS Complete Notes - Unit 1 to 5`
- **Write clear descriptions** that help students understand what's inside: what topics, which units, solved or unsolved
- **Set `verified: false`** for new submissions — maintainers will verify and update
- **Use accurate file sizes** — this helps students with limited data plans
- **Don't submit copyrighted material** without permission. Only upload documents you created or have permission to share
- **One document per JSON file** — don't batch multiple documents into one entry

---

## Need Help?

Open a [GitHub Issue](https://github.com/julearning/metadata/issues/new) with your question. We're happy to help first-time contributors!
