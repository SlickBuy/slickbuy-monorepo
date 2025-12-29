"use client";

import { AuctionCard } from "@auction-platform/ui";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Auction } from "@auction-platform/types";

export function FeaturedAuctionsSection({
  isLoading,
  auctions,
  onViewDetails,
  onPlaceBid,
}: {
  isLoading: boolean;
  auctions: Auction[];
  onViewDetails: (id: string) => void;
  onPlaceBid: (id: string) => void;
}) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Auctions
          </h2>
          <p className="text-xl text-gray-600">
            Don&apos;t miss out on these exciting live auctions ending soon!
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
              >
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : auctions.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                id={auction.id}
                title={auction.title}
                description={auction.description}
                currentPrice={auction.currentPrice}
                endTime={new Date(auction.endTime)}
                image={auction.images[0]}
                status={
                  String(auction.status).toLowerCase() as
                    | "active"
                    | "scheduled"
                    | "ended"
                }
                onViewDetails={onViewDetails}
                onPlaceBid={onPlaceBid}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No active auctions at the moment.
            </p>
            <p className="text-gray-400 mt-2">
              Check back soon for new listings!
            </p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/auctions">
            <Button
              size="lg"
              variant="default"
              className="bg-[color:var(--success)] text-white hover:bg-[color:var(--success)]/90"
            >
              View All Auctions
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
