// Membuat data/antrean.json: urutan bacaan per perikop.
// Urutan kitab mengikuti rotasi di data/rencana.json; tiap pasal dipecah per judul perikop AYT.
// Perikop yang sangat pendek (< 150 kata) digabung dengan perikop berikutnya di pasal yang sama.
// Jalankan: node scripts/buat-antrean.mjs
import fs from 'fs';
const B = JSON.parse(fs.readFileSync(new URL('../data/alkitab.json', import.meta.url)));
const P = JSON.parse(fs.readFileSync(new URL('../data/rencana.json', import.meta.url)));
const MIN = 150;
const words = vs => vs.reduce((n, v) => n + v[1].split(/\s+/).filter(Boolean).length, 0);

function perikop(b, c){
  const vs = B[b].c[c - 1];
  let starts = vs.map((v, i) => (v[2] ? i : -1)).filter(i => i > 0);
  starts = [0, ...starts];
  const segs = starts.map((s, k) => { const e = k + 1 < starts.length ? starts[k + 1] : vs.length; return [s, e, words(vs.slice(s, e))]; });
  const m = [];
  for (const s of segs) { const last = m[m.length - 1]; if (last && last[2] < MIN) { last[1] = s[1]; last[2] += s[2]; } else m.push([...s]); }
  if (m.length > 1 && m[m.length - 1][2] < MIN) { const z = m.pop(); m[m.length - 1][1] = z[1]; m[m.length - 1][2] += z[2]; }
  return m.map(([s, e, w]) => [b, c, vs[s][0], vs[e - 1][0], w]);
}

const genres = [...new Set(P.map(p => p.g))];
const q = [];
for (const p of P) for (const [b, c] of p.r) for (const u of perikop(b, c)) q.push([...u, genres.indexOf(p.g)]);
fs.writeFileSync(new URL('../data/antrean.json', import.meta.url), JSON.stringify({ g: genres, n: B.map(x => x.n), q }));
console.log(`${q.length} perikop dari ${new Set(q.map(u => u[0] + ':' + u[1])).size} pasal`);
