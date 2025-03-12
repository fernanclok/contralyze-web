"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { department: "Operations", budget: 40000, actual: 35000 },
  { department: "Payroll", budget: 80000, actual: 85000 },
  { department: "Marketing", budget: 20000, actual: 18000 },
  { department: "Equipment", budget: 25000, actual: 22000 },
  { department: "Facilities", budget: 35000, actual: 30000 },
]

export function BudgetComparisonChart() {
  return (
    <ChartContainer
      config={{
        budget: {
          label: "Budget",
          color: "hsl(var(--chart-1))",
        },
        actual: {
          label: "Actual",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[350px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            type="number"
            className="text-xs"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <YAxis
            dataKey="department"
            type="category"
            className="text-xs"
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Legend />
          <Bar dataKey="budget" fill="var(--color-budget)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="actual" fill="var(--color-actual)" radius={[0, 4, 4, 0]} />
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => [`$${value.toLocaleString()}`, ""]} />} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

