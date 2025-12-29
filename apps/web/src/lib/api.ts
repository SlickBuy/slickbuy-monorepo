import axios from "axios";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ApiResponse,
} from "@auction-platform/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api-slickbuy-dev.up.railway.app/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auction_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auction_token");
      localStorage.removeItem("auction_user");
      window.location.href = "/auth?tab=login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", data),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>("/auth/register", data),
};

// Auctions API
export const auctionsAPI = {
  getAuctions: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    categoryId?: string;
  }) => api.get("/auctions", { params }),

  getAuction: (id: string) => api.get(`/auctions/${id}`),

  createAuction: (data: Record<string, unknown>) => api.post("/auctions", data),

  updateAuction: (id: string, data: Record<string, unknown>) =>
    api.put(`/auctions/${id}`, data),

  deleteAuction: (id: string) => api.delete(`/auctions/${id}`),
};

// Categories API
export const categoriesAPI = {
  getCategories: () => api.get("/categories"),
};

// Bids API
export const bidsAPI = {
  placeBid: (data: { auctionId: string; amount: number }) =>
    api.post("/bids", data),

  getBidsForAuction: (auctionId: string) =>
    api.get(`/bids/auction/${auctionId}`),

  getMyBids: (params?: { page?: number; limit?: number }) =>
    api.get("/bids/my-bids", { params }),

  getWinningBid: (auctionId: string) => api.get(`/bids/winning/${auctionId}`),
};
