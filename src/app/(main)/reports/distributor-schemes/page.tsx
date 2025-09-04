
import { PageHeader } from "@/components/page-header";
import { DistributorSchemeReport } from "@/components/reports/distributor-scheme-report";

export default function DistributorSchemeReportPage() {
  return (
    <>
      <PageHeader
        title="Distributor Scheme Report"
        description="View all promotion schemes targeted at a specific distributor."
      />
      <DistributorSchemeReport />
    </>
  );
}
