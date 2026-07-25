# Contributing to JU Learning

Thank you for wanting to contribute! Every document is submitted through a GitHub Pull Request.

## Folder Structure

Metadata is organized in a tree structure that mirrors Google Drive:

```
metadata/
├── cse/
│   ├── semester-3/
│   │   ├── dbms/
│   │   │   ├── notes-unit-1-5.json
│   │   │   └── pyq-2020-2024.json
│   │   └── data-structures/
│   │       └── notes-complete.json
│   └── semester-4/
│       └── operating-systems/
│           └── notes-complete.json
├── ece/
│   └── ...
├── ee/
│   └── ...
├── me/
│   └── ...
└── ce/
    └── ...
```

## How to Add a Document

### 1. Upload your file

Upload your PDF to Google Drive (or any cloud storage). Set the share link to **"Anyone with the link can view"**.

### 2. Create the metadata JSON

Navigate to the correct folder based on the document's branch, semester, and subject. If the folder doesn't exist, create it.

Create a JSON file with the following structure:

```json
{
  "id": "cse-s3-dbms-notes-1",
  "title": "DBMS Complete Notes - Unit 1 to 5",
  "description": "Brief description of what this document covers.",
  "url": "https://drive.google.com/file/d/your-file-id/view",
  "fileType": "pdf",
  "fileSize": 4200000,
  "branch": "CSE",
  "degree": "B.Tech",
  "semester": 3,
  "subject": "Database Management Systems",
  "topic": "Transaction Processing",
  "tags": ["notes", "typed"],
  "contributor": "your-github-username",
  "uploadedAt": "2025-08-15T10:30:00Z",
  "verified": false
}
```

### 3. Open a Pull Request

1. Fork the repository
2. Add your JSON file to the correct folder
3. Open a Pull Request
4. A maintainer will review and merge

## ID Convention

```
{branch}-s{semester}-{subject-keyword}-{type}-{number}
```

Example: `cse-s3-dbms-notes-1`

## Tags Reference

| Tag | Description |
|-----|-------------|
| `notes` | Subject notes/study material |
| `pyq` | Previous year question papers |
| `assignment` | Assignment problems and solutions |
| `lab-manual` | Lab experiment guides |
| `syllabus` | Course syllabus |
| `handwritten` | Handwritten notes |
| `typed` | Typed/digital notes |
| `reference-book` | Reference books |
| `project-report` | Project reports |

## Valid Branches

- `CSE`, `ECE`, `EE`, `ME`, `CE`

## Reporting Broken Links

Click the flag icon on any document to open a pre-filled GitHub Issue.
