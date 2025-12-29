"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
}) => {
  const canPrev = hasPrev ?? page > 1;
  const canNext = hasNext ?? (totalPages ? page < totalPages : true);
  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-muted-foreground">Page {page}{totalPages ? ` of ${totalPages}` : ""}</div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!canPrev}
          onClick={() => canPrev && onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!canNext}
          onClick={() => canNext && onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};


