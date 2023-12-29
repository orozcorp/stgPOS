"use client";
import { useState, useEffect } from "react";
import { Table, Alert, Spinner, Button, Datepicker } from "flowbite-react";
import moment from "moment";
import { FaTimes, FaEye } from "react-icons/fa";
import Link from "next/link";
import { getData, postData } from "@/lib/helpers/getData";
import { useOnlineStatus } from "@/components/Contexts/OnlineContext";
import { format_dateHr, format_money } from "@/lib/helpers/formatters";
import InputFechaSimple from "@/components/atoms/InputFechaSimple";
const MUTATION = `
  mutation PosSalesCancelNota($idNota: String!) {
    posSalesCancelNota(idNota: $idNota) {
      code
      message
      success
    }
  }
`;
const QUERY = `
  query PosHistorial(
    $fechaInicio: Date!
    $fechaFinal: Date!
    $modelo: String!
    $cliente: String!
    $online: Boolean!
  ) {
    posHistorial(
      fechaInicio: $fechaInicio
      fechaFinal: $fechaFinal
      modelo: $modelo
      cliente: $cliente
      online: $online
    ) {
      _id
      estatus
      cliente
      clienteName
      fecha
      numNota
      saldo
      total
      vendedoraName
    }
  }
`;

function getCellClassName(estatus) {
  return estatus === "Pagada" ? "bg-white" : "bg-red-300";
}

export default function Notas() {
  const { isOnline } = useOnlineStatus();
  const [refetch, setRefetch] = useState(true);
  const initial = {
    fechaInicio: moment().startOf("day").toDate(),
    fechaFinal: moment().endOf("day").toDate(),
    modelo: "",
    cliente: { name: "", _id: "" },
  };
  const [toSearch, setToSearch] = useState(initial);
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const getNotas = async () => {
      setLoading(true);
      try {
        const data = await getData({
          query: QUERY,
          variables: {
            ...toSearch,
            cliente: toSearch.cliente._id,
            online: isOnline,
          },
        });
        setNotas(data.posHistorial);
        setLoading(false);
        setRefetch(false);
      } catch (error) {
        console.log(error);
        setError(error.message);
      }
    };
    getNotas();
  }, [toSearch, refetch]);
  const removeNota = async (idNota) => {
    setError("");
    setLoadingDelete(true);
    try {
      const data = await postData({
        query: MUTATION,
        variables: { idNota },
      });
      setRefetch(true);
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoadingDelete(false);
    }
  };
  return (
    <>
      <h1 className="text-2xl font-bold"> Historial de notas</h1>
      <div className="flex flex-row flex-wrap justify-start items-start gap-4">
        <InputFechaSimple
          value={toSearch.fechaInicio}
          label="Fecha Inicial"
          onChange={(e) => {
            setToSearch({
              ...toSearch,
              fechaInicio: moment(e.target.value).startOf("day").toDate(),
            });
          }}
        />
        <InputFechaSimple
          value={toSearch.fechaFinal}
          label="Fecha Final"
          onChange={(e) => {
            setToSearch({
              ...toSearch,
              fechaFinal: moment(e.target.value).endOf("day").toDate(),
            });
          }}
        />
      </div>
      <div className="overflow-x-auto my-8">
        {loading ? (
          <Spinner />
        ) : (
          <Table striped>
            <Table.Head>
              <Table.HeadCell className="bg-zinc-800 text-white">
                # Nota
              </Table.HeadCell>
              <Table.HeadCell className="bg-zinc-800 text-white w-20">
                Fecha
              </Table.HeadCell>
              <Table.HeadCell className="bg-zinc-800 text-white">
                Cliente
              </Table.HeadCell>
              <Table.HeadCell className="bg-zinc-800 text-white">
                Vendedora
              </Table.HeadCell>
              <Table.HeadCell className="bg-zinc-800 text-white">
                Estatus
              </Table.HeadCell>
              <Table.HeadCell className="bg-zinc-800 text-white">
                Total
              </Table.HeadCell>
              <Table.HeadCell className="bg-zinc-800 text-white">
                Saldo
              </Table.HeadCell>
              <Table.HeadCell className="bg-zinc-800 text-white">
                Ver
              </Table.HeadCell>
              <Table.HeadCell className="bg-zinc-800 text-white">
                Borrar
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {notas.map((nota) => (
                <Table.Row key={nota._id}>
                  <Table.Cell className={getCellClassName(nota.estatus)}>
                    {nota.numNota}
                  </Table.Cell>
                  <Table.Cell
                    className={`${getCellClassName(nota.estatus)} w-20`}
                  >
                    {format_dateHr(nota.fecha)}
                  </Table.Cell>
                  <Table.Cell className={getCellClassName(nota.estatus)}>
                    {nota.clienteName}
                  </Table.Cell>
                  <Table.Cell className={getCellClassName(nota.estatus)}>
                    {nota.vendedoraName}
                  </Table.Cell>
                  <Table.Cell className={getCellClassName(nota.estatus)}>
                    {nota.estatus}
                  </Table.Cell>
                  <Table.Cell className={getCellClassName(nota.estatus)}>
                    {format_money(nota.total)}
                  </Table.Cell>
                  <Table.Cell className={getCellClassName(nota.estatus)}>
                    {format_money(nota.saldo)}
                  </Table.Cell>
                  <Table.Cell className={getCellClassName(nota.estatus)}>
                    <Link href={`/Notas/${nota._id}`}>
                      <FaEye />
                    </Link>
                  </Table.Cell>
                  <Table.Cell className={getCellClassName(nota.estatus)}>
                    <Button
                      onClick={() => removeNota(nota._id)}
                      color="failure"
                      disabled={loadingDelete}
                    >
                      {loadingDelete ? <Spinner /> : <FaTimes />}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
      {error && <Alert danger>{error}</Alert>}
    </>
  );
}
