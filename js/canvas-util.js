// 課表圖（poster.js）與 PDF（pdfgen.js）共用的 Canvas 小工具。
// 兩邊原本各有一份字元完全相同的 font() 與 roundRect()，收攏在這裡。

// 之後要加日文/英文字型堆疊時，只需要改這一個函式。
export function font(size, weight = 400) {
  return `${weight} ${size}px "Noto Sans TC","Microsoft JhengHei","PingFang TC",sans-serif`;
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
