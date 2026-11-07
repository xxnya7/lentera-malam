# Design system MASTER — Lentera Malam

Tanggal: 7 November 2026 · Dasar: kode di branch `redesign` (commit `c092716`) dan screenshot tampilan sekarang dalam mode gelap di layar 390 px. Dokumen ini tidak mengubah kode.

> Catatan jujur: semua rekomendasi di sini adalah hasil penalaran desain, bukan hasil pencarian dari basis data palet atau font. Rasio kontras di bawah **dihitung** dengan rumus WCAG 2.x dari nilai hex yang tertulis, bukan perkiraan.

**Cara memakai dokumen ini:**
- Dokumen ini adalah **Master**: aturan bawaan untuk semua halaman.
- Bagian **Zona Baca** dan **Zona Main** (bagian 4) berisi aturan khusus. Kalau aturan zona bertentangan dengan Master, aturan zona yang berlaku.
- Kalau nanti dibuat override untuk satu halaman (mis. `03-halaman-progres.md`), override itu mengalahkan zona dan Master.

**Dial yang dipakai:**
- **variance 6**: sedikit berani. Ada asimetri di Zona Main, tetapi Zona Baca tetap satu kolom yang rapi.
- **motion 5**: standar. Interaksi kecil di semua tempat, satu momen perayaan yang lebih ramai, dan tidak ada animasi yang berjalan terus.
- **density 3**: lega. Jarak antarbagian 32–48 px, dan teks diberi ruang bernapas.

---

## 1. Audit UX tampilan sekarang

Diurutkan menurut kategori prioritas 1–10. Setiap poin menyebut apa yang terjadi dan apa yang diubah oleh design system ini.

1. **Aksesibilitas**
   - **Kartu ayat tetap putih (`--paper:#FFFFFF`) di mode gelap.** Di kamar gelap, kartu ini paling menyilaukan, padahal justru bagian yang dibaca paling lama. Hal yang sama berlaku untuk kartu "Fakta hari ini" yang berwarna kuning terang penuh. → Di mode gelap, Zona Baca memakai latar gelap hangat dan tidak memakai kertas putih.
   - **Beberapa kontras di atas kertas putih gagal.** Nomor ayat `#9A99A4` hanya **2,81:1**, dan keterangan referensi `#8A8994` hanya **3,45:1**. Keduanya di bawah batas 4,5:1 untuk teks kecil. Teks *muted* di mode terang `#7A74A3` di atas `#F3EEFF` juga hanya **3,81:1**.
   - **Bintang di langit berkedip terus (`@keyframes tw`, *infinite*) dan tidak dimatikan oleh `prefers-reduced-motion`.** Pengaturan itu baru berlaku untuk `.burst`, `.sheet`, dan `.spin`.
   - **Toast tidak punya `role="status"` / `aria-live`**, sehingga pembaca layar tidak mengumumkan "Tercatat. Streak 3 malam."
   - **Label huruf kapital kecil** (`.passage .sup-title`, judul perikop dengan `text-transform:uppercase`) lebih sulit dibaca, terutama dalam cahaya redup.

2. **Sentuhan**
   - Banyak target yang lebih kecil dari 44 px: `.daypill` setinggi 28 px (bisa diketuk untuk membuka lini masa), `.mini` 32 px ("Buka bacaan Hari 2"), tombol streak dan tema 36 px, dan petak kitab di Progres sekitar 30 px.
   - Label di navigasi bawah hanya 10,5 px.

3. **Performa**
   - **Ikon memakai font ligatur (Material Symbols) dari Google Fonts dengan `display=block`.** Font dari domain lain tidak disimpan oleh service worker. Akibatnya, kalau sedang offline atau koneksinya lambat, ikon tampil sebagai teks mentah ("bedtime", "local_fire_…"). Hal ini terlihat jelas di screenshot uji. → Ganti dengan SVG inline.
   - `data/alkitab.json` (sekitar 4,7 MB) harus selesai dimuat sebelum halaman "Malam ini" muncul. Pada pemuatan pertama di jaringan seluler, layar hanya menampilkan *loading*. → Tampilkan *skeleton* dan renungan lebih dulu.

