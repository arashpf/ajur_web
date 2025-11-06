import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

export const CityContext = createContext();

export const CityProvider = ({ children }) => {
  const [currentCity, setCurrentCity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load city from storage on mount and when app comes to foreground
  useEffect(() => {
    const loadCity = async () => {
      try {
        const savedCity = await AsyncStorage.getItem('selectedCity');
        if (savedCity) {
          const parsedCity = JSON.parse(savedCity);
          // Validate city structure
          if (parsedCity?.id && parsedCity?.title) {
            setCurrentCity(parsedCity);
          } else {
            // Clear invalid data
            await AsyncStorage.removeItem('selectedCity');
          }
        }
      } catch (error) {
        console.error('Failed to load city:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCity();

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        loadCity();
      }
    });

    return () => subscription?.remove();
  }, []);

  // Update city in both state and storage
  const updateCity = async (city) => {
    try {
      if (!city?.id || !city?.title) {
        throw new Error('Invalid city object');
      }
      
      await AsyncStorage.setItem('selectedCity', JSON.stringify(city));
      setCurrentCity(city);
      return true; // Indicate success
    } catch (error) {
      console.error('Failed to save city:', error);
      throw error;
    }
  };

  // Clear selected city
  const clearCity = async () => {
    try {
      await AsyncStorage.removeItem('selectedCity');
      setCurrentCity(null);
    } catch (error) {
      console.error('Failed to clear city:', error);
      throw error;
    }
  };

  return (
    <CityContext.Provider 
      value={{ 
        currentCity, 
        updateCity, 
        clearCity,
        isLoading 
      }}
    >
      {children}
    </CityContext.Provider>
  );
};