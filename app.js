import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });

const ICONS = {"moon": "bedtime", "sun": "light_mode", "book": "menu_book", "check": "task_alt", "star": "star", "link": "hub", "chart": "insights", "bell": "notifications", "flame": "local_fire_department", "heart": "favorite", "scroll": "history_edu", "bulb": "lightbulb", "lock": "lock", "clock": "schedule", "shield": "verified", "skip": "skip_next", "pen": "edit_note", "map": "hub", "sparkle": "tips_and_updates", "lang": "translate", "user": "account_circle", "calendar": "calendar_month", "chev": "chevron_right", "x": "close", "leaf": "notes", "layers": "layers", "cloud": "cloud_done", "search": "search", "download": "download", "copy": "content_copy", "compass": "explore", "rewind": "history", "dot": "fiber_manual_record"};
const ic = n => `<span class="ms" aria-hidden="true">${ICONS[n] || n}</span>`;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const P = arr => (arr||[]).map(t=>`<p>${t}</p>`).join('');
const SHEEP = '';
let OWL_N = 0;
function owl(mood = 'sleepy', size = 96){
  const k = 'ow' + (OWL_N++);
  const eyes = mood === 'happy'
    ? `<path d="M38 55 Q46 47 54 55" stroke="#2A1F5C" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M66 55 Q74 47 82 55" stroke="#2A1F5C" stroke-width="3.6" fill="none" stroke-linecap="round"/>`
    : mood === 'awake'
    ? `<circle cx="46" cy="54" r="7.5" fill="#2A1F5C"/><circle cx="74" cy="54" r="7.5" fill="#2A1F5C"/><circle cx="48.5" cy="51" r="2.6" fill="#fff"/><circle cx="76.5" cy="51" r="2.6" fill="#fff"/>`
    : `<path d="M37 54 Q46 61 55 54" stroke="#2A1F5C" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M65 54 Q74 61 83 54" stroke="#2A1F5C" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
  const extra = mood === 'happy'
    ? `<path d="M102 20l2.4 5.6 5.6 2.4-5.6 2.4-2.4 5.6-2.4-5.6-5.6-2.4 5.6-2.4z" fill="#FFC247"/><path d="M14 30l1.6 3.8 3.8 1.6-3.8 1.6-1.6 3.8-1.6-3.8-3.8-1.6 3.8-1.6z" fill="#FF8FB8"/>`
    : mood === 'sleepy' ? `<text x="92" y="22" font-family="Plus Jakarta Sans,sans-serif" font-weight="800" font-size="15" fill="#9B87FF">z</text><text x="103" y="10" font-family="Plus Jakarta Sans,sans-serif" font-weight="800" font-size="11" fill="#9B87FF">z</text>` : '';
  return `<svg class="owl" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
  <defs>
    <linearGradient id="${k}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8E7BFF"/><stop offset="1" stop-color="#5A45D6"/></linearGradient>
    <linearGradient id="${k}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E58E8"/><stop offset="1" stop-color="#3F2DAE"/></linearGradient>
    <radialGradient id="${k}g" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFD66B" stop-opacity=".95"/><stop offset="1" stop-color="#FFB020" stop-opacity="0"/></radialGradient>
  </defs>
  <circle cx="100" cy="86" r="22" fill="url(#${k}g)"/>
  <path d="M28 34 L33 12 L47 28 Z" fill="#5A45D6"/><path d="M92 34 L87 12 L73 28 Z" fill="#5A45D6"/>
  <path d="M60 20 C89 20 98 44 98 68 C98 94 82 110 60 110 C38 110 22 94 22 68 C22 44 31 20 60 20Z" fill="url(#${k}b)"/>
  <path d="M24 66 C14 78 18 96 32 102 C30 88 32 76 36 68Z" fill="url(#${k}w)"/>
  <path d="M96 66 C102 74 102 84 98 90 L90 76Z" fill="url(#${k}w)"/>
  <ellipse cx="60" cy="84" rx="24" ry="22" fill="#FFE9C7"/>
  <path d="M48 78 q4 4 8 0 M60 78 q4 4 8 0 M52 88 q4 4 8 0 M64 88 q4 4 8 0" stroke="#F3C58A" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="46" cy="54" r="15" fill="#FFF6EA"/><circle cx="74" cy="54" r="15" fill="#FFF6EA"/>
  ${eyes}
  <ellipse cx="36" cy="68" rx="5" ry="3" fill="#FF8FB8" opacity=".8"/><ellipse cx="84" cy="68" rx="5" ry="3" fill="#FF8FB8" opacity=".8"/>
  <path d="M55 62 L65 62 L60 70 Z" fill="#FF9F43"/>
  <path d="M50 108 l-3 6 M54 108 l0 7 M58 108 l3 6 M62 108 l-3 6 M66 108 l0 7 M70 108 l3 6" stroke="#FF9F43" stroke-width="3" stroke-linecap="round"/>
  <path d="M100 58 v8" stroke="#3B2E86" stroke-width="2.5"/><path d="M93 66 h14 l-2 4 h-10z" fill="#3B2E86"/>
  <rect x="94" y="70" width="12" height="16" rx="3" fill="#FFC247"/><rect x="96.5" y="72.5" width="7" height="11" rx="2" fill="#FFF2C2"/>
  <path d="M93 86 h14 l-2 3 h-10z" fill="#3B2E86"/>
  <path d="M88 76 C92 70 98 70 100 74" stroke="#5A45D6" stroke-width="6" fill="none" stroke-linecap="round"/>
  ${extra}
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
  user: { id: null, name: '', email: '', avatar: '', signedIn: false }, authChecked: false, authMode: 'masuk', authErr: '', authBusy: false,
  data: { read: {}, fav: {}, mode: 'mendalam', theme: null, welcomed: false },
  journal: {}, devo: {}, devoLoading: {}, sync: 'local', dbErr: false
};


