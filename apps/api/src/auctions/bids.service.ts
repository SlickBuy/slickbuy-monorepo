import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from '../entities/bid.entity';
import { Auction } from '../entities/auction.entity';
import { User } from '../entities/user.entity';
import { AuctionStatus } from '@auction-platform/types';
import type { PlaceBidRequest } from '@auction-platform/types';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private bidRepository: Repository<Bid>,
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async placeBid(userId: string, placeBidData: PlaceBidRequest): Promise<Bid> {
    const { auctionId, amount } = placeBidData;

    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId },
      relations: ['bids'],
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    const now = new Date();

    // Auto-correct status based on time window to avoid race conditions
    if (auction.status !== AuctionStatus.ACTIVE) {
      if (now < auction.startTime) {
        throw new BadRequestException('Auction is not active');
      }
      if (now >= auction.endTime) {
        throw new BadRequestException('Auction has ended');
      }
      // We are within the active window, flip status to ACTIVE
      await this.auctionRepository.update(auctionId, {
        status: AuctionStatus.ACTIVE,
      });
      auction.status = AuctionStatus.ACTIVE;
    }

    if (now >= auction.endTime) {
      throw new BadRequestException('Auction has ended');
    }

    if (amount <= auction.currentPrice) {
      throw new BadRequestException('Bid must be higher than current price');
    }

    // Mark previous winning bid as not winning
    await this.bidRepository.update(
      { auctionId, isWinning: true },
      { isWinning: false },
    );

    const bid = this.bidRepository.create({
      amount,
      auctionId,
      bidderId: userId,
      isWinning: true,
    });

    const savedBid = await this.bidRepository.save(bid);

    // Update auction current price
    await this.auctionRepository.update(auctionId, { currentPrice: amount });

    // Anti-sniping extension: if less than 5 minutes remain, extend by 30 seconds
    const remainingMs = auction.endTime.getTime() - now.getTime();
    if (remainingMs > 0 && remainingMs < 5 * 60 * 1000) {
      const extendedEnd = new Date(auction.endTime.getTime() + 30 * 1000);
      await this.auctionRepository.update(auctionId, { endTime: extendedEnd });
      auction.endTime = extendedEnd;
    }

    // Return bid with relations
    const result = await this.bidRepository.findOne({
      where: { id: savedBid.id },
      relations: ['bidder', 'auction'],
    });
    if (!result) {
      throw new NotFoundException('Bid not found after creation');
    }
    return this.maskBidder(result);
  }

  async getBidsForAuction(auctionId: string): Promise<Bid[]> {
    const bids = await this.bidRepository.find({
      where: { auctionId },
      relations: ['bidder'],
      order: { createdAt: 'DESC' },
    });
    return bids.map((bid) => this.maskBidder(bid));
  }

  async getAllBids(
    page = 1,
    limit = 20,
  ): Promise<{ bids: Bid[]; total: number }> {
    const skip = (page - 1) * limit;
    const [bids, total] = await this.bidRepository.findAndCount({
      relations: ['auction', 'auction.seller', 'bidder'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return { bids: bids.map((bid) => this.maskBidder(bid)), total };
  }

  async getUserBids(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ bids: Bid[]; total: number }> {
    const skip = (page - 1) * limit;

    const [bids, total] = await this.bidRepository.findAndCount({
      where: { bidderId: userId },
      relations: ['auction', 'auction.seller'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { bids, total };
  }

  async getWinningBid(auctionId: string): Promise<Bid | null> {
    const found = await this.bidRepository.findOne({
      where: { auctionId, isWinning: true },
      relations: ['bidder'],
    });
    return found ? this.maskBidder(found) : null;
  }

  async deleteBid(id: string): Promise<void> {
    await this.bidRepository.delete(id);
  }

  private maskUsername(username: string): string {
    if (!username || username.length <= 4) {
      return '****';
    }
    return username.substring(0, 4) + '*'.repeat(username.length - 4);
  }

  private maskBidder(bid: Bid): Bid {
    if (bid.bidder && bid.bidder.username) {
      bid.bidder = {
        ...bid.bidder,
        username: this.maskUsername(bid.bidder.username),
      };
    }
    return bid;
  }
}
