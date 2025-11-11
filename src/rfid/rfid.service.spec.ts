import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { RfidService } from './rfid.service';
import { RfidDto } from './dto/rfid.dto';

describe('RfidService', () => {
  let service: RfidService;
  let mockDataSource: any;

  beforeEach(async () => {
    mockDataSource = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RfidService,
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<RfidService>(RfidService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processRfidLoad', () => {
    let consoleErrorMock: jest.SpyInstance;
    let loggerErrorMock: jest.SpyInstance;
    beforeAll(() => {
      // silenciamos console.error para evitar ruido en la salida CI cuando el test forza errores
      consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
      // silenciamos Logger.error del framework Nest para que no aparezcan errores esperados
      loggerErrorMock = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    });
    afterAll(() => {
      consoleErrorMock.mockRestore();
      loggerErrorMock.mockRestore();
    });

    it('debería procesar carga RFID exitosamente', async () => {
      const rfidDto: RfidDto = {
        p_rfid_code: 'RFID123',
        p_quantity: 10,
        p_category_id: 1,
        p_measurement_id: 1,
        p_state_id: 1,
        p_product_name: 'Producto RFID',
        p_unit_price: 100,
        p_user_id: 1,
        p_movement_reason: 'ENTRADA',
        p_batch_desc: 'Lote 1',
      };

      const mockResult = [{ success: true }];
      mockDataSource.query.mockResolvedValue(mockResult);

      const result = await service.processRfidLoad(rfidDto);

      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('CARGA_RFID_MASIVA'),
        expect.arrayContaining([
          'RFID123',
          'Lote 1',
          null,
          null,
          'Producto RFID',
          100,
          null,
          1,
          1,
          1,
          10,
          null,
          1,
          'ENTRADA',
        ]),
      );

      // El servicio envuelve la respuesta con success/message/data
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty(
        'message',
        'Carga RFID procesada correctamente',
      );
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('batch_desc', 'Lote 1');
    });

    it('debería manejar errores del procedimiento almacenado', async () => {
      const rfidDto: RfidDto = {
        p_rfid_code: 'RFID123',
        p_quantity: 10,
        p_category_id: 1,
        p_measurement_id: 1,
        p_state_id: 1,
        p_product_name: 'Producto RFID',
        p_unit_price: 100,
        p_user_id: 1,
        p_movement_reason: 'ENTRADA',
        p_batch_desc: 'Lote 1',
      };

      const error = new Error('Database error');
      mockDataSource.query.mockRejectedValue(error);

      await expect(service.processRfidLoad(rfidDto)).rejects.toThrow(
        'Error procesando carga RFID',
      );
    });
  });

  describe('getRfidData', () => {
    it('debería retornar datos RFID (método no implementado)', async () => {
      // Este método no está implementado en el servicio actual
      // Si se implementa en el futuro, agregar pruebas aquí
      expect(service).toBeDefined();
    });
  });
});
