/**
 * Migration script for flat sources: open-textbook-library, openstax,
 * project-gutenberg, wikibooks.
 *
 * Unlike jammu-university, these sources have NO folder hierarchy to infer
 * subject/branch/semester from. So those fields stay in the JSON.
 *
 * Changes:
 * - tags[] → type (single value from tags[0])
 * - Remove: language, section, chapters, pages, fileSize, description, downloads
 * - Keep: title, url, type, subject, branch, semester, contributor, uploadedAt, source
 * - Keep source-specific: license, authors, author, downloadCount
 *
 * Run: node scripts/migrate-sources.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const SOURCES = [
  "open-textbook-library",
  "openstax",
  "project-gutenberg",
  "wikibooks",
];

const TYPE_MAP = {
  notes: "mixed",
  "reference-book": "reference-book",
  pyq: "pyq",
  pyqs: "pyq",
  handwritten: "handwritten",
  typed: "digital",
  assignment: "assignment",
  "lab-manual": "lab-manual",
  syllabus: "syllabus",
  "project-report": "project-report",
};

function mapTagsToType(tags) {
  if (!tags || tags.length === 0) return "reference-book";
  const tag = tags[0].toLowerCase();
  return TYPE_MAP[tag] || "reference-book";
}

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

// Fields to keep in the simplified format
const KEEP_FIELDS = new Set([
  "title", "url", "subject", "branch", "semester",
  "contributor", "uploadedAt", "source",
  "license", "authors", "author", "downloadCount",
]);

let totalWritten = 0;
let totalSkipped = 0;

for (const source of SOURCES) {
  const sourceDir = path.join(REPO_ROOT, source);
  if (!fs.existsSync(sourceDir)) {
    console.log(`${source}: directory not found, skipping`);
    continue;
  }

  const files = fs.readdirSync(sourceDir)
    .filter((f) => f.endsWith(".json") && !f.startsWith("."))
    .map((f) => path.join(sourceDir, f));

  console.log(`\n${source}: ${files.length} files`);

  let sourceWritten = 0;

  for (const filePath of files) {
    const data = readJSON(filePath);
    if (!data) {
      console.warn(`  Skipping ${path.basename(filePath)}: could not parse`);
      totalSkipped++;
      continue;
    }

    // Detect if already in new format (no tags array, has type instead)
    if (!data.tags && data.type) {
      // Already migrated — skip
      continue;
    }

    // Build simplified object
    const simplified = {};
    for (const key of Object.keys(data)) {
      if (KEEP_FIELDS.has(key)) {
        simplified[key] = data[key];
      }
    }

    // Convert tags → type
    simplified.type = data.type || mapTagsToType(data.tags);

    // Remove old fields that shouldn't be there
    delete simplified.tags;

    // Ensure required fields exist
    if (!simplified.title) {
      console.warn(`  Skipping ${path.basename(filePath)}: missing title`);
      totalSkipped++;
      continue;
    }

    fs.writeFileSync(filePath, JSON.stringify(simplified, null, 2) + "\n", "utf-8");
    sourceWritten++;
    totalWritten++;
  }

  console.log(`  ${sourceWritten} files migrated`);
}

console.log(`\n✅ Complete. ${totalWritten} files migrated, ${totalSkipped} skipped.`);
