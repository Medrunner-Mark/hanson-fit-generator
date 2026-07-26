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

import { t } from "./i18n.js";
import { goalCode } from "./paces.js";

// 所有下載檔名的共同前段，例如「漢森進階sub400」。
export const fileStem = (plan, tier) =>
  t("file.stem", { prefix: plan.namePrefix, goal: goalCode(tier.goal) });

// 配速卡：i18n key 存在 labelKey，取用時再查表。
//   cardLabel(card)      → 卡片上的完整標籤，例如「節奏跑 (MP)」
//   cardLabelShort(card) → 課表圖／PDF 的短標籤，例如「節奏跑」
// 兩種變體由字典各自決定，原本 poster 與 pdfgen 各有一份
// `.replace(/\s*\(.*\)/, "")` 把括號剝掉的 regex 因此可以刪掉。
export const cardLabel = card => t(`pace.${card.labelKey}.full`);
export const cardLabelShort = card => t(`pace.${card.labelKey}.short`);

const FULL_PACE_CARDS = [
  { labelKey: "recovery", key: "recovery" },
  { labelKey: "easyA", key: "easyA" },
  { labelKey: "easyB", key: "easyB" },
  { labelKey: "long", key: "long" },
  { labelKey: "tempo", key: "tempo" },
  { labelKey: "strength", key: "strength" },
  { labelKey: "speed", key: "fiveK", lap: true },
];

const HALF_PACE_CARDS = [
  { labelKey: "recovery", key: "recovery" },
  { labelKey: "easyA", key: "easyA" },
  { labelKey: "easyB", key: "easyB" },
  { labelKey: "long", key: "long" },
  { labelKey: "hmp", key: "hmp" },
  { labelKey: "tenK", key: "tenK" },
  { labelKey: "speed", key: "fiveK", lap: true },
];

// label／levelLabel／namePrefix 一律用 getter，理由同 TYPE_INFO：不能有快取的譯文。
// namePrefix 會變成下載檔名，每個計畫給一個獨立的 key 而不是用組合的，
// 這樣譯者可以整串改寫，不必受「品牌＋程度＋距離」的組合規則綁住。
const plan = (key, distance, level, xlsxFile, xlsxName, defaultGoal, paceTable, workouts, schedule, paceCards) => ({
  key, distance, level,
  get label() { return t(`plan.dist.${distance}`); },
  get levelLabel() { return t(`plan.level.${level}`); },
  get namePrefix() { return t(`file.prefix.${key}`); },
  xlsxFile, xlsxName, defaultGoal, paceTable, workouts, schedule, paceCards,
});

export const PLANS = {
  "marathon-advanced": plan(
    "marathon-advanced", "marathon", "advanced",
    "templates/hanson-full-marathon-template.xlsx", "漢森進階全馬課表模板_互動版.xlsx",
    "4:00", PACE_TABLE, WORKOUTS, SCHEDULE, FULL_PACE_CARDS),

  "marathon-beginner": plan(
    "marathon-beginner", "marathon", "beginner",
    "templates/hanson-full-marathon-beginner-template.xlsx", "漢森初階全馬課表模板_互動版.xlsx",
    "4:00", PACE_TABLE, BEGINNER_FULL_WORKOUTS, BEGINNER_FULL_SCHEDULE, FULL_PACE_CARDS),

  "half-advanced": plan(
    "half-advanced", "half", "advanced",
    "templates/hanson-half-marathon-template.xlsx", "漢森進階半馬課表模板_互動版.xlsx",
    "1:45", HALF_PACE_TABLE, HALF_WORKOUTS, HALF_SCHEDULE, HALF_PACE_CARDS),

  // 初階半馬的強化跑統一使用 10K 配速欄，與進階半馬一致
  "half-beginner": plan(
    "half-beginner", "half", "beginner",
    "templates/hanson-half-marathon-beginner-template.xlsx", "漢森初階半馬課表模板_互動版.xlsx",
    "1:45", HALF_PACE_TABLE, BEGINNER_HALF_WORKOUTS, BEGINNER_HALF_SCHEDULE, HALF_PACE_CARDS),
};
