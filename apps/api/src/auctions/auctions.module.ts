import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { Auction } from '../entities/auction.entity';
import { Bid } from '../entities/bid.entity';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auction, Bid, User, Category]),
    ScheduleModule.forRoot(),
  ],
  providers: [AuctionsService, BidsService],
  controllers: [AuctionsController, BidsController],
  exports: [AuctionsService, BidsService],
})
export class AuctionsModule {}
