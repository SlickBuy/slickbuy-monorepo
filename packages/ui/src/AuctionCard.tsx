import React from "react";
import Image from "next/image";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";

interface AuctionCardProps {
  id: string;
  title: string;
  description: string;
  currentPrice: number;
  endTime: Date;
  image?: string;
  status: "active" | "ended" | "scheduled";
  onViewDetails: (id: string) => void;
  onPlaceBid?: (id: string) => void;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({
  id,
  title,
  description,
  currentPrice,
  endTime,
  image,
  status,
  onViewDetails,
  onPlaceBid,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const timeLeft = endTime.getTime() - now.getTime();

    if (timeLeft <= 0) return "Ended";

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const statusColorMap: Record<
    "active" | "ended" | "scheduled",
    { color: any }
  > = {
    active: { color: "emerald" },
    ended: { color: "rose" },
    scheduled: { color: "indigo" },
  } as const;

  const renderStatusIcon = (s: "active" | "ended" | "scheduled") => {
    switch (s) {
      case "active":
        return (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
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
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
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
          >
            <circle cx="12" cy="12" r="9" />
            <path
              d="M12 7v5l3 3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
    }
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-white"
      onClick={() => onViewDetails(id)}
    >
      {image && (
        <div className="relative w-full h-48">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={85}
            className="object-cover"
            priority={false}
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold truncate">{title}</h3>
          <Badge
            color={statusColorMap[status]?.color || "gray"}
            variant="solid"
            size="sm"
            leftIcon={renderStatusIcon(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Current Bid</p>
            <p className="text-xl font-bold text-gray-900">
              {formatPrice(currentPrice)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Time Remaining</p>
            <p className="text-sm font-medium text-gray-900">
              {formatTimeRemaining(endTime)}
            </p>
          </div>
        </div>

        {status === "active" && onPlaceBid && (
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPlaceBid(id);
              }}
              className="w-full"
            >
              Place Bid
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
