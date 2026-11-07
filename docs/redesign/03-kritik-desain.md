# Kritik desain dan audit teknis — Lentera Malam

Tanggal: 7 November 2026 · Branch `redesign` (commit `3494beb`) · Acuan: `docs/redesign/02-design-system.md` (disingkat **DS**). Dokumen ini tidak mengubah kode.

## Cara penilaian

**Mode per halaman:**

| Mode | Halaman |
|---|---|
| **Read** | Bagian baca di "Malam ini" (dari ayat fokus sampai doa), sheet ayat |
| **Experience** | Hero beranda di "Malam ini", Progres, Onboarding (layar selamat datang), Login |
| **Operate** | Cari, Arsip, Akun, Kaitan. Mode untuk halaman ini tidak Anda sebutkan, jadi saya pilih Operate karena di halaman-halaman ini pengguna sedang menyelesaikan tugas. |

**Pencapaian** belum ada sebagai halaman. Halaman ini dibahas di temuan 14.

**Metode:**
- Setiap halaman saya buka di browser otomatis pada layar 390 × 844, dalam mode gelap dan terang.
- Login, data, dan Supabase memakai versi tiruan.
- Ukuran target sentuh dan teks yang lebih kecil dari 13 px saya ukur dengan skrip.
- Kontras saya hitung dengan rumus WCAG.

**Keterbatasan uji:**
- Di lingkungan uji, Google Fonts tidak bisa dimuat. Akibatnya, ikon tampil sebagai teks mentah. Hal yang sama juga terjadi pada pengguna sungguhan saat offline (temuan 2), tetapi saat online ikon seharusnya tampil normal.
- Layar selamat datang tidak bisa dimunculkan dengan data uji, jadi layar itu saya nilai dari kodenya (`vWelcome`, `app.js`).

---

## Vonis singkat

| Pertanyaan | Nilai | Alasan |
|---|---|---|
| **Menyenangkan dipakai setiap malam?** | **2/5** | Isinya kaya, tetapi momen terpenting (menyelesaikan bacaan) hanya dirayakan dengan percikan kecil dan kartu bergradien. Kata-kata seputar streak cenderung menakut-nakuti ("akan kembali ke nol"), bukan menemani. |
| **Punya karakter sendiri?** | **3/5** | Maskot burung hantu dengan lentera adalah aset terkuat, tetapi hanya muncul di tiga tempat dan tidak pernah bereaksi. Selebihnya kepribadian aplikasi dibawa oleh warna-warni kartu, bukan oleh suara atau interaksi. |
| **Tidak terlihat seperti template AI?** | **2/5** | Masih ada lima pola yang langsung terbaca sebagai template: gradien langit ungu, kartu "gelembung ikon + judul + subjudul" yang berderet, angka besar dengan label kecil di kartu Streak (*hero-metric*), navigasi kaca *blur* yang mengambang, dan daftar fitur berikon di layar sambutan. |

---

## Skor per halaman (1–5)

| Halaman | Mode | Kejelasan tujuan | Hierarki | Konsistensi | Umpan balik & status | Cegah & pulihkan galat | Aksesibilitas | Integritas estetika |
|---|---|---|---|---|---|---|---|---|
| Malam ini: hero | Experience | 4 | 3 | 3 | 3 | 4 | 2 | 2 |
| Malam ini: bagian baca | Read | 4 | 2 | 2 | 3 | 4 | 2 | 2 |
| Sheet ayat | Read | 4 | 2 | 3 | 3 | 4 | 2 | 2 |
| Login | Experience | 4 | 3 | 4 | 3 | 3 | 3 | 3 |
| Onboarding | Experience | 3 | 3 | 3 | 2 | 3 | 3 | 2 |
| Progres | Experience | 3 | 2 | 3 | 2 | 4 | 2 | 2 |
| Cari | Operate | 5 | 4 | 3 | 4 | 4 | 3 | 3 |
| Arsip | Operate | 4 | 4 | 4 | 3 | 4 | 3 | 3 |
| Akun | Operate | 3 | 2 | 2 | 4 | 3 | 3 | 2 |
| Kaitan | Operate | 2 | 3 | 3 | 2 | 4 | 3 | 3 |

Nilai tertinggi ada di **Cari**: tujuannya jelas, hasilnya cepat, dan kata yang dicari disorot. Nilai terendah ada di bagian **baca**, padahal bagian inilah yang dipakai paling lama setiap malam.

---

## Daftar perbaikan, urut dari yang paling penting

Label: **P0** menghalangi pemakaian utama · **P1** penting · **P2** sebaiknya · **P3** pemolesan. Setiap temuan mencantumkan lokasi, masalah, dan perubahan yang disarankan sesuai DS.

### P0

**1. Bagian baca menyilaukan di kamar gelap** (Read · `style.css` L5, L74–83 `.hero`/`.passage`; L107–116 `.fact`)
- **Masalah:** Di mode gelap, kartu ayat tetap putih (`--paper:#FFFFFF` tidak diubah di blok mode gelap), dan kartu "Fakta hari ini" berwarna kuning terang penuh. Di screenshot mode gelap, keduanya adalah area paling terang, dan justru di sanalah mata paling lama berada.
- **Ubah:** Ikuti DS 4.1:
  - teks ayat langsung di atas `--bg #15110E` dengan warna `--text-read #DCCFBC` (12,24:1)
  - ayat kunci diberi latar `--lamp-soft`, radius `--r-sm`, dan ikon lentera kecil di depan nomor ayatnya
  - kartu fakta pindah ke Zona Main dengan latar `--lamp-soft`, bukan kuning penuh

  **Koreksi DS:** di DS 4.1, ayat kunci memakai "garis kiri 3 px `--lamp`". Garis tepi berwarna yang lebih tebal dari 1 px termasuk pola yang dihindari, jadi saran itu saya ganti dengan latar dan ikon seperti di atas. DS 4.1 perlu diperbarui saat implementasi.

**2. Ikon berubah menjadi teks saat offline atau koneksi lambat** (semua halaman · `index.html` L19; `sw.js` L33)
- **Masalah:** Ikon memakai font ligatur Material Symbols dari Google Fonts dengan `display=block`. Service worker tidak menyimpan file dari domain lain. Tanpa font itu, tombol menampilkan "bedtime", "local_fire_department", dan teks sejenis. Ini terlihat di semua screenshot uji, dan bisa terjadi juga di kamar dengan sinyal lemah.
- **Ubah:** Ganti dengan SVG sprite Phosphor yang disimpan di repositori (DS 3.5). Ikon menjadi bagian dari aplikasi, ikut tersimpan offline, dan tidak menunggu font.

**3. Navigasi bawah menutupi teks yang sedang dibaca** (semua halaman · `style.css` L164–170 `nav.bottom`)
- **Masalah:** Navigasi berupa pil kaca *blur* yang mengambang di atas konten. Di "Malam ini", pil itu berada tepat di atas baris ayat (terlihat di screenshot). Blur di sini hanya hiasan, sesuatu yang dilarang di DS 6.
- **Ubah:** Pakai navigasi padat `--surface` yang menempel di bawah, setinggi 64 px plus *safe area*, dengan label 13 px. Di Zona Baca, navigasi bersembunyi saat menggulir ke bawah dan muncul lagi saat menggulir ke atas (DS 4.1, DS 5).

**4. Kontras teks gagal di beberapa tempat** (Read · `style.css` L82 `.passage p sup`, L88 `.ref small`; token `--muted` mode terang)
- **Masalah:**
  - Nomor ayat `#9A99A4` di atas putih hanya **2,81:1**.
  - Keterangan referensi `#8A8994` hanya **3,45:1**.
  - Teks *muted* mode terang `#7A74A3` di atas `#F3EEFF` hanya **3,81:1**.
  - Semuanya di bawah batas 4,5:1 untuk teks kecil.
- **Ubah:** Pakai token DS: `--verse-num #8F8170` di atas `--bg` gelap (4,96:1) dan `--muted #75685B` di atas krem (5,02:1).

### P1

**5. Momen "selesai membaca" terlalu datar** (Read → Experience · `app.js` tombol `data-act="read"` dan fungsi `burst()`; `style.css` L373 `.celebrate`)
- **Masalah:** Ini satu-satunya momen yang terjadi setiap malam, tetapi perayaannya hanya percikan partikel 1 detik, toast, dan kartu bergradien hijau-biru yang menggantikan tombol. Maskot tidak bereaksi, dan angka streak di bilah atas berganti tanpa terlihat.
- **Ubah (delight utama):** Ikuti urutan DS 3.6:
  1. tombol memantul
  2. lentera "menyala"
  3. maskot berganti ke ekspresi *gembira* dan melompat sekali
  4. 8–12 bintang hangat terlempar dari tombol
  5. angka streak berganti dengan animasi gulir
  6. muncul toast "Malam ke-4. Selamat tidur, Anya."

  Sesudahnya, maskot di akhir halaman berganti ke ekspresi *tidur*. Untuk *reduced motion*: hanya warna tombol berubah dan ekspresi maskot berganti, tanpa gerak.

**6. Kartu Streak memakai pola hero-metric bergradien** (Progres · `app.js` `vProgres`; `style.css` kartu streak)
- **Masalah:**
  - Tiga angka besar dengan label kecil ("1 Saat ini · 1 Terpanjang · 2 Hari dibaca") di atas gradien ungu-oranye adalah pola template yang paling mudah dikenali.
  - Bilah "Seluruh Alkitab 0,6%" hampir tidak terlihat dan tidak memberi semangat di minggu-minggu awal.
- **Ubah:**
  - Tampilkan satu angka Fraunces `--fs-stat` dengan ikon lentera dan kalimat yang hangat ("Lentera Anda menyala 1 malam").
  - Di bawahnya, kalender 7 titik untuk minggu ini, dengan status yang dibedakan lewat bentuk dan ikon, bukan warna saja.
  - Ganti bilah dengan **rak buku 66 kitab** (DS 4.2), ditambah perbandingan yang menyenangkan ("7 pasal, sudah lebih panjang dari seluruh kitab Rut").

**7. Bug: tautan istilah di "Sebelumnya di kitab ini" tampil terpecah-pecah** (Read · `app.js` `prevCard`, baris `<p class="prose">…`)
- **Masalah:** `.prose` memakai `display:flex; flex-direction:column`. Karena ringkasan ditaruh di dalam satu `<p class="prose">`, setiap tautan glosarium (`button.gl`) menjadi blok tersendiri, sehingga muncul baris-baris terpisah yang rata tengah ("imam", "yang mengangkat", "Tabut Perjanjian"). Ini terlihat di screenshot dan terukur oleh skrip: lebar tautan mencapai 310 px.
- **Ubah:** Bungkus dengan `<div class="prose"><p>…</p></div>`, sama seperti paragraf lain, atau buat `p.prose` tidak memakai flex. Perubahannya satu baris.

**8. Bagian baca terdiri atas deretan kartu seragam berwarna-warni** (Read · `vMalam`: Latar kisah, Telaah kata, Penerapan, Bacaan Alkitab, Sebelumnya, Sumber)
- **Masalah:**
  - Setiap bagian adalah kartu berlatar warna berbeda (ungu, biru-hijau, merah muda, cokelat) dengan "gelembung ikon + judul + subjudul" yang sama persis.
  - Telaah kata bahkan berisi kartu di dalam kartu.
  - Akibatnya, halaman baca terasa seperti dasbor, mata terus berpindah warna, dan kolom teks menyempit dua kali.
- **Ubah:** Ikuti DS 4.1:
  - Tanpa kartu. Bagian dipisahkan oleh jarak 48 px dan judul 20 px.
  - Ikon cukup satu, kecil, dan berwarna `--muted`.
  - Telaah kata menjadi daftar definisi.
  - Hanya tiga warna di zona ini.

**9. Banyak target sentuh dan teks di bawah ukuran minimum** (semua halaman)
- **Masalah (hasil ukur):**

  | Elemen | Ukuran sekarang |
  |---|---|
  | `.daypill` (bisa diketuk untuk lini masa) | 163 × **28** px |
  | `.mini` ("Buka bacaan Hari 2", "Daftarkan ulang") | **32** px |
  | Tombol tema dan streak | **36** px |
  | Segmen Ringkas/Mendalam dan tab Cari | **40** px |
  | Saklar | **32** px tinggi |
  | Tautan Daftar / Lupa kata sandi | **34** px |

  Teks di bawah 13 px:
  - label navigasi **10,5 px**
  - pil Arsip **11 px**
  - petak kitab **11 px**
  - *daypill*, tag, dan status **12 px**
  - nomor ayat **11 px**
- **Ubah:** Semua target minimal 44 × 44 px; kalau tampilannya harus lebih kecil, pakai *padding* transparan. Teks minimal 13 px, dan label navigasi 13 px (DS 3.3, DS 5).

