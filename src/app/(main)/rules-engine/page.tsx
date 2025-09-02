import { PageHeader } from "@/components/page-header";
import { DynamicRuleCreator } from "@/components/rules/dynamic-rule-creator";

export default function RulesEnginePage() {
  return (
    <>
      <PageHeader
        title="Dynamic Rule Engine"
        description="Create custom promotion rules using a flexible condition/action builder."
      />
      <DynamicRuleCreator />
    </>
  );
}
