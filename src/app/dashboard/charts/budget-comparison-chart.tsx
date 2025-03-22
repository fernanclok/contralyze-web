"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useState } from "react"
import { CardHeader, CardTitle } from "@/components/ui/card"

interface LegendProps {
  payload: any[]
}

const CustomLegend = (props: LegendProps) => {
  const { payload } = props
  return (
    <div className="flex justify-center items-center flex-wrap gap-4">
      {payload?.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}
const data2 = [
  { name: "Operations", value: 35000 },
  { name: "Payroll", value: 85000 },
  { name: "Marketing", value: 18000 },
  { name: "Equipment", value: 22000 },
  { name: "Facilities", value: 30000 },
]

interface BudgetData {
  name: string
  total_budgets: number
  total_active_budgets: number
  total_inactive_budgets: number
  total_expired_budgets: number
  total_budget_amount: string
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"]

export function BudgetComparisonChart({ Budgets }: { Budgets: any }) {
  const [data, setData] = useState<BudgetData[]>(Budgets.budgets.chart_data)

  // Convert string values to numbers
  const formattedData = data.map(item => ({
    ...item,
    total_budget_amount: parseFloat(item.total_budget_amount.replace(/,/g, ''))
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
        <CardHeader>
                  <CardTitle className="text-black">Total budget by Category</CardTitle>
                  <p className="text-sm text-gray-400">Comparison of budgeted amounts against categories.</p>
                </CardHeader>
          <ChartContainer
            config={{
              total_budgets: {
                label: "Total Budgets",
                color: "hsl(var(--chart-1))",
              },
              total_budget_amount: {
                label: "Total Budget Amount",
                color: "hsl(var(--chart-5))",
              },
            }}
            className="h-[350px]"
          >

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedData}
                  dataKey="total_budget_amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {formattedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                <Legend  content={<CustomLegend payload={[]} />}/>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      <div className="flex flex-col gap-4">
      <CardHeader>
              <CardTitle className="text-black">Total budget by Department</CardTitle>
              <p className="text-sm text-gray-400">Comparison of budgeted amounts against department.</p>
            </CardHeader>
        
            <ChartContainer
            config={{
              total_budgets: {
                label: "Total Budgets",
                color: "hsl(var(--chart-1))",
              },
              total_budget_amount: {
                label: "Total Budget Amount",
                color: "hsl(var(--chart-5))",
              },
            }}
            className="h-[350px]"
          >

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedData}
                  dataKey="total_budget_amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {formattedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                <Legend content={(props) => <CustomLegend payload={props.payload || []} />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
      </div>
    </div>
  )
}

