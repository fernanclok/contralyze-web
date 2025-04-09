"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { WalletMinimal } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

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

const normalizeTransactions = (data: any) => {
  if (Array.isArray(data) && data.length === 1 && typeof data[0] === "object") {
    return Object.values(data[0]).filter((item) => typeof item === "object");
  }
  return []; // Si no es un formato válido, devuelve un array vacío
};

const normalizeYears = (data: any) => {
  if (typeof data === "object" && data !== null) {
    return Object.values(data)
      .filter((year) => (typeof year === "string" || typeof year === "number") && year !== "years_available");
  }
  return []; // Si no es un formato válido, devuelve un array vacío
};

export function RevenueChart({ transaction, Year }: { transaction: any; Year: any }) {
  const normalizedTransactions = transaction;
  const normalizedYears: (string | number)[] = normalizeYears(Year) as (string | number)[];

  const [selectedYear, setSelectedYear] = useState<string | number>(normalizedYears[0]);

  console.log("Normalized Transactions:", normalizedTransactions);
  console.log("Normalized Years:", normalizedYears);
  console.log("Selected Year:", selectedYear);

  // Asegurarse de que todos los meses estén presentes
  const filteredData = months.map((month) => {
    const dataForMonth = normalizedTransactions.find(
      (item: any) => item.year === selectedYear && item.month === month.key
    );
    return {
      month: month.month, // Nombre del mes (e.g., "Jan", "Feb")
      revenue: dataForMonth ? dataForMonth.total : 0, // Si no hay datos, asignar 0
    };
  });

  return (
    <>
      <div className="flex flex-col gap-6 p-4">
        {/* Selector de año */}
        <div className="w-full flex justify-between items-center gap-4">
          <h2 className="flex justify-start items-center text-lg font-bold text-gray-600 gap-2">
            <WalletMinimal className="h-5 w-5 font-blod text-gray-600" />
            Transactions per Month
          </h2>
          <div className="w-fit flex justify-center items-center gap-3">
            <p className="text-sm font-medium text-gray-500">Filter by Year:</p>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-md p-2 text-sm"
            >
              {normalizedYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 ">
          <CardHeader>
            <CardTitle className="text-black p-2">Transactions Overview</CardTitle>
            <p className="text-gray-400 px-5">Monthly revenue breakdown for the current fiscal year</p>
          </CardHeader>
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue",
                color: "#000",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" tickLine={false} axisLine={false} />
                <YAxis
                  className="text-xs"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`} // Formatear los valores del eje Y
                />
                <Bar dataKey="revenue" fill="rgba(75, 192, 192, 0.8)" radius={[4, 4, 0, 0]} />
                <Tooltip
                  labelFormatter={(value) => `Month: ${value}`}
                  formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    border: "none",
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </>
  );
}

