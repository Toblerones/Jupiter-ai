"""Jupiter — render an architecture peer review markdown report as styled HTML.

The architecture assessment loop (workflow/gates/assessment-architecture.yml)
writes a markdown peer review report to:
    workspace/artifacts/assessment/{assessment-id}/findings.md

This script reads that markdown and emits a styled, self-contained HTML page
that is easier to read for review board chairs, business stakeholders, and reviewers.

The HTML is a single file with embedded CSS — no external dependencies, no
JavaScript. Open it in any browser, print to PDF, or send as an email
attachment.

Output features:
- Color-coded verdict badge (REVIEW-READY / CONDITIONAL / NOT-REVIEW-READY / NEEDS-REWORK)
- Color-coded inline severity tags ([BLOCKER] / [MAJOR] / [MINOR] / [OBSERVATION])
- Color-coded standards conformance table (Conformant / Deviation / Gap)
- Color-coded regulatory compliance with confidence highlighting (Low → red ⚠)
- Severity count chips in the verdict card
- Real checkbox UI for the Pre-Review Readiness Checklist
- Print-ready CSS (@media print)

Usage:
    python engine/render_assessment.py \\
        --input workspace/artifacts/assessment/{assessment-id}/findings.md \\
        --output workspace/artifacts/assessment/{assessment-id}/findings.html
"""

from __future__ import annotations

import argparse
import html
import re
from pathlib import Path

# ─── Color palette ────────────────────────────────────────────────────────────

SEVERITY_COLORS = {
    "BLOCKER":     "#dc2626",
    "MAJOR":       "#ea580c",
    "MINOR":       "#ca8a04",
    "OBSERVATION": "#2563eb",
}

VERDICT_COLORS = {
    "REVIEW-READY":     "#16a34a",
    "CONDITIONAL":      "#ea580c",
    "NOT-REVIEW-READY": "#dc2626",
    "NEEDS-REWORK":     "#991b1b",
}

CONFIDENCE_COLORS = {
    "High":   "#16a34a",
    "Medium": "#ca8a04",
    "Low":    "#dc2626",
}

# Order matters — longer/more-specific phrases first.
STATUS_COLORS = [
    ("Deviation (with ADR)", "#ca8a04"),
    ("Deviation (no ADR)",   "#dc2626"),
    ("Not applicable",       "#6b7280"),
    ("Not assessable",       "#6b7280"),
    ("Not met",              "#dc2626"),
    ("Conformant",           "#16a34a"),
    ("Partial",              "#ca8a04"),
    ("Met",                  "#16a34a"),
    ("Gap",                  "#dc2626"),
]


# ─── Markdown parsing ─────────────────────────────────────────────────────────

SEPARATOR_CHARS = set("─═━-=*_")


def is_separator_line(line: str) -> bool:
    """True for decorative rules like '---', '═══', '━━━'."""
    stripped = line.strip()
    if len(stripped) < 3:
        return False
    return all(c in SEPARATOR_CHARS for c in stripped)


def split_sections(md: str) -> tuple[str, list[tuple[str, str]]]:
    """Split the report into (preamble, [(section_name, section_body), ...]).

    Preamble is everything before the first `## ` heading — title, metadata,
    verdict block, counts. Sections are kept in document order.
    """
    sections: list[tuple[str, str]] = []
    preamble_lines: list[str] = []
    current_heading: str | None = None
    current_body: list[str] = []

    for line in md.splitlines():
        if is_separator_line(line):
            continue
        m = re.match(r"^##\s+(.+?)\s*$", line)
        if m:
            if current_heading is not None:
                sections.append((current_heading, "\n".join(current_body).strip()))
            heading = m.group(1).strip()
            heading = re.sub(r"^\d+\.\s*", "", heading)  # strip "1. "
            current_heading = heading
            current_body = []
        elif current_heading is None:
            preamble_lines.append(line)
        else:
            current_body.append(line)

    if current_heading is not None:
        sections.append((current_heading, "\n".join(current_body).strip()))

    return "\n".join(preamble_lines).strip(), sections


