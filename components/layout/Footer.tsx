import { Link, Package2 } from "lucide-react";

import React from 'react'

const Footer = () => {
    return (
        <footer className="bg-gray-50 w-full">
            <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="flex justify-center sm:justify-start">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Package2 className="h-6 w-6" />
                            <span className="text-titleLarge text-primary900">Dantech Inc</span>
                        </Link>
                    </div>

                    <p className="mt-4 text-center text-sm text-gray-500 lg:mt-0 lg:text-right">
                        Copyright &copy; {new Date().getFullYear()}. Kibotech softwares , All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer

