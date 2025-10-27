import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'VW_INCOME_BY_LOT',
  expression: `
    SELECT 
        b.LOT_ID,
        b.RFID_CODE AS LOT_CODE,
        b.DESCRIPTION AS LOT_DESCRIPTION,
        b.ENTRY_DATE,
        p.PRODUCT_ID,
        p.PRODUCT_CODE,
        p.PRODUCT_NAME,
        pc.CATEGORY_NAME,
        mt.MEASUREMENT_NAME,
        i.ACTUAL_STOCK AS CURRENT_UNITS,
        p.UNIT_PRICE,
        (i.ACTUAL_STOCK * p.UNIT_PRICE) AS TOTAL_VALUE,
        ps.STATE_NAME AS PRODUCT_STATE,
        i.UPDATED_AT AS LAST_UPDATE
    FROM 
        BATCHES b
        INNER JOIN INVENTORY i ON b.LOT_ID = i.LOT_ID
        INNER JOIN PRODUCTS p ON i.PRODUCT_ID = p.PRODUCT_ID
        INNER JOIN PRODUCT_CATEGORIES pc ON p.CATEGORY_ID = pc.CATEGORY_ID
        INNER JOIN PRODUCT_STATES ps ON p.STATE_ID = ps.STATE_ID
        INNER JOIN MEASUREMENTS_TYPES mt ON p.MEASUREMENT_ID = mt.MEASUREMENT_ID
    WHERE 
        ps.STATE_ID = 1
    ORDER BY 
        b.ENTRY_DATE DESC,
        pc.CATEGORY_NAME ASC,
        p.PRODUCT_NAME ASC
  `,
})
export class IncomeByLotView {
  @ViewColumn({ name: 'LOT_ID' })
  lotId: number;

  @ViewColumn({ name: 'LOT_CODE' })
  lotCode: string;

  @ViewColumn({ name: 'LOT_DESCRIPTION' })
  lotDescription: string;

  @ViewColumn({ name: 'ENTRY_DATE' })
  entryDate: Date;

  @ViewColumn({ name: 'PRODUCT_ID' })
  productId: number;

  @ViewColumn({ name: 'PRODUCT_CODE' })
  productCode: string;

  @ViewColumn({ name: 'PRODUCT_NAME' })
  productName: string;

  @ViewColumn({ name: 'CATEGORY_NAME' })
  categoryName: string;

  @ViewColumn({ name: 'MEASUREMENT_NAME' })
  measurementName: string;

  @ViewColumn({ name: 'CURRENT_UNITS' })
  currentUnits: number;

  @ViewColumn({ name: 'UNIT_PRICE' })
  unitPrice: number;

  @ViewColumn({ name: 'TOTAL_VALUE' })
  totalValue: number;

  @ViewColumn({ name: 'PRODUCT_STATE' })
  productState: string;

  @ViewColumn({ name: 'LAST_UPDATE' })
  lastUpdate: Date;
}
