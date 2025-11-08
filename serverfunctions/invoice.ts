"use server"
import { createService } from "@/components/services/ServiceActions";
import { createSaleFromInvoice } from "@/components/Inventory/InventoryActions";
import { prisma } from "@/lib/prismaClient";
import { get } from "http";
import { Inter } from "next/font/google";



interface InvoiceData {
  invoiceNo:  string 
  customerName :string
  customerContact?: string
  createdBy :    string
  dueDate :Date
  subtotal: number
  tax: number
  total: number
  paidAt?: Date
  notes?: string
  items: InvoiceItemData[]
  status: "PENDING" | "PAID" | "OVERDUE"
}

interface StockReservation {
    invoiceid : string
    inventoryId?: string
    quantityReserved :    number
    status?: string
}

interface InvoiceItemData {
    inventoryId?: string
    description: string
    quantity:number
    unitPrice :  number
    totalPrice : number
}



export async function createInvoice(data: InvoiceData) {
    try {
        console.log("Creating invoice with data:", data);
        const newInvoice = await prisma.$transaction(async (tx) => {
            const newInvoice = await tx.invoice.create({
                data: {
                    invoiceNo: data.invoiceNo,
                    customerName: data.customerName,
                    customerContact: data.customerContact,
                    createdBy: data.createdBy,
                    dueDate: new Date(data.dueDate),
                    subtotal: data.subtotal,
                    tax: data.tax,
                    total: data.total,
                    status: data.status,
                },
            });

            const invoiceItemsData = data.items.map((item: any) => ({
                invoiceId: newInvoice.id,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
            }));

            if (data.items.some((item) => item.inventoryId)) {
                const stockReservationsData = data.items
                    .filter((item) => item.inventoryId)
                    .map((item: any) => ({
                        invoiceid: newInvoice.id,
                        inventoryId: item.inventoryId,
                        quantityReserved: item.quantity,
                    }));
                    
                
                await tx.stockReservation.createMany({
                    data: stockReservationsData,
                });

                // meant to reduce stock levels(reserve stock)

                await tx.inventory.updateMany({
                    where: {
                        id: { in: stockReservationsData.map((res: any) => res.inventoryId) },
                    },
                    data: {
                        quantity: {
                            decrement: stockReservationsData.reduce((acc: number, res: any) => acc + res.quantityReserved, 0),
                        },
                    },
                });
            }

            await tx.invoiceItem.createMany({
                data: invoiceItemsData,
            });
            return newInvoice;
        })
       
        return [newInvoice, 201];
    } catch (error:any) {
        console.error("Error creating invoice:", error);
        return [error?.message, 500];
    }
}

export async function getInvoices() {
    try {
        const invoices = await prisma.invoice.findMany({
            orderBy: {
                created_at: 'desc'
            },
            include: {
                InvoiceItem: true,
            },
        });
        return invoices;
    } catch (error) {
        console.error("Error fetching invoices:", error);
        throw error;
    }
}

export async function getInvoiceById(id: string) {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                InvoiceItem: true,
            },
        });
        return invoice;
    } catch (error) {
        console.error("Error fetching invoice by ID:", error);
        throw error;
    }
}

export async function deleteInvoice(id: string) {
    try {
        const getInvoice = await prisma.invoice.findUnique({
            where: { id },
        });
        if (!getInvoice) {
            throw new Error("Invoice not found");
        }
        if(getInvoice.status === "PAID"){
            throw new Error("Cannot delete a paid invoice");
        }
        const deletedInvoice = await prisma.$transaction(async (tx) => {
            // Delete invoice items
            await tx.invoiceItem.deleteMany({
                where: { invoiceId: id },
            });

            // Get stock reservations for the invoice
            const reservations = await tx.stockReservation.findMany({
                where: { invoiceid: id },
            });

            // Filter out any null inventoryIds
            const validInventoryIds = reservations
                .map((res) => res.inventoryId)
                .filter((id): id is string => id !== null);

            // Release stock back to inventory
            if (validInventoryIds.length > 0) {
                for (const res of reservations) {
                    if (res.inventoryId) {
                        await tx.inventory.update({
                            where: { id: res.inventoryId },
                            data: {
                                quantity: { increment: res.quantityReserved },
                            },
                        });
                    }
                }
            }

            // Delete stock reservations
            await tx.stockReservation.deleteMany({
                where: { invoiceid: id },
            });

            // Delete invoice
            await tx.invoice.delete({
                where: { id },
            });
        });
    } catch (error) {
        console.error("Error deleting invoice:", error);
        throw error;
    }
}

