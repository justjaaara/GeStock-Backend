create or replace TRIGGER TRG_BLOCK_MOVEMENTS_AFTER_CLOSURE
BEFORE INSERT OR UPDATE ON INVENTORY_MOVEMENTS
FOR EACH ROW
DECLARE
    v_last_closure DATE;
BEGIN
    SELECT MAX(CLOSURE_DATE)
    INTO v_last_closure
    FROM CLOSURE_HEADER;

    IF v_last_closure IS NOT NULL AND :NEW.MOVEMENT_DATE < v_last_closure THEN
        RAISE_APPLICATION_ERROR(-20002, 'No se pueden registrar movimientos con fecha anterior al último cierre.');
    END IF;
END;
