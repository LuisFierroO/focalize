import { CalendarView } from "@/components/calendar/CalendarView";

export default function CalendarPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendario</h1>
        <p className="text-sm text-muted-foreground">Tus eventos y tareas con fecha de vencimiento.</p>
      </div>
      <CalendarView />
    </div>
  );
}
