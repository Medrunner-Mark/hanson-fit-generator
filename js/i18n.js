// 多語系執行期。字典在 i18n-strings.js。
//
// 語言狀態是模組層級的（ambient），不逐一傳進每個函式。理由：這是單使用者、
// 同步、無框架的頁面，UI 一次只可能是一種語言，而且每個下載都由 UI 觸發。
// 改成到處傳 lang 參數要動 20 個以上的函式簽章、橫跨 5 個模組，churn 會淹沒
// 真正的翻譯 diff。ambient 唯一的風險是「翻譯值被快取住」——所以任何會產生
// 譯文的東西一律做成函式，不可預先算好存進資料裡（見 workout-meta.js）。
// 需要跨語言取值時用 withLang()。

import { STRINGS } from "./i18n-strings.js";

export const LANGS = ["zh", "ja", "en"];

// 字典後備語言：zh 一定是完整的，任何語言缺字都退回中文
const FALLBACK = "zh";
// 瀏覽器語言不在 LANGS 內時顯示的語言（作者決定：英文比中文對國際訪客有用）
const UNKNOWN_DEFAULT = "en";

const HTML_LANG = { zh: "zh-Hant", ja: "ja", en: "en" };
const STORE_KEY = "hfg.lang";

let current = FALLBACK;
let debug = false;

export const lang = () => current;
export const htmlLang = () => HTML_LANG[current];

// localStorage 在無痕模式會直接 throw，一律包起來
function store(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch { /* 不能存就算了，不影響功能 */ }
  return null;
}

function normalize(tag) {
  if (!tag) return null;
  const t = String(tag).toLowerCase();
  // zh-CN / zh-Hans 也給繁中：簡體讀者看繁中遠比看英文好
  if (t.startsWith("zh")) return "zh";
  if (t.startsWith("ja")) return "ja";
  if (t.startsWith("en")) return "en";
  return null;
}

// 字典已經翻完的語言。只有這些會出現在切換器上，也只有這些能被自動偵測選中——
// 半翻譯的語言會整片退回中文，使用者看到的是「切了但沒反應」，不如先不要露出來。
// 好處是加新語言不必動 UI：字典補齊的那一刻按鈕就自己出現。
export function completeLangs() {
  const keys = Object.keys(STRINGS);
  return LANGS.filter(l => l === FALLBACK || keys.every(k => STRINGS[k][l] !== undefined));
}

// 判定順序：?lang= → localStorage → 瀏覽器語言 → UNKNOWN_DEFAULT
export function resolveLang() {
  const ok = completeLangs();
  const pick = l => (l && ok.includes(l) ? l : null);

  const q = pick(normalize(new URLSearchParams(location.search).get("lang")));
  if (q) return q;                       // 深連結用，刻意不寫進 localStorage

  const saved = pick(normalize(store(STORE_KEY)));
  if (saved) return saved;               // 只有使用者主動點過切換器才會有值

  // 掃過整個清單而不是只取 [0]：["ko-KR","en-US","en"] 取第一個就漏掉英文了
  for (const tag of navigator.languages || [navigator.language]) {
    const hit = pick(normalize(tag));
    if (hit) return hit;
  }
  return pick(UNKNOWN_DEFAULT) ?? FALLBACK;
}

export function setLang(next, { persist = false } = {}) {
  if (!LANGS.includes(next)) return;
  current = next;
  // 只有明確選擇才寫入，自動偵測不寫——這樣「有存值」永遠代表「使用者選過」
  if (persist) store(STORE_KEY, next);
}

// 暫時切到別的語言取值再切回來。驗證腳本要靠它在同一次載入內產生三語輸出比對。
export function withLang(next, fn) {
  const prev = current;
  current = next;
  try { return fn(); } finally { current = prev; }
}

function lookup(key) {
  const entry = STRINGS[key];
  if (!entry) {
    if (debug) console.warn(`[i18n] 沒有這個 key：${key}`);
    return null;
  }
  const hit = entry[current] ?? entry[FALLBACK];
  if (hit === undefined) {
    if (debug) console.warn(`[i18n] ${key} 缺 ${current} 也缺 ${FALLBACK}`);
    return null;
  }
  return hit;
}

function interpolate(text, params) {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (m, name) =>
    params[name] === undefined ? m : String(params[name]));
}

// 查不到時回傳 key 本身而不是空字串：缺字會直接在畫面上現形，好抓
export function t(key, params) {
  const raw = lookup(key);
  if (raw === null) return key;
  const text = Array.isArray(raw) ? raw.join("") : raw;
  return interpolate(text, params);
}

// 多行字串（例如配速說明）一律回陣列，<br> 由呼叫端接，不進翻譯文字
export function tList(key, params) {
  const raw = lookup(key);
  if (raw === null) return [key];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map(s => interpolate(s, params));
}

// data-i18n-html 用的共用參數：網址只定義一次，三種語言共用
export const LINKS = {
  urlPlugin: "https://chromewebstore.google.com/detail/share-your-garmin-connect/kdpolhnlnkengkmfncjdbfdehglepmff",
  urlConnect: "https://connect.garmin.com/app/workouts",
  urlYouTube: "https://youtu.be/GahoTo3an5Q",
  urlLHR: "https://lukehumphreyrunning.com/",
};

// 把 [data-i18n*] 的節點換成目前語言。
//   data-i18n        → textContent
//   data-i18n-html   → innerHTML（值可為陣列，以 <br> 相接）
//   data-i18n-attr   → "title:key;alt:key2"
export function applyI18n(root = document) {
  root.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll("[data-i18n-html]").forEach(el => {
    el.innerHTML = tList(el.dataset.i18nHtml, LINKS).join("<br>");
  });
  root.querySelectorAll("[data-i18n-attr]").forEach(el => {
    for (const pair of el.dataset.i18nAttr.split(";")) {
      const [attr, key] = pair.split(":").map(s => s && s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    }
  });
  if (root === document) {
    document.documentElement.lang = htmlLang();
    document.title = t("ui.title");
  }
}

// 開發用檢查（網址加 ?i18n=check）：
//  1. 完整性 — 哪些 key 缺 ja / en
//  2. 中文漂移 — index.html 裡留作預設值的中文若與字典不同步，這裡會抓到
export function checkKeys() {
  const missing = {};
  for (const l of LANGS) {
    const gaps = Object.keys(STRINGS).filter(k => STRINGS[k][l] === undefined);
    if (gaps.length) missing[l] = gaps;
  }
  const drift = [];
  withLang("zh", () => {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const expect = t(el.dataset.i18n);
      const actual = el.textContent.trim();
      if (actual && expect.trim() !== actual) drift.push({ key: el.dataset.i18n, html: actual, dict: expect });
    });
  });
  return { 總key數: Object.keys(STRINGS).length, 缺漏: missing, 中文漂移: drift };
}

if (new URLSearchParams(location.search).get("i18n") === "debug") debug = true;