**10. Tombol utama bergradien oranye dengan cahaya, dan sheet ayat punya tiga tombol yang sama-sama mencolok** (Read · `style.css` L377 `.cta:not(.done)`; `app.js` `sheet()` dan `verseSheet`)
- **Masalah:**
  - Semua CTA memakai gradien `#FFC247 → #FF8A4C` dengan bayangan berwarna.
  - Di sheet ayat, "Tandai favorit" dan "Tutup" sama-sama besar dan oranye, sehingga tidak jelas mana aksi utamanya. "Tutup" yang oranye terang juga ikut menyilaukan.
- **Ubah:**
  - CTA memakai warna padat `--lamp`, tanpa cahaya, dan hanya satu per layar.
  - Di sheet: "Tandai favorit" menjadi tombol sekunder (ikon bintang yang berubah terisi), "Salin" menjadi tombol teks, dan "Tutup" cukup berupa tombol ikon × 44 px atau usap ke bawah.

**11. Hero beranda memakai template "langit bergradien + tiga pil"** (Experience · `style.css` L323 `.sky`; `vMalam`)
- **Masalah:**
  - Gradien ungu (pink-ungu di mode terang) dipadu bintang berkedip dan tiga pil bertumpuk ("Hari 7 / 365", "Sejarah", "Masuk tanah Kanaan", tanggal).
  - Maskot terpisah di bawah hero dan mengambang di atas kartu ayat, sehingga tidak menyatu dengan sapaan.
- **Ubah:** Ikuti DS 4.2:
  - sapaan Fraunces 34 px
  - maskot *mengantuk* bertengger di tepi kanan hero, sedikit keluar dari kotak (variance 6)
  - satu baris status ("Hari 7 · Yosua 5–8 · ±12 menit")
  - latar `--surface` padat dengan satu cahaya lentera di belakang bulan

**12. Kata-kata streak menakut-nakuti dan menghakimi** (Experience/Operate · banner streak di `vMalam`; pil "Terlewat" di `vArsip`; `vWelcome`)
- **Masalah:**
  - Hal pertama yang dibaca setiap malam adalah "Streak 1 malam akan kembali ke nol jika bacaan malam ini tidak ditandai sebelum pukul 24.00."
  - Di Arsip, pil oranye "Terlewat" berderet.
  - Di layar sambutan tertulis "Streak harian yang ketat untuk melatih disiplin."
  - Nada seperti ini bertentangan dengan suasana "teman baca yang akrab".
- **Ubah:**
  - Banner diganti dengan baris kecil "Lentera Anda menyala 1 malam. Malam ini tinggal satu langkah lagi." Baris ini hanya muncul setelah pukul 21.00.
  - "Terlewat" menjadi "Belum dibaca", dengan garis netral tanpa oranye, ditambah ajakan "Bisa disusul kapan saja".
  - Kalimat di layar sambutan menjadi "Satu malam, satu langkah. Lentera kecil yang dijaga bersama."

**13. Animasi yang berjalan terus tidak menghormati *reduced motion*** (Experience · `style.css` L330–333 `.stars i` `animation:tw … infinite`)
- **Masalah:** Ada 14 bintang yang berkedip tanpa henti. Aturan `prefers-reduced-motion` di L312 hanya mematikan `.burst`, `.sheet .panel`, dan `.spin`.
- **Ubah:** Bintang dibuat statis (DS 3.6: tidak ada animasi yang berjalan terus), lalu pasang aturan global *reduced motion* dari blok CSS DS 3.7.

**14. Onboarding generik, dan halaman pencapaian belum ada** (Experience · `vWelcome`)
- **Masalah:**
  - Layar sambutan berisi maskot, satu kalimat besar, empat baris "ikon + fitur", lalu formulir nama. Itu pola template.
  - Belum ada langkah untuk notifikasi, sehingga pengguna harus mencarinya sendiri di tab Akun.
  - Belum ada tempat untuk merayakan milestone (7, 30, 100, dan 365 malam).
- **Ubah:**
  - Onboarding 3 layar yang bisa dilewati (DS 4.2):
    1. maskot memperkenalkan diri dengan suaranya sendiri ("Halo, saya Lentera. Saya akan menemani Anda membaca, satu malam setiap kali.")
    2. nama panggilan
    3. jam pengingat dan tombol izin notifikasi
  - **Pencapaian:** cukup satu bagian di Progres berisi stiker maskot yang terbuka pada milestone. Stiker yang belum terbuka tampil sebagai siluet dengan petunjuk. Halaman terpisah belum perlu.

