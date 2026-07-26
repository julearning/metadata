/**
 * Project Gutenberg — Aggregation Adapter
 *
 * Fetches textbooks from the Gutendex API (free, no auth), filters by
 * math/physics/engineering/CS subjects, maps to JU's branch/semester/subject
 * structure, and generates atomic JSON files in ../project-gutenberg/.
 *
 * Note: Project Gutenberg is a public-domain library (pre-1929 works).
 * Modern engineering/CS content is extremely limited — most results are
 * historical classics. Still useful as supplementary/reference material.
 *
 * Usage:  node scripts/aggregate-gutenberg.mjs
 * Output: ../project-gutenberg/{slug}.json
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../project-gutenberg");
const API_BASE = "https://gutendex.com/books";

/** Search queries targeting topics relevant to B.Tech curriculum */
const SEARCH_QUERIES = [
  "mathematics",
  "calculus",
  "physics",
  "engineering",
  "statistics",
  "mechanics",
  "thermodynamics",
  "electricity",
  "chemistry",
  "algebra",
  "geometry",
  "trigonometry",
  "programming",
  "computer",
  "algorithms",
  "logic",
  "science",
];

/** Keywords to determine relevance (must match one to be included) */
const RELEVANT_KEYWORDS = [
  "mathematics", "calculus", "algebra", "statistics", "geometry", "trigonometry",
  "physics", "mechanics", "thermodynamics", "electricity", "electrical",
  "engineering", "chemistry",
  "computer", "programming", "logic", "algorithms",
  "science", "dynamics", "kinematics", "optics",
];

/** Maps subject keywords to JU branch/semester/subject */
const SUBJECT_MAP = [
  { keywords: ["calculus", "differential", "integral"], branch: "CSE", semester: 1, subject: "Mathematics-I" },
  { keywords: ["algebra", "trigonometry"], branch: "CSE", semester: 1, subject: "Mathematics-I" },
  { keywords: ["linear algebra", "matrix"], branch: "CSE", semester: 2, subject: "Mathematics-II" },
  { keywords: ["statistics", "probability"], branch: "CSE", semester: 3, subject: "Probability & Statistics" },
  { keywords: ["geometry", "mathematics", "arithmetic"], branch: "CSE", semester: 1, subject: "Mathematics-I" },
  { keywords: ["mechanics", "dynamics", "kinematics", "statics"], branch: "CSE", semester: 1, subject: "Engineering Mechanics" },
  { keywords: ["optics", "waves", "electromagnetism", "thermodynamics"], branch: "CSE", semester: 1, subject: "Engineering Physics" },
  { keywords: ["electricity", "electrical", "circuit"], branch: "ECE", semester: 3, subject: "Electronic Devices & Circuits" },
  { keywords: ["chemistry"], branch: "CSE", semester: 1, subject: "Engineering Chemistry" },
  { keywords: ["computer", "programming", "logic"], branch: "CSE", semester: 1, subject: "Programming for Problem Solving" },
  { keywords: ["algorithms"], branch: "CSE", semester: 3, subject: "Data Structures & Algorithms" },
  { keywords: ["physics", "physical"], branch: "CSE", semester: 1, subject: "Engineering Physics" },
  { keywords: ["engineering"], branch: "CSE", semester: 1, subject: "Engineering Fundamentals" },
  { keywords: ["science"], branch: "CSE", semester: 1, subject: "Engineering Fundamentals" },
];

function isRelevant(subjects, title) {
  const full = (subjects.join(" ") + " " + (title || "")).toLowerCase();
  return RELEVANT_KEYWORDS.some((kw) => full.includes(kw));
}

function mapSubject(subjects, title) {
  const full = (subjects.join(" ") + " " + (title || "")).toLowerCase();
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

async function fetchPage(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
      return res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(`  Retry ${attempt}/${retries}...`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

function getLanguageDisplay(languages) {
  if (!languages || languages.length === 0) return "English";
  const map = { en: "English", fr: "French", de: "German", es: "Spanish", it: "Italian" };
  return map[languages[0]] || languages[0];
}

async function main() {
  console.log("Fetching Project Gutenberg catalog via Gutendex API...");
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const seen = new Set();
  let generated = 0;
  let skipped = 0;
  let totalRelevant = 0;

  // Search for each topic and collect unique books
  for (let qi = 0; qi < SEARCH_QUERIES.length; qi++) {
    const query = SEARCH_QUERIES[qi];
    let nextUrl = `${API_BASE}?search=${encodeURIComponent(query)}&sort=popularity`;
    let pageNum = 1;

    process.stdout.write(`\nQuery ${qi + 1}/${SEARCH_QUERIES.length}: \"${query}\"`);

    const MAX_PAGES = 5; // Limit to 5 pages (500 books) per query to avoid timeouts

    while (nextUrl && pageNum <= MAX_PAGES) {
      const data = await fetchPage(nextUrl);
      const books = data.results || [];

      if (pageNum === 1) {
        process.stdout.write(` (${data.count} total results, max ${MAX_PAGES} pages)`);
      }

      for (const book of books) {
        if (seen.has(book.id)) continue;
        seen.add(book.id);

        const subjects = book.subjects || [];
        const title = book.title || "";

        if (!isRelevant(subjects, title)) {
          skipped++;
          continue;
        }

        const mapped = mapSubject(subjects, title);
        if (!mapped) {
          skipped++;
          continue;
        }

        // IMPORTANT: Link to the canonical landing page per Project Gutenberg's policy
        // (direct file URLs are not allowed — they require linking to the ebook page)
        const canonicalUrl = `https://www.gutenberg.org/ebooks/${book.id}`;
        if (!canonicalUrl) {
          skipped++;
          continue;
        }

        totalRelevant++;

        // Build description from subjects
        const description = subjects.slice(0, 5).join("; ") || `${title} — Project Gutenberg`;

        // Get author
        const author = (book.authors || [])
          .map((a) => a.name || "")
          .filter(Boolean)
          .join(", ");

        const doc = {
          title: book.title,
          url: canonicalUrl,
          tags: ["notes", "reference-book"],
          subject: mapped.subject,
          branch: mapped.branch,
          semester: mapped.semester,
          section: "mixed",
          fileSize: 0,
          contributor: "content-bot",
          uploadedAt: "",  // Gutendex doesn't provide upload dates
          description: description.slice(0, 300),
          language: getLanguageDisplay(book.languages),
          pages: 0,
          source: "project-gutenberg",
          author,
          downloadCount: book.download_count || 0,
          license: "Public Domain",
        };

        const fileSlug = slugify(title) + "-" + book.id;
        const filePath = path.join(OUTPUT_DIR, `${fileSlug}.json`);

        // Don't overwrite existing
        if (fs.existsSync(filePath)) {
          skipped++;
          continue;
        }

        fs.writeFileSync(filePath, JSON.stringify(doc, null, 2), "utf-8");
        generated++;
      }

      nextUrl = data.next || null;
      if (nextUrl) {
        await new Promise((r) => setTimeout(r, 500));
        pageNum++;
      }
    }
  }

  console.log(`\n\nDone!`);
  console.log(`  Unique books checked: ${seen.size}`);
  console.log(`  Relevant: ${totalRelevant}`);
  console.log(`  Generated: ${generated} files`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Output: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error("\nFailed:", err);
  process.exit(1);
});
