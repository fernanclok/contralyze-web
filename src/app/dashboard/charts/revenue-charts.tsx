"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { month: "Jan", revenue: 18500 },
  { month: "Feb", revenue: 21300 },
  { month: "Mar", revenue: 24800 },
  { month: "Apr", revenue: 22100 },
  { month: "May", revenue: 25600 },
  { month: "Jun", revenue: 27900 },
  { month: "Jul", revenue: 26400 },
  { month: "Aug", revenue: 28700 },
  { month: "Sep", revenue: 30200 },
  { month: "Oct", revenue: 32500 },
  { month: "Nov", revenue: 34100 },
  { month: "Dec", revenue: 36800 },
]

export function RevenueChart() {
  return (
    <ChartContainer
      config={{
        revenue: {
          label: "Revenue",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[350px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" tickLine={false} axisLine={false} />
          <YAxis className="text-xs" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
          <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
          <ChartTooltip
            labelFormatter={(value) => `${value}`}
            formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

