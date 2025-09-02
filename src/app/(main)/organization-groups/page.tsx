
import { PageHeader } from "@/components/page-header";
import { OrganizationGroupManager } from "@/components/organization/organization-group-manager";

export default function OrganizationGroupsPage() {
  return (
    <>
      <PageHeader
        title="Organization Groups"
        description="Create and manage groups of distributors and retailers for easier targeting."
      />
      <OrganizationGroupManager />
    </>
  );
}
