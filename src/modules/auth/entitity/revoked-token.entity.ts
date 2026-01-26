import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" } })
export class RevokedToken {
    @Prop({ required: true, unique: true, index: true })
    token: string;

    @Prop({ required: true })
    expiresAt: Date;
}

export type RevokedTokenDocument = RevokedToken & Document;
export const RevokedTokenSchema = SchemaFactory.createForClass(RevokedToken);

// Expirar automáticamente los tokens revocados
RevokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
