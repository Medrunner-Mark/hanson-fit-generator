// A4 直式 PDF 課表產生器：上半 18 週行事曆（含週跑量）、下半選定目標的各類配速。
// 用 Canvas 渲染（中文用系統字體，避開 jsPDF 中文字體問題），再以 jsPDF addImage 輸出 A4。
// jsPDF 由 index.html 從 CDN 載入為全域 window.jspdf。

import { fmtPace } from "./paces.js";
import { TYPE_INFO, DAY_HEADERS } from "./schedule.js";

// A4 @ ~150dpi 直式：1240 × 1754
const W = 1240, H = 1754;

const TYPE_COLOR = {
  easy:     { bg: "#9CC2E5", fg: "#12354f" },
  speed:    { bg: "#FF9999", fg: "#6d1a1a" },
  tempo:    { bg: "#FFC000", fg: "#553e00" },
  strength: { bg: "#C5E0B3", fg: "#2f4d1c" },
  long:     { bg: "#0070C0", fg: "#ffffff" },
  rest:     { bg: "#e9edf1", fg: "#7a8794" },
  race:     { bg: "#e8a33d", fg: "#42270a" },
};

function font(size, weight = 400) {
  return `${weight} ${size}px "Noto Sans TC","Microsoft JhengHei","PingFang TC",sans-serif`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

function drawCanvas(plan, tier) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  const mx = 56;

  // 標題
  ctx.textAlign = "center";
  ctx.fillStyle = "#152c3f";
  ctx.font = font(52, 700);
  ctx.fillText(`漢森進階 ${plan.label}課表`, W / 2, 84);
  ctx.fillStyle = "#c87a1a";
  ctx.font = font(34, 700);
  ctx.fillText(`目標完賽時間 ${tier.goal}`, W / 2, 132);

  // ── 配速表（先畫，放上方緊接標題）──
  const cards = plan.paceCards;
  const perRow = 4;
  const cardGap = 14;
  const cardW = (W - mx * 2 - cardGap * (perRow - 1)) / perRow;
  const cardH = 96;
  const paceTop = 168;
  cards.forEach((card, i) => {
    const row = Math.floor(i / perRow), col = i % perRow;
    const x = mx + col * (cardW + cardGap);
    const y = paceTop + row * (cardH + cardGap);
    ctx.fillStyle = "#f1f5f8";
    roundRect(ctx, x, y, cardW, cardH, 12); ctx.fill();
    ctx.textAlign = "center";
    ctx.fillStyle = "#5b6b7a";
    ctx.font = font(22, 500);
    ctx.fillText(card.label.replace(/\s*\(.*\)/, ""), x + cardW / 2, y + 36);
    ctx.fillStyle = "#152c3f";
    ctx.font = font(40, 700);
    const lap = card.lap ? `　每圈${Math.round(tier.fiveK * 0.4)}s` : "";
    ctx.fillText(fmtPace(tier[card.key]) + "/km", x + cardW / 2, y + 78);
    if (lap) {
      ctx.font = font(20, 400);
      ctx.fillStyle = "#7d8b98";
    }
  });
  const paceRows = Math.ceil(cards.length / perRow);
  let y = paceTop + paceRows * (cardH + cardGap) + 24;

  // ── 18 週行事曆 ──
  const wkColW = 70, totColW = 120;
  const dayColW = (W - mx * 2 - wkColW - totColW) / 7;
  const headerH = 44, rowH = (H - y - 90 - headerH) / 18;
  const tableX = mx;

  // 表頭
  ctx.fillStyle = "#25455c";
  roundRect(ctx, tableX, y, W - mx * 2, headerH, 8); ctx.fill();
  ctx.fillStyle = "#e6eef4";
  ctx.font = font(24, 700);
  ctx.textAlign = "center";
  ctx.fillText("週", tableX + wkColW / 2, y + 30);
  DAY_HEADERS.forEach((d, i) => ctx.fillText(d, tableX + wkColW + dayColW * (i + 0.5), y + 30));
  ctx.fillText("週跑量", tableX + wkColW + dayColW * 7 + totColW / 2, y + 30);

  const top = y + headerH;
  plan.schedule.forEach((week, wi) => {
    const ry = top + wi * rowH;
    ctx.fillStyle = "#8fa3b3";
    ctx.font = font(24, 700);
    ctx.textAlign = "center";
    ctx.fillText(String(wi + 1), tableX + wkColW / 2, ry + rowH / 2 + 8);

    week.forEach((day, di) => {
      const info = TYPE_INFO[day.t];
      const c = TYPE_COLOR[day.t];
      const x = tableX + wkColW + dayColW * di;
      ctx.fillStyle = c.bg;
      roundRect(ctx, x + 3, ry + 3, dayColW - 6, rowH - 6, 7); ctx.fill();
      ctx.fillStyle = c.fg;
      if (day.t === "rest") {
        ctx.font = font(22, 700);
        ctx.fillText(info.short, x + dayColW / 2, ry + rowH / 2 + 8);
      } else {
        const text = day.t === "race" ? day.label.split(" ").pop() : day.label;
        ctx.font = font(21, 700);
        ctx.fillText(info.short, x + dayColW / 2, ry + rowH / 2 - 2);
        ctx.font = font(19, 500);
        ctx.fillText(text, x + dayColW / 2, ry + rowH / 2 + 22);
      }
    });

    const total = Math.round(week.reduce((s, d) => s + d.d, 0) * 10) / 10;
    ctx.fillStyle = "#c87a1a";
    ctx.font = font(24, 700);
    ctx.fillText(`${total}K`, tableX + wkColW + dayColW * 7 + totColW / 2, ry + rowH / 2 + 8);
  });

  // 頁尾
  ctx.textAlign = "center";
  ctx.fillStyle = "#152c3f";
  ctx.font = font(26, 700);
  ctx.fillText("Med日跑者", W / 2, H - 44);
  ctx.fillStyle = "#8b98a4";
  ctx.font = font(20, 400);
  ctx.fillText("medrunner-mark.github.io/hanson-fit-generator", W / 2, H - 16);

  return canvas;
}

export function downloadPdf(plan, tier) {
  const canvas = drawCanvas(plan, tier);
  const img = canvas.toDataURL("image/jpeg", 0.92);
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  pdf.addImage(img, "JPEG", 0, 0, 210, 297);
  pdf.save(`${plan.namePrefix}sub${tier.goal.replace(":", "")}_18週課表.pdf`);
}
