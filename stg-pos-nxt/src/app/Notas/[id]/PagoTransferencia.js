"use client";
import { useState } from "react";
import { postData } from "@/lib/helpers/getData";
import { useOnlineStatus } from "@/components/Contexts/OnlineContext";
import { useTiendaData } from "@/components/Contexts/TiendaContext";
import { Checkbox, Label, Alert, Button } from "flowbite-react";
import SearchableSelect from "@/components/atoms/SearchableSelect";
import { useParams } from "next/navigation";
import InputSimple from "@/components/atoms/InputSimple";
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
  }
`;

export default function PagoTransferencia({
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
  const [cuenta, setCuenta] = useState({
    value: "b1",
    label: "INBURSA LALITO INBURSA",
  });
  const [pago, setPago] = useState(0);
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
            tipoPago: "Transferencia",
            numNota: Number(numNota),
            cuenta: cuenta.value,
            cuentaName: cuenta.label,
            factura,
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
      <h2 className="text-lg font-bold">Transferencia</h2>
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
      <div className="flex flex-col flex-nowrap justify-center items-center gap-2">
        <Checkbox
          id="factura"
          checked={factura}
          onChange={(e) => setFactura(e.currentTarget.checked)}
        />
        <Label htmlFor="factura" className="flex">
          Factura
        </Label>
      </div>
      <SearchableSelect
        options={cuentas}
        value={cuenta}
        label="Cuenta"
        onChange={(e) => setCuenta(e)}
      />
      <Button color="dark" type="submit" disabled={cargando} className="w-full">
        {cargando || loadingTienda ? "Guardando" : "Pagar"}
      </Button>
      {error && <Alert color="failure">{error}</Alert>}
    </form>
  );
}
