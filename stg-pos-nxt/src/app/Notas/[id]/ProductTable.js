"use client";

import ProductTableRow from "./ProductTableRow";

export default function ProductTable({
  numNota,
  products,
  setRefetch,
  cliente,
  cupon,
}) {
  return (
    <div className="relative overflow-x-auto rounded-md shadow-lg my-6">
      <table className="w-full text-sm text-left rtl:text-right text-white bg-zinc-900 ">
        <thead className="text-xs text-white uppercase bg-zinc-900  ">
          <tr>
            <th className="px-4 py-1.5">Modelo</th>
            <th className="px-4 py-1.5">Talla</th>
            <th className="px-4 py-1.5">Color</th>
            <th className="px-4 py-1.5">Cantidad</th>
            <th className="px-4 py-1.5">Precio</th>
            <th className="px-4 py-1.5">Subtotal</th>
            <th className="px-4 py-1.5">Liq</th>
            <th className="px-4 py-1.5">Borrar</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((product) => (
            <ProductTableRow
              key={product?._id}
              product={product}
              numNota={numNota}
              cliente={cliente}
              cupon={cupon}
              setRefetch={setRefetch}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
