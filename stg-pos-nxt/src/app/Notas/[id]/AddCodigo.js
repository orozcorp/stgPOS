"use client";
import { useState } from "react";
import { useTiendaData } from "@/components/Contexts/TiendaContext";
import { useOnlineStatus } from "@/components/Contexts/OnlineContext";
import { Spinner, Button } from "flowbite-react";
import { postData } from "@/lib/helpers/getData";
import InputSimple from "@/components/atoms/InputSimple";
import BuscarPorModelo from "./BuscarPorModelo";
const MUTATION = `mutation PosSalesInsertModeloCodigo(
    $idNota: String!
    $code: String!
    $cliente: String!
    $cupon: Boolean
    $online: Boolean!
  ) {
    posSalesInsertModeloCodigo(
      idNota: $idNota
      code: $code
      cliente: $cliente
      cupon: $cupon
      online: $online
    ) {
      code
      message
      success
    }
  }`;

export default function AddCodigo({ numNota, setRefetch, cliente, cupon }) {
  const { isOnline } = useOnlineStatus();
  const [error, setError] = useState("");
  const { lt } = useTiendaData();
  const { setLoadingTienda } = lt;
  const [loading, setLoading] = useState(false);
  const [buscarModelo, setBuscarModelo] = useState(false);
  const [codigo, setCodigo] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingTienda(true);
    setError("");
    const variables = {
      idNota: numNota,
      code: codigo,
      cliente: cliente,
      cupon: false,
      online: isOnline,
    };
    try {
      const data = await postData({
        query: MUTATION,
        variables,
      });
      console.log(data);
      setCodigo("");
      setRefetch(true);
      setLoading(false);
      setLoadingTienda(false);
      return data;
    } catch (error) {
      console.log(error);
      setError(error.message);
      setLoadingTienda(false);
    }
  };
  return (
    <div className="flex flex-row flex-wrap justify-between items-start my-2 flex-1">
      {!buscarModelo && (
        <div className="flex flex-row flex-wrap justify-between items-center gap-4 w-full">
          <form onSubmit={handleSubmit} className="flex-1">
            <InputSimple
              id="codigo"
              label="Código"
              type="text"
              autoFocus
              disabled={loading}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            />
          </form>
          <Button
            type="submit"
            color="dark"
            disabled={loading}
            onClick={() => setBuscarModelo(true)}
          >
            Buscar por modelo
          </Button>
        </div>
      )}
      {loading && <Spinner />}
      {buscarModelo && (
        <BuscarPorModelo
          numNota={numNota}
          setRefetch={setRefetch}
          cliente={cliente}
          cupon={cupon}
          setBuscarModelo={setBuscarModelo}
        />
      )}
    </div>
  );
}
