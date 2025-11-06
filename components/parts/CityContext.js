import React, { createContext, useState, useEffect } from "react";

export const CityContext = createContext();

export const CityProvider = ({ children }) => {
  const [currentCity, setCurrentCity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load city from storage on mount and when window gains focus
  useEffect(() => {
    const loadCity = async () => {
      try {
        const savedCity = localStorage.getItem("selectedCity");
        if (savedCity) {
          const parsedCity = JSON.parse(savedCity);
          // Validate city structure
          if (parsedCity?.id && parsedCity?.title) {
            setCurrentCity(parsedCity);
          } else {
            // Clear invalid data
            localStorage.removeItem("selectedCity");
          }
        }
      } catch (error) {
        console.error("Failed to load city:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCity();

    // Listen for window focus (similar to app coming to foreground)
    const handleFocus = () => {
      loadCity();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Update city in both state and storage
  const updateCity = async (city) => {
    try {
      if (!city?.id || !city?.title) {
        throw new Error("Invalid city object");
      }

      localStorage.setItem("selectedCity", JSON.stringify(city));
      setCurrentCity(city);
      return true; // Indicate success
    } catch (error) {
      console.error("Failed to save city:", error);
      throw error;
    }
  };

  // Clear selected city
  const clearCity = async () => {
    try {
      localStorage.removeItem("selectedCity");
      setCurrentCity(null);
    } catch (error) {
      console.error("Failed to clear city:", error);
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
