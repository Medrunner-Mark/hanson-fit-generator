import { fmtPace, goalCode } from "./paces.js";
import { buildWorkoutFit, workoutFileName } from "./fitgen.js";
import { workoutType, workoutCategory } from "./workout-meta.js";
import { workoutJsonText } from "./jsongen.js";
import { dayHeaders, TYPE_INFO } from "./schedule.js";
import { PLANS, cardLabel, fileStem } from "./plans.js";
import { t, lang, setLang, resolveLang, applyI18n, checkKeys, htmlLang, completeLangs } from "./i18n.js";
import { dayLabel } from "./describe.js";
import { buildPoster } from "./poster.js";
import { downloadPdf } from "./pdfgen.js";
import { parseRaceDate, scheduleDates, shortDate, isSunday } from "./dates.js";

const distanceSwitch = document.getElementById("distance-switch");
const levelSwitch = document.getElementById("level-switch");
const levelHint = document.getElementById("level-hint");
const goalSelect = document.getElementById("goal-select");
const paceSummary = document.getElementById("pace-summary");
const workoutList = document.getElementById("workout-list");
const zipBtn = document.getElementById("zip-btn");
const statusEl = document.getElementById("status");
const raceDateInput = document.getElementById("race-date");
const raceDateNote = document.getElementById("race-date-note");

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
        // path 與 title 都刻意用語言中性字串：帶入譯文的話同一個下載會依介面語言
        // 裂成三筆，歷史統計也會從加語言的那天起斷掉。
        title: `download ${kind} (${currentPlanKey()})`,
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
  const tier = currentTier();
  const rows = currentPlan().paceCards.map(card => {
    const sub = card.lap ? t("ui.lapSeconds", { sec: Math.round(tier.fiveK * 0.4) }) : "";
    return [cardLabel(card), fmtPace(tier[card.key] + (card.offsetSec || 0)), sub];
  });
  paceSummary.innerHTML = rows
    .map(([k, v, sub]) => `<div class="pace-cell"><span class="pace-label">${k}</span><span class="pace-value">${v}<small>${t("ui.paceUnit")}</small></span>${sub ? `<span class="pace-sub">${sub}</span>` : ""}</div>`)
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
  const tier = currentTier();
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
      const name = workoutFileName(w, tier, plan);
      li.innerHTML = `<span class="wname">${name}</span>`;
      const btns = document.createElement("span");
      btns.className = "btn-group";
      const fitBtn = document.createElement("button");
      fitBtn.textContent = "FIT";
      fitBtn.title = t("ui.tooltip.fit");
      fitBtn.addEventListener("click", () => {
        trackDownload("fit-single");
        downloadBytes(buildWorkoutFit(w, tier, plan), `${name}.fit`);
      });
      const jsonBtn = document.createElement("button");
      jsonBtn.textContent = "JSON";
      jsonBtn.title = t("ui.tooltip.json");
      jsonBtn.addEventListener("click", () => {
        trackDownload("json-single");
        const blob = new Blob([workoutJsonText(w, tier, plan)], { type: "application/json;charset=utf-8" });
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
  const tier = currentTier();
  const plan = currentPlan();
  trackDownload(`${kind}-zip`);
  statusEl.textContent = t("ui.status.zipping");
  try {
    const zip = new JSZip();
    for (const w of plan.workouts) {
      const name = workoutFileName(w, tier, plan);
      if (kind === "fit") {
        zip.file(`${name}.fit`, buildWorkoutFit(w, tier, plan));
      } else {
        zip.file(`${name}.json`, workoutJsonText(w, tier, plan));
      }
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${fileStem(plan, tier)}_${t("file.allWorkouts")}_${kind.toUpperCase()}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
    statusEl.textContent = "";
  } catch (err) {
    statusEl.textContent = t("ui.status.zipFail", { msg: err.message });
  }
}

// 目前選定的比賽日對應的整份日期表；未選則為 null
const currentDates = () => scheduleDates(currentPlan(), parseRaceDate(raceDateInput.value));

function renderCalendar() {
  const legend = document.getElementById("calendar-legend");
  legend.innerHTML = Object.values(TYPE_INFO)
    .map(info => `<span class="legend-item ${info.cls}">${info.name}</span>`)
    .join("");

  const table = document.getElementById("calendar");
  const dates = currentDates();
  const head = `<tr><th>${t("ui.cal.week")}</th>${dayHeaders().map(d => `<th>${d}</th>`).join("")}<th>${t("ui.cal.volume")}</th></tr>`;
  const rows = currentPlan().schedule.map((week, wi) => {
    const total = week.reduce((sum, day) => sum + day.d, 0);
    const cells = week.map((day, di) => {
      const info = TYPE_INFO[day.t];
      // 比賽日格內只留距離避免溢出（label 形如「全馬 42.2K」，但不從字串切，直接用 day.d）
      const text = day.t === "race" ? `${day.d}K` : dayLabel(day);
      const sub = day.t === "rest" ? "" : `<span class="cal-label">${text}</span>`;
      const date = dates ? `<span class="cal-date">${shortDate(dates[wi][di])}</span>` : "";
      return `<td class="${info.cls}">${date}<span class="cal-type">${info.short}</span>${sub}</td>`;
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

function switchPlan() {
  levelHint.textContent = t(`ui.levelHint.${currentLevel}`);
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

// 語言切換。按鈕文字（中文／日本語／English）永遠不翻譯——英文使用者用中文瀏覽器
// 進來時自動偵測會給中文，他必須看得懂哪一顆是回英文的出口。
const langSwitch = document.getElementById("lang-switch");
// 只留下字典已翻完的語言；未完成的按鈕直接移除，不會出現「切了沒反應」的情況
const availableLangs = completeLangs();
langSwitch.querySelectorAll("button").forEach(b => {
  if (!availableLangs.includes(b.dataset.lang)) b.remove();
});
// 只剩一種語言就整個切換器藏起來（沒得選的控制項只是雜訊）
if (availableLangs.length < 2) langSwitch.closest(".lang-bar").style.display = "none";

function markLangButton() {
  langSwitch.querySelectorAll("button").forEach(b =>
    b.classList.toggle("active", b.dataset.lang === lang()));
}
langSwitch.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.lang === lang()) return;
    // 只有主動點擊才寫入 localStorage：這樣「有存值」永遠代表使用者選過
    setLang(btn.dataset.lang, { persist: true });
    markLangButton();
    applyI18n();
    switchPlan();          // 配速卡／課表清單／行事曆全部重繪
    raceDateInput.dispatchEvent(new Event("change"));   // 非週日提示也要換語言
    renderVisitors();      // 非同步抓回來的人次不在重繪路徑上，要另外叫一次
  });
});

goalSelect.addEventListener("change", () => {
  renderPaceSummary();
  renderWorkoutList();
});

// 比賽日期：課表最後一格（第18週星期日）＝比賽日，其餘往前回推。
// 多數賽事在星期日；選到其他星期不阻擋，只提醒星期欄位會與實際日期差幾天。
raceDateInput.addEventListener("change", () => {
  const d = parseRaceDate(raceDateInput.value);
  raceDateNote.textContent = d && !isSunday(d) ? t("ui.raceDateNotSunday") : "";
  renderCalendar();
});

zipBtn.addEventListener("click", () => downloadZip("fit"));
document.getElementById("json-zip-btn").addEventListener("click", () => downloadZip("json"));

document.getElementById("pdf-btn").addEventListener("click", async () => {
  const plan = currentPlan(), tier = currentTier();
  trackDownload("pdf");
  statusEl.textContent = t("ui.status.pdf");
  // 300dpi 的兩頁畫布約需 2-3 秒同步運算，先讓瀏覽器把狀態文字畫出來再開工。
  // 分頁在背景時 requestAnimationFrame 不會觸發，所以一定要有 setTimeout 保底。
  await new Promise(r => {
    requestAnimationFrame(() => requestAnimationFrame(r));
    setTimeout(r, 50);
  });
  try {
    downloadPdf(plan, tier, currentDates());
    statusEl.textContent = "";
  } catch (err) {
    statusEl.textContent = t("ui.status.pdfFail", { msg: err.message });
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
  const plan = currentPlan(), tier = currentTier();
  trackDownload("poster");
  statusEl.textContent = t("ui.status.poster");
  try {
    buildPoster(plan, tier).toBlob(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${fileStem(plan, tier)}_${t("file.plan18w")}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
      statusEl.textContent = "";
    }, "image/png");
  } catch (err) {
    statusEl.textContent = t("ui.status.posterFail", { msg: err.message });
  }
});

// 頁尾外顯造訪人次（GoatCounter 公開計數 JSON；抓不到就靜默不顯示）。
// 人次數字存起來另外重繪：它是非同步抓回來的，不在 switchPlan() 的重繪路徑上，
// 只在載入時寫一次的話，切換語言後會留下上一個語言的句子。
let visitorCount = 0;
function renderVisitors() {
  const el = document.getElementById("visitor-count");
  if (!el || !visitorCount) return;
  el.textContent = t("ui.visitors", { n: visitorCount.toLocaleString(htmlLang()) });
}

(async () => {
  try {
    const r = await fetch("https://medrunner.goatcounter.com/counter/TOTAL.json");
    if (!r.ok) return;
    const d = await r.json();
    const n = Number(String(d.count).replace(/[^\d]/g, ""));
    if (n > 0) { visitorCount = n; renderVisitors(); }
  } catch (e) { /* 靜默失敗 */ }
})();

// ── 啟動 ──
// 先定語言再套字串，最後才渲染：switchPlan() 內的每一段渲染都會查字典。
setLang(resolveLang());
markLangButton();          // 起始選取狀態由實際判定的語言決定，不是 HTML 寫死的那顆
applyI18n();
switchPlan();

// 開發用：網址加 ?i18n=check 檢查字典完整性與 index.html 的中文是否與字典同步
if (new URLSearchParams(location.search).get("i18n") === "check") console.table(checkKeys());
