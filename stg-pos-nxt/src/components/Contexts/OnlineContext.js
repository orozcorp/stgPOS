"use client";
import { createContext, useState, useContext, useEffect } from "react";
import useLocalStorage from "../Hooks/useLocalStorage";
const OnlineStatusContext = createContext();

export function OnlineContainer(props) {
  const [isOnline, setOnline] = useLocalStorage("isOnline", true);
  const [crearGastoDisplay, setCrearGastoDisplay] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    // Once component mounts, set isHydrated to true
    setIsHydrated(true);
  }, []);

  const value = isHydrated
    ? {
        isOnline,
        setOnline,
        crearGastoDisplay,
        setCrearGastoDisplay,
      }
    : {
        isOnline: true, // Default or fallback state
        setOnline: () => {},
        crearGastoDisplay,
        setCrearGastoDisplay,
      };

  return <OnlineStatusContext.Provider value={value} {...props} />;
}

export function useOnlineStatus() {
  const context = useContext(OnlineStatusContext);
  if (context === undefined) {
    throw new Error(
      "useOnlineStatus must be used within a OnlineStatusProvider"
    );
  }
  return context;
}
