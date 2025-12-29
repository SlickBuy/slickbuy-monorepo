import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe | null = null;
  constructor() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key && key.trim() !== '') {
      this.stripe = new Stripe(key, { apiVersion: '2024-06-20' } as any);
    } else {
      console.warn(
        'STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.',
      );
    }
  }

  async createPaymentIntent(
    amountCents: number,
    currency = 'usd',
    metadata?: Record<string, string>,
  ) {
    if (!this.stripe) {
      throw new Error(
        'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
      );
    }
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
    if (!this.stripe) {
      throw new Error(
        'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
      );
    }
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }
}
