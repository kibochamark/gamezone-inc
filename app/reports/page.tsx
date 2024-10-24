import PageView from '@/components/dashboard/PageView'
import ShopReports from '@/components/reports/Reports'
import React from 'react'


export const dynamic = "force-dynamic"

const page = () => {
    return (
        <div className='w-full  rounded-md h-full'>
            <ShopReports />

        </div>
    )
}

export default page
