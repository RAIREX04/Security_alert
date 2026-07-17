# Panduan Screenshot GasBerth Scheduler

File aplikasi mockup:

`E:\security_alert\gasberth-scheduler-mockup\index.html`

Buka file tersebut di browser, lalu pilih menu di sidebar atau gunakan alamat dengan tanda `#` seperti contoh:

`E:\security_alert\gasberth-scheduler-mockup\index.html#login`

Ukuran screenshot yang disarankan untuk Word: browser desktop `1366 x 768`, zoom `100%`.

## Letak Screenshot Untuk Word

| Gambar | Halaman di aplikasi | Route | File PNG otomatis |
|---|---|---|---|
| Gambar 1 | Halaman Login GasBerth Scheduler | `#login` | `screenshots\01-login.png` |
| Gambar 2 | Dashboard Kalender Jadwal Kapal LPG | `#calendar-lpg` | `screenshots\02-dashboard-kalender-lpg.png` |
| Gambar 3 | Cetak Data Kalender LPG | `#print-calendar-lpg` | `screenshots\03-cetak-kalender-lpg.png` |
| Gambar 4 | Tampilan Halaman TV LPG | `#tv-lpg` | `screenshots\04-tv-lpg.png` |
| Gambar 5 | Cetak Data TV LPG | `#print-tv-lpg` | `screenshots\05-cetak-tv-lpg.png` |
| Gambar 6 | Dashboard GasBerth Scheduler LPG | `#dashboard-lpg` | `screenshots\06-dashboard-lpg.png` |
| Gambar 7 | Data Jadwal Kapal LPG | `#schedule-lpg` | `screenshots\07-data-jadwal-lpg.png` |
| Gambar 8 | Tambah Data LPG | `#add-lpg` | `screenshots\08-tambah-data-lpg.png` |
| Gambar 9 | Daftar Loading Port LPG | `#master-lpg-loading` | `screenshots\09-loading-port-lpg.png` |
| Gambar 10 | Daftar Discharge Port LPG | `#master-lpg-discharge` | `screenshots\10-discharge-port-lpg.png` |
| Gambar 11 | Daftar Vessel LPG | `#master-lpg-vessel` | `screenshots\11-vessel-lpg.png` |
| Gambar 12 | Daftar Activity LPG | `#master-lpg-activity` | `screenshots\12-activity-lpg.png` |
| Gambar 13 | Dashboard Kalender Jadwal Kapal LNG | `#calendar-lng` | `screenshots\13-dashboard-kalender-lng.png` |
| Gambar 14 | Cetak Data Kalender LNG | `#print-calendar-lng` | `screenshots\14-cetak-kalender-lng.png` |
| Gambar 15 | Tampilan Halaman TV LNG | `#tv-lng` | `screenshots\15-tv-lng.png` |
| Gambar 16 | Cetak Data TV LNG | `#print-tv-lng` | `screenshots\16-cetak-tv-lng.png` |
| Gambar 17 | Dashboard GasBerth Scheduler LNG | `#dashboard-lng` | `screenshots\17-dashboard-lng.png` |
| Gambar 18 | Data Jadwal Kapal LNG | `#schedule-lng` | `screenshots\18-data-jadwal-lng.png` |
| Gambar 19 | Tambah Data LNG | `#add-lng` | `screenshots\19-tambah-data-lng.png` |
| Gambar 20 | Daftar Loading Port LNG | `#master-lng-loading` | `screenshots\20-loading-port-lng.png` |
| Gambar 21 | Daftar Discharge Port LNG | `#master-lng-discharge` | `screenshots\21-discharge-port-lng.png` |
| Gambar 22 | Daftar Vessel LNG | `#master-lng-vessel` | `screenshots\22-vessel-lng.png` |
| Gambar 23 | Daftar Owner LNG | `#master-lng-owner` | `screenshots\23-owner-lng.png` |
| Gambar 24 | Daftar Berth LNG | `#master-lng-berth` | `screenshots\24-berth-lng.png` |
| Gambar 25 | Daftar Activity LNG | `#master-lng-activity` | `screenshots\25-activity-lng.png` |
| Gambar 26 | Daftar Status LNG | `#master-lng-status` | `screenshots\26-status-lng.png` |
| Gambar 27 | User Sebelum Penambahan Superadmin | `#users-before` | `screenshots\27-user-sebelum-superadmin.png` |
| Gambar 28 | User Setelah Penambahan Superadmin | `#users-after` | `screenshots\28-user-setelah-superadmin.png` |
| Tambahan | Halaman View Only | `#view-only` | `screenshots\29-view-only.png` |

## Membuat PNG Otomatis

Jalankan dari folder proyek:

```powershell
node gasberth-scheduler-mockup\capture-screenshots.js
```

Hasil gambar akan masuk ke:

`E:\security_alert\gasberth-scheduler-mockup\screenshots`
