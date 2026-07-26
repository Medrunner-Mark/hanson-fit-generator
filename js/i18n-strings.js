// 全站字串字典。一個 key 一行、三語並排。
//
// 為什麼不是三個語言各一個檔：並排就不可能加了一種語言忘記另一種，而且之後補
// 日文時每一行就是「多一個欄位」的純加法 diff，一眼可審。
//
// key 依「消費端」分群，光看前綴就知道這個字串會跑到哪裡去：
//   ui.*    介面文字      hint.*  說明段落      howto.*  匯入教學（含連結）
//   plan.*  計畫標籤      pace.*  配速卡        type.*   課表類型
//   day.*   星期／日期    wk.*    課表分類      desc.*   PDF 每日敘述
//   poster.* pdf.*        畫布上的文字
//   fit.*   ← 會寫進 FIT／JSON，顯示在使用者的手錶上（螢幕小，要短）
//   file.*  ← 會變成下載檔名（英文一律純 ASCII）
//
// 插值一律用 {name} 搭配 params 物件，字典裡不放 function：function 沒辦法做
// 完整性比對，也會把邏輯藏進資料層。語言差異一律用資料表達，例如 wk.label 中文
// 是「{cat}{spec}」而英文是「{cat}-{spec}」，不寫成條件式。
//
// 品牌「Med日跑者」三種語言都不改（作者決定）。canvas-util 的 ja/en 字型堆疊
// 都保留中文字型當尾端後備，因此不會變成豆腐字。
//
// data-i18n-html 的值只允許 <a> <code> <br> <strong>，且全部是作者自己寫的常數，
// 永遠不會是使用者輸入。

