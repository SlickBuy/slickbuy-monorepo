import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor() {
    const key = process.env.STRIPE_SECRET_KEY || '';
    this.stripe = new Stripe(key, { apiVersion: '2024-06-20' } as any);
  }

  async createPaymentIntent(
    amountCents: number,
    currency = 'usd',
    metadata?: Record<string, string>,
  ) {
    return this.stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    });
  }

  async retrieveEvent(
    signature: string,
    payload: Buffer,
    webhookSecret: string,
  ) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }
}
