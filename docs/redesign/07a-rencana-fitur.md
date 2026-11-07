# 07a. Rencana fitur: antrean bacaan dan streak yang memaafkan

Status: **disetujui dan diterapkan** di branch `redesign` (7 November 2026). Keputusan pengguna ada di §0; bagian lain adalah rencana awal, dan di mana §0 berbeda, §0 yang berlaku.
Branch: `redesign`. Implementasi sesudah disetujui, dengan pendekatan ponytail (perubahan sekecil mungkin yang menyelesaikan masalah).

---

## 0. Keputusan (jawaban pengguna)

| No | Keputusan |
|---|---|
| T1 | **Satuan bacaan = satu perikop**, bukan pasal. Bacaan malam itu hanya perikop yang dibahas renungan, tidak sampai ke perikop atau pasal lain. Renungan ditulis per perikop. |
| T2 | **Satu pengingat** saja, pukul 21.00 WIB. Pengingat lentera pukul 22.00 dihapus. |
| T3 | Pemulihan dibayar dengan **bacaan kedua** malam itu (maksimal 2 bacaan per malam). |
| T4 | Batas malam **pukul 04.00**. |
| T5 | Bacaan di luar antrean **tidak dihitung** untuk streak. |
| T6 | Progres menampilkan **persen** dari seluruh Alkitab (dihitung per pasal yang selesai). |
| T7 | Batas pemulihan: **7 malam, maksimal 3 malam bolong, 1 bacaan pemulihan per malam**. |
| T8 | Renungan baru ditulis **per perikop di branch `redesign`**; renungan per tanggal di `main` berhenti sampai merge. |

### Cara antrean perikop dibuat
- `scripts/buat-antrean.mjs` membaca `data/alkitab.json` dan `data/rencana.json`, lalu menulis `data/antrean.json`.
- Urutan kitab mengikuti rotasi rencana yang lama, pasal demi pasal. Tiap pasal dipecah menurut judul perikop AYT.
- Perikop di bawah 150 kata digabung dengan perikop berikutnya di pasal yang sama, supaya satu malam tidak hanya 2–3 ayat. Contoh: Yosua 5:9–12 dan 5:13–15 menjadi satu bacaan, Yosua 5:9–15.
- Hasilnya 1.925 bacaan. Median panjangnya sekitar 290 kata, kira-kira 2 menit membaca, ditambah renungan.
- Ayat di awal pasal yang belum berjudul (lanjutan perikop pasal sebelumnya) ikut ke bacaan pertama pasal itu.

### Renungan per perikop
- File: `content/bacaan/<kitab>-<pasal>-<ayatAwal>.json`, misalnya `content/bacaan/5-5-9.json` untuk Yosua 5:9–15. Isinya sama seperti format lama, ditambah `id` dan `bacaan` (rentang ayat). `fokus` harus berada di dalam perikop itu.
- 14 renungan lama (1–14 Nov) sudah dipindahkan ke perikop yang memuat ayat fokusnya.
- Update mingguan: Claude menulis renungan untuk **14 bacaan berikutnya di antrean**, dimulai dari bacaan pertama yang belum punya renungan setelah posisi pengguna, mengikuti tempo maksimal 2 per malam. Kalau pengguna lebih cepat, bacaan tetap tampil dengan status "Renungan untuk bacaan ini sedang disiapkan".

### Yang berubah dari rencana awal
- Semua teks "pasal" untuk bacaan malam diganti "bacaan" (karena satuannya perikop). Kata "pasal" tetap dipakai untuk progres per kitab ("12 pasal sudah dibaca").
- Ayat fokus tidak lagi tampil sebagai bagian terpisah. Seluruh perikop malam itu tampil di panel pertama dengan judul tema renungan, dan ayat fokusnya disorot.
- Tab "Arsip" bernama halaman "Riwayat bacaan". Label menu bawah tetap "Arsip".
- `lib/streak.js` dihapus karena semua pemanggilnya sudah memakai `lib/antrean.js`.

