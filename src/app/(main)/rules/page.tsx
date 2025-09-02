import { PageHeader } from "@/components/page-header";
import { RuleSimulator } from "@/components/rules/rule-simulator";

export default function RulesPage() {
  return (
    <>
      <PageHeader
        title="Rule Engine Simulator"
        description="Simulate how the rule engine applies promotions to incoming orders."
      />
      <RuleSimulator />
    </>
  );
}