4. **Gaya**
   - Ada tiga ciri tampilan "AI-like" yang ingin dihindari:
     - gradien ungu di hero langit (`--skyTop:#2B1E6E` → `--skyBot:#5B2C7E`) dan di kartu Streak (ungu ke oranye)
     - deretan kartu seragam yang semuanya berpola "gelembung ikon + judul + subjudul"
     - navigasi bawah dari kaca *blur* yang hanya berfungsi sebagai hiasan
   - Ada terlalu banyak warna kartu dalam satu layar (ungu, biru-hijau, merah muda, kuning). Halaman baca jadi ramai, padahal seharusnya tenang.

5. **Tata letak**
   - Navigasi bawah yang mengambang menutupi teks ayat ketika halaman digulir (terlihat di screenshot), dan tidak ada ruang aman di bawah konten yang sedang dibaca.
   - Kartu di dalam kartu (kartu "Telaah kata" berisi kartu-kartu kata) menambah garis dan menyempitkan kolom teks.

6. **Tipografi dan warna**
   - Teks ayat hanya 17 px, padahal ini teks yang paling lama dibaca. Paragraf renungan 16 px dengan `color: var(--soft)` yang lebih redup daripada judulnya.
   - Hampir semua judul memakai bobot 800, sehingga semuanya terasa "berteriak".
   - Warna mentah (hex) masih ditulis langsung di komponen, misalnya `#3B3A44`, `#F0EFF4`, dan `#121117`. Akibatnya, mode gelap tidak bisa mengubahnya.

7. **Animasi**
   - Perayaan "Tandai sudah dibaca" hanya berupa percikan partikel (`burst`) dan toast. Momen terpenting setiap malam terasa biasa saja.
   - Animasi lain (bintang) justru berjalan terus tanpa makna.

8. **Formulir dan umpan balik**
   - Label input sudah ada (bagus). Pesan kesalahan login hanya muncul sebagai teks di atas formulir dan tidak terhubung dengan `aria-describedby` ke input yang salah.
   - Tombol "Keluar" tidak meminta konfirmasi.
   - Penanda "Terlewat" berwarna oranye muncul berderet di Arsip. Kesannya menghakimi, dan tidak cocok dengan suasana "teman baca".

9. **Navigasi**
   - Lima tab dengan label sudah benar. Namun:
     - Fokus tidak dipindahkan ke `<main>` saat tab berganti.
     - Halaman "Kaitan" bisa dibuka tetapi tidak punya tab sendiri, dan tombol kembalinya tidak jelas.
   - Di bagian "Sebelumnya di kitab ini", tautan glosarium tampil terpecah-pecah dan rata tengah ("imam", "yang mengangkat", "Tabut Perjanjian"). Ini bug tata letak dari elemen `button.gl` yang ada di dalam kartu itu.

10. **Data dan grafik**
    - Petak kitab di Progres membedakan "selesai" dan "belum" hanya dengan warna isian. Bilah progres 0,6% hampir tidak terlihat, padahal ini justru momen yang seharusnya memberi semangat di minggu-minggu awal.

---

## 2. Arah desain

**PATTERN**
- **Malam ini (beranda dan tempat membaca):** sapaan dan status malam → ayat fokus → renungan (latar kisah → penerapan) → refleksi dan jurnal → doa → **CTA "Selesai membaca"** di akhir. Sesudah itu baru ada "bonus": fakta, telaah kata, ayat kaitan, dan sumber.
- **CTA utama** (satu per layar) selalu ada di akhir alur baca. Tombol kecil yang lengket di atas navigasi muncul hanya setelah 60% halaman digulir.
- **Progres, Arsip, Pencapaian, dan Onboarding** masuk Zona Main dan boleh lebih ekspresif.

**STYLE: "Lampu Tidur" (Warm Night Editorial + Playful Moments)**
- **Inti:** gaya editorial yang tenang untuk teks (satu kolom, tipografi yang matang, tanpa kartu), dipadukan dengan momen-momen bermain yang hangat (maskot burung hantu, stiker, perayaan).
- **Kenapa cocok:** isinya teks panjang yang dibaca di tempat gelap. Gaya editorial membuat teks menjadi bintangnya. Keceriaan dipindahkan ke momen kecil, sehingga tidak mengganggu saat membaca.
- **Cocok untuk:** aplikasi kebiasaan harian yang lambat dan personal.
- **Risiko:** kalau terlalu tenang, aplikasi terasa kaku dan "gerejawi". Penangkalnya: maskot yang bereaksi, kata-kata yang bersahabat, dan perayaan yang terasa. Kalau terlalu ramai di Zona Main, aplikasi terasa seperti gim anak. Penangkalnya: satu ilustrasi atau satu momen per layar.

