# Management Emergency Migration

Repo ini berisi hasil migrasi aplikasi emergency dari Flutter + Firebase ke React Native + Express.js + SQL Server.

## Arsitektur Final

```text
React Native Android -> HTTPS REST API -> Node.js Express MVC -> Sequelize ORM -> SQL Server
```

- React Native Android berfungsi sebagai client/view.
- Express `routes` meneruskan request ke `controllers`.
- `controllers` memanggil `services` untuk business logic.
- `services` memakai Sequelize `models`.
- Sequelize membaca dan menulis data ke Microsoft SQL Server.
- Aplikasi React Native tidak terhubung langsung ke SQL Server.

## Isi Repo

- `ANALISIS_PROJECT.md`
- `ARSITEKTUR_BARU.md`
- `DATABASE_DESIGN.md`
- `database.sql`
- `backend/`
- `src/`
- `postman/`

## Prasyarat

- Node.js 20.19+ untuk frontend Expo SDK 54
- Node.js 20+ untuk backend
- Microsoft SQL Server 2019+ atau yang kompatibel
- Android Studio untuk build APK Android

## Setup Frontend

1. Salin [`.env.example`](./.env.example) ke `.env`.
2. Isi `EXPO_PUBLIC_API_BASE_URL_ANDROID_EMULATOR` dan `EXPO_PUBLIC_API_BASE_URL_ANDROID_DEVICE` sesuai target tes.
3. `EXPO_PUBLIC_API_BASE_URL` dipakai sebagai fallback untuk platform lain.
4. Jalankan:

```bash
npm install
npm start
```

5. Jika ingin preview lokasi benar-benar interaktif di Android, isi `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` di [`.env`](./.env) lalu rebuild APK.
6. Untuk development di HP fisik, gunakan jaringan hotspot/Wi-Fi yang sama antara laptop dan HP.

## Backend Lokal

Untuk memakai backend asli SQL Server, jalankan backend Express di port `3000`:

```bash
cd backend
npm start
```

Konfigurasi frontend sekarang memilih URL otomatis:

- Emulator Android: `http://10.0.2.2:3000/api`
- HP fisik: `http://192.168.132.96:3000/api`
- Fallback umum: `http://localhost:3000/api`

## Setup Backend

1. Masuk ke folder `backend`.
2. Salin [`.env.example`](./backend/.env.example) ke `.env`.
3. Isi koneksi SQL Server dan secret JWT.
4. Jalankan:

```bash
npm install
npm run lint
npm start
```

## Setup SQL Server

1. Jalankan [database.sql](./database.sql) di SQL Server.
2. Pastikan database `ManagementEmergency` terbentuk.
3. Pastikan tabel seed awal:
   - `roles`
   - `departments`
   - `users`
   - `reports`
   - `report_attachments`
   - `refresh_tokens`
   - `user_tokens`
   - `notification_logs`
   - `audit_logs`

## Menjalankan di Hotspot Lokal

1. Jalankan backend di port `3000`.
2. Pastikan laptop dan HP tersambung ke hotspot atau Wi-Fi yang sama.
3. Cari IP lokal laptop, misalnya `192.168.1.10`.
4. Set `EXPO_PUBLIC_API_BASE_URL` ke:

```bash
http://192.168.1.10:3000/api
```

5. Set `PUBLIC_ASSET_BASE_URL` di backend ke:

```bash
http://192.168.1.10:3000/uploads
```

6. Jangan arahkan app ini ke mock API `3001` jika ingin melihat data SQL Server asli.

## Google Maps SDK Android

Untuk preview lokasi native di Android, tambahkan key Google Maps di `.env`:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

Lalu rebuild release:

```bash
cd android
./gradlew assembleRelease
```

Jika key belum diisi, app tetap berjalan tetapi preview lokasi memakai fallback visual yang aman.

## Testing

### Backend

```bash
cd backend
npm test
```

### Postman

Import:
- [Management_Emergency.postman_collection.json](./postman/Management_Emergency.postman_collection.json)
- [Management_Emergency.postman_environment.json](./postman/Management_Emergency.postman_environment.json)

## Build APK Android

1. Pastikan backend sudah aktif.
2. Jalankan Expo Android build:

```bash
npx expo run:android
```

Atau jika memakai EAS:

```bash
eas build -p android
```

## Catatan Migrasi

- UI React Native mengikuti flow aplikasi Flutter lama.
- Data utama sekarang disiapkan untuk SQL Server lewat Express.js.
- Session frontend disimpan di Async Storage.
- Auth memakai JWT access token dan refresh token.
- Login aplikasi menggunakan `username` dan PIN tepat 6 angka. PIN disimpan sebagai hash bcrypt.