**15. Fokus dan pengumuman untuk pembaca layar** (semua halaman · `app.js` `render()`, `toast()`, `sheet()`)
- **Masalah:**
  - Toast dibuat tanpa `role="status"`.
  - Saat tab berganti, fokus tidak dipindahkan ke konten.
  - Sheet punya `role="dialog"`, tetapi fokus tidak berpindah ke dalamnya, tidak ada `aria-labelledby`, dan fokus bisa lepas ke halaman di belakangnya.
- **Ubah:**
  - Toast memakai `role="status" aria-live="polite"`.
  - Setelah `render()`, pindahkan fokus ke `<h1>` halaman (`tabindex="-1"`).
  - Sheet: fokus ke judulnya, kunci Tab di dalam sheet, dan kembalikan fokus ke tombol pemicu saat sheet ditutup.

### P2

**16. Akun terasa seperti tumpukan kartu yang tidak berhubungan** (Operate · `vAkun`)
- **Masalah:**
  - Warna kartu bercampur (ungu tua, cokelat-plum untuk Pengingat, biru untuk Jurnal).
  - Email tampil sebagai judul terbesar ("a@b.c").
  - Teks lisensi "Sumber teks" yang panjang muncul di badan halaman.
  - Font judul tidak konsisten: "Mode bawaan" dan "Sumber teks" tampil dengan huruf serif, sedangkan judul lain sans.
- **Ubah:**
  - Halaman ini cukup satu daftar pengaturan bergaya iOS di atas `--surface`, dengan kelompok **Akun**, **Membaca**, **Pengingat**, **Data**, dan **Tentang**.
  - Sapaan "Anya" menjadi judulnya, sedangkan email cukup keterangan kecil.
  - Teks lisensi dipindah ke sheet "Tentang".

**17. Hasil Cari dan kotak isu memakai garis kiri tebal berwarna** (Operate/Read · `style.css` L391–392 `.vrow`; L125 `.issue`)
- **Masalah:** Setiap hasil pencarian adalah kartu dengan garis kiri 4 px berwarna, dan kotak isu terkini di bagian baca memakai garis kiri 3 px. Keduanya termasuk pola yang dihindari (garis tepi berwarna lebih dari 1 px pada item daftar atau kotak sorotan).
- **Ubah:** Pakai daftar tanpa kartu. Referensi ditulis dalam Nunito 600 `--muted` dan ayat dalam Literata `--fs-md`, dengan pemisah 1 px `--line`. Sorotan kata dipertahankan, tetapi warnanya diganti `--lamp-soft`. Kotak isu cukup diberi judul kecil "Isu terkini" dan latar `--surface`, tanpa garis.

**18. Kaitan setengah kosong dan sulit ditemukan** (Operate · `vKaitan`)
- **Masalah:**
  - Separuh layar kosong.
  - Simpul-simpulnya memakai ikon buku yang seragam.
  - Halaman ini tidak punya tab sendiri dan hanya bisa dibuka dari tombol di "Malam ini", tanpa tombol kembali yang jelas.
- **Ubah:**
  - Tampilkan peta kaitan langsung di bawah ayat fokus (Zona Baca) sebagai daftar tiga ayat dengan alasan singkat. Peta visual cukup jadi sheet opsional.
  - **Delight kecil:** garis penghubung digambar sekali saat peta dibuka (sekitar 400 ms, dimatikan oleh *reduced motion*).

**19. Tipografi terlalu berat dan teks baca terlalu kecil** (Read/semua · `style.css` L80 `.passage` 17 px; L100 `.prose` 16 px `color:var(--soft)`; judul `font-weight:800`)
- **Masalah:**
  - Teks yang paling lama dibaca hanya 16–17 px, dan paragraf renungan memakai warna yang lebih redup daripada judulnya.
  - Hampir semua judul memakai bobot 800.
  - Ada label huruf kapital kecil (`.passage .sup-title`, L81).
- **Ubah:**
  - Teks baca 19 px dengan tinggi baris 1,75 dan warna `--text-read`, plus pengatur ukuran A− / A+.
  - Judul memakai bobot 600–700.
  - Label kapital diganti dengan huruf biasa (DS 3.3).

**20. Pemuatan pertama berat** (semua · `app.js` `init()`; `index.html` L18–19)
- **Masalah:**
  - "Malam ini" baru tampil setelah `data/alkitab.json` (sekitar 4,7 MB) selesai diunduh.
  - Dua stylesheet Google Fonts (empat keluarga font, termasuk ikon) memblokir tampilan.
  - Belum ada skeleton.
