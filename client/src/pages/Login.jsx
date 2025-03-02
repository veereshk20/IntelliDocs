import { SignIn } from '@clerk/clerk-react'
import React from 'react'

export default function Login() {
  return (
    <div className='flex items-center justify-center min-h-screen'>
      <SignIn />
    </div>
  )
}
