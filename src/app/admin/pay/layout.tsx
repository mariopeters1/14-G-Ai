import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider } from "@/components/auth/AuthProvider";

export default function PayLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-[calc(100vh-140px)] flex overflow-hidden">
        <AuthProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[#0D0D12]">
            {children}
          </main>
        </AuthProvider>
    </div>
  );
}
