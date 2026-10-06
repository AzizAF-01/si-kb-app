# Buku Panduan Penggunaan SI-KB
**Sistem Informasi Keluarga Berencana**

---

## 1. Pendahuluan
SI-KB adalah platform digital yang dirancang untuk memudahkan masyarakat (khususnya ibu dan pasangan) dalam mengakses informasi, layanan, serta jadwal terkait Keluarga Berencana (KB) secara terpadu, aman, dan mudah digunakan.

Platform ini membagi penggunanya ke dalam 3 (tiga) peran utama (*Role*) agar keamanan dan privasi data tetap terjaga.

---

## 2. Hak Akses & Peran (Role)

### A. Pengguna Umum & Pasien (User)
Peran ini ditujukan untuk masyarakat umum. Pengguna dapat mengakses SI-KB tanpa login untuk fitur publik, namun diwajibkan *login* untuk fitur yang bersifat rahasia dan personal.
*   **Tanpa Login (Guest):** Dapat membaca artikel edukasi dan melihat daftar fasilitas/jadwal layanan.
*   **Setelah Login:** Dapat melakukan konsultasi *chat* dengan Perawat, membuat pengingat jadwal, dan mencatat riwayat kesehatan.

### B. Perawat / Tenaga Kesehatan (Perawat)
Peran khusus bagi tenaga medis yang bertugas melayani konsultasi. 
*   **Akses Utama:** Memiliki *dashboard* khusus untuk menerima, membaca, dan membalas pesan konsultasi dari para pasien secara *real-time*. Perawat hanya dapat melihat pesan yang ditujukan kepadanya.

### C. Administrator (Super Admin)
Peran pengelola sistem (pemilik aplikasi/dinas).
*   **Akses Utama:** Mengelola seluruh master data, termasuk mendaftarkan akun Perawat/Admin baru, menulis dan mempublikasikan artikel edukasi, serta mengatur daftar fasilitas kesehatan yang tayang di halaman publik.

---

## 3. Penjelasan Fitur SI-KB

### 3.1. Pusat Edukasi (Info KB)
*   **Siapa yang bisa akses:** Semua orang (Publik).
*   **Fungsi:** Halaman berisi kumpulan artikel edukatif seputar metode kontrasepsi, mitos & fakta KB, dan kesehatan ibu. Artikel dilengkapi dengan kategori dan tanggal rilis. Jika ada pertanyaan setelah membaca, terdapat tombol pintasan untuk langsung berkonsultasi dengan Perawat.

### 3.2. Pencarian Fasilitas (Jadwal Layanan)
*   **Siapa yang bisa akses:** Semua orang (Publik).
*   **Fungsi:** Menampilkan daftar Puskesmas, Posyandu, Klinik, atau Perawat Praktik Mandiri terdekat. Menampilkan alamat lengkap, hari & jam operasional, serta layanan apa saja yang didukung (misal: Suntik KB, IUD, Pil).

### 3.3. Konsultasi Online (Chat Real-Time)
*   **Siapa yang bisa akses:** Pasien (User) & Perawat.
*   **Fungsi untuk Pasien:** Pasien memilih perawat dari daftar yang tersedia, lalu memulai sesi *chat* pribadi yang dijamin kerahasiaannya. Sangat berguna untuk bertanya seputar keluhan efek samping atau bingung memilih alat kontrasepsi.
*   **Fungsi untuk Perawat:** Perawat memiliki panel khusus (`/perawat`) untuk melihat daftar pasien yang menghubunginya dan membalas pesan seketika tanpa perlu me-*refresh* halaman.

### 3.4. Pengingat Jadwal (Alarm KB)
*   **Siapa yang bisa akses:** Pasien (User).
*   **Fungsi:** Fitur asisten pribadi agar pasien tidak lupa jadwal KB. Pasien bisa menambahkan pengingat untuk:
    *   Waktu Suntik KB selanjutnya.
    *   Waktu minum Pil KB harian.
    *   Kunjungan ulang ke klinik.
*   **Tampilan:** Sistem akan menghitung mundur dan menandai status pengingat ("Hari ini", "Besok", "3 hari lagi", atau "Terlewat" jika berwarna merah).

### 3.5. Buku Riwayat Kesehatan
*   **Siapa yang bisa akses:** Pasien (User).
*   **Fungsi:** Bertindak sebagai rekam medis mini bagi pasien. 
    *   Pasien dapat mencatat keluhan fisik yang dialami (misal: nyeri, flek).
    *   Catatan ditampilkan dalam bentuk "Timeline" (Garis waktu) historis.
    *   Pasien memiliki kendali penuh untuk mengedit (*inline edit*) atau menghapus catatan keluhannya sendiri.

### 3.6. Dashboard Manajemen (Super Admin)
*   **Siapa yang bisa akses:** Administrator.
*   **Fungsi:** Pusat kendali aplikasi yang dibagi menjadi 3 tab:
    1.  **Kelola Pengguna:** Memantau daftar *user* yang mendaftar dan menyediakan form khusus untuk membuat akun dengan akses "Perawat" atau "Admin".
    2.  **Kelola Artikel:** Menulis (termasuk memasukkan gambar cover), mengedit, dan menghapus artikel edukasi yang akan tayang di Info KB.
    3.  **Jadwal Layanan (Fasilitas):** Memasukkan data lokasi, jam buka, dan tipe layanan dari fasilitas-fasilitas kesehatan agar pasien tahu ke mana harus berkunjung.

---

*Dokumen ini dibuat otomatis oleh Sistem.*
