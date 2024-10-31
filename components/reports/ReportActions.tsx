"use server"
import { prisma } from "@/lib/prismaClient";
import { Reports } from "./Reports";

export async function getReportData(reportType: Reports, fromdate: Date = new Date(), todate: Date = new Date()) {

    // console.log(fromdate, todate, 'date range', reportType)
    let result: any = [];
    try {
        switch (reportType) {
            case "lowstock":
                const inventory = await prisma.inventory.findMany({
                    where: {

                        OR: [
                            {
                                created_at: {
                                    gte: fromdate,
                                    lt: todate
                                }
                            },
                            {
                                updated_at: {
                                    gte: fromdate,
                                    lt: todate  
                                }
                            }
                        ]

                    },
                    select: {
                        buyingprice: true,
                        category: {
                            select: {
                                name: true
                            }
                        },
                        created_at: true,
                        name: true,
                        price: true,
                        quantity: true,
                        threshold: true
                    }
                })

                // console.log(inventory)

                result = inventory.filter((inv) => inv.quantity < inv.threshold)



                break
            case 'creditsales':
                const customers = await prisma.customerAccount.groupBy({
                    by:['accountName'],
                    where: {

                        OR: [
                            {
                                created_at: {
                                    gte: fromdate,
                                    lt: todate
                                }
                            },
                            {
                                updated_at: {
                                    gte: fromdate,
                                    lt: todate  
                                }
                            }
                        ]

                    },
                    _sum:{
                        debitTotal:true,
                        creditTotal:true
                    }
                })

                result = customers.filter((c)=>{
                    return {
                        accountname:c.accountName,
                        balance :(c._sum.creditTotal as number) - (c._sum.debitTotal as number)
                    }
                })


                return result
            default:
                result = []
                break

        }

        // console.log(result);


        return result
    } catch (e) {
        console.error(e); // Log the error for debugging
    }

}