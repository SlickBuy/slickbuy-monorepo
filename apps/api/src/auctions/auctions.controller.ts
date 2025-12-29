import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type {
  CreateAuctionRequest,
  ApiResponse,
  PaginatedResponse,
  AuctionStatus,
} from '@auction-platform/types';
import { Auction } from '../entities/auction.entity';

@Controller('auctions')
export class AuctionsController {
  constructor(private auctionsService: AuctionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createAuction(
    @Request() req: any,
    @Body() createAuctionData: CreateAuctionRequest,
  ): Promise<ApiResponse<Auction>> {
    try {
      const auction = await this.auctionsService.createAuction(
        req.user.id,
        createAuctionData,
      );
      return {
        success: true,
        data: auction,
        message: 'Auction created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: [error.message],
      };
    }
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: AuctionStatus,
    @Query('categoryId') categoryId?: string,
  ): Promise<PaginatedResponse<Auction>> {
    return this.auctionsService.findAll(+page, +limit, status, categoryId);
  }

  // Dashboard metrics for admin
  @Get('stats/dashboard')
  async stats(): Promise<ApiResponse<any>> {
    try {
      const stats = await this.auctionsService.getDashboardStats();
      return { success: true, data: stats };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: [error.message],
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Auction>> {
    try {
      const auction = await this.auctionsService.findOne(id);
      return {
        success: true,
        data: auction,
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
  @Put(':id')
  async updateAuction(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateData: Partial<CreateAuctionRequest>,
  ): Promise<ApiResponse<Auction>> {
    try {
      const auction = await this.auctionsService.updateAuction(
        id,
        req.user.id,
        updateData,
      );
      return {
        success: true,
        data: auction,
        message: 'Auction updated successfully',
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
  @Delete(':id')
  async deleteAuction(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ApiResponse> {
    try {
      await this.auctionsService.deleteAuction(id, req.user.id);
      return {
        success: true,
        message: 'Auction deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: [error.message],
      };
    }
  }
}