**Suara (kata-kata)**
- Pakai sapaan "Anda" yang hangat, kalimat pendek, dan pujian yang spesifik.
- Contoh yang dianjurkan: "Malam ke-3 berturut-turut. Pelan-pelan, tapi pasti." · "Belum sempat kemarin? Tidak apa-apa, bisa disusul kapan saja." · "Selamat tidur, Anya."
- Yang dihindari: nada menghakimi ("Terlewat!", "Streak hampir putus!") dan tanda seru yang berderet. Ganti "Terlewat" dengan "**Belum dibaca**", dan "Streak hampir putus" dengan "**Lentera Anda masih menyala, tinggal malam ini.**"

---

## 3. Token

### 3.1 Warna — mode gelap (bawaan)

Palet hangat seperti cahaya lampu tidur di kamar: latar cokelat-arang (tidak ungu, tidak biru), teks warna kertas tua (tidak putih murni), dan satu aksen kuning lentera.

| Token | Hex | Pemakaian |
|---|---|---|
| `--bg` | `#15110E` | Latar seluruh aplikasi dan Zona Baca |
| `--surface` | `#211B16` | Kartu di Zona Main, sheet, navigasi |
| `--surface-2` | `#2C241D` | Input, segmen, kartu bersarang (jarang) |
| `--line` | `#3A2F25` | Garis pemisah dekoratif (bukan batas komponen) |
| `--line-strong` | `#7A6A58` | Batas input dan kontrol (3,60:1 di atas `--bg`) |
| `--text` | `#EDE3D3` | Judul dan teks antarmuka |
| `--text-read` | `#DCCFBC` | Teks ayat dan renungan (sedikit lebih redup untuk mengurangi silau) |
| `--text-2` | `#C2B5A3` | Teks pendukung |
| `--muted` | `#9A8C7A` | Keterangan, label kecil |
| `--verse-num` | `#8F8170` | Nomor ayat |
| `--lamp` (primary/CTA) | `#F0B35A` | CTA, streak, sorotan ayat kunci, cincin fokus |
| `--on-lamp` | `#2A1A06` | Teks di atas `--lamp` |
| `--lamp-soft` | `rgba(240,179,90,.12)` | Latar sorotan ayat kunci, kartu fakta |
| `--plum` (secondary) | `#B79CDB` | Warna maskot, aksen di Zona Main |
| `--sage` (success) | `#7CC8AE` | Selesai, tersinkron |
| `--ember` (warning/error) | `#F0907A` | Galat, peringatan lembut |

**Kontras yang sudah dihitung (mode gelap):**

| Pasangan | Rasio | Status |
|---|---|---|
| `--text` di atas `--bg` | 14,78:1 | AA/AAA |
| `--text-read` di atas `--bg` | 12,24:1 | AAA |
| `--text-2` di atas `--bg` | 9,33:1 | AAA |
| `--muted` di atas `--bg` | 5,73:1 | AA |
| `--muted` di atas `--surface` | 5,20:1 | AA |
| `--muted` di atas `--surface-2` | 4,65:1 | AA (batas; jangan dipakai di bawah 14 px) |
| `--verse-num` di atas `--bg` | 4,96:1 | AA |
| `--lamp` di atas `--bg` | 10,10:1 | AAA |
| `--on-lamp` di atas `--lamp` | 9,05:1 | AAA |
| `--lamp` di atas `--surface-2` | 8,21:1 | AAA |
| `--plum` di atas `--bg` | 7,86:1 | AAA |
| `--sage` di atas `--surface` | 8,70:1 | AAA |
| `--ember` di atas `--bg` | 8,03:1 | AAA |
| `--line-strong` di atas `--surface` | 3,27:1 | Lolos 3:1 untuk batas komponen |

`--text-read` sengaja tidak memakai warna paling terang. Kontras setinggi `--text` (14,8:1) di layar gelap bisa membuat huruf tampak berpendar (*halation*) saat dibaca lama.

### 3.2 Warna — mode terang

Mode terang untuk siang hari: kertas krem, bukan putih murni.

