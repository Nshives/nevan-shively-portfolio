import { MDXRemote } from "next-mdx-remote/rsc";
import { Children, isValidElement } from "react";

// Paragraphs written entirely in [brackets] are prompts still waiting on Nevan,
// so they render as dashed "todo" boxes and stay visibly unfinished.
function P({ children }: { children?: React.ReactNode }) {
  const text = Children.toArray(children)
    .map((c) => (typeof c === "string" ? c : isValidElement(c) ? "\u0000" : ""))
    .join("")
    .trim();
  if (/^\[[^\u0000]*\]$/.test(text)) return <p className="todo">{children}</p>;
  return <p>{children}</p>;
}

function Todo({ children }: { children?: React.ReactNode }) {
  return <p className="todo">{children}</p>;
}

const components = { p: P, Todo };

export function Mdx({ source }: { source: string }) {
  return <MDXRemote source={source} components={components} />;
}
