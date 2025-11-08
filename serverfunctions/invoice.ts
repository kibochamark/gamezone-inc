"use server"
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
                const invoice = await tx.invoice.update({
                    where: { id },
                    data: { status },
                });
    
                await tx.stockReservation.updateMany({
                    where: { invoiceid: id },
                    data: { status: "COMMITTED" },
                });
    
                return invoice;
            });
            return [200,updatedInvoice];
        }
        else if (status === "CANCELLED") {
            const updatedInvoice= await prisma.$transaction(async (tx) => {
                const invoice = await tx.invoice.update({
                    where: { id },
                    data: { status },
                });
    
                const reservations = await tx.stockReservation.findMany({
                    where: { invoiceid: id },
                });
    
                await tx.stockReservation.updateMany({
                    where: { invoiceid: id },
                    data: { status: "RELEASED" },
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
                return invoice;
            });
            return [200,updatedInvoice];
        }
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