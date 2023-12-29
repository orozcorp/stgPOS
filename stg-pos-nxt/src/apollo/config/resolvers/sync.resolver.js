const onlineURI = process.env.MONGODB_URI;
const offlineURI = process.env.OFFLINE_DB;

export const sync = {
  Mutation: {
    syncOffline: async (_, args, { dbOnline, dbOffline }) => {
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

        const collectionsToSync = [
          { name: "Colores", field: "fechaIng" },
          { name: "POSsales", field: "fecha" },
          // Add other collections here
        ];

        const clonePromises = collectionsToSync.map(({ name, field }) =>
          dbOffline.cloneCollection(onlineURI, name, {
            [field]: { $gte: lastSyncDate },
          })
        );

        // Add special handling for 'transacciones'
        clonePromises.push(
          dbOffline.cloneCollection(onlineURI, "transacciones", {
            fecha: { $gte: lastSyncUnix },
            capturista: "6415a35cef355a1fda342d8a",
          })
        );

        // Handle collections without a date field
        [
          "conceptosGastos",
          "cuentasBancarias",
          "Inventario",
          "Modelos",
          "Clientes",
        ].forEach((name) => {
          clonePromises.push(dbOffline.cloneCollection(onlineURI, name));
        });

        // Update lastSync record
        clonePromises.push(
          dbOffline
            .collection("lastSync")
            .updateOne(
              { type: "Offline" },
              { $set: { fecha: new Date() } },
              { upsert: true }
            )
        );

        await Promise.all(clonePromises.map((p) => p.catch((e) => e)));

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

        const clonePromises = [];

        // Handle collections without a date field
        ["cuentasBancarias", "Inventario", "Clientes"].forEach((name) => {
          clonePromises.push(dbOnline.cloneCollection(offlineURI, name));
        });

        // Handle collections with a date field
        clonePromises.push(
          dbOnline.cloneCollection(offlineURI, "POSsales", {
            fecha: { $gte: lastSyncDate },
          })
        );
        clonePromises.push(
          dbOnline.cloneCollection(offlineURI, "transacciones", {
            fecha: { $gte: lastSyncUnix },
            capturista: "6415a35cef355a1fda342d8a",
          })
        );

        // Update lastSync record
        clonePromises.push(
          dbOffline
            .collection("lastSync")
            .updateOne(
              { type: "Online" },
              { $set: { fecha: new Date() } },
              { upsert: true }
            )
        );

        await Promise.all(clonePromises.map((p) => p.catch((e) => e)));

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
