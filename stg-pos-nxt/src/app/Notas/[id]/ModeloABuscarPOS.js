"use client";
import { useOnlineStatus } from "@/components/Contexts/OnlineContext";
import InputSimple from "@/components/atoms/InputSimple";
import { postData } from "@/lib/helpers/getData";
import { useState } from "react";
const MUTATION = ` mutation Mutation($modelo: String!, $online: Boolean!) {
    modelosSearch(modelo: $modelo, online: $online) {
      _id
      alu
      modelo
      descripcion
      tipoName
      codigoSat
    }
  }`;
export default function ModeloABuscarPOS({ searchObjects, setSearchObjects }) {
  const [modelsList, setModelsList] = useState([]);
  const [modeloABuscar, setModeloABuscar] = useState("");
  const { isOnline } = useOnlineStatus();
  const modeloSearch = async (e) => {
    const model2Search = e.target.value.toUpperCase();
    setModeloABuscar(model2Search);
    if (model2Search === "") setModelsList([]);
    try {
      const data = await postData({
        query: MUTATION,
        variables: {
          modelo: model2Search,
          online: isOnline,
        },
      });
      setModelsList(data.modelosSearch || []);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="flex-1 m-2">
      <InputSimple
        id="Modelo"
        label="Modelo"
        type="text"
        required
        value={modeloABuscar}
        onChange={modeloSearch}
      />
      <div className="flex flex-col flex-nowrap">
        {modelsList.map((val) => (
          <div
            className="p-2 m-2 border rounded hover:bg-zinc-300"
            key={val?._id}
            onClick={() => {
              setModeloABuscar(val.modelo);
              setSearchObjects({
                ...searchObjects,
                modelo: val?._id,
                modelType: val?.tipoName,
                alu: val?.alu,
                mod: val?.modelo,
                codigoSat: val?.codigoSat,
              });
              setModelsList([]);
            }}
          >
            <div>
              <small>{val?.alu}</small>
              {`${val?.modelo} - ${val?.descripcion}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
