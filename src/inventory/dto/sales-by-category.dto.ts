export class SalesByCategoryProductDto {
  categoryId: number;
  categoryName: string;
  productId: number;
  productCode: string;
  productName: string;
  currentStock: number;
  minimumStock: number;
  unitPrice: number;
  unitsSold: number;
  totalSalesValue: number;
  lastUpdate: Date;
}

export class SalesByCategorySummaryDto {
  totalCategories: number;
  totalProducts: number;
  totalUnitsSold: number;
  totalSalesValue: number;
  topCategory: string;
  products: SalesByCategoryProductDto[];
}
