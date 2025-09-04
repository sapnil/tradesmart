
import { PageHeader } from "@/components/page-header";
import { BudgetManager } from "@/components/budgets/budget-manager";

export default function BudgetsPage() {
  return (
    <>
      <PageHeader
        title="Manage Budgets"
        description="Create, allocate, and track your trade promotion budgets."
      />
      <BudgetManager />
    </>
  );
}
