import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
import { currentStreak } from '/lib/streak.js';

const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });

const ICONS = {moon:'moon', sun:'sun', book:'book-open-text', check:'check-circle', star:'star', starfill:'star-fill', link:'link-simple', chart:'chart-line-up', bell:'bell', flame:'fire', heart:'heart', scroll:'scroll', bulb:'lightbulb', lock:'lock-simple', clock:'clock', shield:'seal-check', skip:'skip-forward', pen:'pencil-simple-line', map:'graph', sparkle:'sparkle', lang:'translate', user:'user-circle', calendar:'calendar-blank', chev:'caret-right', x:'x', close:'x', leaf:'leaf', layers:'stack', cloud:'cloud-check', search:'magnifying-glass', download:'download-simple', copy:'copy', compass:'compass', rewind:'clock-counter-clockwise', dot:'dot', notifications:'bell-ringing', dark_mode:'moon-stars', minus:'minus', plus:'plus', books:'books'};
const ic = n => `<svg class="ms" aria-hidden="true" focusable="false"><use href="#i-${ICONS[n] || n}"/></svg>`;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const P = arr => (arr||[]).map(t=>`<p>${t}</p>`).join('');
// Maskot "Lentera": burung hantu flat dua warna (tanpa gradien), warna lewat token CSS.
function owl(mood = 'sleepy', size = 96){
  const eyes = mood === 'happy'
    ? `<path class="ow-ink-s" d="M37 56 Q46 47 55 56M65 56 Q74 47 83 56"/>`
    : mood === 'awake'
    ? `<circle class="ow-ink" cx="46" cy="55" r="7"/><circle class="ow-ink" cx="74" cy="55" r="7"/><circle class="ow-hi" cx="48.5" cy="52.5" r="2.4"/><circle class="ow-hi" cx="76.5" cy="52.5" r="2.4"/>`
    : `<path class="ow-ink-s" d="M37 54 Q46 61 55 54M65 54 Q74 61 83 54"/>`;
  const extra = mood === 'happy'
    ? `<path class="ow-lamp" d="M104 18l2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2z"/><path class="ow-plum" d="M13 32l1.5 3.4 3.4 1.5-3.4 1.5L13 41.8l-1.5-3.4-3.4-1.5 3.4-1.5z"/>`
    : mood === 'asleep' ? `<text class="ow-z" x="94" y="24">z</text><text class="ow-z ow-z2" x="105" y="12">z</text>` : '';
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
  <g class="ow-lantern"><path class="ow-metal" d="M100 58 v8 M93 66 h14 l-2 4 h-10z M93 86 h14 l-2 3 h-10z"/><rect class="ow-glass" x="94" y="70" width="12" height="16" rx="3"/><circle class="ow-flame" cx="100" cy="78" r="3"/></g>
  <path class="ow-wing" d="M88 76 C92 70 98 70 100 74"/>
  ${extra}
</svg>`;
}

// Lentera kunang-kunang: makin terang seiring jumlah malam yang sudah dibaca (maks. 365).
function lantern(count, size = 120, opts = {}){
  const lv = Math.min(1, count / 365);
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
const START = '2026-11-01';

/* ---------- tanggal ---------- */
const pad = n => String(n).padStart(2,'0');
const isoLocal = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseISO = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); };
const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate()+n); return isoLocal(d); };
const dayDiff = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
const fmtDate = s => { const d = parseISO(s); return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`; };
const fmtShort = s => { const d = parseISO(s); return `${d.getDate()} ${BULAN[d.getMonth()].slice(0,3)}`; };
const TODAY = () => isoLocal(new Date());
const planIndexFor = date => Math.max(0, Math.min(364, dayDiff(START, date)));

/* ---------- state ---------- */
let BIBLE = null, PLAN = null;
const S = {
  view: null, viewDate: null, mapSel: null, filter: 'semua', tabCari: 'cari', q: '',
  user: { id: null, email: '', signedIn: false }, authChecked: false, authMode: 'masuk', authErr: '', authBusy: false,
  data: { read: {}, fav: {}, mode: 'mendalam', theme: null, welcomed: false },
  journal: {}, journalAt: {}, devo: {}, devoLoading: {}, sync: 'local', dbErr: false
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
    S.data = Object.assign({}, cloud, S.data, { read: Object.assign({}, cloud.read, S.data.read) });
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

/* ---------- streak ketat ---------- */
function streakInfo(){
  const dates = new Set(Object.values(S.data.read).map(r => r.on));
  const t = TODAY();
  const cur = currentStreak(dates, t);
  const sorted = [...dates].sort(); let best = 0, run = 0, prev = null;
  for (const x of sorted){ run = (prev && dayDiff(prev, x) === 1) ? run + 1 : 1; best = Math.max(best, run); prev = x; }
  return { cur, best, today: dates.has(t), broken: !dates.has(t) && !dates.has(addDays(t,-1)) && sorted.length > 0 };
}

/* ---------- Alkitab ---------- */
const bookName = b => BIBLE[b].n;
const chapter = (b, c) => BIBLE[b].c[c-1] || [];
function fmtRefs(list){
  const out = [];
  for (const [b,c] of list){ const last = out[out.length-1]; if (last && last[0]===b && last[2]===c-1) last[2]=c; else out.push([b,c,c]); }
  const parts = out.map(([b,s,e]) => `${bookName(b)} ${s}${e!==s?'–'+e:''}`);
  return parts.length > 1 ? parts.slice(0,-1).join(', ') + ' dan ' + parts[parts.length-1] : parts.join('');
}
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
  try { const r = await fetch(`/content/renungan/${date}.json`, { cache: 'no-cache' }); S.devo[date] = r.ok ? await r.json() : null; }
  catch(e){ S.devo[date] = null; }
  clearTimeout(timer); S.devoLoading[date] = false; render();
}

/* ---------- tampilan ---------- */
const VIEWS = [
  {id:'malam', label:'Malam ini', icon:'moon'},
  {id:'cari', label:'Cari', icon:'search'},
  {id:'arsip', label:'Arsip', icon:'check'},
  {id:'progres', label:'Progres', icon:'chart'},
  {id:'akun', label:'Akun', icon:'user'}
];
const cur = () => { const h = location.hash.slice(1); return (VIEWS.some(v=>v.id===h) || h==='kaitan') ? h : 'malam'; };
const greet = () => { const f = (S.data.nama || '').trim().split(/\s+/)[0]; return f ? `Selamat malam, ${esc(f)}` : 'Selamat malam'; };
const head = (title, sub) => `<div class="pagehead"><small>${sub}</small><h1>${title}</h1></div>`;
const viewDate = () => S.viewDate || (TODAY() < START ? START : TODAY());

function renderChrome(){
  const c = cur();
  document.getElementById('nav').innerHTML = VIEWS.map(v => `<button data-go="${v.id}" ${v.id===c?'aria-current="page"':''}>${ic(v.icon)}<span>${v.label}</span></button>`).join('');
  const st = streakInfo();
  const k = Object.keys(S.data.read).length;
  const el = document.getElementById('streak');
  el.innerHTML = `${lantern(k, 22, {cls:'ln-top', id:'t'})}<span>${st.cur}</span>`;
  el.setAttribute('aria-label', `Lentera menyala ${st.cur} malam berturut-turut, berisi ${k} kunang-kunang`);
}

function vLogin(){
  const m = S.authMode;
  return `<div class="welcome">
    <div class="welcomeowl">${owl('awake', 120)}</div>
    <div class="big">${m === 'daftar' ? 'Buat akun Lentera Malam' : m === 'lupa' ? 'Atur ulang kata sandi' : m === 'baru' ? 'Buat kata sandi baru' : 'Masuk ke Lentera Malam'}</div>
    <form class="card c-violet authform" id="authform" novalidate>
      ${S.authInfo ? `<div class="banner">${ic('notifications')}<span>${esc(S.authInfo)}</span></div>` : ''}
      ${m !== 'baru' ? `<label class="small muted" for="email" style="font-weight:700">Email</label>
      <input class="field" id="email" type="email" autocomplete="email" inputmode="email" required placeholder="nama@email.com">` : ''}
      ${m !== 'lupa' ? `<label class="small muted" for="password" style="font-weight:700">Kata sandi</label>
      <input class="field" id="password" type="password" autocomplete="${m === 'daftar' || m === 'baru' ? 'new-password' : 'current-password'}" minlength="6" required placeholder="Minimal 6 karakter">` : ''}
      ${S.authErr ? `<div class="banner warn">${ic('flame')}<span>${esc(S.authErr)}</span></div>` : ''}
      <button class="cta" type="submit" ${S.authBusy ? 'disabled' : ''}>${ic(m === 'lupa' ? 'pen' : 'star')} ${S.authBusy ? 'Memproses…' : m === 'daftar' ? 'Buat akun' : m === 'lupa' ? 'Kirim tautan atur ulang' : m === 'baru' ? 'Simpan kata sandi' : 'Masuk'}</button>
      <div class="authlinks">
        ${m !== 'masuk' ? `<button type="button" data-authmode="masuk">Sudah punya akun? Masuk</button>` : `<button type="button" data-authmode="daftar">Belum punya akun? Daftar</button><button type="button" data-authmode="lupa">Lupa kata sandi</button>`}
      </div>
    </form>
    <button class="ghost" data-act="offline">${ic('lock')} Lanjut tanpa akun (hanya di perangkat ini)</button>
  </div>`;
}
const AUTH_ERR = [[/invalid login credentials/i,'Email atau kata sandi salah.'],[/email not confirmed/i,'Email belum dikonfirmasi. Buka tautan konfirmasi di email Anda.'],[/already registered|already exists/i,'Email ini sudah terdaftar. Silakan masuk.'],[/password should be at least/i,'Kata sandi minimal 6 karakter.'],[/invalid.*email|unable to validate email/i,'Format email tidak valid.'],[/rate limit|too many/i,'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.'],[/fetch|network/i,'Tidak ada koneksi internet.']];
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
  const signed = S.user.signedIn;
  return `<div class="welcome">
    <div class="welcomeowl">${owl('awake', 132)}</div>
    <div class="big">Satu tahun, seluruh Alkitab, satu malam setiap kali.</div>
    <div class="featurelist">
      <div>${ic('book')}<span>Seluruh Alkitab dalam 365 hari, bergantian antarjenis kitab, teks AYT lengkap</span></div>
      <div>${ic('bulb')}<span>Renungan mendalam dengan sumber yang dapat diperiksa</span></div>
      <div>${ic('pen')}<span>Jurnal refleksi pribadi yang tersimpan</span></div>
      <div>${ic('flame')}<span>Streak harian yang ketat untuk melatih disiplin</span></div>
    </div>
    <section class="card">
      ${signed
        ? `<div class="acct"><div class="who"><b>${esc(S.user.email)}</b><small>Progres, jurnal, dan pengaturan tersimpan di akun ini.</small></div></div>`
        : `<p class="prose">Anda memakai mode tanpa akun. Progres hanya tersimpan di perangkat ini.</p>`}
      <label class="small muted" for="nama" style="font-weight:700">Nama panggilan</label>
      <input class="field" id="nama" autocomplete="given-name" placeholder="Mis. Anya" value="${esc(S.data.nama || '')}">
      <button class="cta" data-act="start">${ic('star')} Mulai membaca</button>
    </section>
  </div>`;
}

