"use client";
import { useSearchParams } from "next/navigation";

export default function JoinPageClient() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  return <div>Joining room: {code}</div>;
}
