import { twMerge } from "tailwind-merge";

export default function StatusDot({ color, relative, size = "size-2" }) {
  return (
    <span
      className={twMerge(
        "rounded-full shrink-0",
        relative ? "" : "absolute bottom-0 right-0",
        size,
      )}
      style={{ backgroundColor: color }}
    />
  );
}
