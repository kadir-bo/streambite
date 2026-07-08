import { twMerge } from "tailwind-merge";

export default function StatusDot({ color, relative }) {
  return (
    <span
      className={twMerge(
        "size-2 rounded-full shrink-0",
        relative ? "" : "absolute bottom-0 right-0",
      )}
      style={{ backgroundColor: color }}
    />
  );
}
