# JU Learning — Metadata

All study materials for JU Learning live here. One JSON file per document. The website reads this repo at build time and generates static pages.

---

### Folder structure

```
metadata/
├── cse/
│   ├── semester-4/
│   │   ├── database-management-systems/
│   │   │   ├── dbms-unit-1-notes.json
│   │   │   ├── dbms-pyq-2023.json
│   │   │   └── er-diagram-assignment.json
│   │   └── operating-systems/
│   │       └── ...
│   └── semester-5/
│       └── ...
├── ece/
│   └── ...
├── ee/
├── me/
├── ce/
├── examples/
│   └── example-document.json
├── scripts/
│   └── validate-metadata.py
└── .github/
    └── workflows/
        └── validate-pr.yml
```

### File structure

Each JSON file represents one document. Here's what goes in it:

```json
{
  "title": "DBMS Unit 1 Notes",
  "url": "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view",
  "tags": ["notes", "handwritten"],
  "subject": "Database Management Systems",
  "branch": "CSE",
  "semester": 4,
  "section": "section-a",
  "fileSize": 2457600,
  "chapters": ["Introduction to DBMS", "ER Model", "Relational Model"],
  "contributor": "your-github-username",
  "uploadedAt": "2026-07-25T10:30:00.000Z",
  "language": "english",
  "pages": 12
}
```

### Fields

| Field | Required | Notes |
|-------|----------|-------|
| `title` | Yes | Clear document title |
| `url` | Yes | Google Drive share link (anyone with the link) |
| `tags` | Yes | Array from: `notes`, `pyq`, `handwritten`, `typed`, `assignment`, `lab-manual`, `syllabus`, `reference-book`, `project-report` |
| `subject` | Yes | Full subject name |
| `branch` | Yes | One of: `CSE`, `ECE`, `EE`, `ME`, `CE` |
| `semester` | Yes | 1 to 8 |
| `section` | Yes | One of: `section-a`, `section-b`, `mixed` |
| `fileSize` | Yes | In bytes |
| `chapters` | No | Array of chapter/topic names covered |
| `contributor` | No | Your GitHub username |
| `uploadedAt` | No | ISO date string |
| `language` | No | Defaults to english |
| `pages` | No | Page count if known |

### How to add a document

1. Fork this repo
2. Navigate to the right folder: `{branch}/{semester-N}/{Subject-Name}/`
   - If the subject folder doesn't exist, create it
3. Create a JSON file with a descriptive name (e.g., `dbms-unit-1-notes.json`)
4. Fill in the fields from the table above
5. Open a pull request

### What happens when you open a PR

A GitHub Action runs and checks:
- Is the JSON valid and parsable?
- Are all required fields present with correct types?
- Is the branch one of `{CSE, ECE, EE, ME, CE}`?
- Is the semester between 1 and 8?
- Is the section one of `{section-a, section-b, mixed}`?
- Does the URL match `drive.google.com/file/d/.../view` or `docs.google.com/document/d/.../edit`?
- Are tags from the allowed list?
- Is fileSize a non-negative number?
- Are there any unknown fields?

If it passes, someone reviews and merges. The website rebuilds on the next deploy and your document appears on the site.

### Getting a shareable Drive link

1. Upload your file to Google Drive
2. Set sharing to "Anyone with the link"
3. Copy the link — it should look like `https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view`
4. Use that as the `url` field

The website automatically generates thumbnails from Drive links. No extra work needed.

### Validation

Run validation locally before pushing:

```bash
python3 scripts/validate-metadata.py --dir .
```

This runs the same checks as the GitHub Action.