export async function updateInvoiceStatus(id: string, status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED") {
    try {
        if (status === "PAID") {
            const updatedInvoice= await prisma.$transaction(async (tx) => {
                // Fetch invoice data with all necessary information in a single query
                const invoicedata = await tx.invoice.findUnique(
                    {
                        where: { id },
                        select:{
                            invoiceNo:true,
                            total:true,
                            createdBy:true,
                            InvoiceItem:{
                                select:{
                                    description:true,
                                    quantity:true,
                                    unitPrice:true,
                                    totalPrice:true,
                                    inventory:{
                                        select:{
                                            id:true,
                                            name:true
                                        }
                                    }
                                }
                            }
                        }
                }
                )

                // Update invoice status
                const invoice = await tx.invoice.update({
                    where: { id },
                    data: { status },
                });

                // Update stock reservations to committed
                await tx.stockReservation.updateMany({
                    where: { invoiceid: id },
                    data: { status: "COMMITTED" },
                });

                // Process sales for inventory items
                const inventoryItems = invoicedata?.InvoiceItem.filter(item => item.inventory) || [];
                const serviceItems = invoicedata?.InvoiceItem.filter(item => !item.inventory) || [];

                // Process inventory items in the transaction
                for (const item of inventoryItems) {
                    if (item.inventory) {
                        await createSaleFromInvoice(tx, {
                            inventoryId: item.inventory.id,
                            quantity: item.quantity,
                            price: item.totalPrice,
                            kindeId: invoicedata?.createdBy || "",
                            vendor: invoicedata?.createdBy,
                        });
                    }
                }

                // Process service items outside of the main transaction to avoid timeout
                // These are independent operations that don't affect inventory
                if (serviceItems.length > 0) {
                    // Store service items to process after transaction commits
                    return { invoice, serviceItems, invoiceNo: invoicedata?.invoiceNo };
                }

                return { invoice, serviceItems: [], invoiceNo: invoicedata?.invoiceNo };
            },
            {
                maxWait: 10000, // 10 seconds max wait to connect to prisma
                timeout: 30000, // 30 seconds timeout for the entire transaction
            });

            // Process service items after the main transaction completes
            if (updatedInvoice.serviceItems && updatedInvoice.serviceItems.length > 0) {
                for (const item of updatedInvoice.serviceItems) {
                    try {
                        await createService({
                            name: `Sale of ${item.description} from invoice ${updatedInvoice.invoiceNo}`,
                            price: item.totalPrice,
                            paymentType: "CASH",
                        });
                    } catch (serviceError) {
                        console.error("Error creating service record:", serviceError);
                        // Continue processing other services even if one fails
                    }
                }
            }

            return [200, updatedInvoice.invoice];
        }
        else if (status === "CANCELLED") {
            const updatedInvoice= await prisma.$transaction(async (tx) => {
                // Update invoice status
                const invoice = await tx.invoice.update({
                    where: { id },
                    data: { status },
                });

                // Fetch reservations
                const reservations = await tx.stockReservation.findMany({
                    where: { invoiceid: id },
                });

                // Update stock reservations to released
                await tx.stockReservation.updateMany({
                    where: { invoiceid: id },
                    data: { status: "RELEASED" },
                });

                // Batch update inventory quantities using a single query per item
                // This is more efficient than individual updates
                if (reservations.length > 0) {
                    const updatePromises = reservations
                        .filter(res => res.inventoryId !== null)
                        .map(res =>
                            tx.inventory.update({
                                where: { id: res.inventoryId! },
                                data: {
                                    quantity: { increment: res.quantityReserved },
                                },
                            })
                        );

                    // Execute all updates in parallel within the transaction
                    await Promise.all(updatePromises);
                }

                return invoice;
            },
            {
                maxWait: 10000, // 10 seconds max wait to connect to prisma
                timeout: 30000, // 30 seconds timeout for the entire transaction
            });
            return [200,updatedInvoice];
        }

        // Simple status update (PENDING, OVERDUE)
        const updatedInvoice = await prisma.invoice.update({
            where: { id },
            data: { status },
        });
        return [200,updatedInvoice];
    } catch (error) {
        console.error("Error updating invoice status:", error);
        return [400, error];
    }
}

export async function getInvoicesCount() {
    try {
        const count = await prisma.invoice.count();
        return count;
    } catch (error) {
        console.error("Error counting invoices:", error);
        throw error;
    }
}

export async function getInvoicesRevenue() {
    try {
        const sum = await prisma.invoice.aggregate({
            _sum:{
                total:true  
            }
        });
        return sum._sum.total || 0;
    } catch (error) {
        console.error("Error counting invoices:", error);
        throw error;
    }
}


export async function getInvoicesSummary() {
    try {
        const summary = await prisma.invoice.groupBy({
            by:['status'],
            _sum:{
                total:true  
            }
        });
        return summary || [];
    } catch (error) {
        console.error("Error getting summary invoices:", error);
        throw error;
    }
}