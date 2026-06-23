import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';

type Props = {
  visible: boolean;
  uri: string | null;
  title?: string;
  onClose: () => void;
};

const MAX_SCALE = 3;
const MIN_SCALE = 1;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function ImageZoomModal({ visible, uri, title, onClose }: Props) {
  const scaleBase = useRef(new Animated.Value(1)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const pinchRef = useRef<PinchGestureHandler>(null);
  const panRef = useRef<PanGestureHandler>(null);

  const currentScaleRef = useRef(1);
  const currentTranslateRef = useRef({ x: 0, y: 0 });
  const gestureTranslateXRef = useRef(0);
  const gestureTranslateYRef = useRef(0);

  const combinedScale = Animated.multiply(scaleBase, pinchScale);

  useEffect(() => {
    if (visible) {
      currentScaleRef.current = 1;
      currentTranslateRef.current = { x: 0, y: 0 };
      gestureTranslateXRef.current = 0;
      gestureTranslateYRef.current = 0;
      scaleBase.setValue(1);
      pinchScale.setValue(1);
      translateX.setValue(0);
      translateY.setValue(0);
      translateX.setOffset(0);
      translateY.setOffset(0);
    }
  }, [visible, pinchScale, scaleBase, translateX, translateY]);

  const animateScaleTo = (nextScale: number) => {
    const clamped = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    currentScaleRef.current = clamped;
    scaleBase.setValue(clamped);
    pinchScale.setValue(1);
  };

  const onPinchGestureEvent = Animated.event([{ nativeEvent: { scale: pinchScale } }], {
    useNativeDriver: true,
  });

  const onPinchStateChange = ({ nativeEvent }: any) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      animateScaleTo(currentScaleRef.current * nativeEvent.scale);
    }
  };

  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true },
  );

  const onPanStateChange = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.BEGAN) {
      translateX.setOffset(currentTranslateRef.current.x);
      translateY.setOffset(currentTranslateRef.current.y);
      translateX.setValue(0);
      translateY.setValue(0);
      gestureTranslateXRef.current = 0;
      gestureTranslateYRef.current = 0;
      return;
    }

    if (nativeEvent.oldState === State.ACTIVE) {
      currentTranslateRef.current = {
        x: currentTranslateRef.current.x + gestureTranslateXRef.current,
        y: currentTranslateRef.current.y + gestureTranslateYRef.current,
      };
      gestureTranslateXRef.current = 0;
      gestureTranslateYRef.current = 0;
      translateX.flattenOffset();
      translateY.flattenOffset();
    }
  };

  if (!uri) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.closeArea} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {title || 'Foto'}
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <View style={styles.imageStage}>
            <PanGestureHandler
              ref={panRef}
              simultaneousHandlers={pinchRef}
              onGestureEvent={(event) => {
                gestureTranslateXRef.current = event.nativeEvent.translationX;
                gestureTranslateYRef.current = event.nativeEvent.translationY;
                onPanGestureEvent(event);
              }}
              onHandlerStateChange={onPanStateChange}
            >
              <Animated.View style={styles.gestureSurface}>
                <PinchGestureHandler
                  ref={pinchRef}
                  simultaneousHandlers={panRef}
                  onGestureEvent={onPinchGestureEvent}
                  onHandlerStateChange={onPinchStateChange}
                >
                  <Animated.View
                    style={[
                      styles.gestureSurface,
                      {
                        transform: [
                          { translateX },
                          { translateY },
                          { scale: combinedScale },
                        ],
                      },
                    ]}
                  >
                    <Image source={{ uri }} resizeMode="contain" style={styles.image} />
                  </Animated.View>
                </PinchGestureHandler>
              </Animated.View>
            </PanGestureHandler>

            <View style={styles.hintBadge}>
              <Text style={styles.hintText}>Cubit untuk zoom, geser untuk melihat detail</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <Pressable onPress={() => animateScaleTo(currentScaleRef.current + 0.4)} style={styles.controlButton}>
              <Text style={styles.controlText}>+</Text>
            </Pressable>
            <Pressable onPress={() => animateScaleTo(currentScaleRef.current - 0.4)} style={styles.controlButton}>
              <Text style={styles.controlText}>-</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                currentTranslateRef.current = { x: 0, y: 0 };
                translateX.setValue(0);
                translateY.setValue(0);
                translateX.setOffset(0);
                translateY.setOffset(0);
                animateScaleTo(1);
              }}
              style={styles.controlButtonWide}
            >
              <Text style={styles.controlText}>Reset</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.92)',
    justifyContent: 'flex-end',
  },
  closeArea: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#0B1220',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  imageStage: {
    alignItems: 'center',
    backgroundColor: '#050B16',
    borderRadius: 24,
    height: Math.max(360, height * 0.62),
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gestureSurface: {
    height: '100%',
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  hintBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.72)',
    borderRadius: 999,
    bottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: 'absolute',
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: '#132033',
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  controlButtonWide: {
    alignItems: 'center',
    backgroundColor: '#132033',
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    minWidth: 92,
    paddingHorizontal: 16,
  },
  controlText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
});

export default ImageZoomModal;
