"use client";

export default function VolumeSlider({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-2xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
