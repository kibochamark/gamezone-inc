"use client"
import { converttocunrrency } from "@/lib/utils"
import { InvoiceData } from "./CreatePageView"
import Image from "next/image"

interface InvoicePreviewProps {
  invoiceData: InvoiceData,
}

export function InvoicePreview({ invoiceData}: InvoicePreviewProps) {



  



  return (
    <>
      {/* Invoice Template */}
      <div className="bg-white text-black  rounded-lg space-y-4 font-sans">
        <div className="flex justify-between items-start pb-6 border-b-2 border-gray-200">
          <div>
            {invoiceData.companyLogo ? (
              <Image src={invoiceData.companyLogo || "/placeholder.svg"} alt="Company Logo" priority width={300} height={500} className="h-20 w-auto" />
            ) : (
              <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                Logo
              </div>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900">{invoiceData.companyName || "Company Name"}</h2>
            <p className="text-sm text-gray-600">Central</p>
            <p className="text-sm text-gray-600">Kenya</p>
            <p className="text-sm text-gray-600">{invoiceData.companyEmail || "email@company.com"}</p>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-600 text-xs font-semibold mb-1">INVOICE</p>
            <h1 className="text-2xl font-semibold">#{invoiceData.invoiceNumber || "INV00000"}</h1>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">{invoiceData.clientName || "Company Name"}</p>
            <p className="text-sm text-gray-600">{invoiceData.clientEmail || ""}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded">
          <div>
            <p className="text-gray-600 text-xs font-semibold mb-1">Invoice Date :</p>
            <p className="font-medium">{invoiceData.issueDate || "DD/MM/YYYY"}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs font-semibold mb-1">Terms :</p>
            <p className="font-medium">Due on Receipt</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs font-semibold mb-1">Due Date :</p>
            <p className="font-medium">{invoiceData.dueDate || "DD/MM/YYYY"}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs font-semibold mb-1">Balance Due</p>
            <p className="font-bold text-lg">{converttocunrrency(invoiceData.total)}</p>
          </div>
        </div>

        <div>
          <p className="text-gray-600 text-xs font-semibold mb-2">Bill To</p>
          <p className="font-semibold text-base">{invoiceData.clientName || "Client Name"}</p>
          <p className="text-sm text-gray-600">{invoiceData.clientEmail || "client@email.com"}</p>
        </div>

        <div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300 bg-gray-50">
                <th className="text-left py-3 px-2 font-semibold text-xs">#</th>
                <th className="text-left py-3 px-2 font-semibold text-xs">Item & Description</th>
                <th className="text-center py-3 px-2 font-semibold text-xs w-16">Qty</th>
                <th className="text-right py-3 px-2 font-semibold text-xs w-20">Rate</th>
                <th className="text-right py-3 px-2 font-semibold text-xs w-24">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.length > 0 ? (
                invoiceData.items.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-3 px-2">{index + 1}</td>
                    <td className="py-3 px-2">{item.description}</td>
                    <td className="text-center py-3 px-2">{item.quantity.toFixed(2)}</td>
                    <td className="text-right py-3 px-2">{converttocunrrency(item.unitPrice)}</td>
                    <td className="text-right py-3 px-2 font-medium">{converttocunrrency(item.total)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400">
                    No items added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2 text-sm border-b border-gray-200">
              <span>Sub Total</span>
              <span className="font-medium">{converttocunrrency(invoiceData.subtotal)}</span>
            </div>
            <div className="flex justify-between py-3 bg-gray-100 px-2 rounded font-bold text-base border border-gray-300">
              <span>Total</span>
              <span>{converttocunrrency(invoiceData.total)}</span>
            </div>
            <div className="flex justify-between py-3 text-sm">
              <span className="font-semibold">Balance Due</span>
              <span className="font-bold text-base">{converttocunrrency(invoiceData.total)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-200">
          <div>
            <p className="font-semibold text-sm mb-2">Notes</p>
            <p className="text-xs text-gray-600">Thanks for your business.</p>
          </div>
          <div>
            <p className="font-semibold text-sm mb-2">Terms & Conditions</p>
            <p className="text-xs text-gray-600">
              Payments are to be made to our Buy Goods Till Number. 5900309. Kindly share a confirmation message after
              payment.
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
          <p>@DantechComputers</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print-section {
            page-break-after: always;
          }
        }
      `}</style>
    </>
  )
}
