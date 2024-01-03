import { gql } from "@apollo/client";

export const pos = gql`
  type POSProducts {
    _id: ID!
    precio: Float!
    precioMenudeo: Float
    talla: String!
    estatus: String!
    modelo: String!
    mod: String!
    modDesc: String!
    subtotal: Float!
    subtotalAhorro: Float!
    cantidad: Int!
    color: String!
    colorDesc: String!
    fechaIns: Int!
    liquidacion: Boolean
    marca: String
    colTela: String!
    colorTelaName: String!
    id2: Int!
    colBase: String!
    colorFoto: String!
    alu: String!
    modelType: String!
    codigoSat: String!
    discountAsk: Float
    precioCambiado: Boolean
  }
  type POS {
    _id: ID!
    cliente: String!
    clienteName: String
    fecha: Date!
    formadePago: String
    numNota: Int!
    estatus: String!
    products: [POSProducts]
    saldo: Float!
    tipo: String!
    total: Float!
    cupon: Boolean
    descuentoActivo: Boolean
    ahorrado: Float!
    vendedora: String
    facturar: Boolean
    vendedoraName: String
    totalDescuento: Float
    totalPiezas: Int!
  }
  type TransCierre {
    descripcion: String
    cantidad: Float
  }
  type pagosClientesCierre {
    _id: String
    cuenta: String
    cantidad: Float
    total: Float
  }
  type CierreDia {
    transacciones: [TransCierre]
    pagosClientes: [pagosClientesCierre]
    comisiones: [pagosClientesCierre]
    totalVentas: [pagosClientesCierre]
    totElab: [pagosClientesCierre]
  }
  type ClienteDeuda {
    value: String!
    label: String!
  }
  input POSDevo {
    _id: ID!
    cantidad: Int!
    colorDesc: String!
    colBase: String!
    colorTelaName: String!
    precio: Float!
    subtotal: Float!
    talla: String!
    mod: String!
    modDesc: String!
    colorFoto: String!
  }
  input POSPago {
    _id: ID!
    pago: Float!
    numNota: Int!
    saldo: Float!
    moved: Boolean!
  }
  type ColoresTelaPOSsearch {
    id2: Int!
    color: String!
    colorName: String!
    colorBase: String!
    colorFoto: String!
  }
  type TelaPOSsearch {
    colorTela: String!
    colorTelaName: String!
    colores: [ColoresTelaPOSsearch]
  }
  input InsertFromBusquedaPOS {
    modelo: String!
    modelType: String!
    alu: Int!
    id2: Int!
    mod: String!
    codigoSat: String!
    colTela: String!
    colorTelaName: String!
    colorFoto: String!
    colBase: String!
    talla: String!
    color: String!
    colorDesc: String!
  }
  type CambioPrecio {
    _id: String!
    nota: Float!
    idModelo: String!
    modelo: String!
    tela: String!
    color: String!
    precioAnterior: Float!
    precioNuevo: Float!
    cliente: String!
    cupon: Boolean
    cantidad: Float
  }
  input AddPagoPOSsalesEfectivo {
    clpv: String!
    cantidad: Float!
    numNota: Int!
    capturista: String!
    cliente: String!
  }
  input AddPagoPOSsalesTarjeta {
    clpv: String!
    cantidad: Float!
    numNota: Int
    capturista: String!
    cliente: String!
    cuenta: String!
    cuentaName: String!
    ult4: String
    factura: Boolean!
    tipoPago: String
  }
  type Mutation {
    posSalesCancelNota(idNota: String!, online: Boolean!): GeneralResponse!
    posSalesDevolucion(
      idNota: String!
      products: [POSDevo]
      online: Boolean!
    ): GeneralResponse!
    posSalesAddPago(
      instance: String!
      online: Boolean!
      token: String!
      pagos: [POSPago]
      transaction: AddPagoPOSsalesTarjeta
    ): GeneralResponse!
    posSalesInsert(online: Boolean!): GeneralResponseDataString!
    posSalesUpdateClient(
      token: String!
      instance: String!
      idNota: String!
      cliente: String!
      clienteName: String!
      online: Boolean!
    ): GeneralResponse!
    posSalesUpdateVendedora(
      idNota: String!
      vendedora: String!
      vendedoraName: String!
      online: Boolean!
    ): GeneralResponse!
    posSalesInsertModeloCodigo(
      idNota: String!
      code: String!
      cliente: String!
      cupon: Boolean
      online: Boolean!
    ): GeneralResponse!
    posSalesInsertModeloBusqueda(
      idNota: String!
      input: InsertFromBusquedaPOS!
      cliente: String!
      cupon: Boolean
      online: Boolean!
    ): GeneralResponse!
    posSalesUpdateSubtotals(
      idNota: String!
      idProduct: String!
      cantidad: Float!
      precio: Float!
      cliente: String!
      cupon: Boolean
      type: String!
      online: Boolean!
    ): GeneralResponse!
    posSalesUpdateDescuento(
      idNota: String!
      idProduct: String!
      discountAsk: Float!
      online: Boolean!
    ): GeneralResponse!
    posSalesUpdateRemoveProduct(
      idNota: String!
      idProduct: String!
      cliente: String!
      cupon: Boolean
      online: Boolean!
    ): GeneralResponse!
    posSalesDiscount(
      idNota: String!
      idProduct: String!
      precioAnterior: Float!
      precioNuevo: Float!
      cliente: String!
      cantidad: Float!
      cupon: Boolean
      type: Boolean!
      online: Boolean!
    ): GeneralResponse!
    posSalesUpdateCupon(
      idNota: String!
      cliente: String!
      cupon: Boolean!
      online: Boolean!
    ): GeneralResponse!
    posSalesSetCredito(
      instance: String!
      token: String!
      idNota: String!
      online: Boolean!
    ): GeneralResponse!
    posSalesInsertPaymentEfectivo(
      instance: String!
      token: String!
      input: AddPagoPOSsalesEfectivo!
      saldo: Float!
      online: Boolean!
    ): GeneralResponse!
    posSalesInsertPaymentTarjeta(
      instance: String!
      token: String!
      input: AddPagoPOSsalesTarjeta!
      saldo: Float!
      online: Boolean!
    ): GeneralResponse!
  }
  type Query {
    posSalesCierreDelDia(fi: Date!, ff: Date!, online: Boolean!): CierreDia!
    posHistorial(
      fechaInicio: Date!
      fechaFinal: Date!
      modelo: String!
      cliente: String!
      online: Boolean!
    ): [POS]
    posClientesDeuda(online: Boolean!): [ClienteDeuda!]
    posDevolucionCliente(idCliente: String!, online: Boolean!): [POS]
    posNota(idNota: String!, online: Boolean!): POS!
    posModeloTelaSearch(modelo: String, online: Boolean!): [TelaPOSsearch]
    posCambioDePrecio(online: Boolean!): [CambioPrecio]
  }
`;
