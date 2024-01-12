"use client";

import PagoEfectivo from "./PagoEfectivo";
import PagoTarjetaCredito from "./PagoTarjetaCredito";

export default function Pagos({
  cuentas,
  setRefetch,
  saldo,
  cliente,
  numNota,
  cuentasTransfer,
}) {
  return (
    <div className="flex flex-row flex-wrap w-full justify-around items-stretch">
      <PagoEfectivo
        setRefetch={setRefetch}
        saldo={saldo}
        cliente={cliente}
        numNota={numNota}
      />
      <PagoTarjetaCredito
        setRefetch={setRefetch}
        saldo={saldo}
        cliente={cliente}
        numNota={numNota}
      />
    </div>
  );
}
