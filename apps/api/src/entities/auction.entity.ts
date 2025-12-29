import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AuctionStatus } from '@auction-platform/types';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Bid } from './bid.entity';

@Entity('auctions')
export class Auction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('simple-array')
  images: string[];

  @Column('decimal', { precision: 10, scale: 2 })
  startingPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  currentPrice: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  reservePrice: number;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({
    type: 'text',
    default: AuctionStatus.DRAFT,
  })
  status: AuctionStatus;

  @Column()
  sellerId: string;

  @ManyToOne(() => User, (user) => user.auctions)
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column()
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.auctions)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => Bid, (bid) => bid.auction, { cascade: true })
  bids: Bid[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
