import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin/app-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <SidebarTrigger />
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
