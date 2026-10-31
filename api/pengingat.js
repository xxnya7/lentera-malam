/* Dipanggil Vercel Cron setiap malam.
   ?jenis=malam  -> "Renungan malam ini sudah siap" bila bacaan hari ini belum ditandai
   ?jenis=streak -> peringatan streak akan putus bila belum membaca hari ini */
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@example.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

const ymd = d => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(d);
const minusDays = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };

export default async function handler(req, res) {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const jenis = req.query.jenis === 'streak' ? 'streak' : 'malam';
  const today = ymd(new Date());
  const { data: states, error } = await sb.from('user_state').select('user_id, data');
  if (error) return res.status(500).json({ error: error.message });
  let sent = 0, skipped = 0, removed = 0;

  for (const row of states || []) {
    const data = row.data || {};
    if (!data.notif) { skipped++; continue; }
    if (jenis === 'malam' && data.notifMalam === false) { skipped++; continue; }
    if (jenis === 'streak' && data.notifStreak === false) { skipped++; continue; }
    const dates = new Set(Object.values(data.read || {}).map(r => r && r.on).filter(Boolean));
    if (dates.has(today)) { skipped++; continue; }
    let streak = 0, d = minusDays(today, 1);
    while (dates.has(d)) { streak++; d = minusDays(d, 1); }
    if (jenis === 'streak' && streak === 0) { skipped++; continue; }

    const nama = (data.nama || '').split(' ')[0];
    const payload = JSON.stringify({
      title: jenis === 'streak' ? `Streak ${streak} malam hampir putus` : (nama ? `Selamat malam, ${nama}` : 'Selamat malam'),
      body: jenis === 'streak' ? 'Tandai bacaan malam ini sebelum pukul 24.00 supaya streak tetap berlanjut.' : 'Renungan malam ini sudah siap. Luangkan beberapa menit sebelum tidur.',
      tag: jenis, link: '/'
    });

    const { data: subs } = await sb.from('push_subscriptions').select('endpoint, subscription').eq('user_id', row.user_id);
    if (!subs || !subs.length) { skipped++; continue; }
    for (const s of subs) {
      try { await webpush.sendNotification(s.subscription, payload, { TTL: 3600 }); sent++; }
      catch (e) {
        if (e.statusCode === 404 || e.statusCode === 410) { await sb.from('push_subscriptions').delete().eq('endpoint', s.endpoint); removed++; }
      }
    }
  }
  res.status(200).json({ jenis, today, sent, skipped, removed });
}
