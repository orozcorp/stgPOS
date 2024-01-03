import { gql } from "@apollo/client";
export const clientes = gql`
  type ShortLong {
    long_name: String!
    short_name: String!
  }

  type InmuebleDireccion {
    administrative_area_level_1: ShortLong
    coordenadas: [Float]
    country: ShortLong
    dirCompleta: String
    political: ShortLong
    locality: ShortLong
    postal_code: ShortLong
    route: ShortLong
    street_number: ShortLong
    sublocality: ShortLong
    sublocality_level_1: ShortLong
    neighborhood: ShortLong
    url: String
  }
  input InputShortLong {
    long_name: String!
    short_name: String!
  }
  input InputInmuebleDireccion {
    administrative_area_level_1: InputShortLong
    administrative_area_level_2: InputShortLong
    coordenadas: [Float]
    country: InputShortLong
    dirCompleta: String
    political: InputShortLong
    locality: InputShortLong
    postal_code: InputShortLong
    postal_code_suffix: InputShortLong
    route: InputShortLong
    street_number: InputShortLong
    sublocality: InputShortLong
    neighborhood: InputShortLong
    sublocality_level_1: InputShortLong
    url: String
  }
  type ClienteTelefono {
    _id: ID!
    telefono: String!
    wa: Boolean
  }
  type ClienteDireccion {
    _id: ID!
    dirCompleta: String
    url: String
    descripcion: String
    coordenadas: [Float]
    complemento: String
    direccionNEW: InmuebleDireccion
  }
  type ClienteContacto {
    _id: ID!
    nombre: String!
    telefono: String
  }
  type ClienteVisitas {
    _id: ID!
    fecha: Date
    total: Int
    type: String
  }
  type Cliente {
    _id: ID!
    razonSocial: String!
    saldo: Float
    rfc: String
    email: String
    createdAt: Date!
    tipo: String
    lastSale: Float
    lastVisit: Date
    totalVisitas: Int
    totalVentas: Float
    visitas: [ClienteVisitas]
    whatsapp: Boolean
    lastMsg: Date
    telefono: [ClienteTelefono]
    direccion: [ClienteDireccion]
    contacto: [ClienteContacto]
    credito: Int
    status: String
  }
  input InputTelefono {
    _id: ID!
    telefono: String!
    wa: Boolean
  }
  input InputContacto {
    _id: ID!
    nombre: String!
    telefono: String
  }
  input inputDireccion {
    _id: ID!
    dirCompleta: String
    url: String
    descripcion: String
    coordenadas: [Float]
    direccionNEW: InputInmuebleDireccion
  }
  input ClienteInsert {
    _id: ID!
    razonSocial: String!
    email: String
    telefono: [InputTelefono]
    tipo: String!
    rfc: String
    contacto: [InputContacto]
    direccion: [inputDireccion]
  }
  input ClienteUpdate {
    razonSocial: String!
    razonSocialOG: String!
    email: String
    telefono: [InputTelefono]
    tipo: String
    rfc: String
    direccion: [inputDireccion]
    credito: Int
  }
  input ClienteNotas {
    idCliente: ID!
    modelo: String
    tela: String
    tipo: String
  }
  type EdoCtaCliente {
    _id: ID!
    total: Float!
    saldo: Float!
    fecha: Date!
    pedido: String
    concepto: String
  }
  type ClienteEdoCta {
    edoCta: [EdoCtaCliente]
    saldo: Float!
  }
  input ClienteSolicitarGuia {
    direccionID: ID
    direccion: String!
    complemento: String
    telefono: String!
    numCajas: Int!
  }
  input EnvioGuia {
    envioID: ID!
    empresa: String!
  }
  type Query {
    clienteSearch(cliente: String!, online: Boolean!): [Cliente]
  }
`;
