export class IncomeByLotItemDto {
  lotId: number;
  lotCode: string;
  lotDescription: string;
  entryDate: Date;
  productId: number;
  productCode: string;
  productName: string;
  categoryName: string;
  measurementName: string;
  currentUnits: number;
  unitPrice: number;
  totalValue: number;
  productState: string;
  lastUpdate: Date;
}

export class IncomeByLotSummaryDto {
  totalLots: number;
  totalProducts: number;
  totalUnits: number;
  totalValue: number;
  mostRecentEntry: Date;
  items: IncomeByLotItemDto[];
}
