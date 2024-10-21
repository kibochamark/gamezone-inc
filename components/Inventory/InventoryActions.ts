"use server"

import { prisma } from "@/lib/prismaClient"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { AwardIcon } from "lucide-react";
import { revalidatePath } from "next/cache";

export type Inventory = { name: string; price: number, buyingprice: number; threshold: number; quantity: number; categoryId?: string }


export const createInventory = async (inventory: Inventory) => {
    const { isAuthenticated } = await getKindeServerSession()
    const auth = await isAuthenticated()


    if (auth) {

        try {
            await prisma.$transaction(async (tx) => {
                const newinventory = await tx.inventory.create({
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

                if (inventory.quantity < inventory.threshold) {
                    await tx.lowStockSummary.create({
                        data: {
                            inventoryId: newinventory.id,
                            quantity: inventory.quantity
                        }
                    })
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
            await prisma.$transaction(async (tx) => {
                if (inventory.quantity > inventory.threshold) {
                    await tx.lowStockSummary.deleteMany({
                        where: {
                            inventoryId: inventory.id
                        }
                    })
                }
                await tx.inventory.update({
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
            await prisma.$transaction(async (tx) => {
                const newinventory = await prisma.inventory.delete({
                    where: {
                        id
                    },


                })
                await tx.lowStockSummary.deleteMany({
                    where: {
                        inventoryId: id
                    }
                })
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
            await prisma.$transaction(async (tx) => {
                if (sale.quantity > 0) {
                    const newinventory = await tx.sales.create({
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

                    const soldinventory = await tx.inventory.findUnique({
                        where: {
                            id: newinventory.id
                        }
                    })


                    await tx.inventory.update({
                        where: {
                            id: sale.inventoryId
                        },
                        data: {
                            frequencySold: {
                                increment: 1
                            },
                            quantity: ((soldinventory?.quantity as number) - sale.quantity)
                        }
                    })

                    const lowstock = await tx.lowStockSummary.findFirst({
                        where: {
                            inventoryId: soldinventory?.id
                        }
                    })

                    if ((((soldinventory?.quantity as number) - sale.quantity) < (soldinventory?.threshold as number)) && !lowstock) {


                        await tx.lowStockSummary.create({
                            data: {
                                inventoryId: soldinventory?.id as string,
                                quantity: ((soldinventory?.quantity as number) - sale.quantity)
                            }
                        })


                    }
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




export const createBulkInventory = async (inventory: {
    Name: string;
    BuyingPrice: number;
    SellingPrice: number;
    Quantity: number;
    Threshold: number;
    Category: string;
}[]) => {
    const { isAuthenticated } = await getKindeServerSession()
    const auth = await isAuthenticated()


    if (auth) {

        try {
            for (const item of inventory) {
                await prisma.$transaction(async (tx) => {
                    const category = await tx.category.findUnique({
                        where: {
                            name: item.Category
                        },
                        select: {
                            id: true
                        }
                    })

                    const newinventory = await tx.inventory.create({
                        data: {
                            name: item.Name,
                            categoryId: category?.id,
                            quantity: item.Quantity,
                            price: item.BuyingPrice,
                            buyingprice: item.SellingPrice,
                            threshold: item.Threshold
                        },
                        select: {
                            id: true
                        }
                    })
                    if (item.Quantity < item.Threshold) {
                        await prisma.lowStockSummary.create({
                            data: {
                                inventoryId: newinventory.id,
                                quantity: item.Quantity,
                            }
                        })
                    }
                })
                // await createInventory(item)
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