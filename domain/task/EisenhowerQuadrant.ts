export enum EisenhowerQuadrant {
  Q1 = "Q1", // Urgente + Importante
  Q2 = "Q2", // No urgente + Importante
  Q3 = "Q3", // Urgente + No importante
  Q4 = "Q4", // No urgente + No importante
}

export const QUADRANT_LABELS: Record<EisenhowerQuadrant, { title: string; subtitle: string; color: string }> = {
  [EisenhowerQuadrant.Q1]: { title: "Hacer ahora", subtitle: "Urgente + Importante", color: "destructive" },
  [EisenhowerQuadrant.Q2]: { title: "Planificar", subtitle: "No urgente + Importante", color: "primary" },
  [EisenhowerQuadrant.Q3]: { title: "Delegar", subtitle: "Urgente + No importante", color: "warning" },
  [EisenhowerQuadrant.Q4]: { title: "Eliminar", subtitle: "No urgente + No importante", color: "muted" },
};
