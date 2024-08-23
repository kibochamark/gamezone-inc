"use server"

import { prisma } from "@/lib/prismaClient"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

export const deleteSale = async (id: string) => {
    const { isAuthenticated } =await getKindeServerSession()
    const auth = await isAuthenticated()


    if (auth) {

        try {
            const newinventory = await prisma.sales.delete({
                where: {
                    id
                },

            })




        } catch (e: any) {
            console.log(e.message)
            return new Error(e.message)
        }
    } else {
        return new Error("not authenticated")
    }

}