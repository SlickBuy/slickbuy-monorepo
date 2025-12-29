import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
  ) {}

  async createPending(userId: string, auctionId: string, amountCents: number) {
    const payment = this.paymentRepo.create({
      userId,
      auctionId,
      amountCents,
      status: PaymentStatus.PENDING,
    });
    return this.paymentRepo.save(payment);
  }

  async attachStripeIntent(id: string, intentId: string) {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    payment.stripePaymentIntentId = intentId;
    return this.paymentRepo.save(payment);
  }

  async markSucceeded(id: string) {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    payment.status = PaymentStatus.SUCCEEDED;
    return this.paymentRepo.save(payment);
  }

  async markFailed(id: string) {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    payment.status = PaymentStatus.FAILED;
    return this.paymentRepo.save(payment);
  }
}
