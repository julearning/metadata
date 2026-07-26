/**
 * Clean rebuild for jammu-university metadata.
 *
 * Run: node scripts/rebuild-jammu.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const JU_DIR = path.join(REPO_ROOT, "jammu-university");

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

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

// Step 1: Find ALL JSON files
const allFiles = [];
const orphanFiles = [];

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith(".") && entry.name !== "node_modules") scan(fullPath);
    } else if (entry.name.endsWith(".json") && !entry.name.startsWith(".")) {
      // Skip root-level files (duplicates from buggy migrations)
      if (dir === JU_DIR) {
        orphanFiles.push(fullPath);
        continue;
      }
      allFiles.push(fullPath);
    }
  }
}

console.log("Scanning jammu-university/...");
scan(JU_DIR);
console.log(`Found ${allFiles.length} valid JSON files`);

// Report orphan files (root-level duplicates) but don't process them
if (orphanFiles.length > 0) {
  console.log(`Skipped ${orphanFiles.length} root-level orphan(s):`);
  for (const f of orphanFiles) {
    console.log(`  ✗ ${path.basename(f)} (removing)`);
    fs.unlinkSync(f);
  }
}

// Step 2: Read all documents from all files
const allDocs = [];

for (const filePath of allFiles) {
  const data = readJSON(filePath);
  if (!data) {
    console.warn(`  Skipping unparseable: ${path.relative(JU_DIR, filePath)}`);
    continue;
  }

  const docs = Array.isArray(data) ? data : [data];
  const fileDir = path.dirname(filePath);
  const parentDir = path.dirname(fileDir);

  for (const doc of docs) {
    if (!doc.title || !doc.url) {
      console.warn(`  Skipping doc with missing title/url in ${path.basename(filePath)}`);
      continue;
    }

    const folderName = path.basename(fileDir);

    let subjectSlug;
    let targetDir;

    // Cross-subject detection:
    // - File is in a __sem-* folder (e.g., __sem-4-pyqs) → move to parent
    // - File is directly in a semester-N folder → stays there as cross-subject
    const isSemesterFolder = /^semester-\d+$/i.test(folderName);
    const isCrossSubjectFolder = folderName.startsWith("__sem-") || folderName.startsWith("__pyq");

    if (isSemesterFolder || isCrossSubjectFolder) {
      // Cross-subject: the folder name IS the subject
      subjectSlug = slugify(folderName.replace(/^__/, ""));
      targetDir = isCrossSubjectFolder ? parentDir : fileDir;
    } else {
      // Subject-specific file
      subjectSlug = slugify(folderName);
      targetDir = fileDir;
    }

    allDocs.push({
      targetDir,
      subjectSlug,
      contributor: doc.contributor || "unknown",
      title: doc.title.trim(),
      url: doc.url,
      type: doc.type || "mixed",
      uploadedAt: doc.uploadedAt || "",
    });
  }
}

console.log(`\nRead ${allDocs.length} documents total`);

// Step 3: Group by (targetDir, subjectSlug, contributor)
const groups = {};
for (const doc of allDocs) {
  const key = `${doc.targetDir}::${doc.subjectSlug}::${doc.contributor}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(doc);
}

console.log(`Grouped into ${Object.keys(groups).length} files`);

// Step 4: Write merged files FIRST (before deleting old files)
console.log("\nWriting merged files...");
const writtenFiles = [];
for (const [key, docs] of Object.entries(groups)) {
  const [targetDir, subjectSlug, contributor] = key.split("::");
  const fileName = `${subjectSlug}-${slugify(contributor)}.json`;

  const simplified = docs.map((d) => ({
    title: d.title,
    url: d.url,
    type: d.type,
    contributor: d.contributor,
    uploadedAt: d.uploadedAt,
  }));
  simplified.sort((a, b) => a.title.localeCompare(b.title));

  const outputPath = path.join(targetDir, fileName);
  fs.writeFileSync(outputPath, JSON.stringify(simplified, null, 2), "utf-8");
  writtenFiles.push(outputPath);
  console.log(`  ✓ ${path.relative(JU_DIR, outputPath)} (${docs.length} doc${docs.length > 1 ? "s" : ""})`);
}

// Step 5: Delete old files that are NOT the new ones
console.log("\nCleaning old files...");
let deletedCount = 0;
for (const filePath of allFiles) {
  if (!writtenFiles.includes(filePath)) {
    fs.unlinkSync(filePath);
    deletedCount++;
    console.log(`  ✗ ${path.basename(filePath)}`);
  }
}

console.log(`\n✅ Complete. ${Object.keys(groups).length} files written, ${deletedCount} old files deleted.`);