| Token | Hex | Rasio penting |
|---|---|---|
| `--bg` | `#FBF6EE` | — |
| `--surface` | `#FFFDF8` | — |
| `--surface-2` | `#F3EADB` | — |
| `--line-strong` | `#8C7B69` | 3,79:1 di atas `--bg` |
| `--text` | `#2A211A` | 14,67:1 |
| `--text-read` | `#2A211A` | 14,67:1 |
| `--text-2` | `#5A4D40` | 7,59:1 |
| `--muted` | `#75685B` | 5,02:1 di atas `--bg`, 5,31:1 di atas `--surface` |
| `--lamp` (latar CTA) | `#E9A23B` | Teks `--on-lamp #2A1A06` di atasnya 7,76:1 |
| `--lamp-text` | `#9A5B0E` | Teks atau ikon berwarna lentera: 5,03:1 |
| `--plum` | `#6E4FA3` | 5,90:1 |
| `--sage` | `#1F7A62` | 4,86:1 |
| `--ember` | `#B4472E` | 5,03:1 |

Di mode terang, kuning lentera sebagai **teks** hanya boleh memakai `--lamp-text`. `#F0B35A` di atas krem hanya 1,73:1.

### 3.3 Tipografi

| Peran | Font (Google Fonts) | Kenapa |
|---|---|---|
| Teks baca (ayat, renungan, doa) | **Literata** (opsz 7–72, 400/500, italik) | Dirancang khusus untuk membaca panjang di layar, dan sumbu *optical size* membuatnya tetap jelas di ukuran besar maupun kecil. Sudah dipakai di versi sekarang. |
| Antarmuka (label, tombol, navigasi) | **Nunito** (400–800) | Ujung hurufnya membulat sehingga terasa ramah, "teman akrab", tetapi tetap jelas pada 13–15 px. Dukungan Latin dan angkanya lengkap. Bukan Inter, dan lebih hangat daripada Plus Jakarta Sans. |
| Judul besar di Zona Main (sapaan, angka streak, pencapaian) | **Fraunces** (SOFT 100, WONK 0, 600–700) | Serif "lembut" yang punya karakter dan memberi kesan hangat. Hanya untuk judul 28 px ke atas, tidak untuk teks. |

**Skala (px, tinggi baris):**

| Token | Ukuran / tinggi baris | Pemakaian |
|---|---|---|
| `--fs-xs` | 13 / 1.4 | Keterangan (minimum; jangan lebih kecil) |
| `--fs-sm` | 15 / 1.5 | Label, chip, navigasi bawah |
| `--fs-md` | 17 / 1.6 | Teks antarmuka |
| `--fs-read` | **19 / 1.75** | Ayat dan renungan (bisa diubah: 17 / 19 / 21) |
| `--fs-key` | 23 / 1.5 | Ayat kunci |
| `--fs-h3` | 20 / 1.3 | Judul bagian di Zona Baca (Nunito 700) |
| `--fs-h2` | 26 / 1.2 | Judul halaman |
| `--fs-h1` | 34 / 1.1 | Sapaan atau hero di Zona Main (Fraunces) |
| `--fs-stat` | 56 / 1 | Angka streak dan pencapaian (Fraunces, angka tabular) |

**Aturan tipografi:**
- **Bobot:** 400 untuk teks, 600–700 untuk judul, 500 untuk label. Bobot 800 hanya untuk angka besar.
- **Panjang baris di Zona Baca:** `max-width: 34rem`, sekitar 50–60 karakter di HP.
- **Huruf kapital:** tidak memakai label kapital kecil. Kategori kecil ditulis dengan huruf biasa (*sentence case*) lewat `--fs-sm`, dengan Nunito 600 dan `--muted`.
- **Angka:** angka streak, hari, dan persen memakai `font-variant-numeric: tabular-nums`.
- **Nomor ayat:** Nunito 13 px, `--verse-num`, superscript ringan. Jangan lebih kecil.
- **Pemuatan font:** simpan ketiga font di server sendiri (`/fonts/*.woff2`) dengan `font-display: swap` dan muat lebih dulu (*preload*) hanya Literata 400. Dengan begitu, font tetap tersedia saat offline.

### 3.4 Jarak, radius, elevasi

