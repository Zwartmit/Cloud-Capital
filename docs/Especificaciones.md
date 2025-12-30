Asunto: Especificaciones de lógica de negocio y flujo de inversión - Cloud Capital

1. Cobro Automatizado de Comisión de los planes
   Funcionalidad: El sistema debe cobrar la comisión del plan activo una sola vez (ya que el plan vence luego de 30 dias de haberse suscrito a este, luego tiene opción a resuscribirse al mismo plan pagando la comisión de aquel plan o a un superior si tiene el capital minimo). Se debe priorizar el cobro de la comisión en el PROFIT, pero si no existe, se cobra la comisión del CAPITAL INICIAL
   •	El Fin: Asegurar que la plataforma reciba su comisión al inicio del contrato sin requerir pagos externos adicionales.
   •	Ejemplo: Si un plan tiene una comisión de $10 USD y el usuario tiene $0 en profit, el sistema descuenta los $10 USD del Capital Inicial. Si el usuario ya tuviera $20 USD en profit, los $10 USD se descuentan de ahí, manteniendo el capital íntegro.
   Se cobra la comisión del plan del profit, pero si no alcanza el valor, se toma desde el Capital inicial.
2. Escalabilidad del Capital y Tiempo de Estancia
   Funcionalidad: El Capital Inicial es dinámico. Si el usuario inyecta más fondos, la meta de beneficios se recalcula automáticamente. (Ya que la regla es que el contrato de la cuenta termina cuando el usuario obtenga en profit el doble de cantidad que tiene en capital inicial)
   NOTA: No importa si el usuario ah echo retiros antes de doblar el capital en el profit, el sistema debe calcular si la suma de todo el historial diario del profit es igual o superior AL DOBLE DE LA SUMA DE TODOS LOS DEPOSITOS.
   •	El Fin: Ajustar el tiempo mínimo de permanencia del capital de forma proporcional al monto invertido. A mayor capital, mayor es la meta para completar el ciclo.
   •	Ejemplo: Un usuario invierte $50 USD para obtener $100 USD de profit (el doble). A mitad del proceso, deposita otros $50 USD. El sistema ahora registra un Capital Inicial de $100 USD y actualiza la meta de profit a $200 USD. El tiempo de estancia se alarga hasta que se alcance este nuevo objetivo.
3. Trigger de Parada (Stop Profit al 200%)
   Funcionalidad: El sistema debe detener estrictamente la generación de ganancias (PROFIT)cuando el Profit alcance o supere el doble del Capital Inicial.
   •	El Fin: Finalizar el ciclo de inversión automáticamente una vez cumplida la promesa de rentabilidad, O SEA EL 200% DEL VALOR DEL CAPITAL (2x).
   •	Ejemplo: Si el Capital Inicial es de $100 USD, en cuanto el Profit llegue a $200 USD (o un poco más por el cierre de operaciones del día), la cuenta deja de generar saldo. El contrato se marca como "Completado".
4. Opción de Retiro Total (Cierre de Contrato)
   Funcionalidad: Al cumplir el ciclo, si el usuario decide retirar el 100% de sus ganancias, el sistema debe dar de baja el contrato actual.
   •	El Fin: Notificar formalmente al usuario que el ciclo ha terminado y que la plataforma ha cumplido con el retorno esperado.
   •	Ejemplo: El usuario ve un aviso de "Ciclo Completado". Al elegir retirar sus $200 USD de profit, el sistema procesa el retiro y resetea los estados de la cuenta MENOS EL HISTORIAL, informando que el contrato ha finalizado con éxito.
5. Reinversión y Renovación (Contrato Cero)
   Funcionalidad: Si el usuario decide reinvertir cualquier monto del profit ganado (MINIMO 50USDT), el sistema debe resetear la cuenta MENOS EL HISTORIAL y tratarlo como un nuevo comienzo.
   •	El Fin: Eliminar planes anteriores y obligar a una nueva configuración para iniciar un ciclo de duplicación desde cero.
   •	Ejemplo: El usuario tiene $200 USD de profit ganado. Elige reinvertir $50 USD. El sistema mueve esos $50 USD a Nuevo Capital Inicial, elimina el plan actual y cualquier plan activo, y le solicita elegir un plan nuevo para volver a operar. El contador de metas vuelve a empezar según este nuevo capital.
   Nota Adicional: Si el cliente no realiza ninguna acción al completar el ciclo (ni retira ni reinvierte), la cuenta debe permanecer bloqueada para generar profit hasta que elija una de las dos opciones anteriores mediante un aviso mandatorio al iniciar sesión.

   Validación de Depósitos BTC.
6. Validación en Blockchain: Ningún depósito debe rechazarse si ya cuenta con la confirmación de la red. Si el bloque lo aprobó, la orden debe proceder.
7. Confirmación del Monto: Antes de aprobar, el colaborador debe confirmar manualmente el monto exacto en USD que llegó a la wallet. El sistema acreditará únicamente la cifra que el colaborador valide y registre dentro del panel.
8. Proceso Técnico: La orden se completa editando el monto en el panel de colaborador y seleccionando "Aprobar" una vez verificado el valor recibido.
9. Restricción de Planes: Si el monto final confirmado es menor a 50 USD, el usuario no podrá aplicar a ningún plan de pago. El acceso a los planes se habilitará únicamente cuando el usuario complete la inversión mínima.
