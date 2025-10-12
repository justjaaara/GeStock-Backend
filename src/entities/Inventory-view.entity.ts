import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'VW_INVENTORY_DETAIL',
})
export class InventoryView {
  @ViewColumn({ name: 'CODIGO_PRODUCTO' })
  productCode: string;

  @ViewColumn({ name: 'NOMBRE_PRODUCTO' })
  productName: string;

  @ViewColumn({ name: 'DESCRIPCION_PRODUCTO' })
  productDescription: string;

  @ViewColumn({ name: 'CATEGORIA_PRODUCTO' })
  productCategory: string;

  @ViewColumn({ name: 'STOCK_ACTUAL' })
  currentStock: number;

  @ViewColumn({ name: 'STOCK_MINIMO' })
  minimunStock: number;

  @ViewColumn({ name: 'PRECIO_UNITARIO' })
  unitPrice: number;
}
