"use client";
import { useState } from "react";
import { postData } from "@/lib/helpers/getData";
import { useOnlineStatus } from "@/components/Contexts/OnlineContext";
import { dateInputLocalFormat } from "@/lib/helpers/formatters";
import ClienteSection from "./ClienteSection";
import SearchableSelect from "@/components/atoms/SearchableSelect";
import AddCodigo from "./AddCodigo";
import Totales from "./Totales";
import ProductTable from "./ProductTable";
import Pagos from "./Pagos";
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
      <div className="flex flex-row flex-wrap justify-between items-center gap-4 my-2 w-full">
        <div>
          <h1 className="text-xl font-bold">#{nota?.numNota}</h1>
          <h2 className="text-lg font-bold">
            {dateInputLocalFormat(nota?.fecha)}
          </h2>
        </div>
        <Totales
          total={nota?.total}
          saldo={nota?.saldo}
          piezas={nota?.totalPiezas}
        />
      </div>
      <div className="flex flex-row flex-wrap gap-2 justify-between my-4 items-start w-full">
        <ClienteSection
          numNota={numNota}
          clienteName={nota?.clienteName}
          cliente={nota?.cliente}
          setRefetch={setRefetch}
        />
        <SearchableSelect
          label="Vendedora"
          options={empleados}
          value={vendedora}
          onChange={(e) => {
            setVendedora(e);
          }}
          onBlur={updateVendedora}
        />
      </div>
      <div className="flex flex-row flex-wrap justify-between items-center gap-4 my-2 w-full">
        <AddCodigo
          numNota={numNota}
          setRefetch={setRefetch}
          cliente={nota?.cliente}
        />
      </div>
      <ProductTable
        numNota={numNota}
        products={nota?.products}
        setRefetch={setRefetch}
        cliente={nota?.cliente}
        cupon={nota?.cupon}
      />
      <Totales
        total={nota?.total}
        saldo={nota?.saldo}
        piezas={nota?.totalPiezas}
      />
      <Pagos
        cuentas={cuentas}
        setRefetch={setRefetch}
        saldo={nota?.saldo}
        cliente={nota?.cliente}
        numNota={numNota}
        cuentasTransfer={cuentasTransfer}
      />
    </>
  );
}
