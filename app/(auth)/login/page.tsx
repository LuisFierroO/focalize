"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ALLOWED = process.env.NEXT_PUBLIC_ALLOWED_EMAIL ?? "";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim().toLowerCase() !== ALLOWED.toLowerCase()) {
      setUnauthorized(true);
      return;
    }
    setUnauthorized(false);
    setLoading(true);
    await signIn("resend", { email, redirect: false, callbackUrl: "/" });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
            <svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Focalize</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tu gestor de tareas personal</p>
        </div>

        {sent ? (
          <div className="rounded-xl border bg-card p-6 text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <p className="font-semibold">Revisa tu correo</p>
            <p className="text-sm text-muted-foreground">
              Te enviamos un enlace de acceso a <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || unauthorized) && (
              <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {unauthorized ? "No tienes acceso a esta aplicación." : "Error al iniciar sesión. Intenta de nuevo."}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setUnauthorized(false); }}
                required
                autoComplete="email"
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Enviando..." : "Continuar con email"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Te enviaremos un enlace seguro sin necesidad de contraseña.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
