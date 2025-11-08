import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export const converttocunrrency = (amount: number | undefined) => {
    if(!amount) return "KES 0.00";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' }).format(amount);
  }