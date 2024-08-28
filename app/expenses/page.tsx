import PageView from '@/components/expenses/PageView'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prismaClient'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'

async function getCatgeories() {
    let category: any = []
    try {
        category = await prisma.category.findMany({
            where: {
                type: "EXPENSE"
            }
        }) ?? []
    } catch (e: any) {
        console.log(e.message)
    }


    return category
}

async function getExpenses() {
    let expenses: any = []
    try {
        expenses = await prisma.expenses.findMany({
            select: {
                id:true,
                expensename: true,
                amount:true,
                kindeName: true,
                category: {
                    select: {
                        name: true
                    }
                },
                description:true,
                created_at:true
            }
        })
    } catch (e: any) {
        console.log(e.message)
    }


    return expenses
}



const page = async () => {
    const { isAuthenticated, getPermissions } = await getKindeServerSession()

    const category = await getCatgeories() ?? []
    const expenses = await getExpenses() ?? []
    const permissions = await getPermissions()


    return (
        <div className='w-full  rounded-md h-full'>
            <div className='mx-2'>
                <Suspense fallback={<Loader className='animate animate-spin flex items-center justify-center' />}>
                    <PageView category={category} expenses={expenses} permissions={permissions?.permissions} />
                </Suspense>
            </div>

        </div>
    )
}

export default page
