"""
Internet Archive — Aggregation Adapter

Searches the Internet Archive for engineering/math/CS textbooks with
permissive licenses (Public Domain, CC), maps to JU's branch/semester/subject
structure, and generates atomic JSON files in ../internet-archive/.

Usage:  python3 scripts/aggregate-internet-archive.py
Output: ../internet-archive/{slug}.json
"""

import os
import sys
import json
import re
import time
import hashlib
from pathlib import Path

from internetarchive import search_items, get_item

SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR.parent / "internet-archive"

# Search queries for engineering subjects
SEARCH_QUERIES = [
    # Engineering textbooks - most popular first
    # Filter by permissive license in code, not in query (IA's licenseurl field is unreliable)
    'subject:"engineering" AND mediatype:texts AND language:eng',
    'subject:"computer science" AND mediatype:texts AND language:eng',
    'subject:"mathematics" AND mediatype:texts AND language:eng',
    'subject:"physics" AND mediatype:texts AND language:eng',
    'subject:"calculus" AND mediatype:texts AND language:eng',
    'subject:"programming" AND mediatype:texts AND language:eng',
    'subject:"data structures" AND mediatype:texts AND language:eng',
    'subject:"algorithms" AND mediatype:texts AND language:eng',
    'subject:"database" AND mediatype:texts AND language:eng',
    'subject:"operating systems" AND mediatype:texts AND language:eng',
    'subject:"electronics" AND mediatype:texts AND language:eng',
    'subject:"electrical engineering" AND mediatype:texts AND language:eng',
    'subject:"mechanical engineering" AND mediatype:texts AND language:eng',
]

# Map subject keywords to JU branch/semester/subject
SUBJECT_MAP = [
    (["calculus", "differential", "integral"], "CSE", 1, "Mathematics-I"),
    (["linear algebra", "matrix", "vector space"], "CSE", 2, "Mathematics-II"),
    (["statistics", "probability"], "CSE", 3, "Probability & Statistics"),
    (["physics", "mechanics", "thermodynamics", "electromagnetism"], "CSE", 1, "Engineering Physics"),
    (["chemistry"], "CSE", 1, "Engineering Chemistry"),
    (["programming", "python", "java", "c++", "javascript", "algorithms", "data structures"], "CSE", 1, "Programming for Problem Solving"),
    (["data structures", "algorithms"], "CSE", 3, "Data Structures & Algorithms"),
    (["database", "sql", "dbms"], "CSE", 4, "Database Management Systems"),
    (["operating systems"], "CSE", 4, "Operating Systems"),
    (["computer network", "networking", "data communication"], "CSE", 5, "Computer Networks"),
    (["software engineering"], "CSE", 5, "Software Engineering"),
    (["machine learning", "artificial intelligence", "deep learning", "neural"], "CSE", 6, "Machine Learning"),
    (["digital logic", "digital design", "computer architecture"], "CSE", 3, "Digital Logic & Design"),
    (["signal processing", "signals and systems"], "ECE", 4, "Signals & Systems"),
    (["electronics", "circuit", "electrical", "semiconductor"], "ECE", 3, "Electronic Devices & Circuits"),
    (["mechanical", "thermodynamics", "fluid mechanics"], "ME", 3, "Thermodynamics"),
    (["civil", "structural", "geotechnical"], "CE", 3, "Structural Analysis"),
    (["mathematics", "math", "algebra"], "CSE", 1, "Mathematics-I"),
    (["discrete mathematics"], "CSE", 3, "Discrete Mathematics"),
    (["engineering"], "CSE", 1, "Engineering Fundamentals"),
]


def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    return text[:60]


def map_subject(title, subjects, description):
    text = (title + " " + " ".join(subjects) + " " + (description or "")).lower()
    for keywords, branch, semester, subject in SUBJECT_MAP:
        if any(kw in text for kw in keywords):
            return branch, semester, subject
    return None


def is_permissive_license(item):
    """Check if the item has a permissive license."""
    md = item.item_metadata
    license_url = md.get('metadata', {}).get('licenseurl', '')
    rights = md.get('metadata', {}).get('rights', '')
    
    permissive_patterns = [
        'creativecommons.org/licenses/',
        'creativecommons.org/publicdomain/',
        'public domain',
        'cc0',
    ]
    
    license_text = (license_url + " " + rights).lower()
    return any(p in license_text for p in permissive_patterns)


def main():
    print("Internet Archive — Aggregation Adapter")
    print(f"Output: {OUTPUT_DIR}")
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    seen_ids = set()
    all_results = []
    
    for query in SEARCH_QUERIES:
        print(f"\nSearching: {query[:80]}...")
        try:
            search = search_items(query, params={'rows': 100, 'sort': ['downloads desc']})
            count = 0
            for result in search:
                identifier = result.get('identifier', '')
                if identifier and identifier not in seen_ids:
                    seen_ids.add(identifier)
                    all_results.append(result)
                    count += 1
                time.sleep(2)  # Polite delay
            print(f"  Found {count} new items")
        except Exception as e:
            print(f"  Error: {e}")
        
        time.sleep(5)  # Delay between queries
    
    print(f"\nTotal unique items: {len(all_results)}")
    print("Fetching metadata and filtering...")
    
    generated = 0
    skipped = 0
    
    for result in all_results:
        identifier = result.get('identifier', '')
        title = result.get('title', '') or result.get('name', '') or result.get('creator', '')
        subjects = result.get('subject', [])
        if isinstance(subjects, str):
            subjects = [subjects]
        description = result.get('description', '') or ''
        
        if not title or not identifier:
            skipped += 1
            continue
        
        # Get full metadata
        try:
            item = get_item(identifier)
            md = item.item_metadata.get('metadata', {})
            time.sleep(0.5)
        except Exception:
            skipped += 1
            continue
        
        # Check license
        if not is_permissive_license(item):
            skipped += 1
            continue
        
        # Map subject
        mapped = map_subject(title, subjects, description)
        if not mapped:
            skipped += 1
            continue
        
        branch, semester, subject = mapped
        
        # Get download URL
        downloads = item.item_metadata.get('item', {}).get('downloads', 0)
        
        # Build URL to the item's details page (IA doesn't allow rehosting PDFs)
        archive_url = f"https://archive.org/details/{identifier}"
        
        # Get file size from the first PDF if available
        file_size = 0
        files = item.item_metadata.get('files', [])
        for f in files:
            name = f.get('name', '')
            if name.lower().endswith('.pdf'):
                file_size = f.get('size', 0)
                break
        
        doc = {
            "title": title[:200],
            "url": archive_url,
            "tags": ["notes", "reference-book"],
            "subject": subject,
            "branch": branch,
            "semester": semester,
            "section": "mixed",
            "fileSize": file_size,
            "contributor": "content-bot",
            "uploadedAt": "",
            "description": (description or title)[:300],
            "language": "English",
            "pages": 0,
            "source": "internet-archive",
        }
        
        # Generate a unique ID from the identifier
        slug = slugify(title) + "-" + hashlib.md5(identifier.encode()).hexdigest()[:8]
        file_path = OUTPUT_DIR / f"{slug}.json"
        
        if not file_path.exists():
            with open(file_path, 'w') as f:
                json.dump(doc, f, indent=2)
            generated += 1
        else:
            skipped += 1
        
        if (generated + skipped) % 50 == 0:
            print(f"  Progress: {generated} generated, {skipped} skipped")
    
    print(f"\nDone! Generated: {generated} files, Skipped: {skipped}")
    print(f"Output: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
