"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type ChartConfig = Record<
  string,
  {
    label: string
    color: string
    icon?: LucideIcon
  }
>

interface ChartContextValue {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

function useChartContext() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChartContext must be used within a ChartProvider")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig
  }
>(({ config, className, children, ...props }, ref) => {
  // Create CSS variables for each color in the config
  const style = React.useMemo(() => {
    return Object.entries(config).reduce(
      (acc, [key, value]) => {
        acc[`--color-${key}`] = value.color
        return acc
      },
      {} as Record<string, string>,
    )
  }, [config])

  return (
    <ChartContext.Provider value={{ config }}>
      <div ref={ref} className={cn("h-80", className)} style={style} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

interface ChartTooltipProps {
  content?: React.ReactNode
  cursor?: boolean
  offset?: number
  viewBox?: {
    x?: number
    y?: number
    width?: number
    height?: number
  }
  position?: {
    x?: number
    y?: number
  }
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: Record<string, any>
  }>
  label?: string
  separator?: string
  itemStyle?: React.CSSProperties
  contentStyle?: React.CSSProperties
  labelStyle?: React.CSSProperties
  wrapperStyle?: React.CSSProperties
  formatter?: (value: number, name: string, props: any) => [string, string]
  labelFormatter?: (label: string) => string
  animationDuration?: number
  animationEasing?: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear"
  defaultIndex?: number
}

const ChartTooltip = React.forwardRef<HTMLDivElement, ChartTooltipProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("", className)} {...props} />
  },
)
ChartTooltip.displayName = "ChartTooltip"

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  formatter?: (value: number, name: string, props: any) => [string, string]
  labelFormatter?: (label: string) => string
  label?: string
  payload?: Array<{
    name: string
    value: number
    payload: Record<string, any>
  }>
  active?: boolean
  hideLabel?: boolean
  indicator?: "dot" | "line"
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  (
    { className, formatter, labelFormatter, label, payload, active, hideLabel = false, indicator = "dot", ...props },
    ref,
  ) => {
    const { config } = useChartContext()

    if (!active || !payload?.length) {
      return null
    }

    return (
      <div ref={ref} className={cn("rounded-lg border bg-background p-2 shadow-md", className)} {...props}>
        {!hideLabel && label ? (
          <div className="mb-1 text-xs font-medium">{labelFormatter ? labelFormatter(label) : label}</div>
        ) : null}
        <div className="flex flex-col gap-0.5">
          {payload.map((item, index) => {
            const dataKey = item.name
            const configItem = config[dataKey]
            const [formattedValue, formattedName] = formatter
              ? formatter(item.value, item.name, item)
              : [item.value, configItem?.label ?? item.name]
            const Icon = configItem?.icon

            return (
              <div key={index} className="flex items-center gap-1 text-xs">
                {indicator === "dot" ? (
                  <div
                    className="h-1 w-1 rounded-full"
                    style={{
                      backgroundColor: configItem?.color,
                    }}
                  />
                ) : indicator === "line" ? (
                  <div
                    className="h-0.5 w-2"
                    style={{
                      backgroundColor: configItem?.color,
                    }}
                  />
                ) : null}
                {Icon ? (
                  <Icon
                    className="h-3 w-3"
                    style={{
                      color: configItem?.color,
                    }}
                  />
                ) : null}
                <span className="font-medium">{formattedName}:</span>
                <span>{formattedValue}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig }

