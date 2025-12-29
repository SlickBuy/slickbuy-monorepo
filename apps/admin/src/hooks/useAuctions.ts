"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import type { Auction, CreateAuctionRequest } from "@auction-platform/types";

export function useAuctionsList(params?: {
  page?: number;
  limit?: number;
  status?: string; // expects lowercase like "active" | "scheduled" | "ended" | "all"
}) {
  const normalizedStatus =
    params?.status && params.status !== "all"
      ? params.status.toUpperCase()
      : undefined;
  const requestParams: Record<string, string | number> = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
    ...(normalizedStatus ? { status: normalizedStatus } : {}),
  };

  return useQuery({
    queryKey: [
      "auctions",
      requestParams.page,
      requestParams.limit,
      normalizedStatus ?? "all",
    ],
    queryFn: async () => {
      const [list, stats] = await Promise.all([
        adminApi.get("/auctions", { params: requestParams }),
        adminApi.get("/auctions/stats/dashboard"),
      ]);
      return {
        ...(list.data || {}),
        stats: stats.data?.data,
      } as {
        data?: Auction[];
        stats?: {
          active?: number;
          scheduled?: number;
          users?: number;
          revenue?: number;
        };
      };
    },
  });
}

export function useCreateAuction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAuctionRequest) => {
      const resp = await adminApi.post("/auctions", payload);
      return resp.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auctions"] });
    },
  });
}

export function useDeleteAuction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const resp = await adminApi.delete(`/auctions/${id}`);
      return resp.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auctions"] }),
  });
}

export function useAuction(id: string | undefined) {
  return useQuery({
    queryKey: ["auction", id],
    enabled: !!id,
    queryFn: async () => {
      const resp = await adminApi.get(`/auctions/${id}`);
      return resp.data;
    },
  });
}
