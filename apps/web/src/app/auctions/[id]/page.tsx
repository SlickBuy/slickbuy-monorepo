"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Auction, Bid } from "@auction-platform/types";
import { auctionsAPI, bidsAPI } from "@/lib/api";
import { BidHistory, useToast } from "@auction-platform/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

export default function AuctionDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState(0);
  const [error, setError] = useState<string>("");
  const [placing, setPlacing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const id = params?.id as string;
  const { show } = useToast();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [a, b] = await Promise.all([
          auctionsAPI.getAuction(id),
          bidsAPI.getBidsForAuction(id),
        ]);
        if (a.data.success) setAuction(a.data.data);
        if (b.data.success) setBids(b.data.data || []);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const placeBid = async () => {
    if (!isAuthenticated) {
      router.push("/auth?tab=login");
      return;
    }
    if (!auction) return;
    setError("");
    setPlacing(true);
    try {
      await bidsAPI.placeBid({
        auctionId: auction.id,
        amount: Number(bidAmount),
      });
      const [a, b] = await Promise.all([
        auctionsAPI.getAuction(auction.id),
        bidsAPI.getBidsForAuction(auction.id),
      ]);
      if (a.data.success) setAuction(a.data.data);
      if (b.data.success) setBids(b.data.data || []);
      setBidAmount(0);
      show("Your bid has been placed!", "success");
    } catch (e: unknown) {
      let message = "Failed to place bid";
      if (e && typeof e === "object") {
        const maybe = e as { response?: { data?: { message?: string } } };
        message = maybe.response?.data?.message || message;
      }
      setError(message);
      show(message, "error");
    } finally {
      setPlacing(false);
    }
  };

  const images = useMemo(() => auction?.images ?? [], [auction]);
  const bidsCount = bids.length;

  // Live countdown ticker
  useEffect(() => {
    if (!auction) return;
    const end = new Date(auction.endTime).getTime();
    // Stop ticking after it ends
    if (now >= end) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    // Also refetch auction every 5s to catch server-side extensions
    const syncId = setInterval(async () => {
      try {
        const a = await auctionsAPI.getAuction(auction.id);
        if (a.data.success) setAuction(a.data.data);
      } catch {}
    }, 5000);
    return () => {
      clearInterval(id);
      clearInterval(syncId);
    };
  }, [auction, now]);

  const timeLeft = useMemo(() => {
    if (!auction) return "";
    const end = new Date(auction.endTime).getTime();
    const diff = Math.max(0, end - now);
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [auction, now]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-10 w-64 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 h-96 bg-gray-200 rounded animate-pulse" />
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <p className="text-gray-500">Auction not found.</p>
      </div>
    );
  }

  // images already declared via useMemo above

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Gallery */}
        <div className="lg:col-span-3">
          <Card className="p-6 bg-white">
            {images.length > 0 ? (
              <div className="space-y-4">
                {/* Main image */}
                <div className="relative w-full h-[420px] overflow-hidden rounded-lg bg-gray-900/20">
                  <Image
                    src={images[activeIndex] || images[0]}
                    alt={auction.title}
                    fill
                    quality={90}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 900px"
                    className="object-cover"
                    priority
                  />
                </div>
                {/* Thumbnails carousel */}
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {images.map((src, idx) => (
                    <button
                      key={`${src}-${idx}`}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={`h-20 w-28 flex-shrink-0 rounded-md overflow-hidden transition-colors focus:outline-none ${
                        activeIndex === idx
                          ? "border-2 border-[var(--accent)] shadow"
                          : "border border-[var(--card-border)] hover:border-[var(--muted-foreground)]"
                      }`}
                    >
                      <Image
                        src={src}
                        alt={`thumb-${idx}`}
                        width={112}
                        height={80}
                        quality={80}
                        sizes="112px"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[420px] bg-gray-900/20 rounded-lg" />
            )}

            <div className="mt-6 space-y-3">
              <h1 className="text-3xl font-bold">{auction.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-[color:var(--muted-foreground)]">
                <span>
                  Starts: {new Date(auction.startTime).toLocaleString()}
                </span>
                <span>Ends: {new Date(auction.endTime).toLocaleString()}</span>
                <span className="capitalize">Status: {auction.status}</span>
              </div>
              <p className="opacity-90 whitespace-pre-line mt-2">
                {auction.description}
              </p>
            </div>
          </Card>

          <div className="mt-8">
            <div className="bg-white rounded-lg border border-[color:var(--card-border)]">
              <BidHistory bids={bids as unknown as never} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-white">
            <div className="space-y-5">
              <div>
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  Current Bid
                </p>
                <p className="text-4xl font-bold">
                  ${Number(auction.currentPrice).toFixed(2)}
                </p>
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  value={bidAmount || ""}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  placeholder={`Enter amount > ${auction.currentPrice}`}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  onClick={placeBid}
                  disabled={placing || !bidAmount}
                  size="lg"
                  fullWidth
                  className="btn-accent"
                >
                  {placing ? "Placing..." : "Place Bid"}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-[color:var(--muted)] p-3">
                  <p className="text-[color:var(--muted-foreground)]">
                    Starting Price
                  </p>
                  <p className="font-semibold">
                    ${auction.startingPrice.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-md bg-[color:var(--muted)] p-3">
                  <p className="text-[color:var(--muted-foreground)]">
                    Reserve
                  </p>
                  <p className="font-semibold">
                    {auction.reservePrice
                      ? `$${auction.reservePrice.toFixed(2)}`
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mt-2">
                <div className="rounded-md bg-[color:var(--muted)] p-3">
                  <p className="text-[color:var(--muted-foreground)]">Bids</p>
                  <p className="font-semibold">{bidsCount}</p>
                </div>
                <div className="rounded-md bg-[color:var(--muted)] p-3">
                  <p className="text-[color:var(--muted-foreground)]">
                    Time Left
                  </p>
                  <p className="font-semibold">{timeLeft}</p>
                </div>
              </div>
              <div className="text-sm text-[color:var(--muted-foreground)]">
                <p>Ends: {new Date(auction.endTime).toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
