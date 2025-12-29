import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async paginate(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [rows, total] = await this.users.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    } as FindManyOptions<User>);
    const totalPages = Math.ceil(total / limit) || 1;
    return { rows, total, page, limit, totalPages };
  }

  async findById(id: string) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...rest } = user as any;
    return rest;
  }

  async create(data: Partial<User> & { password: string }) {
    const existing = await this.users.findOne({
      where: [
        { email: data.email as string },
        { username: data.username as string },
      ],
    });
    if (existing)
      throw new ConflictException('Email or username already in use');
    const hashed = await bcrypt.hash(data.password, 12);
    const user = this.users.create({ ...data, password: hashed });
    const saved = await this.users.save(user);
    const { password, ...rest } = saved as any;
    return rest;
  }

  async update(id: string, data: Partial<User> & { password?: string }) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (data.password) {
      user.password = await bcrypt.hash(data.password, 12);
    }
    if (data.email !== undefined) user.email = data.email;
    if (data.username !== undefined) user.username = data.username;
    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.role !== undefined) user.role = data.role as any;
    if (data.isEmailVerified !== undefined)
      user.isEmailVerified = !!data.isEmailVerified;
    const saved = await this.users.save(user);
    const { password, ...rest } = saved as any;
    return rest;
  }
}
