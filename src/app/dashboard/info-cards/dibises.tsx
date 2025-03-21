"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersIcon } from "lucide-react"
import { getTypeChange } from "@/app/dashboard/actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function Dibises() {
  const [exchangeRate, setExchangeRate] = useState<{ conversion_rates: { [key: string]: number } } | null>(null)
  const [currencyType, setCurrencyType] = useState("MXN")
  const [conversionAmount, setConversionAmount] = useState(1)
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [targetCurrency, setTargetCurrency] = useState("USD")
  const [tabs, setTabs] = useState<{ currency: string; rates: any }[]>([])

  const fetchExchangeRate = async (type: string) => {
    const storedExchange = localStorage.getItem(`exchange_${type}`)
    if (storedExchange) {
      const exchange = JSON.parse(storedExchange)
      setExchangeRate(exchange)
      return
    }

    const { exchange, error } = await getTypeChange(type)
    if (!error) {
      setExchangeRate(exchange)
      localStorage.setItem(`exchange_${type}`, JSON.stringify(exchange))
    } else {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchExchangeRate(currencyType)
  }, [currencyType])

  useEffect(() => {
    const storedCurrencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "MXN", "BRL", "ARS", "COP", "CHF", "SEK", "NOK", "PLN", "CNY", "HKD", "SGD", "NZD"]
    const tabsData = storedCurrencies.map((currency) => {
      const storedData = localStorage.getItem(`exchange_${currency}`);
      const data = storedData ? JSON.parse(storedData) : null;
      return data ? { currency, rates: data.conversion_rates } : null
    }).filter(Boolean)
    setTabs(tabsData.filter((tab) => tab !== null) as { currency: string; rates: any }[])
  }, [])

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrencyType(event.target.value)
  }

  const handleTargetCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTargetCurrency(event.target.value)
  }

  const handleConversionAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConversionAmount(Number(event.target.value))
  }

  const handleConvert = () => {
    if (exchangeRate && exchangeRate.conversion_rates) {
      const rate = exchangeRate.conversion_rates[targetCurrency]
      if (rate) {
        setConvertedAmount(conversionAmount * rate)
      } else {
        console.error("Invalid target currency")
      }
    } else {
      console.error("Exchange rate data not available")
    }
  }

  // Helper functions for currency data
  const names: { [key: string]: string } = {
    USD: "US Dollar",
    EUR: "Euro",
    GBP: "British Pound",
    JPY: "Japanese Yen",
    CAD: "Canadian Dollar",
    AUD: "Australian Dollar",
    MXN: "Mexican Peso",
    BRL: "Brazilian Real",
    ARS: "Argentine Peso",
    COP: "Colombian Peso",
    CHF: "Swiss Franc",
    SEK: "Swedish Krona",
    NOK: "Norwegian Krone",
    PLN: "Polish Zloty",
    CNY: "Chinese Yuan",
    HKD: "Hong Kong Dollar",
    SGD: "Singapore Dollar",
    NZD: "New Zealand Dollar",
  }

  const getCurrencyName = (code: keyof typeof names) => {
    return names[code] || code
  }

  const variants = {
    USD: "default",
    EUR: "destructive",
    GBP: "outline",
    JPY: "secondary",
    CAD: "default",
    AUD: "destructive",
    MXN: "outline",
    BRL: "secondary",
    ARS: "default",
    COP: "destructive",
    CHF: "outline",
    SEK: "secondary",
    NOK: "default",
    PLN: "destructive",
    CNY: "outline",
    HKD: "secondary",
    SGD: "default",
    NZD: "destructive",
  }

  const getVariant = (code: keyof typeof variants) => {
    const variants = {
      USD: "default",
      EUR: "destructive",
      GBP: "outline",
      JPY: "secondary",
      CAD: "default",
      AUD: "destructive",
      MXN: "outline",
      BRL: "secondary",
      ARS: "default",
      COP: "destructive",
      CHF: "outline",
      SEK: "secondary",
      NOK: "default",
      PLN: "destructive",
      CNY: "outline",
      HKD: "secondary",
      SGD: "default",
      NZD: "destructive",
    }
    return variants[code]
  }

  

  const regions = {
    Americas: ["USD", "CAD", "MXN", "BRL", "ARS", "COP"],
    Europe: ["EUR", "GBP", "CHF", "SEK", "NOK", "PLN"],
    Asia: ["JPY", "CNY", "HKD", "SGD", "AUD", "NZD"],
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm text-gray-400 font-medium">Exchange Rates</CardTitle>
        <UsersIcon className="h-5 w-5 text-gray-600" />
      </CardHeader>
      <div className="text-4xl font-bold text-black w-full flex justify-center gap-12 items-center">
        <div className="w-full p-2 rounded-r3xl">
          <p className="text-white text-sm text-start py-1 px-4 bg-blue-600 rounded-r-3xl w-fit">
            Current Rate: {exchangeRate ? exchangeRate.conversion_rates[targetCurrency] : "Loading..."}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <Tabs defaultValue="Americas" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {Object.keys(regions).map((region) => (
              <TabsTrigger key={region} value={region}>
                {region}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(regions).map(([region, currencies]) => (
            <TabsContent key={region} value={region} className="mt-2">
              <div className="grid grid-cols-2 gap-2">
                {exchangeRate &&
                  Object.entries(exchangeRate.conversion_rates)
                    .filter(([code]) => currencies.includes(code))
                    .slice(0, 2) // Mostrar solo dos elementos
                    .map(([code, rate]) => (
                      <div
                        key={code}
                        className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {code.substring(0, 1)}
                          </div>
                          <div>
                            <p className="font-medium">{code}</p>
                            <p className="text-xs text-gray-500">{getCurrencyName(code)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{Number(rate).toFixed(4)}</p>
                          
                        </div>
                      </div>
                    ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <CardContent>
        <div className="gap-4 block justify-center items-center">
          <div className="w-full grid grid-cols-3 col-span-2 py-4 gap-4">
            <div className="">
              <label htmlFor="currencyType" className="block text-sm font-medium text-gray-700">
                From
              </label>
              <select
                id="targetCurrency"
                value={targetCurrency}
                onChange={handleTargetCurrencyChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div className="">
              <label htmlFor="currencyType" className="block text-sm font-medium text-gray-700">
                To
              </label>
              <select
                id="baseCurrency"
                value={currencyType}
                onChange={handleCurrencyChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div className="">
              <label htmlFor="conversionAmount" className="block text-sm font-medium text-gray-700">
                Amount to Convert
              </label>
              <input
                type="number"
                id="conversionAmount"
                value={conversionAmount}
                min={0}
                max={1000000000}
                onChange={handleConversionAmountChange}
                className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              />
            </div>
          </div>
        </div>
        {convertedAmount !== null && (
          <div className="">
            <p className="text-sm font-semibold text-gray-700">Converted Amount: ${convertedAmount.toFixed(2)}</p>
          </div>
        )}
        <div className="">
          <button
            onClick={handleConvert}
            className="w-full bg-blue-500 text-white text-sm py-1 px-4 rounded-md hover:bg-blue-700"
          >
            Convert
          </button>
        </div>
      </CardContent>
    </Card>
  )
}