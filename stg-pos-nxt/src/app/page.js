"use client";
import Link from "next/link";
import CrearGasto from "./(components)/CrearGasto";
import { Spinner, Alert } from "flowbite-react";
import { postData } from "@/lib/helpers/getData";
import { useOnlineStatus } from "@/components/Contexts/OnlineContext";
import { useState } from "react";
const MUTATION = `mutation SyncOffline {
  syncOffline{
    code
    message
    success
  }
}
`;
export default function Home() {
  const { crearGastoDisplay, setCrearGastoDisplay, setOnline, isOnline } =
    useOnlineStatus();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const syncOffline = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await postData({ query: MUTATION });
      setOnline(false);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError(error);
    }
  };
  const syncOnline = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await postData({ query: MUTATION_ONLINE });
      setOnline(true);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError(error);
    }
  };
  return (
    <>
      {crearGastoDisplay && (
        <CrearGasto
          display={crearGastoDisplay}
          setDisplay={setCrearGastoDisplay}
        />
      )}
      <main className="flex flex-col flex-nowrap min-h-screen p-8">
        <h1 className="text-4xl font-bold mt-4 mb-8">STERLING POS</h1>
        <div className="flex flex-row flex-wrap justify-start items-start gap-4">
          <button className="bg-zinc-800 text-white p-4 rounded shadow-lg">
            <h2 className="text-xl font-bold">Crear Nota</h2>
          </button>
          <Link
            href="/Notas"
            className="bg-zinc-800 text-white p-4 rounded shadow-lg"
          >
            <h2 className="text-xl font-bold">Historial de Notas</h2>
          </Link>
          <button
            onClick={() => setCrearGastoDisplay(true)}
            className="bg-zinc-800 text-white p-4 rounded shadow-lg"
          >
            <h2 className="text-xl font-bold">Crear Gasto</h2>
          </button>
          <button
            onClick={() => (isOnline ? syncOffline() : syncOnline())}
            disabled={loading}
            className="bg-red-700 text-white p-4 rounded shadow-lg"
          >
            <h2 className="text-xl font-bold">
              {loading ? (
                <div className="flex flex-row flex-wrap gap-2">
                  <Spinner />
                  Sinconizando...
                </div>
              ) : (
                `Sincronizar ${isOnline ? "con Offline" : "con Online"}`
              )}
            </h2>
          </button>
          {error && (
            <Alert
              className="w-full"
              type="danger"
              title="Error"
              message={error}
            />
          )}
        </div>
      </main>
    </>
  );
}
