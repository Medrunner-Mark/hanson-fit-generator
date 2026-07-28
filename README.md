# 漢森課表產生器

選擇距離、程度與目標完賽時間，一鍵產生整套《漢森馬拉松訓練法》18 週訓練課表——可下載成 Garmin `.fit` 檔（USB 匯入手錶）、Garmin Connect `.json` 檔（網頁版匯入）、課表圖 PNG、A4 PDF 與 Excel 互動模板。

由 [Med日跑者](https://www.youtube.com/@Med-runner-Mark) 製作，搭配頻道的漢森課表教學影片使用。

線上使用：<https://medrunner-mark.github.io/hanson-fit-generator/>

> **English / 日本語** — the tool is available in Traditional Chinese, Japanese and English.
> It picks a language from your browser automatically; use the switcher at the top right to change it,
> or link straight to one with `?lang=en` / `?lang=ja` / `?lang=zh`.

## 三種語言

介面、課表明細、以及**下載檔的內容與檔名**都會跟著語言變。

| | 網址 | 檔名範例 |
|---|---|---|
| 繁體中文 | `?lang=zh` | `漢森進階sub400_長跑26K.fit` |
| 日本語 | `?lang=ja` | `ハンソンズ上級sub400_ロング走26K.fit` |
| English | `?lang=en` | `Hansons-Adv-sub400_Long-26K.fit` |

- **自動偵測**：依瀏覽器語言判定；不是中／日／英時顯示英文。中文系瀏覽器（zh-TW／zh-CN／zh-HK）一律給繁體中文。
- **手動切換**：右上角切換器。只有主動點過才會記住選擇，自動偵測的結果不會寫入瀏覽器儲存空間。
- **`?lang=` 深連結**：適合放在 YouTube 說明欄或 IG bio。它**不會**覆蓋回訪者先前主動選過的語言。
- 英文檔名是純 ASCII，任何系統都不會亂碼——若在某個環境遇到檔名編碼問題，切成英文下載即可。
- Excel 互動模板本身是中文內容，三種語言下載到的都是同一份檔案。

## 四種課表

| | 進階 | 初階 |
|---|---|---|
| **全程馬拉松** | 第 1 週就有速度跑，起始約 60K/週 | 前 5-6 週為基礎期，之後才加入速度跑與節奏跑 |
| **半程馬拉松** | 同上結構，節奏跑改半馬配速 | 同上 |

目標時間每 5 分鐘一檔，配速表數字逐字轉錄自官方配速表，不做內插：

| 課表 | 目標時間範圍 |
|---|---|
| 全馬進階 | 5:00 ~ 2:10（26 檔）|
| 全馬初階 | 5:00 ~ **2:40**（20 檔）|
| 半馬進階 | 2:30 ~ 1:10（17 檔）|
| 半馬初階 | 2:30 ~ **1:20**（15 檔）|

初階課表的訓練量支撐不了太快的目標，因此刻意不開放選到那些檔位。

## 五種下載

| 格式 | 用途 |
|---|---|
| `.fit`（單一或 ZIP 全套） | USB 接線匯入 Garmin 手錶 |
| `.json`（單一或 ZIP 全套） | 透過 [Share your Garmin Connect workout](https://chromewebstore.google.com/detail/share-your-garmin-connect/kdpolhnlnkengkmfncjdbfdehglepmff) 外掛匯入 Connect 網頁版，不用接線 |
| 課表圖 PNG | 1080×1920 直式圖，適合發 IG |
| PDF | A4 兩頁 300dpi，每天列出完整課表明細與實際配速，格子下半部留白可手寫筆記 |
| Excel 互動模板 | 內含詳細配速說明的 `.xlsx`（中文） |

### 比賽日期（選填）

在行事曆下方填入比賽日期後，工具會以「第 18 週星期日＝比賽日」往前回推 125 天，把每天的日期同時標進網頁行事曆與 PDF。不填就完全不顯示日期。多數賽事在星期日；選到其他星期不會被阻擋，但會提醒星期欄位將與實際日期對不上。

## 使用方式（FIT 匯入手錶）

1. 打開工具網頁，選擇距離、程度與目標完賽時間
2. 下載單一課表，或一鍵打包全套 ZIP
3. 用 USB 線把 Garmin 手錶接上電腦，把 `.fit` 檔複製到手錶的 `GARMIN/Workouts` 資料夾
4. 退出隨身碟、拔線，到手錶「訓練 → 訓練課表」就能看到匯入的課表

重複的課表只需要一份——同一份課表可以在手錶或 Garmin Connect 裡重複安排到不同週次。各課表對應週次請參考影片說明。

## 技術說明

- 純靜態網頁（HTML/CSS/JS，無建置步驟），所有配速計算與檔案編碼都在瀏覽器端完成，不會上傳任何資料
- FIT 編碼使用 [Garmin 官方 FIT JavaScript SDK](https://github.com/garmin/fit-javascript-sdk)
- 配速表數字整理自《漢森馬拉松訓練法》與 [Luke Humphrey Running](https://lukehumphreyrunning.com/) 官方計算機
- 強化跑的「MP-10s」原書單位是每英里，換算成每公里約快 6~7 秒，本工具的 notes 標註的是實際換算後的秒數
- 全部字串集中在 `js/i18n-strings.js`，一個 key 一行、三語並排。網址加 `?i18n=check` 可檢查字典完整性與 `index.html` 中文預設值是否同步

### 本機開發

本專案使用 ES modules，**不能直接用瀏覽器開啟 `index.html`**——`file://` 下瀏覽器會因 CORS 規則拒絕載入模組，整個 JS 都不會執行。請用任一 HTTP 伺服器：

```bash
python -m http.server 8000
```

然後開 <http://localhost:8000/>。

## 免責聲明

本工具為個人訓練經驗分享，非醫療或專業教練建議。訓練請量力而為，如有身體不適請諮詢醫師。
