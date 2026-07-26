/**
 * Open Textbook Library — Aggregation Adapter
 *
 * Fetches textbooks from the OTL REST API, filters by engineering/math/CS
 * subjects, maps to JU's branch/semester/subject structure, and generates
 * atomic JSON files in ../open-textbook-library/.
 *
 * Usage:  node scripts/aggregate-open-textbook-library.mjs
 * Output: ../open-textbook-library/{slug}.json
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../open-textbook-library");
const API_BASE = "https://open.umn.edu/opentextbooks/textbooks.json";

/** Subjects we care about — engineering, math, CS, physics, chemistry */
const RELEVANT_KEYWORDS = [
  "mathematics", "calculus", "algebra", "statistics", "linear algebra",
  "computer science", "programming", "software", "data structures", "algorithms",
  "engineering", "physics", "chemistry", "biology",
  "electrical", "mechanical", "civil", "chemical",
  "signal processing", "digital logic", "computer networks",
  "operating systems", "database",
];

/** Maps subject keywords to JU branch/semester/subject */
const SUBJECT_MAP = [
  { keywords: ["calculus", "differential", "integral"], branch: "CSE", semester: 1, subject: "Mathematics-I" },
  { keywords: ["linear algebra", "matrix"], branch: "CSE", semester: 2, subject: "Mathematics-II" },
  { keywords: ["statistics", "probability"], branch: "CSE", semester: 3, subject: "Probability & Statistics" },
  { keywords: ["physics", "university physics", "college physics"], branch: "CSE", semester: 1, subject: "Engineering Physics" },
  { keywords: ["chemistry", "general chemistry"], branch: "CSE", semester: 1, subject: "Engineering Chemistry" },
  { keywords: ["programming", "java", "python", "c++", "computer science"], branch: "CSE", semester: 1, subject: "Programming for Problem Solving" },
  { keywords: ["data structures", "algorithms"], branch: "CSE", semester: 3, subject: "Data Structures & Algorithms" },
  { keywords: ["database", "sql"], branch: "CSE", semester: 4, subject: "Database Management Systems" },
  { keywords: ["operating systems"], branch: "CSE", semester: 4, subject: "Operating Systems" },
  { keywords: ["computer networks", "networking", "data communication"], branch: "CSE", semester: 5, subject: "Computer Networks" },
  { keywords: ["software engineering"], branch: "CSE", semester: 5, subject: "Software Engineering" },
  { keywords: ["digital logic", "digital design", "computer organization"], branch: "CSE", semester: 3, subject: "Digital Logic & Design" },
  { keywords: ["signal processing", "signals and systems"], branch: "ECE", semester: 4, subject: "Signals & Systems" },
  { keywords: ["electrical", "circuit", "electronics"], branch: "ECE", semester: 3, subject: "Electronic Devices & Circuits" },
  { keywords: ["mechanical", "thermodynamics", "fluid mechanics"], branch: "ME", semester: 3, subject: "Thermodynamics" },
  { keywords: ["civil", "structural", "geotechnical"], branch: "CE", semester: 3, subject: "Structural Analysis" },
  { keywords: ["biology", "life sciences"], branch: "CSE", semester: 1, subject: "Biology for Engineers" },
  { keywords: ["mathematics", "math"], branch: "CSE", semester: 1, subject: "Mathematics-I" },
  { keywords: ["engineering"], branch: "CSE", semester: 1, subject: "Engineering Fundamentals" },
];

function isRelevant(subjectNames) {
  const joined = subjectNames.join(" ").toLowerCase();
  return RELEVANT_KEYWORDS.some((kw) => joined.includes(kw));
}

function mapSubject(subjectNames, title) {
  const full = (subjectNames.join(" ") + " " + title).toLowerCase();
  for (const m of SUBJECT_MAP) {
    if (m.keywords.some((kw) => full.includes(kw))) {
      return m;
    }
  }
  return null;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

async function fetchPage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

function getPdfUrl(formats) {
  if (!formats) return null;
  const pdf = formats.find((f) => f.type === "PDF");
  return pdf?.url || null;
}

function getOnlineUrl(formats) {
  if (!formats) return null;
  const online = formats.find((f) => f.type === "Online");
  return online?.url || null;
}

async function main() {
  console.log("Fetching Open Textbook Library catalog...");

  // Fetch first page to get pagination info
  const firstPage = await fetchPage(API_BASE);
  const totalPages = firstPage.links?.total_pages || 1;
  console.log(`Total pages: ${totalPages}`);

  const allBooks = [...firstPage.data];

  // Fetch remaining pages sequentially (polite crawling)
  for (let page = 2; page <= Math.min(totalPages, 10); page++) {
    // Limit to 10 pages (~100 books) for MVP
    const url = `${API_BASE}?page=${page}`;
    const data = await fetchPage(url);
    allBooks.push(...data.data);
    console.log(`  Page ${page}/${totalPages}: +${data.data.length} books`);
    // Polite delay
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\nTotal books fetched: ${allBooks.length}`);
  console.log("Filtering for relevant subjects...");

  // Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let generated = 0;
  let skipped = 0;

  for (const book of allBooks) {
    const subjectNames = (book.subjects || []).map((s) => s.name || "");
    const title = book.title || "";

    if (!isRelevant(subjectNames) && !isRelevant([title])) {
      skipped++;
      continue;
    }

    const mapped = mapSubject(subjectNames, title);
    if (!mapped) {
      skipped++;
      continue;
    }

    const pdfUrl = getPdfUrl(book.formats);
    const onlineUrl = getOnlineUrl(book.formats);
    const downloadUrl = pdfUrl || onlineUrl;

    if (!downloadUrl) {
      skipped++;
      continue;
    }

    // Build the atomic JSON
    const doc = {
      title: book.title,
      url: downloadUrl,
      tags: ["notes", "reference-book"],
      subject: mapped.subject,
      branch: mapped.branch,
      semester: mapped.semester,
      section: "mixed",
      fileSize: 0,
      contributor: "content-bot",
      uploadedAt: new Date().toISOString().split("T")[0],
      description: (book.description || "").slice(0, 300) || `${book.title} — Open Textbook Library`,
      language: book.language || "English",
      pages: 0,
      source: "open-textbook-library",
    };

    const slug = slugify(title) + "-" + book.id;
    const filePath = path.join(OUTPUT_DIR, `${slug}.json`);

    // Don't overwrite existing files
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(doc, null, 2), "utf-8");
      generated++;
    } else {
      skipped++;
    }
  }

  console.log(`\nDone! Generated: ${generated} files, Skipped: ${skipped}`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