- **Ubah:**
  - Tampilkan hero dan renungan lebih dulu, karena keduanya hanya perlu `rencana.json` dan file renungan. Teks ayat menyusul dengan skeleton.
  - Font disimpan di server sendiri dengan `font-display: swap`.

### P3

**21. Permukaan browser belum mengikuti tema** (semua · `style.css`; `index.html` L8)
- **Masalah:**
  - Belum ada `::selection`, `caret-color`, atau `scrollbar-color`.
  - Warna seleksi teks dan kursor masih biru bawaan browser.
  - `<meta name="theme-color">` selalu `#0F0B26`, termasuk di mode terang.
- **Ubah:**
  - `::selection{background:var(--lamp-soft);color:var(--text)}`
  - `caret-color:var(--lamp)`
  - dua tag `theme-color` dengan atribut `media` untuk mode gelap dan terang

**22. Detail Login** (Experience · `vLogin`)
- **Masalah:**
  - Judul "Masuk ke Lentera Malam" pecah dua baris dengan ukuran 34 px dan terasa berat.
  - Pesan galat tidak terhubung ke input (tidak ada `aria-describedby`).
  - "Lanjut tanpa akun" tampil sama menonjolnya dengan formulir.
- **Ubah:**
  - Judul cukup sapaan maskot ("Selamat datang kembali").
  - Pesan galat ditaruh di bawah input yang salah dan dihubungkan dengan `aria-describedby`.
  - "Lanjut tanpa akun" menjadi tombol teks.

---

## Di mana aplikasi terasa datar atau generik, dan di mana delight sebaiknya ditambahkan

**Datar atau generik sekarang:**
- **Pola template:** gradien langit ungu, kartu Streak berpola hero-metric, deretan kartu bergelembung ikon di bagian baca, daftar fitur berikon di layar sambutan, dan navigasi kaca mengambang.
- **Maskot tidak pernah hadir di momen penting:** tidak muncul saat bacaan selesai, saat streak bertambah, saat jurnal tersimpan, atau saat kembali setelah beberapa hari tidak membuka aplikasi.
- **Kata-kata:** formal dan informatif, tetapi tidak pernah terdengar seperti teman ("Tercatat sebagai bacaan susulan", "Menyimpan di perangkat").

**Momen delight yang disarankan, urut menurut dampaknya** (semuanya sesuai motion 5, tanpa animasi yang berjalan terus):
1. **Selesai membaca:** urutan perayaan di temuan 5. Ini momen yang terjadi setiap malam.
2. **Maskot tertidur** di akhir halaman setelah bacaan selesai, dengan "Selamat tidur, Anya" dan "z" kecil yang muncul sekali. Penutup yang lembut untuk malam itu.
3. **Milestone 7, 30, 100, dan 365 malam:** sheet stiker maskot dengan atribut baru (topi tidur, gulungan kitab, mahkota bintang), yang tersimpan di bagian Pencapaian.
4. **Kembali setelah absen:** maskot menyapa tanpa menghakimi ("Senang Anda kembali. Kita lanjut dari Hari 9?"), bukan menampilkan deretan "Terlewat".
5. **Rak buku Progres:** punggung kitab "terisi" dengan animasi singkat saat satu kitab selesai, diikuti toast "Kitab Rut selesai. Satu rak lagi terisi."
6. **Jurnal tersimpan:** ikon pena kecil mengangguk sekali di samping status "Tersimpan". Gerakan seperti ini terasa, tetapi tidak mengganggu.

Semua momen di atas hanya menyentuh **Zona Main** dan bagian akhir **Zona Baca**. Selama membaca, tidak ada yang bergerak.

---

## Ringkasan prioritas

- **Kerjakan pertama (P0, 1–4):** bagian baca yang tidak menyilaukan, ikon SVG, navigasi yang tidak menutupi teks, dan kontras. Keempatnya mengubah kenyamanan membaca di kamar gelap secara langsung.
- **Lalu (P1, 5–15):** perayaan selesai membaca, Progres tanpa template, perbaikan bug tautan istilah, bagian baca tanpa kartu, target sentuh, satu CTA per layar, hero baru, kata-kata, *reduced motion*, onboarding dan pencapaian, serta fokus.
- **Bug yang bisa langsung diperbaiki tanpa menunggu redesign:** temuan 7 (satu baris).