| Token | Nilai |
|---|---|
| Skala jarak (4/8 pt) | `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64` |
| Tepi layar | 20 px (ditambah *safe area*) |
| Jarak antarparagraf baca | 16 px |
| Jarak antarbagian di Zona Baca | 48 px |
| Jarak antarkartu di Zona Main | 16 px |
| Radius | `--r-sm 12` (chip, input) · `--r-md 20` (kartu) · `--r-lg 28` (sheet) · `999` (tombol) |
| Elevasi | Hanya dua tingkat. `0` untuk semua permukaan di halaman. `1` hanya untuk sheet dan navigasi: `0 -8px 24px rgba(0,0,0,.35)`. Di mode gelap, kedalaman ditunjukkan lewat warna permukaan, bukan bayangan. |
| Blur | Tidak ada blur dekoratif. Navigasi memakai `--surface` yang padat, dengan garis atas `--line`. Blur hanya untuk latar di belakang sheet (`backdrop-filter: blur(4px)` + gelap 50%), sebagai tanda bahwa latar itu bisa diketuk untuk menutup. |

### 3.5 Ikon dan ilustrasi

- **Ikon:** **Phosphor Icons** (lisensi MIT) dalam bentuk **SVG inline sprite**, bukan font. Gaya *Regular* untuk navigasi dan kontrol. Gaya *Duotone* hanya di Zona Main, karena memberi karakter tanpa harus berwarna-warni. Ukurannya 24 px dengan garis 1,5. Satu keluarga ikon saja, dan tidak ada emoji.
- **Maskot burung hantu "Lentera":** dipertahankan sebagai identitas, tetapi **digambar ulang tanpa gradien**. Bentuknya flat dengan dua warna (`--plum` dan krem `#F6E3C0`) ditambah lentera `--lamp`. Ada empat ekspresi: *mengantuk* (beranda sebelum membaca), *membaca* (Zona Baca, kecil, di judul), *gembira* (perayaan), dan *tidur* (setelah selesai, "Selamat tidur").
- **Dekorasi:** bulan sabit dan beberapa bintang statis boleh muncul di hero Zona Main. Tidak ada gradien langit. Latar hero memakai `--surface` dengan satu lingkaran cahaya `--lamp-soft` di belakang bulan.

### 3.6 Gerak (motion 5)

| Token | Nilai | Pemakaian |
|---|---|---|
| `--dur-xs` | 120 ms | Tekan tombol, saklar |
| `--dur-sm` | 200 ms | Ganti tab, chip, toast keluar |
| `--dur-md` | 320 ms | Sheet masuk, kartu muncul |
| `--dur-celebrate` | 900 ms | Perayaan selesai membaca (sekali) |
| `--ease-out` | `cubic-bezier(.2,.8,.2,1)` | Elemen masuk |
| `--ease-in` | `cubic-bezier(.4,0,1,1)` | Elemen keluar (durasinya sekitar 65% durasi masuk) |
| Jeda bertahap (*stagger*) | 40 ms | Maksimal 5 item |

**Momen perayaan ("Selesai membaca"):**
1. Tombol menyusut ke 0,96, lalu kembali dengan sedikit pantulan (120 ms).
2. Lentera di tombol "menyala": lingkaran `--lamp-soft` membesar dari 0,6 ke 1,4 sambil memudar (500 ms).
3. Maskot berganti ke ekspresi *gembira* dan melompat sekali (translateY −8 px, 400 ms).
4. Sekitar 8–12 bintang kecil berwarna `--lamp` dan `--plum` terlempar dari tombol (900 ms). Jangan memakai konfeti pelangi.
5. Angka streak di bilah atas berganti dengan animasi gulir, lalu toast menampilkan "Malam ke-4. Selamat tidur, Anya."
6. Pada milestone (7, 30, 100, 365 malam), muncul satu sheet pencapaian berisi stiker maskot. Sheet itu baru muncul setelah perayaan selesai dan bisa ditutup dengan satu ketukan.

**Aturan gerak:**
- Animasi hanya memakai `transform` dan `opacity`.
- Paling banyak dua elemen bergerak bersamaan.
- Tidak ada animasi yang berjalan terus, termasuk bintang berkedip.
- Semua animasi bisa disela dan tidak pernah menghalangi ketukan.

