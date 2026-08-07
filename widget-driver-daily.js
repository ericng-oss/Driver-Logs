const url = "https://script.google.com/macros/s/AKfycbwhyjen0biWvA1Cl-VGkfvR2WHnspCEeV_NR021eGFGmFxL988fOC0NvvEWv0S7QIkg/exec?weeklywidget=1";

const req = new Request(url);
const data = await req.loadJSON();

// Approximate content width based on widget size (Scriptable doesn't expose
// exact render width, so we estimate using standard widget family dimensions)
const family = config.widgetFamily || "medium";
const totalWidth = family === "small" ? 155 : 329;
const horizontalPadding = 14 * 2;
const contentWidth = totalWidth - horizontalPadding;

const periodWidth = contentWidth * 0.45;
const colWidth = (contentWidth - periodWidth) / 3;

const widget = new ListWidget();
widget.backgroundColor = new Color("#596161");
widget.setPadding(16, 14, 16, 14);

// Header
const title = widget.addText("WEEKLY SUMMARY");
title.textColor = Color.white();
title.font = Font.boldSystemFont(20);

widget.addSpacer(16);

// Helper: builds a fixed-width stack with text pinned left (spacer after) or right (spacer before)
function addColumn(parentStack, text, width, color, font, align) {
  const colStack = parentStack.addStack();
  colStack.layoutHorizontally();
  colStack.size = new Size(width, 0);

  if (align === "right") {
    colStack.addSpacer();
  }

  const t = colStack.addText(text);
  t.textColor = color;
  t.font = font;

  if (align === "left") {
    colStack.addSpacer();
  }

  return t;
}

// Column header row
const headerRow = widget.addStack();
headerRow.layoutHorizontally();

addColumn(headerRow, "PERIOD", periodWidth, Color.white(), Font.boldSystemFont(10), "left");
addColumn(headerRow, "HERI", colWidth, new Color("#1FA463"), Font.boldSystemFont(10), "left");
addColumn(headerRow, "UDI", colWidth, new Color("#F59E0B"), Font.boldSystemFont(10), "left");
addColumn(headerRow, "TOTAL", colWidth, new Color("#C7D3D5"), Font.boldSystemFont(10), "right");

widget.addSpacer(8);

// Rows
for (const row of data.rows.slice(0, 3)) {
  const rowStack = widget.addStack();
  rowStack.layoutHorizontally();
  rowStack.centerAlignContent();

  addColumn(rowStack, row.period, periodWidth, Color.white(), Font.systemFont(11), "left");
  addColumn(rowStack, shortIDR(row.heri), colWidth, new Color("#1FA463"), Font.mediumSystemFont(12), "left");
  addColumn(rowStack, shortIDR(row.udi), colWidth, new Color("#F59E0B"), Font.mediumSystemFont(12), "left");
  addColumn(rowStack, shortIDR(row.total), colWidth, new Color("#C7D3D5"), Font.mediumSystemFont(12), "right");

  widget.addSpacer(8);
}

widget.refreshAfterDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

Script.setWidget(widget);
Script.complete();

function formatIDR(n) {
  return Number(n || 0).toLocaleString("id-ID");
}

function shortIDR(n) {
  n = Number(n || 0);
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "jt";
  if (n >= 1000) return Math.round(n / 1000) + "k";
  return String(n);
}
