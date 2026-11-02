import { isTodo } from "@/lib/schema";

// Inline value that turns todo-blue when it's still a [PLACEHOLDER].
export function Val({ children }: { children: string }) {
  return <span className={isTodo(children) ? "text-todo" : undefined}>{children}</span>;
}

// "2026 · Game dev · Built solo" style meta line.
export function metaLine(parts: (string | undefined | false)[]) {
  return parts.filter(Boolean).join(" · ");
}
