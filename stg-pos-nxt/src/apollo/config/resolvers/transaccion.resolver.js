import moment from "moment";

export const transaccion = {
  Query: {
    listCuentasBancarias: async (root, { online }, { dbOnline, dbOffline }) => {
      const db = online ? dbOnline : dbOffline;
      return db
        .collection("cuentasBancarias")
        .find({ active: true }, { sort: { banco: 1, cuenta: 1 } })
        .toArray();
    },
    listCuentasPOS: async (root, { online }, { dbOnline, dbOffline }) => {
      const db = online ? dbOnline : dbOffline;
      return db
        .collection("cuentasBancarias")
        .find({ active: true, pos: "POS" }, { sort: { banco: 1, cuenta: 1 } })
        .toArray();
    },
    listCuentasTransf: async (root, { online }, { dbOnline, dbOffline }) => {
      const db = online ? dbOnline : dbOffline;
      return db
        .collection("cuentasBancarias")
        .find({ active: true, transf: true }, { sort: { banco: 1, cuenta: 1 } })
        .toArray();
    },
    listConceptos: async (root, { online }, { dbOnline, dbOffline }) => {
      const db = online ? dbOnline : dbOffline;
      return db
        .collection("conceptosGastos")
        .find({}, { sort: { concepto: 1 } })
        .toArray();
    },
  },
  Mutation: {
    transaccionInsert: async (
      root,
      { input, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      try {
        const { cuenta, cantidad } = input;
        input.cantidad = cantidad * -1;
        input.estatus = "Activo";
        input.fecha = moment().unix();
        let res = await db.collection("transaccion").insertOne(input);
        let res2 = await db
          .collection("cuentasBancarias")
          .updateOne({ _id: cuenta }, { $inc: { saldo: cantidad * -1 } });
        return {
          code: 200,
          success: true,
          message: `Se ingreso `,
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
