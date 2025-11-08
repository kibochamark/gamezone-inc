import InvoicesPage from '@/components/invoices/PageView'
import { getInvoices, getInvoicesCount, getInvoicesRevenue, getInvoicesSummary } from '@/serverfunctions/invoice'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import React from 'react'


export interface InvoiceSummary{
    invoicecount:number,
    innvoicerevenue:number,
    invoicesummarytypes:any[]
}
const page = async () => {
    const { isAuthenticated, getPermissions } = await getKindeServerSession()
    const permissions = await getPermissions() 
    const invoicecount= await getInvoicesCount() ?? 0
    const innvoicerevenue= await getInvoicesRevenue() ?? 0  
    const invoicesummarytypes =await getInvoicesSummary() ?? []
    const invoices= await getInvoices() ?? []
    // console.log("invoices:", invoices)
    const invoicesummary:InvoiceSummary={
        invoicecount,
        innvoicerevenue,
        invoicesummarytypes
    }


  return (
    <div className='min-h-screen overflow-hidden'>
        <InvoicesPage permissions={permissions?.permissions} invoicesummary={invoicesummary} invoices={invoices}/>
    </div>
  )
}

export default page