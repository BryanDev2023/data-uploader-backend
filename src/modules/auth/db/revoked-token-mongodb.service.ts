import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RevokedToken, RevokedTokenDocument } from '../entitity/revoked-token.entity';

@Injectable()
export class RevokedTokenMongodbService {
  constructor(
    @InjectModel(RevokedToken.name)
    private readonly revokedTokenModel: Model<RevokedTokenDocument>,
  ) {}

  async revoke(token: string, expiresAt: Date): Promise<void> {
    await this.revokedTokenModel.updateOne(
      { token },
      { token, expiresAt },
      { upsert: true },
    ).exec();
  }

  async isRevoked(token: string): Promise<boolean> {
    const result = await this.revokedTokenModel.findOne({ token }).lean().exec();
    return !!result;
  }
}
