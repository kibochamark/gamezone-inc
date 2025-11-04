"use client"

import { useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { InvoiceForm } from "./InvoiceForm"
import { InvoicePreview } from "./InvoicePreview"
import html2pdf from "html2pdf.js"


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
}

export default function CreateInvoicePage({products, invno}: {products: any[] | []; invno: string}) {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    id: "INV" + Date.now(),
    invoiceNumber: invno,
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
  })

  const contentRef = useRef<HTMLDivElement | null>(null);

  const convertToPdf = async () => {
    const content = contentRef.current;
    if (!content) {
      console.error("No content found to generate PDF.");
      return;
    }

    // Clone the node to avoid layout shifts or dynamic content flickering
    const clonedContent = content.cloneNode(true) as HTMLElement;

    // Optional: Apply a fixed width for PDF rendering to maintain consistent layout
    clonedContent.style.width = '800px'; 
    clonedContent.style.maxWidth = '800px';
    clonedContent.style.margin = '0 auto';

    // Append cloned content to an offscreen container to preserve styles
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.appendChild(clonedContent);
    document.body.appendChild(container);

    // Define better PDF generation options
    const options = {
      margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number], // top, left, bottom, right
      filename: 'my-document.pdf',
      image: { type: 'jpeg' as const, quality: 1 },
      html2canvas: {
        scale: 2, // ↑ Higher scale = sharper text and images
        useCORS: true, // Ensures images from external URLs are rendered properly
        logging: false,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: {
        unit: 'pt',
        format: 'a4',
        orientation: 'portrait' as const,
      },
    };

    try {
      await html2pdf().set(options).from(clonedContent).save();
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      // Clean up cloned content
      document.body.removeChild(container);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-foreground">Create Invoice</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card className="p-6">
              <InvoiceForm invoiceData={invoiceData} setInvoiceData={setInvoiceData} products={products} generatepdf={convertToPdf} />
            </Card>
          </div>
          <div>
            <Card className="p-6 sticky top-[73px]" ref={contentRef}>
              <InvoicePreview invoiceData={invoiceData}/>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