## 1. Ringkasan

| Sekarang | Sesudahnya |
|---|---|
| 365 hari, 1–9 pasal per tanggal (rata-rata 3,3 pasal) | Antrean 1.189 pasal tanpa tanggal; tiap malam tampil **1 pasal**, plus **1 pasal opsional** |
| Satu tombol "Selesai membaca" untuk seluruh bacaan hari itu | Tiap pasal punya centang sendiri |
| Bacaan tanggal lalu yang belum ditandai berlabel "Belum dibaca" atau "Terlewat" | Tidak ada pasal yang terlewat. Yang belum dibaca tetap di depan antrean |
| "Hari 7 dari 365", "Rencana setahun 1 Nov 2026–31 Okt 2027", "361 lagi sampai akhir tahun" | Jumlah pasal yang sudah dibaca, progres per kitab, dan putaran ke berapa |
| Streak langsung nol kalau satu malam bolong | Lentera meredup dan muncul **pasal pemulihan**. Kalau dibayar, streak pulih |

**Satu malam jadi ringan.** Satu pasal Alkitab rata-rata sekitar 500 kata, kira-kira 3 menit. Hanya 10% pasal yang lebih dari 900 kata. Jadi dua pasal pun biasanya selesai dalam 5–9 menit, ditambah renungan.

---

## 2. Pengguna dan tugas

- **Siapa:** Anya, membaca sendiri di HP, di tempat tidur, menjelang tidur, dalam mode gelap.
- **Tugas satu malam:** buka aplikasi, baca satu pasal, centang, lalu tidur dengan perasaan "cukup".
- **Yang harus dihindari:** rasa dikejar target, rasa bersalah karena bolong, dan layar yang penuh angka.
- **Mode permukaan:** *Read* (halaman baca, tenang) dan *Operate* ringan (centang, progres).

---

## 3. Konsep inti

### 3.1 Antrean
- Urutan antrean = urutan pasal di `data/rencana.json` sekarang, dibaca dari hari 1 sampai 365 lalu diratakan menjadi 1.189 pasal. Pola rotasi jenis kitab (Injil, Sejarah, Taurat, Nabi, Puisi, Surat) **tetap sama**, hanya tidak terikat tanggal.
- **Pasal malam ini** = pasal pertama di antrean yang belum dibaca pada putaran ini. **Pasal opsional** = pasal belum dibaca berikutnya.
- Rotasi tetap terasa: pasal opsional sering berasal dari blok yang sama (misalnya Yosua 5, lalu Yosua 6). Setelah satu blok habis, antrean pindah ke jenis kitab berikutnya.
- **Pasal panjang:** kalau pasal malam ini lebih dari 1.200 kata (25 pasal, misalnya Mazmur 119 dan Bilangan 7), pasal opsional tidak ditampilkan. Teksnya: "Pasal ini cukup panjang. Satu pasal sudah cukup untuk malam ini."
- **Putaran:** setelah 1.189 pasal selesai, antrean mulai lagi dari pasal pertama dengan label "Putaran ke-2". Pasal yang dibaca di putaran sebelumnya tetap tercatat di riwayat.
- **Membaca di luar urutan:** pasal lain tetap bisa dibuka dan dibaca lewat Cari atau Rak Alkitab, tetapi hanya pasal dari antrean (dan pasal pemulihan) yang punya centang. Ini menjaga aturan tetap sederhana. *(Lihat pertanyaan T5.)*

### 3.2 Malam
- Satu "malam" = tanggal di zona waktu perangkat, **dengan batas pukul 04.00**. Membaca pukul 00.30 tetap dihitung untuk malam sebelumnya, supaya membaca lewat tengah malam tidak memutus streak. *(Lihat T4.)*
- Server pengingat memakai aturan yang sama di zona `Asia/Jakarta` (WIB).

