"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, ChevronRight, ListChecks } from "lucide-react";
import { Task, TaskStatus } from "@/domain/task/Task";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, onComplete, onClick }: TaskCardProps) {
  const done = task.status === TaskStatus.DONE;
  const subItems = task.subItems ?? [];
  const doneCount = subItems.filter((s) => s.done).length;
  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDateObj && !done && isPast(dueDateObj) && !isToday(dueDateObj);

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border bg-background p-3 transition-all hover:shadow-sm cursor-pointer",
        done && "opacity-50"
      )}
      onClick={() => onClick(task)}
    >
      <div className="mt-0.5" onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}>
        <Checkbox
          checked={done}
          className="h-4 w-4"
          aria-label="Completar tarea"
        />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <p className={cn("text-sm font-medium leading-snug", done && "line-through text-muted-foreground")}>
          {task.title}
        </p>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {dueDateObj && (
            <span className={cn("flex items-center gap-1 text-[11px]", isOverdue ? "text-destructive font-medium" : "text-muted-foreground")}>
              <Calendar className="h-3 w-3" />
              {isToday(dueDateObj) ? "Hoy" : format(dueDateObj, "d MMM", { locale: es })}
            </span>
          )}
          {subItems.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <ListChecks className="h-3 w-3" />
              {doneCount}/{subItems.length}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 mt-0.5 shrink-0 group-hover:text-muted-foreground transition-colors" />
    </div>
  );
}
