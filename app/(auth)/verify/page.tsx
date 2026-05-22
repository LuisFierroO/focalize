"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function VerifyInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const called = useRef(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  useEffect(() => {
    if (!token || !email || called.current) return;
    called.current = true;
    const params = new URLSearchParams({ token, email, callbackUrl });
    router.replace(`/api/auth/callback/resend?${params.toString()}`);
  }, [token, email, callbackUrl, router]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Verificando tu acceso...</p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyInner />
    </Suspense>
  );
}
