"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/task/TaskCard";
import { TaskSheet } from "@/components/task/TaskSheet";
import { EisenhowerQuadrant, QUADRANT_LABELS } from "@/domain/task/EisenhowerQuadrant";
import { Task, TaskStatus } from "@/domain/task/Task";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const QUADRANT_STYLES: Record<EisenhowerQuadrant, { border: string; dot: string; header: string }> = {
  [EisenhowerQuadrant.Q1]: { border: "border-[var(--q1)]/40", dot: "bg-[var(--q1)]", header: "text-[var(--q1)]" },
  [EisenhowerQuadrant.Q2]: { border: "border-[var(--q2)]/40", dot: "bg-[var(--q2)]", header: "text-[var(--q2)]" },
  [EisenhowerQuadrant.Q3]: { border: "border-[var(--q3)]/40", dot: "bg-[var(--q3)]", header: "text-[var(--q3)]" },
  [EisenhowerQuadrant.Q4]: { border: "border-[var(--q4)]/40", dot: "bg-[var(--q4)]", header: "text-[var(--q4)]" },
};

export function EisenhowerBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeQuadrant, setActiveQuadrant] = useState<EisenhowerQuadrant>(EisenhowerQuadrant.Q1);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTasks(data);
    } catch {
      toast.error("No se pudieron cargar las tareas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  function openCreate(quadrant: EisenhowerQuadrant) {
    setEditingTask(null);
    setActiveQuadrant(quadrant);
    setSheetOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setActiveQuadrant(task.quadrant);
    setSheetOpen(true);
  }

  function handleSaved(saved: Task) {
    setTasks((prev) => {
      const exists = prev.find((t) => t.id === saved.id);
      if (exists) return prev.map((t) => (t.id === saved.id ? saved : t));
      return [...prev, saved];
    });
    toast.success(editingTask ? "Tarea actualizada" : "Tarea creada");
  }

  function handleDeleted(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success("Tarea eliminada");
  }

  async function handleComplete(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === TaskStatus.DONE ? TaskStatus.PENDING : TaskStatus.DONE;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: task.status } : t)));
      toast.error("Error al actualizar la tarea");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Cargando tareas...</span>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Object.values(EisenhowerQuadrant).map((q) => {
          const { title, subtitle } = QUADRANT_LABELS[q];
          const styles = QUADRANT_STYLES[q];
          const quadrantTasks = tasks.filter((t) => t.quadrant === q);
          const pending = quadrantTasks.filter((t) => t.status !== TaskStatus.DONE);
          const done = quadrantTasks.filter((t) => t.status === TaskStatus.DONE);

          return (
            <div
              key={q}
              className={cn("flex flex-col rounded-xl border-2 bg-card transition-colors", styles.border)}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", styles.dot)} />
                  <div>
                    <p className={cn("text-sm font-semibold leading-tight", styles.header)}>{title}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight">{subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {quadrantTasks.length > 0 && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {pending.length} pendiente{pending.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => openCreate(q)}
                    aria-label={`Agregar tarea a ${title}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tasks */}
              <div className="flex-1 px-3 pb-3 space-y-2 min-h-[80px]">
                {pending.length === 0 && done.length === 0 ? (
                  <button
                    onClick={() => openCreate(q)}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-4 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar tarea
                  </button>
                ) : (
                  <>
                    {pending.map((task) => (
                      <TaskCard key={task.id} task={task} onComplete={handleComplete} onClick={openEdit} />
                    ))}
                    {done.length > 0 && (
                      <details className="group">
                        <summary className="cursor-pointer text-[11px] text-muted-foreground py-1 select-none list-none flex items-center gap-1">
                          <span className="group-open:rotate-90 transition-transform inline-block">›</span>
                          {done.length} completada{done.length !== 1 ? "s" : ""}
                        </summary>
                        <div className="mt-1 space-y-2">
                          {done.map((task) => (
                            <TaskCard key={task.id} task={task} onComplete={handleComplete} onClick={openEdit} />
                          ))}
                        </div>
                      </details>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setEditingTask(null); }}
        quadrant={activeQuadrant}
        task={editingTask}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </>
  );
}
