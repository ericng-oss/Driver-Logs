console.log("WIDGET VERSION 2026-06-01-01");

const CSV_URL = "https://docs.google.com/spreadsheets/d/1SemeSAuE7FW4xEEj1jqn_vnI9Bd6gYCvcoHJxBmeUK4/export?format=csv&gid=1011119762";

const widget = new ListWidget();
widget.backgroundColor = new Color("#F7F4EF");
widget.setPadding(16, 16, 16, 16);
widget.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);

const title = widget.addText("DRIVER SUMMARY");
title.font = Font.boldSystemFont(22);
title.textColor = new Color("#111827");
title.centerAlignText();

const subtitle = widget.addText("Last 4 Weeks");
subtitle.font = Font.mediumSystemFont(15);
subtitle.textColor = new Color("#6B7280");
subtitle.centerAlignText();

widget.addSpacer(14);

const data = await loadCSV(CSV_URL);
let grandTotal = 0;

for (let i = 1; i < Math.min(data.length, 5); i++) {
  const row = data[i];

  const period = row[0] || "";
  const heri = toNumber(row[2]);
  const udi = toNumber(row[3]);
  const total = toNumber(row[4]);

  grandTotal += total;

  const card = widget.addStack();
  card.layoutVertically();
  card.backgroundColor = Color.white();
  card.cornerRadius = 14;
  card.setPadding(10, 12, 10, 12);

  const top = card.addStack();
  top.layoutHorizontally();

  const periodText = top.addText(period.toUpperCase());
  periodText.font = Font.boldSystemFont(14);
  periodText.textColor = new Color("#111827");

  top.addSpacer();

  const totalText = top.addText(formatIDR(total));
  totalText.font = Font.boldSystemFont(14);
  totalText.textColor = new Color("#111827");

  card.addSpacer(8);

  const drivers = card.addStack();
  drivers.layoutHorizontally();

  addDriver(drivers, "Heri", heri, "#22C55E");
  drivers.addSpacer(10);
  addDriver(drivers, "Udi", udi, "#6366F1");

  widget.addSpacer(8);
}

widget.addSpacer(4);

const grand = widget.addStack();
grand.layoutHorizontally();

const grandLabel = grand.addText("Grand Total");
grandLabel.font = Font.boldSystemFont(16);
grandLabel.textColor = new Color("#111827");

grand.addSpacer();

const grandAmount = grand.addText(formatIDR(grandTotal));
grandAmount.font = Font.boldSystemFont(18);
grandAmount.textColor = new Color("#111827");

Script.setWidget(widget);
Script.complete();

if (!config.runsInWidget) {
  await widget.presentMedium();
}


// ---------- FUNCTIONS ----------

function addDriver(parent, name, amount, colorHex) {
  const box = parent.addStack();
  box.layoutVertically();
  box.backgroundColor = new Color("#F9FAFB");
  box.cornerRadius = 10;
  box.setPadding(8, 10, 8, 10);

  const line = box.addStack();
  line.layoutHorizontally();

  const bar = line.addStack();
  bar.backgroundColor = new Color(colorHex);
  bar.cornerRadius = 3;
  bar.size = new Size(4, 34);

  line.addSpacer(8);

  const textBox = line.addStack();
  textBox.layoutVertically();

  const nameText = textBox.addText(name);
  nameText.font = Font.mediumSystemFont(12);
  nameText.textColor = new Color("#6B7280");

  const amountText = textBox.addText(formatIDR(amount));
  amountText.font = Font.boldSystemFont(13);
  amountText.textColor = new Color("#111827");
}

async function loadCSV(url) {
  const req = new Request(url);
  const csv = await req.loadString();
  return parseCSV(csv);
}

function parseCSV(csv) {
  return csv
    .trim()
    .split(/\r?\n/)
    .map(row => row.split(",").map(cell => cell.replace(/^"|"$/g, "").trim()));
}

function toNumber(value) {
  if (!value) return 0;
  return Number(String(value).replace(/[^\d.-]/g, "")) || 0;
}

function formatIDR(num) {
  return "Rp " + Math.round(num).toLocaleString("id-ID");
}
