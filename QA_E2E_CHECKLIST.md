# QA End-to-End Checklist

## User Flow

- Login berhasil dengan akun user aktif.
- Dashboard menampilkan daftar departemen, metric ringkas, dan laporan terbaru.
- Pilih departemen lalu buka form alert.
- Isi deskripsi, ambil lokasi GPS, ambil atau pilih foto, lalu kirim alert.
- Status report berubah menjadi `open` dan muncul di riwayat.
- Setelah staff menutup alert, user dapat memberi rating 1-5 dan komentar.

## Staff Flow

- Login berhasil dengan akun staff yang sudah `approved`.
- Dashboard staff hanya menampilkan alert departemen terkait.
- Alert baru bisa dibuka, diambil task-nya, lalu berpindah ke `progress`.
- Staff dapat menandai `arrived`, lalu menyelesaikan alert dengan deskripsi dan bukti.
- Report selesai tampil di riwayat staff dan detail menampilkan timeline lengkap.

## Admin Flow

- Login berhasil dengan akun admin.
- Dashboard menampilkan ringkasan user, staff, pending approval, alert terbaru, dan departemen.
- Admin dapat membuka detail staff untuk approve / reject.
- Admin dapat menambah user / staff baru.
- Admin dapat melihat history detail, statistik departemen, dan detail report.

## Backend / API

- Response sukses memakai envelope `{ success, message, data }`.
- Error response memakai `{ success, message, errors }`.
- Swagger menampilkan endpoint utama auth, users, reports, departments, notifications, dan uploads.
- Upload foto report, completion, dan profile mengembalikan `fileUrl` yang siap dipakai frontend.

## Expected Status

- `open` untuk alert baru.
- `progress` saat task diambil.
- `close` saat alert selesai.
- `pending` untuk staff yang menunggu approval admin.
- `approved` untuk staff atau user yang valid.

