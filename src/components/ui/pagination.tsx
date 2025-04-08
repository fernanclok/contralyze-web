"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  className,
  ...props
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  // No muestra paginación si solo hay una página
  if (totalPages <= 1) return null;

  const renderPageButtons = () => {
    const pageButtons = [];

    // Siempre mostrar primera página
    pageButtons.push(
      <Button
        key={1}
        variant={currentPage === 1 ? "default" : "outline"}
        size="icon"
        onClick={() => onPageChange(1)}
      >
        1
      </Button>
    );

    // Lógica para mostrar elipsis y páginas intermedias
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Ajustar para mostrar siempre 5 botones si hay suficientes páginas
    if (totalPages > 5) {
      if (currentPage <= 3) {
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
    }

    // Mostrar elipsis al inicio si es necesario
    if (startPage > 2) {
      pageButtons.push(
        <Button variant="ghost" size="icon" disabled key="ellipsis-start">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      );
    }

    // Mostrar páginas intermedias
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="icon"
          onClick={() => onPageChange(i)}
        >
          {i}
        </Button>
      );
    }

    // Mostrar elipsis al final si es necesario
    if (endPage < totalPages - 1) {
      pageButtons.push(
        <Button variant="ghost" size="icon" disabled key="ellipsis-end">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      );
    }

    // Siempre mostrar última página si hay más de una
    if (totalPages > 1) {
      pageButtons.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="icon"
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return pageButtons;
  };

  return (
    <div 
      className={cn("flex items-center justify-center gap-1 mt-4", className)}
      {...props}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-1">
        {renderPageButtons()}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}