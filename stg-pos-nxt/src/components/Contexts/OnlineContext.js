"use client";
import { createContext, useState, useContext } from "react";
const OnlineStatusContext = createContext();

export function OnlineContainer(props) {
  const [isOnline, setOnline] = useState(true);
  const [crearGastoDisplay, setCrearGastoDisplay] = useState(false);
  const value = {
    isOnline,
    setOnline,
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
