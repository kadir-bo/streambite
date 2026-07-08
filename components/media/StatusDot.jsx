export default function StatusDot({ color, width, height }) {
  return (
    <span
      className="inline-block size-2 shrink-0 rounded-full absolute right-px bottom-px"
      style={{ background: color, width: width, height: height }}
    />
  );
}
