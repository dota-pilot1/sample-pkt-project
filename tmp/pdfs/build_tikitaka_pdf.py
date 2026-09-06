from __future__ import annotations

import base64
import io
from html.parser import HTMLParser
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib.utils import ImageReader


ROOT = Path(__file__).resolve().parents[2]
HTML_PATH = ROOT / "output" / "tikitaka-app-introduction.html"
PDF_PATH = ROOT / "output" / "pdf" / "tikitaka-app-introduction.pdf"
FONT_PATH = Path("/System/Library/Fonts/Supplemental/Arial Unicode.ttf")


def clean(value: str) -> str:
    replacements = {
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2013": "-",
        "\u2014": "-",
        "\u2011": "-",
        "\u2192": "->",
    }
    for old, new in replacements.items():
        value = value.replace(old, new)
    return " ".join(value.split())


class HtmlContent(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.sections: dict[str, list[tuple[str, object]]] = {}
        self.current_section: str | None = None
        self.active_text: tuple[str, list[str]] | None = None
        self.active_cell: list[str] | None = None
        self.current_row: list[str] | None = None
        self.current_table: list[list[str]] | None = None
        self.goal_mode = False
        self.goal: dict[str, str] | None = None
        self.goal_part: str | None = None
        self.goals: list[dict[str, str]] = []
        self.workflow_mode = False
        self.workflow_items: list[str] = []
        self.image_src: str | None = None

    def _text_start(self, tag: str) -> None:
        if self.current_section and not self.goal_mode and self.current_table is None:
            self.active_text = (tag, [])

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
        if tag == "section":
            self.current_section = attrs_dict.get("id")
            if self.current_section:
                self.sections.setdefault(self.current_section, [])
        elif tag in {"h1", "h2", "p"}:
            if self.goal_mode:
                self.goal_part = "desc" if tag == "p" else self.goal_part
            else:
                self._text_start(tag)
        elif tag == "ol" and "goal-list" in (attrs_dict.get("class") or ""):
            self.goal_mode = True
        elif tag == "ol" and "workflow" in (attrs_dict.get("class") or ""):
            self.workflow_mode = True
            self.workflow_items = []
        elif tag == "li" and self.goal_mode:
            self.goal = {"num": "", "title": "", "desc": ""}
            self.goal_part = None
        elif tag == "li" and self.workflow_mode:
            self.active_text = ("flow", [])
        elif tag == "span" and self.goal_mode and self.goal is not None:
            self.goal_part = "num"
        elif tag == "strong" and self.goal_mode and self.goal is not None:
            self.goal_part = "title"
        elif tag == "table" and self.current_section:
            self.current_table = []
        elif tag == "tr" and self.current_table is not None:
            self.current_row = []
        elif tag in {"th", "td"} and self.current_row is not None:
            self.active_cell = []
        elif tag == "img" and attrs_dict.get("id") == "api-screen":
            self.image_src = attrs_dict.get("src")
            if self.current_section and self.image_src:
                self.sections[self.current_section].append(("image", self.image_src))

    def handle_data(self, data: str) -> None:
        if self.goal_mode and self.goal is not None and self.goal_part:
            self.goal[self.goal_part] += data
        elif self.active_cell is not None:
            self.active_cell.append(data)
        elif self.active_text is not None:
            self.active_text[1].append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag in {"h1", "h2", "p"} and self.active_text and self.active_text[0] == tag:
            kind, parts = self.active_text
            text = clean("".join(parts))
            if text and self.current_section:
                self.sections[self.current_section].append((kind, text))
            self.active_text = None
        elif tag in {"th", "td"} and self.active_cell is not None and self.current_row is not None:
            self.current_row.append(clean("".join(self.active_cell)))
            self.active_cell = None
        elif tag == "tr" and self.current_row is not None and self.current_table is not None:
            if self.current_row:
                self.current_table.append(self.current_row)
            self.current_row = None
        elif tag == "table" and self.current_table is not None and self.current_section:
            if self.current_table:
                self.sections[self.current_section].append(("table", self.current_table))
            self.current_table = None
        elif tag == "li" and self.goal_mode and self.goal is not None:
            self.goals.append({key: clean(value) for key, value in self.goal.items()})
            self.goal = None
            self.goal_part = None
        elif tag == "li" and self.workflow_mode and self.active_text:
            text = clean("".join(self.active_text[1]))
            if text:
                self.workflow_items.append(text)
            self.active_text = None
        elif tag == "ol" and self.goal_mode:
            self.goal_mode = False
        elif tag == "ol" and self.workflow_mode:
            if self.current_section and self.workflow_items:
                self.sections[self.current_section].append(("flow", self.workflow_items))
            self.workflow_mode = False
        elif tag == "section":
            self.current_section = None


def para(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(escape(clean(text)), style)


def make_table(rows: list[list[str]], styles: dict[str, ParagraphStyle]) -> Table:
    data = [[para(cell, styles["table_head"] if row_index == 0 else styles["table_body"]) for cell in row]
            for row_index, row in enumerate(rows)]
    widths = {2: [48 * mm, 126 * mm], 3: [34 * mm, 67 * mm, 73 * mm]}.get(len(rows[0]), None)
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#203b54")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.45, colors.HexColor("#d9dfe4")),
        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f2f5f8")]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return table


def footer(canvas, document) -> None:
    canvas.saveState()
    width, height = A4
    canvas.setStrokeColor(colors.HexColor("#d9dfe4"))
    canvas.setLineWidth(0.4)
    canvas.line(18 * mm, 12 * mm, width - 18 * mm, 12 * mm)
    canvas.setFont("ArialUnicode", 7.5)
    canvas.setFillColor(colors.HexColor("#687985"))
    canvas.drawString(18 * mm, 7 * mm, "티키타카 노트 · PRODUCT GUIDE")
    canvas.drawRightString(width - 18 * mm, 7 * mm, f"{document.page}")
    canvas.restoreState()


def main() -> None:
    if not FONT_PATH.exists():
        raise FileNotFoundError(FONT_PATH)
    pdfmetrics.registerFont(TTFont("ArialUnicode", str(FONT_PATH)))
    parser = HtmlContent()
    parser.feed(HTML_PATH.read_text(encoding="utf-8"))

    styles = getSampleStyleSheet()
    styles_map = {
        "title": ParagraphStyle("TitleK", parent=styles["Title"], fontName="ArialUnicode", fontSize=25, leading=33, textColor=colors.black, spaceAfter=8),
        "subtitle": ParagraphStyle("SubtitleK", parent=styles["Normal"], fontName="ArialUnicode", fontSize=13, leading=20, textColor=colors.HexColor("#304b60"), spaceAfter=4),
        "meta": ParagraphStyle("MetaK", parent=styles["Normal"], fontName="ArialUnicode", fontSize=8, leading=12, textColor=colors.HexColor("#687985"), spaceAfter=15),
        "lead": ParagraphStyle("LeadK", parent=styles["Normal"], fontName="ArialUnicode", fontSize=11, leading=18, textColor=colors.HexColor("#18252e"), spaceAfter=12),
        "body": ParagraphStyle("BodyK", parent=styles["BodyText"], fontName="ArialUnicode", fontSize=9.2, leading=15, textColor=colors.HexColor("#18252e"), spaceAfter=8),
        "h1": ParagraphStyle("H1K", parent=styles["Heading1"], fontName="ArialUnicode", fontSize=19, leading=26, textColor=colors.black, spaceBefore=0, spaceAfter=12),
        "h2": ParagraphStyle("H2K", parent=styles["Heading2"], fontName="ArialUnicode", fontSize=12.5, leading=18, textColor=colors.black, spaceBefore=13, spaceAfter=7),
        "goal": ParagraphStyle("GoalK", parent=styles["Normal"], fontName="ArialUnicode", fontSize=9, leading=14, textColor=colors.HexColor("#4e626f")),
        "goal_title": ParagraphStyle("GoalTitleK", parent=styles["Normal"], fontName="ArialUnicode", fontSize=10.5, leading=15, textColor=colors.black),
        "table_head": ParagraphStyle("TableHeadK", parent=styles["Normal"], fontName="ArialUnicode", fontSize=8.2, leading=12, textColor=colors.white),
        "table_body": ParagraphStyle("TableBodyK", parent=styles["Normal"], fontName="ArialUnicode", fontSize=8, leading=12, textColor=colors.HexColor("#18252e")),
        "flow": ParagraphStyle("FlowK", parent=styles["Normal"], fontName="ArialUnicode", fontSize=9, leading=15, textColor=colors.HexColor("#245a85"), spaceAfter=8),
    }

    doc = SimpleDocTemplate(
        str(PDF_PATH), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm,
        topMargin=20 * mm, bottomMargin=18 * mm, title="티키타카 노트 앱을 만든 이유",
        author="티키타카 노트",
    )
    story = []
    overview = parser.sections["overview"]
    overview_h1 = next(text for kind, text in overview if kind == "h1")
    overview_paragraphs = [text for kind, text in overview if kind == "p"]
    story += [para(overview_h1, styles_map["title"]), para(overview_paragraphs[0], styles_map["subtitle"]), para(overview_paragraphs[1], styles_map["meta"])]
    story.append(para(overview_paragraphs[2], styles_map["lead"]))

    goal_rows = [[para("번호", styles_map["table_head"]), para("활용 목적", styles_map["table_head"]), para("쉽게 말하면", styles_map["table_head"])]]
    for goal in parser.goals:
        goal_rows.append([para(goal["num"], styles_map["goal_title"]), para(goal["title"], styles_map["goal_title"]), para(goal["desc"], styles_map["goal"])])
    goal_table = Table(goal_rows, colWidths=[17 * mm, 67 * mm, 90 * mm], repeatRows=1, hAlign="LEFT")
    goal_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#203b54")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.45, colors.HexColor("#d9dfe4")), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f2f5f8")]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story += [goal_table, PageBreak()]

    section_order = ["agent", "learning", "domain", "reuse", "search", "rag"]
    for index, section_id in enumerate(section_order):
        blocks = parser.sections[section_id]
        h1 = next(text for kind, text in blocks if kind == "h1")
        story.append(para(h1, styles_map["h1"]))
        paragraph_count = 0
        for kind, content in blocks:
            if kind == "h1":
                continue
            if kind == "h2":
                story.append(para(str(content), styles_map["h2"]))
            elif kind == "p":
                story.append(para(str(content), styles_map["lead"] if paragraph_count == 0 else styles_map["body"]))
                paragraph_count += 1
            elif kind == "table":
                story += [Spacer(1, 3 * mm), make_table(content, styles_map), Spacer(1, 2 * mm)]
            elif kind == "flow":
                story.append(para("  ->  ".join(content), styles_map["flow"]))
            elif kind == "image":
                raw = base64.b64decode(str(content).split(",", 1)[1])
                image_stream = io.BytesIO(raw)
                reader = ImageReader(image_stream)
                width, height = reader.getSize()
                target_width = 170 * mm
                target_height = target_width * height / width
                image_stream.seek(0)
                story += [Spacer(1, 2 * mm), Image(image_stream, width=target_width, height=target_height), Spacer(1, 3 * mm)]
        if index != len(section_order) - 1:
            story.append(PageBreak())

    PDF_PATH.parent.mkdir(parents=True, exist_ok=True)
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(PDF_PATH)


if __name__ == "__main__":
    main()
