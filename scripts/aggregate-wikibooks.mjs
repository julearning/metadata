/**
 * Wikibooks — Aggregation Adapter
 *
 * Queries the Wikibooks MediaWiki API for computing and engineering books,
 * maps them to JU's branch/semester/subject structure, and generates
 * atomic JSON files in ../wikibooks/.
 *
 * Usage:  node scripts/aggregate-wikibooks.mjs
 * Output: ../wikibooks/{slug}.json
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../wikibooks");
const API = "https://en.wikibooks.org/w/api.php";

const HEADERS = {
  "User-Agent": "JU-Learning/1.0 (metadata aggregator; https://github.com/julearning)",
};

/** Subject keywords mapped to JU branch/semester/subject */
const SUBJECT_MAP = [
  { keywords: ["calculus", "differential", "integral"], branch: "CSE", semester: 1, subject: "Mathematics-I" },
  { keywords: ["linear algebra", "matrix"], branch: "CSE", semester: 2, subject: "Mathematics-II" },
  { keywords: ["statistics", "probability"], branch: "CSE", semester: 3, subject: "Probability & Statistics" },
  { keywords: ["physics"], branch: "CSE", semester: 1, subject: "Engineering Physics" },
  { keywords: ["chemistry"], branch: "CSE", semester: 1, subject: "Engineering Chemistry" },
  { keywords: ["programming", "python", "java", "c++", "c programming", "javascript", "ruby", "rust", "go programming"], branch: "CSE", semester: 1, subject: "Programming for Problem Solving" },
  { keywords: ["data structures", "algorithms"], branch: "CSE", semester: 3, subject: "Data Structures & Algorithms" },
  { keywords: ["database", "sql", "mysql", "nosql"], branch: "CSE", semester: 4, subject: "Database Management Systems" },
  { keywords: ["operating system"], branch: "CSE", semester: 4, subject: "Operating Systems" },
  { keywords: ["computer network", "networking", "tcp/ip", "internet"], branch: "CSE", semester: 5, subject: "Computer Networks" },
  { keywords: ["software engineering"], branch: "CSE", semester: 5, subject: "Software Engineering" },
  { keywords: ["machine learning", "artificial intelligence", "neural", "deep learning"], branch: "CSE", semester: 6, subject: "Machine Learning" },
  { keywords: ["digital logic", "digital design", "computer architecture", "computer organization"], branch: "CSE", semester: 3, subject: "Digital Logic & Design" },
  { keywords: ["signal processing", "signals and systems", "digital signal"], branch: "ECE", semester: 4, subject: "Signals & Systems" },
  { keywords: ["electronics", "circuit", "electrical"], branch: "ECE", semester: 3, subject: "Electronic Devices & Circuits" },
  { keywords: ["mechanical", "thermodynamics", "fluid"], branch: "ME", semester: 3, subject: "Thermodynamics" },
  { keywords: ["civil", "structural"], branch: "CE", semester: 3, subject: "Structural Analysis" },
  { keywords: ["mathematics", "math"], branch: "CSE", semester: 1, subject: "Mathematics-I" },
  { keywords: ["discrete mathematics", "discrete math"], branch: "CSE", semester: 3, subject: "Discrete Mathematics" },
  { keywords: ["automata", "theory of computation", "compiler", "formal language"], branch: "CSE", semester: 5, subject: "Theory of Computation" },
  { keywords: ["computer security", "cybersecurity", "cryptography", "network security"], branch: "CSE", semester: 6, subject: "Computer Security" },
  { keywords: ["web development", "html", "css", "web design"], branch: "CSE", semester: 5, subject: "Web Technologies" },
];

/** Categories to fetch books from */
const CATEGORIES = [
  "Category:Shelf:Computer_science/all_books",
  "Category:Shelf:Mathematics/all_books",
  "Category:Shelf:Engineering/all_books",
  "Category:Shelf:Physics/all_books",
  "Category:Shelf:Electrical_engineering/all_books",
  "Category:Shelf:Software_engineering/all_books",
  "Category:Shelf:Programming/all_books",
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function mapSubject(title, description) {
  const text = (title + " " + (description || "")).toLowerCase();
  for (const m of SUBJECT_MAP) {
    if (m.keywords.some((kw) => text.includes(kw))) {
      return m;
    }
  }
  return null;
}

async function api(params) {
  const url = API + "?" + new URLSearchParams({
    ...params,
    format: "json",
    origin: "*",
  }).toString();

  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function fetchCategoryMembers(category, seen) {
  const books = [];
  let cmcontinue = null;

  do {
    const params = {
      action: "query",
      list: "categorymembers",
      cmtitle: category,
      cmlimit: "max",
      cmtype: "page",
      cmprop: "title|ids",
    };
    if (cmcontinue) params.cmcontinue = cmcontinue;

    const data = await api(params);
    const pages = data.query?.categorymembers || [];

    for (const page of pages) {
      const title = page.title;
      if (!seen.has(title) && !title.includes("/")) {
        // Skip sub-pages (contain "/")
        seen.add(title);
        books.push({ title, pageid: page.pageid });
      }
    }

    cmcontinue = data.continue?.cmcontinue || null;
    await new Promise((r) => setTimeout(r, 200)); // 200ms polite delay
  } while (cmcontinue);

  return books;
}

async function getPageDescription(title) {
  try {
    const data = await api({
      action: "query",
      prop: "extracts|pageprops",
      titles: title,
      exintro: "1",
      exlimit: "1",
      explaintext: "1",
    });
    const pages = data.query?.pages || {};
    const page = Object.values(pages)[0];
    return {
      description: (page?.extract || "").slice(0, 300),
    };
  } catch {
    return { description: "", subject: "" };
  }
}

async function main() {
  console.log("Fetching Wikibooks catalog...");

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const seen = new Set();
  let allBooks = [];

  for (const cat of CATEGORIES) {
    console.log(`  Fetching ${cat}...`);
    const books = await fetchCategoryMembers(cat, seen);
    allBooks.push(...books);
    console.log(`    Found ${books.length} books (${allBooks.length} total unique)`);
  }

  console.log(`\nTotal unique books: ${allBooks.length}`);
  console.log("Fetching descriptions and mapping subjects...");

  let generated = 0;
  let skipped = 0;

  for (const book of allBooks) {
    const { description } = await getPageDescription(book.title);
    const mapped = mapSubject(book.title, description);

    if (!mapped) {
      skipped++;
      continue;
    }

    // Wikibooks URL — link to the HTML page (PDF export was decommissioned)
    const wikibooksUrl = `https://en.wikibooks.org/wiki/${encodeURIComponent(book.title.replace(/ /g, "_"))}`;

    const doc = {
      title: book.title,
      url: wikibooksUrl,
      tags: ["notes", "reference-book"],
      subject: mapped.subject,
      branch: mapped.branch,
      semester: mapped.semester,
      section: "mixed",
      fileSize: 0,
      contributor: "content-bot",
      uploadedAt: new Date().toISOString().split("T")[0],
      description: description || `${book.title} — Wikibooks open textbook`,
      language: "English",
      pages: 0,
      source: "wikibooks",
    };

    const slug = slugify(book.title) + "-" + book.pageid;
    const filePath = path.join(OUTPUT_DIR, `${slug}.json`);

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(doc, null, 2), "utf-8");
      generated++;
    } else {
      skipped++;
    }

    // Progress report every 50 books
    if ((generated + skipped) % 50 === 0) {
      console.log(`  Progress: ${generated} generated, ${skipped} skipped`);
    }

    // Polite delay between API calls
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\nDone! Generated: ${generated} files, Skipped: ${skipped}`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
