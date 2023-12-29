export const tallas = [
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "22", label: "22" },
  { value: "24", label: "24" },
  { value: "26", label: "26" },
  { value: "28", label: "28" },
  { value: "30", label: "30" },
  { value: "32", label: "32" },
  { value: "34", label: "34" },
  { value: "36", label: "36" },
  { value: "38", label: "38" },
  { value: "40", label: "40" },
  { value: "42", label: "42" },
  { value: "00", label: "00" },
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "3", label: "3" },
  { value: "5", label: "5" },
  { value: "7", label: "7" },
  { value: "9", label: "9" },
  { value: "11", label: "11" },
  { value: "13", label: "13" },
  { value: "15", label: "15" },
  { value: "17", label: "17" },
];
export const estados = [
  { label: "Aguascalientes", value: "AGU" },
  { label: "Baja California", value: "BCN" },
  { label: "Baja California Sur", value: "BCS" },
  { label: "Campeche", value: "CAM" },
  { label: "Chiapas", value: "CHP" },
  { label: "Chihuahua", value: "CHH" },
  { label: "Ciudad de México", value: "DIF" },
  { label: "Coahuila", value: "COA" },
  { label: "Colima", value: "COL" },
  { label: "Durango", value: "DUR" },
  { label: "Estado de México", value: "MEX" },
  { label: "Guanajuato", value: "GUA" },
  { label: "Guerrero", value: "GRO" },
  { label: "Hidalgo", value: "HID" },
  { label: "Jalisco", value: "JAL" },
  { label: "Michoacán", value: "MIC" },
  { label: "Morelos", value: "MOR" },
  { label: "Nayarit", value: "NAY" },
  { label: "Nuevo León", value: "NLE" },
  { label: "Oaxaca", value: "OAX" },
  { label: "Puebla", value: "PUE" },
  { label: "Querétaro", value: "QUE" },
  { label: "Quintana Roo", value: "ROO" },
  { label: "San Luis Potosí", value: "SLP" },
  { label: "Sinaloa", value: "SIN" },
  { label: "Sonora", value: "SON" },
  { label: "Tabasco", value: "TAB" },
  { label: "Tamaulipas", value: "TAM" },
  { label: "Tlaxcala", value: "TLA" },
  { label: "Veracruz", value: "VER" },
  { label: "Yucatán", value: "YUC" },
  { label: "Zacatecas", value: "ZAC" },
  { label: "NA", value: "NA" },
];
export const motivoCancelacion = [
  { value: "01", label: "Comprobante emitido con errores con relacion" },
  { value: "02", label: "Comprobante emitido con errores sin relacion" },
  { value: "03", label: "No se llevó a cabo la operacion" },
  {
    value: "04",
    label: "Operación nominativa relacionada en la factura global",
  },
];
export const colores = [
  { value: "Azul", label: "Azul" },
  { value: "Amarillo", label: "Amarillo" },
  { value: "Blanco", label: "Blanco" },
  { value: "Cafe", label: "Cafe" },
  { value: "Estampado", label: "Estampado" },
  { value: "Estampado Digital", label: "Estampado Digital" },
  { value: "Gris", label: "Gris" },
  { value: "Morado", label: "Morado" },
  { value: "Naranja", label: "Naranja" },
  { value: "Negro", label: "Negro" },
  { value: "Rojo", label: "Rojo" },
  { value: "Rosa", label: "Rosa" },
  { value: "Verde", label: "Verde" },
];
export const empresaOption = [
  { value: "Sterling", label: "Sterling" },
  { value: "Uniformes", label: "Uniformes" },
  { value: "Proveedor", label: "Proveedor" },
];
export const estatusProdOption = [
  { value: "Web", label: "Web" },
  { value: "En Venta", label: "En Venta" },
  { value: "En Produccion", label: "En Produccion" },
  { value: "Expo", label: "Expo" },
  { value: "Inactivo", label: "Inactivo" },
];
export const regimenFiscal = [
  { value: "601", label: "General de Ley Personas Morales" },
  { value: "603", label: "Personas Morales con Fines no Lucrativos" },
  {
    value: "605",
    label: "Sueldos y Salarios e Ingresos Asimilados a Salarios",
  },
  { value: "606", label: "Arrendamiento" },
  { value: "608", label: "Demás ingresos" },
  { value: "609", label: "Consolidación" },
  {
    value: "610",
    label:
      "Residentes en el Extranjero sin Establecimiento Permanente en México",
  },
  { value: "611", label: "Ingresos por Dividendos (socios y accionistas)" },
  {
    value: "612",
    label: "Personas Físicas con Actividades Empresariales y Profesionales",
  },
  { value: "614", label: "Ingresos por intereses" },
  { value: "616", label: "Sin obligaciones fiscales" },
  {
    value: "620",
    label:
      "Sociedades Cooperativas de Producción que optan por diferir sus ingresos",
  },
  { value: "621", label: "Incorporación Fiscal" },
  {
    value: "622",
    label: "Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras",
  },
  { value: "623", label: "Opcional para Grupos de Sociedades" },
  { value: "624", label: "Coordinados" },
  { value: "628", label: "Hidrocarburos" },
  { value: "607", label: "Régimen de Enajenación o Adquisición de Bienes" },
  {
    value: "629",
    label:
      "De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales",
  },
  { value: "630", label: "Enajenación de acciones en bolsa de valores" },
  { value: "615", label: "Régimen de los ingresos por obtención de premios" },
  {
    value: "625",
    label:
      "Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas",
  },
  { value: "626", label: "Régimen Simplificado de Confianza" },
];
export const tallaOption = [
  { value: "SI", label: "SI" },
  { value: "NO", label: "NO" },
  { value: "Pantalon", label: "Pantalon" },
  { value: "PantalonM", label: "PantalonM" },
];
export const tipoAsistencia = [
  { value: "asistencia", label: "Asistencia" },
  { value: "Falta", label: "Falta" },
  { value: "Comida", label: "Comida" },
  { value: "Regreso Comida", label: "Regreso Comida" },
  { value: "Salida", label: "Salida" },
];

