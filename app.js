import { nightOf, tonight, streakState, migrate, mergeData, markRead, uid, minutes, LONG } from '/lib/antrean.js';

// Supabase dimuat dari CDN. Kalau CDN atau layanan akun tidak terjangkau (offline, diblokir, sangat lambat),
// aplikasi tetap jalan dengan data di perangkat, bukan layar kosong.
const SB_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
function offlineClient(){
  const err = { message: 'network: layanan akun tidak terjangkau' };
  const res = Promise.resolve({ data: null, error: err });
  const q = { select: () => q, eq: () => q, delete: () => q, maybeSingle: () => res, upsert: () => res, then: (a, b) => res.then(a, b) };
  const fail = async () => ({ data: {}, error: err });
  return { from: () => q, auth: { getSession: async () => ({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe(){} } } }),
    signInWithPassword: fail, signUp: fail, resetPasswordForEmail: fail, updateUser: fail, signOut: async () => ({}) } };
}
let sb, cloudDown = false;
try {
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) throw new Error('config');
  const { createClient } = await Promise.race([import(SB_URL), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 9000))]);
  sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
} catch(e) { sb = offlineClient(); cloudDown = true; }

const ICONS = {moon:'malam', sun:'terang', dark_mode:'gelap', book:'pasal', check:'selesai', star:'favorit', starfill:'favorit', link:'kaitan', chart:'progres', bell:'notif', notifications:'notif', flame:'lentera2', heart:'doa', scroll:'kisah', bulb:'penerapan', lock:'kunci', clock:'linimasa', shield:'sumber', skip:'lanjut', chev:'lanjut', pen:'jurnal', map:'kaitan', sparkle:'bintang', lang:'kata', user:'akun', calendar:'minggu', x:'tutup', close:'keluar', leaf:'ringkas', layers:'mendalam', cloud:'sinkron', search:'cari', download:'ekspor', copy:'salin', compass:'pengantar', rewind:'sebelumnya', dot:'titik', minus:'kurang', plus:'tambah', books:'arsip'};
const ic = n => `<svg class="ms" aria-hidden="true" focusable="false"><use href="#i-${ICONS[n] || n}"/></svg>`;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const P = arr => (arr||[]).map(t=>`<p>${t}</p>`).join('');
// Maskot "Lentera": burung hantu flat dua warna (tanpa gradien), warna lewat token CSS.
function owl(mood = 'sleepy', size = 96){
  const eyes = mood === 'happy'
    ? `<path class="ow-ink-s" d="M37 56 Q46 47 55 56M65 56 Q74 47 83 56"/>`
    : mood === 'awake'
    ? `<circle class="ow-ink" cx="46" cy="55" r="7"/><circle class="ow-ink" cx="74" cy="55" r="7"/><circle class="ow-hi" cx="48.5" cy="52.5" r="2.4"/><circle class="ow-hi" cx="76.5" cy="52.5" r="2.4"/>`
    : mood === 'reading'
    ? `<circle class="ow-ink" cx="46" cy="58" r="5.5"/><circle class="ow-ink" cx="74" cy="58" r="5.5"/><circle class="ow-specs" cx="46" cy="56" r="12"/><circle class="ow-specs" cx="74" cy="56" r="12"/><path class="ow-specs" d="M58 55 q2-2 4 0"/>`
    : mood === 'worried'
    ? `<circle class="ow-ink" cx="46" cy="57" r="5"/><circle class="ow-ink" cx="74" cy="57" r="5"/><circle class="ow-hi" cx="47.6" cy="55.4" r="1.8"/><circle class="ow-hi" cx="75.6" cy="55.4" r="1.8"/><path class="ow-ink-s" d="M38 46 L52 41M82 46 L68 41"/>`
    : mood === 'offline'
    ? `<path class="ow-ink-s" d="M38 56 h15"/><circle class="ow-ink" cx="74" cy="56" r="6"/><circle class="ow-hi" cx="76" cy="54" r="2"/>`
    : `<path class="ow-ink-s ow-shut" d="M37 54 Q46 61 55 54M65 54 Q74 61 83 54"/><g class="ow-open"><circle class="ow-ink" cx="46" cy="56" r="6"/><circle class="ow-ink" cx="74" cy="56" r="6"/><circle class="ow-hi" cx="48" cy="54" r="2"/><circle class="ow-hi" cx="76" cy="54" r="2"/></g>`;
  const extra = mood === 'happy'
    ? `<path class="ow-lamp" d="M104 18l2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2z"/><path class="ow-plum" d="M13 32l1.5 3.4 3.4 1.5-3.4 1.5L13 41.8l-1.5-3.4-3.4-1.5 3.4-1.5z"/>`
    : mood === 'asleep' ? `<text class="ow-z" x="94" y="24">z</text><text class="ow-z ow-z2" x="105" y="12">z</text>`
    : mood === 'reading' ? `<path class="ow-book" d="M36 80 q12-6 24 0 q12-6 24 0 v20 q-12-6-24 0 q-12-6-24 0z"/><path class="ow-specs" d="M60 80 v20"/>`
    : mood === 'worried' ? `<path class="ow-drop" d="M96 34c3 4 5 7 5 9.5 0 2.8-2.2 5-5 5s-5-2.2-5-5c0-2.5 2-5.5 5-9.5z"/>`
    : mood === 'offline' ? `<path class="ow-cloud" d="M88 30h18c3.6 0 6.4-2.8 6.4-6.2 0-3.3-2.6-6-5.9-6.2-.8-4.5-4.6-7.6-9.1-7.6-4 0-7.4 2.5-8.6 6.2-3.3.6-5.7 3.3-5.7 6.7 0 3.9 2.9 7.1 4.9 7.1z"/><path class="ow-slash" d="M86 8 L110 32"/>` : '';
  return `<svg class="owl owl-${mood}" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
  <path class="ow-body-d" d="M28 34 L33 12 L47 28 Z M92 34 L87 12 L73 28 Z"/>
  <path class="ow-body" d="M60 20 C89 20 98 44 98 68 C98 94 82 110 60 110 C38 110 22 94 22 68 C22 44 31 20 60 20Z"/>
  <path class="ow-body-d" d="M24 66 C14 78 18 96 32 102 C30 88 32 76 36 68Z M96 66 C102 74 102 84 98 90 L90 76Z"/>
  <ellipse class="ow-belly" cx="60" cy="85" rx="24" ry="21"/>
  <path class="ow-belly-s" d="M48 79 q4 4 8 0 M60 79 q4 4 8 0 M52 89 q4 4 8 0 M64 89 q4 4 8 0"/>
  <circle class="ow-face" cx="46" cy="55" r="15"/><circle class="ow-face" cx="74" cy="55" r="15"/>
  ${eyes}
  <path class="ow-beak" d="M55 63 L65 63 L60 71 Z"/>
  <path class="ow-feet" d="M50 108 l-3 6 M54 108 v7 M58 108 l3 6 M62 108 l-3 6 M66 108 v7 M70 108 l3 6"/>
  ${mood === 'reading' ? '' : `<g class="ow-lantern"><path class="ow-metal" d="M100 58 v8 M93 66 h14 l-2 4 h-10z M93 86 h14 l-2 3 h-10z"/><rect class="ow-glass" x="94" y="70" width="12" height="16" rx="3"/>${mood === 'offline' ? '' : '<circle class="ow-flame" cx="100" cy="78" r="3"/>'}</g>
  <path class="ow-wing" d="M88 76 C92 70 98 70 100 74"/>`}
  ${extra}
</svg>`;
}

// Penanda hari berbentuk fase bulan: purnama = sudah, sabit = malam ini, bulan baru = belum, putus-putus = nanti.
function moonPhase(kind){
  const d = {
    mended:`<circle class="mp-full" cx="18" cy="18" r="13"/><path class="mp-stitch" d="M9 20.5l3-3 3 3 3-3 3 3 3-3 3 3"/>`,
    full:`<circle class="mp-full" cx="18" cy="18" r="13"/><circle class="mp-crater" cx="14" cy="14" r="2.4"/><circle class="mp-crater" cx="22" cy="21" r="1.8"/><path class="mp-check" d="M12.5 18.5l3.6 3.5 7.4-7.6"/>`,
    crescent:`<circle class="mp-ring" cx="18" cy="18" r="13"/><path class="mp-cres" d="M21 7.4c-5 .9-8.2 5.6-7.2 10.6.9 4.6 5.4 7.6 10 6.8-1.8 1.6-4.2 2.5-6.8 2.3-5.4-.3-9.5-5-9.2-10.4.3-5 4.4-8.9 9.4-9 1.3 0 2.6.2 3.8.7z"/>`,
    new:`<circle class="mp-new" cx="18" cy="18" r="13"/>`,
    future:`<circle class="mp-fut" cx="18" cy="18" r="13"/>`
  }[kind];
  return `<svg class="moonph" viewBox="0 0 36 36" aria-hidden="true" focusable="false">${d}</svg>`;
}
// Stiker pencapaian bertepi putih, sedikit miring.
const STK = 'M46 6c6 0 9 5 14 6s11-2 15 3 1 11 4 15 9 6 8 13-7 8-8 13 4 11-1 15-11 1-15 4-6 9-13 8-8-7-13-8-11 4-15-1-1-11-4-15-9-6-8-13 7-8 8-13-4-11 1-15 11-1 15-4 7-11 13-11z';
function sticker(icon, on, i = 0){
  return `<svg class="stk ${on ? 'on' : ''}" style="--rot:${[-6,4,-2,5,-4,3][i % 6]}deg" viewBox="0 0 92 92" aria-hidden="true" focusable="false">
    <path class="stk-edge" d="${STK}"/>${on ? `<path class="stk-face" d="${STK}" transform="translate(9 9) scale(.8)"/>` : ''}
    <svg x="26" y="26" width="40" height="40" viewBox="0 0 24 24" class="ms stk-ic"><use href="#i-${ICONS[icon] || icon}"/></svg></svg>`;
}

