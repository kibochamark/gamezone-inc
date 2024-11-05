'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useMutation } from '@tanstack/react-query'
import { createorupdatecapital } from './capitalactions'
import { useFormik } from 'formik'
import * as Yup from "yup"
import { Revalidate } from '@/lib/Revalidate'
import toast from 'react-hot-toast'

export default function PageView({ data }: { data: any }) {
    const [capital, setCapital] = useState<number>(0)
    const [newCapital, setNewCapital] = useState<string>('')
    const [error, setError] = useState<string | null>(null)


    const formik = useFormik({
        initialValues: {
            amount: 0
        },
        validationSchema: Yup.object().shape({
            amount: Yup.number().required()
        }),
        onSubmit: async (values, formikHelpers) => {
            try {
                const res = await createorupdatecapital(values.amount);

                console.log(res, "res")

                if (res instanceof Error) {
                    throw res;
                }

                Revalidate("/capital-setup");
                toast.success("capital amount updated successfully!");
            } catch (error) {
                // console.error("Error creating category:", error);
                toast.error("Failed to create capital. Please try again.");

            }
        },
    })




    return (
        <div className="container p-4 w-full">
            <Card>
                <CardHeader>
                    <CardTitle>Capital Management</CardTitle>
                    <CardDescription>View and update your shops capital</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold">Current Capital</h2>
                        <p className="text-3xl font-bold">
                            {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "KES",
                            }).format(parseFloat(data))}
                        </p>
                    </div>

                    <form onSubmit={formik.handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="newCapital">Add New Capital</Label>
                            <Input
                                id="newCapital"
                                type="number"
                                value={newCapital}
                                onChange={(e) => setNewCapital(e.target.value)}
                                placeholder="Enter amount"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full mt-4">Add Capital</Button>
                    </form>
                </CardContent>
                <CardFooter>
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}