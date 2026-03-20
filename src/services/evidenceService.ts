// ============================================================
// CrashGuide Texas - Evidence Capture Service
// ============================================================

import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { randomUUID } from 'expo-crypto';
import { EvidenceItem, EvidenceType, GeoLocation } from '../types';

const isWeb = Platform.OS === 'web';

export async function requestCameraPermissions(): Promise<boolean> {
  if (isWeb) return true; // Web uses file input, no permission needed
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

export async function requestMediaLibraryPermissions(): Promise<boolean> {
  if (isWeb) return true;
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

export async function requestLocationPermissions(): Promise<boolean> {
  if (isWeb) {
    // Web uses browser Geolocation API
    return 'geolocation' in navigator;
  }
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

const LOCATION_TIMEOUT_MS = 6000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  const timer = new Promise<null>((resolve) => setTimeout(() => resolve(null), ms));
  return Promise.race([promise, timer]);
}

export async function getCurrentLocation(): Promise<GeoLocation | null> {
  try {
    if (isWeb) {
      if (!('geolocation' in navigator)) return null;
      const webPromise = new Promise<GeoLocation | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }),
          () => resolve(null),
          { enableHighAccuracy: false, timeout: LOCATION_TIMEOUT_MS },
        );
      });
      return await withTimeout(webPromise, LOCATION_TIMEOUT_MS);
    }

    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) return null;

    // Use Balanced accuracy — faster fix, still accurate enough for tagging
    const locationPromise = Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const location = await withTimeout(locationPromise, LOCATION_TIMEOUT_MS);
    if (!location) return null;

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
    };
  } catch (error) {
    console.warn('Could not get location for photo tag:', error);
    return null;
  }
}

export async function capturePhoto(
  evidenceType: EvidenceType = 'other',
  description: string = '',
): Promise<EvidenceItem | null> {
  try {
    if (isWeb) {
      // On web, camera launch falls back to file picker in expo-image-picker
      return pickPhotoFromLibrary(evidenceType, description);
    }

    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      throw new Error('Camera permission not granted');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      exif: true,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    const asset = result.assets[0];
    const location = await getCurrentLocation();

    return {
      id: randomUUID(),
      type: evidenceType,
      uri: asset.uri,
      timestamp: new Date(),
      location,
      description,
    };
  } catch (error) {
    console.error('Error capturing photo:', error);
    return null;
  }
}

export async function pickPhotoFromLibrary(
  evidenceType: EvidenceType = 'other',
  description: string = '',
): Promise<EvidenceItem | null> {
  try {
    if (!isWeb) {
      const hasPermission = await requestMediaLibraryPermissions();
      if (!hasPermission) {
        throw new Error('Media library permission not granted');
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    const asset = result.assets[0];
    const location = await getCurrentLocation();

    return {
      id: randomUUID(),
      type: evidenceType,
      uri: asset.uri,
      timestamp: new Date(),
      location,
      description,
    };
  } catch (error) {
    console.error('Error picking photo:', error);
    return null;
  }
}

export function formatEvidenceTypeLabel(type: EvidenceType): string {
  const labels: Record<EvidenceType, string> = {
    vehicle_damage: 'Vehicle Damage',
    license_plate: 'License Plate',
    scene: 'Accident Scene',
    injury: 'Injury',
    document: 'Document',
    other: 'Other',
  };
  return labels[type];
}
