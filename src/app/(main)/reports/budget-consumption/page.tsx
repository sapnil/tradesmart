
import { PageHeader } from "@/components/page-header";
import { BudgetConsumptionReport } from "@/components/reports/budget-consumption-report";

export default function BudgetConsumptionReportPage() {
  return (
    <>
      <PageHeader
        title="Budget Consumption Report"
        description="Analyze budget utilization across different campaigns and periods."
      />
      <BudgetConsumptionReport />
    </>
  );
}
