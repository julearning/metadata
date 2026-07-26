/**
 * OpenStax — Aggregation Adapter
 *
 * Fetches textbooks from the OpenStax Wagtail CMS API, filters by
 * engineering/math/CS/physics subjects, maps to JU's branch/semester/subject
 * structure, and generates atomic JSON files in ../openstax/.
 *
 * Usage:  node scripts/aggregate-openstax.mjs
 * Output: ../openstax/{slug}.json
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../openstax");
const LIST_API = "https://openstax.org/apps/cms/api/v2/pages/?type=books.Book&limit=100";

/** Subjects we care about in OpenStax catalog */
const RELEVANT_KEYWORDS = [
  "mathematics", "calculus", "algebra", "statistics", "linear algebra", "trigonometry",
  "computer science", "programming", "software",
  "engineering", "physics", "chemistry", "biology", "microbiology", "anatomy",
  "electrical", "circuits", "electronics",
  "business", "economics",
];

/** Maps subject keywords to JU branch/semester/subject */
const SUBJECT_MAP = [
  { keywords: ["calculus", "differential", "integral"], branch: "CSE", semester: 1, subject: "Mathematics-I" },
  { keywords: ["algebra", "trigonometry"], branch: "CSE", semester: 1, subject: "Mathematics-I" },
  { keywords: ["linear algebra", "matrix", "vectors"], branch: "CSE", semester: 2, subject: "Mathematics-II" },
  { keywords: ["statistics", "probability"], branch: "CSE", semester: 3, subject: "Probability & Statistics" },
  { keywords: ["physics", "university physics", "college physics"], branch: "CSE", semester: 1, subject: "Engineering Physics" },
  { keywords: ["chemistry", "general chemistry"], branch: "CSE", semester: 1, subject: "Engineering Chemistry" },
  { keywords: ["biology", "microbiology", "anatomy", "physiology", "life sciences"], branch: "CSE", semester: 1, subject: "Biology for Engineers" },
  { keywords: ["computer science", "programming", "java", "python", "c++", "software"], branch: "CSE", semester: 1, subject: "Programming for Problem Solving" },
  { keywords: ["data structures", "algorithms"], branch: "CSE", semester: 3, subject: "Data Structures & Algorithms" },
  { keywords: ["database", "sql"], branch: "CSE", semester: 4, subject: "Database Management Systems" },
  { keywords: ["operating systems"], branch: "CSE", semester: 4, subject: "Operating Systems" },
  { keywords: ["computer networks", "networking", "data communication"], branch: "CSE", semester: 5, subject: "Computer Networks" },
  { keywords: ["software engineering"], branch: "CSE", semester: 5, subject: "Software Engineering" },
  { keywords: ["digital logic", "digital design", "computer organization", "computer architecture"], branch: "CSE", semester: 3, subject: "Digital Logic & Design" },
  { keywords: ["electrical", "circuit", "electronics"], branch: "ECE", semester: 3, subject: "Electronic Devices & Circuits" },
  { keywords: ["signal processing", "signals and systems"], branch: "ECE", semester: 4, subject: "Signals & Systems" },
  { keywords: ["economics", "microeconomics", "macroeconomics"], branch: "CSE", semester: 5, subject: "Economics for Engineers" },
  { keywords: ["business", "management", "entrepreneurship"], branch: "CSE", semester: 5, subject: "Management Concepts" },
  { keywords: ["mathematics", "math"], branch: "CSE", semester: 1, subject: "Mathematics-I" },
  { keywords: ["engineering"], branch: "CSE", semester: 1, subject: "Engineering Fundamentals" },
];

