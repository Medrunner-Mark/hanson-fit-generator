import { fmtPace, goalCode } from "./paces.js";
import { buildWorkoutFit, workoutFileName } from "./fitgen.js";
import { workoutType, workoutCategory, workoutLabel } from "./workout-meta.js";
import { workoutJsonText } from "./jsongen.js";
import { dayHeaders, TYPE_INFO } from "./schedule.js";
import { PLANS, cardLabel, fileStem } from "./plans.js";
import { t, lang, setLang, resolveLang, applyI18n, checkKeys, htmlLang, completeLangs } from "./i18n.js";
import { dayLabel, describeDay } from "./describe.js";
import { buildPoster } from "./poster.js";
import { downloadPdf } from "./pdfgen.js";
import { parseRaceDate, scheduleDates, shortDate, isSunday } from "./dates.js";

const $ = id => document.getElementById(id);

const distanceSwitch = $("distance-switch");
const levelSwitch = $("level-switch");
const levelHint = $("level-hint");
const paceSummary = $("pace-summary");
const workoutList = $("workout-list");
const statusEl = $("status");
const raceDateInput = $("race-date");
const raceDateNote = $("race-date-note");
const goalTimeEl = $("goal-time");
const goalRangeEl = $("goal-range");
const goalChipsEl = $("goal-chips");
const allGoalsBtn = $("all-goals-btn");
const daySheet = $("day-sheet");

let currentDistance = "marathon";
let currentLevel = "advanced";
let goalIndex = 0;

const currentPlanKey = () => `${currentDistance}-${currentLevel}`;
const currentPlan = () => PLANS[currentPlanKey()];
const currentTier = () => currentPlan().paceTable[goalIndex];

// 狀態提示改走畫面底部的 toast。空字串＝收起來，呼叫端沿用「設成空字串就消失」的寫法。
function setStatus(msg) {
  statusEl.textContent = msg || "";
  statusEl.hidden = !msg;
}

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

function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

const downloadBytes = (bytes, filename) =>
  downloadBlob(new Blob([bytes], { type: "application/octet-stream" }), filename);

// ── 目標時間：−／＋ 步進器 + 可展開的全部檔位 ──────────────
// 原本是 <select>。手機上點下拉會蓋掉整個畫面，看不到配速跟著變；
// 步進器點一下就能看到配速與統計即時連動。
function renderGoal() {
  const table = currentPlan().paceTable;
  goalTimeEl.textContent = currentTier().goal;
  goalRangeEl.textContent = t("nx.range", { a: table[0].goal, b: table[table.length - 1].goal });

  $("goal-slower").disabled = goalIndex === 0;
  $("goal-faster").disabled = goalIndex === table.length - 1;

  allGoalsBtn.textContent = goalChipsEl.hidden
    ? t("nx.allGoals", { n: table.length })
    : t("nx.hideGoals");
  allGoalsBtn.setAttribute("aria-expanded", String(!goalChipsEl.hidden));

  goalChipsEl.innerHTML = "";
  table.forEach((row, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = row.goal;
    b.classList.toggle("active", i === goalIndex);
    b.addEventListener("click", () => { goalIndex = i; onGoalChange(); });
    goalChipsEl.appendChild(b);
  });
}

// 配速表是由慢到快排序，所以 +1 = 更快
function stepGoal(delta) {
  const max = currentPlan().paceTable.length - 1;
  const next = Math.min(max, Math.max(0, goalIndex + delta));
  if (next === goalIndex) return;
  goalIndex = next;
  onGoalChange();
}

// 目標時間變動影響配速、統計與檔名，但不影響行事曆
function onGoalChange() {
  renderGoal();
  renderPaceSummary();
  renderWorkoutList();
  renderPlanMeta();
}

$("goal-slower").addEventListener("click", () => stepGoal(-1));
$("goal-faster").addEventListener("click", () => stepGoal(1));
allGoalsBtn.addEventListener("click", () => {
  goalChipsEl.hidden = !goalChipsEl.hidden;
  renderGoal();
});

