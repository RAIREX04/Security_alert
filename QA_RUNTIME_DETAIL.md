# QA Runtime Detail

Gunakan checklist ini saat menguji aplikasi di emulator/device. Fokusnya adalah alur nyata, hasil yang diharapkan, dan edge case yang mudah terlewat.

## 1. Login Screen

### Expected

- User melihat hero, logo, dan field login dengan tampilan rapi.
- Login sukses membawa user ke navigator sesuai role.
- Loading state muncul saat request login berjalan.

### Edge Case

- Username kosong.
- PIN kosong.
- PIN kurang atau lebih dari 6 digit.
- PIN salah.
- Akun staff belum `approved`.
- Server tidak bisa diakses.

## 2. User Dashboard

### Expected

- Dashboard menampilkan departemen, metric ringkas, dan laporan terbaru.
- Klik departemen membuka form alert dengan departemen tujuan terisi.
- Klik report membuka detail report.

### Edge Case

- Departemen kosong.
- Laporan kosong.
- Foto atau lokasi belum diambil saat membuat alert.
- Koneksi lambat saat mengambil data dashboard.

## 3. User Report Form

### Expected

- User bisa isi deskripsi kejadian.
- Lokasi GPS dapat diambil dan tampil sebagai alamat + koordinat.
- Foto dapat diambil dari kamera atau galeri.
- Submit sukses membuat report baru dengan status `open`.

### Edge Case

- Izin lokasi ditolak.
- Izin kamera ditolak.
- Foto dipilih tetapi upload belum selesai.
- Deskripsi kosong.
- Departemen tujuan tidak valid.

## 4. User Status

### Expected

- Menampilkan alert aktif dan ringkasan status open/progress/close.
- Report aktif bisa dibuka ke detail.

### Edge Case

- Semua report sudah close.
- Data status belum selesai dimuat.

## 5. User History

### Expected

- Riwayat bisa difilter `all/open/progress/close`.
- Metric ringkas berubah sesuai isi data.

### Edge Case

- Filter menghasilkan data kosong.
- Tanggal report null atau tidak valid.

## 6. User Profile

### Expected

- Menampilkan identitas, approval status, dan ringkasan aktivitas.
- Edit profile membuka layar edit.

### Edge Case

- `photoUrl` kosong.
- `getMe` gagal, tetapi data dari session masih ada.
- Logout gagal karena sesi jaringan.

## 7. Staff Dashboard

### Expected

- Alert hanya muncul untuk departemen staff.
- Alert terbaru bisa dibuka cepat.
- Metric open/progress/close sesuai data departemen.

### Edge Case

- Tidak ada alert departemen.
- Staff tidak punya departmentId.

## 8. Staff Support

### Expected

- Staff bisa pilih departemen bantuan.
- Navigasi ke form alert berjalan mulus.

### Edge Case

- Tidak ada departemen lain selain departemen staff.

## 9. Staff History

### Expected

- History menampilkan report departemen staff.
- Filter status bekerja.

### Edge Case

- Data history kosong.

## 10. Staff Report Detail

### Expected

- Staff dapat ambil task saat status `open`.
- Staff dapat tandai `arrived`.
- Staff dapat lanjut ke completion proof saat status `progress`.

### Edge Case

- Report sudah close.
- Report sudah diambil staff lain.
- Aksi dilakukan saat request lain masih pending.

## 11. Completion Proof

### Expected

- Staff mengisi deskripsi penyelesaian.
- Staff dapat ambil foto bukti.
- Staff dapat kirim completion dan report berubah ke `close`.

### Edge Case

- Foto bukti belum selesai diupload.
- Deskripsi terlalu singkat.
- Izin kamera ditolak.

## 12. Admin Dashboard

### Expected

- Menampilkan ringkasan user, staff, alert, dan approval pending.
- Ada section approval staff yang dapat dibuka ke detail.
- Admin bisa tambah user dan staff dari dashboard.

### Edge Case

- Tidak ada staff pending.
- Tidak ada report terbaru.
- Departemen kosong.

## 13. Admin Users / Employees

### Expected

- List user dan staff bisa dicari.
- Ringkasan count sesuai hasil filter.
- Klik item membuka detail user.

### Edge Case

- Pencarian tidak menemukan data.
- Data user sangat banyak.

## 14. User Detail / Approval

### Expected

- Admin melihat profil detail, status approval, info akun, dan last login.
- Approve / reject meminta konfirmasi sebelum eksekusi.
- Nonaktif / aktifkan akun juga memakai konfirmasi.

### Edge Case

- Staff masih `pending`.
- Aksi approve/reject pada status yang sudah final.
- Self action untuk akun sendiri harus dibatasi.

## 15. Department Detail

### Expected

- Menampilkan statistik departemen, staff, dan alert terkait.
- Klik staff atau report membuka detail yang relevan.

### Edge Case

- Departemen belum punya staff.
- Departemen belum punya alert.

## 16. Report Detail

### Expected

- Menampilkan timeline open -> progress -> close.
- Lampiran terlihat jika ada.
- Reporter dapat memberi rating setelah alert close.

### Edge Case

- Attachment kosong.
- Rating invalid di luar 1-5.
- Aksi admin/staff tidak sesuai role.

## 17. Backend / Swagger

### Expected

- Response sukses selalu memakai envelope `{ success, message, data }`.
- Error memakai `{ success, message, errors }`.
- Swagger menampilkan endpoint utama beserta response shape.

### Edge Case

- Endpoint upload mengembalikan fileUrl yang bisa diakses publik.
- Endpoint protected tanpa token harus 401.

