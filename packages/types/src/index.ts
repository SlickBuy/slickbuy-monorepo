// User types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  MODERATOR = "moderator",
}

// Auction types
export interface Auction {
  id: string;
  title: string;
  description: string;
  images: string[];
  startingPrice: number;
  currentPrice: number;
  reservePrice?: number;
  startTime: Date;
  endTime: Date;
  status: AuctionStatus;
  sellerId: string;
  seller: User;
  categoryId: string;
  category: Category;
  bids: Bid[];
  createdAt: Date;
  updatedAt: Date;
}

export enum AuctionStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  ACTIVE = "active",
  ENDED = "ended",
  CANCELLED = "cancelled",
}

// Bid types
export interface Bid {
  id: string;
  amount: number;
  auctionId: string;
  auction: Auction;
  bidderId: string;
  bidder: User;
  isWinning: boolean;
  createdAt: Date;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  parentId?: string;
  parent?: Category;
  children: Category[];
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Auction creation/update types
export interface CreateAuctionRequest {
  title: string;
  description: string;
  images: string[];
  startingPrice: number;
  reservePrice?: number;
  startTime: Date;
  endTime: Date;
  categoryId: string;
}

export interface PlaceBidRequest {
  auctionId: string;
  amount: number;
}

// WebSocket event types
export interface SocketEventData {
  type: string;
  payload: any;
}

export interface BidPlacedEvent extends SocketEventData {
  type: "bid_placed";
  payload: {
    auctionId: string;
    bid: Bid;
    newCurrentPrice: number;
  };
}

export interface AuctionEndedEvent extends SocketEventData {
  type: "auction_ended";
  payload: {
    auctionId: string;
    winningBid?: Bid;
    finalPrice: number;
  };
}