const LS = 'lentera-v4';
function lsLoad(){ try { return JSON.parse(localStorage.getItem(LS) || 'null'); } catch(e){ return null; } }
function lsSave(){ try { localStorage.setItem(LS, JSON.stringify({ data: S.data, journal: S.journal })); } catch(e){} }

const stateDoc = () => S.user.id ? true : null;
const journalDoc = date => S.user.id ? true : null;
const must = r => { if (r.error) throw r.error; return r; };

let writing = Promise.resolve();
function saveState(){
  lsSave();
  const ref = stateDoc(); if (!ref) return;
  const body = JSON.parse(JSON.stringify(S.data));
  writing = writing.then(() => sb.from('user_state').upsert({ user_id: S.user.id, data: body, updated_at: new Date().toISOString() }).then(must)).then(() => { S.sync = 'cloud'; }).catch(() => { S.sync = 'local'; });
}
const jTimers = {};
function saveJournal(date, text){
  S.journal[date] = text; lsSave();
  clearTimeout(jTimers[date]);
  jTimers[date] = setTimeout(async () => {
    const ref = journalDoc(date); const el = document.getElementById('jsaved');
    if (!ref) { if (el) el.textContent = 'Tersimpan di perangkat ini'; return; }
    try { must(await sb.from('journals').upsert({ user_id: S.user.id, date, text, updated_at: new Date().toISOString() })); if (el) el.textContent = 'Tersimpan di akun'; }
    catch(e){ if (el) el.textContent = 'Tersimpan di perangkat ini (gagal sinkron)'; }
  }, 900);
}

