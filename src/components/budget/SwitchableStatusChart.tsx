'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight } from 'lucide-react';
import { BudgetActiveStatusPieChart, RequestStatusPieChart } from './BudgetPieChart';

interface SwitchableStatusChartProps {
  budgets: any[];
  requests: any[];
}

export function SwitchableStatusChart({ budgets, requests }: SwitchableStatusChartProps) {
  const [chartType, setChartType] = useState<'budgetActivity' | 'requests'>('budgetActivity');
  
  const cycleChartType = () => {
    setChartType(chartType === 'budgetActivity' ? 'requests' : 'budgetActivity');
  };
  
  const getTitle = () => {
    return chartType === 'budgetActivity' ? 'Budget Status' : 'Request Status';
  };
  
  return (
    <Card className="h-full bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg border border-gray-100">
      <CardHeader className="pb-2 flex flex-row justify-between items-center border-b border-gray-100 px-6 pt-6">
        <CardTitle className="text-base font-semibold text-gray-900">{getTitle()}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={cycleChartType}
          className="h-8 px-3 text-xs bg-white hover:bg-gray-50 border-gray-200"
        >
          <ArrowLeftRight className="h-4 w-4 mr-2 text-gray-600" />
          <span className="text-gray-700">Change View</span>
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="h-[280px]">
          {chartType === 'budgetActivity' ? (
            <BudgetActiveStatusPieChart 
              budgets={budgets} 
              withCard={false}
            />
          ) : (
            <RequestStatusPieChart 
              requests={requests} 
              withCard={false}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
} 