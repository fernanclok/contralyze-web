"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Calendar, CreditCard, Hash, User, Building, Tag } from "lucide-react"

export default function TransactionModal({
  open,
  onOpenChange,
  transaction,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: any
}) {
  if (!transaction) return null

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Determine transaction type styles
  const isIncome = transaction.type === "income"
  const typeColor = isIncome ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
  const amountColor = isIncome ? "text-emerald-600" : "text-rose-600"
  const TypeIcon = isIncome ? ArrowUpRight : ArrowDownRight

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white p-0">
        <div
          className={`w-full p-6 py-14 ${isIncome ? "bg-gradient-to-r from-emerald-500 to-teal-600" : "bg-gradient-to-r from-rose-500 to-pink-600"}`}
        >
          <SheetHeader className="text-white mb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-2xl font-bold text-white">Transaction Details</SheetTitle>
              <Badge className={`${typeColor} uppercase font-semibold`}>{transaction.type}</Badge>
            </div>
            <SheetDescription className="text-white/80">Reference: {transaction.reference_number}</SheetDescription>
          </SheetHeader>

          <Card className="bg-white/10 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Amount</p>
                <div className="flex items-center">
                  <TypeIcon className={`mr-1 ${isIncome ? "text-emerald-300" : "text-rose-300"}`} size={20} />
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(Number.parseFloat(transaction.amount))}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm">Status</p>
                <Badge className="bg-white/20 text-white hover:bg-white/30">{transaction.status}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">TRANSACTION INFORMATION</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Date</p>
                  <p className="text-sm text-gray-600">{formatDate(transaction.transaction_date)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <CreditCard className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Payment Method</p>
                  <p className="text-sm text-gray-600 capitalize">{transaction.payment_method}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Hash className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Reference Number</p>
                  <p className="text-sm text-gray-600">{transaction.reference_number}</p>
                </div>
              </div>
            </div>
          </div>


          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">DESCRIPTION</h3>
            <p className="text-gray-700 p-3 bg-gray-50 rounded-md">{transaction.description}</p>
          </div>


          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">RELATED INFORMATION</h3>
            <div className="space-y-3">
              {transaction.category && (
                <div className="flex items-start">
                  <Tag className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Category</p>
                    <div className="flex items-center">
                      <p className="text-sm text-gray-600">{transaction.category.name}</p>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {transaction.category.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {transaction.user && (
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Processed by</p>
                    <p className="text-sm text-gray-600">
                      {transaction.user.first_name} {transaction.user.last_name}
                      <span className="text-xs text-gray-500 ml-1">({transaction.user.role})</span>
                    </p>
                  </div>
                </div>
              )}

              {transaction.client && (
                <div className="flex items-start">
                  <Building className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Client</p>
                    <p className="text-sm text-gray-600">{transaction.client.name}</p>
                    <p className="text-xs text-gray-500">
                      {transaction.client.email} • {transaction.client.phone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <SheetFooter className="px-6 pb-6 pt-2">
          <Button
            onClick={() => onOpenChange(false)}
            className={`w-full ${isIncome ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

