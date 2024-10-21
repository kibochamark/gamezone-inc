import PageView from '@/components/Inventory/PageView'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prismaClient'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { $Enums } from '@prisma/client'
import React, { Suspense } from 'react'

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
        inventory = await prisma.inventory.findMany() ?? []
    } catch (e: any) {
        console.log(e.message)
    }


    return inventory
}
async function getLowStockSummary() {
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

// async function getLowStock() {
//     let inventory: any
//     try {
//         inventory = await prisma.lowStockSummary.aggregate({
//             _count: {
//                 id: true,
//             }
//         }) ?? 0
//     } catch (e: any) {
//         console.log(e.message)
//     }


//     return inventory
// }
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
    const revenue = await getRevenueSummary()

    const permissions = await getPermissions()

    if(inventory.length > 0){
        const products = inventory.filter((inv:any)=> inv.quantity < inv.threshold)
        for( const item of products){
            try{
                    await prisma.lowStockSummary.create({
                        data:{
                            inventoryId:item.id,
                            quantity:item.quantity,
                        }
                    })
            }catch(e:any){
                continue
            }
        }
    }

    return (
        <div className='w-full  rounded-md h-full'>
            <div className='mx-2'>
                <Suspense fallback="...loading">
                    <PageView inventory={inventory} category={category} lowStockSummary={lowStockSummary} revenue={revenue} permissions={permissions?.permissions}/>
                </Suspense>
            </div>

        </div>
    )
}

export default page