/* ---------- streak ketat ---------- */
function streakInfo(){
  const dates = new Set(Object.values(S.data.read).map(r => r.on));
  const t = TODAY();
  let cur = 0, d = dates.has(t) ? t : addDays(t, -1);
  while (dates.has(d)) { cur++; d = addDays(d, -1); }
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
  return out.map(([b,s,e]) => `${bookName(b)} ${s}${e!==s?'–'+e:''}`).join(' · ');
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
const greet = () => { const f = (S.data.nama || S.user.name || '').trim().split(/\s+/)[0]; return f ? `Selamat malam, ${esc(f)}` : 'Selamat malam'; };
const head = (title, sub) => `<div class="pagehead"><small>${sub}</small><h1>${title}</h1></div>`;
const viewDate = () => S.viewDate || (TODAY() < START ? START : TODAY());

function renderChrome(){
  const c = cur();
  document.getElementById('nav').innerHTML = VIEWS.map(v => `<button data-go="${v.id}" ${v.id===c?'aria-current="page"':''}>${ic(v.icon)}<span>${v.label}</span></button>`).join('');
  const st = streakInfo();
  document.getElementById('streak').innerHTML = `${ic('flame')}<span>${st.cur}</span>`;
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

function vMalam(){
  GL_SEEN = new Set();
  const PG = arr => (arr||[]).map(t=>`<p>${glossLink(t)}</p>`).join('');
  const date = viewDate(); const idx = planIndexFor(date); const day = PLAN[idx];
  loadDevo(day.t);
  const dv = S.devo[day.t];
  const deep = S.data.mode === 'mendalam';
  const done = !!S.data.read[day.t];
  const st = streakInfo();
  const isToday = date === TODAY();
  const before = TODAY() < START;
  const focusVs = dv && dv.fokus ? chapter(dv.fokus.b, dv.fokus.c).filter(v => v[0]>=dv.fokus.v1 && v[0]<=dv.fokus.v2) : [];
  const allRefs = day.r;

  let banner = '';
  if (before) banner = `<div class="banner">${ic('calendar')}<span><b>Rencana dimulai besok, Minggu, 1 November 2026.</b> Anda dapat membaca Hari 1 lebih awal, tetapi streak dihitung dari hari ketika Anda menandainya.</span></div>`;
  else if (!isToday && date < TODAY()) banner = `<div class="banner">${ic('clock')}<span>Anda sedang membuka bacaan <b>${fmtDate(date)}</b>. <button class="mini" data-act="today">Kembali ke hari ini</button></span></div>`;
  if (!before && isToday && !done && st.cur > 0) banner += `<div class="banner warn">${ic('flame')}<span>Streak <b>${st.cur} malam</b> akan kembali ke nol jika bacaan malam ini tidak ditandai sebelum pukul 24.00.</span></div>`;

  const hero = dv && dv.fokus ? `
    <section class="hero" aria-label="Bacaan fokus">
      <div class="moonbig"></div>
      <div class="tagrow"><span class="tag">${ic('moon')}${esc(dv.tema)}</span></div>
      <div class="passage">${focusVs.map(v => `<p data-ref="${dv.fokus.b}:${dv.fokus.c}:${v[0]}" class="${dv.fokus.key.includes(v[0])?'key':''} ${isFav(dv.fokus.b,dv.fokus.c,v[0])?'fav':''}"><sup>${v[0]}</sup>${verseHTML(v[1])}</p>`).join('')}</div>
      <div class="ref"><b>${bookName(dv.fokus.b)} ${dv.fokus.c}:${dv.fokus.v1}-${dv.fokus.v2}</b><small>Ayat fokus · AYT</small></div>
      <div class="owlperch">${owl(done ? 'happy' : 'sleepy', 92)}</div>
    </section>` : `
    <section class="hero" aria-label="Bacaan hari ini">
      <div class="moonbig"></div>
      <div class="tagrow"><span class="tag">${ic('book')}Bacaan hari ini</span></div>
      <div class="passage"><p class="key">${fmtRefs(allRefs)}</p></div>
      <div class="owlperch">${owl(done ? 'happy' : 'sleepy', 92)}</div>
    </section>`;

  const reading = `
    <section class="card c-amber">
      <div class="sechead"><div class="bubble b-moon">${ic('book')}</div><div><h2>Bacaan Alkitab hari ini</h2><small>${allRefs.length} pasal · ketuk untuk membuka</small></div></div>
      <div class="readlist">${allRefs.map(([b,c]) => `
        <details class="chap" ${deep && allRefs.length===1?'open':''}><summary><span class="nm">${bookName(b)} ${c}</span><small>${chapter(b,c).length} ayat</small><svg class="i chev"><use href="#chev"/></svg></summary>
        <div class="chaptext">${chapterHTML(b,c, dv && dv.fokus && dv.fokus.b===b && dv.fokus.c===c ? dv.fokus.key : null)}</div></details>`).join('')}
      </div>
    </section>`;

  let devo = '';
  if (dv === undefined || S.devoLoading[day.t]) devo = `<div class="loading"><span class="spin"></span>Memuat renungan…</div>`;
  else if (dv === 'timeout') devo = `<section class="card"><div class="empty"><div class="bubble b-lilac">${ic('cloud')}</div><b>Renungan belum dapat dimuat</b><p class="small">Periksa koneksi Anda. Bacaan Alkitab di atas tetap dapat dibaca.</p></div></section>`;
  else if (!dv) devo = `<section class="card"><div class="empty">${owl('sleepy', 80)}<b>Renungan untuk hari ini sedang disiapkan</b><p class="small">Renungan ditulis per minggu dan diperbarui setiap Jumat. Sementara itu, bacalah pasal-pasal hari ini dan tuliskan refleksi Anda di bawah.</p></div></section>`;
  else devo = `
    <section class="fact" aria-label="Fakta hari ini">
      <svg class="i sparkle"><use href="#sparkle"/></svg>
      <div class="ft"><span class="kind">${esc(dv.fakta.kind)}</span><span class="small muted" style="font-weight:700">Fakta hari ini</span></div>
      <h2>${esc(dv.fakta.title)}</h2><p>${glossLink(dv.fakta.text)}</p>
    </section>
    <section class="card c-violet">
      <div class="sechead"><div class="bubble b-pink">${ic('scroll')}</div><div><h2>Latar kisah</h2><small>Konteks sejarah dan sastra</small></div></div>
      <div class="prose">${PG(deep ? dv.kisah : dv.kisah.slice(0,1))}</div>
    </section>
    ${deep ? `<section class="card c-teal">
      <div class="sechead"><div class="bubble b-lilac">${ic('lang')}</div><div><h2>Telaah kata</h2><small>Makna dalam bahasa asli</small></div></div>
      <div class="words">${dv.kata.map(k=>`<div class="word"><div class="w"><b>${esc(k.w)}</b><span>${esc(k.l)}</span></div><p>${glossLink(k.d)}</p></div>`).join('')}</div>
    </section>` : ''}
    <section class="card c-coral">
      <div class="sechead"><div class="bubble b-mint">${ic('bulb')}</div><div><h2>Penerapan dalam hidup</h2><small>Kaitannya dengan keseharian</small></div></div>
      ${deep && dv.isu ? `<div class="issue"><span class="small muted" style="font-weight:800;letter-spacing:.05em;text-transform:uppercase">Isu terkini</span><b>${esc(dv.isu.judul)}</b><p>${glossLink(esc(dv.isu.teks))}</p></div>` : ''}
      <div class="prose">${PG(deep ? dv.hidup : dv.hidup.slice(0,1))}</div>
    </section>`;

  const journal = `
    <section class="card c-sky reflect journal">
      <div class="sechead"><div class="bubble b-moon">${ic('pen')}</div><div><h2>Refleksi malam ini</h2><small>Jawaban Anda tersimpan otomatis</small></div></div>
      ${dv && dv.tanya ? `<p class="q">${esc(dv.tanya)}</p>` : `<p class="q">Ayat atau peristiwa apa dari bacaan hari ini yang paling menyentuh Anda, dan mengapa?</p>`}
      ${dv && dv.coba && deep ? `<div class="try">${ic('check')}<span><b>Langkah konkret:</b> ${esc(dv.coba)}</span></div>` : ''}
      <label class="small muted" for="jurnal" style="font-weight:700">Jurnal ${fmtShort(day.t)}</label>
      <textarea id="jurnal" data-date="${day.t}" placeholder="Tuliskan refleksi Anda di sini…">${esc(S.journal[day.t] || '')}</textarea>
      <div class="saved" id="jsaved" aria-live="polite"></div>
    </section>`;

  const links = dv && deep && dv.kaitan ? `
    <section class="card c-pink">
      <div class="sechead"><div class="bubble b-moon">${ic('link')}</div><div><h2>Ayat yang berkaitan</h2><small>Teks lengkap dan hubungannya</small></div></div>
      <div class="rel">${dv.kaitan.map((l,i) => `<article class="relcard" style="--c:var(${LINK_COLORS[i%3]})">
        <div class="rh"><b>${refText(l.b,l.c,l.v)}</b><button class="mini" data-maplink="${i}">${ic('map')}Peta</button></div>
        <p class="rt">${chapter(l.b,l.c).filter(v=>l.v.includes(v[0])).map(v=>verseHTML(v[1])).join(' ')}</p>
        <p class="why">${ic('link')}<span>${esc(l.why)}</span></p></article>`).join('')}</div>
    </section>` : '';

  const prayer = dv && dv.doa ? `<section class="card c-night"><div class="sechead"><div class="bubble b-lilac">${ic('heart')}</div><div><h2>Doa sebelum tidur</h2></div></div><p class="prayer">${esc(dv.doa)}</p></section>` : '';
  const sources = dv && dv.sumber && dv.sumber.length ? `<section class="card c-teal"><div class="sechead"><div class="bubble b-mint">${ic('shield')}</div><div><h2>Sumber bacaan</h2><small>Untuk memeriksa fakta dan isu</small></div></div>
      <ol class="srclist">${dv.sumber.map(s=>`<li><a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.t)}</a></li>`).join('')}</ol></section>` : '';

  const cta = done
    ? `<section class="celebrate"><div class="celowl">${owl('happy', 84)}</div><div><b>Bacaan malam ini selesai!</b><p>Ditandai ${fmtShort(S.data.read[day.t].on)}. Streak Anda ${streakInfo().cur} malam. Selamat beristirahat.</p></div></section><button class="cta done" disabled>${ic('check')} Sudah dibaca</button>`
    : `<button class="cta" data-act="read" data-date="${day.t}">${ic('star')} Tandai sudah dibaca</button>`;

  return `
    <section class="sky"><div class="moon" aria-hidden="true"></div><div class="stars" aria-hidden="true">${'<i></i>'.repeat(14)}</div><div class="cloud c1" aria-hidden="true"></div><div class="cloud c2" aria-hidden="true"></div>
    <div class="dayline"><span class="daypill">Hari ${day.d} / 365</span><span class="daypill">${esc(day.g)}</span>${(() => { const e = eraOf(day.r[0][0], day.r[0][1]); return e ? `<button class="daypill era" data-era="${day.r[0][0]}:${day.r[0][1]}">${ic('clock')}${esc(e.n)}</button>` : ''; })()}<span class="daypill">${fmtDate(day.t)}</span></div>
    ${head(isToday || before ? greet() : 'Bacaan ' + fmtShort(day.t), fmtRefs(allRefs))}
    </section>
    ${banner}
    <div class="modeseg" role="group" aria-label="Mode bacaan">
      <button data-mode="ringkas" aria-pressed="${!deep}">${ic('leaf')}Ringkas</button>
      <button data-mode="mendalam" aria-pressed="${deep}">${ic('layers')}Mendalam</button>
    </div>
    ${hero}${introCards(day)}${prevCard(day, dv)}${devo}${reading}${journal}${links}${prayer}${cta}${sources}
    <p class="srcnote">${ic('shield')}<span>Teks Alkitab: Alkitab Yang Terbuka (AYT) © YLSA, untuk penggunaan non-komersial. <button data-act="source">Tentang sumber</button></span></p>`;
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
    ${x.kunci ? `<div class="try">${ic('book')}<span><b>Ayat kunci · ${refText(x.kunci.b,x.kunci.c,x.kunci.v)}:</b> ${chapter(x.kunci.b,x.kunci.c).filter(v=>x.kunci.v.includes(v[0])).map(v=>verseHTML(v[1])).join(' ')}</span></div>` : ''}
    ${x.catatan ? `<p class="small muted">${x.catatan}</p>` : ''}
    ${x.sumber && x.sumber.length ? `<p class="small muted">Sumber: ${x.sumber.map(s=>`<a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.t)}</a>`).join(' · ')}</p>` : ''}`;
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
    if (isFirst && x) return `<section class="card intro"><div class="sechead"><div class="bubble b-pink">${ic('compass')}</div><div><h2>Pengantar ${esc(bookName(b))}</h2><small>Kitab baru dimulai hari ini</small></div></div>${introHTML(x)}</section>`;
    return `<button class="ghost" data-intro="${b}">${ic('compass')} Tentang kitab ${esc(bookName(b))}</button>`;
  }).join('');
}
function prevCard(day, dv){
  const b = day.r[0][0];
  let prev = null; for (let i = day.d - 2; i >= 0; i--) if (PLAN[i].r.some(x => x[0] === b)) { prev = PLAN[i]; break; }
  if (!prev) return '';
  const chs = prev.r.filter(x => x[0] === b);
  const titles = chs.flatMap(([bb,c]) => chapter(bb,c).filter(v => v[2]).map(v => titleHTML(v[2])));
  const read = S.data.read[prev.t];
  return `<section class="card c-violet">
    <div class="sechead"><div class="bubble b-lilac">${ic('rewind')}</div><div><h2>Sebelumnya di kitab ini</h2><small>Hari ${prev.d} · ${fmtShort(prev.t)} · ${fmtRefs(chs)}${read ? '' : ' · belum dibaca'}</small></div></div>
    ${dv && dv.sebelumnya ? `<p class="prose">${glossLink(esc(dv.sebelumnya))}</p>` : ''}
    ${titles.length ? `<div class="outline">${titles.map(t => `<div><b>${ic('dot')}</b><span>${t}</span></div>`).join('')}</div>` : ''}
    <button class="mini" data-open="${prev.t}">${ic('book')} Buka bacaan Hari ${prev.d}</button>
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
  document.querySelector('meta[name="theme-color"]').setAttribute('content', d ? '#0F0B26' : '#F3EEFF');
}

