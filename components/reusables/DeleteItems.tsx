"use client"
import React from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Revalidate } from '@/lib/Revalidate';
import { useDispatch, useSelector } from 'react-redux';
import { handleDelete } from '@/redux/DatatbaleSlice';
import { RootState } from '@/redux/store';
import toast from 'react-hot-toast';


const DeleteItems = ({path, deletefunc}:{path: string, deletefunc: (id: string) => any}) => {
    const dispatch = useDispatch()

    const data = useSelector((state: RootState) => state.datatable.data)
    const isdelete = useSelector((state: RootState) => state.datatable.delete)
    const page = useSelector((state: RootState) => state.datatable.page)


    const handleItemDelete = async () => {
        try {
            const res = await deletefunc(data?.id);


            if (res instanceof Error) {
                throw res;
            }

            Revalidate(path);
            dispatch(handleDelete({
                delete: false,
                page: "",
                data: {}
            }))
            toast.success("Deleted successfully!");



        } catch (error) {
            toast.error("Failed to delete. Please try again.");
        }
    }
    return (
        <div>
            <AlertDialog open={isdelete} onOpenChange={()=>{
                dispatch(handleDelete({
                    delete: false,
                    page: "",
                    data: {}
                }))
            }}>
               
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete remove your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleItemDelete}
                            className='bg-red-600 text-white text-center'
                        >Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    )
}

export default DeleteItems
