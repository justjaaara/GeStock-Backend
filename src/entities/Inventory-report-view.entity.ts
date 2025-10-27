import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'VW_INVENTORY_REPORT',
  expression: `
    SELECT 
      p.PRODUCT_ID,
      p.PRODUCT_CODE,
      p.PRODUCT_NAME,
      p.PRODUCT_DESCRIPTION,
      pc.CATEGORY_NAME,
      ps.STATE_NAME AS PRODUCT_STATE,
      mt.MEASUREMENT_NAME,
      i.ACTUAL_STOCK AS AVAILABLE_UNITS,
      i.MINIMUM_STOCK,
      p.UNIT_PRICE,
      (i.ACTUAL_STOCK * p.UNIT_PRICE) AS TOTAL_VALUE,
      b.LOT_CODE,
      i.UPDATED_AT AS LAST_UPDATE
    FROM 
      PRODUCTS p
      INNER JOIN INVENTORY i ON p.PRODUCT_ID = i.PRODUCT_ID
      INNER JOIN PRODUCT_CATEGORIES pc ON p.CATEGORY_ID = pc.CATEGORY_ID
      INNER JOIN PRODUCT_STATES ps ON p.STATE_ID = ps.STATE_ID
      INNER JOIN MEASUREMENTS_TYPES mt ON p.MEASUREMENT_ID = mt.MEASUREMENT_ID
      LEFT JOIN BATCHES b ON i.LOT_ID = b.LOT_ID
    WHERE 
      ps.STATE_ID = 1
    ORDER BY 
      pc.CATEGORY_NAME ASC,
      p.PRODUCT_NAME ASC
  `,
})
export class InventoryReportView {
  @ViewColumn({ name: 'PRODUCT_ID' })
  productId: number;

  @ViewColumn({ name: 'PRODUCT_CODE' })
  productCode: string;

  @ViewColumn({ name: 'PRODUCT_NAME' })
  productName: string;

  @ViewColumn({ name: 'PRODUCT_DESCRIPTION' })
  productDescription: string;

  @ViewColumn({ name: 'CATEGORY_NAME' })
  categoryName: string;

  @ViewColumn({ name: 'PRODUCT_STATE' })
  productState: string;

  @ViewColumn({ name: 'MEASUREMENT_NAME' })
  measurementName: string;

  @ViewColumn({ name: 'AVAILABLE_UNITS' })
  availableUnits: number;

  @ViewColumn({ name: 'MINIMUM_STOCK' })
  minimumStock: number;

  @ViewColumn({ name: 'UNIT_PRICE' })
  unitPrice: number;

  @ViewColumn({ name: 'TOTAL_VALUE' })
  totalValue: number;

  @ViewColumn({ name: 'LOT_CODE' })
  lotCode: string;

  @ViewColumn({ name: 'LAST_UPDATE' })
  lastUpdate: Date;
}