function toast(msg){ document.querySelectorAll('.toast').forEach(t=>t.remove()); const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),2400); }
function burst(x,y){
  const cs=getComputedStyle(document.documentElement); const cols=['--moon','--pink','--mint','--lilac'].map(v=>cs.getPropertyValue(v).trim());
  for(let i=0;i<14;i++){ const s=document.createElement('div'); s.className='burst';
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
    const b = t.getBoundingClientRect(); burst(b.left+b.width/2, b.top);
    S.data.read[t.dataset.date] = { on: TODAY(), at: new Date().toISOString() }; saveState(); render();
    const st = streakInfo(); toast(st.today ? `Tercatat. Streak ${st.cur} malam.` : 'Tercatat sebagai bacaan susulan.'); return;
  }
  if (a === 'export') { exportJournal(); return; }
  if (t.dataset.authmode) { S.authMode = t.dataset.authmode; S.authErr = ''; S.authInfo = ''; render(); return; }
  if (a === 'offline') { S.data.offline = true; lsSave(); render(); return; }
  if (a === 'tologin') { S.data.offline = false; lsSave(); render(); return; }
  if (a === 'logout') { sb.auth.signOut().then(() => { S.data = { read: {}, fav: {}, mode: 'mendalam', theme: S.data.theme, welcomed: false }; S.journal = {}; lsSave(); location.hash = ''; render(); }); return; }
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
window.addEventListener('hashchange', () => { render(); window.scrollTo(0,0); });

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
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(publicKey) });
    const json = sub.toJSON();
    must(await sb.from('push_subscriptions').upsert({ endpoint: json.endpoint, user_id: S.user.id, subscription: json, user_agent: navigator.userAgent.slice(0, 200) }));
    S.data.notif = true; saveState(); toast('Notifikasi aktif');
  } catch(e) { toast(String(e && e.message).includes('vapid') ? 'Kunci notifikasi server belum diatur (lihat panduan bagian 4.6)' : 'Gagal mengaktifkan notifikasi. Coba lagi.'); }
  finally { S.pushBusy = false; render(); }
}

