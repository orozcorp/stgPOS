import { gql } from "@apollo/client";

export const transaccion = gql`
  type ConceptoGasto {
    _id: ID!
    concepto: String!
  }
  type CuentasBancarias {
    _id: ID!
    cuenta: String!
    banco: String!
    numero: String
    clabe: String
    saldo: Float!
    additional: String
    pass: String
    user: String
    active: Boolean
    pos: String
    transf: Boolean
  }

  input InputInsertTransaccion {
    _id: ID!
    descripcion: String!
    fecha: Float!
    empresa: String!
    cantidad: Float!
    concepto: String!
    conceptoName: String!
    estatus: String!
    capturista: ID!
    cliente: String
    clpv: String
    ult4: Int
    cuenta: String!
    cuentaName: String!
  }
  type Query {
    "List Cuentas Bancarias"
    listCuentasBancarias(online: Boolean!): [CuentasBancarias]
    "List Conceptos"
    listConceptos(online: Boolean!): [ConceptoGasto]
    listCuentasPOS(online: Boolean!): [CuentasBancarias]
    listCuentasTransf(online: Boolean!): [CuentasBancarias]
  }
  type Mutation {
    transaccionInsert(
      input: InputInsertTransaccion
      online: Boolean!
    ): GeneralResponse!
  }
`;
