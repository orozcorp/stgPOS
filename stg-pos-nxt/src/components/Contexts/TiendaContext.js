"use client";
import { createContext, useContext, useState, useMemo } from "react";

const TiendaContext = createContext();

export function TiendaContainer({ children }) {
  const [loadingTienda, setLoadingTienda] = useState(false);
  const [cambio, setCambio] = useState(0);
  const [timeToPrint, setTimeToPrint] = useState(false);
  const providerValue = useMemo(() => {
    return {
      lt: { loadingTienda, setLoadingTienda },
      chg: { cambio, setCambio },
      print: { timeToPrint, setTimeToPrint },
    };
  }, [loadingTienda, cambio, timeToPrint]);

  return (
    <TiendaContext.Provider value={providerValue}>
      {children}
    </TiendaContext.Provider>
  );
}

export function useTiendaData() {
  const context = useContext(TiendaContext);
  if (!context) {
    throw new Error("useTiendaData must be used in a Tienda provider");
  }
  return context;
}
