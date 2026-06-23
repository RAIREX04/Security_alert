import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';

export type LocationSnapshot = {
  latitude: number;
  longitude: number;
  label: string;
  address: string | null;
  accuracy: number | null;
};

export async function pickImageAsync() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Izin galeri belum diberikan.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    quality: 0.85,
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });

  if (result.canceled || !result.assets.length) {
    return null;
  }

  return result.assets[0];
}

export async function capturePhotoAsync() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Izin kamera belum diberikan.');
  }

  const result = await ImagePicker.launchCameraAsync({
    quality: 0.85,
  });

  if (result.canceled || !result.assets.length) {
    return null;
  }

  return result.assets[0];
}

export async function getCurrentLocationLabel() {
  const snapshot = await getCurrentLocationSnapshot();
  return snapshot.label;
}

export async function getCurrentLocationSnapshot(): Promise<LocationSnapshot> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Izin lokasi belum diberikan.');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Highest,
  });

  const latitude = location.coords.latitude;
  const longitude = location.coords.longitude;
  const coordinates = `Lat ${latitude.toFixed(6)}, Lng ${longitude.toFixed(6)}`;
  const addressParts = await Location.reverseGeocodeAsync({ latitude, longitude });
  const firstAddress = addressParts[0];
  const address = firstAddress
    ? [
        firstAddress.name,
        firstAddress.street,
        firstAddress.city,
        firstAddress.region,
      ]
        .filter((part) => typeof part === 'string' && part.trim().length > 0)
        .join(', ')
    : null;

  return {
    latitude,
    longitude,
    label: address ? `${address}\n${coordinates}` : coordinates,
    address,
    accuracy: location.coords.accuracy ?? null,
  };
}

export function speak(text: string) {
  Speech.speak(text, {
    language: 'id-ID',
    pitch: 1,
    rate: 1,
  });
}

export function stopSpeaking() {
  Speech.stop();
}
