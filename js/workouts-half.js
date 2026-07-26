// 18份去重後的漢森進階半馬課表模板（結構固定，配速隨使用者半馬目標時間查表變動）。
// 結構依據「漢森進階半馬課表模板_互動版.xlsx」的「總課表」工作表。
//
// step 種類與全馬版相同（見 workouts.js）。paceKey：
//   hmp    節奏跑=半馬配速 ±5s
//   tenK   強化跑=10K配速 ±5s
//   long   長跑配速 ±5s
//   speed  速度跑=5公里配速 ±5s（快端=5K配速−5，慢端=5K配速+5）
//
// 註：半馬速度跑的「組間恢復跑」距離隨課表變動（400m/600m/800m），與全馬版不同。

export const HALF_WORKOUTS = [
  // ─── 速度跑（第2-10週，5-10K配速）───
  { id: "speed_12x400", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 400, paceKey: "speed" },
    { kind: "jog", dist: 400 },
    { kind: "repeat", backTo: 1, times: 12 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "speed_8x600", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 600, paceKey: "speed" },
    { kind: "jog", dist: 400 },
    { kind: "repeat", backTo: 1, times: 8 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "speed_6x800", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 800, paceKey: "speed" },
    { kind: "jog", dist: 400 },
    { kind: "repeat", backTo: 1, times: 6 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "speed_5x1000", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 1000, paceKey: "speed" },
    { kind: "jog", dist: 600 },
    { kind: "repeat", backTo: 1, times: 5 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "speed_4x1200", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 1200, paceKey: "speed" },
    { kind: "jog", dist: 600 },
    { kind: "repeat", backTo: 1, times: 4 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "speed_3x2000", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 2000, paceKey: "speed" },
    { kind: "jog", dist: 800 },
    { kind: "repeat", backTo: 1, times: 3 },
    { kind: "cd", dist: 2000 },
  ]},

  // ─── 強化跑（第11-17週，10K配速）───
  { id: "str_6x2000", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 2000, paceKey: "tenK" },
    { kind: "jog", dist: 400 },
    { kind: "repeat", backTo: 1, times: 6 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "str_4x2000", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 2000, paceKey: "tenK" },
    { kind: "jog", dist: 800 },
    { kind: "repeat", backTo: 1, times: 4 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "str_3x3000", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 3000, paceKey: "tenK" },
    { kind: "jog", dist: 800 },
    { kind: "repeat", backTo: 1, times: 3 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "str_2x5000", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 5000, paceKey: "tenK" },
    { kind: "jog", dist: 2000 },
    { kind: "repeat", backTo: 1, times: 2 },
    { kind: "cd", dist: 2000 },
  ]},

  // ─── 節奏跑（半馬配速 HMP，2K暖身＋2K收操）───
  { id: "tempo_5k", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 5000, paceKey: "hmp" },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "tempo_6k", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 6000, paceKey: "hmp" },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "tempo_8k", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 8000, paceKey: "hmp" },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "tempo_10k", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 10000, paceKey: "hmp" },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "tempo_11k", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 11000, paceKey: "hmp" },
    { kind: "cd", dist: 2000 },
  ]},

  // ─── 長跑（長跑配速，單一段落）───
  { id: "long_16k", steps: [
    { kind: "main", dist: 16000, paceKey: "long" },
  ]},
  { id: "long_19k", steps: [
    { kind: "main", dist: 19000, paceKey: "long" },
  ]},
  { id: "long_23k", steps: [
    { kind: "main", dist: 23000, paceKey: "long" },
  ]},
];
