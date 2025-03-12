"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { name: "Operations", value: 35000 },
  { name: "Payroll", value: 85000 },
  { name: "Marketing", value: 18000 },
  { name: "Equipment", value: 22000 },
  { name: "Facilities", value: 30000 },
]

export function ExpensesChart() {
  return (
    <ChartContainer
      config={{
        operations: {
          label: "Operations",
          color: "hsl(var(--chart-1))",
        },
        payroll: {
          label: "Payroll",
          color: "hsl(var(--chart-2))",
        },
        marketing: {
          label: "Marketing",
          color: "hsl(var(--chart-3))",
        },
        equipment: {
          label: "Equipment",
          color: "hsl(var(--chart-4))",
        },
        facilities: {
          label: "Facilities",
          color: "hsl(var(--chart-5))",
        },
      }}
      className="h-[350px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value">
            {data.map((entry, index) => {
              const colors = [
                "var(--color-operations)",
                "var(--color-payroll)",
                "var(--color-marketing)",
                "var(--color-equipment)",
                "var(--color-facilities)",
              ]
              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            })}
          </Pie>
          <ChartTooltip
            content={<ChartTooltipContent formatter={(value) => [`$${value.toLocaleString()}`, "Amount"]} />}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: [
                  "var(--color-operations)",
                  "var(--color-payroll)",
                  "var(--color-marketing)",
                  "var(--color-equipment)",
                  "var(--color-facilities)",
                ][index % 5],
              }}
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground">${item.value.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </ChartContainer>
  )
}

