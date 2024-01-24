import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import schema from "../stg-pos-nxt/src/apollo/config/schema.js";
import resolvers from "../stg-pos-nxt/src/apollo/config/resolvers.js";
import { context } from "../stg-pos-nxt/src/apollo/config/context.js";

const typeDefs = schema;

async function startServer() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    csrfPrevention: true,
    cache: "bounded",
  });

  await server.start();
  app.use("/api/graphql", expressMiddleware(server));

  app.listen(3000, () => {
    console.log("Starting server...");
    console.log(`🚀 Server ready at http://localhost:3000/api/graphql`);
  });
}

export { startServer };
