import PageView from '@/components/dashboard/PageView'
import { prisma } from '@/lib/prismaClient'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
import { getSalesSummary } from '../sales/page'
import { getLowStockSummary, getTotalInv } from '../inventory/page'


async function getProducts() {
    let inventory: any
    try {
        inventory = await prisma.inventory.findMany({
            take: 5,
            orderBy: {
                frequencySold: "desc"
            }
        }) ?? []
    } catch (e: any) {
        console.log(e.message)
    }


    return inventory
}
async function getRecentSales() {
    let sales: any
    try {
        sales = await prisma.sales.findMany({
            take: 5,
            orderBy: {
                created_at: "desc"
            },
            select: {
                inventory: {
                    select: {
                        name:true
                    }
                },
                priceSold:true,
                quantitySold:true,
                
            }
        }) ?? []
    } catch (e: any) {
        console.log(e.message)
    }


    return sales
}

const page = async () => {
    const inventory = await getProducts() ?? []
    const sales = await getRecentSales() ?? []
    const salesSummary = await getSalesSummary()
    const lowstock = await getLowStockSummary()
    const totalInv = await getTotalInv()
    return (
        <div className='w-full  rounded-md h-full'>
            <div className='mx-2'>
                <Suspense fallback={<Loader className="flex items-center justify-center animate animate-spin" />}>
                    <PageView inventory={inventory} lowstock={lowstock}  totalInv={totalInv} salesSummary={salesSummary} recentsales={sales} />
                </Suspense>
            </div>

        </div>
    )
}

export default page
