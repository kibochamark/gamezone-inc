import { Link, Package2 } from "lucide-react";
import Image from "next/image";

import React from 'react'

const Footer = () => {
    return (
        <footer className="bg-gray-50 w-full">
            <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="flex justify-center sm:justify-start">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            {/* <Image src="/logo.jpg" alt="logo" width={100} height={100} className="" /> */}
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

