"use server"

import { genRandonString } from "@/lib/generateAccountRef";
import { prisma } from "@/lib/prismaClient"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { ProductStatus, SaleType } from "@prisma/client";
import { randomUUID } from "crypto";
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
                        id: true,
                        buyingprice: true
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

                // create transaction
                const createMainAccountTransaction = await tx.mainAccount.create({
                    data: {
                        accountRef: `MC${genRandonString()}`,
                        debitTotal: newinventory.buyingprice,
                        creditTotal: 0
                    }
                })
                const InventoryAccount = await tx.inventoryAccount.create({
                    data: {
                        productId: newinventory.id,
                        accountRef: `IC${genRandonString()}`,
                        creditTotal: newinventory.buyingprice
                    },
                });
                // Create a new transaction record
                const newTransaction = await tx.transactionAccount.create({
                    data: {
                        accountRef: `TC${genRandonString()}`,
                        debitAmount: 0,
                        creditAmount: newinventory.buyingprice,
                        description: "new stock",
                        creditAccountId: createMainAccountTransaction.id, // credit the Inventory Account
                        debitAccountId: InventoryAccount.id,     // debiting the Cash Account or source
                    },
                });


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
                    if (sale.saletype == "DEBIT") {
                        const newinventory = await tx.sales.create({
                            data: {
                                inventoryId: sale.inventoryId,
                                quantitySold: sale.quantity,
                                kindeId: user?.id,
                                priceSold: sale.price,
                                type: "DEBIT"
                            },

                            select: {
                                id: true
                            }
                        })
                    } else {
                        const newinventory = await tx.sales.create({
                            data: {
                                inventoryId: sale.inventoryId,
                                quantitySold: sale.quantity,
                                kindeId: user?.id,
                                priceSold: sale.price,
                                type: "CREDIT",
                                vendor: sale.vendor
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
                            // create transaction
            const createRevenueTransaction = await tx.revenueAccount.create({
                data: {
                    accountRef: `RC${genRandonString()}`,
                    creditTotal: sale.price,
                    debitTotal: 0
                }
            })
            const saleAccount = await tx.salesAccount.create({
                data: {
                    accountRef: `SC${genRandonString()}`,
                    creditTotal: sale.price,
                    debitTotal:0,
                    productId:sale.inventoryId
                },
            });
            // Create a new transaction record
            const newTransaction = await tx.transactionAccount.create({
                data: {
                    accountRef: `TC${genRandonString()}`,
                    debitAmount: 0,
                    creditAmount: sale.price,
                    description: "sale",
                    creditAccountId: saleAccount.id, // credit the Inventory Account
                    debitAccountId: createRevenueTransaction.id,     // debiting the Cash Account or source
                },
            });

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
    id: string;
    price: number,
    quantity: number;
    threshold: number;
    saletype: string;
    status?: string;
    vendor?: string;
}) => {
    const { isAuthenticated, getUser } = await getKindeServerSession()
    const auth = await isAuthenticated()
    const user = await getUser()




    if (auth && user) {

        try {
            await prisma.$transaction(async (tx) => {
                if (sale.quantity > 0) {
                    if (sale.status === "RETURNED") {
                        //update the product in the inventory
                        const getsale = await tx.sales.findUnique({
                            where: {
                                id: sale.id
                            },
                            select: {
                                inventoryId: true
                            }
                        })

                        await tx.inventory.update({
                            where: {
                                id: getsale?.inventoryId
                            },
                            data: {
                                quantity: {
                                    increment: sale.quantity
                                }
                            }
                        })

                        await tx.sales.delete({
                            where: {
                                id: sale.id
                            }
                        })
                    } else {
                        if (sale.saletype == "DEBIT") {
                            const newinventory = await tx.sales.update({
                                where: {
                                    id: sale.id
                                },
                                data: {
                                    quantitySold: sale.quantity,
                                    priceSold: sale.price,
                                    status: sale.status as ProductStatus,
                                    type: sale.saletype
                                },

                                select: {
                                    id: true
                                }
                            })
                        } else {
                            const newinventory = await tx.sales.update({
                                where: {
                                    id: sale.id
                                },
                                data: {
                                    quantitySold: sale.quantity,
                                    priceSold: sale.price,
                                    vendor: sale.vendor,
                                    type: sale.saletype as SaleType,
                                    status: sale.status as ProductStatus
                                },
                                select: {
                                    id: true
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



export async function seedData() {
    try {
        const inventory = await prisma.sales.findMany({
            where:{
                type:"CREDIT",
                OR:[
                    {
                        status:"CREDITED",
                        
                    }
                ]
            }
            // _sum:{
            //     creditTotal:true,
            //     debitTotal:true

            // }
        })
        // const inventoryAcc = await prisma.inventoryAccount.create({
        //     // _sum:{
        //     //     creditTotal:true,
        //     //     debitTotal:true

        //     // }
        //     data:{
        //         productId:"671fcb9f44c071f728787978"
        //     }
        // })
        
        // await prisma.transactionAccount.deleteMany({
        //     where:{
        //         debitAccountId:{
        //             not:''
        //         }
        //     }
        // })

        
        // const inventoryAcc = await prisma.inventoryAccount.findMany()
        // console.log(inventory)



        for (let i = 0; i < inventory.length; i++) {



            await prisma.$transaction(async (tx) => {

                // // // create transaction
                // const createMainAccountTransaction = await tx.mainAccount.create({
                //     data: {
                //         accountRef: `MC${genRandonString()}`,
                //         debitTotal: inventory[i].creditTotal,
                //         creditTotal: 0,
                //         created_at:new Date(inventory[i]?.created_at),
                //         updated_at:new Date(inventory[i].updated_at)
                //     }
                // })

                // // console.log(createMainAccountTransaction, "trab")
                const saleAccount = await tx.customerAccount.create({
                    data: {
                        accountRef: `CA${genRandonString()}`,
                        accountName:inventory[i].vendor as string,
                        customerContact:'',
                        debitTotal: 0,
                        creditTotal:inventory[i].priceSold,
                        created_at:new Date(inventory[i].created_at),
                        updated_at:new Date(inventory[i].updated_at)
                    },
                });
                // // // console.log(createMainAccountTransaction, "trab")
                // const revAccount = await tx.revenueAccount.create({
                //     data: {
                //         accountRef: `RC${genRandonString()}`,
                //         debitTotal: 0,
                //         creditTotal:20,
                //         created_at:new Date('2024-10-31T06:42:46.101+00:00'),
                //         updated_at:new Date('2024-10-31T06:42:46.101+00:00')
                //     },
                // });
                // // Create a new transaction record
                // const newTransaction = await tx.transactionAccount.create({
                //     data: {
                //         accountRef: `TC${genRandonString()}`,
                //         debitAmount: 20,
                //         creditAmount: 0,
                //         description: "sale acc setup",
                //         creditAccountId: revAccount.id,
                //         debitAccountId: '',
                //         created_at:new Date('2024-10-31T06:42:46.101+00:00'),
                //         updated_at:new Date('2024-10-31T06:42:46.101+00:00')
                //         // credit the Inventory Account
                //         // debitAccountId: InventoryAccount.id,     // debiting the Cash Account or source
                //     },
                // });
            });

        }

        

    } catch (e: any) {
        console.log(e.message)
    }

}