**`prefers-reduced-motion: reduce`:**
- Semua gerakan pindah, lompat, dan partikel dimatikan.
- Perayaan diganti dengan perubahan warna tombol menjadi `--sage` dan pergantian ekspresi maskot tanpa gerak, plus toast (fade 120 ms).
- Sheet langsung muncul tanpa gerakan geser.

### 3.7 Blok CSS acuan

```css
:root{
  --bg:#15110E; --surface:#211B16; --surface-2:#2C241D; --line:#3A2F25; --line-strong:#7A6A58;
  --text:#EDE3D3; --text-read:#DCCFBC; --text-2:#C2B5A3; --muted:#9A8C7A; --verse-num:#8F8170;
  --lamp:#F0B35A; --on-lamp:#2A1A06; --lamp-soft:rgba(240,179,90,.12); --lamp-text:var(--lamp);
  --plum:#B79CDB; --sage:#7CC8AE; --ember:#F0907A; --cream:#F6E3C0;
  --font-read:"Literata",Georgia,serif; --font-ui:"Nunito",system-ui,sans-serif; --font-display:"Fraunces",Georgia,serif;
  --fs-xs:13px; --fs-sm:15px; --fs-md:17px; --fs-read:19px; --fs-key:23px; --fs-h3:20px; --fs-h2:26px; --fs-h1:34px; --fs-stat:56px;
  --s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:24px; --s6:32px; --s7:48px; --s8:64px; --gut:20px;
  --r-sm:12px; --r-md:20px; --r-lg:28px;
  --dur-xs:120ms; --dur-sm:200ms; --dur-md:320ms; --dur-celebrate:900ms;
  --ease-out:cubic-bezier(.2,.8,.2,1); --ease-in:cubic-bezier(.4,0,1,1);
  color-scheme:dark;
}
:root[data-theme="light"]{
  --bg:#FBF6EE; --surface:#FFFDF8; --surface-2:#F3EADB; --line:#E6DAC7; --line-strong:#8C7B69;
  --text:#2A211A; --text-read:#2A211A; --text-2:#5A4D40; --muted:#75685B; --verse-num:#75685B;
  --lamp:#E9A23B; --on-lamp:#2A1A06; --lamp-soft:rgba(233,162,59,.16); --lamp-text:#9A5B0E;
  --plum:#6E4FA3; --sage:#1F7A62; --ember:#B4472E;
  color-scheme:light;
}
@media (prefers-reduced-motion:reduce){ *,*::before,*::after{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important} }
```

Mode gelap menjadi bawaan, karena aplikasi ini dipakai pada malam hari. Kalau pengguna belum memilih, mode terang hanya dipakai bila sistem HP sedang dalam mode terang.

---

## 4. Dua zona

### 4.1 Zona Baca: ayat, renungan, telaah, doa (halaman "Malam ini" mulai dari ayat fokus, dan sheet ayat)

Tujuannya tenang dan fokus, dengan teks sebagai prioritas utama.

- **Tanpa kartu.** Teks langsung berada di atas `--bg`. Bagian dipisahkan oleh jarak 48 px dan judul bagian `--fs-h3`. Tidak ada gelembung ikon, cukup satu ikon Phosphor 20 px berwarna `--muted` di depan judul bila perlu.
- **Ayat fokus:**
  - teks Literata `--fs-read` berwarna `--text-read`
  - **ayat kunci** memakai `--fs-key` dan garis kiri 3 px `--lamp`, dengan latar `--lamp-soft` dan radius `--r-sm`
  - referensi ("Yosua 5:13–15 · AYT") ditulis di bawah dengan `--fs-sm` dan `--muted`
- **Renungan:** paragraf `--fs-read` dengan tinggi baris 1,75, berwarna `--text-read`. Jangan memakai warna yang lebih redup untuk teks utama.
- **Telaah kata:** bukan kartu di dalam kartu, melainkan daftar definisi (`<dl>`): kata asli dalam Literata italik 20 px, artinya dalam `--fs-sm` `--muted`, dan penjelasan dalam `--fs-md`.
- **Tautan glosarium:** garis bawah titik-titik `--line-strong`, tetap mengalir di dalam kalimat (`display:inline`). Ketuk untuk membuka sheet. Area ketuknya diperluas dengan `padding-block:6px` tanpa menggeser baris.
- **Doa:** Literata italik `--fs-read`, rata kiri, dengan satu ilustrasi bulan sabit kecil di depan.
- **Warna di zona ini hanya:** `--text-read`, `--muted`, dan `--lamp`. Tidak ada plum, sage, atau warna kartu lain.
- **Kontrol baca** berada di bilah tipis di atas ayat: ukuran teks (A− / A+, target 44 px) dan mode Ringkas/Mendalam.
- **Navigasi bawah tidak menutupi teks.** Navigasi bersembunyi saat menggulir ke bawah dan muncul lagi saat menggulir ke atas. Di akhir konten ada ruang kosong setinggi navigasi + 24 px.
- **Gerak:** tidak ada animasi selain sheet dan perayaan di akhir.

