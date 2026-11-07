// Logika antrean bacaan dan streak. Dipakai aplikasi (app.js) dan server (api/pengingat.js)
// supaya aturannya selalu sama. Semua fungsi murni: tidak membaca jam atau penyimpanan sendiri.

export const NIGHT_CUT = 4;       // membaca sebelum pukul 04.00 dihitung untuk malam sebelumnya
export const LONG = 1200;         // perikop lebih panjang dari ini: tidak ada bacaan kedua malam itu
export const DEBT_DAYS = 7;       // pemulihan harus lunas paling lambat 7 malam sejak malam pertama yang bolong
export const DEBT_MAX = 3;        // paling banyak 3 malam bolong per pemulihan

export const addDays = (ymd, n) => { const d = new Date(ymd + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const dayDiff = (a, b) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 864e5);

// Tanggal "malam" untuk suatu waktu: waktu setempat dikurangi 4 jam. timeZone kosong = zona perangkat.
export function nightOf(now = new Date(), timeZone){
  const t = new Date(now.getTime() - NIGHT_CUT * 3600e3);
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(t);
}

// Satu perikop di antrean: [kitab, pasal, ayatAwal, ayatAkhir, jumlahKata, jenis]
export const uid = u => `${u[0]}-${u[1]}-${u[2]}`;
export const minutes = w => Math.max(1, Math.round(w / 180));

// Bacaan malam ini: perikop pertama yang belum dibaca, lalu perikop berikutnya (opsional).
// Yang ditandai malam ini tetap tampil sebagai pasangan malam ini, supaya tidak bergeser setelah dicentang.
export function tonight(Q, done, night){
  const open = u => { const d = done[uid(u)]; return !d || d === night; };
  const i = Q.findIndex(open);
  if (i < 0) return { first: null, second: null };
  let second = null;
  if (Q[i][4] <= LONG) for (let k = i + 1; k < Q.length; k++) if (open(Q[k])) { second = Q[k]; break; }
  return { first: Q[i], second };
}

// Streak dengan pemulihan. nights = { 'YYYY-MM-DD': [id perikop, ...] }.
// - Malam menyala bila minimal 1 perikop ditandai.
// - Malam bolong (selama streak > 0) membuka pemulihan: 1 bacaan tambahan per malam bolong.
// - Bacaan kedua pada suatu malam membayar 1 (maksimal 1 per malam).
// - Lunas: malam bolong dihitung tersambung. Lewat 7 malam atau lebih dari 3 malam bolong: streak mulai lagi.
export function streakState(nights, today){
  const lit = d => (nights[d] || []).length;
  const dates = Object.keys(nights).filter(d => d <= today && lit(d)).sort();
  let streak = 0, best = 0, pend = null, restarted = null; const mended = [];
  if (dates.length) for (let d = dates[0]; d <= today; d = addDays(d, 1)) {
    if (pend && d > pend.deadline) { streak = pend.trail; pend = null; restarted = d; }
    const n = lit(d);
    if (n > 0) {
      if (pend) {
        pend.lit++; pend.trail++; pend.owed -= Math.min(1, n - 1);
        if (pend.owed <= 0) { streak = pend.base + pend.missed.length + pend.lit; mended.push(...pend.missed); pend = null; }
      } else streak++;
    } else if (d !== today) {
      if (pend) {
        pend.missed.push(d); pend.owed++; pend.trail = 0;
        if (pend.missed.length > DEBT_MAX) { streak = 0; pend = null; restarted = addDays(d, 1); }
      } else if (streak > 0) pend = { base: streak, missed: [d], owed: 1, lit: 0, trail: 0, deadline: addDays(d, DEBT_DAYS) };
    }
    best = Math.max(best, pend ? Math.max(pend.base, pend.trail) : streak);
  }
  return {
    // Selama pemulihan, yang tampil adalah yang lebih besar: streak lama yang tertahan, atau malam berturut-turut sejak bolong.
    streak: pend ? Math.max(pend.base, pend.trail) : streak, best, dim: !!pend, owed: pend ? pend.owed : 0,
    deadline: pend ? pend.deadline : null, missed: pend ? pend.missed.slice() : [], mended, restarted,
    litTonight: lit(today) > 0, lit: dates.length
  };
}

const union = (a = [], b = []) => [...new Set([...a, ...b])];

// Gabungkan data perangkat (a) dengan data cloud (b) tanpa kehilangan bacaan dari salah satunya.
export function mergeData(a = {}, b = {}){
  const out = Object.assign({}, b, a);
  const nights = {}; for (const k of new Set([...Object.keys(a.nights || {}), ...Object.keys(b.nights || {})])) nights[k] = union((a.nights || {})[k], (b.nights || {})[k]);
  out.nights = nights;
  const ra = a.round || 1, rb = b.round || 1; out.round = Math.max(ra, rb);
  out.done = ra === rb ? Object.assign({}, b.done, a.done) : (ra > rb ? a.done : b.done) || {};
  out.history = (ra >= rb ? a.history : b.history) || [];
  out.resetGen = Math.max(a.resetGen || 0, b.resetGen || 0);
  // Favorit digabung per ayat. Hapusan dicatat di favDel dengan waktunya; yang paling baru menang.
  const later = (x = {}, y = {}) => { const o = { ...y }; for (const k in x) if (!o[k] || x[k] > o[k]) o[k] = x[k]; return o; };
  const fav = later(a.fav, b.fav), del = later(a.favDel, b.favDel);
  out.fav = Object.fromEntries(Object.entries(fav).filter(([k, t]) => !del[k] || t > del[k]));
  out.favDel = del;
  return out;
}

// Tandai satu perikop. Bila seluruh antrean selesai, mulai putaran berikutnya.
export function markRead(data, Q, id, night){
  const d = { ...data, done: { ...data.done, [id]: night }, nights: { ...data.nights, [night]: union(data.nights[night], [id]) } };
  if (Q.every(u => d.done[uid(u)])) {
    d.history = [...(d.history || []), { round: d.round || 1, ended: night }];
    d.round = (d.round || 1) + 1; d.done = {};
  }
  return d;
}

// Reset sekali jalan (permintaan pengguna, 7 Nov 2026): progres, streak, putaran, dan favorit dikosongkan.
// Nama, mode baca, tema, dan pengaturan notifikasi tetap. Naikkan RESET hanya bila pengguna meminta reset lagi.
export const RESET = 1;
export function wipeProgress(d = {}){
  if ((d.resetGen || 0) >= RESET) return d;
  const { read, done, nights, round, history, fav, favDel, ...keep } = d;
  return { ...keep, v: 2, resetGen: RESET, round: 1, done: {}, nights: {}, history: [], fav: {}, favDel: {}, read: {} };
}
