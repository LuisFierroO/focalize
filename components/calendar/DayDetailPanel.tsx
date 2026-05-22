"use client";

import { useState } from "react";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Trash2, Clock, CalendarDays } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { EventSheet } from "@/components/calendar/EventSheet";
import { Task, TaskStatus } from "@/domain/task/Task";
import { Event } from "@/domain/event/Event";
import { EisenhowerQuadrant, QUADRANT_LABELS } from "@/domain/task/EisenhowerQuadrant";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const QUADRANT_BADGE: Record<EisenhowerQuadrant, string> = {
  [EisenhowerQuadrant.Q1]: "bg-[var(--q1-bg)] text-[var(--q1)] border-[var(--q1)]/30",
  [EisenhowerQuadrant.Q2]: "bg-[var(--q2-bg)] text-[var(--q2)] border-[var(--q2)]/30",
  [EisenhowerQuadrant.Q3]: "bg-[var(--q3-bg)] text-[var(--q3)] border-[var(--q3)]/30",
  [EisenhowerQuadrant.Q4]: "bg-[var(--q4-bg)] text-[var(--q4)] border-[var(--q4)]/30",
};

interface DayDetailPanelProps {
  day: Date;
  tasks: Task[];
  events: Event[];
  onEventAdded: (event: Event) => void;
  onEventDeleted: (id: string) => void;
  onTaskComplete: (id: string) => void;
  asSheet: boolean;
  open: boolean;
  onClose: () => void;
}

function PanelContent({
  day, tasks, events, onEventAdded, onEventDeleted, onTaskComplete,
}: Omit<DayDetailPanelProps, "asSheet" | "open" | "onClose">) {
  const [eventSheetOpen, setEventSheetOpen] = useState(false);
  const today = isToday(day);
  const pendingTasks = tasks.filter((t) => t.status !== TaskStatus.DONE);
  const doneTasks = tasks.filter((t) => t.status === TaskStatus.DONE);

  async function handleDeleteEvent(id: string) {
    try {
      await fetch(`/api/events/${id}`, { method: "DELETE" });
      onEventDeleted(id);
      toast.success("Evento eliminado");
    } catch {
      toast.error("Error al eliminar el evento");
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Day heading */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={cn("text-2xl font-bold tabular-nums", today && "text-primary")}>
              {format(day, "d")}
            </p>
            <p className="text-sm text-muted-foreground capitalize">
              {format(day, "EEEE, d MMMM", { locale: es })}
            </p>
          </div>
          {today && (
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-xs">
              Hoy
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Events */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Eventos {events.length > 0 && `· ${events.length}`}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={() => setEventSheetOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar
            </Button>
          </div>

          {events.length === 0 ? (
            <button
              onClick={() => setEventSheetOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed py-3 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Sin eventos este día
            </button>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="group flex items-start gap-2.5 rounded-lg border bg-emerald-500/5 border-emerald-500/20 p-3"
                >
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    {!event.allDay && event.startAt && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {format(new Date(event.startAt), "HH:mm")}
                        {event.endAt && ` — ${format(new Date(event.endAt), "HH:mm")}`}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-0.5 shrink-0"
                    aria-label="Eliminar evento"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks */}
        {tasks.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Tareas con vencimiento · {tasks.length}
              </h3>
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-2.5 rounded-lg border bg-card p-3"
                  >
                    <Checkbox
                      checked={false}
                      onCheckedChange={() => onTaskComplete(task.id)}
                      className="mt-0.5 h-4 w-4 shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium leading-snug">{task.title}</p>
                      <span className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        QUADRANT_BADGE[task.quadrant]
                      )}>
                        {QUADRANT_LABELS[task.quadrant].title}
                      </span>
                    </div>
                  </div>
                ))}
                {doneTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-2.5 rounded-lg border bg-card p-3 opacity-50"
                  >
                    <Checkbox
                      checked={true}
                      onCheckedChange={() => onTaskComplete(task.id)}
                      className="mt-0.5 h-4 w-4 shrink-0"
                    />
                    <p className="text-sm line-through text-muted-foreground leading-snug">{task.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tasks.length === 0 && events.length > 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            No hay tareas con vencimiento este día
          </p>
        )}

        {tasks.length === 0 && events.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Día libre — sin tareas ni eventos
          </p>
        )}
      </div>

      <EventSheet
        open={eventSheetOpen}
        onClose={() => setEventSheetOpen(false)}
        defaultDate={day}
        onSaved={onEventAdded}
      />
    </div>
  );
}

export function DayDetailPanel(props: DayDetailPanelProps) {
  const { asSheet, open, onClose, day, ...rest } = props;

  if (asSheet) {
    return (
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="bottom" className="h-[80dvh] rounded-t-2xl px-6 py-6 flex flex-col">
          <SheetHeader className="mb-4 text-left">
            <SheetTitle className="text-base">
              {format(day, "EEEE d 'de' MMMM", { locale: es })}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <PanelContent day={day} {...rest} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 h-full flex flex-col sticky top-6">
      <PanelContent day={day} {...rest} />
    </div>
  );
}