### 3.3 Streak dan pemulihan (usulan batas)
- **Malam menyala:** minimal 1 pasal antrean ditandai pada malam itu.
- **Streak** = jumlah malam berturut-turut yang menyala, berakhir malam ini (kalau sudah) atau kemarin. Malam yang dipulihkan ikut terhitung.
- **Malam bolong (1–3 malam berturut-turut):** streak tidak hilang. Lentera **meredup**, dan muncul **pasal pemulihan** sebanyak jumlah malam yang bolong.
- **Cara membayar:** pada malam berikutnya, **pasal kedua** yang Anda baca malam itu dihitung sebagai pasal pemulihan, maksimal **1 per malam**. Jadi satu malam tetap paling banyak dua pasal. Pasal pemulihan diambil dari antrean yang sama, tepat setelah pasal malam ini, sehingga Anda tetap maju di antrean, bukan membaca ulang. *(Lihat T3 untuk alternatif "pasal ketiga".)*
- **Batas waktu:** pemulihan harus lunas dalam **7 malam** sejak malam pertama yang bolong.
- **Batas jumlah:** maksimal **3 malam bolong** per pemulihan. Kalau 4 malam bolong berturut-turut, atau bolong lagi saat pemulihan belum lunas sehingga totalnya jadi 4, streak dimulai lagi.
- **Lunas:** malam-malam yang bolong dianggap tersambung. Streak kembali seperti tidak pernah putus (malam yang dipulihkan ikut dihitung), dan lentera menyala lagi. Di kalender, malam itu tampil sebagai bulan "dijahit" (purnama dengan garis jahitan kecil), bukan purnama biasa, supaya riwayatnya tetap jujur.
- **Lewat batas:** streak mulai dari nol, tetapi jumlah pasal, kunang-kunang, dan stiker **tidak berkurang**. "Streak terpanjang" tetap disimpan.

**Contoh (semua dalam satu pekan):**

| Malam | Yang terjadi | Streak | Lentera |
|---|---|---|---|
| Sen | 1 pasal | 5 | Menyala |
| Sel | — bolong | 5 (tertahan) | Redup, 1 pasal pemulihan |
| Rab | — bolong | 5 (tertahan) | Redup, 2 pasal pemulihan |
| Kam | 2 pasal (1 + 1 pemulihan) | 5 (tertahan) | Redup, 1 pasal pemulihan lagi |
| Jum | 2 pasal (1 + 1 pemulihan) | **9** (Sel–Rab tersambung) | Menyala |

Kalau pada hari Kamis Anda hanya membaca 1 pasal, malam itu tetap menyala. Pemulihan masih menunggu dan bisa dilunasi sampai 7 malam sejak Selasa.

---

## 4. Alur

1. **Buka aplikasi.** Beranda menampilkan sapaan, pasal malam ini, perkiraan menitnya, dan status lentera (menyala, redup dengan pemulihan, atau belum mulai).
2. **Mulai baca.** Muncul pasal pertama dengan centang "Tandai pasal ini selesai".
3. **Centang pasal pertama.** Malam menyala. Perayaan yang sudah ada berjalan: lentera menyala, kunang-kunang terbang ke streak, dan burung hantu tertidur. Lalu muncul kartu lembut berisi pasal opsional: "Masih ingin membaca? Yosua 6, sekitar 3 menit." Kalau ada pemulihan, kartu ini menjadi "Pasal pemulihan" (lihat teks).
4. **Pasal opsional (boleh dilewati).** Kalau dicentang, muncul perayaan kecil saja, tanpa perayaan besar kedua. Kalau itu pasal pemulihan, lentera yang redup kembali terang satu tingkat.
5. **Besok malam.** Antrean otomatis lanjut dari pasal pertama yang belum dibaca.

---

## 5. Layar yang berubah

