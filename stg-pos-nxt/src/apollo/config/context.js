import { connectToDatabase } from "../../../../lib/mongodb";

export async function context(ctx) {
  const { db: dbOnline } = await connectToDatabase(true);
  const { db: dbOffline } = await connectToDatabase(false);
  return { dbOnline, dbOffline };
}
