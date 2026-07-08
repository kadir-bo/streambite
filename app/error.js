"use client";

import { ErrorFallback } from "@/components";

export default function Error({ error, reset }) {
  return <ErrorFallback error={error} reset={reset} size="sm" />;
}
