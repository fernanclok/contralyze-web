"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface CalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  mode?: "single" | "range" | "multiple"
  selected?: Date | Date[] | { from: Date; to: Date }
  onSelect?: (date: Date | undefined) => void
  disabled?: { from: Date; to: Date }[] | Date[]
  initialFocus?: boolean
  showOutsideDays?: boolean
  locale?: string
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  ISOWeek?: boolean
}

function Calendar({
  className,
  mode = "single",
  selected,
  onSelect,
  disabled,
  initialFocus,
  showOutsideDays = true,
  locale = "default",
  weekStartsOn = 0,
  ISOWeek,
  ...props
}: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    mode === "single" && selected instanceof Date ? selected : undefined,
  )

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get day of week of first day in month
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  // Get previous month days that should be displayed
  const getPreviousMonthDays = (year: number, month: number) => {
    const firstDayOfMonth = getFirstDayOfMonth(year, month)
    const adjustedFirstDay = (firstDayOfMonth - weekStartsOn + 7) % 7

    if (adjustedFirstDay === 0 && !showOutsideDays) return []

    const daysInPreviousMonth = getDaysInMonth(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1)

    const previousMonthDays = []

    for (let i = 0; i < adjustedFirstDay; i++) {
      previousMonthDays.push({
        date: new Date(
          month === 0 ? year - 1 : year,
          month === 0 ? 11 : month - 1,
          daysInPreviousMonth - adjustedFirstDay + i + 1,
        ),
        isCurrentMonth: false,
        isToday: false,
      })
    }

    return previousMonthDays
  }

  // Get current month days
  const getCurrentMonthDays = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month)
    const today = new Date()
    const currentMonthDays = []

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      currentMonthDays.push({
        date,
        isCurrentMonth: true,
        isToday: today.getDate() === i && today.getMonth() === month && today.getFullYear() === year,
      })
    }

    return currentMonthDays
  }

  // Get next month days that should be displayed
  const getNextMonthDays = (year: number, month: number, currentMonthDays: any[], previousMonthDays: any[]) => {
    if (!showOutsideDays) return []

    const totalDaysDisplayed = previousMonthDays.length + currentMonthDays.length
    const remainingCells = 42 - totalDaysDisplayed // 6 rows of 7 days

    const nextMonthDays = []

    for (let i = 1; i <= remainingCells; i++) {
      nextMonthDays.push({
        date: new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, i),
        isCurrentMonth: false,
        isToday: false,
      })
    }

    return nextMonthDays
  }

  // Get all days to display
  const getAllDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const previousMonthDays = getPreviousMonthDays(year, month)
    const currentMonthDays = getCurrentMonthDays(year, month)
    const nextMonthDays = getNextMonthDays(year, month, currentMonthDays, previousMonthDays)

    return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays]
  }

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(
        currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear(),
        currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1,
        1,
      ),
    )
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(
      new Date(
        currentDate.getMonth() === 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear(),
        currentDate.getMonth() === 11 ? 0 : currentDate.getMonth() + 1,
        1,
      ),
    )
  }

  // Handle day selection
  const handleDayClick = (day: { date: Date; isCurrentMonth: boolean }) => {
    if (mode === "single") {
      setSelectedDate(day.date)
      onSelect?.(day.date)
    }
  }

  // Check if a date is selected
  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false

    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  // Check if a date is disabled
  const isDateDisabled = (date: Date) => {
    if (!disabled) return false

    if (Array.isArray(disabled)) {
      return disabled.some((disabledDate) => {
        if (disabledDate instanceof Date) {
          return (
            date.getDate() === disabledDate.getDate() &&
            date.getMonth() === disabledDate.getMonth() &&
            date.getFullYear() === disabledDate.getFullYear()
          )
        }

        if (typeof disabledDate === "object" && disabledDate.from && disabledDate.to) {
          return date >= disabledDate.from && date <= disabledDate.to
        }

        return false
      })
    }

    return false
  }

  // Format month and year for display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    })
  }

  // Get weekday names
  const getWeekdayNames = () => {
    const weekdays = []
    const date = new Date(2023, 0, 1) // Sunday

    // Adjust to start from the specified weekStartsOn day
    date.setDate(date.getDate() + weekStartsOn)

    for (let i = 0; i < 7; i++) {
      weekdays.push(date.toLocaleDateString(locale, { weekday: "short" }))
      date.setDate(date.getDate() + 1)
    }

    return weekdays
  }

  const days = getAllDays()
  const weekdays = getWeekdayNames()

  return (
    <div className={cn("p-2 bg-white rounded-md", className)} {...props}>
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1 py-1">
          <div className="text-sm font-medium text-gray-800">{formatMonthYear(currentDate)}</div>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="icon" className="h-6 w-6 p-0 text-gray-600" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-6 w-6 p-0 text-gray-600" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="w-full">
          <div className="grid grid-cols-7 gap-1">
            {weekdays.map((weekday, index) => (
              <div key={index} className="text-xs font-medium text-gray-500 text-center">
                {weekday.substring(0, 1)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 mt-1">
            {days.map((day, index) => {
              const isSelected = isDateSelected(day.date)
              const isDisabled = isDateDisabled(day.date)

              return (
                <div
                  key={index}
                  className={cn(
                    "relative p-0 text-center text-sm",
                    isSelected && "bg-gray-100",
                    day.isCurrentMonth ? "" : "text-gray-400 opacity-50",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleDayClick(day)}
                    disabled={isDisabled}
                    className={cn(
                      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-7 w-7 p-0 text-gray-800 hover:bg-gray-100",
                      isSelected && "bg-blue-600 text-white hover:bg-blue-600 hover:text-white",
                      day.isToday && !isSelected && "border border-blue-200 bg-blue-50 text-blue-700",
                      isDisabled && "text-gray-400 opacity-50 cursor-not-allowed",
                    )}
                  >
                    {day.date.getDate()}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }

