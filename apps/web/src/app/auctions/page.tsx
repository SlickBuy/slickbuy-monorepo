"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Auction } from "@auction-platform/types";
import { auctionsAPI } from "@/lib/api";
import { AuctionCard } from "@auction-platform/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type StatusFilter = "all" | "active" | "scheduled" | "ended";

function AuctionsContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const initialStatus = (
    sp.get("status") || "all"
  ).toLowerCase() as StatusFilter;
  const initialQuery = sp.get("q") || "";
  const initialSort =
    (sp.get("sort") as "recent" | "ending" | "priceAsc" | "priceDesc") ||
    "recent";
  const initialPage = Math.max(1, Number(sp.get("page") || 1));
  const initialCategory = sp.get("category") || undefined;

  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [sort, setSort] = useState<
    "recent" | "ending" | "priceAsc" | "priceDesc"
  >(initialSort);
  const [page, setPage] = useState(initialPage);
  const [categoryId, setCategoryId] = useState<string | undefined>(
    initialCategory
  );
  const pageSize = 9;

  // Helper to update URL query params consistently
  const pushParams = (
    updates: Partial<{
      status: StatusFilter;
      q: string;
      sort: typeof sort;
      page: number;
      category: string | undefined;
    }>
  ) => {
    const params = new URLSearchParams(sp.toString());
    const nextStatus = updates.status ?? status;
    if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
    else params.delete("status");
    const nextQ = updates.q ?? query;
    if (nextQ) params.set("q", nextQ);
    else params.delete("q");
    const nextSort = updates.sort ?? sort;
    if (nextSort) params.set("sort", nextSort);
    const nextCategory = updates.category ?? categoryId;
    if (nextCategory) params.set("category", nextCategory);
    else params.delete("category");
    const nextPage = updates.page ?? page;
    params.set("page", String(nextPage));
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const params: { limit: number; categoryId?: string } = { limit: 100 };
        if (categoryId) params.categoryId = categoryId;
        const resp = await auctionsAPI.getAuctions(params);
        if (resp.data.success) setAuctions(resp.data.data || []);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [categoryId]);

  // Sync state from URL (back/forward navigation)
  useEffect(() => {
    const urlStatus = (sp.get("status") || "all").toLowerCase() as StatusFilter;
    const urlQuery = sp.get("q") || "";
    const urlSort =
      (sp.get("sort") as "recent" | "ending" | "priceAsc" | "priceDesc") ||
      "recent";
    const urlPage = Math.max(1, Number(sp.get("page") || 1));
    const urlCategory = sp.get("category") || undefined;
    setStatus(urlStatus);
    setQuery(urlQuery);
    setSort(urlSort);
    setPage(urlPage);
    setCategoryId(urlCategory);
  }, [sp]);

  const filtered = useMemo(() => {
    let list = auctions.slice();
    // Server filters by status when provided, but also filter client-side case-insensitively
    if (status !== "all") {
      const desiredLc = status.toLowerCase();
      list = list.filter(
        (a) => String(a.status || "").toLowerCase() === desiredLc
      );
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "ending":
        list.sort(
          (a, b) =>
            new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
        );
        break;
      case "priceAsc":
        list.sort((a, b) => Number(a.currentPrice) - Number(b.currentPrice));
        break;
      case "priceDesc":
        list.sort((a, b) => Number(b.currentPrice) - Number(a.currentPrice));
        break;
      default:
        list.sort(
          (a, b) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
    }
    return list;
  }, [auctions, query, status, sort]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const handleViewDetails = (id: string) =>
    (window.location.href = `/auctions/${id}`);
  const handlePlaceBid = (id: string) =>
    (window.location.href = `/auctions/${id}`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">All Auctions</h1>
        <p className="text-[color:var(--muted-foreground)] mt-1">
          Explore live and upcoming auctions. Use filters to find what you want.
        </p>
      </div>

      <Card className="p-4 mb-6 bg-white">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex-1">
            <Input
              placeholder="Search items, keywords..."
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const nextQ = (e.currentTarget as HTMLInputElement).value;
                  pushParams({ q: nextQ, page: 1 });
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            {(["all", "active", "scheduled", "ended"] as StatusFilter[]).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => {
                    pushParams({ status: s, page: 1 });
                  }}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    status === s
                      ? "bg-[color:var(--muted)] text-foreground"
                      : "text-[color:var(--foreground)]/80 hover:bg-white/10"
                  }`}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              )
            )}
          </div>
          <div className="ml-auto">
            <select
              value={sort}
              onChange={(e) => {
                const v = e.target.value as typeof sort;
                setSort(v);
                pushParams({ sort: v, page: 1 });
              }}
              className="h-10 rounded-md border border-[color:var(--card-border)] bg-white px-3 text-sm"
            >
              <option value="recent">Newest</option>
              <option value="ending">Ending Soon</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
            >
              <div className="h-48 bg-gray-200 rounded mb-4" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded mb-4 w-3/4" />
              <div className="h-6 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[color:var(--muted-foreground)] text-lg">
            No auctions match your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paged.map((a) => (
              <AuctionCard
                key={a.id}
                id={a.id}
                title={a.title}
                description={a.description}
                currentPrice={a.currentPrice}
                endTime={new Date(a.endTime)}
                image={a.images?.[0]}
                status={
                  ((a.status?.toLowerCase() as string) || "active") as
                    | "active"
                    | "scheduled"
                    | "ended"
                }
                onViewDetails={handleViewDetails}
                onPlaceBid={handlePlaceBid}
              />
            ))}
          </div>
          <div className="flex justify-between items-center mt-8">
            <p className="text-sm text-[color:var(--muted-foreground)]">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const next = Math.max(1, page - 1);
                  setPage(next);
                  pushParams({ page: next });
                }}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const next = Math.min(totalPages, page + 1);
                  setPage(next);
                  pushParams({ page: next });
                }}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AuctionsListPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">All Auctions</h1>
            <p className="text-[color:var(--muted-foreground)] mt-1">
              Explore live and upcoming auctions. Use filters to find what you
              want.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
              >
                <div className="h-48 bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4" />
                <div className="h-6 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <AuctionsContent />
    </Suspense>
  );
}
