import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  location: LocationData | null;
  errorMsg: string | null;
  isLoading: boolean;
  requestLocationPermission: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType>({} as LocationContextType);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const requestLocationPermission = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Ask the user for permission to use their device GPS
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied. Please enable it in your phone settings.');
        setIsLoading(false);
        return;
      }

      // 2. Access the exact latitude and longitude
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      
    } catch (error) {
      setErrorMsg('Ensure your device GPS is turned on and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Permission is requested on demand (e.g. the home screen calls
  // requestLocationPermission() right before its first location-based
  // search) rather than unconditionally at cold launch, before login and
  // before the user has any context for why the app wants their GPS.
  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (errorMsg) console.log("CURRENT GPS ERROR:", errorMsg);

  return (
    <LocationContext.Provider value={{ location, errorMsg, isLoading, requestLocationPermission }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
