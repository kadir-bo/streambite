export default function StatusDot({ color }) {
  return (
    <span
      className="inline-block size-1.75 shrink-0 rounded-full"
      style={{ background: color }}
    />
  );
}
