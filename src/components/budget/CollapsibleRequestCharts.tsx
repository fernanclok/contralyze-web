'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { RequestStatusPieChart, RequestsByCategoryBarChart } from './BudgetPieChart';

interface CollapsibleRequestChartsProps {
  requests: any[];
  title?: string;
}

export function CollapsibleRequestCharts({ requests, title = "Request Analytics" }: CollapsibleRequestChartsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="mb-6">
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium">{title}</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleExpanded}
          aria-label={isExpanded ? "Collapse charts" : "Expand charts"}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              <span className="text-sm">Hide Charts</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              <span className="text-sm">Show Charts</span>
            </>
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <CardContent className="p-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <div className="md:col-span-1">
              <RequestStatusPieChart requests={requests} />
            </div>
            <div className="md:col-span-1">
              <RequestsByCategoryBarChart requests={requests} />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
} 