// ── 首屏統計與計畫名稱 ────────────────────────────────────
function renderPlanMeta() {
  const plan = currentPlan();
  const name = `${plan.label} · ${plan.levelLabel}`;
  $("plan-name").textContent = name;
  $("m-plan-name").textContent = name;
  $("m-goal-time").textContent = currentTier().goal;

  let total = 0, peak = 0, days = 0;
  for (const week of plan.schedule) {
    const wk = week.reduce((sum, day) => sum + day.d, 0);
    total += wk;
    peak = Math.max(peak, wk);
    // 「訓練日數」不含休息日與比賽日
    days += week.filter(day => day.t !== "rest" && day.t !== "race").length;
  }

  const stats = [
    { k: t("nx.stat.total"), v: Math.round(total), u: "K" },
    { k: t("nx.stat.peak"), v: Math.round(peak * 10) / 10, u: "K" },
    { k: t("nx.stat.days"), v: days, u: t("nx.unit.days") },
    { k: t("nx.stat.weeks"), v: plan.schedule.length, u: t("nx.unit.weeks") },
  ];

  $("plan-stats").innerHTML = stats
    .map(s => `<div class="stat"><div class="stat-v">${s.v}<small>${s.u}</small></div><div class="stat-k">${s.k}</div></div>`)
    .join("");
}

// ── 配速卡 ────────────────────────────────────────────────
function renderPaceSummary() {
  const tier = currentTier();
  $("pace-sub").textContent = t("nx.paceSub", { g: tier.goal });
  const rows = currentPlan().paceCards.map(card => {
    const sub = card.lap ? t("ui.lapSeconds", { sec: Math.round(tier.fiveK * 0.4) }) : "";
    return [cardLabel(card), fmtPace(tier[card.key] + (card.offsetSec || 0)), sub];
  });
  paceSummary.innerHTML = rows
    .map(([k, v, sub]) => `<div class="pace-cell"><span class="pace-label">${k}</span><div><span class="pace-value">${v}<small>${t("ui.paceUnit")}</small></span>${sub ? `<span class="pace-sub">${sub}</span>` : ""}</div></div>`)
    .join("");
}

// ── 課表清單 ──────────────────────────────────────────────
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
      const fileName = workoutFileName(w, tier, plan);
      // 清單上顯示課表名稱而非檔名：檔名前綴（漢森進階sub400_）每一列都會重複一次，是雜訊。
      // 下載時仍用完整檔名。
      li.innerHTML = `<span class="wname" title="${fileName}">${workoutLabel(w)}</span>`;
      const btns = document.createElement("span");
      btns.className = "btn-group";
      const fitBtn = document.createElement("button");
      fitBtn.textContent = "FIT";
      fitBtn.title = t("ui.tooltip.fit");
      fitBtn.addEventListener("click", () => {
        trackDownload("fit-single");
        downloadBytes(buildWorkoutFit(w, tier, plan), `${fileName}.fit`);
      });
      const jsonBtn = document.createElement("button");
      jsonBtn.textContent = "JSON";
      jsonBtn.title = t("ui.tooltip.json");
      jsonBtn.addEventListener("click", () => {
        trackDownload("json-single");
        downloadBlob(new Blob([workoutJsonText(w, tier, plan)], { type: "application/json;charset=utf-8" }), `${fileName}.json`);
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
  setStatus(t("ui.status.zipping"));
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
    downloadBlob(blob, `${fileStem(plan, tier)}_${t("file.allWorkouts")}_${kind.toUpperCase()}.zip`);
    setStatus("");
  } catch (err) {
    setStatus(t("ui.status.zipFail", { msg: err.message }));
  }
}

// ── 18 週行事曆 ───────────────────────────────────────────
// 目前選定的比賽日對應的整份日期表；未選則為 null
const currentDates = () => scheduleDates(currentPlan(), parseRaceDate(raceDateInput.value));

