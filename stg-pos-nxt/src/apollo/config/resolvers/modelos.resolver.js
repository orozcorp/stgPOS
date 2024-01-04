export const modelosResolvers = {
  Mutation: {
    modelosSearch: async (
      root,
      { modelo, online },
      { dbOnline, dbOffline }
    ) => {
      const db = online ? dbOnline : dbOffline;
      return await db
        .collection("Modelos")
        .find({
          modelo: {
            $regex: `.*\\b${modelo}.*`,
            $options: "i",
          },
        })
        .sort({ modelo: 1 })
        .toArray();
    },
  },
};
