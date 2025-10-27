import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'VW_SALES_BY_CATEGORY',
  expression: `
    SELECT 
        pc.CATEGORY_ID,
        pc.CATEGORY_NAME,
        p.PRODUCT_ID,
        p.PRODUCT_CODE,
        p.PRODUCT_NAME,
        i.ACTUAL_STOCK AS CURRENT_STOCK,
        i.MINIMUM_STOCK,
        p.UNIT_PRICE,
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
        ps.STATE_ID = 1
    ORDER BY 
        pc.CATEGORY_NAME ASC,
        CASE 
            WHEN i.ACTUAL_STOCK < i.MINIMUM_STOCK 
            THEN (i.MINIMUM_STOCK - i.ACTUAL_STOCK)
            ELSE 0 
        END DESC,
        p.PRODUCT_NAME ASC
  `,
})
export class SalesByCategoryView {
  @ViewColumn({ name: 'CATEGORY_ID' })
  categoryId: number;

  @ViewColumn({ name: 'CATEGORY_NAME' })
  categoryName: string;

  @ViewColumn({ name: 'PRODUCT_ID' })
  productId: number;

  @ViewColumn({ name: 'PRODUCT_CODE' })
  productCode: string;

  @ViewColumn({ name: 'PRODUCT_NAME' })
  productName: string;

  @ViewColumn({ name: 'CURRENT_STOCK' })
  currentStock: number;

  @ViewColumn({ name: 'MINIMUM_STOCK' })
  minimumStock: number;

  @ViewColumn({ name: 'UNIT_PRICE' })
  unitPrice: number;

  @ViewColumn({ name: 'UNITS_SOLD' })
  unitsSold: number;

  @ViewColumn({ name: 'TOTAL_SALES_VALUE' })
  totalSalesValue: number;

  @ViewColumn({ name: 'LAST_UPDATE' })
  lastUpdate: Date;
}
