export const users = {
  Query: {
    listUsersPOS: async (root, { online }, { dbOnline, dbOffline }) => {
      const db = online ? dbOnline : dbOffline;
      return await db
        .collection("users")
        .find(
          { "profile.roles": "ventapiso" },
          { sort: { "profile.nombre": 1 } }
        )
        .toArray();
    },
  },
};
