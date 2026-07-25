#!/usr/bin/env python3
"""
Validate JU Learning metadata JSON files.

Checks:
- JSON is valid and parsable
- All required fields are present at top level
- Branch is one of CSE, ECE, EE, ME, CE
- Semester is 1-8
- Section is section-a, section-b, or mixed
- URL is a valid Google Drive link
- Tags are from the allowed list
- Subject name matches the containing folder name
- fileSize is a positive number

Usage: python3 scripts/validate-metadata.py [--dir ../metadata]
"""

import json
import os
import sys
import re
import argparse

VALID_BRANCHES = {"CSE", "ECE", "EE", "ME", "CE"}
VALID_SECTIONS = {"section-a", "section-b", "mixed"}
VALID_TAGS = {
    "notes", "pyq", "assignment", "lab-manual", "syllabus",
    "handwritten", "typed", "reference-book", "project-report",
}
ALLOWED_FIELDS = {
    "title", "url", "tags", "subject", "branch", "semester",
    "section", "chapters", "fileSize", "contributor", "uploadedAt",
    "description", "language", "pages", "downloads",
}
REQUIRED_FIELDS = {
    "title": str,
    "url": str,
    "tags": list,
    "subject": str,
    "branch": str,
    "semester": (int, float),
    "section": str,
    "fileSize": (int, float),
}

DRIVE_URL_RE = re.compile(
    r"^https://drive\.google\.com/file/d/[a-zA-Z0-9_-]+/view"
    r"(\?usp=drive_link)?$"
)
DOCS_URL_RE = re.compile(
    r"^https://docs\.google\.com/document/d/[a-zA-Z0-9_-]+/edit"
    r"(\?usp=drive_link)?$"
)

errors = []
warnings = []


def err(msg, path=""):
    tag = f" [{path}]" if path else ""
    errors.append(f"ERROR{tag}: {msg}")


def warn(msg, path=""):
    tag = f" [{path}]" if path else ""
    warnings.append(f"WARN{tag}: {msg}")


def is_skip_file(name):
    """Skip syllabus files and dotfiles."""
    name_lower = name.lower()
    return (
        name.startswith(".") or
        "syllabus" in name_lower
    )


SKIP_DIRS = {".git", "node_modules", "examples"}


def validate_document(data, filepath, rel_path):
    # Check required fields
    for field, expected_type in REQUIRED_FIELDS.items():
        if field not in data:
            err(f"Missing required field '{field}'", rel_path)
            continue

        val = data[field]
        if not isinstance(expected_type, tuple):
            expected_type = (expected_type,)

        if val is None:
            err(f"Field '{field}' is null", rel_path)
            continue

        if not isinstance(val, expected_type):
            err(
                f"Field '{field}' has wrong type: "
                f"expected {expected_type[0].__name__}, "
                f"got {type(val).__name__}",
                rel_path,
            )

    # Validate specific fields (only if present)
    if "title" in data and not data["title"]:
        err("Field 'title' is empty", rel_path)

    if "url" in data and data["url"]:
        url = data["url"]
        if not DRIVE_URL_RE.match(url) and not DOCS_URL_RE.match(url):
            warn(
                f"URL format may be invalid: {url[:60]}... "
                "(expected drive.google.com/file/d/.../view "
                "or docs.google.com/document/d/.../edit)",
                rel_path,
            )

    if "branch" in data and data["branch"] not in VALID_BRANCHES:
        err(
            f"Invalid branch '{data['branch']}'. "
            f"Must be one of {', '.join(sorted(VALID_BRANCHES))}",
            rel_path,
        )

    if "semester" in data and isinstance(data["semester"], (int, float)):
        sem = int(data["semester"])
        if sem < 1 or sem > 8:
            err(f"Semester must be 1-8, got {sem}", rel_path)

    if "section" in data and data["section"] not in VALID_SECTIONS:
        err(
            f"Invalid section '{data['section']}'. "
            f"Must be one of {', '.join(VALID_SECTIONS)}",
            rel_path,
        )

    if "tags" in data and isinstance(data["tags"], list):
        for tag in data["tags"]:
            if tag not in VALID_TAGS:
                warn(
                    f"Unknown tag '{tag}'. "
                    f"Known tags: {', '.join(sorted(VALID_TAGS))}",
                    rel_path,
                )

    if "fileSize" in data and isinstance(data["fileSize"], (int, float)):
        if data["fileSize"] < 0:
            err(f"fileSize must be non-negative, got {data['fileSize']}", rel_path)

    if "subject" in data and data["subject"]:
        # Validate subject matches folder name (case and hyphen insensitive)
        parts = filepath.split(os.sep)
        if len(parts) >= 3:
            subject_folder = parts[-2] if len(parts) >= 2 else ""
            # Normalize both: remove hyphens, spaces, compare lowercase
            expected = re.sub(r"[^a-zA-Z0-9]+", "", subject_folder).lower()
            actual = re.sub(r"[^a-zA-Z0-9]+", "", data["subject"]).lower()
            if expected and actual and expected != actual:
                warn(
                    f"Subject '{data['subject']}' doesn't match "
                    f"folder name '{subject_folder}'",
                    rel_path,
                )

    # Check for unknown fields
    for key in data:
        if key not in ALLOWED_FIELDS:
            warn(f"Unknown field '{key}'", rel_path)


def scan_and_validate(base_dir):
    """Recursively scan JSON files and validate them."""
    if not os.path.isdir(base_dir):
        err(f"Directory not found: {base_dir}")
        return

    files_found = 0
    files_valid = 0

    for root, dirs, files in os.walk(base_dir):
        # Skip hidden dirs, examples dir, and .git
        dirs[:] = [
            d for d in dirs
            if not d.startswith(".") and d not in SKIP_DIRS
        ]
        for filename in sorted(files):
            if not filename.endswith(".json") or filename.startswith("."):
                continue
            if is_skip_file(filename):
                continue

            filepath = os.path.join(root, filename)
            rel_path = os.path.relpath(filepath, base_dir)
            files_found += 1

            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except json.JSONDecodeError as e:
                err(f"Invalid JSON: {e}", rel_path)
                continue
            except Exception as e:
                err(f"Error reading file: {e}", rel_path)
                continue

            if not isinstance(data, dict):
                err("JSON root is not an object", rel_path)
                continue

            validate_document(data, filepath, rel_path)
            files_valid += 1

    return files_found, files_valid


def main():
    parser = argparse.ArgumentParser(
        description="Validate JU Learning metadata JSON files"
    )
    parser.add_argument(
        "--dir",
        default=".",
        help="Root directory of the metadata repo (default: current dir)",
    )
    args = parser.parse_args()

    base = os.path.abspath(args.dir)
    print(f"🔍 Scanning {base} for metadata files...")
    print()

    files_found, files_valid = scan_and_validate(base)

    print(f"📁 Files scanned: {files_found}")
    print(f"✅ Files valid:   {files_valid}")
    print(f"❌ Errors:        {len(errors)}")
    print(f"⚠️  Warnings:      {len(warnings)}")
    print()

    if errors:
        print("=== ERRORS ===")
        for e in errors:
            print(f"  {e}")
        print()

    if warnings:
        print("=== WARNINGS ===")
        for w in warnings:
            print(f"  {w}")
        print()

    if errors:
        print("❌ Validation FAILED")
        sys.exit(1)
    else:
        print("✅ Validation PASSED")
        sys.exit(0)


if __name__ == "__main__":
    main()
