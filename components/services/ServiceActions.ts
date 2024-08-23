"use server"

import { prisma } from "@/lib/prismaClient"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"




export const createService = async (service: { name: string; price: number }) => {
    const { isAuthenticated, getUser } = await getKindeServerSession()
    const auth = await isAuthenticated()
    const user = await getUser()


    if (auth && user) {

        try {
            const newinventory = await prisma.services.create({
                data: {
                    name: service.name,
                    price: service.price,
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
export const updateService = async (service: { id: string; name: string; price: number }) => {
    const { isAuthenticated, getUser } = await getKindeServerSession()
    const auth = await isAuthenticated()
    const user = await getUser()


    if (auth && user) {

        try {
            const newinventory = await prisma.services.update({
                where: {
                    id: service.id
                },
                data: {
                    name: service.name,
                    price: service.price,

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
export const deleteService = async (id: string) => {
    const { isAuthenticated, getUser } = await getKindeServerSession()
    const auth = await isAuthenticated()
    const user = await getUser()


    if (auth && user) {

        try {
            const newinventory = await prisma.services.delete({
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