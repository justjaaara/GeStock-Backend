import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

interface TokenData {
  ip: string;
  timestamp: number;
}

@Injectable()
export class TokenManagerService {
  private readonly logger = new Logger(TokenManagerService.name);
  private readonly usedTokens = new Set<string>();
  private readonly tokenRequestMap = new Map<string, TokenData>();
  private readonly TOKEN_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutos

  constructor() {
    // Limpiar tokens expirados cada 30 minutos
    setInterval(() => this.cleanExpiredTokens(), 30 * 60 * 1000);
  }

  /**
   * Registra un token con su IP y timestamp
   */
  registerToken(token: string, ip: string): void {
    this.tokenRequestMap.set(token, {
      ip,
      timestamp: Date.now(),
    });
    this.logger.log(`✅ Token registrado desde IP: ${ip}`);
  }

  /**
   * Verifica si un token ya fue usado
   */
  isTokenUsed(token: string): boolean {
    return this.usedTokens.has(token);
  }

  /**
   * Marca un token como usado
   */
  markTokenAsUsed(token: string): void {
    this.usedTokens.add(token);
    this.tokenRequestMap.delete(token);
    this.logger.log(`🔒 Token marcado como usado`);
  }

  /**
   * Valida que el token provenga de la misma IP
   */
  validateTokenIP(token: string, currentIP: string): void {
    const tokenData = this.tokenRequestMap.get(token);

    if (!tokenData) {
      this.logger.warn(`⚠️ Token no encontrado en el registro`);
      throw new UnauthorizedException('Token inválido o expirado');
    }

    if (tokenData.ip !== currentIP) {
      this.logger.warn(
        `⚠️ IP no coincide. Esperada: ${tokenData.ip}, Recibida: ${currentIP}`,
      );
      throw new UnauthorizedException(
        'Este enlace solo puede ser usado desde la red donde se solicitó el cambio',
      );
    }
  }

  /**
   * Valida que el token no haya expirado (15 minutos)
   */
  validateTokenAge(token: string): void {
    const tokenData = this.tokenRequestMap.get(token);

    if (!tokenData) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const tokenAge = Date.now() - tokenData.timestamp;

    if (tokenAge > this.TOKEN_EXPIRATION_MS) {
      this.logger.warn(
        `⚠️ Token expirado. Edad: ${Math.floor(tokenAge / 60000)} minutos`,
      );
      throw new UnauthorizedException(
        'El enlace ha expirado. Solicita uno nuevo',
      );
    }
  }

  /**
   * Limpia tokens expirados de la memoria
   */
  private cleanExpiredTokens(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [token, data] of this.tokenRequestMap.entries()) {
      if (now - data.timestamp > this.TOKEN_EXPIRATION_MS) {
        this.tokenRequestMap.delete(token);
        this.usedTokens.delete(token);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(
        `🧹 ${cleanedCount} tokens expirados limpiados. Tokens activos: ${this.tokenRequestMap.size}`,
      );
    }
  }
}
