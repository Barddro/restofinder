import { Suspense } from "react";
import ResultsPageClient from "./ResultsPageClient";

export default function ResultsPageWrapper() {
  return (
    <Suspense fallback={<div>Loading results...</div>}>
      <ResultsPageClient />
    </Suspense>
  );
}