// Langit malam: bulan, awan, dan bintang statis (ilustrasi, bukan gradien).
// Fase bulan sungguhan untuk malam tertentu (0 = bulan baru, 0,5 = purnama).
function lunarPhase(iso){ const d = parseISO(iso); d.setHours(20); const days = (d.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000; return ((days / 29.530588853) % 1 + 1) % 1; }
function moonLitPath(p, cx = 282, cy = 66, r = 27){
  const k = Math.cos(2 * Math.PI * p), rx = Math.abs(k) * r, wax = p < .5, cres = k > 0;
  const inner = wax ? (cres ? 0 : 1) : (cres ? 1 : 0);
  return `M${cx} ${cy - r}A${r} ${r} 0 0 ${wax ? 1 : 0} ${cx} ${cy + r}A${rx.toFixed(2)} ${r} 0 0 ${inner} ${cx} ${cy - r}Z`;
}
function nightSky(cls = '', phase = null){
  const st = [[22,30,1.4],[70,16,1],[118,52,1.2],[170,22,1.6],[208,70,1],[40,96,1],[150,110,1.3],[236,30,1],[96,150,.9],[200,160,1.1],[330,150,1.2],[262,128,.9],[20,200,1]];
  return `<svg class="sky-art ${cls}" viewBox="0 0 360 460" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  ${st.map(([x,y,r]) => `<circle class="sk-star" cx="${x}" cy="${y}" r="${r}"/>`).join('')}
  <path class="sk-star" d="M250 92l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>
  ${(g => `<circle class="sk-glow" cx="282" cy="66" r="64" opacity="${(.35 * g).toFixed(2)}"/><circle class="sk-glow" cx="282" cy="66" r="46" opacity="${(.55 * g).toFixed(2)}"/>`)(phase === null ? 1 : .25 + .75 * (1 - Math.cos(2 * Math.PI * phase)) / 2)}
  ${phase === null ? `<circle class="sk-moon" cx="282" cy="66" r="27"/>
  <circle class="sk-crater" cx="273" cy="59" r="4.5"/><circle class="sk-crater" cx="289" cy="76" r="3.2"/><circle class="sk-crater" cx="292" cy="56" r="2.3"/>` : `
  <clipPath id="moonLit"><path class="sk-litp" d="${moonLitPath(phase)}"/></clipPath>
  <circle class="sk-dark" cx="282" cy="66" r="27"/>
  <g clip-path="url(#moonLit)"><circle class="sk-moon" cx="282" cy="66" r="27"/><circle class="sk-crater" cx="273" cy="59" r="4.5"/><circle class="sk-crater" cx="289" cy="76" r="3.2"/><circle class="sk-crater" cx="292" cy="56" r="2.3"/></g>`}
  <path class="sk-cloud2" d="M-20 410c0-14 12-24 25-21 5-12 19-18 31-12 10-10 28-7 34 6 13-1 24 8 24 20 0 4-1 7-2 7H-18c-1 0-2 0-2 0z"/>
  <path class="sk-cloud" d="M196 470c0-20 17-34 36-30 7-17 27-26 44-17 14-14 40-10 48 9 19-2 34 11 34 28 0 6-1 10-3 10H199c-2 0-3 0-3 0z"/>
  <path class="sk-cloud" d="M40 470c0-12 10-20 21-18 4-10 16-15 26-10 8-8 23-6 28 5 11-1 20 7 20 17 0 3-1 6-2 6H43c-2 0-3 0-3 0z"/>
</svg>`;
}

// Lentera kunang-kunang: satu kunang-kunang untuk setiap malam membaca; makin terang sampai 365 malam, lalu tetap penuh.
function lantern(count, size = 120, opts = {}){
  const lv = Math.min(1, count / 365) * (opts.dim ? .35 : 1); // redup saat menunggu pemulihan
  const n = Math.min(count, 28); let dots = '';
  for (let i = 0; i < n; i++){ const x = 36 + ((i * 37) % 48), y = 50 + ((i * 53) % 46); dots += `<circle class="ln-fly" cx="${x}" cy="${y}" r="${1.6 + (i % 3) * .5}" style="--d:${(i % 7) * .4}s"/>`; }
  return `<svg class="lantern ${opts.cls || ''}" width="${size}" height="${size * 1.25}" viewBox="0 0 120 150" style="--lv:${(.18 + .82 * lv).toFixed(3)}" aria-hidden="true" focusable="false">
  <defs><radialGradient id="lnGlow${opts.id || ''}"><stop offset="0" class="ln-g0"/><stop offset="1" class="ln-g1"/></radialGradient></defs>
  <circle class="ln-halo" cx="60" cy="82" r="58" fill="url(#lnGlow${opts.id || ''})"/>
  <path class="ln-metal" d="M60 6 a10 10 0 0 1 0 20 a10 10 0 0 1 0-20 M60 26 v8"/>
  <path class="ln-cap" d="M34 40 h52 l-8 -8 h-36 z"/>
  <rect class="ln-glass" x="30" y="40" width="60" height="70" rx="12"/>
  <g class="ln-flies">${dots}</g>
  <path class="ln-wick ${count ? 'on' : ''}" d="M60 96 c-6 -8 -2 -16 0 -22 c2 6 6 14 0 22z"/>
  <path class="ln-cap" d="M30 110 h60 l-6 10 h-48 z"/>
</svg>`;
}

const LINK_COLORS = ['--pink','--mint','--lilac'];
const HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

/* ---------- tanggal ---------- */
const pad = n => String(n).padStart(2,'0');
const isoLocal = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseISO = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); };
const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate()+n); return isoLocal(d); };
const dayDiff = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
const fmtDate = s => { const d = parseISO(s); return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`; };
const fmtShort = s => { const d = parseISO(s); return `${d.getDate()} ${BULAN[d.getMonth()].slice(0,3)}`; };
const TODAY = () => nightOf(new Date()); // tanggal malam: membaca sebelum pukul 04.00 masih dihitung malam sebelumnya

/* ---------- state ---------- */
let BIBLE = null, PLAN = null, A = null, UNIT = null;
const S = {
  view: null, viewNight: null, mapSel: null, filter: 'semua', tabCari: 'cari', q: '',
  user: { id: null, email: '', signedIn: false }, authChecked: false, authMode: 'masuk', authErr: '', authBusy: false,
  data: { read: {}, done: {}, nights: {}, round: 1, fav: {}, mode: 'mendalam', theme: null, welcomed: false },
  journal: {}, journalAt: {}, devo: {}, devoLoading: {}, sync: 'local', dbErr: false, cloudDown
};


const LS = 'lentera-v4';
function lsLoad(){ try { return JSON.parse(localStorage.getItem(LS) || 'null'); } catch(e){ return null; } }
function lsSave(){ try { localStorage.setItem(LS, JSON.stringify({ data: S.data, journal: S.journal, journalAt: S.journalAt })); } catch(e){} }

const must = r => { if (r.error) throw r.error; return r; };

let writing = Promise.resolve();
function saveState(){
  lsSave();
  if (!S.user.id) return;
  const uid = S.user.id;
  writing = writing.then(async () => {
    // Gabung dengan isi cloud dulu supaya perangkat lain yang lebih baru tidak tertimpa.
    const cur = must(await sb.from('user_state').select('data').eq('user_id', uid).maybeSingle());
    const cloud = (cur.data && cur.data.data) || {};
    S.data = upgrade(mergeData(S.data, cloud));
    must(await sb.from('user_state').upsert({ user_id: uid, data: S.data, updated_at: new Date().toISOString() }));
    lsSave(); S.sync = 'cloud';
  }).catch(() => { S.sync = 'local'; });
}
const jTimers = {};
function saveJournal(date, text){
  S.journal[date] = text; S.journalAt[date] = new Date().toISOString(); lsSave();
  clearTimeout(jTimers[date]);
  jTimers[date] = setTimeout(async () => {
    const el = document.getElementById('jsaved');
    if (!S.user.id) { if (el) el.textContent = 'Tersimpan di perangkat ini'; return; }
    try { must(await sb.from('journals').upsert({ user_id: S.user.id, date, text, updated_at: S.journalAt[date] })); if (el) el.textContent = 'Tersimpan di akun'; }
    catch(e){ if (el) el.textContent = 'Tersimpan di perangkat ini (gagal sinkron)'; }
  }, 900);
}

/* ---------- streak dengan pemulihan (aturan di lib/antrean.js) ---------- */
const streakInfo = () => streakState(S.data.nights || {}, TODAY());
// Data lama (per tanggal) diubah ke bentuk per perikop begitu antrean termuat. Aman diulang.
const upgrade = d => (A && PLAN ? migrate(d, PLAN, A.q) : d);

/* ---------- Alkitab ---------- */
const bookName = b => BIBLE[b].n;
const chapter = (b, c) => BIBLE[b].c[c-1] || [];
const verseHTML = t => esc(t).replace(/\((\d+-\d+)\)/g, '<span class="hv">($1)</span>');
const titleHTML = t => esc(t).replace(/&lt;br\s*\/?&gt;/g, ' · ');
function chapterHTML(b, c, focus){
  return chapter(b,c).map(v => `${v[2]?`<h4>${titleHTML(v[2])}</h4>`:''}<p data-ref="${b}:${c}:${v[0]}" class="${focus && focus.includes(v[0])?'focus':''} ${isFav(b,c,v[0])?'fav':''}"><sup>${v[0]}</sup>${verseHTML(v[1])}</p>`).join('');
}
const isFav = (b,c,v) => !!(S.data.fav && S.data.fav[`${b}:${c}:${v}`]);
const refText = (b,c,vs) => `${bookName(b)} ${c}:${vs.length>1?vs[0]+'-'+vs[vs.length-1]:vs[0]}`;

/* ---------- renungan dari database ---------- */
async function loadDevo(date){
  if (S.devo[date] !== undefined || S.devoLoading[date]) return;
  S.devoLoading[date] = true;
  const timer = setTimeout(() => { if (S.devo[date] === undefined){ S.devo[date] = 'timeout'; render(); } }, 10000);
  try { const r = await fetch(`/content/bacaan/${date}.json`, { cache: 'no-cache' }); S.devo[date] = r.ok ? await r.json() : null; }
  catch(e){ S.devo[date] = null; }
  clearTimeout(timer); S.devoLoading[date] = false; render();
}

/* ---------- tampilan ---------- */
const VIEWS = [
  {id:'malam', label:'Malam ini', icon:'malam'},
  {id:'cari', label:'Cari', icon:'cari'},
  {id:'arsip', label:'Arsip', icon:'arsip'},
  {id:'progres', label:'Progres', icon:'progres'},
  {id:'akun', label:'Akun', icon:'akun'}
];
const cur = () => { const h = location.hash.slice(1); return (VIEWS.some(v=>v.id===h) || h==='kaitan') ? h : 'malam'; };
const greet = () => { const f = (S.data.nama || '').trim().split(/\s+/)[0]; return f ? `Selamat malam, ${esc(f)}` : 'Selamat malam'; };
const head = (title, sub) => `<header class="ph"><h1 class="ph-h">${title}</h1>${sub ? `<p class="ph-sub">${sub}</p>` : ''}</header>`;
const viewKey = () => S.viewNight || TODAY();

function renderChrome(){
  const c = cur();
  document.getElementById('nav').innerHTML = VIEWS.map(v => `<button data-go="${v.id}" ${v.id===c?'aria-current="page"':''}>${ic(v.icon)}<span>${v.label}</span></button>`).join('');
  const st = streakInfo();
  const k = Object.keys(S.data.nights || {}).filter(d => S.data.nights[d].length).length;
  const el = document.getElementById('streak');
  el.innerHTML = `${ic(flameIcon(st.dim ? 1 : st.streak))}<span>${st.streak}</span>`;
  el.classList.toggle('dim', st.dim);
  el.setAttribute('aria-label', `Lentera menyala ${st.streak} malam berturut-turut${st.dim ? ', sedang redup' : ''}, berisi ${k} kunang-kunang`);
}

function vLogin(){
  const m = S.authMode;
  const title = m === 'daftar' ? 'Buat akun' : m === 'lupa' ? 'Atur ulang kata sandi' : m === 'baru' ? 'Kata sandi baru' : 'Selamat datang kembali';
  const lead = m === 'daftar' ? 'Supaya lentera Anda ikut ke perangkat mana pun.' : m === 'lupa' ? 'Kami kirim tautan atur ulang ke email Anda.' : m === 'baru' ? 'Buat kata sandi baru untuk akun Anda.' : 'Masuk untuk melanjutkan bacaan malam ini.';
  const err = S.authErr ? 'auth-err' : '';
  return `<div class="au">
    <header class="au-sky">${nightSky()}<div class="au-owl">${owl(S.authErr ? 'worried' : 'awake', 104)}</div>
      <h1 class="au-h">${title}</h1><p class="au-lead">${lead}</p></header>
    <form class="ws-panel au-form" id="authform" novalidate>
      ${S.cloudDown ? `<p class="au-info au-warn" role="status">${ic('sinkron')}<span>Layanan akun sedang tidak bisa dihubungi. Anda tetap bisa membaca tanpa akun; data disimpan di perangkat ini dan bisa disambungkan ke akun nanti.</span></p>` : ''}
      ${S.authInfo ? `<p class="au-info" role="status">${ic('notifications')}<span>${esc(S.authInfo)}</span></p>` : ''}
      ${m !== 'baru' ? `<label class="field-l" for="email">Email</label>
      <input class="ws-input" id="email" type="email" autocomplete="email" inputmode="email" required placeholder="nama@email.com" ${err ? `aria-invalid="true" aria-describedby="${err}"` : ''}>` : ''}
      ${m !== 'lupa' ? `<label class="field-l" for="password">Kata sandi</label>
      <input class="ws-input" id="password" type="password" autocomplete="${m === 'daftar' || m === 'baru' ? 'new-password' : 'current-password'}" minlength="6" required placeholder="Minimal 6 karakter" ${err ? `aria-invalid="true" aria-describedby="${err}"` : ''}>` : ''}
      ${S.authErr ? `<p class="au-err" id="auth-err" role="alert">${esc(S.authErr)}</p>` : ''}
      <button class="btn-primary au-go" type="submit" ${S.authBusy ? 'disabled aria-busy="true"' : ''}>${ic(m === 'lupa' ? 'pen' : m === 'daftar' ? 'star' : 'moon')}${S.authBusy ? 'Memproses…' : m === 'daftar' ? 'Buat akun' : m === 'lupa' ? 'Kirim tautan atur ulang' : m === 'baru' ? 'Simpan kata sandi' : 'Masuk'}</button>
      <div class="authlinks">
        ${m !== 'masuk' ? `<button class="btn-text" type="button" data-authmode="masuk">Sudah punya akun? Masuk</button>` : `<button class="btn-text" type="button" data-authmode="daftar">Belum punya akun? Daftar</button><button class="btn-text" type="button" data-authmode="lupa">Lupa kata sandi</button>`}
      </div>
    </form>
    <button class="btn-text au-skip" data-act="offline">${ic('lock')}Lanjut tanpa akun (hanya di perangkat ini)</button>
  </div>`;
}
const AUTH_ERR = [[/invalid login credentials/i,'Email atau kata sandi salah.'],[/email not confirmed/i,'Email belum dikonfirmasi. Buka tautan konfirmasi di email Anda.'],[/already registered|already exists/i,'Email ini sudah terdaftar. Silakan masuk.'],[/password should be at least/i,'Kata sandi minimal 6 karakter.'],[/invalid.*email|unable to validate email/i,'Format email tidak valid.'],[/rate limit|too many/i,'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.'],[/fetch|network|load failed/i,'Layanan akun tidak terjangkau. Periksa koneksi internet, lalu coba lagi.']];
const authMsg = e => { const m = String((e && e.message) || ''); const hit = AUTH_ERR.find(([re]) => re.test(m)); return hit ? hit[1] : 'Terjadi kesalahan. Coba lagi.'; };
async function submitAuth(){
  const email = (document.getElementById('email')?.value || '').trim(); const pw = document.getElementById('password')?.value || '';
  S.authErr = ''; S.authInfo = ''; S.authBusy = true; render();
  try {
    if (S.authMode === 'daftar') {
      const r = must(await sb.auth.signUp({ email, password: pw, options: { emailRedirectTo: location.origin } }));
      if (!r.data.session) { S.authMode = 'masuk'; S.authInfo = 'Akun dibuat. Buka tautan konfirmasi yang dikirim ke email Anda, lalu masuk di sini.'; }
    }
    else if (S.authMode === 'lupa') { must(await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin })); S.authMode = 'masuk'; S.authInfo = 'Tautan atur ulang kata sandi sudah dikirim ke email Anda.'; }
    else if (S.authMode === 'baru') { must(await sb.auth.updateUser({ password: pw })); S.recovery = false; S.authMode = 'masuk'; toast('Kata sandi baru tersimpan'); }
    else must(await sb.auth.signInWithPassword({ email, password: pw }));
  } catch(e){ S.authErr = authMsg(e); }
  S.authBusy = false; render();
  const em = document.getElementById('email'); if (em && !em.value) em.value = email;
}

function vWelcome(){
  const signed = S.user.signedIn; const step = S.wStep || 0;
  const dots = `<ol class="wl-dots" aria-label="Langkah ${step + 1} dari 3">${[0,1,2].map(i => `<li class="${i === step ? 'on' : i < step ? 'done' : ''}"></li>`).join('')}</ol>`;
  const sky = `<div class="wl-sky">${nightSky()}<div class="wl-owl">${owl(step === 2 ? 'happy' : 'awake', 132)}</div></div>`;
  if (step === 0) return `<div class="wl">${sky}${dots}
    <h1 class="wl-h">Halo, saya Lentera.</h1>
    <div class="wl-talk">
      <p>Saya akan menemani Anda membaca Alkitab satu perikop setiap malam, bergantian antarjenis kitab, dengan teks AYT lengkap. Tanpa tenggat: besok malam kita lanjut dari bacaan berikutnya.</p>
      <p>Setiap malam ada renungan dengan sumber yang bisa diperiksa, dan jurnal refleksi pribadi yang tersimpan.</p>
      <p>Setiap malam Anda membaca, satu kunang-kunang masuk ke lentera Anda.</p>
    </div>
    <div class="wl-act"><button class="btn-primary" data-wstep="1">Kenalan dulu</button><button class="btn-text" data-act="start">Lewati</button></div></div>`;
  if (step === 1) return `<div class="wl">${sky}${dots}
    <h1 class="wl-h">Saya panggil Anda siapa?</h1>
    <div class="ws-panel wl-form">
      <label class="field-l" for="nama">Nama panggilan</label>
      <input class="ws-input" id="nama" autocomplete="given-name" placeholder="Mis. Anya" value="${esc(S.data.nama || '')}">
      <p class="ac-txt">${signed ? `Masuk sebagai ${esc(S.user.email)}. Progres, jurnal, dan pengaturan tersimpan di akun ini.` : 'Anda memakai mode tanpa akun. Progres hanya tersimpan di perangkat ini.'}</p>
    </div>
    <div class="wl-act"><button class="btn-primary" data-wstep="2">Lanjut</button><button class="btn-text" data-wstep="0">Kembali</button></div></div>`;
  return `<div class="wl">${sky}${dots}
    <h1 class="wl-h">${S.data.nama ? `Siap, ${esc(S.data.nama.split(/\s+/)[0])}.` : 'Siap.'} Mau diingatkan setiap malam?</h1>
    <div class="wl-talk"><p>Saya bisa mengirim pengingat lembut sekitar pukul 21.00 bila bacaan belum ditandai. Pengaturannya bisa diubah kapan saja di tab Akun.</p></div>
    ${signed ? `<div class="wl-act"><button class="btn-quiet" data-act="push">${ic('bell')}Nyalakan pengingat</button></div>` : ''}
    <div class="wl-act"><button class="btn-primary" data-act="start">${ic('moon')}Mulai membaca</button><button class="btn-text" data-wstep="1">Kembali</button></div></div>`;
}

/* ---------- antrean ---------- */
const byId = id => UNIT.get(id);
function unitRef(u){
  const last = chapter(u[0], u[1]).length;
  return `${bookName(u[0])} ${u[1]}${u[2] === 1 && u[3] === last ? '' : `:${u[2]}${u[3] !== u[2] ? '–' + u[3] : ''}`}`;
}
const unitVerses = u => chapter(u[0], u[1]).filter(v => v[0] >= u[2] && v[0] <= u[3]);
const unitTitle = u => { const v = unitVerses(u).find(x => x[2]); return v ? titleHTML(v[2]) : ''; };
function unitHTML(u, keys){
  const [b, c] = u;
  return unitVerses(u).map(v => `${v[2] ? `<h4>${titleHTML(v[2])}</h4>` : ''}<p tabindex="0" role="button" data-ref="${b}:${c}:${v[0]}" class="${keys && keys.includes(v[0]) ? 'key' : ''} ${isFav(b,c,v[0]) ? 'fav' : ''}"><sup>${keys && keys.includes(v[0]) ? ic('sparkle') : ''}${v[0]}</sup>${verseHTML(v[1])}</p>`).join('');
}
// Ringkas daftar bacaan: perikop yang menutup satu pasal penuh ditulis sebagai pasal, pasal berurutan digabung ("Roma 1–3").
function refsOf(ids){
  const set = new Set(ids); const us = ids.map(byId).filter(Boolean); const parts = []; const seen = new Set();
  for (const u of us) {
    const ch = A.q.filter(x => x[0] === u[0] && x[1] === u[1]);
    if (ch.every(x => set.has(uid(x)))) { const k = u[0] + ':' + u[1]; if (seen.has(k)) continue; seen.add(k);
      const last = parts[parts.length - 1];
      if (last && last.b === u[0] && last.c2 === u[1] - 1) last.c2 = u[1]; else parts.push({ b: u[0], c1: u[1], c2: u[1] }); }
    else parts.push({ u });
  }
  const r = parts.map(p => p.u ? unitRef(p.u) : `${bookName(p.b)} ${p.c1}${p.c2 !== p.c1 ? '–' + p.c2 : ''}`);
  return r.length > 1 ? r.slice(0, -1).join(', ') + ' dan ' + r[r.length - 1] : r.join('');
}
const litNights = () => Object.keys(S.data.nights || {}).filter(d => S.data.nights[d].length);
const unitsDone = () => Object.keys(S.data.done || {}).length;
// Bacaan yang tampil: malam ini dari antrean, atau malam lama yang dibuka dari Riwayat.
function shownPair(){
  const night = TODAY();
  if (S.viewNight && S.viewNight !== night) { const ids = (S.data.nights[S.viewNight] || []).filter(byId); if (ids.length) return { past: S.viewNight, first: byId(ids[0]), second: ids[1] ? byId(ids[1]) : null }; }
  return { past: null, ...tonight(A.q, S.data.done || {}, night) };
}
function readMinutes(u, dv, deep){
  let w = u[4];
  if (dv && typeof dv === 'object') w += [...(deep ? dv.kisah : dv.kisah.slice(0,1)), ...(deep ? dv.hidup : dv.hidup.slice(0,1))].join(' ').split(/\s+/).length;
  return Math.max(2, Math.round(w / 180));
}

function vMalam(){
  GL_SEEN = new Set();
  const PG = arr => (arr||[]).map(t=>`<p>${glossLink(t)}</p>`).join('');
  const night = TODAY(); const { past, first, second } = shownPair();
  const id = uid(first);
  loadDevo(id);
  const dv = S.devo[id];
  const ok = dv && typeof dv === 'object';
  const deep = S.data.mode === 'mendalam';
  const done = !!past || !!S.data.done[id];
  const done2 = second && (!!past || !!S.data.done[uid(second)]);
  const st = streakInfo();
  const fireflies = litNights().length;
  const keys = ok && dv.fokus && dv.fokus.b === first[0] && dv.fokus.c === first[1] ? dv.fokus.key : null;
  const era = eraOf(first[0], first[1]);
  const nama = (S.data.nama || '').trim().split(/\s+/)[0];
  const round = S.data.round || 1;

  /* ---- Zona Main: kepala malam ini ---- */
  let note = '';
  if (past) note = `<p class="tn-note">${ic('clock')}<span>Anda sedang membuka bacaan ${fmtDate(past)}.</span><button class="btn-text" data-act="today">Kembali ke malam ini</button></p>`;
  else if (!done && st.dim) note = `<p class="tn-note">${ic(flameIcon(1))}<span>Lentera Anda sedang redup. Satu bacaan malam ini menyalakannya lagi, dan satu bacaan tambahan membantu memulihkan streak ${st.streak} malam Anda. Masih ada ${dayDiff(night, st.deadline) + 1} malam untuk itu.</span></p>`;
  else if (!done && st.restarted && st.restarted >= addDays(night, -1) && st.streak === 0) note = `<p class="tn-note">${ic(flameIcon(1))}<span>Lentera Anda menyala lagi mulai malam ini. ${unitsDone()} bacaan dan ${fireflies} kunang-kunang Anda tetap tersimpan.</span></p>`;
  else if (!done && st.streak > 0) note = `<p class="tn-note">${ic(flameIcon(st.streak))}<span>Lentera Anda menyala ${st.streak} malam berturut-turut. Satu bacaan sudah cukup untuk malam ini.</span></p>`;
  else if (!done && !fireflies) note = `<p class="tn-note">${ic(flameIcon(0))}<span>Mulai dari satu bacaan saja.</span></p>`;
  const title = past ? `Bacaan ${fmtShort(past)}` : (nama ? `Selamat malam, ${esc(nama)}` : 'Selamat malam');
  const header = `
  <header class="tn">
    ${nightSky('', S.moonAnim ? S.moonAnim.p : lunarPhase(past || night))}
    <div class="tn-chips">
      <span class="chip-s">${esc(A.g[first[5]])}</span>
      ${round > 1 ? `<span class="chip-s">Putaran ke-${round}</span>` : ''}
      ${era ? `<button class="chip-s chip-btn" data-era="${first[0]}:${first[1]}">${ic('clock')}${esc(era.n)}</button>` : ''}
    </div>
    <div class="tn-owl ${S.fxPeek ? 'peek' : ''}">${owl(done ? 'asleep' : 'sleepy', 104)}</div>
    <h1 class="tn-hello">${title}</h1>
    <p class="tn-line">${past ? `${refsOf(S.data.nights[past])}.` : done ? 'Bacaan malam ini sudah selesai. Selamat beristirahat.' : `Malam ini ${unitRef(first)}, sekitar ${readMinutes(first, dv, deep)} menit.`}</p>
    ${done ? '' : `<button class="btn-primary" data-act="tobaca">${ic('book')}Mulai baca</button>`}
    ${note}
  </header>`;

  /* ---- Zona Baca ---- */
  const tools = `
  <div class="rd-tools">
    <div class="seg" role="group" aria-label="Mode bacaan">
      <button data-mode="ringkas" aria-pressed="${!deep}">${ic('leaf')}Ringkas</button>
      <button data-mode="mendalam" aria-pressed="${deep}">${ic('layers')}Mendalam</button>
    </div>
    <div class="fs" role="group" aria-label="Ukuran teks">
      <button data-fs="-1" aria-label="Perkecil teks" ${S.data.fs === 17 ? 'disabled' : ''}>${ic('minus')}</button>
      <button data-fs="1" aria-label="Perbesar teks" ${S.data.fs === 21 ? 'disabled' : ''}>${ic('plus')}</button>
    </div>
  </div>`;

  // Bacaan malam ini: satu perikop utuh, dengan ayat fokus renungan disorot.
  const reading = `
  <section class="rd-focus t-lamp" aria-labelledby="fokush">
    <h2 class="rd-h rd-theme" id="fokush">${ic('malam')}${ok ? esc(dv.tema) : unitTitle(first) || 'Bacaan malam ini'}</h2>
    <div class="rd-verses">${unitHTML(first, keys)}</div>
    <p class="rd-ref">${unitRef(first)} (AYT)${keys ? ', ayat fokus disorot' : ''}. Ketuk ayat untuk menyimpan atau menyalin.</p>
  </section>`;

  let devo = '', bonus = '';
  if (dv === undefined || S.devoLoading[id]) devo = `<div class="rd-loading" role="status">${owl('reading', 72)}<div class="rd-skel" aria-label="Memuat renungan"><i></i><i></i><i></i><i></i></div></div>`;
  else if (dv === 'timeout') devo = `<div class="rd-empty">${owl(navigator.onLine === false ? 'offline' : 'worried', 72)}<p><b>${navigator.onLine === false ? 'Sedang tanpa sinyal.' : 'Renungan belum dapat dimuat.'}</b> Periksa koneksi Anda. Bacaan Alkitab di atas tetap bisa dibaca.</p></div>`;
  else if (!dv) devo = `<div class="rd-empty">${owl('sleepy', 72)}<p><b>Renungan untuk bacaan ini sedang disiapkan.</b> Bacalah perikopnya, lalu tuliskan refleksi Anda di bawah.</p></div>`;
  else {
    devo = `
  <section class="rd-sec t-plum" aria-labelledby="kisahh">
    <h2 class="rd-h" id="kisahh">${ic('scroll')}Latar kisah</h2>
    <div class="rd-prose">${PG(deep ? dv.kisah : dv.kisah.slice(0,1))}</div>
  </section>
  ${deep ? `<section class="rd-sec t-sky" aria-labelledby="katah">
    <h2 class="rd-h" id="katah">${ic('lang')}Telaah kata</h2>
    <dl class="rd-words">${dv.kata.map(k=>`<div><dt><b>${esc(k.w)}</b><span>${esc(k.l)}</span></dt><dd>${glossLink(k.d)}</dd></div>`).join('')}</dl>
  </section>` : ''}
  <section class="rd-sec t-sage" aria-labelledby="hiduph">
    <h2 class="rd-h" id="hiduph">${ic('bulb')}Penerapan dalam hidup</h2>
    ${deep && dv.isu ? `<aside class="rd-issue" aria-label="Isu terkini"><p class="rd-issue-k">Isu terkini</p><p class="rd-issue-t">${esc(dv.isu.judul)}</p><p>${glossLink(esc(dv.isu.teks))}</p></aside>` : ''}
    <div class="rd-prose">${PG(deep ? dv.hidup : dv.hidup.slice(0,1))}</div>
  </section>`;
    bonus = `
  ${dv.fakta ? `<section class="bn-fact" aria-labelledby="faktah">
    <p class="bn-kind">${ic('fakta')}${esc(dv.fakta.kind)}</p>
    <h2 class="bn-h" id="faktah">${esc(dv.fakta.title)}</h2>
    <p>${glossLink(dv.fakta.text)}</p>
  </section>` : ''}
  ${deep && dv.kaitan ? `<section class="rd-sec t-sky" aria-labelledby="kaitanh">
    <h2 class="rd-h" id="kaitanh">${ic('link')}Ayat yang berkaitan</h2>
    <ol class="rd-links">${dv.kaitan.map((l,i) => `<li>
      <p class="rd-links-ref">${refText(l.b,l.c,l.v)}</p>
      <p class="rd-links-v">${chapter(l.b,l.c).filter(v=>l.v.includes(v[0])).map(v=>verseHTML(v[1])).join(' ')}</p>
      <p class="rd-links-why">${esc(l.why)}</p>
      <button class="btn-text" data-maplink="${i}">${ic('map')}Lihat di peta kaitan</button></li>`).join('')}</ol>
  </section>` : ''}`;
  }

  const jd = past || night;
  const journal = `
  <section class="rd-sec journal t-lamp" aria-labelledby="refh">
    <h2 class="rd-h" id="refh">${ic('pen')}Refleksi malam ini</h2>
    <p class="rd-q">${ok && dv.tanya ? esc(dv.tanya) : 'Ayat apa dari bacaan malam ini yang paling menyentuh Anda, dan mengapa?'}</p>
    ${ok && dv.coba && deep ? `<p class="rd-try">${ic('check')}<span><b>Langkah konkret:</b> ${esc(dv.coba)}</span></p>` : ''}
    <label class="field-l" for="jurnal">Jurnal ${fmtShort(jd)}</label>
    <textarea id="jurnal" data-date="${jd}" placeholder="Tuliskan refleksi Anda di sini…">${esc(S.journal[jd] || '')}</textarea>
    <p class="saved" id="jsaved" aria-live="polite"></p>
  </section>`;

  const prayer = ok && dv.doa ? `<section class="rd-sec rd-pray t-plum" aria-labelledby="doah"><h2 class="rd-h" id="doah">${ic('doa')}Doa sebelum tidur</h2><p class="prayer">${esc(dv.doa)}</p></section>` : '';
  const sources = ok && dv.sumber && dv.sumber.length ? `<section class="rd-sec t-sage" aria-labelledby="sumberh"><h2 class="rd-h" id="sumberh">${ic('shield')}Sumber bacaan</h2>
      <ol class="srclist">${dv.sumber.map(s=>`<li><a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.t)}</a></li>`).join('')}</ol></section>` : '';

  /* ---- Signature: lentera kunang-kunang ---- */
  const lan = lantern(fireflies, 112, {cls:'ln-big', id:'f', dim: st.dim && !past});
  const finish = done ? `
  <section class="fin blanket fin-done ${S.justDone === id ? 'just' : ''}" aria-labelledby="finh">${nightSky('sky-fin')}
    <div class="fin-art">${lan}<div class="fin-owl">${owl(S.justDone === id ? 'happy' : 'asleep', 76)}</div></div>
    <h2 class="fin-h" id="finh">${past ? 'Bacaan malam itu sudah selesai.' : `Malam ke-${st.streak}. Selamat tidur${nama ? ', ' + esc(nama) : ''}.`}</h2>
    <p class="fin-p">${!past && S.justMended ? `Lentera Anda menyala penuh lagi. Streak ${S.justMended} malam tersambung kembali.` : `Lentera Anda kini berisi ${fireflies} kunang-kunang.`}</p>
  </section>` : `
  <section class="fin blanket" aria-labelledby="finh">${nightSky('sky-fin')}
    <div class="fin-art">${lan}</div>
    <h2 class="fin-h" id="finh">Selesai membaca ${unitRef(first)}?</h2>
    <p class="fin-p">Tandai bacaan ini, dan satu kunang-kunang lagi masuk ke lentera Anda.</p>
    <button class="btn-primary" data-act="read" data-id="${id}" data-first="1">${ic('check')}Tandai sudah dibaca</button>
  </section>`;

  // Bacaan kedua: opsional, muncul setelah bacaan pertama ditandai. Saat ada pemulihan, inilah bacaan pemulihannya.
  let more = '';
  if (done && second) {
    const owe = !past && !done2 && st.owed > 0;
    const head2 = past ? `Juga dibaca malam itu: ${unitRef(second)}` : done2 ? `Bacaan kedua selesai: ${unitRef(second)}` : owe ? `Bacaan pemulihan: ${unitRef(second)}` : `Masih ingin membaca? ${unitRef(second)}`;
    more = `<section class="rd-sec rd-more t-plum" aria-label="Bacaan kedua"><div class="rd-chaps">
      <details class="chap"><summary><span class="nm">${head2}</span><small>${minutes(second[4])} menit</small><svg class="i chev" aria-hidden="true"><use href="#chev"/></svg></summary>
      <div class="chaptext">${owe ? `<p class="rd-note">Membantu memulihkan streak ${st.streak} malam Anda. Boleh juga dibaca besok.</p>` : ''}${unitHTML(second)}
      ${past || done2 ? '' : `<button class="btn-quiet" data-act="read" data-id="${uid(second)}">${ic('check')}Tandai sudah dibaca</button>`}</div></details>
    </div></section>`;
  } else if (done && !past && first[4] > LONG) more = `<p class="rd-note rd-more-note">Bacaan ini cukup panjang. Satu bacaan sudah cukup untuk malam ini.</p>`;

  return `${header}
  <article class="rd" id="baca" style="--fs-read:${(S.data.fs || 19) + 1}px" aria-label="Bacaan dan renungan">
    ${tools}${introCards(first)}${reading}${prevCard(first, dv)}${devo}${journal}${prayer}
  </article>
  ${finish}${more}
  <div class="bonus">${bonus}${sources}
    <p class="srcnote">${ic('shield')}<span>Teks Alkitab: Alkitab Yang Terbuka (AYT) © YLSA, untuk penggunaan non-komersial.</span><button class="btn-text" data-act="source">Tentang sumber</button></p>
  </div>`;
}

function vArsip(){
  const nights = [...new Set([...litNights(), ...Object.keys(S.journal).filter(d => S.journal[d] && S.journal[d].trim())])].sort().reverse();
  const { first } = tonight(A.q, S.data.done || {}, TODAY());
  const i0 = first ? A.q.indexOf(first) : -1;
  const nextUp = i0 < 0 ? [] : A.q.slice(i0).filter(u => !S.data.done[uid(u)]).slice(0, 5);
  return `${head('Riwayat bacaan', 'Malam-malam yang sudah Anda baca, dan bacaan berikutnya.')}
    <ul class="ws-list">${nights.map(d => { const ids = (S.data.nights || {})[d] || []; return `<li>
      <button class="ws-row ${ids.length ? 'st-read' : ''}" data-open="${d}">
        <span class="ws-ic" aria-hidden="true">${ids.length ? ic('check') : ic('pen')}</span>
        <span class="ws-meta"><b>${fmtDate(d)}</b><span>${ids.length ? refsOf(ids) : 'Jurnal tanpa bacaan yang ditandai'}</span>${S.journal[d] ? `<span class="ws-tag">${ic('pen')}Ada jurnal</span>` : ''}</span>
      </button></li>`; }).join('') || `<li class="ws-empty">${owl('sleepy', 64)}<p>Belum ada malam yang tercatat. Malam pertama Anda akan muncul di sini.</p></li>`}
    </ul>
    ${nextUp.length ? `<section class="ws-group" aria-labelledby="nexth"><h2 class="ws-h" id="nexth">Berikutnya di antrean</h2>
      <ul class="ws-list">${nextUp.map((u, k) => `<li><div class="ws-row ${k ? 'st-lock' : 'st-today'}"><span class="ws-ic" aria-hidden="true">${k ? ic('book') : ic('moon')}</span><span class="ws-meta"><b>${unitRef(u)}</b><span>${unitTitle(u) || esc(A.g[u[5]])}, sekitar ${minutes(u[4])} menit</span></span>${k ? '' : `<span class="ws-state">${streakInfo().litTonight ? 'Besok' : 'Malam ini'}</span>`}</div></li>`).join('')}</ul></section>` : ''}
    <button class="btn-quiet" data-act="export">${ic('download')}Ekspor jurnal (.md)</button>
    <p class="ws-foot">${unitsDone()} bacaan sudah dibaca${(S.data.round || 1) > 1 ? ` pada putaran ke-${S.data.round}` : ''}.${first ? ` Antrean lanjut dari ${unitRef(first)}.` : ''}</p>`;
}

function vKaitan(){
  const { first } = shownPair(); const id = uid(first);
  loadDevo(id); const dv = S.devo[id];
  const back = `<button class="btn-quiet" data-go="malam">${ic('moon')}Kembali ke bacaan</button>`;
  if (!dv || !dv.kaitan) return `${head('Kaitan antar ayat', unitRef(first))}<div class="ws-empty">${owl('sleepy', 72)}<p><b>Peta kaitan belum tersedia.</b> Peta muncul bersama renungan bacaan ini.</p></div>${back}`;
  const cx=170, cy=150, pos=[[62,58],[278,58],[170,262]], tone=['--plum','--sage','--skyblue'];
  const sel = S.mapSel; const fk = dv.fokus;
  const lines = dv.kaitan.map((l,i)=>`<path class="mp-line ${sel===i?'on':''}" d="M${cx} ${cy} L ${pos[i][0]} ${pos[i][1]}" style="stroke:var(${tone[i]})"/>`).join('');
  const nodes = dv.kaitan.map((l,i)=>{ const p=pos[i]; const nm=refText(l.b,l.c,l.v); return `<g class="node ${sel===i?'on':''}" data-node="${i}" tabindex="0" role="button" aria-pressed="${sel===i}" aria-label="${esc(nm)}">
    <circle cx="${p[0]}" cy="${p[1]}" r="40" fill="transparent"/><circle class="mp-dot" cx="${p[0]}" cy="${p[1]}" r="28" style="fill:var(${tone[i]})"/>
    <use href="#i-pasal" x="${p[0]-12}" y="${p[1]-12}" width="24" height="24" class="mp-ic"/>
    <text class="mp-t" x="${p[0]}" y="${p[1]+48}" text-anchor="middle">${esc(nm)}</text></g>`; }).join('');
  const L = sel==null ? null : dv.kaitan[sel];
  const info = L ? `<p class="rd-links-ref">${refText(L.b,L.c,L.v)}</p><p class="rd-links-v">${chapter(L.b,L.c).filter(v=>L.v.includes(v[0])).map(v=>verseHTML(v[1])).join(' ')}</p><p class="rd-links-why">${esc(L.why)}</p>`
    : `<p class="rd-note">Ketuk salah satu lingkaran untuk membaca ayatnya dan melihat hubungannya dengan ayat fokus.</p>`;
  return `${head('Kaitan antar ayat', unitRef(first))}
    <div class="mapbox ws-panel"><svg viewBox="0 0 340 320" role="img" aria-label="Peta kaitan ayat">${lines}
      <circle class="mp-ring" cx="${cx}" cy="${cy}" r="58"/>
      <circle class="mp-core" cx="${cx}" cy="${cy}" r="50"/>
      <text class="mp-ct" x="${cx}" y="${cy-3}" text-anchor="middle">${esc(bookName(fk.b))}</text>
      <text class="mp-ct" x="${cx}" y="${cy+16}" text-anchor="middle">${fk.c}:${fk.v1}–${fk.v2}</text>${nodes}</svg></div>
    <section class="ws-panel mp-info" aria-live="polite">${info}</section>
    ${back}`;
}

// Pencapaian: malam membaca, satu kitab tamat, dan seluruh Alkitab.
function milestones(k, bookDone){
  const nightsM = [[1,'malam','Malam pertama'],[7,'lentera2','Seminggu bersinar'],[30,'arsip','Sebulan setia'],[100,'fakta','Seratus kunang-kunang'],[365,'lentera3','365 malam']];
  return [...nightsM.map(([need, icon, name]) => ({ icon, name, on: k >= need, hint: `Baca ${need} malam (${Math.min(k, need)}/${need})` })),
    { icon: 'pasal', name: 'Satu kitab tamat', on: bookDone, hint: 'Selesaikan satu kitab' },
    { icon: 'terang', name: 'Seluruh Alkitab', on: (S.data.history || []).length > 0, hint: 'Selesaikan satu putaran' }];
}
function chapterProgress(){
  const done = S.data.done || {}; const tot = {}, got = {};
  for (const u of A.q) { const k = u[0] + ':' + u[1]; tot[k] = (tot[k] || 0) + 1; if (done[uid(u)]) got[k] = (got[k] || 0) + 1; }
  return { tot, got, full: Object.keys(tot).filter(k => got[k] === tot[k]) };
}
function vProgres(){
  const st = streakInfo();
  const lit = new Set(litNights()); const k = lit.size; const mended = new Set(st.mended);
  const cp = chapterProgress(); const readCh = new Set(cp.full);
  const books = BIBLE.map((B,i) => { const tot = B.c.length; let r = 0, part = 0; for (let c=1;c<=tot;c++) { const key = i+':'+c; if (readCh.has(key)) r++; part += (cp.got[key] || 0) / cp.tot[key]; } return {i, n:B.n, a:B.a, r, tot, part}; });
  const n = readCh.size; const round = S.data.round || 1;
  const pct = n / 1189 * 100;
  const cmp = n ? books.filter(b => b.tot <= n).sort((x,y) => y.tot - x.tot)[0] : null;
  const t = TODAY(); const d0 = parseISO(t); const y=d0.getFullYear(), m=d0.getMonth();
  // minggu ini (Senin–Minggu)
  const dow = (d0.getDay()+6)%7; const mon = addDays(t, -dow);
  const week = ['Sn','Sl','Rb','Km','Jm','Sb','Mg'].map((l,i) => { const d = addDays(mon, i); return { l, d, r: lit.has(d), mend: mended.has(d), today: d === t, future: d > t }; });
  // kalender bulan
  const first = new Date(y,m,1).getDay(); const lead = (first+6)%7; const dim = new Date(y,m+1,0).getDate();
  let cells = ['Sn','Sl','Rb','Km','Jm','Sb','Mg'].map(d=>`<div class="pg-dh" aria-hidden="true">${d}</div>`).join('');
  for (let i=0;i<lead;i++) cells += `<div class="pg-d e"></div>`;
  for (let d=1; d<=dim; d++){ const s = `${y}-${pad(m+1)}-${pad(d)}`; const r = lit.has(s); cells += `<div class="pg-d ${r?'r':''} ${s===t?'t':''}" aria-label="${d} ${BULAN[m]}${r ? ', sudah membaca' : ''}">${r ? ic('check') : d}</div>`; }
  const shelf = (from, to, title) => `<h3 class="pg-shelf-h">${title}</h3><ul class="pg-shelf">${books.slice(from, to).map(b => `<li><button class="pg-book ${b.r===b.tot?'done':''}" data-bk="${b.i}" style="--fill:${(b.part/b.tot*100).toFixed(1)}%" aria-label="${esc(b.n)}: ${b.r} dari ${b.tot} pasal"><span>${esc(b.a)}</span></button></li>`).join('')}</ul>`;
  const ms = milestones(k, books.some(b => b.r === b.tot));
  const streakLine = st.dim ? `Lentera sedang redup. ${st.owed} bacaan tambahan memulihkan streak ${st.streak} malam, paling lambat ${fmtShort(st.deadline)}.`
    : st.streak ? `Menyala ${st.streak} malam berturut-turut. Terpanjang ${st.best} malam.`
    : st.restarted ? 'Streak dimulai lagi malam ini. Kunang-kunang dan bacaan Anda tetap tersimpan.' : 'Streak dimulai saat Anda menandai bacaan pertama.';
  return `${head('Progres', 'Seluruh Alkitab, satu bacaan demi satu bacaan.')}
    <section class="pg-hero" aria-labelledby="pgh">${nightSky('sky-pg')}
      <div class="pg-lantern ${S.fxGlow ? 'glow' : ''}">${lantern(k, 128, {cls:'ln-big', id:'p', dim: st.dim})}</div>
      <div class="pg-hero-t">
        <h2 class="pg-stat" id="pgh">${n}<span> pasal sudah dibaca</span></h2>
        <p>Putaran ke-${round}${pct >= 1 ? `, ${Math.floor(pct)}% dari seluruh Alkitab` : n ? ', baru dimulai' : ''}.</p>
        <p>${k ? `Lentera Anda berisi ${k} kunang-kunang, satu untuk setiap malam Anda membaca.` : 'Lentera Anda menunggu kunang-kunang pertama malam ini.'}</p>
        <p class="pg-streak">${streakLine}</p>
      </div>
    </section>
    <section class="ws-panel" aria-labelledby="wkh"><h2 class="rd-h t-lamp" id="wkh">${ic('calendar')}Minggu ini</h2>
      <ol class="pg-week">${week.map(w => `<li class="${w.r || w.mend ? 'r' : ''} ${w.today ? 't' : ''} ${w.today && w.r && S.fxWax ? 'wax' : ''}">${moonPhase(w.r ? 'full' : w.mend ? 'mended' : w.today ? 'crescent' : w.future ? 'future' : 'new')}<span class="pg-wl">${w.l}</span><span class="sr">${fmtShort(w.d)}${w.r ? ', sudah membaca' : w.mend ? ', dipulihkan' : w.today ? ', malam ini' : w.future ? '' : ', tidak membaca'}</span></li>`).join('')}</ol>
      <p class="pg-legend"><span>${moonPhase('full')}Sudah dibaca</span><span>${moonPhase('crescent')}Malam ini</span><span>${moonPhase('mended')}Dipulihkan</span><span>${moonPhase('new')}Tidak membaca</span></p>
    </section>
    <section class="ws-panel" aria-labelledby="rakh"><h2 class="rd-h t-sky" id="rakh">${ic('progres')}Rak Alkitab</h2>
      <p class="pg-lead">${n ? `${n} dari 1.189 pasal sudah dibaca.${cmp ? ` Sudah lebih panjang dari seluruh kitab ${esc(cmp.n)} (${cmp.tot} pasal).` : ''}` : 'Rak masih kosong. Setiap pasal yang dibaca mengisi satu kitab sedikit demi sedikit.'}</p>
      ${shelf(0, 39, 'Perjanjian Lama')}${shelf(39, 66, 'Perjanjian Baru')}
    </section>
    <section class="ws-panel cloud-top" aria-labelledby="stkh"><h2 class="rd-h t-plum" id="stkh">${ic('pencapaian')}Pencapaian</h2>
      <ul class="pg-stickers">${ms.map((x, i) => `<li class="${x.on ? 'on' : ''} ${S.fxStick === i ? 'stick' : ''}">${sticker(x.on ? x.icon : 'kunci', x.on, i)}<b>${x.name}</b><small>${x.on ? 'Terbuka' : x.hint}</small></li>`).join('')}</ul>
    </section>
    <section class="ws-panel" aria-labelledby="calh"><h2 class="rd-h t-sage" id="calh">${ic('calendar')}${BULAN[m]} ${y}</h2><div class="pg-cal">${cells}</div></section>
    ${timelineHTML()}`;
}

function vAkun(){
  const u = S.user; const nama = (S.data.nama || '').trim();
  return `${head('Akun', 'Penyimpanan, cara membaca, dan pengingat.')}
    <section class="ws-panel ac-who" aria-labelledby="ach">
      <div class="ac-owl">${owl('awake', 64)}</div>
      ${u.signedIn
        ? `<h2 class="ac-name" id="ach">${nama ? esc(nama) : 'Akun Anda'}</h2><p class="ac-mail">${esc(u.email)}</p>
           <p class="ac-sync ${S.sync==='cloud'?'ok':'local'}">${ic(S.sync==='cloud'?'cloud':'shield')}${S.sync==='cloud'?'Tersinkron ke akun':'Menyimpan di perangkat'}</p>
           <p class="ac-txt">Progres, streak, mode bacaan, dan jurnal disimpan secara pribadi di akun ini dan hanya dapat dibaca oleh Anda.</p>
           <button class="btn-quiet" data-act="logout">${ic('close')}Keluar</button>`
        : S.cloudDown ? `<h2 class="ac-name" id="ach">Layanan akun terputus</h2><p class="ac-mail">Bacaan, streak, dan jurnal tetap tersimpan di perangkat ini.</p>
           <p class="ac-txt">Layanan akun sedang tidak bisa dihubungi, mungkin karena koneksi lambat atau terputus. Begitu tersambung lagi, data di perangkat ini akan digabung ke akun Anda.</p>
           <button class="btn-primary" data-act="reload">${ic('cloud')}Sambungkan lagi</button>`
        : `<h2 class="ac-name" id="ach">Belum masuk</h2><p class="ac-mail">Progres tersimpan di peramban ini saja.</p>
           <p class="ac-txt">Masuk dengan email agar progres tersimpan di akun dan tidak hilang saat cache dihapus atau ganti perangkat.</p>
           <button class="btn-primary" data-act="tologin">${ic('user')}Masuk atau buat akun</button>`}
    </section>
    <section class="ws-panel" aria-labelledby="bach"><h2 class="rd-h t-lamp" id="bach">${ic('book')}Membaca</h2>
      <label class="field-l" for="namaakun">Nama panggilan untuk sapaan</label>
      <input class="ws-input" id="namaakun" autocomplete="given-name" placeholder="Mis. Anya" value="${esc(S.data.nama || '')}">
      <p class="field-l">Mode bawaan</p>
      <div class="seg ws-seg" role="group" aria-label="Mode bawaan">
        <button data-mode="ringkas" aria-pressed="${S.data.mode!=='mendalam'}">${ic('leaf')}Ringkas</button>
        <button data-mode="mendalam" aria-pressed="${S.data.mode==='mendalam'}">${ic('layers')}Mendalam</button>
      </div>
      <p class="ac-txt">Ringkas: ayat fokus, satu paragraf latar, satu paragraf penerapan, refleksi, dan doa. Mendalam: ditambah telaah kata, isu terkini, ayat berkaitan, dan sumber.</p>
    </section>
    <section class="ws-panel cloud-top" aria-labelledby="pngh"><h2 class="rd-h t-plum" id="pngh">${ic('bell')}Pengingat malam</h2>
      ${isIOS() && !isStandalone() ? `<p class="ac-note">${ic('notifications')}<span>Di iPhone, notifikasi hanya bisa aktif setelah aplikasi dipasang: buka di <b>Safari</b>, ketuk <b>Bagikan</b>, pilih <b>Tambahkan ke Layar Utama</b>, lalu buka dari ikon itu.</span></p>` : ''}
      ${u.signedIn ? `
      <div class="switchlist">
        <div class="switchrow main"><div><b>Notifikasi</b><small>${S.pushBusy ? 'Memproses…' : S.data.notif ? 'Menyala' : 'Mati'}</small></div>
          <button class="switch" role="switch" aria-checked="${!!S.data.notif}" aria-label="Notifikasi" data-act="pushtoggle" ${S.pushBusy ? 'disabled' : ''}></button></div>
        ${S.data.notif ? `
        <div class="switchrow"><div><b>Pengingat malam</b><small>Sekitar 21.00 WIB, bila malam itu belum membaca</small></div>
          <button class="switch" role="switch" aria-checked="${S.data.notifMalam !== false}" aria-label="Pengingat malam" data-notifkind="notifMalam"></button></div>
        <button class="btn-text" data-act="push">${ic('notifications')}Daftarkan ulang perangkat ini</button>` : ''}
      </div>`
        : `<p class="ac-txt">Masuk dengan akun terlebih dahulu untuk mengaktifkan notifikasi.</p>`}
    </section>
    <section class="ws-panel" aria-labelledby="jrnh"><h2 class="rd-h t-sky" id="jrnh">${ic('pen')}Jurnal</h2>
      <p class="ac-txt">${Object.values(S.journal).filter(t=>t&&t.trim()).length} catatan tersimpan.</p>
      <button class="btn-quiet" data-act="export">${ic('download')}Ekspor semua jurnal (.md)</button>
    </section>
    <details class="ws-panel ac-about"><summary><span class="rd-h t-sage">${ic('shield')}Tentang sumber teks</span>${ic('chev')}</summary>
      <p class="ac-txt">Alkitab Yang Terbuka (AYT) © 2011–2024 Yayasan Lembaga SABDA, diambil dari repositori resmi YLSA (github.com/sabdacode/ayt). Penggunaan non-komersial diizinkan dengan mencantumkan sumber. Penomoran ayat disesuaikan dengan Alkitab TB: kitab Mazmur memakai penomoran Ibrani (judul mazmur dihitung sebagai ayat 1), begitu pula 3 Yohanes 1:15 dan Wahyu 12:18, berdasarkan penanda penomoran asli yang disertakan AYT.</p>
    </details>`;
}

/* ---------- pencarian & favorit ---------- */
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
let BOOKIDX = null;
function bookIndex(){
  if (BOOKIDX) return BOOKIDX;
  BOOKIDX = BIBLE.map((B,i) => ({ i, keys: [norm(B.n), norm(B.a)] }));
  return BOOKIDX;
}
function findBook(str){
  const k = norm(str); if (!k) return null;
  const idx = bookIndex();
  let hit = idx.find(x => x.keys.includes(k));
  if (!hit) hit = idx.find(x => x.keys.some(key => key.startsWith(k)));
  return hit ? hit.i : null;
}
function parseRef(q){
  const m = q.trim().match(/^((?:\d\s*)?[A-Za-z][A-Za-z\s\-]*?)\s*(\d+)(?:\s*[:.]\s*(\d+)(?:\s*-\s*(\d+))?)?$/);
  if (!m) return null;
  const b = findBook(m[1]); if (b == null) return null;
  const c = +m[2]; if (!BIBLE[b].c[c-1]) return null;
  const v1 = m[3] ? +m[3] : null, v2 = m[4] ? +m[4] : v1;
  return { b, c, v1, v2 };
}
const verseRow = (b,c,v,t,hl) => `<li><button class="sr-row ${isFav(b,c,v)?'fav':''}" data-ref="${b}:${c}:${v}"><b>${isFav(b,c,v) ? ic('starfill') : ''}${esc(bookName(b))} ${c}:${v}</b><span>${hl ? hl(t) : verseHTML(t)}</span></button></li>`;
function searchResults(q){
  q = (q||'').trim();
  if (!q) return `<div class="ws-empty">${owl('awake', 64)}<p><b>Cari ayat atau kata.</b> Contoh: Yoh 3:16, Mazmur 23, Roma 8:28-30, atau kata seperti “damai sejahtera”.</p></div>`;
  const ref = parseRef(q);
  if (ref){
    const ch = chapter(ref.b, ref.c).filter(v => ref.v1 == null || (v[0] >= ref.v1 && v[0] <= ref.v2));
    if (!ch.length) return `<div class="ws-empty"><p><b>Ayat tidak ditemukan.</b> ${esc(bookName(ref.b))} ${ref.c} memiliki ${chapter(ref.b,ref.c).length} ayat.</p></div>`;
    return `<p class="sr-count">${esc(bookName(ref.b))} ${ref.c}${ref.v1?':'+ref.v1+(ref.v2!==ref.v1?'-'+ref.v2:''):''}. Ketuk ayat untuk menandai favorit.</p><ul class="sr-list">${ch.map(v => verseRow(ref.b, ref.c, v[0], v[1])).join('')}</ul>`;
  }
  if (q.length < 3) return `<p class="sr-count">Ketik minimal 3 huruf untuk mencari kata.</p>`;
  const needle = q.toLowerCase(); const out = []; let total = 0;
  for (let b = 0; b < BIBLE.length; b++) for (let c = 0; c < BIBLE[b].c.length; c++) for (const v of BIBLE[b].c[c]){
    if (v[1].toLowerCase().includes(needle)){ total++; if (out.length < 100) out.push([b, c+1, v[0], v[1]]); }
  }
  if (!total) return `<div class="ws-empty">${owl('sleepy', 64)}<p><b>Tidak ada hasil untuk “${esc(q)}”.</b> Coba kata lain atau periksa ejaannya.</p></div>`;
  const re = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const hl = t => esc(t).replace(re, m => `<mark>${m}</mark>`);
  return `<p class="sr-count">${total.toLocaleString('id-ID')} ayat ditemukan${total > 100 ? ', menampilkan 100 pertama' : ''}.</p><ul class="sr-list">${out.map(r => verseRow(r[0], r[1], r[2], r[3], hl)).join('')}</ul>`;
}
function vCari(){
  const favs = Object.keys(S.data.fav || {}).map(k => k.split(':').map(Number)).sort((x,y) => x[0]-y[0] || x[1]-y[1] || x[2]-y[2]);
  const tab = S.tabCari;
  return `${head(tab === 'cari' ? 'Cari ayat' : tab === 'istilah' ? 'Glosarium istilah' : 'Ayat favorit', 'Teks AYT dengan penomoran TB.')}
    <div class="seg ws-seg" role="group" aria-label="Pilih">
      <button data-tab="cari" aria-pressed="${tab==='cari'}">Cari</button>
      <button data-tab="favorit" aria-pressed="${tab==='favorit'}">Favorit (${favs.length})</button>
      <button data-tab="istilah" aria-pressed="${tab==='istilah'}">Istilah</button>
    </div>
    ${tab === 'istilah' ? vIstilah() : tab === 'cari' ? `
      <label class="ws-search" for="q"><span class="sr">Cari ayat atau kata</span>${ic('search')}<input id="q" type="search" inputmode="search" autocomplete="off" placeholder="Yoh 3:16 atau kata kunci" value="${esc(S.q)}"></label>
      <div id="results">${searchResults(S.q)}</div>`
    : (favs.length ? `<p class="sr-count">Ketuk ayat untuk menyalin atau menghapus dari favorit.</p><ul class="sr-list">${favs.map(([b,c,v]) => { const x = chapter(b,c).find(y => y[0]===v); return x ? verseRow(b,c,v,x[1]) : ''; }).join('')}</ul>`
      : `<div class="ws-empty">${owl('happy', 64)}<p><b>Belum ada ayat favorit.</b> Ketuk ayat mana pun saat membaca, lalu pilih “Tandai favorit”.</p></div>`)}`;
}
function verseSheet(ref){
  const [b,c,v] = ref.split(':').map(Number); const x = chapter(b,c).find(y => y[0]===v); if (!x) return;
  const fav = isFav(b,c,v);
  sheet(`<h2 class="sh-h">${esc(bookName(b))} ${c}:${v}</h2>
    <p class="sh-verse">${verseHTML(x[1])}</p>
    <p class="sh-cite">Alkitab Yang Terbuka (AYT)</p>
    <div class="sh-actions">
      <button class="btn-quiet ${fav ? 'on' : ''}" data-favtoggle="${ref}" aria-pressed="${fav}">${ic(fav ? 'starfill' : 'star')}${fav ? 'Hapus dari favorit' : 'Tandai favorit'}</button>
      <button class="btn-text" data-copy="${ref}">${ic('copy')}Salin ayat</button>
    </div>`);
}
async function exportJournal(){
  const dates = Object.keys(S.journal).filter(d => S.journal[d] && S.journal[d].trim()).sort();
  if (!dates.length){ toast('Belum ada jurnal untuk diekspor'); return; }
  let md = `# Jurnal Lentera Malam\n\nDiekspor ${fmtDate(TODAY())}\n`;
  for (const d of dates){
    const ids = (S.data.nights || {})[d] || []; const dv = ids[0] && S.devo[ids[0]];
    md += `\n## ${fmtDate(d)}\n\n${ids.length ? `Bacaan: ${refsOf(ids)}\n` : ''}`;
    if (dv && dv.tema) md += `Tema: ${dv.tema}\n`;
    if (dv && dv.tanya) md += `Pertanyaan: ${dv.tanya}\n`;
    md += `\n${S.journal[d].trim()}\n`;
  }
  const name = `jurnal-lentera-malam-${TODAY()}.md`;
  const file = new File([md], name, { type: 'text/markdown' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] }) && isIOS()) { await navigator.share({ files: [file], title: 'Jurnal Lentera Malam' }); return; }
  } catch(e){ if (e && e.name === 'AbortError') return; }
  const url = URL.createObjectURL(file); const a = document.createElement('a'); a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast('Jurnal diunduh');
}

