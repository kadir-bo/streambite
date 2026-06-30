"use client";
import { parseMarkdown } from "@/lib";

export default function MarkdownText({ content }) {
  const tokens = parseMarkdown(content ?? "");
  return (
    <>
      {tokens.map((token, i) => {
        switch (token.type) {
          case "bold":
            return (
              <strong key={i} className="text-(--text-primary)">
                {token.content}
              </strong>
            );
          case "italic":
            return <em key={i}>{token.content}</em>;
          case "code":
            return (
              <code
                key={i}
                className="font-mono text-xs bg-(--surface-overlay) rounded-sm px-1.25 py-px"
              >
                {token.content}
              </code>
            );
          case "strike":
            return <s key={i}>{token.content}</s>;
          case "mention":
            return (
              <span
                key={i}
                className="bg-[rgba(255,255,255,0.08)] rounded-sm px-1 text-(--text-primary) font-medium"
              >
                @{token.content}
              </span>
            );
          default:
            return <span key={i}>{token.content}</span>;
        }
      })}
    </>
  );
}
