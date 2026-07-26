/**
 * Migration script for jammu-university metadata.
 *
 * Step 1: Find all old-format JSON files in jammu-university/
 * Step 2: Convert each to simplified format (type instead of tags, no extra fields)
 * Step 3: Group by (directory, subjectSlug, contributor) — merge into arrays
 * Step 4: Write new files as {subjectSlug}-{contributor}.json in the target directory
 * Step 5: Delete all old-format files
 *
 * Run: node scripts/migrate-jammu.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const JU_DIR = path.join(REPO_ROOT, "jammu-university");

const TYPE_MAP = {
  pyq: "pyq",
  pyqs: "pyq",
  handwritten: "handwritten",
  "hand written": "handwritten",
  typed: "digital",
  notes: "mixed",
  assignment: "assignment",
  assign: "assignment",
  "lab-manual": "lab-manual",
  syllabus: "syllabus",
  "reference-book": "reference-book",
  "project-report": "project-report",
  "past year": "pyq",
  "question paper": "pyq",
  exam: "pyq",
};

function slugify(text) {
  if (!text) return "unknown";
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function mapTagsToType(tags) {
  if (!tags || tags.length === 0) return "mixed";
  const tag = tags[0].toLowerCase();
  return TYPE_MAP[tag] || "mixed";
}

function isOldFormatFile(filePath) {
  // Old files have the cse-semX- prefix pattern
  const name = path.basename(filePath);
  return name.startsWith("cse-sem") || name.startsWith("cse-sem");
}

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

// Step 1: Find all JSON files
const allFiles = [];

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith(".")) scan(fullPath);
    } else if (entry.name.endsWith(".json") && !entry.name.startsWith(".")) {
      allFiles.push(fullPath);
    }
  }
}

console.log("Scanning jammu-university/...");
scan(JU_DIR);
console.log(`Found ${allFiles.length} JSON files`);

// Step 2: For each old-format file, parse and track
const newEntries = []; // { dir, subjectSlug, contributor, title, url, type, uploadedAt }
const oldFiles = [];   // paths to delete

const seenFiles = new Set();

for (const filePath of allFiles) {
  const data = readJSON(filePath);
  if (!data) {
    console.warn(`  Skipping unparseable: ${filePath}`);
    continue;
  }

  const dir = path.dirname(filePath);
  const fileName = path.basename(filePath);

  // Check if this is already a new-format file (starts with subject-contributor pattern)
  const isNewFormat = !isOldFormatFile(filePath) && data.type && !data.branch && !data.tags;

  if (isNewFormat) {
    console.log(`  Already new format: ${fileName}`);
    continue;
  }

  // Parse old format
  if (!data.title || !data.url) {
    console.warn(`  Skipping ${fileName}: missing title or url`);
    continue;
  }

  // Determine subject slug from the data.subject field, or infer from folder
  let subjectSlug;
  if (data.subject) {
    subjectSlug = slugify(data.subject);
  } else {
    // Infer from parent folder name
    const folderName = path.basename(dir);
    subjectSlug = slugify(folderName);
  }

  const contributor = data.contributor || "unknown";
  const type = data.type || mapTagsToType(data.tags);
  const uploadedAt = data.uploadedAt || new Date().toISOString().split("T")[0];

  newEntries.push({
    dir,
    subjectSlug,
    contributor,
    title: data.title.trim(),
    url: data.url,
    type,
    uploadedAt,
  });

  oldFiles.push(filePath);
  console.log(`  Parsed: ${fileName} → type=${type} subject=${subjectSlug} contributor=${contributor}`);
}

console.log(`\nParsed ${newEntries.length} documents from old format`);

// Step 3: Group by (dir, subjectSlug, contributor) — merge into arrays
const groups = {};
for (const entry of newEntries) {
  const key = `${entry.dir}::${entry.subjectSlug}::${entry.contributor}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(entry);
}

console.log(`Will produce ${Object.keys(groups).length} merged JSON files\n`);

// Step 4: Write new files
for (const [key, entries] of Object.entries(groups)) {
  const [dir, subjectSlug, contributor] = key.split("::");
  const fileName = `${subjectSlug}-${slugify(contributor)}.json`;

  const simplified = entries.map((e) => ({
    title: e.title,
    url: e.url,
    type: e.type,
    contributor: e.contributor,
    uploadedAt: e.uploadedAt,
  }));

  const outputPath = path.join(dir, fileName);
  fs.writeFileSync(outputPath, JSON.stringify(simplified, null, 2), "utf-8");
  console.log(`  Wrote ${fileName} (${entries.length} doc${entries.length > 1 ? "s" : ""})`);
}

// Step 5: Delete old files
console.log("\nDeleting old format files...");
for (const filePath of oldFiles) {
  fs.unlinkSync(filePath);
  console.log(`  Deleted: ${path.basename(filePath)}`);
}

// Step 6: Report
console.log(`\n✅ Migration complete.`);
console.log(`  Deleted ${oldFiles.length} old files`);
console.log(`  Wrote ${Object.keys(groups).length} new files`);
