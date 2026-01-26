import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema()
export class UserPreferences extends Document {
    @Prop({ default: 'light' })
    theme: string;
}

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" } })
export class User {
    @Prop({ required: true })
    fullName: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: 'admin' })
    role: string;

    @Prop({ type: UserPreferences, default: () => ({ theme: 'system' }) })
    preferences: UserPreferences;
}

export type UserDocument = User & Document;
export type UserWithId = User & { _id: Types.ObjectId };
export const UserSchema = SchemaFactory.createForClass(User);
