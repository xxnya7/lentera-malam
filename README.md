# Lentera Malam

Renungan Alkitab harian sebelum tidur: seluruh Alkitab dalam 365 hari (1 November 2026 – 31 Oktober 2027), dengan renungan bersumber, jurnal, streak, glosarium, lini masa, dan notifikasi malam.

Stack: HTML/CSS/JS statis (tanpa build) di **Vercel**, login dan database di **Supabase**, notifikasi Web Push (VAPID).

Panduan deploy lengkap ada di dokumen Word **Panduan Deploy Lentera Malam**.

## Struktur

| Path | Isi |
| --- | --- |
| `index.html`, `style.css`, `app.js` | Aplikasi (HTML + CSS + JavaScript modul) |
| `supabase-config.js` | **Wajib diisi**: Project URL dan anon key Supabase |
| `supabase/schema.sql` | Tabel `user_state`, `journals`, `push_subscriptions` + Row Level Security |
| `sw.js` | Service worker: notifikasi + cache offline |
| `manifest.webmanifest`, `icons/` | PWA (bisa dipasang ke Layar Utama) |
| `data/` | Teks Alkitab AYT (penomoran TB), rencana baca, lini masa, glosarium |
| `content/renungan/YYYY-MM-DD.json` | Renungan harian (ditambah setiap minggu) |
| `content/kitab/<indeks>.json` | Pengantar kitab (0 = Kejadian … 65 = Wahyu) |
| `api/pengingat.js` | Fungsi Vercel pengirim notifikasi (dipanggil Vercel Cron) |
| `api/buat-vapid.js` | Membuat pasangan kunci VAPID sekali (nonaktif setelah `VAPID_PRIVATE_KEY` diisi) |
| `api/vapid-public.js` | Menyediakan kunci publik VAPID ke aplikasi |
| `vercel.json` | Jadwal cron dan header |

## Variabel lingkungan Vercel

| Nama | Isi |
| --- | --- |
| `SUPABASE_URL` | Project URL Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Kunci service_role (rahasia, hanya di Vercel) |
| `CRON_SECRET` | String acak panjang; Vercel otomatis mengirimnya ke fungsi cron |
| `VAPID_SUBJECT` | `mailto:email-anda` |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | Dari `/api/buat-vapid` setelah deploy pertama, lalu Redeploy |

## Jadwal notifikasi (Vercel Hobby)

- `0 14 * * *` UTC → sekitar 21.00–22.00 WIB: pengingat bacaan bila belum ditandai.
- `0 15 * * *` UTC → sekitar 22.00–23.00 WIB: peringatan streak bila belum ditandai.

Paket Hobby hanya menjamin ketepatan per jam (±59 menit). Pengguna bisa mematikan notifikasi atau tiap jenisnya dari tab Akun.

## Menambah renungan

Tambahkan file `content/renungan/YYYY-MM-DD.json` (format sama dengan file yang ada), commit, dan push. Vercel otomatis memperbarui situs.

## Lisensi teks

Alkitab Yang Terbuka (AYT) © 2011–2024 Yayasan Lembaga SABDA (YLSA), dari https://github.com/sabdacode/ayt. Penggunaan non-komersial dengan mencantumkan sumber.