### 5.1 Beranda / Malam ini (kepala halaman)
- Hapus chip "Hari 7 dari 365". Chip tinggal **jenis kitab** dan **zaman** (lini masa), plus **"Putaran ke-2"** mulai putaran kedua.
- Baris utama: "Malam ini Yosua 5, sekitar 3 menit."
- Catatan di bawah tombol, salah satu dari:
  - Streak berjalan: "Lentera Anda menyala 6 malam berturut-turut. Satu pasal sudah cukup untuk malam ini."
  - Ada pemulihan: "Lentera Anda sedang redup. Satu pasal malam ini menyalakannya lagi, dan satu pasal tambahan membantu memulihkan streak 6 malam Anda. Masih ada 5 malam untuk itu."
  - Streak baru dimulai ulang: "Lentera Anda menyala lagi mulai malam ini. 214 pasal yang sudah Anda baca tetap tersimpan."
  - Belum pernah membaca: "Mulai dari satu pasal saja."
- Lentera dan bulan dari langkah 6 tetap. Lentera tampil lebih redup saat ada pemulihan, memakai `--lv` yang sudah ada.

### 5.2 Halaman baca (tetap tenang, tanpa animasi baru)
- Bagian "Bacaan Alkitab hari ini" diganti **"Pasal malam ini"**: satu panel berisi teks pasal yang langsung terbuka (tidak perlu diketuk). Di akhir pasal ada tombol centang "Tandai Yosua 5 selesai".
- Renungan, ayat fokus, telaah, penerapan, refleksi, dan doa tetap di posisi yang sama, mengikuti keputusan T1.
- **Pasal opsional** tampil di bawah kartu selesai: tertutup dulu (`details`), dengan judul "Masih ingin membaca? Yosua 6" atau "Pasal pemulihan: Yosua 6".
- Mode Ringkas/Mendalam dan pengatur ukuran teks tetap.

### 5.3 Kartu selesai (selimut)
- Sebelum dicentang: "Selesai membaca Yosua 5?" dengan tombol "Tandai sudah dibaca". Tombol ini sama dengan centang pasal pertama.
- Sesudahnya: "Malam ke-6. Selamat tidur, Anya." dan "Lentera Anda kini berisi 214 kunang-kunang." Kalimat "…lagi sampai akhir tahun" dihapus.
- Ketika pemulihan lunas: "Lentera Anda menyala penuh lagi. Streak 9 malam tersambung kembali."

### 5.4 Arsip → "Riwayat"
- Daftar per **malam** (bukan per hari rencana): "Sabtu, 7 Nov: Yosua 5 dan Yosua 6", dengan tanda "Ada jurnal" bila ada. Ketuk untuk membuka bacaan dan jurnal malam itu.
- Hapus filter Sudah/Belum dan semua label "Belum dibaca" atau "Terlewat". Malam yang bolong **tidak ditampilkan** sebagai baris.
- Bagian "Berikutnya di antrean": 5 pasal berikutnya, hanya untuk dilihat.
- Catatan kaki "3 dari 365 malam sudah ditandai…" diganti "214 pasal sudah dibaca. Antrean lanjut dari Yosua 5."

### 5.5 Progres
- Subjudul "Rencana setahun…" diganti "Seluruh Alkitab, satu pasal demi satu pasal."
- Angka utama: **jumlah pasal** pada putaran ini, misalnya "214 pasal", dengan baris kecil "Putaran ke-1, 18% dari seluruh Alkitab". Persentase ini dihitung terhadap Alkitab, bukan terhadap tenggat. *(Lihat T6 kalau persentase pun terasa menekan.)*
- Kunang-kunang = jumlah malam yang menyala. Lentera makin penuh sampai 365 kunang-kunang, lalu tetap penuh. Teks "…malam lagi sampai lentera penuh" dihapus.
- Minggu ini: bulan purnama = menyala, sabit = malam ini, purnama berjahit = dipulihkan, bulan baru (netral, abu, bukan merah) = tidak membaca.
- Rak Alkitab dan kalender tetap.
- Pencapaian: ganti "Setahun penuh" menjadi "365 malam". Tambahkan dua stiker dengan ikon yang sudah ada: "Satu kitab tamat" dan "Seluruh Alkitab" (putaran pertama selesai).

