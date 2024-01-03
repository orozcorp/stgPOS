"use client";
import { useState } from "react";
import { postData } from "@/lib/helpers/getData";
import { useOnlineStatus } from "@/components/Contexts/OnlineContext";
import { dateInputLocalFormat } from "@/lib/helpers/formatters";
import ClienteSection from "./ClienteSection";
const MUTATION_VENDEDORA = `  mutation PosSalesUpdateVendedora(
    $idNota: String!
    $vendedora: String!
    $vendedoraName: String!
    $online: Boolean!
  ) {
    posSalesUpdateVendedora(
      idNota: $idNota
      vendedora: $vendedora
      vendedoraName: $vendedoraName
      online: $online
    ) {
      code
      message
      success
    }
  }`;
export default function NotaDesarrollo({
  numNota,
  setRefetch,
  nota,
  cuentas,
  cuentasTransfer,
  empleados,
}) {
  const [vendedora, setVendedora] = useState({
    value: nota?.vendedora,
    label: nota?.vendedoraName,
  });
  const { isOnline } = useOnlineStatus();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const updateVendedora = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await postData({
        query: MUTATION_VENDEDORA,
        variables: {
          idNota: numNota,
          vendedora: vendedora.value,
          vendedoraName: vendedora.label,
          online: isOnline,
        },
      });
      setRefetch(true);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  return (
    <>
      <h1 className="text-xl font-bold">#{nota?.numNota}</h1>
      <h2 className="text-lg font-bold">{dateInputLocalFormat(nota?.fecha)}</h2>
      <div className="flex flex-row flex-wrap gap-2 justify-between my-4 items-center w-full">
        <ClienteSection
          numNota={numNota}
          clienteName={nota?.clienteName}
          cliente={nota?.cliente}
          setRefetch={setRefetch}
        />
      </div>
    </>
  );
}
