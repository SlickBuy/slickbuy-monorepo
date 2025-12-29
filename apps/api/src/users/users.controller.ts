import { Controller, Get, Query, Param, Post, Body, Put } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async list(@Query('page') page = '1', @Query('limit') limit = '20') {
    const p = Math.max(parseInt(page as string, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 100);
    const { rows, total, totalPages } = await this.users.paginate(p, l);
    return {
      success: true,
      data: rows,
      pagination: { page: p, limit: l, total, totalPages },
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const user = await this.users.findById(id);
    return { success: true, data: user };
  }

  @Post()
  async create(
    @Body()
    body: {
      email: string;
      username: string;
      firstName: string;
      lastName: string;
      role?: string;
      password: string;
    },
  ) {
    const user = await this.users.create(body as any);
    return { success: true, data: user };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      email: string;
      username: string;
      firstName: string;
      lastName: string;
      role: string;
      password: string;
      isEmailVerified: boolean;
    }>,
  ) {
    const user = await this.users.update(id, body as any);
    return { success: true, data: user };
  }
}
