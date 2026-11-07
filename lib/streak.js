// Dipakai oleh aplikasi (app.js) dan server (api/pengingat.js) supaya aturan streak selalu sama.
export const addDays = (ymd, n) => { const d = new Date(ymd + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

// Jumlah hari berturut-turut yang ditandai, berakhir hari ini (bila sudah) atau kemarin.
export function currentStreak(dates, today) {
  let n = 0, d = dates.has(today) ? today : addDays(today, -1);
  while (dates.has(d)) { n++; d = addDays(d, -1); }
  return n;
}
