import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { nightOf, tonight, streakState, mergeData, markRead, uid, addDays, LONG, wipeProgress, RESET } from './antrean.js';

const A = JSON.parse(fs.readFileSync(new URL('../data/antrean.json', import.meta.url)));
const PLAN = JSON.parse(fs.readFileSync(new URL('../data/rencana.json', import.meta.url)));
const Q = A.q;

// Membuat riwayat: daftar [tanggal, jumlahBacaan] mulai dari tanggal awal, berurutan per hari.
const hist = (start, counts) => Object.fromEntries(counts.map((n, i) => [addDays(start, i), Array.from({ length: n }, (_, k) => `x${i}-${k}`)]).filter(([, v]) => v.length));

test('antrean: urutan mengikuti rotasi rencana dan mencakup seluruh Alkitab', () => {
  const chapters = new Set(Q.map(u => u[0] + ':' + u[1]));
  assert.equal(chapters.size, 1189);
  assert.deepEqual(Q[0].slice(0, 2), PLAN[0].r[0]);            // Matius 1 dulu
  assert.deepEqual(Q.find(u => u[0] === 5).slice(0, 2), [5, 1]); // lalu Yosua 1 di blok Sejarah
  // tidak ada ayat yang hilang atau dobel di satu pasal
  const yos5 = Q.filter(u => u[0] === 5 && u[1] === 5);
  assert.deepEqual(yos5.map(u => [u[2], u[3]]), [[1, 8], [9, 15]]);
});

test('malam ini: perikop pertama yang belum dibaca, dengan perikop kedua opsional', () => {
  const t = tonight(Q, {}, '2026-11-07');
  assert.equal(uid(t.first), uid(Q[0])); assert.equal(uid(t.second), uid(Q[1]));
  // bacaan yang belum dibaca tetap di depan, tidak dilompati
  const done = { [uid(Q[0])]: '2026-11-05', [uid(Q[2])]: '2026-11-05' };
  const t2 = tonight(Q, done, '2026-11-07');
  assert.equal(uid(t2.first), uid(Q[1])); assert.equal(uid(t2.second), uid(Q[3]));
  // setelah dicentang malam ini, pasangan malam ini tidak bergeser
  const t3 = tonight(Q, { ...done, [uid(Q[1])]: '2026-11-07' }, '2026-11-07');
  assert.equal(uid(t3.first), uid(Q[1]));
  // besok lanjut dari yang berikutnya
  const t4 = tonight(Q, { ...done, [uid(Q[1])]: '2026-11-07' }, '2026-11-08');
  assert.equal(uid(t4.first), uid(Q[3]));
});

test('malam ini: perikop panjang tidak diberi bacaan kedua', () => {
  const i = Q.findIndex(u => u[4] > LONG);
  const done = Object.fromEntries(Q.slice(0, i).map(u => [uid(u), '2026-11-01']));
  const t = tonight(Q, done, '2026-11-07');
  assert.equal(uid(t.first), uid(Q[i])); assert.equal(t.second, null);
});

test('putaran: setelah semua perikop selesai, mulai lagi dari awal', () => {
  let d = { round: 1, done: Object.fromEntries(Q.slice(0, -1).map(u => [uid(u), '2026-11-01'])), nights: {} };
  d = markRead(d, Q, uid(Q[Q.length - 1]), '2030-01-01');
  assert.equal(d.round, 2); assert.deepEqual(d.done, {});
  assert.equal(d.history[0].round, 1);
  assert.equal(uid(tonight(Q, d.done, '2030-01-02').first), uid(Q[0]));
});

test('malam: lewat tengah malam masih dihitung malam sebelumnya (WIB)', () => {
  const tz = 'Asia/Jakarta'; // UTC+7
  assert.equal(nightOf(new Date('2026-11-07T16:59:00Z'), tz), '2026-11-07'); // 23.59 WIB
  assert.equal(nightOf(new Date('2026-11-07T17:30:00Z'), tz), '2026-11-07'); // 00.30 WIB tgl 8
  assert.equal(nightOf(new Date('2026-11-07T20:59:00Z'), tz), '2026-11-07'); // 03.59 WIB
  assert.equal(nightOf(new Date('2026-11-07T21:00:00Z'), tz), '2026-11-08'); // 04.00 WIB
  assert.equal(nightOf(new Date('2026-12-31T18:00:00Z'), tz), '2026-12-31'); // 01.00 WIB 1 Jan
  assert.equal(nightOf(new Date('2027-02-28T19:00:00Z'), tz), '2027-02-28'); // 02.00 WIB 1 Mar
});

test('streak: malam berturut-turut, dan malam ini belum dibaca tidak memutus', () => {
  const n = hist('2026-11-01', [1, 1, 1]);
  assert.equal(streakState(n, '2026-11-03').streak, 3);
  const s = streakState(n, '2026-11-04');
  assert.equal(s.streak, 3); assert.equal(s.dim, false); assert.equal(s.litTonight, false);
});

test('pemulihan: 1, 2, dan 3 malam bolong lalu lunas, streak tersambung', () => {
  for (const gap of [1, 2, 3]) {
    const counts = [1, 1, 1, 1, 1, ...Array(gap).fill(0), ...Array(gap).fill(2)];
    const n = hist('2026-11-01', counts); const end = addDays('2026-11-01', counts.length - 1);
    const s = streakState(n, end);
    assert.equal(s.dim, false, `gap ${gap}`); assert.equal(s.streak, counts.length, `gap ${gap}`);
    assert.equal(s.mended.length, gap);
  }
});