export const STRINGS = {
  // ── 介面 ───────────────────────────────────────────────
  "ui.title":        { zh: "漢森課表產生器｜Med日跑者", en: "Hansons Plan Generator | Med日跑者" },
  "ui.h1":           { zh: "漢森課表產生器", en: "Hansons Plan Generator" },
  "ui.subtitle":     { zh: "選擇距離與目標時間，下載整套 18 週漢森課表，匯入 Garmin 手錶或 Connect 網頁版。",
                       en: "Pick a distance and goal time, then download the full 18-week Hansons plan for your Garmin watch or for Connect on the web." },
  "ui.metaDesc":     { zh: "依《漢森馬拉松訓練法》產生 18 週全馬／半馬課表，可下載 Garmin FIT、Connect JSON、A4 PDF 與課表圖。",
                       en: "Generate an 18-week Hansons marathon or half-marathon plan. Download Garmin FIT files, Connect JSON, a printable A4 PDF and a phone-sized plan image." },

  "ui.dist.marathon": { zh: "全程馬拉松", en: "Marathon" },
  "ui.dist.half":     { zh: "半程馬拉松", en: "Half Marathon" },
  "ui.level.advanced": { zh: "進階", en: "Advanced" },
  "ui.level.beginner": { zh: "初階", en: "Beginner" },
  "ui.levelHint.advanced": { zh: "進階版：第1週就有速度跑，起始跑量較高（約60K/週起），適合已有規律訓練基礎的跑者。",
                             en: "Advanced: speed work from week 1 and a higher starting volume (about 60K/week). For runners who already train consistently." },
  "ui.levelHint.beginner": { zh: "初階版：前5-6週為基礎期（全是輕鬆跑），之後才加入速度跑與節奏跑。",
                             en: "Beginner: the first 5–6 weeks are base building (all easy running); speed and tempo work start after that." },

  "ui.goalLabel":    { zh: "目標完賽時間", en: "Goal finish time" },
  "ui.btn.fitZip":   { zh: "FIT 全部下載（手錶接電腦用）", en: "Download all FIT (watch via USB)" },
  "ui.btn.jsonZip":  { zh: "JSON 全部下載（Connect網頁版用）", en: "Download all JSON (for Connect web)" },
  "ui.btn.poster":   { zh: "下載課表圖（直式圖，適合發 IG）", en: "Download plan image (portrait, good for IG)" },
  "ui.btn.pdf":      { zh: "PDF 課表（A4 可列印）", en: "PDF plan (A4, printable)" },
  "ui.btn.xlsx":     { zh: "Excel 互動模板（有詳細配速說明）", en: "Excel template (detailed pace notes)" },
  "ui.tooltip.fit":  { zh: "下載 .fit（USB 匯入手錶）", en: "Download .fit (import to watch over USB)" },
  "ui.tooltip.json": { zh: "下載 .json（外掛匯入 Garmin Connect 網頁版）", en: "Download .json (import to Garmin Connect web via the extension)" },

  "ui.status.zipping":  { zh: "打包中…", en: "Packaging…" },
  "ui.status.zipFail":  { zh: "打包失敗：{msg}", en: "Packaging failed: {msg}" },
  "ui.status.pdf":      { zh: "產生 PDF…", en: "Generating PDF…" },
  "ui.status.pdfFail":  { zh: "PDF 產生失敗：{msg}", en: "PDF failed: {msg}" },
  "ui.status.poster":   { zh: "產生課表圖…", en: "Generating image…" },
  "ui.status.posterFail": { zh: "產生失敗：{msg}", en: "Failed: {msg}" },
  "ui.err.canvasTooBig": { zh: "畫布過大，無法產生 PDF", en: "Canvas too large to generate the PDF" },

  "ui.h2.paces":     { zh: "你的訓練配速", en: "Your training paces" },
  "ui.h2.calendar":  { zh: "18週課表總覽", en: "18-week overview" },
  "ui.h2.workouts":  { zh: "課表清單", en: "Workout list" },
  "ui.h2.about":     { zh: "關於作者", en: "About" },
  "ui.h2.howtoFit":  { zh: "怎麼由Garmin電腦版匯入手錶（FIT 檔）", en: "Import to your watch from a computer (FIT files)" },
  "ui.h2.howtoJson": { zh: "不想接線？透過 Garmin Connect 網頁版匯入（JSON 檔）", en: "No cable? Import via Garmin Connect on the web (JSON files)" },

  "ui.raceDateLabel": { zh: "比賽日期（選填）", en: "Race date (optional)" },
  "ui.raceDateNotSunday": { zh: "提醒：你選的不是星期日，課表的星期欄位會與實際日期對不上。",
                            en: "Heads up: that date isn't a Sunday, so the weekday columns won't line up with the actual dates." },

  "ui.cal.week":     { zh: "週次", en: "Week" },
  "ui.cal.volume":   { zh: "週跑量", en: "Weekly" },
  "ui.paceUnit":     { zh: "/km", en: "/km" },
  "ui.lapSeconds":   { zh: "每圈<strong>{sec}</strong>s", en: "<strong>{sec}</strong>s per lap" },
  "ui.visitors":     { zh: "已有 {n} 人次造訪本工具，感謝你的支持 🙏", en: "{n} visits so far — thanks for the support 🙏" },

  "ui.authorName":   { zh: "Med日跑者", en: "Med日跑者" },
  "ui.authorRole":   { zh: "住院醫師 × 每日跑者", en: "Resident physician × everyday runner" },
  "ui.authorBio":    { zh: "希望幫助更多跑者科學化訓練。歡迎在社群追蹤我的訓練與賽事紀錄。",
                       en: "Helping more runners train with a bit more science behind it. Follow along for training and race reports." },
  "ui.social.yt":    { zh: "YouTube 頻道", en: "YouTube channel" },
  "ui.social.ig":    { zh: "Instagram", en: "Instagram" },
  "ui.footer.credit": { zh: "課表結構與配速依據《漢森馬拉松訓練法》｜工具由 Med日跑者 製作",
                        en: "Plan structure and paces follow the Hansons Marathon Method | built by Med日跑者" },
  "ui.footer.thanks": { zh: '配速參考並感謝 Hansons 官方訓練法與 <a href="{urlLHR}" target="_blank" rel="noopener">Luke Humphrey Running</a> 官方計算機。',
                        en: 'Paces reference — with thanks to the official Hansons method and the <a href="{urlLHR}" target="_blank" rel="noopener">Luke Humphrey Running</a> calculator.' },

  // ── 說明段落 ───────────────────────────────────────────
  "hint.pace": {
    zh: [
      "輕鬆有氧A＝慢速輕鬆跑：用於課表中的暖身與收操、強度訓練的隔天。",
      "輕鬆有氧B＝快速輕鬆跑：用於前一天是休息日或輕鬆跑的日子。",
      "速度跑配速即配速表的400公尺配速（範圍前後各加5秒，中點恰為表定配速）。",
    ],
    en: [
      "Easy A = the slower easy pace: for warm-ups, cool-downs, and the day after a hard session.",
      "Easy B = the faster easy pace: for days following a rest day or an easy day.",
      "Speed pace is the 400m pace from the pace table (the range is ±5s, so the midpoint is exactly the table value).",
    ],
  },
  "hint.calendar": { zh: "列＝週次、欄＝星期一到日，比賽日在第18週的星期天。最右欄是當週跑量（含速度/強化/節奏跑中的前後緩跑各2K）。",
                     en: "Rows are weeks, columns are Monday to Sunday; race day is the Sunday of week 18. The last column is weekly volume (including the 2K warm-up and 2K cool-down in speed/strength/tempo sessions)." },
  "hint.workouts": { zh: "重複的課表只需要一份——在手錶或 Garmin Connect 裡同一份課表可以重複安排到不同週次。各課表對應週次請參考影片說明。",
                     en: "You only need one copy of each workout — on your watch or in Garmin Connect the same workout can be scheduled into several different weeks. See the video for which weeks use which workout." },
  "hint.videoFallback": { zh: '影片無法播放？<a href="{urlYouTube}" target="_blank" rel="noopener">直接在 YouTube 開啟</a>',
                          en: 'Video not playing? <a href="{urlYouTube}" target="_blank" rel="noopener">Open it on YouTube</a>' },
  "hint.privacy": { zh: "所有計算與檔案產生都在你的瀏覽器裡完成，不會上傳任何資料。",
                    en: "Everything is calculated and generated in your browser. Nothing is uploaded." },

  // ── 匯入教學 ───────────────────────────────────────────
  "howto.fit.1": { zh: "用Garmin充電線把 Garmin 手錶接上電腦。",
                   en: "Connect your Garmin watch to your computer with its charging cable." },
  "howto.fit.2": { zh: "把下載的 .fit 檔案全部複製到手錶的 <code>GARMIN/Workouts</code> 資料夾。",
                   en: "Copy all the downloaded .fit files into the watch's <code>GARMIN/Workouts</code> folder." },
  "howto.fit.3": { zh: "拔線，手錶上到「訓練 → 訓練課表」就能看到匯入的課表。",
                   en: "Unplug, then open Training → Workouts on the watch to find them." },
  "howto.json.1": { zh: '安裝瀏覽器外掛 <a href="{urlPlugin}" target="_blank" rel="noopener">Share your Garmin Connect workout</a>（第三方開源外掛）。',
                    en: 'Install the browser extension <a href="{urlPlugin}" target="_blank" rel="noopener">Share your Garmin Connect workout</a> (third-party, open source).' },
  "howto.json.2": { zh: "下載上方的 .json 課表檔。", en: "Download the .json workout files above." },
  "howto.json.3": { zh: '登入 <a href="{urlConnect}" target="_blank" rel="noopener">Garmin Connect 的訓練課表頁</a>，按外掛加上的「Import Workout」按鈕選擇 .json 檔匯入（目前一次只能匯入一個檔案）。',
                    en: 'Sign in to the <a href="{urlConnect}" target="_blank" rel="noopener">Garmin Connect workouts page</a> and use the "Import Workout" button the extension adds (one file at a time for now).' },
  "howto.json.4": { zh: "匯入後課表就在你的 Connect 帳號裡，可排入行事曆、由手機 App 同步到手錶，全程不用接線。",
                    en: "The workouts then live in your Connect account — schedule them on the calendar and sync to the watch from the phone app, no cable needed." },

  // ── 計畫標籤 ───────────────────────────────────────────
  "plan.dist.marathon": { zh: "全馬", en: "Marathon" },
  "plan.dist.half":     { zh: "半馬", en: "Half" },
  "plan.level.advanced": { zh: "進階", en: "Advanced" },
  "plan.level.beginner": { zh: "初階", en: "Beginner" },

  // ── 配速卡（full = 卡片上的完整標籤，short = 課表圖／PDF 用的短標籤）──
  // 漢森的「節奏跑」就是馬拉松配速，英文沿用原書的 Tempo 並在括號標明 MP／HMP。
  "pace.recovery.full": { zh: "恢復跑", en: "Recovery" },        "pace.recovery.short": { zh: "恢復跑", en: "Recovery" },
  "pace.easyA.full":    { zh: "輕鬆有氧A", en: "Easy A" },       "pace.easyA.short":    { zh: "輕鬆有氧A", en: "Easy A" },
  "pace.easyB.full":    { zh: "輕鬆有氧B", en: "Easy B" },       "pace.easyB.short":    { zh: "輕鬆有氧B", en: "Easy B" },
  "pace.long.full":     { zh: "長跑", en: "Long" },              "pace.long.short":     { zh: "長跑", en: "Long" },
  "pace.tempo.full":    { zh: "節奏跑 (MP)", en: "Tempo (MP)" }, "pace.tempo.short":    { zh: "節奏跑", en: "Tempo" },
  "pace.hmp.full":      { zh: "節奏跑 (HMP)", en: "Tempo (HMP)" },"pace.hmp.short":     { zh: "節奏跑", en: "Tempo" },
  "pace.strength.full": { zh: "強化跑", en: "Strength" },        "pace.strength.short": { zh: "強化跑", en: "Strength" },
  "pace.tenK.full":     { zh: "強化跑 (10K)", en: "Strength (10K)" },"pace.tenK.short": { zh: "強化跑", en: "Strength" },
  "pace.speed.full":    { zh: "速度跑", en: "Speed" },           "pace.speed.short":    { zh: "速度跑", en: "Speed" },

  // ── 課表類型（name = 圖例全名，short = 格子內短名）──
  "type.easy.name":     { zh: "輕鬆有氧", en: "Easy" },     "type.easy.short":     { zh: "輕鬆", en: "Easy" },
  "type.speed.name":    { zh: "速度跑", en: "Speed" },      "type.speed.short":    { zh: "速度", en: "Speed" },
  "type.tempo.name":    { zh: "節奏跑", en: "Tempo" },      "type.tempo.short":    { zh: "節奏", en: "Tempo" },
  "type.strength.name": { zh: "強化跑", en: "Strength" },   "type.strength.short": { zh: "強化", en: "Strength" },
  "type.long.name":     { zh: "長跑", en: "Long" },         "type.long.short":     { zh: "長跑", en: "Long" },
  "type.rest.name":     { zh: "休息日", en: "Rest" },       "type.rest.short":     { zh: "休息", en: "Rest" },
  "type.race.name":     { zh: "比賽日", en: "Race" },       "type.race.short":     { zh: "比賽", en: "Race" },

  // ── 星期 ───────────────────────────────────────────────
  "day.0": { zh: "一", en: "Mon" }, "day.1": { zh: "二", en: "Tue" }, "day.2": { zh: "三", en: "Wed" },
  "day.3": { zh: "四", en: "Thu" }, "day.4": { zh: "五", en: "Fri" }, "day.5": { zh: "六", en: "Sat" },
  "day.6": { zh: "日", en: "Sun" },
  // 進階半馬 W18 週六的「5K放鬆」——全課表唯一非數字的輕鬆跑標籤
  "day.label.shakeout": { zh: "{d}K放鬆", en: "{d}K shakeout" },

  // ── 課表分類與名稱 ─────────────────────────────────────
  "wk.cat.speed":    { zh: "速度跑", en: "Speed" },
  "wk.cat.strength": { zh: "強化跑", en: "Strength" },
  "wk.cat.tempo":    { zh: "節奏跑", en: "Tempo" },
  "wk.cat.long":     { zh: "長跑", en: "Long" },
  "wk.cat.alt":      { zh: "替代課表", en: "Alt" },
  // 中文直接相接（速度跑12x400），英文要連字號才讀得出來（Speed-12x400）
  "wk.label":        { zh: "{cat}{spec}", en: "{cat}-{spec}" },
  "wk.name.prog_90min": { zh: "90min出國漸速跑", en: "Progression-90min" },

  // ── 檔名（英文一律純 ASCII，任何系統都不會亂碼）───────
  // 檔名共同前段。連接方式必須是資料而非寫死：中文「漢森進階sub400」直接相接沒問題，
  // 但英文前綴是 Hansons-Adv，硬接會黏成 Hansons-Advsub400。
  "file.stem":        { zh: "{prefix}sub{goal}", en: "{prefix}-sub{goal}" },
  "file.prefix.marathon-advanced": { zh: "漢森進階", en: "Hansons-Adv" },
  "file.prefix.marathon-beginner": { zh: "漢森初階", en: "Hansons-Beg" },
  "file.prefix.half-advanced":     { zh: "漢森進階半馬", en: "Hansons-Adv-Half" },
  "file.prefix.half-beginner":     { zh: "漢森初階半馬", en: "Hansons-Beg-Half" },
  "file.allWorkouts": { zh: "全套課表", en: "All-Workouts" },
  "file.plan18w":     { zh: "18週課表", en: "18-Week-Plan" },

  // ── FIT／JSON 步驟備註（運動中顯示在手錶螢幕上，要短）──
  "fit.wu":            { zh: "暖身 恢復跑配速", en: "Warm-up @ recovery pace" },
  "fit.cd":            { zh: "收操 恢復跑配速", en: "Cool-down @ recovery pace" },
  "fit.jog":           { zh: "組間恢復跑", en: "Jog recovery" },
  "fit.openCd":        { zh: "收操", en: "Cool-down" },
  "fit.mpOffset":      { zh: "{label} {pace}/km", en: "{label} {pace}/km" },
  "fit.marathonPace":  { zh: "馬拉松配速 {pace}/km", en: "Marathon pace {pace}/km" },
  "fit.strength":      { zh: "MP-{gap}s {pace}/km", en: "MP-{gap}s {pace}/km" },
  "fit.hmpOffset":     { zh: "HMP{sign}{sec}s {pace}/km", en: "HMP{sign}{sec}s {pace}/km" },
  "fit.halfPace":      { zh: "半馬配速 {pace}/km", en: "Half marathon pace {pace}/km" },
  "fit.tenK":          { zh: "10K配速 {pace}/km", en: "10K pace {pace}/km" },
  "fit.longPace":      { zh: "長跑配速 {pace}/km", en: "Long run pace {pace}/km" },
  "fit.speedLap":      { zh: "{pace}/km 每圈{lap}秒", en: "{pace}/km · {lap}s per lap" },
  "fit.workoutDesc":   { zh: "漢森{level}{dist}課表產生器（目標 {goal}）｜Med日跑者",
                         en: "Hansons {level} {dist} plan generator (goal {goal}) | Med日跑者" },

  // ── PDF 每日敘述（用跑者慣用縮寫，行數少一半，自動字級才選得大）──
  "desc.rest":    { zh: "休息 / 交叉訓練", en: "Rest / cross-training" },
  "desc.race":    { zh: "比賽日 {d}K", en: "Race day {d}K" },
  "desc.easy":    { zh: "{label} 輕鬆跑 @{from}–{to}", en: "{label} easy @{from}–{to}" },
  "desc.wu":      { zh: "{d}暖身", en: "{d} WU" },
  "desc.cd":      { zh: "{d}收操", en: "{d} CD" },
  "desc.reps":    { zh: "{n}×{dist} @{pace}{jog}", en: "{n}×{dist} @{pace}{jog}" },
  "desc.single":  { zh: "{dist} @{pace}", en: "{dist} @{pace}" },
  // 中文用全形逗號、英文用半形逗號加空格——語序與標點差異靠字典解決，不寫條件式
  "desc.jogSep":  { zh: "，組間緩跑{d}", en: ", {d} jog" },
  "desc.arrow":   { zh: " → ", en: " → " },

  // ── 課表圖（直式 PNG）──────────────────────────────────
  "poster.title":    { zh: "漢森{level} 18 週課表", en: "Hansons {level} 18-Week Plan" },
  "poster.subtitle": { zh: "{dist}　目標 {goal}", en: "{dist} · Goal {goal}" },
  "poster.week":     { zh: "週", en: "Wk" },
  "poster.volume":   { zh: "週跑量", en: "Weekly" },

  // ── PDF ────────────────────────────────────────────────
  "pdf.title":    { zh: "漢森{level}{dist}課表 18 週", en: "Hansons {level} {dist} · 18 Weeks" },
  "pdf.goal":     { zh: "目標 {goal}", en: "Goal {goal}" },
  "pdf.week":     { zh: "週", en: "Wk" },
  "pdf.volume":   { zh: "週跑量", en: "Weekly" },
  "pdf.footNote": { zh: "配速依據《漢森馬拉松訓練法》｜暖身、收操與組間緩跑請用恢復跑配速",
                    en: "Paces follow the Hansons Marathon Method | use recovery pace for warm-ups, cool-downs and jog recoveries" },
  "pdf.brandLine": { zh: "Med日跑者　medrunner-mark.github.io/hanson-fit-generator　{page}/{pages}",
                     en: "Med日跑者 · medrunner-mark.github.io/hanson-fit-generator · {page}/{pages}" },
};
