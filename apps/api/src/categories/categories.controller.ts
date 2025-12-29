import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Post()
  async create(
    @Body()
    body: { name: string; slug: string; description?: string; parentId?: string },
  ) {
    const category = await this.service.create(body);
    return { success: true, data: category };
  }

  @Get()
  async list() {
    const categories = await this.service.findAll();
    return { success: true, data: categories };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<{ name: string; slug: string; description?: string; parentId?: string }>,
  ) {
    const category = await this.service.update(id, body);
    return { success: true, data: category };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { success: true };
  }
}
