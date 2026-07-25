// A4 課表 PDF：兩頁，每頁 9 週，每天顯示完整課表明細（含該目標時間的實際配速）。
// 用 Canvas 繪製再嵌入 jsPDF（中文走系統字體，避開 jsPDF 的 CJK 字型問題）。
// jsPDF 由 index.html 以 CDN 載入為 window.jspdf。

import { fmtPace } from "./paces.js";
import { TYPE_INFO, DAY_HEADERS } from "./schedule.js";
import { describeDay } from "./describe.js";

// A4 直式 @150dpi
const W = 1240, H = 1754;
const MX = 38;                 // 左右邊界
const WEEKS_PER_PAGE = 9;

const COLOR = {
  easy:     { bg: "#dceaf6", fg: "#14364f", bar: "#9CC2E5" },
  speed:    { bg: "#ffe2e2", fg: "#6d1a1a", bar: "#FF9999" },
  tempo:    { bg: "#fff0cc", fg: "#553e00", bar: "#FFC000" },
  strength: { bg: "#e4f1dc", fg: "#2f4d1c", bar: "#C5E0B3" },
  long:     { bg: "#d3e7f7", fg: "#0b3d63", bar: "#0070C0" },
  rest:     { bg: "#f0f1f2", fg: "#7c848c", bar: "#B7BDC3" },
  race:     { bg: "#fbe3c2", fg: "#5b3708", bar: "#e8a33d" },
};

const INK = "#16304a", MUTED = "#6b7c8c", LINE = "#d8e0e8";

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

// 混合中英文的斷行：英數字與 3:45 這類 token 不切開，中文可逐字斷
function wrapText(ctx, text, maxW) {
  const tokens = text.match(/[A-Za-z0-9:.@×–\-]+|\s+|[^\s]/g) || [];
  const lines = [];
  let line = "";
  for (const tk of tokens) {
    const test = line + tk;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line.replace(/\s+$/, ""));
      line = tk.replace(/^\s+/, "");
    } else {
      line = test;
    }
  }
  if (line.trim()) lines.push(line);
  return lines;
}

