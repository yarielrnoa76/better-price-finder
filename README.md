# Better Price Finder

Panel de control para rastrear precios de productos en Amazon usando n8n + SerpAPI.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router v6
- Google Sheets API (con mock data integrado)
- n8n Webhook integration

## Inicio rápido

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Configuración

1. Copia `.env.example` a `.env`
2. Configura las variables según tu entorno:

| Variable | Descripción |
|---|---|
| `VITE_USE_MOCK_DATA` | `true` para usar datos de prueba sin Google credentials |
| `VITE_N8N_WEBHOOK_URL` | URL del webhook en tu workflow de n8n |
| `VITE_GOOGLE_SHEETS_API_KEY` | API Key de Google Cloud Console |
| `VITE_GOOGLE_PRODUCTS_SHEET_ID` | ID del Google Sheet de Products |
| `VITE_GOOGLE_PROCESS_HISTORY_SHEET_ID` | ID del Google Sheet de ProcessHistory |
| `VITE_GOOGLE_PRICES_HISTORY_SHEET_ID` | ID del Google Sheet de PricesHistory |

## Lógica de negocio

| ResultType | Condición | Email | PricesHistory | Estado producto |
|---|---|---|---|---|
| `DESIRED_MATCH` | `price <= target` | ✅ | ✅ | `FOUND` |
| `ABOVE_TARGET` | `price > target` | ❌ | ❌ | `ACTIVE` |
| `BEST_PROPOSAL` | 3 intentos sin éxito | ❌ | ❌ | `BEST_PROPOSAL` |
| `NOT_FOUND` | Sin resultados | ❌ | ❌ | `ACTIVE` |

## Pantallas

- **Dashboard** — resumen general y últimas búsquedas
- **Products** — tabla completa con acciones (editar, pausar, buscar)
- **Product Detail** — historial de búsquedas y precios por producto
- **History** — todos los registros de ProcessHistory con filtros
- **Settings** — configuración de variables de entorno

## Payload n8n

```json
{
  "ProductId": "P-001",
  "ProductName": "ThinkPad P16 Gen 2",
  "AmazonASIN": "B0GXWVLXQK",
  "TargetPrice": 3400,
  "ManualRun": true
}
```
