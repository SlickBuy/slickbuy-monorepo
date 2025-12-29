"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 bg-teal-700 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Start Your Collection?
        </h2>
        <p className="text-xl mb-8 text-blue-100">
          Join our community of collectors and start bidding on unique items
          today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth?tab=register">
            <Button size="lg" variant="secondary" className="text-gray-900">
              Create Account
            </Button>
          </Link>
          <Link href="/sell">
            <Button
              size="lg"
              variant="ghost"
              className="text-white border-white hover:bg-white hover:text-blue-600"
            >
              Sell Your Items
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
