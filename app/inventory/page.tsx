import PageView from '@/components/Inventory/PageView'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prismaClient'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { $Enums } from '@prisma/client'
import React, { Suspense } from 'react'

export const dynamic = 'force-dynamic'


async function getCatgeories() {
    let category: any = []
    try {
        category = await prisma.category.findMany({
            where: {
                type: "INVENTORY"
            }
        }) ?? []
    } catch (e: any) {
        console.log(e.message)
    }


    return category
}
async function getInventory() {
    let inventory: any
    try {
        inventory = await prisma.inventory.findMany({
            orderBy:{
                created_at:"desc"
            }
        }
        ) ?? []
    } catch (e: any) {
        console.log(e.message)
    }


    return inventory
}

export async function getLowStockSummary() {
    let inventory: any
    try {
        inventory = await prisma.lowStockSummary.aggregate({
            _count: {
                id: true,
            }
        }) ?? 0
    } catch (e: any) {
        console.log(e.message)
    }


    return inventory
}


export async function getTotalInv() {
    let inventory: any
    try {
        inventory = await prisma.inventory.aggregate({
            _count: {
                id: true,
            }
        }) ?? 0
    } catch (e: any) {
        console.log(e.message)
    }


    return inventory
}


async function getLowStock() {
    let inventory: any
    try {
        inventory = await prisma.lowStockSummary.findMany({
           include:{
            inventory:true
           }
        }) ?? []
    } catch (e: any) {
        console.log(e.message)
    }


    return inventory
}
async function getRevenueSummary() {
    let inventory: any
    try {
        inventory = await prisma.salesSummary.findMany({
            select:{
                totalSales:true
            }
        }) ?? 0

        
    } catch (e: any) {
        console.log(e.message)
    }


    return inventory
}

const page = async () => {
    const {isAuthenticated, getPermissions} = await getKindeServerSession()
    const inventory = await getInventory()
    
    const category = await getCatgeories()
    const lowStockSummary = await getLowStockSummary()
    const lowStock = await getLowStock()
    const revenue = await getRevenueSummary()

    const permissions = await getPermissions()

  

   

    return (
        <div className='w-full  rounded-md h-full'>
            <div className='mx-2'>
                <Suspense fallback="...loading">
                    <PageView inventory={inventory} lowstock ={lowStock} category={category} lowStockSummary={lowStockSummary} revenue={revenue} permissions={permissions?.permissions}/>
                </Suspense>
            </div>

        </div>
    )
}

export default page
