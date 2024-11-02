"use server"

import { prisma } from "@/lib/prismaClient"
import { genRandonString } from "@/lib/generateAccountRef";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"






export const createExpense = async (expense: { name: string; amount: number; description: string; categoryId: string; paymentType:"CASH" | "Mpesa" }) => {
    const { isAuthenticated, getUser } = await getKindeServerSession();
    const auth = await isAuthenticated();
    const user = await getUser();

    if (auth && user) {
        try {
            // Create the new expense
            const newExpense = await prisma.expenses.create({
                data: {
                    amount: expense.amount,
                    expensename: expense.name,
                    description: expense.description,
                    categoryId: expense.categoryId,
                    kindeId: user?.id as string,
                    paymenttype:expense.paymentType,
                    kindeName: user?.given_name as string,
                },
                select: {
                    id: true,
                    amount: true,
                    category:{
                        select:{
                            name:true
                        }
                        
                    }
                },
            });

            // Update or create ExpenseSummary for the current day
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set time to 00:00:00

            // Check if there's already an entry for today
            const existingSummary = await prisma.expenseSummary.findFirst({
                where: {
                    periodType: 'DAY', // Assuming 'DAY' is used for daily summaries
                    created_at: {
                        gte: today,
                        lt: new Date(today.getTime() + 86400000), // End of today
                    },
                },
            });

            if (existingSummary) {
                // Update existing summary for today
                await prisma.expenseSummary.update({
                    where: { id: existingSummary.id },
                    data: {
                        totalExpenses: {
                            increment: newExpense.amount, // Increment the totalExpenses
                        },
                    },
                });
            } else {
                // Create a new summary for today
                await prisma.expenseSummary.create({
                    data: {
                        totalExpenses: newExpense.amount,
                        periodType: 'DAY', // Assuming you're categorizing by day
                        created_at: today,
                    },
                });
            }

            // accounts
            await prisma.assetAccount.create({
                data:{
                    accountRef:`AC${genRandonString()}`,
                    accounttype:"CASHACCOUNT",
                    creditTotal:expense.amount,
                    paymenttype:expense.paymentType
                }
            })

            await prisma.newExpenseAccount.create({
                data:{
                    accountRef:`EA${genRandonString()}`,
                    expensetype:newExpense.category.name,
                    debitTotal:expense.amount,
                    paymenttype:expense.paymentType
                }
            })

        } catch (e: any) {
            console.error(e.message);
            return new Error(e.message);
        }
    } else {
        return new Error('not authenticated');
    }
};

