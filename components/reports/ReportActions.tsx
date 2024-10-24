import { prisma } from "@/lib/prismaClient";
import { Reports } from "./Reports";

export async function getReportData(reportType:Reports, fromdate:Date = new Date(), todate:Date=new Date()) {

    console.log(fromdate, todate, 'date range')
    let result;
    try {
        switch(reportType){
            case "lowstock":
                const inventory = await prisma.inventory.findMany({
                    where: {
                
                        OR: [
                            {
                                created_at: {
                                    gte: fromdate,
                                    lt: todate
                                }
                            },
                            {
                                updated_at: {
                                    gte: fromdate,
                                    lt: todate  
                                }
                            }
                        ]
        
                    },
                })

                result = inventory.filter((inv)=> inv.quantity < inv.threshold)

                break
            default:
                result = "not a valid report"
                break

        }

        return result
    } catch (e) {
        console.error(e); // Log the error for debugging
    }

}