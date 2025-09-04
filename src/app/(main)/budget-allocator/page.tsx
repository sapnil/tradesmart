import { PageHeader } from "@/components/page-header";
import { BudgetAllocator } from "@/components/ai/budget-allocator";

export default function BudgetSimulatorPage() {
  return (
    <>
      <PageHeader
        title="Smart Budget Simulator"
        description="Let AI recommend the best way to allocate your promotion budget based on different strategies."
      />
      <BudgetAllocator />
    </>
  );
}