/* ---------- lini masa, pengantar kitab, sebelumnya, glosarium ---------- */
let LINI = null, GLOS = [], INTRO = {}, introLoading = {};
function eraOf(b, c){
  if (!LINI) return null;
  const m = LINI.era_book[String(b)]; let id = m;
  if (Array.isArray(m)) { id = m[0][1]; for (const [s, e] of m) if (c >= s) id = e; }
  return LINI.eras.find(e => e.id === id) || null;
}
const eraIndex = id => LINI ? LINI.eras.findIndex(e => e.id === id) : -1;
function eraSheet(b, c){
  const e = eraOf(b, c); if (!e) return;
  const note = LINI.era_note[String(b)];
  sheet(`<h2 class="sh-h">${esc(e.n)}</h2><p class="sh-period">${ic('clock')}<span>${esc(e.t)}</span></p>
    <p class="sh-def">${esc(e.d)}</p>${note ? `<p class="sh-note">${esc(note)}</p>` : ''}
    <div class="sh-actions"><button class="btn-quiet" data-go="progres">${ic('chart')}Lihat lini masa lengkap</button></div>`);
}
function loadIntro(b){
  if (INTRO[b] !== undefined || introLoading[b]) return;
  introLoading[b] = true;
  fetch(`/content/kitab/${b}.json`, { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(x => { INTRO[b] = x; }).catch(() => { INTRO[b] = null; }).finally(() => { introLoading[b] = false; render(); });
}
function introHTML(x){
  return `<div class="ib"><p class="ib-lead">${esc(x.ringkas)}</p>
    <dl class="ib-facts"><div><dt>Penulis</dt><dd>${esc(x.penulis)}</dd></div><div><dt>Waktu</dt><dd>${esc(x.waktu)}</dd></div><div><dt>Pembaca pertama</dt><dd>${esc(x.pembaca)}</dd></div></dl>
    <h3 class="ib-h">Tema besar</h3><ul class="ib-list">${x.tema.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
    <h3 class="ib-h">Susunan kitab</h3><dl class="ib-outline">${x.susunan.map(s=>`<div><dt>${esc(s[0])}</dt><dd>${esc(s[1])}</dd></div>`).join('')}</dl>
    <h3 class="ib-h">Tokoh utama</h3><ul class="ib-chips">${x.tokoh.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
    ${x.kunci ? `<figure class="ib-key"><blockquote>${chapter(x.kunci.b,x.kunci.c).filter(v=>x.kunci.v.includes(v[0])).map(v=>verseHTML(v[1])).join(' ')}</blockquote><figcaption>Ayat kunci: ${refText(x.kunci.b,x.kunci.c,x.kunci.v)}</figcaption></figure>` : ''}
    ${x.catatan ? `<p class="ib-note">${x.catatan}</p>` : ''}
    ${x.sumber && x.sumber.length ? `<p class="ib-src">Sumber: ${x.sumber.map(s=>`<a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.t)}</a>`).join(', ')}</p>` : ''}</div>`;
}
function introSheet(b){
  loadIntro(b); const x = INTRO[b];
  sheet(`<h2 class="sh-h">Pengantar ${esc(bookName(b))}</h2>${x ? introHTML(x) : `<p class="sh-def">Pengantar kitab ini sedang disiapkan dan akan muncul sebelum kitab ini mulai dibaca.</p>`}`);
}
function introCards(u){
  const b = u[0]; loadIntro(b); const x = INTRO[b];
  // Bacaan pertama sebuah kitab: tampilkan pengantarnya utuh.
  if (u[1] === 1 && u[2] === 1 && x) return `<section class="rd-sec rd-intro t-sky" aria-labelledby="in${b}"><h2 class="rd-h" id="in${b}">${ic('compass')}Kitab baru: ${esc(bookName(b))}</h2>${introHTML(x)}</section>`;
  return `<button class="btn-quiet" data-intro="${b}">${ic('compass')}Tentang kitab ${esc(bookName(b))}</button>`;
}
function prevCard(u, dv){
  const i = A.q.indexOf(u); let prev = null;
  for (let k = i - 1; k >= 0; k--) if (A.q[k][0] === u[0]) { prev = A.q[k]; break; }
  if (!prev) return '';
  const title = unitTitle(prev);
  return `<section class="rd-sec t-plum" aria-labelledby="prevh">
    <h2 class="rd-h" id="prevh">${ic('rewind')}Sebelumnya di kitab ini</h2>
    <p class="rd-note">${unitRef(prev)}${title ? `: ${title}` : ''}.${S.data.done[uid(prev)] ? '' : ' Bacaan ini masih menunggu di antrean.'}</p>
    ${dv && dv.sebelumnya ? `<div class="rd-prose"><p>${glossLink(esc(dv.sebelumnya))}</p></div>` : ''}
    <button class="btn-quiet" data-unit="${uid(prev)}">${ic('book')}Baca ${unitRef(prev)}</button>
  </section>`;
}
// Sheet berisi satu perikop (untuk membaca ulang bacaan sebelumnya).
function unitSheet(id){
  const u = byId(id); if (!u) return;
  sheet(`<h2 class="sh-h">${unitRef(u)}</h2><div class="rd-verses sh-unit">${unitHTML(u)}</div><p class="sh-cite">Alkitab Yang Terbuka (AYT)</p>`);
}
/* tautan glosarium: setiap istilah hanya ditautkan sekali per tampilan */
let GL_SEEN = new Set(), GL_RE = null;
function glossInit(){
  if (!GLOS.length) return;
  const words = GLOS.filter(g => !['TUHAN','Mazmur'].includes(g.w)).map(g => g.w).sort((a,b) => b.length - a.length).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  GL_RE = new RegExp(`(^|[^A-Za-zÀ-ÿ\\-])(${words.join('|')})(?=$|[^A-Za-zÀ-ÿ\\-])`, 'gi');
}
function glossLink(html){
  if (!GL_RE) return html;
  return html.split(/(<[^>]+>)/).map(part => {
    if (part.startsWith('<')) return part;
    return part.replace(GL_RE, (m, pre, w) => {
      const g = GLOS.find(x => x.w.toLowerCase() === w.toLowerCase());
      if (!g || GL_SEEN.has(g.id)) return m;
      GL_SEEN.add(g.id);
      return `${pre}<button class="gl" data-gl="${g.id}">${w}</button>`;
    });
  }).join('');
}
function glossSheet(id){
  const g = GLOS.find(x => x.id === id); if (!g) return;
  sheet(`<h2 class="sh-h">${esc(g.w)}</h2><p class="sh-def">${esc(g.d)}</p><p class="sh-cite">Istilah dalam glosarium Lentera Malam</p><div class="sh-actions"><button class="btn-text" data-go="cari" data-tabset="istilah">${ic('search')}Lihat semua istilah</button></div>`);
}
function vIstilah(){
  const q = (S.qg || '').toLowerCase();
  const list = GLOS.filter(g => !q || g.w.toLowerCase().includes(q) || g.d.toLowerCase().includes(q)).sort((a,b) => a.w.localeCompare(b.w, 'id'));
  return `<label class="ws-search" for="qg"><span class="sr">Cari istilah</span>${ic('search')}<input id="qg" type="search" autocomplete="off" placeholder="Cari istilah, mis. Sabat" value="${esc(S.qg||'')}"></label>
    <dl class="gl-list" id="glist">${list.map(g => `<div><dt>${esc(g.w)}</dt><dd>${esc(g.d)}</dd></div>`).join('') || '<div class="ws-empty"><p><b>Istilah tidak ditemukan.</b></p></div>'}</dl>
    <p class="ws-foot">Definisi ringkas untuk membantu membaca. Istilah yang bergaris bawah titik-titik di renungan dapat diketuk.</p>`;
}
function timelineHTML(){
  if (!LINI) return '';
  const f = shownPair().first; const cur = f ? eraOf(f[0], f[1]) : null;
  const counts = {}; Object.keys(S.data.done || {}).forEach(id => { const u = byId(id); const e = u && eraOf(u[0], u[1]); if (e) counts[e.id] = (counts[e.id]||0) + 1; });
  return `<section class="ws-panel" aria-labelledby="linh"><h2 class="rd-h t-ember" id="linh">${ic('clock')}Lini masa Alkitab</h2>
    <p class="ac-txt">Tanggal adalah perkiraan; sebagian masih diperdebatkan para ahli. Bacaan Anda berpindah-pindah era karena pola rotasi.</p>
    <ol class="pg-tl">${LINI.eras.map(e => `<li class="${cur && cur.id===e.id ? 'now' : ''}"><span class="pg-tl-dot" aria-hidden="true"></span><div><b>${esc(e.n)}</b><p class="pg-tl-meta"><span>${esc(e.t)}</span>${counts[e.id] ? `<span>${counts[e.id]} bacaan</span>` : ''}${cur && cur.id===e.id ? `<span class="now-tag">Bacaan malam ini</span>` : ''}</p><p>${esc(e.d)}</p></div></li>`).join('')}</ol></section>`;
}

/* ---------- render ---------- */
/* ---------- momen kecil (sekali jalan, tidak terulang saat layar dirender ulang) ---------- */
const lsGet = k => { try { return localStorage.getItem(k); } catch(e){ return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch(e){} };
const FX = new Set();
function fx(){
  const v = cur();
  if (v === 'malam' && !FX.has('malam')){
    const id = uid(shownPair().first); const date = viewKey();
    if (S.devo[id] === undefined || S.devoLoading[id]) return; // tunggu layar stabil
    FX.add('malam');
    // Burung hantu mengintip sekali saat beranda dibuka.
    S.fxPeek = true; const o = document.querySelector('.tn-owl'); if (o) o.classList.add('peek');
    // Bulan bergeser dari fase malam terakhir Anda membuka aplikasi ke fase malam ini.
    const t = TODAY(), last = lsGet('lentera-moon'); lsSet('lentera-moon', t);
    if (date === t && last && last < t && !calm()){
      const gap = Math.min(14, dayDiff(last, t)); let p0 = lunarPhase(addDays(t, -gap)), p1 = lunarPhase(t);
      if (p1 < p0) p1 += 1;
      const t0 = performance.now(), dur = 900 + gap * 120;
      S.moonAnim = { p: p0 % 1 };
      const step = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        S.moonAnim.p = (p0 + (p1 - p0) * e) % 1;
        const el = document.querySelector('.tn .sk-litp'); if (el) el.setAttribute('d', moonLitPath(S.moonAnim.p));
        if (k < 1) requestAnimationFrame(step); else S.moonAnim = null; };
      requestAnimationFrame(step);
    }
  }
  if (v === 'progres' && !FX.has('progres')){
    FX.add('progres');
    const f = new Set(chapterProgress().full);
    const ms = milestones(litNights().length, BIBLE.some((B, i) => B.c.every((_, c) => f.has(i + ':' + (c + 1)))));
    const onIdx = ms.map((x, i) => x.on ? i : -1).filter(i => i >= 0), earned = onIdx.length;
    const seen = Number(lsGet('lentera-stk') || 0); lsSet('lentera-stk', String(earned));
    const t = TODAY(), readToday = streakInfo().litTonight;
    const L = document.querySelector('.pg-lantern'); if (L) { S.fxGlow = true; L.classList.add('glow'); }
    // Satu momen besar saja: stiker baru ditempel, atau bulan malam ini menjadi purnama.
    if (earned > seen && seen >= 0 && lsGet('lentera-stk-init')){ S.fxStick = onIdx[earned - 1]; const li = document.querySelectorAll('.pg-stickers li')[onIdx[earned - 1]]; if (li) li.classList.add('stick'); }
    else if (readToday && lsGet('lentera-wax') !== t){ S.fxWax = true; const li = document.querySelector('.pg-week li.t.r'); if (li) li.classList.add('wax'); }
    if (readToday) lsSet('lentera-wax', t);
    lsSet('lentera-stk-init', '1');
    setTimeout(() => { S.fxStick = null; S.fxWax = false; S.fxGlow = false; }, 2400);
  }
  if (v !== 'progres') FX.delete('progres');
}

function render(){
  renderChrome();
  const app = document.getElementById('app');
  if (!BIBLE || !PLAN || !A) { app.innerHTML = `<div class="loading"><span class="spin"></span>Memuat Alkitab…</div>`; return; }
  if (!S.authChecked) { app.innerHTML = `<div class="loading"><span class="spin"></span>Memeriksa akun…</div>`; return; }
  if (S.recovery) { S.authMode = 'baru'; app.innerHTML = `<div class="view">${vLogin()}</div>`; document.querySelector('nav.bottom').hidden = true; return; }
  // Layanan akun mati tetapi perangkat ini sudah punya bacaan: tetap bisa membaca, sinkron menyusul.
  const localOnly = S.cloudDown && S.data.welcomed;
  if (!S.user.signedIn && !S.data.offline && !localOnly) { app.innerHTML = `<div class="view">${vLogin()}</div>`; document.querySelector('nav.bottom').hidden = true; return; }
  if (!S.data.welcomed) { app.innerHTML = `<div class="view">${vWelcome()}</div>`; document.querySelector('nav.bottom').hidden = true; return; }
  document.querySelector('nav.bottom').hidden = false;
  const openState = {}; app.querySelectorAll('details.chap').forEach((d,i)=>{ openState[i]=d.open; });
  const sameView = app.dataset.v === cur() + viewKey();
  const html = {malam:vMalam, cari:vCari, arsip:vArsip, kaitan:vKaitan, progres:vProgres, akun:vAkun}[cur()]();
  const focusId = document.activeElement && document.activeElement.id;
  app.innerHTML = `<div class="view">${html}</div>`;
  app.dataset.v = cur() + viewKey();
  if (sameView) app.querySelectorAll('details.chap').forEach((d,i)=>{ if (openState[i] !== undefined) d.open = openState[i]; });
  if (focusId === 'qg') { const q = document.getElementById('qg'); if (q){ q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }
  if (focusId === 'q') { const q = document.getElementById('q'); if (q){ q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }
  if (focusId === 'jurnal') { const ta = document.getElementById('jurnal'); if (ta){ ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); } }
  fx();
}

/* ---------- tema ---------- */
const isDark = () => S.data.theme ? S.data.theme==='dark' : matchMedia('(prefers-color-scheme: dark)').matches;
function applyTheme(){
  if (S.data.theme) document.documentElement.setAttribute('data-theme', S.data.theme);
  const d = isDark(); const b = document.getElementById('themeBtn');
  b.innerHTML = ic(d ? 'sun' : 'dark_mode'); b.setAttribute('aria-label', d ? 'Ganti ke tampilan terang' : 'Ganti ke tampilan gelap');
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', bg));
}

function toast(msg){ document.querySelectorAll('.toast').forEach(t=>t.remove()); const t=document.createElement('div'); t.className='toast' + (document.getElementById('layer').innerHTML ? ' top' : ''); t.setAttribute('role','status'); t.setAttribute('aria-live','polite'); t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),4000); }
const flameIcon = n => n >= 30 ? 'lentera3' : n >= 7 ? 'lentera2' : n >= 1 ? 'lentera1' : 'lentera0';
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
/* Signature: satu kunang-kunang terbang dari tombol ke lentera di bilah atas. */
function celebrate(from, date){
  const st = streakInfo(); const nama = (S.data.nama || '').trim().split(/\s+/)[0];
  const msg = S.justMended ? `Lentera Anda menyala penuh lagi. Streak ${S.justMended} malam tersambung kembali.` : `Malam ke-${st.streak}. Selamat tidur${nama ? ', ' + nama : ''}.`;
  const top = document.getElementById('streak');
  setTimeout(() => { if (S.justDone === date) { S.justDone = null; S.justMended = 0; }
    // Setelah perayaan, burung hantu tertidur pelan-pelan.
    const o = document.querySelector('.fin-done .fin-owl'); if (o) { o.innerHTML = owl('asleep', 76); o.classList.add('doze'); }
  }, 2800);
  if (calm() || !top) { const f = document.querySelector('.fin'); if (f) f.scrollIntoView({ block: 'center' }); toast(msg); return; }
  const fin = document.querySelector('.fin-art'); if (fin) fin.closest('.fin').scrollIntoView({ block: 'center' });
  const a = (fin || document.body).getBoundingClientRect(); const b = top.getBoundingClientRect();
  const x0 = (fin ? a.left + a.width / 2 : from.left + from.width / 2), y0 = (fin ? a.top + a.height * .45 : from.top);
  const dx = b.left + 12 - x0, dy = b.top + 14 - y0;
  const f = document.createElement('div'); f.className = 'firefly'; f.style.left = x0 + 'px'; f.style.top = y0 + 'px'; document.body.appendChild(f);
  f.animate([
    { transform: 'translate(0,0) scale(.4)', opacity: 0 },
    { transform: `translate(${dx * .25 - 40}px, ${dy * .3}px) scale(1)`, opacity: 1, offset: .25 },
    { transform: `translate(${dx * .6 + 30}px, ${dy * .65}px) scale(1)`, opacity: 1, offset: .6 },
    { transform: `translate(${dx}px, ${dy}px) scale(.5)`, opacity: .2 }
  ], { duration: 1100, easing: 'cubic-bezier(.2,.8,.2,1)', delay: 450 }).finished.then(() => {
    f.remove(); top.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
    toast(msg);
  }).catch(() => f.remove());
  burst(x0, y0);
}
function burst(x,y){
  const cs=getComputedStyle(document.documentElement); const cols=['--lamp','--plum','--lamp','--cream'].map(v=>cs.getPropertyValue(v).trim());
  for(let i=0;i<10;i++){ const s=document.createElement('div'); s.className='burst';
    s.innerHTML=`<svg width="18" height="18" viewBox="0 0 24 24" fill="${cols[i%4]}"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/></svg>`;
    const a=Math.random()*Math.PI*2, d=60+Math.random()*90; s.style.left=x+'px'; s.style.top=y+'px';
    s.style.setProperty('--dx',Math.cos(a)*d+'px'); s.style.setProperty('--dy',Math.sin(a)*d-40+'px'); document.body.appendChild(s); setTimeout(()=>s.remove(),1100); }
}
/* Sheet: judul jadi label dialog, fokus pindah ke dalam dan kembali ke pemicu saat ditutup. */
let sheetReturn = null;
function sheet(inner){
  sheetReturn = document.activeElement;
  const layer = document.getElementById('layer');
  layer.innerHTML = `<div class="sheet"><div class="panel" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
    <div class="sh-top"><span class="grab" aria-hidden="true"></span><button class="sh-x" data-close="1" aria-label="Tutup">${ic('x')}</button></div>
    <div class="sh-body">${inner}</div></div></div>`;
  const h = layer.querySelector('h2'); if (h) { h.id = 'sheet-title'; h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  const panel = layer.querySelector('.panel'); let y0 = null;
  panel.addEventListener('touchstart', e => { if (panel.scrollTop <= 0) y0 = e.touches[0].clientY; }, { passive: true });
  panel.addEventListener('touchmove', e => { if (y0 === null) return; const dy = e.touches[0].clientY - y0; if (dy > 0) panel.style.transform = `translateY(${dy}px)`; }, { passive: true });
  panel.addEventListener('touchend', e => { if (y0 === null) return; const dy = e.changedTouches[0].clientY - y0; y0 = null; if (dy > 90) closeSheet(); else panel.style.transform = ''; });
}
function closeSheet(){
  const layer = document.getElementById('layer'); if (!layer.innerHTML) return;
  layer.innerHTML = '';
  if (sheetReturn && document.contains(sheetReturn)) sheetReturn.focus({ preventScroll: true });
  sheetReturn = null;
}

/* ---------- interaksi ---------- */
document.getElementById('themeBtn').addEventListener('click', ()=>{ S.data.theme = isDark() ? 'light' : 'dark'; applyTheme(); saveState(); render(); });
let qTimer;
document.addEventListener('input', e => { if (e.target.id === 'qg') { S.qg = e.target.value; render(); return; } if (e.target.id === 'q') { S.q = e.target.value; clearTimeout(qTimer); qTimer = setTimeout(() => { const r = document.getElementById('results'); if (r) r.innerHTML = searchResults(S.q); }, 220); } });
document.addEventListener('input', e => { if (e.target.id === 'jurnal') { const el = document.getElementById('jsaved'); if (el) el.textContent = 'Menyimpan…'; saveJournal(e.target.dataset.date, e.target.value); } });
document.addEventListener('click', e => {
  const t = e.target.closest('button,[data-node],[data-ref],.sheet'); if (!t) return;
  if (t.classList.contains('sheet')) { if (e.target === t) closeSheet(); return; }
  if (t.dataset.close) { closeSheet(); return; }
  if (t.dataset.ref) { verseSheet(t.dataset.ref); return; }
  if (t.dataset.era) { const [b,c] = t.dataset.era.split(':').map(Number); eraSheet(b,c); return; }
  if (t.dataset.intro) { introSheet(+t.dataset.intro); return; }
  if (t.dataset.unit) { unitSheet(t.dataset.unit); return; }
  if (t.dataset.gl) { glossSheet(t.dataset.gl); return; }
  if (t.dataset.favtoggle) { const k = t.dataset.favtoggle; S.data.fav = S.data.fav || {}; if (S.data.fav[k]) delete S.data.fav[k]; else S.data.fav[k] = TODAY(); saveState(); closeSheet(); render(); toast(S.data.fav[k] ? 'Ditandai sebagai favorit' : 'Dihapus dari favorit'); return; }
  if (t.dataset.copy) { const [b,c,v] = t.dataset.copy.split(':').map(Number); const x = chapter(b,c).find(y=>y[0]===v); const txt = `${x[1]} (${bookName(b)} ${c}:${v}, AYT)`;
    navigator.clipboard.writeText(txt).then(()=>toast('Ayat disalin')).catch(()=>toast('Tidak dapat menyalin di tampilan ini')); return; }
  if (t.dataset.tab) { S.tabCari = t.dataset.tab; render(); return; }
  if (t.dataset.bk) { toast(t.getAttribute('aria-label').replace(':', ',') + ' sudah dibaca.'); return; }
  if (t.dataset.wstep) { const n = document.getElementById('nama'); if (n) S.data.nama = n.value.trim(); S.wStep = +t.dataset.wstep; render(); const h = document.querySelector('#app h1'); if (h) { h.setAttribute('tabindex','-1'); h.focus(); } return; }
  if (t.dataset.tabset) S.tabCari = t.dataset.tabset;
  if (t.dataset.go) { closeSheet(); if (t.dataset.go === 'malam') S.viewNight = null; location.hash = t.dataset.go; render(); return; }
  const a = t.dataset.act;
  if (a === 'start') { const n = document.getElementById('nama'); if (n) S.data.nama = n.value.trim(); S.data.welcomed = true; saveState(); render(); return; }
  if (a === 'read') {
    const from = t.getBoundingClientRect(); const id = t.dataset.id; const before = streakInfo();
    S.data = markRead(S.data, A.q, id, TODAY()); saveState();
    const after = streakInfo(); const mended = before.dim && !after.dim ? after.streak : 0;
    if (t.dataset.first) { S.justDone = id; S.justMended = mended; render(); celebrate(from, id); return; }
    render();
    toast(mended ? `Lentera Anda menyala penuh lagi. Streak ${mended} malam tersambung kembali.` : before.owed > after.owed ? `Satu malam dipulihkan. Tinggal ${after.owed} lagi, boleh dilanjutkan besok.` : 'Tercatat. Selamat tidur.');
    return;
  }
  if (a === 'tobaca') { const el = document.getElementById('baca'); if (el) el.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'start' }); return; }
  if (t.dataset.fs) { S.data.fs = Math.max(17, Math.min(21, (S.data.fs || 19) + 2 * Number(t.dataset.fs))); saveState(); render(); return; }
  if (a === 'export') { exportJournal(); return; }
  if (t.dataset.authmode) { S.authMode = t.dataset.authmode; S.authErr = ''; S.authInfo = ''; render(); return; }
  if (a === 'offline') { S.data.offline = true; lsSave(); render(); return; }
  if (a === 'tologin') { S.data.offline = false; lsSave(); render(); return; }
  if (a === 'logout') { logout(); return; }
  if (a === 'reload') { location.reload(); return; }
  if (a === 'push') { enablePush(); return; }
  if (a === 'pushoff' || (a === 'pushtoggle' && S.data.notif)) { S.data.notif = false; saveState(); render(); toast('Notifikasi dimatikan'); return; }
  if (a === 'pushtoggle') { enablePush(); return; }
  if (t.dataset.notifkind) { const k = t.dataset.notifkind; S.data[k] = S.data[k] === false; saveState(); render(); toast(`Pengingat malam ${S.data[k] ? 'dinyalakan' : 'dimatikan'}`); return; }
  if (a === 'today') { S.viewNight = null; render(); window.scrollTo({top:0}); return; }
  if (t.dataset.mode) { S.data.mode = t.dataset.mode; saveState(); render(); return; }
  if (t.dataset.open) { S.viewNight = t.dataset.open; S.mapSel = null; location.hash = 'malam'; render(); window.scrollTo({top:0}); return; }
  if (t.dataset.filter) { S.filter = t.dataset.filter; render(); return; }
  if (t.dataset.maplink != null) { S.mapSel = +t.dataset.maplink; location.hash = 'kaitan'; return; }
  if (t.dataset.node != null) { S.mapSel = +t.dataset.node; render(); return; }
  if (a === 'source') sheet(`<h2 class="sh-h">Sumber bacaan</h2>
      <h3 class="rd-h t-sage">${ic('shield')}Teks Alkitab</h3>
      <p class="sh-def">Alkitab Yang Terbuka (AYT), terjemahan Yayasan Lembaga SABDA (YLSA) dari bahasa asli Ibrani dan Yunani. Teks lengkap 66 kitab diambil dari repositori resmi YLSA, bukan diketik ulang. Penggunaan non-komersial diizinkan dengan mencantumkan sumber.</p>
      <h3 class="rd-h t-plum">${ic('scroll')}Renungan, fakta, dan isu</h3>
      <p class="sh-def">Setiap klaim sejarah, bahasa, dan data isu terkini diperiksa ke sumber yang dicantumkan di bagian “Sumber bacaan”. Renungan ini bahan pribadi dan tidak menggantikan pengajaran gereja.</p>`);});
