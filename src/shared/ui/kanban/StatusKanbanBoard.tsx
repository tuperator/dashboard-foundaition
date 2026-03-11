import type { ReactNode } from "react";
import { Badge } from "@/shared/ui/badge";

type KanbanColumn = {
  id: string;
  label: string;
  color?: string;
};

type StatusKanbanBoardProps<T> = {
  columns: KanbanColumn[];
  itemsByColumn: Map<string, T[]>;
  dragValue: string | null;
  onDragValueChange: (value: string | null) => void;
  onDropToColumn: (dragValue: string, columnId: string) => void;
  getItemKey: (item: T) => string;
  renderCard: (item: T) => ReactNode;
};

export function StatusKanbanBoard<T>({
  columns,
  itemsByColumn,
  dragValue,
  onDragValueChange,
  onDropToColumn,
  getItemKey,
  renderCard,
}: StatusKanbanBoardProps<T>) {
  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[760px] gap-3"
        style={{
          gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(220px, 1fr))`,
        }}
      >
        {columns.map((column) => (
          <section
            key={column.id}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (!dragValue) {
                return;
              }

              onDropToColumn(dragValue, column.id);
              onDragValueChange(null);
            }}
            className="bg-muted/15 min-h-[360px] rounded-xl border p-2.5"
          >
            <header className="mb-2 flex items-center justify-between">
              <Badge
                className="h-6 rounded-full border border-transparent px-2 text-[11px]"
                style={{
                  backgroundColor: `${column.color || "#6B7280"}20`,
                  color: column.color || "currentColor",
                }}
              >
                {column.label}
              </Badge>
              <span className="text-muted-foreground text-xs">
                {itemsByColumn.get(column.id)?.length || 0}
              </span>
            </header>
            <div className="space-y-2">
              {(itemsByColumn.get(column.id) || []).map((item) => (
                <article
                  key={getItemKey(item)}
                  draggable
                  onDragStart={() => onDragValueChange(getItemKey(item))}
                  onDragEnd={() => onDragValueChange(null)}
                  className="bg-card cursor-grab rounded-lg border p-2.5 active:cursor-grabbing"
                >
                  {renderCard(item)}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
