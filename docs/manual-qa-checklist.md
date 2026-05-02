# Checklist manual de QA — Dashboard Nu Bank

Usar este checklist después de cambios en parser, persistencia, filtros, backup o UI.

## Flujo de importación

- [ ] Cargar un PDF de febrero y verificar que se rendericen movimientos.
- [ ] Cargar un PDF de marzo y verificar que febrero no se borre.
- [ ] Reimportar el PDF de febrero y verificar que no se dupliquen movimientos.
- [ ] Cargar un archivo no PDF y verificar que sea rechazado sin perder datos previos.
- [ ] Cargar un PDF sin texto embebido y verificar el fallback OCR.

## Categorías

- [ ] Cambiar una categoría manualmente desde la tabla.
- [ ] Aplicar la categoría a movimientos similares cuando el modal lo solicite.
- [ ] Guardar una regla aprendida.
- [ ] Recargar el navegador y verificar que la regla aprendida se conserve.
- [ ] Eliminar una regla aprendida y verificar que desaparezca del panel.

## Filtros y tabla

- [ ] Filtrar por mes.
- [ ] Filtrar por archivo.
- [ ] Filtrar por tipo.
- [ ] Filtrar por categoría.
- [ ] Buscar por descripción ignorando mayúsculas y tildes.
- [ ] Cambiar filas por página a 5, 10, 50 y 100.
- [ ] Ordenar por fecha, tipo y monto.

## Archivos procesados

- [ ] Eliminar un archivo procesado.
- [ ] Verificar que los movimientos exclusivos de ese archivo se eliminen.
- [ ] Verificar que movimientos compartidos por otro archivo se conserven.

## Exportación y backup

- [ ] Exportar CSV filtrado.
- [ ] Abrir el CSV y verificar columnas, montos y textos con caracteres especiales.
- [ ] Exportar backup JSON.
- [ ] Eliminar datos guardados.
- [ ] Restaurar backup JSON.
- [ ] Verificar que movimientos, reglas aprendidas y exclusiones recurrentes se recuperen.

## Gastos recurrentes

- [ ] Cargar al menos dos meses con un gasto repetido.
- [ ] Verificar que aparezca como recurrente.
- [ ] Excluir el gasto recurrente.
- [ ] Verificar que se actualice gastos fijos vs variables.
- [ ] Restaurar la exclusión.

## Persistencia

- [ ] Recargar la página y verificar que los datos sigan cargados.
- [ ] Ejecutar la app en modo incógnito y verificar comportamiento sin datos previos.
- [ ] Eliminar datos guardados y verificar que el dashboard quede vacío.

## Diagnóstico

- [ ] Revisar el panel visible "Diagnóstico de importación" después de importar un PDF.
- [ ] Confirmar que muestre líneas leídas, candidatos, movimientos parseados, válidos, descartes y errores.
- [ ] Confirmar que el estado sea de éxito cuando todos los movimientos sean válidos.
- [ ] Confirmar que el estado sea de advertencia cuando haya descartes, errores o fallo de almacenamiento.
- [ ] Revisar el panel debug después de importar un PDF.
- [ ] Confirmar que muestre líneas legibles, movimientos detectados, válidos y descartados.
- [ ] Confirmar que muestre diagnóstico avanzado del parser.
