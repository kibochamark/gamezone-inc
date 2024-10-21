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
async function getServicesSummary() {
    let services
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        let totalservices = await prisma.serviceSummary.findFirst({
            where:{
                date:{
                    gte:today,
                    lt: new Date(today.getTime() + 86400000)

                }
            },
            select:{
                totalServices:true
            },
                
        })

        services={
            revenue :totalservices?.totalServices
        }

    } catch (e) {

    }

    return services
}



const page = async () => {
    const services = await getServices()
    const servicesSummary = await getServicesSummary()
    const {isAuthenticated, getPermissions} = await getKindeServerSession()

    const permissions = await getPermissions()
    console.log(services)


    return (
        <div className='w-full  rounded-md h-full'>
            <div className='mx-2'>
                <PageView services={services} servicesSummary={servicesSummary} permissions={permissions?.permissions}/>
            </div>

        </div>
    )
}

export default page
