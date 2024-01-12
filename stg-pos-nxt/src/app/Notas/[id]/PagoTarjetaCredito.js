"use client";
import { useState } from "react";
import { postData } from "@/lib/helpers/getData";
import { useOnlineStatus } from "@/components/Contexts/OnlineContext";
import { useTiendaData } from "@/components/Contexts/TiendaContext";
import SearchableSelect from "@/components/atoms/SearchableSelect";
import { useParams } from "next/navigation";
import InputSimple from "@/components/atoms/InputSimple";
const TarjetaOptions = [
  { value: "Tarjeta de credito", label: "Credito" },
  { value: "Tarjeta de debito", label: "Debito" },
];
const token = process.env.NEXT_PUBLIC_WA_TOKEN_ID;
const instance = process.env.NEXT_PUBLIC_WA_INSTANCE_ID;
const MUTATION = ` mutation PosSalesInsertPaymentTarjeta(
    $input: AddPagoPOSsalesTarjeta!
    $saldo: Float!
    $instance: String!
    $token: String!
    $online: Boolean!
  ) {
    posSalesInsertPaymentTarjeta(
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
  }`;
export default function PagoTarjetaCredito({
  setRefetch,
  saldo,
  cliente,
  numNota,
  cuentas,
}) {
  const { lt, chg, print } = useTiendaData();
  const { isOnline } = useOnlineStatus();
  const { setLoadingTienda, loadingTienda } = lt;
  const { setCambio } = chg;
  const { setTimeToPrint } = print;
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [factura, setFactura] = useState(false);
  const { id } = useParams();
  const [tarjetaCredito, setTarjetaCredito] = useState({
    value: "Tarjeta de credito",
    label: "Credito",
  });
  const [cuenta, setCuenta] = useState({
    value: "b1",
    label: "INBURSA LALITO INBURSA",
  });
  const [pago, setPago] = useState(0);
  const [ult4, setUlt4] = useState("");
  const addPago = async (e) => {
    e.preventDefault();
    setLoadingTienda(true);
    setError("");
    setCargando(true);
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
            tipoPago: tarjetaCredito.value,
            numNota: Number(numNota),
            cuenta: cuenta.value,
            cuentaName: cuenta.label,
            factura,
            ult4,
          },
        },
      });
      setLoadingTienda(false);
      setCargando(false);
      setPago(0);
      setTimeToPrint(true);
      setRefetch(true);
      setUlt4("");
    } catch (error) {
      setLoadingTienda(false);
      setCargando(false);
      setError(error.message);
    }
  };
  return (
    <form
      onSubmit={addPago}
      className="border-2 p-4 rounded border-zinc-900 shadow-lg flex flex-col flex-nowrap justify-center items-center gap-4 w-72"
    >
      <h2 className="text-lg font-bold">Tarjeta</h2>
      <InputSimple
        id="aPagar"
        label="A pagar"
        type="number"
        required
        value={pago}
        min="0"
        step="0.01"
        onChange={(e) => {
          const number = e.currentTarget.value;
          setPago(number);
          setCambio(Number(number - saldo));
        }}
      />
      <SearchableSelect
        options={TarjetaOptions}
        value={tarjetaCredito}
        label="Tipo de tarjeta"
        onChange={(e) => setTarjetaCredito(e)}
      />

      <SearchableSelect
        options={cuentas}
        value={cuenta}
        label="Cuenta"
        onChange={(e) => setCuenta(e)}
      />
    </form>
  );
}
