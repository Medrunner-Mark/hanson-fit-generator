// 全站字串字典。一個 key 一行、三種語言並排。
//
// 為什麼不是三個語言各一個檔：並排就不可能加了一種語言忘記另一種，而且之後補
// 日文/英文時每一行就是「多一個欄位」的純加法 diff，一眼可審。
//
// key 依「消費端」分群，光看前綴就知道這個字串會跑到哪裡去：
//   ui.*    介面文字      hint.*  說明段落      howto.*  匯入教學（含連結）
//   plan.*  計畫標籤      pace.*  配速卡        type.*   課表類型
//   day.*   星期／日期    wk.*    課表分類      desc.*   PDF 每日敘述
//   poster.* pdf.*        畫布上的文字
//   fit.*   ← 會寫進 FIT／JSON，顯示在使用者的手錶上
//   file.*  ← 會變成下載檔名
//
// 插值一律用 {name} 搭配 params 物件，字典裡不放 function：function 沒辦法做
// 完整性比對，也會把邏輯藏進資料層。語言差異一律用資料表達，例如 wk.label 中日文
// 是「{cat}{spec}」而英文是「{cat}-{spec}」，不寫成條件式。
//
// data-i18n-html 的值只允許 <a> <code> <br> <strong>，且全部是作者自己寫的常數，
// 永遠不會是使用者輸入。

