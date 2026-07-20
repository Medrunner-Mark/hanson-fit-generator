// 20份去重後的漢森進階版課表模板（結構固定，配速隨使用者目標時間查表變動）。
// 結構依據「漢森課表模板_互動版.xlsx」的「總課表」工作表。
//
// step 種類：
//   wu     暖身（恢復跑~輕鬆有氧A 配速區間）
//   cd     收操（同上）
//   main   主課表（配速依 paceKey 決定）
//   jog    組間恢復跑（恢復跑~輕鬆有氧A 配速區間）
//   repeat 重複前面步驟（backTo=回到第幾個step index，times=總組數）
//
// paceKey：
//   tempo    節奏跑配速 ±5s
//   strength 強化跑配速 ±5s
//   long     長跑配速 ±5s
//   speed    5-10K 配速區間（快端=5K配速，慢端=10K配速）

export const WORKOUTS = [
  // ─── 速度跑（第1-10週，5-10K配速）───
  { id: "speed_12x400",  category: "速度跑", label: "速度跑12x400",  steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 400, paceKey: "speed" },
    { kind: "jog", dist: 400 },
    { kind: "repeat", backTo: 1, times: 12 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "speed_8x600",   category: "速度跑", label: "速度跑8x600",   steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 600, paceKey: "speed" },
    { kind: "jog", dist: 400 },
    { kind: "repeat", backTo: 1, times: 8 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "speed_5x1000",  category: "速度跑", label: "速度跑5x1000",  steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 1000, paceKey: "speed" },
    { kind: "jog", dist: 400 },
    { kind: "repeat", backTo: 1, times: 5 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "speed_3x2000",  category: "速度跑", label: "速度跑3x2000",  steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 2000, paceKey: "speed" },
    { kind: "jog", dist: 800 },
    { kind: "repeat", backTo: 1, times: 3 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "speed_4x1200",  category: "速度跑", label: "速度跑4x1200",  steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 1200, paceKey: "speed" },
    { kind: "jog", dist: 400 },
    { kind: "repeat", backTo: 1, times: 4 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "speed_6x800",   category: "速度跑", label: "速度跑6x800",   steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 800, paceKey: "speed" },
    { kind: "jog", dist: 400 },
    { kind: "repeat", backTo: 1, times: 6 },
    { kind: "cd", dist: 2000 },
  ]},

  // ─── 強化跑（第11-17週，強化跑配速）───
  { id: "str_6x2000",    category: "強化跑", label: "強化跑6x2000",  steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 2000, paceKey: "strength" },
    { kind: "jog", dist: 400 },
    { kind: "repeat", backTo: 1, times: 6 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "str_4x2000",    category: "強化跑", label: "強化跑4x2000",  steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 2000, paceKey: "strength" },
    { kind: "jog", dist: 800 },
    { kind: "repeat", backTo: 1, times: 4 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "str_3x3000",    category: "強化跑", label: "強化跑3x3000",  steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 3000, paceKey: "strength" },
    { kind: "jog", dist: 800 },
    { kind: "repeat", backTo: 1, times: 3 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "str_2x5000",    category: "強化跑", label: "強化跑2x5000",  steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 5000, paceKey: "strength" },
    { kind: "jog", dist: 2000 },
    { kind: "repeat", backTo: 1, times: 2 },
    { kind: "cd", dist: 2000 },
  ]},

  // ─── 節奏跑（馬拉松配速，2K暖身＋2K收操）───
  { id: "tempo_10k", category: "節奏跑", label: "節奏跑10K", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 10000, paceKey: "tempo" },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "tempo_11k", category: "節奏跑", label: "節奏跑11K", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 11000, paceKey: "tempo" },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "tempo_13k", category: "節奏跑", label: "節奏跑13K", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 13000, paceKey: "tempo" },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "tempo_14k", category: "節奏跑", label: "節奏跑14K", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 14000, paceKey: "tempo" },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "tempo_16k", category: "節奏跑", label: "節奏跑16K", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 16000, paceKey: "tempo" },
    { kind: "cd", dist: 2000 },
  ]},

  // ─── 長跑（長跑配速，單一段落）───
  { id: "long_16k", category: "長跑", label: "長跑16K", steps: [
    { kind: "main", dist: 16000, paceKey: "long" },
  ]},
  { id: "long_19k", category: "長跑", label: "長跑19K", steps: [
    { kind: "main", dist: 19000, paceKey: "long" },
  ]},
  { id: "long_23k", category: "長跑", label: "長跑23K", steps: [
    { kind: "main", dist: 23000, paceKey: "long" },
  ]},
  { id: "long_24k", category: "長跑", label: "長跑24K", steps: [
    { kind: "main", dist: 24000, paceKey: "long" },
  ]},
  { id: "long_26k", category: "長跑", label: "長跑26K", steps: [
    { kind: "main", dist: 26000, paceKey: "long" },
  ]},
];
