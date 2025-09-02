import { PageHeader } from "@/components/page-header";
import { PromotionSimulator } from "@/components/rules/promotion-simulator";

export default function RulesPage() {
  return (
    <>
      <PageHeader
        title="Promotion Simulator"
        description="Simulate the impact of a promotion in a specific region or area based on historical data."
      />
      <PromotionSimulator />
    </>
  );
}