function renderCalendar() {
  $("calendar-legend").innerHTML = Object.values(TYPE_INFO)
    .map(info => `<span class="legend-item ${info.cls}">${info.name}</span>`)
    .join("");

  const grid = $("calendar");
  const dates = currentDates();
  grid.innerHTML = "";

  const head = [t("ui.cal.week")].concat(dayHeaders(), [t("ui.cal.volume")]);
  for (const label of head) {
    const el = document.createElement("div");
    el.className = "cal-head";
    el.textContent = label;
    grid.appendChild(el);
  }

  currentPlan().schedule.forEach((week, wi) => {
    const weekCell = document.createElement("div");
    weekCell.className = "cal-cell cal-week";
    weekCell.innerHTML = `<span class="cal-type">W${wi + 1}</span>`;
    grid.appendChild(weekCell);

    week.forEach((day, di) => {
      const info = TYPE_INFO[day.t];
      // 比賽日格內只留距離避免溢出（label 形如「全馬 42.2K」，但不從字串切，直接用 day.d）
      const text = day.t === "race" ? `${day.d}K` : dayLabel(day);
      // 休息日沒有明細可看，做成不可點的 div；其餘是 button，鍵盤也能操作
      const clickable = day.t !== "rest";
      const cell = document.createElement(clickable ? "button" : "div");
      if (clickable) cell.type = "button";
      cell.className = `cal-cell ${info.cls}`;
      const date = dates ? `<span class="cal-date">${shortDate(dates[wi][di])}</span>` : "";
      const sub = day.t === "rest" ? "" : `<span class="cal-label">${text}</span>`;
      cell.innerHTML = `${date}<span class="cal-type">${info.short}</span>${sub}`;
      if (clickable) cell.addEventListener("click", () => openDay(wi, di));
      grid.appendChild(cell);
    });

    const total = week.reduce((sum, day) => sum + day.d, 0);
    const totalCell = document.createElement("div");
    totalCell.className = "cal-cell cal-total";
    totalCell.innerHTML = `<span class="cal-type">${Math.round(total * 10) / 10}K</span>`;
    grid.appendChild(totalCell);
  });
}

// ── 當日課表明細 ──────────────────────────────────────────
// describeDay() 帶入該目標時間的實際配速，原本只有 PDF 看得到。
function openDay(wi, di) {
  const plan = currentPlan();
  const day = plan.schedule[wi][di];
  const dates = currentDates();
  const info = TYPE_INFO[day.t];

  $("sheet-when").textContent = [
    t("nx.week", { n: wi + 1 }),
    dayHeaders()[di],
    dates ? shortDate(dates[wi][di]) : null,
  ].filter(Boolean).join(" · ");

  $("sheet-title").textContent = info.name;
  $("sheet-text").textContent = describeDay(plan, day, currentTier());
  $("sheet-type").textContent = info.name;
  $("sheet-type").className = `tag ${info.cls}`;
  $("sheet-km").textContent = `${day.d} K`;

  daySheet.hidden = false;
  $("sheet-close").focus();
}

const closeDay = () => { daySheet.hidden = true; };

$("sheet-close").addEventListener("click", closeDay);
daySheet.addEventListener("click", e => { if (e.target === daySheet) closeDay(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !daySheet.hidden) closeDay(); });

// ── 匯入教學分頁 ──────────────────────────────────────────
$("import-tabs").querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    $("import-tabs").querySelectorAll(".tab").forEach(b => {
      const on = b === tab;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", String(on));
      $(`tab-${b.dataset.tab}`).hidden = !on;
    });
  });
});

// ── 深色模式 ──────────────────────────────────────────────
// 初值已由 index.html 的 inline script 在第一次 paint 前定好，這裡只處理切換。
function renderThemeIcon() {
  $("theme-icon").textContent = document.documentElement.dataset.t === "dark" ? "☾" : "☀";
}
$("theme-btn").addEventListener("click", () => {
  const next = document.documentElement.dataset.t === "dark" ? "light" : "dark";
  document.documentElement.dataset.t = next;
  try { localStorage.setItem("hfg.theme", next); } catch (e) { /* 無痕模式存不了就算了 */ }
  renderThemeIcon();
});

// ── 影片：點了才載入 YouTube ──────────────────────────────
$("video-play").addEventListener("click", () => {
  const iframe = document.createElement("iframe");
  iframe.src = "https://www.youtube-nocookie.com/embed/GahoTo3an5Q?autoplay=1";
  iframe.title = "用漢森理論打造你的全馬課表｜Med日跑者";
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.allowFullscreen = true;
  $("video-embed").replaceChildren(iframe);
});

// ── 計畫切換 ──────────────────────────────────────────────
function renderAll() {
  renderGoal();
  renderPlanMeta();
  renderPaceSummary();
  renderWorkoutList();
  renderCalendar();
}

function switchPlan() {
  levelHint.textContent = t(`ui.levelHint.${currentLevel}`);
  // 換計畫時配速表長度會變（初階有上限），把目標索引夾回範圍內
  goalIndex = Math.min(goalIndex, currentPlan().paceTable.length - 1);
  closeDay();
  renderAll();
}

function resetGoalToDefault() {
  const plan = currentPlan();
  const i = plan.paceTable.findIndex(row => row.goal === plan.defaultGoal);
  goalIndex = i < 0 ? 0 : i;
}

