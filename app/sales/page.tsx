import PageView from '@/components/sales/PageView'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prismaClient'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import React from 'react'


async function getSales(){
    let sales:any=[]
    try{
        sales = await prisma.sales.findMany({
            select:{
                id:true,
                inventory:{
                    select:{
                        name:true,
                        threshold:true,
                        id:true
                    }
                },
                quantitySold:true,
                priceSold:true,
                status:true,
                type:true,
                vendor:true,
                created_at:true
            }
        })

    }catch(e){

    }

    return sales
}



async function getSalesSummary() {
    let salesSummary:any=[]
    try{
        salesSummary = await prisma.sales.aggregate({
            where:{
                created_at:new Date()
            },
            _sum:{
                priceSold:true
            }
            
        })

    

    }catch(e){

    }

    return salesSummary
}

const page = async() => {
    const {isAuthenticated, getPermissions} = await getKindeServerSession()
    const sales = await getSales()
    const salesSummary = await getSalesSummary()
    
    const permissions = await getPermissions()
   
    return (
        <div className='w-full  rounded-md h-full'>
            <div className='mx-2'>
                <PageView sales={sales} salesSummary={salesSummary} permissions={permissions?.permissions}/>
            </div>

        </div>
    )
}

export default page
