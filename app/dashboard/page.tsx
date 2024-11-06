import PageView from '@/components/dashboard/PageView'
import { prisma } from '@/lib/prismaClient'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
import { getSalesSummary } from '../sales/page'
import { getLowStockSummary, getTotalInv } from '../inventory/page'
import { getExpenseSummary } from '../expenses/page'
import { seedData } from '@/components/Inventory/InventoryActions'
import { genRandonString } from '@/lib/generateAccountRef'


export const dynamic = 'force-dynamic'

async function getProducts() {
    let inventory: any
    try {
        inventory = await prisma.inventory.findMany({
            orderBy: {
                frequencySold: "desc",

            },
            take: 5,
        }) ?? []
    } catch (e: any) {
        console.log(e.message)
    }


    return inventory
}
async function getRecentSales() {
    let sales: any
    try {
        sales = await prisma.sales.findMany({
            take: 5,
            orderBy: {
                created_at: "desc"
            },
            select: {
                inventory: {
                    select: {
                        name: true
                    }
                },
                priceSold: true,
                quantitySold: true,

            }
        }) ?? []
    } catch (e: any) {
        console.log(e.message)
    }


    return sales
}

async function getsummary() {
    return await prisma.assetAccount.create({
        data: {
            accountRef: `CA${genRandonString()}`,
            accounttype: "CASHACCOUNT",
            paymenttype: "CASH",
            debitTotal: 214462,
            creditTotal: 0
        }
    })
    // return await prisma.equityAccount.create({
    //     data:{
    //         accountRef:`EA${genRandonString()}`,
    //         accounttype:"CAPTIALACCOUNT",
    //         paymenttype:"CASH",
    //         debitTotal:214462,
    //         creditTotal:0
    //     }
    // })
}

async function getCashAtHand() {
    try {

        const today = new Date()
        const yesterday = new Date(today)

        yesterday.setDate(yesterday.getDate() - 1)

        // const startingbalancefetch = await prisma.assetAccount.aggregate({
        //     where: {
        //         accounttype: "CASHACCOUNT",
        //         OR: [
        //             {
        //                 created_at: {
        //                     gte: yesterday,
        //                     lt: new Date(yesterday.getTime() + 86400000) // Add 1 day to get end of today
        //                 },
        //             },
        //             {
        //                 updated_at: {
        //                     gte: yesterday,
        //                     lt: new Date(yesterday.getTime() + 86400000)
        //                 }
        //             }
        //         ]
        //     },
        //     _sum: {
        //         debitTotal: true,
        //         creditTotal: true
        //     }
        // })
        // const expensesyesterday = await prisma.newExpenseAccount.aggregate({
        //     where: {
        //         OR: [
        //             {
        //                 created_at: {
        //                     gte: yesterday,
        //                     lt: new Date(yesterday.getTime() + 86400000) // Add 1 day to get end of today
        //                 },
        //             }, {
        //                 updated_at: {
        //                     gte: yesterday,
        //                     lt: new Date(yesterday.getTime() + 86400000)
        //                 }
        //             }
        //         ]
        //     },
        //     _sum: {
        //         debitTotal: true,
        //         creditTotal: true
        //     }
        // })

        // let expensesforyesterday = (expensesyesterday._sum.debitTotal as number) - (expensesyesterday._sum.creditTotal as number)


        let startingbalance = await prisma.cASHBALANCE.findFirst(
{
    where:{
        OR: [
            {
                created_at: {
                    gte: yesterday,
                    lt: new Date(yesterday.getTime() + 86400000) // Add 1 day to get end of today
                },
            },
            {
                updated_at: {
                    gte: yesterday,
                    lt: new Date(yesterday.getTime() + 86400000)
                }
            }
        ]
    }
}
        )

        const cashasoftoday = await prisma.assetAccount.aggregate({
            where: {
                accounttype: "CASHACCOUNT",
                OR: [
                    {
                        created_at: {
                            gte: today,
                            lt: new Date(today.getTime() + 86400000) // Add 1 day to get end of today
                        },
                    },
                    {
                        updated_at: {
                            gte: today,
                            lt: new Date(today.getTime() + 86400000)
                        }
                    }
                ]
            },
            _sum: {
                debitTotal: true,
                creditTotal: true
            }
        })
        let cashtoday = (cashasoftoday._sum.debitTotal as number) - (cashasoftoday._sum.creditTotal as number) 

        const expenses = await prisma.newExpenseAccount.aggregate({
            where: {
                OR: [
                    {
                        created_at: {
                            gte: today,
                            lt: new Date(today.getTime() + 86400000) // Add 1 day to get end of today
                        },
                    }, {
                        updated_at: {
                            gte: today,
                            lt: new Date(today.getTime() + 86400000)
                        }
                    }
                ]
            },
            _sum: {
                debitTotal: true,
                creditTotal: true
            }
        })

        let expensesfortoday = (expenses._sum.debitTotal as number) - (expenses._sum.creditTotal as number) 


        const starting = await prisma.cASHBALANCE.findFirst({
            where:{
                OR: [
                    {
                        created_at: {
                            gte: today,
                            lt: new Date(today.getTime() + 86400000) // Add 1 day to get end of today
                        },
                    },
                    {
                        updated_at: {
                            gte: today,
                            lt: new Date(today.getTime() + 86400000)
                        }
                    }
                ]
            }
        })
        if(starting){
            await prisma.cASHBALANCE.update({
                where:{
                    id:starting.id
                },
                data:{
                   amount:startingbalance ? (startingbalance.amount + cashtoday) - expensesfortoday : 0,
                   updated_at:today
                }
            })
        }else{
            await prisma.cASHBALANCE.create({
                data:{
                   amount:startingbalance ? (startingbalance.amount + cashtoday) - expensesfortoday : 0,
                   created_at:today,
                   updated_at:today
                }
            })
    
        }
        
        return{
            startingbalance:startingbalance ? startingbalance.amount : 0,
            expensesfortoday,
            cashtoday,
            endofdaycash: startingbalance ? (startingbalance.amount + cashtoday) - expensesfortoday  : 0
        } 


    } catch (e: any) {
        return "failed to fetch"
    }
}
const page = async () => {
    const inventory = await getProducts() ?? []
    const sales = await getRecentSales() ?? []
    const salesSummary = await getSalesSummary()
    const lowstock = await getLowStockSummary()
    const totalInv = await getTotalInv()
    const expensesSummary = await getExpenseSummary()
    const cashathand = await getCashAtHand()
    // const data = await getsummary()
    // const data = await seedData()
    // console.log(data, "aggregated data")

    return (
        <div className='w-full  rounded-md h-full'>
            <div className='mx-2'>
                <Suspense fallback={<Loader className="flex items-center justify-center animate animate-spin" />}>
                    <PageView inventory={inventory} cashathand={cashathand} expenses={expensesSummary} lowstock={lowstock} totalInv={totalInv} salesSummary={salesSummary} recentsales={sales} />
                </Suspense>
            </div>

        </div>
    )
}

export default page
