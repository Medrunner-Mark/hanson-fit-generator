// 18週課表行事曆資料：逐字轉錄自「漢森課表模板_互動版.xlsx」的「總課表」工作表。
// 每週7天（週一~週日），t=課表類型，d=當日里程(km)，label=課表內容簡述。
// 速度跑/強化跑的里程沿用總課表的計法（暖身+主課表+收操，不含組間恢復跑）。
// 週跑量由每日里程加總計算，不另外硬編碼。
//
// 註：原xlsx第18週週六標示「5k Easy」但里程欄誤植為10，此處依課表內容取5K。

export const DAY_HEADERS = ["一", "二", "三", "四", "五", "六", "日"];

// 課表類型的單一資料來源：網頁、課表圖、PDF 三邊共用。
//   name  = 圖例用全名
//   short = 行事曆格內用短名（讓整張表在手機上不必橫向捲動），課表圖也用這個
//   cls   = 網頁 CSS class（色票在 style.css）
//   poster / pdf = 兩張畫布各自的色票。刻意分開不合併：課表圖是深色底、
//                  PDF 是白底列印用，同一個類型在兩邊的底色本來就不同。
export const TYPE_INFO = {
  easy: {
    name: "輕鬆有氧", short: "輕鬆", cls: "t-easy",
    poster: { bg: "#9CC2E5", fg: "#12354f" },
    pdf:    { bg: "#dceaf6", fg: "#14364f", bar: "#9CC2E5" },
  },
  speed: {
    name: "速度跑", short: "速度", cls: "t-speed",
    poster: { bg: "#FF9999", fg: "#6d1a1a" },
    pdf:    { bg: "#ffe2e2", fg: "#6d1a1a", bar: "#FF9999" },
  },
  tempo: {
    name: "節奏跑", short: "節奏", cls: "t-tempo",
    poster: { bg: "#FFC000", fg: "#553e00" },
    pdf:    { bg: "#fff0cc", fg: "#553e00", bar: "#FFC000" },
  },
  strength: {
    name: "強化跑", short: "強化", cls: "t-strength",
    poster: { bg: "#C5E0B3", fg: "#2f4d1c" },
    pdf:    { bg: "#e4f1dc", fg: "#2f4d1c", bar: "#C5E0B3" },
  },
  long: {
    name: "長跑", short: "長跑", cls: "t-long",
    poster: { bg: "#0070C0", fg: "#ffffff" },
    pdf:    { bg: "#d3e7f7", fg: "#0b3d63", bar: "#0070C0" },
  },
  rest: {
    name: "休息日", short: "休息", cls: "t-rest",
    poster: { bg: "#6f6f6f", fg: "#ededed" },
    pdf:    { bg: "#f0f1f2", fg: "#7c848c", bar: "#B7BDC3" },
  },
  race: {
    name: "比賽日", short: "比賽", cls: "t-race",
    poster: { bg: "#e8a33d", fg: "#42270a" },
    pdf:    { bg: "#fbe3c2", fg: "#5b3708", bar: "#e8a33d" },
  },
};

const e = d => ({ t: "easy", d, label: `${d}K` });
const rest = () => ({ t: "rest", d: 0, label: "休息" });
const sp = (label, d) => ({ t: "speed", d, label });
const st = (label, d) => ({ t: "strength", d, label });
const tp = (k, d) => ({ t: "tempo", d, label: `${k}K` });
const lg = d => ({ t: "long", d, label: `${d}K` });

export const SCHEDULE = [
  /* W1  */ [e(10), e(10),              rest(), e(10),      e(10), e(10), e(10)],
  /* W2  */ [e(10), sp("12x400", 8.8),  rest(), e(10),      e(10), e(10), e(13)],
  /* W3  */ [e(10), sp("8x600", 11),    rest(), tp(10, 14), e(11), e(10), lg(16)],
  /* W4  */ [e(10), sp("5x1000", 11),   rest(), tp(10, 14), e(10), e(13), lg(16)],
  /* W5  */ [e(10), sp("5x1000", 11),   rest(), tp(10, 14), e(11), e(13), lg(19)],
  /* W6  */ [e(10), sp("3x2000", 12.4), rest(), tp(11, 15), e(10), e(13), e(16)],
  /* W7  */ [e(10), sp("3x2000", 12.4), rest(), tp(11, 15), e(11), e(13), lg(23)],
  /* W8  */ [e(10), sp("4x1200", 10.4), rest(), tp(11, 15), e(10), e(16), lg(23)],
  /* W9  */ [e(13), sp("5x1000", 11),   rest(), tp(13, 17), e(11), e(13), lg(24)],
  /* W10 */ [e(10), sp("6x800", 11.2),  rest(), tp(13, 17), e(10), e(16), lg(16)],
  /* W11 */ [e(13), st("6x2000", 18.4), rest(), tp(13, 17), e(11), e(13), lg(26)],
  /* W12 */ [e(10), st("4x2000", 15.2), rest(), tp(14, 18), e(10), e(16), lg(16)],
  /* W13 */ [e(13), st("3x3000", 19.2), rest(), tp(14, 18), e(11), e(13), lg(26)],
  /* W14 */ [e(10), st("2x5000", 18),   rest(), tp(14, 18), e(10), e(16), lg(16)],
  /* W15 */ [e(13), st("3x3000", 19.2), rest(), tp(16, 20), e(11), e(13), lg(26)],
  /* W16 */ [e(10), st("4x2000", 15.2), rest(), tp(16, 20), e(10), e(16), lg(16)],
  /* W17 */ [e(13), st("6x2000", 18.4), rest(), tp(16, 20), e(11), e(13), e(13)],
  /* W18 */ [e(10), e(8),               rest(), e(10),      e(10), e(5),  { t: "race", d: 42.2, label: "全馬 42.2K" }],
];
