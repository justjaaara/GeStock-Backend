-- Vista para el Reporte de Movimientos
-- Historia de Usuario: GES-167
-- Descripción: Productos vendidos por categoría para entender la demanda

CREATE OR REPLACE VIEW VW_SALES_BY_CATEGORY AS
SELECT 
    pc.CATEGORY_ID,
    pc.CATEGORY_NAME,
    p.PRODUCT_ID,
    p.PRODUCT_CODE,
    p.PRODUCT_NAME,
    i.ACTUAL_STOCK AS CURRENT_STOCK,
    i.MINIMUM_STOCK,
    p.UNIT_PRICE,
    -- Por ahora, calculamos las "ventas" como la diferencia entre stock mínimo esperado
    -- En el futuro esto vendría de una tabla de SALES o MOVEMENTS
    CASE 
        WHEN i.ACTUAL_STOCK < i.MINIMUM_STOCK 
        THEN (i.MINIMUM_STOCK - i.ACTUAL_STOCK)
        ELSE 0 
    END AS UNITS_SOLD,
    CASE 
        WHEN i.ACTUAL_STOCK < i.MINIMUM_STOCK 
        THEN (i.MINIMUM_STOCK - i.ACTUAL_STOCK) * p.UNIT_PRICE
        ELSE 0 
    END AS TOTAL_SALES_VALUE,
    i.UPDATED_AT AS LAST_UPDATE
FROM 
    PRODUCTS p
    INNER JOIN INVENTORY i ON p.PRODUCT_ID = i.PRODUCT_ID
    INNER JOIN PRODUCT_CATEGORIES pc ON p.CATEGORY_ID = pc.CATEGORY_ID
    INNER JOIN PRODUCT_STATES ps ON p.STATE_ID = ps.STATE_ID
WHERE 
    ps.STATE_ID = 1  -- Solo productos activos
ORDER BY 
    pc.CATEGORY_NAME ASC,
    CASE 
        WHEN i.ACTUAL_STOCK < i.MINIMUM_STOCK 
        THEN (i.MINIMUM_STOCK - i.ACTUAL_STOCK)
        ELSE 0 
    END DESC,
    p.PRODUCT_NAME ASC;
