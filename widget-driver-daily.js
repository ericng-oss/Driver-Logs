const url = "https://script.google.com/macros/s/AKfycbwhyjen0biWvA1Cl-VGkfvR2WHnspCEeV_NR021eGFGmFxL988fOC0NvvEWv0S7QIkg/exec?widget=1";

const req = new Request(url);
const data = await req.loadJSON();

const widget = new ListWidget();
widget.backgroundColor = new Color("#314F52");
widget.setPadding(-25, 12, 0, 12);

// Header
const title = widget.addText("DRIVER SUMMARY");
title.textColor = Color.white();
title.font = Font.boldSystemFont(22);

const week = widget.addText(data.week);
week.textColor = new Color("#C7D3D5");
week.font = Font.systemFont(18);

widget.addSpacer(20);

// Driver columns
const columns = widget.addStack();
columns.layoutHorizontally();
columns.topAlignContent();

let grandTotal = 0;
const weekDays = getCurrentWeekDates();

for (const driver of data.drivers) {
const isHeri = driver.name.toLowerCase() === "heri";
const accent = isHeri ? new Color("#1FA463") : new Color("#F59E0B");

const card = columns.addStack();
card.layoutHorizontally();
card.topAlignContent();

const line = card.addStack();
line.size = new Size(5, 192);
line.backgroundColor = accent;
line.cornerRadius = 4;

card.addSpacer(8);

const content = card.addStack();
content.layoutVertically();

const name = content.addText(driver.name.toUpperCase());
name.textColor = accent;
name.font = Font.boldSystemFont(16);

content.addSpacer(13);

for (const day of weekDays) {
const log = findLogForDate(driver.logs, day);

const row = content.addStack();
row.layoutHorizontally();

const left = row.addText(`${day.label} ${day.dayNum} ${log?.clockOut || "-"}`);
left.textColor = Color.white();
left.font = Font.italicSystemFont(10);

row.addSpacer();

const amount = row.addText("Rp " + shortIDR(log?.nominal || 0));
amount.textColor = new Color("#C7D3D5");
amount.font = Font.italicSystemFont(13);

content.addSpacer(3);
}

content.addSpacer(14);

const totalRow = content.addStack();
totalRow.layoutHorizontally();

const totalLabel = totalRow.addText("TOTAL");

if(isHeri){
totalLabel.textColor = new Color("#1FA463");}
else{
totalLabel.textColor = new Color("#F59E0B");
}

totalLabel.font = Font.boldSystemFont(15);

totalRow.addSpacer();

const totalAmount = totalRow.addText("Rp " + shortIDR(driver.total));


if(isHeri){
totalAmount.textColor = new Color("#1FA463");}
else{
totalAmount.textColor = new Color("#F59E0B");}


totalAmount.font = Font.boldSystemFont(15);

grandTotal += Number(driver.total || 0);

if (isHeri) {
columns.addSpacer(32);
}
}

widget.addSpacer(25);

// Footer
const footer = widget.addStack();
footer.layoutHorizontally();

const label = footer.addText("GRAND TOTAL");
label.textColor = new Color("#C7D3D5");
label.font = Font.boldSystemFont(17);

footer.addSpacer();

const amount = footer.addText("Rp " + formatIDR(grandTotal));
amount.textColor = Color.white();
amount.font = Font.boldSystemFont(22);

widget.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);

Script.setWidget(widget);
Script.complete();

function getCurrentWeekDates() {
const now = new Date();
const day = now.getDay();
const diff = day === 0 ? -6 : 1 - day;

const monday = new Date(now);
monday.setDate(now.getDate() + diff);

const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dates = [];

for (let i = 0; i < 7; i++) {
const d = new Date(monday);
d.setDate(monday.getDate() + i);

dates.push({
label: names[i],
dayNum: d.getDate(),
month: d.getMonth(),
year: d.getFullYear(),
key: d.toLocaleDateString("en-GB")
});
}

return dates;
}

function parseLogDate(str) {
const parts = String(str || "").trim().split(" ");
if (parts.length < 2) return null;

const dmy = parts[1].split("/");
if (dmy.length < 2) return null;

const day = parseInt(dmy[0], 10);
const month = parseInt(dmy[1], 10) - 1;
const year = dmy[2] ? parseInt(dmy[2], 10) : new Date().getFullYear();

if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
return { day, month, year };
}

function findLogForDate(logs, day) {
if (!logs) return null;

return logs.find(log => {
const parsed = parseLogDate(log.date);
if (!parsed) return false;

return parsed.day === day.dayNum &&
parsed.month === day.month &&
parsed.year === day.year;
});
}

function formatIDR(n) {
return Number(n || 0).toLocaleString("id-ID");
}

function shortIDR(n) {
n = Number(n || 0);
if (n >= 1000000) return (n / 1000000).toFixed(1) + "jt";
if (n >= 1000) return Math.round(n / 1000) + "k";
return String(n);
}
