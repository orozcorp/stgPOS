"use client";
import { format_money } from "@/lib/helpers/formatters";
import { useTiendaData } from "@/components/Contexts/TiendaContext";
import { useOnlineStatus } from "@/components/Contexts/OnlineContext";
import { postData } from "@/lib/helpers/getData";
import { Spinner, Button, Alert } from "flowbite-react";
import { useEffect, useState } from "react";
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
          idProduct: product.idProduct,
          cantidad: Number(cantidad),
          precio: Number(precio),
          cliente,
          cupon,
          type,
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
  return <tr></tr>;
}