let nTimer;
document.addEventListener('input', e => { if (e.target.id === 'namaakun') { S.data.nama = e.target.value.trim(); clearTimeout(nTimer); nTimer = setTimeout(saveState, 700); } });
document.addEventListener('submit', e => { if (e.target.id === 'authform') { e.preventDefault(); submitAuth(); } });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSheet();
  if (e.key === 'Tab') { const p = document.querySelector('#layer .panel'); if (p) { const f = [...p.querySelectorAll('button,a[href],input,textarea,[tabindex]')]; const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length-1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } } }
  const r = e.target.closest && e.target.closest('p[data-ref]');
  if (r && (e.key==='Enter'||e.key===' ')) { e.preventDefault(); verseSheet(r.dataset.ref); return; }
  const n = e.target.closest && e.target.closest('[data-node]');
  if (n && (e.key==='Enter'||e.key===' ')) { e.preventDefault(); S.mapSel = +n.dataset.node; render(); }
});
window.addEventListener('hashchange', () => { render(); window.scrollTo(0,0); const h = document.querySelector('#app h1'); if (h) { h.setAttribute('tabindex','-1'); h.focus({ preventScroll: true }); } });
/* Di halaman baca, menu bawah menyingkir saat menggulir ke bawah dan kembali saat menggulir ke atas. */
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY, nav = document.querySelector('nav.bottom');
  if (!nav) return;
  if (cur() !== 'malam' || y < 360 || y < lastY - 4) nav.classList.remove('away');
  else if (y > lastY + 4) nav.classList.add('away');
  lastY = y;
}, { passive: true });

