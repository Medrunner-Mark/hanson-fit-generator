// 課表明細字串產生器：把課表模板 + 配速檔位 轉成可讀的一行敘述，
// 例如「2K暖身 → 12×400m @3:45（組間緩跑400m）→ 2K收操」。
// 用於 PDF 課表；與 xlsx 的寫法同精神，但帶入該目標時間的實際配速數字。

import { fmtPace } from "./paces.js";

// 行事曆的一天 → 課表模板。依既有 id 命名規則對應。
export function resolveWorkout(plan, day) {
  const prefix = { speed: "speed_", strength: "str_", tempo: "tempo_", long: "long_" }[day.t];
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
export function describeDay(plan, day, tier) {
  if (day.t === "rest") return "休息 / 交叉訓練";
  if (day.t === "race") return `比賽日 ${day.d}K`;
  if (day.t === "easy") {
    return `${day.label} 輕鬆跑 @${fmtPace(tier.easyA)}–${fmtPace(tier.easyB)}`;
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

  const hasWu = w.steps.some(s => s.kind === "wu");
  const hasCd = w.steps.some(s => s.kind === "cd");
  if (hasWu) parts.push("2K暖身");

  if (mainStep) {
    const pace = mainPace(mainStep, tier);
    if (repeatTimes) {
      // 不用括號，避免換行時括號單獨落在行首
      const jog = jogStep ? `，組間緩跑${dist(jogStep.dist)}` : "";
      parts.push(`${repeatTimes}×${dist(mainStep.dist)} @${pace}${jog}`);
    } else {
      parts.push(`${dist(mainStep.dist)} @${pace}`);
    }
  }

  if (hasCd) parts.push("2K收操");
  return parts.join(" → ");
}
