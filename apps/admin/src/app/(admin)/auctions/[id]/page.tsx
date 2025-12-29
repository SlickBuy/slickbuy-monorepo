"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useAuction } from "@/hooks/useAuctions";
import { useBids } from "@/hooks/useBids";

export default function AdminAuctionDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { data: auctionResp, isLoading } = useAuction(id);
  const { data: bidsResp, isLoading: bidsLoading } = useBids({
    limit: 100,
    search: id,
  });
  const auction = auctionResp?.data;
  const bids = (bidsResp?.data ?? []) as Array<{
    id: string;
    amount: number;
    placedAt: string;
    bidder?: { email: string };
  }>;

  const stats = useMemo(() => {
    const count = bids.length;
    const max = bids.reduce((m, b) => Math.max(m, Number(b.amount)), 0);
    const total = bids.reduce((s, b) => s + Number(b.amount), 0);
    const avg = count ? total / count : 0;
    return { count, max, avg };
  }, [bids]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner size="lg" label="Loading auction..." />
      </div>
    );
  }

  if (!auction) {
    return <div className="p-6 text-gray-600">Auction not found.</div>;
  }

  const StatusBadge = ({ value }: { value: string }) => {
    const v = (value || "").toLowerCase();
    const map: Record<string, string> = {
      active: "text-green-700 bg-green-100",
      scheduled: "text-blue-700 bg-blue-100",
      ended: "text-red-700 bg-red-100",
      cancelled: "text-gray-700 bg-gray-200",
      draft: "text-yellow-800 bg-yellow-100",
    };
    const cls = map[v] || "text-gray-700 bg-gray-100";
    const Icon = () => {
      switch (v) {
        case "active":
          return (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
              <path
                d="m9 12 2 2 4-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          );
        case "scheduled":
          return (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
            </svg>
          );
        case "ended":
          return (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <circle cx="12" cy="12" r="9" />
              <path
                d="M12 7v5l3 3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          );
        default:
          return (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <circle cx="12" cy="12" r="9" />
            </svg>
          );
      }
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${cls}`}
      >
        <Icon />
        <span className="capitalize">{value}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {auction.title}
        </h1>
        <div className="text-sm text-gray-500 flex items-center gap-3">
          <span>Status:</span>
          <StatusBadge value={auction.status} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-gray-500">Current Price</p>
          <p className="text-3xl font-bold">
            ${Number(auction.currentPrice || 0).toFixed(2)}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-500">Total Bids</p>
          <p className="text-3xl font-bold">{stats.count}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-500">Highest Bid</p>
          <p className="text-3xl font-bold">${stats.max.toFixed(2)}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-gray-500">Starts</p>
            <p className="font-medium">
              {new Date(auction.startTime).toLocaleString()}
            </p>
          </div>
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-gray-500">Ends</p>
            <p className="font-medium">
              {new Date(auction.endTime).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bids</h2>
          {bidsLoading && <Spinner size="sm" label="Updating..." />}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-2">Bidder</th>
                <th className="text-left px-4 py-2">Amount</th>
                <th className="text-left px-4 py-2">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bids.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-gray-500">
                    No bids yet.
                  </td>
                </tr>
              ) : (
                bids.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-2">{b.bidder?.email || "—"}</td>
                    <td className="px-4 py-2">
                      ${Number(b.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(b.placedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button asChild variant="secondary">
          <a href={`/auctions/${auction.id}`} target="_blank" rel="noreferrer">
            Open on site
          </a>
        </Button>
        <Button asChild variant="secondary">
          <a href={`/auctions/${auction.id}/edit`}>Edit</a>
        </Button>
      </div>
    </div>
  );
}
