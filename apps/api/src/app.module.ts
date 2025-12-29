import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuctionsModule } from './auctions/auctions.module';
// import { UploadsModule } from './uploads/uploads.module';
import { CategoriesModule } from './categories/categories.module';
import { PaymentsModule } from './payments/payments.module';
import { UsersModule } from './users/users.module';
import { User } from './entities/user.entity';
import { Auction } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';
import { Category } from './entities/category.entity';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        console.log(url);
        const isProd = process.env.NODE_ENV === 'production';
        return {
          type: 'postgres' as const,
          url,
          entities: [User, Auction, Bid, Category, Payment],
          synchronize: true, // TODO: set to false in production and use migrations
          logging: false,
          ssl: isProd ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    AuthModule,
    AuctionsModule,
    // UploadsModule,
    CategoriesModule,
    UsersModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
