
import { PageHeader } from "@/components/page-header";
import { PromotionPerformanceReport } from "@/components/reports/promotion-performance-report";

export default function PromotionPerformanceReportPage() {
  return (
    <>
      <PageHeader
        title="Promotion Performance Report"
        description="Analyze the effectiveness and ROI of your trade promotions."
      />
      <PromotionPerformanceReport />
    </>
  );
}
