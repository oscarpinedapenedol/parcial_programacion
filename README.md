# TiendaAPI

## Endpoints de pedidos

| Método | Ruta | Acción | Código de éxito | Códigos de error |
|---|---|---|---|---|
| POST | /api/v1/pedidos | Crear un pedido | 201 | 400, 422 |
| GET | /api/v1/pedidos | Listar pedidos | 200 | 400 |
| GET | /api/v1/pedidos/{id} | Ver un pedido | 200 | 400, 404 |
| PATCH | /api/v1/pedidos/{id} | Cambiar estado | 200 | 400, 404 |

## Resultados de pruebas

| # | Petición | Cuerpo o detalle | Código esperado | Resultado obtenido |
|---|---|---|---|---|
| 1 | POST /api/v1/pedidos | 2 zapatillas, 1 camiseta | 201 | 201 Created |
| 2 | GET /api/v1/productos/1 | El stock bajó 2 unidades | 200 | 200 OK |
| 3 | POST /api/v1/pedidos | Cuerpo sin el bloque "cliente" | 400 | 400 |
| 4 | POST /api/v1/pedidos | `"items": []` | 400 | 400 |
| 5 | POST /api/v1/pedidos | `"cantidad": -1` | 400 | 400 |
| 6 | POST /api/v1/pedidos | `"producto_id": 9999` | 422 | 422 |
| 7 | POST /api/v1/pedidos | Producto 1 (cant 1) y producto 9 (cant 50) | 422 | 422 |
| 8 | GET /api/v1/productos/1 | El stock no cambió tras la prueba 7 | 200 | 200 OK |
| 9 | GET /api/v1/pedidos?estado=pendiente | Incluye el pedido de la prueba 1 | 200 | 200 |
| 10 | GET /api/v1/pedidos/9999 | Pedido inexistente | 404 | 404 |
| 11 | PATCH /api/v1/pedidos/1 | `{ "estado": "pagado" }` | 200 | 200 |
| 12 | PATCH /api/v1/pedidos/1 | `{ "estado": "perdido" }` | 400 | 400 |