### 4.2 Zona Main: hero beranda, Progres, Arsip, Pencapaian, Onboarding, Akun

Zona ini boleh lebih bermain.

- **Hero beranda:**
  - **isi:** sapaan Fraunces `--fs-h1` ("Selamat malam, Anya"), maskot *mengantuk* yang bertengger di tepi kanan dan sedikit keluar dari kotak (variance 6), satu baris status ("Hari 7 · Yosua 5–8 · 12 menit"), dan bulan sabit
  - **latar:** `--surface` dengan cahaya `--lamp-soft`, bukan gradien
- **Kartu:** `--surface`, radius `--r-md`, tanpa garis tepi. **Jangan berderet seragam.** Pakai ritme campuran, misalnya satu kartu lebar, lalu dua kartu dengan tinggi berbeda, lalu satu baris tanpa kartu.
- **Streak:**
  - angka Fraunces `--fs-stat` berwarna `--lamp` dengan ikon lentera (bukan api)
  - kalender minggu ini berupa 7 titik:
    - **sudah dibaca:** isi `--lamp` dan tanda centang
    - **hari ini:** cincin putus-putus
    - **belum:** garis `--line-strong`
  - status selalu memakai bentuk dan ikon, bukan warna saja
- **Progres Alkitab:**
  - ganti bilah tipis 0,6% dengan **"rak buku"**: 66 punggung buku kecil yang "terisi" dari bawah sesuai jumlah pasal yang sudah dibaca
  - setiap punggung buku diberi label singkatan saat diketuk
  - tambahkan kalimat penyemangat, misalnya "7 pasal. Sudah lebih panjang dari seluruh kitab Rut."
- **Arsip:** penanda "Belum dibaca" memakai garis `--line-strong` dan teks `--muted`, bukan oranye. Penanda "Sudah" memakai ikon centang `--sage`.
- **Pencapaian:** stiker bundar maskot dengan atribut berbeda (topi tidur, gulungan kitab, bintang). Pencapaian yang belum terbuka tampil sebagai siluet `--surface-2` dengan petunjuk ("Baca 7 malam berturut-turut").
- **Onboarding** (3 layar maksimal, bisa dilewati):
  1. maskot memperkenalkan diri
  2. pilih nama panggilan
  3. pilih jam pengingat dan aktifkan notifikasi
- **Ikon Duotone** boleh dipakai di zona ini.

---

## 5. Komponen inti

| Komponen | Spesifikasi |
|---|---|
| **CTA utama** | Tinggi 56 px, lebar penuh, radius 999, latar `--lamp`, teks `--on-lamp` Nunito 700 17 px, ikon lentera. Saat ditekan: `scale(.97)`. Status sibuk: ikon berputar dan teks "Menyimpan…". Satu CTA per layar. |
| **Tombol sekunder** | Tinggi 48 px, latar `--surface-2`, teks `--text`. |
| **Tombol teks** | Tinggi minimal 44 px (area ketuk), teks `--lamp-text`, garis bawah saat fokus atau ditekan. |
| **Chip / pil** | Tinggi visual 32 px, area ketuk 44 px (padding transparan), Nunito 600 `--fs-sm`. |
| **Navigasi bawah** | 5 tab dengan label 13 px (bukan 10,5). Tinggi 64 px + *safe area*, latar `--surface` padat, menempel di bawah (tidak mengambang). Tab aktif: ikon terisi + label `--lamp` + titik 4 px di atas ikon, tanpa pil kuning besar. |
| **Bilah atas** | Tinggi 56 px. Streak (lentera + angka) dan tombol tema masing-masing punya target 44×44. |
| **Saklar** | Lebar 52 × tinggi 32, area ketuk 44. Saat menyala: `--sage` dengan ikon centang di kenop. Status juga ditunjukkan oleh bentuk, bukan warna saja. |
| **Input** | Tinggi 52 px, latar `--surface-2`, garis `--line-strong` 1,5 px, saat fokus cincin `--lamp` 2 px. Label selalu terlihat di atas. Pesan galat berada di bawah input dengan `aria-describedby`. |
| **Sheet** | Radius atas `--r-lg`, latar `--surface`, pegangan 36×4. Ditutup dengan ketuk latar, geser ke bawah, Esc, atau tombol "Tutup" (44 px). Fokus berpindah ke judul sheet saat dibuka. |
| **Toast** | Muncul di atas navigasi, latar `--text` dan teks `--bg`. Memakai `role="status"` dan `aria-live="polite"`. Tampil 4 detik. Tidak mencuri fokus. |
| **Skeleton** | Balok `--surface-2` dengan radius `--r-sm` dan denyut opasitas 0,6↔1 (dimatikan oleh *reduced motion*). Dipakai saat menunggu lebih dari 1 detik. |
| **Cincin fokus** | `outline: 2px solid var(--lamp); outline-offset: 3px` di semua elemen interaktif. Jangan pernah dihapus. |

