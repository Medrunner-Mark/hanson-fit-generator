// A4 課表 PDF：兩頁，每頁 9 週，每天顯示完整課表明細（含該目標時間的實際配速）。
// 用 Canvas 繪製再嵌入 jsPDF（中文走系統字體，避開 jsPDF 的 CJK 字型問題）。
// jsPDF 由 index.html 以 CDN 載入為 window.jspdf。
//
// 版面座標一律使用 1240×1754（A4 @150dpi）的邏輯空間；實際畫布再乘上 SCALE
// 輸出 300dpi，繪製程式碼不必知道這件事。輸出用 PNG 而非 JPEG——整頁都是文字與
// 純色塊，JPEG 的 DCT 會在文字邊緣產生振鈴雜訊（就是「糊掉」的來源）。

import { fmtPace, goalCode } from "./paces.js";
import { TYPE_INFO, DAY_HEADERS } from "./schedule.js";
import { describeDay } from "./describe.js";
import { font, roundRect } from "./canvas-util.js";
import { shortDate } from "./dates.js";

// A4 直式 @150dpi 的邏輯座標
const W = 1240, H = 1754;
const MX = 38;                 // 左右邊界
const WEEKS_PER_PAGE = 9;
const SCALE = 2;               // 150dpi × 2 = 300dpi（列印標準）

// 日期格文字自動字級的搜尋範圍：由大而小，取「全文件每一格都塞得下」的最大值
const BODY_MAX = 22, BODY_MIN = 12;

const INK = "#16304a", MUTED = "#6b7c8c", LINE = "#d8e0e8";

