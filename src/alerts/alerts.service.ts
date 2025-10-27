import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StockAlertView } from 'src/entities/Stock-alert-view.entity';
import { Repository } from 'typeorm';

export interface StockAlertStats {
  totalAlerts: number;
  criticalAlerts: number;
  outOfStockAlerts: number;
  minimumStockAlerts: number;
}

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(StockAlertView)
    private readonly stockAlertViewRepository: Repository<StockAlertView>,
  ) {}

  /**
   * Obtiene todas las alertas de stock activas
   * @returns Lista de productos con stock bajo o crítico
   */
  async getAllStockAlerts(): Promise<StockAlertView[]> {
    this.logger.log('📋 Obteniendo todas las alertas de stock activas');

    return this.stockAlertViewRepository.find({
      order: {
        currentStock: 'ASC', // Los con menos stock primero
        deficit: 'DESC', // Mayor déficit primero
      },
    });
  }

  /**
   * Obtiene estadísticas de alertas
   * @returns Estadísticas de alertas por tipo
   */
  async getAlertStats(): Promise<StockAlertStats> {
    this.logger.log('📊 Obteniendo estadísticas de alertas');

    const allAlerts = await this.stockAlertViewRepository.find();

    const stats: StockAlertStats = {
      totalAlerts: allAlerts.length,
      criticalAlerts: allAlerts.filter(
        (alert) => alert.currentStock < alert.minimumStock,
      ).length,
      outOfStockAlerts: allAlerts.filter((alert) => alert.currentStock === 0)
        .length,
      minimumStockAlerts: allAlerts.filter(
        (alert) => alert.currentStock === alert.minimumStock,
      ).length,
    };

    this.logger.log(`✅ Estadísticas calculadas: ${JSON.stringify(stats)}`);
    return stats;
  }

  /**
   * Obtiene alertas críticas (stock menor al mínimo)
   * @returns Lista de productos con stock crítico
   */
  async getCriticalAlerts(): Promise<StockAlertView[]> {
    this.logger.log('🚨 Obteniendo alertas críticas');

    return this.stockAlertViewRepository
      .createQueryBuilder('alert')
      .where('alert.currentStock < alert.minimumStock')
      .orderBy('alert.deficit', 'DESC')
      .getMany();
  }

  /**
   * Obtiene productos sin stock
   * @returns Lista de productos sin stock
   */
  async getOutOfStockAlerts(): Promise<StockAlertView[]> {
    this.logger.log('❌ Obteniendo productos sin stock');

    return this.stockAlertViewRepository
      .createQueryBuilder('alert')
      .where('alert.currentStock = 0')
      .orderBy('alert.productName', 'ASC')
      .getMany();
  }
}
