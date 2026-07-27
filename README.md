# JU Learning — Metadata

Study material directory for JU Learning. The website reads this repo at build time and generates static pages.

- **Website:** [julearning.com](https://julearning.com)
- **Organization:** [github.com/julearning](https://github.com/julearning)

---

## Sources

| Folder | Hierarchy | Description |
|--------|-----------|-------------|
| `jammu-university/` | `degree/branch/semester/subject/` | Curriculum-specific notes, PYQs, assignments from JU students |
| `open-textbook-library/` | Flat | Openly licensed textbooks |
| `openstax/` | Flat | Free peer-reviewed textbooks from OpenStax |
| `project-gutenberg/` | Flat | Out-of-copyright math and CS books |
| `wikibooks/` | Flat | Freely available textbooks from Wikimedia |

**Total: 2,400+ documents** across all sources.

---

## Structure

### For JU-sourced content (curriculum-aligned)

```
metadata/
└── jammu-university/
    └── btech/
        ├── cse/
        │   ├── sem-4/
        │   │   ├── sem-4-data-structures-and-algorithms/
        │   │   │   └── sem-4-data-structures-and-algorithms.json
        │   │   ├── sem-4-database-management-system/
        │   │   │   └── sem-4-database-management-system.json
        │   │   └── sem-4-java/
        │   │       └── sem-4-java.json
        │   ├── sem-5/
        │   └── ...
        ├── ece/
        └── ...
```

Path convention: `jammu-university/btech/{branch}/sem-{N}/sem-{N}-{subject-slug}/sem-{N}-{subject-slug}.json`

Each JSON file contains an array of document entries — multiple contributions are merged into a single file per subject.

### For other sources (flat, no hierarchy)

Documents are stored in flat directories with metadata files defining the source.

---

## JSON format

```json
[
  {
    "title": "DBMS Unit 1 Notes",
    "url": "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view",
    "type": "handwritten",
    "contributor": "github-username",
    "uploadedAt": "2026-07-27"
  }
]
```

### Fields

| Field | Required | Notes |
|-------|----------|-------|
| `title` | Yes | Document title |
| `url` | Yes | Public link (Google Drive or any URL) |
| `type` | Yes | One of: `handwritten`, `digital`, `pyq`, `assignment`, `lab-manual`, `syllabus`, `reference-book`, `project-report`, `mixed` |
| `contributor` | No | GitHub username |
| `thumbnailUrl` | No | Thumbnail URL (auto-generated from Drive links) |
| `uploadedAt` | No | Date string (e.g., `2026-07-27`) |

---

## How to contribute

### Web form (recommended)

Go to [julearning.com/contribute](https://julearning.com/contribute) — fill in the details and submit. A pull request is created automatically.

### Direct PR

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

The metadata files are made available under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/). Individual documents linked from `url` fields have their own licenses.
