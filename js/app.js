import { fmtPace, goalCode } from "./paces.js";
import { buildWorkoutFit, workoutFileName } from "./fitgen.js";
import { workoutType, workoutCategory } from "./workout-meta.js";
import { workoutJsonText } from "./jsongen.js";
import { DAY_HEADERS, TYPE_INFO } from "./schedule.js";
import { PLANS } from "./plans.js";
import { buildPoster } from "./poster.js";
import { downloadPdf } from "./pdfgen.js";

const distanceSwitch = document.getElementById("distance-switch");
const levelSwitch = document.getElementById("level-switch");
const levelHint = document.getElementById("level-hint");
const goalSelect = document.getElementById("goal-select");
const paceSummary = document.getElementById("pace-summary");
const workoutList = document.getElementById("workout-list");
const zipBtn = document.getElementById("zip-btn");
const statusEl = document.getElementById("status");

let currentDistance = "marathon";
let currentLevel = "advanced";
const currentPlanKey = () => `${currentDistance}-${currentLevel}`;
const currentPlan = () => PLANS[currentPlanKey()];
const currentTier = () => currentPlan().paceTable[Number(goalSelect.value)];

// 下載事件統計（送到 GoatCounter，後台可分類查看；失敗不影響下載）
function trackDownload(kind) {
  try {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({
        path: `download/${kind}/${currentPlanKey()}`,
        title: `下載 ${kind} (${currentPlan().label})`,
        event: true,
      });
    }
  } catch (e) { /* 統計失敗不影響功能 */ }
}

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
    return [card.label, fmtPace(t[card.key] + (card.offsetSec || 0)), sub];
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
  const byType = new Map();
  for (const w of plan.workouts) {
    const type = workoutType(w);
    if (!byType.has(type)) byType.set(type, []);
    byType.get(type).push(w);
  }

  workoutList.innerHTML = "";
  for (const [, items] of byType) {
    const section = document.createElement("section");
    section.className = "category";
    section.innerHTML = `<h3>${workoutCategory(items[0])}</h3>`;
    const ul = document.createElement("ul");
    for (const w of items) {
      const li = document.createElement("li");
      const name = workoutFileName(w, t, plan);
      li.innerHTML = `<span class="wname">${name}</span>`;
      const btns = document.createElement("span");
      btns.className = "btn-group";
      const fitBtn = document.createElement("button");
      fitBtn.textContent = "FIT";
      fitBtn.title = "下載 .fit（USB 匯入手錶）";
      fitBtn.addEventListener("click", () => {
        trackDownload("fit-single");
        downloadBytes(buildWorkoutFit(w, t, plan), `${name}.fit`);
      });
      const jsonBtn = document.createElement("button");
      jsonBtn.textContent = "JSON";
      jsonBtn.title = "下載 .json（外掛匯入 Garmin Connect 網頁版）";
      jsonBtn.addEventListener("click", () => {
        trackDownload("json-single");
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
  trackDownload(`${kind}-zip`);
  statusEl.textContent = "打包中…";
  try {
    const zip = new JSZip();
    for (const w of plan.workouts) {
      const name = workoutFileName(w, t, plan);
      if (kind === "fit") {
        zip.file(`${name}.fit`, buildWorkoutFit(w, t, plan));
      } else {
        zip.file(`${name}.json`, workoutJsonText(w, t, plan));
      }
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${plan.namePrefix}sub${goalCode(t.goal)}_全套課表_${kind.toUpperCase()}.zip`;
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
      // 比賽日格內只留距離避免溢出（label 形如「全馬 42.2K」，但不從字串切，直接用 day.d）
      const text = day.t === "race" ? `${day.d}K` : day.label;
      const sub = day.t === "rest" ? "" : `<span class="cal-label">${text}</span>`;
      return `<td class="${info.cls}"><span class="cal-type">${info.short}</span>${sub}</td>`;
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

const LEVEL_HINTS = {
  advanced: "進階版：第1週就有速度跑，起始跑量較高（約60K/週起），適合已有規律訓練基礎的跑者。",
  beginner: "初階版：前5-6週為基礎期（全是輕鬆跑），之後才加入速度跑與節奏跑。",
};

function switchPlan() {
  levelHint.textContent = LEVEL_HINTS[currentLevel];
  populateGoals();
  renderAll();
}

distanceSwitch.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.distance === currentDistance) return;
    currentDistance = btn.dataset.distance;
    distanceSwitch.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
    switchPlan();
  });
});

levelSwitch.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.level === currentLevel) return;
    currentLevel = btn.dataset.level;
    levelSwitch.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
    switchPlan();
  });
});

goalSelect.addEventListener("change", () => {
  renderPaceSummary();
  renderWorkoutList();
});

zipBtn.addEventListener("click", () => downloadZip("fit"));
document.getElementById("json-zip-btn").addEventListener("click", () => downloadZip("json"));

document.getElementById("pdf-btn").addEventListener("click", async () => {
  const plan = currentPlan(), t = currentTier();
  trackDownload("pdf");
  statusEl.textContent = "產生 PDF…";
  // 300dpi 的兩頁畫布約需 2-3 秒同步運算，先讓瀏覽器把狀態文字畫出來再開工。
  // 分頁在背景時 requestAnimationFrame 不會觸發，所以一定要有 setTimeout 保底。
  await new Promise(r => {
    requestAnimationFrame(() => requestAnimationFrame(r));
    setTimeout(r, 50);
  });
  try {
    downloadPdf(plan, t);
    statusEl.textContent = "";
  } catch (err) {
    statusEl.textContent = "PDF 產生失敗：" + err.message;
  }
});

document.getElementById("xlsx-btn").addEventListener("click", () => {
  const plan = currentPlan();
  trackDownload("xlsx");
  const a = document.createElement("a");
  a.href = plan.xlsxFile;
  a.download = plan.xlsxName;
  a.click();
});

document.getElementById("poster-btn").addEventListener("click", () => {
  const plan = currentPlan(), t = currentTier();
  trackDownload("poster");
  statusEl.textContent = "產生課表圖…";
  try {
    buildPoster(plan, t).toBlob(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${plan.namePrefix}sub${goalCode(t.goal)}_18週課表.png`;
      a.click();
      URL.revokeObjectURL(a.href);
      statusEl.textContent = "";
    }, "image/png");
  } catch (err) {
    statusEl.textContent = "產生失敗：" + err.message;
  }
});

// 頁尾外顯造訪人次（GoatCounter 公開計數 JSON；抓不到就靜默不顯示）
(async () => {
  const el = document.getElementById("visitor-count");
  if (!el) return;
  try {
    const r = await fetch("https://medrunner.goatcounter.com/counter/TOTAL.json");
    if (!r.ok) return;
    const d = await r.json();
    const n = Number(String(d.count).replace(/[^\d]/g, ""));
    if (n > 0) el.textContent = `已有 ${n.toLocaleString("zh-TW")} 人次造訪本工具，感謝你的支持 🙏`;
  } catch (e) { /* 靜默失敗 */ }
})();

switchPlan();
