
import { PageHeader } from "@/components/page-header";
import { BudgetForm } from "@/components/budgets/budget-form";

export default function CreateBudgetPage() {
  return (
    <>
      <PageHeader
        title="Create New Budget"
        description="Fill out the form below to create a new budget."
      />
      <BudgetForm />
    </>
  );
}