### 5.6 Sambutan (onboarding)
- Ganti "menemani Anda membaca seluruh Alkitab dalam 365 hari" dengan "menemani Anda membaca Alkitab satu pasal setiap malam, bergantian antarjenis kitab, tanpa tenggat."

### 5.7 Akun
- Teks pengingat disesuaikan (lihat §7). Tidak ada pengaturan baru.

### 5.8 Status kosong dan khusus

| Keadaan | Teks |
|---|---|
| Belum pernah membaca | "Lentera Anda menunggu kunang-kunang pertama. Mulai dari satu pasal saja." |
| Riwayat kosong | "Belum ada malam yang tercatat. Malam pertama Anda akan muncul di sini." |
| Antrean putaran ini habis | "Anda sudah membaca seluruh Alkitab. Putaran ke-2 dimulai dari Matius 1." (dengan stiker baru) |
| Renungan untuk pasal ini belum ada | "Renungan untuk pasal ini sedang disiapkan. Bacalah pasalnya, lalu tuliskan refleksi Anda di bawah." |
| Pemulihan lewat batas | "Streak dimulai lagi malam ini. Tidak apa-apa; 214 pasal dan 37 kunang-kunang Anda tetap tersimpan." |

---

## 6. Renungan: mengikuti pasal atau tetap per tanggal? (T1)

| Pilihan | Cara kerja | Untung | Rugi | Dampak ke update mingguan Claude |
|---|---|---|---|---|
| **A. Per pasal (disarankan)** | File `content/pasal/<kitab>-<pasal>.json`. Renungan malam ini = renungan pasal pertama malam itu | Renungan selalu cocok dengan pasal yang dibaca; ayat fokus ada di pasal yang sama; bisa dipakai ulang di putaran ke-2 | Isi renungan per pasal lebih pendek fokusnya; butuh pindah format (14 file lama) | Tiap minggu Claude menulis renungan untuk **14 pasal berikutnya** di antrean, sesuai tempo maksimal 2 pasal per malam. Claude tidak bisa melihat posisi Anda di Supabase, jadi menulis di depan berdasarkan urutan. Kalau Anda lebih cepat, muncul status "sedang disiapkan". Bisa juga Anda beri tahu posisi Anda. |
| **B. Tetap per tanggal** | Seperti sekarang | Tidak ada perubahan isi | Renungan sering membahas pasal lain dari yang Anda baca; ayat fokus tidak nyambung | Tetap 7 renungan per minggu, tetapi semakin lama semakin tidak cocok |
| **C. Per pasal, hanya untuk pasal pertama tiap blok kitab** | Satu renungan untuk beberapa pasal berurutan (misalnya Yosua 5–8) | Lebih sedikit tulisan per minggu (sekitar 3–4) | Beberapa malam memakai renungan yang sama; terasa berulang | 3–4 renungan per minggu |

**Migrasi isi (pilihan A):** 14 renungan yang sudah ada (1–14 Nov) dipindahkan ke file per pasal sesuai ayat fokusnya. Misalnya renungan 7 Nov dengan fokus Yosua 5:13–15 menjadi `content/pasal/5-5.json`. Renungan yang fokusnya bukan di pasal pertama antrean tetap terpakai saat pasal itu tiba.

**Refleksi dan jurnal:** tetap disimpan **per malam** (tanggal), karena tabel `journals` sudah dikunci per `(user_id, date)` dan jurnal memang catatan malam itu. Pertanyaan refleksi diambil dari renungan pasal pertama malam itu.

---

## 7. Pengingat malam (T2)

