// widget-invoice-summary.js — safe for public repo, no secrets
// Expects WEBAPP_URL to be passed in by the loader script
// Designed for the extra-large widget (iPad only — .systemExtraLarge)

const MONTH_ORDER = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const widget = new ListWidget();

const gradient = new LinearGradient();
gradient.locations = [0, 1];
gradient.colors = [new Color("#63808F"), new Color("#4E6779")];
widget.backgroundGradient = gradient;
widget.setPadding(22, 24, 20, 24);

const header = widget.addStack();
header.layoutHorizontally();
const title = header.addText("Invoice summary");
title.font = Font.semiboldSystemFont(23); // +3px from 20
title.textColor = new Color("#F5F7F8");
header.addSpacer();
const dateLabel = header.addText("Jan – Dec " + new Date().getFullYear());
dateLabel.font = Font.mediumSystemFont(13);
dateLabel.textColor = new Color("#C9D3D8");

widget.addSpacer(18);

try {
  const data = await new Request(WEBAPP_URL).loadJSON();
  const BILLION = 1000000000;
  const round2 = v => Math.round((v / BILLION) * 100) / 100;

  const rawLabels = data.labels;
  const rawTotal = data.total.map(round2);
  const rawPaid = data.paid.map(round2);
  const rawOutstanding = data.outstanding.map(round2);

  function monthIndexFromLabel(label) {
    if (label == null) return -1;
    const s = String(label).trim().toLowerCase();

    const numMatch = s.match(/(?:^|-)(\d{1,2})(?:-|$)/);
    if (numMatch) {
      const n = parseInt(numMatch[1], 10);
      if (n >= 1 && n <= 12) return n - 1;
    }

    const aliases = [
      ["jan"], ["feb"], ["mar"], ["apr"],
      ["may", "mei"], ["jun"], ["jul"],
      ["aug", "agu", "ags"], ["sep"],
      ["oct", "okt"], ["nov"], ["dec", "des"]
    ];
    for (let i = 0; i < aliases.length; i++) {
      if (aliases[i].some(a => s.startsWith(a))) return i;
    }
    return -1;
  }

  const byIndex = {};
  rawLabels.forEach((label, i) => {
    const idx = monthIndexFromLabel(label);
    if (idx >= 0) {
      byIndex[idx] = { total: rawTotal[i], paid: rawPaid[i], outstanding: rawOutstanding[i] };
    }
  });

  const labels = MONTH_ORDER;
  const total = MONTH_ORDER.map((_, i) => (byIndex[i] ? byIndex[i].total : 0));
  const paid = MONTH_ORDER.map((_, i) => (byIndex[i] ? byIndex[i].paid : 0));
  const outstanding = MONTH_ORDER.map((_, i) => (byIndex[i] ? byIndex[i].outstanding : 0));

  let lastIdx = -1;
  for (let i = 11; i >= 0; i--) {
    if (byIndex[i]) { lastIdx = i; break; }
  }
  const latestTotal = lastIdx >= 0 ? total[lastIdx] : 0;
  const latestPaid = lastIdx >= 0 ? paid[lastIdx] : 0;
  const latestOutstanding = lastIdx >= 0 ? outstanding[lastIdx] : 0;

  const mainRow = widget.addStack();
  mainRow.layoutHorizontally();
  mainRow.bottomAlignContent();

  const statCol = mainRow.addStack();
  statCol.layoutVertically();
  statCol.size = new Size(140, 0);

  addStat(statCol, "Total", latestTotal, new Color("#E8B85F"));
  statCol.addSpacer(22);
  addStat(statCol, "Paid", latestPaid, new Color("#5CB37D"));
  statCol.addSpacer(22);
  addStat(statCol, "Outstanding", latestOutstanding, new Color("#C97F72"));

  mainRow.addSpacer(20);

  const divider = mainRow.addStack();
  divider.size = new Size(0.5, 216);
  divider.backgroundColor = new Color("#FFFFFF", 0.12);

  mainRow.addSpacer(16);

  const chartImg = drawInvoiceChart(labels, total, paid, outstanding);
  const chartStack = mainRow.addStack();
  chartStack.addImage(chartImg).imageSize = new Size(520, 220);

} catch (e) {
  const err = widget.addText("⚠️ " + e.message);
  err.textColor = new Color("#C9D3D8");
  err.font = Font.systemFont(9);
}

if (!config.runsInWidget) {
  widget.presentExtraLarge();
}
Script.setWidget(widget);
Script.complete();

