const url = "https://script.google.com/macros/s/AKfycbwhyjen0biWvA1Cl-VGkfvR2WHnspCEeV_NR021eGFGmFxL988fOC0NvvEWv0S7QIkg/exec?weeklywidget=1";

const req = new Request(url);
const data = await req.loadJSON();

const widget = new ListWidget();
widget.backgroundColor = new Color("#66706b");
widget.setPadding(16, 14, 16, 14);

// Header
const title = widget.addText("WEEKLY SUMMARY");
title.textColor = Color.white();
title.font = Font.boldSystemFont(20);

widget.addSpacer(16);

// Column header row
const headerRow = widget.addStack();
headerRow.layoutHorizontally();

const periodHeader = headerRow.addText("PERIOD");
periodHeader.textColor = Color.white();
periodHeader.font = Font.boldSystemFont(10);
periodHeader.leftAlignText();

headerRow.addSpacer();

const heriHeader = headerRow.addText("HERI");
heriHeader.textColor = new Color("#1FA463");
heriHeader.font = Font.boldSystemFont(10);

headerRow.addSpacer(10);

const udiHeader = headerRow.addText("UDI");
udiHeader.textColor = new Color("#F59E0B");
udiHeader.font = Font.boldSystemFont(10);

headerRow.addSpacer(10);

const totalHeader = headerRow.addText("TOTAL");
totalHeader.textColor = new Color("#C7D3D5");
totalHeader.font = Font.boldSystemFont(10);

widget.addSpacer(8);

// Rows
for (const row of data.rows.slice(0, 3)) {
  const rowStack = widget.addStack();
  rowStack.layoutHorizontally();
  rowStack.centerAlignContent();

  const periodStack = rowStack.addStack();
  periodStack.size = new Size(46, 0);

  const periodText = periodStack.addText(row.period);
  periodText.textColor = Color.white();
  periodText.font = Font.systemFont(11);
  periodText.leftAlignText();

  rowStack.addSpacer();

  const heriText = rowStack.addText(shortIDR(row.heri));
  heriText.textColor = new Color("#1FA463");
  heriText.font = Font.mediumSystemFont(12);

  rowStack.addSpacer(10);

  const udiText = rowStack.addText(shortIDR(row.udi));
  udiText.textColor = new Color("#F59E0B");
  udiText.font = Font.mediumSystemFont(12);

  rowStack.addSpacer(10);

  const totalText = rowStack.addText(shortIDR(row.total));
  totalText.textColor = new Color("#C7D3D5");
  totalText.font = Font.mediumSystemFont(12);

  widget.addSpacer(8);
}

widget.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);

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
