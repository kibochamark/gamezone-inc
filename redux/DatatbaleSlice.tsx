import { createSlice } from "@reduxjs/toolkit"


// Define a type for the slice state
export interface DataTableSlice{
  edit:boolean;
  delete:boolean;
  page:string;
  data:any
}

// Define the initial state using that type
const initialState: DataTableSlice= {
    edit: false,
    delete: false,
    page: "",
    data: {}
}

export const datatableSlice = createSlice({
  name: 'datatableslice',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    handleEdit:(state, action)=>{
        state.page = action.payload.page
        state.edit = action.payload.edit
        state.data=action.payload.data
    },
    handleDelete:(state, action)=>{
        state.page = action.payload.page
        state.delete = action.payload.delete
        state.data=action.payload.data
    }
  }
})

export const { handleDelete, handleEdit } = datatableSlice.actions


export const DatatableReducer = datatableSlice.reducer