function addStat(container, label, value, color) {
  const labelText = container.addText(label);
  labelText.font = Font.mediumSystemFont(12.5);
  labelText.textColor = new Color("#C9D3D8");
  container.addSpacer(4);

  const valStack = container.addStack();
  valStack.layoutHorizontally();
  const valText = valStack.addText(value.toFixed(2));
  valText.font = Font.semiboldSystemFont(28);
  valText.textColor = color;
  const unitText = valStack.addText(" B");
  unitText.font = Font.mediumSystemFont(12);
  unitText.textColor = new Color("#9FB0B9");
}

function drawInvoiceChart(labels, total, paid, outstanding) {
  const width = 1040, height = 440;
  const ctx = new DrawContext();
  ctx.size = new Size(width, height);
  ctx.opaque = false;
  ctx.respectScreenScale = true;

  const series = [
    { data: total,       fill: new Color("#E8B85F"), label: new Color("#F5DBA3") },
    { data: paid,        fill: new Color("#5CB37D"), label: new Color("#A6DCB9") },
    { data: outstanding, fill: new Color("#C97F72"), label: new Color("#E3B3AA") }
  ];
  const ghostFill = new Color("#FFFFFF", 0.08);
  const ghostStroke = new Color("#FFFFFF", 0.18);

  const leftPad = 6, rightPad = 6;
  const chartTop = 30, chartBottom = height - 70;
  const chartH = chartBottom - chartTop;
  const chartW = width - leftPad - rightPad;

  const maxVal = Math.max(...total, ...paid, ...outstanding, 1);
  const yMax = Math.ceil(maxVal * 1.35) || 1;

  const groupCount = labels.length;
  const groupW = chartW / groupCount;
  // more gap between the 3 bars within a group, and bars themselves wider
  const barGap = groupW * 0.06;             // was 0.03
  const barW = (groupW * 0.90 - barGap * 2) / 3; // was 0.86 — bars claim more of the group
  const groupInnerW = barW * 3 + barGap * 2;
  const cornerRadius = Math.max(4, barW * 0.28);
  const ghostH = chartH * 0.05;

  const gridRows = 4;
  for (let g = 0; g <= gridRows; g++) {
    const y = chartTop + (chartH / gridRows) * g;
    const isBase = g === gridRows;
    for (let x = leftPad; x < width - rightPad; x += 20) {
      const seg = new Path();
      seg.move(new Point(x, y));
      seg.addLine(new Point(Math.min(x + 10, width - rightPad), y));
      ctx.addPath(seg);
      ctx.setStrokeColor(new Color("#FFFFFF", isBase ? 0.16 : 0.10));
      ctx.setLineWidth(isBase ? 2 : 1.5);
      ctx.strokePath();
    }
  }

  labels.forEach((label, i) => {
    const groupCenter = leftPad + groupW * i + groupW / 2;
    const groupStartX = groupCenter - groupInnerW / 2;
    const hasData = total[i] > 0 || paid[i] > 0 || outstanding[i] > 0;

    if (!hasData) {
      const gx = groupCenter - barW * 1.5;
      const gy = chartBottom - ghostH;
      const ghost = new Path();
      ghost.addRoundedRect(new Rect(gx, gy, barW * 3 + barGap * 2, ghostH), cornerRadius, cornerRadius);
      ctx.addPath(ghost);
      ctx.setFillColor(ghostFill);
      ctx.fillPath();
      ctx.setStrokeColor(ghostStroke);
      ctx.setLineWidth(1.5);
      ctx.strokePath();
    } else {
      series.forEach((s, si) => {
        const v = s.data[i];
        const barH = Math.max((v / yMax) * chartH, v > 0 ? 2 : 0);
        const x = groupStartX + si * (barW + barGap);
        const y = chartBottom - barH;

        const bar = new Path();
        bar.addRoundedRect(new Rect(x, y, barW, barH), cornerRadius, cornerRadius);
        ctx.addPath(bar);
        ctx.setFillColor(v > 0 ? s.fill : ghostFill);
        ctx.fillPath();

        if (v > 0) {
          ctx.setFont(Font.boldSystemFont(24));
          ctx.setTextColor(s.label);
          ctx.drawTextInRect(v.toFixed(2), new Rect(x - barW * 0.7, y - 32, barW * 2.4, 28));
        }
      });
    }

    ctx.setFont(hasData ? Font.boldSystemFont(20) : Font.mediumSystemFont(20));
    ctx.setTextColor(hasData ? new Color("#D8E0E4") : new Color("#8FA0AA"));
    ctx.drawTextInRect(label, new Rect(groupCenter - 32, chartBottom + 18, 64, 26));
  });

  return ctx.getImage();
}
