-- =====================================================
-- Procedimiento: CARGA_RFID_MASIVA
-- Descripción: Gestión integral de carga por RFID
-- =====================================================
-- Este procedimiento maneja:
-- 1. Creación de lote (siempre nuevo, cada caja = un lote)
-- 2. Búsqueda/creación de producto (por ID o CODE)
-- 3. Actualización de inventario (acumula stock por PRODUCTO, LOT_ID = último lote)
-- 4. Registro de movimiento (con trazabilidad del lote)
-- =====================================================

CREATE OR REPLACE PROCEDURE CARGA_RFID_MASIVA (
  -- Lote (siempre viene)
  p_rfid_code       IN VARCHAR2,
  p_batch_desc      IN VARCHAR2,

  -- Producto (si no existe, se crea)
  p_product_id      IN NUMBER,        -- puede ser NULL
  p_product_code    IN VARCHAR2,      -- puede ser NULL (útil para buscar)
  p_product_name    IN VARCHAR2,      -- usado al crear
  p_unit_price      IN NUMBER,        -- usado al crear
  p_product_desc    IN VARCHAR2 DEFAULT NULL,
  p_category_id     IN NUMBER   DEFAULT NULL,
  p_measurement_id  IN NUMBER   DEFAULT NULL,
  p_state_id        IN NUMBER   DEFAULT NULL,

  -- Inventario / Movimiento
  p_quantity        IN NUMBER,
  p_reference       IN VARCHAR2,
  p_user_id         IN NUMBER,
  p_movement_reason IN VARCHAR2
) IS
  v_now        TIMESTAMP := CAST(SYSTIMESTAMP AT TIME ZONE 'America/Bogota' AS TIMESTAMP);
  v_lot_id     NUMBER;
  v_product_id NUMBER := p_product_id;
BEGIN
  -- =========================================================
  -- VALIDACIONES
  -- =========================================================
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE_APPLICATION_ERROR(-20001, 'La cantidad debe ser > 0.');
  END IF;

  -- =========================================================
  -- 1) LOTE: SIEMPRE crear (cada lectura RFID = un lote único)
  -- =========================================================
  INSERT INTO BATCHES (DESCRIPTION, ENTRY_DATE, RFID_CODE)
  VALUES (NVL(p_batch_desc, 'Lote RFID'), v_now, p_rfid_code)
  RETURNING LOT_ID INTO v_lot_id;

  -- =========================================================
  -- 2) PRODUCTO: buscar por ID o por CODE; si no existe, CREAR
  -- =========================================================
  
  -- 2.1) Buscar por ID si viene
  IF v_product_id IS NOT NULL THEN
    BEGIN
      SELECT product_id INTO v_product_id
      FROM products
      WHERE product_id = v_product_id;
    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        v_product_id := NULL;
    END;
  END IF;

  -- 2.2) Si no se encontró por ID, buscar por CODE
  IF v_product_id IS NULL AND p_product_code IS NOT NULL THEN
    BEGIN
      SELECT product_id INTO v_product_id
      FROM products
      WHERE product_code = p_product_code;
    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        v_product_id := NULL;
    END;
  END IF;

  -- 2.3) Si no existe, CREAR producto
  IF v_product_id IS NULL THEN
    INSERT INTO products (
      category_id, 
      measurement_id, 
      product_code, 
      product_description,
      product_name, 
      state_id, 
      unit_price
    ) VALUES (
      p_category_id, 
      p_measurement_id, 
      p_product_code, 
      p_product_desc,
      p_product_name, 
      p_state_id, 
      p_unit_price
    )
    RETURNING product_id INTO v_product_id;
  END IF;

  -- =========================================================
  -- 3) INVENTORY: acumular por PRODUCTO y actualizar LOT_ID al más reciente
  --    -> una sola fila por PRODUCT_ID, LOT_ID = último lote ingresado
  -- =========================================================
  MERGE INTO inventory inv
  USING (
    SELECT v_product_id AS product_id,
           v_lot_id     AS lot_id,
           p_quantity   AS qty,
           v_now        AS ts
    FROM dual
  ) src
  ON (inv.product_id = src.product_id)
  WHEN MATCHED THEN
    UPDATE SET 
      inv.actual_stock = inv.actual_stock + src.qty,
      inv.lot_id       = src.lot_id,
      inv.updated_at   = src.ts
  WHEN NOT MATCHED THEN
    INSERT (product_id, lot_id, actual_stock, minimum_stock, created_at, updated_at)
    VALUES (src.product_id, src.lot_id, src.qty, 0, src.ts, src.ts);

  -- =========================================================
  -- 4) MOVIMIENTO: cada entrada ligada a su LOT_ID para trazabilidad
  -- =========================================================
  INSERT INTO inventory_movements (
    lot_id, 
    movement_date, 
    movement_type, 
    movement_reason,
    product_id, 
    quantity, 
    reference, 
    user_id
  ) VALUES (
    v_lot_id, 
    v_now, 
    'ENTRADA', 
    p_movement_reason,
    v_product_id, 
    p_quantity, 
    p_reference, 
    p_user_id
  );

  -- =========================================================
  -- 5) COMMIT
  -- =========================================================
  COMMIT;

EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END CARGA_RFID_MASIVA;
/

-- =====================================================
-- Ejemplos de uso:
-- =====================================================

-- Ejemplo 1: Producto nuevo (se crea automáticamente)
/*
BEGIN
  CARGA_RFID_MASIVA(
    p_rfid_code       => '83:DF:12:F7:B9',
    p_batch_desc      => 'Caja 24 und',
    p_product_id      => NULL,
    p_product_code    => 'PROD-001',
    p_product_name    => 'Guantes Nitrilo Talla M',
    p_unit_price      => 2500,
    p_product_desc    => 'Guantes desechables azules',
    p_category_id     => 1,
    p_measurement_id  => 2,
    p_state_id        => 1,
    p_quantity        => 24,
    p_reference       => 'RFID-ENTRADA-01',
    p_user_id         => 1,
    p_movement_reason => 'Recepción por RFID'
  );
END;
/
*/

-- Ejemplo 2: Producto existente (buscar por código)
/*
BEGIN
  CARGA_RFID_MASIVA(
    p_rfid_code       => '47:CE:19:D9:49',
    p_batch_desc      => 'Pallet 10 cajas',
    p_product_id      => NULL,
    p_product_code    => 'PROD-001',  -- Busca producto existente
    p_product_name    => 'Nombre (se ignora si existe)',
    p_unit_price      => 0,
    p_quantity        => 500,
    p_reference       => 'RFID-ENTRADA-02',
    p_user_id         => 1,
    p_movement_reason => 'Recepción por RFID'
  );
END;
/
*/

-- Ejemplo 3: Producto por ID
/*
BEGIN
  CARGA_RFID_MASIVA(
    p_rfid_code       => 'AA:BB:CC:DD:EE',
    p_batch_desc      => 'Lote Express',
    p_product_id      => 5,  -- Busca por ID directamente
    p_product_code    => NULL,
    p_product_name    => 'Se ignora',
    p_unit_price      => 0,
    p_quantity        => 100,
    p_reference       => 'RFID-ENTRADA-03',
    p_user_id         => 1,
    p_movement_reason => 'Carga masiva'
  );
END;
/
*/

-- =====================================================
-- Consultas útiles para verificar:
-- =====================================================

-- Ver últimos lotes creados
-- SELECT * FROM BATCHES ORDER BY ENTRY_DATE DESC FETCH FIRST 10 ROWS ONLY;

-- Ver inventario actualizado
-- SELECT p.product_name, i.actual_stock FROM INVENTORY i JOIN PRODUCTS p ON i.product_id = p.product_id;

-- Ver últimos movimientos
-- SELECT * FROM INVENTORY_MOVEMENTS ORDER BY MOVEMENT_DATE DESC FETCH FIRST 10 ROWS ONLY;
