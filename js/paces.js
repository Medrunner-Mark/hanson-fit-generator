// 配速資料：逐字轉錄自「漢森課表模板_互動版.xlsx」的「配速表」工作表（單位：秒/公里）。
// 這張表是人工校訂過的官方數字，不可用公式重新推導。
// 欄位：recovery=恢復跑, easyA=輕鬆有氧A(慢), easyB=輕鬆有氧B(快),
//       long=長跑, tempo=節奏跑(=MP), strength=強化跑, tenK=10公里配速, fiveK=5公里配速

export const PACE_TABLE = [
  { goal: "5:00", recovery: 536, easyA: 505, easyB: 473, long: 457, tempo: 427, strength: 421, tenK: 391, fiveK: 375 },
  { goal: "4:45", recovery: 511, easyA: 482, easyB: 450, long: 436, tempo: 405, strength: 399, tenK: 372, fiveK: 357 },
  { goal: "4:30", recovery: 486, easyA: 457, easyB: 428, long: 413, tempo: 384, strength: 378, tenK: 352, fiveK: 338 },
  { goal: "4:15", recovery: 461, easyA: 434, easyB: 405, long: 391, tempo: 363, strength: 357, tenK: 332, fiveK: 319 },
  { goal: "4:00", recovery: 436, easyA: 410, easyB: 382, long: 368, tempo: 341, strength: 335, tenK: 313, fiveK: 300 },
  { goal: "3:50", recovery: 419, easyA: 394, easyB: 367, long: 354, tempo: 327, strength: 321, tenK: 300, fiveK: 288 },
  { goal: "3:45", recovery: 411, easyA: 386, easyB: 360, long: 347, tempo: 320, strength: 314, tenK: 293, fiveK: 281 },
  { goal: "3:40", recovery: 403, easyA: 378, easyB: 352, long: 339, tempo: 313, strength: 306, tenK: 287, fiveK: 275 },
  { goal: "3:35", recovery: 394, easyA: 370, easyB: 344, long: 331, tempo: 306, strength: 300, tenK: 280, fiveK: 269 },
  { goal: "3:30", recovery: 385, easyA: 361, easyB: 337, long: 324, tempo: 299, strength: 293, tenK: 274, fiveK: 263 },
  { goal: "3:25", recovery: 377, easyA: 353, easyB: 329, long: 316, tempo: 291, strength: 285, tenK: 267, fiveK: 257 },
  { goal: "3:20", recovery: 368, easyA: 345, easyB: 322, long: 309, tempo: 285, strength: 278, tenK: 261, fiveK: 250 },
  { goal: "3:15", recovery: 359, easyA: 337, easyB: 314, long: 301, tempo: 277, strength: 271, tenK: 254, fiveK: 244 },
  { goal: "3:10", recovery: 351, easyA: 329, easyB: 306, long: 295, tempo: 270, strength: 264, tenK: 248, fiveK: 238 },
  { goal: "3:05", recovery: 342, easyA: 321, easyB: 299, long: 287, tempo: 263, strength: 257, tenK: 241, fiveK: 231 },
  { goal: "3:00", recovery: 334, easyA: 313, easyB: 291, long: 279, tempo: 256, strength: 250, tenK: 235, fiveK: 225 },
  { goal: "2:55", recovery: 325, easyA: 304, easyB: 283, long: 272, tempo: 249, strength: 242, tenK: 228, fiveK: 219 },
  { goal: "2:50", recovery: 316, easyA: 296, easyB: 275, long: 264, tempo: 242, strength: 235, tenK: 222, fiveK: 213 },
  { goal: "2:45", recovery: 308, easyA: 288, easyB: 268, long: 257, tempo: 235, strength: 229, tenK: 215, fiveK: 206 },
  { goal: "2:40", recovery: 298, easyA: 280, easyB: 260, long: 249, tempo: 227, strength: 221, tenK: 209, fiveK: 200 },
  { goal: "2:35", recovery: 290, easyA: 272, easyB: 252, long: 242, tempo: 221, strength: 214, tenK: 202, fiveK: 194 },
  { goal: "2:30", recovery: 281, easyA: 263, easyB: 245, long: 234, tempo: 213, strength: 207, tenK: 196, fiveK: 188 },
  { goal: "2:25", recovery: 272, easyA: 255, easyB: 237, long: 227, tempo: 206, strength: 200, tenK: 189, fiveK: 181 },
  { goal: "2:20", recovery: 263, easyA: 246, easyB: 229, long: 219, tempo: 199, strength: 193, tenK: 183, fiveK: 175 },
  { goal: "2:15", recovery: 254, easyA: 238, easyB: 221, long: 211, tempo: 192, strength: 186, tenK: 176, fiveK: 169 },
  { goal: "2:10", recovery: 245, easyA: 229, easyB: 213, long: 204, tempo: 185, strength: 178, tenK: 170, fiveK: 163 },
];

// "2:55" -> "255"（檔名用）
export function goalCode(goal) {
  return goal.replace(":", "");
}

// 秒/公里 -> "4:09"
export function fmtPace(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// 秒/公里 -> 公尺/秒（FIT custom_target_speed 用，scale 1000 的整數）
export function paceToScaledMps(secPerKm) {
  return Math.round((1000 / secPerKm) * 1000);
}
