"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, Plus } from "lucide-react"
import { InvoiceLineItem } from "./CreatePageView"
import { Product } from "../Inventory/columns"

// Mock products database
const products = [
  { id: "p1", name: "Web Development", price: 500 },
  { id: "p2", name: "UI/UX Design", price: 300 },
  { id: "p3", name: "Consulting", price: 200 },
  { id: "p4", name: "Project Management", price: 150 },
  { id: "p5", name: "Content Writing", price: 100 },
  { id: "p6", name: "Video Production", price: 800 },
  { id: "p7", name: "SEO Optimization", price: 250 },
  { id: "p8", name: "Mobile App Development", price: 1500 },
]

interface ProductSearchProps {
  onSelectProduct: (product: InvoiceLineItem) => void,
  products: Product[] | []
}

export function ProductSearch({ onSelectProduct, products }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState(products)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredProducts(filtered)
      setIsOpen(true)
    } else {
      setFilteredProducts(products)
      setIsOpen(false)
    }
  }, [searchTerm])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelectProduct = (product: (typeof products)[0]) => {
    if (!product) return

 
    const lineItem: InvoiceLineItem = {
      id: product.id,
      description: product.name,
      quantity: 1,
      productThreshold: (product as Product).quantity || 0,
      unitPrice: product.price,
      total: product.price,
      isCustom: false,
    }
    onSelectProduct(lineItem)
    setSearchTerm("")
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm && setIsOpen(true)}
            className="pl-10"
          />
        </div>
      </div>

      {isOpen && filteredProducts.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg">
          <div className="max-h-64 overflow-y-auto">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                onClick={() => handleSelectProduct(product)}
              >
                <div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Intl.NumberFormat('KES', { style: 'decimal', minimumFractionDigits: 2 }).format(product.price)}
                    </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectProduct(product)
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {isOpen && filteredProducts.length === 0 && searchTerm && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 p-3 text-center text-sm text-muted-foreground">
          No products found
        </Card>
      )}
    </div>
  )
}
