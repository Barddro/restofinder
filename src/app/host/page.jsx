import { Suspense } from "react";
import dynamic from "next/dynamic";

const HostPageClient = dynamic(() => import("./HostPageClient"), { ssr: false });

export default function HostPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostPageClient />
    </Suspense>
  );
}
