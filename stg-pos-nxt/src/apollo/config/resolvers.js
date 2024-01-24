import { mergeResolvers } from "@graphql-tools/merge";
import { clientes } from "./resolvers/clientes.resolver";
import { modelosResolvers } from "./resolvers/modelos.resolver";
import { pos } from "./resolvers/pos.resolver";
import { sync } from "./resolvers/sync.resolver";
import { transaccion } from "./resolvers/transaccion.resolver";
import { users } from "./resolvers/users.resolver";

const resolvers = mergeResolvers([
  pos,
  transaccion,
  sync,
  users,
  clientes,
  modelosResolvers,
]);

export default resolvers;
