import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PasswordResetToken, PasswordResetTokenDocument } from '../entitity/password-reset-token.entity';

export interface IPasswordResetTokenDao {
    create(userId: string, token: string, expiresAt: Date): Promise<PasswordResetTokenDocument>;
    findByToken(token: string): Promise<PasswordResetTokenDocument | null>;
    findByUserId(userId: string): Promise<PasswordResetTokenDocument[]>;
    markAsUsed(token: string): Promise<PasswordResetTokenDocument | null>;
    deleteByToken(token: string): Promise<boolean>;
    deleteByUserId(userId: string): Promise<number>;
    deleteExpiredTokens(): Promise<number>;
    cleanupOldTokens(): Promise<number>;
}

@Injectable()
export class PasswordResetTokenMongodbService implements IPasswordResetTokenDao {
    constructor(
        @InjectModel(PasswordResetToken.name)
        private readonly passwordResetTokenModel: Model<PasswordResetTokenDocument>,
    ) { }

    async create(userId: string, token: string, expiresAt: Date): Promise<PasswordResetTokenDocument> {
        const passwordResetToken = new this.passwordResetTokenModel({
            userId: new Types.ObjectId(userId),
            token,
            expiresAt,
            used: false,
        });

        return passwordResetToken.save();
    }

    async findByToken(token: string): Promise<PasswordResetTokenDocument | null> {
        return this.passwordResetTokenModel.findOne({
            token,
            used: false,
            expiresAt: { $gt: new Date() } // Solo tokens no expirados
        }).exec();
    }

    async findByUserId(userId: string): Promise<PasswordResetTokenDocument[]> {
        return this.passwordResetTokenModel.find({
            userId: new Types.ObjectId(userId),
            used: false,
            expiresAt: { $gt: new Date() } // Solo tokens no expirados
        }).exec();
    }

    async markAsUsed(token: string): Promise<PasswordResetTokenDocument | null> {
        return this.passwordResetTokenModel.findOneAndUpdate(
            { token, used: false },
            { used: true },
            { new: true }
        ).exec();
    }

    async deleteByToken(token: string): Promise<boolean> {
        const result = await this.passwordResetTokenModel.deleteOne({ token }).exec();
        return (result.deletedCount ?? 0) > 0;
    }

    async deleteByUserId(userId: string): Promise<number> {
        const result = await this.passwordResetTokenModel.deleteMany({
            userId: new Types.ObjectId(userId)
        }).exec();
        return result.deletedCount ?? 0;
    }

    async deleteExpiredTokens(): Promise<number> {
        const result = await this.passwordResetTokenModel.deleteMany({
            expiresAt: { $lt: new Date() }
        }).exec();
        return result.deletedCount ?? 0;
    }

    async cleanupOldTokens(): Promise<number> {
        // Eliminar tokens usados y tokens expirados
        const result = await this.passwordResetTokenModel.deleteMany({
            $or: [
                { used: true },
                { expiresAt: { $lt: new Date() } }
            ]
        }).exec();
        return result.deletedCount ?? 0;
    }

    // Método para obtener estadísticas
    async getTokenStats(): Promise<{
        total: number;
        active: number;
        used: number;
        expired: number;
    }> {
        const now = new Date();

        const [total, active, used, expired] = await Promise.all([
            this.passwordResetTokenModel.countDocuments(),
            this.passwordResetTokenModel.countDocuments({
                used: false,
                expiresAt: { $gt: now }
            }),
            this.passwordResetTokenModel.countDocuments({ used: true }),
            this.passwordResetTokenModel.countDocuments({
                expiresAt: { $lt: now }
            })
        ]);

        return { total, active, used, expired };
    }
}
