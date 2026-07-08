import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import WebView from 'react-native-webview';

type Props = {
  title: string;
  subtitle?: string;
  latitude?: number | null;
  longitude?: number | null;
  locationText?: string | null;
  accuracy?: number | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  onOpenMaps?: () => void;
  forceStaticPreview?: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function buildMapHtml(latitude: number, longitude: number, _locationLabel: string, _accuracy?: number | null) {
  const lat = latitude.toFixed(6);
  const lng = longitude.toFixed(6);

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        html, body, #map {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          background: #EAF2FF;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .leaflet-control-container { display: none; }
        .meta {
          position: absolute;
          left: 12px;
          top: 12px;
          z-index: 999;
          background: rgba(255,255,255,0.82);
          border: 1px solid rgba(220,230,245,0.9);
          border-radius: 999px;
          padding: 4px 8px;
          color: #0F172A;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.2px;
          opacity: 0.62;
          box-shadow: 0 8px 14px rgba(15, 23, 42, 0.06);
        }
        .centerPin {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 22px;
          height: 22px;
          margin-left: -11px;
          margin-top: -11px;
          background: #1D4ED8;
          border: 4px solid #FFFFFF;
          border-radius: 999px;
          box-shadow: 0 8px 18px rgba(29, 78, 216, 0.35);
          z-index: 998;
        }
        .centerGlow {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 72px;
          height: 72px;
          margin-left: -36px;
          margin-top: -36px;
          border-radius: 999px;
          background: rgba(29, 78, 216, 0.08);
          z-index: 997;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div class="meta">OSM</div>
      <div class="centerGlow"></div>
      <div class="centerPin"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        const map = L.map('map', {
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          dragging: false,
          keyboard: false,
          tap: false,
          touchZoom: false,
        }).setView([${lat}, ${lng}], 17);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          noWrap: true,
        }).addTo(map);

        L.marker([${lat}, ${lng}]).addTo(map);
      </script>
    </body>
  </html>`;
}

function LocationPreviewCardInner({
  title,
  subtitle,
  latitude,
  longitude,
  locationText,
  accuracy,
  refreshing,
  onRefresh,
  onOpenMaps,
  forceStaticPreview,
}: Props) {
  const locationLabel = locationText?.trim() || 'Lokasi belum tersedia';
  const hasCoordinates = latitude != null && longitude != null;

  const coordinateLabel = hasCoordinates
    ? `Lat ${latitude!.toFixed(6)}, Lng ${longitude!.toFixed(6)}`
    : 'Menunggu GPS perangkat...';
  const accuracyLabel = hasCoordinates
    ? accuracy != null
      ? `Akurasi GPS sekitar ${Math.max(1, Math.round(accuracy))} meter`
      : 'Akurasi GPS siap dipakai'
    : 'Aktifkan GPS agar titik lokasi muncul otomatis.';

  const markerLeft = hasCoordinates ? `${clamp(((longitude! + 180) / 360) * 100, 18, 82)}%` : '50%';
  const markerTop = hasCoordinates ? `${clamp(((90 - latitude!) / 180) * 100, 18, 82)}%` : '50%';
  const mapHtml = useMemo(
    () => (hasCoordinates && !forceStaticPreview ? buildMapHtml(latitude!, longitude!, locationLabel, accuracy) : null),
    [accuracy, forceStaticPreview, hasCoordinates, latitude, locationLabel, longitude],
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text selectable style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text selectable style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {onRefresh ? (
          <Pressable onPress={onRefresh} style={styles.refreshButton} accessibilityRole="button">
            <Text style={styles.refreshIcon}>↺</Text>
            <Text style={styles.refreshText}>{refreshing ? 'Memuat' : 'Refresh'}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoPill}>
          <Text selectable style={styles.infoLabel}>
            Koordinat
          </Text>
          <Text selectable style={styles.infoValue}>
            {coordinateLabel}
          </Text>
        </View>
      </View>

      <Text selectable style={styles.accuracyText}>
        {accuracyLabel}
      </Text>

      <View style={styles.mapFrame}>
        <LinearGradient colors={['#F7FAFC', '#E8F0FF', '#F4FAFF']} style={StyleSheet.absoluteFill} />

        {mapHtml ? (
          <WebView
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            scrollEnabled={false}
            setSupportMultipleWindows={false}
            style={styles.webMap}
          />
        ) : (
          <View style={styles.fallbackMap}>
            <View style={styles.fallbackBackdrop} />
            <View style={styles.fallbackRoadA} />
            <View style={styles.fallbackRoadB} />
            <View style={styles.fallbackRoadC} />
            <View style={styles.fallbackRoadD} />
            <View style={styles.fallbackBlockA} />
            <View style={styles.fallbackBlockB} />
            <View style={styles.fallbackBlockC} />
            <View style={styles.fallbackBlockD} />
            <View style={styles.fallbackLabelPill}>
              <Text style={styles.fallbackLabelText}>Preview lokasi</Text>
            </View>
            <View style={[styles.markerWrap, { left: markerLeft as any, top: markerTop as any }]}>
              <View style={styles.markerHalo} />
              <View style={styles.markerBody}>
                <Text style={styles.markerIcon}>⌖</Text>
              </View>
            </View>
          </View>
        )}

        <View pointerEvents="none" style={styles.mapTint} />

        <View style={styles.mapOverlayBottom}>
          {latitude != null && longitude != null ? (
            <Pressable onPress={onOpenMaps} style={styles.mapButton} accessibilityRole="button">
              <Text style={styles.mapButtonText}>Buka Peta</Text>
            </Pressable>
          ) : (
            <View style={styles.mapButtonDisabled}>
              <Text style={styles.mapButtonTextDisabled}>Menunggu lokasi</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export const LocationPreviewCard = memo(LocationPreviewCardInner);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6F5',
    borderRadius: 30,
    borderWidth: 1,
    gap: 12,
    overflow: 'hidden',
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 2,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: '#101828',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: '#667085',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  refreshButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  refreshIcon: {
    color: '#D12D45',
    fontSize: 17,
    fontWeight: '900',
  },
  refreshText: {
    color: '#D12D45',
    fontSize: 15,
    fontWeight: '800',
  },
  infoRow: {
    gap: 10,
  },
  infoPill: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E3EAF4',
    borderRadius: 22,
    borderWidth: 1,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  accuracyText: {
    color: '#15803D',
    fontSize: 15.5,
    fontWeight: '800',
  },
  mapFrame: {
    backgroundColor: '#EAF2FF',
    borderRadius: 26,
    height: 260,
    overflow: 'hidden',
    position: 'relative',
  },
  webMap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  fallbackMap: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  fallbackBackdrop: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#EAF2FF',
  },
  fallbackRoadA: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    height: 16,
    left: '-12%',
    position: 'absolute',
    top: '30%',
    transform: [{ rotate: '14deg' }],
    width: '130%',
  },
  fallbackRoadB: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    height: 16,
    right: '-10%',
    position: 'absolute',
    top: '60%',
    transform: [{ rotate: '-16deg' }],
    width: '122%',
  },
  fallbackRoadC: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    height: 10,
    left: '18%',
    position: 'absolute',
    top: '12%',
    transform: [{ rotate: '6deg' }],
    width: '62%',
  },
  fallbackRoadD: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    height: 10,
    left: '10%',
    position: 'absolute',
    bottom: '18%',
    transform: [{ rotate: '-8deg' }],
    width: '74%',
  },
  fallbackBlockA: {
    backgroundColor: 'rgba(148,163,184,0.18)',
    borderRadius: 16,
    height: 52,
    left: 18,
    position: 'absolute',
    top: 18,
    width: 104,
  },
  fallbackBlockB: {
    backgroundColor: 'rgba(148,163,184,0.18)',
    borderRadius: 16,
    height: 68,
    right: 22,
    position: 'absolute',
    top: 34,
    width: 96,
  },
  fallbackBlockC: {
    backgroundColor: 'rgba(148,163,184,0.18)',
    borderRadius: 16,
    height: 58,
    left: 34,
    position: 'absolute',
    bottom: 40,
    width: 112,
  },
  fallbackBlockD: {
    backgroundColor: 'rgba(148,163,184,0.18)',
    borderRadius: 16,
    height: 44,
    right: 36,
    position: 'absolute',
    bottom: 30,
    width: 72,
  },
  fallbackLabelPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: 'absolute',
    bottom: 18,
  },
  fallbackLabelText: {
    color: '#102B57',
    fontSize: 13,
    fontWeight: '900',
  },
  markerWrap: {
    marginLeft: -28,
    marginTop: -34,
    position: 'absolute',
  },
  markerHalo: {
    backgroundColor: 'rgba(29, 78, 216, 0.12)',
    borderRadius: 999,
    height: 58,
    left: -4,
    position: 'absolute',
    top: -4,
    width: 58,
  },
  markerBody: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 46,
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 1,
    width: 46,
  },
  markerIcon: {
    color: '#1D4ED8',
    fontSize: 18,
    fontWeight: '900',
  },
  mapTint: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  mapOverlayBottom: {
    bottom: 14,
    left: 14,
    alignItems: 'center',
    position: 'absolute',
    right: 14,
    gap: 10,
  },
  mapButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCE6F5',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 2,
    minWidth: '80%',
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  mapButtonText: {
    color: '#102B57',
    fontSize: 15.5,
    fontWeight: '900',
  },
  mapButtonDisabled: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCE6F5',
    minWidth: '82%',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  mapButtonTextDisabled: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '800',
  },
  staticMap: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  staticMapImage: {
    borderRadius: 0,
  },
  staticMapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
  },
  staticMarker: {
    backgroundColor: '#1D4ED8',
    borderColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 4,
    height: 22,
    marginLeft: -11,
    marginTop: -11,
    position: 'absolute',
    width: 22,
  },
  staticMapBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: '#DCE6F5',
    borderRadius: 999,
    borderWidth: 1,
    left: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    top: 14,
  },
  staticMapBadgeText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
  },
});
