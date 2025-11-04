"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader, Trash2 } from "lucide-react"
import { InvoiceData, InvoiceLineItem } from "./CreatePageView"
import { ProductSearch } from "./product-search"
import { CustomServiceInput } from "./customerservice-input"
import { Product } from "../Inventory/columns"
import { useFormik } from "formik"
import toast from "react-hot-toast"
import { useMutation } from "@tanstack/react-query"
import { createInvoice } from "@/serverfunctions/invoice"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"

interface InvoiceFormProps {
  invoiceData: InvoiceData
  setInvoiceData: (data: InvoiceData) => void,
  products: Product[] | [],
  generatepdf?: () => void
}

export function InvoiceForm({ invoiceData, setInvoiceData, products, generatepdf }: InvoiceFormProps) {
  const [showCustomService, setShowCustomService] = useState(false)

  const handleAddProduct = (product: InvoiceLineItem) => {
    const newItems = [...invoiceData.items, product]
    const subtotal = newItems.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax

    setInvoiceData({
      ...invoiceData,
      items: newItems,
      subtotal,
      tax,
      total,
    })
  }

  const handleRemoveItem = (id: string) => {
    const newItems = invoiceData.items.filter((item) => item.id !== id)
    const subtotal = newItems.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax

    setInvoiceData({
      ...invoiceData,
      items: newItems,
      subtotal,
      tax,
      total,
    })
  }

  const handleUpdateItem = (id: string, quantity: number, unitPrice: number) => {

    const item_to_update = invoiceData.items.find((item) => item.id === id);
    if (!item_to_update) return;
    if ((item_to_update.productThreshold && quantity)  && item_to_update.productThreshold + quantity > item_to_update.productThreshold) {
      toast.error(`Quantity exceeds available stock ${item_to_update.productThreshold}`, {duration: 4000});
      // alert(`Quantity exceeds available stock of ${item_to_update.productThreshold}.`);  
      return;
    }
    const newItems = invoiceData.items.map((item) =>
      item.id === id ? { ...item, quantity, unitPrice, total: quantity * unitPrice } : item,
    )
    const subtotal = newItems.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax

    setInvoiceData({
      ...invoiceData,
      items: newItems,
      subtotal,
      tax,
      total,
    })
  }

  // get kinde user id 
  const {getUser} = useKindeBrowserClient()
  const user = getUser()


  const invoicemutation = useMutation({
    mutationFn: async (data: InvoiceData) => {
      const response = await createInvoice(
        {
            invoiceNo:  data.invoiceNumber, 
            customerName :data.clientName,
            customerContact: data.clientEmail,
            createdBy :    user?.given_name + "-" + user?.email || "unknown_user",
            dueDate : new Date(data.dueDate),
            subtotal: data.subtotal,
            tax: data.tax,
            total: data.total,
            notes: "",
            items: data.items.map((item) => ({
                inventoryId: item.isCustom ? undefined : item.id,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.total,
            })),
            status: "PENDING"
        }
      )
    
      if (response[1] !== 201) {
        throw new Error(`Failed to create invoice: ${response[0]}`);
      }
      return response[0];
    },
    onSuccess: (data) => {
      toast.success('Invoice created successfully!');
      setInvoiceData({} as InvoiceData); // Reset form
      
      generatepdf && generatepdf();
      // Optionally reset the form or redirect
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  })

  return (
    <div className="space-y-6">
      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="invoice-number">Invoice Number</Label>
            <Input
              id="invoice-number"
              placeholder="INV-001"
              value={invoiceData.invoiceNumber}
              disabled
              className="font-bold bg-primary600 text-black"
              onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="client-name">Client Name</Label>
            <Input
              id="client-name"
              placeholder="John Doe"
              value={invoiceData.clientName}
              onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="client-email">Client Email</Label>
            <Input
              id="client-email"
              type="email"
              placeholder="client@example.com"
              value={invoiceData.clientEmail}
              onChange={(e) => setInvoiceData({ ...invoiceData, clientEmail: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issue-date">Issue Date</Label>
              <Input
                id="issue-date"
                type="date"
                value={invoiceData.issueDate}
                onChange={(e) => setInvoiceData({ ...invoiceData, issueDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products & Services */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Products & Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProductSearch onSelectProduct={handleAddProduct} products={products} />

          <div className="flex gap-2">
            <Button
              variant={showCustomService ? "default" : "outline"}
              size="sm"
              onClick={() => setShowCustomService(!showCustomService)}
            >
              {showCustomService ? "Hide" : "Add Custom Service"}
            </Button>
          </div>

          {showCustomService && <CustomServiceInput onAddService={handleAddProduct} />}

          {/* Line Items Table */}
          {invoiceData.items?.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Selected Items</h4>
              <div className="space-y-2">
                {invoiceData.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × ${item.unitPrice.toFixed(2)} = ${item.total.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(item.id, Number.parseInt(e.target.value) || 1, item.unitPrice)
                        }
                        className="w-16 text-center text-sm"
                      />
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button className="w-full" onClick={()=>{
        if(invoiceData.items.length === 0){
          toast.error("Add at least one item to create an invoice.");
          return;
        }
        if(invoiceData.clientName.trim() === "" || invoiceData.clientEmail.trim() === ""){
          toast.error("Client name and email are required.");
          return;
        }

        invoicemutation.mutate(invoiceData)}}
        disabled={invoicemutation.isPending}>
        {invoicemutation.isPending ? <Loader className="w-4 h-4 animate animate-spin text-blue-400"/> : "Create Invoice"}
        </Button>
    </div>
  )
}
