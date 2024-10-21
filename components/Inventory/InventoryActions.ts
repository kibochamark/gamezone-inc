"use server"

import { prisma } from "@/lib/prismaClient"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { ProductStatus, SaleType } from "@prisma/client";
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


export const createSale = async (sale: {
    price: number, inventoryId: string; quantity: number; threshold: number;

    saletype: string;
    vendor?: string;
}) => {
    const { isAuthenticated, getUser } = await getKindeServerSession()
    const auth = await isAuthenticated()
    const user = await getUser()




    if (auth && user) {

        try {
            await prisma.$transaction(async (tx) => {
                if (sale.quantity > 0) {
                    if(sale.saletype =="DEBIT"){
                        const newinventory = await tx.sales.create({
                            data: {
                                inventoryId: sale.inventoryId,
                                quantitySold: sale.quantity,
                                kindeId: user?.id,
                                priceSold: sale.price,
                                type:"DEBIT"
                            },
    
                            select: {
                                id: true
                            }
                        })
                    }else{
                        const newinventory = await tx.sales.create({
                            data: {
                                inventoryId: sale.inventoryId,
                                quantitySold: sale.quantity,
                                kindeId: user?.id,
                                priceSold: sale.price,
                                type:"CREDIT",
                                vendor:sale.vendor
                            },
    
                            select: {
                                id: true
                            }
                        })
                    }
                    



                    await tx.inventory.update({
                        where: {
                            id: sale.inventoryId
                        },
                        data: {
                            frequencySold: {
                                increment: 1
                            },
                            quantity: {
                                decrement: sale.quantity
                            }
                        }
                    })


                    if (sale.quantity < sale.threshold) {
                        let lowstock = await tx.lowStockSummary.findUnique({
                            where: {
                                id: sale.inventoryId
                            }
                        })

                        if (!lowstock) {
                            await tx.lowStockSummary.create({
                                data: {
                                    inventoryId: sale.inventoryId,
                                    quantity: sale.quantity
                                }
                            })
                        }

                    }



                }
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


export const updateSale = async (sale: {
    id:string;
    price: number, 
    quantity: number;
    threshold: number;
    saletype: string;
    status?:string;
    vendor?: string;
}) => {
    const { isAuthenticated, getUser } = await getKindeServerSession()
    const auth = await isAuthenticated()
    const user = await getUser()




    if (auth && user) {

        try {
            await prisma.$transaction(async (tx) => {
                if (sale.quantity > 0) {
                    if(sale.saletype =="DEBIT"){
                        const newinventory = await tx.sales.update({
                            where:{
                                id:sale.id
                            },
                            data: {
                                quantitySold: sale.quantity,
                                priceSold: sale.price,
                                status:sale.status as ProductStatus,
                                type:sale.saletype
                            },
    
                            select: {
                                id: true
                            }
                        })
                    }else{
                        const newinventory = await tx.sales.update({
                            where:{
                                id:sale.id
                            },
                            data: {
                                quantitySold: sale.quantity,
                                priceSold: sale.price,
                                vendor:sale.vendor,
                                type:sale.saletype as SaleType,
                                status:sale.status as ProductStatus
                            },
                            select: {
                                id: true
                            }
                        })
                    }
                }
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




export const createBulkInventory = async (inventory: {
    Name: string;
    BuyingPrice: number;
    SellingPrice: number;
    Quantity: number;
    Threshold: number;
    Category: string;
}[]) => {
    const { isAuthenticated } = await getKindeServerSession();
    const auth = await isAuthenticated();

    if (auth) {
        try {
            // Set batch size
            const batchSize = 10; // Adjust based on your environment
            for (let i = 0; i < inventory.length; i += batchSize) {
                const batch = inventory.slice(i, i + batchSize);

                // Use Promise.all to handle the batch concurrently
                await Promise.all(batch.map(async (item) => {
                    await prisma.$transaction(async (tx) => {
                        const category = await tx.category.findUnique({
                            where: {
                                name: item.Category
                            },
                            select: {
                                id: true
                            }
                        });

                        const newInventory = await tx.inventory.create({
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
                        });

                        if (item.Quantity < item.Threshold) {
                            await tx.lowStockSummary.create({
                                data: {
                                    inventoryId: newInventory.id,
                                    quantity: item.Quantity,
                                }
                            });
                        }
                    });
                }));
            }

            // Revalidate after all batches are done
            revalidatePath("/inventory");
        } catch (e: any) {
            console.log(e.message);
            return new Error(e.message);
        }
    } else {
        return new Error("Not authenticated");
    }
};
