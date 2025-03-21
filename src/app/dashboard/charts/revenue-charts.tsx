"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const months = [
  { key:"1", month: "Jan" },
  { key:"2", month: "Feb" },
  { key:"3", month: "Mar" },
  { key:"4", month: "Apr" },
  { key:"5", month: "May" },
  { key:"6", month: "Jun" },
  { key:"7", month: "Jul" },
  { key:"8", month: "Aug" },
  { key:"9", month: "Sep" },
  { key:"10", month: "Oct" },
  { key:"11", month: "Nov" },
  { key:"12", month: "Dec" },
]

export function RevenueChart({ transaction }: { transaction: any }) {
  console.log(transaction?.transactions);

  const data = Array.isArray(transaction?.transactions)
    ? transaction.transactions.map((item: any) => {
        const month = months.find((m) => m.key === item.month);
        return {
          month: month?.month || "Unknown", // Nombre del mes (e.g., "Jan", "Feb")
          revenue: parseFloat(item.total), // Convertir el total a número
        };
      })
    : []; // Si no es un array, usar un array vacío

  console.log(data);

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
          <YAxis
            className="text-xs"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value / 1000}k`} // Formatear los valores del eje Y
          />
          <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(label) => `Month: ${label}`} // Formatear el label del tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]} // Formatear el valor del tooltip
              />
            }
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

