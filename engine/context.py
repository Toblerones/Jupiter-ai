"""Jupiter context scanner — generate a reproducibility manifest for loaded context files.

Scans workspace/context/ directories and generates a context manifest with per-file
SHA-256 hashes and an aggregate hash. The loop agent calls this at iteration time to
record exactly which context files were loaded, enabling diff detection across iterations.

Usage (called via Bash from agents/loop.md):

    python engine/context.py scan \\
        --dirs workspace/context/policy workspace/context/standards workspace/context/adrs \\
        --workspace .

    python engine/context.py manifest \\
        --files workspace/context/policy/gdpr.md workspace/context/adrs/ADR-001.md \\
        --workspace .

Output (JSON to stdout):
    {
      "files": {
        "workspace/context/policy/gdpr.md": "sha256:abc...",
        "workspace/context/adrs/ADR-001.md": "sha256:def...",
        "workspace/context/standards/missing.md": null
      },
      "aggregate_hash": "sha256:xyz...",
      "file_count": 3,
      "present_count": 2
    }
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Optional


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def generate_context_manifest(context_files: list[Path]) -> dict:
    """Generate a context manifest for reproducibility.

    Scans the provided paths, hashes each existing file, then computes an
    aggregate hash over the sorted {path: sha256} mapping.

    Args:
        context_files: The context paths that were loaded.
            Missing files are recorded with null hash — not silently dropped.

    Returns:
        Dict with keys:
        - files:          {path_str: sha256_hex | null}  — per-file hash or null if missing
        - aggregate_hash: sha256 of sorted "path:hash\\n" pairs (present files only)
        - file_count:     total paths in manifest
        - present_count:  number of files actually found and hashed
    """
    file_entries: dict[str, Optional[str]] = {}
    for path in sorted(context_files, key=str):
        if path.exists():
            file_entries[str(path)] = _sha256_file(path)
        else:
            file_entries[str(path)] = None

    present_pairs = sorted(
        f"{p}:{h}" for p, h in file_entries.items() if h is not None
    )
    agg = hashlib.sha256("\n".join(present_pairs).encode()).hexdigest()

    return {
        "files": file_entries,
        "aggregate_hash": f"sha256:{agg}",
        "file_count": len(file_entries),
        "present_count": sum(1 for h in file_entries.values() if h is not None),
    }


#: File extensions treated as context documents.
CONTEXT_EXTENSIONS = {
    ".md", ".markdown",
    ".yml", ".yaml",
    ".txt",
    ".pdf",
    ".json",
}


def scan_context_dirs(dirs: list[Path], workspace_root: Path) -> list[Path]:
    """Scan context directories and return all context file paths.

    Exhaustive — does not filter by filename relevance. Every file in each
    directory is included. Relevance judgment is the loop agent's job.

    Args:
        dirs:            List of directory paths to scan (relative to workspace_root or absolute).
        workspace_root:  Workspace root used to resolve relative paths.

    Returns:
        Sorted list of Path objects for all found context files.
    """
    found: list[Path] = []
    for d in dirs:
        resolved = d if d.is_absolute() else workspace_root / d
        if not resolved.exists():
            continue
        if not resolved.is_dir():
            if resolved.suffix in CONTEXT_EXTENSIONS:
                found.append(resolved)
            continue
        for f in resolved.rglob("*"):
            if f.is_file() and f.suffix in CONTEXT_EXTENSIONS:
                found.append(f)
    return sorted(found)


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="context",
        description="Scan context directories and generate a reproducibility manifest.",
    )
    sub = p.add_subparsers(dest="command", required=True)

    scan_p = sub.add_parser(
        "scan",
        help="Scan directories exhaustively and generate manifest for all found files.",
    )
    scan_p.add_argument(
        "--dirs",
        nargs="+",
        required=True,
        metavar="DIR",
        help="Directories to scan (relative to --workspace or absolute).",
    )
    scan_p.add_argument(
        "--workspace",
        default=".",
        metavar="PATH",
        help="Workspace root for resolving relative directory paths (default: .).",
    )

    manifest_p = sub.add_parser(
        "manifest",
        help="Generate manifest for an explicit list of file paths.",
    )
    manifest_p.add_argument(
        "--files",
        nargs="+",
        required=True,
        metavar="FILE",
        help="File paths to include in the manifest.",
    )
    manifest_p.add_argument(
        "--workspace",
        default=".",
        metavar="PATH",
        help="Workspace root for resolving relative file paths (default: .).",
    )

    return p


def main(argv: list[str] | None = None) -> None:
    parser = _build_parser()
    args = parser.parse_args(argv)
    workspace = Path(args.workspace).resolve()

    if args.command == "scan":
        dirs = [Path(d) for d in args.dirs]
        files = scan_context_dirs(dirs, workspace)
    else:
        files = []
        for f in args.files:
            p = Path(f)
            if not p.is_absolute():
                p = workspace / p
            files.append(p)

    manifest = generate_context_manifest(files)
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
