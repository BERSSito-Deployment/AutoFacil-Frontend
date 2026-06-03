// Glosario de terminos tecnicos financieros usado por el componente AyudaTooltip.
// Las claves se usan como identificador de busqueda; los textos son la explicacion
// que ve el usuario, redactada de forma simple y con la ortografia correcta.

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
    "Dispositivo de rastreo satelital que la entidad suele exigir instalar en el vehículo financiado. La instalación es un cargo único que se cobra al desembolso y el mantenimiento es mensual (va en la cuota); ambos forman parte de la TCEA. La reposición (ante pérdida o reemplazo) es un tarifario referencial: no se cobra al contratar ni afecta la TCEA.",
  "Cuota balon":
    "Cuota final del producto Compra Inteligente: una parte del valor del vehículo (su valor futuro) se difiere al final del crédito. Reduce las cuotas mensuales, pero al término del plazo se paga esa cuota balón en un solo desembolso.",
  "Gastos iniciales":
    "Gastos del inicio de la operación que se financian (por ejemplo registro de prenda, notariales, registrales y tasación): se suman al monto financiado y se pagan dentro de las cuotas.",
  "Seguro vehicular":
    "Seguro mensual que cubre daños o pérdida del vehículo durante el financiamiento. Se incluye en cada cuota y forma parte de la TCEA.",
  "Tasa nominal":
    "Tasa de interés anual que no incorpora el efecto de la capitalización en su valor.",
  "Tasa efectiva":
    "Tasa de interés que ya incorpora el efecto de la capitalización en el período indicado.",
  "Cuota inicial":
    "Monto que paga el cliente al inicio; reduce el monto que se financia con el crédito.",
  "Monto financiado":
    "Importe que efectivamente se presta: precio del vehículo menos la cuota inicial, más los gastos iniciales que se financian.",
  "Costo total del credito":
    "Total que paga el cliente por el crédito: capital financiado más intereses, seguros y GPS. No incluye la cuota inicial.",
};
