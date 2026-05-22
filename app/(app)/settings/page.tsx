import { SettingsView } from "@/components/settings/SettingsView";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-sm text-muted-foreground">Configura tus notificaciones diarias.</p>
      </div>
      <SettingsView />
    </div>
  );
}