async function loadCloud(uid){
  try {
    const st = must(await sb.from('user_state').select('data').eq('user_id', uid).maybeSingle());
    const cloud = st.data ? st.data.data : null;
    if (cloud) { const localRead = S.data.read; S.data = Object.assign({}, S.data, cloud); S.data.read = Object.assign({}, localRead, cloud.read || {}); }
    const js = must(await sb.from('journals').select('date,text').eq('user_id', uid));
    (js.data || []).forEach(x => { if (x.text) S.journal[x.date] = x.text; });
    S.sync = 'cloud';
    if (!cloud && (S.data.welcomed || Object.keys(S.data.read).length)) saveState();
    applyTheme();
  } catch(e) { S.sync = 'local'; }
}

(async function init(){
  const local = lsLoad(); if (local) { Object.assign(S.data, local.data || {}); S.journal = local.journal || {}; }
  applyTheme(); render();
  registerSW();
  let lastUid = null;
  const onSession = async (event, session) => {
    if (event === 'PASSWORD_RECOVERY') { S.recovery = true; }
    const user = session && session.user;
    if (user) {
      S.user = { id: user.id, email: user.email || '', name: '', avatar: '', signedIn: true }; S.data.offline = false;
      if (lastUid !== user.id) { lastUid = user.id; await loadCloud(user.id); }
    } else { lastUid = null; S.user = { id: null, email: '', name: '', avatar: '', signedIn: false }; S.sync = 'local'; }
    S.authChecked = true; render();
  };
  sb.auth.onAuthStateChange((event, session) => { setTimeout(() => onSession(event, session), 0); });
  sb.auth.getSession().then(({ data }) => onSession('INITIAL', data.session));
  const [bible, plan] = await Promise.all([fetch('/data/alkitab.json').then(r=>r.json()), fetch('/data/rencana.json').then(r=>r.json())]).catch(()=>[null,null]);
  try { const [l, g] = await Promise.all([fetch('/data/linimasa.json').then(r=>r.json()), fetch('/data/glosarium.json').then(r=>r.json())]); LINI = l; GLOS = g; glossInit(); } catch(e) {}
  BIBLE = bible; PLAN = plan;
  if (!BIBLE) { document.getElementById('app').innerHTML = `<div class="empty"><b>Alkitab gagal dimuat</b><p class="small">Periksa koneksi lalu muat ulang.</p></div>`; return; }
  render();
})();
