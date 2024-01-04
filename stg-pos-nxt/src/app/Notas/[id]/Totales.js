"use client";
import { useTiendaData } from "@/components/Contexts/TiendaContext";
import { format_money, format_qty } from "@/lib/helpers/formatters";
import { Spinner } from "flowbite-react";
export default function Totales({ total, saldo, piezas, cupon }) {
  const { lt } = useTiendaData();
  const { loadingTienda } = lt;
  return (
    <>
      {loadingTienda ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-2 flex-nowrap">
          <h2 className="text-2xl font-bold">Total: {format_money(total)}</h2>
          <h2 className="text-2xl font-bold">Saldo: {format_money(saldo)}</h2>
          {cupon && (
            <h2 className="text-2xl font-bold">Cupon: {format_money(cupon)}</h2>
          )}
          <h2 className="text-2xl font-bold">
            Total Pieza: {format_qty(piezas)}
          </h2>
        </div>
      )}
    </>
  );
}
