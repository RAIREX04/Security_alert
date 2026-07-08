import { api, getAccessToken } from '../config/api';

export type UploadedFile = {
  fileName: string;
  fileUrl: string;
  mimeType?: string | null;
  fileSize?: number | null;
  kind?: string;
};

type PickedAsset = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

async function uploadFile(path: string, asset: PickedAsset, requireAuth = true): Promise<UploadedFile> {
  const accessToken = getAccessToken();
  if (requireAuth && !accessToken) {
    throw new Error('Sesi login habis. Silakan login ulang sebelum upload foto.');
  }

  const formData = new FormData();
  formData.append('file', {
    uri: asset.uri,
    name: asset.fileName ?? 'upload.jpg',
    type: asset.mimeType ?? 'image/jpeg',
  } as never);

  const response = await api.post<{ data: UploadedFile }>(path, formData, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}

export function uploadProfilePhoto(asset: PickedAsset) {
  return uploadFile('/uploads/profile-photo', asset);
}

export function uploadRegistrationProfilePhoto(asset: PickedAsset) {
  return uploadFile('/uploads/profile-photo', asset, false);
}

export function uploadReportPhoto(asset: PickedAsset) {
  return uploadFile('/uploads/report-photo', asset);
}

export function uploadReportCompletionPhoto(asset: PickedAsset) {
  return uploadFile('/uploads/report-completion-photo', asset);
}
