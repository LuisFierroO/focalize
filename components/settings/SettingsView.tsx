"use client";

import { useEffect, useState, useCallback } from "react";
import { Mail, MessageCircle, Clock, Send, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NotificationConfig {
  id: string;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  whatsappPhone: string | null;
  reminderHour: number;
  callmebotConfigured: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${String(i).padStart(2, "0")}:00`,
}));

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-5 space-y-4", className)}>
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

type TestStatus = "idle" | "loading" | "ok" | "error";

export function SettingsView() {
  const [config, setConfig] = useState<NotificationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [phoneInput, setPhoneInput] = useState("");

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/notifications");
      const data = await res.json();
      setConfig(data);
      setPhoneInput(data.whatsappPhone ?? "");
    } catch {
      toast.error("Error al cargar la configuración");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  async function patch(updates: Partial<NotificationConfig>) {
    if (!config) return;
    const optimistic = { ...config, ...updates };
    setConfig(optimistic);
    setSaving(true);
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setConfig(updated);
      toast.success("Guardado");
    } catch {
      setConfig(config); // revert
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function savePhone() {
    await patch({ whatsappPhone: phoneInput.trim() || null });
  }

  async function handleTest() {
    setTestStatus("loading");
    setTestResults({});
    try {
      const res = await fetch("/api/settings/notifications/test", { method: "POST" });
      const data = await res.json();
      setTestResults(data.results ?? {});
      setTestStatus(data.success ? "ok" : "error");
      if (data.success) toast.success("Notificación de prueba enviada");
      else toast.error("Algunos canales fallaron — revisa los resultados");
    } catch {
      setTestStatus("error");
      toast.error("Error al enviar la prueba");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Cargando ajustes...</span>
      </div>
    );
  }

  if (!config) return null;

  const nothingEnabled = !config.emailEnabled && !config.whatsappEnabled;

  return (
    <div className="space-y-4">

      {/* Email */}
      <SectionCard>
        <div className="flex items-start justify-between gap-4">
          <SectionHeader
            icon={<Mail className="h-4 w-4" />}
            title="Notificaciones por email"
            description="Recibe un resumen de tus tareas Q1 sin completar al final del día."
          />
          <Switch
            checked={config.emailEnabled}
            onCheckedChange={(v) => patch({ emailEnabled: v })}
            aria-label="Activar email"
          />
        </div>

        {config.emailEnabled && (
          <>
            <Separator />
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <p className="text-xs text-muted-foreground">Email configurado correctamente.</p>
            </div>
          </>
        )}
      </SectionCard>

      {/* WhatsApp */}
      <SectionCard>
        <div className="flex items-start justify-between gap-4">
          <SectionHeader
            icon={<MessageCircle className="h-4 w-4" />}
            title="Notificaciones por WhatsApp"
            description="Recibe un mensaje de WhatsApp con tus tareas urgentes pendientes."
          />
          <Switch
            checked={config.whatsappEnabled}
            onCheckedChange={(v) => patch({ whatsappEnabled: v })}
            aria-label="Activar WhatsApp"
          />
        </div>

        {config.whatsappEnabled && (
          <>
            <Separator />
            <div className="space-y-3">
              {/* Phone input */}
              <div className="space-y-1.5">
                <Label htmlFor="phone">Número de WhatsApp</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    placeholder="573001234567 (sin + ni espacios)"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
                    className="h-10 font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 shrink-0"
                    onClick={savePhone}
                    disabled={saving || phoneInput === (config.whatsappPhone ?? "")}
                  >
                    Guardar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Código de país + número, sin espacios ni +. Ej: <span className="font-mono">573001234567</span>
                </p>
              </div>

              {/* CallMeBot status */}
              {config.callmebotConfigured ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">WhatsApp configurado correctamente.</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                  <XCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">API key de WhatsApp no configurada.</p>
                </div>
              )}
            </div>
          </>
        )}
      </SectionCard>

      {/* Reminder hour */}
      <SectionCard>
        <SectionHeader
          icon={<Clock className="h-4 w-4" />}
          title="Hora del recordatorio"
          description="A qué hora se envían las notificaciones de tareas Q1 sin completar."
        />
        <Separator />
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {[8, 18, 20, 21, 22].map((h) => (
              <button
                key={h}
                onClick={() => patch({ reminderHour: h })}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  config.reminderHour === h
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-accent hover:border-primary/40"
                )}
              >
                {String(h).padStart(2, "0")}:00
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="custom-hour" className="text-xs shrink-0 text-muted-foreground">Hora personalizada:</Label>
            <select
              id="custom-hour"
              value={config.reminderHour}
              onChange={(e) => patch({ reminderHour: parseInt(e.target.value) })}
              className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {HOURS.map((h) => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted-foreground">
            El recordatorio nocturno solo se envía si tienes tareas <span className="font-medium text-foreground">Q1 (Urgente + Importante)</span> sin completar ese día.
          </p>
        </div>
      </SectionCard>

      {/* Test button */}
      <SectionCard>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-sm">Probar notificaciones</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Envía una notificación de prueba ahora por los canales activos.
            </p>
          </div>
          <Button
            onClick={handleTest}
            disabled={nothingEnabled || testStatus === "loading"}
            variant={testStatus === "ok" ? "outline" : "default"}
            size="sm"
            className={cn(
              "shrink-0 gap-2",
              testStatus === "ok" && "border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
            )}
          >
            {testStatus === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
            {testStatus === "ok" && <CheckCircle2 className="h-4 w-4" />}
            {testStatus === "error" && <XCircle className="h-4 w-4" />}
            {testStatus === "idle" && <Send className="h-4 w-4" />}
            {testStatus === "loading" ? "Enviando..." : testStatus === "ok" ? "Enviado" : "Probar ahora"}
          </Button>
        </div>

        {nothingEnabled && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            Activa al menos un canal (email o WhatsApp) para poder probar.
          </p>
        )}

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-2 mt-1">
            {testResults.email && (
              <div className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs border",
                testResults.email === "ok"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                  : "bg-destructive/10 border-destructive/20 text-destructive"
              )}>
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span>Email: {testResults.email === "ok" ? "enviado correctamente" : testResults.email}</span>
              </div>
            )}
            {testResults.whatsapp && (
              <div className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs border",
                testResults.whatsapp === "ok"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                  : "bg-destructive/10 border-destructive/20 text-destructive"
              )}>
                <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                <span>WhatsApp: {testResults.whatsapp === "ok" ? "enviado correctamente" : testResults.whatsapp}</span>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* Cron info */}
      <div className="rounded-lg bg-muted/40 border border-dashed px-4 py-3">
        <p className="text-xs text-muted-foreground">
          El recordatorio se envía automáticamente a las{" "}
          <span className="font-medium text-foreground">{String(config.reminderHour).padStart(2, "0")}:00</span>{" "}
          solo si tienes tareas <span className="font-medium text-foreground">Q1</span> sin completar.
        </p>
      </div>

    </div>
  );
}
