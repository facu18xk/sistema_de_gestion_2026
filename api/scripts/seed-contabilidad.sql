-- Seed data for the Contabilidad module.
-- Safe to run multiple times: rows are matched by year/name/account number/reference.
--
-- Usage example:
--   psql "$DATABASE_URL" -f scripts/seed-contabilidad.sql

DO $$
DECLARE
    v_proceso_id integer;
    v_periodo_enero_id integer;
    v_periodo_febrero_id integer;
    v_modulo_compras_id integer;
    v_modulo_ventas_id integer;
    v_modulo_contabilidad_id integer;
    v_modelo_compra_id integer;
    v_modelo_venta_id integer;
    v_modelo_manual_id integer;
    v_asiento_id integer;
BEGIN
    INSERT INTO modulos (nombre)
    SELECT 'Compras'
    WHERE NOT EXISTS (
        SELECT 1 FROM modulos WHERE lower(nombre) = lower('Compras')
    );

    INSERT INTO modulos (nombre)
    SELECT 'Ventas'
    WHERE NOT EXISTS (
        SELECT 1 FROM modulos WHERE lower(nombre) = lower('Ventas')
    );

    INSERT INTO modulos (nombre)
    SELECT 'Contabilidad'
    WHERE NOT EXISTS (
        SELECT 1 FROM modulos WHERE lower(nombre) = lower('Contabilidad')
    );

    SELECT id INTO v_modulo_compras_id
    FROM modulos
    WHERE lower(nombre) = lower('Compras')
    ORDER BY id
    LIMIT 1;

    SELECT id INTO v_modulo_ventas_id
    FROM modulos
    WHERE lower(nombre) = lower('Ventas')
    ORDER BY id
    LIMIT 1;

    SELECT id INTO v_modulo_contabilidad_id
    FROM modulos
    WHERE lower(nombre) = lower('Contabilidad')
    ORDER BY id
    LIMIT 1;

    INSERT INTO procesos_contables (
        periodo_anho,
        descripcion,
        cant_niveles,
        cant_digitos_nivel,
        moneda,
        estado,
        created_at
    )
    SELECT
        2026,
        'Periodo contable 2026',
        4,
        2,
        'PYG',
        'Habilitado',
        now()
    WHERE NOT EXISTS (
        SELECT 1 FROM procesos_contables WHERE periodo_anho = 2026
    );

    SELECT id INTO v_proceso_id
    FROM procesos_contables
    WHERE periodo_anho = 2026
    ORDER BY id
    LIMIT 1;

    INSERT INTO periodos_contables (
        proceso_contable_id,
        anho,
        mes,
        fecha_inicio,
        fecha_fin,
        estado
    )
    SELECT
        v_proceso_id,
        2026,
        mes,
        make_date(2026, mes, 1),
        (make_date(2026, mes, 1) + interval '1 month - 1 day')::date,
        'Habilitado'
    FROM generate_series(1, 12) AS gs(mes)
    WHERE NOT EXISTS (
        SELECT 1
        FROM periodos_contables p
        WHERE p.proceso_contable_id = v_proceso_id
          AND p.anho = 2026
          AND p.mes = gs.mes
    );

    SELECT id INTO v_periodo_enero_id
    FROM periodos_contables
    WHERE proceso_contable_id = v_proceso_id
      AND anho = 2026
      AND mes = 1
    ORDER BY id
    LIMIT 1;

    SELECT id INTO v_periodo_febrero_id
    FROM periodos_contables
    WHERE proceso_contable_id = v_proceso_id
      AND anho = 2026
      AND mes = 2
    ORDER BY id
    LIMIT 1;

    -- Non-postable parent accounts.
    INSERT INTO cuentas_contables (
        proceso_contable_id,
        cuenta_padre_id,
        numero_cuenta,
        nombre,
        tipo_cuenta,
        es_asentable,
        activa
    )
    SELECT v_proceso_id, NULL, seed.numero_cuenta, seed.nombre, seed.tipo_cuenta, false, true
    FROM (VALUES
        ('1', 'Activo', 'Activo'),
        ('2', 'Pasivo', 'Pasivo'),
        ('3', 'Patrimonio Neto', 'Patrimonio'),
        ('4', 'Ingresos', 'Ingreso'),
        ('5', 'Egresos', 'Gasto')
    ) AS seed(numero_cuenta, nombre, tipo_cuenta)
    WHERE NOT EXISTS (
        SELECT 1
        FROM cuentas_contables c
        WHERE c.proceso_contable_id = v_proceso_id
          AND c.numero_cuenta = seed.numero_cuenta
    );

    -- Postable detail accounts.
    INSERT INTO cuentas_contables (
        proceso_contable_id,
        cuenta_padre_id,
        numero_cuenta,
        nombre,
        tipo_cuenta,
        es_asentable,
        activa
    )
    SELECT
        v_proceso_id,
        padre.id,
        seed.numero_cuenta,
        seed.nombre,
        seed.tipo_cuenta,
        true,
        true
    FROM (VALUES
        ('1', '101', 'Caja', 'Activo'),
        ('1', '102', 'Banco Cuenta Corriente', 'Activo'),
        ('1', '103', 'Clientes', 'Activo'),
        ('1', '104', 'Mercaderias', 'Activo'),
        ('1', '105', 'IVA Credito Fiscal', 'Activo'),
        ('2', '201', 'Proveedores', 'Pasivo'),
        ('2', '202', 'IVA Debito Fiscal', 'Pasivo'),
        ('3', '301', 'Capital Social', 'Patrimonio'),
        ('4', '401', 'Ventas de Mercaderias', 'Ingreso'),
        ('5', '501', 'Costo de Mercaderias Vendidas', 'Gasto'),
        ('5', '502', 'Gastos Administrativos', 'Gasto')
    ) AS seed(parent_numero, numero_cuenta, nombre, tipo_cuenta)
    JOIN cuentas_contables padre
      ON padre.proceso_contable_id = v_proceso_id
     AND padre.numero_cuenta = seed.parent_numero
    WHERE NOT EXISTS (
        SELECT 1
        FROM cuentas_contables c
        WHERE c.proceso_contable_id = v_proceso_id
          AND c.numero_cuenta = seed.numero_cuenta
    );

    INSERT INTO modelos_asientos (
        modulo_id,
        tipo_asiento,
        descripcion,
        detalle_resumen,
        activo
    )
    SELECT
        v_modulo_compras_id,
        'FacturaCompraContado',
        'Factura de compra al contado',
        'Registra compra de mercaderias con IVA',
        true
    WHERE NOT EXISTS (
        SELECT 1
        FROM modelos_asientos
        WHERE modulo_id = v_modulo_compras_id
          AND tipo_asiento = 'FacturaCompraContado'
    );

    INSERT INTO modelos_asientos (
        modulo_id,
        tipo_asiento,
        descripcion,
        detalle_resumen,
        activo
    )
    SELECT
        v_modulo_ventas_id,
        'FacturaVentaContado',
        'Factura de venta al contado',
        'Registra venta de mercaderias con IVA',
        true
    WHERE NOT EXISTS (
        SELECT 1
        FROM modelos_asientos
        WHERE modulo_id = v_modulo_ventas_id
          AND tipo_asiento = 'FacturaVentaContado'
    );

    INSERT INTO modelos_asientos (
        modulo_id,
        tipo_asiento,
        descripcion,
        detalle_resumen,
        activo
    )
    SELECT
        v_modulo_contabilidad_id,
        'AporteCapital',
        'Aporte inicial de capital',
        'Registra ingreso de capital en caja',
        true
    WHERE NOT EXISTS (
        SELECT 1
        FROM modelos_asientos
        WHERE modulo_id = v_modulo_contabilidad_id
          AND tipo_asiento = 'AporteCapital'
    );

    SELECT id INTO v_modelo_compra_id
    FROM modelos_asientos
    WHERE modulo_id = v_modulo_compras_id
      AND tipo_asiento = 'FacturaCompraContado'
    ORDER BY id
    LIMIT 1;

    SELECT id INTO v_modelo_venta_id
    FROM modelos_asientos
    WHERE modulo_id = v_modulo_ventas_id
      AND tipo_asiento = 'FacturaVentaContado'
    ORDER BY id
    LIMIT 1;

    SELECT id INTO v_modelo_manual_id
    FROM modelos_asientos
    WHERE modulo_id = v_modulo_contabilidad_id
      AND tipo_asiento = 'AporteCapital'
    ORDER BY id
    LIMIT 1;

    INSERT INTO modelos_asientos_detalles (
        modelo_asiento_id,
        cuenta_contable_id,
        item,
        tipo_movimiento,
        descripcion_item
    )
    SELECT v_modelo_compra_id, cuenta.id, seed.item, seed.tipo_movimiento, seed.descripcion_item
    FROM (VALUES
        ('104', 1, 'Debe', 'Mercaderias compradas'),
        ('105', 2, 'Debe', 'IVA credito fiscal'),
        ('101', 3, 'Haber', 'Pago contado')
    ) AS seed(numero_cuenta, item, tipo_movimiento, descripcion_item)
    JOIN cuentas_contables cuenta
      ON cuenta.proceso_contable_id = v_proceso_id
     AND cuenta.numero_cuenta = seed.numero_cuenta
    WHERE NOT EXISTS (
        SELECT 1
        FROM modelos_asientos_detalles d
        WHERE d.modelo_asiento_id = v_modelo_compra_id
          AND d.item = seed.item
    );

    INSERT INTO modelos_asientos_detalles (
        modelo_asiento_id,
        cuenta_contable_id,
        item,
        tipo_movimiento,
        descripcion_item
    )
    SELECT v_modelo_venta_id, cuenta.id, seed.item, seed.tipo_movimiento, seed.descripcion_item
    FROM (VALUES
        ('101', 1, 'Debe', 'Cobro contado'),
        ('401', 2, 'Haber', 'Venta de mercaderias'),
        ('202', 3, 'Haber', 'IVA debito fiscal')
    ) AS seed(numero_cuenta, item, tipo_movimiento, descripcion_item)
    JOIN cuentas_contables cuenta
      ON cuenta.proceso_contable_id = v_proceso_id
     AND cuenta.numero_cuenta = seed.numero_cuenta
    WHERE NOT EXISTS (
        SELECT 1
        FROM modelos_asientos_detalles d
        WHERE d.modelo_asiento_id = v_modelo_venta_id
          AND d.item = seed.item
    );

    INSERT INTO modelos_asientos_detalles (
        modelo_asiento_id,
        cuenta_contable_id,
        item,
        tipo_movimiento,
        descripcion_item
    )
    SELECT v_modelo_manual_id, cuenta.id, seed.item, seed.tipo_movimiento, seed.descripcion_item
    FROM (VALUES
        ('101', 1, 'Debe', 'Ingreso en caja'),
        ('301', 2, 'Haber', 'Aporte de capital')
    ) AS seed(numero_cuenta, item, tipo_movimiento, descripcion_item)
    JOIN cuentas_contables cuenta
      ON cuenta.proceso_contable_id = v_proceso_id
     AND cuenta.numero_cuenta = seed.numero_cuenta
    WHERE NOT EXISTS (
        SELECT 1
        FROM modelos_asientos_detalles d
        WHERE d.modelo_asiento_id = v_modelo_manual_id
          AND d.item = seed.item
    );

    -- Sample balanced journal entries.
    IF NOT EXISTS (
        SELECT 1 FROM asientos WHERE referencia_origen = 'SEED-CONTABILIDAD-APORTE-2026'
    ) THEN
        INSERT INTO asientos (
            numero_asiento,
            periodo_contable_id,
            modulo_id,
            fecha,
            descripcion,
            automatico,
            estado,
            referencia_origen,
            id_origen,
            created_at
        )
        VALUES (
            1,
            v_periodo_enero_id,
            v_modulo_contabilidad_id,
            DATE '2026-01-02',
            'Aporte inicial de capital',
            false,
            'Registrado',
            'SEED-CONTABILIDAD-APORTE-2026',
            NULL,
            now()
        )
        RETURNING id INTO v_asiento_id;

        INSERT INTO asientos_detalles (
            asiento_id,
            cuenta_contable_id,
            item,
            tipo_movimiento,
            monto,
            descripcion_item
        )
        SELECT v_asiento_id, cuenta.id, seed.item, seed.tipo_movimiento, seed.monto, seed.descripcion_item
        FROM (VALUES
            ('101', 1, 'Debe', 10000000.00::numeric, 'Ingreso en caja'),
            ('301', 2, 'Haber', 10000000.00::numeric, 'Capital social')
        ) AS seed(numero_cuenta, item, tipo_movimiento, monto, descripcion_item)
        JOIN cuentas_contables cuenta
          ON cuenta.proceso_contable_id = v_proceso_id
         AND cuenta.numero_cuenta = seed.numero_cuenta;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM asientos WHERE referencia_origen = 'SEED-CONTABILIDAD-COMPRA-2026-001'
    ) THEN
        INSERT INTO asientos (
            numero_asiento,
            periodo_contable_id,
            modulo_id,
            fecha,
            descripcion,
            automatico,
            estado,
            referencia_origen,
            id_origen,
            created_at
        )
        VALUES (
            2,
            v_periodo_enero_id,
            v_modulo_compras_id,
            DATE '2026-01-10',
            'Compra contado de mercaderias',
            true,
            'Registrado',
            'SEED-CONTABILIDAD-COMPRA-2026-001',
            1,
            now()
        )
        RETURNING id INTO v_asiento_id;

        INSERT INTO asientos_detalles (
            asiento_id,
            cuenta_contable_id,
            item,
            tipo_movimiento,
            monto,
            descripcion_item
        )
        SELECT v_asiento_id, cuenta.id, seed.item, seed.tipo_movimiento, seed.monto, seed.descripcion_item
        FROM (VALUES
            ('104', 1, 'Debe', 1000000.00::numeric, 'Mercaderias compradas'),
            ('105', 2, 'Debe', 100000.00::numeric, 'IVA credito fiscal'),
            ('101', 3, 'Haber', 1100000.00::numeric, 'Pago desde caja')
        ) AS seed(numero_cuenta, item, tipo_movimiento, monto, descripcion_item)
        JOIN cuentas_contables cuenta
          ON cuenta.proceso_contable_id = v_proceso_id
         AND cuenta.numero_cuenta = seed.numero_cuenta;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM asientos WHERE referencia_origen = 'SEED-CONTABILIDAD-VENTA-2026-001'
    ) THEN
        INSERT INTO asientos (
            numero_asiento,
            periodo_contable_id,
            modulo_id,
            fecha,
            descripcion,
            automatico,
            estado,
            referencia_origen,
            id_origen,
            created_at
        )
        VALUES (
            1,
            v_periodo_febrero_id,
            v_modulo_ventas_id,
            DATE '2026-02-05',
            'Venta contado de mercaderias',
            true,
            'Registrado',
            'SEED-CONTABILIDAD-VENTA-2026-001',
            1,
            now()
        )
        RETURNING id INTO v_asiento_id;

        INSERT INTO asientos_detalles (
            asiento_id,
            cuenta_contable_id,
            item,
            tipo_movimiento,
            monto,
            descripcion_item
        )
        SELECT v_asiento_id, cuenta.id, seed.item, seed.tipo_movimiento, seed.monto, seed.descripcion_item
        FROM (VALUES
            ('101', 1, 'Debe', 1650000.00::numeric, 'Cobro en caja'),
            ('401', 2, 'Haber', 1500000.00::numeric, 'Venta de mercaderias'),
            ('202', 3, 'Haber', 150000.00::numeric, 'IVA debito fiscal')
        ) AS seed(numero_cuenta, item, tipo_movimiento, monto, descripcion_item)
        JOIN cuentas_contables cuenta
          ON cuenta.proceso_contable_id = v_proceso_id
         AND cuenta.numero_cuenta = seed.numero_cuenta;
    END IF;
END $$;
