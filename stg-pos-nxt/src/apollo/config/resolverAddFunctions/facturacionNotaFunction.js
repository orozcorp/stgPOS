import Facturapi from "facturapi";
import { GraphQLError } from "graphql";
const paymentForms = [
  { value: "03", label: "Transferencia" },
  { value: "04", label: "Tarjeta de credito" },
  { value: "28", label: "Tarjeta de debito" },
];
export const getKey = (empresa, pdf_custom_section) => {
  let key = null;
  switch (empresa) {
    case "Ormen":
      key = new Facturapi(process.env.FACTURAPI_ORMEN, {
        apiVersion: "v2",
      });
      pdf_custom_section = pdf_custom_section
        ? pdf_custom_section.concat(
            "<p><h3>DATOS BANCARIOS:</h3> </p> <p> BANCO: CITI BANAMEX </p>  <p>CLABE: 0021 8070 1345 4587 70 </p>"
          )
        : "<p><h3>DATOS BANCARIOS:</h3> </p> <p> BANCO: CITI BANAMEX </p> <p>CLABE: 0021 8070 1345 4587 70 </p>";
      break;
    case "Lalito":
      key = new Facturapi(process.env.FACTURAPI_LALITO, {
        apiVersion: "v2",
      });
      pdf_custom_section = pdf_custom_section
        ? pdf_custom_section.concat(
            "<p><h3>DATOS BANCARIOS:</h3> </p><p> BANCO: INBURSA <p>  CLABE: 0361 8050 0673 9039 44</p>"
          )
        : "<p><h3>DATOS BANCARIOS:</h3> </p><p> BANCO: INBURSA <p>  CLABE: 0361 8050 0673 9039 44</p>";
      break;
    case "Brandon":
      key = new Facturapi(process.env.FACTURAPI_BRANDON, {
        apiVersion: "v2",
      });
      pdf_custom_section = pdf_custom_section
        ? pdf_custom_section.concat(
            "<p><h3>DATOS BANCARIOS:</h3> </p><p> BANCO: CITI BANAMEX <p>   CLABE: 0021 8070 1270 1533 15</p>"
          )
        : "<p><h3>DATOS BANCARIOS:</h3> </p><p> BANCO: CITI BANAMEX<p>   CLABE: 0021 8070 1270 1533 15</p>";
      break;
    case "Margarita":
      key = new Facturapi(process.env.FACTURAPI_MARGARITA, {
        apiVersion: "v2",
      });
      pdf_custom_section = pdf_custom_section
        ? pdf_custom_section.concat(
            "<p><h3>DATOS BANCARIOS:</h3> </p><p> BANCO: SCOTIABANK <p>  CLABE: 0441 8025 6008 0421 14</p>"
          )
        : "<p><h3>DATOS BANCARIOS:</h3> </p><p> BANCO: SCOTIABANK <p>  CLABE: 0441 8025 6008 0421 14</p>";
      break;
  }
  return { key, pdf_custom_section };
};
export async function facturarNota({ input, db }) {
  try {
    // Retrieve cuenta and empresa
    const cuenta = await db
      .collection("cuentasBancarias")
      .findOne({ _id: input.cuenta }, { projection: { propietario: 1 } });
    const empresa = cuenta?.propietario;

    // Get key and pdf_custom_section
    const { key, pdf_custom_section } = getKey(empresa, null);

    // Aggregate POS sales
    const POS = await db
      .collection("POSsales")
      .aggregate([
        { $match: { _id: input.clpv } },
        { $unwind: "$products" },
        {
          $project: {
            tipo: "$products.modelType",
            precio: "$products.precio",
            cantidad: "$products.cantidad",
            subtotal: "$products.subtotal",
            codigoSat: "$products.codigoSat",
          },
        },
        {
          $group: {
            _id: { tipo: "$tipo", codigoSat: "$codigoSat", precio: "$precio" },
            cantidad: { $sum: "$cantidad" },
            subtotal: { $sum: "$subtotal" },
          },
        },
      ])
      .toArray();

    // Retrieve posCupon
    const posCupon = await db
      .collection("POSsales")
      .findOne({ _id: input.clpv }, { projection: { cupon: 1 } });

    // Retrieve customer
    let cliente;
    switch (empresa) {
      case "Brandon":
        cliente = "5e31d5a2b5bbcf6bdc0f625e";
        break;
      case "Lalito":
        cliente = "5e3460f5a8abb316966b6782";
        break;
      case "Ormen":
        cliente = "619fc2814ab802001bd6e7b2";
        break;
      default:
        cliente = "611d60e6cbf2c9001ba32591";
    }
    // Prepare datosFacturacion
    const datosFacturacion = {
      customer: cliente,
      payment_method: "PUE",
      use: "S01",
      series: "VL",
      payment_form: paymentForms.find((el) => el.label === input.tipoPago)
        ?.value,
    };

    // Process products
    const products = POS.map((val) => ({
      product: {
        description: val?._id.tipo,
        product_key: val?._id.codigoSat,
        price: Number(val?._id.precio),
        tax_included: true,
        unit_key: "H87",
        unit_name: "Pieza",
        taxes: [
          { type: "IVA", rate: empresa === "Ormen" ? 0.16 : 0, factor: "Tasa" },
        ],
      },
      quantity: Number(val?.cantidad),
    }));

    // Apply cupon discount
    if (posCupon?.cupon && products.length > 0) {
      products[0].product.price = Math.max(0, products[0].product.price - 20);
    }

    datosFacturacion.items = products;

    // Create invoice
    const invoice = await key.invoices.create({
      ...datosFacturacion,
      pdf_custom_section,
    });

    // Update POS sales and send email
    if (invoice?.uuid) {
      await db.collection("POSsales").updateOne(
        { _id: input.clpv },
        {
          $set: {
            factura: {
              facturador: empresa,
              idFacturapi: invoice.id,
              factura: invoice.uuid,
              folio_number: invoice.folio_number,
              series: invoice.series,
            },
            facturar: false,
          },
        }
      );
      await key.invoices.sendByEmail(invoice.id, {
        email: "ventasgob@sterlingplasma.com",
      });
      return "DONE";
    }
  } catch (err) {
    console.error(err);
  }
}
export async function contarArticulosNota(idNota, cliente, db) {
  const totPiezas = await db
    .collection("POSsales")
    .aggregate([
      { $match: { _id: idNota } },
      { $unwind: "$products" },
      { $project: { cantidad: "$products.cantidad" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$cantidad" },
        },
      },
    ])
    .toArray();
  // Ajustar precio de acuerdo a piezas
  const totalPiezas = totPiezas[0]?.total || 0;
  let tipoVenta = "precio";
  if (2 < totalPiezas && totalPiezas <= 5) {
    tipoVenta = "precioMayoreo";
  }
  if (totalPiezas >= 6) {
    tipoVenta = "precioDist";
  }
  if (tipoVenta === "precio" && cliente !== "Venta al Publico") {
    tipoVenta = "precioMayoreo";
  }
  return tipoVenta;
}
export async function calcularTotales(nota, tipoVenta, cupon, db) {
  try {
    //Sacar precio  de productos
    const pipeline = [
      { $match: { _id: nota } },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "Modelos",
          let: {
            id: "$products.modelo",
            tela: "$products.colTela",
            colorBase: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$products.colBase", "Estampado"] },
                    then: "Estampado",
                  },
                  {
                    case: { $eq: ["$products.colBase", "Estampado Digital"] },
                    then: "Estampado Digital",
                  },
                ],
                default: "LISO",
              },
            },
          },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$_id", "$$id"] }] } } },
            {
              $project: {
                precios: 1,
              },
            },
            { $unwind: "$precios" },
            {
              $project: {
                tela: "$precios.tela",
                colorBase: "$precios.base",
                precio: "$precios.precio",
                precioDist: "$precios.precioDist",
                precioMayoreo: "$precios.precioMayoreo",
              },
            },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$colorBase", "$$colorBase"] },
                    { $eq: ["$tela", "$$tela"] },
                  ],
                },
              },
            },
            {
              $project: {
                precio: "$precio",
                precioDist: "$precioDist",
                precioMayoreo: "$precioMayoreo",
              },
            },
          ],
          as: "precio",
        },
      },
      {
        $project: {
          _id: "$products._id",
          cantidad: "$products.cantidad",
          precioCambiado: "$products.precioCambiado",
          precioAnterior: "$products.precio",
          precioMenudeo: "$products.precioBase",
          precio: { $arrayElemAt: ["$precio.precio", 0] },
          precioDist: { $arrayElemAt: ["$precio.precioDist", 0] },
          precioMayoreo: { $arrayElemAt: ["$precio.precioMayoreo", 0] },
        },
      },
    ];

    const POSAgg = await db
      .collection("POSsales")
      .aggregate(pipeline)
      .toArray();
    // Actualizar precios de productos en notas
    const bulkOperations = POSAgg.map((val) => {
      const priceF = val?.precioCambiado ? val?.precioAnterior : val[tipoVenta];
      const subAhorrado = (val?.precioMenudeo - priceF) * val?.cantidad;
      const sub = priceF * val?.cantidad;
      return {
        updateOne: {
          filter: {
            _id: nota,
            products: { $elemMatch: { _id: val?._id } },
          },
          update: {
            $set: {
              "products.$.precio": priceF,
              "products.$.subtotal": sub,
              "products.$.subtotalAhorro": subAhorrado,
            },
          },
        },
      };
    });
    if (bulkOperations.length > 0 && bulkOperations[0] && bulkOperations) {
      const bulkResult = await db
        .collection("POSsales")
        .bulkWrite(bulkOperations);
    }
    //Actualizar totales
    const finalAgg = await db
      .collection("POSsales")
      .aggregate([
        { $match: { _id: nota } },
        { $unwind: "$products" },
        {
          $group: {
            _id: null,
            tot: { $sum: "$products.subtotal" },
            ahorrado: { $sum: "$products.subtotalAhorro" },
            totalPiezas: { $sum: "$products.cantidad" },
          },
        },
      ])
      .toArray();
    const hayFinalAgg = finalAgg[0] && finalAgg.length > 0 && finalAgg;
    const cuponValor = cupon ? 20 : 0;
    const tot = hayFinalAgg ? finalAgg[0]?.tot - cuponValor : 0;
    const totA = hayFinalAgg ? finalAgg[0]?.ahorrado + cuponValor : 0;
    return await db.collection("POSsales").updateOne(
      { _id: nota },
      {
        $set: {
          saldo: tot || 0,
          total: tot || 0,
          ahorrado: totA || 0,
          totalPiezas: finalAgg[0]?.totalPiezas || 0,
        },
      }
    );
  } catch (error) {
    throw new GraphQLError("Error al actualizar precio", {
      extensions: {
        code: 200,
        success: false,
        message: "Error al actualizar precio",
      },
    });
  }
}
export async function productosDescuentos(nota, db) {
  const POSAgg = await db
    .collection("POSsales")
    .aggregate([
      {
        $match: {
          _id: nota,
        },
      },
      { $unwind: "$products" },
      {
        $match: {
          "products.estatus": "Esperando Descuento",
        },
      },
      {
        $project: {
          descuentos: "$products.estatus",
        },
      },
      {
        $group: {
          _id: null,
          descuentos: { $sum: 1 },
        },
      },
    ])
    .toArray();
  if (POSAgg && POSAgg[0] && POSAgg.length > 0) {
    return "done";
  } else {
    try {
      await db.collection("POSsales").updateOne(
        { _id: nota },
        {
          $set: {
            descuentoActivo: false,
          },
        }
      );
      return "done";
    } catch (error) {
      console.log(error);
      return {
        code: error.extensions.response.status,
        success: false,
        message: error.extensions.response.body,
      };
    }
  }
}
