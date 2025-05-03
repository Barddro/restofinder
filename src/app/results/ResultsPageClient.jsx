"use client";
import { useSearchParams } from "next/navigation";

export default function ResultsPageClient() {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get("room");

  return <div>Viewing results for room: {roomCode}</div>;
}