// 混合中英文的斷行：英數字與 3:45 這類 token 不切開，中文可逐字斷。
// 單一 token 本身就超過行寬時逐字硬斷——沒有這道保險，長英文字會靜默溢出格子。
function wrapText(ctx, text, maxW) {
  const tokens = text.match(/[A-Za-z0-9:.@×–\-]+|\s+|[^\s]/g) || [];
  const lines = [];
  let line = "";
  for (const tk of tokens) {
    if (ctx.measureText(tk).width > maxW) {
      if (line.trim()) lines.push(line.replace(/\s+$/, ""));
      let chunk = "";
      for (const ch of tk) {
        if (chunk && ctx.measureText(chunk + ch).width > maxW) { lines.push(chunk); chunk = ch; }
        else chunk += ch;
      }
      line = chunk;
      continue;
    }
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

// 格內內容一律靠上對齊，剩下的空白全部落在下半部供手寫筆記。
// 副作用正是我們要的：同一週七格的標題都從同一個 y 起算，自動齊高。
const TOP_PAD = 10;

// 由 body 字級推導同一格內其他尺寸，讓整組隨字級等比縮放。
// typeSize 係數上限是 1.25：再大 gap 就會吃掉一行預算，把 pickBodySize 從 18px
// 逼到 17px。實測 18px 時有 378 個格子需要滿 5 行，一行都讓不得。
function metrics(body) {
  const typeSize = Math.round(body * 1.25);        // 類型名（粗體）
  return {
    body,
    typeSize,
    lineH: Math.round(body * 1.3),                 // 內文行高
    gap: Math.round(typeSize * 1.3),               // 類型名基線 → 首行內文基線
    capOffset: Math.round(typeSize * 0.86),        // 區塊頂端 → 類型名基線
  };
}

// 頁面幾何。第 1 頁多一條配速摘要，rowH 較小，是自動字級的瓶頸。
function pageGeom(pageIdx) {
  let y = 62 + 16 + 26;
  if (pageIdx === 0) y += 66 + 22;
  const headH = 34, footReserve = 74;
  const wkW = 46, volW = 92;
  return {
    y, headH, wkW, volW,
    dayW: (W - MX * 2 - wkW - volW) / 7,
    rowH: (H - y - headH - footReserve) / WEEKS_PER_PAGE,
  };
}

const maxLinesFor = (m, rowH) => Math.floor((rowH - m.gap - 16) / m.lineH);

// 全文件共用一個字級：掃描 BODY_MAX→BODY_MIN，取所有格子都放得下的最大值。
// 統一字級的版面比「每格各自撐滿」整齊，而且日文/英文文字變長時會自動選小一級，
// 不需要為每種語言另外調版。
function pickBodySize(plan, tier) {
  const { dayW, rowH } = pageGeom(0);            // 以最窄的一頁為準，兩頁才一致
  const maxW = dayW - 20;
  const ctx = document.createElement("canvas").getContext("2d");
  const texts = plan.schedule.flat().map(day => describeDay(plan, day, tier));
  for (let body = BODY_MAX; body > BODY_MIN; body--) {
    const m = metrics(body);
    const maxLines = maxLinesFor(m, rowH);
    if (maxLines < 1) continue;
    ctx.font = font(body, 400);
    if (texts.every(t => wrapText(ctx, t, maxW).length <= maxLines)) return body;
  }
  return BODY_MIN;
}

function drawPage(plan, tier, pageIdx, { body, pages, scale = SCALE, dates = null }) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  // alpha:false → 不透明畫布，PNG 較小，也避免 jsPDF 另外產生一層 soft mask
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";

  const m = metrics(body);
  let y = 62;

  // ── 頁首 ──
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = font(34, 700);
  ctx.fillText(`漢森${plan.levelLabel}${plan.label}課表 18 週`, MX, y);

  // 目標時間：琥珀色徽章，讓人一翻開就看到自己在追什麼。
  // 徽章必須塞進既有的頁首高度——把頁首撐高會壓縮 rowH，連帶讓自動字級掉一級。
  const goalTxt = `目標 ${tier.goal}`;
  ctx.font = font(34, 700);
  const gpad = 20, gh = 46;
  const gw = ctx.measureText(goalTxt).width + gpad * 2;
  ctx.fillStyle = "#e8a33d";
  roundRect(ctx, W - MX - gw, y - 34, gw, gh, 10); ctx.fill();
  ctx.fillStyle = "#4a2c05";
  ctx.textAlign = "left";
  ctx.fillText(goalTxt, W - MX - gw + gpad, y);
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
      ctx.font = font(17, 500);
      ctx.fillText(card.label.replace(/\s*\(.*\)/, ""), x + cw / 2, y + 25);
      ctx.fillStyle = INK;
      ctx.font = font(24, 700);
      ctx.fillText(fmtPace(tier[card.key] + (card.offsetSec || 0)), x + cw / 2, y + 53);
    });
    y += ch + 22;
  }

  // ── 課表表格 ──
  const { headH, wkW, volW, dayW, rowH } = pageGeom(pageIdx);

  // 表頭
  ctx.fillStyle = "#24455f";
  roundRect(ctx, MX, y, W - MX * 2, headH, 6); ctx.fill();
  ctx.fillStyle = "#e8eff5";
  ctx.font = font(20, 700);
  ctx.textAlign = "center";
  ctx.fillText("週", MX + wkW / 2, y + 24);
  DAY_HEADERS.forEach((d, i) => ctx.fillText(d, MX + wkW + dayW * (i + 0.5), y + 24));
  ctx.fillText("週跑量", MX + wkW + dayW * 7 + volW / 2, y + 24);
  const top = y + headH;

  const start = pageIdx * WEEKS_PER_PAGE;
  const weeks = plan.schedule.slice(start, start + WEEKS_PER_PAGE);
  const maxLines = maxLinesFor(m, rowH);

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
      const c = TYPE_INFO[day.t].pdf;
      const x = MX + wkW + dayW * di;
      ctx.fillStyle = c.bg;
      roundRect(ctx, x + 2, ry + 2, dayW - 4, rowH - 4, 5); ctx.fill();
      // 左側色條標示類型
      ctx.fillStyle = c.bar;
      roundRect(ctx, x + 2, ry + 2, 5, rowH - 4, 3); ctx.fill();

      ctx.textAlign = "left";
      const tx = x + 12, maxW = dayW - 20;

      ctx.font = font(m.body, 400);
      const all = wrapText(ctx, describeDay(plan, day, tier), maxW);
      const lines = all.slice(0, maxLines);
      if (all.length > lines.length && lines.length) {
        // 截斷要看得出來（自動字級正常運作時不該發生）
        let t = lines[lines.length - 1];
        while (t && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
        lines[lines.length - 1] = t + "…";
      }
      // 靠上對齊：空白全部集中到格子下半部，留給使用者手寫筆記
      const startY = ry + TOP_PAD + m.capOffset;

      ctx.fillStyle = c.fg;
      ctx.font = font(m.typeSize, 700);
      ctx.fillText(TYPE_INFO[day.t].short, tx, startY);
      const typeW = ctx.measureText(TYPE_INFO[day.t].short).width;

      // 里程與日期都放在標題這一列的右側，不佔內文行數預算。
      // 不放右下角是因為滿版（5 行）的格子會一路寫到底，右下角根本沒有空位——
      // 而慢速目標時間的使用者正好整份課表都是滿版格子。
      const km = day.d > 0 ? String(day.d) : "";
      const ds = dates ? shortDate(dates[start + i][di]) : "";
      if (km || ds) {
        // 與類型名至少保留 8px 間距。「比賽 11/29 42.2」這種最長的組合在固定字級下
        // 會直接撞上類型名，所以量測後不夠寬就整組等比縮小。
        const avail = dayW - 22 - typeW - 8;
        let kf = Math.round(m.body * 0.92), df = Math.round(m.body * 0.76);
        const groupW = () => {
          let w = 0;
          if (km) { ctx.font = font(kf, 700); w += ctx.measureText(km).width; }
          if (ds) { ctx.font = font(df, 500); w += ctx.measureText(ds).width; }
          return w + (km && ds ? 6 : 0);
        };
        while (groupW() > avail && kf > 10) { kf--; if (df > 9) df--; }

        ctx.textAlign = "right";
        let rx = x + dayW - 10;
        if (km) {
          ctx.fillStyle = c.fg;
          ctx.font = font(kf, 700);
          ctx.fillText(km, rx, startY);
          rx -= ctx.measureText(km).width + 6;
        }
        if (ds) {
          ctx.fillStyle = MUTED;
          ctx.font = font(df, 500);
          ctx.fillText(ds, rx, startY);
        }
        ctx.textAlign = "left";
      }

      ctx.fillStyle = c.fg;
      ctx.font = font(m.body, 400);
      lines.forEach((ln, li) => ctx.fillText(ln, tx, startY + m.gap + li * m.lineH));
    });

    // 週跑量
    const total = Math.round(week.reduce((s, d) => s + d.d, 0) * 10) / 10;
    ctx.fillStyle = "#fdf4e4";
    roundRect(ctx, MX + wkW + dayW * 7 + 2, ry + 2, volW - 4, rowH - 4, 5); ctx.fill();
    ctx.fillStyle = "#8a5a08";
    ctx.font = font(22, 700);
    ctx.textAlign = "center";
    ctx.fillText(`${total}K`, MX + wkW + dayW * 7 + volW / 2, ry + rowH / 2 + 8);
  });

  // ── 頁尾 ──
  const fy = H - 44;
  ctx.textAlign = "left";
  ctx.fillStyle = MUTED;
  ctx.font = font(17, 400);
  ctx.fillText("配速依據《漢森馬拉松訓練法》｜暖身、收操與組間緩跑請用恢復跑配速", MX, fy);
  ctx.textAlign = "right";
  ctx.fillStyle = INK;
  ctx.font = font(17, 700);
  ctx.fillText(`Med日跑者　medrunner-mark.github.io/hanson-fit-generator　${pageIdx + 1}/${pages}`, W - MX, fy);

  return canvas;
}

