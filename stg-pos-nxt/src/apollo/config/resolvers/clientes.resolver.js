export const clientes = {
  Query: {
    clienteSearch: async (_, { cliente, online }, { dbOnline, dbOffline }) => {
      const db = online ? dbOnline : dbOffline;
      try {
        const clientes = await db
          .collection("Clientes")
          .find({
            razonSocial: {
              $regex: `.*\\b${cliente}.*`,
              $options: "i",
            },
          })
          .sort({ razonSocial: 1 })
          .limit(20)
          .toArray();
        return clientes;
      } catch (error) {
        console.log(error);
        return [];
      }
    },
  },
};