def parse_header(preamble: str) -> dict:
    """Extract title, subtitle, metadata, verdict, summary, counts."""
    info: dict = {
        "title": "Architecture Peer Review",
        "subtitle": "",
        "metadata": {},
        "verdict": "",
        "verdict_subtitle": "",
        "summary": "",
        "counts": None,
        "open_questions": None,
    }

    lines = preamble.splitlines()

    # Title — first H1. Split on " — " or " - " for optional subtitle.
    for line in lines:
        m = re.match(r"^#\s+(.+)$", line)
        if m:
            title = m.group(1).strip()
            sp = re.split(r"\s+[—–-]\s+", title, maxsplit=1)
            info["title"] = sp[0].strip()
            if len(sp) > 1:
                info["subtitle"] = sp[1].strip()
            break

    # Metadata fields: "Reviewer: ...", "Date: ...", etc.
    known_fields = {"reviewer", "submitted by", "date", "purpose", "for"}
    for line in lines:
        if line.startswith("#"):
            continue
        if "VERDICT" in line.upper():
            continue
        m = re.match(r"^\s*([A-Za-z][A-Za-z ]*?)\s*:\s*(.+?)\s*$", line)
        if m:
            key = m.group(1).strip()
            if key.lower() in known_fields:
                display_key = "Purpose" if key.lower() == "for" else key
                info["metadata"][display_key] = m.group(2).strip()

    # Verdict
    m = re.search(
        r"VERDICT\s*:\s*([A-Z][A-Z\-]+)(?:\s*[—–-]\s*(.+?))?\s*$",
        preamble, re.MULTILINE,
    )
    if m:
        info["verdict"] = m.group(1).strip()
        if m.group(2):
            info["verdict_subtitle"] = m.group(2).strip()

    # Executive summary — paragraph between verdict line and counts line.
    verdict_idx = None
    counts_idx = None
    for i, line in enumerate(lines):
        if verdict_idx is None and "VERDICT" in line.upper():
            verdict_idx = i
            continue
        if verdict_idx is not None and counts_idx is None:
            if re.search(r"\d+\s*blocker", line, re.IGNORECASE):
                counts_idx = i
                break
    if verdict_idx is not None:
        end = counts_idx if counts_idx is not None else len(lines)
        summary_lines = [l.strip() for l in lines[verdict_idx + 1:end] if l.strip()]
        info["summary"] = " ".join(summary_lines).strip()

    # Severity counts
    m = re.search(
        r"(\d+)\s*blocker[^\d]*(\d+)\s*major[^\d]*(\d+)\s*minor[^\d]*(\d+)\s*observation",
        preamble, re.IGNORECASE,
    )
    if m:
        info["counts"] = {
            "BLOCKER": int(m.group(1)),
            "MAJOR": int(m.group(2)),
            "MINOR": int(m.group(3)),
            "OBSERVATION": int(m.group(4)),
        }

    # Open questions count
    m = re.search(r"open questions?\s*:\s*(\d+)", preamble, re.IGNORECASE)
    if m:
        info["open_questions"] = int(m.group(1))

    return info


def find_tables(md: str) -> list[tuple[int, int, list[list[str]]]]:
    """Find all markdown tables. Returns [(start_line, end_line, rows), ...]."""
    lines = md.splitlines()
    tables = []
    i = 0
    while i < len(lines):
        if lines[i].strip().startswith("|") and i + 1 < len(lines):
            sep = lines[i + 1].strip()
            if sep.startswith("|") and "---" in sep:
                start = i
                header = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                rows = [header]
                i += 2
                while i < len(lines) and lines[i].strip().startswith("|"):
                    cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                    rows.append(cells)
                    i += 1
                tables.append((start, i - 1, rows))
                continue
        i += 1
    return tables


# ─── HTML rendering ──────────────────────────────────────────────────────────

def esc(s: str) -> str:
    return html.escape(s, quote=True)


def render_severity_tags(text: str) -> str:
    """Replace [SEVERITY] tags with colored span elements (text already escaped)."""
    def replace(m):
        sev = m.group(1)
        return f'<span class="sev sev-{sev.lower()}">{sev}</span>'
    return re.sub(r"\[(BLOCKER|MAJOR|MINOR|OBSERVATION)\]", replace, text)


def render_inline_md(text: str) -> str:
    """Inline markdown: **bold**, *italic*, `code` (text already escaped)."""
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![\*\w])\*(?!\*)([^*\n]+?)\*(?!\*)", r"<em>\1</em>", text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    return text


