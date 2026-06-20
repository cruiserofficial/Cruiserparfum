import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const metadata: Metadata = {
  title: { template: '%s | Admin — CRUISER', default: 'Dashboard | Admin — CRUISER' },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user || !['admin', 'superadmin'].includes(session.user.role)) {
    redirect('/login?callbackUrl=/admin')
  }

  return (
    <div className="min-h-screen bg-obsidian flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
