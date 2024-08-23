"use server"

import { prisma } from "@/lib/prismaClient"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { CategoryType } from "@prisma/client";




export const createCategory =async(category:{name:string; type:string;})=>{
    const {isAuthenticated} = await getKindeServerSession()
    const auth = await isAuthenticated()
    



    if(auth){

            
            const newcategory = await prisma.category.create({
                data:{
                    name:category.name,
                    type:category.type.toUpperCase() as CategoryType
                },
                select:{
                    id:true
                }
            })



       
    }else{
        return new Error("not authenticated")
    }

}
export const updateCategory =async(category:{name:string; type:string; id:string})=>{
    const {isAuthenticated} = await getKindeServerSession()
    const auth = await isAuthenticated()
    



    if(auth){

            
            const newcategory = await prisma.category.update({
                where:{
                    id:category.id
                },
                data:{
                    name:category.name,
                    type:category.type.toUpperCase() as CategoryType
                },
                select:{
                    id:true
                }
            })



       
    }else{
        return new Error("not authenticated")
    }

}
export const deleteCategory =async(id:string)=>{
    const {isAuthenticated} = await getKindeServerSession()
    const auth = await isAuthenticated()
    



    if(auth){

            
            const deletedcategory = await prisma.category.delete({
                where:{
                    id
                },
               
            })



       
    }else{
        return new Error("not authenticated")
    }

}