function isRelevant(subjectNames, title) {
  const joined = (subjectNames.join(" ") + " " + title).toLowerCase();
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

async function fetchJSON(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
      return res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(`  Retry ${attempt}/${retries} for ${url.substring(0, 80)}...`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

async function main() {
  console.log("Fetching OpenStax catalog...");

  // Step 1: Get all book listings (paginate through all pages)
  const listData = await fetchJSON(LIST_API);
  const totalBooks = listData.meta?.total_count || listData.items?.length || 0;
  console.log(`Total books in catalog: ${totalBooks}`);

  // Paginate through all pages (Wagtail returns next_url in meta)
  let allItems = [...(listData.items || [])];
  let nextUrl = listData.meta?.next_url;
  while (nextUrl) {
    await new Promise((r) => setTimeout(r, 400));
    const page = await fetchJSON(nextUrl);
    allItems.push(...(page.items || []));
    nextUrl = page.meta?.next_url;
    process.stdout.write(`\r  Paginating... ${allItems.length}/${totalBooks} books fetched`);
  }

  const bookEntries = allItems;
  console.log(`\nFetched ${bookEntries.length} book entries from listing API`);

  // Step 2: Fetch full details for each book
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let generated = 0;
  let skipped = 0;
  let totalRelevant = 0;

  for (let i = 0; i < bookEntries.length; i++) {
    const entry = bookEntries[i];
    const title = entry.title || "";
    const detailUrl = entry.meta?.detail_url;
    const slug = entry.meta?.slug || "";

    if (!detailUrl) {
      skipped++;
      continue;
    }

    // Fetch full book details
    const book = await fetchJSON(detailUrl);

    // Extract subjects
    const subjectNames = [];
    if (Array.isArray(book.subjects)) {
      subjectNames.push(...book.subjects.map((s) => (typeof s === "string" ? s : s.title || "")));
    }

    // Quick relevance check
    if (!isRelevant(subjectNames, title)) {
      skipped++;
      process.stdout.write(`\r  Checking ${i + 1}/${bookEntries.length}... skipped (not relevant)`);
      continue;
    }

    totalRelevant++;

    // Map to JU subject
    const mapped = mapSubject(subjectNames, title);
    if (!mapped) {
      skipped++;
      process.stdout.write(`\r  Checking ${i + 1}/${bookEntries.length}... skipped (no subject match)`);
      continue;
    }

    // Get PDF URL
    const pdfUrl = book.pdf_url || "";
    const highResUrl = book.high_resolution_pdf_url || "";
    const downloadUrl = pdfUrl || highResUrl;

    if (!downloadUrl) {
      skipped++;
      process.stdout.write(`\r  Checking ${i + 1}/${bookEntries.length}... skipped (no PDF)`);
      continue;
    }

    // Build description
    let description = book.description || "";
    // If description is a dict (Wagtail streamfield), try to find text
    if (typeof description === "object") {
      try {
        const blocks = description.blocks || [];
        const textBlocks = blocks
          .filter((b) => b.type === "text")
          .map((b) => (typeof b.value === "string" ? b.value : ""))
          .join(" ")
          .trim();
        if (textBlocks) description = textBlocks;
        else description = "";
      } catch {
        description = "";
      }
    }
    if (!description) {
      description = `${book.title} — OpenStax textbook`;
    }
    description = description.slice(0, 300);

    // Get license info
    const license = book.license || "CC BY-NC-SA 4.0";

    // Get authors
    let authors = "";
    if (Array.isArray(book.authors)) {
      authors = book.authors.map((a) => (typeof a === "string" ? a : a.name || "")).filter(Boolean).join(", ");
    }

    // Build the atomic document
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
      uploadedAt: book.first_published_at ? book.first_published_at.split("T")[0] : new Date().toISOString().split("T")[0],
      description,
      language: "English",
      pages: 0,
      source: "openstax",
      license,
      authors,
    };

    const fileSlug = slugify(title) + "-" + (book.cnx_uuid || slug || book.id).slice(0, 12);
    const filePath = path.join(OUTPUT_DIR, `${fileSlug}.json`);

    // Don't overwrite existing files
    if (fs.existsSync(filePath)) {
      skipped++;
      process.stdout.write(`\r  Checking ${i + 1}/${bookEntries.length}... skipped (exists)`);
      continue;
    }

    fs.writeFileSync(filePath, JSON.stringify(doc, null, 2), "utf-8");
    generated++;

    // Polite delay between detail fetches
    await new Promise((r) => setTimeout(r, 300));

    process.stdout.write(`\r  Processing ${i + 1}/${bookEntries.length}... (${generated} generated, ${skipped} skipped, ${totalRelevant} relevant)`);
  }

  console.log(`\n\nDone!`);
  console.log(`  OpenStax catalog: ${totalBooks} books`);
  console.log(`  Relevant: ${totalRelevant}`);
  console.log(`  Generated: ${generated} files`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Output: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error("\nFailed:", err);
  process.exit(1);
});
