// 18週課表行事曆資料：逐字轉錄自「漢森課表模板_互動版.xlsx」的「總課表」工作表。
// 每週7天（週一~週日），t=課表類型，d=當日里程(km)，label=課表內容簡述。
// 速度跑/強化跑的里程沿用總課表的計法（暖身+主課表+收操，不含組間恢復跑）。
// 週跑量由每日里程加總計算，不另外硬編碼。
//
// 註：原xlsx第18週週六標示「5k Easy」但里程欄誤植為10，此處依課表內容取5K。

export const DAY_HEADERS = ["一", "二", "三", "四", "五", "六", "日"];

// name = 圖例用全名；short = 行事曆格內用短名（讓整張表在手機上不必橫向捲動）
export const TYPE_INFO = {
  easy:     { name: "輕鬆有氧", short: "輕鬆", cls: "t-easy" },
  speed:    { name: "速度跑",   short: "速度", cls: "t-speed" },
  tempo:    { name: "節奏跑",   short: "節奏", cls: "t-tempo" },
  strength: { name: "強化跑",   short: "強化", cls: "t-strength" },
  long:     { name: "長跑",     short: "長跑", cls: "t-long" },
  rest:     { name: "休息日",   short: "休息", cls: "t-rest" },
  race:     { name: "比賽日",   short: "比賽", cls: "t-race" },
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
