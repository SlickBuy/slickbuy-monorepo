"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@auction-platform/ui";
import { api } from "@/lib/api";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement)! },
    });
    setLoading(false);
    if (error) {
      show(error.message || "Payment failed", "error");
    } else {
      show("Payment successful", "success");
      router.push("/profile?tab=won");
    }
  };

  return (
    <form onSubmit={pay} className="space-y-4">
      <div className="p-3 border rounded-md">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <Button
        type="submit"
        disabled={loading || !stripe}
        className="btn-accent"
      >
        {loading ? "Processing..." : "Pay"}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await api.post(`/payments/checkout/${paymentId}`);
        if (resp.data?.success) setClientSecret(resp.data.data.clientSecret);
      } catch {
        // noop; surface via UI if needed
      }
    };
    if (paymentId) load();
  }, [paymentId]);

  if (!clientSecret)
    return <div className="max-w-xl mx-auto p-6">Preparing checkout...</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm clientSecret={clientSecret} />
        </Elements>
      </Card>
    </div>
  );
}
