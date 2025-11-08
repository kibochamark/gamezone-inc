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

                const capital = await tx.equityAccount.aggregate({
                    where: {
                        accounttype: "CAPITALACCOUNT"
                    },
                    _sum: {
                        debitTotal: true,
                        creditTotal: true
                    }
                })

                await tx.equityAccount.create({
                    data: {
                        accountRef: `EA${genRandonString()}`,
                        accounttype: "CAPITALACCOUNT",
                        debitTotal: inventory.price,
                        creditTotal: 0,
                        paymenttype: "CASH"
                    }
                })
                await tx.equityAccount.create({
                    data: {
                        accountRef: `EA${genRandonString()}`,
                        accounttype: "CAPITALACCOUNT",
                        creditTotal: inventory.price,
                        debitTotal: 0,
                        paymenttype: "CASH"
                    }
                })

                await tx.assetAccount.create({
                    data: {
                        accountRef: `AC${genRandonString()}`,
                        accounttype: "CASHACCOUNT",
                        debitTotal: inventory.price,
                        paymenttype: "CASH"
                    }
                })

                await tx.assetAccount.create({
                    data: {
                        accountRef: `AC${genRandonString()}`,
                        accounttype: "CASHACCOUNT",
                        creditTotal: inventory.price,
                        paymenttype: "CASH"
                    }
                })


                await tx.assetAccount.create({
                    data: {
                        accountRef: `AC${genRandonString()}`,
                        accounttype: "INVENTORYACCOUNT",
                        debitTotal: inventory.price,
                        paymenttype: "CASH"
                    }
                })


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

                const asset = await tx.assetAccount.findFirst({
                    where: {
                        accounttype: "INVENTORYACCOUNT",
                        productId: inventory.id,
                        creditTotal: {
                            in: [0]
                        },

                    }
                })


                if (asset) {
                    await tx.assetAccount.update({
                        where: {
                            accountRef: asset?.accountRef
                        },
                        data: {
                            debitTotal: inventory.buyingprice
                        }
                    })
                }


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
export const deleteInventory = async (id: string) => {
    const { isAuthenticated } = await getKindeServerSession()
    const auth = await isAuthenticated()


    if (auth) {

        try {
            await prisma.$transaction(async (tx) => {
                const inventory = await tx.inventory.findUnique({
                    where: {
                        id
                    }
                })
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

                // move asset to write off
                await tx.assetAccount.create({
                    data: {
                        accountRef: `AC${genRandonString()}`,
                        creditTotal: inventory?.buyingprice,
                        paymenttype: "CASH",
                        debitTotal: 0,
                        accounttype: "INVENTORYACCOUNT"
                    }
                })

                await tx.writeOffAccount.create({
                    data: {
                        accountRef: `WA${genRandonString()}`,
                        accounttype: "DISPOSABLEACCOUNT",
                        debitTotal: inventory?.buyingprice,
                        paymenttype: "CASH"
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


export const createSale = async (sale: {
    price: number, inventoryId: string; quantity: number; threshold: number;

    saletype: string;
    vendor?: string;
    contact?: string;
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
                                status: "SOLD",
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
                                status: "CREDITED",
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

                if (sale.saletype === "CREDIT") {

                    await tx.newRevenueAccount.create({
                        data: {
                            accountRef: `RA${genRandonString()}`,
                            paymenttype: "CASH",
                            productId: sale.inventoryId,
                            creditTotal: sale.price,
                            accounttype: "SALESACCOUNT"
                        }
                    })
                    await tx.assetAccount.create({
                        data: {
                            accountRef: `AR${genRandonString()}`,
                            debitTotal: sale.price,
                            productId: sale.inventoryId,
                            paymenttype: "CASH",
                            customername: sale.vendor,
                            customercontact: sale.contact,
                            accounttype: "ACCOUNTRECEIVABLE"
                        }
                    })

                    const inv = await tx.inventory.findUnique({
                        where: {
                            id: sale.inventoryId
                        }
                    })
                    await tx.assetAccount.create({
                        data: {
                            accountRef: `AR${genRandonString()}`,
                            creditTotal: (inv?.buyingprice as number) * sale.quantity,
                            paymenttype: "CASH",
                            productId: sale.inventoryId,
                            accounttype: "INVENTORYACCOUNT"
                        }
                    })
                    await tx.newExpenseAccount.create({
                        data: {
                            accountRef: `EA${genRandonString()}`,
                            expensetype: "cost of goods on credit",
                            debitTotal: (inv?.buyingprice as number) * sale.quantity,
                            paymenttype: "CASH"

                        }
                    })
                } else {
                    await tx.newRevenueAccount.create({
                        data: {
                            accountRef: `RA${genRandonString()}`,
                            paymenttype: "CASH",
                            debitTotal: sale.price,
                            productId: sale.inventoryId,
                            accounttype: "SALESACCOUNT"
                        }
                    })
                    await tx.assetAccount.create({
                        data: {
                            accountRef: `AR${genRandonString()}`,
                            debitTotal: sale.price,
                            paymenttype: "CASH",
                            accounttype: "CASHACCOUNT"
                        }
                    })

                    const inv = await tx.inventory.findUnique({
                        where: {
                            id: sale.inventoryId
                        }
                    })
                    await tx.assetAccount.create({
                        data: {
                            accountRef: `AR${genRandonString()}`,
                            creditTotal: (inv?.buyingprice as number) * sale.quantity,
                            paymenttype: "CASH",
                            productId: sale.inventoryId,
                            accounttype: "INVENTORYACCOUNT"
                        }
                    })
                    await tx.newExpenseAccount.create({
                        data: {
                            accountRef: `EA${genRandonString()}`,
                            expensetype: "cost of goods on sold",
                            debitTotal: (inv?.buyingprice as number) * sale.quantity,
                            paymenttype: "CASH"

                        }
                    })

                    // settle profit
                    await tx.equityAccount.create({
                        data: {
                            accountRef: `AC${genRandonString()}`,
                            debitTotal: (sale.price) - ((inv?.buyingprice as number) * sale.quantity),
                            accounttype: "RETAINEDEARNINGS",
                            paymenttype: "CASH"
                        }
                    })
                }



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

// Function to create sales from invoices where inventory was already reserved
export const createSaleFromInvoice = async (
    tx: any,
    sale: {
        inventoryId: string;
        quantity: number;
        price: number;
        kindeId: string;
        vendor?: string;
    }
) => {
    // Create the sale record
    await tx.sales.create({
        data: {
            inventoryId: sale.inventoryId,
            quantitySold: sale.quantity,
            kindeId: sale.kindeId,
            priceSold: sale.price,
            status: "SOLD",
            type: "DEBIT",
            vendor: sale.vendor,
        },
    });

    // Update inventory frequency sold only (quantity already reduced during invoice creation)
    await tx.inventory.update({
        where: {
            id: sale.inventoryId,
        },
        data: {
            frequencySold: {
                increment: 1,
            },
        },
    });

    // Get inventory buying price for ledger calculations
    const inv = await tx.inventory.findUnique({
        where: {
            id: sale.inventoryId,
        },
        select: {
            buyingprice: true,
        },
    });

    // Revenue account - credit sales account with sale price
    await tx.newRevenueAccount.create({
        data: {
            accountRef: `RA${genRandonString()}`,
            paymenttype: "CASH",
            debitTotal: sale.price,
            productId: sale.inventoryId,
            accounttype: "SALESACCOUNT",
        },
    });

    // Asset account - debit cash account with sale price
    await tx.assetAccount.create({
        data: {
            accountRef: `AR${genRandonString()}`,
            debitTotal: sale.price,
            paymenttype: "CASH",
            accounttype: "CASHACCOUNT",
        },
    });

    // Asset account - credit inventory account with cost of goods
    await tx.assetAccount.create({
        data: {
            accountRef: `AR${genRandonString()}`,
            creditTotal: (inv?.buyingprice as number) * sale.quantity,
            paymenttype: "CASH",
            productId: sale.inventoryId,
            accounttype: "INVENTORYACCOUNT",
        },
    });

    // Expense account - debit expense for cost of goods sold
    await tx.newExpenseAccount.create({
        data: {
            accountRef: `EA${genRandonString()}`,
            expensetype: "cost of goods on sold",
            debitTotal: (inv?.buyingprice as number) * sale.quantity,
            paymenttype: "CASH",
        },
    });

    // Equity account - settle profit to retained earnings
    await tx.equityAccount.create({
        data: {
            accountRef: `AC${genRandonString()}`,
            debitTotal: sale.price - (inv?.buyingprice as number) * sale.quantity,
            accounttype: "RETAINEDEARNINGS",
            paymenttype: "CASH",
        },
    });
}


export const updateSale = async (sale: {
    id: string;
    price: number,
    quantity: number;
    threshold: number;
    saletype: string;
    status?: string;
    vendor?: string;
    contact?: string;
    previousstatus: string;
    inventoryId: string;
}) => {
    const { isAuthenticated, getUser } = await getKindeServerSession()
    const auth = await isAuthenticated()
    const user = await getUser()




    if (auth && user) {

        try {
            await prisma.$transaction(async (tx) => {
                if (sale.quantity > 0) {
                    const inv = await tx.inventory.findUnique({
                        where: {
                            id: sale.inventoryId
                        }
                    })

                    // handle returning a sale to credited
                    if (sale.previousstatus === "SOLD" && sale.status === "CREDITED") {
                        // settle the customer account with a balance
                        await tx.equityAccount.create({
                            data: {
                                accountRef: `AC${genRandonString()}`,
                                creditTotal: (sale.price) - ((inv?.buyingprice as number) * sale.quantity),
                                accounttype: "RETAINEDEARNINGS",
                                paymenttype: "CASH"
                            }
                        })
                        await tx.newRevenueAccount.create({
                            data: {
                                accountRef: `AC${genRandonString()}`,
                                creditTotal: sale.price,
                                accounttype: "SALESACCOUNT",
                                paymenttype: "CASH"
                            }
                        })
                        await tx.assetAccount.create({
                            data: {
                                accountRef: `AC${genRandonString()}`,
                                creditTotal: sale.price,
                                accounttype: "CASHACCOUNT",
                                paymenttype: "CASH"
                            }
                        })
                        await tx.assetAccount.create({
                            data: {
                                accountRef: `AC${genRandonString()}`,
                                customername: sale.vendor,
                                productId: sale.inventoryId,
                                customercontact: sale?.contact as string,
                                debitTotal: sale.price,
                                accounttype: "ACCOUNTRECEIVABLE",
                                paymenttype: "CASH"
                            }
                        })
                    }

                    if (sale.saletype === "SOLD") {
                        await tx.assetAccount.create({
                            data: {
                                accountRef: `AC${genRandonString()}`,
                                customername: sale.vendor,
                                productId: sale.inventoryId,
                                customercontact: sale?.contact as string,
                                creditTotal: sale.price,
                                accounttype: "ACCOUNTRECEIVABLE",
                                paymenttype: "CASH"
                            }
                        })
                        await tx.newRevenueAccount.create({
                            data: {
                                accountRef: `AC${genRandonString()}`,
                                debitTotal: sale.price,
                                accounttype: "SALESACCOUNT",
                                paymenttype: "CASH"
                            }
                        })
                        await tx.assetAccount.create({
                            data: {
                                accountRef: `AC${genRandonString()}`,
                                debitTotal: sale.price,
                                accounttype: "CASHACCOUNT",
                                paymenttype: "CASH"
                            }
                        })

                        // settle profit
                        await tx.equityAccount.create({
                            data: {
                                accountRef: `AC${genRandonString()}`,
                                debitTotal: (sale.price) - ((inv?.buyingprice as number) * sale.quantity),
                                accounttype: "RETAINEDEARNINGS",
                                paymenttype: "CASH"
                            }
                        })
                    }
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

                        await tx.assetAccount.create({
                            data: {
                                accountRef: `AC${genRandonString()}`,
                                customername: sale.vendor,
                                productId: sale.inventoryId,
                                customercontact: sale?.contact as string,
                                creditTotal: sale.price,
                                accounttype: "ACCOUNTRECEIVABLE",
                                paymenttype: "CASH"
                            }
                        })

                        await tx.newRevenueAccount.create({
                            data: {
                                accountRef: `AC${genRandonString()}`,
                                debitTotal: sale.price,
                                accounttype: "SALESACCOUNT",
                                paymenttype: "CASH"
                            }
                        })

                        await tx.newExpenseAccount.create({
                            data: {
                                accountRef: `EA${genRandonString()}`,
                                creditTotal: (inv?.buyingprice as number) * sale.quantity,
                                expensetype: "cost of goods returned",
                                paymenttype: "CASH"
                            }
                        })

                        await tx.assetAccount.create({
                            data: {
                                accountRef: `AC${genRandonString()}`,
                                productId: sale.inventoryId,
                                debitTotal: (inv?.buyingprice as number) * sale.quantity,
                                accounttype: "INVENTORYACCOUNT",
                                paymenttype: "CASH"
                            }
                        })

                        await tx.sales.delete({
                            where: {
                                id: sale.id
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
                                status: sale.status as ProductStatus,
                                type: sale.saletype as SaleType
                            },

                            select: {
                                id: true
                            }
                        })

                        await tx.sales.update({
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
            const capital = await prisma.equityAccount.aggregate({
                where: {
                    accounttype: "CAPITALACCOUNT"
                },
                _sum: {
                    debitTotal: true,
                    creditTotal: true
                }
            })
            if (((capital._sum.debitTotal as number) - (capital._sum.creditTotal as number)) !== 0) {
                // Set batch size
                const batchSize = 10; // Adjust based on your environment
                for (let i = 0; i < inventory.length; i += batchSize) {
                    const batch = inventory.slice(i, i + batchSize);

                    // Use Promise.all to handle the batch concurrently
                    await Promise.all(batch.map(async (item) => {
                        await prisma.$transaction(async (tx) => {
                            await tx.equityAccount.create({
                                data: {
                                    accountRef: `EA${genRandonString()}`,
                                    accounttype: "CAPITALACCOUNT",
                                    creditTotal: item.BuyingPrice,
                                    debitTotal: 0,
                                    paymenttype: "CASH"
                                }
                            })

                            await tx.assetAccount.create({
                                data: {
                                    accountRef: `AC${genRandonString()}`,
                                    accounttype: "CASHACCOUNT",
                                    debitTotal: item.BuyingPrice,
                                    paymenttype: "CASH"
                                }
                            })

                            await tx.assetAccount.create({
                                data: {
                                    accountRef: `AC${genRandonString()}`,
                                    accounttype: "CASHACCOUNT",
                                    creditTotal: item.BuyingPrice,
                                    paymenttype: "CASH"
                                }
                            })


                            await tx.assetAccount.create({
                                data: {
                                    accountRef: `AC${genRandonString()}`,
                                    accounttype: "INVENTORYACCOUNT",
                                    debitTotal: item.BuyingPrice,
                                    paymenttype: "CASH"
                                }
                            })

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

            } else {
                return new Error("Capital account is not enough or empty")
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



// export async function seedData() {
//     try {
//         const inventory = await prisma.services.findMany({
//             // select:{
//             //     id:true,
//             //     amount:true,
//             //     category:{
//             //         select:{
//             //             name:true
//             //         }
//             //     },
//             //     created_at:true,
//             //     updated_at:true
//             // }
//             // where:{
//             //     type:"CREDIT",
//             //     status:"RETURNED"
//             // }
//             // _sum:{
//             //     creditTotal:true,
//             //     debitTotal:true

//             // }
//         })
//         // const inventoryAcc = await prisma.inventoryAccount.create({
//         //     // _sum:{
//         //     //     creditTotal:true,
//         //     //     debitTotal:true

//         //     // }
//         //     data:{
//         //         productId:"671fcb9f44c071f728787978"
//         //     }
//         // })

//         // await prisma.transactionAccount.deleteMany({
//         //     where:{
//         //         debitAccountId:{
//         //             not:''
//         //         }
//         //     }
//         // })


//         // const inventoryAcc = await prisma.inventoryAccount.findMany()
//         // console.log(inventory)



//         // for (let i = 0; i < inventory.length; i++) {



//         //     await prisma.$transaction(async (tx) => {

//         //         // // // create transaction
//         //         // const createMainAccountTransaction = await tx.mainAccount.create({
//         //         //     data: {
//         //         //         accountRef: `MC${genRandonString()}`,
//         //         //         debitTotal: inventory[i].creditTotal,
//         //         //         creditTotal: 0,
//         //         //         created_at:new Date(inventory[i]?.created_at),
//         //         //         updated_at:new Date(inventory[i].updated_at)
//         //         //     }
//         //         // })

//         //         // // console.log(createMainAccountTransaction, "trab")
//         //         const saleAccount = await tx.customerAccount.create({
//         //             data: {
//         //                 accountRef: `CA${genRandonString()}`,
//         //                 accountName: inventory[i].vendor as string,
//         //                 customerContact: '',
//         //                 debitTotal: 0,
//         //                 creditTotal: inventory[i].priceSold,
//         //                 created_at: new Date(inventory[i].created_at),
//         //                 updated_at: new Date(inventory[i].updated_at)
//         //             },
//         //         });
//         //         // // // console.log(createMainAccountTransaction, "trab")
//         //         // const revAccount = await tx.revenueAccount.create({
//         //         //     data: {
//         //         //         accountRef: `RC${genRandonString()}`,
//         //         //         debitTotal: 0,
//         //         //         creditTotal:20,
//         //         //         created_at:new Date('2024-10-31T06:42:46.101+00:00'),
//         //         //         updated_at:new Date('2024-10-31T06:42:46.101+00:00')
//         //         //     },
//         //         // });
//         //         // // Create a new transaction record
//         //         // const newTransaction = await tx.transactionAccount.create({
//         //         //     data: {
//         //         //         accountRef: `TC${genRandonString()}`,
//         //         //         debitAmount: 20,
//         //         //         creditAmount: 0,
//         //         //         description: "sale acc setup",
//         //         //         creditAccountId: revAccount.id,
//         //         //         debitAccountId: '',
//         //         //         created_at:new Date('2024-10-31T06:42:46.101+00:00'),
//         //         //         updated_at:new Date('2024-10-31T06:42:46.101+00:00')
//         //         //         // credit the Inventory Account
//         //         //         // debitAccountId: InventoryAccount.id,     // debiting the Cash Account or source
//         //         //     },
//         //         // });
//         //     });

//         // }

//         // Set batch size
//         // const batchSize = 10; // Adjust based on your environment
//         // for (let i = 0; i < inventory.length; i += batchSize) {
//         //     const batch = inventory.slice(i, i + batchSize);

//         //     // Use Promise.all to handle the batch concurrently
//         //     await Promise.all(batch.map(async (item) => {
//         //         await prisma.$transaction(async (tx) => {

//         //             // credit cash acc
//         //             await tx.assetAccount.create({
//         //                 data: {
//         //                     accountRef: `AC${genRandonString()}`,
//         //                     accounttype: "CASHACCOUNT",
//         //                     paymenttype: "CASH",
//         //                     creditTotal: 0,
//         //                     debitTotal: item.price,
//         //                     created_at: item.created_at,
//         //                     updated_at: item.updated_at
//         //                 }
//         //             })


//         //             await tx.newRevenueAccount.create({
//         //                 data: {
//         //                     accountRef: `RA${genRandonString()}`,
//         //                     accounttype: "SERVICEACCOUNT",
//         //                     paymenttype: "CASH",
//         //                     debitTotal: item.price,
//         //                     creditTotal: 0,
//         //                     created_at: item.created_at,
//         //                     updated_at: item.updated_at
//         //                 }
//         //             })

//         //             // const product = await tx.inventory.findUnique({
//         //             //     where: {
//         //             //         id: item.inventoryId
//         //             //     }
//         //             // })

//         //             // await tx.newExpenseAccount.create({
//         //             //     data: {
//         //             //         accountRef: `EA${genRandonString()}`,
//         //             //         expensetype: item.category.name,
//         //             //         paymenttype: "CASH",
//         //             //         debitTotal: item.amount,
//         //             //         creditTotal: 0,
//         //             //         created_at: item.created_at,
//         //             //         updated_at: item.created_at

//         //             //     }
//         //             // })

//         //             // await tx.assetAccount.create({
//         //             //     data: {
//         //             //         accountRef: `AC${genRandonString()}`,
//         //             //         accounttype: "INVENTORYACCOUNT",
//         //             //         paymenttype: "CASH",
//         //             //         creditTotal: (product?.buyingprice as number) * item.quantitySold,
//         //             //         debitTotal: 0,
//         //             //         productId: item.inventoryId,
//         //             //         created_at: item.created_at,
//         //             //         updated_at: item.updated_at
//         //             //     }
//         //             // })

//         //             // await tx.assetAccount.create({
//         //             //     data: {
//         //             //         accountRef: `AC${genRandonString()}`,
//         //             //         accounttype: "ACCOUNTRECEIVABLE",
//         //             //         paymenttype: "CASH",
//         //             //         creditTotal: item.priceSold,
//         //             //         debitTotal: 0,
//         //             //         productId: item.inventoryId,
//         //             //         created_at: item.created_at,
//         //             //         updated_at: item.updated_at
//         //             //     }
//         //             // })


//         //             // await tx.newRevenueAccount.create({
//         //             //     data: {
//         //             //         accountRef: `RA${genRandonString()}`,
//         //             //         accounttype: "SALESACCOUNT",
//         //             //         paymenttype: "CASH",
//         //             //         creditTotal: 0,
//         //             //         debitTotal: item.priceSold,
//         //             //         created_at: item.created_at,
//         //             //         updated_at: item.updated_at
//         //             //     }
//         //             // })




//         //             // debit inventory acc
//         //             // await tx.assetAccount.create({
//         //             //     data: {
//         //             //         accountRef: `AC${genRandonString()}`,
//         //             //         accounttype: "INVENTORYACCOUNT",
//         //             //         paymenttype: "CASH",
//         //             //         debitTotal: (item.priceSold) - ((product?.buyingprice as number) * item.quantitySold),
//         //             //         creditTotal: 0,
//         //             //         created_at: item.created_at,
//         //             //         updated_at: item.updated_at
//         //             //     }
//         //             // })

//         //             // await tx.newExpenseAccount.create({
//         //             //     data: {
//         //             //         accountRef: `EA${genRandonString()}`,
//         //             //         expensetype: "cost of goods returned",
//         //             //         paymenttype: "CASH",
//         //             //         creditTotal: (item.priceSold) - ((product?.buyingprice as number) * item.quantitySold),
//         //             //         debitTotal: 0,
//         //             //         created_at: item.created_at,
//         //             //         updated_at: item.updated_at
//         //             //     }
//         //             // })
//         //         },
//         //             {
//         //                 maxWait: 5000, // 5 seconds max wait to connect to prisma
//         //                 timeout: 20000, // 20 seconds
//         //             }

//         //         );
//         //     }
//         //     ));
//         // }

//         // const today= new Date()
//         // const yesterday = new Date(today)

//         // yesterday.setDate(yesterday.getDate() - 1)



//         // await prisma.cASHBALANCE.create({
//         //     data:{
//         //         amount:6140,
//         //         created_at:yesterday,
//         //         updated_at:yesterday
//         //     }
//         // })


//         await prisma.newRevenueAccount.create({
//             data: {
//                 accountRef: `RA${genRandonString()}`,
//                 paymenttype: "CASH",
//                 productId: "67167c62d903ceb69e4021d6",
//                 debitTotal: 2400,
//                 accounttype: "SALESACCOUNT"
//             }
//         })



//         await prisma.assetAccount.create({
//             data: {
//                 accountRef: `CA${genRandonString()}`,
//                 debitTotal: 2400,
//                 paymenttype: "CASH",
//                 productId: "67167c62d903ceb69e4021d6",
//                 accounttype: "CASHACCOUNT"
//             }
//         })





//     } catch (e: any) {
//         console.log(e.message)
//     }

// }