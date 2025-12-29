import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository, MoreThan, LessThanOrEqual } from 'typeorm';
import { Bid } from '../entities/bid.entity';
import { Auction } from '../entities/auction.entity';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';
import {
  CreateAuctionRequest,
  AuctionStatus,
  ApiResponse,
  PaginatedResponse,
} from '@auction-platform/types';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Bid)
    private bidRepository: Repository<Bid>,
  ) {}

  async createAuction(
    userId: string,
    createAuctionData: CreateAuctionRequest,
  ): Promise<Auction> {
    const { categoryId, ...auctionData } = createAuctionData;

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Determine initial status based on times
    const now = new Date();
    const start = new Date(auctionData.startTime);
    const end = new Date(auctionData.endTime);

    let status: AuctionStatus = AuctionStatus.SCHEDULED;
    if (end <= now) {
      status = AuctionStatus.ENDED;
    } else if (start <= now && end > now) {
      status = AuctionStatus.ACTIVE;
    } else {
      status = AuctionStatus.SCHEDULED;
    }

    const auction = this.auctionRepository.create({
      ...auctionData,
      sellerId: userId,
      categoryId,
      currentPrice: auctionData.startingPrice,
      status,
    });

    return this.auctionRepository.save(auction);
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: AuctionStatus,
    categoryId?: string,
  ): Promise<PaginatedResponse<Auction>> {
    const skip = (page - 1) * limit;

    const query = this.auctionRepository
      .createQueryBuilder('auction')
      .leftJoinAndSelect('auction.seller', 'seller')
      .leftJoinAndSelect('auction.category', 'category')
      .leftJoinAndSelect('auction.bids', 'bids')
      .leftJoinAndSelect('bids.bidder', 'bidder');

    if (status) {
      query.where('auction.status = :status', { status });
    }

    if (categoryId) {
      query.andWhere('auction.categoryId = :categoryId', { categoryId });
    }

    query.orderBy('auction.createdAt', 'DESC').skip(skip).take(limit);

    const [auctions, total] = await query.getManyAndCount();

    return {
      success: true,
      data: auctions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Auction> {
    const auction = await this.auctionRepository.findOne({
      where: { id },
      relations: ['seller', 'category', 'bids', 'bids.bidder'],
      order: { bids: { createdAt: 'DESC' } },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    return auction;
  }

  async updateAuction(
    id: string,
    userId: string,
    updateData: Partial<CreateAuctionRequest>,
  ): Promise<Auction> {
    const auction = await this.findOne(id);

    if (auction.sellerId !== userId) {
      throw new ForbiddenException('You can only update your own auctions');
    }

    if (
      auction.status !== AuctionStatus.DRAFT &&
      auction.status !== AuctionStatus.SCHEDULED
    ) {
      throw new ForbiddenException(
        'Cannot update auction that has already started',
      );
    }

    Object.assign(auction, updateData);
    return this.auctionRepository.save(auction);
  }

  async deleteAuction(id: string, userId: string): Promise<void> {
    const auction = await this.findOne(id);

    if (auction.sellerId !== userId) {
      throw new ForbiddenException('You can only delete your own auctions');
    }

    if (auction.status === AuctionStatus.ACTIVE) {
      throw new ForbiddenException('Cannot delete active auction');
    }

    await this.auctionRepository.remove(auction);
  }

  async getActiveAuctions(): Promise<Auction[]> {
    const now = new Date();
    return this.auctionRepository.find({
      where: {
        status: AuctionStatus.ACTIVE,
        endTime: MoreThan(now),
      },
      relations: ['seller', 'category', 'bids'],
    });
  }

  async updateAuctionStatus(): Promise<void> {
    const now = new Date();

    // Start scheduled auctions whose startTime has passed (and not already ended)
    await this.auctionRepository.update(
      {
        status: AuctionStatus.SCHEDULED,
        startTime: LessThanOrEqual(now),
        endTime: MoreThan(now),
      },
      { status: AuctionStatus.ACTIVE },
    );

    // End active auctions whose endTime has passed
    await this.auctionRepository.update(
      {
        status: AuctionStatus.ACTIVE,
        endTime: LessThanOrEqual(now),
      },
      { status: AuctionStatus.ENDED },
    );
  }

  // Run every minute to keep auction statuses in sync
  @Cron(CronExpression.EVERY_MINUTE)
  async handleStatusCron() {
    await this.updateAuctionStatus();
  }

  async getDashboardStats(): Promise<{
    active: number;
    scheduled: number;
    users: number;
    revenue: number;
  }> {
    const [active, scheduled, users] = await Promise.all([
      this.auctionRepository.count({ where: { status: AuctionStatus.ACTIVE } }),
      this.auctionRepository.count({
        where: { status: AuctionStatus.SCHEDULED },
      }),
      this.userRepository.count(),
    ]);

    const since = new Date();
    since.setDate(since.getDate() - 30);
    // Sum winning bids in last 30 days
    const qb = this.bidRepository
      .createQueryBuilder('bid')
      .select('COALESCE(SUM(bid.amount), 0)', 'sum')
      .where('bid.isWinning = :win', { win: true })
      .andWhere('bid.createdAt >= :since', { since });
    const sumRow = await qb.getRawOne<{ sum: string }>();
    const revenue = Number(sumRow?.sum ?? 0);

    return { active, scheduled, users, revenue };
  }
}
