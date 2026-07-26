// 手機直式課表圖產生器（1080×1920，9:16）：用 Canvas 直接繪製，無外部依賴。
// 網頁上顯示的行事曆維持原樣，這裡是專為手機/IG 重新排版的下載版本：
// 加大字級、深色底、色塊對比提高，縮圖在手機上也看得清楚。

import { fmtPace } from "./paces.js";
import { TYPE_INFO, DAY_HEADERS } from "./schedule.js";
import { font, roundRect } from "./canvas-util.js";

export function buildPoster(plan, tier) {
  const W = 1080, H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // ── 背景 ──
  ctx.fillStyle = "#132635";
  ctx.fillRect(0, 0, W, H);

  // ── 標題 ──
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  ctx.font = font(60, 700);
  ctx.fillText(`漢森${plan.levelLabel} 18 週課表`, W / 2, 116);

  ctx.fillStyle = "#e8a33d";
  ctx.font = font(46, 700);
  ctx.fillText(`${plan.label}　目標 ${tier.goal}`, W / 2, 182);

  // ── 配速摘要（4 格：長跑 / 節奏 / 強化 / 速度）──
  const cards = plan.paceCards.slice(3, 7);
  const cw = 236, ch = 132, gap = 16;
  const startX = (W - (cw * 4 + gap * 3)) / 2;
  cards.forEach((card, i) => {
    const x = startX + i * (cw + gap), y = 226;
    ctx.fillStyle = "#1d3a4d";
    roundRect(ctx, x, y, cw, ch, 16);
    ctx.fill();
    ctx.textAlign = "center";
    ctx.fillStyle = "#9fc0d8";
    ctx.font = font(24, 500);
    ctx.fillText(card.label.replace(/\s*\(.*\)/, ""), x + cw / 2, y + 44);
    ctx.fillStyle = "#ffffff";
    ctx.font = font(44, 700);
    ctx.fillText(fmtPace(tier[card.key]), x + cw / 2, y + 96);
    ctx.fillStyle = "#7d9db5";
    ctx.font = font(20, 400);
    ctx.fillText("/km", x + cw / 2, y + 122);
  });

  // ── 課表格 ──
  const marginX = 40;
  const wkColW = 72;
  const totColW = 108;
  const dayColW = (W - marginX * 2 - wkColW - totColW) / 7;
  const tableX = marginX;
  const headerY = 400;
  const headerH = 50;
  const rowH = 64;
  const tableTop = headerY + headerH;

  // 表頭
  ctx.fillStyle = "#25455c";
  roundRect(ctx, tableX, headerY, W - marginX * 2, headerH, 10);
  ctx.fill();
  ctx.fillStyle = "#cfe0ec";
  ctx.font = font(26, 700);
  ctx.textAlign = "center";
  ctx.fillText("週", tableX + wkColW / 2, headerY + 34);
  DAY_HEADERS.forEach((d, i) => {
    ctx.fillText(d, tableX + wkColW + dayColW * (i + 0.5), headerY + 34);
  });
  ctx.fillText("週跑量", tableX + wkColW + dayColW * 7 + totColW / 2, headerY + 34);

  // 每一週
  plan.schedule.forEach((week, wi) => {
    const y = tableTop + wi * rowH;

    // 週次
    ctx.fillStyle = "#8fb0c7";
    ctx.font = font(26, 700);
    ctx.textAlign = "center";
    ctx.fillText(String(wi + 1), tableX + wkColW / 2, y + rowH / 2 + 9);

    // 七天
    week.forEach((day, di) => {
      const info = TYPE_INFO[day.t];
      const c = info.poster;
      const x = tableX + wkColW + dayColW * di;
      ctx.fillStyle = c.bg;
      roundRect(ctx, x + 3, y + 3, dayColW - 6, rowH - 6, 8);
      ctx.fill();

      ctx.fillStyle = c.fg;
      if (day.t === "rest") {
        ctx.font = font(26, 700);
        ctx.fillText(info.short, x + dayColW / 2, y + rowH / 2 + 10);
      } else {
        ctx.font = font(23, 700);
        ctx.fillText(info.short, x + dayColW / 2, y + rowH / 2 - 2);
        ctx.font = font(20, 500);
        const lbl = day.t === "race" ? `${day.d}K` : day.label;
        ctx.fillText(lbl, x + dayColW / 2, y + rowH / 2 + 24);
      }
    });

    // 週跑量
    const total = Math.round(week.reduce((s, d) => s + d.d, 0) * 10) / 10;
    ctx.fillStyle = "#e8a33d";
    ctx.font = font(28, 700);
    ctx.fillText(`${total}K`, tableX + wkColW + dayColW * 7 + totColW / 2, y + rowH / 2 + 10);
  });

  // ── 底部品牌 ──
  const footY = tableTop + 18 * rowH + 56;
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = font(34, 700);
  ctx.fillText("Med日跑者", W / 2, footY);
  ctx.fillStyle = "#7d9db5";
  ctx.font = font(24, 400);
  ctx.fillText("medrunner-mark.github.io/hanson-fit-generator", W / 2, footY + 42);

  return canvas;
}
