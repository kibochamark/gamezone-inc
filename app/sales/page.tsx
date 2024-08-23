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
                        name:true
                    }
                },
                quantitySold:true,
                priceSold:true,
                created_at:true
            }
        })

    }catch(e){

    }

    return sales
}

const page = async() => {
    const {isAuthenticated, getPermissions} = await getKindeServerSession()
    const sales = await getSales()
    
    const permissions = await getPermissions()
   
    return (
        <div className='w-full  rounded-md h-full'>
            <div className='mx-2'>
                <PageView sales={sales} permissions={permissions?.permissions}/>
            </div>

        </div>
    )
}

export default page
