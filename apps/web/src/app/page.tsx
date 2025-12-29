"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auctionsAPI, categoriesAPI } from "@/lib/api";
import { Auction, AuctionStatus } from "@auction-platform/types";
import { useAuth } from "@/contexts/AuthContext";
import { HeroSection } from "@/components/home/Hero";
import { CategoriesSection } from "@/components/home/Categories";
import { HowItWorksSection } from "@/components/home/HowItWorks";
import { FeaturedAuctionsSection } from "@/components/home/FeaturedAuctions";
import { CTASection } from "@/components/home/CTA";

export default function Home() {
  const [featuredAuctions, setFeaturedAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<
    { id: string; name: string; description?: string }[]
  >([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchFeaturedAuctions = async () => {
      try {
        const response = await auctionsAPI.getAuctions({ limit: 6 });
        if (response.data.success) {
          const list: Auction[] = response.data.data || [];
          const filtered = list.filter((a) =>
            [AuctionStatus.ACTIVE, AuctionStatus.SCHEDULED].includes(
              a.status as unknown as AuctionStatus
            )
          );
          setFeaturedAuctions(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch auctions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedAuctions();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const resp = await categoriesAPI.getCategories();
        if (resp.data?.success) setCategories(resp.data.data || []);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleViewDetails = (id: string) => {
    window.location.href = `/auctions/${id}`;
  };

  const handlePlaceBid = (id: string) => {
    window.location.href = `/auctions/${id}`;
  };

  return (
    <div className="min-h-screen">
      <HeroSection />

      <CategoriesSection
        categories={categories}
        isLoading={isLoadingCategories}
      />

      {/* How It Works - hidden for authenticated users */}
      {!isAuthenticated && <HowItWorksSection />}

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AuctionHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the thrill of online auctions with our secure,
              user-friendly platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure Bidding
              </h3>
              <p className="text-gray-600">
                Advanced security measures ensure safe and fair auctions for all
                participants.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Real-time Bidding
              </h3>
              <p className="text-gray-600">
                Experience live auction excitement with instant bid updates and
                notifications.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Unique Items
              </h3>
              <p className="text-gray-600">
                Discover rare collectibles, antiques, and unique items you
                won&apos;t find elsewhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FeaturedAuctionsSection
        isLoading={isLoading}
        auctions={featuredAuctions}
        onViewDetails={handleViewDetails}
        onPlaceBid={handlePlaceBid}
      />

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              What bidders say
            </h2>
            <p className="text-gray-600">Trusted by collectors and sellers.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              "I found rare items I couldn't get anywhere else.",
              "Smooth bidding experience and fast shipping.",
              "Great deals and trustworthy sellers!",
            ].map((quote, i) => (
              <Card key={i} className="p-6 bg-white">
                <div className="text-teal-600 text-3xl mb-3">“</div>
                <p className="text-gray-700">{quote}</p>
                <p className="text-sm text-gray-500 mt-4">— BidHub user</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "How do I register?",
                a: "Go to the auth page and choose the Register tab to create your account.",
              },
              {
                q: "How do I place a bid?",
                a: "Open an auction and enter your bid amount. You'll see real-time updates.",
              },
              {
                q: "What payment methods are supported?",
                a: "We support standard card payments after an auction ends.",
              },
            ].map((item, i) => (
              <details
                key={i}
                className="bg-white rounded-md border border-gray-200 p-4"
              >
                <summary className="cursor-pointer font-medium text-gray-900">
                  {item.q}
                </summary>
                <p className="text-gray-600 mt-2">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-900">
            Stay in the loop
          </h3>
          <p className="text-gray-600 mt-2">
            Get the latest auctions delivered to your inbox.
          </p>
          <form className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Input type="email" placeholder="Your email address" required />
            <Button
              type="submit"
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      {/* CTA Section - hidden for authenticated users */}
      {!isAuthenticated && <CTASection />}
    </div>
  );
}