export const updateExpense = async (expense: { id: string; name: string; amount: number; description: string, categoryId: string; paymentType:"CASH" |"Mpesa" }) => {
    const { isAuthenticated, getUser } = await getKindeServerSession();
    const auth = await isAuthenticated();
    const user = await getUser();

    if (auth && user) {
        try {
            // Fetch the existing expense record
            const existingExpense = await prisma.expenses.findUnique({
                where: { id: expense.id },
                select: {
                    category:{
                        select:{
                            name:true
                        }
                    },
                    amount: true,
                    created_at: true, // Assuming there's a 'created_at' field for the expense creation date
                },
            });

            if (!existingExpense) {
                return new Error('Expense not found');
            }

            // Update the expense
            const updatedExpense = await prisma.expenses.update({
                where: {
                    id: expense.id,
                },
                data: {
                    amount: expense.amount,
                    expensename: expense.name,
                    description: expense.description,
                    categoryId: expense.categoryId,
                },
                select: {
                    id: true,
                    amount: true,
                },
            });

            // Update the ExpenseSummary based on the amount difference
            const summaryDate = new Date(existingExpense.created_at);
            summaryDate.setHours(0, 0, 0, 0); // Set to the start of the day

            const amountDifference = updatedExpense.amount - existingExpense.amount;

            const existingSummary = await prisma.expenseSummary.findFirst({
                where: {
                    periodType: 'DAY',
                    created_at: {
                        gte: summaryDate,
                        lt: new Date(summaryDate.getTime() + 86400000), // End of that day
                    },
                },
            });

            if (existingSummary) {
                await prisma.expenseSummary.update({
                    where: { id: existingSummary.id },
                    data: {
                        totalExpenses: {
                            increment: amountDifference, // Increment by the amount difference (can be negative if the amount decreased)
                        },
                    },
                });
            }

            if(((existingExpense.amount) - expense.amount) < 0){
                await prisma.assetAccount.create({
                    data:{
                        accountRef:`AC${genRandonString()}`,
                        accounttype:"CASHACCOUNT",
                        debitTotal:((existingExpense.amount) - expense.amount) ,
                        paymenttype:expense.paymentType
                    }
                })
    
                await prisma.newExpenseAccount.create({
                    data:{
                        accountRef:`EA${genRandonString()}`,
                        expensetype:existingExpense.category.name,
                        creditTotal:Math.abs(((existingExpense.amount) - expense.amount)) ,
                        paymenttype:expense.paymentType
                    }
                })
            }else{
                await prisma.assetAccount.create({
                    data:{
                        accountRef:`AC${genRandonString()}`,
                        accounttype:"CASHACCOUNT",
                        creditTotal:((existingExpense.amount) - expense.amount) ,
                        paymenttype:expense.paymentType
                    }
                })
    
                await prisma.newExpenseAccount.create({
                    data:{
                        accountRef:`EA${genRandonString()}`,
                        expensetype:existingExpense.category.name,
                        debitTotal:((existingExpense.amount) - expense.amount) ,
                        paymenttype:expense.paymentType
                    }
                })
            }
        } catch (e: any) {
            console.error(e.message);
            return new Error(e.message);
        }
    } else {
        return new Error('not authenticated');
    }
};



export const deleteExpense = async (id: string) => {
    const { isAuthenticated, getUser } = await getKindeServerSession();
    const auth = await isAuthenticated();
    const user = await getUser();

    if (auth && user) {
        try {
            // Fetch the expense before deleting
            const expenseToDelete = await prisma.expenses.findUnique({
                where: {
                    id,
                },
                select: {
                    category:{
                        select:{
                            name:true
                        }
                    },
                    amount: true,
                    paymenttype:true,
                    created_at: true, // Assuming there's a 'created_at' field for the expense creation date
                },
            });

            if (!expenseToDelete) {
                return new Error('Expense not found');
            }

            // Delete the expense
            await prisma.expenses.delete({
                where: {
                    id,
                },
            });

            // Update the ExpenseSummary for the date the expense was created
            const summaryDate = new Date(expenseToDelete.created_at);
            summaryDate.setHours(0, 0, 0, 0); // Set to the start of the day

            const existingSummary = await prisma.expenseSummary.findFirst({
                where: {
                    periodType: 'DAY',
                    created_at: {
                        gte: summaryDate,
                        lt: new Date(summaryDate.getTime() + 86400000), // End of that day
                    },
                },
            });

            if (existingSummary) {
                await prisma.expenseSummary.update({
                    where: { id: existingSummary.id },
                    data: {
                        totalExpenses: {
                            decrement: expenseToDelete.amount, // Decrement by the amount of the deleted expense
                        },
                    },
                });
            }

            // accounts
            await prisma.assetAccount.create({
                data:{
                    accountRef:`AC${genRandonString()}`,
                    accounttype:"CASHACCOUNT",
                    debitTotal:expenseToDelete.amount,
                    paymenttype:expenseToDelete.paymenttype
                }
            })

            await prisma.newExpenseAccount.create({
                data:{
                    accountRef:`EA${genRandonString()}`,
                    expensetype:expenseToDelete.category.name,
                    creditTotal:expenseToDelete.amount,
                    paymenttype:expenseToDelete.paymenttype
                }
            })
        } catch (e: any) {
            console.error(e.message);
            return new Error(e.message);
        }
    } else {
        return new Error('not authenticated');
    }
};
