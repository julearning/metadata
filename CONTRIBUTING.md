# Contributing to JU Learning Metadata

Thank you for contributing. This repository contains the study material directory for JU Learning — the website reads it at build time and generates static pages.

## Quick contribution (recommended)

Go to **[julearning.vercel.app/contribute](https://julearning.vercel.app/contribute)** and use the web form:
- **Single document**: Fill in title, URL, type, branch/semester/subject, and GitHub username
- **Multiple documents**: Paste a list of Drive links, configure each row, and submit

Both modes create a pull request on this repo automatically. No manual JSON editing required.

## Manual contribution

### Folder structure

```
metadata/
└── jammu-university/
    └── btech/{branch}/sem-{N}/sem-{N}-{subject-slug}/sem-{N}-{subject-slug}.json
```

Example: `jammu-university/btech/cse/sem-4/sem-4-data-structures-and-algorithms/sem-4-data-structures-and-algorithms.json`

### File format

Each JSON file is an array of document entries:

```json
[
  {
    "title": "DBMS Unit 1 Notes",
    "url": "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view",
    "type": "digital",
    "contributor": "github-username",
    "uploadedAt": "2026-07-27"
  }
]
```

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Document title |
| `url` | ✅ | Public Google Drive share link (or any URL) |
| `type` | ✅ | One of: `handwritten`, `digital`, `pyq`, `assignment`, `lab-manual`, `syllabus`, `reference-book`, `project-report`, `mixed` |
| `contributor` | | Your GitHub username |
| `thumbnailUrl` | | Direct image URL for thumbnail |
| `uploadedAt` | | Date string (e.g., `2026-07-27`) |

### Steps

1. Fork this repo
2. Navigate to the right path: `jammu-university/btech/{branch}/sem-{N}/`
3. Find or create the subject folder: `sem-{N}-{subject-slug}/`
4. Create or update the JSON file: `sem-{N}-{subject-slug}.json`
5. Open a pull request — CI validates it automatically

If the file already exists, append your entry to the existing array. Do not remove or modify other contributors' entries.

### Getting a shareable Drive link

1. Upload your file to Google Drive
2. Set sharing to **"Anyone with the link"** → **Viewer**
3. Copy the link — should look like `https://drive.google.com/file/d/.../view`

## Reporting a broken link

Click **"Report broken link"** on the website — it creates an issue in this repo automatically.

## Validation (GitHub Actions)

Automated checks run on every PR:
- Valid JSON syntax
- Must be a non-empty array
- Each entry must have `title`, `url`, and `type`
- URL must start with `https://`

## Questions?

Open an issue.
