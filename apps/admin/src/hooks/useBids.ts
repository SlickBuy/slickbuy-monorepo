"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";

export interface BidsListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export function useBids(params: BidsListParams = {}) {
  const { page = 1, limit = 20, ...rest } = params;
  return useQuery({
    queryKey: ["bids", page, limit, rest],
    queryFn: async () => {
      const { data } = await adminApi.get("/bids", {
        params: { page, limit, ...rest },
      });
      return data;
    },
  });
}

export function useDeleteBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await adminApi.delete(`/bids/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bids"] });
    },
  });
}
