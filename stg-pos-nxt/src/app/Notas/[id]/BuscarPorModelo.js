"use client";
import { Spinner, Alert } from "flowbite-react";
import { useState, useMemo, useEffect } from "react";
import { colores, tallas } from "@/lib/helpers/options";
import { useTiendaData } from "@/components/Contexts/TiendaContext";
import { useOnlineStatus } from "@/components/Contexts/OnlineContext";
import { getData, postData } from "@/lib/helpers/getData";
import ModeloABuscarPOS from "./ModeloABuscarPOS";
import SearchableSelect from "@/components/atoms/SearchableSelect";
import Image from "next/image";
const QUERY = `query PosModeloTelaSearch($modelo: String, $online: Boolean!) {
    posModeloTelaSearch(modelo: $modelo, online: $online) {
      colorTela
      colorTelaName
      colores {
        color
        colorBase
        colorFoto
        colorName
        id2
      }
    }
  }

`;
const MUTATION = `  mutation PosSalesInsertModeloBusqueda(
    $idNota: String!
    $input: InsertFromBusquedaPOS!
    $cliente: String!
    $cupon: Boolean
    $online: Boolean!
  ) {
    posSalesInsertModeloBusqueda(
      idNota: $idNota
      input: $input
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

export default function BuscarPorModelo({
  numNota,
  setRefetch,
  cliente,
  cupon,
  setBuscarModelo,
}) {
  const initial = {
    modelo: null,
    modelType: null,
    alu: null,
    mod: null,
    codigoSat: null,
    tela: { value: null, label: "Selecciona tela" },
    colBase: { value: null, label: "Selecciona color" },
    talla: { value: null, label: "Selecciona Talla" },
    colorFoto: null,
    id2: null,
    color: null,
    colorDesc: null,
  };
  const { isOnline } = useOnlineStatus();
  const { lt } = useTiendaData();
  const { setLoadingTienda } = lt;
  const [loading, setLoading] = useState(false);
  const [searchObjects, setSearchObjects] = useState(initial);
  const [telaSearch, setTelaSearch] = useState([]);
  useEffect(() => {
    if (!searchObjects.modelo) {
      setTelaSearch([]);
    }
    const getInformation = async () => {
      const variables = {
        modelo: searchObjects.modelo,
        online: isOnline,
      };

      const data = await getData({ query: QUERY, variables });
      console.log(data);
      setTelaSearch(data?.posModeloTelaSearch || []);
    };
    getInformation();
  }, [searchObjects.modelo]);
  const telas = useMemo(
    () =>
      telaSearch?.map((tela) => ({
        value: tela.colorTela,
        label: tela.colorTelaName,
      })) || [],
    [telaSearch]
  );
  const telaSelected = useMemo(
    () =>
      (telaSearch &&
        searchObjects.tela &&
        telaSearch.filter(
          (val) => val?.colorTela === searchObjects.tela.value
        )) ||
      [],
    [telaSearch, searchObjects.colTela]
  );
  const [error, setError] = useState("");
  const coloresDisponibles = useMemo(
    () =>
      (telaSelected &&
        telaSelected[0] &&
        searchObjects.colBase.value &&
        telaSelected[0].colores.filter(
          (val) => val?.colorBase === searchObjects.colBase.value
        )) ||
      [],
    [telaSelected, searchObjects.colBase]
  );
  const insertModelo = async ({ variables }) => {
    setLoading(true);
    setLoadingTienda(true);
    setError("");
    try {
      const { tela, colBase, talla, ...rest } = variables.input;
      const data = await postData({
        query: MUTATION,
        variables: {
          ...variables,
          input: {
            ...rest,
            colTela: tela.value,
            colorTelaName: tela.label,
            colBase: colBase.value,
            talla: talla.value,
          },
        },
      });
      setLoading(false);
      setLoadingTienda(false);
      setRefetch(true);
      setBuscarModelo(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setLoadingTienda(false);
      setError(error.message);
    }
  };
  return (
    <div className="flex flex-row flex-wrap justify-start items-start gap-4">
      <ModeloABuscarPOS
        searchObjects={searchObjects}
        setSearchObjects={setSearchObjects}
      />
      <SearchableSelect
        options={tallas}
        required
        label="Selecciona Talla"
        value={searchObjects.talla}
        onChange={(e) => {
          setSearchObjects({ ...searchObjects, talla: e });
        }}
      />
      {loading && <Spinner />}
      {telas && (
        <>
          <SearchableSelect
            options={telas}
            value={searchObjects.tela}
            onChange={(e) => setSearchObjects({ ...searchObjects, tela: e })}
            label="Selecciona Tela"
          />
          {searchObjects.tela.value && (
            <>
              <SearchableSelect
                options={colores}
                label="Selecciona Color Base"
                value={searchObjects.colBase}
                onChange={(e) => {
                  setSearchObjects({ ...searchObjects, colBase: e });
                }}
              />
              {coloresDisponibles && coloresDisponibles.length > 0 && (
                <>
                  <div className="flex flex-col flex-nowrap">
                    <small className="font-bold">Selecciona color</small>
                    <div className="flex flex-col flex-nowrap gap-2">
                      {coloresDisponibles.map((val) => (
                        <div
                          key={val?.color}
                          className="flex flex-row flex-wrap justify-between items-center border min-w-60 hover:bg-color-zinc-400 gap-2 p-2 rounded-md cursor-pointer"
                          onClick={() => {
                            setSearchObjects({
                              ...searchObjects,
                              colorFoto: val?.colorFoto,
                              color: val?.color,
                              colorDesc: val?.colorName,
                              id2: val?.id2,
                            });
                            setLoadingTienda(true);
                            insertModelo({
                              variables: {
                                input: {
                                  ...searchObjects,
                                  colorFoto: val?.colorFoto,
                                  color: val?.color,
                                  colorDesc: val?.colorName,
                                  id2: val?.id2,
                                },
                                idNota: numNota,
                                cliente,
                                cupon,
                                online: isOnline,
                              },
                            });
                          }}
                        >
                          <div>{val?.colorName}</div>
                          {val?.colorFoto && (
                            <Image
                              src={val?.colorFoto}
                              alt={val?.colorName}
                              width={50}
                              height={50}
                              style={{ borderRadius: "999px" }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
      {error && <Alert color="failure">{error}</Alert>}
    </div>
  );
}
