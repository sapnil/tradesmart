
import { PageHeader } from "@/components/page-header";
import { RuleBuilder } from "@/components/rules/rule-builder";

export default function RuleBuilderPage() {
  return (
    <>
      <PageHeader
        title="Dynamic Rule Builder"
        description="Create custom promotion rules by combining conditions and actions."
      />
      <RuleBuilder />
    </>
  );
}
