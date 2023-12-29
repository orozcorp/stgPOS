"use client";
import { useState, useEffect } from "react";
import ModalTemplate from "@/components/atoms/Modal";
import { Button, Alert } from "flowbite-react";
import { getData, postData } from "@/lib/helpers/getData";
import { v4 as uuidv4 } from "uuid";
import SearchableSelect from "@/components/atoms/SearchableSelect";
import InputSimple from "@/components/atoms/InputSimple";
import { useOnlineStatus } from "@/components/Contexts/OnlineContext";
const QUERY = `query ListCuentasBancarias($online: Boolean!) {
    listConceptos(online: $online) {
      _id
      concepto
    }
  }`;
const MUTATION = ` mutation TransaccionInsert($input: InputInsertTransaccion, $online: Boolean!) {
    transaccionInsert(input: $input, online: $online) {
      code
      message
      success
    }
  }`;
export default function CrearGasto({ display, setDisplay }) {
  const { isOnline } = useOnlineStatus();
  const [conceptos, setConceptos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const initial = {
    descripcion: "",
    fecha: 0,
    cantidad: 0,
    concepto: { value: "", label: "" },
  };
  const [form, setForm] = useState(initial);
  useEffect(() => {
    const getInfo = async () => {
      const data = await getData({
        query: QUERY,
        variables: { online: isOnline },
      });
      setConceptos(
        data?.listConceptos?.map((item) => ({
          value: item._id,
          label: item.concepto,
        })),
        []
      );
    };
    getInfo();
  }, []);
  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await postData({
        query: MUTATION,
        variables: {
          online: isOnline,
          input: {
            ...form,
            cantidad: parseFloat(form.cantidad),
            estatus: "Activo",
            capturista: "6415a35cef355a1fda342d8a",
            concepto: form.concepto.value,
            empresa: "Rockefeller",
            cuenta: "TgZNR2DHLXmzQsX5H",
            cuentaName: "EFECTIVO STG",
            _id: uuidv4(),
          },
        },
      });
      setLoading(false);
      setForm(initial);
    } catch (error) {
      console.log(error);
      setError(error.message);
      setLoading(false);
    }
  };
  return (
    <ModalTemplate
      display={display}
      setDisplay={setDisplay}
      title="Crear Gasto"
    >
      <form className="flex flex-col flex-nowrap gap-4" onSubmit={save}>
        <SearchableSelect
          label="Concepto"
          options={conceptos}
          value={form.concepto}
          onChange={(e) => setForm({ ...form, concepto: e })}
        />
        <InputSimple
          id="Descripcion"
          label="Descripcion"
          type="text"
          required
          value={form.descripcion}
          onChange={(e) =>
            setForm({
              ...form,
              descripcion: e.currentTarget.value.toUpperCase(),
            })
          }
        />
        <InputSimple
          id="Cantidad"
          label="Cantidad"
          type="number"
          step="0.01"
          required
          value={form.cantidad}
          onChange={(e) =>
            setForm({
              ...form,
              cantidad: e.currentTarget.value,
            })
          }
        />
        <Button
          type="submit"
          color="dark"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar"}
        </Button>
        {error && (
          <Alert color="failure" className="mt-4">
            {error}
          </Alert>
        )}
      </form>
    </ModalTemplate>
  );
}
