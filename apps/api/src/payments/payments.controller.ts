import { Body, Controller, Get, Headers, Param, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import type { ApiResponse } from '@auction-platform/types';
import { StripeService } from './stripe.service';
import type { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(
    private payments: PaymentsService,
    private stripe: StripeService,
  ) {}

  @Post('create')
  async create(
    @Body()
    payload: {
      userId: string;
      auctionId: string;
      amountCents: number;
    },
  ): Promise<ApiResponse<any>> {
    const p = await this.payments.createPending(
      payload.userId,
      payload.auctionId,
      payload.amountCents,
    );
    return { success: true, data: p };
  }

  // Create Stripe PaymentIntent for a payment record
  @Post('checkout/:paymentId')
  async checkout(
    @Param('paymentId') paymentId: string,
  ): Promise<ApiResponse<{ clientSecret: string }>> {
    // In a fuller version, we'd validate ownership and read amount from DB
    const payment = await (this.payments as any).paymentRepo.findOne({
      where: { id: paymentId },
    });
    if (!payment)
      return {
        success: false,
        message: 'Payment not found',
        errors: ['not_found'],
      };
    const intent = await this.stripe.createPaymentIntent(
      payment.amountCents,
      payment.currency,
      {
        paymentId,
        auctionId: payment.auctionId,
      },
    );
    await this.payments.attachStripeIntent(paymentId, intent.id);
    return {
      success: true,
      data: { clientSecret: intent.client_secret as string },
    };
  }

  // Stripe webhook to mark success/failed
  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
      const event = await this.stripe.retrieveEvent(
        signature,
        req.rawBody as any,
        secret,
      );
      if (event.type === 'payment_intent.succeeded') {
        const pi = event.data.object as any;
        const paymentId = pi.metadata?.paymentId;
        if (paymentId) await this.payments.markSucceeded(paymentId);
      }
      if (event.type === 'payment_intent.payment_failed') {
        const pi = event.data.object as any;
        const paymentId = pi.metadata?.paymentId;
        if (paymentId) await this.payments.markFailed(paymentId);
      }
      return { received: true };
    } catch (e) {
      return { error: 'webhook_error' };
    }
  }
}