export const STRINGS = {
  // ── 介面 ───────────────────────────────────────────────
  "ui.title":        { zh: "漢森課表產生器｜Med日跑者" },
  "ui.h1":           { zh: "漢森課表產生器" },
  "ui.subtitle":     { zh: "選擇距離與目標時間，下載整套 18 週漢森課表，匯入 Garmin 手錶或 Connect 網頁版。" },
  "ui.metaDesc":     { zh: "依《漢森馬拉松訓練法》產生 18 週全馬／半馬課表，可下載 Garmin FIT、Connect JSON、A4 PDF 與課表圖。" },

  "ui.dist.marathon": { zh: "全程馬拉松" },
  "ui.dist.half":     { zh: "半程馬拉松" },
  "ui.level.advanced": { zh: "進階" },
  "ui.level.beginner": { zh: "初階" },
  "ui.levelHint.advanced": { zh: "進階版：第1週就有速度跑，起始跑量較高（約60K/週起），適合已有規律訓練基礎的跑者。" },
  "ui.levelHint.beginner": { zh: "初階版：前5-6週為基礎期（全是輕鬆跑），之後才加入速度跑與節奏跑。" },

  "ui.goalLabel":    { zh: "目標完賽時間" },
  "ui.btn.fitZip":   { zh: "FIT 全部下載（手錶接電腦用）" },
  "ui.btn.jsonZip":  { zh: "JSON 全部下載（Connect網頁版用）" },
  "ui.btn.poster":   { zh: "下載課表圖（直式圖，適合發 IG）" },
  "ui.btn.pdf":      { zh: "PDF 課表（A4 可列印）" },
  "ui.btn.xlsx":     { zh: "Excel 互動模板（有詳細配速說明）" },
  "ui.tooltip.fit":  { zh: "下載 .fit（USB 匯入手錶）" },
  "ui.tooltip.json": { zh: "下載 .json（外掛匯入 Garmin Connect 網頁版）" },

  "ui.status.zipping":  { zh: "打包中…" },
  "ui.status.zipFail":  { zh: "打包失敗：{msg}" },
  "ui.status.pdf":      { zh: "產生 PDF…" },
  "ui.status.pdfFail":  { zh: "PDF 產生失敗：{msg}" },
  "ui.status.poster":   { zh: "產生課表圖…" },
  "ui.status.posterFail": { zh: "產生失敗：{msg}" },
  "ui.err.canvasTooBig": { zh: "畫布過大，無法產生 PDF" },

  "ui.h2.paces":     { zh: "你的訓練配速" },
  "ui.h2.calendar":  { zh: "18週課表總覽" },
  "ui.h2.workouts":  { zh: "課表清單" },
  "ui.h2.about":     { zh: "關於作者" },
  "ui.h2.howtoFit":  { zh: "怎麼由Garmin電腦版匯入手錶（FIT 檔）" },
  "ui.h2.howtoJson": { zh: "不想接線？透過 Garmin Connect 網頁版匯入（JSON 檔）" },

  "ui.raceDateLabel": { zh: "比賽日期（選填）" },
  "ui.raceDateNotSunday": { zh: "提醒：你選的不是星期日，課表的星期欄位會與實際日期對不上。" },

  "ui.cal.week":     { zh: "週次" },
  "ui.cal.volume":   { zh: "週跑量" },
  "ui.paceUnit":     { zh: "/km" },
  "ui.lapSeconds":   { zh: "每圈<strong>{sec}</strong>s" },
  "ui.visitors":     { zh: "已有 {n} 人次造訪本工具，感謝你的支持 🙏" },

  "ui.authorName":   { zh: "Med日跑者" },
  "ui.authorRole":   { zh: "住院醫師 × 每日跑者" },
  "ui.authorBio":    { zh: "希望幫助更多跑者科學化訓練。歡迎在社群追蹤我的訓練與賽事紀錄。" },
  "ui.social.yt":    { zh: "YouTube 頻道" },
  "ui.social.ig":    { zh: "Instagram" },
  "ui.footer.credit": { zh: "課表結構與配速依據《漢森馬拉松訓練法》｜工具由 Med日跑者 製作" },
  "ui.footer.thanks": { zh: '配速參考並感謝 Hansons 官方訓練法與 <a href="{urlLHR}" target="_blank" rel="noopener">Luke Humphrey Running</a> 官方計算機。' },

  // ── 說明段落 ───────────────────────────────────────────
  "hint.pace": { zh: [
    "輕鬆有氧A＝慢速輕鬆跑：用於課表中的暖身與收操、強度訓練的隔天。",
    "輕鬆有氧B＝快速輕鬆跑：用於前一天是休息日或輕鬆跑的日子。",
    "速度跑配速即配速表的400公尺配速（範圍前後各加5秒，中點恰為表定配速）。",
  ]},
  "hint.calendar": { zh: "列＝週次、欄＝星期一到日，比賽日在第18週的星期天。最右欄是當週跑量（含速度/強化/節奏跑中的前後緩跑各2K）。" },
  "hint.workouts": { zh: "重複的課表只需要一份——在手錶或 Garmin Connect 裡同一份課表可以重複安排到不同週次。各課表對應週次請參考影片說明。" },
  "hint.videoFallback": { zh: '影片無法播放？<a href="{urlYouTube}" target="_blank" rel="noopener">直接在 YouTube 開啟</a>' },
  "hint.privacy": { zh: "所有計算與檔案產生都在你的瀏覽器裡完成，不會上傳任何資料。" },

  // ── 匯入教學 ───────────────────────────────────────────
  "howto.fit.1": { zh: "用Garmin充電線把 Garmin 手錶接上電腦。" },
  "howto.fit.2": { zh: "把下載的 .fit 檔案全部複製到手錶的 <code>GARMIN/Workouts</code> 資料夾。" },
  "howto.fit.3": { zh: "拔線，手錶上到「訓練 → 訓練課表」就能看到匯入的課表。" },
  "howto.json.1": { zh: '安裝瀏覽器外掛 <a href="{urlPlugin}" target="_blank" rel="noopener">Share your Garmin Connect workout</a>（第三方開源外掛）。' },
  "howto.json.2": { zh: "下載上方的 .json 課表檔。" },
  "howto.json.3": { zh: '登入 <a href="{urlConnect}" target="_blank" rel="noopener">Garmin Connect 的訓練課表頁</a>，按外掛加上的「Import Workout」按鈕選擇 .json 檔匯入（目前一次只能匯入一個檔案）。' },
  "howto.json.4": { zh: "匯入後課表就在你的 Connect 帳號裡，可排入行事曆、由手機 App 同步到手錶，全程不用接線。" },

  // ── 計畫標籤 ───────────────────────────────────────────
  "plan.dist.marathon": { zh: "全馬" },
  "plan.dist.half":     { zh: "半馬" },
  "plan.level.advanced": { zh: "進階" },
  "plan.level.beginner": { zh: "初階" },

  // ── 配速卡（full = 卡片上的完整標籤，short = 課表圖／PDF 用的短標籤）──
  "pace.recovery.full": { zh: "恢復跑" },      "pace.recovery.short": { zh: "恢復跑" },
  "pace.easyA.full":    { zh: "輕鬆有氧A" },   "pace.easyA.short":    { zh: "輕鬆有氧A" },
  "pace.easyB.full":    { zh: "輕鬆有氧B" },   "pace.easyB.short":    { zh: "輕鬆有氧B" },
  "pace.long.full":     { zh: "長跑" },        "pace.long.short":     { zh: "長跑" },
  "pace.tempo.full":    { zh: "節奏跑 (MP)" }, "pace.tempo.short":    { zh: "節奏跑" },
  "pace.hmp.full":      { zh: "節奏跑 (HMP)" },"pace.hmp.short":      { zh: "節奏跑" },
  "pace.strength.full": { zh: "強化跑" },      "pace.strength.short": { zh: "強化跑" },
  "pace.tenK.full":     { zh: "強化跑 (10K)" },"pace.tenK.short":     { zh: "強化跑" },
  "pace.speed.full":    { zh: "速度跑" },      "pace.speed.short":    { zh: "速度跑" },

  // ── 課表類型（name = 圖例全名，short = 格子內短名）──
  "type.easy.name":     { zh: "輕鬆有氧" },  "type.easy.short":     { zh: "輕鬆" },
  "type.speed.name":    { zh: "速度跑" },    "type.speed.short":    { zh: "速度" },
  "type.tempo.name":    { zh: "節奏跑" },    "type.tempo.short":    { zh: "節奏" },
  "type.strength.name": { zh: "強化跑" },    "type.strength.short": { zh: "強化" },
  "type.long.name":     { zh: "長跑" },      "type.long.short":     { zh: "長跑" },
  "type.rest.name":     { zh: "休息日" },    "type.rest.short":     { zh: "休息" },
  "type.race.name":     { zh: "比賽日" },    "type.race.short":     { zh: "比賽" },

  // ── 星期 ───────────────────────────────────────────────
  "day.0": { zh: "一" }, "day.1": { zh: "二" }, "day.2": { zh: "三" }, "day.3": { zh: "四" },
  "day.4": { zh: "五" }, "day.5": { zh: "六" }, "day.6": { zh: "日" },
  // 進階半馬 W18 週六的「5K放鬆」——全課表唯一非數字的輕鬆跑標籤
  "day.label.shakeout": { zh: "{d}K放鬆" },

  // ── 課表分類與名稱 ─────────────────────────────────────
  "wk.cat.speed":    { zh: "速度跑" },
  "wk.cat.strength": { zh: "強化跑" },
  "wk.cat.tempo":    { zh: "節奏跑" },
  "wk.cat.long":     { zh: "長跑" },
  "wk.cat.alt":      { zh: "替代課表" },
  "wk.label":        { zh: "{cat}{spec}" },
  "wk.name.prog_90min": { zh: "90min出國漸速跑" },

  // ── 檔名 ───────────────────────────────────────────────
  "file.prefix.marathon-advanced": { zh: "漢森進階" },
  "file.prefix.marathon-beginner": { zh: "漢森初階" },
  "file.prefix.half-advanced":     { zh: "漢森進階半馬" },
  "file.prefix.half-beginner":     { zh: "漢森初階半馬" },
  // 檔名共同前段。連接方式必須是資料而非寫死：中文「漢森進階sub400」直接相接沒問題，
  // 但英文前綴是 Hansons-Adv，硬接會黏成 Hansons-Advsub400。
  "file.stem":        { zh: "{prefix}sub{goal}" },
  "file.allWorkouts": { zh: "全套課表" },
  "file.plan18w":     { zh: "18週課表" },

  // ── FIT／JSON 步驟備註（會顯示在手錶上）─────────────────
  "fit.wu":            { zh: "暖身 恢復跑配速" },
  "fit.cd":            { zh: "收操 恢復跑配速" },
  "fit.jog":           { zh: "組間恢復跑" },
  "fit.openCd":        { zh: "收操" },
  "fit.mpOffset":      { zh: "{label} {pace}/km" },
  "fit.marathonPace":  { zh: "馬拉松配速 {pace}/km" },
  "fit.strength":      { zh: "MP-{gap}s {pace}/km" },
  "fit.hmpOffset":     { zh: "HMP{sign}{sec}s {pace}/km" },
  "fit.halfPace":      { zh: "半馬配速 {pace}/km" },
  "fit.tenK":          { zh: "10K配速 {pace}/km" },
  "fit.longPace":      { zh: "長跑配速 {pace}/km" },
  "fit.speedLap":      { zh: "{pace}/km 每圈{lap}秒" },
  "fit.workoutDesc":   { zh: "漢森{level}{dist}課表產生器（目標 {goal}）｜Med日跑者" },

  // ── PDF 每日敘述 ───────────────────────────────────────
  "desc.rest":    { zh: "休息 / 交叉訓練" },
  "desc.race":    { zh: "比賽日 {d}K" },
  "desc.easy":    { zh: "{label} 輕鬆跑 @{from}–{to}" },
  "desc.wu":      { zh: "{d}暖身" },
  "desc.cd":      { zh: "{d}收操" },
  "desc.reps":    { zh: "{n}×{dist} @{pace}{jog}" },
  "desc.single":  { zh: "{dist} @{pace}" },
  "desc.jogSep":  { zh: "，組間緩跑{d}" },
  "desc.arrow":   { zh: " → " },

  // ── 課表圖（直式 PNG）──────────────────────────────────
  "poster.title":    { zh: "漢森{level} 18 週課表" },
  "poster.subtitle": { zh: "{dist}　目標 {goal}" },
  "poster.week":     { zh: "週" },
  "poster.volume":   { zh: "週跑量" },

  // ── PDF ────────────────────────────────────────────────
  "pdf.title":    { zh: "漢森{level}{dist}課表 18 週" },
  "pdf.goal":     { zh: "目標 {goal}" },
  "pdf.week":     { zh: "週" },
  "pdf.volume":   { zh: "週跑量" },
  "pdf.footNote": { zh: "配速依據《漢森馬拉松訓練法》｜暖身、收操與組間緩跑請用恢復跑配速" },
  "pdf.brandLine": { zh: "Med日跑者　medrunner-mark.github.io/hanson-fit-generator　{page}/{pages}" },
};