const pageCount = plan => Math.ceil(plan.schedule.length / WEEKS_PER_PAGE);

// 產生全部頁面的畫布（供 PDF 輸出，也方便單獨檢視版面）
// dates 省略時不畫任何日期，維持未選比賽日的原樣。
export function renderPages(plan, tier, dates = null) {
  const pages = pageCount(plan);
  const body = pickBodySize(plan, tier);
  return Array.from({ length: pages }, (_, p) => drawPage(plan, tier, p, { body, pages, dates }));
}

export function downloadPdf(plan, tier, dates = null) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pages = pageCount(plan);
  const body = pickBodySize(plan, tier);

  for (let p = 0; p < pages; p++) {
    let url = "";
    // 300dpi 的畫布約 35MB；記憶體吃緊的裝置可能產不出來，逐級降階重試
    for (const scale of [SCALE, 1.5, 1]) {
      const canvas = drawPage(plan, tier, p, { body, pages, scale, dates });
      url = canvas.toDataURL("image/png");
      canvas.width = canvas.height = 0;   // 立刻釋放，不要同時持有兩頁
      if (url && url.length > 100) break;
    }
    if (!url || url.length <= 100) throw new Error("畫布過大，無法產生 PDF");
    if (p > 0) pdf.addPage();
    // 第 8 個參數 compression 一定要給：jsPDF 預設 "NONE" 會把 PNG 解成未壓縮點陣
    // 塞進 PDF（本檔會變成 66MB）。實測 FAST 的檔案最小也最快，MEDIUM 反而較大。
    pdf.addImage(url, "PNG", 0, 0, 210, 297, undefined, "FAST");
  }

  pdf.save(`${plan.namePrefix}sub${goalCode(tier.goal)}_18週課表.pdf`);
}
