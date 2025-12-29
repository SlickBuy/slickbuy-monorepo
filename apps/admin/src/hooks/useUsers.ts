"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import type {
  User,
  PaginatedResponse,
  ApiResponse,
} from "@auction-platform/types";

export function useUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["users", page, limit],
    queryFn: async () => {
      const { data } = await adminApi.get<PaginatedResponse<User>>("/users", {
        params: { page, limit },
      });
      return data;
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<User> & { password: string }) => {
      const res = await adminApi.post<ApiResponse<User>>("/users", payload);
      if (!res.data?.success) {
        const err = new Error(res.data?.message || "Failed to create user");
        throw err;
      }
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id: string;
      data: Partial<User> & { password?: string };
    }) => {
      const { data } = await adminApi.put<ApiResponse<User>>(
        `/users/${payload.id}`,
        payload.data
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
