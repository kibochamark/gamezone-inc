import { Inventory } from "@/components/Inventory/InventoryActions";
import { createSlice } from "@reduxjs/toolkit"


// Define a type for the slice state
export interface DataTableSlice {
    edit: boolean;
    delete: boolean;
    page: string;
    issale: boolean;
    data: any;
    isbulk:boolean;
    isbulkloading:boolean;
    exceldata:any
}

// Define the initial state using that type
const initialState: DataTableSlice = {
    edit: false,
    delete: false,
    page: "",
    data: {},
    issale: false,
    isbulk: false,
    isbulkloading: false,
    exceldata: []
}

export const datatableSlice = createSlice({
    name: 'datatableslice',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        handleEdit: (state, action) => {
            state.page = action.payload.page
            state.edit = action.payload.edit
            state.data = action.payload.data
        },
        handleDelete: (state, action) => {
            state.page = action.payload.page
            state.delete = action.payload.delete
            state.data = action.payload.data
        },
        handleSale: (state, action) => {
            state.page = action.payload.page
            state.issale = action.payload.issale
            state.data = action.payload.data
        },
        handleBulk:(state, action)=>{
            state.page = action.payload.page
            state.isbulk = action.payload.isbulk
        },
        handleExcelData:(state, action)=>{
            state.exceldata = action.payload
        },
        handleLoading:(state)=>{
            state.isbulkloading =!state.isbulkloading
        }

    }
})

export const { handleDelete, handleEdit, handleSale, handleBulk, handleExcelData, handleLoading } = datatableSlice.actions


export const DatatableReducer = datatableSlice.reducer