# Lentera Malam

Renungan Alkitab sebelum tidur: satu perikop setiap malam dari antrean yang mencakup seluruh Alkitab, tanpa tenggat. Ada renungan bersumber, jurnal, streak dengan pemulihan, glosarium, lini masa, dan notifikasi malam.

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
| `data/` | Teks Alkitab AYT (penomoran TB), urutan rotasi kitab (`rencana.json`), antrean perikop (`antrean.json`), lini masa, glosarium |
| `content/bacaan/<kitab>-<pasal>-<ayat>.json` | Renungan per perikop (ditambah setiap minggu) |
| `lib/antrean.js` | Aturan antrean, malam (batas 04.00), streak, pemulihan, dan migrasi data; dipakai aplikasi dan server |
| `scripts/buat-antrean.mjs` | Membuat ulang `data/antrean.json` |
| `content/kitab/<indeks>.json` | Pengantar kitab (0 = Kejadian … 65 = Wahyu) |
| `api/pengingat.js` | Fungsi Vercel pengirim notifikasi (dipanggil Vercel Cron) |
| `api/vapid-public.js` | Menyediakan kunci publik VAPID ke aplikasi |
| `vercel.json` | Jadwal cron dan header |

## Variabel lingkungan Vercel

| Nama | Isi |
| --- | --- |
| `SUPABASE_URL` | Project URL Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Kunci service_role (rahasia, hanya di Vercel) |
| `CRON_SECRET` | String acak panjang; Vercel otomatis mengirimnya ke fungsi cron |
| `VAPID_SUBJECT` | `mailto:email-anda` |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | Sudah terpasang. Bila perlu kunci baru: `npx web-push generate-vapid-keys`, lalu Redeploy (semua perangkat harus mendaftar ulang) |

## Jadwal notifikasi (Vercel Hobby)

- `0 14 * * *` UTC → sekitar 21.00–22.00 WIB: satu pengingat lembut bila malam itu belum ada bacaan yang ditandai.

Paket Hobby hanya menjamin ketepatan per jam (±59 menit). Pengguna bisa mematikan notifikasi dari tab Akun.

## Menambah renungan

Tambahkan file `content/bacaan/<kitab>-<pasal>-<ayatAwal>.json` untuk perikop di `data/antrean.json` (format sama dengan file yang ada; `fokus` harus di dalam perikop itu), commit, dan push. Vercel otomatis memperbarui situs.

## Tes

`npm test` menjalankan tes antrean, streak, pemulihan, malam (WIB), dan migrasi di `lib/antrean.test.js`.

## Lisensi teks

Alkitab Yang Terbuka (AYT) © 2011–2024 Yayasan Lembaga SABDA (YLSA), dari https://github.com/sabdacode/ayt. Penggunaan non-komersial dengan mencantumkan sumber.

## Aset pihak ketiga

- Font di `fonts/`: Alegreya dan Alegreya Sans (SIL Open Font License 1.1), dari paket Fontsource.
- Ikon di `index.html` dan maskot burung hantu: digambar khusus untuk Lentera Malam.
