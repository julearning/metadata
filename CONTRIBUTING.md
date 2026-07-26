# Contributing to JU Learning Metadata

Thank you for contributing. This repository contains the study material directory for JU Learning — the website reads it at build time and generates static pages.

## How it works

Every study material link is stored as a JSON array (one file per document for non-JU sources, or merged per contributor for JU sources). The website clones this repo during build, reads every JSON file, flattens them into documents, and indexes them for search.

```
metadata/
├── jammu-university/                  ← JU-specific, has folder hierarchy
│   ├── btech/cse/semester-3/
│   │   └── web-tech/
│   │       └── web-tech-aryanbatras.json
│   └── btech/cse/semester-4/
│       ├── java/
│       │   └── java-aryanbatras.json
│       └── semester-4-aryanbatras.json  ← cross-subject file
├── other-sources/                     ← All non-JU sources
│   ├── wikibooks.json                 ← Source metadata (name, description, url)
│   └── wikibooks/                     ← Document files
│       ├── c-programming.json
│       ├── java-programming.json
│       └── ...
```

## Source types

### jammu-university — hierarchical

```
jammu-university/{degree}/{branch}/{semester-N}/{subject-folder}/{subject}-{contributor}.json
```

The folder path defines the document's degree, branch, semester, and subject. The JSON is an array of documents, grouped by contributor per subject.

For cross-subject files (like semester-wide PYQs), place the file directly in the semester folder:

```
semester-4/
├── java/java-aryanbatras.json
└── semester-4-aryanbatras.json      ← applies to all Semester 4 subjects
```

### other-sources/ — non-JU (flat, no hierarchy)

Each source has two parts:
1. **`other-sources/{name}.json`** — source metadata defining name, description, website URL
2. **`other-sources/{name}/`** — folder containing individual document files

Each document file is named `{title-slug}.json` (lowercase, hyphens for spaces) and contains an array with a single document:

```json
[
  {
    "title": "C Programming",
    "description": "A comprehensive guide to programming in C.",
    "url": "https://en.wikibooks.org/wiki/C_Programming"
  }
]
```

**To add a new source:**
1. Create `other-sources/{source-name}.json` with `name`, `description`, `url` fields
2. Create `other-sources/{source-name}/` folder
3. Add individual `{title-slug}.json` files (one per document)

The website discovers all sources automatically through the folder structure.

## JSON format for documents

Every JSON file must be an array of document objects. Each document supports these fields:

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Document title |
| `url` | ✅ | Public link (Google Drive, web URL, etc.) |
| `type` | ✅ | One of: `handwritten`, `digital`, `pyq`, `assignment`, `lab-manual`, `syllabus`, `reference-book`, `project-report`, `mixed` |
| `description` | | Brief description or summary |
| `contributor` | | GitHub username of the contributor |
| `thumbnailUrl` | | Direct image URL for thumbnail (e.g., Google Drive thumbnail) |
| `uploadedAt` | | Date string (e.g., `2026-07-26`) |

### Minimal example

```json
[
  {
    "title": "C Programming Guide",
    "type": "reference-book",
    "url": "https://en.wikibooks.org/wiki/C_Programming"
  }
]
```

## Quick contribution via the website

1. Go to **julearning.vercel.app/contribute**
2. Select **Single document** or **Multiple documents**
3. Fill in the details (title, Drive URL, type, contributor)
4. Click **Raise Pull Request** — it creates a PR on this repo automatically

For adding a brand-new source, select **+ New Source** and provide the source name, description, and website URL.

## File naming conventions

| Source | Pattern | Example |
|--------|---------|---------|
| jammu-university | `{subject-slug}-{contributor}.json` | `web-tech-aryanbatras.json` |
| other-sources/wikibooks | `{title-slug}.json` | `c-programming.json` |

Files named by contributor make it easy to track down dead links to a specific user.

## Storage agnostic

This project **does not host files**. Every `url` field is a third-party link — Google Drive, web pages, or any publicly accessible URL.

## Reporting a broken link

Click **"Report broken link"** on the website — it creates an issue in this repo automatically. Or open an issue directly with the document title and file path.

## Validation (GitHub Actions)

When a PR is opened, automated checks run on changed JSON files:
- Valid JSON syntax
- Must be a non-empty array
- Each entry must have `title`, `url`, and `type`
- URL must start with `https://`
- `thumbnailUrl` must start with `https://` if present

## Questions?

Open an issue or join our community.
