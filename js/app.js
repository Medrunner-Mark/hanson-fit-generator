import { fmtPace } from "./paces.js";
import { buildWorkoutFit, workoutName } from "./fitgen.js";
import { workoutJsonText } from "./jsongen.js";
import { DAY_HEADERS, TYPE_INFO } from "./schedule.js";
import { PLANS } from "./plans.js";

const planSwitch = document.getElementById("plan-switch");
const goalSelect = document.getElementById("goal-select");
const paceSummary = document.getElementById("pace-summary");
const workoutList = document.getElementById("workout-list");
const zipBtn = document.getElementById("zip-btn");
const statusEl = document.getElementById("status");

let currentPlanKey = "marathon";
const currentPlan = () => PLANS[currentPlanKey];
const currentTier = () => currentPlan().paceTable[Number(goalSelect.value)];

function populateGoals() {
  const plan = currentPlan();
  goalSelect.innerHTML = "";
  plan.paceTable.forEach((tier, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = tier.goal;
    goalSelect.appendChild(opt);
  });
  goalSelect.value = plan.paceTable.findIndex(t => t.goal === plan.defaultGoal);
}

function renderPaceSummary() {
  const t = currentTier();
  const rows = currentPlan().paceCards.map(card => {
    const sub = card.lap ? `每圈<strong>${Math.round(t.fiveK * 0.4)}</strong>s` : "";
    return [card.label, fmtPace(t[card.key]), sub];
  });
  paceSummary.innerHTML = rows
    .map(([k, v, sub]) => `<div class="pace-cell"><span class="pace-label">${k}</span><span class="pace-value">${v}<small>/km</small></span>${sub ? `<span class="pace-sub">${sub}</span>` : ""}</div>`)
    .join("");
}

function downloadBytes(bytes, filename) {
  const blob = new Blob([bytes], { type: "application/octet-stream" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function renderWorkoutList() {
  const t = currentTier();
  const plan = currentPlan();
  const byCategory = new Map();
  for (const w of plan.workouts) {
    if (!byCategory.has(w.category)) byCategory.set(w.category, []);
    byCategory.get(w.category).push(w);
  }

  workoutList.innerHTML = "";
  for (const [category, items] of byCategory) {
    const section = document.createElement("section");
    section.className = "category";
    section.innerHTML = `<h3>${category}</h3>`;
    const ul = document.createElement("ul");
    for (const w of items) {
      const li = document.createElement("li");
      const name = workoutName(w, t, plan);
      li.innerHTML = `<span class="wname">${name}</span>`;
      const btns = document.createElement("span");
      btns.className = "btn-group";
      const fitBtn = document.createElement("button");
      fitBtn.textContent = "FIT";
      fitBtn.title = "下載 .fit（USB 匯入手錶）";
      fitBtn.addEventListener("click", () => {
        downloadBytes(buildWorkoutFit(w, t, plan), `${name}.fit`);
      });
      const jsonBtn = document.createElement("button");
      jsonBtn.textContent = "JSON";
      jsonBtn.title = "下載 .json（外掛匯入 Garmin Connect 網頁版）";
      jsonBtn.addEventListener("click", () => {
        const blob = new Blob([workoutJsonText(w, t, plan)], { type: "application/json;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${name}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
      btns.appendChild(fitBtn);
      btns.appendChild(jsonBtn);
      li.appendChild(btns);
      ul.appendChild(li);
    }
    section.appendChild(ul);
    workoutList.appendChild(section);
  }
}

async function downloadZip(kind) {
  const t = currentTier();
  const plan = currentPlan();
  statusEl.textContent = "打包中…";
  try {
    const zip = new JSZip();
    for (const w of plan.workouts) {
      const name = workoutName(w, t, plan);
      if (kind === "fit") {
        zip.file(`${name}.fit`, buildWorkoutFit(w, t, plan));
      } else {
        zip.file(`${name}.json`, workoutJsonText(w, t, plan));
      }
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${plan.namePrefix}sub${t.goal.replace(":", "")}_全套課表_${kind.toUpperCase()}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
    statusEl.textContent = "";
  } catch (err) {
    statusEl.textContent = "打包失敗：" + err.message;
  }
}

function renderCalendar() {
  const legend = document.getElementById("calendar-legend");
  legend.innerHTML = Object.values(TYPE_INFO)
    .map(info => `<span class="legend-item ${info.cls}">${info.name}</span>`)
    .join("");

  const table = document.getElementById("calendar");
  const head = `<tr><th>週次</th>${DAY_HEADERS.map(d => `<th>${d}</th>`).join("")}<th>週跑量</th></tr>`;
  const rows = currentPlan().schedule.map((week, wi) => {
    const total = week.reduce((sum, day) => sum + day.d, 0);
    const cells = week.map(day => {
      const info = TYPE_INFO[day.t];
      const sub = day.t === "rest" ? "" : `<span class="cal-label">${day.label}</span>`;
      return `<td class="${info.cls}"><span class="cal-type">${info.name}</span>${sub}</td>`;
    }).join("");
    const totalTxt = Math.round(total * 10) / 10;
    return `<tr><th>W${wi + 1}</th>${cells}<td class="cal-total">${totalTxt}K</td></tr>`;
  }).join("");
  table.innerHTML = head + rows;
}

function renderAll() {
  renderPaceSummary();
  renderWorkoutList();
  renderCalendar();
}

planSwitch.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.plan === currentPlanKey) return;
    currentPlanKey = btn.dataset.plan;
    planSwitch.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
    populateGoals();
    renderAll();
  });
});

goalSelect.addEventListener("change", () => {
  renderPaceSummary();
  renderWorkoutList();
});

zipBtn.addEventListener("click", () => downloadZip("fit"));
document.getElementById("json-zip-btn").addEventListener("click", () => downloadZip("json"));

populateGoals();
renderAll();
