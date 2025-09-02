
import { PageHeader } from "@/components/page-header";
import { DynamicRuleSimulator } from "@/components/rules/dynamic-rule-simulator";

export default function DynamicRuleSimulatorPage() {
  return (
    <>
      <PageHeader
        title="Dynamic Rule Simulator"
        description="Test and validate your dynamically created promotion rules against sample orders."
      />
      <DynamicRuleSimulator />
    </>
  );
}
