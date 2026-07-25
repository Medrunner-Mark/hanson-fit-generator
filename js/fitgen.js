// FIT 編碼模組：課表模板 + 配速檔位 → 合法的 Garmin workout FIT 檔（Uint8Array）。
// 使用 Garmin 官方 JS SDK（瀏覽器端執行，不經任何伺服器）。

import { Encoder, Profile } from "https://esm.sh/@garmin/fitsdk@21.171.0";
import { fmtPace, paceToScaledMps, goalCode } from "./paces.js";

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

export function stepNotes(step, tier) {
  switch (step.kind) {
    case "wu": return "暖身 恢復跑配速";
    case "cd": return "收操 恢復跑配速";
    case "jog": return "組間恢復跑";
    case "main":
      if (step.mpOffset !== undefined) {
        const label = step.mpOffset > 0 ? `MP+${step.mpOffset}s` : "MP";
        return `${label} ${fmtPace(tier.tempo + step.mpOffset)}/km`;
      }
      if (step.paceKey === "tempo") return `馬拉松配速 ${fmtPace(tier.tempo)}/km`;
      if (step.paceKey === "strength") {
        const gap = tier.tempo - tier.strength;
        return `MP-${gap}s ${fmtPace(tier.strength)}/km`;
      }
      if (step.paceKey === "hmp") {
        if (step.offsetSec) {
          const s = Math.abs(step.offsetSec);
          return `HMP${step.offsetSec < 0 ? "-" : "+"}${s}s ${fmtPace(tier.hmp + step.offsetSec)}/km`;
        }
        return `半馬配速 ${fmtPace(tier.hmp)}/km`;
      }
      if (step.paceKey === "tenK") return `10K配速 ${fmtPace(tier.tenK)}/km`;
      if (step.paceKey === "long") return `長跑配速 ${fmtPace(tier.long)}/km`;
      if (step.paceKey === "speed") {
        const lapSec = Math.round(tier.fiveK * 0.4); // 400m一圈，以配速表400m配速計
        return `${fmtPace(tier.fiveK)}/km 每圈${lapSec}秒`;
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

// 顯示/檔名用名稱："漢森進階sub255_長跑26K"／"漢森進階半馬sub145_節奏跑10K"
export function workoutName(workout, tier, plan) {
  return `${plan.namePrefix}sub${goalCode(tier.goal)}_${workout.label}`;
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
    wktName: workoutName(workout, tier, plan),
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
        notes: "收操",
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
