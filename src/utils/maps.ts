import { Linking, Platform } from 'react-native';

function normalizeQuery(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function buildGoogleMapsSearchUrl(
  latitudeOrQuery: number | string,
  longitude?: number,
  label?: string | null,
) {
  const query =
    typeof latitudeOrQuery === 'number' && typeof longitude === 'number'
      ? label?.trim().length
        ? `${latitudeOrQuery},${longitude} (${normalizeQuery(label)})`
        : `${latitudeOrQuery},${longitude}`
      : normalizeQuery(String(latitudeOrQuery));

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function buildGoogleMapsDirectionsUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

export async function openLocationInMaps(params: {
  latitude?: number | null;
  longitude?: number | null;
  label?: string | null;
}) {
  const { latitude, longitude, label } = params;
  const candidates: string[] = [];

  if (latitude != null && longitude != null) {
    const query = label?.trim()
      ? `${latitude},${longitude} (${normalizeQuery(label)})`
      : `${latitude},${longitude}`;

    if (Platform.OS === 'android') {
      candidates.push(`geo:${latitude},${longitude}?q=${encodeURIComponent(query)}`);
    }

    candidates.push(buildGoogleMapsSearchUrl(latitude, longitude, label));
    candidates.push(`https://maps.google.com/?q=${encodeURIComponent(`${latitude},${longitude}`)}`);
  } else if (label?.trim()) {
    const query = normalizeQuery(label);
    candidates.push(buildGoogleMapsSearchUrl(query));
    candidates.push(`https://maps.google.com/?q=${encodeURIComponent(query)}`);
  }

  for (const url of candidates) {
    try {
      const supported = await Linking.canOpenURL(url).catch(() => true);
      if (supported) {
        await Linking.openURL(url);
        return true;
      }
    } catch {
      // try next fallback
    }
  }

  return false;
}
