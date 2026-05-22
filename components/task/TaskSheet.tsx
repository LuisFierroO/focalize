"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Calendar, X } from "lucide-react";
import { EisenhowerQuadrant, QUADRANT_LABELS } from "@/domain/task/EisenhowerQuadrant";
import { Task, SubItem, TaskStatus } from "@/domain/task/Task";
import { cn } from "@/lib/utils";

interface TaskSheetProps {
  open: boolean;
  onClose: () => void;
  quadrant?: EisenhowerQuadrant;
  task?: Task | null;
  onSaved: (task: Task) => void;
  onDeleted?: (id: string) => void;
}

const QUADRANT_OPTIONS = Object.values(EisenhowerQuadrant);

export function TaskSheet({ open, onClose, quadrant, task, onSaved, onDeleted }: TaskSheetProps) {
  const isEditing = !!task;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedQuadrant, setSelectedQuadrant] = useState<EisenhowerQuadrant>(quadrant ?? EisenhowerQuadrant.Q1);
  const [dueDate, setDueDate] = useState("");
  const [subItems, setSubItems] = useState<SubItem[]>([]);
  const [newSubItem, setNewSubItem] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setSelectedQuadrant(task.quadrant);
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
      setSubItems(task.subItems ?? []);
    } else {
      setTitle("");
      setDescription("");
      setSelectedQuadrant(quadrant ?? EisenhowerQuadrant.Q1);
      setDueDate("");
      setSubItems([]);
    }
    setNewSubItem("");
  }, [task, quadrant, open]);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim() || undefined,
        quadrant: selectedQuadrant,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      };

      const res = await fetch(isEditing ? `/api/tasks/${task!.id}` : "/api/tasks", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al guardar");
      const saved = await res.json();
      onSaved({ ...saved, subItems: isEditing ? subItems : [] });
      if (!isEditing) onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!task) return;
    setDeleting(true);
    try {
      await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      onDeleted?.(task.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  async function handleAddSubItem() {
    if (!newSubItem.trim() || !task) return;
    const res = await fetch(`/api/tasks/${task.id}/subitems`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newSubItem.trim() }),
    });
    if (res.ok) {
      const item = await res.json();
      setSubItems((prev) => [...prev, item]);
      setNewSubItem("");
    }
  }

  async function handleToggleSubItem(id: string, done: boolean) {
    if (!task) return;
    await fetch(`/api/tasks/${task.id}/subitems/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    setSubItems((prev) => prev.map((s) => (s.id === id ? { ...s, done } : s)));
  }

  async function handleDeleteSubItem(id: string) {
    if (!task) return;
    await fetch(`/api/tasks/${task.id}/subitems/${id}`, { method: "DELETE" });
    setSubItems((prev) => prev.filter((s) => s.id !== id));
  }

  const donePct = subItems.length > 0 ? Math.round((subItems.filter((s) => s.done).length / subItems.length) * 100) : 0;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="text-lg">{isEditing ? "Editar tarea" : "Nueva tarea"}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 px-6 space-y-5 pb-6">
          {/* Título */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Título <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              placeholder="¿Qué necesitas hacer?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && !isEditing && handleSave()}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="desc">Descripción <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Textarea
              id="desc"
              placeholder="Detalles, contexto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Cuadrante */}
          <div className="space-y-2">
            <Label>Cuadrante</Label>
            <div className="grid grid-cols-2 gap-2">
              {QUADRANT_OPTIONS.map((q) => {
                const { title: qTitle, subtitle } = QUADRANT_LABELS[q];
                const active = selectedQuadrant === q;
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setSelectedQuadrant(q)}
                    className={cn(
                      "flex flex-col items-start rounded-lg border-2 p-3 text-left transition-all",
                      active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    )}
                  >
                    <span className="text-xs font-semibold">{q}</span>
                    <span className="text-xs font-medium leading-tight">{qTitle}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">{subtitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fecha límite */}
          <div className="space-y-1.5">
            <Label htmlFor="due" className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Fecha límite <span className="text-muted-foreground text-xs">(opcional)</span>
            </Label>
            <Input
              id="due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Sublista — solo en modo edición */}
          {isEditing && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Lista de actividades</Label>
                  {subItems.length > 0 && (
                    <span className="text-xs text-muted-foreground">{donePct}% completado</span>
                  )}
                </div>

                {subItems.length > 0 && (
                  <div className="space-y-2">
                    {subItems.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 group">
                        <Checkbox
                          checked={s.done}
                          onCheckedChange={(v) => handleToggleSubItem(s.id, !!v)}
                          id={`sub-${s.id}`}
                        />
                        <label
                          htmlFor={`sub-${s.id}`}
                          className={cn("flex-1 text-sm cursor-pointer", s.done && "line-through text-muted-foreground")}
                        >
                          {s.title}
                        </label>
                        <button
                          onClick={() => handleDeleteSubItem(s.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                          aria-label="Eliminar"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar actividad..."
                    value={newSubItem}
                    onChange={(e) => setNewSubItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSubItem()}
                    className="h-9 text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={handleAddSubItem} disabled={!newSubItem.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Acciones */}
        <div className="border-t px-6 py-4 flex items-center gap-2">
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!title.trim() || saving}>
            {saving ? "Guardando..." : isEditing ? "Guardar" : "Crear tarea"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
