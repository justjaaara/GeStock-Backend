create or replace PROCEDURE GENERAR_CIERRE_MENSUAL (p_user_email VARCHAR2) AS
    v_user_id NUMBER;
    v_header_id NUMBER;
    v_mes NUMBER := EXTRACT(MONTH FROM SYSDATE);
    v_anio NUMBER := EXTRACT(YEAR FROM SYSDATE);
    v_existe NUMBER;
BEGIN
    -- Obtener usuario
    SELECT USER_ID INTO v_user_id
    FROM USERS WHERE EMAIL = p_user_email;

    -- Verificar si ya existe un cierre en el mismo mes/año
    SELECT COUNT(*) INTO v_existe
    FROM CLOSURE_HEADER
    WHERE CLOSURE_MONTH = v_mes AND CLOSURE_YEAR = v_anio;

    IF v_existe > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Ya existe un cierre para este mes.');
    END IF;

    -- Crear el encabezado del cierre
    INSERT INTO CLOSURE_HEADER (CLOSURE_MONTH, CLOSURE_YEAR, USER_ID)
    VALUES (v_mes, v_anio, v_user_id)
    RETURNING HEADER_ID INTO v_header_id;

    -- Insertar el snapshot del inventario actual
    INSERT INTO INVENTORY_CLOSURE (HEADER_ID, CLOSURE_DATE, PRODUCT_ID, LOT_ID, FINAL_STOCK, USER_ID)
    SELECT v_header_id, SYSDATE, PRODUCT_ID, LOT_ID, ACTUAL_STOCK, v_user_id
    FROM INVENTORY;

    COMMIT;
END;
