import PageView from '@/components/expenses/PageView'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prismaClient'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'


export const dynamic = 'force-dynamic'


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
                        id:true,
                        name: true
                    }
                },
                description:true,
                created_at:true
            },
            orderBy:{
                created_at:"desc"
            }
        })
    } catch (e: any) {
        console.log(e.message)
    }


    return expenses
}


export async function getExpenseSummary() {
    let expenses
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        let totalexpenses = await prisma.expenseSummary.findFirst({
            where:{
                created_at:{
                    gte:today,
                    lt: new Date(today.getTime() + 86400000)
                }
            },
            select:{
                totalExpenses:true
            }
        })

        expenses={
            revenue :totalexpenses?.totalExpenses || 0
        }

    } catch (e) {

    }

    return expenses
}



const page = async () => {
    const { isAuthenticated, getPermissions } = await getKindeServerSession()

    const category = await getCatgeories() ?? []
    const expenses = await getExpenses() ?? []
    const expensesSummary = await getExpenseSummary()
    const permissions = await getPermissions()


    return (
        <div className='w-full  rounded-md h-full'>
            <div className='mx-2'>
                <Suspense fallback={<Loader className='animate animate-spin flex items-center justify-center' />}>
                    <PageView category={category} expenses={expenses} expensesSummary={expensesSummary} permissions={permissions?.permissions} />
                </Suspense>
            </div>

        </div>
    )
}

export default page
