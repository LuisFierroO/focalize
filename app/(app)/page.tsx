import { EisenhowerBoard } from "@/components/eisenhower/EisenhowerBoard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tablero</h1>
        <p className="text-sm text-muted-foreground">Organiza tus tareas por urgencia e importancia.</p>
      </div>
      <EisenhowerBoard />
    </div>
  );
}
