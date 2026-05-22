import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/layout/AppNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-dvh flex-col bg-background md:flex-row">
      <AppNav />
      <main className="flex-1 overflow-auto pb-20 md:pb-0 md:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
