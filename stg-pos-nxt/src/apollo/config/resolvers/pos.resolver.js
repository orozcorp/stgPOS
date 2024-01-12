import { find, sumBy } from "lodash";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { GraphQLError } from "graphql";
import {
  calcularTotales,
  contarArticulosNota,
  productosDescuentos,
  facturarNota,
} from "../resolverAddFunctions/facturacionNotaFunction";
import { checkValidPhones, enviarMensaje } from "@/apollo/Functions/Chats";
export const pos = {
  Query: {
    posSalesCierreDelDia: async (
      root,
      { fi, ff, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      const fiU = moment(fi).unix();
      const ffU = moment(ff).unix();
      const totElabPromise = db
        .collection("POSsales")
        .aggregate([
          {
            $match: {
              fecha: { $gte: new Date(fi), $lte: new Date(ff) },
              estatus: "En elaboracion",
              total: { $gt: 0 },
            },
          },
          {
            $group: {
              _id: null,
              cantidad: { $sum: 1 },
              total: { $sum: "$total" },
            },
          },
        ])
        .toArray();
      const totalSalesPromise = db
        .collection("transaccion")
        .aggregate([
          {
            $match: {
              fecha: { $gte: fiU, $lte: ffU },
              concepto: { $in: ["Venta Tienda", "Pago Tienda Credito"] },
              estatus: "Activo",
            },
          },
          {
            $project: {
              cta: "$cuentaName",
              cantidad: 1,
            },
          },
          {
            $group: {
              _id: "$cta",
              cantidad: { $sum: "$cantidad" },
            },
          },
        ])
        .toArray();
      const comisionesPromise = db
        .collection("POSsales")
        .aggregate([
          {
            $match: {
              fecha: { $gte: new Date(fi), $lte: new Date(ff) },
              estatus: {
                $nin: ["En elaboracion", "Cancelada", "Perdonada", "Credito"],
              },
            },
          },
          {
            $project: {
              vendedora: "$vendedoraName",
              totalPiezas: 1,
            },
          },
          {
            $group: {
              _id: "$vendedora",
              cantidad: { $sum: "$totalPiezas" },
            },
          },
          { $match: { _id: { $ne: null } } },
        ])
        .toArray();
      const pagosClientesPromise = db
        .collection("transaccion")
        .aggregate([
          {
            $match: {
              fecha: { $gte: moment(fi).unix(), $lte: moment(ff).unix() },
              concepto: "Pago Tienda Credito",
              cantidad: { $gte: 0 },
            },
          },
          {
            $project: {
              descripcion: 1,
              cantidad: 1,
              cuenta: "$cuentaName",
            },
          },
          {
            $group: {
              _id: { descripcion: "$descripcion", cuenta: "$cuenta" },
              cantidad: { $sum: "$cantidad" },
            },
          },
          {
            $project: {
              _id: "$_id.descripcion",
              cuenta: "$_id.cuenta",
              cantidad: 1,
            },
          },
        ])
        .toArray();

      const transPromise = db
        .collection("transaccion")
        .aggregate([
          {
            $match: {
              fecha: { $gte: moment(fi).unix(), $lte: moment(ff).unix() },
              cuenta: "TgZNR2DHLXmzQsX5H",
              concepto: {
                $nin: ["TRASPASOS", "Venta de tienda", "Venta Tienda"],
              },
              estatus: "Activo",
            },
          },
          {
            $project: {
              descripcion: 1,
              cantidad: 1,
            },
          },
        ])
        .toArray();
      const [TotElab, TotalSales, comisiones, pagosClientes, trans] =
        await Promise.all([
          totElabPromise,
          totalSalesPromise,
          comisionesPromise,
          pagosClientesPromise,
          transPromise,
        ]);

      return {
        transacciones: trans,
        pagosClientes: pagosClientes,
        comisiones: comisiones,
        totalVentas: TotalSales,
        totElab: TotElab,
      };
    },
    posHistorial: async (
      root,
      { fechaInicio, fechaFinal, modelo, cliente, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      const sales = await db
        .collection("POSsales")
        .find({
          fecha: {
            $gte: new Date(fechaInicio),
            $lte: new Date(fechaFinal),
          },
          cliente: cliente !== "" ? cliente : { $ne: null },
          "products.modelo": modelo !== "" ? modelo : { $ne: null },
        })
        .toArray();
      return sales;
    },
    posClientesDeuda: async (root, { online }, { dbOnline, dbOffline }) => {
      const db = online ? dbOnline : dbOffline;
      const posAgg = await db
        .collection("POSsales")
        .aggregate([
          {
            $match: {
              estatus: "Credito",
              saldo: { $gt: 0 },
              clienteName: { $exists: true },
            },
          },
          {
            $group: {
              _id: {
                cliente: "$cliente",
                clienteName: "$clienteName",
              },
              saldo: { $sum: "$saldo" },
            },
          },
          {
            $project: {
              _id: 0,
              value: "$_id.cliente",
              label: {
                $concat: ["$_id.clienteName", " $", { $toString: "$saldo" }],
              },
            },
          },
          {
            $sort: {
              label: 1,
            },
          },
        ])
        .toArray();
      return posAgg;
    },
    posDevolucionCliente: async (
      root,
      { idCliente, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      return await db
        .collection("POSsales")
        .find({
          estatus: "Credito",
          saldo: { $gt: 0 },
          cliente: idCliente,
        })
        .toArray();
    },
    posNota: async (root, { idNota, online }, { dbOnline, dbOffline }) => {
      const db = online ? dbOnline : dbOffline;
      const result = await db.collection("POSsales").findOne({ _id: idNota });
      if (result && result.products) {
        result.products.sort(
          (a, b) => new Date(b.fechaIns) - new Date(a.fechaIns)
        );
      }
      return result;
    },
    posModeloTelaSearch: async (
      root,
      { modelo, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      const allTelas = await db
        .collection("ModeloCorte2020")
        .aggregate([
          { $match: { modelo } },
          { $unwind: "$colores" },
          {
            $group: {
              _id: {
                colorTela: "$colores.tela",
                colorTelaName: "$colores.telaName",
              },
              colores: {
                $addToSet: {
                  id2: "$colores.id2",
                  color: "$colores.color",
                  colorName: "$colores.colorName",
                  colorBase: "$colores.colorBase",
                  colorFoto: "$colores.colorFoto",
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              colorTela: "$_id.colorTela",
              colorTelaName: "$_id.colorTelaName",
              colores: 1,
            },
          },
          { $sort: { colorTelaName: 1 } },
        ])
        .toArray();
      return allTelas;
    },
    posCambioDePrecio: async (root, { online }, { dbOnline, dbOffline }) => {
      const db = online ? dbOnline : dbOffline;
      const cambiosDePrecios = await db
        .collection("POSsales")
        .aggregate([
          {
            $match: {
              descuentoActivo: true,
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
              nota: "$numNota",
              cliente: "$cliente",
              cupon: "$cupon",
              idModelo: "$products._id",
              modelo: "$products.mod",
              tela: "$products.colorTelaName",
              color: "$products.colorDesc",
              precioAnterior: "$products.precio",
              precioNuevo: "$products.discountAsk",
              cantidad: "$products.cantidad",
            },
          },
        ])
        .toArray();
      return cambiosDePrecios;
    },
  },
  Mutation: {
    posSalesCancelNota: async (
      root,
      { idNota, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      try {
        const tran = await db
          .collection("transaccion")
          .findOne({ clpv: idNota });
        if (tran) {
          const updateTrans = db
            .collection("transaccion")
            .updateOne(
              { clpv: idNota },
              { $set: { estatus: "Cancelado", cantidad: 0 } }
            );
          const updateBank = db
            .collection("cuentasBancarias")
            .updateOne(
              { _id: tran.cuenta },
              { $inc: { saldo: tran.cantidad * -1 } }
            );
          await Promise.all([updateTrans, updateBank]);

          const allProds = await db
            .collection("POSsales")
            .findOne({ _id: idNota }, { fields: { products: 1 } });

          const inventoryUpdates = allProds.products.map((val) => ({
            updateOne: {
              filter: {
                $and: [
                  { modelo: val?.modelo },
                  { talla: val?.talla },
                  { color: val?.color },
                ],
              },
              update: {
                $inc: {
                  cantidadBodega: val?.cantidad,
                },
              },
            },
          }));
          await db.collection("Inventory").bulkWrite(inventoryUpdates);
        }
        const updatePOS = await db.collection("POSsales").updateOne(
          { _id: idNota },
          {
            $set: {
              estatus: "Cancelada",
              formadePago: "Cancelada",
              saldo: 0,
              total: 0,
            },
          }
        );
        return {
          code: 200,
          success: true,
          message: `Se cancelo `,
        };
      } catch (error) {
        console.log(error);
        return {
          code: error.extensions?.response?.status || 500,
          success: false,
          message: error.extensions?.response?.body || error.message,
        };
      }
    },
    posSalesDevolucion: async (
      root,
      { idNota, products, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      try {
        const total = sumBy(products, "subtotal") * -1;
        const posSalesUpdates = [];
        const inventoryUpdates = [];
        for (const val of products) {
          posSalesUpdates.push({
            updateOne: {
              filter: {
                _id: idNota,
                products: { $elemMatch: { _id: val?._id } },
              },
              update: {
                $inc: {
                  "products.$.cantidad": val?.cantidad * -1,
                  "products.$.subtotal": val?.subtotal * -1,
                },
              },
            },
          });

          inventoryUpdates.push({
            updateOne: {
              filter: {
                modeloId: val?.modelo,
                colorId: val?.color,
                talla: val?.talla,
              },
              update: { $inc: { cantidadBodega: val?.cantidad * -1 } },
            },
          });
        }
        const bulkPosSalesPromise = db
          .collection("POSsales")
          .bulkWrite(posSalesUpdates);
        const bulkInventoryPromise = db
          .collection("Inventario")
          .bulkWrite(inventoryUpdates);
        await Promise.all([bulkPosSalesPromise, bulkInventoryPromise]);
        const update = await db
          .collection("POSsales")
          .updateOne({ _id: idNota }, { $inc: { total: total, saldo: total } });
        return {
          code: 200,
          success: true,
          message: `Se cancelo `,
        };
      } catch (error) {
        console.log(error);
        return {
          code: error.extensions?.response?.status || 500,
          success: false,
          message: error.extensions?.response?.body || error.message,
        };
      }
    },
    posSalesAddPago: async (
      root,
      { token, instance, pagos, transaction, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      try {
        for (const val of pagos) {
          if (val?.moved) {
            if (val?.saldo <= val?.pago) {
              const update = await db.collection("POSsales").updateOne(
                { _id: val?._id },
                {
                  $set: {
                    saldo: 0,
                    estatus: "Pagada",
                  },
                }
              );

              const POSsale = await db
                .collection("POSsales")
                .findOne({ _id: val?._id });
              if (POSsale.clienteName !== "Venta al Publico") {
                const NotaAGG = await db
                  .collection("POSsales")
                  .aggregate([
                    { $match: { _id: val?._id } },
                    { $unwind: "$products" },
                    {
                      $group: {
                        _id: {
                          modelo: "$products.mod",
                          tela: "$products.colorTelaName",
                          precio: "$products.precio",
                        },
                        cantidad: { $sum: "$products.cantidad" },
                      },
                    },
                    {
                      $project: {
                        _id: 0,
                        modelo: "$_id.modelo",
                        tela: "$_id.tela",
                        precio: "$_id.precio",
                        cantidad: 1,
                        total: { $multiply: ["$_id.precio", "$cantidad"] },
                      },
                    },
                  ])
                  .toArray();
                const joinedData = NotaAGG.map(
                  ({ modelo, tela, precio, cantidad, total }) =>
                    `*${modelo}* ${tela} $${precio} ${cantidad} pzas total: $${total}`
                ).join("\n");
                const body = `¡Hola ${POSsale.clienteName}!
                Gracias por hacer tu compra en Sterling. Apreciamos tu preferencia y estamos emocionados de que seas parte de nuestra comunidad.

                A continuación, encontrarás el resumen de tu compra:

                ${joinedData}

                Si tienes alguna pregunta, no dudes en contactarnos.

                Saludos,
                Sterling`;
                const mensajeEnviado = enviarMensaje({
                  db,
                  clientId: POSsale.cliente,
                  body,
                  instance,
                  token,
                });
              }
            } else {
              const update = await db
                .collection("POSsales")
                .updateOne(
                  { _id: val?._id },
                  { $set: { saldo: val?.saldo - val?.pago } }
                );
            }
            const obj = {
              _id: uuidv4(),
              fecha: moment().unix(),
              clpv: val?._id,
              empresa: "Rockefeller",
              cuenta: transaction.cuenta,
              cuentaName: transaction.cuentaName,
              cantidad: val?.pago,
              descripcion: `Pago Nota ${val?.numNota}`,
              concepto: "Pago Tienda Credito",
              conceptoName: "Pago Tienda Credito",
              capturista: transaction.capturista,
              estatus: "Activo",
              cliente: transaction.cliente,
              ult4: transaction.ult4,
            };
            const insertTransaccion = await db
              .collection("transaccion")
              .insertOne(obj);
            const updateCuenta = await db
              .collection("cuentasBancarias")
              .updateOne(
                { _id: obj.cuenta },
                { $inc: { saldo: obj.cantidad } }
              );
          }
        }
        return {
          code: 200,
          success: true,
          message: `Se cancelo `,
        };
      } catch (error) {
        console.log(error);
        return {
          code: error.extensions?.response?.status || 500,
          success: false,
          message: error.extensions?.response?.body || error.message,
        };
      }
    },
    posSalesUpdateCupon: async (
      root,
      { idNota, cliente, cupon, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      try {
        const updated = await db
          .collection("POSsales")
          .updateOne({ _id: idNota }, { $set: { cupon } });
        const tipoVenta = await contarArticulosNota(idNota, cliente, db);
        calcularTotales(idNota, tipoVenta, cupon, db);
        return {
          code: 200,
          success: true,
          message: `Se cancelo `,
          data: idNota,
        };
      } catch (error) {
        console.log(error);
        return {
          code: error.extensions.response.status,
          success: false,
          message: error.extensions.response.body,
          data: null,
        };
      }
    },
    posSalesInsert: async (root, { online }, { dbOnline, dbOffline }) => {
      const db = online ? dbOnline : dbOffline;
      const numb = await db
        .collection("POSsales")
        .find({}, { fields: { numNota: 1 }, sort: { numNota: -1 }, limit: 1 })
        .toArray();

      const obj = {
        _id: uuidv4(),
        cliente: "Venta al Publico",
        clienteName: "Venta al Publico",
        estatus: "En elaboracion",
        fecha: new Date(),
        formadePago: null,
        products: [],
        saldo: 0,
        total: 0,
        ahorrado: 0,
        tipo: "Venta",
        descuentoActivo: false,
        cupon: false,
        vendedora: null,
        vendedoraName: "Selecciona Vendedora",
        numNota: numb[0]?.numNota + 1 || 1,
        totalPiezas: 0,
      };

      try {
        const inserted = await db.collection("POSsales").insertOne(obj);
        return {
          code: 200,
          success: true,
          message: `Se cancelo `,
          data: obj._id,
        };
      } catch (error) {
        console.log(error);
        return {
          code: error.extensions.response.status,
          success: false,
          message: error.extensions.response.body,
          data: null,
        };
      }
    },
    posSalesUpdateClient: async (
      root,
      { instance, token, idNota, cliente, clienteName, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      try {
        let hasValid = true;
        if (online) {
          hasValid = await checkValidPhones(cliente, db, instance, token);
        }
        const update = await db.collection("POSsales").updateOne(
          { _id: idNota },
          {
            $set: {
              cliente,
              clienteName,
            },
          }
        );
        return {
          code: 200,
          success: true,
          message: `Se edito `,
          data: hasValid ? "WA ACTIVE" : "NO WA",
        };
      } catch (error) {
        console.log(error);
        return {
          code: error.extensions?.response?.status || 500,
          success: false,
          message: error.extensions?.response?.body || error.message,
          data: "ERROR",
        };
      }
    },
    posSalesUpdateVendedora: async (
      root,
      { idNota, vendedora, vendedoraName, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      try {
        const update = await db.collection("POSsales").updateOne(
          { _id: idNota },
          {
            $set: {
              vendedora,
              vendedoraName,
            },
          }
        );
        return {
          code: 200,
          success: true,
          message: `Se edito `,
        };
      } catch (error) {
        console.log(error);
        return {
          code: error.extensions?.response?.status || 500,
          success: false,
          message: error.extensions?.response?.body || error.message,
        };
      }
    },
    posSalesInsertModeloCodigo: async (
      root,
      { idNota, code, cliente, cupon, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      const codigo = code.split(" I ");
      const mod = await db.collection("Modelos").findOne(
        { alu: Number(codigo[0]) },
        {
          fields: {
            _id: 1,
            modelo: 1,
            descripcion: 1,
            alu: 1,
            tipoName: 1,
            precios: 1,
            tipoName: 1,
            costoPromedio: 1,
            codigoSat: 1,
            marca: 1,
          },
        }
      );
      if (!mod) {
        throw new GraphQLError("NO SE ENCUENTRA MODELO", {
          extensions: {
            code: 200,
            success: false,
            message: "NO SE ENCUENTRA MODELO",
          },
        });
      }
      const color = await db.collection("Colores").findOne(
        { id2: Number(codigo[2]) },
        {
          fields: {
            _id: 1,
            tela: 1,
            colorBase: 1,
            descripcion: 1,
            id2: 1,
            foto: 1,
            telaName: 1,
          },
        }
      );
      if (!color) {
        throw new GraphQLError("NO SE ENCUENTRA COLOR", {
          extensions: {
            code: 200,
            success: false,
            message: "NO SE ENCUENTRA COLOR",
          },
        });
      }
      const precio = find(mod.precios, {
        tela: color.tela,
        base:
          color.colorBase === "Estampado" ||
          color.colorBase === "Estampado Digital"
            ? color.colorBase
            : "LISO",
      });
      if (!precio) {
        throw new GraphQLError("NO SE ENCUENTRA PRECIO", {
          extensions: {
            code: 200,
            success: false,
            message: "NO SE ENCUENTRA PRECIO",
          },
        });
      }
      const existe = await db.collection("POSsales").findOne({
        $and: [
          { _id: idNota },
          {
            products: {
              $elemMatch: {
                modelo: mod._id,
                color: color._id,
                talla: codigo[1],
              },
            },
          },
        ],
      });
      if (existe) {
        try {
          const updated = await db.collection("POSsales").updateOne(
            {
              $and: [
                { _id: idNota },
                {
                  products: {
                    $elemMatch: {
                      modelo: mod._id,
                      color: color._id,
                      talla: codigo[1],
                    },
                  },
                },
              ],
            },
            {
              $inc: {
                "products.$.cantidad": 1,
                totalPiezas: 1,
              },
            }
          );
          const tipoVenta = await contarArticulosNota(idNota, cliente, db);
          const updated2 = await calcularTotales(idNota, tipoVenta, cupon, db);
          return {
            code: 200,
            success: true,
            message: `Se edito `,
          };
        } catch (error) {
          throw new Meteor.Error("Error al update producto", error.message);
        }
      } else {
        const prod2Insert = {
          _id: uuidv4(),
          precioMenudeo: precio["precio"],
          costoPromedio: precio["costoPromedio"] || precio["precio"] * 0.65,
          liquidacion: precio["liquidacion"] || false,
          talla: codigo[1],
          modelo: mod._id,
          modelType: mod.tipoName,
          alu: mod.alu,
          id2: color.id2,
          mod: mod.modelo,
          corte: codigo[3],
          modDesc: mod.descripcion,
          precioBase: precio.precioBase,
          subtotalAhorro: precio["precioBase"] - precio["precio"],
          cantidad: 1,
          estatus: "Sin cambios",
          color: color._id,
          marca: mod.marca || "Sterling",
          colorTelaName: color.telaName,
          colorDesc: color.descripcion,
          colTela: color.tela,
          colBase: color.colorBase,
          colorFoto: color.foto,
          fechaIns: moment().unix(),
          codigoSat: mod.codigoSat,
        };
        let res = await db
          .collection("POSsales")
          .updateOne(
            { _id: idNota },
            { $push: { products: prod2Insert }, $inc: { totalPiezas: 1 } }
          );
        const tipoVenta = await contarArticulosNota(idNota, cliente, db);

        const updated2 = await calcularTotales(idNota, tipoVenta, cupon, db);
        return {
          code: 200,
          success: true,
          message: `Se edito `,
        };
      }
    },
    posSalesInsertModeloBusqueda: async (
      root,
      { idNota, input, cliente, cupon, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      const mod = await db.collection("Modelos").findOne(
        { alu: Number(input.alu) },
        {
          fields: {
            precios: 1,
            descripcion: 1,
            costoPromedio: 1,
            codigoSat: 1,
          },
        }
      );
      const precio = find(mod.precios, {
        tela: input.colTela,
        base:
          input.colBase === "Estampado" || input.colBase === "Estampado Digital"
            ? input.colBase
            : "LISO",
      });
      if (!precio) {
        throw new GraphQLError("NO SE ENCUENTRA PRECIO", {
          extensions: {
            code: 200,
            success: false,
            message: "NO SE ENCUENTRA PRECIO",
          },
        });
      }
      const existe = await db.collection("POSsales").findOne({
        $and: [
          { _id: idNota },
          {
            products: {
              $elemMatch: {
                modelo: input.modelo,
                color: input.color,
                talla: input.talla,
              },
            },
          },
        ],
      });
      if (existe) {
        try {
          const updated = await db.collection("POSsales").updateOne(
            {
              $and: [
                { _id: idNota },
                {
                  products: {
                    $elemMatch: {
                      modelo: input.modelo,
                      color: input.color,
                      talla: input.talla,
                    },
                  },
                },
              ],
            },
            {
              $inc: {
                "products.$.cantidad": 1,
                totalPiezas: 1,
              },
            }
          );
          const tipoVenta = await contarArticulosNota(idNota, cliente, db);
          const updated2 = await calcularTotales(idNota, tipoVenta, cupon, db);
          return {
            code: 200,
            success: true,
            message: `Se edito `,
          };
        } catch (error) {
          throw new Meteor.Error("Error al update producto", error.message);
        }
      } else {
        const prod2Insert = {
          ...input,
          _id: uuidv4(),
          precioMenudeo: precio["precio"],
          costoPromedio: precio["costoPromedio"] || precio["precio"] * 0.65,
          corte: null,
          modDesc: mod.descripcion,
          precioBase: precio.precioBase,
          subtotalAhorro: precio["precioBase"] - precio["precio"],
          cantidad: 1,
          estatus: "Sin cambios",
          fechaIns: moment().unix(),
          codigoSat: mod.codigoSat,
        };
        const updated = await db
          .collection("POSsales")
          .updateOne(
            { _id: idNota },
            { $push: { products: prod2Insert }, $inc: { totalPiezas: 1 } }
          );
        const tipoVenta = await contarArticulosNota(idNota, cliente, db);
        const updated2 = await calcularTotales(idNota, tipoVenta, cupon, db);
        return {
          code: 200,
          success: true,
          message: `Se edito `,
        };
      }
    },
    posSalesUpdateSubtotals: async (
      root,
      { idNota, idProduct, cantidad, precio, cliente, cupon, type, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      try {
        const update = await db.collection("POSsales").updateOne(
          { _id: idNota, products: { $elemMatch: { _id: idProduct } } },
          {
            $set: {
              "products.$.precioCambiado": type === "price",
              "products.$.precio": precio,
              "products.$.cantidad": cantidad,
              "products.$.subtotal": precio * cantidad,
            },
          }
        );
        const tipoVenta = await contarArticulosNota(idNota, cliente, db);
        const updated2 = await calcularTotales(idNota, tipoVenta, cupon, db);
        return {
          code: 200,
          success: true,
          message: `Se edito `,
        };
      } catch (error) {
        console.log(error);
        return {
          code: error.extensions?.response?.status || 500,
          success: false,
          message: error.extensions?.response?.body || error.message,
        };
      }
    },
    posSalesUpdateDescuento: async (
      root,
      { idNota, idProduct, discountAsk, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      try {
        const update = await db.collection("POSsales").updateOne(
          { _id: idNota, products: { $elemMatch: { _id: idProduct } } },
          {
            $set: {
              descuentoActivo: true,
              "products.$.estatus": "Esperando Descuento",
              "products.$.discountAsk": discountAsk,
            },
          }
        );
        return {
          code: 200,
          success: true,
          message: `Se edito `,
        };
      } catch (error) {
        console.log(error);
        return {
          code: error.extensions?.response?.status || 500,
          success: false,
          message: error.extensions?.response?.body || error.message,
        };
      }
    },
    posSalesUpdateRemoveProduct: async (
      root,
      { idNota, idProduct, cliente, cupon, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      try {
        const update = await db.collection("POSsales").updateOne(
          { _id: idNota },
          {
            $pull: {
              products: { _id: idProduct },
            },
          }
        );
        const tipoVenta = await contarArticulosNota(idNota, cliente, db);
        const updated2 = await calcularTotales(idNota, tipoVenta, cupon, db);
        const descuentos = await productosDescuentos(idNota, db);

        return {
          code: 200,
          success: true,
          message: `Se edito `,
        };
      } catch (error) {
        console.log(error);
        return {
          code: error.extensions?.response?.status || 500,
          success: false,
          message: error.extensions?.response?.body || error.message,
        };
      }
    },
    posSalesDiscount: async (
      root,
      {
        idNota,
        idProduct,
        precioAnterior,
        cantidad,
        precioNuevo,
        cliente,
        cupon,
        type,
        online,
      },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      try {
        const update = await db.collection("POSsales").updateOne(
          { _id: idNota, products: { $elemMatch: { _id: idProduct } } },
          {
            $set: {
              "products.$.estatus": "Sin cambios",
              "products.$.discountAsk": 0,
              "products.$.precioCambiado": true,
              "products.$.cantidad": cantidad,
              "products.$.precio": type ? precioNuevo : precioAnterior,
              "products.$.subtotal": type
                ? precioNuevo * cantidad
                : precioAnterior * cantidad,
            },
          }
        );
        const tipoVenta = await contarArticulosNota(idNota, cliente, db);
        const updated2 = await calcularTotales(idNota, tipoVenta, cupon, db);
        const descuentos = await productosDescuentos(idNota, db);
        return {
          code: 200,
          success: true,
          message: `Se edito `,
        };
      } catch (error) {
        console.log(error);
        return {
          code: error.extensions?.response?.status || 500,
          success: false,
          message: error.extensions?.response?.body || error.message,
        };
      }
    },
    posSalesSetCredito: async (
      root,
      { token, instance, idNota, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      try {
        const updateCredit = db
          .collection("POSsales")
          .updateOne(
            { _id: idNota },
            { $set: { estatus: "Credito", formadePago: "Credito" } }
          );
        const POSsale = await db
          .collection("POSsales")
          .findOne({ _id: idNota });

        if (POSsale.clienteName !== "Venta al Publico") {
          const NotaAGG = await db
            .collection("POSsales")
            .aggregate([
              { $match: { _id: idNota } },
              { $unwind: "$products" },
              {
                $group: {
                  _id: {
                    modelo: "$products.mod",
                    tela: "$products.colorTelaName",
                    precio: "$products.precio",
                  },
                  cantidad: { $sum: "$products.cantidad" },
                },
              },
              {
                $project: {
                  _id: 0,
                  modelo: "$_id.modelo",
                  tela: "$_id.tela",
                  precio: "$_id.precio",
                  cantidad: 1,
                  total: { $multiply: ["$_id.precio", "$cantidad"] },
                },
              },
            ])
            .toArray();
          const joinedData = NotaAGG.map(
            ({ modelo, tela, precio, cantidad, total }) =>
              `*${modelo}* ${tela} $${precio} ${cantidad} pzas total: $${total}`
          ).join("\n");
          const body = `¡Hola ${POSsale.clienteName}!
                Gracias por hacer tu compra en Sterling. Apreciamos tu preferencia y estamos emocionados de que seas parte de nuestra comunidad.

                A continuación, encontrarás el resumen de tu compra:

                ${joinedData}

                Si tienes alguna pregunta, no dudes en contactarnos.

                Saludos,
                Sterling`;
          const mensajeEnviado = enviarMensaje({
            db,
            clientId: POSsale.cliente,
            body,
            instance,
            token,
          });
        }

        const allProdsPromise = db
          .collection("POSsales")
          .findOne(
            { _id: idNota },
            { projection: { products: 1, cliente: 1, total: 1 } }
          );

        const [updateResult, allProds] = await Promise.all([
          updateCredit,
          allProdsPromise,
        ]);

        const inventoryUpdates = [];

        for (const val of allProds.products) {
          inventoryUpdates.push({
            updateOne: {
              filter: {
                modeloId: val?.modelo,
                talla: val?.talla,
                colorId: val?.color,
              },
              update: {
                $inc: {
                  cantidadTienda: val?.cantidad * -1,
                },
              },
            },
          });
        }

        const bulkInventoryPromise = db
          .collection("Inventario")
          .bulkWrite(inventoryUpdates);

        const updateClientPromise = db
          .collection("Clientes")
          .updateOne(
            { _id: allProds?.cliente },
            { $inc: { saldo: allProds?.total } }
          );

        await Promise.all([bulkInventoryPromise, updateClientPromise]);

        return {
          code: 200,
          success: true,
          message: `Se edito `,
        };
      } catch (error) {
        console.log(error);
        return {
          code: error.extensions?.response?.status || 500,
          success: false,
          message: error.extensions?.response?.body || error.message,
        };
      }
    },
    posSalesInsertPaymentEfectivo: async (
      root,
      { token, instance, input, saldo, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      const obj = {
        _id: uuidv4(),
        fecha: moment().unix(),
        clpv: input.clpv,
        empresa: "Rockefeller",
        cuenta: "TgZNR2DHLXmzQsX5H",
        cuentaName: "STG",
        cantidad: input.cantidad,
        descripcion: `Pago Nota ${input.numNota}`,
        concepto: "Venta Tienda",
        conceptoName: "Venta Tienda",
        capturista: input.capturista,
        estatus: "Activo",
        cliente: input.cliente,
      };
      const POSsale = await db
        .collection("POSsales")
        .findOne({ _id: input.clpv });

      try {
        const insertTransaccion = db.collection("transaccion").insertOne(obj);
        const updateCuenta = db
          .collection("cuentasBancarias")
          .updateOne({ _id: obj.cuenta }, { $inc: { saldo: input.cantidad } });

        await Promise.all([insertTransaccion, updateCuenta]);
        const updateOperations = [];
        if (input.cantidad >= saldo) {
          updateOperations.push(
            db.collection("POSsales").updateOne(
              { _id: input.clpv },
              {
                $set: {
                  estatus: "Pagada",
                  formadePago: "Efectivo",
                  fecha: new Date(),
                  saldo: 0,
                  fechaPago: new Date(),
                },
              }
            ),
            db.collection("Clientes").updateOne(
              { _id: obj.cliente },
              {
                $set: { lastSale: obj.cantidad, lastVisit: new Date() },
                $inc: {
                  totalVentas: obj.cantidad,
                  totalVisitas: 1,
                },
                $push: {
                  visitas: {
                    _id: input.clpv,
                    fecha: POSsale.fecha,
                    total: POSsale.total,
                    type: "POS",
                  },
                },
              }
            )
          );
          if (POSsale.clienteName !== "Venta al Publico") {
            const NotaAGG = await db
              .collection("POSsales")
              .aggregate([
                { $match: { _id: input.clpv } },
                { $unwind: "$products" },
                {
                  $group: {
                    _id: {
                      modelo: "$products.mod",
                      tela: "$products.colorTelaName",
                      precio: "$products.precio",
                    },
                    cantidad: { $sum: "$products.cantidad" },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    modelo: "$_id.modelo",
                    tela: "$_id.tela",
                    precio: "$_id.precio",
                    cantidad: 1,
                    total: { $multiply: ["$_id.precio", "$cantidad"] },
                  },
                },
              ])
              .toArray();
            const joinedData = NotaAGG.map(
              ({ modelo, tela, precio, cantidad, total }) =>
                `*${modelo}* ${tela} $${precio} ${cantidad} pzas total: $${total}`
            ).join("\n");
            const body = `¡Hola ${POSsale.clienteName}!
                Gracias por hacer tu compra en Sterling. Apreciamos tu preferencia y estamos emocionados de que seas parte de nuestra comunidad.

                A continuación, encontrarás el resumen de tu compra:

                ${joinedData}

                Si tienes alguna pregunta, no dudes en contactarnos.

                Saludos,
                Sterling`;
            if (online) {
              const mensajeEnviado = enviarMensaje({
                db,
                clientId: POSsale.cliente,
                body,
                instance,
                token,
              });
            }
          }
        } else {
          updateOperations.push(
            db.collection("POSsales").updateOne(
              { _id: obj.clpv },
              {
                $set: {
                  formadePago: "Efectivo",
                },
                $inc: { saldo: obj.cantidad * -1 },
              }
            )
          );
        }
        await Promise.all(updateOperations);
        const allProds = await db
          .collection("POSsales")
          .findOne({ _id: obj.clpv }, { fields: { products: 1 } });
        const inventoryUpdates = allProds.products.map((val) => ({
          updateOne: {
            filter: {
              modeloId: val?.modelo,
              colorId: val?.color,
              talla: val?.talla,
            },
            update: {
              $inc: {
                cantidadTienda: val?.cantidad * -1,
              },
            },
          },
        }));

        await db.collection("Inventario").bulkWrite(inventoryUpdates);

        return {
          code: 200,
          success: true,
          message: `Se edito `,
        };
      } catch (error) {
        console.log(error);
        return {
          code: error.extensions?.response?.status || 500,
          success: false,
          message: error.extensions?.response?.body || error.message,
        };
      }
    },
    posSalesInsertPaymentTarjeta: async (
      root,
      { token, instance, input, saldo, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      const obj = {
        _id: uuidv4(),
        fecha: moment().unix(),
        clpv: input.clpv,
        empresa: "Rockefeller",
        cuenta: input.cuenta,
        cuentaName: input.cuentaName,
        cantidad: input.cantidad,
        descripcion: `Pago Nota ${input.numNota}`,
        concepto: "Venta Tienda",
        conceptoName: "Venta Tienda",
        capturista: input.capturista,
        estatus: "Activo",
        cliente: input.cliente,
        ult4: input?.ult4 || 0,
      };
      const POSsale = await db
        .collection("POSsales")
        .findOne({ _id: input.clpv });
      try {
        const insertTransaccion = db.collection("transaccion").insertOne(obj);
        const updateCuenta = db
          .collection("cuentasBancarias")
          .updateOne({ _id: obj.cuenta }, { $inc: { saldo: input.cantidad } });
        await Promise.all([insertTransaccion, updateCuenta]);
        const updateOperations = [];
        if (input.cantidad >= saldo) {
          updateOperations.push(
            db.collection("POSsales").updateOne(
              { _id: input.clpv },
              {
                $set: {
                  estatus: "Pagada",
                  formadePago: input.tipoPago,
                  fecha: new Date(),
                  saldo: 0,
                  fechaPago: new Date(),
                  facturar: input.factura,
                },
              }
            ),
            db.collection("Clientes").updateOne(
              { _id: obj.cliente },
              {
                $set: { lastSale: obj.cantidad, lastVisit: new Date() },
                $inc: {
                  totalVentas: obj.cantidad,
                  totalVisitas: 1,
                },
                $push: {
                  visitas: {
                    _id: input.clpv,
                    fecha: POSsale.fecha,
                    total: POSsale.total,
                    type: "POS",
                  },
                },
              }
            )
          );
          if (POSsale.clienteName !== "Venta al Publico") {
            const NotaAGG = await db
              .collection("POSsales")
              .aggregate([
                { $match: { _id: input.clpv } },
                { $unwind: "$products" },
                {
                  $group: {
                    _id: {
                      modelo: "$products.mod",
                      tela: "$products.colorTelaName",
                      precio: "$products.precio",
                    },
                    cantidad: { $sum: "$products.cantidad" },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    modelo: "$_id.modelo",
                    tela: "$_id.tela",
                    precio: "$_id.precio",
                    cantidad: 1,
                    total: { $multiply: ["$_id.precio", "$cantidad"] },
                  },
                },
              ])
              .toArray();
            const joinedData = NotaAGG.map(
              ({ modelo, tela, precio, cantidad, total }) =>
                `*${modelo}* ${tela} $${precio} ${cantidad} pzas total: $${total}`
            ).join("\n");
            const body = `¡Hola ${POSsale.clienteName}!
                Gracias por hacer tu compra en Sterling. Apreciamos tu preferencia y estamos emocionados de que seas parte de nuestra comunidad.

                A continuación, encontrarás el resumen de tu compra:

                ${joinedData}

                Si tienes alguna pregunta, no dudes en contactarnos.

                Saludos,
                Sterling`;
            if (online) {
              const mensajeEnviado = enviarMensaje({
                db,
                clientId: POSsale.cliente,
                body,
                instance,
                token,
              });
            }
          }
        } else {
          updateOperations.push(
            db.collection("POSsales").updateOne(
              { _id: obj.clpv },
              {
                $set: {
                  formadePago: input.tipoPago,
                  facturar: input.factura,
                },
                $inc: { saldo: obj.cantidad * -1 },
              }
            )
          );
        }
        if (!input.factura) {
          if (online) {
            await facturarNota({ input, db });
          } else {
            await db
              .collection("POSsales")
              .updateOne({ _id: input.clpv }, { $set: { facturar: true } });
          }
        }
        await Promise.all(updateOperations);

        const allProds = await db
          .collection("POSsales")
          .findOne({ _id: obj.clpv }, { fields: { products: 1 } });

        const inventoryUpdates = allProds.products.map((val) => ({
          updateOne: {
            filter: {
              modeloId: val?.modelo,
              colorId: val?.color,
              talla: val?.talla,
            },
            update: {
              $inc: {
                cantidadTienda: val?.cantidad * -1,
              },
            },
          },
        }));

        await db.collection("Inventario").bulkWrite(inventoryUpdates);

        return {
          code: 200,
          success: true,
          message: `Se edito `,
        };
      } catch (error) {
        console.log(error);
        return {
          code: error.extensions?.response?.status || 500,
          success: false,
          message: error.extensions?.response?.body || error.message,
        };
      }
    },
  },
};