export const tipoFalta = [
  { value: "Asunto Familiar", label: "Asunto Familiar" },
  { value: "Asunto Personal", label: "Asunto Personal" },
  { value: "Enfermedad", label: "Enfermedad" },
  { value: "Vacaciones", label: "Vacaciones" },
  { value: "Otro", label: "Otro" },
];
export const estatusPedidos = [
  { value: "En Creación", label: "En Creación" },
  { value: "Por Surtir", label: "Por Surtir" },
  { value: "Surtido Parcial", label: "Surtido Parcial" },
  { value: "Cancelado", label: "Cancelado" },
  { value: "Incompleto", label: "Incompleto" },
  { value: "Completo", label: "Completo" },
];
export const tipoPedidos = [
  { value: "Expo", label: "Expo" },
  { value: "Rutas", label: "Rutas" },
  { value: "Redes", label: "Redes" },
  { value: "Tienda", label: "Tienda" },
];
export const tarjetaOption = [
  { value: "Credito", label: "Credito" },
  { value: "Debito", label: "Debito" },
];
export const tiposTelas = [
  { value: "LISO", label: "LISO" },
  { value: "Estampado", label: "Estampado" },
  { value: "Estampado Digital", label: "Estampado Digital" },
];
export const clienteType = [
  { value: "Expo", label: "Expo" },
  { value: "Tienda", label: "Tienda" },
  { value: "RedesSociales", label: "RedesSociales" },
  { value: "Rutas", label: "Rutas" },
  { value: "Departamentales", label: "Departamentales" },
];
export const facturadores = [
  { value: "Ormen", label: "Ormen" },
  { value: "Lalito", label: "Lalito" },
  { value: "Brandon", label: "Brandon" },
  { value: "Margarita", label: "Margarita" },
];
export const estatusEnvios = [
  { value: "En Elaboracion", label: "En Elaboracion" },
  { value: "Pago Iniciado", label: "Pago Iniciado" },
  { value: "Esperando Pago OXXO", label: "Esperando Pago OXXO" },
  { value: "Esperando Recoleccion", label: "Esperando Recoleccion" },
  { value: "Recolectado", label: "Recolectado" },
  { value: "En Ruta", label: "En Ruta" },
  { value: "Recibido", label: "Recibido" },
  { value: "ComisionPagada", label: "ComisionPagada" },
  { value: "Cancelado", label: "Cancelado" },
  { value: "Credito", label: "Credito" },
];
export const empresasOpt = [
  { value: "General", label: "General" },
  { value: "Familia Orozco", label: "Familia Orozco" },
  { value: "Sterling", label: "Sterling" },
  // { value: "Icky Bunny", label: "Icky Bunny" },
  // { value: "Telas", label: "Telas" },
  { value: "Plasma", label: "Plasma" },
  { value: "Uniformes", label: "Uniformes" },
  { value: "Cuentas Viejas", label: "Cuentas Viejas" },
];