distanceSwitch.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.distance === currentDistance) return;
    currentDistance = btn.dataset.distance;
    distanceSwitch.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
    // 全馬 4:00 與半馬 4:00 不是同一件事，換距離時回到該計畫的預設目標
    resetGoalToDefault();
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
const langSwitch = $("lang-switch");
// 只留下字典已翻完的語言；未完成的按鈕直接移除，不會出現「切了沒反應」的情況
const availableLangs = completeLangs();
langSwitch.querySelectorAll("button").forEach(b => {
  if (!availableLangs.includes(b.dataset.lang)) b.remove();
});
// 只剩一種語言就整個切換器藏起來（沒得選的控制項只是雜訊）
if (availableLangs.length < 2) {
  const bar = langSwitch.closest(".lang-bar") || langSwitch;
  bar.style.display = "none";
}

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

// 比賽日期：課表最後一格（第18週星期日）＝比賽日，其餘往前回推。
// 多數賽事在星期日；選到其他星期不阻擋，只提醒星期欄位會與實際日期差幾天。
raceDateInput.addEventListener("change", () => {
  const d = parseRaceDate(raceDateInput.value);
  raceDateNote.textContent = d && !isSunday(d) ? t("ui.raceDateNotSunday") : "";
  renderCalendar();
});

// ── 下載 ──────────────────────────────────────────────────
$("zip-btn").addEventListener("click", () => downloadZip("fit"));
$("json-zip-btn").addEventListener("click", () => downloadZip("json"));
$("m-fit-btn").addEventListener("click", () => downloadZip("fit"));
$("m-json-btn").addEventListener("click", () => downloadZip("json"));

$("pdf-btn").addEventListener("click", async () => {
  const plan = currentPlan(), tier = currentTier();
  trackDownload("pdf");
  setStatus(t("ui.status.pdf"));
  // 300dpi 的兩頁畫布約需 2-3 秒同步運算，先讓瀏覽器把狀態文字畫出來再開工。
  // 分頁在背景時 requestAnimationFrame 不會觸發，所以一定要有 setTimeout 保底。
  await new Promise(r => {
    requestAnimationFrame(() => requestAnimationFrame(r));
    setTimeout(r, 50);
  });
  try {
    downloadPdf(plan, tier, currentDates());
    setStatus("");
  } catch (err) {
    setStatus(t("ui.status.pdfFail", { msg: err.message }));
  }
});

$("xlsx-btn").addEventListener("click", () => {
  const plan = currentPlan();
  trackDownload("xlsx");
  const a = document.createElement("a");
  a.href = plan.xlsxFile;
  // 檔名依語言。中文沿用既有名稱（{legacy}）不變，英日文改標明是模板——
  // 這份 Excel 不分目標時間，帶 sub400 會與內容不符。
  a.download = `${t("file.xlsxName", { prefix: plan.namePrefix, legacy: plan.xlsxName.replace(/\.xlsx$/, "") })}.xlsx`;
  a.click();
});

$("poster-btn").addEventListener("click", () => {
  const plan = currentPlan(), tier = currentTier();
  trackDownload("poster");
  setStatus(t("ui.status.poster"));
  try {
    buildPoster(plan, tier).toBlob(blob => {
      downloadBlob(blob, `${fileStem(plan, tier)}_${t("file.plan18w")}.png`);
      setStatus("");
    }, "image/png");
  } catch (err) {
    setStatus(t("ui.status.posterFail", { msg: err.message }));
  }
});

// 頁尾外顯造訪人次（GoatCounter 公開計數 JSON；抓不到就靜默不顯示）。
// 人次數字存起來另外重繪：它是非同步抓回來的，不在 switchPlan() 的重繪路徑上，
// 只在載入時寫一次的話，切換語言後會留下上一個語言的句子。
let visitorCount = 0;
function renderVisitors() {
  const el = $("visitor-count");
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
// 先定語言再套字串，最後才渲染：renderAll() 內的每一段渲染都會查字典。
setLang(resolveLang());
markLangButton();          // 起始選取狀態由實際判定的語言決定，不是 HTML 寫死的那顆
applyI18n();
renderThemeIcon();
resetGoalToDefault();
switchPlan();

// 開發用：網址加 ?i18n=check 檢查字典完整性與 index.html 的中文是否與字典同步
if (new URLSearchParams(location.search).get("i18n") === "check") console.table(checkKeys());
