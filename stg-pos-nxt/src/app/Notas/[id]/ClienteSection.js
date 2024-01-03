"use client";
import { useOnlineStatus } from "@/components/Contexts/OnlineContext";
import { useEffect, useState } from "react";
import { Alert, Button } from "flowbite-react";
import { AiOutlineClose } from "react-icons/ai";
import SearchableSelectQueryVariable from "@/components/atoms/SearchableSelectQueryVariable";

const MUTATION = `mutation PosSalesUpdateClient(
    $token: String!
    $instance: String!
    $idNota: String!
    $cliente: String!
    $clienteName: String!
    $online: Boolean!
  ) {
    posSalesUpdateClient(
      token: $token
      instance: $instance
      idNota: $idNota
      cliente: $cliente
      clienteName: $clienteName
      online: $online
    ) {
      code
      message
      success
      data
    }
  }`;

export default function ClienteSection({
  numNota,
  clienteName,
  cliente,
  setRefetch,
}) {
  const { isOnline } = useOnlineStatus();
  const token = process.env.NEXT_PUBLIC_WA_TOKEN_ID;
  const instance = process.env.NEXT_PUBLIC_WA_INSTANCE;
  const [searchObjects, setSearchObjects] = useState({
    label: clienteName,
    value: cliente,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [displayActualizar, setDisplayActualizar] = useState("none");
  const updateCliente = async ({ variables }) => {
    setLoading(true);
    setError("");
    try {
      const data = await postData({
        query: MUTATION,
        variables,
      });
      setRefetch(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };
  useEffect(() => {
    if (!clienteName) return;
    const variables = {
      token,
      instance,
      idNota: numNota,
      cliente: searchObjects.value,
      clienteName: searchObjects.label,
      online: isOnline,
    };
    updateCliente({ variables });
  }, [searchObjects]);
  return (
    <div className="flex flex-row flex-wrap gap-2 justify-between items-start">
      {clienteName !== "Venta al Publico" ? (
        <div className="flex flex-row flex-wrap gap-2">
          <div>{clienteName}</div>
          <Button
            color="failure"
            onClick={() => {
              updateCliente({
                variables: {
                  token,
                  instance,
                  idNota: numNota,
                  cliente: "Venta al Publico",
                  clienteName: "Venta al Publico",
                },
              });
            }}
          >
            <AiOutlineClose />
          </Button>
        </div>
      ) : (
        <>
          <SearchableSelectQueryVariable
            value={searchObjects}
            onChange={(e) => setSearchObjects(e)}
            title="Cliente"
            query={`query ClienteSearch($cliente: String!, $online: Boolean!) {
              clienteSearch(cliente: $cliente, online: $online) {
                _id
                razonSocial
              }
            }
            `}
            queryName="clienteSearch"
            variable="cliente"
            labelOptions="razonSocial"
          />
        </>
      )}
    </div>
  );
}
