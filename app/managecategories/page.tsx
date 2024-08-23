import PageView from '@/components/categories/PageView'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prismaClient'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { $Enums } from '@prisma/client'
import React, { Suspense } from 'react'

async function getCatgeories() {
    let category: { id: string; name: string; type: $Enums.CategoryType; created_at: Date; updated_at: Date }[] = []
    try {
        category = await prisma.category.findMany() ?? []
    } catch (e:any) {
        console.log(e.message)
    }


    return category
}

const page = async () => {
    const {isAuthenticated, getPermissions} = await getKindeServerSession()
    const category  = await getCatgeories()

    const permissions = await getPermissions()

    console.log(permissions)

    return (
        <div className='w-full  rounded-md h-full'>
            <div className='mx-2'>
                <Suspense fallback="...loading">
                    <PageView category={category} permissions={permissions?.permissions} />
                </Suspense>
            </div>
        </div>
    )
}

export default page