/* ---------- start ---------- */
/* ---------- PWA & notifikasi ---------- */
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
let swReg = null;
async function registerSW(){
  if (!('serviceWorker' in navigator)) return null;
  try { swReg = await navigator.serviceWorker.register('/sw.js'); } catch(e) { swReg = null; }
  return swReg;
}
const b64ToU8 = b => { const p = '='.repeat((4 - b.length % 4) % 4); const r = atob((b + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...r].map(c => c.charCodeAt(0))); };
async function enablePush(){
  if (!S.user.signedIn) { toast('Masuk terlebih dahulu'); return; }
  if (isIOS() && !isStandalone()) { toast('Pasang ke Layar Utama dulu, lalu buka dari ikonnya'); return; }
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) { toast('Perangkat atau peramban ini belum mendukung notifikasi web'); return; }
  S.pushBusy = true; render();
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { toast('Izin notifikasi tidak diberikan'); return; }
    const reg = swReg || await registerSW(); await navigator.serviceWorker.ready;
    const { publicKey } = await fetch('/api/vapid-public').then(r => r.json());
    if (!publicKey) throw new Error('vapid-missing');
    const key = b64ToU8(publicKey);
    let sub = await reg.pushManager.getSubscription();
    // Langganan lama dengan kunci server lain tidak akan pernah menerima notifikasi; buat ulang.
    const old = sub && sub.options && sub.options.applicationServerKey && new Uint8Array(sub.options.applicationServerKey);
    if (old && (old.length !== key.length || old.some((b, i) => b !== key[i]))) { await sub.unsubscribe(); sub = null; }
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    const json = sub.toJSON();
    must(await sb.from('push_subscriptions').upsert({ endpoint: json.endpoint, user_id: S.user.id, subscription: json, user_agent: navigator.userAgent.slice(0, 200) }));
    S.data.notif = true; saveState(); toast('Notifikasi aktif');
  } catch(e) { toast(String(e && e.message).includes('vapid') ? 'Kunci notifikasi server belum diatur (lihat panduan bagian 4.6)' : 'Gagal mengaktifkan notifikasi. Coba lagi.'); }
  finally { S.pushBusy = false; render(); }
}

