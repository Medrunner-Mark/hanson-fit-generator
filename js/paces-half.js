// 半馬配速資料：逐字轉錄自「漢森進階半馬課表模板_互動版.xlsx」的「配速表」工作表（單位：秒/公里）。
// 由 build 腳本從 xlsx 定稿自動產出，數字與試算表一致。
// 欄位：recovery=恢復跑, easyA=輕鬆有氧A(慢), easyB=輕鬆有氧B(快),
//       long=長跑, hmp=節奏跑(半馬配速), tenK=強化跑(10K配速), fiveK=5公里配速

export const HALF_PACE_TABLE = [
  { goal: "2:30", recovery: 518, easyA: 500, easyB: 481, long: 468, hmp: 426, tenK: 407, fiveK: 391 },
  { goal: "2:25", recovery: 504, easyA: 485, easyB: 466, long: 453, hmp: 412, tenK: 394, fiveK: 378 },
  { goal: "2:20", recovery: 490, easyA: 471, easyB: 452, long: 439, hmp: 398, tenK: 380, fiveK: 365 },
  { goal: "2:15", recovery: 474, easyA: 456, easyB: 437, long: 424, hmp: 383, tenK: 367, fiveK: 352 },
  { goal: "2:10", recovery: 460, easyA: 441, easyB: 422, long: 409, hmp: 369, tenK: 353, fiveK: 339 },
  { goal: "2:05", recovery: 444, easyA: 426, easyB: 407, long: 394, hmp: 355, tenK: 339, fiveK: 326 },
  { goal: "2:00", recovery: 430, easyA: 411, easyB: 392, long: 379, hmp: 341, tenK: 326, fiveK: 313 },
  { goal: "1:55", recovery: 414, easyA: 396, easyB: 377, long: 364, hmp: 327, tenK: 312, fiveK: 299 },
  { goal: "1:50", recovery: 400, easyA: 382, easyB: 363, long: 350, hmp: 312, tenK: 299, fiveK: 286 },
  { goal: "1:45", recovery: 386, easyA: 367, easyB: 348, long: 335, hmp: 298, tenK: 285, fiveK: 273 },
  { goal: "1:40", recovery: 370, easyA: 352, easyB: 333, long: 320, hmp: 284, tenK: 271, fiveK: 260 },
  { goal: "1:35", recovery: 356, easyA: 337, easyB: 318, long: 305, hmp: 270, tenK: 258, fiveK: 247 },
  { goal: "1:30", recovery: 340, easyA: 322, easyB: 303, long: 290, hmp: 255, tenK: 244, fiveK: 234 },
  { goal: "1:25", recovery: 326, easyA: 308, easyB: 289, long: 276, hmp: 241, tenK: 231, fiveK: 221 },
  { goal: "1:20", recovery: 312, easyA: 293, easyB: 274, long: 261, hmp: 227, tenK: 217, fiveK: 208 },
  { goal: "1:15", recovery: 296, easyA: 278, easyB: 259, long: 246, hmp: 213, tenK: 203, fiveK: 195 },
  { goal: "1:10", recovery: 282, easyA: 263, easyB: 244, long: 231, hmp: 199, tenK: 190, fiveK: 182 },
];