Kedua jadwal Vercel Cron tetap (21.00 dan 22.00 WIB). Server membaca antrean dengan modul bersama yang sama dengan aplikasi.

| Jenis | Kapan dikirim | Judul | Isi |
|---|---|---|---|
| Malam (21.00) | Malam ini belum ada pasal ditandai | "Selamat malam, Anya" | "Yosua 5 menunggu Anda, sekitar 3 menit. Satu pasal sudah cukup." |
| Malam, saat ada pemulihan | Sama | "Lentera Anda menunggu" | "Satu pasal malam ini menyalakannya lagi. Kalau sempat, satu pasal tambahan memulihkan streak 6 malam Anda." |
| Lentera (22.00) | Streak ≥ 1 dan malam ini belum ditandai | "Lentera 6 malam masih menyala" | "Satu pasal sebelum tidur menjaganya tetap menyala. Kalau malam ini terlewat, besok masih bisa dipulihkan." |

Kalimat lama "Streak 6 malam hampir putus" dihapus karena menimbulkan rasa cemas.

---

## 8. Rencana data

### 8.1 Skema Supabase: tidak berubah
Semua progres disimpan di kolom JSONB `user_state.data`, jadi bentuk baru cukup ditambahkan di dalamnya. Tabel `journals` (per tanggal) dan `push_subscriptions` tetap. **Tidak ada SQL yang perlu dijalankan.** RLS yang ada tetap berlaku. Kalau ternyata dibutuhkan perubahan skema saat implementasi, SQL-nya akan ditulis di `supabase/migrations/` dan tidak dijalankan.

### 8.2 Bentuk data baru (di dalam `data`)
```json
{
  "v": 2,
  "round": 1,
  "done": { "5:5": "2026-11-07", "5:6": "2026-11-07" },
  "nights": { "2026-11-07": ["5:5", "5:6"] },
  "history": [{ "round": 1, "count": 1189, "ended": "2029-04-02" }],
  "read": { "...": "data lama, disimpan apa adanya" }
}
```
- `done`: pasal yang sudah dibaca **pada putaran ini**. Kuncinya `kitab:pasal` (indeks kitab sama dengan sekarang), dan nilainya tanggal malamnya.
- `nights`: riwayat semua malam di semua putaran. Ini satu-satunya sumber untuk streak, pemulihan, kunang-kunang, kalender, dan Riwayat.
- `history`: putaran yang sudah selesai.
- Streak, pemulihan, dan "pasal malam ini" **dihitung** dari `nights` dan `done`, tidak disimpan, supaya tidak bisa tidak sinkron.
- `fav` (favorit) dan pengaturan lain tidak berubah.

### 8.3 Migrasi data lama
Migrasi berjalan di aplikasi saat data dimuat, baik dari perangkat maupun dari Supabase, dan aman diulang (*idempotent*):
1. Untuk setiap `read[tanggalRencana] = { on }`, semua pasal pada hari rencana itu masuk ke `done` dengan tanggal `on`, dan ke `nights[on]`.
2. `read` **tidak dihapus**, supaya versi aplikasi lama yang masih tersimpan di cache HP tidak kehilangan apa pun. Kalau perangkat lama menambah `read` baru, migrasi menyerapnya lagi pada pemuatan berikutnya.
3. Setelah migrasi, `v: 2` disimpan dan dikirim ke Supabase lewat `saveState` yang sudah ada.
4. **Penggabungan cloud dan perangkat** (`saveState`, `loadCloud`) diperluas: `done` dan `nights` digabung per kunci (union), bukan ditimpa, sama seperti `read` sekarang.
5. **Streak lama tidak turun.** Tanggal di `read[*].on` menjadi malam di `nights`, jadi streak yang terhitung sama dengan sekarang. Contoh data Anda: 3 malam ditandai, dan pasal yang belum dibaca (misalnya Yosua 1–4) menjadi pasal terdepan di antrean.
6. **Jurnal** tetap per tanggal. Jurnal yang ditulis untuk tanggal rencana yang belum dibaca tetap ada dan tampil di Riwayat sebagai malam bertanda "Ada jurnal".

