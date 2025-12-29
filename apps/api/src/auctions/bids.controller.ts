import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { BidsService } from './bids.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type {
  PlaceBidRequest,
  ApiResponse,
  PaginatedResponse,
} from '@auction-platform/types';
import { Bid } from '../entities/bid.entity';

@Controller('bids')
export class BidsController {
  constructor(private bidsService: BidsService) {}
  // Admin list of bids
  @Get()
  async list(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<PaginatedResponse<Bid>> {
    try {
      const { bids, total } = await this.bidsService.getAllBids(+page, +limit);
      return {
        success: true,
        data: bids,
        pagination: {
          page: +page,
          limit: +limit,
          total,
          totalPages: Math.ceil(total / +limit),
        },
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message,
        errors: [error.message],
        pagination: { page: +page, limit: +limit, total: 0, totalPages: 0 },
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async placeBid(
    @Request() req: any,
    @Body() placeBidData: PlaceBidRequest,
  ): Promise<ApiResponse<Bid>> {
    try {
      const bid = await this.bidsService.placeBid(req.user.id, placeBidData);
      return {
        success: true,
        data: bid,
        message: 'Bid placed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: [error.message],
      };
    }
  }

  @Get('auction/:auctionId')
  async getBidsForAuction(
    @Param('auctionId') auctionId: string,
  ): Promise<ApiResponse<Bid[]>> {
    try {
      const bids = await this.bidsService.getBidsForAuction(auctionId);
      return {
        success: true,
        data: bids,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: [error.message],
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-bids')
  async getUserBids(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<PaginatedResponse<Bid>> {
    try {
      const { bids, total } = await this.bidsService.getUserBids(
        req.user.id,
        +page,
        +limit,
      );
      return {
        success: true,
        data: bids,
        pagination: {
          page: +page,
          limit: +limit,
          total,
          totalPages: Math.ceil(total / +limit),
        },
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message,
        errors: [error.message],
        pagination: { page: +page, limit: +limit, total: 0, totalPages: 0 },
      };
    }
  }

  @Get('winning/:auctionId')
  async getWinningBid(
    @Param('auctionId') auctionId: string,
  ): Promise<ApiResponse<Bid | null>> {
    try {
      const bid = await this.bidsService.getWinningBid(auctionId);
      return {
        success: true,
        data: bid,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: [error.message],
      };
    }
  }

  // Admin delete bid
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<ApiResponse> {
    try {
      await this.bidsService.deleteBid(id);
      return { success: true, message: 'Bid deleted' };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: [error.message],
      };
    }
  }
}
