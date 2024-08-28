"use server"

import { prisma } from "@/lib/prismaClient"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"




export const createExpense = async (expense: { name:string; amount: number; description: string, categoryId:string }) => {
    const { isAuthenticated, getUser } = await getKindeServerSession()
    const auth = await isAuthenticated()
    const user = await getUser()


    if (auth && user) {

        try {
            const newexpense = await prisma.expenses.create({
                data: {
                    amount:expense.amount,
                    expensename:expense.name,
                    description:expense.description,
                    categoryId:expense.categoryId,
                    kindeId: user?.id as string,
                    kindeName: user?.given_name as string
                },
                select: {
                    id: true
                }
            })

        } catch (e: any) {
            console.log(e.message)
            return new Error(e.message)
        }
    } else {
        return new Error("not authenticated")
    }

}
export const updateExpense = async (expense: { id:string;name:string; amount: number; description: string, categoryId:string }) => {
    const { isAuthenticated, getUser } = await getKindeServerSession()
    const auth = await isAuthenticated()
    const user = await getUser()


    if (auth && user) {

        try {
            const newexpense = await prisma.expenses.update({
                where:{
                    id:expense.id
                },
                data: {
                    amount:expense.amount,
                    expensename:expense.name,
                    description:expense.description,
                    categoryId:expense.categoryId,
                    // kindeId: user?.id as string,
                    // kindeName: user?.given_name as string
                },
                select: {
                    id: true
                }
            })

        } catch (e: any) {
            console.log(e.message)
            return new Error(e.message)
        }
    } else {
        return new Error("not authenticated")
    }

}


// export const updateService = async (service: { id: string; name: string; price: number }) => {
//     const { isAuthenticated, getUser } = await getKindeServerSession()
//     const auth = await isAuthenticated()
//     const user = await getUser()


//     if (auth && user) {

//         try {
//             const newinventory = await prisma.services.update({
//                 where: {
//                     id: service.id
//                 },
//                 data: {
//                     name: service.name,
//                     price: service.price,

//                 },
//                 select: {
//                     id: true
//                 }
//             })

//         } catch (e: any) {
//             console.log(e.message)
//             return new Error(e.message)
//         }
//     } else {
//         return new Error("not authenticated")
//     }

// }
export const deleteExpense = async (id: string) => {
    const { isAuthenticated, getUser } = await getKindeServerSession()
    const auth = await isAuthenticated()
    const user = await getUser()


    if (auth && user) {

        try {
            const deletedexpense = await prisma.expenses.delete({
                where: {
                    id
                }
            })

        } catch (e: any) {
            console.log(e.message)
            return new Error(e.message)
        }
    } else {
        return new Error("not authenticated")
    }

}