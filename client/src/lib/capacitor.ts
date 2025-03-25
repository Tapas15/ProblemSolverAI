// Mobile device features and capabilities through Capacitor
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Browser } from '@capacitor/browser';
import { Preferences } from '@capacitor/preferences';
import { Geolocation, Position, PermissionStatus } from '@capacitor/geolocation';

/**
 * Check if the app is running on a native mobile platform
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Get the current platform (ios, android, web)
 */
export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};

/**
 * Initialize mobile app features
 */
export const initializeApp = async (): Promise<void> => {
  // Only run this code on native platforms
  if (!isNativePlatform()) return;
  
  try {
    // Configure and show the status bar
    await StatusBar.setStyle({ style: Style.Dark });
    if (getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#0072FF' });
    }
    
    // Hide the splash screen with a fade animation
    await SplashScreen.hide({
      fadeOutDuration: 500
    });
  } catch (error) {
    console.error('Error initializing mobile app:', error);
  }
};

/**
 * Take a photo using the device camera
 */
export const takePhoto = async (): Promise<string | null> => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });
    
    return image.webPath || null;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

/**
 * Open a URL in the in-app browser
 */
export const openBrowser = async (url: string): Promise<void> => {
  try {
    await Browser.open({ url });
  } catch (error) {
    console.error('Error opening browser:', error);
    // Fallback for web
    window.open(url, '_blank');
  }
};

/**
 * Store data in device storage
 */
export const storeData = async (key: string, value: string): Promise<void> => {
  try {
    await Preferences.set({ key, value });
  } catch (error) {
    console.error('Error storing data:', error);
  }
};

/**
 * Retrieve data from device storage
 */
export const getData = async (key: string): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key });
    return value;
  } catch (error) {
    console.error('Error retrieving data:', error);
    return null;
  }
};

/**
 * Remove data from device storage
 */
export const removeData = async (key: string): Promise<void> => {
  try {
    await Preferences.remove({ key });
  } catch (error) {
    console.error('Error removing data:', error);
  }
};

/**
 * Check geolocation permission status
 */
export const checkLocationPermission = async (): Promise<PermissionStatus> => {
  try {
    return await Geolocation.checkPermissions();
  } catch (error) {
    console.error('Error checking location permission:', error);
    return { location: 'denied' };
  }
};

/**
 * Request geolocation permission
 */
export const requestLocationPermission = async (): Promise<PermissionStatus> => {
  try {
    return await Geolocation.requestPermissions();
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return { location: 'denied' };
  }
};

/**
 * Get current location
 */
export const getCurrentLocation = async (): Promise<Position | null> => {
  try {
    // Check for permission first
    const permissionStatus = await checkLocationPermission();
    
    if (permissionStatus.location !== 'granted') {
      const requestStatus = await requestLocationPermission();
      if (requestStatus.location !== 'granted') {
        throw new Error('Location permission not granted');
      }
    }
    
    // Get current position with high accuracy
    return await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    });
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};