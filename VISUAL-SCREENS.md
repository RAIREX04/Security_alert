# Visual Screens with Image Output

Dokumen ini merangkum layar-layar di `security_alert` yang menampilkan output gambar, baik berupa `ImageBackground`, logo/illustrasi, avatar, peta, maupun preview gambar.

## Ringkasan

| Layar | Source | Screenshot |
|---|---|---|
| Login / Auth | `src/screens/auth/LoginScreen.tsx`, `src/components/AuthScreenShell.tsx` | ![Login](/E:/security_alert/launch.png) |
| Dashboard User | `src/screens/user/HomeScreen.tsx`, `src/components/UserScreenShell.tsx` | ![Dashboard User](/E:/security_alert/secure-launch3.png) |
| Riwayat Alert | `src/screens/user/HistoryScreen.tsx` | ![Riwayat](/E:/security_alert/history-viewport.png) |
| Status Alert Saya | `src/screens/user/StatusScreen.tsx` | ![Status](/E:/security_alert/status-final.png) |
| Profil User | `src/screens/user/ProfileScreen.tsx`, `src/components/ProfileAvatar.tsx` | ![Profil](/E:/security_alert/profile-final.png) |
| Edit Profil | `src/screens/shared/EditProfileScreen.tsx` | ![Edit Profil](/E:/security_alert/edit-profile.png) |
| Form Laporan | `src/screens/user/ReportFormScreen.tsx`, `src/components/LocationPreviewCard.tsx` | ![Form Laporan](/E:/security_alert/report-form-final.png) |

## Catatan

- `launch.png` adalah screenshot login yang paling bersih yang tersedia saat ini.
- `history-viewport.png` menampilkan layar riwayat alert dengan satu kartu laporan contoh.
- `report-form-final.png` memperlihatkan preview lokasi, koordinat, dan peta.
- Beberapa layar lain yang juga memakai output gambar ada di source code, tetapi belum saya jadikan screenshot terpisah karena belum sempat dibuka ke state yang representatif:
  - `src/screens/shared/ReportDetailScreen.tsx`
  - `src/screens/shared/CompletionProofScreen.tsx`
  - `src/screens/shared/UserDetailScreen.tsx`
  - `src/screens/staff/ProfileScreen.tsx`
  - `src/screens/admin/ProfileScreen.tsx`

## File Screenshot Tambahan

- [launch.png](/E:/security_alert/launch.png)
- [secure-launch3.png](/E:/security_alert/secure-launch3.png)
- [history-viewport.png](/E:/security_alert/history-viewport.png)
- [status-final.png](/E:/security_alert/status-final.png)
- [profile-final.png](/E:/security_alert/profile-final.png)
- [edit-profile.png](/E:/security_alert/edit-profile.png)
- [report-form-final.png](/E:/security_alert/report-form-final.png)