def render_prose(md: str) -> str:
    """Render prose: paragraphs and bullet lists with inline severity tags."""
    parts = []
    paragraphs = re.split(r"\n\s*\n", md.strip())

    for para in paragraphs:
        if not para.strip():
            continue
        lines = [l for l in para.splitlines() if l.strip()]
        is_list = bool(lines) and all(
            re.match(r"^\s*[-*]\s+", l) for l in lines
        )
        if is_list:
            items = []
            for l in lines:
                m = re.match(r"^\s*[-*]\s+(.+)$", l)
                if m:
                    item = render_severity_tags(render_inline_md(esc(m.group(1))))
                    items.append(f"<li>{item}</li>")
            parts.append(f"<ul>{''.join(items)}</ul>")
        else:
            escaped = render_severity_tags(render_inline_md(esc(para)))
            escaped = escaped.replace("\n", "<br>\n")
            parts.append(f"<p>{escaped}</p>")

    return "\n".join(parts)


def status_color(cell: str) -> str | None:
    cell_lower = cell.lower()
    for status, color in STATUS_COLORS:
        if status.lower() in cell_lower:
            return color
    return None


def confidence_color(cell: str) -> str | None:
    clean = cell.strip()
    for conf, color in CONFIDENCE_COLORS.items():
        if clean.lower().startswith(conf.lower()):
            return color
    return None


def render_table(rows: list[list[str]]) -> str:
    if not rows:
        return ""
    header = rows[0]
    data = rows[1:]

    status_col = None
    confidence_col = None
    for i, h in enumerate(header):
        h_lower = h.lower()
        if "status" in h_lower and status_col is None:
            status_col = i
        if "confidence" in h_lower and confidence_col is None:
            confidence_col = i

    parts = ['<div class="table-wrap"><table class="report-table">']
    parts.append("<thead><tr>")
    for h in header:
        parts.append(f"<th>{render_inline_md(esc(h))}</th>")
    parts.append("</tr></thead><tbody>")

    for row in data:
        while len(row) < len(header):
            row.append("")
        parts.append("<tr>")
        for i, cell in enumerate(row):
            color = None
            suffix = ""
            if i == status_col:
                color = status_color(cell)
            elif i == confidence_col:
                color = confidence_color(cell)
                if color and cell.strip().lower().startswith("low"):
                    suffix = ' <span class="warn-icon">⚠</span>'

            cell_html = render_severity_tags(render_inline_md(esc(cell))) + suffix
            if color:
                style = f"background:{color}1a;border-left:4px solid {color};font-weight:500"
                parts.append(f'<td style="{style}">{cell_html}</td>')
            else:
                parts.append(f"<td>{cell_html}</td>")
        parts.append("</tr>")
    parts.append("</tbody></table></div>")
    return "\n".join(parts)


def render_mixed_section(md: str) -> str:
    """Render a section containing prose and/or tables in document order."""
    if not md.strip():
        return ""
    tables = find_tables(md)
    if not tables:
        return render_prose(md)

    lines = md.splitlines()
    parts = []
    cursor = 0
    for start, end, rows in tables:
        if start > cursor:
            prose = "\n".join(lines[cursor:start]).strip()
            if prose:
                parts.append(render_prose(prose))
        parts.append(render_table(rows))
        cursor = end + 1
    if cursor < len(lines):
        prose = "\n".join(lines[cursor:]).strip()
        if prose:
            parts.append(render_prose(prose))
    return "\n".join(parts)


def render_checklist_section(md: str) -> str:
    """Render Pre-Review Readiness Checklist with real checkboxes."""
    parts = []
    items: list[str] = []

    def flush():
        if items:
            parts.append('<ul class="checklist">' + "".join(items) + "</ul>")
            items.clear()

    for line in md.splitlines():
        stripped = line.strip()
        m = re.match(r"^[-*]\s+\[\s\]\s+(.+)$", stripped)
        if m:
            content = render_severity_tags(render_inline_md(esc(m.group(1))))
            items.append(f'<li><input type="checkbox"><span>{content}</span></li>')
            continue
        m = re.match(r"^[-*]\s+\[[xX]\]\s+(.+)$", stripped)
        if m:
            content = render_severity_tags(render_inline_md(esc(m.group(1))))
            items.append(f'<li><input type="checkbox" checked><span>{content}</span></li>')
            continue
        if stripped:
            flush()
            content = render_severity_tags(render_inline_md(esc(stripped)))
            parts.append(f"<p>{content}</p>")

    flush()
    return "\n".join(parts)


# ─── Page assembly ───────────────────────────────────────────────────────────

