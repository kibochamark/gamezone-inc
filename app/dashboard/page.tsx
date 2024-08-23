import PageView from '@/components/dashboard/PageView'
import { prisma } from '@/lib/prismaClient'
import React from 'react'


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

const page = async() => {
    const inventory = await getProducts() ?? []
    return (
        <div className='w-full  rounded-md h-full'>
            <div className='mx-2'>
                <PageView inventory={inventory} />
            </div>

        </div>
    )
}

export default page
