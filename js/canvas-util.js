// 課表圖（poster.js）與 PDF（pdfgen.js）共用的 Canvas 小工具。

import { lang } from "./i18n.js";

// 語言別字型堆疊。
//
// ja 與 en 都刻意保留中文字型當尾端後備：品牌字串「Med日跑者」不論介面語言都含
// 漢字，少了尾巴英文版頁尾會變成豆腐字。
//
// 日文用系統內建字型（不載網頁字型）。多數日文使用者的 Windows/macOS 都有
// Yu Gothic 或 Hiragino，但在沒裝日文字型的中文系機器上會掉到 PingFang TC／
// 微軟正黑體，部分共用漢字會顯示成中文字形（直、骨、今 等在兩地的標準字形不同）。
// 這是已知取捨——真的需要時再改載 Noto Sans JP。
const STACK = {
  zh: '"Noto Sans TC","Microsoft JhengHei","PingFang TC",sans-serif',
  ja: '"Noto Sans JP","Yu Gothic UI","Yu Gothic","Hiragino Sans","Hiragino Kaku Gothic ProN","Meiryo","Noto Sans TC","Microsoft JhengHei",sans-serif',
  en: '"Inter","Segoe UI","Helvetica Neue",Arial,"Noto Sans TC","Microsoft JhengHei",sans-serif',
};

export function font(size, weight = 400) {
  return `${weight} ${size}px ${STACK[lang()] ?? STACK.zh}`;
}

export function roundRect(ctx, x, y, w, h, r) {
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

// 在寬度上限內畫一行字：先逐級縮小字級，仍塞不下才交給瀏覽器橫向壓縮。
//
// 課表圖的版面是照中文字寬手調的，換成英文一定會爆——例如日期格只有 111px 可用，
// 但 "Strength" 在 23px 就要 104px；標題「Hansons Beginner Half Marathon…」更是
// 直接衝出 1080px 的畫布。這個函式讓版面自己讓步，不必為每種語言另外調座標。
//
// 中文目前沒有任何一處會觸發縮小，所以對中文輸出是 no-op（塞得下時連 maxWidth
// 參數都不傳，確保與改前逐位元相同）。
export function fitText(ctx, text, x, y, maxW, size, weight = 400, minRatio = 0.7) {
  const floor = Math.max(8, Math.ceil(size * minRatio));
  let s = size;
  ctx.font = font(s, weight);
  while (s > floor && ctx.measureText(text).width > maxW) {
    s -= 1;
    ctx.font = font(s, weight);
  }
  if (ctx.measureText(text).width > maxW) ctx.fillText(text, x, y, maxW);
  else ctx.fillText(text, x, y);
  return s;
}
