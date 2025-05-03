import { Suspense } from "react";
import JoinPageClient from "./JoinPageClient";

export default function JoinPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinPageClient />
    </Suspense>
  );
}
