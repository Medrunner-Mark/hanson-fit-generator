import { PACE_TABLE, fmtPace } from "./paces.js";
import { WORKOUTS } from "./workouts.js";
import { buildWorkoutFit, workoutName } from "./fitgen.js";
import { SCHEDULE, DAY_HEADERS, TYPE_INFO } from "./schedule.js";

const goalSelect = document.getElementById("goal-select");
const paceSummary = document.getElementById("pace-summary");
const workoutList = document.getElementById("workout-list");
const zipBtn = document.getElementById("zip-btn");
const statusEl = document.getElementById("status");

// 預設選 4:00（中間偏常見的目標）
PACE_TABLE.forEach((tier, i) => {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = tier.goal;
  goalSelect.appendChild(opt);
});
goalSelect.value = PACE_TABLE.findIndex(t => t.goal === "4:00");

function currentTier() {
  return PACE_TABLE[Number(goalSelect.value)];
}

function renderPaceSummary() {
  const t = currentTier();
  const rows = [
    ["恢復跑", fmtPace(t.recovery)],
    ["輕鬆有氧", `${fmtPace(t.easyA)}~${fmtPace(t.easyB)}`],
    ["長跑", fmtPace(t.long)],
    ["節奏跑 (MP)", fmtPace(t.tempo)],
    ["強化跑", fmtPace(t.strength)],
    ["速度跑 (5-10K)", `${fmtPace(t.tenK)}~${fmtPace(t.fiveK)}`],
  ];
  paceSummary.innerHTML = rows
    .map(([k, v]) => `<div class="pace-cell"><span class="pace-label">${k}</span><span class="pace-value">${v}<small>/km</small></span></div>`)
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
  const byCategory = new Map();
  for (const w of WORKOUTS) {
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
      const name = workoutName(w, t);
      li.innerHTML = `<span class="wname">${name}</span>`;
      const btn = document.createElement("button");
      btn.textContent = "下載";
      btn.addEventListener("click", () => {
        const bytes = buildWorkoutFit(w, t);
        downloadBytes(bytes, `${name}.fit`);
      });
      li.appendChild(btn);
      ul.appendChild(li);
    }
    section.appendChild(ul);
    workoutList.appendChild(section);
  }
}

zipBtn.addEventListener("click", async () => {
  const t = currentTier();
  statusEl.textContent = "打包中…";
  try {
    const zip = new JSZip();
    for (const w of WORKOUTS) {
      const bytes = buildWorkoutFit(w, t);
      zip.file(`${workoutName(w, t)}.fit`, bytes);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `漢森進階sub${t.goal.replace(":", "")}_全套課表.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
    statusEl.textContent = "";
  } catch (err) {
    statusEl.textContent = "打包失敗：" + err.message;
  }
});

function renderCalendar() {
  const legend = document.getElementById("calendar-legend");
  legend.innerHTML = Object.values(TYPE_INFO)
    .map(info => `<span class="legend-item ${info.cls}">${info.name}</span>`)
    .join("");

  const table = document.getElementById("calendar");
  const head = `<tr><th>週次</th>${DAY_HEADERS.map(d => `<th>${d}</th>`).join("")}<th>週跑量</th></tr>`;
  const rows = SCHEDULE.map((week, wi) => {
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

goalSelect.addEventListener("change", () => {
  renderPaceSummary();
  renderWorkoutList();
});

renderPaceSummary();
renderWorkoutList();
renderCalendar();
