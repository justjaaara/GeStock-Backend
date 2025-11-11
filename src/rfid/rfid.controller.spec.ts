import { Test, TestingModule } from '@nestjs/testing';
import { RfidController } from './rfid.controller';
import { RfidService } from './rfid.service';
import { RfidDto } from './dto/rfid.dto';

describe('RfidController', () => {
  let controller: RfidController;
  let service: RfidService;

  const mockRfidService = {
    processRfidLoad: jest.fn(),
    healthCheck: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RfidController],
      providers: [
        {
          provide: RfidService,
          useValue: mockRfidService,
        },
      ],
    }).compile();

    controller = module.get<RfidController>(RfidController);
    service = module.get<RfidService>(RfidService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('receive', () => {
    it('debería procesar datos RFID válidos', async () => {
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

      const mockResponse = { success: true, message: 'Procesado exitosamente' };

      mockRfidService.processRfidLoad.mockResolvedValue(mockResponse);

      const result = await controller.receive(rfidDto);

      expect(mockRfidService.processRfidLoad).toHaveBeenCalledWith(rfidDto);
      expect(result).toEqual(mockResponse);
    });

    it('debería rechazar datos RFID sin p_rfid_code', async () => {
      const invalidDto = {
        p_quantity: 10,
      } as RfidDto;

      await expect(controller.receive(invalidDto)).rejects.toThrow(
        'p_rfid_code es requerido',
      );
    });

    it('debería rechazar datos RFID con cantidad inválida', async () => {
      const invalidDto = {
        p_rfid_code: 'RFID123',
        p_quantity: 0,
      } as RfidDto;

      await expect(controller.receive(invalidDto)).rejects.toThrow(
        'p_quantity debe ser mayor a 0',
      );
    });

    it('debería rechazar datos RFID sin campos requeridos', async () => {
      const invalidDto = {
        p_rfid_code: 'RFID123',
        p_quantity: 10,
      } as RfidDto;

      await expect(controller.receive(invalidDto)).rejects.toThrow(
        'p_category_id es requerido',
      );
    });
  });

  describe('health', () => {
    it('debería retornar estado de salud del servicio RFID', async () => {
      mockRfidService.healthCheck.mockResolvedValue(true);

      const result = await controller.health();

      expect(mockRfidService.healthCheck).toHaveBeenCalled();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('service', 'rfid');
      expect(result).toHaveProperty('database', 'connected');
      expect(result).toHaveProperty('timestamp');
    });
  });
});
