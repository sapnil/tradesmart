import { PageHeader } from "@/components/page-header";
import { InsightsGenerator } from "@/components/ai/insights-generator";

export default function InsightsPage() {
  return (
    <>
      <PageHeader
        title="Promotion Insights"
        description="Leverage AI to analyze data and get promotion recommendations."
      />
      <InsightsGenerator />
    </>
  );
}
