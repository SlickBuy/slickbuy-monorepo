import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private readonly repo: Repository<Category>,
  ) {}

  async create(data: { name: string; slug: string; description?: string; parentId?: string }) {
    const exists = await this.repo.findOne({ where: [{ name: data.name }, { slug: data.slug }] });
    if (exists) throw new ConflictException('Category with same name or slug exists');

    const category = this.repo.create({
      name: data.name,
      slug: data.slug,
      description: data.description ?? '',
      parentId: data.parentId,
    });
    return this.repo.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Category | null> {
    return this.repo.findOne({ where: { id } });
  }

  async update(
    id: string,
    data: Partial<{ name: string; slug: string; description?: string; parentId?: string }>,
  ) {
    if (data.slug) {
      const conflict = await this.repo.findOne({ where: { slug: data.slug } });
      if (conflict && conflict.id !== id) {
        throw new ConflictException('Category with this slug already exists');
      }
    }
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
