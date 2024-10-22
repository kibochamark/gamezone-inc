import PageView from '@/components/sales/PageView'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prismaClient'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import React from 'react'


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





async function getSalesSummary() {
    let salesSummary: { revenue: number; profit: number } | null = null;

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to 00:00:00

        const creditsales =await prisma.sales.aggregate({
            where: {
                type:"CREDIT",
                or: [
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
        const debitsales =await prisma.sales.aggregate({
            where: {
                type:"DEBIT",
                or: [
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
                or: [
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

        const totalBuyingPrice = buyingprice.reduce((total, item) => {
            return total + (item.inventory?.buyingprice || 0);
        }, 0);

        const totalRevenue = revenue._sum?.priceSold || 0;
        const profit = totalRevenue - totalBuyingPrice;

        salesSummary = {
            revenue: totalRevenue,
            profit: profit,
            creditsales:creditsales._sum?.priceSold || 0,
            debitsales:debitsales._sum?.priceSold || 0
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
