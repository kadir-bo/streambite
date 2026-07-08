import { twMerge } from "tailwind-merge";

export default function StatusDot({ color, width, height, relative = false }) {
  return (
    <span
      className={twMerge(
        "inline-block size-2 shrink-0 rounded-full",
        relative ? "" : "absolute right-px bottom-px",
      )}
      style={{ background: color, width: width, height: height }}
    />
  );
}
