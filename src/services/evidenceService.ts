// ============================================================
// CrashGuide Texas - Evidence Capture Service
// ============================================================

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { v4 as uuidv4 } from 'uuid';
import { EvidenceItem, EvidenceType, GeoLocation } from '../types';

export async function requestCameraPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

export async function requestMediaLibraryPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

export async function requestLocationPermissions(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentLocation(): Promise<GeoLocation | null> {
  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) return null;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}

export async function capturePhoto(
  evidenceType: EvidenceType = 'other',
  description: string = '',
): Promise<EvidenceItem | null> {
  try {
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
      id: uuidv4(),
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
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) {
      throw new Error('Media library permission not granted');
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
      id: uuidv4(),
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
