"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bidsAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type UserBid = {
  id: string;
  auctionId: string;
  amount: number;
  createdAt: string;
  isWinning?: boolean;
  auction?: { title?: string; images?: string[] };
};

export default function ItemsWonPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState<UserBid[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth?tab=login");
      return;
    }
    const load = async () => {
      try {
        const resp = await bidsAPI.getMyBids({ limit: 200 });
        if (resp.data?.success) {
          const list = (resp.data.data as UserBid[]) || [];
          const winning = list.filter((b) => b.isWinning);
          // De-duplicate by auctionId keeping highest final bid
          const byAuction: Record<string, UserBid> = {};
          for (const b of winning) {
            const existing = byAuction[b.auctionId];
            if (!existing || Number(b.amount) > Number(existing.amount)) {
              byAuction[b.auctionId] = b;
            }
          }
          setWinners(Object.values(byAuction));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, router]);

  const grid = useMemo(() => winners, [winners]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Items Won</h1>
          <p className="text-[color:var(--muted-foreground)] mt-1">
            Your auctions you successfully won.
          </p>
        </div>
        <Link href="/auctions">
          <Button variant="secondary">Browse Auctions</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-[color:var(--card-border)] p-3 animate-pulse"
            >
              <div className="h-40 bg-gray-200 rounded mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : grid.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[color:var(--muted-foreground)]">
            No items yet. Keep bidding!
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {grid.map((b) => (
            <Card key={b.id} className="p-3 bg-white">
              {b.auction?.images?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.auction.images[0]}
                  alt={b.auction?.title || "Item"}
                  className="h-40 w-full object-cover rounded-md mb-3"
                />
              )}
              <p className="text-sm font-semibold text-[color:var(--card-foreground)] line-clamp-2">
                {b.auction?.title}
              </p>
              <p className="text-xs text-[color:var(--muted-foreground)] mt-1">
                Final Bid: ${Number(b.amount).toFixed(0)}
              </p>
              <div className="mt-3">
                <Link href={`/auctions/${b.auctionId}`}>
                  <Button size="sm" variant="secondary" className="w-full">
                    View
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
