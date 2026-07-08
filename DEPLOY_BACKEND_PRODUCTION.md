# Deploy Backend Produksi

Panduan ini dipakai untuk memperbaiki error 405 di server produksi `security-alerts.pertaarungas.com`.

## Penyebab

Error 405 muncul karena backend produksi yang sedang berjalan belum menerima route/method terbaru untuk aksi seperti:

- approve/reject karyawan
- edit profil
- ambil tugas / progress report

APK saja tidak cukup untuk memperbaiki ini. Backend di server harus ikut diperbarui dan direstart.

## File Environment

Di server, buat atau update file `backend/.env` memakai nilai produksi. Jangan commit file `.env` ke repo.

Contoh nilai penting:

```env
NODE_ENV=production
PORT=3000
API_BASE_URL=http://security-alerts.pertaarungas.com

DB_HOST=10.251.150.36
DB_PORT=1433
DB_NAME=ManagementEmergency
DB_USER=alertsecurity
DB_DIALECT=mssql
DB_SYNC_ON_START=true

UPLOAD_DIR=uploads
PUBLIC_ASSET_BASE_URL=http://security-alerts.pertaarungas.com/uploads
PUSH_PROVIDER=expo
```

Isi `DB_PASSWORD`, `JWT_ACCESS_SECRET`, dan `JWT_REFRESH_SECRET` dengan secret produksi yang benar.

## Deploy Manual

Upload isi folder `backend` terbaru ke server, lalu jalankan:

```bash
cd /path/to/security_alert/backend
npm install
npm start
```

Jika server memakai PM2:

```bash
cd /path/to/security_alert/backend
npm install
pm2 restart security-alert-backend
```

Jika nama proses PM2 berbeda, cek dulu dengan:

```bash
pm2 list
```

## Nginx / Reverse Proxy

Pastikan proxy meneruskan request ke Node.js dan tidak memblokir method:

```text
GET, POST, PUT, PATCH, DELETE
```

Minimal konfigurasi proxy harus meneruskan semua method ke backend port `3000`.

## Tes Setelah Restart

Tes endpoint publik:

```bash
curl http://security-alerts.pertaarungas.com/api/health
curl http://security-alerts.pertaarungas.com/docs.json
```

Lalu tes dari aplikasi:

- login
- edit profil
- approve karyawan
- ambil tugas / progress report

Jika masih 405, berarti server yang aktif belum memakai backend terbaru atau proxy masih memblokir method.
