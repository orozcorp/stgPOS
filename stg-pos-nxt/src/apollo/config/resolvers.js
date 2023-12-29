const { mergeResolvers } = require("@graphql-tools/merge");

import { pos } from "./resolvers/pos.resolver";
import { sync } from "./resolvers/sync.resolver";
import { transaccion } from "./resolvers/transaccion.resolver";

const resolvers = mergeResolvers([pos, transaccion, sync]);

export default resolvers;
