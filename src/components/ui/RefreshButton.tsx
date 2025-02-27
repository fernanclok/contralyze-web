"use client";

import { Button } from "@/components/ui/button";

export default function RefreshButton() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex justify-center mt-4">
      <Button onClick={handleRefresh} className="bg-red-500 hover:bg-red-700 text-white">
        Refresh page
      </Button>
    </div>
  );
}