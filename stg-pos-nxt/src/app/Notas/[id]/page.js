"use client";
import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { getData } from "@/lib/helpers/getData";
import { useOnlineStatus } from "@/components/Contexts/OnlineContext";
import { Alert } from "flowbite-react";
import { AiOutlineBug } from "react-icons/ai";
import { TiendaContainer } from "@/components/Contexts/TiendaContext";
import NotaDesarrollo from "./NotaDesarrollo";
const QUERY = `
  query PosNota($idNota: String!, $online: Boolean!) {
    posNota(idNota: $idNota, online: $online) {
      _id
      ahorrado
      cliente
      clienteName
      cupon
      estatus
      fecha
      formadePago
      fecha
      numNota
      descuentoActivo
      products {
        _id
        alu
        id2
        modDesc
        colorTelaName
        talla
        precio
        mod
        cantidad
        subtotal
        colorDesc
        estatus
        liquidacion
        subtotalAhorro
      }
      saldo
      tipo
      total
      totalDescuento
      totalPiezas
      vendedora
      vendedoraName
    }
    listCuentasPOS(online: $online) {
      _id
      banco
      cuenta
    }
    listCuentasTransf(online: $online) {
      _id
      banco
      cuenta
    }
    listUsersPOS(online: $online) {
      _id
      profile {
        nombre
        apellido
      }
    }
  }
`;
export default function NotaSingle() {
  const { id } = useParams();
  const { isOnline } = useOnlineStatus();
  const [error, setError] = useState("");
  const [refetch, setRefetch] = useState(true);
  const [data, setData] = useState({});
  useEffect(() => {
    const getInfo = async () => {
      setError("");
      try {
        console.log("id", id);
        const data = await getData({
          query: QUERY,
          variables: { idNota: id, online: isOnline },
        });
        setData(data);
        setRefetch(false);
      } catch (error) {
        setError(error.message);
      }
    };
    getInfo();
  }, [id, refetch]);
  const nota = useMemo(() => data?.posNota, [data]);
  const cuentas = useMemo(
    () =>
      data?.listCuentasPOS?.map((val) => ({
        value: val._id,
        label: `${val.banco} ${val.cuenta}`,
      })) || [],
    [data]
  );
  const cuentasTransfer = useMemo(
    () =>
      data?.listCuentasTransf?.map((val) => ({
        value: val._id,
        label: `${val.banco} ${val.cuenta}`,
      })) || [],
    [data]
  );
  const empleados = useMemo(
    () =>
      data?.listUsersPOS?.map((val) => ({
        value: val._id,
        label: `${val.profile.nombre}`,
      })),
    [data]
  );
  return (
    <TiendaContainer>
      {{
        "En elaboracion": () => (
          <NotaDesarrollo
            numNota={id}
            setRefetch={setRefetch}
            nota={nota}
            cuentas={cuentas}
            cuentasTransfer={cuentasTransfer}
            empleados={empleados}
          />
        ),
      }[nota?.estatus]?.()}
      {error && (
        <Alert color="failure" icon={AiOutlineBug}>
          <span className="font-medium mr-2">Error!</span>
          {error}
        </Alert>
      )}
    </TiendaContainer>
  );
}
