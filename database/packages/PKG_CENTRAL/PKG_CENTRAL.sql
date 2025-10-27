create or replace PACKAGE PKG_CENTRAL AS
  -- Tipo de cursor REF para estadísticas
  TYPE T_CURSOR IS REF CURSOR;

  -- Procedimiento para cargue de inventario
  PROCEDURE CARGAR_INVENTARIO(
    p_product_id     IN NUMBER,
    p_lot_id         IN NUMBER,
    p_quantity       IN NUMBER,
    p_reference      IN VARCHAR2,
    p_user_id        IN NUMBER,
    p_movement_reason IN VARCHAR2
  );

  -- Procedimiento para descargue de inventario
  PROCEDURE DESCARGAR_INVENTARIO(
    p_product_id     IN NUMBER,
    p_lot_id         IN NUMBER,
    p_quantity       IN NUMBER,
    p_reference      IN VARCHAR2,
    p_user_id        IN NUMBER,
    p_movement_reason IN VARCHAR2
  );

  -- Procedimiento para cierre mensual
  PROCEDURE CIERRE_MENSUAL(
    p_closure_date IN DATE,
    p_user_email   IN VARCHAR2
  );

  -- Procedimiento para estadísticas de movimientos
  PROCEDURE ESTADISTICAS_MOVIMIENTOS(
    p_start_date IN DATE,
    p_end_date   IN DATE
  );
END PKG_CENTRAL;

create or replace PACKAGE BODY PKG_CENTRAL AS

  -- Procedimiento para cargar inventario
  PROCEDURE CARGAR_INVENTARIO(
    p_product_id      IN NUMBER,
    p_lot_id          IN NUMBER,
    p_quantity        IN NUMBER,
    p_reference       IN VARCHAR2,
    p_user_id         IN NUMBER,
    p_movement_reason IN VARCHAR2
  ) IS
  BEGIN
    UPDATE INVENTORY
    SET ACTUAL_STOCK = ACTUAL_STOCK + p_quantity,
        UPDATED_AT   = CAST((SYSTIMESTAMP AT TIME ZONE 'America/Bogota') AS TIMESTAMP)
    WHERE PRODUCT_ID = p_product_id;

    COMMIT;

    INSERT INTO INVENTORY_MOVEMENTS (
      LOT_ID, MOVEMENT_DATE, MOVEMENT_TYPE, MOVEMENT_REASON,
      PRODUCT_ID, QUANTITY, REFERENCE, USER_ID
    ) VALUES (
      p_lot_id,
      CAST((SYSTIMESTAMP AT TIME ZONE 'America/Bogota') AS TIMESTAMP),
      'ENTRADA',
      p_movement_reason,
      p_product_id,
      p_quantity,
      p_reference,
      p_user_id
    );

    COMMIT;
  END CARGAR_INVENTARIO;

  -- Procedimiento para descargar inventario
  PROCEDURE DESCARGAR_INVENTARIO(
    p_product_id      IN NUMBER,
    p_lot_id          IN NUMBER,
    p_quantity        IN NUMBER,
    p_reference       IN VARCHAR2,
    p_user_id         IN NUMBER,
    p_movement_reason IN VARCHAR2
  ) IS
    v_current_stock NUMBER;
  BEGIN
    SELECT ACTUAL_STOCK
    INTO v_current_stock
    FROM INVENTORY
    WHERE PRODUCT_ID = p_product_id;

    IF v_current_stock < p_quantity THEN
      RAISE_APPLICATION_ERROR(-20001, 'Stock insuficiente para realizar la operación.');
    END IF;

    UPDATE INVENTORY
    SET ACTUAL_STOCK = ACTUAL_STOCK - p_quantity,
        UPDATED_AT   = CAST((SYSTIMESTAMP AT TIME ZONE 'America/Bogota') AS TIMESTAMP)
    WHERE PRODUCT_ID = p_product_id;

    INSERT INTO INVENTORY_MOVEMENTS (
      LOT_ID, MOVEMENT_DATE, MOVEMENT_TYPE, MOVEMENT_REASON,
      PRODUCT_ID, QUANTITY, REFERENCE, USER_ID
    ) VALUES (
      p_lot_id,
      CAST((SYSTIMESTAMP AT TIME ZONE 'America/Bogota') AS TIMESTAMP),
      'SALIDA',
      p_movement_reason,
      p_product_id,
      p_quantity,
      p_reference,
      p_user_id
    );

    COMMIT;
  END DESCARGAR_INVENTARIO;

  -- Procedimiento para cierre mensual
  PROCEDURE CIERRE_MENSUAL(
    p_closure_date IN DATE,
    p_user_email   IN VARCHAR2
  ) IS
    v_user_id NUMBER;
  BEGIN
    SELECT USER_ID
    INTO v_user_id
    FROM USERS
    WHERE EMAIL = p_user_email;

    INSERT INTO INVENTORY_CLOSURE (
      CLOSURE_DATE, PRODUCT_ID, LOT_ID, FINAL_STOCK, USER_ID
    )
    SELECT
      CAST((CAST(p_closure_date AS TIMESTAMP) AT TIME ZONE 'America/Bogota') AS TIMESTAMP),
      i.PRODUCT_ID,
      i.LOT_ID,
      i.ACTUAL_STOCK,
      v_user_id
    FROM INVENTORY i;

    COMMIT;
  END CIERRE_MENSUAL;

  -- Procedimiento para generar estadísticas de movimientos
  PROCEDURE ESTADISTICAS_MOVIMIENTOS(
    p_start_date IN DATE,
    p_end_date   IN DATE
  ) IS
    v_max_mov_product_id NUMBER;
    v_max_mov_count      NUMBER;
    v_min_mov_product_id NUMBER;
    v_min_mov_count      NUMBER;
  BEGIN
    -- Producto con más movimientos
    SELECT PRODUCT_ID, COUNT(*)
    INTO v_max_mov_product_id, v_max_mov_count
    FROM INVENTORY_MOVEMENTS
    WHERE MOVEMENT_DATE BETWEEN
      CAST((CAST(p_start_date AS TIMESTAMP) AT TIME ZONE 'America/Bogota') AS TIMESTAMP)
      AND CAST((CAST(p_end_date AS TIMESTAMP) AT TIME ZONE 'America/Bogota') AS TIMESTAMP)
    GROUP BY PRODUCT_ID
    ORDER BY COUNT(*) DESC
    FETCH FIRST 1 ROWS ONLY;

    -- Producto con menos movimientos
    SELECT PRODUCT_ID, COUNT(*)
    INTO v_min_mov_product_id, v_min_mov_count
    FROM INVENTORY_MOVEMENTS
    WHERE MOVEMENT_DATE BETWEEN
      CAST((CAST(p_start_date AS TIMESTAMP) AT TIME ZONE 'America/Bogota') AS TIMESTAMP)
      AND CAST((CAST(p_end_date AS TIMESTAMP) AT TIME ZONE 'America/Bogota') AS TIMESTAMP)
    GROUP BY PRODUCT_ID
    ORDER BY COUNT(*) ASC
    FETCH FIRST 1 ROWS ONLY;

    DBMS_OUTPUT.PUT_LINE('Producto con más movimientos: ' || v_max_mov_product_id || ' (' || v_max_mov_count || ' movimientos)');
    DBMS_OUTPUT.PUT_LINE('Producto con menos movimientos: ' || v_min_mov_product_id || ' (' || v_min_mov_count || ' movimientos)');
  END ESTADISTICAS_MOVIMIENTOS;

END PKG_CENTRAL;

