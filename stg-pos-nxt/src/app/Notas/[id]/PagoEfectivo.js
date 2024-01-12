"use client";
import { useState } from "react";
import { postData } from "@/lib/helpers/getData";
import { useOnlineStatus } from "@/components/Contexts/OnlineContext";
import { useTiendaData } from "@/components/Contexts/TiendaContext";
import { format_money } from "@/lib/helpers/formatters";
import { useParams } from "next/navigation";
import InputSimple from "@/components/atoms/InputSimple";
import { Alert, Button } from "flowbite-react";
const token = process.env.NEXT_PUBLIC_WA_TOKEN_ID;
const instance = process.env.NEXT_PUBLIC_WA_INSTANCE_ID;
const MUTATION = `  mutation PosSalesInsertPaymentEfectivo(
    $input: AddPagoPOSsalesEfectivo!
    $saldo: Float!
    $instance: String!
    $token: String!
    $online: Boolean!
  ) {
    posSalesInsertPaymentEfectivo(
      instance: $instance
      token: $token
      input: $input
      saldo: $saldo
      online: $online
    ) {
      code
      message
      success
    }
  }

`;
export default function PagoEfectivo({ setRefetch, saldo, cliente, numNota }) {
  const { lt, chg, print } = useTiendaData();
  const { isOnline } = useOnlineStatus();
  const { setLoadingTienda, loadingTienda } = lt;
  const { setCambio } = chg;
  const { setTimeToPrint } = print;
  const [error, setError] = useState("");
  const [pago, setPago] = useState(0);
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const addPago = async (e) => {
    e.preventDefault();
    setLoadingTienda(true);
    setError("");
    setLoading(true);
    try {
      const data = await postData({
        query: MUTATION,
        variables: {
          instance,
          token,
          saldo: Number(saldo),
          online: isOnline,
          input: {
            cantidad: saldo <= pago ? Number(saldo) : Number(pago),
            capturista: "6415a35cef355a1fda342d8a",
            cliente,
            clpv: id,
            numNota,
          },
        },
      });
      setCambio(pago - saldo);
      setRefetch(true);
      setLoadingTienda(false);
      setPago(0);
      setTimeToPrint(true);
      setLoading(false);
    } catch (error) {
      setLoadingTienda(false);
      setError(error.message);
      setLoading(false);
    }
  };
  return (
    <>
      <form
        onSubmit={addPago}
        className="border-2 p-4 rounded border-zinc-900 shadow-lg flex flex-col flex-nowrap justify-center items-center gap-4 w-72"
      >
        <h2 className="text-lg font-bold">Efectivo</h2>
        <InputSimple
          id="efectivo"
          type="number"
          label="Efectivo"
          min="0"
          step="0.01"
          value={pago}
          onChange={(e) => setPago(Number(e.target.value))}
        />
        <h2 className="text-lg font-bold">Cambio:</h2>
        <h2 className="text-lg">{format_money(pago - saldo)}</h2>
        <Button
          color="dark"
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading || loadingTienda ? "Guardando" : "Pagar"}
        </Button>
      </form>
      {error && <Alert color="failure">{error}</Alert>}
    </>
  );
}
