"use client";

import PagoEfectivo from "./PagoEfectivo";
import PagoTarjetaCredito from "./PagoTarjetaCredito";
import PagoTransferencia from "./PagoTransferencia";

export default function Pagos({
  cuentas,
  setRefetch,
  saldo,
  cliente,
  numNota,
  cuentasTransfer,
}) {
  return (
    <div className="flex flex-row flex-wrap w-full justify-around items-stretch my-12">
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
        cuentas={cuentas}
      />
      <PagoTransferencia
        setRefetch={setRefetch}
        saldo={saldo}
        cliente={cliente}
        numNota={numNota}
        cuentas={cuentasTransfer}
      />
    </div>
  );
}
