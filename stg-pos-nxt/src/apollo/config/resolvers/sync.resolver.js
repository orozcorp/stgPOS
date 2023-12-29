export const sync = {
  Mutation: {
    syncOffline: async (_, args, { dbOnline, dbOffline }) => {
      console.log("syncOffline");
      try {
        const lastSync = await dbOffline
          .collection("lastSync")
          .find({ type: "Offline" }, { sort: { fecha: -1 } })
          .limit(1)
          .toArray();
        const lastSyncDate =
          lastSync.length > 0 ? lastSync[0].fecha : new Date("2001-01-01");
        const lastSyncUnix = Math.floor(
          new Date(lastSyncDate).getTime() / 1000
        );

        const syncOperations = async () => {
          const collectionsToSync = [
            { name: "POSsales", field: "fecha" },
            // Add other collections here
          ];
          console.log("syncOperations");
          for (const { name, field } of collectionsToSync) {
            const docs = await dbOnline
              .collection(name)
              .find({ [field]: { $gte: lastSyncDate } })
              .toArray();
            await dbOffline
              .collection(name)
              .insertMany(docs, { ordered: false })
              .catch((e) => console.error(e));
          }
          const colores = await dbOnline
            .collection("Colores")
            .find({ fechaIng: { $gte: lastSyncUnix } })
            .toArray();
          await dbOffline
            .collection("Colores")
            .insertMany(colores, { ordered: false })
            .catch((e) => console.error(e));
          // Special handling for 'transacciones'
          const transacciones = await dbOnline
            .collection("transacciones")
            .find({
              fecha: { $gte: lastSyncUnix },
              capturista: "6415a35cef355a1fda342d8a",
            })
            .toArray();
          await dbOffline
            .collection("transacciones")
            .insertMany(transacciones, { ordered: false })
            .catch((e) => console.error(e));

          // Handle collections without a date field
          const collectionsWithoutDate = [
            "conceptosGastos",
            "cuentasBancarias",
            "Inventario",
            "Modelos",
            "Clientes",
          ];
          for (const name of collectionsWithoutDate) {
            const docs = await dbOnline.collection(name).find({}).toArray();
            await dbOffline
              .collection(name)
              .insertMany(docs, { ordered: false })
              .catch((e) => console.error(e));
          }

          // Update lastSync record
          await dbOffline
            .collection("lastSync")
            .updateOne(
              { type: "Offline" },
              { $set: { fecha: new Date() } },
              { upsert: true }
            );
        };

        await syncOperations();

        return {
          code: 200,
          success: true,
          message: "Sync successful",
          data: "Sync successful",
        };
      } catch (error) {
        console.error("Sync error:", error);
        return {
          code: 500,
          success: false,
          message: "Sync error",
          data: "Sync error",
        };
      }
    },
    syncOnline: async (_, args, { dbOnline, dbOffline }) => {
      try {
        const lastSync = await dbOffline
          .collection("lastSync")
          .find({ type: "Online" }, { sort: { fecha: -1 } })
          .limit(1)
          .toArray();
        const lastSyncDate =
          lastSync.length > 0 ? lastSync[0].fecha : new Date("2001-01-01");
        const lastSyncUnix = Math.floor(
          new Date(lastSyncDate).getTime() / 1000
        );

        const syncOperations = async () => {
          // Handle collections with a date field
          const collectionsWithDate = [
            { name: "POSsales", field: "fecha" },
            {
              name: "transacciones",
              field: "fecha",
              additionalCriteria: { capturista: "6415a35cef355a1fda342d8a" },
            },
            // Add other collections with date field here
          ];

          for (const {
            name,
            field,
            additionalCriteria = {},
          } of collectionsWithDate) {
            const criteria = {
              [field]: { $gte: lastSyncDate },
              ...additionalCriteria,
            };
            const docs = await dbOffline
              .collection(name)
              .find(criteria)
              .toArray();
            await dbOnline
              .collection(name)
              .insertMany(docs, { ordered: false })
              .catch((e) => console.error(e));
          }

          // Handle collections without a date field
          const collectionsWithoutDate = [
            "cuentasBancarias",
            "Inventario",
            "Clientes",
          ];
          for (const name of collectionsWithoutDate) {
            const docs = await dbOffline.collection(name).find({}).toArray();
            await dbOnline
              .collection(name)
              .insertMany(docs, { ordered: false })
              .catch((e) => console.error(e));
          }

          // Update lastSync record
          await dbOffline
            .collection("lastSync")
            .updateOne(
              { type: "Online" },
              { $set: { fecha: new Date() } },
              { upsert: true }
            );
        };

        await syncOperations();

        return {
          code: 200,
          success: true,
          message: "Sync successful",
          data: "Sync successful",
        };
      } catch (error) {
        console.error("Sync error:", error);
        return {
          code: 500,
          success: false,
          message: "Sync error",
          data: "Sync error",
        };
      }
    },
  },
};
