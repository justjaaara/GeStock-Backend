import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('stock')
  async getAllStockAlerts() {
    const alerts = await this.alertsService.getAllStockAlerts();

    return alerts.map((alert) => ({
      productId: alert.productId,
      productCode: alert.productCode,
      productName: alert.productName,
      productDescription: alert.productDescription,
      category: alert.productCategory,
      currentStock: alert.currentStock,
      minimumStock: alert.minimumStock,
      deficit: alert.deficit,
      unitPrice: alert.unitPrice,
      state: alert.productState,
      measurementType: alert.measurementType,
      lotId: alert.lotId,
      alertDate: alert.alertDate,
      alertType:
        alert.currentStock === 0
          ? 'Sin Stock'
          : alert.currentStock < alert.minimumStock
            ? 'Crítico'
            : 'Mínimo',
      priority:
        alert.currentStock === 0
          ? 'alta'
          : alert.currentStock < alert.minimumStock
            ? 'media'
            : 'baja',
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('stock/stats')
  async getAlertStats() {
    return this.alertsService.getAlertStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get('stock/critical')
  async getCriticalAlerts() {
    const alerts = await this.alertsService.getCriticalAlerts();

    return alerts.map((alert) => ({
      productId: alert.productId,
      productCode: alert.productCode,
      productName: alert.productName,
      currentStock: alert.currentStock,
      minimumStock: alert.minimumStock,
      deficit: alert.deficit,
      category: alert.productCategory,
      alertDate: alert.alertDate,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('stock/out-of-stock')
  async getOutOfStockAlerts() {
    const alerts = await this.alertsService.getOutOfStockAlerts();

    return alerts.map((alert) => ({
      productId: alert.productId,
      productCode: alert.productCode,
      productName: alert.productName,
      category: alert.productCategory,
      minimumStock: alert.minimumStock,
      alertDate: alert.alertDate,
    }));
  }
}