function readMinutes(day, dv, deep){
  let w = 0; for (const [b,c] of day.r) for (const v of chapter(b,c)) w += v[1].split(/\s+/).length;
  if (dv && typeof dv === 'object') w += [...(deep ? dv.kisah : dv.kisah.slice(0,1)), ...(deep ? dv.hidup : dv.hidup.slice(0,1))].join(' ').split(/\s+/).length;
  return Math.max(5, Math.round(w / 200));
}
function vMalam(){
  GL_SEEN = new Set();
  const PG = arr => (arr||[]).map(t=>`<p>${glossLink(t)}</p>`).join('');
  const date = viewDate(); const idx = planIndexFor(date); const day = PLAN[idx];
  loadDevo(day.t);
  const dv = S.devo[day.t];
  const ok = dv && typeof dv === 'object';
  const deep = S.data.mode === 'mendalam';
  const done = !!S.data.read[day.t];
  const st = streakInfo();
  const isToday = date === TODAY();
  const before = TODAY() < START;
  const fireflies = Object.keys(S.data.read).length;
  const focusVs = ok && dv.fokus ? chapter(dv.fokus.b, dv.fokus.c).filter(v => v[0]>=dv.fokus.v1 && v[0]<=dv.fokus.v2) : [];
  const allRefs = day.r;
  const era = eraOf(day.r[0][0], day.r[0][1]);
  const nama = (S.data.nama || '').trim().split(/\s+/)[0];

  /* ---- Zona Main: kepala malam ini ---- */
  let note = '';
  if (before) note = `<p class="tn-note">${ic('calendar')}<span>Rencana dimulai Minggu, 1 November 2026. Hari 1 boleh dibaca lebih awal; streak dihitung dari hari Anda menandainya.</span></p>`;
  else if (!isToday && date < TODAY()) note = `<p class="tn-note">${ic('clock')}<span>Anda sedang membuka bacaan ${fmtDate(date)}.</span><button class="btn-text" data-act="today">Kembali ke hari ini</button></p>`;
  else if (isToday && !done && st.cur > 0) note = `<p class="tn-note">${lantern(fireflies, 18, {cls:'ln-inline', id:'n'})}<span>Lentera Anda sudah menyala ${st.cur} malam berturut-turut. Malam ini tinggal satu langkah lagi.</span></p>`;
  const title = isToday || before ? (nama ? `Selamat malam, ${esc(nama)}` : 'Selamat malam') : `Bacaan ${fmtShort(day.t)}`;
  const header = `
  <header class="tn">
    <div class="tn-chips">
      <span class="chip-s">Hari ${day.d} dari 365</span>
      <span class="chip-s">${esc(day.g)}</span>
      ${era ? `<button class="chip-s chip-btn" data-era="${day.r[0][0]}:${day.r[0][1]}">${ic('clock')}${esc(era.n)}</button>` : ''}
    </div>
    <div class="tn-owl">${owl(done ? 'asleep' : 'sleepy', 104)}</div>
    <h1 class="tn-hello">${title}</h1>
    <p class="tn-line">${done ? 'Bacaan malam ini sudah selesai. Selamat beristirahat.' : `${isToday || before ? 'Malam ini ' : ''}${fmtRefs(allRefs)}, sekitar ${readMinutes(day, dv, deep)} menit.`}</p>
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

  const focus = ok && dv.fokus ? `
  <section class="rd-focus" aria-labelledby="fokush">
    <h2 class="rd-theme" id="fokush">${esc(dv.tema)}</h2>
    <div class="rd-verses">${focusVs.map(v => `<p data-ref="${dv.fokus.b}:${dv.fokus.c}:${v[0]}" class="${dv.fokus.key.includes(v[0])?'key':''} ${isFav(dv.fokus.b,dv.fokus.c,v[0])?'fav':''}"><sup>${dv.fokus.key.includes(v[0]) ? ic('sparkle') : ''}${v[0]}</sup>${verseHTML(v[1])}</p>`).join('')}</div>
    <p class="rd-ref">${bookName(dv.fokus.b)} ${dv.fokus.c}:${dv.fokus.v1}–${dv.fokus.v2}, ayat fokus (AYT). Ketuk ayat untuk menyimpan atau menyalin.</p>
  </section>` : '';

  const reading = `
  <section class="rd-sec" aria-labelledby="pasalh">
    <h2 class="rd-h" id="pasalh">${ic('book')}Bacaan Alkitab hari ini</h2>
    <p class="rd-note">${allRefs.length} pasal. Ketuk untuk membuka.</p>
    <div class="rd-chaps">${allRefs.map(([b,c]) => `
      <details class="chap" ${deep && allRefs.length===1?'open':''}><summary><span class="nm">${bookName(b)} ${c}</span><small>${chapter(b,c).length} ayat</small><svg class="i chev" aria-hidden="true"><use href="#chev"/></svg></summary>
      <div class="chaptext">${chapterHTML(b,c, ok && dv.fokus && dv.fokus.b===b && dv.fokus.c===c ? dv.fokus.key : null)}</div></details>`).join('')}
    </div>
  </section>`;

  let devo = '', bonus = '';
  if (dv === undefined || S.devoLoading[day.t]) devo = `<div class="rd-skel" aria-label="Memuat renungan" role="status"><i></i><i></i><i></i><i></i></div>`;
  else if (dv === 'timeout') devo = `<div class="rd-empty">${owl('awake', 72)}<p><b>Renungan belum dapat dimuat.</b> Periksa koneksi Anda. Bacaan Alkitab di atas tetap bisa dibaca.</p></div>`;
  else if (!dv) devo = `<div class="rd-empty">${owl('sleepy', 72)}<p><b>Renungan untuk hari ini sedang disiapkan.</b> Renungan ditulis per minggu dan diperbarui setiap Jumat. Sementara itu, bacalah pasal-pasal hari ini dan tuliskan refleksi Anda di bawah.</p></div>`;
  else {
    devo = `
  <section class="rd-sec" aria-labelledby="kisahh">
    <h2 class="rd-h" id="kisahh">${ic('scroll')}Latar kisah</h2>
    <div class="rd-prose">${PG(deep ? dv.kisah : dv.kisah.slice(0,1))}</div>
  </section>
  ${deep ? `<section class="rd-sec" aria-labelledby="katah">
    <h2 class="rd-h" id="katah">${ic('lang')}Telaah kata</h2>
    <dl class="rd-words">${dv.kata.map(k=>`<div><dt><b>${esc(k.w)}</b><span>${esc(k.l)}</span></dt><dd>${glossLink(k.d)}</dd></div>`).join('')}</dl>
  </section>` : ''}
  <section class="rd-sec" aria-labelledby="hiduph">
    <h2 class="rd-h" id="hiduph">${ic('bulb')}Penerapan dalam hidup</h2>
    ${deep && dv.isu ? `<aside class="rd-issue" aria-label="Isu terkini"><p class="rd-issue-k">Isu terkini</p><p class="rd-issue-t">${esc(dv.isu.judul)}</p><p>${glossLink(esc(dv.isu.teks))}</p></aside>` : ''}
    <div class="rd-prose">${PG(deep ? dv.hidup : dv.hidup.slice(0,1))}</div>
  </section>`;
    bonus = `
  <section class="bn-fact" aria-labelledby="faktah">
    <p class="bn-kind">${ic('sparkle')}${esc(dv.fakta.kind)}</p>
    <h2 class="bn-h" id="faktah">${esc(dv.fakta.title)}</h2>
    <p>${glossLink(dv.fakta.text)}</p>
  </section>
  ${deep && dv.kaitan ? `<section class="rd-sec" aria-labelledby="kaitanh">
    <h2 class="rd-h" id="kaitanh">${ic('link')}Ayat yang berkaitan</h2>
    <ol class="rd-links">${dv.kaitan.map((l,i) => `<li>
      <p class="rd-links-ref">${refText(l.b,l.c,l.v)}</p>
      <p class="rd-links-v">${chapter(l.b,l.c).filter(v=>l.v.includes(v[0])).map(v=>verseHTML(v[1])).join(' ')}</p>
      <p class="rd-links-why">${esc(l.why)}</p>
      <button class="btn-text" data-maplink="${i}">${ic('map')}Lihat di peta kaitan</button></li>`).join('')}</ol>
  </section>` : ''}`;
  }

  const journal = `
  <section class="rd-sec journal" aria-labelledby="refh">
    <h2 class="rd-h" id="refh">${ic('pen')}Refleksi malam ini</h2>
    <p class="rd-q">${ok && dv.tanya ? esc(dv.tanya) : 'Ayat atau peristiwa apa dari bacaan hari ini yang paling menyentuh Anda, dan mengapa?'}</p>
    ${ok && dv.coba && deep ? `<p class="rd-try">${ic('check')}<span><b>Langkah konkret:</b> ${esc(dv.coba)}</span></p>` : ''}
    <label class="field-l" for="jurnal">Jurnal ${fmtShort(day.t)}</label>
    <textarea id="jurnal" data-date="${day.t}" placeholder="Tuliskan refleksi Anda di sini…">${esc(S.journal[day.t] || '')}</textarea>
    <p class="saved" id="jsaved" aria-live="polite"></p>
  </section>`;

  const prayer = ok && dv.doa ? `<section class="rd-sec rd-pray" aria-labelledby="doah"><h2 class="rd-h" id="doah">${ic('moon')}Doa sebelum tidur</h2><p class="prayer">${esc(dv.doa)}</p></section>` : '';
  const sources = ok && dv.sumber && dv.sumber.length ? `<section class="rd-sec" aria-labelledby="sumberh"><h2 class="rd-h" id="sumberh">${ic('shield')}Sumber bacaan</h2>
      <ol class="srclist">${dv.sumber.map(s=>`<li><a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.t)}</a></li>`).join('')}</ol></section>` : '';

  /* ---- Signature: lentera kunang-kunang ---- */
  const finish = done ? `
  <section class="fin fin-done ${S.justDone === day.t ? 'just' : ''}" aria-labelledby="finh">
    <div class="fin-art">${lantern(fireflies, 112, {cls:'ln-big', id:'f'})}<div class="fin-owl">${owl(S.justDone === day.t ? 'happy' : 'asleep', 76)}</div></div>
    <h2 class="fin-h" id="finh">${isToday ? `Malam ke-${st.cur}. Selamat tidur${nama ? ', ' + esc(nama) : ''}.` : 'Bacaan ini sudah selesai.'}</h2>
    <p class="fin-p">Ditandai ${fmtShort(S.data.read[day.t].on)}. Lentera Anda kini berisi ${fireflies} kunang-kunang; ${Math.max(0, 365 - fireflies)} lagi sampai akhir tahun.</p>
  </section>` : `
  <section class="fin" aria-labelledby="finh">
    <div class="fin-art">${lantern(fireflies, 112, {cls:'ln-big', id:'f'})}</div>
    <h2 class="fin-h" id="finh">Selesai membaca?</h2>
    <p class="fin-p">Tandai bacaan ini, dan satu kunang-kunang lagi masuk ke lentera Anda.</p>
    <button class="btn-primary" data-act="read" data-date="${day.t}">${ic('check')}Selesai membaca</button>
  </section>`;

  return `${header}
  <article class="rd" id="baca" style="--fs-read:${S.data.fs || 19}px" aria-label="Bacaan dan renungan">
    ${tools}${introCards(day)}${focus}${reading}${prevCard(day, dv)}${devo}${journal}${prayer}
  </article>
  ${finish}
  <div class="bonus">${bonus}${sources}
    <p class="srcnote">${ic('shield')}<span>Teks Alkitab: Alkitab Yang Terbuka (AYT) © YLSA, untuk penggunaan non-komersial.</span><button class="btn-text" data-act="source">Tentang sumber</button></p>
  </div>`;
}

function vArsip(){
  const t = TODAY(); const lastIdx = TODAY() < START ? 0 : planIndexFor(t);
  const rows = PLAN.slice(0, lastIdx+1).map(p => {
    const r = S.data.read[p.t]; const k = r ? 'read' : (p.t === t || TODAY() < START ? 'today' : 'miss');
    return { p, k, r };
  }).reverse();
  const f = S.filter;
  const shown = rows.filter(x => f==='semua' || (f==='sudah' ? x.k==='read' : x.k!=='read'));
  const n = Object.keys(S.data.read).length;
  const nextUp = PLAN.slice(lastIdx+1, lastIdx+4);
  return `${head('Arsip bacaan', 'Buka kembali bacaan dan jurnal lama')}
    <div class="seg" role="group" aria-label="Saring">
      ${['semua','sudah','belum'].map(k=>`<button data-filter="${k}" aria-pressed="${f===k}">${k[0].toUpperCase()+k.slice(1)}</button>`).join('')}
    </div>
    <div class="list">${shown.map(x => `
      <button class="row ${x.k}" data-open="${x.p.t}">
        <div class="tick">${x.k==='read'?ic('check'):x.k==='today'?ic('moon'):ic('x')}</div>
        <div class="meta"><b>Hari ${x.p.d} · ${fmtShort(x.p.t)}</b><small>${fmtRefs(x.p.r)}${S.journal[x.p.t]?' · ada jurnal':''}</small></div>
        <span class="pill ${x.k}">${x.k==='read'?'Sudah':x.k==='today'?'Hari ini':'Terlewat'}</span>
      </button>`).join('') || `<div class="empty"><b>Belum ada bacaan di kategori ini</b></div>`}
    </div>
    ${nextUp.length ? `<section class="card"><h2 style="font-family:var(--serif);font-size:18px">Berikutnya</h2>
      <div class="list">${nextUp.map(p=>`<div class="row todo"><div class="tick">${ic('lock')}</div><div class="meta"><b>Hari ${p.d} · ${fmtShort(p.t)}</b><small>${fmtRefs(p.r)}</small></div></div>`).join('')}</div></section>` : ''}
    <button class="ghost" data-act="export">${ic('download')} Ekspor jurnal (.md)</button>
    <p class="small muted" style="text-align:center">${n} dari 365 hari sudah ditandai. Bacaan yang terlewat tetap dapat dibaca, tetapi tidak memulihkan streak.</p>`;
}

function vKaitan(){
  const date = viewDate(); const day = PLAN[planIndexFor(date)];
  loadDevo(day.t); const dv = S.devo[day.t];
  if (!dv || !dv.kaitan) return `${head('Kaitan antar ayat', fmtDate(day.t))}<section class="card"><div class="empty"><div class="bubble b-lilac">${ic('link')}</div><b>Peta kaitan belum tersedia</b><p class="small">Peta muncul bersama renungan hari ini.</p></div></section>`;
  const cx=170, cy=150, pos=[[62,58],[278,58],[170,262]];
  const sel = S.mapSel; const fk = dv.fokus;
  const lines = dv.kaitan.map((l,i)=>`<path d="M${cx} ${cy} L ${pos[i][0]} ${pos[i][1]}" style="stroke:var(${LINK_COLORS[i]})" stroke-width="3" stroke-dasharray="${sel===i?'0':'7 7'}" fill="none"/>`).join('');
  const nodes = dv.kaitan.map((l,i)=>{ const p=pos[i]; const nm=refText(l.b,l.c,l.v); return `<g class="node ${sel===i?'on':''}" data-node="${i}" tabindex="0" role="button" aria-label="${esc(nm)}">
    <circle cx="${p[0]}" cy="${p[1]}" r="38" fill="transparent"/><circle class="dot" cx="${p[0]}" cy="${p[1]}" r="28" style="fill:var(${LINK_COLORS[i]})"/>
    <use href="#book" x="${p[0]-12}" y="${p[1]-12}" width="24" height="24" style="stroke:var(--on)" fill="none" stroke-width="2"/>
    <text class="maptext" x="${p[0]}" y="${p[1]+46}" text-anchor="middle">${esc(nm)}</text></g>`; }).join('');
  const L = sel==null ? null : dv.kaitan[sel];
  const info = L ? `<article class="relcard" style="--c:var(${LINK_COLORS[sel]})"><div class="rh"><b>${refText(L.b,L.c,L.v)}</b></div><p class="rt">${chapter(L.b,L.c).filter(v=>L.v.includes(v[0])).map(v=>verseHTML(v[1])).join(' ')}</p><p class="why">${ic('link')}<span>${esc(L.why)}</span></p></article>`
    : `<p class="muted">Ketuk salah satu lingkaran untuk membaca ayatnya dan melihat hubungannya dengan ayat fokus.</p>`;
  const fr = `${bookName(fk.b)} ${fk.c}:${fk.v1}-${fk.v2}`;
  return `${head('Kaitan antar ayat', fmtDate(day.t))}
    <div class="mapbox"><svg viewBox="0 0 340 310" role="img" aria-label="Peta kaitan ayat">${lines}
      <circle cx="${cx}" cy="${cy}" r="58" fill="none" style="stroke:var(--moon)" opacity=".35" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="50" style="fill:var(--moon)"/>
      <text x="${cx}" y="${cy-3}" text-anchor="middle" font-family="Literata,serif" font-weight="700" font-size="13" style="fill:var(--on)">${esc(bookName(fk.b))}</text>
      <text x="${cx}" y="${cy+16}" text-anchor="middle" font-family="Literata,serif" font-weight="700" font-size="14" style="fill:var(--on)">${fk.c}:${fk.v1}-${fk.v2}</text>${nodes}</svg></div>
    <section class="card" aria-live="polite">${info}</section>`;
}

function vProgres(){
  const st = streakInfo();
  const readDays = Object.keys(S.data.read);
  const readCh = new Set(); readDays.forEach(t => { const p = PLAN[planIndexFor(t)]; p.r.forEach(([b,c]) => readCh.add(b+':'+c)); });
  const pct = (readCh.size/1189*100);
  const books = BIBLE.map((B,i) => { const tot = B.c.length; let r=0; for (let c=1;c<=tot;c++) if (readCh.has(i+':'+c)) r++; return {n:B.n, a:B.a, r, tot}; });
  const t = TODAY(); const ref = t < START ? START : t; const d0 = parseISO(ref); const y=d0.getFullYear(), m=d0.getMonth();
  const first = new Date(y,m,1).getDay(); const lead = (first+6)%7; const dim = new Date(y,m+1,0).getDate();
  const readOn = new Set(Object.values(S.data.read).map(r=>r.on));
  let cells = ['Sn','Sl','Rb','Km','Jm','Sb','Mg'].map(d=>`<div class="dh">${d}</div>`).join('');
  for (let i=0;i<lead;i++) cells += `<div class="d e"></div>`;
  for (let d=1; d<=dim; d++){ const s = `${y}-${pad(m+1)}-${pad(d)}`; cells += `<div class="d ${readOn.has(s)?'r':''} ${s===t?'t':''}">${readOn.has(s)?'★':d}</div>`; }
  return `${head('Progres bacaan', 'Rencana setahun · 1 Nov 2026 – 31 Okt 2027')}
    <section class="streakhero" aria-label="Streak">
      <h2>Streak</h2><p>Bertambah hanya bila bacaan ditandai setiap malam tanpa terlewat.</p>
      <div class="nums">
        <div><b>${st.cur}</b><small>Saat ini</small></div>
        <div><b>${st.best}</b><small>Terpanjang</small></div>
        <div><b>${readDays.length}</b><small>Hari dibaca</small></div>
      </div>
    </section>
    ${st.broken ? `<div class="banner warn">${ic('flame')}<span><b>Streak terputus.</b> Streak hanya bertambah bila bacaan ditandai pada hari yang sama, tanpa terlewat satu malam pun. Mulailah lagi malam ini.</span></div>` : ''}
    <section class="card">
      <h2 style="font-family:var(--serif);font-size:18px">Seluruh Alkitab</h2>
      <div class="bar" role="progressbar" aria-valuenow="${readCh.size}" aria-valuemin="0" aria-valuemax="1189"><i style="width:${pct}%"></i></div>
      <p class="small muted">${readCh.size} dari 1.189 pasal (${pct.toFixed(1)}%).</p>
      <div class="bookgrid">${books.map(b=>`<div class="bk ${b.r===b.tot?'done':''}" title="${esc(b.n)}: ${b.r}/${b.tot} pasal">${esc(b.a)}${b.r && b.r<b.tot?`<i style="width:${b.r/b.tot*100}%"></i>`:''}</div>`).join('')}</div>
    </section>
    <section class="card"><h2 style="font-family:var(--serif);font-size:18px">${BULAN[m]} ${y}</h2><div class="cal">${cells}</div></section>
    ${timelineHTML()}`;
}

function vAkun(){
  const u = S.user;
  return `${head('Akun & pengaturan', 'Penyimpanan, mode, dan pengingat')}
    <section class="card">
      ${u.signedIn
        ? `<div class="acct"><div class="who"><b>${esc(u.email)}</b><small>Masuk dengan email</small></div></div>
           <span class="status ${S.sync==='cloud'?'ok':'local'}">${ic(S.sync==='cloud'?'cloud':'shield')}${S.sync==='cloud'?'Tersinkron ke akun':'Menyimpan di perangkat'}</span>
           <p class="small muted">Progres, streak, mode bacaan, dan jurnal disimpan secara pribadi di akun ini dan hanya dapat dibaca oleh Anda.</p>
           <button class="ghost" data-act="logout">${ic('close')} Keluar</button>`
        : `<div class="acct"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 56'%3E%3Ccircle cx='28' cy='28' r='28' fill='%23999' opacity='.25'/%3E%3C/svg%3E" alt=""><div class="who"><b>Belum masuk</b><small>Progres tersimpan di peramban ini saja</small></div></div>
           <p class="small muted">Masuk dengan email agar progres tersimpan di akun dan tidak hilang saat cache dihapus atau ganti perangkat.</p>
           <button class="ghost" data-act="tologin">${ic('star')} Masuk atau buat akun</button>`}
    </section>
    <section class="card">
      <label class="small muted" for="namaakun" style="font-weight:700">Nama panggilan untuk sapaan</label>
      <input class="field" id="namaakun" autocomplete="given-name" placeholder="Mis. Anya" value="${esc(S.data.nama || '')}">
    </section>
    <section class="card">
      <h2 style="font-family:var(--serif);font-size:18px">Mode bawaan</h2>
      <div class="modeseg" role="group" aria-label="Mode bawaan">
        <button data-mode="ringkas" aria-pressed="${S.data.mode!=='mendalam'}">${ic('leaf')}Ringkas</button>
        <button data-mode="mendalam" aria-pressed="${S.data.mode==='mendalam'}">${ic('layers')}Mendalam</button>
      </div>
      <p class="small muted">Ringkas: ayat fokus, satu paragraf latar, satu paragraf penerapan, refleksi, dan doa. Mendalam: ditambah telaah kata, isu terkini, ayat berkaitan, dan sumber.</p>
    </section>
    <section class="card c-amber">
      <div class="sechead"><div class="bubble b-moon">${ic('bell')}</div><div><h2>Pengingat malam</h2><small>${S.data.notif ? 'Menyala' : 'Mati'}</small></div></div>
      ${isIOS() && !isStandalone() ? `<div class="banner">${ic('notifications')}<span>Di iPhone, notifikasi hanya bisa aktif setelah aplikasi dipasang: buka di <b>Safari</b> → tombol <b>Bagikan</b> → <b>Tambahkan ke Layar Utama</b>, lalu buka dari ikon itu.</span></div>` : ''}
      ${u.signedIn ? `
      <div class="switchlist">
        <div class="switchrow main"><div><b>Notifikasi</b><small>${S.pushBusy ? 'Memproses…' : S.data.notif ? 'Menyala' : 'Mati'}</small></div>
          <button class="switch" role="switch" aria-checked="${!!S.data.notif}" aria-label="Notifikasi" data-act="pushtoggle" ${S.pushBusy ? 'disabled' : ''}></button></div>
        ${S.data.notif ? `
        <div class="switchrow"><div><b>Pengingat renungan</b><small>Sekitar 21.00–22.00 WIB, bila belum membaca</small></div>
          <button class="switch" role="switch" aria-checked="${S.data.notifMalam !== false}" aria-label="Pengingat renungan" data-notifkind="notifMalam"></button></div>
        <div class="switchrow"><div><b>Peringatan streak</b><small>Sekitar 22.00–23.00 WIB, bila streak hampir putus</small></div>
          <button class="switch" role="switch" aria-checked="${S.data.notifStreak !== false}" aria-label="Peringatan streak" data-notifkind="notifStreak"></button></div>
        <button class="mini" data-act="push">${ic('notifications')} Daftarkan ulang perangkat ini</button>` : ''}
      </div>`
        : `<p class="small muted">Masuk dengan akun terlebih dahulu untuk mengaktifkan notifikasi.</p>`}
    </section>
    <section class="card c-sky">
      <div class="sechead"><div class="bubble b-lilac">${ic('pen')}</div><div><h2>Jurnal</h2><small>${Object.values(S.journal).filter(t=>t&&t.trim()).length} catatan tersimpan</small></div></div>
      <button class="ghost" data-act="export">${ic('download')} Ekspor semua jurnal (.md)</button>
    </section>
    <section class="card">
      <h2 style="font-family:var(--serif);font-size:18px">Sumber teks</h2>
      <p class="small muted">Alkitab Yang Terbuka (AYT) © 2011–2024 Yayasan Lembaga SABDA, diambil dari repositori resmi YLSA (github.com/sabdacode/ayt). Penggunaan non-komersial diizinkan dengan mencantumkan sumber. Penomoran ayat disesuaikan dengan Alkitab TB: kitab Mazmur memakai penomoran Ibrani (judul mazmur dihitung sebagai ayat 1), begitu pula 3 Yohanes 1:15 dan Wahyu 12:18, berdasarkan penanda penomoran asli yang disertakan AYT.</p>
    </section>`;
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
const verseRow = (b,c,v,t,hl) => `<button class="vrow ${isFav(b,c,v)?'fav':''}" data-ref="${b}:${c}:${v}"><b>${esc(bookName(b))} ${c}:${v}</b><span>${hl ? hl(t) : verseHTML(t)}</span></button>`;
function searchResults(q){
  q = (q||'').trim();
  if (!q) return `<div class="empty"><div class="bubble b-lilac">${ic('search')}</div><b>Cari ayat atau kata</b><p class="small">Contoh: <em>Yoh 3:16</em>, <em>Mazmur 23</em>, <em>Roma 8:28-30</em>, atau kata seperti <em>damai sejahtera</em>.</p></div>`;
  const ref = parseRef(q);
  if (ref){
    const ch = chapter(ref.b, ref.c).filter(v => ref.v1 == null || (v[0] >= ref.v1 && v[0] <= ref.v2));
    if (!ch.length) return `<div class="empty"><b>Ayat tidak ditemukan</b><p class="small">${esc(bookName(ref.b))} ${ref.c} memiliki ${chapter(ref.b,ref.c).length} ayat.</p></div>`;
    return `<p class="small muted">${esc(bookName(ref.b))} ${ref.c}${ref.v1?':'+ref.v1+(ref.v2!==ref.v1?'-'+ref.v2:''):''} · ketuk ayat untuk menandai favorit</p><div class="vlist">${ch.map(v => verseRow(ref.b, ref.c, v[0], v[1])).join('')}</div>`;
  }
  if (q.length < 3) return `<p class="small muted">Ketik minimal 3 huruf untuk mencari kata.</p>`;
  const needle = q.toLowerCase(); const out = []; let total = 0;
  for (let b = 0; b < BIBLE.length; b++) for (let c = 0; c < BIBLE[b].c.length; c++) for (const v of BIBLE[b].c[c]){
    if (v[1].toLowerCase().includes(needle)){ total++; if (out.length < 100) out.push([b, c+1, v[0], v[1]]); }
  }
  if (!total) return `<div class="empty"><b>Tidak ada hasil untuk “${esc(q)}”</b><p class="small">Coba kata lain atau periksa ejaannya.</p></div>`;
  const re = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const hl = t => esc(t).replace(re, m => `<mark>${m}</mark>`);
  return `<p class="small muted">${total.toLocaleString('id-ID')} ayat ditemukan${total > 100 ? ', menampilkan 100 pertama' : ''}.</p><div class="vlist">${out.map(r => verseRow(r[0], r[1], r[2], r[3], hl)).join('')}</div>`;
}
function vCari(){
  const favs = Object.keys(S.data.fav || {}).map(k => k.split(':').map(Number)).sort((x,y) => x[0]-y[0] || x[1]-y[1] || x[2]-y[2]);
  const tab = S.tabCari;
  return `${head(tab === 'cari' ? 'Cari ayat' : tab === 'istilah' ? 'Glosarium istilah' : 'Ayat favorit', 'Teks AYT · penomoran TB')}
    <div class="seg" role="group" aria-label="Pilih">
      <button data-tab="cari" aria-pressed="${tab==='cari'}">Cari</button>
      <button data-tab="favorit" aria-pressed="${tab==='favorit'}">Favorit (${favs.length})</button>
      <button data-tab="istilah" aria-pressed="${tab==='istilah'}">Istilah</button>
    </div>
    ${tab === 'istilah' ? vIstilah() : tab === 'cari' ? `
      <label class="searchbox" for="q">${ic('search')}<input id="q" type="search" inputmode="search" autocomplete="off" placeholder="Yoh 3:16 atau kata kunci" value="${esc(S.q)}"></label>
      <div id="results">${searchResults(S.q)}</div>`
    : (favs.length ? `<p class="small muted">Ketuk ayat untuk menyalin atau menghapus dari favorit.</p><div class="vlist">${favs.map(([b,c,v]) => { const x = chapter(b,c).find(y => y[0]===v); return x ? verseRow(b,c,v,x[1]) : ''; }).join('')}</div>`
      : `<div class="empty"><div class="bubble b-pink">${ic('star')}</div><b>Belum ada ayat favorit</b><p class="small">Ketuk ayat mana pun saat membaca, lalu pilih “Tandai favorit”.</p></div>`)}`;
}
function verseSheet(ref){
  const [b,c,v] = ref.split(':').map(Number); const x = chapter(b,c).find(y => y[0]===v); if (!x) return;
  const fav = isFav(b,c,v);
  sheet(`<h2>${esc(bookName(b))} ${c}:${v}</h2>
    <p class="prose" style="font-family:var(--serif);font-size:18px;line-height:1.6;color:var(--ink)">${verseHTML(x[1])}</p>
    <button class="cta ${fav?'done':''}" data-favtoggle="${ref}">${ic('star')} ${fav ? 'Hapus dari favorit' : 'Tandai favorit'}</button>
    <button class="ghost" data-copy="${ref}">${ic('copy')} Salin ayat</button>`);
}
async function exportJournal(){
  const dates = Object.keys(S.journal).filter(d => S.journal[d] && S.journal[d].trim()).sort();
  if (!dates.length){ toast('Belum ada jurnal untuk diekspor'); return; }
  let md = `# Jurnal Lentera Malam\n\nDiekspor ${fmtDate(TODAY())}\n`;
  for (const d of dates){
    const p = PLAN[planIndexFor(d)]; const dv = S.devo[d];
    md += `\n## Hari ${p.d} · ${fmtDate(d)}\n\nBacaan: ${fmtRefs(p.r)}\n`;
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
  sheet(`<h2>${esc(e.n)}</h2><span class="daypill" style="align-self:flex-start">${esc(e.t)}</span>
    <p class="prose">${esc(e.d)}</p>${note ? `<div class="banner">${ic('clock')}<span>${esc(note)}</span></div>` : ''}
    <button class="ghost" data-go="progres">${ic('chart')} Lihat lini masa lengkap</button>`);
}
const firstDayOfBook = b => { for (const p of PLAN) if (p.r.some(x => x[0] === b)) return p.d; return null; };
function loadIntro(b){
  if (INTRO[b] !== undefined || introLoading[b]) return;
  introLoading[b] = true;
  fetch(`/content/kitab/${b}.json`, { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(x => { INTRO[b] = x; }).catch(() => { INTRO[b] = null; }).finally(() => { introLoading[b] = false; render(); });
}
function introHTML(x){
  return `<p class="prose" style="font-family:var(--serif);font-size:17px;color:var(--ink)">${esc(x.ringkas)}</p>
    <dl class="facts"><dt>Penulis</dt><dd>${esc(x.penulis)}</dd><dt>Waktu</dt><dd>${esc(x.waktu)}</dd><dt>Pembaca pertama</dt><dd>${esc(x.pembaca)}</dd></dl>
    <h3 class="mini-h">Tema besar</h3><ul class="dots">${x.tema.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
    <h3 class="mini-h">Susunan kitab</h3><div class="outline">${x.susunan.map(s=>`<div><b>${esc(s[0])}</b><span>${esc(s[1])}</span></div>`).join('')}</div>
    <h3 class="mini-h">Tokoh utama</h3><div class="chips">${x.tokoh.map(t=>`<span class="chip">${esc(t)}</span>`).join('')}</div>
    ${x.kunci ? `<div class="try">${ic('book')}<span><b>Ayat kunci ${refText(x.kunci.b,x.kunci.c,x.kunci.v)}:</b> ${chapter(x.kunci.b,x.kunci.c).filter(v=>x.kunci.v.includes(v[0])).map(v=>verseHTML(v[1])).join(' ')}</span></div>` : ''}
    ${x.catatan ? `<p class="small muted">${x.catatan}</p>` : ''}
    ${x.sumber && x.sumber.length ? `<p class="small muted">Sumber: ${x.sumber.map(s=>`<a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.t)}</a>`).join(', ')}</p>` : ''}`;
}
function introSheet(b){
  loadIntro(b); const x = INTRO[b];
  sheet(`<h2>Pengantar ${esc(bookName(b))}</h2>${x ? introHTML(x) : `<p class="prose">Pengantar kitab ini sedang disiapkan dan akan muncul sebelum kitab ini mulai dibaca.</p>`}`);
}
function introCards(day){
  const books = [...new Set(day.r.map(x => x[0]))];
  return books.map(b => {
    loadIntro(b);
    const isFirst = firstDayOfBook(b) === day.d; const x = INTRO[b];
    if (isFirst && x) return `<section class="rd-sec rd-intro" aria-labelledby="in${b}"><h2 class="rd-h" id="in${b}">${ic('compass')}Kitab baru: ${esc(bookName(b))}</h2>${introHTML(x)}</section>`;
    return `<button class="btn-quiet" data-intro="${b}">${ic('compass')}Tentang kitab ${esc(bookName(b))}</button>`;
  }).join('');
}
function prevCard(day, dv){
  const b = day.r[0][0];
  let prev = null; for (let i = day.d - 2; i >= 0; i--) if (PLAN[i].r.some(x => x[0] === b)) { prev = PLAN[i]; break; }
  if (!prev) return '';
  const chs = prev.r.filter(x => x[0] === b);
  const titles = chs.flatMap(([bb,c]) => chapter(bb,c).filter(v => v[2]).map(v => titleHTML(v[2])));
  const read = S.data.read[prev.t];
  return `<section class="rd-sec" aria-labelledby="prevh">
    <h2 class="rd-h" id="prevh">${ic('rewind')}Sebelumnya di kitab ini</h2>
    <p class="rd-note">Hari ${prev.d}, ${fmtShort(prev.t)}: ${fmtRefs(chs)}.${read ? '' : ' Belum dibaca, bisa disusul kapan saja.'}</p>
    ${dv && dv.sebelumnya ? `<div class="rd-prose"><p>${glossLink(esc(dv.sebelumnya))}</p></div>` : ''}
    ${titles.length ? `<ul class="rd-outline">${titles.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
    <button class="btn-quiet" data-open="${prev.t}">${ic('book')}Buka bacaan Hari ${prev.d}</button>
  </section>`;
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
  sheet(`<h2>${esc(g.w)}</h2><p class="prose">${esc(g.d)}</p><button class="ghost" data-go="cari" data-tabset="istilah">${ic('search')} Lihat semua istilah</button>`);
}
function vIstilah(){
  const q = (S.qg || '').toLowerCase();
  const list = GLOS.filter(g => !q || g.w.toLowerCase().includes(q) || g.d.toLowerCase().includes(q)).sort((a,b) => a.w.localeCompare(b.w, 'id'));
  return `<label class="searchbox" for="qg">${ic('search')}<input id="qg" type="search" autocomplete="off" placeholder="Cari istilah, mis. Sabat" value="${esc(S.qg||'')}"></label>
    <div class="vlist" id="glist">${list.map(g => `<div class="vrow"><b style="font-family:var(--serif);font-size:17px;color:var(--ink)">${esc(g.w)}</b><span style="font-family:var(--sans);font-size:15px;color:var(--soft)">${esc(g.d)}</span></div>`).join('') || '<div class="empty"><b>Istilah tidak ditemukan</b></div>'}</div>
    <p class="small muted">Definisi ringkas untuk membantu membaca. Istilah yang bergaris bawah titik-titik di renungan dapat diketuk.</p>`;
}
function timelineHTML(){
  if (!LINI) return '';
  const t = TODAY() < START ? START : TODAY(); const cur = eraOf(...PLAN[planIndexFor(t)].r[0]);
  const counts = {}; Object.keys(S.data.read).forEach(d => { const e = eraOf(...PLAN[planIndexFor(d)].r[0]); if (e) counts[e.id] = (counts[e.id]||0) + 1; });
  return `<section class="card"><h2 style="font-family:var(--serif);font-size:18px">Lini masa Alkitab</h2>
    <p class="small muted">Tanggal adalah perkiraan; sebagian masih diperdebatkan para ahli. Bacaan Anda berpindah-pindah era karena pola rotasi.</p>
    <ol class="timeline">${LINI.eras.map(e => `<li class="${cur && cur.id===e.id ? 'now' : ''}"><span class="tdot"></span><div><b>${esc(e.n)}</b><small>${esc(e.t)}${counts[e.id] ? ` · ${counts[e.id]} hari dibaca` : ''}${cur && cur.id===e.id ? ' · bacaan hari ini' : ''}</small><p>${esc(e.d)}</p></div></li>`).join('')}</ol></section>`;
}

/* ---------- render ---------- */
function render(){
  renderChrome();
  const app = document.getElementById('app');
  if (!BIBLE || !PLAN) { app.innerHTML = `<div class="loading"><span class="spin"></span>Memuat Alkitab…</div>`; return; }
  if (!S.authChecked) { app.innerHTML = `<div class="loading"><span class="spin"></span>Memeriksa akun…</div>`; return; }
  if (S.recovery) { S.authMode = 'baru'; app.innerHTML = `<div class="view">${vLogin()}</div>`; document.querySelector('nav.bottom').hidden = true; return; }
  if (!S.user.signedIn && !S.data.offline) { app.innerHTML = `<div class="view">${vLogin()}</div>`; document.querySelector('nav.bottom').hidden = true; return; }
  if (!S.data.welcomed) { app.innerHTML = `<div class="view">${vWelcome()}</div>`; document.querySelector('nav.bottom').hidden = true; return; }
  document.querySelector('nav.bottom').hidden = false;
  const openState = {}; app.querySelectorAll('details.chap').forEach((d,i)=>{ openState[i]=d.open; });
  const sameView = app.dataset.v === cur() + viewDate();
  const html = {malam:vMalam, cari:vCari, arsip:vArsip, kaitan:vKaitan, progres:vProgres, akun:vAkun}[cur()]();
  const focusId = document.activeElement && document.activeElement.id;
  app.innerHTML = `<div class="view">${html}</div>`;
  app.dataset.v = cur() + viewDate();
  if (sameView) app.querySelectorAll('details.chap').forEach((d,i)=>{ if (openState[i] !== undefined) d.open = openState[i]; });
  if (focusId === 'qg') { const q = document.getElementById('qg'); if (q){ q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }
  if (focusId === 'q') { const q = document.getElementById('q'); if (q){ q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }
  if (focusId === 'jurnal') { const ta = document.getElementById('jurnal'); if (ta){ ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); } }
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

function toast(msg){ document.querySelectorAll('.toast').forEach(t=>t.remove()); const t=document.createElement('div'); t.className='toast'; t.setAttribute('role','status'); t.setAttribute('aria-live','polite'); t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),4000); }
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
/* Signature: satu kunang-kunang terbang dari tombol ke lentera di bilah atas. */
function celebrate(from, date){
  const st = streakInfo(); const nama = (S.data.nama || '').trim().split(/\s+/)[0];
  const msg = date === TODAY() ? `Malam ke-${st.cur}. Selamat tidur${nama ? ', ' + nama : ''}.` : 'Tercatat. Terima kasih sudah menyusul bacaan ini.';
  const top = document.getElementById('streak');
  setTimeout(() => { if (S.justDone === date) { S.justDone = null; } }, 2600);
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
function sheet(inner){ document.getElementById('layer').innerHTML=`<div class="sheet"><div class="panel" role="dialog" aria-modal="true"><div class="grab"></div>${inner}<button class="cta" data-close="1">Tutup</button></div></div>`; }

/* ---------- interaksi ---------- */
document.getElementById('themeBtn').addEventListener('click', ()=>{ S.data.theme = isDark() ? 'light' : 'dark'; applyTheme(); saveState(); render(); });
let qTimer;
document.addEventListener('input', e => { if (e.target.id === 'qg') { S.qg = e.target.value; render(); return; } if (e.target.id === 'q') { S.q = e.target.value; clearTimeout(qTimer); qTimer = setTimeout(() => { const r = document.getElementById('results'); if (r) r.innerHTML = searchResults(S.q); }, 220); } });
document.addEventListener('input', e => { if (e.target.id === 'jurnal') { const el = document.getElementById('jsaved'); if (el) el.textContent = 'Menyimpan…'; saveJournal(e.target.dataset.date, e.target.value); } });
document.addEventListener('click', e => {
  const t = e.target.closest('button,[data-node],[data-ref],.sheet'); if (!t) return;
  if (t.classList.contains('sheet')) { if (e.target === t) document.getElementById('layer').innerHTML=''; return; }
  if (t.dataset.close) { document.getElementById('layer').innerHTML=''; return; }
  if (t.dataset.ref) { verseSheet(t.dataset.ref); return; }
  if (t.dataset.era) { const [b,c] = t.dataset.era.split(':').map(Number); eraSheet(b,c); return; }
  if (t.dataset.intro) { introSheet(+t.dataset.intro); return; }
  if (t.dataset.gl) { glossSheet(t.dataset.gl); return; }
  if (t.dataset.favtoggle) { const k = t.dataset.favtoggle; S.data.fav = S.data.fav || {}; if (S.data.fav[k]) delete S.data.fav[k]; else S.data.fav[k] = TODAY(); saveState(); document.getElementById('layer').innerHTML=''; render(); toast(S.data.fav[k] ? 'Ditandai sebagai favorit' : 'Dihapus dari favorit'); return; }
  if (t.dataset.copy) { const [b,c,v] = t.dataset.copy.split(':').map(Number); const x = chapter(b,c).find(y=>y[0]===v); const txt = `${x[1]} (${bookName(b)} ${c}:${v}, AYT)`;
    navigator.clipboard.writeText(txt).then(()=>toast('Ayat disalin')).catch(()=>toast('Tidak dapat menyalin di tampilan ini')); return; }
  if (t.dataset.tab) { S.tabCari = t.dataset.tab; render(); return; }
  if (t.dataset.tabset) S.tabCari = t.dataset.tabset;
  if (t.dataset.go) { document.getElementById('layer').innerHTML=''; if (t.dataset.go === 'malam') S.viewDate = null; location.hash = t.dataset.go; render(); return; }
  const a = t.dataset.act;
  if (a === 'start') { const n = document.getElementById('nama'); if (n) S.data.nama = n.value.trim(); S.data.welcomed = true; saveState(); render(); return; }
  if (a === 'read') {
    const from = t.getBoundingClientRect(); const date = t.dataset.date;
    S.data.read[date] = { on: TODAY(), at: new Date().toISOString() }; S.justDone = date; saveState(); render();
    celebrate(from, date); return;
  }
  if (a === 'tobaca') { const el = document.getElementById('baca'); if (el) el.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'start' }); return; }
  if (t.dataset.fs) { S.data.fs = Math.max(17, Math.min(21, (S.data.fs || 19) + 2 * Number(t.dataset.fs))); saveState(); render(); return; }
  if (a === 'export') { exportJournal(); return; }
  if (t.dataset.authmode) { S.authMode = t.dataset.authmode; S.authErr = ''; S.authInfo = ''; render(); return; }
  if (a === 'offline') { S.data.offline = true; lsSave(); render(); return; }
  if (a === 'tologin') { S.data.offline = false; lsSave(); render(); return; }
  if (a === 'logout') { logout(); return; }
  if (a === 'push') { enablePush(); return; }
  if (a === 'pushoff' || (a === 'pushtoggle' && S.data.notif)) { S.data.notif = false; saveState(); render(); toast('Notifikasi dimatikan'); return; }
  if (a === 'pushtoggle') { enablePush(); return; }
  if (t.dataset.notifkind) { const k = t.dataset.notifkind; S.data[k] = S.data[k] === false; saveState(); render(); toast(`${k === 'notifMalam' ? 'Pengingat renungan' : 'Peringatan streak'} ${S.data[k] ? 'dinyalakan' : 'dimatikan'}`); return; }
  if (a === 'today') { S.viewDate = null; render(); window.scrollTo({top:0}); return; }
  if (t.dataset.mode) { S.data.mode = t.dataset.mode; saveState(); render(); return; }
  if (t.dataset.open) { S.viewDate = t.dataset.open; S.mapSel = null; location.hash = 'malam'; render(); window.scrollTo({top:0}); return; }
  if (t.dataset.filter) { S.filter = t.dataset.filter; render(); return; }
  if (t.dataset.maplink != null) { S.mapSel = +t.dataset.maplink; location.hash = 'kaitan'; return; }
  if (t.dataset.node != null) { S.mapSel = +t.dataset.node; render(); return; }
  if (a === 'source') sheet(`<h2>Sumber bacaan</h2>
      <div class="sechead"><div class="bubble b-mint">${ic('shield')}</div><div><h2 style="font-size:17px">Teks Alkitab</h2><small>Alkitab Yang Terbuka (AYT)</small></div></div>
      <p class="prose">Terjemahan Yayasan Lembaga SABDA (YLSA) dari bahasa asli Ibrani dan Yunani. Teks lengkap 66 kitab diambil dari repositori resmi YLSA, bukan diketik ulang. Penggunaan non-komersial diizinkan dengan mencantumkan sumber.</p>
      <div class="sechead"><div class="bubble b-pink">${ic('scroll')}</div><div><h2 style="font-size:17px">Renungan, fakta, dan isu</h2></div></div>
      <p class="prose">Setiap klaim sejarah, bahasa, dan data isu terkini diperiksa ke sumber yang dicantumkan di bagian “Sumber bacaan”. Renungan ini bahan pribadi dan tidak menggantikan pengajaran gereja.</p>`);
});
let nTimer;
document.addEventListener('input', e => { if (e.target.id === 'namaakun') { S.data.nama = e.target.value.trim(); clearTimeout(nTimer); nTimer = setTimeout(saveState, 700); } });
document.addEventListener('submit', e => { if (e.target.id === 'authform') { e.preventDefault(); submitAuth(); } });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.getElementById('layer').innerHTML='';
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
    if (cloud) { const localRead = S.data.read; S.data = Object.assign({}, S.data, cloud); S.data.read = Object.assign({}, localRead, cloud.read || {}); }
    await syncJournals(uid);
    S.sync = 'cloud';
    if (S.data.welcomed || Object.keys(S.data.read).length) saveState(); // kirim juga progres yang dibuat sebelum masuk
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
  sb.auth.getSession().then(({ data }) => onSession('INITIAL', data.session));
  // Aplikasi di HP bisa berhari-hari di latar; ambil data terbaru setiap kali dibuka lagi.
  window.addEventListener('online', () => { if (S.user.id && S.sync !== 'cloud') saveState(); }); // coba kirim ulang setelah sinyal kembali
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.user.id) loadCloud(S.user.id).then(render); });
  const [bible, plan] = await Promise.all([fetch('/data/alkitab.json').then(r=>r.json()), fetch('/data/rencana.json').then(r=>r.json())]).catch(()=>[null,null]);
  try { const [l, g] = await Promise.all([fetch('/data/linimasa.json').then(r=>r.json()), fetch('/data/glosarium.json').then(r=>r.json())]); LINI = l; GLOS = g; glossInit(); } catch(e) {}
  BIBLE = bible; PLAN = plan;
  if (!BIBLE) { document.getElementById('app').innerHTML = `<div class="empty"><b>Alkitab gagal dimuat</b><p class="small">Periksa koneksi lalu muat ulang.</p></div>`; return; }
  render();
})();
