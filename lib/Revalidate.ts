"use server"

import { revalidatePath } from "next/cache"



export const Revalidate =(name:string)=>{
    return revalidatePath(name)
}