# 漢森課表產生器

選擇距離、程度與目標完賽時間，一鍵產生整套《漢森馬拉松訓練法》18 週訓練課表——可下載成 Garmin `.fit` 檔（USB 匯入手錶）、Garmin Connect `.json` 檔（網頁版匯入）、課表圖 PNG、A4 PDF 與 Excel 互動模板。

由 [Med日跑者](https://www.youtube.com/@Med-runner-Mark) 製作，搭配頻道的漢森課表教學影片使用。

線上使用：<https://medrunner-mark.github.io/hanson-fit-generator/>

## 四種課表

| | 進階 | 初階 |
|---|---|---|
| **全程馬拉松** | 第 1 週就有速度跑，起始約 60K/週 | 前 5-6 週為基礎期，之後才加入速度跑與節奏跑 |
| **半程馬拉松** | 同上結構，節奏跑改半馬配速 | 同上 |

目標時間：全馬 5:00 ~ 2:10、半馬 2:30 ~ 1:10，每 5 分鐘一檔。配速表數字逐字轉錄自官方配速表，不做內插。

## 五種下載

| 格式 | 用途 |
|---|---|
| `.fit`（單一或 ZIP 全套） | USB 接線匯入 Garmin 手錶 |
| `.json`（單一或 ZIP 全套） | 透過 [Share your Garmin Connect workout](https://chromewebstore.google.com/detail/share-your-garmin-connect/kdpolhnlnkengkmfncjdbfdehglepmff) 外掛匯入 Connect 網頁版，不用接線 |
| 課表圖 PNG | 1080×1920 直式圖，適合發 IG |
| PDF | A4 兩頁，每天列出完整課表明細與實際配速，可列印 |
| Excel 互動模板 | 內含詳細配速說明的 `.xlsx` |

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

## 免責聲明

本工具為個人訓練經驗分享，非醫療或專業教練建議。訓練請量力而為，如有身體不適請諮詢醫師。
