import { getInventory } from '@/app/inventory/page'
import CreateInvoicePage from '@/components/invoices/CreatePageView'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prismaClient'
import { Arrow } from '@radix-ui/react-dropdown-menu'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'


async function generateNextInvoiceNumber() {
    const invoice = await prisma.invoice.findFirst({
        orderBy: {
            created_at: 'desc'
        }
    })

    
    if (!invoice) {
        return "INV10001"; // Starting number
    }

    // Extract the numeric part and increment
    const lastNumber = parseInt(invoice.invoiceNo.replace('INV', ''));
    const nextNumber = lastNumber + 1;
    
    return `INV${nextNumber}`;
}

const page = async () => {
    const inventory = await getInventory() ?? []

    const invno = await generateNextInvoiceNumber()

    // console.log("Inventory in invoice page:", inventory)
    return (
        <div className='min-h-screen flex flex-col items-start'>
            <div>
                <Link href="/invoice">
                    <Button variant="outline" className='w-fit mt-4 flex flex-row items-center gap-2'>

                        <ArrowLeft className='w-6 h-6 cursor-pointer duration-300' />
                        back
                    </Button>
                </Link>
            </div>

            <div className='my-2 w-full rounded-md'>
                <CreateInvoicePage products={inventory} invno={invno}/>
            </div>
            

        </div>
  )
}

export default page