### 8.4 Modul dan tes
- `lib/antrean.js` (dipakai aplikasi dan `api/pengingat.js`):
  - `nightOf(date, tz)`: tanggal malam dengan batas pukul 04.00.
  - `queue(plan)`: 1.189 pasal sesuai urutan.
  - `tonight(queue, done, words)`: pasal malam ini dan pasal opsional.
  - `migrate(data, plan)`.
  - `streakState(nights, today)` → `{ streak, best, dim, owed, deadline, mended:[tanggal], restarted }`.
- `lib/streak.js` yang lama tetap ada sampai semua pemanggilnya pindah, lalu dihapus.
- `lib/antrean.test.js` (node --test), minimal mencakup:
  - Antrean: urutan sama dengan rencana; pasal yang belum dibaca kembali ke depan; pasal panjang tanpa pasal opsional; putaran ke-2 setelah 1.189.
  - Malam: 23.59 dan 00.30 masuk malam yang sama; 04.00 masuk malam baru; pergantian bulan dan tahun (31 Des → 1 Jan); WIB dihitung dari waktu UTC (misalnya 17.30 UTC = 00.30 WIB).
  - Streak: 1, 2, dan 3 malam bolong lalu lunas → streak pulih; 4 malam bolong → mulai lagi; bolong lagi saat pemulihan berjalan sampai total 4 → mulai lagi; lunas di malam ke-7 boleh, malam ke-8 tidak; 2 pasal tambahan dalam satu malam hanya membayar 1.
  - Migrasi: data lama 3 malam → `done` dan `nights` benar, diulang dua kali hasilnya sama, dan streak sebelum dan sesudah migrasi sama.

---

## 9. Yang tidak berubah
Ikon, font, warna, bentuk, maskot, dan animasi dari langkah 6. Halaman baca tanpa animasi baru. Cari, Istilah, Favorit, Kaitan, login, dan sinkron tidak diubah, kecuali tanggal yang dipakai oleh Kaitan (mengikuti renungan malam ini).

---

## 10. Pertanyaan untuk Anda

Jawab dengan nomor saja, atau tulis "setuju semua yang disarankan".

- **T1. Renungan:** A (per pasal, disarankan), B (per tanggal), atau C (per blok kitab)?
- **T2. Pengingat:** setuju dengan teks di §7? Tetap dua pengingat, atau cukup satu (yang pukul 21.00)?
- **T3. Pasal pemulihan:** dibayar dengan **pasal kedua** malam itu, sehingga satu malam tetap maksimal 2 pasal (disarankan)? Atau pasal pemulihan jadi pasal **ketiga**, di luar dua pasal malam ini?
- **T4. Batas malam pukul 04.00:** setuju? Atau tetap tengah malam?
- **T5. Membaca di luar antrean** (misalnya membuka Mazmur 23 lewat Cari): tidak menghitung untuk streak (disarankan, lebih sederhana)? Atau ikut dihitung sebagai pasal malam itu?
- **T6. Angka di Progres:** tampilkan "18% dari seluruh Alkitab"? Atau cukup jumlah pasal dan rak per kitab tanpa persen?
- **T7. Batas pemulihan:** 7 malam, maksimal 3 malam bolong, dan 1 pasal pemulihan per malam. Setuju, atau ada angka yang ingin diubah?
- **T8. Merge:** branch `redesign` belum digabung ke `main`, sedangkan renungan mingguan saya tulis langsung ke `main` dalam format per tanggal. Kalau T1 = A, renungan minggu depan (15–21 Nov) akan langsung saya tulis dalam format per pasal di `redesign`, dan format per tanggal di `main` saya hentikan sampai Anda merge. Setuju?