// Jurnal: versi yang paling baru menang, lalu kirim versi perangkat yang belum ada di cloud.
async function syncJournals(uid){
  const t = d => Date.parse(d || 0) || 0;
  const js = must(await sb.from('journals').select('date,text,updated_at').eq('user_id', uid));
  const cloudAt = {};
  (js.data || []).forEach(x => { cloudAt[x.date] = x.updated_at; if (t(x.updated_at) > t(S.journalAt[x.date])) { S.journal[x.date] = x.text; S.journalAt[x.date] = x.updated_at; } });
  const up = Object.keys(S.journal).filter(d => S.journal[d] && (!cloudAt[d] || t(S.journalAt[d]) > t(cloudAt[d])));
  if (up.length) must(await sb.from('journals').upsert(up.map(d => ({ user_id: uid, date: d, text: S.journal[d], updated_at: S.journalAt[d] || new Date().toISOString() }))));
  lsSave();
}

// Keluar hanya setelah semua data terkirim; kalau gagal, data di perangkat tidak dihapus.
async function logout(){
  const uid = S.user.id;
  saveState(); await writing;
  try { if (uid) await syncJournals(uid); } catch(e) { S.sync = 'local'; }
  if (S.sync !== 'cloud') { toast('Belum semua data tersinkron. Periksa koneksi, lalu coba Keluar lagi.'); return; }
  try { // perangkat ini berhenti menerima pengingat akun yang keluar
    const sub = swReg && await swReg.pushManager.getSubscription();
    if (sub) { await sb.from('push_subscriptions').delete().eq('endpoint', sub.endpoint); await sub.unsubscribe(); }
  } catch(e) {}
  await sb.auth.signOut();
  S.data = { read: {}, fav: {}, mode: 'mendalam', theme: S.data.theme, welcomed: false }; S.journal = {}; S.journalAt = {}; lsSave(); location.hash = ''; render();
}

