import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'VW_INVENTORY_CLOSURE_DETAILS',
})
export class InventoryClosureDetailsView {
  @ViewColumn({ name: 'CLOSURE_ID' })
  closureId: number;

  @ViewColumn({ name: 'CLOSURE_DATE' })
  closureDate: Date;

  @ViewColumn({ name: 'FINAL_STOCK' })
  finalStock: number;

  @ViewColumn({ name: 'LOT_ID' })
  lotId: number | null;

  @ViewColumn({ name: 'PRODUCT_NAME' })
  productName: string;

  @ViewColumn({ name: 'USER_NAME' })
  userName: string;

  @ViewColumn({ name: 'HEADER_ID' })
  headerId: number;
}
