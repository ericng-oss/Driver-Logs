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

// Column header row
const headerRow = widget.addStack();
headerRow.layoutHorizontally();

// PERIOD - left aligned (spacer after text)
const periodHeader = headerRow.addStack();
periodHeader.size = new Size(periodWidth, 0);
periodHeader.layoutHorizontally();
const periodHeaderText = periodHeader.addText("PERIOD");
periodHeaderText.textColor = Color.white();
periodHeaderText.font = Font.boldSystemFont(10);
periodHeader.addSpacer();

// HERI - left aligned
const heriHeaderStack = headerRow.addStack();
heriHeaderStack.size = new Size(colWidth, 0);
heriHeaderStack.layoutHorizontally();
const heriHeader = heriHeaderStack.addText("HERI");
heriHeader.textColor = new Color("#1FA463");
heriHeader.font = Font.boldSystemFont(10);
heriHeaderStack.addSpacer();

// UDI - left aligned
const udiHeaderStack = headerRow.addStack();
udiHeaderStack.size = new Size(colWidth, 0);
udiHeaderStack.layoutHorizontally();
const udiHeader = udiHeaderStack.addText("UDI");
udiHeader.textColor = new Color("#F59E0B");
udiHeader.font = Font.boldSystemFont(10);
udiHeaderStack.addSpacer();

// TOTAL - right aligned (spacer before text)
const totalHeaderStack = headerRow.addStack();
totalHeaderStack.size = new Size(colWidth, 0);
totalHeaderStack.layoutHorizontally();
totalHeaderStack.addSpacer();
const totalHeader = totalHeaderStack.addText("TOTAL");
totalHeader.textColor = new Color("#C7D3D5");
totalHeader.font = Font.boldSystemFont(10);

widget.addSpacer(8);

// Rows
for (const row of data.rows.slice(0, 3)) {
  const rowStack = widget.addStack();
  rowStack.layoutHorizontally();
  rowStack.centerAlignContent();

  // PERIOD - left aligned
  const periodStack = rowStack.addStack();
  periodStack.size = new Size(periodWidth, 0);
  periodStack.layoutHorizontally();
  const periodText = periodStack.addText(row.period);
  periodText.textColor = Color.white();
  periodText.font = Font.systemFont(11);
  periodStack.addSpacer();

  // HERI - left aligned
  const heriStack = rowStack.addStack();
  heriStack.size = new Size(colWidth, 0);
  heriStack.layoutHorizontally();
  const heriText = heriStack.addText(shortIDR(row.heri));
  heriText.textColor = new Color("#1FA463");
  heriText.font = Font.mediumSystemFont(12);
  heriStack.addSpacer();

  // UDI - left aligned
  const udiStack = rowStack.addStack();
  udiStack.size = new Size(colWidth, 0);
  udiStack.layoutHorizontally();
  const udiText = udiStack.addText(shortIDR(row.udi));
  udiText.textColor = new Color("#F59E0B");
  udiText.font = Font.mediumSystemFont(12);
  udiStack.addSpacer();

  // TOTAL - right aligned
  const totalStack = rowStack.addStack();
  totalStack.size = new Size(colWidth, 0);
  totalStack.layoutHorizontally();
  totalStack.addSpacer();
  const totalText = totalStack.addText(shortIDR(row.total));
  totalText.textColor = new Color("#C7D3D5");
  totalText.font = Font.mediumSystemFont(12);

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
