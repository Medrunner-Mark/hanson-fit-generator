// 訓練計畫資料層：距離（全馬/半馬）× 程度（進階/初階）共四種計畫。
// 進階與初階共用同一張配速表（配速只跟目標時間有關，與課表版本無關）。

import { PACE_TABLE } from "./paces.js";
import { WORKOUTS } from "./workouts.js";
import { SCHEDULE } from "./schedule.js";
import { HALF_PACE_TABLE } from "./paces-half.js";
import { HALF_WORKOUTS } from "./workouts-half.js";
import { HALF_SCHEDULE } from "./schedule-half.js";
import { BEGINNER_FULL_WORKOUTS } from "./workouts-beginner-full.js";
import { BEGINNER_FULL_SCHEDULE } from "./schedule-beginner-full.js";
import { BEGINNER_HALF_WORKOUTS } from "./workouts-beginner-half.js";
import { BEGINNER_HALF_SCHEDULE } from "./schedule-beginner-half.js";

const FULL_PACE_CARDS = [
  { label: "恢復跑", key: "recovery" },
  { label: "輕鬆有氧A", key: "easyA" },
  { label: "輕鬆有氧B", key: "easyB" },
  { label: "長跑", key: "long" },
  { label: "節奏跑 (MP)", key: "tempo" },
  { label: "強化跑", key: "strength" },
  { label: "速度跑", key: "fiveK", lap: true },
];

const HALF_PACE_CARDS = [
  { label: "恢復跑", key: "recovery" },
  { label: "輕鬆有氧A", key: "easyA" },
  { label: "輕鬆有氧B", key: "easyB" },
  { label: "長跑", key: "long" },
  { label: "節奏跑 (HMP)", key: "hmp" },
  { label: "強化跑 (10K)", key: "tenK" },
  { label: "速度跑", key: "fiveK", lap: true },
];

export const PLANS = {
  "marathon-advanced": {
    key: "marathon-advanced",
    distance: "marathon",
    level: "advanced",
    label: "全馬",
    levelLabel: "進階",
    namePrefix: "漢森進階",
    xlsxFile: "templates/hanson-full-marathon-template.xlsx",
    xlsxName: "漢森進階全馬課表模板_互動版.xlsx",
    defaultGoal: "4:00",
    paceTable: PACE_TABLE,
    workouts: WORKOUTS,
    schedule: SCHEDULE,
    paceCards: FULL_PACE_CARDS,
  },
  "marathon-beginner": {
    key: "marathon-beginner",
    distance: "marathon",
    level: "beginner",
    label: "全馬",
    levelLabel: "初階",
    namePrefix: "漢森初階",
    defaultGoal: "4:00",
    paceTable: PACE_TABLE,
    workouts: BEGINNER_FULL_WORKOUTS,
    schedule: BEGINNER_FULL_SCHEDULE,
    paceCards: FULL_PACE_CARDS,
  },
  "half-advanced": {
    key: "half-advanced",
    distance: "half",
    level: "advanced",
    label: "半馬",
    levelLabel: "進階",
    namePrefix: "漢森進階半馬",
    xlsxFile: "templates/hanson-half-marathon-template.xlsx",
    xlsxName: "漢森進階半馬課表模板_互動版.xlsx",
    defaultGoal: "1:45",
    paceTable: HALF_PACE_TABLE,
    workouts: HALF_WORKOUTS,
    schedule: HALF_SCHEDULE,
    paceCards: HALF_PACE_CARDS,
  },
  "half-beginner": {
    key: "half-beginner",
    distance: "half",
    level: "beginner",
    label: "半馬",
    levelLabel: "初階",
    namePrefix: "漢森初階半馬",
    defaultGoal: "1:45",
    paceTable: HALF_PACE_TABLE,
    workouts: BEGINNER_HALF_WORKOUTS,
    schedule: BEGINNER_HALF_SCHEDULE,
    // 強化跑統一使用 10K 配速欄，與進階半馬一致
    paceCards: HALF_PACE_CARDS,
  },
};
