# Audit kode Lentera Malam

Tanggal: 7 November 2026 · Branch yang diaudit: `main` (commit `c229e76`) · Laporan ini tidak mengubah kode apa pun.

**What this repo does:** Lentera Malam adalah aplikasi web untuk HP (bisa dipasang ke Layar Utama) untuk membaca seluruh Alkitab AYT dalam 365 hari, dengan renungan harian, jurnal, streak, dan pengingat malam. Tampilannya berupa file statis di Vercel. Login dan penyimpanan progres memakai Supabase, dan dua fungsi kecil di Vercel mengirim notifikasi setiap malam.

**Beban yang saya asumsikan:** satu pemilik ditambah beberapa orang, dan setiap orang bisa memakai lebih dari satu perangkat (HP dan laptop). Ribuan pengguna tidak saya perhitungkan.

**Yang sudah aman (dicek, tidak perlu diubah):**
- Kunci di `supabase-config.js` adalah kunci *anon*, yaitu kunci publik yang memang boleh terlihat di peramban.
- Row Level Security (RLS, aturan di database yang membatasi baris mana yang boleh dibaca dan diubah setiap akun) aktif di ketiga tabel. Aturannya benar: setiap akun hanya bisa membaca dan mengubah barisnya sendiri (`auth.uid() = user_id`, untuk baca dan tulis).
- Kunci *service_role*, yaitu kunci server yang bisa melewati RLS, hanya dipakai di `api/pengingat.js` lewat variabel lingkungan Vercel. Kunci ini tidak ada di repositori.
- Tidak ada sisa kode atau dependensi Firebase. Kata "firebase", "firestore", dan "messaging" tidak ditemukan di seluruh kode dan README. Yang tersisa hanya beberapa pola kecil yang dibahas di temuan 8.

---

## Must fix

1. **Progres baca bisa hilang kalau memakai dua perangkat** (`app.js:L82-87`, `app.js:L773-777`)
   - **What this is:** Setiap kali Anda menandai bacaan, mengganti tema, atau mengubah pengaturan, aplikasi mengirim **seluruh** isi progres dari perangkat itu ke Supabase dan menimpa isi yang lama.
   - **Problem:** Data dari cloud hanya dibaca sekali, saat aplikasi dibuka atau saat masuk. Contohnya: HP dibuka Senin lalu dibiarkan di latar belakang. Selasa Anda menandai bacaan di laptop. Rabu Anda membuka HP lagi (aplikasinya tidak dimuat ulang) dan menandai bacaan Rabu. HP lalu mengirim datanya yang belum berisi Selasa, sehingga tanda Selasa terhapus di cloud dan streak putus.
   - **Fix:** Di `saveState`, ambil dulu baris `user_state` yang terbaru, gabungkan `read` (gabungan dua sisi: tanggal yang ada di salah satu sisi tetap disimpan), lalu kirim. Tambahkan juga `loadCloud` ulang saat aplikasi kembali terlihat (`visibilitychange`). Totalnya sekitar 10 baris.
   - **If we skip it:** Tanda baca dan streak bisa hilang tanpa terlihat, dan tidak bisa dikembalikan.

2. **Jurnal terbaru bisa tertimpa versi lama** (`app.js:L89-97`, `app.js:L779`)
   - **What this is:** Jurnal langsung disimpan di perangkat, lalu dikirim ke Supabase 0,9 detik setelah Anda berhenti mengetik.
   - **Problem:** Saat aplikasi dibuka, isi jurnal dari cloud selalu menimpa isi di perangkat. Contohnya: Anda mengetik jurnal tanpa sinyal, atau menutup aplikasi kurang dari 1 detik setelah selesai mengetik. Teks terbaru hanya tersimpan di perangkat. Saat aplikasi dibuka lagi, versi lama dari cloud menimpanya.
   - **Fix:** Simpan waktu ubah per tanggal di perangkat (`journalAt[date]`). Saat memuat, pakai versi yang `updated_at`-nya lebih baru, lalu kirim versi perangkat yang lebih baru ke cloud. Totalnya sekitar 8 baris.
   - **If we skip it:** Refleksi pribadi hilang diam-diam, padahal ini bagian yang paling sulit ditulis ulang.

