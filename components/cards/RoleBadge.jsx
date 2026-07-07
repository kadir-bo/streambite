export default function RoleBadge({ roles }) {
  if (roles?.includes("owner")) {
    return (
      <span className="text-2xs font-semibold uppercase tracking-wide text-accent shrink-0">
        Owner
      </span>
    );
  }
  if (roles?.includes("admin")) {
    return (
      <span className="text-2xs font-semibold uppercase tracking-wide text-zinc-500 shrink-0">
        Admin
      </span>
    );
  }
  return null;
}