async function loadCloud(uid){
  try {
    const st = must(await sb.from('user_state').select('data').eq('user_id', uid).maybeSingle());
    const cloud = st.data ? st.data.data : null;
    if (cloud) S.data = upgrade(mergeData(cloud, S.data)); // isi cloud menang untuk pengaturan, bacaan dari keduanya digabung
    await syncJournals(uid);
    S.sync = 'cloud';
    if (S.data.welcomed || Object.keys(S.data.nights || {}).length) saveState(); // kirim juga progres yang dibuat sebelum masuk
    applyTheme();
  } catch(e) { S.sync = 'local'; }
}

(async function init(){
  const local = lsLoad(); if (local) { Object.assign(S.data, local.data || {}); S.journal = local.journal || {}; S.journalAt = local.journalAt || {}; }
  applyTheme(); render();
  registerSW();
  let lastUid = null;
  const onSession = async (event, session) => {
    if (event === 'PASSWORD_RECOVERY') { S.recovery = true; }
    const user = session && session.user;
    if (user) {
      S.user = { id: user.id, email: user.email || '', signedIn: true }; S.data.offline = false;
      if (lastUid !== user.id) { lastUid = user.id; await loadCloud(user.id); }
    } else { lastUid = null; S.user = { id: null, email: '', signedIn: false }; S.sync = 'local'; }
    S.authChecked = true; render();
  };
  sb.auth.onAuthStateChange((event, session) => { setTimeout(() => onSession(event, session), 0); });
  const authTimer = setTimeout(() => { if (!S.authChecked) { S.cloudDown = true; S.authChecked = true; render(); } }, 9000);
  sb.auth.getSession().then(({ data }) => onSession('INITIAL', data && data.session))
    .catch(() => { S.cloudDown = true; S.authChecked = true; render(); }).finally(() => clearTimeout(authTimer));
  // Aplikasi di HP bisa berhari-hari di latar; ambil data terbaru setiap kali dibuka lagi.
  window.addEventListener('online', () => { if (S.user.id && S.sync !== 'cloud') saveState(); }); // coba kirim ulang setelah sinyal kembali
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.user.id) loadCloud(S.user.id).then(render); });
  const [bible, plan, antrean] = await Promise.all(['/data/alkitab.json', '/data/rencana.json', '/data/antrean.json'].map(u => fetch(u).then(r => r.json()))).catch(() => [null, null, null]);
  try { const [l, g] = await Promise.all([fetch('/data/linimasa.json').then(r=>r.json()), fetch('/data/glosarium.json').then(r=>r.json())]); LINI = l; GLOS = g; glossInit(); } catch(e) {}
  BIBLE = bible; PLAN = plan; A = antrean;
  if (A) { UNIT = new Map(A.q.map(u => [uid(u), u])); const before = JSON.stringify(S.data); S.data = upgrade(S.data); if (JSON.stringify(S.data) !== before) saveState(); }
  if (!BIBLE) { document.getElementById('app').innerHTML = `<div class="ws-empty">${owl(navigator.onLine === false ? 'offline' : 'worried', 72)}<p><b>Alkitab gagal dimuat.</b> Periksa koneksi lalu muat ulang halaman.</p></div>`; return; }
  render();
})();
