import { gql } from "@apollo/client";

export const modelos = gql`
  type ModelosPrecios {
    tela: ID!
    telaName: String
    base: String
    costoPromedio: Float
    precioBase: Float
    precio: Float
    precioDist: Float
    precioMayoreo: Float
    precioInternet: Float
    fotosPrimarias: String
    liquidacion: Boolean
  }
  type CintaTabla {
    value: Boolean
    label: String
  }
  type CintaGraduacionTallas {
    talla: String
    value: Float
  }
  type Cinta {
    especificacion: String
    _id: ID
    tabla: CintaTabla
    graduacionTallas: [CintaGraduacionTallas]
  }
  type EspecificacionModeloMaq {
    value: String
    label: String
  }
  type EspecificacionModelo {
    especificacion: String
    _id: ID
    maquinaria: EspecificacionModeloMaq
  }
  type TallasModelos {
    talla: String!
    cantidadCorte: Int!
    cantidadMaquila: Int!
    cantidadTienda: Int!
  }
  type ModeloCorteHabilitacion {
    habilitacionId: ID
    piezas: Float
    descripcion: String
    tipo: String
    costo: Float
  }
  type Modelos {
    _id: ID!
    alu: Int!
    modelo: String!
    combinaciones: Int
    costoPromedio: Float
    descripcion: String
    empresa: String
    estatus: String
    fechaCreado: Float
    numPiezas: Int
    precioMaquila: Float
    fichaTecnica: String
    tipo: ID!
    tipoName: String!
    talla: String
    totalHabilitacion: Float
    codigoSat: String!
    google_product_category: Int!
    temporada: String
    temporadaName: String
    video: String
    precios: [ModelosPrecios]
    habilitacion: [ModeloCorteHabilitacion]
    cinta: [Cinta]
    especificacion: [EspecificacionModelo]
  }

  type Mutation {
    modelosSearch(modelo: String!, online: Boolean!): [Modelos]
  }
`;
