import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PasswordResetTokenMongodbService } from '../db/password-reset-token-mongodb.service';

@Injectable()
export class PasswordResetTokenCleanupService {
    private readonly logger = new Logger(PasswordResetTokenCleanupService.name);

    constructor(
        private readonly passwordResetTokenService: PasswordResetTokenMongodbService,
    ) { }

    /**
     * Limpieza automática cada 30 minutos
     * Elimina tokens expirados y tokens usados
     */
    @Cron(CronExpression.EVERY_30_MINUTES)
    async cleanupExpiredTokens(): Promise<void> {
        try {
            this.logger.log('🧹 Iniciando limpieza automática de tokens de recuperación de contraseña...');

            const deletedCount = await this.passwordResetTokenService.cleanupOldTokens();

            if (deletedCount > 0) {
                this.logger.log(`✅ Limpieza completada: ${deletedCount} tokens eliminados`);
            } else {
                this.logger.log('✅ Limpieza completada: No hay tokens para eliminar');
            }

            // Log de estadísticas cada hora
            await this.logTokenStats();

        } catch (error) {
            this.logger.error('❌ Error durante la limpieza automática de tokens:', error.message);
        }
    }

    /**
     * Log de estadísticas cada hora
     */
    @Cron(CronExpression.EVERY_HOUR)
    async logTokenStats(): Promise<void> {
        try {
            const stats = await this.passwordResetTokenService.getTokenStats();

            // this.logger.log('📊 Estadísticas de tokens de recuperación de contraseña:', {
            //   total: stats.total,
            //   activos: stats.active,
            //   usados: stats.used,
            //   expirados: stats.expired
            // });

        } catch (error) {
            this.logger.error('❌ Error obteniendo estadísticas de tokens:', error.message);
        }
    }

    /**
     * Limpieza manual (útil para testing o limpieza inmediata)
     */
    async manualCleanup(): Promise<{ deletedCount: number; stats: any }> {
        try {
            this.logger.log('🧹 Ejecutando limpieza manual de tokens...');

            const deletedCount = await this.passwordResetTokenService.cleanupOldTokens();
            const stats = await this.passwordResetTokenService.getTokenStats();

            this.logger.log(`✅ Limpieza manual completada: ${deletedCount} tokens eliminados`);

            return { deletedCount, stats };

        } catch (error) {
            this.logger.error('❌ Error durante la limpieza manual:', error.message);
            throw error;
        }
    }

    /**
     * Limpieza específica de tokens expirados
     */
    async cleanupExpiredOnly(): Promise<number> {
        try {
            this.logger.log('🧹 Limpiando solo tokens expirados...');

            const deletedCount = await this.passwordResetTokenService.deleteExpiredTokens();

            this.logger.log(`✅ Tokens expirados eliminados: ${deletedCount}`);

            return deletedCount;

        } catch (error) {
            this.logger.error('❌ Error limpiando tokens expirados:', error.message);
            throw error;
        }
    }
}
