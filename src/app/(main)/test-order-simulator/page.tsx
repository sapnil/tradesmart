import { PageHeader } from "@/components/page-header";
import { TestOrderSimulator } from "@/components/rules/test-order-simulator";

export default function TestOrderSimulatorPage() {
  return (
    <>
      <PageHeader
        title="Test Order Simulator"
        description="Build a test order and simulate which promotions would apply to it."
      />
      <TestOrderSimulator />
    </>
  );
}
