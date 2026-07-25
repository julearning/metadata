# Contributing to JU Learning Metadata

Thank you for wanting to contribute! Every document is submitted through a GitHub Pull Request. This guide walks you through the entire process.

---

## Quick Start

1. **Upload your file** to Google Drive (or any cloud storage)
2. **Find the subject JSON file** in the correct branch/semester folder
3. **Add your document entry** to the appropriate section (A, B, or Mixed)
4. **Open a Pull Request** — a maintainer reviews and merges it

---

## 1. Upload Your Document

Upload your PDF or Google Doc to **any cloud storage** (Google Drive, Dropbox, OneDrive, etc.). Set share settings to **"Anyone with the link can view"**.

Copy the shareable link. It should look like:

```
https://drive.google.com/file/d/1abc123xyz/view
```

> **Note:** The website only needs a downloadable URL. Any public URL works. Even Google Docs links (`https://docs.google.com/document/d/.../edit`) are supported.

---

## 2. Understanding the Structure

Metadata is organized as **one JSON file per subject**, not per document. This keeps things simple for contributors.

```
metadata/
├── cse/                          ← Branch (lowercase)
│   ├── semester-3/               ← Semester folder
│   │   ├── oop-using-cpp.json    ← Subject-level JSON
│   │   ├── mathematics-3.json
│   │   └── data-structures-and-algorithms.json
│   ├── semester-4/
│   │   ├── discrete-mathematics.json
│   │   └── operating-systems.json
│   └── semester-5/
│       └── computer-networks.json
├── ee/
│   ├── semester-3/
│   │   └── network-analysis.json
│   └── semester-4/
│       └── electrical-machine-i.json
├── ece/
├── me/
└── ce/
```

Each subject has **one JSON file** inside `{branch}/semester-{n}/`.

---

## 3. The Subject JSON Structure

Each subject JSON file contains the subject name, branch, semester, and **sections** that organize documents by syllabus split (Section A, Section B, or Mixed).

### Example: `cse/semester-3/oop-using-cpp.json`

```json
{
  "subject": "OOP Using Cpp",
  "branch": "CSE",
  "semester": 3,
  "sections": {
    "section-a": {
      "chapters": [
        "Introduction to OOP",
        "Classes and Objects",
        "Constructors and Destructors"
      ],
      "documents": [
        {
          "title": "OOP Unit 1 Notes",
          "url": "https://drive.google.com/file/d/your-file-id/view",
          "tags": ["notes", "typed"],
          "fileSize": 2457600,
          "description": "Introduction to OOP, classes, objects, and basic C++ syntax.",
          "contributor": "your-github-username",
          "uploadedAt": "2025-08-15T10:30:00Z"
        }
      ]
    },
    "section-b": {
      "chapters": [
        "Polymorphism",
        "Inheritance",
        "File Handling"
      ],
      "documents": [
        {
          "title": "OOP Unit 2 Notes",
          "url": "https://drive.google.com/file/d/another-file-id/view",
          "tags": ["notes", "typed"],
          "fileSize": 3145728,
          "description": "Polymorphism, inheritance, virtual functions, file I/O.",
          "contributor": "your-github-username",
          "uploadedAt": "2025-08-20T14:00:00Z"
        }
      ]
    },
    "mixed": {
      "documents": [
        {
          "title": "OOP Previous Year Questions",
          "url": "https://drive.google.com/file/d/pyq-file-id/view",
          "tags": ["pyq"],
          "fileSize": 1048576,
          "description": "Collection of previous year exam papers with solutions.",
          "contributor": "your-github-username",
          "uploadedAt": "2025-08-10T09:00:00Z"
        },
        {
          "title": "OOP Lab Manual",
          "url": "https://drive.google.com/file/d/lab-file-id/view",
          "tags": ["lab-manual"],
          "fileSize": 5242880,
          "description": "Complete lab manual with 12 experiments.",
          "contributor": "another-contributor",
          "uploadedAt": "2025-07-01T11:00:00Z"
        }
      ]
    }
  }
}
```

### Required Fields at Subject Level

| Field | Type | Description |
|-------|------|-------------|
| `subject` | string | Full subject name, capitalized (e.g., `"OOP Using Cpp"`) |
| `branch` | string | One of: `CSE`, `ECE`, `EE`, `ME`, `CE` |
| `semester` | number | 1 through 8 |

### Section Structure

| Section | When to use |
|---------|-------------|
| `section-a` | Documents belonging to Section A of the syllabus |
| `section-b` | Documents belonging to Section B of the syllabus |
| `mixed` | Documents spanning both sections (PYQs, full subject notes, lab manuals, etc.) |

### Section Fields

| Field | Required? | Description |
|-------|-----------|-------------|
| `chapters` | Optional | Array of chapter names for this section (add these when you know the syllabus split) |
| `documents` | Yes | Array of document entries (see below) |

### Document Entry Fields

