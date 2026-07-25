// 漢森初階半馬課表模板（依 Hanson_HalfMarathon_Beginner.pdf）。強化跑=HMP-6s（原書寫 HMP-10s，單位為每英里，換算每公里約6秒）。
// 結構固定，配速隨使用者目標時間查表變動（與進階版共用同一張配速表）。

export const BEGINNER_HALF_WORKOUTS = [
  // ─── 速度跑（5-10K配速）───
  { id: "speed_12x400", category: "速度跑", label: "速度跑12x400", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 400, paceKey: "speed" },
    { kind: "jog", dist: 400 },
    { kind: "repeat", backTo: 1, times: 12 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "speed_8x600", category: "速度跑", label: "速度跑8x600", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 600, paceKey: "speed" },
    { kind: "jog", dist: 400 },
    { kind: "repeat", backTo: 1, times: 8 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "speed_6x800", category: "速度跑", label: "速度跑6x800", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 800, paceKey: "speed" },
    { kind: "jog", dist: 400 },
    { kind: "repeat", backTo: 1, times: 6 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "speed_5x1000", category: "速度跑", label: "速度跑5x1000", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 1000, paceKey: "speed" },
    { kind: "jog", dist: 600 },
    { kind: "repeat", backTo: 1, times: 5 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "speed_4x1200", category: "速度跑", label: "速度跑4x1200", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 1200, paceKey: "speed" },
    { kind: "jog", dist: 600 },
    { kind: "repeat", backTo: 1, times: 4 },
    { kind: "cd", dist: 2000 },
  ]},

  // ─── 強化跑 ───
  { id: "str_6x2000", category: "強化跑", label: "強化跑6x2000", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 2000, paceKey: "hmp", offsetSec: -6 },
    { kind: "jog", dist: 400 },
    { kind: "repeat", backTo: 1, times: 6 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "str_4x2000", category: "強化跑", label: "強化跑4x2000", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 2000, paceKey: "hmp", offsetSec: -6 },
    { kind: "jog", dist: 800 },
    { kind: "repeat", backTo: 1, times: 4 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "str_3x3000", category: "強化跑", label: "強化跑3x3000", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 3000, paceKey: "hmp", offsetSec: -6 },
    { kind: "jog", dist: 800 },
    { kind: "repeat", backTo: 1, times: 3 },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "str_2x5000", category: "強化跑", label: "強化跑2x5000", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 5000, paceKey: "hmp", offsetSec: -6 },
    { kind: "jog", dist: 2000 },
    { kind: "repeat", backTo: 1, times: 2 },
    { kind: "cd", dist: 2000 },
  ]},

  // ─── 節奏跑 ───
  { id: "tempo_5k", category: "節奏跑", label: "節奏跑5K", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 5000, paceKey: "hmp" },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "tempo_6k", category: "節奏跑", label: "節奏跑6K", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 6000, paceKey: "hmp" },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "tempo_8k", category: "節奏跑", label: "節奏跑8K", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 8000, paceKey: "hmp" },
    { kind: "cd", dist: 2000 },
  ]},
  { id: "tempo_10k", category: "節奏跑", label: "節奏跑10K", steps: [
    { kind: "wu", dist: 2000 },
    { kind: "main", dist: 10000, paceKey: "hmp" },
    { kind: "cd", dist: 2000 },
  ]},

  // ─── 長跑 ───
  { id: "long_13k", category: "長跑", label: "長跑13K", steps: [
    { kind: "main", dist: 13000, paceKey: "long" },
  ]},
  { id: "long_14k", category: "長跑", label: "長跑14K", steps: [
    { kind: "main", dist: 14000, paceKey: "long" },
  ]},
  { id: "long_16k", category: "長跑", label: "長跑16K", steps: [
    { kind: "main", dist: 16000, paceKey: "long" },
  ]},
  { id: "long_19k", category: "長跑", label: "長跑19K", steps: [
    { kind: "main", dist: 19000, paceKey: "long" },
  ]},
];