export const payment_formOptions = [
  { value: "01", label: "Efectivo" },
  { value: "02", label: "Cheque nominativo" },
  { value: "03", label: "Transferencia electrónica de fondos" },
  { value: "04", label: "Tarjeta de crédito" },
  { value: "05", label: "Monedero electrónico" },
  { value: "06", label: "Dinero electrónico" },
  { value: "08", label: "Vales de despensa" },
  { value: "12", label: "Dación en pago" },
  { value: "13", label: "Pago por subrogación" },
  { value: "14", label: "Pago por consignación" },
  { value: "15", label: "Condonación" },
  { value: "17", label: "Compensación" },
  { value: "23", label: "Novación" },
  { value: "24", label: "Confusión" },
  { value: "25", label: "Remisión de deuda" },
  { value: "26", label: "Prescripción o caducidad" },
  { value: "27", label: "A satisfacción del acreedor" },
  { value: "28", label: "Tarjeta de débito" },
  { value: "29", label: "Tarjeta de servicios" },
  { value: "30", label: "Aplicación de anticipos" },
  { value: "31", label: "Intermediario pagos" },
  { value: "99", label: "Por definir" },
];
export const payment_methodOptions = [
  { value: "PUE", label: "PUE" },
  { value: "PPD", label: "PPD" },
];
export const useOptions = [
  { value: "G01", label: "Adquisición de mercancias" },
  { value: "G02", label: "Devoluciones, descuentos o bonificaciones" },
  { value: "G03", label: "Gastos en general" },
  { value: "I01", label: "Construcciones" },
  { value: "I02", label: "Mobilario y equipo de oficina por inversiones" },
  { value: "I03", label: "Equipo de transporte" },
  { value: "I04", label: "Equipo de computo y accesorios" },
  { value: "I05", label: "Dados, troqueles, moldes, matrices y herramental" },
  { value: "I06", label: "Comunicaciones telefónicas" },
  { value: "I07", label: "Comunicaciones satelitales" },
  { value: "I08", label: "Otra maquinaria y equipo" },
  {
    value: "D01",
    label: "Honorarios médicos, dentales y gastos hospitalarios",
  },
  { value: "D02", label: "Gastos médicos por incapacidad o discapacidad" },
  { value: "D03", label: "Gastos funerales" },
  { value: "D04", label: "Donativos" },
  {
    value: "D05",
    label:
      "Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)",
  },
  { value: "D06", label: "Aportaciones voluntarias al SAR" },
  { value: "D07", label: "Primas por seguros de gastos médicos" },
  { value: "D08", label: "Gastos de transportación escolar obligatoria" },
  {
    value: "D09",
    label:
      "Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones",
  },
  { value: "D10", label: "Pagos por servicios educativos (colegiaturas)" },
  { value: "P01", label: "Por definir" },
  { value: "S01", label: "Sin efectos fiscales" },
];
export const unitOptions = [
  { value: "H87", label: "Pieza" },
  { value: "EA", label: "Elemento" },
  { value: "E48", label: "Unidad de Servicio" },
  { value: "ACT", label: "Actividad" },
  { value: "KGM", label: "Kilogramo" },
  { value: "E51", label: "Trabajo" },
  { value: "A9", label: "Tarifa" },
  { value: "MTR", label: "Metro" },
  { value: "AB", label: "Paquete a granel" },
  { value: "BB", label: "Caja base" },
  { value: "KT", label: "Kit" },
  { value: "SET", label: "Conjunto" },
  { value: "LTR", label: "Litro" },
  { value: "XBX", label: "Caja" },
  { value: "MON", label: "Mes" },
  { value: "HUR", label: "Hora" },
  { value: "MTK", label: "Metro cuadrado" },
  { value: "11", label: "Equipos" },
  { value: "MGM", label: "Miligramo" },
  { value: "XPK", label: "Paquete" },
  { value: "XKI", label: "Kit (Conjunto de piezas)" },
  { value: "AS", label: "Variedad" },
  { value: "GRM", label: "Gramo" },
  { value: "PR", label: "Par" },
  { value: "DPC", label: "Docenas de piezas" },
  { value: "xun", label: "Unidad" },
  { value: "DAY", label: "Día" },
  { value: "XLT", label: "Lote" },
  { value: "10", label: "Grupos" },
  { value: "MLT", label: "Mililitro" },
  { value: "E54", label: "Viaje" },
];
export const recurrenciaOptions = [
  { value: 1, unit: "days", label: "Diario" },
  { value: 7, unit: "days", label: "Semanal" },
  { value: 14, unit: "days", label: "Quincenal" },
  { value: 1, unit: "months", label: "Mensual" },
  { value: 2, unit: "months", label: "Bimestral" },
  { value: 3, unit: "months", label: "Trimestral" },
  { value: 6, unit: "months", label: "Semestre" },
  { value: 1, unit: "years", label: "Anual" },
];
export const temporadas = [
  { value: "A TEMPORAL", label: "A TEMPORAL" },
  { value: "PRIMAVERA", label: "PRIMAVERA" },
  { value: "VERANO", label: "VERANO" },
  { value: "SEMANA SANTA", label: "SEMANA SANTA" },
  { value: "SALIDA DE CLASES", label: "SALIDA DE CLASES" },
  { value: "OTONO", label: "OTONO" },
  { value: "INVIERNO", label: "INVIERNO" },
  { value: "EVENTO", label: "EVENTO" },
];
export const tejidos = [
  { value: "PUNTO", label: "PUNTO" },
  { value: "PLANO", label: "PLANO" },
  { value: "AMBOS", label: "AMBOS" },
];
export const cuerpos = [
  { value: "CON CAIDA", label: "CON CAIDA" },
  { value: "SIN CAIDA", label: "SIN CAIDA" },
];
export const costuras = [
  { value: "DELICADA", label: "DELICADA" },
  { value: "NORMAL", label: "NORMAL" },
  { value: "COMPLICADA", label: "COMPLICADA" },
];
export const stretches = [
  { value: "CON STRETCH", label: "CON STRETCH" },
  { value: "SIN STRETCH", label: "SIN STRETCH" },
  { value: "AMBOS", label: "AMBOS" },
];
