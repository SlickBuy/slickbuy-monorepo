"use client";

import Link from "next/link";
import React from "react";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useBids } from "@/hooks/useBids";
import { useAuctionsList } from "@/hooks/useAuctions";

export default function Home() {
  const { data: recent } = useAuctionsList({ page: 1, limit: 5 });
  const tile = (href: string, title: string, subtitle: string) => (
    <Link
      href={href}
      className="block p-6 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ring)]"
    >
      <p className="text-gray-500">{title}</p>
      <p className="text-2xl font-semibold">{subtitle}</p>
    </Link>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of auctions, revenue and activity
          </p>
        </div>
        <Link href="/auctions/new">
          <Button>New Auction</Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-sm text-gray-500">Active Auctions</p>
          <p className="text-2xl font-semibold">
            {recent?.stats?.active ?? "—"}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-500">Scheduled</p>
          <p className="text-2xl font-semibold">
            {recent?.stats?.scheduled ?? "—"}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-semibold">
            {recent?.stats?.users ?? "—"}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-500">Revenue (30d)</p>
          <p className="text-2xl font-semibold">
            ${Number(recent?.stats?.revenue ?? 0).toFixed(2)}
          </p>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tile("/auctions", "Auctions", "Manage listings")}
        {tile("/users", "Users", "Manage users")}
        {tile("/bids", "Bids", "View activity")}
      </div>

      <RecentAuctions data={recent?.data ?? []} />

      <LatestBids />
    </div>
  );
}

function LatestBids() {
  const { data, isLoading } = useBids({ limit: 10 });
  const rows = (data?.data ?? []) as Array<{
    id: string;
    amount: number;
    placedAt: string;
    auction?: { id: string; title: string };
    bidder?: { id: string; email: string };
  }>;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">Latest Bids</h2>
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner label="Loading bids..." />
        </div>
      ) : rows.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-500">No recent bids.</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-5 py-3">Auction</th>
                  <th className="text-left px-5 py-3">Bidder</th>
                  <th className="text-left px-5 py-3">Amount</th>
                  <th className="text-left px-5 py-3">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">{r.auction?.title || "—"}</td>
                    <td className="px-5 py-3">{r.bidder?.email || "—"}</td>
                    <td className="px-5 py-3">
                      ${Number(r.amount).toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      {new Date(r.placedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function RecentAuctions({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-900">Recent Auctions</h2>
        <Link
          href="/auctions"
          className="text-sm text-blue-600 hover:underline"
        >
          View all
        </Link>
      </div>
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-5 py-3">Title</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Current Price</th>
                <th className="text-left px-5 py-3">Ends</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.slice(0, 5).map((a: any) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">{a.title}</td>
                  <td className="px-5 py-3 capitalize">
                    {String(a.status).toLowerCase()}
                  </td>
                  <td className="px-5 py-3">
                    ${Number(a.currentPrice).toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    {new Date(a.endTime).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