test('pemulihan: saat belum lunas, lentera redup dan streak tertahan', () => {
  const n = hist('2026-11-01', [1, 1, 1, 1, 1, 0, 0, 2]);
  const s = streakState(n, '2026-11-08');
  assert.equal(s.dim, true); assert.equal(s.owed, 1); assert.equal(s.streak, 5);
  assert.equal(s.deadline, '2026-11-13');
  // contoh di dokumen: Sen 1, Sel-Rab bolong, Kam 2, Jum 2 -> 9 (dengan 5 malam sebelumnya)
  const n2 = hist('2026-11-01', [1, 1, 1, 1, 1, 0, 0, 2, 2]);
  assert.equal(streakState(n2, '2026-11-09').streak, 9);
});

test('pemulihan: satu malam membaca banyak hanya membayar 1', () => {
  const n = hist('2026-11-01', [1, 1, 0, 0, 5]);
  const s = streakState(n, '2026-11-05');
  assert.equal(s.owed, 1); assert.equal(s.dim, true);
});

test('pemulihan: membaca 1 bacaan saja tetap menyalakan malam itu, hutang menunggu', () => {
  const n = hist('2026-11-01', [1, 1, 0, 1, 1, 2]);
  const s = streakState(n, '2026-11-06');
  assert.equal(s.dim, false); assert.equal(s.streak, 6);
});

test('batas: 4 malam bolong berturut-turut, streak mulai lagi', () => {
  const n = hist('2026-11-01', [1, 1, 1, 0, 0, 0, 0, 1]);
  const s = streakState(n, '2026-11-08');
  assert.equal(s.dim, false); assert.equal(s.streak, 1); assert.equal(s.best, 3); assert.ok(s.restarted);
});

test('batas: bolong lagi saat pemulihan berjalan sampai total 4, streak mulai lagi', () => {
  const n = hist('2026-11-01', [1, 1, 0, 0, 1, 0, 0, 1]);
  const s = streakState(n, '2026-11-08');
  assert.equal(s.dim, false); assert.equal(s.streak, 1);
});

test('batas: lunas pada malam ke-7 boleh, malam ke-8 tidak', () => {
  // malam pertama bolong 3 Nov -> batas 10 Nov
  const base = [1, 1, 0, 1, 1, 1, 1, 1, 1];          // 1..9 Nov, belum ada bacaan kedua
  const ok = hist('2026-11-01', [...base, 2]);        // 10 Nov: lunas
  assert.equal(streakState(ok, '2026-11-10').dim, false);
  assert.equal(streakState(ok, '2026-11-10').streak, 10);
  const late = hist('2026-11-01', [...base, 1, 2]);   // 11 Nov: sudah lewat
  const s = streakState(late, '2026-11-11');
  assert.equal(s.dim, false); assert.equal(s.streak, 8);  // mulai lagi dari malam setelah bolong (4-11 Nov)
  assert.equal(s.best, 8);
});

test('belum pernah membaca, dan bolong tanpa streak tidak membuat hutang', () => {
  assert.equal(streakState({}, '2026-11-07').streak, 0);
  const n = hist('2026-11-01', [1, 0, 0, 0, 0, 0]);
  const s = streakState(n, '2026-11-06'); assert.equal(s.streak, 0); assert.equal(s.dim, false);
});

test('gabung: bacaan dari perangkat dan cloud tidak ada yang hilang', () => {
  const a = { round: 1, done: { a: '2026-11-01' }, nights: { '2026-11-01': ['a'] }, read: {} };
  const b = { round: 1, done: { b: '2026-11-02' }, nights: { '2026-11-01': ['z'], '2026-11-02': ['b'] }, read: {}, nama: 'Anya' };
  const m = mergeData(a, b);
  assert.deepEqual(Object.keys(m.done).sort(), ['a', 'b']);
  assert.deepEqual(m.nights['2026-11-01'].sort(), ['a', 'z']);
  assert.equal(m.nama, 'Anya');
  const c = mergeData({ round: 2, done: {}, nights: {} }, b); assert.equal(c.round, 2); assert.deepEqual(c.done, {});
});

test('reset: progres, streak, dan favorit kosong; pengaturan tetap; tidak terulang', () => {
  const old = { nama: 'Anya', mode: 'ringkas', notif: true, fav: { '5:5:14': 'x' }, read: { '2026-11-01': { on: '2026-11-01' } }, done: { a: '2026-11-01' }, nights: { '2026-11-01': ['a'] }, round: 2 };
  const d = wipeProgress(old);
  assert.equal(d.nama, 'Anya'); assert.equal(d.mode, 'ringkas'); assert.equal(d.notif, true);
  assert.deepEqual(d.fav, {}); assert.deepEqual(d.done, {}); assert.deepEqual(d.nights, {}); assert.equal(d.round, 1); assert.equal(d.resetGen, RESET);
  assert.deepEqual(d.read, {}); // data lama per tanggal tidak ikut dibawa
  // setelah reset, bacaan baru tidak terhapus lagi
  const later = { ...d, done: { b: '2026-11-07' }, nights: { '2026-11-07': ['b'] } };
  assert.deepEqual(wipeProgress(later), later);
  assert.equal(streakState(d.nights, '2026-11-07').streak, 0);
  assert.equal(uid(tonight(Q, d.done, '2026-11-07').first), uid(Q[0]));
});
