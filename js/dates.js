// 由比賽日期回推整份課表每一天的日期。
//
// 課表的最後一格（第18週星期日）就是比賽日，往前一天一天倒推。
// 全部用「當地時間的正午」建構日期物件：夏令時間切換那天的凌晨可能不存在或重複，
// 從正午加減整天數則永遠落在正確的日子上。

// "2026-11-29"（date input 的值）→ 當地時間該日正午。空值回 null。
export function parseRaceDate(value) {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0);
  return Number.isNaN(d.getTime()) ? null : d;
}

// 回傳與 plan.schedule 同形狀的日期陣列（18 週 × 7 天）；未指定比賽日則回 null。
export function scheduleDates(plan, raceDate) {
  if (!raceDate) return null;
  const days = plan.schedule.flat().length;      // 18×7 = 126
  const last = days - 1;
  return plan.schedule.map((week, wi) =>
    week.map((_, di) => {
      const i = wi * 7 + di;
      const d = new Date(raceDate);
      d.setDate(d.getDate() - (last - i));
      return d;
    })
  );
}

// 格內顯示用的短日期："11/29"
export function shortDate(d) {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// 比賽日不是星期日時要提醒使用者：課表的星期欄位會與實際日期對不上。
export function isSunday(d) {
  return d.getDay() === 0;
}
