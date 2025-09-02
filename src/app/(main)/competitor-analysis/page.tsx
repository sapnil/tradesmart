import { PageHeader } from "@/components/page-header";
import { CompetitorAnalyzer } from "@/components/ai/competitor-analyzer";

export default function AnomalyDetectorPage() {
  return (
    <>
      <PageHeader
        title="Competitor Promotion Analysis"
        description="Let AI analyze competitor offers and suggest counter-promotions."
      />
      <CompetitorAnalyzer />
    </>
  );
}
