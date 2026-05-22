"use client";

import { useState, useEffect, useCallback } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, format, getYear, getMonth,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task, TaskStatus } from "@/domain/task/Task";
import { Event } from "@/domain/event/Event";
import { EisenhowerQuadrant } from "@/domain/task/EisenhowerQuadrant";
import { DayDetailPanel } from "@/components/calendar/DayDetailPanel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const QUADRANT_DOT: Record<EisenhowerQuadrant, string> = {
  [EisenhowerQuadrant.Q1]: "bg-[var(--q1)]",
  [EisenhowerQuadrant.Q2]: "bg-[var(--q2)]",
  [EisenhowerQuadrant.Q3]: "bg-[var(--q3)]",
  [EisenhowerQuadrant.Q4]: "bg-[var(--q4)]",
};

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);

  const fetchData = useCallback(async (month: Date) => {
    setLoading(true);
    try {
      const [tasksRes, eventsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch(`/api/events?year=${getYear(month)}&month=${getMonth(month) + 1}`),
      ]);
      if (!tasksRes.ok || !eventsRes.ok) throw new Error();
      const [tasksData, eventsData] = await Promise.all([tasksRes.json(), eventsRes.json()]);
      setTasks(tasksData);
      setEvents(eventsData);
    } catch {
      toast.error("Error al cargar el calendario");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(currentMonth); }, [currentMonth, fetchData]);

  function prevMonth() { setCurrentMonth((m) => subMonths(m, 1)); }
  function nextMonth() { setCurrentMonth((m) => addMonths(m, 1)); }
  function goToday() {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDay(today);
  }

  // Build the 6-week grid starting on Monday
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  function tasksForDay(day: Date) {
    return tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), day));
  }

  function eventsForDay(day: Date) {
    return events.filter((e) => isSameDay(new Date(e.startAt), day));
  }

  function handleSelectDay(day: Date) {
    setSelectedDay(day);
    // On mobile always open the panel as a sheet
    if (window.innerWidth < 1024) setPanelOpen(true);
  }

  function handleEventAdded(event: Event) {
    setEvents((prev) => [...prev, event]);
  }

  function handleEventDeleted(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  function handleTaskComplete(id: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === TaskStatus.DONE ? TaskStatus.PENDING : TaskStatus.DONE }
          : t
      )
    );
    // Fire-and-forget PATCH
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === TaskStatus.DONE ? TaskStatus.PENDING : TaskStatus.DONE;
    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Calendar column */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </h2>
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={goToday} className="h-8 text-xs px-3">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              Hoy
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth} aria-label="Mes anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth} aria-label="Mes siguiente">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);
              const selected = isSameDay(day, selectedDay);
              const dayTasks = tasksForDay(day);
              const dayEvents = eventsForDay(day);
              const hasItems = dayTasks.length > 0 || dayEvents.length > 0;
              const pendingTasks = dayTasks.filter((t) => t.status !== TaskStatus.DONE);

              return (
                <button
                  key={i}
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "relative flex flex-col items-center gap-1 py-2 px-1 min-h-[64px] md:min-h-[80px] border-b border-r transition-colors focus:outline-none",
                    "hover:bg-accent/50",
                    !inMonth && "opacity-30",
                    selected && "bg-primary/8 ring-1 ring-inset ring-primary/20",
                    today && !selected && "bg-primary/5",
                    // Remove right border on last column
                    (i + 1) % 7 === 0 && "border-r-0",
                    // Remove bottom border on last row
                    i >= days.length - 7 && "border-b-0"
                  )}
                >
                  {/* Day number */}
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors",
                      today && "bg-primary text-primary-foreground font-bold",
                      selected && !today && "bg-foreground text-background",
                      !today && !selected && inMonth && "text-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Indicators */}
                  {hasItems && (
                    <div className="flex items-center gap-0.5 flex-wrap justify-center max-w-full px-1">
                      {pendingTasks.slice(0, 3).map((t) => (
                        <span
                          key={t.id}
                          className={cn("h-1.5 w-1.5 rounded-full shrink-0", QUADRANT_DOT[t.quadrant])}
                        />
                      ))}
                      {dayEvents.slice(0, 2).map((e) => (
                        <span key={e.id} className="h-1.5 w-1.5 rounded-full shrink-0 bg-emerald-500" />
                      ))}
                      {pendingTasks.length + dayEvents.length > 4 && (
                        <span className="text-[9px] text-muted-foreground leading-none">+{pendingTasks.length + dayEvents.length - 4}</span>
                      )}
                    </div>
                  )}

                  {/* Event bars - desktop only */}
                  <div className="hidden md:flex w-full flex-col gap-0.5 px-1">
                    {dayEvents.slice(0, 2).map((e) => (
                      <div
                        key={e.id}
                        className="truncate rounded px-1 py-0.5 text-[10px] font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 leading-tight"
                      >
                        {e.title}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-[var(--q1)]" /> Q1 Urgente+Importante
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-[var(--q2)]" /> Q2 Planificar
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-[var(--q3)]" /> Q3 Delegar
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Evento
          </span>
        </div>
      </div>

      {/* Day detail — sidebar on desktop, sheet on mobile handled inside */}
      <div className="hidden lg:block w-80 shrink-0">
        <DayDetailPanel
          day={selectedDay}
          tasks={tasksForDay(selectedDay)}
          events={eventsForDay(selectedDay)}
          onEventAdded={handleEventAdded}
          onEventDeleted={handleEventDeleted}
          onTaskComplete={handleTaskComplete}
          asSheet={false}
          open={true}
          onClose={() => {}}
        />
      </div>

      {/* Mobile sheet */}
      <DayDetailPanel
        day={selectedDay}
        tasks={tasksForDay(selectedDay)}
        events={eventsForDay(selectedDay)}
        onEventAdded={handleEventAdded}
        onEventDeleted={handleEventDeleted}
        onTaskComplete={handleTaskComplete}
        asSheet={true}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  );
}
