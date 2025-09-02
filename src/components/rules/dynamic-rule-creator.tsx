
"use client";

import { useState } from "react";
import { RuleBuilder } from "@/components/rules/rule-builder";
import { type Rule } from "@/types/rules";

export function DynamicRuleCreator() {

    const [rule, setRule] = useState<Rule>({
        id: `RULE-${Date.now()}`,
        name: "New Dynamic Rule",
        description: "A custom promotion rule.",
        conditions: [],
        actions: [],
    });

    return (
        <div>
            <RuleBuilder rule={rule} onRuleChange={setRule} />
        </div>
    )
}
