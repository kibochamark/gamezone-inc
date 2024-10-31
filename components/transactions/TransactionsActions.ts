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
                result = await prisma.salesAccount.aggregate({
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
            case 'expenseaccount':
                result = await prisma.expenseAccount.aggregate({
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
                result = await prisma.revenueAccount.aggregate({
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
                result = await prisma.inventoryAccount.aggregate({
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

            case 'serviceaccount':
                result = await prisma.serviceAccount.aggregate({
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

            case 'customeraccount':
                result = await prisma.customerAccount.aggregate({
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

            default:
                break

        }

        return result
        

    } catch (e) {
        console.error(e); // Log the error for debugging
    }

}