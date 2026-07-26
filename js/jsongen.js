// Garmin Connect 課表 JSON 產生器。
// 輸出 Connect 內部 workout-service API 的課表格式，可搭配
// 「Share your Garmin Connect workout」瀏覽器外掛匯入 Connect 網頁版。
// schema 參考：外掛原始碼 (fulippo/share-your-garmin-workout) 與 mkuthan/garmin-workouts。
// 配速數字與 FIT 版共用同一套函式（fitgen.js 的 paceRange/stepNotes），保證兩種格式一致。

import { paceRange, stepNotes, workoutName } from "./fitgen.js";
import { paceToScaledMps } from "./paces.js";

const SPORT = { sportTypeId: 1, sportTypeKey: "running" };
const PACE_ZONE = { workoutTargetTypeId: 6, workoutTargetTypeKey: "pace.zone" };
const NO_TARGET = { workoutTargetTypeId: 1, workoutTargetTypeKey: "no.target" };

const STEP_TYPE = {
  wu:      { stepTypeId: 1, stepTypeKey: "warmup" },
  cd:      { stepTypeId: 2, stepTypeKey: "cooldown" },
  open_cd: { stepTypeId: 2, stepTypeKey: "cooldown" },
  main:    { stepTypeId: 3, stepTypeKey: "interval" },
  jog:     { stepTypeId: 4, stepTypeKey: "recovery" },
};

// 與 FIT 相同的取整方式（mm/s 取整再除回），確保兩種格式數字完全一致
function mps(secPerKm) {
  return paceToScaledMps(secPerKm) / 1000;
}

// 把扁平模板（含 repeat backTo 參照）轉成 Connect 需要的巢狀樹。
// 註：splice 數量以模板索引計，適用於「單一 repeat 群組」的課表結構（本專案全部如此）。
function toTree(steps) {
  const tree = [];
  steps.forEach((s, i) => {
    if (s.kind === "repeat") {
      const nested = tree.splice(tree.length - (i - s.backTo), i - s.backTo);
      tree.push({ repeat: s.times, children: nested });
    } else {
      tree.push(s);
    }
  });
  return tree;
}

function execStep(step, tier, stepOrder, childStepId) {
  const base = {
    type: "ExecutableStepDTO",
    stepId: null,
    stepOrder,
    stepType: STEP_TYPE[step.kind],
    childStepId,
    description: stepNotes(step, tier),
  };

  if (step.kind === "open_cd") {
    return {
      ...base,
      description: "收操",
      endCondition: { conditionTypeId: 1, conditionTypeKey: "lap.button" },
      endConditionValue: null,
      targetType: NO_TARGET,
      targetValueOne: null,
      targetValueTwo: null,
    };
  }

  const [slow, fast] = paceRange(step, tier);
  const endCondition = step.time !== undefined
    ? { endCondition: { conditionTypeId: 2, conditionTypeKey: "time" }, endConditionValue: step.time }
    : { endCondition: { conditionTypeId: 3, conditionTypeKey: "distance" }, endConditionValue: step.dist };

  return {
    ...base,
    ...endCondition,
    preferredEndConditionUnit: step.time !== undefined ? null : { unitKey: "kilometer" },
    targetType: PACE_ZONE,
    targetValueOne: mps(slow),  // 慢端 = 較低速度
    targetValueTwo: mps(fast),  // 快端 = 較高速度
  };
}

export function buildWorkoutJson(workout, tier, plan) {
  let stepOrder = 0;
  const serialize = (nodes, childStepId) => nodes.map(node => {
    stepOrder += 1;
    if (node.repeat !== undefined) {
      const myOrder = stepOrder;
      const nested = serialize(node.children, 1);
      return {
        type: "RepeatGroupDTO",
        stepId: null,
        stepOrder: myOrder,
        stepType: { stepTypeId: 6, stepTypeKey: "repeat" },
        childStepId: 1,
        numberOfIterations: node.repeat,
        smartRepeat: false,
        endCondition: { conditionTypeId: 7, conditionTypeKey: "iterations" },
        endConditionValue: node.repeat,
        workoutSteps: nested,
      };
    }
    return execStep(node, tier, stepOrder, childStepId);
  });

  const steps = serialize(toTree(workout.steps), null);

  return {
    workoutName: workoutName(workout, tier, plan),
    description: `漢森${plan.levelLabel}${plan.label}課表產生器（目標 ${tier.goal}）｜Med日跑者`,
    sportType: SPORT,
    workoutSegments: [
      { segmentOrder: 1, sportType: SPORT, workoutSteps: steps },
    ],
  };
}

export function workoutJsonText(workout, tier, plan) {
  return JSON.stringify(buildWorkoutJson(workout, tier, plan), null, 2);
}
