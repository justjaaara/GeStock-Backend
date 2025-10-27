-- =====================================================
-- Vista: VW_STOCK_ALERTS
-- Descripción: Vista para alertas de productos con stock 
--              igual o menor al mínimo establecido
-- Autor: GeStock Team
-- Fecha: 2025-10-26
-- =====================================================

CREATE OR REPLACE VIEW VW_STOCK_ALERTS AS
SELECT 
  p.PRODUCT_ID,
  p.PRODUCT_CODE,
  p.PRODUCT_NAME,
  p.PRODUCT_DESCRIPTION,
  pc.CATEGORY_NAME AS PRODUCT_CATEGORY,
  i.ACTUAL_STOCK AS CURRENT_STOCK,
  i.MINIMUM_STOCK,
  (i.MINIMUM_STOCK - i.ACTUAL_STOCK) AS DEFICIT,
  p.UNIT_PRICE,
  ps.STATE_NAME AS PRODUCT_STATE,
  mt.MEASUREMENT_NAME AS MEASUREMENT_TYPE,
  i.LOT_ID,
  i.UPDATED_AT AS ALERT_DATE
FROM INVENTORY i
INNER JOIN PRODUCTS p ON i.PRODUCT_ID = p.PRODUCT_ID
LEFT JOIN PRODUCT_CATEGORIES pc ON p.CATEGORY_ID = pc.CATEGORY_ID
LEFT JOIN PRODUCT_STATES ps ON p.STATE_ID = ps.STATE_ID
LEFT JOIN MEASUREMENTS_TYPES mt ON p.MEASUREMENT_ID = mt.MEASUREMENT_ID
WHERE i.ACTUAL_STOCK <= i.MINIMUM_STOCK
  AND p.STATE_ID = 1  -- Solo productos activos
ORDER BY 
  CASE 
    WHEN i.ACTUAL_STOCK = 0 THEN 1  -- Sin stock primero
    WHEN i.ACTUAL_STOCK < i.MINIMUM_STOCK THEN 2  -- Debajo del mínimo
    ELSE 3  -- Justo en el mínimo
  END,
  (i.MINIMUM_STOCK - i.ACTUAL_STOCK) DESC,  -- Mayor déficit primero
  p.PRODUCT_NAME ASC;

-- Comentarios para documentación
COMMENT ON TABLE VW_STOCK_ALERTS IS 'Vista de productos con stock igual o menor al mínimo (alertas activas)';
COMMENT ON COLUMN VW_STOCK_ALERTS.PRODUCT_ID IS 'ID único del producto';
COMMENT ON COLUMN VW_STOCK_ALERTS.PRODUCT_CODE IS 'Código del producto';
COMMENT ON COLUMN VW_STOCK_ALERTS.PRODUCT_NAME IS 'Nombre del producto';
COMMENT ON COLUMN VW_STOCK_ALERTS.CURRENT_STOCK IS 'Stock actual disponible';
COMMENT ON COLUMN VW_STOCK_ALERTS.MINIMUM_STOCK IS 'Stock mínimo establecido';
COMMENT ON COLUMN VW_STOCK_ALERTS.DEFICIT IS 'Cantidad que falta para alcanzar el stock mínimo';
COMMENT ON COLUMN VW_STOCK_ALERTS.ALERT_DATE IS 'Fecha de la última actualización de stock';

-- Verificar la vista
SELECT * FROM VW_STOCK_ALERTS;

-- Estadísticas de alertas
SELECT 
  CASE 
    WHEN CURRENT_STOCK = 0 THEN 'Sin Stock'
    WHEN CURRENT_STOCK < MINIMUM_STOCK THEN 'Stock Crítico'
    ELSE 'Stock Mínimo'
  END AS ALERT_TYPE,
  COUNT(*) AS TOTAL_PRODUCTS,
  SUM(DEFICIT) AS TOTAL_DEFICIT
FROM VW_STOCK_ALERTS
GROUP BY 
  CASE 
    WHEN CURRENT_STOCK = 0 THEN 'Sin Stock'
    WHEN CURRENT_STOCK < MINIMUM_STOCK THEN 'Stock Crítico'
    ELSE 'Stock Mínimo'
  END
ORDER BY 1;