3. **Data yang dibuat "tanpa akun" tidak pernah naik ke akun, lalu hilang saat Keluar** (`app.js:L776-781`, `app.js:L715`)
   - **What this is:** Pengguna bisa memakai aplikasi tanpa akun, lalu mendaftar belakangan.
   - **Problem:** Saat masuk, tanda baca dari perangkat hanya digabung di memori dan tidak dikirim ke cloud kalau akun sudah punya data. Jurnal dari perangkat tidak pernah dikirim sama sekali. Kalau setelah itu pengguna menekan **Keluar**, kode menghapus semua data di perangkat (`S.journal = {}`, `read: {}`), sehingga semua data itu hilang permanen. Hal yang sama terjadi kalau pengiriman terakhir gagal karena sinyal buruk.
   - **Fix:** Sesudah `loadCloud`, panggil `saveState()` dan unggah jurnal yang hanya ada di perangkat. Di tombol Keluar, tunggu `writing` selesai, dan jangan hapus data perangkat kalau `S.sync` masih `'local'` (tampilkan peringatan). Totalnya sekitar 6 baris.
   - **If we skip it:** Pengguna yang mulai tanpa akun, atau yang keluar saat sinyal buruk, kehilangan progres dan jurnalnya.

## Should fix

4. **Endpoint pengingat terbuka bila `CRON_SECRET` kosong** (`api/pengingat.js:L14`)
   - **What this is:** `CRON_SECRET` adalah kata sandi yang dikirim Vercel Cron supaya hanya Vercel yang bisa memicu pengiriman notifikasi.
   - **Problem:** Pemeriksaannya hanya berjalan kalau variabelnya ada. Kalau suatu saat variabel itu terhapus atau salah nama saat proyek dipindah, siapa pun yang tahu alamat `/api/pengingat` bisa memicu notifikasi ke semua pengguna berulang kali.
   - **Fix:** Tolak permintaan kalau rahasianya kosong: `if (!process.env.CRON_SECRET || req.headers.authorization !== ...)`. Ini perubahan satu baris.
   - **If we skip it:** Satu kesalahan pengaturan saja sudah cukup untuk membuat notifikasi bisa disalahgunakan.

5. **Gagal simpan ke cloud tidak dicoba ulang** (`app.js:L86`)
   - **What this is:** Kalau pengiriman ke Supabase gagal, aplikasi hanya mengubah label di tab Akun menjadi "Menyimpan di perangkat".
   - **Problem:** Tidak ada percobaan ulang. Contohnya: Anda menandai bacaan dengan sinyal lemah, lalu tidak mengubah apa pun lagi selama beberapa hari. Selama itu cloud tidak tahu bacaan tersebut. Akibatnya, notifikasi streak tetap berbunyi, dan perangkat lain bisa menimpanya (lihat temuan 1).
   - **Fix:** Panggil `saveState()` lagi saat event `online` muncul dan saat aplikasi kembali terlihat. Ini cukup 2 baris kalau temuan 1 sudah dikerjakan.
   - **If we skip it:** Muncul notifikasi "streak hampir putus" padahal Anda sudah membaca, dan peluang data hilang di temuan 1 makin besar.

6. **Aturan streak ditulis dua kali dan tidak ada tes** (`app.js:L101-111`, `api/pengingat.js:L27-31`)
   - **What this is:** Streak dihitung di aplikasi untuk ditampilkan, dan dihitung lagi di server untuk memutuskan kapan mengirim peringatan.
   - **Problem:** Kedua versi harus selalu sama, tetapi ditulis terpisah dengan fungsi tanggal yang berbeda. Aplikasi memakai jam perangkat, sedangkan server memakai zona Asia/Jakarta. Kalau salah satunya diubah, misalnya aturan tanggal, angka streak di layar dan isi notifikasi bisa berbeda. Saat ini tidak ada satu tes pun yang akan menangkap perbedaan itu.
   - **Fix:** Pindahkan hitungan ke satu file kecil, misalnya `lib/streak.js`, yang di-*import* oleh `app.js` dan `api/pengingat.js`. Keduanya sudah memakai ES module. Tambahkan satu tes `node --test` untuk kasus streak 0, streak berlanjut dari kemarin, dan streak putus.
   - **If we skip it:** Bug streak baru ketahuan setelah notifikasinya salah.

7. **Setelah Keluar, perangkat masih menerima pengingat akun lama** (`app.js:L715`, tabel `push_subscriptions`)
   - **What this is:** Setiap perangkat yang menyalakan notifikasi dicatat di tabel `push_subscriptions` atas nama akun yang sedang masuk.
   - **Problem:** Tombol Keluar tidak menghapus catatan itu. Contohnya: seseorang meminjam HP Anda untuk mencoba aplikasi, menyalakan notifikasi, lalu keluar. HP Anda tetap menerima pengingat atas nama akunnya. Kalau Anda lalu menyalakan notifikasi dengan akun Anda sendiri di HP yang sama, penyimpanannya gagal karena RLS melarang mengubah baris milik akun lain.
   - **Fix:** Sebelum `signOut()`, hapus baris dengan `endpoint` perangkat ini (`sb.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)`). Ini cukup 3 baris.
   - **If we skip it:** Muncul notifikasi untuk orang yang salah di perangkat yang dipakai bergantian.

