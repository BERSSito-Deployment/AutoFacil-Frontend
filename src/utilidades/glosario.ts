// Glosario de terminos para los tooltips de ayuda.

export const GLOSARIO: Record<string, string> = {
  TEA: "Tasa Efectiva Anual: tasa de interés que ya considera la capitalización de los intereses durante el año.",
  TEM: "Tasa Efectiva Mensual: tasa de interés mensual equivalente que se aplica al saldo en cada período del cronograma.",
  TNA: "Tasa Nominal Anual: tasa anual que no incluye el efecto de la capitalización; requiere indicar cada cuánto se capitaliza.",
  TCEA:
    "Tasa de Costo Efectivo Anual: representa el costo total anual del crédito, incluyendo intereses, seguros y gastos.",
  VAN:
    "Valor Actual Neto: suma de los flujos del crédito traídos a valor presente con el COK; ayuda a medir el costo financiero actualizado de la operación.",
  TIR:
    "Tasa Interna de Retorno: tasa que hace que el VAN sea igual a cero; desde el punto de vista del deudor refleja el costo efectivo del financiamiento.",
  COK:
    "Costo de Oportunidad del Capital: rendimiento mínimo que el deudor esperaría de un uso alternativo de su dinero; se usa para descontar los flujos en el VAN.",
  "Sistema frances":
    "Método de amortización con cuota constante; al inicio se paga más interés y menos capital, y con el tiempo se invierte la proporción.",
  "Gracia total":
    "Período inicial en el que no se paga capital ni intereses; los intereses se capitalizan y aumentan el saldo deudor.",
  "Gracia parcial":
    "Período inicial en el que solo se pagan los intereses del período, sin amortizar capital; el saldo se mantiene igual.",
  Amortizacion:
    "Parte de la cuota que reduce el capital o saldo pendiente del préstamo.",
  "Saldo insoluto":
    "Capital del préstamo que aún no ha sido pagado; sobre él se calculan los intereses de cada período.",
  "Seguro de desgravamen":
    "Seguro que cubre la deuda en caso de fallecimiento o invalidez del titular; suele calcularse sobre el saldo pendiente.",
  Capitalizacion:
    "Frecuencia con la que los intereses se suman al capital para generar nuevos intereses (diaria, mensual, etc.).",
  GPS:
    "Costo periódico (mensual) del dispositivo de rastreo satelital que la entidad instala en el vehículo financiado. Se cobra en cada cuota y forma parte de la TCEA.",
  "Cuota balon":
    "Cuota final (cuotón) del producto Compra Inteligente: una parte del precio (40% en el Plan 36, 50% en el Plan 24) se difiere y se paga en un solo desembolso al final del crédito (periodo N+1). Reduce las cuotas mensuales.",
  "Gastos iniciales":
    "Costos del inicio de la operación (notariales, registrales, tasación, comisiones). Cada uno puede financiarse (se suma al préstamo y se paga en las cuotas) o pagarse al contado.",
  "Seguro vehicular":
    "Seguro contra todo riesgo, expresado como porcentaje anual del precio del vehículo. Se prorratea por cuota y forma parte de la TCEA.",
  "Tasa nominal":
    "Tasa de interés anual que no incorpora el efecto de la capitalización en su valor.",
  "Tasa efectiva":
    "Tasa de interés que ya incorpora el efecto de la capitalización en el período indicado.",
  "Cuota inicial":
    "Monto que pagas al inicio; reduce el monto que se financia con el crédito.",
  "Monto financiado":
    "Monto del préstamo: precio del vehículo menos la cuota inicial, más los costos iniciales que se financian.",
  "Costo total del credito":
    "Total que pagas en las cuotas mensuales y el cuotón final (incluye capital, intereses, seguros y cargos). No incluye la cuota inicial.",
};
