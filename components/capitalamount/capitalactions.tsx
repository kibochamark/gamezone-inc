"use server"

import { genRandonString } from "@/lib/generateAccountRef";
import { prisma } from "@/lib/prismaClient"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

import { revalidatePath } from "next/cache";


export const createorupdatecapital = async (amount:number) => {
    const { isAuthenticated } = await getKindeServerSession()
    const auth = await isAuthenticated()
    console.log(amount)


    if (auth) {

        try {
            await prisma.$transaction(async (tx) => {

                const capital = await tx.equityAccount.create({
                    data:{
                        accountRef:`EA${genRandonString()}`,
                        accounttype:"CAPITALACCOUNT",
                        debitTotal:amount,
                        creditTotal:0,
                        paymenttype:"CASH"
                    }
                })       

            },
                {
                    maxWait: 5000, // 5 seconds max wait to connect to prisma
                    timeout: 20000, // 20 seconds
                }
            )

        } catch (e: any) {
            console.log(e.message)
            return new Error(e.message)
        }
    } else {
        return new Error("not authenticated")
    }

}



export const aggregatecapital = async () => {
    const { isAuthenticated } = await getKindeServerSession()
    const auth = await isAuthenticated()


    if (auth) {

        try {
            const equityaccount =await prisma.equityAccount.aggregate({
                where:{
                    accounttype:"CAPITALACCOUNT"
                },
                _sum:{
                    debitTotal:true,
                    creditTotal:true
                }
            })

            let balance = (equityaccount._sum.debitTotal as number) - (equityaccount._sum.creditTotal as number)

            return balance

        } catch (e: any) {
            // console.log(e.message)
            return new Error(e.message)
        }
    } else {
        return new Error("not authenticated")
    }

}







