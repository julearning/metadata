# Contributing to JU Learning Metadata

Thank you for contributing. This repository contains the study material directory for JU Learning — the website reads it at build time and generates static pages.

## How it works

Every study material link is stored as a JSON file. The website clones this repo during build, reads every JSON, flattens them into documents, and indexes them for search.

```
metadata/
├── jammu-university/              ← Folder = source name
│   ├── btech/
│   │   ├── cse/
│   │   │   ├── semester-3/
│   │   │   │   ├── web-tech/
│   │   │   │   │   └── web-tech-aryanbatras.json    ← merged per subject+contributor
│   │   │   │   └── sem-4-pyqs/
│   │   │   │       └── sem-4-pyqs-aryanbatras.json  ← cross-subject file
│   │   │   └── semester-4/
│   │   │       └── java/
│   │   │           └── java-aryanbatras.json
│   │   ├── ece/
│   │   └── ...
│   ├── bca/
│   └── mca/
├── open-textbook-library/         ← Flat (no folder hierarchy)
├── openstax/
├── project-gutenberg/
└── wikibooks/
```

### Folder structure (jammu-university only)

```
jammu-university/{degree}/{branch}/{semester-N}/{subject-folder}/{subject}-{contributor}.json
```

- **Degree**: `btech`, `bca`, `mca` (lowercase)
- **Branch**: `cse`, `ece`, `ee`, `me`, `ce` (lowercase)
- **Semester**: `semester-1` through `semester-8`
- **Subject folder**: hyphenated lower-case (e.g., `web-tech`, `database-management-systems`)
- **File naming**: `{subject-slug}-{github-username}.json`

The folder path defines the document's degree, branch, semester, and subject. The JSON file itself only contains document-level fields.

#### Cross-subject files

If a document applies to all subjects in a semester (e.g., a common PYQ set), place the file directly in the semester folder (not inside a subject folder). Name it `sem-{N}-{description}-{contributor}.json`:

```
semester-4/
├── java/
│   └── java-aryanbatras.json
└── sem-4-pyqs-aryanbatras.json    ← semester-wide PYQs
```

## JSON format

### Simplified format (preferred for jammu-university)

Each JSON file is an array of documents. All documents in the same file must belong to the same subject folder and contributor.

```json
[
  {
    "title": "DBMS Unit 1 Notes",
    "url": "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view",
    "type": "handwritten",
    "contributor": "your-github-username",
    "uploadedAt": "2026-07-26"
  },
  {
    "title": "ER Diagram Assignment",
    "url": "https://drive.google.com/file/d/2BcDeFgHiJkLmNoPqRsTuVwXyZ/view",
    "type": "assignment",
    "contributor": "your-github-username",
    "uploadedAt": "2026-07-25"
  }
]
```

#### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Full document title |
| `url` | ✅ | Public link (Google Drive, OneDrive, Dropbox, etc.) |
| `type` | ✅ | One of: `handwritten`, `digital`, `pyq`, `assignment`, `lab-manual`, `syllabus`, `reference-book`, `project-report`, `mixed` |
| `contributor` | | Your GitHub username |
| `uploadedAt` | | Date string (e.g., `2026-07-26`) |

#### Type reference

| Type | Meaning |
|------|---------|
| `handwritten` | Handwritten notes (scanned) |
| `digital` | Typed/printed notes or study material |
| `pyq` | Previous year question paper |
| `assignment` | Assignment questions |
| `lab-manual` | Lab manual / practical file |
| `syllabus` | Syllabus document |
| `reference-book` | Reference book or textbook |
| `project-report` | Project report |
| `mixed` | Mixed or unspecified type |

### Flat-source format (open-textbook-library, openstax, project-gutenberg, wikibooks)

These sources are flat (no folder hierarchy), so they keep extra fields that identify the content:

