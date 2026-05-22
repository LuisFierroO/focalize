"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Event } from "@/domain/event/Event";
import { format } from "date-fns";
import { toast } from "sonner";

interface EventSheetProps {
  open: boolean;
  onClose: () => void;
  defaultDate?: Date;
  onSaved: (event: Event) => void;
}

export function EventSheet({ open, onClose, defaultDate, onSaved }: EventSheetProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [allDay, setAllDay] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("10:00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setAllDay(true);
      const base = defaultDate ?? new Date();
      setStartDate(format(base, "yyyy-MM-dd"));
      setEndDate(format(base, "yyyy-MM-dd"));
      setStartTime("09:00");
      setEndTime("10:00");
    }
  }, [open, defaultDate]);

  async function handleSave() {
    if (!title.trim() || !startDate) return;
    setSaving(true);
    try {
      const startAt = allDay
        ? new Date(`${startDate}T00:00:00`).toISOString()
        : new Date(`${startDate}T${startTime}:00`).toISOString();

      const endAt = endDate
        ? (allDay
          ? new Date(`${endDate}T23:59:59`).toISOString()
          : new Date(`${endDate}T${endTime}:00`).toISOString())
        : undefined;

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined, startAt, endAt, allDay }),
      });

      if (!res.ok) throw new Error();
      const event = await res.json();
      onSaved(event);
      toast.success("Evento creado");
      onClose();
    } catch {
      toast.error("Error al crear el evento");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0 overflow-y-auto">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle>Nuevo evento</SheetTitle>
        </SheetHeader>

        <div className="flex-1 px-6 space-y-5 pb-6">
          <div className="space-y-1.5">
            <Label htmlFor="ev-title">Título <span className="text-destructive">*</span></Label>
            <Input
              id="ev-title"
              placeholder="¿Qué evento es?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="allday"
              checked={allDay}
              onCheckedChange={(v) => setAllDay(!!v)}
            />
            <Label htmlFor="allday" className="cursor-pointer">Todo el día</Label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-date">Fecha inicio <span className="text-destructive">*</span></Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10" />
            </div>
            {!allDay && (
              <div className="space-y-1.5">
                <Label htmlFor="start-time">Hora inicio</Label>
                <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-10" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="end-date">Fecha fin <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-10" />
            </div>
            {!allDay && (
              <div className="space-y-1.5">
                <Label htmlFor="end-time">Hora fin</Label>
                <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-10" />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-desc">Descripción <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Textarea
              id="ev-desc"
              placeholder="Notas sobre el evento..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!title.trim() || !startDate || saving}>
            {saving ? "Guardando..." : "Crear evento"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