---

## 6. AVOID

Hal-hal yang tidak boleh dipakai di aplikasi ini:

1. **Kertas putih atau kartu kuning terang di mode gelap.** Ini sumber silau terbesar di kamar gelap.
2. **Gradien ungu-biru atau ungu-oranye** untuk langit, kartu streak, atau tombol. Kedalaman ditunjukkan lewat warna permukaan yang padat dan satu cahaya lentera.
3. **Deretan kartu seragam berpola "gelembung ikon + judul + subjudul".** Di Zona Baca kartu tidak dipakai sama sekali. Di Zona Main ritmenya dicampur.
4. **Label huruf kapital kecil di atas judul, emoji sebagai ikon, dan kaca *blur* sebagai hiasan.**
5. **Bahasa yang menghakimi dan warna peringatan untuk bacaan yang belum dikerjakan.** Ini kebiasaan rohani yang lembut, bukan tagihan.
6. **Animasi yang berjalan terus** (bintang berkedip, maskot bergoyang terus) dan perayaan yang menutup layar lebih dari 1 detik.
7. **Satu font untuk semuanya**, termasuk Inter. Pakai tiga peran yang jelas: Literata untuk membaca, Nunito untuk antarmuka, dan Fraunces hanya untuk momen besar.

---

## 7. Pre-delivery checklist

Dipakai saat implementasi nanti.

- [ ] Tidak ada emoji sebagai ikon; semua ikon Phosphor SVG, satu keluarga dengan garis yang sama.
- [ ] Semua elemen interaktif punya `cursor:pointer` dan cincin fokus `--lamp` yang terlihat.
- [ ] Kontras teks minimal 4,5:1 di mode gelap **dan** terang, diperiksa ulang dari nilai token akhir. Komponen dan ikon bermakna minimal 3:1.
- [ ] `prefers-reduced-motion` dihormati: tidak ada partikel, pantulan, atau animasi yang berulang.
- [ ] Teks baca 19 px secara bawaan, bisa diubah ke 17 atau 21, dan tinggi baris 1,75.
- [ ] Target sentuh minimal 44×44 dengan jarak 8 px, termasuk chip, nomor hari, petak kitab, dan tombol bilah atas.
- [ ] Navigasi bawah tidak pernah menutupi teks yang sedang dibaca. *Safe area* atas dan bawah dihormati.
- [ ] Ikon dan font tetap tampil saat offline (disimpan di server sendiri dan di-cache service worker).
- [ ] Status tidak pernah hanya dibedakan dengan warna (streak, arsip, progres, saklar).
- [ ] Chip, label, dan teks panjang (URL sumber) membungkus ke baris berikutnya tanpa terpotong (`overflow-wrap:anywhere`).
- [ ] Berfungsi di lebar 375, 390, 430, dan 768 px, serta di posisi lanskap.
- [ ] Menekan tombol tidak menggeser tata letak.
- [ ] Tidak ada warna hex mentah di komponen; semuanya lewat token.
- [ ] Fokus berpindah ke `<main>` saat tab berganti, dan ke judul sheet saat sheet dibuka.