function drawPage(plan, tier, pageIdx) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";

  let y = 62;

  // ── 頁首 ──
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = font(34, 700);
  ctx.fillText(`漢森${plan.levelLabel}${plan.label}課表 18 週`, MX, y);
  ctx.textAlign = "right";
  ctx.fillStyle = "#b4791f";
  ctx.font = font(28, 700);
  ctx.fillText(`目標 ${tier.goal}`, W - MX, y);
  y += 16;
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(MX, y); ctx.lineTo(W - MX, y); ctx.stroke();
  y += 26;

  // ── 配速摘要條（只在第 1 頁）──
  if (pageIdx === 0) {
    const cards = plan.paceCards;
    const gap = 8;
    const cw = (W - MX * 2 - gap * (cards.length - 1)) / cards.length;
    const ch = 66;
    cards.forEach((card, i) => {
      const x = MX + i * (cw + gap);
      ctx.fillStyle = "#f3f6f9";
      roundRect(ctx, x, y, cw, ch, 8); ctx.fill();
      ctx.textAlign = "center";
      ctx.fillStyle = MUTED;
      ctx.font = font(15, 500);
      ctx.fillText(card.label.replace(/\s*\(.*\)/, ""), x + cw / 2, y + 24);
      ctx.fillStyle = INK;
      ctx.font = font(24, 700);
      ctx.fillText(fmtPace(tier[card.key] + (card.offsetSec || 0)), x + cw / 2, y + 52);
    });
    y += ch + 22;
  }

  // ── 課表表格 ──
  const wkW = 46, volW = 92;
  const dayW = (W - MX * 2 - wkW - volW) / 7;
  const headH = 34;
  const footReserve = 74;
  const rowH = (H - y - headH - footReserve) / WEEKS_PER_PAGE;

  // 表頭
  ctx.fillStyle = "#24455f";
  roundRect(ctx, MX, y, W - MX * 2, headH, 6); ctx.fill();
  ctx.fillStyle = "#e8eff5";
  ctx.font = font(17, 700);
  ctx.textAlign = "center";
  ctx.fillText("週", MX + wkW / 2, y + 23);
  DAY_HEADERS.forEach((d, i) => ctx.fillText(d, MX + wkW + dayW * (i + 0.5), y + 23));
  ctx.fillText("週跑量", MX + wkW + dayW * 7 + volW / 2, y + 23);
  const top = y + headH;

  const start = pageIdx * WEEKS_PER_PAGE;
  const weeks = plan.schedule.slice(start, start + WEEKS_PER_PAGE);

  weeks.forEach((week, i) => {
    const ry = top + i * rowH;

    // 週次
    ctx.fillStyle = "#eef2f6";
    roundRect(ctx, MX, ry + 2, wkW, rowH - 4, 5); ctx.fill();
    ctx.fillStyle = INK;
    ctx.font = font(20, 700);
    ctx.textAlign = "center";
    ctx.fillText(String(start + i + 1), MX + wkW / 2, ry + rowH / 2 + 7);

    // 七天
    week.forEach((day, di) => {
      const c = COLOR[day.t];
      const x = MX + wkW + dayW * di;
      ctx.fillStyle = c.bg;
      roundRect(ctx, x + 2, ry + 2, dayW - 4, rowH - 4, 5); ctx.fill();
      // 左側色條標示類型
      ctx.fillStyle = c.bar;
      roundRect(ctx, x + 2, ry + 2, 5, rowH - 4, 3); ctx.fill();

      ctx.textAlign = "left";
      const tx = x + 12, maxW = dayW - 20;

      // 先算出內容總高，讓整塊在格內垂直置中（避免文字全擠在上緣）
      ctx.font = font(12, 400);
      const all = wrapText(ctx, describeDay(plan, day, tier), maxW);
      const maxLines = Math.floor((rowH - 34) / 15);
      const lines = all.slice(0, maxLines);
      const blockH = 18 + lines.length * 15;
      const startY = ry + Math.max(8, (rowH - blockH) / 2) + 12;

      ctx.fillStyle = c.fg;
      ctx.font = font(14, 700);
      ctx.fillText(TYPE_INFO[day.t].short, tx, startY);

      ctx.font = font(12, 400);
      lines.forEach((ln, li) => ctx.fillText(ln, tx, startY + 18 + li * 15));
    });

    // 週跑量
    const total = Math.round(week.reduce((s, d) => s + d.d, 0) * 10) / 10;
    ctx.fillStyle = "#fdf4e4";
    roundRect(ctx, MX + wkW + dayW * 7 + 2, ry + 2, volW - 4, rowH - 4, 5); ctx.fill();
    ctx.fillStyle = "#8a5a08";
    ctx.font = font(19, 700);
    ctx.textAlign = "center";
    ctx.fillText(`${total}K`, MX + wkW + dayW * 7 + volW / 2, ry + rowH / 2 + 7);
  });

  // ── 頁尾 ──
  const fy = H - 44;
  ctx.textAlign = "left";
  ctx.fillStyle = MUTED;
  ctx.font = font(14, 400);
  ctx.fillText("配速依據《漢森馬拉松訓練法》｜暖身、收操與組間緩跑請用恢復跑配速", MX, fy);
  ctx.textAlign = "right";
  ctx.fillStyle = INK;
  ctx.font = font(15, 700);
  ctx.fillText(`Med日跑者　medrunner-mark.github.io/hanson-fit-generator　${pageIdx + 1}/2`, W - MX, fy);

  return canvas;
}

// 產生全部頁面的畫布（供 PDF 輸出，也方便單獨檢視版面）
export function renderPages(plan, tier) {
  const n = Math.ceil(plan.schedule.length / WEEKS_PER_PAGE);
  return Array.from({ length: n }, (_, p) => drawPage(plan, tier, p));
}

export function downloadPdf(plan, tier) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  renderPages(plan, tier).forEach((canvas, p) => {
    if (p > 0) pdf.addPage();
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 210, 297);
  });
  pdf.save(`${plan.namePrefix}sub${tier.goal.replace(":", "")}_18週課表.pdf`);
}
