"use server"

import { prisma } from "@/lib/prismaClient";


export async function getAccountData(account:string, dataRange:{
    start:Date;
    end:Date
}) {
    let result

    try {
        switch(account){
            case 'salesaccount':
                result = await prisma.newRevenueAccount.aggregate({
                    where: {
                        accounttype:"SALESACCOUNT",
                        OR: [
                            {
                                created_at: {
                                    gte: dataRange.start,
                                    lt: new Date(dataRange.end.getTime() + 86400000) // Add 1 day to get end of today
                                }
                            },
                            {
                                updated_at: {
                                    gte: dataRange.start,
                                    lt: new Date(dataRange.end.getTime() + 86400000) // Add 1 day to get end of today 
                                }
                            }
                        ]
        
                    },
                    _sum: {
                        debitTotal: true,
                        creditTotal:true
                    },
                });
            case 'expenseaccount':
                result = await prisma.newExpenseAccount.aggregate({
                    where: {
                        OR: [
                            {
                                created_at: {
                                    gte: dataRange.start,
                                    lt: new Date(dataRange.end.getTime() + 86400000) // Add 1 day to get end of today
                                }
                            },
                            {
                                updated_at: {
                                    gte: dataRange.start,
                                    lt: new Date(dataRange.end.getTime() + 86400000) // Add 1 day to get end of today 
                                }
                            }
                        ]
        
                    },
                    _sum: {
                        debitTotal: true,
                        creditTotal:true
                    },
                });

            case 'revenueaccount':
                result = await prisma.newRevenueAccount.aggregate({
                    where: {
                        OR: [
                            {
                                created_at: {
                                    gte: dataRange.start,
                                    lt: new Date(dataRange.end.getTime() + 86400000) // Add 1 day to get end of today
                                }
                            },
                            {
                                updated_at: {
                                    gte: dataRange.start,
                                    lt: new Date(dataRange.end.getTime() + 86400000) // Add 1 day to get end of today 
                                }
                            }
                        ]
        
                    },
                    _sum: {
                        debitTotal: true,
                        creditTotal:true
                    },
                });

            case 'inventoryaccount':
                result = await prisma.assetAccount.aggregate({
                    where: {
                        accounttype:"INVENTORYACCOUNT",
                        OR: [
                            {
                                created_at: {
                                    gte: dataRange.start,
                                    lt: new Date(dataRange.end.getTime() + 86400000) // Add 1 day to get end of today
                                }
                            },
                            {
                                updated_at: {
                                    gte: dataRange.start,
                                    lt: new Date(dataRange.end.getTime() + 86400000) // Add 1 day to get end of today 
                                }
                            }
                        ]
        
                    },
                    _sum: {
                        debitTotal: true,
                        creditTotal:true
                    },
                });

            case 'serviceaccount':
                result = await prisma.newRevenueAccount.aggregate({
                    where: {
                        accounttype:"SERVICEACCOUNT",
                        OR: [
                            {
                                created_at: {
                                    gte: dataRange.start,
                                    lt: new Date(dataRange.end.getTime() + 86400000) // Add 1 day to get end of today
                                }
                            },
                            {
                                updated_at: {
                                    gte: dataRange.start,
                                    lt: new Date(dataRange.end.getTime() + 86400000) // Add 1 day to get end of today 
                                }
                            }
                        ]
        
                    },
                    _sum: {
                        debitTotal: true,
                        creditTotal:true
                    },
                });

            case 'customeraccount':
                result = await prisma.assetAccount.aggregate({
                    where: {
                        accounttype:"ACCOUNTRECEIVABLE",
                        OR: [
                            {
                                created_at: {
                                    gte: dataRange.start,
                                    lt: new Date(dataRange.end.getTime() + 86400000) // Add 1 day to get end of today
                                }
                            },
                            {
                                updated_at: {
                                    gte: dataRange.start,
                                    lt: new Date(dataRange.end.getTime() + 86400000) // Add 1 day to get end of today 
                                }
                            }
                        ]
        
                    },
                    _sum: {
                        debitTotal: true,
                        creditTotal:true
                    },
                });

            default:
                break

        }

        return result
        

    } catch (e) {
        console.error(e); // Log the error for debugging
    }

}