```json
{
  "title": "Algebra and Trigonometry",
  "url": "https://open.umn.edu/opentextbooks/textbooks/...",
  "type": "reference-book",
  "subject": "Mathematics-I",
  "contributor": "content-bot",
  "uploadedAt": "2026-07-26",
  "source": "openstax",
  "license": "CC BY-NC-SA 4.0"
}
```

Extra fields for non-JU sources:
- `subject` — general subject area (not tied to a specific branch/semester)
- `source` — source identifier (auto-inferred from folder, stored for filtering)
- `license`, `authors`, `author`, `downloadCount` — as applicable from the source

### Key rules

1. **No `tags` array** — use a single `type` field instead
2. **No `language` field** — always English unless specified otherwise
3. **No `section` or `chapters`** — folder structure defines hierarchy
4. **No `fileSize` or `pages`** — not required for link-only metadata
5. **Folder defines hierarchy** — branch, semester, subject are inferred from the file's path

## Quick method: Bulk-generate from Google Drive

The website has a built-in tool at `/automation/drive` that converts a list of Drive links into the correct JSON format.

### Step 0: Make the folder public

1. Create a new folder in Google Drive (e.g., "JU Learning Upload")
2. Right-click the folder → **Share** → **General access** → **Anyone with the link** → **Viewer**
3. Drop your files into this folder — they automatically inherit the folder's public visibility

### Step 1: Get your Drive links

1. Open the folder in **List view** (View → List or press `Ctrl+Shift+6`)
2. Install the [Google Drive Link Getter](https://chromewebstore.google.com/detail/Google%20Drive%20Link%20Getter/pcepfnopeaalfdibnbflpphaapbfoicl) Chrome extension
3. Click the extension icon — it will list all files with names and public URLs
4. Copy the entire list (tab-separated: `FileName\tURL`)

### Step 2: Generate JSON files

1. Go to **julearning.vercel.app/automation/drive**
2. Paste the copied list into the textarea
3. Enter your GitHub username
4. Select the type and subject for each document
5. The tool merges documents by subject and generates `{subject}-{username}.json` files
6. Download the generated JSON files

### Step 3: Place in the correct folder

1. Clone this repository
2. Place each JSON file in the correct folder:
   ```
   jammu-university/btech/{branch}/semester-{N}/{subject-folder}/{subject}-{username}.json
   ```
3. Commit and open a pull request

## File naming convention

Files are named as `{subject-slug}-{username}.json`:

| Subject | Username | Filename |
|---------|----------|----------|
| Web Tech | aryanbatras | `web-tech-aryanbatras.json` |
| Java | aryanbatras | `java-aryanbatras.json` |
| Sem 4 PYQs | aryanbatras | `sem-4-pyqs-aryanbatras.json` |

**Why this naming:**
- If a user's files become dead links, all their files can be found by their username
- Subject prefix prevents collisions across different subjects
- Multiple docs from the same contributor in the same subject stay in one file

## Storage and format agnostic

This project **does not host files**. Every `url` field is a third-party link — Google Drive, OneDrive, Dropbox, or any publicly accessible URL.

The metadata format is also storage-agnostic: the repository can contain any number of source folders (`jammu-university/`, `open-textbook-library/`, etc.), each with its own folder hierarchy. The website discovers all sources automatically.

## Reporting a broken link

If you find a document with a broken link:

1. Click **"Report broken link"** on the website — it pre-fills an issue
2. Or open an issue directly with the document title and file path

Since files are named by contributor, it's easy to identify and remove all dead files from a specific user.

## Validation rules (GitHub Actions)

When you submit a PR, automated checks verify:

- ✅ JSON is valid and parsable
- ✅ `title` and `url` fields are present
- ✅ `type` is from the allowed list
- ✅ URL format is valid (Google Drive, docs URL, or general web link)
- ✅ File name follows `{subject}-{username}.json` pattern (for JU source)
- ✅ Subject folder exists in the expected path

## Example

See the existing files under `jammu-university/btech/cse/semester-*/` for examples.

## Questions?

Open an issue or join our community.
