import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" } })
export class PasswordResetToken {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ required: true, unique: true, index: true })
    token: string;

    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ default: false })
    used: boolean;
}

export type PasswordResetTokenDocument = PasswordResetToken & Document;
export const PasswordResetTokenSchema = SchemaFactory.createForClass(PasswordResetToken);

// Crear índice TTL para limpieza automática
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
