"use client";
import { useSearchParams } from "next/navigation";

export default function HostPageClient() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  return <div>Host view for room code: {code}</div>;
}
