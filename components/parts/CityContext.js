import React, { createContext, useState, useEffect } from "react";
import Cookies from 'js-cookie';

export const CityContext = createContext();

export const CityProvider = ({ children }) => {
  const [currentCity, setCurrentCity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to convert Persian to English slug
  const convertToSlug = (persianText) => {
    if (!persianText) return '';
    
    const mapping = {
      'تهران': 'tehran',
      'رباط کریم': 'robat-karim',
      'کرج': 'karaj',
      'اصفهان': 'esfahan',
      'مشهد': 'mashhad',
      'شیراز': 'shiraz',
      'تبریز': 'tabriz',
      'اهواز': 'ahvaz',
      'قم': 'qom',
      'رشت': 'rasht',
      'ارومیه': 'urmia',
      'یزد': 'yazd',
      'کرمانشاه': 'kermanshah',
      'همدان': 'hamadan',
      'سنندج': 'sanandaj',
      'بندرعباس': 'bandar-abbas',
      'زاهدان': 'zahedan',
      'کیش': 'kish',
      'مازندران': 'mazandaran',
      'گیلان': 'gilan',
    };
    
    // Return mapped value or create simple slug
    return mapping[persianText] || 
           persianText.toLowerCase()
             .replace(/[\u0600-\u06FF\s]+/g, '-')
             .replace(/[^a-z0-9-]/g, '')
             .replace(/-+/g, '-')
             .replace(/^-|-$/g, '');
  };

  // Load city from cookies on mount
  useEffect(() => {
    const loadCity = async () => {
      try {
        // Load both cookies
        const persianCityRaw = Cookies.get('persian_city');
        const englishCityRaw = Cookies.get('city');
        
        console.log('Loading cookies:', { persianCityRaw, englishCityRaw });
        
        if (persianCityRaw) {
          let persianName = '';
          let englishSlug = '';
          
          // Parse Persian city name
          try {
            persianName = JSON.parse(persianCityRaw);
          } catch {
            persianName = persianCityRaw;
          }
          
          // Parse English city slug
          if (englishCityRaw) {
            try {
              englishSlug = JSON.parse(englishCityRaw);
            } catch {
              englishSlug = englishCityRaw;
            }
          } else {
            // If no English cookie, convert from Persian
            englishSlug = convertToSlug(persianName);
          }
          
          // Create city object
          const cityObj = {
            id: Date.now(), // You should store actual ID in cookie if available
            title: persianName,
            slug: englishSlug,
          };
          
          console.log('Loaded city:', cityObj);
          
          if (cityObj.title && cityObj.slug) {
            setCurrentCity(cityObj);
          } else {
            // Clear invalid data
            Cookies.remove('city');
            Cookies.remove('persian_city');
          }
        }
      } catch (error) {
        console.error("Failed to load city from cookies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCity();
  }, []);

  // Update city in cookies
  const updateCity = async (city) => {
    try {
      if (!city?.title) {
        throw new Error("Invalid city object - must have title");
      }

      // Ensure slug exists, generate if not
      const slug = city.slug || convertToSlug(city.title);
      
      console.log('Saving city:', { title: city.title, slug });

      // Store both values in separate cookies
      Cookies.set('city', JSON.stringify(slug), {
        expires: 365,
        path: '/',
        sameSite: 'strict'
      });

      Cookies.set('persian_city', JSON.stringify(city.title), {
        expires: 365,
        path: '/',
        sameSite: 'strict'
      });
      
      // Update state with complete city object
      setCurrentCity({
        ...city,
        slug: slug
      });
      return true;
    } catch (error) {
      console.error("Failed to save city to cookies:", error);
      throw error;
    }
  };

  // Clear selected city from cookies
  const clearCity = async () => {
    try {
      Cookies.remove('city', { path: '/' });
      Cookies.remove('persian_city', { path: '/' });
      setCurrentCity(null);
    } catch (error) {
      console.error("Failed to clear city from cookies:", error);
      throw error;
    }
  };

  return (
    <CityContext.Provider
      value={{
        currentCity,
        updateCity,
        clearCity,
        isLoading,
      }}
    >
      {children}
    </CityContext.Provider>
  );
};