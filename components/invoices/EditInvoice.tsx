"use client"

import { useRef, useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { InvoiceForm } from "./InvoiceForm"
import { InvoicePreview } from "./InvoicePreview"
import html2pdf from "html2pdf.js"
import { useFormik } from "formik"

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  productThreshold?: number
  unitPrice: number
  total: number
  isCustom: boolean
}

export interface InvoiceData {
  id: string
  invoiceNumber: string
  companyName: string
  companyEmail: string
  companyLogo: string | null
  clientName: string
  clientEmail: string
  issueDate: string
  dueDate: string
  items: InvoiceLineItem[]
  subtotal: number
  tax: number
  total: number
  invoiceStatus?: "paid"| "pending" | "overdue"
}

export default function EditInvoicePage({
  products,
  invoicedata,
}: {
  products: any[] | []
  invoicedata: any // backend invoice object
}) {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>({
    id: "INV" + Date.now(),
    invoiceNumber: "invno",
    companyName: "DanTech Solutions Ltd",
    companyEmail: "danielmuregi93@gmail.com",
    companyLogo: "/logo.jpg",
    clientName: "",
    clientEmail: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
  }
  )
  const contentRef = useRef<HTMLDivElement | null>(null)

  // 🧩 Map backend data to frontend format when prop changes
  useEffect(() => {
    if (invoicedata) {
      const mappedInvoice: InvoiceData = {
        id: invoicedata.id,
        invoiceNumber: invoicedata.invoiceNo,
        companyName: "DanTech Solutions Ltd", // can also come dynamically if needed
        companyEmail: "danielmuregi93@gmail.com",
        companyLogo: "/logo.jpg",
        clientName: invoicedata.customerName,
        clientEmail: invoicedata.customerContact,
        issueDate: new Date(invoicedata.created_at).toISOString().split("T")[0],
        dueDate: new Date(invoicedata.dueDate).toISOString().split("T")[0],
        items: invoicedata.InvoiceItem?.map((item: any) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          productThreshold: item.productThreshold,
          unitPrice: item.unitPrice,
          total: item.total,
          isCustom: item.isCustom,
        })) || [],
        subtotal: invoicedata.subtotal,
        tax: invoicedata.tax,
        total: invoicedata.total,
        invoiceStatus: invoicedata.status.toLowerCase(),
      }

      setInvoiceData(mappedInvoice)
    }
  }, [invoicedata])

  const convertToPdf = async () => {
    const content = contentRef.current
    if (!content) {
      console.error("No content found to generate PDF.")
      return
    }

    const clonedContent = content.cloneNode(true) as HTMLElement
    const container = document.createElement("div")

    const options = {
      margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
      filename: `${invoiceData?.invoiceNumber}-${invoiceData?.clientName}-${new Date()}.pdf`,
      image: { type: "jpeg" as const, quality: 1 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: {
        unit: "pt",
        format: "a4",
        orientation: "portrait" as const,
      },
    }

    try {
      await html2pdf().set(options).from(clonedContent).save()
    } catch (err) {
      console.error("PDF generation failed:", err)
    } finally {
      document.body.removeChild(container)
    }
  }

  const formik = useFormik({
    initialValues: invoiceData || {
      id: "",
      invoiceNumber: "",
      companyName: "",
      companyEmail: "",
      companyLogo: null,
      clientName: "",
      clientEmail: "",
      issueDate: "",
      dueDate: "",
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
    },
    enableReinitialize: true,
    onSubmit: (values: InvoiceData) => {
      console.log("Form submitted with values:", values)
    },
  })

  if (!invoiceData) return <p className="p-6 text-center">Loading invoice...</p>

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-foreground">Update Invoice</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card className="p-6">
              <InvoiceForm
                invoiceData={invoiceData}
                setInvoiceData={setInvoiceData}
                products={products}
                generatepdf={convertToPdf}
              />
            </Card>
          </div>
          <div>
            <Card className="p-6 sticky top-[73px]" ref={contentRef}>
              <InvoicePreview invoiceData={invoiceData} />
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