CSS = """\
:root {
  --bg: #f8fafc; --card: #ffffff; --border: #e2e8f0;
  --text: #0f172a; --muted: #64748b; --heading: #1e293b;
}
* { box-sizing: border-box; }
html, body {
  margin: 0; padding: 0; background: var(--bg); color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 15px; line-height: 1.55;
}
.page { max-width: 1000px; margin: 0 auto; padding: 32px 24px 96px; }

.header { margin-bottom: 24px; }
.header h1 {
  font-size: 28px; font-weight: 700; color: var(--heading);
  margin: 0 0 4px; letter-spacing: -0.01em;
}
.header .subtitle {
  font-size: 18px; font-weight: 500; color: var(--muted); margin: 0 0 16px;
}
.metadata {
  display: flex; flex-wrap: wrap; gap: 8px 24px;
  font-size: 14px; color: var(--muted); margin-bottom: 16px;
}
.metadata .field strong { color: var(--text); font-weight: 600; margin-right: 4px; }

.verdict-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 12px; padding: 24px 28px; margin-bottom: 24px;
  border-left: 6px solid var(--verdict-color, #0f172a);
}
.verdict-badge {
  display: inline-block; font-size: 11px; font-weight: 700;
  letter-spacing: 0.08em; color: #fff;
  background: var(--verdict-color, #0f172a);
  padding: 4px 10px; border-radius: 4px; margin-bottom: 12px;
}
.verdict-title {
  font-size: 22px; font-weight: 600; margin: 0 0 12px; color: var(--heading);
}
.verdict-summary { font-size: 15px; margin: 0 0 16px; color: var(--text); }

.counts { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 4px; }
.count-chip {
  display: inline-flex; align-items: center;
  font-size: 13px; font-weight: 600;
  padding: 4px 10px; border-radius: 6px;
  background: #f1f5f9; color: var(--muted);
}
.count-chip .count-num { font-weight: 700; margin-right: 6px; }
.count-chip.has.blocker     { background: #fef2f2; color: #b91c1c; }
.count-chip.has.major       { background: #fff7ed; color: #c2410c; }
.count-chip.has.minor       { background: #fefce8; color: #a16207; }
.count-chip.has.observation { background: #eff6ff; color: #1d4ed8; }

.open-q-line { font-size: 13px; color: var(--muted); margin-top: 12px; }

.section {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 12px; padding: 24px 28px; margin-bottom: 20px;
}
.section h2 {
  font-size: 18px; font-weight: 600; color: var(--heading);
  margin: 0 0 16px; padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.section p { margin: 0 0 12px; }
.section p:last-child { margin-bottom: 0; }
.section ul, .section ol { margin: 0 0 12px; padding-left: 24px; }
.section ul:last-child, .section ol:last-child { margin-bottom: 0; }
.section li { margin-bottom: 6px; }

.sev {
  display: inline-block; font-size: 11px; font-weight: 700;
  letter-spacing: 0.05em; padding: 2px 7px; border-radius: 4px;
  color: #fff; margin-right: 4px; vertical-align: 1px;
}
.sev-blocker     { background: #dc2626; }
.sev-major       { background: #ea580c; }
.sev-minor       { background: #ca8a04; }
.sev-observation { background: #2563eb; }

.table-wrap {
  overflow-x: auto; margin: 12px 0 16px;
  border: 1px solid var(--border); border-radius: 8px;
}
.report-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.report-table th {
  background: #f1f5f9; text-align: left; font-weight: 600;
  color: var(--heading); padding: 10px 14px;
  border-bottom: 1px solid var(--border); white-space: nowrap;
}
.report-table td {
  padding: 10px 14px; border-bottom: 1px solid var(--border); vertical-align: top;
}
.report-table tbody tr:last-child td { border-bottom: none; }
.warn-icon { color: #dc2626; font-weight: 700; margin-left: 2px; }

.checklist { list-style: none; padding-left: 0; margin: 0; }
.checklist li {
  display: flex; align-items: start; gap: 10px; padding: 8px 0;
  border-bottom: 1px dashed #e2e8f0;
}
.checklist li:last-child { border-bottom: none; }
.checklist input[type=checkbox] {
  margin-top: 4px; width: 16px; height: 16px;
  flex-shrink: 0; accent-color: #16a34a;
}
.checklist input[type=checkbox]:checked + span {
  color: var(--muted); text-decoration: line-through;
}

code {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.9em; background: #f1f5f9;
  padding: 1px 5px; border-radius: 3px; color: #0f172a;
}

.footer {
  text-align: center; font-size: 12px; color: var(--muted);
  margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--border);
}

@media print {
  body { background: #fff; }
  .page { max-width: none; padding: 16px; }
  .section, .verdict-card { break-inside: avoid; }
  .verdict-badge, .sev, .count-chip, .report-table td[style] {
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
}
"""


