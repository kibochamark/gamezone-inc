import InvoicesPage from '@/components/invoices/PageView'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import React from 'react'

const page = async () => {
    const { isAuthenticated, getPermissions } = await getKindeServerSession()
     const permissions = await getPermissions() 
  return (
    <div className='min-h-screen'>
        <InvoicesPage permissions={permissions?.permissions}/>
    </div>
  )
}

export default page