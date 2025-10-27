
  CREATE OR REPLACE FORCE EDITIONABLE VIEW "GESTOCK"."VW_HISTORICAL_MOVEMENTS" ("MOVEMENT_ID", "MOVEMENT_DATE", "PRODUCT_NAME", "MOVEMENT_TYPE", "MOVEMENT_REASON", "QUANTITY", "USER_NAME", "REFERENCE") AS 
  SELECT 
    im.movement_id,
    im.movement_date,
    p.product_name,
    im.movement_type,
    im.movement_reason,
    im.quantity,
    u.name AS user_name,
    im.reference
FROM inventory_movements im
JOIN products p ON im.product_id = p.product_id
JOIN users u ON im.user_id = u.user_id;

