import { createSlice } from "@reduxjs/toolkit"

type ReportSlice ={
    dateRange:{
        from:Date | undefined,
        to:Date | undefined
    } | undefined
}



const initialState :ReportSlice ={
    dateRange: {
        from: undefined,
        to: undefined
    }
}



const reportslice= createSlice({
    name:"reportslice",
    initialState,
    reducers:{
        handleDaterange:(state, action)=>{
            state.dateRange={
                from:action.payload.from,
                to:action.payload.to
            }
        }
    }
})




export const {handleDaterange} = reportslice.actions

export const ReportReducer= reportslice.reducer