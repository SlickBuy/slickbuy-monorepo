"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bidsAPI } from "@/lib/api";
import { Button, Card } from "@auction-platform/ui";
import { useAuth } from "@/contexts/AuthContext";

export default function MyBidsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [bids, setBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth?tab=login");
      return;
    }
    const load = async () => {
      try {
        const resp = await bidsAPI.getMyBids({ limit: 50 });
        if (resp.data.success) setBids(resp.data.data || []);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isAuthenticated, router]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bids</h1>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      ) : bids.length === 0 ? (
        <Card>
          <p className="text-gray-500">You haven't placed any bids yet.</p>
          <div className="mt-4">
            <Link href="/auctions">
              <Button>Browse Auctions</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {bids.map((b) => (
            <Card key={b.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {b.auction?.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    ${Number(b.amount).toFixed(2)} •{" "}
                    {new Date(b.createdAt).toLocaleString()}
                  </p>
                </div>
                <Link href={`/auctions/${b.auctionId}`}>
                  <Button variant="secondary" size="sm">
                    View Auction
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
