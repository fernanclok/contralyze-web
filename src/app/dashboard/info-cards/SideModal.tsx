"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
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
      <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center">
              <SheetTitle className="text-2xl font-bold">Transaction Details</SheetTitle>
              <Badge className={`${typeColor} uppercase font-semibold ml-2`}>{transaction.type}</Badge>
            </div>
            <SheetDescription className="text-gray-500">Reference: {transaction.reference_number}</SheetDescription>
          </SheetHeader>

          <Card className="m-2">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-black">Amount</p>
                <div className="flex items-center">
                  <TypeIcon className={`mr-1 ${isIncome ? "text-emerald-300" : "text-rose-300"}`} size={20} />
                  <p className="text-2xl font-bold text-black">
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

        <div className="p-2 space-y-6">
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

        <SheetFooter>
          <Button className="mt-2"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

