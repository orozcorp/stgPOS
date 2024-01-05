"use client";
import { format_money } from "@/lib/helpers/formatters";
import { useTiendaData } from "@/components/Contexts/TiendaContext";
import { useOnlineStatus } from "@/components/Contexts/OnlineContext";
import { postData } from "@/lib/helpers/getData";
import { Spinner, Button, Alert, Badge } from "flowbite-react";
import { useEffect, useState } from "react";
import InputSimple from "@/components/atoms/InputSimple";
const MUTATION = ` mutation PosSalesUpdateSubtotals(
    $idNota: String!
    $idProduct: String!
    $cantidad: Float!
    $precio: Float!
    $cliente: String!
    $cupon: Boolean
    $type: String!
    $online: Boolean!
  ) {
    posSalesUpdateSubtotals(
      idNota: $idNota
      idProduct: $idProduct
      cantidad: $cantidad
      precio: $precio
      cliente: $cliente
      cupon: $cupon
      type: $type
      online: $online
    ) {
      code
      message
      success
    }
  }`;
const MUT_REMOVE = `
  mutation PosSalesUpdateRemoveProduct(
    $idNota: String!
    $idProduct: String!
    $cliente: String!
    $cupon: Boolean
        $online: Boolean!
  ) {
    posSalesUpdateRemoveProduct(
      idNota: $idNota
      idProduct: $idProduct
      cliente: $cliente
      cupon: $cupon
      online: $online
    ) {
      code
      message
      success
    }
  }
`;
export default function ProductTableRow({
  product,
  setRefetch,
  numNota,
  cliente,
  cupon,
}) {
  const { lt } = useTiendaData();
  const { setLoadingTienda } = lt;
  const { isOnline } = useOnlineStatus();
  const [precio, setPrecio] = useState(product.precio);
  const [cantidad, setCantidad] = useState(product.cantidad);
  useEffect(() => {
    setCantidad(product.cantidad);
    setPrecio(product.precio);
  }, [product]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const updateTotals = async ({ type }) => {
    setLoading(true);
    setLoadingTienda(true);
    try {
      const data = await postData({
        query: MUTATION,
        variables: {
          idNota: numNota,
          idProduct: product._id,
          cantidad: Number(cantidad),
          precio: Number(precio),
          cliente,
          cupon,
          type,
          online: isOnline,
        },
      });
      setRefetch(true);
      setLoading(false);
      setLoadingTienda(false);
    } catch (error) {
      console.log(error);
      setError(error.message);
      setLoading(false);
      setLoadingTienda(false);
    }
  };
  const [loadingRemove, setLoadingRemove] = useState(false);
  const remove = async () => {
    setLoadingRemove(true);
    setLoadingTienda(true);
    try {
      const data = await postData({
        query: MUT_REMOVE,
        variables: {
          idNota: numNota,
          idProduct: product.idProduct,
          cliente,
          cupon,
        },
      });
      setRefetch(true);
      setLoadingRemove(false);
      setLoadingTienda(false);
    } catch (error) {
      console.log(error);
      setError(error.message);
      setLoadingRemove(false);
      setLoadingTienda(false);
    }
  };
  return (
    <>
      <tr className="bg-white text-zinc-800 border-b text-center">
        <td className="px-4 py-1.5">
          <div className="flex flex-col flex-nowrap items-center justify-center">
            <b className="mr-2 text-sm">{product.mod}</b>
            <div className="text-xs/[12px]">{product.modDesc}</div>
          </div>
        </td>
        <td>
          <b>{product.talla}</b>
        </td>
        <td>
          <div className="text-xs flex flex-col flex-nowrap items-center justify-center">
            <b className="mr-2 text-sm">{product.colorDesc}</b>
            <div>{product.colorTelaName}</div>
          </div>
        </td>
        <td className="px-4 py-1.5 min-w-48">
          <InputSimple
            id="cantidad"
            label="Cantidad"
            type="number"
            value={cantidad}
            disabled={loading}
            onChange={(e) => setCantidad(e.target.value)}
            onBlur={() => updateTotals({ type: "cantidad" })}
          />
        </td>
        <td className="px-4 py-1.5 min-w-48">
          <InputSimple
            id="precio"
            label="Precio"
            type="number"
            value={precio}
            disabled={loading}
            onChange={(e) => setPrecio(e.target.value)}
            onBlur={() => updateTotals({ type: "price" })}
          />
        </td>
        <td>{format_money(precio * cantidad)}</td>
        <td>
          <div className="flex flex-col flex-nowrap items-center justify-center">
            <Badge color="failure">{product?.liquidacion ? "Si" : "No"}</Badge>
          </div>
        </td>
        <td>
          <div className="flex flex-col flex-nowrap items-center justify-center">
            <Button
              disabled={loadingRemove}
              color="failure"
              size="xs"
              onClick={remove}
            >
              Borrar
            </Button>
          </div>
        </td>
      </tr>
      {error && (
        <tr>
          <td colSpan="8">
            <Alert color="failure">{error}</Alert>
          </td>
        </tr>
      )}
    </>
  );
}
