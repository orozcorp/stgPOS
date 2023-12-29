import { mergeTypeDefs } from "@graphql-tools/merge";
import { pos } from "./types/pos";
import { responses } from "./types/responses";
import { transaccion } from "./types/transaccion";
import { sync } from "./types/sync";

const schema = mergeTypeDefs([pos, transaccion, responses, sync]);

export default schema;
