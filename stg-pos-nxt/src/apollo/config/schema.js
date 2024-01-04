import { mergeTypeDefs } from "@graphql-tools/merge";
import { pos } from "./types/pos";
import { responses } from "./types/responses";
import { transaccion } from "./types/transaccion";
import { sync } from "./types/sync";
import { users } from "./types/users";
import { clientes } from "./types/clientes";
import { modelos } from "./types/modelos";

const schema = mergeTypeDefs([
  pos,
  transaccion,
  responses,
  sync,
  users,
  clientes,
  modelos,
]);

export default schema;
