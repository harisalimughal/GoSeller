'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const sellerToken = localStorage.getItem('sellerToken')
    if (!sellerToken) {
      router.push('/seller-login')
    }
  }, [router])

  return <>{children}</>
}
