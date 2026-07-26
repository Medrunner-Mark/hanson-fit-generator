// 課表明細字串產生器：把課表模板 + 配速檔位 轉成可讀的一行敘述，
// 例如「2K暖身 → 12×400m @3:45（組間緩跑400m）→ 2K收操」。
// 用於 PDF 課表；與 xlsx 的寫法同精神，但帶入該目標時間的實際配速數字。

import { fmtPace } from "./paces.js";
import { ID_PREFIX } from "./workout-meta.js";
import { t } from "./i18n.js";

// 行事曆的一天 → 課表模板。依既有 id 命名規則對應。
// 非課表類型的日子（輕鬆跑/休息/比賽）沒有對應前綴，直接回 null。
export function resolveWorkout(plan, day) {
  const prefix = ID_PREFIX[day.t];
  if (!prefix) return null;
  const id = prefix + day.label.toLowerCase();
  return plan.workouts.find(w => w.id.toLowerCase() === id) || null;
}

function dist(m) {
  return m >= 1000 && m % 1000 === 0 ? `${m / 1000}K` : `${m}m`;
}

// 主課表段落的配速文字
function mainPace(step, tier) {
  if (step.paceKey === "speed") return fmtPace(tier.fiveK);
  if (step.mpOffset !== undefined) return fmtPace(tier.tempo + step.mpOffset);
  return fmtPace(tier[step.paceKey] + (step.offsetSec || 0));
}

// 產生一天的完整敘述。day 來自 schedule，plan/tier 決定配速。
// 行事曆格內／PDF 用的當日標籤。多數是純數字（10K、12x400）不需翻譯；
// 只有帶 tag 的例外要查字典（目前僅進階半馬 W18 週六的「5K放鬆」）。
export function dayLabel(day) {
  return day.tag ? t(`day.label.${day.tag}`, { d: day.d }) : day.label;
}

export function describeDay(plan, day, tier) {
  if (day.t === "rest") return t("desc.rest");
  if (day.t === "race") return t("desc.race", { d: day.d });
  if (day.t === "easy") {
    return t("desc.easy", {
      label: dayLabel(day),
      from: fmtPace(tier.easyA),
      to: fmtPace(tier.easyB),
    });
  }

  const w = resolveWorkout(plan, day);
  if (!w) return day.label;   // 保底：至少顯示原本的簡述

  const parts = [];
  let repeatTimes = null, mainStep = null, jogStep = null;
  for (const s of w.steps) {
    if (s.kind === "repeat") repeatTimes = s.times;
    else if (s.kind === "main") mainStep = s;
    else if (s.kind === "jog") jogStep = s;
  }

  // 距離讀 step.dist 而不是寫死「2K」：目前所有模板的暖身/收操都是 2000m，
  // 但寫死的話模板一改就會靜默說謊。
  const wuStep = w.steps.find(s => s.kind === "wu");
  const cdStep = w.steps.find(s => s.kind === "cd");
  if (wuStep) parts.push(t("desc.wu", { d: dist(wuStep.dist) }));

  if (mainStep) {
    const pace = mainPace(mainStep, tier);
    if (repeatTimes) {
      // 不用括號，避免換行時括號單獨落在行首
      const jog = jogStep ? t("desc.jogSep", { d: dist(jogStep.dist) }) : "";
      parts.push(t("desc.reps", { n: repeatTimes, dist: dist(mainStep.dist), pace, jog }));
    } else {
      parts.push(t("desc.single", { dist: dist(mainStep.dist), pace }));
    }
  }

  if (cdStep) parts.push(t("desc.cd", { d: dist(cdStep.dist) }));
  return parts.join(t("desc.arrow"));
}
