// 課表的類型與顯示名稱都由 id 推導，不在四個資料檔裡重複 144 次。
//   id 前綴  → 類型（describe.js 早就在用這個對照把行事曆的一天對回課表模板）
//   底線之後 → 規格，語言中性（12x400 / 26K / 90min）
// 例：speed_12x400 → 速度跑 + 12x400 → 「速度跑12x400」
//     long_26k     → 長跑   + 26K    → 「長跑26K」
//
// 已驗證：72 份課表中 71 份完全符合這個規則，唯一例外是 prog_90min（見 NAME_OVERRIDE）。

import { t } from "./i18n.js";

// 類型 → id 前綴。describe.js 的 resolveWorkout 需要這個方向。
export const ID_PREFIX = {
  speed: "speed_",
  strength: "str_",
  tempo: "tempo_",
  long: "long_",
  alt: "prog_",
};

// 名稱不是「類型＋規格」組合的少數課表，在字典裡個別指定 wk.name.<id>
const NAME_OVERRIDE = new Set(["prog_90min"]);

const TYPE_BY_PREFIX = Object.entries(ID_PREFIX).map(([type, p]) => [p, type]);

export function workoutType(w) {
  const hit = TYPE_BY_PREFIX.find(([p]) => w.id.startsWith(p));
  return hit ? hit[1] : null;
}

export function workoutCategory(w) {
  const type = workoutType(w);
  return type ? t(`wk.cat.${type}`) : "";
}

// 規格字串，語言中性：speed_12x400 → "12x400"、long_26k → "26K"
export function workoutSpec(w) {
  const type = workoutType(w);
  if (!type) return w.id;
  return w.id.slice(ID_PREFIX[type].length).replace(/k$/, "K");
}

// 一定要是 function、不可預先算好存進資料裡：多語系切換語言時不能有任何快取的翻譯字串。
export function workoutLabel(w) {
  if (NAME_OVERRIDE.has(w.id)) return t(`wk.name.${w.id}`);
  // 分隔方式交給字典：中日文是「{cat}{spec}」，英文要「{cat}-{spec}」
  return t("wk.label", { cat: workoutCategory(w), spec: workoutSpec(w) });
}
