import { aggregatecapital } from '@/components/capitalamount/capitalactions'
import PageView from '@/components/capitalamount/PageView'
import { prisma } from '@/lib/prismaClient'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'


export const dynamic = 'force-dynamic'



const page = async () => {

    const data = await aggregatecapital()
    // const data = await seedData()
    // console.log(data, "aggregated data")

    return (
        <div className='w-full  rounded-md h-full'>
            <div className='mx-2'>
                <Suspense fallback={<Loader className="flex items-center justify-center animate animate-spin" />}>
                    <PageView data={data} />
                </Suspense>
            </div>

        </div>
    )
}

export default page