8. **Sisa pola kode lama yang tidak dipakai** (`app.js:L9`, `app.js:L67`, `app.js:L77-78`, `app.js:L84`, `app.js:L93`, `app.js:L146`, `app.js:L795-797`)
   - **What this is:** Ini sisa dari versi lama: `SHEEP = ''`, `stateDoc()` dan `journalDoc()` yang hanya mengembalikan `true` (bentuk "referensi dokumen" khas Firestore), serta `S.user.name` dan `S.user.avatar` yang selalu kosong (dulu diisi login Google).
   - **Problem:** Tidak ada yang membaca nilai-nilai ini secara berarti. Saya sudah mencarinya di seluruh repositori, termasuk HTML dan CSS. Pembaca kode jadi mengira ada logika dokumen atau foto profil, padahal tidak ada.
   - **Fix:** Hapus `SHEEP`. Ganti `stateDoc()` dan `journalDoc()` dengan `S.user.id`. Buang `name` dan `avatar` dari objek `S.user`. Di `greet`, cukup pakai `S.data.nama`.
   - **If we skip it:** Tidak ada yang rusak, tetapi kode lebih sulit dibaca.

9. **`api/buat-vapid.js` sudah tidak berguna** (`api/buat-vapid.js`, `README.md:L22,L34`)
   - **What this is:** Endpoint sekali pakai untuk membuat kunci notifikasi saat pemasangan pertama.
   - **Problem:** Kunci sudah terpasang, jadi endpoint ini sekarang selalu menjawab 403. File ini tetap ikut di setiap deploy dan menjadi satu alamat publik yang tidak perlu ada.
   - **Fix:** Hapus file itu, lalu ubah dua baris di README yang menyebutnya. Kalau suatu saat perlu kunci baru, cukup jalankan `npx web-push generate-vapid-keys` sekali di komputer.
   - **If we skip it:** Tidak ada kerugian langsung, hanya kode yang tidak dipakai.

## Nice to have

10. **Pesan "bacaan susulan" tidak pernah muncul** (`app.js:L709`)
    - **What this is:** Setelah Anda menandai bacaan, muncul pesan "Tercatat. Streak N malam." atau "Tercatat sebagai bacaan susulan."
    - **Problem:** Tanda baca selalu disimpan dengan tanggal hari ini (`on: TODAY()`), jadi `st.today` selalu bernilai benar dan pesan kedua tidak pernah tampil, termasuk saat Anda membaca hari yang terlewat.
    - **Fix:** Cek dari tanggal rencana: tampilkan pesan susulan bila `t.dataset.date !== TODAY()`. Ini perubahan satu baris.
    - **If we skip it:** Hanya pesan yang kurang tepat, tidak ada data yang rusak.

11. **Perubahan teks Alkitab baru terlihat setelah 1–2 kali buka** (`vercel.json` bagian `/data/(.*)`, `sw.js:L36-40`)
    - **What this is:** `data/alkitab.json` (sekitar 4,7 MB) disimpan di cache peramban selama 1 hari, dan service worker (skrip latar yang membuat aplikasi bisa dipakai offline) memakai versi cache lebih dulu.
    - **Problem:** Setelah perbaikan nomor ayat kemarin, HP bisa menampilkan teks lama sampai cache peramban habis dalam 1 hari, lalu aplikasi dibuka sekali lagi.
    - **Fix:** Tambahkan versi pada alamat file, misalnya `/data/alkitab.json?v=2` di `app.js` dan `sw.js`. Naikkan angkanya setiap kali file berubah.
    - **If we skip it:** Perbaikan data terlambat sampai ke pengguna, paling lama sekitar 1–2 hari.

---

**Verdict:** Keamanan Supabase sudah benar. Yang harus diperbaiki lebih dulu adalah risiko kehilangan data: temuan 1, 2, dan 3. Ketiganya bisa diselesaikan dalam sekitar 25 baris di `app.js`.

**Lean:** sekitar -25 baris dan -1 file (`api/buat-vapid.js`). Jumlah dependensi tidak berubah, karena `web-push` tetap dipakai oleh `api/pengingat.js`.

**Not checked:**
- Aplikasi tidak saya jalankan di HP sungguhan atau di Supabase sungguhan. Semua temuan berasal dari membaca kode.
- Isi `style.css`, ilustrasi SVG, dan tampilan lain tidak diperiksa untuk bug fungsional.
- Isi `data/` (teks Alkitab, rencana, glosarium, lini masa) dan `content/` (renungan) tidak diperiksa untuk ketepatan isi. Penomoran ayat sudah diperbaiki kemarin, kecuali Nehemia 7–8 dan Hagai 1–2.
- Pengaturan di dasbor Supabase (misalnya pendaftaran akun baru yang masih terbuka) dan di Vercel tidak bisa saya lihat dari sini.
