import React from "react";
import { Card } from "./Card";

interface Bid {
  id: string;
  amount: number;
  bidder: {
    username: string;
  };
  createdAt: Date;
  isWinning: boolean;
}

interface BidHistoryProps {
  bids: Bid[];
  currentUserId?: string;
}

export const BidHistory: React.FC<BidHistoryProps> = ({
  bids,
  currentUserId,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatTime = (dateLike: Date | string) => {
    const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bid History</h3>

      {bids.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No bids yet</p>
      ) : (
        <div className="space-y-3">
          {bids.map((bid, index) => (
            <div
              key={bid.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                bid.isWinning
                  ? "bg-green-50 border border-green-200"
                  : "bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    bid.isWinning
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {bid.bidder.username}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTime(bid.createdAt)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`font-semibold ${
                    bid.isWinning ? "text-green-700" : "text-gray-900"
                  }`}
                >
                  {formatPrice(bid.amount)}
                </p>
                {bid.isWinning && (
                  <p className="text-xs text-green-600 font-medium">Leading</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
