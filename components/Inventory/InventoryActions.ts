"use server"

import { prisma } from "@/lib/prismaClient"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { revalidatePath } from "next/cache";

export type Inventory = { name: string; price: number, buyingprice: number; threshold: number; quantity: number; categoryId?: string }


export const createInventory = async (inventory: Inventory) => {
    const { isAuthenticated } = await getKindeServerSession()
    const auth = await isAuthenticated()


    if (auth) {

        try {
            const newinventory = await prisma.inventory.create({
                data: {
                    name: inventory.name,
                    categoryId: inventory.categoryId,
                    quantity: inventory.quantity,
                    price: inventory.price,
                    buyingprice: inventory.buyingprice,
                    threshold: inventory.threshold
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
export const updateInventory = async (inventory: { id: string; name: string; price: number, buyingprice: number; threshold: number; quantity: number; categoryId: string }) => {
    const { isAuthenticated } = await getKindeServerSession()
    const auth = await isAuthenticated()


    if (auth) {

        try {
            const newinventory = await prisma.inventory.update({
                where: {
                    id: inventory.id
                },
                data: {
                    name: inventory.name,
                    categoryId: inventory.categoryId,
                    quantity: inventory.quantity,
                    price: inventory.price,
                    buyingprice: inventory.buyingprice,
                    threshold: inventory.threshold
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
export const deleteInventory = async (id: string) => {
    const { isAuthenticated } = await getKindeServerSession()
    const auth = await isAuthenticated()


    if (auth) {

        try {
            const newinventory = await prisma.inventory.delete({
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


export const createSale = async (sale: { price: number, inventoryId: string; quantity: number }) => {
    const { isAuthenticated, getUser } = await getKindeServerSession()
    const auth = await isAuthenticated()
    const user = await getUser()




    if (auth && user) {

        try {
            const newinventory = await prisma.sales.create({
                data: {
                    inventoryId: sale.inventoryId,
                    quantitySold: sale.quantity,
                    kindeId: user?.id,
                    priceSold: sale.price
                },

                select: {
                    id: true
                }
            })

            if (newinventory.id) {

                await prisma.inventory.update({
                    where: {
                        id: sale.inventoryId
                    },
                    data: {
                        frequencySold: {
                            increment: 1
                        }
                    }
                })
            }





        } catch (e: any) {
            console.log(e.message)
            return new Error(e.message)
        }
    } else {
        return new Error("not authenticated")
    }

}




export const createBulkInventory = async (inventory: Inventory[]) => {
    const { isAuthenticated } = await getKindeServerSession()
    const auth = await isAuthenticated()


    if (auth) {

        try {
            for (const item of inventory) {
                await createInventory(item)
            }
            revalidatePath("/inventory")
        } catch (e: any) {
            console.log(e.message)
            return new Error(e.message)
        }
    } else {
        return new Error("not authenticated")
    }

}