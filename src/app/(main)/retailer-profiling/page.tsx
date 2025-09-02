import { PageHeader } from "@/components/page-header";
import { RetailerProfiler } from "@/components/reports/retailer-profiler";

export default function RetailerProfilingPage() {
  return (
    <>
      <PageHeader
        title="AI Retailer Profiling"
        description="Identify high-potential and low-response outlets using AI analysis."
      />
      <RetailerProfiler />
    </>
  );
}