def render_page(preamble: str, sections: list[tuple[str, str]]) -> str:
    info = parse_header(preamble)
    verdict = info["verdict"]
    verdict_color = VERDICT_COLORS.get(verdict, "#0f172a")

    # Header block
    header_parts = [f'<h1>{esc(info["title"])}</h1>']
    if info["subtitle"]:
        header_parts.append(f'<p class="subtitle">{esc(info["subtitle"])}</p>')
    if info["metadata"]:
        meta = '<div class="metadata">'
        for key, val in info["metadata"].items():
            meta += f'<span class="field"><strong>{esc(key)}:</strong> {esc(val)}</span>'
        meta += "</div>"
        header_parts.append(meta)

    # Verdict card
    vc = [f'<div class="verdict-card" style="--verdict-color:{verdict_color}">']
    vc.append('<div class="verdict-badge">VERDICT</div>')
    if verdict:
        vt = f'<div class="verdict-title">{esc(verdict)}'
        if info["verdict_subtitle"]:
            vt += f' <span style="color:{verdict_color}">— {esc(info["verdict_subtitle"])}</span>'
        vt += "</div>"
        vc.append(vt)
    if info["summary"]:
        vc.append(f'<p class="verdict-summary">{render_inline_md(esc(info["summary"]))}</p>')
    if info["counts"]:
        vc.append('<div class="counts">')
        for sev, label in [("BLOCKER", "blocker"), ("MAJOR", "major"),
                           ("MINOR", "minor"), ("OBSERVATION", "observation")]:
            n = info["counts"].get(sev, 0)
            cls = f"has {label}" if n > 0 else label
            vc.append(
                f'<span class="count-chip {cls}">'
                f'<span class="count-num">{n}</span>{label}'
                f"</span>"
            )
        vc.append("</div>")
    if info["open_questions"] is not None:
        vc.append(f'<div class="open-q-line">Open questions: {info["open_questions"]}</div>')
    vc.append("</div>")

    # Body sections
    body_parts = []
    for name, body in sections:
        if not body.strip():
            continue
        is_checklist = "checklist" in name.lower() or "pre-review" in name.lower()
        body_parts.append('<section class="section">')
        body_parts.append(f"<h2>{esc(name)}</h2>")
        body_parts.append(
            render_checklist_section(body) if is_checklist
            else render_mixed_section(body)
        )
        body_parts.append("</section>")

    title_attr = esc(info["title"])
    if info["subtitle"]:
        title_attr += " — " + esc(info["subtitle"])

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title_attr}</title>
<style>{CSS}</style>
</head>
<body>
<div class="page">
<div class="header">
{''.join(header_parts)}
</div>
{''.join(vc)}
{''.join(body_parts)}
<div class="footer">Generated by Jupiter — architecture peer review</div>
</div>
</body>
</html>
"""


# ─── CLI ─────────────────────────────────────────────────────────────────────

def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(
        prog="render_assessment",
        description=(
            "Render an architecture peer review markdown report as a styled, "
            "self-contained HTML page."
        ),
    )
    parser.add_argument(
        "--input", required=True, metavar="MD_PATH",
        help="Path to the peer review markdown report (findings.md).",
    )
    parser.add_argument(
        "--output", required=True, metavar="HTML_PATH",
        help="Path to write the styled HTML report (findings.html).",
    )
    args = parser.parse_args(argv)

    md_path = Path(args.input)
    html_path = Path(args.output)

    if not md_path.exists():
        raise SystemExit(f"Input markdown not found: {md_path}")

    md = md_path.read_text(encoding="utf-8")
    preamble, sections = split_sections(md)
    page = render_page(preamble, sections)

    html_path.parent.mkdir(parents=True, exist_ok=True)
    html_path.write_text(page, encoding="utf-8")
    print(f"Rendered HTML written to: {html_path}")


if __name__ == "__main__":
    main()
