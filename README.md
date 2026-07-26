# JU Learning — Metadata

Study material directory for JU Learning. The website reads this repo at build time and generates static pages.

- **Website:** [julearning.vercel.app](https://julearning.vercel.app)
- **Organization:** [github.com/julearning](https://github.com/julearning)

---

## Sources

| Folder | Documents | Hierarchy | Description |
|--------|-----------|-----------|-------------|
| `jammu-university/` | ~30 | `degree/branch/semester/subject/` | Curriculum-specific notes, PYQs, assignments from JU students and alumni |
| `open-textbook-library/` | 631 | Flat | Openly licensed textbooks from the Open Textbook Library |
| `openstax/` | 56 | Flat | Free peer-reviewed textbooks from OpenStax (Rice University) |
| `project-gutenberg/` | 524 | Flat | Out-of-copyright math and CS books from Project Gutenberg |
| `wikibooks/` | 401 | Flat | Freely available textbooks from Wikibooks (Wikimedia) |

**Total: ~1,600+ documents** across all sources.

---

## Structure

### For JU-sourced content (curriculum-aligned)

```
metadata/
└── jammu-university/
    └── btech/              ← degree
        ├── cse/            ← branch
        │   ├── semester-3/
        │   │   ├── web-tech/
        │   │   │   └── web-tech-aryanbatras.json
        │   │   └── sem-4-pyqs-aryanbatras.json    ← cross-subject
        │   └── semester-4/
        │       ├── java/
        │       │   └── java-aryanbatras.json
        │       └── ...
        ├── ece/
        └── ...
    ├── bca/
    └── mca/
```

The folder path defines degree, branch, semester, and subject. Each JSON file contains an array of documents from one contributor for that subject.

### For other sources (general reference)

Documents are stored in flat directories with extra fields (`subject`, `license`, `authors`, `source`) to describe the content.

---

## JSON format

### JU-sourced (simplified)

```json
[
  {
    "title": "DBMS Unit 1 Notes",
    "url": "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view",
    "type": "handwritten",
    "contributor": "aryanbatras",
    "uploadedAt": "2026-07-26"
  }
]
```

### Other sources

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

---

## How to contribute

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide on adding documents, bulk-generating from Drive, and the PR workflow.

---

## Automation

The website has a tool at `/automation/drive` that converts Google Drive link exports into properly-formatted JSON files. Works with any file type (PDF, docs, spreadsheets, presentations).

---

## License

The metadata files are made available under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/). Individual documents linked from `url` fields have their own licenses — please check the source.
