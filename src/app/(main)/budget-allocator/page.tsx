import { PageHeader } from "@/components/page-header";
import { BudgetAllocator } from "@/components/ai/budget-allocator";

export default function BudgetAllocatorPage() {
  return (
    <>
      <PageHeader
        title="Smart Budget Allocator"
        description="Let AI recommend the best way to allocate your promotion budget."
      />
      <BudgetAllocator />
    </>
  );
}
