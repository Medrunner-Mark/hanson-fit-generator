// 手機直式課表圖產生器（1080×1920，9:16）：用 Canvas 直接繪製，無外部依賴。
// 網頁上顯示的行事曆維持原樣，這裡是專為手機/IG 重新排版的下載版本：
// 加大字級、深色底、色塊對比提高，縮圖在手機上也看得清楚。

import { fmtPace } from "./paces.js";
import { TYPE_INFO, dayHeaders } from "./schedule.js";
import { font, roundRect, fitText } from "./canvas-util.js";
import { cardLabelShort } from "./plans.js";
import { dayLabel } from "./describe.js";
import { t } from "./i18n.js";

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
  // 標題與副標原本沒有任何寬度上限，英文的「Hansons Beginner Half Marathon
  // 18-Week Plan」會直接衝出畫布，改走 fitText 自動讓步。
  const titleW = W - 80;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  fitText(ctx, t("poster.title", { level: plan.levelLabel }), W / 2, 116, titleW, 60, 700);

  ctx.fillStyle = "#e8a33d";
  fitText(ctx, t("poster.subtitle", { dist: plan.label, goal: tier.goal }), W / 2, 182, titleW, 46, 700);

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
    fitText(ctx, cardLabelShort(card), x + cw / 2, y + 44, cw - 16, 24, 500);
    ctx.fillStyle = "#ffffff";
    ctx.font = font(44, 700);
    ctx.fillText(fmtPace(tier[card.key]), x + cw / 2, y + 96);
    ctx.fillStyle = "#7d9db5";
    ctx.font = font(20, 400);
    ctx.fillText(t("ui.paceUnit"), x + cw / 2, y + 122);
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
  ctx.textAlign = "center";
  fitText(ctx, t("poster.week"), tableX + wkColW / 2, headerY + 34, wkColW - 8, 26, 700);
  dayHeaders().forEach((d, i) => {
    fitText(ctx, d, tableX + wkColW + dayColW * (i + 0.5), headerY + 34, dayColW - 8, 26, 700);
  });
  fitText(ctx, t("poster.volume"), tableX + wkColW + dayColW * 7 + totColW / 2, headerY + 34, totColW - 8, 26, 700);

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

      // 日期格只有約 111px 可用，英文的 Strength 在 23px 就要 104px，已經卡邊
      const cellW = dayColW - 10;
      ctx.fillStyle = c.fg;
      if (day.t === "rest") {
        fitText(ctx, info.short, x + dayColW / 2, y + rowH / 2 + 10, cellW, 26, 700);
      } else {
        fitText(ctx, info.short, x + dayColW / 2, y + rowH / 2 - 2, cellW, 23, 700);
        const lbl = day.t === "race" ? `${day.d}K` : dayLabel(day);
        fitText(ctx, lbl, x + dayColW / 2, y + rowH / 2 + 24, cellW, 20, 500);
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
  fitText(ctx, t("ui.authorName"), W / 2, footY, titleW, 34, 700);
  ctx.fillStyle = "#7d9db5";
  fitText(ctx, "medrunner-mark.github.io/hanson-fit-generator", W / 2, footY + 42, titleW, 24, 400);

  return canvas;
}
