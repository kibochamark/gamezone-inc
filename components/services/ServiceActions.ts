"use server"

import { prisma } from "@/lib/prismaClient"
import { genRandonString } from "@/lib/generateAccountRef";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"




export const createService = async (service: { name: string; price: number }) => {
    const { isAuthenticated, getUser } = await getKindeServerSession();
    const auth = await isAuthenticated();
    const user = await getUser();

    if (auth && user) {
        try {
            // Create the new service
            const newService = await prisma.services.create({
                data: {
                    name: service.name,
                    price: service.price,
                    kindeId: user?.id as string,
                    kindeName: user?.given_name as string,
                },
                select: {
                    id: true,
                    price: true,
                },
            });

            // Update or create ServiceSummary for the current day
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set time to 00:00:00

            // Check if there's already an entry for today
            const existingSummary = await prisma.serviceSummary.findFirst({
                where: {
                    periodType: 'DAY', // Assuming 'DAY' is used for daily summaries
                    date: {
                        gte: today,
                        lt: new Date(today.getTime() + 86400000), // End of today
                    },
                },
            });

            if (existingSummary) {
                // Update existing summary for today
                await prisma.serviceSummary.update({
                    where: { id: existingSummary.id },
                    data: {
                        totalServices: {
                            increment: newService.price, // Increment the totalServices
                        },
                    },
                });
            } else {
                // Create a new summary for today
                await prisma.serviceSummary.create({
                    data: {
                        totalServices: newService.price,
                        periodType: 'DAY', // Assuming you're categorizing by day
                        date: today,
                    },
                });
            }
              // create transaction
            const createRevenueTransaction = await prisma.revenueAccount.create({
                data: {
                    accountRef: `RC${genRandonString()}`,
                    creditTotal: newService.price,
                    debitTotal: 0
                }
            })
            const serviceAccount = await prisma.serviceAccount.create({
                data: {
                    accountRef: `EC${genRandonString()}`,
                    debitTotal: 0,
                    creditTotal:service.price,
                    serviceId:newService.id
                },
            });
            // Create a new transaction record
            const newTransaction = await prisma.transactionAccount.create({
                data: {
                    accountRef: `TC${genRandonString()}`,
                    debitAmount: 0,
                    creditAmount: service.price,
                    description: "service",
                    creditAccountId: newService.id, // credit the Inventory Account
                    debitAccountId: '',     // debiting the Cash Account or source
                },
            });


        } catch (e: any) {
            console.error(e.message);
            return new Error(e.message);
        }
    } else {
        return new Error('not authenticated');
    }
};


export const updateService = async (service: { id: string; name: string; price: number }) => {
    const { isAuthenticated, getUser } = await getKindeServerSession();
    const auth = await isAuthenticated();
    const user = await getUser();

    if (auth && user) {
        try {
            // Fetch the current service record
            const existingService = await prisma.services.findUnique({
                where: { id: service.id },
                select: {
                    price: true,
                    created_at: true, // Assuming there's a 'created_at' field for the service creation date
                },
            });

            if (!existingService) {
                return new Error('Service not found');
            }

            // Update the service
            const updatedService = await prisma.services.update({
                where: {
                    id: service.id,
                },
                data: {
                    name: service.name,
                    price: service.price,
                },
                select: {
                    id: true,
                    price: true,
                },
            });

            // Update the ServiceSummary based on the price difference
            const summaryDate = new Date(existingService.created_at);
            summaryDate.setHours(0, 0, 0, 0); // Set to the start of the day

            const priceDifference = updatedService.price - existingService.price;

            const existingSummary = await prisma.serviceSummary.findFirst({
                where: {
                    periodType: 'DAY',
                    date: {
                        gte: summaryDate,
                        lt: new Date(summaryDate.getTime() + 86400000), // End of that day
                    },
                },
            });

            if (existingSummary) {
                await prisma.serviceSummary.update({
                    where: { id: existingSummary.id },
                    data: {
                        totalServices: {
                            increment: priceDifference, // Increment by the price difference (can be negative if the price decreased)
                        },
                    },
                });
            }
        } catch (e: any) {
            console.error(e.message);
            return new Error(e.message);
        }
    } else {
        return new Error('not authenticated');
    }
};

export const deleteService = async (id: string) => {
    const { isAuthenticated, getUser } = await getKindeServerSession();
    const auth = await isAuthenticated();
    const user = await getUser();

    if (auth && user) {
        try {
            // Fetch the service before deleting
            const serviceToDelete = await prisma.services.findUnique({
                where: {
                    id,
                },
                select: {
                    price: true,
                    created_at: true, // Assuming there's a 'created_at' field for the service creation date
                },
            });

            if (!serviceToDelete) {
                return new Error('Service not found');
            }

            // Delete the service
            await prisma.services.delete({
                where: {
                    id,
                },
            });

            // Update the ServiceSummary for the date the service was created
            const summaryDate = new Date(serviceToDelete.created_at);
            summaryDate.setHours(0, 0, 0, 0); // Set to the start of the day

            const existingSummary = await prisma.serviceSummary.findFirst({
                where: {
                    periodType: 'DAY',
                    date: {
                        gte: summaryDate,
                        lt: new Date(summaryDate.getTime() + 86400000), // End of that day
                    },
                },
            });

            if (existingSummary) {
                await prisma.serviceSummary.update({
                    where: { id: existingSummary.id },
                    data: {
                        totalServices: {
                            decrement: serviceToDelete.price, // Decrement by the price of the deleted service
                        },
                    },
                });
            }
        } catch (e: any) {
            console.error(e.message);
            return new Error(e.message);
        }
    } else {
        return new Error('not authenticated');
    }
};