| Field | Required? | Type | Description |
|-------|-----------|------|-------------|
| `title` | **Yes** | string | Display title (keep under 80 chars) |
| `url` | **Yes** | string | Public download link to the document |
| `tags` | **Yes** | array | See tags reference below |
| `fileSize` | **Yes** | number | File size in bytes |
| `description` | No | string | 1-2 sentence summary of content |
| `contributor` | No | string | Your GitHub username |
| `uploadedAt` | No | string | ISO 8601 date (e.g., `2025-08-15T10:30:00Z`) |
| `language` | No | string | Language code (e.g., `"English"`, `"Hindi"`) |
| `pages` | No | number | Number of pages |

---

## 4. How to Add a New Document

### Step 1: Find or Create the Subject JSON

Navigate to the correct folder:

```
{branch}/semester-{n}/
```

For example, `cse/semester-3/`. If the subject JSON file doesn't exist yet, **create it** using the template below:

```json
{
  "subject": "Your Subject Name",
  "branch": "CSE",
  "semester": 3,
  "sections": {
    "section-a": { "chapters": [], "documents": [] },
    "section-b": { "chapters": [], "documents": [] },
    "mixed": { "documents": [] }
  }
}
```

### Step 2: Know Your Sections

Most subjects have a **Section A** and **Section B** split in the syllabus:

- **Section A** → first half of the syllabus (typically Units 1-3)
- **Section B** → second half (typically Units 4-6)
- **Mixed** → documents that cover both sections (full notes, PYQs, lab manuals, assignments)

**Not sure which section?** Put it in `mixed` — a maintainer can move it later.

### Step 3: Add Your Document Entry

Add a new object to the `documents` array in the appropriate section:

```json
{
  "title": "Network Analysis Unit 1 Notes",
  "url": "https://drive.google.com/file/d/your-file-id/view",
  "tags": ["notes", "typed"],
  "fileSize": 2097152,
  "description": "Covers network theorems, nodal analysis, and mesh analysis.",
  "contributor": "your-github-username",
  "uploadedAt": "2025-08-15T10:30:00Z"
}
```

### Step 4: Add Chapters (Optional but Helpful)

If you know the chapter breakdown, add them to the `chapters` array:

```json
"section-a": {
  "chapters": [
    "Network Theorems",
    "Nodal and Mesh Analysis",
    "Transient Response"
  ],
  "documents": [...]
}
```

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

You can add custom tags for specific topics, but always include standard tags where applicable.

---

## 6. Getting a Google Drive File ID

A Google Drive shareable link looks like:

```
https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view?usp=drive_link
                          └───────────────────────┘
                                File ID
```

The **File ID** is the string between `/file/d/` and `/view`. You only need the full URL in the JSON — the website generates thumbnails automatically.

### Thumbnails

The website automatically generates document previews using:

```
https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
```

Your file **must be set to "Anyone with the link can view"** for thumbnails to work. This happens automatically when you share the file.

---

## 7. Pull Request Process

1. **Fork** this repository
2. **Clone** your fork: `git clone https://github.com/your-username/metadata.git`
3. **Create a branch**: `git checkout -b add-cse-s3-oop-notes`
4. **Edit the subject JSON** — add your document entry
5. **Commit**: `git add . && git commit -m "add: OOP notes for CSE semester 3"`
6. **Push**: `git push origin add-cse-s3-oop-notes`
7. **Open a Pull Request** on GitHub from your branch to `main`

### What happens after you submit

1. **GitHub Actions** automatically runs validation:
   - JSON syntax check
   - Required fields check (subject, branch, semester)
   - Valid branch, semester checks
   - URL format check
2. **A maintainer reviews** your submission
3. **If everything is correct**, the PR is merged
4. **The website rebuilds** automatically with your document included
5. **Your document appears** in search results within minutes

### Common PR Issues

| Issue | Fix |
|-------|-----|
| "Invalid JSON" | Run `jq . your-file.json` to validate syntax |
| "Missing required fields" | Ensure `subject`, `branch`, and `semester` are present at the top level |
| "Invalid branch" | Use one of: `CSE`, `ECE`, `EE`, `ME`, `CE` |
| "Invalid semester" | Use a number between 1 and 8 |
| "File not in correct folder" | Place the file under `{branch}/semester-{n}/` |
| "Document missing title or url" | Ensure each document entry has both `title` and `url` |

---

## 8. Reporting Broken Links

Found a document with a dead link? Open a GitHub Issue with:

- Subject name and semester
- Broken URL
- Reason (404, permission denied, wrong file, etc.)

The community will fix it and submit a PR.

---

## 9. Best Practices

- **Keep titles descriptive** but under 80 characters: `"DBMS Complete Notes - Unit 1 to 5"`
- **Write clear descriptions** — help students understand what's inside: which topics, which units, solved or unsolved
- **Use accurate file sizes** — this helps students with limited data plans
- **Place documents in the right section** — Section A for earlier units, Section B for later units, Mixed for everything else
- **Don't submit copyrighted material** without permission. Only upload documents you created or have permission to share
- **Add chapters if you know them** — this helps students find content faster
- **One subject file per subject** — don't create multiple JSON files for the same subject. Add all documents to the existing file
- **Keep the file clean** — don't remove other contributors' entries. Just add yours alongside them

---

## Need Help?

Open a [GitHub Issue](https://github.com/julearning/metadata/issues/new) with your question. We're happy to help first-time contributors!
