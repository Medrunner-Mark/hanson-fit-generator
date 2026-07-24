// 訓練計畫資料層：把全馬 / 半馬各自的配速表、課表模板、行事曆包成統一結構，
// 讓 UI 依當前計畫渲染。新增計畫時只要在這裡加一個 plan 物件。

import { PACE_TABLE } from "./paces.js";
import { WORKOUTS } from "./workouts.js";
import { SCHEDULE } from "./schedule.js";
import { HALF_PACE_TABLE } from "./paces-half.js";
import { HALF_WORKOUTS } from "./workouts-half.js";
import { HALF_SCHEDULE } from "./schedule-half.js";

export const PLANS = {
  marathon: {
    key: "marathon",
    label: "全馬",
    namePrefix: "漢森進階",       // 檔名/課表名前綴 → 漢森進階sub400_...
    defaultGoal: "4:00",
    paceTable: PACE_TABLE,
    workouts: WORKOUTS,
    schedule: SCHEDULE,
    paceCards: [
      { label: "恢復跑", key: "recovery" },
      { label: "輕鬆有氧A", key: "easyA" },
      { label: "輕鬆有氧B", key: "easyB" },
      { label: "長跑", key: "long" },
      { label: "節奏跑 (MP)", key: "tempo" },
      { label: "強化跑", key: "strength" },
      { label: "速度跑", key: "fiveK", lap: true },
    ],
  },
  half: {
    key: "half",
    label: "半馬",
    namePrefix: "漢森進階半馬",
    defaultGoal: "1:45",
    paceTable: HALF_PACE_TABLE,
    workouts: HALF_WORKOUTS,
    schedule: HALF_SCHEDULE,
    paceCards: [
      { label: "恢復跑", key: "recovery" },
      { label: "輕鬆有氧A", key: "easyA" },
      { label: "輕鬆有氧B", key: "easyB" },
      { label: "長跑", key: "long" },
      { label: "節奏跑 (HMP)", key: "hmp" },
      { label: "強化跑 (10K)", key: "tenK" },
      { label: "速度跑", key: "fiveK", lap: true },
    ],
  },
};
