/* Dipanggil Vercel Cron setiap malam pukul 21.00 WIB.
   Mengirim satu pengingat lembut bila malam itu belum ada bacaan yang ditandai. */
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { nightOf, tonight, streakState, wipeProgress, minutes } from '../lib/antrean.js';

const A = JSON.parse(fs.readFileSync(new URL('../data/antrean.json', import.meta.url)));
const BOOK_LEN = JSON.parse(fs.readFileSync(new URL('../data/panjang-pasal.json', import.meta.url)));
const ref = u => `${A.n[u[0]]} ${u[1]}${u[2] === 1 && u[3] === BOOK_LEN[u[0]][u[1] - 1] ? '' : `:${u[2]}${u[3] !== u[2] ? '–' + u[3] : ''}`}`;

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@example.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

export default async function handler(req, res) {
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const today = nightOf(new Date(), 'Asia/Jakarta');
  const { data: states, error } = await sb.from('user_state').select('user_id, data');
  if (error) return res.status(500).json({ error: error.message });
  let sent = 0, skipped = 0, removed = 0; const failed = [];

  for (const row of states || []) {
    const data = wipeProgress(row.data || {}); // akun yang belum membuka versi baru: anggap sudah direset
    if (!data.notif || data.notifMalam === false) { skipped++; continue; }
    const st = streakState(data.nights, today);
    if (st.litTonight) { skipped++; continue; }
    const { first } = tonight(A.q, data.done, today);
    if (!first) { skipped++; continue; }

    const nama = (data.nama || '').split(' ')[0];
    const payload = JSON.stringify(st.dim
      ? { title: 'Lenteramu menunggu', body: `Satu bacaan malam ini menyalakannya lagi. Kalau sempat, satu bacaan tambahan ikut memulihkan streak ${st.streak} malammu.`, tag: 'malam', link: '/' }
      : { title: nama ? `Selamat malam, ${nama}` : 'Selamat malam', body: `${ref(first)} sudah menunggumu, sekitar ${minutes(first[4])} menit. Satu bacaan saja sudah cukup.`, tag: 'malam', link: '/' });

    const { data: subs } = await sb.from('push_subscriptions').select('endpoint, subscription').eq('user_id', row.user_id);
    if (!subs || !subs.length) { skipped++; continue; }
    for (const s of subs) {
      try { await webpush.sendNotification(s.subscription, payload, { TTL: 3600 }); sent++; }
      catch (e) {
        if (e.statusCode === 404 || e.statusCode === 410) { await sb.from('push_subscriptions').delete().eq('endpoint', s.endpoint); removed++; }
        else failed.push({ status: e.statusCode || null, body: String(e.body || e.message).slice(0, 200), host: new URL(s.endpoint).host });
      }
    }
  }
  const result = { today, sent, skipped, removed, failed };
  console.log('pengingat', JSON.stringify(result)); // terlihat di Vercel → Logs
  res.status(200).json(result);
}
