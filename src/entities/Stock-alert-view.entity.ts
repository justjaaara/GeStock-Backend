import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'VW_STOCK_ALERTS',
})
export class StockAlertView {
  @ViewColumn({ name: 'PRODUCT_ID' })
  productId: number;

  @ViewColumn({ name: 'PRODUCT_CODE' })
  productCode: string;

  @ViewColumn({ name: 'PRODUCT_NAME' })
  productName: string;

  @ViewColumn({ name: 'PRODUCT_DESCRIPTION' })
  productDescription: string;

  @ViewColumn({ name: 'PRODUCT_CATEGORY' })
  productCategory: string;

  @ViewColumn({ name: 'CURRENT_STOCK' })
  currentStock: number;

  @ViewColumn({ name: 'MINIMUM_STOCK' })
  minimumStock: number;

  @ViewColumn({ name: 'DEFICIT' })
  deficit: number;

  @ViewColumn({ name: 'UNIT_PRICE' })
  unitPrice: number;

  @ViewColumn({ name: 'PRODUCT_STATE' })
  productState: string;

  @ViewColumn({ name: 'MEASUREMENT_TYPE' })
  measurementType: string;

  @ViewColumn({ name: 'LOT_ID' })
  lotId: number;

  @ViewColumn({ name: 'ALERT_DATE' })
  alertDate: Date;
}
