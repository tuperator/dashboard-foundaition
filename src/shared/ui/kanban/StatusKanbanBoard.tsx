import { useEffect, useRef, type ReactNode } from "react";
import { Badge } from "@/shared/ui/badge";
import { Spinner } from "@/shared/ui/spinner";

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
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  loadMoreLabel?: string;
  loadingMoreLabel?: string;
};

export function StatusKanbanBoard<T>({
  columns,
  itemsByColumn,
  dragValue,
  onDragValueChange,
  onDropToColumn,
  getItemKey,
  renderCard,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  loadMoreLabel = "Scroll to load more",
  loadingMoreLabel = "Loading more items...",
}: StatusKanbanBoardProps<T>) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || isLoadingMore || !onLoadMore || !loadMoreRef.current) {
      return;
    }

    const target = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      {
        rootMargin: "240px 0px",
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

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
      {hasMore || isLoadingMore ? (
        <div
          ref={loadMoreRef}
          className="text-muted-foreground flex min-h-14 items-center justify-center gap-2 py-4 text-sm"
        >
          {isLoadingMore ? (
            <>
              <Spinner className="size-4" />
              {loadingMoreLabel}
            </>
          ) : (
            loadMoreLabel
          )}
        </div>
      ) : null}
    </div>
  );
}
