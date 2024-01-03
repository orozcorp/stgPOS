import { gql } from "@apollo/client";

export const users = gql`
  type Profile {
    salario: Float
    fechaDeIngres: Float
    empresa: String
    saldoAct: Float
    roles: [String!]
    tipo: String
    nombre: String
    picture: String
    apellido: String
    waToken: String
    waInstance: String
  }
  type Users {
    _id: ID!
    createdAt: Date!
    oldId: ID
    email: String!
    profile: Profile!
    tipo: String!
  }

  input ProfileInput {
    salario: Float!
    fechaDeIngres: Float!
    roles: [String!]
    saldoAct: Float!
    nombre: String!
    apellido: String!
  }
  input UserInput {
    email: String!
    profile: ProfileInput!
  }

  type Query {
    listUsersPOS(online: Boolean!): [Users]
  }
`;
