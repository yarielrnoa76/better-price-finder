# Better Price Finder - Claude Instructions

Trabaja conmigo en español, pero mantén código, variables, nombres de columnas, funciones y estructuras técnicas en inglés.

Antes de modificar archivos:

1. Explica qué archivo vas a tocar.
2. Explica por qué.
3. Haz cambios pequeños.
4. Al terminar, muestra resumen y pruebas sugeridas.

Reglas:

- No crear nuevos Google Sheets salvo instrucción explícita.
- Usar ProcessHistory como historial principal.
- Si hay ASIN especificado, buscar únicamente productos relacionados con ese ASIN.
- Si no hay ASIN, buscar productos similares que cumplan TargetPrice.
- Si después de 3 búsquedas no se encuentra TargetPrice, guardar el precio más bajo encontrado como BEST_PROPOSAL.
- BEST_PROPOSAL no es caso exitoso.
- No enviar email para BEST_PROPOSAL salvo instrucción explícita.
- No exponer tokens, API keys ni credenciales.
- Mantener JSON válido y compatible con n8n.
