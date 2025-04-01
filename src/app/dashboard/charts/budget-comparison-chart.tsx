"use client"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { useState, useEffect } from "react"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { WalletMinimal } from "lucide-react"

interface LegendProps {
  payload?: any[]
  data: any[]
}

const CustomLegend = (props: LegendProps) => {
  const { payload, data } = props

  if (!data || data.length === 0 || !payload) {
    return null
  }

  const total = data.reduce(
    (sum, item) => sum + (typeof item.total_budget_amount === "number" ? item.total_budget_amount : 0),
    0,
  )

  return (
    <div className="flex justify-center items-center flex-wrap gap-4 mt-4">
      {payload?.map((entry, index) => {
        // Find the corresponding data item to calculate percentage
        const dataItem = data.find((item) => item.name === entry.value)
        const percentage = dataItem && total > 0 ? ((dataItem.total_budget_amount / total) * 100).toFixed(1) : "0"

        return (
          <div key={`item-${index}`} className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs font-medium">
              {entry.value} <span className="text-muted-foreground">({percentage}%)</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}



interface BudgetData {
  name: string
  total_budgets: number
  total_active_budgets: number
  total_inactive_budgets: number
  total_expired_budgets: number
  total_budget_amount: string | number
}

const COLORS = {
  backgroundColor: [
    "rgba(54, 162, 235, 0.8)", // Blue
    "rgba(75, 192, 192, 0.8)", // Teal
    "rgba(255, 159, 64, 0.8)", // Orange
    "rgba(153, 102, 255, 0.8)", // Purple
    "rgba(255, 99, 132, 0.8)", // Red
  ],
  borderColor: [
    "rgba(54, 162, 235, 1)", // Blue
    "rgba(75, 192, 192, 1)", // Teal
    "rgba(255, 159, 64, 1)", // Orange
    "rgba(153, 102, 255, 1)", // Purple
    "rgba(255, 99, 132, 1)", // Red
  ],
  borderWidth: 1,
};

// Custom Y-axis tick that groups department names
const CustomYAxisTick = (props: { x: number; y: number; payload: { value: string } }) => {
  const { x, y, payload } = props
  const parts = payload.value.split("-")
  const department = parts[0]

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-8} y={0} dy={4} textAnchor="end" fill="hsl(var(--foreground))" fontWeight="bold">
        {department}
      </text>
    </g>
  )
}

export function BudgetComparisonChart({ Budgets = { chart_data: [] }, DeptoData  }: { Budgets?: any, DeptoData?: any }) {
  const [data, setData] = useState<BudgetData[]>([])
    // Asignar DeptoData a departmentRawData
    const departmentRawData = DeptoData;

    // Transformar los datos para el formato del gráfico
    const groupedDepartmentData = departmentRawData.map((dept: any) => ({
      department: dept.department,
      expenses: dept.expenses,
      income: dept.income,
      transfer: dept.transfer,
    }));

  useEffect(() => {
    if (Budgets && Array.isArray(Budgets.chart_data)) {
      // Convert string values to numbers
      const formattedData = Budgets.chart_data.map((item: any) => ({
        ...item,
        total_budget_amount:
          typeof item.total_budget_amount === "string"
            ? Number.parseFloat(item.total_budget_amount.replace(/,/g, ""))
            : item.total_budget_amount,
      }))
      setData(formattedData)
    } else {
      // Use sample data if Budgets.chart_data is not available
      setData([
        {
          name: "Operations",
          total_budgets: 10,
          total_active_budgets: 8,
          total_inactive_budgets: 1,
          total_expired_budgets: 1,
          total_budget_amount: 35000,
        },
        {
          name: "Payroll",
          total_budgets: 15,
          total_active_budgets: 12,
          total_inactive_budgets: 2,
          total_expired_budgets: 1,
          total_budget_amount: 85000,
        },
        {
          name: "Marketing",
          total_budgets: 5,
          total_active_budgets: 4,
          total_inactive_budgets: 1,
          total_expired_budgets: 0,
          total_budget_amount: 18000,
        },
        {
          name: "Equipment",
          total_budgets: 8,
          total_active_budgets: 6,
          total_inactive_budgets: 1,
          total_expired_budgets: 1,
          total_budget_amount: 22000,
        },
        {
          name: "Facilities",
          total_budgets: 7,
          total_active_budgets: 5,
          total_inactive_budgets: 1,
          total_expired_budgets: 1,
          total_budget_amount: 30000,
        },
      ])
    }
  }, [Budgets])

  // Format currency for tooltips
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="flex justify-start items-center text-lg font-bold text-gray-600 gap-2"><WalletMinimal className="h-5 w-5 font-blod text-gray-600" />Budget analitucs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        <div className="flex flex-col gap-4 bg-white p-4 rounded-lg shadow-sm">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-black text-xl">Total Budget by Category.</CardTitle>
            <p className="text-sm text-gray-500">Comparison of budgeted amounts against categories.</p>
          </CardHeader>

          <ChartContainer
            config={{
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
                  data={data}
                  dataKey="total_budget_amount"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={100}
                  innerRadius={40}
                  paddingAngle={2}
                  animationDuration={1000}
                  animationBegin={0}
                >
                  {data.map((entry, index) => (
                    <Cell
                    key={`cell-${index}`}
                    fill={COLORS.backgroundColor[index % COLORS.backgroundColor.length]} // Fondo con opacidad
                    stroke={COLORS.borderColor[index % COLORS.borderColor.length]} // Borde sólido
                    strokeWidth={COLORS.borderWidth}
                  />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    border: "none",
                  }}
                />
                <Legend content={(props) => <CustomLegend {...props} data={data} />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="flex flex-col gap-4 bg-white p-4 rounded-lg shadow-sm">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-black text-xl">Transactions by Department</CardTitle>
            <p className="text-sm text-gray-500">Expenses, income and transfers by department</p>
          </CardHeader>

          <ChartContainer
            config={{
              value: {
                label: "Amount",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[350px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupedDepartmentData} layout="vertical" margin={{ top: 20, right: 50, left: 120, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" tickFormatter={(value) => `$${value / 1000}k`} domain={[0, "dataMax + 10000"]} />
                <YAxis type="category" dataKey="department" tick={<CustomYAxisTick x={0} y={0} payload={{
                  value: ""
                }} />} width={120} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(label) => {
                    const parts = label.split("-");
                    return `${parts[0]}`;
                  }}
                  contentStyle={{
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    border: "none",
                  }}
                />
                <Bar dataKey="expenses" name="Expenses" fill="#4A6FA5" radius={[0, 4, 4, 0]} />
                <Bar dataKey="income" name="Income" fill="#87D68D" radius={[0, 4, 4, 0]} />
                <Bar dataKey="transfer" name="Transfer" fill="#6D9DC5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  )
}

