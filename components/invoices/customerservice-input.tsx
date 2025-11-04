"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { InvoiceLineItem } from "./CreatePageView"


interface CustomServiceInputProps {
  onAddService: (service: InvoiceLineItem) => void
}

export function CustomServiceInput({ onAddService }: CustomServiceInputProps) {
  const [description, setDescription] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [unitPrice, setUnitPrice] = useState("")

  const handleAdd = () => {
    if (!description.trim() || !unitPrice.trim()) {
      alert("Please fill in all fields")
      return
    }

    const service: InvoiceLineItem = {
      id: "custom-" + Date.now(),
      description: description.trim(),
      quantity: Number.parseInt(quantity) || 1,
      unitPrice: Number.parseFloat(unitPrice) || 0,
      total: (Number.parseInt(quantity) || 1) * (Number.parseFloat(unitPrice) || 0),
      isCustom: true,
    }

    onAddService(service)
    setDescription("")
    setQuantity("1")
    setUnitPrice("")
  }

  return (
    <Card className="p-4 bg-muted/50 space-y-4">
      <div>
        <Label htmlFor="service-desc" className="text-sm">
          Service Description
        </Label>
        <Input
          id="service-desc"
          placeholder="e.g., Custom Integration Setup"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="service-qty" className="text-sm">
            Quantity
          </Label>
          <Input
            id="service-qty"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="service-price" className="text-sm">
            Unit Price
          </Label>
          <Input
            id="service-price"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
          />
        </div>
      </div>

      <Button onClick={handleAdd} className="w-full">
        Add Service
      </Button>
    </Card>
  )
}
