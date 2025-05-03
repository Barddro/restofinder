import { Suspense } from "react";
import HostPageClient from "./HostPageClient";

export default function HostPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostPageClient />
    </Suspense>
  );
}
