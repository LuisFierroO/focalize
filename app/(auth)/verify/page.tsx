"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Página intermedia que consume el token solo cuando el usuario hace click activo.
// Esto evita que Gmail/Outlook prefetcheen el link y consuman el token.
export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const called = useRef(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  useEffect(() => {
    if (!token || !email || called.current) return;
    called.current = true;
    // Redirige al callback real de Auth.js — esto ocurre solo en el cliente,
    // no en el prefetch de Gmail que solo hace GET desde el servidor.
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
