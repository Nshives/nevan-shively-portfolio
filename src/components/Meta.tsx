import { isTodo } from "@/lib/schema";

// Inline value that turns todo-blue when it's still a [placeholder].
export function Val({ children }: { children: string }) {
  return <span className={isTodo(children) ? "text-todo" : undefined}>{children}</span>;
}

// Written text. A paragraph that's entirely in [brackets] is a known gap and
// renders as a dashed todo box. "\n\n" is a paragraph break.
export function Paragraphs({ text, className }: { text: string; className: string }) {
  return (
    <>
      {text.split(/\n\n+/).map((para, i) =>
        isTodo(para) ? (
          <p key={i} className="todo m-0">
            {para}
          </p>
        ) : (
          <p key={i} className={className}>
            {para}
          </p>
        ),
      )}
    </>
  );
}
