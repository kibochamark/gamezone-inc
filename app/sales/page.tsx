import PageView from '@/components/sales/PageView'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prismaClient'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import React from 'react'


export const dynamic = 'force-dynamic'


async function getSales() {
    let sales: any = []
    try {
        sales = await prisma.sales.findMany({
            select: {
                id: true,
                inventory: {
                    select: {
                        name: true,
                        threshold: true,
                        id: true
                    }
                },
                quantitySold: true,
                priceSold: true,
                status: true,
                type: true,
                vendor: true,
                created_at: true
            }
        })

    } catch (e) {

    }

    return sales
}



export async function getSalesSummary() {
    let salesSummary: { revenue: number; profit: number; creditsales: number; debitsales: number, creditcount: number; debitcount: number } = {
        revenue: 0,
        profit: 0,
        creditsales: 0,
        debitsales: 0,
        creditcount: 0,
        debitcount: 0
    };

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to 00:00:00

        const creditsales = await prisma.sales.aggregate({
            where: {
                type: "CREDIT",
                OR: [
                    {
                        created_at: {
                            gte: today,
                            lt: new Date(today.getTime() + 86400000) // Add 1 day to get end of today
                        }
                    },
                    {
                        updated_at: {
                            gte: today,
                            lt: new Date(today.getTime() + 86400000) // Add 1 day to get end of today 
                        }
                    }
                ]

            },
            _sum: {
                priceSold: true,
            },
        });
        const debitsales = await prisma.sales.aggregate({
            where: {
                type: "DEBIT",
                OR: [
                    {
                        created_at: {
                            gte: today,
                            lt: new Date(today.getTime() + 86400000) // Add 1 day to get end of today
                        }
                    },
                    {
                        updated_at: {
                            gte: today,
                            lt: new Date(today.getTime() + 86400000) // Add 1 day to get end of today 
                        }
                    }
                ]

            },
            _sum: {
                priceSold: true,
            },
        });

        const revenue = await prisma.sales.aggregate({
            where: {
                OR: [
                    {
                        created_at: {
                            gte: today,
                            lt: new Date(today.getTime() + 86400000) // Add 1 day to get end of today
                        }
                    },
                    {
                        updated_at: {
                            gte: today,
                            lt: new Date(today.getTime() + 86400000) // Add 1 day to get end of today 
                        }
                    }
                ]

            },
            _sum: {
                priceSold: true,
            },
        });

        const buyingprice = await prisma.sales.findMany({
            where: {
                created_at: {
                    gte: today,
                    lt: new Date(today.getTime() + 86400000) // Add 1 day to get end of today
                }
            },
            select: {
                inventory: {
                    select: {
                        buyingprice: true,
                    },
                },
            },
        });
        const creditcount = await prisma.sales.aggregate({
            where: {
                OR: [
                    {
                        created_at: {
                            gte: today,
                            lt: new Date(today.getTime() + 86400000) // Add 1 day to get end of today
                        }
                    },
                    {
                        updated_at: {
                            gte: today,
                            lt: new Date(today.getTime() + 86400000) // Add 1 day to get end of today 
                        }
                    }
                ],
                type:"CREDIT"
            },
            _count:{
                id:true
            }
        });

        const debitcount = await prisma.sales.aggregate({

            where: {
                OR: [
                    {
                        created_at: {
                            gte: today,
                            lt: new Date(today.getTime() + 86400000) // Add 1 day to get end of today
                        }
                    },
                    {
                        updated_at: {
                            gte: today,
                            lt: new Date(today.getTime() + 86400000) // Add 1 day to get end of today 
                        }
                    }
                ],
                type:"CREDIT"
            },
            _count:{
                id:true
            }
        });

        // console.log(creditcount, debitcount, "sjdfgsjfhjks")

        const totalBuyingPrice = buyingprice.reduce((total, item) => {
            return total + (item.inventory?.buyingprice || 0);
        }, 0);

        const totalRevenue = revenue._sum?.priceSold || 0;
        const profit = totalRevenue - totalBuyingPrice;

        salesSummary = {
            revenue: totalRevenue,
            profit: profit,
            creditsales: creditsales._sum?.priceSold || 0,
            debitsales: debitsales._sum?.priceSold || 0,
            creditcount:creditcount._count?.id || 0,
            debitcount:debitcount._count?.id || 0
        };

    } catch (e) {
        console.error(e); // Log the error for debugging
    }

    return salesSummary;
}


const page = async () => {
    const { isAuthenticated, getPermissions } = await getKindeServerSession()
    const sales = await getSales()
    const salesSummary = await getSalesSummary()

    const permissions = await getPermissions()

    return (
        <div className='w-full  rounded-md h-full'>
            <div className='mx-2'>
                <PageView sales={sales} salesSummary={salesSummary} permissions={permissions?.permissions} />
            </div>

        </div>
    )
}

export default page
