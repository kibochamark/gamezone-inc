import PageView from '@/components/services/PageView'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prismaClient'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import React from 'react'



async function getServices() {
    let services: any = []
    try {
        services = await prisma.services.findMany({

        })

    } catch (e) {

    }

    return services
}



const page = async () => {
    const services = await getServices()
    const {isAuthenticated, getPermissions} = await getKindeServerSession()

    const permissions = await getPermissions()
    console.log(services)


    return (
        <div className='w-full  rounded-md h-full'>
            <div className='mx-2'>
                <PageView services={services} permissions={permissions?.permissions}/>
            </div>

        </div>
    )
}

export default page
