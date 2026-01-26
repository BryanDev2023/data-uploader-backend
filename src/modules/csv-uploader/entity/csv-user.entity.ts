import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" } })
export class CsvUser {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true, min: 1 })
    age: number;
}

export type CsvUserDocument = CsvUser & Document;
export const CsvUserSchema = SchemaFactory.createForClass(CsvUser);
