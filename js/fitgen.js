// FIT 編碼模組：課表模板 + 配速檔位 → 合法的 Garmin workout FIT 檔（Uint8Array）。
// 使用 Garmin 官方 JS SDK（瀏覽器端執行，不經任何伺服器）。

import { Encoder, Profile } from "https://esm.sh/@garmin/fitsdk@21.171.0";
import { fmtPace, paceToScaledMps } from "./paces.js";
import { workoutLabel } from "./workout-meta.js";
import { fileStem } from "./plans.js";
import { t } from "./i18n.js";

// 各種 step 的配速區間（回傳 [慢端秒/km, 快端秒/km]）
// export 供 jsongen.js 共用，確保 FIT 與 JSON 兩種格式的配速數字完全一致
export function paceRange(step, tier) {
  switch (step.kind) {
    case "wu":
    case "cd":
    case "jog":
      // 恢復跑(慢端) ~ 輕鬆有氧A(快端)
      return [tier.recovery, tier.easyA];
    case "main": {
      if (step.paceKey === "speed") return [tier.fiveK + 5, tier.fiveK - 5]; // 400m配速(=5K配速)±5s
      const center = step.mpOffset !== undefined
        ? tier.tempo + step.mpOffset                        // 漸速跑：MP+偏移秒數
        : tier[step.paceKey] + (step.offsetSec || 0);       // tempo/strength/long/hmp(±偏移)
      return [center + 5, center - 5];
    }
    default:
      return null;
  }
}

// 這些字串會寫進 FIT 與 JSON，運動中直接顯示在使用者的手錶螢幕上。
export function stepNotes(step, tier) {
  switch (step.kind) {
    case "wu": return t("fit.wu");
    case "cd": return t("fit.cd");
    case "jog": return t("fit.jog");
    case "main":
      if (step.mpOffset !== undefined) {
        const label = step.mpOffset > 0 ? `MP+${step.mpOffset}s` : "MP";
        return t("fit.mpOffset", { label, pace: fmtPace(tier.tempo + step.mpOffset) });
      }
      if (step.paceKey === "tempo") return t("fit.marathonPace", { pace: fmtPace(tier.tempo) });
      if (step.paceKey === "strength") {
        return t("fit.strength", { gap: tier.tempo - tier.strength, pace: fmtPace(tier.strength) });
      }
      if (step.paceKey === "hmp") {
        if (step.offsetSec) {
          return t("fit.hmpOffset", {
            sign: step.offsetSec < 0 ? "-" : "+",
            sec: Math.abs(step.offsetSec),
            pace: fmtPace(tier.hmp + step.offsetSec),
          });
        }
        return t("fit.halfPace", { pace: fmtPace(tier.hmp) });
      }
      if (step.paceKey === "tenK") return t("fit.tenK", { pace: fmtPace(tier.tenK) });
      if (step.paceKey === "long") return t("fit.longPace", { pace: fmtPace(tier.long) });
      if (step.paceKey === "speed") {
        const lapSec = Math.round(tier.fiveK * 0.4); // 400m一圈，以配速表400m配速計
        return t("fit.speedLap", { pace: fmtPace(tier.fiveK), lap: lapSec });
      }
      return "";
    default: return "";
  }
}

function intensityOf(step) {
  switch (step.kind) {
    case "wu": return "warmup";
    case "cd": return "cooldown";
    case "jog": return "recovery";
    default: return "active";
  }
}

// 檔名用："漢森進階sub255_長跑26K"／"漢森進階半馬sub145_節奏跑10K"
export function workoutFileName(workout, tier, plan) {
  return `${fileStem(plan, tier)}_${workoutLabel(workout)}`;
}

// 錶上與 Garmin Connect 顯示用的課表名稱。目前與檔名完全相同——刻意分成兩個函式是
// 為了將來：日文課表名較長，若發現部分 Garmin 錶會截斷顯示，只要改這裡縮短即可，
// 不會動到檔名（作者的教學影片截圖依賴檔名不變）。
export function wktName(workout, tier, plan) {
  return workoutFileName(workout, tier, plan);
}

export function buildWorkoutFit(workout, tier, plan) {
  const encoder = new Encoder();

  encoder.writeMesg({
    mesgNum: Profile.MesgNum.FILE_ID,
    type: "workout",
    manufacturer: "garmin",
    product: 65534, // garmin_product: connect（與原始檔案一致）
    timeCreated: new Date(),
    serialNumber: Math.floor(Math.random() * 0xfffffffe) + 1,
  });

  encoder.writeMesg({
    mesgNum: Profile.MesgNum.WORKOUT,
    wktName: wktName(workout, tier, plan),
    sport: "running",
    subSport: "generic",
    numValidSteps: workout.steps.length,
  });

  workout.steps.forEach((step, i) => {
    if (step.kind === "repeat") {
      encoder.writeMesg({
        mesgNum: Profile.MesgNum.WORKOUT_STEP,
        messageIndex: i,
        durationType: "repeatUntilStepsCmplt",
        durationValue: step.backTo,
        targetType: "open",
        targetValue: step.times,
      });
      return;
    }

    if (step.kind === "open_cd") {
      // 開放式收操：不設時間與配速，按圈自行結束（與原始漸速跑檔案一致）
      encoder.writeMesg({
        mesgNum: Profile.MesgNum.WORKOUT_STEP,
        messageIndex: i,
        durationType: "open",
        targetType: "open",
        targetValue: 0,
        intensity: "cooldown",
        notes: t("fit.openCd"),
      });
      return;
    }

    const [slow, fast] = paceRange(step, tier);
    const duration = step.time !== undefined
      ? { durationType: "time", durationValue: step.time * 1000 }   // 秒 → 毫秒（FIT scale 1000）
      : { durationType: "distance", durationValue: step.dist * 100 }; // 公尺 → 公分（FIT scale 100）
    encoder.writeMesg({
      mesgNum: Profile.MesgNum.WORKOUT_STEP,
      messageIndex: i,
      ...duration,
      targetType: "speed",
      targetValue: 0,
      customTargetValueLow: paceToScaledMps(slow),  // 慢端 = 較低速度
      customTargetValueHigh: paceToScaledMps(fast), // 快端 = 較高速度
      intensity: intensityOf(step),
      notes: stepNotes(step, tier),
    });
  });

  return encoder.close();
}
