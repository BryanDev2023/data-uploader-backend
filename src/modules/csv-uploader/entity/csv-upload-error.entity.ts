import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class CsvUploadError {
  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  status: 'failed' | 'partial';

  @Prop({ required: true, min: 0 })
  totalRows: number;

  @Prop({ required: true, min: 0 })
  successCount: number;

  @Prop({ required: true, min: 0 })
  errorCount: number;

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  errors: Array<Record<string, unknown>>;

  @Prop()
  parseError?: string;
}

export type CsvUploadErrorDocument = CsvUploadError & Document;
export const CsvUploadErrorSchema = SchemaFactory.createForClass(CsvUploadError);
