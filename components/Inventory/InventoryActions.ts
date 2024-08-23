"use server"

import { prisma } from "@/lib/prismaClient"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"




export const createInventory =async(inventory:{name:string; price:number, buyingprice:number; threshold:number; quantity:number;categoryId:string})=>{
    const {isAuthenticated} = getKindeServerSession()
    const auth = await isAuthenticated()


    if(auth){

        try{
            const newinventory = await prisma.inventory.create({
                data:{
                    name:inventory.name,
                    categoryId :inventory.categoryId,
                    quantity  : inventory.quantity,
                    price     : inventory.price,
                    buyingprice     : inventory.buyingprice,
                    threshold  :inventory.threshold
                },
                select:{
                    id:true
                }
            })


            

        }catch(e:any){
            console.log(e.message)
            return new Error(e.message)
        }
    }else{
        return new Error("not authenticated")
    }

}
export const updateInventory =async(inventory:{id:string; name:string; price:number, buyingprice:number; threshold:number; quantity:number;categoryId:string})=>{
    const {isAuthenticated} = getKindeServerSession()
    const auth = await isAuthenticated()


    if(auth){

        try{
            const newinventory = await prisma.inventory.update({
                where:{
                    id:inventory.id
                },
                data:{
                    name:inventory.name,
                    categoryId :inventory.categoryId,
                    quantity  : inventory.quantity,
                    price     : inventory.price,
                    buyingprice     : inventory.buyingprice,
                    threshold  :inventory.threshold
                },
                select:{
                    id:true
                }
            })


            

        }catch(e:any){
            console.log(e.message)
            return new Error(e.message)
        }
    }else{
        return new Error("not authenticated")
    }

}
export const deleteInventory =async(id:string)=>{
    const {isAuthenticated} = getKindeServerSession()
    const auth = await isAuthenticated()


    if(auth){

        try{
            const newinventory = await prisma.inventory.delete({
                where:{
                    id
                },
                
            })


            

        }catch(e:any){
            console.log(e.message)
            return new Error(e.message)
        }
    }else{
        return new Error("not authenticated")
    }

}