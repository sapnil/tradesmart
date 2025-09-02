import { PageHeader } from "@/components/page-header";
import { AnomalyDetector } from "@/components/ai/anomaly-detector";

export default function AnomalyDetectorPage() {
  return (
    <>
      <PageHeader
        title="Anomaly Detector"
        description="Use AI to scan recent orders for suspicious patterns and potential scheme misuse."
      />
      <AnomalyDetector />
    </>
  );
}
