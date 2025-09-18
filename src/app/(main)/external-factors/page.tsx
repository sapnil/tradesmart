
import { PageHeader } from "@/components/page-header";
import { ExternalFactorsManager } from "@/components/setup/external-factors-manager";

export default function ExternalFactorsPage() {
  return (
    <>
      <PageHeader
        title="External Factors"
        description="Manage master data for seasonality, competitor activities, and other market events."
      />
      <ExternalFactorsManager />
    </>
  );
}
