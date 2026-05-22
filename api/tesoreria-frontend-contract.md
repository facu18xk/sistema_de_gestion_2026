# Tesoreria y Bancos - Frontend Contract

This document summarizes the backend surface available for the frontend after the Tesoreria y Bancos backend pass.

Base API path: `/api`

All standard CRUD controllers follow the same pagination shape already used in the project:

```http
GET /api/{Controller}?page=1&pageSize=10
GET /api/{Controller}/{id}
POST /api/{Controller}
PUT /api/{Controller}/{id}
DELETE /api/{Controller}/{id}
```

`GET` list responses return `PagedResultDto<T>`:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 10,
  "totalCount": 0,
  "totalPages": 0,
  "hasPreviousPage": false,
  "hasNextPage": false
}
```

## Swagger

The module is available in Swagger as:

```text
tesoreria
```

## Reference Data

These records are seeded by the migration.

### TiposCuentasBancarias

Endpoint:

```http
/api/TiposCuentasBancarias
```

Seed values:

```text
1 - Corriente
2 - Ahorro
```

Upsert payload:

```json
{
  "nombre": "Corriente"
}
```

### TiposMovimientosBancarios

Endpoint:

```http
/api/TiposMovimientosBancarios
```

Seed values:

```text
1 - Débito
2 - Crédito
```

Upsert payload:

```json
{
  "nombre": "Débito"
}
```

### TiposDepositosBancarios

Endpoint:

```http
/api/TiposDepositosBancarios
```

Seed values:

```text
1 - Efectivo
2 - Cheque mismo banco
3 - Cheque terceros
```

Upsert payload:

```json
{
  "nombre": "Efectivo"
}
```

## Bancos

Endpoint:

```http
/api/Bancos
```

Read fields:

```json
{
  "idBanco": 1,
  "nombre": "Banco Nacional",
  "activo": true
}
```

Upsert payload:

```json
{
  "nombre": "Banco Nacional",
  "activo": true
}
```

## Cuentas Bancarias

Endpoint:

```http
/api/CuentasBancarias
```

Read fields:

```json
{
  "idCuentaBancaria": 1,
  "idBanco": 1,
  "banco": "Banco Nacional",
  "idTipoCuentaBancaria": 1,
  "tipoCuentaBancaria": "Corriente",
  "idCuentaContable": 10,
  "cuentaContable": "Banco Cuenta Corriente",
  "numeroCuenta": "001-123456-7",
  "moneda": "PYG",
  "saldo": 1000000,
  "saldoDisponible": 1000000,
  "activa": true
}
```

Upsert payload:

```json
{
  "idBanco": 1,
  "idTipoCuentaBancaria": 1,
  "idCuentaContable": 10,
  "numeroCuenta": "001-123456-7",
  "moneda": "PYG",
  "saldo": 1000000,
  "saldoDisponible": 1000000,
  "activa": true
}
```

Notes:

- `idCuentaContable` is optional, but should be provided when possible so automatic accounting can credit the correct bank account.
- `saldo` is the accounting/current bank balance.
- `saldoDisponible` is the available balance.

## Movimientos Bancarios

Endpoint:

```http
/api/MovimientosBancarios
```

Read fields:

```json
{
  "idMovimientoBancario": 1,
  "idCuentaBancaria": 1,
  "cuentaBancaria": "001-123456-7",
  "idTipoMovimientoBancario": 1,
  "tipoMovimientoBancario": "Débito",
  "idEstado": null,
  "estado": "",
  "idOrdenMedioPagoCompra": null,
  "idChequeEmitido": null,
  "fecha": "2026-05-22T10:30:00",
  "monto": 250000,
  "concepto": "Pago a proveedor",
  "referencia": "TRX-001"
}
```

Upsert payload:

```json
{
  "idCuentaBancaria": 1,
  "idTipoMovimientoBancario": 1,
  "idEstado": null,
  "fecha": "2026-05-22T10:30:00",
  "monto": 250000,
  "concepto": "Pago a proveedor",
  "referencia": "TRX-001"
}
```

Balance rules:

- `Débito` subtracts from `saldo` and `saldoDisponible`.
- `Crédito` adds to `saldo` and `saldoDisponible`.

## Cheques Emitidos

Endpoint:

```http
/api/ChequesEmitidos
```

Read fields:

```json
{
  "idChequeEmitido": 1,
  "idCuentaBancaria": 1,
  "cuentaBancaria": "001-123456-7",
  "idOrdenMedioPagoCompra": 5,
  "idMovimientoBancario": 12,
  "numeroCheque": "000123",
  "beneficiario": "Proveedor SA",
  "fechaEmision": "2026-05-22T10:30:00",
  "fechaPago": null,
  "monto": 250000,
  "estado": "Emitido"
}
```

Upsert payload:

```json
{
  "idCuentaBancaria": 1,
  "idOrdenMedioPagoCompra": null,
  "idMovimientoBancario": null,
  "numeroCheque": "000123",
  "beneficiario": "Proveedor SA",
  "fechaEmision": "2026-05-22T10:30:00",
  "fechaPago": null,
  "monto": 250000,
  "estado": "Emitido"
}
```

Action endpoint:

```http
POST /api/ChequesEmitidos/{id}/conciliar
```

Payload:

```json
{
  "fechaPago": "2026-05-25T09:00:00"
}
```

Behavior:

- Sets `fechaPago`.
- Sets `estado` to `Pagado`.
- Subtracts the cheque amount from `saldoDisponible`.
- Returns `400` if the cheque was already reconciled.

## Depositos Bancarios

Endpoint:

```http
/api/DepositosBancarios
```

Read fields:

```json
{
  "idDepositoBancario": 1,
  "idCuentaBancaria": 1,
  "cuentaBancaria": "001-123456-7",
  "idTipoDepositoBancario": 1,
  "tipoDepositoBancario": "Efectivo",
  "idMovimientoBancario": 20,
  "fecha": "2026-05-22T10:30:00",
  "monto": 500000,
  "concepto": "Deposito de caja",
  "estado": "Confirmado"
}
```

Upsert payload:

```json
{
  "idCuentaBancaria": 1,
  "idTipoDepositoBancario": 1,
  "fecha": "2026-05-22T10:30:00",
  "monto": 500000,
  "concepto": "Deposito de caja"
}
```

Behavior:

- `Efectivo` and `Cheque mismo banco`: create credit movement and add to `saldo` and `saldoDisponible`; deposit state becomes `Confirmado`.
- `Cheque terceros`: create credit movement and add to `saldo` only; deposit state becomes `Pendiente`.

Action endpoints:

```http
POST /api/DepositosBancarios/{id}/confirmar
POST /api/DepositosBancarios/{id}/rechazar
```

Confirm behavior:

- Adds the deposit amount to `saldoDisponible`.
- Sets state to `Confirmado`.

Reject behavior:

- Sets state to `Rechazado`.
- Creates a reversing debit movement against `saldo`.
- Does not subtract from `saldoDisponible`.

## Deposit Detail Tables

These are available as regular CRUD endpoints for storing deposit composition/detail data.

### DetallesDepositosBancarios

Endpoint:

```http
/api/DetallesDepositosBancarios
```

Upsert payload:

```json
{
  "idDepositoBancario": 1,
  "monto": 500000,
  "descripcion": "Efectivo"
}
```

### ChequesMismoBanco

Endpoint:

```http
/api/ChequesMismoBanco
```

Upsert payload:

```json
{
  "idDepositoBancario": 1,
  "numeroCheque": "000456",
  "librador": "Cliente SA",
  "fechaEmision": "2026-05-22T10:30:00",
  "monto": 300000
}
```

### ChequesTerceros

Endpoint:

```http
/api/ChequesTerceros
```

Upsert payload:

```json
{
  "idDepositoBancario": 1,
  "bancoEmisor": "Banco Externo",
  "numeroCheque": "000789",
  "librador": "Cliente SA",
  "fechaEmision": "2026-05-22T10:30:00",
  "monto": 300000,
  "estado": "Pendiente"
}
```

## Supplier Payment Integration

Existing endpoint:

```http
/api/OrdenesMediosPagosCompras
```

The upsert payload now accepts optional treasury fields:

```json
{
  "idOrdenMedioPagoCompra": 0,
  "idOrdenPagoCompra": 1,
  "idMedioPagoCompra": 2,
  "monto": 250000,
  "idCuentaBancaria": 1,
  "numeroCheque": "000123",
  "beneficiario": "Proveedor SA",
  "referenciaBancaria": "TRX-001"
}
```

Behavior is based on normalized `MediosPagosCompra.nombre`:

- If the name contains `cheque`:
  - `idCuentaBancaria` is required.
  - `numeroCheque` is required.
  - Creates a `ChequesEmitidos` row with state `Emitido`.
  - Creates a debit `MovimientosBancarios` row.
  - Subtracts from `saldo`.
  - Does not subtract from `saldoDisponible` until the cheque is reconciled.
  - Attempts to create an accounting entry.

- If the name contains `transferencia`:
  - `idCuentaBancaria` is required.
  - Creates a debit `MovimientosBancarios` row.
  - Subtracts from `saldo` and `saldoDisponible`.
  - Attempts to create an accounting entry.

Accounting notes:

- Automatic accounting is only attempted for supplier payment orders.
- The backend looks for an enabled accounting process matching the order year.
- It uses `Proveedores` as debit.
- It credits the bank account's linked accounting account when set, otherwise falls back to `Banco Cuenta Corriente`.
- If the needed accounting process/accounts do not exist, treasury records are still created and accounting generation is skipped.

## Suggested Frontend Flows

### Bank account setup

1. Create/list banks from `/api/Bancos`.
2. Load account types from `/api/TiposCuentasBancarias`.
3. Create accounts from `/api/CuentasBancarias`.
4. Prefer linking `idCuentaContable` to the accounting bank account.

### Supplier payment by cheque

1. User selects payment method whose name is cheque.
2. Show required fields:
   - bank account
   - cheque number
   - beneficiary
   - optional bank reference
3. POST to `/api/OrdenesMediosPagosCompras`.
4. Later, reconcile from `/api/ChequesEmitidos/{id}/conciliar`.

### Supplier payment by transfer

1. User selects payment method whose name is bank transfer.
2. Show required fields:
   - bank account
   - optional bank reference
3. POST to `/api/OrdenesMediosPagosCompras`.

### Bank deposit

1. Create deposit from `/api/DepositosBancarios`.
2. If the deposit has cheque detail, create rows in `/api/ChequesMismoBanco` or `/api/ChequesTerceros`.
3. For third-party cheques, call `/api/DepositosBancarios/{id}/confirmar` or `/api/DepositosBancarios/{id}/rechazar` when bank result is known.
