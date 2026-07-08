import { LoadingSpinner } from "@/components";

export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full py-32">
      <LoadingSpinner />
    </div>
  );
}
